# FORGE PHASE MAP
## Version 1.0

> This document defines the complete high-level learning journey of Forge.
>
> It answers one question:
>
> **How does a learner progress from knowing almost nothing about frontend engineering to operating independently as a frontend engineer?**
>
> This is a curriculum architecture document.
>
> It does NOT define individual lessons yet.
>
> Lessons must be designed from this map, not the other way around.

---

# 1. THE FORGE JOURNEY

Forge is designed as an engineering apprenticeship.

The learner progresses through increasingly powerful ways of thinking:

```text
Phase 0
ENTER THE WEB
        ↓
Phase 1
UNDERSTAND THE WEB
        ↓
Phase 2
BUILD THE INTERFACE
        ↓
Phase 3
PROGRAM THE BROWSER
        ↓
Phase 4
THINK IN JAVASCRIPT
        ↓
Phase 5
BUILD INTERACTIVE APPLICATIONS
        ↓
Phase 6
THINK IN REACT
        ↓
Phase 7
ENGINEER PRODUCTION FRONTENDS
        ↓
Phase 8
THINK LIKE AN ENGINEER
        ↓
Phase 9
OPERATE INDEPENDENTLY
These phases represent changes in capability.
They are NOT merely technology levels.
2. PHASE 0 — ENTER THE WEB
Engineering transformation
From:
"I want to learn frontend development."
To:
"I understand what I'm learning and how the web actually behaves."
This phase establishes the learner's mental model of the environment they are entering.
Core question
"What actually happens when I use the web?"
Major capabilities
The learner should begin to understand:
what the web is
what a browser does
what a server does
what a URL represents
what happens when a page loads
how HTML, CSS, and JavaScript participate
what frontend engineering actually means
how developers inspect what the browser is doing
how Forge expects them to learn
Engineering behaviors introduced
The learner begins practicing:
observation
prediction
questioning assumptions
using developer tools
reading browser output
distinguishing what they expect from what actually happened
Signature Forge experience
The learner should interact with something before receiving a long explanation.
The phase should establish:
"Don't just read what happens. Watch it happen."
Phase completion capability
By the end of Phase 0, the learner should be able to explain:
"When I visit a website, what major systems are involved and what is the browser responsible for?"
They should also understand how Forge expects them to learn.
3. PHASE 1 — UNDERSTAND THE WEB
Engineering transformation
From:
"The browser displays websites."
To:
"I understand the fundamental systems that produce a webpage."
Core question
"How does the browser turn code and network responses into what I see?"
Major capability domains
Web and networking fundamentals
Learners develop mental models for:
URLs
DNS at a conceptual level
HTTP
requests
responses
methods
status codes
headers
resources
browser caching at a conceptual level
HTML
Learners develop the ability to:
structure documents
understand semantic HTML
create meaningful document hierarchy
reason about nesting
understand attributes
create accessible structural markup
inspect document structure
Browser rendering
Learners begin understanding:
parsing
DOM creation
CSS application
layout
painting
rendering
how code becomes pixels
The goal is conceptual understanding rather than browser-engine implementation trivia.
Developer tools
Learners learn to:
inspect elements
inspect styles
read the console
inspect network activity
modify elements temporarily
identify errors
gather evidence
Engineering behaviors
The learner begins to develop:
Observe
↓
Inspect
↓
Question
↓
Form a hypothesis
↓
Test
Phase completion capability
The learner should be able to explain:
"What happens between requesting a webpage and seeing the interface?"
And:
"How can I inspect what the browser is actually doing?"
4. PHASE 2 — BUILD THE INTERFACE
Engineering transformation
From:
"I can create HTML."
To:
"I can deliberately construct and control an interface."
Core question
"How does the browser decide where everything goes and what it looks like?"
Major capability domains
CSS foundations
selectors
declarations
inheritance
cascade
specificity
values
units
colors
typography
Box model
content
padding
border
margin
dimensions
overflow
sizing behavior
Layout
normal flow
block and inline behavior
flexbox
grid
positioning
containing blocks
stacking contexts
Responsive design
viewport behavior
media queries
fluid layouts
responsive typography
responsive components
mobile-first thinking
Visual engineering
Learners should learn to translate design intent into:
spacing systems
hierarchy
alignment
responsive behavior
reusable patterns
Accessibility foundations
Accessibility begins here rather than being postponed to the end.
Learners should encounter:
semantic elements
keyboard interaction
labels
focus
contrast
accessible structure
Engineering behaviors
The learner practices:
inspecting layout
predicting CSS behavior
isolating styles
identifying conflicting rules
testing responsive behavior
reasoning about browser layout
Debugging introduction
Typical problems:
"Why isn't this element moving?"
"Why isn't this style applying?"
"Why is this overflowing?"
"Why did this work until I added one more rule?"
Phase completion capability
The learner should be able to:
Build a responsive, accessible interface from a design or specification.
And:
Explain why the browser produces the layout they see.
5. PHASE 3 — PROGRAM THE BROWSER
Engineering transformation
From:
"I can build a static interface."
To:
"I can make the interface respond to data and user actions."
Core question
"How do I make the page do things?"
Major capability domains
JavaScript foundations
values
variables
expressions
operators
types
coercion
conditions
loops
Functions
defining functions
parameters
arguments
return values
function composition
callbacks
function scope
Data
arrays
objects
destructuring
iteration
transformations
searching
filtering
mapping
reducing
Browser programming
DOM selection
DOM traversal
DOM manipulation
attributes
classes
events
event listeners
event propagation
forms
Browser state
Learners begin reasoning about:
current UI state
data state
derived state
synchronization
user interactions
Engineering behaviors
Learners practice:
predicting execution
tracing values
reading errors
inspecting state
isolating behavior
testing assumptions
Debugging
Debugging becomes a regular part of normal learning.
The learner should begin developing the instinct:
"Something is wrong. Where does reality first diverge from my expectation?"
Phase completion capability
The learner should be able to:
Build an interactive browser application using HTML, CSS, and JavaScript.
They should also be able to:
Debug common JavaScript and DOM problems without immediately searching for the answer.
6. PHASE 4 — THINK IN JAVASCRIPT
Engineering transformation
From:
"I can write JavaScript."
To:
"I understand how JavaScript behaves."
Core question
"What is the language actually doing?"
This phase deepens the learner's mental model.
Major capability domains
Execution
execution context
call stack
evaluation
control flow
execution order
Scope
lexical scope
block scope
function scope
closures
variable lookup
Objects
references
mutation
copying
property access
object behavior
prototypes at an appropriate conceptual depth
Functions at depth
higher-order functions
callbacks
closures
composition
function context
this
Modules
imports
exports
module boundaries
dependency relationships
Asynchronous JavaScript
synchronous vs asynchronous work
callbacks
promises
async/await
task scheduling
event loop concepts
error handling
Errors
syntax errors
runtime errors
logical errors
rejected promises
defensive reasoning
Engineering behaviors
This phase strongly emphasizes:
mental simulation
tracing
prediction
debugging
explaining execution
distinguishing mechanism from symptom
Phase completion capability
The learner should be able to encounter unfamiliar JavaScript behavior and reason toward the explanation.
The goal is not:
"I memorized the JavaScript rule."
The goal is:
"I can work out what JavaScript is doing."
7. PHASE 5 — BUILD INTERACTIVE APPLICATIONS
Engineering transformation
From:
"I can manipulate a page."
To:
"I can design and build a small application."
Core question
"How do I organize an application rather than a collection of scripts?"
Major capability domains
Application state
state modeling
derived state
state transitions
synchronization
persistence
Data and APIs
HTTP from JavaScript
fetch
JSON
request states
loading
success
failure
retries
error handling
Forms
controlled behavior
validation
submission
error states
user feedback
UI architecture
separation of concerns
reusable components
modules
utility functions
data flow
Browser storage
local storage
session storage
persistence decisions
serialization
Application debugging
Learners encounter realistic problems such as:
stale UI
incorrect state
race conditions
failed requests
invalid data
event bugs
synchronization errors
Projects
This phase should contain substantial projects.
Projects should move from:
Follow the structure
↓
Complete missing pieces
↓
Implement requirements
↓
Make architectural decisions
Phase completion capability
The learner should be able to:
Design and build a multi-feature browser application from requirements.
They should also be able to explain:
Why the application is structured the way it is.
8. PHASE 6 — THINK IN REACT
Engineering transformation
From:
"I can build applications with JavaScript."
To:
"I understand component-based UI architecture and React's programming model."
Core question
"What problem is React solving?"
React must NOT be introduced as a collection of syntax rules.
Major capability domains
Component thinking
components
composition
boundaries
reusable UI
component responsibilities
JSX
expressions
rendering
conditional UI
lists
keys
Props
data flow
component interfaces
composition
parent-child relationships
State
state ownership
updates
derived values
state transitions
lifting state
Rendering
render behavior
reconciliation at an appropriate conceptual level
re-rendering
identity
keys
Events
event handlers
user interaction
state updates
event-driven UI
Effects
Effects should be taught carefully.
Learners should understand:
Why effects exist.
and:
When an effect is actually needed.
Topics include:
synchronization
dependencies
cleanup
external systems
avoiding unnecessary effects
Forms
controlled inputs
validation
submission
error states
Custom hooks
extracting behavior
reuse
boundaries
stateful logic
React architecture
component boundaries
data flow
state placement
composition
maintainability
Debugging
React debugging should include:
unexpected renders
stale values
incorrect state
effect problems
key issues
prop flow
component boundaries
Phase completion capability
The learner should be able to:
Build and debug a production-style React application.
More importantly:
Explain why the application is structured the way it is.
9. PHASE 7 — ENGINEER PRODUCTION FRONTENDS
Engineering transformation
From:
"I can build an application."
To:
"I can build one that survives real users."
Core question
"What changes when software has real users, real constraints, and real consequences?"
Major capability domains
Accessibility
Deepen:
semantic structure
keyboard interaction
focus management
screen-reader considerations
ARIA
accessible forms
dynamic content
Performance
rendering cost
network performance
asset optimization
code splitting
lazy loading
caching
runtime performance
measuring performance
Security
XSS
unsafe input
authentication concepts
authorization concepts
sensitive data
browser security boundaries
secure frontend practices
Security should be taught responsibly and practically.
Testing
unit testing
component testing
integration testing
end-to-end testing
test strategy
testing behavior rather than implementation details
Networking
request lifecycle
failures
retries
timeouts
caching
optimistic UI
race conditions
Error handling
user-facing errors
developer errors
error boundaries
observability concepts
recovery strategies
Build and deployment
build process
environment configuration
assets
deployment
CI/CD concepts
production debugging
Maintainability
code organization
naming
abstractions
technical debt
refactoring
documentation
code review
Phase completion capability
The learner should be able to:
Evaluate a frontend application beyond "does it work?"
They should be able to reason about:
accessibility
performance
security
reliability
maintainability
user experience
10. PHASE 8 — THINK LIKE AN ENGINEER
Engineering transformation
From:
"I know how to implement things."
To:
"I can make engineering decisions."
Core question
"Given multiple valid solutions, how do I decide?"
Major capability domains
Architecture
boundaries
responsibilities
dependencies
data flow
state architecture
component architecture
Trade-offs
Learners practice evaluating:
simplicity vs flexibility
performance vs complexity
abstraction vs duplication
local state vs shared state
client vs server responsibilities
build speed vs maintainability
Code review
Learners practice identifying:
bugs
design problems
accessibility issues
performance problems
maintainability concerns
unnecessary complexity
Debugging unfamiliar systems
Problems should become less structured.
Instead of:
"Fix this known bug."
the learner may receive:
"Users report that the dashboard sometimes displays stale data. Investigate."
The learner must determine:
how to reproduce it
what evidence to gather
what to inspect
what hypotheses to test
how to verify the fix
Communication
Learners practice:
explaining decisions
defending trade-offs
describing failures
communicating uncertainty
asking useful questions
explaining technical concepts clearly
Phase completion capability
The learner should be able to approach an unfamiliar frontend problem and construct a reasonable path toward solving it.
11. PHASE 9 — OPERATE INDEPENDENTLY
Engineering transformation
From:
"I need Forge to guide me."
To:
"I know how to figure things out."
Core question
"Can I operate without a tutorial holding my hand?"
This phase is different
This phase should contain substantially less scaffolding.
Forge becomes an evaluator and environment rather than a constant instructor.
Major experiences
Open-ended builds
Given:
requirements
constraints
acceptance criteria
The learner decides:
architecture
implementation
debugging strategy
trade-offs
Realistic debugging
Problems contain incomplete information.
The learner must investigate.
Code review
The learner reviews unfamiliar code.
Design decisions
The learner chooses between competing approaches.
Interview simulations
Timed:
conceptual questions
debugging problems
implementation problems
architecture questions
communication challenges
Capstone projects
The learner builds substantial applications with minimal scaffolding.
Phase completion capability
The learner should be able to:
Enter an unfamiliar frontend problem, understand the situation, investigate it, choose an approach, implement a solution, debug it, and explain the decisions made.
That is the ultimate Forge outcome.
12. CROSS-CURRICULUM SYSTEMS
The phases are not isolated.
Several systems run across the entire curriculum.
13. DEBUGGING IS A THREAD, NOT A PHASE
Debugging begins early.
Phase 0
Observe

Phase 1
Inspect

Phase 2
Diagnose layout

Phase 3
Trace code

Phase 4
Reason about execution

Phase 5
Debug applications

Phase 6
Debug React

Phase 7
Debug production concerns

Phase 8
Investigate unfamiliar failures

Phase 9
Operate independently
Debugging complexity increases with the learner.
14. ACCESSIBILITY IS A THREAD
Accessibility should not be:
"One module near the end."
It should progressively appear throughout the curriculum.
HTML
↓
Semantic structure
↓
CSS
↓
Focus and interaction
↓
JavaScript
↓
Accessible dynamic behavior
↓
React
↓
Accessible component architecture
↓
Production accessibility
15. PERFORMANCE IS A THREAD
Performance should begin conceptually early.
Later it becomes measurable and architectural.
Browser rendering
↓
Layout
↓
DOM complexity
↓
JavaScript execution
↓
Network behavior
↓
React rendering
↓
Application architecture
↓
Production performance
16. SECURITY IS A THREAD
Security concepts should be introduced when the learner encounters the relevant systems.
Examples:
Browser boundaries
↓
User input
↓
DOM manipulation
↓
XSS
↓
Authentication concepts
↓
Authorization
↓
Network requests
↓
Production security
Security should never be taught as a checklist detached from application behavior.
17. TOOLING IS A THREAD
Developer tools should become increasingly sophisticated.
Early:
inspect an element.
Later:
inspect network activity.
Later:
debug JavaScript.
Later:
profile performance.
Later:
diagnose production behavior.
The learner should become comfortable investigating software.
18. GIT AND COLLABORATION
Git and professional collaboration should be integrated progressively rather than dumped into one isolated module.
Potential progression:
Version control concept
↓
Commits
↓
Branches
↓
History
↓
Pull requests
↓
Code review
↓
Conflict resolution
↓
Collaborative workflows
19. INTERVIEW ACADEMY THREAD
Interview preparation should progressively appear throughout Forge.
Early:
explain a concept.
Middle:
predict behavior.
Later:
debug.
Advanced:
design.
Professional:
communicate trade-offs.
Final:
solve under time constraints.
20. PROJECT THREAD
Projects should appear progressively.
Tiny build
↓
Guided project
↓
Feature project
↓
Application project
↓
Multi-feature application
↓
Production-oriented project
↓
Open-ended capstone
21. DIFFICULTY CURVE
The curriculum should not simply become "more advanced."
It should become:
More concepts
+
More interaction
+
Less scaffolding
+
More ambiguity
+
More realistic constraints
+
More debugging
+
More decisions
+
More explanation
This is the true difficulty curve.
22. THE TRANSITION BETWEEN PHASES
A learner should not enter the next phase simply because they completed the previous phase.
They should demonstrate sufficient capability.
For example:
Before moving from JavaScript fundamentals toward application development, the learner should be capable of:
reading JavaScript
predicting basic behavior
writing functions
manipulating data
interacting with the DOM
handling events
debugging basic failures
The exact mastery thresholds belong to the capability model.
23. PHASE CHECKPOINTS
Every major phase should end with a synthesis experience.
The checkpoint should combine several capabilities.
It should answer:
"Can the learner actually use what this phase taught?"
Not:
"Did the learner remember the vocabulary?"
24. PHASE 0 CHECKPOINT
The learner explains the lifecycle of a webpage and demonstrates basic browser inspection.
25. PHASE 1 CHECKPOINT
The learner builds and investigates a structured webpage.
26. PHASE 2 CHECKPOINT
The learner builds a responsive interface and diagnoses layout problems.
27. PHASE 3 CHECKPOINT
The learner builds an interactive browser application.
28. PHASE 4 CHECKPOINT
The learner investigates unfamiliar JavaScript behavior and explains the execution model involved.
29. PHASE 5 CHECKPOINT
The learner builds a multi-feature application using APIs, state, forms, and persistence.
30. PHASE 6 CHECKPOINT
The learner builds and debugs a React application while explaining component and state decisions.
31. PHASE 7 CHECKPOINT
The learner audits an application for:
accessibility
performance
security
reliability
maintainability
and implements improvements.
32. PHASE 8 CHECKPOINT
The learner evaluates an unfamiliar engineering problem, proposes alternatives, discusses trade-offs, and defends a decision.
33. PHASE 9 CAPSTONE
The learner receives a realistic product requirement.
Forge does not provide a step-by-step recipe.
The learner must:
Understand requirements
↓
Plan
↓
Choose architecture
↓
Build
↓
Test
↓
Debug
↓
Improve
↓
Explain
The learner's ability to operate independently is the final assessment.
34. THE CAPABILITY ARC
Across the entire curriculum:
Recognize
   ↓
Understand
   ↓
Predict
   ↓
Manipulate
   ↓
Apply
   ↓
Debug
   ↓
Explain
   ↓
Transfer
   ↓
Decide
   ↓
Operate independently
This is more important than the number of lessons.
35. THE CURRICULUM SHOULD FEEL DIFFERENT OVER TIME
Early Forge should feel like:
"Look at this."
Middle Forge should feel like:
"What do you think?"
Later Forge should feel like:
"Fix this."
Advanced Forge should feel like:
"Why did you choose this?"
Final Forge should feel like:
"Here's the problem. Figure it out."
That progression is intentional.
36. PHASE MAP SUMMARY
PHASE 0
Enter the Web
Goal:
Understand the environment and Forge's learning model.

PHASE 1
Understand the Web
Goal:
Understand browser, HTTP, HTML, rendering, and DevTools.

PHASE 2
Build the Interface
Goal:
Build and reason about responsive, accessible interfaces.

PHASE 3
Program the Browser
Goal:
Use JavaScript and browser APIs to create interactive behavior.

PHASE 4
Think in JavaScript
Goal:
Understand execution, scope, objects, functions, async behavior, and errors.

PHASE 5
Build Interactive Applications
Goal:
Design and build complete browser applications.

PHASE 6
Think in React
Goal:
Understand component-based UI architecture and React's programming model.

PHASE 7
Engineer Production Frontends
Goal:
Build software that is accessible, performant, secure, testable, reliable, and maintainable.

PHASE 8
Think Like an Engineer
Goal:
Make architectural decisions, debug ambiguity, evaluate trade-offs, and communicate reasoning.

PHASE 9
Operate Independently
Goal:
Solve unfamiliar frontend problems with minimal scaffolding.
37. FINAL STANDARD
The Forge curriculum is successful when the learner's relationship with the system changes.
At the beginning:
Forge tells them what to look at.
Then:
Forge asks them what they think.
Then:
Forge gives them something to investigate.
Then:
Forge gives them a problem.
Eventually:
Forge gives them a goal.
And finally:
The learner figures out how to get there.
That is the destination.
