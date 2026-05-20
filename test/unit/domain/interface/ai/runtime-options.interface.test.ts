import { describe, expect, it } from "vitest";

import type { IAiRuntimeOptions } from "@/domain/interface/ai/runtime-options.interface";

describe("runtime-options.interface", () => {
	it("IAiRuntimeOptions can be empty object", () => {
		const opts: IAiRuntimeOptions = {};
		expect(opts).toBeDefined();
	});
});
