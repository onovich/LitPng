import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const checker = new URL("./check-release-license.mjs", import.meta.url);

function run(environment = {}, cwd = process.cwd()) {
  return spawnSync(process.execPath, [checker.pathname], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...environment }
  });
}

test("release is blocked without an explicit imagequant license mode", () => {
  const result = run({
    LITTLEPNG_IMAGEQUANT_LICENSE_MODE: "",
    LITTLEPNG_IMAGEQUANT_LICENSE_REFERENCE: ""
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /set LITTLEPNG_IMAGEQUANT_LICENSE_MODE/);
});

test("commercial mode requires a private approval reference", () => {
  const blocked = run({
    LITTLEPNG_IMAGEQUANT_LICENSE_MODE: "commercial",
    LITTLEPNG_IMAGEQUANT_LICENSE_REFERENCE: ""
  });
  assert.equal(blocked.status, 1);

  const allowed = run({
    LITTLEPNG_IMAGEQUANT_LICENSE_MODE: "commercial",
    LITTLEPNG_IMAGEQUANT_LICENSE_REFERENCE: "contract-record-verified"
  });
  assert.equal(allowed.status, 0);
});

test("GPL mode requires a repository license file", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "littlepng-license-check-"));
  try {
    const blocked = run({ LITTLEPNG_IMAGEQUANT_LICENSE_MODE: "gpl" }, directory);
    assert.equal(blocked.status, 1);

    writeFileSync(path.join(directory, "LICENSE"), "GPL-compatible release license placeholder for test only.\n");
    const allowed = run({ LITTLEPNG_IMAGEQUANT_LICENSE_MODE: "gpl" }, directory);
    assert.equal(allowed.status, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
