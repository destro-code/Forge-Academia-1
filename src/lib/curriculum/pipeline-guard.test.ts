import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CanonicalProvider } from "./canonical-provider";

const READONLY_LESSONS_SHA256 = "5edde0b667d2574f355d4edcb5ed531a6b47590c6f63ce9c9e830732cf577523";

describe("Curriculum Production Pipeline Guardrails", () => {
  it("verifies that legacy lessons.json remains untouched (READ-ONLY source)", () => {
    const legacyPath = path.resolve(__dirname, "../../data/lessons.json");
    expect(fs.existsSync(legacyPath)).toBe(true);

    const rawContent = fs.readFileSync(legacyPath, "utf8");
    const currentHash = crypto.createHash("sha256").update(rawContent).digest("hex");

    expect(currentHash).toBe(READONLY_LESSONS_SHA256);
  });

  it("enforces canonical output directory isolation", () => {
    const canonicalDir = path.resolve(__dirname, "../../data/canonical/lessons");
    expect(fs.existsSync(canonicalDir)).toBe(true);

    const canonicalFiles = fs.readdirSync(canonicalDir).filter((f) => f.endsWith(".json"));
    expect(canonicalFiles.length).toBeGreaterThan(0);

    // Canonical files must not target lessons.json
    canonicalFiles.forEach((file) => {
      expect(file).not.toBe("lessons.json");
      expect(file).not.toBe("modules.json");
      expect(file).not.toBe("topics.json");
      expect(file).toMatch(/^lesson-.*\.json$/);
    });
  });

  it("verifies authoritative curriculum inventory integrity", () => {
    const inventoryPath = path.resolve(
      __dirname,
      "../../../docs/curriculum/inventory/curriculum-inventory.json",
    );
    expect(fs.existsSync(inventoryPath)).toBe(true);

    const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
    const { metadata, lessons } = inventoryData;

    expect(metadata.totalDiscovered).toBe(96);
    expect(metadata.totalInventoried).toBe(96);
    expect(metadata.missingCount).toBe(0);
    expect(metadata.duplicateIdCount).toBe(0);
    expect(metadata.unresolvedReferencesCount).toBe(0);
    expect(lessons.length).toBe(96);

    // Ensure no duplicate IDs exist in inventory
    const ids = lessons.map((l: any) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("verifies bounded source packages exist for all modules", () => {
    const sourcePackagesDir = path.resolve(__dirname, "../../../docs/curriculum/source-packages");
    expect(fs.existsSync(sourcePackagesDir)).toBe(true);

    const packageFiles = fs
      .readdirSync(sourcePackagesDir)
      .filter((f) => f.endsWith("-package.json"));
    expect(packageFiles.length).toBeGreaterThanOrEqual(12); // At least 12 modules represented

    packageFiles.forEach((file) => {
      const pkg = JSON.parse(fs.readFileSync(path.join(sourcePackagesDir, file), "utf8"));
      expect(pkg.moduleId).toBeDefined();
      expect(pkg.moduleTitle).toBeDefined();
      expect(pkg.lessons).toBeDefined();
      expect(pkg.lessons.length).toBeGreaterThan(0);
    });
  });

  it("confirms CanonicalProvider precedence (canonical over legacy)", () => {
    const provider = new CanonicalProvider();

    // Check a transformed lesson, e.g. lesson-1-2-1
    const lesson = provider.getLesson("lesson-1-2-1");
    expect(lesson).toBeDefined();
    expect(lesson?.title).toBe("What Is CSS?");
    // Canonical lessons have objectives and structured steps
    expect(lesson?.objectives).toBeDefined();
    expect(lesson?.objectives.length).toBeGreaterThan(0);
  });
});
