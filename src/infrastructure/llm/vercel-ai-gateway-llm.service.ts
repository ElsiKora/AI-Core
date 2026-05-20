import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { LlmConfiguration } from "../../domain/entity/llm-configuration.entity.js";
import type { ILlmMessage } from "../../domain/interface/llm/message.interface.js";

import { createGateway, generateText, streamText } from "ai";

import { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import { EVercelAiGatewayModel } from "../../domain/enum/vercel-ai-gateway-model.enum.js";

/**
 * Vercel AI Gateway adapter.
 */
export class VercelAiGatewayLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const gateway: ReturnType<typeof createGateway> = createGateway({ apiKey: configuration.getCredential().getValue() });

		const response: Awaited<ReturnType<typeof generateText>> = await generateText({
			maxOutputTokens: configuration.getMaxTokens(),
			model: gateway(configuration.getModel() ?? EVercelAiGatewayModel.OPENAI_GPT_5_2),
			prompt: this.buildPrompt(messages),
			temperature: configuration.getTemperature(),
		});
		const text: string = response.text;

		if (!text || text.trim().length === 0) {
			throw new Error("Vercel AI Gateway returned empty response");
		}

		return text;
	}

	async *generateStream(messages: Array<ILlmMessage>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const gateway: ReturnType<typeof createGateway> = createGateway({ apiKey: configuration.getCredential().getValue() });

		const response: ReturnType<typeof streamText> = streamText({
			maxOutputTokens: configuration.getMaxTokens(),
			model: gateway(configuration.getModel() ?? EVercelAiGatewayModel.OPENAI_GPT_5_2),
			prompt: this.buildPrompt(messages),
			temperature: configuration.getTemperature(),
		});

		for await (const delta of response.textStream) {
			if (delta.length > 0) {
				yield delta;
			}
		}
	}

	getName(): string {
		return ELLMProvider.VERCEL_AI_GATEWAY;
	}

	private buildPrompt(messages: Array<ILlmMessage>): string {
		return messages.map((message: ILlmMessage): string => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
	}
}
