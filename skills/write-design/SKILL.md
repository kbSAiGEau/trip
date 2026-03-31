---
name: write-design
description: Generate design.md for a target project using the Echo Check, PRD, and (for UI projects) Google Stitch for visual prototyping. Outputs a populated design document. For UI projects, includes user-approved Stitch prototypes. For non-UI projects (APIs, CLIs, libraries), produces an interface design document covering API surfaces, data models, and contracts. Use when user wants to create a design document, generate UI/UX design, prototype screens, or define API/interface design.
---

# Write Design

Generate a design document through structured extraction of requirements, visual prototyping (for UI projects) or interface design (for non-UI projects), and iterative user review. Outputs a populated `design.md`.

## Prerequisites

- **Stitch MCP server** (UI projects only): Must be configured in your Claude MCP settings, OR you must be prepared to run Stitch externally and provide the output manually when prompted. See "Stitch MCP Configuration" below for setup. Non-UI projects do not require Stitch.

## Input / Output

| | File | Description |
|---|---|---|
| **In** | `docs/echo-check.md` | Validated intent from /grill-me |
| **In** | `docs/prd.md` | Product requirements from /write-prd |
| **Out** | `docs/design.md` | Design document (with Stitch prototypes for UI projects, or interface design for non-UI projects) |

## Inputs (Detail)

| Input | Source | Purpose |
|-------|--------|---------|
| Echo Check / Phase 1 session summary | `session-summary/` | Primary context -- design preferences, constraints, confirmed decisions |
| `prd.md` | Project docs | User stories, acceptance criteria, functional requirements |
| Existing design artifacts | Project docs | Any prior design work, brand guidelines, or style references |

## Process

### 1. Load context

Read the Echo Check (or Phase 1 session summary), PRD, and any existing design artifacts in the project. Extract:

- **Design preferences** from the Echo Check (style, palette, responsive strategy, accessibility targets)
- **User stories** from `prd.md` (every user-facing interaction)
- **Constraints** (platform targets, performance budgets, brand requirements)
- **Existing patterns** (if iterating on an existing project, identify current design conventions)

If the Echo Check is missing, halt and direct the user to run `/grill-me` first.

### 2. Determine project type

Based on the PRD and Echo Check, classify the project:

- **UI project** — PRD mentions screens, pages, views, UI components, visual layouts, or user-facing graphical interfaces. Proceed with the full visual design flow (Steps 3-7).
- **Non-UI project** — PRD describes an API-only service, CLI tool, library, SDK, or backend service with no graphical UI layer. Proceed with the interface design flow (Step 2a).

If unclear, ask the user: "Does this project have a user-facing graphical interface, or is it an API/CLI/library?"

#### 2a. Non-UI project: Interface design

For non-UI projects, skip Steps 3-4 (Stitch prototyping) entirely. Instead, extract from the PRD and Echo Check:

- **API/SDK surface design** — endpoints, method signatures, CLI commands and flags, public interfaces
- **Data model / schema design** — domain entities, relationships, request/response shapes
- **Interface contracts between components** — how modules communicate, message formats, protocols
- **Error response design** — error codes, error message format, error hierarchies

Populate `design.md` using the non-UI sections of the template (see `templates/design.md`). Then skip directly to Step 7 (Review and revise loop).

### 3. Extract UI requirements (UI projects only)

Walk through every user story in `prd.md` and identify:

- All user-facing screens and views
- Navigation flows between screens
- Interaction patterns (forms, modals, drag-and-drop, real-time updates)
- State variations per screen (loading, empty, error, success, partial)
- Responsive breakpoints and layout shifts

Produce a **Screen Inventory draft** -- a flat list of every distinct screen with its purpose and the user stories it serves. Assign each screen a unique ID using the `SCR-NNN` scheme (e.g., SCR-001, SCR-002) and link each screen back to the PRD user stories it implements using `US-NNN` IDs.

### 4. Generate Stitch prompts (UI projects only)

For each major screen and flow, craft a natural-language prompt optimized for Google Stitch input. Each prompt should include:

- Screen purpose and primary user action
- Key UI elements and their hierarchy
- Design constraints from the Echo Check (palette, typography, style direction)
- Responsive requirements (mobile-first, desktop-first, or specific breakpoints)
- Component reuse notes (reference earlier screens to maintain consistency)

Group prompts by flow so Stitch generates cohesive screen sequences rather than isolated views.

### 5. Send to Stitch (UI projects only)

Non-UI projects skip this step entirely — proceed from Step 2a directly to Step 7.

**If Stitch MCP is configured:** Use the MCP tools to generate and retrieve prototypes:

1. `build_site` -- generate the full prototype from prompts
2. `get_screen_image` -- retrieve visual output for each screen
3. `get_screen_code` -- retrieve component code for the design system extraction

**If Stitch MCP is not configured:** Present the crafted prompts to the user with instructions:

> "These prompts are ready for Google Stitch. Paste each into Stitch, generate the screens, and share the output back here so I can extract the design system and populate design.md."

**HALT here.** Do NOT proceed to Step 6 until the user provides the Stitch output. This is a manual handoff, not a fallback — the skill cannot generate a UI design document without visual prototype output. Wait for the user to share Stitch screenshots, exported code, or URLs before continuing.

### 6. Populate design.md (UI projects only)

Copy the template from `templates/design.md` into the project. Fill each section using the Stitch output and PRD context:

| Section | Primary Source |
|---------|---------------|
| **1. Design Principles** | Echo Check design decisions, user needs from PRD |
| **2. User Flows** | PRD user stories, refined by Stitch prototype navigation |
| **3. Visual Design System** | Stitch output -- extract colors, typography, spacing, components |
| **4. Screen Inventory** | Stitch screens mapped to PRD user stories (every user story screen accounted for) |
| **5. Interaction Patterns** | State handling, navigation, and feedback from Stitch prototypes and PRD acceptance criteria |
| **6. Responsive & Adaptive Design** | Echo Check responsive strategy, Stitch breakpoint output |
| **7. Accessibility** | Echo Check accessibility targets, WCAG compliance plan |
| **8. Design Decisions Log** | Key choices made during this process -- decision, alternatives, rationale |

Cross-reference all component names and screen names against the PRD to ensure consistent terminology.

### 7. Review and revise loop

Present the populated `design.md` (and Stitch prototypes, for UI projects) to the user. Ask:

> "Review the design document. Request changes or approve."

**If changes requested:**

**UI projects:**
1. Identify affected sections and Stitch screens
2. Revise Stitch prompts for the changed screens
3. Regenerate via Stitch (MCP or manual handoff)
4. Update the affected sections of `design.md`
5. Re-present for review

**Non-UI projects:**
1. Identify affected sections
2. Revise the interface design content
3. Update `design.md`
4. Re-present for review

**Do NOT proceed until the user explicitly approves.** This loop continues until approval -- there is no turn limit. Treat this the same as grill-me's Discovery Checklist gate: the user is the sole arbiter of design quality.

### 8. Save approved design.md

Save the final `design.md` to the project (e.g., `docs/design.md`). If Stitch generated exportable assets or code, note their locations in the Design Decisions Log.

## Stitch MCP Configuration

To enable automated Stitch prototyping, add the Stitch MCP server to your Claude configuration:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["@_davideast/stitch-mcp", "proxy"]
    }
  }
}
```

**First-time setup:** Run `npx @_davideast/stitch-mcp init` to authenticate with Google Stitch.

**Without Stitch MCP (UI projects):** If Stitch MCP is unavailable, the skill generates Stitch prompts and HALTs. The user must run Stitch externally and provide the output before the skill can continue. This is a manual handoff, not an automatic fallback — the skill cannot proceed without prototype output for UI projects.

**Non-UI projects:** API-only, CLI, library, and backend service projects use the interface design path (Step 2a) and skip Stitch entirely. This is a supported execution mode, not a degradation.

## Prototype Asset Management

Stitch-generated prototypes are referenced in design.md as follows:

**(a) If using Stitch MCP:** The MCP manages asset storage — reference prototypes by their Stitch-assigned URLs or IDs in the relevant design.md sections.

**(b) If running manually (no MCP):** User provides Stitch screenshot URLs or exported image paths. Save references in design.md Section 4 (Screen Inventory) under each screen's Layout field.

## Completion

`design.md` is populated, user-approved, and saved to the project. The document is ready for downstream consumption by `/write-architecture`, `/prd-to-plan`, and other specification skills.

## Phase Integration

- **Phase 2 (Specification + Eval Generation)**: Core execution unit for `design.md` generation. Invoked after `/write-prd` (Step 2), before architecture generation (Step 3, order 2). See Phase 2, Step 3, order 1.
- **Standalone**: Can be invoked independently to create or revise `design.md` at any point in the project lifecycle.
