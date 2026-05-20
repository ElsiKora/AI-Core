import type { EAiGoogleFunctionCallingMode } from "@domain/enum/ai/provider/google/function-calling-mode.enum";
import type { EAiGoogleThinkingLevel } from "@domain/enum/ai/provider/google/thinking-level.enum";

export interface IAiGoogleProviderOptions {
	cachedContent?: string;
	functionCallingConfig?: {
		allowedFunctionNames?: Array<string>;
		mode?: EAiGoogleFunctionCallingMode;
	};
	labels?: Record<string, string>;
	responseJsonSchema?: Record<string, unknown>;
	safetySettings?: Array<Record<string, unknown>>;
	systemInstruction?: string;
	thinkingConfig?: {
		shouldIncludeThoughts?: boolean;
		thinkingBudget?: number;
		thinkingLevel?: EAiGoogleThinkingLevel;
	};
}
