import type { ELLMProvider } from "@domain/enum/llm-provider.enum";

/**
 * Output contract for generated text.
 */
export interface IGenerateResult {
	attempts: number;
	model: string;
	provider: ELLMProvider;
	text: string;
}
