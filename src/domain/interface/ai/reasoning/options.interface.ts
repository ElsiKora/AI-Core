import type { EAiReasoningDisplay } from "@domain/enum/ai/reasoning/display.enum";
import type { EAiReasoningEffort } from "@domain/enum/ai/reasoning/effort.enum";
import type { EAiReasoningMode } from "@domain/enum/ai/reasoning/mode.enum";
import type { EAiReasoningSummary } from "@domain/enum/ai/reasoning/summary.enum";

/**
 * Provider-neutral reasoning and thinking controls.
 */
export interface IAiReasoningOptions {
	budgetTokens?: number;
	display?: EAiReasoningDisplay;
	effort?: EAiReasoningEffort;
	mode?: EAiReasoningMode;
	shouldIncludeThoughts?: boolean;
	summary?: EAiReasoningSummary;
}
