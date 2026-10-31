# 首页、术式录、咒灵录、因果录、错题页、考纲对照
import os,re,html
E=html.escape
def build(OUT,eps,built,shell,inline,SHU,TRAPS,LINKS,QUSED,ANCH,plan,BANK,SJ,INK):
    bs=set(built)
    def W(n,t,b,prog=False): open(os.path.join(OUT,n),'w',encoding='utf8').write(shell(t,b,prog=prog))
    # 首页
    fu=[('ep01','0','数据结构'),('ep16','1','组成原理'),('ep23','2','操作系统'),('ep41','3','计算机网络')]
    fus=''.join(f'<a class="fu fu{n}" href="{h}.html" title="{t}：从这里开始"><img src="assets/ink/fu{n}.webp" alt="{t}"></a>' for h,n,t in fu)
    hero=f'<div class="hero"><div class="spd"></div><div class="ens"></div><div class="fl"></div><div class="fus">{fus}</div><div class="in"><h1 aria-label="术式408"><img class="h1a" src="assets/ink/hero.webp" alt=""><img class="h1b" src="assets/ink/hero408.webp" alt=""></h1><div class="tl">四门课拆碎，按依赖重排的伪一轮。<br>读完去开套卷。目标：<b>100 分</b>。</div></div></div>'
    go=f'''<div class="go"><a class="pri" id="cont" href="ep00.html">继续读<small>从第 00 话开始</small></a><a href="术式录.html">术式录<small>全部公式与模板，考前背这页</small></a><a href="咒灵录.html">咒灵录<small>全部陷阱汇总</small></a><a href="错题.html">错题<small>话内实战做错的自动进这里</small></a><a href="考纲.html">考纲对照<small>2027 大纲逐条 → 第几话</small></a></div>'''
    prog='<div class="pb"><i id="pbar" style="width:0"></i></div><div class="dim" id="ptxt" style="font-family:var(--goth);font-weight:700">已读 0 话</div>'
    day='<h2 style="margin-top:30px"><i>日程</i>十四天排期</h2><p style="font:500 15px/1.75 var(--goth)">每天约 3 小时，包含话内实战。可以压到十天或放宽到两周，但<b>顺序别动</b>——后面的话会直接用前面的结论。</p><div class="plan">'
    for d,t,l in plan.DAYS:
        lk=' '.join(f'<a href="ep{x}.html">{x}</a>' for x in l)
        mins=sum(e['min'] for e in eps if e['id'] in l)
        day+=f'<div class="day" data-eps="{",".join(l)}"><b>{d}</b>{E(t)}<br>{lk}<div class="dim">{mins} 分钟</div></div>'
    day+='</div>'
    vols=''
    for v,info in plan.VOLS.items():
        items=''
        for e in eps:
            if e['vol']!=v:continue
            sj=''.join(f'<span class="sj">{SJ[x]}</span>' for x in e['subj'])
            href=f'ep{e["id"]}.html' if e['id'] in bs else '#'
            style='' if e['id'] in bs else ' style="opacity:.42;pointer-events:none"'
            items+=f'<a class="ep pop" data-ep="{e["id"]}" href="{href}"{style}><span class="num">{e["id"]}</span><span class="wm" style="--u:url(ink/k/{e["id"]}.webp)" aria-hidden="true"></span><span><span class="tt">{E(e["title"])}</span><div class="st">{E(e["sub"])}</div><div class="sb">{sj}</div></span></a>'
        vols+=f'<section class="vol"><h2 class="volh"><i>{info["name"].replace("卷","巻")}</i><img src="assets/ink/v/{v}.webp" alt="{E(info["title"])}"></h2><p><b>{E(info["title"])}</b>　{E(info["desc"])}</p><div class="eps">{items}</div></section>'
    W('index.html','术式408',hero+f'<main class="home">{go}{prog}{day}{vols}</main>')
    # 术式录 / 咒灵录 / 因果
    def pc(key,title):return f'<div class="cover pcover"><div class="spd"></div><div class="cin"><h1><img class="ttl" src="assets/ink/p/{key}.webp" alt="{title}"></h1></div></div>'
    def coll(fn,title,lead,arr,cls,side,key):
        body=f'<main class="wrap">{pc(key,title)}<p style="font:500 15.5px/1.8 var(--goth)">{lead}</p>'
        ep_=None
        for ep,tt,h,inner in arr:
            if ep!=ep_:
                body+=f'<h2><i>第{ep}话</i><a href="ep{ep}.html" style="text-decoration:none">{E(tt)}</a></h2>';ep_=ep
            head=f'<h5>{inline(h)}</h5>' if h else ''
            if cls=='link' and h: head=f'<h4 style="margin:0 0 2px;color:var(--blue)">{inline(h)}</h4>'
            body+=f'<div class="{cls}"><span class="side">{side}</span>{head}{inner}</div>'
        W(fn,title+'｜术式408',body+'</main>')
    coll('术式录.html','术式录',f'全部 {len(SHU)} 条公式与模板，顺序同讲义。考前一周每天过一遍，看到标题先自己默写。',SHU,'shu','术式','shu')
    coll('咒灵录.html','咒灵录',f'全部 {len(TRAPS)} 个陷阱。每一个都是有人（包括命题人预期中的你）掉进去过的坑。',TRAPS,'trap','咒灵','trap')
    coll('因果录.html','因果录',f'{len(LINKS)} 条跨章跨科的连接。408 综合题爱从这些地方跨，读完一卷回来扫一眼。',LINKS,'link','因果','link')
    # 错题
    W('错题.html','错题｜术式408',f'<main class="wrap">{pc("wrong","错题")}<p id="wsum" style="font:700 15px/1.8 var(--goth)"></p><div class="eps" id="wlist"></div></main>')
    # 考纲
    t=''
    for sub,rows in plan.SYL.items():
        rr=[['2027 大纲条目','讲义']]
        for it,ep in rows:
            e=next(x for x in eps if x['id']==ep)
            rr.append([E(it),f'<a href="ep{ep}.html" style="white-space:nowrap">第{ep}话 {E(e["title"])}</a>'])
        from figs import table
        t+=f'<h2>{sub}</h2>'+table(rr)
    W('考纲.html','考纲对照｜术式408',f'<main class="wrap">{pc("syl","考纲对照")}<p style="font:500 15.5px/1.8 var(--goth)">《2027 年全国硕士研究生招生考试计算机学科专业基础考试大纲》考查内容逐条到话。</p>{t}</main>')
