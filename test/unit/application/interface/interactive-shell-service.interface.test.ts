import { describe, expect, it } from "vitest";

import type { IInteractiveShellService } from "@/application/interface/interactive-shell-service.interface.js";

describe("interactive-shell-service.interface", () => {
	it("IInteractiveShellService requires isInteractive", () => {
		const mock: IInteractiveShellService = {
			isInteractive: () => true,
		};
		expect(mock.isInteractive()).toBe(true);
	});
});
