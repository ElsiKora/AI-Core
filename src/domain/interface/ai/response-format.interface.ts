import type { EAiResponseFormatType } from "@domain/enum/ai/response-format-type.enum";

export interface IAiResponseFormat {
	description?: string;
	isStrict?: boolean;
	name?: string;
	schema?: Record<string, unknown>;
	type: EAiResponseFormatType;
}
