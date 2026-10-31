(function(){
var D=document,R=D.documentElement;R.classList.add('js');
function get(k,d){try{var v=localStorage.getItem('sx408_'+k);return v?JSON.parse(v):d}catch(e){return d}}
function set(k,v){try{localStorage.setItem('sx408_'+k,JSON.stringify(v))}catch(e){}}
window.SX={get:get,set:set};
var m=get('mode','');if(m)R.setAttribute('data-mode',m);
D.addEventListener('DOMContentLoaded',function(){
 // 反转（深色）
 var t=D.getElementById('neg');if(t)t.onclick=function(){var n=R.getAttribute('data-mode')==='neg'?'':'neg';if(n)R.setAttribute('data-mode',n);else R.removeAttribute('data-mode');set('mode',n)};
 // 分格入场
 var ps=D.querySelectorAll('.pop');
 if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});ps.forEach(function(p){io.observe(p)})}else ps.forEach(function(p){p.classList.add('in')});
 // 阅读进度 + 目录高亮
 var pg=D.querySelector('.prog'),tl=D.querySelectorAll('.toc a'),hs=[].map.call(tl,function(a){return D.getElementById(a.getAttribute('href').slice(1))}),tick=false;
 function onS(){tick=false;var h=R.scrollHeight-innerHeight;if(pg)pg.style.width=(h>0?scrollY/h*100:0)+'%';var cur=-1;hs.forEach(function(x,i){if(x&&x.getBoundingClientRect().top<120)cur=i});tl.forEach(function(a,i){a.classList.toggle('on',i===cur)})}
 addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onS)}},{passive:true});onS();
 // 步进器
 D.querySelectorAll('.stp').forEach(function(s){if(!s.querySelector('.frame'))return;var f=s.querySelectorAll('.frame'),i=0,n=s.querySelector('.n'),r=s.querySelector('input'),T=null;
  function go(k){i=Math.max(0,Math.min(f.length-1,k));f.forEach(function(x,j){x.classList.toggle('on',j===i)});n.textContent=(i+1)+' / '+f.length;r.value=i}
  r.max=f.length-1;r.oninput=function(){go(+r.value)};
  s.querySelector('.pv').onclick=function(){go(i-1)};s.querySelector('.nx').onclick=function(){go(i+1)};
  var pl=s.querySelector('.pl');pl.onclick=function(){if(T){clearInterval(T);T=null;pl.textContent='▶ 自动';return}pl.textContent='❚❚ 暂停';if(i===f.length-1)go(0);T=setInterval(function(){if(i===f.length-1){clearInterval(T);T=null;pl.textContent='▶ 自动';return}go(i+1)},1700)};go(0)});
 // 先想再翻
 D.querySelectorAll('.rev .open').forEach(function(b){b.onclick=function(){b.parentNode.classList.add('on')}});
 // 代码默写遮挡
 D.querySelectorAll('.code .bl').forEach(function(b){b.onclick=function(){var c=b.closest('.code');c.classList.toggle('blind');b.textContent=c.classList.contains('blind')?'显示':'默写'}});
 // 题
 var rec=get('q',{}),ep=D.body.getAttribute('data-ep')||'';
 D.querySelectorAll('.q').forEach(function(q){var id=q.id.slice(2),a=q.getAttribute('data-ans'),os=q.querySelectorAll('.opt');
  function show(c,save){q.classList.add('done');os.forEach(function(o){var L=o.getAttribute('data-k');if(L===a)o.classList.add('yes');else if(L===c)o.classList.add('no')});var v=q.querySelector('.verdict');if(v&&c){v.textContent=c===a?'命中 —— 答案 '+a:'被咒灵咬了 —— 你选 '+c+'，答案 '+a;v.style.color=c===a?'':'var(--red)'}else if(v)v.textContent='答案 '+a;
   if(save){rec[id]={c:c,ok:c===a,ep:ep,t:Date.now(),s:(q.querySelector('.stem').textContent||'').slice(0,70)};set('q',rec)}}
  os.forEach(function(o){o.onclick=function(){if(q.classList.contains('done'))return;show(o.getAttribute('data-k'),true)}});
  var sa=q.querySelector('.showa');if(sa)sa.onclick=function(){q.classList.add('done');sa.remove();rec[id]={c:'',ok:true,ep:ep,t:Date.now(),s:(q.querySelector('.stem').textContent||'').slice(0,70)};set('q',rec)};
  if(rec[id]){if(os.length)show(rec[id].c,false);else{q.classList.add('done');if(sa)sa.remove()}
   var rb=D.createElement('button');rb.textContent='重做';rb.style.cssText='all:unset;cursor:pointer;margin-left:6px;font-size:11px;border:1px solid currentColor;padding:2px 5px';rb.onclick=function(){delete rec[id];set('q',rec);location.reload()};q.querySelector('.qh').appendChild(rb)}
 });
 // 盖章：读完
 var seal=D.querySelector('.seal');if(seal){var rd=get('read',{});function st(){var on=!!rd[ep];seal.classList.toggle('on',on);seal.textContent=on?'読 · 已读完（再点撤销）':'这一话读完了，盖章'}st();seal.onclick=function(){if(rd[ep])delete rd[ep];else rd[ep]=Date.now();set('read',rd);st()};set('last',ep)}
 // 首页
 var rd2=get('read',{}),eps=D.querySelectorAll('.ep[data-ep]');if(eps.length){var c=0;eps.forEach(function(e){if(rd2[e.getAttribute('data-ep')]){e.classList.add('read');c++}});var bar=D.getElementById('pbar');if(bar){bar.style.width=(c/eps.length*100)+'%';D.getElementById('ptxt').textContent='已读 '+c+' / '+eps.length+' 话'}
  var last=get('last','');var ct=D.getElementById('cont');if(ct){var nxt=null;for(var i=0;i<eps.length;i++){if(!rd2[eps[i].getAttribute('data-ep')]){nxt=eps[i];break}}if(nxt){ct.href=nxt.getAttribute('href');ct.querySelector('small').textContent='下一话：'+nxt.querySelector('.tt').textContent}}
  D.querySelectorAll('.day').forEach(function(d){var l=d.getAttribute('data-eps').split(',');if(l.every(function(x){return rd2[x]}))d.classList.add('done')});
  var fd=null;D.querySelectorAll('.day').forEach(function(d){if(!fd&&!d.classList.contains('done'))fd=d});if(fd)fd.classList.add('today')}
 // 错题页
 var wl=D.getElementById('wlist');if(wl){var arr=Object.keys(rec).map(function(k){return Object.assign({id:k},rec[k])}).filter(function(x){return x.ok===false}).sort(function(a,b){return b.t-a.t});
  var all=Object.keys(rec).length,okc=Object.keys(rec).filter(function(k){return rec[k].ok}).length;D.getElementById('wsum').textContent='已做 '+all+' 题 · 对 '+okc+' · 错 '+arr.length;
  wl.innerHTML=arr.length?arr.map(function(x){var d=D.createElement('div');d.textContent=x.s;return '<a class="ep" href="ep'+x.ep+'.html#q-'+x.id+'"><span class="num">'+x.ep+'</span><span><span class="tt">'+x.id+'</span><div class="st">'+d.innerHTML+'…</div></span></a>'}).join(''):'<p class="warn">暂时没有错题。</p>'}
});
})();
