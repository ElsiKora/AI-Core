import type { EGenerateMode } from "@domain/enum/generate-mode.enum";
import type { IGenerateBaseInput } from "@domain/interface/generate/base-input.interface";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";

/**
 * Profile generation mode input.
 */
export interface IGenerateProfileInput extends IGenerateBaseInput {
	credential?: string;
	mode: EGenerateMode.PROFILE;
	moduleId: TAiCoreModuleId;
	provider?: never;
}
