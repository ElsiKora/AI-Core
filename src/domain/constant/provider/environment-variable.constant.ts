import type { ELLMProvider } from "@domain/enum/llm-provider.enum";

import { ELLMProvider as Provider } from "@domain/enum/llm-provider.enum";

export const PROVIDER_ENVIRONMENT_VARIABLE_CONSTANT: {
	MAP: Record<ELLMProvider, string>;
} = {
	MAP: {
		[Provider.ANTHROPIC]: "ANTHROPIC_API_KEY",
		[Provider.AWS_BEDROCK]: "AWS_BEDROCK_API_KEY",
		[Provider.AZURE_OPENAI]: "AZURE_OPENAI_API_KEY",
		[Provider.CEREBRAS]: "CEREBRAS_API_KEY",
		[Provider.GOOGLE]: "GOOGLE_API_KEY",
		[Provider.OLLAMA]: "OLLAMA_API_KEY",
		[Provider.OPENAI]: "OPENAI_API_KEY",
		[Provider.VERCEL_AI_GATEWAY]: "AI_GATEWAY_API_KEY",
	},
};
