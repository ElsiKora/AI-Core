import { describe, expect, it } from "vitest";

import { EAnthropicModel } from "@/domain/enum/anthropic-model.enum";
import { EAWSBedrockModel } from "@/domain/enum/aws-bedrock-model.enum";
import { EAzureOpenAIModel } from "@/domain/enum/azure-openai-model.enum";
import { ECerebrasModel } from "@/domain/enum/cerebras-model.enum";
import { EGoogleModel } from "@/domain/enum/google-model.enum";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { EOllamaModel } from "@/domain/enum/ollama-model.enum";
import { EOpenAIModel } from "@/domain/enum/openai-model.enum";
import { EVercelAiGatewayModel } from "@/domain/enum/vercel-ai-gateway-model.enum";

import { PROVIDER_DEFAULT_MODEL_CONSTANT } from "@/domain/constant/provider/default-model.constant";

describe("default-model.constant", () => {
	it("provides default model for every ELLMProvider", () => {
		const providers = Object.values(ELLMProvider);

		for (const provider of providers) {
			const model = PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[provider];
			expect(model).toBeDefined();
			expect(typeof model).toBe("string");
			expect(model.length).toBeGreaterThan(0);
		}
	});

	it("PROVIDER_DEFAULT_MODEL_CONSTANT.MAP has entry per provider", () => {
		expect(Object.keys(PROVIDER_DEFAULT_MODEL_CONSTANT.MAP)).toHaveLength(Object.keys(ELLMProvider).length);
	});

	it("uses updated defaults for providers that changed", () => {
		expect(PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[ELLMProvider.ANTHROPIC]).toBe(EAnthropicModel.CLAUDE_SONNET_4_6);
		expect(PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[ELLMProvider.AWS_BEDROCK]).toBe(EAWSBedrockModel.CLAUDE_SONNET_4_6);
		expect(PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[ELLMProvider.AZURE_OPENAI]).toBe(EAzureOpenAIModel.GPT_5_5);
		expect(PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[ELLMProvider.CEREBRAS]).toBe(ECerebrasModel.GPT_OSS_120B);
		expect(PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[ELLMProvider.GOOGLE]).toBe(EGoogleModel.GEMINI_3_5_FLASH);
		expect(PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[ELLMProvider.OLLAMA]).toBe(EOllamaModel.QWEN3_5);
		expect(PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[ELLMProvider.OPENAI]).toBe(EOpenAIModel.GPT_5_5);
		expect(PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[ELLMProvider.VERCEL_AI_GATEWAY]).toBe(EVercelAiGatewayModel.OPENAI_GPT_5_5);
	});
});
