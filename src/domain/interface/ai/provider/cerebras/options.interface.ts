import type { EAiCerebrasReasoningFormat } from "@domain/enum/ai/provider/cerebras/reasoning-format.enum";
import type { EAiReasoningEffort } from "@domain/enum/ai/reasoning/effort.enum";

export interface IAiCerebrasProviderOptions {
	maxCompletionTokens?: number;
	reasoningEffort?: EAiReasoningEffort;
	reasoningFormat?: EAiCerebrasReasoningFormat;
	shouldReturnLogprobs?: boolean;
	topLogprobs?: number;
}
