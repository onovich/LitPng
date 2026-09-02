# Project Lessons

Date: 2026-05-31

This document records implementation lessons that should shape future LittlePNG work. Keep it practical: if a future task repeats one of these areas, check this file before exploring from scratch.

## Product Shape

LittlePNG is strongest as a local-first batch image preparation tool, not as a single-purpose "compress one PNG" page.

Core user jobs that belong together:

- Batch compress PNG/JPG/WebP.
- Batch rename outputs with predictable filename patterns.
- Resize, crop, and format conversion before export.
- Download individual outputs or a ZIP.
- Preserve privacy by keeping bytes in the browser for the Web MVP.

SEO pages should route users into the same tool with presets, instead of creating separate implementations for each keyword. Example pages can target PNG compression, JPG compression, batch image rename, image resize, and image crop, but the processing pipeline should stay shared.

## Architecture Lessons

- Keep the flow as `Import -> Plan -> Rename -> Transform -> Encode -> Export`.
- UI owns interaction state and queue orchestration only.
- Workers own heavy image decode, transform, encode, and compression work.
- Pure helpers live in `apps/web/src/lib` and must not import React or Astro.
- `packages/pngquant-wasm` owns Rust imagequant integration only.
- One failed file must not stop the batch.
- Large RGBA buffers should not enter React state and should be released as soon as the worker is done with them.

The most important boundary is the codec adapter. UI should talk in product-level settings and results, not low-level codec knobs.

## Codec Lessons

`pngquant` CLI is the wrong unit for a browser-first product. Use the underlying library line:

```toml
imagequant = { version = "4.0", default-features = false }
```

Important details:

- `libimagequant`/`imagequant` quantizes RGBA pixels into palette/index data.
- It does not decode PNG files.
- It does not encode final PNG files.
- The browser pipeline still needs separate decode, resize/crop, and encode stages.
- The Rust adapter now owns the final indexed PNG encode so palette alpha and
  indices cannot be separated accidentally at the TypeScript boundary.
- For the current browser worker, lossy PNG uses the generated imagequant WASM,
  lossless PNG uses `@jsquash/png`, and JPEG uses MozJPEG via `@jsquash/jpeg`.
- JPEG product policy belongs outside the worker plumbing: photo inputs may use
  chroma subsampling, while PNG graphics converted to JPEG use 4:4:4 chroma.
- Vite workers that import WASM encoder packages need `worker.format = "es"` in Astro/Vite config; the default IIFE worker format can fail with code-splitting/WASM imports.

Rust adapter rule:

- Keep a pure Rust core function such as `quantize_rgba_core(...)->Result<_, String>`.
- Let the wasm-bindgen exported wrapper convert errors into `JsValue`.
- Native tests should call the pure core function. `JsValue::from_str` can panic outside a wasm runtime.

## Toolchain Lessons

The `wasm32-unknown-unknown` target can appear missing to `rustup target list --installed` even when the active toolchain has manually installed std files. What matters for this repo is that:

```powershell
npm run codec:build-wasm
```

passes.

Known Windows/Rust pitfall encountered:

- A user-level rustup mirror pointed at TUNA.
- The TUNA mirror returned 404 for `rust-std-1.93.1-wasm32-unknown-unknown`.
- The official static Rust URL had the package.
- The workaround was to download the matching `rust-std` tarball and copy `lib/rustlib/wasm32-unknown-unknown` into the active stable toolchain.
- Afterward, restore `RUSTUP_DIST_SERVER` and `RUSTUP_UPDATE_ROOT` if the user's environment expects the mirror.

Do not assume a future target installation failure is a code problem. First verify the active toolchain, mirror config, and whether `codec:build-wasm` already passes.

## Browser And Smoke Lessons

The in-app browser can be useful for visual checks, but it previously blocked localhost with `ERR_BLOCKED_BY_CLIENT`. HTTP smoke with PowerShell `Invoke-WebRequest` is a more reliable first check.

Manual smoke should verify both:

- Mechanical gates: test, typecheck, build, native codec check/test, wasm codec build.
- Runtime gates: preview server responds on `/` and `/png-compressor/`, then a human checks the batch workflow in the browser.
- Compression contract: same-format, no-transform outputs must not replace the original when the encoded result is larger or the same size.
- Mode contract: Lossless mode currently means PNG input to PNG output only; it must disable quality, resize/crop, Original/JPG/WebP output, and worker code must reject unsupported non-PNG inputs instead of silently converting them.

Use the root `ManualSmoke.cmd` for a double-clickable smoke entry.

## Browser Validation Lessons

- A build-only check does not prove that generated WASM loads inside a worker.
  Playwright smoke tests should upload generated fixtures, run the real queue,
  download the result, and inspect the output bytes.
- The transparent PNG smoke must assert indexed PNG color type and a `tRNS`
  chunk; a generic PNG signature alone would not prove the imagequant path ran.
- Astro 7 `astro preview` manages a background process and exits after startup,
  which is incompatible with Playwright's foreground `webServer` lifecycle.
  Use the dedicated `vite preview` test command instead.
- Keep production dependency auditing in CI. When upgrading Astro, remove stale
  transitive overrides that can force incompatible CSS parser versions.
- Target-size compression needs a hard attempt ceiling. Treat selected quality
  as the maximum, choose the highest tested quality under the byte budget, and
  return the smallest valid attempt with an explicit warning if the target is
  unreachable.
- CSV exports must escape delimiters and neutralize formula-leading filenames;
  user-controlled names should never become executable spreadsheet formulas.
- platform presets should cite upstream guidance, distinguish protocol requirements from ecosystem conventions, and map to tested output geometry rather than labels alone;
- browser-persisted settings must validate every field on read, tolerate malformed JSON and storage failures, cap collection growth, and never trust local storage as typed application state;
- Local batch history should be opt-in and retain only explicitly selected
  summary fields and a settings snapshot. Record terminal Worker responses for
  the current run, not an asynchronously updated React queue. Invalidate pending
  recording tokens on disable/clear so in-flight work cannot undo privacy actions.
- Compute historical input/output totals from successful pairs only; failed
  files must not appear as bytes saved. Restoring settings is not restoring files.
- A bounded processing queue is not enough if import metadata still decodes all
  images in parallel. Bound both paths, page the rendered rows, and provide an
  explicit way to release retained results. A single shared Worker must not be
  reported as multiple workers. Pause/stop semantics must specify whether the
  current image finishes, and worker errors/timeouts must settle pending jobs.
- Every naming token exposed in the UI must be implemented in the pure filename
  helper. Unknown tokens should be removed safely instead of leaking braces or
  placeholder text into exported filenames.
- Folder-preserving ZIP export must sanitize every directory segment, discard
  traversal markers, and deduplicate filenames per directory rather than across
  the whole batch.
- Comparison previews must decode the final encoded blob, not reuse the
  pre-encode canvas. Generate bounded thumbnails in the worker and revoke UI
  object URLs when the dialog closes.

## Commit Checklist

Before pushing product or codec changes, run:

```powershell
npm run test
npm run typecheck
npm run build
npm run codec:check
npm run codec:test
npm run codec:build-wasm
```

Also check:

- No `node_modules`, `target`, or `apps/web/dist` files are staged.
- New docs and scripts are UTF-8 without BOM when relevant.
- Dependency direction still matches `docs/phase0-architecture.md`.
