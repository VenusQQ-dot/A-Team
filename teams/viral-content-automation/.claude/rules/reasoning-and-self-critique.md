---
name: Reasoning and Self-Critique
description: Structural reasoning gate before every workflow and self-critique gate after every draft
---

# Reasoning and Self-Critique

## Applicability

- Applies to: All agents (every agent .md contains a `## Reasoning` and a `## Self-Critique` section)

## Rule Content

### Two Structural Gates

1. **`## Reasoning` gate** — before the workflow. Four labeled slots: **Knowns / Unknowns / Plan / Risks**. All four filled before work starts; recorded in the worklog or task return.
2. **`## Self-Critique` gate** — after the workflow produces a draft, before submission. Five labeled checks: **Evidence / Position / Counterexample / Completeness / Failure Mode**. If any check fails, revise and re-run all five.

Section order in every agent .md: `## Reasoning` → `## Workflow` → `## Self-Critique`, adjacent and in that order.

### When the Gates Apply

Every output that crosses an agent boundary: worklog decisions, generated assets and reports, returns to the coordinator, queues and verdicts delivered onward. Internal scratch work that never leaves the agent is exempt.

### Coordinator Pre-Dispatch Variant

`content-director` additionally fills a **Pre-Dispatch Reasoning** gate before each Task dispatch: what the dispatch must achieve, why this agent, inputs confirmed ready, predicted failure modes.

### Self-Critique Cannot Be Outsourced

The producing agent runs its own Self-Critique. `content-qa`, `code-reviewer`, and `process-reviewer` are additional layers, not replacements. Submitting unreviewed output expecting downstream review to catch errors is a violation regardless of whether it does.

### Failure Recovery

If Self-Critique exposes a gap that revision cannot close after 3 attempts, escalate with `INSUFFICIENT_DATA` or `BLOCKED` naming the specific gap — never submit known-flawed output.

## Violation Determination

- Agent .md missing either gate section, or sections out of order → Violation
- Reasoning block missing any of the four slots; Self-Critique missing any of the five checks → Violation
- Coordinator missing `## Pre-Dispatch Reasoning` → Violation
- Output submitted with no Knowns/Unknowns/Plan/Risks record in worklog or return → Violation

Violation scenario: carousel-producer delivers "7/7 slides verified" but its worklog contains no per-slide check results and its return shows no Risks slot — the verification claim is unauditable and the gate was skipped.

## Exceptions

- Single clarification questions during interactive conversation may skip the full gates; both gates run before any artifact is produced.

Tradeoff: the gates add structured reasoning before and after every dispatch — real cost on trivial tasks. The payoff is catching evidence gaps and hedged verdicts before they reach the publish queue, where errors cost account credibility.
