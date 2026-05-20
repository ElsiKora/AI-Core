import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ICliInterfaceService } from "@/application/interface/cli-interface-service.interface.js";
import type { IConfigService } from "@/application/interface/config-service.interface.js";
import type { ICredentialResolver } from "@/application/interface/credential-resolver.interface.js";

import { Credential } from "@/domain/value-object/credential.value-object.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

import { ModelRegistryService } from "@/application/service/model-registry.service.js";
import { ConfigureLlmUseCase } from "@/application/use-case/configure-llm.use-case.js";
import { PromptCredentialUseCase } from "@/application/use-case/prompt-credential.use-case.js";

describe("ConfigureLlmUseCase", () => {
	const mockConfigService: IConfigService = {
		exists: vi.fn().mockResolvedValue(true),
		get: vi.fn().mockResolvedValue({}),
		getModuleProfile: vi.fn().mockResolvedValue(undefined),
		set: vi.fn().mockResolvedValue(undefined),
		setModuleProfile: vi.fn().mockResolvedValue(undefined),
	};

	const mockCredentialResolver: ICredentialResolver = {
		resolve: vi.fn().mockReturnValue(new Credential("env-key")),
	};

	const mockCliInterface: ICliInterfaceService = {
		confirm: vi.fn().mockResolvedValue(false),
		info: vi.fn(),
		password: vi.fn(),
		select: vi.fn(),
		success: vi.fn(),
		text: vi.fn(),
		warn: vi.fn(),
	};

	const modelRegistry = new ModelRegistryService();
	const promptCredentialUseCase = new PromptCredentialUseCase(mockCredentialResolver, mockCliInterface);

	const useCase = new ConfigureLlmUseCase(mockConfigService, promptCredentialUseCase, mockCliInterface, modelRegistry);

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OPENAI).mockResolvedValueOnce("gpt-4o");
	});

	it("configures interactively and saves profile", async () => {
		const result = await useCase.configureInteractively("commitizen" as Parameters<typeof useCase.configureInteractively>[0]);

		expect(result.moduleId).toBe("commitizen");
		expect(result.provider).toBe(ELLMProvider.OPENAI);
		expect(result.model).toBe("gpt-4o");
		expect(result.credential.getValue()).toBe("env-key");
		expect(mockConfigService.setModuleProfile).toHaveBeenCalledWith(
			"commitizen",
			expect.objectContaining({
				model: "gpt-4o",
				provider: ELLMProvider.OPENAI,
			}),
		);
	});

	it("prompts for credential when env not found", async () => {
		vi.mocked(mockCredentialResolver.resolve).mockReturnValue(null);
		vi.mocked(mockCliInterface.password).mockResolvedValue("sk-manual-key");

		await useCase.configureInteractively("commitizen" as Parameters<typeof useCase.configureInteractively>[0]);

		expect(mockCliInterface.password).toHaveBeenCalled();
	});
});
