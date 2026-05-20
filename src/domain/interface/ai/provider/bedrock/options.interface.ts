import type { EAiBedrockLatency } from "@domain/enum/ai/provider/bedrock/latency.enum";
import type { EAiBedrockServiceTier } from "@domain/enum/ai/provider/bedrock/service-tier.enum";

export interface IAiBedrockProviderOptions {
	additionalModelRequestFields?: Record<string, unknown>;
	additionalModelResponseFieldPaths?: Array<string>;
	guardrailConfig?: Record<string, unknown>;
	performanceConfig?: {
		latency?: EAiBedrockLatency;
	};
	promptVariables?: Record<string, string>;
	requestMetadata?: Record<string, string>;
	serviceTier?: EAiBedrockServiceTier;
}
