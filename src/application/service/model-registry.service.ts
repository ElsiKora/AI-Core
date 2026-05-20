import type { ILlmModelOption } from "../../domain/interface/llm/model-option.interface.js";
import type { IProviderOption } from "../../domain/interface/provider-option.interface.js";

import { PROVIDER_DEFAULT_MODEL_MAP } from "../../domain/constant/provider/default-model.constant.js";
import { EAnthropicModel } from "../../domain/enum/anthropic-model.enum.js";
import { EAWSBedrockModel } from "../../domain/enum/aws-bedrock-model.enum.js";
import { EAzureOpenAIModel } from "../../domain/enum/azure-openai-model.enum.js";
import { ECerebrasModel } from "../../domain/enum/cerebras-model.enum.js";
import { EGoogleModel } from "../../domain/enum/google-model.enum.js";
import { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import { EOllamaModel } from "../../domain/enum/ollama-model.enum.js";
import { EOpenAIModel } from "../../domain/enum/openai-model.enum.js";
import { EVercelAiGatewayModel } from "../../domain/enum/vercel-ai-gateway-model.enum.js";

/**
 * Central registry for provider and model options.
 */
export class ModelRegistryService {
	getDefaultModel(provider: ELLMProvider): string {
		return PROVIDER_DEFAULT_MODEL_MAP[provider];
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
