# Isolated Curriculum Production Pipeline & Workflow Guide

## Core Directive

The legacy curriculum master file:
`src/data/lessons.json`
is **READ-ONLY SOURCE MATERIAL**.

- It is **NOT** a working output file.
- It is **NOT** an authoring target.
- It is **NOT** a generated file.
- It must **NEVER** be rewritten, truncated, amended, or replaced by an AI curriculum generation process.

---

## The 10 Pipeline Rules

1. **Rule 1 — Source Read-Only Constraint**: `src/data/lessons.json` is strictly read-only source material.
2. **Rule 2 — Prompt Bounding**: Never provide the entire `lessons.json` to an AI curriculum-generation task.
3. **Rule 3 — Bounded Units**: Every transformation operates exclusively on a bounded module source package from `docs/curriculum/source-packages/`.
4. **Rule 4 — Output Isolation**: Canonical lessons are written as new files in `src/data/canonical/lessons/lesson-<id>.json`.
5. **Rule 5 — Automated Validation**: Canonical lessons must pass 100% schema validation (`validateLesson`) and authoring lint (`lintLesson`).
6. **Rule 6 — Pedagogical Review**: Canonical lessons require explicit pedagogical audit against cognitive architecture and Bloom's taxonomy principles.
7. **Rule 7 — Holistic Certification**: A batch cannot be certified merely because the JSON validates; it requires full evidence and transfer checks.
8. **Rule 8 — Source Coverage Preservation**: Each batch must preserve 100% source intent, concepts, and skills without scope reduction or unrequested inflation.
9. **Rule 9 — Independent Auditability**: Each batch must be recorded in an independent, version-controlled manifest in `docs/curriculum/manifests/`.
10. **Rule 10 — Batch Isolation**: No subsequent batch begins until the current batch is fully certified and approved.

---

## Transformation Pipeline Architecture

```text
LEGACY SOURCE (src/data/lessons.json - READ ONLY)
    ↓
bounded extraction
    ↓
human-controlled curriculum inventory (docs/curriculum/inventory/)
    ↓
bounded module package (docs/curriculum/source-packages/<module-id>-package.json)
    ↓
AI transformation (bounded prompt context)
    ↓
new canonical lesson JSON (src/data/canonical/lessons/lesson-<id>.json)
    ↓
automated validation (schema & authoring linter)
    ↓
pedagogical audit
    ↓
batch manifest certification (docs/curriculum/manifests/batch-<id>-manifest.json)
```

---

## AI Studio Prompt Guidance

When requesting an AI model (e.g. Gemini / AI Studio) to transform a curriculum batch:

### What to Provide to AI Studio:

1. The Authoring Contract (`src/lib/curriculum/schema.ts` & guidelines)
2. Relevant Canonical Schema definitions & archetype specifications
3. The **Bounded Source Package** for the single targeted module (`docs/curriculum/source-packages/<module>-package.json`)
4. Specific batch transformation scope and objective requirements

### What NOT to Provide to AI Studio:

- The entire `src/data/lessons.json` file
- Unbounded historical legacy curriculum
- Unrelated future modules or levels

---

## Human-Controlled Authority

The AI model assists with drafting JSON, activity design, and objective formulation.
The **Human-Controlled System of Record** remains:

1. `docs/curriculum/inventory/curriculum-inventory.json`
2. `docs/curriculum/source-packages/`
3. Authoring contract & Canonical Schema
4. Automated verification suite

The AI model must **never** become the authority for curriculum coverage, lesson ordering, or prerequisite relationships.

---

## Batch Isolation Protocol

```text
ONE BATCH
    ↓
TRANSFORM
    ↓
VALIDATE
    ↓
AUDIT
    ↓
REGRESSION
    ↓
CERTIFY
    ↓
STOP
```

Never generate Batch N+1 while Batch N is uncertified.
