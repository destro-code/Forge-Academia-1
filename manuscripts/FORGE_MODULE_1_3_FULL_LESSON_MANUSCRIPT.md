# Forge Curriculum v2
## Module 1.3 — Layout and Responsive Design
### Full Lesson Manuscript

> **Purpose:** Actual learner-facing lesson manuscript for review. It is intentionally not JSON and not an authoring guide. Review keys, hints, and reference answers are included so the experience can be audited before it is converted into Forge activities.

### Module outcome
By the end of this module, the learner can explain normal document flow, choose between ordinary flow, Flexbox, and Grid for a layout problem, control spacing and alignment deliberately, and adapt a layout to narrower screens without relying on random pixel nudges.

### Module lessons
1. **Layout Starts With Flow** — normal document flow and the value of trusting the default before overriding it.
2. **Block and Inline: Two Different Kinds of Flow** — why some content starts a new row while other content can share a line.
3. **Space in Flow** — using padding and margin as deliberate layout tools.
4. **Flexbox: Put Items Into One Flow** — introducing the parent/child relationship of a flex container.
5. **Flex Direction and Gap** — choosing row or column and creating consistent space.
6. **Alignment: Where Should Items Sit?** — main axis, cross axis, and intentional alignment.
7. **Wrapping and Flexible Space** — responding to less room with wrapping and flexible items.
8. **Grid: Two Dimensions** — building shared rows and columns.
9. **Responsive Thinking: Design for Constraints** — designing for available space rather than device labels.
10. **Media Queries: Change the Rules When Needed** — applying alternate layout rules under a condition.
11. **Layout Investigation: Find the Broken Relationship** — diagnosis and smallest-fix thinking.
12. **Forge Mission: Build a Layout That Survives Change** — independent responsive layout construction.

---

# 1.3.1 — Layout Starts With Flow
**Estimated time:** 10 minutes  
**Learner goal:** Understand that elements normally enter the page in document order and that layout starts with normal flow before extra layout rules are added.

## Start here

HTML gives a page a sequence of content. Before you add special layout rules, the browser already knows how to place that content in its normal flow.

Think of normal flow as the browser asking, “What comes next?” One piece takes its place, then the next piece follows it.

That default is useful. You do not need a special layout system just to put one paragraph after another.

## First prediction

Consider this HTML:

```html
<h1>Forge</h1>
<p>Build the skill.</p>
<p>Use the skill.</p>
```

What should you expect before any special layout rule is added?

A. The elements appear in document order, one after another.

B. All three pieces overlap in the same spot.

C. The second paragraph appears before the heading.

D. The browser waits for another language to arrange them.

**Review key:** A

**Feedback after submit:** Normal flow starts with the order of the document. The browser already has a useful default arrangement for ordinary content.

## The useful model

Normal flow is not the absence of layout. It is the browser's starting layout behavior.

When the default result is already correct, leave it alone. A good engineer does not add machinery just to prove they know machinery.

## Change one thing

Add another paragraph:

```html
<p>Keep going.</p>
```

What should happen?

A. The new paragraph joins the flow after the existing content.

B. It replaces the heading.

C. It appears in a random place.

D. It becomes a separate page.

**Review key:** A

**Feedback after submit:** Adding content to the document usually adds another step to the existing flow. Nothing special is required just to continue the sequence.

## Tiny lab

Create one heading followed by three paragraphs. Then add a fourth paragraph without changing any layout rule.

Observe the new content.

Your job is not to force a position. Your job is to notice what normal flow already gives you.

## Prediction before the edit

Imagine the heading is removed from the document.

What is the strongest prediction?

A. The paragraphs move into the space where the heading used to be, while remaining in their normal order.

B. The paragraphs disappear.

C. The browser keeps an empty heading there.

D. Every paragraph becomes a heading.

**Review key:** A

**Feedback after submit:** The flow is produced by the content that actually exists. Remove one item, and the following content can move into the space it used to occupy.

## Checkpoint

Which statement is the strongest starting rule for layout?

A. Start by overriding the browser's default behavior everywhere.

B. Start with normal flow and add layout rules only when the design requires them.

C. Give every element a fixed width immediately.

D. Move every element manually until the page looks right.

**Review key:** B

**Feedback after submit:** Normal flow is the baseline. Good layout work changes the baseline only when the relationship actually requires something different.

## Forge takeaway

**Mental model:** Layout begins with content moving through normal flow.

**Senior habit:** Before changing layout, identify what the browser is already doing correctly.

**Mastery signal:** You can predict where added or removed content will move without adding a layout rule.

---

# 1.3.2 — Block and Inline: Two Different Kinds of Flow
**Estimated time:** 11 minutes  
**Learner goal:** Distinguish block-level and inline behavior well enough to predict why some elements start on a new line while others can share a line.

## Start here

Not every element participates in normal flow in exactly the same way.

Some elements naturally take a new line in the flow. Other content can stay inside the current line of text.

For this lesson, use a simple model:

- block-like content starts a new row in normal flow;
- inline content can participate inside the current line.

## Prediction

Imagine:

```html
<p>Hello <strong>there</strong>.</p>
```

Should the strong text normally start a brand-new row?

A. Yes. Every element starts a new row.

B. No. It can participate inside the paragraph's line of text.

C. Only when the page is wide.

D. Only when the browser is refreshed.

**Review key:** B

**Feedback after submit:** The strong element is inline content inside the paragraph. It can stay with the surrounding text.

## Compare two paragraphs

Now compare:

```html
<p>One paragraph.</p>
<p>Another paragraph.</p>
```

The paragraphs normally occupy separate rows in the document flow.

That difference matters. If every element behaved the same way, you would have a much harder time predicting the page.

## Small prediction

You add another phrase inside the same paragraph:

```html
<p>Read this <strong>carefully</strong> before continuing.</p>
```

What changes?

A. The phrase can remain inside the current line of text.

B. A new paragraph is automatically created.

C. The browser moves the phrase to the top of the page.

D. The paragraph disappears.

**Review key:** A

**Feedback after submit:** The phrase is still part of the paragraph. The inline content can share the paragraph's line.

## Tiny lab

Create one paragraph containing normal text, a strong word, and another normal phrase. Then create a second paragraph.

Observe which content shares a line and which content starts a new row.

## Why this matters

Layout reasoning starts with the defaults.

If a piece of content appears on a different line than you expected, the first useful question is not “Which fancy layout tool fixes this?”

It is:

**“What does this element normally do in flow?”**

## Checkpoint

A heading is followed by a paragraph, and a bold phrase appears inside that paragraph. Which pattern is the expected normal-flow behavior?

A. Heading, then paragraph on the next row; the bold phrase stays within the paragraph's line.

B. Everything appears on one row.

C. Every word becomes its own row.

D. The paragraph is hidden.

**Review key:** A

**Feedback after submit:** The heading and paragraph establish separate blocks in normal flow. The bold phrase remains part of the paragraph's inline content.

## Forge takeaway

**Mental model:** Normal flow has different element behaviors. Learn those defaults before trying to override them.

**Senior habit:** When layout surprises you, first ask what the element normally does.

**Mastery signal:** You can predict whether simple HTML will continue the current line or start a new row.

---

# 1.3.3 — Space in Flow
**Estimated time:** 12 minutes  
**Learner goal:** Use padding and margin deliberately in a flowing layout and predict how added space changes nearby content.

## Start here

You already know the box model. Now use it as a layout tool.

Padding creates space inside a box. Margin creates space outside a box.

In ordinary flow, that space changes how much room an element and its neighbors need.

## Prediction: margin

Two paragraphs sit one after another. You add:

```css
p {
  margin-bottom: 24px;
}
```

What is the most direct effect?

A. Space is added outside each paragraph, separating it from following content.

B. The paragraph text becomes 24px taller.

C. The paragraph becomes 24px wider.

D. The text changes color.

**Review key:** A

**Feedback after submit:** Margin is outside the box. A bottom margin changes the space between that paragraph and what follows it.

## Padding or margin?

A card needs more breathing room between its border and its text.

Which is the more direct tool?

A. Padding

B. Margin

C. Either one always means the same thing.

D. Neither.

**Review key:** A

**Feedback after submit:** Padding is inside the box. It creates space between the content and the border.

## Tiny lab

Create two stacked cards.

Give the first card padding.

Give the second card a bottom margin.

Look carefully at the two kinds of space.

Ask yourself:

**“Is the space inside the box, or between boxes?”**

## Prediction before the edit

If you double the bottom margin of the first card, what should happen to the second card's starting position?

A. It should move farther down.

B. It should move farther up.

C. Nothing can change.

D. The second card becomes wider.

**Review key:** A

**Feedback after submit:** More outside space after the first card pushes the following content farther away in normal flow.

## A useful anti-habit

Do not use margin as a blind “move this thing 12px to the right” button.

First describe the relationship you need.

- Space inside a component → padding.
- Space between nearby components → margin.
- Later, when you learn layout systems, some relationships can be expressed even more directly.

## Checkpoint

You want text farther from a card's border but do not want to increase the gap between that card and the next card. Which property is the more direct tool?

A. Padding

B. Margin

C. Width

D. Border

**Review key:** A

**Feedback after submit:** Padding changes internal space. Margin changes external space.

## Forge takeaway

**Mental model:** Padding is internal breathing room; margin is external spacing.

**Senior habit:** Describe the space problem before choosing the property.

**Mastery signal:** You can predict how a margin or padding change affects nearby content without trial-and-error nudging.

---

# 1.3.4 — Flexbox: Put Items Into One Flow
**Estimated time:** 14 minutes  
**Learner goal:** Use Flexbox for a one-dimensional row or column of related items and understand that the parent controls the layout relationship.

## Start here

You have learned normal flow. Now meet a layout tool built for arranging a group of related items along one main direction: **Flexbox**.

The core idea is simple:

**The parent becomes the flex container. Its direct children become flex items.**

## First example

```css
.toolbar {
  display: flex;
}
```

The rule is applied to the parent.

That changes the layout relationship among its direct children.

## Prediction

You have three buttons inside `.toolbar`. After `display: flex`, what is the first useful expectation?

A. The children can participate in a shared flex layout.

B. Every child is placed at a random position.

C. The buttons disappear.

D. The parent becomes an image.

**Review key:** A

**Feedback after submit:** The important change is the relationship. The parent now establishes a flex layout for its direct children.

## Parent or child?

Where does the rule that creates the flex layout go?

A. On the parent container that holds the items.

B. Only on each child.

C. On the document title.

D. On the page's outermost element every time.

**Review key:** A

**Feedback after submit:** `display: flex` creates the flex container. The direct children become flex items because of that parent relationship.

## Tiny lab

Create this structure:

```html
<div class="toolbar">
  <button>Save</button>
  <button>Cancel</button>
  <button>Help</button>
</div>
```

Then apply:

```css
.toolbar {
  display: flex;
}
```

Observe the relationship among the three buttons.

Do not change the buttons themselves yet.

## Choose the tool

You have three related controls that should sit in one horizontal group.

Which tool is designed for this relationship?

A. Flexbox

B. Rewriting the controls as one image

C. Adding random offsets to each control

D. Changing the meaning of the controls

**Review key:** A

**Feedback after submit:** Flexbox is designed for a shared one-dimensional relationship between related items.

## Checkpoint

Complete the sentence:

“Flexbox is most useful when I need to arrange ________ items along a main direction.”

A. related

B. unrelated hidden

C. unrelated

D. secret

**Review key:** A

**Feedback after submit:** The useful beginner model is relationship-first: Flexbox arranges related items along a main axis.

## Forge takeaway

**Mental model:** Flexbox is a parent-controlled relationship among direct children.

**Senior habit:** Choose a layout tool because of the relationship you need, not because a snippet is popular.

**Mastery signal:** You can look at a group of sibling elements and explain why turning their parent into a flex container changes the relationship.

---

# 1.3.5 — Flex Direction and Gap
**Estimated time:** 12 minutes  
**Learner goal:** Control the main direction of a flex layout and use `gap` for consistent space between flex items.

## Start here

A flex container can arrange items in a row or a column.

The property that chooses the main direction is `flex-direction`.

## Row versus column

```css
.menu {
  display: flex;
  flex-direction: row;
}

.stack {
  display: flex;
  flex-direction: column;
}
```

Row means the main direction runs across the page.

Column means it runs downward.

## Prediction

What is the most likely visible change when a flex container changes from row to column?

A. Its direct children move from a horizontal arrangement to a vertical arrangement.

B. The children disappear.

C. The text becomes bold.

D. The parent stops being a flex container.

**Review key:** A

**Feedback after submit:** `flex-direction` changes the direction in which the flex items are arranged.

## Gap

Instead of adding different margins to every flex item, Flexbox gives you `gap`:

```css
.menu {
  display: flex;
  gap: 12px;
}
```

Gap describes the space between flex items.

It expresses a relationship directly: “these items should have this much space between them.”

## Tiny lab

Build a three-item toolbar.

First use row.

Then switch to column.

Finally add `gap: 12px` and observe how the relationship stays consistent.

## Prediction: add another item

You add a fourth item.

With `gap: 12px`, what should you expect?

A. The browser continues applying the same gap between flex items.

B. Only the first three items receive space.

C. The gap disappears.

D. The new item replaces the first item.

**Review key:** A

**Feedback after submit:** `gap` belongs to the relationship among the flex items, so a newly added item participates in that same spacing rule.

## Checkpoint

Which rule best expresses “these controls are stacked with consistent space”?

A. `display: flex; flex-direction: column; gap: 12px;`

B. `color: red; font-weight: bold;`

C. `margin: 999px;`

D. `width: 2px;`

**Review key:** A

**Feedback after submit:** The answer directly describes the layout relationship: column direction plus consistent space between siblings.

## Forge takeaway

**Mental model:** Direction chooses the main axis; gap describes space between flex items.

**Senior habit:** Prefer one rule that expresses a relationship over a pile of one-off nudges.

**Mastery signal:** You can switch a flex layout from row to column and predict what changes before you refresh the page.

---

# 1.3.6 — Alignment: Where Should Items Sit?
**Estimated time:** 14 minutes  
**Learner goal:** Use `justify-content` and `align-items` to reason about placement along a flex container's main and cross axes.

## Start here

Flexbox gives you a relationship between items. Next you need to control where the group sits inside the available space.

Two properties are central:

- `justify-content` works along the main axis;
- `align-items` works across the cross axis.

## Main versus cross

For a row, the main axis runs left-to-right and the cross axis runs top-to-bottom.

For a column, the main axis runs top-to-bottom and the cross axis runs left-to-right.

The safe memory is not “justify means horizontal.”

The safe memory is:

**justify = main axis**

**align = cross axis**

## Prediction: justify-content

A row flex container has extra horizontal space.

You use:

```css
.toolbar {
  display: flex;
  justify-content: center;
}
```

What are you asking the browser to do?

A. Center the flex items along the row's main axis.

B. Center each letter inside every button.

C. Change the text color.

D. Turn the row into a column.

**Review key:** A

**Feedback after submit:** A row's main axis is horizontal, so `justify-content: center` centers the flex items across that available main-axis space.

## Prediction: align-items

The same row container uses:

```css
.toolbar {
  display: flex;
  align-items: center;
}
```

What is this primarily controlling?

A. Placement across the cross axis.

B. The font family.

C. The document meaning.

D. The page address.

**Review key:** A

**Feedback after submit:** For a row, the cross axis is vertical. `align-items` controls how the flex items sit across that axis.

## Tiny lab

Make a toolbar 300px wide and 80px tall. Put three buttons inside.

Experiment with:

```css
justify-content: center;
align-items: center;
```

Observe the two directions separately.

Then switch the flex direction to column and ask yourself what “main” and “cross” now mean.

## Common trap

People often memorize:

“justify = horizontal”

That memory fails when the direction changes.

The safer rule is:

**Find the main axis first. Then decide what `justify-content` is controlling.**

## Checkpoint

If you change a flex container from row to column, should your mental model of the axes stay tied to the words horizontal and vertical?

A. No. The axes are defined by the flex direction.

B. Yes. Main axis always means horizontal.

C. Yes. Cross axis always means vertical.

D. The axes stop existing.

**Review key:** A

**Feedback after submit:** The axis names describe the flex relationship, not permanent screen directions.

## Forge takeaway

**Mental model:** Ask where the main axis points before choosing alignment properties.

**Senior habit:** Do not memorize the screen direction. Trace the container's chosen axis.

**Mastery signal:** You can predict what a justify or align change will do even after switching the flex direction.

---

# 1.3.7 — Wrapping and Flexible Space
**Estimated time:** 14 minutes  
**Learner goal:** Understand that a row can run out of room and learn the basic roles of `flex-wrap` and `flex: 1`.

## Start here

A layout that looks fine with three cards may fail when the available width gets smaller.

That is not mysterious.

The container simply has less room.

Flexbox can respond by allowing items to wrap, or by allowing items to share available space more flexibly.

## Wrapping

```css
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
```

`flex-wrap: wrap` tells the flex container that items may move onto additional rows when there is not enough room on one row.

## Prediction

A row contains six cards. The available width becomes much smaller.

With `flex-wrap: wrap`, what is the intended behavior?

A. Items may continue on additional rows instead of being forced to remain on one row.

B. All cards disappear.

C. The parent becomes taller by exactly 6px.

D. The browser removes the last card.

**Review key:** A

**Feedback after submit:** Wrapping gives the items another row to use when the original row no longer has enough room.

## Flexible children

Sometimes you want items to share remaining space.

A common simple pattern is:

```css
.card {
  flex: 1;
}
```

This says the flex items can grow to share available space within their flex container.

## Tiny lab

Create three cards inside a flex container with a visible width.

First use `display: flex` without wrapping.

Then add `flex-wrap: wrap`.

Then try `flex: 1` on the cards.

Observe the difference between:

- allowing another row;
- allowing items to share the current row's space.

## Checkpoint

Which choice best matches each goal?

**Goal A:** let items move onto another row when space runs out.

**Goal B:** let sibling items share available space.

A. A → `flex-wrap: wrap`; B → `flex: 1`

B. A → `gap: 0`; B → `display: block`

C. A → `color: red`; B → `margin: auto`

D. A → `font-size: 2rem`; B → `border: 0`

**Review key:** A

**Feedback after submit:** Wrapping changes how many rows the layout can use. `flex: 1` changes how the items can share available space.

## Forge takeaway

**Mental model:** Responsive layout problems often begin with available space. Wrapping changes rows; flexible sizing changes how items share a row.

**Senior habit:** Ask whether the layout needs another row or a different distribution of space.

**Mastery signal:** You can distinguish “make another row” from “share the current row better.”

---

# 1.3.8 — Grid: Two Dimensions
**Estimated time:** 15 minutes  
**Learner goal:** Understand when Grid is useful for a two-dimensional arrangement and create a simple row-and-column layout.

## Start here

Flexbox is excellent when the main relationship is one direction.

Grid is useful when you care about rows and columns together.

A dashboard of repeated cards often has that shape: the cards form a shared structure across both dimensions.

## Create a grid

```css
.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
```

The three `1fr` values create three flexible columns that share the available grid space.

## Prediction

What does `1fr 1fr 1fr` communicate here?

A. Create three columns that share the available space.

B. Create three colors.

C. Create three headings.

D. Create three paragraphs.

**Review key:** A

**Feedback after submit:** `fr` represents a fraction of the available grid space. Three equal `1fr` tracks create three equal flexible columns here.

## Flex or Grid?

You have three related controls that should sit in one horizontal group.

Flexbox is a natural fit.

You have a dashboard that needs a shared row-and-column structure.

Grid is a natural fit.

The point is not that one tool is “better.” The point is that the relationship tells you which tool is easier to reason about.

## Tiny lab

Create six cards.

Put them in a grid with three columns and a 16px gap.

Then reduce the container width and observe that the columns still belong to one shared grid structure.

## Change the columns

Change the template to:

```css
grid-template-columns: 1fr 1fr;
```

What should you expect?

A. The grid now has two flexible columns.

B. The grid becomes a single image.

C. The six cards disappear.

D. The gap becomes 1px.

**Review key:** A

**Feedback after submit:** The number of column tracks changed from three to two. The rows then form around that two-column structure.

## Checkpoint

Which statement is the strongest beginner rule?

A. Use Grid when the layout relationship is naturally described by rows and columns.

B. Always use Grid for every layout.

C. Never use Grid for repeated cards.

D. Use Grid only when changing text color.

**Review key:** A

**Feedback after submit:** The useful choice is relationship-first. Grid is strong when rows and columns are part of the structure you need.

## Forge takeaway

**Mental model:** Flexbox is a strong tool for one main direction; Grid is a strong tool for two-dimensional row-and-column relationships.

**Senior habit:** Choose the tool from the relationship, not from a favorite snippet.

**Mastery signal:** You can explain why a repeated card area is naturally expressed as a grid instead of merely memorizing `display: grid`.

---

# 1.3.9 — Responsive Thinking: Design for Constraints
**Estimated time:** 13 minutes  
**Learner goal:** Understand responsive design as adapting a layout to available space and content, rather than designing only for named device sizes.

## Start here

A responsive interface is not simply “the desktop version but smaller.”

A better question is:

**“What happens when the available space changes?”**

A useful responsive mindset considers content, available width, readable line lengths, and whether a relationship still works when space is reduced.

## Prediction

A three-column card layout looks good at a wide width.

The same layout becomes cramped at a narrow width.

What should the engineer investigate first?

A. Whether the layout relationship should change when the available space changes.

B. Whether every word should become 2px wide.

C. Whether all content should be hidden.

D. Whether the screen itself is defective.

**Review key:** A

**Feedback after submit:** The issue is a relationship between the content and the available space. Start by asking how the layout should adapt.

## A constraint, not a device label

Instead of thinking only in labels such as “phone” and “tablet,” think about the point where the current layout stops being useful.

That point is a constraint boundary.

The exact width depends on the content and design. It is not a magical number tied to a device name.

## Max-width

Readable text often benefits from a limit on how wide a content region can grow:

```css
.article {
  max-width: 65ch;
}
```

You do not need to memorize the number 65.

The idea is that a content region can stop growing when extra width would make reading harder.

## Prediction

Why might a max-width help a long article?

A. It can prevent the text region from becoming excessively wide.

B. It makes the article invisible.

C. It disables normal flow.

D. It guarantees the same layout on every screen.

**Review key:** A

**Feedback after submit:** A limit on width can protect readability even when the surrounding page becomes wider.

## Tiny lab

Create a long paragraph inside a wide container.

Give the text container a max-width.

Resize the page by changing the available window width and observe what stays constrained.

## Responsive prediction

Imagine the card layout has three columns when there is plenty of room.

As the available width shrinks, what is a healthy question to ask?

A. Which relationship should change first so the content remains usable?

B. Which card should be deleted?

C. Which word should be made smaller?

D. Which HTML element should be removed?

**Review key:** A

**Feedback after submit:** Responsive work is about preserving a useful experience while constraints change. The layout relationship is the thing you should reason about.

## Checkpoint

Which statement best describes responsive thinking?

A. Adapt relationships and sizes as available space changes.

B. Pick one width and force every screen to match it.

C. Use a different HTML language for each device.

D. Hide everything on narrow screens.

**Review key:** A

**Feedback after submit:** Responsive design is constraint-aware design. The goal is not identical pixels; it is a layout that remains useful as conditions change.

## Forge takeaway

**Mental model:** Responsive design is constraint-aware design.

**Senior habit:** Find the condition that breaks the current relationship instead of blindly copying device breakpoints.

**Mastery signal:** You can describe what should change when available space changes without reaching immediately for a device label.

---

# 1.3.10 — Media Queries: Change the Rules When Needed
**Estimated time:** 14 minutes  
**Learner goal:** Use a simple media query to change a layout at a defined width and understand that the query is a condition, not a device name.

## Start here

Sometimes the relationship itself should change when there is less room.

CSS media queries let you apply different rules under a condition.

## A simple condition

```css
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 700px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
```

The first rule describes the wider arrangement.

The media query adds a different arrangement when the viewport is at or below 700px wide.

## Prediction: wide case

At 900px wide, which `grid-template-columns` rule should describe the layout?

A. The three-column rule.

B. The one-column rule inside the media query.

C. Both rules become equally active.

D. Neither rule applies.

**Review key:** A

**Feedback after submit:** The condition `(max-width: 700px)` is false at 900px, so the media query rule does not apply there.

## Prediction: narrow case

At 600px wide, what is the intended result?

A. The media query condition is true, so the one-column rule can apply.

B. The page must use three columns.

C. CSS stops running.

D. The HTML changes meaning.

**Review key:** A

**Feedback after submit:** 600px satisfies `max-width: 700px`, so the alternate layout rule becomes active.

## Tiny lab

Build the three-column example.

Resize the page around the breakpoint.

Watch the layout switch from three columns to one column.

Do not change the HTML.

You are changing the presentation rule in response to the available width.

## Breakpoint reasoning

The number 700px is not sacred.

It is a design choice based on where the current layout stops fitting well.

A different content set might need a different threshold.

A useful breakpoint answers a real question:

**“At what point should the relationship change?”**

## Checkpoint

What is a media query really doing here?

A. Applying a different CSS rule when a condition about the environment is true.

B. Renaming HTML elements.

C. Changing the meaning of the document.

D. Storing page content.

**Review key:** A

**Feedback after submit:** The media query does not change the document's meaning. It changes which presentation rule is active under a condition.

## Forge takeaway

**Mental model:** A media query is a condition that can change presentation rules.

**Senior habit:** Pick a breakpoint because the layout needs to change, not because a device category told you to.

**Mastery signal:** You can explain why a rule is active or inactive at a given width.

---

# 1.3.11 — Layout Investigation: Find the Broken Relationship
**Estimated time:** 15 minutes  
**Learner goal:** Investigate a layout defect by identifying the intended relationship, observing the active rule, and making the smallest justified change.

## Start here

Good layout debugging is not “try CSS until it looks okay.”

You are looking for the rule that controls the relationship you care about.

Use this loop:

**describe the intended relationship → inspect the parent → inspect the relevant layout property → make the smallest change → verify the changed case**

## Case 1 — Wrong direction

A toolbar should be horizontal, but its three controls are stacked vertically.

You find:

```css
.toolbar {
  display: flex;
  flex-direction: column;
}
```

What should you investigate first?

A. Whether `flex-direction` is creating the vertical arrangement.

B. Whether the button text is spelled correctly.

C. Whether the page needs a new HTML document.

D. Whether the screen is too bright.

**Review key:** A

**Feedback after submit:** The symptom is directly connected to the direction rule. Start with the rule that controls the relationship instead of changing unrelated properties.

## Case 2 — Wrong alignment

A row of controls is inside a tall toolbar.

The controls sit at the top, but the design calls for vertical centering.

You see:

```css
.toolbar {
  display: flex;
  align-items: flex-start;
}
```

Which property expresses the relationship you need to reconsider?

A. `align-items`

B. `color`

C. `border-radius`

D. `font-size`

**Review key:** A

**Feedback after submit:** The problem is cross-axis placement. `align-items` is the property that expresses that relationship for the flex container.

## Case 3 — Cramped cards

A three-column grid looks fine wide and cramped narrow.

You see no responsive rule.

What is the smallest useful question?

A. At what available width does this relationship stop working, and should the grid change there?

B. How can I add 40 random margins?

C. How can I hide the cards?

D. How can I delete half the content?

**Review key:** A

**Feedback after submit:** The symptom is about the relationship between the grid and the available width. Find the constraint boundary before changing unrelated styles.

## Investigation lab

You are given a card row.

The cards should wrap, but they stay on one line and overflow the available space.

Before editing anything, identify the missing relationship rule.

```css
.cards {
  display: flex;
  gap: 16px;
}
```

What is the likely missing rule?

A. `flex-wrap: wrap`

B. `color: red`

C. `border: none`

D. `font-weight: bold`

**Review key:** A

**Feedback after submit:** The intended relationship includes another row when space runs out. `flex-wrap: wrap` expresses that directly.

## Smallest-fix challenge

Imagine a card grid switches to one column too early.

Your first instinct is to add more rules.

Stop.

Ask:

1. What width causes the current relationship to stop working?
2. Which rule controls that change?
3. What is the smallest edit that proves or disproves your hypothesis?

That sequence is more reliable than changing five values at once.

## Checkpoint

Which investigation order is most reliable?

A. Intended relationship → controlling rule → smallest change → verify.

B. Random changes → refresh → random changes.

C. Rewrite the whole page → inspect later.

D. Change every spacing value first.

**Review key:** A

**Feedback after submit:** Good layout investigation starts with a model of the intended relationship and changes only the rule you have reason to suspect.

## Forge takeaway

**Mental model:** Layout bugs are relationship bugs.

**Senior habit:** Make the smallest change that tests your hypothesis.

**Mastery signal:** You can identify the controlling layout property from a visible symptom before editing anything.

---

# 1.3.12 — Forge Mission: Build a Layout That Survives Change
**Estimated time:** 18 minutes  
**Learner goal:** Independently build and adapt a small responsive interface using normal flow, Flexbox, Grid, spacing, and a media query.

## Mission briefing

You are building the front page of a tiny Forge dashboard.

The content already exists.

Your job is to make the layout work at two very different widths without rewriting the HTML structure.

## Starting HTML

```html
<main class="page">
  <header class="topbar">
    <h1>Forge Dashboard</h1>
    <nav class="actions">
      <a href="#">Lessons</a>
      <a href="#">Progress</a>
      <a href="#">Profile</a>
    </nav>
  </header>

  <section class="cards">
    <article class="card">HTML</article>
    <article class="card">CSS</article>
    <article class="card">Forms</article>
    <article class="card">Images</article>
    <article class="card">Links</article>
    <article class="card">Text</article>
  </section>
</main>
```

## Mission requirements

1. Keep the page content in normal document flow.
2. Make the top bar a horizontal relationship on wide screens.
3. Give the card area a clear multi-column structure on wide screens.
4. Give the cards consistent spacing.
5. Add a media query so the card layout changes when the available width becomes too small.
6. Make the narrow layout easy to read rather than merely squeezed.

## Step 1 — Build the top bar

Use Flexbox for the header relationship.

Decide what the main direction should be and how the items should align.

**Target behavior:** the heading and navigation sit in one horizontal row with a clear space between them.

### Hint 1

Start with the parent: `.topbar`.

### Hint 2

You need `display: flex` and a way to distribute the two groups.

### Hint 3

One reasonable starting point is:

```css
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

## Step 2 — Build the card area

Use Grid for the six cards.

Make the relationship obvious: several columns on wide screens, with consistent gaps between cards.

### Hint 1

Start with:

```css
.cards {
  display: grid;
}
```

Then choose the number of columns and a gap.

### Hint 2

A simple starting pattern is:

```css
grid-template-columns: repeat(3, 1fr);
gap: 16px;
```

## Step 3 — Add the narrow layout

Resize the page until the wide layout starts to feel cramped.

Choose a breakpoint where changing the card relationship improves the result.

Then change the grid to fewer columns at that width.

### Hint 1

Use the media-query pattern from the previous lesson.

### Hint 2

A simple narrow rule is:

```css
@media (max-width: 700px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
```

## Verification

Check these cases:

- **Wide:** the top bar is a clear row and the cards form multiple columns.
- **Medium:** the card grid still fits without awkward overflow.
- **Narrow:** the card layout changes to fewer columns and remains readable.
- The HTML content has not been rewritten.
- Spacing comes from layout relationships rather than a pile of one-off offsets.

## Explain back

In your own words, answer:

**Why was Flexbox used for the top bar, while Grid was used for the card area? What condition caused the card layout to change?**

### Strong answer

Flexbox was used because the top bar is mainly a one-direction relationship between the heading and navigation.

Grid was used because the cards form a row-and-column structure.

The card layout changes when the available width becomes too constrained for the wider relationship to remain useful.

## Transfer challenge

Imagine a second page with three account links at the top and four content cards below.

Do not copy the exact CSS.

Instead, name the relationships you would look for:

- What should remain in one row?
- What should form rows and columns?
- At what point should the relationship change?
- Where should spacing be expressed as a relationship rather than as individual nudges?

**Strong reasoning:** The exact content changed, but the layout model remains recognizable. The top group is a one-direction relationship. The content cards are a row-and-column relationship. The responsive change should happen when the available space makes the wide relationship less useful.

## Mastery gate

You have completed the mission when you can:

1. make the interface work at both a wide and narrow width;
2. explain why each layout tool was chosen;
3. identify the constraint that caused the responsive change;
4. change the layout without relying on random pixel nudges.

## Forge takeaway

**The goal is not memorizing snippets.** The goal is choosing a layout model that matches the relationship, then adapting that model when constraints change.

**Senior habit:** A responsive interface is evidence that your layout model can survive change.

**Module mastery signal:** You can look at a new interface, identify its relationships, choose a layout tool, and explain how the design should adapt when space changes.
