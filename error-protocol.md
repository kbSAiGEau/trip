# Error Protocol

> Shared error handling rules for all execution modes. This file is the authoritative source for error types, escalation rules, and error logging that apply regardless of whether the project uses agent teams, bash-script parallelism, or solo execution.

> **Navigation:** For framework overview, see `CLAUDE.md`. For agent-team-specific errors (teammate crash, merge conflict, orchestrator recovery), see `agent-teams.md` Section 7. For execution-model-specific errors (regression unfixable triggering rollback), see `workflow-automation.md` Section 4.

---

## 1. Core Error Types

When a gate check fails or an unexpected condition is encountered, the agent follows this protocol. The agent MUST NOT silently work around errors — every failure is reported.

| Error | Detection | Agent Response |
|-------|-----------|----------------|
| **Missing document** | Required file does not exist on disk | Report which file is missing, which phase generates it, and whether the prior phase needs to be re-run. **Block transition.** |
| **Incomplete document** | File exists but required sections contain only placeholder/template text | Report which sections are incomplete. List the specific placeholders found. **Block transition.** |
| **Failed evals** | One or more eval scenarios have status "Failing" | List each failing eval with its ID, scenario, expected output, and actual output. Attempt to fix. If fix fails after 2 attempts, **escalate to user.** (eval failures may be logic errors requiring two fix cycles — RED→GREEN attempt 1, then diagnose + attempt 2) |
| **Incorrect eval** | Eval scenario has wrong expected output, invalid input, or outdated requirement. Agent has attempted fix twice and believes the eval -- not the code -- is wrong. | Report eval ID, expected vs actual output, and why you believe the eval is wrong. Include proposed correction. **Escalate to user.** Do NOT deprecate/modify without confirmation. Once confirmed: deprecate old eval, create corrected replacement, re-run. |
| **Missing session summary** | No summary file exists for the prior session | Warn user that context from the prior session may be lost. Attempt to reconstruct context from `roadmap.json` and `claude.md`. Flag any gaps. **Allow transition with warning.** |
| **Stale roadmap** | Task marked "In Progress" but `claude.md` shows a different current status | Report the inconsistency. Ask user which state is correct. **Block transition until resolved.** |
| **Dependency not met** | Task's "Depends On" references a task that is not Completed | Report the blocking dependency. Identify the blocked task and its prerequisite. **Block transition.** |
| **Summary save failure** | File write to `session-summary/` fails | Retry once. If retry fails, output the full summary text to the conversation and instruct user to save it manually. **Block conversation clear.** (file write failures are usually transient; if it fails twice, the environment has a problem that retrying won't solve — escalate) |
| **Commit failure** | `git commit` returns an error | Report the error message. Common causes: pre-commit hook failure (fix and re-commit), merge conflict (flag to user), unstaged files (stage and retry). **Block transition until resolved.** |
| **Task blocked** | Next task in `roadmap.json` has status `"Blocked"` | Read the task's `completion_notes` for the blocking reason. If the blocker is a dependency, check its status. If the blocker requires user input, **escalate to user.** Skip to the next `"Not Started"` task only if there is one with no blocking dependencies. |
| **Task deferred** | Task has status `"Deferred"` | Skip the task and move to the next `"Not Started"` task. Do not attempt to execute deferred tasks. If all remaining tasks are `"Deferred"`, report to user and **stop.** |
| **Session crash (mid-execution)** | `roadmap.json` has tasks with status `"In Progress"` at session start | Follow the mode-specific recovery procedure in `workflow-automation.md` Section 4.2 (solo/bash) or `agent-teams.md` Section 7.1 (team). **Block new work until recovery complete.** |
| **Circular dependency** | Task A depends on Task B and Task B depends on Task A (directly or transitively). Detection method: traverse each task's `depends_on` array recursively. If you visit a task ID already in the current traversal path, a cycle exists. Report the full chain (e.g., "1.2 → 1.4 → 1.2"). | Report the dependency cycle with full chain (e.g., "1.2 → 1.4 → 1.2"). This is a Phase 2 planning error. **Block transition.** Escalate to user to break the cycle by removing or reordering dependencies in `roadmap.json`. |
| **Orphaned branch/worktree** | `git worktree list` shows worktrees for tasks not in the current wave, or `git branch` shows `feature/task-X.Y` branches for completed/deferred tasks | Clean up: `git worktree remove <path>` and `git branch -d <branch>`. Log the cleanup in the session summary. If the branch has unmerged commits, **escalate to user** before deleting. |
| **Malformed roadmap.json** | `roadmap.json` fails JSON parsing or does not validate against `templates/roadmap.schema.json` | Report the specific validation error. Attempt to fix obvious issues (trailing comma, missing required field). If severely broken, **escalate to user.** |
| **Malformed evals.json** | `docs/evals.json` fails JSON parsing or does not validate against `templates/evals.schema.json` | Same as malformed roadmap.json — report, attempt fix, escalate if severe. |

---

## 2. Escalation Protocol

If the agent cannot resolve an error after 2 attempts:

1. **Stop work** — Do not continue building or modifying code
2. **Report** — Present the error clearly:
   - What failed (specific gate check or operation)
   - What was tried (the 2 fix attempts and their outcomes)
   - What is needed (specific action the user must take)
3. **Wait** — Do not proceed until the user provides direction
4. **Resume** — Once the user resolves the issue, re-run the failed gate check before continuing

---

## 3. Error Log

**Location:** Errors are logged in the **session summary** file for the current session (`session-summary/YYYY-MM-DD-task-X.Y.md`). There is no separate error log file. The session summary template (`templates/session-summary.md`) includes an "Errors Encountered" section — populate it with every error hit during the session.

If the session crashes before a summary can be written, the next session's recovery procedure (see `workflow-automation.md` Section 4.2) reconstructs what happened from git history and `roadmap.json` state.

**Format:**

| Timestamp | Error Type | Details | Resolution |
|-----------|-----------|---------|------------|
| 14:32 | Missing document | `docs/evals.json` not found | Re-ran Phase 2 eval generation |
| 15:01 | Failed eval | FE-002-HP-01 expected 200, got 404 | Fixed route mapping in router.ts |
