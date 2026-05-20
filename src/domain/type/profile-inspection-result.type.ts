import type { IInvalidProfileInspectionResult, IMissingCredentialInspectionResult, IMissingProfileInspectionResult, IReadyProfileInspectionResult } from "@domain/interface/profile-inspection-result";

/**
 * Canonical profile inspection output.
 */
export type TProfileInspectionResult = IInvalidProfileInspectionResult | IMissingCredentialInspectionResult | IMissingProfileInspectionResult | IReadyProfileInspectionResult;
