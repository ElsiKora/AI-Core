import type { ELLMMessageRole } from "@domain/enum/llm-message-role.enum";

/**
 * Normalized chat message.
 */
export interface ILlmMessage {
	content: string;
	role: ELLMMessageRole;
}
