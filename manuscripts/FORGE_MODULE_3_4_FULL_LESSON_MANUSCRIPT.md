# Forge Curriculum v2
### Module 3.4 — Routing, Data Flow, and React Applications
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing lesson manuscript for review. It is not a blueprint. Review keys and hints are included for audit before JSON compilation.

## Module outcome
By the end of this module, you can reason about a React application as a connected set of routes and state boundaries, use the URL as meaningful application state, compose nested screens, share state deliberately, choose between props, context, and reducers, and place data loading or mutations at a sensible application boundary.

## Module lessons
1. **Routing Changes the Screen Without Changing the Application** — understand the route-to-UI relationship
2. **Nested Routes and Layouts** — compose application structure from shared shells and child routes
3. **The URL Can Be State** — use path and query information as meaningful application state
4. **Navigation Should Describe Intent** — move through an application without turning navigation into mysterious click logic
5. **Share State Deliberately** — decide when props are enough and when context helps
6. **Reducers Give Complex Updates a Vocabulary** — model state transitions as explicit events
7. **Route Data Belongs Near the Route** — reason about loading data at the boundary that owns the screen
8. **Mutations and Revalidation** — keep the UI consistent after data changes
9. **Forge Mission: Build the Application Shell** — integrate routes, shared state, route data, and recovery states

---
# 3.4.1 — Routing Changes the Screen Without Changing the Application
**Estimated time:** 14 minutes  
**Learner goal:** Understand a route as a mapping between a URL location and the UI that should be rendered for that location.

## 1. Start here

A real application often has more than one screen:

- `/` could be a home page.
- `/products` could be a product list.
- `/products/42` could be a product detail screen.

The important idea is simple:

**A route connects a location to the UI for that location.**

The user is still inside the same application. The current location changes, and the application chooses a different part of the UI to show.

## 2. Prediction

A user is on `/products` and navigates to `/products/42`.

What should change?

A. The whole application has to forget all React components.
B. The current route changes, so the UI can switch to the product detail screen.
C. The browser must stop running JavaScript.
D. Every piece of state in the application must automatically disappear.

**Review key:** B

**Feedback:** A route change selects different UI. It does not mean the whole application is destroyed and rebuilt from nothing.

## 3. Route table

Imagine this application has these routes:

```text
/                 → Home
/products         → ProductList
/products/42      → ProductDetail
/account          → Account
```

Which route should render for `/products/42`?

A. Home
B. ProductList
C. ProductDetail
D. Account

**Review key:** C

**Feedback:** The path points to the product detail route.

## 4. One application, many locations

A useful mental model is:

```text
Current URL
    ↓
route matching
    ↓
selected UI
```

The route is not the UI itself. It is the rule that helps the application decide what UI belongs at the current location.

## 5. Checkpoint

A teammate says, “Routing is just changing buttons.”

What is missing?

A. Nothing.
B. Routing connects application locations to the UI that should be rendered there.
C. Routing only changes CSS.
D. Routing only changes browser storage.

**Review key:** B

**Feedback:** Navigation may start with a click, but routing is about the relationship between location and application UI.

## 6. Forge takeaway

**Mental model:** A route is a location-to-UI rule.

**Senior habit:** When a screen feels confusing, ask: “What location am I at, and which part of the application owns that location?”

---
# 3.4.2 — Nested Routes and Layouts
**Estimated time:** 16 minutes  
**Learner goal:** Understand how a shared application shell can stay visible while a child route changes inside it.

## 1. The repeated shell problem

Imagine three account screens all have the same structure:

```text
Account header
Account navigation
-------------------
Current account screen
```

You could repeat that shell in three separate screens. But then a change to the account header means changing three places.

A nested route structure gives the shared shell a home of its own.

## 2. Parent and child

Use this simplified route tree:

```text
/account
  ├── /account/profile
  └── /account/security
```

The parent route owns the shared account layout.

The child route owns the content area.

## 3. Prediction

The user moves from `/account/profile` to `/account/security`.

What is the most useful mental model?

A. The account shell must be rewritten by both screens.
B. The shared parent can remain while the child content changes.
C. The browser deletes the parent UI permanently.
D. The child route becomes the entire application.

**Review key:** B

**Feedback:** Nested routes are useful because shared structure can remain while the currently selected child content changes.

## 4. A route tree

In React Router, a nested route can render its child through an outlet. The exact API depends on the router setup, but the concept is stable:

```text
Parent route
  ↓
shared layout
  ↓
child route content
```

For example, conceptually:

```jsx
function AccountLayout() {
  return (
    <div>
      <AccountNav />
      <Outlet />
    </div>
  );
}
```

Here, `<Outlet />` marks the place where the matched child route appears.

## 5. Choose the boundary

Which content belongs in `AccountLayout`?

A. Only the security form for `/account/security`.
B. The shared account navigation and shell that should remain across account screens.
C. Every component in the entire application.
D. Only the footer.

**Review key:** B

**Feedback:** A layout boundary should own what is genuinely shared by the routes beneath it.

## 6. Transfer

You later build:

```text
/dashboard
  ├── /dashboard/overview
  ├── /dashboard/reports
  └── /dashboard/settings
```

What belongs in the parent layout?

**Suggested answer:** The dashboard shell and navigation that should stay the same while the child screen changes.

## 7. Forge takeaway

**Mental model:** Nested routes let the UI mirror application structure.

**Senior habit:** When multiple screens repeat the same shell, ask whether the shared shell should become a parent route instead of duplicated screen code.

---
# 3.4.3 — The URL Can Be State
**Estimated time:** 15 minutes  
**Learner goal:** Recognize when information belongs in the URL because it describes where the user is or what view they are looking at.

## 1. Not all state belongs in memory

Earlier, you learned that a component can hold state.

Now add another possibility:

**Some state belongs in the URL.**

For example:

```text
/products?sort=price
```

The URL tells the application which sort view is active.

Or:

```text
/products/42
```

The path identifies which product is being viewed.

## 2. Prediction

A user filters a product list by `?category=books` and then copies the URL to a friend.

Why is putting the filter in the URL useful?

A. It makes the filter impossible to change.
B. The URL can represent the current view, so another person can open the same location.
C. It automatically stores every future filter forever.
D. It removes the need for any UI.

**Review key:** B

**Feedback:** URL state is useful when the state describes a shareable or navigable view.

## 3. Path vs query

Compare:

```text
/products/42
/products?sort=price
```

A useful beginner model is:

- the **path** often identifies the resource or screen location;
- the **query string** often describes options for that view.

This is a model, not a universal law. The important skill is recognizing information that belongs to the location itself.

## 4. Choose the owner

Which value is a strong candidate for the URL?

A. Whether a temporary tooltip is fading out.
B. Which product detail page the user is viewing.
C. A component's internal animation frame.
D. A one-time render counter.

**Review key:** B

**Feedback:** The selected product is part of the application location. The other examples are temporary local behavior.

## 5. Prediction

A user opens:

```text
/search?q=keyboard
```

They refresh the page.

What should a well-designed application be able to infer again?

A. That the user searched for “keyboard”.
B. The exact animation frame the input had before refresh.
C. The previous mouse coordinates.
D. The internal state of every component.

**Review key:** A

**Feedback:** The URL survives a refresh. That makes it useful for state that describes the current view.

## 6. Checkpoint

Finish the sentence:

“Put something in the URL when it describes ________.”

**Suggested answer:** “the current location or a meaningful, shareable view of the application.”

## 7. Forge takeaway

**Mental model:** The URL is not just an address. It can be part of the application's state model.

**Senior habit:** When someone says “users should be able to refresh, bookmark, share, or return to this view,” consider whether the important state belongs in the URL.

---
# 3.4.4 — Navigation Should Describe Intent
**Estimated time:** 13 minutes  
**Learner goal:** Distinguish navigation from arbitrary click behavior and choose navigation mechanisms that communicate where the user is going.

## 1. A link means something

In a web application, a navigation control should make its destination understandable.

Conceptually:

```jsx
<Link to="/products">Products</Link>
```

The important part is not memorizing one library API. The important part is that the control communicates a destination.

## 2. Prediction

Which control best expresses “go to the account page”?

A. A navigation link with an explicit destination.
B. A button whose click handler secretly changes the address.
C. A paragraph with a hidden click listener.
D. A timer that waits three seconds and changes the page.

**Review key:** A

**Feedback:** Navigation is a user-visible intent. The control should communicate that intent rather than hide the destination inside unrelated behavior.

## 3. Buttons do things; links go places

This is a useful rule of thumb:

**Link → navigation**

**Button → action**

The distinction matters because users build expectations around controls.

## 4. Active location

A navigation bar has links for:

```text
Home | Products | Account
```

The user is currently on `/account`.

What should the application make clear?

A. Only the first link is important.
B. The current location should be visually or semantically identifiable.
C. Every link should look identical in every state.
D. The route should be hidden.

**Review key:** B

**Feedback:** Users should be able to understand where they are, not just where they could go.

## 5. Checkpoint

A developer says, “I can make any clickable element navigate, so semantics do not matter.”

What is the better response?

A. Correct.
B. The meaning of the control matters because navigation and actions have different user expectations and accessibility consequences.

**Review key:** B

**Feedback:** Engineering is not only about whether the browser can make something work. The interface should communicate the intended behavior.

## 6. Forge takeaway

**Mental model:** Navigation should look and behave like navigation.

**Senior habit:** Before wiring a click, name the intent: “go somewhere” or “do something.” That choice often determines the correct control.

---
# 3.4.5 — Share State Deliberately
**Estimated time:** 17 minutes  
**Learner goal:** Choose between props and context based on how far data must travel and whether the relationship is truly shared.

## 1. The prop path

Suppose this tree exists:

```text
App
 └── Account
      └── AccountHeader
           └── AccountName
```

If only `AccountName` needs the account name, the value can travel through props.

```text
App
  ↓ props
Account
  ↓ props
AccountHeader
  ↓ props
AccountName
```

This is explicit. Anyone reading the tree can see the path.

## 2. When the path becomes noisy

Now imagine the same value must pass through many layers that do not use it.

That can become repetitive.

React provides Context for information that needs to be available to many components deep in a tree without manually passing it through every intermediate component.

## 3. Prediction

Which situation is the stronger reason to consider context?

A. Two components are siblings and one can simply pass a value to the other through their parent.
B. Many distant descendants need the same application-wide or subtree-wide information.
C. A single input has one local value.
D. A temporary animation flag exists in one component.

**Review key:** B

**Feedback:** Context is useful when information is broadly shared. It is not a replacement for all props.

## 4. Context is a boundary, too

Imagine:

```jsx
<ThemeContext.Provider value={theme}>
  <AppShell />
</ThemeContext.Provider>
```

The provider creates a boundary: components beneath it can read the shared value.

The important design question is not “Can I use context?”

It is:

**“Is this information truly shared enough to deserve this boundary?”**

## 5. Choose the design

You have a `ProfileCard` with a `name` prop used only by the card.

Should the whole application move that name into context?

A. Yes, because context is always cleaner.
B. No. The prop is local to the relationship and is already explicit.
C. Yes, because props should never be used for data.
D. Only if the card is large.

**Review key:** B

**Feedback:** Context has a cost too: it hides some data flow. Prefer explicit props when the relationship is simple.

## 6. Transfer

A shopping cart count is needed in the header, checkout screen, and product list.

What should you ask first?

**Suggested answer:** How broadly the information is shared and whether a context boundary is clearer than passing the value through many unrelated layers.

## 7. Forge takeaway

**Mental model:** Props make local relationships explicit. Context makes broadly shared relationships available without repeated prop plumbing.

**Senior habit:** Use the smallest state-sharing mechanism that keeps the data flow understandable.

---
# 3.4.6 — Reducers Give Complex Updates a Vocabulary
**Estimated time:** 18 minutes  
**Learner goal:** Recognize when state transitions have become complex enough that explicit actions and a reducer make the update logic easier to reason about.

## 1. A growing state problem

Imagine a task application with events like:

```text
add task
change task
remove task
mark task complete
clear completed tasks
```

If every update is handled by a different nested callback, the component can become hard to reason about.

A reducer gives those transitions names.

## 2. Action vocabulary

For example:

```js
{ type: "added", text: "Read docs" }
{ type: "deleted", id: 3 }
{ type: "toggled", id: 3 }
```

The object describes **what happened**.

The reducer decides how state changes in response.

## 3. Prediction

Which is the strongest benefit of action-based updates?

A. They make every application automatically faster.
B. They give complex state changes a shared vocabulary that can be inspected and reasoned about.
C. They remove the need for state.
D. They guarantee there are no bugs.

**Review key:** B

**Feedback:** A reducer does not magically remove bugs. It makes transitions explicit and centralizes the update logic.

## 4. Reducer shape

A simple reducer can look like:

```js
function tasksReducer(state, action) {
  switch (action.type) {
    case "added":
      return [...state, { id: action.id, text: action.text }];
    case "deleted":
      return state.filter(task => task.id !== action.id);
    default:
      return state;
  }
}
```

The reducer receives the current state and an action, then returns the next state.

## 5. Read the transition

Start with:

```js
const state = [
  { id: 1, text: "Read", done: false },
  { id: 2, text: "Practice", done: false }
];
```

Then dispatch:

```js
{ type: "deleted", id: 1 }
```

What should the next state contain?

A. Both tasks
B. Only the task with `id: 1`
C. Only the task with `id: 2`
D. An empty array

**Review key:** C

**Feedback:** The reducer removes the task whose id matches the action.

## 6. Reducer plus context

For a larger tree, React supports combining a reducer with context so deeply nested components can read state and dispatch actions without passing them through every intermediate component.

A useful model is:

```text
Context → shared state
Context → dispatch
Reducer → transition rules
Components → render + dispatch events
```

## 7. Checkpoint

When is a reducer most useful?

A. Every component with one boolean.
B. State with many related transitions that benefit from explicit actions.
C. Any component that imports React.
D. Only for forms.

**Review key:** B

**Feedback:** A reducer earns its complexity when the transition logic benefits from being named and centralized.

## 8. Forge takeaway

**Mental model:** A reducer turns “a pile of state updates” into named transitions.

**Senior habit:** When updates are getting hard to describe, write down the events first. If the event vocabulary clarifies the design, a reducer may be the right boundary.

---
# 3.4.7 — Route Data Belongs Near the Route
**Estimated time:** 18 minutes  
**Learner goal:** Understand why route-specific data can belong near the route that owns the screen, and distinguish route data from local UI state.

## 1. Two kinds of information

Consider a product detail screen.

Some information describes the screen itself:

```text
product 42
```

Other information is local UI behavior:

```text
is the review form open?
is the help popover open?
```

The first group is often part of the route's application data. The second group is local interaction state.

## 2. Route-owned data

A route for `/products/42` needs the product with id `42`.

A clean mental model is:

```text
route
  ↓
identify resource
  ↓
load data
  ↓
render screen
```

Some routing libraries provide route-level loaders or similar mechanisms for this. React Router currently provides route loaders and exposes their results to the matched route components.

## 3. Prediction

A route `/teams/12` needs team `12` before rendering its main content.

Which boundary is the strongest candidate for loading the team data?

A. An unrelated button component deep in the screen.
B. The route or route-level data boundary responsible for the team screen.
C. A CSS file.
D. Every leaf component separately.

**Review key:** B

**Feedback:** Route-specific data belongs near the route that owns the screen. This gives the application a clear place to coordinate data needed for that location.

## 4. Loading and error states belong to the data boundary

If the team data is not ready yet, the application needs a loading state.

If the request fails, it needs an error state.

That gives a simple route lifecycle:

```text
match route
   ↓
start data work
   ↓
loading
   ↓
 ┌───────────────┐
 │               │
 success       failure
 │               │
render data    render recovery
```

The important skill is not memorizing a library API. It is deciding **which boundary owns the data and therefore owns the states around that data**.

## 5. Do not duplicate remote data in every child

Suppose a route has a product and five child components all independently request the same product.

What problem can that create?

A. It guarantees faster rendering.
B. It duplicates responsibility and makes the data flow harder to understand.
C. It removes the need for errors.
D. It makes the URL shorter.

**Review key:** B

**Feedback:** Shared route data should generally have an identifiable owner instead of being requested independently by every child.

## 6. Checkpoint

Complete this sentence:

“Local UI state answers ________. Route data answers ________.”

**Suggested answer:** “Local UI state answers questions about the current interaction; route data answers what information the current application location needs.”

## 7. Forge takeaway

**Mental model:** Put data ownership near the boundary that owns the screen that needs it.

**Senior habit:** When a component fetches data, ask whether that component truly owns the data or is compensating for a missing higher-level boundary.

---
# 3.4.8 — Mutations and Revalidation
**Estimated time:** 16 minutes  
**Learner goal:** Understand that changing remote data creates a synchronization problem: the UI must eventually reflect the result of the mutation.

## 1. A save operation is not finished when the click happens

Imagine a user edits a project title and presses Save.

There are at least three meaningful moments:

```text
user submits
     ↓
mutation starts
     ↓
server accepts or rejects
     ↓
UI reflects the result
```

The hard part is not the button. The hard part is keeping the UI and remote data aligned.

## 2. Prediction

A user changes a project title from “Forge” to “Forge Academy”. The mutation succeeds.

What should happen next?

A. Only the button label should change forever.
B. The application should update or reload the relevant data so the displayed project reflects the saved result.
C. The route should always navigate away.
D. The application should ignore the result.

**Review key:** B

**Feedback:** A successful mutation changes data. The UI must reconcile with the new source of truth.

## 3. Optimistic vs confirmed UI

Two common approaches are:

**Confirmed update:** wait for the successful result, then show the new server-backed value.

**Optimistic update:** show the expected new value immediately, while the real mutation is still in flight, and be prepared to recover if it fails.

Neither is automatically correct. The choice depends on how reversible the action is, how important immediate feedback is, and how failure should be handled.

## 4. Revalidation

Some routing systems can automatically re-run route data after a successful mutation. React Router, for example, revalidates loader data after route actions complete.

The deeper concept is:

```text
mutation changes data
        ↓
revalidate related data
        ↓
render current truth
```

## 5. Failure matters

Suppose the mutation fails.

What should a robust interface do?

A. Pretend the save succeeded forever.
B. Make the failure visible and keep the user’s recoverable input when appropriate.
C. Delete the entire page.
D. Hide the error so the screen looks clean.

**Review key:** B

**Feedback:** Error handling is part of the interaction design. The user needs to know what happened and what they can do next.

## 6. Checkpoint

A developer says, “Once the mutation request finishes, the job is done.”

What are they missing?

A. Nothing.
B. The application still needs to reconcile the visible UI with the mutation result.

**Review key:** B

**Feedback:** The remote data changed. The screen must reflect the result or explain the failure.

## 7. Forge takeaway

**Mental model:** A mutation creates a synchronization problem between the user's interaction, remote data, and the current UI.

**Senior habit:** Every mutation should have an answer to three questions: what happens while it runs, what happens if it succeeds, and what happens if it fails?

---
# 3.4.9 — Forge Mission: Build the Application Shell
**Estimated time:** 24 minutes  
**Learner goal:** Design and explain a small React application that uses route structure, shared state, route-level data, loading/error states, and explicit mutation handling.

## 1. The scenario

You are building a small Forge project tracker.

It has these locations:

```text
/projects
/projects/42
/projects/42/settings
```

The application should provide:

- a projects list;
- a project detail screen;
- a project settings screen;
- a shared project navigation shell;
- a small global preference such as compact mode;
- project data loaded for the active project;
- a rename action with success and failure handling.

Your job is to design the boundaries before you write code.

## 2. Route tree

Create a route structure that looks roughly like:

```text
/projects
  └── /projects/:projectId
        └── /projects/:projectId/settings
```

**Question:** Which screen should act as the parent for the project detail and settings screens?

A. The project route at `/projects/:projectId`.
B. The home page.
C. The rename button.
D. The compact-mode toggle.

**Review key:** A

**Feedback:** The project route owns the shared project shell and provides the natural parent for child screens.

## 3. Shared shell

The detail and settings screens both need:

```text
Project title
Project navigation
Current child screen
```

Where should the shared navigation live?

A. Inside both child screens.
B. Inside the parent project layout.
C. Inside the rename form only.
D. In a CSS file.

**Review key:** B

**Feedback:** Shared UI belongs at the boundary that owns the shared relationship.

## 4. URL state

The current project id is already represented by the route.

What should the application avoid doing?

A. Reading the route parameter.
B. Storing a second unrelated copy of the project id in local state unless there is a real reason.
C. Using the project id to load project data.
D. Showing the project id in the UI when useful.

**Review key:** B

**Feedback:** Duplicating the same source of truth creates synchronization risk.

## 5. Global preference

Compact mode is used by the header, project list, and settings screen.

Choose the most reasonable starting point:

A. Add a prop through twenty unrelated components.
B. Consider a context boundary for the shared preference.
C. Put the value in every child separately.
D. Store it in CSS only and hope components can read it.

**Review key:** B

**Feedback:** A preference shared broadly across a subtree is a reasonable context candidate.

## 6. Project data

The project detail route needs the current project's data.

Choose the cleanest ownership model:

A. Every child component independently requests the project.
B. The project route owns the route-level data and passes the relevant pieces down.
C. The settings page owns the project for the entire application.
D. The navigation component fetches the project and secretly stores it.

**Review key:** B

**Feedback:** Route-level data belongs near the route that owns the screen.

## 7. Rename flow

The user submits a new project name.

Write the four states the UI should be able to reason about:

```text
1. ________
2. ________
3. ________
4. ________
```

**Suggested answer:** “ready, submitting, success, failure” or an equivalent state model.

## 8. Explain the mutation boundary

In 3–5 sentences, explain what should happen when the rename succeeds.

**Strong answer:** “The mutation should report success. The application should reconcile the displayed project data with the saved result, either through the updated result or by revalidating the relevant route data. The UI should stop showing a pending state. Other parts of the screen that depend on the project name should reflect the updated value.”

## 9. Debug the architecture

A teammate proposes this design:

```text
ProjectList fetches the project.
ProjectHeader fetches the project again.
ProjectSettings stores a second project id in local state.
RenameForm updates its own local name and never reports the result.
Navigation lives inside both child screens.
```

What are the first three structural problems you would call out?

**Strong answer:** “The project data has multiple owners, the project id has a duplicated source of truth, and the mutation result is not being propagated back into the application data flow. The duplicated navigation is another clear boundary problem.”

**Hint 1:** Look for duplicated ownership.

**Hint 2:** Ask which value should have one source of truth.

**Hint 3:** Ask which boundary should know that the remote data changed.

## 10. Transfer

Now change the application to:

```text
/teams
/teams/:teamId
/teams/:teamId/members
```

The same reasoning should still work.

Write three design decisions you would make before writing the components.

**Suggested answer:**

- “The team route owns the shared team shell.”
- “The team id comes from the route.”
- “Team data has a clear route-level owner, while local UI state stays local and shared preferences use an appropriate shared boundary.”

## 11. Module mastery gate

You are ready to leave Module 3.4 when you can explain all four without relying on memorized framework steps:

**1. Route:** What location does this UI belong to?

**2. Ownership:** Which boundary owns this data or state?

**3. Synchronization:** What happens after a mutation succeeds or fails?

**4. Structure:** Which pieces should stay shared, and which pieces should be children?

## 12. Forge takeaway

A React application becomes easier to reason about when its structure mirrors its responsibilities:

```text
URL
 ↓
route boundary
 ↓
shared layout
 ↓
route data + local UI state
 ↓
components
 ↓
user actions
 ↓
mutations
 ↓
updated data
```

**Senior habit:** When an application feels tangled, stop adding components. Draw the route tree, name the owners, identify duplicated state, and trace what happens after a mutation.

---
## Module completion

Before moving on, explain this sentence in your own words:

> **A good React application makes location, ownership, and data flow visible.**

If you can trace a user from URL → route → data → UI → action → mutation → updated UI without guessing where the responsibility lives, you have the core skill this module is trying to build.
