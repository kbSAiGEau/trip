# GitHub Issue Sync Protocol

This protocol defines how the framework synchronises its internal tracking (`roadmap.json`, `docs/evals.json`) with GitHub Issues. GitHub serves as the **visibility layer** -- humans and external tools can track progress there. `roadmap.json` remains the **authoritative source of truth**.

All operations use the [GitHub CLI (`gh`)](https://cli.github.com/).

---

## Prerequisites

Before using this protocol, verify `gh` is installed and authenticated:

```bash
# Check installation
gh --version

# Check authentication
gh auth status

# If not authenticated
gh auth login
```

If `gh` is not available, skip all GitHub sync steps. The framework operates normally without it -- `roadmap.json` is self-sufficient.

---

## GitHub is Optional

GitHub integration is a **visibility layer**, not a dependency. The entire framework operates on `roadmap.json` as the source of truth. If `gh` is not installed or not authenticated:

- **Skip all sections below** — they are no-ops without `gh`
- Gates marked "If GitHub available" are automatically satisfied
- No project functionality is lost — only external visibility

When reading other framework documents, any instruction involving `gh issue`, `gh api`, GitHub labels, milestones, or issue numbers can be skipped if `gh` is unavailable. These instructions are marked `[GitHub Optional]` where feasible, but not all instances carry the marker — the rule is: if it requires `gh`, it's optional.

---

## 1. Issue Creation (Phase 2 Exit)

After `roadmap.json` is generated and validated, create GitHub issues for the project.

### 1.1 Create the PRD Parent Issue

Create a single tracking issue that represents the entire project:

```bash
gh issue create \
  --title "[PRD] Project Name - Product Requirements" \
  --body "$(cat <<'EOF'
## Product Requirements

Tracking issue for the full project. Individual task issues reference this issue.

- **PRD:** `docs/prd.md`
- **Roadmap:** `docs/roadmap.json`
- **Evals:** `docs/evals.json`

## Phases

- [ ] Phase 1: [Phase Name]
- [ ] Phase 2: [Phase Name]
EOF
)" \
  --label "prd,tracking"
```

Note the returned issue number (e.g., `#1`). Store it as `prd_issue_number` at the top level of `roadmap.json` (see Section 5.1).

### 1.2 Create Task Issues

For each task in `roadmap.json`, create an issue:

```bash
gh issue create \
  --title "[Task 1.1] Task Name" \
  --body "$(cat <<'EOF'
## Description

[Task scope from roadmap.json]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Eval IDs

- `FE-001-HP-01`
- `FE-001-EC-01`

## Metadata

- **Phase:** 1
- **Wave:** 1
- **Depends on:** None
- **PRD Issue:** #1

---
Parent: #1
EOF
)" \
  --label "task,wave-1,phase-1"
```

### 1.3 Label Schema

| Label | Purpose |
|-------|---------|
| `prd` | PRD tracking issue |
| `tracking` | Non-task tracking issues |
| `task` | Individual implementation task |
| `wave-N` | Execution wave number (e.g., `wave-1`, `wave-2`) |
| `phase-N` | Phase number |
| `hitl` | Requires human-in-the-loop review |
| `afk` | Can run fully automated |
| `in-progress` | Currently being worked on |
| `blocked` | Task is blocked |

Create labels if they don't exist:

```bash
gh label create "wave-1" --color "0E8A16" --description "Execution wave 1" 2>/dev/null
gh label create "task" --color "1D76DB" --description "Implementation task" 2>/dev/null
gh label create "in-progress" --color "FBCA04" --description "Currently in progress" 2>/dev/null
gh label create "blocked" --color "D93F0B" --description "Task is blocked" 2>/dev/null
```

### 1.4 Store Issue References in roadmap.json

After creating issues, update each task entry with the returned issue number:

```json
{
  "id": "1.1",
  "name": "Task Name",
  "issue_number": 12,
  "status": "Not Started",
  ...
}
```

Use `issue_number` consistently — not `issue_url`, `github_issue_id`, or other variants. The issue URL can be derived from the repo and issue number when needed.

---

## 2. Issue Status Sync (Phase 3 / Phase 4)

### 2.1 When a Task Starts

```bash
# Assign the issue to the current user
gh issue edit 12 --add-label "in-progress"

# Add start comment
gh issue comment 12 --body "$(cat <<'EOF'
## Task Started

- **Agent:** [agent session ID or description]
- **Branch:** `feature/task-1.1`
- **Wave:** 1
- **Started:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
)"
```

### 2.2 Batched Status Updates

GitHub is updated at two sync points -- task completion and wave completion. Fine-grained TDD stage tracking is maintained locally in `roadmap.json` (see `agent-teams.md` Section 4.2). GitHub is updated only at task and wave completion boundaries to reduce API calls.

**Task completion** -- single consolidated update:

```bash
gh issue close 12 --comment "$(cat <<'EOF'
## Task Complete

### TDD Summary
- RED: 3 test cases written (`tests/checkout.test.ts`, `tests/cart-validation.test.ts`)
- GREEN: all tests passing
- REFACTOR: extracted `validateCart()`, introduced `Email` value object

### Eval Results
| Eval ID | Status |
|---------|--------|
| FE-001-HP-01 | PASS |
| FE-001-EC-01 | PASS |

### Files Touched
- `src/checkout.ts` (created)
- `src/cart.ts` (modified)
- `tests/checkout.test.ts` (created)

### Commits
- `abc1234` RED: scaffold failing tests for checkout
- `def5678` GREEN: implement checkout to pass tests
- `ghi9012` REFACTOR: extract cart validation
EOF
)"
```

**Wave completion** -- bulk closure and regression posting. See Section 4.2 for the wave completion protocol including milestone closure and regression result comments.

### 2.3 When a Task is Blocked

```bash
gh issue edit 12 --add-label "blocked" --remove-label "in-progress"
gh issue comment 12 --body "$(cat <<'EOF'
## Blocked

**Blocker:** Task 1.2 must complete first -- shared `CartService` interface not yet defined.
**Blocked since:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Action needed:** Complete task 1.2 or extract the `CartService` interface as a standalone subtask.
EOF
)"
```

---

## 3. Bidirectional Sync

### 3.1 roadmap.json to GitHub (Outbound)

Every time `roadmap.json` is updated, propagate changes to GitHub:

| roadmap.json change | GitHub action |
|---------------------|---------------|
| `status` -> "In Progress" | Add `in-progress` label |
| `status` -> "Completed" | Close issue |
| `status` -> "Blocked" | Add `blocked` label |
| `status` -> "Not Started" (revert) | Reopen issue, remove progress labels |

### 3.2 GitHub to roadmap.json (Inbound)

At the start of each agent session, check for external changes:

```bash
# Get all open issues with their labels
gh issue list --state all --label "task" --json number,state,labels,title --limit 200
```

**Precedence rule:** Check GitHub issue state first, then labels. Issue state takes precedence over labels: a Closed issue is always Completed regardless of labels. A label only overrides roadmap status when the issue is Open.

Compare against `roadmap.json`:

| GitHub state | Labels | roadmap.json action |
|---|---|---|
| Closed | Any | Update roadmap.json to "Completed", log in `completion_log` |
| Open | None / no `blocked` | Match roadmap.json status (no change unless other conflict) |
| Open | Has `blocked` label | Update roadmap.json to "Blocked" |
| Open | `Completed` in roadmap | Reopen was intentional — set roadmap.json back to "In Progress" |

> **Edge case — Closed + `blocked` label:** If an issue is Closed AND has a `blocked` label, treat as Completed. The `blocked` label is stale — remove it when closing:
> ```bash
> gh issue close 12 --remove-label "blocked"
> ```
> The task was resolved; the label no longer reflects reality.

### 3.3 Conflict Resolution

**`roadmap.json` is authoritative.** If there is a genuine conflict (both sides changed since last sync):

1. Log the conflict in the session summary
2. Use `roadmap.json` state as the correct state
3. Update GitHub to match
4. Comment on the issue explaining the sync correction

```bash
gh issue comment 12 --body "$(cat <<'EOF'
**Sync correction:** This issue was closed on GitHub, but roadmap.json shows task 1.1 as "In Progress". Reopening to match roadmap.json (authoritative source).
EOF
)"
gh issue reopen 12
```

---

## 4. Wave Management

### 4.1 Create Milestones for Waves

During Phase 2, after computing execution waves:

```bash
# Create a milestone for each wave
gh api repos/{owner}/{repo}/milestones -f title="Wave 1" -f description="Execution wave 1: Tasks 1.1, 1.2" -f state="open"
gh api repos/{owner}/{repo}/milestones -f title="Wave 2" -f description="Execution wave 2: Task 1.3 (depends on wave 1)" -f state="open"
```

Assign task issues to their wave milestone:

```bash
# Get milestone number from the API response, then assign
gh issue edit 12 --milestone "Wave 1"
gh issue edit 13 --milestone "Wave 1"
gh issue edit 14 --milestone "Wave 2"
```

> **Milestone names vs. numbers:** The sync protocol uses milestone **names** (e.g., `Wave 1`) when assigning issues via `gh issue edit`. The `milestone_number` field in `roadmap.json` (under each wave in `execution_plan.waves`) is informational only — populate it if you need the numeric GitHub milestone ID for API calls (e.g., milestone closure via `gh api repos/{owner}/{repo}/milestones/{milestone_number}`). It may be left `null` if not needed.

### 4.2 Wave Completion

When all tasks in a wave complete:

```bash
# Close the milestone
gh api repos/{owner}/{repo}/milestones/{milestone_number} -f state="closed"

# Post regression results as a milestone comment (via issue on the PRD)
gh issue comment 1 --body "$(cat <<'EOF'
## Wave 1 Complete

### Regression Results
- Total evals: 12
- Passing: 12
- Failing: 0
- Regression: NONE

### Merged Branches
- `feature/task-1.1` -> `main`
- `feature/task-1.2` -> `main`

### Wave 2 Unblocked
Tasks 1.3 can now proceed.
EOF
)"
```

---

## 5. Template Additions

### 5.1 roadmap.json Additions

Add these fields to each task object in the `roadmap.json` template:

```json
{
  "id": "1.1",
  "name": "[Task Name]",
  "issue_number": null,
  "status": "Not Started",
  ...
}
```

Add `prd_issue_number` as a top-level field in `roadmap.json`:

```json
{
  "project_name": "[Project Name]",
  "prd_issue_number": null,
  "last_updated": "[timestamp]",
  "execution_plan": {
    "waves": [
      {
        "wave": 1,
        "tasks": ["1.1", "1.2"],
        "rationale": "...",
        "milestone_number": null
      }
    ]
  }
}
```

> **Field naming convention:** Use `issue_number` for task issues and `prd_issue_number` for the PRD tracking issue. Do not use `issue_url`, `github_issue_id`, or other variants — URLs are derived from the repo and number at runtime.

### 5.2 evals.json Additions

Add issue cross-references to feature eval groups. The `issue_numbers` array mirrors the `task_ids` array — each task's `issue_number` from `roadmap.json`:

```json
{
  "feature_evals": [
    {
      "id": "FE-001",
      "feature_name": "[Feature Name]",
      "derived_from": "PRD Section [X.X], User Story [US-XX]",
      "task_ids": ["1.1", "1.2"],
      "issue_numbers": [12, 13],
      ...
    }
  ]
}
```

This links eval groups to both roadmap tasks and GitHub issues, making it possible to navigate from an eval failure to the relevant GitHub issue.

---

## 6. Automation Integration

### 6.1 Phase 2 Exit Gate Addition

These checks are included in the Phase 2 gate under **GitHub Gates** (conditional on `gh` availability):

- [ ] GitHub issues created for all tasks in `roadmap.json`
- [ ] `issue_number` populated for each task
- [ ] Wave milestones created
- [ ] Label schema applied
- [ ] PRD tracking issue created and referenced

### 6.2 Phase 3 Entry Gate Addition

These checks are included in the Phase 3 gate under **GitHub Gates** (conditional on `gh` availability):

- [ ] Verify `issue_number` exists for the current task
- [ ] If missing, create the issue before starting

### 6.3 Phase 4 Handoff Addition

These checks are included in the Phase 4 gate under **GitHub Gates** (conditional on `gh` availability):

- [ ] GitHub issue updated with completion comment and closed
- [ ] Labels reflect final state
- [ ] If wave complete, close milestone and post regression results

### 6.4 Session Start Sync

At the start of every agent session:

```bash
# Pull latest issue states
gh issue list --state all --label "task" --json number,state,labels --limit 200 > /tmp/gh-issues.json

# Compare with roadmap.json and reconcile
# (Agent performs this comparison and updates roadmap.json if needed)
```

---

## 7. Error Handling

| Error | Action |
|-------|--------|
| `gh` not installed | Skip all GitHub sync. Log warning. Framework operates on `roadmap.json` alone. |
| `gh` not authenticated | Run `gh auth status`, log error, skip sync. |
| Issue creation fails (rate limit) | Retry after 60 seconds. After 3 failures, skip and log. |
| Issue not found (deleted externally) | Remove `issue_number` from `roadmap.json`. Recreate on next sync. |
| Milestone not found | Recreate the milestone. |
| Label does not exist | Create it (see Section 1.3). |

GitHub sync failures are **non-blocking**. The framework continues operating on `roadmap.json`. Issues are a visibility convenience, not a dependency.
