import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Minimal filesystem adapter for config persistence.
 */
export class NodeFileSystemService {
	async createDirectory(directoryPath: string): Promise<void> {
		// eslint-disable-next-line @elsikora/typescript/naming-convention
		await mkdir(directoryPath, { recursive: true });
	}

	getDirectoryNameFromFilePath(filePath: string): string {
		return path.dirname(filePath);
	}

	getExtensionFromFilePath(filePath: string): string {
		return path.extname(filePath);
	}

	async isPathExists(filePath: string): Promise<boolean> {
		try {
			await stat(filePath);

			return true;
		} catch {
			return false;
		}
	}

	async writeFile(filePath: string, content: string): Promise<void> {
		await writeFile(filePath, content, "utf8");
	}
}
