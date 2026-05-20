import { describe, expect, it } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { EOpenAIModel } from "@/domain/enum/openai-model.enum";

import { ModelRegistryService } from "@/application/service/model-registry.service";

describe("ModelRegistryService", () => {
	const service = new ModelRegistryService();

	it("getProviderOptions returns all providers", () => {
		const options = service.getProviderOptions();
		expect(options.length).toBe(8);
		expect(options.map((o) => o.value)).toContain(ELLMProvider.OPENAI);
		expect(options.map((o) => o.value)).toContain(ELLMProvider.ANTHROPIC);
	});

	it("getModelOptions returns options for OPENAI", () => {
		const options = service.getModelOptions(ELLMProvider.OPENAI);
		expect(options.length).toBeGreaterThan(0);
		expect(options.every((o) => o.provider === ELLMProvider.OPENAI)).toBe(true);
		expect(options.some((o) => o.value === EOpenAIModel.GPT_4O)).toBe(true);
	});

	it("getModelOptions marks default model", () => {
		const options = service.getModelOptions(ELLMProvider.OPENAI);
		const defaultCount = options.filter((o) => o.isDefault).length;
		expect(defaultCount).toBe(1);
	});

	it("getDefaultModel returns string for each provider", () => {
		for (const provider of Object.values(ELLMProvider)) {
			const defaultModel = service.getDefaultModel(provider);
			expect(typeof defaultModel).toBe("string");
			expect(defaultModel.length).toBeGreaterThan(0);
		}
	});

	it("getModelOptions throws for unsupported provider", () => {
		expect(() => service.getModelOptions("unknown" as ELLMProvider)).toThrow("Unsupported provider");
	});
});
