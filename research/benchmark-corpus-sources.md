# Benchmark corpus source and license review

Reviewed: 2026-09-03

This note selects four real images for LittlePNG codec benchmarking. Every
candidate has a first-party Wikimedia Commons file page that records the
original file, authorship, dimensions, media type, and reuse terms. The first
three are the recommended minimum corpus; the fourth is an optional extreme
pixel-count case.

## Recommended minimum corpus

### 1. `Fronalpstock_big.jpg` — high-detail photographic JPEG

- **Direct original:**
  <https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg>
- **Source and metadata:**
  [Wikimedia Commons file page](https://commons.wikimedia.org/wiki/File:Fronalpstock_big.jpg)
- **Recorded file:** JPEG, 10,109 × 4,542, 14,679,474 bytes; Commons SHA-1
  `61ff2c892bfb5e9e093ad5d119d9466604a88b6a`.
- **Author:** Hannes Röst.
- **Exact license selected for this corpus:**
  [Creative Commons Attribution-ShareAlike 3.0 Unported](https://creativecommons.org/licenses/by-sa/3.0/).
  The file is dual-licensed with GFDL 1.2-or-later, but using the CC license
  keeps the corpus rules simpler.
- **Attribution requirement:** credit the author, link the license, indicate
  changes, and do not imply endorsement. Suggested credit:
  `Fronalpstock big — Hannes Röst, CC BY-SA 3.0, via Wikimedia Commons`.
  Publicly distributed compressed or otherwise transformed versions should be
  made available under the same or a compatible license.
- **Benchmark role:** large natural photograph with fine foliage, water,
  mountains, haze, and broad tonal variation; useful for MozJPEG quality,
  resizing, runtime, and peak-memory measurements.
- **Caveat:** Commons identifies it as a panorama stitched from 12 frames and
  notes that blending, perspective, color, or other digital adjustments may be
  present. It is not a camera-original single exposure. At roughly 46 million
  pixels it should be classified as a stress case, not a routine mobile case.

The Commons page directly supports the dimensions, byte count, MIME type,
author, stitched-panorama status, SHA-1, and both offered licenses.

### 2. `PNG_transparency_demonstration_1.png` — semi-transparent RGBA PNG

- **Direct original:**
  <https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png>
- **Source and metadata:**
  [Wikimedia Commons file page](https://commons.wikimedia.org/wiki/File:PNG_transparency_demonstration_1.png)
- **Recorded file:** PNG, 800 × 600, approximately 219 KB. The page explicitly
  identifies it as 32-bit-per-pixel RGBA and describes four translucent dice.
- **Authors recorded by Commons:** Daniel G. (2005 version), Ed g2s (2009
  version), and CyberShadow (2019 version/source lineage).
- **Exact license selected for this corpus:**
  [Creative Commons Attribution-ShareAlike 3.0 Unported](https://creativecommons.org/licenses/by-sa/3.0/).
  The page also offers GFDL 1.2-or-later.
- **Attribution requirement:** credit the recorded authors, link the license,
  indicate changes, and retain ShareAlike for a publicly distributed
  derivative. Suggested credit:
  `PNG transparency demonstration — Daniel G., Ed g2s and CyberShadow, CC BY-SA 3.0, via Wikimedia Commons`.
- **Benchmark role:** alpha gradients, translucent colored surfaces, soft
  edges, and background-dependent compositing. Validate output on both black
  and white backgrounds, not only against a checkerboard.
- **Caveat:** the current Commons version was already run through OxiPNG and
  ZopfliPNG. It is therefore an intentionally difficult size-reduction case,
  not a representative unoptimized PNG. Its file history also records an older
  optimization that damaged alpha, making alpha preservation a required
  correctness assertion.

The Commons page directly supports the RGBA format, rendering/source history,
authors, selected license, current lossless optimization, and the historical
alpha-damage warning.

### 3. `Free_software_screenshot.png` — screenshot and UI-graphics PNG

- **Direct original:**
  <https://upload.wikimedia.org/wikipedia/commons/8/87/Free_software_screenshot.png>
- **Source and metadata:**
  [Wikimedia Commons file page](https://commons.wikimedia.org/wiki/File:Free_software_screenshot.png)
- **Recorded file:** PNG, 1,920 × 1,080, 713,986 bytes; Commons SHA-1
  `9bc6d1b05588fccca9ba3e8a11cc98ca5c2c78a7`.
- **Author:** George Balatsos.
- **Exact license:**
  [CC0 1.0 Universal Public Domain Dedication](https://creativecommons.org/publicdomain/zero/1.0/).
- **Attribution requirement:** CC0 imposes no copyright attribution
  requirement. For auditability, retain a voluntary source note such as
  `George Balatsos, CC0 1.0, via Wikimedia Commons`.
- **Benchmark role:** fine UI text, icons, flat colors, window borders, and
  mixed application content; useful for assessing whether imagequant palette
  reduction introduces text fringing or banding.
- **Caveat:** the screenshot contains Ubuntu/GNOME, Firefox, LibreOffice, and
  Wikipedia interfaces, text, and identifiers. The uploader's CC0 dedication
  does not extinguish third-party trademark or other independent rights. This
  is suitable for internal codec testing, but should not be reused as LittlePNG
  marketing artwork or presented as an endorsement by the named projects.

The Commons page directly supports the dimensions, byte count, MIME type,
author, CC0 dedication, SHA-1, and applications shown. The official CC0 deed
also notes that patents, trademarks, privacy/publicity rights, and endorsement
rules are not affected by CC0.

## Optional stress image

### 4. `The_Blue_Marble,_AS17-148-22727.jpg` — square high-resolution JPEG

- **Direct original:**
  <https://upload.wikimedia.org/wikipedia/commons/7/70/The_Blue_Marble%2C_AS17-148-22727.jpg>
- **Source and metadata:**
  [Wikimedia Commons file page](https://commons.wikimedia.org/wiki/File:The_Blue_Marble,_AS17-148-22727.jpg),
  which links the NASA catalog ID `AS17-148-22727`; also see NASA's
  [Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).
- **Recorded file:** JPEG, 6,750 × 6,750, 19,767,034 bytes; Commons SHA-1
  `5216333386c75de432aa84bd835643d93bd2d70f`.
- **Creator/source:** Harrison Schmitt / Apollo 17 / NASA; the current Commons
  version was retouched by Yann to remove defects and reduce noise.
- **Exact rights status:** `PD-USGov-NASA` — public domain in the United States
  because the underlying photograph was solely created by NASA. This is a
  public-domain status assertion, not a Creative Commons license.
- **Attribution requirement:** copyright attribution is not required for a US
  public-domain work, but NASA's usage guidelines ask that NASA be acknowledged
  as the source. Suggested audit credit:
  `NASA / Harrison Schmitt / Apollo 17; retouched Commons version by Yann`.
- **Benchmark role:** approximately 45.6 million pixels, near-black space,
  curved high-contrast edges, subtle cloud detail, and smooth oceans; useful
  for memory ceilings, dark-region artifacts, and large-square resize paths.
- **Caveat:** this particular file is a retouched derivative rather than the
  original scan. NASA logos and identifiers are separately regulated, NASA
  material must not be used to imply endorsement, and NASA-hosted third-party
  material is not automatically public domain. This candidate is acceptable
  because the Commons page specifically identifies this photograph as solely
  NASA-created and public domain; do not generalize that conclusion to other
  NASA-hosted files.

## Corpus handling recommendation

1. Start automated quality benchmarks with candidates 1–3; run candidate 4 in
   a separately labelled stress tier so it does not distort normal latency.
2. Record the downloaded file's SHA-1 in the corpus manifest and fail setup on
   a mismatch. Commons file-name URLs may continue to resolve after a new file
   revision, so a URL alone is not a reproducibility pin.
3. Keep source files outside the normal application bundle. If redistributing
   candidates 1 or 2, include their CC BY-SA attribution and license notice;
   apply the same/compatible license to published transformed image outputs.
4. Report benchmark numbers and code under the project's chosen license, but
   avoid publishing the licensed image derivatives unless the accompanying
   attribution and ShareAlike obligations are intentionally satisfied.
5. Treat these findings as source due diligence, not legal advice. Recheck the
   live file page before adding a new revision to a release artifact.

## Primary references

- [Fronalpstock file metadata and license](https://commons.wikimedia.org/wiki/File:Fronalpstock_big.jpg)
- [PNG transparency demonstration metadata and license](https://commons.wikimedia.org/wiki/File:PNG_transparency_demonstration_1.png)
- [Free software screenshot metadata and CC0 dedication](https://commons.wikimedia.org/wiki/File:Free_software_screenshot.png)
- [Blue Marble metadata and public-domain notice](https://commons.wikimedia.org/wiki/File:The_Blue_Marble,_AS17-148-22727.jpg)
- [CC0 1.0 official deed](https://creativecommons.org/publicdomain/zero/1.0/)
- [CC BY-SA 3.0 official deed](https://creativecommons.org/licenses/by-sa/3.0/)
- [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
