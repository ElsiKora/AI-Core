import type { IAiAnthropicProviderOptions } from "@domain/interface/ai/provider/anthropic";
import type { IAiGoogleProviderOptions } from "@domain/interface/ai/provider/google";
import type { IAiOpenAiProviderOptions } from "@domain/interface/ai/provider/openai";
import type { IAiVercelAiGatewayRoutingOptions } from "@domain/interface/ai/provider/vercel/gateway-options.interface";

export interface IAiVercelAiGatewayProviderOptions {
	anthropic?: IAiAnthropicProviderOptions;
	gateway?: IAiVercelAiGatewayRoutingOptions;
	google?: IAiGoogleProviderOptions;
	openai?: IAiOpenAiProviderOptions;
	providerOptions?: Record<string, Record<string, unknown>>;
}
