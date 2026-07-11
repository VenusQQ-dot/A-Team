---
name: Reels Auto Edit
description: Auto-edit pipeline stages, service adapters, and fallback route for short-video production
---

# Reels Auto Edit

## Purpose

Fixed pipeline for producing Reels/Shorts without manual editing, independent of which service executes it. Used by `reels-producer`. The pipeline stages and quality bar never change; the executing service is a configuration value.

## Pipeline Stages

1. **Ingest**: inventory source footage against the script's beats. Every beat must map to footage before any processing starts.
2. **Auto-cut**: cut footage to the script's beat timings. The hook segment (0–3s) is pinned — no automatic trimming may remove or delay it.
3. **Captions**: transcribe/burn captions in the post language; also emit a sidecar `.srt`. Sync tolerance: ≤ 300ms offset.
4. **Transitions**: apply the house preset (hard cuts default; one whip transition allowed at the midpoint beat; no dissolves).
5. **Verify**: 9:16 ratio, ≤ 90s, hook text visible by 3s, captions synced, audio levels normalized (-14 LUFS target).

## Service Adapters

| Route | When | Stages covered |
|-------|------|----------------|
| Hyperframes (default) | `HYPERFRAMES_API_KEY` present | 2, 3, 4 via its auto-cut / auto-captions / auto-transitions endpoints |
| FFmpeg + Whisper (fallback) | No service credential, or service rejects the job | 2 via ffmpeg cut list from beat timings; 3 via whisper transcription + ffmpeg subtitle burn; 4 via ffmpeg xfade/concat |
| Mixed | Service covers some stages only (e.g., caption language unsupported) | Per-stage routing; record which stage ran where |

Record the chosen route and per-stage execution in the pipeline record — reproducibility requires knowing what produced the file.

## Failure Policy

Each verify-spec failure re-runs only its producing stage, once. A second failure of the same spec stops the pipeline and escalates with the measured values. Never deliver a file that failed any verify spec.

## Examples

### Normal Case
45s script, 9 beats, screen recording provided. Hyperframes route: auto-cut to beats, zh-TW captions (sync 180ms), house transitions, all verify specs pass. Pipeline record lists the route, per-stage duration, and cost.

### Edge Case
Hyperframes accepts the cut but its caption engine outputs traditional-Chinese with mainland phrasing glossary. Mixed route: keep its cut, re-run captions via Whisper with the zh-TW glossary, re-burn via ffmpeg. Record the split and the reason.

### Rejection Case
Script's beat 7 calls for "user reaction shot" but no such footage exists and B-roll generation was not authorized in the dispatch. Do not loop beat 6's clip to fill time — that fabricates footage. Stop at Ingest and return `NEEDS_CONTEXT: beat 7 footage missing; supply footage or authorize B-roll generation`.
