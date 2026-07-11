---
name: Brand Safety
description: Content constraints and claim standards every published item must satisfy
---

# Brand Safety

## Applicability

- Applies to: `content-qa` (enforcement), `script-copywriter`, `visual-prompt-engineer`, `carousel-producer`, `reels-producer` (compliance), `trend-curator` (pre-screen)

## Rule Content

### Banned Content Categories

MUST NOT appear in any published item:

- Unverifiable health, financial-return, or income claims ("this AI makes you $10k/month")
- Real-person likenesses in generated imagery; real trademarked logos or brand UI presented as authentic
- Unlicensed music, footage, or images
- Engagement-bait mechanics prohibited by platform policy (follow-to-win without stated terms, "tag 5 friends or else" formats)
- Content about tragedies, active crises, or minors as trend fodder

### Claim Standards

- Every factual claim in copy maps to a cited source in the package's claims-to-source table.
- Time-sensitive claims (release dates, "this week") require a source confirming the date and carry a `TIME-SENSITIVE` flag for QA re-verification at publish time.
- Speculation is publishable only when labeled as such in the copy ("據傳" / "reportedly"), never stated as fact.
- Statistics carry their origin in the caption or slide ("per OpenAI's announcement") when the number is load-bearing for the hook.

### Generated Imagery Standards

- Illustrative renderings of products/UI are labeled 「畫面為示意」 (illustrative) when they could be mistaken for authentic screenshots.
- The negative directives in `skills/visual-prompt-style/SKILL.md` (no real faces, no real logos) are mandatory in every prompt.

### Default on Uncertainty

An unverifiable high-impact claim FAILS. QA never passes content on "probably fine".

## Violation Determination

- Published or queued item containing any banned category → Violation
- Claim in published copy with no entry in the claims-to-source table → Violation
- QA verdict `PASS` on a package containing an unverified `TIME-SENSITIVE` claim older than 48 hours → Violation
- Generated image presenting another brand's UI as authentic without the illustrative label → Violation

Violation scenario: a carousel about an AI trading tool includes "users report 34% monthly returns" sourced to a Reddit comment. Financial-return claims from anecdotal sources are banned regardless of citation — the correct handling is removal, not attribution.

## Exceptions

This rule has no exceptions. It is a safety boundary: cadence pressure, user urgency, and trend decay never override it.
