import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { EProfileResolutionErrorCode } from "@domain/enum/profile-resolution-error-code.enum";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";

/**
 * Profile resolution error metadata.
 */
export interface IProfileResolutionErrorInput {
	code: EProfileResolutionErrorCode;
	environmentVariableName?: string;
	message: string;
	moduleId: TAiCoreModuleId;
	provider?: ELLMProvider;
}
