# Cloudflare deployment preparation

## Domain

The owner confirmed Cloudflare activation for `littlepng.com` on 2026-09-05.
Registrar and renewal remain at GoDaddy. Assigned nameservers:

- `mary.ns.cloudflare.com`
- `quincy.ns.cloudflare.com`

The previous GoDaddy WebsiteBuilder landing page is intentionally disposable.
Domain activation does not establish a LittlePNG deployment.

## Static Pages deployment

The existing Astro application emits static HTML, JS, worker modules and WASM.
It does not require an SSR adapter or server-side image processing.

Use these settings when creating a Cloudflare Pages project:

| Setting | Value |
| --- | --- |
| Repository | `onovich/LitPng` |
| Production branch | `main` |
| Root directory | repository root (leave blank) |
| Build command | `npm run release:build` |
| Output directory | `apps/web/dist` |
| Node version | `22` (at least 22.12.0) |

Do not connect automatic public deployment until the checklist in
`licensing-release-gate.md` is complete and the intended source has been pushed.
Local uncommitted changes are not included by a Git-connected build.

Before release, run the configured checks:

```sh
npm ci
npm run validate
npm run test:e2e
npm run audit:prod
LITTLEPNG_IMAGEQUANT_LICENSE_MODE=gpl npm run release:license-check
npm run release:build
```

The committed WASM supports static builds without Rust on the hosting service.
For source rebuilds use the Rust/wasm-pack versions in `.github/workflows/validate.yml`
and `npm run codec:build-wasm`; publish their source and notices with the release.

Validate the temporary Pages URL first: PNG and JPEG compression, downloaded
file decoding, transparent PNG, batch ZIP, multi-size outputs, srcset export,
direct navigation to tool pages, and successful worker/WASM requests.

Then add `littlepng.com` through the Pages project's Custom domains screen.
Configure `www.littlepng.com` with an HTTPS redirect to the apex, preserving path
and query. Verify both HTTPS hosts, canonical links, sitemap, robots.txt and
source/license links. Review Cloudflare-managed robots.txt settings so they do
not unexpectedly replace the application's published policy.

After activation, enable DNSSEC in Cloudflare and register its exact DS values
at GoDaddy; verify DS/DNSKEY agreement before considering DNSSEC complete.

## References

- https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- https://developers.cloudflare.com/pages/configuration/build-configuration/

## Current handoff

Domain: activated according to the owner's screenshot.
Application: locally buildable; not yet deployed or connected to the domain.
Release: GPL choice recorded; dependency source/notice packaging remains open.

The release build generates a source snapshot and SHA-256 checksum before
building the site. Deploy `apps/web/dist`, including its `legal` directory;
an ordinary `npm run build` alone does not regenerate the source snapshot.
