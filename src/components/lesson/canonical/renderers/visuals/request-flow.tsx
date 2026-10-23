import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Monitor,
  Server,
  ArrowRight,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sparkles,
  Terminal,
} from "lucide-react";
import { motion } from "framer-motion";

export type FlowSide = "client" | "network" | "server";

export interface FlowStep {
  label: string;
  detail: string;
  eli5?: string;
  httpSnippet?: string;
  side: FlowSide;
}

export interface RequestFlowScenario {
  id: string;
  badge: string;
  title: string;
  tone: "emerald" | "amber" | "rose" | "sky";
  eli5Summary: string;
  steps: FlowStep[];
}

export interface RequestFlowData {
  steps?: FlowStep[];
  defaultScenarioId?: string;
}

const BUILTIN_SCENARIOS: RequestFlowScenario[] = [
  {
    id: "200-ok",
    badge: "200 OK",
    title: "Happy Path (Page Found)",
    tone: "emerald",
    eli5Summary:
      "Real-World Analogy: You order a pepperoni pizza. The waiter walks to the kitchen, the chef bakes it, and the waiter brings it hot to your table!",
    steps: [
      {
        side: "client",
        label: "1. Browser Writes the Order (Request)",
        detail:
          "You type a URL or click a link. The browser packs an HTTP GET request envelope asking for the page.",
        eli5: "You tell the waiter: 'One homepage, please!'",
        httpSnippet: "GET /index.html HTTP/1.1\nHost: forge.dev\nAccept: text/html",
      },
      {
        side: "network",
        label: "2. Packet Zips Across the Internet",
        detail:
          "DNS looks up the server's phone number (IP address) and your request packet races through fiber-optic cables.",
        eli5: "The waiter sprints across the dining room toward the kitchen door.",
        httpSnippet: "DNS Lookup: forge.dev -> 76.76.21.21 (TLS Handshake Complete)",
      },
      {
        side: "server",
        label: "3. Server Finds the Resource (200 OK)",
        detail:
          "The web server checks its routes, finds the exact HTML/JSON you asked for, and stamps '200 OK' on the box.",
        eli5: "The chef says 'Got it right here!' and boxes up your fresh pizza.",
        httpSnippet: "HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\nCache-Control: max-age=60",
      },
      {
        side: "network",
        label: "4. Response Streams Back to You",
        detail:
          "The response headers and HTML payload travel back across the network to your waiting browser.",
        eli5: "The waiter carries the hot pizza tray back to your table.",
        httpSnippet: "Payload: <!DOCTYPE html><html><head><title>Forge</title>...",
      },
      {
        side: "client",
        label: "5. Browser Paints the Screen",
        detail:
          "The browser unpacks the HTML, builds the DOM tree, applies CSS styles, and draws the interactive page!",
        eli5: "You open the pizza box and dig in—the webpage is live on your screen!",
        httpSnippet: "DOM Ready -> First Contentful Paint (14ms)",
      },
    ],
  },
  {
    id: "404-not-found",
    badge: "404 Not Found",
    title: "Missing Page (Wrong Address)",
    tone: "amber",
    eli5Summary:
      "Real-World Analogy: You ask the waiter for a 'Unicorn Burger'. The chef checks the entire kitchen and says 'Sorry, that's not on our menu!'",
    steps: [
      {
        side: "client",
        label: "1. Browser Asks for a Mystery URL",
        detail:
          "You visit /secret-dragon-lair. The browser sends a totally normal GET request—it doesn't know yet that the page doesn't exist.",
        eli5: "You confidently order a Unicorn Burger with extra stardust.",
        httpSnippet: "GET /secret-dragon-lair HTTP/1.1\nHost: forge.dev",
      },
      {
        side: "network",
        label: "2. Request Travels to the Server",
        detail:
          "The network delivers the request cleanly. The cables don't care whether the URL is real or a typo!",
        eli5: "The waiter dutifully carries your ticket into the kitchen.",
        httpSnippet: "TCP Packet -> Destination Port 443",
      },
      {
        side: "server",
        label: "3. Server Checks Routes -> Nothing Matches!",
        detail:
          "The server searches every folder and route handler for '/secret-dragon-lair' and comes up empty-handed. It stamps 404 Not Found.",
        eli5: "The chef checks every fridge: 'We don't have unicorns here! Tell them 404!'",
        httpSnippet: "HTTP/1.1 404 Not Found\nContent-Type: text/html",
      },
      {
        side: "network",
        label: "4. The 404 Response Heads Back",
        detail:
          "Important mental model: the conversation SUCCEEDED (the server answered!), even though the answer was 'I don't have that file.'",
        eli5: "The waiter walks back with an apology note instead of a burger.",
        httpSnippet: "Payload: <main><h1>404 — Page Not Found</h1></main>",
      },
      {
        side: "client",
        label: "5. Browser Shows the Friendly 404 Screen",
        detail:
          "The browser reads status 404 and renders the site's custom 'Page Not Found' screen so the user can navigate home.",
        eli5: "You see a cute 'Oops, wrong turn!' page and click 'Back Home'.",
        httpSnippet: "Rendered: 404 Fallback UI (No crash!)",
      },
    ],
  },
  {
    id: "500-error",
    badge: "500 Server Error",
    title: "Backend Crash (Kitchen on Fire)",
    tone: "rose",
    eli5Summary:
      "Real-World Analogy: You ordered regular fries (totally valid!), but the kitchen stove exploded. It's not your fault—the server had an accident!",
    steps: [
      {
        side: "client",
        label: "1. Browser Sends a Valid Request",
        detail:
          "You click 'Save Profile' or load your dashboard. Your browser sends a completely valid HTTP request.",
        eli5: "You politely ask for a normal plate of french fries.",
        httpSnippet: "POST /api/save-profile HTTP/1.1\nContent-Type: application/json",
      },
      {
        side: "network",
        label: "2. Request Arrives Safely at Server",
        detail:
          "The request crosses the internet with zero network issues and reaches the backend server.",
        eli5: "The waiter hands your ticket to the kitchen.",
        httpSnippet: "Body: { \"username\": \"pixel_wizard\" }",
      },
      {
        side: "server",
        label: "3. BOOM! Unhandled Exception on Server",
        detail:
          "While running backend code, the database is offline or a null pointer crashes the handler. The server catches fire and emits 500 Internal Server Error.",
        eli5: "The deep fryer sparks and the smoke alarm goes off in the kitchen!",
        httpSnippet: "HTTP/1.1 500 Internal Server Error\nError: DatabaseConnectionTimeout",
      },
      {
        side: "network",
        label: "4. Error Status Returns Across Network",
        detail:
          "Instead of crashing silently, HTTP guarantees the server sends back a 500 status code so the browser isn't left hanging forever.",
        eli5: "The waiter runs out coughing: 'So sorry, our kitchen broke! Try again in a minute!'",
        httpSnippet: "Payload: { \"error\": \"Internal Server Error\", \"retryable\": true }",
      },
      {
        side: "client",
        label: "5. Browser Shows a Retry Banner",
        detail:
          "Because it's a 500 (server fault, not user typo), well-built frontend apps keep the user's form input safe and offer a 'Retry' button.",
        eli5: "Your app keeps your typed work safe and shows a friendly 'Try Again' button.",
        httpSnippet: "UI State: status='error' -> Show Retry Toast",
      },
    ],
  },
];

export function RequestFlow({
  config,
  visualData,
}: {
  config?: RequestFlowData;
  visualData?: Record<string, unknown>;
}) {
  const customSteps =
    config?.steps && config.steps.length > 0
      ? config.steps
      : (visualData?.steps as FlowStep[] | undefined);

  const scenarios: RequestFlowScenario[] =
    customSteps && customSteps.length > 0
      ? [
          {
            id: "lesson-custom",
            badge: "Lesson Trace",
            title: "Topic Exchange Trace",
            tone: "sky",
            eli5Summary:
              "Step through how the browser, network, and server pass messages back and forth in this lesson's scenario.",
            steps: customSteps,
          },
          ...BUILTIN_SCENARIOS,
        ]
      : BUILTIN_SCENARIOS;

  const [activeScenarioId, setActiveScenarioId] = useState<string>(
    config?.defaultScenarioId ?? scenarios[0].id,
  );
  const [step, setStep] = useState(0);

  const activeScenario =
    scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0];
  const steps = activeScenario.steps;
  const safeStep = Math.min(step, steps.length - 1);
  const current = steps[safeStep] ?? steps[0];
  const atEnd = safeStep >= steps.length - 1;

  const sideActive = (side: FlowSide) => current?.side === side;

  const handleSelectScenario = (id: string) => {
    setActiveScenarioId(id);
    setStep(0);
  };

  const toneBadgeClass: Record<RequestFlowScenario["tone"], string> = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-500",
    sky: "border-sky-500/40 bg-sky-500/10 text-sky-500",
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-lesson-border bg-lesson-surface p-4 sm:p-6">
      {/* Top Scenario Switcher Pills */}
      <div className="flex flex-col gap-2.5 border-b border-lesson-border pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-lesson-text-primary">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span>Choose an HTTP Scenario to Simulate:</span>
        </div>
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
          role="tablist"
          aria-label="HTTP Scenarios"
        >
          {scenarios.map((sc) => {
            const isSelected = sc.id === activeScenario.id;
            return (
              <button
                key={sc.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectScenario(sc.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-semibold transition-all",
                  isSelected
                    ? toneBadgeClass[sc.tone]
                    : "border-lesson-border bg-lesson-bg/50 text-lesson-text-muted hover:text-lesson-text-primary",
                )}
              >
                {sc.tone === "emerald" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {sc.tone === "amber" && <AlertTriangle className="h-3.5 w-3.5" />}
                {sc.tone === "rose" && <Flame className="h-3.5 w-3.5" />}
                <span>{sc.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-World Analogy Banner for the Active Scenario */}
      <div className="rounded-xl border border-lesson-border/80 bg-lesson-bg/50 px-3.5 py-2.5 text-xs leading-relaxed text-lesson-text-secondary">
        <span className="font-semibold text-lesson-text-primary">{activeScenario.title}: </span>
        {activeScenario.eli5Summary}
      </div>

      {/* The Boundary Diagram */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 rounded-2xl border border-lesson-border bg-lesson-surface-subtle p-3.5 sm:p-5">
        <Endpoint
          icon={Monitor}
          title="Client"
          subtitle="Your Browser"
          active={sideActive("client")}
        />

        <div className="flex flex-col items-center gap-1.5">
          <span className="rounded-full border border-lesson-border bg-lesson-surface px-2 py-0.5 font-mono text-[10px] font-bold text-lesson-text-secondary">
            Hop {safeStep + 1}/{steps.length}
          </span>
          <div className="relative h-1 w-14 overflow-visible rounded bg-lesson-border sm:w-28">
            <motion.span
              key={`${activeScenario.id}-${safeStep}`}
              className={cn(
                "absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full shadow-md",
                activeScenario.tone === "rose" && safeStep >= 2
                  ? "bg-rose-500 shadow-rose-500/50"
                  : activeScenario.tone === "amber" && safeStep >= 2
                    ? "bg-amber-500 shadow-amber-500/50"
                    : "bg-emerald-500 shadow-emerald-500/50",
              )}
              initial={{ left: current?.side === "server" ? "0%" : "100%", opacity: 0.4 }}
              animate={{
                left: sideActive("client") ? "0%" : sideActive("server") ? "92%" : "46%",
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
            />
          </div>
          <span
            className={cn(
              "font-mono text-[9px] uppercase tracking-widest transition-colors",
              sideActive("network") ? "text-primary font-bold" : "text-lesson-text-muted/60",
            )}
          >
            {safeStep < 2 ? "request →" : safeStep === 2 ? "processing" : "← response"}
          </span>
        </div>

        <Endpoint
          icon={Server}
          title="Server"
          subtitle="Web Service"
          active={sideActive("server")}
        />
      </div>

      {/* Current Step Detail + Live HTTP Wire Packet Inspector */}
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-[var(--m-accent-line)] bg-[var(--m-accent-soft)] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--m-accent)]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--m-accent)] font-mono text-[10px] text-lesson-bg">
              {safeStep + 1}
            </span>
            <span>{current?.label}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-lesson-text-primary">
            {current?.detail}
          </p>
          {current?.eli5 && (
            <p className="mt-2 rounded-lg border border-lesson-border/60 bg-lesson-surface/70 px-3 py-1.5 text-xs italic text-lesson-text-secondary">
              💡 <strong>In plain English:</strong> {current.eli5}
            </p>
          )}
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200">
          <div className="mb-2 flex items-center justify-between border-b border-zinc-800 pb-1.5 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-primary" />
              HTTP Wire Inspector
            </span>
            <span className="uppercase">{current?.side}</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] leading-relaxed text-emerald-300">
            {current?.httpSnippet ??
              `# Step ${safeStep + 1} (${current?.side.toUpperCase()})\nStatus: ${activeScenario.badge}`}
          </pre>
        </div>
      </div>

      {/* Step ticks + interactive controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Step ${i + 1}: ${s.label}`}
              onClick={() => setStep(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === safeStep
                  ? "w-7 bg-primary"
                  : i < safeStep
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-lesson-border",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {safeStep > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-lesson-border bg-lesson-bg px-3 text-xs font-medium text-lesson-text-secondary hover:text-lesson-text-primary"
            >
              Prev
            </button>
          )}
          <button
            type="button"
            onClick={() => setStep((s) => (atEnd ? 0 : s + 1))}
            style={{ backgroundColor: "var(--m-accent)", color: "var(--lesson-bg)" }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-transform hover:-translate-y-px"
          >
            {atEnd ? (
              <>
                <RotateCcw className="h-4 w-4" /> Replay Scenario
              </>
            ) : safeStep === 0 ? (
              <>
                <Play className="h-4 w-4" /> Step Through {activeScenario.badge}
              </>
            ) : (
              <>
                Next Hop ({safeStep + 2}/{steps.length}) <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Endpoint({
  icon: Icon,
  title,
  subtitle,
  active,
}: {
  icon: typeof Monitor;
  title: string;
  subtitle: string;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 sm:p-4 text-center transition-all duration-300",
        active
          ? "border-[var(--m-accent-line)] bg-[var(--m-accent-soft)] shadow-[0_0_20px_var(--m-glow)]"
          : "border-transparent",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-colors",
          active
            ? "bg-[var(--m-accent)] text-lesson-bg"
            : "bg-lesson-surface text-lesson-text-muted ring-1 ring-lesson-border",
        )}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <div className="leading-tight">
        <p className="text-xs sm:text-sm font-bold text-lesson-text-primary">{title}</p>
        <p className="text-[10px] sm:text-[11px] text-lesson-text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
