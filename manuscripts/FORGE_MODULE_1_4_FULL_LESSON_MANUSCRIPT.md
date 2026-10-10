# Forge Curriculum v2
## Module 1.4 — Accessible Interface Craft
### Full Lesson Manuscript

> **Purpose:** Actual learner-facing lesson manuscript for review. It is intentionally not JSON and not an authoring guide. Review keys and hints are marked for internal review and can later be compiled into Forge activities.

### Module outcome
By the end of this module, the learner can treat accessibility as part of interface quality, choose meaningful HTML elements, build understandable headings and controls, provide useful text alternatives, label and explain form inputs, preserve keyboard access and visible focus, and review a page for common accessibility barriers.

### Module lessons
1. **Accessibility Is Part of the Interface** — Understand accessibility as the quality of an interface for people with different ways of seeing, hearing, moving, and processing information.
2. **Semantic HTML Is Free Accessibility** — Use native HTML elements for their intended jobs and recognize why meaningful elements provide useful behavior and information to browsers and assistive technology.
3. **Headings Create a Reading Path** — Create a logical heading structure and understand that source order and heading meaning help people navigate content.
4. **Links and Buttons Must Say What They Do** — Write useful labels for links and buttons and distinguish navigation from actions.
5. **Images Need the Right Text Story** — Choose useful alternative text for informative images and recognize when an image should be decorative instead.
6. **Forms Need Labels and Instructions** — Build form controls with clear labels and instructions so users know what each field is for and what input is expected.
7. **Keyboard Access and Visible Focus** — Understand keyboard navigation, preserve visible focus, and identify why a mouse-only interface is incomplete.
8. **Color, Contrast, and More Than Color** — Use color as support rather than the only carrier of meaning and recognize why text and controls need sufficient contrast.
9. **Accessibility Investigation: Test the Real Path** — Run a focused accessibility investigation by testing the main task with meaningful content, keyboard interaction, and clear labels and states.
10. **Forge Mission: Repair the Interface for More People** — Independently repair a small page with semantic, labeling, keyboard, focus, image, and color barriers, then explain why each repair matters.

---

# 1.4.1 — Accessibility Is Part of the Interface
**Estimated time:** 10 minutes  
**Learner goal:** Understand accessibility as the quality of an interface for people with different ways of seeing, hearing, moving, and processing information.

## Start here
An interface is not accessible because someone remembered a checklist at the end. It is accessible when people can actually perceive the information, operate the controls, understand what to do, and use the interface with the technology they depend on.

People do not all interact with a page in the same way. A person may use a keyboard instead of a mouse. Someone may zoom text. Someone else may use a screen reader, a tool that presents page content aloud or in another accessible form, or have difficulty distinguishing colors. Someone may need simpler wording or clearer instructions.

Accessibility is therefore not a special version of the interface. It is part of the interface.

## Prediction
A team says: “We will make the page beautiful first, then make it accessible later.” What is the strongest response?

A. Accessibility mostly concerns color choices, so it can wait.
B. Accessibility affects structure, controls, text, focus, and instructions, so it belongs in the design and build process.
C. Accessibility only matters for government websites.
D. Accessibility means adding a separate page for people with disabilities.

**Review key:** B
**Feedback after submit:** Accessibility changes how the interface is structured and operated. Waiting can force you to rebuild parts that should have been accessible from the start.

## Four questions to ask
For this module, use four plain-language questions:

1. Can the person perceive what matters?

2. Can the person operate the interface?

3. Can the person understand what is happening and what is expected?

4. Can the interface work with the user’s browser and assistive technology?

These questions line up with the four principles in the Web Content Accessibility Guidelines (WCAG): Perceivable, Operable, Understandable, and Robust.

## Sort the problem
A form has labels that are unclear, a button cannot be reached by keyboard, and an error is shown only by changing text from gray to red. Which statement is strongest?

A. These are three unrelated visual problems.
B. These are accessibility problems involving understanding, operation, and perceiving information.
C. Only the color issue is an accessibility problem.
D. The browser will fix all three automatically.

**Review key:** B
**Feedback after submit:** Accessibility can fail in different parts of an interaction. The useful move is to ask what the user needs to perceive, operate, or understand.

## Tiny audit
Look at any familiar page you have built before. Without changing anything, name one thing a user must see, one thing a user must operate, and one thing a user must understand to complete the page’s main task.

## Say it
Complete: “Accessibility is part of the interface because ______.”

**Suggested answer:** people with different needs must still be able to perceive, operate, understand, and use the interface.
**Feedback after submit:** A strong answer names the user’s ability to use the interface, not merely compliance with a checklist.

## Forge takeaway
Mental model: Accessibility is about removing barriers in the actual interface.

Senior habit: When reviewing a feature, ask who could be blocked even if the feature looks correct for you.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---

# 1.4.2 — Semantic HTML Is Free Accessibility
**Estimated time:** 12 minutes  
**Learner goal:** Use native HTML elements for their intended jobs and recognize why meaningful elements provide useful behavior and information to browsers and assistive technology.

## Start here
In the previous module, you learned that HTML elements have meaning. Accessibility gives that idea another consequence: meaningful HTML is not only cleaner. It gives the browser useful information about what each control or piece of content is.

Use the element that already means what you need. A button should be a button. A link should be a link. A heading should be a heading. A paragraph should be a paragraph.

## A real button
```html
<button type="button">Save profile</button>
```

## A link
```html
<a href="/profile">View profile</a>
```

## Which one?
A piece of text takes the user to another page. Which element is the direct semantic choice?

A. <button>
B. <a>
C. <div>
D. <span>

**Review key:** B
**Feedback after submit:** A link represents navigation to another resource. Use a link for navigation instead of making another element pretend to be a link.

## Control meaning
A control performs an action on the current page. Which element is the direct semantic choice?

A. <a>
B. <p>
C. <button>
D. <h2>

**Review key:** C
**Feedback after submit:** A button represents an action. The browser already knows useful things about native buttons.

## What you get from native controls
Native controls come with expected browser behavior and meaning. For example, buttons can be reached and activated with the keyboard, and links are recognized as navigation controls.

You are not “doing less” by using the native element. You are choosing a foundation that already carries useful behavior.

## Repair this markup
```html
<div class="save-button">Save profile</div>
```

## Smallest useful repair
The previous line is intended to be a button. What is the strongest repair?

A. Keep the div and add more CSS until it looks like a button.
B. Replace the div with a button element.
C. Change the text color.
D. Add more spacing.

**Review key:** B
**Feedback after submit:** Start with the correct semantic element. Styling cannot give a generic container the complete meaning and default interaction behavior of a native button.

## Repaired
```html
<button type="button">Save profile</button>
```

## Checkpoint
Which rule should guide this work?

A. Use the element that looks closest to the design.
B. Use the element with the correct meaning for the job.
C. Use div for everything so the CSS stays consistent.
D. Use the most complicated element available.

**Review key:** B
**Feedback after submit:** Meaning first. Visual styling comes later.

## Forge takeaway
Mental model: Native HTML is not just syntax. It is a source of meaning and built-in behavior.

Senior habit: Before inventing a custom control, ask whether HTML already has the right element.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---

# 1.4.3 — Headings Create a Reading Path
**Estimated time:** 12 minutes  
**Learner goal:** Create a logical heading structure and understand that source order and heading meaning help people navigate content.

## Start here
A page is easier to use when its structure is obvious. Headings are not decorative labels. They create a hierarchy for the content.

Use one main page heading for the page’s primary subject, then use lower-level headings for sections and subsections.

## A simple hierarchy
```html
<h1>Account settings</h1>

<h2>Profile</h2>
<p>Update your name and avatar.</p>

<h2>Notifications</h2>
<p>Choose which messages you receive.</p>
```

## Predict the structure
Which heading order best represents one page with two major sections?

A. h1 → h2 → h2
B. h3 → h1 → h2
C. h2 → h4 → h1
D. h1 → h4 → h2

**Review key:** A
**Feedback after submit:** The first heading establishes the main subject. The two major sections are children of that subject, so h2 is the natural level for both.

## Do not choose headings by size
If a design wants a small-looking section title, do not pick h4 just because h4 is visually smaller. Heading level is about structure. Visual size belongs to the presentation layer you already learned.

This separation keeps your document meaningful even when the visual design changes.

## Broken order
You find this:

A. h1 → h2 → h3 is always required even when there are no subsections.
B. Heading levels should reflect the content hierarchy; do not skip around just to get a certain visual size.
C. All headings should be h6 for consistency.
D. Headings should only be used on pages with images.

**Review key:** B
**Feedback after submit:** Use levels to communicate the structure of the content, not the size of the text.

## Tiny lab
Build a page titled “Forge Notes” with three sections: “Today”, “Practice”, and “Next”. Give the page one h1 and each section an h2. Then add a subsection under “Practice” using h3.

## Checkpoint
Why does heading structure matter?

A. It guarantees a particular font size.
B. It gives the page a meaningful content hierarchy that users and tools can navigate.
C. It adds color automatically.
D. It prevents all layout problems.

**Review key:** B
**Feedback after submit:** The key value is structure and meaning, not appearance.

## Forge takeaway
Mental model: Headings are a map of the content, not decoration.

Senior habit: Read the headings alone. If the page still makes sense, the hierarchy is doing useful work.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---

# 1.4.4 — Links and Buttons Must Say What They Do
**Estimated time:** 11 minutes  
**Learner goal:** Write useful labels for links and buttons and distinguish navigation from actions.

## Start here
A control label is part of the interface contract. “Click here” tells the user almost nothing. “View billing history” explains the destination. “Save changes” describes the action.

## Choose the better label
A list of account links contains one generic label: “Learn more”. Which replacement is more useful when the destination is a security guide?

A. Click here
B. Learn more
C. Read the account security guide
D. More

**Review key:** C
**Feedback after submit:** Useful labels make sense on their own and tell the user what will happen or where the link goes.

## Specific navigation labels
```html
<a href="/security">Read the account security guide</a>
<a href="/billing">View billing history</a>
```

## Action vs navigation
A control opens and changes the current interface without navigating to a new resource. Which is the stronger semantic choice?

A. Link
B. Button
C. Heading
D. Paragraph

**Review key:** B
**Feedback after submit:** Buttons represent actions. Links represent navigation.

## Context without guesswork
A user should not have to remember what a vague label means. Prefer labels that remain understandable when the nearby paragraph is not read first.

## Tiny lab
Take three controls from a page you know: one navigation control and two actions. Rewrite their labels so each one can be understood without “click here”, “more”, or “go”.

## Checkpoint
Which label is strongest?

A. More
B. Continue
C. View lesson progress
D. Click here

**Review key:** C
**Feedback after submit:** “Continue” can be useful in some contexts, but a specific label gives a clearer promise about the result.

## Forge takeaway
Mental model: Labels are promises. Make the promise specific.

Senior habit: Read controls out of context. If you cannot predict the result, the label is probably too vague.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---

# 1.4.5 — Images Need the Right Text Story
**Estimated time:** 12 minutes  
**Learner goal:** Choose useful alternative text for informative images and recognize when an image should be decorative instead.

## Start here
An image can carry information, add decoration, or act as part of another control. The useful question is not “What is the image?” but “What information does the user need from it?”

## Informative image
A page shows a graph whose main point is “Sign-ups increased 32% this month.” What kind of alternative text is useful?

A. “graph”
B. “image1234.png”
C. Text that communicates the important information shown by the graph
D. Leave the image without any plan

**Review key:** C
**Feedback after submit:** Useful alternative text communicates the purpose or important information of an informative image.

## Decorative image
A page has a purely decorative divider image that adds no information. What is the better approach?

A. Write a long description of the divider
B. Treat it as decorative so it does not add irrelevant noise
C. Name the file exactly
D. Put the same paragraph beside it

**Review key:** B
**Feedback after submit:** Not every image needs meaningful descriptive text. Decorative images should not create unnecessary information for someone using the page.

## Informative example
```html
<img src="signups.png" alt="Monthly sign-ups increased 32 percent compared with last month.">
```

## Write for purpose
Alternative text should be concise enough to use but rich enough to preserve the important information. Do not describe every visual detail when those details do not matter to the task.

## What is the mistake?
A developer writes alt="beautiful blue graph with three lines and tiny dots" for a chart whose only task-relevant fact is the 32 percent increase. What is wrong?

A. It describes visual details instead of communicating the useful information.
B. It contains too few words.
C. Graphs cannot have alternative text.
D. The browser ignores all image text.

**Review key:** A
**Feedback after submit:** Alternative text should preserve the information the image contributes to the task.

## Tiny lab
Pick three images from a sample page: one informative, one decorative, and one that acts as a link. Decide what a user needs to know for each before writing any text.

## Checkpoint
What is the first question to ask when writing image text?

A. How many pixels wide is the image?
B. What information or purpose does the image provide?
C. What camera took the photo?
D. Can I use the longest sentence possible?

**Review key:** B
**Feedback after submit:** Purpose comes first. The wording follows the purpose.

## Forge takeaway
Mental model: Alternative text is a bridge for information, not a caption contest.

Senior habit: Describe the meaning the image contributes, not everything the eye can see.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---

# 1.4.6 — Forms Need Labels and Instructions
**Estimated time:** 14 minutes  
**Learner goal:** Build form controls with clear labels and instructions so users know what each field is for and what input is expected.

## Start here
Forms fail quickly when people do not know what a field means. Every form control needs a clear label, and unusual input rules need clear instructions.

## Explicitly associated label
```html
<label for="email">Email address</label>
<input id="email" name="email" type="email">
```

## Why use for + id?
What does `for="email"` connect to?

A. The page title
B. The input whose id is email
C. The CSS class email
D. The browser history

**Review key:** B
**Feedback after submit:** The label and control are explicitly associated because the label’s for value matches the input’s id.

## Labels are not placeholders
A placeholder is temporary hint text inside a field. It should not replace a persistent label. The label tells the user what the field means even when the field is empty or after text has been entered.

## Useful instructions
```html
<label for="username">Username</label>
<p id="username-help">Use 6–20 letters or numbers.</p>
<input id="username" name="username" type="text">
```

## Instruction design
A username must contain 6–20 letters or numbers. Which is the stronger instruction?

A. “Username” only
B. “Enter something”
C. “Use 6–20 letters or numbers.”
D. “You know what to do.”

**Review key:** C
**Feedback after submit:** Users should be told about constraints that affect how they can complete the field.

## Grouping related choices
When several controls belong to one question, the page should make that relationship clear. For example, a small group of related choices should read as one question with clearly labeled choices.

## Related choices
```html
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email"> Email</label>
  <label><input type="radio" name="contact" value="sms"> SMS</label>
</fieldset>
```

## Checkpoint
What is the strongest form rule?

A. Make the fields look obvious and let users guess the rest.
B. Give each control a clear label and provide instructions for important constraints.
C. Use placeholder text instead of labels.
D. Hide all instructions until the user fails.

**Review key:** B
**Feedback after submit:** Clear labels and instructions reduce uncertainty before the user submits anything.

## Tiny lab
Build a two-field contact form. Each field should have a visible label. Add one useful instruction for the field that has a special format requirement.

## Forge takeaway
Mental model: A form should answer “What is this?”, “What do I enter?”, and “What happens if I get it wrong?”

Senior habit: Fill your own form from the user’s perspective without relying on memory of the requirements.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---

# 1.4.7 — Keyboard Access and Visible Focus
**Estimated time:** 14 minutes  
**Learner goal:** Understand keyboard navigation, preserve visible focus, and identify why a mouse-only interface is incomplete.

## Start here
Not every user operates a page with a mouse. Keyboard access is also useful when a pointing device is unavailable, difficult to use, or simply not preferred.

The basic test is simple: can you reach and operate the page’s important controls with the keyboard?

## First keyboard test
You load a page and want to perform the main task without using the mouse. What should you try first?

A. Press Tab and observe where focus moves.
B. Turn off the monitor.
C. Delete all buttons.
D. Resize the page to 10px wide.

**Review key:** A
**Feedback after submit:** Tab is a practical first check for moving focus through common interactive elements.

## Focus is location
When the keyboard moves through controls, the user needs to know which control currently has focus. Removing the visible focus indicator can make the interface feel as if the keyboard is “doing nothing.”

## Do not erase focus without a replacement
```css
button:focus {
  outline: none;
}
```

## What is wrong?
What is the main problem with the CSS above if it is used without providing another clear focus style?

A. The button becomes too wide.
B. Keyboard users may lose the visual signal showing which control has focus.
C. The browser stops parsing HTML.
D. The button becomes a link.

**Review key:** B
**Feedback after submit:** A visible focus indication is important. If you replace the browser’s default focus style, replace it with a clear alternative rather than simply removing it.

## A visible alternative
```css
button:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
```

## Tiny keyboard route
Try this sequence on a small page: Tab from the top, name each control as it receives focus, then activate the main action without using the mouse. If you cannot tell where you are, stop and investigate the focus state.

## Checkpoint
What makes a control keyboard-accessible?

A. It only responds to a mouse click.
B. It can be reached and meaningfully operated through the keyboard.
C. It has a bright color.
D. It has a large border.

**Review key:** B
**Feedback after submit:** Keyboard accessibility concerns both reachability and operation, not appearance alone.

## Hints for the lab
Hint 1: Start with Tab.

Hint 2: Look for a visible focus indicator.

Hint 3: Check whether every important control can be reached and activated without a mouse.

## Forge takeaway
Mental model: Focus is the user’s current location in the keyboard interaction path.

Senior habit: Never trust a page you tested only with a mouse.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---

# 1.4.8 — Color, Contrast, and More Than Color
**Estimated time:** 13 minutes  
**Learner goal:** Use color as support rather than the only carrier of meaning and recognize why text and controls need sufficient contrast.

## Start here
Color can help people scan a page, but color should not be the only way important information is communicated. A red message that means “error” is weaker if red is the only clue.

## Meaning without color
A dashboard marks errors only with red text. What is the better design?

A. Make the red even brighter.
B. Add another meaningful cue such as an icon, text, or clear status label.
C. Remove the message.
D. Use only green instead.

**Review key:** B
**Feedback after submit:** Important meaning should remain available without depending on color alone.

## Contrast as a reading question
Text needs enough contrast against its background to remain readable. Contrast is not a “nice-looking palette” problem. It is a perception problem.

## Prediction
A designer puts light gray body text on a white background because it looks subtle. What should you ask first?

A. Whether the text remains sufficiently distinct from the background for people to read.
B. Whether the CSS file is named correctly.
C. Whether the button can open another page.
D. Whether the paragraph contains exactly 20 words.

**Review key:** A
**Feedback after submit:** Readability comes before subtle visual styling. Contrast is part of whether users can perceive the content.

## States must also be clear
Interactive controls have states such as normal, focused, selected, disabled, or error. Those states should not become indistinguishable when color changes are ignored.

## State with more than color
```html
<p class="status error">Error: Enter a valid email address.</p>
```

## Checkpoint
Why is the text in the status example useful?

A. It communicates the error without requiring the user to interpret a color.
B. It makes CSS unnecessary.
C. It guarantees every user will agree on the design.
D. It makes the page responsive.

**Review key:** A
**Feedback after submit:** The words carry the meaning. Color can reinforce the message, but the meaning survives without it.

## Tiny lab
Take a page with one success state and one error state. Rewrite each state so its meaning is explicit in words. Then use color as reinforcement rather than the only signal.

## Forge takeaway
Mental model: Color is a channel, not the whole message.

Senior habit: Ask what remains when color is removed, contrast is reduced, or the page is zoomed.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---

# 1.4.9 — Accessibility Investigation: Test the Real Path
**Estimated time:** 15 minutes  
**Learner goal:** Run a focused accessibility investigation by testing the main task with meaningful content, keyboard interaction, and clear labels and states.

## Start here
An accessibility review is strongest when it follows the user’s real task. Do not scan the whole page for random problems first. Pick the task, then test the path.

## Investigation route
Use this sequence:

1. Identify the main task.

2. Read the page structure and controls.

3. Try the task with the keyboard.

4. Check labels and instructions.

5. Check whether important meaning survives without color.

6. Record the earliest barrier you hit.

## Case 1
A registration form has an email field with no visible label, but the placeholder says “Email”. What should you investigate?

A. Whether the field has a clear persistent label that identifies its purpose.
B. Whether the background is blue.
C. Whether the page has a logo.
D. Whether the form has 3D shadows.

**Review key:** A
**Feedback after submit:** A placeholder should not be the only durable identification for the field.

## Case 2
A “Continue” button is visible, but pressing Tab never reaches it. What is the first investigation?

A. The page title
B. Keyboard reachability and focus order
C. The image alt text
D. The card border radius

**Review key:** B
**Feedback after submit:** The task is blocked by keyboard access, so investigate focus and reachability first.

## Case 3
A payment error is displayed only with a red border around the input. What should change?

A. Add a clear textual error or instruction so the meaning is not carried by color alone.
B. Make the border thinner.
C. Remove the field label.
D. Change the page to dark mode.

**Review key:** A
**Feedback after submit:** The user needs the error meaning in a form they can perceive and understand without depending on color.

## Repair order
Do not fix everything at once. Pick the earliest barrier that blocks the task. Repair it, retest the path, then continue. This keeps your investigation causal instead of random.

## Explain the method
Complete: “A good accessibility investigation follows the user’s ________ and looks for the earliest ________.”

**Suggested answer:** main task; barrier
**Feedback after submit:** The point is to test the real path and find the earliest obstacle instead of collecting disconnected cosmetic issues.

## Forge takeaway
Mental model: Accessibility testing is task testing.

Senior habit: Test the path a person actually needs to complete, not just the parts that are easiest to inspect.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---

# 1.4.10 — Forge Mission: Repair the Interface for More People
**Estimated time:** 18 minutes  
**Learner goal:** Independently repair a small page with semantic, labeling, keyboard, focus, image, and color barriers, then explain why each repair matters.

## Mission briefing
You inherit a tiny account page. It looks polished, but several choices make the main task harder for some users.

Your job is not to make it “more accessible” by guessing. Identify each barrier, make the smallest justified repair, then verify the same user path again.

## Starting HTML
```html
<main class="account">
  <div class="title">Account settings</div>

  <img src="avatar.png" class="avatar">

  <div class="save">Save changes</div>

  <form>
    <input type="email" placeholder="Email">
    <p class="hint">Use your work email.</p>
  </form>

  <p class="error-message">Error</p>
</main>
```

## Mission requirements
1. Give the page its correct heading semantics.

2. Make the image understandable for its purpose.

3. Replace the fake action control with a native button.

4. Give the email field a real label.

5. Keep the useful instruction about the email field.

6. Make the error message meaningful in words.

7. Preserve a visible focus indication for keyboard users.

8. Do not rely on color alone for the error state.

## Step 1 — Repair meaning
Replace the generic page title with an actual heading element. Choose a level that represents the page title.

## Hint 1
Ask: “Is this content acting as the page’s main heading?”

## Hint 2
The page title should be represented by h1.

## Step 2 — Repair the image
Decide whether the avatar contributes information. If the image identifies the account owner, write short alternative text that identifies the person or purpose. If it is purely decorative, do not add meaningless description.

## Step 3 — Repair the action
Turn the Save control into a real button. Do not solve the problem with more styling.

## Hint 1
Use the native element that represents an action.

## Hint 2
You already used this rule in Lesson 1.4.2.

## Step 4 — Repair the form
Add a visible label and associate it with the input. Keep the useful instruction next to the field.

## One strong repair
```html
<label for="email">Work email</label>
<p id="email-help">Use your work email.</p>
<input id="email" name="email" type="email">
```

## Step 5 — Repair the error
Rewrite the error so the user knows what happened and what to do next. Make the message meaningful even if the color is removed.

## Clear error copy
```html
<p class="error-message">Enter a valid work email address.</p>
```

## Step 6 — Verify the keyboard path
Start at the top of the page and press Tab. You should be able to reach the interactive controls, see where focus is, and identify the current field or button without using the mouse.

## Step 7 — Explain your repairs
Write one sentence for each repair explaining the barrier it removed. Your explanations should use the concepts from this module: semantics, labels, instructions, keyboard access, focus, image purpose, and meaning beyond color.

## Mastery gate
You have completed the mission when you can repair the page without copying a solution, verify the main task by keyboard, and explain why each repair matters to the person using the interface.

## Forge takeaway
The goal is not to memorize a list of accessibility tricks. The goal is to see the interface as a system of information and actions that must remain usable across different ways of perceiving and operating it.

Senior habit: Accessibility is part of engineering quality. Build the barrier out instead of adding a patch after the fact.

### Lesson completion
Complete the exercises, explain your reasoning, and verify the interface using the user path named in the lesson.

---