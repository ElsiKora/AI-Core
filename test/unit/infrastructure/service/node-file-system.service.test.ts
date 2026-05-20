import path from "node:path";
import { readFile, rm } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { NodeFileSystemService } from "@/infrastructure/service/node-file-system.service.js";

describe("NodeFileSystemService", () => {
	const service = new NodeFileSystemService();
	const testDir = path.join(process.cwd(), ".test-tmp-node-fs");

	it("getDirectoryNameFromFilePath returns dirname", () => {
		expect(service.getDirectoryNameFromFilePath("/a/b/file.js")).toBe("/a/b");
		expect(service.getDirectoryNameFromFilePath("file.txt")).toBe(".");
	});

	it("getExtensionFromFilePath returns ext", () => {
		expect(service.getExtensionFromFilePath("file.json")).toBe(".json");
		expect(service.getExtensionFromFilePath("file.config.js")).toBe(".js");
	});

	it("createDirectory creates directory recursively", async () => {
		const dir = path.join(testDir, "nested", "path");
		await service.createDirectory(dir);
		await expect(service.isPathExists(dir)).resolves.toBe(true);
		await rm(testDir, { recursive: true, force: true });
	});

	it("writeFile writes content", async () => {
		const file = path.join(testDir, "written.txt");
		await service.createDirectory(testDir);
		await service.writeFile(file, "hello world");
		const content = await readFile(file, "utf8");
		expect(content).toBe("hello world");
		await rm(testDir, { recursive: true, force: true });
	});

	it("isPathExists returns false for non-existent path", async () => {
		const exists = await service.isPathExists(path.join(testDir, "nonexistent"));
		expect(exists).toBe(false);
	});
});
