import type { IGenerateDirectInput } from "./direct-input.interface.js";
import type { IGenerateProfileInput } from "./profile-input.interface.js";

/**
 * Input contract for generic text generation.
 */
export type TGenerateInput = IGenerateDirectInput | IGenerateProfileInput;
