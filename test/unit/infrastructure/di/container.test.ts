import { mockProvider, overrideProvider, resetTestingContainer } from "@elsikora/cladi-testing";
import { afterEach, describe, expect, it } from "vitest";

import { createAiCoreContainer } from "@/infrastructure/di/container";
import { DI_TOKEN_CONSTANT } from "@/infrastructure/constant/di/token.constant";

const ACTIVE_CONTAINERS: Array<ReturnType<typeof createAiCoreContainer>> = [];

describe("createAiCoreContainer", () => {
	afterEach(async () => {
		for (const container of ACTIVE_CONTAINERS) {
			await resetTestingContainer(container);
		}

		ACTIVE_CONTAINERS.length = 0;
	});

	it("creates container without cliInterface", () => {
		const container = createAiCoreContainer();
		ACTIVE_CONTAINERS.push(container);
		expect(container).toBeDefined();
		expect(container.resolve(DI_TOKEN_CONSTANT.INSPECT_PROFILE_USE_CASE)).toBeDefined();
		expect(container.resolve(DI_TOKEN_CONSTANT.ENSURE_PROFILE_USE_CASE)).toBeDefined();
	});

	it("resolves GenerateTextUseCase", () => {
		const container = createAiCoreContainer();
		ACTIVE_CONTAINERS.push(container);
		const useCase = container.resolve(DI_TOKEN_CONSTANT.GENERATE_TEXT_USE_CASE);
		expect(useCase).toBeDefined();
		expect(typeof useCase.execute).toBe("function");
	});

	it("resolves ConfigureLlmUseCase when no cliInterface is provided", () => {
		const container = createAiCoreContainer();
		ACTIVE_CONTAINERS.push(container);
		const configureUseCase = container.resolve(DI_TOKEN_CONSTANT.CONFIGURE_LLM_USE_CASE);
		expect(configureUseCase).toBeDefined();
	});

	it("supports provider override through cladi-testing", async () => {
		const container = createAiCoreContainer();
		ACTIVE_CONTAINERS.push(container);

		const mockedRegistry = {
			getDefaultModel: () => "mock-model",
			getModelOptions: () => [],
			getProviderOptions: () => [],
		};

		await overrideProvider(container, mockProvider(DI_TOKEN_CONSTANT.MODEL_REGISTRY_SERVICE, mockedRegistry as never));

		const resolvedRegistry = container.resolve(DI_TOKEN_CONSTANT.MODEL_REGISTRY_SERVICE);
		expect(resolvedRegistry).toBe(mockedRegistry);
	});
});
