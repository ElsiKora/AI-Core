import { describe, expect, it } from "vitest";

import { EOpenAIModel } from "@/domain/enum/openai-model.enum.js";

describe("openai-model.enum", () => {
	it("exports known model values", () => {
		expect(EOpenAIModel.GPT_4O).toBe("gpt-4o");
		expect(EOpenAIModel.GPT_5_2).toBe("gpt-5.2");
		expect(EOpenAIModel.GPT_5_5).toBe("gpt-5.5");
		expect(EOpenAIModel.GPT_5_PRO).toBe("gpt-5-pro");
		expect(EOpenAIModel.GPT_5_3_CODEX).toBe("gpt-5.3-codex");
		expect(EOpenAIModel.O3_PRO).toBe("o3-pro");
	});

	it("Object.values returns non-empty array", () => {
		expect(Object.values(EOpenAIModel).length).toBeGreaterThan(0);
	});
});
