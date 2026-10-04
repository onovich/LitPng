import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

// Run at repository root after npm ci and cargo fetch. Generated notices are
// committed so the static hosting build does not need the Rust toolchain.
const require = createRequire(new URL("../apps/web/package.json", import.meta.url));
const sections = ["LittlePNG third-party notices\n\nThis software is based in part on the work of the Independent JPEG Group."];
const packages = ["react", "react-dom", "scheduler", "fflate", "lucide-react", "@astrojs/react", "astro", "@jsquash/jpeg", "@jsquash/png"];

async function addNotices(directory, label) {
  const files = (await readdir(directory)).filter(name => /^(license|copying|copyright|notice)([.-]|$)/i.test(name)).sort();
  if (!files.length) throw new Error(`Missing license text for ${label}`);
  for (const file of files) {
    sections.push(`${label} — ${file}\n\n${await readFile(join(directory, file), "utf8")}`);
  }
}

for (const name of packages) {
  let directory = dirname(require.resolve(name));
  // Package exports sometimes hide package.json; walk from its public entry.
  while (true) {
    try {
      const metadata = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
      if (metadata.name === name) {
        await addNotices(directory, `${name}@${metadata.version}`);
        if (name.startsWith("@jsquash/")) {
          await addNotices(join(directory, "codec"), `${name}@${metadata.version} bundled codec`);
        }
        break;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const parent = dirname(directory);
    if (parent === directory) throw new Error(`Cannot find package root for ${name}`);
    directory = parent;
  }
}

const crates = new Map();
for (const manifest of ["packages/pngquant-wasm/Cargo.toml", "third-party/jsquash-png/Cargo.toml"]) {
  const metadata = JSON.parse(execFileSync("cargo", ["metadata", "--locked", "--format-version", "1", "--manifest-path", manifest], { encoding: "utf8" }));
  for (const pkg of metadata.packages.filter(pkg => pkg.source)) crates.set(`${pkg.name}@${pkg.version}`, pkg);
}
const sortedCrates = [...crates.values()].sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`));
for (const pkg of sortedCrates) {
  await addNotices(dirname(pkg.manifest_path), `${pkg.name}@${pkg.version} (${pkg.license})`);
}
const output = new URL("../apps/web/public/legal/", import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL("third-party-notices.txt", output), sections.join("\n\n----------------------------------------\n\n").replace(/\r\n/g, "\n").split("\n").map(line => line.trimEnd()).join("\n").trimEnd() + "\n");
await writeFile(new URL("gpl-3.0.txt", output), await readFile(new URL("../LICENSE", import.meta.url)));
await writeFile(new URL("rust-sources.txt", output), "Exact Rust crate source archives (versions/checksums pinned by the two Cargo.lock files)\n\n" + sortedCrates.map(pkg => `${pkg.name}@${pkg.version}\nhttps://static.crates.io/crates/${pkg.name}/${pkg.name}-${pkg.version}.crate`).join("\n\n") + "\n");
console.log("Prepared GPL text and dependency notices in apps/web/public/legal/.");
