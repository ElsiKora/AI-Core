import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ILlmService } from "@/application/interface/llm-service.interface";
import type { IGenerateStreamChunk } from "@/domain/interface/generate/stream-chunk.interface";

import { PromptCredentialUseCase } from "@/application/use-case/prompt-credential.use-case";
import { Credential } from "@/domain/value-object/credential.value-object";
import { EGenerateMode } from "@/domain/enum/generate-mode.enum";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { EProfileResolutionErrorCode } from "@/domain/enum/profile-resolution-error-code.enum";
import { ProfileResolutionError } from "@/domain/error/profile-resolution.error";

import { GenerateTextUseCase } from "@/application/use-case/generate-text.use-case";
import { EnsureProfileUseCase } from "@/application/use-case/ensure-profile.use-case";

describe("GenerateTextUseCase", () => {
	const mockGenerate = vi.fn().mockResolvedValue("Generated response");
	const mockGenerateStream = vi.fn().mockImplementation(async function* (): AsyncGenerator<string> {
		yield "Generated ";
		yield "response";
	});
	const mockIsAuthenticationError = vi.fn().mockReturnValue(false);
	const mockLlmService: ILlmService = {
		getName: () => ELLMProvider.OPENAI,
		generate: (messages, configuration) => mockGenerate(messages, configuration),
		generateStream: (messages, configuration) => mockGenerateStream(messages, configuration),
		isAuthenticationError: (error) => mockIsAuthenticationError(error),
	};
	const nonStreamingLlmService: ILlmService = {
		generate: (messages, configuration) => mockGenerate(messages, configuration),
		getName: () => ELLMProvider.OPENAI,
		isAuthenticationError: (error) => mockIsAuthenticationError(error),
	};
	const mockResolveProfile = vi.fn();
	const mockPromptCredential = vi.fn().mockResolvedValue(new Credential("sk-reprompted"));
	const mockInteractiveShell = {
		isInteractive: vi.fn().mockReturnValue(true),
	};
	const useCase = new GenerateTextUseCase([mockLlmService], { execute: mockResolveProfile } as unknown as EnsureProfileUseCase, { execute: mockPromptCredential } as unknown as PromptCredentialUseCase, mockInteractiveShell);
	const nonStreamingUseCase = new GenerateTextUseCase([nonStreamingLlmService], { execute: mockResolveProfile } as unknown as EnsureProfileUseCase, { execute: mockPromptCredential } as unknown as PromptCredentialUseCase, mockInteractiveShell);

	beforeEach(() => {
		mockGenerate.mockReset();
		mockGenerateStream.mockReset();
		mockIsAuthenticationError.mockReset();
		mockPromptCredential.mockReset();
		mockResolveProfile.mockReset();
		mockInteractiveShell.isInteractive.mockReset();
		mockGenerate.mockResolvedValue("Generated response");
		mockGenerateStream.mockImplementation(async function* (): AsyncGenerator<string> {
			yield "Generated ";
			yield "response";
		});
		mockIsAuthenticationError.mockReturnValue(false);
		mockPromptCredential.mockResolvedValue(new Credential("sk-reprompted"));
		mockInteractiveShell.isInteractive.mockReturnValue(true);
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

	it("passes explicit profile credential into profile resolution", async () => {
		mockResolveProfile.mockImplementation(async (_moduleId: string, runtimeCredential?: Credential): Promise<unknown> => ({
			credential: runtimeCredential ?? new Credential("sk-env"),
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 1,
			validationRetries: 3,
		}));

		const result = await useCase.execute({
			credential: "sk-explicit",
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
			prompt: "Hello",
		});
		const runtimeCredential: Credential | undefined = mockResolveProfile.mock.calls[0]?.[1];

		expect(result.text).toBe("Generated response");
		expect(runtimeCredential?.getValue()).toBe("sk-explicit");
		expect(mockGenerate.mock.calls[0]?.[1].getCredential().getValue()).toBe("sk-explicit");
	});

	it("keeps profile generation options when request omits them", async () => {
		mockResolveProfile.mockResolvedValue({
			credential: new Credential("sk-env"),
			maxTokens: 512,
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 1,
			shouldRepromptCredentialOnAuthenticationFailure: true,
			temperature: 0.1,
			timeoutMs: 10_000,
			validationRetries: 3,
		});

		await useCase.execute({
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
			prompt: "Hello",
		});

		const options = mockGenerate.mock.calls[0]?.[1].getGenerationOptions();

		expect(options.maxTokens).toBe(512);
		expect(options.shouldRepromptCredentialOnAuthenticationFailure).toBe(true);
		expect(options.temperature).toBe(0.1);
		expect(options.timeoutMs).toBe(10_000);
	});

	it("lets request generation options override profile generation options", async () => {
		mockResolveProfile.mockResolvedValue({
			credential: new Credential("sk-env"),
			maxTokens: 512,
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 1,
			temperature: 0.1,
			timeoutMs: 10_000,
			validationRetries: 3,
		});

		await useCase.execute({
			maxTokens: 1024,
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
			prompt: "Hello",
			temperature: 0.2,
			timeoutMs: 20_000,
		});

		const options = mockGenerate.mock.calls[0]?.[1].getGenerationOptions();

		expect(options.maxTokens).toBe(1024);
		expect(options.temperature).toBe(0.2);
		expect(options.timeoutMs).toBe(20_000);
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

	it("reprompts credential and retries profile generation when environment credential is invalid", async () => {
		const credential = new Credential("sk-invalid-env");

		mockResolveProfile.mockResolvedValue({
			credential,
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 1,
			shouldRepromptCredentialOnAuthenticationFailure: true,
			validationRetries: 3,
		});
		mockGenerate.mockRejectedValueOnce(new Error("Unauthorized")).mockResolvedValueOnce("Success");
		mockIsAuthenticationError.mockReturnValueOnce(true);

		const result = await useCase.execute({
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
			prompt: "Hi",
		});

		expect(result.text).toBe("Success");
		expect(result.attempts).toBe(2);
		expect(mockPromptCredential).toHaveBeenCalledWith(ELLMProvider.OPENAI, true);
		expect(mockGenerate.mock.calls[0]?.[1].getCredential().getValue()).toBe("sk-invalid-env");
		expect(mockGenerate.mock.calls[1]?.[1].getCredential().getValue()).toBe("sk-reprompted");
	});

	it("reprompts credential and retries direct generation when explicit credential is invalid", async () => {
		mockGenerate.mockRejectedValueOnce(new Error("Unauthorized")).mockResolvedValueOnce("Success");
		mockIsAuthenticationError.mockReturnValueOnce(true);

		const result = await useCase.execute({
			credential: "sk-invalid-direct",
			mode: EGenerateMode.DIRECT,
			provider: ELLMProvider.OPENAI,
			prompt: "Hello direct",
			retries: 1,
			shouldRepromptCredentialOnAuthenticationFailure: true,
		});

		expect(result.text).toBe("Success");
		expect(result.attempts).toBe(2);
		expect(mockPromptCredential).toHaveBeenCalledWith(ELLMProvider.OPENAI, true);
		expect(mockResolveProfile).not.toHaveBeenCalled();
		expect(mockGenerate.mock.calls[0]?.[1].getCredential().getValue()).toBe("sk-invalid-direct");
		expect(mockGenerate.mock.calls[1]?.[1].getCredential().getValue()).toBe("sk-reprompted");
	});

	it("does not reprompt credential when authentication reprompt option is disabled", async () => {
		mockGenerate.mockRejectedValue(new Error("Unauthorized"));
		mockIsAuthenticationError.mockReturnValue(true);

		await expect(
			useCase.execute({
				credential: "sk-invalid-direct",
				mode: EGenerateMode.DIRECT,
				provider: ELLMProvider.OPENAI,
				prompt: "Hello direct",
				retries: 1,
			}),
		).rejects.toThrow("Generation failed after 1 retries: Unauthorized");

		expect(mockPromptCredential).not.toHaveBeenCalled();
	});

	it("does not reprompt credential in non-interactive shell", async () => {
		mockGenerate.mockRejectedValue(new Error("Unauthorized"));
		mockIsAuthenticationError.mockReturnValue(true);
		mockInteractiveShell.isInteractive.mockReturnValue(false);

		await expect(
			useCase.execute({
				credential: "sk-invalid-direct",
				mode: EGenerateMode.DIRECT,
				provider: ELLMProvider.OPENAI,
				prompt: "Hello direct",
				retries: 1,
				shouldRepromptCredentialOnAuthenticationFailure: true,
			}),
		).rejects.toThrow("Generation failed after 1 retries: Unauthorized");

		expect(mockPromptCredential).not.toHaveBeenCalled();
	});

	it("reprompts credential only once when replacement credential is still invalid", async () => {
		mockGenerate.mockRejectedValue(new Error("Unauthorized"));
		mockIsAuthenticationError.mockReturnValue(true);

		await expect(
			useCase.execute({
				credential: "sk-invalid-direct",
				mode: EGenerateMode.DIRECT,
				provider: ELLMProvider.OPENAI,
				prompt: "Hello direct",
				retries: 1,
				shouldRepromptCredentialOnAuthenticationFailure: true,
			}),
		).rejects.toThrow("Generation failed after 1 retries: Unauthorized");

		expect(mockPromptCredential).toHaveBeenCalledTimes(1);
		expect(mockGenerate).toHaveBeenCalledTimes(2);
		expect(mockGenerate.mock.calls[1]?.[1].getCredential().getValue()).toBe("sk-reprompted");
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

	it("times out generation when timeoutMs is configured", async () => {
		vi.useFakeTimers();
		mockGenerate.mockReturnValue(new Promise<string>(() => undefined));

		const generation = useCase.execute({
			credential: "sk-direct",
			mode: EGenerateMode.DIRECT,
			provider: ELLMProvider.OPENAI,
			prompt: "Hello direct",
			retries: 1,
			timeoutMs: 10,
		});
		const expectation = expect(generation).rejects.toThrow("Generation timed out after 10ms.");

		await vi.advanceTimersByTimeAsync(10);
		await expectation;
		vi.useRealTimers();
	});

	it("validates timeout before starting provider generation", async () => {
		await expect(
			useCase.execute({
				credential: "sk-direct",
				mode: EGenerateMode.DIRECT,
				provider: ELLMProvider.OPENAI,
				prompt: "Hello direct",
				timeoutMs: 0,
			}),
		).rejects.toThrow("Invalid timeoutMs value '0'. Timeout must be greater than 0.");
		expect(mockGenerate).not.toHaveBeenCalled();
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

	it("times out provider streams when timeoutMs is configured", async () => {
		vi.useFakeTimers();
		mockGenerateStream.mockImplementation(async function* (): AsyncGenerator<string> {
			await new Promise(() => undefined);
		});
		const chunks: Array<IGenerateStreamChunk> = [];
		const stream = useCase.executeStream({
			credential: "sk-direct",
			mode: EGenerateMode.DIRECT,
			provider: ELLMProvider.OPENAI,
			prompt: "Hello stream",
			retries: 1,
			timeoutMs: 10,
		});
		const iteration = (async (): Promise<void> => {
			for await (const chunk of stream) {
				chunks.push(chunk);
			}
		})();
		const expectation = expect(iteration).rejects.toThrow("Generation stream timed out after 10ms.");

		await vi.advanceTimersByTimeAsync(10);
		await expectation;
		expect(chunks).toEqual([]);
		vi.useRealTimers();
	});

	it("reprompts credential and retries stream generation before partial output", async () => {
		mockGenerateStream
			.mockImplementationOnce(async function* (): AsyncGenerator<string> {
				throw new Error("Unauthorized");
			})
			.mockImplementationOnce(async function* (): AsyncGenerator<string> {
				yield "Success";
			});
		mockIsAuthenticationError.mockReturnValueOnce(true);
		const chunks: Array<IGenerateStreamChunk> = [];

		for await (const chunk of useCase.executeStream({
			credential: "sk-invalid-direct",
			mode: EGenerateMode.DIRECT,
			provider: ELLMProvider.OPENAI,
			prompt: "Hello stream",
			retries: 1,
			shouldRepromptCredentialOnAuthenticationFailure: true,
		})) {
			chunks.push(chunk);
		}

		expect(chunks).toHaveLength(1);
		expect(chunks[0]?.attempt).toBe(2);
		expect(chunks[0]?.text).toBe("Success");
		expect(mockPromptCredential).toHaveBeenCalledWith(ELLMProvider.OPENAI, true);
		expect(mockGenerateStream.mock.calls[0]?.[1].getCredential().getValue()).toBe("sk-invalid-direct");
		expect(mockGenerateStream.mock.calls[1]?.[1].getCredential().getValue()).toBe("sk-reprompted");
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
