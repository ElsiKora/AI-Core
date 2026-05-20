import { describe, expect, it } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity";

describe("LlmConfiguration", () => {
	const credential = new Credential("test-key");

	it("constructs with required fields", () => {
		const config = new LlmConfiguration(ELLMProvider.OPENAI, credential);
		expect(config.getProvider()).toBe(ELLMProvider.OPENAI);
		expect(config.getCredential()).toBe(credential);
		expect(config.getModel()).toBeUndefined();
		expect(config.getMaxTokens()).toBeUndefined();
		expect(config.getTemperature()).toBeUndefined();
		expect(config.getRetries()).toBe(3);
		expect(config.getValidationRetries()).toBe(3);
	});

	it("constructs with optional fields", () => {
		const config = new LlmConfiguration(ELLMProvider.ANTHROPIC, credential, "claude-3", 1024, 0.5, 5, 2, { topP: 0.8 });
		expect(config.getModel()).toBe("claude-3");
		expect(config.getMaxTokens()).toBe(1024);
		expect(config.getTemperature()).toBe(0.5);
		expect(config.getRetries()).toBe(5);
		expect(config.getGenerationOptions().topP).toBe(0.8);
		expect(config.getValidationRetries()).toBe(2);
	});

	it("withModel returns new instance with updated model", () => {
		const config = new LlmConfiguration(ELLMProvider.OPENAI, credential, "gpt-4");
		const updated = config.withModel("gpt-5");
		expect(config.getModel()).toBe("gpt-4");
		expect(updated.getModel()).toBe("gpt-5");
		expect(updated.getProvider()).toBe(ELLMProvider.OPENAI);
	});

	it("withCredential returns new instance with updated credential", () => {
		const cred2 = new Credential("other-key");
		const config = new LlmConfiguration(ELLMProvider.OPENAI, credential);
		const updated = config.withCredential(cred2);
		expect(config.getCredential().getValue()).toBe("test-key");
		expect(updated.getCredential().getValue()).toBe("other-key");
	});
});
