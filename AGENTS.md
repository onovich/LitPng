# AGENTS.md

<!-- codex-init-flow: initialized -->

## Codex Project Workflow

Initialization status: initialized
Initialized at: 2026-05-31 12:59:05 +08:00
Project root: /Users/onovich/WebProjects/LitPng
Initial git remote: git@github.com:onovich/LitPng.git

Use these workflow skills for routine Codex work in this project:

- `init-flow`: initialize or refresh this project document and workflow configuration.
- `project-git-workflow` / `git-flow`: use for git status, validation, commit, push, stash, ignore, and guarded discard operations.
- `project-ops-workflow` / `ops-flow`: use for environment checks, dependencies, build, test, lint, format, typecheck, dev server, smoke, package, and release dry-run operations.

Prefer the configured project commands instead of guessing project commands:

```sh
git status --short --branch
npm run validate
npm run test:e2e
npm run dev
npm run codec:build-wasm
```

Project-specific workflow configs live at:

- `.codex/project-git-workflow.json`
- `.codex/project-ops-workflow.json`

Do not silently fall back to generic git/build/test behavior when those configs exist. Update this section and the workflow configs deliberately when project policy changes.

Project memory and implementation lessons live at:

- `docs/project-lessons.md`

For manual browser smoke, double-click:

- `ManualSmoke.cmd`

<!-- /codex-init-flow -->
