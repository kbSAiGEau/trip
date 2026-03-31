---
name: write-prd
description: Create a PRD through user interview, codebase exploration, and module design. Outputs a markdown file and optionally a GitHub issue. Use when user wants to write a PRD, create a product requirements document, or plan a new feature.
---

# Write PRD

Create a PRD through structured interview, codebase exploration, and module design.

## Input / Output

| | File | Description |
|---|---|---|
| **In** | `docs/echo-check.md` | Validated intent from /grill-me |
| **Out** | `docs/prd.md` | Product requirements document |

## Process

### 1. Gather context

Ask the user for a detailed description of the problem they want to solve and any ideas for solutions. If `docs/echo-check.md` exists, use it as the starting point. If it does not exist, gather equivalent context through the user interview in this step. At least one of these inputs is required — do not proceed with neither.

### 2. Explore the codebase

When exploring an existing codebase:
- [ ] **Project structure** — run `ls` and read the top-level directory layout
- [ ] **Entry points** — identify `main`, `index`, `app`, or equivalent files
- [ ] **Existing patterns** — check for routers, middleware, services, or component patterns
- [ ] **Test infrastructure** — identify the test runner, existing test files, and conventions
- [ ] **Configuration** — read `package.json`, `tsconfig.json`, `pyproject.toml`, or equivalent
- [ ] **Documentation** — check for existing README, API docs, or inline documentation

If this is a greenfield project with no existing codebase, skip this step.

### 3. Interview

Interview the user about every aspect of the plan until you reach shared understanding. Walk each branch of the design tree, resolving dependencies between decisions. Skip this step if a grill-me session already covered it.

### 4. Sketch modules

Identify the major modules to build or modify. Actively look for opportunities to extract **deep modules** — modules that encapsulate significant functionality behind a simple, testable interface that rarely changes.

Confirm with the user:
- Do these modules match their expectations?
- Which modules should have tests written for them?

### 5. Write the PRD

Use the template in `templates/prd.md`. Copy it into `docs/prd.md` and populate all sections with the context gathered from the interview and codebase exploration. Assign each user story a unique ID using the `US-NNN` scheme (e.g., US-001, US-002). These IDs are referenced downstream by `design.md` (screen inventory), `architecture.md` (component mapping), `evals.json` (`derived_from` field), and `roadmap.json` (task scope).

### 6. Review and revise loop

Present the completed PRD to the user. Ask:

> "Review the PRD. Request changes or approve."

**If changes requested:**

1. Identify affected sections
2. Revise the PRD
3. Re-present for review

**Do NOT proceed until the user explicitly approves.** This loop continues until approval — there is no turn limit.

### 7. Save approved PRD

Save as a markdown file in the project (e.g., `docs/prd.md`).

Optionally, also submit as a GitHub issue using `gh issue create`.

## Phase Integration

- **Phase 2 (Specification + Eval Generation)**: This is the primary skill for Phase 2's PRD generation step. Reads the Phase 1 session summary (or grill-me output) as input.
- **Standalone**: Can be invoked independently for any feature that needs a PRD, without running the full phase sequence.
