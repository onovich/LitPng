# LitPng

[简体中文](README.zh-CN.md)

A browser-local image workbench for batch compression, renaming, resizing,
cropping, and conversion.

![LitPng cover](docs/cover.png)

## What it includes

- Runs locally in the browser; processing does not require uploads.
- Batch image transformation, renaming, and export.
- Rust `imagequant` WASM for lossy indexed PNG with palette alpha.
- `@jsquash/png` for lossless PNG and MozJPEG from `@jsquash/jpeg` for JPEG.
- Minimum-quality, lossless-fallback, and keep-original safeguards.

## Getting started

Node.js 22.12+ and npm 9.6.5+ are required.

```bash
npm install
npm run dev
```

## Validation

```bash
npm run validate
npm run test:e2e
npm run audit:prod
npm run benchmark:codecs
```

An optional checksum-pinned real-image corpus can be fetched with
`npm run benchmark:fetch-corpus`. The benchmark records compression ratio,
browser processing time, encoder/fallback selection, and decoded PSNR. See
[`docs/codec-benchmark-baseline.md`](docs/codec-benchmark-baseline.md).

Rust and WASM codec commands:

```bash
npm run codec:check
npm run codec:test
npm run codec:build-wasm
```

## Repository map

- `apps/web/` — Astro and React frontend and browser workers.
- `packages/pngquant-wasm/` — Rust/WASM boundary for `imagequant`.
- `tests/` — Browser codec, SEO, and benchmark coverage.
- `research/` — Research notes and license-cleared corpus review.
- `docs/` — Product, architecture, codec, and workflow documentation.

## Documentation

- [`docs/commercial-roadmap.md`](docs/commercial-roadmap.md)
- [`docs/phase0-architecture.md`](docs/phase0-architecture.md)
- [`docs/pngquant-library-decision.md`](docs/pngquant-library-decision.md)
- [`docs/licensing-release-gate.md`](docs/licensing-release-gate.md)
- [`docs/project-lessons.md`](docs/project-lessons.md)

## License

No open-source license is currently included in this repository. The selected
`imagequant` dependency requires an explicit GPL-compatible or commercial
license strategy before release. Release automation must pass
`npm run release:license-check`.
