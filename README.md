# @elsikora/ai-core

Unified AI runtime for ElsiKora packages and CLIs.

## What this package provides

- Single adapter for generation across providers.
- `profile` mode for module-based runtime configuration.
- Interactive configuration wizard for first-time setup.
- Typed profile readiness contract (`inspectProfile`, `ensureProfile`).
- Fail-fast typed errors for missing or invalid profile state.

## Install

```bash
npm install @elsikora/ai-core
```

## Configuration

Create `.elsikora/ai-core.config.js` in your project:

```js
export default {
	modules: {
		"your-module-id": {
			model: "gpt-4o",
			provider: "openai",
			retries: 3,
			validationRetries: 3,
		},
	},
};
```

Credentials are resolved from environment variables by provider (for example `OPENAI_API_KEY`).

## Public adapter API

```ts
import { AiCoreAdapter, EGenerateMode } from "@elsikora/ai-core";

const adapter = AiCoreAdapter.create();

const inspection = await adapter.inspectProfile("your-module-id");
const profile = await adapter.ensureProfile("your-module-id");

const result = await adapter.generate({
	mode: EGenerateMode.PROFILE,
	moduleId: "your-module-id",
	prompt: "Generate a concise commit message",
});
```

## Profile readiness behavior

- `inspectProfile(moduleId)` never prompts and returns a typed status:
  - `ready`
  - `missing_profile`
  - `missing_credential`
  - `invalid_profile`
- `ensureProfile(moduleId)` applies canonical orchestration:
  - missing profile + TTY -> run full interactive configure
  - missing credential + TTY -> prompt credential only
  - non-TTY missing state -> throw typed `ProfileResolutionError`

## Typed profile errors

`ProfileResolutionError` exposes:

- `code`: `missing_profile` | `missing_credential` | `invalid_profile`
- `moduleId`
- `provider` (when known)
- `environmentVariableName` (when known)

## Validation scripts

- `npm run validate:fast`
- `npm run validate:pr`
- `npm run validate:heavy`
