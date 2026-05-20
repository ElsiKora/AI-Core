import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { LlmConfiguration } from "../../domain/entity/llm-configuration.entity.js";
import type { ILlmMessage } from "../../domain/interface/llm/message.interface.js";

import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from "../../domain/constant/numeric.constant.js";
import { EAWSBedrockModel } from "../../domain/enum/aws-bedrock-model.enum.js";
import { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";

const ACCESS_KEY_ID_INDEX: number = 1;
const REGION_INDEX: number = 0;
const SECRET_ACCESS_KEY_INDEX: number = 2;

/**
 * AWS Bedrock provider adapter.
 */
export class AwsBedrockLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const credentialParts: { accessKeyId: string; region: string; secretAccessKey: string } = this.parseCredential(configuration.getCredential().getValue());

		const client: BedrockRuntimeClient = new BedrockRuntimeClient({
			credentials: {
				accessKeyId: credentialParts.accessKeyId,
				secretAccessKey: credentialParts.secretAccessKey,
			},
			region: credentialParts.region,
		});

		const response: { output?: { message?: { content?: Array<{ text?: string }> } } } = await client.send(
			new ConverseCommand({
				inferenceConfig: {
					maxTokens: configuration.getMaxTokens() ?? DEFAULT_MAX_TOKENS,
					temperature: configuration.getTemperature() ?? DEFAULT_TEMPERATURE,
				},
				messages: [
					{
						content: [{ text: this.buildPrompt(messages) }],
						role: "user",
					},
				],
				modelId: configuration.getModel() ?? EAWSBedrockModel.CLAUDE_SONNET_4_5,
			}),
		);
		const content: Array<{ text?: string }> = response.output?.message?.content ?? [];

		const text: string = content
			.map((item: { text?: string }): string => item.text ?? "")
			.join("\n")
			.trim();

		if (!text) {
			throw new Error("AWS Bedrock returned empty response");
		}

		return text;
	}

	getName(): string {
		return ELLMProvider.AWS_BEDROCK;
	}

	private buildPrompt(messages: Array<ILlmMessage>): string {
		return messages.map((message: ILlmMessage): string => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
	}

	private parseCredential(value: string): { accessKeyId: string; region: string; secretAccessKey: string } {
		const parts: Array<string> = value.split("|");
		const region: string | undefined = parts[REGION_INDEX];
		const accessKeyId: string | undefined = parts[ACCESS_KEY_ID_INDEX];
		const secretAccessKey: string | undefined = parts[SECRET_ACCESS_KEY_INDEX];

		if (!region || !accessKeyId || !secretAccessKey) {
			throw new Error("AWS Bedrock credential must be in format region|access-key-id|secret-access-key");
		}

		return {
			accessKeyId: accessKeyId.trim(),
			region: region.trim(),
			secretAccessKey: secretAccessKey.trim(),
		};
	}
}
