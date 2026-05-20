import type { IAiRuntimeOptions } from "@domain/interface/ai/runtime-options.interface";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";

/**
 * Shared generation input fields.
 */
export interface IGenerateBaseInput extends IAiRuntimeOptions {
	messages?: Array<ILlmMessage>;
	model?: string;
	prompt?: string;
}
