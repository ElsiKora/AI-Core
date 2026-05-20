import type { EAiOpenAiApiMode } from "@domain/enum/ai/provider/openai/api-mode.enum";
import type { EAiOpenAiServiceTier } from "@domain/enum/ai/provider/openai/service-tier.enum";
import type { EAiReasoningEffort } from "@domain/enum/ai/reasoning/effort.enum";
import type { EAiReasoningSummary } from "@domain/enum/ai/reasoning/summary.enum";
import type { EAiTextVerbosity } from "@domain/enum/ai/text-verbosity.enum";

export interface IAiOpenAiProviderOptions {
	apiMode?: EAiOpenAiApiMode;
	include?: Array<string>;
	instructions?: string;
	maxCompletionTokens?: number;
	previousResponseId?: string;
	reasoningEffort?: EAiReasoningEffort;
	reasoningSummary?: EAiReasoningSummary;
	serviceTier?: EAiOpenAiServiceTier;
	shouldStore?: boolean;
	shouldUseParallelToolCalls?: boolean;
	textVerbosity?: EAiTextVerbosity;
}
