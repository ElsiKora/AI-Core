import type { IAiCoreConfig } from "@domain/interface/ai/core-config.interface";
import type { IAiModuleProfile } from "@domain/interface/ai/module-profile.interface";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";

/**
 * Persistent configuration port.
 */
export interface IConfigService {
	exists(): Promise<boolean>;
	get(): Promise<IAiCoreConfig>;
	getModuleProfile(moduleId: TAiCoreModuleId): Promise<IAiModuleProfile | undefined>;
	set(config: IAiCoreConfig): Promise<void>;
	setModuleProfile(moduleId: TAiCoreModuleId, profile: IAiModuleProfile): Promise<void>;
}
