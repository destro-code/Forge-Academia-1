# V1 JSON-authored lessons

Drop schema-v1-conforming lesson JSON files here (one lesson per file). The
V1 loader (`src/lib/curriculum/v1/loader.ts`) discovers everything in this
directory automatically via `import.meta.glob` — no code change is needed to
register a new file.

TypeScript-authored fixtures (currently just the golden lesson,
`lesson-0-1-1`) are registered separately in
`src/lib/curriculum/golden-lesson-v1.ts`, since a `.ts` module can't be
picked up by a JSON glob. Both sources feed the same runtime registry.

Every file is validated with `safeValidateLessonV1` at load time; an invalid
file is excluded and logged, never silently served to the player.
