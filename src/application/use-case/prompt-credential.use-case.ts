import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { Credential } from "../../domain/value-object/credential.value-object.js";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface.js";
import type { ICredentialResolver } from "../interface/credential-resolver.interface.js";

import { PROVIDER_CREDENTIAL_FORMAT_MAP } from "../../domain/constant/provider/credential-format.constant.js";
import { Credential as CredentialValue } from "../../domain/value-object/credential.value-object.js";

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

	async execute(provider: ELLMProvider): Promise<Credential> {
		const resolvedCredential: Credential | null = this.CREDENTIAL_RESOLVER.resolve(provider);

		if (resolvedCredential) {
			return resolvedCredential;
		}

		const formatHint: string = PROVIDER_CREDENTIAL_FORMAT_MAP[provider] ?? "";

		this.CLI_INTERFACE.info(`No environment credential found.${formatHint}`);

		const credentialText: string = await this.CLI_INTERFACE.password(`Enter credential for provider '${provider}'${formatHint}:`);

		return new CredentialValue(credentialText);
	}
}
