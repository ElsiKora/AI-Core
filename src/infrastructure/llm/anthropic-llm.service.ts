import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { LlmConfiguration } from "../../domain/entity/llm-configuration.entity.js";
import type { ILlmMessage } from "../../domain/interface/llm/message.interface.js";

import Anthropic from "@anthropic-ai/sdk";

import { DEFAULT_MAX_TOKENS } from "../../domain/constant/numeric.constant.js";
import { EAnthropicModel } from "../../domain/enum/anthropic-model.enum.js";
import { ELLMMessageRole } from "../../domain/enum/llm-message-role.enum.js";
import { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";

/**
 * Anthropic provider adapter.
 */
export class AnthropicLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const client: Anthropic = new Anthropic({ apiKey: configuration.getCredential().getValue() });

		const systemPrompt: string = messages
			.filter((message: ILlmMessage): boolean => message.role === ELLMMessageRole.SYSTEM)
			.map((message: ILlmMessage): string => message.content)
			.join("\n\n");

		const chatMessages: Array<Anthropic.MessageParam> = messages
			.filter((message: ILlmMessage): boolean => message.role !== ELLMMessageRole.SYSTEM)
			.map(
				(message: ILlmMessage): Anthropic.MessageParam => ({
					content: message.content,
					role: message.role === ELLMMessageRole.ASSISTANT ? "assistant" : "user",
				}),
			);

		const response: Awaited<ReturnType<Anthropic["messages"]["create"]>> = await client.messages.create({
			max_tokens: configuration.getMaxTokens() ?? DEFAULT_MAX_TOKENS,
			messages: chatMessages.length > 0 ? chatMessages : [{ content: "Continue.", role: "user" }],
			model: configuration.getModel() ?? EAnthropicModel.CLAUDE_SONNET_4_5,
			system: systemPrompt || undefined,
			temperature: configuration.getTemperature(),
		});

		const text: string = response.content
			.filter((part: Anthropic.ContentBlock): part is Anthropic.TextBlock => part.type === "text")
			.map((part: Anthropic.TextBlock): string => part.text)
			.join("\n")
			.trim();

		if (!text) {
			throw new Error("Anthropic returned empty response");
		}

		return text;
	}

	getName(): string {
		return ELLMProvider.ANTHROPIC;
	}
}
