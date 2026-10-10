# Forge Curriculum v2
## Module 2.5 — Git, GitHub, and Team Workflow
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing lesson manuscript for review. It is not a blueprint. The learner should be able to read this document from top to bottom and experience the lesson as it will later appear in Forge. Review keys, hints, and reference answers are included for human review.

## Module outcome
By the end of this module, the learner can use Git as a safety and collaboration system: make focused commits, inspect changes, work on branches, synchronize with a remote repository, open a pull request, handle a simple merge conflict, and recover from common mistakes without panicking.

## Module lessons
1. **Version Control Solves the Memory Problem**
2. **The Repository and the Working Tree**
3. **Stage a Change, Then Commit It**
4. **Read the Diff and the History**
5. **Branches: Isolate One Piece of Work**
6. **Remotes: Share the Repository**
7. **Pull Requests: Let Other Engineers Read the Change**
8. **Merge Conflicts: When Two Histories Touch the Same Lines**
9. **Undo Without Panic**
10. **Forge Mission: Ship a Small Change Safely**

---
# 2.5.1 — Version Control Solves the Memory Problem
**Estimated time:** 10 minutes  
**Learner goal:** Understand what version control is for and why engineers keep a history of deliberate changes instead of relying on copied folders or memory.

## 1. Start here

Imagine you are working on a page.

At 10:00, it works.

At 10:30, you make three changes.

At 11:00, something is broken.

You stare at the code and think:

> “It worked before. What did I change?”

That question is the problem version control is designed to make easier.

**Git records a history of changes so you can see what changed, when it changed, and which version you want to work from.**

It is not a magical undo button. It is a system for recording and comparing versions of a project.

## 2. Predict before the reveal

Which situation is easiest to recover from?

A. You have one folder containing the current files and no history.
B. You have the current files plus a sequence of deliberate saved versions you can compare.
C. You have five copies of the folder named `final`, `final2`, `final-real`, `final-new`, and `final-new-2`.
D. You remember that the broken behavior appeared “sometime this morning.”

**Review key:** B

**Feedback:** Version control gives you a structured history. Random copies preserve files, but they do not give you a reliable model of what changed between versions.

## 3. The core idea

For this module, keep one sentence in your head:

**Git helps you answer: “What changed, what version do I have, and how do I safely move my work to another version?”**

That single idea will explain most of the commands you learn next.

## 4. A better mental model

Think of your project history like a row of deliberate snapshots:

```text
A ---- B ---- C ---- D
      ^           ^
   working    current good
   version    version
```

Each saved point represents a known state of the project.

You can inspect the differences between states.

You can create a new line of work without destroying the old one.

You can share your history with teammates.

## 5. Which sentence is the most useful?

A teammate says, “Git is just a place to upload code.”

Which response is more accurate?

A. Yes. Uploading is the entire point.
B. Git records project history and supports safe changes; sharing with teammates is one part of that workflow.
C. Git only stores images.
D. Git is a text editor.

**Review key:** B

**Feedback:** Sharing matters, but the deeper value is the history and control over changes.

## 6. Transfer

You are about to make a risky change to a working feature.

What should version control make possible?

**Suggested answer:** “I should be able to record a known-good state before the change, inspect what the change actually did, and return to a known point if necessary.”

## 7. Forge takeaway

**Mental model:** Version control is an engineering memory system.

**Senior habit:** Before changing a working feature, make sure you can identify the version that works now.

### Lesson completion
Explain why version control is safer than relying on memory or a pile of copied folders.

---
# 2.5.2 — The Repository and the Working Tree
**Estimated time:** 12 minutes  
**Learner goal:** Distinguish the project files you are currently changing from the Git history that records versions of the project.

## 1. Two places to think about

When you use Git, there are two important ideas:

**Working tree:** the files you are currently looking at and editing.

**Repository:** the Git-managed history that records project states and changes.

The working tree answers:

> “What does my project look like right now?”

The repository answers:

> “What history has been recorded?”

## 2. Predict the difference

You change a file in the working tree but have not recorded that change yet.

Which statement is true?

A. The file on disk changed, but the new change is not yet part of the recorded Git history.
B. Every Git user on the project immediately receives the change.
C. The change automatically becomes permanent history.
D. The change is impossible to lose because Git has already committed it.

**Review key:** A

**Feedback:** Editing a file and recording that edit are different operations.

## 3. `git status`

One of the most useful commands is:

```bash
git status
```

Think of it as asking Git:

> “What is different about my working tree right now?”

A simplified result might look like:

```text
modified:   src/app.js
modified:   styles.css
```

That does not mean those files have been committed. It means Git sees changes that are not yet part of the latest recorded project state.

## 4. Change one file

Suppose you edit only `src/app.js`.

Then `git status` reports:

```text
modified:   src/app.js
```

What should you conclude?

A. Git deleted the file.
B. The working tree differs from the recorded state for that file.
C. The remote repository was updated.
D. A pull request has been opened.

**Review key:** B

**Feedback:** Status tells you about the relationship between your working files and the recorded state.

## 5. The first engineering habit

Before committing, run:

```bash
git status
```

Do not treat Git as a vending machine where you blindly type commands until it stops complaining.

Use each command as a question.

```text
git status  → What changed?
git diff    → What exactly changed?
git log     → What history exists?
```

You are not memorizing commands. You are building an investigation vocabulary.

## 6. Checkpoint

A file shows as modified.

What does that **not** tell you yet?

A. That the file is different from the recorded state.
B. What exact lines changed.
C. That you should inspect the change before recording it.
D. That Git is aware of a difference.

**Review key:** B

**Feedback:** `git status` tells you that something changed. You need another inspection step to understand the actual change.

## 7. Forge takeaway

**Mental model:** Your files and your recorded history are related, but they are not the same thing.

**Senior habit:** Check the state before you act.

### Lesson completion
Explain the difference between the working tree and recorded history in one sentence.

---
# 2.5.3 — Stage a Change, Then Commit It
**Estimated time:** 14 minutes  
**Learner goal:** Understand staging as an explicit choice about what belongs in the next commit, and commits as deliberate saved points in project history.

## 1. The staging step

You changed two files:

```text
src/cart.js
README.md
```

But you only want the cart behavior change in the next saved version.

Git gives you a staging area so you can choose which changes belong together.

A simplified flow is:

```text
working tree
     ↓
choose changes
     ↓
staging area
     ↓
commit
     ↓
recorded history
```

## 2. Stage one file

You can stage one specific file with:

```bash
git add src/cart.js
```

Now the cart change is selected for the next commit.

The README change remains unstaged.

## 3. Predict the result

After staging only `src/cart.js`, which statement is correct?

A. The README change disappeared.
B. The cart change is selected for the next commit; the README change remains outside that commit.
C. Both files are permanently committed.
D. The branch was merged.

**Review key:** B

**Feedback:** Staging is selection. It does not delete other changes or commit anything by itself.

## 4. Inspect the staged idea

A useful habit is:

```bash
git diff
```

for ordinary working-tree differences, and then inspect the staged changes before committing.

Conceptually, ask two questions:

1. **What changed?**
2. **What am I about to record?**

Those questions prevent a surprising number of bad commits.

## 5. Make a focused commit

A commit should describe one coherent change.

Good example:

```text
Fix cart total when quantity changes
```

Weak example:

```text
stuff
```

The goal is not literary beauty. The goal is future clarity.

Six weeks from now, another engineer should be able to understand why that snapshot exists.

## 6. Commit the staged work

After reviewing the staged changes, the conceptual action is:

```bash
git commit -m "Fix cart total when quantity changes"
```

The commit records the staged selection as a new point in project history.

## 7. Split the work

You discover that your working tree contains:

```text
src/cart.js          → fixes quantity calculation
README.md            → rewrites unrelated instructions
notes/debug.txt      → your temporary scratch notes
```

Would you put all three into one commit?

A. Yes. Git works best when commits are large.
B. No. Separate unrelated work so the history tells a clearer story.
C. Only the scratch notes should be committed.
D. Delete the repository.

**Review key:** B

**Feedback:** Focused commits make review, reasoning, and recovery easier.

## 8. Checkpoint

Finish this sentence:

**“Staging answers ________. Committing answers ________.”**

**Suggested answer:** “Staging answers what changes belong in the next commit. Committing answers what version of those selected changes becomes part of history.”

## 9. Forge takeaway

**Mental model:** Staging is selection. A commit is a deliberate saved point.

**Senior habit:** Never commit blindly. Read the change you are about to record.

### Lesson completion
Explain why staging and committing are separate steps.

---
# 2.5.4 — Read the Diff and the History
**Estimated time:** 12 minutes  
**Learner goal:** Use diffs and history to reconstruct what changed and why a project moved from one state to another.

## 1. The diff is your evidence

When a file looks wrong, your first instinct might be to stare at the current version.

A better question is:

> “What changed?”

Git can show you the difference.

A simplified diff might look like this:

```diff
-const total = price * quantity;
+const total = price + quantity;
```

One line changed.

That single difference is a much stronger debugging clue than “the cart total is weird.”

## 2. Prediction

Which line most likely explains the broken total?

A. The removed multiplication line.
B. The added addition line.
C. Neither line; Git does not show meaningful evidence.
D. The branch name.

**Review key:** B

**Feedback:** The added line changes the operation. The diff tells you exactly what changed between versions.

## 3. Read history

A project history can be viewed with:

```bash
git log
```

A simplified history might show:

```text
7a1 Fix cart total
5bd Add cart quantity control
2c4 Build cart summary
```

Now you can ask:

> “Which change introduced the behavior I am investigating?”

## 4. Trace a regression

A feature worked yesterday.

Today it is broken.

History shows:

```text
A  Build feature
B  Add loading state
C  Refactor total calculation
```

The bug first appears after C.

What is the best next move?

A. Blame every file in the project.
B. Inspect what changed in C.
C. Delete the repository.
D. Assume A is broken because it is older.

**Review key:** B

**Feedback:** Start with the earliest known point where the behavior became wrong.

## 5. Compare before guessing

The engineering loop is:

```text
symptom
  ↓
find last known good state
  ↓
compare changes
  ↓
form a hypothesis
  ↓
test the hypothesis
```

That is the same reasoning skill you learned in the earlier debugging curriculum, now applied to project history.

## 6. Checkpoint

Which tool answers which question?

1. “What changed in my files?”
2. “What commits exist?”
3. “Which exact commit might contain the regression?”

A. `git diff` → `git log` → compare history and inspect the relevant commit
B. `git log` → `git status` → delete files
C. `git add` → `git commit` → `git push`
D. `git branch` → `git init` → `git clone`

**Review key:** A

**Feedback:** Use each command as a question, then combine the answers into an investigation.

## 7. Forge takeaway

**Mental model:** Git history is evidence, not decoration.

**Senior habit:** When behavior changed, compare the states instead of relying on memory.

### Lesson completion
Explain how a diff can shorten a debugging investigation.

---
# 2.5.5 — Branches: Isolate One Piece of Work
**Estimated time:** 13 minutes  
**Learner goal:** Understand branches as independent lines of project history that let engineers work on a change without treating the shared main line as their personal scratch space.

## 1. Why branches exist

Imagine five engineers all editing the same main line of history at once.

Every unfinished experiment is now mixed together.

Branches give each piece of work its own line.

Think of them like this:

```text
                 feature/search
                /
main ---------A----------------D
                 \
                  feature/cart
```

The exact internal model is more precise than this drawing, but the useful idea is simple:

**A branch gives a named line of work.**

## 2. Create a branch

A common command is:

```bash
git switch -c feature/cart-summary
```

The important part is not the exact spelling.

The important idea is:

> “I am creating a separate line for this piece of work.”

## 3. Prediction

Why is a branch useful before changing the cart summary?

A. It keeps the work isolated from the main line until you are ready to integrate it.
B. It makes the code run faster.
C. It automatically writes tests.
D. It prevents all future bugs.

**Review key:** A

**Feedback:** A branch creates a safer place for focused work and review.

## 4. Branch names should explain the work

Prefer:

```text
feature/cart-summary
fix/empty-search-state
chore/update-docs
```

over:

```text
test
stuff
new
johns-branch
```

The exact naming convention can vary between teams. The shared principle is clarity.

## 5. Switch back

Suppose you finish your experiment and return to the main line.

```bash
git switch main
```

Now your current working context points at the main branch again.

## 6. A branch is not a hiding place

You create a feature branch and make a terrible change.

Does the branch guarantee the change can never affect anything else?

A. Yes. Branches make code permanently harmless.
B. No. A branch isolates history, but you still have to review and integrate changes carefully.
C. Yes. Git deletes bad code automatically.
D. No because branches are just folders.

**Review key:** B

**Feedback:** Branches create separation. They do not replace engineering judgment.

## 7. Checkpoint

Complete the sentence:

**“A branch is useful because ________.”**

**Suggested answer:** “It gives one piece of work its own line of history so the change can be developed, inspected, and reviewed before it is integrated.”

## 8. Forge takeaway

**Mental model:** Branches isolate work; they do not make work safe by themselves.

**Senior habit:** Name branches after the change you are trying to make.

### Lesson completion
Explain why branch isolation makes collaboration easier.

---
# 2.5.6 — Remotes: Share the Repository
**Estimated time:** 12 minutes  
**Learner goal:** Understand the difference between local history and a shared remote repository, and use clone, push, and pull as deliberate synchronization operations.

## 1. Local is not shared

Your computer can contain Git history without anybody else seeing it.

A **remote** is another copy of the repository history hosted somewhere that collaborators can access.

GitHub is one platform that can host Git repositories and collaboration features.

Keep this distinction clear:

```text
local repository  ↔  remote repository
```

## 2. Clone

When starting from an existing remote repository, a common operation is:

```bash
git clone <repository-address>
```

Conceptually:

> “Give me a local working copy of this repository and its history.”

## 3. Push

You make commits locally.

To publish those commits to a configured remote, you can use:

```bash
git push
```

Think:

**local history → shared remote history**

## 4. Pull

A teammate has pushed new commits.

You need to update your local view.

A common command is:

```bash
git pull
```

For this module, use the simple mental model:

**shared remote history → local repository/working context**

Real Git synchronization has more detail than that model, but the important beginner distinction is direction.

## 5. Prediction

You made a local commit but never pushed it.

Can your teammate see that commit on the shared remote?

A. Yes, immediately.
B. No. The commit exists locally until you publish it to the remote.
C. Only CSS can see it.
D. GitHub rewrites the commit automatically.

**Review key:** B

**Feedback:** Local commits and remote commits are related but distinct until synchronized.

## 6. Push vs pull

Match the intention:

1. “Send my local commits to the shared repository.”
2. “Bring remote changes into my local work.”

A. push → pull
B. pull → push
C. clone → commit
D. status → diff

**Review key:** A

## 7. Do not blindly pull

Before integrating other people's changes, check your current state.

Useful questions:

- Do I have uncommitted work?
- What branch am I on?
- What changed remotely?
- Am I about to combine histories that touch the same files?

The point is not fear.

The point is awareness.

## 8. Forge takeaway

**Mental model:** Local history is yours; the remote is shared history.

**Senior habit:** Know whether a change exists only on your machine or has been published for others.

### Lesson completion
Explain the difference between a local commit and a pushed commit.

---
# 2.5.7 — Pull Requests: Let Other Engineers Read the Change
**Estimated time:** 13 minutes  
**Learner goal:** Understand the purpose of pull requests as a structured place to review and discuss a proposed change before integration.

## 1. Code review is not a ceremony

A pull request is more than a button that says “merge.”

It is a review surface.

A useful pull request should help another engineer answer:

- What changed?
- Why did it change?
- What should I pay attention to?
- How can I verify the behavior?

## 2. A weak pull request

Title:

```text
updates
```

Description:

```text
did some stuff
```

What is missing?

A. Context about the change and how to verify it.
B. More emojis.
C. A longer branch name.
D. A screenshot of the keyboard.

**Review key:** A

**Feedback:** Reviewers need enough context to reason about the proposed change.

## 3. Write a useful pull request

Suppose you fixed a search box that failed when the input was empty.

A clearer title is:

```text
Handle empty search input
```

A useful description might say:

```text
Problem
The search action could run with an empty input.

Change
Skip the request when the input is empty and show the existing empty-state message.

Verify
1. Open the search page.
2. Submit with an empty field.
3. Confirm no request is sent and the empty state is shown.
```

Notice what this does: it turns review from “look at my files” into a shared reasoning task.

## 4. Review the change, not the person

A review comment should point to behavior, maintainability, correctness, or risk.

Better:

> “Could we avoid duplicating this condition? The same rule appears in the branch above.”

Worse:

> “This is bad code.”

Good engineering communication is specific enough to act on.

## 5. Prediction

A pull request changes 14 files but the stated feature should only require 2.

What is the most useful first question?

A. “Why are these other files part of the change?”
B. “How do I approve this quickly?”
C. “Can we make the title all caps?”
D. “Should we delete Git?”

**Review key:** A

**Feedback:** Scope is a review signal. Unexpected changes deserve investigation.

## 6. Checkpoint

A good pull request reduces reviewer guesswork.

Which three pieces of information matter most?

A. Why, what changed, how to verify.
B. Developer age, keyboard brand, favorite editor.
C. Number of commits, line count, branch color.
D. Only the final screenshot.

**Review key:** A

## 7. Forge takeaway

**Mental model:** A pull request is a shared reasoning space for a proposed change.

**Senior habit:** Make the reviewer's job easier by explaining the problem, the change, and the verification path.

### Lesson completion
Write a two-sentence explanation of what a pull request is for.

---
# 2.5.8 — Merge Conflicts: When Two Histories Touch the Same Lines
**Estimated time:** 15 minutes  
**Learner goal:** Understand why merge conflicts happen and resolve a simple conflict by comparing the competing versions rather than choosing blindly.

## 1. Why conflicts exist

Two engineers start from a similar version of a file.

Engineer A changes:

```js
const heading = "Dashboard";
```

to:

```js
const heading = "Account Dashboard";
```

Engineer B changes the same line to:

```js
const heading = "Overview";
```

Now Git cannot safely guess which final line the team wants.

That is a merge conflict.

## 2. Conflict markers

A simplified conflicted file might look like:

```text
<<<<<<< HEAD
const heading = "Account Dashboard";
=======
const heading = "Overview";
>>>>>>> feature/overview-title
```

Do not panic when you see this.

The file is showing you that two versions disagree.

## 3. The right first question

What should you ask before deleting the conflict markers?

A. “Which line is longer?”
B. “What behavior should the final code have?”
C. “Which engineer wrote more commits?”
D. “Can I make both lines random?”

**Review key:** B

**Feedback:** Conflict resolution is an engineering decision, not a contest between authors.

## 4. Resolve by intent

Suppose the product requirement says:

> “The dashboard should use the title Account Dashboard.”

Then the final code should be:

```js
const heading = "Account Dashboard";
```

The conflict markers disappear because you have selected the intended final state.

## 5. Conflicts can be larger

Sometimes both engineers change different parts of a file and Git can combine them automatically.

Sometimes the changes overlap in a way Git cannot safely combine.

The rule stays the same:

**Read both sides, understand the intended final behavior, then produce one correct final version.**

## 6. Prediction

A conflict appears in a file.

What does it mean?

A. Git is broken.
B. Git found competing changes that require a human decision.
C. The repository is permanently corrupted.
D. The code cannot be edited again.

**Review key:** B

**Feedback:** A conflict is a prompt for engineering judgment.

## 7. Checkpoint

List the steps in the safest order:

A. Understand both versions.
B. Remove conflict markers.
C. Decide the intended final code.
D. Verify the result.

**Review key:** A → C → B → D

**Feedback:** Decide what the code should mean before editing the markers away.

## 8. Forge takeaway

**Mental model:** A merge conflict is not a Git failure. It is an unresolved design decision between two versions of history.

**Senior habit:** Resolve the behavior first. Edit the conflict markers second.

### Lesson completion
Explain why blindly choosing “ours” or “theirs” can produce a technically resolved but behaviorally wrong merge.

---
# 2.5.9 — Undo Without Panic
**Estimated time:** 15 minutes  
**Learner goal:** Distinguish common kinds of Git mistakes and choose a recovery strategy based on whether the change is unstaged, staged, committed locally, or already shared.

## 1. Not all mistakes are the same

“Undo this” is not a precise request.

Consider four situations:

1. You edited a file but have not staged it.
2. You staged a file but have not committed it.
3. You committed the change locally.
4. You pushed the commit to a shared remote.

The safest recovery depends on which state you are in.

## 2. State matters

Use this investigation sequence:

```text
git status
   ↓
Did I stage it?
   ↓
Did I commit it?
   ↓
Did I push it?
```

The point is to find the smallest safe intervention.

## 3. Unstaged mistake

You accidentally changed `styles.css` and want to discard the local change.

Before doing anything destructive, confirm what changed.

The important lesson is not a single command.

The lesson is:

> **Do not destroy work before you have identified exactly what state you are in and what you intend to preserve.**

## 4. A committed mistake

You committed a bad change locally.

You have not shared it yet.

What should guide your next decision?

A. The fact that a commit exists means it can never be changed.
B. Whether you need to preserve the history exactly as recorded or create a corrected history before sharing.
C. Whether the commit message has the right emoji.
D. Whether GitHub likes the code.

**Review key:** B

**Feedback:** Local history gives you recovery options. Shared history needs more care because other people may depend on it.

## 5. A shared mistake

A bad commit has already been pushed and teammates may have based work on it.

What principle should dominate?

A. Rewrite shared history immediately without telling anyone.
B. Prefer a recovery strategy that makes the correction understandable to collaborators and avoids silently invalidating their history.
C. Delete the remote repository.
D. Pretend the commit does not exist.

**Review key:** B

**Feedback:** Once history is shared, the impact is social as well as technical.

## 6. The safest habit

When something goes wrong:

**Stop. Inspect. Identify the state. Choose the smallest recovery. Verify.**

That sequence is more valuable than memorizing twenty undo commands.

## 7. Checkpoint

A teammate asks:

> “Can you undo my last change?”

What is the first question you should ask?

A. “Was the change pushed already?”
B. “What operating system are you using?”
C. “Which color is the branch?”
D. “Did you use tabs?”

**Review key:** A

**Feedback:** Shared vs local history changes what recovery strategy is safe.

## 8. Forge takeaway

**Mental model:** Git recovery is state-dependent.

**Senior habit:** Never run a destructive command just because you remember the command. First identify the state you are trying to change.

### Lesson completion
Explain why “undo” is not one Git operation.

---
# 2.5.10 — Forge Mission: Ship a Small Change Safely
**Estimated time:** 20 minutes  
**Learner goal:** Integrate the module by creating a focused branch, making a small change, reviewing the diff, committing it clearly, synchronizing it, writing a useful pull request, and resolving a simple conflict by intent.

## 1. The mission

You are working on a small frontend project.

The request is:

> “Add a compact status message to the profile page. Keep the existing behavior. Make the change easy for another engineer to review.”

You are given this starting state:

```text
main
  src/profile.js
  src/profile.html
  styles.css
```

Your task is not merely to make the text appear.

Your task is to **ship the change safely**.

## 2. Step 1 — Start from a known state

What should you inspect first?

A. Current branch and working-tree state.
B. Random files in the project.
C. The remote repository password.
D. The oldest commit in history.

**Review key:** A

**Hint 1:** What are you currently working on?
**Hint 2:** Start with repository state.
**Hint 3:** Think `git status` and the current branch.

## 3. Step 2 — Isolate the work

Create a branch named something like:

```text
feature/profile-status
```

Why?

Because the status-message work should have its own history and be reviewable as one focused change.

## 4. Step 3 — Make the smallest useful change

The HTML already contains:

```html
<section>
  <h1>Profile</h1>
</section>
```

Add a short status message:

```html
<section>
  <h1>Profile</h1>
  <p>Your profile is up to date.</p>
</section>
```

Do not refactor unrelated files.

## 5. Step 4 — Inspect the change

Before staging anything, inspect the state and the diff.

What are you looking for?

A. Whether the change matches the request and whether unrelated files changed.
B. Whether the branch name is funny.
C. Whether Git can guess your intent.
D. Whether the project has enough comments.

**Review key:** A

## 6. Step 5 — Stage deliberately

Stage only the file that belongs to this feature.

Then inspect what is staged.

**Evidence target:** You should be able to point to the exact change that will become part of the commit.

## 7. Step 6 — Commit with meaning

Create a focused commit with a message that tells the future reader what changed.

A reasonable message is:

```text
Add profile status message
```

Avoid:

```text
update
```

The commit message is part of the project's memory.

## 8. Step 7 — Publish the branch

Push the branch to the shared remote.

Conceptually:

```text
local branch
     ↓
published branch
     ↓
pull request
```

## 9. Step 8 — Write the pull request

Use this structure:

```text
Problem
The profile page did not communicate the current profile status.

Change
Added a short status message below the profile heading.

Verify
Open the profile page and confirm the message appears without changing existing behavior.
```

## 10. Step 9 — Review a conflict

A teammate changed the same paragraph in their branch.

The merge now reports a conflict.

Their version says:

```html
<p>Your profile is complete.</p>
```

Your version says:

```html
<p>Your profile is up to date.</p>
```

Product wording says:

> “Use the phrase ‘up to date’.”

What should the final version contain?

A. Whichever version was committed first.
B. The wording required by the product decision: “Your profile is up to date.”
C. Both paragraphs.
D. Delete the section.

**Review key:** B

**Feedback:** The correct resolution comes from intended behavior, not from winning the conflict mechanically.

## 11. Final engineering explanation

Explain the entire workflow in your own words.

A strong answer should contain these ideas:

**1.** Start from a known repository state.

**2.** Create a focused branch.

**3.** Make only the requested change.

**4.** Inspect the diff.

**5.** Stage only what belongs to the change.

**6.** Commit with a clear message.

**7.** Push the branch.

**8.** Open a pull request with context and verification steps.

**9.** If a conflict appears, resolve it by understanding the intended final behavior.

**10.** Verify the resulting change before integration.

## 12. Transfer challenge

A teammate says:

> “I usually just edit files on main, and if something breaks I make another copy of the folder.”

Write a response that explains the engineering advantage of the Git workflow without insulting the teammate.

**Reference answer:**

> “The main advantage is not that Git makes mistakes impossible. It gives us a structured history so we can see what changed, isolate work on branches, review a proposed change, and recover from mistakes with more information. Folder copies can preserve files, but they do not give us the same shared history or review workflow.”

## 13. Module mastery gate

You are ready to leave Module 2.5 when you can do these without copying the sequence:

**Explain:** What Git records and why history matters.

**Inspect:** Use state, diff, and history information to understand a change.

**Structure:** Use branches and focused commits to isolate work.

**Collaborate:** Explain local vs remote history and use a pull request as a review surface.

**Recover:** Identify whether a mistake is local or shared before choosing an undo strategy.

**Resolve:** Handle a simple merge conflict by intended behavior rather than by guesswork.

## 14. Forge takeaway

**Git is not a ritual. It is a safety system.**

The mature workflow is not:

> edit → panic → type commands

It is:

> inspect → isolate → change → compare → record → share → review → integrate → verify

That is the beginning of professional engineering workflow.

### Lesson completion
Complete the mission and give the final engineering explanation in your own words. The mastery signal is not whether you memorized commands; it is whether you can choose the right Git action from the state of the work.
