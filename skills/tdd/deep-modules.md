# Deep Modules

Reference for designing modules that hide complexity behind simple interfaces. Based on John Ousterhout's *A Philosophy of Software Design*.

## The Core Idea

A module's value is the complexity it hides minus the complexity of its interface.

**Deep module** = small interface + substantial implementation

```
+---------------------+
|   Small Interface   |  <-- Few methods, simple params
+---------------------+
|                     |
|                     |
|  Deep Implementation|  <-- Complex logic hidden inside
|                     |
|                     |
+---------------------+
```

**Shallow module** = large interface + thin implementation (avoid)

```
+---------------------------------+
|       Large Interface           |  <-- Many methods, complex params
+---------------------------------+
|  Thin Implementation            |  <-- Just passes through
+---------------------------------+
```

## Why This Matters for TDD

Deep modules are easier to test because:

1. **Fewer methods** means fewer test cases to cover the interface
2. **Simple parameters** means simpler test setup
3. **Hidden complexity** means tests verify outcomes, not internal steps
4. **Stable interfaces** means tests survive refactoring

Shallow modules create test burden: many trivial tests that verify pass-through behaviour, breaking on every internal change.

## Design Questions

When designing or refactoring a module, ask:

- **Can I reduce the number of methods?** Combine related operations. A single `save(entity)` that handles create-or-update is deeper than separate `create()` and `update()` methods with identical signatures.
- **Can I simplify the parameters?** Accept a domain object instead of five primitive fields. Use sensible defaults.
- **Can I hide more complexity inside?** If callers are doing multi-step orchestration around your module, pull that logic in.

## Examples

### Deep: File system `open()`

```typescript
// One call hides: path resolution, permissions, buffering, OS syscalls
const file = fs.open("/path/to/file", "r");
```

### Shallow: A "service" that just delegates

```typescript
// BAD: Interface mirrors implementation 1:1
class UserService {
  getUser(id)       { return this.repo.getUser(id); }
  saveUser(user)    { return this.repo.saveUser(user); }
  deleteUser(id)    { return this.repo.deleteUser(id); }
  listUsers(filter) { return this.repo.listUsers(filter); }
}
```

This adds a layer without hiding any complexity. Either add real logic to the service (validation, authorization, caching) or let callers use the repo directly.

### Deep: A checkout module

```typescript
// GOOD: Simple interface, complex internals
async function checkout(cart: Cart, payment: PaymentMethod): Promise<Order> {
  // Internally: validates cart, calculates tax, applies discounts,
  // processes payment, creates order, sends confirmation, updates inventory
}
```

One function call, one return type. All the orchestration is hidden.
