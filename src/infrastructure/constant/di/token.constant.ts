import type { ICliInterfaceService } from "@application/interface/cli-interface-service.interface";
import type { IConfigService } from "@application/interface/config-service.interface";
import type { ICredentialResolver } from "@application/interface/credential-resolver.interface";
import type { IInteractiveShellService } from "@application/interface/interactive-shell-service.interface";
import type { ILlmService } from "@application/interface/llm-service.interface";
import type { ModelRegistryService } from "@application/service/model-registry.service";
import type { ConfigureLlmUseCase } from "@application/use-case/configure-llm.use-case";
import type { EnsureProfileUseCase } from "@application/use-case/ensure-profile.use-case";
import type { GenerateTextUseCase } from "@application/use-case/generate-text.use-case";
import type { InspectProfileUseCase } from "@application/use-case/inspect-profile.use-case";
import type { PromptCredentialUseCase } from "@application/use-case/prompt-credential.use-case";
import type { Token } from "@elsikora/cladi";
import type { NodeFileSystemService } from "@infrastructure/service/node-file-system.service";

import { createToken } from "@elsikora/cladi";

export const DI_TOKEN_CONSTANT: {
	CLI_INTERFACE_SERVICE: Token<ICliInterfaceService>;
	CONFIG_SERVICE: Token<IConfigService>;
	CONFIGURE_LLM_USE_CASE: Token<ConfigureLlmUseCase>;
	CREDENTIAL_RESOLVER: Token<ICredentialResolver>;
	ENSURE_PROFILE_USE_CASE: Token<EnsureProfileUseCase>;
	GENERATE_TEXT_USE_CASE: Token<GenerateTextUseCase>;
	INSPECT_PROFILE_USE_CASE: Token<InspectProfileUseCase>;
	INTERACTIVE_SHELL_SERVICE: Token<IInteractiveShellService>;
	LLM_SERVICE: Token<ILlmService>;
	MODEL_REGISTRY_SERVICE: Token<ModelRegistryService>;
	NODE_FILE_SYSTEM_SERVICE: Token<NodeFileSystemService>;
	PROMPT_CREDENTIAL_USE_CASE: Token<PromptCredentialUseCase>;
} = {
	CLI_INTERFACE_SERVICE: createToken<ICliInterfaceService>("CliInterfaceService"),
	CONFIG_SERVICE: createToken<IConfigService>("ConfigService"),
	CONFIGURE_LLM_USE_CASE: createToken<ConfigureLlmUseCase>("ConfigureLlmUseCase"),
	CREDENTIAL_RESOLVER: createToken<ICredentialResolver>("CredentialResolver"),
	ENSURE_PROFILE_USE_CASE: createToken<EnsureProfileUseCase>("EnsureProfileUseCase"),
	GENERATE_TEXT_USE_CASE: createToken<GenerateTextUseCase>("GenerateTextUseCase"),
	INSPECT_PROFILE_USE_CASE: createToken<InspectProfileUseCase>("InspectProfileUseCase"),
	INTERACTIVE_SHELL_SERVICE: createToken<IInteractiveShellService>("InteractiveShellService"),
	LLM_SERVICE: createToken<ILlmService>("LlmService"),
	MODEL_REGISTRY_SERVICE: createToken<ModelRegistryService>("ModelRegistryService"),
	NODE_FILE_SYSTEM_SERVICE: createToken<NodeFileSystemService>("NodeFileSystemService"),
	PROMPT_CREDENTIAL_USE_CASE: createToken<PromptCredentialUseCase>("PromptCredentialUseCase"),
};
