import { describe, expect, it } from "vitest";

import type { ILlmService } from "@/application/interface/llm-service.interface.js";

describe("llm-service.interface", () => {
	it("ILlmService supports generate and optional generateStream", async () => {
		const mock: ILlmService = {
			getName: () => "openai",
			generate: async () => "text",
			generateStream: async function* (): AsyncGenerator<string> {
				yield "text";
			},
		};

		expect(mock.getName()).toBe("openai");
		expect(await mock.generate([], {} as never)).toBe("text");
	});
});
