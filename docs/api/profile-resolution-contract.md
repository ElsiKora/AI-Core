# Profile Resolution Contract

## Inspection

`inspectProfile(moduleId)` returns a typed status without running prompts.

Possible statuses:

- `ready`: profile and credential are resolved.
- `missing_profile`: module profile is absent.
- `missing_credential`: runtime profile is valid but environment credential is absent.
- `invalid_profile`: module profile exists but cannot be resolved into runtime shape.

## Ensuring

`ensureProfile(moduleId)` is the canonical readiness orchestration:

- `missing_profile` in TTY -> runs full `configure` wizard.
- `missing_credential` in TTY -> prompts credential only.
- any missing/invalid state in non-TTY -> throws `ProfileResolutionError`.

## Error model

`ProfileResolutionError` fields:

- `code`: `missing_profile` | `missing_credential` | `invalid_profile`
- `moduleId`
- `provider` (optional)
- `environmentVariableName` (optional)

## Consumer guidance

- Use `ensureProfile` when your flow may require interactive setup.
- Use `inspectProfile` when you need profile metadata without side effects.
