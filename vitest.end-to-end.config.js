import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(currentDirectoryPath, "./src"),
			"@application": path.resolve(currentDirectoryPath, "./src/application"),
			"@domain": path.resolve(currentDirectoryPath, "./src/domain"),
			"@infrastructure": path.resolve(currentDirectoryPath, "./src/infrastructure"),
			"@presentation": path.resolve(currentDirectoryPath, "./src/presentation"),
			src: path.resolve(currentDirectoryPath, "./src"),
			test: path.resolve(currentDirectoryPath, "./test"),
		},
	},
	test: {
		coverage: {
			all: true,
			exclude: ["node_modules/", "dist/", "**/index.ts", "src/index.ts", "**/*.d.ts", "**/test/**", "**/*.interface.ts", "**/*.type.ts", "*.config.js", "*.config.ts", ".elsikora/**"],
			include: ["src/**/*.ts", "!src/index.ts"],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
		environment: "node",
		exclude: ["**/node_modules/**", "**/dist/**", "**/test/unit/**"],
		globals: true,
		include: ["test/e2e/**/*.test.ts"],
		root: ".",
		watch: false,
	},
});
