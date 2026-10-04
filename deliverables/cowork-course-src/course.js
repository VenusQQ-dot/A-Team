/* ========== 動畫影片播放器（時間驅動，與 Remotion 同樣的「畫面 = f(時間)」概念） ========== */
class Player{
 constructor(host,scenes,key){
  Object.assign(this,{h:host,sc:scenes,key,t:0,playing:false,idx:-1,speed:1,cap:true,tts:false,done:false,started:false,raf:0,last:0});
  this.total=scenes.reduce((a,s)=>a+s.dur,0);this.starts=[];let c=0;scenes.forEach(s=>{this.starts.push(c);c+=s.dur});
  host.innerHTML=`<div class="vwrap"><div class="vstage"><div class="vscene"></div><div class="vtag"></div><div class="vcap"><span></span></div><button class="vplay" data-v="play" aria-label="播放動畫">▶ <span>播放動畫</span></button></div>
  <div class="vctl"><button class="pp" data-v="toggle" aria-label="播放或暫停">▶</button><input class="vseek" type="range" min="0" max="1000" value="0" aria-label="影片進度"><span class="vtime">0:00 / ${fmt(this.total)}</span><button data-v="speed" aria-label="播放速度">1x</button><button data-v="cap" class="on">字幕</button><button data-v="tts" title="用瀏覽器朗讀字幕">旁白</button><button data-v="full">全螢幕</button></div></div>`;
  this.wrap=$('.vwrap',host);this.stage=$('.vstage',host);this.scene=$('.vscene',host);this.capEl=$('.vcap',host);this.capSpan=$('.vcap span',host);this.tagEl=$('.vtag',host);
  this.seek=$('.vseek',host);this.timeEl=$('.vtime',host);this.pp=$('.pp',host);this.playBtn=$('.vplay',host);
  host.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;const a=b.dataset.v;
   if(a==='play'||a==='toggle'){this.playing?this.pause():this.play()}
   else if(a==='speed'){this.speed=this.speed===1?1.5:this.speed===1.5?2:1;b.textContent=this.speed+'x'}
   else if(a==='cap'){this.cap=!this.cap;b.classList.toggle('on',this.cap);this.capEl.classList.toggle('off',!this.cap)}
   else if(a==='tts'){this.tts=!this.tts;b.classList.toggle('on',this.tts);if(!this.tts)this.say('');else this.say(this.sc[Math.max(0,this.idx)].cap)}
   else if(a==='full'){try{(document.fullscreenElement?document.exitFullscreen():this.wrap.requestFullscreen()).catch(()=>{})}catch(err){}}});
  this.seek.addEventListener('input',()=>{this.started=true;this.playBtn.classList.add('hide');this.t=this.seek.value/1000*this.total;this.draw(this.t);this.checkDone()});
  this.ro=new ResizeObserver(()=>{this.stage.style.fontSize=Math.max(6,this.stage.clientWidth/58)+'px'});this.ro.observe(this.stage);
  this.stage.style.fontSize=Math.max(6,this.stage.clientWidth/58)+'px';
  this.draw(3.8);this.timeEl.textContent='0:00 / '+fmt(this.total);
 }
 say(txt){try{if(!('speechSynthesis' in window))return;speechSynthesis.cancel();if(!txt||!this.tts)return;const u=new SpeechSynthesisUtterance(txt);u.lang='zh-TW';u.rate=1.05;speechSynthesis.speak(u)}catch(e){}}
 play(){
  if(this.t>=this.total-0.05)this.t=0;
  if(!this.started){this.started=true;this.t=0;this.idx=-1}
  this.playing=true;this.playBtn.classList.add('hide');this.pp.textContent='❚❚';this.last=performance.now();
  this.say(this.sc[Math.max(0,this.idx)>=0?Math.max(0,this.idx):0].cap);
  cancelAnimationFrame(this.raf);this.raf=requestAnimationFrame(ts=>this.tick(ts));
 }
 pause(){this.playing=false;this.pp.textContent='▶';cancelAnimationFrame(this.raf);this.say('')}
 tick(ts){
  if(!this.playing)return;
  const dt=Math.min(0.1,(ts-this.last)/1000);this.last=ts;this.t=Math.min(this.total,this.t+dt*this.speed);
  this.draw(this.t);
  if(this.t>=this.total){this.pause();this.playBtn.querySelector('span').textContent='再看一次';this.playBtn.classList.remove('hide');this.checkDone();return}
  this.raf=requestAnimationFrame(x=>this.tick(x));
 }
 checkDone(){if(!this.done&&this.t>=this.total-0.4){this.done=true;emit('video_done:'+this.key)}}
 draw(t){
  let i=0;for(let k=0;k<this.sc.length;k++)if(t>=this.starts[k])i=k;
  const local=t-this.starts[i];
  if(i!==this.idx){this.scene.innerHTML=this.sc[i].html;this.capSpan.textContent=this.sc[i].cap;this.tagEl.textContent=this.sc[i].tag||'';
   if(this.playing&&this.idx!==-1)this.say(this.sc[i].cap);this.idx=i}
  $$('[data-at]',this.scene).forEach(e=>e.classList.toggle('in',local>=+e.dataset.at));
  $$('[data-win]',this.scene).forEach(e=>{const [a,b]=e.dataset.win.split(',').map(Number);e.classList.toggle('on',local>=a&&local<b)});
  $$('[data-prog]',this.scene).forEach(e=>{const [a,d]=e.dataset.prog.split(',').map(Number);const p=clamp((local-a)/d);e.style.setProperty('--p',p);
   if(e.dataset.type!==undefined){const f=e.dataset.type;e.textContent=f.slice(0,Math.ceil(f.length*p))+(p>0&&p<1?'▍':'')}});
  this.seek.value=Math.round(t/this.total*1000);this.timeEl.textContent=fmt(t)+' / '+fmt(this.total);
 }
 destroy(){this.pause();try{this.ro.disconnect()}catch(e){}}
}

/* ========== 課程控制 ========== */
const STORE_KEY='cowork-course-v1';
const POINTS={step:10,quiz1:5,quiz2:2};
const hintOpen={};const wrong={};

const mwrong={};
function matchHtml(key){
 const g=MATCH[key];
 return g.items.map((it,i)=>{const ok=has('match_ok:'+it.id),bad=mwrong[it.id]||[];
  return `<div class="mq ${ok?'ok':''}"><p><span class="mn2">${i+1}</span>${it.q}</p><div class="mopts">${g.opts.map(o=>`<button class="opt ${ok&&o===it.a?'good':''} ${bad.includes(o)?'bad':''}" data-act="match" data-g="${key}" data-i="${it.id}" data-o="${esc(o)}" ${ok?'disabled':''}>${o}</button>`).join('')}</div>${ok?`<div class="why">✓ ${it.why}</div>`:bad.length?'<div class="why" style="color:var(--warn);background:var(--warn-soft)">再想想，換一個試試。</div>':''}</div>`}).join('');
}
function glossSheet(){
 $('#sheet').innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="名詞小辭典"><button class="x" data-act="sheet-close" aria-label="關閉">×</button><h3 class="serif" style="font-size:22px">名詞小辭典</h3><p class="sh-m">七個常聽到的詞，每個一句話。名稱與位置以你實際的版本為準。</p><div class="gloss">${GLOSS.map(g=>`<div class="gl"><b>${g.t}</b><span class="gs">${g.s}</span><p>${g.d}</p><em>${g.e}</em></div>`).join('')}</div></div>`;
 $('#sheet').hidden=false;
}
const LESSONS=['看動畫','懂重點','動手做','小測驗'];
const LMETA=[['▶ 動畫',''],['▣ 重點卡','y'],['✎ 練習',''],['? 測驗','b']];
const LMIN=[1,1,3,2];
const Course={
 cur:0,slide:0,player:null,
 P:Object.assign({steps:{},quiz:{},name:'',cel:{},seen:{}},store.get(STORE_KEY,{})),
 teacher:store.get('cowork-teacher',false),
 save(){store.set(STORE_KEY,this.P)},
 stepsDone(u){return u.steps.every(s=>this.P.steps[s.id])},
 quizDone(u){return u.quiz.every((_,q)=>this.P.quiz[u.id+'-'+q])},
 unitDone(i){const u=UNITS[i];return this.stepsDone(u)&&this.quizDone(u)},
 unlocked(i){return this.teacher||i===0||this.unitDone(i-1)},
 slideDone(i,s){const u=UNITS[i];if(s===0)return !!this.P.steps[u.steps[0].id];if(s===1)return !!this.P.seen[u.id+'-1'];if(s===2)return this.stepsDone(u);return this.quizDone(u)},
 score(){let s=0;UNITS.forEach(u=>{u.steps.forEach(x=>{if(this.P.steps[x.id])s+=POINTS.step});u.quiz.forEach((_,q)=>{s+=this.P.quiz[u.id+'-'+q]||0})});return s},
 max(){return UNITS.reduce((a,u)=>a+u.steps.length*POINTS.step+u.quiz.length*POINTS.quiz1,0)},
 evaluate(){
  const u=UNITS[this.cur];let ch=false;
  u.steps.forEach(s=>{if(!this.P.steps[s.id]&&s.check()){this.P.steps[s.id]=1;ch=true;toast('+10 分  ✓ '+s.text,'ok')}});
  if(ch){this.save();this.renderSteps();this.renderTop();this.afterProgress()}
 },
 afterProgress(){
  const i=this.cur;this.renderNav();this.renderFoot();
  if(this.unitDone(i)&&!this.P.cel[i]){this.P.cel[i]=1;this.save();confetti();toast(i===UNITS.length-1?'全部單元完成！到最後一課領結業證書':'單元完成！可以前往下一單元','ok')}
 },
 go(i,force,slide){
  if(!force&&!this.unlocked(i)){toast('請先完成上一個單元的練習與小測驗','warn');return}
  this.cur=i;this.slide=slide||0;this.renderUnit();this.evaluate();
 },
 step(d){
  let s=this.slide+d,u=this.cur;
  if(s<0){if(u===0)return;u--;s=3}
  else if(s>3){
   if(u===UNITS.length-1){toast('這是最後一課了，辛苦了！','ok');return}
   if(!this.unitDone(u)&&!this.teacher){toast('先完成這個單元的練習與小測驗，才能進入下一單元','warn');return}
   u++;s=0;
  }
  this.go(u,true,s);
 },
 renderTop(){
  const sc=this.score(),mx=this.max(),u=UNITS[this.cur];
  $('#pbar').style.width=Math.round(sc/mx*100)+'%';
  $('#score').innerHTML=`積分 <b>${sc}</b> / ${mx}`;
  const t=$('#teacher');t.classList.toggle('on',this.teacher);t.setAttribute('aria-pressed',this.teacher);
  $('#rd-sub').textContent=`階段 ${this.cur+1}：${u.short}`;
  $('#rd-count').textContent=`${this.cur*4+this.slide+1} / ${UNITS.length*4}`;
  const pv=$('[data-act="prev"]'),nx=$('[data-act="next"]');
  if(pv)pv.disabled=this.cur===0&&this.slide===0;
  if(nx)nx.disabled=this.cur===UNITS.length-1&&this.slide===3;
 },
 renderNav(){
  $('#segs').innerHTML=UNITS.map((u,i)=>`<div class="sgrp">${[0,1,2,3].map(s=>`<button class="seg ${this.slideDone(i,s)?'done':''} ${i===this.cur&&s===this.slide?'cur':''} ${this.unlocked(i)?'':'lock'}" data-act="seg" data-u="${i}" data-s="${s}" aria-label="單元${i+1} 第${s+1}課 ${LESSONS[s]}" title="單元${i+1}・${LESSONS[s]}"></button>`).join('')}</div>`).join('');
 },
 renderUnit(){
  const u=UNITS[this.cur],n=this.cur+1,s=this.slide;
  if(this.player){this.player.destroy();this.player=null}
  let h=`<div class="rd-tag"><span class="chip2">單元 ${n} · 第 ${s+1} 課</span></div><h2 class="rd-h">${u.short}｜${LESSONS[s]}</h2>
  <div class="rd-meta"><span class="chip2 ${LMETA[s][1]}">${LMETA[s][0]}</span><span>約 ${LMIN[s]} 分鐘</span><button class="mini" data-act="open-map" data-m="${UNITMAP[u.id]}">對照心智圖</button></div>
  <div class="tip">${pix('bulb','#8A5A00',20)}<span>${u.tips[s]}</span></div>`;
  if(s===0)h+=`<p class="goal"><b>${u.title}</b><br>${u.goal}</p><div id="player"></div>`;
  if(s===1){h+=`<div class="cards">${u.cards.map(c=>`<div class="kcard" data-act="flip" role="button" tabindex="0" aria-label="${c.f}，點一下翻面"><div><span class="f"><b>${c.f}</b><small>${c.s}</small></span><span class="b">${c.b}</span></div></div>`).join('')}</div>`;this.P.seen[u.id+'-1']=1;this.save()}
  if(s===2){
   if(u.sample)h+=`<div class="sample"><b>${u.sample.t}</b>${u.sample.rows.map(esc).join('<br>')}</div>`;
   (u.prompts||[]).forEach((p,i)=>{h+=`<div class="pcard ${p.danger?'dg':''}"><div class="ph">${pix('chat','#2B2A27',16)}<span class="grow">${p.t}</span></div><div class="pb">${esc(p.text)}</div><div class="pa"><button class="mini" data-act="copy" data-i="${i}">複製</button><button class="mini solid" data-act="send-prompt" data-i="${i}">送到模擬器輸入框 →</button></div></div>`});
   if(u.match)h+=`<h3 class="rd-sec">配對小遊戲 <em>選出最適合的名詞</em></h3><div id="match">${matchHtml(u.match)}</div>`;
   h+=`<h3 class="rd-sec">實作練習 <em>在右邊模擬器操作，會自動打勾</em></h3><ul class="steps" id="steps"></ul>${u.builder?builderHtml():''}`;
  }
  if(s===3)h+=`<div class="quiz" id="quiz"></div><div id="foot"></div>`;
  $('#unit').innerHTML=h;$('#unit').scrollTop=0;
  if(s===0)this.player=new Player($('#player'),VIDEOS[u.id],u.id);
  this.renderSteps();this.renderQuiz();this.renderFoot();this.renderNav();this.renderTop();
  if(s===2&&u.builder)buildPrompt();
 },
 renderSteps(){
  const el=$('#steps');if(!el)return;const u=UNITS[this.cur];
  el.innerHTML=u.steps.map((s,i)=>{const ok=this.P.steps[s.id];
   return `<li class="step ${ok?'ok':''}"><div class="row"><span class="chk">${ok?IC.check:''}</span><span class="tx">${i+1}. ${s.text}</span><span class="acts">${ok?'':`<button class="mini" data-act="hint" data-id="${s.id}">提示</button>`}${this.teacher&&!ok?`<button class="mini" data-act="force" data-id="${s.id}">略過</button>`:''}</span></div>${hintOpen[s.id]&&!ok?`<div class="hint">💡 ${s.hint}${s.sel==='.vplay'?'（這步在第 1 課）':'（模擬器中對應的位置已閃爍標示）'}</div>`:''}</li>`}).join('');
 },
 renderQuiz(){
  const el=$('#quiz');if(!el)return;const u=UNITS[this.cur];
  el.innerHTML=u.quiz.map((q,qi)=>{const key=u.id+'-'+qi,got=this.P.quiz[key],bad=wrong[key]||[];
   return `<div class="q ${got?'ok':''}"><p>Q${qi+1}. ${q.q}</p><div class="opts">${q.o.map((o,oi)=>`<button class="opt ${got&&oi===q.a?'good':''} ${bad.includes(oi)?'bad':''} ${this.teacher&&!got&&oi===q.a?'tip':''}" data-act="ans" data-q="${qi}" data-o="${oi}" ${got?'disabled':''}>${String.fromCharCode(65+oi)}. ${o}</button>`).join('')}</div>${got?`<div class="why">✓ ${q.why}</div>`:bad.length?'<div class="why" style="color:var(--warn);background:var(--warn-soft)">再想想，換一個選項試試。</div>':''}</div>`}).join('');
 },
 renderFoot(){
  const el=$('#foot');if(!el)return;
  const i=this.cur,last=i===UNITS.length-1;let h='';
  if(!this.unitDone(i))h=`<p class="goal" style="margin-top:14px">完成本單元全部練習與測驗後，按右下角 › 進入下一單元。</p>`;
  if(last&&UNITS.every((_,k)=>this.unitDone(k))){
   const sc=this.score(),mx=this.max(),pct=sc/mx,rank=pct>=.9?'Cowork 達人':pct>=.7?'合格的 AI 同事':'見習生';
   h+=`<div class="cert"><h3>結業！你的成績</h3><div class="big">${sc} / ${mx}</div><p>稱號：<b>${rank}</b></p><input class="fld" id="cert-name" placeholder="輸入姓名" value="${esc(this.P.name||'')}" aria-label="姓名"><br><button class="btn" data-act="cert">下載結業證書 PNG</button></div>`;
  }else if(this.unitDone(i)&&!last)h=`<p class="goal" style="margin-top:14px">✓ 本單元完成！按右下角 › 前往單元 ${i+2}。</p>`;
  el.innerHTML=h;
 }
};

function builderHtml(){
 return `<div class="builder"><b>指令組裝器</b><label>1) 目標<select id="pb-goal"><option value="把每張發票的日期、廠商、統編、金額整理成 Excel">整理發票成 Excel</option><option value="核對銀行對帳單與帳上明細，列出未達帳項目">銀行對帳</option></select></label>
 <fieldset><legend>2) 限制（可複選）</legend><label><input type="checkbox" class="pb-l" value="不要修改原始檔案" checked>不要修改原始檔案</label><label><input type="checkbox" class="pb-l" value="缺統編的標紅" checked>缺統編的標紅</label><label><input type="checkbox" class="pb-l" value="重大動作先問我">重大動作先問我</label></fieldset>
 <label>3) 預覽（資料來源＝你授權的資料夾；格式＝Excel）<textarea id="pb-out" rows="4" readonly></textarea></label><button class="btn" id="pb-send" data-act="pb-send">送到 Cowork 輸入框 →</button></div>`;
}
function buildPrompt(){
 const g=$('#pb-goal');if(!g)return '';
 const ls=$$('.pb-l:checked').map(x=>x.value);
 const t=`請讀取我授權的資料夾，${g.value}。輸出：Excel 檔（一列一筆，含欄位標題）。${ls.length?'限制：'+ls.join('；')+'。':''}`;
 $('#pb-out').value=t;return t;
}

/* ========== 全域事件 ========== */
function setSkin(s){
 if(!['candy','paper','arcade','navy'].includes(s))s='candy';
 document.body.dataset.skin=s;$$('.skins button').forEach(b=>b.classList.toggle('on',b.dataset.s===s));store.set('cowork-skin',s);
 if(document.body.dataset.view==='map'&&typeof mmShow==='function')requestAnimationFrame(()=>mmShow());
}
function copyText(t){try{if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(t).then(()=>true).catch(()=>false)}}catch(e){}
 try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();const ok=document.execCommand('copy');a.remove();return Promise.resolve(ok)}catch(e){return Promise.resolve(false)}}
const GA={
 gloss(){glossSheet()},
 match(el){
  const g=MATCH[el.dataset.g],it=g.items.find(x=>x.id===el.dataset.i),o=el.dataset.o;
  if(has('match_ok:'+it.id))return;
  if(o===it.a){emit('match_ok:'+it.id)}else{(mwrong[it.id]=mwrong[it.id]||[]).push(o)}
  const m=$('#match');if(m)m.innerHTML=matchHtml(el.dataset.g);
 },
 skin(el){setSkin(el.dataset.s)},
 prev(){Course.step(-1)},next(){Course.step(1)},
 seg(el){const u=+el.dataset.u,s=+el.dataset.s;if($('#sheet'))closeSheet();if(!Course.unlocked(u)){toast('先完成前面的單元，這一課才會解鎖','warn');return}Course.go(u,true,s)},
 menu(){
  $('#sheet').innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="課程目錄"><button class="x" data-act="sheet-close" aria-label="關閉">×</button><h3 class="serif" style="font-size:22px">課程目錄</h3><div class="menu-list">${UNITS.map((u,i)=>{const d=Course.unitDone(i),lk=!Course.unlocked(i),sd=u.steps.filter(x=>Course.P.steps[x.id]).length,qd=u.quiz.filter((_,q)=>Course.P.quiz[u.id+'-'+q]).length;return `<button class="${i===Course.cur?'on':''} ${d?'done':''} ${lk?'lock':''}" data-act="seg" data-u="${i}" data-s="0"><span class="n">${d?'✓':lk?'🔒':i+1}</span><span><b>${u.title}</b><small>練習 ${sd}/${u.steps.length}・測驗 ${qd}/${u.quiz.length}</small></span></button>`}).join('')}</div></div>`;
  $('#sheet').hidden=false;
 },
 copy(el){const p=UNITS[Course.cur].prompts[+el.dataset.i];copyText(p.text).then(ok=>toast(ok?'已複製！貼到 Cowork 輸入框就能用':'瀏覽器不允許複製，請手動選取文字','ok'))},
 'send-prompt'(el){const p=UNITS[Course.cur].prompts[+el.dataset.i];S.prompt=p.text;S.mode='cowork';S.view='home';S.modal=null;renderSim();emit('prompt_built');toast('已送到輸入框！接著確認資料夾，再按送出','ok');if(matchMedia('(max-width:1000px)').matches)setPane('sim')},
 flip(el){el.classList.toggle('flip')},
 hint(el){
  const u=UNITS[Course.cur],s=u.steps.find(x=>x.id===el.dataset.id);hintOpen[s.id]=true;Course.renderSteps();
  if(matchMedia('(max-width:1000px)').matches&&!s.sel.startsWith('.vplay')){setPane('sim');setTimeout(()=>pulse(s.sel),50)}else pulse(s.sel);
 },
 force(el){const s=UNITS[Course.cur].steps.find(x=>x.id===el.dataset.id);Course.P.steps[s.id]=1;Course.save();Course.renderSteps();Course.renderTop();Course.afterProgress()},
 ans(el){
  const u=UNITS[Course.cur],qi=+el.dataset.q,oi=+el.dataset.o,q=u.quiz[qi],key=u.id+'-'+qi;
  if(Course.P.quiz[key])return;
  if(oi===q.a){Course.P.quiz[key]=(wrong[key]&&wrong[key].length)?POINTS.quiz2:POINTS.quiz1;Course.save();Course.renderQuiz();Course.renderTop();Course.afterProgress()}
  else{(wrong[key]=wrong[key]||[]).push(oi);Course.renderQuiz()}
 },
 'pb-send'(){
  const t=buildPrompt();S.prompt=t;S.mode='cowork';S.view='home';S.modal=null;renderSim();emit('prompt_built');
  toast('已送到輸入框！接著確認資料夾，再按送出','ok');if(matchMedia('(max-width:1000px)').matches)setPane('sim');
 },
 cert(){drawCert()},
 pane(el){setPane(el.dataset.p)},
 teacher(){Course.teacher=!Course.teacher;store.set('cowork-teacher',Course.teacher);Course.renderUnit();toast(Course.teacher?'老師模式：全部單元解鎖、顯示答案提示、可略過步驟':'已關閉老師模式')},
 reset(){if(confirm('確定要清除所有學習進度與積分嗎？')){store.del(STORE_KEY);location.reload()}}
};
function setPane(p){document.body.dataset.pane=p;$$('.panes button').forEach(b=>b.classList.toggle('on',b.dataset.p===p))}
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');if(!el)return;
 const a=el.dataset.act;
 if(a==='modal-bg'){ACT[a](el,e);return}
 const f=GA[a]||ACT[a];if(f){f(el,e)}
});
document.addEventListener('keydown',e=>{
 if(e.target.id==='composer'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();sendPrompt();return}
 if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('kcard')){e.preventDefault();e.target.classList.toggle('flip')}
 if(e.key==='Escape'&&S.modal){S.modal=null;renderSim()}
});
document.addEventListener('input',e=>{
 if(e.target.id==='composer')S.prompt=e.target.value;
 if(e.target.id==='cert-name'){Course.P.name=e.target.value;Course.save()}
 if(e.target.id==='pb-goal'||e.target.classList.contains('pb-l'))buildPrompt();
});
document.addEventListener('change',e=>{if(e.target.id==='pb-goal'||e.target.classList.contains('pb-l'))buildPrompt()});

/* ========== 結業證書 / 彩帶 ========== */
function drawCert(){
 const c=document.createElement('canvas');c.width=1600;c.height=1131;const g=c.getContext('2d');
 g.fillStyle='#FBF8F2';g.fillRect(0,0,1600,1131);
 g.strokeStyle='#C96442';g.lineWidth=10;g.strokeRect(50,50,1500,1031);g.lineWidth=2;g.strokeRect(75,75,1450,981);
 g.textAlign='center';g.fillStyle='#2B2A27';
 const serif='"Noto Serif TC","Songti TC","PMingLiU",serif';
 g.font=`700 84px ${serif}`;g.fillText('結業證書',800,260);
 g.font=`36px ${serif}`;g.fillStyle='#6F6A5F';g.fillText('Claude Cowork 基礎入門班',800,330);
 const name=(Course.P.name||'').trim()||'學員';
 g.fillStyle='#A94E31';g.font=`700 110px ${serif}`;g.fillText(name,800,560);
 g.fillStyle='#2B2A27';g.font=`38px ${serif}`;g.fillText('完成全部 6 個單元的互動練習與小測驗',800,660);
 const sc=Course.score(),mx=Course.max(),pct=sc/mx;
 g.fillText(`積分 ${sc} / ${mx}　稱號：${pct>=.9?'Cowork 達人':pct>=.7?'合格的 AI 同事':'見習生'}`,800,730);
 g.fillStyle='#6F6A5F';g.font=`30px ${serif}`;g.fillText(new Date().toLocaleDateString('zh-TW'),800,900);
 const a=document.createElement('a');a.download='Cowork結業證書_'+name+'.png';a.href=c.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();
}
function confetti(){
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const cv=document.createElement('canvas');cv.id='confetti';cv.width=innerWidth;cv.height=innerHeight;document.body.appendChild(cv);
 const g=cv.getContext('2d'),cols=['#C96442','#3E7C59','#3B6EA5','#D9A441','#2B2A27'];
 const ps=Array.from({length:90},()=>({x:innerWidth/2,y:innerHeight*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*13-3,r:Math.random()*6+3,c:cols[Math.random()*5|0],a:Math.random()*6}));
 let f=0;(function loop(){g.clearRect(0,0,cv.width,cv.height);ps.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.a+=.2;g.save();g.translate(p.x,p.y);g.rotate(p.a);g.fillStyle=p.c;g.fillRect(-p.r,-p.r/2,p.r*2,p.r);g.restore()});
  if(++f<110)requestAnimationFrame(loop);else cv.remove()})();
}

/* ========== 啟動 ========== */
window.addEventListener('DOMContentLoaded',()=>{
 const q=new URLSearchParams(location.search);
 if(q.get('teacher')==='1'){Course.teacher=true;store.set('cowork-teacher',true)}
 renderSim();
 let start=0;for(let i=0;i<UNITS.length;i++){if(Course.unlocked(i)&&!Course.unitDone(i)){start=i;break}start=i}
 Course.cur=start;Course.renderUnit();setPane('coach');
 setSkin(q.get('skin')||store.get('cowork-skin','candy'));
 window.addEventListener('beforeunload',()=>{try{speechSynthesis.cancel()}catch(e){}});
});
