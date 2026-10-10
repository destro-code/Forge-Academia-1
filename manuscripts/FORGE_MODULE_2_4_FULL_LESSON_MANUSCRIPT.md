# Forge Curriculum v2
## Module 2.4 — Web Data and APIs
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing lesson manuscript for review. It is not a lesson blueprint. Every activity below is written as content that can later be compiled into Forge canonical JSON. Answer keys and hints are included for review so the lesson can be audited before JSON generation.

### Module outcome

By the end of this module, the learner can explain an API as a communication contract, read a simple HTTP exchange, understand JSON as data, request data with `fetch`, reason about asynchronous results, represent loading/success/failure states, and investigate common browser-side request failures.

### Module lessons

1. **APIs Are Agreements**
2. **HTTP: What Are We Asking For?**
3. **JSON: Data With a Shape**
4. **Fetch: Ask for Data**
5. **Promises: The Result Arrives Later**
6. **Loading, Success, Failure**
7. **Forge Mission: Build With Remote Data**

---

# 2.4.1 — APIs Are Agreements

**Estimated time:** 11 minutes  
**Learner goal:** Understand an API as an agreed way for one piece of software to ask another piece of software for information or an operation.

## 1. Start here

So far, your browser has mostly been dealing with pages.

Now imagine a page that needs weather information, a list of products, or the current account profile.

Where does that information come from?

One useful answer is: **another piece of software provides it.**

An **API** is a defined way for software to communicate.

Think of it like a counter at a busy shop.

You do not walk into the kitchen and start rearranging the shelves.

You make a request in the form the shop accepts.

The kitchen does its work.

You get a response.

The important idea is not the restaurant metaphor itself.

The important idea is this:

**An API gives software a way to ask for something and know what kind of answer to expect.**

## 2. Quick prediction

A weather application needs today's temperature.

Which statement best describes the role of an API here?

A. The API is a way for the application to communicate with another system using an agreed format.
B. The API is the screen color of the weather application.
C. The API is the browser's memory.
D. The API is the keyboard shortcut used to refresh the page.

**Review key:** A

**Feedback after submit:** An API is a communication contract. It defines how software can ask for something and what kind of information or operation is available.

## 3. The contract idea

A useful API usually answers questions like:

- What can I ask for?
- How do I ask for it?
- What information do I need to send?
- What will come back?
- What does an error mean?

Suppose an API offers a route called:

```text
/products
```

The name alone is not the whole contract.

A useful contract might tell you that a request to `/products` returns a list of products.

That means frontend code does not have to guess what the other system decided to send.

## 4. Change one part

Imagine an API contract says:

```text
GET /products
returns:
[
  { "name": "Notebook" },
  { "name": "Keyboard" }
]
```

The frontend expects a list.

What would be most useful for the frontend developer?

A. Knowing the shape of the data that comes back.
B. Knowing the color of the server room.
C. Knowing the keyboard shortcut used by the backend developer.
D. Knowing the font used in the API documentation.

**Review key:** A

**Feedback after submit:** Shared expectations about the data shape are part of the contract.

## 5. Predict the bug

A developer writes code that expects each product to have a `name`.

The API changes and now returns:

```text
[
  { "title": "Notebook" },
  { "title": "Keyboard" }
]
```

What changed?

A. The browser stopped understanding arrays.
B. The contract the frontend relied on no longer matches the data it receives.
C. CSS stopped applying.
D. The user's keyboard changed language.

**Review key:** B

**Feedback after submit:** The issue is not “the data is wrong” in some abstract sense. The issue is that the consumer expected one shape and received another.

## 6. Say it in your own words

Complete:

> “An API is useful because it gives two pieces of software a shared ________ for communicating.”

**Suggested answer:** “contract” or “way of communicating.”

## 7. Checkpoint

Which sentence best captures the idea of an API?

A. “An API is where the data lives.”
B. “An API is an agreed way for software to communicate.”
C. “An API is another word for a webpage.”
D. “An API is a programming language.”

**Review key:** B

**Feedback after submit:** Keep the distinction clear: an API is a communication interface, not a programming language and not necessarily a webpage.

## 8. Forge takeaway

**Mental model:** APIs are agreements between software.

**Senior habit:** When integrating with another system, ask first: “What is the contract?”

### Lesson completion

Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain why a consumer and provider need matching expectations.

---

# 2.4.2 — HTTP: What Are We Asking For?

**Estimated time:** 13 minutes  
**Learner goal:** Understand the basic parts of an HTTP request and response, recognize common request methods and status categories, and use them to reason about what happened.

## 1. The web already has a message system

You learned earlier that browsers exchange messages with web services.

Now we need a more specific vocabulary for those messages.

**HTTP** is a protocol used for those web requests and responses.

For this lesson, focus on five parts:

**Request**
- method
- target
- optional headers/body

**Response**
- status
- optional headers/body

You do not need to memorize every header today.

You need to know how to read the exchange.

## 2. Methods describe the intent

Common HTTP methods include:

- `GET` — ask for information
- `POST` — send information to create or trigger something
- `PUT` — send a replacement representation
- `PATCH` — send a partial change
- `DELETE` — ask to remove something

These are conventions used by the protocol and by APIs.

## 3. Which method?

You want to read the current list of products.

Which method is the natural first choice?

A. `GET`
B. `DELETE`
C. `PATCH`
D. `POST`

**Review key:** A

**Feedback after submit:** Reading a resource is the classic `GET` case.

## 4. Which method?

You want to send a new product to an API.

Which method is the natural choice among the options?

A. `GET`
B. `POST`
C. `DELETE`
D. `HEADLESS`

**Review key:** B

**Feedback after submit:** `POST` is commonly used to send new information for creation or another server-side operation.

## 5. Status tells you what happened

The response contains a status code.

For this module, start with these groups:

**2xx — success**

**4xx — the request could not be accepted as sent**

**5xx — the server failed while handling the request**

You do not need every individual code yet.

The useful habit is reading the status before deciding what the result means.

## 6. Predict the result

A request returns:

```text
200
```

What can you reasonably conclude?

A. The request was successful.
B. The server definitely returned no data.
C. The request was deleted.
D. The browser never sent the request.

**Review key:** A

**Feedback after submit:** A `2xx` status indicates success. The exact body still determines what data was returned.

## 7. Another result

A request returns:

```text
404
```

What should your first interpretation be?

A. The requested resource was not found.
B. The server is always offline.
C. The user has no browser.
D. JavaScript automatically fixed the request.

**Review key:** A

**Feedback after submit:** `404` is commonly used when the requested resource is not found.

## 8. Read the whole exchange

Imagine:

```text
GET /products
        ↓
200 OK

[
  { "name": "Notebook" },
  { "name": "Keyboard" }
]
```

What does the complete exchange tell you?

A. The request asked for `/products`, the response was successful, and the response body contained two products.
B. The server returned CSS.
C. The request failed because `200` is an error.
D. The browser created both products locally.

**Review key:** A

**Feedback after submit:** Read the request and response together. The method and target explain the ask; the status and body explain what came back.

## 9. Checkpoint

A developer sees:

```text
POST /orders
500
```

What is the strongest first conclusion?

A. The request was successful.
B. The request reached the server side, but the server reported a failure while handling it.
C. The browser never attempted the request.
D. The user clicked the wrong color.

**Review key:** B

**Feedback after submit:** A `5xx` response tells you the server-side handling failed. You still need evidence before deciding why.

## 10. Forge takeaway

**Mental model:** HTTP gives the conversation structure: method + target on the request, status + data on the response.

**Senior habit:** Read the request and response as a pair. Do not guess what happened from a button click alone.

### Lesson completion

Complete the checkpoint and explain what the method, target, status, and response body tell you.

---

# 2.4.3 — JSON: Data With a Shape

**Estimated time:** 13 minutes  
**Learner goal:** Read common JSON values, arrays, and objects; connect JSON structure to JavaScript values; and predict what data a frontend can safely read.

## 1. Data needs a shape

Software needs to exchange data in a format both sides can understand.

A common format for web APIs is **JSON**, which stands for JavaScript Object Notation.

JSON can represent values such as:

```json
"Forge"
42
true
null
```

It can also represent objects and arrays.

## 2. JSON objects

A JSON object uses named keys and values:

```json
{
  "name": "Ada",
  "level": 3
}
```

Think of it as a named collection of information.

A frontend can read the value associated with `name`.

## 3. JSON arrays

An array contains an ordered list:

```json
[
  "HTML",
  "CSS",
  "JavaScript"
]
```

An array can also contain objects:

```json
[
  { "name": "HTML" },
  { "name": "CSS" },
  { "name": "JavaScript" }
]
```

## 4. Prediction

What is the value of the `name` field in the first object?

```json
{
  "name": "Ada",
  "level": 3
}
```

A. `3`
B. `"Ada"`
C. `"name"`
D. `null`

**Review key:** B

**Feedback after submit:** The key is `name`; the value stored under that key is `"Ada"`.

## 5. Read nested data

Consider:

```json
{
  "user": {
    "name": "Maya",
    "stats": {
      "level": 4
    }
  }
}
```

Where is the number `4`?

A. At `user.stats.level`
B. At `user.name.level`
C. At `stats.user.level`
D. At `level.user.stats`

**Review key:** A

**Feedback after submit:** Move through the named structure one key at a time: `user` → `stats` → `level`.

## 6. What can go wrong?

Suppose your code expects:

```json
{
  "user": {
    "name": "Maya"
  }
}
```

But the response is:

```json
{
  "account": {
    "name": "Maya"
  }
}
```

What is wrong with reading `user.name`?

A. The value is stored under a different key.
B. JSON objects cannot contain names.
C. Strings cannot be returned by APIs.
D. Arrays always replace objects.

**Review key:** A

**Feedback after submit:** The data is valid JSON. The problem is a mismatch between the expected shape and the received shape.

## 7. JavaScript connection

When an API response is converted from JSON into JavaScript values, you can work with the result using the JavaScript skills you already learned.

For example:

```js
const product = {
  name: "Notebook",
  price: 8
};

console.log(product.name);
```

The API did not give your code a magical new kind of data.

It gave your code structured information it can work with.

## 8. Predict the list

Given:

```js
const products = [
  { name: "Notebook" },
  { name: "Keyboard" }
];

console.log(products[1].name);
```

What is printed?

A. `Notebook`
B. `Keyboard`
C. `1`
D. `name`

**Review key:** B

**Feedback after submit:** Index `1` points to the second object, and `.name` reads that object's `name` value.

## 9. Checkpoint

Which statement is most accurate?

A. JSON is a programming language.
B. JSON is a common data format used to represent structured values.
C. JSON is the same thing as HTML.
D. JSON can only represent strings.

**Review key:** B

**Feedback after submit:** JSON represents structured data. JavaScript can then work with the resulting values.

## 10. Forge takeaway

**Mental model:** API data has a shape. Your code depends on that shape.

**Senior habit:** Before using a value from an API, know where it lives in the returned data structure.

### Lesson completion

Complete the checkpoint and trace at least one nested value from its outer object to its final field.

---

# 2.4.4 — Fetch: Ask for Data

**Estimated time:** 15 minutes  
**Learner goal:** Use `fetch()` at a basic level, understand that it returns a Promise, and read a response body as JSON.

## 1. The browser needs a way to ask

JavaScript running in the browser can make HTTP requests.

A common browser API for that is:

```js
fetch("/api/products");
```

The call asks for the resource.

But there is an important twist:

**The data is not available immediately.**

The result of `fetch()` is a **Promise**.

That means the code receives an object representing work that will finish later.

## 2. First prediction

What does this expression give you immediately?

```js
const result = fetch("/api/products");
```

A. The final array of products.
B. A Promise representing the eventual result.
C. A JSON object.
D. A string containing the product names.

**Review key:** B

**Feedback after submit:** The request may still be in progress. `fetch()` gives you a Promise for the eventual response.

## 3. Getting the response

A common pattern is:

```js
fetch("/api/products")
  .then((response) => {
    return response;
  });
```

The `.then(...)` callback runs when the Promise fulfills.

At this point, you have a **Response object**.

You do not automatically have the JSON body yet.

## 4. Reading the JSON body

You can ask the response to read its JSON body:

```js
fetch("/api/products")
  .then((response) => response.json())
  .then((products) => {
    console.log(products);
  });
```

There are two separate moments:

1. The request produces a response.
2. The response body is read as JSON.

That distinction matters.

## 5. Predict the log

Given:

```js
fetch("/api/products")
  .then((response) => response.json())
  .then((products) => {
    console.log(products.length);
  });
```

Suppose the response body contains:

```json
[
  { "name": "Notebook" },
  { "name": "Keyboard" }
]
```

What eventually gets logged?

A. `0`
B. `1`
C. `2`
D. The entire request object

**Review key:** C

**Feedback after submit:** The JSON body becomes an array of two objects, so `.length` is `2`.

## 6. What does the first callback receive?

Consider:

```js
fetch("/api/products")
  .then((response) => {
    // ...
  });
```

What is `response`?

A. The final JavaScript array from the JSON body.
B. A Response object describing the HTTP response.
C. A DOM element.
D. A CSS rule.

**Review key:** B

**Feedback after submit:** The response object gives you access to information about the HTTP response and methods for reading its body.

## 7. Status and fetch

A common beginner mistake is assuming that a fulfilled fetch Promise always means the request was successful in the HTTP sense.

Instead, inspect the response.

For example:

```js
fetch("/api/products")
  .then((response) => {
    console.log(response.ok);
    return response.json();
  });
```

`response.ok` is `true` for a successful 2xx response.

The important habit is:

**Do not stop at “the request finished.” Ask “what did the response say?”**

## 8. Guided code lab

Start with:

```js
fetch("/api/message")
  .then((response) => response.json())
  .then((data) => {
    console.log(data.message);
  });
```

Assume the response body is:

```json
{
  "message": "Welcome to Forge"
}
```

Your task:

1. Predict what prints.
2. Change the code so it prints the entire object.
3. Change it again so it prints only the string.

**Review answers:**

1. `"Welcome to Forge"`
2. `console.log(data)`
3. `console.log(data.message)`

**Hint 1:** First decide what `data` becomes after `response.json()`.
**Hint 2:** It becomes the JavaScript value represented by the JSON body.
**Hint 3:** The whole object is `data`; the string is `data.message`.

## 9. Checkpoint

Why are these two lines different?

```js
const result = fetch("/api/products");
```

and

```js
const products = await response.json();
```

A. The first represents the future HTTP response; the second represents parsed JSON data after the response body is read.
B. They are exactly the same thing.
C. The second sends the request and the first reads the JSON.
D. The first creates HTML.

**Review key:** A

**Feedback after submit:** They represent different stages of the operation.

## 10. Forge takeaway

**Mental model:** `fetch()` starts a request and gives you a Promise. A fulfilled fetch gives you a Response. Reading `response.json()` gives you the parsed data.

**Senior habit:** Keep the stages separate in your head: **request → response → body → data**.

### Lesson completion

Complete the checkpoint and explain the difference between a Response object and the parsed JSON data.

---

# 2.4.5 — Promises: The Result Arrives Later

**Estimated time:** 15 minutes  
**Learner goal:** Understand asynchronous timing, Promise fulfillment/rejection at a practical level, and the equivalent roles of `.then()` and `async`/`await`.

## 1. Time changes the program

In ordinary code, the next line usually runs after the previous line.

Network work is different.

The browser may need to wait for another system.

That is why JavaScript uses a **Promise** to represent a value that is not ready yet.

A Promise can be understood as:

> “I will eventually give you a result, or tell you that this operation did not succeed.”

## 2. Prediction before the reveal

What happens first?

```js
console.log("A");

fetch("/api/message")
  .then(() => {
    console.log("B");
  });

console.log("C");
```

A. `A`, then `B`, then `C`
B. `A`, then `C`, then eventually `B`
C. `B`, then `A`, then `C`
D. Only `B`

**Review key:** B

**Feedback after submit:** The fetch work is asynchronous. The code continues to the next synchronous statement before the callback runs later.

## 3. Why this matters

Imagine a user clicks “Load profile.”

The request might take a little time.

If the program behaved as though the result already existed, it would make impossible assumptions.

Instead, the code needs a way to say:

> “When the data arrives, continue from here.”

`.then(...)` expresses that continuation.

## 4. The same idea with async and await

You can write:

```js
async function loadProfile() {
  const response = await fetch("/api/profile");
  const profile = await response.json();
  console.log(profile.name);
}
```

`await` does not mean “freeze the entire browser.”

It means:

> “Pause this async function until this Promise produces its result, then continue.”

The rest of the program can continue doing other work.

## 5. Prediction

What does `await` change here?

```js
async function loadData() {
  const response = await fetch("/api/data");
  console.log("after fetch");
}
```

A. It makes the network instant.
B. It lets this function continue at the correct point when the Promise resolves.
C. It converts JSON into HTML automatically.
D. It prevents all other JavaScript from running.

**Review key:** B

**Feedback after submit:** `await` makes asynchronous code easier to read by keeping the sequence inside the async function.

## 6. The order of two waits

Consider:

```js
async function load() {
  const first = await getFirst();
  const second = await getSecond();
  console.log(first, second);
}
```

What is guaranteed about the code inside this function?

A. `getSecond()` is called only after `getFirst()` has produced its result.
B. Both are guaranteed to finish at exactly the same time.
C. `getSecond()` always runs before `getFirst()`.
D. Neither function can return a Promise.

**Review key:** A

**Feedback after submit:** This code expresses a sequence: wait for the first result, then call the second operation.

## 7. Promise failure

A Promise can also reject.

For practical reasoning, think of two outcomes:

**fulfilled → a result is available**

**rejected → the operation failed**

That means data-loading code needs a failure path.

## 8. Guided conversion

Convert this:

```js
fetch("/api/message")
  .then((response) => response.json())
  .then((data) => {
    console.log(data.message);
  });
```

into an `async` function.

**One valid answer:**

```js
async function loadMessage() {
  const response = await fetch("/api/message");
  const data = await response.json();
  console.log(data.message);
}
```

The important change is style, not the underlying sequence.

## 9. Checkpoint

Which statement is most accurate?

A. Promises make waiting disappear.
B. Promises give JavaScript a way to represent a result that will be available later.
C. `async` means a function can never fail.
D. `await` blocks the entire browser.

**Review key:** B

**Feedback after submit:** Async programming is about modeling work that completes later without pretending the result is already here.

## 10. Forge takeaway

**Mental model:** Asynchronous code is still a sequence. The difference is that some steps finish later.

**Senior habit:** When debugging async code, draw the timeline. Ask what has definitely happened, what is still waiting, and what can happen in between.

### Lesson completion

Complete the checkpoint and explain why `"C"` can appear before `"B"` in the earlier example.

---

# 2.4.6 — Loading, Success, Failure

**Estimated time:** 15 minutes  
**Learner goal:** Model data fetching as a state transition, distinguish transport success from application success, and recognize browser security boundaries that can affect requests.

## 1. A request is not a single screen

Imagine a button labeled “Load products.”

What should the interface show while the request is still running?

A blank page?

A frozen button?

Nothing?

A better model is to represent the state explicitly.

For a simple feature, start with three states:

**Loading**

**Success**

**Failure**

The interface changes because the underlying request changes state.

## 2. First prediction

The user clicks “Load products.”

Immediately after the request starts, which state is the most useful?

A. Loading
B. Success
C. Failure
D. Finished forever

**Review key:** A

**Feedback after submit:** You do not have the data yet, so the interface should represent that the work is in progress.

## 3. Success does not mean “the UI is correct”

Suppose the server responds with:

```text
200
```

but the JSON body is:

```json
{
  "products": []
}
```

What can you safely say?

A. The HTTP request succeeded, and the returned data contains an empty product list.
B. The application definitely has products to show.
C. The browser automatically fixed the empty list.
D. The request failed.

**Review key:** A

**Feedback after submit:** Separate transport status from the actual content of the response.

## 4. Failure state

Suppose the request fails.

A good interface should not simply leave the learner staring at a spinner forever.

It should communicate enough information to answer:

- What happened?
- Can I try again?
- Is there useful recovery?

For example:

```text
Unable to load products.
Try again.
```

The exact copy can change.

The engineering requirement does not:

**The failure state must be deliberate.**

## 5. A simple state model

You can model the feature as:

```text
idle
  ↓
loading
  ↓
success

or

idle
  ↓
loading
  ↓
failure
```

The state tells the interface which situation it is currently representing.

## 6. Browser security can affect requests

A browser does not treat every origin as automatically interchangeable.

An **origin** is identified by a combination of:

- scheme
- host
- port

For example:

```text
https://app.example.com
```

and

```text
https://api.example.com
```

have different hosts, so they are different origins.

Browsers enforce rules around cross-origin requests.

A server can explicitly allow a browser-based request from another origin using **CORS**, the Cross-Origin Resource Sharing mechanism.

The important beginner rule is:

> A request can exist at the network level while the browser still refuses to expose the response to your page because the server did not allow the cross-origin browser request.

You do not need to memorize every CORS header yet.

## 7. Predict the symptom

A page tries to request data from another origin.

The server does not allow the browser's cross-origin request.

What might the frontend developer observe?

A. The JavaScript can simply read the response anyway because all servers trust all browsers.
B. The browser may block access to the response and report a cross-origin policy error.
C. The HTML automatically turns into JSON.
D. The request becomes a CSS rule.

**Review key:** B

**Feedback after submit:** Browser security policies can prevent page code from reading a cross-origin response unless the server permits it.

## 8. State-driven example

Suppose you use:

```js
let state = "loading";
```

Then later:

```js
state = "success";
```

Your rendering code can choose what to show:

```js
if (state === "loading") {
  show("Loading...");
}

if (state === "success") {
  show("Products loaded.");
}
```

The exact rendering function is not the lesson.

The important model is:

**request outcome → state → interface**

## 9. Investigation

A user says:

> “The page spins forever.”

You inspect the code and find that the program sets:

```js
state = "loading";
```

but never sets either `success` or `failure`.

What is the first thing you would investigate?

**Answer:** The missing state transition after the asynchronous work finishes.

**Hint 1:** Which states can follow loading?
**Hint 2:** Look for the path after the Promise settles.
**Hint 3:** Find where success or failure is supposed to be recorded.

## 10. Checkpoint

Which is the strongest explanation of a robust data-loading feature?

A. “It calls `fetch()`.”
B. “It requests data, represents loading, handles success, handles failure, and shows the appropriate state.”
C. “It assumes the server always answers.”
D. “It hides the spinner and hopes the data arrives.”

**Review key:** B

**Feedback after submit:** Reliable features model the whole state transition, not just the request call.

## 11. Forge takeaway

**Mental model:** A network feature is a state machine: start work, wait, handle success or failure, and render the right state.

**Senior habit:** When a request feature is broken, inspect the state transitions, not just the request line.

### Lesson completion

Complete the checkpoint and describe one loading path and one failure path in your own words.

---

# 2.4.7 — Forge Mission: Build With Remote Data

**Estimated time:** 20 minutes  
**Learner goal:** Independently trace, build, and repair a small data-driven browser feature using an API contract, HTTP response, JSON data, `fetch`, asynchronous flow, and explicit UI states.

## 1. The scenario

You are building a small “Daily Tasks” panel.

The API contract says:

```text
GET /api/tasks
```

A successful response returns:

```json
[
  { "id": 1, "title": "Read the brief", "done": false },
  { "id": 2, "title": "Fix the bug", "done": true },
  { "id": 3, "title": "Ship the lesson", "done": false }
]
```

The interface must support three states:

```text
Loading
Success
Failure
```

## 2. Predict before you code

Before seeing any implementation, answer:

### Question A

What is the expected data type after the JSON body is parsed?

A. An object containing one task
B. An array of task objects
C. A string
D. A number

**Review key:** B

### Question B

Which property identifies the task's title?

A. `id`
B. `done`
C. `title`
D. `task`

**Review key:** C

### Question C

What should the UI say immediately after the request begins?

A. “Tasks loaded.”
B. “Loading tasks…”
C. “No tasks exist.”
D. Nothing can be shown.

**Review key:** B

## 3. Read the starting code

```js
async function loadTasks() {
  const response = await fetch("/api/tasks");
  const tasks = await response.json();

  console.log(tasks);
}
```

What does this code already accomplish?

A. It requests the tasks and reads the JSON body.
B. It renders the tasks.
C. It handles every failure state.
D. It guarantees the response is successful.

**Review key:** A

**Feedback:** It has the data-acquisition path, but not the full UI behavior yet.

## 4. Add the success path

Write code that turns the returned task array into a simple list of titles.

One valid approach:

```js
function renderTasks(tasks) {
  return tasks
    .map((task) => task.title)
    .join("\n");
}
```

Then:

```js
async function loadTasks() {
  const response = await fetch("/api/tasks");
  const tasks = await response.json();

  console.log(renderTasks(tasks));
}
```

**What should appear?**

```text
Read the brief
Fix the bug
Ship the lesson
```

## 5. Add loading

Before calling `fetch()`:

```js
setState("loading");
```

After the data is successfully read:

```js
setState("success", tasks);
```

The exact UI function is not important for this checkpoint.

The state transition is.

## 6. Add failure

Wrap the asynchronous operation:

```js
async function loadTasks() {
  setState("loading");

  try {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const tasks = await response.json();
    setState("success", tasks);
  } catch (error) {
    setState("failure", error);
  }
}
```

Now the feature has three meaningful paths:

```text
start
  ↓
loading
  ↓
success

or

start
  ↓
loading
  ↓
failure
```

## 7. Debug the broken version

You are given:

```js
async function loadTasks() {
  setState("loading");

  try {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const tasks = await response.json();
    setState("success", tasks);
  } catch (error) {
    console.log(error);
  }
}
```

Users report:

> “When the request fails, the spinner never ends.”

Where is the problem?

A. The request can never fail.
B. The `catch` block records the error but never changes the UI out of the loading state.
C. JSON arrays cannot be returned.
D. `await` deletes the loading state automatically.

**Review key:** B

**Feedback after submit:** The failure path exists, but it does not transition the interface into the failure state.

## 8. Repair it

Modify the `catch` block so the interface leaves loading.

**One valid repair:**

```js
catch (error) {
  setState("failure", error);
}
```

Now the feature has an actual failure state.

## 9. Transfer challenge

The API changes.

Instead of returning:

```json
[
  { "id": 1, "title": "Read the brief", "done": false }
]
```

it now returns:

```json
{
  "items": [
    { "id": 1, "title": "Read the brief", "done": false }
  ]
}
```

Your code still does:

```js
const tasks = await response.json();
console.log(tasks.map((task) => task.title));
```

What breaks?

A. The HTTP request itself must fail.
B. `tasks` is now an object, not the array the code expected.
C. `title` becomes invalid JSON.
D. The browser can no longer run JavaScript.

**Review key:** B

**Repair:**

```js
const data = await response.json();
const tasks = data.items;
```

The deeper lesson is the same one from Lesson 2.4.1:

**The consumer and provider must agree on the data contract.**

## 10. Final engineering explanation

Explain the complete feature in your own words.

A strong answer should include all of these:

- The frontend uses the API contract to know what to request.
- It sends an HTTP request.
- The response has a status and a body.
- The body is parsed as JSON.
- The result is available asynchronously.
- The feature represents loading, success, and failure.
- A changed response shape can break consumer code even when the HTTP request itself succeeds.
- Browser security rules can also affect whether page code can read a cross-origin response.

**Reference answer:**

> “The feature uses the API contract to request `/api/tasks`. The browser sends an HTTP request and receives a response with a status and a body. The body is parsed from JSON into JavaScript data. Because the request completes later, the code handles the result asynchronously. The interface starts in a loading state, then moves to success or failure depending on the outcome. Even a successful HTTP response can still cause a bug if its data shape changes from what the frontend expects. When the API is on another origin, browser cross-origin rules can also affect whether the page is allowed to read the response.”

## 11. Module mastery gate

You are ready to leave Module 2.4 when you can do all four without copying the previous answers:

**1. Read:** Explain a simple HTTP request and response.

**2. Trace:** Follow `fetch` from request to Response to parsed JSON.

**3. Model:** Represent loading, success, and failure states.

**4. Diagnose:** Identify whether a failure comes from the request, the response status, the data shape, asynchronous state handling, or the browser's cross-origin policy.

## 12. Forge takeaway

**Web data is not magic.**

It is a conversation with a contract.

**request → response → data → state → interface**

Once you can trace that chain, data-driven frontend features stop looking mysterious.

**Senior habit:** When a data feature breaks, do not ask only “Did the request run?”

Ask:

> “What was requested, what came back, what shape did it have, when did it arrive, and what state did the UI move into?”

### Lesson completion

Complete the mastery gate and write your own 5–7 sentence explanation of the complete request → response → data → state → interface chain.