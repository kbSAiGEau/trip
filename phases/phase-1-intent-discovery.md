# Phase 1: Intent Discovery

> **Goal:** Transform a vague product idea into a precise, validated understanding of what needs to be built and why.

> **Mode:** Active — human + agent conversation. This phase orchestrates the `/grill-me` skill to conduct structured design interviews.

---

## Entry Gate

Before starting Phase 1, verify:

| Check | How to Verify | Required |
|-------|---------------|----------|
| User has provided a project concept | At minimum a 1-3 sentence description | Yes |
| Framework files accessible | `phases/phase-1-intent-discovery.md` exists and is readable | Yes |

> If the entry gate fails, ask the user for a project description before proceeding.

---

## Execution

### Step 1: Design Interview

Invoke the `/grill-me` skill from `skills/grill-me/SKILL.md`.

The skill interviews the user relentlessly, walking down each branch of the design tree and resolving dependencies between decisions. It explores the codebase to answer questions when possible.

Track confidence after each round using the **Discovery Checklist** — 12 topics that must be covered:

1. Problem statement
2. Target users
3. Core features (MVP scope)
4. Out of scope
5. User journeys
6. Data model
7. Integrations
8. Auth and access
9. Tech stack
10. Deployment target
11. Edge cases and error handling
12. Success criteria

Report confidence as `N/12 topics covered (X%)` after each round. Continue until **all 12 topics are covered** (or the user explicitly waives remaining topics).

### Step 2: Echo Check

Once all 12 Discovery Checklist topics are covered (or the user has waived remaining topics), present the Echo Check using the canonical format defined in `skills/grill-me/SKILL.md` (7-section format: Problem Statement, Target Users, Core Requirements, Architectural Constraints, Key Decisions, Risk Assessment, Confidence Level).

Ask the user to confirm, correct, or expand. Do NOT proceed until confirmed.

---

## Exit Gate

Before leaving Phase 1, the agent MUST verify all of the following:

| Check | How to Verify | Required |
|-------|---------------|----------|
| All Discovery Checklist topics covered | All 12 topics covered or explicitly waived by user | Yes |
| Echo Check confirmed | User explicitly confirmed the 7-section Echo Check | Yes |

> **What counts as "explicitly waived":** A topic is explicitly waived when the user says something like "skip that", "not applicable", or "not relevant to this project." When waived, note it in the Echo Check under Confidence Level as: "Waived: [topic] — [user's reason]." A topic that was simply never discussed is NOT waived — continue the interview to cover it.

> If any exit gate check fails, do NOT proceed. Continue the interview until all checks pass.

---

## When You're Done — Transition Protocol

After the exit gate passes, follow this sequence exactly:

### Step 1: Save the Echo Check

Write the confirmed Echo Check to `docs/echo-check.md`. Create the `docs/` directory if it doesn't exist: `mkdir -p docs`. Use the canonical 7-section format defined in `skills/grill-me/SKILL.md`. This file is the required input for all Phase 2 skills — it must exist before Phase 2 begins.

### Step 2: Generate Session Summary

Create a session summary file using the template in `templates/session-summary.md`. Save it to `session-summary/YYYY-MM-DD-phase-1.md`.

The summary MUST include:

| Section | Content |
|---------|---------|
| **Session ID** | Timestamp and phase reference |
| **Objective** | "Transform project concept into validated intent with all Discovery Checklist topics covered" |
| **Outcome** | The confirmed Echo Check (7-section format from `skills/grill-me/SKILL.md`) |
| **Confirmed Requirements** | All requirements validated during the interview (purpose, scope, constraints, success criteria, user journeys, integrations, data model, edge cases, deployment) |
| **Gate Results** | All 2 exit gate checks with PASS |
| **Open Items** | Any questions, risks, or areas flagged for further investigation |
| **Next Action** | "Execute Phase 2: Specification + Eval Generation. Read this summary and use it to populate the project documents using templates in `templates/`." |

### Step 3: Present Summary to User

Show the summary and ask: *"Does this summary accurately capture our session? Ready to save and move to Phase 2?"*

If the user requests changes, revise and re-present. Do NOT proceed until approved.

### Step 4: Save and Commit

1. Create the `session-summary/` directory if it doesn't exist: `mkdir -p session-summary`
2. Save the summary file
3. Commit changes with message: `docs(phase-1): capture confirmed intent and blueprint`

### Step 5: Clear Conversation

Clear the conversation to free the context window. The confirmed intent is now captured in the session summary — the raw Q&A conversation is no longer needed.

> **Why clear here:** Phase 1 is conversational and can consume significant context with multi-round Q&A. The next session only needs the confirmed summary, not the exploration that produced it.
