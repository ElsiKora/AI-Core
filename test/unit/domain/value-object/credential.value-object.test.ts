import { describe, expect, it } from "vitest";

import { Credential } from "@/domain/value-object/credential.value-object.js";

describe("Credential", () => {
	it("constructs with non-empty string", () => {
		const cred = new Credential("sk-abc123");
		expect(cred.getValue()).toBe("sk-abc123");
	});

	it("trims whitespace", () => {
		const cred = new Credential("  sk-xyz  ");
		expect(cred.getValue()).toBe("sk-xyz");
	});

	it("throws when empty", () => {
		expect(() => new Credential("")).toThrow("Credential cannot be empty");
	});

	it("throws when whitespace only", () => {
		expect(() => new Credential("   ")).toThrow("Credential cannot be empty");
	});

	it("equals returns true for same value", () => {
		const a = new Credential("abc");
		const b = new Credential("abc");
		expect(a.equals(b)).toBe(true);
	});

	it("equals returns false for different value", () => {
		const a = new Credential("abc");
		const b = new Credential("def");
		expect(a.equals(b)).toBe(false);
	});

	it("isValid returns false for short credential", () => {
		const cred = new Credential("ab"); // length 2 < MIN_CREDENTIAL_LENGTH(3)
		expect(cred.isValid()).toBe(false);
	});

	it("isValid returns false when contains placeholder", () => {
		const cred = new Credential("your-api-key-here");
		expect(cred.isValid()).toBe(false);
	});

	it("isValid returns true for real-looking credential", () => {
		const cred = new Credential("sk-proj-abc123xyz");
		expect(cred.isValid()).toBe(true);
	});

	it("toRedacted returns **** for short credential", () => {
		const cred = new Credential("abc");
		expect(cred.toRedacted()).toBe("****");
	});

	it("toRedacted reveals prefix and suffix for long credential", () => {
		const cred = new Credential("sk-verylongapikey123456");
		const redacted = cred.toRedacted();
		expect(redacted).toMatch(/\.\.\./);
		expect(redacted).not.toBe("****");
	});
});
