# FORGE CURRICULUM ARCHITECTURE
## Version 1.0

> This document defines the structural architecture of the Forge curriculum.
>
> It determines how knowledge is organized, how learners progress, how concepts are revisited, how lessons relate to one another, and how the curriculum develops engineering ability rather than merely delivering information.
>
> This document is subordinate to:
>
> - FORGE_LEARNING_EXPERIENCE_SPEC_V1.md
> - FORGE_VOICE_AND_HUMOR_BIBLE_V1.md
>
> Any curriculum content that conflicts with those documents MUST be revised.

---

# 1. PURPOSE

Forge is not building a library of frontend lessons.

Forge is building a progression from:

> "I have no idea how this works."

to:

> "I understand the system."

to:

> "I can predict what will happen."

to:

> "I can manipulate it."

to:

> "I can build with it."

to:

> "I can debug it."

to:

> "I can explain my decision."

to:

> "I can figure this out without being told."

The curriculum architecture exists to make that progression intentional.

---

# 2. THE CURRICULUM'S PRIMARY UNIT IS NOT THE LESSON

A lesson is an experience container.

It is not the fundamental unit of learning.

The fundamental unit is the:

> **Capability**

A capability represents something the learner should eventually be able to do.

Examples:

- explain how a browser loads a webpage
- identify the role of HTML, CSS, and JavaScript
- inspect an element using DevTools
- predict the result of CSS selectors
- manipulate the DOM
- trace a JavaScript error
- explain event propagation
- build a responsive interface
- reason about asynchronous behavior
- debug a React rendering problem
- choose an appropriate state-management strategy
- explain a technical trade-off in an interview

Lessons exist to develop these capabilities.

---

# 3. CURRICULUM HIERARCHY

Forge uses the following conceptual hierarchy:

```text
Forge
│
├── Phase
│   │
│   ├── Module
│   │   │
│   │   ├── Capability Group
│   │   │   │
│   │   │   ├── Concept
│   │   │   │   │
│   │   │   │   └── Lessons
│   │   │   │
│   │   │   └── Skills
│   │   │
│   │   └── Mastery Checkpoints
│   │
│   └── Projects
│
├── Debug Lab
│
└── Interview Academy
This hierarchy is conceptual.
The JSON implementation may normalize these entities differently.
The learner-facing experience should NOT expose the entire hierarchy as a database structure.
4. PHASES
A Phase represents a major transformation in the learner's engineering ability.
A phase should answer:
"What kind of engineer is the learner becoming during this part of Forge?"
A phase is NOT simply a technology category.
Bad:
Phase 1: HTML
Phase 2: CSS
Phase 3: JavaScript
Better:
Phase 1: Understand the Web
Phase 2: Build Interfaces
Phase 3: Program the Browser
Phase 4: Think in Systems
Phase 5: Build with React
Phase 6: Engineer Production Interfaces
Phase 7: Professional Frontend Engineering
The exact phase names may evolve.
The principle does not.
5. PHASE DESIGN
Every phase should represent a meaningful increase in capability.
A phase should contain:
a clear engineering identity
a coherent progression
foundational concepts
deliberate practice
increasing independence
at least one synthesis experience
reinforcement of earlier concepts
A phase should NOT feel like:
"Here are 30 unrelated lessons about X."
6. MODULES
Modules organize related capabilities inside a phase.
A module should answer:
"What coherent area of engineering ability are we developing?"
Examples:
Understanding the Web
├── The Browser
├── HTTP and Requests
├── HTML Structure
└── Developer Tools
or:
Programming the Browser
├── Values and Variables
├── Functions
├── Control Flow
├── Objects and Data
├── The DOM
└── Events
Modules should have internal progression.
7. MODULE BOUNDARIES
A new module should exist when one or more of these conditions are true:
The learner is entering a substantially different capability domain.
The mental model required is significantly different.
The skill set has enough depth to justify independent progression.
A meaningful project or checkpoint can conclude the area.
The module provides a useful navigational boundary.
Do NOT create modules merely because:
"There are five more topics."
8. CAPABILITY GROUPS
Within modules, related capabilities may be grouped.
A capability group answers:
"What cluster of abilities are we developing together?"
For example:
Module: Browser Fundamentals

Capability Group:
Rendering and the DOM

Capabilities:
- explain what the DOM represents
- inspect the DOM
- predict DOM changes
- manipulate elements
- diagnose DOM-related bugs
This allows lessons to be designed around outcomes rather than topics.
9. CONCEPTS
A concept is a mental model the learner needs.
Examples:
DOM tree
CSS cascade
containing blocks
JavaScript scope
closures
event propagation
asynchronous execution
promises
React rendering
state
props
effects
component composition
A concept is not automatically a lesson.
One concept may require:
several lessons
several activity types
repeated practice
debugging
a project application
10. LESSONS
A lesson is a focused learning experience.
A lesson should have:
one primary learning objective
one primary capability or tightly related capability set
a meaningful learner action
progressive activities
an observable outcome
an appropriate difficulty
a connection to previous knowledge
a path toward later transfer
Avoid lessons that attempt to teach an entire topic.
Bad:
"Everything About CSS Flexbox"
Better:
"Why Does Flexbox Know Where to Put Everything?"
followed later by focused experiences around:
main axis
cross axis
alignment
sizing
wrapping
debugging layouts
11. LESSON GRANULARITY
A lesson should be small enough to complete without cognitive overload.
But it must be large enough to produce a meaningful change in understanding.
The goal is not:
"One tiny concept per lesson."
The goal is:
"One meaningful learning transformation per lesson."
12. LESSON SEQUENCE
Forge lessons should usually form a progression like:
Encounter
   ↓
Understand
   ↓
Predict
   ↓
Manipulate
   ↓
Practice
   ↓
Challenge
   ↓
Debug
   ↓
Explain
   ↓
Transfer
Not every lesson requires every stage.
But the curriculum as a whole must repeatedly move through this progression.
13. LEARNING DEPTH LEVELS
Forge should classify learning experiences by depth.
Level 1 — Recognition
The learner can identify something.
Example:
"Which of these is a valid HTML element?"
Useful but shallow.
Level 2 — Understanding
The learner can explain what something does.
Example:
"What does the DOM represent?"
Level 3 — Prediction
The learner can anticipate behavior before execution.
Example:
"What will this code output?"
Level 4 — Manipulation
The learner can intentionally change behavior.
Example:
"Change the selector so only the second card changes."
Level 5 — Application
The learner can use the concept in a realistic task.
Example:
"Build a responsive card layout."
Level 6 — Debugging
The learner can diagnose incorrect behavior.
Example:
"Why is the card overflowing its container?"
Level 7 — Explanation
The learner can communicate the mechanism and reasoning.
Example:
"Explain why the element is positioned relative to this ancestor."
Level 8 — Transfer
The learner can apply the concept in a new situation.
Example:
The learner encounters an unfamiliar UI bug that relies on the same underlying concept.
Forge should intentionally move learners upward through these levels.
14. KNOWLEDGE TYPES
The curriculum must deliberately develop different kinds of knowledge.
Declarative
Knowing what something is.
Example:
"A promise represents a future result."
Procedural
Knowing how to do something.
Example:
"How to inspect an element in DevTools."
Predictive
Knowing what will happen.
Example:
"Predict which CSS rule wins."
Diagnostic
Knowing why something went wrong.
Example:
"Identify why the event handler is not firing."
Strategic
Knowing which approach to choose.
Example:
"Should this state live locally or higher in the component tree?"
Communicative
Knowing how to explain the decision.
Example:
"Explain why this implementation is preferable."
A strong Forge curriculum develops all six.
15. PREREQUISITES
Prerequisites should represent genuine dependency.
A learner should not be blocked because a concept is merely related.
Example:
Understanding:
DOM events
may genuinely depend on:
DOM elements
and:
functions
But it may not require completing an unrelated CSS animation module.
Prerequisites should be minimal and meaningful.
16. CONCEPT DEPENDENCY GRAPH
The curriculum should be treated as a dependency graph rather than a simple list.
Example:
HTML structure
      ↓
DOM
      ↓
DOM selection
      ↓
DOM manipulation
      ↓
Events
      ↓
Event-driven UI
Another:
Values
  ↓
Variables
  ↓
Expressions
  ↓
Functions
  ↓
Scope
  ↓
Closures
This graph should influence ordering.
17. SPIRAL CURRICULUM
Forge should use deliberate revisiting.
A concept should not disappear forever after its introduction.
Example:
DOM
 ↓
introduced

Later:
 ↓
DOM manipulation

Later:
 ↓
DOM events

Later:
 ↓
event delegation

Later:
 ↓
debugging DOM problems

Later:
 ↓
React's relationship with the DOM
Each revisit should increase complexity.
This is not repetition for repetition's sake.
It is progressive contextualization.
18. FORGETTING IS EXPECTED
Forge should assume learners forget.
The curriculum should therefore contain:
retrieval practice
interleaving
spaced revisits
mixed challenges
cumulative debugging
project reinforcement
interview reinforcement
A learner should periodically encounter older concepts without being explicitly told which concept is being tested.
19. MIXED PRACTICE
Later exercises should intentionally combine concepts.
Example:
A learner who previously studied:
variables
functions
arrays
DOM
events
may receive:
"Build a button that adds a new item to a list."
The activity simultaneously reinforces several concepts.
This is preferable to endlessly isolating concepts.
20. DIFFICULTY MODEL
Difficulty should increase along multiple dimensions.
Not just:
"more code."
Dimensions include:
Conceptual complexity
How difficult is the mental model?
Number of interacting concepts
How many ideas must be combined?
Guidance
How much help is provided?
Ambiguity
How obvious is the correct approach?
Debugging complexity
How many possible causes exist?
Environment complexity
How realistic is the environment?
Communication demand
How much explanation is required?
21. GUIDANCE PROGRESSION
Coding and problem-solving experiences should gradually reduce support.
Forge uses:
Guided
  ↓
Constrained
  ↓
Assisted
  ↓
Independent
  ↓
Open-ended
Guided
The learner is shown most of the structure.
Constrained
The learner chooses among meaningful options.
Assisted
The learner writes more of the solution with targeted hints.
Independent
The learner solves without scaffolding.
Open-ended
The learner decides how to approach the problem.
The curriculum should intentionally move learners along this path.
22. ACTIVITY DIVERSITY
A strong curriculum should not rely on one activity type.
Possible activity roles include:
explanation
visual exploration
interactive demonstration
prediction
multiple choice
multi-select
ordering
fill-in-the-blank
output prediction
code modification
coding
debugging
reflection
judgment
architecture decision
interview response
Activity choice should follow the learning objective.
Do NOT choose an activity because the renderer exists.
23. THE ACTIVITY SELECTION RULE
Before adding an activity, ask:
"What should the learner be doing to understand this?"
Then choose the activity.
Not:
"Which activity component can we use?"
This prevents technology-driven pedagogy.
24. VISUAL CONCEPTS
Some frontend concepts are difficult to understand through text alone.
These should receive visual treatment.
Examples:
browser rendering
DOM trees
box model
CSS layout
positioning
flexbox
grid
stacking contexts
event propagation
asynchronous execution
network requests
React rendering
component trees
state updates
For these concepts, the curriculum should prioritize:
See
↓
Manipulate
↓
Predict
↓
Explain
over:
Read
↓
Memorize
↓
Quiz
25. INVISIBLE SYSTEMS
Whenever the learner cannot directly see the mechanism, Forge should consider making it visible.
Examples:
Instead of merely explaining event bubbling:
show the event moving through the DOM.
Instead of merely explaining the box model:
let the learner manipulate padding, border, margin, and content size.
Instead of merely explaining React rendering:
show which components render and why.
The curriculum should actively expose invisible behavior.
26. DEBUGGING CURRICULUM
Debugging is not an optional advanced feature.
It is a core engineering capability.
Debugging should begin early and increase gradually.
Early:
Find the obvious syntax error.
Intermediate:
Identify which value is wrong.
Advanced:
Determine why the observed behavior differs from the expected behavior.
Professional:
Diagnose a realistic failure with incomplete information.
27. DEBUG LAB INTEGRATION
The main curriculum teaches concepts.
Debug Lab teaches learners to investigate failures.
The relationship should be:
Learn concept
     ↓
Use concept
     ↓
Break concept
     ↓
Debug concept
     ↓
Transfer concept
Debugging should therefore reinforce curriculum concepts rather than exist as an isolated game.
28. PROJECT ARCHITECTURE
Projects are synthesis points.
A project should require learners to combine previously developed capabilities.
Projects should NOT simply ask:
"Build what we just learned."
They should require transfer.
Example:
After learning:
HTML
CSS
responsive layout
JavaScript
DOM manipulation
the project may be:
Build a responsive interactive dashboard.
The learner must decide how to combine the skills.
29. PROJECT DIFFICULTY
Projects should progress from:
Highly scaffolded
        ↓
Partially scaffolded
        ↓
Requirements-driven
        ↓
Open-ended
Early projects provide architecture.
Later projects provide requirements.
Eventually:
Forge tells the learner what needs to exist.
The learner decides how to build it.
30. PROJECT FEEDBACK
Project evaluation should not only ask:
"Does it work?"
It should consider:
correctness
behavior
structure
maintainability
accessibility
responsiveness
reasoning
trade-offs
debugging ability
explanation
The exact evaluation model may evolve with the engine.
31. INTERVIEW ACADEMY INTEGRATION
Interview preparation should not be isolated until the end.
Interview-style reasoning should appear progressively.
Early:
"Explain what this code does."
Intermediate:
"What would you expect this code to output?"
Advanced:
"Why does this implementation behave this way?"
Professional:
"How would you debug this in production?"
Expert:
"What trade-offs would you consider?"
Interview Academy should reinforce the main curriculum.
32. INTERVIEW QUESTION TYPES
Forge should eventually include:
Conceptual
"What is the DOM?"
Predictive
"What does this code output?"
Debugging
"Why isn't this event firing?"
Implementation
"Build this behavior."
Architecture
"Where should this state live?"
Trade-off
"What are the advantages and disadvantages of this approach?"
System reasoning
"What happens between clicking this button and seeing the updated UI?"
Communication
"Explain your solution as if you were reviewing it with another engineer."
33. MASTERY
Completion is not mastery.
A learner completing a lesson means:
They finished an experience.
Mastery means:
They can use the capability reliably.
Evidence of mastery may include:
successful recall
prediction
manipulation
application
debugging
explanation
transfer
delayed retrieval
The curriculum must distinguish these states.
34. MASTERY CHECKPOINTS
Modules should contain meaningful checkpoints.
A checkpoint should combine previously learned capabilities.
Example:
Module:
JavaScript Functions

Checkpoint:

Given an unfamiliar function:

1. predict its output
2. modify it
3. debug a broken version
4. explain the behavior
This is stronger evidence than a 20-question multiple-choice quiz.
35. REINFORCEMENT
Important capabilities should return in later modules.
For example:
A learner learns functions in JavaScript.
Later, functions appear naturally in:
DOM manipulation
event handlers
array methods
asynchronous code
React components
custom hooks
The curriculum should reuse concepts naturally.
36. TRANSFER
Forge must deliberately test whether learners can recognize familiar principles in unfamiliar situations.
Example:
The learner previously learned:
"A value is being changed unexpectedly."
Later they encounter the same underlying reasoning problem in a completely different context.
Forge should not always say:
"This is a scope problem."
Instead:
"Something changed that shouldn't have. Find where."
The learner must identify the relevant concept.
37. CURRICULUM FLOW
The overall curriculum should feel like an engineering apprenticeship.
Conceptually:
Understand the environment
        ↓
Build simple things
        ↓
Understand the underlying mechanisms
        ↓
Manipulate behavior
        ↓
Combine concepts
        ↓
Debug failures
        ↓
Build increasingly realistic systems
        ↓
Make engineering decisions
        ↓
Explain decisions
        ↓
Work independently
38. FRONTEND ENGINEERING SCOPE
Forge is specifically focused on frontend engineering.
The curriculum should eventually cover the major capability areas required of a modern frontend engineer.
These may include:
Web Fundamentals
├── Browser
├── HTTP
├── URLs
├── Requests and responses
├── HTML
├── CSS
└── DevTools

JavaScript
├── Values
├── Variables
├── Types
├── Operators
├── Control flow
├── Functions
├── Scope
├── Closures
├── Objects
├── Arrays
├── Modules
├── Async JavaScript
├── Promises
└── Error handling

Browser Programming
├── DOM
├── Events
├── Forms
├── Storage
├── Fetch
└── Browser APIs

CSS Engineering
├── Cascade
├── Specificity
├── Box model
├── Layout
├── Flexbox
├── Grid
├── Positioning
├── Responsive design
├── Animation
└── Accessibility

React
├── Components
├── JSX
├── Props
├── State
├── Rendering
├── Events
├── Effects
├── Forms
├── Composition
├── Custom hooks
├── Performance
└── Architecture

Production Frontend
├── Accessibility
├── Performance
├── Testing
├── Security
├── Networking
├── Error handling
├── State architecture
├── Build systems
└── Deployment

Professional Engineering
├── Debugging
├── Code review
├── Architecture
├── Trade-offs
├── Git
├── Collaboration
├── Documentation
└── Interview communication
This is a capability map, NOT the final curriculum.
The final curriculum must be designed from learning outcomes rather than simply turning this list into lessons.
39. TECHNOLOGY ORDER
Technology should be introduced when it solves a meaningful problem.
Do not teach a framework simply because it is popular.
For example:
React should appear after the learner understands enough about:
HTML
CSS
JavaScript
DOM
events
state-like behavior
component thinking
This allows React to answer:
"Why does this abstraction exist?"
rather than:
"Here are some React rules to memorize."
40. FRAMEWORK TEACHING PRINCIPLE
Forge should teach the underlying problem before the abstraction whenever practical.
Example:
Before teaching React state:
demonstrate the problem of keeping UI and data synchronized manually.
Then:
show how React provides a different model.
This produces understanding rather than syntax memorization.
41. VERSIONING
Curriculum content must be versionable.
Every major curriculum release should have a version.
Example:
Forge Curriculum v1.0
Forge Curriculum v1.1
Forge Curriculum v2.0
Content IDs should remain stable where possible.
Breaking structural changes should be treated deliberately.
42. CONTENT IDENTIFIERS
Every curriculum entity must have a stable unique ID.
IDs should be:
deterministic
human-debuggable
unique
stable
independent of display titles
Example:
phase-web-foundations
module-browser-fundamentals
capability-dom-inspection
lesson-dom-tree-explorer
Do not derive IDs from changing marketing titles.
43. DISPLAY TITLES VS TECHNICAL TAXONOMY
Internal taxonomy and learner-facing language are separate.
Internal:
css-specificity
Learner-facing:
"Why Is This Style Winning?"
Internal:
event-propagation
Learner-facing:
"Where Did That Click Go?"
This separation is intentional.
44. LESSON METADATA
Every lesson should eventually provide enough metadata for the engine to understand:
ID
title
description
phase
module
capability
prerequisites
difficulty
estimated duration
learning objectives
concepts
activities
mastery signals
related concepts
next recommended experiences
The exact schema belongs to the implementation specification.
This architecture defines the semantic requirements.
45. LESSON OBJECTIVE RULE
Every lesson must have a primary objective that can be expressed as observable learner behavior.
Bad:
"Understand CSS specificity."
Better:
"Predict which CSS rule will win and explain why."
Bad:
"Learn JavaScript functions."
Better:
"Write and modify functions, predict their outputs, and explain how arguments reach parameters."
The objective should describe what the learner can DO.
46. LESSON EXIT CRITERIA
A lesson should have a meaningful definition of "done."
Possible criteria:
learner successfully predicts behavior
learner completes manipulation
learner fixes a bug
learner builds the required behavior
learner explains the mechanism
learner demonstrates transfer
Completion should not depend solely on clicking through every activity.
47. CUMULATIVE CAPABILITY
Forge should maintain a mental model of learner capability.
Conceptually:
Capability
├── introduced
├── practiced
├── demonstrated
├── reinforced
└── mastered
The exact implementation may use a different data model.
The curriculum must support these states conceptually.
48. LESSON RELATIONSHIPS
Lessons should be able to relate to other lessons through:
prerequisites
reinforces
extends
applies
challenges
debugs
revisits
transfers
This allows the curriculum to behave like a learning network rather than a simple playlist.
49. CURRICULUM NAVIGATION
The default learner experience may be sequential.
But the underlying curriculum should understand relationships.
A learner may encounter:
Current lesson
     ↓
Recommended next lesson
     ↓
Optional reinforcement
     ↓
Debug challenge
     ↓
Project application
Navigation should therefore be capability-aware where possible.
50. OPTIONAL CONTENT
Optional experiences should have a clear purpose.
Good:
reinforcement for struggling learners
advanced challenge for confident learners
additional debugging practice
interview preparation
Bad:
random extra lesson
Optional does not mean irrelevant.
51. LESSON TYPES
The curriculum may contain different lesson archetypes.
Discovery Lesson
Introduces a new mental model.
Practice Lesson
Builds fluency.
Prediction Lesson
Builds mental simulation.
Debugging Lesson
Builds diagnosis.
Build Lesson
Applies concepts.
Reinforcement Lesson
Retrieves older concepts.
Transfer Lesson
Applies knowledge in an unfamiliar context.
Mastery Lesson
Combines multiple capabilities.
Interview Lesson
Builds communication and reasoning.
A lesson may combine archetypes.
52. CURRICULUM RHYTHM
The curriculum should alternate cognitive demands.
Avoid:
Explanation
Explanation
Explanation
Quiz
Explanation
Explanation
Quiz
Prefer:
Discover
↓
Interact
↓
Predict
↓
Practice
↓
Challenge
↓
Build
↓
Debug
↓
Explain
The exact rhythm changes according to the concept.
53. COGNITIVE LOAD
Forge should introduce complexity gradually.
Do not simultaneously introduce:
new syntax
new mental model
new UI
new tooling
new environment
new problem domain
unless the lesson intentionally teaches how those pieces interact.
When possible:
New concept + familiar environment
before:
New concept + new concept + new environment
54. ERROR DESIGN
Errors should be intentional learning opportunities.
A good error:
has a recognizable cause
produces observable behavior
can be investigated
teaches a general principle
is solvable with appropriate reasoning
A bad error:
depends on obscure trivia
is caused by tooling noise
is ambiguous without hidden information
exists only to make the learner fail
55. CHALLENGE DESIGN
A challenge should create productive uncertainty.
The learner should think:
"I know enough to attempt this, but I need to reason."
Not:
"I have no idea what this is."
Difficulty should come from combining known ideas rather than arbitrarily withholding information.
56. EXPLANATION ASSESSMENT
When learners explain something, evaluate the reasoning.
A strong explanation should usually cover:
What happened
+
Why it happened
+
What rule/mechanism caused it
Where relevant:
+
What would happen if something changed
57. NO MEMORIZATION-FIRST DESIGN
Forge should avoid lessons whose primary activity is memorizing:
syntax
definitions
terminology
API names
arbitrary rules
Memorization can support learning.
It must not become the learning experience.
58. REAL ENGINEERING BEHAVIOR
The curriculum should repeatedly model professional engineering behavior:
form hypotheses
inspect evidence
read errors
reproduce problems
isolate causes
test assumptions
make small changes
verify behavior
explain decisions
consider trade-offs
question assumptions
communicate clearly
These behaviors are as important as technical knowledge.
59. CURRICULUM QUALITY GATE
No lesson should enter the production curriculum unless it can answer:
Purpose
What capability does this develop?
Action
What does the learner actually do?
Mental model
What should the learner understand?
Prediction
What can the learner predict afterward?
Manipulation
What can the learner intentionally change?
Application
Where can they use it?
Debugging
Can they recognize or diagnose failure?
Explanation
Can they explain why it works?
Transfer
Can they use the idea somewhere unfamiliar?
Not every lesson needs all nine.
But the curriculum as a whole must provide all nine repeatedly.
60. THE CURRICULUM MUST NOT BECOME
Forge must never become:
A textbook with animations
If the learner is mostly reading, the architecture has failed.
A quiz app with a code editor
If activities only test recall, the architecture has failed.
A collection of AI-generated lessons
If lessons have no coherent capability progression, the architecture has failed.
A syntax memorization platform
If learners know syntax but cannot reason about behavior, the architecture has failed.
A dopamine machine
XP, streaks, badges, and progress indicators must never become the learning objective.
A joke-heavy course
Humor supports the experience.
It does not replace it.
An answer-giving system
Forge should cultivate independent reasoning.
A completion system
100% completion does not equal mastery.
Pretty documentation
Visual polish does not compensate for weak pedagogy.
A generic AI tutor
Forge is a structured learning environment, not simply a chatbot answering questions.
61. CURRICULUM GENERATION RULE
AI must NOT generate the entire curriculum in one uncontrolled pass.
The curriculum should be created in controlled stages:
Curriculum Architecture
        ↓
Phase Map
        ↓
Module Map
        ↓
Capability Map
        ↓
Concept Dependency Map
        ↓
Lesson Map
        ↓
Lesson Experiences
        ↓
Activities
        ↓
Validation
        ↓
Integration
        ↓
Review
Each stage should be reviewed before proceeding.
62. CURRICULUM GENERATION ORDER
The new Forge curriculum should be built in this order:
Stage 1
Define the complete phase architecture.
Stage 2
Define modules inside each phase.
Stage 3
Define capabilities inside each module.
Stage 4
Map dependencies between capabilities.
Stage 5
Define lesson purposes.
Stage 6
Design lesson experiences.
Stage 7
Write activity content.
Stage 8
Validate technical correctness.
Stage 9
Validate pedagogical quality.
Stage 10
Validate Forge voice.
Stage 11
Integrate into the engine.
Stage 12
Test learner progression.
This prevents lesson generation from driving curriculum design.
63. AI CURRICULUM GENERATION CONSTRAINT
An AI generating Forge curriculum MUST NOT invent curriculum architecture while simultaneously writing lesson content.
Architecture decisions must already exist.
The AI's job is to execute the architecture.
If the architecture contains an ambiguity, the AI must identify the ambiguity rather than silently inventing a solution.
64. HUMAN OVERSIGHT
Curriculum architecture is a product decision.
The AI may:
propose
analyze
identify gaps
compare alternatives
generate structured content
validate consistency
The AI must not silently decide:
what Forge fundamentally teaches
the learner progression
the product philosophy
what counts as mastery
the curriculum's core architecture
Those decisions belong to the Forge product specification.
65. THE NEW CURRICULUM STARTS AT ZERO
The existing curriculum is NOT the source of truth for the new curriculum.
Existing content may be used as:
reference
test data
comparison material
migration evidence
technical fixtures
But the new curriculum must be designed independently.
Do not simply rename or rewrite old lessons.
Do not preserve weak structure merely because it already exists.
Do not allow legacy content to dictate the new learning journey.
66. LESSON 0
The new curriculum must begin with a completely new Lesson 0.
It must NOT be a rewrite of the existing introductory lesson.
Lesson 0 should establish the Forge learning contract.
The learner should understand:
what Forge is
how Forge expects them to learn
that prediction matters
that mistakes are useful
that debugging is part of engineering
that they will be asked to think, not just remember
Lesson 0 should immediately demonstrate the Forge experience.
It should not spend a long time explaining the platform.
67. THE FIRST EXPERIENCE
The first meaningful interaction should create curiosity.
The learner should encounter something like:
Here is a simple behavior.

What do you think will happen?

[Prediction]

Now run it.

[Observe]

Interesting.

Why did that happen?

[Investigate]

Now change one thing.

[Manipulate]

Explain what changed.

[Explain]
The exact implementation will be determined later.
The principle is critical:
The learner should experience Forge before Forge explains itself.
68. CURRICULUM SUCCESS CRITERIA
The curriculum succeeds if a learner who completes it can:
build frontend interfaces
reason about browser behavior
understand HTML/CSS/JavaScript deeply
use browser tools effectively
predict code behavior
debug unfamiliar problems
build with React
make architectural decisions
reason about performance
consider accessibility
understand production concerns
explain technical decisions
work through ambiguity
learn unfamiliar concepts independently
The goal is not merely:
"Know frontend."
The goal is:
"Operate like a frontend engineer."
69. THE FINAL CURRICULUM PRINCIPLE
The curriculum should constantly move the learner toward independence.
Early Forge:
"Watch this."
Then:
"What do you think?"
Then:
"Try it."
Then:
"Fix it."
Then:
"Build it."
Then:
"Explain it."
Eventually:
"Here's the problem. Figure it out."
That progression is the architecture.
