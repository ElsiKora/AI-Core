import { describe, expect, it } from "vitest";

import { CONFIG_MODULE_NAME_CONSTANT } from "@/application/constant/config/module-name.constant";

describe("module-name.constant", () => {
	it("exports CONFIG_MODULE_NAME_CONSTANT.VALUE as ai-core", () => {
		expect(CONFIG_MODULE_NAME_CONSTANT.VALUE).toBe("ai-core");
	});
});
