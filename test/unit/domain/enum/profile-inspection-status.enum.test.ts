import { describe, expect, it } from "vitest";

import { EProfileInspectionStatus } from "@/domain/enum/profile-inspection-status.enum.js";

describe("profile-inspection-status.enum", () => {
	it("exposes canonical inspection statuses", () => {
		expect(EProfileInspectionStatus.READY).toBe("ready");
		expect(EProfileInspectionStatus.MISSING_PROFILE).toBe("missing_profile");
		expect(EProfileInspectionStatus.MISSING_CREDENTIAL).toBe("missing_credential");
		expect(EProfileInspectionStatus.INVALID_PROFILE).toBe("invalid_profile");
	});
});
