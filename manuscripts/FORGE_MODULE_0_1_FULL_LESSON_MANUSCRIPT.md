# Forge Curriculum v2
## Module 0.1 — The Web as a System
### Full Lesson Manuscript — Leakage-Corrected Revision

> **Purpose:** This is the actual lesson manuscript for review. It is written as the learner would experience it. Review keys and hints are included only so the lesson can be audited before JSON generation.

### Module outcome
By the end of this module, the learner can trace a page from user action to rendered result, explain the browser/server boundary, distinguish HTML/CSS/JavaScript responsibilities, and identify the earliest changed boundary when something breaks.

### Lesson sequence
1. **A Website Is a Conversation** — request/response
2. **The Browser Has a Job** — browser responsibilities
3. **Three Languages, Three Jobs** — HTML/CSS/JavaScript
4. **From Address to Page** — page-load trace
5. **What Is Running Where?** — browser/server boundary and trust
6. **Trace the Page** — integrated investigation and mastery

---
# 0.1.1 — A Website Is a Conversation
**Estimated time:** 10 minutes  
**Learner goal:** Understand the web as an exchange: a browser asks for a resource, a web service sends something back, and the browser uses what it receives.

## 1. Start here

You type an address into a browser. A moment later, something appears on the screen.

It feels like the page simply appeared. It did not.

A useful first model is:

**You ask. The web answers. The browser uses the answer.**

That is enough for now. You do not need protocol details yet.

## 2. Quick prediction

You open `https://example.com` and something appears.

Which statement best describes what happened?

A. The browser already contained the page, so it simply revealed it.
B. The browser asked for something and received information it could use.
C. The web service reached into your computer and drew the page directly.
D. The operating system invented the page after the browser asked for it.

**Review key:** B

**Feedback:** The useful model is ask → receive → use. The browser is not simply revealing a page that was already sitting on the screen.

## 3. The exchange

A **request** is a message asking for a resource or action.

A **response** is what comes back.

A response might contain a page, an image, data, or an error. The important idea is the exchange itself.

For now, picture this:

```text
Browser  →  request  →  web service
Browser  ←  response ←  web service
```

One visit can involve more than one request. We will come back to that later.

## 4. Which response?

You ask for a resource. The web service sends back an error saying the resource was not found.

What does that tell you?

A. No request happened.
B. A response came back, but it reported a problem.
C. The browser stopped existing.
D. The web service stopped existing.

**Review key:** B

**Feedback:** An error is still a response. The exchange happened; the result just was not the result you wanted.

## 5. Predict before the reveal

Suppose one requested resource arrives successfully, but another requested resource returns an error.

What is the best prediction?

A. Every other request must fail too.
B. The browser can still use the successful resource, while the failed resource may affect part of the final result.
C. The original request disappears.
D. The browser can no longer receive responses.

**Review key:** B

**Feedback:** Requests can succeed or fail independently. A single failed resource changes what the browser has available to work with.

## 6. Say it in your own words

Complete this sentence without using the words “request” or “response”:

“When a browser gets something from the web, it first ________, then it ________, and then it ________.”

**Suggested answer:** “asks for information, receives information, and uses that information.”

## 7. Checkpoint

A developer says:

> “A website is just a file sitting somewhere on the web. The browser downloads it, and that is basically the whole story.”

What is missing?

A. Nothing.
B. The exchange between the browser and the web service, plus the fact that a page can involve multiple resources.
C. Only the page color.
D. The name of the developer who built the page.

**Review key:** B

**Feedback:** The file metaphor is incomplete. A web page is part of an exchange, and the browser can need additional resources to produce the final result.

## 8. Forge takeaway

**Mental model:** The web is an exchange of information. A browser asks for something, receives a response, and uses that response to do work.

**Senior habit:** When something goes wrong, ask: **What was requested? What came back?**

### Lesson completion
The learner should be able to explain the exchange in plain language and correctly reason about a successful resource versus a failed resource.

---
# 0.1.2 — The Browser Has a Job
**Estimated time:** 12 minutes  
**Learner goal:** Understand that the browser is active software that receives information, interprets it, builds a page representation, produces visible output, and responds to user input.

## 1. The browser is not a picture frame

A browser does more than display whatever arrives from the web.

It receives information. It interprets instructions. It builds a representation of the page. It decides how that page should be arranged for the current screen. It produces the pixels you see. It reacts when you click, type, scroll, or otherwise interact with the page.

You do not need the full browser architecture yet. You do need to stop thinking of the browser as passive.

## 2. Prediction: what happens to received information?

The browser receives information describing a page.

What is the browser's job?

A. Interpret the information and turn it into something it can display and interact with.
B. Ask a designer to draw the result manually.
C. Store the information without processing it.
D. Send the information to your monitor without processing it.

**Review key:** A

**Feedback:** The browser is an active runtime. It interprets what it receives and produces an interactive result.

## 3. Change one thing

Imagine the browser receives instructions describing a large title and a paragraph beneath it.

Now imagine the instructions change so that the title is represented as a smaller heading.

What should change?

A. The browser stops working.
B. The page structure and resulting presentation can change because the instructions changed.
C. The keyboard becomes part of the page.
D. The monitor creates a new page on its own.

**Review key:** B

**Feedback:** The browser is interpreting different instructions, so the visible result can change even when the words are similar.

## 4. Tiny browser experiment

Imagine a page whose received instructions say:

```text
TITLE: Browser Job
BODY: The browser turns instructions into an interface.
```

Now change only `TITLE` to:

```text
TITLE: Browser Work
```

Predict the result before the reveal.

**Expected result:** The visible title changes, while the rest of the page can remain the same.

**Why:** The browser is processing instructions, not simply showing an image.

## 5. The browser handles interaction

A user clicks a control and the text already on the page changes without navigating away.

Which explanation best fits our model?

A. The browser can process interaction and update the visible page.
B. The monitor sends a message to a designer.
C. The browser becomes the page storage.
D. The operating system rewrites the web application.

**Review key:** A

**Feedback:** The browser is the software running the interface. It can respond to user input and update what is visible.

## 6. Predict the visible result

The page currently shows:

```text
Status: Waiting
```

A piece of behavior running in the browser changes that visible text to:

```text
Status: Done
```

What should the learner predict?

A. The browser can display the changed text.
B. The browser must reboot the computer.
C. The original page can never change after the first render.
D. The page can never change visible text after the first display.

**Review key:** A

**Feedback:** The browser is not frozen after the first render. It can update the interface as behavior runs.

## 7. Four browser jobs

For this level, use four simple jobs:

1. **Receive** information.
2. **Interpret** instructions.
3. **Produce** the visible page.
4. **Respond** to user interaction.

This is not the complete browser architecture. It is a practical model for predicting behavior.

## 8. Checkpoint

Which explanation gives you a place to investigate when a page looks wrong?

A. “The browser is weird.”
B. “The browser received information, interpreted it, produced this result, and reacted to input. Which part is behaving differently than expected?”

**Review key:** B

**Feedback:** The second explanation gives you concrete places to look.

## 9. Forge takeaway

**Mental model:** The browser is an active runtime, not a picture frame.

**Senior habit:** When debugging a visible problem, ask: **Which browser job produced the wrong result?**

### Lesson completion
The learner should be able to describe the browser as an active runtime and explain why a page can change after it first appears.

---
# 0.1.3 — Three Languages, Three Jobs
**Estimated time:** 15 minutes  
**Learner goal:** Understand the primary responsibilities of HTML, CSS, and JavaScript and predict which language should change when a requirement changes.

## 1. Three tools, three jobs

Frontend work becomes easier to reason about when you separate responsibilities.

**HTML → structure and meaning**  
**CSS → presentation and layout**  
**JavaScript → behavior and changing state**

They work together. They are not interchangeable jobs.

## 2. Which tool?

You want the page to contain the text “Sign in” as a button label.

Which language is the most direct place to put that static structure and content?

A. HTML
B. CSS
C. JavaScript is required every time
D. No language is involved

**Review key:** A

**Feedback:** Static page structure and content belong in HTML.

## 3. Which tool?

You want the button to have rounded corners and more space inside it.

A. HTML
B. CSS
C. JavaScript
D. No language is involved

**Review key:** B

**Feedback:** Rounded corners and spacing are presentation concerns, so CSS is the direct tool.

## 4. Which tool?

You want clicking the button to change the text from “Save” to “Saved”.

A. HTML alone
B. CSS alone
C. JavaScript
D. The browser cannot change the page after the first display

**Review key:** C

**Feedback:** This requirement is behavior: something should happen because the user interacted with the page.

## 5. Build a tiny interface

Start with:

```html
<button id="saveButton">Save</button>
<p id="status">Not saved</p>
```

**Step 1 — HTML:** Keep the button and status text.

**Step 2 — CSS:** Give the button rounded corners and 8px padding.

```css
button {
  border-radius: 8px;
  padding: 8px;
}
```

**Step 3 — JavaScript:** Make clicking the button change the status to “Saved”.

```js
document.querySelector("#saveButton").addEventListener("click", () => {
  document.querySelector("#status").textContent = "Saved";
});
```

Three small pieces are doing the work:

- `querySelector("#saveButton")` finds the button.
- `addEventListener("click", ...)` waits for the button to be clicked.
- `textContent = "Saved"` changes the text in the status element.

You do not need to memorize the method names yet. The important idea is that JavaScript can listen for an interaction and change the page.

**What changed where?** HTML gave the interface structure. CSS changed presentation. JavaScript changed behavior.

## 6. Remove one layer

The HTML remains, but the CSS is removed. What is the best prediction?

A. The page structure can remain, but the custom visual styling disappears.
B. JavaScript stops existing.
C. The button becomes a different kind of page element.
D. The browser can no longer interpret HTML.

**Review key:** A

**Feedback:** CSS controls presentation. Removing it does not erase the HTML structure.

## 7. Remove a different layer

Now remove the JavaScript, but keep the HTML and CSS. What should you expect?

A. The button and styles can remain, but the click behavior described by the script no longer happens.
B. The page becomes impossible to display.
C. CSS automatically becomes behavior.
D. The browser refuses to respond to clicks.

**Review key:** A

**Feedback:** The three languages cooperate, but each has a primary responsibility.

## 8. Checkpoint

Match each requirement to the most direct tool:

1. “This heading should be an `<h1>`.”
2. “This card should use a two-column layout.”
3. “Clicking this button should hide the panel.”

A. HTML → CSS → JavaScript
B. CSS → JavaScript → HTML
C. JavaScript → HTML → CSS
D. HTML → JavaScript → CSS

**Review key:** A

**Feedback:** Structure → HTML. Presentation/layout → CSS. Behavior → JavaScript.

## 9. Forge takeaway

**Mental model:** HTML describes what the interface is. CSS describes how it is presented. JavaScript describes what it does and how it can change.

**Senior habit:** When a requirement changes, first ask: **Which responsibility changed?**

### Lesson completion
The learner should correctly classify structure, presentation, and behavior changes and explain why the three languages are complementary rather than interchangeable.

---
# 0.1.4 — From Address to Page
**Estimated time:** 13 minutes  
**Learner goal:** Trace a simplified page-load sequence from entering a URL through request, response, resource processing, and rendered output.

## 1. A page is a chain of events

Now that you know the browser and the three frontend languages, we can connect them to the page-load story.

A simplified trace is:

**1. Enter a URL → 2. Browser makes a request → 3. A response arrives → 4. Browser processes the received resources → 5. Browser renders the result**

Real browsers do more work, and many steps can happen in parallel. This model is simplified on purpose.

## 2. Put the trace in order

Arrange these events from first to last:

A. Browser renders the interface.
B. A response arrives.
C. You enter the URL.
D. Browser makes a request.
E. Browser processes the received resources.

**Review key:** C → D → B → E → A

**Feedback:** Start with the user action, then request, response, browser work, and visible result.

## 3. What kind of resources?

The initial response can lead the browser to obtain resources for the page. In a typical frontend application, those resources can include HTML, CSS, JavaScript, images, and data.

Which responsibility maps most directly to each?

A. HTML → structure; CSS → presentation; JavaScript → behavior.
B. HTML → presentation; CSS → behavior; JavaScript → structure.
C. HTML → behavior; CSS → structure; JavaScript → presentation.
D. All three do exactly the same thing.

**Review key:** A

**Feedback:** You can now connect the language responsibilities to the page-load trace.

## 4. One link changes

You are on a page and click a link to another page.

What should you expect?

A. The browser needs information for the new destination, so another request/response cycle can begin.
B. The browser forgets how to render pages.
C. CSS becomes a different type of content.
D. The keyboard sends the page directly to the internet without the browser.

**Review key:** A

**Feedback:** Navigation can trigger another exchange for the new resource.

## 5. Missing stylesheet

The HTML arrives. The stylesheet request fails.

What is the most reasonable prediction?

A. The browser may still have the page structure, but the intended styling is missing or incomplete.
B. The browser can no longer parse any HTML.
C. JavaScript turns into CSS automatically.
D. The computer loses internet access permanently.

**Review key:** A

**Feedback:** The failed stylesheet is a failed resource. The browser can still work with what it successfully received.

## 6. Missing script

The HTML and CSS load correctly, but the JavaScript resource fails to load.

What is the best prediction?

A. The structure and styling can appear while the behavior provided by that script does not run.
B. The monitor turns off.
C. CSS becomes JavaScript.
D. Every request made by the browser must now fail.

**Review key:** A

**Feedback:** Different resources contribute different capabilities to the final interface.

## 7. Checkpoint

Explain this sequence in one sentence:

“URL entered → request → response → resource processing → rendering.”

**Strong answer:** “The browser asks for a resource, receives information, processes what it got, and turns that information into the interface the user sees.”

## 8. Forge takeaway

**Mental model:** A page is the visible result of a chain of events and resources, not a magical object that appears all at once.

**Senior habit:** When debugging page load, find the earliest step that differs from the expected trace.

### Lesson completion
The learner should be able to trace a simplified load and explain how HTML, CSS, and JavaScript contribute different pieces of the final result.

---
# 0.1.5 — What Is Running Where?
**Estimated time:** 15 minutes  
**Learner goal:** Distinguish browser-side work from server-side work and recognize the trust boundary between them.

## 1. Not everything happens in the browser

The browser does real work. That does not mean it does all the work.

A useful first boundary is:

**Browser:** receives resources, renders the interface, handles user interaction, and runs JavaScript in the browser.

**Server:** can receive requests, apply application rules, access protected data, and send responses.

Architectures vary, but the basic engineering question is stable: **Where is this operation actually happening?**

## 2. Where does the response come from?

A user clicks “Load profile.” The browser sends a request, and profile data comes back.

Which side of the exchange supplies that response?

A. The monitor
B. The server side of the exchange
C. CSS
D. The keyboard

**Review key:** B

**Feedback:** The browser initiates the request. A server or web service can process the request and send back the response.

## 3. A trust boundary

Which statement is safest?

A. Anything delivered to browser JavaScript should be treated as secret.
B. Browser code can always be trusted because it came from your server.
C. Code and data delivered to the browser should be assumed observable and controllable by the user.
D. Users cannot inspect browser code.

**Review key:** C

**Feedback:** Once code is delivered to the browser, the user can inspect and manipulate the environment in which it runs. Do not rely on browser secrecy for secrets or privileged decisions.

## 4. Where should the rule live?

You are building an invoice page. A user should only be able to view an invoice they are authorized to access.

Which design is safer?

A. Hide the invoice button for unauthorized users and make no server check.
B. Enforce authorization on the server. The browser can also hide or disable the UI for a better experience.
C. Use CSS to enforce authorization.
D. Put a secret value in JavaScript and trust the browser to protect it.

**Review key:** B

**Feedback:** UI controls improve the experience. Security-sensitive authorization must be enforced on the server side of the operation.

## 5. Trace the boundary

Case:

1. The browser handles the click.
2. The browser sends a request.
3. The server evaluates the request.
4. The server refuses the operation because the user is not authorized.
5. The browser receives the result and can show an error message.

Where did the security decision happen?

A. In CSS
B. In the browser button
C. On the server
D. On the monitor

**Review key:** C

**Feedback:** The browser initiated the operation. The server enforced the authorization rule.

## 6. Move the decision

What becomes dangerous if authorization exists only as:

> “If the button is visible, the user is allowed to delete.”

A. Browsers cannot show buttons.
B. A user can potentially bypass the interface and send the underlying request directly.
C. HTML becomes invalid.
D. CSS stops loading.

**Review key:** B

**Feedback:** A visible control is not a security boundary. The underlying operation needs server-side enforcement.

## 7. Checkpoint

Complete this explanation:

“The browser is responsible for ________. The server may be responsible for ________. Security-sensitive authorization must be enforced by ________.”

**Suggested answer:** “The browser is responsible for the interface and client-side behavior. The server may be responsible for application rules and protected data. Security-sensitive authorization must be enforced by the server.”

## 8. Forge takeaway

**Mental model:** Browser and server cooperate, but they do not share the same trust level or responsibilities.

**Senior habit:** When a rule matters for security, ask: **What prevents someone from bypassing this UI and calling the underlying operation directly?**

### Lesson completion
The learner should correctly place common work on the browser/server boundary and explain why hiding a control is not authorization.

---
# 0.1.6 — Trace the Page
**Estimated time:** 18 minutes  
**Learner goal:** Integrate the module model by tracing user action, browser work, requests/responses, resources, rendering, client-side behavior, and the server boundary.

## 1. Forge Mission

You are investigating a page that used to work.

After an update, users report:

> “The dashboard opens, but the styles are missing and the Save button does nothing.”

You are not allowed to guess. Your job is to trace the system.

## 2. Build the initial trace

Arrange these pieces into a useful causal trace:

A. Browser renders the interface.
B. Browser sends a request for the dashboard document.
C. User enters the dashboard URL.
D. Browser receives the document response.
E. Browser requests the stylesheet and JavaScript resources needed for the page.

**Review key:** C → B → D → E → A

**Feedback:** Start at the user action, then the request, response, resource retrieval, and final browser output.

## 3. Case 1 — Missing styles

Given the symptom “dashboard content appears, but styles are missing,” which investigation should happen first?

A. Rewrite all HTML.
B. Inspect whether the stylesheet request succeeded and whether the browser received usable CSS.
C. Rewrite the button JavaScript.
D. Change the user's monitor settings.

**Review key:** B

**Why:** The earliest clue points to the stylesheet boundary. Investigate the resource request/response before changing unrelated code.

**Hint 1:** What resource is responsible for presentation?
**Hint 2:** Did the browser receive and use it?
**Hint 3:** Start at the stylesheet request/response.

## 4. Case 2 — Button does nothing

The page is styled correctly, but clicking Save produces no visible change.

Which investigation order is most sensible?

A. Check the CSS color, then the server database, then the keyboard.
B. Check whether the browser loaded the JavaScript, whether the click behavior is connected, and whether the browser-side code runs as expected.
C. Replace the entire page.
D. Assume the server is broken before checking the browser-side path.

**Review key:** B

**Feedback:** The symptom is a client-side interaction problem. Start with the browser-side code path that should react to the click.

## 5. Case 3 — Delete is visible

The Delete button is hidden for non-admin users. A developer says:

> “Security problem solved.”

What is your response?

A. Correct. A hidden button means the action cannot happen.
B. Not enough. The server must enforce authorization even if the UI hides the button.
C. CSS should perform the authorization.
D. The browser should contain the admin password.

**Review key:** B

**Feedback:** The UI can guide users, but it does not establish authorization.

## 6. Final trace challenge

Write a 5–7 sentence explanation for this page:

> “A user opens `/dashboard`. The dashboard page appears. A stylesheet request fails. The Save button has JavaScript attached, but the server returns an authorization error when saving.”

Your explanation should identify:

- what the browser requested,
- what resource failure explains the visual problem,
- what work happens in the browser,
- what work crosses to the server, and
- why a visible button is not proof of authorization.

**Reference answer:** “The user enters the dashboard URL, so the browser requests the dashboard resource. The dashboard response arrives and the browser renders the document. The stylesheet request fails, so the browser has the structure but not the intended presentation. The Save behavior can run in the browser, but saving crosses the browser/server boundary when it sends a request. The server evaluates whether the operation is allowed and returns an authorization error. The presence of a visible button does not prove the user is authorized because the server must enforce that rule.”

**Feedback:** A strong response traces the earliest changed resource, separates browser behavior from server behavior, and treats authorization as a server-enforced concern.

## 7. New surface, same model

You are now looking at an image gallery instead of a dashboard.

One image is broken. Another loads but appears stretched. A “Favorite” button changes to “Saved” locally but does not persist after refresh.

Choose the best first investigation for each symptom:

1. **Broken image** → check the image resource request/response.
2. **Stretched image** → check how the browser is laying out/rendering the received image.
3. **Favorite does not persist** → trace what the browser changed locally and the request that should save it, then inspect the server response.

The surface changed. The reasoning model did not.

## 8. Module mastery gate

You are ready to leave Module 0.1 when you can do all three without copying the previous answers:

**1. Trace:** Explain the path from user action to visible result.

**2. Diagnose:** Identify the earliest changed boundary when a symptom appears.

**3. Explain:** Distinguish browser-side work from server-side work and explain why security-sensitive authorization must be enforced on the server.

**Final reflection:** What changed in how you think about a “web page” after this module?

## 9. Forge takeaway

**The page is a system.** The user triggers events. The browser runs work. The browser exchanges information with servers. Resources arrive. The browser processes them. The final interface is the visible consequence of those steps.

**Senior habit:** Do not ask **“What looks broken?”** first. Ask **“What was the first step that stopped behaving as expected?”**

### Lesson completion
The final mission is the module mastery evidence. Completion should require a successful trace, correct diagnosis of changed boundaries, and a clear explanation of the browser/server trust boundary.
