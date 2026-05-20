import type { ELLMProvider } from "@domain/enum/llm-provider.enum";

import { ELLMProvider as Provider } from "@domain/enum/llm-provider.enum";

export const PROVIDER_CREDENTIAL_FORMAT_CONSTANT: {
	MAP: Record<ELLMProvider, string>;
} = {
	MAP: {
		[Provider.ANTHROPIC]: "",
		[Provider.AWS_BEDROCK]: " (format: region|access-key-id|secret-access-key)",
		[Provider.AZURE_OPENAI]: " (format: endpoint|api-key|deployment-name)",
		[Provider.CEREBRAS]: "",
		[Provider.GOOGLE]: "",
		[Provider.OLLAMA]: " (format: host:port or host:port|custom-model)",
		[Provider.OPENAI]: "",
		[Provider.VERCEL_AI_GATEWAY]: "",
	},
};
