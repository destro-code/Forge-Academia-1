# Forge Visual Design System

**Status:** Initial implementation specification  
**Authority:** Subordinate to [Forge Brand & Experience Manifesto](./FORGE_BRAND_AND_EXPERIENCE_MANIFESTO.md)  
**Scope:** Foundational visual tokens, typography, materials, composition, illustration, motion and responsive behaviour.

This document translates the canonical brand direction into implementable visual rules. It does not authorise a feature to change its learning behaviour or technical contract.

## 1. Design premise

Forge is a creative technology laboratory expressed through a hybrid graphic and dimensional language.

- Graphic expression establishes recognition.
- Selective dimensional elements create wonder and memorable focal moments.
- Functional structure keeps the learner oriented.
- Visual intensity changes with the work: discovery can be expressive; technical work must remain focused.
- Consistency means one coherent visual language, not identical page layouts.

The visual signature is built from **revelation, connection, transformation and pattern recognition**. Avoid literal industrial symbols and generic technology decoration.

## 2. Colour system

### Foundational palette

| Token / role          |     Light |      Dark | Use                                     |
| --------------------- | --------: | --------: | --------------------------------------- |
| Ink / foreground      | `#202329` | `#F1F0EB` | Primary text                            |
| Workshop / background | `#F4F2EC` | `#171A1F` | Main environment                        |
| Raised surface        | `#FFFEFB` | `#20252B` | Cards, panels and work areas            |
| Secondary surface     | `#ECEAE4` | `#242A30` | Subtle grouping                         |
| Forge orange          | `#F47735` | `#FF874A` | Primary action and selected emphasis    |
| Signal cyan           | `#277C89` | `#72C4CE` | Technical relationships and information |
| Growth                | `#386F56` | `#83B99A` | Verified positive outcomes              |
| Border                | `#DEDAD1` | `#363D44` | Separation and structure                |
| Secondary text        | `#626A73` | `#AAB2BA` | Supporting information                  |
| Error                 | `#C94D43` | `#F0786E` | Errors and destructive actions          |
| Warning               | `#94601D` | `#E6BD72` | Caution and incomplete states           |

### Colour rules

- Orange is an action colour, not a background colour for every panel.
- Cyan is reserved for technical information, links between concepts and occasional discovery cues.
- Green means a verified positive outcome. It must not imply mastery from activity alone.
- Red communicates errors or destructive consequences; it is not used to shame learners.
- Warning communicates uncertainty, risk or incomplete work.
- Neutral surfaces carry most of the interface.
- Avoid purple/pink gradients, neon glow, rainbow accents and large decorative gradients.
- Always pair status colour with text, iconography or another non-colour cue.
- Validate text and control contrast against WCAG 2.2 AA before release.

## 3. Typography

- **Inter** is the primary interface and display family.
- **JetBrains Mono** is reserved for code, file paths, technical labels and compact data.
- Use weight and scale for hierarchy before relying on colour.
- Body copy should be comfortable for sustained reading; use a 1.5–1.7 line-height range for instructional prose.
- Display typography may be expressive in discovery and brand moments, but learning workspaces use restrained, readable headings.
- Do not introduce a decorative serif or handwritten face into core interface navigation or lesson content.

### Type scale

| Role               | Desktop guidance | Mobile guidance |
| ------------------ | ---------------: | --------------: |
| Display            |          48–64px |         36–44px |
| Page title         |          32–40px |         28–34px |
| Section title      |          22–28px |         20–24px |
| Subsection         |          17–20px |         17–19px |
| Body               |          15–17px |         15–17px |
| Supporting         |          13–14px |         13–14px |
| Technical metadata |          11–12px |         11–12px |

Do not shrink body copy to make a dense layout fit. Simplify the layout instead.

## 4. Shape, spacing and materials

- Use a restrained radius family: 6px for compact controls, 10–14px for standard surfaces, 16px for occasional large focal surfaces.
- Avoid rounding every element into a pill. Reserve pills for compact filters, tags and status labels.
- Use a consistent 4px spacing base; align major layout gaps to 8px increments.
- Prefer borders, tonal contrast and whitespace over stacked shadows.
- Use one meaningful elevation level for raised surfaces; reserve stronger elevation for overlays and floating tools.
- Glass and blur are exceptional, not default materials.
- Code editors and consoles are intentional dark work surfaces in both themes: charcoal ink, warm high-contrast text, and restrained orange/cyan status emphasis. Avoid purple neon treatments.
- Grid, orbit and blueprint motifs may appear as low-contrast environmental texture, never as a permanent obstacle behind dense content.
- Maintain a minimum 44px touch target for primary interactive controls.

## 5. Composition and layout

The system uses **structured foundations with selective expressive freedom**.

| Experience                 | Composition rule                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| Discovery / landing        | Strong editorial hierarchy, a memorable focal composition and clear entry actions               |
| Dashboard / orientation    | Calm, scannable overview; prioritise the next meaningful action                                 |
| Curriculum / learning path | Spatial relationships and progression should be easy to understand                              |
| Lesson                     | Reading-first hierarchy with a focused experiment or practice area                              |
| Guided Build               | Task-slot structure; expose the current step, evidence and preview without imitating a full IDE |
| Module Project             | Project brief, requirements, build space and verification are distinct                          |
| Playground                 | Workspace-first; minimise decorative chrome and preserve usable editor space                    |
| Debug Lab                  | Evidence, expected behaviour, actual behaviour and next test should be visually connected       |
| Progress / capability      | Separate activity, progress, demonstrated capability and independence                           |
| Forge Buddy                | Contextual and dismissible; never the dominant permanent surface                                |

Use different compositions when the learner's work differs. Do not force every route into the same card grid.

## 6. Illustration and dimensional language

- Use 2D illustration for explanation, diagrams, identity and small narrative moments.
- Use 3D selectively for Buddy, focal objects and meaningful milestone moments.
- Prefer abstract systems, connected parts, layered diagrams, changing structures and visualised cause-and-effect.
- Dimensional objects should have a clear relationship to the current task or brand story.
- Keep technical diagrams legible and avoid visual metaphor where precision is required.
- No fire, anvils, hammers, generic lightbulbs, stock illustration packs or random floating tech icons.

## 7. Motion and feedback

Motion is meaningful, state-aware and occasional.

- Use short transitions for state changes and orientation (roughly 140–220ms for common UI transitions).
- Use longer motion only for a meaningful reveal, transformation or milestone.
- Feedback must describe the real system state.
- Celebrate demonstrated achievement, not every click or completed screen.
- Do not animate static decoration continuously.
- Never rely on motion alone to communicate a change.
- Respect `prefers-reduced-motion`; essential state changes must remain clear without animation.

## 8. Themes and accessibility

Light and dark are first-class environments with their own surface and text values, not a simple inversion.

- Preserve semantic tokens across both themes.
- Keep code surfaces high-contrast and visually distinct from surrounding panels.
- Provide visible keyboard focus, semantic controls and accessible names.
- Never use colour as the only status signal.
- Support keyboard, touch and assistive technology.
- Test responsive layouts at narrow mobile widths and common desktop widths.
- Test both themes and reduced-motion mode.
- Validate WCAG 2.2 AA contrast for text, controls and focus indicators.

## 9. Implementation governance

- Use semantic CSS variables and component tokens; do not add new hard-coded brand colours to feature files.
- The legacy Atelier aliases in the CSS foundation are temporary compatibility mappings, not a second palette.
- Migrate route-level hard-coded colours in deliberate slices. Do not use broad CSS hacks to conceal broken component semantics.
- Preserve feature logic, learning contracts, validation and evidence rules during visual migration.
- Do not delete a feature or technical contract as a side effect of redesign.
- Update this document when a foundational design decision changes.
- Do not claim an unimplemented design rule is already present in the shipped interface.
