import type { ILlmService } from "@application/interface/llm-service.interface";
import type { LlmConfiguration } from "@domain/entity/llm-configuration.entity";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { IAiToolDefinition } from "@domain/interface/ai/tool";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { EAiResponseFormatType } from "@domain/enum/ai/response-format-type.enum";
import { ECerebrasModel } from "@domain/enum/cerebras-model.enum";
import { ELLMProvider } from "@domain/enum/llm-provider.enum";
import { LlmAuthenticationErrorDetectorService } from "@infrastructure/service/llm/authentication-error-detector.service";
import OpenAI from "openai";

/**
 * Cerebras provider adapter (OpenAI-compatible API).
 */
export class CerebrasLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const client: OpenAI = new OpenAI({
			apiKey: configuration.getCredential().getValue(),
			baseURL: "https://api.cerebras.ai/v1",
		});

		const response: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create(this.buildRequest(messages, configuration) as never);

		const text: null | string | undefined = response.choices[0]?.message?.content;

		if (!text) {
			throw new Error("Cerebras returned empty response");
		}

		return text;
	}

	async *generateStream(messages: Array<ILlmMessage>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const client: OpenAI = new OpenAI({
			apiKey: configuration.getCredential().getValue(),
			baseURL: "https://api.cerebras.ai/v1",
		});
		const streamPropertyName: "stream" = "stream" as const;

		const stream: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create({
			...this.buildRequest(messages, configuration),
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
		return ELLMProvider.CEREBRAS;
	}

	isAuthenticationError(error: unknown): boolean {
		return LlmAuthenticationErrorDetectorService.isAuthenticationError(error);
	}

	private buildRequest(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Record<string, unknown> {
		const options: IGenerationOptions = configuration.getGenerationOptions();
		const cerebrasOptions: NonNullable<IGenerationOptions["providerOptions"]>["cerebras"] | undefined = options.providerOptions?.cerebras;

		if (options.tools?.length && options.responseFormat) {
			throw new Error("Cerebras does not support tools and responseFormat in the same request.");
		}

		return {
			["logprobs"]: cerebrasOptions?.shouldReturnLogprobs,
			max_completion_tokens: options.maxCompletionTokens ?? cerebrasOptions?.maxCompletionTokens ?? configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			model: configuration.getModel() ?? ECerebrasModel.GPT_OSS_120B,
			["parallel_tool_calls"]: options.shouldUseParallelToolCalls,
			reasoning_effort: options.reasoning?.effort ?? cerebrasOptions?.reasoningEffort,
			reasoning_format: cerebrasOptions?.reasoningFormat,
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
			tool_choice: options.toolChoice?.name ? { function: { name: options.toolChoice.name }, type: "function" } : options.toolChoice?.mode,
			tools: options.tools?.map((tool: IAiToolDefinition) => ({
				function: {
					description: tool.description,
					name: tool.name,
					parameters: tool.parameters,
					["strict"]: tool.isStrict,
				},
				type: "function",
			})),
			top_logprobs: cerebrasOptions?.topLogprobs,
			top_p: options.topP,
		};
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
