# Session Summary: [Phase/Task Reference]

> **Session ID:** [YYYY-MM-DD — Phase X, Task Y.Z]
> **Task ID:** [X.Y — from roadmap.json, e.g., "1.2". Use "N/A" for Phase 1/2 sessions that are not task-specific]
> **Roadmap Reference:** `roadmap.json` → `tracks[T].tasks[N]` where task `id` = "[X.Y]"
> **Date:** [YYYY-MM-DD]
> **Duration:** [approximate session duration]
> **Checkpoint Stage:** [N/A] <!-- Used during Phase 2 sub-sessions only. Values: 2a, 2b, 2c. -->

<!--
PROJECT CUSTOMISATION:
- This template works as-is for all project types
- Add project-specific sections if needed (e.g., "Deployment Notes" for infra tasks, "Migration Status" for data projects)
- The Errors Encountered section is optional — include only if errors occurred during the session
-->

---

## Team Context (Agent Team Sessions Only)

<!-- Include this section only when running as part of an agent team. Remove otherwise. -->

- **Team:** [team name from execution_plan.team_config.team_name]
- **Role:** [orchestrator / implementer / reviewer]
- **Agent Name:** [teammate name, e.g., impl-1.2]
- **Wave:** [wave number]
- **Parallel Tasks:** [list of other task IDs running in this wave]

---

## Objective

<!-- What this session set out to accomplish. Copy from the task's scope in roadmap.json. -->

## Outcome

<!-- What was actually accomplished. Include:
- Key decisions made and their rationale
- Code/artifacts produced
- Any deviations from the original plan and why
-->

## Confirmed Requirements (Phase 1 Only)

<!-- Include this section only for Phase 1 sessions. Remove for Phase 3 subtask sessions. -->

### Echo Check
- **Key Deliverable:** [one sentence — what will be built]
- **Critical Fact:** [the most important constraint or requirement]
- **Hardest Problem:** [the most technically challenging aspect]

### Blueprint
- **Architecture:** [high-level component summary]
- **Tech Stack:** [approved technologies]
- **Top Risks:** [numbered list of risks and mitigations]
- **Complexity:** [S/M/L]

### Requirements Summary
<!-- Organised summary of all validated requirements from the Clarify Loop -->

---

## TDD Cycle (Phase 3 Subtask Sessions Only)

<!-- Include this section only for Phase 3 subtask sessions. Remove for Phase 1/2 sessions. -->

### RED — Tests Written
<!-- List the test files scaffolded from eval scenarios before implementation -->

| Test File | Eval IDs Covered | Initial Result |
|-----------|-----------------|----------------|
| `tests/[test-file].spec.ts` | [FE-001-HP-01, FE-001-EC-01] | FAIL (expected) |

### GREEN — Implementation
<!-- What code was written to make the failing tests pass -->

| Test File | Final Result | Notes |
|-----------|-------------|-------|
| `tests/[test-file].spec.ts` | PASS | |

### REFACTOR — Clean Up
<!-- Any refactoring done while keeping tests green. Write "None — no refactoring needed" if skipped. -->

| Refactoring | Files Changed | Tests Still Green |
|-------------|---------------|-------------------|
| [Description of refactoring] | `src/utils/validate.ts`, `src/services/auth.ts` | Yes |

---

## Eval Results

<!-- List each eval ID tested during this session with its status -->

| Eval ID | Scenario | Result | Notes |
|---------|----------|--------|-------|
| [FE-001-HP-01] | [scenario name] | PASS | |
| [FE-001-EC-01] | [scenario name] | PASS | |

**Regression Check:** [All previously passing evals still pass / List any regressions found and fixed]

---

## Gate Results

<!-- List each exit gate check with PASS/FAIL -->

| Gate Check | Status |
|------------|--------|
| [Check 1] | PASS |
| [Check 2] | PASS |

---

## Files Modified

<!-- List every file created, modified, or deleted -->

| File | Action |
|------|--------|
| `src/example.ts` | Created |
| `roadmap.json` | Modified |
| `docs/evals.json` | Modified |

---

## Open Items

<!-- Questions, risks, or blockers discovered but not resolved in this session.
     These MUST be visible to the next session so they aren't lost. -->

- [ ] [Open item 1 — what needs to happen and who can resolve it]
- [ ] [Open item 2]

> If there are no open items, write "None — all items resolved."

---

## Errors Encountered

<!-- This section IS the error log for the session. See error-protocol.md Section 3. -->
<!-- Include this section only if errors occurred. Omit entirely if the session was error-free. -->

| Timestamp | Error Type | Details | Resolution |
|-----------|-----------|---------|------------|
| [HH:MM] | [error type] | [what happened] | [how it was resolved] |

---

## Next Action

<!-- Exact instruction for the next session. Be specific — reference the task number, phase, and any prerequisites. -->

**Next:** Execute **Task [X.Y]: [Task Name]** from `roadmap.json`.

**Prerequisites for next session:**
- [Any setup or context the next agent needs]
- [Any open items that should be resolved first]
