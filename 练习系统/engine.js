/* 数据结构练习引擎 —— 依赖 data_ds.js（window.DS_DATA / window.DS_META）
   全站共用：练习/考试双模式、判分、localStorage 记录、错题本、随机抽题、导出报告、统计。
   localStorage 键（v1）：
     ds_attempts_v1  完整刷记录数组 [{ts,scope,mode,total,correct,acc,wrongIds,kp:{}}]
     ds_wrong_v1     错题本 {qid:{n:错次, res:是否已消化, ts:最近}}
*/
(function(){
const LS_A='ds_attempts_v1', LS_W='ds_wrong_v1', LS_CV='ds_codeveil_v1', LS_AT='ds_attr_v1';
const $=(s,r)=>(r||document).querySelector(s);
const byId=id=>DS_DATA.find(q=>q.id===id);

/* 错因归因标签（借鉴数学错题页）：对照答案后勾一下「错在哪」，统计页汇成分布条。 */
const ATTR_TAGS=['概念记混','性质公式用错','边界特例漏','数据结构选错','指针代码写错','复杂度算错','读题看图错'];
const ATTR_PAL=['#b04a3a','#a5732a','#3e7a4e','#3d6a8a','#6d5a8e','#8b5e34','#8a8578'];

function load(k,def){try{return JSON.parse(localStorage.getItem(k))??def;}catch(e){return def;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function attempts(){return load(LS_A,[]);}
function wrongBook(){return load(LS_W,{});}

function attrBook(){return load(LS_AT,{});}
function toggleAttr(qid,tag){const b=attrBook();const arr=b[qid]||[];const i=arr.indexOf(tag);if(i>=0)arr.splice(i,1);else arr.push(tag);if(arr.length)b[qid]=arr;else delete b[qid];save(LS_AT,b);return arr.includes(tag);}
function addWrong(qid){const w=wrongBook();const e=w[qid]||{n:0,res:false};e.n++;e.res=false;e.ts=Date.now();w[qid]=e;save(LS_W,w);}
function resolveWrong(qid){const w=wrongBook();if(w[qid]){w[qid].res=true;w[qid].ts=Date.now();save(LS_W,w);}}
function stripHtml(h){const d=document.createElement('div');d.innerHTML=h;return d.textContent.replace(/\s+/g,' ').trim();}
/* 代码块是纯源码，含 < > & 必须转义，否则 <n/2) 之类会被当成 HTML 标签吞掉 */
function escCode(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* 求和号排版升级：把行内的 Σ<sub>下限</sub><sup>上限</sup> 转成上下限叠在 ∑ 上下的三层结构，
   贴近课后题/真题的标准排版（样式见 style.css 的 .sum）。纯字符串替换，离线、无依赖；
   只吃紧跟 Σ 的那一对 sub/sup，后面的 (i−1)N<sub>i</sub> 等普通下标不受影响。 */
function mathup(html){
  return String(html).replace(/Σ<sub>([^<]*)<\/sub><sup>([^<]*)<\/sup>/g,
    '<span class="sum"><span class="up">$2</span><span class="sig">∑</span><span class="lo">$1</span></span>');
}

/* ---------- 参考代码遮罩 ----------
   综合应用题的 code 字段放的是「参考实现」＝答案的一部分，直接摊在题干下面等于送答案。
   规则：subjective 且未标 codeStem 的 code 一律当答案代码 → 收进核对面板并默认打码；
        codeStem:true 表示这段代码是题目给的（如「分析下列程序段的复杂度」），照常显示在题干里。
   全局开关存 localStorage：true=默认遮住（默认值），false=默认直接展开。 */
function isAnsCode(q){return q.type==='subjective' && q.code && !q.codeStem;}
function veilOn(){const v=load(LS_CV,true);return v!==false;}
function setVeil(v){save(LS_CV,!!v);}

/* ---------- 题池 ---------- */
function pool(scope){
  if(!scope)return DS_DATA.slice();
  if(scope.type==='chapter')return DS_DATA.filter(q=>q.ch===scope.ch);
  if(scope.type==='exam')return DS_DATA.filter(q=>q.exam!=null);
  if(scope.type==='wrong'){const w=wrongBook();return DS_DATA.filter(q=>w[q.id]&&!w[q.id].res);}
  if(scope.type==='all')return DS_DATA.slice();
  return DS_DATA.slice();
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ---------- 渲染单题 ---------- */
function qHtml(q,idx){
  let h='<div class="q" id="Q_'+q.id+'" data-id="'+q.id+'">';
  h+='<div class="stem"><span class="no">'+(idx!=null?(idx+1)+'. ':'')+q.id+'</span>'
    +(q.tag?'<span class="tag">'+q.tag+'</span>':'')
    +(q.kp&&q.kp[0]?'<span class="kp">'+q.kp[0]+'</span>':'')
    +' '+q.stem+'</div>';
  if(q.code&&!isAnsCode(q))h+='<pre class="code">'+escCode(q.code)+'</pre>';
  /* fig：题干配图（裁自王道原书扫描件）。只在「不看图做不了题」时才配。 */
  if(q.fig)h+='<figure class="qfig"><img src="'+q.fig+'" alt="题图" loading="lazy">'
    +(q.figcap?'<figcaption>'+q.figcap+'</figcaption>':'')+'</figure>';
  if(q.type==='choice'){
    h+='<div class="opts">';
    ['A','B','C','D','E'].forEach((k,i)=>{if(q.opts[i]!==undefined)
      h+='<div class="opt" data-k="'+k+'"><span class="k">'+k+'</span><span>'+q.opts[i]+'</span></div>';});
    h+='</div>';
  }
  /* 大题四层渐进提示（借鉴数学错题页）：题干 → 提示①方向 → 提示②关键步骤 → 完整解答（看核对）。
     只对写了 hints 的主观题渲染；先逼自己想，卡住了一层层点开。 */
  if(q.type==='subjective' && q.hints && q.hints.length){
    h+='<div class="hints">';
    q.hints.forEach((ht,i)=>{
      const lab=i===0?'提示① 方向':(i===1?'提示② 关键步骤':'提示'+(i+1));
      const peek=i===0?'先自己想 · 卡住了点这里':'还卡再点';
      h+='<div class="hintl" data-i="'+i+'"><span class="hl">'+lab+'</span><span class="ht">'+ht+'</span><span class="peek">'+peek+'</span></div>';
    });
    h+='<div class="hintl l-sol"><span class="hl">完整解答</span><span class="peek">做完 / 彻底卡死 → 点下方「看核对」对采分点</span></div>';
    h+='</div>';
  }
  h+='<button class="reveal">看核对 ▾</button>';
  h+='<div class="ans"><div class="tracks">';
  h+='<div class="track book"><h4>📕 王道书答案</h4>'+(q.type==='choice'?'<div class="final">'+q.ans+'</div>':'')+'<div>'+q.book+'</div>'
    +(q.figA?'<figure class="qfig"><img src="'+q.figA+'" alt="答案图" loading="lazy">'
      +(q.figAcap?'<figcaption>'+q.figAcap+'</figcaption>':'')+'</figure>':'')+'</div>';
  h+='<div class="track claude"><h4>🤖 Claude 运行核对</h4><div>'+q.claude+'</div>'+(q.run?'<div class="run">▸ '+q.run+'</div>':'')+'</div>';
  h+='</div>';
  /* 参考实现：默认打码，点一下才看——先在纸上写完再对，才有练算法大题的意义 */
  if(isAnsCode(q))
    h+='<div class="codeans"><h4>💻 参考实现（C · Claude 写并实测）</h4>'
      +'<div class="codewrap'+(veilOn()?' veiled':'')+'"><pre class="code">'+escCode(q.code)+'</pre>'
      +'<button class="codepeek">✍️ 建议先自己默写 —— 点这里显示参考代码</button></div></div>';
  const vc=q.verdict==='warn'?'warn':'ok';
  const vt=q.verdict==='warn'?'⚠️ 存疑 · 见右栏，最终由你裁决':'✅ 两方一致'+(q.type==='choice'?'（书答 '+q.ans+'）':'');
  h+='<div class="verdict '+vc+'">'+vt+'</div>';
  if(q.type==='subjective')
    h+='<div class="selfmark"><span class="lab">对照后自评：</span><button class="gok" data-m="ok">✔ 我答对了</button><button class="gbad" data-m="bad">✘ 我答错了</button></div>';
  /* 错因归因：对照答案后勾「错在哪」，进统计页的分布条。 */
  {const sel=attrBook()[q.id]||[];
   h+='<div class="attrrow"><span class="lab">🏷 对照后，这题错在哪？（可多选，进统计）</span>';
   ATTR_TAGS.forEach(t=>{h+='<button class="attrtag'+(sel.indexOf(t)>=0?' on':'')+'" data-t="'+t+'">'+t+'</button>';});
   h+='</div>';}
  h+='<div class="askrow">🙋 不懂？告诉我：<code>'+q.id+' …</code></div>';
  h+='</div></div>';
  return h;
}

/* ---------- 主挂载 ---------- */
function mount(cfg){
  const root=$(cfg.root||'#root');
  const state={cfg, items:[], mode:cfg.mode||'practice', answers:{}, submitted:false};

  function buildItems(){
    let items=pool(cfg.scope);
    if(cfg.random&&cfg.randomN)items=shuffle(items).slice(0,cfg.randomN);
    state.items=items; state.answers={}; state.submitted=false;
  }
  buildItems();

  function toolbar(){
    let h='<div class="toolbar">';
    if(cfg.allowModeToggle!==false){
      h+='<div class="modeseg"><button data-mode="practice" class="'+(state.mode==='practice'?'on':'')+'">📖 练习模式</button>'
        +'<button data-mode="exam" class="'+(state.mode==='exam'?'on':'')+'">📝 考试模式</button></div>';
    }
    if(cfg.random)h+='<button class="tbtn" id="btnReshuffle">🎲 换一组</button>';
    if(state.items.some(isAnsCode))
      h+='<button class="tbtn" id="btnCodeVeil">'+(veilOn()?'💻 参考代码：遮住':'💻 参考代码：直接显示')+'</button>';
    h+='<span class="spacer"></span>';
    h+='<span class="hint" id="modeHint"></span>';
    h+='<button class="tbtn primary" id="btnSettle">'+(state.mode==='exam'?'✅ 交卷判分':'📊 结算这组')+'</button>';
    h+='</div>';
    return h;
  }

  function render(){
    let h=toolbar();
    if(state.items.length===0){
      h+='<div class="empty">'+(cfg.emptyText||'这里还没有题目。')+'</div>';
    }else{
      let curSec='';
      state.items.forEach((q,i)=>{
        if(cfg.groupBySec!==false && q.sec!==curSec){curSec=q.sec;h+='<h2 class="sec">'+curSec+'</h2>';}
        h+=qHtml(q, cfg.number?i:null);
      });
      h+='<div style="text-align:center;margin-top:22px"><button class="tbtn primary" id="btnSettle2">'
        +(state.mode==='exam'?'✅ 交卷判分':'📊 结算这组')+'</button></div>';
      h+='<div id="resultSlot"></div>';
    }
    root.innerHTML=mathup(h);
    wire();
    applyMode();
  }

  function applyMode(){
    const exam=state.mode==='exam' && !state.submitted;
    $('#modeHint').textContent = exam
      ? '闭卷：先选完全部，再点交卷才判分与揭示答案'
      : (state.mode==='exam'?'已交卷，可展开核对':'开卷：点选项即判，可随时展开核对');
    root.querySelectorAll('.q').forEach(qd=>{
      const reveal=$('.reveal',qd), ans=$('.ans',qd), hints=$('.hints',qd);
      if(exam){reveal.style.display='none';ans.classList.remove('open');if(hints)hints.style.display='none';}
      else{reveal.style.display='';if(hints)hints.style.display='';}
    });
  }

  function wire(){
    root.querySelectorAll('.modeseg button').forEach(b=>b.onclick=()=>{
      state.mode=b.dataset.mode; state.answers={}; state.submitted=false; render();
    });
    const rs=$('#btnReshuffle'); if(rs)rs.onclick=()=>{buildItems();render();};
    const cv=$('#btnCodeVeil'); if(cv)cv.onclick=()=>{
      const on=!veilOn(); setVeil(on);
      cv.textContent=on?'💻 参考代码：遮住':'💻 参考代码：直接显示';
      root.querySelectorAll('.codewrap').forEach(w=>w.classList.toggle('veiled',on));
      toast(on?'参考代码已重新打码——先自己写':'参考代码默认展开（当作范例通读时用）');
    };
    if($('#btnSettle'))$('#btnSettle').onclick=settle;
    if($('#btnSettle2'))$('#btnSettle2').onclick=settle;

    root.querySelectorAll('.q').forEach(qd=>{
      const id=qd.dataset.id, q=byId(id);
      // 选项点击
      qd.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{
        if(state.submitted)return;
        if(state.mode==='exam'){
          qd.querySelectorAll('.opt').forEach(x=>x.classList.remove('picked'));
          o.classList.add('picked');
          state.answers[id]={pick:o.dataset.k};
        }else{ // 练习：即点即判
          qd.querySelectorAll('.opt').forEach(x=>x.classList.remove('correct','wrong','picked'));
          qd.querySelector('.opt[data-k="'+q.ans+'"]').classList.add('correct');
          const ok=o.dataset.k===q.ans;
          if(!ok)o.classList.add('wrong');
          state.answers[id]={pick:o.dataset.k,correct:ok};
          if(ok)resolveWrong(id); else addWrong(id);
          markCard(qd,ok);
        }
      });
      // 渐进提示：一层层点开（完整解答那层引导去「看核对」）
      qd.querySelectorAll('.hintl').forEach(hl=>hl.onclick=()=>{
        if(hl.classList.contains('l-sol')){const rv=$('.reveal',qd);if(rv&&rv.style.display!=='none')rv.click();return;}
        hl.classList.toggle('open');
      });
      // 错因归因标签：勾选存 localStorage，进统计
      qd.querySelectorAll('.attrtag').forEach(bt=>bt.onclick=()=>{
        const on=toggleAttr(id,bt.dataset.t); bt.classList.toggle('on',on);
      });
      // 参考代码打码 → 点一下揭开（只影响这一题）
      const pk=$('.codepeek',qd);
      if(pk)pk.onclick=()=>$('.codewrap',qd).classList.remove('veiled');
      // 展开
      const rv=$('.reveal',qd);
      rv.onclick=()=>{const a=$('.ans',qd);const op=a.classList.toggle('open');rv.textContent=op?'收起核对 ▴':'看核对 ▾';};
      // 主观自评
      qd.querySelectorAll('.selfmark button').forEach(b=>b.onclick=()=>{
        qd.querySelectorAll('.selfmark button').forEach(x=>x.classList.remove('on'));
        b.classList.add('on');
        const ok=b.dataset.m==='ok';
        state.answers[id]={self:b.dataset.m,correct:ok};
        if(ok)resolveWrong(id); else addWrong(id);
        markCard(qd,ok);
      });
    });
  }
  function markCard(qd,ok){qd.classList.remove('done-ok','done-bad');qd.classList.add(ok?'done-ok':'done-bad');}

  function settle(){
    // 揭示所有答案
    state.submitted=true;
    let correct=0, graded=0, subjPending=0, wrongIds=[], kpMiss={};
    state.items.forEach(q=>{
      const qd=document.getElementById('Q_'+q.id);
      const a=state.answers[q.id];
      if(q.type==='choice'){
        graded++; // 选择题全部计入（未作答按错）
        qd.querySelectorAll('.opt').forEach(o=>{
          o.classList.remove('correct','wrong','picked');o.classList.add('disabled');
          if(o.dataset.k===q.ans)o.classList.add('correct');
        });
        if(a&&a.pick){
          const ok=a.pick===q.ans;
          if(!ok){qd.querySelector('.opt[data-k="'+a.pick+'"]').classList.add('wrong');}
          a.correct=ok;
          if(ok){correct++;resolveWrong(q.id);}else{wrongIds.push(q.id);addWrong(q.id);}
          markCard(qd,ok);
        }else{ // 未作答按错记
          wrongIds.push(q.id);addWrong(q.id);markCard(qd,false);
        }
        // 展开核对
        $('.reveal',qd).style.display='';$('.ans',qd).classList.add('open');
        $('.reveal',qd).textContent='收起核对 ▴';
      }else{ // 主观：仅自评过才计入分母
        $('.reveal',qd).style.display='';$('.ans',qd).classList.add('open');
        $('.reveal',qd).textContent='收起核对 ▴';
        if(a&&a.correct!=null){graded++;if(a.correct)correct++;else wrongIds.push(q.id);}
        else{subjPending++;
          if(!$('.needself',qd)){const t=document.createElement('div');t.className='needself hint';t.style.marginTop='6px';t.textContent='↑ 请点上方「我答对了/答错了」计入统计（含主观题）';$('.selfmark',qd).appendChild(t);}
        }
      }
    });
    wrongIds.forEach(id=>{const q=byId(id);const k=(q.kp&&q.kp[0])||'未分类';kpMiss[k]=(kpMiss[k]||0)+1;});
    const total=state.items.length;
    const acc=graded?Math.round(correct/graded*100):0;
    // 记录一次完整刷
    const rec={ts:Date.now(),scope:cfg.scopeLabel||'练习',mode:state.mode==='exam'?'闭卷':'开卷',
      total,graded,correct,acc,wrongIds,kp:kpMiss,subjPending};
    const arr=attempts();arr.push(rec);save(LS_A,arr);
    renderResult(rec);
    applyMode();
    $('#resultSlot').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function renderResult(rec){
    const nth=attempts().filter(a=>a.scope===rec.scope).length;
    let h='<div class="result"><h3>📊 '+rec.scope+' · 第 '+nth+' 次结算（'+rec.mode+'）</h3>';
    h+='<div class="rstats">'
      +'<div class="rstat"><div class="v">'+rec.acc+'%</div><div class="k">正确率</div></div>'
      +'<div class="rstat"><div class="v">'+rec.correct+'/'+(rec.graded||rec.total)+'</div><div class="k">答对/已判分</div></div>'
      +'<div class="rstat"><div class="v">'+rec.wrongIds.length+'</div><div class="k">错题（已入错题本）</div></div>'
      +'<div class="rstat"><div class="v">'+nth+'</div><div class="k">本组累计刷</div></div>'
      +'</div>';
    if(rec.subjPending)h+='<div class="verdict warn" style="margin:0 0 10px">还有 '+rec.subjPending+' 道主观题未自评——上方点「我答对了/答错了」后正确率才完整。</div>';
    const kps=Object.entries(rec.kp).sort((a,b)=>b[1]-a[1]);
    if(kps.length){
      const mx=kps[0][1];
      h+='<div style="font-size:.86rem;color:var(--muted);margin:4px 0 8px">错误集中的知识点：</div><div class="kpbars">';
      kps.forEach(([k,v])=>{h+='<div class="kpbar"><span class="lab">'+k+'</span><span class="bar"><i style="width:'+(v/mx*100)+'%"></i></span><span>'+v+'</span></div>';});
      h+='</div>';
      h+='<div style="font-size:.84rem;margin-top:12px">👉 去 <a href="错题本.html" style="color:var(--accent)">错题本</a> 专练这些错题，或点错题本里「导出报告」发我，让我按你的薄弱点补讲解与技巧。</div>';
    }else{
      h+='<div style="font-size:.9rem;color:var(--green)">🎉 全对！这组没有留下错题。</div>';
    }
    h+='<div style="margin-top:14px"><button class="tbtn" id="btnRedo">↻ 再刷一遍这组</button> '
      +'<a class="tbtn" href="我的统计.html" style="text-decoration:none">📈 看我的统计</a></div>';
    h+='</div>';
    $('#resultSlot').innerHTML=h;
    $('#btnRedo').onclick=()=>{state.answers={};state.submitted=false;buildItems();render();window.scrollTo({top:0,behavior:'smooth'});};
  }

  render();

  /* 支持从套路库/错题本直接跳到某题：第3章.html#Q_3.1-14
     题目是 JS 渲染的，浏览器原生锚点跳转会落空，这里渲染完再手动定位并高亮。 */
  if(location.hash.startsWith('#Q_')){
    const el=document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if(el)setTimeout(()=>{
      el.scrollIntoView({behavior:'smooth',block:'center'});
      el.style.transition='box-shadow .4s';
      el.style.boxShadow='0 0 0 3px var(--accent)';
      setTimeout(()=>el.style.boxShadow='',1600);
    },60);
  }
  return {render, state};
}

/* ---------- 统计页 ---------- */
function renderStats(sel){
  const root=$(sel);
  const arr=attempts(), w=wrongBook();
  const closed=arr.filter(a=>a.mode==='闭卷');
  const answeredIds=new Set();arr.forEach(a=>{/* 覆盖题数难精确，用刷过的题去重估：这里用错题本+已消化 */});
  const wrongUnres=Object.entries(w).filter(([id,e])=>!e.res);
  const wrongAll=Object.keys(w).length;
  const avg=closed.length?Math.round(closed.reduce((s,a)=>s+a.acc,0)/closed.length):0;
  // 覆盖题数：出现在任一 attempt 的题（无法完全精确，用错题本键 + 各 attempt total 的最大值近似）——改为统计做过的不同题：由 wrong 键 + 已结算题推断。简单起见展示「累计刷题次数」与题库规模。
  let h='<div class="stats">'
    +'<div class="stat"><div class="v">'+arr.length+'</div><div class="k">累计结算次数</div></div>'
    +'<div class="stat"><div class="v">'+closed.length+'</div><div class="k">其中闭卷</div></div>'
    +'<div class="stat"><div class="v">'+avg+'%</div><div class="k">闭卷平均正确率</div></div>'
    +'<div class="stat"><div class="v">'+wrongUnres.length+'</div><div class="k">未消化错题</div></div>'
    +'<div class="stat"><div class="v">'+DS_DATA.length+'</div><div class="k">题库题数（第'+DS_META.chapters.filter(c=>c.ready).map(c=>c.id).join('/')+'章）</div></div>'
    +'</div>';

  // 正确率趋势
  h+='<div class="card"><h2>正确率趋势（每次结算）</h2>';
  if(arr.length){
    h+='<div class="trend">';
    arr.slice(-24).forEach(a=>{h+='<div class="b" title="'+new Date(a.ts).toLocaleString()+' · '+a.mode+' '+a.scope+'"><i style="height:'+a.acc+'%"></i><span>'+a.acc+'</span></div>';});
    h+='</div><div class="hint" style="margin-top:20px">柱高=正确率；悬停看时间/模式。最多显示最近 24 次。</div>';
  }else h+='<div class="empty">还没有结算记录。去任意练习页点「结算/交卷」后这里就有数据了。</div>';
  h+='</div>';

  // 知识点弱项
  h+='<div class="card"><h2>知识点弱项（未消化错题按考点聚集）</h2>';
  const kpc={};wrongUnres.forEach(([id])=>{const q=byId(id);if(!q)return;const k=(q.kp&&q.kp[0])||'未分类';kpc[k]=(kpc[k]||0)+1;});
  const kps=Object.entries(kpc).sort((a,b)=>b[1]-a[1]);
  if(kps.length){const mx=kps[0][1];h+='<div class="kpbars">';
    kps.forEach(([k,v])=>{h+='<div class="kpbar"><span class="lab">'+k+'</span><span class="bar"><i style="width:'+(v/mx*100)+'%"></i></span><span>'+v+'</span></div>';});
    h+='</div>';}
  else h+='<div class="empty">暂无未消化错题 👍</div>';
  h+='</div>';

  // 错因归因分布（借鉴数学错题页）：汇总各题勾的「错在哪」标签
  h+='<div class="card"><h2>错因归因分布（你在题目里标的「错在哪」汇总）</h2>';
  const ab=attrBook(),acnt={};let atot=0;
  Object.values(ab).forEach(a=>a.forEach(t=>{acnt[t]=(acnt[t]||0)+1;atot++;}));
  const aents=Object.entries(acnt).sort((a,b)=>b[1]-a[1]);
  if(atot){
    h+='<div class="attrbar">';aents.forEach(([t,v])=>{const ci=ATTR_TAGS.indexOf(t);h+='<i class="seg" style="flex:'+v+';background:'+ATTR_PAL[(ci>=0?ci:0)%ATTR_PAL.length]+'" title="'+t+' '+v+'"></i>';});h+='</div>';
    h+='<div class="attrlegend">';aents.forEach(([t,v])=>{const ci=ATTR_TAGS.indexOf(t);h+='<span><i class="dot" style="background:'+ATTR_PAL[(ci>=0?ci:0)%ATTR_PAL.length]+'"></i>'+t+' '+v+'</span>';});h+='</div>';
    h+='<div class="hint" style="margin-top:8px">占比最大的那类＝你最该针对性补的短板。标签在各章练习题「看核对」展开后勾选。</div>';
  }else h+='<div class="empty">还没标错因。做题展开核对后，点题目里的「🏷 错在哪」标签，这里就有分布了。</div>';
  h+='</div>';

  // 分章结算次数
  h+='<div class="card"><h2>各来源结算次数</h2><table class="tbl"><tr><th>来源</th><th>结算次数</th><th>最近正确率</th><th>最好</th></tr>';
  const byScope={};arr.forEach(a=>{(byScope[a.scope]=byScope[a.scope]||[]).push(a);});
  const scopeKeys=Object.keys(byScope);
  if(scopeKeys.length)scopeKeys.forEach(s=>{const list=byScope[s];const last=list[list.length-1].acc;const best=Math.max(...list.map(x=>x.acc));h+='<tr><td class="l">'+s+'</td><td>'+list.length+'</td><td>'+last+'%</td><td>'+best+'%</td></tr>';});
  else h+='<tr><td colspan="4" class="l" style="color:var(--muted)">暂无</td></tr>';
  h+='</table></div>';

  // 数据管理
  h+='<div class="card"><h2>数据管理（跨设备靠导出/导入）</h2>'
    +'<div class="hint">数据只存在<b>当前浏览器</b>。换设备或清缓存前，先「导出备份」；到新设备「导入」即可恢复。</div>'
    +'<div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">'
    +'<button class="tbtn" id="expJson">⬇ 导出备份(JSON)</button>'
    +'<button class="tbtn" id="impJson">⬆ 导入备份</button>'
    +'<button class="tbtn danger" id="clr">🗑 清空所有记录</button>'
    +'<input type="file" id="impFile" accept="application/json" style="display:none">'
    +'</div></div>';

  root.innerHTML=h;
  $('#expJson').onclick=()=>{const data={ds_attempts_v1:arr,ds_wrong_v1:w,exportedAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='数据结构练习备份_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);toast('已导出备份');};
  $('#impJson').onclick=()=>$('#impFile').click();
  $('#impFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(d.ds_attempts_v1)save(LS_A,d.ds_attempts_v1);if(d.ds_wrong_v1)save(LS_W,d.ds_wrong_v1);toast('导入成功');setTimeout(()=>location.reload(),600);}catch(err){toast('导入失败：文件格式不对');}};r.readAsText(f);};
  $('#clr').onclick=()=>{if(confirm('确定清空所有做题记录和错题本？此操作不可撤销（建议先导出备份）。')){localStorage.removeItem(LS_A);localStorage.removeItem(LS_W);toast('已清空');setTimeout(()=>location.reload(),600);}};
}

/* ---------- 错题本导出报告（给 Claude 分析用） ---------- */
function buildReport(){
  const arr=attempts(), w=wrongBook();
  const unres=Object.entries(w).filter(([id,e])=>!e.res).map(([id,e])=>({q:byId(id),e})).filter(x=>x.q);
  const closed=arr.filter(a=>a.mode==='闭卷');
  const avg=closed.length?Math.round(closed.reduce((s,a)=>s+a.acc,0)/closed.length):'—';
  let r='# 我的数据结构错题报告（'+new Date().toLocaleString()+'）\n\n';
  r+='- 累计结算 '+arr.length+' 次（闭卷 '+closed.length+' 次），闭卷平均正确率 '+avg+'%\n';
  r+='- 当前未消化错题 '+unres.length+' 道\n\n';
  const kpc={};unres.forEach(x=>{const k=(x.q.kp&&x.q.kp[0])||'未分类';kpc[k]=(kpc[k]||0)+1;});
  const kps=Object.entries(kpc).sort((a,b)=>b[1]-a[1]);
  if(kps.length){r+='## 错误知识点聚集（按题数）\n';kps.forEach(([k,v])=>r+='- '+k+' ×'+v+'\n');r+='\n';}
  r+='## 未消化错题清单\n';
  if(!unres.length)r+='（无）\n';
  unres.sort((a,b)=>b.e.n-a.e.n).forEach(x=>{
    r+='- ['+x.q.id+'] '+((x.q.kp&&x.q.kp[0])||'')+(x.q.tag?' | '+x.q.tag:'')+' | 错 '+x.e.n+' 次\n';
    r+='    题干：'+stripHtml(x.q.stem)+(x.q.code?'  代码：'+x.q.code.replace(/\n/g,' '):'')+'\n';
  });
  r+='\n---\n请据此分析：我的薄弱点主要在哪几类？给出①每类考点的进一步理解②针对性的解题/排错技巧③是否需要新增复习卡或专题页。';
  return r;
}

function toast(msg){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800);}

window.DSApp={mount,renderStats,buildReport,pool,attempts,wrongBook,attrBook,toast,
  chapters:()=>DS_META.chapters, byId};
})();
