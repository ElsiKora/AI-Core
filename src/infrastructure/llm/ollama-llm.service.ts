import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { LlmConfiguration } from "../../domain/entity/llm-configuration.entity.js";
import type { ILlmMessage } from "../../domain/interface/llm/message.interface.js";

import OpenAI from "openai";

import { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import { EOllamaModel } from "../../domain/enum/ollama-model.enum.js";

/**
 * Ollama provider adapter via OpenAI-compatible API.
 */
export class OllamaLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const endpointOptions: { baseUrl: string; customModel?: string } = this.parseEndpoint(configuration.getCredential().getValue());
		const model: string = this.resolveModel(configuration.getModel(), endpointOptions.customModel);
		const client: OpenAI = this.createClient(endpointOptions.baseUrl);

		const response: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create({
			max_tokens: configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			model,
			temperature: configuration.getTemperature(),
		});

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
			max_tokens: configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			model,
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
		return ELLMProvider.OLLAMA;
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
