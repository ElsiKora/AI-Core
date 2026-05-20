import type { EAiOllamaReasoningEffort } from "@domain/enum/ai/provider/ollama/reasoning-effort.enum";

export interface IAiOllamaReasoning {
	effort?: EAiOllamaReasoningEffort;
}
