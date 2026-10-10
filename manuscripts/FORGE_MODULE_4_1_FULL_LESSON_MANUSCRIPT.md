# Forge Curriculum v2
## Module 4.1 — Next.js Application Engineering
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing lesson manuscript for review. Answer keys and feedback are included for review and will be hidden from learners in the final compiled lesson.

### Module outcome
By the end of this module, the learner can structure a Next.js App Router application, design route and layout boundaries, distinguish Server and Client Components, design loading/error experiences, use Route Handlers appropriately, perform server-side mutations, reason about environment-variable exposure, and make informed caching/revalidation decisions.

### Module lessons
1. **Next.js Is an Application Framework**
2. **The App Router and Project Structure**
3. **Pages, Layouts, and Shared UI**
4. **Navigation With Links**
5. **Server and Client Components**
6. **Server Components and Data Close to the Server**
7. **Client Components Where Interaction Actually Lives**
8. **Loading and Streaming the Experience**
9. **Errors and Not Found Are Different States**
10. **Metadata Is Part of the Application**
11. **Route Handlers: When the App Exposes an HTTP Boundary**
12. **Server Actions and Form Mutations**
13. **Environment Variables and Server-Only Configuration**
14. **Caching and Revalidation: Freshness Is a Decision**
15. **Forge Mission: Build a Production-Shaped Next.js App**


# 4.1.1 — Next.js Is an Application Framework
**Estimated time:** 15 minutes

Before this module, React gave you components, state, effects, routing ideas, and application composition.

Now the question changes:

**What does a real application need around React?**

A real application also needs a place for routes, layouts, server work, browser work, loading states, error states, metadata, environment configuration, and a predictable project structure.

Next.js gives you a framework for those concerns.

For this module, use one mental model:

**React describes the interface. Next.js organizes the application around that interface.**

### Quick prediction

You have a React component:

```tsx
export default function Dashboard() {
  return <h1>Dashboard</h1>;
}
```

What does Next.js add that React alone does not provide as an application framework?

A. A framework for routing, application structure, server/client boundaries, and more
B. A replacement for JavaScript
C. A new HTML language
D. A database that stores every component

**Review key:** A

**Feedback:** React is the UI library. Next.js is an application framework that organizes routing, rendering, project structure, and server/client behavior around React.

### First comparison

Think about these two questions:

**React question:** “How should this UI behave?”

**Next.js question:** “Where does this UI live in the application, how is it reached, where does its code run, and how should the application respond around it?”

That distinction will guide this entire module.

### What Next.js does not magically solve

A framework can provide defaults and capabilities. It does not make architecture disappear.

You still need to decide:

- where logic belongs,
- what state is local or shared,
- which code needs the browser,
- what should stay on the server,
- how failures should appear,
- and what the user should experience while work is happening.

### Checkpoint

Which statement is the strongest mental model?

A. Next.js replaces React.
B. Next.js is mostly a styling library.
C. Next.js provides application structure and server/client capabilities around React.
D. Next.js means you no longer need JavaScript.

**Review key:** C

**Forge takeaway**

Do not ask only, “How do I build this component?”

Ask:

**“Where does this component belong in the application, and where should its work run?”**

### Lesson completion

Explain the difference between a UI library and an application framework in your own words. Then apply the distinction to one feature you have already built.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.2 — The App Router and Project Structure
**Estimated time:** 15 minutes

A framework becomes useful when its structure carries meaning.

In the Next.js App Router, folders and special files describe the application.

A simplified project can look like this:

```text
app/
  layout.tsx
  page.tsx
  dashboard/
    page.tsx
  settings/
    page.tsx
```

The important idea is not memorizing filenames.

The important idea is:

**The filesystem is part of the application's route structure.**

### Predict the route

Given:

```text
app/
  page.tsx
  dashboard/
    page.tsx
```

Which URL should the second page represent?

A. `/app/dashboard/page.tsx`
B. `/dashboard`
C. `/page/dashboard`
D. `/pages/dashboard`

**Review key:** B

**Feedback:** The `app` directory is the route tree. A `page.tsx` inside `dashboard` creates the `/dashboard` route.

### Root layout

A root `layout.tsx` is shared across the application.

That makes it a natural place for application-wide structure such as the document shell.

The root layout is not the same thing as a random wrapper component. It participates in the framework's routing system.

### Colocation

Next.js also lets you keep route-related code close to the route.

That can mean:

```text
app/
  dashboard/
    page.tsx
    loading.tsx
    error.tsx
    components/
```

The benefit is cognitive locality.

When investigating `/dashboard`, you can stay near `/dashboard`.

### Build the map

Given:

```text
app/
  page.tsx
  products/
    page.tsx
    [id]/
      page.tsx
```

Predict these routes:

1. `page.tsx` at the root
2. `products/page.tsx`
3. `products/[id]/page.tsx`

**Review key:**

1. `/`
2. `/products`
3. `/products/:id`

The third is a dynamic segment: one route shape can represent different identifiers.

### Checkpoint

Which statement is most useful?

A. Folder names are mostly cosmetic.
B. The App Router uses filesystem structure to describe routes and related UI.
C. Only JavaScript files matter to routing.
D. Every folder automatically becomes a public page.

**Review key:** B

### Forge takeaway

When you see a Next.js route, read the filesystem as part of the architecture.

### Lesson completion

Draw the route tree for a small app with `/`, `/dashboard`, `/dashboard/settings`, and `/products/[id]`. Then explain how the folders communicate that structure.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.3 — Pages, Layouts, and Shared UI
**Estimated time:** 15 minutes

A route needs page content. Real applications also need UI that stays around while the route changes.

That is where layouts matter.

Imagine:

```text
Dashboard
├── Overview
├── Analytics
└── Settings
```

A dashboard shell might contain the navigation while the page area changes.

### Prediction

A user moves from `/dashboard` to `/dashboard/settings`.

Which design best represents a shared dashboard shell?

A. Copy the sidebar into every page file.
B. Put the shared dashboard structure in a nested layout.
C. Put every route into one giant component.
D. Use a separate browser window for each page.

**Review key:** B

### Why duplication hurts

Suppose three pages each contain:

```tsx
<aside>...</aside>
```

The problem is not that the code is illegal.

The problem is that three copies create three places to maintain the same behavior.

A layout gives the shared UI one home.

### Partial rendering

When navigation occurs inside a routed application, the shared layout can persist while the page content changes.

That gives the learner an important mental model:

**Navigation does not always mean “throw away the whole interface and build it again.”**

### Try it

Design this route tree:

```text
app/
  dashboard/
    layout.tsx
    page.tsx
    reports/
      page.tsx
    settings/
      page.tsx
```

What belongs in the layout?

A. The dashboard navigation and shell
B. The report rows only
C. The settings form only
D. Nothing; layouts are unnecessary

**Review key:** A

### Common mistake

A learner often puts route-specific data into the shared layout simply because the layout is already there.

That can create an overly knowledgeable layout.

The better question is:

**Does this information truly belong to every child route?**

If not, keep it closer to the page that needs it.

### Checkpoint

Which is a good reason to use a nested layout?

A. To make every page longer
B. To share route-level UI and structure without duplicating it
C. To avoid writing components
D. To force all state into one file

**Review key:** B

### Forge takeaway

Layouts are boundaries.

A good boundary gives shared UI a stable home without forcing unrelated concerns into it.

### Lesson completion

Take one existing multi-page interface and identify one piece of UI that should be shared through a layout. Explain why it belongs there and what should remain page-specific.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.4 — Navigation With Links
**Estimated time:** 15 minutes

A routed application needs navigation that behaves like navigation.

Next.js provides the `Link` component for internal navigation.

```tsx
import Link from 'next/link';

<Link href="/dashboard">Dashboard</Link>
```

### Predict the destination

What route does this link target?

```tsx
<Link href="/settings">Settings</Link>
```

A. `/`
B. `/settings`
C. `/link/settings`
D. `settings.tsx`

**Review key:** B

### Why not ordinary strings?

A route is more than text on a screen.

The application needs to interpret navigation as a meaningful action.

A dedicated navigation component gives the framework an explicit signal that this is an internal route transition.

### Navigation should describe intent

Compare:

```tsx
<Link href="/products">Browse products</Link>
```

with a click handler that manually changes location.

The first communicates:

**This UI represents navigation to another route.**

That is a valuable engineering habit:

**Use the abstraction that expresses the user's intent.**

### Dynamic routes

Suppose the route tree contains:

```text
app/
  products/
    [id]/
      page.tsx
```

A product with id `42` can be linked with:

```tsx
<Link href="/products/42">Open product</Link>
```

The route structure determines which page receives the request.

### Checkpoint

Which option communicates internal navigation most directly?

A. A `Link` with an internal href
B. A random button that changes unrelated state
C. A text node with no interaction
D. A CSS class

**Review key:** A

### Forge takeaway

Good framework code often starts with a good semantic description of what the user is trying to do.

**Navigate like navigation.**

### Lesson completion

Create three internal navigation links for `/`, `/products`, and `/settings`. For each, explain what route the link expresses.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.5 — Server and Client Components
**Estimated time:** 15 minutes

React can run in different environments.

In the App Router, components are Server Components by default. Client Components are used when the UI needs client-side capabilities such as state, event handlers, or browser-only APIs.

This gives us a boundary.

### The first question

Suppose you have:

```tsx
export default function Profile() {
  return <h1>Profile</h1>;
}
```

Does this component automatically need to be a Client Component?

A. Yes
B. No

**Review key:** B

**Feedback:** Static UI does not need client-side interactivity just because it is React.

### When does client code become necessary?

Imagine:

```tsx
const [open, setOpen] = useState(false);
```

Now the component needs React state in the browser.

That is a signal that the component belongs on the client side.

### The boundary is architectural

Think of the tree:

```text
Page
├── Server-rendered content
└── Interactive button
```

The whole page does not need to become client-side just because one small piece is interactive.

A useful strategy is:

**Keep the boundary as small as the requirement allows.**

### Client Components

A Client Component begins with:

```tsx
'use client';
```

That tells the framework that the module belongs to the client side of the application.

### Prediction

Which component most clearly needs to be a Client Component?

A. A static heading
B. A component using `useState` for an interactive menu
C. A static paragraph
D. A server-side data formatter

**Review key:** B

### What crosses the boundary?

Do not treat the boundary like a magical wall.

It is a design decision about where code runs.

Client code can interact with users.

Server code can perform server-side work without shipping that work as browser JavaScript.

### Checkpoint

Complete the rule:

“Use a Client Component when the component needs ________.”

**Strong answer:** Client-side capabilities such as state, event handlers, or browser-only APIs.

### Forge takeaway

Do not mark everything `'use client'` because it is convenient.

Ask:

**“Does this component actually need the browser?”**

### Lesson completion

Take one interactive component and one static component. Decide which side of the boundary each belongs on and explain the reason.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.6 — Server Components and Data Close to the Server
**Estimated time:** 15 minutes

Now use the boundary for something useful.

A Server Component can perform server-side work while rendering the result for the user.

Imagine a dashboard page that needs a list of invoices.

A Server Component can call server-side data access directly.

```tsx
export default async function Page() {
  const invoices = await getInvoices();

  return <InvoiceList invoices={invoices} />;
}
```

### What changed?

The component is now asynchronous.

Instead of:

**browser asks → browser fetches → browser waits → browser renders**

the application can perform work on the server before returning the rendered result.

### Prediction

Which component is the best candidate for server-side data access?

A. A component that only needs a click counter in the browser
B. A page that reads server-side application data and renders the result
C. A button label
D. A CSS rule

**Review key:** B

### Keep the client small

Suppose the invoice list is large, but only a small filter control needs client-side interaction.

A strong architecture can look like:

```text
Server page
├── Server-rendered invoice data
└── Client filter control
```

The entire page does not need to become interactive.

### Important boundary rule

Do not place secrets into Client Components merely because the data is needed somewhere on the page.

Server-side work and client-side work have different visibility and trust properties.

The details of authentication and authorization come later.

For now, learn the architectural rule:

**Keep server-only work on the server.**

### Prediction

A component needs an environment-only secret to query internal data.

Where should that work live?

A. Directly inside browser event code
B. In server-side code
C. Inside CSS
D. In the URL

**Review key:** B

### Parallel work

Suppose a server-rendered page needs two independent datasets:

```tsx
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories(),
]);
```

The key idea is not the syntax.

The key idea is:

**Independent work does not always need to wait in sequence.**

### Checkpoint

Why can Server Components reduce client-side work?

A. They eliminate HTML.
B. They allow some rendering and data access to happen on the server instead of shipping all that work to the browser.
C. They make JavaScript unnecessary.
D. They replace React components.

**Review key:** B

### Forge takeaway

The server/client boundary is not a limitation to fight.

It is a tool for deciding where work belongs.

### Lesson completion

Take one page that needs data and one interactive control. Sketch which parts should run on the server and which small part needs the client.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.7 — Client Components Where Interaction Actually Lives
**Estimated time:** 15 minutes

Client Components are not “better React components.”

They are components that need browser-side capabilities.

Common reasons include:

- state,
- event handlers,
- effects,
- browser APIs,
- interactive widgets.

### Example

```tsx
'use client';

import { useState } from 'react';

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <button onClick={() => setOpen(!open)}>
      {open ? 'Close' : 'Open'}
    </button>
  );
}
```

### Notice the boundary

Only the menu needs the client.

The surrounding page can remain server-rendered.

### Predict the best split

A product page contains:

- product description,
- product price,
- image,
- quantity stepper.

Which part most clearly needs client-side behavior?

A. The product description
B. The price text
C. The quantity stepper
D. The route folder

**Review key:** C

### Overusing the client

A common beginner reaction is:

> “I need one click, so I will add `'use client'` at the top of the entire page.”

That works in the narrow sense.

But it can expand the client boundary more than necessary.

Better:

**Move interactivity toward the smallest component that needs it.**

### Composition across the boundary

A Server Component can render a Client Component.

That lets you keep server-side work and interactive controls in the same page architecture.

### Checkpoint

Which approach shows stronger architectural judgment?

A. Make every route a Client Component.
B. Make every component a Client Component.
C. Keep components server-side unless they actually need client capabilities.
D. Avoid React state entirely.

**Review key:** C

### Forge takeaway

Client Components should be intentional.

The question is not:

**“Can this be client-side?”**

The question is:

**“Does this need to be client-side?”**

### Lesson completion

Look at one of your React features and identify the smallest component that truly needs browser interactivity.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.8 — Loading and Streaming the Experience
**Estimated time:** 15 minutes

A real application sometimes needs time.

The mistake is pretending nothing is happening while the user waits.

Next.js provides route-level loading UI through `loading.tsx`.

Imagine:

```text
app/
  dashboard/
    loading.tsx
    page.tsx
```

The loading UI can appear while the route's work is being prepared.

### Prediction

What is the user experience problem with a route that shows nothing while waiting?

A. The user cannot tell whether the application is working.
B. The server stops existing.
C. The URL becomes invalid.
D. HTML cannot be rendered.

**Review key:** A

### Loading is part of the interface

A loading state is not an afterthought.

It answers:

**“What should the user see while the system is not ready yet?”**

Good loading UI can preserve structure so the page feels stable.

### The shape should help the user predict

A skeleton that resembles the eventual content can communicate:

“This space is reserved for something that is coming.”

That is often more useful than a generic spinner.

### Streaming

A framework can also reveal ready parts of the page while slower work continues.

The mental model:

```text
Ready content
   ↓
shown now
   +
slow content
   ↓
arrives later
```

### Checkpoint

Which loading strategy is stronger?

A. Leave the user staring at a blank screen.
B. Provide meaningful route-level loading UI that communicates progress and preserves the page's shape.
C. Hide the URL.
D. Disable the browser.

**Review key:** B

### Forge takeaway

Latency is part of UI design.

Do not only design the “happy final screen.”

Design what the user experiences **while the system is becoming ready**.

### Lesson completion

Take one route in an application and write the loading state you would want the user to see before its final content appears.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.9 — Errors and Not Found Are Different States
**Estimated time:** 15 minutes

A production application must explain failure.

Next.js provides route-level error handling through special files such as `error.tsx`, and not-found handling through `not-found.tsx` together with the `notFound()` function.

These represent different situations.

### Error state

An unexpected failure occurred.

### Not-found state

The requested resource does not exist.

Those are not the same user experience.

### Prediction

A user requests `/products/999`, but product 999 does not exist.

Which outcome communicates the situation most accurately?

A. “Something exploded.”
B. “This product could not be found.”
C. “The network is slow.”
D. “Please restart your computer.”

**Review key:** B

### Route error UI

An `error.tsx` file can provide a recovery experience for an uncaught error in that route segment.

A strong error screen should answer:

1. What happened?
2. Can the user retry?
3. Is there somewhere useful to go next?

### Not-found UI

A missing resource deserves a different message.

For example:

```text
Product not found.

The product may have been removed or the address may be incorrect.

[Back to products]
```

### Checkpoint

Complete the mapping:

**Unexpected failure → ________**

**Missing resource → ________**

**Answer:** error boundary UI → not-found UI

### Engineering judgment

Do not catch every failure and turn it into “Not found.”

That hides real problems.

Likewise, do not tell users “server error” when the actual situation is simply that an item does not exist.

### Forge takeaway

A good error experience starts with accurate classification.

**Different problems deserve different states.**

### Lesson completion

Write two messages for the same product page: one for “product missing” and one for “unexpected system failure.” Make the difference obvious to the user.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.10 — Metadata Is Part of the Application
**Estimated time:** 15 minutes

A page is not only what appears inside the visible body.

The document also needs metadata.

Next.js supports metadata through route-level configuration such as:

```tsx
export const metadata = {
  title: 'Products',
  description: 'Browse available products.',
};
```

### Why this matters

Metadata can affect what users see in browser tabs, search-related contexts, and shared page information.

It is part of the page's identity.

### Prediction

Which title better communicates a product page?

A. `Page`
B. `Untitled`
C. `Product: Noise-Cancelling Headphones`
D. `Thing`

**Review key:** C

### Metadata should follow the route

A dashboard layout might have application-level metadata.

A product detail route can provide more specific metadata.

The same principle appears again:

**Put information near the boundary that owns it.**

### Dynamic metadata

Some pages need metadata based on the current resource.

For example, a product page may need its title to include the product name.

That means metadata can participate in the same server-side data flow as the page.

### Checkpoint

Why should metadata be treated as application content?

A. Because it is unrelated to the page.
B. Because it communicates important page identity and context outside the visible body.
C. Because CSS requires it.
D. Because it replaces the page.

**Review key:** B

### Forge takeaway

Professional frontend work includes what users do not always see directly.

Metadata, loading states, errors, and structure are all part of the application experience.

### Lesson completion

Write the metadata you would use for a `/dashboard/reports` route and a `/products/42` route.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.11 — Route Handlers: When the App Exposes an HTTP Boundary
**Estimated time:** 15 minutes

Sometimes a Next.js application needs to expose an HTTP endpoint.

The App Router provides Route Handlers.

A simplified route can look like:

```text
app/
  api/
    products/
      route.ts
```

That file can define how the application responds to HTTP requests.

### Why is this different from a page?

A page produces UI.

A Route Handler produces an HTTP response.

That makes the mental model:

**Page → interface**

**Route Handler → HTTP boundary**

### Prediction

Which request belongs in a Route Handler?

A. “Show the products screen.”
B. “Respond with product data for an HTTP client.”
C. “Make the heading bold.”
D. “Align two cards.”

**Review key:** B

### Keep responsibilities clear

If a page needs product data, that does not automatically mean the browser must call your own Route Handler.

Server-side application code can often access the data directly.

A Route Handler becomes useful when you actually need an HTTP boundary.

### Example shape

```ts
export async function GET() {
  return Response.json([
    { id: '1', name: 'Notebook' },
    { id: '2', name: 'Keyboard' },
  ]);
}
```

The important idea is the contract.

A client can make an HTTP request and receive a defined response.

### Checkpoint

Which statement is strongest?

A. Every piece of server data should be routed through a Route Handler.
B. Route Handlers are useful when your application needs to expose an HTTP endpoint.
C. Route Handlers replace pages.
D. Route Handlers are CSS files.

**Review key:** B

### Forge takeaway

Do not create a new abstraction just because the framework gives you one.

Ask:

**“Do I actually need this HTTP boundary?”**

### Lesson completion

Describe one situation where a Route Handler is appropriate and one situation where server-side code could access the data directly instead.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.12 — Server Actions and Form Mutations
**Estimated time:** 15 minutes

Reading data is only half the application.

Users also create, update, and delete things.

Next.js supports Server Actions for server-side mutations.

The key concept is simple:

**The user performs an interaction. The application invokes server-side code.**

### Example shape

```tsx
<form action={saveProfile}>
  <input name="name" />
  <button type="submit">Save</button>
</form>
```

The server-side action can receive the submitted form data.

### Prediction

What should the server ultimately decide for a protected mutation?

A. Whether the CSS is pretty
B. Whether the operation is allowed and how the data should be changed
C. Whether the browser button is blue
D. Whether the user's monitor is large enough

**Review key:** B

### Why this matters

A form is not merely a UI object.

It crosses a trust boundary.

The browser can submit data.

The server must validate and process that data.

Security-sensitive authorization remains a server responsibility.

### Redirect and revalidation

After a successful mutation, the application may need to:

1. update the stored data,
2. invalidate or refresh relevant cached data,
3. redirect the user or return the updated result.

The exact mechanism matters, but the higher-level sequence is what you should remember.

### Checkpoint

Which statement is correct?

A. Client-side validation is enough for every mutation.
B. The server should validate and enforce important rules for mutations.
C. The browser should decide who is authorized.
D. Forms should never send data.

**Review key:** B

### Forge takeaway

Forms are system boundaries.

Treat submitted data as untrusted input until the server validates it.

### Lesson completion

Write the steps for a profile-update flow from button press to successful completion. Identify where browser behavior ends and server enforcement begins.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.13 — Environment Variables and Server-Only Configuration
**Estimated time:** 15 minutes

Applications need configuration.

Database URLs, external service keys, and deployment-specific values should not simply be hard-coded into application source.

Next.js supports environment variables.

### The important distinction

Some configuration may be safe to expose to the browser.

Other values must remain server-only.

The dangerous mistake is treating all environment variables as equally secret.

### Prediction

Where should a private database connection value live?

A. In code shipped to the browser
B. In server-side environment configuration
C. In a CSS file
D. In a visible page heading

**Review key:** B

### Public configuration

Some configuration may intentionally be available to the browser.

The exact naming and exposure mechanism matters.

The learner's rule should be:

**Never assume a configuration value is secret just because it came from an environment variable.**

### Inspect the boundary

Ask:

- Where is this value read?
- Does that code run on the server?
- Could the value become part of the browser bundle or response?
- Should a user ever be able to see it?

### Checkpoint

Which is a dangerous assumption?

A. Some configuration is server-only.
B. Some configuration can intentionally be public.
C. Every environment variable is automatically secret from users.
D. Where the code runs affects what can safely be exposed.

**Review key:** C

### Forge takeaway

Configuration is architecture.

The question is not only “Where do I store this?”

It is also:

**“Who can see it when the application runs?”**

### Lesson completion

Classify three imaginary values as server-only or potentially public: a database password, a public analytics ID, and a private signing secret.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.14 — Caching and Revalidation: Freshness Is a Decision
**Estimated time:** 15 minutes

A full application also has to answer:

**How fresh does this data need to be?**

Caching can improve speed, but cached data can become stale.

That means caching is not merely a performance switch.

It is a product decision about freshness.

### A simple comparison

Suppose a page shows:

- a marketing headline,
- a user's current account balance,
- a product catalog.

These values do not necessarily have the same freshness requirements.

### Prediction

Which value is most sensitive to stale data?

A. A static headline
B. A current account balance
C. A decorative label
D. A footer slogan

**Review key:** B

### Revalidation

When data changes, the application may need to tell the framework that previously cached output is no longer current.

Next.js provides APIs such as `revalidatePath` for invalidating relevant cached route output after mutations.

The mental model:

```text
stored/cached result
        ↓
data changes
        ↓
old result is no longer acceptable
        ↓
revalidate
        ↓
fresh result can be produced
```

### Avoid fake freshness

A common mistake is declaring everything dynamic without thinking.

Another is caching everything and forgetting that users need current information.

Engineering means matching the caching strategy to the data.

### Checkpoint

Which question should you ask before caching a value?

A. “Can I make this complicated?”
B. “How fresh does this information need to be?”
C. “Can I put it in CSS?”
D. “Can I hide it from the user?”

**Review key:** B

### Forge takeaway

Caching is not “make it faster.”

Caching is:

**trade some freshness complexity for reuse and speed.**

### Lesson completion

Choose one page from an application and identify one value that could tolerate staleness and one value that should be kept current. Explain why.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---

# 4.1.15 — Forge Mission: Build a Production-Shaped Next.js App
**Estimated time:** 15 minutes

You are taking over a small Next.js application called **Forge Market**.

The application has:

```text
app/
  page.tsx
  products/
    page.tsx
    [id]/
      page.tsx
  dashboard/
    page.tsx
```

Users report five problems:

1. The dashboard has no shared navigation.
2. The product detail page contains an interactive quantity control, but the entire page was marked client-side.
3. While a product page loads, the screen becomes visually empty.
4. A missing product shows a generic system error.
5. After an admin updates a product, another page continues showing stale product data.

Your job is to reason about the application before changing code.

### Mission Part 1 — Route structure

Where should the shared dashboard navigation live?

A. Every dashboard page separately
B. `app/dashboard/layout.tsx`
C. The product page
D. A CSS file

**Review key:** B

### Mission Part 2 — Client boundary

The quantity control uses local state.

What should happen?

A. Convert the entire application to Client Components.
B. Keep the interactive control client-side while keeping other parts server-side when possible.
C. Remove all state.
D. Move the state into CSS.

**Review key:** B

### Mission Part 3 — Loading

The product detail page takes time to prepare.

What framework boundary can provide route-level loading UI?

A. `loading.tsx`
B. `package.json`
C. `globals.css`
D. `README.md`

**Review key:** A

### Mission Part 4 — Missing resource

Product 42 does not exist.

What user experience should the route provide?

A. A generic crash
B. A not-found experience
C. A CSS warning
D. The previous product

**Review key:** B

### Mission Part 5 — Stale data

An update succeeds, but a page still shows old product information.

What category of problem should you investigate?

A. Cache freshness and revalidation
B. HTML heading hierarchy
C. Button border radius
D. Keyboard focus styling

**Review key:** A

### Mission Part 6 — Final architecture

Draw this application:

```text
Forge Market
├── Root layout
├── Products
│   ├── Product list
│   └── Product detail
│       └── Interactive quantity control
└── Dashboard
    ├── Shared dashboard layout
    └── Dashboard pages
```

Then answer:

**1. Which work should stay on the server?**

**2. Which component actually needs the client?**

**3. Where should loading and not-found states live?**

**4. Which boundaries own shared navigation?**

**5. Where would a mutation happen?**

**6. What needs revalidation after data changes?**

### Reference reasoning

A strong architecture keeps the application mostly server-oriented until interaction requires a client boundary. Shared dashboard navigation belongs in the dashboard layout. Product detail data can be prepared on the server while the quantity control remains interactive on the client. Route-level loading and not-found behavior belong near the route boundary. Mutations should be validated and performed server-side, and relevant cached output should be revalidated when the underlying data changes.

### Transfer challenge

Now change the application.

Instead of a product marketplace, imagine a documentation site with:

- `/docs`
- `/docs/getting-started`
- `/docs/guides/[slug]`
- a client-side table-of-contents control,
- server-rendered guide content,
- a custom not-found page.

Use the same reasoning model.

Do not copy the previous file tree mechanically.

Ask:

**What is shared? What is route-specific? What needs the browser? What can stay on the server? What happens while work is pending? What happens when the resource is missing?**

### Module mastery gate

You are ready to leave this module when you can explain, without memorizing a recipe:

**1.** how the App Router maps structure to routes,

**2.** when a layout is the right boundary,

**3.** when a component actually needs the client,

**4.** how loading and error states are part of the route experience,

**5.** when a Route Handler is useful,

**6.** how server-side mutations and revalidation fit together,

**7.** and why caching is a freshness decision rather than just a performance trick.

### Forge takeaway

The framework is not the architecture.

**The architecture is the set of boundaries you deliberately choose.**

Next.js gives you tools to express those boundaries.

Your job is to know where they belong.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
