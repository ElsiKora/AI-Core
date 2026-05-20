import { beforeEach, describe, expect, it, vi } from "vitest";

import { ELLMProvider } from "@/domain/enum/llm-provider.enum";
import { BeanCliInterfaceService } from "@/infrastructure/service/bean-cli-interface.service";

describe("BeanCliInterfaceService", () => {
	const beanMock = {
		confirm: vi.fn(),
		log: vi.fn(),
		password: vi.fn(),
		select: vi.fn(),
		text: vi.fn(),
	};
	const service = new BeanCliInterfaceService(beanMock as never);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("maps confirm response", async () => {
		beanMock.confirm.mockResolvedValue(true);

		await expect(service.confirm("Continue?", true)).resolves.toBe(true);
	});

	it("maps select response to typed option value", async () => {
		beanMock.select.mockResolvedValue("1");

		const selected: ELLMProvider = await service.select("Select provider", [
			{ label: "OpenAI", value: ELLMProvider.OPENAI },
			{ label: "Anthropic", value: ELLMProvider.ANTHROPIC },
		]);

		expect(selected).toBe(ELLMProvider.ANTHROPIC);
	});

	it("uses bean password prompt for sensitive input", async () => {
		beanMock.password.mockResolvedValue("sk-secret");

		await expect(service.password("API key:")).resolves.toBe("sk-secret");
	});

	it("throws when prompt is cancelled", async () => {
		beanMock.text.mockResolvedValue(null);

		await expect(service.text("Enter value")).rejects.toThrow("was cancelled");
	});

	it("writes log levels through bean logger", () => {
		service.info("Info");
		service.success("Success");
		service.warn("Warn");

		expect(beanMock.log).toHaveBeenCalledWith({ level: "info", message: "Info" });
		expect(beanMock.log).toHaveBeenCalledWith({ level: "success", message: "Success" });
		expect(beanMock.log).toHaveBeenCalledWith({ level: "warn", message: "Warn" });
	});
});
