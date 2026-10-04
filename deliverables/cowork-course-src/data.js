'use strict';
/* ========== 基礎工具 ========== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const fmt=s=>{s=Math.floor(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

const P=d=>`<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC={
 folder:P('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
 file:P('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'),
 sheet:P('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M4 15h16M10 4v16"/>'),
 mail:P('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
 clock:P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
 shield:P('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
 plug:P('<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>'),
 spark:P('<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>'),
 chat:P('<path d="M4 5h16v11H9l-5 4z"/>'),
 code:P('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>'),
 check:P('<path d="m5 12 5 5 9-10"/>'),
 plus:P('<path d="M12 5v14M5 12h14"/>'),
 send:P('<path d="M12 19V5M6 11l6-6 6 6"/>'),
 book:P('<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>'),
 trash:P('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
 warn:P('<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17v.5"/>'),
 lock:P('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
 user:P('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
 layers:P('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'),
 monitor:P('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>')
};

/* ========== 模擬資料夾 ========== */
const gen=(n,f)=>Array.from({length:n},(_,i)=>f(i+1));
const FOLDERS={
 invoices:{name:'發票_2026Q3',path:'~/Documents/會計/發票_2026Q3',sens:false,count:12,files:['IMG_0231.jpg','IMG_0232.jpg','scan_0705.pdf','IMG_0240.jpg','發票-好市多.pdf','IMG_0255.jpg','scan_0718.pdf','IMG_0261.jpg','IMG_0262.jpg','scan_0725.pdf','IMG_0270.jpg','IMG_0271.jpg']},
 bank:{name:'銀行對帳單',path:'~/Documents/會計/銀行對帳單',sens:false,count:4,files:['2026-07_台新銀行.pdf','2026-08_台新銀行.pdf','2026-09_台新銀行.pdf','帳上明細_2026Q3.xlsx']},
 expenses:{name:'費用報銷',path:'~/Documents/會計/費用報銷',sens:false,count:6,files:['出差報銷_林小姐.xlsx','計程車收據_01.jpg','計程車收據_02.jpg','住宿發票.pdf','報銷申請表.docx','備註.txt']},
 personal:{name:'個人文件',path:'~/Documents/個人文件',sens:true,count:4,files:['薪資單_2026-09.pdf','身分證影本.jpg','存摺封面.png','健保卡.jpg']},
 archive:{name:'舊檔案_2023前',path:'~/Documents/會計/舊檔案_2023前',sens:false,count:47,files:gen(47,i=>`舊報表_${2019+i%4}-${String(1+i%12).padStart(2,'0')}.xlsx`)}
};
const CONNECTORS=[
 {id:'gmail',name:'Gmail',desc:'讀取郵件、建立草稿（不會自動寄出）',ic:'mail',perm:['讀取你的郵件','建立郵件草稿']},
 {id:'drive',name:'Google Drive',desc:'讀取與搜尋雲端硬碟的檔案',ic:'folder',perm:['搜尋與讀取檔案']},
 {id:'calendar',name:'Google Calendar',desc:'查看行事曆、安排會議',ic:'clock',perm:['讀取行程','建立行程']},
 {id:'slack',name:'Slack',desc:'搜尋對話、草擬訊息',ic:'chat',perm:['搜尋頻道訊息']},
 {id:'notion',name:'Notion',desc:'搜尋與整理 Notion 頁面',ic:'book',perm:['讀取頁面']}
];
const PLUGINS=[
 {id:'finance',name:'財務會計',desc:'月結、對帳、差異分析的整包工作流程',ic:'sheet',items:['技能：月結結帳檢查','技能：銀行對帳','常用指令：差異分析','建議連接器：Excel／ERP'],skills:[{id:'p-close',name:'月結結帳檢查',desc:'逐項檢查月結清單'},{id:'p-recon',name:'銀行對帳',desc:'比對銀行與帳上差異'}]},
 {id:'legal',name:'法務',desc:'合約審閱與條款比對',ic:'shield',items:['技能：合約審閱','常用指令：條款比對'],skills:[]},
 {id:'sales',name:'業務',desc:'客戶拜訪與提案整理',ic:'user',items:['技能：客戶摘要','常用指令：提案大綱'],skills:[]}
];

/* ========== 任務情境 ========== */
const SUGG=[
 {id:'invoices',ic:'sheet',t:'整理發票成 Excel',s:'讀取發票、辨識欄位、產出彙整表',p:'請讀取我授權的資料夾，把每張發票的日期、廠商、統編、金額整理成 Excel；缺統編的標紅，不要修改原始檔案。'},
 {id:'bank',ic:'layers',t:'核對銀行對帳單',s:'比對銀行與帳上明細，找出未達帳',p:'請核對「銀行對帳單」資料夾裡的銀行對帳單與帳上明細，列出未達帳項目，輸出成 Excel 對帳表。'},
 {id:'dunning',ic:'mail',t:'寫催款信草稿',s:'找出逾期客戶並草擬信件（需 Gmail）',p:'請找出逾期超過 30 天的應收帳款，為每位客戶草擬一封禮貌的催款信，先不要寄出。'},
 {id:'delete',ic:'trash',t:'清理舊檔案',s:'⚠ 危險示範：會要求刪除權限',p:'請把資料夾內 2023 年以前的舊檔案全部刪除，節省空間。',dg:true}
];
const SCEN={
 delete:{id:'delete',re:/刪除|刪掉|清除|清掉|delete/i,folder:'archive',steps:[
   {t:'掃描資料夾，找到 47 個 2023 年以前的檔案'},
   {t:'列出即將刪除的清單'},
   {t:'刪除這 47 個檔案',perm:{kind:'delete',danger:true,text:'永久刪除 47 個檔案',detail:'舊報表_2019-01.xlsx … 舊報表_2022-12.xlsx（刪除後無法從模擬環境復原）'}}],
   out:[{name:'待刪除清單.md',type:'md',pv:'dellist'}]},
 dunning:{id:'dunning',re:/催款|逾期|應收|email|信件|草擬/i,folder:null,steps:[
   {t:'找出逾期超過 30 天的應收帳款（3 家客戶）'},
   {t:'依客戶與金額草擬禮貌的催款信'},
   {t:'建立草稿'}],out:[]},
 bank:{id:'bank',re:/對帳|銀行|bank/i,folder:'bank',steps:[
   {t:'讀取 3 份銀行對帳單與帳上明細'},
   {t:'逐筆比對日期與金額'},
   {t:'找出 3 筆未達帳並分類原因'},
   {t:'建立 Excel：銀行對帳表_2026Q3.xlsx'}],
   out:[{name:'銀行對帳表_2026Q3.xlsx',type:'xlsx',pv:'bank'}]},
 invoices:{id:'invoices',re:/發票|invoice|整理|彙整|excel/i,folder:'invoices',steps:[
   {t:'讀取資料夾，找到 12 份發票檔案'},
   {t:'辨識每張發票的日期、廠商、統編、金額'},
   {t:'把檔名改成「日期_廠商_金額」',perm:{kind:'rename',danger:false,text:'重新命名 12 個檔案',detail:'例：IMG_0231.jpg → 2026-07-03_大同文具_1250.jpg'}},
   {t:'建立 Excel：發票彙整_2026Q3.xlsx'},
   {t:'標記異常：2 張缺統編、1 張金額與品項不符'}],
   out:[{name:'發票彙整_2026Q3.xlsx',type:'xlsx',pv:'invoices'},{name:'異常清單.md',type:'md',pv:'issues'}]},
 generic:{id:'generic',re:/./,folder:null,steps:[
   {t:'理解你的需求並讀取授權資料夾'},{t:'整理重點並產出摘要'}],
   out:[{name:'摘要.md',type:'md',pv:'summary'}]}
};

const PREVIEW={
 invoices:()=>`<p class="note" style="margin-bottom:8px">教學範例資料（僅顯示前 6 列，共 12 列）。紅色＝缺統編，黃色＝金額與品項不符。</p><table class="xl"><tr><th>日期</th><th>廠商</th><th>統編</th><th>金額</th><th>狀態</th></tr>
 <tr><td>07-03</td><td>大同文具</td><td>12345678</td><td class="r">1,250</td><td>正常</td></tr>
 <tr class="bad"><td>07-05</td><td>台灣大哥大</td><td>（缺）</td><td class="r">1,099</td><td>缺統編</td></tr>
 <tr><td>07-09</td><td>全聯福利中心</td><td>23456789</td><td class="r">3,480</td><td>正常</td></tr>
 <tr class="bad"><td>07-12</td><td>好市多</td><td>（缺）</td><td class="r">5,620</td><td>缺統編</td></tr>
 <tr><td>07-18</td><td>遠傳電信</td><td>34567890</td><td class="r">899</td><td>正常</td></tr>
 <tr class="warn"><td>07-25</td><td>誠品書店</td><td>45678901</td><td class="r">2,300</td><td>金額與品項不符</td></tr></table>`,
 issues:()=>`<div class="md"># 異常清單（需要你人工確認）\n\n1. 2026-07-05 台灣大哥大：缺少統一編號\n2. 2026-07-12 好市多：缺少統一編號\n3. 2026-07-25 誠品書店：發票金額 2,300，與品項加總 2,030 不符\n\n建議：先向廠商補開或補齊資料，再入帳。</div>`,
 bank:()=>`<table class="xl"><tr><th>日期</th><th>摘要</th><th>銀行</th><th>帳上</th><th>差異</th></tr>
 <tr><td>08-29</td><td>客戶 A 匯款</td><td class="r">120,000</td><td class="r">0</td><td class="r">120,000</td></tr>
 <tr><td>09-15</td><td>手續費</td><td class="r">-30</td><td class="r">0</td><td class="r">-30</td></tr>
 <tr class="warn"><td>09-30</td><td>支票 #1088（在途）</td><td class="r">0</td><td class="r">-45,000</td><td class="r">45,000</td></tr></table><p style="margin-top:8px;font-size:13px;color:var(--muted)">未達帳 3 筆：銀行已入帳帳上未記 2 筆、帳上已記銀行未入帳 1 筆。</p>`,
 dunning:()=>`<div class="md">主旨：【帳款提醒】2026 年 7 月份貨款\n\nA 公司 王經理 您好：\n\n敬請協助確認發票 INV-0731 之貨款 NT$ 120,000，付款期限已逾 30 天。\n若已安排付款，請忽略此信並惠予回覆付款日期。\n\n謝謝您的協助。\n財務部 敬上\n\n（教學範例：Claude 產出的初稿，寄出前仍須由你覆核）</div>`,
 gmail:()=>[['A 公司 王經理','NT$ 120,000','逾期 34 天'],['B 商行 陳小姐','NT$ 58,000','逾期 41 天'],['C 工作室 林先生','NT$ 23,500','逾期 33 天']].map(m=>`<div class="mail"><span class="tag ok">Gmail 草稿（未寄出）</span><b>【帳款提醒】致 ${m[0]}</b><span>${m[1]}・${m[2]}</span></div>`).join(''),
 dellist:()=>`<div class="md"># 待刪除清單（尚未刪除）\n\n共 47 個檔案，2019–2022 年的舊報表。\n你拒絕了刪除請求，所以所有檔案都還在原處。\n\n確認不需要後，請你自己備份，再決定是否刪除。</div>`,
 summary:()=>`<div class="md"># 摘要\n\n（教學模擬）Claude 已讀取你授權的資料夾並整理出重點。\n在真實 Cowork 中，這裡會是依你的指令產出的檔案內容。</div>`
};


/* ========== 名詞小辭典 / 配對遊戲 ========== */
const GLOSS=[
 {t:'Chat',s:'問答',d:'你問，它答。像到櫃台問業務。它不會去碰你電腦裡的檔案。',e:'例：「應付票據是什麼？」'},
 {t:'Cowork',s:'請它動手做',d:'你給一個資料夾和一件任務，它自己讀檔、整理、做出檔案。像把一疊單據交給新同事。',e:'例：把 200 張發票整理成 Excel'},
 {t:'Code',s:'寫程式',d:'給工程師用的，專門寫與改程式。像請 IT 蓋系統。會計同仁通常用不到。',e:'例：修改公司報表系統的程式'},
 {t:'Skill（技能）',s:'做事說明書',d:'把你的做法寫下來，Claude 需要時就照著做。像公司的作業手冊（SOP）。',e:'例：月結報表要用千分位、末列加總'},
 {t:'MCP（連接器）',s:'接外部工具的插頭',d:'讓 Claude 連到 Gmail、雲端硬碟這些外部工具。MCP 是這種「插頭」的通用規格名稱，畫面上通常叫「連接器」。',e:'例：連上 Gmail，讓它把催款信存成草稿'},
 {t:'Project（專案）',s:'專案資料夾',d:'把同一件事的說明和資料放在一起，之後在裡面做事都共用，不用每次重講。',e:'例：「2026 月結專案」放科目表與格式說明'},
 {t:'排程',s:'鬧鐘',d:'設定時間，時間到就自動執行同一件任務。電腦要開著、App 要在執行。',e:'例：每月 5 日 09:00 自動出月結報表'}
];
const MATCH={
 modes:{opts:['Chat','Cowork','Code'],items:[
  {id:'m-a',q:'想問：「應付帳款和應付票據差在哪？」',a:'Chat',why:'純問答，不需要動檔案，用 Chat。'},
  {id:'m-b',q:'資料夾裡有 200 張發票掃描檔，要整理成 Excel',a:'Cowork',why:'要讀很多檔案、做出新檔案，這是 Cowork 的工作。'},
  {id:'m-c',q:'工程師要修改公司報表系統的程式碼',a:'Code',why:'寫與改程式是 Code 的工作。'}]},
 ext:{opts:['Skill','MCP（連接器）','Project（專案）','排程'],items:[
  {id:'e-a',q:'每次都要用公司固定的月結報表格式',a:'Skill',why:'固定的做法寫成 Skill，Claude 每次都照著做。'},
  {id:'e-b',q:'想讓 Claude 直接去 Gmail 把催款信存成草稿',a:'MCP（連接器）',why:'要連到外部工具（Gmail），靠連接器（MCP）。'},
  {id:'e-c',q:'月結要用的科目表、說明、範本，想放一起、之後都能用',a:'Project（專案）',why:'同一件事的說明和資料放一起，就是專案。'},
  {id:'e-d',q:'每月 5 號早上 9 點自動產出報表',a:'排程',why:'固定時間自動做，用排程。'}]}
};

/* ========== 影片場景產生器 ========== */
const T=(k,h,s,chips)=>`<div class="vs vs-t"><div class="vnote2 vi" data-at="0.1">教學示範資料皆為虛構，數字僅供練習</div><div class="vpill vi" data-at="0.2">${k}</div><div class="vh vi" data-at="0.7">${h}</div><div class="vsub vi" data-at="1.5">${s}</div>${chips?`<div class="vchips">${chips.map((c,i)=>`${i?`<span class="vi" data-at="${(2+i*0.4).toFixed(1)}">→</span>`:''}<b class="vi" data-at="${(2.15+i*0.4).toFixed(1)}">${c}</b>`).join('')}</div>`:''}</div>`;
const COMPARE=cols=>`<div class="vs">${cols.map((c,i)=>`<div class="vcol vi ${c.cls||''}" data-at="${0.3+i*0.9}"><div class="vcic">${IC[c.ic]}</div><b>${c.h}</b>${c.lines.map((l,j)=>`<span class="vi" data-at="${0.8+i*0.9+j*0.45}">${l}</span>`).join('')}</div>`).join('')}</div>`;
const FLOW=(items,note)=>`<div class="vs">${items.map((x,i)=>(i?`<div class="varr vi" data-at="${0.15+i*0.8}">→</div>`:'')+`<div class="vbox vi" data-at="${0.4+i*0.8}">${IC[x.ic]}<b>${x.l}</b><small>${x.s||''}</small></div>`).join('')}${note?`<div class="vnote vi" data-at="${0.8+items.length*0.8}">${note}</div>`:''}</div>`;
const TYPE=(label,text,btn)=>`<div class="vs vs-y"><div class="vcomp vi" data-at="0.2"><div class="vlab">${label}</div><div class="vtxt" data-type="${esc(text)}" data-prog="0.9,${(text.length/13).toFixed(1)}"></div><div class="vbtn vi" data-at="${(1.3+text.length/13).toFixed(1)}">${btn||'送出'}</div></div></div>`;
const LIST=(title,items)=>`<div class="vs vs-r"><div class="vlt vi" data-at="0.2">${title}</div>${items.map((x,i)=>{const p=x.split('：'),at=0.9+i*1.5,end=i===items.length-1?999:at+1.5;return `<div class="vcard vi" data-at="${at}" data-win="${at},${end}"><span class="vn">${i+1}</span><span class="vct"><b>${p[0]}</b>${p[1]?`<small>${p[1]}</small>`:''}</span></div>`}).join('')}</div>`;
const FILES=(from,to,note)=>`<div class="vs vs-d"><div class="vfiles">${from.map((f,i)=>`<div class="vf vi" data-at="${0.3+i*0.3}">${IC.file}${f}</div>`).join('')}</div><div class="vproc"><div class="vbar"><i data-prog="${(0.6+from.length*0.3).toFixed(1)},2.4"></i></div><small class="vi" data-at="1">Claude 處理中…</small></div><div class="vout vi" data-at="${(0.6+from.length*0.3+2.4).toFixed(1)}">${IC.sheet}<b>${to}</b><small>${note||''}</small></div></div>`;

const VTAGS={1:['三種模式','Cowork 在做什麼','記住三句話'],2:['四個區塊','三個入口'],3:['選對資料夾','授權前三件事'],4:['看範例','四要素'],5:['三種擴充','Gmail 範例'],6:['排程','該不該允許','安全清單']};
const VIDEOS={
 1:[
  {dur:5,cap:'先搞懂：Claude 有三種用法——Chat 聊天、Cowork 幫你做事、Code 寫程式。',html:T('ACCT 內部教學 ・ 第 1 單元','Chat 回答你<br>Cowork 幫你「動手做」','先分清楚三個模式，就不會用錯地方',['Chat 問答','Cowork 動手做','Code 寫程式'])},
  {dur:9,cap:'Chat 負責問答；Cowork 像同事，能讀你授權的資料夾、產出檔案；Code 給工程師寫程式。',html:COMPARE([{ic:'chat',h:'Chat',lines:['問答、寫作','解釋會計準則','不碰你的檔案']},{ic:'layers',h:'Cowork',cls:'hot',lines:['讀你授權的資料夾','做完整件任務','產出 Excel、簡報']},{ic:'code',h:'Code',lines:['寫程式、改專案','給工程師用','今天先不用管']}])},
  {dur:9,cap:'例如把 12 張發票丟給 Cowork：它會讀檔、辨識、整理成 Excel，就像新來的助理。',html:FILES(['發票_001.pdf','發票_002.jpg','發票_003.pdf','發票_004.jpg'],'發票彙整.xlsx','自動整理完成')},
  {dur:7,cap:'記住：問問題用 Chat，交代任務用 Cowork。接著到右邊模擬器實際點點看。',html:LIST('記住這三句',['Chat：問問題','Cowork：交付任務，要給資料夾','Code：寫程式，給工程師'])}],
 2:[
  {dur:5,cap:'打開 Cowork，你會看到三個區塊：側邊欄、輸入框、進度面板。',html:T('ACCT 內部教學 ・ 第 3 單元','三個區塊，看懂就會用','像認識一間新辦公室的格局',['側邊欄','輸入框','資料夾','進度面板'])},
  {dur:9,cap:'從左到右：側邊欄找功能、輸入框下指令、選資料夾給資料、右側看進度。',html:FLOW([{ic:'book',l:'側邊欄',s:'新任務・排程・自訂'},{ic:'chat',l:'輸入框',s:'寫下要做什麼'},{ic:'folder',l:'資料夾',s:'給它資料'},{ic:'check',l:'進度面板',s:'看做到哪一步'}])},
  {dur:7,cap:'三個最常用的入口：新任務、排程、自訂。自訂裡有技能、連接器和外掛。',html:LIST('三個常用入口',['新任務：交辦一件事','排程：固定時間自動做','自訂：技能・連接器・外掛'])}],
 3:[
  {dur:5,cap:'Cowork 只能碰你「授權」的資料夾，這是最重要的安全觀念。',html:T('ACCT 內部教學 ・ 第 4 單元','只借一個抽屜，不給整間檔案室','授權資料夾 = 最小權限',['選資料夾','最小權限','先放副本'])},
  {dur:9,cap:'只授權任務需要的資料夾；整個「文件」資料夾可能混有薪資和身分證，風險大。',html:COMPARE([{ic:'folder',h:'發票_2026Q3',cls:'good',lines:['只含發票','範圍小','建議授權']},{ic:'lock',h:'整個「文件」',cls:'bad',lines:['含薪資、身分證','範圍太大','不要授權']}])},
  {dur:8,cap:'授權前三件事：選最小範圍、先複製副本、敏感資料不要放進去。',html:LIST('授權前三件事',['選最小範圍的資料夾','先複製一份副本當練習','敏感資料不要放進去'])}],
 4:[
  {dur:5,cap:'同樣的任務，指令寫得好不好，結果差很多。',html:T('ACCT 內部教學 ・ 第 5 單元','好指令 = 好結果','用「四要素」寫出可直接執行的任務',['寫指令','送出','核准','抽查'])},
  {dur:10,cap:'看這個例子：有目標、有資料來源、有輸出格式、也有限制。',html:TYPE('任務指令','請讀取「發票_2026Q3」，把每張發票的日期、廠商、統編、金額整理成 Excel，缺統編的標紅，不要修改原始檔案。','送出')},
  {dur:8,cap:'四要素：目標、資料、格式、限制。就像開傳票要填的四個欄位。',html:LIST('好指令四要素',['目標：要做什麼','資料：從哪裡讀','格式：輸出長怎樣','限制：哪些事不能做'])}],
 5:[
  {dur:5,cap:'Cowork 可以擴充：連接器、技能、外掛。',html:T('ACCT 內部教學 ・ 第 6 單元','讓 Claude 接上你的工具與做法','連接器・技能・外掛',['連接器','技能','外掛'])},
  {dur:9,cap:'連接器負責連外部服務；技能是你的標準作業程序；外掛是一整包角色套件。',html:COMPARE([{ic:'plug',h:'連接器',lines:['連 Gmail、雲端硬碟','像電子對帳介面']},{ic:'book',h:'Skill 技能',cls:'hot',lines:['你的 SOP','寫一次，每次照做']},{ic:'layers',h:'Plugin 外掛',lines:['財務會計套件','技能＋工具一次裝好']}])},
  {dur:7,cap:'例如連上 Gmail，Claude 就能幫你把催款信存成草稿，由你確認後再寄。',html:FLOW([{ic:'sheet',l:'逾期應收',s:'找出 3 家客戶'},{ic:'mail',l:'Gmail 草稿',s:'不會自動寄出'},{ic:'user',l:'你覆核',s:'確認後才寄'}])}],
 6:[
  {dur:5,cap:'最後一課：讓 Claude 定時工作，並且守住安全底線。',html:T('ACCT 內部教學 ・ 第 7 單元','自動化，但責任仍在你','排程與安全檢查',['排程','拒絕','覆核'])},
  {dur:8,cap:'排程可以固定時間自動執行，例如每月 5 號產出月結報表，再由你覆核。',html:FLOW([{ic:'clock',l:'每月 5 號 09:00',s:'排程觸發'},{ic:'spark',l:'Claude 自動執行',s:'讀資料、出報表'},{ic:'user',l:'你覆核',s:'簽核後使用'}])},
  {dur:9,cap:'遇到刪除或覆蓋檔案的請求，沒有備份就拒絕；內容單純又有備份，才允許。',html:COMPARE([{ic:'check',h:'可以允許',cls:'good',lines:['有備份','範圍清楚','影響可還原']},{ic:'warn',h:'應該拒絕',cls:'bad',lines:['要永久刪除','沒有備份','範圍看不懂']}])},
  {dur:9,cap:'安全清單：看清楚再允許、抽查數字、敏感資料不授權，排程需電腦開著。',html:LIST('安全檢查清單',['刪除與覆蓋，看清楚再按','輸出結果要抽查數字','敏感資料不授權','排程時電腦與 App 要開著'])}]
};

/* ========== 單元定義 ========== */
const has=e=>LOG.has(e);
const U=(id,text,hint,sel,check)=>({id,text,hint,sel,check});
const UNITS=[
 {id:1,tips:['播放後可開字幕與旁白；拖曳時間軸能跳到任何一段。','點卡片翻面，背面是生活比喻。','先玩配對遊戲，再到模擬器上方點三個分頁；不怕按錯，這是練習環境。','答錯可以重答，解析會告訴你為什麼。'],short:'認識 Cowork',title:'Cowork 是什麼？和 Chat 差在哪？',goal:'分清楚 Chat、Cowork、Code，知道什麼任務該交給誰。',
  cards:[{f:'Chat',s:'問答',b:'像到櫃台問業務：你問，它答。不會碰你電腦裡的檔案。例：「應付票據是什麼？」'},{f:'Cowork',s:'請它動手做',b:'像把一疊單據交給新同事：你給「資料夾」和任務，他自己讀、整理、做出檔案。例：整理 200 張發票。'},{f:'Code',s:'寫程式',b:'像請 IT 工程師蓋系統：專門寫與改程式。會計同仁通常用不到，知道有這個就好。'}],
  match:'modes',
  steps:[
   U('1-1','看完動畫（拖曳時間軸到最後也算）','按動畫中央的「播放動畫」','.vplay',()=>has('video_done:1')),
   U('1-2','在模擬器點上方的「Chat」分頁看看','模擬器最上方的三個分頁','[data-act="mode"][data-m="chat"]',()=>has('mode_chat')),
   U('1-3','再點「Code」分頁','同一排的最右邊','[data-act="mode"][data-m="code"]',()=>has('mode_code')),
   U('1-4','回到「Cowork」分頁（今天的主角）','點中間的 Cowork','[data-act="mode"][data-m="cowork"]',()=>has('mode_chat')&&has('mode_code')&&S.mode==='cowork'),
   U('1-5','完成「三種模式」配對小遊戲（3 題）','在上方的配對遊戲，替每個情境選一個名詞','#match',()=>MATCH.modes.items.every(x=>has('match_ok:'+x.id)))],
  quiz:[
   {q:'「把 200 張發票整理成 Excel」最適合用哪個模式？',o:['Chat','Cowork','Code'],a:1,why:'需要讀檔、處理多個檔案並產出 Excel，這是 Cowork 的強項。'},
   {q:'「請用白話解釋收入認列五步驟」最適合用哪個模式？',o:['Cowork','Code','Chat'],a:2,why:'純問答不需要碰檔案，用 Chat 最快。'},
   {q:'Cowork 和 Chat 最大的差別是？',o:['Cowork 能在你授權的資料夾內讀寫檔案、完成多步驟任務','Cowork 回答比較長','Cowork 不需要網路'],a:0,why:'關鍵是「能動手做」：在你授權的範圍內讀、寫、整理檔案。'},
   {q:'Chat、Cowork、Code，一句話怎麼分？',o:['問答／動手做／寫程式','免費／付費／企業','手機／平板／電腦'],a:0,why:'Chat 是問答，Cowork 是請它動手做，Code 是寫程式。'},
   {q:'主管要你把 12 個月的對帳單合併成一個 Excel，用哪個最合適？',o:['Chat','Code','Cowork'],a:2,why:'要讀很多檔案、做出新檔案，用 Cowork。'}]},
 {id:7,tips:['這一課只講四個名詞，每個都有生活比喻。','翻開卡片，先看一句話，再看比喻。','先玩配對，再到模擬器找「排程」「自訂」「專案」在哪。','四個名詞各有場景題，答錯可再試。'],short:'四個名詞',title:'Skill、MCP、專案、排程：四個名詞一次講白',goal:'用生活比喻，分清楚 Skill、MCP（連接器）、Project（專案）、排程各是什麼。',match:'ext',
  cards:[{f:'Skill（技能）',s:'做事說明書',b:'像公司作業手冊（SOP）：把做法寫一次，之後每次照著做。例：月結報表格式。'},{f:'MCP（連接器）',s:'接外部工具的插頭',b:'像電子對帳介面：讓 Claude 連到 Gmail、雲端硬碟。MCP 是插頭規格的名字，畫面上多半叫「連接器」。'},{f:'Project（專案）',s:'專案資料夾',b:'像一個專案檔案夾：同一件事的說明和資料放一起，之後做事都共用，不用重講。'},{f:'排程',s:'鬧鐘',b:'像月結行事曆：設好時間，到點自動做同一件事。電腦與 App 要開著。'}],
  steps:[
   U('7-1','看完動畫','按動畫中央的「播放動畫」','.vplay',()=>has('video_done:7')),
   U('7-2','完成「四個名詞」配對遊戲（4 題）','替每個情境選一個名詞','#match',()=>MATCH.ext.items.every(x=>has('match_ok:'+x.id))),
   U('7-3','在模擬器依序點側邊欄的「專案」、「排程」、「自訂」','三個項目各點一次，看看裡面有什麼','[data-act="nav"][data-v="projects"]',()=>has('nav_projects')&&has('nav_scheduled')&&has('nav_customize'))],
  quiz:[
   {q:'「Skill」最像下面哪一樣？',o:['公司作業手冊（SOP）','一台新電腦','一封電子郵件'],a:0,why:'Skill 是寫給 Claude 的做事說明書，寫一次、每次照做。'},
   {q:'MCP（連接器）是做什麼用的？',o:['讓 Claude 回答得更快','讓 Claude 連到 Gmail、雲端硬碟等外部工具','幫檔案備份'],a:1,why:'它像插頭，把 Claude 接到外部工具。'},
   {q:'Project（專案）幫你省下什麼麻煩？',o:['不用再開電腦','不用付錢','同一件事的說明和資料放一起，不用每次重講'],a:2,why:'專案把說明與資料集中，之後做事都共用。'},
   {q:'設定「每月 5 號自動出報表」，要記得什麼？',o:['不用管，一定會跑','電腦要開著、App 要在執行（以你的版本說明為準）','要先關掉網路'],a:1,why:'排程在你的電腦上執行，電腦沒開就不會跑。'},
   {q:'想讓 Claude 直接把催款信存進 Gmail 草稿匣，要先做什麼？',o:['建立排程','連接 Gmail（連接器）','建立 Skill'],a:1,why:'要連外部工具，先連接器。'}]},
 {id:2,tips:['看完動畫再動手，會更快找到位置。','點卡片翻面看比喻。','側邊欄每個項目都點點看，不會弄壞任何東西。','兩題就好，輕鬆過關。'],short:'介面導覽',title:'介面導覽：三個區塊看懂 Cowork',goal:'找到新任務、排程、自訂與資料夾選擇的位置。',
  cards:[{f:'側邊欄',s:'功能入口',b:'像檔案櫃目錄：新任務、專案、排程、自訂都從這裡進出。'},{f:'輸入框＋資料夾',s:'下指令',b:'像請款單：寫清楚要做什麼（輸入框）、資料放哪（資料夾）。'},{f:'進度面板',s:'任務畫面右側',b:'像專案進度表：一眼看到做到第幾步、產出了什麼檔案。'}],
  steps:[
   U('2-1','看完動畫','按動畫中央的「播放動畫」','.vplay',()=>has('video_done:2')),
   U('2-2','點側邊欄的「新任務」','左上角橘色按鈕','.sb-new',()=>has('nav_new')),
   U('2-3','點側邊欄的「排程」','側邊欄第二個','[data-act="nav"][data-v="scheduled"]',()=>has('nav_scheduled')),
   U('2-4','點側邊欄的「自訂」','側邊欄第三個','[data-act="nav"][data-v="customize"]',()=>has('nav_customize')),
   U('2-5','回到新任務，點輸入框下方的資料夾按鈕','先回「新任務」，再點「選擇資料夾」','[data-act="folder-open"]',()=>has('folder_chip'))],
  quiz:[
   {q:'想知道 Claude 做到第幾步，要看哪裡？',o:['側邊欄','任務畫面右側的進度面板','Chat 分頁'],a:1,why:'進度面板會列出每個步驟的狀態與產出的檔案。'},
   {q:'想讓 Claude 每個月自動產生報表，要去哪裡設定？',o:['排程','資料夾','Code 分頁'],a:0,why:'排程可以指定頻率與時間，讓任務定時執行。'}]},
 {id:3,tips:['重點只有一個：只給需要的，其他不給。','「最小權限」是會計內控的老朋友。','先看「個人文件」裡有什麼，再決定授權哪個。','三題，全是授權資料夾的實戰判斷。'],short:'授權資料夾',title:'授權資料夾：只給需要的，其他不給',goal:'學會最小權限：選對資料夾，避開敏感資料。',
  cards:[{f:'授權資料夾',s:'資料來源',b:'像只借出一個抽屜的鑰匙，而不是整間檔案室。'},{f:'最小權限',s:'內控觀念',b:'只給完成工作所需的最少權限，就是內控的職務分工精神。'},{f:'先複製副本',s:'安全做法',b:'會計師查帳也先影印底稿，不直接動原始憑證。'}],
  steps:[
   U('3-1','看完動畫','按動畫中央的「播放動畫」','.vplay',()=>has('video_done:3')),
   U('3-2','打開資料夾選擇視窗','回到「新任務」，點「選擇資料夾」','[data-act="folder-open"]',()=>has('folder_picker_open')),
   U('3-3','點一下「個人文件」預覽內容，看看裡面有什麼','先看，不要按授權','[data-act="peek"][data-id="personal"]',()=>has('folder_peek:personal')),
   U('3-4','改為授權「發票_2026Q3」','點該資料夾，再按「授權此資料夾」','[data-act="peek"][data-id="invoices"]',()=>S.folder==='invoices')],
  quiz:[
   {q:'要整理 7～9 月的發票，應該授權哪個資料夾？',o:['整個「文件」資料夾','桌面','發票_2026Q3'],a:2,why:'只給任務需要的最小範圍，其他檔案就不會被讀到或改到。'},
   {q:'第一次使用，最安全的做法是？',o:['直接用正式資料夾','複製一份副本當練習資料夾','全部授權比較省事'],a:1,why:'Cowork 可能改檔名或寫入新檔。用副本，出錯也不影響原始憑證。'},
   {q:'資料夾裡混有薪資單，但任務只是整理發票，怎麼辦？',o:['移出敏感檔案，或改授權較小的資料夾','沒關係，Claude 不會看','全部壓縮成 zip 再授權'],a:0,why:'敏感資料與任務無關，就不該放進授權範圍。'}]},
 {id:4,tips:['先看範例指令長什麼樣子。','四要素缺一，結果就會亂猜。','產出後請自己開檔檢查一次，這是你的工作，不是 Cowork 的。','權限請求是你的覆核關卡，不是裝飾。'],prompts:[{t:'交給 Cowork 的指示',text:SUGG[0].p}],sample:{t:'原始資料（練習用）',rows:['2026-07-03、大同文具、12345678、1,250','2026-07-05、台灣大哥大、（缺統編）、1,099','2026-07-09、全聯福利中心、23456789、3,480']},short:'好指令',title:'下第一個任務：好指令四要素',goal:'用「目標、資料、格式、限制」下指令，並看懂權限請求。',builder:true,
  cards:[{f:'四要素',s:'目標資料格式限制',b:'像開傳票要填的四個欄位，缺一不可。'},{f:'權限請求',s:'要你點頭',b:'像覆核流程：重要動作要主管（你）簽核才放行。'},{f:'抽查結果',s:'人工覆核',b:'像審計抽樣：不用全看，但一定要看。'}],
  steps:[
   U('4-1','看完動畫','按動畫中央的「播放動畫」','.vplay',()=>has('video_done:4')),
   U('4-2','用下方「指令組裝器」產生指令並送到輸入框','按「送到 Cowork 輸入框」','#pb-send',()=>has('prompt_built')),
   U('4-3','確認已授權「發票_2026Q3」資料夾','不是這個資料夾的話，請重新選','[data-act="folder-open"]',()=>S.folder==='invoices'),
   U('4-4','在模擬器按送出（箭頭按鈕）','輸入框右下角','.send',()=>has('task_started:invoices')||has('task_started:bank')),
   U('4-5','回應權限請求：看清楚後按「允許」或「拒絕」','出現黃色權限卡時回應','.perm',()=>has('perm_allowed:rename')||has('perm_denied:rename')),
   U('4-6','等任務完成後，點開產出的 Excel 檢查','點對話中的檔案按鈕','.fchip',()=>has('file_open:xlsx'))],
  quiz:[
   {q:'哪一個指令比較好？',o:['幫我處理一下發票','請把「發票_2026Q3」每張發票的日期、廠商、統編、金額整理成 Excel，缺統編標紅，不要改原始檔','整理檔案'],a:1,why:'有資料來源、輸出格式與限制，Claude 不用猜。'},
   {q:'「請整理這些發票」少了哪些要素？',o:['都有了','只缺目標','輸出格式與限制'],a:2,why:'沒說輸出長怎樣，也沒說哪些事不能做（例如不要改原檔）。'},
   {q:'Claude 要求「重新命名 12 個檔案」，你該怎麼做？',o:['看清楚範圍與影響，確認有備份再允許','不看直接允許','一律拒絕'],a:0,why:'權限請求是你的覆核關卡：看範圍、看影響、確認備份。'}]},
 {id:5,tips:['連接器、技能、外掛，三種擴充各管一件事。','連接器像電子對帳介面；技能像 SOP。','連接器只連需要的；草稿請自己確認再寄。','三題，分清楚三種擴充。'],prompts:[{t:'交給 Cowork 的指示（先連接 Gmail）',text:SUGG[2].p}],short:'擴充能力',title:'連接器、技能、外掛：讓 Claude 更懂你的工作',goal:'連上 Gmail、安裝財務外掛、建立自己的 Skill。',
  cards:[{f:'連接器',s:'接外部服務',b:'像銀行的電子對帳介面：讓 Claude 連到 Gmail、雲端硬碟。'},{f:'Skill',s:'你的 SOP',b:'像公司作業手冊：寫一次，每次都照做。'},{f:'Plugin',s:'整包套件',b:'像會計部「新人套組」：SOP、工具、範本一次裝好。'}],
  steps:[
   U('5-1','看完動畫','按動畫中央的「播放動畫」','.vplay',()=>has('video_done:5')),
   U('5-2','到「自訂 → 連接器」，連接 Gmail','先點側邊欄「自訂」','[data-act="nav"][data-v="customize"]',()=>has('connector_on:gmail')),
   U('5-3','到「外掛」分頁，安裝「財務會計」外掛','自訂頁面上方的分頁','[data-act="ctab"][data-t="plugins"]',()=>has('plugin_on:finance')),
   U('5-4','在「技能」分頁建立一個 Skill，例如「月結報表格式」','按「建立 Skill」','[data-act="ctab"][data-t="skills"]',()=>has('skill_created')),
   U('5-5','回新任務，點「寫催款信草稿」卡片並送出，讓 Claude 在 Gmail 建草稿','Gmail 要先連接','.sg',()=>has('task_done:dunning_gmail'))],
  quiz:[
   {q:'連接器的用途是？',o:['讓 Claude 連到 Gmail、雲端硬碟等外部服務','加快 Claude 的速度','讓檔案自動備份'],a:0,why:'連接器就是 Claude 與外部工具之間的橋。'},
   {q:'想讓 Claude 每次都用公司的月結報表格式，應該？',o:['每次都重新貼格式','建立 Skill','換一個資料夾'],a:1,why:'Skill 是可重複使用的作業說明，寫一次就能一直用。'},
   {q:'「財務會計外掛」比較像什麼？',o:['一個資料夾','一包整合技能與工具的套件','一種檔案格式'],a:1,why:'外掛把技能、連接器、常用指令打包，方便一次安裝。'}]},
 {id:6,tips:['最後一課：自動化很方便，責任仍在你。','拒絕是你的權力；人工覆核不可省。','遇到「刪除」先停一下：有備份嗎？範圍看得懂嗎？','最後測驗，完成就能領結業證書。'],prompts:[{t:'危險演練：先授權「舊檔案_2023前」，再交辦這句',text:SUGG[3].p,danger:true}],short:'排程與安全',title:'排程與安全：自動化，但責任仍在你',goal:'設定排程、練習拒絕危險請求、建立覆核習慣。',cert:true,
  cards:[{f:'排程',s:'定時任務',b:'像月結行事曆：時間到就自動提醒並執行。'},{f:'拒絕',s:'覆核權',b:'覆核有權退件：不確定就先不放行。'},{f:'人工覆核',s:'責任在人',b:'AI 做初稿，簽核的人是你，責任也在你。'}],
  steps:[
   U('6-1','看完動畫','按動畫中央的「播放動畫」','.vplay',()=>has('video_done:6')),
   U('6-2','到「排程」建立一個「每月 5 日 09:00 產出月結報表」','側邊欄「排程」→「新增排程」','[data-act="nav"][data-v="scheduled"]',()=>has('schedule_created')),
   U('6-3','危險演練：授權「舊檔案_2023前」，送出「清理舊檔案」，並按「拒絕」','點「清理舊檔案」卡片，記得先選資料夾','.sg.dg',()=>has('perm_denied:delete'))],
  quiz:[
   {q:'Claude 要求永久刪除 47 個檔案，而你沒有備份。該怎麼辦？',o:['允許，Claude 不會出錯','拒絕，先備份再決定','關掉視窗當作沒看到'],a:1,why:'刪除無法復原。沒備份就拒絕，先確認清單與備份。'},
   {q:'排程任務什麼時候能執行？',o:['電腦關機也可以','只有週一','電腦開著且 App 在執行中'],a:2,why:'排程在你的電腦上執行，所以電腦要開著、App 要在執行（以你的版本說明為準）。'},
   {q:'Claude 產出對帳表後，下一步最合理的是？',o:['抽查數字並對照原始單據','直接送給主管','刪掉原始檔'],a:0,why:'AI 的產出是初稿。抽樣核對原始憑證，才是專業會計的做法。'},
   {q:'哪種資料夾最不該直接授權？',o:['發票_2026Q3','含薪資與身分證的個人文件','銀行對帳單副本'],a:1,why:'個資與薪資與任務無關，授權就是增加外洩風險。'}]}
];


VIDEOS[7]=[
 {dur:6,cap:'這一課只講四個詞：Skill、MCP、Project、排程。每個都用生活比喻。',html:T('ACCT 內部教學 ・ 第 2 單元','四個名詞<br>一次講白','把 Claude 想成一位「聰明的新員工」',['Skill','MCP 連接器','Project 專案','排程'])},
 {dur:10,cap:'Skill 像作業手冊，寫一次就照做；MCP 像插頭，讓 Claude 連到 Gmail 這類外部工具。',html:COMPARE([{ic:'book',h:'Skill 技能',cls:'hot',lines:['做事說明書（SOP）','寫一次，每次照做','例：月結報表格式']},{ic:'plug',h:'MCP 連接器',lines:['接外部工具的插頭','連 Gmail、雲端硬碟','草稿由你確認再寄']}])},
 {dur:10,cap:'Project 像專案檔案夾，說明和資料放一起；排程像鬧鐘，時間到就自動做。',html:COMPARE([{ic:'folder',h:'Project 專案',cls:'hot',lines:['專案資料夾','說明與資料放一起','之後不用重講']},{ic:'clock',h:'排程',lines:['鬧鐘','時間到自動執行','電腦要開著']}])},
 {dur:10,cap:'記住：Skill 教做法、MCP 接工具、專案放一起、排程定時做。',html:LIST('記住四句話',['Skill：教它怎麼做','MCP：接上外部工具','專案：說明與資料放一起','排程：時間到自動做'])}
];
VTAGS[7]=['Skill 與 MCP','專案與排程','記住四句話'];
Object.keys(VIDEOS).forEach(u=>VIDEOS[u].forEach((s,i)=>{if(i>0)s.tag='②③④⑤'[i-1]+' '+VTAGS[u][i-1]}));
