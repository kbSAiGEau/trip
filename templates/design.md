# Design: [Project Name]

<!--
PROJECT CUSTOMISATION:
- Replace [Project Name] with the actual project name
- For backend-only or CLI projects, Section 2 (User Flows) and Section 3 (Visual Design System) can be abbreviated but should still document any user-facing output formatting or terminal UI conventions
- For design-system-heavy projects, expand Section 3 with token tables, component variant matrices, and Figma/asset links
- For projects with no UI at all (e.g., libraries, APIs), this document can focus on developer experience design: API ergonomics, error message design, and documentation structure
- Wireframes can be described in text, ASCII, or Mermaid diagrams — the goal is communicating layout and hierarchy, not pixel-perfect mockups
- Every screen/view referenced in user stories (prd.md) should appear in the Screen Inventory
-->

## 1. Design Principles
<!-- Core design values that guide decisions (e.g., "progressive disclosure", "mobile-first", "minimal cognitive load") -->
<!-- These should trace back to user needs identified in prd.md -->

## 2. User Flows
<!-- Key task flows showing how users move through the application or interact with the API/CLI -->
<!-- Use Mermaid flowcharts or numbered step lists -->
<!-- Each flow should map to one or more user stories in docs/prd.md using US-NNN IDs -->
<!-- **Non-UI projects:** Document request/response flows, CLI command sequences, or SDK usage patterns instead of screen-based navigation -->

### 2.1 [Primary Flow]
<!-- e.g., Onboarding, Core Task Completion, Primary API workflow, Main CLI command -->

### 2.2 [Secondary Flow]
<!-- e.g., Settings, Error Recovery, Admin endpoints, Auxiliary commands -->

## 3. Visual Design System / Interface Design

<!-- **UI projects:** Fill in sections 3.1-3.4 below. -->
<!-- **Non-UI projects (APIs, CLIs, libraries):** Replace sections 3.1-3.4 entirely with the following sections:
     ### 3.1 API/CLI Output Design
     Document output formats (JSON, text, table), response envelope structure, and pagination patterns.
     ### 3.2 Error Response Design
     Document error codes, error message format, error object structure, and HTTP status code mapping.
     ### 3.3 SDK/Interface Conventions
     Document naming conventions, method signature patterns, return types, and configuration patterns.
-->

### 3.1 Color Palette
<!-- UI projects only. Primary, secondary, accent, semantic colors (success, warning, error, info) -->
<!-- Include contrast ratios for accessibility compliance -->

### 3.2 Typography
<!-- UI projects only. Font families, size scale, weight usage, line heights -->

### 3.3 Spacing & Layout
<!-- UI projects only. Grid system, spacing scale, breakpoints for responsive design -->

### 3.4 Component Library
<!-- UI projects only. Reusable UI components: buttons, inputs, cards, modals, etc. -->
<!-- For each: variants, states (default, hover, active, disabled, error), and usage guidelines -->

## 4. Screen Inventory / Interface Inventory
<!-- **UI projects:** List every distinct screen/view in the application. -->
<!-- For each screen: purpose, key elements, layout description or wireframe -->
<!-- Use the ID scheme SCR-NNN. Link back to PRD user stories. -->
<!-- Use pattern `SCR-NNN` (e.g., SCR-001, SCR-002). Each screen or major view gets one ID. Re-use the same ID in architecture.md component traceability. -->

<!-- **Non-UI projects:** Replace screen entries with interface entries documenting:
     - API endpoints (method, path, request/response shape)
     - CLI commands (syntax, flags, output format)
     - SDK public methods (signature, parameters, return type)
     Use ID scheme `IF-NNN` (e.g., IF-001, IF-002) and link back to PRD user stories. -->

### 4.1 [Screen Name] {#SCR-001}
- **ID:** SCR-001
- **User Stories:** US-001, US-003
- **Purpose:**
- **Key Elements:**
- **Layout:**
<!-- Wireframe description, ASCII layout, or Mermaid diagram -->

## 5. Interaction Patterns
### 5.1 State Handling
<!-- How the UI handles: loading, empty, error, success, and partial states -->
<!-- **Non-UI projects:** Document how the API/CLI communicates state — progress output, status codes, partial results -->

### 5.2 Navigation
<!-- Navigation structure, hierarchy, and transitions -->
<!-- **Non-UI projects:** Document command hierarchy (subcommands), API resource relationships, or SDK method chaining -->

### 5.3 Feedback & Affordances
<!-- How user actions are acknowledged: toasts, inline validation, progress indicators -->
<!-- **Non-UI projects:** Document CLI output formatting (spinners, progress bars, colored output), API response metadata, or SDK callback/event patterns -->

## 6. Responsive & Adaptive Design
<!-- UI projects: Breakpoint strategy, layout shifts, touch vs. pointer considerations -->
<!-- Mobile-first or desktop-first approach and rationale -->
<!-- **Non-UI projects:** This section may be omitted or repurposed for platform/environment adaptation (e.g., different OS behaviors, CI vs interactive mode, API versioning strategy) -->

## 7. Accessibility
<!-- UI projects: WCAG target level (e.g., AA) -->
<!-- Keyboard navigation plan, screen reader considerations, focus management -->
<!-- Color contrast requirements, motion/animation preferences -->
<!-- **Non-UI projects:** Document developer accessibility — clear error messages, consistent naming, documentation quality, shell completion support, machine-readable output options -->

## 8. Design Decisions Log
<!-- Key design choices and WHY they were made -->
<!-- Format: Decision | Alternatives Considered | Rationale -->
