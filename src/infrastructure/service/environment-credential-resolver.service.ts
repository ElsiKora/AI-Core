import type { ICredentialResolver } from "@application/interface/credential-resolver.interface";
import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { Credential } from "@domain/value-object/credential.value-object";

import { PROVIDER_ENVIRONMENT_VARIABLE_CONSTANT } from "@domain/constant/provider/environment-variable.constant";
import { Credential as CredentialValue } from "@domain/value-object/credential.value-object";

/**
 * Reads provider credentials from environment variables.
 */
export class EnvironmentCredentialResolver implements ICredentialResolver {
	resolve(provider: ELLMProvider): Credential | null {
		const environmentVariableName: string | undefined = PROVIDER_ENVIRONMENT_VARIABLE_CONSTANT.MAP[provider];

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
