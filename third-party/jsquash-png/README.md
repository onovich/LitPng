# jSquash PNG dependency inventory

Cargo.lock and src/lib.rs are copied unchanged from jSquash revision
`b7fa9ac9ec02f224847ad23d19d115f9e296a368`, directory `packages/png/codec`:

https://github.com/jamsinclair/jSquash/tree/b7fa9ac9ec02f224847ad23d19d115f9e296a368/packages/png/codec

Cargo.toml has only an empty `[workspace]` appended to isolate dependency
resolution from LittlePNG's workspace. This copy inventories exact transitive
crate versions for license notices; it does not replace the shipped encoder.
The original codec's BSD-3-Clause notice is distributed in
`apps/web/public/legal/third-party-notices.txt`.

Run `npm run release:prepare-notices` from the repository root with Cargo
installed. Cargo verifies registry checksums against the preserved lockfile.
The generator includes build-time dependencies as well as runtime dependencies
and emits exact crate archive URLs in `public/legal/rust-sources.txt`.
Complete upstream build tooling is available at the pinned repository revision.
