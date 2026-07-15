---
name: Higgsfield Prompt Craft
description: Field templates, brand style block, and negative prompt library for Higgsfield image and video prompts
user-invocable: false
---

# Higgsfield Prompt Craft

Templates for Sections D and E. Keep the Style / Color palette / Lighting / Negative prompt blocks identical across all pages of a run; vary only Topic, Subject, and Composition.

## Image Prompt Template (per page, 9 fields)

```
Create a premium 4:5 Instagram carousel slide in a clean AI technology magazine style.

Topic: {本頁主題}
Main headline: {本頁大標 — placeholder only, real text added in layout tool}
Visual focus / Subject: {one main visual, e.g., glowing prompt card, AI dashboard, isometric desk scene}

Style: Modern corporate AI infographic, clean white background, dark navy typography,
vibrant orange highlights, soft shadow UI cards, subtle 3D icons, minimalist tech
magazine layout, premium editorial design.

Composition: {centered main visual / split layout / step stack} with generous negative
space. Large headline area at the top. One main UI card focus. Small supporting icons
or data chips only.

Background: clean white to off-white, subtle blue gradient allowed at edges.

Color palette: white, off-white, dark navy, bright orange, light gray, subtle blue gradients.

Lighting: soft studio lighting, clean reflections, high-end product visualization, no harsh contrast.

Typography space: leave clear empty space for Traditional Chinese headline and short body
text. Do not generate tiny unreadable text.

Aspect ratio: 4:5 vertical.

Negative prompt: no messy layout, no distorted text, no fake paragraphs, no watermark,
no logo, no extra fingers, no creepy human faces, no oversaturated colors, no cluttered
background, no low-resolution details.
```

## Video Prompt Template (pages 1 and 8, 6 fields)

```
5-second vertical 4:5 motion version of the {cover/closing} slide.

Camera movement: {cover: slow push-in toward the headline card / closing: gentle settle pull-back}
Object motion: {UI cards float in and assemble / save icon pulses once, chips drift subtly}
Text animation direction: headline {rises from bottom with soft fade / holds steady, underline sweeps left-to-right}
Mood: {confident, fresh, tech-optimistic / calm, conclusive, trustworthy}
Transition style: {clean cut-ready ending frame / loop-friendly resting frame}

Constraints: no distorted text, no extra fingers, no watermark, no morphing artifacts,
keep all typography legible and static-safe.
```

## Usage Rules

- One subject per slide. Multi-subject scenes read as clutter at feed size.
- Human depictions: prefer over-the-shoulder, hands-at-distance, or isometric scenes; never close-up faces.
- In-image text: headline placeholder only. Body copy, lists, and prompt text are added in Canva/Figma.
- Cover (P1) and closing (P8) must be visually distinguishable at a glance: cover = maximal hook energy, closing = resolution and save cue.

## Examples

### Normal case
P4 「實際用法」: Subject "one glowing UI prompt card with a highlighted input field, two small 3D cursor icons"; Composition "centered card, step chip row beneath"; all fixed blocks appended unchanged.

### Edge case
P6 會計案例 needs a human context: use "isometric office desk scene, spreadsheet dashboard on monitor, coffee cup, no visible faces" — scenario conveyed through environment, face-artifact risk removed; negatives reinforced with "no creepy human faces, no distorted hands".

### Rejection case
Request to render 5 full prompt sentences inside the P5 image → refuse per the in-image text rule; deliver a prompt-card visual with reserved list space instead, and note in the return that full text belongs to the layout tool. Generating paragraph text yields garbled glyphs and violates `visual-style.md`.
