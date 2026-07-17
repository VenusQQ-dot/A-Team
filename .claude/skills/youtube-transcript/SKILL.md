---
name: youtube-transcript
description: Extract transcripts from YouTube videos. Use when the user asks for a transcript, subtitles, or captions of a YouTube video and provides a YouTube URL (youtube.com/watch?v=, youtu.be/, or similar). Supports output with or without timestamps.
---

# YouTube Transcript

Extract transcripts from YouTube videos using the youtube-transcript-api.

Source: https://github.com/intellectronica/agent-skills (skills/youtube-transcript), installed 2026-07-15.

## Usage

Run the script with a YouTube URL or video ID:

```bash
uv run scripts/get_transcript.py "VIDEO_URL_OR_ID"
```

With timestamps:

```bash
uv run scripts/get_transcript.py "VIDEO_URL_OR_ID" --timestamps
```

If `uv` is unavailable, install the dependency and run with Python directly:

```bash
pip install "youtube-transcript-api>=1.0.0"
python scripts/get_transcript.py "VIDEO_URL_OR_ID"
```

## Defaults

- **Without timestamps** (default): Plain text, one line per caption segment
- **With timestamps**: `[MM:SS] text` format (or `[HH:MM:SS]` for longer videos)

## Supported URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`
- Raw video ID (11 characters)

## Output

- CRITICAL: YOU MUST NEVER MODIFY THE RETURNED TRANSCRIPT
- If the transcript is without timestamps, you SHOULD clean it up so that it is arranged by complete paragraphs and the lines don't cut in the middle of sentences.
- If you were asked to save the transcript to a specific file, save it to the requested file.
- If no output file was specified, use the YouTube video ID with a `-transcript.txt` suffix.

## Notes

- Fetches auto-generated or manually added captions (whichever is available)
- Requires the video to have captions enabled
- Falls back to auto-generated captions if manual ones aren't available

## Environment Constraint

- This skill requires outbound network access to `youtube.com`. In sandboxed remote environments whose network policy only allows package registries (e.g., Claude Code on the web with a restricted allowlist), the fetch fails with a connection error. Run it in a local Claude Code session, or in a remote environment whose network policy permits YouTube domains.
- Failure protocol: on network failure, report `BLOCKED: network policy denies youtube.com` to the user instead of retrying more than once.
