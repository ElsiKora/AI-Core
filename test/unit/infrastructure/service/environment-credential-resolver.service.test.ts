import { describe, expect, it, vi } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

import { EnvironmentCredentialResolver } from "@/infrastructure/service/environment-credential-resolver.service.js";

describe("EnvironmentCredentialResolver", () => {
	const resolver = new EnvironmentCredentialResolver();

	it("returns credential when env var is set", () => {
		vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
		const result = resolver.resolve(ELLMProvider.OPENAI);
		expect(result).not.toBeNull();
		expect(result?.getValue()).toBe("sk-test-key");
		vi.unstubAllEnvs();
	});

	it("returns null when env var is not set", () => {
		vi.stubEnv("OPENAI_API_KEY", undefined);
		const result = resolver.resolve(ELLMProvider.OPENAI);
		expect(result).toBeNull();
		vi.unstubAllEnvs();
	});

	it("returns null when env var is empty string", () => {
		vi.stubEnv("ANTHROPIC_API_KEY", "");
		const result = resolver.resolve(ELLMProvider.ANTHROPIC);
		expect(result).toBeNull();
		vi.unstubAllEnvs();
	});

	it("returns null when env var is whitespace only", () => {
		vi.stubEnv("GOOGLE_API_KEY", "   ");
		const result = resolver.resolve(ELLMProvider.GOOGLE);
		expect(result).toBeNull();
		vi.unstubAllEnvs();
	});
});
