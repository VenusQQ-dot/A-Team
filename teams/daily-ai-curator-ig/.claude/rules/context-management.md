---
name: Context Management
description: Task isolation, dispatch format, structured returns, and worklog-based context recovery
---

# Context Management

## Applicability

- Applies to: All agents (coordinator has additional responsibilities)

## Rule Content

### Coordinator Dispatch Requirements

Every Task dispatch must include:
1. **Current worklog path** — where the agent writes its outputs
2. **Upstream reference paths** — worklog files the agent must read (e.g., the research brief, the topic decision)
3. **Task scope summary** — what this task accomplishes, not the whole project context

Pass paths, never inline full upstream content.

### XML Tag Separation in Dispatch

Wrap all variable data in descriptive XML tags; keep instructions outside the tags:

```
<task_scope>Write the 8-page script for the selected topic.</task_scope>
<topic_decision_path>.worklog/202607/daily-2026-07-06/phase-2-topic/decisions.md</topic_decision_path>
<research_brief_path>.worklog/202607/daily-2026-07-06/phase-1-research/research-brief.md</research_brief_path>
<worklog_path>.worklog/202607/daily-2026-07-06/phase-3-script/</worklog_path>
```

### Agent Return Format

Structured summary only — full detail goes to the worklog:

```markdown
## Task Completion: {task name}
### Status: {DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT}
### Key Outcomes
### Decisions Made
### Artifacts Produced
### Worklog Updated
### Issues / Blockers (if any)
```

Status semantics and coordinator handling:
- **DONE** → proceed. **DONE_WITH_CONCERNS** → evaluate and log concerns before proceeding.
- **BLOCKED** → resolve the blocker before re-dispatch; agents state attempts (max 3), failure, and unblock need.
- **NEEDS_CONTEXT** → provide the missing items and re-dispatch.

### Task Isolation

Every independent unit of work runs as a separate Task with a fresh context. The coordinator accumulates summaries only and performs no production work inline.

### Phase-End Archival and Recovery

At each phase end the coordinator verifies worklog completeness, writes a phase summary to its own tracking, and releases phase-specific context. Recovery: read the latest phase worklog plus all `decisions.md` files, resume from the last completed phase boundary.

### Context Budget Proxies

- After 5 sequential dispatches in one phase, the coordinator writes an interim worklog summary before continuing
- An agent exceeding 10 exchanges with the coordinator summarizes to the worklog; coordinator splits remaining work
- Any agent response over 3000 words is split: summary returned, full content to the worklog

## Violation Determination

- Dispatch without a worklog path → Violation
- Dispatch inlining full upstream content instead of paths → Violation
- Agent returns raw unstructured output over 500 words with no worklog reference → Violation
- Coordinator produces carousel copy, prompts, or research inline → Violation

Violation scenario: chief-editor pastes the entire research brief into the carousel-writer dispatch "to save a read" — the writer's context starts polluted and the brief now exists in two diverging copies → Violation.

## Exceptions

- Sub-200-word ad-hoc clarifications between coordinator and an agent may be inline without a worklog write.
