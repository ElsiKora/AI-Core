import type { EAiToolType } from "@domain/enum/ai/tool/type.enum";

export interface IAiToolDefinition {
	description?: string;
	isStrict?: boolean;
	name: string;
	options?: Record<string, unknown>;
	parameters?: Record<string, unknown>;
	providerName?: string;
	type: EAiToolType;
}
