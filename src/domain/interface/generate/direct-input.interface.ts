import type { EGenerateMode } from "../../enum/generate-mode.enum.js";
import type { ELLMProvider } from "../../enum/llm-provider.enum.js";

import type { IGenerateBaseInput } from "./base-input.interface.js";

/**
 * Direct generation mode input.
 */
export interface IGenerateDirectInput extends IGenerateBaseInput {
	credential: string;
	mode: EGenerateMode.DIRECT;
	moduleId?: never;
	provider: ELLMProvider;
}
