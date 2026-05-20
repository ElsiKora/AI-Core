import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { LlmConfiguration } from "../../domain/entity/llm-configuration.entity.js";
import type { ILlmMessage } from "../../domain/interface/llm/message.interface.js";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from "../../domain/constant/numeric.constant.js";
import { EGoogleModel } from "../../domain/enum/google-model.enum.js";
import { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";

/**
 * Google Gemini provider adapter.
 */
export class GoogleLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const client: GoogleGenerativeAI = new GoogleGenerativeAI(configuration.getCredential().getValue());

		const model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> = client.getGenerativeModel({
			generationConfig: {
				maxOutputTokens: configuration.getMaxTokens() ?? DEFAULT_MAX_TOKENS,
				temperature: configuration.getTemperature() ?? DEFAULT_TEMPERATURE,
			},
			model: configuration.getModel() ?? EGoogleModel.GEMINI_2_5_FLASH,
		});

		const response: Awaited<ReturnType<typeof model.generateContent>> = await model.generateContent(this.buildPrompt(messages));
		const text: string = response.response.text().trim();

		if (!text) {
			throw new Error("Google returned empty response");
		}

		return text;
	}

	getName(): string {
		return ELLMProvider.GOOGLE;
	}

	private buildPrompt(messages: Array<ILlmMessage>): string {
		return messages.map((message: ILlmMessage): string => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
	}
}
