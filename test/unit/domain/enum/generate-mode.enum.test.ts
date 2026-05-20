import { describe, expect, it } from "vitest";

import { EGenerateMode } from "@/domain/enum/generate-mode.enum.js";

describe("generate-mode.enum", () => {
	it("exports expected generation modes", () => {
		expect(EGenerateMode.DIRECT).toBe("direct");
		expect(EGenerateMode.PROFILE).toBe("profile");
	});

	it("Object.values returns 2 generation modes", () => {
		expect(Object.values(EGenerateMode)).toHaveLength(2);
	});
});
