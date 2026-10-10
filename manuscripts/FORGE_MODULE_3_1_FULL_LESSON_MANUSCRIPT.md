# Module 3.1 — React: Think in UI State

## Module outcome

By the end of this module, the learner can design a small React interface around components, props, state, derived data, and explicit one-way data flow. They can identify the minimal state, decide where state should live, and repair UI logic without manually fighting the rendered output.

React's current teaching model emphasizes breaking UI into components, describing visual states, and connecting components through data flow. Props behave like inputs, while state is component memory that persists between renders.

## Module lessons

1. **React Is a UI Function** — React's core mental model
2. **Components Are Units of UI** — composition and boundaries
3. **JSX: Describe the UI** — expressions, conditionals, repeated UI
4. **Props: Data Flows Down** — parent-to-child inputs
5. **State: Component Memory** — useState and re-rendering
6. **Render From State, Don't Manually Control the UI** — declarative thinking
7. **Choose Minimal State** — derived data and avoiding contradictions
8. **Share State by Lifting It Up** — one owner for shared facts
9. **Forge Mission: Build a Searchable Product Board** — integration and transfer


# 3.1.1 — React Is a UI Function
**Estimated time:** 12 minutes  
**Learner goal:** Understand the core React idea: given inputs and current state, a component describes what the UI should look like.

## 1. Start here

You already know how a browser page can change when JavaScript changes the page directly. React starts from a different question:

**What should the screen look like for the data I have right now?**

A React component is a function that returns a description of UI.

A useful first model is:

```text
inputs + current state → rendered UI
```

React is not magic. It is a way to make that relationship explicit.

## 2. Prediction

Consider this component:

```jsx
function Status({ online }) {
  if (online) {
    return <p>Online</p>;
  }
  return <p>Offline</p>;
}
```

What should appear when `online` is `false`?

A. Online  
B. Offline  
C. Both  
D. Nothing

**Review key:** B

**Feedback:** The component receives `online` and returns the UI that matches that value.

## 3. Same input, same description

A component can be easier to reason about when you read it as a rule:

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

If `name` is `Maya`, the component describes a heading that says “Hello, Maya”.

If `name` changes to `Tunde`, the component describes a different heading.

The important shift is this:

> You describe the result for the current data instead of manually issuing a list of screen commands.

## 4. Change the input

Change the component so the message uses `"Welcome"` instead of `"Hello"`.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

**Task:** Modify only the text inside the component.

**Expected result:** `Welcome, Maya`

## 5. What is React deciding?

Which statement matches the model we are building?

A. The component is a recipe for one fixed screen that can never change.
B. The component describes UI from the values it receives and the state it currently has.
C. React removes the need to understand JavaScript.
D. React stores every value automatically.

**Review key:** B

**Feedback:** React does not replace programming fundamentals. It gives you a model for describing UI as a function of changing data.

## 6. Explain it

Complete this sentence:

“A React component is useful because it lets me describe ______ based on ______.”

**Suggested answer:** “the UI based on the data/state available to the component.”

## 7. Forge takeaway

**Mental model:** React is about describing the UI for the current state of the program.

**Senior habit:** When a React screen looks wrong, ask: “What data did the component render from?” before jumping to DOM manipulation.

### Lesson completion
Pass the checkpoint and explain why changing an input changes the returned UI description.

# 3.1.2 — Components Are Units of UI
**Estimated time:** 13 minutes  
**Learner goal:** Break a page into components and understand that components can compose other components.

## 1. A page is not one giant component

Real interfaces contain repeated or distinct pieces: a header, a product card, a profile summary, a button group.

React lets you give those pieces names.

```jsx
function ProductCard() {
  return <article>Product information</article>;
}

function App() {
  return (
    <main>
      <ProductCard />
      <ProductCard />
    </main>
  );
}
```

`App` composes two `ProductCard` components.

## 2. Find the boundaries

Imagine a page contains:

- a page heading
- a search area
- a list of products
- one repeated product row

Which piece is the strongest candidate for a reusable component?

A. The entire browser tab  
B. A repeated product row  
C. The keyboard  
D. The network connection

**Review key:** B

**Feedback:** Repeated or meaningful UI pieces are good component boundaries because a named component can describe that piece once and reuse it.

## 3. Build a tiny hierarchy

Start with:

```jsx
function App() {
  return (
    <main>
      <h1>Forge Shop</h1>
    </main>
  );
}
```

Create a component called `ProductCard` that returns:

```jsx
<article>
  <h2>Forge Mug</h2>
  <p>$12</p>
</article>
```

Then render two `ProductCard` components inside `App`.

## 4. A component can contain another component

```jsx
function ProductCard() {
  return (
    <article>
      <h2>Forge Mug</h2>
      <p>$12</p>
    </article>
  );
}

function App() {
  return (
    <main>
      <ProductCard />
      <ProductCard />
    </main>
  );
}
```

The parent describes the page structure. The child describes the repeated product piece.

## 5. Prediction

How many product headings appear?

A. Zero  
B. One  
C. Two  
D. Four

**Review key:** C

**Feedback:** The parent renders the child component twice, so its returned UI appears twice.

## 6. What should become a component?

A common beginner trap is splitting everything into tiny components just because it is possible.

A better question is:

**Does this piece have a meaningful responsibility, reuse, or boundary?**

You do not need a component for every `<span>`.

## 7. Checkpoint

Which design is easier to change later?

A. One giant component containing every product row separately.
B. A page component that composes a reusable product component.

**Review key:** B

**Feedback:** A meaningful component boundary lets one change update all uses of that piece.

## 8. Forge takeaway

**Mental model:** Components are named units of UI that compose into larger interfaces.

**Senior habit:** Choose component boundaries around responsibilities and repeated concepts, not around arbitrary line counts.

### Lesson completion
Identify one meaningful component boundary in a small page and explain why the boundary exists.

# 3.1.3 — JSX: Describe the UI
**Estimated time:** 14 minutes  
**Learner goal:** Use JSX to combine JavaScript expressions with UI markup and render conditional or repeated content.

## 1. JSX is a description

JSX lets you write markup-like syntax inside JavaScript.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

The braces mean: “evaluate this JavaScript expression here.”

## 2. Insert a value

What appears here?

```jsx
function Score() {
  const points = 42;
  return <p>Points: {points}</p>;
}
```

A. `Points: points`  
B. `Points: 42`  
C. `42` only  
D. Nothing

**Review key:** B

**Feedback:** `{points}` evaluates the JavaScript variable and places its value into the returned UI description.

## 3. Conditional UI

A component can choose which UI to return based on a value:

```jsx
function Message({ isMember }) {
  return <p>{isMember ? 'Welcome back' : 'Join Forge'}</p>;
}
```

Read it as:

> If `isMember` is true, use one message; otherwise use the other.

## 4. Practice: change the condition

Change the component so members see `Member dashboard` and everyone else sees `Create account`.

**Expected result:**

```jsx
function Message({ isMember }) {
  return <p>{isMember ? 'Member dashboard' : 'Create account'}</p>;
}
```

## 5. Repeating UI from data

Suppose you have:

```jsx
const tools = ['Git', 'TypeScript', 'React'];
```

A component can turn each value into UI:

```jsx
function ToolList() {
  return (
    <ul>
      {tools.map(tool => <li key={tool}>{tool}</li>)}
    </ul>
  );
}
```

The important idea for now is not the exact method call. It is this:

**data → repeated UI**

We will learn more about list identity later. For this example, `key` gives each rendered item a stable identity for React.

## 6. Prediction

How many list items appear?

A. One  
B. Two  
C. Three  
D. Four

**Review key:** C

**Feedback:** There are three values in `tools`, so the mapping produces three list items.

## 7. JSX mistake repair

A learner writes:

```jsx
function UserName() {
  const name = 'Maya';
  return <h2>User: name</h2>;
}
```

What is wrong?

A. `name` should be inside braces.
B. The `<h2>` must be replaced with a button.
C. React cannot use strings.
D. JavaScript variables cannot appear in components.

**Review key:** A

**Repair:**

```jsx
return <h2>User: {name}</h2>;
```

## 8. Forge takeaway

**Mental model:** JSX is a readable way to describe UI while still being able to use JavaScript values and logic.

**Senior habit:** When a JSX problem appears, separate two questions: “What value do I have?” and “What UI should represent that value?”

### Lesson completion
Build one conditional UI and one repeated UI example without copying the answer.

# 3.1.4 — Props: Data Flows Down
**Estimated time:** 14 minutes  
**Learner goal:** Pass data into child components with props and understand one-way data flow from parent to child.

## 1. Components need information

A reusable product card should not hard-code every product.

Instead, the parent can provide data:

```jsx
function ProductCard({ name, price }) {
  return (
    <article>
      <h2>{name}</h2>
      <p>{price}</p>
    </article>
  );
}

function App() {
  return <ProductCard name="Forge Mug" price="$12" />;
}
```

`name` and `price` are props.

Think of props like arguments passed into a function.

## 2. Prediction

What heading appears?

```jsx
<ProductCard name="Forge Notebook" price="$8" />
```

A. Forge Mug  
B. Forge Notebook  
C. `$8`  
D. No heading

**Review key:** B

**Feedback:** The parent supplies a `name` prop, and the child reads it.

## 3. Pass a different value

Change this:

```jsx
<ProductCard name="Forge Mug" price="$12" />
```

to show:

```text
Forge Keyboard — $90
```

**Expected:**

```jsx
<ProductCard name="Forge Keyboard" price="$90" />
```

## 4. One-way data flow

The basic direction is:

```text
Parent
  ↓ props
Child
```

The child receives the value. It does not rewrite the parent's prop directly.

This makes the path of data easier to inspect.

## 5. Spot the broken idea

A learner says:

> “I will change the parent’s product name by assigning a new value directly to the child’s `name` prop.”

What is the better model?

A. Props are inputs received by the child; the parent controls what it passes.
B. Every child automatically owns every prop.
C. Props can only contain strings.
D. Props replace all state.

**Review key:** A

**Feedback:** Props communicate from parent to child. They are inputs, not a permission for the child to mutate the parent.

## 6. Props can be values and functions

A parent can pass a function too:

```jsx
function SaveButton({ onSave }) {
  return <button onClick={onSave}>Save</button>;
}
```

The child does not need to know how saving works. It only knows that it has an `onSave` action available.

This creates a useful boundary:

**parent owns the decision; child receives the interface it needs.**

## 7. Checkpoint

Which statement best describes props?

A. Props are private memory stored inside a child.
B. Props are inputs a parent can pass to a child.
C. Props are browser storage.
D. Props only exist for styling.

**Review key:** B

**Feedback:** Props carry data and behavior inputs down the component tree.

## 8. Forge takeaway

**Mental model:** Props make data flow explicit from parent to child.

**Senior habit:** When debugging a React component, trace a wrong value upward through its props instead of guessing inside the child first.

### Lesson completion
Build a child component that changes its displayed output when the parent passes different props.

# 3.1.5 — State: Component Memory
**Estimated time:** 16 minutes  
**Learner goal:** Use `useState` to retain changing information between renders and trigger a new UI description.

## 1. A regular variable is not enough

Consider:

```jsx
function Counter() {
  let count = 0;

  function handleClick() {
    count = count + 1;
  }

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

It looks plausible. But changing `count` does not make React render the component again.

Two things are needed:

1. the value must be remembered between renders;
2. React must know it needs another render when the value changes.

That is what state provides.

## 2. Add state

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

`count` is the current state value.

`setCount` tells React to store a new value and render again.

## 3. Prediction

Starting at `0`, the learner clicks the button twice.

What should the button display?

A. Count: 0  
B. Count: 1  
C. Count: 2  
D. Nothing

**Review key:** C

**Feedback:** Each click asks React to remember the next count and render from that new state.

## 4. Build a toggle

Create:

```jsx
function Status() {
  const [online, setOnline] = useState(false);

  return (
    <button onClick={() => setOnline(!online)}>
      {online ? 'Online' : 'Offline'}
    </button>
  );
}
```

Click the button and observe the UI change.

The important part is not the button. It is the loop:

```text
user interaction
      ↓
set state
      ↓
React renders again
      ↓
UI reflects current state
```

## 5. State is local to a component instance

If the same component is rendered twice, each copy can have its own state.

That means:

```jsx
<Status />
<Status />
```

creates two independent pieces of component memory.

## 6. Hook rule

A Hook such as `useState` should be called at the top level of the component, not inside a condition or loop.

Why?

React relies on the stable order of Hook calls across renders.

## 7. Checkpoint

What is the strongest reason to use state instead of a regular variable for interactive UI data?

A. State variables are shorter to type.
B. State lets React remember the value between renders and update the UI when it changes.
C. Regular variables cannot contain numbers.
D. State replaces JavaScript functions.

**Review key:** B

## 8. Forge takeaway

**Mental model:** State is component memory connected to rendering.

**Senior habit:** When a UI value changes over time, ask whether React needs to remember it and re-render from it. That is a strong signal that the value belongs in state.

### Lesson completion
Build one stateful interaction and explain the interaction → state → render loop.

# 3.1.6 — Render From State, Don’t Manually Control the UI
**Estimated time:** 14 minutes  
**Learner goal:** Replace imperative “make this element do X” thinking with declarative rendering from current state.

## 1. Two ways to think

You already learned how to change a page directly with browser JavaScript.

React encourages a different loop:

```text
change the data
→ describe the UI for that data
→ React updates the screen
```

You do not need to manually find a paragraph and tell it to display a different string every time state changes.

## 2. Compare the mental models

**Imperative:**

> Find the status element. Change its text. Hide this button. Show that message.

**Declarative:**

> When `saved` is true, render the saved message. When it is false, render the unsaved message.

The second description matches the state of the application.

## 3. Predict the rendered UI

```jsx
function SaveState({ saved }) {
  return (
    <section>
      <p>{saved ? 'Saved' : 'Not saved'}</p>
      <button>{saved ? 'Saved' : 'Save'}</button>
    </section>
  );
}
```

When `saved` is `false`, what appears?

A. `Saved` twice  
B. `Not saved` and `Save`  
C. `Not saved` and `Saved`  
D. Nothing

**Review key:** B

## 4. Change the state, not the display command

Imagine `saved` is state.

What should the click handler primarily do?

A. Find the paragraph and manually replace its text.
B. Set `saved` to the new value and let rendering decide what to display.
C. Rewrite the entire page.
D. Change the component function name.

**Review key:** B

**Feedback:** The state is the source of truth for the rendered result.

## 5. Repair exercise

A learner writes:

```jsx
function SaveButton() {
  const [saved, setSaved] = useState(false);

  function handleClick() {
    document.querySelector('#status').textContent = 'Saved';
    setSaved(true);
  }

  return (
    <>
      <p id="status">{saved ? 'Saved' : 'Not saved'}</p>
      <button onClick={handleClick}>Save</button>
    </>
  );
}
```

Which line is unnecessary in this React design?

A. `setSaved(true)`
B. `document.querySelector('#status').textContent = 'Saved'`
C. The button
D. The state variable

**Review key:** B

**Feedback:** `saved` already determines what the paragraph renders. Direct DOM editing creates a second source of truth.

## 6. Checkpoint

Complete this rule:

“Change ______; let React update ______.”

**Suggested answer:** “Change state/data; let React update the UI.”

## 7. Forge takeaway

**Mental model:** In React, the UI is a consequence of current state and props.

**Senior habit:** If a component is manually editing the same UI that React renders, pause and ask whether there are now two sources of truth.

### Lesson completion
Refactor one imperative UI update into state-driven rendering and explain why the second source of truth is dangerous.

# 3.1.7 — Choose Minimal State
**Estimated time:** 15 minutes  
**Learner goal:** Design state deliberately: store changing information that cannot be derived, and compute everything else from state and props.

## 1. More state is not more power

A beginner often stores every useful-looking value:

```jsx
const [items, setItems] = useState(initialItems);
const [search, setSearch] = useState('');
const [filteredItems, setFilteredItems] = useState([]);
const [itemCount, setItemCount] = useState(0);
```

But some of those values can be calculated from others.

React's guidance is to keep the minimal changing representation and derive the rest during rendering.

## 2. Find the real state

Suppose a shopping list has:

- the list of items
- text currently typed into the search field
- the visible items after filtering
- the number of visible items

Which values need to be remembered as independent state?

A. All four  
B. Only the original items and the search text  
C. Only the filtered items  
D. Only the count

**Review key:** B

**Feedback:** The filtered list can be derived from items + search. The count can be derived from the filtered list.

## 3. Derived values

```jsx
const visibleItems = items.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase())
);
```

`visibleItems` does not need its own state if it can always be calculated from existing inputs.

Likewise:

```jsx
const visibleCount = visibleItems.length;
```

## 4. Find the contradiction

Why is redundant state risky?

Imagine both of these can disagree:

```jsx
const [items, setItems] = useState(initialItems);
const [count, setCount] = useState(initialItems.length);
```

You remove an item and forget to update `count`.

Now the UI can contain two conflicting stories.

## 5. Practice: state or derived?

Classify each value.

1. `isOpen` changes when the user opens a panel.
2. `fullName` is produced from `firstName + lastName`.
3. `selectedId` changes when the user selects a row.
4. `selectedItem` can be found by searching the items using `selectedId`.

**Answers:**

1. State
2. Derived
3. State
4. Derived

## 6. Checkpoint

Which question should you ask before adding a state variable?

A. “Would another variable make the code longer?”
B. “Can I calculate this value from existing props/state during render?”
C. “Does the variable have a nice name?”
D. “Can I store the same information twice?”

**Review key:** B

**Feedback:** If the value can be calculated from existing inputs, storing it separately adds another thing that can drift out of sync.

## 7. Forge takeaway

**Mental model:** State is for changing information the component needs to remember, not every value the UI happens to display.

**Senior habit:** Before adding state, try to derive the value. Fewer independent truths usually means fewer ways to disagree.

### Lesson completion
Take a small UI and identify which values are true state and which can be derived.

# 3.1.8 — Share State by Lifting It Up
**Estimated time:** 16 minutes  
**Learner goal:** Move shared state to the closest common parent and pass values and event handlers through props.

## 1. Two components need one truth

Imagine two panels where only one can be active at a time.

A tempting design is:

```text
Panel A owns active state
Panel B owns active state
```

But then each panel can think it is active at the same time.

When multiple components need to stay synchronized, React's standard move is to lift the shared state to their closest common parent and pass the state and actions down through props.

## 2. Find the owner

```text
Accordion
├── Panel A
└── Panel B
```

Both panels need the same `activeIndex` information.

Where should it live?

A. Panel A only
B. Panel B only
C. Accordion
D. In both panels independently

**Review key:** C

**Feedback:** `Accordion` is the closest common parent, so it is the natural owner of the shared state.

## 3. Build the data flow

```jsx
function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <Panel isActive={activeIndex === 0} onShow={() => setActiveIndex(0)} />
      <Panel isActive={activeIndex === 1} onShow={() => setActiveIndex(1)} />
    </>
  );
}
```

The parent owns the state.

The child receives:

- `isActive` to know what to display;
- `onShow` to request a state change.

## 4. The child does not need to own the state

A child can say:

```jsx
<button onClick={onShow}>Show</button>
```

The child does not need to know where the state lives.

That separation keeps the data path explicit.

## 5. Prediction

If Panel A calls its `onShow`, what changes?

A. Only Panel A's private memory changes.
B. The parent updates `activeIndex`, then both panels can render from the new shared value.
C. Both panels create their own new state.
D. Nothing changes.

**Review key:** B

**Feedback:** One owner updates the source of truth. Both children receive the resulting state through props.

## 6. Practice: lift the state

You are given two child components that each have:

```jsx
const [active, setActive] = useState(false);
```

Your task is to remove that duplicated state and move one shared value into the parent.

**Target design:**

```text
Parent owns selected item
        ↓ values
Children render from props
        ↑ callbacks
Children request changes
```

## 7. Checkpoint

When two components must stay synchronized, what is the usual first move?

A. Duplicate the state carefully.
B. Put the shared state in their closest common parent.
C. Store it in every child.
D. Manually edit the DOM in each child.

**Review key:** B

## 8. Forge takeaway

**Mental model:** Shared state usually has one owner; other components receive data and send requests through props/callbacks.

**Senior habit:** When two components disagree about the same fact, look for duplicated state before adding more logic.

### Lesson completion
Move one piece of duplicated child state into the parent and explain why one source of truth is easier to reason about.

# 3.1.9 — Forge Mission: Build a Searchable Product Board
**Estimated time:** 22 minutes  
**Learner goal:** Integrate components, props, state, derived data, conditional rendering, and lifted state into a small React application.

## 1. Mission brief

You are building a small product board.

The starting data is:

```js
const products = [
  { id: 1, name: 'Forge Mug', category: 'Tools', price: 12, inStock: true },
  { id: 2, name: 'Forge Notebook', category: 'Tools', price: 8, inStock: true },
  { id: 3, name: 'Forge Lamp', category: 'Workspace', price: 35, inStock: false },
  { id: 4, name: 'Forge Keyboard', category: 'Workspace', price: 90, inStock: true }
];
```

The finished interface should support:

- searching by product name;
- filtering to in-stock products;
- selecting one product to highlight it;
- showing a message when no products match.

## 2. Step 1 — Design the component tree

Before writing code, choose a reasonable structure.

A strong starting point is:

```text
ProductBoard
├── SearchBar
└── ProductList
    └── ProductCard
```

**Prediction:** Which component is a reasonable owner of the search text and in-stock filter state?

A. ProductCard
B. ProductList only
C. ProductBoard
D. The browser

**Review key:** C

**Feedback:** Both the search controls and the product list depend on those values, so the shared parent is a good owner.

## 3. Step 2 — Create the static version

Start without state.

Create components that render the product data passed through props.

```jsx
function ProductCard({ product, isSelected, onSelect }) {
  return (
    <article>
      <h2>{product.name}</h2>
      <p>{product.category}</p>
      <p>${product.price}</p>
      <button onClick={onSelect}>
        {isSelected ? 'Selected' : 'Select'}
      </button>
    </article>
  );
}
```

Do not try to make everything interactive at once. First make the static structure correct.

## 4. Step 3 — Add the minimal state

You need state for values that change through interaction.

A strong starting set is:

```text
searchText
inStockOnly
selectedId
```

Do **not** add a `visibleProducts` state variable.

Why?

Because visible products can be derived from the other values and the original products.

## 5. Step 4 — Derive the visible products

Write a calculation that filters the products using the current search text and stock filter.

A correct shape is:

```js
const visibleProducts = products.filter(product => {
  const matchesSearch = product.name
    .toLowerCase()
    .includes(searchText.toLowerCase());

  const matchesStock = !inStockOnly || product.inStock;

  return matchesSearch && matchesStock;
});
```

**Important:** `visibleProducts` is derived data, not state.

## 6. Step 5 — Connect the controls

Pass the current values into `SearchBar` as props.

Pass callbacks down so the child can request state changes.

The direction should look like:

```text
ProductBoard
   ↓ searchText / inStockOnly
SearchBar
   ↑ onSearchChange / onStockChange
```

## 7. Step 6 — Add selection

When a product is clicked:

1. the card calls `onSelect`;
2. the parent updates `selectedId`;
3. the parent passes `isSelected` to each card;
4. each card renders from the current value.

There should be one `selectedId`, not a separate “selected” boolean in every card.

## 8. Step 7 — Handle the empty result

What should the page render when `visibleProducts.length === 0`?

A. Nothing at all
B. A useful message such as `No matching products`
C. The original full list
D. A second copy of the search controls

**Review key:** B

## 9. Investigation checkpoint

A bug appears: the filter works, but the displayed count is always wrong.

The developer created:

```jsx
const [visibleCount, setVisibleCount] = useState(products.length);
```

What is the first thing you should question?

A. Whether the count should be derived from `visibleProducts.length` instead of stored separately.
B. Whether React supports numbers.
C. Whether props can contain strings.
D. Whether the browser should own the count.

**Review key:** A

**Feedback:** This is exactly the kind of redundant state problem the module is training you to notice.

## 10. Transfer challenge

Now imagine the product board needs a category filter too.

Before writing code, answer:

1. What new state is required?
2. What can be derived?
3. Where should the new state live?
4. Which child components need the value?
5. Which child needs a callback to request changes?

**Strong answer:** Add one `selectedCategory` state value to the shared parent; derive visible products from products + search text + stock filter + selected category; pass the category value and change handler to the search/filter controls; keep product cards focused on rendering product information and selection.

## 11. Module mastery gate

You are ready to leave Module 3.1 when you can build or repair a React feature that demonstrates all of these:

- components with meaningful boundaries;
- props flowing from parent to child;
- state for changing information;
- derived values instead of redundant state;
- conditional rendering from state;
- a shared state value owned by the correct parent;
- child callbacks that request state changes;
- no manual DOM edits fighting React's rendering model.

## 12. Final reflection

Answer in your own words:

> Why is a React component easier to reason about when the UI can be described from current props and state?

**Reference answer:** Because the current data becomes the explanation for the current UI. Instead of chasing a sequence of manual screen updates, you can inspect the inputs, state, and rendering logic to understand why the interface looks the way it does.

## 13. Forge takeaway

**The central React habit:**

> Model the state. Let the UI follow from the state.

Do not start by asking, “How do I make this element change?”

Start by asking:

> “What fact changed, where should that fact live, and what should the UI look like for that fact?”

### Lesson completion
Complete the product board or repair the provided implementation, then explain the state ownership and derived-data decisions without reading the reference answer.