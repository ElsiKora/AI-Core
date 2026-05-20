import { describe, expect, it } from "vitest";

import type { ICliInterfaceService } from "@/application/interface/cli-interface-service.interface.js";

describe("cli-interface-service.interface", () => {
	it("ICliInterfaceService requires select, confirm, text, password, info, success, warn", () => {
		const mock: ICliInterfaceService = {
			confirm: async () => false,
			info: () => {},
			password: async () => "secret",
			select: async <T>() => "value" as T,
			success: () => {},
			text: async () => "input",
			warn: () => {},
		};
		expect(mock.select).toBeDefined();
		expect(mock.confirm).toBeDefined();
		expect(mock.password).toBeDefined();
		expect(mock.text).toBeDefined();
	});
});
