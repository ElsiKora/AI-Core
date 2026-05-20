import type { ICredentialResolver } from "../../application/interface/credential-resolver.interface.js";
import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { Credential } from "../../domain/value-object/credential.value-object.js";

import { PROVIDER_ENV_VARIABLE_MAP } from "../../domain/constant/provider/env-variable.constant.js";
import { Credential as CredentialValue } from "../../domain/value-object/credential.value-object.js";

/**
 * Reads provider credentials from environment variables.
 */
export class EnvironmentCredentialResolver implements ICredentialResolver {
	resolve(provider: ELLMProvider): Credential | null {
		const environmentVariableName: string | undefined = PROVIDER_ENV_VARIABLE_MAP[provider];

		if (!environmentVariableName) {
			return null;
		}

		const value: string | undefined = process.env[environmentVariableName];

		if (!value || value.trim().length === 0) {
			return null;
		}

		return new CredentialValue(value);
	}
}
