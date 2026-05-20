import type { ELLMProvider } from "../../enum/llm-provider.enum.js";

/**
 * Streaming chunk emitted during generation.
 */
export interface IGenerateStreamChunk {
	attempt: number;
	delta: string;
	model: string;
	provider: ELLMProvider;
	text: string;
}
