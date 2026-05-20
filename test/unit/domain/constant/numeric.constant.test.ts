import { describe, expect, it } from "vitest";

import { NUMERIC_CONSTANT } from "@/domain/constant/numeric.constant";

describe("numeric.constant", () => {
	it("exports NUMERIC_CONSTANT.DEFAULT_MAX_RETRIES as 3", () => {
		expect(NUMERIC_CONSTANT.DEFAULT_MAX_RETRIES).toBe(3);
	});

	it("exports NUMERIC_CONSTANT.DEFAULT_MAX_TOKENS as 2048", () => {
		expect(NUMERIC_CONSTANT.DEFAULT_MAX_TOKENS).toBe(2048);
	});

	it("exports NUMERIC_CONSTANT.DEFAULT_TEMPERATURE as 0.2", () => {
		expect(NUMERIC_CONSTANT.DEFAULT_TEMPERATURE).toBe(0.2);
	});

	it("exports NUMERIC_CONSTANT.DEFAULT_VALIDATION_RETRIES as 3", () => {
		expect(NUMERIC_CONSTANT.DEFAULT_VALIDATION_RETRIES).toBe(3);
	});

	it("exports NUMERIC_CONSTANT.MAX_RETRY_COUNT as 10", () => {
		expect(NUMERIC_CONSTANT.MAX_RETRY_COUNT).toBe(10);
	});

	it("exports NUMERIC_CONSTANT.MIN_CREDENTIAL_LENGTH as 3", () => {
		expect(NUMERIC_CONSTANT.MIN_CREDENTIAL_LENGTH).toBe(3);
	});

	it("exports NUMERIC_CONSTANT.MIN_RETRY_COUNT as 1", () => {
		expect(NUMERIC_CONSTANT.MIN_RETRY_COUNT).toBe(1);
	});

	it("exports NUMERIC_CONSTANT.MIN_SELECT_OPTIONS_FOR_SEARCH as 8", () => {
		expect(NUMERIC_CONSTANT.MIN_SELECT_OPTIONS_FOR_SEARCH).toBe(8);
	});

	it("exports NUMERIC_CONSTANT.REDACTED_VISIBLE_LENGTH as 4", () => {
		expect(NUMERIC_CONSTANT.REDACTED_VISIBLE_LENGTH).toBe(4);
	});
});
