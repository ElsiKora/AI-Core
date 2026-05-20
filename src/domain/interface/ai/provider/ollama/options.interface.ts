import type { EAiOllamaReasoningEffort } from "@domain/enum/ai/provider/ollama/reasoning-effort.enum";
import type { IAiOllamaReasoning } from "@domain/interface/ai/provider/ollama/reasoning.interface";

export interface IAiOllamaProviderOptions {
	minP?: number;
	numCtx?: number;
	numPredict?: number;
	reasoning?: IAiOllamaReasoning;
	reasoningEffort?: EAiOllamaReasoningEffort;
	topK?: number;
}
