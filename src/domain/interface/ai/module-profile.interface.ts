import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { IAiRuntimeOptions } from "@domain/interface/ai/runtime-options.interface";

/**
 * Per-module profile persisted in config.
 */
export interface IAiModuleProfile extends IAiRuntimeOptions {
	alias?: string;
	model?: string;
	provider?: ELLMProvider;
}
