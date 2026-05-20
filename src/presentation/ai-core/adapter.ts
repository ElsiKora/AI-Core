import type { IDIContainer } from "@elsikora/cladi";

import type { ModelRegistryService } from "../../application/service/model-registry.service.js";
import type { ConfigureLlmUseCase } from "../../application/use-case/configure-llm.use-case.js";
import type { EnsureProfileUseCase } from "../../application/use-case/ensure-profile.use-case.js";
import type { GenerateTextUseCase } from "../../application/use-case/generate-text.use-case.js";
import type { InspectProfileUseCase } from "../../application/use-case/inspect-profile.use-case.js";
import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { TGenerateInput } from "../../domain/interface/generate/input.interface.js";
import type { IGenerateResult } from "../../domain/interface/generate/result.interface.js";
import type { IGenerateStreamChunk } from "../../domain/interface/generate/stream-chunk.interface.js";
import type { ILlmModelOption } from "../../domain/interface/llm/model-option.interface.js";
import type { TProfileInspectionResult } from "../../domain/interface/profile-inspection-result.interface.js";
import type { IProviderOption } from "../../domain/interface/provider-option.interface.js";
import type { IResolvedModuleProfile } from "../../domain/interface/resolved-module-profile.interface.js";
import type { TAiCoreModuleId } from "../../domain/type/ai-core-module-id.type.js";

import type { IAiCoreAdapterOptions } from "./options.interface.js";

import { createAiCoreContainer } from "../../infrastructure/di/container.js";
import { ConfigureLlmUseCaseToken, EnsureProfileUseCaseToken, GenerateTextUseCaseToken, InspectProfileUseCaseToken, ModelRegistryServiceToken } from "../../infrastructure/di/token.js";

/**
 * Public entry-point adapter for AI-Core.
 */
export class AiCoreAdapter {
	private readonly CONTAINER: IDIContainer;

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
		const useCase: ConfigureLlmUseCase = this.CONTAINER.resolve(ConfigureLlmUseCaseToken);

		return useCase.configureInteractively(moduleId);
	}

	async ensureProfile(moduleId: TAiCoreModuleId): Promise<IResolvedModuleProfile> {
		const useCase: EnsureProfileUseCase = this.CONTAINER.resolve(EnsureProfileUseCaseToken);

		return useCase.execute(moduleId);
	}

	async generate(input: TGenerateInput): Promise<IGenerateResult> {
		const useCase: GenerateTextUseCase = this.CONTAINER.resolve(GenerateTextUseCaseToken);

		return useCase.execute(input);
	}

	generateStream(input: TGenerateInput): AsyncGenerator<IGenerateStreamChunk> {
		const useCase: GenerateTextUseCase = this.CONTAINER.resolve(GenerateTextUseCaseToken);

		return useCase.executeStream(input);
	}

	getModelOptions(provider: ELLMProvider): Array<ILlmModelOption> {
		const service: ModelRegistryService = this.CONTAINER.resolve(ModelRegistryServiceToken);

		return service.getModelOptions(provider);
	}

	getProviderOptions(): Array<IProviderOption> {
		const service: ModelRegistryService = this.CONTAINER.resolve(ModelRegistryServiceToken);

		return service.getProviderOptions();
	}

	async inspectProfile(moduleId: TAiCoreModuleId): Promise<TProfileInspectionResult> {
		const useCase: InspectProfileUseCase = this.CONTAINER.resolve(InspectProfileUseCaseToken);

		return useCase.execute(moduleId);
	}
}
