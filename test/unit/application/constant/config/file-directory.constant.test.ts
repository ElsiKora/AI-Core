import { describe, expect, it } from "vitest";

import { CONFIG_FILE_DIRECTORY } from "@/application/constant/config/file-directory.constant.js";

describe("file-directory.constant", () => {
	it("exports CONFIG_FILE_DIRECTORY as .elsikora", () => {
		expect(CONFIG_FILE_DIRECTORY).toBe(".elsikora");
	});
});
