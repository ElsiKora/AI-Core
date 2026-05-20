import { describe, expect, it } from "vitest";

import type { IGenerateDirectInput } from "@/domain/interface/generate/direct-input.interface.js";
import { EGenerateMode } from "@/domain/enum/generate-mode.enum.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

describe("direct-input.interface", () => {
	it("IGenerateDirectInput requires provider and credential", () => {
		const input: IGenerateDirectInput = {
			credential: "sk-test",
			mode: EGenerateMode.DIRECT,
			provider: ELLMProvider.OPENAI,
		};

		expect(input.mode).toBe(EGenerateMode.DIRECT);
		expect(input.provider).toBe(ELLMProvider.OPENAI);
	});
});
