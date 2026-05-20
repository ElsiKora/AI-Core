import type { ILlmService } from "@application/interface/llm-service.interface";
import type { LlmConfiguration } from "@domain/entity/llm-configuration.entity";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { IAiResponseFormat } from "@domain/interface/ai/response-format.interface";
import type { IAiToolDefinition } from "@domain/interface/ai/tool";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { EAiOpenAiApiMode } from "@domain/enum/ai/provider/openai/api-mode.enum";
import { EAiResponseFormatType } from "@domain/enum/ai/response-format-type.enum";
import { ELLMProvider } from "@domain/enum/llm-provider.enum";
import { EOpenAIModel } from "@domain/enum/openai-model.enum";
import { LlmAuthenticationErrorDetectorService } from "@infrastructure/service/llm/authentication-error-detector.service";
import OpenAI from "openai";

/**
 * OpenAI provider adapter.
 */
export class OpenAiLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const client: OpenAI = new OpenAI({ apiKey: configuration.getCredential().getValue() });

		if (this.shouldUseChatCompletions(configuration)) {
			const response: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create(this.buildChatRequest(messages, configuration) as never);
			const text: null | string | undefined = response.choices[0]?.message?.content;

			if (!text) {
				throw new Error("OpenAI returned empty response");
			}

			return text;
		}

		const response: { output_text?: string } = await client.responses.create(this.buildResponsesRequest(messages, configuration) as never);
		const text: string | undefined = response.output_text;

		if (!text) {
			throw new Error("OpenAI returned empty response");
		}

		return text;
	}

	async *generateStream(messages: Array<ILlmMessage>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const client: OpenAI = new OpenAI({ apiKey: configuration.getCredential().getValue() });
		const streamPropertyName: "stream" = "stream" as const;

		const stream: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create({
			...this.buildChatRequest(messages, configuration),
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
		return ELLMProvider.OPENAI;
	}

	isAuthenticationError(error: unknown): boolean {
		return LlmAuthenticationErrorDetectorService.isAuthenticationError(error);
	}

	private buildChatRequest(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Record<string, unknown> {
		const options: IGenerationOptions = configuration.getGenerationOptions();
		const openAiOptions: NonNullable<IGenerationOptions["providerOptions"]>["openai"] | undefined = options.providerOptions?.openai;

		return {
			frequency_penalty: options.frequencyPenalty,
			max_completion_tokens: options.maxCompletionTokens ?? openAiOptions?.maxCompletionTokens,
			max_tokens: options.maxCompletionTokens ? undefined : configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			metadata: options.metadata,
			model: configuration.getModel() ?? EOpenAIModel.GPT_5_5,
			["parallel_tool_calls"]: options.shouldUseParallelToolCalls ?? openAiOptions?.shouldUseParallelToolCalls,
			presence_penalty: options.presencePenalty,
			reasoning_effort: options.reasoning?.effort ?? openAiOptions?.reasoningEffort,
			response_format: options.responseFormat ? this.toChatResponseFormat(options.responseFormat) : undefined,
			seed: options.seed,
			service_tier: openAiOptions?.serviceTier,
			stop: options.stopSequences,
			temperature: configuration.getTemperature(),
			tool_choice: options.toolChoice?.name ? { name: options.toolChoice.name, type: "function" } : options.toolChoice?.mode,
			tools: options.tools?.map((tool: IAiToolDefinition) => ({
				function: {
					description: tool.description,
					name: tool.name,
					parameters: tool.parameters,
					["strict"]: tool.isStrict,
				},
				type: "function",
			})),
			top_p: options.topP,
			verbosity: openAiOptions?.textVerbosity,
		};
	}

	private buildResponsesRequest(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Record<string, unknown> {
		const options: IGenerationOptions = configuration.getGenerationOptions();
		const openAiOptions: NonNullable<IGenerationOptions["providerOptions"]>["openai"] | undefined = options.providerOptions?.openai;

		return {
			include: openAiOptions?.include,
			input: messages.map((message: ILlmMessage) => ({
				content: message.content,
				role: message.role,
			})),
			instructions: openAiOptions?.instructions,
			max_output_tokens: configuration.getMaxTokens(),
			metadata: options.metadata,
			model: configuration.getModel() ?? EOpenAIModel.GPT_5_5,
			["parallel_tool_calls"]: options.shouldUseParallelToolCalls ?? openAiOptions?.shouldUseParallelToolCalls,
			previous_response_id: openAiOptions?.previousResponseId,
			reasoning: options.reasoning ?? {
				effort: openAiOptions?.reasoningEffort,
				summary: openAiOptions?.reasoningSummary,
			},
			service_tier: openAiOptions?.serviceTier,
			["store"]: openAiOptions?.shouldStore,
			temperature: configuration.getTemperature(),
			text: {
				format: options.responseFormat ? this.toResponsesTextFormat(options.responseFormat) : undefined,
				verbosity: openAiOptions?.textVerbosity,
			},
			tool_choice: options.toolChoice?.name ? { name: options.toolChoice.name, type: "function" } : options.toolChoice?.mode,
			tools: options.tools?.map((tool: IAiToolDefinition) => ({
				description: tool.description,
				name: tool.name,
				parameters: tool.parameters,
				["strict"]: tool.isStrict,
				type: "function",
			})),
			top_p: options.topP,
		};
	}

	private shouldUseChatCompletions(configuration: LlmConfiguration): boolean {
		const options: IGenerationOptions = configuration.getGenerationOptions();

		return options.providerOptions?.openai?.apiMode === EAiOpenAiApiMode.CHAT || options.seed !== undefined || Boolean(options.stopSequences?.length);
	}

	private toChatResponseFormat(responseFormat: IAiResponseFormat): Record<string, unknown> {
		if (responseFormat.type !== EAiResponseFormatType.JSON_SCHEMA) {
			return { type: responseFormat.type };
		}

		return {
			json_schema: {
				description: responseFormat.description,
				name: responseFormat.name,
				schema: responseFormat.schema,
				["strict"]: responseFormat.isStrict,
			},
			type: responseFormat.type,
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

	private toResponsesTextFormat(responseFormat: IAiResponseFormat): Record<string, unknown> {
		if (responseFormat.type !== EAiResponseFormatType.JSON_SCHEMA) {
			return { type: responseFormat.type };
		}

		return {
			description: responseFormat.description,
			name: responseFormat.name,
			schema: responseFormat.schema,
			["strict"]: responseFormat.isStrict,
			type: responseFormat.type,
		};
	}
}
