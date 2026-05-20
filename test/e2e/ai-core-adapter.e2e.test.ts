import type { ICliInterfaceService } from "@application/interface/cli-interface-service.interface";

import { afterEach, describe, expect, it, vi } from "vitest";

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { EProfileInspectionStatus } from "@domain/enum/profile-inspection-status.enum";
import { EProfileResolutionErrorCode } from "@domain/enum/profile-resolution-error-code.enum";
import { AiCoreAdapter } from "@presentation/ai-core/adapter";
import { ELLMProvider } from "@domain/enum/llm-provider.enum";

/**
 * Minimal e2e smoke test for AiCoreAdapter.
 * Exercises the real DI container and service wiring.
 */
describe("AiCoreAdapter e2e", () => {
	const ORIGINAL_CWD: string = process.cwd();
	const ORIGINAL_STDIN_TTY: boolean | undefined = process.stdin.isTTY;
	const ORIGINAL_STDOUT_TTY: boolean | undefined = process.stdout.isTTY;

	async function createTemporaryWorkspace(): Promise<string> {
		return fs.mkdtemp(path.join(os.tmpdir(), "ai-core-e2e-"));
	}

	function setInteractiveTty(stdinIsTty: boolean, stdoutIsTty: boolean): void {
		Object.defineProperty(process.stdin, "isTTY", {
			configurable: true,
			value: stdinIsTty,
		});
		Object.defineProperty(process.stdout, "isTTY", {
			configurable: true,
			value: stdoutIsTty,
		});
	}

	async function writeAiCoreConfig(targetDirectory: string, configLiteral: string): Promise<void> {
		const configDirectoryPath: string = path.join(targetDirectory, ".elsikora");
		const configFilePath: string = path.join(configDirectoryPath, "ai-core.config.js");

		await fs.mkdir(configDirectoryPath, { recursive: true });
		await fs.writeFile(configFilePath, `export default ${configLiteral};\n`);
	}

	afterEach(async () => {
		process.chdir(ORIGINAL_CWD);
		Object.defineProperty(process.stdin, "isTTY", {
			configurable: true,
			value: ORIGINAL_STDIN_TTY,
		});
		Object.defineProperty(process.stdout, "isTTY", {
			configurable: true,
			value: ORIGINAL_STDOUT_TTY,
		});
		vi.unstubAllEnvs();
	});

	it("creates adapter and returns provider options", () => {
		const adapter = AiCoreAdapter.create();
		const options = adapter.getProviderOptions();
		expect(options).toBeDefined();
		expect(options.length).toBeGreaterThan(0);
		expect(options.some((o) => o.value === ELLMProvider.OPENAI)).toBe(true);
	});

	it("getModelOptions returns models for OPENAI", () => {
		const adapter = AiCoreAdapter.create();
		const models = adapter.getModelOptions(ELLMProvider.OPENAI);
		expect(models.length).toBeGreaterThan(0);
		expect(models.every((m) => m.provider === ELLMProvider.OPENAI)).toBe(true);
	});

	it("inspectProfile returns missing_profile when module config is absent", async () => {
		const temporaryWorkspacePath: string = await createTemporaryWorkspace();
		process.chdir(temporaryWorkspacePath);
		const adapter = AiCoreAdapter.create();

		const result = await adapter.inspectProfile("commitizen");

		expect(result.status).toBe(EProfileInspectionStatus.MISSING_PROFILE);
	});

	it("ensureProfile fails fast with typed missing_profile in non-interactive shell", async () => {
		const temporaryWorkspacePath: string = await createTemporaryWorkspace();
		process.chdir(temporaryWorkspacePath);
		setInteractiveTty(false, false);
		const adapter = AiCoreAdapter.create();

		await expect(adapter.ensureProfile("commitizen")).rejects.toMatchObject({
			code: EProfileResolutionErrorCode.MISSING_PROFILE,
			name: "ProfileResolutionError",
		});
	});

	it("inspectProfile returns missing_credential when profile exists but env credential is absent", async () => {
		const temporaryWorkspacePath: string = await createTemporaryWorkspace();
		process.chdir(temporaryWorkspacePath);
		vi.stubEnv("OPENAI_API_KEY", undefined);
		await writeAiCoreConfig(
			temporaryWorkspacePath,
			JSON.stringify({
				modules: {
					commitizen: {
						model: "gpt-4o",
						provider: "openai",
					},
				},
			}),
		);
		const adapter = AiCoreAdapter.create();

		const result = await adapter.inspectProfile("commitizen");

		expect(result.status).toBe(EProfileInspectionStatus.MISSING_CREDENTIAL);
	});

	it("ensureProfile prompts only credential when profile exists and shell is interactive", async () => {
		const temporaryWorkspacePath: string = await createTemporaryWorkspace();
		process.chdir(temporaryWorkspacePath);
		vi.stubEnv("OPENAI_API_KEY", undefined);
		await writeAiCoreConfig(
			temporaryWorkspacePath,
			JSON.stringify({
				modules: {
					commitizen: {
						model: "gpt-4o",
						provider: "openai",
					},
				},
			}),
		);
		setInteractiveTty(true, true);

		const cliInterface: ICliInterfaceService = {
			confirm: vi.fn(),
			info: vi.fn(),
			password: vi.fn().mockResolvedValue("sk-manual"),
			select: vi.fn(),
			success: vi.fn(),
			text: vi.fn(),
			warn: vi.fn(),
		};
		const adapter = AiCoreAdapter.create({ cliInterface });

		const profile = await adapter.ensureProfile("commitizen");

		expect(profile.provider).toBe(ELLMProvider.OPENAI);
		expect(profile.credential.getValue()).toBe("sk-manual");
		expect(cliInterface.password).toHaveBeenCalled();
		expect(cliInterface.select).not.toHaveBeenCalled();
	});
});
