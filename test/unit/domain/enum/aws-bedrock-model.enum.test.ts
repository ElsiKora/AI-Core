import { describe, expect, it } from "vitest";

import { EAWSBedrockModel } from "@/domain/enum/aws-bedrock-model.enum.js";

describe("aws-bedrock-model.enum", () => {
	it("exports known model values", () => {
		expect(EAWSBedrockModel.CLAUDE_SONNET_4_5).toBeDefined();
		expect(EAWSBedrockModel.CLAUDE_SONNET_4_6).toBe("anthropic.claude-sonnet-4-6");
		expect(EAWSBedrockModel.CLAUDE_OPUS_4_7).toBe("anthropic.claude-opus-4-7");
		expect(EAWSBedrockModel.NOVA_2_LITE).toBe("amazon.nova-2-lite-v1:0");
		expect(EAWSBedrockModel.NOVA_PRO).toBe("amazon.nova-pro-v1:0");
	});

	it("Object.values returns non-empty array", () => {
		expect(Object.values(EAWSBedrockModel).length).toBeGreaterThan(0);
	});
});
