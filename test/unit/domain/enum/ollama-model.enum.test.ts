import { describe, expect, it } from "vitest";

import { EOllamaModel } from "@/domain/enum/ollama-model.enum";

describe("ollama-model.enum", () => {
	it("exports known model values", () => {
		expect(EOllamaModel.LLAMA3_3).toBeDefined();
		expect(EOllamaModel.DEEPSEEK_R1).toBe("deepseek-r1");
		expect(EOllamaModel.QWEN3_5).toBe("qwen3.5");
		expect(EOllamaModel.GPT_OSS).toBe("gpt-oss");
		expect(EOllamaModel.QWEN3_6).toBe("qwen3.6");
	});

	it("Object.values returns non-empty array", () => {
		expect(Object.values(EOllamaModel).length).toBeGreaterThan(0);
	});
});
