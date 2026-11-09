# Forge UI & Experience Guardrails

**Status:** Active implementation guardrails  
**Authority:** [Canonical Brand & Experience Manifesto](../docs/FORGE_BRAND_AND_EXPERIENCE_MANIFESTO.md) and [Forge Visual Design System](../docs/FORGE_VISUAL_DESIGN_SYSTEM.md)

## Core direction

Forge is a creative engineering workshop—not a generic LMS, a sterile developer dashboard or an IDE with lessons attached.

The interface should be expressive and distinctive while keeping the learner's current task clear. Professional quality does not require every page to share an identical layout or every screen to be minimal and dark.

## Experience rules

- Design each screen around its purpose and primary learner action.
- Keep the learning task more prominent than navigation, metadata and decoration.
- Use distinct page compositions when the work genuinely differs: discovery, lessons, projects, experimentation, investigation and progress.
- Maintain one recognisable product identity across those different compositions.
- Use environmental accents in everyday work and reserve immersive treatments for meaningful moments.
- Treat light and dark themes as first-class experiences with their own considered surface and text values.
- Use the semantic tokens in the Visual Design System; do not introduce new hard-coded brand colours in feature files.
- Use expressive visual elements with intent; avoid decorative density.
- Use motion to communicate feedback, state changes, relationships or meaningful transitions. Do not animate merely because animation is available.
- Respect reduced-motion preferences.
- Design intentionally for mobile, touch, keyboard and assistive technology.
- Every visible control must perform its labelled action and communicate its state.
- Feedback, progress, validation and mastery claims must reflect actual evidence.
- Keep interfaces readable and focused during demanding technical work.

## Learning experience

The product's established learning loop is:

Understand → Predict → Manipulate → Practice → Build → Break → Debug → Explain → Transfer → Engineer

Use the steps that serve the learning objective. Do not force every lesson into an identical sequence or add interactions merely because a component exists.

## Accessibility and responsive quality

- Maintain semantic structure, accessible names and keyboard operation.
- Provide visible focus indicators and sufficient contrast.
- Ensure primary touch targets are at least 44px where practical.
- Avoid horizontal overflow at narrow viewport widths.
- Provide useful loading, empty, success and failure states.
- Preserve learner work when moving between connected experiences.
- Test both themes, reduced motion and keyboard-only operation.
- Validate WCAG 2.2 AA contrast for text and interactive controls.

## Migration discipline

- The visual design system is the source of truth for foundational colour, typography, shape, depth, motion and composition rules.
- Legacy Atelier variables and hard-coded colour utilities may remain temporarily for compatibility, but new feature work must use semantic tokens.
- Migrate existing routes in coherent slices. Avoid global overrides that conceal broken component semantics.
- Preserve feature logic, curriculum relationships, validation, evidence rules and technical contracts during visual redesign.
- Do not delete or replace a feature solely because its current visual treatment conflicts with the new system; preserve, refine, reimagine or remove it based on its purpose and dependencies.
