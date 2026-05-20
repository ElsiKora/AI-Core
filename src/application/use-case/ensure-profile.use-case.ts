import type { TProfileInspectionResult } from "../../domain/interface/profile-inspection-result.interface.js";
import type { IResolvedModuleProfile } from "../../domain/interface/resolved-module-profile.interface.js";
import type { TAiCoreModuleId } from "../../domain/type/ai-core-module-id.type.js";
import type { Credential } from "../../domain/value-object/credential.value-object.js";
import type { IInteractiveShellService } from "../interface/interactive-shell-service.interface.js";

import type { ConfigureLlmUseCase } from "./configure-llm.use-case.js";
import type { InspectProfileUseCase } from "./inspect-profile.use-case.js";
import type { PromptCredentialUseCase } from "./prompt-credential.use-case.js";

import { EProfileInspectionStatus as ProfileInspectionStatus } from "../../domain/enum/profile-inspection-status.enum.js";
import { EProfileResolutionErrorCode } from "../../domain/enum/profile-resolution-error-code.enum.js";
import { ProfileResolutionError } from "../../domain/error/profile-resolution.error.js";

/**
 * Ensures that module profile is runtime-ready according to canonical behavior.
 */
export class EnsureProfileUseCase {
	private readonly CONFIGURE_LLM_USE_CASE: ConfigureLlmUseCase;

	private readonly INSPECT_PROFILE_USE_CASE: InspectProfileUseCase;

	private readonly INTERACTIVE_SHELL_SERVICE: IInteractiveShellService;

	private readonly PROMPT_CREDENTIAL_USE_CASE: PromptCredentialUseCase;

	constructor(inspectProfileUseCase: InspectProfileUseCase, configureLlmUseCase: ConfigureLlmUseCase, promptCredentialUseCase: PromptCredentialUseCase, interactiveShellService: IInteractiveShellService) {
		this.INSPECT_PROFILE_USE_CASE = inspectProfileUseCase;
		this.CONFIGURE_LLM_USE_CASE = configureLlmUseCase;
		this.PROMPT_CREDENTIAL_USE_CASE = promptCredentialUseCase;
		this.INTERACTIVE_SHELL_SERVICE = interactiveShellService;
	}

	async execute(moduleId: TAiCoreModuleId): Promise<IResolvedModuleProfile> {
		const inspectionResult: TProfileInspectionResult = await this.INSPECT_PROFILE_USE_CASE.execute(moduleId);

		switch (inspectionResult.status) {
			case ProfileInspectionStatus.MISSING_CREDENTIAL: {
				if (!this.INTERACTIVE_SHELL_SERVICE.isInteractive()) {
					throw new ProfileResolutionError({
						code: EProfileResolutionErrorCode.MISSING_CREDENTIAL,
						environmentVariableName: inspectionResult.environmentVariableName,
						message: `Credential for provider '${inspectionResult.profile.provider}' is missing. Set '${inspectionResult.environmentVariableName}' or run in interactive TTY mode to enter credential manually.`,
						moduleId,
						provider: inspectionResult.profile.provider,
					});
				}

				const credential: Credential = await this.PROMPT_CREDENTIAL_USE_CASE.execute(inspectionResult.profile.provider);

				return {
					...inspectionResult.profile,
					credential,
				};
			}

			case ProfileInspectionStatus.MISSING_PROFILE: {
				if (!this.INTERACTIVE_SHELL_SERVICE.isInteractive()) {
					throw new ProfileResolutionError({
						code: EProfileResolutionErrorCode.MISSING_PROFILE,
						message: `AI-Core profile '${moduleId}' is missing. Configure '.elsikora/ai-core.config.js' or run interactive setup in a TTY shell.`,
						moduleId,
					});
				}

				return this.CONFIGURE_LLM_USE_CASE.configureInteractively(moduleId);
			}

			case ProfileInspectionStatus.READY: {
				return inspectionResult.profile;
			}

			case ProfileInspectionStatus.INVALID_PROFILE: {
				throw new ProfileResolutionError({
					code: EProfileResolutionErrorCode.INVALID_PROFILE,
					message: `AI-Core profile '${moduleId}' is invalid: ${inspectionResult.reason}`,
					moduleId,
				});
			}

			default: {
				const exhaustiveResult: never = inspectionResult;

				throw new Error(`Unsupported inspection status '${String(exhaustiveResult)}'`);
			}
		}
	}
}
