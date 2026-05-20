import { describe, expect, it } from "vitest";

import type { TGenerateInput } from "@/domain/interface/generate/input.interface.js";
import { EGenerateMode } from "@/domain/enum/generate-mode.enum.js";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum.js";

describe("input.interface", () => {
	it("TGenerateInput supports profile mode", () => {
		const input: TGenerateInput = {
			mode: EGenerateMode.PROFILE,
			moduleId: "commitizen",
		};

		expect(input.mode).toBe(EGenerateMode.PROFILE);
		expect(input.moduleId).toBe("commitizen");
	});

	it("TGenerateInput supports direct mode", () => {
		const input: TGenerateInput = {
			credential: "sk-test",
			mode: EGenerateMode.DIRECT,
			provider: ELLMProvider.OPENAI,
		};

		expect(input.mode).toBe(EGenerateMode.DIRECT);
		expect(input.provider).toBe(ELLMProvider.OPENAI);
	});
});
