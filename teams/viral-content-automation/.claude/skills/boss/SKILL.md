---
name: Boss
description: Entry point that spawns the content-director to run the trend-to-publish content pipeline
disable-model-invocation: true
allowed-tools: ["Agent"]
argument-hint: "[cycle instruction, e.g. 'run weekly cycle' or 'cycle on topic X, carousel only']"
---

# Boss

## Purpose

Single entry point for the viral-content-automation team. Spawns the `content-director` coordinator via the Agent tool so every run enters through the coordinator's full workflow — cycle planning, phased dispatch, quality gates, and retrospective.

## Execution

1. Collect the user's arguments (may be empty).
2. Spawn the coordinator via the Agent tool:
   - `subagent_type`: `content-director`
   - `prompt`: wrap the arguments as follows —

```
<user_request>
{arguments verbatim, or "no arguments — run a standard cycle with current defaults"}
</user_request>

Run the content pipeline per your agent definition. Create the cycle worklog before any dispatch. Return the cycle summary, the approval queue state, and any blockers.
```

3. Relay the coordinator's returned summary to the user without modification.

## Bare Invocation

`/boss` with no arguments starts a standard cycle: scan enabled sources, curate to the default topic count, produce default cadence formats, queue for approval.

## Examples

### Normal Case
`/boss run weekly cycle` → coordinator plans a full cycle, runs all six phases, returns the approval queue with 3 scheduled packages. Boss relays the summary and queue.

### Edge Case
`/boss cycle on 'Sora 2 release', reels only, publish language en` → arguments passed verbatim inside `<user_request>`; coordinator treats the named topic as a forced include (curator labels it if below cutoff) and restricts formats to Reels.

### Rejection Case
`/boss delete last week's posts` → post deletion is outside the team's pipeline scope. The coordinator declines with the scope statement from the team CLAUDE.md; Boss relays the refusal — it does not attempt the deletion itself or spawn a different agent for it.
