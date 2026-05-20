import { describe, expect, it } from "vitest";

import type { IGenerateStreamChunk } from "@/domain/interface/generate/stream-chunk.interface";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

describe("stream-chunk.interface", () => {
	it("IGenerateStreamChunk has delta and aggregated text", () => {
		const chunk: IGenerateStreamChunk = {
			attempt: 1,
			delta: "Hello",
			model: "gpt-5.2",
			provider: ELLMProvider.OPENAI,
			text: "Hello",
		};

		expect(chunk.delta).toBe("Hello");
		expect(chunk.text).toBe("Hello");
	});
});
