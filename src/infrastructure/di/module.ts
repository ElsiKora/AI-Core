import type { IDIModule, Provider } from "@elsikora/cladi";

import type { IConfigService } from "../../application/interface/config-service.interface.js";
import type { ICredentialResolver } from "../../application/interface/credential-resolver.interface.js";
import type { IInteractiveShellService } from "../../application/interface/interactive-shell-service.interface.js";

import { createModule } from "@elsikora/cladi";

import { ModelRegistryService } from "../../application/service/model-registry.service.js";
import { InspectProfileUseCase } from "../../application/use-case/inspect-profile.use-case.js";
import { AnthropicLlmService } from "../llm/anthropic-llm.service.js";
import { AwsBedrockLlmService } from "../llm/aws-bedrock-llm.service.js";
import { AzureOpenAiLlmService } from "../llm/azure-openai-llm.service.js";
import { CerebrasLlmService } from "../llm/cerebras-llm.service.js";
import { GoogleLlmService } from "../llm/google-llm.service.js";
import { OllamaLlmService } from "../llm/ollama-llm.service.js";
import { OpenAiLlmService } from "../llm/openai-llm.service.js";
import { VercelAiGatewayLlmService } from "../llm/vercel-ai-gateway-llm.service.js";
import { AiCoreConfigService } from "../service/ai-core-config.service.js";
import { EnvironmentCredentialResolver } from "../service/environment-credential-resolver.service.js";
import { NodeFileSystemService } from "../service/node-file-system.service.js";
import { ProcessInteractiveShellService } from "../service/process-interactive-shell.service.js";

import { ConfigServiceToken, CredentialResolverToken, InspectProfileUseCaseToken, InteractiveShellServiceToken, LlmServiceToken, ModelRegistryServiceToken, NodeFileSystemServiceToken } from "./token.js";

const LLM_PROVIDERS: Array<Provider> = [
	{ isMultiBinding: true, provide: LlmServiceToken, useFactory: (): AnthropicLlmService => new AnthropicLlmService() },
	{ isMultiBinding: true, provide: LlmServiceToken, useFactory: (): AwsBedrockLlmService => new AwsBedrockLlmService() },
	{ isMultiBinding: true, provide: LlmServiceToken, useFactory: (): AzureOpenAiLlmService => new AzureOpenAiLlmService() },
	{ isMultiBinding: true, provide: LlmServiceToken, useFactory: (): CerebrasLlmService => new CerebrasLlmService() },
	{ isMultiBinding: true, provide: LlmServiceToken, useFactory: (): GoogleLlmService => new GoogleLlmService() },
	{ isMultiBinding: true, provide: LlmServiceToken, useFactory: (): OllamaLlmService => new OllamaLlmService() },
	{ isMultiBinding: true, provide: LlmServiceToken, useFactory: (): OpenAiLlmService => new OpenAiLlmService() },
	{ isMultiBinding: true, provide: LlmServiceToken, useFactory: (): VercelAiGatewayLlmService => new VercelAiGatewayLlmService() },
];

export const LlmModule: IDIModule = createModule({
	exports: [LlmServiceToken],
	name: "llm",
	providers: LLM_PROVIDERS,
});

export const ConfigModule: IDIModule = createModule({
	exports: [ConfigServiceToken, CredentialResolverToken, InteractiveShellServiceToken],
	name: "config",
	providers: [
		{
			provide: NodeFileSystemServiceToken,
			useFactory: (): NodeFileSystemService => new NodeFileSystemService(),
		},
		{
			deps: [NodeFileSystemServiceToken],
			provide: ConfigServiceToken,
			useFactory: (fileSystemService: NodeFileSystemService): AiCoreConfigService => new AiCoreConfigService(fileSystemService),
		},
		{
			provide: CredentialResolverToken,
			useFactory: (): EnvironmentCredentialResolver => new EnvironmentCredentialResolver(),
		},
		{
			provide: InteractiveShellServiceToken,
			useFactory: (): IInteractiveShellService => new ProcessInteractiveShellService(),
		},
	],
});

export const ApplicationModule: IDIModule = createModule({
	exports: [InspectProfileUseCaseToken, ModelRegistryServiceToken],
	imports: [ConfigModule, LlmModule],
	name: "application",
	providers: [
		{
			provide: ModelRegistryServiceToken,
			useFactory: (): ModelRegistryService => new ModelRegistryService(),
		},
		{
			deps: [ConfigServiceToken, CredentialResolverToken],
			provide: InspectProfileUseCaseToken,
			useFactory: (configService: IConfigService, credentialResolver: ICredentialResolver): InspectProfileUseCase => new InspectProfileUseCase(configService, credentialResolver),
		},
	],
});
