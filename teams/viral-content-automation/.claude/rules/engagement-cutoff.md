---
name: Engagement Cutoff
description: Quantitative thresholds gating which trend candidates may enter content production
---

# Engagement Cutoff

## Applicability

- Applies to: `trend-curator` (enforcement), `content-director` (gate verification at Phase 1 → 2)

## Rule Content

### Parameters

| Parameter | Default | Meaning |
|-----------|---------|---------|
| `cutoff_multiplier` | 3.0 | Minimum score (ER / per-source median, per `skills/trend-scoring/SKILL.md`) |
| `min_absolute_engagement` | 500 | Minimum combined likes+comments+shares — filters high-ratio noise from tiny samples |
| `min_source_sample` | 8 | Minimum candidates per source for that source's median to be usable |
| `recency_half_life_days` | 7 | Half-life for the recency decay applied to scores |
| `max_candidate_age_days` | 14 | Candidates older than this are cut regardless of score |

Change parameters by editing this table — never by ad-hoc override inside a cycle. Parameter changes are decisions: log them in the cycle's `decisions.md` with rationale.

### Enforcement

- Both conditions required to pass: `score >= cutoff_multiplier` AND `absolute engagement >= min_absolute_engagement`, computed after recency decay.
- A source below `min_source_sample` is `UNSCORABLE` for the cycle: its candidates neither pass nor feed the median.
- User forced-include topics bypass the cutoff but are labeled `FORCED` in the brief, with actual score shown when computable.
- Filling the topic quota is never a reason to relax any parameter mid-cycle. A cycle with one strong topic beats a cycle with five weak ones.

## Violation Determination

- Topic enters Phase 2 with no recorded score and no `FORCED` label → Violation
- Curator adjusts any parameter inside a cycle without a logged decision → Violation
- Median computed from fewer than `min_source_sample` candidates → Violation

Violation scenario: cycle target is 4 topics but only 2 pass; the curator quietly lowers `cutoff_multiplier` to 2.2 to promote two more. The pipeline now produces content the data calls mediocre — exactly what the cutoff exists to eliminate.

## Exceptions

- Cold start (first 2 cycles): no historical baseline exists; the curator may use `cutoff_multiplier` 2.0 with the reduction logged as a cold-start decision, returning to 3.0 by cycle 3.

Tradeoff: strict cutoffs will sometimes yield cycles with fewer topics than the cadence target — publishing volume is sacrificed for validated potential. This is intentional.
