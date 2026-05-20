import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { LlmConfiguration } from "../../domain/entity/llm-configuration.entity.js";
import type { ILlmMessage } from "../../domain/interface/llm/message.interface.js";

import OpenAI from "openai";

import { EAzureOpenAIModel } from "../../domain/enum/azure-openai-model.enum.js";
import { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";

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

		const response: Awaited<ReturnType<OpenAI["chat"]["completions"]["create"]>> = await client.chat.completions.create({
			max_tokens: configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			model: configuration.getModel() ?? deploymentName ?? EAzureOpenAIModel.GPT_4O,
			temperature: configuration.getTemperature(),
		});

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
			max_tokens: configuration.getMaxTokens(),
			messages: this.toCompletionMessages(messages),
			model: configuration.getModel() ?? deploymentName ?? EAzureOpenAIModel.GPT_4O,
			[streamPropertyName]: true,
			temperature: configuration.getTemperature(),
		});

		for await (const chunk of stream as AsyncIterable<{ choices?: Array<{ delta?: { content?: null | string } }> }>) {
			const delta: null | string | undefined = chunk.choices?.[0]?.delta?.content;

			if (delta) {
				yield delta;
			}
		}
	}

	getName(): string {
		return ELLMProvider.AZURE_OPENAI;
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
