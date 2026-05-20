import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object.js";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum.js";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

vi.mock("@anthropic-ai/sdk", () => ({
	default: class MockAnthropic {
		messages = {
			create: vi.fn().mockResolvedValue({
				content: [{ type: "text", text: "Mocked Anthropic response" }],
			}),
		};
	},
}));

import { AnthropicLlmService } from "@/infrastructure/llm/anthropic-llm.service.js";

describe("AnthropicLlmService", () => {
	const service = new AnthropicLlmService();

	it("getName returns ANTHROPIC", () => {
		expect(service.getName()).toBe(ELLMProvider.ANTHROPIC);
	});

	it("generate returns text from mocked client", async () => {
		const credential = new Credential("sk-ant-test");
		const config = new LlmConfiguration(ELLMProvider.ANTHROPIC, credential, "claude-3");
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		const result = await service.generate(messages, config);
		expect(result).toBe("Mocked Anthropic response");
	});
});
