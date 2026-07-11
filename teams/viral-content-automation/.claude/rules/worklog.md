---
name: Worklog
description: Worklog structure and evidence chain requirements for every content cycle
---

# Worklog

## Applicability

- Applies to: All agents (every agent reads from and writes to the worklog during task execution)

## Rule Content

### Every Cycle Must Have a Worklog

Every content cycle maintains a worklog under `.worklog/{yyyymm}/{cycle-name}/phase-{n}-{label}/`. Phase labels for this team: `phase-1-trend-radar`, `phase-2-scripting`, `phase-3-visual-production`, `phase-4-quality-gate`, `phase-5-publishing`, `phase-6-retrospective`.

### Required Files Per Phase

- `references.md` — every source consulted: trend URLs, API endpoints queried (with parameters and timestamps), rule/skill files applied
- `findings.md` — discoveries and analysis: candidate data, verification results, pipeline records; every finding traces to a reference
- `decisions.md` — every decision with rationale, alternatives rejected, supporting evidence, and downstream impact

### Evidence Chain

references → findings → decisions. Every decision must trace back through findings to references. When no external reference exists, `references.md` states "No established reference found for {topic}" and the decision documents first-principles reasoning.

### Timing

- The coordinator creates the cycle worklog structure before dispatching any phase work.
- Agents write during and at the end of their phase work.
- The coordinator verifies three-file completeness at every phase boundary.

### Worklog as Context Offloading

Once written to the worklog, information need not stay in context. Downstream agents read upstream worklogs via paths in their dispatch; returns reference worklog paths instead of repeating content.

## Violation Determination

- Phase completes with no worklog directory → Violation
- Phase worklog missing any of the three core files → Violation
- Decision with no traceable evidence chain → Violation
- Coordinator proceeds past a phase boundary without completeness verification → Violation

Violation scenario: publisher publishes a package and records the post ID only in its return message, not in `publish-queue.md`/worklog — the next cycle cannot verify what was published, and idempotency checks break.

## Exceptions

- Phases producing no decisions (pure collection) may have `decisions.md` containing only: "No decisions made in this phase — input collection only."
