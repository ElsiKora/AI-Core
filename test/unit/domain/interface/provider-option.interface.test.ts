import { describe, expect, it } from "vitest";

import type { IProviderOption } from "@/domain/interface/provider-option.interface";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

describe("provider-option.interface", () => {
	it("IProviderOption has label and value", () => {
		const opt: IProviderOption = { label: "OpenAI", value: ELLMProvider.OPENAI };
		expect(opt.label).toBe("OpenAI");
		expect(opt.value).toBe(ELLMProvider.OPENAI);
	});
});
