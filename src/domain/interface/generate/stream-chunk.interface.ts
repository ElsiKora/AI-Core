import type { ELLMProvider } from "@domain/enum/llm-provider.enum";

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
