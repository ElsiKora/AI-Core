import { describe, expect, it } from "vitest";

import type { IGenerateProfileInput } from "@/domain/interface/generate/profile-input.interface.js";
import { EGenerateMode } from "@/domain/enum/generate-mode.enum.js";

describe("profile-input.interface", () => {
	it("IGenerateProfileInput requires moduleId", () => {
		const input: IGenerateProfileInput = {
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
		};

		expect(input.mode).toBe(EGenerateMode.PROFILE);
		expect(input.moduleId).toBe("commitizen");
	});
});
