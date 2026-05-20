import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { Credential } from "../../domain/value-object/credential.value-object.js";

/**
 * Credential lookup port.
 */
export interface ICredentialResolver {
	resolve(provider: ELLMProvider): Credential | null;
}
