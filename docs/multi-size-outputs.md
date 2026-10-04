# Multi-size outputs

In lossy mode, **Multiple sizes** accepts up to six unique integer width limits
from 1 to 8192 pixels. Use Add width (or Enter) to apply a value, and remove its
width chip to undo it. An empty width list uses the existing single-output mode.
Lossless mode clears/disables the width list because resizing changes pixels.

## Geometry and naming

Each selected width creates an independent queue output. Multi-size mode uses
aspect-preserving fit with no upscaling. The ordinary maximum width/height and
crop controls are ignored and disabled while width variants are selected; their
values are available again when the list is cleared. Format, quality, target-size
search, naming templates, and folder-preserving ZIP exports still apply.

Names append `-max{width}w` before the extension. This denotes the requested limit,
not a promise about actual encoded dimensions. For example, a 512×256 source at
limits 128, 256, and 1024 produces 128×64, 256×128, and 512×256 outputs. Different
limits can produce identical dimensions for small originals; they are retained
as separate requested outputs. Source-based `{index}` is shared by all variants
of the same imported image. Collisions are resolved within the appropriate ZIP
directory, including collisions with already-completed artifacts.

## Queue lifecycle

The queue expands before processing, so its count/progress represents outputs.
Variants share the original File reference and dimension metadata; each encode
still decodes the source in the single Worker. Pause, graceful stop, and retry
operate on individual outputs. Retrying cancelled/failed variants never expands
them again.

Editing settings rebuilds only unfinished outputs. Completed outputs retain
their settings, names, and ZIP paths, even if a selected width is removed. If
every output for a source is finished, adding another width does not silently
process that source again: re-import the original to generate a new set. A
stopped, partially completed set can be reconfigured before retrying.

## Reports, persistence, and limits

- Individual download/preview and ZIP include every completed output.
- CSV appends `requested_max_width`, `output_width`, and `output_height` columns.
  A single-output job leaves the requested-width column blank.
- Aggregate source bytes count each original once; output bytes include every
  variant. Generating more sizes can increase total storage rather than save it.
- Custom presets and history snapshot/copy the width list. Legacy saved settings
  with no width list remain valid and load in single-output mode.
- Completed variants support [responsive HTML / srcset export](srcset-export.md).
- This does not provide disk streaming or unlimited memory.
  More variants retain more output blobs; download and remove completed results
  between large batches.

## Verification

Unit tests cover validation, stable identities/indexes, reconciliation, collision
handling, no-upscale geometry, aggregate byte accounting, and old-preset loading.
Browser tests inspect PNG dimensions inside a real ZIP, CSV dimensions, saved
presets/history, stop/retry behavior, invalid inputs, and four viewport widths.
