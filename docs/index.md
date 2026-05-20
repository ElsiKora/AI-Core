# AI-Core Docs

## Overview

`@elsikora/ai-core` is a provider-agnostic runtime that resolves module profiles and executes LLM generation through a single adapter.

## Main concepts

- `AiCoreAdapter`: public entry point.
- `PROFILE` mode: generation through module profile from `.elsikora/ai-core.config.js`.
- `inspectProfile`: non-interactive typed profile inspection.
- `ensureProfile`: canonical interactive/non-interactive profile preparation.
- `ProfileResolutionError`: typed fail-fast error for profile readiness issues.

## Docs map

- `docs/api/profile-resolution-contract.md` - profile readiness contract and error model.
