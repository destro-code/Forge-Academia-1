# FORGE LESSON EXPERIENCE BLUEPRINT V1

Status: Draft for approval
Purpose: Define how a Forge lesson becomes an actual interactive learning experience.

---

# 1. PURPOSE

The Lesson Map defines:

> What the learner needs to learn.

This document defines:

> How Forge teaches it.

A lesson must not be generated as a collection of content blocks.

It must be designed as an experience.

The learner should continually move through:

DISCOVER
↓
UNDERSTAND
↓
PREDICT
↓
INTERACT
↓
PRACTICE
↓
CHALLENGE
↓
DEBUG
↓
EXPLAIN
↓
TRANSFER

Not every lesson needs every stage.

The sequence is a design vocabulary, not a rigid template.

---

# 2. THE PRIMARY QUESTION

Before authoring any lesson, answer:

> What is the learner actually doing?

If the answer is primarily:

- reading
- watching
- clicking Next
- answering trivia

the lesson is probably under-designed.

The preferred answer is something like:

- predicting behavior
- manipulating a system
- inspecting evidence
- modifying code
- tracing execution
- diagnosing a failure
- building a feature
- making a technical decision
- explaining a mechanism

---

# 3. LESSON CONTRACT

Every lesson must define:

```text
LESSON ID
TITLE
ROLE
PRIMARY CAPABILITY
SECONDARY CAPABILITIES
PREREQUISITES
STARTING STATE
TARGET STATE
CORE CONCEPTS
LEARNER ACTIONS
EVIDENCE
GUIDANCE LEVEL
DIFFICULTY
ACTIVITY SEQUENCE
MASTERY SIGNAL
TRANSFER OPPORTUNITY
```

---

# 4. STARTING STATE

Every lesson begins with an explicit model of what the learner already knows.

Define:
- **Learner knows**: What concepts can safely be assumed?
- **Learner can do**: What capabilities can safely be assumed?
- **Learner probably believes**: What misconceptions are likely?
- **Learner does not yet know**: What must NOT be assumed?

This prevents lessons from silently depending on knowledge that has never been established.

---

# 5. TARGET STATE

Every lesson must define the learner's intended post-lesson capability.

Use:
> After this lesson, the learner can...

Not:
> After this lesson, the learner understands...

*"Understand"* is too vague.

**Examples:**
- **Weak**: Learner understands flexbox.
- **Strong**: Learner can predict how changing the main-axis alignment affects the position of flex items.
- **Stronger**: Learner can inspect a flex layout, predict the effect of a layout change, make the change, and explain why the resulting positions changed.

---

# 6. CORE MENTAL MODEL

Each lesson should establish one primary mental model.

**Examples:**
- **CSS**: Multiple declarations compete, and the cascade determines which one wins.
- **DOM**: The browser represents document structure as a tree of related nodes.
- **JavaScript**: Function calls create execution contexts and determine where variables are resolved.
- **Async**: Starting asynchronous work does not mean the rest of the program stops.
- **React**: Rendering describes UI from current inputs and state.
- **Architecture**: Boundaries determine where responsibilities and changes are contained.

The mental model should explain observable behavior.

---

# 7. DISCOVERY BEFORE EXPLANATION

When practical, let the learner encounter the behavior before explaining it.

**Instead of:**
> Flexbox uses `justify-content` to align items along the main axis.

**Prefer:**
1. Show a layout.
2. Ask what will happen if a property changes.
3. Let learner predict.
4. Apply the change.
5. Show the result.
6. Ask why.
7. Introduce the mental model.

This creates a reason for the explanation to exist.

---

# 8. THE EXPERIENCE ARC

A typical Forge lesson may follow:

## 8.1 Encounter
Something interesting happens. The learner sees:
- a behavior
- a system
- a visual
- a bug
- an unexpected result

*Purpose*: Create curiosity.

## 8.2 Prediction
Ask: *What do you think will happen?*
Prediction should happen before revealing the answer whenever practical.

*Possible formats*: multiple choice, output prediction, ordering, visual prediction, code prediction, state prediction, architecture prediction.

Prediction creates a measurable mental model.

## 8.3 Interaction
Let the learner manipulate the system.

*Examples*: drag, toggle, change CSS, modify code, reorder operations, alter values, inspect DOM, inspect network request, trigger an event.

The interaction should expose cause and effect.

## 8.4 Explanation
Only after useful experience has been created should Forge provide the conceptual explanation.

Explanation should answer:
- What happened?
- Why did it happen?
- What rule explains it?
- How can the learner use that rule elsewhere?

## 8.5 Practice
The learner applies the mental model. Practice should vary the surface form.

Do not simply repeat: *Change property X*. Instead vary values, context, surrounding constraints, layout, data, code structure, expected result.

## 8.6 Challenge
Reduce assistance. The learner must solve a problem using the capability.

## 8.7 Failure
Where useful, deliberately create an opportunity to be wrong. Failure is valuable when it produces evidence.

The system should allow:
> "I thought this would happen." → "It didn't. Why?"

## 8.8 Debug
For debugging-oriented lessons:
```text
OBSERVE → REPRODUCE → INSPECT → HYPOTHESIS → TEST → FIX → VERIFY
```
Never reduce debugging to: *Find the line with the red underline*.

## 8.9 Explain
The learner explains the mechanism in their own words.

*Possible evidence*: short explanation, annotated code, choose-the-cause, explain-a-prediction, explain-a-fix, compare two approaches.

## 8.10 Transfer
The learner encounters the concept somewhere different.

*Example*: Learns flex alignment in a simple row → Later diagnoses why a navigation bar behaves unexpectedly. The surface changes; the underlying concept remains relevant.

---

# 9. ACTIVITY SELECTION

Activities should be selected because of the learner action they produce, not because Forge has a renderer for them.

- **Explanation**: Use when a mental model needs explicit framing. Avoid long explanations when discovery can establish the model.
- **Visual**: Use for systems that are difficult to understand from static text (DOM, rendering, CSS layout, event propagation, JS execution, scope, closures, async execution, React rendering, state transitions, network flows).
- **Interactive Demonstration**: Use when manipulation reveals cause and effect.
- **Prediction**: Use before revealing behavior.
- **Multiple Choice**: Use when alternatives represent meaningful mental models.
- **Multi-Select**: Use when multiple conditions or causes matter.
- **Ordering**: Use when sequence matters.
- **Fill Blank**: Use sparingly. Prefer reasoning over memorization.
- **Output Prediction**: Use heavily for JS, async behavior, DOM manipulation, React rendering.
- **Code Modification**: Use when the learner should manipulate an existing implementation.
- **Interactive Coding**: Use when the learner should construct behavior.
  - Progression: `GUIDED → CONSTRAINED → ASSISTED → INDEPENDENT → OPEN-ENDED`
- **Debugging**: Use when the capability requires diagnosis.
- **Reflection**: Use when the learner needs to consolidate a mental model.
- **Judgment**: Use when multiple solutions are technically possible.

---

# 10. ACTIVITY SEQUENCING

Do not automatically produce: `Explanation → Explanation → Quiz → Quiz → Code → Congratulations`.

Instead construct an experience:
```text
Encounter → Prediction → Manipulation → Explanation → Prediction → Practice → Failure → Debug → Explanation → Transfer
```

---

# 11. VISUAL-FIRST RULE

If the learner cannot easily see the mechanism, consider making it visible.

- **DOM**: `HTML → DOM Tree → selected node → relationship`
- **CSS**: `element → box model → constraints → final position`
- **Events**: `event target → capture → target → bubble`
- **JavaScript**: `code → call stack → scope → values → result`
- **Async**: `synchronous work → queued work → event loop → callback → result`
- **React**: `state/props → render → UI → interaction → state update → render`

Visuals should expose mechanisms, not decorate the page.

---

# 12. INTERACTION QUALITY

Every interactive element must have a learning purpose.
- **Good interaction**: Drag the threshold and observe which predictions change.
- **Weak interaction**: Click this cool animated button.
- **Good interaction**: Change the width and observe when the layout wraps.
- **Weak interaction**: Rotate the 3D cube.

---

# 13. PREDICTION DESIGN

Prediction is one of Forge's most important mechanisms. A prediction should be meaningful, testable, tied to a mental model, and followed by observable evidence.

After prediction, Forge should reveal:
- **Prediction**: What did you think would happen?
- **Reality**: What actually happened?
- **Difference**: Where did your mental model diverge?
- **Explanation**: What rule explains the result?

---

# 14. FAILURE DESIGN

Failure should never feel like punishment. When a learner fails:
- **Avoid**: Wrong! Try again.
- **Prefer**: Not quite. (Provide evidence: *The button moved, but not because of the property you changed. Look at its containing block.*)

---

# 15. HINT SYSTEM

Hints should be progressive:
1. **Hint 1 — Direction**: Point toward the relevant system. (*Look at the element's parent.*)
2. **Hint 2 — Specific Area**: Point toward a concrete source. (*Inspect the computed position and containing block.*)
3. **Hint 3 — Concept**: Name the relevant mental model. (*Absolutely positioned elements are positioned relative to a containing block.*)
4. **Hint 4 — Resolution**: Explain the cause. (*The parent isn't establishing the containing block you expected.*)

---

# 16. FEEDBACK SYSTEM

Feedback has four possible layers:
- **Layer 1 — Result**: Correct / incorrect.
- **Layer 2 — Observation**: What actually happened.
- **Layer 3 — Mechanism**: Why it happened.
- **Layer 4 — Generalization**: How the learner can use this knowledge elsewhere.

---

# 17. HUMOR IN EXPERIENCE

Humor must reinforce the learning moment.
- *CSS debugging*: "Why is this style winning?"
- *After a bad hypothesis*: "The browser disagrees."
- *After repeated layout manipulation*: "You have now bullied the box model enough."
- *Debugging*: "Don't guess yet. Look."
- *After finding the cause*: "There it is. The actual culprit."

Humor must never obscure the mechanism or mock the learner.

---

# 18. SERIOUS MODE

Forge should reduce humor when dealing with: security, accessibility failures, production incidents, user data, authentication, authorization, performance consequences, destructive actions, interview simulations, architecture decisions.

---

# 19. CODING EXPERIENCE

Coding activities must have a deliberate level of independence:
- **Level 1 — Guided**: The learner modifies one clearly identified location.
- **Level 2 — Constrained**: The learner chooses among relevant implementation options.
- **Level 3 — Assisted**: The learner receives requirements and partial structure.
- **Level 4 — Independent**: The learner implements the solution with minimal scaffolding.
- **Level 5 — Open-Ended**: The learner determines the implementation.

---

# 20. DEBUGGING EXPERIENCE

A debugging lesson should not reveal the bug location immediately.

Preferred structure:
```text
Symptom → Reproduce → Evidence → Possible causes → Hypothesis → Test → Result → Updated hypothesis → Fix → Verification → Explanation
```

---

# 21. MASTERY SIGNALS

Completion is not mastery. A lesson should define what evidence indicates successful learning: Recognition, Prediction, Manipulation, Implementation, Debugging, Explanation, Transfer, Judgment.

---

# 22. RETRY BEHAVIOR

Retry should preserve useful learner work, remove stale feedback, restore the activity to a meaningful state, and allow another attempt without unnecessary punishment.

---

# 23. PROGRESSIVE DIFFICULTY

Difficulty should increase through multiple dimensions: Conceptual complexity, Guidance, Ambiguity, Debugging complexity, Environment, Communication, Decision demand.

---

# 24. SPIRAL REINFORCEMENT

Important concepts must return across the curriculum (DOM, Functions, State, Debugging) as complexity scales.

---

# 25. TRANSFER DESIGN

Transfer must deliberately change the surface form while retaining the underlying capability mechanism.

---

# 26. LESSON OPENING

Every lesson should earn the learner's attention with a Mystery, Prediction, Manipulation, Challenge, Investigation, or Contradiction. Avoid generic openings like *"In this lesson, we will learn..."*

---

# 27. LESSON CLOSING

Do not end with generic congratulations. Close on demonstrated capability (*"You can now predict how this layout will respond before touching the CSS."*).

---

# 28. LESSON JSON REQUIREMENTS

Every authored lesson JSON must be able to represent: metadata, learning objectives, prerequisites, concepts, capabilities, activities, activity ordering, activity dependencies, validation, feedback, hints, difficulty, guidance level, mastery evidence, completion criteria, transfer, relationships.

---

# 29. AI AUTHORING RULES

AI must NOT invent: curriculum hierarchy, capabilities, prerequisites, conceptual dependencies, mastery standards, lesson role, progression strategy, difficulty progression. Those are defined by Forge architecture.

AI may generate: explanations, examples, activity wording, code examples, scenarios, feedback, hints, visual descriptions, challenge variants.

---

# 30. LESSON QUALITY GATE

Before a lesson is accepted, it must satisfy:
- **Capability**: Primary capability is observable; learner ends with measurable capability.
- **Experience**: Learner performs meaningful actions; prediction and interaction are used effectively.
- **Practice**: Context varies; guidance is appropriate.
- **Failure**: Failure provides evidence; feedback and progressive hints explain mechanism.
- **Mastery**: Evidence demonstrates target capability and transfer.
- **Personality**: Voice sounds like Forge; humor is contextual and respectful.
- **Engineering**: Technical claims are correct; validation is deterministic; accessibility & mobile are considered.

---

# 31. THE FORGE LESSON STANDARD

A good Forge lesson should make the learner think:
> *"I saw something."*  
> → *"I had a theory."*  
> → *"I tested it."*  
> → *"Oh. That's why."*  
> → *"I can change it."*  
> → *"I can use this somewhere else."*  
> → *"I can figure this out myself."*

That is the standard.

