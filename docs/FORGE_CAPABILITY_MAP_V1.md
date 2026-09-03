# FORGE CAPABILITY MAP
## Version 1.0

> This document defines what the learner must become capable of doing across the Forge curriculum.
>
> A capability is an observable ability.
>
> It is not merely something the learner has "covered."
>
> The curriculum is successful when the learner can demonstrate these capabilities in unfamiliar situations.

---

# 1. PURPOSE

The Phase Map defines:

> Where the learner is going.

The Module Map defines:

> What major domains they move through.

The Capability Map defines:

> What they must actually be able to do.

The progression is therefore:

```text
PHASE
  ↓
MODULE
  ↓
CAPABILITY
  ↓
CONCEPT
  ↓
LESSON
  ↓
ACTIVITY
  ↓
EVIDENCE
Lessons exist to develop capabilities.
Activities exist to produce evidence of those capabilities.
2. WHAT COUNTS AS A CAPABILITY?
A capability must describe something observable.
Weak:
Understand CSS specificity.
Strong:
Determine which CSS rule wins when multiple selectors target the same element, and explain why.
Weak:
Learn promises.
Strong:
Predict the order in which asynchronous JavaScript operations complete and explain why.
Weak:
Learn React state.
Strong:
Model changing UI information as state, identify where that state should live, and explain the resulting data flow.
The test is:
Could Forge observe the learner doing this?
If not, it is probably a concept rather than a capability.
3. CAPABILITY DEPTH
Capabilities should progressively move through these levels.
1. RECOGNIZE
   Identify the thing.

2. UNDERSTAND
   Explain how and why it works.

3. PREDICT
   Determine what will happen before execution.

4. MANIPULATE
   Intentionally change the behavior.

5. APPLY
   Use the capability in a real task.

6. DEBUG
   Diagnose incorrect behavior.

7. EXPLAIN
   Communicate the mechanism and reasoning.

8. TRANSFER
   Apply the capability to unfamiliar situations.
Not every capability requires every level immediately.
However, important engineering capabilities should eventually reach:
Predict → Apply → Debug → Explain → Transfer
4. PHASE 0 — ENTER THE WEB
4.1 Module: Meet the Web
Capabilities
The learner can:
identify the major components involved in a typical web experience
distinguish browser, server, frontend, backend, and network responsibilities
describe the difference between a webpage and the application logic behind it
trace a simple user action through the major systems involved
identify which part of the system is likely responsible for a visible behavior
form basic questions about how a webpage works
Target depth
Recognition → Understanding → Prediction
4.2 Module: Your First Browser Investigation
Capabilities
The learner can:
open browser developer tools
inspect an element
identify basic document structure
inspect styles applied to an element
read a basic console message
identify a network request
modify a page temporarily through developer tools
use browser evidence to answer a simple question
Target depth
Recognition → Understanding → Manipulation → Investigation
4.3 Module: How Forge Works
Capabilities
The learner can:
make a prediction before receiving an explanation
compare a prediction with actual browser behavior
use failure as evidence
describe what they expected versus what happened
follow an investigation instead of immediately searching for an answer
explain a discovered behavior in their own words
Target depth
Prediction → Investigation → Explanation
5. PHASE 1 — UNDERSTAND THE WEB
5.1 Module: The Browser
Capabilities
The learner can:
identify browser responsibilities
distinguish document structure from visual presentation
distinguish browser execution from server execution
describe the relationship between HTML, CSS, and JavaScript
explain how browser APIs provide capabilities to webpages
reason about which browser subsystem is involved in a given behavior
Target depth
Understanding → Prediction → Explanation
5.2 Module: Requests, Responses & HTTP
Capabilities
The learner can:
read a URL and identify its major components
describe the conceptual role of DNS
identify an HTTP request and response
distinguish request method from response status
interpret common HTTP status codes
inspect basic headers
determine what resource a request is attempting to retrieve
reason about a failed network request using available evidence
Target depth
Understanding → Prediction → Debugging
5.3 Module: HTML — Structure & Meaning
Capabilities
The learner can:
construct valid document structure
choose semantic elements based on meaning
create meaningful heading hierarchy
create links and media appropriately
use attributes correctly
construct forms using appropriate controls
identify structural problems in HTML
explain why semantic HTML matters
Target depth
Recognition → Application → Debugging → Explanation
5.4 Module: The DOM
Capabilities
The learner can:
translate simple HTML into a DOM tree mentally
identify parent, child, and sibling relationships
inspect DOM structure in developer tools
predict how HTML changes affect the DOM
distinguish HTML source from the current DOM
reason about DOM changes caused by JavaScript
Target depth
Understanding → Prediction → Manipulation
5.5 Module: Browser Rendering
Capabilities
The learner can:
describe the major stages between source and visible UI
explain the relationship between DOM and CSS
reason about style application
identify layout as a distinct stage from painting
predict how structural or style changes affect rendering
connect visible problems to likely rendering stages
Target depth
Understanding → Prediction → Debugging
5.6 Module: Developer Tools
Capabilities
The learner can:
inspect a webpage systematically
use the Elements panel to investigate structure
use computed styles to investigate layout
use the Console to investigate JavaScript behavior
use the Network panel to investigate requests
use breakpoints for basic execution investigation
gather evidence before changing code
identify the difference between symptom and cause
Target depth
Application → Debugging → Transfer
6. PHASE 2 — BUILD THE INTERFACE
6.1 Module: CSS — The Language of Appearance
Capabilities
The learner can:
write selectors that target intended elements
predict which declarations apply
explain inheritance
explain the cascade
reason about specificity
identify why a style is not being applied
choose appropriate units
build consistent typography and color rules
Target depth
Understanding → Prediction → Manipulation → Debugging
6.2 Module: The Box Model
Capabilities
The learner can:
calculate the space occupied by an element
distinguish content, padding, border, and margin
predict how changing box-model properties affects dimensions
reason about overflow
identify unexpected sizing behavior
use box-sizing intentionally
Target depth
Prediction → Application → Debugging
6.3 Module: Layout & Flow
Capabilities
The learner can:
predict how elements participate in normal flow
distinguish block and inline behavior
reason about positioning
identify containing blocks
explain why an absolutely positioned element appears where it does
identify stacking-context problems
debug unexpected element placement
Target depth
Understanding → Prediction → Debugging
6.4 Module: Flexbox
Capabilities
The learner can:
identify the main and cross axes
predict flex item positioning
control alignment
control distribution
reason about flex sizing
handle wrapping
construct common one-dimensional layouts
debug unexpected flex behavior
Target depth
Prediction → Manipulation → Application → Debugging
6.5 Module: CSS Grid
Capabilities
The learner can:
define grid tracks
place items intentionally
reason about rows and columns
use grid areas
construct two-dimensional layouts
predict responsive grid behavior
debug unexpected placement
Target depth
Understanding → Manipulation → Application → Debugging
6.6 Module: Responsive Design
Capabilities
The learner can:
identify viewport-dependent behavior
design layouts that adapt to available space
choose breakpoints based on content rather than device names
use fluid sizing
identify responsive failure modes
test interfaces at multiple viewport sizes
explain responsive design decisions
Target depth
Application → Debugging → Explanation
6.7 Module: Accessible Interfaces
Capabilities
The learner can:
choose semantic controls
make interactive elements keyboard accessible
manage visible focus appropriately
associate labels with form controls
identify common accessibility failures
reason about accessibility beyond visual appearance
improve an inaccessible interface
Target depth
Understanding → Application → Auditing
6.8 Module: Visual Engineering
Capabilities
The learner can:
translate visual requirements into CSS
establish consistent spacing
create visual hierarchy
implement typography intentionally
maintain visual consistency across components
identify visual inconsistencies
distinguish design preference from implementation defect
Target depth
Application → Judgment
6.9 Module: CSS Debugging
Capabilities
The learner can:
reproduce a visual bug
inspect computed styles
trace style inheritance
identify specificity conflicts
identify layout constraints
isolate the earliest point where layout diverges from expectation
test a CSS hypothesis
verify the fix
Target depth
Debugging → Explanation → Transfer
7. PHASE 3 — PROGRAM THE BROWSER
7.1 Module: Values & Variables
Capabilities
The learner can:
identify JavaScript values and types
assign values to variables
predict expression results
inspect values
identify mutation
reason about changing values over time
7.2 Module: Decisions & Control Flow
Capabilities
The learner can:
predict conditional branches
reason about truthiness
use logical operators
trace loops
identify unreachable or unintended branches
construct correct control flow
debug incorrect branching
7.3 Module: Functions
Capabilities
The learner can:
define functions
pass arguments
return values
predict function output
pass functions as values
identify callback behavior
decompose repeated behavior into functions
7.4 Module: Working With Data
Capabilities
The learner can:
access array elements
access object properties
iterate through collections
transform arrays
filter data
search data
combine data transformations
destructure values
choose an appropriate data operation
7.5 Module: The DOM in Motion
Capabilities
The learner can:
select DOM elements
create elements
modify content
modify attributes
modify classes
create dynamic UI changes
predict DOM changes caused by code
debug incorrect DOM manipulation
7.6 Module: Events
Capabilities
The learner can:
attach event listeners
respond to user actions
inspect event objects
distinguish event target and current target
trace event propagation
explain bubbling
use event delegation
debug event-handler behavior
7.7 Module: Forms & User Input
Capabilities
The learner can:
read user input
respond to form submission
validate input
display useful validation feedback
prevent invalid submission
manage form interaction states
debug incorrect form behavior
7.8 Module: Browser State
Capabilities
The learner can:
identify information that must persist during interaction
model state transitions
distinguish state from derived values
update UI in response to state changes
identify inconsistent state
reason about state ownership
7.9 Module: JavaScript Debugging
Capabilities
The learner can:
distinguish syntax, runtime, and logic errors
interpret console errors
reproduce failures
inspect variable values
use breakpoints
trace execution
identify root cause
verify a fix
8. PHASE 4 — THINK IN JAVASCRIPT
8.1 Module: How JavaScript Executes
Capabilities
The learner can:
trace execution order
reason about the call stack
predict expression evaluation
identify which function executes next
explain why code executes in a particular order
8.2 Module: Scope & Closures
Capabilities
The learner can:
determine where a variable is accessible
trace lexical lookup
distinguish block and function scope
predict closure behavior
explain why a value remains accessible
debug scope-related bugs
8.3 Module: Objects, References & Mutation
Capabilities
The learner can:
distinguish values from references
predict effects of object mutation
reason about equality
identify shared references
choose between mutation and copying intentionally
debug unexpected shared-state behavior
8.4 Module: Functions at Depth
Capabilities
The learner can:
use higher-order functions
reason about callbacks
explain closures in practical code
predict this behavior in common contexts
distinguish function definition from invocation
debug incorrect function context
8.5 Module: Modules & Program Structure
Capabilities
The learner can:
create module boundaries
import and export functionality
trace module dependencies
identify excessive coupling
organize code into meaningful responsibilities
8.6 Module: Asynchronous JavaScript
Capabilities
The learner can:
distinguish synchronous from asynchronous work
predict promise states
reason about async/await execution
trace asynchronous control flow
predict ordering between synchronous and asynchronous operations
identify common race conditions
debug asynchronous behavior
8.7 Module: Errors & Failure
Capabilities
The learner can:
distinguish thrown errors from rejected promises
propagate errors intentionally
catch errors appropriately
identify swallowed errors
design meaningful failure handling
debug failure propagation
8.8 Module: JavaScript Investigation
Capabilities
The learner can:
investigate unfamiliar code
build a minimal reproduction
form competing hypotheses
gather evidence
eliminate incorrect explanations
identify root cause
explain the discovered mechanism
9. PHASE 5 — BUILD INTERACTIVE APPLICATIONS
9.1 Module: Application State
Capabilities
The learner can:
identify state required by an application
distinguish source state from derived state
model meaningful state transitions
identify duplicated state
reason about state ownership
design predictable state flow
9.2 Module: Data From the Network
Capabilities
The learner can:
request remote data
interpret JSON responses
handle successful requests
handle failed requests
represent loading states
handle empty results
reason about request lifecycle
9.3 Module: Asynchronous UI
Capabilities
The learner can:
design loading states
design error states
design empty states
handle stale data
recognize race conditions
prevent invalid UI transitions
design recovery behavior
9.4 Module: Forms as Systems
Capabilities
The learner can:
model complex form state
validate user input
distinguish client and server validation
represent submission states
handle server-side errors
prevent duplicate submissions
design recovery after failed submission
9.5 Module: Persistence
Capabilities
The learner can:
decide what application data should persist
serialize application state
store and retrieve browser data
restore state after reload
handle invalid persisted data
reason about persistence trade-offs
9.6 Module: Application Architecture
Capabilities
The learner can:
divide an application into responsibilities
establish useful module boundaries
identify inappropriate coupling
decide what should be reusable
avoid unnecessary abstraction
explain architectural decisions
9.7 Module: Application Debugging
Capabilities
The learner can:
investigate bugs involving multiple systems
trace state transitions
investigate network failures
identify stale state
investigate race conditions
isolate interacting causes
verify fixes across affected behavior
9.8 Module: Building Real Features
Capabilities
The learner can:
interpret requirements
identify acceptance criteria
decompose a feature
choose an implementation approach
build the feature
verify expected behavior
handle edge cases
explain implementation decisions
10. PHASE 6 — THINK IN REACT
10.1 Module: Why Components?
Capabilities
The learner can:
identify UI responsibilities
determine reasonable component boundaries
distinguish composition from duplication
recognize poorly designed components
explain why a component boundary exists
10.2 Module: JSX & Rendering
Capabilities
The learner can:
translate UI requirements into JSX
render conditional content
render collections
choose appropriate keys
predict rendered output
identify rendering mistakes
10.3 Module: Props & Data Flow
Capabilities
The learner can:
pass data through props
design component interfaces
trace data flow
identify incorrect prop flow
use composition appropriately
recognize unnecessary prop drilling
10.4 Module: State
Capabilities
The learner can:
identify stateful information
initialize state
update state
model state transitions
lift state when necessary
avoid unnecessary duplicated state
predict component behavior after state updates
10.5 Module: Events & Interaction
Capabilities
The learner can:
connect user actions to state changes
reason about React event handling
design interaction flows
debug interaction bugs
trace an interaction from event to rendered result
10.6 Module: Effects & Synchronization
Capabilities
The learner can:
identify when synchronization with an external system is required
determine whether an effect is appropriate
reason about dependencies
handle cleanup
identify unnecessary effects
debug effect-related behavior
prevent common synchronization bugs
10.7 Module: Forms & Complex UI
Capabilities
The learner can:
model controlled inputs
build multi-field forms
validate form state
handle submission
represent asynchronous submission states
handle errors
preserve predictable user experience
10.8 Module: Custom Hooks & Reuse
Capabilities
The learner can:
identify reusable stateful behavior
extract behavior into a custom hook
define useful hook interfaces
avoid premature abstraction
distinguish reusable behavior from reusable UI
10.9 Module: React Architecture
Capabilities
The learner can:
decide where state should live
establish component boundaries
design data flow
identify architectural coupling
choose between composition and shared state
evaluate abstraction quality
explain architecture decisions
10.10 Module: React Debugging
Capabilities
The learner can:
investigate unexpected renders
trace props and state
diagnose stale values
identify incorrect effect dependencies
identify key-related rendering problems
isolate component-level bugs
verify fixes
11. PHASE 7 — ENGINEER PRODUCTION FRONTENDS
11.1 Module: Accessibility Engineering
Capabilities
The learner can:
audit an interface for accessibility problems
identify keyboard navigation failures
diagnose focus problems
identify semantic problems
evaluate form accessibility
use ARIA only when appropriate
improve accessibility systematically
11.2 Module: Performance Engineering
Capabilities
The learner can:
identify performance symptoms
measure relevant behavior
distinguish network and rendering costs
identify unnecessary JavaScript work
identify expensive rendering
apply appropriate optimization
verify whether optimization improved the measured problem
11.3 Module: Frontend Security
Capabilities
The learner can:
identify unsafe handling of user input
recognize XSS risks
understand browser security boundaries
distinguish authentication from authorization
identify inappropriate client-side trust
identify sensitive data exposure
explain basic frontend security decisions
11.4 Module: Testing
Capabilities
The learner can:
identify behavior that should be tested
choose an appropriate testing level
write meaningful tests
distinguish implementation testing from behavior testing
diagnose failing tests
recognize brittle tests
design a reasonable test strategy
11.5 Module: Reliable Data Flows
Capabilities
The learner can:
design retry behavior
handle network failures
recognize stale responses
identify race conditions
design safe optimistic interactions
reason about caching behavior
preserve UI consistency during failure
11.6 Module: Error Handling & Observability
Capabilities
The learner can:
distinguish user-facing and developer-facing failures
design useful error states
preserve useful diagnostic information
identify failures that need monitoring
reason about error boundaries
design graceful recovery
11.7 Module: Build Systems & Deployment
Capabilities
The learner can:
explain the purpose of a frontend build process
identify source versus production artifacts
reason about environment configuration
identify deployment-specific failures
inspect production build output
understand the basic path from source code to deployed application
11.8 Module: Maintainability
Capabilities
The learner can:
identify unnecessary complexity
recognize excessive duplication
identify poor abstractions
evaluate naming and organization
propose targeted refactors
recognize technical debt
review code for long-term maintainability
12. PHASE 8 — THINK LIKE AN ENGINEER
12.1 Module: System Thinking
Capabilities
The learner can:
identify system boundaries
trace dependencies
identify data flow
identify failure propagation
reason about interactions between subsystems
predict consequences of changes
12.2 Module: Architecture Decisions
Capabilities
The learner can:
translate requirements into architectural needs
define meaningful boundaries
compare architectural approaches
identify coupling
evaluate scalability requirements
choose an appropriate level of abstraction
12.3 Module: Trade-offs
Capabilities
The learner can:
identify competing engineering concerns
compare multiple valid solutions
evaluate complexity
evaluate maintainability
evaluate performance implications
identify when a simpler solution is better
explain why no solution is universally optimal
12.4 Module: Code Review
Capabilities
The learner can:
review unfamiliar code
identify correctness problems
identify maintainability problems
identify accessibility problems
identify performance risks
distinguish blocking issues from preferences
communicate review feedback constructively
12.5 Module: Ambiguous Debugging
Capabilities
The learner can:
investigate without being given the location of the bug
work from incomplete information
reproduce problems
form competing hypotheses
prioritize investigation
gather evidence
isolate root cause
verify the solution
12.6 Module: Technical Communication
Capabilities
The learner can:
explain technical mechanisms clearly
communicate assumptions
communicate uncertainty
explain trade-offs
defend an engineering decision
adapt explanations to technical and non-technical audiences
12.7 Module: Engineering Judgment
Capabilities
The learner can:
identify the actual problem before choosing a tool
avoid unnecessary complexity
choose appropriate abstractions
prioritize engineering work
recognize when not to change something
make decisions under constraints
defend decisions using evidence
13. PHASE 9 — OPERATE INDEPENDENTLY
13.1 Module: Open-Ended Building
Capabilities
The learner can:
interpret ambiguous requirements
ask useful questions
identify constraints
decompose a problem
design an implementation
build without a tutorial
test their work
revise their approach when evidence contradicts assumptions
13.2 Module: Realistic Debugging
Capabilities
The learner can:
investigate unfamiliar failures
work without predetermined hypotheses
gather evidence efficiently
reproduce problems
isolate causes
test fixes
verify behavior
communicate findings
13.3 Module: Architecture Challenges
Capabilities
The learner can:
design a solution from requirements
identify architectural constraints
compare multiple designs
identify trade-offs
anticipate failure modes
defend an architectural decision
13.4 Module: Code Review Challenges
Capabilities
The learner can:
understand unfamiliar code quickly
identify high-impact issues
separate correctness from preference
identify architectural risks
propose practical improvements
communicate review findings
13.5 Module: Interview Simulations
Capabilities
The learner can:
reason aloud
predict program behavior
solve unfamiliar technical problems
debug under time constraints
explain architectural decisions
communicate uncertainty
respond to follow-up questions
recover when an initial approach fails
13.6 Module: Capstone Engineering
Capabilities
The learner can:
interpret a realistic product requirement
establish assumptions
identify constraints
design the solution
choose appropriate technologies
implement the application
test it
debug it
evaluate accessibility
evaluate performance
evaluate security
defend architectural decisions
explain the final system
identify limitations and future improvements
14. CROSS-CURRICULUM CAPABILITIES
These capabilities must appear repeatedly rather than being taught once.
14.1 DEBUGGING
The learner should progressively become able to:
Notice a problem
↓
Describe the symptom
↓
Reproduce it
↓
Gather evidence
↓
Form a hypothesis
↓
Test the hypothesis
↓
Locate the root cause
↓
Fix it
↓
Verify the fix
↓
Explain the cause
14.2 PREDICTION
The learner should repeatedly practice:
See code
↓
Predict behavior
↓
Commit to prediction
↓
Run
↓
Compare
↓
Explain mismatch
Prediction is one of Forge's primary anti-passive-learning mechanisms.
14.3 EXPLANATION
The learner should progressively move from:
"It works."
to:
"I know what happened."
to:
"I know why it happened."
to:
"I can explain why it happened."
to:
"I can explain why another approach would behave differently."
14.4 ENGINEERING JUDGMENT
Repeatedly expose the learner to situations where:
multiple solutions work
trade-offs exist
requirements are incomplete
constraints conflict
the "most advanced" solution is not necessarily the best solution
The learner must eventually justify decisions rather than simply implement instructions.
15. CAPABILITY EVIDENCE
Forge should not mark a capability mastered simply because the learner completed a lesson.
Evidence may come from:
Prediction
Can the learner correctly predict behavior?
Manipulation
Can they intentionally change behavior?
Implementation
Can they use the capability?
Debugging
Can they diagnose failure?
Explanation
Can they explain why it works?
Transfer
Can they use it in a new context?
Judgment
Can they choose appropriately between alternatives?
16. MASTERY SIGNALS
A strong mastery signal should answer:
"Could this learner still do this if the exact example changed?"
Therefore, mastery checks should vary:
surface details
code
UI
context
constraints
failure modes
implementation choices
Avoid:
Learn example A
↓
Repeat example A
↓
Pass
↓
Mastery
Prefer:
Learn concept A
↓
Predict A
↓
Manipulate A
↓
Apply A
↓
Debug A
↓
Explain A
↓
Encounter unfamiliar version of A
↓
Transfer
17. CAPABILITY DEPENDENCIES
Capabilities should form a graph.
Example:
HTML structure
      ↓
DOM structure
      ↓
DOM manipulation
      ↓
Events
      ↓
Browser state
      ↓
Interactive applications
Another:
CSS cascade
      ↓
Box model
      ↓
Layout
      ↓
Flexbox / Grid
      ↓
Responsive design
      ↓
Production UI
Another:
Variables
      ↓
Functions
      ↓
Scope
      ↓
Closures
      ↓
Asynchronous callbacks
      ↓
Promises
      ↓
Async/await
      ↓
Application data flows
Another:
Props
      ↓
State
      ↓
Rendering
      ↓
Effects
      ↓
Application architecture
      ↓
React debugging
These are dependency examples, not final lesson order.
18. CAPABILITY SPIRAL
Important capabilities should return later at greater depth.
Example:
DEBUGGING

Phase 0
Simple observation

Phase 1
Browser investigation

Phase 2
CSS debugging

Phase 3
JavaScript debugging

Phase 4
Execution-model debugging

Phase 5
Application debugging

Phase 6
React debugging

Phase 7
Production debugging

Phase 8
Ambiguous debugging

Phase 9
Independent debugging
The learner is not repeatedly learning "debugging."
They are repeatedly becoming better at it.
19. DIFFICULTY PROGRESSION
Capability difficulty should increase through multiple dimensions.
EARLY
Known context
Known concepts
Strong guidance
Small problems
Obvious failures
Low ambiguity

↓

MIDDLE
Multiple concepts
Less guidance
Longer chains
Subtle failures
Real requirements

↓

ADVANCED
Unfamiliar systems
Incomplete information
Multiple valid solutions
Conflicting constraints
Subtle root causes
High ambiguity

↓

INDEPENDENT
Minimal scaffolding
Realistic constraints
Unknown implementation path
Unknown failure mode
Engineering judgment required
Do not increase difficulty merely by making exercises longer.
20. CAPABILITY QUALITY TEST
Every capability added to Forge must pass these questions:
Is it observable?
Is it useful to a frontend engineer?
Can the learner demonstrate it?
Can it be practiced?
Can it fail?
Can it be debugged?
Can it be transferred to a new context?
Does it connect to other capabilities?
Does it represent meaningful engineering ability?
Would mastering it make the learner more independent?
If the answer to several questions is "no," reconsider the capability.
21. TECHNOLOGY RULE
Technology should never become the capability itself.
Weak:
Learn React.
Better:
Build component-based interfaces using React.
Stronger:
Decide how UI responsibilities, state, and data flow should be divided into components, then implement and debug that architecture using React.
Technology is the medium.
Engineering capability is the goal.
22. FINAL CAPABILITY TRANSFORMATION
Forge should progressively transform the learner from:
FOLLOWER
into:
OBSERVER
then:
PREDICTOR
then:
MANIPULATOR
then:
BUILDER
then:
DEBUGGER
then:
EXPLAINER
then:
DECISION MAKER
and finally:
INDEPENDENT FRONTEND ENGINEER
23. THE FINAL TEST
At the end of Forge, the learner should not merely be able to say:
"I completed the frontend curriculum."
They should be able to receive an unfamiliar frontend problem and think:
What exactly is happening?
        ↓
What do I expect?
        ↓
What evidence do I have?
        ↓
What could explain this?
        ↓
How can I test that?
        ↓
What should I change?
        ↓
Did the change actually work?
        ↓
Why did it work?
        ↓
What are the trade-offs?
        ↓
How would I explain my decision?
That is the capability Forge is ultimately building.
