# FORGE MODULE MAP
## Version 1.0

> This document defines the modules contained within the Forge Phase Map.
>
> It answers:
>
> **What major areas of capability must the learner develop inside each phase?**
>
> This document does NOT define individual lessons.
>
> It does NOT define activity content.
>
> It does NOT define lesson order in detail.
>
> It defines the curriculum's structural backbone from which capabilities and lessons will later be designed.

---

# 1. MODULE MAP PRINCIPLE

A module is a coherent area of engineering capability.

A module is NOT:

- a random collection of related topics
- a technology checklist
- a chapter in a textbook
- a fixed number of lessons
- an excuse to divide content into smaller folders

Every module should answer:

> "What meaningful engineering ability is being developed here?"

---

# 2. GLOBAL CURRICULUM STRUCTURE

```text
FORGE
│
├── PHASE 0 — ENTER THE WEB
│
├── PHASE 1 — UNDERSTAND THE WEB
│
├── PHASE 2 — BUILD THE INTERFACE
│
├── PHASE 3 — PROGRAM THE BROWSER
│
├── PHASE 4 — THINK IN JAVASCRIPT
│
├── PHASE 5 — BUILD INTERACTIVE APPLICATIONS
│
├── PHASE 6 — THINK IN REACT
│
├── PHASE 7 — ENGINEER PRODUCTION FRONTENDS
│
├── PHASE 8 — THINK LIKE AN ENGINEER
│
└── PHASE 9 — OPERATE INDEPENDENTLY
3. PHASE 0 — ENTER THE WEB
Purpose
Give the learner an intuitive mental model of:
the web
frontend engineering
browsers
code
learning through investigation
This phase should feel like entering a new environment.
MODULE 0.1 — MEET THE WEB
Purpose
Establish what the web actually is.
Major concepts
websites
webpages
browsers
servers
clients
frontend
backend
resources
requests
responses
Capability direction
The learner should be able to describe the major pieces involved when interacting with a website.
MODULE 0.2 — YOUR FIRST BROWSER INVESTIGATION
Purpose
Teach the learner to observe rather than assume.
Major concepts
browser interface
developer tools
inspecting elements
console
network overview
page structure
browser evidence
Capability direction
The learner should begin treating the browser as something they can investigate.
MODULE 0.3 — HOW FORGE WORKS
Purpose
Introduce the Forge learning model through experience rather than documentation.
Major concepts
prediction
interaction
experimentation
failure
debugging
explanation
mastery
Capability direction
The learner understands:
Forge will not always tell me the answer first.
PHASE 0 CHECKPOINT
The learner investigates a simple webpage and explains:
what they see
what the browser is doing
what they expected
what actually happened
4. PHASE 1 — UNDERSTAND THE WEB
Purpose
Build the foundational mental models required for frontend engineering.
MODULE 1.1 — THE BROWSER
Purpose
Understand the browser as an execution and rendering environment.
Major concepts
browser responsibilities
documents
resources
parsing
DOM
CSS
JavaScript
rendering
browser APIs
Capability direction
The learner can explain the browser's role in producing an interactive webpage.
MODULE 1.2 — REQUESTS, RESPONSES & HTTP
Purpose
Understand how browsers communicate with servers.
Major concepts
URLs
DNS at a conceptual level
HTTP
requests
responses
methods
status codes
headers
request/response lifecycle
Capability direction
The learner can inspect and explain basic web requests.
MODULE 1.3 — HTML: STRUCTURE & MEANING
Purpose
Teach HTML as document structure rather than tag memorization.
Major concepts
elements
nesting
hierarchy
attributes
document structure
semantic HTML
links
images
forms
tables
metadata
Capability direction
The learner can construct meaningful document structure.
MODULE 1.4 — THE DOM
Purpose
Build the mental model connecting HTML source to browser structure.
Major concepts
DOM tree
nodes
elements
relationships
parent/child/sibling relationships
DOM inspection
DOM representation
Capability direction
The learner can inspect and reason about document structure.
MODULE 1.5 — BROWSER RENDERING
Purpose
Explain how source code becomes visible pixels.
Major concepts
parsing
DOM construction
CSS processing
style calculation
layout
painting
rendering
visual updates
Capability direction
The learner can reason about the major stages between code and visible UI.
MODULE 1.6 — DEVELOPER TOOLS
Purpose
Turn browser tools into everyday engineering instruments.
Major concepts
Elements panel
Console
Network panel
Sources
breakpoints
inspecting styles
editing live
reading errors
gathering evidence
Capability direction
The learner can investigate a webpage rather than merely look at it.
PHASE 1 CHECKPOINT
Given a webpage and a simple problem, the learner should:
inspect it
identify relevant evidence
form a hypothesis
test the hypothesis
explain the result
5. PHASE 2 — BUILD THE INTERFACE
Purpose
Develop the ability to deliberately construct interfaces and reason about layout.
MODULE 2.1 — CSS: THE LANGUAGE OF APPEARANCE
Major concepts
selectors
declarations
properties
values
inheritance
cascade
specificity
source order
units
colors
typography
Capability direction
The learner can predict and control basic styling behavior.
MODULE 2.2 — THE BOX MODEL
Major concepts
content
padding
border
margin
width
height
box sizing
overflow
dimensions
Capability direction
The learner can explain why elements occupy the space they do.
MODULE 2.3 — LAYOUT & FLOW
Major concepts
normal flow
block formatting
inline behavior
display
positioning
containing blocks
stacking contexts
Capability direction
The learner can reason about where elements appear and why.
MODULE 2.4 — FLEXBOX
Major concepts
flex containers
main axis
cross axis
alignment
distribution
sizing
wrapping
gaps
common layout patterns
Capability direction
The learner can design and debug one-dimensional layouts.
MODULE 2.5 — CSS GRID
Major concepts
grid containers
tracks
lines
areas
placement
responsive grids
gaps
sizing
Capability direction
The learner can design and debug two-dimensional layouts.
MODULE 2.6 — RESPONSIVE DESIGN
Major concepts
viewport
media queries
fluid sizing
breakpoints
responsive composition
mobile-first design
adaptive layouts
Capability direction
The learner can build interfaces that respond intentionally to different environments.
MODULE 2.7 — ACCESSIBLE INTERFACES
Major concepts
semantic elements
keyboard navigation
focus
labels
accessible forms
contrast
interaction states
basic screen-reader considerations
Capability direction
The learner understands that visual correctness is not sufficient.
MODULE 2.8 — VISUAL ENGINEERING
Major concepts
spacing
hierarchy
alignment
typography systems
reusable visual patterns
consistency
translating design intent into code
Capability direction
The learner can turn visual requirements into structured frontend implementation.
MODULE 2.9 — CSS DEBUGGING
Major concepts
computed styles
specificity conflicts
inherited styles
layout inspection
overflow debugging
positioning bugs
responsive bugs
Capability direction
The learner can investigate why a layout does not behave as expected.
PHASE 2 CHECKPOINT
The learner receives a visual specification and must:
construct the interface
make it responsive
maintain semantic structure
diagnose at least one intentionally introduced layout problem
explain the cause
6. PHASE 3 — PROGRAM THE BROWSER
Purpose
Transform the learner from interface builder into browser programmer.
MODULE 3.1 — VALUES & VARIABLES
Major concepts
values
variables
assignment
expressions
primitive types
type inspection
mutation
Capability direction
The learner can reason about data stored and manipulated by programs.
MODULE 3.2 — DECISIONS & CONTROL FLOW
Major concepts
conditions
comparisons
truthiness
logical operators
branching
loops
Capability direction
The learner can predict and control program flow.
MODULE 3.3 — FUNCTIONS
Major concepts
function definitions
parameters
arguments
return values
function calls
callbacks
reusable behavior
Capability direction
The learner can package and reason about behavior.
MODULE 3.4 — WORKING WITH DATA
Major concepts
arrays
objects
iteration
transformation
map
filter
find
reduce
destructuring
Capability direction
The learner can manipulate real application data.
MODULE 3.5 — THE DOM IN MOTION
Major concepts
selecting elements
creating elements
modifying elements
attributes
classes
text
DOM traversal
Capability direction
The learner can change the interface through JavaScript.
MODULE 3.6 — EVENTS
Major concepts
events
event listeners
event handlers
event objects
propagation
bubbling
capturing
delegation
Capability direction
The learner can reason about user interaction and event flow.
MODULE 3.7 — FORMS & USER INPUT
Major concepts
form controls
input values
submit events
validation
error states
user feedback
Capability direction
The learner can build interfaces that accept and respond to user input.
MODULE 3.8 — BROWSER STATE
Major concepts
UI state
data state
derived values
state transitions
synchronization
Capability direction
The learner begins thinking about interfaces as stateful systems.
MODULE 3.9 — JAVASCRIPT DEBUGGING
Major concepts
syntax errors
runtime errors
logical errors
console investigation
breakpoints
variable inspection
tracing
Capability direction
The learner can investigate JavaScript failures systematically.
PHASE 3 CHECKPOINT
Build an interactive browser application that:
accepts user input
changes state
updates the DOM
handles events
validates input
handles failure
can be debugged without a step-by-step recipe
7. PHASE 4 — THINK IN JAVASCRIPT
Purpose
Move from using JavaScript to understanding its execution model.
MODULE 4.1 — HOW JAVASCRIPT EXECUTES
Major concepts
execution context
call stack
evaluation
execution order
expressions
statements
Capability direction
The learner can mentally trace program execution.
MODULE 4.2 — SCOPE & CLOSURES
Major concepts
lexical scope
block scope
function scope
variable lookup
closures
Capability direction
The learner can explain where values come from and why they remain accessible.
MODULE 4.3 — OBJECTS, REFERENCES & MUTATION
Major concepts
object references
copying
mutation
equality
nested structures
reference behavior
Capability direction
The learner can reason about why changing one value may affect another.
MODULE 4.4 — FUNCTIONS AT DEPTH
Major concepts
higher-order functions
callbacks
closures
composition
this
function context
Capability direction
The learner can reason about functions as values and behavior.
MODULE 4.5 — MODULES & PROGRAM STRUCTURE
Major concepts
imports
exports
module boundaries
dependencies
separation of concerns
Capability direction
The learner can organize JavaScript beyond one file.
MODULE 4.6 — ASYNCHRONOUS JAVASCRIPT
Major concepts
synchronous execution
asynchronous work
callbacks
promises
async/await
event loop
task scheduling
Capability direction
The learner can reason about when asynchronous operations complete and how code continues.
MODULE 4.7 — ERRORS & FAILURE
Major concepts
throwing errors
catching errors
rejected promises
error propagation
defensive programming
Capability direction
The learner can distinguish and investigate different classes of failure.
MODULE 4.8 — JAVASCRIPT INVESTIGATION
Major concepts
execution tracing
prediction
debugger usage
hypothesis testing
minimal reproduction
Capability direction
The learner can investigate unfamiliar JavaScript behavior.
PHASE 4 CHECKPOINT
The learner receives unfamiliar JavaScript containing:
nested functions
scope
objects
asynchronous behavior
a subtle bug
They must:
predict behavior
reproduce it
inspect execution
identify the cause
fix it
explain the mechanism
8. PHASE 5 — BUILD INTERACTIVE APPLICATIONS
Purpose
Teach the learner to build applications rather than isolated browser behaviors.
MODULE 5.1 — APPLICATION STATE
Major concepts
state modeling
state transitions
derived state
state synchronization
state ownership
Capability direction
The learner can model an application's changing information.
MODULE 5.2 — DATA FROM THE NETWORK
Major concepts
fetch
JSON
request lifecycle
loading
success
failure
retries
request cancellation concepts
Capability direction
The learner can build interfaces that depend on remote data.
MODULE 5.3 — ASYNCHRONOUS UI
Major concepts
loading states
error states
empty states
stale data
race conditions
optimistic behavior
Capability direction
The learner can design UI around asynchronous reality.
MODULE 5.4 — FORMS AS SYSTEMS
Major concepts
form state
validation
submission
server responses
errors
optimistic feedback
recovery
Capability direction
The learner can design robust user-input workflows.
MODULE 5.5 — PERSISTENCE
Major concepts
local storage
session storage
serialization
persistence decisions
restoring application state
Capability direction
The learner can decide what state should survive a page reload.
MODULE 5.6 — APPLICATION ARCHITECTURE
Major concepts
modules
responsibilities
boundaries
reusable behavior
separation of concerns
data flow
Capability direction
The learner can organize a growing frontend application.
MODULE 5.7 — APPLICATION DEBUGGING
Major concepts
stale state
incorrect state transitions
failed requests
race conditions
invalid data
synchronization problems
Capability direction
The learner can diagnose failures that emerge from interacting systems.
MODULE 5.8 — BUILDING REAL FEATURES
Major concepts
requirements
acceptance criteria
feature decomposition
implementation planning
testing behavior
Capability direction
The learner can turn requirements into working frontend features.
PHASE 5 CHECKPOINT
Build a multi-feature application with:
remote data
forms
validation
persistent state
loading/error/empty states
multiple UI states
structured code organization
The learner must also explain their architecture.
9. PHASE 6 — THINK IN REACT
Purpose
Teach React as a solution to UI architecture problems rather than a syntax collection.
MODULE 6.1 — WHY COMPONENTS?
Major concepts
UI complexity
reusable pieces
component boundaries
composition
responsibilities
Capability direction
The learner understands why component-based UI architecture exists.
MODULE 6.2 — JSX & RENDERING
Major concepts
JSX
expressions
conditional rendering
lists
keys
rendering behavior
Capability direction
The learner can reason about how React describes UI.
MODULE 6.3 — PROPS & DATA FLOW
Major concepts
props
parent-child relationships
data flow
component interfaces
composition
Capability direction
The learner can design predictable component communication.
MODULE 6.4 — STATE
Major concepts
state
updates
state ownership
derived state
lifting state
state transitions
Capability direction
The learner can model interactive UI state using React.
MODULE 6.5 — EVENTS & INTERACTION
Major concepts
event handlers
state updates
user interactions
controlled behavior
Capability direction
The learner can build responsive React interfaces.
MODULE 6.6 — EFFECTS & SYNCHRONIZATION
Major concepts
effects
dependencies
cleanup
external systems
synchronization
avoiding unnecessary effects
Capability direction
The learner understands when and why effects are appropriate.
MODULE 6.7 — FORMS & COMPLEX UI
Major concepts
controlled inputs
validation
submission
complex form state
error handling
Capability direction
The learner can build robust React forms.
MODULE 6.8 — CUSTOM HOOKS & REUSE
Major concepts
extracting behavior
custom hooks
reuse
abstraction boundaries
Capability direction
The learner can recognize and extract reusable stateful behavior.
MODULE 6.9 — REACT ARCHITECTURE
Major concepts
component boundaries
state placement
composition
shared state
application structure
maintainability
Capability direction
The learner can make architectural decisions in React applications.
MODULE 6.10 — REACT DEBUGGING
Major concepts
unexpected renders
stale values
effect bugs
key problems
prop flow
state bugs
component boundaries
Capability direction
The learner can investigate React-specific failures.
PHASE 6 CHECKPOINT
Build and debug a realistic React application.
The learner must demonstrate:
component design
state management
data flow
forms
asynchronous behavior
reusable behavior
debugging
architectural reasoning
10. PHASE 7 — ENGINEER PRODUCTION FRONTENDS
Purpose
Move from "works locally" toward professional frontend engineering.
MODULE 7.1 — ACCESSIBILITY ENGINEERING
Major concepts
semantic HTML
keyboard navigation
focus management
screen readers
ARIA
accessible components
dynamic content
Capability direction
The learner can evaluate and improve frontend accessibility.
MODULE 7.2 — PERFORMANCE ENGINEERING
Major concepts
rendering cost
network cost
asset optimization
lazy loading
code splitting
caching
runtime performance
measurement
Capability direction
The learner can identify and address meaningful performance problems.
MODULE 7.3 — FRONTEND SECURITY
Major concepts
browser security boundaries
XSS
unsafe input
authentication concepts
authorization concepts
sensitive data
secure client behavior
Capability direction
The learner can recognize common frontend security risks.
MODULE 7.4 — TESTING
Major concepts
unit tests
component tests
integration tests
end-to-end tests
test boundaries
behavior-driven testing
Capability direction
The learner can choose appropriate testing strategies.
MODULE 7.5 — RELIABLE DATA FLOWS
Major concepts
retries
timeouts
caching
race conditions
stale data
failure recovery
optimistic UI
Capability direction
The learner can design interfaces that handle imperfect networks.
MODULE 7.6 — ERROR HANDLING & OBSERVABILITY
Major concepts
error boundaries
user-facing failures
developer failures
logging
monitoring concepts
recovery
Capability direction
The learner can design systems that fail gracefully and provide useful evidence.
MODULE 7.7 — BUILD SYSTEMS & DEPLOYMENT
Major concepts
bundling
builds
environment configuration
assets
deployment
CI/CD concepts
Capability direction
The learner understands how frontend code becomes a deployed application.
MODULE 7.8 — MAINTAINABILITY
Major concepts
code organization
naming
abstraction
duplication
refactoring
technical debt
documentation
code review
Capability direction
The learner can evaluate code beyond immediate functionality.
PHASE 7 CHECKPOINT
Audit and improve an intentionally flawed application.
The learner must identify and address problems across multiple dimensions:
accessibility
performance
security
reliability
testing
maintainability
11. PHASE 8 — THINK LIKE AN ENGINEER
Purpose
Teach engineering judgment.
MODULE 8.1 — SYSTEM THINKING
Major concepts
systems
dependencies
boundaries
data flow
responsibilities
failure propagation
Capability direction
The learner can reason about frontend systems rather than isolated components.
MODULE 8.2 — ARCHITECTURE DECISIONS
Major concepts
component architecture
state architecture
module boundaries
abstraction
coupling
cohesion
Capability direction
The learner can design maintainable application structures.
MODULE 8.3 — TRADE-OFFS
Major concepts
simplicity
flexibility
performance
maintainability
complexity
delivery speed
technical debt
Capability direction
The learner can compare multiple valid approaches.
MODULE 8.4 — CODE REVIEW
Major concepts
correctness
readability
architecture
bugs
accessibility
performance
maintainability
review communication
Capability direction
The learner can evaluate someone else's implementation.
MODULE 8.5 — AMBIGUOUS DEBUGGING
Major concepts
incomplete information
reproduction
evidence
hypotheses
isolation
verification
Capability direction
The learner can investigate problems without being told where the bug is.
MODULE 8.6 — TECHNICAL COMMUNICATION
Major concepts
explaining reasoning
assumptions
trade-offs
uncertainty
technical writing
verbal explanation
Capability direction
The learner can communicate like an engineer.
MODULE 8.7 — ENGINEERING JUDGMENT
Major concepts
choosing tools
choosing abstractions
evaluating constraints
prioritizing problems
deciding when not to change something
Capability direction
The learner develops practical engineering judgment.
PHASE 8 CHECKPOINT
Present the learner with an unfamiliar frontend system.
They must:
understand the requirements
identify risks
inspect the architecture
identify problems
propose solutions
compare alternatives
defend a decision
12. PHASE 9 — OPERATE INDEPENDENTLY
Purpose
Remove most scaffolding.
Forge becomes increasingly an environment for demonstration rather than instruction.
MODULE 9.1 — OPEN-ENDED BUILDING
Purpose
Build from requirements rather than tutorials.
Capabilities
requirements analysis
decomposition
planning
architecture
implementation
testing
MODULE 9.2 — REALISTIC DEBUGGING
Purpose
Investigate problems with incomplete information.
Capabilities
reproduction
inspection
hypothesis formation
experimentation
verification
communication
MODULE 9.3 — ARCHITECTURE CHALLENGES
Purpose
Evaluate competing approaches.
Capabilities
design
trade-off analysis
constraints
scalability
maintainability
MODULE 9.4 — CODE REVIEW CHALLENGES
Purpose
Evaluate unfamiliar code.
Capabilities
bug detection
architectural analysis
maintainability analysis
communication
MODULE 9.5 — INTERVIEW SIMULATIONS
Purpose
Combine technical knowledge, reasoning, implementation, and communication under constraints.
Challenge types
conceptual
predictive
implementation
debugging
architecture
trade-offs
communication
MODULE 9.6 — CAPSTONE ENGINEERING
Purpose
Demonstrate independent frontend engineering ability.
Experience
The learner receives:
a product requirement
constraints
acceptance criteria
optional business context
Forge intentionally withholds:
exact implementation steps
architecture recipe
unnecessary hints
The learner must decide how to proceed.
13. CROSS-PHASE MODULES
Some capabilities should not belong exclusively to one phase.
They should appear throughout the curriculum.
DEBUGGING
Observe
↓
Reproduce
↓
Inspect
↓
Hypothesize
↓
Test
↓
Fix
↓
Verify
↓
Explain
ACCESSIBILITY
Semantic HTML
↓
Keyboard interaction
↓
Accessible styling
↓
Accessible JavaScript
↓
Accessible components
↓
Accessible applications
↓
Accessibility auditing
PERFORMANCE
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
Application performance
↓
Production optimization
SECURITY
Browser boundaries
↓
User input
↓
DOM manipulation
↓
Unsafe behavior
↓
XSS
↓
Authentication concepts
↓
Authorization
↓
Production security
TESTING
Behavior verification
↓
Small tests
↓
Component tests
↓
Integration tests
↓
End-to-end tests
↓
Test strategy
TOOLING
Inspect
↓
Console
↓
Network
↓
Debugger
↓
Performance tools
↓
Testing tools
↓
Production investigation
14. MODULE SIZING RULE
Modules should not be forced into equal sizes.
One module may contain:
4 lessons
Another may contain:
12 lessons
The determining factor is capability depth.
Do NOT create artificial symmetry.
15. MODULE COMPLETION RULE
Completing all lessons inside a module does not automatically mean mastery.
A module should culminate in evidence.
Evidence may include:
prediction
implementation
debugging
explanation
transfer
project work
16. MODULE DEPENDENCIES
Modules should form meaningful dependency relationships.
Example:
HTML
 ↓
DOM
 ↓
JavaScript DOM manipulation
 ↓
Events
 ↓
Interactive applications
 ↓
React
Another:
CSS fundamentals
 ↓
Box model
 ↓
Layout
 ↓
Flexbox
 ↓
Grid
 ↓
Responsive design
 ↓
Production UI
Dependencies should guide the curriculum.
They should not unnecessarily lock learners into a rigid linear path.
17. MODULE DESIGN RULE
Every module must have:
A clear starting mental model
What does the learner currently believe?
A target mental model
What should they understand afterward?
A capability outcome
What should they be able to do?
Practice opportunities
How will they use it?
Failure opportunities
How will they discover misconceptions?
Debugging opportunities
How will they diagnose problems?
Transfer opportunities
Where will they apply the idea later?
18. MODULE GENERATION ORDER
The final curriculum must NOT jump directly from this module map to full lesson generation.
The next design layer is:
MODULE
 ↓
CAPABILITIES
 ↓
CONCEPTS
 ↓
DEPENDENCIES
 ↓
MASTERY SIGNALS
 ↓
LESSON MAP
Capabilities must be defined before lessons.
19. FINAL MODULE MAP
PHASE 0 — ENTER THE WEB

0.1 Meet the Web
0.2 Your First Browser Investigation
0.3 How Forge Works


PHASE 1 — UNDERSTAND THE WEB

1.1 The Browser
1.2 Requests, Responses & HTTP
1.3 HTML: Structure & Meaning
1.4 The DOM
1.5 Browser Rendering
1.6 Developer Tools


PHASE 2 — BUILD THE INTERFACE

2.1 CSS: The Language of Appearance
2.2 The Box Model
2.3 Layout & Flow
2.4 Flexbox
2.5 CSS Grid
2.6 Responsive Design
2.7 Accessible Interfaces
2.8 Visual Engineering
2.9 CSS Debugging


PHASE 3 — PROGRAM THE BROWSER

3.1 Values & Variables
3.2 Decisions & Control Flow
3.3 Functions
3.4 Working with Data
3.5 The DOM in Motion
3.6 Events
3.7 Forms & User Input
3.8 Browser State
3.9 JavaScript Debugging


PHASE 4 — THINK IN JAVASCRIPT

4.1 How JavaScript Executes
4.2 Scope & Closures
4.3 Objects, References & Mutation
4.4 Functions at Depth
4.5 Modules & Program Structure
4.6 Asynchronous JavaScript
4.7 Errors & Failure
4.8 JavaScript Investigation


PHASE 5 — BUILD INTERACTIVE APPLICATIONS

5.1 Application State
5.2 Data from the Network
5.3 Asynchronous UI
5.4 Forms as Systems
5.5 Persistence
5.6 Application Architecture
5.7 Application Debugging
5.8 Building Real Features


PHASE 6 — THINK IN REACT

6.1 Why Components?
6.2 JSX & Rendering
6.3 Props & Data Flow
6.4 State
6.5 Events & Interaction
6.6 Effects & Synchronization
6.7 Forms & Complex UI
6.8 Custom Hooks & Reuse
6.9 React Architecture
6.10 React Debugging


PHASE 7 — ENGINEER PRODUCTION FRONTENDS

7.1 Accessibility Engineering
7.2 Performance Engineering
7.3 Frontend Security
7.4 Testing
7.5 Reliable Data Flows
7.6 Error Handling & Observability
7.7 Build Systems & Deployment
7.8 Maintainability


PHASE 8 — THINK LIKE AN ENGINEER

8.1 System Thinking
8.2 Architecture Decisions
8.3 Trade-offs
8.4 Code Review
8.5 Ambiguous Debugging
8.6 Technical Communication
8.7 Engineering Judgment


PHASE 9 — OPERATE INDEPENDENTLY

9.1 Open-Ended Building
9.2 Realistic Debugging
9.3 Architecture Challenges
9.4 Code Review Challenges
9.5 Interview Simulations
9.6 Capstone Engineering
20. FINAL STANDARD
The module map must produce a curriculum where the learner gradually moves from:
"What is this?"
to:
"How does this work?"
to:
"What will happen?"
to:
"How can I change it?"
to:
"How do I build with it?"
to:
"Why is this broken?"
to:
"Which approach should I choose?"
to:
"How do I explain my decision?"
to:
"I can figure this out."
That progression is the reason these modules exist.
The module map is successful only if it supports that transformation.
