import type { ELLMProvider } from "@domain/enum/llm-provider.enum";

/**
 * Model option for CLI/UI selectors.
 */
export interface ILlmModelOption {
	isDefault?: boolean;
	label: string;
	provider: ELLMProvider;
	value: string;
}
