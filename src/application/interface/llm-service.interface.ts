import type { LlmConfiguration } from "../../domain/entity/llm-configuration.entity.js";
import type { ILlmMessage } from "../../domain/interface/llm/message.interface.js";

/**
 * Provider adapter port.
 */
export interface ILlmService {
	generate(messages: Array<ILlmMessage>, configuration: LlmConfiguration): Promise<string>;
	generateStream?(messages: Array<ILlmMessage>, configuration: LlmConfiguration): AsyncGenerator<string>;
	getName(): string;
}
