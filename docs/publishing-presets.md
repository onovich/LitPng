# Publishing presets

Verified on 2026-09-03. Presets are practical starting points, not immutable platform requirements. Editing any processing control switches the UI back to **Custom**.

## Shopify product

- Keeps the source format, uses quality `82`, preserves aspect ratio, and caps width and height at `2048 px`.
- Adds the `-shopify` filename suffix.
- Shopify accepts product media up to `5000 × 5000 px`, 25 megapixels, and 20 MB, while its theme guidance says square `2048 × 2048 px` product images usually display best. LitPng deliberately does not crop every product image to square because that could remove product content.

Sources: [Shopify product media requirements](https://help.shopify.com/en/manual/products/product-media/product-media-types) and [Shopify theme image guidance](https://help.shopify.com/en/manual/online-store/images/theme-images).

## WordPress media

- Converts to WebP at quality `82`, preserves aspect ratio, and caps width and height at `2560 px`.
- Adds the `-wordpress` filename suffix.
- `2560 px` matches WordPress core's default `big_image_size_threshold`. WebP has been supported by WordPress core since version 5.8, but the hosting server still needs WebP support.

Sources: [WordPress `big_image_size_threshold`](https://developer.wordpress.org/reference/hooks/big_image_size_threshold/) and [WordPress 5.8 WebP support](https://make.wordpress.org/core/2021/06/07/wordpress-5-8-adds-webp-support/).

## Open Graph card

- Converts to JPEG at quality `85` and center-crops to `1200 × 630 px` (about `1.91:1`) when the source is large enough.
- Smaller sources keep that aspect ratio without upscaling.
- Adds the `-og` filename suffix.
- The Open Graph protocol defines image URL, type, width, height, and alt metadata, but it does not mandate `1200 × 630 px`. This preset uses the widely compatible social-sharing-card convention and labels it accordingly.

Source: [The Open Graph protocol](https://ogp.me/).
