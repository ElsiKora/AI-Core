import type { ELLMProvider } from "../enum/llm-provider.enum.js";
import type { EProfileResolutionErrorCode } from "../enum/profile-resolution-error-code.enum.js";
import type { TAiCoreModuleId } from "../type/ai-core-module-id.type.js";

/**
 * Profile resolution error metadata.
 */
interface IProfileResolutionErrorInput {
	code: EProfileResolutionErrorCode;
	environmentVariableName?: string;
	message: string;
	moduleId: TAiCoreModuleId;
	provider?: ELLMProvider;
}

/**
 * Typed profile resolution error exposed by AI-Core.
 */
export class ProfileResolutionError extends Error {
	get code(): EProfileResolutionErrorCode {
		return this.CODE;
	}

	get environmentVariableName(): string | undefined {
		return this.ENVIRONMENT_VARIABLE_NAME;
	}

	get moduleId(): TAiCoreModuleId {
		return this.MODULE_ID;
	}

	get provider(): ELLMProvider | undefined {
		return this.PROVIDER;
	}

	private readonly CODE: EProfileResolutionErrorCode;

	private readonly ENVIRONMENT_VARIABLE_NAME?: string;

	private readonly MODULE_ID: TAiCoreModuleId;

	private readonly PROVIDER?: ELLMProvider;

	constructor(input: IProfileResolutionErrorInput) {
		super(input.message);
		this.name = "ProfileResolutionError";
		this.CODE = input.code;
		this.MODULE_ID = input.moduleId;
		this.PROVIDER = input.provider;
		this.ENVIRONMENT_VARIABLE_NAME = input.environmentVariableName;
	}
}
