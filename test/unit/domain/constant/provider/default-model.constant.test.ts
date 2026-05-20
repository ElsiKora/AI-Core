import { describe, expect, it } from "vitest";

import { EAnthropicModel } from "@/domain/enum/anthropic-model.enum.js";
import { EAWSBedrockModel } from "@/domain/enum/aws-bedrock-model.enum.js";
import { EAzureOpenAIModel } from "@/domain/enum/azure-openai-model.enum.js";
import { ECerebrasModel } from "@/domain/enum/cerebras-model.enum.js";
import { EGoogleModel } from "@/domain/enum/google-model.enum.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";
import { EOllamaModel } from "@/domain/enum/ollama-model.enum.js";
import { EOpenAIModel } from "@/domain/enum/openai-model.enum.js";
import { EVercelAiGatewayModel } from "@/domain/enum/vercel-ai-gateway-model.enum.js";

import { PROVIDER_DEFAULT_MODEL_MAP } from "@/domain/constant/provider/default-model.constant.js";

describe("default-model.constant", () => {
	it("provides default model for every ELLMProvider", () => {
		const providers = Object.values(ELLMProvider);

		for (const provider of providers) {
			const model = PROVIDER_DEFAULT_MODEL_MAP[provider];
			expect(model).toBeDefined();
			expect(typeof model).toBe("string");
			expect(model.length).toBeGreaterThan(0);
		}
	});

	it("PROVIDER_DEFAULT_MODEL_MAP has entry per provider", () => {
		expect(Object.keys(PROVIDER_DEFAULT_MODEL_MAP)).toHaveLength(Object.keys(ELLMProvider).length);
	});

	it("uses updated defaults for providers that changed", () => {
		expect(PROVIDER_DEFAULT_MODEL_MAP[ELLMProvider.ANTHROPIC]).toBe(EAnthropicModel.CLAUDE_SONNET_4_6);
		expect(PROVIDER_DEFAULT_MODEL_MAP[ELLMProvider.AWS_BEDROCK]).toBe(EAWSBedrockModel.CLAUDE_SONNET_4_6);
		expect(PROVIDER_DEFAULT_MODEL_MAP[ELLMProvider.AZURE_OPENAI]).toBe(EAzureOpenAIModel.GPT_5_5);
		expect(PROVIDER_DEFAULT_MODEL_MAP[ELLMProvider.CEREBRAS]).toBe(ECerebrasModel.GPT_OSS_120B);
		expect(PROVIDER_DEFAULT_MODEL_MAP[ELLMProvider.GOOGLE]).toBe(EGoogleModel.GEMINI_3_5_FLASH);
		expect(PROVIDER_DEFAULT_MODEL_MAP[ELLMProvider.OLLAMA]).toBe(EOllamaModel.QWEN3_5);
		expect(PROVIDER_DEFAULT_MODEL_MAP[ELLMProvider.OPENAI]).toBe(EOpenAIModel.GPT_5_5);
		expect(PROVIDER_DEFAULT_MODEL_MAP[ELLMProvider.VERCEL_AI_GATEWAY]).toBe(EVercelAiGatewayModel.OPENAI_GPT_5_5);
	});
});
