import type { ILlmService } from "@application/interface/llm-service.interface";
import type { ConverseCommandInput } from "@aws-sdk/client-bedrock-runtime";
import type { LlmConfiguration } from "@domain/entity/llm-configuration.entity";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";

import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { NUMERIC_CONSTANT } from "@domain/constant/numeric.constant";
import { EAWSBedrockModel } from "@domain/enum/aws-bedrock-model.enum";
import { ELLMProvider } from "@domain/enum/llm-provider.enum";
import { LlmAuthenticationErrorDetectorService } from "@infrastructure/service/llm/authentication-error-detector.service";

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

		const response: { output?: { message?: { content?: Array<{ text?: string }> } } } = await client.send(new ConverseCommand(this.buildRequest(messages, configuration)));
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

	isAuthenticationError(error: unknown): boolean {
		return LlmAuthenticationErrorDetectorService.isAuthenticationError(error);
	}

	private buildPrompt(messages: Array<ILlmMessage>): string {
		return messages.map((message: ILlmMessage): string => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
	}

	private buildRequest(messages: Array<ILlmMessage>, configuration: LlmConfiguration): ConverseCommandInput {
		const options: IGenerationOptions = configuration.getGenerationOptions();
		const bedrockOptions: NonNullable<IGenerationOptions["providerOptions"]>["awsBedrock"] | undefined = options.providerOptions?.awsBedrock;
		const model: string = configuration.getModel() ?? EAWSBedrockModel.CLAUDE_SONNET_4_6;

		if (model.includes(":prompt/") && (bedrockOptions?.additionalModelRequestFields || bedrockOptions?.promptVariables || options.tools?.length)) {
			throw new Error("AWS Bedrock prompt ARNs cannot be combined with provider extras or tools.");
		}

		return {
			additionalModelRequestFields: bedrockOptions?.additionalModelRequestFields as never,
			additionalModelResponseFieldPaths: bedrockOptions?.additionalModelResponseFieldPaths,
			guardrailConfig: bedrockOptions?.guardrailConfig,
			inferenceConfig: {
				maxTokens: configuration.getMaxTokens() ?? NUMERIC_CONSTANT.DEFAULT_MAX_TOKENS,
				stopSequences: options.stopSequences,
				temperature: configuration.getTemperature() ?? NUMERIC_CONSTANT.DEFAULT_TEMPERATURE,
				topP: options.topP,
			},
			messages: [
				{
					content: [{ text: this.buildPrompt(messages) }],
					role: "user",
				},
			],
			modelId: model,
			outputConfig: options.responseFormat
				? {
						textFormat: {
							structure: {
								jsonSchema: {
									description: options.responseFormat.description,
									name: options.responseFormat.name,
									schema: JSON.stringify(options.responseFormat.schema ?? {}),
								},
							},
							type: "json_schema",
						},
					}
				: undefined,
			performanceConfig: bedrockOptions?.performanceConfig,
			promptVariables: bedrockOptions?.promptVariables ? Object.fromEntries(Object.entries(bedrockOptions.promptVariables).map(([key, value]: [string, string]): [string, { text: string }] => [key, { text: value }])) : undefined,
			requestMetadata: bedrockOptions?.requestMetadata,
			serviceTier: bedrockOptions?.serviceTier ? { type: bedrockOptions.serviceTier } : undefined,
		};
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
