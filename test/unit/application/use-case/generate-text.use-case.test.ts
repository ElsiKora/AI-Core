import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ILlmService } from "@/application/interface/llm-service.interface.js";
import type { IGenerateStreamChunk } from "@/domain/interface/generate/stream-chunk.interface.js";

import { Credential } from "@/domain/value-object/credential.value-object.js";
import { EGenerateMode } from "@/domain/enum/generate-mode.enum.js";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";
import { EProfileResolutionErrorCode } from "@/domain/enum/profile-resolution-error-code.enum.js";
import { ProfileResolutionError } from "@/domain/error/profile-resolution.error.js";

import { GenerateTextUseCase } from "@/application/use-case/generate-text.use-case.js";
import { EnsureProfileUseCase } from "@/application/use-case/ensure-profile.use-case.js";

describe("GenerateTextUseCase", () => {
	const mockGenerate = vi.fn().mockResolvedValue("Generated response");
	const mockGenerateStream = vi.fn().mockImplementation(async function* (): AsyncGenerator<string> {
		yield "Generated ";
		yield "response";
	});
	const mockLlmService: ILlmService = {
		getName: () => ELLMProvider.OPENAI,
		generate: (messages, configuration) => mockGenerate(messages, configuration),
		generateStream: (messages, configuration) => mockGenerateStream(messages, configuration),
	};
	const nonStreamingLlmService: ILlmService = {
		generate: (messages, configuration) => mockGenerate(messages, configuration),
		getName: () => ELLMProvider.OPENAI,
	};
	const mockResolveProfile = vi.fn();
	const useCase = new GenerateTextUseCase([mockLlmService], { execute: mockResolveProfile } as unknown as EnsureProfileUseCase);
	const nonStreamingUseCase = new GenerateTextUseCase([nonStreamingLlmService], { execute: mockResolveProfile } as unknown as EnsureProfileUseCase);

	beforeEach(() => {
		vi.clearAllMocks();
		mockGenerate.mockResolvedValue("Generated response");
		mockGenerateStream.mockImplementation(async function* (): AsyncGenerator<string> {
			yield "Generated ";
			yield "response";
		});
	});

	it("throws when profile is missing", async () => {
		mockResolveProfile.mockRejectedValue(
			new ProfileResolutionError({
				code: EProfileResolutionErrorCode.MISSING_PROFILE,
				message: "AI-Core profile 'commitizen' is missing",
				moduleId: "commitizen",
			}),
		);

		await expect(
			useCase.execute({
				mode: EGenerateMode.PROFILE,
				moduleId: "commitizen",
			}),
		).rejects.toThrow("AI-Core profile 'commitizen' is missing");
	});

	it("generates text with prompt when messages not provided", async () => {
		const credential = new Credential("sk-test");
		mockResolveProfile.mockResolvedValue({
			credential,
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 3,
			validationRetries: 3,
		});

		const result = await useCase.execute({
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
			prompt: "Hello",
		});

		expect(result.text).toBe("Generated response");
		expect(result.provider).toBe(ELLMProvider.OPENAI);
		expect(mockGenerate).toHaveBeenCalledWith([{ content: "Hello", role: ELLMMessageRole.USER }], expect.anything());
	});

	it("generates text with messages", async () => {
		const credential = new Credential("sk-test");
		mockResolveProfile.mockResolvedValue({
			credential,
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 3,
			validationRetries: 3,
		});

		const result = await useCase.execute({
			messages: [{ content: "Hi", role: ELLMMessageRole.USER }],
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
		});

		expect(result.text).toBe("Generated response");
		expect(mockGenerate).toHaveBeenCalledWith([{ content: "Hi", role: ELLMMessageRole.USER }], expect.anything());
	});

	it("throws when neither messages nor prompt provided", async () => {
		const credential = new Credential("sk-test");
		mockResolveProfile.mockResolvedValue({
			credential,
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 3,
			validationRetries: 3,
		});

		await expect(
			useCase.execute({
				mode: EGenerateMode.PROFILE,
				moduleId: "commitizen",
			}),
		).rejects.toThrow("Either 'messages' or 'prompt' must be provided");
	});

	it("throws when no LLM service for provider", async () => {
		const credential = new Credential("sk-test");
		mockResolveProfile.mockResolvedValue({
			credential,
			model: "claude-3",
			moduleId: "commitizen",
			provider: ELLMProvider.ANTHROPIC,
			retries: 3,
			validationRetries: 3,
		});

		await expect(
			useCase.execute({
				mode: EGenerateMode.PROFILE,
				moduleId: "commitizen",
				prompt: "Hi",
			}),
		).rejects.toThrow("No LLM service registered for provider 'anthropic'");
	});

	it("retries on failure", async () => {
		const credential = new Credential("sk-test");
		mockResolveProfile.mockResolvedValue({
			credential,
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 3,
			validationRetries: 3,
		});
		mockGenerate.mockRejectedValueOnce(new Error("Rate limit")).mockResolvedValueOnce("Success");

		const result = await useCase.execute({
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
			prompt: "Hi",
		});

		expect(result.text).toBe("Success");
		expect(result.attempts).toBe(2);
	});

	it("throws when provider returns empty text", async () => {
		const credential = new Credential("sk-test");
		mockResolveProfile.mockResolvedValue({
			credential,
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 3,
			validationRetries: 3,
		});
		mockGenerate.mockResolvedValue("   ");

		await expect(
			useCase.execute({
				mode: EGenerateMode.PROFILE,
				moduleId: "commitizen",
				prompt: "Hi",
			}),
		).rejects.toThrow("Provider returned empty text");
	});

	it("throws when retries are configured as zero", async () => {
		const credential = new Credential("sk-test");
		mockResolveProfile.mockResolvedValue({
			credential,
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 0,
			validationRetries: 3,
		});

		await expect(
			useCase.execute({
				mode: EGenerateMode.PROFILE,
				moduleId: "commitizen",
				prompt: "Hi",
			}),
		).rejects.toThrow("Invalid retries value '0'. Retries must be at least 1.");
	});

	it("supports direct mode without profile resolution", async () => {
		const result = await useCase.execute({
			credential: "sk-direct",
			mode: EGenerateMode.DIRECT,
			provider: ELLMProvider.OPENAI,
			prompt: "Hello direct",
		});

		expect(result.provider).toBe(ELLMProvider.OPENAI);
		expect(mockResolveProfile).not.toHaveBeenCalled();
		expect(mockGenerate).toHaveBeenCalledWith([{ content: "Hello direct", role: ELLMMessageRole.USER }], expect.anything());
	});

	it("throws when provider is missing in direct mode", async () => {
		await expect(
			useCase.execute({
				credential: "sk-direct",
				mode: EGenerateMode.DIRECT,
				prompt: "Hello direct",
			} as never),
		).rejects.toThrow("Field 'provider' is required for direct mode");
	});

	it("throws when credential is missing in direct mode", async () => {
		await expect(
			useCase.execute({
				mode: EGenerateMode.DIRECT,
				provider: ELLMProvider.OPENAI,
				prompt: "Hello direct",
			} as never),
		).rejects.toThrow("Field 'credential' is required for direct mode");
	});

	it("streams chunks when provider supports generateStream", async () => {
		const chunks: Array<IGenerateStreamChunk> = [];

		for await (const chunk of useCase.executeStream({
			mode: EGenerateMode.DIRECT,
			provider: ELLMProvider.OPENAI,
			credential: "sk-direct",
			prompt: "Hello stream",
		})) {
			chunks.push(chunk);
		}

		expect(chunks).toHaveLength(2);
		expect(chunks[0]?.delta).toBe("Generated ");
		expect(chunks[1]?.text).toBe("Generated response");
	});

	it("falls back to single chunk when provider does not support generateStream", async () => {
		const chunks: Array<IGenerateStreamChunk> = [];

		for await (const chunk of nonStreamingUseCase.executeStream({
			mode: EGenerateMode.DIRECT,
			provider: ELLMProvider.OPENAI,
			credential: "sk-direct",
			prompt: "Hello stream",
		})) {
			chunks.push(chunk);
		}

		expect(chunks).toHaveLength(1);
		expect(chunks[0]?.delta).toBe("Generated response");
	});
});
