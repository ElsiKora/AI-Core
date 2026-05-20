import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object";
import { EAiResponseFormatType } from "@/domain/enum/ai/response-format-type.enum";
import { EAiToolType } from "@/domain/enum/ai/tool/type.enum";
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
								yield { choices: [{ delta: { content: "Mocked " } }] };
								yield { choices: [{ delta: { content: "Cerebras response" } }] };
							})(),
						);
					}

					return Promise.resolve({
						choices: [{ message: { content: "Mocked Cerebras response" } }],
					});
				}),
			},
		};
	},
}));

import { CerebrasLlmService } from "@/infrastructure/service/llm/cerebras-llm.service";

describe("CerebrasLlmService", () => {
	const service = new CerebrasLlmService();

	it("getName returns CEREBRAS", () => {
		expect(service.getName()).toBe(ELLMProvider.CEREBRAS);
	});

	it("generate returns text from mocked client", async () => {
		const credential = new Credential("cerebras-key");
		const config = new LlmConfiguration(ELLMProvider.CEREBRAS, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		const result = await service.generate(messages, config);
		expect(result).toBe("Mocked Cerebras response");
	});

	it("generateStream yields streaming chunks", async () => {
		const credential = new Credential("cerebras-key");
		const config = new LlmConfiguration(ELLMProvider.CEREBRAS, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];
		const chunks: Array<string> = [];

		for await (const chunk of service.generateStream(messages, config)) {
			chunks.push(chunk);
		}

		expect(chunks).toEqual(["Mocked ", "Cerebras response"]);
	});

	it("rejects tools with responseFormat", async () => {
		const credential = new Credential("cerebras-key");
		const config = new LlmConfiguration(ELLMProvider.CEREBRAS, credential, undefined, undefined, undefined, undefined, undefined, {
			responseFormat: { type: EAiResponseFormatType.JSON_OBJECT },
			tools: [{ name: "lookup", type: EAiToolType.FUNCTION }],
		});
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		await expect(service.generate(messages, config)).rejects.toThrow("tools and responseFormat");
	});
});
