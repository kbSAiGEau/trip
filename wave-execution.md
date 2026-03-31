# Wave Execution Protocol

> Defines how tasks are grouped into execution waves, validated, transitioned between waves, and isolated via git worktrees.

> **Navigation:** For framework overview, see `CLAUDE.md`. For agent team orchestration, see `agent-teams.md`. For task decomposition rules (sizing, checklist), see `phases/phase-2-specification-eval-generation.md` Steps 6-6b.
>
> **Authority:** This file is the single authoritative definition of the wave computation algorithm. Waves are computed during **Phase 2, Step 6b** (see `phases/phase-2-specification-eval-generation.md`). The Phase 2 agent executes the algorithm defined here and stores results in `roadmap.json` → `execution_plan.waves`. No other file may redefine wave computation rules.

---

## Execution Wave Rules

Tasks are grouped into **execution waves** — batches of 2-3 tasks with no mutual dependencies that can run in parallel agent sessions. Waves are computed during Phase 2 and stored in the `execution_plan` section of `roadmap.json`.

### Wave Computation

1. **Seed Wave 1** with all tasks that have an empty `depends_on` array
2. For each subsequent wave, include tasks whose `depends_on` references are **all completed in earlier waves**
3. **File overlap check** — tasks in the same wave must NOT share files in their `files_to_modify` field in `roadmap.json`. "File overlap" means any file listed in one task's `files_to_modify` also appears in another task's `files_to_modify` within the same wave. If two tasks share a file, they must be in different waves. (Note: `context_needed` files that are read-only do not count as overlap — only files expected to be written.)
4. **Maximum 3 tasks per wave** — keeps merge complexity manageable and limits concurrent agent resource usage
5. If a task is marked complex (touches > 5 files or has > 3 acceptance criteria), it runs **solo in its own wave** — no other tasks share the wave. In agent-team mode, the implementer works alone first; after GREEN, the reviewer gates before REFACTOR (sequential, not parallel). See `agent-teams.md` Section 3.3. "Solo wave" means no parallel tasks, not no team.
6. **GitHub issue mapping** — wave assignments must be reflected in GitHub issue labels or milestones so issue status stays in sync with execution progress

### Wave Validation Checklist

For each wave in the execution plan:

- [ ] **No mutual dependencies** — no task in the wave appears in another task's `depends_on` within the same wave
- [ ] **No file overlap** — `files_to_modify` fields do not intersect across tasks in the wave (read-only `context_needed` files are excluded from overlap checks)
- [ ] **Dependencies satisfied** — all `depends_on` references point to tasks in earlier waves
- [ ] **Wave size <= 3** — no wave contains more than 3 tasks
- [ ] **Rationale documented** — each wave has a `rationale` field explaining why these tasks are grouped together
- [ ] **Issue numbers present** — every task in the wave has a valid `issue_number` linking to its GitHub issue (populated by `/plan-to-issues` during Phase 2 Step 6, before wave validation runs)
- [ ] **Pre-flight gate** — wave cannot launch until orchestrator pre-flight passes (see `agent-teams.md` Section 4.1)

---

## Wave Transition Protocol

> **Authority:** This is the single canonical wave transition sequence. All execution modes follow these steps. Steps marked *(agent-team mode only)* are skipped in solo and bash-script modes.

After all tasks in a wave complete:

1. **MERGE** — merge each task's worktree branch into main. In agent-team mode, the orchestrator runs merges sequentially. If a merge conflict occurs, follow the Conflict Resolution Protocol in `agent-teams.md` Section 4.4.
2. **REGRESSION** — run the full eval suite against merged main. In agent-team mode, the orchestrator runs the test suite.
3. **GATE** — if regressions found, fix before starting the next wave. In agent-team mode, the orchestrator verifies all wave tasks have passing evals, no regressions, and all session summaries saved.
4. **UPDATE** — update `roadmap.json` with completion data: set each task's status to `"Completed"`, fill in `eval_results`, `files_touched`, `completion_notes`, `completed` timestamp, and append to `completion_log`. **Who writes:** In agent-team mode, the orchestrator is the sole writer. In bash-script mode, the central wave transition script writes after all agents complete and branches are merged -- individual worktree agents do NOT update `roadmap.json` (see `workflow-automation.md`). In solo mode, the agent updates directly during Phase 4.
5. **SYNC ISSUES** — update GitHub issue statuses for all completed tasks in the wave. Close issues, close the wave milestone, post regression results to the PRD tracking issue.
6. **RECOMPUTE** — mandatory if any merge conflict occurred or scope changed. Next wave's pre-flight check (`agent-teams.md` Section 4.1) enforces file overlap validation.
7. **CLEANUP** *(agent-team mode only)* — for each task, remove the worktree (`git worktree remove worktree/task-{X.Y}`) and delete the branch (`git branch -d feature/task-{X.Y}`).
8. **SHUTDOWN + LAUNCH** — *(agent-team mode only)* send `shutdown_request` to all implementers via SendMessage. Then create a new team and spawn implementer agents for the next wave's tasks (see `agent-teams.md` Section 4.1). In solo/bash-script mode, proceed to the next wave directly.

---

## Git Worktree Strategy

Git worktrees are the isolation mechanism for parallel agent team execution. Each implementer agent works in its own worktree, preventing file conflicts during a wave.

```
main
├── worktree/task-1.1  <- Agent A (wave 1)
├── worktree/task-1.2  <- Agent B (wave 1)
│
│   <- Wave 1 complete: merge both -> main, run regression, sync issues
│
├── worktree/task-1.3  <- Agent A (wave 2)
├── worktree/task-2.1  <- Agent B (wave 2)
├── worktree/task-2.2  <- Agent C (wave 2)
│
│   <- Wave 2 complete: merge all -> main, run regression, sync issues
│
└── worktree/task-2.3  <- Agent A (wave 3)
```

- Each task gets its own worktree branch (`feature/task-X.Y`)
- Tasks within the same wave run in parallel on separate worktree branches
- Merge back to `main` at **wave completion**, not at individual task completion
- Full regression runs after each wave merge before the next wave starts
- GitHub issue statuses are synced after each wave merge
- This enables parallel execution while preventing merge conflicts within a wave
