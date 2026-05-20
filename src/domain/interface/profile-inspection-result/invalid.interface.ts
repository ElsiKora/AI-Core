import type { EProfileInspectionStatus } from "@domain/enum/profile-inspection-status.enum";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";

/**
 * Profile inspection result when module profile exists but is invalid.
 */
export interface IInvalidProfileInspectionResult {
	moduleId: TAiCoreModuleId;
	reason: string;
	status: EProfileInspectionStatus.INVALID_PROFILE;
}
