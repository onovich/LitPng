import { readFile, readdir, writeFile, lstat } from "node:fs/promises";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { join } from "node:path";

const require = createRequire(new URL("../apps/web/package.json", import.meta.url));
const { zipSync } = require("fflate");
const root = new URL("../", import.meta.url);
const files = {};
// Explicit build-source allowlist: never archive local credentials, caches,
// research, agent settings, git metadata, or a previous source archive.
const entries = ["LICENSE", "README.md", "README.zh-CN.md", "package.json", "package-lock.json", "Cargo.toml", "Cargo.lock", "apps/web/src", "apps/web/public", "apps/web/package.json", "apps/web/astro.config.mjs", "apps/web/tsconfig.json", "packages", "third-party", "scripts", "tests", "benchmarks", "playwright.config.ts", "playwright.benchmark.config.ts", ".github/workflows"];
async function add(path) {
  if (path === "apps/web/public/legal/littlepng-source.zip" || path === "apps/web/public/legal/source-sha256.txt") return;
  const name = path.split("/").at(-1);
  if (["node_modules", "target", "dist", ".git"].includes(name) || name.startsWith(".env")) return;
  const stat = await lstat(new URL(path, root));
  if (stat.isSymbolicLink()) throw new Error(`Source archive refuses symlink: ${path}`);
  if (stat.isDirectory()) {
    for (const child of (await readdir(new URL(path + "/", root))).sort()) await add(join(path, child));
  } else {
    files[`littlepng/${path}`] = [await readFile(new URL(path, root)), { mtime: new Date("2026-01-01T00:00:00Z") }];
  }
}
for (const entry of [...entries, "docs/cloudflare-deployment.md", "docs/licensing-release-gate.md"]) await add(entry);
const zip = zipSync(files, { level: 9 });
await writeFile(new URL("apps/web/public/legal/littlepng-source.zip", root), zip);
await writeFile(new URL("apps/web/public/legal/source-sha256.txt", root), createHash("sha256").update(zip).digest("hex") + "  littlepng-source.zip\n");
console.log(`Prepared source snapshot: ${Object.keys(files).length} files, ${zip.length} bytes.`);
