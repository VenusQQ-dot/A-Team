/* End-to-end 驗證：node deliverables/tests/e2e.js
 * 需要 playwright 與 Chromium（PW_CHROMIUM 可指定瀏覽器路徑）。結束碼：0 全過、1 有失敗。 */
const path=require('path'),fs=require('fs'),cp=require('child_process'),crypto=require('crypto');
let pw;for(const m of ['playwright','/opt/node22/lib/node_modules/playwright']){try{pw=require(m);break}catch(e){}}
if(!pw){console.error('找不到 playwright');process.exit(2)}
const ROOT=path.resolve(__dirname,'..');
const FILE='file://'+path.join(ROOT,'claude-cowork-basics.html');
const CHROME=process.env.PW_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium')?'/opt/pw-browsers/chromium':undefined);
const results=[];let browser;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function check(name,fn){
 const t0=Date.now();
 try{await fn();results.push({name,ok:true,ms:Date.now()-t0});console.log('  PASS',name)}
 catch(e){results.push({name,ok:false,err:String(e.message||e).split('\n')[0]});console.log('  FAIL',name,'→',String(e.message||e).split('\n')[0])}
}
const eq=(a,b,msg)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(`${msg||'不相等'}：預期 ${JSON.stringify(b)}，實際 ${JSON.stringify(a)}`)};
const ok=(c,msg)=>{if(!c)throw new Error(msg||'條件不成立')};
async function open(q='',o={}){
 const ctx=await browser.newContext({viewport:o.vp||{width:1440,height:900},reducedMotion:o.rm,acceptDownloads:true});
 if(o.init)await ctx.addInitScript(o.init);
 const p=await ctx.newPage();p.errs=[];p.ext=[];
 p.on('pageerror',e=>p.errs.push('pageerror: '+e.message));
 p.on('console',m=>{if(m.type()==='error')p.errs.push('console: '+m.text())});
 p.on('request',r=>{const u=r.url();if(!/^(file|data|blob|about):/.test(u))p.ext.push(u)});
 p.on('dialog',d=>d.accept());
 await p.goto(FILE+q);await p.waitForTimeout(250);
 p.close2=()=>ctx.close();
 return p;
}
const noErr=p=>eq(p.errs,[],'瀏覽器錯誤');
const txt=(p,s)=>p.locator(s).first().innerText();
const cnt=(p,s)=>p.locator(s).count();
const click=(p,s)=>p.locator(s).first().click({timeout:5000});

(async()=>{
 browser=await pw.chromium.launch({executablePath:CHROME});

 console.log('\n[1] 載入與靜態完整性');
 await check('頁面載入、標題、無錯誤、無外部連線',async()=>{
  const p=await open();eq(await p.title(),'Claude Cowork 基礎入門班');noErr(p);eq(p.ext,[],'外部請求');
  eq(await p.evaluate(()=>document.body.dataset.view),'map','預設檢視');await p.close2();
 });
 await check('重新建置後檔案內容一致（原始碼 = 交付檔）',async()=>{
  const f=path.join(ROOT,'claude-cowork-basics.html');const h1=crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  cp.execFileSync('python3',[path.join(ROOT,'cowork-course-src','build.py')],{stdio:'pipe'});
  const h2=crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');eq(h1,h2,'重新建置後雜湊');
 });
 await check('內容文字檢查：無過時說法、無英文 Prompt 標籤、無 undefined/NaN',async()=>{
  const h=fs.readFileSync(path.join(ROOT,'claude-cowork-basics.html'),'utf8');
  for(const bad of ['Opus 5.5','Sonnet 5.5','Haiku 4.5','電腦需開機、App 需開著才會跑','電腦要開著、App 要在執行','Prompt 組裝器','ACCT 內部教學','計程車跳錶','書桌大小','TAP ANYTHING'])ok(!h.includes(bad),'含有不該出現的字：'+bad);
  const p=await open('?view=learn');
  for(const v of ['map','layers','overview','gloss','learn']){await p.evaluate(v=>setView(v),v);await p.waitForTimeout(150);const t=await p.evaluate(()=>document.body.innerText);for(const b of ['undefined','NaN','[object'])ok(!t.includes(b),`${v} 檢視出現 ${b}`)}
  noErr(p);await p.close2();
 });

 await check('Claude Code 不教：單元 1 只教 Chat 與 Cowork，辭典沒有 Code 條目，只留一句說明',async()=>{
  const p=await open('?view=learn');
  const r=await p.evaluate(()=>({cards:JSON.stringify(UNITS[0].cards),opts:MATCH.modes.opts,steps:UNITS[0].steps.length,gloss:GLOSS.some(g=>g.id==='code'),quiz:JSON.stringify(UNITS[0].quiz),vid:VIDEOS[1].map(s=>s.html).join('')}));
  ok(!r.cards.includes('Code'),'卡片還有 Code');eq(r.opts,['Chat','Cowork']);eq(r.steps,4,'單元 1 步驟數');ok(!r.gloss,'辭典還有 Code 條目');ok(!r.quiz.includes('Code'),'測驗還有 Code');ok(!r.vid.includes('Code'),'影片畫面還有 Code');
  await p.evaluate(()=>{S.mode='code';renderSim()});ok((await txt(p,'.modeNote h2')).includes('不教'),'Code 畫面沒有說明不教');
  noErr(p);await p.close2();
 });

 console.log('\n[2] 皮膚與模擬器隔離');
 await check('四套皮膚可切換，模擬器固定 Claude 風格',async()=>{
  const p=await open('?view=learn');
  for(const s of ['candy','paper','arcade','forest']){
   await click(p,`.skins [data-s="${s}"]`);eq(await p.evaluate(()=>document.body.dataset.skin),s);
   const v=await p.evaluate(()=>{const c=getComputedStyle(document.querySelector('.sim'));return [c.getPropertyValue('--accent').trim(),c.getPropertyValue('--card').trim()]});
   eq(v,['#D97757','#FFFFFF'],`${s} 下模擬器色票`);
  }
  noErr(p);await p.close2();
 });

 console.log('\n[3] 心智圖');
 await check('5 張心智圖：全展開無重疊、全收合、單點展開、縮放、看全面',async()=>{
  const p=await open('?view=map');
  const n=await cnt(p,'.mtab');eq(n,5,'心智圖數量');
  for(let i=0;i<n;i++){
   await p.locator('.mtab').nth(i).click();await p.waitForTimeout(150);
   await click(p,'[data-act="mm-all"]');await p.waitForTimeout(200);
   const nodes=await p.evaluate(()=>[...document.querySelectorAll('.mn')].map(e=>({l:e.offsetLeft,t:e.offsetTop,h:e.offsetHeight})));
   ok(nodes.length>=10,`第 ${i+1} 張節點太少：${nodes.length}`);
   const col={};nodes.forEach(x=>(col[x.l]=col[x.l]||[]).push(x));
   for(const k of Object.keys(col)){const a=col[k].sort((x,y)=>x.t-y.t);for(let j=1;j<a.length;j++)ok(a[j].t>=a[j-1].t+a[j-1].h-2,`第 ${i+1} 張同欄節點重疊`)}
   await click(p,'[data-act="mm-none"]');await p.waitForTimeout(150);
   const c1=await cnt(p,'.mn');await p.evaluate(()=>{const m=MAPS[MM.map].root.kids[0];mmToggle(m.id)});await p.waitForTimeout(100);
   const hasKids=await p.evaluate(()=>!!(MAPS[MM.map].root.kids[0].kids||[]).length);if(hasKids)ok(await cnt(p,'.mn')>c1,'單點展開沒有增加節點');
  }
  const s0=await p.evaluate(()=>MM.scale);await click(p,'[data-act="mm-zoom"][data-f="1.2"]');ok(await p.evaluate(()=>MM.scale)>s0,'放大無效');
  await click(p,'[data-act="mm-zoom"][data-f="0.83"]');await click(p,'[data-act="mm-fit"]');ok(await p.evaluate(()=>MM.scale)>0.2,'看全面縮放異常');
  noErr(p);await p.close2();
 });
 await check('心智圖拖曳平移與雙指/滾輪縮放',async()=>{
  const p=await open('?view=map');const b=await p.locator('#mmv').boundingBox();
  const t0=await p.evaluate(()=>[MM.tx,MM.ty]);
  await p.mouse.move(b.x+60,b.y+60);await p.mouse.down();await p.mouse.move(b.x+160,b.y+120,{steps:5});await p.mouse.up();
  const t1=await p.evaluate(()=>[MM.tx,MM.ty]);ok(t1[0]>t0[0]+50&&t1[1]>t0[1]+30,'拖曳沒有位移');
  const s0=await p.evaluate(()=>MM.scale);await p.mouse.move(b.x+300,b.y+300);await p.keyboard.down('Control');await p.mouse.wheel(0,-200);await p.keyboard.up('Control');
  ok(await p.evaluate(()=>MM.scale)>s0,'Ctrl+滾輪縮放無效');noErr(p);await p.close2();
 });
 await check('所有「去練習」連結都指向存在的單元，且能跳轉',async()=>{
  const p=await open('?view=map');
  const bad=await p.evaluate(()=>Object.values(NODES).filter(n=>n.go&&!UNITS.some(u=>u.id===n.go.u)).map(n=>n.t));eq(bad,[],'失效連結');
  await p.evaluate(()=>gotoUnit(3));eq(await p.evaluate(()=>[document.body.dataset.view,UNITS[Course.cur].id,Course.slide]),['learn',3,2]);
  await p.evaluate(()=>setView('map'));await p.evaluate(()=>focusNode('folder'));eq(await p.evaluate(()=>[document.body.dataset.view,!!NODES.folder.flash]),['map',true]);
  noErr(p);await p.close2();
 });

 console.log('\n[4] 分層卡片與全景');
 await check('分層卡片 3 層：每個區塊都能開細節並關閉',async()=>{
  const p=await open('?view=layers');
  for(let i=0;i<3;i++){
   await p.evaluate(i=>{LY.cur=i;renderLayers()},i);const n=await cnt(p,'.bk');ok(n>=6,`第 ${i+1} 層區塊太少`);
   for(let k=0;k<n;k++){await p.locator('.bk').nth(k).click();ok(await p.locator('#sheet .sh-h h3').innerText()!=='','細節沒標題');await click(p,'[data-act="sheet-close"]');ok(await p.locator('#sheet').isHidden(),'細節沒關閉')}
  }
  noErr(p);await p.close2();
 });
 await check('全景：三層＋五張心智圖入口可跳轉',async()=>{
  const p=await open('?view=overview');eq(await cnt(p,'.ovl'),4);
  await p.locator('.mapcards .bk').nth(3).click();eq(await p.evaluate(()=>[document.body.dataset.view,MM.map]),['map',3]);noErr(p);await p.close2();
 });

 console.log('\n[5] 名詞辭典');
 await check('16 個名詞、每個都有動畫、分類篩選正確',async()=>{
  const p=await open('?view=gloss');eq(await cnt(p,'.gcard'),16);eq(await cnt(p,'.gcard .ga svg'),16);
  const exp={'模式':2,'擴充':5,'產出文件':3,'安全與流程':3,'用量與模型':3};
  for(const [c,n] of Object.entries(exp)){await p.locator(`.gcats button:text-is("${c}")`).click();eq(await cnt(p,'.gcard'),n,`分類 ${c}`)}
  noErr(p);await p.close2();
 });
 await check('搜尋：中英文、同義詞、無結果、清除、標示',async()=>{
  const p=await open('?view=gloss');
  const cases=[['連接器',['MCP（連接器）','Plugin（外掛）']],['mcp',['MCP（連接器）']],['省錢',['Token','上下文視窗']],['刪除',['權限模式']],['gmail',['MCP（連接器）']],['haiku',['模型（Model）']],['skill.md',['Skill（技能）']],['白板',['上下文視窗']],['電表',['Token']],['專案',['Project（專案）']],['excel',['Excel 表']],['簡報',['簡報（PowerPoint）']],['word',['Word 文件']]];
  for(const [q,must] of cases){await p.fill('#gl-q',q);const names=await p.locator('.gcard b').allInnerTexts();for(const m of must)ok(names.includes(m),`搜「${q}」缺少 ${m}（得到 ${names}）`)}
  await p.fill('#gl-q','xyz不存在');eq(await cnt(p,'.gcard'),0);ok(await cnt(p,'.empty')>0,'沒有「找不到」提示');
  await p.fill('#gl-q','排程');ok(await cnt(p,'mark')>0,'沒有關鍵字標示');await p.fill('#gl-q','');eq(await cnt(p,'.gcard'),16);
  await p.keyboard.press('/');noErr(p);await p.close2();
 });
 await check('動畫會前進；點一下可重播；辭典連結可跳轉',async()=>{
  const p=await open('?view=gloss');const a=p.locator('.gcard[data-id="schedule"] .ga');
  const s1=await a.screenshot();await p.waitForTimeout(1400);const s2=await a.screenshot();ok(Buffer.compare(s1,s2)!==0,'動畫畫面沒有變化');
  await a.click();await p.waitForTimeout(100);
  await p.fill('#gl-q','Skill');await click(p,'.gcard [data-act="go-unit"]');eq(await p.evaluate(()=>document.body.dataset.view),'learn');
  noErr(p);await p.close2();
 });
 await check('減少動態偏好：動畫關閉',async()=>{
  const p=await open('?view=gloss',{rm:'reduce'});
  const n=await p.evaluate(()=>getComputedStyle(document.querySelector('.ga .pop')).animationName);eq(n,'none');await p.close2();
 });

 console.log('\n[6] 完整課程（一般學員路徑，不開老師模式）');
 await check('7 單元：鎖定、答錯扣分、配對、模擬器操作、結業證書、重新整理後保留、重置',async()=>{
  const SPY="const o=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){window.__dl=[this.download,this.href.slice(0,5)];return o.apply(this,arguments)}";
  const p=await open('?view=learn&skin=candy',{init:SPY});
  const next=async()=>{await click(p,'[data-act="next"]');await p.waitForTimeout(100)};
  const video=async()=>p.evaluate(()=>{const r=document.querySelector('.vseek');r.value=1000;r.dispatchEvent(new Event('input'))});
  const quiz=async(wrongFirst)=>{const ans=await p.evaluate(()=>UNITS[Course.cur].quiz.map(q=>q.a));
   for(let i=0;i<ans.length;i++){
    if(wrongFirst&&i===0){const w=(ans[0]+1)%3;await click(p,`.opt[data-q="0"][data-o="${w}"]`)}
    await click(p,`.opt[data-q="${i}"][data-o="${ans[i]}"]`)}};
  const match=async()=>{const it=await p.evaluate(()=>{const u=UNITS[Course.cur];return u.match?MATCH[u.match].items.map(x=>[x.id,x.a]):[]});for(const [id,a] of it){await p.locator(`.opt[data-i="${id}"]:not([data-o="${a}"])`).first().click();await p.locator(`.opt[data-i="${id}"][data-o="${a}"]`).click()}};
  const act={
   1:async()=>{await click(p,'[data-act="mode"][data-m="chat"]');await click(p,'[data-act="mode"][data-m="cowork"]')},
   7:async()=>{for(const v of ['projects','scheduled','customize'])await click(p,`[data-act="nav"][data-v="${v}"]`)},
   2:async()=>{await click(p,'.sb-new');await click(p,'[data-act="nav"][data-v="scheduled"]');await click(p,'[data-act="nav"][data-v="customize"]');await click(p,'.sb-new');await click(p,'[data-act="folder-open"]');await click(p,'[data-act="modal-close"]')},
   3:async()=>{await click(p,'[data-act="folder-open"]');await click(p,'[data-act="peek"][data-id="personal"]');await click(p,'[data-act="peek"][data-id="invoices"]');await click(p,'[data-act="folder-pick"]')},
   4:async()=>{await click(p,'#pb-send');await click(p,'.send');await p.waitForSelector('.perm.ask');await click(p,'[data-act="perm"][data-ok="1"]');await p.waitForSelector('.fchip',{timeout:9000});await click(p,'.fchip[data-type="xlsx"]');await click(p,'[data-act="modal-close"]')},
   8:async()=>{for(const [fid,sid,type] of [['quotes','compare','xlsx'],['meeting','word',null],['report','slides','pptx']]){await click(p,'.sb-new');await click(p,'[data-act="folder-open"]');await click(p,`[data-act="peek"][data-id="${fid}"]`);await click(p,'[data-act="folder-pick"]');await click(p,`.sg[data-id="${sid}"]`);await click(p,'.send');await p.waitForSelector('.fchip',{timeout:9000});if(type){await click(p,`.fchip[data-type="${type}"]`);await click(p,'[data-act="modal-close"]')}}},
   5:async()=>{await click(p,'[data-act="nav"][data-v="customize"]');await click(p,'[data-act="ctab"][data-t="connectors"]');await click(p,'[data-act="conn-on"][data-id="gmail"]');await click(p,'[data-act="oauth-ok"]');await click(p,'[data-act="ctab"][data-t="plugins"]');await click(p,'[data-act="plug-on"][data-id="finance"]');await click(p,'[data-act="ctab"][data-t="skills"]');await click(p,'[data-act="skill-new"]');await click(p,'[data-act="skill-save"]');await click(p,'.sb-new');await click(p,'.sg[data-id="dunning"]');await click(p,'.send');await p.waitForSelector('.fchip',{timeout:9000})},
   6:async()=>{await click(p,'[data-act="nav"][data-v="scheduled"]');await click(p,'[data-act="sched-new"]');await click(p,'[data-act="sched-save"]');await click(p,'.sb-new');await click(p,'[data-act="folder-open"]');await click(p,'[data-act="peek"][data-id="archive"]');await click(p,'[data-act="folder-pick"]');await click(p,'.sg.dg');await click(p,'.send');await p.waitForSelector('.perm.ask');await click(p,'[data-act="perm"][data-ok="0"]');await p.waitForTimeout(1200)}
  };
  // 鎖定檢查：第 1 單元未完成就想進下一單元
  await click(p,'[data-act="seg"][data-u="3"]');eq(await p.evaluate(()=>Course.cur),0,'未解鎖卻跳過去了');
  await p.evaluate(()=>Course.go(0,true,3));await next();eq(await p.evaluate(()=>[Course.cur,Course.slide]),[0,3],'未完成卻進了下一單元');
  await p.evaluate(()=>Course.go(0,true,0));
  const ORDER=[1,7,2,3,4,8,5,6];
  for(let k=0;k<ORDER.length;k++){
   const u=ORDER[k];await video();await next();await next();await match();await act[u]();await next();await quiz(k===0);
   if(k<ORDER.length-1)await next();
  }
  const fin=await p.evaluate(()=>({score:Course.score(),max:Course.max(),done:UNITS.every((_,i)=>Course.unitDone(i)),q:Course.P.quiz['1-0']}));
  eq(fin.q,2,'答錯後答對應得 2 分');eq(fin.score,fin.max-3,'總分（有一題答錯一次，應少 3 分）');ok(fin.done,'尚有單元未完成');
  // 證書
  await p.fill('#cert-name','測試學員');const [dl]=await Promise.all([p.waitForEvent('download'),click(p,'[data-act="cert"]')]);
  const spy=await p.evaluate(()=>window.__dl);ok(spy&&spy[0].includes('測試學員')&&spy[0].endsWith('.png'),'證書下載檔名屬性：'+JSON.stringify(spy));
  const f=await dl.path(),buf=fs.readFileSync(f);ok(buf.length>10000,'證書檔案太小');eq(buf.slice(1,4).toString(),'PNG','證書不是有效的 PNG');
  // 保留與重置
  await p.reload();await p.waitForTimeout(300);eq(await p.evaluate(()=>Course.score()),fin.score,'重新整理後分數');
  await click(p,'[data-act="reset"]');await p.waitForTimeout(500);eq(await p.evaluate(()=>Course.score()),0,'重置後分數');
  noErr(p);eq(p.ext,[],'外部請求');await p.close2();
 });

 console.log('\n[7] 模擬器情境');
 const sim=async(fn)=>{const p=await open('?view=learn');try{await fn(p);noErr(p)}finally{await p.close2()}};
 const send=async(p,prompt)=>{await p.evaluate(t=>{S.prompt=t;renderSim()},prompt);await click(p,'.send')};
 const INV='請整理資料夾裡的發票成 Excel';
 await check('送出前的防呆：沒選資料夾／敏感資料夾／資料夾不符',()=>sim(async p=>{
  await send(p,INV);ok((await txt(p,'.m-c')).includes('資料夾'),'沒選資料夾沒有提示');ok(await cnt(p,'.m-btns .chip')>0,'沒有「選擇資料夾」按鈕');
  await p.evaluate(()=>{S.folder='personal';S.view='home';renderSim()});await send(p,INV);ok((await p.locator('.m-c').last().innerText()).includes('薪資'),'敏感資料夾沒有警告');
  await p.evaluate(()=>{S.folder='bank';S.view='home';renderSim()});await send(p,INV);ok((await p.locator('.m-c').last().innerText()).includes('發票_2026Q3'),'資料夾不符沒有提示');
 }));
 await check('發票整理：允許路徑，產出 Excel 與異常清單可預覽',()=>sim(async p=>{
  await p.evaluate(()=>{S.folder='invoices';renderSim()});await send(p,INV);await p.waitForSelector('.perm.ask',{timeout:8000});await click(p,'[data-act="perm"][data-ok="1"]');await p.waitForSelector('.fchip',{timeout:9000});
  await p.locator('.fchip[data-type="xlsx"]').click();ok((await txt(p,'.modal')).includes('缺統編'),'Excel 預覽缺異常列');await click(p,'[data-act="modal-close"]');
  await p.locator('.fchip[data-type="md"]').click();ok((await txt(p,'.modal')).includes('異常清單'),'異常清單預覽');
 }));
 await check('發票整理：拒絕路徑，保留原檔名',()=>sim(async p=>{
  await p.evaluate(()=>{S.folder='invoices';renderSim()});await send(p,INV);await p.waitForSelector('.perm.ask');await click(p,'[data-act="perm"][data-ok="0"]');await p.waitForSelector('.fchip',{timeout:9000});
  ok((await p.locator('.m-c').last().innerText()+await p.locator('.chat').innerText()).includes('原檔名維持不變'));
 }));
 await check('銀行對帳：無權限卡，找出未達帳',()=>sim(async p=>{
  await p.evaluate(()=>{S.folder='bank';renderSim()});await send(p,'請核對銀行對帳單與帳上明細');await p.waitForSelector('.fchip',{timeout:9000});eq(await cnt(p,'.perm'),0);
  await click(p,'.fchip[data-type="xlsx"]');ok((await txt(p,'.modal')).includes('未達帳'));
 }));
 await check('催款信：未連接 Gmail 存成檔案；連接後建立 3 封草稿',()=>sim(async p=>{
  await send(p,'請找出逾期應收帳款並草擬催款信');await p.waitForSelector('.fchip',{timeout:9000});ok((await p.locator('.chat').innerText()).includes('沒有連接 Gmail'));
  await click(p,'[data-act="nav"][data-v="customize"]');await click(p,'[data-act="ctab"][data-t="connectors"]');await click(p,'[data-act="conn-on"][data-id="gmail"]');await click(p,'[data-act="oauth-ok"]');
  ok(await cnt(p,'.tag.ok')>0,'連接後沒有已連接標示');
  await click(p,'.sb-new');await send(p,'請找出逾期應收帳款並草擬催款信');await p.waitForFunction(()=>document.querySelector('.chat')&&document.querySelector('.chat').innerText.includes('3 封草稿'),null,{timeout:9000});
  await click(p,'[data-act="ctab"][data-t="connectors"]').catch(()=>{});
 }));
 await check('刪除：拒絕與允許兩條路徑；全部略過模式刪除仍會詢問',()=>sim(async p=>{
  await p.evaluate(()=>{S.folder='archive';renderSim()});await send(p,'請把舊檔案全部刪除');await p.waitForSelector('.perm.ask');ok(await cnt(p,'.perm.danger')>0,'刪除沒有危險樣式');
  await click(p,'[data-act="perm"][data-ok="0"]');await p.waitForFunction(()=>document.querySelector('.chat').innerText.includes('沒有刪除任何檔案'),null,{timeout:9000});
  await click(p,'.sb-new');await send(p,'請把舊檔案全部刪除');await p.waitForSelector('.perm.ask');await click(p,'[data-act="perm"][data-ok="1"]');await p.waitForFunction(()=>document.querySelector('.chat').innerText.includes('已刪除 47'),null,{timeout:9000});
  await click(p,'.sb-new');await click(p,'[data-act="pmode"]');await click(p,'[data-act="pmode"]');eq(await p.evaluate(()=>S.pmode),'skip');
  await send(p,'請把舊檔案全部刪除');await p.waitForSelector('.perm.ask',{timeout:8000});
 }));
 await check('權限模式：自動模式不再跳出一般權限卡',()=>sim(async p=>{
  await p.evaluate(()=>{S.folder='invoices';renderSim()});await click(p,'[data-act="pmode"]');eq(await p.evaluate(()=>S.pmode),'auto');
  await send(p,INV);await p.waitForSelector('.fchip',{timeout:9000});eq(await cnt(p,'.perm'),0);ok((await p.locator('.chat').innerText()).includes('已自動批准'));
 }));
 await check('Chat 模式：問答、要讀檔時引導切換；Code 模式說明；切回 Cowork',()=>sim(async p=>{
  await click(p,'.mtoggle [data-m="chat"]');await click(p,'.sg');await p.waitForFunction(()=>document.querySelector('.chatlog')&&document.querySelector('.chatlog').innerText.includes('應付票據'),null,{timeout:5000});
  await send(p,INV);await p.waitForFunction(()=>document.querySelector('.chatlog').innerText.includes('Cowork'),null,{timeout:5000});await click(p,'.chatlog [data-m="cowork"]');eq(await p.evaluate(()=>S.mode),'cowork');
  await click(p,'.sb [data-m="code"]');ok((await txt(p,'.modeNote h2')).includes('Code'));await click(p,'.modeNote [data-m="cowork"]');eq(await p.evaluate(()=>S.mode),'cowork');
 }));
 await check('模型與強度選擇、EN／中文切換',()=>sim(async p=>{
  ok((await txt(p,'.sb-new')).startsWith('New task'),'英文標籤');await click(p,'[data-act="lang"]');ok((await txt(p,'.sb-new')).startsWith('新任務'),'中文標籤');await click(p,'[data-act="lang"]');
  await click(p,'.mdl');await click(p,'[data-act="model-pick"][data-m="Haiku 5"]');await click(p,'[data-act="effort-pick"][data-e="Low"]');await click(p,'.modal [data-act="modal-close"] >> text=完成');
  eq((await txt(p,'.mdl')).trim(),'Haiku 5');eq((await txt(p,'.eff')).trim(),'Low');
  eq(await p.evaluate(()=>MODELS.map(m=>m.n)),['Opus 4.8','Sonnet 4.5','Haiku 5'],'模型清單必須只有三個指定模型');
 }));
 await check('專案、排程、技能、連接器、外掛、右側面板收合、追問',()=>sim(async p=>{
  await click(p,'[data-act="nav"][data-v="projects"]');eq(await cnt(p,'.item'),1);await click(p,'[data-act="proj-new"]');await click(p,'[data-act="proj-save"]');eq(await cnt(p,'.item'),2);
  await click(p,'[data-act="proj-open"]');ok((await p.evaluate(()=>S.prompt)).includes('套用專案'));ok(await p.evaluate(()=>!!S.folder),'專案沒有帶入資料夾');
  await click(p,'[data-act="nav"][data-v="scheduled"]');await click(p,'[data-act="sched-new"]');await click(p,'[data-act="sched-save"]');eq(await cnt(p,'.item'),1);
  const a0=await p.locator('.sw').first().getAttribute('aria-checked');await click(p,'.sw');ok((await p.locator('.sw').first().getAttribute('aria-checked'))!==a0,'排程開關沒切換');
  await click(p,'[data-act="nav"][data-v="customize"]');const n0=await cnt(p,'.item');await click(p,'[data-act="skill-new"]');await click(p,'[data-act="skill-save"]');eq(await cnt(p,'.item'),n0+1,'建立 Skill');
  await click(p,'[data-act="ctab"][data-t="plugins"]');await click(p,'[data-act="plug-on"][data-id="finance"]');await click(p,'[data-act="ctab"][data-t="skills"]');ok((await p.locator('.cust').innerText()).includes('月結結帳檢查'),'外掛沒有帶入技能');
  await click(p,'[data-act="ctab"][data-t="plugins"]');await click(p,'[data-act="plug-off"][data-id="finance"]');await click(p,'[data-act="ctab"][data-t="skills"]');ok(!(await p.locator('.cust').innerText()).includes('月結結帳檢查'),'移除外掛後技能還在');
  await click(p,'.sb-new');await p.evaluate(()=>{S.folder='bank';renderSim()});await send(p,'請核對銀行對帳單');await p.waitForSelector('.fchip',{timeout:9000});
  await click(p,'[data-act="rp-toggle"][data-k="prog"]');ok((await p.locator('.rcard').first().getAttribute('class')).includes('shut'),'右側面板沒收合');
  await p.fill('#composer','請把差異改成千分位');await p.keyboard.press('Enter');await p.waitForFunction(()=>document.querySelector('.chat').innerText.includes('收到'),null,{timeout:4000});
 }));

 await check('簡單範例：Excel／Word／簡報各做一次，預覽正確並出現在 Artifacts',()=>sim(async p=>{
  const run=async(fid,sid,type,must)=>{await click(p,'.sb-new');await click(p,'[data-act="folder-open"]');await click(p,`[data-act="peek"][data-id="${fid}"]`);await click(p,'[data-act="folder-pick"]');await click(p,`.sg[data-id="${sid}"]`);await click(p,'.send');await p.waitForSelector('.fchip',{timeout:9000});eq(await cnt(p,'.perm'),0);await click(p,`.fchip[data-type="${type}"]`);ok((await txt(p,'.modal')).includes(must),`${sid} 預覽缺 ${must}`);await click(p,'[data-act="modal-close"]')};
  await run('quotes','compare','xlsx','=SUM');await run('meeting','word','docx','決議事項');await run('report','slides','pptx','封面');
  await click(p,'[data-act="nav"][data-v="artifacts"]');eq(await cnt(p,'.item'),3,'Artifacts 數量');await p.locator('.item [data-act="file-open"]').first().click();ok(await cnt(p,'.modal')>0,'Artifacts 打不開檔案');
 }));
 await check('新版首頁：側邊欄 Cowork｜Code、Output 選單、強度切換、安全提示、外掛連結',()=>sim(async p=>{
  eq(await cnt(p,'.sb-seg button'),2);await click(p,'.sb-seg [data-m="code"]');ok((await txt(p,'.modeNote h2')).includes('Code'));await click(p,'.sb-seg [data-m="cowork"]');
  const e0=await txt(p,'.eff');await click(p,'.eff');ok((await txt(p,'.eff'))!==e0,'強度沒切換');
  await click(p,'[data-act="safe-tip"]');ok((await txt(p,'.modal')).includes('初稿'));await click(p,'[data-act="modal-close"]');
  await click(p,'[data-act="goto-plugins"]');eq(await p.evaluate(()=>[S.view,S.ctab]),['customize','plugins']);
  await click(p,'.sb-new');await click(p,'.mtoggle [data-m="chat"]');await click(p,'[data-act="output-menu"]');ok((await p.locator('.modal').innerText()).includes('Slides'));await click(p,'[data-act="output-pick"][data-o="Slides"]');await click(p,'.modal [data-act="modal-close"] >> text=完成');
  ok((await txt(p,'[data-act="output-menu"]')).includes('Slides'),'Output 沒有套用');
 }));

 console.log('\n[8] 影片播放器');
 await check('播放／暫停／速度／字幕／拖曳到結尾觸發完成事件',async()=>{
  const p=await open('?view=learn');
  await click(p,'.vplay');await p.waitForTimeout(1600);const t=await txt(p,'.vtime');ok(!t.startsWith('0:00 '),'時間沒有前進：'+t);
  await click(p,'[data-v="toggle"]');const t1=await txt(p,'.vtime');await p.waitForTimeout(500);eq(await txt(p,'.vtime'),t1,'暫停後時間仍在走');
  await click(p,'[data-v="speed"]');eq((await txt(p,'[data-v="speed"]')).trim(),'1.5x');
  await click(p,'[data-v="cap"]');ok(await p.locator('.vcap.off').count()>0,'字幕沒有關閉');
  await click(p,'[data-v="tts"]');await click(p,'[data-v="full"]');
  await p.evaluate(()=>{const r=document.querySelector('.vseek');r.value=1000;r.dispatchEvent(new Event('input'))});ok(await p.evaluate(()=>LOG.has('video_done:1')),'沒有觸發 video_done');
  noErr(p);await p.close2();
 });
 await check('所有影片的每個場景都能繪製（7 支）',async()=>{
  const p=await open('?view=learn');
  const r=await p.evaluate(()=>{const out=[];for(const u of UNITS){Course.go(UNITS.indexOf(u),true,0);const P=Course.player;P.started=true;for(let i=0;i<P.sc.length;i++){P.draw(P.starts[i]+P.sc[i].dur-0.2);if(!P.scene.innerText.trim())out.push(u.id+':'+i)}}return out});eq(r,[],'空白場景');
  noErr(p);await p.close2();
 });

 console.log('\n[9] 老師模式、參數、容錯');
 await check('老師模式：全部解鎖、可略過；?skin 與 ?view 參數有效',async()=>{
  const p=await open('?teacher=1&view=learn&skin=forest');eq(await p.evaluate(()=>[document.body.dataset.skin,document.body.dataset.view,Course.unlocked(6)]),['forest','learn',true]);
  await p.evaluate(()=>Course.go(0,true,2));ok(await cnt(p,'[data-act="force"]')>0,'沒有略過按鈕');noErr(p);await p.close2();
 });
 await check('localStorage 被封鎖（無痕/企業政策）仍能使用',async()=>{
  const p=await open('?view=learn',{init:"Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})"});
  await p.evaluate(()=>Course.go(2,true,2));eq(await p.evaluate(()=>Course.cur),2);await click(p,'[data-act="mode"][data-m="chat"]');noErr(p);await p.close2();
 });

 console.log('\n[10] 手機寬度（390px）與無障礙');
 await check('各檢視無橫向捲動；課程／模擬器分頁可切換；按鈕皆有名稱',async()=>{
  const p=await open('?view=learn',{vp:{width:390,height:844}});
  for(const v of ['map','layers','overview','gloss','learn']){
   await p.evaluate(v=>setView(v),v);await p.waitForTimeout(250);
   const o=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);ok(o<=1,`${v} 檢視橫向溢出 ${o}px`);
   const unnamed=await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&b.getAttribute('aria-hidden')!=='true'&&b.tabIndex>=0&&!(b.innerText.trim()||b.getAttribute('aria-label')||b.title)).map(b=>b.className||b.dataset.act));
   eq(unnamed,[],`${v} 有沒名稱的按鈕`);
  }
  await click(p,'.panes [data-p="sim"]');eq(await p.evaluate(()=>document.body.dataset.pane),'sim');await click(p,'.panes [data-p="coach"]');eq(await p.evaluate(()=>document.body.dataset.pane),'coach');
  noErr(p);await p.close2();
 });

 await browser.close();
 const bad=results.filter(r=>!r.ok);
 console.log(`\n結果：${results.length-bad.length}/${results.length} 通過`+(bad.length?`，${bad.length} 項失敗`:''));
 bad.forEach(b=>console.log(' ✗',b.name,'→',b.err));
 process.exit(bad.length?1:0);
})().catch(e=>{console.error('測試框架錯誤',e);process.exit(2)});
