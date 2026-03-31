# [Project Name]

<!--
PROJECT CUSTOMISATION:
- Replace [Project Name] with the actual project name
- Adapt the File Structure section to match your project's actual directory layout
- Add domain-specific sections if needed (e.g., "Environment Variables", "Third-Party Services", "Compliance Notes")
- Keep this file concise — it's the first thing every new agent reads, so it should orient, not overwhelm
- Update "Current Status" and "How to Continue" after EVERY subtask completion
-->

## Purpose
<!-- One paragraph: what this project does and why it exists -->
<!-- (e.g., "A real-time document collaboration platform that synchronizes edits across users with conflict resolution. Built to replace the team's manual copy-paste workflow.") -->

## Tech Stack
<!-- Bullet list of core technologies and frameworks -->
<!-- (e.g., Frontend: React 18, TypeScript; Backend: Node.js + Express; DB: PostgreSQL + Redis; Testing: Jest, Playwright) -->

## Architecture Overview
<!-- Brief description of the system's high-level structure -->
<!-- Include a simple diagram (mermaid or ASCII) for systems with 3+ components -->

## Project Artifacts (Canonical Locations)
<!-- These are the standard locations for framework-generated artifacts. -->
<!-- All skills and phases expect artifacts at these paths. -->

```
project-root/
├── claude.md                  # THIS FILE — project intelligence (read first)
├── roadmap.json               # Living task list — source of truth for progress
├── docs/
│   ├── echo-check.md          # Echo Check output from /grill-me
│   ├── prd.md                 # Product Requirements Document from /write-prd
│   ├── design.md              # Design document from /write-design
│   ├── architecture.md        # Architecture document from /write-architecture
│   └── evals.json             # Evaluation suite (generated Phase 2, before code)
├── plans/                     # Implementation plans from /prd-to-plan
└── session-summary/           # Session summaries (YYYY-MM-DD-taskid.md)
```

## File Structure
<!-- Tree-style representation of the project's source code layout -->
<!-- Adapt this section to match your project's actual directory structure -->
<!-- Annotate key directories with their purpose -->

```
project-root/
├── src/
│   ├── components/     # Reusable UI components
│   ├── services/       # Business logic and API calls
│   ├── utils/          # Shared utilities
│   └── app.ts          # Application entry point
├── tests/              # Test suites
└── ...
```

## Key Conventions
<!-- Coding standards, naming conventions, patterns used -->

## Current Status

**REQUIRED: Update this section after every task completion.** The next agent reads this first. Include: current phase, last completed task ID, next task ID.

<!-- What phase the project is in, what was last completed -->
<!-- This section is updated after every subtask completion -->

## How to Continue
<!-- Instructions for a new agent picking up this project -->
<!-- Always reference roadmap.json for the next task -->
