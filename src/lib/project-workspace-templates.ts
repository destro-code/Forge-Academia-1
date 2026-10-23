import type { Project } from "./types"
import type { PlaygroundFile, PlaygroundRuntime } from "./types/playground"

export interface ProjectPlaygroundWorkspace {
  runtime: PlaygroundRuntime
  entryFile: string
  title: string
  files: PlaygroundFile[]
  activeFileId: string
}

/**
 * Generates a complete, runnable zero-setup Playground workspace
 * for any Project so learners can build projects right in the browser
 * without installing local dependencies.
 */
export function buildProjectWorkspaceFiles(project: Project): ProjectPlaygroundWorkspace {
  const milestoneList = project.milestones.map((m) => m.title)
  const taskTitles = project.milestones
    .flatMap((m) => m.tasks || [])
    .slice(0, 6)
    .map((t) => t.title)

  const files: PlaygroundFile[] = [
    {
      id: "proj-html",
      name: "index.html",
      language: "html",
      code: `<!DOCTYPE html>
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
      <span class="badge">FORGE PROJECT STUDIO • ${project.difficulty.toUpperCase()}</span>
      <h1>${project.title}</h1>
      <p class="subtitle">${project.subtitle || project.description}</p>
    </header>

    <section class="workbench-card">
      <div class="workbench-header">
        <h2>Interactive Feature Stage</h2>
        <button id="run-feature-btn" class="primary-btn">Test Feature Action</button>
      </div>
      <div id="feature-output" class="feature-grid"></div>
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
      code: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #FAF6F0;
  color: #1C1814;
  padding: 1.5rem;
  line-height: 1.5;
}

.project-shell {
  max-width: 720px;
  margin: 0 auto;
}

.project-hero {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: #FFFFFF;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(110, 106, 246, 0.45);
}

.badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #FBBF24;
  background: rgba(110, 106, 246, 0.25);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}

.project-hero h1 {
  font-size: 1.45rem;
  margin-bottom: 0.35rem;
}

.subtitle {
  color: #C7D2FE;
  font-size: 0.875rem;
}

.workbench-card {
  background: #FFFDF9;
  border: 1px solid #E5DFD3;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 8px 24px -12px rgba(30, 27, 75, 0.08);
}

.workbench-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.workbench-header h2 {
  font-size: 1rem;
  color: #1E1B4B;
}

.primary-btn {
  background: #6E6AF6;
  color: #FFFFFF;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.primary-btn:hover {
  background: #5B57E6;
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
  background: #F5F3FF;
  border: 1px solid rgba(110, 106, 246, 0.25);
  font-size: 0.85rem;
}

.status-pill {
  font-size: 0.7rem;
  font-weight: 700;
  color: #2E6B4E;
  background: #E8F8F2;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
}`,
    },
    {
      id: "proj-js",
      name: "app.js",
      language: "javascript",
      code: `// ${project.title} — Zero-Setup Forge Project Workspace
// Tags: ${(project.tags || []).join(", ")}
// Edit index.html, styles.css, and app.js right here and check off your project tasks!

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
        <span><strong>Step #\${idx + 1}:</strong> \${item}</span>
        <span class="status-pill">Active</span>
      </div>
    \`
    )
    .join("");
}

actionBtn?.addEventListener("click", () => {
  const timestamp = new Date().toLocaleTimeString();
  console.log("✅ Executed feature action for ${project.title} at " + timestamp);
  renderStage([
    ...milestones,
    "Interactive event verified at " + timestamp,
  ]);
});

// Initial render
renderStage(milestones);
console.log("🚀 ${project.title} starter workspace ready!");
`,
    },
  ]

  return {
    runtime: "vanilla",
    entryFile: "index.html",
    title: project.title,
    files,
    activeFileId: "proj-js",
  }
}
