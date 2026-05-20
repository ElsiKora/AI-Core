import type { ELLMProvider } from "../../enum/llm-provider.enum.js";

import type { IAiRuntimeOptions } from "./runtime-options.interface.js";

/**
 * Per-module profile persisted in config.
 */
export interface IAiModuleProfile extends IAiRuntimeOptions {
	alias?: string;
	model?: string;
	provider?: ELLMProvider;
}
