import { describe, expect, it } from "vitest";

import type { IAiModelAlias } from "@/domain/interface/ai/model-alias.interface.js";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

describe("model-alias.interface", () => {
	it("IAiModelAlias has model and provider", () => {
		const alias: IAiModelAlias = {
			model: "gpt-4o",
			provider: ELLMProvider.OPENAI,
		};
		expect(alias.model).toBe("gpt-4o");
		expect(alias.provider).toBe(ELLMProvider.OPENAI);
	});
});
