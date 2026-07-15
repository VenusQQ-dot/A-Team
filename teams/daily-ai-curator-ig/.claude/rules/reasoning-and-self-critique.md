---
name: Reasoning and Self-Critique
description: Structural think-act-verify gates required around every agent workflow
---

# Reasoning and Self-Critique

## Applicability

- Applies to: All agents

## Rule Content

### Two Structural Gates

Every agent .md contains, in this order relative to `## Workflow`:

1. `## Reasoning` — **before** the workflow, with four labeled slots: **Knowns / Unknowns / Plan / Risks** (Risks must include a falsification condition). Fill all four before starting; record them in the worklog or the task return.
2. `## Self-Critique` — **after** the workflow, with five labeled checks run against the draft before submission: **Evidence Check / Position Check / Counterexample Check / Completeness Check / Failure Mode Check**. If any check fails, revise and re-run all five.

The gates apply to every output that crosses an agent boundary: worklog decisions, draft deliverables, reports to the coordinator, recommendations to the user. Internal discarded scratch work is exempt.

### Coordinator Pre-Dispatch Gate

The coordinator additionally fills a `## Pre-Dispatch Reasoning` gate before every dispatch: **What This Dispatch Must Achieve / Why This Agent / Inputs the Agent Needs / Predicted Failure Modes**.

### Self-Critique Cannot Be Outsourced

The producing agent runs its own critique. Fact-checker, content-reviewer, and process-reviewer are additional layers, not substitutes. Submitting without self-critique and relying on downstream review is a violation even if review catches the issue.

### Failure Recovery

If Self-Critique exposes a gap that revision cannot close after 3 attempts, escalate with `INSUFFICIENT_DATA: {gap}` or `BLOCKED: {attempts, failure, unblock need}` rather than submitting known-flawed output.

## Violation Determination

- Agent .md missing either gate section, or gates out of order around `## Workflow` → Violation
- `## Reasoning` missing any of the four slots; `## Self-Critique` missing any of the five checks → Violation
- Output submitted with no Knowns/Unknowns/Plan/Risks record in worklog or return → Violation
- Coordinator dispatches without the Pre-Dispatch gate → Violation

Violation scenario: caption-writer returns a finished caption whose worklog and return contain no reasoning record; the caption later proves to promise a feature the carousel never covers — exactly what the Evidence Check exists to catch → Violation.

## Exceptions

- During interactive clarification (a single question to the coordinator or user), gates may be deferred — but both must run before any artifact is produced.

Tradeoff: the gates add roughly 30–60 seconds of structured reasoning per dispatch. The payoff is catching evidence gaps and hedged positions before review cycles, which cost far more than the gate.
