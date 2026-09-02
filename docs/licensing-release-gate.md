# Imagequant Release License Gate

## Current Status

Release is intentionally blocked until the product owner selects one of the
two supported imagequant distribution paths. Development, tests, and private
evaluation may continue, but a public or commercial release must not bypass
this decision.

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
