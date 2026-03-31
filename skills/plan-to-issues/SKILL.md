---
name: plan-to-issues
description: Turn a phased implementation plan (from prd-to-plan) into independently-grabbable GitHub issues. Use when user has a plan file and wants to create implementation tickets, convert phases to issues, or break a plan into trackable work items.
---

# Plan to Issues

Turn a phased implementation plan into independently-grabbable GitHub issues. This skill expects you have already run `prd-to-plan` and have a plan file in `./plans/`.

## Input / Output

| | File | Description |
|---|---|---|
| **In** | `plans/<feature>.md` | Implementation plan from /prd-to-plan |
| **In** | `roadmap.json` | Current roadmap (if exists) |
| **Out** | GitHub Issues | Created issues linked to plan phases |
| **Out** | `roadmap.json` | Updated with issue references |

## Process

### 1. Locate the plan and PRD

Ask the user which plan file to use (e.g. `./plans/user-onboarding.md`). Read it to understand the phases, architectural decisions, and acceptance criteria.

If the parent PRD exists as a GitHub issue, ask for the issue number so issues can reference it.

### 2. Map phases to issues

Each phase in the plan becomes one or more GitHub issues. For each phase:

- Carry forward the **acceptance criteria** already defined in the plan
- Carry forward the **user stories** already mapped in the plan
- Classify as **HITL** (requires human input — architectural decision, design review) or **AFK** (can be implemented and merged without human interaction). Prefer AFK where possible. Store the classification in the task's `execution_type` field in `roadmap.json` (`"AFK"` or `"HITL"`).
- Identify **blockers** — which phases/issues must complete first based on the plan's phase ordering

If a phase is too large for a single issue, split it into sub-issues while preserving the vertical slice property (each issue still cuts through all layers end-to-end).

### 3. Quiz the user

Present the proposed issue breakdown as a numbered list. For each issue, show:

- **Title**: short descriptive name
- **Plan phase**: which phase(s) it maps to
- **Type**: HITL / AFK
- **Blocked by**: which other issues (if any) must complete first
- **User stories covered**: carried from the plan

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any issues be merged or split further?
- Are the correct issues marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 4. Create the GitHub issues

**Pre-flight: authenticate with GitHub CLI.** Run `gh auth status`. If it fails, halt: "GitHub CLI is not authenticated. Run `gh auth login` and retry." Do not proceed without confirmed authentication.

For each approved issue, create a GitHub issue using `gh issue create`. Use the issue body template below.

Create issues in dependency order (blockers first) so you can reference real issue numbers in the "Blocked by" field.

<issue-template>
## Parent PRD

#<prd-issue-number> (if applicable)

## Plan reference

Phase <N> of `./plans/<plan-file>.md`

## Architectural context

Reference the relevant architectural decisions from the plan that apply to this issue (routes, schema, models, etc.). Do not duplicate — point to the plan file.

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation. This should align with the "What to build" section from the corresponding plan phase.

## Acceptance criteria

Carried from the plan, refined if the phase was split:

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by #<issue-number> (if any)

Or "None - can start immediately" if no blockers.

## User stories addressed

Reference by number from the parent PRD:

- User story 3
- User story 7

</issue-template>

Do NOT close or modify the parent PRD issue.

### 5. Update roadmap.json with issue references

> **Two execution modes:** (a) **Post-Phase-2 (normal):** `roadmap.json` was created by Phase 2 Step 5 Order 1 and must exist — if it is missing, halt and ask the user to re-run Phase 2. (b) **Standalone invocation:** If `/plan-to-issues` is invoked independently (outside the Phase 2 chain), `roadmap.json` is optional — issues will be created without roadmap linking, and a warning will be logged.

After all issues are created, update `roadmap.json` to link each task to its GitHub issue:

1. For each created issue, find the corresponding task in `roadmap.json` by matching the plan phase and task name
2. Set `issue_number` to the GitHub issue number returned by `gh issue create`
3. If a PRD parent issue was created, set the top-level `prd_issue_number` field

This step ensures `roadmap.json` is the single source of truth linking tasks to their GitHub issues, whether the skill is invoked standalone or as part of Phase 2.

## Phase Integration

- **Phase 2 (Specification)**: This skill is invoked at Step 7 of Phase 2. The roadmap update in Step 5 above satisfies Phase 2's requirement to link issues to `roadmap.json` -- Phase 2 does not need to duplicate this step.
- **Standalone**: Can be invoked independently whenever a plan exists and GitHub issues are needed. Step 5 ensures `roadmap.json` stays in sync regardless of invocation context.
