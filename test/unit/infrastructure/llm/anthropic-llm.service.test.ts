import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

vi.mock("@anthropic-ai/sdk", () => ({
	default: class MockAnthropic {
		messages = {
			create: vi.fn().mockResolvedValue({
				content: [{ type: "text", text: "Mocked Anthropic response" }],
			}),
		};
	},
}));

import { AnthropicLlmService } from "@/infrastructure/service/llm/anthropic-llm.service";

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

	it("rejects Opus 4.7 sampling overrides", async () => {
		const credential = new Credential("sk-ant-test");
		const config = new LlmConfiguration(ELLMProvider.ANTHROPIC, credential, "claude-opus-4-7", undefined, 0.4);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		await expect(service.generate(messages, config)).rejects.toThrow("Opus 4.7");
	});
});
