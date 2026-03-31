# Refactoring Candidates

After the GREEN stage of TDD (tests pass with minimum code), look for these refactoring opportunities. The REFACTOR stage improves code quality while keeping all tests green.

---

## What to Look For

### 1. Duplication

Code that appears in two or more places with the same structure.

**Fix:** Extract into a shared function, class, or module.

```typescript
// BEFORE: duplicated validation in two handlers
function createUser(data) {
  if (!data.email || !data.email.includes("@")) throw new Error("Invalid email");
  // ...
}
function updateUser(id, data) {
  if (!data.email || !data.email.includes("@")) throw new Error("Invalid email");
  // ...
}

// AFTER: extracted
function validateEmail(email: string): void {
  if (!email || !email.includes("@")) throw new Error("Invalid email");
}
function createUser(data) {
  validateEmail(data.email);
  // ...
}
function updateUser(id, data) {
  validateEmail(data.email);
  // ...
}
```

### 2. Long Methods

A function doing multiple things sequentially.

**Fix:** Break into private helpers. Keep tests on the public interface -- do not add tests for the extracted helpers.

```typescript
// BEFORE: one long function
async function processOrder(order) {
  // 20 lines: validate order
  // 15 lines: calculate totals
  // 10 lines: charge payment
  // 10 lines: send confirmation
}

// AFTER: orchestrator + helpers
async function processOrder(order) {
  validateOrder(order);
  const totals = calculateTotals(order);
  const charge = await chargePayment(order, totals);
  await sendConfirmation(order, charge);
}
```

Tests still call `processOrder()`. The helpers are private implementation details.

### 3. Shallow Modules

A class or module whose interface is as complex as its implementation.

**Fix:** Combine with its caller or push more logic inside. See `deep-modules.md`.

```typescript
// BEFORE: shallow wrapper adding no value
class UserValidator {
  validate(user) { return user.name && user.email; }
}

// AFTER: validation pulled into the module that uses it
class UserService {
  create(data) {
    if (!data.name || !data.email) throw new ValidationError("...");
    return this.repo.save(data);
  }
}
```

### 4. Feature Envy

A function that accesses another object's data more than its own.

**Fix:** Move the logic to where the data lives.

```typescript
// BEFORE: order logic lives in the formatter
function formatOrderSummary(order) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * order.taxRate;
  const total = subtotal + tax;
  return `Total: ${total}`;
}

// AFTER: order knows its own totals
class Order {
  get subtotal() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); }
  get tax() { return this.subtotal * this.taxRate; }
  get total() { return this.subtotal + this.tax; }
}
function formatOrderSummary(order) {
  return `Total: ${order.total}`;
}
```

### 5. Primitive Obsession

Using strings, numbers, or booleans where a domain concept exists.

**Fix:** Introduce value objects.

```typescript
// BEFORE: email is just a string
function createUser(name: string, email: string) { ... }

// AFTER: Email is a validated type
class Email {
  constructor(value: string) {
    if (!value.includes("@")) throw new Error("Invalid email");
    this.value = value;
  }
}
function createUser(name: string, email: Email) { ... }
```

### 6. Code Revealed by New Work

The new code you just wrote may expose problems in existing code that were not visible before.

**Fix:** Refactor the existing code, but only if tests already cover it. If not, add tests first (still in the REFACTOR stage -- this is permitted because you are strengthening coverage, not changing behaviour).

---

## Rules for the REFACTOR Stage

1. **All tests must stay green.** If a test breaks, you changed behaviour -- revert and try again.
2. **Do not add new behaviour.** Refactoring changes structure, not function. New behaviour needs a new RED/GREEN/REFACTOR cycle.
3. **Do not weaken or delete tests.** If a test is genuinely wrong (tests implementation, not behaviour), replace it with a better test that covers the same behaviour.
4. **Commit after refactoring.** The REFACTOR stage gets its own commit, separate from the GREEN commit.

---

## Checklist

After GREEN, scan for:

- [ ] Duplicated code across the codebase
- [ ] Methods longer than ~20 lines
- [ ] Modules with interfaces as complex as their implementation
- [ ] Functions that reach into other objects' internals
- [ ] Primitive types standing in for domain concepts
- [ ] Existing code that the new work reveals as problematic
