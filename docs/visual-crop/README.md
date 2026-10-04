# Visual batch cropping

The resize step opens an interactive crop frame over the first queued source image. Drag the frame to move, drag its eight handles to resize, or use arrow keys (Shift = 10 pixels). Nine anchors align the frame with the matching source corner, edge midpoint, or center. Selecting an anchor resets offsets. A slider adjusts the frame size; exact dimensions and pixel offsets live in a collapsed precision section.

Every image uses the same native pixel crop dimensions and offsets relative to its own anchor. Frames clamp to each source boundary. Sources smaller than the frame retain native pixels and receive transparent padding for PNG/WebP, or the selected JPEG background. The output dimensions stay identical across the batch. This explicit frame mode is separate from proportional fit and existing publishing presets. Crop settings persist with saved presets and batch history; old presets remain compatible.

Validation: geometry tests cover all anchors, offsets across varying dimensions, boundary clamping, and small-source padding. Browser coverage checks frame dragging, keyboard resizing, anchors, uniform downloaded dimensions, real cropped pixels, and transparency. Desktop and mobile captures are included; widths 320/390/768/1024/1440 show no page overflow. Changes are local; no production deployment was performed for this revision.

Completion behavior: a fully successful resize/crop batch closes the editor and restores the full upload area, keeping exported results available. Failures and interrupted batches retain the editor for retries. Adding images after completion restores route defaults so the next batch does not inherit the previous crop frame. Browser coverage also verifies that a subsequent 200×160 image exports at its original size.
