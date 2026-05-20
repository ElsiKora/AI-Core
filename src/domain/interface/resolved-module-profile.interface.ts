import type { IResolvedModuleRuntimeProfile } from "@domain/interface/resolved-module-runtime-profile.interface";
import type { Credential } from "@domain/value-object/credential.value-object";

/**
 * Fully resolved profile ready for generation.
 */
export interface IResolvedModuleProfile extends IResolvedModuleRuntimeProfile {
	credential: Credential;
}
