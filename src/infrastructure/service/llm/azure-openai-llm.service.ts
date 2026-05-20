import type { ILlmService } from "@application/interface/llm-service.interface";
import type { LlmConfiguration } from "@domain/entity/llm-configuration.entity";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { IAiToolDefinition } from "@domain/interface/ai/tool";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { EAiResponseFormatType } from "@domain/enum/ai/response-format-type.enum";
import { EAzureOpenAIModel } from "@domain/enum/azure-openai-model.enum";
import { ELLMProvider } from "@domain/enum/llm-provider.enum";
import { LlmAuthenticationErrorDetectorService } from "@infrastructure/service/llm/authentication-error-detector.service";
import OpenAI from "openai";

const DEPLOYMENT_NAME_INDEX: number = 2;
const ENDPOINT_INDEX: number = 0;
const CREDENTIAL_VALUE_INDEX: number = 1;

/**
 * Azure OpenAI provider adapter.
 */
export class AzureOpenAiLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const azureCredential: { baseUrl: string; credentialValue: string; deploymentName: string } = this.parseAzureCredential(configuration.getCredential().getValue());
		const deploymentName: string = azureCredential.deploymentName;
		const client: OpenAI = this.createClient(azureCredential);

		const response: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create(this.buildRequest(messages, configuration, deploymentName) as never);

		const text: null | string | undefined = response.choices[0]?.message?.content;

		if (!text) {
			throw new Error("Azure OpenAI returned empty response");
		}

		return text;
	}

	async *generateStream(messages: Array<ILlmMessage>, configuration: LlmConfiguration): AsyncGenerator<string> {
		const azureCredential: { baseUrl: string; credentialValue: string; deploymentName: string } = this.parseAzureCredential(configuration.getCredential().getValue());
		const deploymentName: string = azureCredential.deploymentName;
		const client: OpenAI = this.createClient(azureCredential);
		const streamPropertyName: "stream" = "stream" as const;

		const stream: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create({
			...this.buildRequest(messages, configuration, deploymentName),
			[streamPropertyName]: true,
		} as never);

		for await (const chunk of stream as unknown as AsyncIterable<{ choices?: Array<{ delta?: { content?: null | string } }> }>) {
			const delta: null | string | undefined = chunk.choices?.[0]?.delta?.content;

			if (delta) {
				yield delta;
			}
		}
	}

	getName(): string {
		return ELLMProvider.AZURE_OPENAI;
	}

	isAuthenticationError(error: unknown): boolean {
		return LlmAuthenticationErrorDetectorService.isAuthenticationError(error);
	}

	private buildRequest(messages: Array<ILlmMessage>, configuration: LlmConfiguration, deploymentName: string): Record<string, unknown> {
		const options: IGenerationOptions = configuration.getGenerationOptions();
		const azureOptions: NonNullable<IGenerationOptions["providerOptions"]>["azureOpenai"] | undefined = options.providerOptions?.azureOpenai;
		const model: string = configuration.getModel() ?? deploymentName ?? EAzureOpenAIModel.GPT_5_5;

		if ((model.startsWith("o") || model.startsWith("gpt-5")) && options.stopSequences?.length) {
			throw new Error("Azure OpenAI reasoning models do not support stop sequences.");
		}

		return {
			frequency_penalty: options.frequencyPenalty,
			max_completion_tokens: options.maxCompletionTokens ?? azureOptions?.maxCompletionTokens,
			max_tokens: options.maxCompletionTokens || azureOptions?.maxCompletionTokens ? undefined : configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			model,
			["parallel_tool_calls"]: options.shouldUseParallelToolCalls ?? azureOptions?.shouldUseParallelToolCalls,
			presence_penalty: options.presencePenalty,
			reasoning_effort: options.reasoning?.effort ?? azureOptions?.reasoningEffort,
			response_format: options.responseFormat
				? {
						json_schema:
							options.responseFormat.type === EAiResponseFormatType.JSON_SCHEMA
								? {
										description: options.responseFormat.description,
										name: options.responseFormat.name,
										schema: options.responseFormat.schema,
										["strict"]: options.responseFormat.isStrict,
									}
								: undefined,
						type: options.responseFormat.type,
					}
				: undefined,
			seed: options.seed,
			stop: options.stopSequences,
			stream_options: azureOptions?.streamOptions ? { ["include_usage"]: azureOptions.streamOptions.shouldIncludeUsage } : undefined,
			temperature: configuration.getTemperature(),
			tool_choice: options.toolChoice?.name ? { function: { name: options.toolChoice.name }, type: "function" } : options.toolChoice?.mode,
			tools: options.tools?.map((tool: IAiToolDefinition) => ({
				function: {
					description: tool.description,
					name: tool.name,
					parameters: tool.parameters,
					["strict"]: tool.isStrict,
				},
				type: "function",
			})),
			top_p: options.topP,
		};
	}

	private createClient(azureCredential: { baseUrl: string; credentialValue: string; deploymentName: string }): OpenAI {
		return new OpenAI({
			apiKey: azureCredential.credentialValue,
			baseURL: `${azureCredential.baseUrl}/openai/deployments/${azureCredential.deploymentName}`,
			defaultQuery: { "api-version": "2024-10-21" },
		});
	}

	private parseAzureCredential(value: string): { baseUrl: string; credentialValue: string; deploymentName: string } {
		const parts: Array<string> = value.split("|");
		const endpoint: string | undefined = parts[ENDPOINT_INDEX];
		const credentialValue: string | undefined = parts[CREDENTIAL_VALUE_INDEX];
		const deploymentName: string | undefined = parts[DEPLOYMENT_NAME_INDEX];

		if (!endpoint || !credentialValue || !deploymentName) {
			throw new Error("Azure credential must be in format endpoint|api-key|deployment-name");
		}

		return {
			baseUrl: endpoint.trim().replace(/\/$/, ""),
			credentialValue: credentialValue.trim(),
			deploymentName: deploymentName.trim(),
		};
	}

	private toCompletionMessages(messages: Array<ILlmMessage>): Array<ChatCompletionMessageParam> {
		return messages.map(
			(message: ILlmMessage): ChatCompletionMessageParam => ({
				content: message.content,
				role: message.role,
			}),
		);
	}
}
