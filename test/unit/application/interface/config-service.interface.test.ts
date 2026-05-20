import { describe, expect, it } from "vitest";

import type { IConfigService } from "@/application/interface/config-service.interface.js";

describe("config-service.interface", () => {
	it("IConfigService requires get, set, exists, getModuleProfile, setModuleProfile", () => {
		const mock: IConfigService = {
			exists: async () => false,
			get: async () => ({}),
			getModuleProfile: async () => undefined,
			set: async () => {},
			setModuleProfile: async () => {},
		};
		expect(mock.get).toBeDefined();
		expect(mock.setModuleProfile).toBeDefined();
	});
});
