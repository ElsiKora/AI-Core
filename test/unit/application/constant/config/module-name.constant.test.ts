import { describe, expect, it } from "vitest";

import { CONFIG_MODULE_NAME } from "@/application/constant/config/module-name.constant.js";

describe("module-name.constant", () => {
	it("exports CONFIG_MODULE_NAME as ai-core", () => {
		expect(CONFIG_MODULE_NAME).toBe("ai-core");
	});
});
