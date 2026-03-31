# Phase 3: Subtask Execution + Eval Validation

> **Goal:** Execute a single subtask using TDD, validate against evals, and update project state.

> **Mode:** Active — agent executes per session. This phase orchestrates the `/tdd` skill for implementation.

---

## Entry Gate

Before starting work, the agent MUST verify:

| Check | How to Verify | Required |
|-------|---------------|----------|
| `claude.md` exists | File present and readable | Yes |
| `roadmap.json` exists | File present and readable | Yes |
| `docs/evals.json` exists | File present and readable | Yes |
| Next task identified | At least one task has status `"Not Started"` or `"In Progress"` | Yes |
| Dependencies met | All tasks in this task's `depends_on` array have status `"Completed"`. If any dependency has status `"In Progress"`, `"Blocked"`, or `"Not Started"`, this task cannot proceed — do not assume the dependency will complete on its own. Escalate per `error-protocol.md`. | Yes |
| Wave ready | All tasks from prior waves are `"Completed"` (check `execution_plan.waves` in `roadmap.json`) | Yes |
| Session summary from prior session exists | If not the first subtask, prior session's summary is accessible. **For the first subtask:** read the Phase 2 session summary using this algorithm: search `session-summary/` for files matching `*phase-2c*` and use the most recent by filename date. If no Phase 2c file exists, search for `*phase-2b*`, then `*phase-2a*`. If none of these exist, halt and report: "Phase 2 session summary not found. Phase 2 must complete before Phase 3 can start." | Yes |
| GitHub issue exists | Task's `issue_number` references a valid open issue | If GitHub available |
| Team context | If this task has an `agent_assignment` in `roadmap.json`, verify team config is accessible | Yes |

> If any check fails, report what is missing and STOP. Do not attempt to work around the gap. See `error-protocol.md` for the error handling and escalation protocol.

### Determine Execution Mode

After the entry gate passes, determine which execution mode you are in before starting work. See the **Execution Mode** section below for the decision table. Your mode affects:
- Whether you update `roadmap.json` directly (Solo) or report to an orchestrator (Team)
- Whether you merge branches (never in Team or Bash) or work on main (Solo)
- Your communication protocol (SendMessage in Team, session summary notes in Bash, direct in Solo)

Identify your mode now and follow the corresponding constraints throughout execution.

---

## Execution

### Step 1: Load Context

1. Read `claude.md` for project overview and conventions
2. Read `roadmap.json` and locate the target task for your specific instructions
3. Read `docs/evals.json` and locate the Eval IDs listed for this task — these are your test cases
4. Read any files listed under `context_needed` for this task
5. **Fetch parent PRD/issue context** — `[GitHub Optional]` if `gh` is available, read the parent PRD GitHub issue (`gh issue view <prd-issue-number>`) and this task's GitHub issue (`gh issue view <issue_number>`) for full context on requirements and blocking relationships. If `gh` is unavailable, read the task's `scope`, `acceptance_criteria`, and `agent_instructions` from `roadmap.json` directly.
6. **Apply mode constraints** — review the Execution Mode section for your identified mode's Constraints, Communication, and Failure handling rules

### Step 2: Implement with TDD

Invoke the `/tdd` skill from `skills/tdd/SKILL.md`.

The skill executes the red-green-refactor cycle:
- **Planning**: Confirm interface changes and behaviors to test with the user
- **Tracer bullet**: Write ONE test, verify it FAILS, then implement to pass
- **Incremental loop**: One test at a time -- each must fail before implementation
- **Refactor**: Clean up while keeping tests green

Each stage produces its own commit:
- RED: `test(task-[X.Y]): add failing tests for [description]`
- GREEN: `feat(task-[X.Y]): implement [description]`
- REFACTOR: `refactor(task-[X.Y]): [description]` (optional)

### Step 3: Validate Against Evals

After the TDD cycle completes, validate the implementation against the eval suite. This section defines exactly how evals map to tests and when they run.

#### Eval Validation Mechanics

**3a. Identify task evals** — Read `roadmap.json` and locate the current task's `eval_ids` array. These are the eval IDs this task must satisfy (e.g., `["FE-001-HP-01", "FE-001-EC-01", "INT-002"]`).

**3b. Locate test files** — For each eval ID, look up the corresponding entry in `docs/evals.json` (search across `feature_evals`, `integration_evals`, and `non_functional_evals`). Check the eval's `test_file` field:
- If `test_file` is populated: the test file already exists at that path (the `/tdd` skill populates `test_file` during the RED stage). Verify it is present on disk.
- If `test_file` is empty or null: the `/tdd` skill should have populated this during RED. If it is still null, this indicates a missed step — locate the test file written during RED and update the eval's `test_file` field as a recovery action.

> **Note:** The `/tdd` skill owns `test_file` population (see `skills/tdd/SKILL.md`). Phase 3 only verifies that the field was set correctly.

**3c. Verify coverage** — Every eval ID in the task's `eval_ids` array must have a non-empty `test_file` that exists on disk. If any eval lacks a test file, write the missing test before proceeding.

**3d. Run task evals** — Execute the test files identified in step 3b. Use the project's test runner (e.g., `npx playwright test <test-file>` for E2E tests, or the project's unit test command). Each eval is either passing or failing based on test results.

**3e. Run regression evals** — Identify all previously passing evals (status `"PASS"` in `docs/evals.json`) whose `test_file` tests components you modified. Specifically:
1. List all files you modified during the TDD cycle (from your git diff)
2. Search `docs/evals.json` for any eval with status `"PASS"` whose `test_file` imports or tests those files
3. Re-run those test files to confirm they still pass

**3f. Update `docs/evals.json`** — Set each tested eval's status to `"PASS"` or `"FAIL"` and update the `summary` counts (`passing`, `failing`, `not_yet_tested`). Note: `test_file` fields should already be populated by `/tdd` during RED — verify they are set, and populate as a recovery action if any were missed.

> **Failure handling:** If any task eval fails after GREEN, the implementation has a bug — fix the code (not the test) and re-run. If a regression eval fails, your changes broke existing functionality — fix before proceeding. If a fix fails after 2 attempts, escalate per `error-protocol.md`.

> **Eval-is-wrong escalation:** If you determine the eval itself is incorrect (wrong expected output, invalid input, outdated requirement), do NOT modify the eval to make tests pass. Instead: (1) document why the eval is wrong, (2) escalate to the user with eval ID, analysis, and proposed correction, (3) wait for confirmation before deprecating and replacing. See `error-protocol.md` "Incorrect eval" error type.

### Step 4: Update GitHub Issue [GitHub Optional]

If `gh` is available, update the task's GitHub issue to reflect completion:
- Add a comment summarising what was implemented, test results, and any deviations from the plan
- Do NOT close the issue yet -- issue closure happens in Phase 4 (solo/bash mode) or during the orchestrator's wave transition SYNC ISSUES step (agent-team mode). See `github-issue-sync.md` Section 6.3.

If `gh` is unavailable, skip this step. The information is captured in `roadmap.json` and the session summary.

---

## Test Protection Rules

**It is unacceptable to remove, delete, skip, or weaken existing tests or eval scenarios.**

- Never delete a test to make a test suite pass
- Never edit a test's expected values to match broken behaviour
- Never comment out or skip a failing test
- If a test fails, fix the code — not the test
- If a requirement genuinely changed, deprecate the old eval (set status to `"DEPRECATED"`, add a `change_log` entry explaining why) and create a new eval reflecting the new requirement

---

## E2E Testing Protocol

When eval validation requires testing through a user interface, use the project's configured test runner as specified in `execution_plan.test_command` in `roadmap.json`.

- Tests must open the browser, navigate to pages, click buttons, fill in forms, and verify what appears on screen
- Do NOT mock browser interactions or substitute UI tests with API-only checks
- If a test fails, capture screenshots or traces for debugging
- For tests requiring precondition data, create it through the same UI flows a real user would use

---

## Exit Gate

> This gate validates **code correctness** (tests pass, commits exist). Phase 4's gate validates **documentation completeness** (roadmap, evals, session summary updated).

Before handing off to Phase 4, the agent MUST verify all of the following. If any check fails, fix the issue before proceeding. Do NOT hand off to Phase 4 with unresolved items.

| Check | How to Verify | Required |
|-------|---------------|----------|
| TDD commits exist | At least a RED commit (`test(task-X.Y): ...`) and a GREEN commit (`feat(task-X.Y): ...`) exist on the current branch | Yes |
| All task evals pass | Every eval ID assigned to this task in `roadmap.json` has a corresponding test file and all tests pass | Yes |
| No regressions | All previously passing evals still pass — re-run any evals that touch components modified by this task | Yes |
| GitHub issue updated | Task's GitHub issue has a comment summarising implementation and test results | If GitHub available |
| No orphaned work | No incomplete TODOs, uncommitted changes, or work outside the task scope remain | Yes |

> **Recovery:** If a check fails, fix the issue within Phase 3 — do not pass a failing state to Phase 4. If a fix fails after 2 attempts, report the failure to the orchestrator (team mode) or escalate to the user (solo mode) before proceeding. See `error-protocol.md` for the escalation protocol.

---

## Execution Mode

### How to Know Which Mode You're In

| Condition | Mode |
|-----------|------|
| You were spawned by an orchestrator via Agent tool / SendMessage | **Mode A: Team Implementer** |
| You are running in a git worktree created by a bash script | **Mode B: Bash-Script Parallel** |
| Neither of the above | **Mode C: Solo** |

### Mode A: Team Implementer

You were spawned by an orchestrator as part of an agent team (see `agent-teams.md`).

**Constraints:**
- Work only within your assigned worktree branch
- Do NOT merge to main — the orchestrator handles wave transitions
- Do NOT update `roadmap.json` — the orchestrator is the sole writer

**Communication:**
- Report TDD stage completions to the orchestrator via SendMessage
- Report blockers immediately via SendMessage
- On task completion (or failure), send the structured completion payload — see `agent-teams.md` Section 5.2 for the exact format

**Failure handling:**
- If implementation fails after 2 attempts, set `status: "blocked"` in the SendMessage payload and include the `blockers` list describing what failed and why. The orchestrator will decide whether to reassign, escalate, or defer the task.

### Mode B: Bash-Script Parallel

Multiple tasks from the same execution wave running simultaneously in separate agent sessions using git worktrees (see `workflow-automation.md`).

**Constraints:**
- Work only within your assigned worktree branch (`task-[X.Y]`)
- Do NOT merge to main — the wave transition protocol handles merges

**Communication:**
- Note which wave you are part of in your session summary

**Failure handling:**
- If you discover an unanticipated dependency on a task in the same wave, STOP and escalate to the user

### Mode C: Solo

No special parallel execution constraints. Follow the standard Phase 3 TDD cycle and handoff protocol. You write `roadmap.json` directly.

---

## When You're Done

1. **Run the Exit Gate above** — all checks must pass before proceeding
2. **Follow the handoff protocol** in `phases/phase-4-handoff-protocol.md` — it is the single authoritative checklist for updating project docs, committing, generating the session summary, and clearing the conversation
