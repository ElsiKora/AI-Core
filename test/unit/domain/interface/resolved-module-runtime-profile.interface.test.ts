import { describe, expect, it } from "vitest";

import type { IResolvedModuleRuntimeProfile } from "@/domain/interface/resolved-module-runtime-profile.interface.js";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

describe("resolved-module-runtime-profile.interface", () => {
	it("defines runtime profile without credential field", () => {
		const profile: IResolvedModuleRuntimeProfile = {
			model: "gpt-4o",
			moduleId: "commitizen",
			provider: ELLMProvider.OPENAI,
			retries: 3,
			validationRetries: 3,
		};

		expect(profile.moduleId).toBe("commitizen");
		expect(profile.provider).toBe(ELLMProvider.OPENAI);
	});
});
