# Responsive HTML / srcset export

After importing images with multiple output widths, open **Responsive HTML /
srcset** below the batch actions. Completed variants appear automatically; queued,
failed, and cancelled outputs are excluded. The panel updates as outputs finish,
so wait for the batch to finish when you need the complete set. Clearing completed
jobs also removes their snippets.

## Generated markup

- One `<img>` snippet per imported source and actual output MIME type. Separate
  formats produce separate snippets, not a `<picture>` fallback chain; choose the
  snippet appropriate to your website rather than displaying every format.
- Candidates use actual encoded widths, sorted ascending. When two width limits
  produce the same actual width, only the smaller file is referenced (first wins
  ties). Both files remain in the ZIP; HTML export does not modify artifacts.
- The largest candidate supplies `src`, `width`, and `height`. Requested width
  limits in filenames are not used as `w` descriptors.
- Paths match completed `archivePath` values, with each URL segment encoded and an
  explicit `./` prefix. This preserves nested ZIP folders and protects spaces,
  commas, percent signs, and other URL-significant filename characters.
- `sizes` defaults to `100vw`. Edit it to match your actual CSS layout, for example
  `(max-width: 600px) 100vw, 50vw`. The value applies to every generated snippet,
  is HTML-escaped, and is not a CSS validator or a persistent processing preset.
- `alt` is initially empty (decorative). Add meaningful alternative text for
  informative images before using the code. File names are not automatically
  treated as accessible descriptions.

## Copy and download

Copy HTML uses the browser clipboard. If permission is denied or the clipboard
API is unavailable, the code is focused and selected for manual copying; HTML
download remains available. Download saves an HTML fragment named
`littlepng-srcset.html`, independently of the image ZIP.

Place the HTML next to the extracted ZIP root to use the generated relative paths.
When integrating into another page or serving images from a CDN, adjust paths to
that page's URL/base path. Images and HTML are never uploaded by this feature.

This is a width-descriptor export for completed multi-size outputs, not automatic
art direction, multi-format `<picture>` generation, hosting, or deployment.

## Verification

Unit tests cover completion filtering, source/format grouping, actual dimensions,
duplicate widths, relative URL encoding, attribute escaping, and immutability.
Browser tests compare HTML descriptors with PNG dimensions inside the real ZIP,
verify downloaded HTML, exercise keyboard copying and permission-denied fallback,
and capture the panel at 320, 768, 1024, and 1440 pixels.
