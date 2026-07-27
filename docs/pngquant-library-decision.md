# PNGQuant Library Decision

Date: 2026-05-31

## Decision

LittlePNG should use the `libimagequant` library line, not the `pngquant` command-line executable.

For the browser/WASM roadmap, the selected dependency is:

```toml
imagequant = { version = "4.0", default-features = false }
```

This is implemented in the placeholder Rust package at:

```text
packages/pngquant-wasm
```

The package exists to lock and download the official quantization dependency before the full PNG encoder pipeline is built.

## Why This Library

The official pngquant site separates the CLI from the underlying library:

- `pngquant` is a command-line utility and library for lossy PNG compression.
- `libimagequant` is the lower-level image quantization library.
- `libimagequant` converts RGBA pixels into palette-based 8-bit indexed images with alpha.
- It does not decode or encode PNG files. LittlePNG must provide PNG decoding and encoding separately.
- The latest stable `libimagequant` line is 4.x, and the Rust library is released through crates.io.
- When compiling for WASM, the official documentation says to disable default features because the default library uses internal threading.

This matches LittlePNG's architecture:

```text
PNG file -> decode to RGBA -> imagequant palette quantization -> encode indexed PNG -> optional lossless optimize
```

## Why Not Download pngquant CLI

The CLI is useful for shell scripts and server-side processing, but it is the wrong unit for a browser-first product:

- It includes command-line concerns LittlePNG does not need.
- It still does not map cleanly to the browser task queue and preview workflow.
- WebAssembly integration is cleaner through the Rust library boundary.
- LittlePNG needs control over progress, cancellation, queueing, presets, and memory release.

## Licensing Note

`libimagequant` is dual-licensed:

- GPL v3 or later for Free/Libre Open Source Software.
- Commercial license for closed-source, App Store, and other non-GPL use.

Before shipping a closed-source commercial version, LittlePNG must either:

- buy/confirm a commercial license, or
- keep the relevant code path open-source and GPL-compatible, or
- replace the quantization dependency with a compatible alternative.

## Phase 1-2 Implementation Plan

Phase 1:

- Lock and fetch `imagequant = "4.0"` in `packages/pngquant-wasm`.
- Build a browser worker pipeline using Canvas/OffscreenCanvas for decode, resize/crop, and initial encode.
- Keep the PNG quantization adapter behind a codec boundary.

Phase 2:

- Replace the temporary PNG encode path with:
  - RGBA decode.
  - `imagequant` WASM quantization.
  - indexed PNG encode.
  - optional lossless pass.
- Add transparent PNG fixtures and visual checks.

Current implementation status:

- `packages/pngquant-wasm` exposes a narrow `quantize_rgba` adapter around `imagequant`.
- The adapter accepts RGBA pixels and emits a complete indexed PNG, including palette alpha.
- Lossy PNG jobs run `imagequant` in the image worker with a minimum-quality floor, adaptive dithering, and a browser-balanced speed setting.
- If the minimum quality cannot be met, the worker falls back to the lossless `@jsquash/png` encoder; same-format no-op jobs still keep the original when the result is not smaller.
- Lossless PNG jobs never call `imagequant`.
- `npm run codec:build-wasm` regenerates the committed browser package with `wasm-pack`.
- Native `cargo test`, frontend tests, TypeScript checks, and the static Vite build validate the boundary.

This implementation does not remove the licensing gate above. Shipping the
imagequant WASM in a closed-source commercial product requires a commercial
license or a GPL-compatible distribution decision.

## Sources

- pngquant homepage: https://pngquant.org/
- libimagequant docs: https://pngquant.org/lib/
- pngquant install notes: https://pngquant.org/install.html
- pngquant Rust portability note: https://pngquant.org/rust.html
- pngquant licensing: https://pngquant.org/licensing.html
