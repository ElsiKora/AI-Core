import type { EProfileInspectionStatus } from "@domain/enum/profile-inspection-status.enum";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";

/**
 * Profile inspection result when module profile is missing.
 */
export interface IMissingProfileInspectionResult {
	moduleId: TAiCoreModuleId;
	status: EProfileInspectionStatus.MISSING_PROFILE;
}
