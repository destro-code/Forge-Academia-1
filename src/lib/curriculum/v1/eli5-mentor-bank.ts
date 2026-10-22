/**
 * Forge Guild ELI5 Analogy & Senior-Dev Humor Bank
 *
 * Transforms dry technical explanations across all 156 lessons (17 modules,
 * 5 phases) into crystal-clear "Explain Like I'm 5" real-world metaphors
 * paired with playful senior-developer wit and topic-specific visual presets.
 */

export interface Eli5MentorNote {
  analogyTitle: string;
  eli5Text: string;
  seniorWit: string;
  visualPreset?: {
    kind: string;
    config: Record<string, unknown>;
  };
}

const LESSON_SPECIFIC_NOTES: Record<string, Eli5MentorNote> = {
  "lesson-0-1-1": {
    analogyTitle: "🍕 The Pizza Restaurant Model of the Web",
    eli5Text:
      "Imagine your browser is you sitting at a pizza restaurant. Typing a URL is calling the waiter over (**Request**). The kitchen is the **Web Server** miles away. When the waiter brings back a hot pepperoni box (**200 OK Response**), your browser opens it and paints the page! And if you order a 'Unicorn Burger'? The kitchen sends back a note saying 'We don't make that' (**404 Not Found**)—which is STILL a successful conversation!",
    seniorWit:
      "Senior Dev Rule #1: When a website breaks, never guess blindly. Open the Network tab first and check whether the waiter dropped the order or the kitchen caught fire (500).",
    visualPreset: {
      kind: "request-flow",
      config: { defaultScenarioId: "200-ok" },
    },
  },
  "lesson-0-1-2": {
    analogyTitle: "📦 One LEGO Castle = 50 Separate Delivery Trucks",
    eli5Text:
      "When you load a web page, it doesn't arrive in one giant magic box. First, the browser gets the instruction booklet (**HTML**). As it reads that booklet, it spots notes saying 'Go fetch the blue paint (**CSS**), the puppy photo (**Image**), and the motor (**JS**)!' Each one is its own mini-trip across the internet.",
    seniorWit:
      "Ever seen a webpage flash ugly unstyled text for half a second, or show a broken image icon while the rest of the page works fine? That's because each file rides its own delivery truck!",
    visualPreset: {
      kind: "request-flow",
      config: { defaultScenarioId: "404-not-found" },
    },
  },
  "lesson-0-1-3": {
    analogyTitle: "🤖 The Action Figure Trio: Skeleton, Drip, and Brain",
    eli5Text:
      "Think of building a robot action figure: **HTML** is the plastic skeleton and labels (what parts exist). **CSS** is the paint job, cape, and neon sneakers (how it looks). **JavaScript** is the voice box and karate-chop reflex when you press the button on its chest (what it does)!",
    seniorWit:
      "Using JavaScript to center a heading when CSS can do it in one line is like hiring a rocket scientist to tie your shoelaces.",
    visualPreset: {
      kind: "layer-stack",
      config: {},
    },
  },
  "lesson-1-2-1": {
    analogyTitle: "🕶️ Same Stick Figure, Brand-New Tuxedo",
    eli5Text:
      "HTML is the actor on stage; CSS is the wardrobe department. Putting a bright orange jacket (`color: darkorange`) on an `<h1>` heading doesn't turn the actor into a paragraph—it just makes the heading look sharper!",
    seniorWit:
      "If your HTML is a soup of meaningless `<div>` tags, even the fanciest CSS tuxedo won't help screen readers or search engines figure out what's a button vs. a title.",
    visualPreset: {
      kind: "box-model-studio",
      config: {
        initialWidth: 240,
        initialPadding: 20,
        initialBorder: 4,
        initialMargin: 16,
        specimenTitle: "Wardrobe Specimen",
        specimenBody: "Same HTML actor underneath—styled live by CSS declarations!",
      },
    },
  },
};

const MODULE_MENTOR_NOTES: Record<string, Eli5MentorNote> = {
  "module-0-1": {
    analogyTitle: "📡 Walkie-Talkies, Not Telepathy",
    eli5Text:
      "Your browser and the server can't read each other's minds. Every single click, page load, or profile save is just a polite walkie-talkie message: 'Hey server, can I have this?' followed by 'Copy that, here you go!'",
    seniorWit:
      "Half of debugging is just checking whether the walkie-talkie message was ever sent in the first place.",
  },
  "module-0-2": {
    analogyTitle: "⚡ The Kitchen Counter (RAM) vs. The Pantry (Storage)",
    eli5Text:
      "A computer is like a super-fast chef who can only follow exact 1-step recipes. **Storage (SSD)** is the big pantry down the hall, **Memory (RAM)** is the kitchen counter where ingredients sit while cooking, and the **CPU** is the chef's hands chopping at 3 billion slices per second!",
    seniorWit:
      "When a browser tab eats 2GB of RAM, it means your code kept putting bowls on the kitchen counter and never washed a single dish.",
  },
  "module-1-1": {
    analogyTitle: "🏗️ Labeling the Moving Boxes (Semantic HTML)",
    eli5Text:
      "Imagine moving into a new house where every cardboard box is labeled `<div class='box'>`. Total chaos! Semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`) is writing 'KITCHEN', 'BEDROOM', and 'FRAGILE' in giant marker so browsers, keyboards, and screen readers know exactly what's inside.",
    seniorWit:
      "Friends don't let friends build `<div onClick={...}>` fake buttons. Real `<button>` tags give you keyboard Enter/Space support for free!",
  },
  "module-1-2": {
    analogyTitle: "📦 Everything on the Web Is Secretly a Cardboard Box",
    eli5Text:
      "Even round avatars and diagonal badges are secretly rectangles to the browser! Inside every box: **Content** is the toy, **Padding** is the bubble wrap inside the box, **Border** is the cardboard wall, and **Margin** is the personal-space force field pushing neighbor boxes away.",
    seniorWit:
      "Pro-Tip: `box-sizing: border-box` tells the browser 'When I say 200px wide, INCLUDE the bubble wrap and cardboard in that 200px!' It saves hours of math headaches.",
  },
  "module-1-3": {
    analogyTitle: "🧲 Flexbox Is a String of Beads; Grid Is a Bento Box",
    eli5Text:
      "Use **Flexbox** when you want items to line up in a single row or column like beads on a string that slide and wrap nicely. Use **CSS Grid** when you're designing a 2D Bento lunchbox with exact rows AND columns at the same time!",
    seniorWit:
      "Before Flexbox and Grid existed, developers used `float: left` and prayed to the browser gods. Pour one out for the pioneers.",
  },
  "module-1-4": {
    analogyTitle: "📱 Water Takes the Shape of Its Glass (Responsive UI)",
    eli5Text:
      "A great interface is like water—pour it into a skinny phone glass and it stacks tall; pour it into a wide desktop bowl and it spreads out into cozy columns. Media queries and fluid units (`rem`, `%`, `fr`) are how your layout senses the glass size!",
    seniorWit:
      "Hardcoding `width: 900px` on a card is the fastest way to make mobile users scroll sideways into another dimension.",
  },
  "module-2-1": {
    analogyTitle: "🏷️ Variables Are Sticky Notes, Not Locked Vaults",
    eli5Text:
      "Think of a JavaScript variable (`const` or `let`) as a named sticky note with a string pointing to a value in memory. `const` means you can't rip the string off and point it to a brand-new box—even if you rearrange the toys inside an object box!",
    seniorWit:
      "`===` is the strict bouncer who checks both value AND type. `==` is the chaotic bouncer who thinks `0` and `\"\"` are twins.",
  },
  "module-2-2": {
    analogyTitle: "🧰 Functions Are Vending Machines; Closures Have Backpacks",
    eli5Text:
      "A **function** is a vending machine: drop in inputs (arguments), gears turn inside, and out pops a snack (`return`). A **closure** is a function that leaves home wearing a backpack containing all the variables that were around when it was born!",
    seniorWit:
      "If a function doesn't have a `return` statement, it hands you back `undefined`—the JavaScript equivalent of an empty wrapper.",
  },
  "module-2-3": {
    analogyTitle: "🌳 The DOM Is a Live Family Tree of Your HTML",
    eli5Text:
      "When the browser reads your HTML text file, it builds a living 3D family tree of JavaScript objects called the **DOM**. Changing a node on that tree with JS immediately repaints the screen—no page reload needed!",
    seniorWit:
      "Treat the DOM like a reflection of your data state, not the place where you hide your app's secret numbers.",
  },
  "module-2-4": {
    analogyTitle: "🔔 Event Listeners Are Doorbells Waiting for a Press",
    eli5Text:
      "`addEventListener('click', fn)` is wiring a doorbell to a button. Your code doesn't sit there freezing the browser waiting for a click—it registers the bell and goes back to relaxing until the user's finger actually presses it!",
    seniorWit:
      "And when you click a button inside a card, the click 'bubbles' up like a fizzy soda bubble from the button → card → body!",
  },
  "module-2-5": {
    analogyTitle: "🔍 Debugging Is Detective Work, Not Whack-a-Mole",
    eli5Text:
      "When code misbehaves, novices randomly change lines hoping it magically works. Guild engineers act like Sherlock Holmes: 1) Spot the exact clue (symptom), 2) Form one testable guess (hypothesis), 3) Check the evidence in DevTools!",
    seniorWit:
      "Changing three things at once when fixing a bug guarantees you won't know which one fixed it—or which two new bugs you just planted.",
  },
  "module-3-1": {
    analogyTitle: "📟 Promises Are Coffee Shop Buzzers",
    eli5Text:
      "When you order a latte (`fetch()`), the barista doesn't freeze the whole line for 3 minutes. They hand you a plastic **Promise buzzer** (`pending`). You can go find a seat! When the buzzer lights up green (`fulfilled`), you pick up your data—or if they ran out of oat milk, it buzzes red (`rejected`).",
    seniorWit:
      "`async/await` is just syntactic sugar that lets you write buzzer code as if you were reading a calm top-to-bottom story.",
  },
  "module-3-2": {
    analogyTitle: "🚦 UI State Machines: Idle, Loading, Success, Error",
    eli5Text:
      "Every network button goes through a mini story: **Idle** (ready to click) → **Loading** (spinner while the buzzer waits) → **Success** (show the data!) or **Error** (show a helpful retry button). Never leave the user staring at a frozen button wondering if their click worked!",
    seniorWit:
      "Disable the submit button while loading, or impatient users will double-click it 7 times and buy 7 pizzas.",
  },
  "module-3-3": {
    analogyTitle: "🧩 Components Are Custom LEGO Kits",
    eli5Text:
      "Instead of rebuilding a 50-line card every time, you pack its HTML, CSS, and JS into a reusable **Component** blueprint. Pass in different **Props** (like changing the LEGO minifigure's hat color) and render a whole army of consistent cards!",
    seniorWit:
      "Props flow down like a waterfall; events bubble up like salmon.",
  },
  "module-3-4": {
    analogyTitle: "🏛️ Single Source of Truth (One Master Scoreboard)",
    eli5Text:
      "Imagine a basketball game where three referees each keep their own paper scoreboard. Within 5 minutes, nobody knows the real score! In frontend architecture, keep **one** master state object and let every badge and chart read from that single scoreboard.",
    seniorWit:
      "Whenever you duplicate state in two variables, a desync bug gets its wings.",
  },
  "module-4-1": {
    analogyTitle: "🛡️ Defensive Engineering: Expect Chaos, Stay Graceful",
    eli5Text:
      "In the real world, Wi-Fi drops in elevators, users paste emojis into phone-number fields, and APIs return `null` at 2 AM. Production engineering means building guardrails so your app bends gracefully instead of crashing into a blank white screen.",
    seniorWit:
      "Always ask: 'What happens if this array is empty, or this network request takes 8 seconds?'",
  },
  "module-4-2": {
    analogyTitle: "⚔️ Guild Master Capstone: Putting Every Mental Model Together",
    eli5Text:
      "You've mastered the skeleton (HTML), the wardrobe (CSS), the brain (JS), the buzzer (Async HTTP), and the master scoreboard (State). Now you're combining them like a senior engineer—diagnosing root causes before touching a single line of code!",
    seniorWit:
      "The difference between a junior and a senior engineer isn't typing speed—it's knowing which layer of the stack owns the bug.",
  },
};

export function getEli5MentorNote(
  lessonId: string,
  moduleId: string,
): Eli5MentorNote {
  if (LESSON_SPECIFIC_NOTES[lessonId]) {
    return LESSON_SPECIFIC_NOTES[lessonId];
  }
  if (MODULE_MENTOR_NOTES[moduleId]) {
    return MODULE_MENTOR_NOTES[moduleId];
  }
  return MODULE_MENTOR_NOTES["module-0-1"];
}

export function enrichFeedbackWithWit(
  rawFeedback: string,
  kind: "correct" | "incorrect",
): string {
  const trimmed = rawFeedback.trim();
  if (trimmed.length > 120 || trimmed.includes("🔥") || trimmed.includes("💡")) {
    return trimmed;
  }
  if (kind === "correct") {
    return `${trimmed} 🔥 Guild XP unlocked—your mental model is spot on!`;
  }
  return `${trimmed} 💡 Tip: Pause and trace which layer (HTML structure, CSS presentation, JS state, or Network exchange) is doing the work here.`;
}
