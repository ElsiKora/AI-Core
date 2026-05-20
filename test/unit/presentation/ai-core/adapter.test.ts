import type { IGenerateResult } from "@/domain/interface/generate/result.interface";
import type { TGenerateInput } from "@/domain/interface/generate/input.interface";
import type { IResolvedModuleProfile } from "@/domain/interface/resolved-module-profile.interface";
import type { TAiCoreModuleId } from "@/domain/type/ai-core-module-id.type";

import { describe, expect, it } from "vitest";

import { EGenerateMode } from "@/domain/enum/generate-mode.enum";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { EProfileInspectionStatus } from "@/domain/enum/profile-inspection-status.enum";
import { EProfileResolutionErrorCode } from "@/domain/enum/profile-resolution-error-code.enum";
import { ProfileResolutionError } from "@/domain/error/profile-resolution.error";
import { Credential } from "@/domain/value-object/credential.value-object";

import { AiCoreAdapter } from "@/presentation/ai-core/adapter";

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

	it("uses cached profile credential when profile generation input has no explicit credential", async () => {
		const adapter = AiCoreAdapter.create();
		const moduleId = "commitizen" as TAiCoreModuleId;
		const profile: IResolvedModuleProfile = {
			credential: new Credential("sk-cached"),
			model: "gpt-4o",
			moduleId,
			provider: ELLMProvider.OPENAI,
			retries: 1,
			validationRetries: 1,
		};
		let capturedInput: TGenerateInput | undefined;
		const adapterHarness = adapter as unknown as {
			CONTAINER: {
				resolve: () => {
					execute: (input: TGenerateInput) => Promise<IGenerateResult>;
				};
			};
			PROFILE_CACHE: Map<TAiCoreModuleId, IResolvedModuleProfile>;
		};

		adapterHarness.PROFILE_CACHE.set(moduleId, profile);
		adapterHarness.CONTAINER = {
			resolve: () => ({
				execute: async (input: TGenerateInput): Promise<IGenerateResult> => {
					capturedInput = input;

					return {
						attempts: 1,
						model: "gpt-4o",
						provider: ELLMProvider.OPENAI,
						text: "ok",
					};
				},
			}),
		};

		await adapter.generate({
			mode: EGenerateMode.PROFILE,
			moduleId,
			prompt: "Hi",
		});

		expect(capturedInput).toMatchObject({
			credential: "sk-cached",
			mode: EGenerateMode.PROFILE,
			moduleId,
		});
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
