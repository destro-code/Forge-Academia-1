import { describe, it, expect } from "vitest";
import rawManifest from "@/data/canonical/curriculum-manifest.json";
import { canonicalManifest } from "../manifest";
import {
  getAllV1Lessons,
  getPlannedLessonIds,
  getAuthoredLessonIds,
  getProductionLessons,
  loadV1Lesson,
  isV1LessonTarget,
} from "./loader";
import { checkBidirectionalManifestIntegrity } from "./curriculum-integrity";
import type { CanonicalLessonV1 } from "../types-v1";

describe("Authoritative Manifest Truthfulness & Bidirectional Integrity", () => {
  const manifestData = (rawManifest as any).default || rawManifest;
  const manifestLessons: any[] = manifestData.lessons || [];

  it("reports truthful counts for manifest, planned, authored, and production registry", () => {
    const plannedIds = getPlannedLessonIds();
    const authoredIds = getAuthoredLessonIds();
    const productionLessons = getProductionLessons();
    const allDiscoveredV1Lessons = getAllV1Lessons();

    // 1. Total manifest lesson records
    const totalManifestLessons = manifestLessons.length;
    // 2. Planned lesson count (authored: false)
    const plannedCount = plannedIds.length;
    // 3. Authored=true count
    const authoredCount = authoredIds.length;
    // 4. Discovered production registry count
    const productionRegistryCount = productionLessons.length;

    expect(totalManifestLessons).toBe(plannedCount + authoredCount);
    expect(authoredCount).toBe(productionRegistryCount);
    expect(allDiscoveredV1Lessons.length).toBe(productionRegistryCount);

    // Verify exactly which lessons are planned vs authored
    expect(plannedIds).toEqual(["lesson-0-1-1"]);
    expect(authoredIds).toEqual([
      "lesson-1-1-1",
      "lesson-1-1-2",
      "lesson-1-1-3",
      "lesson-1-1-4",
      "lesson-1-1-5",
      "lesson-1-1-6",
    ]);
  });

  it("strictly enforces bidirectional integrity between manifest and discovered JSON files", () => {
    const productionLessons = getAllV1Lessons();
    const discoveredEntries = productionLessons.map((l) => ({
      lessonId: l.id,
      filePath: `src/data/canonical/lessons-v1/${l.id}.json`,
      lesson: l,
      isValid: true,
      errors: [],
    }));

    const report = checkBidirectionalManifestIntegrity(manifestData, discoveredEntries);

    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.authoredMissingJson).toHaveLength(0);
    expect(report.jsonMissingFromManifest).toHaveLength(0);
    expect(report.jsonRejectedByGate).toHaveLength(0);
    expect(report.manifestFlagMismatches).toHaveLength(0);
  });

  it("verifies lesson-0-1-1 exists as planned (authored=false) with correct metadata and no unverified JSON registration", () => {
    const lesson0Ref = canonicalManifest.getLesson("lesson-0-1-1");
    expect(lesson0Ref).toBeDefined();
    expect(lesson0Ref?.topicId).toBe("a-website-is-a-conversation");
    expect(lesson0Ref?.moduleId).toBe("module-0-1");
    expect(lesson0Ref?.phaseId).toBe("phase-0");
    expect(lesson0Ref?.title).toBe("A Website Is a Conversation");
    expect(lesson0Ref?.authored).toBe(false);

    // Because it is planned, it is not in the production registry
    const loadResult = loadV1Lesson("lesson-0-1-1");
    expect(loadResult.ok).toBe(false);
  });

  it("ensures runnable lesson ordering, next/previous, and resume use authored production lessons only", () => {
    const authoredIds = canonicalManifest.getOrderedAuthoredLessonIds();
    expect(authoredIds).toEqual([
      "lesson-1-1-1",
      "lesson-1-1-2",
      "lesson-1-1-3",
      "lesson-1-1-4",
      "lesson-1-1-5",
      "lesson-1-1-6",
    ]);

    expect(canonicalManifest.getNextAuthoredLessonId("lesson-1-1-1")).toBe("lesson-1-1-2");
    expect(canonicalManifest.getPreviousAuthoredLessonId("lesson-1-1-1")).toBeUndefined();
    expect(canonicalManifest.getNextAuthoredLessonId("lesson-1-1-6")).toBeUndefined();
    expect(canonicalManifest.getPreviousAuthoredLessonId("lesson-1-1-6")).toBe("lesson-1-1-5");
  });
});
