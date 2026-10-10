# Forge Curriculum v2
## Module 1.1 — HTML: Structure and Meaning
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing lesson manuscript for review. It is written as the experience a learner would encounter. Review keys and hints are included so the manuscript can be audited before canonical JSON generation.

### Module outcome
By the end of this module, the learner can build a valid, meaningfully structured HTML page, choose elements based on content purpose, use basic attributes, and organize page regions, lists, links, images, and forms without relying on visual styling.

### Module lessons
1. **HTML Is Structure** — 10 minutes
2. **Elements Have Meaning** — 12 minutes
3. **Build the Document Skeleton** — 13 minutes
4. **Build Content With Hierarchy** — 13 minutes
5. **Connect Pages and Media** — 14 minutes
6. **Group Content With Semantic Structure** — 15 minutes
7. **Model User Input** — 16 minutes
8. **Forge Mission: Build the Page Structure** — 20 minutes

---
# 1.1.1 — HTML Is Structure
**Estimated time:** 10 minutes  
**Learner goal:** Understand that HTML gives a page structure by describing pieces of content and what those pieces are.

## 1. Start here

You already know that the browser turns information into a page the user can see.

Now we need to give the browser a more precise description of that page.

HTML is the language we use to describe the **structure and meaning of web content**.

Think of a plain note:

```text
Forge
Learn frontend engineering.
Start learning
```

A human can look at that and guess what is important. HTML gives the browser explicit structure instead of making the browser guess.

## 2. First prediction

Which version gives the browser a clearer description of the content?

**A.**
```text
Forge
Learn frontend engineering.
Start learning
```

**B.**
```html
<h1>Forge</h1>
<p>Learn frontend engineering.</p>
<a href="/start">Start learning</a>
```

**C.**
```text
FORGE
----------------
Learn frontend engineering.
----------------
START
```

**Review key:** B

**Feedback:** HTML gives the browser explicit structure. The heading is identified as a heading, the sentence as a paragraph, and the destination as a link.

## 3. What is an element?

An **element** is one structured piece of HTML.

For example:

```html
<p>Learn frontend engineering.</p>
```

Here the element says: “This piece of content is a paragraph.”

The parts are:

- `<p>` — the opening tag
- `Learn frontend engineering.` — the content
- `</p>` — the closing tag

Put together, they form a paragraph element.

## 4. Change one element

Start with:

```html
<p>Forge</p>
```

Change only the element so the browser is told that “Forge” is the page's main heading.

**A.** `<h1>Forge</h1>`

**B.** `<title>Forge</title>`

**C.** `<text>Forge</text>`

**D.** `<heading>Forge</heading>`

**Review key:** A

**Feedback:** `<h1>` is the HTML element used for the top-level heading of a page.

## 5. Tiny HTML lab

Create this exact page fragment:

```html
<h1>Forge</h1>
<p>Build frontend engineering skill.</p>
```

Then change only the paragraph text to:

```text
Learn by building.
```

**What to notice:** You changed the content without changing the structure. The browser still knows one part is a heading and one part is a paragraph.

## 6. Structure is not decoration

HTML is not mainly about making text “look right.” Its first job is to describe what the content **is**.

A page can contain a heading, a paragraph, a list, a link, an image, or a form. HTML gives each piece a meaningful place in the document.

## 7. Checkpoint

A learner says: “HTML is just a way to make text appear on a page.”

Which answer corrects the model?

**A.** HTML describes the structure and meaning of content; appearance is a separate concern.

**B.** HTML only works for headings.

**C.** HTML is the browser itself.

**D.** HTML is a database language.

**Review key:** A

**Feedback:** A useful HTML model starts with structure and meaning, not decoration.

## 8. Forge takeaway

**Mental model:** HTML is the page’s structural language.

**Senior habit:** Before asking how something should look, ask what that thing actually is.

### Lesson completion
Complete the lesson activities and demonstrate the target skill without relying on unseen concepts from later modules.

---
# 1.1.2 — Elements Have Meaning
**Estimated time:** 12 minutes  
**Learner goal:** Understand common HTML elements and choose elements based on what the content means.

## 1. The element should match the job

Suppose you have these pieces of content:

- “Forge Academy” is the page heading.
- “Learn frontend engineering.” is a paragraph.
- “View the curriculum” takes the user somewhere else.

HTML gives us different elements for those different jobs.

```html
<h1>Forge Academy</h1>
<p>Learn frontend engineering.</p>
<a href="/curriculum">View the curriculum</a>
```

The names are not random. They communicate the role of each piece.

## 2. Match the meaning

Match each content job to the element.

1. A paragraph of text
2. A main heading
3. A link to another location

**A.** `<a>`
**B.** `<p>`
**C.** `<h1>`

**Review key:** 1 → B, 2 → C, 3 → A

**Feedback:** Choose the element that describes the content’s job, not the one that merely feels visually convenient.

## 3. A heading is not just big text

Look at these two choices:

```html
<p>Frontend Engineering</p>
```

and

```html
<h1>Frontend Engineering</h1>
```

They contain the same words. They do not communicate the same meaning.

The first says “this is a paragraph.” The second says “this is the page’s top-level heading.”

## 4. Prediction

Which is the better choice for the title of a page about HTML?

**A.**
```html
<p>HTML Basics</p>
```

**B.**
```html
<h1>HTML Basics</h1>
```

**C.**
```html
<span>HTML Basics</span>
```

**D.**
```html
<div>HTML Basics</div>
```

**Review key:** B

**Feedback:** Use the element whose meaning matches the content. A page heading is a heading.

## 5. Use the content model

You need to add this sentence:

```text
HTML gives the page structure.
```

Which is the most direct representation?

```html
<p>HTML gives the page structure.</p>
```

Now add a heading above it:

```html
<h1>How HTML Works</h1>
<p>HTML gives the page structure.</p>
```

Notice the relationship: the heading introduces the section; the paragraph explains it.

## 6. A dangerous shortcut

A developer chooses elements only because they “look close enough.”

Why is that a weak habit?

**A.** The browser will refuse to load the page.
**B.** The HTML stops communicating what the content actually is.
**C.** Every page must use one element only.
**D.** Paragraphs cannot contain words.

**Review key:** B

**Feedback:** Good HTML is meaningful structure. Visual similarity is not the same thing as semantic meaning.

## 7. Checkpoint

You are given three requirements:

- “This is the page’s main heading.”
- “This is explanatory text.”
- “This takes the user to another location.”

Which set fits those jobs?

**A.** `<h1>`, `<p>`, `<a>`
**B.** `<p>`, `<h1>`, `<a>`
**C.** `<a>`, `<p>`, `<h1>`
**D.** `<div>`, `<div>`, `<div>`

**Review key:** A

**Feedback:** The correct element is the one whose meaning matches the requirement.

## 8. Forge takeaway

**Mental model:** HTML elements are vocabulary. Choose a word that tells the truth about the content.

**Senior habit:** When reviewing HTML, ask “What does this content mean?” before asking “How does it look?”

### Lesson completion
Complete the lesson activities and demonstrate the target skill without relying on unseen concepts from later modules.

---
# 1.1.3 — Build the Document Skeleton
**Estimated time:** 13 minutes  
**Learner goal:** Recognize the basic HTML document structure and place page content in the correct part of the document.

## 1. The page needs a container

A full HTML document has a basic outer structure.

```html
<!doctype html>
<html>
  <head>
    <title>Forge</title>
  </head>
  <body>
    <h1>Forge</h1>
    <p>Build frontend engineering skill.</p>
  </body>
</html>
```

For now, learn the jobs of these pieces:

- `<!doctype html>` tells the browser to use the modern HTML document mode.
- `<html>` wraps the document.
- `<head>` contains document information that is not the main page content.
- `<title>` gives the document a title.
- `<body>` contains the content the page presents.

## 2. Put it in order

Which order is correct?

**A.** `<body>` outside `<html>`

**B.** `<html>` contains `<head>` and `<body>`

**C.** `<head>` contains the visible page content and `<body>` contains `<html>`

**D.** `<title>` wraps the whole document

**Review key:** B

**Feedback:** The document is nested: `<html>` is the outer element, with `<head>` and `<body>` inside it.

## 3. Where does this go?

You need to add the visible heading “Forge Academy.” Where does it belong?

**A.** Inside `<head>`

**B.** Inside `<body>`

**C.** Inside `<!doctype html>`

**D.** Outside `<html>`

**Review key:** B

**Feedback:** The page content the user sees belongs in the document body.

## 4. Build it yourself

Create this document:

```html
<!doctype html>
<html>
  <head>
    <title>Forge</title>
  </head>
  <body>
    <h1>Forge Academy</h1>
    <p>Build frontend engineering skill.</p>
  </body>
</html>
```

**Task:** Change the title to “HTML Basics” and the heading to “Learn HTML”.

Expected result:

```html
<title>HTML Basics</title>
...
<h1>Learn HTML</h1>
```

## 5. What belongs where?

Which item belongs in the `<head>` in this lesson’s simple model?

**A.** The main page heading
**B.** A paragraph of page content
**C.** The document title
**D.** A list of lessons

**Review key:** C

**Feedback:** The title is document information. The visible page content belongs in the body.

## 6. Spot the structural error

A learner writes:

```html
<html>
  <body>
    <h1>Forge</h1>
  </body>
  <head>
    <title>Forge</title>
  </head>
</html>
```

What is the problem in the model being practiced here?

**A.** The `<head>` and `<body>` are supposed to be sibling parts of the HTML document, with the head placed before the body.
**B.** The `<h1>` must go in `<head>`.
**C.** The `<title>` must be inside `<body>`.
**D.** The `<html>` element must be removed.

**Review key:** A

**Feedback:** The basic document skeleton is `<html>` containing `<head>` followed by `<body>`.

## 7. Checkpoint

Complete the sentence:

“The `<head>` describes document information; the `<body>` contains ________.”

**A.** the main page content
**B.** the entire browser
**C.** only the page title
**D.** the page title

**Review key:** A

**Feedback:** For this lesson, keep the model simple: head = document information, body = page content.

## 8. Forge takeaway

**Mental model:** A full HTML page has a predictable outer structure.

**Senior habit:** When a document feels messy, first inspect its outer structure. Good nesting makes the rest easier to reason about.

### Lesson completion
Complete the lesson activities and demonstrate the target skill without relying on unseen concepts from later modules.

---
# 1.1.4 — Build Content With Hierarchy
**Estimated time:** 13 minutes  
**Learner goal:** Use headings, paragraphs, and lists to express the hierarchy and grouping of page content.

## 1. A page needs hierarchy

A page is rarely one giant paragraph. Content has relationships.

A lesson page might look like:

```html
<h1>HTML Basics</h1>
<p>Learn how web documents are structured.</p>

<h2>Elements</h2>
<p>Elements describe pieces of content.</p>

<h2>Practice</h2>
<p>Build a small document.</p>
```

The headings create a visible and structural hierarchy.

## 2. Main heading or section heading?

Which element fits “Practice” when it is a section inside the page?

**A.** `<h1>Practice</h1>`
**B.** `<h2>Practice</h2>`
**C.** `<p>Practice</p>`
**D.** `<a>Practice</a>`

**Review key:** B

**Feedback:** `<h1>` names the page’s main heading. `<h2>` introduces a major section inside it.

## 3. Add a list

You have these three lessons:

- HTML
- Page presentation
- Page behavior

When the order does not matter, which element pair represents an unordered list?

**A.** `<ul>` with `<li>` children
**B.** `<ol>` with `<li>` children
**C.** `<p>` with `<p>` children
**D.** `<a>` with `<a>` children

**Review key:** A

**Feedback:** Use `<ul>` for an unordered list and `<li>` for each list item.

## 4. Try both list types

Unordered list:

```html
<ul>
  <li>HTML</li>
  <li>Page structure</li>
  <li>Page presentation</li>
</ul>
```

Ordered list:

```html
<ol>
  <li>Open the page</li>
  <li>Read the lesson</li>
  <li>Complete the exercise</li>
</ol>
```

The content is similar, but the meaning is different: one is a set, the other is a sequence.

## 5. Change the requirement

The product manager changes the requirement from “a list of topics” to “the steps to finish setup.”

What should change?

**A.** `<ul>` becomes `<ol>` because the order now matters.
**B.** `<li>` becomes `<p>`.
**C.** Everything becomes `<h1>`.
**D.** The browser should invent the order.

**Review key:** A

**Feedback:** The element follows the meaning. When sequence matters, an ordered list communicates that relationship.

## 6. Build a small outline

Create:

```html
<h1>Forge Academy</h1>
<p>Build practical frontend engineering skill.</p>

<h2>What you will learn</h2>
<ul>
  <li>HTML structure</li>
  <li>Page presentation</li>
  <li>Page behavior</li>
</ul>
```

**Task:** Add a new section called “How to start” with three ordered steps:

1. Open the lesson.
2. Predict the result.
3. Build the solution.

## 7. Checkpoint

Which structure best represents this requirement?

“First choose a lesson, then complete the practice, then explain your answer.”

**A.** An ordered list with three list items
**B.** An unordered list with three list items
**C.** Three `<h1>` elements
**D.** Three paragraphs with no relationship

**Review key:** A

**Feedback:** The requirement expresses a sequence, so the document should express a sequence too.

## 8. Forge takeaway

**Mental model:** HTML can express hierarchy, grouping, and order.

**Senior habit:** When content changes, the structure should tell the truth about the relationship between the pieces.

### Lesson completion
Complete the lesson activities and demonstrate the target skill without relying on unseen concepts from later modules.

---
# 1.1.5 — Connect Pages and Media
**Estimated time:** 14 minutes  
**Learner goal:** Create links and images with the required attributes and predict what the browser needs to use each resource.

## 1. A link is a destination

A link tells the browser that a piece of content points to another location.

```html
<a href="/curriculum">View the curriculum</a>
```

The text is what the user reads. The `href` attribute tells the browser where the link points.

## 2. What does the attribute do?

In this element:

```html
<a href="/curriculum">View the curriculum</a>
```

What does `href` provide?

**A.** The link destination
**B.** The page heading
**C.** The image description
**D.** The paragraph text

**Review key:** A

**Feedback:** `href` gives the browser the destination associated with the link.

## 3. Change the destination

Start with:

```html
<a href="/lessons">Read the lessons</a>
```

Change it so the link points to `/practice` while keeping the visible text unchanged.

**Answer:**

```html
<a href="/practice">Read the lessons</a>
```

**Notice:** An attribute can change how an element connects to the rest of the page or site without changing its visible words.

## 4. An image is also a resource

An image element tells the browser about an image resource.

```html
<img src="forge.png" alt="Forge Academy logo">
```

For this lesson’s model:

- `src` identifies the image resource.
- `alt` provides a text alternative describing the image’s purpose or content.

## 5. Predict the broken image

A developer writes:

```html
<img alt="Forge Academy logo">
```

What important information is missing for the browser to load the image resource?

**A.** `src`
**B.** `href`
**C.** `title`
**D.** `class`

**Review key:** A

**Feedback:** The browser needs the image source. `src` tells it which image resource to use.

## 6. Write an image element

Create an image for a Forge logo:

- file: `forge-logo.png`
- description: `Forge Academy logo`

**Answer:**

```html
<img src="forge-logo.png" alt="Forge Academy logo">
```

For now, focus on getting the source and text alternative right.

## 7. Connect the ideas

Which statement is most accurate?

**A.** A link uses `href` to identify its destination; an image uses `src` to identify its resource.
**B.** Both always use `href`.
**C.** Both always use `src`.
**D.** Neither needs an attribute.

**Review key:** A

**Feedback:** Different elements need different attributes because they describe different jobs.

## 8. Checkpoint

You need:

1. A link to `/practice` with the words “Start practice”
2. An image from `forge.png` described as “Forge mark”

Which answer is correct?

**A.**
```html
<a href="/practice">Start practice</a>
<img src="forge.png" alt="Forge mark">
```

**B.**
```html
<a src="/practice">Start practice</a>
<img href="forge.png">Forge mark</img>
```

**C.**
```html
<a href="Start practice">/practice</a>
<img src="Forge mark" alt="forge.png">
```

**D.**
```html
<a>/practice</a>
<img>forge.png</img>
```

**Review key:** A

**Feedback:** The attributes match the element’s job: `href` for the link destination, `src` for the image resource, and `alt` for the text alternative.

## 9. Forge takeaway

**Mental model:** Elements can use attributes to carry extra information needed for their job.

**Senior habit:** When an element does not behave as expected, inspect its required attributes before rewriting everything around it.

### Lesson completion
Complete the lesson activities and demonstrate the target skill without relying on unseen concepts from later modules.

---
# 1.1.6 — Group Content With Semantic Structure
**Estimated time:** 15 minutes  
**Learner goal:** Use meaningful structural elements to group page regions and distinguish them from generic containers.

## 1. The page has regions

A real page often has recognizable regions:

- the top area of the page
- navigation links
- the main content
- supporting content
- the bottom area

HTML gives us meaningful elements for many of these jobs.

## 2. Meet the semantic containers

For this lesson, learn these elements:

- `<header>` — introductory content for a page or section
- `<nav>` — a region containing navigation links
- `<main>` — the primary content of the page
- `<section>` — a grouped section of related content
- `<footer>` — closing or supporting information for a page or section

These elements do not exist just to make the page look different. They describe what each region is.

## 3. Pick the region

Where does a group of primary navigation links belong in this model?

**A.** `<nav>`
**B.** `<main>`
**C.** `<footer>`
**D.** `<section>`

**Review key:** A

**Feedback:** `<nav>` identifies navigation content.

## 4. Build the outer structure

Create this structure:

```html
<header>
  <h1>Forge Academy</h1>
</header>

<nav>
  <a href="/curriculum">Curriculum</a>
  <a href="/practice">Practice</a>
</nav>

<main>
  <h2>Welcome</h2>
  <p>Build frontend engineering skill.</p>
</main>

<footer>
  <p>Forge Academy</p>
</footer>
```

You are not styling anything here. You are telling the browser what each region is.

## 5. Why not use div for everything?

A `<div>` is a generic container. It can group content, but it does not tell the reader what the group means.

Compare:

```html
<div>
  <a href="/curriculum">Curriculum</a>
  <a href="/practice">Practice</a>
</div>
```

with:

```html
<nav>
  <a href="/curriculum">Curriculum</a>
  <a href="/practice">Practice</a>
</nav>
```

The second version communicates more information about the group.

## 6. Choose meaning

You have a page region containing the primary content of the page. Which element should you start with?

**A.** `<main>`
**B.** `<footer>`
**C.** `<nav>`
**D.** `<header>`

**Review key:** A

**Feedback:** `<main>` identifies the page’s primary content.

## 7. Section or main?

A page has one main content area. Inside it are two related groups: “Lessons” and “Projects.”

Which structure is the clearest starting model?

**A.** `<main>` containing two `<section>` elements
**B.** `<section>` containing two `<main>` elements
**C.** Two `<main>` elements with no surrounding relationship
**D.** A `<footer>` containing both groups

**Review key:** A

**Feedback:** The page has one primary content area, and that area contains related sections.

## 8. Checkpoint

A teammate says: “Semantic HTML is extra paperwork. A pile of generic containers can hold the same text.”

What is the strongest response?

**A.** Meaningful elements make the document’s structure clearer to humans and tools.
**B.** Generic containers cannot hold text.
**C.** Semantic elements are only for colors.
**D.** Every page must use exactly five semantic elements.

**Review key:** A

**Feedback:** Semantic structure communicates relationships and purpose instead of hiding everything behind generic containers.

## 9. Forge takeaway

**Mental model:** A page is made of meaningful regions, not just generic containers.

**Senior habit:** Prefer an element that communicates the region’s job before reaching for a generic container.

### Lesson completion
Complete the lesson activities and demonstrate the target skill without relying on unseen concepts from later modules.

---
# 1.1.7 — Model User Input
**Estimated time:** 16 minutes  
**Learner goal:** Build a simple form structure and connect labels to form controls.

## 1. Forms describe input

A form is a structured way to describe information a user can enter.

Here is a simple example:

```html
<form>
  <label for="email">Email</label>
  <input id="email" type="email">
  <button type="submit">Continue</button>
</form>
```

For this lesson, focus on the structure:

- `<form>` groups the input experience.
- `<label>` names the field.
- `<input>` represents the field where the user enters information.
- `<button type="submit">` represents the action that submits the form.

## 2. Which element names the field?

In this form:

```html
<label for="email">Email</label>
<input id="email" type="email">
```

Which element contains the visible field name?

**A.** `<label>`
**B.** `<input>`
**C.** `<form>`
**D.** `<button>`

**Review key:** A

**Feedback:** The label gives the field a human-readable name.

## 3. Connect label and input

The label says:

```html
<label for="email">Email</label>
```

What should the input use so those two pieces are connected?

**A.** `id="email"`
**B.** `href="email"`
**C.** `src="email"`
**D.** `name="label"`

**Review key:** A

**Feedback:** The label’s `for` value should match the input’s `id`.

## 4. Build a name field

Create a name field with:

- label text: `Name`
- input id: `name`
- input type: `text`

**Answer:**

```html
<label for="name">Name</label>
<input id="name" type="text">
```

The two pieces are connected because `for="name"` matches `id="name"`.

## 5. Add a submit action

Add a button that submits the form:

```html
<button type="submit">Create account</button>
```

What does `type="submit"` tell the browser about this button inside a form?

**A.** It is the form’s submit action.
**B.** It is an image.
**C.** It is a heading.
**D.** It is another input field.

**Review key:** A

**Feedback:** The attribute gives the button its form-specific role.

## 6. Build the whole form

Create:

```html
<form>
  <label for="name">Name</label>
  <input id="name" type="text">

  <label for="email">Email</label>
  <input id="email" type="email">

  <button type="submit">Create account</button>
</form>
```

**Task:** Add a third field for `City` using the same label/input relationship.

## 7. Predict the broken connection

A learner writes:

```html
<label for="email">Email</label>
<input id="mail" type="email">
```

What is wrong with the relationship?

**A.** `for` and `id` do not match.
**B.** The input must use `href`.
**C.** The label must be an `<h1>`.
**D.** The form cannot contain labels.

**Review key:** A

**Feedback:** The connection depends on the label’s `for` value matching the input’s `id`.

## 8. Checkpoint

Which form is structured correctly for a username field?

**A.**
```html
<label for="username">Username</label>
<input id="username" type="text">
```

**B.**
```html
<label id="username">Username</label>
<input for="username" type="text">
```

**C.**
```html
<label href="username">Username</label>
<input src="username" type="text">
```

**D.**
```html
<label>Username</label>
<button id="username">Username</button>
```

**Review key:** A

**Feedback:** The label and input are connected through matching `for` and `id` values.

## 9. Forge takeaway

**Mental model:** Forms are structured relationships between fields, labels, and actions.

**Senior habit:** When building input, do not just make a box appear. Make the relationship between the field and its name explicit.

### Lesson completion
Complete the lesson activities and demonstrate the target skill without relying on unseen concepts from later modules.

---
# 1.1.8 — Forge Mission: Build the Page Structure
**Estimated time:** 20 minutes  
**Learner goal:** Independently construct a meaningful HTML document using the structures learned throughout the module.

## 1. Mission briefing

You are given a blank HTML document.

Your job is to build the structure for a small Forge course page.

The page must contain:

- a document title: `Forge Academy`
- a page heading: `Frontend Engineering`
- a short introductory paragraph
- a navigation region with links to `Curriculum` and `Practice`
- a main content area
- a section called `What you will learn`
- an unordered list with `HTML structure`, `page presentation`, and `page behavior`
- a section called `Start here`
- an ordered list with three steps
- a contact form with `Name` and `Email` fields
- a submit button labeled `Join the academy`
- a footer containing `Forge Academy`

No visual styling is needed. The mission is about structure and meaning.

## 2. Before you code

Predict the outer shape of the document.

Which structure makes the most sense?

**A.**
```text
html
├── head
└── body
    ├── header
    ├── nav
    ├── main
    └── footer
```

**B.**
```text
html
├── body
└── head
```

**C.**
```text
main
├── html
└── body
```

**D.**
```text
body
├── head
└── html
```

**Review key:** A

**Feedback:** Start with the document skeleton, then organize the visible page into meaningful regions.

## 3. Build the skeleton

Start with:

```html
<!doctype html>
<html>
  <head>
    <title>Forge Academy</title>
  </head>
  <body>
  </body>
</html>
```

Do not add anything else until this outer structure is correct.

## 4. Add the page regions

Inside `<body>`, create:

```html
<header></header>
<nav></nav>
<main></main>
<footer></footer>
```

Then place the page heading in the header and the navigation links in the nav.

## 5. Add meaningful content

Inside `<main>`, create:

```html
<h2>What you will learn</h2>
<ul>
  <li>HTML</li>
  <li>Page structure</li>
  <li>Page presentation</li>
</ul>

<h2>Start here</h2>
<ol>
  <li>Open the lesson.</li>
  <li>Predict the result.</li>
  <li>Build the solution.</li>
</ol>
```

Then add the contact form below those sections.

## 6. Add the form

Your form should contain:

```html
<form>
  <label for="name">Name</label>
  <input id="name" type="text">

  <label for="email">Email</label>
  <input id="email" type="email">

  <button type="submit">Join the academy</button>
</form>
```

Check both label connections before moving on.

## 7. Final verification

Use this checklist:

**Structure**

- [ ] The document starts with `<!doctype html>`.
- [ ] `<html>` contains `<head>` and `<body>`.
- [ ] The title is inside `<head>`.
- [ ] Page content is inside `<body>`.

**Meaning**

- [ ] The page has one main `<h1>`.
- [ ] Navigation links are inside `<nav>`.
- [ ] Primary page content is inside `<main>`.
- [ ] Related content is grouped in `<section>` elements.
- [ ] The footer uses `<footer>`.

**Lists**

- [ ] Topics use `<ul>`.
- [ ] Steps use `<ol>`.
- [ ] Every list item uses `<li>`.

**Form**

- [ ] The name label connects to `id="name"`.
- [ ] The email label connects to `id="email"`.
- [ ] The submit button uses `type="submit"`.

## 8. Debug by structure

Your page loads, but the “Start here” items appear as one block of text instead of three ordered steps.

What should you inspect first?

**A.** Whether the steps were placed inside an `<ol>` with `<li>` elements.
**B.** Whether the footer has the right text.
**C.** Whether the document title is correct.
**D.** Whether the browser was restarted.

**Review key:** A

**Feedback:** The symptom concerns list structure, so inspect the HTML elements that express that relationship.

## 9. Transfer challenge

A different product asks you to structure a “Recipe” page.

It needs:

- a page heading
- an ingredients list where order does not matter
- a numbered sequence of cooking steps
- a navigation area
- a main recipe area
- a footer

Without copying the Forge mission, name the element you would choose for each major piece.

**Strong answer:** `<h1>` for the main heading, `<ul>` and `<li>` for ingredients, `<ol>` and `<li>` for ordered cooking steps, `<nav>` for navigation, `<main>` for primary content, and `<footer>` for closing information.

## 10. Module mastery gate

You have demonstrated the core HTML capability when you can build a small document without being told which element to use for every line.

You should be able to:

1. build the document skeleton,
2. choose elements by meaning,
3. nest content correctly,
4. use attributes for links, images, and form relationships,
5. organize content into meaningful page regions.

## 11. Forge takeaway

**HTML is not a pile of tags. It is a model of the document.**

The strongest HTML tells the truth about the content: what is a heading, what is navigation, what is the main content, what is a list, what is an input, and how those pieces relate.

**Senior habit:** Before adding another element, ask: “What is this content, and what relationship does it have to the surrounding content?”

### Lesson completion
Complete the lesson activities and demonstrate the target skill without relying on unseen concepts from later modules.
