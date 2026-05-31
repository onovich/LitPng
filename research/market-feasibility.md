# LittlePNG Market And Feasibility Notes

Date: 2026-05-31

## Short Verdict

LittlePNG is feasible as a browser-first WebAssembly app, but it should not be positioned as a generic "PNG compressor" only. The market has real search demand and commercial signal, while the first page is already crowded. The best wedge is:

- Batch PNG/JPG compression in-browser, no upload.
- A clean, fast workflow for many files, folders, ZIP export, and before/after audit.
- SEO pages around high-volume head terms plus long-tail workflow pages.

## Data Access

Best official source: Google Ads API KeywordPlanIdeaService. It can generate keyword ideas from keywords or URLs and returns historical metrics such as average monthly searches and competition. It requires Google Ads credentials: developer token, OAuth access, customer id, and optional manager customer id.

Sources:

- Google Ads API keyword ideas: https://developers.google.com/google-ads/api/docs/keyword-planning/generate-keyword-ideas
- Google Ads API keyword planning overview: https://developers.google.com/google-ads/api/docs/keyword-planning/overview

I added a lightweight public-data fetcher at `research/keyword-research.ps1`. It currently uses `app.seodata.dev/v1/keyword` for early screening, with rate limiting and no-BOM JSON output. This is useful for fast directional checks, but Google Ads API should be the source of truth once credentials are available.

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\research\keyword-research.ps1
```

## US Keyword Sample

Source: public keyword endpoint sampled on 2026-05-31, stored in `research/keyword-results.us.sample.json`.

| Keyword | US monthly volume | CPC | Ads competition | Volume * competition | Commercial value |
| --- | ---: | ---: | ---: | ---: | ---: |
| image compressor | 60,500 | 1.84 | 0.05 | 3,025 | 116,886 |
| image compression | 60,500 | 1.62 | 0.06 | 3,630 | 103,890.6 |
| tinypng | 22,200 | 3.33 | 0.04 | 888 | 76,883.04 |
| compress jpg | 18,100 | 3.56 | 0.01 | 181 | 65,080.36 |
| compress png | 22,200 | 2.73 | 0.02 | 444 | 61,818.12 |
| png compressor | 22,200 | 0.88 | 0 | 0 | 19,536 |
| jpeg compressor | 6,600 | 2.99 | 0.01 | 66 | 19,931.34 |
| compress images online | 3,600 | 1.71 | 0.03 | 108 | 6,340.68 |
| online image compressor | 2,400 | 1.97 | 0.01 | 24 | 4,775.28 |
| bulk image compressor | 480 | 4.28 | 0.04 | 19.2 | 2,136.58 |
| batch image compressor | 70 | 0 | 0.03 | 2.1 | 7.21 |

Interpretation:

- Head-term demand is strong: "image compressor", "image compression", "compress png", and "compress jpg" are worth targeting.
- Explicit "batch/bulk" volume is much smaller, but CPC can be high; use it as product differentiation, not the only SEO entry point.
- "tinypng" brand search volume is large, which confirms category awareness but also shows that one incumbent has strong mindshare.
- Ads competition from this source is not organic SEO difficulty. Organic SERP saturation should be measured separately with top-10 domain classification, backlink/domain authority data, and feature snippets/PAA count.

## Competitive Read

Crowded incumbents:

- TinyPNG / TinyJPG: strong brand and simple UX.
- Squoosh: browser-side local compression, open source, trusted by developers.
- Compressor.io, iLoveIMG, Img2Go, FreeConvert, ShortPixel, Kraken, ImageOptim-like tools.

Squoosh is especially relevant because it already proves browser-local compression as a user expectation. Its README says images are processed locally, and its codecs folder includes separate encoder/decoder subprojects that build to `.js` and `.wasm`.

Sources:

- Squoosh repo: https://github.com/GoogleChromeLabs/squoosh
- Squoosh codecs: https://github.com/GoogleChromeLabs/squoosh/tree/dev/codecs

Market conclusion: positive demand, high saturation. A new site can work if it ships a visibly better batch workflow and compounds SEO with useful pages, benchmarks, and comparison pages. A plain clone will be hard to rank.

## Technical Feasibility

PNG path:

- `libimagequant` is the lower-level library behind pngquant-style palette quantization. It converts RGBA input into 8-bit indexed images with alpha, but it does not decode or encode PNG files itself.
- Therefore a browser app needs: decode PNG to RGBA, run quantization, encode indexed PNG, optionally run lossless optimization.
- License matters: libimagequant is GPLv3-or-later for open source use, with a commercial license required for closed-source/non-GPL uses.

Sources:

- libimagequant docs: https://pngquant.org/lib/

JPG path:

- Use MozJPEG WASM for JPEG recompression. Squoosh already ships/uses a MozJPEG codec path, so this is proven territory.
- JPEG compression is lossy and generally simpler from a UI perspective: quality slider, chroma subsampling, progressive toggle, metadata stripping.

Recommended codec stack:

- PNG lossy: libimagequant/imagequant WASM.
- PNG lossless: oxipng WASM after quantization, or standalone for non-lossy mode.
- JPG: MozJPEG WASM.
- Optional later: WebP/AVIF as exports, not required for v1.

Performance notes:

- WASM is suitable for this workload, but image processing is CPU and memory heavy.
- Decode RGBA memory is about `width * height * 4`; a 4000x3000 image is about 48 MB before encoder work buffers.
- Batch mode must use Web Workers, a queue, concurrency limits, progress/cancel, and object URL cleanup. Default concurrency should probably be 1-2 on mobile and 2-4 on desktop.
- Very large batches may hit browser memory pressure. The UX should stream work item by item and avoid holding all decoded pixels in memory.
- WASM download size is acceptable for a tool site, but codecs should be lazy-loaded by format.

Risk level:

- Core compression: medium difficulty, because codecs exist.
- Production-grade batch UX: medium-high difficulty.
- SEO acquisition: high difficulty because the market is saturated.
- Licensing: medium risk if using libimagequant in a closed-source/commercial app without a commercial license.

## Suggested MVP

1. Browser-only batch compressor for PNG/JPG.
2. Drag files/folders, show before/after size, savings, estimated quality, and per-file status.
3. Export individual files or ZIP.
4. No upload by default; make privacy the product promise.
5. SEO pages: `/png-compressor`, `/jpg-compressor`, `/image-compressor`, `/compress-png`, `/compress-jpg`, plus comparison/benchmark pages.
6. Measurement: collect anonymous aggregate metrics only after explicit privacy review.

Go/no-go:

- Build MVP if the goal is a lean SEO/product experiment.
- Do not spend heavily on paid acquisition at first.
- Before monetization, confirm libimagequant licensing and run real Google Ads API keyword extraction.
