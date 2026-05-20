import { describe, expect, it } from "vitest";

import { EAzureOpenAIModel } from "@/domain/enum/azure-openai-model.enum";

describe("azure-openai-model.enum", () => {
	it("exports known model values", () => {
		expect(EAzureOpenAIModel.GPT_5_2).toBeDefined();
		expect(EAzureOpenAIModel.GPT_5_1).toBe("gpt-5.1");
		expect(EAzureOpenAIModel.GPT_5_5).toBe("gpt-5.5");
		expect(EAzureOpenAIModel.GPT_5_4_MINI).toBe("gpt-5.4-mini");
		expect(EAzureOpenAIModel.GPT_CHAT_LATEST).toBe("gpt-chat-latest");
		expect(EAzureOpenAIModel.O3_MINI).toBe("o3-mini");
	});

	it("Object.values returns non-empty array", () => {
		expect(Object.values(EAzureOpenAIModel).length).toBeGreaterThan(0);
	});
});
