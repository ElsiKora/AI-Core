import type { IBeanFactoryOptionsInterface } from "@elsikora/bean";
import type { IDIContainer } from "@elsikora/cladi";

import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface.js";
import type { IConfigService } from "../../application/interface/config-service.interface.js";
import type { ICredentialResolver } from "../../application/interface/credential-resolver.interface.js";
import type { IInteractiveShellService } from "../../application/interface/interactive-shell-service.interface.js";
import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { ModelRegistryService } from "../../application/service/model-registry.service.js";
import type { InspectProfileUseCase } from "../../application/use-case/inspect-profile.use-case.js";

import { composeModules, createDIContainer, EDiContainerCaptiveDependencyPolicy, EDiContainerDuplicateProviderPolicy } from "@elsikora/cladi";

import { ConfigureLlmUseCase } from "../../application/use-case/configure-llm.use-case.js";
import { EnsureProfileUseCase } from "../../application/use-case/ensure-profile.use-case.js";
import { GenerateTextUseCase } from "../../application/use-case/generate-text.use-case.js";
import { PromptCredentialUseCase } from "../../application/use-case/prompt-credential.use-case.js";
import { BeanCliInterfaceService } from "../service/bean-cli-interface.service.js";

import { ApplicationModule } from "./module.js";
import { CliInterfaceServiceToken, ConfigServiceToken, ConfigureLlmUseCaseToken, CredentialResolverToken, EnsureProfileUseCaseToken, GenerateTextUseCaseToken, InspectProfileUseCaseToken, InteractiveShellServiceToken, LlmServiceToken, ModelRegistryServiceToken, PromptCredentialUseCaseToken } from "./token.js";

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
	composeModules(container, [ApplicationModule]);

	const llmServices: Array<ILlmService> = container.resolveAll(LlmServiceToken);
	const activeCliInterface: ICliInterfaceService = cliInterface ?? new BeanCliInterfaceService(undefined, beanOptions);

	container.register({
		provide: CliInterfaceServiceToken,
		useValue: activeCliInterface,
	});

	const configService: IConfigService = container.resolve(ConfigServiceToken);
	const credentialResolver: ICredentialResolver = container.resolve(CredentialResolverToken);
	const interactiveShellService: IInteractiveShellService = container.resolve(InteractiveShellServiceToken);
	const inspectProfileUseCase: InspectProfileUseCase = container.resolve(InspectProfileUseCaseToken);
	const modelRegistryService: ModelRegistryService = container.resolve(ModelRegistryServiceToken);
	const promptCredentialUseCase: PromptCredentialUseCase = new PromptCredentialUseCase(credentialResolver, activeCliInterface);

	container.register({
		provide: PromptCredentialUseCaseToken,
		useValue: promptCredentialUseCase,
	});

	const configureLlmUseCase: ConfigureLlmUseCase = new ConfigureLlmUseCase(configService, promptCredentialUseCase, activeCliInterface, modelRegistryService);

	container.register({
		provide: ConfigureLlmUseCaseToken,
		useValue: configureLlmUseCase,
	});

	const ensureProfileUseCase: EnsureProfileUseCase = new EnsureProfileUseCase(inspectProfileUseCase, configureLlmUseCase, promptCredentialUseCase, interactiveShellService);

	container.register({
		provide: EnsureProfileUseCaseToken,
		useValue: ensureProfileUseCase,
	});

	container.register({
		provide: GenerateTextUseCaseToken,
		useValue: new GenerateTextUseCase(llmServices, ensureProfileUseCase),
	});

	container.validate();

	return container;
}
