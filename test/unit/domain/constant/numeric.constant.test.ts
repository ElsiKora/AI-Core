import { describe, expect, it } from "vitest";

import { DEFAULT_MAX_RETRIES, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE, DEFAULT_VALIDATION_RETRIES, MAX_RETRY_COUNT, MIN_CREDENTIAL_LENGTH, MIN_RETRY_COUNT, MIN_SELECT_OPTIONS_FOR_SEARCH, REDACTED_VISIBLE_LENGTH } from "@/domain/constant/numeric.constant.js";

describe("numeric.constant", () => {
	it("exports DEFAULT_MAX_RETRIES as 3", () => {
		expect(DEFAULT_MAX_RETRIES).toBe(3);
	});

	it("exports DEFAULT_MAX_TOKENS as 2048", () => {
		expect(DEFAULT_MAX_TOKENS).toBe(2048);
	});

	it("exports DEFAULT_TEMPERATURE as 0.2", () => {
		expect(DEFAULT_TEMPERATURE).toBe(0.2);
	});

	it("exports DEFAULT_VALIDATION_RETRIES as 3", () => {
		expect(DEFAULT_VALIDATION_RETRIES).toBe(3);
	});

	it("exports MAX_RETRY_COUNT as 10", () => {
		expect(MAX_RETRY_COUNT).toBe(10);
	});

	it("exports MIN_CREDENTIAL_LENGTH as 3", () => {
		expect(MIN_CREDENTIAL_LENGTH).toBe(3);
	});

	it("exports MIN_RETRY_COUNT as 1", () => {
		expect(MIN_RETRY_COUNT).toBe(1);
	});

	it("exports MIN_SELECT_OPTIONS_FOR_SEARCH as 8", () => {
		expect(MIN_SELECT_OPTIONS_FOR_SEARCH).toBe(8);
	});

	it("exports REDACTED_VISIBLE_LENGTH as 4", () => {
		expect(REDACTED_VISIBLE_LENGTH).toBe(4);
	});
});
