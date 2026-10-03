/**
 * Canonical Lesson Schema V1 — Hard Contract Consistency Test
 *
 * Enforces authoritative consistency across the V1 curriculum system:
 * 1. Every discovered V1 JSON in src/data/canonical/lessons-v1/*.json is strictly valid against canonicalLessonV1Schema.
 * 2. Every golden fixture in GOLDEN_LESSONS_V1 is strictly valid against safeValidateLessonV1.
 * 3. Every supported activity in V1_SUPPORTED_ACTIVITY_TYPES has a registered content schema.
 * 4. Every schema activity in activityTypeV1Schema has a runtime adapter.
 * 5. No duplicate lesson IDs exist across JSON lessons and golden fixtures.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { canonicalLessonV1Schema, safeValidateLessonV1, activityTypeV1Schema } from "../schema-v1";
import { GOLDEN_LESSONS_V1 } from "../golden-lesson-v1";
import { V1_SUPPORTED_ACTIVITY_TYPES } from "./adapter";
import { V1_CONTENT_SCHEMAS } from "./content-schemas";
import { listV1LessonIds } from "./loader";

describe("V1 Lesson Contract Hard Consistency", () => {
  const lessonsV1Dir = path.resolve(process.cwd(), "src/data/canonical/lessons-v1");
  const jsonFiles = fs.existsSync(lessonsV1Dir)
    ? fs.readdirSync(lessonsV1Dir).filter((file) => file.endsWith(".json"))
    : [];

  it("1. Every discovered V1 JSON lesson strictly passes canonicalLessonV1Schema", () => {
    expect(jsonFiles.length).toBeGreaterThan(0);

    const invalidLessons: Array<{
      file: string;
      lessonId: string;
      errors: string[];
    }> = [];

    for (const file of jsonFiles) {
      const fullPath = path.join(lessonsV1Dir, file);
      const rawContent = fs.readFileSync(fullPath, "utf-8");
      const parsed = JSON.parse(rawContent);

      const result = safeValidateLessonV1(parsed);
      if (!result.success) {
        invalidLessons.push({
          file,
          lessonId: parsed.id ?? "unknown",
          errors: result.error.issues.map(
            (issue) => `${issue.path.join(".") || "$"}: ${issue.message}`,
          ),
        });
      }
    }

    if (invalidLessons.length > 0) {
      const failureReport = invalidLessons
        .map(
          (inv) => `Lesson "${inv.lessonId}" in ${inv.file} failed:\n  ${inv.errors.join("\n  ")}`,
        )
        .join("\n\n");
      expect.fail(`Found ${invalidLessons.length} invalid V1 JSON lesson(s):\n${failureReport}`);
    }

    expect(invalidLessons).toHaveLength(0);
  });

  it("2. Every golden fixture strictly passes safeValidateLessonV1 using identical validator", () => {
    expect(GOLDEN_LESSONS_V1.length).toBeGreaterThan(0);

    for (const golden of GOLDEN_LESSONS_V1) {
      const result = safeValidateLessonV1(golden);
      expect(
        result.success,
        `Golden lesson "${golden.id}" (${golden.identity.title}) failed validation: ${
          !result.success ? JSON.stringify(result.error.issues) : ""
        }`,
      ).toBe(true);
    }
  });

  it("3. Every supported activity type has a registered content schema", () => {
    const missingSchemas: string[] = [];

    for (const supportedType of V1_SUPPORTED_ACTIVITY_TYPES) {
      if (!V1_CONTENT_SCHEMAS[supportedType as keyof typeof V1_CONTENT_SCHEMAS]) {
        missingSchemas.push(supportedType);
      }
    }

    expect(
      missingSchemas,
      `Supported activity types without a content schema: ${missingSchemas.join(", ")}`,
    ).toHaveLength(0);
  });

  it("4. Every schema activity type has a registered runtime adapter", () => {
    const schemaActivityTypes = activityTypeV1Schema.options;
    const missingAdapters: string[] = [];

    for (const schemaType of schemaActivityTypes) {
      if (!V1_SUPPORTED_ACTIVITY_TYPES.has(schemaType)) {
        missingAdapters.push(schemaType);
      }
    }

    expect(
      missingAdapters,
      `Schema activity types without a runtime adapter: ${missingAdapters.join(", ")}`,
    ).toHaveLength(0);
  });

  it("5. No duplicate lesson IDs exist across discovered JSON lessons and golden fixtures", () => {
    const seenIds = new Map<string, string>(); // lessonId -> source
    const duplicates: Array<{ lessonId: string; sourceA: string; sourceB: string }> = [];

    // Register golden fixtures
    for (const golden of GOLDEN_LESSONS_V1) {
      const source = `golden-lesson-v1.ts (${golden.identity.title})`;
      if (seenIds.has(golden.id)) {
        duplicates.push({
          lessonId: golden.id,
          sourceA: seenIds.get(golden.id)!,
          sourceB: source,
        });
      } else {
        seenIds.set(golden.id, source);
      }
    }

    // Register discovered JSON files
    for (const file of jsonFiles) {
      const fullPath = path.join(lessonsV1Dir, file);
      const rawContent = fs.readFileSync(fullPath, "utf-8");
      const parsed = JSON.parse(rawContent);
      const lessonId = parsed.id;
      const source = `src/data/canonical/lessons-v1/${file}`;

      if (seenIds.has(lessonId)) {
        duplicates.push({
          lessonId,
          sourceA: seenIds.get(lessonId)!,
          sourceB: source,
        });
      } else {
        seenIds.set(lessonId, source);
      }
    }

    expect(
      duplicates,
      `Found duplicate lesson IDs: ${duplicates.map((d) => `"${d.lessonId}" in both ${d.sourceA} and ${d.sourceB}`).join("; ")}`,
    ).toHaveLength(0);
  });

  it("6. Loader runtime returns all valid lessons without duplicate IDs, excluding test fixtures", () => {
    const loaderIds = listV1LessonIds();
    const uniqueIds = new Set(loaderIds);
    expect(loaderIds.length).toBe(uniqueIds.size);
    expect(loaderIds).toContain("lesson-1-1-1");
    // Golden fixture goldenLesson0CanonicalV1 is test-only and must not enter production registry
    expect(loaderIds).not.toContain("lesson-0-1-1");
  });
});
