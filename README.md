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
			reasoning: {
				effort: "medium",
			},
			responseFormat: {
				isStrict: true,
				name: "commit_message",
				schema: {
					type: "object",
					properties: {
						message: { type: "string" },
					},
					required: ["message"],
				},
				type: "json_schema",
			},
			retries: 3,
			shouldRepromptCredentialOnAuthenticationFailure: true,
			shouldUseParallelToolCalls: true,
			validationRetries: 3,
		},
	},
};
```

Credentials are resolved from environment variables by provider (for example `OPENAI_API_KEY`).

## Runtime generation options

Profiles and direct generation requests accept provider-neutral controls such as `maxTokens`, `temperature`, `topP`, `topK`, `seed`, `stopSequences`, `timeoutMs`, `reasoning`, `responseFormat`, `tools`, `toolChoice`, `shouldUseParallelToolCalls`, and `shouldRepromptCredentialOnAuthenticationFailure`.

Set `shouldRepromptCredentialOnAuthenticationFailure: true` when an interactive CLI should ask for a replacement credential if the current runtime credential, including one resolved from the environment, is rejected by the provider.

Provider-specific options live under `providerOptions` and are mapped only inside infrastructure adapters. Examples include OpenAI `apiMode`, `serviceTier`, `textVerbosity`, and `shouldStore`; Anthropic `speed`, `serviceTier`, and `thinking`; Google `thinkingConfig`; AWS Bedrock guardrail and performance options; Cerebras reasoning/logprob options; Ollama reasoning controls; and Vercel AI Gateway provider options.

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
