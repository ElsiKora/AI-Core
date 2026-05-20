import { describe, expect, it } from "vitest";

import type { IGenerateBaseInput } from "@/domain/interface/generate/base-input.interface";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum";

describe("base-input.interface", () => {
	it("IGenerateBaseInput supports common generation options", () => {
		const input: IGenerateBaseInput = {
			maxTokens: 1024,
			messages: [{ content: "Hi", role: ELLMMessageRole.USER }],
			model: "gpt-5.2",
			prompt: "Hello",
			retries: 3,
			temperature: 0.4,
			validationRetries: 2,
		};

		expect(input.maxTokens).toBe(1024);
		expect(input.messages?.[0]?.role).toBe(ELLMMessageRole.USER);
	});
});
