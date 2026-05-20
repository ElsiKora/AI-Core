import { describe, expect, it } from "vitest";

import { ECerebrasModel } from "@/domain/enum/cerebras-model.enum";

describe("cerebras-model.enum", () => {
	it("exports known model values", () => {
		expect(ECerebrasModel.LLAMA_3_1_8B).toBeDefined();
		expect(ECerebrasModel.QWEN_3_235B).toBe("qwen-3-235b-a22b-instruct-2507");
		expect(ECerebrasModel.ZAI_GLM_4_7).toBe("zai-glm-4.7");
	});

	it("Object.values returns non-empty array", () => {
		expect(Object.values(ECerebrasModel).length).toBeGreaterThan(0);
	});
});
