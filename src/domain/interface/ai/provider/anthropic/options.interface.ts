import type { EAiAnthropicServiceTier } from "@domain/enum/ai/provider/anthropic/service-tier.enum";
import type { EAiAnthropicSpeed } from "@domain/enum/ai/provider/anthropic/speed.enum";
import type { EAiReasoningEffort } from "@domain/enum/ai/reasoning/effort.enum";

export interface IAiAnthropicProviderOptions {
	betas?: Array<string>;
	effort?: EAiReasoningEffort;
	metadata?: Record<string, string>;
	serviceTier?: EAiAnthropicServiceTier;
	shouldDisableParallelToolUse?: boolean;
	shouldSendReasoning?: boolean;
	speed?: EAiAnthropicSpeed;
	thinking?: Record<string, unknown>;
	topK?: number;
}
