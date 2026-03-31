---
name: tdd
description: Test-driven development with red-green-refactor loop. ONE test at a time, vertical slices only. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
---

# Test-Driven Development

> "AI is so eager to create code and find the fastest solution to your problem — you need to impose back pressure to keep it in a stable state."

Back pressure comes from: **unit tests** (red-green-refactor), **strong types** (TypeScript, etc.), and a **quality codebase** (if you have mud, the LLM will play in the mud).

## Input / Output

| | File | Description |
|---|---|---|
| **In** | `roadmap.json` | Task to implement (current subtask) |
| **In** | `docs/evals.json` | Evaluation criteria for the task |
| **In** | Relevant source files | Existing code context |
| **Out** | Implemented + tested code | RED/GREEN/REFACTOR commits |
| **Out** | test files | Created per language convention (e.g., `src/__tests__/*.test.ts`, `tests/test_*.py`) | During RED stage |
| **Out** | `docs/evals.json` | Updated for all evals this task covers: `eval_status` (NOT_TESTED → PASS/FAIL) and `test_file` (null → file path). Both fields are owned by `/tdd`. | After RED (test_file) and GREEN (status) |

## Philosophy

**Core principle**: Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests should not break.

**Good tests** exercise real code paths through public APIs. They describe _what_ the system does, not _how_. A good test reads like a specification. These tests survive refactors because they ignore internal structure.

**Bad tests** mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). Warning sign: tests break on refactor but behavior hasn't changed.

See [tests.md](tests.md) for examples, [mocking.md](mocking.md) for mocking guidelines, [deep-modules.md](deep-modules.md) for module design, [interface-design.md](interface-design.md) for testable interfaces, and [refactoring.md](refactoring.md) for refactor candidates.

## Companion References

Read companion files in this order when you need deeper context:

1. **[tests.md](tests.md)** -- Good vs bad test examples (test quality standards)
2. **[interface-design.md](interface-design.md)** -- Designing testable interfaces
3. **[deep-modules.md](deep-modules.md)** -- Small interfaces, deep implementations
4. **[mocking.md](mocking.md)** -- When and how to mock (prefer real implementations)
5. **[refactoring.md](refactoring.md)** -- Refactor candidates after GREEN

Consult as referenced in the workflow steps below. You do not need to read all before starting.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is horizontal slicing and it produces bad tests:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You test the _shape_ of things rather than user-facing behavior
- Tests become insensitive to real changes
- You commit to test structure before understanding the implementation

**Correct approach**: Vertical slices. One test, one implementation, repeat. Each test responds to what you learned from the previous cycle.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED->GREEN: test1->impl1
  RED->GREEN: test2->impl2
  RED->GREEN: test3->impl3
```

## Workflow

### 1. Planning

Before writing any code:

- [ ] Confirm with user what interface changes are needed
- [ ] Confirm which behaviors to test (prioritize — you cannot test everything)
- [ ] Identify opportunities for deep modules (small interface, deep implementation)
- [ ] Design interfaces for testability (accept dependencies, return results)
- [ ] List the behaviors to test (not implementation steps)
- [ ] Get user approval on the plan

Ask: "What should the public interface look like? Which behaviors are most important to test?"

> **Reference:** See [interface-design.md](interface-design.md) for testable interface principles and [deep-modules.md](deep-modules.md) for deep module design patterns.

### 2. Tracer Bullet

The tracer bullet is your first vertical slice — it proves the full stack works end-to-end before you build out breadth.

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior
       Run the test -- confirm it FAILS
       Commit the failing test
GREEN: Write minimal code to pass
       Run the test -- confirm it PASSES
       Commit
```

**RED verification is mandatory.** After writing the test, run it. If it passes immediately, the test is not covering new behavior -- rewrite the test to target unimplemented behavior, or discard it and pick a different behavior. Only commit after confirming the test fails for the expected reason (missing implementation, not a syntax error or import failure).

**Update `test_file` in evals:** After creating the test file and confirming it fails (RED), update `docs/evals.json` — set the `test_file` field for all evals covered by this task to the path of the newly created test file. This ensures `test_file` is populated as soon as the test exists, before implementation begins.

> **Reference:** See [tests.md](tests.md) for examples of good vs bad tests. If you need to mock a dependency, consult [mocking.md](mocking.md) first — prefer real implementations over mocks.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test
       Run the test -- confirm it FAILS
       Commit the failing test
GREEN: Minimal code to pass
       Run the test -- confirm it PASSES
       Commit
```

Rules:
- **Run tests after every RED** -- if the new test passes immediately, it is not testing new behavior. Rewrite or discard it.
- **One test at a time** — never write the next test before the current one passes
- Only enough code to pass the current test
- Do not anticipate future tests
- Keep tests focused on observable behavior
- Commit after each RED and each GREEN (separate commits)

> **Reference:** See [tests.md](tests.md) for the distinction between behavior tests and implementation tests. If a test requires mocking, consult [mocking.md](mocking.md).

### 4. Update Evals

After each GREEN commit, update `docs/evals.json` to reflect the current state of the task's evaluation criteria:

- [ ] For each eval ID covered by this task, set `status` to `PASS` or `FAIL` based on the test results
- [ ] Update the `summary` counts to match the new status totals
- [ ] Append a `change_log` entry with `change_type: STATUS_CHANGE`, referencing the eval IDs updated and the current task ID

**Eval coverage definition:** An eval is covered by this task if the acceptance criterion it describes is directly validated by a test written in this session. Update only those evals. Do not update evals for features implemented in other tasks, even if tests incidentally pass.

This ensures eval status stays in sync with implementation progress throughout the TDD cycle, not just at handoff.

> **Scope of /tdd eval updates:** This skill owns both `status` and `test_file` updates. During RED, it populates the `test_file` path for all evals covered by the current task. During GREEN, it updates `status` and appends `change_log` entries.

### 5. Refactor

After a group of related tests pass, look for refactor candidates:

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first. Commit after refactor.

> **Reference:** See [refactoring.md](refactoring.md) for specific refactor candidates to look for. See [deep-modules.md](deep-modules.md) for guidance on deepening modules during refactoring.

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] RED verified -- test was run and FAILED before writing implementation
[ ] Failure was for the right reason (missing behavior, not syntax/import error)
[ ] Code is minimal for this test
[ ] No speculative features added
```

## Test Protection

It is **unacceptable** to remove, delete, or weaken existing tests. If a test fails after your changes, fix the code, not the test. The only exception is when a test was verifying incorrect behavior that the current change intentionally corrects — and this must be explicitly noted.

## Phase Integration

- **Phase 3 (Subtask Execution)**: This is the core execution skill for Phase 3. Each roadmap.json subtask (or GitHub issue) is implemented using this TDD cycle. The RED and GREEN stages each get their own commit (RED = failing test committed, GREEN = implementation committed, REFACTOR = cleanup committed).
- **Phase 4 (Handoff)**: After TDD completes for a subtask, the handoff protocol updates roadmap.json status. Evals are already updated during the TDD cycle (Step 4 above).
- **Standalone**: Can be invoked independently for any feature or bug fix that benefits from test-first development.
