# Agent Teams Protocol

> The primary execution protocol for Phase 3 parallel task execution within the Agentic Workflow Prompt Framework. Agent teams provide real-time coordination, role specialisation, and dynamic task reassignment for parallel wave execution.

> **Navigation:** For framework overview, see `CLAUDE.md`. For wave computation rules, see `wave-execution.md`. For alternative execution models (solo, headless loop, bash parallelism), see `workflow-automation.md`.

---

## 1. Overview

### What Agent Teams Provide

Agent teams are the standard execution model for Phase 3 when multiple tasks can run in parallel. An AI orchestrator manages specialist agents using Claude Code's native Agent SDK (TeamCreate, SendMessage, Agent tool), providing:

- **Real-time specialist coordination** — implementers report progress and blockers via messages, not just exit codes
- **Dynamic task reassignment** — if one agent finishes early, the orchestrator assigns it the next available task
- **Intelligent conflict resolution** — merge conflicts are handled by agents with full context, not script failures
- **Native orchestration** — no bash scripts, PID management, or `jq` dependency

For simpler scenarios (single developer, linear execution, fully unattended overnight runs), alternative execution models are available in `workflow-automation.md`.

---

## 2. Agent Role Definitions

### 2.1 Orchestrator

The orchestrator is the primary interactive session. It manages the team lifecycle but does **not** write implementation code.

**Responsibilities:**
- Read `roadmap.json` and identify the current wave
- Create the team via TeamCreate
- Create git worktrees for each task in the wave
- Spawn implementer agents and assign tasks
- Monitor progress via incoming SendMessage notifications
- Handle blockers and escalate to the user when needed
- Reassign tasks dynamically if an implementer finishes early
- Run the wave transition protocol (merge, regression, gate) after all tasks complete
- **Sole writer of `roadmap.json`** — implementers report status via messages; the orchestrator writes updates

**Agent configuration:** Full capability (subagent_type: `general-purpose`)

### 2.2 Implementer

An implementer executes a single task from `roadmap.json` following the Phase 3 TDD cycle (RED → GREEN → REFACTOR). Each implementer works in its own git worktree.

**Responsibilities:**
- Execute the assigned task using the Phase 3 subtask execution prompt
- Work exclusively within the assigned worktree branch (`feature/task-X.Y`)
- Report TDD stage completions to the orchestrator via SendMessage
- Report blockers immediately via SendMessage
- Generate a session summary per Phase 4 (saved locally in the worktree)
- Do **not** write to `roadmap.json` — the orchestrator handles that
- Do **not** merge to main — the orchestrator handles wave transitions

**Agent configuration:** Full capability (subagent_type: `general-purpose`), spawned with `isolation: "worktree"` or into a pre-created worktree

### 2.3 Reviewer

A read-only agent that reviews code after the GREEN stage. Required for complex tasks; optional otherwise.

**Review criteria:**
- (a) Acceptance criteria from `roadmap.json` — are they met?
- (b) Eval coverage — does the implementation satisfy linked eval IDs?
- (c) Deep module principles — see `skills/tdd/deep-modules.md`
- (d) Interface design — see `skills/tdd/interface-design.md`
- (e) Project conventions — see `claude.md`

**Structured result:**
- **APPROVE** — task passes review, proceed to REFACTOR
- **REQUEST_CHANGES** — specific items that must be addressed before REFACTOR (implementer fixes, reviewer re-reviews; maximum 2 review rounds before escalating to user)
- **ESCALATE** — architectural concern requiring user input

**Required gate:** For complex tasks (> 5 files touched or > 3 acceptance criteria), reviewer approval is a **required gate** before REFACTOR.

**Responsibilities:**
- Review the implementer's code against the criteria above
- Report structured findings via SendMessage to both the implementer and orchestrator
- Does **not** modify code — reviews only

**Agent configuration:** Read-only (subagent_type: `Plan` or `Explore`), can SendMessage

### 2.4 Custom Roles

Projects can define custom agent roles in the `.claude/agents/` directory. Each custom agent gets a role-specific system prompt and tool configuration.

**Examples:**
- `database-specialist.md` — for migration-heavy tasks, knows the data model
- `frontend-specialist.md` — for UI tasks, knows the design system
- `test-runner.md` — dedicated to running and analysing test suites

Custom agents are referenced by filename when spawning via the Agent tool's `subagent_type` parameter.

### 2.5 Tool Access by Role

| Role | Bash Access | CLI Tools Available |
|------|-------------|-------------------|
| Orchestrator | Yes | All — especially git (worktrees, merges), jq (roadmap parsing), Playwright (regression) |
| Implementer | Yes | All — especially Playwright (TDD tests), project-specific CLIs (supabase, vercel) |
| Reviewer | **No** | None — read-only agents use Plan/Explore subagent_type which excludes Bash |
| Custom agents | Depends on `.claude/agents/` configuration | Check agent definition for tool restrictions |

---

## 3. Team Composition Patterns

### 3.1 Solo (Default)

Single agent, no team primitives. Uses existing Phase 3 prompt and alternative execution models from `workflow-automation.md`. No changes to current behaviour.

```
┌─────────┐
│  Agent   │──── task ──── worktree
└─────────┘
```

### 3.2 Wave Team (Recommended)

1 orchestrator + N implementers (N = wave size, max 3). The orchestrator reads `roadmap.json`, creates a team, and spawns one implementer per task in the current wave.

```
┌──────────────┐
│ Orchestrator  │
└──────┬───────┘
       ├──── Implementer 1 ──── feature/task-1.1 worktree
       ├──── Implementer 2 ──── feature/task-1.2 worktree
       └──── Implementer 3 ──── feature/task-1.3 worktree
```

**Lifecycle:**
1. Orchestrator creates team and worktrees
2. Implementers execute tasks in parallel
3. Implementers report completion via SendMessage
4. Orchestrator runs wave transition protocol (see `wave-execution.md` Section 2)
5. Orchestrator shuts down team, creates new team for next wave

### 3.3 Full Team

1 orchestrator + N implementers + 1 reviewer. The reviewer inspects each implementer's GREEN stage output before the REFACTOR stage begins. Reviewer APPROVE is a required gate before REFACTOR for complex tasks (> 5 files or > 3 acceptance criteria).

```
┌──────────────┐
│ Orchestrator  │
└──────┬───────┘
       ├──── Implementer 1 ──── feature/task-1.1 worktree
       ├──── Implementer 2 ──── feature/task-1.2 worktree
       └──── Reviewer ──────── reads all worktrees
```

**When to use:** Required for tasks marked complex (> 5 files or > 3 acceptance criteria). Optional otherwise. Can be enabled per-wave in `execution_plan.team_config`. Complex tasks also run in their own dedicated wave with no parallel tasks — see `wave-execution.md` rule 5. The combination ensures both isolation (no file overlap risk) and quality (reviewer gate).

**Solo wave sequencing:** In a solo wave (single complex task), the reviewer works AFTER the implementer completes GREEN -- not in parallel. Sequence: implementer executes RED and GREEN, reviewer reviews GREEN output (APPROVE or REQUEST_CHANGES), then implementer proceeds to REFACTOR only after APPROVE. Sequential by design: one task means parallel review adds no value.

---

## 4. Orchestrator Protocol

### 4.1 Team Initialisation

```
1. Read roadmap.json → identify current wave (first wave with "Not Started" tasks)
2. TeamCreate with team_name: "{project}-wave-{N}"
3. For each task in the wave:
   a. Create git worktree:
      git worktree add worktree/task-{X.Y} -b feature/task-{X.Y}
   b. Spawn Agent with:
      - name: "impl-{X.Y}"
      - team_name: "{project}-wave-{N}"
      - prompt: Phase 3 execution prompt with task-specific context injected
         (task ID, name, scope, acceptance criteria, eval IDs, agent_instructions,
          context_needed — all from roadmap.json)
      - isolation: "worktree" (or cd into the pre-created worktree)
4. PRE-FLIGHT VALIDATION — Before spawning implementers:
   a. For each task, read files_to_modify and context_needed
      from roadmap.json
   b. Diff files_to_modify across all wave tasks — if ANY file
      appears in more than one task: STOP, log overlap, RECOMPUTE
      wave assignments before proceeding
   c. Verify each expected file exists on disk (or is marked "create")
   d. If pre-flight fails: do NOT spawn. Report overlap to user,
      trigger wave recomputation. The orchestrator is responsible:
      re-run the wave computation algorithm from `wave-execution.md`
      Section 1 against the current `roadmap.json`, then update
      `execution_plan.waves` with the new assignments.
5. Update roadmap.json: set each task's status to "In Progress"
   and populate agent_assignment fields (include "preflight_passed": true
   in agent_assignment)
```

### 4.2 Monitoring and Dynamic Reassignment

The orchestrator receives automatic notifications when implementers send messages or complete work.

**Progress tracking:**
- Implementers send messages at each TDD stage: RED complete, GREEN complete, REFACTOR complete
- Orchestrator updates its internal tracking (not roadmap.json yet — that happens at wave transition)
- Orchestrator tracks wave progress internally and computes current wave status from task statuses in `roadmap.json`

**Budget tracking:**
- Orchestrator tracks cumulative turns per assignee agent against the **current task's** `max_turns` value in `roadmap.json`.
- At 80% of budget (`escalation_threshold`): send warning to implementer, log status.
- At 100%: escalate to user with context (task ID, turns used, current stage, estimated remaining). If `hard_stop` is true in `budget_config`, pause implementer.
- Budget overruns logged in task's `completion_notes` and wave completion log.

**Wave status tracking:**

Wave status is tracked via task statuses in `roadmap.json` — the orchestrator computes current wave state from task `status`, `agent_assignment`, and `completion_notes` fields. There is no separate `wave-status.json` file. This avoids dual-write concerns and keeps `roadmap.json` as the single source of truth.

**Dynamic reassignment:**
- If an implementer finishes early AND unassigned tasks exist in the current wave or the next wave has independent tasks ready: assign the next task
- If reassigning from the next wave, verify that the task's dependencies are already completed
- When reassigning a task, spawn a new implementer agent if no idle implementer is available, or assign to an existing idle implementer if one has completed its prior task.

**Blocker handling:**
- If an implementer reports a blocker: attempt to unblock (provide guidance, clarify requirements)
- If the blocker requires human input: escalate to the user immediately
- If an implementer discovers an unanticipated dependency on another in-wave task: pause the dependent task and escalate

### 4.3 Wave Transition Protocol

Runs after ALL tasks in the wave are complete. Follow the Wave Transition Protocol in `wave-execution.md` Section 2. The orchestrator-specific steps (UPDATE, CLEANUP, SHUTDOWN) apply in team mode.

> **Issue closure:** Individual task issues are closed during Phase 4 (solo/bash mode) or during the orchestrator's SYNC ISSUES step (agent-team mode). Wave transition closes the wave *milestone* only. See `github-issue-sync.md` Section 6.3.

Additional orchestrator responsibilities during wave transition:
- **MERGE (step 1):** If a merge conflict occurs, run the Conflict Resolution Protocol (Section 4.4)
- **REGRESSION (step 2):** If regression fails, report to user and block next wave
- **GATE (step 3):** Verify all session summaries are saved in addition to the standard gate checks

### 4.4 Conflict Resolution Protocol

Merge conflicts during wave transition indicate either a wave computation error (shared files) or an unanticipated coupling.

```
1. Orchestrator attempts: git merge feature/task-{X.Y} --no-ff
2. If conflict detected:
   a. Read the conflict markers to understand scope
   b. Spawn a dedicated resolution agent (an implementer-role agent
      spawned by the orchestrator specifically for the conflict —
      not a separate role) OR reassign an idle implementer if one is available, with:
      - Both branches' session summaries for context
      - The conflicting files
      - Instructions to resolve preserving both tasks' intent
   c. Resolution agent fixes conflicts and commits
   d. Resolution agent produces a conflict-resolution-summary.md
      committed alongside the merge, containing:
      - Conflicting files and branches involved
      - For each conflict: which side was preferred and WHY
      - Any behavioral changes resulting from the resolution
      - Whether the resolution introduced test changes
   e. Commit: docs(wave-N): conflict resolution summary for feature/task-X.Y merge
   f. Re-run regression before continuing
3. Log the conflict in the wave's completion notes and reference
   the resolution summary file path
4. If the conflict stems from file overlap:
   flag it as a wave computation error for future roadmap improvements
5. The resolution summary is included in the wave's session summary
   and readable by subsequent waves for context
```

### 4.5 Rollback Protocol

When a wave merge produces persistent regressions that cannot be resolved.

**TRIGGER:** Regression fix has failed N times (default N=2, configurable in `execution_plan.budget_config`).

```
1. REVERT — git revert the wave merge commit(s):
   git revert --no-commit HEAD~{number_of_merges}..HEAD
   git commit -m "rollback(wave-N): revert wave N -- [reason]"

2. PRESERVE — Do NOT delete task branches:
   - Keep all worktree/task-X.Y directories intact (branches named feature/task-X.Y)
   - Keep all task branch commits accessible

3. RESET — Update roadmap.json:
   - Set each task's status to "Not Started"
   - Set rollback_reason: "[regression description]"
   - Increment rollback_count
   - Do NOT clear eval_results or files_touched

4. REOPEN ISSUES:
   gh issue reopen <issue_number> --comment "Rolled back: [reason]"

5. NOTIFY — Report to user:
   - Which wave rolled back and why
   - Affected tasks
   - Suggested next steps (recompute, split tasks, add reviewer)

6. RECOMPUTE — Mandatory wave recomputation for remaining work
```

---

## 5. Inter-Agent Communication Protocol

### 5.1 Communication Channels

| Channel | Mechanism | Use Case |
|---------|-----------|----------|
| Direct message | SendMessage to specific teammate name | Progress reports, task assignment, blocker reports |
| Broadcast | SendMessage to `"*"` | Critical blockers only (e.g., regression discovered, stop all work) |
| Shared task list | TaskCreate / TaskUpdate / TaskList | Task assignment and status tracking |
| File system | `roadmap.json`, `docs/evals.json`, session summaries | Persistent state (orchestrator writes only) |
| Review channel | SendMessage to reviewer name | Review requests and findings |

### 5.2 SendMessage Completion Payload

When an implementer completes a task (or is blocked/failed), it sends a structured payload to the orchestrator via SendMessage. This is the canonical format:

```json
{
  "task_id": "1.1",
  "status": "complete|blocked|failed",
  "summary": "what was done",
  "files_modified": ["list of files"],
  "eval_results": {"eval_id": "pass|fail"},
  "blockers": ["if any"]
}
```

- **`status: "complete"`** — task finished, ready for wave transition
- **`status: "blocked"`** — task cannot proceed (see `blockers` for reasons)
- **`status: "failed"`** — implementation failed after retries (see `blockers` for details)

The orchestrator uses this payload to update `roadmap.json` and decide on next steps (reassignment, escalation, or wave transition).

### 5.3 Message Types

| Purpose | Direction | Content |
|---------|-----------|---------|
| Task assignment | Orchestrator → Implementer | Task ID, worktree path, branch name |
| RED complete | Implementer → Orchestrator | "RED complete for Task X.Y — N tests written, all failing as expected" |
| GREEN complete | Implementer → Orchestrator | "GREEN complete for Task X.Y — all N tests passing" |
| REFACTOR complete | Implementer → Orchestrator | "REFACTOR complete for Task X.Y — tests still green" |
| Blocker report | Implementer → Orchestrator | Description of blocker, what was attempted |
| Critical stop | Any → Broadcast (`"*"`) | Stop all work, reason (e.g., regression discovered) |
| Task complete | Implementer → Orchestrator | Eval results, files modified, open items |
| Wave complete | Orchestrator → User (output) | Wave status, regression results, next wave plan |
| Review request | Orchestrator → Reviewer | Task ID, worktree path, acceptance criteria, eval IDs |
| Review complete | Reviewer → Orchestrator + Implementer | Task ID, verdict (APPROVE/REQUEST_CHANGES/ESCALATE), findings list |
| Shutdown | Orchestrator → Implementer | shutdown_request / shutdown_response |

> When a review returns REQUEST_CHANGES, the implementer addresses findings before proceeding to REFACTOR. The reviewer re-reviews after changes. Maximum 2 review rounds before escalating to user.

### 5.4 Shared Working Memory

| Resource | Location | Writer | Readers |
|----------|----------|--------|---------|
| `roadmap.json` | Project root (main branch) | Orchestrator only | All agents |
| `docs/evals.json` | `docs/` directory + worktrees | Implementers (local copy) | All agents |
| Session summaries | `session-summary/` in worktrees | Implementers | Orchestrator, next session |
| Agent SDK task list | `~/.claude/tasks/{team-name}/` | Orchestrator | All teammates |

> **Critical rule:** The orchestrator is the sole writer of `roadmap.json` on the main branch. Implementers work on worktree copies and report status via SendMessage (see Section 5.2 for payload format). This prevents concurrent write conflicts.

---

## 6. Integration with Wave System

### 6.1 Concept Mapping

| Existing Concept | Agent Teams Equivalent |
|-----------------|----------------------|
| Execution wave | One team lifecycle (create → work → transition → delete) |
| Task in wave | Agent teammate + TaskCreate item |
| Git worktree per task | Same (unchanged) |
| `run-project-parallel.sh` | Orchestrator agent protocol |
| Wave transition protocol | Orchestrator post-wave sequence (Section 4.3) |
| Session summary per task | Per-implementer summary (saved in worktree, merged at transition) |

### 6.2 Alternative Execution Models

- Simpler execution models (Ralph Loop, SessionStart hook, headless CLI loop, bash-script parallelism) remain available in `workflow-automation.md`
- A project can switch between models per wave (e.g., agent teams for complex waves, solo execution for simple sequential tasks)
- The `execution_plan.team_config` field in `roadmap.json` records which mode was used for each wave

---

## 7. Error Handling for Teams

> For shared error types (missing document, failed evals, dependency not met, etc.), escalation rules, and error logging, see `error-protocol.md`. The errors below are specific to agent team execution.

| Error | Detection | Response |
|-------|-----------|----------|
| Teammate crash | Agent exits unexpectedly or stops responding | Orchestrator reassigns task to a new implementer in a fresh worktree |
| Merge conflict | `git merge` returns conflict markers | Spawn dedicated resolution agent (see Section 4.4) |
| Concurrent roadmap write | Should never occur if protocol is followed | Orchestrator is sole writer; if detected, discard implementer's write and re-sync |
| Team creation failure | TeamCreate returns error | Fall back to bash-script parallelism (see `workflow-automation.md`) |
| Communication timeout | Implementer idle >10 minutes with no progress messages | Orchestrator sends follow-up message; after 2 attempts, escalate to user |
| Regression failure at wave transition | `npx playwright test` fails after merging | Block next wave, report failing tests to user, attempt fix or rollback |
| Worktree conflict | `git worktree add` fails (branch already exists) | Remove stale worktree, retry; if persistent, escalate |
| Orchestrator crash | "In Progress" tasks found in `roadmap.json` at session start | Follow Orchestrator Recovery Protocol (Section 7.1) |

### 7.1 Orchestrator Recovery Protocol

When an orchestrator session crashes or a new session must take over mid-wave:

```
1. RECONSTRUCT STATE
   a. Read roadmap.json — identify tasks with status "In Progress"
   b. Determine each task's last known stage from agent_assignment
      and completion_notes in roadmap.json
   c. List git worktrees (git worktree list) — identify which
      task branches still exist
   d. Read session-summary/ — scan for partial summaries from
      the interrupted wave

2. ASSESS ORPHANED IMPLEMENTERS
   For each "In Progress" task with an existing worktree:

   | Worktree State | Action |
   |---|---|
   | Branch exists, work committed, tests pass | Ready for merge |
   | Branch exists, work committed, tests fail | Reassign to fix |
   | Branch exists, uncommitted changes | Stash, reassign |
   | No worktree found | Reset to "Not Started" |

3. RESUME
   a. Create new team for remaining wave tasks
   b. Spawn new implementers for tasks needing reassignment
      (include context about prior partial work)
   c. Proceed to wave transition for tasks ready to merge
   d. Update roadmap.json with recovered state
```

> **Reviewers never receive Bash access** — all git and shell operations during recovery are performed by the orchestrator. Reviewers remain read-only at all times.

### 7.2 Escalation Rules

1. **First failure:** Orchestrator attempts automatic recovery (reassign, retry, resolve)
2. **Second failure of same type:** Orchestrator escalates to user with full context
3. **Critical failures** (data loss risk, regression on main): Escalate immediately, do not attempt automatic recovery

---

## 8. Quick Reference

| Question | Answer |
|----------|--------|
| *"Can I use a simpler execution model?"* | Yes. Solo workflow, bash parallelism, and other alternatives are available in `workflow-automation.md`. |
| *"Can I mix execution models?"* | Yes — different waves can use different execution models. |
| *"Who writes to roadmap.json?"* | The orchestrator only. Implementers report via SendMessage. |
| *"What if an implementer finishes early?"* | The orchestrator can assign it the next available task from the current or next wave (if dependencies are met). |
| *"What if TeamCreate fails?"* | Fall back to bash-script parallelism. The wave system works with either approach. |
| *"How do I define custom agent roles?"* | Create agent definition files in `.claude/agents/` and reference them via subagent_type when spawning. |
| *"Can agents use the Supabase/Vercel CLI?"* | Yes — any agent with Bash access can run any installed CLI tool. See Section 2.5. |
| *"Where is wave status tracked?"* | In `roadmap.json` via task statuses — the orchestrator computes current wave state. See Section 4.2. |
| *"What triggers a rollback?"* | Regression fix failing after 2 attempts. See Section 4.5. |
| *"Is reviewer approval required?"* | Required for complex tasks (> 5 files or > 3 acceptance criteria). See Section 2.3. |
| *"What if the orchestrator crashes?"* | Follow Orchestrator Recovery Protocol. See Section 7.1. |
| *"What is max_turns?"* | Per-task budget cap in `roadmap.json`. See Section 4.2. |
| *"Can Phase 2 be split across sessions?"* | Yes — checkpoint at 2a/2b/2c boundaries. See `phases/phase-2-specification-eval-generation.md`. |
