import type { ELLMProvider } from "../enum/llm-provider.enum.js";
import type { TAiCoreModuleId } from "../type/ai-core-module-id.type.js";

/**
 * Runtime profile resolved from config without credential materialization.
 */
export interface IResolvedModuleRuntimeProfile {
	maxTokens?: number;
	model: string;
	moduleId: TAiCoreModuleId;
	provider: ELLMProvider;
	retries: number;
	temperature?: number;
	validationRetries: number;
}
