import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { LlmConfiguration } from "../../domain/entity/llm-configuration.entity.js";
import type { ILlmMessage } from "../../domain/interface/llm/message.interface.js";

import OpenAI from "openai";

import { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import { EOpenAIModel } from "../../domain/enum/openai-model.enum.js";

/**
 * OpenAI provider adapter.
 */
export class OpenAiLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const client: OpenAI = new OpenAI({ apiKey: configuration.getCredential().getValue() });

		const response: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create({
			max_tokens: configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			model: configuration.getModel() ?? EOpenAIModel.GPT_4O,
			temperature: configuration.getTemperature(),
		});

		const text: null | string | undefined = response.choices[0]?.message?.content;

		if (!text) {
			throw new Error("OpenAI returned empty response");
		}

		return text;
	}

	async *generateStream(messages: Array<ILlmMessage>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const client: OpenAI = new OpenAI({ apiKey: configuration.getCredential().getValue() });
		const streamPropertyName: "stream" = "stream" as const;

		const stream: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create({
			max_tokens: configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			model: configuration.getModel() ?? EOpenAIModel.GPT_4O,
			[streamPropertyName]: true,
			temperature: configuration.getTemperature(),
		});

		for await (const chunk of stream as AsyncIterable<{ choices?: Array<{ delta?: { content?: null | string } }> }>) {
			const delta: null | string | undefined = chunk.choices?.[0]?.delta?.content;

			if (delta) {
				yield delta;
			}
		}
	}

	getName(): string {
		return ELLMProvider.OPENAI;
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
