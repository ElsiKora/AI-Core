/* eslint-disable @elsikora/unicorn/prevent-abbreviations */
import type { ELLMProvider } from "../../enum/llm-provider.enum.js";

import { ELLMProvider as Provider } from "../../enum/llm-provider.enum.js";

export const PROVIDER_ENV_VARIABLE_MAP: Record<ELLMProvider, string> = {
	[Provider.ANTHROPIC]: "ANTHROPIC_API_KEY",
	[Provider.AWS_BEDROCK]: "AWS_BEDROCK_API_KEY",
	[Provider.AZURE_OPENAI]: "AZURE_OPENAI_API_KEY",
	[Provider.CEREBRAS]: "CEREBRAS_API_KEY",
	[Provider.GOOGLE]: "GOOGLE_API_KEY",
	[Provider.OLLAMA]: "OLLAMA_API_KEY",
	[Provider.OPENAI]: "OPENAI_API_KEY",
	[Provider.VERCEL_AI_GATEWAY]: "AI_GATEWAY_API_KEY",
};
