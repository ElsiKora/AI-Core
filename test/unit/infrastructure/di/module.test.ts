import type { IConfigService } from "@/application/interface/config-service.interface";
import type { ICredentialResolver } from "@/application/interface/credential-resolver.interface";

import { createTestingContainer, mockProvider, overrideProvider, resetTestingContainer } from "@elsikora/cladi-testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { EProfileInspectionStatus } from "@/domain/enum/profile-inspection-status.enum";
import { Credential } from "@/domain/value-object/credential.value-object";
import { DI_MODULE_CONSTANT } from "@/infrastructure/constant/di/module.constant";
import { DI_TOKEN_CONSTANT } from "@/infrastructure/constant/di/token.constant";

let container: ReturnType<typeof createTestingContainer>;

beforeEach(() => {
	container = createTestingContainer({
		modules: [DI_MODULE_CONSTANT.APPLICATION],
		shouldValidateOnCreate: true,
	});
});

afterEach(async () => {
	await resetTestingContainer(container);
});

describe("DI_MODULE_CONSTANT.LLM", () => {
	it("exports DI_TOKEN_CONSTANT.LLM_SERVICE", () => {
		expect(DI_MODULE_CONSTANT.LLM.exports).toContain(DI_TOKEN_CONSTANT.LLM_SERVICE);
	});

	it("has name llm", () => {
		expect(DI_MODULE_CONSTANT.LLM.name).toBe("llm");
	});
});

describe("DI_MODULE_CONSTANT.CONFIG", () => {
	it("has name config", () => {
		expect(DI_MODULE_CONSTANT.CONFIG.name).toBe("config");
	});
});

describe("DI_MODULE_CONSTANT.APPLICATION", () => {
	it("has name application", () => {
		expect(DI_MODULE_CONSTANT.APPLICATION.name).toBe("application");
	});

	it("imports DI_MODULE_CONSTANT.CONFIG and DI_MODULE_CONSTANT.LLM", () => {
		expect(DI_MODULE_CONSTANT.APPLICATION.imports).toContain(DI_MODULE_CONSTANT.CONFIG);
		expect(DI_MODULE_CONSTANT.APPLICATION.imports).toContain(DI_MODULE_CONSTANT.LLM);
	});

	it("composes modules and resolves all LLM providers", () => {
		expect(container.resolveAll(DI_TOKEN_CONSTANT.LLM_SERVICE)).toHaveLength(8);
	});

	it("allows overriding providers for scenario-driven tests", async () => {
		const mockedConfigService: IConfigService = {
			exists: async () => true,
			get: async () => ({
				modules: {
					"test-module": {
						model: "gpt-4o",
						provider: ELLMProvider.OPENAI,
					},
				},
			}),
			getModuleProfile: async () => undefined,
			set: async () => undefined,
			setModuleProfile: async () => undefined,
		};
		const mockedCredentialResolver: ICredentialResolver = {
			resolve: () => new Credential("test-credential"),
		};

		await overrideProvider(container, mockProvider(DI_TOKEN_CONSTANT.CONFIG_SERVICE, mockedConfigService));
		await overrideProvider(container, mockProvider(DI_TOKEN_CONSTANT.CREDENTIAL_RESOLVER, mockedCredentialResolver));

		const useCase = container.resolve(DI_TOKEN_CONSTANT.INSPECT_PROFILE_USE_CASE);
		const resolvedProfile = await useCase.execute("test-module");

		expect(resolvedProfile.status).toBe(EProfileInspectionStatus.READY);

		if (resolvedProfile.status === EProfileInspectionStatus.READY) {
			expect(resolvedProfile.profile.provider).toBe(ELLMProvider.OPENAI);
			expect(resolvedProfile.profile.model).toBe("gpt-4o");
			expect(resolvedProfile.profile.credential.getValue()).toBe("test-credential");
		}
	});
});
