---
name: Source Vetting
description: Source whitelist, recency window, and credibility rubric for daily AI news research
user-invocable: false
---

# Source Vetting

Contract for `news-researcher` (rating), `topic-strategist` (weighing), and `fact-checker` (Section H assessments).

## Whitelist (search these first)

| Category | Sources |
|----------|---------|
| Official vendor | Anthropic blog / Claude docs, OpenAI blog, Google AI blog, Higgsfield official site and official social accounts |
| Wire / major tech media | Reuters AI, The Verge AI, TechCrunch AI, VentureBeat AI |
| Community / research | Hugging Face blog, Artificial Intelligence News |

Non-whitelist sources may corroborate a story but never anchor one alone, except official first-party announcements from a tool's own verified domain (treated as Official vendor).

## Recency Window

Default 24 hours from run time. Widen to 72 hours only when the 24h window yields fewer than 5 vetted items; record the widening in `decisions.md`. Items outside 72h are excluded regardless of quality — this is a daily-news product.

The publish date must be read from the article page itself, never inferred from a search snippet. Republications and "updated" evergreen posts count from original publish date.

## Credibility Rubric

| Rating | Criteria | Usable for |
|--------|----------|-----------|
| High | First-party announcement, or wire/major outlet reporting with named sources and a checkable date | Anchor claims, numbers, feature descriptions |
| Medium | Reputable outlet reporting secondhand; official info pending | Anchor claims with "報導指出" framing; no hard numbers |
| Low | Social posts, forums, anonymous claims, undated pages | Never anchors anything; at most a lead to investigate |

Two Medium sources reporting independently upgrade the story's usability to High-equivalent for the shared claim only.

## Item Record Format

Every brief item: `S{n}` / title / source name / publish date / URL / one-paragraph summary / rating + reason / workplace relevance line.

## Examples

### Normal case
Anthropic blog post dated today announcing a feature → High; anchors capability claims and the topic's "why today". Record with S-ID and the exact publish date from the page.

### Edge case
The Verge article citing "sources familiar with the matter" about an unannounced model → Medium; usable framed as 報導指出, no numbers quoted as fact; flag "official confirmation pending". If OpenAI confirms on its blog within the window, re-rate High with both URLs recorded.

### Rejection case
Viral thread on X claiming a benchmark leak, no article, no date, screenshot only → Low; excluded from the brief as an anchor. If genuinely significant, record under "leads" with `INSUFFICIENT_DATA: 無可驗證來源` — it may become tomorrow's story once a whitelist source covers it.
