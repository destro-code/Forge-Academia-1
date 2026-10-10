# Forge Curriculum v2
## Module 4.2 — Application State
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing lesson manuscript for review. Answer keys and feedback are included for review and will be hidden from learners in the final compiled lesson.

### Module outcome
By the end of this module, the learner can classify application state, choose a clear owner, avoid duplicate and contradictory state, use Context deliberately, distinguish server data from local drafts and persisted browser state, and design synchronization boundaries before choosing a state-management tool.

### Module lessons
1. **Application State Is a Classification Problem**
2. **One Source of Truth and State Ownership**
3. **Context: Reach Without Prop Drilling**
4. **Server Data, Persistence, and Synchronization**
5. **Forge Mission: Design the State Architecture**


---

# 4.2.1 — Application State Is a Classification Problem
**Estimated time:** 15–18 minutes

Before this module, you used local component state, shared React state, reducers, routes, URL values, and server data.

At application scale, the hardest state question is often not:

**“How do I store this?”**

It is:

**“What kind of state is this?”**

Start with five useful categories:

- **Local UI state** — belongs to one small interaction.
- **Shared client state** — several parts of the UI need the same changing value.
- **URL state** — the state should be represented by the address, such as a search query or selected filter.
- **Server data** — the authoritative value lives outside the browser.
- **Persisted client state** — a browser value should survive refreshes.

There is also a sixth category that is important because it is **not state**:

- **Derived data** — a value you can calculate from existing state or props.

### Quick classification

A search page has:

```text
query = "laptop"
sort = "price"
results = product data from the server
isMenuOpen = false
```

Classify them.

A. `query` → URL state
B. `sort` → URL state
C. `results` → server data
D. `isMenuOpen` → local UI state

**Review key:** All four classifications are useful.

### Why classification matters

If the state is in the wrong place, the application starts fighting itself.

Examples:

- Copying URL filters into several unrelated component states can drift out of sync.
- Copying server data into client state creates another version to keep synchronized.
- Storing a derived total creates a second value that can become stale.
- Putting a tiny menu toggle into global state makes a local problem global.

### Prediction

A shopping cart page calculates:

```js
const total = items.reduce((sum, item) => sum + item.price, 0);
```

Should `total` usually be a separate state variable?

A. Yes, because every visible value must be state.
B. No, because it can be derived from `items`.
C. Yes, because totals are special.
D. Only if the number is large.

**Review key:** B

**Feedback:** When a value can be calculated reliably from existing state, keeping another copy creates synchronization work for no benefit.

### State map

Write this mental map:

```text
User input ──→ local/shared client state
URL meaning ─→ URL state
Remote truth ─→ server data
Refresh survival ─→ persisted client state
Calculation ─→ derived data
```

This is not a law. It is a first question to ask before creating another `useState`.

### Checkpoint

Which question should come before choosing a state library?

A. “What library is popular?”
B. “What kind of state am I dealing with?”
C. “How many files can I create?”
D. “Can I put this in CSS?”

**Review key:** B

### Forge takeaway

**State management starts with state classification.**

Do not solve storage before you know what the value actually represents.

### Lesson completion

Take five values from a real application and classify each one as local UI, shared client, URL, server data, persisted client, or derived.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.2.2 — One Source of Truth and State Ownership
**Estimated time:** 15–18 minutes

A large application can contain many state values without having one giant global state object.

The key principle is:

**For each piece of state, know who owns it.**

That owner is responsible for defining the current value and the rules for changing it.

### The problem with duplication

Imagine:

```text
Header      → selectedAccount = "A"
Dashboard   → selectedAccount = "A"
Sidebar     → selectedAccount = "A"
```

If each area stores its own copy, what happens when the account changes?

You now have to keep three values synchronized.

### Better

Choose one source of truth:

```text
Account state
    ↓
Header
Dashboard
Sidebar
```

The consumers read the same underlying value.

### Prediction

Two sibling components must always show the same selected tab.

Where should that state usually live?

A. Inside both children separately
B. In their closest useful shared owner
C. In CSS
D. In the browser title

**Review key:** B

**Feedback:** Put shared state at the smallest owner that can coordinate every component that depends on it.

### Not everything belongs higher

A common overcorrection is lifting everything to the application root.

Imagine a tooltip that exists only inside one table row.

Does the whole application need to own whether the tooltip is open?

A. Yes
B. No

**Review key:** B

The state should usually stay near the interaction that needs it.

### State locality

Think in terms of a ladder:

```text
One button
   ↓
One component
   ↓
One section
   ↓
One route
   ↓
Several routes
   ↓
Whole application
```

Move the state upward only when the requirement crosses another boundary.

### Impossible combinations

Suppose an application keeps:

```js
isLoading
isSuccess
hasError
```

What combinations might become awkward?

For example:

```text
isLoading = true
isSuccess = true
```

If those states should never happen together, the state structure itself is making invalid situations easy to create.

A better shape may be:

```js
status = "idle" | "loading" | "success" | "error"
```

Now the valid states are explicit.

### Checkpoint

Which state shape communicates a clearer set of possibilities?

A. Three unrelated booleans that can contradict each other
B. One status value representing the valid stages
C. Five copied values in different components
D. A value duplicated in local storage and state for no reason

**Review key:** B

### Forge takeaway

Good state architecture does two things:

**It gives each piece of state a clear owner.**

**It makes invalid combinations harder to represent.**

### Lesson completion

Take one screen with three or more related state variables. Identify the owner of each and look for any combinations that should be impossible.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.2.3 — Context: Reach Without Prop Drilling
**Estimated time:** 15–18 minutes

Sometimes a value genuinely belongs to a broad part of the tree.

Passing it through many components that do not use it is called **prop drilling**.

Example:

```text
App
 ↓
Shell
 ↓
Panel
 ↓
Toolbar
 ↓
Button
```

Suppose only `Button` needs the current theme.

Passing `theme` through every middle component can become noisy.

React Context gives another option.

### The idea

A provider makes a value available to components below it.

Conceptually:

```text
Theme provider
    ↓
Shell
    ↓
Panel
    ↓
Toolbar
    ↓
Button reads theme
```

The middle components do not have to forward the value.

### Prediction

Which is a good use case for Context?

A. One input value used by one nearby component
B. A theme value needed by many distant components in one UI tree
C. Every value in the application
D. Any prop that feels annoying

**Review key:** B

### Before Context

Context is powerful enough to be overused.

React's own guidance suggests considering ordinary props and component extraction before reaching for Context.

Ask:

1. Is the consumer actually far away?
2. Can a cleaner component boundary remove the prop drilling?
3. Does the value really describe a shared environment?

If the answer is no, Context may add more indirection than value.

### Simple Context example

```tsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext value="dark">
      <Toolbar />
    </ThemeContext>
  );
}

function Toolbar() {
  return <Button />;
}

function Button() {
  const theme = useContext(ThemeContext);

  return <button data-theme={theme}>Save</button>;
}
```

The important thing is the relationship.

The button does not need a theme prop from every component in between.

### Context is not automatically global state

A provider can be placed around only part of the application.

That means Context can represent the scope of a concern.

For example:

```text
Application
├── Public area
└── Editor area
    └── EditorContext
```

The editor's state can stay scoped to the editor.

### Reducer + Context

You already learned reducers earlier.

At application scale, a reducer can define the update rules while Context makes the state and dispatch available to distant descendants.

```text
Provider
├── state
├── dispatch
└── child tree
```

That is one valid pattern for a complex client-side feature.

### Checkpoint

Which statement is strongest?

A. Context should replace props.
B. Context should be used for every shared value.
C. Context is useful when a value is needed deeply or broadly, but explicit props and composition are still valuable.
D. Context automatically makes state persistent.

**Review key:** C

### Forge takeaway

Context is not a shortcut around architecture.

It is a boundary.

Use it when the application's structure says:

**“Many descendants belong to the same shared environment.”**

### Lesson completion

Find one prop that travels through components that do not use it. Decide whether composition, a cleaner boundary, or Context is the best response. Explain your choice.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.2.4 — Server Data, Persistence, and Synchronization
**Estimated time:** 15–18 minutes

Now consider the state that does not truly belong to the browser.

Suppose a user profile comes from the server.

The browser may display it.

But the browser is not the authoritative owner of the profile.

That distinction changes how you design state.

### Server data is not ordinary local state

Consider:

```text
Server
  ↓
profile data
  ↓
application
  ↓
components
```

If you copy the profile into many unrelated local states, you now have several copies of remote truth.

That creates synchronization work.

### Prediction

The server says:

```json
{
  "name": "Amina",
  "plan": "pro"
}
```

A component wants to show the name.

Should it create:

```js
const [name, setName] = useState(profile.name);
```

just to display it?

A. Usually no
B. Always yes
C. Only because strings need state
D. Only when the name is longer than ten characters

**Review key:** A

**Feedback:** If the component is simply displaying the current server value, copying it into local state can create a second source of truth.

### When local state is valid

Suppose the user is editing the profile name before saving.

Now two values can legitimately exist:

```text
saved server name
draft name
```

The draft is not another copy pretending to be the source of truth.

It is a different concept:

**unsaved user intent.**

### Persistence

Some client state should survive refreshes.

Examples:

- a dismissed notice,
- a selected preference,
- a draft,
- a theme choice.

But persistence adds a new question:

**What happens when stored data is old?**

### Local storage is not the server

If you save:

```js
localStorage.setItem("theme", "dark");
```

that value exists in the browser.

It does not automatically update the server.

Likewise, a server update does not automatically rewrite every browser's local copy.

### Synchronization is a product decision

Imagine a user changes an account setting on one device.

Another device may have an old value.

Now the application must decide:

- which source wins,
- how often to refresh,
- when cached data becomes stale,
- whether the user should see a conflict,
- whether the change is optimistic or confirmed.

### Checkpoint

Which pair represents two different concepts?

A. Server profile and unsaved draft
B. Server profile and an identical duplicate state variable used only for display
C. URL query and the same query copied into four components
D. Derived total and another state variable containing the same total

**Review key:** A

### Forge takeaway

Do not ask only:

**“Where can I store this?”**

Ask:

**“Who owns the truth, and what relationship does this browser value have to that truth?”**

### Lesson completion

Take one feature that reads server data and identify its authoritative source, any temporary client draft, and any data that should survive refresh.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.2.5 — Forge Mission: Design the State Architecture
**Estimated time:** 15–18 minutes

You are reviewing a new application called **Forge Desk**.

It has:

- a sidebar with a selected workspace,
- a search page with filters,
- a list of tickets from the server,
- an unsaved ticket draft,
- a theme preference,
- an account identity,
- a notification banner,
- a derived count of unresolved tickets.

The current implementation has these problems:

```text
selectedWorkspace duplicated in 4 components
searchQuery stored in 3 components
tickets copied into local state everywhere
draft mixed together with saved ticket data
theme stored nowhere after refresh
account passed through 8 layers of props
unresolvedCount stored separately from tickets
```

Your job is not to pick a library.

Your job is to **design the state model first**.

### Mission Part 1 — Classify the state

Classify each:

1. selected workspace
2. search query
3. ticket list
4. unsaved ticket draft
5. theme preference
6. account identity
7. notification banner visibility
8. unresolved count

**Review key:**

1. Shared client state or URL state depending on product requirements
2. URL state if the search should be shareable/bookmarkable
3. Server data
4. Local/client draft state
5. Persisted client state
6. Shared application context/server-provided identity
7. Local UI state
8. Derived data

### Mission Part 2 — Find the duplicated truth

Which entries should NOT be stored as separate copies just because several components display them?

A. Ticket list
B. Unresolved count
C. Selected workspace
D. Theme preference

**Review key:** A and B are especially important.

The ticket list is server data. The unresolved count can be calculated from it.

The selected workspace may need a single owner or URL representation.

### Mission Part 3 — Decide the URL

The product owner says:

> “I want a teammate to copy a search URL and open the same filtered ticket view.”

Where should the search filters live?

A. Only local component state
B. The URL
C. CSS
D. A hidden button

**Review key:** B

### Mission Part 4 — Decide the Context boundary

Eight layers currently pass the account identity through props.

Would Context be reasonable?

A. Yes, because the identity belongs to a broad application environment and many descendants need it.
B. No, because Context is forbidden.
C. Yes, because every prop should be replaced by Context.
D. Only if the account has more than 100 fields.

**Review key:** A

### Mission Part 5 — Draft versus truth

A user edits a ticket title but has not saved.

What should exist?

```text
saved ticket from server
+
local unsaved draft
```

Why?

Because they represent two different realities:

**what is saved**

and

**what the user intends to save.**

### Mission Part 6 — Persistence

The user chooses dark mode.

Should that preference disappear after refresh?

A. The product may reasonably decide it should persist.
B. It must always disappear.
C. It must always be stored on the server.
D. It must be placed in the URL.

**Review key:** A

The important engineering question is what behavior the product requires.

### Mission Part 7 — Draw the architecture

Produce a state map like:

```text
Server data
   ↓
ticket list
   ↓
derived unresolved count

URL
   ↓
search query + filters

Shared application context
   ↓
current account

Shared client state
   ↓
selected workspace

Local state
   ↓
ticket draft
notification visibility

Persisted client state
   ↓
theme preference
```

Do not copy this blindly.

Change it when the product requirement changes.

### Final challenge

Now change one requirement:

> “The selected workspace should be shareable in a URL.”

What moves?

**Answer:** The selected workspace can become URL state rather than purely internal client state.

Next change:

> “The ticket list can become five minutes stale.”

What changes?

**Answer:** The server-data caching/freshness policy can tolerate a window of staleness instead of requiring every screen to refetch immediately.

Next change:

> “Two tabs in the same browser must update when the user changes the theme.”

What becomes important?

**Answer:** The persistence and cross-tab synchronization strategy, not merely the in-memory React state.

### Module mastery gate

You are ready to leave this module when you can look at an application's values and explain:

**1.** what each value represents,

**2.** who owns it,

**3.** whether it should be derived instead of stored,

**4.** whether it belongs in the URL,

**5.** whether it comes from the server,

**6.** whether it should persist in the browser,

**7.** whether Context is appropriate,

**8.** and where synchronization risk exists.

### Forge takeaway

The mature question is not:

**“Where do I put the state?”**

It is:

**“What truth does this state represent, who owns that truth, and what other parts of the system must stay consistent with it?”**

That question scales much further than any particular state library.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.
