# Phase 0 Architecture Rules

Date: 2026-05-31

Phase 0 exists before feature growth. Its job is to keep LittlePNG fast, readable, and predictable while the app expands from a browser prototype into a product with WASM codecs, SEO routes, desktop packaging, and developer tools.

Every Phase 1-2 change must pass this checklist before commit.

## 1. Product Boundary

LittlePNG is a local-first batch image preparation tool.

Primary workflow:

```text
Import -> Plan -> Rename -> Transform -> Encode -> Export
```

Allowed Phase 1-2 scope:

- Browser-local image processing.
- Queue-based batch work.
- Rename, resize, crop, convert, compress, ZIP export.
- SEO pages that route into the same tool with different presets.
- Codec adapters behind stable boundaries.

Out of scope for Phase 1-2:

- Accounts.
- Payments.
- Cloud upload compression.
- AI editing.
- Complex image editor UI.
- Direct coupling between UI components and codec internals.

## 2. Directory Contract

The repository must keep this structure:

```text
apps/web
  src/components      React UI components only
  src/data            SEO route and preset data
  src/layouts         Astro layouts
  src/lib             Pure TypeScript domain helpers
  src/pages           Astro route files only
  src/styles          Global and layout CSS
  src/workers         Worker entrypoints and worker-only code

packages/pngquant-wasm
  src                 Rust/WASM codec boundary for imagequant/libimagequant

docs
  product, market, architecture, and roadmap documents
```

Rules:

- `src/pages` must stay thin. Pages choose data and render layouts/components.
- `src/components` may manage UI state but must not own image codec algorithms.
- `src/lib` must stay framework-light and deterministic where possible.
- `src/workers` owns heavy browser image work and must not import React.
- `packages/pngquant-wasm` owns Rust imagequant integration only.

## 3. Dependency Direction

Allowed dependencies:

```text
pages -> layouts -> components -> lib
components -> workers through Worker messages only
workers -> lib/types only
lib -> no React, no Astro, no DOM-only UI code
pngquant-wasm -> Rust codec dependencies only
```

Forbidden dependencies:

- Worker code importing React or UI components.
- Pure helpers importing Astro, React, or browser view components.
- UI directly importing Rust/WASM internals before a codec adapter exists.
- SEO route data depending on runtime UI state.
- Codec packages depending on app routes.

## 4. Control Flow

Batch processing must follow one direction:

```text
User action
  -> UI state update
  -> queue snapshot
  -> worker request
  -> worker response
  -> result state update
  -> export/download
```

Rules:

- One file failure must not stop the batch.
- The queue is the source of truth for task status.
- Workers return structured success/failure messages only.
- UI never mutates a worker-owned buffer.
- Long-running operations must be cancellable in later phases; new code must not make cancellation impossible.
- Large pixel buffers must live for the shortest possible time.

## 5. Naming Rules

Use names that describe product flow, not implementation trivia.

Required vocabulary:

- `ImageJob` for one queued file.
- `ImageSettings` for user-selected processing options.
- `ProcessedImage` for a completed output.
- `WorkerRequest` and `WorkerResponse` for worker protocol.
- `outputName` for final filename.
- `sourceName` and `sourceSize` for original file metadata.

File naming:

- React components: `PascalCase.tsx`.
- TypeScript helpers: `camelCase.ts`.
- Worker entrypoints: `nameWorker.ts`.
- Docs: lowercase kebab case.
- Rust package: lowercase kebab case.

Avoid:

- Ambiguous names like `data`, `item`, `thing`, `helper`, `util2`.
- Format-specific names in generic code unless the function is truly format-specific.
- Abbreviations except common image terms like PNG, JPG, WebP, ZIP.

## 6. Code Style

TypeScript:

- Prefer explicit exported types for boundaries.
- Keep functions small and single-purpose.
- Keep pure helpers in `src/lib`.
- Avoid hidden global mutable state.
- Use discriminated unions for protocol messages.
- No broad `any` in app code.
- Do not catch errors silently.

React:

- Components can hold interaction state.
- Derived totals should use `useMemo`.
- Worker creation should be lazy.
- Event handlers should read clearly from top to bottom.
- Do not add nested UI cards.

CSS:

- Stable dimensions for controls, queues, and buttons.
- No viewport-width font scaling.
- Letter spacing stays `0`.
- Cards only for real repeated items or tool panels.
- Avoid one-note palettes.
- Text must fit inside controls on mobile and desktop.

Rust:

- Keep WASM exports narrow.
- Put PNG quantization behind named exported functions.
- Do not expose libimagequant internals directly to UI code.
- Keep license-sensitive code isolated.

## 7. Performance Rules

- WASM codecs load only when needed.
- Workers own heavy CPU work.
- Default batch concurrency starts conservative.
- Do not decode every file at once.
- Do not keep full-size RGBA buffers in React state.
- Preview data must be smaller than source data.
- ZIP export can collect final blobs, but not decoded pixels.

## 8. Privacy Rules

- Image bytes do not leave the browser in Web MVP.
- File names must not be sent to analytics by default.
- Error reporting must not include image contents.
- If a future cloud path exists, UI must clearly mark it as not local-only.

## 9. Codec Boundary

PNG quantization boundary:

```text
RGBA pixels -> imagequant WASM -> indexed palette result -> PNG encoder
```

Current status:

- `packages/pngquant-wasm` locks the selected `imagequant` dependency.
- The Phase 1 browser worker uses Canvas/OffscreenCanvas as the temporary encode path.
- Phase 2 replaces temporary PNG output with the imagequant codec adapter.

Rules:

- No UI component may call imagequant directly.
- PNG decode and encode remain separate from quantization.
- The codec adapter must expose product-level options, not raw low-level knobs.

## 10. Commit Checklist

Before every commit:

- `npm run typecheck`
- `npm run build`
- `cargo check --manifest-path packages/pngquant-wasm/Cargo.toml`
- Confirm no `node_modules`, `target`, or `apps/web/dist` files are staged.
- Confirm new code follows dependency direction.
- Confirm docs stay UTF-8 without BOM.

Current Phase 1-2 self-check:

- `src/pages` files are thin route wrappers.
- `ImagePrepApp.tsx` owns UI state and worker orchestration only.
- `imageWorker.ts` owns decode/transform/encode work.
- `src/lib` owns filename, type, and ZIP helpers.
- `packages/pngquant-wasm` isolates the selected imagequant dependency.
