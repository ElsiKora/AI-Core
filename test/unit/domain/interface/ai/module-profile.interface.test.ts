import { describe, expect, it } from "vitest";

import type { IAiModuleProfile } from "@/domain/interface/ai/module-profile.interface";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

describe("module-profile.interface", () => {
	it("IAiModuleProfile has model and provider", () => {
		const profile: IAiModuleProfile = {
			model: "gpt-4o",
			provider: ELLMProvider.OPENAI,
		};
		expect(profile.model).toBe("gpt-4o");
		expect(profile.provider).toBe(ELLMProvider.OPENAI);
	});
});
