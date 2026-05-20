import type { ELLMProvider } from "@domain/enum/llm-provider.enum";

import { EAnthropicModel } from "@domain/enum/anthropic-model.enum";
import { EAWSBedrockModel } from "@domain/enum/aws-bedrock-model.enum";
import { EAzureOpenAIModel } from "@domain/enum/azure-openai-model.enum";
import { ECerebrasModel } from "@domain/enum/cerebras-model.enum";
import { EGoogleModel } from "@domain/enum/google-model.enum";
import { ELLMProvider as Provider } from "@domain/enum/llm-provider.enum";
import { EOllamaModel } from "@domain/enum/ollama-model.enum";
import { EOpenAIModel } from "@domain/enum/openai-model.enum";
import { EVercelAiGatewayModel } from "@domain/enum/vercel-ai-gateway-model.enum";

export const PROVIDER_DEFAULT_MODEL_CONSTANT: {
	MAP: Record<ELLMProvider, string>;
} = {
	MAP: {
		[Provider.ANTHROPIC]: EAnthropicModel.CLAUDE_SONNET_4_6,
		[Provider.AWS_BEDROCK]: EAWSBedrockModel.CLAUDE_SONNET_4_6,
		[Provider.AZURE_OPENAI]: EAzureOpenAIModel.GPT_5_5,
		[Provider.CEREBRAS]: ECerebrasModel.GPT_OSS_120B,
		[Provider.GOOGLE]: EGoogleModel.GEMINI_3_5_FLASH,
		[Provider.OLLAMA]: EOllamaModel.QWEN3_5,
		[Provider.OPENAI]: EOpenAIModel.GPT_5_5,
		[Provider.VERCEL_AI_GATEWAY]: EVercelAiGatewayModel.OPENAI_GPT_5_5,
	},
};
