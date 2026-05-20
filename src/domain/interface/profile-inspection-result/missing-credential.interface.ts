import type { EProfileInspectionStatus } from "@domain/enum/profile-inspection-status.enum";
import type { IResolvedModuleRuntimeProfile } from "@domain/interface/resolved-module-runtime-profile.interface";

/**
 * Profile inspection result when runtime profile is valid but credential is unresolved.
 */
export interface IMissingCredentialInspectionResult {
	environmentVariableName: string;
	profile: IResolvedModuleRuntimeProfile;
	status: EProfileInspectionStatus.MISSING_CREDENTIAL;
}
