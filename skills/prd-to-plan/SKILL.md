---
name: prd-to-plan
description: Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices, saved as a local Markdown file in ./plans/. Use when user wants to break down a PRD, create an implementation plan, plan phases from a PRD, or mentions "tracer bullets".
---

# PRD to Plan

Break a PRD into a phased implementation plan using vertical slices (tracer bullets). Output is a Markdown file in `./plans/`.

## Input / Output

| | File | Description |
|---|---|---|
| **In** | `docs/prd.md` | Product requirements from /write-prd |
| **In** | `docs/architecture.md` | Technical architecture from /write-architecture |
| **In** | `docs/evals.json` | Evaluation suite from /generate-evals (optional -- use if available to align slices with eval coverage) |
| **Out** | `plans/<feature>.md` | Phased implementation plan with vertical slices |

## Process

### 1. Confirm the PRD is in context

The PRD should already be in the conversation. If it isn't, ask the user to paste it or point you to the file.

### 2. Explore the codebase

When exploring an existing codebase:
- [ ] **Module boundaries** — identify existing packages, services, or component directories
- [ ] **Data layer** — find database schemas, ORM models, or data access patterns
- [ ] **API layer** — identify existing routes, controllers, or API handlers
- [ ] **Shared utilities** — find common helpers, types, or constants the plan should reuse
- [ ] **Build and deploy** — understand the build pipeline, deployment scripts, and environment configuration

If this is a greenfield project, skip this step.

### 3. Identify durable architectural decisions

Read `docs/architecture.md` and extract the architectural decisions already documented there. These are your starting point — do not rediscover them. Add any decisions not yet captured.

Before slicing, identify high-level decisions that are unlikely to change throughout implementation:

- Route structures / URL patterns
- Database schema shape
- Key data models
- Authentication / authorization approach
- Third-party service boundaries

These go in the plan header so every phase can reference them.

### 4. Draft vertical slices

Break the PRD into **tracer bullet** phases. Each phase is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- Do NOT include specific file names, function names, or implementation details that are likely to change as later phases are built
- DO include durable decisions: route paths, schema shapes, data model names
</vertical-slice-rules>

### 5. Quiz the user

Present the proposed breakdown as a numbered list. For each phase show:

- **Title**: short descriptive name
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Should any phases be merged or split further?

Iterate until the user approves the breakdown.

### 6. Write the plan file

Create `./plans/` if it doesn't exist. Write the plan as a Markdown file named after the feature (e.g. `./plans/user-onboarding.md`). Use the template below.

<plan-template>
# Plan: <Feature Name>

> Source PRD: <brief identifier or link>

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: ...
- **Schema**: ...
- **Key models**: ...
- (add/remove sections as appropriate)

---

## Phase 1: <Title>

**User stories**: <list from PRD>

### What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Phase 2: <Title>

**User stories**: <list from PRD>

### What to build

...

### Acceptance criteria

- [ ] ...

<!-- Repeat for each phase -->
</plan-template>

## Phase Integration

- **Phase 2 (Specification)**: Invoked at Step 4 of Phase 2, after `/generate-evals`. If `docs/evals.json` exists (produced by `/generate-evals`), use it to align vertical slices with eval coverage -- each slice should map cleanly to one or more eval groups. Standalone: Can be invoked independently for any PRD that needs a plan.
