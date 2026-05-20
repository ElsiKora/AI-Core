import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

vi.mock("openai", () => ({
	default: class MockOpenAI {
		chat = {
			completions: {
				create: vi.fn().mockImplementation((request: { stream?: boolean }) => {
					if (request.stream) {
						return Promise.resolve(
							(async function* (): AsyncGenerator<{ choices: Array<{ delta?: { content?: string } }> }> {
								yield { choices: [{ delta: { content: "Mocked Azure " } }] };
								yield { choices: [{ delta: { content: "OpenAI response" } }] };
							})(),
						);
					}

					return Promise.resolve({
						choices: [{ message: { content: "Mocked Azure OpenAI response" } }],
					});
				}),
			},
		};
	},
}));

import { AzureOpenAiLlmService } from "@/infrastructure/service/llm/azure-openai-llm.service";

describe("AzureOpenAiLlmService", () => {
	const service = new AzureOpenAiLlmService();

	it("getName returns AZURE_OPENAI", () => {
		expect(service.getName()).toBe(ELLMProvider.AZURE_OPENAI);
	});

	it("generate returns text with endpoint|apiKey|deployment format", async () => {
		const credential = new Credential("https://my.resource|key123|gpt-4o");
		const config = new LlmConfiguration(ELLMProvider.AZURE_OPENAI, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		const result = await service.generate(messages, config);
		expect(result).toBe("Mocked Azure OpenAI response");
	});

	it("throws when credential format is invalid", async () => {
		const credential = new Credential("incomplete");
		const config = new LlmConfiguration(ELLMProvider.AZURE_OPENAI, credential);
		const messages = [{ content: "Hi", role: ELLMMessageRole.USER }];

		await expect(service.generate(messages, config)).rejects.toThrow("endpoint|api-key|deployment-name");
	});

	it("generateStream yields streaming chunks", async () => {
		const credential = new Credential("https://my.resource|key123|gpt-4o");
		const config = new LlmConfiguration(ELLMProvider.AZURE_OPENAI, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];
		const chunks: Array<string> = [];

		for await (const chunk of service.generateStream(messages, config)) {
			chunks.push(chunk);
		}

		expect(chunks).toEqual(["Mocked Azure ", "OpenAI response"]);
	});
});
