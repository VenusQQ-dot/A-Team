---
name: Hook Copywriting
description: Hook patterns and carousel narrative pacing for news-style social copy
---

# Hook Copywriting

## Purpose

Pattern library for scroll-stopping, news-style copy. Used by `script-copywriter`. Every pattern requires the body to cash the hook's promise — a hook the body cannot support is clickbait and fails QA.

## Hook Patterns

| Pattern | Shape | Use when |
|---------|-------|----------|
| Stakes-first | "{Audience} 的工作方式剛被改寫" | The trend changes what the reader does daily |
| Curiosity gap | "OpenAI 沒說的是這件事" | A sourced, non-obvious fact exists to reveal |
| Number claim | "3 個功能,一次看懂 {topic}" | The body genuinely has exactly N sourced points |
| Contrarian | "所有人都搞錯了 {topic} 的重點" | A sourced angle contradicts the dominant take |
| Time pressure | "本週上線:{feature}" | The source confirms the date — never invent urgency |

Selection rule: pick the single pattern whose precondition the brief's sources actually satisfy. When two qualify, prefer the one with the strongest sourced fact behind it.

## Carousel Pacing

- **Cover**: the hook, ≤ 12 words, no body text.
- **Slide 2**: the payoff of the hook — never a table of contents. Readers who swipe once decide everything.
- **Inner slides**: one idea each, ≤ 25 words, each slide ends with a reason to swipe (open loop or numbered progression).
- **Final slide**: CTA — exactly one action (follow / save / comment), plus the account handle.

## Reels Script Pacing

- 0–3s: hook spoken AND on-screen as text (most viewers are muted).
- Beats of 4–8s each; every beat advances one fact from the claims table.
- Final 5s: CTA, same single-action rule.

## Language Notes

Write natively in the configured post language — do not draft in English and translate; hook rhythm dies in translation. Keep platform-established English terms (GPT-4o, Reels) untranslated.

## Examples

### Normal Case
Brief: GPT-4o real-time voice, 5 sourced facts including a demo video. Number claim qualifies (exactly 3 headline capabilities sourced). Cover: 「GPT-4o 的 3 個新能力,第 2 個最被低估」. Slide 2 delivers capability #1 immediately; slides 3-5 one capability each; slide 6 the underrated angle with source; slide 7 CTA.

### Edge Case
Brief has strong facts but they are all incremental (minor API price cut). No pattern's precondition is strongly met — stakes are real but small. Use Stakes-first scoped honestly: 「API 成本降 15%,對 indie 開發者是這個意思」. Scoping the audience down keeps the hook honest; inflating stakes to "everyone" would fail the QA counterexample check.

### Rejection Case
Brief asks for Time pressure on a rumored release ("expected soon" per one blog). No confirmed date exists in any source. Refuse the pattern: report to the copywriter's own workflow that Time pressure is unavailable, select Curiosity gap on the sourced rumor status instead ("為什麼大家都在等 {X} — 而它還沒來"), and mark the claim TIME-SENSITIVE.
