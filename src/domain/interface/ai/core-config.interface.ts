import type { IAiModelAlias } from "@domain/interface/ai/model-alias.interface";
import type { IAiModuleProfile } from "@domain/interface/ai/module-profile.interface";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";

/**
 * Root AI-Core configuration loaded from file/package sources.
 */
export interface IAiCoreConfig {
	aliases?: Record<string, IAiModelAlias>;
	modules?: Partial<Record<TAiCoreModuleId, IAiModuleProfile>>;
}
