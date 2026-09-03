# FORGE LESSON SCHEMA V1

Status: Draft for approval
Purpose: Canonical data contract for Forge lessons.

---

# 1. PURPOSE

The Forge Lesson Schema defines the machine-readable structure of a lesson.

It must represent:

- learning intent
- capabilities
- concepts
- prerequisites
- experience flow
- activities
- validation
- feedback
- hints
- evidence
- progression
- mastery
- transfer
- runtime requirements
- accessibility
- relationships

The schema describes the lesson.

It does not determine the lesson's pedagogy.

Pedagogy is defined by:

- FORGE_LEARNING_EXPERIENCE_SPEC_V1
- FORGE_CURRICULUM_ARCHITECTURE_V1
- FORGE_CAPABILITY_MAP_V1
- FORGE_CONCEPT_DEPENDENCY_MAP_V1
- FORGE_LESSON_EXPERIENCE_BLUEPRINT_V1
- FORGE_VOICE_AND_HUMOR_BIBLE_V1

---

# 2. DESIGN PRINCIPLES

## 2.1 Canonical Source

The lesson JSON is the authoritative representation of a Forge lesson.

UI components must consume the canonical lesson model.

They must not infer curriculum meaning from presentation details.

---

## 2.2 Content and Rendering Are Separate

Content defines:

WHAT the learner experiences.

Renderers define:

HOW the experience is displayed.

Example:

```text
activity.type = "prediction"
does not dictate the visual implementation.
The renderer owns presentation.
2.3 Validation Is Explicit
An activity must explicitly describe how success is determined.
Do not infer validation from:
button labels
answer text
UI state
activity order
arbitrary strings
2.4 Evidence Is First-Class
Forge must record what kind of evidence an activity produces.
Examples:
recognition
prediction
manipulation
implementation
debugging
explanation
transfer
judgment
3. TOP-LEVEL LESSON
Conceptual structure:
{
  "id": "lesson-0-1-1",
  "schemaVersion": "1.0.0",

  "identity": {},
  "curriculum": {},
  "learning": {},
  "experience": {},
  "activities": [],
  "mastery": {},
  "relationships": {},
  "runtime": {},
  "accessibility": {}
}
4. IDENTITY
{
  "identity": {
    "title": "The Button Has Betrayed You",
    "description": "Investigate a button that refuses to behave.",
    "learnerFacing": true,
    "role": "debugging",
    "estimatedMinutes": 15
  }
}
Identity describes the lesson from the learner's perspective.
Do not put implementation details here.
5. CURRICULUM
{
  "curriculum": {
    "phaseId": "phase-0",
    "moduleId": "module-0-1",
    "capabilityIds": [
      "capability-observation",
      "capability-investigation"
    ],
    "conceptIds": [
      "concept-browser",
      "concept-dom",
      "concept-javascript"
    ],
    "prerequisiteLessonIds": []
  }
}
The curriculum section connects the lesson to the larger Forge graph.
6. LEARNING
{
  "learning": {
    "primaryCapability": {
      "id": "capability-investigate-browser-behavior",
      "statement": "Investigate unexpected browser behavior using observable evidence."
    },

    "secondaryCapabilities": [],

    "startingState": {
      "knows": [],
      "canDo": [],
      "likelyMisconceptions": []
    },

    "targetState": {
      "canDo": [
        "Identify an observable symptom.",
        "Gather relevant browser evidence.",
        "Form a plausible hypothesis.",
        "Test the hypothesis.",
        "Verify the result."
      ]
    }
  }
}
7. EXPERIENCE
The experience section describes the intended learning arc.
{
  "experience": {
    "guidanceLevel": "guided",

    "arc": [
      "encounter",
      "prediction",
      "failure",
      "observation",
      "interaction",
      "investigation",
      "hypothesis",
      "fix",
      "verification",
      "explanation",
      "transfer"
    ],

    "emotionalJourney": [
      "curiosity",
      "confusion",
      "investigation",
      "discovery",
      "confidence"
    ]
  }
}
The arc is descriptive.
The activity sequence remains authoritative.
8. ACTIVITIES
Activities are the core executable learning units.
Every activity must have:
{
  "id": "activity-0-1-1-01",
  "type": "prediction",
  "role": "prediction",
  "title": "...",
  "instruction": "...",
  "content": {},
  "validation": {},
  "feedback": {},
  "hints": [],
  "evidence": {},
  "progression": {}
}
9. ACTIVITY ID
Activity IDs must be:
unique
stable
deterministic
never reused for another activity
Recommended format:
activity-{lesson}-{sequence}
Example:
activity-0-1-1-01
activity-0-1-1-02
activity-0-1-1-03
10. ACTIVITY TYPE
Activity type identifies the interaction contract.
Initial supported types:
explanation
visual
interactive-demo
prediction
multiple-choice
multi-select
ordering
fill-blank
output-prediction
code-modification
interactive-code
debugging
reflection
judgment
Types may expand later.
A new activity type requires:
schema definition
renderer
validation contract
tests
accessibility behavior
mobile behavior
11. ACTIVITY ROLE
Type and role are different.
Example:
{
  "type": "multiple-choice",
  "role": "diagnosis"
}
Possible roles:
encounter
discovery
explanation
prediction
manipulation
practice
challenge
debugging
investigation
hypothesis
verification
reflection
transfer
mastery
judgment
The role describes why the activity exists pedagogically.
12. ACTIVITY CONTENT
Content depends on activity type.
Example prediction:
{
  "content": {
    "prompt": "What do you expect to happen?",
    "options": [
      {
        "id": "option-a",
        "label": "The status updates"
      },
      {
        "id": "option-b",
        "label": "Nothing changes"
      }
    ]
  }
}
Example code:
{
  "content": {
    "language": "javascript",
    "starterCode": "...",
    "editable": true
  }
}
Example visual:
{
  "content": {
    "visualId": "dom-tree-basic",
    "interactive": true
  }
}
Activity-specific content must never leak renderer-specific implementation details.
13. VALIDATION
Validation describes how learner success is determined.
Example:
{
  "validation": {
    "type": "single-choice",
    "correctAnswer": "option-b"
  }
}
Code:
{
  "validation": {
    "type": "tests",
    "testCases": [
      {
        "id": "test-1",
        "description": "The button updates the status.",
        "assertion": "..."
      }
    ]
  }
}
Validation must be deterministic wherever possible.
14. VALIDATION TYPES
Initial conceptual validation types:
single-choice
multi-choice
ordered-sequence
text-match
code-output
tests
state
visual-state
debug-result
explanation
judgment
Not every type must be implemented immediately.
The schema can support future expansion without changing lesson identity.
15. FEEDBACK
Feedback should describe what Forge tells the learner after an attempt.
Structure:
{
  "feedback": {
    "correct": {
      "result": "Correct.",
      "observation": "...",
      "mechanism": "...",
      "generalization": "..."
    },

    "incorrect": {
      "result": "Not quite.",
      "observation": "...",
      "mechanism": "...",
      "generalization": "..."
    }
  }
}
All layers are optional.
Use only what is pedagogically useful.
16. FEEDBACK PRINCIPLES
Feedback should answer, when relevant:
What happened?
Why did it happen?
What evidence supports that?
What should the learner investigate?
What general rule can be reused?
Avoid generic:
Great job!
Awesome!
Try again!
Feedback must be specific to the learner's action.
17. HINTS
Hints are ordered.
{
  "hints": [
    {
      "level": 1,
      "type": "direction",
      "text": "Look at what the browser can actually show you."
    },
    {
      "level": 2,
      "type": "specific-area",
      "text": "Open the Console."
    },
    {
      "level": 3,
      "type": "concept",
      "text": "The browser reports errors when JavaScript cannot resolve something it tries to use."
    }
  ]
}
Hints should move from:
DIRECTION
→
SPECIFIC AREA
→
CONCEPT
→
RESOLUTION
Hints must not immediately reveal the answer unless the final hint is intentionally designed to do so.
18. EVIDENCE
Every meaningful activity should declare what learning evidence it produces.
{
  "evidence": {
    "types": [
      "prediction"
    ],
    "capabilityIds": [
      "capability-predict-browser-behavior"
    ],
    "weight": 1
  }
}
Evidence types:
recognition
prediction
manipulation
implementation
debugging
explanation
transfer
judgment
19. PROGRESSION
{
  "progression": {
    "guidance": "guided",
    "difficulty": {
      "conceptualComplexity": 1,
      "interactionComplexity": 1,
      "ambiguity": 1,
      "debuggingComplexity": 1,
      "environmentComplexity": 1,
      "communicationDemand": 1
    }
  }
}
Difficulty dimensions should normally use:
1 = very low
2 = low
3 = moderate
4 = high
5 = very high
Difficulty must describe the actual cognitive demand.
20. ACTIVITY DEPENDENCIES
Activities may depend on earlier activities.
{
  "dependsOn": [
    "activity-0-1-1-03"
  ]
}
This allows branching experiences.
Example:
Prediction
     ↓
Correct ─────────────→ Continue
     ↓
Incorrect
     ↓
Hint
     ↓
Retry
Activities should not be artificially independent if the experience logically depends on previous evidence.
21. LESSON BRANCHING
Lessons may contain conditional paths.
Example:
{
  "branching": {
    "enabled": true,
    "rules": []
  }
}
Branching should be used sparingly.
Do not create branching simply because the engine can support it.
Use it when learner behavior meaningfully changes the learning path.
22. MASTERY
Lesson mastery is defined separately from completion.
{
  "mastery": {
    "requiredEvidence": [
      "prediction",
      "debugging",
      "explanation",
      "transfer"
    ],

    "completionCriteria": {
      "requiredActivities": [],
      "minimumEvidence": {}
    },

    "masteryCriteria": {
      "minimumDemonstrations": 2,
      "requiresTransfer": true
    }
  }
}
The exact scoring model may evolve.
The distinction between completion and mastery must remain.
23. TRANSFER
Lessons may explicitly define transfer opportunities.
{
  "transfer": {
    "enabled": true,
    "activityIds": [
      "activity-0-1-1-10"
    ],
    "capabilityIds": [
      "capability-investigate-browser-behavior"
    ]
  }
}
Transfer activities should alter the surface context while preserving the underlying capability.
24. RELATIONSHIPS
{
  "relationships": {
    "prerequisites": [],
    "reinforces": [],
    "extends": [],
    "applies": [],
    "challenges": [],
    "debugs": [],
    "revisits": [],
    "transfers": []
  }
}
These relationships form the curriculum graph.
25. RUNTIME
Runtime requirements must be explicit.
{
  "runtime": {
    "required": false,
    "environment": null
  }
}
Possible environments:
none
browser
javascript
typescript
react
react-native
http
nextjs
A lesson must not require a runtime merely because a renderer happens to support one.
26. ACCESSIBILITY
Accessibility requirements belong to lesson data where content-specific information is required.
{
  "accessibility": {
    "requirements": [
      "All interactive controls have accessible names.",
      "Keyboard interaction is supported.",
      "Visual information has an equivalent nonvisual explanation."
    ]
  }
}
General accessibility behavior remains a renderer/system responsibility.
27. ACTIVITY SCHEMA EXAMPLE
A simplified complete activity:
{
  "id": "activity-0-1-1-04",
  "type": "multiple-choice",
  "role": "investigation",

  "title": "What do we actually know?",

  "instruction": "Choose only what you can directly observe.",

  "content": {
    "options": [
      {
        "id": "clicked",
        "label": "The button was clicked."
      },
      {
        "id": "server-error",
        "label": "The server rejected the request."
      },
      {
        "id": "status-unchanged",
        "label": "The status did not change."
      },
      {
        "id": "javascript-error",
        "label": "JavaScript definitely failed."
      }
    ]
  },

  "validation": {
    "type": "multi-choice",
    "correctAnswers": [
      "clicked",
      "status-unchanged"
    ]
  },

  "feedback": {
    "correct": {
      "result": "Exactly.",
      "mechanism": "You selected observations rather than assumptions."
    },

    "incorrect": {
      "result": "Not quite.",
      "observation": "Some of those statements are conclusions, not observations."
    }
  },

  "hints": [
    {
      "level": 1,
      "type": "direction",
      "text": "Separate what you saw from what you think caused it."
    }
  ],

  "evidence": {
    "types": [
      "recognition",
      "debugging"
    ],
    "capabilityIds": [
      "capability-distinguish-evidence-from-assumption"
    ],
    "weight": 1
  },

  "progression": {
    "guidance": "guided",
    "difficulty": {
      "conceptualComplexity": 1,
      "interactionComplexity": 1,
      "ambiguity": 2,
      "debuggingComplexity": 1,
      "environmentComplexity": 1,
      "communicationDemand": 1
    }
  }
}
28. COMPLETE LESSON SHAPE
A complete lesson therefore conceptually looks like:
{
  "id": "...",
  "schemaVersion": "1.0.0",

  "identity": {},

  "curriculum": {},

  "learning": {},

  "experience": {},

  "activities": [],

  "mastery": {},

  "relationships": {},

  "runtime": {},

  "accessibility": {}
}
29. WHAT DOES NOT BELONG IN LESSON JSON
Do not store:
React component names
CSS class names
renderer implementation details
DOM selectors used only by the UI
arbitrary frontend state
API implementation details
provider implementation details
hardcoded route assumptions
UI animation instructions
component-specific styling
unless they are genuinely part of the learning content.
30. CANONICAL ARCHITECTURE
The intended flow is:
LESSON JSON
    ↓
CanonicalProvider
    ↓
Lesson Model
    ↓
CanonicalLessonPlayer
    ↓
CanonicalActivityView
    ↓
Activity Registry
    ↓
Activity Renderer
    ↓
Learning Engine
    ↓
Validation
    ↓
Evidence
    ↓
Progress
Content should never need to know which React component renders it.
31. VALIDATION PIPELINE
Every lesson should pass:
JSON Syntax
    ↓
Schema Validation
    ↓
Reference Validation
    ↓
Concept Validation
    ↓
Capability Validation
    ↓
Prerequisite Validation
    ↓
Activity Validation
    ↓
Validation Contract Check
    ↓
Experience Integrity Check
    ↓
Accessibility Check
    ↓
Runtime Compatibility Check
    ↓
Curriculum Integration Test
32. REFERENCE VALIDATION
The compiler should reject:
nonexistent phase IDs
nonexistent module IDs
nonexistent capability IDs
nonexistent concept IDs
nonexistent lesson dependencies
duplicate activity IDs
invalid activity types
invalid validation types
invalid runtime environments
impossible dependency cycles where prohibited
33. EXPERIENCE INTEGRITY RULES
The compiler should eventually be able to detect suspicious lessons.
Examples:
No meaningful learner action
Reject or warn.
No evidence
Warn.
No validation where validation is expected
Reject.
Excessive explanation
Warn.
Every activity is a quiz
Warn.
Every activity is the same type
Warn.
Mastery requires no demonstration
Warn.
Transfer declared but absent
Reject.
Capability declared but never evidenced
Reject.
These are curriculum-quality checks, not merely JSON checks.
34. AI GENERATION CONTRACT
AI-generated lessons must follow this order:
LESSON MAP
    ↓
LESSON EXPERIENCE BLUEPRINT
    ↓
LESSON SCHEMA
    ↓
CONTENT GENERATION
    ↓
AUTOMATED VALIDATION
    ↓
PEDAGOGICAL REVIEW
    ↓
VOICE REVIEW
    ↓
RUNTIME TEST
    ↓
ACCEPTANCE
AI must never skip directly from:
"Teach CSS"
to:
generated JSON.
35. GOLDEN LESSON
Lesson 0 should become the first Golden Lesson.
It should establish the reference standard for:
activity quality
interaction quality
feedback
hints
validation
evidence
progression
humor
visual design
debugging
transfer
mobile behavior
accessibility
Future lessons should be compared against it.
36. SCHEMA EVOLUTION
Schema changes require:
version increment where necessary
migration strategy
validation updates
renderer compatibility review
test updates
existing lesson verification
Never silently change the meaning of an existing field.
37. FINAL PRINCIPLE
The schema exists to answer:
"Can Forge reliably represent the learning experience we designed?"
It should never become the thing that dictates:
"What learning experience are we allowed to create?"
The experience comes first.
The schema exists to encode it faithfully.
