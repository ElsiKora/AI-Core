import type { ICliInterfaceService } from "@application/interface/cli-interface-service.interface";
import type { IConfigService } from "@application/interface/config-service.interface";
import type { ICredentialResolver } from "@application/interface/credential-resolver.interface";
import type { IInteractiveShellService } from "@application/interface/interactive-shell-service.interface";
import type { ILlmService } from "@application/interface/llm-service.interface";
import type { ModelRegistryService } from "@application/service/model-registry.service";
import type { InspectProfileUseCase } from "@application/use-case/inspect-profile.use-case";
import type { IBeanFactoryOptionsInterface } from "@elsikora/bean";
import type { IDIContainer } from "@elsikora/cladi";

import { ConfigureLlmUseCase } from "@application/use-case/configure-llm.use-case";
import { EnsureProfileUseCase } from "@application/use-case/ensure-profile.use-case";
import { GenerateTextUseCase } from "@application/use-case/generate-text.use-case";
import { PromptCredentialUseCase } from "@application/use-case/prompt-credential.use-case";
import { composeModules, createDIContainer, EDiContainerCaptiveDependencyPolicy, EDiContainerDuplicateProviderPolicy } from "@elsikora/cladi";
import { DI_MODULE_CONSTANT } from "@infrastructure/constant/di/module.constant";
import { DI_TOKEN_CONSTANT } from "@infrastructure/constant/di/token.constant";
import { BeanCliInterfaceService } from "@infrastructure/service/bean-cli-interface.service";

/**
 * Composition root for AI-Core.
 * @param {ICliInterfaceService | undefined} cliInterface - Optional CLI adapter for interactive configuration.
 * @param {IBeanFactoryOptionsInterface | undefined} beanOptions - Optional Bean factory options used by default CLI adapter.
 * @returns {IDIContainer} Initialized DI container.
 */
export function createAiCoreContainer(cliInterface?: ICliInterfaceService, beanOptions?: IBeanFactoryOptionsInterface): IDIContainer {
	const container: IDIContainer = createDIContainer({
		captiveDependencyPolicy: EDiContainerCaptiveDependencyPolicy.ERROR,
		duplicateProviderPolicy: EDiContainerDuplicateProviderPolicy.ERROR,
		scopeName: "ai-core",
	});
	composeModules(container, [DI_MODULE_CONSTANT.APPLICATION]);

	const llmServices: Array<ILlmService> = container.resolveAll(DI_TOKEN_CONSTANT.LLM_SERVICE);
	const activeCliInterface: ICliInterfaceService = cliInterface ?? new BeanCliInterfaceService(undefined, beanOptions);

	container.register({
		provide: DI_TOKEN_CONSTANT.CLI_INTERFACE_SERVICE,
		useValue: activeCliInterface,
	});

	const configService: IConfigService = container.resolve(DI_TOKEN_CONSTANT.CONFIG_SERVICE);
	const credentialResolver: ICredentialResolver = container.resolve(DI_TOKEN_CONSTANT.CREDENTIAL_RESOLVER);
	const interactiveShellService: IInteractiveShellService = container.resolve(DI_TOKEN_CONSTANT.INTERACTIVE_SHELL_SERVICE);
	const inspectProfileUseCase: InspectProfileUseCase = container.resolve(DI_TOKEN_CONSTANT.INSPECT_PROFILE_USE_CASE);
	const modelRegistryService: ModelRegistryService = container.resolve(DI_TOKEN_CONSTANT.MODEL_REGISTRY_SERVICE);
	const promptCredentialUseCase: PromptCredentialUseCase = new PromptCredentialUseCase(credentialResolver, activeCliInterface);

	container.register({
		provide: DI_TOKEN_CONSTANT.PROMPT_CREDENTIAL_USE_CASE,
		useValue: promptCredentialUseCase,
	});

	const configureLlmUseCase: ConfigureLlmUseCase = new ConfigureLlmUseCase(configService, promptCredentialUseCase, activeCliInterface, modelRegistryService);

	container.register({
		provide: DI_TOKEN_CONSTANT.CONFIGURE_LLM_USE_CASE,
		useValue: configureLlmUseCase,
	});

	const ensureProfileUseCase: EnsureProfileUseCase = new EnsureProfileUseCase(inspectProfileUseCase, configureLlmUseCase, promptCredentialUseCase, interactiveShellService);

	container.register({
		provide: DI_TOKEN_CONSTANT.ENSURE_PROFILE_USE_CASE,
		useValue: ensureProfileUseCase,
	});

	container.register({
		provide: DI_TOKEN_CONSTANT.GENERATE_TEXT_USE_CASE,
		useValue: new GenerateTextUseCase(llmServices, ensureProfileUseCase, promptCredentialUseCase, interactiveShellService),
	});

	container.validate();

	return container;
}
