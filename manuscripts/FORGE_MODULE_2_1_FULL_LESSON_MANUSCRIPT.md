# Forge Curriculum v2
## Module 2.1 — JavaScript: The Language of Behavior
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing manuscript for review. It is written as the lesson itself, with answer keys and hints included only for review before conversion to Forge JSON.

## Module outcome
By the end of this module, the learner can read JavaScript as a sequence of values and transformations, predict outcomes, write small functions, work with arrays and objects, trace decisions and loops, and repair a small program without guessing.

**Deliberate boundary:** This module teaches JavaScript as a language. DOM manipulation, browser events, network requests, TypeScript, Git, and framework behavior are intentionally not used as prerequisites here.

---
# 2.1.1 — JavaScript Gives Instructions a Shape
**Estimated time:** 10 minutes  
**Learner goal:** Understand that JavaScript programs are built from values and expressions that produce results.

## Start here

A programming language gives you a way to describe work precisely. In JavaScript, that work is built from small pieces. Some pieces are values. Some pieces are expressions that produce values.

For now, ignore browsers and buttons. JavaScript can be studied as a language on its own. Today we are learning to read the language before we try to make large programs.

## 1. What is a value?

A value is a piece of information a program can work with.

Examples:

```js
42
"Forge"
true
````

The number 42 is a value. The text "Forge" is a value. `true` is a value.

## 2. Prediction

What value does this expression produce?

```js
2 + 3
```

A. `23`
B. `5`
C. `2 + 3`
D. `true`

**Review key:** B

**Feedback:** The `+` operator combines the two numbers, producing the number `5`.

## 3. Expressions do work

An **expression** is code that produces a value.

```js
10
10 + 5
5 > 2
```

The first expression produces `10`. The second produces `15`. The third produces `true`.

This gives us a useful reading habit: when you see an expression, ask, **"What value comes out?"**

## 4. Compare without running

Predict the result before checking it:

```js
7 * 2
```

A. `9`
B. `12`
C. `14`
D. `72`

**Review key:** C

**Feedback:** Multiplication gives `14`. Prediction first; execution second.

## 5. Change one piece

Start with:

```js
10 + 5
```

Change only `5` to `8`. What should the expression produce now?

**Answer:** `18`.

The point is not arithmetic speed. The point is seeing that changing one input changes the resulting value.

## 6. Checkpoint

Which sentence best describes an expression?

A. It is any file in a project.
B. It is code that produces a value.
C. It is only a function.
D. It is only text inside quotes.

**Review key:** B

**Feedback:** Functions can contain expressions, but an expression is the smaller idea: code that produces a value.

## Forge takeaway

**Mental model:** Read JavaScript from the inside out: identify the values, then ask what each expression produces.

**Senior habit:** Before changing code, predict what the existing expression produces. If you cannot predict it, slow down before editing.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
# 2.1.2 — Variables: Give Values a Name
**Estimated time:** 11 minutes  
**Learner goal:** Use variables to name values and understand assignment as storing a value for later use.

## Start here

A value is useful once. A named value can be reused.

JavaScript lets us give values names with `const` and `let`.

## 1. const

```js
const score = 10;
```

Read this as: create a name called `score` and give it the value `10`.

```js
const score = 10;
const nextScore = score + 5;
```

`nextScore` becomes `15`.

## 2. Prediction

What is the value of `total`?

```js
const price = 8;
const total = price + 2;
```

A. `8`
B. `2`
C. `10`
D. `82`

**Review key:** C

## 3. let

Sometimes a name needs a new value later.

```js
let count = 1;
count = 2;
```

The first line gives `count` the value `1`. The second line assigns a new value, `2`, to the existing name.

Prefer `const` when the name does not need to be reassigned. Use `let` when reassignment is part of the job.

## 4. What changes?

What is `count` after this code?

```js
let count = 3;
count = count + 2;
```

A. `3`
B. `5`
C. `6`
D. `32`

**Review key:** B

**Feedback:** The old value is `3`; `3 + 2` produces `5`, and that value is assigned back to `count`.

## 5. Build

Write code that creates:

- a constant named `name` containing `"Maya"`
- a constant named `greeting` containing `"Hello, "` plus `name`

One valid answer:

```js
const name = "Maya";
const greeting = "Hello, " + name;
```

## 6. Checkpoint

Which is the best reason to give a value a name?

A. It makes the value reusable and gives the code a readable label.
B. It makes the value invisible.
C. It automatically saves the value forever.
D. It changes a number into text.

**Review key:** A

## Forge takeaway

**Mental model:** A variable is a named place in your program's reasoning.

**Senior habit:** Good names reduce the amount of guessing required to read code.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
# 2.1.3 — Types: Values Behave Differently
**Estimated time:** 12 minutes  
**Learner goal:** Recognize common JavaScript value types and predict how operations differ by type.

## Start here

Not all values behave the same way. A number, a string, a boolean, and an empty-value marker each mean different things.

## 1. Four types

For this lesson, know these four:

```js
42          // number
"42"       // string
true        // boolean
null        // intentional absence of a value
```

The quotes matter. `42` is a number; `"42"` is text.

## 2. Prediction

What is the result of this expression?

```js
"4" + "2"
```

A. `6`
B. `"42"`
C. `"6"`
D. `true`

**Review key:** B

**Feedback:** Both operands are strings, so `+` joins them into the string `"42"`.

## 3. Compare values

```js
5 === 5
5 === "5"
```

The first expression is `true`. The second is `false` because the values are not the same type and value.

For Forge, use `===` when you mean **strict equality**: same value and same type.

## 4. Boolean thinking

Booleans have two values: `true` and `false`. They are useful when the program needs to answer a yes/no question.

```js
const hasPaid = true;
```

That name is easy to reason about because the value answers a question.

## 5. Change the type

Predict both results:

```js
10 + 5
"10" + 5
```

**Answers:** `15` and `"105"`.

The operator is the same. The values are different. The type changes the result.

## 6. Checkpoint

Which statement is correct?

A. `"5"` and `5` are the same JavaScript value.
B. Values can have different types, and those types affect how operations behave.
C. Booleans can contain any text.
D. `null` means the number zero.

**Review key:** B

## Forge takeaway

**Mental model:** Ask two questions: **What value is this? What type is it?**

**Senior habit:** Many JavaScript bugs become easier once you stop looking only at the spelling of a value and start checking what kind of value it is.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
# 2.1.4 — Decisions: Let the Program Choose
**Estimated time:** 12 minutes  
**Learner goal:** Use comparisons and `if`/`else` to represent decisions in a program.

## Start here

Programs often need to choose between paths. A decision starts with a condition that can be true or false.

## 1. A condition

```js
8 > 3
```

This expression produces `true`, so it can be used as a condition.

## 2. if

```js
const age = 20;

if (age >= 18) {
  "Adult";
}
```

If the condition is true, the code inside the braces is used. If it is false, it is skipped.

## 3. Prediction

What value does the condition produce?

```js
4 === 4
```

A. `true`
B. `false`
C. `4`
D. `"true"`

**Review key:** A

## 4. if / else

```js
const score = 7;

if (score >= 10) {
  "Pass";
} else {
  "Keep going";
}
```

Only one branch is chosen. The condition controls which path is taken.

## 5. Build

Write an `if / else` that uses `temperature`:

- if `temperature` is greater than `30`, use `"Hot"`
- otherwise, use `"Not hot"`

One valid answer:

```js
if (temperature > 30) {
  "Hot";
} else {
  "Not hot";
}
```

## 6. Checkpoint

What is the job of the condition?

A. It stores every possible answer.
B. It decides which branch should run.
C. It always changes a number.
D. It repeats the program forever.

**Review key:** B

## Forge takeaway

**Mental model:** A condition asks a question. The branch answers what the program should do for each result.

**Senior habit:** When reading conditional code, state the question in plain English before you trace the branch.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
# 2.1.5 — Repetition: Let the Program Do the Same Work Again
**Estimated time:** 12 minutes  
**Learner goal:** Use loops to repeat work and reason about loop start, condition, and change.

## Start here

Repetition is another basic programming idea. Instead of writing the same instruction many times, a loop describes a repeated job.

## 1. for loop

```js
for (let i = 0; i < 3; i++) {
  i;
}
```

Read the three parts as:

- start `i` at `0`
- continue while `i < 3`
- increase `i` by `1` after each round

## 2. Predict the rounds

How many times does the loop body run?

```js
for (let i = 0; i < 4; i++) {
  i;
}
```

A. 3
B. 4
C. 5
D. Forever

**Review key:** B

## 3. Observe the values

The body sees these values in order:

`0 → 1 → 2 → 3`

After `3`, the next value would be `4`, and `4 < 4` is false, so the loop stops.

## 4. Build

Change the loop so the body runs exactly **3** times starting from `1`.

One valid answer:

```js
for (let i = 1; i <= 3; i++) {
  i;
}
```

## 5. The dangerous loop

What is wrong here?

```js
let i = 0;
while (i < 3) {
  i;
}
```

The condition starts true, but the value never changes, so the condition never becomes false. That is an infinite loop.

## 6. Checkpoint

What three ideas should you inspect first when a loop behaves strangely?

A. Start value, condition, and change.
B. File name, font, and color.
C. Only the last line.
D. The keyboard.

**Review key:** A

## Forge takeaway

**Mental model:** A loop needs a path toward stopping.

**Senior habit:** When a loop is wrong, trace one iteration at a time and ask what changes before the next check.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
# 2.1.6 — Functions: Name a Job
**Estimated time:** 13 minutes  
**Learner goal:** Define and call functions, pass arguments, and use return values to package reusable behavior.

## Start here

When a piece of work has a useful name, we can package it as a function. A function is a reusable unit of behavior.

## 1. Define and call

```js
function add(a, b) {
  return a + b;
}

const result = add(2, 3);
```

`add` is the function name. `a` and `b` are parameters. `add(2, 3)` calls the function with arguments `2` and `3`. The function returns `5`.

## 2. Prediction

What is the value of `result`?

```js
function double(value) {
  return value * 2;
}

const result = double(4);
```

A. `4`
B. `6`
C. `8`
D. `44`

**Review key:** C

## 3. return

`return` sends a value back to the code that called the function.

```js
function greet(name) {
  return "Hello, " + name;
}

const message = greet("Maya");
```

The function returns `"Hello, Maya"`, so `message` receives that value.

## 4. Build

Create a function named `square` that takes a number and returns that number multiplied by itself.

One valid answer:

```js
function square(number) {
  return number * number;
}
```

## 5. Explain the call

Read this from the inside out:

```js
const total = add(5, 2);
```

First, `add(5, 2)` runs. Then its returned value becomes the value stored in `total`.

## 6. Checkpoint

Why is a function useful?

A. It gives a reusable piece of behavior a name and lets it accept inputs and return a result.
B. It prevents all bugs.
C. It replaces every variable.
D. It automatically makes code run faster.

**Review key:** A

## Forge takeaway

**Mental model:** A function is a named job: give it inputs, run its steps, receive a result.

**Senior habit:** Name functions after the job they perform, not the line of code they happen to contain.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
# 2.1.7 — Arrays: Work With Ordered Values
**Estimated time:** 12 minutes  
**Learner goal:** Create arrays, access items by index, and use simple iteration over ordered collections.

## Start here

Sometimes the program needs more than one related value. An array stores values in an ordered list.

## 1. Create an array

```js
const colors = ["red", "blue", "green"];
```

The values have positions called indexes. JavaScript starts counting from `0` here, so:

- index `0` → `"red"`
- index `1` → `"blue"`
- index `2` → `"green"`

## 2. Prediction

What is `colors[1]`?

A. `"red"`
B. `"blue"`
C. `"green"`
D. `1`

**Review key:** B

## 3. Change one access

What is `colors[2]`?

**Answer:** `"green"`.

The index selects a position; it does not mean "give me the second value" in a human-counting sense. The first position is index `0`.

## 4. Iterate

```js
const scores = [10, 20, 30];

for (const score of scores) {
  score;
}
```

This repeats once for each value in the array. The loop receives `10`, then `20`, then `30`.

## 5. Build

Create an array named `tools` containing three strings: `"HTML"`, `"CSS"`, and `"JavaScript"`.

One valid answer:

```js
const tools = ["HTML", "CSS", "JavaScript"];
```

## 6. Checkpoint

Which statement is correct?

A. Array indexes start at `1`.
B. Arrays preserve an order, and each value can be reached by its index.
C. Arrays can only store numbers.
D. Every array contains exactly ten values.

**Review key:** B

## Forge takeaway

**Mental model:** An array is an ordered collection.

**Senior habit:** When reasoning about an array, write down the positions and values before changing the loop that uses them.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
# 2.1.8 — Objects: Describe a Thing With Named Data
**Estimated time:** 13 minutes  
**Learner goal:** Create objects, read properties, update values, and understand objects as named collections of related data.

## Start here

An array is useful when order matters. An object is useful when the data has named properties.

## 1. Create an object

```js
const user = {
  name: "Maya",
  age: 24
};
```

The object has two properties: `name` and `age`.

## 2. Read a property

```js
user.name
```

This produces `"Maya"`.

You can also use bracket notation:

```js
user["age"]
```

This produces `24`.

## 3. Prediction

What is `user.age + 1`?

A. `24`
B. `25`
C. `241`
D. `"age1"`

**Review key:** B

## 4. Update

Objects can hold changing data:

```js
user.age = 25;
```

After this line, `user.age` is `25`.

## 5. Build

Create an object named `book` with:

- `title`: `"The Long Way"`
- `pages`: `320`

Then read the title property.

One valid answer:

```js
const book = {
  title: "The Long Way",
  pages: 320
};

book.title;
```

## 6. Checkpoint

When is an object more useful than an array?

A. When the data is best understood through named properties.
B. When the values must always be in numerical order.
C. When there can only be one value.
D. When no names are allowed.

**Review key:** A

## Forge takeaway

**Mental model:** Arrays answer "which position?" Objects answer "which named property?"

**Senior habit:** Choose a data shape that makes the intended meaning obvious to the next person reading the code.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
# 2.1.9 — Scope and Composition: Keep the Work Understandable
**Estimated time:** 14 minutes  
**Learner goal:** Understand local scope, combine functions and data, and reason about how values move through a small program.

## Start here

As programs grow, names need boundaries. Scope answers a simple question: **Where can this name be used?**

## 1. Local scope

```js
function createLabel() {
  const text = "Ready";
  return text;
}
```

The name `text` exists inside the function. Code outside the function cannot use that local name directly.

## 2. Prediction

What happens here?

```js
function makeMessage() {
  const message = "Hello";
  return message;
}

const result = makeMessage();
```

A. `result` becomes `"Hello"`
B. `result` becomes the name `message`
C. The function cannot return a value
D. `message` becomes global automatically

**Review key:** A

## 3. Composition

Functions become more powerful when one function can use another function's result:

```js
function double(value) {
  return value * 2;
}

function addOne(value) {
  return value + 1;
}

const result = addOne(double(3));
```

Read inside out: `double(3)` → `6`; then `addOne(6)` → `7`.

**Result:** `7`.

## 4. Build

Write two small functions:

- `double` returns a number multiplied by `2`
- `addOne` returns a number plus `1`

Then compose them so `3` becomes `7`.

One valid solution:

```js
function double(value) {
  return value * 2;
}

function addOne(value) {
  return value + 1;
}

const result = addOne(double(3));
```

## 5. Why boundaries help

A small function with a clear input and output is easier to reason about than one giant block of instructions. Scope keeps temporary names close to the work that uses them.

## 6. Checkpoint

What is one benefit of local scope and small functions?

A. They make all programs shorter automatically.
B. They limit where names are used and make individual jobs easier to reason about.
C. They remove the need for variables.
D. They prevent every runtime error.

**Review key:** B

## Forge takeaway

**Mental model:** Good programs are built from small named pieces whose inputs, outputs, and names have clear boundaries.

**Senior habit:** When a function becomes difficult to explain in one sentence, look for a smaller job hiding inside it.

### Lesson completion
Complete the checkpoint and explain the mechanism in your own words. A wrong first prediction is expected; the mastery signal is whether you can explain the result and handle a changed case after feedback.

---
# 2.1.10 — Forge Mission: Read, Predict, Repair
**Estimated time:** 18 minutes  
**Learner goal:** Integrate the module by predicting JavaScript behavior, tracing values, identifying the first incorrect step, and repairing a small program.

## Mission briefing

A teammate left you a tiny data-processing program. It should calculate the final score from a list of scores, then classify the result.

Do not run it immediately. Read it first. Your job is to predict, trace, then repair.

## 1. Read the program

```js
const scores = [10, 20, 30];

function total(items) {
  let sum = 0;

  for (const item of items) {
    sum = item;
  }

  return sum;
}

function classify(score) {
  if (score >= 50) {
    return "pass";
  } else {
    return "keep going";
  }
}

const finalScore = total(scores);
const result = classify(finalScore);
```

## 2. Predict before running

What does `sum` become as the loop moves through `[10, 20, 30]`?

A. `0 → 10 → 30 → 60`
B. `0 → 10 → 20 → 30`
C. `10 → 20 → 30`
D. `0 → 30 → 60 → 90`

**Review key:** B

**Feedback:** The assignment `sum = item` replaces the previous total on every round. It does not add to the existing value.

## 3. Find the first wrong step

The intended job is to total all scores. Which line is the first line that breaks that job?

A. `let sum = 0;`
B. `for (const item of items) {`
C. `sum = item;`
D. `return sum;`

**Review key:** C

## 4. Repair

Change the broken line so each score contributes to the running total.

One valid repair:

```js
sum = sum + item;
```

Now trace the values again:

`0 → 10 → 30 → 60`.

So `finalScore` becomes `60`.

## 5. Predict the next step

Given `finalScore = 60`, what does `classify(finalScore)` return?

A. `"pass"`
B. `"keep going"`
C. `60`
D. `true`

**Review key:** A

**Feedback:** `60 >= 50` is true, so the first branch returns `"pass"`.

## 6. Explain the repair

Complete this explanation:

"The bug was not in the loop itself. The problem was that ________. I changed it to ________, which means ________."

**Suggested answer:** "The problem was that each iteration replaced the running total. I changed it to `sum = sum + item`, which means each new value is added to the previous total."

## 7. Transfer

Now change the data without changing the functions:

```js
const scores = [5, 15, 25, 20];
```

Predict `finalScore` and `result`.

**Answer:** `65` and `"pass"`.

The code structure stays the same. Only the input data changed. That is transfer: the reasoning survives a new case.

## 8. Module mastery gate

You are ready to leave Module 2.1 when you can do all three without copying the reference answer:

**1. Predict:** Given a small JavaScript snippet, state the value an expression or variable will produce.

**2. Trace:** Follow how a value changes through a condition, loop, function, array, or object.

**3. Repair:** Find the first line that violates the intended behavior and explain why the repair works.

**Final reflection:** Which JavaScript behavior is easiest for you to predict now, and which still requires you to slow down?

## Forge takeaway

**The goal of JavaScript fundamentals is not memorizing syntax.** It is learning to reason about values moving through instructions.

**Senior habit:** Predict first. Trace second. Change the smallest thing that restores the intended behavior.

### Lesson completion
Complete the mission without copying the reference repair. The lesson is complete when the learner can predict the faulty behavior, identify the first incorrect step, repair it, and transfer the reasoning to changed input data.
