import type { IConfigService } from "@application/interface/config-service.interface";
import type { ICredentialResolver } from "@application/interface/credential-resolver.interface";
import type { IInteractiveShellService } from "@application/interface/interactive-shell-service.interface";
import type { IDIModule, Provider } from "@elsikora/cladi";

import { ModelRegistryService } from "@application/service/model-registry.service";
import { InspectProfileUseCase } from "@application/use-case/inspect-profile.use-case";
import { createModule } from "@elsikora/cladi";
import { DI_TOKEN_CONSTANT } from "@infrastructure/constant/di/token.constant";
import { AiCoreConfigService } from "@infrastructure/service/ai-core-config.service";
import { EnvironmentCredentialResolver } from "@infrastructure/service/environment-credential-resolver.service";
import { AnthropicLlmService } from "@infrastructure/service/llm/anthropic-llm.service";
import { AwsBedrockLlmService } from "@infrastructure/service/llm/aws-bedrock-llm.service";
import { AzureOpenAiLlmService } from "@infrastructure/service/llm/azure-openai-llm.service";
import { CerebrasLlmService } from "@infrastructure/service/llm/cerebras-llm.service";
import { GoogleLlmService } from "@infrastructure/service/llm/google-llm.service";
import { OllamaLlmService } from "@infrastructure/service/llm/ollama-llm.service";
import { OpenAiLlmService } from "@infrastructure/service/llm/openai-llm.service";
import { VercelAiGatewayLlmService } from "@infrastructure/service/llm/vercel-ai-gateway-llm.service";
import { NodeFileSystemService } from "@infrastructure/service/node-file-system.service";
import { ProcessInteractiveShellService } from "@infrastructure/service/process-interactive-shell.service";

const LLM_PROVIDERS: Array<Provider> = [
	{ isMultiBinding: true, provide: DI_TOKEN_CONSTANT.LLM_SERVICE, useFactory: (): AnthropicLlmService => new AnthropicLlmService() },
	{ isMultiBinding: true, provide: DI_TOKEN_CONSTANT.LLM_SERVICE, useFactory: (): AwsBedrockLlmService => new AwsBedrockLlmService() },
	{ isMultiBinding: true, provide: DI_TOKEN_CONSTANT.LLM_SERVICE, useFactory: (): AzureOpenAiLlmService => new AzureOpenAiLlmService() },
	{ isMultiBinding: true, provide: DI_TOKEN_CONSTANT.LLM_SERVICE, useFactory: (): CerebrasLlmService => new CerebrasLlmService() },
	{ isMultiBinding: true, provide: DI_TOKEN_CONSTANT.LLM_SERVICE, useFactory: (): GoogleLlmService => new GoogleLlmService() },
	{ isMultiBinding: true, provide: DI_TOKEN_CONSTANT.LLM_SERVICE, useFactory: (): OllamaLlmService => new OllamaLlmService() },
	{ isMultiBinding: true, provide: DI_TOKEN_CONSTANT.LLM_SERVICE, useFactory: (): OpenAiLlmService => new OpenAiLlmService() },
	{ isMultiBinding: true, provide: DI_TOKEN_CONSTANT.LLM_SERVICE, useFactory: (): VercelAiGatewayLlmService => new VercelAiGatewayLlmService() },
];

const LLM_MODULE: IDIModule = createModule({
	exports: [DI_TOKEN_CONSTANT.LLM_SERVICE],
	name: "llm",
	providers: LLM_PROVIDERS,
});

const CONFIG_MODULE: IDIModule = createModule({
	exports: [DI_TOKEN_CONSTANT.CONFIG_SERVICE, DI_TOKEN_CONSTANT.CREDENTIAL_RESOLVER, DI_TOKEN_CONSTANT.INTERACTIVE_SHELL_SERVICE],
	name: "config",
	providers: [
		{
			provide: DI_TOKEN_CONSTANT.NODE_FILE_SYSTEM_SERVICE,
			useFactory: (): NodeFileSystemService => new NodeFileSystemService(),
		},
		{
			deps: [DI_TOKEN_CONSTANT.NODE_FILE_SYSTEM_SERVICE],
			provide: DI_TOKEN_CONSTANT.CONFIG_SERVICE,
			useFactory: (fileSystemService: NodeFileSystemService): AiCoreConfigService => new AiCoreConfigService(fileSystemService),
		},
		{
			provide: DI_TOKEN_CONSTANT.CREDENTIAL_RESOLVER,
			useFactory: (): EnvironmentCredentialResolver => new EnvironmentCredentialResolver(),
		},
		{
			provide: DI_TOKEN_CONSTANT.INTERACTIVE_SHELL_SERVICE,
			useFactory: (): IInteractiveShellService => new ProcessInteractiveShellService(),
		},
	],
});

export const DI_MODULE_CONSTANT: {
	APPLICATION: IDIModule;
	CONFIG: IDIModule;
	LLM: IDIModule;
} = {
	APPLICATION: createModule({
		exports: [DI_TOKEN_CONSTANT.INSPECT_PROFILE_USE_CASE, DI_TOKEN_CONSTANT.MODEL_REGISTRY_SERVICE],
		imports: [CONFIG_MODULE, LLM_MODULE],
		name: "application",
		providers: [
			{
				provide: DI_TOKEN_CONSTANT.MODEL_REGISTRY_SERVICE,
				useFactory: (): ModelRegistryService => new ModelRegistryService(),
			},
			{
				deps: [DI_TOKEN_CONSTANT.CONFIG_SERVICE, DI_TOKEN_CONSTANT.CREDENTIAL_RESOLVER],
				provide: DI_TOKEN_CONSTANT.INSPECT_PROFILE_USE_CASE,
				useFactory: (configService: IConfigService, credentialResolver: ICredentialResolver): InspectProfileUseCase => new InspectProfileUseCase(configService, credentialResolver),
			},
		],
	}),
	CONFIG: CONFIG_MODULE,
	LLM: LLM_MODULE,
};
