---
name: Boss
description: Entry point that spawns the chief-editor to run the daily AI carousel production pipeline
disable-model-invocation: true
allowed-tools: ["Agent"]
argument-hint: "[optional: topic override, target date yyyy-mm-dd, or 'generate' to also run Higgsfield]"
---

# Boss

Entry point for the Daily AI Curator IG team. Spawns the `chief-editor` coordinator, which runs the full daily pipeline: research → topic selection → carousel script → Higgsfield prompts + caption → review → assembly → retrospective.

## Execution

1. Parse `$ARGUMENTS`:
   - Empty → full pipeline for today, coordinator starts at Phase 1
   - A topic phrase → pass as `<topic_override>` (strategist validates it against research)
   - A date `yyyy-mm-dd` → pass as `<target_date>`
   - The word `generate` → pass `<execute_generation>true</execute_generation>` (prompt designer may call Higgsfield MCP tools)
2. Spawn the coordinator via the Agent tool with `subagent_type: "Chief Editor"` and this prompt shape:

```
Run the daily AI carousel production pipeline.
<target_date>{today or the provided date}</target_date>
<topic_override>{topic phrase, or NONE}</topic_override>
<execute_generation>{true or false}</execute_generation>
Follow the team CLAUDE.md pipeline and all rules. Deliver the four output files under output/{date}/ and report file paths with a summary.
```

3. Relay the coordinator's closing summary and file paths to the user verbatim; do not re-run or expand its work.

## Examples

### Normal case
`/boss` → spawn chief-editor for today, no override, no generation. User receives four file paths and a topic summary.

### Edge case
`/boss Claude 網頁搜尋 generate` → both a topic override and generation flag: pass `<topic_override>Claude 網頁搜尋</topic_override>` and `<execute_generation>true</execute_generation>`. The strategist still validates the override against today's research — an override is a candidate, not a bypass.

### Rejection case
`/boss 幫我發到 IG` → publishing is out of team scope. Do not spawn the coordinator for it. Reply: 「本團隊產出到發文素材為止,不執行 IG 發布。可執行:`/boss`(產出今日素材)。發布請用排程工具或手動進行。」
