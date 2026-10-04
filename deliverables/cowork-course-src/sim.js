/* ========== 模擬器狀態 ========== */
const S={mode:'cowork',view:'home',ctab:'skills',folder:null,peek:null,modal:null,prompt:'',tasks:[],active:null,
 conn:{},plugins:{},plugOpen:{},
 skills:[{id:'inv',name:'發票整理',desc:'依公司規則辨識發票欄位並命名',on:true,src:'內建'},{id:'acct',name:'會計科目對照',desc:'把摘要對應到公司會計科目',on:false,src:'內建'}],
 schedules:[]};
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
const simChrome=()=>`<div class="sim-chrome"><div class="dots"><i></i><i></i><i></i></div><div class="modes" role="tablist">${[['chat','Chat'],['cowork','Cowork'],['code','Code']].map(m=>`<button role="tab" aria-selected="${S.mode===m[0]}" class="${S.mode===m[0]?'on':''}" data-act="mode" data-m="${m[0]}">${m[1]}</button>`).join('')}</div><div class="sim-badge" title="介面為教學仿製，實際畫面以你的版本為準">教學模擬版</div></div>`;
const sidebar=()=>`<aside class="sb">
 <button class="sb-new" data-act="nav" data-v="home">${IC.plus}<span>新任務</span></button>
 <button class="sb-i ${S.view==='scheduled'?'on':''}" data-act="nav" data-v="scheduled">${IC.clock}<span>排程</span></button>
 <button class="sb-i ${S.view==='customize'?'on':''}" data-act="nav" data-v="customize">${IC.book}<span>自訂</span></button>
 <div class="sb-h">最近的任務</div>
 ${S.tasks.length?S.tasks.map(k=>`<button class="sb-t ${S.view==='task'&&S.active===k.id?'on':''}" data-act="open-task" data-id="${k.id}"><i class="dot ${k.status}"></i><span>${esc(k.title)}</span></button>`).join(''):'<p class="sb-empty">還沒有任務</p>'}
 <div class="sb-foot"><b>學員</b>教學模擬環境<br>不會動到真實檔案</div></aside>`;

function main(){
 if(S.mode==='chat')return modeNote('chat','Chat：一般對話','適合問答、寫作、解釋概念。它不會替你讀取電腦資料夾，也不會自動產出一整包檔案。','例：請用白話解釋「收入認列五步驟」');
 if(S.mode==='code')return modeNote('code','Code：寫程式','給工程師寫程式、改專案用。會計同仁日常整理資料，通常用不到這裡。','例：幫我修改這個 Python 腳本');
 if(S.view==='scheduled')return schedView();
 if(S.view==='customize')return customView();
 if(S.view==='task')return taskView();
 return homeView();
}
const modeNote=(ic,h,p,ex)=>`<div class="modeNote">${IC[ic]}<h2>${h}</h2><p>${p}</p><div class="bubble">${ex}</div><button class="chip pri" data-act="mode" data-m="cowork">切到 Cowork 交辦任務</button></div>`;

function homeView(){
 const f=S.folder?FOLDERS[S.folder]:null;
 return `<div class="home"><div class="hello">${IC.spark}<h1>想請 Claude 幫你處理什麼？</h1></div>
 <div class="composer"><textarea id="composer" placeholder="描述你要完成的任務…（Enter 送出，Shift+Enter 換行）">${esc(S.prompt)}</textarea>
 <div class="comp-bar"><button class="chip ${f?'fold':''}" data-act="folder-open">${IC.folder}<span>${f?esc(f.name):'選擇資料夾'}</span></button><button class="chip ghost" data-act="noop">Claude ▾</button><span class="grow"></span><button class="send" data-act="send" aria-label="送出">${IC.send}</button></div></div>
 <div class="sugg-h">不知道從哪開始？點一張卡片，指令會自動填入輸入框：</div>
 <div class="sugg">${SUGG.map(s=>`<button class="sg ${s.dg?'dg':''}" data-act="sugg" data-id="${s.id}">${IC[s.ic]}<b>${s.t}</b><small>${s.s}</small></button>`).join('')}</div></div>`;
}

function taskView(){
 const k=S.tasks.find(x=>x.id===S.active);if(!k)return homeView();
 const f=k.folder?FOLDERS[k.folder]:null;
 const newFiles=k.status==='done'?k.out:[];
 return `<div class="task"><div class="chat" id="chat"><div class="t-title">${esc(k.title)}</div>${k.msgs.map(m=>msgHtml(m,k)).join('')}
 <div class="fup"><textarea id="composer" placeholder="追問或補充…" aria-label="追問">${esc(S.prompt)}</textarea><button class="send" data-act="send" aria-label="送出">${IC.send}</button></div></div>
 <aside class="rp"><section><h4>進度</h4>${k.steps.length?`<ol class="prog">${k.steps.map(s=>`<li class="${s.st}"><i>${s.st==='done'?IC.check:s.st==='skip'?'—':s.st==='run'?'<b class="spin"></b>':''}</i><span>${s.t}</span></li>`).join('')}</ol>`:'<p style="font-size:13px;color:var(--muted)">尚未開始</p>'}</section>
 <section><h4>工作資料夾</h4>${f?`<div class="ff"><div><b>${esc(f.name)}</b></div>${f.files.slice(0,5).map(n=>`<div>${esc(n)}</div>`).join('')}${f.count>5?`<div>…共 ${f.count} 個檔案</div>`:''}${newFiles.map(o=>`<div class="new">+ ${esc(o.name)}</div>`).join('')}</div>`:'<p style="font-size:13px;color:var(--muted)">未選擇資料夾</p>'}</section>
 <section><h4>情境</h4><div class="ff"><div>${CONNECTORS.filter(c=>S.conn[c.id]).map(c=>`<span class="tag ok">${c.name}</span>`).join(' ')||'未連接任何服務'}</div><div>${S.skills.filter(s=>s.on).length} 個技能啟用中</div></div></section></aside></div>`;
}
function msgHtml(m,k){
 if(m.r==='u')return `<div class="m-u">${esc(m.t)}</div>`;
 if(m.r==='c')return `<div class="m-c"><span class="av">${IC.spark}</span><div>${m.t}${m.btn?`<div class="m-btns">${m.btn.map(b=>`<button class="chip pri" data-act="${b.act}">${b.l}</button>`).join('')}</div>`:''}</div></div>`;
 if(m.r==='files')return `<div class="m-files">${m.f.map(f=>`<button class="fchip" data-act="file-open" data-type="${f.type}" data-pv="${f.pv}" data-name="${esc(f.name)}">${IC[f.type==='xlsx'?'sheet':f.type==='gmail'?'mail':'file']}<span>${esc(f.name)}</span></button>`).join('')}</div>`;
 if(m.r==='perm'){const p=m.perm;return `<div class="perm ${p.danger?'danger':''} ${m.state}"><div class="perm-h">${IC[p.danger?'warn':'shield']}<b>Claude 請求你的許可</b></div><p><b>${p.text}</b></p><small>${p.detail}</small>${m.state==='ask'?`<div class="perm-b"><button class="chip" data-act="perm" data-ok="0">拒絕</button><button class="chip pri" data-act="perm" data-ok="1">允許</button></div>`:`<div class="perm-r">${m.state==='allow'?'✓ 你已允許':'✕ 你已拒絕'}</div>`}</div>`}
 return '';
}

function customView(){
 const tabs=[['skills','技能'],['connectors','連接器'],['plugins','外掛']];
 let body='';
 if(S.ctab==='skills')body=`<div class="list">${S.skills.map(s=>`<div class="item"><div class="ic">${IC.book}</div><div class="mid"><b>${esc(s.name)}</b> <span class="tag">${esc(s.src)}</span><small>${esc(s.desc)}</small></div><button class="sw ${s.on?'on':''}" role="switch" aria-checked="${s.on}" aria-label="啟用 ${esc(s.name)}" data-act="skill-toggle" data-id="${s.id}"></button></div>`).join('')}</div><div><button class="chip pri" data-act="skill-new">${IC.plus}建立 Skill</button></div>`;
 if(S.ctab==='connectors')body=`<div class="list">${CONNECTORS.map(c=>`<div class="item"><div class="ic">${IC[c.ic]}</div><div class="mid"><b>${c.name}</b><small>${c.desc}</small></div>${S.conn[c.id]?`<span class="tag ok">已連接</span><button class="chip" data-act="conn-off" data-id="${c.id}">中斷</button>`:`<button class="chip pri" data-act="conn-on" data-id="${c.id}">連接</button>`}</div>`).join('')}</div>`;
 if(S.ctab==='plugins')body=`<div class="list">${PLUGINS.map(p=>`<div class="item"><div class="ic">${IC[p.ic]}</div><div class="mid"><b>${p.name}</b><small>${p.desc}</small>${S.plugOpen[p.id]?`<div class="det">${p.items.map(i=>`<div>・${i}</div>`).join('')}<div style="color:var(--muted)">（教學示意內容）</div></div>`:''}<button class="mini" style="margin-top:4px" data-act="plug-detail" data-id="${p.id}">${S.plugOpen[p.id]?'收合':'查看內容'}</button></div>${S.plugins[p.id]?`<span class="tag ok">已安裝</span><button class="chip" data-act="plug-off" data-id="${p.id}">移除</button>`:`<button class="chip pri" data-act="plug-on" data-id="${p.id}">安裝</button>`}</div>`).join('')}</div>`;
 return `<div class="cust"><h2>自訂</h2><div class="tabs">${tabs.map(t=>`<button class="${S.ctab===t[0]?'on':''}" data-act="ctab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>${body}</div>`;
}
function schedView(){
 return `<div class="sched"><h2>排程任務</h2><div class="note">排程任務在你的電腦上執行：電腦需開機、App 需開著才會跑（實際規則以你的版本說明為準）。</div>
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
  h=`<h3>${IC[m.ftype==='xlsx'?'sheet':m.ftype==='gmail'?'mail':'file']} ${esc(m.name)}</h3>${body}<p style="font-size:13px;color:var(--green);background:var(--green-soft);border-radius:8px;padding:6px 10px">專業提醒：AI 的產出是初稿，請抽查數字並對照原始單據再使用。</p>`;
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
 if(m.type==='sched'){
  h=`<h3>新增排程</h3><label class="lbl">名稱<input class="fld" id="sc-name" value="每月月結報表"></label><div class="row2"><label class="lbl">頻率<select class="fld" id="sc-freq"><option>每天</option><option>每週一</option><option selected>每月 5 日</option></select></label><label class="lbl">時間<select class="fld" id="sc-time"><option>08:00</option><option selected>09:00</option><option>18:00</option></select></label></div><label class="lbl">要做什麼<textarea class="fld" id="sc-prompt" rows="3">讀取「發票_2026Q3」資料夾，產出上月發票彙整表，異常項目標紅，完成後提醒我覆核。</textarea></label>`;
  foot=`<button class="btn ghost" data-act="modal-close">取消</button><button class="btn" data-act="sched-save">建立排程</button>`;
 }
 return `<div class="modal-bg" data-act="modal-bg"><div class="modal" role="dialog" aria-modal="true"><button class="x" data-act="modal-close" aria-label="關閉">×</button>${h}${foot?`<div class="foot">${foot}</div>`:''}</div></div>`;
}

/* ========== 任務執行 ========== */
function pickScenario(p){
 for(const id of ['delete','dunning','bank','invoices'])if(SCEN[id].re.test(p))return SCEN[id];
 return SCEN.generic;
}
function sendPrompt(){
 const p=S.prompt.trim();
 if(!p){toast('請先輸入任務內容，或點下方的建議卡片');return}
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
