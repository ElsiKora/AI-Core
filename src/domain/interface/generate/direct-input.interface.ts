import type { EGenerateMode } from "@domain/enum/generate-mode.enum";
import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { IGenerateBaseInput } from "@domain/interface/generate/base-input.interface";

/**
 * Direct generation mode input.
 */
export interface IGenerateDirectInput extends IGenerateBaseInput {
	credential: string;
	mode: EGenerateMode.DIRECT;
	moduleId?: never;
	provider: ELLMProvider;
}
