import type { IInteractiveShellService } from "@application/interface/interactive-shell-service.interface";

/**
 * Node process-backed interactive shell detector.
 */
export class ProcessInteractiveShellService implements IInteractiveShellService {
	isInteractive(): boolean {
		return process.stdin.isTTY && process.stdout.isTTY;
	}
}
