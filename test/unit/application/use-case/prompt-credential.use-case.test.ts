import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ICliInterfaceService } from "@/application/interface/cli-interface-service.interface.js";
import type { ICredentialResolver } from "@/application/interface/credential-resolver.interface.js";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";
import { Credential } from "@/domain/value-object/credential.value-object.js";

import { PromptCredentialUseCase } from "@/application/use-case/prompt-credential.use-case.js";

describe("PromptCredentialUseCase", () => {
	const mockCredentialResolver: ICredentialResolver = {
		resolve: vi.fn(),
	};
	const mockCliInterface: ICliInterfaceService = {
		confirm: vi.fn(),
		info: vi.fn(),
		password: vi.fn(),
		select: vi.fn(),
		success: vi.fn(),
		text: vi.fn(),
		warn: vi.fn(),
	};

	const useCase = new PromptCredentialUseCase(mockCredentialResolver, mockCliInterface);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns resolved environment credential without prompting", async () => {
		vi.mocked(mockCredentialResolver.resolve).mockReturnValue(new Credential("env-key"));

		const credential = await useCase.execute(ELLMProvider.OPENAI);

		expect(credential.getValue()).toBe("env-key");
		expect(mockCliInterface.password).not.toHaveBeenCalled();
	});

	it("prompts for credential when environment credential is missing", async () => {
		vi.mocked(mockCredentialResolver.resolve).mockReturnValue(null);
		vi.mocked(mockCliInterface.password).mockResolvedValue("manual-key");

		const credential = await useCase.execute(ELLMProvider.OPENAI);

		expect(mockCliInterface.info).toHaveBeenCalled();
		expect(mockCliInterface.password).toHaveBeenCalledWith("Enter credential for provider 'openai':");
		expect(credential.getValue()).toBe("manual-key");
	});
});
