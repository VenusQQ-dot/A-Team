# Claude Cowork 基礎入門班（互動教學 HTML）

- 交付檔：`claude-cowork-basics.html`（單一檔案，雙擊即可用，不需網路、不需安裝）
- 原始碼：`cowork-course-src/`（style.css / data.js / sim.js / course.js / template.html）
- 重新建置：`python3 deliverables/cowork-course-src/build.py`

## 修改內容的位置
| 想改什麼 | 檔案 |
|---|---|
| 單元文字、練習步驟、小測驗、影片場景 | `data.js` |
| 模擬器畫面與行為（資料夾、任務情境、權限卡） | `sim.js` |
| 播放器、計分、結業證書 | `course.js` |
| 顏色與版面 | `style.css` |

## 老師功能
- 右上「老師模式」：解鎖全部單元、答案加綠色標記、練習步驟可略過。也可用網址 `?teacher=1`。
- 「重置進度」：清除學員的積分與解鎖狀態（資料只存在該瀏覽器）。

## 注意
介面為教學仿製（右上角標示「教學模擬版」），名稱與流程以學員實際版本為準；外掛內容為示意。
