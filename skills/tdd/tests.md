# Good and Bad Tests

Reference for writing tests that verify behaviour, not implementation.

## Good Tests

Good tests verify **observable behaviour** through **public interfaces**. They survive refactoring because they describe WHAT the system does, not HOW it does it.

### Integration-style: test through real interfaces

```typescript
// GOOD: Tests observable behavior through public API
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

### Verify through the same interface users use

```typescript
// GOOD: Verifies through the module's own API
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

### Characteristics of good tests

- Tests behaviour that users or callers care about
- Uses only public API
- Survives internal refactors without changes
- Describes WHAT, not HOW
- One logical assertion per test
- Test name reads as a behaviour specification

---

## Bad Tests

Bad tests are **coupled to implementation details**. They break when you refactor, even if behaviour is unchanged.

### Mocking internal collaborators

```typescript
// BAD: Tests implementation details, not behaviour
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

### Bypassing the interface to verify

```typescript
// BAD: Reaches past the interface to check the database directly
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});
```

### Red flags

- Mocking internal collaborators (classes/functions you own)
- Testing private methods
- Asserting on call counts or call order
- Test breaks when refactoring without behaviour change
- Test name describes HOW not WHAT
- Verifying through external means (DB queries, file checks) instead of the module's own interface

---

## The Refactoring Litmus Test

> If you rename an internal method and a test breaks, that test is coupled to implementation, not behaviour.

Good tests should only break when **behaviour** changes. If a test breaks during the REFACTOR stage of TDD (where behaviour is held constant), delete the test and replace it with one that tests through the public interface.
