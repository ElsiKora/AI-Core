import type { EAiAzureResponseFormatCompatibilityMode } from "@domain/enum/ai/provider/azure/response-format-compatibility-mode.enum";
import type { EAiReasoningEffort } from "@domain/enum/ai/reasoning/effort.enum";

export interface IAiAzureOpenAiProviderOptions {
	apiVersion?: string;
	maxCompletionTokens?: number;
	reasoningEffort?: EAiReasoningEffort;
	responseFormatCompatibilityMode?: EAiAzureResponseFormatCompatibilityMode;
	shouldUseParallelToolCalls?: boolean;
	streamOptions?: {
		shouldIncludeUsage?: boolean;
	};
}
