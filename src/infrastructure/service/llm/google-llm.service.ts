import type { ILlmService } from "@application/interface/llm-service.interface";
import type { LlmConfiguration } from "@domain/entity/llm-configuration.entity";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";

import { NUMERIC_CONSTANT } from "@domain/constant/numeric.constant";
import { EGoogleModel } from "@domain/enum/google-model.enum";
import { ELLMMessageRole } from "@domain/enum/llm-message-role.enum";
import { ELLMProvider } from "@domain/enum/llm-provider.enum";
import { GoogleGenAI } from "@google/genai";
import { LlmAuthenticationErrorDetectorService } from "@infrastructure/service/llm/authentication-error-detector.service";

/**
 * Google Gemini provider adapter.
 */
export class GoogleLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const client: GoogleGenAI = new GoogleGenAI({ apiKey: configuration.getCredential().getValue() });

		const response: Awaited<ReturnType<GoogleGenAI["models"]["generateContent"]>> = await client.models.generateContent({
			config: this.buildConfig(configuration),
			contents: this.buildPrompt(messages),
			model: configuration.getModel() ?? EGoogleModel.GEMINI_3_5_FLASH,
		});
		const text: string = (response.text ?? "").trim();

		if (!text) {
			throw new Error("Google returned empty response");
		}

		return text;
	}

	async *generateStream(messages: Array<ILlmMessage>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const client: GoogleGenAI = new GoogleGenAI({ apiKey: configuration.getCredential().getValue() });

		const stream: Awaited<ReturnType<GoogleGenAI["models"]["generateContentStream"]>> = await client.models.generateContentStream({
			config: this.buildConfig(configuration),
			contents: this.buildPrompt(messages),
			model: configuration.getModel() ?? EGoogleModel.GEMINI_3_5_FLASH,
		});

		for await (const chunk of stream) {
			const text: string | undefined = chunk.text;

			if (text && text.length > 0) {
				yield text;
			}
		}
	}

	getName(): string {
		return ELLMProvider.GOOGLE;
	}

	isAuthenticationError(error: unknown): boolean {
		return LlmAuthenticationErrorDetectorService.isAuthenticationError(error);
	}

	private buildConfig(configuration: LlmConfiguration): Record<string, unknown> {
		const options: IGenerationOptions = configuration.getGenerationOptions();
		const googleOptions: NonNullable<IGenerationOptions["providerOptions"]>["google"] | undefined = options.providerOptions?.google;
		const thinkingConfig: NonNullable<NonNullable<IGenerationOptions["providerOptions"]>["google"]>["thinkingConfig"] | undefined = googleOptions?.thinkingConfig;

		if (thinkingConfig?.thinkingBudget !== undefined && thinkingConfig.thinkingLevel !== undefined) {
			throw new Error("Google Gemini thinkingBudget and thinkingLevel cannot be sent together.");
		}

		return {
			cachedContent: googleOptions?.cachedContent,
			maxOutputTokens: configuration.getMaxTokens() ?? NUMERIC_CONSTANT.DEFAULT_MAX_TOKENS,
			responseJsonSchema: googleOptions?.responseJsonSchema,
			responseMimeType: options.responseFormat ? "application/json" : undefined,
			safetySettings: googleOptions?.safetySettings,
			stopSequences: options.stopSequences,
			systemInstruction: googleOptions?.systemInstruction,
			temperature: configuration.getTemperature() ?? NUMERIC_CONSTANT.DEFAULT_TEMPERATURE,
			thinkingConfig: googleOptions?.thinkingConfig,
			toolConfig: googleOptions?.functionCallingConfig
				? {
						functionCallingConfig: googleOptions.functionCallingConfig,
					}
				: undefined,
			topK: options.topK,
			topP: options.topP,
		};
	}

	private buildPrompt(messages: Array<ILlmMessage>): string {
		return messages
			.filter((message: ILlmMessage): boolean => message.role !== ELLMMessageRole.SYSTEM)
			.map((message: ILlmMessage): string => `${message.role.toUpperCase()}: ${message.content}`)
			.join("\n\n");
	}
}
