import type { IGenerateDirectInput } from "../../domain/interface/generate/direct-input.interface.js";
import type { TGenerateInput } from "../../domain/interface/generate/input.interface.js";
import type { IGenerateProfileInput } from "../../domain/interface/generate/profile-input.interface.js";
import type { IGenerateResult } from "../../domain/interface/generate/result.interface.js";
import type { IGenerateStreamChunk } from "../../domain/interface/generate/stream-chunk.interface.js";
import type { ILlmMessage } from "../../domain/interface/llm/message.interface.js";
import type { IResolvedModuleProfile } from "../../domain/interface/resolved-module-profile.interface.js";
import type { ILlmService } from "../interface/llm-service.interface.js";

import type { EnsureProfileUseCase } from "./ensure-profile.use-case.js";

import { MIN_RETRY_COUNT } from "../../domain/constant/numeric.constant.js";
import { PROVIDER_DEFAULT_MODEL_MAP } from "../../domain/constant/provider/default-model.constant.js";
import { LlmConfiguration } from "../../domain/entity/llm-configuration.entity.js";
import { EGenerateMode } from "../../domain/enum/generate-mode.enum.js";
import { ELLMMessageRole } from "../../domain/enum/llm-message-role.enum.js";
import { Credential as CredentialValue } from "../../domain/value-object/credential.value-object.js";

/**
 * Generic generation use case routed by provider.
 */
export class GenerateTextUseCase {
	private readonly ENSURE_PROFILE_USE_CASE: EnsureProfileUseCase;

	private readonly LLM_SERVICES: Array<ILlmService>;

	constructor(llmServices: Array<ILlmService>, ensureProfileUseCase: EnsureProfileUseCase) {
		this.LLM_SERVICES = llmServices;
		this.ENSURE_PROFILE_USE_CASE = ensureProfileUseCase;
	}

	async execute(input: TGenerateInput): Promise<IGenerateResult> {
		const context: { configuration: LlmConfiguration; model: string } = await this.resolveGenerationContext(input);
		const providerService: ILlmService = this.resolveProviderService(context.configuration.getProvider());
		const normalizedMessages: Array<ILlmMessage> = this.normalizeMessages(input);
		const retryCount: number = context.configuration.getRetries();

		this.ensureValidRetryCount(retryCount);

		let lastError: unknown;

		for (let attempt: number = MIN_RETRY_COUNT; attempt <= retryCount; attempt++) {
			try {
				const text: string = await providerService.generate(normalizedMessages, context.configuration);

				if (text.trim().length === 0) {
					throw new Error("Provider returned empty text");
				}

				return {
					attempts: attempt,
					model: context.model,
					provider: context.configuration.getProvider(),
					text,
				};
			} catch (error) {
				lastError = error;
			}
		}

		throw new Error(`Generation failed after ${String(retryCount)} retries: ${this.getErrorMessage(lastError)}`);
	}

	async *executeStream(input: TGenerateInput): AsyncGenerator<IGenerateStreamChunk> {
		const context: { configuration: LlmConfiguration; model: string } = await this.resolveGenerationContext(input);
		const providerService: ILlmService = this.resolveProviderService(context.configuration.getProvider());
		const normalizedMessages: Array<ILlmMessage> = this.normalizeMessages(input);
		const retryCount: number = context.configuration.getRetries();

		this.ensureValidRetryCount(retryCount);

		let lastError: unknown;

		for (let attempt: number = MIN_RETRY_COUNT; attempt <= retryCount; attempt++) {
			let hasEmittedAnyChunk: boolean = false;

			try {
				if (providerService.generateStream) {
					let aggregatedText: string = "";

					for await (const delta of providerService.generateStream(normalizedMessages, context.configuration)) {
						if (delta.length === 0) {
							continue;
						}

						hasEmittedAnyChunk = true;
						aggregatedText += delta;

						yield {
							attempt,
							delta,
							model: context.model,
							provider: context.configuration.getProvider(),
							text: aggregatedText,
						};
					}

					if (aggregatedText.trim().length === 0) {
						throw new Error("Provider returned empty text");
					}

					return;
				}

				const text: string = await providerService.generate(normalizedMessages, context.configuration);

				if (text.trim().length === 0) {
					throw new Error("Provider returned empty text");
				}

				yield {
					attempt,
					delta: text,
					model: context.model,
					provider: context.configuration.getProvider(),
					text,
				};

				return;
			} catch (error) {
				if (hasEmittedAnyChunk) {
					throw new Error(`Generation stream failed after partial output on attempt ${String(attempt)}: ${this.getErrorMessage(error)}`);
				}

				lastError = error;
			}
		}

		throw new Error(`Generation stream failed after ${String(retryCount)} retries: ${this.getErrorMessage(lastError)}`);
	}

	private ensureValidRetryCount(retryCount: number): void {
		if (retryCount < MIN_RETRY_COUNT) {
			throw new Error(`Invalid retries value '${String(retryCount)}'. Retries must be at least ${String(MIN_RETRY_COUNT)}.`);
		}
	}

	private getErrorMessage(error: unknown): string {
		if (error === null || error === undefined) {
			return "Unknown error";
		}

		if (error instanceof Error) {
			return error.message;
		}

		if (typeof error === "string") {
			return error;
		}

		try {
			return JSON.stringify(error);
		} catch {
			return "Unknown error";
		}
	}

	private normalizeMessages(input: TGenerateInput): Array<ILlmMessage> {
		const messages: Array<ILlmMessage> = input.messages ?? [];

		if (messages.length > 0) {
			return messages;
		}

		if (input.prompt?.trim()) {
			return [{ content: input.prompt, role: ELLMMessageRole.USER }];
		}

		throw new Error("Either 'messages' or 'prompt' must be provided");
	}

	private resolveDirectGenerationContext(input: IGenerateDirectInput): { configuration: LlmConfiguration; model: string } {
		if (!input.provider) {
			throw new Error("Field 'provider' is required for direct mode");
		}

		if (!input.credential || input.credential.trim().length === 0) {
			throw new Error("Field 'credential' is required for direct mode");
		}

		const model: string = input.model ?? PROVIDER_DEFAULT_MODEL_MAP[input.provider];

		if (!model) {
			throw new Error(`No default model configured for provider '${input.provider}'`);
		}

		return {
			configuration: new LlmConfiguration(input.provider, new CredentialValue(input.credential), model, input.maxTokens, input.temperature, input.retries, input.validationRetries),
			model,
		};
	}

	private async resolveGenerationContext(input: TGenerateInput): Promise<{ configuration: LlmConfiguration; model: string }> {
		switch (input.mode) {
			case EGenerateMode.DIRECT: {
				return this.resolveDirectGenerationContext(input);
			}

			case EGenerateMode.PROFILE: {
				return this.resolveProfileGenerationContext(input);
			}

			default: {
				const exhaustiveInput: never = input;

				throw new Error(`Unsupported generation mode '${String(exhaustiveInput)}'`);
			}
		}
	}

	private async resolveProfileGenerationContext(input: IGenerateProfileInput): Promise<{ configuration: LlmConfiguration; model: string }> {
		if (!input.moduleId || input.moduleId.trim().length === 0) {
			throw new Error("Field 'moduleId' is required for profile mode");
		}

		const profile: IResolvedModuleProfile = await this.ENSURE_PROFILE_USE_CASE.execute(input.moduleId);

		const model: string = input.model ?? profile.model;

		return {
			configuration: new LlmConfiguration(profile.provider, input.credential ? new CredentialValue(input.credential) : profile.credential, model, input.maxTokens ?? profile.maxTokens, input.temperature ?? profile.temperature, input.retries ?? profile.retries, input.validationRetries ?? profile.validationRetries),
			model,
		};
	}

	private resolveProviderService(providerName: string): ILlmService {
		const providerService: ILlmService | undefined = this.LLM_SERVICES.find((service: ILlmService): boolean => service.getName() === providerName);

		if (!providerService) {
			throw new Error(`No LLM service registered for provider '${providerName}'`);
		}

		return providerService;
	}
}
