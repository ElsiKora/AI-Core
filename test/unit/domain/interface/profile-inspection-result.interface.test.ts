import { describe, expect, it } from "vitest";

import type { TProfileInspectionResult } from "@/domain/type/profile-inspection-result.type";

import { EProfileInspectionStatus } from "@/domain/enum/profile-inspection-status.enum";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { Credential } from "@/domain/value-object/credential.value-object";

describe("profile-inspection-result.interface", () => {
	it("supports all canonical inspection result variants", () => {
		const readyResult: TProfileInspectionResult = {
			profile: {
				credential: new Credential("sk-test"),
				model: "gpt-4o",
				moduleId: "commitizen",
				provider: ELLMProvider.OPENAI,
				retries: 3,
				validationRetries: 3,
			},
			status: EProfileInspectionStatus.READY,
		};
		const missingProfileResult: TProfileInspectionResult = {
			moduleId: "commitizen",
			status: EProfileInspectionStatus.MISSING_PROFILE,
		};
		const missingCredentialResult: TProfileInspectionResult = {
			environmentVariableName: "OPENAI_API_KEY",
			profile: {
				model: "gpt-4o",
				moduleId: "commitizen",
				provider: ELLMProvider.OPENAI,
				retries: 3,
				validationRetries: 3,
			},
			status: EProfileInspectionStatus.MISSING_CREDENTIAL,
		};
		const invalidProfileResult: TProfileInspectionResult = {
			moduleId: "commitizen",
			reason: "Provider is missing.",
			status: EProfileInspectionStatus.INVALID_PROFILE,
		};

		expect(readyResult.status).toBe(EProfileInspectionStatus.READY);
		expect(missingProfileResult.status).toBe(EProfileInspectionStatus.MISSING_PROFILE);
		expect(missingCredentialResult.status).toBe(EProfileInspectionStatus.MISSING_CREDENTIAL);
		expect(invalidProfileResult.status).toBe(EProfileInspectionStatus.INVALID_PROFILE);
	});
});
