import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object.js";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum.js";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

import { OpenAiLlmService } from "@/infrastructure/llm/openai-llm.service.js";

vi.mock("openai", () => ({
	default: class MockOpenAI {
		chat = {
			completions: {
				create: vi.fn().mockImplementation((request: { stream?: boolean }) => {
					if (request.stream) {
						return Promise.resolve(
							(async function* (): AsyncGenerator<{ choices: Array<{ delta?: { content?: string } }> }> {
								yield { choices: [{ delta: { content: "Mocked " } }] };
								yield { choices: [{ delta: { content: "OpenAI response" } }] };
							})(),
						);
					}

					return Promise.resolve({
						choices: [{ message: { content: "Mocked OpenAI response" } }],
					});
				}),
			},
		};
	},
}));

describe("OpenAiLlmService", () => {
	const service = new OpenAiLlmService();

	it("getName returns OPENAI", () => {
		expect(service.getName()).toBe(ELLMProvider.OPENAI);
	});

	it("generate returns text from mocked client", async () => {
		const credential = new Credential("sk-test");
		const config = new LlmConfiguration(ELLMProvider.OPENAI, credential, "gpt-4o");
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		const result = await service.generate(messages, config);
		expect(result).toBe("Mocked OpenAI response");
	});

	it("generateStream yields streaming chunks", async () => {
		const credential = new Credential("sk-test");
		const config = new LlmConfiguration(ELLMProvider.OPENAI, credential, "gpt-4o");
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];
		const chunks: Array<string> = [];

		for await (const chunk of service.generateStream(messages, config)) {
			chunks.push(chunk);
		}

		expect(chunks).toEqual(["Mocked ", "OpenAI response"]);
	});
});
