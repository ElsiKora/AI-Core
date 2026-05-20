import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { IAiModuleProfile } from "../../domain/interface/ai/module-profile.interface.js";
import type { IResolvedModuleProfile } from "../../domain/interface/resolved-module-profile.interface.js";
import type { TAiCoreModuleId } from "../../domain/type/ai-core-module-id.type.js";
import type { Credential } from "../../domain/value-object/credential.value-object.js";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface.js";
import type { IConfigService } from "../interface/config-service.interface.js";
import type { ModelRegistryService } from "../service/model-registry.service.js";

import type { PromptCredentialUseCase } from "./prompt-credential.use-case.js";

import { DEFAULT_MAX_RETRIES, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE, DEFAULT_VALIDATION_RETRIES, MAX_RETRY_COUNT, MAX_TEMPERATURE, MIN_RETRY_COUNT } from "../../domain/constant/numeric.constant.js";

/**
 * Interactive configuration use case.
 */
export class ConfigureLlmUseCase {
	private readonly CLI_INTERFACE: ICliInterfaceService;

	private readonly CONFIG_SERVICE: IConfigService;

	private readonly MODEL_REGISTRY: ModelRegistryService;

	private readonly PROMPT_CREDENTIAL_USE_CASE: PromptCredentialUseCase;

	constructor(configService: IConfigService, promptCredentialUseCase: PromptCredentialUseCase, cliInterface: ICliInterfaceService, modelRegistry: ModelRegistryService) {
		this.CONFIG_SERVICE = configService;
		this.PROMPT_CREDENTIAL_USE_CASE = promptCredentialUseCase;
		this.CLI_INTERFACE = cliInterface;
		this.MODEL_REGISTRY = modelRegistry;
	}

	async configureInteractively(moduleId: TAiCoreModuleId): Promise<IResolvedModuleProfile> {
		const provider: ELLMProvider = await this.CLI_INTERFACE.select("Select provider:", this.MODEL_REGISTRY.getProviderOptions());
		const model: string = await this.CLI_INTERFACE.select("Select model:", this.MODEL_REGISTRY.getModelOptions(provider), this.MODEL_REGISTRY.getDefaultModel(provider));

		let profile: IAiModuleProfile = {
			model,
			provider,
			retries: DEFAULT_MAX_RETRIES,
			validationRetries: DEFAULT_VALIDATION_RETRIES,
		};

		profile = await this.configureRetrySettings(profile);
		profile = await this.configureGenerationSettings(profile);

		const credential: Credential = await this.PROMPT_CREDENTIAL_USE_CASE.execute(provider);

		await this.CONFIG_SERVICE.setModuleProfile(moduleId, profile);

		this.CLI_INTERFACE.success(`Saved AI profile for module '${moduleId}'.`);

		return {
			credential,
			maxTokens: profile.maxTokens,
			model,
			moduleId,
			provider,
			retries: profile.retries ?? DEFAULT_MAX_RETRIES,
			temperature: profile.temperature,
			validationRetries: profile.validationRetries ?? DEFAULT_VALIDATION_RETRIES,
		};
	}

	private async configureGenerationSettings(profile: IAiModuleProfile): Promise<IAiModuleProfile> {
		const shouldConfigureGenerationSettings: boolean = await this.CLI_INTERFACE.confirm("Configure generation settings (max tokens / temperature)?", false);

		if (!shouldConfigureGenerationSettings) {
			return profile;
		}

		const maxTokensText: string = await this.CLI_INTERFACE.text("Max output tokens:", String(DEFAULT_MAX_TOKENS), String(DEFAULT_MAX_TOKENS), (value: string): string | undefined => {
			const parsedValue: number = Number.parseInt(value, 10);

			if (Number.isNaN(parsedValue) || parsedValue < 1) {
				return "Please enter a positive integer";
			}

			return undefined;
		});

		const temperatureText: string = await this.CLI_INTERFACE.text("Temperature (0-2):", String(DEFAULT_TEMPERATURE), String(DEFAULT_TEMPERATURE), (value: string): string | undefined => {
			const parsedValue: number = Number.parseFloat(value);

			if (Number.isNaN(parsedValue) || parsedValue < 0 || parsedValue > MAX_TEMPERATURE) {
				return "Please enter a number between 0 and 2";
			}

			return undefined;
		});

		return {
			...profile,
			maxTokens: Number.parseInt(maxTokensText, 10),
			temperature: Number.parseFloat(temperatureText),
		};
	}

	private async configureRetrySettings(profile: IAiModuleProfile): Promise<IAiModuleProfile> {
		const shouldConfigureRetrySettings: boolean = await this.CLI_INTERFACE.confirm("Configure retry settings?", false);

		if (!shouldConfigureRetrySettings) {
			return profile;
		}

		const retriesText: string = await this.CLI_INTERFACE.text("Retries for generation:", String(DEFAULT_MAX_RETRIES), String(DEFAULT_MAX_RETRIES), (value: string): string | undefined => this.validateRetryValue(value));
		const validationRetriesText: string = await this.CLI_INTERFACE.text("Retries for validation:", String(DEFAULT_VALIDATION_RETRIES), String(DEFAULT_VALIDATION_RETRIES), (value: string): string | undefined => this.validateRetryValue(value));

		return {
			...profile,
			retries: Number.parseInt(retriesText, 10),
			validationRetries: Number.parseInt(validationRetriesText, 10),
		};
	}

	private validateRetryValue(value: string): string | undefined {
		const parsedValue: number = Number.parseInt(value, 10);

		if (Number.isNaN(parsedValue) || parsedValue < MIN_RETRY_COUNT || parsedValue > MAX_RETRY_COUNT) {
			return `Please enter a number between ${String(MIN_RETRY_COUNT)} and ${String(MAX_RETRY_COUNT)}`;
		}

		return undefined;
	}
}
