import { describe, expect, it } from "vitest";

import type { ILlmMessage } from "@/domain/interface/llm/message.interface";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum";

describe("message.interface", () => {
	it("ILlmMessage has content and role", () => {
		const msg: ILlmMessage = { content: "Hello", role: ELLMMessageRole.USER };
		expect(msg.content).toBe("Hello");
		expect(msg.role).toBe(ELLMMessageRole.USER);
	});
});
