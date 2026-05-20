import type { EProfileInspectionStatus } from "@domain/enum/profile-inspection-status.enum";
import type { IResolvedModuleProfile } from "@domain/interface/resolved-module-profile.interface";

/**
 * Profile inspection result when profile is fully ready.
 */
export interface IReadyProfileInspectionResult {
	profile: IResolvedModuleProfile;
	status: EProfileInspectionStatus.READY;
}
