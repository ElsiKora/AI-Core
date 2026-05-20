import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { IAiCoreConfig } from "../../domain/interface/ai/core-config.interface.js";
import type { IAiModelAlias } from "../../domain/interface/ai/model-alias.interface.js";
import type { IAiModuleProfile } from "../../domain/interface/ai/module-profile.interface.js";
import type { TProfileInspectionResult } from "../../domain/interface/profile-inspection-result.interface.js";
import type { IResolvedModuleRuntimeProfile } from "../../domain/interface/resolved-module-runtime-profile.interface.js";
import type { TAiCoreModuleId } from "../../domain/type/ai-core-module-id.type.js";
import type { Credential } from "../../domain/value-object/credential.value-object.js";
import type { IConfigService } from "../interface/config-service.interface.js";
import type { ICredentialResolver } from "../interface/credential-resolver.interface.js";

import { DEFAULT_MAX_RETRIES, DEFAULT_VALIDATION_RETRIES } from "../../domain/constant/numeric.constant.js";
import { PROVIDER_DEFAULT_MODEL_MAP } from "../../domain/constant/provider/default-model.constant.js";
import { PROVIDER_ENV_VARIABLE_MAP } from "../../domain/constant/provider/env-variable.constant.js";
import { EProfileInspectionStatus } from "../../domain/enum/profile-inspection-status.enum.js";

type TRuntimeProfileResolutionResult = { profile: IResolvedModuleRuntimeProfile; status: "valid" } | { reason: string; status: "invalid" };

/**
 * Inspects persisted module profile and reports canonical readiness state.
 */
export class InspectProfileUseCase {
	private readonly CONFIG_SERVICE: IConfigService;

	private readonly CREDENTIAL_RESOLVER: ICredentialResolver;

	constructor(configService: IConfigService, credentialResolver: ICredentialResolver) {
		this.CONFIG_SERVICE = configService;
		this.CREDENTIAL_RESOLVER = credentialResolver;
	}

	async execute(moduleId: TAiCoreModuleId): Promise<TProfileInspectionResult> {
		const config: IAiCoreConfig = await this.CONFIG_SERVICE.get();
		const moduleProfile: IAiModuleProfile | undefined = config.modules?.[moduleId];

		if (!moduleProfile) {
			return {
				moduleId,
				status: EProfileInspectionStatus.MISSING_PROFILE,
			};
		}

		const runtimeProfileResolutionResult: TRuntimeProfileResolutionResult = this.resolveRuntimeProfile(moduleId, config, moduleProfile);

		if (runtimeProfileResolutionResult.status === "invalid") {
			return {
				moduleId,
				reason: runtimeProfileResolutionResult.reason,
				status: EProfileInspectionStatus.INVALID_PROFILE,
			};
		}

		const credential: Credential | null = this.CREDENTIAL_RESOLVER.resolve(runtimeProfileResolutionResult.profile.provider);

		if (!credential) {
			return {
				environmentVariableName: PROVIDER_ENV_VARIABLE_MAP[runtimeProfileResolutionResult.profile.provider],
				profile: runtimeProfileResolutionResult.profile,
				status: EProfileInspectionStatus.MISSING_CREDENTIAL,
			};
		}

		return {
			profile: {
				...runtimeProfileResolutionResult.profile,
				credential,
			},
			status: EProfileInspectionStatus.READY,
		};
	}

	private resolveRuntimeProfile(moduleId: TAiCoreModuleId, config: IAiCoreConfig, moduleProfile: IAiModuleProfile): TRuntimeProfileResolutionResult {
		const aliasProfile: IAiModelAlias | undefined = moduleProfile.alias ? config.aliases?.[moduleProfile.alias] : undefined;
		const provider: ELLMProvider | undefined = moduleProfile.provider ?? aliasProfile?.provider;
		let model: string | undefined = moduleProfile.model ?? aliasProfile?.model;

		if (!provider) {
			return {
				reason: "Provider is missing in module profile. Set 'provider' or a valid alias with provider.",
				status: "invalid",
			};
		}

		model ??= PROVIDER_DEFAULT_MODEL_MAP[provider];

		if (!model) {
			return {
				reason: `Model is missing in module profile for provider '${provider}'. Set 'model' or provide alias/default model mapping.`,
				status: "invalid",
			};
		}

		return {
			profile: {
				maxTokens: moduleProfile.maxTokens,
				model,
				moduleId,
				provider,
				retries: moduleProfile.retries ?? DEFAULT_MAX_RETRIES,
				temperature: moduleProfile.temperature,
				validationRetries: moduleProfile.validationRetries ?? DEFAULT_VALIDATION_RETRIES,
			},
			status: "valid",
		};
	}
}
