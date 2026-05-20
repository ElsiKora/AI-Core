import { describe, expect, it } from "vitest";

import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum.js";

describe("llm-message-role.enum", () => {
	it("exports expected role values", () => {
		expect(ELLMMessageRole.ASSISTANT).toBe("assistant");
		expect(ELLMMessageRole.SYSTEM).toBe("system");
		expect(ELLMMessageRole.USER).toBe("user");
	});

	it("Object.values returns 3 roles", () => {
		expect(Object.values(ELLMMessageRole)).toHaveLength(3);
	});
});
