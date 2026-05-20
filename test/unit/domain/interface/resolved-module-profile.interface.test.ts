import { describe, expect, it } from "vitest";

import type { IResolvedModuleProfile } from "@/domain/interface/resolved-module-profile.interface";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { Credential } from "@/domain/value-object/credential.value-object";

describe("resolved-module-profile.interface", () => {
	it("IResolvedModuleProfile has required fields", () => {
		const profile: IResolvedModuleProfile = {
			credential: new Credential("sk-test"),
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 3,
			validationRetries: 3,
		};
		expect(profile.model).toBe("gpt-4o");
		expect(profile.moduleId).toBe("commitizen");
	});
});
