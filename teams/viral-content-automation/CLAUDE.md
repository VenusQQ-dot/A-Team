---
name: Viral Content Automation
description: Team-wide instructions for the trend-to-publish content pipeline team
---

# Viral Content Automation Team

A multi-agent team that runs a full social content pipeline: trend radar → viral filtering → script copywriting → visual prompt engineering → carousel image generation → short-video auto-editing → scheduled publishing via Meta Graph API.

## Team Objectives

- Scan trend sources (YouTube Data API, Google Trends, Reddit as core; X and Instagram as optional paid adapters), filter topics by real engagement data against a quantitative cutoff, and keep only topics with verified viral potential.
- Turn selected topics into news-style hooks, captions, and short-video scripts with high scroll-stopping potential.
- Convert scripts into precise image-generation prompts, batch-produce 1:1 Instagram carousel slides via image API, and auto-edit Reels/Shorts (auto-cut, captions, transitions) via the configured video service.
- Publish approved content through Meta Graph API at randomized scheduled times, within API rate limits.

Out of scope: paid ad management, community reply/DM handling, influencer outreach, analytics dashboards beyond per-post engagement retrieval.

## Deployment Mode

This team uses **subagent mode**. The coordinator (`content-director`) delegates all specialist work via the Task tool. All agents run within a single Claude Code session. Enter the workflow via `/boss`. Agent Teams mode is not configured for this team.

## Communication

Communicate with the user in the user's language. Detect and match it (default: Traditional Chinese). Technical terms may remain in English.

Take a position in every recommendation: state the recommendation, the supporting evidence, and the condition that would falsify it. Vague agreement ("that could work", "it depends") is prohibited. When the user's request conflicts with platform limits or brand safety, say so directly and provide an alternative.

## Pipeline Phases

| Phase | Purpose | Agent(s) |
|-------|---------|----------|
| 1. Trend Radar | Multi-source scan + engagement cutoff filtering | `trend-scanner`, `trend-curator` |
| 2. Scripting | News-style captions, carousel copy, video scripts | `script-copywriter` |
| 3. Visual Production | Image prompts, carousel batch generation, Reels auto-edit | `visual-prompt-engineer`, `carousel-producer`, `reels-producer` |
| 4. Quality Gate | Content QA + brand safety; code review for automation scripts | `content-qa`, `code-reviewer` |
| 5. Publishing | Approval queue + randomized scheduling + Meta Graph API publish | `publisher` |
| 6. Retrospective | Process review after each content cycle | `process-reviewer` |

## Safety Defaults

- Publishing requires human approval of the queue unless the user has explicitly set `AUTO_PUBLISH=true` (see `.claude/rules/publishing-approval.md`).
- All generated claims about news/products must pass `content-qa` fact-check before entering the publish queue (see `.claude/rules/brand-safety.md`).
- Trend collection uses official APIs or user-supplied third-party services only; scraping that violates platform ToS is prohibited.

## Worklog

All work is documented in `.worklog/{yyyymm}/{task-name}/phase-{n}-{label}/` with three core files per phase:

- `references.md` — Sources consulted (trend URLs, API responses, internal docs)
- `findings.md` — Key discoveries and analysis
- `decisions.md` — Decisions with rationale, alternatives, and evidence chain

The worklog serves dual purpose: **verifiable decision trail** and **context offloading** (agents read from worklog instead of carrying full context). See `.claude/rules/worklog.md`.

## Context Management

- **Coordinator dispatch**: every Task dispatch must include (1) the current worklog path, (2) upstream reference paths, (3) a task scope summary. Variable data in dispatches is wrapped in descriptive XML tags (`<task_scope>`, `<upstream_context>`, `<worklog_path>`). Pass paths, not full upstream content.
- **Agent returns**: structured summaries only, ending with exactly one status: `DONE` / `DONE_WITH_CONCERNS` / `BLOCKED` / `NEEDS_CONTEXT`. Full detail goes to the worklog, not the return.
- **Phase-end archival**: the coordinator verifies the three worklog files exist and are populated before any phase transition, then releases phase-specific context — later phases read from the worklog.
- **Recovery**: after interruption or compaction, restore context by reading the latest phase worklog plus `decisions.md` of all completed phases.

See `.claude/rules/context-management.md`.

## Content Configuration

- Post language: configurable per run; default Traditional Chinese (`zh-TW`).
- Default cadence target: 5 carousel posts + 3 Reels per week (adjust per user instruction).
- Visual style baseline lives in `.claude/skills/visual-prompt-style/SKILL.md` and applies to every generated image.
