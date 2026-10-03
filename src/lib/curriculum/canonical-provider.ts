import academyDataRaw from "../../data/canonical/academy.json";
import curriculumManifestDataRaw from "../../data/canonical/curriculum-manifest.json";
import conceptsDataRaw from "../../data/canonical/concepts.json";
import skillsDataRaw from "../../data/canonical/skills.json";
import misconceptionsDataRaw from "../../data/canonical/misconceptions.json";
import { getV1LessonById } from "./v1/loader";
import { adaptLessonV1ToLayer1 } from "./v1/adapter";
import { CurriculumIdentityError, assertLessonCurriculumIdentity } from "./errors";

const unwrap = (data: any) => {
  let d = data;
  while (d && d.default && typeof d.default === "object" && !Array.isArray(d)) {
    d = d.default;
  }
  return d;
};

const academyData = unwrap(academyDataRaw);
const conceptsData = unwrap(conceptsDataRaw);
const skillsData = unwrap(skillsDataRaw);
const misconceptionsData = unwrap(misconceptionsDataRaw);

function getManifestData() {
  let m = curriculumManifestDataRaw as any;
  while (m && m.default && !m.topics) {
    m = m.default;
  }
  return m;
}

/**
 * Dynamic Vite discovery of Canonical Layer 1 lesson JSON files.
 * Automatically discovers any new lesson authored under src/data/canonical/lessons/*.json.
 */
const canonicalLessonModules = import.meta.glob<CanonicalLesson>(
  "/src/data/canonical/lessons/*.json",
  {
    eager: true,
    import: "default",
  },
);

/**
 * Archived canonical lessons preserved for reference and inspection.
 * Stored outside the active runtime discovery path.
 */
const archivedLessonModules = import.meta.glob<CanonicalLesson>(
  "/src/data/canonical/archive/lessons/*.json",
  {
    eager: true,
    import: "default",
  },
);

import legacyLessonsData from "../../data/lessons.json";
import legacyModulesData from "../../data/modules.json";

import type {
  Academy,
  CanonicalLevel,
  CanonicalModule,
  CanonicalTopic,
  Concept,
  Skill,
  Misconception,
  CanonicalLesson,
  ContentProvider,
  EntityReference,
} from "./types";
import {
  validateAcademy,
  validateLevel,
  validateConcept,
  validateSkill,
  validateMisconception,
  validateTopic,
  validateLesson,
  validateCurriculumIntegrity,
  type CurriculumIntegrityReport,
} from "./schema";
import { adaptLegacyLessonToCanonical } from "./legacy-adapter";
import type { Lesson as LegacyLesson } from "../types";

export class ContentValidationError extends Error {
  constructor(
    message: string,
    public errors?: any,
  ) {
    super(message);
    this.name = "ContentValidationError";
  }
}

export class ContentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentNotFoundError";
  }
}

export class ContentIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentIntegrityError";
  }
}

export class CanonicalProvider implements ContentProvider {
  private academy!: Academy;
  private levels: CanonicalLevel[] = [];
  private modules: CanonicalModule[] = [];
  private topics: CanonicalTopic[] = [];
  private concepts: Concept[] = [];
  private skills: Skill[] = [];
  private misconceptions: Misconception[] = [];

  // Strictly separated canonical and legacy lesson stores
  private canonicalLessons: CanonicalLesson[] = [];
  private canonicalLessonsById = new Map<string, CanonicalLesson>();
  private canonicalLessonIds = new Set<string>();

  private legacyLessons: CanonicalLesson[] = [];
  private legacyLessonsById = new Map<string, CanonicalLesson>();

  // Preserved archived canonical lesson store (reference only)
  private archivedLessons: CanonicalLesson[] = [];
  private archivedLessonsById = new Map<string, CanonicalLesson>();

  // Index maps by ID
  private levelsById = new Map<string, CanonicalLevel>();
  private modulesById = new Map<string, CanonicalModule>();
  private topicsById = new Map<string, CanonicalTopic>();
  private conceptsById = new Map<string, Concept>();
  private skillsById = new Map<string, Skill>();
  private misconceptionsById = new Map<string, Misconception>();

  // Relationship indexes for canonical curriculum
  private modulesByLevel = new Map<string, CanonicalModule[]>();
  private topicsByModule = new Map<string, CanonicalTopic[]>();
  private lessonsByTopic = new Map<string, CanonicalLesson[]>();
  private conceptsByTopic = new Map<string, Concept[]>();
  private skillsByTopic = new Map<string, Skill[]>();
  private lessonsByPrerequisite = new Map<string, CanonicalLesson[]>();

  // Globally sorted flat array of canonical lessons (curriculum order)
  private orderedLessons: CanonicalLesson[] = [];

  constructor() {
    this.initializeAndValidate();
  }

  private initializeAndValidate() {
    try {
      const curriculumManifestData = getManifestData();
      const idSet = new Set<string>();

      const checkAndRegisterId = (id: string, type: string) => {
        if (idSet.has(id)) {
          throw new ContentIntegrityError(`Duplicate ID detected: "${id}" in ${type}`);
        }
        idSet.add(id);
      };

      // 1. Validate & Load Academy
      try {
        this.academy = validateAcademy(academyData as unknown);
      } catch (err: any) {
        throw new ContentValidationError("Academy validation failed", err);
      }

      // 2. Validate & Load Levels from curriculumManifestData
      try {
        this.levels = curriculumManifestData.levels.map((lvl) => {
          const canonicalLvl: CanonicalLevel = {
            id: lvl.levelId,
            title: lvl.title,
            description: lvl.title,
            order: lvl.position,
            moduleIds: lvl.moduleIds,
          };
          checkAndRegisterId(canonicalLvl.id, "CanonicalLevel");
          this.levelsById.set(canonicalLvl.id, canonicalLvl);
          return canonicalLvl;
        });
        this.levels.sort((a, b) => a.order - b.order);
      } catch (err: any) {
        if (err instanceof ContentIntegrityError) throw err;
        throw new ContentValidationError("Levels validation failed", err);
      }

      // 3. Load Modules from curriculumManifestData
      try {
        this.modules = curriculumManifestData.modules.map((mod) => {
          const canonicalMod: CanonicalModule = {
            id: mod.moduleId,
            levelId: mod.levelId,
            title: mod.title,
            description: mod.title,
            order: mod.position,
            topicIds: [...mod.topicIds],
            lessonIds: [...mod.lessonIds],
          };
          checkAndRegisterId(canonicalMod.id, "CanonicalModule");
          this.modulesById.set(canonicalMod.id, canonicalMod);
          return canonicalMod;
        });
        this.modules.sort((a, b) => a.order - b.order);
      } catch (err: any) {
        if (err instanceof ContentIntegrityError) throw err;
        throw new ContentValidationError("Modules validation failed", err);
      }

      // 4. Load Topics from curriculumManifestData
      try {
        this.topics = curriculumManifestData.topics.map((top) => {
          const canonicalTopic: CanonicalTopic = {
            id: top.topicId,
            moduleId: top.moduleId,
            title: top.title,
            description: top.title,
            order: top.position,
            lessonIds: [...top.lessonIds],
            conceptIds: [],
            skillIds: [],
          };
          checkAndRegisterId(canonicalTopic.id, "CanonicalTopic");
          this.topicsById.set(canonicalTopic.id, canonicalTopic);
          return canonicalTopic;
        });
        this.topics.sort((a, b) => a.order - b.order);
      } catch (err: any) {
        if (err instanceof ContentIntegrityError) throw err;
        throw new ContentValidationError("Topics validation failed", err);
      }

      // Link topic IDs back to modules
      this.topics.forEach((top) => {
        const parentMod = this.modulesById.get(top.moduleId);
        if (parentMod && !parentMod.topicIds.includes(top.id)) {
          parentMod.topicIds.push(top.id);
        }
      });

      // 5. Validate & Load Concepts, Skills, Misconceptions
      try {
        this.concepts = (conceptsData as unknown[]).map((c) => {
          const validated = validateConcept(c);
          checkAndRegisterId(validated.id, "Concept");
          this.conceptsById.set(validated.id, validated);
          return validated;
        });
      } catch (err: any) {
        if (err instanceof ContentIntegrityError) throw err;
        throw new ContentValidationError("Concepts validation failed", err);
      }

      try {
        this.skills = (skillsData as unknown[]).map((s) => {
          const validated = validateSkill(s);
          checkAndRegisterId(validated.id, "Skill");
          this.skillsById.set(validated.id, validated);
          return validated;
        });
      } catch (err: any) {
        if (err instanceof ContentIntegrityError) throw err;
        throw new ContentValidationError("Skills validation failed", err);
      }

      try {
        this.misconceptions = (misconceptionsData as unknown[]).map((m) => {
          const validated = validateMisconception(m);
          checkAndRegisterId(validated.id, "Misconception");
          this.misconceptionsById.set(validated.id, validated);
          return validated;
        });
      } catch (err: any) {
        if (err instanceof ContentIntegrityError) throw err;
        throw new ContentValidationError("Misconceptions validation failed", err);
      }

      // 6. Validate & Load Canonical Lessons from curriculumManifestData & Vite glob discovery
      curriculumManifestData.lessons.forEach((manifestLesson) => {
        const v1Lesson = getV1LessonById(manifestLesson.lessonId);
        if (v1Lesson) {
          const adapted = adaptLessonV1ToLayer1(v1Lesson).lesson;
          checkAndRegisterId(adapted.id, `CanonicalLesson (${manifestLesson.canonicalFilename})`);
          this.canonicalLessonsById.set(adapted.id, adapted);
          this.canonicalLessons.push(adapted);
          this.canonicalLessonIds.add(adapted.id);
        }
      });

      Object.entries(canonicalLessonModules).forEach(([filePath, raw]) => {
        try {
          const validated = validateLesson(raw as unknown);
          if (!this.canonicalLessonsById.has(validated.id)) {
            checkAndRegisterId(validated.id, `CanonicalLesson (${filePath})`);
            this.canonicalLessonsById.set(validated.id, validated);
            this.canonicalLessons.push(validated);
            this.canonicalLessonIds.add(validated.id);
          }
        } catch (err: any) {
          if (err instanceof ContentIntegrityError) throw err;
          const details = err?.errors ? JSON.stringify(err.errors) : err?.message || String(err);
          throw new ContentValidationError(
            `Canonical lesson validation failed for file '${filePath}' (ID: ${(raw as any)?.id || "unknown"}): ${details}`,
            err,
          );
        }
      });

      // Load Archived Canonical Lessons (Preserved for reference, isolated from active curriculum)
      Object.entries(archivedLessonModules).forEach(([filePath, raw]) => {
        try {
          const validated = validateLesson(raw as unknown);
          this.archivedLessonsById.set(validated.id, validated);
          this.archivedLessons.push(validated);
        } catch {
          // Archived content is preserved for historical reference
        }
      });

      // Load Legacy Lessons strictly into legacyLessonsById (isolated from canonical storage)
      (legacyLessonsData as unknown as LegacyLesson[]).forEach((legacy) => {
        try {
          const canonical = adaptLegacyLessonToCanonical(legacy);
          const validated = validateLesson(canonical);
          this.legacyLessonsById.set(validated.id, validated);
          this.legacyLessons.push(validated);
        } catch (err: any) {
          // Legacy validation issues remain isolated to the legacy store
        }
      });

      // Strictly enforce V1 Curriculum Identity: Reject missing topics/modules/phases
      // No silent fabrication, guessing, or module-0-1 fallback attachment
      this.canonicalLessons.forEach((les) => {
        const modId = (les as any).moduleId || les.curriculum?.moduleId;
        if (!this.topicsById.has(les.topicId)) {
          throw new CurriculumIdentityError({
            lessonId: les.id,
            topicId: les.topicId,
            moduleId: modId,
            manifestFile: "curriculum-manifest.json",
            entityType: "topic",
          });
        }
        if (modId && !this.modulesById.has(modId)) {
          throw new CurriculumIdentityError({
            lessonId: les.id,
            moduleId: modId,
            topicId: les.topicId,
            manifestFile: "curriculum-manifest.json",
            entityType: "module",
          });
        }
      });

      // 7. Enforce Referential Integrity on Canonical Curriculum
      const integrityReport = validateCurriculumIntegrity({
        academy: this.academy,
        levels: this.levels,
        modules: this.modules,
        topics: this.topics,
        concepts: this.concepts,
        skills: this.skills,
        misconceptions: this.misconceptions,
        lessons: this.canonicalLessons,
      });

      if (!integrityReport.valid) {
        throw new ContentIntegrityError(
          `Curriculum relational integrity validation failed:\n` +
            integrityReport.errors.join("\n"),
        );
      }

      // 8. Build Maps and Secondary/Relationship Indexes for Canonical Content
      // modulesByLevel
      this.modules.forEach((mod) => {
        const list = this.modulesByLevel.get(mod.levelId) || [];
        list.push(mod);
        this.modulesByLevel.set(mod.levelId, list);
      });
      // Sort each level's modules by order
      this.modulesByLevel.forEach((list) => list.sort((a, b) => a.order - b.order));

      // topicsByModule
      this.topics.forEach((top) => {
        const list = this.topicsByModule.get(top.moduleId) || [];
        list.push(top);
        this.topicsByModule.set(top.moduleId, list);
      });
      // Sort each module's topics by order
      this.topicsByModule.forEach((list) => list.sort((a, b) => a.order - b.order));

      // lessonsByTopic & lessonsByPrerequisite
      this.canonicalLessons.forEach((les) => {
        const list = this.lessonsByTopic.get(les.topicId) || [];
        list.push(les);
        this.lessonsByTopic.set(les.topicId, list);

        if (les.prerequisites.lessonIds) {
          les.prerequisites.lessonIds.forEach((prereqId) => {
            const prereqList = this.lessonsByPrerequisite.get(prereqId) || [];
            prereqList.push(les);
            this.lessonsByPrerequisite.set(prereqId, prereqList);
          });
        }
      });

      // Sort lessons inside each topic based on the topic's lessonIds sequence
      this.lessonsByTopic.forEach((list, topicId) => {
        const topic = this.topicsById.get(topicId);
        if (topic) {
          list.sort((a, b) => {
            const indexA = topic.lessonIds.indexOf(a.id);
            const indexB = topic.lessonIds.indexOf(b.id);
            if (indexA === -1 && indexB === -1) {
              const orderA = (a.metadata?.order as number) || 0;
              const orderB = (b.metadata?.order as number) || 0;
              return orderA - orderB;
            }
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
        }
      });

      // conceptsByTopic & skillsByTopic
      this.concepts.forEach((con) => {
        const list = this.conceptsByTopic.get(con.topicId) || [];
        list.push(con);
        this.conceptsByTopic.set(con.topicId, list);
      });

      this.skills.forEach((sk) => {
        const list = this.skillsByTopic.get(sk.topicId) || [];
        list.push(sk);
        this.skillsByTopic.set(sk.topicId, list);
      });

      // 9. Build global sequential order for canonical lessons according to manifest
      const manifestOrder = new Map(
        curriculumManifestData.lessons.map((l) => [l.lessonId, l.position]),
      );
      this.orderedLessons = [...this.canonicalLessons].sort((a, b) => {
        const orderA = manifestOrder.get(a.id) ?? (a.metadata?.order as number) ?? 999;
        const orderB = manifestOrder.get(b.id) ?? (b.metadata?.order as number) ?? 999;
        return orderA - orderB;
      });
    } catch (err: any) {
      if (err instanceof ContentValidationError || err instanceof ContentIntegrityError) {
        throw err;
      }
      throw new ContentIntegrityError(
        `Unexpected error during curriculum provider initialization: ${err.message}`,
      );
    }
  }

  // ContentProvider API implementation

  public getAcademy(): Academy {
    return this.academy;
  }

  public getLevels(): CanonicalLevel[] {
    return this.levels;
  }

  public getLevel(id: string): CanonicalLevel | undefined {
    return this.levelsById.get(id);
  }

  public getModules(): CanonicalModule[] {
    return this.modules;
  }

  public getModule(id: string): CanonicalModule | undefined {
    return this.modulesById.get(id);
  }

  public getTopics(): CanonicalTopic[] {
    return this.topics;
  }

  public getTopic(id: string): CanonicalTopic | undefined {
    return this.topicsById.get(id);
  }

  public getConcepts(): Concept[] {
    return this.concepts;
  }

  public getConcept(id: string): Concept | undefined {
    return this.conceptsById.get(id);
  }

  public getSkills(): Skill[] {
    return this.skills;
  }

  public getSkill(id: string): Skill | undefined {
    return this.skillsById.get(id);
  }

  public getMisconceptions(): Misconception[] {
    return this.misconceptions;
  }

  public getMisconception(id: string): Misconception | undefined {
    return this.misconceptionsById.get(id);
  }

  public getLessons(): CanonicalLesson[] {
    return this.orderedLessons;
  }

  public getLesson(id: string): CanonicalLesson | undefined {
    return this.canonicalLessonsById.get(id);
  }

  public getLessonsForTopic(topicId: string): CanonicalLesson[] {
    return this.lessonsByTopic.get(topicId) || [];
  }

  public getLessonsForModule(moduleId: string): CanonicalLesson[] {
    const topics = this.topicsByModule.get(moduleId) || [];
    const list: CanonicalLesson[] = [];
    topics.forEach((top) => {
      list.push(...this.getLessonsForTopic(top.id));
    });
    return list;
  }

  public getConceptsForTopic(topicId: string): Concept[] {
    return this.conceptsByTopic.get(topicId) || [];
  }

  public getSkillsForTopic(topicId: string): Skill[] {
    return this.skillsByTopic.get(topicId) || [];
  }

  public getPrerequisites(id: string): EntityReference[] {
    const refs: EntityReference[] = [];

    // Check if it's a lesson
    const lesson = this.canonicalLessonsById.get(id);
    if (lesson) {
      if (lesson.prerequisites.lessonIds) {
        lesson.prerequisites.lessonIds.forEach((pid) => refs.push({ type: "lesson", id: pid }));
      }
      if (lesson.prerequisites.conceptIds) {
        lesson.prerequisites.conceptIds.forEach((pid) => refs.push({ type: "concept", id: pid }));
      }
      if (lesson.prerequisites.skillIds) {
        lesson.prerequisites.skillIds.forEach((pid) => refs.push({ type: "skill", id: pid }));
      }
      return refs;
    }

    // Check if it's a concept
    const concept = this.conceptsById.get(id);
    if (concept) {
      if (concept.prerequisiteConceptIds) {
        concept.prerequisiteConceptIds.forEach((pid) => refs.push({ type: "concept", id: pid }));
      }
      return refs;
    }

    // Check if it's a skill
    const skill = this.skillsById.get(id);
    if (skill) {
      if (skill.prerequisiteSkillIds) {
        skill.prerequisiteSkillIds.forEach((pid) => refs.push({ type: "skill", id: pid }));
      }
      return refs;
    }

    return refs;
  }

  public getNextLesson(id: string): CanonicalLesson | undefined {
    const index = this.orderedLessons.findIndex((l) => l.id === id);
    if (index !== -1 && index < this.orderedLessons.length - 1) {
      return this.orderedLessons[index + 1];
    }
    return undefined;
  }

  public getPreviousLesson(id: string): CanonicalLesson | undefined {
    const index = this.orderedLessons.findIndex((l) => l.id === id);
    if (index > 0) {
      return this.orderedLessons[index - 1];
    }
    return undefined;
  }

  // Canonical query methods
  public isCanonicalLesson(id: string): boolean {
    return this.canonicalLessonIds.has(id);
  }

  public getAllCanonicalLessons(): CanonicalLesson[] {
    return [...this.canonicalLessons];
  }

  public getCanonicalLesson(id: string): CanonicalLesson | undefined {
    return this.canonicalLessonsById.get(id);
  }

  public getGoldenLessons(): CanonicalLesson[] {
    return [...this.canonicalLessons];
  }

  // Legacy-specific isolated query methods
  public getLegacyLesson(id: string): CanonicalLesson | undefined {
    return this.legacyLessonsById.get(id);
  }

  public getAllLegacyLessons(): CanonicalLesson[] {
    return [...this.legacyLessons];
  }

  // Archived canonical lessons accessors (Preservation & Reference Only)
  public getArchivedLesson(id: string): CanonicalLesson | undefined {
    return this.archivedLessonsById.get(id);
  }

  public getAllArchivedLessons(): CanonicalLesson[] {
    return [...this.archivedLessons];
  }

  public isArchivedLesson(id: string): boolean {
    return this.archivedLessonsById.has(id);
  }

  public validateAllContent(): CurriculumIntegrityReport {
    return validateCurriculumIntegrity({
      academy: this.academy,
      levels: this.levels,
      modules: this.modules,
      topics: this.topics,
      concepts: this.concepts,
      skills: this.skills,
      misconceptions: this.misconceptions,
      lessons: this.canonicalLessons,
    });
  }
}

export const canonicalProvider = new CanonicalProvider();
