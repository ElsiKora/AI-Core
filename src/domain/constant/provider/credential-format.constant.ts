import type { ELLMProvider } from "../../enum/llm-provider.enum.js";

import { ELLMProvider as Provider } from "../../enum/llm-provider.enum.js";

export const PROVIDER_CREDENTIAL_FORMAT_MAP: Record<ELLMProvider, string> = {
	[Provider.ANTHROPIC]: "",
	[Provider.AWS_BEDROCK]: " (format: region|access-key-id|secret-access-key)",
	[Provider.AZURE_OPENAI]: " (format: endpoint|api-key|deployment-name)",
	[Provider.CEREBRAS]: "",
	[Provider.GOOGLE]: "",
	[Provider.OLLAMA]: " (format: host:port or host:port|custom-model)",
	[Provider.OPENAI]: "",
	[Provider.VERCEL_AI_GATEWAY]: "",
};
