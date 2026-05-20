import { describe, expect, it } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

import { PROVIDER_ENVIRONMENT_VARIABLE_CONSTANT } from "@/domain/constant/provider/environment-variable.constant";

describe("env-variable.constant", () => {
	it("provides env variable name for every ELLMProvider", () => {
		const providers = Object.values(ELLMProvider);

		for (const provider of providers) {
			const envVar = PROVIDER_ENVIRONMENT_VARIABLE_CONSTANT.MAP[provider];
			expect(envVar).toBeDefined();
			expect(typeof envVar).toBe("string");
			expect(envVar).toMatch(/^[A-Z][A-Z0-9_]+$/);
		}
	});

	it("OPENAI maps to OPENAI_API_KEY", () => {
		expect(PROVIDER_ENVIRONMENT_VARIABLE_CONSTANT.MAP[ELLMProvider.OPENAI]).toBe("OPENAI_API_KEY");
	});

	it("ANTHROPIC maps to ANTHROPIC_API_KEY", () => {
		expect(PROVIDER_ENVIRONMENT_VARIABLE_CONSTANT.MAP[ELLMProvider.ANTHROPIC]).toBe("ANTHROPIC_API_KEY");
	});
});
