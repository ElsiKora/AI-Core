import { describe, expect, it } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

import { PROVIDER_CREDENTIAL_FORMAT_CONSTANT } from "@/domain/constant/provider/credential-format.constant";

describe("credential-format.constant", () => {
	it("provides format hint for every ELLMProvider", () => {
		const providers = Object.values(ELLMProvider);

		for (const provider of providers) {
			const format = PROVIDER_CREDENTIAL_FORMAT_CONSTANT.MAP[provider];
			expect(format).toBeDefined();
			expect(typeof format).toBe("string");
		}
	});

	it("AWS_BEDROCK has format hint with region", () => {
		expect(PROVIDER_CREDENTIAL_FORMAT_CONSTANT.MAP[ELLMProvider.AWS_BEDROCK]).toContain("region");
	});

	it("AZURE_OPENAI has format hint with endpoint", () => {
		expect(PROVIDER_CREDENTIAL_FORMAT_CONSTANT.MAP[ELLMProvider.AZURE_OPENAI]).toContain("endpoint");
	});
});
