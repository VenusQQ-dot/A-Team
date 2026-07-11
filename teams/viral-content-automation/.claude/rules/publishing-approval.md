---
name: Publishing Approval
description: Approval gate, rate limits, and posting windows governing all Meta Graph API publishing
---

# Publishing Approval

## Applicability

- Applies to: `publisher` (enforcement), `content-director` (gate verification at Phase 5)

## Rule Content

### Approval Gate

- Default mode: every package enters the approval queue; the publisher calls a publish endpoint only for entries the user has approved.
- Zero-touch mode: MUST be enabled explicitly via environment variable `AUTO_PUBLISH=true`. Absence, empty value, or any other value means approval is required.
- Approval applies per package. Approving one entry never implies approval of the queue.
- A package's approval expires if the package changes after approval (any edit → back to the queue).

### Rate Limits and Caps

| Cap | Value | Basis |
|-----|-------|-------|
| API-published posts per 24h | 50 (hard, Meta) — team soft cap 10 | Meta Content Publishing limit; soft cap keeps headroom and natural pacing |
| Minimum spacing between posts | 3 hours | Feed cannibalization avoidance |
| Publish retries per package | 3 with exponential backoff | Per `skills/meta-graph-publishing/SKILL.md` |

### Posting Windows

- Allowed windows (account local time): 08:00–22:00 daily. No publishing outside windows, including retries — a retry that would land outside its window waits for the next window.
- Slot randomization per the publishing skill; assigned slots are final for the cycle.

### Prerequisites for Any Publish Call

1. QA verdict `PASS` recorded in the worklog for this exact package version
2. Approval recorded (or `AUTO_PUBLISH=true`)
3. Daily soft cap not yet reached
4. Token scope verified this cycle

All four verified before the first API call of each publish execution — not assumed from the previous run.

## Violation Determination

- Publish call without recorded QA PASS for the current package version → Violation
- Publish call without approval while `AUTO_PUBLISH` is not `true` → Violation
- Exceeding the daily soft cap without a logged coordinator decision, or the Meta hard cap ever → Violation
- Publishing outside allowed windows → Violation

Violation scenario: user approves a carousel Monday; Tuesday the copywriter fixes a typo in slide 3; the publisher publishes Wednesday citing Monday's approval. The approved artifact no longer exists — the edited package required re-approval (and QA re-verification).

## Exceptions

This rule has no exceptions. CRITICAL: these caps and gates protect the user's account standing with Meta; no cadence target or urgency overrides them.

Tradeoff: the default approval gate costs the user one review action per package — deliberately trading "zero manual publishing" for protection against AI-generated errors going live unreviewed. Users who accept the risk switch to zero-touch with one environment variable.
