import type { Token } from "@elsikora/cladi";

import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface.js";
import type { IConfigService } from "../../application/interface/config-service.interface.js";
import type { ICredentialResolver } from "../../application/interface/credential-resolver.interface.js";
import type { IInteractiveShellService } from "../../application/interface/interactive-shell-service.interface.js";
import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { ModelRegistryService } from "../../application/service/model-registry.service.js";
import type { ConfigureLlmUseCase } from "../../application/use-case/configure-llm.use-case.js";
import type { EnsureProfileUseCase } from "../../application/use-case/ensure-profile.use-case.js";
import type { GenerateTextUseCase } from "../../application/use-case/generate-text.use-case.js";
import type { InspectProfileUseCase } from "../../application/use-case/inspect-profile.use-case.js";
import type { PromptCredentialUseCase } from "../../application/use-case/prompt-credential.use-case.js";
import type { NodeFileSystemService } from "../service/node-file-system.service.js";

import { createToken } from "@elsikora/cladi";

export const CliInterfaceServiceToken: Token<ICliInterfaceService> = createToken<ICliInterfaceService>("CliInterfaceService");
export const ConfigServiceToken: Token<IConfigService> = createToken<IConfigService>("ConfigService");
export const ConfigureLlmUseCaseToken: Token<ConfigureLlmUseCase> = createToken<ConfigureLlmUseCase>("ConfigureLlmUseCase");
export const CredentialResolverToken: Token<ICredentialResolver> = createToken<ICredentialResolver>("CredentialResolver");
export const EnsureProfileUseCaseToken: Token<EnsureProfileUseCase> = createToken<EnsureProfileUseCase>("EnsureProfileUseCase");
export const GenerateTextUseCaseToken: Token<GenerateTextUseCase> = createToken<GenerateTextUseCase>("GenerateTextUseCase");
export const InspectProfileUseCaseToken: Token<InspectProfileUseCase> = createToken<InspectProfileUseCase>("InspectProfileUseCase");
export const InteractiveShellServiceToken: Token<IInteractiveShellService> = createToken<IInteractiveShellService>("InteractiveShellService");
export const LlmServiceToken: Token<ILlmService> = createToken<ILlmService>("LlmService");
export const ModelRegistryServiceToken: Token<ModelRegistryService> = createToken<ModelRegistryService>("ModelRegistryService");
export const NodeFileSystemServiceToken: Token<NodeFileSystemService> = createToken<NodeFileSystemService>("NodeFileSystemService");
export const PromptCredentialUseCaseToken: Token<PromptCredentialUseCase> = createToken<PromptCredentialUseCase>("PromptCredentialUseCase");
