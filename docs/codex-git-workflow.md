<!-- codex-project-git-workflow: initialized -->
<!-- initialized-at: 2026-05-31 12:59:05 +08:00 -->

# Codex Git Workflow

Initialization status: initialized
Project: LitPng
Repository root: `/Users/onovich/WebProjects/LitPng`
Machine config: `.codex/project-git-workflow.json`
Skill: project-git-workflow

Treat this document and the machine config as the source of truth for this repository's Codex git workflow. Do not replace them with generic defaults unless the user explicitly asks to reinitialize or update the policy.

## Status

`git status --short --branch`

## Validation

Run these before commit or push, in order:

Run `npm run validate`, `npm run test:e2e`, `npm run audit:prod`, and `cargo fmt --manifest-path packages/pngquant-wasm/Cargo.toml -- --check` before commit or push.
## Staging Policy

ask each time

Inspect status before staging. Preserve unrelated user changes unless the user explicitly asks to include them.

## Commit

Use the global wrapper's built-in git commit after staging according to policy. Prefer concise conventional commit messages unless the user specifies another message.

## Push

`git push -u origin HEAD`

## Docs And TODO

None configured.

## Safety And Branch Policy

No extra policy configured. Destructive git commands still require explicit user approval.
