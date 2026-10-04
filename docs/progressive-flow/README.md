# Progressive image preparation flow

2026-10-02. Local redesign following feedback on the production visual refresh.

## Experience

- Empty state: brand, short introduction, original artwork and import controls. No batch metrics, compression settings, output table, empty result placeholder or disabled download toolbar. History remains a single collapsed entry.
- After import: compact upload strip, a three-step indicator and the compression panel. Only compression mode, output format, quality and optional byte target are visible. Naming and publishing/saved presets are available in a collapsed advanced section.
- Run a simple compression immediately. Results and ZIP/CSV actions appear only when usable. Resize/crop is a separate optional next step below the task area, after the compression action. Users can also configure this step before running a batch.
- Entering resize after completed processing prepares a new queue from the original File objects. A visible note says to download the current results first, since they are replaced by the next batch. Original pixels are used to avoid cumulative compression loss. Multi-size reconciliation preserves source identity and prevents duplicate variants.
- Returning to compression preserves settings. A dimension summary makes configured transformations visible even when their editor is not open. Applying a geometry preset reveals the resize editor; its original single-batch processing remains supported.
- Clearing the batch removes task panels again. Optional local history, filenames, presets, ZIP, srcset and preview comparison remain available. No compression algorithms or worker interfaces changed.

## Validation

`npm run validate` passed: 78 domain tests, 3 license-gate tests, TypeScript check, all 11 routes built, 2 Rust tests. Final `npm run test:e2e` passed all 22 tests. Existing tests now import images before configuring the batch, enter resize before editing dimensions and explicitly open advanced/history disclosures.

New progressive-flow integration test checks the empty state, import-triggered settings, hidden optional controls, completed PNG download, follow-up resizing from original inputs, actual 64 × 64 output and clearing back to the empty state. Existing tests still verify 125-file queues, pause/stop/retry, transparency, JPEG bytes, history privacy, presets, multi-size ZIP names/dimensions, srcset and SEO.

Visual checks at 320, 390, 768, 1024 and 1440 pixels across initial/compression/resize states had no horizontal overflow. All six locales checked at 320 pixels. No page errors. Stage heading focus moves with step changes; selected mode/crop buttons expose aria-pressed. Native details preserve keyboard operation.

Final screenshots: `initial-final-1440.png`, `initial-final-390.png`, `compression-final-1440.png`, `compression-final-390.png`, `resize-final-1440.png`, `resize-final-390.png`. Original generated artwork is reused from the first refresh without a new network asset or larger payload.

This version has not been deployed or pushed. Production remains the previously approved visual refresh.

## JPEG import / lossless-mode feedback fix

User screenshot exposed the default homepage mode rejecting a JPEG with `Lossless mode currently supports PNG inputs only.` Reproduced on the real browser path; mixed JPEG/PNG regression initially produced only one downloadable output instead of two.

Default presets now use lossy compression with original output format, so JPEG remains JPEG and PNG remains PNG. The explicit PNG-only lossless contract is unchanged. If a pending non-PNG task exists in lossless mode, a localized preflight message disables processing until the user chooses a compatible mode. Completed outputs do not block later PNG-only tasks. Failed statuses show a short localized label with the reason beneath it, rather than forcing an entire error into a pill. Kept-original outcomes explain that recompression did not save bytes.

The regression uses generated JPEG bytes plus a transparent PNG through the real worker, then checks explicit lossless preflight and recovery to lossy. User source photographs were not supplied, so validation uses fixtures rather than asserting a specific size reduction for those photographs.
