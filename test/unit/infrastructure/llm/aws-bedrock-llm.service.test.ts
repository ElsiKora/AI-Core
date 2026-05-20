import { describe, expect, it, vi } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object";
import { ELLMMessageRole } from "@/domain/enum/llm-message-role.enum";
import { LlmConfiguration } from "@/domain/entity/llm-configuration.entity";
import { ELLMProvider } from "@/domain/enum/llm-provider.enum";

vi.mock("@aws-sdk/client-bedrock-runtime", () => ({
	BedrockRuntimeClient: class MockBedrockClient {
		send = vi.fn().mockResolvedValue({
			output: {
				message: {
					content: [{ text: "Mocked AWS Bedrock response" }],
				},
			},
		});
	},
	ConverseCommand: class {
		constructor(params: unknown) {
			Object.assign(this, params);
		}
	},
}));

import { AwsBedrockLlmService } from "@/infrastructure/service/llm/aws-bedrock-llm.service";

describe("AwsBedrockLlmService", () => {
	const service = new AwsBedrockLlmService();

	it("getName returns AWS_BEDROCK", () => {
		expect(service.getName()).toBe(ELLMProvider.AWS_BEDROCK);
	});

	it("generate requires credential in region|accessKeyId|secretAccessKey format", async () => {
		const credential = new Credential("us-east-1|AKIAEXAMPLE|secret");
		const config = new LlmConfiguration(ELLMProvider.AWS_BEDROCK, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		const result = await service.generate(messages, config);
		expect(result).toBe("Mocked AWS Bedrock response");
	});

	it("throws when credential format is invalid", async () => {
		const credential = new Credential("invalid-format");
		const config = new LlmConfiguration(ELLMProvider.AWS_BEDROCK, credential);
		const messages = [{ content: "Hello", role: ELLMMessageRole.USER }];

		await expect(service.generate(messages, config)).rejects.toThrow("region|access-key-id|secret-access-key");
	});
});
