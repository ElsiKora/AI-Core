import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { IAiRuntimeOptions } from "@domain/interface/ai/runtime-options.interface";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";

/**
 * Runtime profile resolved from config without credential materialization.
 */
export interface IResolvedModuleRuntimeProfile extends IAiRuntimeOptions {
	model: string;
	moduleId: TAiCoreModuleId;
	provider: ELLMProvider;
	retries: number;
	validationRetries: number;
}
