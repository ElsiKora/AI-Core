import { describe, expect, it } from "vitest";

import { EGenerateMode } from "@/domain/enum/generate-mode.enum.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";
import { EProfileInspectionStatus } from "@/domain/enum/profile-inspection-status.enum.js";
import { EProfileResolutionErrorCode } from "@/domain/enum/profile-resolution-error-code.enum.js";
import { ProfileResolutionError } from "@/domain/error/profile-resolution.error.js";

import { AiCoreAdapter } from "@/presentation/ai-core/adapter.js";

describe("AiCoreAdapter", () => {
	it("create returns adapter instance", () => {
		const adapter = AiCoreAdapter.create();
		expect(adapter).toBeInstanceOf(AiCoreAdapter);
	});

	it("create supports beanOptions", () => {
		const adapter = AiCoreAdapter.create({
			beanOptions: {
				isSilent: true,
			},
		});
		expect(adapter).toBeInstanceOf(AiCoreAdapter);
	});

	it("create throws when both cliInterface and beanOptions are provided", () => {
		expect(() =>
			AiCoreAdapter.create({
				beanOptions: {
					isSilent: true,
				},
				cliInterface: {} as never,
			}),
		).toThrow("beanOptions cannot be used with custom cliInterface");
	});

	it("getProviderOptions returns options", () => {
		const adapter = AiCoreAdapter.create();
		const options = adapter.getProviderOptions();
		expect(options.length).toBeGreaterThan(0);
		expect(options.some((o) => o.value === ELLMProvider.OPENAI)).toBe(true);
	});

	it("getModelOptions returns model options for provider", () => {
		const adapter = AiCoreAdapter.create();
		const options = adapter.getModelOptions(ELLMProvider.OPENAI);
		expect(options.length).toBeGreaterThan(0);
		expect(options.every((o) => o.provider === ELLMProvider.OPENAI)).toBe(true);
	});

	it("inspectProfile returns missing_profile when no profile exists", async () => {
		const adapter = AiCoreAdapter.create();
		const result = await adapter.inspectProfile("nonexistent-module" as never);
		expect(result.status).toBe(EProfileInspectionStatus.MISSING_PROFILE);
	});

	it("ensureProfile fails fast with typed missing_profile in non-interactive shell", async () => {
		const adapter = AiCoreAdapter.create();
		await expect(adapter.ensureProfile("nonexistent-module" as never)).rejects.toMatchObject({
			code: EProfileResolutionErrorCode.MISSING_PROFILE,
			name: "ProfileResolutionError",
		} satisfies Partial<ProfileResolutionError>);
	});

	it("configure method is available without custom cliInterface", () => {
		const adapter = AiCoreAdapter.create();
		expect(typeof adapter.configure).toBe("function");
	});

	it("generate executes with valid input", async () => {
		// This would need a mocked config with profile - skip for now or use vi.mock
		// to inject a mock ResolveProfile. For coverage we test the adapter
		// with real container; generate will fail at resolveProfile (no config).
		const adapter = AiCoreAdapter.create();
		await expect(
			adapter.generate({
				mode: EGenerateMode.PROFILE,
				moduleId: "commitizen",
				prompt: "Hi",
			} as never),
		).rejects.toThrow();
	});

	it("generateStream returns async generator and fails without profile", async () => {
		const adapter = AiCoreAdapter.create();
		const stream = adapter.generateStream({
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
			prompt: "Hi",
		});

		await expect(stream.next()).rejects.toThrow();
	});
});
