# Fix Module Script Import Errors Across Initial Load & Route Navigation

Eliminate the `"Importing a module script failed."` runtime failure during initial application bootstrap and client-side route transitions in Forge Academia so every curriculum view, lesson studio, and interactive preview loads reliably.

## User Review & Critical Decisions

> [!IMPORTANT]
> Your preferences from the clarification step have been incorporated into this plan. Please review the architectural approach below and click **Proceed** to apply the fix.

- **Confirmed Decision — Target Scope**: Fix module script loading across all routes, lessons, and interactive previews rather than patching a single page.
- **Confirmed Decision — Primary Failure Surface**: Initial application bootstrap and route-to-route navigation in the preview environment.

---

## 1. Overview & Core Concept

- **What It Does**: Ensures that all client-side ES module scripts, lazy-loaded route chunks, and third-party dependencies are consistently served with valid JavaScript module responses and pre-bundled upfront by the dev server.
- **Target Audience / Persona**: Learners and educators navigating across Forge Academia's dashboard, curriculum modules, interactive lessons, and code playground.
- **Key Value**: Prevents mid-navigation module fetch failures (`504 Outdated Optimize Dep` and SSR HTML fallback responses for client scripts) that cause WebKit/Safari and modern browsers to abort with `TypeError: Importing a module script failed.`

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Initial App Load**: Opening the root studio or any deep-linked route hydrates the client router cleanly without triggering the root error screen.
  2. **Route Navigation**: Clicking between **Atelier Studio Desk**, **Curriculum Modules**, **Lessons**, **Live Code Playground**, **Debug Lab**, and **Projects** loads route modules seamlessly without page crashes.
  3. **Graceful Chunk Recovery**: If a transient dev-server rebuild invalidates a module hash, the client recovers cleanly via Vite's preload error handler without surfacing a false crash telemetry alert.
- **Visual Identity & Theme**:
  - Preserves Forge Academia's existing **Creative Atelier** aesthetic (`--background: #FFFDF9` light / `#101A32` dark, `--primary: #4F6BFF`, Plus Jakarta Sans + DM Sans + JetBrains Mono typography) with zero visual regressions.
- **Interactive Feedback & Motion**:
  - Route transitions and interactive lesson previews remain smooth and uninterrupted.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Comprehensive Client Module Request Classification & Upfront Dependency Pre-Bundling**
  - *Chosen Approach*: Expand the request header classifier in the Vite server configuration so every module path under `/node_modules/`, `/app/applet/`, and `/src/` receives proper script headers when reverse proxies strip `sec-fetch-dest`, and pre-bundle all route-level UI/editor packages (`@codemirror/*`, `@monaco-editor/react`, `@babel/standalone`, `@radix-ui/*`, `recharts`, `zustand`, `sonner`, `cmdk`, `vaul`) in `optimizeDeps.include`.
  - *Why*: In WebKit/Safari, `"Importing a module script failed."` is thrown whenever a `<script type="module">` or dynamic `import()` receives either an SSR HTML fallback response (due to stripped `sec-fetch-dest` headers) or a `504 Outdated Optimize Dep` response triggered when navigating to a route whose dependencies were not pre-bundled at server startup.
  - *Alternatives Considered*: Relying solely on a `window.location.reload()` retry in the error boundary was rejected because it still flashes an error state and reports an unhandled exception before reloading.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Browser / Preview Iframe Client                     │
│  ┌───────────────────────────┐       ┌───────────────────────────────┐  │
│  │ Initial Entry & Preloads  │──────▶│ TanStack Router Lazy Chunks   │  │
│  │ (/@id/virtual:client...)  │       │ (?tsr-split=component)        │  │
│  └─────────────┬─────────────┘       └───────────────┬───────────────┘  │
└────────────────┼─────────────────────────────────────┼──────────────────┘
                 │ ES Module Fetch                     │ Dynamic import()
                 ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                Vite Dev Server Middleware Pipeline                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 1. Runtime Security & Module Header Classifier                    │  │
│  │    • Restores sec-fetch-dest: script for /src/*, /node_modules/*, │  │
│  │      /@*, and ?tsr-split= requests stripped by reverse proxy      │  │
│  └───────────────────────────────┬───────────────────────────────────┘  │
│                                  ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 2. Pre-Bundled Dependency Cache (optimizeDeps)                    │  │
│  │    • Upfront bundle of CodeMirror, Monaco, Babel, Radix, Recharts │  │
│  │    • Prevents mid-navigation 504 Outdated Optimize Dep resets     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - No changes to persistent learner progress, curriculum manifest data, or lesson schemas.
- **Interactive Component & State Mapping**:
  - **Server Request Classifier**: Ensures all `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.json`, and imported `.css` module requests bypass the SSR HTML fallback and resolve as valid JavaScript modules.
  - **Dependency Optimizer**: Pre-bundles all interactive route dependencies at server startup so route transitions never invalidate active module URLs.
