# Forge Curriculum v2
## Module 1.2 — CSS: Make the Structure Visible
### Full Lesson Manuscript

> **Purpose:** Actual learner-facing lesson manuscript for review. It is intentionally not JSON and not an authoring guide. Review keys and hints are marked for internal review and can later be compiled into Forge activities.

### Module outcome
By the end of this module, the learner can style existing HTML deliberately, explain what each CSS rule is doing, predict simple cascade and box-model outcomes, style basic states, and investigate a visual problem without changing unrelated code.

### Module lessons
1. **CSS Is Presentation** — CSS rules and visual responsibility
2. **Selectors Choose the Target** — type, class, and id
3. **Color, Background, and Contrast** — readable visual choices
4. **Text That Reads Like Text** — typography fundamentals
5. **The Box Model** — content, padding, border, margin
6. **Sizing Without Guessing** — px, rem, %
7. **Borders, Radius, and Shadows** — surfaces and edges
8. **The Cascade: When Rules Meet** — conflict resolution
9. **Inheritance and Defaults** — where unexpected styles can come from
10. **States: Hover, Focus, and More** — interaction states
11. **CSS Investigation: Find the Rule** — diagnosis and smallest-fix thinking
12. **Forge Mission: Make the Structure Look Intentional** — independent styling


---
# 1.2.1 — CSS Is Presentation
**Estimated time:** 10 minutes  
**Learner goal:** Understand that CSS changes how existing HTML is presented without changing what the elements mean.


## 1. Start here

You already know how HTML gives a page structure and meaning. CSS gives that structure a visual presentation.

Think of the same HTML wearing different clothes. The person did not change. The presentation did.

For this module, keep one simple model in your head: HTML says what the content is; CSS says how that content should look and feel on the page.


## 2. First prediction

You have this HTML:

```css
<h1>Forge</h1>
<p>Build real skills.</p>
```

Now a stylesheet adds:

```css
h1 {
  color: darkorange;
}
```

What should change?

A. The meaning of the heading changes.

B. The heading is presented with the new text color.

C. The paragraph becomes a heading.

D. The HTML disappears.


**Review key:** B.

**Feedback after submit:** CSS changes presentation. The element is still a heading. Its meaning did not change.


## 3. The shape of a CSS rule

A simple CSS rule is made from a selector and a block of declarations. Each declaration has a property and a value:

```css
selector {
  property: value;
}
```

The selector chooses what the rule can affect. The property names the thing you want to change. The value tells the browser what value to use.

Example:

```css
p {
  color: #555;
}
```

Here, p is the selector, color is the property, and #555 is the value.


## 4. Tiny CSS lab

Start with:

```css
<h1>Forge</h1>
<p>Build real skills.</p>
```

Add a rule that makes the paragraph dark gray.

**Hint:** Hint 1: Choose the paragraph with p. Then choose the color property.

**Hint:** Hint 2: Write p { color: ...; }.

**Hint:** Hint 3: Try p { color: #555; }.

**Review key:** One valid answer: p { color: #555; }


## 5. Change one variable

Replace #555 with blue.

What did you need to change? Only the value of the color property.


## 6. Checkpoint

Which statement is the strongest beginner model?

A. CSS replaces HTML.

B. CSS is mainly for changing presentation of existing page structure.

C. CSS stores page content.

D. CSS determines what the user is allowed to do.


**Review key:** B.

**Feedback after submit:** Keep the responsibilities separate. CSS is about presentation.


## 7. Forge takeaway

Mental model: A CSS rule is an instruction for presentation.

Senior habit: When a page looks wrong, first separate “Is the structure wrong?” from “Is the presentation wrong?”


## Lesson completion

Complete the checkpoint and successfully change one visual property in the editor.


---
# 1.2.2 — Selectors Choose the Target
**Estimated time:** 12 minutes  
**Learner goal:** Use type, class, and id selectors to target the intended elements without accidentally styling unrelated content.


## 1. Start here

A CSS rule is only useful if it reaches the element you intended. The selector is the part that chooses the target.

You will start with three ways to choose elements: type, class, and id.


## 2. Type selector

A type selector chooses elements by their element name.

```css
p {
  color: #555;
}
```

This rule can affect every paragraph.


## 3. Class selector

A class lets you mark a group of elements that share a presentation role.

```css
<p class="muted">Small note.</p>
<p>Important text.</p>
```

The CSS selector for that class starts with a dot:

```css
.muted {
  color: #777;
}
```


## 4. ID selector

An id names one specific element on the page.

```css
<h1 id="page-title">Forge</h1>
```

The CSS selector starts with #:

```css
#page-title {
  color: darkorange;
}
```


## 5. Choose the selector

Which selector should you use when every paragraph on this page should share the same color?

A. p

B. .muted

C. #page-title

D. .


**Review key:** A.

**Feedback after submit:** Use a type selector when the rule should apply to all elements of that type.

Which selector should you use when only elements marked class="muted" should change?

A. p

B. .muted

C. #page-title

D. muted()


**Review key:** B.

**Feedback after submit:** The dot marks a class selector.


## 6. Targeting lab

Use this HTML:

```css
<h1>Forge</h1>
<p class="muted">Read this later.</p>
<p>Read this now.</p>
```

Write CSS so only the muted paragraph becomes gray.

**Hint:** Hint 1: The target has a class.

**Hint:** Hint 2: Class selectors start with a dot.

**Hint:** Hint 3: Use .muted { color: #777; }.

**Review key:** One valid answer: .muted { color: #777; }


## 7. A common mistake

A learner writes muted { color: #777; } and nothing changes.

Why? The selector is missing the symbol that tells CSS this is a class.


## 8. Checkpoint

Match the target to the selector:

1. Every paragraph  2. Every element with class="card"  3. The element with id="hero"

A. p → .card → #hero

B. .p → #card → hero

C. #p → card → .hero

D. paragraph → class(card) → id(hero)


**Review key:** A.

**Feedback after submit:** Type, class, and id selectors use different target descriptions. Choose the narrowest target that matches the requirement.


## 9. Forge takeaway

Senior habit: Before writing a selector, say the target in plain language: “all paragraphs,” “elements with this shared role,” or “this one specific element.”


---
# 1.2.3 — Color, Background, and Contrast
**Estimated time:** 12 minutes  
**Learner goal:** Use color and background properties to create a readable visual hierarchy and recognize when a color change reduces readability.


## 1. Start here

Color is not just decoration. It can separate content, emphasize something important, or make text harder to read.


## 2. Text color

```css
p {
  color: #222;
}
```

The color property changes the text color.


## 3. Background color

```css
.card {
  background-color: #f5f5f5;
}
```

background-color changes the painted area behind the element.


## 4. Predict the result

Given:

```css
.note {
  color: white;
  background-color: white;
}
```

What will probably happen to the text?

A. It becomes easier to read.

B. It becomes hard or impossible to read because the text and background have the same color.

C. The element disappears from the page source.

D. The browser changes the text to black automatically.


**Review key:** B.

**Feedback after submit:** The browser does what you told it. It does not invent a contrasting color for you.


## 5. Fix the contrast

Start with:

```css
.alert {
  color: #fff;
  background-color: #fff;
}
```

Change only one declaration so the message becomes readable.

**Hint:** Hint 1: Keep the white text. Change the background.

**Hint:** Hint 2: Choose a darker background color.

**Hint:** Hint 3: Try background-color: #222;.

**Review key:** One valid answer: change background-color to #222;


## 6. Visual hierarchy

Imagine three messages: a page title, regular body text, and a small note. If every message uses exactly the same color and emphasis, the page gives the eye fewer clues about what matters.

A useful rule: use color with a reason. “Make it orange because orange looks cool” is not a design explanation. “Make the action easy to notice” is.


## 7. Checkpoint

Which is the stronger engineering choice?

A. Use a very light text color on a very light background because subtle is always better.

B. Choose text and background values that remain readable and match the role of the content.

C. Use as many colors as possible so every element is unique.

D. Let the browser pick the colors.


**Review key:** B.

**Feedback after submit:** Readable contrast is part of interface quality, not a finishing touch.


## 8. Forge takeaway

Senior habit: Never judge a color only by whether it looks attractive. Ask what job the color is doing and whether the content remains readable.


---
# 1.2.4 — Text That Reads Like Text
**Estimated time:** 12 minutes  
**Learner goal:** Use core typography properties to control readable text presentation without changing the underlying content or structure.


## 1. Start here

The words on a page are content. CSS controls how those words are presented.

For this lesson, focus on three controls: font-size, font-weight, and line-height.


## 2. Font size

```css
p {
  font-size: 16px;
}
```

font-size changes the size of the text.


## 3. Font weight

```css
strong {
  font-weight: 700;
}
```

font-weight changes how heavy the text appears.


## 4. Line height

```css
p {
  line-height: 1.6;
}
```

line-height changes the vertical space between lines of text.


## 5. Predict

A paragraph is difficult to read because its lines are packed very tightly. Which property is the most direct place to start?

A. line-height

B. background-color

C. border-radius

D. margin-left


**Review key:** A.

**Feedback after submit:** When the problem is the space between lines, line-height is the direct control.


## 6. Typography lab

Start with:

```css
.intro {
  font-size: 14px;
  line-height: 1.2;
}
```

Make the paragraph larger and more comfortable to read. Change the font size to 18px and line-height to 1.6.

**Review key:** One valid answer:

```css
.intro {
  font-size: 18px;
  line-height: 1.6;
}
```


## 7. One property, one job

A useful habit is to change one declaration at a time while investigating a visual problem. If you change five things at once, you lose the ability to tell which change caused the result.


## 8. Checkpoint

Which property would you choose for each requirement?

“Make the heading heavier.” “Give the paragraph more breathing room between lines.” “Make the body text larger.”

A. font-weight → line-height → font-size

B. font-size → font-weight → line-height

C. line-height → color → font-size

D. background-color → line-height → border


**Review key:** A.

**Feedback after submit:** Name the visual symptom first. Then choose the property that directly controls it.


## 9. Forge takeaway

Senior habit: Treat typography as an engineering system. Change the smallest property that directly addresses the readability problem.


---
# 1.2.5 — The Box Model
**Estimated time:** 15 minutes  
**Learner goal:** Understand content, padding, border, and margin as separate parts of an element box and predict how changing each one affects visible space.


## 1. Start here

Every visible element occupies a box.

For this lesson, use four layers from the inside out:

```css
content → padding → border → margin
```

Content is the thing itself. Padding adds space inside the border. Border draws the edge. Margin adds space outside the border.


## 2. See the layers

```css
.card {
  padding: 16px;
  border: 1px solid #ccc;
  margin: 24px;
}
```

The text sits in the content area. Padding gives that text room before the border. The border surrounds the padded area. Margin creates space between this card and neighboring elements.


## 3. Predict

You increase padding from 8px to 24px. What should happen?

A. The space between the content and the border grows.

B. The space outside the element shrinks.

C. The text changes color.

D. The element becomes a different HTML element.


**Review key:** A.

**Feedback after submit:** Padding is inside the border. Increasing it creates more inner space.


## 4. Predict again

You increase margin from 8px to 24px. What should happen?

A. The space between the content and the border grows.

B. The space outside the element grows.

C. The font becomes larger.

D. The border becomes thicker.


**Review key:** B.

**Feedback after submit:** Margin is outside the border. Increasing it creates more outer space.


## 5. Box-model lab

Start with:

```css
.card {
  padding: 8px;
  border: 1px solid #222;
  margin: 8px;
}
```

Make the content breathe more without moving the card farther away from its neighbors. Which declaration should you change?

A. padding

B. border

C. margin

D. color


**Review key:** A.

**Feedback after submit:** The requirement is inner space, so padding is the direct control.


## 6. The classic confusion

Two cards look too close together. A learner increases padding. The text gets farther from each card edge, but the cards are still close to each other.

The learner changed the wrong layer for the original problem. The distance between neighboring elements is outside the box, so margin is the more direct control.


## 7. Checkpoint

Complete the sequence:

“Inside the content but before the border” = ________. “Outside the border” = ________.

A. padding → margin

B. margin → padding

C. border → padding

D. content → border


**Review key:** A.

**Feedback after submit:** Padding is inside. Margin is outside.


## 8. Forge takeaway

Senior habit: When spacing looks wrong, ask which layer is actually responsible before changing values at random.


---
# 1.2.6 — Sizing Without Guessing
**Estimated time:** 12 minutes  
**Learner goal:** Use common CSS length units intentionally and understand the difference between fixed and relative sizing in simple cases.


## 1. Start here

CSS values often need a size. The browser needs a number and a unit when the property expects a length.

Start with three useful units: px, rem, and %. You do not need every unit yet.


## 2. Pixels

```css
button {
  padding: 12px;
}
```

12px is a fixed CSS pixel value.


## 3. Relative values

A rem value relates to the root text size. A percentage relates to the relevant containing context for the property.

```css
.panel {
  width: 80%;
}
p {
  font-size: 1rem;
}
```


## 4. Choose intentionally

You need a border that is exactly 1 CSS pixel thick. Which value is the most direct choice?

A. 1px

B. 1%

C. 1rem

D. 1color


**Review key:** A.

**Feedback after submit:** When you need a fixed one-pixel border, use px.

You want a text size that participates in the document’s root text sizing instead of being a hard-coded pixel number. Which unit is the direct fit from the units you have learned here?

A. rem

B. px

C. %

D. border


**Review key:** A.

**Feedback after submit:** rem is designed for relative text sizing based on the root text size.


## 5. Sizing lab

Create a card with these requirements:

• Border: 1px solid.
• Horizontal size: 80% of its containing width.
• Paragraph text: 1rem.

**Review key:** One valid answer:

```css
.card {
  width: 80%;
  border: 1px solid #ccc;
}
.card p {
  font-size: 1rem;
}
```


## 6. A better question

Instead of asking “Which unit is best?”, ask “What relationship do I want this value to have?” Fixed amount? Use a fixed unit. Relationship to text sizing? Use rem. Relationship to available size? A percentage may be appropriate.


## 7. Checkpoint

Which statement is strongest?

A. Every CSS value should use px.

B. Every CSS value should use rem.

C. Choose the unit based on the relationship the requirement needs.

D. Units do not matter if the number looks right.


**Review key:** C.

**Feedback after submit:** Units are engineering choices. The requirement should drive the choice.


## 8. Forge takeaway

Senior habit: Do not memorize a “best unit.” Match the unit to the relationship you need.


---
# 1.2.7 — Borders, Radius, and Shadows
**Estimated time:** 12 minutes  
**Learner goal:** Use borders, border radius, and box shadows to create clear visual edges and surfaces while understanding that each property solves a different problem.


## 1. Three visual tools

Borders, radius, and shadows can all change how an element feels, but they are not the same thing.

```css
.card {
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
```

A border draws an edge. border-radius rounds corners. box-shadow creates the appearance of depth around the box.


## 2. Predict

You want sharp corners instead of rounded corners. Which declaration should change?

A. border-radius

B. box-shadow

C. font-size

D. padding


**Review key:** A.

**Feedback after submit:** Corner shape is the direct responsibility of border-radius.


## 3. Predict again

You want the card to have a visible edge even when the shadow is removed. Which property provides that edge?

A. border

B. line-height

C. background-color only

D. margin


**Review key:** A.

**Feedback after submit:** A border is an actual edge around the box. A shadow is a visual effect outside it.


## 4. Surface lab

Style this card:

```css
.card {
  background-color: white;
}
```

Add a 1px light border, 10px corner radius, and a soft shadow.

**Hint:** Hint 1: One declaration controls each visual effect.

**Hint:** Hint 2: Use border, border-radius, and box-shadow.

**Review key:** One valid answer:

```css
.card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
```


## 5. Keep the job separate

Do not use a shadow to solve an actual spacing problem. Do not use a border to solve a typography problem. The property should match the symptom.


## 6. Checkpoint

A card has the right size and spacing, but its corners are too round. What is the first property you inspect?

A. border-radius

B. margin

C. font-weight

D. width


**Review key:** A.

**Feedback after submit:** Start with the property that directly describes the visible problem.


## 7. Forge takeaway

Senior habit: Name the visual defect precisely before changing a declaration.


---
# 1.2.8 — The Cascade: When Rules Meet
**Estimated time:** 15 minutes  
**Learner goal:** Understand that multiple CSS rules can target the same element and use the cascade to predict which declaration wins in simple cases.


## 1. Start here

CSS gets interesting when more than one rule can apply to the same element.

Consider:

```css
p { color: #555; }
p { color: #111; }
```

Both rules target paragraphs. The later declaration wins when the other conditions are equal.


## 2. Predict

Given:

```css
p { color: #555; }
p { color: #111; }
```

What text color should the paragraph use?

A. #555

B. #111

C. both at once

D. neither


**Review key:** B.

**Feedback after submit:** When matching rules have equal priority conditions, the later declaration wins.


## 3. Same property, different selector

```css
p { color: #555; }
.notice { color: #111; }
```

A paragraph also has class="notice". Which color should it use?

A. #555

B. #111

C. the browser chooses randomly

D. the color becomes transparent


**Review key:** B.

**Feedback after submit:** The more specifically targeted class rule beats the general paragraph rule in this simple case.


## 4. A useful ladder

For the simple cases in this lesson, think in this order:

1. Does the rule match the element? 2. Is one rule more specifically targeted? 3. If the relevant rules are otherwise equal, which one comes later?


## 5. Cascade lab

```css
p { color: #555; }
.note { color: #777; }
.note { color: #222; }
```

A paragraph has class="note". Which color wins?

A. #555

B. #777

C. #222

D. all three


**Review key:** C.

**Feedback after submit:** The class-targeted rules outrank the type rule here, and the later class rule wins between the two class rules.


## 6. Fix the conflict

You want note text to be dark gray, but a later rule keeps changing it to red.

```css
.note { color: #333; }
.note { color: red; }
```

For this simple case, what is the cleanest fix?

A. Change the first color and leave the conflicting rule in place.

B. Remove or change the conflicting later rule so the intended rule is the one that remains.

C. Add ten more rules.

D. Move the HTML element.


**Review key:** B.

**Feedback after submit:** A good fix removes the unnecessary conflict instead of stacking more rules on top.


## 7. Checkpoint

Which statement is safest?

A. The last rule always wins no matter what.

B. Only one CSS rule can match an element.

C. The cascade resolves conflicts among matching rules using their relative priority and order.

D. The browser ignores duplicate properties.


**Review key:** C.

**Feedback after submit:** The cascade is a conflict-resolution system. “Last wins” is only a safe shortcut when the relevant priority conditions are equal.


## 8. Forge takeaway

Senior habit: When a style seems to be ignored, look for another rule that is also matching instead of assuming the browser is broken.


---
# 1.2.9 — Inheritance and Defaults
**Estimated time:** 12 minutes  
**Learner goal:** Predict when a property value flows from a parent to descendants and recognize the difference between inherited properties and browser defaults.


## 1. Start here

Some CSS properties can be inherited by descendants. That means a child can receive a value from its parent without its own rule repeating it.


## 2. Predict inheritance

```css
body { color: #222; }
```

A paragraph inside body has no color declaration of its own. What should you expect?

A. It can inherit the text color from body.

B. It must become blue.

C. It becomes invisible.

D. The browser deletes the paragraph.


**Review key:** A.

**Feedback after submit:** Color is an inheritable property. The paragraph can receive the parent value.


## 3. Not everything inherits

Now consider padding on a parent. Padding creates space around the parent’s own box; it does not mean every child gets the same padding declaration.

A. Every CSS property automatically inherits.

B. Only some properties inherit by default.

C. Nothing can inherit.

D. Inheritance only happens for borders.


**Review key:** B.

**Feedback after submit:** Inheritance is property-specific. Learn the concept instead of memorizing “everything flows down.”


## 4. Browser defaults

Browsers also begin with default styles for many elements. That is why a fresh heading can look larger and a paragraph can have visible spacing even before you write a stylesheet.

Your CSS does not start from an empty universe. It participates in a system that already has rules.


## 5. Prediction lab

```css
body { color: #222; }
strong { color: #c60; }
```

A strong element appears inside body. Which color should the strong text use?

A. #222

B. #c60

C. both

D. the browser default only


**Review key:** B.

**Feedback after submit:** The strong selector supplies its own color, so that direct rule takes over for the element.


## 6. Checkpoint

Which explanation is more useful?

A. “The browser randomly styled the text.”

B. “This element inherited a property or received a default style, and my rule may or may not override it.”


**Review key:** B.

**Feedback after submit:** A predictable explanation gives you something to investigate.


## 7. Forge takeaway

Senior habit: When you see a style you did not explicitly write, do not panic. Ask whether it came from inheritance, a browser default, or another matching rule.


---
# 1.2.10 — States: Hover, Focus, and More
**Estimated time:** 13 minutes  
**Learner goal:** Use pseudo-classes for simple interaction states and understand why visible focus is necessary when an element receives keyboard focus.


## 1. Start here

Sometimes an element should look different because of its current state. CSS can target states with pseudo-classes.


## 2. Hover

```css
button:hover {
  background-color: #222;
}
```

The :hover pseudo-class targets a button while the pointing device is over it.


## 3. Focus

```css
button:focus {
  outline: 2px solid darkorange;
}
```

:focus targets an element while it has focus. Focus matters because a person can navigate controls without a pointing device.


## 4. Predict

Which rule should change a button only while the pointer is over it?

A. button:hover

B. button:focus

C. button

D. .action:hover


**Review key:** A.

**Feedback after submit:** The pseudo-class name describes the state.


## 5. Accessibility moment

A learner removes the visible focus outline because “it looks cleaner.” What is the problem?

A. Nothing. Focus is decorative.

B. Keyboard users may lose a visible indication of which element is focused.

C. The HTML becomes invalid.

D. The page stops loading.


**Review key:** B.

**Feedback after submit:** A state indicator can be functional. Focus visibility helps people navigate and understand where input will go.


## 6. State lab

```css
button {
  background-color: #222;
  color: white;
}

button:hover {
  background-color: #444;
}
```

Add a focus rule that keeps the button visibly identifiable when focused.

**Hint:** Hint 1: Target the :focus state.

**Hint:** Hint 2: Use an outline.

**Review key:** One valid answer:

```css
button:focus {
  outline: 2px solid darkorange;
}
```


## 7. Checkpoint

Which is the better engineering choice?

A. Style hover only because everyone uses a pointer.

B. Treat interaction states as part of the interface, including a visible focus state.

C. Remove all state styling.

D. Use a state only when it looks fashionable.


**Review key:** B.

**Feedback after submit:** State styling is part of interaction design and accessibility.


## 8. Forge takeaway

Senior habit: When styling an interactive control, ask what it looks like before, during, and after input—not just when it is idle.


---
# 1.2.11 — CSS Investigation: Find the Rule
**Estimated time:** 14 minutes  
**Learner goal:** Apply the CSS concepts learned so far to locate the rule causing a visible problem and make the smallest correct change.


## 1. Start here

Now we stop learning isolated properties and start investigating.

A good CSS investigation asks three questions:

1. What should this element look like?
2. What does it look like now?
3. Which matching rule explains the difference?


## 2. Case file

```css
<article class="card">
  <h2>Build carefully</h2>
  <p class="note">Small changes are easier to understand.</p>
</article>

<style>
.card {
  padding: 16px;
  background-color: white;
}
.note {
  color: #333;
}
.note {
  color: white;
}
</style>
```

The note text is hard to read. What is the most direct explanation?

A. The HTML is missing.

B. Two class rules match .note, and the later rule changes the color to white.

C. Padding removes text color.

D. The browser cannot read class selectors.


**Review key:** B.

**Feedback after submit:** The matching later .note rule is the conflict. This is a cascade problem.


## 3. Repair the smallest thing

Fix the case without rewriting unrelated styles.

**Hint:** Hint 1: There are two .note rules.

**Hint:** Hint 2: One of them is causing the low-contrast text.

**Hint:** Hint 3: Remove the conflicting white color or replace it with a readable value.

**Review key:** A clean fix is to remove the later .note { color: white; } rule. Another valid fix is to change that later declaration to a readable color when the requirement calls for it.


## 4. Second case

```css
.card {
  padding: 16px;
}
.card {
  padding: 4px;
}
```

The card content feels cramped. What should you inspect first?

A. The later padding declaration.

B. The page title text.

C. The browser history.

D. The image file format.


**Review key:** A.

**Feedback after submit:** The later matching rule changes the padding. Find the rule that is actually producing the current result.


## 5. Investigation principle

Do not start by changing every property. Start with the property that best matches the symptom, then find the rule that controls it.


## 6. Checkpoint

Which investigation is more efficient?

A. Change color, margin, padding, and font size until the page looks different.

B. Describe the symptom, identify the property that controls it, then inspect the matching rules for that property.

C. Rewrite the whole stylesheet.

D. Add another matching rule before identifying the existing conflict.


**Review key:** B.

**Feedback after submit:** The second approach preserves information and narrows the search.


## 7. Forge takeaway

Senior habit: Fix the cause, not the symptom. Change the smallest rule that explains the observed problem.


---
# 1.2.12 — Forge Mission: Make the Structure Look Intentional
**Estimated time:** 18 minutes  
**Learner goal:** Independently style a structured HTML page using selectors, typography, color, box model, sizing, surfaces, states, cascade reasoning, and disciplined investigation.


## 1. The brief

You are given an already-structured article page. Your job is to make it look like a deliberate interface using only CSS.

```css
<main class="page">
  <h1>Forge Notes</h1>
  <p class="lead">A small place for practical engineering lessons.</p>

  <article class="card">
    <h2>Trace the change</h2>
    <p>Make one change, observe it, and keep the explanation.</p>
    <a class="action" href="#">Read lesson</a>
  </article>

  <p class="note">Tip: small experiments are easier to reason about.</p>
</main>
```


## 2. Your constraints

Use CSS to satisfy all of these requirements:

• The page content should use a readable dark text color on a light background.
• The main heading should be visually stronger than the body text.
• The lead paragraph should be slightly larger and comfortably spaced.
• The card should have inner spacing, a visible border, rounded corners, and a soft shadow.
• The action link should have a clear hover state and a visible focus state.
• The note should be visually quieter than the lead paragraph.
• The card should not sit flush against nearby content.
• Do not rewrite the HTML.


## 3. Work in a deliberate order

Start with global text color and background. Then style the hierarchy. Then style the card box. Then style the interactive link states. Finally, inspect the result and remove any conflicting rules you created while experimenting.


## 4. Your workspace

```css
/* Write your CSS here */
```

Do not copy a finished answer. Build the result from the requirements.

**Hint:** Hint 1: Name the target before every rule. Which element or class are you styling?

**Hint:** Hint 2: Use the box model for internal and external spacing: padding is inside, margin is outside.

**Hint:** Hint 3: Use :hover and :focus on the .action link, and make the focus state clearly visible.


## 5. Verification

Before you submit, check each requirement against the rendered result. Do not ask “Does it look nice?” first. Ask “Can I point to the rule that satisfies each requirement?”


## 6. Explain-back

Answer these without looking back at the mission text:

1. Which selector targets the note specifically?
2. Which declaration creates inner space inside the card?
3. Which declaration creates space outside the card?
4. Which pseudo-class styles the link while it is focused?
5. If a later rule unexpectedly changes the card padding, what part of CSS should you investigate?

**Review key:** Reference answers: 1. .note  2. padding  3. margin  4. :focus  5. The matching cascade rules for padding.


## 7. Transfer

Now imagine the same HTML contains a second card. You want both cards to share the same surface treatment but you want one of them to have a different text color for a special message. What would you change: the shared class rule, or the special element’s more targeted rule? Explain why.

**Review key:** A strong answer identifies the shared class as the common baseline and then uses a more targeted rule only for the special case, while avoiding unnecessary global changes.


## 8. Mastery gate

This module is complete when you can independently do the following on a fresh HTML page:

• Explain what a selector targets.
• Choose between a type, class, and id selector for a requirement.
• Use color, background, typography, border, radius, and shadow for deliberate visual effects.
• Predict padding versus margin.
• Choose px, rem, or % based on the relationship you need.
• Explain a simple cascade conflict.
• Recognize inheritance and browser defaults as possible sources of unexpected styles.
• Style hover and focus states without hiding the focus indication.
• Investigate a visible problem by finding the smallest rule that explains it.

If you can make the page look right but cannot explain why the rules produced the result, you are not finished yet. The goal is not decoration. The goal is predictable control.
