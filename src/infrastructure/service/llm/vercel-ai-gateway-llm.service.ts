import type { ILlmService } from "@application/interface/llm-service.interface";
import type { LlmConfiguration } from "@domain/entity/llm-configuration.entity";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";

import { ELLMProvider } from "@domain/enum/llm-provider.enum";
import { EVercelAiGatewayModel } from "@domain/enum/vercel-ai-gateway-model.enum";
import { LlmAuthenticationErrorDetectorService } from "@infrastructure/service/llm/authentication-error-detector.service";
import { createGateway, generateText, streamText } from "ai";

/**
 * Vercel AI Gateway adapter.
 */
export class VercelAiGatewayLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const gateway: ReturnType<typeof createGateway> = createGateway({ apiKey: configuration.getCredential().getValue() });

		try {
			const response: Awaited<ReturnType<typeof generateText>> = await this.withProviderTimeout((abortSignal: AbortSignal | undefined): Promise<Awaited<ReturnType<typeof generateText>>> => generateText(this.buildRequest(messages, configuration, gateway, abortSignal) as never), configuration, "generation");
			const text: string = response.text;

			if (!text || text.trim().length === 0) {
				throw new Error("Vercel AI Gateway returned empty response");
			}

			return text;
		} catch (error) {
			throw new Error(`Vercel AI Gateway generation failed: ${this.getErrorMessage(error)}`);
		}
	}

	async *generateStream(messages: Array<ILlmMessage>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const gateway: ReturnType<typeof createGateway> = createGateway({ apiKey: configuration.getCredential().getValue() });

		try {
			const response: ReturnType<typeof streamText> = streamText(this.buildRequest(messages, configuration, gateway) as never);

			for await (const delta of this.withStreamTimeout(response.textStream, configuration)) {
				if (delta.length > 0) {
					yield delta;
				}
			}
		} catch (error) {
			throw new Error(`Vercel AI Gateway stream failed: ${this.getErrorMessage(error)}`);
		}
	}

	getName(): string {
		return ELLMProvider.VERCEL_AI_GATEWAY;
	}

	isAuthenticationError(error: unknown): boolean {
		return LlmAuthenticationErrorDetectorService.isAuthenticationError(error);
	}

	private buildPrompt(messages: Array<ILlmMessage>): string {
		return messages.map((message: ILlmMessage): string => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
	}

	private buildRequest(messages: Array<ILlmMessage>, configuration: LlmConfiguration, gateway: ReturnType<typeof createGateway>, abortSignal?: AbortSignal): Record<string, unknown> {
		const options: IGenerationOptions = configuration.getGenerationOptions();
		const vercelOptions: NonNullable<IGenerationOptions["providerOptions"]>["vercelAiGateway"] | undefined = options.providerOptions?.vercelAiGateway;

		const providerOptions: Record<string, unknown> = {
			...vercelOptions?.providerOptions,
			...(vercelOptions?.anthropic === undefined ? {} : { anthropic: vercelOptions.anthropic }),
			...(vercelOptions?.gateway === undefined ? {} : { gateway: vercelOptions.gateway }),
			...(vercelOptions?.google === undefined ? {} : { google: vercelOptions.google }),
			...(vercelOptions?.openai === undefined ? {} : { openai: vercelOptions.openai }),
		};

		return {
			abortSignal,
			frequencyPenalty: options.frequencyPenalty,
			maxOutputTokens: configuration.getMaxTokens(),
			model: gateway(configuration.getModel() ?? EVercelAiGatewayModel.OPENAI_GPT_5_5),
			presencePenalty: options.presencePenalty,
			prompt: this.buildPrompt(messages),
			providerOptions,
			seed: options.seed,
			stopSequences: options.stopSequences,
			temperature: configuration.getTemperature(),
			topK: options.topK,
			topP: options.topP,
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

	private async withProviderTimeout<T>(operationFactory: (abortSignal?: AbortSignal) => Promise<T>, configuration: LlmConfiguration, operationName: string): Promise<T> {
		const timeoutMs: number | undefined = configuration.getGenerationOptions().timeoutMs;

		if (timeoutMs === undefined) {
			return operationFactory();
		}

		const abortController: AbortController = new AbortController();
		let timeoutId: ReturnType<typeof setTimeout> | undefined;

		const timeoutOperation: Promise<never> = new Promise<never>((_resolve: (value: PromiseLike<never>) => void, reject: (reason?: unknown) => void): void => {
			timeoutId = setTimeout((): void => {
				abortController.abort();
				reject(new Error(`Vercel AI Gateway ${operationName} timed out after ${String(timeoutMs)}ms.`));
			}, timeoutMs);
		});

		try {
			return await Promise.race([operationFactory(abortController.signal), timeoutOperation]);
		} finally {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		}
	}

	private async *withStreamTimeout(stream: AsyncIterable<string>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const timeoutMs: number | undefined = configuration.getGenerationOptions().timeoutMs;

		if (timeoutMs === undefined) {
			yield* stream;

			return;
		}

		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		let isTimedOut: boolean = false;
		const iterator: AsyncIterator<string> = stream[Symbol.asyncIterator]();

		const timeoutOperation: Promise<IteratorResult<string>> = new Promise<IteratorResult<string>>((resolve: (value: IteratorResult<string>) => void): void => {
			timeoutId = setTimeout((): void => {
				isTimedOut = true;
				resolve({ ["done"]: true, value: undefined });
			}, timeoutMs);
		});

		try {
			while (true) {
				const nextResult: IteratorResult<string> = await Promise.race([iterator.next(), timeoutOperation]);

				if (isTimedOut) {
					throw new Error(`Vercel AI Gateway stream timed out after ${String(timeoutMs)}ms.`);
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

			const returnOperation: Promise<IteratorResult<string>> | undefined = iterator.return?.("");

			if (returnOperation) {
				void returnOperation.catch((): void => undefined);
			}
		}
	}
}
