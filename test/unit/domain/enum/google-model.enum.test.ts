import { describe, expect, it } from "vitest";

import { EGoogleModel } from "@/domain/enum/google-model.enum";

describe("google-model.enum", () => {
	it("exports known model values", () => {
		expect(EGoogleModel.GEMINI_2_5_FLASH).toBeDefined();
		expect(EGoogleModel.GEMINI_3_5_FLASH).toBe("gemini-3.5-flash");
		expect(EGoogleModel.GEMINI_3_1_FLASH_LITE).toBe("gemini-3.1-flash-lite");
		expect(EGoogleModel.GEMINI_3_FLASH_PREVIEW).toBe("gemini-3-flash-preview");
		expect(EGoogleModel.GEMINI_3_1_PRO_PREVIEW).toBe("gemini-3.1-pro-preview");
	});

	it("Object.values returns non-empty array", () => {
		expect(Object.values(EGoogleModel).length).toBeGreaterThan(0);
	});
});
