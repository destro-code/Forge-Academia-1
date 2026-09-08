import type { LessonExperienceDefinition } from "./types";

/**
 * Golden JavaScript Lesson Experience Definition.
 *
 * Authored strictly according to the Forge Lesson Experience Design Contract
 * (docs/forge-lesson-experience-design-contract.md), the Forge Voice and Humor Bible
 * (docs/FORGE_VOICE_AND_HUMOR_BIBLE_V1.md), and the Learning Experience Specification
 * (docs/FORGE_LEARNING_EXPERIENCE_SPEC_V1.md).
 *
 * Implements the complete 7-stage canonical learner loop:
 *   Orient (hook) →
 *   Observe (visual model) →
 *   Predict (hypothesis commitment) →
 *   Experiment (sandbox execution) →
 *   Explain (mechanics consolidation) →
 *   Apply (constrained challenge) →
 *   Master (transfer check)
 *
 * Topic: JavaScript Objects, Memory References, and Immutability.
 */
export const GOLDEN_JAVASCRIPT_LESSON: LessonExperienceDefinition = {
  lesson: {
    id: "golden-js-objects-references-mutation",
    title: "The Double Agent: Objects, References, and Mutation",
    description:
      "An interactive, full-spectrum investigation into how JavaScript handles primitives versus objects in memory, why assignments copy addresses instead of values, and how to prevent accidental mutations with modern immutability patterns.",
  },
  experiences: [
    {
      id: "hook-double-agent",
      kind: "hook",
      purpose:
        "Create cognitive dissonance by showing how assigning an object to a new variable doesn't clone it — creating an alias that can secretly mutate the original.",
      title: "The Altered Profile",
      completion: { rule: "acknowledge" },
      content: {
        heading: "You made a copy. The original changed anyway.",
        body: "Imagine you create a user: let player = { name: \"Ada\", level: 1 }. You want to test level 99 without messing up Ada's profile, so you create a tester: let tester = player. You bump tester.level = 99. Everything seems fine until you check the leaderboard and discover Ada is suddenly level 99. You didn't build a sandbox for your tester. You gave Ada a disguise.",
        punchline:
          "In JavaScript, object variables don't hold data. They hold addresses to where the data lives.",
      },
    },
    {
      id: "visual-memory-pointer",
      kind: "visual",
      purpose:
        "Provide a spatial mental model of the call stack vs heap memory, contrasting primitive value storage with object reference pointers.",
      title: "Inside the JavaScript Memory Box",
      completion: {
        rule: "interact-all",
        targetIds: [
          "frame-primitives",
          "frame-heap-alloc",
          "frame-pointer-copy",
          "frame-remote-mutation",
        ],
      },
      content: {
        heading: "Watch the Pointers Move",
        description:
          "Step through each phase to observe how the JavaScript engine treats independent primitive boxes versus heap object pointers.",
        frames: [
          {
            id: "frame-primitives",
            label: "1. Primitives (Values)",
            code: "let scoreA = 10;\nlet scoreB = scoreA;\nscoreB = 42;\n// scoreA is still 10!",
            memoryValue: "scoreA: 10 | scoreB: 42",
            slotLabel: "Stack Values",
            description:
              "Primitives (numbers, strings, booleans) live directly inside their variable's slot. Copying duplicates the raw value into a completely separate box.",
          },
          {
            id: "frame-heap-alloc",
            label: "2. Object in Heap",
            code: "const hero = { name: 'Ada', hp: 100 };\n// hero stores memory address #0x4A",
            memoryValue: "hero → Heap #0x4A { hp: 100 }",
            slotLabel: "Address Pointer",
            description:
              "Objects cannot fit neatly into a fixed stack slot. JavaScript allocates the object on the heap (#0x4A) and stores only the memory address in 'hero'.",
          },
          {
            id: "frame-pointer-copy",
            label: "3. Assignment Copies Address",
            code: "const sidekick = hero;\n// sidekick also gets address #0x4A!",
            memoryValue: "hero, sidekick → Heap #0x4A",
            slotLabel: "Shared Pointer",
            description:
              "'sidekick = hero' does NOT copy the properties. It copies the memory address! Now both variables point to the exact same object in the heap.",
          },
          {
            id: "frame-remote-mutation",
            label: "4. Remote Mutation",
            code: "sidekick.hp = 20;\nconsole.log(hero.hp); // 20!",
            memoryValue: "Heap #0x4A { hp: 20 }",
            slotLabel: "Mutated Heap",
            description:
              "Modifying 'sidekick.hp' follows address #0x4A and rewrites the property on the heap. Because 'hero' points to #0x4A, 'hero.hp' reflects the change immediately.",
          },
        ],
      },
    },
    {
      id: "predict-reference-sharing",
      kind: "prediction",
      purpose:
        "Force the learner to commit their mental model before seeing the code execute in real-time.",
      title: "Predict the Score",
      completion: { rule: "correct-response" },
      content: {
        heading: "Who Wins the Tournament?",
        codeSnippet:
          'const teamAlpha = { name: "Hawks", score: 85 };\nconst teamBeta = teamAlpha;\n\nteamBeta.score += 15;\n\nconsole.log(teamAlpha.score);',
        question: "What will console.log(teamAlpha.score) print to the console?",
        options: [
          {
            id: "opt-85",
            label: "85 — teamAlpha was initialized to 85 and only teamBeta was modified",
          },
          {
            id: "opt-100",
            label: "100 — teamBeta and teamAlpha reference the same object on the heap",
          },
          {
            id: "opt-undefined",
            label: "undefined — the addition created a new unlinked property",
          },
          {
            id: "opt-error",
            label: "TypeError — teamAlpha was declared with const so its properties cannot change",
          },
        ],
        correctOptionId: "opt-100",
        explanation:
          'Bingo! "const teamBeta = teamAlpha" copies the address, not the object. "teamBeta.score += 15" updates the object at that address from 85 to 100. Because teamAlpha reads from that same address, it prints 100.',
      },
    },
    {
      id: "experiment-spread-clone",
      kind: "sandbox-experiment",
      purpose:
        "Give the learner active hands-on execution to experiment with reference aliasing versus object spread shallow cloning.",
      title: "Breaking the Link",
      completion: { rule: "run-executed" },
      content: {
        heading: "Clone vs Reference in the Sandbox",
        instructions:
          "Run the starter code to observe how reference assignment mutates both variables, whereas object spread ({ ...item }) creates an independent copy with its own memory address. Try modifying properties on both and re-running!",
        starterSource: `// 1. Reference assignment (Aliasing):
const original = { name: "Widget", price: 20 };
const linkedRef = original;
linkedRef.price = 25;

console.log("Original price after linkedRef edit:", original.price); // Mutated!

// 2. Shallow clone via spread syntax ({ ... }):
const independentClone = { ...original };
independentClone.price = 99;

console.log("Original price after clone edit:", original.price); // Untouched!
console.log("Clone price:", independentClone.price); // 99

// Check if they share the same address:
console.log("Are original and linkedRef identical?", original === linkedRef); // true
console.log("Are original and independentClone identical?", original === independentClone); // false`,
        language: "javascript",
      },
    },
    {
      id: "explain-immutability-and-cloning",
      kind: "explanation",
      purpose:
        "Consolidate the empirical evidence into a robust mental model for frontend state management.",
      title: "Why Frontend Engines Care",
      completion: { rule: "acknowledge" },
      content: {
        heading: "The Rules of the Reference Game",
        paragraphs: [
          "JavaScript divides types into Primitives (String, Number, Boolean, BigInt, Symbol, null, undefined) and Objects (Plain Objects, Arrays, Functions, Dates).",
          "Primitives are stored directly by value. When you assign or pass a primitive, JavaScript makes an independent duplicate in a new memory box. Mutating one never touches the other.",
          "Objects are stored by reference. A variable holding an object stores only a memory address pointing to the heap. The '=' assignment operator copies that pointer address, creating an alias to the same heap object.",
          "Strict equality checks ('===') compare addresses, not property contents. Two distinct objects with identical properties are never equal ({ a: 1 } !== { a: 1 }) because they reside at different memory addresses.",
          "In modern frontend engineering (especially React and Redux), accidental object mutation breaks change detection. To update state safely, always construct fresh objects using spread syntax ({ ...state, updatedProp }) rather than mutating existing references directly.",
        ],
      },
    },
    {
      id: "challenge-safe-cart-update",
      kind: "challenge",
      purpose:
        "Apply the mental model to refactor an unsafe mutating function into an immutable pure function.",
      title: "Stop the Accidental Mutation",
      completion: { rule: "validation-passed" },
      content: {
        heading: "Build a Safe Cart Modifier",
        instructions:
          "The function applyDiscount(cartItem, discountAmount) has a critical bug: it directly modifies cartItem.price and sets cartItem.discounted = true, mutating the original catalog item! Refactor applyDiscount so it returns a brand new object with the updated price and discounted: true, leaving the input cartItem completely unchanged.",
        starterSource: `function applyDiscount(cartItem, discountAmount) {
  // BUG: Mutating input object directly!
  cartItem.price = cartItem.price - discountAmount;
  cartItem.discounted = true;
  return cartItem;
}`,
        language: "javascript",
        testCases: [
          {
            id: "tc-returns-discounted-price",
            description: "Returns an object with the discounted price (e.g. 100 - 20 = 80)",
            expression:
              'applyDiscount({ id: "item-1", name: "Keyboard", price: 100 }, 20).price === 80',
          },
          {
            id: "tc-sets-discounted-flag",
            description: "Returned object has discounted set to true",
            expression:
              'applyDiscount({ id: "item-1", name: "Keyboard", price: 100 }, 20).discounted === true',
          },
          {
            id: "tc-does-not-mutate-original",
            description: "Does NOT mutate original input item's price or add properties to it",
            expression:
              '(() => { const original = { id: "item-2", name: "Mouse", price: 50 }; const result = applyDiscount(original, 10); return original.price === 50 && original.discounted === undefined && result !== original; })()',
          },
          {
            id: "tc-preserves-other-properties",
            description: "Preserves other item properties like id and name",
            expression:
              '(() => { const original = { id: "item-3", name: "Monitor", price: 300, stock: 5 }; const result = applyDiscount(original, 50); return result.id === "item-3" && result.name === "Monitor" && result.stock === 5; })()',
          },
        ],
      },
    },
    {
      id: "mastery-nested-reference-trap",
      kind: "mastery-check",
      purpose:
        "Test transfer by presenting a realistic nested object scenario to see if the learner can spot shallow vs deep reference aliasing.",
      title: "The Shallow Spread Trap",
      completion: { rule: "correct-response" },
      content: {
        heading: "One Last Trap: Nested Objects",
        question: `const userA = {
  name: "Ada",
  preferences: { theme: "dark" }
};

// Shallow copy using spread syntax:
const userB = { ...userA };

userB.name = "Grace";
userB.preferences.theme = "light";

console.log(userA.name, userA.preferences.theme);
What does console.log(userA.name, userA.preferences.theme) print, and why?`,
        options: [
          {
            id: "opt-ada-light",
            label:
              '"Ada", "light" — userB got a new top-level object, but preferences still references the original heap object',
          },
          {
            id: "opt-ada-dark",
            label:
              '"Ada", "dark" — spread cloning makes a deep independent copy of all nested objects',
          },
          {
            id: "opt-grace-light",
            label: '"Grace", "light" — userB is an alias of userA so both properties mutated',
          },
          {
            id: "opt-error",
            label: "Throws a TypeError because preferences is a nested object",
          },
        ],
        correctOptionId: "opt-ada-light",
        successMessage:
          "Mastery achieved! You recognized that shallow spread { ...userA } creates a new outer object (leaving userA.name as 'Ada'), but copies the nested preferences pointer by reference! To clone nested objects, one must clone at every level or use structuredClone().",
        retryMessage:
          "Think about what { ...userA } actually copies: it copies top-level properties into a new object, but what value is stored in preferences? It is a pointer to an inner object!",
      },
    },
  ],
};
