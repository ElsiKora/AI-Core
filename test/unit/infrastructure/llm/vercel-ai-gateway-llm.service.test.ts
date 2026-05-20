import { beforeEach, describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

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

import { generateText, streamText } from "ai";

import { VercelAiGatewayLlmService } from "@/infrastructure/service/llm/vercel-ai-gateway-llm.service";

describe("VercelAiGatewayLlmService", () => {
	const service = new VercelAiGatewayLlmService();

	beforeEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
		vi.mocked(generateText).mockResolvedValue({
			text: "Mocked Vercel AI Gateway response",
		} as Awaited<ReturnType<typeof generateText>>);
		vi.mocked(streamText).mockReturnValue({
			textStream: (async function* (): AsyncGenerator<string> {
				yield "Mocked ";
				yield "Vercel AI Gateway response";
			})(),
		} as unknown as ReturnType<typeof streamText>);
	});

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

	it("keeps raw provider options when typed Vercel shortcuts are absent", async () => {
		const credential = new Credential("vgw-key");
		const config = new LlmConfiguration(ELLMProvider.VERCEL_AI_GATEWAY, credential, undefined, undefined, undefined, undefined, undefined, {
			providerOptions: {
				vercelAiGateway: {
					providerOptions: {
						openai: {
							customSetting: "value",
						},
					},
				},
			},
		});
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		await service.generate(messages, config);

		expect(vi.mocked(generateText).mock.calls[0]?.[0]).toMatchObject({
			providerOptions: {
				openai: {
					customSetting: "value",
				},
			},
		});
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

	it("wraps provider errors with readable messages", async () => {
		vi.mocked(generateText).mockRejectedValueOnce(new Error("Unauthorized"));

		const credential = new Credential("invalid-key");
		const config = new LlmConfiguration(ELLMProvider.VERCEL_AI_GATEWAY, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		await expect(service.generate(messages, config)).rejects.toThrow("Vercel AI Gateway generation failed: Unauthorized");
	});

	it("detects authentication errors from wrapped provider messages", () => {
		expect(service.isAuthenticationError(new Error("Vercel AI Gateway generation failed: Unauthorized"))).toBe(true);
		expect(service.isAuthenticationError(new Error("Vercel AI Gateway generation failed: Rate limit"))).toBe(false);
	});

	it("times out hanging provider requests", async () => {
		vi.useFakeTimers();
		vi.mocked(generateText).mockReturnValueOnce(new Promise(() => undefined) as ReturnType<typeof generateText>);

		const credential = new Credential("vgw-key");
		const config = new LlmConfiguration(ELLMProvider.VERCEL_AI_GATEWAY, credential, undefined, undefined, undefined, undefined, undefined, { timeoutMs: 10 });
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];
		const generation = service.generate(messages, config);
		const expectation = expect(generation).rejects.toThrow("Vercel AI Gateway generation timed out after 10ms.");

		await vi.advanceTimersByTimeAsync(10);
		await expectation;
		vi.useRealTimers();
	});

	it("times out hanging provider streams", async () => {
		vi.useFakeTimers();
		vi.mocked(streamText).mockReturnValueOnce({
			textStream: (async function* (): AsyncGenerator<string> {
				await new Promise(() => undefined);
			})(),
		} as unknown as ReturnType<typeof streamText>);

		const credential = new Credential("vgw-key");
		const config = new LlmConfiguration(ELLMProvider.VERCEL_AI_GATEWAY, credential, undefined, undefined, undefined, undefined, undefined, { timeoutMs: 10 });
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];
		const chunks: Array<string> = [];
		const iteration = (async (): Promise<void> => {
			for await (const chunk of service.generateStream(messages, config)) {
				chunks.push(chunk);
			}
		})();
		const expectation = expect(iteration).rejects.toThrow("Vercel AI Gateway stream failed: Vercel AI Gateway stream timed out after 10ms.");

		await vi.advanceTimersByTimeAsync(10);
		await expectation;
		expect(chunks).toEqual([]);
		vi.useRealTimers();
	});
});
