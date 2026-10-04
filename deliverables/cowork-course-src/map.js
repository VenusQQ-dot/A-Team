/* ========== 像素圖示（10x10 點陣） ========== */
const PXD={
 spark:['....##....','....##....','.#..##..#.','..######..','#########.','..######..','.#..##..#.','....##....','....##....'],
 cloud:['..........','...###....','..#...#...','.#.....##.','#........#','#........#','#........#','.########.'],
 terminal:['.########.','.#......#.','.#.#....#.','.#..#...#.','.#.#....#.','.#......#.','.########.'],
 shield:['.########.','.#......#.','.#......#.','.#......#.','..#....#..','..#....#..','...#..#...','....##....'],
 plug:['..#....#..','..#....#..','.########.','.#......#.','.#......#.','..#....#..','...#..#...','....##....','....##....'],
 book:['.#######..','.#.....#..','.#.###.#..','.#.....#..','.#.###.#..','.#.....#..','.#######..','.#######..'],
 mail:['..........','.########.','.##....##.','.#.#..#.#.','.#..##..#.','.#......#.','.#......#.','.########.'],
 clock:['...####...','..#....#..','.#..#...#.','.#..#...#.','.#..###.#.','.#......#.','..#....#..','...####...'],
 user:['...####...','..#....#..','..#....#..','...####...','..........','.########.','.#......#.','.#......#.'],
 sheet:['.########.','.#..#...#.','.########.','.#..#...#.','.########.','.#..#...#.','.########.'],
 trash:['..######..','.########.','..........','..#.#.#...','..#.#.#...','..#.#.#...','..#.#.#...','..#####...'],
 eye:['..........','...####...','.##....##.','#..####..#','#..####..#','.##....##.','...####...'],
 star:['....##....','....##....','.########.','..######..','...####...','...#..#...','..##..##..'],
 chat:['.########.','.#......#.','.#.####.#.','.#......#.','.########.','..##......','..#.......'],
 lock:['...####...','..#....#..','..#....#..','.########.','.#......#.','.#..##..#.','.#......#.','.########.'],
 bulb:['...####...','..#....#..','.#......#.','.#......#.','..#....#..','...####...','...####...','....##....'],
 route:['#.........','#.####....','#.#..#....','..#..#.##.','..#..#.#.#','..####.#.#','.......##.'],
 people:['.##...##..','#..#.#..#.','.##...##..','..........','.########.','.#..#...#.','.#..#...#.','.########.'],
 box:['.########.','.#......#.','.########.','.#......#.','.#.####.#.','.#......#.','.########.'],
 file:['.######...','.#....#..','.#.....#.','.#.....#.','.#.....#.','.#.....#.','.########.'],
 list:['.#.#####..','..........','.#.#####..','..........','.#.#####..','..........','.#.#####..'],
 folder:['.####.....','#....#####','#........#','#........#','#........#','#........#','.########.'],
 warn:['....##....','...#..#...','..#.##.#..','..#.##.#..','.#..##..#.','.#......#.','.#..##..#.','.########.']
};
function pix(n,col,sz){const g=PXD[n]||PXD.spark;let r='';g.forEach((row,y)=>{row=row.padEnd(10,'.');for(let x=0;x<10;x++)if(row[x]==='#')r+=`<rect x="${x}" y="${y}" width="1" height="1"/>`});
 return `<svg class="px" viewBox="0 0 10 10" width="${sz||26}" height="${sz||26}" fill="${col||'currentColor'}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`}

/* ========== 心智圖內容 ========== */
const COL=['#6A4FBF','#3E7C59','#A0522D','#3B5FA8','#8A6D1E','#A33B5E','#3A7F8C'];
const NODES={};
const MAPS=[
 {id:'parts',tab:'零件',root:{id:'root1',t:'Cowork 運作架構',d:'你的電腦＋一個授權資料夾＋一位 AI 助理',ic:'spark',box:'這一枝看零件：整套東西由哪些部分組成',kids:[
  {id:'model',t:'模型（Claude）',ic:'cloud',d:'在雲端思考的大腦。只會讀一段字、回一段字，本身碰不到你的檔案。',box:'我是大腦：只會讀字、回字；動手要靠下面那些零件',kids:[
   {t:'它擅長',ic:'star',d:'讀懂文件、整理資料、寫作、推理'},
   {t:'它自己做不到',ic:'lock',d:'自己翻你的硬碟、自己寄信',red:'所有「動手」都要經過 App 與你的授權'}]},
  {id:'app',t:'Cowork App',ic:'terminal',d:'裝在你電腦上的程式。模型說「我要讀這個檔」，是 App 真的去讀、去寫。',box:'我是大腦的手腳：大腦說要讀檔，是我真的去做',kids:[
   {id:'input',t:'輸入框',ic:'chat',d:'交辦任務的地方。左下角可切 Chat／Cowork，右下角選模型與強度',go:{u:4}},
   {id:'progress',t:'進度面板',ic:'list',d:'任務畫面右側：每一步的狀態與新產生的檔案',go:{u:2}},
   {id:'sidebar',t:'側邊欄',ic:'book',d:'新任務、排程、自訂都從這裡進出',go:{u:2}}]},
  {id:'folder',t:'授權資料夾',ic:'folder',d:'你指定的資料夾，是 Claude 唯一能讀寫的檔案範圍。',box:'像只借出一個抽屜的鑰匙，不是整間檔案室',go:{u:3},kids:[
   {t:'最小權限',ic:'shield',d:'只給任務需要的資料夾',box:'內控的精神：夠用就好'},
   {t:'先放副本',ic:'sheet',d:'第一次用，先複製一份練習資料夾',box:'會計師查帳也先影印底稿'},
   {t:'敏感資料別放',ic:'lock',d:'薪資、身分證、存摺與任務無關',red:'放進去，就等於交出去'}]},
  {id:'conn',t:'連接器（MCP）',ic:'plug',d:'讓 Claude 連到 Gmail、雲端硬碟等外部服務。MCP 是這種「插頭」的通用規格名稱。',box:'像銀行的電子對帳介面',go:{u:5},more:'連接時會出現授權畫面，列出 Claude 能做的事。實際權限範圍以該畫面為準。',kids:[
   {id:'gmail',t:'Gmail',ic:'mail',d:'讀取郵件、建立草稿',red:'草稿不等於寄出，請自己確認再寄'},
   {id:'drive',t:'Google Drive',ic:'folder',d:'搜尋與讀取雲端檔案'},
   {id:'cal',t:'Google Calendar',ic:'clock',d:'查看行程、安排會議'}]},
  {id:'skill',t:'技能 Skill',ic:'book',d:'把你的做法寫成說明書，Claude 每次都照做。',box:'像公司作業手冊：寫一次，每次照做',go:{u:5},kids:[
   {t:'例：月結報表格式',ic:'sheet',d:'千分位、科目排序、末列加總'},
   {t:'例：發票命名規則',ic:'file',d:'日期_廠商_金額'}]},
  {id:'project',t:'專案 Project',ic:'layers_',d:'把同一件事的說明和資料放在一起，之後做事都共用。',box:'像一個專案檔案夾：不用每次重講',go:{u:7},kids:[
   {t:'放什麼',ic:'file',d:'專案說明、常用資料、格式要求'},
   {t:'好處',ic:'star',d:'同一件事反覆做，不用重新交代'}]},
  {id:'plug',t:'外掛 Plugin',ic:'box',d:'把技能、連接器、子代理打包成一整套。',box:'像會計部的「新人套組」',go:{u:5},kids:[
   {t:'財務會計（示意）',ic:'sheet',d:'月結檢查、銀行對帳、差異分析'},
   {t:'依職務挑選',ic:'user',d:'法務、業務…各有各的套件'}]},
  {id:'you',t:'你（覆核者）',ic:'user',d:'重要動作要你點頭；產出要你抽查。',box:'AI 做初稿，簽核的是你',red:'沒覆核就直接使用，是最常出事的地方',go:{u:6},kids:[
   {id:'permn',t:'權限請求',ic:'shield',d:'改檔名、覆蓋、刪除前會問你',go:{u:4}},
   {id:'check',t:'抽查結果',ic:'eye',d:'對照原始單據抽樣核對'}]}]}},
 {id:'flow',tab:'任務怎麼走',root:{id:'root2',t:'一個任務怎麼走',d:'例：把 12 張發票整理成 Excel',ic:'route',box:'這一枝看一個任務從下指令到交件，中間經過誰',kids:[
  {id:'s1',num:1,t:'你下指令',ic:'chat',d:'寫清楚：目標、資料、格式、限制',box:'像開傳票：四個欄位缺一不可',red:'指令太模糊，Claude 只能用猜的',go:{u:4}},
  {id:'s2',num:2,t:'選資料夾',ic:'folder',d:'授權這次任務要用的資料夾',red:'範圍太大，把無關的敏感檔案一起交出去',go:{u:3}},
  {id:'s3',num:3,t:'Claude 擬計畫',ic:'list',d:'先拆成步驟，右側進度面板逐項列出',box:'像專案進度表：先排步驟再動工'},
  {id:'s4',num:4,t:'逐步執行',ic:'terminal',d:'讀檔、辨識、寫入新檔；每一步的狀態都看得到'},
  {id:'perm',num:5,t:'權限請求',ic:'shield',d:'改檔名、覆蓋、刪除前，會停下來問你',box:'像覆核流程：重要動作要你簽核',red:'沒看清楚就按「允許」',go:{u:4},kids:[
   {t:'可以允許',ic:'star',d:'有備份、範圍清楚、影響可還原'},
   {t:'應該拒絕',ic:'trash',d:'要永久刪除、沒有備份、看不懂範圍',red:'不確定就先拒絕，再問清楚'}]},
  {id:'s6',num:6,t:'產出檔案',ic:'sheet',d:'結果放在授權資料夾，例如 發票彙整_2026Q3.xlsx'},
  {id:'s7',num:7,t:'你覆核',ic:'eye',d:'抽查數字、對照原始單據，再正式使用',box:'像審計抽樣：不用全看，但一定要看',red:'把 AI 初稿當成定稿',go:{u:4}}]}},
 {id:'safe',tab:'安全',root:{id:'root3',t:'守住安全底線',d:'自動化，但責任仍在你',ic:'shield',box:'這一枝看每個階段該檢查什麼',go:{u:6},kids:[
  {t:'授權前',ic:'folder',d:'決定 Claude 看得到什麼',kids:[
   {t:'選最小範圍',ic:'shield',d:'只授權任務需要的資料夾'},
   {t:'先複製副本',ic:'sheet',d:'用練習資料夾，出錯不傷原件'},
   {t:'移出敏感檔案',ic:'lock',d:'薪資、身分證、存摺',red:'與任務無關的資料，不該在範圍內'}]},
  {t:'執行中',ic:'terminal',d:'Claude 動手的當下',kids:[
   {t:'看清楚權限請求',ic:'shield',d:'範圍？影響？可還原嗎？',box:'三個問題都答得出來再按允許'},
   {t:'權限模式',ic:'shield',d:'手動核准：每步問你；自動：先做安全檢查再批准；全部略過：不問（最危險）',box:'新手先用「手動核准」',red:'永久刪除檔案，不管哪種模式都會問你'},
   {t:'刪除與覆蓋先拒絕',ic:'trash',d:'沒有備份就不要放行',red:'永久刪除無法復原'}]},
  {t:'完成後',ic:'eye',d:'成果交付前的把關',kids:[
   {t:'抽查數字',ic:'sheet',d:'隨機挑幾列重算'},
   {t:'對照原始單據',ic:'file',d:'金額、日期、統編逐項核'},
   {t:'留存紀錄',ic:'book',d:'誰下的指令、何時、產出什麼',box:'可稽核：事後找得到來龍去脈'}]},
  {t:'排程任務',ic:'clock',d:'讓 Claude 定時自動工作',kids:[
   {t:'要用本機檔案時',ic:'monitor_',d:'電腦與 App 要開著（只用連接器的排程多半在雲端跑）',red:'沒開的話，任務可能延後或略過'},
   {t:'指令要寫清楚',ic:'chat',d:'每次排程都是全新對話',red:'「跟上次一樣」沒有用'},
   {t:'排程也要覆核',ic:'eye',d:'自動產出的報表，一樣要抽查'}]},
  {t:'連接器',ic:'plug',d:'連到外部服務時',kids:[
   {t:'只連需要的服務',ic:'plug',d:'用不到的就不要連'},
   {t:'草稿不等於寄出',ic:'mail',d:'寄信前請自己再讀一次',red:'金額、對象、語氣都要確認'}]}]}},
 {id:'ext',tab:'擴充',root:{id:'root4',t:'怎麼讓 Claude 更懂你的工作',d:'連接器、技能、外掛三種擴充',ic:'plug',box:'這一枝看三種擴充怎麼分、怎麼選',go:{u:5},kids:[
  {t:'連接器（MCP）',ic:'plug',d:'連到外部服務',kids:[
   {t:'像什麼',ic:'star',d:'銀行的電子對帳介面'},
   {t:'什麼時候用',ic:'bulb',d:'資料在 Gmail、雲端硬碟裡'},
   {t:'注意',ic:'warn',d:'只連需要的服務',red:'授權畫面列的權限要看清楚'}]},
  {t:'技能 Skill',ic:'book',d:'把做法寫成說明書',kids:[
   {t:'像什麼',ic:'star',d:'公司作業手冊（SOP）'},
   {t:'什麼時候用',ic:'bulb',d:'同一套做法，每次都要照做'},
   {t:'例子',ic:'sheet',d:'月結報表格式、發票命名規則'}]},
  {t:'外掛 Plugin',ic:'box',d:'整包角色套件',kids:[
   {t:'像什麼',ic:'star',d:'會計部的新人套組'},
   {t:'什麼時候用',ic:'bulb',d:'想一次裝好整套工具與做法'},
   {t:'注意',ic:'warn',d:'內容以你實際版本為準'}]},
  {t:'專案 Project',ic:'layers_',d:'把說明與資料放一起',kids:[
   {t:'像什麼',ic:'star',d:'專案檔案夾'},
   {t:'什麼時候用',ic:'bulb',d:'同一件事反覆做、規則都一樣'},
   {t:'好處',ic:'box',d:'之後做事都共用，不用重講'}]},
  {t:'怎麼選？',ic:'bulb',d:'三句話決定',box:'先問：我缺的是「連線」、「做法」還是「整套」？',kids:[
   {t:'缺連線 → 連接器',ic:'plug',d:'資料在外部服務'},
   {t:'缺做法 → 技能',ic:'book',d:'每次都要照同樣規則'},
   {t:'缺整套 → 外掛',ic:'box',d:'一次裝好，省得一個個設'}]}]}},
 {id:'cases',tab:'五個例子',root:{id:'root5',t:'五個例子：誰做、存哪裡',d:'會計日常各一條真實路徑',ic:'star',box:'這一枝看真實例子：每件事誰做、資料存哪裡',kids:[
  {t:'發票整理',ic:'sheet',d:'整理 12 張發票',go:{u:4},kids:[
   {t:'路徑',ic:'route',d:'丟進資料夾 → 下指令 → 允許改檔名 → 抽查 Excel'},
   {t:'分工',ic:'people',d:'Claude：辨識、命名、建表。你：補缺統編、抽查'},
   {t:'存哪裡',ic:'box',d:'原檔留在「發票_2026Q3」；新增「發票彙整」與「異常清單」'}]},
  {t:'銀行對帳',ic:'layers_',d:'對帳單比帳上明細',kids:[
   {t:'路徑',ic:'route',d:'對帳單＋帳上明細 → 比對 → 找出未達帳'},
   {t:'分工',ic:'people',d:'Claude：比對找差異。你：判斷原因、調整分錄'},
   {t:'存哪裡',ic:'box',d:'「銀行對帳表」放在同一個授權資料夾'}]},
  {t:'催款信',ic:'mail',d:'逾期應收帳款',go:{u:5},kids:[
   {t:'路徑',ic:'route',d:'連接 Gmail → 找逾期客戶 → 建草稿 → 你確認'},
   {t:'分工',ic:'people',d:'Claude：草擬。你：確認金額與語氣後自己寄出',red:'草稿不等於寄出'},
   {t:'存哪裡',ic:'box',d:'Gmail 草稿匣；未連接時存成 催款信草稿.md'}]},
  {t:'月結排程',ic:'clock',d:'每月 5 日自動出報表',go:{u:6},kids:[
   {t:'路徑',ic:'route',d:'建立排程 → 時間到自動執行 → 你覆核'},
   {t:'分工',ic:'people',d:'Claude：產出報表。你：簽核'},
   {t:'存哪裡',ic:'box',d:'報表放授權資料夾；排程設定在 App 裡',red:'用到本機檔案時，電腦與 App 要開著'}]},
  {t:'舊檔清理',ic:'trash',d:'要求刪除舊檔案',go:{u:6},kids:[
   {t:'路徑',ic:'route',d:'授權舊檔資料夾 → 要求刪除 → 出現權限請求 → 拒絕'},
   {t:'分工',ic:'people',d:'Claude：列清單。刪不刪由你決定',red:'沒有備份就不要允許'},
   {t:'存哪裡',ic:'box',d:'待刪除清單.md；原檔完全不動'}]}]}}
];
PXD.monitor_=['.########.','.#......#.','.#......#.','.#......#.','.########.','...####...'];
PXD.layers_=['....##....','...####...','..######..','.########.','..........','.########.','..######..'];
/* 額外的區塊（不在心智圖內，但分層卡片會用到） */
const EXTRA=[
 {id:'p_acct',t:'會計同仁',ic:'user',d:'下指令、檢查結果的人。',box:'交辦任務，也負責把關',go:{u:4}},
 {id:'p_boss',t:'主管與稽核',ic:'eye',d:'簽核成果、查看紀錄的人。',box:'看的是「誰做的、怎麼做的」',more:'AI 產出需要可追溯：指令、資料夾、產出檔案都要留下紀錄。'},
 {id:'p_ext',t:'客戶與廠商',ic:'mail',d:'收到信件與報表的對象。',box:'他們看到的是你簽核後的成果',red:'寄出前一定要人工確認'},
 {id:'sched',t:'排程',ic:'clock',d:'讓任務在固定時間自動執行。',box:'像月結行事曆',go:{u:6},red:'用到本機檔案時，電腦與 App 要開著'},
 {id:'slack',t:'Slack',ic:'chat',d:'搜尋對話、草擬訊息（示意）。'},
 {id:'notion',t:'Notion',ic:'book',d:'搜尋與整理頁面（示意）。'}
];
(function prep(){
 let c=0;
 MAPS.forEach((m,mi)=>{
  (function walk(n,depth,col,parent){
   n.depth=depth;n.parent=parent;n.map=mi;n.open=depth===0;
   if(!n.id)n.id=m.id+'-'+(++c);
   n.col=depth===0?'#7D776B':col;
   NODES[n.id]=n;
   (n.kids||[]).forEach((k,i)=>walk(k,depth+1,depth===0?COL[i%COL.length]:col,n));
  })(m.root,0,null,null);
 });
 EXTRA.forEach(e=>{e.col='#7D776B';NODES[e.id]=e});
})();

/* ========== 心智圖引擎 ========== */
const MM={map:0,scale:1,tx:0,ty:0,W:250,GX:74,GY:16,els:{},bw:0,bh:0,justDragged:false,ptr:new Map(),inited:{}};
const mmq=()=>({vp:$('#mmv'),cv:$('#mmc'),svg:$('#mmsvg')});
function nodeHtml(n){
 return `<div class="mn-h">${n.ic?pix(n.ic,n.col):''}<b>${n.num?`<i class="num">${n.num}</i>`:''}${n.t}</b></div>${n.d?`<p class="mn-d">${n.d}</p>`:''}${n.box?`<div class="mn-box" style="border-color:${n.col}">${n.box}</div>`:''}${n.red?`<div class="mn-red">${pix('warn','#B4382B',15)}<span>${n.red}</span></div>`:''}${n.go?`<button class="mn-go" data-act="go-unit" data-u="${n.go.u}" style="color:${n.col}">▶ 去練習</button>`:''}<button class="mn-t" tabindex="-1" aria-hidden="true"></button>`;
}
function mmRender(anchorId,opts){
 opts=opts||{};
 const {cv,svg}=mmq();if(!cv)return;
 const m=MAPS[MM.map],vis=[];
 (function walk(n){vis.push(n);if(n.open&&n.kids)n.kids.forEach(walk)})(m.root);
 const keep=new Set(vis.map(n=>n.id)),born=new Set();
 Object.keys(MM.els).forEach(id=>{if(!keep.has(id)){MM.els[id].remove();delete MM.els[id]}});
 vis.forEach(n=>{
  let e=MM.els[n.id];
  if(!e){e=document.createElement('div');e.dataset.id=n.id;e.dataset.act='mm-node';e.style.setProperty('--c',n.col);e.innerHTML=nodeHtml(n);cv.appendChild(e);MM.els[n.id]=e;if(!opts.noBorn){e.classList.add('born');born.add(n.id)}}
  const has=n.kids&&n.kids.length;
  e.className='mn'+(has?' has':'')+(n.open&&has?' open':'')+(born.has(n.id)?' born':'')+(n.flash?' flash':'');
  if(has){e.setAttribute('role','button');e.tabIndex=0;e.setAttribute('aria-expanded',!!n.open)}else{e.removeAttribute('role');e.removeAttribute('tabindex')}
  e.style.width=MM.W+'px';
 });
 vis.forEach(n=>{n.h=MM.els[n.id].offsetHeight});
 const anchor=anchorId&&NODES[anchorId],ox=anchor?anchor.x:0,oy=anchor?anchor.y:0;
 let cursor=0;
 const shift=(n,d)=>{n.y+=d;if(n.open&&n.kids)n.kids.forEach(k=>shift(k,d))};
 (function place(n){
  n.x=n.depth*(MM.W+MM.GX);
  if(!(n.open&&n.kids&&n.kids.length)){n.y=cursor;cursor+=n.h+MM.GY;return}
  const start=cursor;n.kids.forEach(place);
  const a=n.kids[0],b=n.kids[n.kids.length-1];
  n.y=((a.y+a.h)+(b.y+b.h))/2-n.h;
  if(n.y<start){const d=start-n.y;n.kids.forEach(k=>shift(k,d));n.y=start;cursor+=d}
  cursor=Math.max(cursor,n.y+n.h+MM.GY);
 })(m.root);
 let maxX=0,maxY=0;
 vis.forEach(n=>{const e=MM.els[n.id];e.style.left=n.x+'px';e.style.top=n.y+'px';maxX=Math.max(maxX,n.x+MM.W+14);maxY=Math.max(maxY,n.y+n.h+14)});
 MM.bw=maxX;MM.bh=maxY;
 let p='';
 vis.forEach(n=>{
  const by=n.y+n.h;
  p+=`<path d="M${n.x} ${by}H${n.x+MM.W}" stroke="${n.col}" ${born.has(n.id)?'class="draw"':''} pathLength="1"/>`;
  if(n.open&&n.kids)n.kids.forEach(k=>{
   const x1=n.x+MM.W,y1=n.y+n.h,x2=k.x,y2=k.y+k.h,xm=(x1+x2)/2;
   p+=`<path d="M${x1} ${y1}C${xm} ${y1} ${xm} ${y2} ${x2} ${y2}" stroke="${k.col}" ${born.has(k.id)?'class="draw"':''} pathLength="1"/>`;
  });
 });
 svg.setAttribute('width',maxX);svg.setAttribute('height',maxY);svg.innerHTML=p;
 if(anchor&&anchor.x!==undefined){MM.tx+=(ox-anchor.x)*MM.scale;MM.ty+=(oy-anchor.y)*MM.scale}
 mmApply();
}
function mmApply(){const {cv}=mmq();if(cv)cv.style.transform=`translate(${MM.tx}px,${MM.ty}px) scale(${MM.scale})`}
function mmFit(initial){
 const {vp}=mmq();if(!vp)return;
 const vw=vp.clientWidth,vh=vp.clientHeight;if(!vw||!vh)return;
 let s;
 if(initial){
  s=clamp((vw-24)/MM.bw,0.5,1);
  const root=MAPS[MM.map].root,rb=root.y+root.h;
  MM.scale=s;MM.tx=vw>MM.bw*s?Math.max(12,(vw-MM.bw*s)/2):12;
  MM.ty=MM.bh*s<=vh?(vh-MM.bh*s)/2:clamp(vh/2-rb*s,vh-MM.bh*s-14,14);
 }else{
  s=clamp(Math.min(vw/MM.bw,vh/MM.bh),0.25,1.2);
  MM.scale=s;MM.tx=Math.max(8,(vw-MM.bw*s)/2);MM.ty=MM.bh*s<vh?(vh-MM.bh*s)/2:14;
 }
 mmApply();
}
function mmZoom(f,cx,cy){
 const {vp}=mmq();const r=vp.getBoundingClientRect();
 cx=cx===undefined?r.width/2:cx;cy=cy===undefined?r.height/2:cy;
 const ns=clamp(MM.scale*f,0.25,1.8);
 MM.tx=cx-(cx-MM.tx)*ns/MM.scale;MM.ty=cy-(cy-MM.ty)*ns/MM.scale;MM.scale=ns;mmApply();
}
function mmSetAll(open){
 (function w(n){if(n.kids&&n.kids.length){n.open=n.depth===0?true:open;n.kids.forEach(w)}})(MAPS[MM.map].root);
 mmRender(null,{noBorn:false});mmFit(true);
}
function mmShow(i){
 if(i!==undefined)MM.map=i;
 const {cv}=mmq();if(!cv)return;
 $$('.mtab').forEach((b,k)=>b.classList.toggle('on',k===MM.map));
 Object.keys(MM.els).forEach(id=>MM.els[id].remove());MM.els={};
 mmRender(null,{noBorn:true});mmFit(true);
 store.set('cowork-map',MM.map);
}
function mmToggle(id){
 const n=NODES[id];if(!n||!n.kids||!n.kids.length)return;
 n.open=!n.open;
 if(!n.open)(function c(x){(x.kids||[]).forEach(k=>{k.open=false;c(k)})})(n);
 mmRender(id);
}
function focusNode(id){
 const n=NODES[id];if(!n||n.map===undefined)return false;
 setView('map',true);MM.map=n.map;
 for(let p=n.parent;p;p=p.parent)p.open=true;
 n.flash=true;
 mmShow(n.map);
 const {vp}=mmq();
 MM.scale=Math.max(MM.scale,.8);MM.tx=vp.clientWidth/2-(n.x+MM.W/2)*MM.scale;MM.ty=vp.clientHeight/2-(n.y+n.h/2)*MM.scale;mmApply();
 setTimeout(()=>{n.flash=false;const e=MM.els[id];if(e)e.classList.remove('flash')},2600);
 return true;
}
function mmInitEvents(){
 const {vp}=mmq();
 let last=null,pd=0,pm=null;
 vp.addEventListener('pointerdown',e=>{MM.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,drag:false});if(MM.ptr.size===2){const [a,b]=[...MM.ptr.values()];pd=Math.hypot(a.x-b.x,a.y-b.y);pm=MM.scale}});
 vp.addEventListener('pointermove',e=>{
  const p=MM.ptr.get(e.pointerId);if(!p)return;
  if(MM.ptr.size===2){
   p.x=e.clientX;p.y=e.clientY;const [a,b]=[...MM.ptr.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);
   if(pd){const r=vp.getBoundingClientRect();const target=clamp(pm*d/pd,0.25,1.8);mmZoom(target/MM.scale,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top)}
   MM.justDragged=true;return;
  }
  const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(!p.drag&&Math.hypot(e.clientX-p.sx,e.clientY-p.sy)>6){p.drag=true;try{vp.setPointerCapture(e.pointerId)}catch(err){}vp.classList.add('grab')}
  if(p.drag){MM.tx+=dx;MM.ty+=dy;mmApply();MM.justDragged=true}
  p.x=e.clientX;p.y=e.clientY;
 });
 const up=e=>{MM.ptr.delete(e.pointerId);if(MM.ptr.size<2)pd=0;vp.classList.remove('grab');setTimeout(()=>{if(!MM.ptr.size)MM.justDragged=false},0)};
 vp.addEventListener('pointerup',up);vp.addEventListener('pointercancel',up);
 vp.addEventListener('wheel',e=>{e.preventDefault();const r=vp.getBoundingClientRect();
  if(e.ctrlKey||e.metaKey)mmZoom(Math.exp(-e.deltaY*0.01),e.clientX-r.left,e.clientY-r.top);
  else{MM.tx-=e.deltaX;MM.ty-=e.deltaY;mmApply()}},{passive:false});
 vp.addEventListener('keydown',e=>{const n=e.target.closest&&e.target.closest('.mn.has');if(n&&(e.key==='Enter'||e.key===' ')){e.preventDefault();mmToggle(n.dataset.id)}});
 new ResizeObserver(()=>{if(document.body.dataset.view==='map'&&!MM.inited.fit){MM.inited.fit=1}}).observe(vp);
}

/* ========== 分層卡片 ========== */
const LAYERS=[
 {t:'1 誰在用、接了什麼',s:'先看最外面：誰會用 Cowork，Cowork 又去找誰幫忙。'},
 {t:'2 裡面有哪些零件',s:'再看裡面：八個零件各管什麼。'},
 {t:'3 一個任務怎麼走',s:'最後看流程：從下指令到交件，哪一站最容易出事。'}];
const bk=(ref,cls,t,s)=>`<button class="bk ${cls}" data-act="bk" data-ref="${ref}"><b>${t}</b>${s?`<small>${s}</small>`:''}</button>`;
const av=(a,b)=>`<div class="av"><span>⇅</span><small>${a}</small></div>`;
function layerHtml(i){
 if(i===0)return `<div class="ly">
  <div class="g3">${bk('p_acct','bl','會計同仁','下令、覆核')}${bk('p_boss','bl','主管與稽核','簽核、查紀錄')}${bk('p_ext','bl','客戶與廠商','收信、收報表')}</div>
  ${av('下指令・看結果')}
  <div class="g2s">${bk('input','br tall','Cowork 輸入框','主要入口<br>交辦任務<br>追問與補充')}
   <div class="dash"><div class="cap">App 裡的其他入口</div><div class="g2">${bk('folder','br','授權資料夾','唯一的檔案範圍')}${bk('sched','br','排程','定時自動執行')}${bk('skill','br','自訂','技能、外掛')}${bk('permn','br','權限請求','要你點頭')}</div></div></div>
  ${av('經過 App')}
  ${bk('app','gr wide','Cowork App','裝在你的電腦上<br>真正動手讀寫檔案的程式')}
  ${av('呼叫服務')}
  <div class="dash"><div class="cap">外面接的服務</div><div class="g3">${bk('model','br','Claude 模型','雲端大腦<br>送字、收字')}${bk('gmail','br','Gmail','讀信、建草稿')}${bk('drive','br','Google Drive','雲端檔案')}${bk('cal','br','Calendar','行程')}${bk('slack','br','Slack','對話（示意）')}${bk('notion','br','Notion','頁面（示意）')}</div></div></div>`;
 if(i===1)return `<div class="ly"><div class="g2">${['model','app','folder','conn','skill','project','plug','you'].map(id=>{const n=NODES[id];return `<button class="bk big" style="border-color:${n.col}" data-act="bk" data-ref="${id}"><span class="bic">${pix(n.ic,n.col,30)}</span><b>${n.t}</b><small>${n.d}</small>${n.box?`<em>${n.box}</em>`:''}</button>`}).join('')}</div></div>`;
 return `<div class="ly chain">${['s1','s2','s3','s4','perm','s6','s7'].map((id,k)=>{const n=NODES[id];return `${k?'<div class="dn">↓</div>':''}<button class="bk step" style="border-color:${n.col}" data-act="bk" data-ref="${id}"><span class="sn" style="background:${n.col}">${n.num}</span><span class="stx"><b>${n.t}</b><small>${n.d}</small></span>${n.red?`<span class="rd" title="${esc(n.red)}">${pix('warn','#B4382B',18)}<small>${n.red}</small></span>`:''}</button>`}).join('')}</div>`;
}
const LY={cur:0};
function renderLayers(){
 $('#view-layers').innerHTML=`<div class="vwrap2"><div class="lytabs">${LAYERS.map((l,i)=>`<button class="${i===LY.cur?'on':''}" data-act="ly-tab" data-i="${i}">${l.t}</button>`).join('')}</div>
 <h2 class="lyh serif">${LAYERS[LY.cur].t}</h2><p class="lys">${LAYERS[LY.cur].s}</p><p class="lyhint">點任何一塊看細節；有 ▶ 的可以直接去模擬器練習。</p>
 ${layerHtml(LY.cur)}
 <div class="lynav"><button class="btn ghost" data-act="ly-tab" data-i="${LY.cur-1}" ${LY.cur===0?'disabled':''}>← 上一層</button><button class="btn" data-act="ly-tab" data-i="${LY.cur+1}" ${LY.cur===LAYERS.length-1?'disabled':''}>下一層 →</button></div></div>`;
}
function renderOverview(){
 $('#view-overview').innerHTML=`<div class="vwrap2"><h2 class="lyh serif">全景：一次看完 Cowork 運作架構</h2><p class="lys">三層疊在一起，從外到內、從零件到流程。每一塊都能點開。</p>
 ${LAYERS.map((l,i)=>`<section class="ovl"><h3>${l.t}</h3><p class="lys">${l.s}</p>${layerHtml(i)}</section>`).join('')}
 <section class="ovl"><h3>想看更細？選一張心智圖</h3><div class="g3 mapcards">${MAPS.map((m,i)=>`<button class="bk bl" data-act="open-map" data-m="${i}"><b>${m.tab}</b><small>${m.root.t}</small></button>`).join('')}</div></section></div>`;
}
function openSheet(id){
 const n=NODES[id];if(!n)return;
 const kids=(n.kids||[]).map(k=>`<li><b>${k.t}</b>${k.d?`：${k.d}`:''}</li>`).join('');
 $('#sheet').innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(n.t)}"><button class="x" data-act="sheet-close" aria-label="關閉">×</button>
  <div class="sh-h">${pix(n.ic,n.col==='#7D776B'?'#3E7C59':n.col,34)}<h3>${n.t}</h3></div>
  <p class="sh-d">${n.d||''}</p>${n.box?`<div class="sh-box"><b>白話：</b>${n.box}</div>`:''}${n.red?`<div class="sh-red">${pix('warn','#B4382B',18)}<span>${n.red}</span></div>`:''}${n.more?`<p class="sh-m">${n.more}</p>`:''}${kids?`<ul class="sh-k">${kids}</ul>`:''}
  <div class="sh-b">${n.go?`<button class="btn" data-act="go-unit" data-u="${n.go.u}">▶ 到模擬器練習（單元 ${UNITS.findIndex(x=>x.id===n.go.u)+1}）</button>`:''}${n.map!==undefined?`<button class="btn ghost" data-act="to-map" data-id="${id}">在心智圖中看</button>`:''}</div></div>`;
 $('#sheet').hidden=false;$('#sheet .x').focus();
}
const closeSheet=()=>{$('#sheet').hidden=true};

/* ========== 檢視切換 ========== */
const VIEWS=['map','layers','overview','gloss','learn'];
function setView(v,skipMap){
 if(!VIEWS.includes(v))v='map';
 document.body.dataset.view=v;
 $$('.vsw button').forEach(b=>{const on=b.dataset.v===v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
 closeSheet();
 if(v==='map'){if(!$('#mmv').dataset.ready){$('#mmv').dataset.ready=1;mmInitEvents()}if(!skipMap)requestAnimationFrame(()=>mmShow())}
 if(v==='layers')renderLayers();
 if(v==='overview')renderOverview();
 if(v==='gloss')renderGloss();
 store.set('cowork-view',v);
}
function gotoUnit(u){
 setView('learn');
 if(typeof Course!=='undefined'){
  const ix=Math.max(0,UNITS.findIndex(x=>x.id===u));const lk=!Course.unlocked(ix);Course.go(ix,true,2);
  if(lk)toast('這個單元通常排在前面單元之後；已先帶你過來看，積分照算','ok');
 }
}
Object.assign(GA,{
 view(el){setView(el.dataset.v)},
 'mm-tab'(el){mmShow(+el.dataset.i)},
 'mm-node'(el,e){if(MM.justDragged)return;mmToggle(el.dataset.id)},
 'mm-all'(){mmSetAll(true)},
 'mm-none'(){mmSetAll(false)},
 'mm-fit'(){mmFit(false)},
 'mm-zoom'(el){mmZoom(+el.dataset.f)},
 'go-unit'(el){closeSheet();gotoUnit(+el.dataset.u)},
 bk(el){openSheet(el.dataset.ref)},
 'sheet-close'(){closeSheet()},
 'sheet-bg'(el,e){if(e.target===el)closeSheet()},
 'to-map'(el){closeSheet();focusNode(el.dataset.id)},
 'open-map'(el){setView('map');mmShow(+el.dataset.m)},
 'ly-tab'(el){const i=+el.dataset.i;if(i>=0&&i<LAYERS.length){LY.cur=i;renderLayers();window.scrollTo(0,0)}}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
let _lw=innerWidth;window.addEventListener('resize',()=>{if(innerWidth!==_lw){_lw=innerWidth;if(document.body.dataset.view==='map')mmFit(true)}});
const UNITMAP={1:0,7:3,2:0,3:2,4:1,5:3,6:2};
window.addEventListener('DOMContentLoaded',()=>{
 $('#mmtabs').innerHTML=MAPS.map((m,i)=>`<button class="mtab" data-act="mm-tab" data-i="${i}">${m.tab}</button>`).join('');
 const sv=new URLSearchParams(location.search).get('view')||store.get('cowork-view','map');
 MM.map=clamp(+store.get('cowork-map',0)||0,0,MAPS.length-1);
 setView(VIEWS.includes(sv)?sv:'map');
});
