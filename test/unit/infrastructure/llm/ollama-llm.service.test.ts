import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object.js";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum.js";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

vi.mock("openai", () => ({
	default: class MockOpenAI {
		chat = {
			completions: {
				create: vi.fn().mockImplementation((request: { stream?: boolean }) => {
					if (request.stream) {
						return Promise.resolve(
							(async function* (): AsyncGenerator<{ choices: Array<{ delta?: { content?: string } }> }> {
								yield { choices: [{ delta: { content: "Mocked " } }] };
								yield { choices: [{ delta: { content: "Ollama response" } }] };
							})(),
						);
					}

					return Promise.resolve({
						choices: [{ message: { content: "Mocked Ollama response" } }],
					});
				}),
			},
		};
	},
}));

import { OllamaLlmService } from "@/infrastructure/llm/ollama-llm.service.js";

describe("OllamaLlmService", () => {
	const service = new OllamaLlmService();

	it("getName returns OLLAMA", () => {
		expect(service.getName()).toBe(ELLMProvider.OLLAMA);
	});

	it("generate returns text with host:port credential", async () => {
		const credential = new Credential("http://localhost:11434");
		const config = new LlmConfiguration(ELLMProvider.OLLAMA, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		const result = await service.generate(messages, config);
		expect(result).toBe("Mocked Ollama response");
	});

	it("parseEndpoint adds http when missing", async () => {
		const credential = new Credential("localhost:11434");
		const config = new LlmConfiguration(ELLMProvider.OLLAMA, credential);
		const messages = [{ content: "Hi", role: ELLMMessageRole.USER }];

		await expect(service.generate(messages, config)).resolves.toBe("Mocked Ollama response");
	});

	it("throws when credential lacks host", async () => {
		const credential = new Credential("|"); // split gives rawEndpoint = ""
		const config = new LlmConfiguration(ELLMProvider.OLLAMA, credential);
		const messages = [{ content: "Hi", role: ELLMMessageRole.USER }];

		await expect(service.generate(messages, config)).rejects.toThrow("host:port");
	});

	it("generateStream yields streaming chunks", async () => {
		const credential = new Credential("http://localhost:11434");
		const config = new LlmConfiguration(ELLMProvider.OLLAMA, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];
		const chunks: Array<string> = [];

		for await (const chunk of service.generateStream(messages, config)) {
			chunks.push(chunk);
		}

		expect(chunks).toEqual(["Mocked ", "Ollama response"]);
	});
});
