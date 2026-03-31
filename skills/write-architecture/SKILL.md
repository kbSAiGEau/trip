---
name: write-architecture
description: Generate architecture.md for a target project from the Echo Check, PRD, and design.md. Outputs a complete architecture document with system overview, component design, data model, API design, infrastructure plan, and design decisions log. Use when user wants to create or revise an architecture document.
---

# Write Architecture

Generate a complete `architecture.md` from the Echo Check (Phase 1 session summary), PRD, and design document.

## Input / Output

| | File | Description |
|---|---|---|
| **In** | `docs/echo-check.md` | Validated intent from /grill-me |
| **In** | `docs/prd.md` | Product requirements from /write-prd |
| **In** | `docs/design.md` | Design document from /write-design |
| **Out** | `docs/architecture.md` | Technical architecture document |

## Inputs (Detail)

| Input | Source | What to Extract |
|-------|--------|----------------|
| Echo Check / Phase 1 session summary | `session-summary/` | Tech stack decisions, integration choices, deployment preferences, data model discussions, debated alternatives |
| `prd.md` | Project docs | Functional requirements, non-functional requirements, constraints, integrations |
| `design.md` | Project docs | Component structure, interaction patterns, user flows. For UI projects: screen inventory, visual design system. For non-UI projects: API surface design, interface contracts, data model/schema design. |

## Process

### 1. Load context

Read the Echo Check (or Phase 1 session summary), `prd.md`, and `design.md`. If any input is missing, stop and tell the user which file is needed before proceeding.

### 2. Identify architectural drivers

Extract from the inputs:
- **Tech stack decisions** — languages, frameworks, databases, third-party services
- **Scalability requirements** — expected load, growth trajectory, performance targets
- **Security constraints** — authentication, authorization, data protection, compliance
- **Integration points** — external APIs, services, data sources, webhooks
- **Deployment targets** — hosting, environments, containerization, CDN
- **Data model needs** — domain entities, relationships, storage requirements

### 3. Design system components

Define each major component or module:
- **Responsibility** — what it owns, what it does not
- **Implements** — which PRD user stories (`US-NNN`) and, if applicable, design screens (`SCR-NNN`) this component serves. For non-UI projects, trace to API endpoints or interface contracts from `design.md` instead of screens. This enables traceability from requirements through design to code.
- **Interfaces** — public API surface (keep it small)
- **Key Dependencies** — what it consumes, what consumes it

Follow deep-module principles (see `skills/tdd/deep-modules.md`): small interfaces, deep implementations. Prefer fewer components with rich internals over many thin wrappers.

#### Coverage Check

After defining all components, verify complete requirements coverage:

- Every `US-NNN` from `docs/prd.md` is listed in at least one component's **Implements** field
- Every `SCR-NNN` from `docs/design.md` (if applicable — UI projects only) is listed in at least one component's **Implements** field. For non-UI projects, verify that every API endpoint or interface contract from `design.md` is covered instead.
- If any ID is uncovered, add it to an existing component or create a new one
- Document intentional exclusions (e.g., deferred user stories) in the Design Decisions Log (Step 7)

### 4. Define data model

Design the entity-relationship model based on PRD domain entities and `design.md` requirements (screen requirements for UI projects, or data model/schema design for non-UI projects):
- Identify core entities and their attributes
- Map relationships (one-to-one, one-to-many, many-to-many)
- Include a mermaid ER diagram

### 5. Design API / interfaces

Specify endpoints or public interfaces based on PRD functional requirements and `design.md` interaction patterns (or interface contracts, for non-UI projects):
- For web APIs: method, path, request/response shape, auth requirements
- For libraries/CLIs: public functions, arguments, return types
- For event-driven systems: event types, payloads, consumers

### 6. Plan infrastructure

Define environments, CI/CD, hosting, and monitoring based on Echo Check deployment decisions and PRD non-functional requirements:
- Environment topology (dev, staging, production)
- CI/CD pipeline stages
- Hosting and scaling strategy
- Monitoring, logging, alerting

### 7. Document design decisions

Capture every non-obvious architectural choice in the Design Decisions Log. Format:

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|

Source these from Echo Check discussions where choices were debated. If a decision was made without considering alternatives, note that explicitly — it may need revisiting.

### 8. Security and future considerations

- Address security requirements from the PRD (authentication, authorization, encryption, input validation, CORS, rate limiting)
- Document known technical debt and why it is acceptable now
- Outline scaling plans and migration paths for anticipated growth

### 9. Populate architecture.md

Fill each section of the `architecture.md` template (`templates/architecture.md`):
1. Copy the template into the target project
2. Replace all placeholders with real content
3. Include mermaid diagrams for system overview (Step 3) and data model (Step 4)
4. Cross-reference component names and terms with `prd.md` and `design.md` for consistency

### 10. Review and revise loop

Present the completed `architecture.md` to the user. Ask:

> "Review the architecture document. Request changes or approve."

If changes requested:
1. Revise affected sections
2. Update `architecture.md`
3. Re-present the revised document

Do NOT proceed until the user approves.

### 11. Save approved architecture.md

Save the approved document to the target project. The output feeds downstream skills (`prd-to-plan`, `plan-to-issues`) and `evals.json` generation.

## Completion

`architecture.md` is populated, user-approved, and saved to the target project. All sections have content, mermaid diagrams render correctly, and terminology is consistent with `prd.md` and `design.md`.

## Phase Integration

- **Phase 2 (Specification + Eval Generation)**: Core execution unit for `architecture.md` generation. Invoked after `/write-design`, before `evals.json` generation (Step 3, order 2 in Phase 2).
- **Standalone**: Can be invoked independently to create or revise `architecture.md` at any point.
