import { describe, expect, it } from "vitest";

import type { IAiCoreAdapterOptions } from "@/presentation/ai-core/options.interface.js";

describe("options.interface", () => {
	it("IAiCoreAdapterOptions allows optional beanOptions", () => {
		const options: IAiCoreAdapterOptions = {
			beanOptions: {
				isSilent: true,
			},
		};
		expect(options.beanOptions?.isSilent).toBe(true);
	});

	it("IAiCoreAdapterOptions allows optional cliInterface", () => {
		const options: IAiCoreAdapterOptions = {};
		expect(options).toBeDefined();
		expect(options.cliInterface).toBeUndefined();
	});
});
