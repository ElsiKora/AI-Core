import type { ILlmService } from "@application/interface/llm-service.interface";
import type { LlmConfiguration } from "@domain/entity/llm-configuration.entity";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { IAiToolDefinition } from "@domain/interface/ai/tool";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { EAiResponseFormatType } from "@domain/enum/ai/response-format-type.enum";
import { ELLMProvider } from "@domain/enum/llm-provider.enum";
import { EOllamaModel } from "@domain/enum/ollama-model.enum";
import { LlmAuthenticationErrorDetectorService } from "@infrastructure/service/llm/authentication-error-detector.service";
import OpenAI from "openai";

/**
 * Ollama provider adapter via OpenAI-compatible API.
 */
export class OllamaLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const endpointOptions: { baseUrl: string; customModel?: string } = this.parseEndpoint(configuration.getCredential().getValue());
		const model: string = this.resolveModel(configuration.getModel(), endpointOptions.customModel);
		const client: OpenAI = this.createClient(endpointOptions.baseUrl);

		const response: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create(this.buildRequest(messages, configuration, model) as never);

		const text: null | string | undefined = response.choices[0]?.message?.content;

		if (!text) {
			throw new Error("Ollama returned empty response");
		}

		return text;
	}

	async *generateStream(messages: Array<ILlmMessage>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const endpointOptions: { baseUrl: string; customModel?: string } = this.parseEndpoint(configuration.getCredential().getValue());
		const model: string = this.resolveModel(configuration.getModel(), endpointOptions.customModel);
		const client: OpenAI = this.createClient(endpointOptions.baseUrl);
		const streamPropertyName: "stream" = "stream" as const;

		const stream: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create({
			...this.buildRequest(messages, configuration, model),
			[streamPropertyName]: true,
		} as never);

		for await (const chunk of stream as unknown as AsyncIterable<{ choices?: Array<{ delta?: { content?: null | string } }> }>) {
			const delta: null | string | undefined = chunk.choices?.[0]?.delta?.content;

			if (delta) {
				yield delta;
			}
		}
	}

	getName(): string {
		return ELLMProvider.OLLAMA;
	}

	isAuthenticationError(error: unknown): boolean {
		return LlmAuthenticationErrorDetectorService.isAuthenticationError(error);
	}

	private buildRequest(messages: Array<ILlmMessage>, configuration: LlmConfiguration, model: string): Record<string, unknown> {
		const options: IGenerationOptions = configuration.getGenerationOptions();
		const ollamaOptions: NonNullable<IGenerationOptions["providerOptions"]>["ollama"] | undefined = options.providerOptions?.ollama;

		return {
			max_tokens: configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			model,
			reasoning: ollamaOptions?.reasoning,
			reasoning_effort: ollamaOptions?.reasoningEffort,
			response_format: options.responseFormat
				? {
						json_schema:
							options.responseFormat.type === EAiResponseFormatType.JSON_SCHEMA
								? {
										description: options.responseFormat.description,
										name: options.responseFormat.name,
										schema: options.responseFormat.schema,
										["strict"]: options.responseFormat.isStrict,
									}
								: undefined,
						type: options.responseFormat.type,
					}
				: undefined,
			seed: options.seed,
			temperature: configuration.getTemperature(),
			tools: options.tools?.map((tool: IAiToolDefinition) => ({
				function: {
					description: tool.description,
					name: tool.name,
					parameters: tool.parameters,
				},
				type: "function",
			})),
			top_p: options.topP,
		};
	}

	private createClient(baseUrl: string): OpenAI {
		return new OpenAI({
			apiKey: "ollama",
			baseURL: `${baseUrl}/v1`,
		});
	}

	private parseEndpoint(value: string): { baseUrl: string; customModel?: string } {
		const parts: Array<string> = value.split("|");
		const rawEndpoint: string | undefined = parts[0];
		const customModel: string | undefined = parts[1];

		if (!rawEndpoint) {
			throw new Error("Ollama credential must include host:port");
		}

		const baseUrl: string = rawEndpoint.startsWith("http://") || rawEndpoint.startsWith("https://") ? rawEndpoint : `http://${rawEndpoint}`;

		return {
			baseUrl: baseUrl.replace(/\/$/, ""),
			customModel: customModel?.trim(),
		};
	}

	private resolveModel(configuredModel: string | undefined, customModel: string | undefined): string {
		if (configuredModel && configuredModel !== "custom") {
			return configuredModel;
		}

		if (customModel && customModel.length > 0) {
			return customModel;
		}

		return EOllamaModel.LLAMA3_3;
	}

	private toCompletionMessages(messages: Array<ILlmMessage>): Array<ChatCompletionMessageParam> {
		return messages.map(
			(message: ILlmMessage): ChatCompletionMessageParam => ({
				content: message.content,
				role: message.role,
			}),
		);
	}
}
