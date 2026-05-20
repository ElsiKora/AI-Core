/**
 * Infrastructure-level detector for provider authentication failures.
 */
export class LlmAuthenticationErrorDetectorService {
	static isAuthenticationError(error: unknown): boolean {
		const message: string = this.getErrorMessage(error).toLowerCase();

		return message.includes("unauthorized") || message.includes("authentication") || message.includes("api key") || message.includes("invalid key") || message.includes("401") || message.includes("403");
	}

	private static getErrorMessage(error: unknown): string {
		if (error === null || error === undefined) {
			return "Unknown error";
		}

		if (error instanceof Error) {
			return error.message;
		}

		if (typeof error === "string") {
			return error;
		}

		try {
			return JSON.stringify(error);
		} catch {
			return "Unknown error";
		}
	}
}
