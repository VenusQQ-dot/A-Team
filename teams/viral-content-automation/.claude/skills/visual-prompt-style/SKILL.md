---
name: Visual Prompt Style
description: Style tokens, composition templates, and consistency prefix for all generated imagery
---

# Visual Prompt Style

## Purpose

The account's visual identity as an executable prompt system. Used by `visual-prompt-engineer` (authoring) and `carousel-producer` (verification). Consistency comes from structure: every prompt in a set shares the same style prefix verbatim.

## Style Prefix (locked)

Every image prompt starts with this prefix, verbatim:

```
cinematic dark dashboard aesthetic, deep charcoal background (#16181d),
coral accent (#ff6f61) for highlights and data elements, bold geometric
sans-serif headline typography, generous negative space, flat modern
illustration style, subtle grain, no photorealism, 1:1 square composition
```

Changing the prefix is a style-baseline change: record it here first, then use it — never fork the prefix inside a single set.

## Composition Templates

| Slide type | Composition |
|-----------|-------------|
| Cover | Headline dominates upper two-thirds; single focal illustration lower third; no body text |
| Content | Headline top-left ≤ 8 words; supporting visual right or center; one data callout max in coral |
| Quote/stat | Oversized stat or quote centered; attribution small, bottom |
| CTA | Account handle centered, action verb in coral, minimal decoration |

## Prompt Assembly

```
{style prefix} + {composition template} + subject: {slide-specific subject}
+ overlay text: "{verbatim text from copywriter}"
+ negatives: no watermark, no gibberish or misspelled text, no real logos,
  no real faces, no photostock look
```

## Subject Token Extension Procedure

When a topic needs a subject with no established token: derive one adjective-noun subject phrase consistent with the flat-illustration style, add it to the prompt, and record it in the prompt file under `## Style Extensions` for later adoption into this skill. One extension per set maximum — more means the topic fights the identity.

## Examples

### Normal Case
Content slide, overlay 「語音延遲降到 320ms」: prefix + content template + `subject: sleek waveform meeting a stopwatch, flat illustration` + verbatim overlay + standard negatives. Palette, type, and layout all inherited — nothing invented per-slide.

### Edge Case
Stat slide where the stat itself is the visual (「87% 的創作者還沒用過」): use the quote/stat template, subject is the typographic stat itself — instruct `oversized "87%" as central typographic element in coral` and keep the illustration minimal. Typography-as-subject is allowed; abandoning the palette is not.

### Rejection Case
Request: "make slide 3 look like an official OpenAI screenshot for credibility." Refuse — imitating another brand's UI as if authentic violates `rules/brand-safety.md` (misleading presentation + trademark). Offer the compliant alternative: original dashboard illustration in house style with the caption 「畫面為示意」.
