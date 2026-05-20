import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { Credential } from "@domain/value-object/credential.value-object";

/**
 * Credential lookup port.
 */
export interface ICredentialResolver {
	resolve(provider: ELLMProvider): Credential | null;
}
