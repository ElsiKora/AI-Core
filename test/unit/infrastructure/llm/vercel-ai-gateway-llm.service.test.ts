import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object.js";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum.js";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

vi.mock("ai", () => ({
	createGateway: () => (model: string) => model,
	generateText: vi.fn().mockResolvedValue({
		text: "Mocked Vercel AI Gateway response",
	}),
	streamText: vi.fn().mockReturnValue({
		textStream: (async function* (): AsyncGenerator<string> {
			yield "Mocked ";
			yield "Vercel AI Gateway response";
		})(),
	}),
}));

import { VercelAiGatewayLlmService } from "@/infrastructure/llm/vercel-ai-gateway-llm.service.js";

describe("VercelAiGatewayLlmService", () => {
	const service = new VercelAiGatewayLlmService();

	it("getName returns VERCEL_AI_GATEWAY", () => {
		expect(service.getName()).toBe(ELLMProvider.VERCEL_AI_GATEWAY);
	});

	it("generate returns text from mocked gateway", async () => {
		const credential = new Credential("vgw-key");
		const config = new LlmConfiguration(ELLMProvider.VERCEL_AI_GATEWAY, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		const result = await service.generate(messages, config);
		expect(result).toBe("Mocked Vercel AI Gateway response");
	});

	it("generateStream yields streaming chunks", async () => {
		const credential = new Credential("vgw-key");
		const config = new LlmConfiguration(ELLMProvider.VERCEL_AI_GATEWAY, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];
		const chunks: Array<string> = [];

		for await (const chunk of service.generateStream(messages, config)) {
			chunks.push(chunk);
		}

		expect(chunks).toEqual(["Mocked ", "Vercel AI Gateway response"]);
	});
});
