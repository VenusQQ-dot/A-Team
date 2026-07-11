---
name: Trend Scoring
description: Score trend candidates and apply the engagement cutoff with per-source normalization
---

# Trend Scoring

## Purpose

Deterministic scoring procedure for trend candidates so cutoff decisions are reproducible and auditable. Used by `trend-curator`. Parameters (multiplier, minimums) live in `rules/engagement-cutoff.md` — this skill defines how to compute, the rule defines the thresholds.

## Scoring Procedure

1. **Engagement rate per candidate**: `ER = (likes + comments * 3 + shares * 5) / max(views, followers_proxy)`. Comments and shares are weighted because they cost the audience more than a like. When `views` is unavailable (e.g., Reddit), use the source's upvote-to-member proxy defined per source below.
2. **Per-source median**: compute the median ER across all candidates from the same source in this scan. Never compare raw ER across sources.
3. **Relative score**: `score = ER / source_median`. A score of 3.0 means "3x the typical engagement of its own platform sample".
4. **Cutoff**: candidate survives when `score >= cutoff_multiplier` AND absolute engagement ≥ the minimum floor (both from `rules/engagement-cutoff.md`).
5. **Recency decay**: multiply score by `0.5^(age_days / half_life_days)` (half-life in the rule). A week-old viral post is a dying trend, not an opportunity.

## Per-Source Field Mapping

| Source | likes | comments | shares | denominator |
|--------|-------|----------|--------|-------------|
| YouTube | likeCount | commentCount | n/a (0) | viewCount |
| Reddit | upvotes | num_comments | crossposts | subreddit subscribers / 100 |
| X (optional) | likes | replies | reposts | impressions |
| IG (optional) | likes | comments | n/a (0) | follower count of source account |

Record the mapping used in `findings.md` — auditability requires knowing which fields fed each score.

## Output Format

Per candidate, one scoring record:

```
{topic} | source: {s} | ER: {x.xxxx} | median: {x.xxxx} | score: {x.xx} | decayed: {x.xx} | verdict: PASS/CUT
```

## Examples

### Normal Case
YouTube video: 48k likes, 3.1k comments, 890k views → ER 0.0644. Source median this scan: 0.0201 → score 3.20, age 1 day (decay ≈ 0.91 at half-life 7d) → 2.91. Cutoff 3.0 → verdict CUT (barely — record it; near-misses inform cutoff tuning).

### Edge Case
Reddit post from a 900-member niche subreddit: 420 upvotes, 85 comments → denominator 9. ER is enormous relative to bigger subreddits. This is why scoring is per-source-median: its median comes from the same scan's Reddit sample. If Reddit yielded fewer candidates than the rule's minimum sample size, mark the whole source `UNSCORABLE (n too small)` rather than trusting a median of 3 records.

### Rejection Case
Candidate has `views: null, likes: 12000` from a degraded API response. The denominator is missing — do not substitute followers of a different account or guess. Emit `verdict: UNSCORABLE (missing denominator)` and exclude it from the median computation. If >50% of a source is UNSCORABLE, escalate per the curator's Uncertainty Protocol instead of scoring the remainder as if representative.
