import { describe, expect, it } from "vitest";

import { EProfileResolutionErrorCode } from "@/domain/enum/profile-resolution-error-code.enum.js";

describe("profile-resolution-error-code.enum", () => {
	it("exposes canonical error codes", () => {
		expect(EProfileResolutionErrorCode.MISSING_PROFILE).toBe("missing_profile");
		expect(EProfileResolutionErrorCode.MISSING_CREDENTIAL).toBe("missing_credential");
		expect(EProfileResolutionErrorCode.INVALID_PROFILE).toBe("invalid_profile");
	});
});
