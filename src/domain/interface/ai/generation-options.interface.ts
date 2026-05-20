import type { EAiServiceTier } from "@domain/enum/ai/service-tier.enum";
import type { IAiProviderOptions } from "@domain/interface/ai/provider";
import type { IAiReasoningOptions } from "@domain/interface/ai/reasoning";
import type { IAiResponseFormat } from "@domain/interface/ai/response-format.interface";
import type { IAiToolChoice, IAiToolDefinition } from "@domain/interface/ai/tool";

/**
 * Provider-neutral generation controls accepted by profiles and requests.
 */
export interface IGenerationOptions {
	frequencyPenalty?: number;
	maxCompletionTokens?: number;
	maxTokens?: number;
	metadata?: Record<string, string>;
	presencePenalty?: number;
	providerOptions?: IAiProviderOptions;
	reasoning?: IAiReasoningOptions;
	responseFormat?: IAiResponseFormat;
	seed?: number;
	serviceTier?: EAiServiceTier;
	shouldRepromptCredentialOnAuthenticationFailure?: boolean;
	shouldUseParallelToolCalls?: boolean;
	stopSequences?: Array<string>;
	temperature?: number;
	timeoutMs?: number;
	toolChoice?: IAiToolChoice;
	tools?: Array<IAiToolDefinition>;
	topK?: number;
	topP?: number;
}
