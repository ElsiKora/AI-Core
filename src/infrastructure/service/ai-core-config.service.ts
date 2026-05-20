import type { IConfigService } from "@application/interface/config-service.interface";
import type { IAiCoreConfig } from "@domain/interface/ai/core-config.interface";
import type { IAiModuleProfile } from "@domain/interface/ai/module-profile.interface";
import type { TAiCoreModuleId } from "@domain/type/ai-core-module-id.type";
import type { IConfigClient, IConfigResult } from "@elsikora/configer";

import path from "node:path";

import { CONFIG_FILE_DIRECTORY_CONSTANT, CONFIG_MODULE_NAME_CONSTANT } from "@application/constant/config";
import { createConfiger } from "@elsikora/configer";
import { NodeFileSystemService } from "@infrastructure/service/node-file-system.service";
import { stringify as stringifyJavaScript } from "javascript-stringify";
import { stringify as stringifyYaml } from "yaml";

const CONFIG_SEARCH_PLACES: Array<string> = ["package.json", `${CONFIG_FILE_DIRECTORY_CONSTANT.VALUE}/${CONFIG_MODULE_NAME_CONSTANT.VALUE}.config.js`, `${CONFIG_FILE_DIRECTORY_CONSTANT.VALUE}/${CONFIG_MODULE_NAME_CONSTANT.VALUE}.config.json`, `${CONFIG_FILE_DIRECTORY_CONSTANT.VALUE}/${CONFIG_MODULE_NAME_CONSTANT.VALUE}.config.yaml`, `${CONFIG_FILE_DIRECTORY_CONSTANT.VALUE}/${CONFIG_MODULE_NAME_CONSTANT.VALUE}.config.yml`];

const PACKAGE_PROPERTY_PATH: Array<string> = [CONFIG_FILE_DIRECTORY_CONSTANT.VALUE.replace(/^\./, ""), CONFIG_MODULE_NAME_CONSTANT.VALUE];

/**
 * Configer-based module profile storage.
 */
export class AiCoreConfigService implements IConfigService {
	private readonly CONFIG_CLIENT: IConfigClient<IAiCoreConfig>;

	private readonly FILE_SYSTEM_SERVICE: NodeFileSystemService;

	constructor(
		fileSystemService: NodeFileSystemService = new NodeFileSystemService(),
		configClient: IConfigClient<IAiCoreConfig> = createConfiger<IAiCoreConfig>({
			moduleName: CONFIG_MODULE_NAME_CONSTANT.VALUE,
			packageProperty: PACKAGE_PROPERTY_PATH,
			searchPlaces: CONFIG_SEARCH_PLACES,
			searchStrategy: "workspace",
			shouldIgnoreEmptySearchPlaces: true,
			shouldMergeSearchPlaces: false,
		}),
	) {
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.CONFIG_CLIENT = configClient;
	}

	async exists(): Promise<boolean> {
		const result: IConfigResult<IAiCoreConfig> | null = await this.CONFIG_CLIENT.findConfig();

		return Boolean(result?.filepath);
	}

	async get(): Promise<IAiCoreConfig> {
		const result: IConfigResult<IAiCoreConfig> | null = await this.CONFIG_CLIENT.findConfig();

		if (!result || !this.isConfig(result.config)) {
			return {};
		}

		return result.config;
	}

	async getModuleProfile(moduleId: TAiCoreModuleId): Promise<IAiModuleProfile | undefined> {
		const config: IAiCoreConfig = await this.get();

		return config.modules?.[moduleId];
	}

	async set(config: IAiCoreConfig): Promise<void> {
		const searchResult: IConfigResult<IAiCoreConfig> | null = await this.CONFIG_CLIENT.findConfig();
		const targetFilePath: string = searchResult?.filepath ?? this.getDefaultConfigPath();

		if (targetFilePath.endsWith("package.json")) {
			throw new Error("Persisting ai-core config into package.json is not supported");
		}

		await this.persistToConfigFile(targetFilePath, config);
		this.CONFIG_CLIENT.clearCaches();
	}

	async setModuleProfile(moduleId: TAiCoreModuleId, profile: IAiModuleProfile): Promise<void> {
		const currentConfig: IAiCoreConfig = await this.get();

		const nextConfig: IAiCoreConfig = {
			...currentConfig,
			modules: {
				...currentConfig.modules,
				[moduleId]: profile,
			},
		};

		await this.set(nextConfig);
	}

	private getDefaultConfigPath(): string {
		return path.join(process.cwd(), CONFIG_FILE_DIRECTORY_CONSTANT.VALUE, `${CONFIG_MODULE_NAME_CONSTANT.VALUE}.config.js`);
	}

	private isConfig(value: unknown): value is IAiCoreConfig {
		if (!this.isPlainObject(value)) {
			return false;
		}

		const config: Record<string, unknown> = value;

		if (config.aliases !== undefined && !this.isPlainObject(config.aliases)) {
			return false;
		}

		if (config.modules !== undefined && !this.isPlainObject(config.modules)) {
			return false;
		}

		return true;
	}

	private isPlainObject(value: unknown): value is Record<string, unknown> {
		return Object.prototype.toString.call(value) === "[object Object]";
	}

	private async persistToConfigFile(filePath: string, config: IAiCoreConfig): Promise<void> {
		const directoryPath: string = this.FILE_SYSTEM_SERVICE.getDirectoryNameFromFilePath(filePath);
		await this.FILE_SYSTEM_SERVICE.createDirectory(directoryPath);

		const extension: string = this.FILE_SYSTEM_SERVICE.getExtensionFromFilePath(filePath).toLowerCase();
		const serializedContent: string = this.serializeConfig(config, extension);
		await this.FILE_SYSTEM_SERVICE.writeFile(filePath, serializedContent);
	}

	private serializeConfig(config: IAiCoreConfig, extension: string): string {
		if (extension === ".json") {
			return `${JSON.stringify(config, undefined, "\t")}\n`;
		}

		if (extension === ".yaml" || extension === ".yml") {
			return stringifyYaml(config);
		}

		return `export default ${stringifyJavaScript(config, undefined, "\t")};\n`;
	}
}
