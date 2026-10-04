# Claude Cowork 基礎入門班（互動教學 HTML）

- 交付檔：`claude-cowork-basics.html`（單一檔案，雙擊即可用，不需網路、不需安裝）
- 原始碼：`cowork-course-src/`（style.css / data.js / sim.js / course.js / template.html）
- 重新建置：`python3 deliverables/cowork-course-src/build.py`

## 四套皮膚（右上角四顆圓點）
糖果粗框（預設，薄荷底）／米色手札／像素夜／深夜綠。網址參數 `?skin=candy|paper|arcade|forest`。

## 給新手的設計
- 單元 1：Chat／Cowork／Code 用「問答／動手做／寫程式」一句話分，附配對小遊戲。
- 單元 2：Skill、MCP（連接器）、Project（專案）、排程用生活比喻講白，附配對小遊戲；模擬器新增「專案」。
- 每課頂端黃色提示框；課程上方「？」開啟名詞小辭典（7 個詞）。
- 每單元有小測驗（共 28 題），答錯可重答。

## 模擬器版面（依實際截圖與官方說明）
- 模擬器固定使用 Claude 風格（米白、細邊框、serif 標題、橘棕送出鈕），不受右上角皮膚影響。
- 標籤預設英文（與實際畫面一致：New task／Projects／Scheduled／Customize／Recents；Progress／Working folder／Context；Allow／Deny），側邊欄左下角 EN／中 可切換。
輸入框左下「＋」與 Chat｜Cowork 切換、右下模型與強度（可點開選擇）、橘色送出鈕；Code 放在側邊欄。截圖中沒出現的部分（例如 Code 的位置）為推測，請對照你的版本。

## 查證與參考
- 事實依官方說明查證（2026-10-04）：[Cowork 入門](https://support.claude.com/en/articles/13345190-getting-started-with-cowork)、[排程任務](https://support.claude.com/en/articles/13854387)、[專案](https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-cowork)。
- 重點更正：排程任務多半在雲端執行（電腦關機也會跑），用到本機檔案時電腦要開著；每次排程都是全新對話。官方另註明 2026-10-06 起新的 Cowork 任務改在雲端執行。
- 權限模式為「手動核准／自動／全部略過」，永久刪除一律詢問；專案有自己的指示、檔案、排程與記憶。
- 觀念範圍（Model／MCP／Skill／Plugin、Token、上下文視窗、排程）參考「Cowork 闖關學院」，但比喻、文字、版面與動畫皆為本教材原創，刻意不與參考檔相似。

## 五種檢視（右上角切換）
| 檢視 | 內容 |
|---|---|
| 心智圖 | 5 張：零件／任務怎麼走／安全／擴充／五個例子。點節點展開、拖曳、兩指縮放、全展開／全收合／看全面 |
| 分層卡片 | 3 層：誰在用接了什麼／裡面有哪些零件／一個任務怎麼走。每塊可點開看細節 |
| 全景 | 三層疊在一頁 + 五張心智圖入口 |
| 辭典 | 14 個名詞：搜尋（中英文、同義詞）、分類篩選、每個名詞一個小動畫（點一下重播）、可跳到練習與心智圖 |
| 實作課程 | 閱讀器版型：7 單元 × 4 課（看動畫／懂重點／動手做／小測驗）= 24 課，左右大圓鈕翻頁，底部分段進度；「做」課附可複製的指令卡 |

互通：心智圖節點「▶ 去練習」跳到對應單元；細節面板「在心智圖中看」定位節點；單元頁「對照心智圖」。
網址參數：`?view=map|layers|overview|learn`、`?teacher=1`。

## 修改內容的位置
| 想改什麼 | 檔案 |
|---|---|
| 心智圖節點、分層卡片內容、像素圖示 | `map.js` |
| 名詞辭典內容與小動畫 | `gloss.js`（動畫樣式在 `reader.css`） |
| 單元文字、練習步驟、小測驗、影片場景 | `data.js` |
| 模擬器畫面與行為（資料夾、任務情境、權限卡） | `sim.js` |
| 播放器、閱讀器翻頁、計分、結業證書 | `course.js` |
| 基本版面 / 閱讀器與影片樣式 / 四套皮膚 | `style.css` / `reader.css` / `skins.css` |

## 老師功能
- 右上「老師模式」：解鎖全部單元、答案加綠色標記、練習步驟可略過。也可用網址 `?teacher=1`。
- 「重置進度」：清除學員的積分與解鎖狀態（資料只存在該瀏覽器）。

## 注意
介面為教學仿製（右上角標示「教學模擬版」），名稱與流程以學員實際版本為準；外掛內容為示意。

## 自動化驗證（end-to-end）
`node deliverables/tests/e2e.js`（需 playwright 與 Chromium，可用環境變數 `PW_CHROMIUM` 指定瀏覽器）。涵蓋 10 組、29 項：載入與外部連線、重建一致性、皮膚隔離、5 張心智圖（含重疊檢查）、分層卡片、辭典搜尋與動畫、7 單元完整學習流程（含鎖定、答錯扣分、證書、重整保留、重置）、模擬器 14 種情境、影片播放器、老師模式與容錯、手機寬度與無障礙。

未涵蓋：真實 iPhone／Safari／Firefox、螢幕閱讀器、語音旁白實際發聲、與真實 Cowork 畫面的逐像素比對、真人新手試用。
