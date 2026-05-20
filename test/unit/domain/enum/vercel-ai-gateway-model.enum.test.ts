import { describe, expect, it } from "vitest";

import { EVercelAiGatewayModel } from "@/domain/enum/vercel-ai-gateway-model.enum";

describe("vercel-ai-gateway-model.enum", () => {
	it("exports known model values", () => {
		expect(EVercelAiGatewayModel.OPENAI_GPT_4O).toBeDefined();
		expect(EVercelAiGatewayModel.OPENAI_GPT_5_3_CODEX).toBe("openai/gpt-5.3-codex");
		expect(EVercelAiGatewayModel.OPENAI_GPT_5_5).toBe("openai/gpt-5.5");
		expect(EVercelAiGatewayModel.ANTHROPIC_CLAUDE_SONNET_4_5).toBe("anthropic/claude-sonnet-4.5");
		expect(EVercelAiGatewayModel.GOOGLE_GEMINI_3_5_FLASH).toBe("google/gemini-3.5-flash");
		expect(EVercelAiGatewayModel.XAI_GROK_4_FAST_REASONING).toBe("xai/grok-4-fast-reasoning");
	});

	it("Object.values returns non-empty array", () => {
		expect(Object.values(EVercelAiGatewayModel).length).toBeGreaterThan(0);
	});
});
