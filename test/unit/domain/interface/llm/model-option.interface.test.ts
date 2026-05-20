import { describe, expect, it } from "vitest";

import type { ILlmModelOption } from "@/domain/interface/llm/model-option.interface.js";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

describe("model-option.interface", () => {
	it("ILlmModelOption has label, value, provider, isDefault", () => {
		const opt: ILlmModelOption = {
			isDefault: true,
			label: "gpt-4o",
			provider: ELLMProvider.OPENAI,
			value: "gpt-4o",
		};
		expect(opt.value).toBe("gpt-4o");
		expect(opt.isDefault).toBe(true);
	});
});
