import { mockProvider, overrideProvider, resetTestingContainer } from "@elsikora/cladi-testing";
import { afterEach, describe, expect, it } from "vitest";

import { createAiCoreContainer } from "@/infrastructure/di/container.js";
import { ConfigureLlmUseCaseToken, EnsureProfileUseCaseToken, GenerateTextUseCaseToken, InspectProfileUseCaseToken, ModelRegistryServiceToken } from "@/infrastructure/di/token.js";

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
		expect(container.resolve(InspectProfileUseCaseToken)).toBeDefined();
		expect(container.resolve(EnsureProfileUseCaseToken)).toBeDefined();
	});

	it("resolves GenerateTextUseCase", () => {
		const container = createAiCoreContainer();
		ACTIVE_CONTAINERS.push(container);
		const useCase = container.resolve(GenerateTextUseCaseToken);
		expect(useCase).toBeDefined();
		expect(typeof useCase.execute).toBe("function");
	});

	it("resolves ConfigureLlmUseCase when no cliInterface is provided", () => {
		const container = createAiCoreContainer();
		ACTIVE_CONTAINERS.push(container);
		const configureUseCase = container.resolve(ConfigureLlmUseCaseToken);
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

		await overrideProvider(container, mockProvider(ModelRegistryServiceToken, mockedRegistry as never));

		const resolvedRegistry = container.resolve(ModelRegistryServiceToken);
		expect(resolvedRegistry).toBe(mockedRegistry);
	});
});
