/**
 * Runtime tuning options shared by profiles and requests.
 */
export interface IAiRuntimeOptions {
	maxTokens?: number;
	retries?: number;
	temperature?: number;
	validationRetries?: number;
}
