import type { ELLMMessageRole } from "../../enum/llm-message-role.enum.js";

/**
 * Normalized chat message.
 */
export interface ILlmMessage {
	content: string;
	role: ELLMMessageRole;
}
