import type { ModelRegistryService } from "@application/service/model-registry.service";
import type { ConfigureLlmUseCase } from "@application/use-case/configure-llm.use-case";
import type { EnsureProfileUseCase } from "@application/use-case/ensure-profile.use-case";
import type { GenerateTextUseCase } from "@application/use-case/generate-text.use-case";
import type { InspectProfileUseCase } from "@application/use-case/inspect-profile.use-case";
import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { TGenerateInput } from "@domain/interface/generate/input.interface";
import type { IGenerateProfileInput } from "@domain/interface/generate/profile-input.interface";
import type { IGenerateResult } from "@domain/interface/generate/result.interface";
import type { IGenerateStreamChunk } from "@domain/interface/generate/stream-chunk.interface";
import type { ILlmModelOption } from "@domain/interface/llm/model-option.interface";
import type { IProviderOption } from "@domain/interface/provider-option.interface";
import type { IResolvedModuleProfile } from "@domain/interface/resolved-module-profile.interface";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";
import type { TProfileInspectionResult } from "@domain/type/profile-inspection-result.type";
import type { IDIContainer } from "@elsikora/cladi";
import type { IAiCoreAdapterOptions } from "@presentation/ai-core/interface/options.interface";

import { EGenerateMode } from "@domain/enum/generate-mode.enum";
import { DI_TOKEN_CONSTANT } from "@infrastructure/constant/di/token.constant";
import { createAiCoreContainer } from "@infrastructure/di/container";

/**
 * Public entry-point adapter for AI-Core.
 */
export class AiCoreAdapter {
	private readonly CONTAINER: IDIContainer;

	private readonly PROFILE_CACHE: Map<TAiCoreModuleId, IResolvedModuleProfile> = new Map<TAiCoreModuleId, IResolvedModuleProfile>();

	private constructor(container: IDIContainer) {
		this.CONTAINER = container;
	}

	static create(options?: IAiCoreAdapterOptions): AiCoreAdapter {
		if (options?.beanOptions && options.cliInterface) {
			throw new Error("beanOptions cannot be used with custom cliInterface");
		}

		const container: IDIContainer = createAiCoreContainer(options?.cliInterface, options?.beanOptions);

		return new AiCoreAdapter(container);
	}

	async configure(moduleId: TAiCoreModuleId): Promise<IResolvedModuleProfile> {
		const useCase: ConfigureLlmUseCase = this.CONTAINER.resolve(DI_TOKEN_CONSTANT.CONFIGURE_LLM_USE_CASE);
		const profile: IResolvedModuleProfile = await useCase.configureInteractively(moduleId);

		this.PROFILE_CACHE.set(moduleId, profile);

		return profile;
	}

	async ensureProfile(moduleId: TAiCoreModuleId): Promise<IResolvedModuleProfile> {
		const useCase: EnsureProfileUseCase = this.CONTAINER.resolve(DI_TOKEN_CONSTANT.ENSURE_PROFILE_USE_CASE);
		const profile: IResolvedModuleProfile = await useCase.execute(moduleId);

		this.PROFILE_CACHE.set(moduleId, profile);

		return profile;
	}

	async generate(input: TGenerateInput): Promise<IGenerateResult> {
		const useCase: GenerateTextUseCase = this.CONTAINER.resolve(DI_TOKEN_CONSTANT.GENERATE_TEXT_USE_CASE);

		return useCase.execute(this.applyCachedProfileCredential(input));
	}

	generateStream(input: TGenerateInput): AsyncGenerator<IGenerateStreamChunk> {
		const useCase: GenerateTextUseCase = this.CONTAINER.resolve(DI_TOKEN_CONSTANT.GENERATE_TEXT_USE_CASE);

		return useCase.executeStream(this.applyCachedProfileCredential(input));
	}

	getModelOptions(provider: ELLMProvider): Array<ILlmModelOption> {
		const service: ModelRegistryService = this.CONTAINER.resolve(DI_TOKEN_CONSTANT.MODEL_REGISTRY_SERVICE);

		return service.getModelOptions(provider);
	}

	getProviderOptions(): Array<IProviderOption> {
		const service: ModelRegistryService = this.CONTAINER.resolve(DI_TOKEN_CONSTANT.MODEL_REGISTRY_SERVICE);

		return service.getProviderOptions();
	}

	async inspectProfile(moduleId: TAiCoreModuleId): Promise<TProfileInspectionResult> {
		const useCase: InspectProfileUseCase = this.CONTAINER.resolve(DI_TOKEN_CONSTANT.INSPECT_PROFILE_USE_CASE);

		return useCase.execute(moduleId);
	}

	private applyCachedProfileCredential(input: TGenerateInput): TGenerateInput {
		if (input.mode !== EGenerateMode.PROFILE || input.credential) {
			return input;
		}

		const cachedProfile: IResolvedModuleProfile | undefined = this.PROFILE_CACHE.get(input.moduleId);

		if (!cachedProfile) {
			return input;
		}

		return {
			...input,
			credential: cachedProfile.credential.getValue(),
		} satisfies IGenerateProfileInput;
	}
}
