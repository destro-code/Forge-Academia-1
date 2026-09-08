# FORGE CONCEPT DEPENDENCY MAP
## Version 1.0

> This document defines the conceptual dependency graph underlying the Forge curriculum.
>
> It answers:
>
> **What must the learner understand before they can reliably develop a capability?**
>
> This is NOT the lesson map.
>
> It does NOT prescribe individual activities.
>
> It does NOT mean every concept gets its own lesson.
>
> It defines the conceptual infrastructure from which the lesson map will be designed.

---

# 1. PURPOSE

Forge is not organized around a list of technologies.

It is organized around capabilities.

Capabilities themselves depend on mental models.

Therefore:

```text
PHASE
  ↓
MODULE
  ↓
CAPABILITY
  ↓
CONCEPTS
  ↓
DEPENDENCIES
  ↓
LESSON EXPERIENCES
  ↓
ACTIVITIES
  ↓
EVIDENCE
The dependency map exists to prevent a common curriculum failure:
Topic A
↓
Topic B
↓
Topic C
↓
Topic D
without asking whether the learner actually has the mental models required to understand B, C, or D.
2. CORE PRINCIPLE
A concept belongs earlier when later reasoning genuinely depends on it.
A concept belongs later when introducing it earlier would create:
unnecessary abstraction
memorization without context
premature complexity
vocabulary without meaningful use
Therefore:
Teach concepts at the earliest point where they become useful, not merely at the earliest point where they exist.
3. DEPENDENCY TYPES
Forge recognizes several dependency relationships.
FOUNDATIONAL
Concept B cannot be meaningfully understood without concept A.
A → B
SUPPORTING
Concept A makes B substantially easier but B can be introduced without complete mastery of A.
A ⇢ B
CONTEXTUAL
Concept A provides context for B but is not a strict prerequisite.
A ↝ B
SPIRAL
Concept A appears again later at greater depth.
A → A₂ → A₃
APPLICATION
A concept is learned in one context and deliberately reused elsewhere.
A → Application B
4. GLOBAL CONCEPT FOUNDATIONS
Before the curriculum branches into specialized domains, the learner needs several foundational mental models.
THE WEB
  │
  ├── Browser
  ├── Server
  ├── Network
  ├── Resources
  └── Requests / Responses
          │
          ↓
       WEBPAGE
          │
          ├── HTML
          ├── CSS
          └── JavaScript
                  │
                  ↓
               BROWSER
                  │
                  ├── DOM
                  ├── CSS processing
                  ├── JavaScript execution
                  └── Rendering
This becomes the conceptual foundation for the rest of Forge.
5. WEB CONCEPT GRAPH
5.1 Web Basics
Internet
  ↓
Web
  ↓
Browser
  ↓
Webpage
  ↓
Web application
The learner should distinguish:
Internet vs Web
browser vs website
webpage vs application
frontend vs backend
5.2 Client / Server Model
User
 ↓
Browser
 ↓
Request
 ↓
Server
 ↓
Response
 ↓
Browser
 ↓
Rendered interface
This model becomes foundational for:
HTTP
APIs
networking
authentication
application data
debugging
6. URL / NETWORK / HTTP GRAPH
URL
 ↓
DNS
 ↓
Host
 ↓
HTTP request
 ↓
Server
 ↓
HTTP response
 ↓
Resource
HTTP concepts:
HTTP
 ├── Request
 │    ├── Method
 │    ├── URL
 │    ├── Headers
 │    └── Body
 │
 └── Response
      ├── Status
      ├── Headers
      └── Body
These concepts support:
Network debugging
APIs
application data
authentication
reliability
security
7. HTML CONCEPT GRAPH
Document
 ↓
Element
 ↓
Nesting
 ↓
Hierarchy
 ↓
Attributes
 ↓
Semantics
Then:
HTML
 ↓
Document structure
 ↓
DOM
Semantic HTML expands into:
Semantics
 ├── Headings
 ├── Links
 ├── Buttons
 ├── Forms
 ├── Navigation
 ├── Sections
 └── Landmarks
These later support:
accessibility
DOM reasoning
JavaScript interaction
React components
8. DOM CONCEPT GRAPH
HTML source
 ↓
Parsing
 ↓
DOM tree
 ↓
Nodes
 ↓
Relationships
Then:
DOM tree
 ├── Parent
 ├── Child
 ├── Sibling
 └── Descendant
This supports:
DOM
 ↓
DOM inspection
 ↓
DOM manipulation
 ↓
Events
 ↓
Interactive UI
Later:
DOM
 ↓
React rendering
 ↓
Component output
The learner should eventually understand that React does not replace the browser's underlying document and rendering machinery.
9. BROWSER RENDERING GRAPH
HTML
 ↓
Parse
 ↓
DOM
and:
CSS
 ↓
Parse / process
 ↓
Styles
Together:
DOM + CSS
 ↓
Style calculation
 ↓
Layout
 ↓
Paint
 ↓
Rendered pixels
JavaScript interacts with this system:
JavaScript
 ↓
DOM / styles / browser APIs
 ↓
Potential rendering update
This graph supports:
CSS debugging
layout reasoning
performance
DOM manipulation
browser investigation
10. CSS CONCEPT GRAPH
10.1 Styling Fundamentals
CSS rule
 ↓
Selector
 ↓
Declaration
 ↓
Property + Value
Then:
Styles
 ↓
Cascade
 ├── Origin
 ├── Importance
 ├── Specificity
 └── Source order
And:
Inheritance
 ↘
Cascade → Computed styles
10.2 Box Model
Element
 ↓
Content
 ↓
Padding
 ↓
Border
 ↓
Margin
Combined with:
Width / Height
 ↓
Box sizing
 ↓
Actual dimensions
This supports layout reasoning.
11. CSS LAYOUT GRAPH
Normal Flow
 ↓
Block / Inline
 ↓
Positioning
 ↓
Containing Blocks
Then layout systems:
Layout
 ├── Flexbox
 │
 └── Grid
Flexbox:
Flex container
 ↓
Main axis
 ↓
Cross axis
 ↓
Alignment
 ↓
Distribution
 ↓
Sizing
Grid:
Grid container
 ↓
Tracks
 ↓
Lines
 ↓
Areas
 ↓
Placement
Then:
Layout systems
 ↓
Responsive design
 ↓
Adaptive interface
12. CSS VISUAL STACKING GRAPH
Positioning
 ↓
Stacking
 ↓
Stacking contexts
 ↓
Paint order
This supports later debugging of:
overlays
modals
dropdowns
z-index problems
layered interfaces
13. RESPONSIVE DESIGN GRAPH
Viewport
 ↓
Available space
 ↓
Layout constraints
 ↓
Responsive behavior
Then:
Responsive behavior
 ├── Fluid sizing
 ├── Media queries
 ├── Breakpoints
 ├── Wrapping
 └── Recomposition
The key mental model:
Responsive design is adaptation to constraints, not "desktop versus mobile."
14. ACCESSIBILITY CONCEPT GRAPH
Accessibility begins early with HTML.
Semantic HTML
 ↓
Meaningful structure
 ↓
Browser accessibility representation
 ↓
Assistive technology
Interaction:
Interactive control
 ↓
Keyboard access
 ↓
Focus
 ↓
Interaction state
Forms:
Form control
 ↓
Label
 ↓
Input purpose
 ↓
Validation feedback
Later:
Accessibility
 ↓
Dynamic UI
 ↓
React components
 ↓
Complex applications
 ↓
Accessibility auditing
15. JAVASCRIPT FOUNDATIONS GRAPH
JavaScript
 ↓
Values
 ↓
Variables
 ↓
Expressions
 ↓
Operators
 ↓
Types
Then:
Values + Expressions
 ↓
Conditions
 ↓
Control flow
 ↓
Loops
And:
Functions
 ↓
Parameters
 ↓
Arguments
 ↓
Return values
 ↓
Callbacks
16. JAVASCRIPT DATA GRAPH
Collections
 ├── Arrays
 └── Objects
Then:
Collections
 ↓
Iteration
 ↓
Transformation
 ├── map
 ├── filter
 ├── find
 └── reduce
Then:
Destructuring
 ↓
Data extraction
 ↓
Data transformation
This supports application data handling.
17. JAVASCRIPT EXECUTION GRAPH
Code
 ↓
Execution
 ↓
Execution context
 ↓
Call stack
 ↓
Function calls
 ↓
Return
This becomes foundational for debugging.
18. SCOPE GRAPH
Code
 ↓
Lexical environment
 ↓
Scope
 ↓
Variable lookup
Then:
Scope
 ├── Block scope
 └── Function scope
Then:
Lexical scope
 ↓
Closure
 ↓
Persistent access to outer variables
Closures later support understanding:
callbacks
event handlers
React hooks
async code
encapsulation
19. OBJECT / REFERENCE GRAPH
Objects
 ↓
References
 ↓
Identity
 ↓
Mutation
Then:
References
 ↓
Shared references
 ↓
Unexpected mutation
Then:
Copying
 ├── Shallow copying
 └── Deeper copying concepts
This supports:
state management
React state
debugging
immutability reasoning
20. FUNCTION DEPTH GRAPH
Functions
 ↓
Functions as values
 ↓
Callbacks
 ↓
Higher-order functions
 ↓
Closures
Separately:
Function invocation
 ↓
Execution context
 ↓
this
These concepts should not be introduced as disconnected syntax rules.
They should emerge from actual behavior.
21. MODULE GRAPH
Code
 ↓
Multiple files
 ↓
Module
 ↓
Export
 ↓
Import
 ↓
Dependency graph
Then:
Modules
 ↓
Boundaries
 ↓
Responsibilities
 ↓
Architecture
This becomes increasingly important in application architecture.
22. ASYNCHRONOUS JAVASCRIPT GRAPH
Synchronous execution
 ↓
Call stack
 ↓
Asynchronous work
 ↓
Completion
 ↓
Callback / continuation
Then:
Callbacks
 ↓
Promises
 ↓
Promise states
 ├── Pending
 ├── Fulfilled
 └── Rejected
Then:
Promises
 ↓
async / await
 ↓
Asynchronous control flow
Underneath:
JavaScript execution
 ↓
Event loop
 ↓
Task scheduling
 ↓
Observable ordering
This supports:
API requests
UI loading
race conditions
React effects
application reliability
23. ERROR MODEL GRAPH
Failure
 ↓
Error
 ↓
Propagation
Then:
Synchronous failure
 └── throw

Asynchronous failure
 └── rejection
Then:
Failure
 ↓
Catch / handle
 ↓
Recover / report / propagate
This becomes important across:
JavaScript
networking
forms
React
production systems
24. BROWSER PROGRAMMING GRAPH
JavaScript
 ↓
Browser APIs
 ↓
DOM
 ↓
Events
 ↓
User interaction
Events:
Event
 ↓
Target
 ↓
Handler
 ↓
Propagation
 ├── Capturing
 └── Bubbling
Then:
Events
 ↓
State change
 ↓
DOM update
 ↓
Rendered result
This is the foundation of interactive browser applications.
25. APPLICATION STATE GRAPH
User interaction
 ↓
State transition
 ↓
New state
 ↓
Derived values
 ↓
UI representation
Important distinction:
Source state
      ↓
Derived state
      ↓
Rendered UI
The learner should recognize:
If something can be calculated from existing state, it may not need to be stored as independent state.
This becomes critical in React.
26. NETWORK APPLICATION GRAPH
UI action
 ↓
Request
 ↓
Network
 ↓
Response
 ↓
Parse data
 ↓
Application state
 ↓
UI
Failure paths:
Request
 ├── Success
 ├── Failure
 ├── Timeout
 ├── Empty result
 └── Stale result
This supports reliable application design.
27. ASYNCHRONOUS UI GRAPH
User intent
 ↓
Request begins
 ↓
Loading
 ↓
 ┌───────────────┬──────────────┐
 ↓               ↓              ↓
Success        Failure        Empty
 ↓               ↓              ↓
UI update      Recovery        Feedback
Later:
Concurrent requests
 ↓
Race conditions
 ↓
Stale responses
 ↓
Correct synchronization
28. APPLICATION ARCHITECTURE GRAPH
Requirements
 ↓
Responsibilities
 ↓
Boundaries
 ↓
Modules
 ↓
Data flow
 ↓
Components
Then:
Architecture
 ├── Coupling
 ├── Cohesion
 ├── Reuse
 ├── Abstraction
 └── Maintainability
This becomes the bridge from coding to engineering.
29. REACT CONCEPT GRAPH
React should be introduced after the learner already understands:
HTML
DOM
JavaScript
functions
state
events
application architecture
The conceptual bridge:
Imperative UI
 ↓
DOM manipulation
 ↓
UI becomes difficult to manage
 ↓
Declarative UI
 ↓
Components
30. COMPONENT GRAPH
UI
 ↓
Component
 ↓
Composition
 ↓
Component boundaries
Then:
Component
 ├── Props
 ├── State
 └── Rendered output
The learner should understand:
A component is not merely a file containing JSX.
It is a unit of UI responsibility.
31. REACT DATA FLOW GRAPH
Parent
 ↓
Props
 ↓
Child
 ↓
Interaction
 ↓
State update
 ↓
Render
Then:
State ownership
 ↓
Lifting state
 ↓
Shared data flow
This supports architecture decisions.
32. REACT RENDERING GRAPH
State / Props change
 ↓
Render
 ↓
React determines UI description
 ↓
DOM updates
 ↓
Browser rendering
This connects React back to the browser model.
React does not replace:
DOM
browser rendering
JavaScript execution
CSS
It operates within those systems.
33. REACT EFFECT GRAPH
Effects should emerge from the concept of synchronization.
Component
 ↓
Render
 ↓
External system
Examples:
network
subscriptions
timers
browser APIs
Then:
Effect
 ↓
Dependency relationship
 ↓
Synchronization
 ↓
Cleanup
The learner should eventually recognize:
An effect is not "code that runs after rendering."
It is a mechanism for synchronizing with something outside React's render calculation.
34. REACT HOOK GRAPH
Component logic
 ↓
Repeated stateful behavior
 ↓
Extraction
 ↓
Custom hook
 ↓
Reusable behavior
The learner should understand abstraction before being asked to create abstractions.
35. REACT DEBUGGING GRAPH
Unexpected UI
 ↓
Observe rendered result
 ↓
Inspect props
 ↓
Inspect state
 ↓
Trace render
 ↓
Inspect effects
 ↓
Identify mismatch
 ↓
Fix
 ↓
Verify
This should connect directly to Forge's global debugging model.
36. PERFORMANCE CONCEPT GRAPH
Performance should build on browser understanding.
Browser
 ↓
Network
 ↓
Parsing
 ↓
JavaScript
 ↓
Style calculation
 ↓
Layout
 ↓
Paint
Then:
Performance problem
 ↓
Measure
 ↓
Identify bottleneck
 ↓
Optimize
 ↓
Measure again
The central principle:
Do not optimize what has not been measured.
37. SECURITY CONCEPT GRAPH
Security should build from browser boundaries and user input.
Browser boundary
 ↓
Untrusted input
 ↓
Data handling
 ↓
DOM / application behavior
Then:
Unsafe input
 ↓
Injection risk
 ↓
XSS
Authentication:
Identity
 ↓
Authentication
 ↓
Session
Authorization:
Identity
 ↓
Permissions
 ↓
Authorization
Critical distinction:
Authentication answers "Who are you?"
Authorization answers "What are you allowed to do?"
38. TESTING CONCEPT GRAPH
Expected behavior
 ↓
Verification
 ↓
Test
Then:
Testing
 ├── Unit
 ├── Component
 ├── Integration
 └── End-to-end
The learner should understand testing as evidence, not ceremony.
39. DEPLOYMENT CONCEPT GRAPH
Source code
 ↓
Build
 ↓
Artifacts
 ↓
Deployment
 ↓
Production
Then:
Development environment
        ↓
Configuration
        ↓
Build environment
        ↓
Production environment
This supports production debugging.
40. ENGINEERING JUDGMENT GRAPH
This is one of the highest-level conceptual structures in Forge.
Problem
 ↓
Requirements
 ↓
Constraints
 ↓
Possible solutions
 ↓
Trade-offs
 ↓
Decision
 ↓
Implementation
 ↓
Evidence
 ↓
Revision
This is the transition from:
"How do I code this?"
to:
"What is the appropriate solution?"
41. DEBUGGING CONCEPT GRAPH
Debugging should sit above individual technologies.
Symptom
 ↓
Observation
 ↓
Reproduction
 ↓
Evidence
 ↓
Hypothesis
 ↓
Experiment
 ↓
Root cause
 ↓
Fix
 ↓
Verification
 ↓
Explanation
This same mental model should be reused for:
browser bugs
HTML problems
CSS problems
JavaScript problems
async problems
React problems
network problems
production problems
The surface changes.
The reasoning process remains.
42. CONCEPT SPIRAL
Important concepts must deliberately reappear.
DOM
HTML structure
 ↓
DOM tree
 ↓
DOM inspection
 ↓
DOM manipulation
 ↓
React rendering
 ↓
Production debugging
Events
Browser events
 ↓
Event listeners
 ↓
Propagation
 ↓
Application interactions
 ↓
React events
 ↓
Complex UI behavior
State
Browser state
 ↓
Application state
 ↓
Async state
 ↓
React state
 ↓
Architecture
Functions
Basic functions
 ↓
Callbacks
 ↓
Higher-order functions
 ↓
Closures
 ↓
Async callbacks
 ↓
Custom hooks
Debugging
Simple observation
 ↓
DevTools
 ↓
CSS debugging
 ↓
JS debugging
 ↓
Async debugging
 ↓
Application debugging
 ↓
React debugging
 ↓
Production debugging
 ↓
Ambiguous debugging
43. CONCEPT TIMING RULE
A concept should be introduced when at least one of the following becomes true:
1. The learner needs it to explain current behavior.
2. The learner needs it to complete a meaningful task.
3. The learner has encountered the limitation it solves.
4. The learner has formed a misconception that the concept resolves.
5. The learner is ready to generalize a pattern they have already experienced.
Avoid teaching concepts merely because they appear on a technology checklist.
44. DELAYED CONCEPTS
Some concepts should deliberately be delayed.
Examples:
Prototypes
Do not introduce deeply during JavaScript basics.
First establish:
objects
properties
references
functions
Then introduce prototypes when the learner needs to understand JavaScript's object model.
this
Do not introduce as an isolated vocabulary item.
Introduce after:
functions
invocation
execution context
Event loop
Do not begin JavaScript with it.
Introduce after:
synchronous execution
call stack
callbacks
asynchronous behavior
React effects
Do not introduce immediately after JSX.
First establish:
rendering
state
events
external systems
Then effects become understandable.
Architecture
Do not teach architecture as diagrams first.
Let learners experience:
growing code
duplication
tangled responsibilities
state ownership problems
Then introduce architectural concepts as solutions to experienced problems.
45. CONCEPT MERGING RULE
Multiple concepts can be taught together when they form one meaningful mental model.
Example:
CSS cascade
+
specificity
+
inheritance
+
source order
can form one larger concept:
"How the browser decides which styles win."
Similarly:
Promises
+
async/await
+
error handling
can form:
"How asynchronous work flows through an application."
Do not artificially split concepts simply because they have separate names.
46. CONCEPT SEPARATION RULE
Concepts should be separated when combining them would overload the learner or hide an important distinction.
Example:
Authentication
≠
Authorization
They should be connected but clearly distinguished.
Likewise:
State
≠
Derived state
and:
Symptom
≠
Root cause
and:
Rendering
≠
Painting
47. PREREQUISITE STRENGTH
Not every dependency is equally strong.
Use:
REQUIRED
when the learner genuinely cannot proceed without it.
Use:
HELPFUL
when it improves understanding but is not essential.
Use:
CONTEXT
when it provides useful framing.
This prevents the curriculum from becoming unnecessarily linear.
48. TECHNOLOGY DEPENDENCY RULE
Technology should sit on top of concepts.
For example:
Component architecture
       ↓
Declarative UI
       ↓
React
not:
React
 ↓
Components
 ↓
State
Similarly:
HTTP
 ↓
Network requests
 ↓
fetch
not:
fetch
 ↓
HTTP
Technology is an implementation of concepts.
49. FINAL CONCEPT DEPENDENCY SPINE
The major conceptual spine of Forge is:
THE WEB
  ↓
BROWSER
  ↓
REQUEST / RESPONSE
  ↓
HTML
  ↓
DOM
  ↓
CSS
  ↓
LAYOUT
  ↓
JAVASCRIPT
  ↓
EXECUTION
  ↓
FUNCTIONS / DATA
  ↓
EVENTS
  ↓
STATE
  ↓
ASYNC
  ↓
APPLICATIONS
  ↓
ARCHITECTURE
  ↓
REACT
  ↓
PRODUCTION ENGINEERING
  ↓
ENGINEERING JUDGMENT
  ↓
INDEPENDENT OPERATION
This is a conceptual spine, not a rigid linear syllabus.
50. FINAL LEARNING TRANSFORMATION
The dependency graph should ultimately produce this progression:
WEB
 ↓
"I know what I'm looking at."

BROWSER
 ↓
"I understand what the browser is doing."

HTML / CSS
 ↓
"I can control the structure and appearance."

JAVASCRIPT
 ↓
"I can make the interface behave."

EXECUTION
 ↓
"I understand what my code is actually doing."

APPLICATIONS
 ↓
"I can organize behavior into a system."

REACT
 ↓
"I can manage UI complexity."

PRODUCTION
 ↓
"I understand real-world consequences."

ENGINEERING
 ↓
"I can evaluate competing solutions."

INDEPENDENCE
 ↓
"I can figure out what to do next."
51. THE MOST IMPORTANT DEPENDENCY
There is one dependency that exists across the entire curriculum:
OBSERVATION
 ↓
MENTAL MODEL
 ↓
PREDICTION
 ↓
EXPERIMENT
 ↓
EVIDENCE
 ↓
UPDATED MENTAL MODEL
Forge should repeatedly train this loop.
A learner who memorizes the right answer but cannot investigate a new situation has not reached the final goal.
A learner who can build this loop into their thinking can continue learning after Forge ends.
