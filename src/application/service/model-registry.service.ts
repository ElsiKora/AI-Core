import type { ILlmModelOption } from "@domain/interface/llm/model-option.interface";
import type { IProviderOption } from "@domain/interface/provider-option.interface";

import { PROVIDER_DEFAULT_MODEL_CONSTANT } from "@domain/constant/provider/default-model.constant";
import { EAnthropicModel } from "@domain/enum/anthropic-model.enum";
import { EAWSBedrockModel } from "@domain/enum/aws-bedrock-model.enum";
import { EAzureOpenAIModel } from "@domain/enum/azure-openai-model.enum";
import { ECerebrasModel } from "@domain/enum/cerebras-model.enum";
import { EGoogleModel } from "@domain/enum/google-model.enum";
import { ELLMProvider } from "@domain/enum/llm-provider.enum";
import { EOllamaModel } from "@domain/enum/ollama-model.enum";
import { EOpenAIModel } from "@domain/enum/openai-model.enum";
import { EVercelAiGatewayModel } from "@domain/enum/vercel-ai-gateway-model.enum";

/**
 * Central registry for provider and model options.
 */
export class ModelRegistryService {
	getDefaultModel(provider: ELLMProvider): string {
		return PROVIDER_DEFAULT_MODEL_CONSTANT.MAP[provider];
	}

	getModelOptions(provider: ELLMProvider): Array<ILlmModelOption> {
		switch (provider) {
			case ELLMProvider.ANTHROPIC: {
				return this.buildOptions(provider, Object.values(EAnthropicModel));
			}

			case ELLMProvider.AWS_BEDROCK: {
				return this.buildOptions(provider, Object.values(EAWSBedrockModel));
			}

			case ELLMProvider.AZURE_OPENAI: {
				return this.buildOptions(provider, Object.values(EAzureOpenAIModel));
			}

			case ELLMProvider.CEREBRAS: {
				return this.buildOptions(provider, Object.values(ECerebrasModel));
			}

			case ELLMProvider.GOOGLE: {
				return this.buildOptions(provider, Object.values(EGoogleModel));
			}

			case ELLMProvider.OLLAMA: {
				return this.buildOptions(provider, Object.values(EOllamaModel));
			}

			case ELLMProvider.OPENAI: {
				return this.buildOptions(provider, Object.values(EOpenAIModel));
			}

			case ELLMProvider.VERCEL_AI_GATEWAY: {
				return this.buildOptions(provider, Object.values(EVercelAiGatewayModel));
			}

			default: {
				const exhaustive: never = provider;

				throw new Error(`Unsupported provider: ${String(exhaustive)}`);
			}
		}
	}

	getProviderOptions(): Array<IProviderOption> {
		return [
			{ label: "Anthropic", value: ELLMProvider.ANTHROPIC },
			{ label: "AWS Bedrock", value: ELLMProvider.AWS_BEDROCK },
			{ label: "Azure OpenAI", value: ELLMProvider.AZURE_OPENAI },
			{ label: "Cerebras", value: ELLMProvider.CEREBRAS },
			{ label: "Google", value: ELLMProvider.GOOGLE },
			{ label: "Ollama", value: ELLMProvider.OLLAMA },
			{ label: "OpenAI", value: ELLMProvider.OPENAI },
			{ label: "Vercel AI Gateway", value: ELLMProvider.VERCEL_AI_GATEWAY },
		];
	}

	private buildOptions(provider: ELLMProvider, values: Array<string>): Array<ILlmModelOption> {
		const defaultModel: string = this.getDefaultModel(provider);

		return values.map(
			(value: string): ILlmModelOption => ({
				isDefault: value === defaultModel,
				label: value,
				provider,
				value,
			}),
		);
	}
}
