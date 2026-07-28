# A-Team

A-Team is a **team designer**, not a target team. It interviews users, decomposes responsibilities, plans skills and rules, and generates ready-to-run multi-agent team structures under `teams/{team-name}/`.

This repository is a **meta-project**: the agents, skills, and rules here exist to *design other agent teams*. When you edit files in this repo you are editing the designer, not a generated team.

## Design Philosophy

### Boil the Lake

When the complete version costs only marginally more than the shortcut, produce the complete version. AI-assisted generation compresses effort dramatically — full test coverage, all edge cases, complete error paths, comprehensive documentation. Do not cut corners when completeness is cheap.

### Search Before Building

Apply three layers of knowledge before making any design decision:
1. **Layer 1 — Established patterns**: Known best practices and industry standards
2. **Layer 2 — Current trends**: Recent community practices and popular approaches
3. **Layer 3 — First-principles reasoning**: Original analysis of why conventional wisdom may not apply

Prize Layer 3 insights above all. Search and understand Layers 1-2, then apply Layer 3 to discover what the standard approach misses.

### Position Over Hedging

Every recommendation must state a clear position with evidence. Vague agreement, false balance, and non-committal language are prohibited. See `.claude/rules/anti-sycophancy.md`.

## Deployment Mode

This project uses **subagent mode**. The coordinator (`team-architect`) delegates specialist work via the Task tool. All agents run within a single Claude Code session.

## Communication

Communicate in the user's language. Detect and match the language the user is using. Technical terms may remain in English.

Point out issues directly when the user's ideas are unreasonable — always provide alternative solutions alongside.

## Repository Layout

This repo is **dual-platform**. Two parallel trees hold equivalent designs: `.claude/` for Claude Code and `.codex/` (+ root `AGENTS.md`, `agents/`, `.agents/`) for Codex.

```
A-Team/
├── CLAUDE.md                 ← This file. Project instructions for Claude Code (this tree is the source design)
├── AGENTS.md                 ← Codex runtime entrypoint (read first in Codex sessions)
├── readme.md                 ← Human-facing bilingual (English + 繁中) overview
├── .gitignore                ← Whitelists tracked teams; ignores .worklog/, generated teams, local overrides
│
├── .claude/                  ← Claude Code source of truth
│   ├── agents/               ← 12 specialist agent .md files (coordinator at root, rest grouped)
│   │   ├── team-architect.md ← Coordinator (must live in agents/ root, never a subfolder)
│   │   ├── discovery/        ← requirements-analyst, role-designer
│   │   ├── research/         ← domain-researcher, decision-auditor
│   │   ├── planning/         ← skill-planner
│   │   ├── generation/       ← rule-writer, skill-writer, agent-writer
│   │   ├── optimization/     ← prompt-optimizer
│   │   ├── review/           ← dialogue-reviewer
│   │   └── evolution/        ← team-restructuring-master
│   ├── skills/               ← Reusable skills; a-team/ is the entry-point skill (/a-team)
│   ├── rules/                ← 16 hard-constraint rule files (loaded as project instructions)
│   └── settings.json         ← Permissions + baseline worklog hooks (project scope)
│
├── .codex/                   ← Codex authored mirror
│   ├── agents/               ← Codex playbooks (team-architect.md at root + same group folders)
│   ├── rules/                ← Codex rule library (includes Codex-only rules, e.g. codex-native-output.md)
│   ├── skills/               ← Authored skill mirror
│   ├── docs/                 ← claude-to-codex-mapping.md, claude-adaptation-audit.md
│   └── config.toml           ← Authoritative Codex runtime switch (registers agents, multi_agent=true)
│
├── agents/                   ← Thin Codex runtime registry (TOML). Each file points at a .codex/agents playbook
├── .agents/skills/           ← Runtime-discoverable Codex skill surface (Codex-adapted mirror of .codex/skills)
└── .worklog/                 ← Runtime evidence chain (gitignored; written by agents, not source)
```

### Which tree is authoritative

- **`.claude/` is the source design for Claude Code.** Edit here for Claude Code behavior.
- **`.codex/` + `AGENTS.md` + `agents/` (TOML) + `.agents/skills/` are the Codex runtime.** Codex playbooks live in `.codex/agents/`; the root `agents/*.toml` files are intentionally thin registry entries that defer to those playbooks.
- The two trees are **not byte-identical** — Codex versions are adapted (e.g. `.agents/skills/a-team/SKILL.md` differs from `.claude/skills/a-team/SKILL.md`). See `.codex/docs/claude-to-codex-mapping.md` for the mapping and `.codex/docs/claude-adaptation-audit.md` for deliberately non-ported assets.
- **When a change affects design semantics (a rule, an agent's responsibilities, the workflow), mirror it across both trees** unless the user scopes the change to one platform. When in doubt, ask which platform(s) the change targets before editing only one.

## Agent Roster

The coordinator dispatches these specialists (flat architecture — one coordinator, no sub-coordinators).

| Agent | Group | Role |
|-------|-------|------|
| `team-architect` | (root) | Coordinator: plans, dispatches, tracks, quality-gates. Does not execute. |
| `requirements-analyst` | discovery | Structured interview → requirements summary |
| `role-designer` | discovery | Requirements → role map with sound boundaries |
| `domain-researcher` | research | External investigation + evidence-backed recommendations (web access) |
| `decision-auditor` | research | Independent audit of decisions at phase boundaries (read-only + report) |
| `skill-planner` | planning | Plan skills + rules per agent; search external skills first |
| `rule-writer` | generation | Write rule .md files |
| `skill-writer` | generation | Write skill SKILL.md files |
| `agent-writer` | generation | Write agent .md files |
| `prompt-optimizer` | optimization | Review/refine generated prompts without changing intent |
| `dialogue-reviewer` | review | Audit consultation dialogue quality (mandatory phase 6) |
| `team-restructuring-master` | evolution | Evaluate + restructure existing teams (on-demand) |

## Phase Overview

| Phase | Purpose | Agent(s) |
|-------|---------|----------|
| 1. Discovery | Requirements interview + role decomposition + domain research | `requirements-analyst`, `role-designer`, `domain-researcher` |
| 2. Planning | Skill/rule planning with external skill search | `skill-planner` |
| 3. Generation | CLAUDE.md + folder structure + file generation | `rule-writer`, `skill-writer`, `agent-writer` |
| 4. Optimization | Prompt review and refinement (optional) | `prompt-optimizer` |
| 5. Review | Structure validation + user feedback | `team-architect` |
| 6. Dialogue Review | Consultation quality audit (mandatory) | `dialogue-reviewer` |
| 7. Restructuring | Evaluate and restructure existing teams (on-demand) | `team-restructuring-master` |

Cross-phase support agents (available at any phase):
- `domain-researcher` — External domain investigation and best practice research
- `decision-auditor` — Independent audit of design decisions at phase boundaries

## Entry Points

- **Claude Code**: invoke the `a-team` skill (`/a-team`) — it spawns `team-architect` and runs the full workflow. Pass a team description, or `--restructure teams/path` to enter phase 7. The skill sets `disable-model-invocation: true`, so the full workflow only runs on explicit invocation, never from conversational context.
- **Codex**: read `AGENTS.md`, then invoke the Codex-native `$a-team` skill (`.agents/skills/a-team/SKILL.md`).

## Rules (`.claude/rules/`)

These load as project instructions and are binding. Key rules to know before editing generated-team logic:

- `output-structure.md` — canonical `teams/{team-name}/` layout, placement rules, entry-point skill mandate
- `coordinator-mandate.md` — coordinator must exist, must not execute, flat architecture, worktree isolation policy
- `reviewer-mandate.md` — every generated team needs a process reviewer distinct from QA
- `reasoning-and-self-critique.md` — every agent needs `## Reasoning` (before) and `## Self-Critique` (after) gates around `## Workflow`
- `prompt-engineering-patterns.md` — structural-over-instructional, XML tag separation, example diversity, tone calibration, escape hatches
- `writing-quality-standard.md` — imperative tone, no vague words, length limits (agent ≤300, skill ≤200, rule ≤100 lines)
- `yaml-frontmatter.md` / `frontmatter-optional-patterns.md` — required frontmatter fields and canonical optional patterns (A–G)
- `context-tier.md` — Tier 1–4 model/effort assignment; default Tier 2 (`opus`/`high`)
- `worklog.md` / `context-management.md` — worklog structure + dispatch/return protocol
- `settings-json.md` / `hooks-integration.md` — every generated team ships `settings.json` with the baseline hook set
- `anti-sycophancy.md`, `conversation-protocol.md`, `skill-context-fork.md`

Codex-only rules live in `.codex/rules/` (e.g. `codex-native-output.md`, `codex-runtime-config.md`, `codex-agent-config-patterns.md`, `context-isolation.md`).

## Worklog

All work is documented in `.worklog/yyyymm/task-name/phase-n-label/` with three core files per phase:
- `references.md` — Sources consulted
- `findings.md` — Key discoveries and analysis
- `decisions.md` — Decisions with rationale, alternatives, and evidence chain

The worklog serves dual purpose: **verifiable decision trail** and **context offloading** (agents read from worklog instead of carrying full context). The three files form an evidence chain: **references → findings → decisions**. Every decision must trace back through findings to references. `.worklog/` is gitignored (runtime evidence, not source). See `.claude/rules/worklog.md` and `.claude/rules/context-management.md`.

## Output

All generated teams go to `teams/{team-name}/`. The structure follows `.claude/rules/output-structure.md`.

Every generated team must include:
- A coordinator (flat architecture, no sub-coordinators)
- A process reviewer (separate from QA)
- A code reviewer (separate from QA testing)
- An entry-point skill at `skills/boss/SKILL.md` (`/boss`)
- Worklog rule and context management rule in `rules/`
- Worklog and context management section in CLAUDE.md
- `.claude/settings.json` with the baseline hook set

**Generated teams are gitignored by default** (`teams/*/` in `.gitignore`); only explicitly whitelisted teams are tracked (`!teams/life-partners/`). To track a new generated team, add a matching whitelist line.

## Settings & Permissions

`.claude/settings.json` (project scope) defines:
- **Permissions** — read/search/`Agent`/`Write`/`Edit` and safe git are pre-allowed; `curl`/`rm`/`git commit`/`git push`/`npm` require confirmation (`ask`); destructive operations (`rm -rf /`, `git push --force`, `git reset --hard`, piped `curl|sh`, etc.) are denied.
- **Hooks** — baseline worklog lifecycle: `SessionStart` and `UserPromptSubmit` ensure `.worklog/$(date +%Y%m)/` exists and log the prompt to the session ledger; `PreCompact` writes a compaction checkpoint; `Stop` warns if the worklog dir is missing.

`.claude/settings.local.json` is user-local and gitignored — never commit it.

## Development Conventions

- **File format**: every generated `.md` starts with YAML frontmatter on line 1 (no blank line or content before `---`). Names are kebab-case. Rules include a Violation Determination section.
- **Editing an agent/rule/skill**: keep the mandatory section ordering (`## Reasoning` before `## Workflow`, `## Self-Critique` after) and respect the length limits in `writing-quality-standard.md`.
- **Cross-tree parity**: a semantic change to `.claude/` usually needs the corresponding `.codex/` edit (and vice versa). Structural/config differences are intentional — consult the mapping docs rather than blindly copying.
- **Git**: this session develops on the branch specified by the task. Commit and push only when asked. Never use force-push or hard reset (also denied in settings).

## Dual-Platform

This repo maintains both Claude Code (`.claude/`) and Codex (`.codex/`, `AGENTS.md`) configurations. The `.claude/` tree is the source design for Claude Code. See `AGENTS.md` for the Codex runtime entrypoint and `.codex/docs/claude-to-codex-mapping.md` for the bidirectional format mapping.
