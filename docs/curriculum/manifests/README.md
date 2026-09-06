# Batch Certification Manifests

Batch manifests record the production status, source lesson mapping, validation results, pedagogical audit status, and certification state for each curriculum transformation batch.

## Structure

Each batch manifest is stored in `docs/curriculum/manifests/batch-<n>-manifest.json` and records:

- `batchId`: Identifier for the batch (e.g. `batch-1`, `batch-2`)
- `phase`: Associated level/phase
- `module`: Target module ID and title
- `sourceLessonIds`: List of original legacy lesson IDs
- `canonicalLessonIds`: List of output canonical lesson IDs
- `sourceCount`: Number of source lessons
- `canonicalCount`: Number of canonical lessons generated
- `transformationStatus`: Status of transformation (`PENDING`, `IN_PROGRESS`, `COMPLETE`)
- `validationStatus`: Schema validation result (`PASS` / `FAIL`)
- `authoringLintStatus`: Linter result (`PASS` / `FAIL`)
- `pedagogicalAuditStatus`: Pedagogical review result (`PASS` / `FAIL`)
- `regressionStatus`: Test suite regression result (`PASS` / `FAIL`)
- `certificationStatus`: Final batch certification (`CERTIFIED` / `NOT_CERTIFIED`)

## Existing Manifests

- `batch-1-manifest.json` — Phase 1 Module 1-1 HTML Fundamentals (11 canonical lessons, CERTIFIED)
- `batch-2-manifest.json` — Phase 1 Module 1-2 CSS Fundamentals (12 canonical lessons, CERTIFIED)
- `batch-template.json` — Standard template for future production batches
