# Forge Curriculum v2
# Module 3.2 — React: Interaction and Effects

## Module outcome

By the end of this module, the learner can build React interfaces that respond to user interaction, control form inputs with state, distinguish rendering from event logic and Effects, and use `useEffect` only when a component must synchronize with something outside React. They can choose the right dependency list, clean up synchronization work, and explain why an Effect should exist before writing one.

## Module lessons

1. **Events Belong to the Interaction** — event handlers and state changes
2. **Pass Behavior Through the Component Tree** — handler props and child-to-parent communication
3. **Event Data and Propagation** — event objects, bubbling, and stopping propagation
4. **Controlled Inputs: State Owns the Value** — inputs driven by React state
5. **Form Submission: One Source of Truth** — submit handling and preventing unwanted browser navigation
6. **Derived Data Is Not an Effect** — render-time calculations versus synchronization
7. **Effects: Synchronize With an External System** — the purpose of `useEffect`
8. **Dependencies and Cleanup** — resynchronization, cleanup, and accurate dependencies
9. **Forge Mission: Build an Interactive Settings Panel** — integration and transfer


# 3.2.1 — Events Belong to the Interaction
**Estimated time:** 13 minutes  
**Learner goal:** Attach React event handlers correctly and connect user interaction to state changes without calling the handler during render.

## 1. Start here

In the previous module, the screen was described from state.

Now we need to answer another question:

**What causes the state to change?**

A click. A key press. A form submission. A change to an input.

In React, an event handler is a function that React calls when the matching interaction happens.

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <button onClick={handleClick}>
      Clicked {count} times
    </button>
  );
}
```

The important relationship is:

**interaction → event handler → state update → render**

## 2. Prediction

What happens when the button is clicked once?

A. `handleClick` is passed to React and then called by React when the click happens.
B. `handleClick` runs before the page is shown.
C. The button ignores the handler.
D. React stores the function result as the button text.

**Review key:** A

**Feedback:** `onClick={handleClick}` passes a function. React calls that function when the user clicks.

## 3. The classic mistake

Compare these two lines:

```jsx
<button onClick={handleClick}>Save</button>
<button onClick={handleClick()}>Save</button>
```

They are not equivalent.

`onClick={handleClick}` means: “Here is the function to call later.”

`onClick={handleClick()}` means: “Run this function right now and use its return value here.”

## 4. Fix it

The following component logs a message immediately instead of waiting for the click:

```jsx
function SaveButton() {
  function handleSave() {
    console.log("Saved");
  }

  return <button onClick={handleSave()}>Save</button>;
}
```

**Task:** Change one thing so the log happens only after the click.

**Expected repair:**

```jsx
return <button onClick={handleSave}>Save</button>;
```

## 5. Event handlers and state

A handler is often the place where a user action becomes a state change.

```jsx
function LightSwitch() {
  const [on, setOn] = useState(false);

  function handleToggle() {
    setOn(!on);
  }

  return (
    <button onClick={handleToggle}>
      {on ? "On" : "Off"}
    </button>
  );
}
```

The event handler does not manually edit the text. It changes state. The render then describes the new UI.

## 6. Explain it

Complete the chain:

“User clicks → ________ → state changes → ________.”

**Suggested answer:** “event handler runs; React renders from the new state.”

## 7. Checkpoint

Which line best matches the React model?

A. `button.textContent = "On"`
B. `setOn(true)` inside an event handler
C. `document.querySelector("button").click()` during render
D. Rebuilding the entire page after every click

**Review key:** B

**Feedback:** The handler changes the state that the UI depends on. React can then render the correct result.

## 8. Forge takeaway

**Mental model:** Events are how user actions enter the state model.

**Senior habit:** Keep the direction clear: user action → handler → state change → render.

### Lesson completion
Explain why `onClick={handleClick}` and `onClick={handleClick()}` mean different things, then repair the broken button.


# 3.2.2 — Pass Behavior Through the Component Tree
**Estimated time:** 14 minutes  
**Learner goal:** Pass event handlers as props so child components can trigger behavior owned by a parent.

## 1. The child does not need to own everything

A component can receive not only data, but also a function that tells it what to do when something happens.

```jsx
function DeleteButton({ onDelete }) {
  return <button onClick={onDelete}>Delete</button>;
}

function ProductRow() {
  function handleDelete() {
    console.log("Delete requested");
  }

  return <DeleteButton onDelete={handleDelete} />;
}
```

The child owns the button.

The parent owns the action.

This gives us a useful communication pattern:

**parent defines behavior → child receives handler prop → child invokes handler**

## 2. Prediction

When the user clicks `DeleteButton`, which function eventually runs?

A. `DeleteButton` magically creates its own delete logic.
B. `handleDelete`, because the parent passed it as `onDelete`.
C. The child component becomes the parent.
D. React changes the prop into state automatically.

**Review key:** B

**Feedback:** Functions can travel down the component tree as props. The child can call the function without owning the underlying state or decision.

## 3. Build it

Start with:

```jsx
function Toolbar() {
  return (
    <div>
      <button>Archive</button>
    </div>
  );
}
```

Create this parent handler:

```jsx
function Toolbar() {
  function handleArchive() {
    console.log("Archive requested");
  }

  return (
    <div>
      <button>Archive</button>
    </div>
  );
}
```

Now move the button into a child component called `ArchiveButton`, then pass the handler as `onArchive`.

Expected shape:

```jsx
function ArchiveButton({ onArchive }) {
  return <button onClick={onArchive}>Archive</button>;
}

function Toolbar() {
  function handleArchive() {
    console.log("Archive requested");
  }

  return <ArchiveButton onArchive={handleArchive} />;
}
```

## 4. Who owns the fact?

Suppose the parent stores whether an item is archived:

```jsx
const [archived, setArchived] = useState(false);
```

Should the child secretly create a second `archived` state just to make its button work?

A. Yes. Every component should own its own copy of important state.
B. No. If the parent owns the shared fact, the child can receive the action it needs as a prop.
C. Only if the button is large.
D. Only after the user clicks twice.

**Review key:** B

**Feedback:** Duplicate state can create two competing sources of truth. A child can receive a handler and let the owner update the actual state.

## 5. Callback naming

React does not require a special word for callback props.

These are ordinary prop names:

```jsx
<ArchiveButton onArchive={handleArchive} />
<ArchiveButton onConfirm={handleConfirm} />
<ArchiveButton onRemove={handleRemove} />
```

The useful convention is that the prop name describes what the child can report upward.

## 6. Explain the direction

Who does what?

**Parent:** owns the shared state and defines the behavior.

**Child:** renders the control and calls the handler when the interaction happens.

**React:** passes the function through props and re-renders after the state owner updates state.

## 7. Checkpoint

A child button needs to tell its parent that the user selected item `42`.

Which design fits the pattern we just learned?

A. The child changes the parent's state directly without communication.
B. The parent passes a callback such as `onSelect`, and the child calls `onSelect(42)`.
C. The child creates a database entry.
D. The parent reads the child's local variable automatically.

**Review key:** B

**Feedback:** The child reports the interaction upward through a function prop. The parent decides what the shared state change should be.

## 8. Forge takeaway

**Mental model:** Data usually flows down; user intent can travel upward through callback props.

**Senior habit:** Put the state where the shared fact belongs, then pass the smallest behavior the child needs.

### Lesson completion
Wire a child button to a parent-owned action and explain why the child should not create a duplicate copy of the parent's shared state.


# 3.2.3 — Event Data and Propagation
**Estimated time:** 14 minutes  
**Learner goal:** Use the event object when needed, understand event propagation through parent and child elements, and stop propagation deliberately when the interaction requires it.

## 1. An event carries information

When React calls an event handler, it can provide an event object describing what happened.

```jsx
function SearchBox() {
  function handleChange(event) {
    console.log(event.target.value);
  }

  return <input onChange={handleChange} />;
}
```

The exact event type depends on the interaction. The important idea is simple:

**the event can carry information about the interaction.**

## 2. Prediction

What does `event.target.value` represent for the text input above?

A. The current text in the input that produced the event.
B. The React component's entire state object.
C. The browser's current URL.
D. The name of the parent component.

**Review key:** A

**Feedback:** The target is the element involved in the event, and its value is the current input value.

## 3. Events can move upward

Consider:

```jsx
function Card() {
  return (
    <div onClick={() => console.log("Card")}>
      <button onClick={() => console.log("Button")}>Open</button>
    </div>
  );
}
```

Click the button.

Which log order should you expect?

A. Card only
B. Button only
C. Button, then Card
D. Card, then Button

**Review key:** C

**Feedback:** The click happens on the button first. The event then propagates upward to the parent.

## 4. Stop propagation when the boundary matters

Suppose the card itself opens a details panel, but the delete button inside the card should delete without opening the panel.

```jsx
function Card() {
  function handleCardClick() {
    console.log("Open details");
  }

  function handleDelete(event) {
    event.stopPropagation();
    console.log("Delete");
  }

  return (
    <div onClick={handleCardClick}>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

Here `stopPropagation()` prevents the event from continuing to the card's click handler.

## 5. What should you not do?

A developer adds `onClick` to a wrapper around every button and then adds more special cases every time a nested control behaves strangely.

What is the better first question?

A. Which event handlers are receiving the propagated event, and which element actually owns the interaction?
B. How many more wrappers can we add?
C. Can we remove every button and use text?
D. Can CSS stop the event?

**Review key:** A

**Feedback:** Event propagation can be useful, but it can also create surprising interactions. Trace which element received the event and which ancestors also react.

## 6. Event handler versus effect

A click that changes state is an event-handling job.

It should usually look like:

```jsx
function handleSave() {
  setSaved(true);
}
```

Do not add an Effect just because state changed.

Effects solve a different problem, which we will teach later in this module.

## 7. Checkpoint

A nested button triggers both its own action and a parent's action. What concept should you investigate first?

A. Event propagation
B. TypeScript generics
C. Routing
D. Server rendering

**Review key:** A

**Feedback:** The symptom starts inside the browser event path. Understand propagation before changing unrelated architecture.

## 8. Forge takeaway

**Mental model:** An event has both a source and a path. A handler can use event data, and a parent can receive a propagated event unless the child stops it.

**Senior habit:** When an interaction seems to fire twice, inspect the event path before blaming React state.

### Lesson completion
Use an event object to read input data and stop a child interaction from triggering an unwanted parent action.


# 3.2.4 — Controlled Inputs: State Owns the Value
**Estimated time:** 15 minutes  
**Learner goal:** Build controlled inputs where React state is the source of truth for the current value and user input updates that state.

## 1. Two places could remember the value

A text field has a value. That value could live mainly inside the browser input itself, or React can make state the source of truth.

In a controlled input, React owns the current value:

```jsx
function NameField() {
  const [name, setName] = useState("");

  return (
    <input
      value={name}
      onChange={event => setName(event.target.value)}
    />
  );
}
```

The loop is:

**user types → event gives new value → state updates → React renders the value**

## 2. Prediction

What happens if you type `Ada`?

A. The browser changes the field, but React does not know anything happened.
B. The change handler reads `Ada`, state becomes `Ada`, and the input is rendered from that state.
C. React replaces the input with a button.
D. The input can no longer change.

**Review key:** B

**Feedback:** The controlled input keeps the value in the React state model.

## 3. Build it

Start here:

```jsx
function UsernameField() {
  return <input />;
}
```

Add state:

```jsx
const [username, setUsername] = useState("");
```

Then connect both directions:

```jsx
<input
  value={username}
  onChange={event => setUsername(event.target.value)}
/>
```

## 4. What breaks?

Consider:

```jsx
function UsernameField() {
  const [username, setUsername] = useState("");

  return (
    <input
      value={username}
      onChange={event => setUsername(username)}
    />
  );
}
```

You can type, but the displayed value does not follow the new text.

What is wrong?

A. The handler stores the old state instead of the new input value.
B. `value` should be removed because React cannot control inputs.
C. `useState` only works for numbers.
D. The input needs a server.

**Review key:** A

**Feedback:** The event provides the new text. The setter must receive that new value.

## 5. State as a source of truth

Why is this pattern useful?

Because other UI can read the same state.

```jsx
<p>Characters: {username.length}</p>
```

Now the count and the input value come from the same fact.

## 6. Small extension

Add a rule: the name should be at most 12 characters.

One simple approach is to update state only when the new value is allowed:

```jsx
function handleChange(event) {
  const next = event.target.value;

  if (next.length <= 12) {
    setUsername(next);
  }
}
```

Notice what the handler is doing: it decides which new state is valid.

## 7. Checkpoint

Which design has the clearest source of truth for the input value?

A. The DOM input and a separate state value that may disagree
B. React state, with the input rendered from that state
C. A CSS class
D. A variable created once outside the component

**Review key:** B

**Feedback:** A controlled input makes the state/value relationship explicit.

## 8. Forge takeaway

**Mental model:** A controlled input is a small feedback loop: user input produces new state, and state produces the current input value.

**Senior habit:** When a form behaves strangely, ask where the value actually lives and whether there is more than one source of truth.

### Lesson completion
Build a controlled input and repair the handler so the state receives the new value from the event.


# 3.2.5 — Form Submission: One Source of Truth
**Estimated time:** 15 minutes  
**Learner goal:** Handle React form submission with controlled fields and prevent unwanted browser navigation when the application should handle the submission itself.

## 1. A form has a browser behavior

When a normal HTML form is submitted, the browser may perform its default submission behavior.

In a React application, you may want the application to handle the submission itself.

```jsx
function LoginForm() {
  const [email, setEmail] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    console.log(email);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
      </label>
      <button type="submit">Continue</button>
    </form>
  );
}
```

The browser still knows this is a real form. React simply takes control of the submission path.

## 2. Prediction

What does `event.preventDefault()` do in this example?

A. It prevents the form's default browser submission behavior so the React handler can handle the submission.
B. It prevents state from changing.
C. It prevents the user from typing.
D. It deletes the form.

**Review key:** A

**Feedback:** `preventDefault()` controls the browser's default action for this event. It does not stop your handler from running.

## 3. Build the smallest form

Create:

```jsx
function SearchForm() {
  const [query, setQuery] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    console.log(query);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
```

## 4. Why submit instead of click?

Suppose the user types a query and presses Enter while focused in the input.

A form's `onSubmit` handler represents the form action more accurately than attaching the behavior only to one particular button click.

The interaction is about submitting the form, not merely clicking one element.

## 5. Validate before acting

Add a simple rule:

```jsx
function handleSubmit(event) {
  event.preventDefault();

  const trimmed = query.trim();

  if (trimmed === "") {
    return;
  }

  console.log(trimmed);
}
```

The state still contains the user's input. The handler creates a validated value for this submission.

## 6. Do not store what you can derive

Suppose the UI needs to show:

```text
Search: forge
Length: 5
```

You do not need both `query` and `queryLength` as separate state.

```jsx
<p>Search: {query}</p>
<p>Length: {query.length}</p>
```

The length is derived from the current query.

## 7. Checkpoint

Which design creates the fewest competing facts?

A. `query` state plus `queryLength` state plus a second variable that mirrors both
B. `query` state and `query.length` during rendering
C. Store the query only in the button
D. Store the query only in the submit event object

**Review key:** B

**Feedback:** Keep the source fact in state. Calculate dependent values when rendering unless a separate source of truth is genuinely required.

## 8. Forge takeaway

**Mental model:** A controlled form keeps input state in React, then an event handler decides what a submission should do.

**Senior habit:** Separate three questions: “What value do we have?”, “What does the user intend?”, and “What should happen because of that intent?”

### Lesson completion
Build a controlled form, prevent the default browser submission, and derive a display value from the single source of truth.


# 3.2.6 — Derived Data Is Not an Effect
**Estimated time:** 14 minutes  
**Learner goal:** Recognize when a value should be calculated during rendering or handled in an event instead of being stored in state and synchronized with an Effect.

## 1. Effects are not a general reaction system

A common beginner pattern is:

```jsx
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(firstName + " " + lastName);
}, [firstName, lastName]);
```

This works, but it creates a second source of state for something that can be calculated directly.

Better:

```jsx
const fullName = firstName + " " + lastName;
```

## 2. Prediction

Which value truly needs its own state in this example?

A. `firstName` and `lastName`
B. `fullName` as a third synchronized state value
C. Every displayed sentence
D. The output paragraph itself

**Review key:** A

**Feedback:** `fullName` is derived from the two source values. There is no external system to synchronize.

## 3. Why the extra Effect is a problem

With the Effect version, a name change can produce:

1. a state update for `firstName` or `lastName`,
2. a render,
3. an Effect run,
4. another state update for `fullName`,
5. another render.

The simpler render-time calculation keeps the data flow direct.

## 4. Move this logic

You see:

```jsx
useEffect(() => {
  setTotal(price * quantity);
}, [price, quantity]);
```

What should replace it?

```jsx
const total = price * quantity;
```

No Effect needed.

## 5. Event logic is different too

Suppose clicking “Save” should show a message.

Do not write an Effect that watches a `saved` state just to call code because `saved` became `true`.

The click already is the event that caused the action.

```jsx
function handleSave() {
  setSaved(true);
  console.log("Saving...");
}
```

An Effect is for synchronization that needs to happen because the rendered component must stay connected to something outside React.

## 6. Choose the job

Match each task to the right place:

1. Calculate `total = price * quantity`.
2. Respond to a button click that submits a change.
3. Keep a browser timer synchronized with a state value.

A. Render → Event handler → Effect
B. Effect → Render → Event handler
C. Event handler → Effect → Render
D. Render → Effect → Event handler

**Review key:** A

**Feedback:** Calculate pure values during render, react directly to user actions in handlers, and use Effects when synchronizing with an external system.

## 7. Checkpoint

A developer says, “Whenever this state changes, I need an Effect.”

What is the better question?

A. “What external system are we synchronizing with?”
B. “How many Effects can we add?”
C. “Can we make the component re-render four times?”
D. “Can state replace every event handler?”

**Review key:** A

**Feedback:** A state change alone does not justify an Effect. First identify the external system or side effect that actually needs synchronization.

## 8. Forge takeaway

**Mental model:** Render computes UI from data. Event handlers respond to user actions. Effects synchronize with external systems.

**Senior habit:** Before writing `useEffect`, name the external system you are synchronizing with. If you cannot name one, stop and reconsider.

### Lesson completion
Remove an unnecessary Effect from a derived-value example and classify three pieces of logic as render, event, or synchronization work.


# 3.2.7 — Effects: Synchronize With an External System
**Estimated time:** 17 minutes  
**Learner goal:** Create a simple `useEffect` that keeps React state synchronized with an external browser system.

## 1. The boundary

React controls the component's render output.

Sometimes something outside React must be kept in sync too.

For example, the browser tab has a document title. React state can represent the current status, but the browser owns the actual tab title.

That is a synchronization problem.

```jsx
import { useEffect, useState } from "react";

function Status() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    document.title = online ? "Online" : "Offline";
  }, [online]);

  return (
    <button onClick={() => setOnline(value => !value)}>
      {online ? "Online" : "Offline"}
    </button>
  );
}
```

The Effect keeps an external browser property aligned with React state.

## 2. Prediction

What is the Effect doing?

A. Calculating whether `online` is true.
B. Synchronizing the browser's document title with the current React state.
C. Replacing the button with a browser API.
D. Creating new state on every render.

**Review key:** B

**Feedback:** The title is outside React's render tree. The Effect synchronizes it with the value React already knows.

## 3. Effect shape

Read this as two jobs:

```jsx
useEffect(() => {
  // start or perform synchronization

  return () => {
    // stop or undo synchronization, when needed
  };
}, [/* reactive values used by the synchronization */]);
```

The dependency list describes what values the synchronization reads and therefore when React should resynchronize it.

## 4. A real external connection

Consider a timer:

```jsx
useEffect(() => {
  const id = setInterval(() => {
    console.log("tick");
  }, 1000);

  return () => {
    clearInterval(id);
  };
}, []);
```

A timer is not controlled by React rendering. It is an external browser scheduling system.

The Effect starts the timer.

The cleanup stops the timer.

## 5. Why cleanup matters

Without cleanup, removing the component could leave the timer running.

Then an interface that looks gone could still have code firing in the background.

The cleanup is the instruction that reverses or stops the synchronization started by the Effect.

## 6. Dependency prediction

Suppose the Effect uses `roomId`:

```jsx
useEffect(() => {
  console.log(`Synchronizing room ${roomId}`);
}, [roomId]);
```

If `roomId` changes from `"general"` to `"travel"`, should the Effect synchronize again?

A. Yes, because the synchronization depends on `roomId`.
B. No, Effects only run once.
C. Only if the user refreshes the page.
D. Only if CSS changes.

**Review key:** A

**Feedback:** A changed dependency means the synchronization needs to be updated for the new value.

## 7. Effect or event?

A user clicks a “Start connection” button. The click chooses to begin the connection. The Effect can then own the ongoing synchronization with the external system.

This division is useful:

**event handler = user intent**

**Effect = keep an external system synchronized with current React values**

## 8. Checkpoint

Which scenario most clearly calls for an Effect?

A. Calculating `fullName` from two strings
B. Deciding what to do when a button is clicked
C. Starting and cleaning up a timer that must exist while the component is active
D. Choosing which color to render from a state value

**Review key:** C

**Feedback:** The timer lives outside React's render calculation, so synchronization and cleanup are needed.

## 9. Forge takeaway

**Mental model:** An Effect is an escape hatch for synchronization with something outside React.

**Senior habit:** State is not a signal that “something must happen.” First identify the external system, then make the smallest synchronization Effect that keeps it aligned.

### Lesson completion
Write one Effect that synchronizes an external browser property and one Effect that starts and cleans up a timer.


# 3.2.8 — Dependencies and Cleanup
**Estimated time:** 17 minutes  
**Learner goal:** Explain why Effect dependencies must match the reactive values the Effect reads, and repair cleanup and dependency mistakes.

## 1. Dependencies are not decorations

Read this Effect:

```jsx
function Room({ roomId }) {
  useEffect(() => {
    console.log(`Connected to ${roomId}`);

    return () => {
      console.log(`Disconnected from ${roomId}`);
    };
  }, [roomId]);

  return <p>Room: {roomId}</p>;
}
```

The Effect reads `roomId`, so `roomId` belongs in the dependency list.

## 2. What happens when the dependency changes?

Suppose `roomId` changes from `general` to `travel`.

A simplified sequence is:

**cleanup old synchronization → setup new synchronization**

The old room should stop being active before the new room becomes the current synchronization target.

## 3. Repair the missing dependency

Consider:

```jsx
function Room({ roomId }) {
  useEffect(() => {
    console.log(`Connected to ${roomId}`);
  }, []);

  return <p>{roomId}</p>;
}
```

What is the problem?

A. The Effect reads `roomId` but claims it never depends on `roomId`.
B. `roomId` can never change.
C. Empty arrays automatically track every value.
D. React ignores props inside Effects.

**Review key:** A

**Feedback:** The dependency list needs to describe the reactive values that the Effect reads. Otherwise the synchronization can become stale.

## 4. Cleanup must mirror setup

If an Effect starts something that stays active, ask what should stop it.

Start:

```jsx
const id = setInterval(doWork, 1000);
```

Cleanup:

```jsx
clearInterval(id);
```

Start:

```jsx
window.addEventListener("resize", handleResize);
```

Cleanup:

```jsx
window.removeEventListener("resize", handleResize);
```

The pairing is not ceremony. It defines the boundary of the synchronization.

## 5. Broken cleanup

This code adds a resize listener:

```jsx
useEffect(() => {
  function handleResize() {
    console.log(window.innerWidth);
  }

  window.addEventListener("resize", handleResize);
}, []);
```

What is missing?

A. A cleanup function that removes the listener.
B. A second React component.
C. A new state variable for every resize event.
D. A database.

**Review key:** A

**Feedback:** The Effect starts a long-lived browser subscription. It should return cleanup that removes that same subscription.

## 6. The smallest correct dependency list

Imagine:

```jsx
useEffect(() => {
  document.title = `${count} tasks`;
}, [count]);
```

The Effect reads `count` and synchronizes the document title.

Do not add unrelated values simply because they exist in the component.

The dependency list should represent the Effect's actual reactive inputs.

## 7. Common trap: the infinite loop

Consider:

```jsx
const [message, setMessage] = useState("");

useEffect(() => {
  setMessage(message.trim());
}, [message]);
```

Why can this become problematic?

Because the Effect reads `message`, then changes `message`, which can trigger the Effect again.

The first question is not “How do I silence React?”

The first question is “Why is an Effect managing this transformation at all?”

If the goal is simply to create a trimmed value for rendering or submission, calculate it directly instead.

## 8. Development behavior

In development, React may run an Effect's setup and cleanup more than once while checking whether the synchronization is correctly mirrored.

That is useful evidence.

If repeated setup/cleanup breaks the component, the synchronization probably is not being started and stopped cleanly.

## 9. Checkpoint

An Effect does all three of these:

- starts a browser subscription,
- reads `roomId`,
- needs to stop the subscription when `roomId` changes or the component leaves.

Which shape is most appropriate?

A.
```jsx
useEffect(() => {
  start(roomId);
}, []);
```

B.
```jsx
useEffect(() => {
  const stop = start(roomId);
  return stop;
}, [roomId]);
```

C.
```jsx
useEffect(() => {
  start(roomId);
  start(roomId);
}, []);
```

D.
```jsx
const value = start(roomId);
```

**Review key:** B

**Feedback:** The synchronization uses `roomId`, so it belongs in dependencies, and cleanup must stop the work that the Effect started.

## 10. Forge takeaway

**Mental model:** An Effect is a synchronization process with a start, a set of reactive inputs, and—when needed—a stop.

**Senior habit:** Read an Effect as a contract: “Given these reactive values, keep this external system synchronized, and clean it up when the relationship changes.”

### Lesson completion
Repair a stale dependency, add cleanup to a browser subscription, and explain why an Effect that updates the same state it watches may be a sign of a wrong design.


# 3.2.9 — Forge Mission: Build an Interactive Settings Panel
**Estimated time:** 25 minutes  
**Learner goal:** Integrate event handlers, controlled inputs, derived data, Effects, dependencies, and cleanup in one small React feature without introducing unnecessary state or Effects.

## 1. The situation

You are building a user settings panel.

The panel must let the user:

- edit a display name,
- toggle a compact mode,
- submit the settings,
- show a live summary of the current values,
- update the browser tab title with the current display name,
- and run a small “online” status indicator while the panel is mounted.

A junior developer has already written a first attempt.

Your job is to repair it rather than rewrite everything.

## 2. Starting code

```jsx
import { useEffect, useState } from "react";

export default function SettingsPanel() {
  const [name, setName] = useState("");
  const [compact, setCompact] = useState(false);
  const [summary, setSummary] = useState("");
  const [online, setOnline] = useState(false);

  useEffect(() => {
    setSummary(`${name} — ${compact ? "Compact" : "Comfortable"}`);
  }, [name, compact]);

  useEffect(() => {
    document.title = summary;
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setOnline(true);
    }, 1000);
  }, []);

  function handleSubmit(event) {
    console.log(`Saved ${name}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Display name
        <input
          value={name}
          onChange={event => setName(name)}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={compact}
          onChange={() => setCompact(!compact)}
        />
        Compact mode
      </label>

      <p>{summary}</p>
      <p>{online ? "Online" : "Offline"}</p>
      <button type="submit">Save</button>
    </form>
  );
}
```

## 3. Investigation one — controlled input

The user cannot change the display name.

What is the first bug to find?

A. `onChange` stores `name` instead of the new input value.
B. The input needs an Effect.
C. The checkbox is controlling the text input.
D. React state cannot contain strings.

**Review key:** A

Repair it:

```jsx
onChange={event => setName(event.target.value)}
```

## 4. Investigation two — derived data

The code stores `summary` in state and updates it with an Effect.

Do we need that state?

A. Yes. Every visible sentence should have its own state.
B. No. `summary` can be derived during rendering.
C. Only if the name is longer than five characters.
D. Only if the browser tab is visible.

**Review key:** B

Repair it:

```jsx
const summary = `${name} — ${compact ? "Compact" : "Comfortable"}`;
```

Then remove the `summary` state and the Effect that only existed to calculate it.

## 5. Investigation three — stale document title

The browser tab title does not follow the current summary because this Effect has no dependencies:

```jsx
useEffect(() => {
  document.title = summary;
}, []);
```

What should the dependency list contain?

A. `summary`
B. `name` and `compact` even though the Effect directly reads `summary`
C. Nothing
D. `event`

**Review key:** A

Repair:

```jsx
useEffect(() => {
  document.title = summary;
}, [summary]);
```

## 6. Investigation four — timer cleanup

The online status interval starts, but it never stops.

What is missing?

A. A cleanup function that clears the interval.
B. A second interval.
C. A new state variable for every tick.
D. A prop named `cleanup`.

**Review key:** A

Repair the Effect:

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setOnline(true);
  }, 1000);

  return () => clearInterval(id);
}, []);
```

## 7. Investigation five — form submission

The form currently logs the save message but does not stop the browser's default submit behavior.

What should happen first inside `handleSubmit`?

A. `event.preventDefault()`
B. `event.stopPropagation()`
C. `setSummary()`
D. `useEffect()`

**Review key:** A

Repair:

```jsx
function handleSubmit(event) {
  event.preventDefault();
  console.log(`Saved ${name}`);
}
```

## 8. Predict the final behavior

After the repairs:

- typing updates `name`,
- the checkbox updates `compact`,
- `summary` is calculated during render,
- the document title stays synchronized with `summary`,
- the interval is started and cleaned up with the component,
- submit stays in the React application instead of performing the browser's default form navigation.

Which statement best describes the architecture?

A. Almost everything is an Effect.
B. User interactions happen in event handlers; pure values are derived during rendering; Effects synchronize external browser systems.
C. State is replaced by DOM manipulation.
D. Every change requires another copy of the value in state.

**Review key:** B

**Feedback:** The architecture works because each job lives in the right place.

## 9. Transfer challenge

Now change the requirement:

Instead of updating the document title, the panel should keep a browser-wide resize listener that records the current viewport width.

What stays the same?

A. The synchronization pattern: add the listener in the Effect and remove it in cleanup.
B. Store the listener function in state.
C. Recreate the component on every resize.
D. Use an Effect to calculate every visible string.

**Review key:** A

**Feedback:** The external system changed, but the reasoning did not. Identify the external subscription, list its reactive inputs, start it in the Effect, and clean it up when synchronization ends.

## 10. Explain-back

In your own words, explain the difference between these three places for logic:

**Render:** “What UI should be described for the current values?”

**Event handler:** “What should happen because the user just did this?”

**Effect:** “What external system must be synchronized with the current React values?”

A strong explanation should also mention that cleanup stops the synchronization an Effect started.

## 11. Module mastery gate

You are ready to leave Module 3.2 when you can take an unfamiliar React component and answer these questions before changing the code:

1. What is state, and what is derived?
2. Which logic belongs to an event handler?
3. Does an Effect have a real external system to synchronize with?
4. Which reactive values does the Effect read?
5. What cleanup is required?

**Final reflection:** What is the most useful question to ask yourself before writing `useEffect`?

**Suggested answer:** “What external system am I synchronizing with, and what should start, update, and stop when the relevant values change?”

## 12. Forge takeaway

**Do not use Effects as a general-purpose reaction machine.** Use the simplest place that matches the job: render for pure calculation, event handlers for user actions, and Effects for synchronization outside React.

### Lesson completion
Repair the settings panel, explain every change, and successfully transfer the synchronization pattern to a different browser event without adding unnecessary state or Effects.
