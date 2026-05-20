import type { IConfigService } from "@/application/interface/config-service.interface.js";
import type { ICredentialResolver } from "@/application/interface/credential-resolver.interface.js";

import { createTestingContainer, mockProvider, overrideProvider, resetTestingContainer } from "@elsikora/cladi-testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";
import { EProfileInspectionStatus } from "@/domain/enum/profile-inspection-status.enum.js";
import { Credential } from "@/domain/value-object/credential.value-object.js";
import { LlmServiceToken } from "@/infrastructure/di/token.js";

import { ApplicationModule, ConfigModule, LlmModule } from "@/infrastructure/di/module.js";
import { ConfigServiceToken, CredentialResolverToken, InspectProfileUseCaseToken } from "@/infrastructure/di/token.js";

let container: ReturnType<typeof createTestingContainer>;

beforeEach(() => {
	container = createTestingContainer({
		modules: [ApplicationModule],
		shouldValidateOnCreate: true,
	});
});

afterEach(async () => {
	await resetTestingContainer(container);
});

describe("LlmModule", () => {
	it("exports LlmServiceToken", () => {
		expect(LlmModule.exports).toContain(LlmServiceToken);
	});

	it("has name llm", () => {
		expect(LlmModule.name).toBe("llm");
	});
});

describe("ConfigModule", () => {
	it("has name config", () => {
		expect(ConfigModule.name).toBe("config");
	});
});

describe("ApplicationModule", () => {
	it("has name application", () => {
		expect(ApplicationModule.name).toBe("application");
	});

	it("imports ConfigModule and LlmModule", () => {
		expect(ApplicationModule.imports).toContain(ConfigModule);
		expect(ApplicationModule.imports).toContain(LlmModule);
	});

	it("composes modules and resolves all LLM providers", () => {
		expect(container.resolveAll(LlmServiceToken)).toHaveLength(8);
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

		await overrideProvider(container, mockProvider(ConfigServiceToken, mockedConfigService));
		await overrideProvider(container, mockProvider(CredentialResolverToken, mockedCredentialResolver));

		const useCase = container.resolve(InspectProfileUseCaseToken);
		const resolvedProfile = await useCase.execute("test-module");

		expect(resolvedProfile.status).toBe(EProfileInspectionStatus.READY);

		if (resolvedProfile.status === EProfileInspectionStatus.READY) {
			expect(resolvedProfile.profile.provider).toBe(ELLMProvider.OPENAI);
			expect(resolvedProfile.profile.model).toBe("gpt-4o");
			expect(resolvedProfile.profile.credential.getValue()).toBe("test-credential");
		}
	});
});
