---
name: Carousel Batch Generation
description: API procedure for batch-generating 1:1 carousel images with retries, repair, and cost logging
---

# Carousel Batch Generation

## Purpose

Operational procedure for turning a prompt file into a verified image set. Used by `carousel-producer`. Default provider: OpenAI Images API (`gpt-image-1`); the provider is a configuration value — the procedure below does not change with the provider.

## API Call Procedure

1. Credential check: `IMAGE_API_KEY` must exist in the environment. Never echo it; reference via header substitution only.
2. Per prompt, one call: `POST /v1/images/generations` with `{"model": "gpt-image-1", "prompt": {assembled prompt}, "size": "1024x1024", "n": 1}`.
3. Save the returned image to `assets/{cycle}/{topic-slug}/slide-{n}.png` immediately; log `{slide, tokens/cost, duration}` per call, including failed calls.
4. Generation order: cover first (it gates the set), then inner slides in sequence.

## Verification Checklist (per image)

- Overlay text matches the prompt's quoted text exactly — no misspellings, no dropped characters (CJK text garbles most often; check character-by-character).
- Palette adheres to the style prefix (charcoal base, coral accents).
- No artifacts: extra limbs on figures, warped UI elements, watermark-like smudges.
- Set-consistency: compare against the already-accepted cover.

## Prompt Repair (on verification failure)

Apply in order, one per retry, maximum 2 retries per slide:

1. **Text garble** → shorten overlay wording (flag the change back to the coordinator — never silently), move overlay instruction to the front of the prompt, add `crisp legible typography` directive.
2. **Style drift** → prepend the violated token explicitly (`strictly charcoal #16181d background`), strengthen negatives.
3. **Artifacts** → name the artifact in negatives (`no distorted hands`), simplify the subject phrase.

After 2 failed retries: stop, mark the slide FAILED, continue the batch, report per the agent's Uncertainty Protocol.

## Budget

Default per-cycle image budget: 40 generations (including retries). Crossing the budget requires coordinator authorization before the call that would cross it — not after.

## Examples

### Normal Case
7-slide set: 7 calls + 1 retry (slide 4 text garble, repair step 1 fixed it) = 8 generations, $0.32 logged, all verified. Batch record written to `findings.md` with per-call costs.

### Edge Case
Provider returns HTTP 429 mid-batch. This is not a verification failure — do not consume a repair retry. Back off (30s, 60s), resume from the failed slide. If 429 persists past 3 backoffs, mark remaining slides FAILED(rate-limit) and report; partial sets are deliverable for QA on the completed slides.

### Rejection Case
Batch is at generation 39 of the 40 budget with 3 slides unverified. Generating all 3 crosses the budget. Stop at 40, mark the remainder `BLOCKED (budget)`, and escalate with the exact count needed — do not decide alone that the budget "probably" allows overrun.
