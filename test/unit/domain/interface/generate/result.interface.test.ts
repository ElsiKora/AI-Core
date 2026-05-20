import { describe, expect, it } from "vitest";

import type { IGenerateResult } from "@/domain/interface/generate/result.interface.js";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

describe("result.interface", () => {
	it("IGenerateResult has text, provider, model, attempts", () => {
		const result: IGenerateResult = {
			attempts: 1,
			model: "gpt-4o",
			provider: ELLMProvider.OPENAI,
			text: "Generated",
		};
		expect(result.text).toBe("Generated");
		expect(result.attempts).toBe(1);
	});
});
