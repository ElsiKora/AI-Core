import { afterEach, describe, expect, it } from "vitest";

import { ProcessInteractiveShellService } from "@/infrastructure/service/process-interactive-shell.service.js";

const ORIGINAL_STDIN_TTY: boolean | undefined = process.stdin.isTTY;
const ORIGINAL_STDOUT_TTY: boolean | undefined = process.stdout.isTTY;

function setTty(stdinIsTty: boolean, stdoutIsTty: boolean): void {
	Object.defineProperty(process.stdin, "isTTY", {
		configurable: true,
		value: stdinIsTty,
	});
	Object.defineProperty(process.stdout, "isTTY", {
		configurable: true,
		value: stdoutIsTty,
	});
}

describe("ProcessInteractiveShellService", () => {
	const service = new ProcessInteractiveShellService();

	afterEach(() => {
		Object.defineProperty(process.stdin, "isTTY", {
			configurable: true,
			value: ORIGINAL_STDIN_TTY,
		});
		Object.defineProperty(process.stdout, "isTTY", {
			configurable: true,
			value: ORIGINAL_STDOUT_TTY,
		});
	});

	it("returns true when stdin and stdout are TTY", () => {
		setTty(true, true);
		expect(service.isInteractive()).toBe(true);
	});

	it("returns false when one of streams is not TTY", () => {
		setTty(true, false);
		expect(service.isInteractive()).toBe(false);
	});
});
