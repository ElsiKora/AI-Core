import type { IAiAnthropicProviderOptions } from "@domain/interface/ai/provider/anthropic";
import type { IAiAzureOpenAiProviderOptions } from "@domain/interface/ai/provider/azure";
import type { IAiBedrockProviderOptions } from "@domain/interface/ai/provider/bedrock";
import type { IAiCerebrasProviderOptions } from "@domain/interface/ai/provider/cerebras";
import type { IAiGoogleProviderOptions } from "@domain/interface/ai/provider/google";
import type { IAiOllamaProviderOptions } from "@domain/interface/ai/provider/ollama";
import type { IAiOpenAiProviderOptions } from "@domain/interface/ai/provider/openai";
import type { IAiVercelAiGatewayProviderOptions } from "@domain/interface/ai/provider/vercel";

export interface IAiProviderOptions {
	anthropic?: IAiAnthropicProviderOptions;
	awsBedrock?: IAiBedrockProviderOptions;
	azureOpenai?: IAiAzureOpenAiProviderOptions;
	cerebras?: IAiCerebrasProviderOptions;
	google?: IAiGoogleProviderOptions;
	ollama?: IAiOllamaProviderOptions;
	openai?: IAiOpenAiProviderOptions;
	vercelAiGateway?: IAiVercelAiGatewayProviderOptions;
}
