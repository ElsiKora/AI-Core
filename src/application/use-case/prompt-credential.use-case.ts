import type { ICliInterfaceService } from "@application/interface/cli-interface-service.interface";
import type { ICredentialResolver } from "@application/interface/credential-resolver.interface";
import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { Credential } from "@domain/value-object/credential.value-object";

import { PROVIDER_CREDENTIAL_FORMAT_CONSTANT } from "@domain/constant/provider/credential-format.constant";
import { Credential as CredentialValue } from "@domain/value-object/credential.value-object";

/**
 * Resolves provider credential from environment or asks interactively.
 */
export class PromptCredentialUseCase {
	private readonly CLI_INTERFACE: ICliInterfaceService;

	private readonly CREDENTIAL_RESOLVER: ICredentialResolver;

	constructor(credentialResolver: ICredentialResolver, cliInterface: ICliInterfaceService) {
		this.CREDENTIAL_RESOLVER = credentialResolver;
		this.CLI_INTERFACE = cliInterface;
	}

	async execute(provider: ELLMProvider, shouldBypassEnvironmentCredential: boolean = false): Promise<Credential> {
		const resolvedCredential: Credential | null = shouldBypassEnvironmentCredential ? null : this.CREDENTIAL_RESOLVER.resolve(provider);

		if (resolvedCredential) {
			return resolvedCredential;
		}

		const formatHint: string = PROVIDER_CREDENTIAL_FORMAT_CONSTANT.MAP[provider] ?? "";

		const credentialText: string = await this.CLI_INTERFACE.password(`Enter credential for provider '${provider}'${formatHint}:`);

		return new CredentialValue(credentialText);
	}
}
