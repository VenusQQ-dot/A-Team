---
name: Worklog
description: Define the daily worklog structure and evidence chain requirements for every run
---

# Worklog

## Applicability

- Applies to: All agents (every agent reads from and writes to the worklog during task execution)

## Rule Content

### Structure

Every daily run maintains a worklog:

```
.worklog/{yyyymm}/daily-{yyyy-mm-dd}/phase-{n}-{label}/
  ├── references.md    ├── findings.md    └── decisions.md
```

Phase labels for this team: `phase-1-research`, `phase-2-topic`, `phase-3-script`, `phase-4-prompts-caption`, `phase-5-review`, `phase-6-assembly`, `phase-7-retrospective`. All names kebab-case.

### Required Files Per Phase

- `references.md` — every source consulted: URL or file path, description, how it was used. The research phase's research brief lives here alongside it.
- `findings.md` — discoveries and analysis; every finding traces to at least one reference.
- `decisions.md` — every decision with rationale, alternatives rejected, supporting evidence, and downstream impact. Structure adaptations (e.g., 警示型 P3–P5 scenario substitution), window widenings, and prompt subject substitutions are decisions and must be logged.

### Evidence Chain

references → findings → decisions. A decision with no traceable evidence chain is a violation. When no external reference exists, `references.md` states "No established reference found for {topic}" and the decision documents first-principles reasoning.

### Timing

- The coordinator creates each phase folder before dispatching that phase
- Agents write during and at the end of their phase work
- The coordinator verifies three-file completeness at every phase boundary before proceeding

### Worklog as External Memory

Downstream agents read upstream worklogs instead of receiving full content in dispatch. Interrupted runs resume by reading the latest phase worklog plus all completed phases' `decisions.md`.

## Violation Determination

- A phase completes with no worklog directory or a missing core file → Violation
- A decision (e.g., "widened window to 72h") appears in output but not in `decisions.md` → Violation
- A finding cites no source → Violation
- Coordinator advances a phase without verifying worklog completeness → Violation

Violation scenario: carousel-writer adapts P3–P5 for a 警示型 topic but leaves `decisions.md` empty — the adaptation is undocumented and unreviewable → Violation.

## Exceptions

- A phase that only collects input and makes no design choice may have `decisions.md` containing exactly: "No decisions made in this phase — input collection only."
