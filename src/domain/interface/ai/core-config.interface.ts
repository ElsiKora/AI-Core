import type { TAiCoreModuleId } from "../../type/ai-core-module-id.type.js";

import type { IAiModelAlias } from "./model-alias.interface.js";
import type { IAiModuleProfile } from "./module-profile.interface.js";

/**
 * Root AI-Core configuration loaded from file/package sources.
 */
export interface IAiCoreConfig {
	aliases?: Record<string, IAiModelAlias>;
	modules?: Partial<Record<TAiCoreModuleId, IAiModuleProfile>>;
}
