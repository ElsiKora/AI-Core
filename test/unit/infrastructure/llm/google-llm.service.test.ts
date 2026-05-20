import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object.js";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum.js";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: class MockGoogleGenerativeAI {
		getGenerativeModel = vi.fn().mockReturnValue({
			generateContent: vi.fn().mockResolvedValue({
				response: {
					text: vi.fn().mockReturnValue("Mocked Google response"),
				},
			}),
		});
	},
}));

import { GoogleLlmService } from "@/infrastructure/llm/google-llm.service.js";

describe("GoogleLlmService", () => {
	const service = new GoogleLlmService();

	it("getName returns GOOGLE", () => {
		expect(service.getName()).toBe(ELLMProvider.GOOGLE);
	});

	it("generate returns text from mocked client", async () => {
		const credential = new Credential("ai-test-key");
		const config = new LlmConfiguration(ELLMProvider.GOOGLE, credential, "gemini-2");
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		const result = await service.generate(messages, config);
		expect(result).toBe("Mocked Google response");
	});
});
