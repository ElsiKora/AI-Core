import type { IGenerateDirectInput } from "@domain/interface/generate/direct-input.interface";
import type { IGenerateProfileInput } from "@domain/interface/generate/profile-input.interface";

/**
 * Input contract for generic text generation.
 */
export type TGenerateInput = IGenerateDirectInput | IGenerateProfileInput;
