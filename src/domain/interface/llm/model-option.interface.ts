import type { ELLMProvider } from "../../enum/llm-provider.enum.js";

/**
 * Model option for CLI/UI selectors.
 */
export interface ILlmModelOption {
	isDefault?: boolean;
	label: string;
	provider: ELLMProvider;
	value: string;
}
