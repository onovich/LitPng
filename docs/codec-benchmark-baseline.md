# Codec Benchmark Baseline

Date: 2026-09-03

This baseline exercises the production UI, worker, generated WASM, and download
path in Chromium. Run it with:

```sh
npm run benchmark:codecs
```

The command writes machine-readable and Markdown reports to
`.tmp-benchmarks/`. Fixtures are generated deterministically and are not copied
from third-party image collections.

An optional real-image tier is defined in `benchmarks/corpus.json`. Fetch and
verify it before running the benchmark:

```sh
npm run benchmark:fetch-corpus
npm run benchmark:codecs
```

The source files stay in the ignored `.tmp-benchmark-corpus/` directory. The
fetcher rejects a changed upstream revision unless its SHA-1 or SHA-256 is
deliberately reviewed and updated. Source, license, attribution, and caveats
are recorded in `research/benchmark-corpus-sources.md`.

## Baseline Results

Fixture size: 512×512 pixels.

| Fixture | Quality | Encoder | Input bytes | Output bytes | Saved | Duration ms | PSNR dB |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| transparent UI | 65 | imagequant indexed | 5,889 | 1,469 | 75.06% | 125 | lossless |
| transparent UI | 82 | imagequant indexed | 5,889 | 1,469 | 75.06% | 122 | lossless |
| transparent UI | 90 | imagequant indexed | 5,889 | 1,469 | 75.06% | 119 | lossless |
| gradient | 65 | imagequant indexed | 266,697 | 71,982 | 73.01% | 330 | 32.99 |
| gradient | 82 | imagequant indexed | 266,697 | 75,105 | 71.84% | 329 | 33.67 |
| gradient | 90 | kept original | 266,697 | 266,697 | 0% | 223 | lossless |
| photo-like JPEG | 65 | MozJPEG | 165,537 | 34,682 | 79.05% | 217 | 27.46 |
| photo-like JPEG | 78 | MozJPEG | 165,537 | 53,644 | 67.59% | 222 | 28.98 |
| photo-like JPEG | 85 | MozJPEG | 165,537 | 74,529 | 54.98% | 234 | 30.58 |

Duration includes the UI-to-worker round trip until the download becomes
available. PSNR compares decoded output against decoded input, using
premultiplied RGB and alpha.

## Conclusions

- The PNG default quality of 82 is a reasonable starting point. On the gradient
  fixture it improves PSNR over 65 while retaining more than 70% size savings.
- At PNG quality 90, imagequant cannot satisfy the requested quality floor for
  the gradient. The lossless fallback is larger than the source, so the
  keep-original policy correctly prevents a larger or lower-quality download.
- Flat transparent UI artwork is represented exactly by the palette at all
  tested qualities and is reduced by about 75%.
- MozJPEG quality 78 remains the balanced default for the synthetic photo. A
  move to 85 gains about 1.6 dB PSNR but gives up roughly 12.6 percentage points
  of size savings.

## Real-corpus Status

The checked manifest currently covers a 46-megapixel photographic JPEG and a
1,920×1,080 UI screenshot PNG. The reviewed transparent RGBA candidate remains
outside the executable manifest until its current bytes can be downloaded and
pinned with a checksum. The deterministic transparent fixture continues to
cover alpha correctness in every normal benchmark run.

This environment could not establish TLS connections to Wikimedia's download
host on 2026-09-03, so the real tier was not included in the numeric table
above. That is an external corpus-fetch limitation, not a codec test failure.

## Remaining Validation Gap

This is a deterministic regression baseline, not a claim about real-world
average savings. Before public quality claims or commercial launch, expand the
license-cleared corpus to icons, product images, portraits, EXIF images, and
previously compressed files. Measure multiple browsers and mobile memory in
addition to PSNR and size.
