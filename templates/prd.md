# Product Requirements Document: [Project Name]

<!--
PROJECT CUSTOMISATION:
- Replace [Project Name] with the actual project name
- Add domain-specific sections if needed (e.g., "Regulatory Compliance", "Data Privacy / GDPR")
- User Stories should use the format: "As a [role], I want [capability], so that [benefit]"
- Each User Story feeds directly into evals.json acceptance criteria
-->

## Problem Statement

The problem from the user's perspective.

## Solution

The proposed solution from the user's perspective.

## User Stories

An extensive list using the ID scheme `US-NNN`. Each story follows:

- **US-001:** As a [actor], I want [feature], so that [benefit]
- **US-002:** As a [actor], I want [feature], so that [benefit]

> **GOOD:** "US-001: As a sales rep, I want to filter leads by location, so that I can focus on prospects near upcoming travel."
> **BAD:** "US-001: Add filtering" — missing actor, goal, and benefit; not verifiable.

Cover all aspects of the feature exhaustively. These IDs are referenced by `design.md` (screen inventory), `architecture.md` (component mapping), `evals.json` (`derived_from` field), and `roadmap.json` (task scope).

## Implementation Decisions

Durable decisions made during the interview:

- Modules to build or modify and their interfaces
- Architectural decisions
- Schema changes
- API contracts
- Technical clarifications from the developer

Do NOT include specific file paths or code snippets — they become outdated quickly.

## Testing Decisions

- What makes a good test for this feature (test external behavior, not implementation details)
- Which modules will be tested
- Prior art — similar tests already in the codebase
- Testing approach (integration-style boundary tests preferred)

## Out of Scope

What this PRD explicitly does not cover.

## Further Notes

Any additional context, constraints, or open questions.
