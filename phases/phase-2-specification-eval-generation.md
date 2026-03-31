# Phase 2: Specification + Eval Generation

> **Goal:** Produce the project's core specification documents, a structured evaluation suite, and GitHub issues for execution. These documents are **executable context** that future AI agents will read and act against.

> **Mode:** Passive — agent generates, human reviews. This phase orchestrates a skill chain: `/write-prd` -> `/write-design` -> `/write-architecture` -> `/generate-evals` -> `/prd-to-plan` -> `/plan-to-issues`.

---

## Entry Gate

Before starting Phase 2, verify:

| Check | How to Verify | Required |
|-------|---------------|----------|
| Phase 1 session summary exists | A session summary file in `session-summary/` captures confirmed intent, Echo Check, and Blueprint | Yes |
| Templates accessible | All files in `templates/` exist and are readable | Yes |

> If the Phase 1 session summary is missing, the agent MUST NOT proceed. The confirmed intent from Phase 1 is the input to this phase — without it, documents will be based on guesswork.

---

## Execution

### Session Checkpointing

Phase 2 can be split into three sub-sessions when context window pressure requires it. Each sub-session ends with a checkpoint summary that the next sub-session reads to resume.

> **Note:** Checkpointing is optional. If context window permits, run all steps in one session. Checkpoint when any of these conditions apply:
> - You have generated 2+ large documents (PRD, design, architecture) and still need to produce evals, roadmap, and issues
> - You are experiencing degraded output quality (repetition, missed details, inconsistencies)
> - The user requests a checkpoint
>
> When in doubt, checkpoint after completing Phase 2a (PRD + design). These are the two most context-intensive documents.

#### Phase 2a — PRD and Design (Steps 1-3, through `docs/design.md`)

**Scope:** Step 1 (Load Context) + Step 2 (Generate PRD via `/write-prd`) + Step 3 Order 1 (Generate design.md via `/write-design`).

**Checkpoint criteria:**
- `docs/prd.md` exists and populated
- `docs/design.md` exists and populated

- Resume check: verify all output files from this checkpoint exist and are non-empty before starting the next checkpoint.

**On completion:** Generate a session summary to `session-summary/YYYY-MM-DD-phase-2a.md` with `checkpoint_stage: "2a"` in the summary metadata.

#### Phase 2b — Architecture, Evals, Implementation Plan, Roadmap, and Project Summary (Steps 3 continued + Steps 4-5)

**Scope:** Step 3 Orders 2-3 (architecture.md, evals.json) + Step 4 (Implementation Plan via `/prd-to-plan`) + Step 5 (roadmap.json, claude.md).

**Checkpoint criteria:**
- `docs/architecture.md` exists and populated
- `docs/evals.json` exists and populated
- Implementation plan saved to `./plans/`
- `roadmap.json` exists and populated
- `claude.md` exists and populated

- Resume check: verify all output files from this checkpoint exist and are non-empty before starting the next checkpoint.

**On completion:** Generate a session summary to `session-summary/YYYY-MM-DD-phase-2b.md` with `checkpoint_stage: "2b"` in the summary metadata.

#### Phase 2c — Decomposition, Issues, Validation, and Review (Steps 6, 6b, 7, 8, 9)

**Scope:** Step 6 (Decompose Subtasks + Wave Assignment) + Step 7 (Issue Creation via `/plan-to-issues`) + Step 8 (Validate All Outputs) + Step 9 (Present for Review).

**Checkpoint criteria:**
- Full Phase 2 exit gate passes (see Exit Gate section below)

- Resume check: verify all output files from this checkpoint exist and are non-empty before starting the next checkpoint.

**On completion:** Generate a session summary to `session-summary/YYYY-MM-DD-phase-2c.md` with `checkpoint_stage: "2c"` in the summary metadata.

#### Checkpoint Resume Protocol

Each sub-session's summary MUST include a `checkpoint_stage` field with value `"2a"`, `"2b"`, or `"2c"`. When starting a new Phase 2 sub-session:

1. Read the latest Phase 2 checkpoint summary from `session-summary/`
2. Determine the completed stage from `checkpoint_stage`
3. Resume at the next sub-session's first step
4. Re-read all documents produced by prior sub-sessions as context

---

### Step 1: Load Context

1. Read the Phase 1 session summary — this is your primary input
2. Extract and organise the following from the summary:
   - **Confirmed Requirements**: purpose, scope, success criteria, constraints, existing assets
   - **User Journeys**: critical paths, integrations, edge cases
   - **Blueprint**: approved architecture, tech stack, risks, complexity estimate
   - **Open Items**: any unresolved questions (flag these in the documents)

### Step 2: Generate PRD

Invoke the `/write-prd` skill from `skills/write-prd/SKILL.md`.

Use the Phase 1 session summary as input. The skill produces a PRD and submits it as a GitHub issue. Save a local copy as `docs/prd.md` in the project.

### Step 3: Generate Supporting Documents

Generate the remaining documents in this order, using templates from `templates/`:

| Order | Document | Skill | Primary Input | Key Outputs |
|-------|----------|-------|--------------|-------------|
| 1 | `docs/design.md` | `/write-design` | Echo Check + PRD (uses Stitch MCP for prototyping) | Design principles, user flows, visual system, screen inventory, interaction patterns |
| 2 | `docs/architecture.md` | `/write-architecture` | Echo Check + PRD + docs/design.md | Component design, data model, API design, design decisions |
| 3 | `docs/evals.json` | `/generate-evals` | PRD user stories + architecture components | Test scenarios with specific inputs and expected outputs |

#### Skill Output Handling

This table clarifies which skills write their own output files directly versus which outputs Phase 2 is responsible for persisting.

| Output File | Produced By | Who Writes to Disk | Phase 2 Responsibility |
|-------------|-------------|-------------------|----------------------|
| `docs/prd.md` | `/write-prd` skill | **Skill** — writes file and optionally creates GitHub issue | Verify file exists after skill returns |
| `docs/design.md` | `/write-design` skill | **Skill** — writes file, includes built-in user review loop | Verify file exists after skill returns |
| `docs/architecture.md` | `/write-architecture` skill | **Skill** — writes file, includes built-in user review loop | Verify file exists after skill returns |
| `plans/<feature>.md` | `/prd-to-plan` skill | **Skill** — writes plan file to `./plans/` | Verify file exists after skill returns |
| GitHub Issues | `/plan-to-issues` skill | **Skill** — creates issues via `gh issue create` | Verify `issue_number` fields populated in `roadmap.json` |
| `docs/evals.json` | `/generate-evals` skill | **Skill** — writes file, validates against schema | Verify file exists after skill returns |
| `roadmap.json` | Phase 2 (Step 5, Order 1) | **Phase 2** — copies template, replaces placeholders using implementation plan from Step 4 | Copy from `templates/roadmap.json`, populate all fields; `/plan-to-issues` later updates `issue_number` fields |
| `claude.md` | Phase 2 (Step 5, Order 2) | **Phase 2** — copies template, replaces placeholders | Copy from `templates/claude.md`, populate all fields |

> **Rule:** After invoking a skill, always verify its output file exists on disk before proceeding to the next step. If a skill fails to write its output, re-invoke it with additional context. If it fails a second time, halt and escalate to the user. Do NOT write the file manually.

**Order 1 — `docs/design.md`:** Invoke the `/write-design` skill from `skills/write-design/SKILL.md`. Use the Echo Check (from Phase 1) and the PRD (from Step 2) as input. The skill uses Stitch MCP for prototyping and includes a built-in review-and-revise loop — the user approves `docs/design.md` within the skill before proceeding.

**Order 2 — `docs/architecture.md`:** Invoke the `/write-architecture` skill from `skills/write-architecture/SKILL.md`. Use the Echo Check, PRD, and the approved `docs/design.md` as input. This skill also includes a built-in review-and-revise loop — the user approves `docs/architecture.md` within the skill before proceeding.

> **Note:** By the time orders 1 and 2 complete, both `docs/design.md` and `docs/architecture.md` have already been individually reviewed and approved by the user through their respective skill loops. Step 9 review covers the remaining documents and cross-cutting consistency.

**Order 3 — `docs/evals.json`:** Invoke the `/generate-evals` skill from `skills/generate-evals/SKILL.md`. Use the PRD (from Step 2) and architecture (from Step 3 Order 2) as input. If `docs/design.md` exists, pass it as well for additional UI eval coverage. The skill produces `docs/evals.json` validated against `templates/evals.schema.json`.

### Step 4: Generate Implementation Plan

Invoke the `/prd-to-plan` skill from `skills/prd-to-plan/SKILL.md`.

Use the PRD (from Step 2) and architecture (from Step 3 Order 2) as input. The skill produces a phased implementation plan using tracer-bullet vertical slices, saved to `./plans/`.

### Step 5: Generate Roadmap and Project Summary

Generate the remaining documents using the implementation plan as input:

| Order | Document | Primary Input | Key Outputs |
|-------|----------|--------------|-------------|
| 1 | `roadmap.json` | Implementation plan (Step 4) + evals.json + architecture.md + decomposition rules (Step 6) | Sized subtasks with eval IDs, acceptance criteria, context needs |
| 2 | `claude.md` | All above (summary/overview) | Concise project overview for agent orientation |

For each document: copy template from `templates/`, replace all placeholders, cross-reference terms across all documents, flag gaps with `<!-- TODO -->` or `"TODO"` field.

#### Eval ID Assignment

When populating `roadmap.json`, assign eval IDs to each task:

1. For each task, identify which PRD user stories and acceptance criteria it implements (from the implementation plan)
2. Look up those user stories in `docs/evals.json` -- each maps to a feature eval group (via `derived_from`)
3. Assign the relevant eval scenario IDs (e.g., `FE-001-HP-01`) to the task's `eval_ids` array
4. For integration and non-functional evals, assign to the task whose scope most directly exercises that requirement
5. Verify: every eval ID in `docs/evals.json` is assigned to at least one task. If an eval has no task, create one or document why it is deferred.

### Step 6: Apply Decomposition Rules to Roadmap

When generating `roadmap.json`, apply the following sizing rules and decomposition checklist.

#### Sizing Rules

| Subtask Size | Guideline |
|---|---|
| **Too Small** | Less than 15 min of agent work, trivial edits -- batch these together |
| **Right Size** | 30-90 min of scoped work, clear acceptance criteria, touches 10 files or fewer |
| **Too Large** | More than 2 hours, crosses architectural boundaries, requires multiple design decisions |

#### Decomposition Checklist

For each subtask, ensure:

- [ ] **Self-contained** -- Can be executed without needing decisions from a prior uncompleted task
- [ ] **Clear entry point** -- The `roadmap.json` tells the agent exactly where to start
- [ ] **Clear exit point** -- Acceptance criteria are binary (done / not done)
- [ ] **Context-bounded** -- The agent only needs to read 5 files or fewer to have full context
- [ ] **Branch-ready** -- Each task maps to a git worktree / branch for isolation
- [ ] **Files identified** -- The task's `files_to_modify` field lists all files it expects to create or modify (used by wave computation for overlap detection)
- [ ] **Testable** -- There is a way to verify the task was done correctly (linked to eval IDs)
- [ ] **Eval-linked** -- At least one eval ID from `docs/evals.json` is assigned to this task (see Step 5 Eval ID Assignment procedure)
- [ ] **Issue-linked** -- Each task has an `issue_number` field linking to its GitHub issue

### Step 6b: Compute Execution Waves

After generating `roadmap.json`, compute the execution wave plan. **`wave-execution.md` is the authoritative algorithm** — follow its rules exactly:

1. Group tasks with no dependencies into Wave 1
2. For each subsequent wave, include tasks whose `depends_on` are all in earlier waves
3. Verify no file overlap between tasks in the same wave
4. Cap each wave at 3 tasks maximum
5. Solo-wave any task that touches > 5 files or has > 3 acceptance criteria
6. Store the result in `roadmap.json` -> `execution_plan.waves` and set each task's `wave` field
7. Write a `rationale` for each wave

### Step 7: Create GitHub Issues

Invoke the `/plan-to-issues` skill from `skills/plan-to-issues/SKILL.md`.

Use the plan file (from Step 4) and the roadmap (from Step 5) as input. The skill creates GitHub issues for each vertical slice with blocking relationships and updates `roadmap.json` with the resulting `issue_number` fields.

> **Sequencing:** Step 7 MUST complete before Step 8 runs. Wave validation (Step 8) checks that every task has a valid `issue_number` — these are populated by `/plan-to-issues` in this step. If issue creation is skipped or fails, wave validation will fail.

### Step 8: Validate Completeness

Before presenting documents to the user, run this checklist:

| Check | Requirement |
|-------|------------|
| No unfilled placeholders | No `[Project Name]`, `[X.X]`, `[timestamp]` remaining |
| No empty sections | Every section has content (even if brief) |
| Eval coverage | Every user story in `docs/prd.md` has at least one eval in `docs/evals.json` |
| Eval linkage | Every task in `roadmap.json` references at least one eval ID |
| Consistent terminology | Component names match across all documents |
| Cross-references valid | Every component in `docs/evals.json` or `roadmap.json` exists in `docs/architecture.md` |
| Context needs bounded | Every task's `context_needed` lists 5 files or fewer |
| Complexity match | Number of tasks aligns with complexity estimate (S: 5-10, M: 10-25, L: 25+) |
| GitHub issues created | Every task in `roadmap.json` has a valid `issue_number` |
| Issue-roadmap alignment | GitHub issue titles and acceptance criteria match `roadmap.json` entries |

### Step 9: Present for Review

Present all documents to the user for review. For each document, highlight:
- Key decisions made during generation
- Any gaps flagged with `<!-- TODO -->` markers
- Areas where Phase 1 context was ambiguous

Wait for user approval of all documents before proceeding.

---

## Exit Gate

Before leaving Phase 2, the agent MUST verify all of the following:

### Core Gates (always required)

| Check | How to Verify | Required |
|-------|---------------|----------|
| `claude.md` exists and populated | File exists, Purpose section is not placeholder | Yes |
| `docs/prd.md` exists and populated | File exists, User Stories section has entries | Yes |
| `docs/design.md` exists and populated | File exists, User Flows and Screen Inventory sections have entries | Yes |
| `docs/architecture.md` exists and populated | File exists, each component has Responsibility, Interfaces, and Key Dependencies filled | Yes |
| `docs/evals.json` exists and populated | File exists, at least one Feature Eval with scenarios | Yes |
| `roadmap.json` exists and populated | File exists, at least one track with subtasks, at least one task has status `"Not Started"` | Yes |
| All subtasks have eval IDs | Every task in roadmap references specific eval IDs from `docs/evals.json` | Yes |
| Context needs bounded | Every task's `context_needed` lists 5 files or fewer | Yes |
| Cross-references consistent | Components and endpoints in `docs/evals.json` and `roadmap.json` exist in `docs/architecture.md` | Yes |
| Decomposition rules verified | Subtask sizing, acceptance criteria, context needs, and checklist all pass (Step 6 above) | Yes |
| Execution waves computed | `execution_plan.waves` exists in `roadmap.json` with valid wave assignments | Yes |
| Wave validation passes | No mutual dependencies or file overlap within waves, max 3 tasks per wave, rationales documented | Yes |
| Every task has `wave` field | Each task in `roadmap.json` has a numeric `wave` assignment | Yes |
| User approved all documents | User has reviewed and confirmed each document | Yes |

### GitHub Gates (if `gh` CLI is available)

> Skip this section if `gh` is not installed or not authenticated. Run `gh auth status` to check. See `github-issue-sync.md` for details.

| Check | How to Verify | Required |
|-------|---------------|----------|
| Every task has `issue_number` | Each task in `roadmap.json` links to a GitHub issue | If GitHub available |
| GitHub issues created | Issues exist with correct blocking relationships and parent PRD reference | If GitHub available |
| Wave milestones created | Each wave in `execution_plan.waves` has a corresponding GitHub milestone | If GitHub available |
| Label schema applied | Labels from `github-issue-sync.md` Section 1.3 exist in the repo | If GitHub available |
| PRD tracking issue created | A PRD issue exists and `prd_issue_number` is set in `roadmap.json` | If GitHub available |

### Quick-Reference Checklist

Copy this checklist into your working notes and check off each item:

Phase 2 Exit Gate Checklist
===========================

Core Gates:
[ ] claude.md exists — Purpose section is not placeholder
[ ] docs/prd.md exists — User Stories section has entries
[ ] docs/design.md exists — User Flows and Screen Inventory populated
[ ] docs/architecture.md exists — each component has Responsibility, Interfaces, Key Dependencies
[ ] docs/evals.json exists — at least one Feature Eval with scenarios
[ ] roadmap.json exists — at least one track with subtasks, at least one "Not Started"
[ ] All subtasks have eval IDs referencing docs/evals.json
[ ] Every task's context_needed lists 5 files or fewer
[ ] Cross-references consistent across all documents
[ ] Decomposition rules verified (Step 6 checklist)
[ ] execution_plan.waves exists with valid wave assignments
[ ] No mutual dependencies or file overlap within waves, max 3 per wave, rationales documented
[ ] Every task has a numeric wave field
[ ] User approved all documents

GitHub Gates (skip if gh unavailable):
[ ] Every task has issue_number
[ ] GitHub issues created with blocking relationships
[ ] Wave milestones created
[ ] Label schema applied
[ ] PRD tracking issue created with prd_issue_number set

---

## When You're Done — Transition Protocol

After the exit gate passes:

1. **Generate session summary** listing all documents created, GitHub issues created, key decisions, and any flagged gaps
2. **Present summary** to user for approval
3. **Save summary** to `session-summary/YYYY-MM-DD-phase-2.md` (create directory if needed: `mkdir -p session-summary`)
4. **Commit** all generated documents and the summary
5. **Clear conversation** — the generated documents are on disk; the generation conversation is no longer needed

> If checkpointing was used, the Phase 2c summary is the canonical Phase 2 session summary for downstream phases. Earlier checkpoint summaries (2a, 2b) are retained for audit but are not read by subsequent phases.

> **Important for Phase 3 agents:** When entering Phase 3 after a checkpointed Phase 2, read the **Phase 2c** summary (not 2a or 2b). The 2c summary is the canonical Phase 2 summary that covers the final state including issues, waves, and validation. The filename pattern is `session-summary/YYYY-MM-DD-phase-2c.md`.

> **Next session:** Reads the summary, runs Phase 3 Entry Gate, and executes Task 1.1 from `roadmap.json`.
