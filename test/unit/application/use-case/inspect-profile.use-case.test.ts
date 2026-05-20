import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IConfigService } from "@/application/interface/config-service.interface";
import type { ICredentialResolver } from "@/application/interface/credential-resolver.interface";

import type { IAiCoreConfig } from "@/domain/interface/ai/core-config.interface";

import { InspectProfileUseCase } from "@/application/use-case/inspect-profile.use-case";
import { EProfileInspectionStatus } from "@/domain/enum/profile-inspection-status.enum";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { Credential } from "@/domain/value-object/credential.value-object";

describe("InspectProfileUseCase", () => {
	const mockConfigService: IConfigService = {
		exists: vi.fn().mockResolvedValue(true),
		get: vi.fn(),
		getModuleProfile: vi.fn().mockResolvedValue(undefined),
		set: vi.fn().mockResolvedValue(undefined),
		setModuleProfile: vi.fn().mockResolvedValue(undefined),
	};
	const mockCredentialResolver: ICredentialResolver = {
		resolve: vi.fn(),
	};

	const useCase = new InspectProfileUseCase(mockConfigService, mockCredentialResolver);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns missing_profile when module profile does not exist", async () => {
		vi.mocked(mockConfigService.get).mockResolvedValue({});

		const result = await useCase.execute("commitizen" as Parameters<typeof useCase.execute>[0]);

		expect(result.status).toBe(EProfileInspectionStatus.MISSING_PROFILE);
	});

	it("returns missing_credential when module profile exists and env credential is unresolved", async () => {
		const config: IAiCoreConfig = {
			modules: {
				commitizen: {
					model: "gpt-4o",
					provider: ELLMProvider.OPENAI,
				},
			},
		};
		vi.mocked(mockConfigService.get).mockResolvedValue(config);
		vi.mocked(mockCredentialResolver.resolve).mockReturnValue(null);

		const result = await useCase.execute("commitizen" as Parameters<typeof useCase.execute>[0]);

		expect(result.status).toBe(EProfileInspectionStatus.MISSING_CREDENTIAL);

		if (result.status === EProfileInspectionStatus.MISSING_CREDENTIAL) {
			expect(result.environmentVariableName).toBe("OPENAI_API_KEY");
			expect(result.profile.model).toBe("gpt-4o");
			expect(result.profile.provider).toBe(ELLMProvider.OPENAI);
		}
	});

	it("returns ready when profile and credential are resolved", async () => {
		const credential: Credential = new Credential("sk-test");
		const config: IAiCoreConfig = {
			modules: {
				commitizen: {
					model: "gpt-4o",
					provider: ELLMProvider.OPENAI,
				},
			},
		};
		vi.mocked(mockConfigService.get).mockResolvedValue(config);
		vi.mocked(mockCredentialResolver.resolve).mockReturnValue(credential);

		const result = await useCase.execute("commitizen" as Parameters<typeof useCase.execute>[0]);

		expect(result.status).toBe(EProfileInspectionStatus.READY);

		if (result.status === EProfileInspectionStatus.READY) {
			expect(result.profile.moduleId).toBe("commitizen");
			expect(result.profile.provider).toBe(ELLMProvider.OPENAI);
			expect(result.profile.model).toBe("gpt-4o");
			expect(result.profile.credential).toBe(credential);
		}
	});

	it("uses alias provider and model when module profile specifies alias", async () => {
		const credential: Credential = new Credential("sk-test");
		const config: IAiCoreConfig = {
			aliases: {
				default: {
					model: "gpt-5",
					provider: ELLMProvider.OPENAI,
				},
			},
			modules: {
				commitizen: {
					alias: "default",
				},
			},
		};
		vi.mocked(mockConfigService.get).mockResolvedValue(config);
		vi.mocked(mockCredentialResolver.resolve).mockReturnValue(credential);

		const result = await useCase.execute("commitizen" as Parameters<typeof useCase.execute>[0]);

		expect(result.status).toBe(EProfileInspectionStatus.READY);

		if (result.status === EProfileInspectionStatus.READY) {
			expect(result.profile.model).toBe("gpt-5");
			expect(result.profile.provider).toBe(ELLMProvider.OPENAI);
		}
	});

	it("returns invalid_profile when provider cannot be resolved", async () => {
		const config: IAiCoreConfig = {
			modules: {
				commitizen: {
					model: "gpt-4o",
				},
			},
		};
		vi.mocked(mockConfigService.get).mockResolvedValue(config);

		const result = await useCase.execute("commitizen" as Parameters<typeof useCase.execute>[0]);

		expect(result.status).toBe(EProfileInspectionStatus.INVALID_PROFILE);
	});
});
