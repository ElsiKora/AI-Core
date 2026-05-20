import type { IConfigService } from "@application/interface/config-service.interface";
import type { ICredentialResolver } from "@application/interface/credential-resolver.interface";
import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { IAiCoreConfig } from "@domain/interface/ai/core-config.interface";
import type { IAiModelAlias } from "@domain/interface/ai/model-alias.interface";
import type { IAiModuleProfile } from "@domain/interface/ai/module-profile.interface";
import type { IResolvedModuleRuntimeProfile } from "@domain/interface/resolved-module-runtime-profile.interface";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";
import type { TProfileInspectionResult } from "@domain/type/profile-inspection-result.type";
import type { Credential } from "@domain/value-object/credential.value-object";

import { NUMERIC_CONSTANT } from "@domain/constant/numeric.constant";
import { PROVIDER_DEFAULT_MODEL_CONSTANT } from "@domain/constant/provider/default-model.constant";
import { PROVIDER_ENVIRONMENT_VARIABLE_CONSTANT } from "@domain/constant/provider/environment-variable.constant";
import { EProfileInspectionStatus } from "@domain/enum/profile-inspection-status.enum";

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

		const aliasProfile: IAiModelAlias | undefined = moduleProfile.alias ? config.aliases?.[moduleProfile.alias] : undefined;
		const provider: ELLMProvider | undefined = moduleProfile.provider ?? aliasProfile?.provider;
		let model: string | undefined = moduleProfile.model ?? aliasProfile?.model;

		if (!provider) {
			return {
				moduleId,
				reason: "Provider is missing in module profile. Set 'provider' or a valid alias with provider.",
				status: EProfileInspectionStatus.INVALID_PROFILE,
			};
		}

		model ??= PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[provider];

		if (!model) {
			return {
				moduleId,
				reason: `Model is missing in module profile for provider '${provider}'. Set 'model' or provide alias/default model mapping.`,
				status: EProfileInspectionStatus.INVALID_PROFILE,
			};
		}

		const profile: IResolvedModuleRuntimeProfile = {
			frequencyPenalty: moduleProfile.frequencyPenalty,
			maxCompletionTokens: moduleProfile.maxCompletionTokens,
			maxTokens: moduleProfile.maxTokens,
			metadata: moduleProfile.metadata,
			model,
			moduleId,
			presencePenalty: moduleProfile.presencePenalty,
			provider,
			providerOptions: moduleProfile.providerOptions,
			reasoning: moduleProfile.reasoning,
			responseFormat: moduleProfile.responseFormat,
			retries: moduleProfile.retries ?? NUMERIC_CONSTANT.DEFAULT_MAX_RETRIES,
			seed: moduleProfile.seed,
			serviceTier: moduleProfile.serviceTier,
			shouldRepromptCredentialOnAuthenticationFailure: moduleProfile.shouldRepromptCredentialOnAuthenticationFailure,
			shouldUseParallelToolCalls: moduleProfile.shouldUseParallelToolCalls,
			stopSequences: moduleProfile.stopSequences,
			temperature: moduleProfile.temperature,
			timeoutMs: moduleProfile.timeoutMs,
			toolChoice: moduleProfile.toolChoice,
			tools: moduleProfile.tools,
			topK: moduleProfile.topK,
			topP: moduleProfile.topP,
			validationRetries: moduleProfile.validationRetries ?? NUMERIC_CONSTANT.DEFAULT_VALIDATION_RETRIES,
		};
		const credential: Credential | null = this.CREDENTIAL_RESOLVER.resolve(profile.provider);

		if (!credential) {
			return {
				environmentVariableName: PROVIDER_ENVIRONMENT_VARIABLE_CONSTANT.MAP[profile.provider],
				profile,
				status: EProfileInspectionStatus.MISSING_CREDENTIAL,
			};
		}

		return {
			profile: {
				...profile,
				credential,
			},
			status: EProfileInspectionStatus.READY,
		};
	}
}
