import type { EProfileInspectionStatus } from "../enum/profile-inspection-status.enum.js";
import type { TAiCoreModuleId } from "../type/ai-core-module-id.type.js";

import type { IResolvedModuleProfile } from "./resolved-module-profile.interface.js";
import type { IResolvedModuleRuntimeProfile } from "./resolved-module-runtime-profile.interface.js";

/**
 * Profile inspection result when module profile exists but is invalid.
 */
export interface IInvalidProfileInspectionResult {
	moduleId: TAiCoreModuleId;
	reason: string;
	status: EProfileInspectionStatus.INVALID_PROFILE;
}

/**
 * Profile inspection result when runtime profile is valid but credential is unresolved.
 */
export interface IMissingCredentialInspectionResult {
	environmentVariableName: string;
	profile: IResolvedModuleRuntimeProfile;
	status: EProfileInspectionStatus.MISSING_CREDENTIAL;
}

/**
 * Profile inspection result when module profile is missing.
 */
export interface IMissingProfileInspectionResult {
	moduleId: TAiCoreModuleId;
	status: EProfileInspectionStatus.MISSING_PROFILE;
}

/**
 * Profile inspection result when profile is fully ready.
 */
export interface IReadyProfileInspectionResult {
	profile: IResolvedModuleProfile;
	status: EProfileInspectionStatus.READY;
}

/**
 * Canonical profile inspection output.
 */
export type TProfileInspectionResult = IInvalidProfileInspectionResult | IMissingCredentialInspectionResult | IMissingProfileInspectionResult | IReadyProfileInspectionResult;
