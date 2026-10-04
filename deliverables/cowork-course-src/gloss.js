/* ========== 名詞辭典：可搜尋 + 每個名詞一個小動畫 ========== */
const GCATS=['全部','模式','擴充','產出文件','安全與流程','用量與模型'];
/* 內容依官方說明（support.claude.com，2026-10-04 查證）與你提供的「Cowork 闖關學院」整理；版本更新後以官方為準 */
const GLOSS=[
 {id:'chat',cat:'模式',t:'Chat',s:'問答',d:'你問，它答。像到櫃台問業務。檔案要你自己貼上去，它不會替你動手做。',e:'例：「應付票據是什麼？」',k:'聊天 對話 問答 單輪',go:1},
 {id:'cowork',cat:'模式',t:'Cowork',s:'請它動手做',d:'你交代任務、給資料夾，它自己拆步驟、讀檔、整理、做出檔案，你在旁邊看進度。像坐在你旁邊、能碰你電腦的助理。（畫面上另有 Code 分頁，是給工程師用的，這門課不教。）',e:'例：把 200 張發票整理成 Excel',k:'派工 助理 agent 自主 多步驟',go:1},
 {id:'model',cat:'用量與模型',t:'模型（Model）',s:'大腦',d:'真正在「想」的部分。有小、中、大三種：小的快又省（Haiku），中的日常首選（Sonnet），大的最會想（Opus）。',e:'例：先用 Sonnet，量大改 Haiku，卡關才升 Opus',k:'haiku sonnet opus 大腦 claude 選擇',map:'model'},
 {id:'mcp',cat:'擴充',t:'MCP（連接器）',s:'通往外部工具的專線',d:'讓 Claude 連到 Gmail、雲端硬碟等外部工具。MCP 是這類專線的規格名稱，畫面上通常叫「連接器」。簡單分：連接器決定「碰得到什麼」，Skill 決定「照什麼做」。',e:'例：連上 Gmail，讓它把催款信存成草稿',k:'connector 連接器 插頭 插座 gmail drive notion model context protocol',go:5,map:'conn'},
 {id:'skill',cat:'擴充',t:'Skill（技能）',s:'做事說明書',d:'把你的做法寫下來（放在一個資料夾裡的 SKILL.md），Claude 需要時就照著做。像公司的作業手冊（SOP）。',e:'例：月結報表要千分位、末列加總',k:'sop 手冊 說明書 技能 skill.md 做法',go:5,map:'skill'},
 {id:'plugin',cat:'擴充',t:'Plugin（外掛）',s:'到職大禮包',d:'把技能、連接器、子代理打包成一整套，一次裝好，也能分享給同事。像新人報到時一次發下來的資料夾、帳號與手冊。內容依外掛而異。',e:'例：財務會計外掛（示意）',k:'外掛 套件 工具箱 plugin 打包 sub-agent 子代理',go:5,map:'plug'},
 {id:'project',cat:'擴充',t:'Project（專案）',s:'專案資料夾',d:'把同一件事的說明、檔案放在一起。專案有自己的指示、排程和記憶，之後在裡面做事都共用。可從零開始、匯入 Claude 專案，或用現有資料夾建立。',e:'例：「2026 月結專案」',k:'專案 project 工作區 記憶 instructions',go:7,map:'project'},
 {id:'schedule',cat:'擴充',t:'排程（Schedule）',s:'自動開工的行事曆',d:'選頻率（每小時／每天／平日／每週／手動），時間一到 Claude 自己開工。每次都是一個全新的對話，不記得上次，所以指令要寫得自己看得懂。多半在雲端跑；用到你電腦裡的檔案時，電腦要開著。',e:'例：每月 5 日 09:00 出月結報表',k:'schedule 定時 自動 鬧鐘 排程任務 scheduled',go:6},
 {id:'excel',cat:'產出文件',t:'Excel 表',s:'整理成表格、會算數',d:'Claude 可以把資料整理成 Excel，也能放真正的公式（例如 =單價×數量），不只是貼上數字。做完要自己點開，確認公式和合計對不對。',e:'例：把三家報價單做成比較表',k:'excel 試算表 表格 公式 xlsx 報價 合計',go:8},
 {id:'word',cat:'產出文件',t:'Word 文件',s:'整理成有條理的文件',d:'把雜亂的筆記整理成有標題、有段落、有待辦事項的文件初稿。事實、人名、語氣要你把關。（Word 檔的支援以你的版本為準）',e:'例：把會議記錄寫成會議紀要',k:'word 文件 docx 報告 紀要 文字',go:8},
 {id:'slides',cat:'產出文件',t:'簡報（PowerPoint）',s:'一頁一個重點',d:'把重點排成幾頁投影片。每頁只放一個重點，看的人才記得住；數字與用字要逐頁核對。',e:'例：把月報做成 5 頁簡報',k:'簡報 投影片 powerpoint pptx slides ppt',go:8},
 {id:'folder',cat:'安全與流程',t:'授權資料夾',s:'唯一的檔案範圍',d:'你指定的資料夾，是 Claude 能讀寫的範圍。像只借出一個抽屜的鑰匙，不是整間檔案室。',e:'例：只授權「發票_2026Q3」',k:'資料夾 權限 最小權限 folder 工作資料夾',go:3,map:'folder'},
 {id:'perm',cat:'安全與流程',t:'權限模式',s:'要不要先問你',d:'三種：手動核准（每步問你，新手用這個）、自動（先做安全檢查再批准）、全部略過（不問，最危險）。永久刪除檔案，不管哪種模式都會問你。',e:'例：新手先選「手動核准」',k:'manual auto skip 核准 允許 拒絕 審核 permission',go:4,map:'perm'},
 {id:'prompt',cat:'安全與流程',t:'指令（Prompt）',s:'你交代的那句話',d:'寫清楚「目標、輸入、做法、輸出、檢查」，結果就不會亂猜。',e:'例：把「發票_2026Q3」整理成 Excel，缺統編標紅，不要改原檔',k:'prompt 提示詞 指令 任務 要素',go:4,map:'s1'},
 {id:'token',cat:'用量與模型',t:'Token',s:'用量度數',d:'模型「讀」和「寫」的字量，像電表度數：你的指令、讀進去的檔案、對話歷史、工具回傳的資料、Claude 的回答，全部都會計入。',e:'例：換主題就開新對話、指定檔案別丟整個資料夾，可以省',k:'用量 額度 費用 省 省錢 花費 token 計價',},
 {id:'context',cat:'用量與模型',t:'上下文視窗',s:'白板大小',d:'模型一次能「寫在白板上」的內容量。白板寫滿了，最舊的會被擦掉，判斷也會變差。',e:'例：話題換了就開新對話，等於換一塊乾淨的白板',k:'context window 上下文 記憶 對話歷史 視窗 省錢 開新對話'}
];

/* ---- 小動畫（SVG + CSS，3–4 秒循環；減少動態時顯示最終畫面） ---- */
const GR=(x,y,w,h,c,st,rx)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx===undefined?2:rx}" class="${c||''}" ${st?`style="${st}"`:''}/>`;
const GA_SVG=(body)=>`<svg viewBox="0 0 96 72" aria-hidden="true">${body}</svg>`;
const GANIM={
 chat:()=>GA_SVG(`${GR(6,8,52,20,'fc ln','--dl:0s',8)}${GR(12,14,30,3,'fi pop','--dl:.2s',1)}${GR(12,20,20,3,'fi pop','--dl:.35s',1)}${GR(38,38,52,24,'fa ln pop','--dl:1.4s',8)}${GR(44,45,36,3,'fi pop','--dl:1.8s',1)}${GR(44,51,26,3,'fi pop','--dl:2.1s',1)}`),
 cowork:()=>GA_SVG(`<path class="fs ln" d="M6 30h20l4 5h22v28H6z"/>${GR(10,12,10,12,'fc ln slide','--dl:0s',1)}${GR(22,8,10,12,'fc ln slide','--dl:.4s',1)}${GR(34,12,10,12,'fc ln slide','--dl:.8s',1)}<path class="ln" d="M58 48h12m-4-4 4 4-4 4" fill="none"/>${GR(72,32,20,28,'fc ln pop','--dl:1.6s',2)}<path class="ln pop" style="--dl:1.9s" d="M76 40h12M76 46h12M76 52h8" fill="none"/><path class="stk pop" style="--dl:2.2s" d="M80 24l4 4 7-8" fill="none"/>`),
 code:()=>GA_SVG(`${GR(8,8,80,56,'fc ln','',4)}<path class="ln" d="M16 22l6 5-6 5" fill="none"/>${GR(28,24,40,3,'fi type','--dl:.3s',1)}${GR(28,34,52,3,'fi type','--dl:1.1s',1)}${GR(28,44,30,3,'fi type','--dl:1.9s',1)}${GR(62,43,4,6,'fa blink','',0)}`),
 excel:()=>GA_SVG(`${GR(8,8,80,56,'fc ln','',3)}${GR(8,8,80,12,'fg ln','',3)}<path class="ln" d="M8 30h80M8 42h80M8 54h80M34 20v44M60 20v44" fill="none"/>${GR(12,32,18,6,'fi pop','--dl:.2s',1)}${GR(38,32,18,6,'fi pop','--dl:.5s',1)}${GR(12,44,18,6,'fi pop','--dl:.8s',1)}${GR(38,44,18,6,'fi pop','--dl:1.1s',1)}${GR(63,44,20,8,'fy ln pop','--dl:1.6s',2)}<path class="stk pop" style="--dl:2.1s" d="M66 24l4 4 8-7" fill="none"/>`),
 word:()=>GA_SVG(`${GR(22,4,52,64,'fc ln','',3)}${GR(30,12,36,6,'fb ln pop','--dl:.2s',2)}${GR(30,26,36,3,'fi type','--dl:.7s',1)}${GR(30,33,30,3,'fi type','--dl:1.2s',1)}${GR(30,40,36,3,'fi type','--dl:1.7s',1)}${GR(30,47,22,3,'fi type','--dl:2.2s',1)}${GR(30,56,8,6,'fg ln pop','--dl:2.7s',1)}`),
 slides:()=>GA_SVG(`${GR(14,12,60,40,'fs ln','--dl:0s',3)}${GR(24,6,60,40,'fc ln slide2','--dl:.3s',3)}${GR(32,14,28,5,'fa ln pop','--dl:.9s',2)}${GR(32,24,40,3,'fi pop','--dl:1.3s',1)}${GR(32,31,32,3,'fi pop','--dl:1.7s',1)}${GR(34,56,28,5,'fy ln pop','--dl:2.2s',2)}`),
 model:()=>GA_SVG(`<path class="fs ln pulse" d="M28 50a12 12 0 0 1 2-23 16 16 0 0 1 30-2 13 13 0 0 1 4 25z"/><path class="stk pulse" style="--dl:.3s" d="M48 28v14M41 35h14" fill="none"/>${GR(4,34,12,4,'fi slide','--dl:0s',2)}${GR(4,42,8,4,'fi slide','--dl:.5s',2)}${GR(80,38,12,4,'fa slide2','--dl:1.6s',2)}`),
 mcp:()=>GA_SVG(`${GR(60,24,26,24,'fs ln','',4)}${GR(58,30,4,4,'fi','',0)}${GR(58,40,4,4,'fi','',0)}<g class="plug"><path class="ln fc" d="M8 28h18v16H8z"/>${GR(26,31,10,3,'fa','',0)}${GR(26,38,10,3,'fa','',0)}<path class="ln" d="M8 36H2" fill="none"/></g><path class="stk spark" d="M54 36l-5-5m5 5l-5 5m5-5h-8" fill="none"/>`),
 skill:()=>GA_SVG(`${GR(22,6,52,60,'fc ln','',3)}${GR(30,16,8,8,'fs ln','',1)}${GR(44,18,24,3,'fi','',1)}${GR(30,32,8,8,'fs ln','',1)}${GR(44,34,24,3,'fi','',1)}${GR(30,48,8,8,'fs ln','',1)}${GR(44,50,24,3,'fi','',1)}<path class="stk pop" style="--dl:.3s" d="M31 20l3 3 5-6" fill="none"/><path class="stk pop" style="--dl:1.2s" d="M31 36l3 3 5-6" fill="none"/><path class="stk pop" style="--dl:2.1s" d="M31 52l3 3 5-6" fill="none"/>`),
 plugin:()=>GA_SVG(`${GR(14,34,68,28,'fs ln','',4)}${GR(10,26,76,10,'fa ln lid','',3)}${GR(24,6,14,14,'fc ln drop','--dl:0s',2)}${GR(42,6,14,14,'fg ln drop','--dl:.7s',7)}${GR(60,6,14,14,'fc ln drop','--dl:1.4s',2)}`),
 project:()=>GA_SVG(`<path class="fs ln" d="M8 22h22l5 6h53v38H8z"/>${GR(18,32,38,6,'fc ln pop','--dl:.2s',1)}${GR(18,41,38,6,'fc ln pop','--dl:.7s',1)}${GR(18,50,38,6,'fc ln pop','--dl:1.2s',1)}${GR(62,34,24,22,'fy ln pop','--dl:1.8s',1)}${GR(66,40,16,2,'fi pop','--dl:2.1s',1)}${GR(66,46,12,2,'fi pop','--dl:2.3s',1)}`),
 schedule:()=>GA_SVG(`<circle class="fc ln" cx="34" cy="36" r="24"/><path class="ln" d="M34 18v4M34 50v4M16 36h4M48 36h4" fill="none"/><g class="hand"><path class="stk" d="M34 36V20" fill="none"/></g><circle class="fi" cx="34" cy="36" r="2.5"/>${GR(66,22,24,28,'fc ln pop','--dl:2.2s',2)}<path class="ln pop" style="--dl:2.4s" d="M70 30h16M70 36h16M70 42h10" fill="none"/>`),
 folder:()=>GA_SVG(`${GR(14,12,68,52,'none dashed','',6)}<path class="fs ln" d="M24 30h16l4 5h28v22H24z"/>${GR(30,38,14,12,'fc ln pop','--dl:.3s',1)}<path class="stk pop" style="--dl:1s" d="M54 44l5 5 9-10" fill="none"/>${GR(2,6,10,10,'fi ghost','',1)}${GR(84,50,10,10,'fi ghost','--dl:.5s',1)}${GR(2,52,10,10,'fi ghost','--dl:1s',1)}`),
 perm:()=>GA_SVG(`${GR(6,22,26,22,'fc ln','',11)}${GR(35,22,26,22,'fc ln','',11)}${GR(64,22,26,22,'fc ln','',11)}${GR(6,22,26,22,'fa ln hl','',11)}${GR(10,52,76,10,'fb ln pop','--dl:2.4s',5)}<path class="ln" d="M14 33h10M43 33h10M72 33h10" fill="none"/><path class="stk pop" style="--dl:2.6s" d="M30 57h36" fill="none"/>`),
 prompt:()=>GA_SVG(`${GR(6,10,84,52,'fc ln','',5)}${GR(12,16,24,10,'fa ln chip','--dl:0s',5)}${GR(40,16,24,10,'fg ln chip','--dl:.7s',5)}${GR(12,31,24,10,'fb ln chip','--dl:1.4s',5)}${GR(40,31,24,10,'fy ln chip','--dl:2.1s',5)}${GR(12,48,70,3,'fi pop','--dl:2.7s',1)}`),
 token:()=>GA_SVG(`${GR(6,10,84,30,'fc ln','',5)}${GR(12,16,72,18,'fs','',3)}${GR(12,16,72,18,'fa meter','',3)}${GR(8,48,10,10,'fy ln pop','--dl:.2s',5)}${GR(22,48,10,10,'fy ln pop','--dl:.7s',5)}${GR(36,48,10,10,'fy ln pop','--dl:1.2s',5)}${GR(50,48,10,10,'fy ln pop','--dl:1.7s',5)}${GR(64,48,10,10,'fy ln pop','--dl:2.2s',5)}${GR(78,48,10,10,'fy ln pop','--dl:2.7s',5)}`),
 context:()=>GA_SVG(`${GR(4,4,88,64,'fc ln','',4)}${GR(10,14,22,32,'fs ln paper out','',2)}${GR(30,12,22,36,'fy ln paper','--dl:.4s',2)}${GR(50,14,22,32,'fa ln paper','--dl:.8s',2)}${GR(68,12,22,36,'fg ln paper','--dl:1.2s',2)}${GR(8,54,80,4,'fi','',2)}`)
};
GLOSS.forEach(g=>{g.anim=GANIM[g.id]});

/* ---- 搜尋與畫面 ---- */
const GL={q:'',cat:'全部'};
const gHay=g=>(g.t+' '+g.s+' '+g.d+' '+g.e+' '+(g.k||'')+' '+g.cat).toLowerCase();
const gMark=(txt,q)=>{if(!q)return esc(txt);const i=txt.toLowerCase().indexOf(q);if(i<0)return esc(txt);return esc(txt.slice(0,i))+'<mark>'+esc(txt.slice(i,i+q.length))+'</mark>'+esc(txt.slice(i+q.length))};
function glossCards(){
 const q=GL.q.trim().toLowerCase();
 const list=GLOSS.filter(g=>(GL.cat==='全部'||g.cat===GL.cat)&&(!q||gHay(g).includes(q)));
 if(!list.length)return `<div class="empty" style="grid-column:1/-1">找不到「${esc(GL.q)}」。試試：連接器、排程、省錢、刪除、專案、Gmail。</div>`;
 return list.map(g=>`<article class="gcard" data-id="${g.id}"><div class="ga" data-act="replay" role="img" aria-label="${esc(g.t)} 的小動畫（點一下重播）" title="點一下重播">${g.anim()}</div><div class="gbody"><div class="gh"><b>${gMark(g.t,q)}</b><span class="gs">${gMark(g.s,q)}</span></div><p>${gMark(g.d,q)}</p><em>${gMark(g.e,q)}</em><div class="gbtn">${g.go?`<button class="mini" data-act="go-unit" data-u="${g.go}">▶ 去練習</button>`:''}${g.map&&NODES[g.map]?`<button class="mini" data-act="to-map" data-id="${g.map}">在心智圖看</button>`:''}</div></div></article>`).join('');
}
function renderGloss(){
 const el=$('#view-gloss');
 el.innerHTML=`<div class="vwrap2 wide"><h2 class="lyh serif">名詞辭典</h2><p class="lys">${GLOSS.length} 個常聽到的詞，每個一句話＋一個小動畫。可以直接搜尋。</p>
 <div class="gsearch"><input id="gl-q" type="search" placeholder="搜尋：例如 連接器、排程、省錢、Gmail、刪除…（按 / 快速搜尋）" value="${esc(GL.q)}" aria-label="搜尋名詞" autocomplete="off"><span class="gcount" id="gl-n"></span></div>
 <div class="gcats" role="group" aria-label="分類">${GCATS.map(c=>`<button class="${c===GL.cat?'on':''}" data-act="gl-cat" data-c="${c}">${c}</button>`).join('')}</div>
 <div class="ggrid" id="gl-grid">${glossCards()}</div>
 <p class="gnote">內容依官方說明整理（查證日：2026-10-04），功能名稱與位置會隨版本更新，請以你實際的 Cowork 畫面為準。官方說明：<a href="https://support.claude.com/en/articles/13345190-getting-started-with-cowork" target="_blank" rel="noopener">Cowork 入門</a>、<a href="https://support.claude.com/en/articles/13854387" target="_blank" rel="noopener">排程任務</a>、<a href="https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-cowork" target="_blank" rel="noopener">專案</a>。</p></div>`;
 glossCount();
}
function glossCount(){const n=$('#gl-n');if(n)n.textContent=$$('#gl-grid .gcard').length+' 筆'}
function glossRefresh(){const g=$('#gl-grid');if(g){g.innerHTML=glossCards();glossCount();$$('.gcats button').forEach(b=>b.classList.toggle('on',b.dataset.c===GL.cat))}}
Object.assign(GA,{
 gloss(){setView('gloss')},
 'gl-cat'(el){GL.cat=el.dataset.c;glossRefresh()},
 replay(el){const s=el.querySelector('svg');if(!s)return;const c=s.cloneNode(true);el.replaceChild(c,s)}
});
document.addEventListener('input',e=>{if(e.target.id==='gl-q'){GL.q=e.target.value;glossRefresh()}});
document.addEventListener('keydown',e=>{
 if(e.key==='/'&&document.body.dataset.view==='gloss'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();const i=$('#gl-q');if(i)i.focus()}
 if(e.key==='Escape'&&document.activeElement&&document.activeElement.id==='gl-q'){GL.q='';document.activeElement.value='';glossRefresh()}
});

setInterval(()=>{
 if(document.body.dataset.view!=='gloss'||document.hidden||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 $$('#gl-grid .ga').forEach(a=>{const sv=a.querySelector('svg');if(sv)a.replaceChild(sv.cloneNode(true),sv)});
},5200);
