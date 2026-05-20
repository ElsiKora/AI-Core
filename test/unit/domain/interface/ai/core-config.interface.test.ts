import { describe, expect, it } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

import type { IAiCoreConfig } from "@/domain/interface/ai/core-config.interface.js";

describe("core-config.interface", () => {
	it("IAiCoreConfig can have modules and aliases", () => {
		const config: IAiCoreConfig = {
			aliases: { default: { model: "gpt-4o", provider: ELLMProvider.OPENAI } },
			modules: { commitizen: { model: "gpt-4o", provider: ELLMProvider.OPENAI } },
		};
		expect(config.modules?.commitizen).toBeDefined();
		expect(config.aliases?.default).toBeDefined();
	});
});
