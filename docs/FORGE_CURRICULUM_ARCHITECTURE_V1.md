FORGE LEARNING EXPERIENCE SPECIFICATION v1.0
Status: Foundational product specification
Purpose: Define how Forge teaches before we rebuild the curriculum.
Principle: The curriculum must serve the experience — not the other way around.
1. What Forge Is
Forge is not primarily a course library.
It is an interactive environment for developing frontend engineering ability.
The learner should progressively move from:
“I don't understand this.”
to:
“I understand what's happening.”
to:
“I can predict what will happen.”
to:
“I can make it happen.”
to:
“I can fix it when it breaks.”
to:
“I can build something with it.”
to:
“I can explain why I built it this way.”
That progression is the heart of Forge.
2. The Forge Learning Loop
The fundamental unit isn't a paragraph.
It is a learning loop.
Discover
Introduce a problem, situation, question, visual, or surprising behavior.
Understand
Give the learner the minimum explanation necessary to build a mental model.
Interact
Let them manipulate or explore the concept.
Predict
Ask them what they think will happen before revealing the answer.
Practice
Give them a constrained task where they apply the concept.
Challenge
Remove some of the scaffolding.
Debug
Introduce failure or give them something broken to diagnose.
Explain
Ask them to articulate the reasoning behind their solution.
Master
Test whether they can transfer the concept to a new situation.
This produces:
Discover → Understand → Interact → Predict → Practice → Challenge → Debug → Explain → Master
Not every lesson needs every stage.
But passive explanation should never dominate the experience.
3. Forge's Core Principle
Don't tell the learner something they could discover.
If a concept can be safely demonstrated, let the learner see it.
If they can predict the outcome, ask them first.
If they can manipulate it, let them manipulate it.
If they can solve it, don't give them the answer.
If they make a mistake, don't immediately correct them.
Give them enough information to reason their way out.
This is how Forge develops engineering intuition rather than memorization.
4. What a Forge Lesson Feels Like
A lesson shouldn't feel like:
Heading
Paragraph
Paragraph
Code block
Quiz
Next
Instead, imagine:
🧠 The Variable That Doesn't Forget
Your program needs to remember a user's name.
Let's give it somewhere to keep it.
[Interactive code]
let name = "Ada";
Then:
Okay. Your program now knows the name.
But what happens if we change it?
[Predict]
The learner chooses an answer.
Forge reveals what happened.
Then:
Your turn.
Change the value so the greeting says something different.
They edit the code.
Check.
There it is.
You just changed the state your program remembers.
Then the lesson gets slightly harder.
No giant lecture required.
The learner has experienced the concept.
5. Lesson Titles
Technical curriculum structure and learner-facing presentation should be separated.
Internally:
JavaScript Variables
Learner-facing:
🧠 The Variable That Doesn't Forget
Internally:
DOM Events
Learner-facing:
🖱️ You Clicked It. Now What?
Internally:
Debugging Event Listeners
Learner-facing:
🚨 The Button Has Betrayed You
The technical subject should still be visible somewhere so learners aren't confused.
For example:
The Button Has Betrayed You
JavaScript · Event Listeners
This gives us personality without sacrificing structure.
6. Activity Design
Activities aren't decorations.
Every activity must have a learning purpose.
Explanation
Use when the learner genuinely needs a mental model.
Visual
Use when spatial/structural representation makes something easier to understand.
Interactive demonstration
Use when changing something and seeing the consequence is valuable.
Prediction
Use before revealing behavior.
Multiple choice
Use for conceptual discrimination, not cheap quizzes.
Multiple select
Use when multiple conditions must be recognized.
Fill-in-the-blank
Use for targeted recall.
Ordering
Use when sequence matters.
Output prediction
Extremely valuable for programming.
“What will this code output?”
Before running it.
Interactive coding
Use when the learner should actually manipulate code.
Debugging
Use when the learner needs to develop diagnosis skills.
Reflection
Use when articulating reasoning itself is part of the learning objective.
Judgment
Use for engineering decisions.
“Would you ship this?”
That begins moving Forge toward engineering judgment, not merely coding ability.
7. The Coding Experience
Code exercises should progressively transition through:
Stage 1 — Guided
“Change this value.”
Stage 2 — Constrained
“Complete this function.”
Stage 3 — Assisted
“The page isn't behaving correctly. Fix it.”
Stage 4 — Independent
“Build the behavior.”
Stage 5 — Open-ended
“Here's the requirement. Decide how to implement it.”
That progression is critical.
The learner should eventually stop relying on Forge.
The goal is independence.
8. Feedback
Feedback should answer:
What happened?
Why did it happen?
What should I investigate?
What did I do correctly?
Generic:
❌ Incorrect.
is weak.
Better:
The function ran, but it returned undefined.
Check what the function actually returns before changing anything else.
Even better when appropriate:
You're looking in the right place. The problem isn't the loop — it's what happens after the loop finishes.
Feedback should teach reasoning, not simply reveal answers.
9. Failure
Failure is not an error condition in Forge.
Failure is learning material.
A learner should be able to:
attempt something
fail
inspect what happened
receive a useful clue
attempt again
succeed
The emotional experience should be:
“Ohhhhhh. I see what I did.”
Not:
“The system marked me wrong.”
This is particularly important for Debug Lab.
10. Hints
Hints should be progressive.
Hint 1 — Direction
Check the value being passed into the function.
Hint 2 — Specific area
Look at the argument on line 4.
Hint 3 — Conceptual explanation
Remember: function arguments are assigned to the corresponding parameters.
Final explanation
Only after appropriate attempts.
The system should reduce learner effort without removing learner thinking.
11. Humor & Personality
This is now a first-class Forge requirement.
Forge should feel like a clever mentor.
Not a clown.
Not a textbook.
Not corporate training software.
Not an AI desperately trying to sound young.
Desired personality
Playful.
Witty.
Confident.
Encouraging.
Occasionally mischievous.
Technically serious.
Example:
The Button Has Betrayed You
You clicked it.
Nothing.
You clicked it again.
Still nothing.
The button has chosen violence.
Your mission: find out why.
Then after success:
Button restored.
You may now click things with confidence.
That's Forge.
What Forge should avoid
“Yay! 🎉 You're a coding superstar! 🚀🔥💯”
No.
Too generic.
Too loud.
Too artificial.
Forge humor should come from the situation.
12. Humor Must Not Interfere With Learning
There are moments where humor should disappear.
When the learner is confused:
Take a breath. Let's trace this one carefully.
When introducing something complex:
This one has a few moving parts. We'll take them one at a time.
When the learner repeatedly fails:
You're not missing something obvious. There's a subtle detail here.
Humor is a tool, not the objective.
13. Visual Learning
Forge should use visual representation whenever it materially improves comprehension.
Examples:
Browser rendering
Browser → HTML → DOM → CSS → Layout → Paint
Flexbox
Let the learner manipulate:
direction
alignment
justification
gap
and immediately see the result.
HTTP
Let them inspect:
Request
Headers
Body
Response
Status
JavaScript execution
Show values moving through execution.
React
Eventually visualize:
State change → render → reconciliation → DOM update
The learner should be able to see invisible processes.
That is one of Forge's biggest opportunities.
14. The Difficulty Curve
Forge should avoid the traditional:
Easy → Easy → Easy → HUGE EXAM
Instead:
Introduce → Scaffold → Practice → Slightly harder → Remove scaffold → Apply → Transfer
Difficulty should increase gradually.
The learner should regularly think:
“Okay, I can do this.”
followed by:
“Oh, that's new.”
followed by:
“Wait... I actually figured that out.”
That feeling is important.
15. Mastery
Completion ≠ mastery.
A learner clicking through a lesson should not automatically mean:
Mastered.
Mastery should involve some combination of:
successful application
independent problem solving
debugging
prediction
transfer
explanation
retention
Eventually the learner should encounter a concept again in a different context.
For example:
Lesson: CSS positioning
Later:
Debug Challenge: modal appears in the wrong place.
Later:
Project: build a dropdown.
Later:
Interview: explain why position: absolute behaves the way it does.
That is reinforcement through context.
16. Projects
Projects shouldn't suddenly introduce ten completely new concepts.
They should be synthesis points.
The learner has acquired several skills.
Forge says:
You've got the pieces.
Now build something.
Early projects are highly constrained.
Later projects become increasingly open-ended.
Eventually:
Here's the requirement.
Here's the environment.
Figure it out.
That's where confidence develops.
17. Debug Lab
Debugging is not a side feature.
It is one of Forge's defining capabilities.
Learners should repeatedly experience:
Something is broken.
Their job is not:
“Guess the correct answer.”
Their job is:
Investigate.
They should learn a systematic process:
Observe → Reproduce → Inspect → Form hypothesis → Test → Fix → Verify
That process is far more valuable than memorizing debugging tricks.
18. Interview Academy
Interview preparation should not simply be a question bank.
Forge should eventually simulate:
Conceptual questions
“Explain event bubbling.”
Prediction
“What happens when this code runs?”
Debugging
“This application is broken. Find the issue.”
Design decisions
“Which approach would you choose and why?”
Timed problems
“You have 25 minutes.”
Communication
“Explain your solution as if you're speaking to an interviewer.”
The learner should develop technical communication, not just answer recognition.
19. The Emotional Journey
This may be the most important section.
A learner should experience:
Curiosity
“Wait, why did that happen?”
Discovery
“Ohhh, that's how it works.”
Agency
“I changed it and it actually worked.”
Frustration
“Why isn't this working?”
Investigation
“Let me check the console.”
Breakthrough
“OH. That's the problem.”
Confidence
“I can fix this.”
Independence
“I don't need Forge to tell me what to do.”
That emotional progression is what turns a lesson into an experience.
20. The Ultimate Forge Loop
If we get this right, the learner's journey becomes:
Curious → Explore → Understand → Try → Fail → Investigate → Solve → Explain → Apply → Master
And eventually:
Encounter problem → Think → Solve
without needing Forge.
That is the actual product goal.
Not dependency.
Competence.
21. What Forge Must Never Become
This is just as important.
Forge must not become:
❌ A textbook with animations.
❌ A quiz app with a code editor.
❌ A collection of AI-generated lessons.
❌ A syntax memorization platform.
❌ A dopamine machine full of meaningless XP.
❌ A platform that constantly interrupts learning with jokes.
❌ A platform that gives answers before learners think.
❌ A platform where completing lessons is confused with mastery.
❌ A prettier version of existing documentation.
❌ A generic “AI tutor” wearing a Forge logo.
22. The Standard We Will Use
From now on, every new curriculum component should survive this question:
“What is the learner actually doing?”
If the answer is:
“Reading a paragraph.”
That's probably insufficient.
If the answer is:
“Predicting what will happen, manipulating a live example, testing their prediction, and then explaining why they were right or wrong.”
Now we're getting somewhere.
23. What This Means for Our Curriculum Rebuild
This specification becomes the north star.
We don't take the old 97 lessons and rewrite them.
Instead we ask:
If Forge were created today, knowing everything we know about frontend education, how would we teach frontend engineering from absolute zero?
Then we build that curriculum.
And every lesson gets designed against this specification.
