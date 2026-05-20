import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { Credential } from "@domain/value-object/credential.value-object";

import { NUMERIC_CONSTANT } from "@domain/constant/numeric.constant";

/**
 * Immutable generation configuration.
 */
export class LlmConfiguration {
	private readonly CREDENTIAL: Credential;

	private readonly GENERATION_OPTIONS: IGenerationOptions;

	private readonly MODEL: string | undefined;

	private readonly PROVIDER: ELLMProvider;

	private readonly RETRIES: number;

	private readonly VALIDATION_RETRIES: number;

	constructor(provider: ELLMProvider, credential: Credential, model?: string, maxTokens?: number, temperature?: number, retries: number = NUMERIC_CONSTANT.DEFAULT_MAX_RETRIES, validationRetries: number = NUMERIC_CONSTANT.DEFAULT_VALIDATION_RETRIES, generationOptions: IGenerationOptions = {}) {
		this.PROVIDER = provider;
		this.CREDENTIAL = credential;
		this.MODEL = model;
		this.RETRIES = retries;
		this.VALIDATION_RETRIES = validationRetries;
		this.GENERATION_OPTIONS = {
			...generationOptions,
			maxTokens: maxTokens ?? generationOptions.maxTokens,
			temperature: temperature ?? generationOptions.temperature,
		};
	}

	getCredential(): Credential {
		return this.CREDENTIAL;
	}

	getGenerationOptions(): IGenerationOptions {
		return this.GENERATION_OPTIONS;
	}

	getMaxTokens(): number | undefined {
		return this.GENERATION_OPTIONS.maxTokens;
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
		return this.GENERATION_OPTIONS.temperature;
	}

	getValidationRetries(): number {
		return this.VALIDATION_RETRIES;
	}

	withCredential(credential: Credential): LlmConfiguration {
		return new LlmConfiguration(this.PROVIDER, credential, this.MODEL, this.getMaxTokens(), this.getTemperature(), this.RETRIES, this.VALIDATION_RETRIES, this.GENERATION_OPTIONS);
	}

	withModel(model: string): LlmConfiguration {
		return new LlmConfiguration(this.PROVIDER, this.CREDENTIAL, model, this.getMaxTokens(), this.getTemperature(), this.RETRIES, this.VALIDATION_RETRIES, this.GENERATION_OPTIONS);
	}
}
