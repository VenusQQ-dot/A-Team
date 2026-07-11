---
name: Meta Graph Publishing
description: Meta Graph API container flows, scope verification, backoff, and slot randomization for publishing
---

# Meta Graph Publishing

## Purpose

Operational procedure for publishing carousels and Reels to Instagram via the Meta Graph API. Used by `publisher`. All caps and gates come from `rules/publishing-approval.md`; this skill defines the mechanics.

## Preconditions (verify before any scheduling)

- `META_ACCESS_TOKEN` present in the environment (never printed) with scopes `instagram_content_publish`, `pages_read_engagement`.
- IG professional account ID resolvable via `GET /me/accounts` → linked IG account.
- Token expiry date logged in the worklog; expiry within 7 days is surfaced to the coordinator proactively.

## Carousel Publish Flow

1. Per image: `POST /{ig-user-id}/media` with `{image_url, is_carousel_item: true}` → collect item container IDs.
2. `POST /{ig-user-id}/media` with `{media_type: CAROUSEL, children: [ids], caption}` → carousel container ID.
3. Check container status `GET /{container-id}?fields=status_code` until `FINISHED` (poll ≤ 5 times, 10s apart).
4. `POST /{ig-user-id}/media_publish` with `{creation_id}` → post ID.
5. Verify live: `GET /{post-id}?fields=permalink`; log post ID + permalink in `publish-queue.md`.

## Reels Publish Flow

1. `POST /{ig-user-id}/media` with `{media_type: REELS, video_url, caption, share_to_feed: true}`.
2. Same status-poll → publish → verify sequence as above (video processing takes longer; poll ≤ 12 times, 15s apart).

## Slot Randomization

- Inputs: allowed posting windows (from the rule), packages to schedule, minimum spacing.
- Per package: pick a uniformly random minute within a randomly chosen allowed window; reject and redraw if within minimum spacing of an already-assigned slot or an already-published post (max 20 redraws, then take the earliest compliant minute deterministically).
- Assigned slots are final for the cycle — re-randomizing on every run would drift packages indefinitely.

## Error Handling

- HTTP 4xx (except 429): do not retry — the request is wrong. Log the full error body (minus token), mark FAILED, escalate.
- 429 / 5xx: exponential backoff 60s → 240s → 900s, max 3 attempts, then FAILED.
- Idempotency: before any publish call, check `publish-queue.md` for an existing post ID for this package. A crash between publish and logging is recovered by querying recent media (`GET /{ig-user-id}/media?limit=10`) before re-publishing.

## Examples

### Normal Case
Approved 7-slide carousel at Thu 19:17: 7 item containers, carousel container FINISHED on poll 2, publish returns post ID, permalink verified and logged. Daily count incremented to 3/50.

### Edge Case
Reels container stuck `IN_PROGRESS` after 12 polls (video transcoding slow). Do not re-upload — that risks a duplicate. Leave the container referenced in the queue as `PENDING_PROCESSING`, re-check at +30min once, then escalate with the container ID if still unfinished.

### Rejection Case
Queue entry's scheduled day arrives but the package's QA verdict file is missing from the worklog (moved or deleted). Precondition broken: do not publish on the memory that "it passed last week". Mark `BLOCKED (verdict unverifiable)` and escalate — the verdict file must be restored or QA re-run.
