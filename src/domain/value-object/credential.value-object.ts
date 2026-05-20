import { NUMERIC_CONSTANT } from "@domain/constant/numeric.constant";

/**
 * Value object that wraps credential strings used by providers.
 */
export class Credential {
	private readonly VALUE: string;

	constructor(value: string) {
		if (!value || value.trim().length === 0) {
			throw new Error("Credential cannot be empty");
		}

		this.VALUE = value.trim();
	}

	/**
	 * Compare credentials.
	 * @param {Credential} other - Credential to compare.
	 * @returns {boolean} Equality flag.
	 */
	equals(other: Credential): boolean {
		return this.VALUE === other.VALUE;
	}

	/**
	 * Raw credential value.
	 * @returns {string} Credential value.
	 */
	getValue(): string {
		return this.VALUE;
	}

	/**
	 * Basic placeholder validation.
	 * @returns {boolean} True when it looks like a real credential.
	 */
	isValid(): boolean {
		return this.VALUE.length > NUMERIC_CONSTANT.MIN_CREDENTIAL_LENGTH && !this.VALUE.includes("your-api-key");
	}

	/**
	 * Redacted version for logs.
	 * @returns {string} Redacted credential.
	 */
	toRedacted(): string {
		if (this.VALUE.length <= NUMERIC_CONSTANT.REDACTED_VISIBLE_LENGTH) {
			return "****";
		}

		return this.VALUE.slice(0, NUMERIC_CONSTANT.REDACTED_VISIBLE_LENGTH) + "..." + this.VALUE.slice(-NUMERIC_CONSTANT.REDACTED_VISIBLE_LENGTH);
	}
}
