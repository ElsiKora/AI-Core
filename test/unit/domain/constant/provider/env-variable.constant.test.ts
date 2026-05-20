import { describe, expect, it } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

import { PROVIDER_ENV_VARIABLE_MAP } from "@/domain/constant/provider/env-variable.constant.js";

describe("env-variable.constant", () => {
	it("provides env variable name for every ELLMProvider", () => {
		const providers = Object.values(ELLMProvider);

		for (const provider of providers) {
			const envVar = PROVIDER_ENV_VARIABLE_MAP[provider];
			expect(envVar).toBeDefined();
			expect(typeof envVar).toBe("string");
			expect(envVar).toMatch(/^[A-Z][A-Z0-9_]+$/);
		}
	});

	it("OPENAI maps to OPENAI_API_KEY", () => {
		expect(PROVIDER_ENV_VARIABLE_MAP[ELLMProvider.OPENAI]).toBe("OPENAI_API_KEY");
	});

	it("ANTHROPIC maps to ANTHROPIC_API_KEY", () => {
		expect(PROVIDER_ENV_VARIABLE_MAP[ELLMProvider.ANTHROPIC]).toBe("ANTHROPIC_API_KEY");
	});
});
