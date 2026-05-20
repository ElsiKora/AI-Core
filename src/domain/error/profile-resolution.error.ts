import type { ELLMProvider } from "@domain/enum/llm-provider.enum";
import type { EProfileResolutionErrorCode } from "@domain/enum/profile-resolution-error-code.enum";
import type { IProfileResolutionErrorInput } from "@domain/interface/profile-resolution-error";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";

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
