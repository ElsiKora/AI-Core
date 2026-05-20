import { describe, expect, it } from "vitest";

import type { IAiModelAlias } from "@/domain/interface/ai/model-alias.interface";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

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
