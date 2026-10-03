# V1 JSON-authored lessons

Drop schema-v1-conforming lesson JSON files here (one lesson per file). The
V1 loader (`src/lib/curriculum/v1/loader.ts`) discovers everything in this
directory automatically via `import.meta.glob` — no code change is needed to
register a new file.

TypeScript-authored fixtures (such as the golden lesson,
`goldenLesson0CanonicalV1`) in `src/lib/curriculum/golden-lesson-v1.ts` are
test fixtures only and are never merged into the production lesson registry.
Production lesson discovery comes exclusively from this directory.

Every file is validated with `safeValidateLessonV1` at load time; an invalid
file is excluded and logged, never silently served to the player.
