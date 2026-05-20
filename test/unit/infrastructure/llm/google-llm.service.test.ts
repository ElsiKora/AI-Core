import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object";
import { EAiGoogleThinkingLevel } from "@/domain/enum/ai/provider/google/thinking-level.enum";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

vi.mock("@google/genai", () => ({
	GoogleGenAI: class MockGoogleGenAI {
		models = {
			generateContent: vi.fn().mockResolvedValue({
				text: "Mocked Google response",
			}),
			generateContentStream: vi.fn().mockResolvedValue(
				(async function* (): AsyncGenerator<{ text: string }> {
					yield { text: "Mocked " };
					yield { text: "Google response" };
				})(),
			),
		};
	},
}));

import { GoogleLlmService } from "@/infrastructure/service/llm/google-llm.service";

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

	it("generateStream yields chunks from mocked client", async () => {
		const credential = new Credential("ai-test-key");
		const config = new LlmConfiguration(ELLMProvider.GOOGLE, credential, "gemini-3.5-flash");
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];
		const chunks: Array<string> = [];

		for await (const chunk of service.generateStream(messages, config)) {
			chunks.push(chunk);
		}

		expect(chunks).toEqual(["Mocked ", "Google response"]);
	});

	it("rejects thinkingBudget with thinkingLevel", async () => {
		const credential = new Credential("ai-test-key");
		const config = new LlmConfiguration(ELLMProvider.GOOGLE, credential, "gemini-3.5-flash", undefined, undefined, undefined, undefined, {
			providerOptions: {
				google: {
					thinkingConfig: {
						thinkingBudget: 1024,
						thinkingLevel: EAiGoogleThinkingLevel.HIGH,
					},
				},
			},
		});
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		await expect(service.generate(messages, config)).rejects.toThrow("thinkingBudget and thinkingLevel");
	});
});
