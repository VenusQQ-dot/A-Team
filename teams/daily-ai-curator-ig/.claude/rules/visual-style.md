---
name: Visual Style
description: Fixed brand style tokens and constraints for all Higgsfield prompts
---

# Visual Style

## Applicability

- Applies to: `higgsfield-prompt-designer` (produces), `content-reviewer` (enforces)

## Rule Content

### Fixed Brand Identity

Every image and video prompt reproduces this identity — it is the account's visual signature and does not vary by topic or mood:

「高質感 AI 科技雜誌風、乾淨白底、深藍文字、亮橘色重點、UI 卡片、柔和陰影、3D icon、企業簡報感、適合 IG 輪播」

### Brand Tokens (English, for prompts)

| Token | Value |
|-------|-------|
| Base | clean white / off-white background |
| Typography color | dark navy |
| Accent | vibrant/bright orange, highlights only — never as background |
| Surfaces | soft shadow UI cards |
| Icons | subtle 3D icons |
| Layout feel | minimalist tech magazine, premium editorial, corporate presentation grade |
| Gradients | subtle blue gradients allowed at edges only |
| Aspect ratio | 4:5 vertical, all images and videos |

### Mood Within the System

Topic mood (e.g., 警示型) is expressed through accent usage, iconography, and composition — an orange warning chip, a caution icon — never by changing base palette, backgrounds, or style family.

### Text-in-Image Constraints

- Headline placeholder zone only; body copy, lists, and prompt text are added in the layout tool
- Reserve explicit typography space for Traditional Chinese headline in every prompt
- Prohibit generated paragraph text and tiny text via the negative prompt

### Mandatory Negative Prompt Baseline

Every image prompt includes at minimum: no messy layout, no distorted text, no fake paragraphs, no watermark, no logo, no extra fingers, no creepy human faces, no oversaturated colors, no cluttered background, no low-resolution details. Every video prompt additionally: no morphing artifacts, keep typography legible and static-safe.

## Violation Determination

- A prompt deviating from any brand token (background color, palette, aspect ratio) → Violation
- A prompt requesting body text, lists, or paragraphs inside the image → Violation
- A prompt missing the mandatory negative baseline → Violation

Violation scenario: P7 避坑 page prompt uses "dark dramatic red background" to convey danger — mood leaked into the base palette. Correct expression: white base with an orange warning chip and caution icon → Violation.

## Exceptions

- None for daily carousels. A deliberate rebrand is a user-level decision that updates this rule first, then the prompts.
