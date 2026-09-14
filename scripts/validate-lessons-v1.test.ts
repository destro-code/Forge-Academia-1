import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const scriptPath = path.resolve(__dirname, "./validate-lessons-v1.mjs");

/**
 * Spawns the real CLI as a subprocess — this is the one part of this phase
 * that genuinely could not be verified any other way (see
 * FORGE_LESSON_PLAYER_V2_VALIDATION_HARDENING_REPORT.md §8: this sandbox
 * has no network access to install dependencies, so this test itself has
 * never been run either — written to the same standard as everything else,
 * but flagged as the least-verified file in this phase for exactly that
 * reason).
 */
describe("validate-lessons-v1.mjs CLI", () => {
  it("exits 0 and prints a pass for the golden lesson", () => {
    const output = execFileSync("node", [scriptPath, "--golden"], { encoding: "utf8", timeout: 30_000 });
    expect(output).toContain("lesson-0-1-1");
    expect(output).not.toContain("ERROR");
  });

  it("exits non-zero for a missing path", () => {
    expect(() => execFileSync("node", [scriptPath, "/tmp/definitely-does-not-exist.json"], { encoding: "utf8", timeout: 30_000 })).toThrow();
  });

  it("exits non-zero and reports a malformed-JSON error for a genuinely broken file", () => {
    const tmpFile = path.join(os.tmpdir(), `forge-invalid-lesson-${Date.now()}.json`);
    fs.writeFileSync(tmpFile, "{ this is not valid json");
    try {
      let threw = false;
      let output = "";
      try {
        output = execFileSync("node", [scriptPath, tmpFile], { encoding: "utf8", timeout: 30_000 });
      } catch (err) {
        threw = true;
        output = String((err as { stdout?: string }).stdout ?? "");
      }
      expect(threw).toBe(true);
      expect(output).toContain("MALFORMED_JSON");
    } finally {
      fs.unlinkSync(tmpFile);
    }
  });
});
