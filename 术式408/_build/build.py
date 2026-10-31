#!/usr/bin/env python3
"""术式408 构建器。只改 _src/NN.txt 与 _build/plan.py，跑本脚本生成页面；别手改 ep*.html。
源文件语法：
  首行  #! key=val | key=val      元信息（来自 plan.py，可省）
  == 标题 {锚}         小节（进目录）
  === 标题 / ==== 标题  小标题
  :::say / ana 标题 / shu 标题 / trap 标题 / flash 标题 / vow 标题 / link 标题 / domain / rev 问题  …  :::
  :::code c 标题 … :::   代码（文件名写在 _build/tests 校验）
  |a|b|  表格（首行为表头）
  @ 表达式             调 figs/algos 里的函数，返回 HTML
  @q ds:5.3-39 | 老师点评   嵌入真题（超过 2019 的一律报错，留给套卷）
  行内：**粗** ==红== ~~蓝~~ !!金底!! __荧光下划__ `code` x_{1} x^{2} [[12|文字]]链到第12话
"""
import os,re,sys,html,json,collections
HERE=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,HERE)
import figs,qbank,plan
try:
    import algos
except ImportError:
    algos=None
OUT=os.path.join(HERE,'..');SRC=os.path.join(OUT,'_src')
BANK=qbank.load();E=html.escape
SPOIL_FROM=2020
INK='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="rough" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.7"/></filter></svg>'
SHU=[];TRAPS=[];LINKS=[];QUSED={};ANCH={}
def DA(n):
    D='零壹貳參肆伍陸柒捌玖'
    return D[n] if n<10 else ('拾' if n<20 else D[n//10]+'拾')+(D[n%10] if n%10 else '')

def inline(s):
    codes=[]
    def codesub(m):
        codes.append('<code>'+E(m.group(1))+'</code>');return '\0'+str(len(codes)-1)+'\0'
    s=re.sub(r'`([^`\n]+)`',codesub,s)
    s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s)
    s=re.sub(r'==(.+?)==',r'<span class="r">\1</span>',s)
    s=re.sub(r'~~(.+?)~~',r'<span class="bl">\1</span>',s)
    s=re.sub(r'!!(.+?)!!',r'<span class="g">\1</span>',s)
    s=re.sub(r'__(.+?)__',r'<em>\1</em>',s)
    s=re.sub(r'_\{(.+?)\}',r'<sub>\1</sub>',s)
    s=re.sub(r'\^\{(.+?)\}',r'<sup>\1</sup>',s)
    def lk(m):
        ep,_,tx=m.group(1).partition('|');ep,_,an=ep.partition('#')
        return f'<a href="ep{ep}.html{"#"+an if an else ""}">{tx or "第"+ep+"话"}</a>'
    s=re.sub(r'\[\[(.+?)\]\]',lk,s)
    s=re.sub(r'\[([^\]\n]+)\]\(([^)\s]+)\)',r'<a href="\2">\1</a>',s)
    s=re.sub('\0(\\d+)\0',lambda m:codes[int(m.group(1))],s)
    return s

KW=r'\b(int|char|float|double|void|bool|struct|typedef|return|if|else|while|for|do|break|continue|sizeof|unsigned|short|long|const|static|true|false|NULL|switch|case|default|mov|add|sub|cmp|jmp|jne|je|jg|jge|jl|jle|call|ret|push|pop|imul|lea|shl|shr|sal|sar|inc|dec|test|xor|and|or|P|V|semaphore|cobegin|coend|process|wait|signal)\b'
def hl_code(src):
    out=[]
    tok=re.compile(r'(/\*.*?\*/|//[^\n]*|;[^\n]*|"[^"\n]*"|\'[^\'\n]\'|\b0x[0-9A-Fa-f]+\b|\b\d+\b|'+KW+')',re.S)
    i=0;src2=''
    for m in tok.finditer(src):
        src2+=E(src[i:m.start()]);t=m.group(0);i=m.end()
        if t.startswith(('/*','//')): src2+=f'<span class="cm">{E(t)}</span>'
        elif t.startswith(';'):
            # C 语句结尾的分号后紧跟注释时不能吞；只有汇编模式才把 ; 当注释
            src2+=f'<span class="cm">{E(t)}</span>' if HL_ASM[0] else E(';')+hl_inner(t[1:])
        elif t[0] in '"\'': src2+=f'<span class="st">{E(t)}</span>'
        elif t[0].isdigit(): src2+=f'<span class="nu">{E(t)}</span>'
        else: src2+=f'<span class="kw">{E(t)}</span>'
    src2+=E(src[i:])
    return src2
def hl_inner(t):
    if not t: return ''
    return hl_code(t)
HL_ASM=[False]

def render_q(key,note,ep):
    if key not in BANK: raise SystemExit(f'[第{ep}话] 题号不存在: {key}')
    q=BANK[key];y=q.get('exam')
    if y and y>=SPOIL_FROM: raise SystemExit(f'[第{ep}话] {key} 是 {y} 年真题，留给套卷，不得进讲义')
    if key in QUSED: raise SystemExit(f'[第{ep}话] {key} 已在第{QUSED[key]}话用过')
    QUSED[key]=ep
    rel=lambda s:re.sub(r'(src=["\'])图/',r'\1../练习系统/图/',s or '')
    stem=rel(q['stem'])
    stem=re.sub(r'^【[^】]*】','',stem)
    html_='';
    for f,cp in (('fig','figcap'),):
        if q.get(f):
            has=os.path.exists(os.path.join(OUT,'..','练习系统',q[f]))
            stem+=(f'<img loading="lazy" src="../练习系统/{q[f]}" alt="题图">' if has else '')+(f'<div class="dim" style="text-align:center">{q.get(cp,"")}</div>' if q.get(cp) else '')
    code=''
    if q.get('code') and (q.get('codeStem') or q['type']=='choice'): stem+=f'<pre>{E(q["code"])}</pre>'
    elif q.get('code'): code=f'<pre>{E(q["code"])}</pre>'
    head=f'<div class="qh"><span class="yr">{y if y else "教材"}</span><span class="lb">實戰</span><span class="tagq">{E(" · ".join(q.get("kp",[]))[:40])}</span></div>'
    book=rel(q.get('book',''));ext=rel(q.get('claude',''))
    ext=re.sub(r'^\s*(一致[。．.，,]?\s*(<br\s*/?>)?)','',ext)
    extra=''
    if q.get('figA') and os.path.exists(os.path.join(OUT,'..','练习系统',q['figA'])): book+=f'<img loading="lazy" src="../练习系统/{q["figA"]}" alt="答案图">'
    if ext.strip(): extra=f'<details><summary>再深一层</summary><div>{ext}</div></details>'
    sensei=f'<div class="sensei">{inline(note)}</div>' if note else ''
    qid=key.replace(':','_')
    if q['type']=='choice' and q.get('opts'):
        ops=''.join(f'<button class="opt" data-k="{"ABCD"[i]}"><b>{"ABCD"[i]}</b><span>{rel(str(o))}</span></button>' for i,o in enumerate(q['opts']))
        return f'<div class="q pop" id="q-{qid}" data-ans="{q["ans"]}">{head}<div class="stem">{stem}</div><div class="opts">{ops}</div><div class="ansb"><p class="verdict"></p>{book}{sensei}{extra}</div></div>'
    return f'<div class="q pop" id="q-{qid}" data-ans="">{head}<div class="stem">{stem}</div><button class="showa">自己写完再翻参考答案</button><div class="ansb">{book}{code}{sensei}{extra}</div></div>'

ENV=dict(figs.__dict__)
if algos: ENV.update(algos.__dict__)
LABEL={'ana':'比方','shu':'术式','trap':'咒灵','vow':'束缚','link':'因果'}

def render(src,ep,title):
    lines=src.split('\n');i=0;out=[];toc=[];para=[];secn=0
    def flush():
        if para:
            t=' '.join(para).strip();para.clear()
            if t: out.append(f'<p>{inline(t)}</p>')
    def body(ls):
        return render_block('\n'.join(ls))
    def render_block(tx,hard=False):
        sub,_=parse(tx.split('\n'),False,hard);return sub
    def parse(lines,top=True,hard=False):
        nonlocal secn
        i=0;o=[];par=[];tc=[]
        def fl():
            if par:
                t=('<br>' if hard else ' ').join(par).strip();par.clear()
                if t:o.append(f'<p>{inline(t)}</p>')
        while i<len(lines):
            l=lines[i];s=l.strip()
            if s.startswith(':::') and len(s)>3:
                fl();m=re.match(r':::(\w+)\s*(.*)',s);k,arg=m.group(1),m.group(2)
                j=i+1;depth=0;buf=[]
                while j<len(lines):
                    t=lines[j].strip()
                    if k!='code' and t.startswith(':::') and len(t)>3: depth+=1
                    elif t==':::':
                        if depth==0:break
                        depth-=1
                    buf.append(lines[j]);j+=1
                else: raise SystemExit(f'[第{ep}话] 块未闭合: {s}')
                i=j+1
                if k=='code':
                    lang,_,ttl=arg.partition(' ');HL_ASM[0]=lang=='asm'
                    code='\n'.join(buf)
                    o.append(f'<div class="code pop"><div class="h"><span>{E(ttl or lang.upper())}</span><button class="bl">默写</button></div><pre>{hl_code(code)}</pre></div>')
                    continue
                inner=render_block('\n'.join(buf),k in('shu','domain'))
                raw='\n'.join(buf)
                if k=='say': o.append(f'<div class="say pop">{inner}</div>')
                elif k=='think': o.append(f'<div class="say think pop">{inner}</div>')
                elif k in('ana','shu','trap','vow','link'):
                    h=f'<h5>{inline(arg)}</h5>' if arg else ''
                    if k=='ana' and arg: h=f'<h4 style="margin:0 0 2px">{inline(arg)}</h4>'
                    if k=='vow' and arg: h=f'<h4 style="margin:0 0 2px">{inline(arg)}</h4>'
                    if k=='link' and arg: h=f'<h4 style="margin:0 0 2px;color:var(--blue)">{inline(arg)}</h4>'
                    o.append(f'<div class="{k} pop"><span class="side">{LABEL[k]}</span>{h}{inner}</div>')
                    if k=='shu': SHU.append((ep,title,arg,inner))
                    if k=='trap': TRAPS.append((ep,title,arg,inner))
                    if k=='link': LINKS.append((ep,title,arg,inner))
                elif k=='flash': o.append(f'<div class="flash pop">'+(f'<h5>{inline(arg)}</h5>' if arg else '')+f'{inner}</div>')
                elif k=='domain': o.append(f'<div class="domain pop"><h5>领域展开</h5><div class="dtx">{inner}</div></div>')
                elif k=='rev': o.append(f'<div class="rev pop"><div class="qq">{inline(arg)}</div><button class="open">想好了，翻开</button><div class="aa">{inner}</div></div>')
                elif k=='fml': o.append('<div class="fml">'+inline(raw.strip()).replace('\n','<br>')+'</div>')
                elif k=='html': o.append(raw)
                else: raise SystemExit(f'[第{ep}话] 未知块 {k}')
                continue
            if s.startswith('@q '):
                fl();key,_,note=s[3:].partition('|');o.append(render_q(key.strip(),note.strip(),ep));i+=1;continue
            if s.startswith('@ '):
                fl();expr=s[2:]
                # 跨行表达式：括号未闭合继续读
                while expr.count('(')+expr.count('[')+expr.count('{')>expr.count(')')+expr.count(']')+expr.count('}'):
                    i+=1;expr+='\n'+lines[i]
                try: o.append(eval(expr,ENV))
                except Exception as e: raise SystemExit(f'[第{ep}话] @ 表达式出错: {expr[:80]} → {e}')
                i+=1;continue
            m=re.match(r'^(={2,4})\s+(.*?)(?:\s*\{(\S+)\})?\s*$',s)
            if m and top is not None:
                fl();lv=len(m.group(1));t=m.group(2);a=m.group(3)
                if lv==2:
                    secn+=1;a=a or f's{secn}';tc.append((a,t));ANCH[f'{ep}#{a}']=t
                    o.append(f'<h2 id="{a}"><i>其之{DA(secn)}</i>{inline(t)}</h2>')
                elif lv==3:
                    idt=f' id="{a}"' if a else ''
                    if a: ANCH[f'{ep}#{a}']=t
                    o.append(f'<h3{idt}>{inline(t)}</h3>')
                else: o.append(f'<h4>{inline(t)}</h4>')
                i+=1;continue
            if s.startswith('|') and s.endswith('|'):
                fl();rows=[]
                while i<len(lines) and lines[i].strip().startswith('|'):
                    c=lines[i].strip()[1:-1];parts=[x.strip() for x in re.split(r'(?<!\\)\|',c)]
                    if not all(re.fullmatch(r':?-+:?',x) for x in parts):rows.append([inline(x.replace('\\|','|')) for x in parts])
                    i+=1
                o.append(figs.table(rows));continue
            m=re.match(r'^(\d+\.|[-·])\s+(.*)',s)
            if m:
                fl();ord_=m.group(1)[0].isdigit();items=[]
                while i<len(lines):
                    mm=re.match(r'^(\d+\.|[-·])\s+(.*)',lines[i].strip())
                    if not mm:break
                    items.append(f'<li>{inline(mm.group(2))}</li>');i+=1
                tg='ol' if ord_ else 'ul';o.append(f'<{tg}>'+''.join(items)+f'</{tg}>');continue
            if not s: fl();i+=1;continue
            par.append(s);i+=1
        fl()
        return ''.join(o),tc
    h,tc=parse(lines,True)
    return h,tc

def freq(secs):
    if not secs: return ''
    cnt=collections.Counter()
    for k,q in BANK.items():
        if not q.get('exam'):continue
        sub,_=k.split(':',1);s=q.get('sec','')
        for pat in secs:
            sb,_,pre=pat.partition(':')
            if sb==sub and (s.startswith(pre) if not pre.startswith('~') else re.search(pre[1:],s+' '+' '.join(q.get('kp',[]))+' '+re.sub('<[^>]+>','',q['stem'])[:120])): cnt[q['exam']]+=1;break
    tot=sum(cnt.values());hit=sum(1 for y in range(2009,2026) if cnt[y])
    cells_=''
    for y in range(2009,2026):
        c=cnt[y];lv='' if c==0 else 'l1' if c==1 else 'l2' if c==2 else 'l3'
        cells_+=f'<div class="y {lv}" title="{y}：{c} 题">{str(y)[2:]}</div>'
    return f'<div class="freq pop"><b class="t">真题火力｜2009–2025 这一话的考点出现 {tot} 题，覆盖 {hit}/17 年</b><div class="yrs">{cells_}</div><small>空白 = 没考 · 网点 = 1 题 · 黑 = 2 题 · 红 = 3 题及以上（由题库逐题统计）</small></div>'

def shell(title,body,ep='',toc='',now='',prog=True):
    return f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(title)}</title><link rel="stylesheet" href="assets/style.css?v={plan.VER}"><script src="assets/app.js?v={plan.VER}"></script></head><body data-ep="{ep}">{INK}<div class="bar"><a class="logo" href="index.html" aria-label="术式408"><img src="assets/ink/hero.webp" alt=""><b>408</b></a><span class="now">{E(now)}</span><span class="sp"></span><a href="术式录.html">术式录</a><a href="咒灵录.html">咒灵录</a><button id="neg" title="切换黑白反转">反转</button></div>{'<div class="prog"></div>' if prog else ''}{body}</body></html>'''

SJ={'ds':'数据结构','co':'组成原理','os':'操作系统','net':'计算机网络'}
def main():
    only=sys.argv[1:]
    eps=plan.EPS;idx={e['id']:i for i,e in enumerate(eps)}
    built=[]
    for e in eps:
        p=os.path.join(SRC,e['id']+'.txt')
        if not os.path.exists(p): continue
        built.append(e['id'])
        src=open(p,encoding='utf8').read()
        h,tc=render(src,e['id'],e['title'])
        vol=plan.VOLS[e['vol']]
        sj=' '.join(f'<span>{SJ[x]}</span>' for x in e['subj'])
        cover=f'''<div class="cover"><div class="spd"></div><img class="bigk" src="assets/ink/k/{e['id']}.webp" alt="" aria-hidden="true"><div class="cin"><span class="vol">{vol['name'].replace('卷','巻')}</span><div class="no">第 {e['id']} 話</div><h1><img class="ttl" src="assets/ink/t/{e['id']}.webp" alt="{E(e['title'])}"></h1><div class="sub">{E(e['sub'])}</div><div class="meta">{sj}<span>约 {e['min']} 分钟</span></div></div></div>'''
        i=idx[e['id']]
        pv=eps[i-1] if i>0 else None;nx=eps[i+1] if i+1<len(eps) else None
        fin='<button class="seal"></button><div class="fin">'
        if pv:fin+=f'<a href="ep{pv["id"]}.html"><small>◀ 上一话 · 第{pv["id"]}话</small>{E(pv["title"])}</a>'
        if nx:fin+=f'<a href="ep{nx["id"]}.html" style="text-align:right"><small>下一话 · 第{nx["id"]}话 ▶</small>{E(nx["title"])}</a>'
        fin+='</div>'
        tochtml='<nav class="toc">'+''.join(f'<a href="#{a}">{re.sub("<[^>]+>","",inline(t))}</a>' for a,t in tc)+'</nav>'
        page=f'{tochtml}<div class="vside" style="--u:url(ink/vs/{e["vol"]}.webp)" aria-hidden="true"></div><main class="wrap">{cover}{freq(e.get("secs",[]))}{h}{fin}</main>'
        open(os.path.join(OUT,f'ep{e["id"]}.html'),'w',encoding='utf8').write(shell(f'第{e["id"]}话 {e["title"]}｜术式408',page,e['id'],now=f'第{e["id"]}话 {e["title"]}'))
    import pages
    pages.build(OUT,eps,built,shell,inline,SHU,TRAPS,LINKS,QUSED,ANCH,plan,BANK,SJ,INK)
    ws=sum(len(re.sub(r'\s','',open(os.path.join(SRC,b+'.txt'),encoding='utf8').read())) for b in built)
    print(f'built {len(built)}/{len(eps)} eps, src chars={ws}, questions={len(QUSED)}, shu={len(SHU)}, trap={len(TRAPS)}, link={len(LINKS)}')
main()
