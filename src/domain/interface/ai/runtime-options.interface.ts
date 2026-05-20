import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";

/**
 * Runtime tuning options shared by profiles and requests.
 */
export interface IAiRuntimeOptions extends IGenerationOptions {
	retries?: number;
	validationRetries?: number;
}
