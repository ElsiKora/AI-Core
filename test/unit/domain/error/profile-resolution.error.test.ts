import { describe, expect, it } from "vitest";

import { EProfileResolutionErrorCode } from "@/domain/enum/profile-resolution-error-code.enum.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";
import { ProfileResolutionError } from "@/domain/error/profile-resolution.error.js";

describe("ProfileResolutionError", () => {
	it("stores typed metadata for profile resolution failures", () => {
		const error = new ProfileResolutionError({
			code: EProfileResolutionErrorCode.MISSING_CREDENTIAL,
			environmentVariableName: "OPENAI_API_KEY",
			message: "Credential is missing",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
		});

		expect(error.name).toBe("ProfileResolutionError");
		expect(error.code).toBe(EProfileResolutionErrorCode.MISSING_CREDENTIAL);
		expect(error.moduleId).toBe("commitizen");
		expect(error.provider).toBe(ELLMProvider.OPENAI);
		expect(error.environmentVariableName).toBe("OPENAI_API_KEY");
	});
});
