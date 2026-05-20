import type { ILlmMessage } from "../llm/message.interface.js";

/**
 * Shared generation input fields.
 */
export interface IGenerateBaseInput {
	maxTokens?: number;
	messages?: Array<ILlmMessage>;
	model?: string;
	prompt?: string;
	retries?: number;
	temperature?: number;
	validationRetries?: number;
}
