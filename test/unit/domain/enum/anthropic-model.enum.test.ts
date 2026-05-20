import { describe, expect, it } from "vitest";

import { EAnthropicModel } from "@/domain/enum/anthropic-model.enum.js";

describe("anthropic-model.enum", () => {
	it("exports known model values", () => {
		expect(EAnthropicModel.CLAUDE_SONNET_4_5).toBe("claude-sonnet-4-5");
		expect(EAnthropicModel.CLAUDE_HAIKU_4_5).toBe("claude-haiku-4-5");
		expect(EAnthropicModel.CLAUDE_HAIKU_4_5_20251001).toBe("claude-haiku-4-5-20251001");
		expect(EAnthropicModel.CLAUDE_SONNET_4_6).toBe("claude-sonnet-4-6");
		expect(EAnthropicModel.CLAUDE_OPUS_4_7).toBe("claude-opus-4-7");
		expect(EAnthropicModel.CLAUDE_SONNET_4).toBe("claude-sonnet-4-0");
	});

	it("Object.values returns non-empty array", () => {
		expect(Object.values(EAnthropicModel).length).toBeGreaterThan(0);
	});
});
