import { describe, expect, it } from "vitest";

import type { ISelectOption } from "@/application/interface/select-option.interface";

describe("select-option.interface", () => {
	it("ISelectOption has label and value", () => {
		const opt: ISelectOption<string> = { label: "OpenAI", value: "openai" };
		expect(opt.label).toBe("OpenAI");
		expect(opt.value).toBe("openai");
	});
});
