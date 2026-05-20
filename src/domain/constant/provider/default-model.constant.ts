import type { ELLMProvider } from "../../enum/llm-provider.enum.js";

import { EAnthropicModel } from "../../enum/anthropic-model.enum.js";
import { EAWSBedrockModel } from "../../enum/aws-bedrock-model.enum.js";
import { EAzureOpenAIModel } from "../../enum/azure-openai-model.enum.js";
import { ECerebrasModel } from "../../enum/cerebras-model.enum.js";
import { EGoogleModel } from "../../enum/google-model.enum.js";
import { ELLMProvider as Provider } from "../../enum/llm-provider.enum.js";
import { EOllamaModel } from "../../enum/ollama-model.enum.js";
import { EOpenAIModel } from "../../enum/openai-model.enum.js";
import { EVercelAiGatewayModel } from "../../enum/vercel-ai-gateway-model.enum.js";

export const PROVIDER_DEFAULT_MODEL_MAP: Record<ELLMProvider, string> = {
	[Provider.ANTHROPIC]: EAnthropicModel.CLAUDE_SONNET_4_6,
	[Provider.AWS_BEDROCK]: EAWSBedrockModel.CLAUDE_SONNET_4_6,
	[Provider.AZURE_OPENAI]: EAzureOpenAIModel.GPT_5_5,
	[Provider.CEREBRAS]: ECerebrasModel.GPT_OSS_120B,
	[Provider.GOOGLE]: EGoogleModel.GEMINI_3_5_FLASH,
	[Provider.OLLAMA]: EOllamaModel.QWEN3_5,
	[Provider.OPENAI]: EOpenAIModel.GPT_5_5,
	[Provider.VERCEL_AI_GATEWAY]: EVercelAiGatewayModel.OPENAI_GPT_5_5,
};
