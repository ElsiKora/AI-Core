import type { ELLMProvider } from "../enum/llm-provider.enum.js";

/**
 * Provider option for CLI/UI selectors.
 */
export interface IProviderOption {
	label: string;
	value: ELLMProvider;
}
