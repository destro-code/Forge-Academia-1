# Forge Curriculum v2
## Module 0.2 — Thinking Like a Programmer
### Full Lesson Manuscript

> **Purpose:** This is the actual lesson manuscript for learner-experience review. It is written as the content a learner would encounter, with review keys and feedback retained for authoring review before JSON compilation.

## Module outcome
By the end of this module, the learner can turn a vague task into explicit steps, predict a sequence before execution, compare expected and actual behavior, locate the first meaningful mismatch, and make a small justified repair.

## Module lessons
1. **Computers Do Exactly What You Said** — literal instructions
2. **Order Matters** — sequence
3. **Break the Big Thing Apart** — decomposition
4. **Predict Before You Press Run** — mental simulation
5. **Find the First Wrong Step** — first-mismatch debugging
6. **Forge Mission: Fix the Instructions** — integrated mastery

---
# 0.2.1 — Computers Do Exactly What You Said
**Estimated time:** 10 minutes  
**Learner goal:** Understand that a computer follows the instructions it receives literally; when the result is wrong, the instruction itself must be examined.

## 1. Start here

Imagine giving a helper one instruction: “Put the cup on the table.” A person may fill in missing details from common sense. A computer does not have that same common sense. It follows the instructions available to it.

That is useful. It is also dangerous. A computer can perform an instruction perfectly and still give you the wrong result if the instruction was wrong.

## 2. Quick prediction

You tell a computer to repeat these steps exactly:

1. Start with 5.
2. Add 2.
3. Subtract 1.

What result should you expect?

A. 4

B. 6

C. 7

D. 8

**Review key: C**

> **Feedback:** The machine does not need to “understand” the goal. It follows the listed steps: 5 → 7 → 6.

## 3. Perfectly wrong

A learner wants a total of 10. They write these instructions:

1. Start with 4.
2. Add 3.
3. Add 1.

The computer produces 8. Did the computer make a mistake?

A. Yes. Computers should know the intended answer.

B. No. It followed the instructions; the instructions did not produce the intended result.

C. Only if the screen looked wrong.

D. We cannot know.

**Review key: B**

> **Feedback:** This is one of the most important engineering habits in Forge: separate “the computer did what I said” from “I said the right thing.”

## 4. Change one instruction

Keep the first two steps the same:

1. Start with 4.
2. Add 3.

You need the final answer to become 10. Which next instruction is enough?

A. Add 1

B. Add 2

C. Add 3

D. Subtract 1

**Review key: C**

> **Feedback:** After step 2 the value is 7. Adding 3 gives 10. The important move is not guessing—it is checking the current result before choosing the next instruction.

## 5. The instruction test

When a result surprises you, ask two different questions:

“Did the computer follow the instructions?”
“Did the instructions describe what I actually wanted?”

Those are different questions. Keeping them separate makes mistakes easier to investigate.

## 6. Tiny exercise

Write a four-step set of plain-English instructions that starts at 2 and ends at 9. You may only add or subtract whole numbers.

Suggested answer: Start at 2 → add 4 → add 3 → add 0.

> **Feedback:** Many correct answers are possible. The goal is to make each step explicit enough that another person could follow it without guessing.

## 7. Checkpoint

Which statement is the strongest engineering explanation?

A. “The computer is confused.”

B. “The computer did something strange.”

C. “The result came from the instructions; I need to check the instructions against the result I wanted.”

D. “Try random changes until the output looks right.”

**Review key: C**

> **Feedback:** Good problem solving starts with evidence and instructions, not random edits.

## 8. Forge takeaway

Mental model: Computers are literal. They are excellent at carrying out instructions and terrible at guessing missing intent.

Senior habit: When the result is wrong, inspect the instructions before blaming the machine.

### Lesson completion
Complete the checkpoint and show the reasoning, not just the final answer. The goal is to build the habit of making a prediction, comparing evidence, and repairing the smallest justified step.

---
# 0.2.2 — Order Matters
**Estimated time:** 11 minutes  
**Learner goal:** Understand that the same actions can produce different results when their order changes.

## 1. Start here

Instructions are not just a bag of actions. The order is part of the instruction.

If you put on a coat and then put on a shirt, you can still perform both actions. The result is different from putting on the shirt first and the coat second.

For software, order can be even more important because a later step may depend on what an earlier step already changed.

## 2. Quick prediction

Start with 3. Follow these steps:

1. Multiply by 2.
2. Add 1.

What result do you get?

A. 7

B. 8

C. 9

D. 10

**Review key: A**

> **Feedback:** 3 × 2 = 6, then 6 + 1 = 7.

## 3. Same actions, different order

Now start with 3 and perform the same two actions in the opposite order:

1. Add 1.
2. Multiply by 2.

What result do you get?

A. 7

B. 8

C. 9

D. 10

**Review key: B**

> **Feedback:** 3 + 1 = 4, then 4 × 2 = 8. Same actions. Different order. Different result.

## 4. Find the dependency

Why did changing the order matter?

A. Because the second step used the result produced by the first step.

B. Because computers prefer short instructions.

C. Because the number 3 changed color.

D. Because every two-step task has exactly one correct order.

**Review key: A**

> **Feedback:** The later step acts on the current result. Once the earlier step changes that result, the later step sees something different.

## 5. A real-world sequence

You need to send a message to someone. Which order makes more sense?

A. Press Send → write the message → choose the person.

B. Choose the person → write the message → press Send.

C. Press Send → choose the person → write the message.

D. Write nothing → press Send.

**Review key: B**

> **Feedback:** The point is not the app. The point is that a later action depends on information established by earlier actions.

## 6. Put it in order

Arrange these steps for making a simple cup of tea:

A. Pour water into the cup.
B. Heat the water.
C. Put the tea bag in the cup.

One sensible order is: B → C → A.

> **Feedback:** There can be more than one sensible sequence in real life, but a sequence still has to respect what each step needs.

## 7. Checkpoint

Start with 10. Which sequence ends at 11?

A. Divide by 2, then add 6.

B. Add 6, then divide by 2.

C. Add 1, then multiply by 2.

D. Multiply by 2, then subtract 9.

**Review key: D**

> **Feedback:** 10 × 2 = 20, then 20 - 9 = 11. The order creates the path to the result.

## 8. Forge takeaway

Mental model: A program is not merely a list of actions. It is an ordered sequence of actions.

Senior habit: When a program behaves differently after a small change, ask whether the change altered the order in which work happens.

### Lesson completion
Complete the checkpoint and show the reasoning, not just the final answer. The goal is to build the habit of making a prediction, comparing evidence, and repairing the smallest justified step.

---
# 0.2.3 — Break the Big Thing Apart
**Estimated time:** 12 minutes  
**Learner goal:** Learn to decompose a large task into smaller steps that can be understood, checked, and completed one at a time.

## 1. Start here

“Build a website” is not a useful instruction for a beginner. It is a destination, not a set of steps.

Good engineers break large work into pieces small enough to reason about.

## 2. Quick prediction

Which instruction is easier to check?

A. “Make the dashboard work.”

B. “Show the dashboard title, then show the list of orders.”

C. “Finish everything.”

D. “Do the normal stuff.”

**Review key: B**

> **Feedback:** B is easier to reason about because it describes smaller, observable pieces.

## 3. From big goal to smaller jobs

Big goal: “Prepare a page for a user.”

A useful breakdown might be:

1. Show the page title.
2. Show the user name.
3. Show the main content.
4. Add the action the user needs.
5. Check that each part appears.

Each step is now something you can inspect on its own.

## 4. Which breakdown is better?

Big goal: “Make a profile card.” Which breakdown is more useful?

A. Make it good.

B. Put the whole thing together and hope it works.

C. Decide what information appears, place the information, add the visual treatment, then add the user action.

D. Start coding until something appears.

**Review key: C**

> **Feedback:** A useful breakdown turns a vague goal into smaller jobs with visible results.

## 5. Decomposition exercise

Break this task into four or five concrete steps: “Make a button that lets a user save a note.”

One possible answer:

1. Put the button and note area on the page.
2. Give the button a clear label.
3. Decide what should change when the button is used.
4. Connect the button action to that change.
5. Check the result.

> **Feedback:** Your exact steps may differ. What matters is that each step can be inspected independently and that the sequence moves toward the larger goal.

## 6. The size test

A step is probably still too large when you cannot easily answer: “How would I know this step worked?”

A step may also be too small when it adds ceremony without helping you reason about the task.

## 7. Checkpoint

You are given this task: “Fix the checkout page.” Which is the best first move?

A. Change random code until the page looks better.

B. Break the task into smaller observable pieces, such as identifying the broken area and checking one behavior at a time.

C. Rewrite the whole page.

D. Wait for the page to fix itself.

**Review key: B**

> **Feedback:** Breaking the problem apart reduces the number of things you have to reason about at once.

## 8. Forge takeaway

Mental model: Large tasks become manageable when you turn them into smaller, observable jobs.

Senior habit: When a task feels vague, do not immediately code. First make the work small enough to reason about.

### Lesson completion
Complete the checkpoint and show the reasoning, not just the final answer. The goal is to build the habit of making a prediction, comparing evidence, and repairing the smallest justified step.

---
# 0.2.4 — Predict Before You Press Run
**Estimated time:** 13 minutes  
**Learner goal:** Practice mentally tracing a short sequence before executing it, then compare the prediction with the actual result.

## 1. Start here

A strong programmer does not always press Run immediately. They build a small prediction first.

Prediction does not require perfect knowledge. It is a testable guess based on the steps you can see.

## 2. Trace a sequence

Start at 4. Follow these steps:

1. Add 3.
2. Multiply by 2.
3. Subtract 4.

What do you predict the final result will be?

A. 10

B. 12

C. 14

D. 16

**Review key: A**

> **Feedback:** 4 + 3 = 7. 7 × 2 = 14. 14 - 4 = 10. Correct answer: A.

> **Note:** Notice the important part: the first prediction was not the goal. The goal was to trace the steps before seeing the answer.

## 3. Make the trace visible

Instead of holding everything in your head, write the changing value after each step:

Start: 4
After step 1: 7
After step 2: 14
After step 3: 10

This is a simple trace. It gives you checkpoints.

## 4. Predict a changed sequence

Now start at 4 and change only step 2:

1. Add 3.
2. Multiply by 3.
3. Subtract 4.

What should the final result be?

A. 10

B. 13

C. 17

D. 21

**Review key: C**

> **Feedback:** 4 + 3 = 7. 7 × 3 = 21. 21 - 4 = 17. Correct answer: C.

> **Note:** Again, the useful skill is not memorizing the answer. It is carrying the current result forward one step at a time.

## 5. Predict before executing

You are about to run a program that should turn 6 into 9. Before you run it, write one sentence: “I predict the final value will be ___ because the steps do ___.”

There is no single sentence we require here. The habit matters: predict first, then observe.

## 6. Compare prediction with result

Suppose you predicted 9 but the actual result is 11. What is the most useful next move?

A. Change everything immediately.

B. Compare the expected trace with the actual trace and find the first step where they differ.

C. Decide the computer is wrong.

D. Ignore the result.

**Review key: B**

> **Feedback:** A prediction gives you something to compare against. The gap between expected and actual becomes evidence.

## 7. Checkpoint

Why is prediction useful even when your prediction is wrong?

A. Because wrong predictions are embarrassing and should be hidden.

B. Because a prediction gives you an expectation that you can compare with what actually happened.

C. Because computers only work when you guess first.

D. Because every program has one obvious answer.

**Review key: B**

> **Feedback:** Prediction turns running code into an experiment: expect something, observe something, compare the two.

## 8. Forge takeaway

Mental model: Before execution, build a small expected trace. After execution, compare the observed result to that trace.

Senior habit: Do not use Run to replace thinking. Use Run to test thinking.

### Lesson completion
Complete the checkpoint and show the reasoning, not just the final answer. The goal is to build the habit of making a prediction, comparing evidence, and repairing the smallest justified step.

---
# 0.2.5 — Find the First Wrong Step
**Estimated time:** 14 minutes  
**Learner goal:** Learn the first debugging model: compare expected and actual behavior, then locate the earliest point where they diverge.

## 1. Start here

Now we can give the process a name: debugging.

Debugging is not “try random fixes until the screen looks okay.” It is an investigation.

A useful first method is simple: define what you expected, observe what happened, and find the first place where the two paths stop matching.

## 2. Expected vs actual

Expected:
Start at 2 → add 3 → multiply by 2 → result 10

Actual:
Start at 2 → add 3 → multiply by 3 → result 15

Where is the first mismatch?

A. Start at 2

B. Add 3

C. Multiply by 3

D. Final result 15

**Review key: C**

> **Feedback:** The first mismatch is the multiplication step. Once that step differs, the final result naturally differs too.

## 3. Why first matters

Suppose five later steps are also wrong because they use a bad value from an earlier step. Fixing a later step first may hide the original problem.

Finding the earliest mismatch gives you a better place to investigate.

## 4. Investigation exercise

Expected sequence:
1. Start at 5.
2. Add 2.
3. Subtract 1.
4. Multiply by 2.
Expected result: 12.

Actual sequence:
1. Start at 5.
2. Add 2.
3. Add 1.
4. Multiply by 2.
Actual result: 16.

What is the first wrong step?

A. Step 1

B. Step 2

C. Step 3

D. Step 4

**Review key: C**

> **Feedback:** Step 3 changes “subtract 1” into “add 1.” Fixing that restores the expected path.

## 5. The debugging loop

Use this loop:

1. State what you expected.
2. Observe what actually happened.
3. Find the first mismatch.
4. Change the smallest thing that addresses that mismatch.
5. Run the check again.

The loop is small on purpose. Small loops make mistakes easier to isolate.

## 6. What not to do

A page looks wrong. Which response is least useful?

A. Check the earliest step that differs from what you expected.

B. Compare a working case with the broken case.

C. Change several unrelated things at once and see whether the result improves.

D. Write down what you observe before changing anything.

**Review key: C**

> **Feedback:** Changing several things at once destroys useful evidence. You may get a different result without learning why it changed.

## 7. Checkpoint

You expected 8, but got 12. You discover that the first three steps match perfectly and the fourth step is different. What should you inspect first?

A. Step 1

B. Step 2

C. Step 3

D. Step 4

**Review key: D**

> **Feedback:** Start where the expected and actual paths first diverge.

## 8. Forge takeaway

Mental model: Debugging is the search for the first useful mismatch between expected and actual behavior.

Senior habit: Preserve evidence. Change one meaningful thing at a time so the system can teach you what happened.

### Lesson completion
Complete the checkpoint and show the reasoning, not just the final answer. The goal is to build the habit of making a prediction, comparing evidence, and repairing the smallest justified step.

---
# 0.2.6 — Forge Mission: Fix the Instructions
**Estimated time:** 18 minutes  
**Learner goal:** Apply the module model independently: decompose a task, predict behavior, find the first wrong step, and repair the instructions without changing unrelated work.

## 1. Forge Mission

A teammate says: “The calculator is broken. Fix it.”

You are given the intended behavior and a sequence of instructions. Your job is to investigate, not guess.

## 2. Case A — Decompose the goal

Intended behavior: Start with 8, remove 3, double the result, then finish with 10.

Write the task as four small, checkable steps.

Reference answer:
1. Start with 8.
2. Subtract 3.
3. Multiply the current value by 2.
4. Produce 10.

> **Feedback:** A strong breakdown makes each step observable and gives you places to check the work.

## 3. Case B — Predict

The current instructions are:

1. Start with 8.
2. Subtract 3.
3. Multiply by 2.
4. Stop.

What final result do you predict?

A. 5

B. 8

C. 10

D. 16

**Review key: C**

> **Feedback:** 8 → 5 → 10. Your prediction is now an expectation you can compare with the actual run.

## 4. Case C — The broken version

A new version contains:

1. Start with 8.
2. Subtract 3.
3. Multiply by 3.
4. Stop.

It produces 15. What is the first wrong step compared with the intended task?

A. Step 1

B. Step 2

C. Step 3

D. Step 4

**Review key: C**

> **Feedback:** The first two steps still match the intended sequence. Step 3 is where the instruction changes from “multiply by 2” to “multiply by 3.”

## 5. Case D — Make the smallest repair

What is the smallest change that fixes the problem?

A. Rewrite all four steps.

B. Change step 3 so it multiplies by 2.

C. Remove step 2.

D. Add five new steps just in case.

**Review key: B**

> **Feedback:** Fix the mismatch you actually found. Do not create new changes that you have not justified.

## 6. Case E — Transfer

Now the setting changes. A shopping page should calculate a discounted price using these steps:

1. Start with the original price.
2. Remove the discount amount.
3. Add the tax amount.
4. Show the final price.

A tester says the final price is too high. You discover that the tax is being added before the discount is removed. What should you investigate first?

A. The order of the steps.

B. The color of the price.

C. The page title.

D. The tester’s keyboard.

**Review key: A**

> **Feedback:** The module idea transfers: when the result depends on sequence, compare the intended order with the actual order.

## 7. Final mastery check

Answer these without looking back at the previous cases.

1. Why can a computer produce the wrong result even when it follows instructions exactly?

2. Why can changing the order of two actions change the final result?

3. Why is breaking a large task into smaller steps useful?

4. Why should you predict before running?

5. When debugging, why is the first mismatch especially useful?

Reference answers:
1. Because the instructions can be wrong or incomplete relative to the intended result.
2. Because a later action may use the result produced by the earlier action.
3. Smaller steps are easier to inspect, test, and reason about.
4. A prediction creates an expectation that can be compared with what actually happens.
5. It is the earliest evidence of where the intended and actual paths diverged.

## 8. Final reflection

Finish this sentence in your own words: “Before I change code, I should first ________.”

Strong answers usually include some version of: understand the intended result, inspect the current steps, and identify the first meaningful mismatch.

## 9. Forge takeaway

You do not need a giant bag of programming tricks to begin thinking like a programmer. You need a disciplined loop: make the task concrete, predict what should happen, observe what actually happens, find the first mismatch, and make the smallest justified change.

That loop will keep returning throughout Forge. The tools will get more powerful. The reasoning habit stays the same.

### Lesson completion
Complete the checkpoint and show the reasoning, not just the final answer. The goal is to build the habit of making a prediction, comparing evidence, and repairing the smallest justified step.
