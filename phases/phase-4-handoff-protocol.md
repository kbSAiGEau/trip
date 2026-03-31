# Phase 4: Handoff Protocol (Per-Subtask)

> **Goal:** Ensure seamless transitions between agent sessions by generating a session summary, verifying completeness, and preparing the next session to pick up without re-reading the full conversation.

> **Mode:** Passive — this phase runs automatically at the end of **every Phase 3 subtask** session. One subtask = one Phase 3 + one Phase 4 cycle. Wave transitions (merge, regression, issue sync) are a separate protocol — see `wave-execution.md` Section 2.

> **Authority:** This is the single authoritative checklist for wrapping up any subtask. Phase 3's prompt defers here — do not look for a separate "When You're Done" checklist elsewhere.

---

## Step 1: Update Project Documents

Update the following files to reflect the completed work:

> **Team Implementer Mode:** If you are a team implementer, skip updating `roadmap.json` directly. Instead, send your completion data to the orchestrator via SendMessage. The orchestrator is the sole writer of `roadmap.json`. Still update `docs/evals.json` and your local copy of `claude.md`.

### `roadmap.json`
- Set the current task's status to `"Completed"`
- Fill in `completion_notes` with what was done and any deviations from the plan
- Fill in `eval_results` — each eval ID with PASS/FAIL
- Fill in `files_touched` with all files created or modified
- Fill in `test_files` with all test files scaffolded during the RED stage
- Set `completed` timestamp
- Append an entry to the `completion_log`
- Verify `issue_number` is present and correct for the completed task
- Review the next task — if your work changes its scope, update accordingly
- If the next task is no longer needed, set its status to `"Deferred"` with explanation
- If the next task cannot proceed, set its status to `"Blocked"` with explanation

### `docs/evals.json`
- Set each tested eval's status to `"PASS"` or `"FAIL"`
- Verify each eval's `test_file` field points to the correct test file path
- If you added new evals during implementation, append them to the relevant section
- Add entries to the `change_log` using this format:
  ```json
  {"date": "YYYY-MM-DD", "task_id": "X.Y", "change_type": "CREATED|UPDATED|DEPRECATED|STATUS_CHANGE", "description": "..."}
  ```
- Update the summary counts (`passing`, `failing`, `not_yet_tested`)

### `claude.md`
- Update the "Current Status" section
- Update "How to Continue" if the next steps have changed

---

## Step 2: Sync GitHub Issue Status

Update the task's GitHub issue to reflect completion. The exact actions depend on your execution mode:

### Solo / Bash-script mode

1. **Close the issue** with `gh issue close <issue_number>`
2. **Add a completion comment** to the issue summarising:
   - What was implemented
   - Eval results (PASS/FAIL counts)
   - Files modified
   - Any deviations from the original plan
   - Link to the session summary file
3. **Update the parent PRD issue** with a progress comment if this task advances a significant milestone

### Agent team mode (implementer)

1. **Add a completion comment** to the issue summarising what was implemented, eval results, files modified, deviations, and session summary path. Use `gh issue comment <issue_number>`.
2. **Do NOT close the issue** — the orchestrator closes issues during wave transition (see `agent-teams.md` Section 4.3 and `wave-execution.md` Section 2, step 5).
3. Do NOT update the parent PRD issue — the orchestrator handles that at wave completion.

---

## Step 3: Validate (Exit Gate)

> This gate validates **documentation completeness** (roadmap, evals, session summary updated). Phase 3's gate validates **code correctness** (tests pass, commits exist).

Before proceeding, the agent MUST verify ALL of the following. If any check fails, go back and fix it. Do NOT generate the session summary with unresolved items.

### Core Gates (always required)

| Check | How to Verify | Required |
|-------|---------------|----------|
| All acceptance criteria met | Task's acceptance criteria in `roadmap.json` are satisfied | Yes |
| All task evals PASS | Every eval ID assigned to this task has status `"PASS"` in `docs/evals.json` | Yes |
| No regressions | All previously passing evals still pass | Yes |
| `roadmap.json` updated | Task status, completion notes, eval results, files touched, `issue_number` all filled. **Team mode:** this check is satisfied by the orchestrator after it receives the implementer's completion payload — the implementer does not write `roadmap.json` directly. | Yes |
| `docs/evals.json` updated | Eval statuses current, new evals logged, summary counts updated | Yes |
| `claude.md` updated | Current Status and How to Continue reflect latest state | Yes |
| No orphaned work | No incomplete TODOs or work outside the task scope | Yes |
| Next task accurate | The next task in `roadmap.json` is still accurate and actionable | Yes |

### GitHub Gates (if `gh` CLI is available)

> Skip this section if `gh` is not installed or not authenticated. Run `gh auth status` to check. See `github-issue-sync.md` for details.

| Check | How to Verify | Required |
|-------|---------------|----------|
| GitHub issue synced | **Solo/bash:** Task's GitHub issue is closed with completion comment. **Team mode:** Completion comment added; orchestrator closes at wave transition. | If GitHub available |

---

## Step 4: Commit

The TDD cycle produces up to 3 commits during execution. At handoff, verify they exist and create any final commit needed:

- **Expected commits from TDD cycle:**
  - `test(task-X.Y): add failing tests for [description]` — from RED stage
  - `feat(task-X.Y): implement [description]` — from GREEN stage
  - `refactor(task-X.Y): [description]` — from REFACTOR stage (optional)
- **Handoff commit:** Stage `roadmap.json`, `docs/evals.json`, `claude.md`, and any remaining modified files
  - Use commit message: `docs(task-X.Y): update project docs after completion`

---

## Step 5: Generate Session Summary

Generate a session summary using the template in `templates/session-summary.md`. The template defines all required sections — follow it exactly.

Include the GitHub issue number and closure status in the summary.

---

## Step 6: PRESENT

Show the session summary to the user and ask:
> *"Does this summary accurately capture the session? Ready to save and clear?"*

If the user requests changes, revise and re-present. Do NOT proceed until approved.

---

## Step 7: SAVE

1. Create `session-summary/` directory if it doesn't exist: `mkdir -p session-summary`
2. Save the summary with a timestamped filename: `session-summary/YYYY-MM-DD-task-X.Y.md`
3. Commit the summary

---

## Step 8: End Session

> **Scope clarification:** Steps 1-7 above run after every subtask in every mode. Step 8 below determines what happens next — which depends on whether the wave is complete and which execution mode is in use. The Wave Transition Protocol in `wave-execution.md` Section 2 runs only when ALL tasks in the current wave are done.

How you end the session depends on your execution mode:

### Solo / Bash-script mode

Clear the conversation to free the context window for the next subtask.

**Wave transitions are handled by the centralized wave transition script, not by individual agents.** After saving your session summary and committing your work to your task branch, your job is done. Do NOT merge to main manually. Do NOT run regression tests — the wave transition script handles both.

**If more tasks remain in the current wave (bash-script parallelism):**
- Other agents in the same wave may still be running — your work on this task is complete; clear your context and exit.
- The wave transition script will merge all branches, run the full regression, sync GitHub issues, and gate to the next wave automatically once all agents in the wave finish.

**If this was the last task in the wave (bash-script mode):**
- The wave transition script detects completion and runs automatically — you do not need to invoke it.
- See `wave-execution.md` Section 2 for how the script operates.

**Next session:** Follow the Pickup Sequence in `workflow-automation.md` Section 2.2 to orient and start the next task.

### Agent Team mode

Send the completion payload to the orchestrator via SendMessage using the format in `agent-teams.md` Section 5.2 (include eval results, files modified, and session summary path). Then **WAIT for `shutdown_request`** from the orchestrator.

**Do NOT clear your own context or shut down independently.** Wave transitions are handled by the centralized wave transition script, invoked by the orchestrator — not by individual agents. The orchestrator handles wave transition, merges, regression, and `roadmap.json` updates. It sends `shutdown_request` when the wave transition is complete. See `agent-teams.md` for the full agent team protocol.
