import type { Credential } from "../value-object/credential.value-object.js";

import type { IResolvedModuleRuntimeProfile } from "./resolved-module-runtime-profile.interface.js";

/**
 * Fully resolved profile ready for generation.
 */
export interface IResolvedModuleProfile extends IResolvedModuleRuntimeProfile {
	credential: Credential;
}
