---
name: generate-evals
description: Generate docs/evals.json from the PRD and architecture document. Produces concrete evaluation scenarios with specific inputs and expected outputs for every user story. Use when user wants to create evals, generate test scenarios, or build the evaluation suite before implementation.
---

# Generate Evals

Generate a structured evaluation suite (`docs/evals.json`) from the PRD and architecture document. Every user story gets concrete, testable eval scenarios before any code is written.

## Input / Output

| | File | Description |
|---|---|---|
| **In** | `docs/prd.md` | Product requirements from /write-prd (required) |
| **In** | `docs/architecture.md` | Technical architecture from /write-architecture (required) |
| **In** | `docs/design.md` | Design document from /write-design (optional -- use if available) |
| **Out** | `docs/evals.json` | Evaluation suite conforming to `templates/evals.schema.json` |

## Process

### 1. Load context

Read `docs/prd.md` and `docs/architecture.md`. If either is missing, stop and tell the user which file is needed before proceeding.

If `docs/design.md` exists, read it as well -- the screen inventory (`SCR-NNN` IDs) provides additional eval coverage for UI-facing scenarios.

### 2. Extract eval sources

From the inputs, identify all testable requirements:

- **User stories** (`US-NNN`) from `docs/prd.md` -- each one MUST produce at least one feature eval
- **Architecture components** from `docs/architecture.md` -- identify integration points between components
- **Non-functional requirements** from `docs/prd.md` -- performance, security, accessibility targets
- **Screen inventory** (`SCR-NNN`) from `docs/design.md` (if available) -- UI-specific validation scenarios

### 3. Generate feature evals

For each user story (`US-NNN`), create a feature eval group:

1. Assign a feature eval group ID using the `FE-NNN` scheme (e.g., `FE-001`, `FE-002`)
2. Set `feature_name` to a concise description of the feature
3. Set `derived_from` to the PRD section and user story ID (e.g., `"PRD Section 3.1, US-001"`)
4. Generate scenario arrays:

   **`happy_path`** (at least one required):
   - The core success path for the user story
   - Scenario IDs use the pattern `FE-NNN-HP-NN` (e.g., `FE-001-HP-01`)

   **`edge_cases`**:
   - Boundary values, empty inputs, maximum lengths, concurrent operations
   - Scenario IDs use the pattern `FE-NNN-EC-NN` (e.g., `FE-001-EC-01`)

   **`failure_modes`**:
   - Invalid input, unauthorized access, missing dependencies, network failures
   - Scenario IDs use the pattern `FE-NNN-FM-NN` (e.g., `FE-001-FM-01`)

For every eval scenario, populate all required fields:
- `id` -- unique ID per the scheme above
- `scenario` -- what is being tested (one sentence)
- `input_setup` -- specific input or precondition state (concrete, not vague)
- `expected_output` -- exact expected result (concrete, not vague)
- `test_file` -- set to `null` (no test exists yet; `/tdd` populates this with the actual test file path during the RED stage)
- `status` -- set to `"NOT_TESTED"`

### 4. Generate integration evals

For each integration point between architecture components (e.g., API calls between services, database interactions, event flows):

1. Assign an integration eval ID using the `INT-NNN` scheme (e.g., `INT-001`)
2. List the `components_involved` by name (matching `docs/architecture.md` component names exactly)
3. Describe the `scenario` and `expected_behaviour` concretely
4. Set `test_file` to `null` and `status` to `"NOT_TESTED"`

### 5. Generate non-functional evals

For each non-functional requirement in the PRD (performance, security, accessibility, etc.):

1. Assign a non-functional eval ID using the `NF-NNN` scheme (e.g., `NF-001`)
2. Set `category` to the requirement type (e.g., `"Performance"`, `"Security"`, `"Accessibility"`)
3. Describe the `scenario` concretely
4. Set `threshold` to a measurable pass/fail criterion (e.g., `"< 200ms"`, `"Rejected with 403"`, `"All interactive elements keyboard-accessible"`)
5. Set `test_file` to `null` and `status` to `"NOT_TESTED"`

### 6. Populate metadata and rules

Fill in the top-level fields:

- `project_name` -- from `docs/prd.md` title
- `last_updated` -- current ISO 8601 timestamp
- `summary` -- set `total_scenarios` to the count of all eval scenarios across all categories; set `passing`, `failing` to `0`; set `not_yet_tested` equal to `total_scenarios`
- `rules` -- populate with standard eval lifecycle rules:
  - `when_generated`: `"Phase 2, after architecture.md is approved, before implementation begins"`
  - `how_linked`: `"Each eval references its source PRD user story via derived_from (feature evals) or architecture components (integration evals)"`
  - `when_validated`: `"During Phase 3 TDD execution — /tdd updates status and test_file fields"`
  - `adding_evals`: `"New evals may be added during implementation if edge cases are discovered. Append to the relevant array and add a change_log entry"`
  - `deprecation`: `"Evals are never deleted. Set status to DEPRECATED and add a change_log entry with the reason"`
  - `test_protection`: `"Never remove, weaken, or skip an eval. Fix the code, not the eval"`
- `quality_criteria` -- define what makes a good eval (concrete inputs/outputs, no vague assertions)
- `testing_protocol` -- set `tool` and `approach` based on the project's tech stack from `docs/architecture.md`

### 7. Populate change log

Create an initial `change_log` entry for every eval:

- `date` -- current ISO 8601 date
- `task_id` -- `null` (initial generation, not tied to a roadmap task)
- `eval_id` -- the eval's ID
- `change_type` -- `"CREATED"`
- `description` -- `"Initial generation from PRD and architecture"`

### 8. Validate output

Before writing the file, verify:

- [ ] **Schema compliance** -- output conforms to `templates/evals.schema.json` with `additionalProperties: false`
- [ ] **Coverage** -- every `US-NNN` from `docs/prd.md` maps to at least one feature eval via `derived_from`
- [ ] **Concreteness** -- no eval has vague `input_setup` or `expected_output` (e.g., reject "valid input" or "correct response" -- use specific values)
- [ ] **ID uniqueness** -- no duplicate eval IDs across all categories
- [ ] **Consistent terminology** -- component names in integration evals match `docs/architecture.md` exactly
- [ ] **Summary accuracy** -- `total_scenarios` equals the actual count of all scenarios; `not_yet_tested` equals `total_scenarios`

### 9. Write evals.json

Save the validated output to `docs/evals.json` in the target project.

## Key Rules

- Every user story MUST have at least one eval -- no story goes untested
- Evals MUST be concrete -- specific inputs, specific expected outputs, measurable thresholds
- All statuses MUST be `"NOT_TESTED"` -- this skill runs before any code exists
- All `test_file` fields MUST be `null` -- populated later by `/tdd` during the RED stage
- Follow the schema strictly -- `additionalProperties: false` is enforced at every level
- Evals are never deleted -- only deprecated via status change and change log entry

## Completion

`docs/evals.json` is populated, validated against `templates/evals.schema.json`, and saved to the target project. Every PRD user story has at least one eval. All scenarios have concrete inputs and expected outputs.

## Phase Integration

- **Phase 2 (Specification + Eval Generation)**: Invoked at Step 3 Order 3, after `/write-architecture` and before `/prd-to-plan`. Replaces the manual evals.json generation previously owned by Phase 2 directly.
- **Standalone**: Can be invoked independently to create or regenerate `docs/evals.json` at any point, given `docs/prd.md` and `docs/architecture.md` exist.
- **Downstream**: `/tdd` consumes `docs/evals.json` -- updates `status` and `test_file` fields during implementation.
