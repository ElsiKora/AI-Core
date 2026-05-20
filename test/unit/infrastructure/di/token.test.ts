import { describe, expect, it } from "vitest";

import {
	CliInterfaceServiceToken,
	ConfigServiceToken,
	ConfigureLlmUseCaseToken,
	CredentialResolverToken,
	EnsureProfileUseCaseToken,
	GenerateTextUseCaseToken,
	InspectProfileUseCaseToken,
	InteractiveShellServiceToken,
	LlmServiceToken,
	ModelRegistryServiceToken,
	NodeFileSystemServiceToken,
	PromptCredentialUseCaseToken,
} from "@/infrastructure/di/token.js";

describe("DI tokens", () => {
	it("exports all expected tokens", () => {
		expect(CliInterfaceServiceToken).toBeDefined();
		expect(ConfigServiceToken).toBeDefined();
		expect(ConfigureLlmUseCaseToken).toBeDefined();
		expect(CredentialResolverToken).toBeDefined();
		expect(EnsureProfileUseCaseToken).toBeDefined();
		expect(GenerateTextUseCaseToken).toBeDefined();
		expect(InspectProfileUseCaseToken).toBeDefined();
		expect(InteractiveShellServiceToken).toBeDefined();
		expect(LlmServiceToken).toBeDefined();
		expect(ModelRegistryServiceToken).toBeDefined();
		expect(NodeFileSystemServiceToken).toBeDefined();
		expect(PromptCredentialUseCaseToken).toBeDefined();
	});

	it("tokens are unique symbols or objects", () => {
		const tokens = [
			CliInterfaceServiceToken,
			ConfigServiceToken,
			ConfigureLlmUseCaseToken,
			CredentialResolverToken,
			EnsureProfileUseCaseToken,
			GenerateTextUseCaseToken,
			InspectProfileUseCaseToken,
			InteractiveShellServiceToken,
			LlmServiceToken,
			ModelRegistryServiceToken,
			NodeFileSystemServiceToken,
			PromptCredentialUseCaseToken,
		];
		const unique = new Set(tokens);
		expect(unique.size).toBe(tokens.length);
	});
});
