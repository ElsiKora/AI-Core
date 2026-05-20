import type { ELLMProvider } from "@domain/enum/llm-provider.enum";

/**
 * Alias entry for provider/model pair.
 */
export interface IAiModelAlias {
	model: string;
	provider: ELLMProvider;
}
