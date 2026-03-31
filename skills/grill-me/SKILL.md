---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

## Input / Output

| | File | Description |
|---|---|---|
| **In** | *(conversation)* | Project idea described by the user |
| **Out** | `docs/echo-check.md` | Validated intent — bridge between Phase 1 and Phase 2 |

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time. Sessions can generate 16–50+ questions over 30–45 minutes for complex features.

If a question can be answered by exploring the codebase, explore the codebase instead of asking the user. When exploring:

- [ ] Check project structure (`ls`, directory layout) for architectural patterns
- [ ] Read configuration files (`package.json`, `tsconfig.json`, `.env.example`, etc.) for tech stack and dependencies
- [ ] Read entry points (`main`, `index`, `app`) for application structure
- [ ] Check for existing tests to understand testing conventions
- [ ] Read any existing documentation (README, docs/, comments) for project context

Use findings to inform your questions and pre-fill answers where possible.

## Completion

When all branches are resolved and all 12 Discovery Checklist topics are covered (see `phases/phase-1-intent-discovery.md`), present an **Echo Check** — a concise summary of every decision made. Ask the user to confirm or correct.

Once confirmed, populate the template from `templates/echo-check.md` and save it as `docs/echo-check.md` in the target project.

## Echo Check Format

The Echo Check is the bridge between Phase 1 and Phase 2 — all downstream skills (`/write-prd`, `/write-design`, `/write-architecture`) consume it. Use this structure:

```markdown
# Echo Check: <Project Name>

## Problem Statement
What problem this project solves, in 2-3 sentences.

## Target Users
Who will use this and in what context.

## Core Requirements
1. Requirement one
2. Requirement two
3. (numbered list of all confirmed requirements)

## Architectural Constraints
Technology choices, platform targets, integration boundaries, and non-negotiable technical decisions.

## Key Decisions
| Decision | Rationale |
|----------|-----------|
| Decision made during grilling | Why this choice was made |

## Risk Assessment
Known risks, open questions, and areas of uncertainty that downstream phases should address.

## Confidence Level
N/12 Discovery Checklist topics covered. List any waived topics and reason.
```

## Phase Integration

- **Phase 1 (Intent Discovery)**: This is the core execution unit of Phase 1. It replaces the Clarify Loop. The Echo Check serves as the Phase 1 exit gate.
- **Phase 2 (Specification)**: The confirmed Echo Check feeds directly into the `write-prd` skill.
- **Standalone**: Can be invoked independently to stress-test any plan or design at any point.
