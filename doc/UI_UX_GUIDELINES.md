# Forge UI & Experience Guardrails

**Status:** Interim design guardrails  
**Authority:** [Canonical Brand & Experience Manifesto](../docs/FORGE_BRAND_AND_EXPERIENCE_MANIFESTO.md)

This document is not a complete visual design system. Exact colours, typography, spacing, component styling, illustration rules and theme tokens are intentionally undecided until the visual design-system phase.

## Core direction

Forge is a creative engineering workshop—not a generic LMS, a sterile developer dashboard or an IDE with lessons attached.

The interface should be expressive and distinctive while keeping the learner's current task clear. Professional quality does not require every page to share an identical layout or every screen to be minimal and dark.

## Experience rules

- Design each screen around its purpose and primary learner action.
- Keep the learning task more prominent than navigation, metadata and decoration.
- Use distinct page compositions when the work genuinely differs: discovery, lessons, projects, experimentation, investigation and progress.
- Maintain one recognisable product identity across those different compositions.
- Use environmental accents in everyday work and reserve immersive treatments for meaningful moments.
- Treat light and dark themes as first-class experiences. Neither is a secondary afterthought.
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

## Theme and visual system

Do not introduce new hardcoded colour values, typography systems or one-off visual tokens as part of this interim document. Follow the existing implementation conventions until a reviewed visual design system is approved. The future design system must support both light and dark experiences.

## Accessibility and responsive quality

- Maintain semantic structure, accessible names and keyboard operation.
- Provide visible focus indicators and sufficient contrast.
- Ensure touch targets are usable.
- Avoid horizontal overflow at narrow viewport widths.
- Provide useful loading, empty, success and failure states.
- Preserve learner work when moving between connected experiences.
- Test reduced motion and both theme modes.

## Decision precedence

If an older UI/UX note conflicts with the Brand & Experience Manifesto, the manifesto takes precedence. Feature-specific technical contracts remain in force unless explicitly reviewed. This document should be replaced by a complete visual design system after that system has been discussed and approved.
