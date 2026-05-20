import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IInteractiveShellService } from "@/application/interface/interactive-shell-service.interface";
import type { ConfigureLlmUseCase } from "@/application/use-case/configure-llm.use-case";
import type { InspectProfileUseCase } from "@/application/use-case/inspect-profile.use-case";
import type { PromptCredentialUseCase } from "@/application/use-case/prompt-credential.use-case";

import { EProfileInspectionStatus } from "@/domain/enum/profile-inspection-status.enum";
import { EProfileResolutionErrorCode } from "@/domain/enum/profile-resolution-error-code.enum";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { ProfileResolutionError } from "@/domain/error/profile-resolution.error";
import { Credential } from "@/domain/value-object/credential.value-object";

import { EnsureProfileUseCase } from "@/application/use-case/ensure-profile.use-case";

describe("EnsureProfileUseCase", () => {
	const inspectProfileExecute = vi.fn();
	const configureInteractively = vi.fn();
	const promptCredentialExecute = vi.fn();
	const isInteractive = vi.fn();

	const inspectProfileUseCase = {
		execute: inspectProfileExecute,
	} as unknown as InspectProfileUseCase;
	const configureLlmUseCase = {
		configureInteractively,
	} as unknown as ConfigureLlmUseCase;
	const promptCredentialUseCase = {
		execute: promptCredentialExecute,
	} as unknown as PromptCredentialUseCase;
	const interactiveShellService: IInteractiveShellService = {
		isInteractive,
	};

	const useCase = new EnsureProfileUseCase(inspectProfileUseCase, configureLlmUseCase, promptCredentialUseCase, interactiveShellService);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns profile when inspection status is ready", async () => {
		const profile = {
			credential: new Credential("sk-env"),
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 3,
			validationRetries: 3,
		};
		inspectProfileExecute.mockResolvedValue({
			profile,
			status: EProfileInspectionStatus.READY,
		});

		const result = await useCase.execute("commitizen");

		expect(result).toEqual(profile);
	});

	it("throws missing_profile in non-interactive shell", async () => {
		inspectProfileExecute.mockResolvedValue({
			moduleId: "commitizen",
			status: EProfileInspectionStatus.MISSING_PROFILE,
		});
		isInteractive.mockReturnValue(false);

		await expect(useCase.execute("commitizen")).rejects.toMatchObject({
			code: EProfileResolutionErrorCode.MISSING_PROFILE,
			name: "ProfileResolutionError",
		} satisfies Partial<ProfileResolutionError>);
		expect(configureInteractively).not.toHaveBeenCalled();
	});

	it("runs full configure when profile is missing in interactive shell", async () => {
		const configuredProfile = {
			credential: new Credential("sk-manual"),
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 3,
			validationRetries: 3,
		};
		inspectProfileExecute.mockResolvedValue({
			moduleId: "commitizen",
			status: EProfileInspectionStatus.MISSING_PROFILE,
		});
		isInteractive.mockReturnValue(true);
		configureInteractively.mockResolvedValue(configuredProfile);

		const result = await useCase.execute("commitizen");

		expect(configureInteractively).toHaveBeenCalledWith("commitizen");
		expect(result).toEqual(configuredProfile);
	});

	it("throws missing_credential in non-interactive shell", async () => {
		inspectProfileExecute.mockResolvedValue({
			environmentVariableName: "OPENAI_API_KEY",
			profile: {
				model: "gpt-4o",
				moduleId: "commitizen",
				provider: ELLMProvider.OPENAI,
				retries: 3,
				validationRetries: 3,
			},
			status: EProfileInspectionStatus.MISSING_CREDENTIAL,
		});
		isInteractive.mockReturnValue(false);

		await expect(useCase.execute("commitizen")).rejects.toMatchObject({
			code: EProfileResolutionErrorCode.MISSING_CREDENTIAL,
			environmentVariableName: "OPENAI_API_KEY",
			name: "ProfileResolutionError",
		} satisfies Partial<ProfileResolutionError>);
		expect(promptCredentialExecute).not.toHaveBeenCalled();
	});

	it("uses runtime credential when profile credential is missing", async () => {
		inspectProfileExecute.mockResolvedValue({
			environmentVariableName: "OPENAI_API_KEY",
			profile: {
				model: "gpt-4o",
				moduleId: "commitizen",
				provider: ELLMProvider.OPENAI,
				retries: 3,
				validationRetries: 3,
			},
			status: EProfileInspectionStatus.MISSING_CREDENTIAL,
		});
		isInteractive.mockReturnValue(false);

		const result = await useCase.execute("commitizen", new Credential("sk-runtime"));

		expect(promptCredentialExecute).not.toHaveBeenCalled();
		expect(result.credential.getValue()).toBe("sk-runtime");
		expect(result.model).toBe("gpt-4o");
	});

	it("runtime credential overrides ready environment credential", async () => {
		inspectProfileExecute.mockResolvedValue({
			profile: {
				credential: new Credential("sk-env"),
				model: "gpt-4o",
				moduleId: "commitizen",
				provider: ELLMProvider.OPENAI,
				retries: 3,
				validationRetries: 3,
			},
			status: EProfileInspectionStatus.READY,
		});

		const result = await useCase.execute("commitizen", new Credential("sk-runtime"));

		expect(result.credential.getValue()).toBe("sk-runtime");
	});

	it("prompts only credential when profile exists but credential is missing in interactive shell", async () => {
		inspectProfileExecute.mockResolvedValue({
			environmentVariableName: "OPENAI_API_KEY",
			profile: {
				model: "gpt-4o",
				moduleId: "commitizen",
				provider: ELLMProvider.OPENAI,
				retries: 3,
				validationRetries: 3,
			},
			status: EProfileInspectionStatus.MISSING_CREDENTIAL,
		});
		isInteractive.mockReturnValue(true);
		promptCredentialExecute.mockResolvedValue(new Credential("sk-manual"));

		const result = await useCase.execute("commitizen");

		expect(configureInteractively).not.toHaveBeenCalled();
		expect(promptCredentialExecute).toHaveBeenCalledWith(ELLMProvider.OPENAI);
		expect(result.credential.getValue()).toBe("sk-manual");
		expect(result.moduleId).toBe("commitizen");
	});

	it("throws invalid_profile regardless of shell mode", async () => {
		inspectProfileExecute.mockResolvedValue({
			moduleId: "commitizen",
			reason: "Provider is missing in module profile.",
			status: EProfileInspectionStatus.INVALID_PROFILE,
		});

		await expect(useCase.execute("commitizen")).rejects.toMatchObject({
			code: EProfileResolutionErrorCode.INVALID_PROFILE,
			name: "ProfileResolutionError",
		} satisfies Partial<ProfileResolutionError>);
		expect(configureInteractively).not.toHaveBeenCalled();
		expect(promptCredentialExecute).not.toHaveBeenCalled();
	});
});
