# Forge Curriculum v2
## Module 2.2 — JavaScript in the Browser
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing lesson manuscript for review. Answer keys and hints are included for review so the lesson can be audited before JSON generation.

## Module outcome
By the end of this module, the learner can inspect and change the current page, respond to browser events, read form input, control default browser actions, and preserve a small client-side preference between refreshes.

## Module lessons
1. **The Page Is a Data Structure** — DOM
2. **Find the Thing You Need** — DOM selection
3. **Read and Change the Page** — `textContent`
4. **Classes Connect Structure and Presentation** — `classList`
5. **Events: The Browser Waits** — event handlers
6. **Event Data: Know What Happened** — event object
7. **Forms: Read What the User Entered** — form values and submit
8. **Default Browser Actions and Control** — `preventDefault()`
9. **Remembering Between Refreshes** — browser storage
10. **Forge Mission: Build an Interactive Page** — integration and repair

---
# 2.2.1 — The Page Is a Data Structure
**Estimated time:** 12 minutes  
**Learner goal:** Understand that the browser turns HTML into a live document structure that JavaScript can inspect and change.

## Start here

In the previous module, JavaScript lived mostly as a language: values, decisions, loops, functions, arrays, and objects.

Now put that language inside a browser page.

The page is no longer just text sitting in a file. The browser reads the HTML and builds a live structure representing the document. JavaScript can look at that structure, find parts of it, and change parts of it.

## A useful first picture

Think of the page like a tree.

A document can contain a main heading, then a paragraph, then a list. The browser represents those relationships as a structure of objects.

For example:

```html
<main>
  <h1>Profile</h1>
  <p>Welcome, Ada.</p>
</main>
```

The `main` element contains the `h1` and `p` elements. The paragraph is inside the main element. Those relationships matter because JavaScript can navigate this structure.

## Quick prediction

What is JavaScript interacting with when it changes the text of a paragraph already displayed in the page?

A. Only the text file stored on the server
B. The browser's live document structure
C. The user's keyboard
D. The CSS editor

**Review key:** B

## What the browser builds

The browser takes the HTML document and creates a live representation commonly called the **DOM**, short for **Document Object Model**.

You do not need to memorize the full browser implementation. For now, use this mental model:

**HTML gives the browser a document to build. The browser builds the DOM. JavaScript can inspect and change that DOM.**

## Tiny observation

Start with:

```html
<p>Hello.</p>
```

Then imagine JavaScript changes the paragraph text to `Hello, Ada.`

The HTML file on disk has not magically rewritten itself. The browser's current page changed.

That distinction will matter whenever a page appears to change without a new document being loaded.

## Checkpoint

Which sentence is the most accurate?

A. The DOM is the same thing as the original HTML file.
B. The DOM is the browser's live document structure that JavaScript can inspect and change.
C. The DOM is only the page's CSS.
D. The DOM is the internet connection.

**Review key:** B

## Forge takeaway

**Mental model:** JavaScript in the browser can work on a live document structure.

**Senior habit:** When an interface changes, ask whether the code changed the current page structure or caused a new page to load.

---
# 2.2.2 — Find the Thing You Need
**Estimated time:** 13 minutes  
**Learner goal:** Find specific elements in the page and recognize the difference between selecting the right element and changing it.

## Start here

A page can contain dozens or hundreds of elements. JavaScript needs a way to find the particular element it wants to work with.

For this module, start with one reliable tool: `document.querySelector(...)`.

It accepts a CSS selector and returns the first matching element.

## First example

Given:

```html
<p id="status">Waiting</p>
```

You can find it with:

```js
const status = document.querySelector("#status");
```

The `#` means "find the element whose id is `status`."

## Prediction

What will `status` refer to after this line?

```js
const status = document.querySelector("#status");
```

A. The text `Waiting` as a plain string
B. The paragraph element in the page
C. The whole document
D. A copy of the HTML file

**Review key:** B

## Different selectors, different targets

These selectors look for different things:

```js
document.querySelector("#status");
document.querySelector(".card");
document.querySelector("button");
```

- `#status` targets an element with that id.
- `.card` targets the first element with that class.
- `button` targets the first button element.

The important skill is not memorizing selector trivia. It is learning to state exactly which element your code intends to touch.

## Try it

Use this page:

```html
<h1 id="title">Forge</h1>
<p class="note">Build carefully.</p>
<button id="save">Save</button>
```

Write three selections:

1. Find the heading.
2. Find the note.
3. Find the button.

**Suggested answers:**

```js
document.querySelector("#title");
document.querySelector(".note");
document.querySelector("#save");
```

## What if nothing matches?

If the selector does not match an element, `querySelector` returns `null`.

That means your code has to be careful about assuming a match exists.

The useful debugging question is: **Did I select the element I think I selected?**

## Checkpoint

A learner writes:

```js
const button = document.querySelector(".save");
```

But the page contains:

```html
<button id="save">Save</button>
```

What is the problem?

A. The selector asks for a class named `save`, but the element has an id named `save`.
B. Buttons cannot be selected.
C. JavaScript cannot inspect HTML.
D. The browser changed the id into a class.

**Review key:** A

## Forge takeaway

**Mental model:** First find the exact element you mean. Then operate on it.

**Senior habit:** When a DOM operation fails, inspect the selection before blaming the operation.

---
# 2.2.3 — Read and Change the Page
**Estimated time:** 13 minutes  
**Learner goal:** Read visible text from an element and change visible text deliberately with `textContent`.

## Start here

Finding an element is only half the job. Next, read or change what is inside it.

## Reading text

Given:

```html
<p id="status">Waiting</p>
```

You can read its current text:

```js
const status = document.querySelector("#status");
console.log(status.textContent);
```

The result is the string `Waiting`.

## Changing text

You can assign a new value:

```js
status.textContent = "Ready";
```

The browser updates the current page so the paragraph displays `Ready`.

## Predict the output

What appears on the page after this code runs?

```html
<p id="status">Waiting</p>
<script>
  const status = document.querySelector("#status");
  status.textContent = "Ready";
</script>
```

A. Waiting
B. Ready
C. status.textContent
D. Nothing

**Review key:** B

## Change one thing

Start with:

```html
<h1 id="message">Good morning</h1>
```

Write JavaScript that changes the heading to `Good afternoon`.

**Answer:**

```js
const message = document.querySelector("#message");
message.textContent = "Good afternoon";
```

## One important distinction

Changing `textContent` changes the text inside the current element. It does not change which element you selected.

That gives you a useful two-step pattern:

**Select → Change**

```js
const message = document.querySelector("#message");
message.textContent = "Good afternoon";
```

## Checkpoint

A learner says, "I changed the paragraph, so I changed the HTML file."

What is the better explanation?

A. The browser changed the live page structure; the original file on disk was not rewritten by `textContent`.
B. JavaScript always edits files on the computer.
C. `textContent` changes CSS.
D. The browser sent the paragraph to a server.

**Review key:** A

## Forge takeaway

**Mental model:** DOM code often follows a simple sequence: find an element, then read or change one of its values.

**Senior habit:** Make one small DOM change and verify exactly what changed.

---
# 2.2.4 — Classes Connect Structure and Presentation
**Estimated time:** 13 minutes  
**Learner goal:** Use `classList` to add, remove, and toggle classes so JavaScript can change presentation through existing CSS rules.

## Start here

You already know CSS can describe how an element should look. Now the browser lets JavaScript decide which existing class an element should have.

## The connection

Suppose the page already contains a CSS rule for `.active` and an element:

```html
<p id="status">Offline</p>
```

JavaScript can add the class:

```js
const status = document.querySelector("#status");
status.classList.add("active");
```

It can remove it:

```js
status.classList.remove("active");
```

Or toggle it:

```js
status.classList.toggle("active");
```

You are not rewriting the CSS rule. You are changing which classes the element currently has.

## Predict

If an element already has `class="card"` and this runs:

```js
card.classList.add("selected");
```

what is the likely new class list?

A. `card`
B. `selected`
C. `card selected`
D. the element is removed

**Review key:** C

## Try it

Use this starting point:

```html
<p id="status" class="status">Offline</p>
```

Add and remove a class called `active`.

```js
const status = document.querySelector("#status");
status.classList.add("active");
status.classList.remove("active");
```

Then try:

```js
status.classList.toggle("active");
```

Observe that `toggle` flips the class between present and absent.

## Why this pattern matters

Separating responsibilities makes code easier to reason about:

- CSS defines what the `active` state looks like.
- JavaScript decides when the `active` state applies.

That means behavior can change without rewriting the visual rule each time.

## Checkpoint

Which statement best describes `classList.toggle("active")`?

A. It always adds the class.
B. It always removes the class.
C. It adds the class if it is absent and removes it if it is present.
D. It changes the text of the element.

**Review key:** C

## Forge takeaway

**Mental model:** JavaScript can change presentation indirectly by changing the element's classes.

**Senior habit:** Prefer changing a state or class that CSS already knows how to present instead of scattering style decisions through behavior code.

---
# 2.2.5 — Events: The Browser Waits
**Estimated time:** 14 minutes  
**Learner goal:** Understand events as browser notifications and attach a function that runs in response to a user action.

## Start here

A page does not need to run every instruction at once.

The browser can wait for something to happen: a click, a key press, a form submission, and many other events.

An **event** is a notification that something happened.

## Your first click handler

Given:

```html
<button id="save">Save</button>
<p id="status">Waiting</p>
```

You can tell the browser what to do when the button is clicked:

```js
const save = document.querySelector("#save");
const status = document.querySelector("#status");

save.addEventListener("click", () => {
  status.textContent = "Saved";
});
```

## What happens first?

Before anyone clicks the button, what does the code do?

A. It changes the paragraph to `Saved` immediately.
B. It registers a function that should run when a click happens.
C. It clicks the button automatically.
D. It sends a request.

**Review key:** B

## What happens on click?

After the user clicks:

1. The browser notices the click.
2. The browser runs the function attached to the `click` event.
3. The function changes the paragraph text.

This is the basic event loop you need first: **wait → event happens → handler runs → visible result changes.**

## Try it

Build a small page:

```html
<button id="hello">Say hello</button>
<p id="message">Nothing yet.</p>
```

Make the paragraph change to `Hello, learner.` when the button is clicked.

**Answer:**

```js
const hello = document.querySelector("#hello");
const message = document.querySelector("#message");

hello.addEventListener("click", () => {
  message.textContent = "Hello, learner.";
});
```

## Common mistake

This code changes the paragraph immediately:

```js
message.textContent = "Hello, learner.";
hello.addEventListener("click", () => {});
```

The click handler is empty, so the click has no useful work attached to it.

The debugging question is: **What code is actually inside the event handler?**

## Checkpoint

A button has a click handler, but clicking it does nothing.

What should you inspect first?

A. Whether the intended work is actually inside the function registered for the click.
B. Whether the monitor is plugged in.
C. Whether the button has a label.
D. Whether the server owns the button.

**Review key:** A

## Forge takeaway

**Mental model:** Event-driven code waits for a browser event and runs a handler when that event occurs.

**Senior habit:** Separate setup code from event-time code in your mental trace.

---
# 2.2.6 — Event Data: Know What Happened
**Estimated time:** 13 minutes  
**Learner goal:** Use the event object and `event.target` to identify the element involved in an interaction.

## Start here

Sometimes knowing that an event happened is not enough. The handler may need information about what happened.

## The event object

The browser passes an **event object** to the handler function.

For a click, one useful property is `event.target`: the element the event came from.

Example:

```js
button.addEventListener("click", (event) => {
  console.log(event.target);
});
```

## Prediction

Suppose this page has one button:

```html
<button id="save">Save</button>
```

When that button is clicked, what should `event.target` refer to?

A. The button element
B. The whole internet
C. The string `click`
D. The CSS file

**Review key:** A

## Multiple buttons

Imagine three buttons:

```html
<button>One</button>
<button>Two</button>
<button>Three</button>
```

Each button can use the same idea. The event tells the handler which element was involved in that particular click.

## Try it

Use:

```html
<button class="choice">One</button>
<button class="choice">Two</button>
<button class="choice">Three</button>
<p id="result">Choose one.</p>
```

For now, you can attach a handler to one button and print `event.target.textContent` to the console when it is clicked.

**Suggested code:**

```js
const choice = document.querySelector(".choice");
const result = document.querySelector("#result");

choice.addEventListener("click", (event) => {
  result.textContent = event.target.textContent;
});
```

## Important limitation

`querySelector(".choice")` selects only the first matching button. The example is intentionally small so you can see the event data clearly.

Handling many matching elements is a separate design problem we can solve later.

## Checkpoint

What is the main job of the event object in this lesson?

A. It contains information about the event that just occurred.
B. It stores every element on the page forever.
C. It replaces the DOM.
D. It automatically changes the page.

**Review key:** A

## Forge takeaway

**Mental model:** An event tells you that something happened; the event object can tell you more about what happened.

**Senior habit:** Before writing a handler, identify what information the handler actually needs.

---
# 2.2.7 — Forms: Read What the User Entered
**Estimated time:** 15 minutes  
**Learner goal:** Read form control values, respond to submission, and update the page with the user's input.

## Start here

A browser page often needs to react to information the user provides. Forms give users a structured way to enter that information.

## Read a value

Consider:

```html
<label for="name">Name</label>
<input id="name" />
```

JavaScript can read the current value:

```js
const nameInput = document.querySelector("#name");
console.log(nameInput.value);
```

## Prediction

If the user types `Ada` into the input, what does `nameInput.value` contain?

A. The element itself
B. The string `Ada`
C. The label text
D. The input's CSS class

**Review key:** B

## A small form

Build this:

```html
<form id="profileForm">
  <label for="name">Name</label>
  <input id="name" />
  <button type="submit">Save</button>
</form>
<p id="message">Waiting.</p>
```

The browser can tell you when the form is submitted.

## Handle the submit

Use:

```js
const form = document.querySelector("#profileForm");
const nameInput = document.querySelector("#name");
const message = document.querySelector("#message");

form.addEventListener("submit", (event) => {
  message.textContent = `Hello, ${nameInput.value}.`;
});
```

Notice the sequence:

**submission happens → handler runs → read current value → update the page**

## Try a variation

Change the handler so that an empty value produces `Please enter your name.` instead.

**Suggested answer:**

```js
form.addEventListener("submit", (event) => {
  if (nameInput.value === "") {
    message.textContent = "Please enter your name.";
    return;
  }

  message.textContent = `Hello, ${nameInput.value}.`;
});
```

This combines browser interaction with a language skill you already learned: a conditional.

## Checkpoint

Where does the current text typed by the user live in this example?

A. In `nameInput.value`
B. In the CSS rule
C. In the submit button's text
D. In `event.target` only

**Review key:** A

## Forge takeaway

**Mental model:** Browser code can read the current value of a form control and use it to update the current page.

**Senior habit:** Trace user input as data: where it starts, where you read it, and where you put the result.

---
# 2.2.8 — Default Browser Actions and Control
**Estimated time:** 14 minutes  
**Learner goal:** Understand that some browser events have built-in behavior and learn when `preventDefault()` is appropriate for a controlled page interaction.

## Start here

Browsers have their own behavior for certain interactions. A form submission, for example, has a default action.

When you need the page to handle an interaction itself, you may need to stop that default action.

## The key method

Inside an event handler, `event.preventDefault()` tells the browser not to perform the default action associated with that event.

Example:

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "Handled by this page.";
});
```

## Prediction

Why would a form handler call `event.preventDefault()`?

A. To stop the browser's default submit action so the page can handle the interaction itself.
B. To erase the form fields.
C. To make the browser load CSS faster.
D. To prevent JavaScript from running.

**Review key:** A

## Compare the flows

Without `preventDefault`, the browser may continue with its normal form submission behavior.

With `preventDefault`, your handler can keep control of the interaction and update the current page instead.

## Try it

Use:

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = `Saved ${nameInput.value}.`;
});
```

Test the form. The page should remain where it is while your handler updates the message.

## A caution

`preventDefault()` is not a magic "make this secure" method. It only controls the browser's default action for the event.

It also does not validate whether a user is allowed to perform an operation. Security boundaries are handled elsewhere and will be taught later.

## Checkpoint

Which explanation is most accurate?

A. `preventDefault()` turns off all browser behavior.
B. `preventDefault()` stops the default action for the particular event being handled.
C. `preventDefault()` rewrites the HTML file.
D. `preventDefault()` makes every form valid.

**Review key:** B

## Forge takeaway

**Mental model:** Some browser events come with default behavior. An event handler can intentionally prevent that default when the page needs to take control.

**Senior habit:** Ask what the browser would do by default before deciding whether your handler should override it.

---
# 2.2.9 — Remembering Between Refreshes
**Estimated time:** 15 minutes  
**Learner goal:** Distinguish temporary JavaScript state from simple browser storage and use `localStorage` to save and restore a small preference.

## Start here

A JavaScript variable exists while your page code is running. Refresh the page, and that variable starts over.

Sometimes you want the browser to remember a small piece of user preference between visits.

## Two kinds of memory

Temporary state:

```js
let theme = "light";
```

The variable lives in the current page session.

Browser storage:

```js
localStorage.setItem("theme", "light");
```

The browser can keep that string and provide it again later.

## Read it back

You can retrieve it with:

```js
const theme = localStorage.getItem("theme");
```

If the key has not been stored, the result is `null`.

## Prediction

After:

```js
localStorage.setItem("name", "Ada");
```

what should this produce?

```js
localStorage.getItem("name");
```

A. `Ada`
B. `name`
C. `null` every time
D. The input element

**Review key:** A

## Build a remembered preference

Use:

```html
<button id="toggle">Remember me</button>
<p id="status">Not remembered.</p>
```

Then:

```js
const toggle = document.querySelector("#toggle");
const status = document.querySelector("#status");

toggle.addEventListener("click", () => {
  localStorage.setItem("remembered", "yes");
  status.textContent = "Remembered.";
});
```

Now add code that reads the stored value when the page starts:

```js
const remembered = localStorage.getItem("remembered");

if (remembered === "yes") {
  status.textContent = "We remembered you.";
}
```

## Important limitation

Browser storage is useful for small client-side preferences, but it is not a replacement for secure server-side records. It is also not a place to hide secrets.

For this lesson, the useful skill is simply: **save a small preference → refresh → read it back.**

## Checkpoint

What is the main difference between `let theme = "light"` and `localStorage.setItem("theme", "light")`?

A. The variable is current page state; browser storage is designed to keep the value available after refreshes.
B. They are identical.
C. `localStorage` changes the CSS.
D. Variables can never change.

**Review key:** A

## Forge takeaway

**Mental model:** Some state exists only during the current run of the page. Browser storage can preserve small values across refreshes.

**Senior habit:** Choose storage based on how long the information needs to live and how trustworthy that storage location is.

---
# 2.2.10 — Forge Mission: Build an Interactive Page
**Estimated time:** 20 minutes  
**Learner goal:** Integrate DOM selection, text updates, events, forms, default-action control, classes, and small browser state into one coherent page.

## Mission

You have been given a simple profile page. The structure already exists. Your job is to make it interactive without changing the page into a completely different application.

## Starting page

```html
<main>
  <h1 id="title">Profile</h1>
  <p id="status">Ready.</p>

  <button id="activeButton">Toggle active</button>

  <form id="profileForm">
    <label for="name">Your name</label>
    <input id="name" />
    <button type="submit">Save name</button>
  </form>

  <p id="greeting">No name saved.</p>
</main>
```

## Mission requirements

Build all five behaviors:

**1. Toggle active**

Clicking `Toggle active` should add or remove the class `active` from the main heading.

**2. Save a name**

Submitting the form should stay on the current page instead of performing the browser's default form action.

**3. Update the greeting**

A non-empty name should change the greeting to `Hello, NAME.`

**4. Remember the name**

Save the name in browser storage under the key `profileName`.

**5. Restore the name**

When the page starts, read `profileName` and show the greeting if a name was previously saved.

## Prediction before coding

Before you write the code, answer:

1. Which DOM elements must you select?
2. Which behavior belongs inside a click handler?
3. Which behavior belongs inside a submit handler?
4. Where should `preventDefault()` be called?
5. Which value should be stored for later?

**Suggested answer:**

1. The heading, active button, form, name input, and greeting.
2. Add/remove the `active` class.
3. Read the name, validate that it is not empty, update the greeting, and save it.
4. Inside the submit handler.
5. The user's name.

## Build

A strong solution can follow this shape:

```js
const title = document.querySelector("#title");
const activeButton = document.querySelector("#activeButton");
const form = document.querySelector("#profileForm");
const nameInput = document.querySelector("#name");
const greeting = document.querySelector("#greeting");

activeButton.addEventListener("click", () => {
  title.classList.toggle("active");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value;

  if (name === "") {
    greeting.textContent = "Please enter your name.";
    return;
  }

  localStorage.setItem("profileName", name);
  greeting.textContent = `Hello, ${name}.`;
});

const savedName = localStorage.getItem("profileName");

if (savedName !== null) {
  greeting.textContent = `Hello, ${savedName}.`;
}
```

The learner does not need to copy this before trying. The intended sequence is predict → build → compare → repair.

## Break it on purpose

Now create one bug.

Choose one:

- Change `#title` to a selector that matches nothing.
- Remove `event.preventDefault()`.
- Store the name under `profileName` but read a different key.
- Put the class name `active` on the wrong element.

Reload and observe the symptom.

## Investigation prompts

For your broken version, answer:

1. What behavior was expected?
2. What actually happened?
3. Which line first stopped matching the intended behavior?
4. Which value or selection was wrong at that point?
5. What is the smallest repair that fixes the problem?

## Transfer

You now have a new requirement:

> Add a button that clears the saved name and returns the page to `No name saved.`

Design the steps before coding.

**Reference approach:** select the new button and greeting, listen for its click, remove the stored value, then update the greeting. The key is to trace the new behavior using the same browser model you just learned.

## Mastery gate

You are ready to leave this module when you can build a small browser interaction without copying a previous example and explain the full chain:

**user action → browser event → handler → DOM read/change → optional browser storage → visible result**

You should also be able to repair one broken selection, one broken event handler, and one broken stored-value key without starting over.

## Forge takeaway

**The browser is a runtime, not a passive screen.** It owns the current document, detects events, passes event information into your functions, and provides browser features such as storage.

**Senior habit:** Trace interactive bugs from the user action inward: event → selection → data → state change → visible result.
