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

    <!-- TODO (Task 3): Wrap the primary content in a <main> landmark and use a <section>
         with a <dl> (<dt>/<dd> pairs) for "Currently Learning" and "Availability". -->
    <div class="profile-body">
      <div class="status-panel">
        <h2>Current Engineering Focus</h2>
        <p>Semantic HTML5, CSS Architecture & Accessible UI Primitives</p>
      </div>

      <!-- TODO (Task 2): Wrap this social links list in <nav aria-label="Social links">
           with an unordered list (<ul>) and at least 3 <a href="..."> links. -->
      <div class="links-wrapper">
        <ul class="social-links">
          <li><a href="https://github.com">GitHub Repositories</a></li>
          <li><a href="https://example.com/projects">Featured Architecture Case Studies</a></li>
        </ul>
      </div>
    </div>

    <!-- TODO (Task 3): Replace this generic <div> with a semantic <footer> landmark. -->
    <div class="profile-footer">
      <small>Built with zero-framework Semantic HTML5 & CSS Custom Properties</small>
    </div>
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

    <main class="profile-body">
      <section class="status-panel" aria-labelledby="focus-heading">
        <h2 id="focus-heading">Current Engineering Focus</h2>
        <dl class="status-facts">
          <dt>Currently Learning</dt>
          <dd>Semantic HTML5 &amp; Accessible CSS Systems</dd>
          <dt>Availability</dt>
          <dd>Open for Frontend Engineering Roles</dd>
        </dl>
      </section>

      <nav aria-label="Social links" class="links-wrapper">
        <ul class="social-links">
          <li><a href="https://github.com">GitHub Repositories</a></li>
          <li><a href="https://example.com/projects">Featured Architecture Case Studies</a></li>
          <li><a href="mailto:alex@example.com">Contact &amp; Engineering Notes</a></li>
        </ul>
      </nav>
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
  --bg: #0f172a;
  --surface: #1e293b;
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
  list-style: none;
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

.social-links a:hover {
  background: rgba(56, 189, 248, 0.22);
  transform: translateY(-1px);
}

/* TODO (Milestone 2 · Task 6): Add a high-contrast :focus-visible outline for keyboard users */

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
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
  --accent: #38bdf8;
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
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.social-links a:hover {
  background: rgba(56, 189, 248, 0.22);
  transform: translateY(-1px);
}

.social-links a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

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
  --surface-card: #ffffff;
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
  width: 100%;
  background: var(--surface-card, #ffffff);
  border-radius: 16px;
  padding: 4px;
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
.cta-button {
  background: transparent;
  border: none;
  padding: 2px;
  font-weight: 600;
  cursor: pointer;
}
`,
        solution: `:root {
  --surface-card: #ffffff;
  --border-subtle: #e2e8f0;
  --brand-accent: #4f46e5;
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
  box-sizing: border-box;
  width: 100%;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px -10px rgba(15, 23, 42, 0.08);
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
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

/* TODO (Task 1): Lay out .metrics-grid using display: grid and gap: 16px */
.metrics-grid {
  display: block;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
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

// TODO (Task 1): Render initialTasks into #task-list as <li class="task-item"> elements
// with .toggle-btn and .delete-btn buttons, and update #task-count.
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

  // Fallback runtime DOM & source checks for advanced capstone projects
  return {
    mode: "dom_and_Styles",
    assertions: [
      {
        id: `${project.id}-dom-rendered`,
        label: "Workspace renders interactive project markup in the live DOM",
        type: "dom_query",
        selector: "main, header, section, article, [id]",
        assertion: "exists",
        expected: true,
        errorMessage: "Ensure your workspace renders semantic HTML elements inside the document body.",
      },
      {
        id: `${project.id}-interactive-control`,
        label: "Includes interactive controls or structured items",
        type: "js_evaluation",
        expression:
          "Boolean(document.querySelectorAll('button, a, input, select, .milestone-item, .task-item, .pricing-card, .metric-card').length >= 2)",
        expected: true,
        errorMessage: "Render interactive controls or task items in the live preview.",
      },
    ],
  }
}

/**
 * Generates a runnable zero-setup Playground workspace for any Project,
 * using tailored starter/solution files when available.
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

  const milestoneList = project.milestones.map((m) => m.title)
  const taskTitles = project.milestones
    .flatMap((m) => m.tasks || [])
    .slice(0, 6)
    .map((t) => t.title)

  const htmlCode = `<!DOCTYPE html>
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
      <p class="eyebrow">FORGE PROJECT WORKSPACE · ${project.difficulty.toUpperCase()}</p>
      <h1>${project.title}</h1>
      <p class="subtitle">${project.subtitle || project.description}</p>
    </header>

    <section class="workbench-card">
      <div class="workbench-header">
        <h2>Interactive Feature Stage</h2>
        <button id="run-feature-btn" class="primary-btn">Run Feature Action</button>
      </div>
      <div id="feature-output" class="feature-grid"></div>
    </section>
  </main>
  <script src="app.js"></script>
</body>
</html>`

  const cssCode = `* {
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

.workbench-header h2 {
  font-size: 1rem;
  color: #f8fafc;
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

.feature-grid {
  display: grid;
  gap: 0.65rem;
}

.milestone-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.2);
  font-size: 0.85rem;
}`

  const jsCode = `// ${project.title} — Forge Project Workspace
const milestones = ${JSON.stringify(
    taskTitles.length > 0 ? taskTitles : milestoneList,
    null,
    2
  )};

const outputEl = document.getElementById("feature-output");
const actionBtn = document.getElementById("run-feature-btn");

function renderStage(items) {
  if (!outputEl) return;
  outputEl.innerHTML = items
    .map(
      (item, idx) => \`
      <div class="milestone-item">
        <span><strong>Task \${idx + 1}:</strong> \${item}</span>
        <span>Ready</span>
      </div>
    \`
    )
    .join("");
}

actionBtn?.addEventListener("click", () => {
  const timestamp = new Date().toLocaleTimeString();
  renderStage([
    ...milestones,
    "Interactive event verified at " + timestamp,
  ]);
});

renderStage(milestones);
`

  const files: PlaygroundFile[] = [
    { id: "proj-html", name: "index.html", language: "html", code: htmlCode },
    { id: "proj-css", name: "styles.css", language: "css", code: cssCode },
    { id: "proj-js", name: "app.js", language: "javascript", code: jsCode },
  ]

  return {
    runtime: "vanilla",
    entryFile: "index.html",
    title: project.title,
    files,
    solutionFiles: {
      "proj-html": htmlCode,
      "proj-css": cssCode,
      "proj-js": jsCode,
    },
    activeFileId: "proj-js",
    validationSpec,
  }
}
