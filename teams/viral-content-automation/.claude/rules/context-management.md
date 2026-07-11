---
name: Context Management
description: Task isolation, dispatch format, structured returns, and worklog-based context recovery
---

# Context Management

## Applicability

- Applies to: All agents (coordinator has additional responsibilities)

## Rule Content

### Coordinator Dispatch Requirements

Every Task dispatch from `content-director` must include:

1. **Current worklog path** for the agent's outputs
2. **Upstream reference paths** the agent must read (paths, never full inline content)
3. **Task scope summary** — what this specific task must accomplish

Variable data in dispatches is wrapped in descriptive XML tags; instructions stay outside the tags:

```
<task_scope>Write scripts for topic gpt4o-voice, carousel format.</task_scope>
<upstream_context>.worklog/202607/week-28/phase-1-trend-radar/selected-topics.md</upstream_context>
<worklog_path>.worklog/202607/week-28/phase-2-scripting/</worklog_path>
```

### Agent Return Format

Returns are structured summaries: status, key outcomes, decisions made, artifacts produced (paths + one-liners), worklog updates, issues. Never full file contents or raw API dumps. Every return ends with exactly one status:

- **DONE** — completed with evidence
- **DONE_WITH_CONCERNS** — completed; concerns listed with severity
- **BLOCKED** — cannot proceed; attempts made (max 3 of the same approach), what would unblock
- **NEEDS_CONTEXT** — missing inputs; each item listed with where it might be found

The coordinator handles each status per its Workflow; a BLOCKED task is never re-dispatched unchanged.

### Task Isolation

Every independent unit of work runs as a separate Task (subagent). The coordinator performs no execution work inline. Parallel tasks (carousel-producer ∥ reels-producer; content-qa ∥ code-reviewer) are dispatched in the same message.

### Context Budget Proxies

- 5+ sequential dispatches in one phase → coordinator writes an interim worklog summary before continuing
- Agent exceeding 10 exchanges with the coordinator → summarize to worklog; coordinator splits remaining work
- Agent response exceeding 3000 words → split: summary returned, full content to worklog

### Recovery

After interruption or compaction: read the latest phase worklog, then `decisions.md` of all completed phases, resume from the last verified phase boundary.

## Violation Determination

- Dispatch without worklog path → Violation
- Dispatch with full upstream content inline instead of paths → Violation
- Agent returns raw unstructured output exceeding 500 words without worklog reference → Violation
- Coordinator executes specialist work inline → Violation

Violation scenario: coordinator pastes the full 31-candidate JSON into the curator's dispatch prompt; the curator's context fills with raw data before judgment starts, and the scan data now exists in two diverging copies.

## Exceptions

- Ad-hoc clarifications under 200 words may be passed inline without a worklog write.
