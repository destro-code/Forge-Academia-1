# Forge — Frontend Engineering Academy

**Playful intelligence. Serious engineering.**

Forge is a creative engineering workshop where curiosity becomes understanding, experimentation becomes capability, and learning leads to independence.

It is built around active engineering work: learners investigate how the web behaves, predict outcomes, experiment with code, build projects, diagnose failures, verify results, and explain their decisions. Forge is not intended to be a passive course catalogue, a generic quiz platform, or an AI chat interface with lessons attached.

> **Product and experience direction:** [Forge Brand & Experience Manifesto](docs/FORGE_BRAND_AND_EXPERIENCE_MANIFESTO.md)  
> **Product vision:** [PRODUCTVISION.md](PRODUCTVISION.md)  
> **Visual system:** [Forge Visual Design System](docs/FORGE_VISUAL_DESIGN_SYSTEM.md)

## The learning model

The core learning loop is:

**Understand → Predict → Manipulate → Practice → Build → Break → Debug → Explain → Transfer → Engineer**

Learners develop through four stages:

1. **Familiarity** — recognise concepts and understand the basic mental models.
2. **Fluency** — apply concepts in familiar situations.
3. **Reasoning** — diagnose unfamiliar behaviour and make deliberate technical decisions.
4. **Engineering independence** — work through problems, evaluate trade-offs, and explain solutions with less guidance.

Guidance reduces as capability is demonstrated. Lesson completion and activity are tracked separately from verified capability evidence.

## Current product areas

The application includes work across these experiences:

- **Learn** — structured frontend lessons, interactive explanations, practice, and evidence.
- **Guided Builds** — focused, task-based project work with a constrained code-entry experience.
- **Module Projects** — larger project workspaces with milestones, previews, and verification.
- **Playground** — a space for independent experimentation and code exploration.
- **Debug Lab** — investigate broken behaviour, test hypotheses, and explain the cause.
- **Forge Buddy** — contextual learning support that stays out of the way unless useful or requested.
- **Progress & Capability** — distinguish learning activity from demonstrated evidence.
- **Achievements** — a record of learning milestones and engineering practice.
- **Interview Practice** — practise technical explanations and problem-solving.

Forge is actively developed. A route or visible control should not be interpreted as proof that every workflow is complete; the repository's feature contracts and tests define the intended behaviour.

## Technology

### Application
- React
- TypeScript
- TanStack Start
- TanStack Router
- Vite
- Tailwind CSS

### State and forms
- TanStack Query
- Zustand
- React Hook Form
- Zod

### Engineering experiences
- Monaco Editor and CodeMirror-based editing capabilities
- Framer Motion
- Vitest
- ESLint
- Prettier

### AI
- Google Gemini API for selected mentoring and evaluation workflows

## Architecture and quality

Forge uses file-based routing through TanStack Router and TanStack Start. Learning content, project definitions, verification, progress, and evidence are implemented in dedicated data and domain layers.

Important product constraints:

- Do not equate lesson completion, self-reported task completion, XP, or activity with mastery.
- Verification must reflect the checks that actually ran and their limitations.
- Preserve learner work when moving between connected learning experiences.
- Keep Buddy contextual and optional.
- Make every visible control functional and accessible.
- Treat local browser persistence as device-local unless a server-backed account store is explicitly implemented.

See [Architecture](doc/ARCHITECTURE.md), [Quality Assurance](doc/QUALITY_ASSURANCE.md), and [Testing Strategy](doc/TESTING_STRATEGY.md) for implementation details.

## Development

### Requirements
- Node.js
- npm

### Install dependencies
```bash
npm install
```

### Start the development server
```bash
npm run dev
```

### Production build
```bash
npm run build
```

### Tests
```bash
npm test
```

### Lint
```bash
npm run lint
```

### Lesson content validation
```bash
npm run validate:lessons
```

## Environment variables

Copy the required variable names from `.env.example` into your local environment. Never commit API keys, credentials, or other secrets.

## Project status

Forge is an active product under development. The product vision describes the intended experience; implementation status must be confirmed through the current application, tests, and release checks.

## Author

**Henry Mosiali**

- Portfolio: https://henrymosiali.vercel.app
- GitHub: https://github.com/destro-code
- LinkedIn: https://www.linkedin.com/in/henrymosiali
