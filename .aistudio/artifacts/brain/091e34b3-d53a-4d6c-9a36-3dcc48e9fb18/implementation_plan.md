# Forge Academia — Complete Founder Vision & New Mascot Execution Plan

## Goal
Transform Forge into the cohesive, zero-setup **"Learn → Build → Grow & Ace the Interview"** platform you envisioned, anchored by **Forge's new mascot**—the hooded violet-and-navy Forge Spirit with its flame-like tuft and glowing Forge Crystal—woven deeply into the product experience rather than sitting on the sidelines as static branding.

---

## Pillar 1: The New Forge Mascot & Brand System Across the Website
Replace the old mascot (`forge-buddy-illos.tsx`, `atelier-interactive-emblem.tsx`, favicon/app icon, and brand headers) with the new **Forge Spirit** from your concept board:

1. **Consistent Visual Identity & 6 Signature Expressions**:
   - Build a unified, animated `ForgeMascot` & `ForgeCrystal` component suite faithful to the concept board's exact silhouette and color palette (Deep Navy `#1E1B4B`, Vibrant Violet `#6E6AF6`, Soft Lavender `#C4B5FD`, Warm Gold `#FBBF24`, and Warm Cream `#FAF8F5`):
     - **`happy`**: Holding the glowing violet Forge Crystal with warm `^ ^` eyes.
     - **`thinking`**: Hand on chin, curious oval eyes, and floating `?` for quizzes, hints, and debugging.
     - **`excited`**: Jumping mid-air with sparkles when unlocking milestones or finishing lessons.
     - **`coding`**: Typing intensely on a laptop bearing the 4-point Forge Star emblem.
     - **`cheering`**: Joyful `> <` eyes with both arms raised when tests pass or tasks are completed.
     - **`winking`**: Pointing forward with a playful wink and gold star when sharing developer jokes or interview tips.
2. **Brand Emblem, App Icon & Site-Wide Moments**:
   - Update the top navigation brand mark and browser App Icon (`index.html`) to use the signature 4-point Forge Spark / Hooded Forge Spirit icon and `Learn · Build · Grow` identity.
   - Integrate expressive Forge states into **onboarding, loading states, empty states (e.g., no search results or empty bookmarks), progress milestones, and achievement cards** across the Landing Page, Dashboard, Curriculum, Projects, and Profile.

---

## Pillar 2: Interactive Lesson Studio (Mascot Reactions, Audio Narration, Live Code & Humor)
Upgrade the lesson player (`/src/components/lesson/v2/lesson-shell.tsx`, `lesson-experience.tsx`, and `activity-stage.tsx`) so lessons feel alive, humorous, and hands-on:

1. **Interactive Forge Buddy Inside Every Lesson Step**:
   - **Explains & Cracks Jokes**: On concept and explanation steps, Forge appears in `happy` or `winking` pose delivering a memorable real-world analogy and a lighthearted developer joke so even dry topics feel fun.
   - **Interview Trap Alerts**: Highlights *"How Interviewers Ask This Live"* (especially on `async/await`, Promises, closures, DOM, and React state) so you never get blindsided in an interview again.
   - **Celebrates Understanding**: When a learner answers a question correctly or passes a code step, Forge transitions into `cheering` / `excited` with celebratory speech feedback; if they miss an answer, Forge switches to `thinking` with a supportive nudge.
2. **Built-In Studio Audio Narration Bar (`StudioAudioBar`)**:
   - Add a tactile audio player bar inside every lesson step (`Play / Pause / Restart`, `1x / 1.25x / 1.5x` speed, and **Auto-Read Step**) so learners can listen to the lesson and Forge's commentary out loud while reading or coding.
3. **"Code It Live" Sandbox Inside Every Lesson**:
   - Embed a toggleable **Live Code Practice Drawer** inside every lesson pre-loaded with runnable code for that exact lesson (including turning passive `async/await` and `fetch()` lessons into live executable coding exercises).

---

## Pillar 3: Reactive Playground & Zero-Setup Project Builder
Make the Playground (`/playground`) and Projects (`/projects/$projectId`) work together with real-time mascot feedback:

1. **Reactive Forge Mascot Inside the Playground**:
   - **While Editing/Running**: Forge sits in the `coding` pose with its laptop.
   - **When Code Runs Cleanly**: Forge lights up its crystal (`happy` / `cheering`) and confirms the output.
   - **When an Error Occurs**: Forge switches to `thinking`, points out the error line/message in plain English, and offers a quick tip to fix it.
   - **When a Project Milestone is Checked Off**: Forge jumps into `excited` / `cheering` to celebrate your progress.
2. **Launch Playground with Project Starter Files & Docked Checklist**:
   - Clicking **"Build Project in Studio"** on any project opens `/playground?project=<projectId>` pre-loaded with that project's starter `index.html`, `styles.css`, and `app.js` files plus a docked **Project Task Checklist** so users can code, preview, and complete milestones in one place with zero local setup.

---

## Pillar 4: Mock Interview Simulator with Friendly Forge Coach
Bring the Interview Simulator (`/interview` and `/interview/session`) into the main navigation and redesign it around confidence-building:

1. **Top Navbar & Dashboard Integration**:
   - Add **Interview Prep** as a first-class link in the top navigation (`Studio | Curriculum | Projects | Playground | Interview Prep`) and feature an Interview Readiness card on the Dashboard.
2. **Friendly Sideline Coach During Interviews**:
   - Redesign `/interview` and `/interview/session` in the cohesive Atelier + Violet/Navy Forge aesthetic.
   - During timed technical and behavioral questions, Forge acts as your **friendly sideline coach** (`thinking` / `winking`): offering progressive, clickable **Stage 1 & Stage 2 Hints** and calm encouragement when you feel stuck—**without giving away the full answer prematurely**.
3. **Live Code Execution & Instant Rubric Feedback**:
   - Let users write and execute live JavaScript/TypeScript code during technical interview questions (starting with `async/await`, `fetch` error handling, closures, and UI state), followed by instant rubric scoring, Forge's `cheering` celebration, and the full Senior Engineer model solution after submission.
