import { describe, expect, it } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

describe("llm-provider.enum", () => {
	it("exports all expected provider values", () => {
		expect(ELLMProvider.ANTHROPIC).toBe("anthropic");
		expect(ELLMProvider.AWS_BEDROCK).toBe("aws-bedrock");
		expect(ELLMProvider.AZURE_OPENAI).toBe("azure-openai");
		expect(ELLMProvider.CEREBRAS).toBe("cerebras");
		expect(ELLMProvider.GOOGLE).toBe("google");
		expect(ELLMProvider.OLLAMA).toBe("ollama");
		expect(ELLMProvider.OPENAI).toBe("openai");
		expect(ELLMProvider.VERCEL_AI_GATEWAY).toBe("vercel-ai-gateway");
	});

	it("Object.values returns 8 providers", () => {
		expect(Object.values(ELLMProvider)).toHaveLength(8);
	});
});
