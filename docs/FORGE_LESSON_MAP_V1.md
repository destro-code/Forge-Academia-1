# FORGE LESSON MAP V1

Status: Draft for approval
Purpose: Define the complete learning journey before lesson experiences or lesson JSON are authored.

---

# 1. PURPOSE

The Lesson Map translates the Forge curriculum architecture, phase map, module map, capability map, and concept dependency map into a concrete sequence of learning experiences.

A lesson is not:

- a topic container
- a documentation page
- a collection of quiz questions
- a chapter containing every concept related to a subject
- a fixed amount of content

A lesson is:

> A focused learning experience designed to move a learner from one capability state to another.

Every lesson must answer:

1. What does the learner need to become able to do?
2. What mental model enables that ability?
3. What does the learner actually do?
4. What evidence demonstrates learning?
5. Where does this lesson sit in the larger capability progression?

---

# 2. LESSON DESIGN RULES

## 2.1 Lesson Count Is an Output

Forge does not decide:

> "Every module gets exactly 4 lessons."

Instead:

> "A module receives as many lessons as necessary to develop its intended capabilities."

Some modules may need:

- 2 lessons
- 3 lessons
- 4 lessons
- 5 lessons
- 6+ lessons

depending on:

- conceptual complexity
- number of interacting concepts
- required practice
- debugging depth
- transfer requirements
- learner independence

---

# 3. LESSON DEPTH

Lessons should generally progress through:

1. Recognition
2. Understanding
3. Prediction
4. Manipulation
5. Application
6. Debugging
7. Explanation
8. Transfer

A single lesson does not necessarily need all eight levels.

Instead, the curriculum should gradually move learners upward.

---

# 4. LESSON ARCHETYPES

Forge lessons may use one or more of these archetypes.

### Discovery

Learner encounters a behavior before receiving the complete explanation.

### Mental Model

Learner constructs a useful model for understanding a system.

### Prediction

Learner predicts what will happen before running or inspecting something.

### Manipulation

Learner changes a system and observes consequences.

### Practice

Learner repeatedly applies a newly established model.

### Debugging

Learner investigates an intentionally broken system.

### Build

Learner creates something using the capability.

### Reinforcement

Previously learned capability is deliberately retrieved in a new context.

### Transfer

Learner applies knowledge to a less familiar situation.

### Mastery

Learner demonstrates a capability with reduced scaffolding.

### Interview

Learner reasons, explains, predicts, debugs, or makes a technical decision under interview-like constraints.

---

# 5. GUIDANCE PROGRESSION

Lessons should generally move through:

GUIDED
↓
CONSTRAINED
↓
ASSISTED
↓
INDEPENDENT
↓
OPEN-ENDED

Early lessons provide stronger structure.

Later lessons deliberately remove it.

---

# 6. PHASE 0 — ENTER THE WEB

## Module 0.1 — Meet the Web

### Lesson 0.1.1 — The Button Has Betrayed You

Role:
Discovery → Prediction → Debugging

Job:
Introduce Forge through an actual investigation rather than a conventional introduction.

Capability:
Learner can observe unexpected browser behavior, distinguish expectation from reality, and begin an evidence-based investigation.

Prerequisite concepts:
None.

Learner action:
Interact with a deliberately broken interface, predict what should happen, observe what actually happens, and investigate the mismatch.

Evidence:
Learner identifies the observable symptom and uses browser evidence to form an initial explanation.

Guidance:
Guided.

Progression:
Establishes the Forge learning contract.

---

### Lesson 0.1.2 — What Actually Happened?

Role:
Mental Model → Investigation

Job:
Establish the basic model of a web interaction.

Capability:
Learner can identify the major systems involved when interacting with a webpage.

Prerequisite concepts:
Web, browser, server, frontend, backend.

Learner action:
Trace a simple user action through the major systems involved.

Evidence:
Learner correctly assigns responsibilities to browser, frontend, server, and network.

Guidance:
Guided.

Progression:
Moves from observation to system thinking.

---

### Lesson 0.1.3 — You Are Not "Learning Code"

Role:
Orientation → Transfer

Job:
Establish what frontend engineering actually involves.

Capability:
Learner can distinguish syntax knowledge from engineering capability.

Prerequisite concepts:
Basic web interaction model.

Learner action:
Classify realistic frontend tasks by the engineering capability they require.

Evidence:
Learner recognizes that frontend engineering involves understanding, building, debugging, and decision-making.

Guidance:
Guided.

Progression:
Establishes the long-term Forge capability model.

---

## Module 0.2 — Your First Browser Investigation

### Lesson 0.2.1 — Open the Evidence

Role:
Discovery → Manipulation

Job:
Teach the learner to use DevTools as an investigation instrument.

Capability:
Inspect a webpage and locate relevant browser evidence.

Prerequisite concepts:
Browser, webpage.

Learner action:
Inspect elements, styles, and browser information.

Evidence:
Learner locates requested evidence without guessing.

Guidance:
Guided.

---

### Lesson 0.2.2 — Change Something

Role:
Manipulation

Job:
Demonstrate that browser state can be experimentally manipulated.

Capability:
Modify a webpage temporarily and observe the consequence.

Prerequisite concepts:
DOM, styles.

Learner action:
Change content and styling directly through DevTools.

Evidence:
Correctly predicts and observes the resulting change.

Guidance:
Guided → Constrained.

---

### Lesson 0.2.3 — Expected vs Actual

Role:
Debugging

Job:
Introduce Forge's core debugging distinction.

Capability:
Separate what the learner expected from what the system actually did.

Prerequisite concepts:
Observation, browser evidence.

Learner action:
Investigate a simple mismatch.

Evidence:
Learner identifies symptom, evidence, and plausible cause.

Guidance:
Constrained.

---

## Module 0.3 — How Forge Works

### Lesson 0.3.1 — Don't Guess Yet

Role:
Investigation

Job:
Teach evidence-first reasoning.

Capability:
Delay premature conclusions and gather useful evidence.

Prerequisite concepts:
Expected vs actual.

Learner action:
Choose useful investigative actions from several possibilities.

Evidence:
Learner prioritizes evidence over random changes.

Guidance:
Guided → Constrained.

---

### Lesson 0.3.2 — The Forge Loop

Role:
Mental Model → Practice

Job:
Establish:

Observe → Reproduce → Inspect → Hypothesis → Test → Fix → Verify

Capability:
Use a repeatable investigation process.

Learner action:
Order and apply the debugging loop.

Evidence:
Learner correctly performs the investigation sequence.

Guidance:
Guided.

---

### Lesson 0.3.3 — First Forge Challenge

Role:
Mastery

Job:
Combine the initial Forge habits in a small investigation.

Capability:
Investigate a simple unfamiliar browser problem.

Evidence:
Observation + hypothesis + evidence + verified result.

Guidance:
Assisted.

---

# 7. PHASE 1 — UNDERSTAND THE WEB

## Module 1.1 — The Browser

### Lesson 1.1.1 — Your Browser Is Doing a Lot

Role:
Discovery → Mental Model

Job:
Establish browser responsibilities.

Capability:
Explain what the browser is responsible for.

---

### Lesson 1.1.2 — Browser or Server?

Role:
Prediction

Job:
Distinguish client-side and server-side responsibilities.

Capability:
Predict which system is responsible for a behavior.

---

### Lesson 1.1.3 — The Browser's Toolbox

Role:
Mental Model

Job:
Introduce browser APIs conceptually.

Capability:
Recognize that browser functionality is exposed through APIs.

---

## Module 1.2 — Requests, Responses & HTTP

### Lesson 1.2.1 — The Address Is a Map

Role:
Discovery

Job:
Understand URL structure and purpose.

---

### Lesson 1.2.2 — Ask and Receive

Role:
Mental Model → Prediction

Job:
Understand request/response communication.

---

### Lesson 1.2.3 — What Did the Server Say?

Role:
Prediction

Job:
Understand methods, status codes, and headers.

---

### Lesson 1.2.4 — When the Request Goes Bad

Role:
Debugging

Job:
Use network evidence to investigate failed requests.

---

## Module 1.3 — HTML: Structure & Meaning

### Lesson 1.3.1 — HTML Is Structure

Role:
Discovery

Job:
Understand HTML as document structure rather than decoration.

---

### Lesson 1.3.2 — Your HTML Has a Family Tree

Role:
Mental Model

Job:
Understand nesting and relationships.

---

### Lesson 1.3.3 — Meaning Matters

Role:
Application

Job:
Introduce semantic HTML.

---

### Lesson 1.3.4 — Structure Under Pressure

Role:
Debugging

Job:
Diagnose structural and semantic HTML problems.

---

## Module 1.4 — The DOM

### Lesson 1.4.1 — The Browser Builds a Tree

Role:
Discovery

Job:
Connect HTML source to the DOM.

---

### Lesson 1.4.2 — Source Is Not the Whole Story

Role:
Prediction

Job:
Distinguish source HTML from current DOM state.

---

### Lesson 1.4.3 — Move a Branch

Role:
Manipulation

Job:
Manipulate DOM structure.

---

### Lesson 1.4.4 — Find the Wrong Branch

Role:
Debugging

Job:
Use DOM inspection to diagnose unexpected structure.

---

## Module 1.5 — Browser Rendering

### Lesson 1.5.1 — From Code to Pixels

Role:
Visual Mental Model

Job:
Establish the high-level rendering pipeline.

---

### Lesson 1.5.2 — Structure vs Appearance

Role:
Prediction

Job:
Understand how DOM and CSS interact.

---

### Lesson 1.5.3 — Where Did That Pixel Come From?

Role:
Investigation

Job:
Connect visible symptoms to rendering stages.

---

### Lesson 1.5.4 — The Rendering Mystery

Role:
Debugging

Job:
Identify likely rendering-stage causes from symptoms.

---

## Module 1.6 — Developer Tools

### Lesson 1.6.1 — Elements Is Your Microscope

Role:
Practice

Job:
Inspect structure and current DOM.

---

### Lesson 1.6.2 — Computed Styles Tell the Truth

Role:
Debugging

Job:
Use computed styles instead of guessing.

---

### Lesson 1.6.3 — The Console Is Listening

Role:
Practice

Job:
Use console evidence to investigate behavior.

---

### Lesson 1.6.4 — Network Never Lies

Role:
Debugging

Job:
Investigate requests and responses.

---

### Lesson 1.6.5 — Build an Evidence Trail

Role:
Mastery

Job:
Combine multiple DevTools panels during investigation.

---

# 8. PHASE 2 — BUILD THE INTERFACE

## Module 2.1 — CSS: The Language of Appearance

### Lesson 2.1.1 — CSS Gives Instructions

### Lesson 2.1.2 — Which Rule Wins?

### Lesson 2.1.3 — Inherited Trouble

### Lesson 2.1.4 — Why Is This Style Winning?

---

## Module 2.2 — The Box Model

### Lesson 2.2.1 — Everything Is a Box

### Lesson 2.2.2 — The Box Has Layers

### Lesson 2.2.3 — How Big Is This Thing?

### Lesson 2.2.4 — When the Box Lies

---

## Module 2.3 — Layout & Flow

### Lesson 2.3.1 — Things Have a Flow

### Lesson 2.3.2 — Block vs Inline

### Lesson 2.3.3 — Move It Without Breaking Everything

### Lesson 2.3.4 — Positioning Has Rules

### Lesson 2.3.5 — Find the Containing Block

---

## Module 2.4 — Flexbox

### Lesson 2.4.1 — One Dimension at a Time

### Lesson 2.4.2 — The Main Axis

### Lesson 2.4.3 — Where Did Everything Go?

### Lesson 2.4.4 — Flexing Under Pressure

### Lesson 2.4.5 — Flexbox Debugging

---

## Module 2.5 — CSS Grid

### Lesson 2.5.1 — Two Dimensions

### Lesson 2.5.2 — Tracks and Cells

### Lesson 2.5.3 — Place the Pieces

### Lesson 2.5.4 — Grid That Responds

### Lesson 2.5.5 — The Grid Is Lying

---

## Module 2.6 — Responsive Design

### Lesson 2.6.1 — The Screen Is Not One Size

### Lesson 2.6.2 — Let Content Decide

### Lesson 2.6.3 — Fluid Before Fixed

### Lesson 2.6.4 — Breakpoint Investigation

### Lesson 2.6.5 — Test the Real World

---

## Module 2.7 — Accessible Interfaces

### Lesson 2.7.1 — Can Everyone Use This?

### Lesson 2.7.2 — A Button Is More Than a Rectangle

### Lesson 2.7.3 — Keyboard Has Entered the Chat

### Lesson 2.7.4 — Focus Matters

### Lesson 2.7.5 — Accessibility Investigation

---

## Module 2.8 — Visual Engineering

### Lesson 2.8.1 — Turn a Picture Into Rules

### Lesson 2.8.2 — Spacing Is a System

### Lesson 2.8.3 — Visual Hierarchy

### Lesson 2.8.4 — Consistency vs Preference

---

## Module 2.9 — CSS Debugging

### Lesson 2.9.1 — Something Is Wrong With the CSS

### Lesson 2.9.2 — Follow the Cascade

### Lesson 2.9.3 — Find the Constraint

### Lesson 2.9.4 — Fix the Actual Cause

### Lesson 2.9.5 — CSS Crime Scene

Role:
Mastery / Debugging

Job:
Independently diagnose a deliberately broken interface.

---

# 9. PHASE 3 — PROGRAM THE BROWSER

## Module 3.1 — Values & Variables

### Lesson 3.1.1 — JavaScript Stores Things

### Lesson 3.1.2 — Values Have Types

### Lesson 3.1.3 — Variables Change

### Lesson 3.1.4 — Predict the Value

---

## Module 3.2 — Decisions & Control Flow

### Lesson 3.2.1 — Programs Make Choices

### Lesson 3.2.2 — Conditions

### Lesson 3.2.3 — Follow the Branch

### Lesson 3.2.4 — Loop Until It Stops

### Lesson 3.2.5 — Trace the Program

---

## Module 3.3 — Functions

### Lesson 3.3.1 — Give the Work a Name

### Lesson 3.3.2 — Inputs and Outputs

### Lesson 3.3.3 — Calling vs Defining

### Lesson 3.3.4 — Functions as Building Blocks

---

## Module 3.4 — Working with Data

### Lesson 3.4.1 — Collections of Values

### Lesson 3.4.2 — Objects Describe Things

### Lesson 3.4.3 — Transform the Data

### Lesson 3.4.4 — Find the Right Value

### Lesson 3.4.5 — Data Debugging

---

## Module 3.5 — The DOM in Motion

### Lesson 3.5.1 — JavaScript Meets the Page

### Lesson 3.5.2 — Find the Element

### Lesson 3.5.3 — Change the Page

### Lesson 3.5.4 — Build a Tiny Interaction

---

## Module 3.6 — Events

### Lesson 3.6.1 — Something Just Happened

### Lesson 3.6.2 — Listen for It

### Lesson 3.6.3 — Event Objects

### Lesson 3.6.4 — Bubbling Up

### Lesson 3.6.5 — Event Propagation Investigation

---

## Module 3.7 — Forms & User Input

### Lesson 3.7.1 — The User Is Unpredictable

### Lesson 3.7.2 — Read the Input

### Lesson 3.7.3 — Validate Before Acting

### Lesson 3.7.4 — Submission Is a Process

### Lesson 3.7.5 — Broken Form Investigation

---

## Module 3.8 — Browser State

### Lesson 3.8.1 — The Page Can Remember

### Lesson 3.8.2 — State Changes

### Lesson 3.8.3 — URL State

### Lesson 3.8.4 — Browser Storage

### Lesson 3.8.5 — State Recovery

---

## Module 3.9 — JavaScript Debugging

### Lesson 3.9.1 — The Symptom Is Not the Cause

### Lesson 3.9.2 — Trace the Execution

### Lesson 3.9.3 — Inspect the State

### Lesson 3.9.4 — The DOM Is Not Doing What You Think

### Lesson 3.9.5 — JavaScript Crime Scene

### Lesson 3.9.6 — Build, Break, Fix

---

# 10. PHASE 4 — THINK IN JAVASCRIPT

## Module 4.1 — How JavaScript Executes

### Lesson 4.1.1 — What Runs First?

### Lesson 4.1.2 — The Call Stack

### Lesson 4.1.3 — Follow the Execution

### Lesson 4.1.4 — Predict the Output

---

## Module 4.2 — Scope & Closures

### Lesson 4.2.1 — Where Does This Variable Live?

### Lesson 4.2.2 — Scope Has Boundaries

### Lesson 4.2.3 — Look Up the Chain

### Lesson 4.2.4 — The Function That Remembers

### Lesson 4.2.5 — Closure Investigation

---

## Module 4.3 — Objects, References & Mutation

### Lesson 4.3.1 — Objects Are Values Too

### Lesson 4.3.2 — Two Variables, One Object

### Lesson 4.3.3 — Mutation Has Consequences

### Lesson 4.3.4 — Copy or Reference?

### Lesson 4.3.5 — Shared State Investigation

---

## Module 4.4 — Functions at Depth

### Lesson 4.4.1 — Functions Can Travel

### Lesson 4.4.2 — Higher-Order Functions

### Lesson 4.4.3 — Callbacks

### Lesson 4.4.4 — This Changes Everything

### Lesson 4.4.5 — Invocation Matters

---

## Module 4.5 — Modules & Program Structure

### Lesson 4.5.1 — Split the Program

### Lesson 4.5.2 — Imports and Exports

### Lesson 4.5.3 — Follow the Dependency

### Lesson 4.5.4 — When Modules Become a Mess

---

## Module 4.6 — Asynchronous JavaScript

### Lesson 4.6.1 — Not Everything Happens Now

### Lesson 4.6.2 — Promises Have States

### Lesson 4.6.3 — Async/Await

### Lesson 4.6.4 — The Event Loop

### Lesson 4.6.5 — Predict the Async Order

### Lesson 4.6.6 — When Async Goes Wrong

---

## Module 4.7 — Errors & Failure

### Lesson 4.7.1 — Something Threw

### Lesson 4.7.2 — Errors Travel

### Lesson 4.7.3 — Rejected

### Lesson 4.7.4 — Don't Swallow the Evidence

### Lesson 4.7.5 — Failure Recovery

---

## Module 4.8 — JavaScript Investigation

### Lesson 4.8.1 — This Code Looks Wrong

### Lesson 4.8.2 — Build the Smallest Reproduction

### Lesson 4.8.3 — Competing Hypotheses

### Lesson 4.8.4 — Eliminate the Wrong Theory

### Lesson 4.8.5 — Explain the Root Cause

### Lesson 4.8.6 — Unfamiliar JavaScript Challenge

---

# 11. PHASE 5 — BUILD INTERACTIVE APPLICATIONS

## Module 5.1 — Application State

### Lesson 5.1.1 — Applications Remember

### Lesson 5.1.2 — State vs Derived Data

### Lesson 5.1.3 — Who Owns This State?

### Lesson 5.1.4 — State Transitions

### Lesson 5.1.5 — Duplicate State Disaster

---

## Module 5.2 — Data from the Network

### Lesson 5.2.1 — Your App Needs Data

### Lesson 5.2.2 — Fetching Data

### Lesson 5.2.3 — JSON Becomes Application Data

### Lesson 5.2.4 — The Request Lifecycle

### Lesson 5.2.5 — Network Failure

---

## Module 5.3 — Asynchronous UI

### Lesson 5.3.1 — Loading Is a State

### Lesson 5.3.2 — Empty Is a State

### Lesson 5.3.3 — Error Is a State

### Lesson 5.3.4 — Stale Data

### Lesson 5.3.5 — Race Conditions

---

## Module 5.4 — Forms as Systems

### Lesson 5.4.1 — Forms Have State

### Lesson 5.4.2 — Validation Is a Contract

### Lesson 5.4.3 — Submission States

### Lesson 5.4.4 — Server Rejection

### Lesson 5.4.5 — Prevent the Double Submit

---

## Module 5.5 — Persistence

### Lesson 5.5.1 — What Should Survive?

### Lesson 5.5.2 — Serialize the State

### Lesson 5.5.3 — Restore the Application

### Lesson 5.5.4 — Bad Data Comes Back

### Lesson 5.5.5 — Persistence Trade-offs

---

## Module 5.6 — Application Architecture

### Lesson 5.6.1 — The App Is Getting Bigger

### Lesson 5.6.2 — Give Things Responsibilities

### Lesson 5.6.3 — Draw the Boundaries

### Lesson 5.6.4 — Duplication Is a Signal

### Lesson 5.6.5 — Abstraction: Too Early or Just Right?

---

## Module 5.7 — Application Debugging

### Lesson 5.7.1 — Multiple Systems, One Bug

### Lesson 5.7.2 — Follow the State

### Lesson 5.7.3 — Follow the Network

### Lesson 5.7.4 — Catch the Race

### Lesson 5.7.5 — Application Crime Scene

---

## Module 5.8 — Building Real Features

### Lesson 5.8.1 — From Requirement to Plan

### Lesson 5.8.2 — Break the Feature Down

### Lesson 5.8.3 — Build the First Slice

### Lesson 5.8.4 — Handle the Unhappy Path

### Lesson 5.8.5 — Verify the Feature

### Lesson 5.8.6 — Feature Build Challenge

---

# 12. PHASE 6 — THINK IN REACT

## Module 6.1 — Why Components?

### Lesson 6.1.1 — The Page Is Getting Complicated

### Lesson 6.1.2 — Find the Boundary

### Lesson 6.1.3 — Composition

### Lesson 6.1.4 — Component Responsibilities

---

## Module 6.2 — JSX & Rendering

### Lesson 6.2.1 — UI Is an Expression

### Lesson 6.2.2 — JSX Is JavaScript

### Lesson 6.2.3 — Conditional UI

### Lesson 6.2.4 — Rendering Collections

### Lesson 6.2.5 — Keys Matter

### Lesson 6.2.6 — Predict the Render

---

## Module 6.3 — Props & Data Flow

### Lesson 6.3.1 — Components Need Data

### Lesson 6.3.2 — Props Are Inputs

### Lesson 6.3.3 — Follow the Data

### Lesson 6.3.4 — Prop Drilling

### Lesson 6.3.5 — Composition as a Solution

---

## Module 6.4 — State

### Lesson 6.4.1 — Something Needs to Change

### Lesson 6.4.2 — State Updates

### Lesson 6.4.3 — Predict the Render

### Lesson 6.4.4 — Lift the State

### Lesson 6.4.5 — Duplicate State Disaster

---

## Module 6.5 — Events & Interaction

### Lesson 6.5.1 — React Responds

### Lesson 6.5.2 — Event → State → Render

### Lesson 6.5.3 — Controlled Interaction

### Lesson 6.5.4 — Complex Interaction

---

## Module 6.6 — Effects & Synchronization

### Lesson 6.6.1 — Rendering Is Not an Effect

### Lesson 6.6.2 — When You Need an Effect

### Lesson 6.6.3 — Dependencies

### Lesson 6.6.4 — Cleanup

### Lesson 6.6.5 — The Effect That Wouldn't Stop

### Lesson 6.6.6 — Synchronization Investigation

---

## Module 6.7 — Forms & Complex UI

### Lesson 6.7.1 — Controlled Inputs

### Lesson 6.7.2 — Multi-Field State

### Lesson 6.7.3 — Validation

### Lesson 6.7.4 — Async Submission

### Lesson 6.7.5 — Complex Form Investigation

---

## Module 6.8 — Custom Hooks & Reuse

### Lesson 6.8.1 — Behavior Wants a Home

### Lesson 6.8.2 — Build a Custom Hook

### Lesson 6.8.3 — Hook Interfaces

### Lesson 6.8.4 — Don't Abstract Yet

---

## Module 6.9 — React Architecture

### Lesson 6.9.1 — Where Should This State Live?

### Lesson 6.9.2 — Component Boundaries

### Lesson 6.9.3 — Data Flow Architecture

### Lesson 6.9.4 — Shared Behavior

### Lesson 6.9.5 — Architecture Review

---

## Module 6.10 — React Debugging

### Lesson 6.10.1 — Why Did This Render?

### Lesson 6.10.2 — Stale Values

### Lesson 6.10.3 — Broken Effects

### Lesson 6.10.4 — Keys Caused This

### Lesson 6.10.5 — Follow Props and State

### Lesson 6.10.6 — React Crime Scene

---

# 13. PHASE 7 — ENGINEER PRODUCTION FRONTENDS

## Module 7.1 — Accessibility Engineering

### Lesson 7.1.1 — Accessibility Is Engineering

### Lesson 7.1.2 — Semantic Interfaces

### Lesson 7.1.3 — Keyboard and Focus

### Lesson 7.1.4 — Accessible Forms

### Lesson 7.1.5 — Accessibility Audit

---

## Module 7.2 — Performance Engineering

### Lesson 7.2.1 — Slow Is a Symptom

### Lesson 7.2.2 — Measure Before Optimizing

### Lesson 7.2.3 — Network Cost

### Lesson 7.2.4 — Rendering Cost

### Lesson 7.2.5 — JavaScript Cost

### Lesson 7.2.6 — Optimize and Remeasure

---

## Module 7.3 — Frontend Security

### Lesson 7.3.1 — The Browser Is Not Trusted

### Lesson 7.3.2 — Untrusted Input

### Lesson 7.3.3 — XSS

### Lesson 7.3.4 — Authentication vs Authorization

### Lesson 7.3.5 — Never Trust the Client

### Lesson 7.3.6 — Security Review

---

## Module 7.4 — Testing

### Lesson 7.4.1 — What Should We Test?

### Lesson 7.4.2 — Test Behavior

### Lesson 7.4.3 — Choosing the Test Level

### Lesson 7.4.4 — When Tests Lie

### Lesson 7.4.5 — Testing Strategy

---

## Module 7.5 — Reliable Data Flows

### Lesson 7.5.1 — Networks Fail

### Lesson 7.5.2 — Retry Carefully

### Lesson 7.5.3 — Stale Responses

### Lesson 7.5.4 — Optimistic UI

### Lesson 7.5.5 — Consistency Problems

---

## Module 7.6 — Error Handling & Observability

### Lesson 7.6.1 — Errors Have Audiences

### Lesson 7.6.2 — Useful Errors

### Lesson 7.6.3 — Recovery

### Lesson 7.6.4 — Observability

### Lesson 7.6.5 — Failure Investigation

---

## Module 7.7 — Build Systems & Deployment

### Lesson 7.7.1 — Source Becomes an Application

### Lesson 7.7.2 — What Does the Build Do?

### Lesson 7.7.3 — Environment Configuration

### Lesson 7.7.4 — Deployment Failure

### Lesson 7.7.5 — Production Investigation

---

## Module 7.8 — Maintainability

### Lesson 7.8.1 — Complexity Has a Cost

### Lesson 7.8.2 — Duplication Signals

### Lesson 7.8.3 — Abstraction Debt

### Lesson 7.8.4 — Refactoring Safely

### Lesson 7.8.5 — Maintainability Review

---

# 14. PHASE 8 — THINK LIKE AN ENGINEER

## Module 8.1 — System Thinking

### Lesson 8.1.1 — Everything Is Connected

### Lesson 8.1.2 — Follow the Dependency

### Lesson 8.1.3 — Failure Propagation

### Lesson 8.1.4 — Change One Thing, Break Another

### Lesson 8.1.5 — System Investigation

---

## Module 8.2 — Architecture Decisions

### Lesson 8.2.1 — Start With the Problem

### Lesson 8.2.2 — Define the Boundary

### Lesson 8.2.3 — Compare Approaches

### Lesson 8.2.4 — Choose an Architecture

### Lesson 8.2.5 — Defend the Decision

---

## Module 8.3 — Trade-offs

### Lesson 8.3.1 — There Is No Perfect Solution

### Lesson 8.3.2 — Simplicity vs Capability

### Lesson 8.3.3 — Performance vs Complexity

### Lesson 8.3.4 — Build vs Buy

### Lesson 8.3.5 — Make the Trade-off

---

## Module 8.4 — Code Review

### Lesson 8.4.1 — Read Before Judging

### Lesson 8.4.2 — Find the Real Problem

### Lesson 8.4.3 — Correctness vs Preference

### Lesson 8.4.4 — Review the Architecture

### Lesson 8.4.5 — Give Useful Feedback

---

## Module 8.5 — Ambiguous Debugging

### Lesson 8.5.1 — Something Is Broken

### Lesson 8.5.2 — You Don't Know Where

### Lesson 8.5.3 — Build the Hypotheses

### Lesson 8.5.4 — Prioritize the Evidence

### Lesson 8.5.5 — Find the Root Cause

### Lesson 8.5.6 — Explain What Happened

---

## Module 8.6 — Technical Communication

### Lesson 8.6.1 — Explain the Mechanism

### Lesson 8.6.2 — State Your Assumptions

### Lesson 8.6.3 — Communicate Uncertainty

### Lesson 8.6.4 — Explain the Trade-off

### Lesson 8.6.5 — Defend Your Decision

---

## Module 8.7 — Engineering Judgment

### Lesson 8.7.1 — Do We Actually Need This?

### Lesson 8.7.2 — Complexity Is a Decision

### Lesson 8.7.3 — Know When Not to Change

### Lesson 8.7.4 — Evidence Beats Preference

### Lesson 8.7.5 — Engineering Judgment Challenge

---

# 15. PHASE 9 — OPERATE INDEPENDENTLY

Phase 9 deliberately stops behaving like a traditional curriculum.

The learner receives increasingly incomplete information.

---

## Module 9.1 — Open-Ended Building

### Lesson 9.1.1 — Build From Requirements

### Lesson 9.1.2 — Ask the Right Questions

### Lesson 9.1.3 — Choose the Approach

### Lesson 9.1.4 — Build Without a Tutorial

### Lesson 9.1.5 — Review Your Own Work

---

## Module 9.2 — Realistic Debugging

### Lesson 9.2.1 — The Bug Report

### Lesson 9.2.2 — Reproduce It

### Lesson 9.2.3 — Investigate an Unfamiliar System

### Lesson 9.2.4 — Competing Causes

### Lesson 9.2.5 — Fix and Verify

---

## Module 9.3 — Architecture Challenges

### Lesson 9.3.1 — Design the System

### Lesson 9.3.2 — Constraints Arrive

### Lesson 9.3.3 — Compare the Alternatives

### Lesson 9.3.4 — Defend the Architecture

---

## Module 9.4 — Code Review Challenges

### Lesson 9.4.1 — Here's the Code

### Lesson 9.4.2 — Find What Matters

### Lesson 9.4.3 — Explain the Risk

### Lesson 9.4.4 — Recommend the Change

---

## Module 9.5 — Interview Simulations

### Lesson 9.5.1 — Predict the Output

### Lesson 9.5.2 — Debug Under Pressure

### Lesson 9.5.3 — Explain the Browser

### Lesson 9.5.4 — React Reasoning

### Lesson 9.5.5 — Architecture Interview

### Lesson 9.5.6 — Full Interview Simulation

---

## Module 9.6 — Capstone Engineering

### Lesson 9.6.1 — The Requirement

### Lesson 9.6.2 — The Investigation

### Lesson 9.6.3 — The Architecture

### Lesson 9.6.4 — The Build

### Lesson 9.6.5 — The Debugging

### Lesson 9.6.6 — The Production Review

### Lesson 9.6.7 — Defend Your Work

### Lesson 9.6.8 — Final Engineering Challenge

---

# 16. CROSS-CURRICULUM LESSON RELATIONSHIPS

Lessons should not exist only in a linear sequence.

Forge should explicitly model relationships such as:

- prerequisite
- reinforces
- extends
- applies
- challenges
- debugs
- revisits
- transfers

Examples:

DOM
→ JavaScript DOM manipulation
→ event-driven DOM changes
→ application state
→ React rendering
→ React debugging
→ production debugging

Functions
→ callbacks
→ higher-order functions
→ closures
→ asynchronous JavaScript
→ custom hooks

Events
→ browser events
→ event propagation
→ application interaction
→ React events
→ complex UI interaction

State
→ browser state
→ application state
→ async UI state
→ React state
→ architecture/state ownership

Debugging
→ expected vs actual
→ DevTools
→ CSS debugging
→ JavaScript debugging
→ async debugging
→ application debugging
→ React debugging
→ production debugging
→ ambiguous debugging

---

# 17. LESSON PROGRESSION MODEL

Early curriculum:

"What is this?"

Then:

"How does this work?"

Then:

"What will happen?"

Then:

"Change it."

Then:

"Build something with it."

Then:

"Why is this broken?"

Then:

"Which approach should we choose?"

Then:

"Why did you choose that?"

Finally:

"Here is the problem. Figure it out."

---

# 18. MASTERy CHECKPOINTS

Module completion should not automatically equal mastery.

Each major capability domain should eventually contain evidence from multiple modes:

- prediction
- manipulation
- implementation
- debugging
- explanation
- transfer
- judgment

A learner who completes every lesson but cannot demonstrate the capability should not be treated as having mastered it.

---

# 19. LESSON EXPERIENCE REQUIREMENT

No lesson should be authored directly from this map.

Before lesson JSON is generated, every lesson must receive an experience blueprint defining:

- learning objective
- learner state before lesson
- learner state after lesson
- conceptual setup
- discovery opportunity
- interaction sequence
- activity roles
- visual requirements
- code/runtime requirements
- prediction opportunities
- failure opportunities
- feedback strategy
- hint progression
- mastery evidence
- transfer opportunity
- humor/personality opportunities
- accessibility requirements
- responsive requirements
- estimated cognitive load
- guidance level
- completion criteria

---

# 20. QUALITY GATE

A lesson is not ready for authoring unless:

[ ] It has one clear primary capability target.

[ ] Its prerequisite concepts are known.

[ ] The learner has something meaningful to do.

[ ] The experience produces observable evidence.

[ ] The lesson advances the learner's capability.

[ ] The lesson does not merely explain information.

[ ] Its role in the larger curriculum is clear.

[ ] Its guidance level is intentional.

[ ] It does not duplicate another lesson unnecessarily.

[ ] Its difficulty is intentional.

[ ] Its relationship to previous/future lessons is understood.

[ ] It can support meaningful interaction.

[ ] It has a plausible mastery signal.

---

# 21. FINAL CURRICULUM TRANSFORMATION

Forge should gradually transform the learner from:

FOLLOWER

↓

OBSERVER

↓

PREDICTOR

↓

MANIPULATOR

↓

BUILDER

↓

DEBUGGER

↓

EXPLAINER

↓

DECISION MAKER

↓

INDEPENDENT FRONTEND ENGINEER

The final lesson is therefore not the most difficult tutorial.

It is the point where the tutorial becomes unnecessary.

---

# END OF FORGE LESSON MAP V1
