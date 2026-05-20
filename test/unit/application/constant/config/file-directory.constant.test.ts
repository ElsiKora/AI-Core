import { describe, expect, it } from "vitest";

import { CONFIG_FILE_DIRECTORY_CONSTANT } from "@/application/constant/config/file-directory.constant";

describe("file-directory.constant", () => {
	it("exports CONFIG_FILE_DIRECTORY_CONSTANT.VALUE as .elsikora", () => {
		expect(CONFIG_FILE_DIRECTORY_CONSTANT.VALUE).toBe(".elsikora");
	});
});
