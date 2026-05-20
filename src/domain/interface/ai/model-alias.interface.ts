import type { ELLMProvider } from "../../enum/llm-provider.enum.js";

/**
 * Alias entry for provider/model pair.
 */
export interface IAiModelAlias {
	model: string;
	provider: ELLMProvider;
}
