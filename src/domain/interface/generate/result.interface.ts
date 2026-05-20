import type { ELLMProvider } from "../../enum/llm-provider.enum.js";

/**
 * Output contract for generated text.
 */
export interface IGenerateResult {
	attempts: number;
	model: string;
	provider: ELLMProvider;
	text: string;
}
