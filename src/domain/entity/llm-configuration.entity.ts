import type { ELLMProvider } from "../enum/llm-provider.enum.js";
import type { Credential } from "../value-object/credential.value-object.js";

import { DEFAULT_MAX_RETRIES, DEFAULT_VALIDATION_RETRIES } from "../constant/numeric.constant.js";

/**
 * Immutable generation configuration.
 */
export class LlmConfiguration {
	private readonly CREDENTIAL: Credential;

	private readonly MAX_TOKENS: number | undefined;

	private readonly MODEL: string | undefined;

	private readonly PROVIDER: ELLMProvider;

	private readonly RETRIES: number;

	private readonly TEMPERATURE: number | undefined;

	private readonly VALIDATION_RETRIES: number;

	constructor(provider: ELLMProvider, credential: Credential, model?: string, maxTokens?: number, temperature?: number, retries: number = DEFAULT_MAX_RETRIES, validationRetries: number = DEFAULT_VALIDATION_RETRIES) {
		this.PROVIDER = provider;
		this.CREDENTIAL = credential;
		this.MODEL = model;
		this.MAX_TOKENS = maxTokens;
		this.TEMPERATURE = temperature;
		this.RETRIES = retries;
		this.VALIDATION_RETRIES = validationRetries;
	}

	getCredential(): Credential {
		return this.CREDENTIAL;
	}

	getMaxTokens(): number | undefined {
		return this.MAX_TOKENS;
	}

	getModel(): string | undefined {
		return this.MODEL;
	}

	getProvider(): ELLMProvider {
		return this.PROVIDER;
	}

	getRetries(): number {
		return this.RETRIES;
	}

	getTemperature(): number | undefined {
		return this.TEMPERATURE;
	}

	getValidationRetries(): number {
		return this.VALIDATION_RETRIES;
	}

	withCredential(credential: Credential): LlmConfiguration {
		return new LlmConfiguration(this.PROVIDER, credential, this.MODEL, this.MAX_TOKENS, this.TEMPERATURE, this.RETRIES, this.VALIDATION_RETRIES);
	}

	withModel(model: string): LlmConfiguration {
		return new LlmConfiguration(this.PROVIDER, this.CREDENTIAL, model, this.MAX_TOKENS, this.TEMPERATURE, this.RETRIES, this.VALIDATION_RETRIES);
	}
}
