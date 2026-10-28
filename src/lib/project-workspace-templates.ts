import type { Project, ProjectMilestone, ProjectTask, ExerciseValidationSpec, ValidationAssertion } from "./types"
import type { PlaygroundFile, PlaygroundRuntime } from "./types/playground"

export interface ProjectPlaygroundWorkspace {
  runtime: PlaygroundRuntime
  entryFile: string
  title: string
  files: PlaygroundFile[]
  solutionFiles: Record<string, string>
  activeFileId: string
  validationSpec: ExerciseValidationSpec
}

interface CustomProjectTemplate {
  activeFileId: string
  files: Array<{
    id: string
    name: string
    language: "html" | "css" | "javascript"
    starter: string
    solution: string
  }>
}

const PROJECT_TEMPLATES: Record<string, CustomProjectTemplate> = {
  "semantic-profile-launchpad": {
    activeFileId: "proj-html",
    files: [
      {
        id: "proj-html",
        name: "index.html",
        language: "html",
        starter: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alex Rivera · Developer Launchpad</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="launchpad-card">
    <!-- TODO (Task 1): Replace this generic <div> with a semantic <header> landmark,
         add descriptive alt text to the avatar <img>, and use an <h1> for the name. -->
    <!-- FORGE_SLOT_START: semantic-profile-launchpad:t1 -->
    <div class="profile-header">
      <img
        class="avatar"
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
        alt=""
        width="72"
        height="72"
      />
      <div class="profile-name">Alex Rivera</div>
      <p class="profile-role">Frontend Systems Engineer · San Francisco</p>
    </div>
    <!-- FORGE_SLOT_END: semantic-profile-launchpad:t1 -->

    <!-- TODO (Task 3): Convert the status panel into a semantic <section> with a <dl> of profile facts. -->
    <main class="profile-body">
    <!-- FORGE_SLOT_START: semantic-profile-launchpad:t3 -->
      <div class="status-panel">
        <h2>Current Engineering Focus</h2>
        <p>Semantic HTML5, CSS Architecture & Accessible UI Primitives</p>
      </div>
    <!-- FORGE_SLOT_END: semantic-profile-launchpad:t3 -->

      <!-- TODO (Task 2): Wrap this social links list in <nav aria-label="Social links">
           with an unordered list (<ul>) and at least 3 <a href="..."> links. -->
    <!-- FORGE_SLOT_START: semantic-profile-launchpad:t2 -->
      <div class="links-wrapper">
        <ul class="social-links">
          <li><a href="https://github.com">GitHub Repositories</a></li>
          <li><a href="https://example.com/projects">Featured Architecture Case Studies</a></li>
        </ul>
      </div>
    <!-- FORGE_SLOT_END: semantic-profile-launchpad:t2 -->
    </main>

    <footer class="profile-footer">
      <small>Built with zero-framework Semantic HTML5 & CSS Custom Properties</small>
    </footer>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alex Rivera · Developer Launchpad</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="launchpad-card">
    <!-- FORGE_SLOT_START: semantic-profile-launchpad:t1 -->
    <header class="profile-header">
      <img
        class="avatar"
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
        alt="Portrait of Alex Rivera"
        width="72"
        height="72"
      />
      <h1 class="profile-name">Alex Rivera</h1>
      <p class="profile-role">Frontend Systems Engineer · San Francisco</p>
    </header>
    <!-- FORGE_SLOT_END: semantic-profile-launchpad:t1 -->

    <main class="profile-body">
    <!-- FORGE_SLOT_START: semantic-profile-launchpad:t3 -->
      <section class="status-panel" aria-labelledby="focus-heading">
        <h2 id="focus-heading">Current Engineering Focus</h2>
        <dl class="status-facts">
          <dt>Currently Learning</dt>
          <dd>Semantic HTML5 &amp; Accessible CSS Systems</dd>
          <dt>Availability</dt>
          <dd>Open for Frontend Engineering Roles</dd>
        </dl>
      </section>
    <!-- FORGE_SLOT_END: semantic-profile-launchpad:t3 -->

    <!-- FORGE_SLOT_START: semantic-profile-launchpad:t2 -->
      <nav aria-label="Social links" class="links-wrapper">
        <ul class="social-links">
          <li><a href="https://github.com">GitHub Repositories</a></li>
          <li><a href="https://example.com/projects">Featured Architecture Case Studies</a></li>
          <li><a href="mailto:alex@example.com">Contact &amp; Engineering Notes</a></li>
        </ul>
      </nav>
    <!-- FORGE_SLOT_END: semantic-profile-launchpad:t2 -->
    </main>

    <footer class="profile-footer">
      <small>Built with zero-framework Semantic HTML5 &amp; CSS Custom Properties</small>
    </footer>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        id: "proj-css",
        name: "styles.css",
        language: "css",
        starter: `/* TODO (Milestone 2 · Task 4): Define --bg, --surface, --text, and --accent on :root */
:root {
  /* FORGE_SLOT_START: semantic-profile-launchpad:t4 */
  --bg: #0f172a;
  --surface: #1e293b;
  /* FORGE_SLOT_END: semantic-profile-launchpad:t4 */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg, #0f172a);
  color: var(--text, #f8fafc);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.launchpad-card {
  width: 100%;
  max-width: 440px;
  background: var(--surface, #1e293b);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 24px;
}

.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent, #38bdf8);
  margin-bottom: 12px;
}

.profile-name,
h1 {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.profile-role {
  font-size: 0.875rem;
  color: #94a3b8;
}

.status-panel {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 18px;
}

.status-panel h2 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #38bdf8;
  margin-bottom: 8px;
}

dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  font-size: 0.82rem;
}

dt {
  color: #94a3b8;
  font-weight: 600;
}

dd {
  color: #f8fafc;
}

/* TODO (Milestone 2 · Task 5): Turn .social-links into a flex column with gap: 12px */
.social-links {
  /* FORGE_SLOT_START: semantic-profile-launchpad:t5 */
  list-style: none;
  /* FORGE_SLOT_END: semantic-profile-launchpad:t5 */
}

.social-links a {
  display: block;
  text-decoration: none;
  color: #f8fafc;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 11px 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
  transition: transform 0.15s ease, background 0.15s ease;
}

  /* FORGE_SLOT_START: semantic-profile-launchpad:t6 */
.social-links a:hover {
  background: rgba(56, 189, 248, 0.22);
  transform: translateY(-1px);
}
  /* FORGE_SLOT_END: semantic-profile-launchpad:t6 */

.profile-footer,
footer {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  text-align: center;
  color: #94a3b8;
  font-size: 0.75rem;
}
`,
        solution: `:root {
  /* FORGE_SLOT_START: semantic-profile-launchpad:t4 */
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
  --accent: #38bdf8;
  /* FORGE_SLOT_END: semantic-profile-launchpad:t4 */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.launchpad-card {
  width: 100%;
  max-width: 440px;
  background: var(--surface);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 24px;
}

.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent);
  margin-bottom: 12px;
}

.profile-name,
h1 {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.profile-role {
  font-size: 0.875rem;
  color: #94a3b8;
}

.status-panel {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 18px;
}

.status-panel h2 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 8px;
}

dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  font-size: 0.82rem;
}

dt {
  color: #94a3b8;
  font-weight: 600;
}

dd {
  color: var(--text);
}

.social-links {
  /* FORGE_SLOT_START: semantic-profile-launchpad:t5 */
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* FORGE_SLOT_END: semantic-profile-launchpad:t5 */
}

.social-links a {
  display: block;
  text-decoration: none;
  color: var(--text);
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 11px 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
  transition: transform 0.15s ease, background 0.15s ease;
}

  /* FORGE_SLOT_START: semantic-profile-launchpad:t6 */
.social-links a:hover {
  background: rgba(56, 189, 248, 0.22);
  transform: translateY(-1px);
}

.social-links a:active {
  transform: translateY(0);
}

.social-links a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
  /* FORGE_SLOT_END: semantic-profile-launchpad:t6 */

.profile-footer,
footer {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  text-align: center;
  color: #94a3b8;
  font-size: 0.75rem;
}
`,
      },
      {
        id: "proj-js",
        name: "app.js",
        language: "javascript",
        starter: `// Personal Developer Bio & Link Launchpad
// Inspect how your semantic landmarks (<header>, <main>, <nav>, <footer>) render in the live preview.
console.log("Developer Bio Launchpad loaded.");
`,
        solution: `// Personal Developer Bio & Link Launchpad
console.log("Developer Bio Launchpad verified.");
`,
      },
    ],
  },

  "css-design-surface-system": {
    activeFileId: "proj-css",
    files: [
      {
        id: "proj-html",
        name: "index.html",
        language: "html",
        starter: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pricing & Feature Card Surface System</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="surface-stage">
    <article class="pricing-card">
      <p class="tier-eyebrow">PRO ENGINEERING TIER</p>
      <h1 class="tier-title">$29<span>/month</span></h1>
      <p class="tier-summary">Deterministic box model tokens, zero-layout-shift surfaces, and accessible focus rings.</p>
      <ul class="feature-list">
        <li>Unlimited Sandbox Workspaces</li>
        <li>Automated DOM &amp; Computed Style Checks</li>
        <li>Design Token Export Pipeline</li>
      </ul>
      <button type="button" class="cta-button">Upgrade Workspace</button>
    </article>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pricing & Feature Card Surface System</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="surface-stage">
    <article class="pricing-card">
      <p class="tier-eyebrow">PRO ENGINEERING TIER</p>
      <h1 class="tier-title">$29<span>/month</span></h1>
      <p class="tier-summary">Deterministic box model tokens, zero-layout-shift surfaces, and accessible focus rings.</p>
      <ul class="feature-list">
        <li>Unlimited Sandbox Workspaces</li>
        <li>Automated DOM &amp; Computed Style Checks</li>
        <li>Design Token Export Pipeline</li>
      </ul>
      <button type="button" class="cta-button">Upgrade Workspace</button>
    </article>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        id: "proj-css",
        name: "styles.css",
        language: "css",
        starter: `/* TODO (Task 1): Declare --surface-card, --border-subtle, and --brand-accent on :root */
:root {
  /* FORGE_SLOT_START: css-design-surface-system:t1 */
  --surface-card: #ffffff;
  /* FORGE_SLOT_END: css-design-surface-system:t1 */
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f8fafc;
  color: #0f172a;
  padding: 24px;
  margin: 0;
}

.surface-stage {
  max-width: 400px;
  margin: 0 auto;
}

/* TODO (Task 2): Set box-sizing: border-box, padding: 24px, and a 1px solid border on .pricing-card */
.pricing-card {
  /* FORGE_SLOT_START: css-design-surface-system:t2 */
  width: 100%;
  background: var(--surface-card, #ffffff);
  border-radius: 16px;
  padding: 4px;
  /* FORGE_SLOT_END: css-design-surface-system:t2 */
}

.tier-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4f46e5;
  margin: 0 0 6px;
}

.tier-title {
  font-size: 2rem;
  margin: 0 0 8px;
}

.tier-title span {
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
}

.tier-summary {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 16px;
}

.feature-list {
  padding-left: 18px;
  margin: 0 0 20px;
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.7;
}

/* TODO (Task 3): Style .cta-button with background: var(--brand-accent), padding >= 12px,
   and add a .cta-button:focus-visible outline rule. */
  /* FORGE_SLOT_START: css-design-surface-system:t3 */
.cta-button {
  background: transparent;
  border: none;
  padding: 2px;
  font-weight: 600;
  cursor: pointer;
}
  /* FORGE_SLOT_END: css-design-surface-system:t3 */
`,
        solution: `:root {
  /* FORGE_SLOT_START: css-design-surface-system:t1 */
  --surface-card: #ffffff;
  --border-subtle: #e2e8f0;
  --brand-accent: #4f46e5;
  /* FORGE_SLOT_END: css-design-surface-system:t1 */
}

* {
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f8fafc;
  color: #0f172a;
  padding: 24px;
  margin: 0;
}

.surface-stage {
  max-width: 400px;
  margin: 0 auto;
}

.pricing-card {
  /* FORGE_SLOT_START: css-design-surface-system:t2 */
  box-sizing: border-box;
  width: 100%;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px -10px rgba(15, 23, 42, 0.08);
  /* FORGE_SLOT_END: css-design-surface-system:t2 */
}

.tier-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--brand-accent);
  margin: 0 0 6px;
}

.tier-title {
  font-size: 2rem;
  margin: 0 0 8px;
}

.tier-title span {
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
}

.tier-summary {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 16px;
}

.feature-list {
  padding-left: 18px;
  margin: 0 0 20px;
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.7;
}

  /* FORGE_SLOT_START: css-design-surface-system:t3 */
.cta-button {
  width: 100%;
  background: var(--brand-accent);
  color: #ffffff;
  border: none;
  padding: 12px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.cta-button:focus-visible {
  outline: 2px solid var(--brand-accent);
  outline-offset: 2px;
}
  /* FORGE_SLOT_END: css-design-surface-system:t3 */
`,
      },
      {
        id: "proj-js",
        name: "app.js",
        language: "javascript",
        starter: `console.log("Pricing & Feature Card Surface System ready.");`,
        solution: `console.log("Pricing & Feature Card Surface System verified.");`,
      },
    ],
  },

  "css-responsive-workspace-shell": {
    activeFileId: "proj-css",
    files: [
      {
        id: "proj-html",
        name: "index.html",
        language: "html",
        starter: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Responsive Multi-Panel Workspace Shell</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="workspace-shell">
    <header class="workspace-toolbar">
      <h1>Telemetry Overview</h1>
      <button type="button" class="refresh-btn">Sync Metrics</button>
    </header>
    <main class="metrics-grid">
      <article class="metric-card"><h2>99.98%</h2><p>API Availability</p></article>
      <article class="metric-card"><h2>42ms</h2><p>P95 Edge Latency</p></article>
      <article class="metric-card"><h2>1.4M</h2><p>Daily Active Sessions</p></article>
    </main>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Responsive Multi-Panel Workspace Shell</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="workspace-shell">
    <header class="workspace-toolbar">
      <h1>Telemetry Overview</h1>
      <button type="button" class="refresh-btn">Sync Metrics</button>
    </header>
    <main class="metrics-grid">
      <article class="metric-card"><h2>99.98%</h2><p>API Availability</p></article>
      <article class="metric-card"><h2>42ms</h2><p>P95 Edge Latency</p></article>
      <article class="metric-card"><h2>1.4M</h2><p>Daily Active Sessions</p></article>
    </main>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        id: "proj-css",
        name: "styles.css",
        language: "css",
        starter: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 20px;
}

/* TODO (Task 2): Align .workspace-toolbar using display: flex and justify-content: space-between */
.workspace-toolbar {
  /* FORGE_SLOT_START: css-responsive-workspace-shell:t2 */
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  /* FORGE_SLOT_END: css-responsive-workspace-shell:t2 */
}

/* TODO (Task 1): Lay out .metrics-grid using display: grid and gap: 16px */
.metrics-grid {
  /* FORGE_SLOT_START: css-responsive-workspace-shell:t1 */
  display: block;
  /* FORGE_SLOT_END: css-responsive-workspace-shell:t1 */
}

.metric-card {
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 18px;
}
`,
        solution: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 20px;
}

.workspace-toolbar {
  /* FORGE_SLOT_START: css-responsive-workspace-shell:t2 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  /* FORGE_SLOT_END: css-responsive-workspace-shell:t2 */
}

.metrics-grid {
  /* FORGE_SLOT_START: css-responsive-workspace-shell:t1 */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  /* FORGE_SLOT_END: css-responsive-workspace-shell:t1 */
}

.metric-card {
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 18px;
}
`,
      },
      {
        id: "proj-js",
        name: "app.js",
        language: "javascript",
        starter: `console.log("Workspace Shell loaded.");`,
        solution: `console.log("Workspace Shell verified.");`,
      },
    ],
  },

  "js-dom-interactive-taskboard": {
    activeFileId: "proj-js",
    files: [
      {
        id: "proj-html",
        name: "index.html",
        language: "html",
        starter: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Event-Driven DOM Task Board</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="taskboard-card">
    <header class="taskboard-header">
      <div>
        <p class="eyebrow">MODULE 2.2 · DOM &amp; EVENTS</p>
        <h1>Sprint Task Board</h1>
      </div>
      <span id="task-count" class="count-readout">0 tasks</span>
    </header>

    <form id="task-form" class="task-form">
      <input
        id="task-input"
        type="text"
        placeholder="Add an engineering task..."
        aria-label="New task title"
      />
      <button type="submit" class="add-btn">Add Task</button>
    </form>

    <ul id="task-list" class="task-list"></ul>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Event-Driven DOM Task Board</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="taskboard-card">
    <header class="taskboard-header">
      <div>
        <p class="eyebrow">MODULE 2.2 · DOM &amp; EVENTS</p>
        <h1>Sprint Task Board</h1>
      </div>
      <span id="task-count" class="count-readout">2 tasks</span>
    </header>

    <form id="task-form" class="task-form">
      <input
        id="task-input"
        type="text"
        placeholder="Add an engineering task..."
        aria-label="New task title"
      />
      <button type="submit" class="add-btn">Add Task</button>
    </form>

    <ul id="task-list" class="task-list"></ul>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        id: "proj-css",
        name: "styles.css",
        language: "css",
        starter: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.taskboard-card {
  max-width: 520px;
  margin: 0 auto;
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 20px;
}

.taskboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #38bdf8;
}

.taskboard-header h1 {
  font-size: 1.25rem;
}

.count-readout {
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
}

.task-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.task-form input {
  flex: 1;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #f8fafc;
  padding: 10px 12px;
  border-radius: 8px;
}

.add-btn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 10px 12px;
  border-radius: 10px;
}

.task-item.is-completed .task-title {
  text-decoration: line-through;
  color: #64748b;
}

.task-actions {
  display: flex;
  gap: 6px;
}

.toggle-btn,
.delete-btn {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}
`,
        solution: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.taskboard-card {
  max-width: 520px;
  margin: 0 auto;
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 20px;
}

.taskboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #38bdf8;
}

.taskboard-header h1 {
  font-size: 1.25rem;
}

.count-readout {
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
}

.task-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.task-form input {
  flex: 1;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #f8fafc;
  padding: 10px 12px;
  border-radius: 8px;
}

.add-btn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 10px 12px;
  border-radius: 10px;
}

.task-item.is-completed .task-title {
  text-decoration: line-through;
  color: #64748b;
}

.task-actions {
  display: flex;
  gap: 6px;
}

.toggle-btn,
.delete-btn {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}
`,
      },
      {
        id: "proj-js",
        name: "app.js",
        language: "javascript",
        starter: `const initialTasks = [
  { id: "1", title: "Audit semantic landmarks in header", completed: false },
  { id: "2", title: "Wire single delegated listener on #task-list", completed: false },
];

const taskListEl = document.querySelector("#task-list");
const taskFormEl = document.querySelector("#task-form");
const taskInputEl = document.querySelector("#task-input");
const taskCountEl = document.querySelector("#task-count");

// TODO (Task 1): Implement renderTasks() to populate #task-list with
// <li class="task-item"> elements (.toggle-btn and .delete-btn) and update #task-count.
function renderTasks() {
  if (!taskListEl) return;
  // Write your Task 1 rendering logic here
}

renderTasks();

// TODO (Task 2): Listen for "submit" on #task-form, call event.preventDefault(),
// and append the new task from #task-input into initialTasks and re-render.

// TODO (Task 3 & 4): Attach a single delegated "click" listener on #task-list
// using event.target.closest('.toggle-btn') and event.target.closest('.delete-btn').
`,
        solution: `const initialTasks = [
  { id: "1", title: "Audit semantic landmarks in header", completed: false },
  { id: "2", title: "Wire single delegated listener on #task-list", completed: false },
];

const taskListEl = document.querySelector("#task-list");
const taskFormEl = document.querySelector("#task-form");
const taskInputEl = document.querySelector("#task-input");
const taskCountEl = document.querySelector("#task-count");

function renderTasks() {
  if (!taskListEl) return;
  taskListEl.innerHTML = initialTasks
    .map(
      (task) => \`
      <li class="task-item \${task.completed ? "is-completed" : ""}" data-id="\${task.id}">
        <span class="task-title">\${task.title}</span>
        <div class="task-actions">
          <button type="button" class="toggle-btn">Done</button>
          <button type="button" class="delete-btn">Delete</button>
        </div>
      </li>
    \`
    )
    .join("");

  if (taskCountEl) {
    taskCountEl.textContent = \`\${initialTasks.length} tasks\`;
  }
}

renderTasks();

taskFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInputEl ? taskInputEl.value.trim() : "";
  if (!title) return;
  initialTasks.push({
    id: String(Date.now()),
    title,
    completed: false,
  });
  if (taskInputEl) taskInputEl.value = "";
  renderTasks();
});

taskListEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const toggleBtn = target.closest(".toggle-btn");
  if (toggleBtn) {
    const row = toggleBtn.closest(".task-item");
    if (row) {
      row.classList.toggle("is-completed");
      const id = row.getAttribute("data-id");
      const found = initialTasks.find((t) => t.id === id);
      if (found) found.completed = !found.completed;
    }
    return;
  }

  const deleteBtn = target.closest(".delete-btn");
  if (deleteBtn) {
    const row = deleteBtn.closest(".task-item");
    const id = row?.getAttribute("data-id");
    const index = initialTasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      initialTasks.splice(index, 1);
      renderTasks();
    }
  }
});
`,
      },
    ],
  },
  "accessible-interface-remediation": {
    defaultEntryFileName: "index.html",
    files: [
      {
        id: "proj-html",
        name: "index.html",
        language: "html",
        starter: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notification Settings</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="settings-shell">
    <header class="settings-header">
      <h1>Notification Preferences</h1>
      <p>Configure where deployment alerts and incident digests are delivered.</p>
    </header>

    <form id="settings-form" class="settings-card">
      <!-- TODO (Task 1): Replace the generic div label with <label for="notify-email">,
           add id="notify-email" to the <input>, and replace the save div with a native <button type="submit"> -->
      <div class="field-group">
        <div class="field-label">Notification Email</div>
        <input type="email" placeholder="alex@forge.dev" value="alex@forge.dev" />
      </div>

      <div id="status-banner" role="status" aria-live="polite" class="status-banner">
        Ready to save preferences.
      </div>

      <div class="save-action">Save Preferences</div>
    </form>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notification Settings</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="settings-shell">
    <header class="settings-header">
      <h1>Notification Preferences</h1>
      <p>Configure where deployment alerts and incident digests are delivered.</p>
    </header>

    <form id="settings-form" class="settings-card">
      <div class="field-group">
        <label for="notify-email" class="field-label">Notification Email</label>
        <input id="notify-email" name="notifyEmail" type="email" value="alex@forge.dev" required />
      </div>

      <div id="status-banner" role="status" aria-live="polite" class="status-banner">
        Preferences saved for alex@forge.dev.
      </div>

      <button type="submit" class="save-action">Save Preferences</button>
    </form>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        id: "proj-css",
        name: "styles.css",
        language: "css",
        starter: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.settings-shell {
  max-width: 520px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 16px;
}

.settings-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #f8fafc;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.save-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: #38bdf8;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, background-color 180ms ease;
}

/* TODO (Task 2): Add a @media (prefers-reduced-motion: reduce) rule
   that disables or shortens transitions and animations */
  /* FORGE_SLOT_START: accessible-interface-remediation:t2 */
  /* FORGE_SLOT_END: accessible-interface-remediation:t2 */
`,
        solution: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.settings-shell {
  max-width: 520px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 16px;
}

.settings-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #f8fafc;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

input:focus-visible,
.save-action:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

.save-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: #38bdf8;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, background-color 180ms ease;
}

  /* FORGE_SLOT_START: accessible-interface-remediation:t2 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
  /* FORGE_SLOT_END: accessible-interface-remediation:t2 */
`,
      },
      {
        id: "proj-js",
        name: "app.js",
        language: "javascript",
        starter: `const formEl = document.querySelector("#settings-form");
const bannerEl = document.querySelector("#status-banner");

formEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (bannerEl) {
    bannerEl.textContent = "Preferences saved.";
  }
});
`,
        solution: `const formEl = document.querySelector("#settings-form");
const emailInput = document.querySelector("#notify-email");
const bannerEl = document.querySelector("#status-banner");

formEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (bannerEl && emailInput) {
    bannerEl.textContent = \`Preferences saved for \${emailInput.value.trim()}.\`;
  }
});
`,
      },
    ],
  },
  "js-logic-and-data-engine": {
    defaultEntryFileName: "app.js",
    files: [
      {
        id: "proj-html",
        name: "index.html",
        language: "html",
        starter: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Expense Aggregation Engine</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="engine-shell">
    <header class="engine-header">
      <h1>Monthly Infrastructure Spend</h1>
      <p>Active line items aggregated via pure array pipelines</p>
    </header>

    <section class="summary-card" aria-label="Spend Summary">
      <div class="summary-metric">
        <span class="summary-label">Active Items</span>
        <strong id="summary-count">0</strong>
      </div>
      <div class="summary-metric">
        <span class="summary-label">Active Total</span>
        <strong id="summary-total">$0</strong>
      </div>
    </section>

    <ul id="expense-list" class="expense-list"></ul>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Expense Aggregation Engine</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="engine-shell">
    <header class="engine-header">
      <h1>Monthly Infrastructure Spend</h1>
      <p>Active line items aggregated via pure array pipelines</p>
    </header>

    <section class="summary-card" aria-label="Spend Summary">
      <div class="summary-metric">
        <span class="summary-label">Active Items</span>
        <strong id="summary-count">2</strong>
      </div>
      <div class="summary-metric">
        <span class="summary-label">Active Total</span>
        <strong id="summary-total">$420</strong>
      </div>
    </section>

    <ul id="expense-list" class="expense-list">
      <li class="expense-row"><span>Cloud Compute Cluster</span><strong>$180</strong></li>
      <li class="expense-row"><span>Edge CDN &amp; WAF</span><strong>$240</strong></li>
    </ul>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        id: "proj-css",
        name: "styles.css",
        language: "css",
        starter: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.engine-shell {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px;
}

.summary-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.summary-metric strong {
  font-size: 1.5rem;
  color: #38bdf8;
}

.expense-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.expense-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 8px;
  background: #1e293b;
  border: 1px solid #334155;
}
`,
        solution: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.engine-shell {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px;
}

.summary-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.summary-metric strong {
  font-size: 1.5rem;
  color: #38bdf8;
}

.expense-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.expense-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 8px;
  background: #1e293b;
  border: 1px solid #334155;
}
`,
      },
      {
        id: "proj-js",
        name: "app.js",
        language: "javascript",
        starter: `const expenses = [
  { id: "exp-1", label: "Cloud Compute Cluster", amount: 180, active: true },
  { id: "exp-2", label: "Archived Staging Bucket", amount: 95, active: false },
  { id: "exp-3", label: "Edge CDN & WAF", amount: 240, active: true },
];

const summaryCountEl = document.querySelector("#summary-count");
const summaryTotalEl = document.querySelector("#summary-total");
const expenseListEl = document.querySelector("#expense-list");

// TODO (Task 1): Filter expenses where item.active === true,
// compute the total amount (420) using .reduce(), and render it in #summary-total.
function renderExpenseSummary() {
  if (!summaryTotalEl) return;
  // Write your filter + reduce pipeline here
}

renderExpenseSummary();
`,
        solution: `const expenses = [
  { id: "exp-1", label: "Cloud Compute Cluster", amount: 180, active: true },
  { id: "exp-2", label: "Archived Staging Bucket", amount: 95, active: false },
  { id: "exp-3", label: "Edge CDN & WAF", amount: 240, active: true },
];

const summaryCountEl = document.querySelector("#summary-count");
const summaryTotalEl = document.querySelector("#summary-total");
const expenseListEl = document.querySelector("#expense-list");

function renderExpenseSummary() {
  const activeItems = expenses.filter((item) => item.active);
  const totalAmount = activeItems.reduce((sum, item) => sum + item.amount, 0);

  if (summaryCountEl) {
    summaryCountEl.textContent = String(activeItems.length);
  }
  if (summaryTotalEl) {
    summaryTotalEl.textContent = \`$\${totalAmount}\`;
  }
  if (expenseListEl) {
    expenseListEl.innerHTML = activeItems
      .map(
        (item) =>
          \`<li class="expense-row"><span>\${item.label}</span><strong>$\${item.amount}</strong></li>\`
      )
      .join("");
  }
}

renderExpenseSummary();
`,
      },
    ],
  },
  "integrated-api-status-dashboard": {
    defaultEntryFileName: "app.js",
    files: [
      {
        id: "proj-html",
        name: "index.html",
        language: "html",
        starter: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Service Health Dashboard</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="status-shell">
    <header class="status-header">
      <h1>Platform Service Status</h1>
      <span id="status-updated" class="status-badge">Waiting for telemetry...</span>
    </header>

    <div id="error-banner" class="error-banner" hidden></div>

    <!-- TODO (Task 1): Populate #service-grid with at least 3 .service-card elements -->
    <section id="service-grid" class="service-grid" aria-label="Service health cards"></section>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Service Health Dashboard</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="status-shell">
    <header class="status-header">
      <h1>Platform Service Status</h1>
      <span id="status-updated" class="status-badge">All systems monitored</span>
    </header>

    <div id="error-banner" class="error-banner" hidden></div>

    <section id="service-grid" class="service-grid" aria-label="Service health cards">
      <article class="service-card" data-status="operational">
        <h2>API Gateway</h2>
        <p>Operational · 99.98% uptime</p>
      </article>
      <article class="service-card" data-status="operational">
        <h2>Auth &amp; Session Edge</h2>
        <p>Operational · 99.99% uptime</p>
      </article>
      <article class="service-card" data-status="degraded">
        <h2>Realtime Webhook Worker</h2>
        <p>Degraded · Elevated queue latency</p>
      </article>
    </section>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        id: "proj-css",
        name: "styles.css",
        language: "css",
        starter: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.status-shell {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-badge {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.service-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px;
}
`,
        solution: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.status-shell {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-badge {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.service-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px;
}
`,
      },
      {
        id: "proj-js",
        name: "app.js",
        language: "javascript",
        starter: `const SERVICE_DATA = [
  { id: "api-gw", name: "API Gateway", status: "operational", uptime: "99.98%" },
  { id: "auth-edge", name: "Auth & Session Edge", status: "operational", uptime: "99.99%" },
  { id: "webhook-worker", name: "Realtime Webhook Worker", status: "degraded", uptime: "99.40%" },
];

const serviceGridEl = document.querySelector("#service-grid");
const errorBannerEl = document.querySelector("#error-banner");

// TODO (Task 1): Use async/await and try/catch inside loadServices()
// to render SERVICE_DATA as .service-card elements inside #service-grid.
async function loadServices() {
  if (!serviceGridEl) return;
  // Write your async try/catch rendering logic here
}

loadServices();
`,
        solution: `const SERVICE_DATA = [
  { id: "api-gw", name: "API Gateway", status: "operational", uptime: "99.98%" },
  { id: "auth-edge", name: "Auth & Session Edge", status: "operational", uptime: "99.99%" },
  { id: "webhook-worker", name: "Realtime Webhook Worker", status: "degraded", uptime: "99.40%" },
];

const serviceGridEl = document.querySelector("#service-grid");
const errorBannerEl = document.querySelector("#error-banner");

async function fetchServiceSnapshot() {
  return Promise.resolve(SERVICE_DATA);
}

async function loadServices() {
  if (!serviceGridEl) return;
  try {
    const services = await fetchServiceSnapshot();
    serviceGridEl.innerHTML = services
      .map(
        (svc) => \`
        <article class="service-card" data-status="\${svc.status}">
          <h2>\${svc.name}</h2>
          <p>\${svc.status} · \${svc.uptime} uptime</p>
        </article>
      \`
      )
      .join("");
  } catch (err) {
    if (errorBannerEl) {
      errorBannerEl.hidden = false;
      errorBannerEl.textContent = err instanceof Error ? err.message : "Failed to load service status.";
    }
  }
}

loadServices();
`,
      },
    ],
  },
}

/**
 * Resolves a runtime `ExerciseValidationSpec` for a given project, milestone, or task.
 * Prefers explicit `task.validationSpec` authored in `projects.json`, and synthesizes
 * deterministic DOM/CSS/JS assertions when a milestone is verified as a whole.
 */
export function getProjectMilestoneValidationSpec(
  project: Project,
  milestoneId?: string,
  taskId?: string
): ExerciseValidationSpec {
  const milestone: ProjectMilestone | undefined =
    (milestoneId
      ? project.milestones.find((m) => m.id === milestoneId)
      : project.milestones[0]) ?? project.milestones[0]

  if (milestone && taskId) {
    const task: ProjectTask | undefined = milestone.tasks.find((t) => t.id === taskId)
    if (task?.validationSpec && task.validationSpec.assertions.length > 0) {
      return task.validationSpec
    }
  }

  if (milestone) {
    const mergedAssertions: ValidationAssertion[] = []
    const mergedActions: NonNullable<ExerciseValidationSpec["actions"]> = []

    for (const task of milestone.tasks) {
      if (task.validationSpec) {
        if (task.validationSpec.actions) {
          mergedActions.push(...task.validationSpec.actions)
        }
        mergedAssertions.push(...task.validationSpec.assertions)
      }
    }

    if (mergedAssertions.length > 0) {
      return {
        mode: "dom_and_Styles",
        actions: mergedActions.length > 0 ? mergedActions : undefined,
        assertions: mergedAssertions,
      }
    }
  }

  // Fallback runtime DOM & source checks for Module Projects
  return {
    mode: "dom_and_Styles",
    assertions: [
      {
        id: `${project.id}-dom-rendered`,
        label: "Workspace renders semantic project landmarks in the live DOM",
        type: "dom_query",
        selector: "main, header, section, article",
        assertion: "exists",
        expected: true,
        errorMessage: "Ensure your workspace renders semantic HTML landmarks inside the document body.",
      },
      {
        id: `${project.id}-interactive-deliverable`,
        label: "Renders interactive deliverable items inside #feature-output",
        type: "dom_query",
        selector: "#feature-output [data-deliverable-item], #feature-output .milestone-item, #feature-output article",
        assertion: "count_at_least",
        expected: 2,
        errorMessage: "Implement and invoke your rendering logic in app.js or index.html so at least 2 deliverable items appear inside #feature-output.",
      },
    ],
  }
}

/**
 * Generates a runnable zero-setup workspace for any Project,
 * using tailored starter/solution files when available and distinct starter vs. reference
 * solution files for Module Projects.
 */
export function buildProjectWorkspaceFiles(
  project: Project,
  milestoneId?: string,
  taskId?: string
): ProjectPlaygroundWorkspace {
  const customTemplate = PROJECT_TEMPLATES[project.id]
  const validationSpec = getProjectMilestoneValidationSpec(project, milestoneId, taskId)

  if (customTemplate) {
    const solutionFiles: Record<string, string> = {}
    const files: PlaygroundFile[] = customTemplate.files.map((f) => {
      solutionFiles[f.id] = f.solution
      solutionFiles[f.name] = f.solution
      return {
        id: f.id,
        name: f.name,
        language: f.language,
        code: f.starter,
      }
    })

    return {
      runtime: "vanilla",
      entryFile: "index.html",
      title: project.title,
      files,
      solutionFiles,
      activeFileId: customTemplate.activeFileId,
      validationSpec,
    }
  }

  const allProjectTasks = project.milestones.flatMap((m) => m.tasks || [])
  const taskTitles = allProjectTasks.slice(0, 6).map((t) => t.title)
  const milestoneList = project.milestones.map((m) => m.title)
  const allSpecText = allProjectTasks
    .map((t) => `${t.title} ${t.description || ""} ${(t.hints || []).join(" ")}`)
    .join(" ")

  // Extract any referenced CSS custom properties (--var-name) so the reference solution defines them all
  const referencedCssVars = Array.from(
    new Set(Array.from(allSpecText.matchAll(/(--[a-z0-9-]+)/gi)).map((m) => m[1].toLowerCase()))
  )
  const extraRootVarLines = referencedCssVars
    .map((v) => `  ${v}: #38bdf8;`)
    .join("\n")

  // Extract any referenced HTML tag names (<tag>) so the reference solution includes them all
  const referencedTags = Array.from(
    new Set(
      Array.from(allSpecText.matchAll(/<([a-z][a-z0-9-]*)[^>]*>/gi)).map((m) =>
        m[1].toLowerCase()
      )
    )
  ).filter(
    (tag) =>
      ![
        "html",
        "head",
        "body",
        "meta",
        "title",
        "link",
        "script",
        "main",
        "header",
        "nav",
        "section",
        "article",
        "footer",
        "form",
        "label",
        "input",
        "button",
        "ul",
        "li",
        "h1",
        "h2",
        "p",
        "span",
        "div",
        "img",
        "a",
      ].includes(tag)
  )
  const extraSemanticMarkup = referencedTags
    .map((tag) => `<${tag} class="arch-extension" data-tag="${tag}">${tag} element</${tag}>`)
    .join("\n      ")

  const starterHtmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.title}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="project-shell">
    <header class="project-hero">
      <p class="eyebrow">MODULE PROJECT · ${project.difficulty.toUpperCase()}</p>
      <h1>${project.title}</h1>
      <p class="subtitle">${project.subtitle || project.description}</p>
    </header>

    <section class="workbench-card" aria-labelledby="stage-heading">
      <div class="workbench-header">
        <h2 id="stage-heading">Interactive Deliverable Stage</h2>
        <button id="run-feature-btn" type="button" class="primary-btn">Run Deliverable Check</button>
      </div>
      <!-- TODO: Implement your module project structure and render deliverable items into #feature-output -->
      <div id="feature-output" class="feature-grid"></div>
    </section>
  </main>
  <script src="app.js"></script>
</body>
</html>`

  const solutionHtmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.title}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-banner">
    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' rx='8' fill='%2338bdf8'/></svg>" alt="${project.title} emblem" />
    <nav aria-label="Module project navigation">
      <a href="#stage-heading">Deliverable</a>
      <a href="#filter-form">Controls</a>
      <a href="#project-footer">Architecture</a>
    </nav>
  </header>

  <main class="project-shell">
    <section class="project-hero">
      <p class="eyebrow">MODULE PROJECT · ${project.difficulty.toUpperCase()}</p>
      <h1>${project.title}</h1>
      <p class="subtitle">${project.subtitle || project.description}</p>
    </section>

    <section class="workbench-card" aria-labelledby="stage-heading">
      <div class="workbench-header">
        <h2 id="stage-heading">Interactive Deliverable Stage</h2>
        <form id="filter-form" class="filter-controls" aria-label="Filter deliverables">
          <label for="filter-input">Filter</label>
          <input id="filter-input" type="search" placeholder="Filter module tasks..." />
          <button id="run-feature-btn" type="submit" class="primary-btn">Run Deliverable Check</button>
        </form>
      </div>

      <div id="feature-output" class="feature-grid" role="region" aria-live="polite">
        <article class="milestone-item" data-deliverable-item="1">
          <h3>Architecture Foundation</h3>
          <p>Verified semantic landmarks and layout system.</p>
        </article>
        <article class="milestone-item" data-deliverable-item="2">
          <h3>Interactive State &amp; Accessibility</h3>
          <p>Verified keyboard navigation, focus ring, and state handlers.</p>
        </article>
      </div>

      <ul class="architecture-checklist">
        <li>Semantic HTML5 landmarks</li>
        <li>Responsive CSS Grid &amp; Flexbox tokens</li>
        <li>Accessible interactive DOM state</li>
      </ul>
      ${extraSemanticMarkup}
    </section>
  </main>

  <footer id="project-footer" class="project-footer">
    <p>${project.title} · Reference Architecture</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>`

  const starterCssCode = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 1.5rem;
  line-height: 1.5;
}

.project-shell {
  max-width: 720px;
  margin: 0 auto;
}

.project-hero {
  background: #1e293b;
  color: #f8fafc;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #38bdf8;
  margin-bottom: 0.35rem;
}

.project-hero h1 {
  font-size: 1.45rem;
  margin-bottom: 0.35rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
}

.workbench-card {
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1rem;
  padding: 1.25rem;
}

.workbench-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.primary-btn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 0.65rem;
  font-weight: 700;
  cursor: pointer;
}

/* TODO: Add responsive grid/flex layout tokens and :focus-visible keyboard states */
.feature-grid {
  display: block;
}`

  const solutionCssCode = `:root {
  --surface-bg: #0f172a;
  --surface-card: #1e293b;
  --text-primary: #f8fafc;
  --accent-primary: #38bdf8;
${extraRootVarLines}
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--surface-bg);
  color: var(--text-primary);
  padding: 1.5rem;
  line-height: 1.5;
}

.project-shell {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-hero {
  background: var(--surface-card);
  color: var(--text-primary);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent-primary);
  margin-bottom: 0.35rem;
}

.project-hero h1 {
  font-size: 1.45rem;
  margin-bottom: 0.35rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
}

.workbench-card {
  background: var(--surface-card);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workbench-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn {
  background: var(--accent-primary);
  color: #0f172a;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 0.65rem;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid var(--accent-primary);
  outline-offset: 2px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.milestone-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.2);
  font-size: 0.85rem;
}`

  const starterJsCode = `// ${project.title} — Module Project Starter
const deliverables = ${JSON.stringify(
    taskTitles.length > 0 ? taskTitles : milestoneList,
    null,
    2
  )};

const outputEl = document.getElementById("feature-output");
const actionBtn = document.getElementById("run-feature-btn");

// TODO: Implement renderDeliverables(items) and wire interactive event listeners
function renderDeliverables(items) {
  if (!outputEl) return;
  // Write your DOM rendering and state update logic here
}
`

  const solutionJsCode = `// ${project.title} — Reference Module Project Implementation
const deliverables = ${JSON.stringify(
    taskTitles.length > 0 ? taskTitles : milestoneList,
    null,
    2
  )};

const outputEl = document.getElementById("feature-output");
const actionBtn = document.getElementById("run-feature-btn");
const filterForm = document.getElementById("filter-form");
const filterInput = document.getElementById("filter-input");

function renderDeliverables(items) {
  if (!outputEl) return;
  outputEl.innerHTML = items
    .map(
      (item, idx) => \`
      <article class="milestone-item" data-deliverable-item="\${idx + 1}">
        <h3>Deliverable \${idx + 1}: \${item}</h3>
        <p>Verified module requirement</p>
      </article>
    \`
    )
    .join("");
}

filterForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = (filterInput?.value || "").trim().toLowerCase();
  const filtered = query
    ? deliverables.filter((item) => item.toLowerCase().includes(query))
    : deliverables;
  renderDeliverables(filtered);
});

actionBtn?.addEventListener("click", () => {
  renderDeliverables(deliverables);
});

renderDeliverables(deliverables);
`

  const files: PlaygroundFile[] = [
    { id: "proj-html", name: "index.html", language: "html", code: starterHtmlCode },
    { id: "proj-css", name: "styles.css", language: "css", code: starterCssCode },
    { id: "proj-js", name: "app.js", language: "javascript", code: starterJsCode },
  ]

  return {
    runtime: "vanilla",
    entryFile: "index.html",
    title: project.title,
    files,
    solutionFiles: {
      "proj-html": solutionHtmlCode,
      "index.html": solutionHtmlCode,
      "proj-css": solutionCssCode,
      "styles.css": solutionCssCode,
      "proj-js": solutionJsCode,
      "app.js": solutionJsCode,
    },
    activeFileId: "proj-js",
    validationSpec,
  }
}

