/* ========== 模擬器狀態 ========== */
const S={mode:'cowork',view:'home',ctab:'skills',folder:null,peek:null,modal:null,prompt:'',tasks:[],active:null,
 conn:{},plugins:{},plugOpen:{},
 skills:[{id:'inv',name:'發票整理',desc:'依公司規則辨識發票欄位並命名',on:true,src:'內建'},{id:'acct',name:'會計科目對照',desc:'把摘要對應到公司會計科目',on:false,src:'內建'}],
 schedules:[],pmode:'manual',lang:'en',rp:{prog:1,folder:1,ctx:1},chat:[],model:'Opus 4.8',effort:'High',output:null,
 projects:[{id:'p1',name:'2026 月結專案',inst:'金額用千分位、科目依公司科目表排序、異常項目標紅。',folder:'invoices'}]};
/* ===== 介面語言（實際畫面是英文，預設 EN；可切換中文） ===== */
const UI={
 en:{newTask:'New task',projects:'Projects',artifacts:'Artifacts',scheduled:'Scheduled',customize:'Customize',code:'Code',cowork:'Cowork',recents:'Recents',noTasks:'No tasks yet',user:'Student',plan:'Practice',greet:'What can I take off your plate?',greetChat:'How can I help you today?',safe:'Learn how to use Cowork safely.',ph:'How can I help you today?',phChat:'Ask a question…  (Chat only answers, never touches your files)',pickFolder:'Work in a project or folder',pickTask:'Pick a task, any task',withPlugins:'Customize with plugins',chatFolder:'Project or folder',output:'Output',progress:'Progress',folder:'Working folder',context:'Context',allow:'Allow',deny:'Deny',needs:'Claude needs your permission',skills:'Skills',connectors:'Connectors',plugins:'Plugins',pm:{manual:'Manual',auto:'Auto',skip:'Skip'},pmFull:{manual:'Manually approve',auto:'Auto',skip:'Skip all approvals'},followup:'Reply…',notStarted:'Not started',noFolder:'No folder selected',noConn:'No connectors connected'},
 zh:{newTask:'新任務',projects:'專案',artifacts:'成品',scheduled:'排程',customize:'自訂',code:'Code',cowork:'Cowork',recents:'最近的任務',noTasks:'還沒有任務',user:'學員',plan:'練習',greet:'有什麼事可以幫你分擔？',greetChat:'想問 Claude 什麼？',safe:'了解如何安全地使用 Cowork。',ph:'描述你要完成的任務…（Enter 送出，Shift+Enter 換行）',phChat:'問一個問題…（Chat 只回答，不會動你的檔案）',pickFolder:'在專案或資料夾中工作',pickTask:'挑一個任務試試',withPlugins:'用外掛客製化',chatFolder:'專案或資料夾',output:'輸出',progress:'進度',folder:'工作資料夾',context:'情境',allow:'允許',deny:'拒絕',needs:'Claude 請求你的許可',skills:'技能',connectors:'連接器',plugins:'外掛',pm:{manual:'手動核准',auto:'自動',skip:'全部略過'},pmFull:{manual:'手動核准',auto:'自動',skip:'全部略過'},followup:'追問或補充…',notStarted:'尚未開始',noFolder:'未選擇資料夾',noConn:'未連接任何服務'}
};
const tx=k=>UI[S.lang][k];
const LOG=new Set();
let _uid=0;
function emit(e){LOG.add(e);if(typeof Course!=='undefined')Course.evaluate()}

function toast(msg,kind){
 const box=$('#toasts');if(!box)return;
 const d=document.createElement('div');d.className='toast '+(kind||'');d.textContent=msg;box.appendChild(d);
 setTimeout(()=>d.remove(),kind==='ok'?2600:3600);
 while(box.children.length>3)box.firstChild.remove();
}
function pulse(sel){
 $$('.pulse').forEach(e=>e.classList.remove('pulse'));
 const el=$(sel);if(!el)return false;
 el.classList.add('pulse');el.scrollIntoView({block:'nearest',behavior:'smooth'});
 setTimeout(()=>el.classList.remove('pulse'),4500);return true;
}

/* ========== 渲染 ========== */
function renderSim(){
 const root=$('#sim');if(!root)return;
 const a=document.activeElement,keep=a&&a.id==='composer'?a.selectionStart:null;
 const old=$('#chat');const wasBottom=!old||old.scrollHeight-old.scrollTop-old.clientHeight<80;
 root.innerHTML=simChrome()+`<div class="sim-body">${sidebar()}<main class="sim-main">${main()}</main></div>`+modalHtml();
 const c=$('#chat');if(c&&wasBottom)c.scrollTop=c.scrollHeight;
 if(keep!==null){const n=$('#composer');if(n){n.focus();try{n.setSelectionRange(keep,keep)}catch(e){}}}
}
const simChrome=()=>'';
const sidebar=()=>`<aside class="sb">
 <div class="sb-top"><div class="dots"><i></i><i></i><i></i></div><span class="sb-ic">${IC.layers}</span><span class="sb-ic">${IC.search}</span><span class="sim-badge" title="介面為教學仿製，實際畫面以你的版本為準">教學模擬版</span></div>
 <div class="sb-seg" role="tablist"><button role="tab" aria-selected="${S.mode!=='code'}" class="${S.mode!=='code'?'on':''}" data-act="mode" data-m="cowork">${tx('cowork')}</button><button role="tab" aria-selected="${S.mode==='code'}" class="${S.mode==='code'?'on':''}" data-act="mode" data-m="code">${tx('code')}</button></div>
 <button class="sb-new" data-act="nav" data-v="home">${IC.plus}<span>${tx('newTask')}</span><kbd>⌘N</kbd></button>
 <button class="sb-i ${S.view==='projects'?'on':''}" data-act="nav" data-v="projects">${IC.layers}<span>${tx('projects')}</span></button>
 <button class="sb-i ${S.view==='artifacts'?'on':''}" data-act="nav" data-v="artifacts">${IC.file}<span>${tx('artifacts')}</span></button>
 <button class="sb-i ${S.view==='scheduled'?'on':''}" data-act="nav" data-v="scheduled">${IC.clock}<span>${tx('scheduled')}</span></button>
 <button class="sb-i ${S.view==='customize'?'on':''}" data-act="nav" data-v="customize">${IC.book}<span>${tx('customize')}</span></button>
 <div class="sb-h">${tx('recents')}</div>
 ${S.tasks.length?S.tasks.map(k=>`<button class="sb-t ${S.view==='task'&&S.active===k.id?'on':''}" data-act="open-task" data-id="${k.id}"><i class="dot ${k.status}"></i><span>${esc(k.title)}</span></button>`).join(''):`<p class="sb-empty">${tx('noTasks')}</p>`}
 <div class="sb-foot"><span class="avt">${S.lang==='en'?'S':'學'}</span><span class="who"><b>${tx('user')}</b><small>${tx('plan')}</small></span><button class="lang" data-act="lang" title="Switch language / 切換語言">${S.lang==='en'?'EN':'中'}</button></div></aside>`;

function main(){
 if(S.mode==='chat')return chatView();
 if(S.mode==='code')return modeNote('code','Code（這門課不教）','Code 是給工程師寫程式用的。這門課的重點是 Cowork，不需要用到這裡。','回到 Cowork，繼續練習');
 if(S.view==='projects')return projView();
 if(S.view==='artifacts')return artView();
 if(S.view==='scheduled')return schedView();
 if(S.view==='customize')return customView();
 if(S.view==='task')return taskView();
 return homeView();
}
const modeNote=(ic,h,p,ex)=>`<div class="modeNote">${IC[ic]}<h2>${h}</h2><p>${p}</p><div class="bubble">${ex}</div><button class="chip pri" data-act="mode" data-m="cowork">切到 Cowork 交辦任務</button></div>`;

const MODELS=[{n:'Opus 4.8',d:'最會想，慢一點、較耗用量。難題、一次要做對的任務'},{n:'Sonnet 4.5',d:'日常首選。文件、報表、多步驟任務'},{n:'Haiku 5',d:'快又省。分類、改格式、大量重複的簡單工作'}];
const EFFORTS=[['Low','快速回答'],['Medium','一般'],['High','多想一會兒']];
function compBar(cowork){
 return `<div class="comp-bar"><button class="plus" data-act="attach" aria-label="附加">${IC.plus}</button>
 <div class="mtoggle" role="tablist" aria-label="模式"><button role="tab" aria-selected="${!cowork}" class="${cowork?'':'on'}" data-act="mode" data-m="chat">Chat</button><button role="tab" aria-selected="${cowork}" class="${cowork?'on':''}" data-act="mode" data-m="cowork">Cowork</button></div>
 <span class="grow"></span><span class="mset"><button class="mdl" data-act="model-menu" title="選擇模型與強度"><b>${S.model}</b></button><button class="eff" data-act="effort-cycle" title="強度：越高想得越久（點一下切換）">${S.effort}</button><button class="pmb" data-act="pmode" title="${tx('pmFull')[S.pmode]}（點一下切換權限模式）">${tx('pm')[S.pmode]}</button></span><button class="send" data-act="send" aria-label="送出">${IC.send}</button></div>`;
}
function folderBar(){
 const f=S.folder?FOLDERS[S.folder]:null;
 return `<button class="fbar ${f?'on':''}" data-act="folder-open">${IC.folder}<span>${f?esc(f.name):tx('pickFolder')}</span><i>▾</i></button>`;
}
function homeView(){
 return `<div class="home"><div class="hello">${IC.spark}<h1>${tx('greet')}</h1></div><p class="safe"><button class="lnk" data-act="safe-tip">${tx('safe')}</button></p>
 <div class="composer"><textarea id="composer" placeholder="${tx('ph')}">${esc(S.prompt)}</textarea>${compBar(true)}</div>
 <div class="under">${folderBar()}</div>
 <div class="pick"><div class="pick-h">${IC.spark}<span>${tx('pickTask')}</span></div><div class="sugg">${SUGG.map(g=>`<button class="sg ${g.dg?'dg':''}" data-act="sugg" data-id="${g.id}" title="${esc(g.s)}">${IC[g.ic]}<b>${g.t}</b><small>${g.s}</small></button>`).join('')}</div>
 <button class="lnk center" data-act="goto-plugins">${tx('withPlugins')}</button></div></div>`;
}
const CHATQ=['應付帳款和應付票據差在哪？','請用白話解釋收入認列五步驟','幫我把這封催款信改得更有禮貌'];
function chatView(){
 return `<div class="home"><div class="hello">${IC.spark}<h1>${tx('greetChat')}</h1></div>
 <div class="composer"><textarea id="composer" placeholder="${tx('phChat')}">${esc(S.prompt)}</textarea>${compBar(false)}</div>
 <div class="under"><button class="fbar" data-act="noop">${tx('chatFolder')}</button><button class="fbar ${S.output?'on':''}" data-act="output-menu"><span>${tx('output')}${S.output?': '+S.output:''}</span><i>▾</i></button></div>
 ${S.chat.length?`<div class="chatlog" id="chat">${S.chat.map(m=>m.r==='u'?`<div class="m-u">${esc(m.t)}</div>`:`<div class="m-c"><span class="av">${IC.spark}</span><div>${m.t}${m.btn?`<div class="m-btns"><button class="chip pri" data-act="mode" data-m="cowork">切換到 Cowork</button></div>`:''}</div></div>`).join('')}</div>`
 :`<div class="sugg">${CHATQ.map(q=>`<button class="sg" data-act="chat-q" data-q="${esc(q)}">${IC.chat}<b>${esc(q)}</b></button>`).join('')}</div>`}</div>`;
}
function chatSend(p){
 S.chat.push({r:'u',t:p});S.prompt='';renderSim();
 let r,btn=false;
 if(S.output){r='選了 <b>Output：'+S.output+'</b>：Chat 會直接產出文件／簡報（Beta），內容靠你輸入的文字，不會去讀你電腦裡的資料夾。要整理電腦裡的檔案，請切到 Cowork。<br><small style="color:var(--muted)">（教學模擬）</small>';btn=true}
 else if(/發票|整理|excel|資料夾|檔案|對帳單|合併|刪除/i.test(p)){r='這需要讀你電腦裡的檔案、做出新檔案。<b>Chat 只能回答問題</b>，請切換到 Cowork，再選資料夾。';btn=true}
 else if(/應付/.test(p))r='<b>應付帳款</b>是尚未付款的一般賒購款項；<b>應付票據</b>是已開出票據、約定到期日付款的負債。差別在有沒有開票。<br><small style="color:var(--muted)">（教學模擬的示範回答）</small>';
 else if(/收入認列/.test(p))r='五步驟：①辨認合約 ②辨認履約義務 ③決定交易價格 ④分攤交易價格 ⑤履行時認列收入。<br><small style="color:var(--muted)">（教學模擬的示範回答）</small>';
 else if(/催款|信/.test(p))r='敬啟者：想提醒您，編號 INV-0731 的款項已逾期，若已安排付款，請忽略此信並告知付款日。謝謝您的協助。<br><small style="color:var(--muted)">（教學模擬的示範回答）</small>';
 else r='這裡是 Chat：我會直接回答你的問題，不會動你的檔案。<br><small style="color:var(--muted)">（教學模擬）</small>';
 setTimeout(()=>{S.chat.push({r:'c',t:r,btn});renderSim();emit('chat_sent')},500);
}

function taskView(){
 const k=S.tasks.find(x=>x.id===S.active);if(!k)return homeView();
 const f=k.folder?FOLDERS[k.folder]:null;
 const newFiles=k.status==='done'?k.out:[];
 const done=k.steps.filter(x=>x.st==='done').length;
 const sec=(key,title,meta,body)=>`<section class="rcard ${S.rp[key]?'':'shut'}"><button class="rh" data-act="rp-toggle" data-k="${key}" aria-expanded="${!!S.rp[key]}"><b>${title}</b><span>${meta}</span><i>▾</i></button><div class="rb">${body}</div></section>`;
 const prog=k.steps.length?`<ol class="prog">${k.steps.map(x=>`<li class="${x.st}"><i>${x.st==='done'?IC.check:x.st==='skip'?'—':x.st==='run'?'<b class="spin"></b>':''}</i><span>${x.t}</span></li>`).join('')}</ol>`:`<p class="dim">${tx('notStarted')}</p>`;
 const fold=f?`<div class="ff"><div><b>${esc(f.name)}</b></div>${f.files.slice(0,5).map(n=>`<div>${esc(n)}</div>`).join('')}${f.count>5?`<div>…${f.count}</div>`:''}${newFiles.map(o=>`<div class="new">+ ${esc(o.name)}</div>`).join('')}</div>`:`<p class="dim">${tx('noFolder')}</p>`;
 const ctx=`<div class="ff"><div>${CONNECTORS.filter(c=>S.conn[c.id]).map(c=>`<span class="tag ok">${c.name}</span>`).join(' ')||tx('noConn')}</div><div>${S.skills.filter(x=>x.on).length} ${S.lang==='en'?'skills on':'個技能啟用中'}</div></div>`;
 return `<div class="task"><div class="chat" id="chat"><div class="t-title">${esc(k.title)}</div>${k.msgs.map(m=>msgHtml(m,k)).join('')}
 <div class="fup"><textarea id="composer" placeholder="${tx('followup')}" aria-label="reply">${esc(S.prompt)}</textarea><button class="send" data-act="send" aria-label="send">${IC.send}</button></div></div>
 <aside class="rp">${sec('prog',tx('progress'),k.steps.length?done+'/'+k.steps.length:'',prog)}${sec('folder',tx('folder'),'',fold)}${sec('ctx',tx('context'),'',ctx)}</aside></div>`;
}
function msgHtml(m,k){
 if(m.r==='u')return `<div class="m-u">${esc(m.t)}</div>`;
 if(m.r==='c')return `<div class="m-c"><span class="av">${IC.spark}</span><div>${m.t}${m.btn?`<div class="m-btns">${m.btn.map(b=>`<button class="chip pri" data-act="${b.act}">${b.l}</button>`).join('')}</div>`:''}</div></div>`;
 if(m.r==='files')return `<div class="m-files">${m.f.map(f=>`<button class="fchip" data-act="file-open" data-type="${f.type}" data-pv="${f.pv}" data-name="${esc(f.name)}">${IC[{xlsx:'sheet',gmail:'mail',pptx:'layers',docx:'file'}[f.type]||'file']}<span>${esc(f.name)}</span></button>`).join('')}</div>`;
 if(m.r==='perm'){const p=m.perm;return `<div class="perm ${p.danger?'danger':''} ${m.state}"><div class="perm-h">${IC[p.danger?'warn':'shield']}<b>${tx('needs')}</b></div><p><b>${p.text}</b></p><small>${p.detail}</small>${m.state==='ask'?`<div class="perm-b"><button class="chip" data-act="perm" data-ok="0">${tx('deny')}</button><button class="chip pri" data-act="perm" data-ok="1">${tx('allow')}</button></div>`:`<div class="perm-r">${m.state==='allow'?'✓ 你已允許':'✕ 你已拒絕'}</div>`}</div>`}
 return '';
}

function customView(){
 const tabs=[['skills',tx('skills')],['connectors',tx('connectors')],['plugins',tx('plugins')]];
 let body='';
 if(S.ctab==='skills')body=`<p class="note" style="margin:0">Skill（技能）＝做事說明書：把你的做法寫下來，Claude 需要時照著做。</p><div class="list">${S.skills.map(s=>`<div class="item"><div class="ic">${IC.book}</div><div class="mid"><b>${esc(s.name)}</b> <span class="tag">${esc(s.src)}</span><small>${esc(s.desc)}</small></div><button class="sw ${s.on?'on':''}" role="switch" aria-checked="${s.on}" aria-label="啟用 ${esc(s.name)}" data-act="skill-toggle" data-id="${s.id}"></button></div>`).join('')}</div><div><button class="chip pri" data-act="skill-new">${IC.plus}建立 Skill</button></div>`;
 if(S.ctab==='connectors')body=`<p class="note" style="margin:0">連接器＝接外部工具的「插頭」（技術上叫 MCP）。連接前會顯示它能做哪些事，請看清楚再允許。</p><div class="list">${CONNECTORS.map(c=>`<div class="item"><div class="ic">${IC[c.ic]}</div><div class="mid"><b>${c.name}</b><small>${c.desc}</small></div>${S.conn[c.id]?`<span class="tag ok">已連接</span><button class="chip" data-act="conn-off" data-id="${c.id}">中斷</button>`:`<button class="chip pri" data-act="conn-on" data-id="${c.id}">連接</button>`}</div>`).join('')}</div>`;
 if(S.ctab==='plugins')body=`<p class="note" style="margin:0">外掛＝一整包：技能、連接器、子代理打包，一次裝好（內容依外掛而異）。</p><div class="list">${PLUGINS.map(p=>`<div class="item"><div class="ic">${IC[p.ic]}</div><div class="mid"><b>${p.name}</b><small>${p.desc}</small>${S.plugOpen[p.id]?`<div class="det">${p.items.map(i=>`<div>・${i}</div>`).join('')}<div style="color:var(--muted)">（教學示意內容）</div></div>`:''}<button class="mini" style="margin-top:4px" data-act="plug-detail" data-id="${p.id}">${S.plugOpen[p.id]?'收合':'查看內容'}</button></div>${S.plugins[p.id]?`<span class="tag ok">已安裝</span><button class="chip" data-act="plug-off" data-id="${p.id}">移除</button>`:`<button class="chip pri" data-act="plug-on" data-id="${p.id}">安裝</button>`}</div>`).join('')}</div>`;
 return `<div class="cust"><h2>${tx('customize')}</h2><div class="tabs">${tabs.map(t=>`<button class="${S.ctab===t[0]?'on':''}" data-act="ctab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>${body}</div>`;
}
const ATYPE={xlsx:'Excel',docx:'Word',pptx:'PowerPoint',md:'文件',gmail:'Gmail 草稿'};
function artView(){
 const items=[];S.tasks.forEach(k=>{if(k.status==='done')k.out.forEach(o=>items.push({o,k}))});
 return `<div class="sched"><h2>${tx('artifacts')}</h2><div class="note">Claude 做出來的檔案（Excel、Word、簡報…）會集中放在這裡，點一下就能打開檢查。（教學示意，位置與名稱以你的版本為準）</div>
 ${items.length?`<div class="list">${items.map(x=>`<div class="item"><div class="ic">${IC[{xlsx:'sheet',gmail:'mail',pptx:'layers',docx:'file'}[x.o.type]||'file']}</div><div class="mid"><b>${esc(x.o.name)}</b><small>${ATYPE[x.o.type]||'檔案'}・來自任務「${esc(x.k.title)}」</small></div><button class="chip pri" data-act="file-open" data-type="${x.o.type}" data-pv="${x.o.pv}" data-name="${esc(x.o.name)}">Open</button></div>`).join('')}</div>`:'<div class="empty">還沒有成品。請先在「新任務」做一個 Excel、Word 或簡報。</div>'}</div>`;
}
function projView(){
 return `<div class="sched"><h2>${tx('projects')}</h2><div class="note">專案＝把同一件事的說明和資料放在一起，有自己的說明、檔案、排程與記憶。之後在專案裡開的任務都共用，不用每次重講。</div>
 ${S.projects.length?`<div class="list">${S.projects.map((p,i)=>`<div class="item"><div class="ic">${IC.layers}</div><div class="mid"><b>${esc(p.name)}</b><small>說明：${esc(p.inst)}</small><span class="tag">${IC.folder.replace('<svg','<svg style="vertical-align:-2px"')} ${esc(FOLDERS[p.folder].name)}</span></div><button class="chip pri" data-act="proj-open" data-i="${i}">在此專案開新任務</button></div>`).join('')}</div>`:'<div class="empty">還沒有專案。</div>'}
 <div><button class="chip pri" data-act="proj-new">${IC.plus}新增專案</button></div></div>`;
}
function schedView(){
 return `<div class="sched"><h2>${tx('scheduled')}</h2><div class="note">排程任務多半在雲端執行：電腦關機、App 關掉也會跑；但要用到你電腦裡的檔案或程式時，電腦要開著。每次執行都是全新對話，指令要寫清楚。（以官方最新說明與你的版本為準）</div>
 ${S.schedules.length?`<div class="list">${S.schedules.map((s,i)=>`<div class="item"><div class="ic">${IC.clock}</div><div class="mid"><b>${esc(s.name)}</b><small>${esc(s.freq)} ${esc(s.time)}・${esc(s.prompt.slice(0,40))}</small></div><button class="sw ${s.on?'on':''}" role="switch" aria-checked="${s.on}" aria-label="啟用排程" data-act="sched-toggle" data-i="${i}"></button></div>`).join('')}</div>`:`<div class="empty">還沒有排程。<br>例如：每月 5 日 09:00，自動產出上月月結報表。</div>`}
 <div><button class="chip pri" data-act="sched-new">${IC.plus}新增排程</button></div></div>`;
}

function modalHtml(){
 const m=S.modal;if(!m)return '';
 let h='',foot='';
 if(m.type==='folder'){
  const pk=m.peek?FOLDERS[m.peek]:null;
  h=`<h3>選擇要授權給 Claude 的資料夾</h3><div class="fp"><div class="l">${Object.entries(FOLDERS).map(([id,f])=>`<button class="frow ${m.peek===id?'on':''}" data-act="peek" data-id="${id}">${IC.folder}<span><b>${f.name}</b><small>${f.count} 個檔案${f.sens?'・含敏感資料':''}</small></span></button>`).join('')}</div>
  <div class="r">${pk?`<b>${pk.name}</b><small style="color:var(--muted)">${pk.path}</small>${pk.sens?'<div class="warnbar">⚠ 含薪資單、身分證等敏感資料，與會計任務無關</div>':''}<div class="fl">${pk.files.slice(0,8).map(n=>`<div>${IC.file.replace('<svg','<svg style="vertical-align:-2px;margin-right:4px"')}${esc(n)}</div>`).join('')}${pk.count>8?`<div>…共 ${pk.count} 個</div>`:''}</div><button class="btn" data-act="folder-pick" data-id="${m.peek}">授權此資料夾</button>`:'<p style="color:var(--muted)">點選左側資料夾，先預覽裡面有什麼，再決定要不要授權。</p>'}</div></div>`;
 }
 if(m.type==='file'){
  const body=m.pv==='gmail'?PREVIEW.gmail():PREVIEW[m.pv]();
  h=`<h3>${IC[{xlsx:'sheet',gmail:'mail',pptx:'layers',docx:'file'}[m.ftype]||'file']} ${esc(m.name)}</h3>${body}<p style="font-size:13px;color:var(--green);background:var(--green-soft);border-radius:8px;padding:6px 10px">專業提醒：AI 的產出是初稿，請抽查數字並對照原始單據再使用。</p>`;
 }
 if(m.type==='oauth'){
  const c=CONNECTORS.find(x=>x.id===m.id);
  h=`<h3>連接 ${c.name}</h3><p>Claude 想要取得以下權限：</p><ul style="margin:0 0 0 18px">${c.perm.map(x=>`<li>${x}</li>`).join('')}</ul><p style="font-size:13px;color:var(--muted)">（教學模擬：不會真的連線到你的帳號。實務上授權前請確認範圍。）</p>`;
  foot=`<button class="btn ghost" data-act="modal-close">取消</button><button class="btn" data-act="oauth-ok" data-id="${m.id}">允許</button>`;
 }
 if(m.type==='skill'){
  h=`<h3>建立 Skill</h3><label class="lbl">技能名稱<input class="fld" id="sk-name" placeholder="例如：月結報表格式" value="月結報表格式"></label><label class="lbl">做法說明（寫給 Claude 的 SOP）<textarea class="fld" id="sk-body" rows="4">產出月結報表時：1) 金額一律千分位、單位新台幣元 2) 科目依公司科目表排序 3) 最後一列加總並標示差異</textarea></label>`;
  foot=`<button class="btn ghost" data-act="modal-close">取消</button><button class="btn" data-act="skill-save">儲存</button>`;
 }
 if(m.type==='model'){
  h=`<h3>選擇模型與強度</h3><div class="menu-list">${MODELS.map(x=>`<button class="${S.model===x.n?'on':''}" data-act="model-pick" data-m="${x.n}"><span class="n">${S.model===x.n?'✓':''}</span><span><b>${x.n}</b><small>${x.d}</small></span></button>`).join('')}</div><p class="sh-m" style="margin:6px 0 0">強度：越高，Claude 想得越久。</p><div class="mopts">${EFFORTS.map(e=>`<button class="opt ${S.effort===e[0]?'good':''}" data-act="effort-pick" data-e="${e[0]}">${e[0]}<small style="display:block;font-weight:400">${e[1]}</small></button>`).join('')}</div>`;
  foot=`<button class="btn" data-act="modal-close">完成</button>`;
 }
 if(m.type==='output'){
  h=`<h3>Output</h3><div class="menu-list">${[['Docs','文件','Beta'],['Slides','簡報','Beta'],['Design','設計','Beta'],['Artifact','讓 Claude 自己挑格式','']].map(x=>`<button class="${S.output===x[0]?'on':''}" data-act="output-pick" data-o="${x[0]}"><span class="n">${S.output===x[0]?'✓':''}</span><span><b>${x[0]} ${x[2]?'<em class="beta">'+x[2]+'</em>':''}</b><small>${x[1]}</small></span></button>`).join('')}</div>`;
  foot=`<button class="btn ghost" data-act="output-pick" data-o="">清除</button><button class="btn" data-act="modal-close">完成</button>`;
 }
 if(m.type==='safe'){
  h=`<h3>${tx('safe')}</h3><ul style="margin:0 0 0 18px;display:grid;gap:6px"><li>只授權任務需要的資料夾，並先用副本練習。</li><li>每個權限請求都看清楚：範圍？影響？可還原嗎？</li><li>Claude 做的是初稿：Excel 看公式、Word 讀一遍、簡報核對數字。</li></ul><p class="sh-m">更完整的內容在「安全」心智圖與課程的安全單元。</p>`;
  foot=`<button class="btn ghost" data-act="modal-close">關閉</button><button class="btn" data-act="go-unit" data-u="6">到安全單元</button>`;
 }
 if(m.type==='project'){
  h=`<h3>新增專案</h3><label class="lbl">專案名稱<input class="fld" id="pj-name" value="銀行對帳專案"></label><label class="lbl">專案說明（之後每個任務都共用）<textarea class="fld" id="pj-inst" rows="3">對帳時，差異超過 1,000 元要標記，並列出可能原因。</textarea></label><label class="lbl">資料夾<select class="fld" id="pj-folder">${Object.entries(FOLDERS).filter(([id,f])=>!f.sens).map(([id,f])=>`<option value="${id}">${f.name}</option>`).join('')}</select></label>`;
  foot=`<button class="btn ghost" data-act="modal-close">取消</button><button class="btn" data-act="proj-save">建立專案</button>`;
 }
 if(m.type==='sched'){
  h=`<h3>新增排程</h3><label class="lbl">名稱<input class="fld" id="sc-name" value="每月月結報表"></label><div class="row2"><label class="lbl">頻率<select class="fld" id="sc-freq"><option>每天</option><option>每週一</option><option selected>每月 5 日</option></select></label><label class="lbl">時間<select class="fld" id="sc-time"><option>08:00</option><option selected>09:00</option><option>18:00</option></select></label></div><label class="lbl">要做什麼<textarea class="fld" id="sc-prompt" rows="3">讀取「發票_2026Q3」資料夾，產出上月發票彙整表，異常項目標紅，完成後提醒我覆核。</textarea></label>`;
  foot=`<button class="btn ghost" data-act="modal-close">取消</button><button class="btn" data-act="sched-save">建立排程</button>`;
 }
 return `<div class="modal-bg" data-act="modal-bg"><div class="modal" role="dialog" aria-modal="true"><button class="x" data-act="modal-close" aria-label="關閉">×</button>${h}${foot?`<div class="foot">${foot}</div>`:''}</div></div>`;
}

/* ========== 任務執行 ========== */
function pickScenario(p){
 for(const id of ['delete','dunning','slides','word','compare','bank','invoices'])if(SCEN[id].re.test(p))return SCEN[id];
 return SCEN.generic;
}
function sendPrompt(){
 const p=S.prompt.trim();
 if(!p){toast('請先輸入內容，或點下方的建議卡片');return}
 if(S.mode==='chat'){chatSend(p);return}
 if(S.view==='task'&&S.active){ // 追問
  const k=S.tasks.find(x=>x.id===S.active);
  if(k&&k.status==='done'){k.msgs.push({r:'u',t:p});S.prompt='';renderSim();emit('followup');
   setTimeout(()=>{k.msgs.push({r:'c',t:'收到！我會依你的補充調整並更新輸出檔案。<br><small style="color:var(--muted)">（教學模擬：此處不會真的修改檔案）</small>'});renderSim()},800);return}
  if(k&&(k.status==='running')){toast('Claude 還在工作中，等這個任務完成再追問');return}
 }
 const sc=pickScenario(p);
 const k={id:++_uid,title:p.length>16?p.slice(0,16)+'…':p,prompt:p,folder:S.folder,sc,status:'plan',steps:[],msgs:[{r:'u',t:p}],out:[],_i:0,pending:null};
 S.tasks.unshift(k);S.active=k.id;S.view='task';S.prompt='';
 const f=S.folder?FOLDERS[S.folder]:null;
 let block=null;
 if(f&&f.sens)block={t:`⚠ 我看到授權的「${f.name}」含有薪資單與身分證，和這個任務無關。<b>建議改授權較小、較單純的資料夾</b>，再重新送出。`,ev:'send_sensitive'};
 else if(sc.id!=='dunning'&&sc.id!=='generic'&&!f)block={t:'我還沒有任何資料夾的存取權限。請先<b>選擇資料夾</b>，我才能讀取資料。',ev:'send_no_folder'};
 else if(sc.folder&&S.folder!==sc.folder)block={t:`這個任務需要「${FOLDERS[sc.folder].name}」的資料，但目前授權的是「${f.name}」，裡面沒有相關檔案。請改選資料夾後重新送出。`,ev:'send_mismatch'};
 if(block){k.status='blocked';S.prompt=p;k.msgs.push({r:'c',t:block.t,btn:[{act:'folder-open',l:'選擇資料夾'}]});renderSim();emit(block.ev);return}
 runTask(k);
}
function runTask(k){
 let sc=k.sc,variant=sc.id;
 let steps=sc.steps.map(s=>({...s}));
 if(sc.id==='dunning'){
  if(S.conn.gmail){variant='dunning_gmail';steps[2].t='在 Gmail 建立 3 封草稿（不會自動寄出）';k.out=[{name:'Gmail 草稿 ×3',type:'gmail',pv:'gmail'}]}
  else{steps[2].t='沒有連接 Gmail，改存成檔案：催款信草稿.md';k.out=[{name:'催款信草稿.md',type:'md',pv:'dunning'}]}
 }else k.out=sc.out.map(o=>({...o}));
 k.variant=variant;k.steps=steps.map(s=>({t:s.t,st:'todo',perm:s.perm}));k.status='running';k._i=0;
 k.msgs.push({r:'c',t:'好的，我先擬定計畫，再依序執行。你可以隨時在右側「<b>進度</b>」看到我做到哪一步。'});
 renderSim();emit('task_started:'+sc.id);
 advance(k);
}
function advance(k){
 if(!S.tasks.includes(k))return;
 if(k._i>=k.steps.length)return finish(k);
 const st=k.steps[k._i];st.st='run';renderSim();
 setTimeout(()=>{
  if(!S.tasks.includes(k))return;
  if(st.perm&&S.pmode!=='manual'&&st.perm.kind!=='delete'){
   k.msgs.push({r:'c',t:'<small style="color:var(--muted)">（'+(S.pmode==='auto'?'自動':'全部略過')+'模式：已自動批准「'+st.perm.text+'」）</small>'});st.st='done';k._i++;renderSim();emit('perm_auto:'+st.perm.kind);advance(k);return}
  if(st.perm){k.pending={i:k._i};k.msgs.push({r:'perm',perm:st.perm,state:'ask'});renderSim();emit('perm_asked:'+st.perm.kind);return}
  st.st='done';k._i++;renderSim();advance(k);
 },1000);
}
function respondPerm(ok){
 const k=S.tasks.find(x=>x.id===S.active);if(!k||!k.pending)return;
 const m=[...k.msgs].reverse().find(x=>x.r==='perm'&&x.state==='ask');if(!m)return;
 const kind=m.perm.kind,st=k.steps[k.pending.i];
 m.state=ok?'allow':'deny';k.pending=null;k.denied=k.denied||{};k.denied[kind]=!ok;
 st.st=ok?'done':'skip';k._i++;
 if(!ok&&kind==='delete'){k.steps.slice(k._i).forEach(s=>s.st='skip');k._i=k.steps.length}
 renderSim();emit((ok?'perm_allowed:':'perm_denied:')+kind);
 if(ok&&kind==='delete')toast('⚠ 在真實環境中，刪除後可能無法復原。沒備份時請拒絕。','warn');
 setTimeout(()=>advance(k),400);
}
function finish(k){
 k.status='done';const v=k.variant,d=k.denied||{};
 const files=k.out.length?{r:'files',f:k.out}:null;
 const T2={
  invoices:`<b>完成了！</b>我整理了 12 張發票，產出：<ul><li>發票彙整_2026Q3.xlsx：日期、廠商、統編、金額</li><li>異常清單.md：2 張缺統編、1 張金額與品項不符</li></ul>${d.rename?'你拒絕了重新命名，所以原檔名維持不變。<br>':'已把檔名統一改為「日期_廠商_金額」。<br>'}建議你<b>先點開 Excel 抽查幾列</b>，再正式使用。`,
  bank:'<b>完成了！</b>共比對 3 個月的交易，找到 <b>3 筆未達帳</b>（匯款在途、手續費、未兌現支票）。請抽查並對照原始單據。',
  dunning:'<b>完成了。</b>目前沒有連接 Gmail，所以我把催款信存成檔案。若想直接在 Gmail 建草稿，請先到「自訂 → 連接器」連接 Gmail。',
  dunning_gmail:'<b>完成了！</b>我在 Gmail 建立了 <b>3 封草稿</b>，<b>都還沒寄出</b>。請逐封檢查金額與語氣，確認後再自行寄出。',
  delete:d.delete?'好的，<b>我沒有刪除任何檔案</b>。已把待刪除清單存成檔案，確認備份後你可以再決定。':'已刪除 47 個檔案。<br><small style="color:var(--warn)">（真實環境中這類操作可能無法復原，下次請先備份。）</small>',
  compare:'<b>完成了！</b>我做好 <b>報價比較表.xlsx</b>：小計和合計用的是<b>真正的 Excel 公式</b>，最便宜的一家已標色。請點開檢查公式與數字。',
  word:'<b>完成了！</b>我整理好 <b>週會紀要.docx</b>：標題、決議事項、待辦事項（負責人與期限）。語氣與內容請你讀過再使用。',
  slides:'<b>完成了！</b>我做好 5 頁簡報 <b>月報簡報.pptx</b>：每頁一個重點。請逐頁核對數字與用字。',
  generic:'<b>完成了！</b>我已讀取資料夾並整理出摘要（教學模擬）。'
 };
 if(v==='delete'&&!d.delete)k.out=[];
 k.msgs.push({r:'c',t:T2[v]||T2.generic,btn:v==='dunning'?[{act:'goto-conn',l:'前往連接器'}]:null});
 if(k.out.length)k.msgs.push({r:'files',f:k.out});
 renderSim();emit('task_done:'+v);
}

/* ========== 事件委派 ========== */
const ACT={
 noop(){toast('教學模擬版：此選單不可用')},
 lang(){S.lang=S.lang==='en'?'zh':'en';renderSim()},
 'rp-toggle'(el){S.rp[el.dataset.k]=!S.rp[el.dataset.k];renderSim()},
 'safe-tip'(){S.modal={type:'safe'};renderSim()},
 'goto-plugins'(){S.mode='cowork';S.view='customize';S.ctab='plugins';emit('nav_customize');renderSim()},
 'output-menu'(){S.modal={type:'output'};renderSim()},
 'output-pick'(el){S.output=el.dataset.o||null;if(S.output)toast('Output：'+S.output+'（Beta 功能，以你的版本為準）','ok');renderSim()},
 'effort-cycle'(){S.effort={Low:'Medium',Medium:'High',High:'Low'}[S.effort];toast('強度：'+S.effort,'ok');emit('model_pick');renderSim()},
 attach(){toast('＋ 可附加檔案或圖片。在 Cowork 裡，改用「選擇資料夾」授權整個資料夾')},
 'model-menu'(){S.modal={type:'model'};renderSim()},
 'model-pick'(el){S.model=el.dataset.m;emit('model_pick');renderSim()},
 'effort-pick'(el){S.effort=el.dataset.e;emit('model_pick');renderSim()},
 'chat-q'(el){S.prompt=el.dataset.q;chatSend(S.prompt)},
 pmode(){
  S.pmode={manual:'auto',auto:'skip',skip:'manual'}[S.pmode];
  toast(S.pmode==='manual'?'手動核准：每個重要動作都會問你（新手建議）':S.pmode==='auto'?'自動：Claude 先做安全檢查，再自動批准':'全部略過：不再詢問（最危險）。但永久刪除檔案仍然會問你','ok');
  emit('pmode_'+S.pmode);renderSim();
 },
 mode(el){S.mode=el.dataset.m;emit('mode_'+S.mode);renderSim()},
 nav(el){S.mode='cowork';S.view=el.dataset.v;emit('nav_'+(S.view==='home'?'new':S.view));renderSim()},
 'open-task'(el){S.mode='cowork';S.view='task';S.active=+el.dataset.id;renderSim()},
 'folder-open'(){S.modal={type:'folder',peek:null};emit('folder_chip');emit('folder_picker_open');renderSim()},
 peek(el){S.modal={type:'folder',peek:el.dataset.id};emit('folder_peek:'+el.dataset.id);renderSim()},
 'folder-pick'(el){
  const id=el.dataset.id;S.folder=id;S.modal=null;emit('folder_selected:'+id);
  if(FOLDERS[id].sens)toast('⚠ 已授權含敏感資料的資料夾。與任務無關的資料不該授權！','warn');
  else toast('已授權資料夾：'+FOLDERS[id].name,'ok');
  renderSim();
 },
 'modal-close'(){S.modal=null;renderSim()},
 'modal-bg'(el,e){if(e.target===el){S.modal=null;renderSim()}},
 sugg(el){const s=SUGG.find(x=>x.id===el.dataset.id);S.prompt=s.p;emit('sugg:'+s.id);renderSim();const c=$('#composer');if(c)c.focus()},
 send(){sendPrompt()},
 perm(el){respondPerm(el.dataset.ok==='1')},
 'file-open'(el){S.modal={type:'file',pv:el.dataset.pv,name:el.dataset.name,ftype:el.dataset.type};emit('file_open:'+el.dataset.type);renderSim()},
 ctab(el){S.ctab=el.dataset.t;renderSim()},
 'conn-on'(el){S.modal={type:'oauth',id:el.dataset.id};renderSim()},
 'oauth-ok'(el){const id=el.dataset.id;S.conn[id]=true;S.modal=null;emit('connector_on:'+id);toast('已連接 '+CONNECTORS.find(c=>c.id===id).name,'ok');renderSim()},
 'conn-off'(el){S.conn[el.dataset.id]=false;emit('connector_off:'+el.dataset.id);renderSim()},
 'plug-detail'(el){S.plugOpen[el.dataset.id]=!S.plugOpen[el.dataset.id];renderSim()},
 'plug-on'(el){
  const p=PLUGINS.find(x=>x.id===el.dataset.id);S.plugins[p.id]=true;
  p.skills.forEach(s=>{if(!S.skills.some(x=>x.id===s.id))S.skills.push({...s,on:true,src:'外掛：'+p.name})});
  emit('plugin_on:'+p.id);toast('已安裝外掛：'+p.name,'ok');renderSim();
 },
 'plug-off'(el){const p=PLUGINS.find(x=>x.id===el.dataset.id);S.plugins[p.id]=false;S.skills=S.skills.filter(s=>!p.skills.some(x=>x.id===s.id));renderSim()},
 'skill-toggle'(el){const s=S.skills.find(x=>x.id===el.dataset.id);s.on=!s.on;emit('skill_toggle');renderSim()},
 'skill-new'(){S.modal={type:'skill'};renderSim()},
 'skill-save'(){
  const n=$('#sk-name').value.trim(),b=$('#sk-body').value.trim();
  if(!n||!b){toast('名稱和做法說明都要填','warn');return}
  S.skills.push({id:'u'+Date.now(),name:n,desc:b.slice(0,40)+'…',on:true,src:'我建立的'});S.modal=null;S.ctab='skills';
  emit('skill_created');toast('Skill 已建立：'+n,'ok');renderSim();
 },
 'proj-new'(){S.modal={type:'project'};renderSim()},
 'proj-save'(){
  const n=$('#pj-name').value.trim(),b=$('#pj-inst').value.trim();
  if(!n||!b){toast('名稱和說明都要填','warn');return}
  S.projects.push({id:'p'+Date.now(),name:n,inst:b,folder:$('#pj-folder').value});S.modal=null;emit('project_created');toast('專案已建立：'+n,'ok');renderSim();
 },
 'proj-open'(el){const p=S.projects[+el.dataset.i];S.folder=p.folder;S.mode='cowork';S.view='home';S.prompt='（套用專案「'+p.name+'」的說明：'+p.inst+'）請整理資料夾裡的發票成 Excel。';emit('project_open');toast('已帶入專案的資料夾與說明','ok');renderSim()},
 'sched-new'(){S.modal={type:'sched'};renderSim()},
 'sched-save'(){
  const n=$('#sc-name').value.trim(),p=$('#sc-prompt').value.trim();
  if(!n||!p){toast('名稱和內容都要填','warn');return}
  S.schedules.push({name:n,freq:$('#sc-freq').value,time:$('#sc-time').value,prompt:p,on:true});S.modal=null;
  emit('schedule_created');toast('排程已建立：'+n,'ok');renderSim();
 },
 'sched-toggle'(el){const s=S.schedules[+el.dataset.i];s.on=!s.on;renderSim()},
 'goto-conn'(){S.view='customize';S.ctab='connectors';renderSim()}
};
