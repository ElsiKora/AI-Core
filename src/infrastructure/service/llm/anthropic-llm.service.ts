import type { ILlmService } from "@application/interface/llm-service.interface";
import type { LlmConfiguration } from "@domain/entity/llm-configuration.entity";
import type { IGenerationOptions } from "@domain/interface/ai/generation-options.interface";
import type { IAiToolDefinition } from "@domain/interface/ai/tool";
import type { ILlmMessage } from "@domain/interface/llm/message.interface";

import Anthropic from "@anthropic-ai/sdk";
import { NUMERIC_CONSTANT } from "@domain/constant/numeric.constant";
import { EAiAnthropicSpeed } from "@domain/enum/ai/provider/anthropic/speed.enum";
import { EAnthropicModel } from "@domain/enum/anthropic-model.enum";
import { ELLMMessageRole } from "@domain/enum/llm-message-role.enum";
import { ELLMProvider } from "@domain/enum/llm-provider.enum";
import { LlmAuthenticationErrorDetectorService } from "@infrastructure/service/llm/authentication-error-detector.service";

/**
 * Anthropic provider adapter.
 */
export class AnthropicLlmService implements ILlmService {
	async generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string> {
		const client: Anthropic = new Anthropic({ apiKey: configuration.getCredential().getValue() });

		const systemPrompt: string = messages
			.filter((message: ILlmMessage): boolean => message.role === ELLMMessageRole.SYSTEM)
			.map((message: ILlmMessage): string => message.content)
			.join("\n\n");

		const chatMessages: Array<Anthropic.MessageParam> = messages
			.filter((message: ILlmMessage): boolean => message.role !== ELLMMessageRole.SYSTEM)
			.map(
				(message: ILlmMessage): Anthropic.MessageParam => ({
					content: message.content,
					role: message.role === ELLMMessageRole.ASSISTANT ? "assistant" : "user",
				}),
			);

		const response: Anthropic.Message = (await this.createMessage(client, chatMessages, systemPrompt, configuration)) as Anthropic.Message;

		const text: string = response.content
			.filter((part: Anthropic.ContentBlock): part is Anthropic.TextBlock => part.type === "text")
			.map((part: Anthropic.TextBlock): string => part.text)
			.join("\n")
			.trim();

		if (!text) {
			throw new Error("Anthropic returned empty response");
		}

		return text;
	}

	getName(): string {
		return ELLMProvider.ANTHROPIC;
	}

	isAuthenticationError(error: unknown): boolean {
		return LlmAuthenticationErrorDetectorService.isAuthenticationError(error);
	}

	private async createMessage(client: Anthropic, chatMessages: Array<Anthropic.MessageParam>, systemPrompt: string, configuration: LlmConfiguration): Promise<Awaited<ReturnType<Anthropic["messages"]["create"]>>> {
		this.ensureSupportedOptions(configuration);

		const options: IGenerationOptions = configuration.getGenerationOptions();
		const anthropicOptions: NonNullable<IGenerationOptions["providerOptions"]>["anthropic"] | undefined = options.providerOptions?.anthropic;

		const request: Record<string, unknown> = {
			max_tokens: configuration.getMaxTokens() ?? NUMERIC_CONSTANT.DEFAULT_MAX_TOKENS,
			messages: chatMessages.length > 0 ? chatMessages : [{ content: "Continue.", role: "user" }],
			metadata: anthropicOptions?.metadata ? { user_id: anthropicOptions.metadata.userId } : undefined,
			model: configuration.getModel() ?? EAnthropicModel.CLAUDE_SONNET_4_6,
			output_config: this.toOutputConfig(options, anthropicOptions),
			service_tier: anthropicOptions?.serviceTier,
			stop_sequences: options.stopSequences,
			system: systemPrompt || undefined,
			temperature: configuration.getTemperature(),
			thinking: anthropicOptions?.thinking ?? this.toThinking(configuration),
			tool_choice: options.toolChoice ? { name: options.toolChoice.name, type: options.toolChoice.name ? "tool" : options.toolChoice.mode } : undefined,
			tools: options.tools?.map((tool: IAiToolDefinition) => ({
				description: tool.description,
				input_schema: tool.parameters,
				name: tool.name,
			})),
			top_k: anthropicOptions?.topK ?? options.topK,
			top_p: options.topP,
		};

		if (anthropicOptions?.speed === EAiAnthropicSpeed.FAST) {
			return client.beta.messages.create({
				...request,
				betas: anthropicOptions.betas ?? ["fast-mode-2026-02-01"],
				speed: "fast",
			} as never) as Promise<Awaited<ReturnType<Anthropic["messages"]["create"]>>>;
		}

		return client.messages.create(request as never);
	}

	private ensureSupportedOptions(configuration: LlmConfiguration): void {
		const model: string = configuration.getModel() ?? "";

		if (!model.includes("opus-4-7")) {
			return;
		}

		const options: IGenerationOptions = configuration.getGenerationOptions();

		if (options.temperature !== undefined || options.topP !== undefined || options.topK !== undefined) {
			throw new Error("Anthropic Claude Opus 4.7 does not support temperature, topP, or topK overrides.");
		}
	}

	private toOutputConfig(options: IGenerationOptions, anthropicOptions: NonNullable<IGenerationOptions["providerOptions"]>["anthropic"] | undefined): Record<string, unknown> | undefined {
		if (options.responseFormat) {
			return {
				effort: anthropicOptions?.effort,
				format: {
					schema: options.responseFormat.schema,
					type: "json_schema",
				},
			};
		}

		if (anthropicOptions?.effort) {
			return { effort: anthropicOptions.effort };
		}

		return undefined;
	}

	private toThinking(configuration: LlmConfiguration): Record<string, unknown> | undefined {
		const reasoning: IGenerationOptions["reasoning"] = configuration.getGenerationOptions().reasoning;

		if (!reasoning?.mode) {
			return undefined;
		}

		return {
			budget_tokens: reasoning.budgetTokens,
			display: reasoning.display,
			type: reasoning.mode,
		};
	}
}
