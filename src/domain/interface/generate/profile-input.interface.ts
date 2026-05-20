import type { EGenerateMode } from "../../enum/generate-mode.enum.js";
import type { TAiCoreModuleId } from "../../type/ai-core-module-id.type.js";

import type { IGenerateBaseInput } from "./base-input.interface.js";

/**
 * Profile generation mode input.
 */
export interface IGenerateProfileInput extends IGenerateBaseInput {
	credential?: string;
	mode: EGenerateMode.PROFILE;
	moduleId: TAiCoreModuleId;
	provider?: never;
}
