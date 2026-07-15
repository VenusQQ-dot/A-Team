---
name: Carousel Structure
description: Fixed 8-page carousel structure, section contracts A-H, and per-page field definitions
user-invocable: false
---

# Carousel Structure

Reference contract for all content agents and reviewers. The daily package always covers Sections A–H, distributed across four files.

## Section-to-File Mapping

| File | Sections |
|------|----------|
| `daily-topics.md` | A (3 candidate topics), B (recommendation) |
| `carousel-script.md` | C (8-page script) |
| `higgsfield-prompts.md` | D (8 image prompts), E (2 video prompts) |
| `caption-hashtags.md` | F (caption), G (15 hashtags), H (source table) |

## Section A — Candidate Topic Fields (×3)

Each candidate: 主題標題 / 為什麼今天適合做這個主題 (must cite source IDs) / 受眾痛點 / 適合頁數 / 內容角度 (教學型 / 趨勢型 / 工具型 / 案例型 / 警示型). The three candidates must span at least 2 different angles.

## Section B — Recommendation

The chosen topic, the reason it wins today (evidence with source IDs), and a falsification condition (「若 {condition},改選 {alternative}」).

## Section C — Fixed 8-Page Structure

| 頁 | 角色 | 內容要求 |
|----|------|---------|
| 1 | 強 Hook 封面 | 今日 AI 重點一句話,製造點開動機 |
| 2 | 問題 / 趨勢背景 | 這件事影響誰、為什麼現在重要 |
| 3–5 | 重點知識或操作步驟 | 新功能 / 實際用法 / Prompt 或操作技巧 |
| 6 | 職場案例 | 行政 / 會計 / 簡報 / 教學的具體用法 |
| 7 | 避坑提醒 / 進階技巧 | 不要誤用、不要盲信,或進一步的技巧 |
| 8 | 總結 + CTA | 重點回收 + 收藏 / 分享 / 留言引導 |

Per-page fields (all 8 required): 頁碼 / 頁面標題 / 主文案 (≤45 字) / 補充說明 (≤80 字) / 視覺重點 / 版面構圖建議 / icon 或圖像元素 / CTA 或引導語。

Character counting: count CJK and Latin characters equally, one character each; punctuation counts; spaces do not.

## Section F — Caption

Opening 2 lines (hook that works without opening the carousel) → exactly 3 key points, each traceable to a page → closing CTA covering save + comment + share. 專業但不生硬, Traditional Chinese.

## Section G — Hashtags

Exactly 15: 5 AI 趨勢 + 5 AI 工具 + 5 職場應用. Every tag must relate to actual carousel content.

## Section H — Source Table

Per source: 標題 / 來源名稱 / 日期 / 連結 / 可信度評估 / 支撐了哪幾頁. Every page with a factual claim must appear in at least one source's mapping.

## Examples

### Normal case
A 工具型 topic: P3–P5 become three operational steps, each 主文案 an imperative ("打開 Web Search,先問這句"), P6 an 行政 weekly-report case. All counts within limits.

### Edge case
A 警示型 topic with no operational steps: P3–P5 become three concrete impact scenarios, each ending with one action the reader takes this week. Page roles are preserved; the adaptation is logged in the phase `decisions.md`. Structure adapts content, never page count.

### Rejection case
A draft with 6 pages "because the topic is thin" → reject. The structure is fixed at 8 pages; if the topic cannot fill 8 pages with sourced content, the topic selection is wrong — return `NEEDS_CONTEXT` to the coordinator to re-select rather than shrinking the format.
