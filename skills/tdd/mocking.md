# When and How to Mock

Mocking is a testing technique for replacing real dependencies with controlled substitutes. The critical rule: **mock at system boundaries only**.

---

## What to Mock (System Boundaries)

These are things your code does not own and cannot control:

| Boundary | Example | Why mock it |
|----------|---------|-------------|
| External APIs | Payment processors, email services, third-party REST APIs | Network dependency, cost, rate limits |
| Databases | Sometimes -- prefer a test database when practical | Speed, isolation, determinism |
| Time | `Date.now()`, `setTimeout` | Deterministic assertions on time-dependent logic |
| Randomness | `Math.random()`, UUID generators | Reproducible tests |
| File system | Sometimes -- prefer temp directories when practical | Isolation, cleanup |

---

## What NOT to Mock (Your Own Code)

Never mock classes, modules, or functions that you control:

```typescript
// BAD: Mocking your own service
const mockUserService = jest.mock(UserService);
mockUserService.getUser.mockResolvedValue({ name: "Alice" });
await checkout(cart, mockUserService);

// GOOD: Use the real UserService with a test database
const userService = new UserService(testDb);
await userService.createUser({ name: "Alice" });
await checkout(cart, userService);
```

**Why?** Mocking internal collaborators makes tests pass even when the real integration is broken. The mock returns what you told it to -- it does not verify that the real code works.

---

## Designing for Mockability

### 1. Use Dependency Injection

Pass external dependencies in rather than creating them internally.

```typescript
// EASY TO MOCK: dependency is injected
function processPayment(order: Order, paymentClient: PaymentClient) {
  return paymentClient.charge(order.total);
}

// test
test("processes payment for order total", async () => {
  const mockClient = { charge: jest.fn().mockResolvedValue({ id: "ch_123" }) };
  const result = await processPayment(order, mockClient);
  expect(result.id).toBe("ch_123");
});
```

```typescript
// HARD TO MOCK: dependency is created internally
function processPayment(order: Order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

### 2. Prefer SDK-style Interfaces Over Generic Fetchers

Create specific functions for each external operation instead of one generic function.

```typescript
// GOOD: Each function is independently mockable with a specific return shape
const api = {
  getUser: (id: string) => fetch(`/users/${id}`).then(r => r.json()),
  getOrders: (userId: string) => fetch(`/users/${userId}/orders`).then(r => r.json()),
  createOrder: (data: OrderData) => fetch('/orders', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
};

// test: simple, no conditional logic
const mockApi = {
  getUser: jest.fn().mockResolvedValue({ id: "1", name: "Alice" }),
  getOrders: jest.fn().mockResolvedValue([]),
  createOrder: jest.fn().mockResolvedValue({ id: "ord_1" }),
};
```

```typescript
// BAD: Mocking requires conditional logic matching URLs
const api = {
  fetch: (endpoint: string, options?: RequestInit) => fetch(endpoint, options),
};

// test: mock has to parse URLs to return the right shape
const mockApi = {
  fetch: jest.fn((url) => {
    if (url.includes("/users/")) return { id: "1", name: "Alice" };
    if (url.includes("/orders")) return [];
    // ...fragile
  }),
};
```

The SDK approach means:
- Each mock returns one specific shape -- no conditional logic in test setup
- Easy to see which external calls a test exercises
- Type safety per endpoint
- Adding a new endpoint does not break existing mocks

---

## The Boundary Test

Before adding a mock, ask: **"Do I own this code?"**

- **Yes, I own it** -- use the real implementation. If it is slow, fix the real code or use a lightweight test setup (in-memory database, temp directory).
- **No, it is external** -- mock it. Define a clear interface at the boundary and mock that interface.

---

## Summary

| Do mock | Don't mock |
|---------|------------|
| External APIs | Your own classes/modules |
| Payment/email/SMS services | Internal collaborators |
| Time and randomness | Anything you control |
| File system (when needed) | Repository/service layers you wrote |
| Database (when test DB is impractical) | Business logic |
