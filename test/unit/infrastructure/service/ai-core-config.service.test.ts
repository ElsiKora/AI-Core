import type { IConfigClient, IConfigResult, IWatchHandle } from "@elsikora/configer";
import type { IAiCoreConfig } from "@/domain/interface/ai/core-config.interface.js";
import type { IAiModuleProfile } from "@/domain/interface/ai/module-profile.interface.js";
import type { TAiCoreModuleId } from "@/domain/type/ai-core-module-id.type.js";

import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createConfiger } from "@elsikora/configer";
import { describe, expect, it, vi } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";
import { AiCoreConfigService } from "@/infrastructure/service/ai-core-config.service.js";
import { NodeFileSystemService } from "@/infrastructure/service/node-file-system.service.js";

const createMockConfigClient = (
	overrides: Partial<IConfigClient<IAiCoreConfig>> = {},
): IConfigClient<IAiCoreConfig> => {
	const DEFAULT_FIND_RESULT: IConfigResult<IAiCoreConfig> | null = null;
	const DEFAULT_WATCH_HANDLE: IWatchHandle = {
		close: () => undefined,
	};

	const baseClient: IConfigClient<IAiCoreConfig> = {
		clearCaches: () => undefined,
		clearFindCache: () => undefined,
		clearReadCache: () => undefined,
		findConfig: async () => DEFAULT_FIND_RESULT,
		readConfig: async () => ({
			config: {},
			filepath: "/tmp/ai-core.config.js",
		}),
		watchConfig: () => DEFAULT_WATCH_HANDLE,
	};

	return {
		...baseClient,
		...overrides,
	};
};

const createRealConfigClient = (cwd: string): IConfigClient<IAiCoreConfig> => {
	return createConfiger<IAiCoreConfig>({
		cwd,
		moduleName: "ai-core",
		packageProperty: ["elsikora", "ai-core"],
		searchPlaces: ["package.json", ".elsikora/ai-core.config.js", ".elsikora/ai-core.config.json", ".elsikora/ai-core.config.yaml", ".elsikora/ai-core.config.yml"],
		searchStrategy: "workspace",
		shouldIgnoreEmptySearchPlaces: true,
		shouldMergeSearchPlaces: false,
	});
};

describe("AiCoreConfigService", () => {
	const mockFs = {
		createDirectory: vi.fn().mockResolvedValue(undefined),
		getDirectoryNameFromFilePath: (filePath: string): string => path.dirname(filePath),
		getExtensionFromFilePath: (filePath: string): string => path.extname(filePath),
		isPathExists: vi.fn().mockResolvedValue(false),
		writeFile: vi.fn().mockResolvedValue(undefined),
	};

	it("exists returns false when no config found", async () => {
		const findConfigMock = vi.fn().mockResolvedValue(null);
		const service = new AiCoreConfigService(
			mockFs as unknown as NodeFileSystemService,
			createMockConfigClient({ findConfig: findConfigMock }),
		);

		const isExists: boolean = await service.exists();

		expect(isExists).toBe(false);
	});

	it("get returns empty object when no config found", async () => {
		const findConfigMock = vi.fn().mockResolvedValue(null);
		const service = new AiCoreConfigService(
			mockFs as unknown as NodeFileSystemService,
			createMockConfigClient({ findConfig: findConfigMock }),
		);

		const config: IAiCoreConfig = await service.get();

		expect(config).toEqual({});
	});

	it("getModuleProfile returns undefined when module not in config", async () => {
		const findConfigMock = vi.fn().mockResolvedValue(null);
		const service = new AiCoreConfigService(
			mockFs as unknown as NodeFileSystemService,
			createMockConfigClient({ findConfig: findConfigMock }),
		);

		const profile: IAiModuleProfile | undefined = await service.getModuleProfile("unknown" as TAiCoreModuleId);

		expect(profile).toBeUndefined();
	});

	it("ignores non-object config values", async () => {
		const findConfigMock = vi.fn().mockResolvedValue({
			config: [],
			filepath: "/tmp/.elsikora/ai-core.config.js",
		});
		const service = new AiCoreConfigService(
			mockFs as unknown as NodeFileSystemService,
			createMockConfigClient({ findConfig: findConfigMock }),
		);

		const config: IAiCoreConfig = await service.get();

		expect(config).toEqual({});
	});

	it("set rejects persisting into package.json", async () => {
		const findConfigMock = vi.fn().mockResolvedValue({
			config: {},
			filepath: "/tmp/package.json",
		});
		const writeFileMock = vi.fn().mockResolvedValue(undefined);
		const service = new AiCoreConfigService(
			{
				...mockFs,
				writeFile: writeFileMock,
			} as unknown as NodeFileSystemService,
			createMockConfigClient({ findConfig: findConfigMock }),
		);

		await expect(service.set({})).rejects.toThrow("Persisting ai-core config into package.json is not supported");
		expect(writeFileMock).not.toHaveBeenCalled();
	});

	it("set writes default js config path and clears Configer caches", async () => {
		const clearCachesMock = vi.fn();
		const findConfigMock = vi.fn().mockResolvedValue(null);
		const createDirectoryMock = vi.fn().mockResolvedValue(undefined);
		const writeFileMock = vi.fn().mockResolvedValue(undefined);
		const processCwdSpy = vi.spyOn(process, "cwd").mockReturnValue("/tmp/ai-core-project");
		const service = new AiCoreConfigService(
			{
				...mockFs,
				createDirectory: createDirectoryMock,
				writeFile: writeFileMock,
			} as unknown as NodeFileSystemService,
			createMockConfigClient({
				clearCaches: clearCachesMock,
				findConfig: findConfigMock,
			}),
		);

		await service.set({
			modules: {},
		});

		processCwdSpy.mockRestore();

		expect(createDirectoryMock).toHaveBeenCalledWith("/tmp/ai-core-project/.elsikora");
		expect(writeFileMock).toHaveBeenCalledWith(
			"/tmp/ai-core-project/.elsikora/ai-core.config.js",
			expect.stringContaining("export default"),
		);
		expect(clearCachesMock).toHaveBeenCalledTimes(1);
	});

	it("setModuleProfile persists and resolves profile with real Configer + filesystem", async () => {
		const temporaryDirectory: string = await mkdtemp(path.join(os.tmpdir(), "ai-core-configer-"));
		const configDirectoryPath: string = path.join(temporaryDirectory, ".elsikora");
		const configFilePath: string = path.join(configDirectoryPath, "ai-core.config.json");
		const moduleId: TAiCoreModuleId = "commitizen" as TAiCoreModuleId;
		const moduleProfile: IAiModuleProfile = {
			model: "gpt-4o-mini",
			provider: ELLMProvider.OPENAI,
		};

		await mkdir(configDirectoryPath, { recursive: true });
		await writeFile(
			configFilePath,
			JSON.stringify({
				modules: {},
			}),
			"utf8",
		);

		const service = new AiCoreConfigService(
			new NodeFileSystemService(),
			createRealConfigClient(temporaryDirectory),
		);

		await service.setModuleProfile(moduleId, moduleProfile);

		const profile: IAiModuleProfile | undefined = await service.getModuleProfile(moduleId);

		expect(profile).toEqual(moduleProfile);
	});
});
