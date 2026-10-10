# Forge Curriculum v2
## Module 2.3 — TypeScript: Make Intent Explicit
### Full Lesson Manuscript

> **Purpose:** This is the actual learner-facing lesson manuscript for review. It is written to be read from top to bottom as the lesson experience. Review keys and hints are included so the manuscript can be checked before it is converted into Forge lesson JSON.

## Module outcome
By the end of this module, the learner can use TypeScript to make the intended shape of values explicit, let inference do useful work, type functions and object data, represent alternatives with unions, narrow safely before using a value, and write simple generic helpers that preserve relationships between input and output.

## Module lessons
1. **Why TypeScript Exists** — types as information and the type-checking workflow
2. **Inference Before Annotation** — let TypeScript infer obvious types
3. **Functions: Make Inputs and Outputs Explicit** — parameters and return types
4. **Objects and Named Shapes** — type aliases, interfaces, and structural typing
5. **Unions: More Than One Valid Possibility** — union and literal types
6. **Narrowing: Prove What You Have** — safe handling of unions
7. **Generics: Preserve the Relationship** — reusable typed functions
8. **Forge Mission: Make Intent Explicit** — convert and repair a small JavaScript program

---
# 2.3.1 — Why TypeScript Exists
**Estimated time:** 12 minutes  
**Learner goal:** Understand the problem TypeScript solves: making assumptions about values visible to a checker before the program runs.

## 1. JavaScript can let a wrong value travel a long way

Imagine this JavaScript:

```js
function doubleScore(score) {
  return score * 2;
}

const score = "42";
console.log(doubleScore(score));
```

A reader might intend `score` to be a number. The code itself does not say that clearly.

TypeScript gives us a way to describe that intent:

```ts
function doubleScore(score: number) {
  return score * 2;
}
```

Now the function says, in the code itself, **this function expects a number**.

TypeScript can check calls against that description before the program runs.

## 2. Prediction

What should TypeScript object to here?

```ts
function greet(name: string) {
  return `Hello, ${name}`;
}

greet("Ada");
greet(42);
```

A. Both calls are valid.
B. Only the first call matches the declared parameter type.
C. Only the second call matches the declared parameter type.
D. TypeScript ignores function parameters.

**Review key:** B

**Feedback:** The function says `name` is a `string`. Passing `"Ada"` matches. Passing `42` does not.

## 3. TypeScript is a feedback system

For this course, use this simple model:

**You write code → TypeScript checks your assumptions → you fix mismatches → JavaScript can run later.**

The type checker is not predicting every runtime failure. It is checking a particular class of mistakes: whether the code's stated and inferred types fit together.

That distinction matters.

A type error is not the same thing as a runtime error. A program can pass type checking and still contain a logic bug. A program can also fail type checking because your code makes an assumption that the type system cannot prove is safe.

## 4. Change one assumption

Start with:

```ts
function add(a: number, b: number) {
  return a + b;
}
```

Change only the call:

```ts
add(10, 20);
```

to:

```ts
add(10, "20");
```

What changed?

A. The function stopped being a function.
B. The function's parameter contract stayed the same, but the caller stopped matching it.
C. TypeScript automatically changed `"20"` into a number and changed the function type.
D. The return type became `string` automatically.

**Review key:** B

**Feedback:** The function still expects two numbers. The caller supplied a number and a string, so the call no longer matches the function's contract.

## 5. Why the extra information matters

Compare these two lines:

```ts
const total = 125;
```

and

```ts
const total: number = 125;
```

Both communicate that `total` is a number. TypeScript can often discover the first one without an annotation.

That leads to an important habit for this module:

**Do not add type syntax just because you can. Add it when it communicates useful intent or when the checker needs help.**

## 6. Checkpoint

Which statement best describes TypeScript's role?

A. It replaces JavaScript completely and runs by itself.
B. It lets you describe and check assumptions about values and program structure before runtime.
C. It guarantees that a program has no bugs.
D. It is only a formatting system for code.

**Review key:** B

**Feedback:** TypeScript improves the information available during development. It does not prove the program is correct in every way.

## 7. Forge takeaway

**Mental model:** Types are information about what values are supposed to be.

**Senior habit:** Treat type errors as evidence about an assumption in your code, not as insults from the compiler.

### Lesson completion
Complete the checkpoint and explain, in your own words, what problem TypeScript is solving.

---
# 2.3.2 — Inference Before Annotation
**Estimated time:** 13 minutes  
**Learner goal:** Understand type inference and choose when an explicit annotation adds useful information.

## 1. TypeScript often knows already

Consider:

```ts
const username = "Ada";
const age = 36;
const isActive = true;
```

TypeScript can infer useful types from the values assigned there:

- `username` → `string`
- `age` → `number`
- `isActive` → `boolean`

You do not have to write all three annotations by hand.

## 2. Prediction

What type does TypeScript infer for `count`?

```ts
let count = 3;
```

A. `string`
B. `boolean`
C. `number`
D. `any`

**Review key:** C

**Feedback:** The initializer `3` gives TypeScript enough information to infer `number`.

## 3. Change the initializer

Now compare:

```ts
let count = 3;
count = 4;
```

and:

```ts
let count = 3;
count = "four";
```

What should the second version reveal?

A. `count` was inferred as a number, so assigning a string conflicts with that type.
B. TypeScript changes the variable to `string` automatically.
C. `count` can become any type after the first assignment.
D. The number `3` is ignored because the variable uses `let`.

**Review key:** A

**Feedback:** `let` means the value can change. It does not mean the variable's type becomes anything you assign later.

## 4. A place where annotation helps

Inference is useful, but annotations can make intent clearer at boundaries.

```ts
let port: number;

port = 3000;
```

The annotation communicates the expectation before the value is assigned.

Another example:

```ts
function printCount(count: number) {
  console.log(count);
}
```

The function parameter has no initializer, so an explicit annotation tells the checker what callers are allowed to provide.

## 5. Choose the smallest useful annotation

Which version is more useful when the type is already obvious?

A.

```ts
const name: string = "Ada";
```

B.

```ts
const name = "Ada";
```

C.

```ts
const name: any = "Ada";
```

D.

```ts
const name: unknown = "Ada";
```

**Review key:** B

**Feedback:** When the initializer already makes the type obvious, inference keeps the code cleaner without losing the type information.

## 6. A useful warning about `any`

TypeScript also has a type called `any`.

`any` tells the checker to stop enforcing normal type checks for that value. That can be useful in a narrow situation, but it can also erase the very information you introduced TypeScript to preserve.

Think of it as a door marked:

**“I am choosing not to have the type checker help me here.”**

That is a deliberate decision, not a default escape hatch.

## 7. Checkpoint

Which rule is the best default?

A. Annotate every variable, even when the value already makes the type obvious.
B. Never use annotations.
C. Prefer inference when the type is obvious; add annotations where they communicate a useful boundary or expectation.
D. Use `any` whenever a type error appears.

**Review key:** C

**Feedback:** Good TypeScript is not maximum syntax. It is useful information at the right places.

## 8. Forge takeaway

**Mental model:** Inference handles the obvious. Annotations explain the important boundaries.

**Senior habit:** Before adding a type annotation, ask, “What information does this add that the checker does not already know?”

### Lesson completion
Explain why this is usually enough:

```ts
const total = 125;
```

and give one situation where an explicit annotation would add useful intent.

---
# 2.3.3 — Functions: Make Inputs and Outputs Explicit
**Estimated time:** 14 minutes  
**Learner goal:** Type function parameters and return values, and use function types to make contracts clear.

## 1. Functions are boundaries

In JavaScript, a function accepts values and produces a result.

TypeScript can describe both sides.

```ts
function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
```

Read that as:

**number in → string out**

The parameter annotation describes the input. The return annotation describes the output.

## 2. Prediction

What should TypeScript reject?

```ts
function square(value: number): number {
  return value * value;
}

square(4);
square("4");
```

A. Nothing.
B. The first call.
C. The second call.
D. Only the return statement.

**Review key:** C

**Feedback:** The function expects a number. The first call supplies one; the second supplies a string.

## 3. What about the return type?

Consider:

```ts
function getGreeting(name: string): number {
  return `Hello ${name}`;
}
```

What mismatch should TypeScript report?

A. The parameter is wrong.
B. The function returns a string even though the declared return type is number.
C. The name is too short.
D. Nothing is wrong because strings and numbers are interchangeable.

**Review key:** B

**Feedback:** The declared contract says the function returns a number. The actual return expression is a string.

## 4. When inference handles the return type

You can also write:

```ts
function double(value: number) {
  return value * 2;
}
```

The parameter needs a type because there is no initializer telling TypeScript what callers should pass.

The return type can be inferred from the function body.

That gives us another practical rule:

**Annotate where the boundary needs a clear contract. Let inference handle obvious internal facts.**

## 5. Function values have types too

A function can be stored in a variable:

```ts
const add = (a: number, b: number): number => {
  return a + b;
};
```

The variable now refers to a function with a known input/output shape.

You can also name that shape:

```ts
type Calculator = (a: number, b: number) => number;

const add: Calculator = (a, b) => a + b;
```

We will use named object shapes in the next lesson. For now, notice the core idea: **a function itself can have a type.**

## 6. Repair the function

This function is supposed to convert minutes into seconds:

```ts
function toSeconds(minutes: number): number {
  return `${minutes * 60}`;
}
```

What is wrong?

A. The parameter should be a string.
B. The return expression produces a string while the function promises a number.
C. The function needs an object.
D. Nothing is wrong.

**Review key:** B

**Feedback:** The calculation produces a number, but the template literal converts it into a string. Return `minutes * 60` directly.

## 7. Checkpoint

Complete this sentence:

“A function parameter type tells me ________. A return type tells me ________.”

**Suggested answer:** “what values the function accepts” and “what kind of value the function produces.”

## 8. Forge takeaway

**Mental model:** A function is a typed boundary: values go in, a value comes out.

**Senior habit:** Make important function boundaries obvious. That is where type information pays for itself repeatedly.

### Lesson completion
Write a typed function `isAdult(age)` that accepts a number and returns a boolean.

**Target:**

```ts
function isAdult(age: number): boolean {
  return age >= 18;
}
```

---
# 2.3.4 — Objects and Named Shapes
**Estimated time:** 15 minutes  
**Learner goal:** Describe object data with named shapes and understand structural typing at a practical level.

## 1. Objects carry structure

JavaScript objects are collections of named values:

```ts
const user = {
  id: 17,
  name: "Ada",
  active: true
};
```

TypeScript can describe that shape directly:

```ts
type User = {
  id: number;
  name: string;
  active: boolean;
};
```

Now we can say:

```ts
const user: User = {
  id: 17,
  name: "Ada",
  active: true
};
```

The named type is a reusable description of the object's expected shape.

## 2. Missing information is a signal

Which object breaks the `User` type?

A.

```ts
{ id: 1, name: "Ada", active: true }
```

B.

```ts
{ id: 1, name: "Ada" }
```

C.

```ts
{ id: 1, name: "Ada", active: false }
```

D.

```ts
{ id: 99, name: "Grace", active: true }
```

**Review key:** B

**Feedback:** `active` is required by the `User` type, so the second object is incomplete.

## 3. Interfaces name object contracts too

Another common way to describe an object shape is an interface:

```ts
interface User {
  id: number;
  name: string;
  active: boolean;
}
```

For the everyday problems in this module, do not get stuck on a fake rule that says “type is always better” or “interface is always better.” Both can describe object contracts.

The important skill is being able to read and create the shape.

## 4. Structural typing

TypeScript checks the structure of values.

Consider:

```ts
type User = {
  id: number;
  name: string;
};

const employee = {
  id: 7,
  name: "Grace",
  department: "Research"
};
```

A function that needs a `User` can accept `employee` because `employee` contains at least the required `id` and `name` properties with the right types.

You can think of this as:

**“Does this value have the shape I need?”**

rather than:

**“Was this value created from the exact same named type?”**

## 5. Prediction

Given:

```ts
type Point = {
  x: number;
  y: number;
};

const point = { x: 10, y: 20, label: "origin-ish" };

function distanceFromOrigin(p: Point) {
  return Math.sqrt(p.x ** 2 + p.y ** 2);
}
```

What should happen with:

```ts
distanceFromOrigin(point);
```

A. It must fail because `point` has an extra property.
B. It can be accepted because it contains the required `x` and `y` structure.
C. It fails because `label` is a string.
D. TypeScript ignores object properties.

**Review key:** B

**Feedback:** The function needs `x` and `y`. The extra `label` property does not remove the required structure.

## 6. Repair the shape

This function needs a product with an id and price:

```ts
type Product = {
  id: number;
  price: number;
};

function totalPrice(product: Product) {
  return product.price;
}
```

Which value is valid?

A. `{ id: "1", price: 20 }`
B. `{ id: 1, price: "20" }`
C. `{ id: 1, price: 20 }`
D. `{ price: 20 }`

**Review key:** C

**Feedback:** Both required properties are present with the required types only in option C.

## 7. Checkpoint

What is the practical purpose of a named object shape?

A. To make JavaScript run faster.
B. To describe which properties and value types another piece of code expects.
C. To force every object to have exactly the same extra properties.
D. To replace functions.

**Review key:** B

**Feedback:** A named shape communicates a data contract that can be reused and checked.

## 8. Forge takeaway

**Mental model:** A type can be a reusable map of the information another piece of code expects.

**Senior habit:** When a function accepts a complicated object, name the shape instead of letting every call site rediscover the contract.

### Lesson completion
Create a `Book` type with `title` as a string, `pages` as a number, and `available` as a boolean. Then create one valid `Book` value.

---
# 2.3.5 — Unions: More Than One Valid Possibility
**Estimated time:** 14 minutes  
**Learner goal:** Represent values that intentionally allow more than one possibility using union and literal types.

## 1. One variable can have a controlled set of possibilities

Suppose a task can be:

- waiting
- working
- finished

Instead of using an arbitrary string, TypeScript can describe the exact allowed values:

```ts
type TaskState = "waiting" | "working" | "finished";
```

That `|` means **or**.

The value must be one of the listed possibilities.

## 2. Prediction

Which assignment is invalid?

```ts
type Theme = "light" | "dark";
```

A. `const a: Theme = "light";`
B. `const b: Theme = "dark";`
C. `const c: Theme = "blue";`
D. `const d: Theme = "light";`

**Review key:** C

**Feedback:** `Theme` allows only the two listed string values.

## 3. Unions of different types

A union does not have to list literal strings.

```ts
type Id = number | string;
```

That means an `Id` can hold either a number or a string.

The important catch is that your code must now account for both possibilities when the operation differs.

## 4. Prediction before using a union

Consider:

```ts
function printId(id: number | string) {
  return id.toFixed(0);
}
```

What is the problem?

A. `number | string` is not a valid type.
B. `toFixed` is available on numbers but not guaranteed on every value in the union.
C. Strings cannot be passed to functions.
D. The function has too many parameters.

**Review key:** B

**Feedback:** The type says `id` might be a string. The function cannot safely call a number-only method until it has proved the value is a number.

## 5. Literal unions are small state machines

Consider:

```ts
type SaveState = "idle" | "saving" | "saved" | "error";
```

This is useful because the codebase now has a named, finite vocabulary for the state.

A random string like `"savng"` is no longer silently acceptable.

## 6. Repair the state

A developer writes:

```ts
type Status = "idle" | "loading" | "success" | "error";

const status: Status = "succes";
```

What is TypeScript protecting you from?

A. A misspelled state name that is outside the allowed set.
B. A slow internet connection.
C. A misspelled task state.
D. A missing task state.

**Review key:** A

**Feedback:** The literal union acts like a small controlled vocabulary.

## 7. Checkpoint

Why is this often more useful than `string`?

```ts
type Role = "admin" | "editor" | "viewer";
```

A. It makes the application faster.
B. It tells the checker the valid possibilities are limited to a known set.
C. It turns strings into numbers.
D. It removes the need for functions.

**Review key:** B

**Feedback:** The type records the allowed vocabulary, which lets TypeScript catch values outside that vocabulary.

## 8. Forge takeaway

**Mental model:** A union is a promise that a value belongs to one of several known possibilities.

**Senior habit:** When a value has a small meaningful vocabulary, encode the vocabulary instead of accepting arbitrary strings.

### Lesson completion
Create:

```ts
type Size = ...;
```

so that only `"small"`, `"medium"`, and `"large"` are allowed.

**Target:**

```ts
type Size = "small" | "medium" | "large";
```

---
# 2.3.6 — Narrowing: Prove What You Have
**Estimated time:** 16 minutes  
**Learner goal:** Use conditions that narrow a union to a more specific type before performing type-specific work.

## 1. A union gives you possibilities, not certainty

Suppose:

```ts
type Value = string | number;
```

Inside a function that receives a `Value`, TypeScript cannot assume it is a string or a number until your code gives it evidence.

That process is called **narrowing**.

## 2. Narrow with `typeof`

```ts
function describe(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return value.toFixed(2);
}
```

Inside the first branch, TypeScript knows `value` is a string.

After that branch, the remaining possibility is number.

The condition is not only for runtime behavior. It also gives the type checker evidence.

## 3. Prediction

What can TypeScript safely allow here?

```ts
function format(value: string | number) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value.toUpperCase();
}
```

A. Neither branch can work.
B. Each branch uses an operation appropriate for the narrowed type.
C. Only the first branch is valid.
D. Only the second branch is valid.

**Review key:** B

**Feedback:** The `typeof` check narrows the union. In the first branch the value is a number; outside it, the remaining possibility is string.

## 4. Narrow object unions with a tag

A useful pattern is to give each object variant a property that identifies its kind:

```ts
type Result =
  | { kind: "success"; value: string }
  | { kind: "error"; message: string };
```

Now code can inspect `kind`:

```ts
function messageFor(result: Result) {
  if (result.kind === "success") {
    return result.value;
  }

  return result.message;
}
```

The check does two jobs:

1. It decides what should happen at runtime.
2. It tells TypeScript which object shape is currently possible.

## 5. Find the unsafe line

Which line is unsafe before narrowing?

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape) {
  return Math.PI * shape.radius * shape.radius;
}
```

A. `type Shape = ...`
B. `{ kind: "circle"; radius: number }`
C. `return Math.PI * shape.radius * shape.radius;`
D. Nothing is wrong.

**Review key:** C

**Feedback:** `Shape` can also be a square, and a square has no `radius`. The function must narrow before using a variant-specific property.

## 6. Repair it

A correct version is:

```ts
function area(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  }

  return shape.side * shape.side;
}
```

The condition proves which variant we have.

## 7. Why narrowing matters

Without narrowing, your code is making an unsupported assumption.

With narrowing, your code says:

**“I know there are multiple possibilities. I checked which one I have. Now this operation is safe for that case.”**

That is a powerful engineering pattern far beyond TypeScript.

## 8. Checkpoint

What does narrowing provide?

A. Faster JavaScript.
B. Evidence that lets code and the type checker work with a more specific possibility.
C. A way to avoid writing any conditions.
D. A way to convert every value into a string.

**Review key:** B

**Feedback:** Narrowing is the bridge from “could be several things” to “in this branch, we have this specific thing.”

## 9. Forge takeaway

**Mental model:** A union describes possibilities. A guard proves which possibility you have right now.

**Senior habit:** When the type says “A or B,” look for the check that proves which branch you are in before touching branch-specific data.

### Lesson completion
Write a function that accepts `string | number` and returns:

- the uppercase string when the input is a string,
- the number doubled when the input is a number.

**Target:**

```ts
function transform(value: string | number): string | number {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return value * 2;
}
```

---
# 2.3.7 — Generics: Preserve the Relationship
**Estimated time:** 16 minutes  
**Learner goal:** Understand why generics exist and use a simple generic function to preserve the relationship between an input value and its output.

## 1. The problem with repeating similar functions

Imagine these functions:

```ts
function firstNumber(items: number[]) {
  return items[0];
}

function firstString(items: string[]) {
  return items[0];
}
```

The logic is the same. Only the element type changes.

We could write a generic function that preserves that relationship:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

`T` is a placeholder for a type.

When you call `first`, TypeScript can work out what `T` is from the argument.

## 2. Prediction

What is the likely result type here?

```ts
const names = ["Ada", "Grace"];
const firstName = first(names);
```

A. `number`
B. `string | undefined`
C. `boolean`
D. `any`

**Review key:** B

**Feedback:** `names` is an array of strings, so `T` becomes string. Because an array may be empty, the first element may be undefined.

## 3. Why not just return `any`?

Consider:

```ts
function first(items: any[]) {
  return items[0];
}
```

That version is more permissive, but it loses the relationship between the input and output.

A generic keeps the connection:

**array of T in → T or undefined out**

That relationship is the useful part.

## 4. Read the angle brackets

In:

```ts
function identity<T>(value: T): T {
  return value;
}
```

read `<T>` as:

**“This function works with a type that will be chosen for this call, and the output keeps that same type.”**

So:

```ts
const a = identity("hello");
const b = identity(42);
```

preserve different types without duplicating the function.

## 5. Prediction

What is the important relationship here?

```ts
function wrap<T>(value: T) {
  return { value };
}
```

A. Every result must contain a number.
B. Whatever type goes in becomes the type of the `value` property in the result.
C. `T` means string only.
D. Generic functions can accept only objects.

**Review key:** B

**Feedback:** The generic parameter connects the input type to the output shape.

## 6. Repair the generic

This function is supposed to return the same value type it receives:

```ts
function keep<T>(value: T): string {
  return value;
}
```

What is wrong?

A. The generic parameter cannot be named `T`.
B. The function promises a string even though `value` could be any type.
C. Generic functions cannot return values.
D. Nothing.

**Review key:** B

**Feedback:** The return type should preserve `T`, not claim every value is a string.

A corrected version is:

```ts
function keep<T>(value: T): T {
  return value;
}
```

## 7. When generics are useful

Generics are useful when you have a reusable operation whose logic stays the same while the value type changes.

They are not a contest for how many angle brackets you can fit into one function.

A good first question is:

**“What relationship between input and output do I want to preserve?”**

## 8. Checkpoint

Which statement best explains a generic type parameter?

A. It means the function only works with strings.
B. It lets a function stay reusable while preserving useful relationships between types.
C. It disables the type checker.
D. It automatically makes every value nullable.

**Review key:** B

**Feedback:** Generics preserve relationships. They are useful when the same operation should work across many types without throwing away type information.

## 9. Forge takeaway

**Mental model:** A generic is a placeholder for a type that lets reusable code keep the relationship between what goes in and what comes out.

**Senior habit:** Before reaching for a generic, identify the relationship you need to preserve. If there is no useful relationship, a generic may just add noise.

### Lesson completion
Write a generic `identity` function that accepts any value and returns that exact type.

**Target:**

```ts
function identity<T>(value: T): T {
  return value;
}
```

---
# 2.3.8 — Forge Mission: Make Intent Explicit
**Estimated time:** 20 minutes  
**Learner goal:** Integrate inference, function typing, object shapes, unions, narrowing, and a simple generic into a small TypeScript repair task.

## 1. Mission briefing

A teammate left you a small piece of JavaScript. It works on the happy path, but its assumptions are invisible.

Your job is not to add types everywhere.

Your job is to make the important assumptions explicit and use the type checker to expose mismatches.

Here is the starting JavaScript:

```js
function summarizeUser(user, mode) {
  if (mode === "short") {
    return user.name;
  }

  return `${user.name} has ${user.tasks.length} tasks`;
}

const user = {
  id: 7,
  name: "Ada",
  tasks: ["write", "review", "rest"]
};

console.log(summarizeUser(user, "short"));
```

## 2. Mission step one — Name the object shape

Create a reusable type for the `user` object.

It needs:

- `id` as a number
- `name` as a string
- `tasks` as an array of strings

**Target:**

```ts
type User = {
  id: number;
  name: string;
  tasks: string[];
};
```

**Hint 1:** Start with `type User = { ... }`.

**Hint 2:** Each property needs a type.

**Hint 3:** `tasks` is a list of strings, so use `string[]`.

**Review key:** The target `User` type above.

## 3. Mission step two — Make the mode vocabulary explicit

The function has two supported modes:

- `"short"`
- `"long"`

Create a literal union:

```ts
type SummaryMode = "short" | "long";
```

Then use it for the `mode` parameter.

**Review key:**

```ts
function summarizeUser(user: User, mode: SummaryMode) {
```

**Why:** The function no longer accepts arbitrary strings. Its second parameter now records the exact vocabulary the function understands.

## 4. Mission step three — Type the function boundary

Complete the function signature:

```ts
function summarizeUser(
  user: User,
  mode: SummaryMode
): ______ {
  // ...
}
```

The function can return either the user's name or the longer sentence.

What return type belongs here?

A. `number`
B. `string`
C. `User`
D. `SummaryMode`

**Review key:** B

**Feedback:** Both branches produce strings, so the return type is `string`.

## 5. Mission step four — Predict the type checker

This call appears elsewhere in the code:

```ts
summarizeUser(user, "compact");
```

What should happen?

A. It should be accepted because any string is a valid mode.
B. It should be rejected because `"compact"` is not part of `SummaryMode`.
C. TypeScript should silently change it to `"short"`.
D. The error has nothing to do with the type system.

**Review key:** B

**Feedback:** The literal union is doing exactly what it was designed to do: reject values outside the declared vocabulary.

## 6. Mission step five — Narrow a second possibility

Extend the function so it can also accept a numeric mode:

```ts
type SummaryMode = "short" | "long" | 1;
```

Now this implementation is unsafe:

```ts
function summarizeUser(user: User, mode: SummaryMode): string {
  return mode.toUpperCase();
}
```

Why?

A. `mode` might be the number `1`.
B. Strings cannot use `toUpperCase`.
C. `SummaryMode` cannot contain numbers.
D. The user object is missing a property.

**Review key:** A

**Feedback:** The union now includes a number. The function must narrow before calling a string-only method.

## 7. Mission step six — Repair with evidence

Write the safe version:

```ts
function summarizeUser(user: User, mode: SummaryMode): string {
  if (typeof mode === "string") {
    if (mode === "short") {
      return user.name;
    }

    return `${user.name} has ${user.tasks.length} tasks`;
  }

  return `${user.name} has ${user.tasks.length} tasks`;
}
```

Notice what happened:

1. The type says multiple possibilities are allowed.
2. The condition proves which kind we have.
3. Only after the proof do we use string operations.

## 8. Mission step seven — Write one reusable helper

Add this helper:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

Use it to get the first task:

```ts
const firstTask = first(user.tasks);
```

What type should `firstTask` have?

A. `number`
B. `string | undefined`
C. `User`
D. `any`

**Review key:** B

**Feedback:** `user.tasks` is `string[]`, so `T` becomes string. An empty array has no first item, so the result may also be undefined.

## 9. Final repair

Here is the final target:

```ts
type User = {
  id: number;
  name: string;
  tasks: string[];
};

type SummaryMode = "short" | "long";

function summarizeUser(user: User, mode: SummaryMode): string {
  if (mode === "short") {
    return user.name;
  }

  return `${user.name} has ${user.tasks.length} tasks`;
}

function first<T>(items: T[]): T | undefined {
  return items[0];
}

const user: User = {
  id: 7,
  name: "Ada",
  tasks: ["write", "review", "rest"]
};

const summary = summarizeUser(user, "long");
const firstTask = first(user.tasks);

console.log(summary);
console.log(firstTask);
```

## 10. Transfer challenge

Now change the data without changing the helper functions.

Create a `Book` type with:

- `title: string`
- `pages: number`
- `tags: string[]`

Then create a generic `first` call that returns the first tag.

Write the code before looking at the target below.

**Target:**

```ts
type Book = {
  title: string;
  pages: number;
  tags: string[];
};

const book: Book = {
  title: "The Web",
  pages: 240,
  tags: ["web", "systems", "frontend"]
};

const firstTag = first(book.tags);
```

## 11. Module mastery gate

You are ready to leave Module 2.3 when you can do these without copying the previous target:

**1. Intent:** Explain what a type annotation adds to code.

**2. Inference:** Identify places where TypeScript can infer the type without an explicit annotation.

**3. Contracts:** Type a function's inputs and outputs.

**4. Shapes:** Describe an object's required structure.

**5. Possibilities:** Use a union when more than one value is valid.

**6. Proof:** Narrow a union before using a branch-specific operation.

**7. Relationships:** Explain what a generic preserves between input and output.

**Final reflection:** Which part of TypeScript feels most useful to you now: making data shapes explicit, limiting valid possibilities, catching mismatches at function boundaries, or preserving relationships with generics? Explain why.

## 12. Forge takeaway

**TypeScript is not about adding types everywhere.** It is about making important assumptions visible enough for tools to check them.

**Senior habit:** Start with the question, “What does this code assume?” Then make the valuable assumptions explicit.

### Lesson completion
Pass the transfer challenge and explain, in your own words, how the type checker helped you catch at least one mistake before runtime.
