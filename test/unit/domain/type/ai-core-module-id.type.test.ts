import { describe, expect, it } from "vitest";

import type { TAiCoreModuleId } from "@/domain/type/ai-core-module-id.type.js";

describe("ai-core-module-id.type", () => {
	it("TAiCoreModuleId accepts string values", () => {
		const id: TAiCoreModuleId = "commitizen";
		expect(id).toBe("commitizen");
	});
});
