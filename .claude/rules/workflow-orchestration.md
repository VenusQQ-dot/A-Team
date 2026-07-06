---
name: Workflow Orchestration
description: Plan-first execution, subagent offloading, verification before done, and lesson capture for all sessions
---

# Workflow Orchestration

## Applicability

- Applies to: All agents (session-level working discipline for planning, delegation, verification, and self-improvement)

## Rule Content

### Plan Mode Default

- Enter plan mode for any non-trivial task (3 or more steps, or any architectural decision)
- If execution goes sideways, STOP and re-plan immediately — do not push forward on a broken plan
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### Subagent Strategy

- Use subagents liberally to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at the problem via subagents
- Dispatch one task per subagent for focused execution

### Self-Improvement Loop

- After any correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until the mistake rate drops
- Review `tasks/lessons.md` at session start for the relevant project

### Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Apply the standard: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — do not over-engineer
- Challenge your own work before presenting it

### Autonomous Bug Fixing

- When given a bug report: fix it. Do not ask for hand-holding
- Start from logs, errors, and failing tests — then resolve them
- Require zero context switching from the user
- Fix failing CI tests without being told how

### Task Management

1. Plan first: write the plan to `tasks/todo.md` with checkable items
2. Verify plan: check in with the user before starting implementation
3. Track progress: mark items complete as work proceeds
4. Explain changes: give a high-level summary at each step
5. Document results: add a review section to `tasks/todo.md`
6. Capture lessons: update `tasks/lessons.md` after corrections

### Core Principles

- Simplicity first: make every change as simple as possible; impact minimal code
- No laziness: find root causes; no temporary fixes; hold senior developer standards
- Minimal impact: touch only what is necessary; introduce no side effects or new bugs

### Relationship to Worklog

`tasks/todo.md` and `tasks/lessons.md` are lightweight session-level tracking. They do not replace `.worklog/` — the worklog remains the authoritative evidence trail per `rules/worklog.md`. Phase-level decisions, findings, and references go to `.worklog/`; the task checklist and captured lessons go to `tasks/`.

## Violation Determination

- Non-trivial task (3+ steps or architectural decision) started without a plan in `tasks/todo.md` → Violation
- Task marked complete without verification evidence (tests, logs, or behavioral demonstration) → Violation
- User correction received without a corresponding `tasks/lessons.md` update → Violation
- Temporary fix applied where the root cause was identifiable → Violation
- Research or bulk exploration performed inline in the main context when subagent dispatch was available → Violation

## Exceptions

- Trivial tasks (single step, no design decision) may skip plan mode and `tasks/todo.md`
- "Verify plan: check in before starting" is waived when operating autonomously with no user available to respond — proceed per the approved task description
- Phase 1 Discovery conversation is exempt from subagent offloading (direct user dialogue is coordination, not execution)

Tradeoff: Plan-first and todo tracking add minutes of overhead per task; verification adds a test/log pass before every completion claim. The payoff is fewer reworks, a falling mistake rate via lesson capture, and a main context window that stays usable across long sessions.
