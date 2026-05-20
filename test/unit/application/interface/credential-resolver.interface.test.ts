import { describe, expect, it } from "vitest";

import type { ICredentialResolver } from "@/application/interface/credential-resolver.interface.js";

describe("credential-resolver.interface", () => {
	it("ICredentialResolver requires resolve method", () => {
		const mock: ICredentialResolver = {
			resolve: () => null,
		};
		expect(mock.resolve).toBeDefined();
	});
});
