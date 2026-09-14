#!/usr/bin/env node
/**
 * Forge V1 Lesson Validation CLI
 *
 * Usage:
 *   node scripts/validate-lessons-v1.mjs <lesson.json>
 *   node scripts/validate-lessons-v1.mjs <directory-of-lesson-json-files>
 *   node scripts/validate-lessons-v1.mjs --golden        (validates the golden lesson fixture)
 *
 * Runs every authored lesson through the full pipeline (schema validation →
 * structural lint → pedagogical/evidence validation → activity
 * compatibility → curriculum integrity) and prints blocking errors,
 * warnings, and info separately. Exits non-zero if any lesson has a
 * blocking error — safe to wire into CI.
 *
 * Implementation note: this project has no `tsx`/`ts-node` installed and
 * this sandbox has no network access to add one. Rather than guess that
 * adding a new devDependency would resolve correctly (it couldn't be
 * verified here), this script uses Vite's own `createServer` +
 * `ssrLoadModule` API to load the TypeScript validator modules directly —
 * `vite` is already a dependency of this project, so this adds nothing new
 * to package.json. This is the standard, no-extra-dependency way to run a
 * few TS modules from a plain Node script in a Vite project.
 */
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function loadValidationModules() {
  const server = await createServer({ root: rootDir, server: { middlewareMode: true }, appType: "custom" });
  try {
    const lintModule = await server.ssrLoadModule("/src/lib/curriculum/authoring/lint-lesson-v1.ts");
    const pipelineModule = await server.ssrLoadModule("/src/lib/curriculum/authoring/authoring-pipeline.ts");
    const goldenModule = await server.ssrLoadModule("/src/lib/curriculum/golden-lesson-v1.ts");
    return { server, lintLessonV1Full: lintModule.lintLessonV1Full, evaluateLessonQuality: pipelineModule.evaluateLessonQuality, goldenLesson0CanonicalV1: goldenModule.goldenLesson0CanonicalV1 };
  } catch (err) {
    await server.close();
    throw err;
  }
}

function collectLessonFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    return fs
      .readdirSync(target)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(target, f));
  }
  return [target];
}

function printResult(label, lintResult, qualityScore) {
  const icon = lintResult.valid ? "✅" : "❌";
  console.log(`\n${icon} ${label}`);
  if (qualityScore) {
    console.log(
      `   quality: ${qualityScore.overallScore}/100` +
        (qualityScore.passedCertification ? " (certification-ready)" : " (not certification-ready)"),
    );
  }
  for (const e of lintResult.errors) {
    console.log(`   ERROR   [${e.code}] ${e.path}: ${e.message}`);
    if (e.suggestion) console.log(`           → ${e.suggestion}`);
  }
  for (const w of lintResult.warnings) {
    console.log(`   WARN    [${w.code}] ${w.path}: ${w.message}`);
    if (w.suggestion) console.log(`           → ${w.suggestion}`);
  }
  for (const i of lintResult.infos) {
    console.log(`   INFO    [${i.code}] ${i.path}: ${i.message}`);
  }
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: node scripts/validate-lessons-v1.mjs <lesson.json | directory | --golden>");
    process.exit(2);
  }

  const { server, lintLessonV1Full, evaluateLessonQuality, goldenLesson0CanonicalV1 } =
    await loadValidationModules();

  let hadBlockingError = false;
  try {
    if (arg === "--golden") {
      const quality = evaluateLessonQuality(goldenLesson0CanonicalV1);
      printResult(`${goldenLesson0CanonicalV1.id} (golden fixture)`, quality.lintResult, quality);
      hadBlockingError = !quality.lintResult.valid;
    } else {
      const files = collectLessonFiles(path.resolve(process.cwd(), arg));
      if (files.length === 0) {
        console.error(`No .json files found at ${arg}`);
        process.exit(2);
      }
      for (const file of files) {
        let raw;
        try {
          raw = JSON.parse(fs.readFileSync(file, "utf8"));
        } catch (err) {
          console.log(`\n❌ ${file}`);
          console.log(`   ERROR   [MALFORMED_JSON] $: ${err.message}`);
          hadBlockingError = true;
          continue;
        }
        const quality = evaluateLessonQuality(raw);
        printResult(file, quality.lintResult, quality);
        if (!quality.lintResult.valid) hadBlockingError = true;
      }
    }
  } finally {
    await server.close();
  }

  console.log("");
  process.exit(hadBlockingError ? 1 : 0);
}

main().catch((err) => {
  console.error("Validation CLI crashed:", err);
  process.exit(2);
});
