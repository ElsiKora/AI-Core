import type { IInteractiveShellService } from "@application/interface/interactive-shell-service.interface";
import type { ILlmService } from "@application/interface/llm-service.interface";
import type { EnsureProfileUseCase } from "@application/use-case/ensure-profile.use-case";
import type { PromptCredentialUseCase } from "@application/use-case/prompt-credential.use-case";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { IGenerateDirectInput } from "@domain/interface/generate/direct-input.interface";
import type { TGenerateInput } from "@domain/interface/generate/input.interface";
import type { IGenerateProfileInput } from "@domain/interface/generate/profile-input.interface";
import type { IGenerateResult } from "@domain/interface/generate/result.interface";
import type { IGenerateStreamChunk } from "@domain/interface/generate/stream-chunk.interface";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";
import type { IResolvedModuleProfile } from "@domain/interface/resolved-module-profile.interface";

import { NUMERIC_CONSTANT } from "@domain/constant/numeric.constant";
import { PROVIDER_DEFAULT_MODEL_CONSTANT } from "@domain/constant/provider/default-model.constant";
import { LlmConfiguration } from "@domain/entity/llm-configuration.entity";
import { EGenerateMode } from "@domain/enum/generate-mode.enum";
import { ELLMMessageRole } from "@domain/enum/llm-message-role.enum";
import { Credential as CredentialValue } from "@domain/value-object/credential.value-object";

/**
 * Generic generation use case routed by provider.
 */
export class GenerateTextUseCase {
	private readonly ENSURE_PROFILE_USE_CASE: EnsureProfileUseCase;

	private readonly INTERACTIVE_SHELL_SERVICE: IInteractiveShellService;

	private readonly LLM_SERVICES: Array<ILlmService>;

	private readonly PROMPT_CREDENTIAL_USE_CASE: PromptCredentialUseCase;

	constructor(llmServices: Array<ILlmService>, ensureProfileUseCase: EnsureProfileUseCase, promptCredentialUseCase: PromptCredentialUseCase, interactiveShellService: IInteractiveShellService) {
		this.LLM_SERVICES = llmServices;
		this.ENSURE_PROFILE_USE_CASE = ensureProfileUseCase;
		this.PROMPT_CREDENTIAL_USE_CASE = promptCredentialUseCase;
		this.INTERACTIVE_SHELL_SERVICE = interactiveShellService;
	}

	async execute(input: TGenerateInput): Promise<IGenerateResult> {
		const context: { configuration: LlmConfiguration; model: string } = await this.resolveGenerationContext(input);
		const providerService: ILlmService = this.resolveProviderService(context.configuration.getProvider());
		const normalizedMessages: Array<ILlmMessage> = this.normalizeMessages(input);
		const retryCount: number = context.configuration.getRetries();
		let configuration: LlmConfiguration = context.configuration;
		let credentialRepromptCount: number = 0;

		this.ensureValidRetryCount(retryCount);
		this.ensureValidTimeout(context.configuration);

		let lastError: unknown;
		let attempt: number = NUMERIC_CONSTANT.MIN_RETRY_COUNT;

		while (attempt <= retryCount + credentialRepromptCount) {
			try {
				const text: string = await this.withGenerationTimeout(providerService.generate(normalizedMessages, configuration), configuration);

				if (text.trim().length === 0) {
					throw new Error("Provider returned empty text");
				}

				return {
					attempts: attempt,
					model: context.model,
					provider: configuration.getProvider(),
					text,
				};
			} catch (error) {
				lastError = error;

				const repromptedConfiguration: LlmConfiguration | undefined = await this.resolveRepromptedConfiguration(error, providerService, configuration, credentialRepromptCount);

				if (repromptedConfiguration) {
					configuration = repromptedConfiguration;
					credentialRepromptCount++;
				}

				attempt++;
			}
		}

		throw new Error(`Generation failed after ${String(retryCount)} retries: ${this.getErrorMessage(lastError)}`);
	}

	async *executeStream(input: TGenerateInput): AsyncGenerator<IGenerateStreamChunk> {
		const context: { configuration: LlmConfiguration; model: string } = await this.resolveGenerationContext(input);
		const providerService: ILlmService = this.resolveProviderService(context.configuration.getProvider());
		const normalizedMessages: Array<ILlmMessage> = this.normalizeMessages(input);
		const retryCount: number = context.configuration.getRetries();
		let configuration: LlmConfiguration = context.configuration;
		let credentialRepromptCount: number = 0;

		this.ensureValidRetryCount(retryCount);
		this.ensureValidTimeout(context.configuration);

		let lastError: unknown;
		let attempt: number = NUMERIC_CONSTANT.MIN_RETRY_COUNT;

		while (attempt <= retryCount + credentialRepromptCount) {
			let hasEmittedAnyChunk: boolean = false;

			try {
				if (providerService.generateStream) {
					let aggregatedText: string = "";

					for await (const delta of this.withStreamTimeout(providerService.generateStream(normalizedMessages, configuration), configuration)) {
						if (delta.length === 0) {
							continue;
						}

						hasEmittedAnyChunk = true;
						aggregatedText += delta;

						yield {
							attempt,
							delta,
							model: context.model,
							provider: configuration.getProvider(),
							text: aggregatedText,
						};
					}

					if (aggregatedText.trim().length === 0) {
						throw new Error("Provider returned empty text");
					}

					return;
				}

				const text: string = await this.withGenerationTimeout(providerService.generate(normalizedMessages, configuration), configuration);

				if (text.trim().length === 0) {
					throw new Error("Provider returned empty text");
				}

				yield {
					attempt,
					delta: text,
					model: context.model,
					provider: configuration.getProvider(),
					text,
				};

				return;
			} catch (error) {
				if (hasEmittedAnyChunk) {
					throw new Error(`Generation stream failed after partial output on attempt ${String(attempt)}: ${this.getErrorMessage(error)}`);
				}

				lastError = error;

				const repromptedConfiguration: LlmConfiguration | undefined = await this.resolveRepromptedConfiguration(error, providerService, configuration, credentialRepromptCount);

				if (repromptedConfiguration) {
					configuration = repromptedConfiguration;
					credentialRepromptCount++;
				}

				attempt++;
			}
		}

		throw new Error(`Generation stream failed after ${String(retryCount)} retries: ${this.getErrorMessage(lastError)}`);
	}

	private ensureValidRetryCount(retryCount: number): void {
		if (retryCount < NUMERIC_CONSTANT.MIN_RETRY_COUNT) {
			throw new Error(`Invalid retries value '${String(retryCount)}'. Retries must be at least ${String(NUMERIC_CONSTANT.MIN_RETRY_COUNT)}.`);
		}
	}

	private ensureValidTimeout(configuration: LlmConfiguration): void {
		const timeoutMs: number | undefined = configuration.getGenerationOptions().timeoutMs;

		if (timeoutMs !== undefined && timeoutMs <= 0) {
			throw new Error(`Invalid timeoutMs value '${String(timeoutMs)}'. Timeout must be greater than 0.`);
		}
	}

	private extractGenerationOptions(input: IGenerateDirectInput | IGenerateProfileInput | IResolvedModuleProfile): IGenerationOptions {
		return {
			frequencyPenalty: input.frequencyPenalty,
			maxCompletionTokens: input.maxCompletionTokens,
			maxTokens: input.maxTokens,
			metadata: input.metadata,
			presencePenalty: input.presencePenalty,
			providerOptions: input.providerOptions,
			reasoning: input.reasoning,
			responseFormat: input.responseFormat,
			seed: input.seed,
			serviceTier: input.serviceTier,
			shouldRepromptCredentialOnAuthenticationFailure: input.shouldRepromptCredentialOnAuthenticationFailure,
			shouldUseParallelToolCalls: input.shouldUseParallelToolCalls,
			stopSequences: input.stopSequences,
			temperature: input.temperature,
			timeoutMs: input.timeoutMs,
			toolChoice: input.toolChoice,
			tools: input.tools,
			topK: input.topK,
			topP: input.topP,
		};
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

	private isAuthenticationFailure(providerService: ILlmService, error: unknown): boolean {
		return providerService.isAuthenticationError?.(error) ?? false;
	}

	private mergeGenerationOptions(profile: IResolvedModuleProfile, input: IGenerateProfileInput): IGenerationOptions {
		return {
			frequencyPenalty: input.frequencyPenalty ?? profile.frequencyPenalty,
			maxCompletionTokens: input.maxCompletionTokens ?? profile.maxCompletionTokens,
			maxTokens: input.maxTokens ?? profile.maxTokens,
			metadata: input.metadata ?? profile.metadata,
			presencePenalty: input.presencePenalty ?? profile.presencePenalty,
			providerOptions: input.providerOptions ?? profile.providerOptions,
			reasoning: input.reasoning ?? profile.reasoning,
			responseFormat: input.responseFormat ?? profile.responseFormat,
			seed: input.seed ?? profile.seed,
			serviceTier: input.serviceTier ?? profile.serviceTier,
			shouldRepromptCredentialOnAuthenticationFailure: input.shouldRepromptCredentialOnAuthenticationFailure ?? profile.shouldRepromptCredentialOnAuthenticationFailure,
			shouldUseParallelToolCalls: input.shouldUseParallelToolCalls ?? profile.shouldUseParallelToolCalls,
			stopSequences: input.stopSequences ?? profile.stopSequences,
			temperature: input.temperature ?? profile.temperature,
			timeoutMs: input.timeoutMs ?? profile.timeoutMs,
			toolChoice: input.toolChoice ?? profile.toolChoice,
			tools: input.tools ?? profile.tools,
			topK: input.topK ?? profile.topK,
			topP: input.topP ?? profile.topP,
		};
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

		const model: string = input.model ?? PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[input.provider];

		if (!model) {
			throw new Error(`No default model configured for provider '${input.provider}'`);
		}

		return {
			configuration: new LlmConfiguration(input.provider, new CredentialValue(input.credential), model, input.maxTokens, input.temperature, input.retries, input.validationRetries, this.extractGenerationOptions(input)),
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

		const runtimeCredential: CredentialValue | undefined = input.credential?.trim() ? new CredentialValue(input.credential.trim()) : undefined;
		const profile: IResolvedModuleProfile = await this.ENSURE_PROFILE_USE_CASE.execute(input.moduleId, runtimeCredential);

		const model: string = input.model ?? profile.model;

		return {
			configuration: new LlmConfiguration(profile.provider, runtimeCredential ?? profile.credential, model, input.maxTokens ?? profile.maxTokens, input.temperature ?? profile.temperature, input.retries ?? profile.retries, input.validationRetries ?? profile.validationRetries, this.mergeGenerationOptions(profile, input)),
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

	private async resolveRepromptedConfiguration(error: unknown, providerService: ILlmService, configuration: LlmConfiguration, credentialRepromptCount: number): Promise<LlmConfiguration | undefined> {
		if (credentialRepromptCount >= NUMERIC_CONSTANT.MAX_CREDENTIAL_REPROMPT_COUNT) {
			return undefined;
		}

		if (!configuration.getGenerationOptions().shouldRepromptCredentialOnAuthenticationFailure) {
			return undefined;
		}

		if (!this.isAuthenticationFailure(providerService, error)) {
			return undefined;
		}

		if (!this.INTERACTIVE_SHELL_SERVICE.isInteractive()) {
			return undefined;
		}

		const credential: CredentialValue = await this.PROMPT_CREDENTIAL_USE_CASE.execute(configuration.getProvider(), true);

		return configuration.withCredential(credential);
	}

	private async withGenerationTimeout<T>(operation: Promise<T>, configuration: LlmConfiguration): Promise<T> {
		const timeoutMs: number | undefined = configuration.getGenerationOptions().timeoutMs;

		if (timeoutMs === undefined) {
			return operation;
		}

		let timeoutId: ReturnType<typeof setTimeout> | undefined;

		const timeoutOperation: Promise<never> = new Promise<never>((_resolve: (value: PromiseLike<never>) => void, reject: (reason?: unknown) => void): void => {
			timeoutId = setTimeout((): void => {
				reject(new Error(`Generation timed out after ${String(timeoutMs)}ms.`));
			}, timeoutMs);
		});

		try {
			return await Promise.race([operation, timeoutOperation]);
		} finally {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		}
	}

	private async *withStreamTimeout(stream: AsyncGenerator<string>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const timeoutMs: number | undefined = configuration.getGenerationOptions().timeoutMs;

		if (timeoutMs === undefined) {
			yield* stream;

			return;
		}

		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		let isTimedOut: boolean = false;

		const timeoutOperation: Promise<IteratorResult<string>> = new Promise<IteratorResult<string>>((resolve: (value: IteratorResult<string>) => void): void => {
			timeoutId = setTimeout((): void => {
				isTimedOut = true;
				resolve({ ["done"]: true, value: undefined });
			}, timeoutMs);
		});

		try {
			while (true) {
				const nextResult: IteratorResult<string> = await Promise.race([stream.next(), timeoutOperation]);

				if (isTimedOut) {
					throw new Error(`Generation stream timed out after ${String(timeoutMs)}ms.`);
				}

				if (nextResult.done) {
					return;
				}

				yield nextResult.value;
			}
		} finally {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			void stream.return("").catch((): void => undefined);
		}
	}
}
