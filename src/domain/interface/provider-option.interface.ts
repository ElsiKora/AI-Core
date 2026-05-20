import type { ELLMProvider } from "@domain/enum/llm-provider.enum";

/**
 * Provider option for CLI/UI selectors.
 */
export interface IProviderOption {
	label: string;
	value: ELLMProvider;
}
