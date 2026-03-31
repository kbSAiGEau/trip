# Interface Design for Testability

Three principles for designing interfaces that make testing natural. Code that follows these principles rarely needs mocks.

---

## Principle 1: Accept Dependencies, Don't Create Them

Functions that create their own dependencies are hard to test because you cannot substitute alternatives during testing.

```typescript
// TESTABLE: Dependency is injected
function processOrder(order: Order, paymentGateway: PaymentGateway): Receipt {
  const charge = paymentGateway.charge(order.total);
  return { orderId: order.id, chargeId: charge.id };
}

// HARD TO TEST: Dependency is created internally
function processOrder(order: Order): Receipt {
  const gateway = new StripeGateway(process.env.STRIPE_KEY);
  const charge = gateway.charge(order.total);
  return { orderId: order.id, chargeId: charge.id };
}
```

In tests, the injectable version lets you pass a test double for the payment gateway -- no environment variables, no network calls, no Stripe account needed.

**Applies at module boundaries.** You do not need to inject every internal helper. Only inject things that cross system boundaries (external APIs, databases, clocks, file systems).

---

## Principle 2: Return Results, Don't Produce Side Effects

Functions that return values are trivially testable: call the function, assert on the return. Functions that mutate state require setup, action, and then inspection of the mutated object.

```typescript
// TESTABLE: Returns a result
function calculateDiscount(cart: Cart, rules: DiscountRule[]): Discount {
  // Pure computation
  return { amount: 15.00, code: "SUMMER15" };
}

// HARD TO TEST: Mutates input
function applyDiscount(cart: Cart, rules: DiscountRule[]): void {
  cart.total -= computeDiscount(cart, rules);
  cart.discountApplied = true;
}
```

The first version is a pure function: same inputs always produce the same output. The second requires you to construct a full cart object, call the function, then inspect the cart's mutated state.

**When side effects are necessary** (saving to a database, sending an email), push them to the edges. Keep the core logic pure and return values that the caller uses to trigger side effects.

```typescript
// Core logic: pure, testable
function buildInvoice(order: Order, taxRate: number): Invoice {
  return { items: order.items, tax: order.total * taxRate, total: ... };
}

// Edge: side-effectful, thin
async function sendInvoice(order: Order, taxRate: number, emailClient: EmailClient) {
  const invoice = buildInvoice(order, taxRate);  // pure
  await emailClient.send(invoice);                // side effect at the edge
}
```

---

## Principle 3: Small Surface Area

Fewer methods and fewer parameters mean fewer tests needed and simpler test setup.

```typescript
// GOOD: One method, one concern
interface Cache {
  get(key: string): Promise<Value | null>;
  set(key: string, value: Value, ttl?: number): Promise<void>;
}

// BAD: Sprawling interface
interface Cache {
  get(key: string): Promise<Value | null>;
  getMany(keys: string[]): Promise<Map<string, Value>>;
  set(key: string, value: Value): Promise<void>;
  setWithTTL(key: string, value: Value, ttl: number): Promise<void>;
  setMany(entries: Map<string, Value>): Promise<void>;
  delete(key: string): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
  size(): Promise<number>;
}
```

The small interface is easy to implement, easy to mock (when at a system boundary), and easy to test. Add methods only when a genuine use case demands them.

**Fewer params = simpler test setup:**

```typescript
// GOOD: One parameter object with defaults
function createUser(opts: { name: string; email: string; role?: Role }) {}

// BAD: Many positional params, all required in tests
function createUser(name: string, email: string, role: Role, org: Org, prefs: Prefs) {}
```

---

## Summary

| Principle | Test benefit |
|-----------|-------------|
| Accept dependencies | Substitute test doubles at boundaries |
| Return results | Assert on return values instead of inspecting state |
| Small surface area | Fewer tests needed, simpler setup |

These three principles reinforce each other. An interface that accepts its dependencies, returns results, and has a small surface area is naturally testable without any testing framework tricks.
