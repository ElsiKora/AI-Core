import type { EAiToolChoiceMode } from "@domain/enum/ai/tool/choice-mode.enum";

export interface IAiToolChoice {
	mode: EAiToolChoiceMode;
	name?: string;
}
