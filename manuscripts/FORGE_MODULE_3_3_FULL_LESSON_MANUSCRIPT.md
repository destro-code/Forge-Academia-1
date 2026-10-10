# Forge Curriculum v2
### Module 3.3 — React: Component Design and Application Patterns
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing lesson manuscript for review. It is not a blueprint. The review keys and hints are included so the lesson can be audited before JSON compilation.

## Module outcome
By the end of this module, you can design React components with clear boundaries, treat props as deliberate component APIs, use composition instead of rigid component coupling, reason about data flow, choose sensible state ownership, avoid premature abstraction, and refactor an overgrown component without breaking the UI contract.

## Module lessons
1. **Components Have Boundaries** — decide what deserves to be a component
2. **Props Are an API** — design inputs a component can understand and use
3. **Children and Composition** — build flexible wrappers without hard-coding their contents
4. **Design the Data Flow** — make parent-child relationships explicit
5. **Control vs. Freedom** — choose controlled and uncontrolled patterns intentionally
6. **Lists, Keys, and Identity** — give repeated UI stable identity
7. **Reuse Without Abstraction Debt** — recognize when reuse helps and when it creates friction
8. **Refactor a Growing Component** — improve structure without changing behavior
9. **Forge Mission: Design the Interface** — integrate the module into a realistic application refactor

---
# 3.3.1 — Components Have Boundaries
**Estimated time:** 14 minutes  
**Learner goal:** Decide what deserves to become a React component and explain why a boundary improves reasoning, reuse, or changeability.

## 1. Start here

A React application can technically put an entire screen into one component.

That does not make it a good design.

Imagine this:

```jsx
function Dashboard() {
  return (
    <main>
      <header>Forge Admin</header>
      <section>
        <h2>Orders</h2>
        <article>Order #1042</article>
        <article>Order #1043</article>
      </section>
      <aside>Account summary</aside>
    </main>
  );
}
```

Nothing is illegal here. The question is whether the component has become responsible for too many meaningful pieces at once.

A component boundary is useful when it gives a piece of UI a **name, responsibility, reuse point, or change boundary**.

## 2. Prediction

Which is the strongest reason to extract the repeated order row into its own component?

A. Every HTML element must have a React component.
B. A repeated, meaningful UI piece now has one definition that can be reused and changed in one place.
C. Smaller files are always better.
D. React refuses to render repeated markup unless it is a component.

**Review key:** B

**Feedback:** Component boundaries are about reasoning and responsibility. File size alone is not a sufficient design rule.

## 3. Name the responsibility

Suppose the order row needs to show an order number, customer name, status, and total.

A useful component name would be:

```jsx
function OrderRow() {
  // ...
}
```

The name tells another engineer what the unit is responsible for.

That is valuable even before reuse happens.

## 4. Build the boundary

Start with this:

```jsx
function Dashboard() {
  return (
    <main>
      <h1>Orders</h1>
      <article>
        <h2>Order #1042</h2>
        <p>Maya — Paid</p>
      </article>
      <article>
        <h2>Order #1043</h2>
        <p>Chidi — Pending</p>
      </article>
    </main>
  );
}
```

Create:

```jsx
function OrderRow({ number, customer, status }) {
  return (
    <article>
      <h2>Order #{number}</h2>
      <p>{customer} — {status}</p>
    </article>
  );
}
```

Then replace the repeated `<article>` blocks with two `OrderRow` uses.

## 5. What changed?

The screen should still look the same.

That is important.

Good refactoring often changes the **structure of the code** while preserving the **behavior of the product**.

## 6. When not to split

You have this:

```jsx
<button>Save</button>
```

Should you immediately create:

```jsx
function SaveButton() {
  return <button>Save</button>;
}
```

A. Yes. Every element deserves a component.
B. No. A component boundary should solve a meaningful problem, not satisfy a quota.

**Review key:** B

**Feedback:** A wrapper with no useful responsibility can add indirection without improving the design.

## 7. Boundary test

Before extracting a component, ask:

**What would become easier because this has a name?**

Possible good answers include:

- I can reuse this piece.
- I can reason about this piece separately.
- It changes for a different reason than its parent.
- Its API can stay stable while its internals change.

## 8. Checkpoint

Choose the stronger boundary:

A. `DashboardLine27` because the code on line 27 is getting long.
B. `OrderRow` because the UI represents a repeated concept with a clear responsibility.

**Review key:** B

**Feedback:** Good component names describe product concepts or responsibilities, not editor coordinates.

## 9. Forge takeaway

**Mental model:** A component boundary is an engineering boundary, not merely a visual box.

**Senior habit:** Extract a component because it makes the system easier to reason about or change—not because the file feels long.

### Lesson completion
Explain one component boundary you would create in a dashboard and what problem the boundary solves.

---
# 3.3.2 — Props Are an API
**Estimated time:** 15 minutes  
**Learner goal:** Design a component interface with clear props and understand why a component should receive only the information it actually needs.

## 1. Props are the public inputs

You already know that a React component can receive props.

Now treat props as an **API**.

A component such as:

```jsx
function OrderRow({ number, customer, status }) {
  // ...
}
```

has a small contract:

- `number` identifies the order.
- `customer` tells it who owns the order.
- `status` tells it which state to display.

The component does not need to know where those values came from.

## 2. Prediction

Which design gives `OrderRow` the cleaner API?

A.

```jsx
<OrderRow order={entireApplicationObject} settings={everythingElse} />
```

B.

```jsx
<OrderRow number={1042} customer="Maya" status="Paid" />
```

A. A
B. B

**Review key:** B

**Feedback:** The second API communicates exactly what the component needs. Passing giant objects can couple the component to unrelated application details.

## 3. Change the internals

Suppose `OrderRow` originally displays:

```jsx
<p>{customer} — {status}</p>
```

Later you change it to:

```jsx
<p>{customer}</p>
<p>Status: {status}</p>
```

Should the parent component care?

A. Yes. Parents must know how children render.
B. No. The parent supplies the contract; the child owns how it renders that contract.

**Review key:** B

**Feedback:** A useful component API creates a boundary between what a component needs and how it implements that need.

## 4. Build the API

Create this component:

```jsx
function ProductCard({ name, price, inStock }) {
  return (
    <article>
      <h2>{name}</h2>
      <p>${price}</p>
      <p>{inStock ? "In stock" : "Out of stock"}</p>
    </article>
  );
}
```

Render it twice with different values.

## 5. A bad API

Which prop is most suspicious?

```jsx
<ProductCard
  name="Forge Mug"
  price={12}
  inStock={true}
  entireDashboard={dashboard}
  currentUser={user}
  appConfig={config}
/>
```

A. `name`
B. `price`
C. `inStock`
D. The three large props that the component does not need

**Review key:** D

**Feedback:** Extra data makes dependencies harder to see and increases coupling.

## 6. Function props

A component can receive a function too:

```jsx
function DeleteButton({ onDelete }) {
  return <button onClick={onDelete}>Delete</button>;
}
```

The child does not decide how deletion works.

It receives a function and calls it when the user activates the button.

This is a powerful pattern because it lets the parent own the decision while the child owns the interaction surface.

## 7. Checkpoint

Complete the principle:

**A good component API exposes what the component needs to do its job and hides ________.**

A. all HTML
B. unrelated implementation details
C. every prop
D. JavaScript

**Review key:** B

**Feedback:** The boundary is valuable because the parent and child do not need to know each other's unrelated implementation details.

## 8. Forge takeaway

**Mental model:** Props are the inputs to a component contract.

**Senior habit:** When a component needs an entire application object just to render three fields, ask whether its API is leaking too much context.

### Lesson completion
Design a three-prop API for a `StatusBadge` component and explain why each prop belongs in the contract.

---
# 3.3.3 — Children and Composition
**Estimated time:** 14 minutes  
**Learner goal:** Use `children` and composition to build flexible containers without hard-coding every piece of their contents.

## 1. The rigid container problem

Consider:

```jsx
function Card() {
  return (
    <div className="card">
      <h2>Forge Mug</h2>
      <p>$12</p>
    </div>
  );
}
```

This component is not really a generic card.

It is a **Forge Mug card** pretending to be a generic card.

## 2. Composition gives the parent a slot

React lets a component receive nested JSX as `children`:

```jsx
function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}
```

Now a parent can choose what belongs inside.

```jsx
<Card>
  <h2>Forge Mug</h2>
  <p>$12</p>
</Card>
```

## 3. Prediction

What appears inside the card?

A. Only the word `children`
B. The `<h2>` and `<p>` supplied between `<Card>` and `</Card>`
C. Nothing
D. The `Card` function itself

**Review key:** B

**Feedback:** `children` is the nested JSX supplied by the parent.

## 4. Build a reusable panel

Create:

```jsx
function Panel({ children }) {
  return (
    <section>
      {children}
    </section>
  );
}
```

Use it like this:

```jsx
<Panel>
  <h2>Account</h2>
  <p>Signed in as Maya.</p>
</Panel>
```

Then reuse the same `Panel` around a different group of content.

## 5. Why composition beats configuration sometimes

A common temptation is to create a component with twenty props:

```jsx
<Card
  title="..."
  showTitle
  titleSize="large"
  body="..."
  footer="..."
  showFooter
  footerMode="button"
  // ...
/>
```

Sometimes a simpler composition API is clearer:

```jsx
<Card>
  <Header />
  <Body />
  <Footer />
</Card>
```

The right answer depends on the component's job, but composition is often the better escape hatch when the contents vary.

## 6. Checkpoint

Which component is more flexible?

A.

```jsx
function Panel() {
  return <section><h2>Always Account</h2></section>;
}
```

B.

```jsx
function Panel({ children }) {
  return <section>{children}</section>;
}
```

**Review key:** B

**Feedback:** The second component owns the container behavior without owning the exact content.

## 7. Senior insight

A good abstraction often answers this question:

**What should this component own, and what should the parent still be free to choose?**

That question is more useful than “How many props should this component have?”

## 8. Forge takeaway

**Mental model:** Composition lets a component provide structure while the parent provides content.

**Senior habit:** When a reusable component starts growing lots of “showX”, “variantY”, and “modeZ” props, ask whether composition would make the boundary simpler.

### Lesson completion
Build a reusable `Panel` that can wrap two completely different pieces of UI without changing the `Panel` implementation.

---
# 3.3.4 — Design the Data Flow
**Estimated time:** 16 minutes  
**Learner goal:** Trace data through a component tree and decide where values and handlers should live.

## 1. The direction matters

In the React model you have been building:

**parent state/data → props → child UI**

And interaction often travels back upward through a function prop:

**child event → handler prop → parent state update → new props → new UI**

This gives the component tree a direction.

## 2. Trace the value

Suppose:

```jsx
function App() {
  const [selectedId, setSelectedId] = useState(2);

  return <List selectedId={selectedId} />;
}
```

And `List` passes it to `Row`:

```jsx
<List selectedId={selectedId} />

<Row selected={selectedId === 2} />
```

Where did `Row` get its `selected` value?

A. It invented it.
B. It came from data owned higher in the tree and moved down through props.
C. The browser created it.
D. CSS stored it.

**Review key:** B

**Feedback:** Data flows through explicit props. The farther you trace upward, the closer you get to its owner.

## 3. Interaction flows back

Now suppose `Row` needs to tell the parent that the user selected it.

```jsx
<Row onSelect={() => setSelectedId(2)} />
```

And inside `Row`:

```jsx
<button onClick={onSelect}>Select</button>
```

The child does not directly reach into the parent's state.

It calls the capability the parent gave it.

## 4. Prediction

Which explanation is stronger?

A. “Children can change any parent's state whenever they want.”
B. “A parent can pass a function that gives a child a specific capability.”

**Review key:** B

**Feedback:** The second explanation preserves the component boundary. The child knows what it can request, not every detail of how the parent stores state.

## 5. Find the owner

Suppose two sibling components must always agree on which tab is selected.

Where should the selection live?

A. In both siblings separately.
B. In their closest common parent, then pass the value and handlers down.
C. In whichever sibling renders first.
D. In a random utility file.

**Review key:** B

**Feedback:** One source of truth is easier to coordinate than duplicate selection state.

## 6. Data-flow exercise

You have:

```text
App
 ├─ SearchBox
 └─ ProductList
      └─ ProductRow
```

The search text determines which products appear.

Where is the strongest place for the search text to live?

A. `ProductRow`
B. `ProductList`
C. `App`
D. Every component

**Review key:** C

**Feedback:** Both `SearchBox` and `ProductList` need the value, so their closest useful common owner is `App`.

## 7. Checkpoint

A component should usually own state when:

A. It is the only part of the tree that needs the state.
B. State must be shared by many components.
C. It is the deepest component in the tree.

**Review key:** A

**Feedback:** Keep state as local as practical. Move it upward when coordination requires a shared owner.

## 8. Forge takeaway

**Mental model:** Data has an owner. Props carry it down. Events or callbacks communicate intent back up.

**Senior habit:** When state feels difficult, draw the component tree and circle the smallest component that can own the source of truth.

### Lesson completion
Draw a three-component tree for a searchable list and label who owns the query, who reads it, and which component receives the event.

---
# 3.3.5 — Control vs. Freedom
**Estimated time:** 15 minutes  
**Learner goal:** Distinguish controlled and uncontrolled component patterns and choose deliberately based on who should own the value.

## 1. One input, two ownership models

Consider an input.

A **controlled** input gets its current value from React state:

```jsx
const [name, setName] = useState("");

<input
  value={name}
  onChange={event => setName(event.target.value)}
/>
```

An **uncontrolled** input lets the browser keep the current value internally.

The important question is not “Which one is always better?”

The useful question is:

**Who needs to own the value?**

## 2. Prediction

If another part of the component must immediately react to every typed character, which model is usually more direct?

A. Controlled
B. Uncontrolled

**Review key:** A

**Feedback:** A controlled input keeps the current value in React state, making that value available to the component's render logic.

## 3. Build a controlled input

Create:

```jsx
function NameField() {
  const [name, setName] = useState("");

  return (
    <label>
      Name
      <input
        value={name}
        onChange={event => setName(event.target.value)}
      />
    </label>
  );
}
```

Now show a sentence below it:

```jsx
<p>Hello, {name || "friend"}.</p>
```

The rendered greeting always reflects the current state.

## 4. Why uncontrolled can still be reasonable

A component may not need to read every keystroke.

For a small isolated input where the browser can manage the value until submission, an uncontrolled approach can be simpler.

The mistake is treating one ownership pattern as a universal law.

## 5. Decision exercise

Which pattern is the stronger default for each case?

**Case A:** A search box filters a visible list on every keystroke.

**Case B:** A simple one-off form field only needs to be read when the form is submitted.

A. Controlled for A; uncontrolled can be reasonable for B.
B. Uncontrolled for A; controlled is forbidden for B.
C. Both must be uncontrolled.
D. Both must be controlled.

**Review key:** A

**Feedback:** Choose based on ownership and interaction needs, not ideology.

## 6. Checkpoint

Complete the principle:

“Use a controlled input when ______ should own and react to the current value.”

**Suggested answer:** “React state / the component.”

## 7. Forge takeaway

**Mental model:** Controlled and uncontrolled describe where the current value lives and who is responsible for it.

**Senior habit:** When an input behaves strangely, first ask who owns the value.

### Lesson completion
Choose controlled or uncontrolled for two new input scenarios and justify each decision in one sentence.

---
# 3.3.6 — Lists, Keys, and Identity
**Estimated time:** 15 minutes  
**Learner goal:** Understand why repeated React children need stable keys and how keys help React match elements across renders.

## 1. Repetition is not identity

Suppose you render:

```jsx
const items = [
  { id: "a", name: "Mug" },
  { id: "b", name: "Notebook" }
];
```

You can turn them into UI:

```jsx
items.map(item => (
  <ProductRow key={item.id} name={item.name} />
))
```

The `key` is not a decoration.

It gives React a stable identity for a repeated item within that list.

## 2. Prediction

Which is the stronger key?

A. `item.id`
B. `Math.random()`
C. The displayed price, even if prices can repeat
D. The current clock time

**Review key:** A

**Feedback:** A stable identifier should stay attached to the same logical item across renders.

## 3. Why identity matters

Imagine a list where each row contains its own input value.

Then the list gets reordered.

If React can reliably identify each row, it can preserve the correct relationship between the row and its state.

If identity is unstable, the UI can appear to “move” state to the wrong item.

## 4. Dangerous shortcut

This is often tempting:

```jsx
items.map((item, index) => (
  <ProductRow key={index} {...item} />
))
```

Is the index always wrong?

A. Yes, in every possible list.
B. No. It can be acceptable when the list is truly static and items never reorder, insert, or delete in a way that changes their positions.

**Review key:** B

**Feedback:** The engineering concern is whether the key represents stable identity. Index keys become risky when position and identity can diverge.

## 5. Checkpoint

A queue can reorder as new items arrive. Which key is safer?

A. Queue position
B. Stable item ID

**Review key:** B

**Feedback:** Position can change; identity should not.

## 6. Forge takeaway

**Mental model:** A key answers: “Which logical item is this across renders?”

**Senior habit:** When list behavior becomes weird, inspect identity before changing rendering logic.

### Lesson completion
Explain why a stable item ID is usually a better key than an array index for a changing list.

---
# 3.3.7 — Reuse Without Abstraction Debt
**Estimated time:** 16 minutes  
**Learner goal:** Recognize when reuse justifies an abstraction and when premature generalization makes a component harder to understand.

## 1. The abstraction trap

Imagine two components:

```jsx
function UserCard() {
  // clear user-specific UI
}

function ProductCard() {
  // clear product-specific UI
}
```

A developer decides to “DRY it up” immediately:

```jsx
function UniversalCard({
  mode,
  compact,
  showBadge,
  titlePosition,
  footerMode,
  kind,
  // ...
}) {
  // many branches
}
```

Fewer files do not automatically mean less complexity.

## 2. What is abstraction debt?

Abstraction debt appears when an abstraction creates more coordination and special cases than the duplication would have created.

You now have to understand the abstraction before changing either use.

## 3. Prediction

Two components share the same outer panel structure but have completely different inner content.

Which is often the simpler design?

A. Force both into one highly configurable mega-component.
B. Share the stable outer shell and compose each inner content separately.

**Review key:** B

**Feedback:** Reuse the stable boundary and keep variable behavior in composition. Do not abstract every difference into a prop.

## 4. Good duplication vs bad duplication

Some repeated code can be acceptable when:

- the concepts are likely to change independently,
- the repeated code is tiny and obvious,
- an abstraction would require many conditionals,
- the shared behavior is not actually stable.

The goal is not zero duplication.

The goal is **low accidental coupling**.

## 5. Refactor decision

You have copied the same three-line label pattern in two components.

A. Extract it immediately into `UniversalLabelSystem` with seven props.
B. Leave it alone until a shared requirement actually emerges.
C. Delete the labels.

**Review key:** B

**Feedback:** A tiny duplication with no stable shared behavior may be cheaper than a premature abstraction.

## 6. A stronger reason to abstract

Suppose four screens all need the exact same error banner with the same behavior and accessibility rules.

Now the component boundary has a stronger reason to exist:

```jsx
function ErrorBanner({ message, onDismiss }) {
  // shared contract
}
```

One change can improve all four uses.

## 7. Checkpoint

Which sentence is closer to senior reasoning?

A. “Never duplicate code.”
B. “Abstract when the shared concept is real and stable enough that one boundary reduces future cost.”

**Review key:** B

**Feedback:** Reuse is a means to reduce change cost, not a scoreboard.

## 8. Forge takeaway

**Mental model:** The best abstraction removes repeated decisions, not merely repeated lines.

**Senior habit:** Before extracting a component, ask whether the places using it are likely to change together.

### Lesson completion
Look at one repeated UI pattern and argue for either abstraction or intentional duplication.

---
# 3.3.8 — Refactor a Growing Component
**Estimated time:** 17 minutes  
**Learner goal:** Refactor a large React component by identifying responsibilities, extracting stable boundaries, and preserving behavior.

## 1. The code smell

You inherit this component:

```jsx
function CheckoutPage({ cart, user }) {
  const [coupon, setCoupon] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  // validate cart
  // calculate totals
  // render header
  // render cart rows
  // render coupon form
  // render help panel
  // render payment summary
  // render confirmation text
}
```

Nothing here proves the component is bad.

The question is whether one component is carrying multiple responsibilities that can be separated without creating a confusing maze.

## 2. Find candidate boundaries

Which pieces are strong extraction candidates?

A. `CheckoutHeader`
B. `CartSummary`
C. `CouponForm`
D. `PaymentSummary`
E. All of the above may be reasonable if each has a meaningful responsibility and a sensible API.

**Review key:** E

**Feedback:** A refactor is not “extract everything.” These are candidates. You still need to choose boundaries based on responsibility and data flow.

## 3. Preserve the behavior

A safe refactor follows a rule:

**Change structure before changing behavior.**

Start by identifying what the current version does.

Then move one responsibility at a time.

After each move, verify that the visible behavior and data flow remain correct.

## 4. Extract one piece

Start with:

```jsx
function CheckoutHeader({ user }) {
  return (
    <header>
      <h1>Checkout</h1>
      <p>For {user.name}</p>
    </header>
  );
}
```

Then:

```jsx
function CheckoutPage({ cart, user }) {
  return (
    <main>
      <CheckoutHeader user={user} />
      {/* the rest stays here for now */}
    </main>
  );
}
```

Nothing else needs to move yet.

## 5. Why incremental refactoring is safer

If you extract five components and rewrite the data flow at the same time, a failing test or broken UI leaves you with many possible causes.

Small structural steps narrow the investigation space.

That connects directly to the engineering habit you learned earlier:

**change one thing, observe what changed.**

## 6. Prediction

Which refactor is easier to review?

A. One huge commit that extracts everything, renames props, changes state ownership, and rewrites the markup.
B. A sequence of small, behavior-preserving changes with clear boundaries.

**Review key:** B

**Feedback:** Smaller changes make cause and effect easier to inspect.

## 7. Checkpoint

Before extracting a component, write its proposed API.

For `CartSummary`, maybe:

```text
items
subtotal
shipping
```

Then ask:

**Can this component do its job from these inputs?**

If yes, the boundary is becoming concrete.

## 8. Forge takeaway

**Mental model:** Refactoring is controlled structural change under a behavior constraint.

**Senior habit:** When refactoring, preserve the contract first. Improve the architecture one safe boundary at a time.

### Lesson completion
Take a large component and identify three boundaries. For each, state its responsibility and the smallest API it needs.

---
# 3.3.9 — Forge Mission: Design the Interface
**Estimated time:** 24 minutes  
**Learner goal:** Refactor a growing React application into clear components with deliberate APIs, sensible composition, stable list identity, and understandable data flow.

## 1. Mission briefing

You inherited a small admin screen called **Forge Orders**.

The screen works, but the component is becoming difficult to change.

It currently contains:

- the page heading,
- a filter input,
- a list of orders,
- each order row,
- a details panel,
- the empty state,
- and all selection logic.

The goal is **not** to create as many components as possible.

The goal is to make the system easier to understand and safer to change.

## 2. Starting point

```jsx
function OrdersPage({ orders }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const visibleOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main>
      <h1>Orders</h1>

      <label>
        Search
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
      </label>

      {visibleOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <section>
          {visibleOrders.map(order => (
            <article key={order.id}>
              <h2>{order.customer}</h2>
              <p>{order.status}</p>
              <button onClick={() => setSelectedId(order.id)}>
                View
              </button>
            </article>
          ))}
        </section>
      )}

      {selectedId !== null && (
        <aside>
          Selected order: {selectedId}
        </aside>
      )}
    </main>
  );
}
```

## 3. Mission part A — find the boundaries

Choose a component plan.

A strong starting answer might be:

```text
OrdersPage
 ├─ OrdersHeader
 ├─ OrderSearch
 ├─ OrderList
 │    └─ OrderRow
 └─ OrderDetails
```

Your job is to justify each boundary.

**Review key:** The exact names can vary. The important thing is that each component has a meaningful responsibility and a small enough API to understand independently.

## 4. Mission part B — design the APIs

Write the smallest reasonable props for:

**OrderSearch**

Example:

```text
value
onChange
```

**OrderRow**

Example:

```text
order
onView
selected
```

**OrderDetails**

Example:

```text
order
```

Now ask the senior question:

**Does any component receive more information than it needs?**

## 5. Mission part C — preserve ownership

Where should `query` live?

A. `OrderRow`
B. `OrderSearch`
C. `OrdersPage`
D. In every component

**Review key:** C

**Feedback:** The query affects which orders appear, so the page-level owner is a sensible source of truth.

Where should `selectedId` live?

A. `OrderRow`
B. `OrdersPage`
C. `OrderSearch`
D. `OrderDetails` only

**Review key:** B

**Feedback:** The selected order affects both the list and the details area, so the common parent can coordinate both.

## 6. Mission part D — preserve identity

The list already uses:

```jsx
key={order.id}
```

Keep it.

Why?

A. It makes the code prettier.
B. It gives each logical order stable identity as the list changes.
C. It is required for CSS.
D. It prevents every click.

**Review key:** B

**Feedback:** Stable identity lets React correctly match repeated items across renders.

## 7. Mission part E — compose the result

Build the page from your planned components.

A possible result is:

```jsx
function OrdersPage({ orders }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const visibleOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(query.toLowerCase())
  );

  const selectedOrder = orders.find(order => order.id === selectedId);

  return (
    <main>
      <OrdersHeader />

      <OrderSearch
        value={query}
        onChange={setQuery}
      />

      <OrderList
        orders={visibleOrders}
        selectedId={selectedId}
        onView={setSelectedId}
      />

      <OrderDetails order={selectedOrder} />
    </main>
  );
}
```

The exact decomposition may vary. Your job is to make the ownership and APIs obvious.

## 8. Break it on purpose

Now imagine a teammate changes `OrderRow` so it expects:

```jsx
<OrderRow order={order} onOpen={handleOpen} />
```

but `OrderList` still passes:

```jsx
<OrderRow order={order} onView={handleView} />
```

The row no longer receives the callback prop it expects.

What broke?

A. The component contract changed, but the caller was not updated.
B. React stopped supporting props.
C. The browser forgot the order.
D. Keys stopped working.

**Review key:** A

**Feedback:** Component APIs are contracts. Changing a prop name is an integration change, even if the visual output still looks similar at first.

## 9. Final engineering judgment

A teammate proposes:

> “Let's create a single `UniversalOrderComponent` with 18 props so every screen can reuse it.”

What is your response?

A. Great. More props always mean more reuse.
B. Maybe—but first identify which behavior and structure are genuinely shared. Prefer a small stable contract and composition over a mega-component full of modes.

**Review key:** B

**Feedback:** Reuse is valuable when the shared concept is real. A configurable monster can make every caller depend on every special case.

## 10. Mastery gate

You pass this mission when you can explain, without looking at the reference answer:

1. **Boundary:** Why each component exists.
2. **API:** What each component receives and why.
3. **Ownership:** Where query and selection state live.
4. **Identity:** Why `order.id` is the list key.
5. **Composition:** How parent and child responsibilities stay separate.
6. **Change safety:** What happens when a component prop contract changes.

## 11. Transfer challenge

Now change the product.

Imagine the same architecture for a **support ticket dashboard**:

- filter tickets by customer,
- select one ticket,
- show ticket details,
- keep the list stable while filtering.

Do not copy the names from the order example.

Create the component tree and APIs yourself.

**Strong transfer response:**

```text
TicketsPage
 ├─ TicketSearch
 ├─ TicketList
 │    └─ TicketRow
 └─ TicketDetails
```

Then define only the data and handlers each component actually needs.

## 12. Forge takeaway

A mature React codebase is not “a lot of components.”

It is a system of **clear boundaries and understandable contracts**.

**Senior habit:** Before writing a component, ask:

**What does this component own? What does it need? What should it be allowed to know?**

### Module mastery
You are ready to leave Module 3.3 when you can take a growing React screen and, without blindly splitting files, produce a component plan with explicit APIs, sensible ownership, stable identity, and low-coupling composition.
