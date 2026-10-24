/**
 * Forge Spirit Mentor Bank — Analogies, Developer Jokes, Interview Traps & Live Practice Snippets
 *
 * Powers the Hooded Forge Spirit mascot across the Dashboard, Lesson Player,
 * In-Lesson Audio Narration, Live Code Drawer, and Mock Interview Coach.
 */

export interface LessonPracticeSnippet {
  title: string;
  language: "javascript" | "html" | "css";
  starterCode: string;
  challengePrompt: string;
}

export interface LessonInterviewTrap {
  question: string;
  trap: string;
  punchline: string;
  interviewCategory: string;
}

export interface Eli5MentorNote {
  analogyTitle: string;
  hook: string;
  eli5Text: string;
  analogy: string;
  seniorWit: string;
  joke: string;
  watchOut: string;
  interviewTrap: LessonInterviewTrap;
  practiceSnippet: LessonPracticeSnippet;
  visualPreset?: {
    kind: string;
    config: Record<string, unknown>;
  };
}

interface RawMentorSeed {
  analogyTitle: string;
  eli5Text: string;
  seniorWit: string;
  joke: string;
  watchOut: string;
  interviewTrap: LessonInterviewTrap;
  practiceSnippet: LessonPracticeSnippet;
  visualPreset?: {
    kind: string;
    config: Record<string, unknown>;
  };
}

function hydrateNote(seed: RawMentorSeed): Eli5MentorNote {
  return {
    ...seed,
    hook: seed.analogyTitle,
    analogy: seed.eli5Text,
  };
}

const LESSON_SPECIFIC_SEEDS: Record<string, RawMentorSeed> = {
  "lesson-0-1-1": {
    analogyTitle: "🍽️ The Restaurant Model of Client & Server",
    eli5Text:
      "Think of your browser as a guest at a restaurant table. Entering a URL is placing an order with the waiter (**HTTP Request**). The kitchen across town is the **Web Server**. When the waiter returns with your dish (**200 OK Response**), your browser plates and renders the page—and if an item isn't on the menu, the kitchen replies **404 Not Found**, which is still a clean, completed exchange.",
    seniorWit:
      "Senior Dev Rule #1: When a website breaks, never guess blindly. Open the Network tab first and check whether the request never left the browser or the server returned a 500 error.",
    joke:
      "Why did the developer walk out of the restaurant? Because the waiter returned a 404: Table Not Found! 🔮",
    watchOut:
      "Don't confuse a **404 Not Found** with a broken internet connection! A 404 means the server heard you loud and clear—it just doesn't have that specific URL.",
    interviewTrap: {
      question:
        "If a user visits a URL and receives a '404 Not Found' page, did the conversation between the browser and the web service fail to happen?",
      trap: "Assuming a 404 error means no request or response took place, or confusing an error response with a broken network connection.",
      punchline:
        "The conversation succeeded: the browser asked for a resource, the web service answered with a 404 response reporting the resource was missing, and the browser displayed that answer.",
      interviewCategory: "HTML",
    },
    practiceSnippet: {
      title: "Simulate a Client-Server HTTP Exchange",
      language: "javascript",
      starterCode: `// Let's simulate how a browser requests a route from a server!
function requestFromServer(path) {
  const routes = {
    "/": { status: 200, body: "<h1>Welcome to Forge!</h1>" },
    "/profile": { status: 200, body: "<h1>Builder Profile</h1>" },
  };

  console.log("📨 Browser sends: GET " + path);
  const response = routes[path] || { status: 404, body: "Not Found" };
  console.log("📬 Server replies: Status " + response.status + " -> " + response.body);
  return response;
}

requestFromServer("/");
requestFromServer("/secret-dragon");`,
      challengePrompt:
        "Add a new route `/projects` to the `routes` object above and call `requestFromServer('/projects')`, then click Run!",
    },
    visualPreset: {
      kind: "request-flow",
      config: { defaultScenarioId: "200-ok" },
    },
  },
  "lesson-0-1-2": {
    analogyTitle: "📦 One Web Page = A Fleet of Focused Couriers",
    eli5Text:
      "A web page doesn't arrive in one single bundle. First, the browser fetches the master blueprint (**HTML**). As it parses that blueprint from top to bottom, it dispatches separate requests for stylesheets (**CSS**), images, and scripts (**JavaScript**)—each traveling independently across the network.",
    seniorWit:
      "Ever seen a webpage flash unstyled text or display a broken image while the rest of the layout works fine? That's because each asset rides its own HTTP request.",
    joke:
      "HTML arrives at the party first wearing sweatpants because CSS got stuck in network traffic! ✨",
    watchOut:
      "A `<script>` tag in the `<head>` without `defer` or `type='module'` pauses HTML parsing while it downloads and runs.",
    interviewTrap: {
      question: "What is the difference between `<script>`, `<script async>`, and `<script defer>`?",
      trap: "Mixing up execution order: `async` runs as soon as it finishes downloading (out of order), whereas `defer` downloads in parallel and executes in order after HTML parsing completes.",
      punchline: "Default to `defer` (or `type='module'`) so scripts download without blocking the HTML parser and run right after the DOM is ready.",
      interviewCategory: "HTML",
    },
    practiceSnippet: {
      title: "Trace the Asset Waterfall",
      language: "javascript",
      starterCode: `const pageAssets = [
  { file: "index.html", type: "document", sizeKB: 14, status: 200 },
  { file: "styles.css", type: "stylesheet", sizeKB: 42, status: 200 },
  { file: "hero-banner.png", type: "image", sizeKB: 180, status: 404 },
  { file: "app.js", type: "script", sizeKB: 65, status: 200 },
];

for (const asset of pageAssets) {
  const icon = asset.status === 200 ? "✅" : "⚠️";
  console.log(\`\${icon} [\${asset.status}] \${asset.file} (\${asset.sizeKB}KB)\`);
}
console.log("Notice: Even though hero-banner.png 404'd, the HTML, CSS, and JS still loaded!");`,
      challengePrompt:
        "Fix `hero-banner.png`'s status to `200` and compute the total KB downloaded across all assets!",
    },
    visualPreset: {
      kind: "request-flow",
      config: { defaultScenarioId: "404-not-found" },
    },
  },
  "lesson-0-1-3": {
    analogyTitle: "🏛️ Architecture Trio: Structure, Style, and Behavior",
    eli5Text:
      "Think of a modern building: **HTML** is the structural steel and room labels (what exists and what it means). **CSS** is the interior architecture, lighting, and proportions (how it looks). **JavaScript** is the smart wiring, elevators, and sensors that respond when someone presses a button (how it behaves).",
    seniorWit:
      "Using JavaScript to center a heading when CSS Flexbox does it in one declaration is like wiring a motor just to hold a picture frame level.",
    joke:
      "HTML is the skeleton, CSS is the drip, and JavaScript is the caffeine that makes it move! ☕",
    watchOut:
      "Keep separation of concerns clean: use HTML for meaning, CSS for visual layout, and JS for state and interactivity.",
    interviewTrap: {
      question: "Why shouldn't you use `<div onClick={...}>` instead of a `<button>`?",
      trap: "Saying 'it just looks cleaner in code' instead of explaining keyboard focus (`Tab`), `Enter`/`Space` activation, and screen reader role announcements.",
      punchline: "A native `<button>` gives you keyboard focus, Enter/Space key events, and `role='button'` accessibility out of the box with zero extra JS.",
      interviewCategory: "Accessibility",
    },
    practiceSnippet: {
      title: "HTML + CSS + JS Working Together",
      language: "html",
      starterCode: `<div class="forge-card">
  <h2>Forge Spirit Crystal</h2>
  <p id="status">Crystal is resting...</p>
  <button id="spark-btn">Channel Spark ✨</button>
</div>

<style>
  .forge-card {
    font-family: system-ui, sans-serif;
    padding: 20px;
    border-radius: 16px;
    background: #1e1b4b;
    color: #faf8f5;
    text-align: center;
  }
  button {
    background: #6e6af6;
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 999px;
    font-weight: 700;
    cursor: pointer;
  }
</style>

<script>
  const btn = document.getElementById("spark-btn");
  const status = document.getElementById("status");
  btn.addEventListener("click", () => {
    status.textContent = "🔮 Crystal is glowing at 100% power!";
  });
</script>`,
      challengePrompt:
        "Click Run, test the button in the preview, then change the button background color in CSS to `#f59e0b`!",
    },
    visualPreset: {
      kind: "layer-stack",
      config: {},
    },
  },
  "lesson-2-4-1": {
    analogyTitle: "🤝 APIs Are Polite Restaurant Menus Between Programs",
    eli5Text:
      "An **API** (Application Programming Interface) is simply a contract between your frontend and a server: 'If you send me a request formatted like this, I promise to send back JSON data shaped like that.' You don't need to know how the server's kitchen cooks the database query—you just read the menu!",
    seniorWit:
      "Never trust an API response blindly in production—always handle loading, empty arrays, and network failures gracefully.",
    joke:
      "I told an async joke in my technical interview... I'm still `await`-ing their response! 😅",
    watchOut:
      "`fetch()` returns a **Promise** immediately, not the JSON data itself! You have to `await` the network response AND `await response.json()`.",
    interviewTrap: {
      question: "Does `fetch()` reject its Promise when the server returns a `404` or `500` HTTP status?",
      trap: "Almost 80% of interviewees say 'Yes, `catch` will run on a 404.' In reality, `fetch()` ONLY rejects on network failure (like offline DNS). For 404/500, it resolves normally with `response.ok === false`!",
      punchline: "Always check `if (!response.ok) throw new Error(response.statusText)` before calling `await response.json()`.",
      interviewCategory: "JavaScript",
    },
    practiceSnippet: {
      title: "Practice Async / Await & The Fetch 404 Interview Trap",
      language: "javascript",
      starterCode: `// 🎯 Interview Classic: Handling async/await & checking response.ok
async function simulateFetchUser(userId) {
  console.log("1. Sending async request for user:", userId);

  // Simulate network delay with a Promise
  const fakeResponse = await new Promise((resolve) => {
    setTimeout(() => {
      if (userId === 42) {
        resolve({ ok: true, status: 200, json: async () => ({ id: 42, name: "Forge Builder", role: "Frontend Engineer" }) });
      } else {
        resolve({ ok: false, status: 404, json: async () => ({ error: "User not found" }) });
      }
    }, 150);
  });

  // ⚠️ INTERVIEW TRAP: Always check fakeResponse.ok!
  if (!fakeResponse.ok) {
    throw new Error(\`HTTP Error Status: \${fakeResponse.status}\`);
  }

  const data = await fakeResponse.json();
  console.log("2. Success! Received JSON:", JSON.stringify(data));
  return data;
}

async function runInterviewDemo() {
  try {
    await simulateFetchUser(42);
    await simulateFetchUser(999); // Triggers 404!
  } catch (err) {
    console.error("3. Caught cleanly in try/catch:", err.message);
  }
}

runInterviewDemo();`,
      challengePrompt:
        "Click Run to see `async/await` in action! Then add a `finally` block inside `runInterviewDemo` that logs `'4. Loading spinner hidden!'`.",
    },
  },
  "lesson-2-4-4": {
    analogyTitle: "📟 `fetch()` & `async/await`: The Coffee Shop Buzzer",
    eli5Text:
      "When you call `fetch()`, JavaScript doesn't freeze the whole browser tab while waiting for the server. Instead, it hands you a **Promise** (like a coffee shop buzzer). Using `async` and `await` lets you pause *just that function* until the buzzer lights up with the server's response, while the rest of the UI stays smooth and clickable!",
    seniorWit:
      "Remember the two `await`s of `fetch`: the first `await fetch(url)` waits for the HTTP headers; the second `await res.json()` waits for the body stream to parse into an object.",
    joke:
      "Why did the Promise go to therapy? It had unresolved issues and kept getting rejected! 💜",
    watchOut:
      "Forgetting the `await` keyword before `res.json()` gives you `Promise {<pending>}` instead of your actual data object!",
    interviewTrap: {
      question: "If you need to fetch 3 independent endpoints (`users`, `posts`, `stats`), why is writing three sequential `await fetch(...)` lines an anti-pattern?",
      trap: "Sequential `await`s create a network waterfall where request #2 waits for #1 to finish. Interviewers want to see `await Promise.all([fetch1, fetch2, fetch3])`.",
      punchline: "Use `Promise.all()` (or `Promise.allSettled()`) to fire independent async requests in parallel and cut total wait time to the single slowest request.",
      interviewCategory: "JavaScript",
    },
    practiceSnippet: {
      title: "Sequential Waterfall vs. Parallel Promise.all()",
      language: "javascript",
      starterCode: `// ⚡ Let's compare sequential await vs Promise.all() — a top interview question!
const fakeApi = (label, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(\`\${label} loaded (\${ms}ms)\`), ms));

async function loadDashboardParallel() {
  const start = Date.now();
  console.log("🚀 Firing 3 async requests in parallel with Promise.all...");

  const [profile, projects, badges] = await Promise.all([
    fakeApi("Profile", 120),
    fakeApi("Projects", 150),
    fakeApi("Badges", 100),
  ]);

  const elapsed = Date.now() - start;
  console.log("✅ Results:", profile, "|", projects, "|", badges);
  console.log(\`⏱️ Total parallel time: ~\${elapsed}ms (instead of 370ms sequential!)\`);
}

loadDashboardParallel();`,
      challengePrompt:
        "Click Run to see `Promise.all` resolve all 3 promises in parallel! Try adding a 4th request `fakeApi('Interviews', 110)` to the array.",
    },
  },
};

const MODULE_MENTOR_SEEDS: Record<string, RawMentorSeed> = {
  "module-0-1": {
    analogyTitle: "📡 Walkie-Talkies, Not Telepathy",
    eli5Text:
      "Your browser and the server can't read each other's minds. Every single click, page load, or profile save is just a polite walkie-talkie message: 'Hey server, can I have this?' (**HTTP Request**) followed by 'Copy that, here you go!' (**HTTP Response**).",
    seniorWit:
      "Half of debugging is just checking the Network tab to see whether the walkie-talkie message was ever sent in the first place.",
    joke:
      "I asked the server for a sandwich. It replied `418 I'm a teapot`. Real HTTP status code, look it up! 🫖",
    watchOut:
      "Always inspect both the Request payload and the Response status code (2xx = success, 4xx = client mistake, 5xx = server crash).",
    interviewTrap: {
      question: "What is the difference between HTTP GET, POST, PUT, and PATCH?",
      trap: "Forgetting idempotency or saying POST is 'more secure' than GET (both travel over TLS in HTTPS; GET puts params in the URL for bookmarking/caching).",
      punchline: "GET reads data (idempotent), POST creates a resource, PUT replaces a resource completely, and PATCH updates specific fields.",
      interviewCategory: "HTML",
    },
    practiceSnippet: LESSON_SPECIFIC_SEEDS["lesson-0-1-1"].practiceSnippet,
  },
  "module-0-2": {
    analogyTitle: "⚡ The Kitchen Counter (RAM) vs. The Pantry (Storage)",
    eli5Text:
      "A computer is like a super-fast chef who can only follow exact 1-step recipes. **Storage (SSD)** is the big pantry down the hall, **Memory (RAM)** is the kitchen counter where ingredients sit while cooking, and the **CPU** is the chef's hands chopping at 3 billion slices per second!",
    seniorWit:
      "When a browser tab eats 2GB of RAM, it means your code kept putting bowls on the kitchen counter and never washed a single dish.",
    joke:
      "There are 10 types of people in the world: those who understand binary, and those who don't! 💻",
    watchOut:
      "Computers do literally what you type, not what you *meant*. Tracing state line-by-line is your superpower.",
    interviewTrap: {
      question: "What causes a memory leak in a single-page frontend application?",
      trap: "Thinking garbage collection automatically frees everything, even when global event listeners, `setInterval` timers, or detached DOM references remain attached.",
      punchline: "Always clean up `addEventListener`, `setInterval`, and subscriptions when a view unmounts so the garbage collector can reclaim RAM.",
      interviewCategory: "Debugging",
    },
    practiceSnippet: {
      title: "Trace State Step-by-Step Like a CPU",
      language: "javascript",
      starterCode: `let xp = 100;
let streakMultiplier = 2;

console.log("Initial XP:", xp);
xp = xp + 50 * streakMultiplier;
console.log("After completing lesson:", xp);`,
      challengePrompt:
        "Predict what `xp` logs before clicking Run, then add a `bonus = 25` variable to reach 225 XP!",
    },
  },
  "module-1-1": {
    analogyTitle: "🏗️ Labeling the Moving Boxes (Semantic HTML)",
    eli5Text:
      "Imagine moving into a new house where every cardboard box is labeled `<div class='box'>`. Total chaos! Semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`) is writing 'KITCHEN', 'BEDROOM', and 'FRAGILE' in giant marker so browsers, keyboards, and screen readers know exactly what's inside.",
    seniorWit:
      "Friends don't let friends build `<div onClick={...}>` fake buttons. Real `<button>` tags give you keyboard Enter/Space support for free!",
    joke:
      "A `<div>` walks into a bar. The screen reader says: 'I have no idea who this is or why it's here.' 🏷️",
    watchOut:
      "Every `<input>` needs an associated `<label>` (via `for`/`id` or wrapping) so users and assistive tech know what the field expects.",
    interviewTrap: {
      question: "How does semantic HTML improve both Accessibility (A11y) and SEO?",
      trap: "Only mentioning 'clean code' instead of the Accessibility Tree landmarks (`<main>`, `<nav>`, `<header>`) and heading hierarchy (`<h1>`–`<h3>`).",
      punchline: "Semantic tags populate the browser's Accessibility Tree with landmark roles and keyboard behavior without fragile ARIA workarounds.",
      interviewCategory: "HTML",
    },
    practiceSnippet: {
      title: "Semantic HTML Landmark Blueprint",
      language: "html",
      starterCode: `<main style="font-family: system-ui; padding: 16px;">
  <header>
    <h1>Forge Developer Profile</h1>
  </header>
  <article style="margin-top: 12px; padding: 12px; border: 2px solid #6e6af6; border-radius: 12px;">
    <h2>Async & Promises Certified</h2>
    <p>Built with real semantic landmarks instead of div soup!</p>
    <button type="button" onclick="console.log('Button activated via click or keyboard!')">
      Verify Credential
    </button>
  </article>
</main>`,
      challengePrompt:
        "Add a `<nav>` landmark above `<main>` with two links (`<a>`) and click Run to preview!",
    },
  },
  "module-1-2": {
    analogyTitle: "📦 Everything on the Web Is Secretly a Cardboard Box",
    eli5Text:
      "Even round avatars and diagonal badges are secretly rectangles to the browser! Inside every box: **Content** is the toy, **Padding** is the bubble wrap inside the box, **Border** is the cardboard wall, and **Margin** is the personal-space force field pushing neighbor boxes away.",
    seniorWit:
      "Pro-Tip: `box-sizing: border-box` tells the browser 'When I say 200px wide, INCLUDE the bubble wrap and cardboard in that 200px!' It saves hours of math headaches.",
    joke:
      "Two CSS properties walk into a bar. A barstool in a completely different bar falls over. 🎨",
    watchOut:
      "Without `box-sizing: border-box`, adding `padding: 20px` to a `width: 100%` element makes it `100% + 40px` wide and causes horizontal scrollbars!",
    interviewTrap: {
      question: "What is the difference between `content-box` and `border-box` in the CSS Box Model?",
      trap: "Forgetting which one is the browser default (`content-box`) and how `border` and `padding` affect total rendered width.",
      punchline: "In `content-box` (default), `width` only measures the inner content; in `border-box`, `width` includes content + padding + border.",
      interviewCategory: "CSS",
    },
    practiceSnippet: {
      title: "Interactive CSS Box Model Lab",
      language: "html",
      starterCode: `<div class="box">
  Forge Crystal Box (Inspect my padding & border!)
</div>

<style>
  .box {
    box-sizing: border-box;
    width: 260px;
    padding: 24px;
    border: 4px solid #6e6af6;
    margin: 16px;
    border-radius: 16px;
    background: #eef2ff;
    color: #1e1b4b;
    font-family: system-ui, sans-serif;
    font-weight: 700;
  }
</style>`,
      challengePrompt:
        "Try changing `padding: 24px` to `40px`—notice how `box-sizing: border-box` keeps the total outer width locked at `260px`!",
    },
  },
  "module-1-3": {
    analogyTitle: "🧲 Flexbox Is a String of Beads; Grid Is a Bento Box",
    eli5Text:
      "Use **Flexbox** when you want items to line up in a single row or column like beads on a string that slide and wrap nicely. Use **CSS Grid** when you're designing a 2D Bento lunchbox with exact rows AND columns at the same time!",
    seniorWit:
      "Before Flexbox and Grid existed, developers used `float: left` and prayed to the browser gods. Pour one out for the pioneers.",
    joke:
      "How do you center a div? In 2012: 45 minutes on StackOverflow. Today: `display: grid; place-items: center;` 🎯",
    watchOut:
      "In Flexbox, `justify-content` controls the **main axis** and `align-items` controls the **cross axis**—so when `flex-direction: column` is set, they swap directions!",
    interviewTrap: {
      question: "When should you choose CSS Grid over Flexbox?",
      trap: "Saying 'Grid is for whole pages and Flexbox is for small components.' Instead, explain 1D content-out sizing (Flexbox) vs. 2D layout-in track sizing (Grid).",
      punchline: "Flexbox calculates layout along a single axis (1D); CSS Grid aligns items across both rows and columns simultaneously (2D).",
      interviewCategory: "CSS",
    },
    practiceSnippet: {
      title: "Flexbox & Grid Bento Playground",
      language: "html",
      starterCode: `<div class="bento">
  <div class="tile">1. Learn</div>
  <div class="tile">2. Practice</div>
  <div class="tile">3. Build</div>
  <div class="tile">4. Interview</div>
</div>

<style>
  .bento {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    font-family: system-ui, sans-serif;
  }
  .tile {
    background: linear-gradient(135deg, #6e6af6, #4338ca);
    color: white;
    padding: 20px;
    border-radius: 14px;
    font-weight: 700;
    text-align: center;
  }
</style>`,
      challengePrompt:
        "Change `grid-template-columns: repeat(2, 1fr)` to `repeat(auto-fit, minmax(110px, 1fr))` and click Run!",
    },
  },
  "module-1-4": {
    analogyTitle: "📱 Water Takes the Shape of Its Glass (Responsive UI)",
    eli5Text:
      "A great interface is like water—pour it into a skinny phone glass and it stacks tall; pour it into a wide desktop bowl and it spreads out into cozy columns. Media queries and fluid units (`rem`, `%`, `fr`, `clamp()`) are how your layout senses the glass size!",
    seniorWit:
      "Hardcoding `width: 900px` on a card is the fastest way to make mobile users scroll sideways into another dimension.",
    joke:
      "Desktop-only CSS is all fun and games until you open your own site on your phone in front of a recruiter! 📱",
    watchOut:
      "Always pair `max-width` with `width: 100%` and `min-width: 0` inside flex/grid children so long text never blows out mobile screens.",
    interviewTrap: {
      question: "What is mobile-first CSS and why do we use `min-width` media queries?",
      trap: "Writing complex desktop styles first and then trying to undo them all inside `max-width` overrides for mobile.",
      punchline: "Mobile-first starts with clean single-column base styles for small screens and progressively enhances layout at `min-width` breakpoints.",
      interviewCategory: "CSS",
    },
    practiceSnippet: LESSON_SPECIFIC_SEEDS["lesson-0-1-3"].practiceSnippet,
  },
  "module-2-1": {
    analogyTitle: "🏷️ Variables Are Sticky Notes, Not Locked Vaults",
    eli5Text:
      "Think of a JavaScript variable (`const` or `let`) as a named sticky note pointing to a value in memory. `const` means you can't rip the sticky note off and point it to a brand-new value—even if you mutate properties inside an object!",
    seniorWit:
      "`===` is the strict bouncer who checks both value AND type. `==` is the chaotic bouncer who thinks `0` and `\"\"` are identical twins.",
    joke:
      "Why is JavaScript so philosophical? Because `typeof NaN === 'number'`—even 'Not-a-Number' is a number! 🤯",
    watchOut:
      "`const user = { score: 10 }` prevents reassigning `user = ...`, but `user.score = 20` is still completely valid because objects are reference types!",
    interviewTrap: {
      question: "What is the difference between `var`, `let`, and `const`, and what is the Temporal Dead Zone (TDZ)?",
      trap: "Saying '`let` and `const` do not hoist.' They DO hoist, but they remain uninitialized in the Temporal Dead Zone until execution reaches their declaration line!",
      punchline: "`var` is function-scoped and initialized to `undefined`; `let` and `const` are block-scoped and stay in the TDZ until declared.",
      interviewCategory: "JavaScript",
    },
    practiceSnippet: {
      title: "Reference vs. Primitive Values & Strict Equality",
      language: "javascript",
      starterCode: `const builder = { name: "Alex", xp: 120 };
// Even with 'const', we can update properties on the object reference:
builder.xp += 80;
console.log("Updated builder:", JSON.stringify(builder));

console.log("Loose equality (0 == ''):", 0 == "");
console.log("Strict equality (0 === ''):", 0 === "");`,
      challengePrompt:
        "Create a shallow copy `const nextBuilder = { ...builder, level: 2 }` and log both objects to verify immutability!",
    },
  },
  "module-2-2": {
    analogyTitle: "🧰 Functions Are Vending Machines; Closures Have Backpacks",
    eli5Text:
      "A **function** is a vending machine: drop in inputs (arguments), gears turn inside, and out pops a result (`return`). A **closure** is a function that leaves home wearing a magical backpack containing all the variables that were in scope when it was born!",
    seniorWit:
      "If a function doesn't have a `return` statement, it hands you back `undefined`—the JavaScript equivalent of an empty snack wrapper.",
    joke:
      "Why did the JavaScript function never feel lonely? Because it brought its closure backpack everywhere it went! 🎒",
    watchOut:
      "Array methods like `.map()` and `.filter()` return a brand-new array—if you forget `return` inside `{ ... }`, you get an array full of `undefined`!",
    interviewTrap: {
      question: "What is a Closure in JavaScript, and can you write a practical example of one?",
      trap: "Giving a textbook definition without showing a real use case like private state encapsulation, debouncing, or factory functions.",
      punchline: "A closure is when an inner function retains access to its outer lexical scope even after the outer function has finished executing.",
      interviewCategory: "JavaScript",
    },
    practiceSnippet: {
      title: "Build a Closure Counter (Classic Interview Question!)",
      language: "javascript",
      starterCode: `// 🎒 Interview Favorite: Private state using a Closure!
function createStreakCounter(initialStreak = 0) {
  let count = initialStreak; // Packed inside the closure backpack!

  return {
    increment() {
      count += 1;
      return \`🔥 Streak is now \${count} days!\`;
    },
    getCount() {
      return count;
    }
  };
}

const myStreak = createStreakCounter(3);
console.log(myStreak.increment());
console.log(myStreak.increment());
console.log("Direct count access:", myStreak.getCount());`,
      challengePrompt:
        "Add a `reset()` method to `createStreakCounter` that sets `count = 0` and call it at the bottom!",
    },
  },
  "module-2-3": {
    analogyTitle: "🌳 The DOM Is a Live Family Tree of Your HTML",
    eli5Text:
      "When the browser reads your HTML file, it builds a living 3D family tree of JavaScript objects called the **DOM**. Changing a node on that tree with JS (`element.textContent = ...`) immediately repaints the screen—no page reload needed!",
    seniorWit:
      "Treat the DOM like a projector screen showing your JavaScript state, not the vault where you hide your app's data.",
    joke:
      "Why did the DOM node break up with `innerHTML`? Because of too many XSS trust issues! 🛡️",
    watchOut:
      "Prefer `textContent` over `innerHTML` when inserting user-provided text so malicious `<script>` tags are never executed.",
    interviewTrap: {
      question: "What is Event Bubbling and Event Delegation in the DOM?",
      trap: "Attaching 500 individual `click` listeners to 500 `<li>` items instead of 1 delegated listener on the parent `<ul>` checking `event.target.closest('li')`.",
      punchline: "Events bubble up from the target element through its ancestors, enabling Event Delegation with a single parent listener.",
      interviewCategory: "JavaScript",
    },
    practiceSnippet: {
      title: "Event Delegation & Live DOM Updates",
      language: "html",
      starterCode: `<ul id="skill-list" style="font-family: system-ui; list-style: none; padding: 0; display: grid; gap: 8px;">
  <li data-skill="Async/Await" style="padding: 10px 14px; background: #eef2ff; border-radius: 10px; cursor: pointer;">⚡ Async / Await (Click me)</li>
  <li data-skill="Closures" style="padding: 10px 14px; background: #eef2ff; border-radius: 10px; cursor: pointer;">🎒 Lexical Closures (Click me)</li>
  <li data-skill="DOM Events" style="padding: 10px 14px; background: #eef2ff; border-radius: 10px; cursor: pointer;">🌳 Event Delegation (Click me)</li>
</ul>
<p id="picked" style="font-family: system-ui; font-weight: 700; color: #4338ca;">Click any skill above!</p>

<script>
  // Single listener on the parent <ul> handles every child <li>!
  document.getElementById("skill-list").addEventListener("click", (e) => {
    const item = e.target.closest("li");
    if (!item) return;
    document.getElementById("picked").textContent = "✅ Mastered: " + item.dataset.skill;
    console.log("Delegated click from:", item.dataset.skill);
  });
</script>`,
      challengePrompt:
        "Click the items in the live preview, then add a 4th `<li data-skill='React State'>`—notice how it works automatically without new JS!",
    },
  },
  "module-2-4": LESSON_SPECIFIC_SEEDS["lesson-2-4-1"],
  "module-2-5": {
    analogyTitle: "🔍 Debugging Is Detective Work, Not Whack-a-Mole",
    eli5Text:
      "When code misbehaves, novices randomly change lines hoping it magically works. Strong engineers act like Sherlock Holmes: 1) Spot the exact clue (symptom), 2) Form one testable guess (hypothesis), 3) Verify the evidence in the console or debugger!",
    seniorWit:
      "Changing three things at once when fixing a bug guarantees you won't know which one fixed it—or which two new bugs you just planted.",
    joke:
      "Being a programmer is being both the detective and the culprit in the same murder mystery! 🕵️‍♂️",
    watchOut:
      "Read the **first line** of an error stack trace carefully: `TypeError: Cannot read properties of undefined (reading 'map')` tells you the exact variable before `.map` is `undefined`!",
    interviewTrap: {
      question: "How do you diagnose a race condition in an async search input?",
      trap: "Only mentioning `debounce`! Debouncing reduces requests, but if request #1 is slow and resolves AFTER request #2, stale results still overwrite fresh ones unless you use `AbortController` or a request ID guard.",
      punchline: "Combine input debouncing with `AbortController` so in-flight stale requests are canceled whenever the query changes.",
      interviewCategory: "Debugging",
    },
    practiceSnippet: {
      title: "Fix the Undefined `.map()` Bug",
      language: "javascript",
      starterCode: `// 🐛 Buggy API response where 'items' might be undefined on initial load:
function renderBadgeNames(apiPayload) {
  // Safe defensive fallback with optional chaining + nullish coalescing:
  const items = apiPayload?.items ?? [];
  return items.map((item) => item.title.toUpperCase());
}

console.log("Empty payload:", renderBadgeNames({}));
console.log("Loaded payload:", renderBadgeNames({ items: [{ title: "Async Ace" }, { title: "Bug Hunter" }] }));`,
      challengePrompt:
        "Test what happens when you pass `null` into `renderBadgeNames(null)`!",
    },
  },
  "module-3-1": LESSON_SPECIFIC_SEEDS["lesson-2-4-4"],
  "module-3-2": {
    analogyTitle: "🚦 UI State Machines: Idle, Loading, Success, Error",
    eli5Text:
      "Every network button goes through a mini story: **Idle** (ready to click) → **Loading** (spinner while the Promise waits) → **Success** (show the data!) or **Error** (show a helpful retry button). Never leave the user staring at a frozen button wondering if their click worked!",
    seniorWit:
      "Disable the submit button while loading, or impatient users will double-click it 7 times and buy 7 pizzas.",
    joke:
      "A user clicks 'Pay Now' 5 times because there was no loading spinner. Congratulations, they now own 5 subscriptions! 🍕",
    watchOut:
      "Prefer a single `status: 'idle' | 'loading' | 'success' | 'error'` state over four separate booleans (`isLoading`, `isError`, `isSuccess`) that can contradict each other.",
    interviewTrap: {
      question: "Why doesn't React state update immediately on the line right after calling `setCount(count + 1)`?",
      trap: "Thinking `setState` mutates the local variable in place. In React, state is a snapshot per render; calling `setCount(c => c + 1)` schedules a re-render with the new value.",
      punchline: "Use the functional updater `setCount(prev => prev + 1)` whenever the next state depends on the previous state.",
      interviewCategory: "React",
    },
    practiceSnippet: {
      title: "State Machine Pattern (No Impossible States!)",
      language: "javascript",
      starterCode: `// 🚦 Clean UI State Machine Transition
function transitionState(current, event) {
  const machine = {
    idle: { FETCH: "loading" },
    loading: { RESOLVE: "success", REJECT: "error" },
    success: { REFRESH: "loading" },
    error: { RETRY: "loading" },
  };
  return machine[current]?.[event] ?? current;
}

let state = "idle";
console.log("1. Start:", state);
state = transitionState(state, "FETCH");
console.log("2. After click:", state);
state = transitionState(state, "RESOLVE");
console.log("3. After Promise resolves:", state);`,
      challengePrompt:
        "Simulate an error flow (`FETCH` -> `REJECT` -> `RETRY` -> `RESOLVE`) and log each transition!",
    },
  },
  "module-3-3": {
    analogyTitle: "🧩 Components Are Custom LEGO Kits",
    eli5Text:
      "Instead of rebuilding a 50-line card every time, you pack its HTML, CSS, and JS into a reusable **Component** blueprint. Pass in different **Props** (like changing a LEGO minifigure's hood color) and render a whole army of consistent cards!",
    seniorWit:
      "Props flow down like a waterfall; events bubble up via callback functions.",
    joke:
      "Why did the React component feel so zen? Because it kept its rendering 100% pure! 🧘",
    watchOut:
      "Never mutate `props` inside a component—props are read-only inputs passed from the parent.",
    interviewTrap: {
      question: "Why does React require a stable `key` prop when rendering lists, and why is using the array `index` dangerous?",
      trap: "Saying 'it just suppresses the console warning.' If items are reordered, inserted, or deleted, index keys cause React to reuse the wrong DOM state for the wrong item!",
      punchline: "Always use a stable, unique ID (`item.id`) as the `key` so React's Fiber reconciler matches component instances accurately across re-renders.",
      interviewCategory: "React",
    },
    practiceSnippet: {
      title: "Pure UI Function: Data In -> UI Out",
      language: "javascript",
      starterCode: `// React's core mental model: UI = f(props, state)
function ForgeBadgeComponent({ title, xp, unlocked }) {
  return {
    tag: "div",
    className: unlocked ? "badge-unlocked" : "badge-locked",
    text: \`\${unlocked ? "🏆" : "🔒"} \${title} (+\${xp} XP)\`,
  };
}

console.log(ForgeBadgeComponent({ title: "Async Master", xp: 150, unlocked: true }));
console.log(ForgeBadgeComponent({ title: "React Architect", xp: 200, unlocked: false }));`,
      challengePrompt:
        "Pass a new prop `tier: 'Gold'` into `ForgeBadgeComponent` and include it in the returned `text`!",
    },
  },
  "module-3-4": {
    analogyTitle: "🏛️ Single Source of Truth (One Master Scoreboard)",
    eli5Text:
      "Imagine a basketball game where three referees each keep their own paper scoreboard. Within 5 minutes, nobody knows the real score! In frontend architecture, keep **one** master state source and derive everything else (totals, filtered lists, percentages) on the fly.",
    seniorWit:
      "Whenever you copy derived data into a second `useState` + `useEffect`, a state desync bug gets its wings.",
    joke:
      "I had a state synchronization problem, so I added a `useEffect`. Now I have an infinite re-render loop! 🔄",
    watchOut:
      "If a value can be calculated from existing props or state during render (like `completedCount = tasks.filter(t => t.done).length`), compute it directly instead of storing it in state!",
    interviewTrap: {
      question: "When should you compute derived values during render vs. storing them in `useState` with `useEffect`?",
      trap: "Syncing state with `useEffect(() => setFiltered(items.filter(...)), [items])`, which causes an unnecessary extra render pass and stale state bugs.",
      punchline: "Derive filtered/computed values directly during render (or with `useMemo` if expensive) from a single source of truth.",
      interviewCategory: "React",
    },
    practiceSnippet: {
      title: "Derive State Instead of Duplicating State",
      language: "javascript",
      starterCode: `// ✅ Single Source of Truth: only store raw tasks!
const tasks = [
  { id: 1, title: "Learn Promises", completed: true },
  { id: 2, title: "Practice async/await", completed: true },
  { id: 3, title: "Ace the Mock Interview", completed: false },
];

// Derived values computed on the fly (never out of sync!):
const completedCount = tasks.filter((t) => t.completed).length;
const progressPercent = Math.round((completedCount / tasks.length) * 100);

console.log(\`Progress: \${completedCount}/\${tasks.length} (\${progressPercent}%)\`);`,
      challengePrompt:
        "Flip task #3's `completed` to `true` and click Run to watch the derived percentage automatically hit 100%!",
    },
  },
  "module-4-1": {
    analogyTitle: "🛡️ Defensive Engineering: Expect Chaos, Stay Graceful",
    eli5Text:
      "In the real world, Wi-Fi drops in elevators, users paste emojis into number fields, and APIs time out. Production engineering means building guardrails (`try/catch`, Error Boundaries, fallback UI) so your app bends gracefully instead of crashing into a blank white screen.",
    seniorWit:
      "Always ask: 'What happens if this array is empty, this string is 500 characters long, or this network request takes 8 seconds?'",
    joke:
      "QA Engineer walks into a bar. Orders 1 beer. Orders 0 beers. Orders -999999 beers. Orders a lizard. Orders `null`. 🦎",
    watchOut:
      "Always wrap `JSON.parse()` and `await fetch()` calls in `try/catch` blocks so malformed data or offline networks never crash the UI.",
    interviewTrap: {
      question: "How do you prevent a single crashed widget from taking down the entire React application?",
      trap: "Saying 'wrap the component in `try/catch`.' Standard `try/catch` only works in imperative code, not declarative JSX tree rendering—you need an Error Boundary component.",
      punchline: "Wrap independent page regions (like charts or sidebars) in React Error Boundaries with a friendly retry fallback UI.",
      interviewCategory: "Architecture",
    },
    practiceSnippet: LESSON_SPECIFIC_SEEDS["lesson-2-4-1"].practiceSnippet,
  },
  "module-4-2": {
    analogyTitle: "⚔️ Forge Master Capstone: Putting Every Mental Model Together",
    eli5Text:
      "You've mastered the skeleton (HTML), the wardrobe (CSS), the brain (JS), the buzzer (Async HTTP), and the master scoreboard (React State). Now you're combining them like a senior engineer—diagnosing root causes and shipping real features with confidence!",
    seniorWit:
      "The difference between a junior and a senior engineer isn't typing speed—it's knowing which layer of the stack owns the behavior.",
    joke:
      "Interviewer: 'Do you know `async/await`?' You after Forge: 'Pull up a chair, let me show you how `Promise.all` and `response.ok` really work!' 🚀",
    watchOut:
      "In technical interviews, always narrate your mental model out loud before typing code—interviewers hire you for how you think!",
    interviewTrap: {
      question: "Walk me through how you would architect an autocomplete search box that queries an API.",
      trap: "Jumping straight into JSX without discussing debouncing, `AbortController` race conditions, loading/error/empty states, and keyboard arrow navigation.",
      punchline: "Structure your answer in 4 pillars: Data model & caching → Debounce + AbortController → Accessible combobox ARIA → Loading/Error/Empty states.",
      interviewCategory: "Architecture",
    },
    practiceSnippet: LESSON_SPECIFIC_SEEDS["lesson-2-4-4"].practiceSnippet,
  },
};

export function getEli5MentorNote(
  lessonId: string,
  moduleIdOrTitle?: string,
  lessonSummary?: string,
): Eli5MentorNote {
  if (LESSON_SPECIFIC_SEEDS[lessonId]) {
    return hydrateNote(LESSON_SPECIFIC_SEEDS[lessonId]);
  }

  // Infer module ID from lessonId (e.g. "lesson-2-4-3" -> "module-2-4")
  const match = lessonId.match(/^lesson-(\d+-\d+)/);
  const inferredModuleId = match ? `module-${match[1]}` : undefined;

  if (inferredModuleId && MODULE_MENTOR_SEEDS[inferredModuleId]) {
    return hydrateNote(MODULE_MENTOR_SEEDS[inferredModuleId]);
  }

  if (moduleIdOrTitle && MODULE_MENTOR_SEEDS[moduleIdOrTitle]) {
    return hydrateNote(MODULE_MENTOR_SEEDS[moduleIdOrTitle]);
  }

  // Keyword-aware fallback for any custom/canonical lesson ID
  const combined = `${lessonId} ${moduleIdOrTitle || ""} ${lessonSummary || ""}`.toLowerCase();
  if (combined.includes("async") || combined.includes("fetch") || combined.includes("promise") || combined.includes("api")) {
    return hydrateNote(LESSON_SPECIFIC_SEEDS["lesson-2-4-4"]);
  }
  if (combined.includes("react") || combined.includes("component") || combined.includes("state") || combined.includes("hook")) {
    return hydrateNote(MODULE_MENTOR_SEEDS["module-3-3"]);
  }
  if (combined.includes("css") || combined.includes("flex") || combined.includes("grid") || combined.includes("box")) {
    return hydrateNote(MODULE_MENTOR_SEEDS["module-1-2"]);
  }
  if (combined.includes("function") || combined.includes("closure") || combined.includes("array") || combined.includes("loop")) {
    return hydrateNote(MODULE_MENTOR_SEEDS["module-2-2"]);
  }
  if (combined.includes("dom") || combined.includes("event")) {
    return hydrateNote(MODULE_MENTOR_SEEDS["module-2-3"]);
  }

  return hydrateNote(MODULE_MENTOR_SEEDS["module-0-1"]);
}

export function enrichFeedbackWithWit(
  rawFeedback: string,
  _kind: "correct" | "incorrect",
): string {
  return rawFeedback.trim();
}
