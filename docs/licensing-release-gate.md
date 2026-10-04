# Imagequant Release License Gate

## Current Status

The selected distribution path is GPL-3.0-or-later (2026-09-05), following the
owner's acceptance of the open-source direction. The repository LICENSE and
package metadata now record that choice. Public deployment remains pending the
release packaging checks below; the environment-variable check alone does not
verify source completeness or third-party attribution.

## Public Deployment Checklist

- [x] Add GPL-3.0 text and GPL-3.0-or-later package metadata.
- [x] Bundle runtime dependency licenses, including imagequant's complete
  COPYRIGHT (with historical notices) and jSquash's codec licenses.
- [ ] Identify the exact corresponding source and build instructions for the
  shipped jSquash JPEG/PNG WASM, including bundled upstream codec components.
  Progress: npm gitHead revisions and WASM Git blob hashes match upstream;
  JPEG's Makefile selects MozJPEG v3.3.1. Remaining: review notices/source
  coverage for all transitive components of jSquash's separate PNG Cargo.lock.
  The lockfile and source inventory now live in `third-party/jsquash-png`;
  the notice generator reads both Cargo workspaces and emits exact crate URLs.
- [ ] Publish the exact LittlePNG release source, lockfiles and build scripts,
  with corresponding dependency source access alongside the downloadable build.
- [x] Expose license, third-party notices, warranty disclaimer and source links
  from the application build (not yet deployed).
- [ ] Verify the final deployment artifact and its source links before upload.

## Option 1: GPL-Compatible Distribution

1. Confirm that the complete distributed work is compatible with
   GPL-3.0-or-later obligations.
2. Add the selected repository `LICENSE` file and required source/distribution
   notices.
3. Run the release gate with:

```sh
LITTLEPNG_IMAGEQUANT_LICENSE_MODE=gpl npm run release:license-check
```

The check fails when no repository license file is present.

## Option 2: Commercial Imagequant License

1. Obtain written commercial-license approval for the intended Web, desktop,
   store, and/or SaaS distribution scope.
2. Record the agreement or approval reference in the private release system.
3. Run the gate without committing the private agreement identifier:

```sh
LITTLEPNG_IMAGEQUANT_LICENSE_MODE=commercial \
LITTLEPNG_IMAGEQUANT_LICENSE_REFERENCE=<internal-reference> \
npm run release:license-check
```

The environment reference proves that the release workflow made an explicit
license decision; it is not a substitute for legal review or the agreement.

## Prohibited Shortcut

Do not label `packages/pngquant-wasm` as MIT, Apache-2.0, or another permissive
license merely because the wrapper code is small. The compiled WASM includes
the selected `imagequant` dependency, whose distribution terms control this
release decision.
