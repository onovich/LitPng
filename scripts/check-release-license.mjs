import { existsSync } from "node:fs";

const mode = process.env.LITTLEPNG_IMAGEQUANT_LICENSE_MODE;
const acceptedModes = new Set(["gpl", "commercial"]);

function fail(message) {
  console.error(`Imagequant release license check failed: ${message}`);
  process.exit(1);
}

if (!acceptedModes.has(mode)) {
  fail(
    "set LITTLEPNG_IMAGEQUANT_LICENSE_MODE to 'gpl' or 'commercial'. " +
    "See docs/licensing-release-gate.md."
  );
}

if (mode === "gpl" && !existsSync("LICENSE")) {
  fail("GPL mode requires a repository LICENSE file compatible with GPL-3.0-or-later.");
}

if (mode === "commercial" && !process.env.LITTLEPNG_IMAGEQUANT_LICENSE_REFERENCE) {
  fail(
    "commercial mode requires LITTLEPNG_IMAGEQUANT_LICENSE_REFERENCE to identify " +
    "the recorded commercial license approval."
  );
}

console.log(`Imagequant release license mode verified: ${mode}.`);
