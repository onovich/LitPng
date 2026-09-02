<!-- codex-project-ops-workflow: initialized -->
<!-- initialized-at: 2026-05-31 12:59:06 +08:00 -->

# Codex Ops Workflow

Initialization status: initialized
Project: LitPng
Repository root: `/Users/onovich/WebProjects/LitPng`
Machine config: `.codex/project-ops-workflow.json`
Skill: project-ops-workflow

Treat this document and .codex/project-ops-workflow.json as the source of truth for mechanical project operations.

## Project Commands

- Validate: `npm run validate`
- Browser codec smoke: `npm run test:e2e`
- Production dependency audit: `npm run audit:prod`
- Build WASM: `npm run codec:build-wasm`
- Start: `npm run dev`
- Preview: `npm run preview`

## Validate Sequence

test, typecheck, build, codec:test

## Dev Server

Start command: `npm run dev`
Health URL: `http://127.0.0.1:4321/`
Ready text: `LittlePNG`
Timeout seconds: 30

## Safety Policy

Do not run destructive clean/reset/deploy commands unless the user explicitly asks.
