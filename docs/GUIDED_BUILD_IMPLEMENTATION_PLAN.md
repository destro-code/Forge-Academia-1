# Forge Guided Build Implementation Plan

## Product contract

A Guided Build task presents one focused code-entry box containing only the code the learner is expected to write or complete. The complete page remains in a hidden workspace and Forge inserts the learner's answer into that workspace for preview and verification.

The learner should not need to browse files, edit unrelated code, inspect the full source, or understand the workspace plumbing just to complete a task.

Module Projects remain independent projects with a suitable multi-file workspace. The free Playground remains a separate experimentation environment and is not part of the current redesign.

## Batch 1 — Make task slots explicit and fail safely

**Status: implemented on the feature branch**

- Define a typed task-slot contract on each Guided Build task.
- Identify editable regions using unique, explicit start/end markers.
- Remove selector/TODO/body/full-file guesses from the focused editor path.
- Show a configuration error instead of exposing unrelated code when markers are missing, duplicated, misordered, or tied to the wrong file.
- Remove the full-file editor escape hatch from Guided Builds; preserve full-file editing for Module Projects.
- Add tests for invalid slot markers and reconstruction.

## Batch 2 — Finish the first Guided Build

**Status: implemented on the feature branch**

Configure all six tasks in `semantic-profile-launchpad` with explicit slots in `index.html` or `styles.css`. Keep fixed page scaffolding and unrelated status/preview code outside the learner's editable area. Make empty slots a supported state.

## Batch 3 — Configure the remaining Guided Builds

**Status: implemented on the feature branch**

Configure every task in the other six Guided Builds. The catalog currently contains seven Guided Builds and 19 tasks in total. Starter code and reference solutions must use the same markers as the task contract.

## Batch 4 — Simplify the learner-facing experience

**Status: implemented on the feature branch; visual review still required**

- Use the focused slot as the only default editor for Guided Builds.
- Keep task instructions, the slot, preview, and Check Task feedback as the main workspace.
- Hide the extended project-reference/portfolio tabs from Guided Builds while preserving them for Module Projects.
- Reduce decorative styling on the project workspace and catalogue entry point.
- Keep the Playground UI untouched in this batch.

## Batch 5 — Run and fix validation before merging

**Status: required before merge**

1. Run the targeted learning-engine and verification tests.
2. Run the full Vitest suite.
3. Run the production build and a TypeScript check if the repository/toolchain supports it.
4. Do not weaken assertions to obtain a passing result; diagnose each failure.
5. Confirm that the starter slot and solution slot match each task's authored `initialSlotCode` and `solutionSlotCode`.
6. Confirm that splicing an unchanged slot reproduces the entire underlying file exactly, including intentionally empty slots.
7. Test task switching within the same file, reset, persistence after refresh, preview updates, verification feedback, and progress state.
8. Inspect the first Guided Build at narrow mobile width, typical phone width, and desktop width. Confirm no horizontal overflow and that the learner can find the entry box and preview immediately.

**Merge gate:** All automated checks pass and the first Guided Build can be completed end to end without editing hidden or unrelated code.

## Batch 6 — Review Module Projects after Guided Builds stabilize

- Preserve their independent multi-file workflow.
- Review project readiness, prerequisites, starter/reference-solution consistency, workspace persistence, verification, and completion evidence.
- Do not force independent Module Projects into the single-slot Guided Build interaction.

## Batch 7 — Audit and redesign Playground separately

- Preserve the full editor, file navigation, live preview, console, and free-experimentation purpose.
- Audit how much project state and verification behaviour is coupled into the Playground route.
- Share compilation or validation infrastructure only where the contracts remain clear.
- Do not merge Playground work into the Guided Build refactor.

## Batch 8 — Cross-experience regression and accessibility

After the earlier batches pass, test that lessons, Guided Builds, Module Projects, and Playground retain their intended navigation and responsibilities. Check keyboard access, focus visibility, reduced motion, mobile layout, task switching, and evidence/progress correctness.

## Definition of done for Guided Builds

A learner can open each task, see one correctly scoped code-entry box, write the required code, observe the complete page update in the preview, request a hint if needed, and receive truthful verification feedback. Switching tasks never leaves the previous task's code in the box. If task-slot configuration is invalid, Forge fails safely rather than showing a guessed or entire-file editor.
