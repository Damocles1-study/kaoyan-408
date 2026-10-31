# 图形助手：统一墨线风格，所有图都由数据生成（颜色走 CSS 变量，反转模式自动适配）
import html,re,math
E=lambda s:html.escape(str(s),quote=False)
_mid=[0]
def _svg(w,h,body,cap=''):
    _mid[0]+=1
    defs=(f'<defs><pattern id="tone" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" style="fill:var(--ink);opacity:.45"/></pattern></defs>')
    s=f'<svg viewBox="0 0 {w:g} {h:g}" width="{w:g}" role="img">{defs}{body}</svg>'
    return f'<figure class="pop">{s}'+(f'<figcaption>{cap}</figcaption>' if cap else '')+'</figure>'
def T(x,y,t,size=14,cls='',a='middle',w=None):
    wt=f' font-weight="{w}"' if w else ''
    return f'<text x="{x:g}" y="{y:g}" text-anchor="{a}" dominant-baseline="central" font-size="{size}" class="{cls}"{wt}>{E(t)}</text>'
def box(x,y,w,h,t='',cls='bx',size=14,tc=None):
    tc=tc if tc is not None else {'bk':'bkt','rd':'wt','gd':'gdt','bu':'but'}.get(cls,'')
    out=f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" class="{cls}"/>'
    if t!='':
        ls=str(t).split('\n');n=len(ls)
        for i,l in enumerate(ls):
            out+=T(x+w/2,y+h/2+(i-(n-1)/2)*(size+3),l,size,tc)
    return out
def arrow(x1,y1,x2,y2,cls='ln',head=True,size=8,dash=False):
    d=math.hypot(x2-x1,y2-y1) or 1
    ux,uy=(x2-x1)/d,(y2-y1)/d
    ex,ey=x2-ux*(size-1),y2-uy*(size-1)
    da=' stroke-dasharray="5 4"' if dash else ''
    o=f'<line x1="{x1:g}" y1="{y1:g}" x2="{ex:g}" y2="{ey:g}" class="{cls}"{da}/>'
    if head:
        hc='har' if cls=='rdl' else 'ha'
        o+=f'<polygon class="{hc}" points="{x2:g},{y2:g} {x2-ux*size-uy*size*.5:g},{y2-uy*size+ux*size*.5:g} {x2-ux*size+uy*size*.5:g},{y2-uy*size-ux*size*.5:g}"/>'
    return o
def svg(w,h,*parts,cap=''):
    return _svg(w,h,''.join(parts),cap)

# ---------- 树 ----------
def _parse(s):
    s=s.replace(' ','');i=[0]
    def node():
        j=i[0]
        while i[0]<len(s) and s[i[0]] not in '(),': i[0]+=1
        name=s[j:i[0]];ch=[]
        if i[0]<len(s) and s[i[0]]=='(':
            i[0]+=1
            while True:
                ch.append(node())
                if s[i[0]]==',': i[0]+=1;continue
                if s[i[0]]==')': i[0]+=1;break
        return {'n':name,'c':ch}
    return node()
def tree(spec,hl='',cap='',binary=True,r=17,dx=44,dy=58,hr='',labels=None,bare=False,edge_hl=''):
    """spec 形如 A(B(D,E),C(,F))；空串占位=空孩子；节点 '10:r' 红 '10:b' 黑。hl 逗号分隔高亮节点。"""
    root=_parse(spec);hl=set(x for x in hl.split(',') if x);pos={};xs=[0]
    def lay(n,d):
        kids=n['c']
        if binary and len(kids)==1: kids=n['c']=[kids[0],{'n':'','c':[]}]
        if binary and kids:
            L,Rr=kids
            if L['n']: lay(L,d+1)
            n['x']=xs[0];xs[0]+=1;n['d']=d
            if Rr['n']: lay(Rr,d+1)
        elif kids:
            real=[k for k in kids if k['n']]
            for k in real: lay(k,d+1)
            n['x']=(real[0]['x']+real[-1]['x'])/2;n['d']=d
        else:
            n['x']=xs[0];xs[0]+=1;n['d']=d
    lay(root,0)
    body='';nodes=[]
    maxd=[0]
    def walk(n):
        X=n['x']*dx+r+8;Y=n['d']*dy+r+8;maxd[0]=max(maxd[0],n['d']);nodes.append((n,X,Y))
        for k in n['c']:
            if k['n']:
                walk(k);X2=k['x']*dx+r+8;Y2=k['d']*dy+r+8
                body_lines.append(f'<line x1="{X:g}" y1="{Y:g}" x2="{X2:g}" y2="{Y2:g}" class="{"rdl" if k["n"].split(":")[0] in edge_hl.split(",") else "ln"}"/>')
    body_lines=[];walk(root)
    body=''.join(body_lines)
    for n,X,Y in nodes:
        name=n['n'];col=''
        if ':' in name: name,col=name.split(':')
        cls='bx';tc=''
        if col=='r': cls='rd';tc='wt'
        elif col=='b': cls='bk';tc='bkt'
        if name in hl: cls='gd';tc='gdt'
        body+=f'<circle cx="{X:g}" cy="{Y:g}" r="{r}" class="{cls}"/>'+T(X,Y,name,13 if len(name)>2 else 15,tc,w=700)
        if labels and name in labels: body+=T(X,Y-r-7,labels[name],11,'rdt')
    W=(max(n['x'] for n,_,_ in nodes))*dx+2*r+16;H=maxd[0]*dy+2*r+16
    if bare: return _bare(W,H,body)
    return _svg(W,H,body,cap)
def _bare(w,h,b): return f'<svg viewBox="0 0 {w:g} {h:g}" width="{w:g}" style="max-width:100%;height:auto;display:block;margin:0 auto"><defs><pattern id="tone" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" style="fill:var(--ink);opacity:.45"/></pattern></defs>{b}</svg>'

# ---------- 数组 ----------
def cells(a,hl=None,idx=None,cw=44,ch=38,cap='',bare=False,ptr=None,base=0,gray=None):
    """hl: {下标:类名 rd/gd/bk/bu}；ptr: {下标:'i'}；gray: 下标集合（网点）"""
    hl=hl or {};ptr=ptr or {};gray=gray or []
    n=len(a);top=24 if ptr else 4;W=n*cw+8;H=top+ch+(20 if idx is not False else 4)
    b=''
    for i,v in enumerate(a):
        c=hl.get(i,'tn' if i in gray else 'bx')
        b+=box(4+i*cw,top,cw,ch,v,c,15 if len(str(v))<5 else 12)
        if idx is not False: b+=T(4+i*cw+cw/2,top+ch+11,(idx[i] if isinstance(idx,(list,tuple)) else i+base),11,'mt')
        if i in ptr: b+=T(4+i*cw+cw/2,10,ptr[i],13,'rdt',w=800)+arrow(4+i*cw+cw/2,17,4+i*cw+cw/2,top-1,'rdl',size=6)
    if bare: return _bare(W,H,b)
    return _svg(W,H,b,cap)

# ---------- 链表 ----------
def chain(a,cap='',hl=None,head=None,double=False,circ=False,cw=46,gap=30,null=True,bare=False,ptr=None):
    hl=hl or {};ptr=ptr or {};b='';x=6;y=30 if not circ else 30;h=34
    n=len(a)
    if head: b+=T(x+18,y+h/2,head,13,'rdt',w=800);x+=36;b+=arrow(x-4,y+h/2,x+gap-14,y+h/2);x+=gap-12
    xs=[]
    for i,v in enumerate(a):
        c=hl.get(i,'bx')
        b+=box(x,y,cw,h,v,c)
        b+=box(x+cw,y,16,h,'','bx')
        b+=f'<circle cx="{x+cw+8}" cy="{y+h/2}" r="2.5" class="bk"/>'
        xs.append(x)
        if i in ptr: b+=T(x+cw/2,y-13,ptr[i],13,'rdt',w=800)+arrow(x+cw/2,y-6,x+cw/2,y-1,'rdl',size=5)
        if i<n-1:
            b+=arrow(x+cw+8,y+h/2-(5 if double else 0),x+cw+16+gap,y+h/2-(5 if double else 0))
            if double: b+=arrow(x+cw+16+gap,y+h/2+6,x+cw+16,y+h/2+6)
        x+=cw+16+gap
    endx=xs[-1]+cw+16
    if circ:
        b+=f'<path d="M{endx-8} {y+h} v22 H{xs[0]+cw/2} v-20" class="ln"/>'+arrow(xs[0]+cw/2,y+h+6,xs[0]+cw/2,y+h)
        H=y+h+30
    else:
        H=y+h+8
        if null: b+=T(endx+6,y+h/2,'∧',16,'',a='start')
    W=endx+30
    if bare: return _bare(W,H,b)
    return _svg(W,H,b,cap)

# ---------- 图 ----------
def graph(nodes,edges,cap='',directed=False,hl='',hledges=None,r=16,bare=False,w=None,h=None,colors=None):
    """nodes={名:(x,y)}；edges=[(a,b)或(a,b,权)]；hledges 为要加红的边"""
    hl=set(x for x in hl.split(',') if x);hle=set()
    colors=colors or {}
    for e in (hledges or []): hle.add((e[0],e[1]));
    if not directed: hle|={(b,a) for a,b in hle}
    xs=[p[0] for p in nodes.values()];ys=[p[1] for p in nodes.values()]
    W=w or max(xs)+r+14;H=h or max(ys)+r+14;bo=''
    for e in edges:
        a,b_=e[0],e[1];x1,y1=nodes[a];x2,y2=nodes[b_];d=math.hypot(x2-x1,y2-y1);ux,uy=(x2-x1)/d,(y2-y1)/d
        c='rdl' if (a,b_) in hle else 'ln'
        bo+=arrow(x1+ux*r,y1+uy*r,x2-ux*r,y2-uy*r,c,head=directed)
        if len(e)>2:
            mx,my=(x1+x2)/2-uy*11,(y1+y2)/2+ux*11
            bo+=f'<rect x="{mx-9}" y="{my-9}" width="18" height="18" style="fill:var(--panel)"/>'+T(mx,my,e[2],12.5,'rdt' if c=='rdl' else '',w=700)
    for k,(x,y) in nodes.items():
        c='gd' if k in hl else colors.get(k,'bx')
        tc={'gd':'gdt','bk':'bkt','rd':'wt','bu':'but'}.get(c,'')
        bo+=f'<circle cx="{x}" cy="{y}" r="{r}" class="{c}"/>'+T(x,y,k,14,tc,w=800)
    if bare: return _bare(W,H,bo)
    return _svg(W,H,bo,cap)

# ---------- 位字段 ----------
def bits(fields,cap='',unit=None,total=None,cw=None,h=38,W=680,labels=True,bare=False):
    """fields=[(名,位数[,类])]：宽度按位数比例（最小可读宽度保护），上方标位数。"""
    tot=sum(f[1] if isinstance(f[1],(int,float)) else 1 for f in fields)
    minw=44;x=4;b='';n=len(fields)
    raw=[(f[1] if isinstance(f[1],(int,float)) else 1) for f in fields]
    ws=[max(minw,(W-8)*r/tot) for r in raw];sc=(W-8)/sum(ws);ws=[v*sc for v in ws]
    for f,wd in zip(fields,ws):
        c=f[2] if len(f)>2 else 'bx'
        b+=box(x,20,wd,h,f[0],c,13)
        if labels: b+=T(x+wd/2,10,f"{f[1]}{unit or ''}",11.5,'mt')
        x+=wd
    if bare: return _bare(W,20+h+4,b)
    return _svg(W,20+h+4,b,cap)

# ---------- 流程 ----------
def flow(items,cap='',bw=None,h=44,gap=26,cls=None,W=None,labels=None,size=13):
    """横向框链；items 里元素可带类名 ('文字','rd')；自动折成单行"""
    n=len(items);ws=[]
    for it in items:
        t=it[0] if isinstance(it,tuple) else it
        L=max(len(l) for l in str(t).split('\n'))
        ws.append(bw or max(52,L*size*1.05+16))
    b='';x=4;lab=labels or []
    hh=h+(16 if labels else 0);y=(16 if labels else 2)
    for i,it in enumerate(items):
        t,c=(it if len(it)>1 else (it[0],'bx')) if isinstance(it,tuple) else (it,'bx')
        b+=box(x,y,ws[i],h,t,c,size)
        if i<n-1:
            b+=arrow(x+ws[i]+2,y+h/2,x+ws[i]+gap-2,y+h/2)
            if i<len(lab) and lab[i]: b+=T(x+ws[i]+gap/2,y-7,lab[i],10.5,'rdt')
        x+=ws[i]+gap
    return _svg(x-gap+6,hh+4,b,cap)

# ---------- 纵向内存/栈 ----------
def mem(rows,cap='',w=250,rh=32,left='',notes=None,bare=False):
    """rows=[(文字,类名?,左标,右注)]，自上而下"""
    b='';lw=86 if any(isinstance(r,tuple) and len(r)>2 and r[2] for r in rows) else 6
    y=6;rw=0
    for r in rows:
        r=r if isinstance(r,tuple) else (r,)
        t=r[0];c=r[1] if len(r)>1 and r[1] else 'bx'
        b+=box(lw,y,w,rh,t,c,13)
        if len(r)>2 and r[2]: b+=T(lw-6,y+rh/2,r[2],11.5,'mt',a='end')
        if len(r)>3 and r[3]:
            b+=T(lw+w+8,y+rh/2,r[3],12,'rdt',a='start');rw=max(rw,len(r[3])*12.5)
        y+=rh
    if bare: return _bare(lw+w+rw+12,y+6,b)
    return _svg(lw+w+rw+12,y+6,b,cap)

# ---------- 甘特图 ----------
def gantt(segs,cap='',unit=26,rows=None,bare=False,h=30):
    """segs=[(名,起,止)] ；rows 指定行序；每行一个进程"""
    names=rows or list(dict.fromkeys(s[0] for s in segs))
    mx=max(s[2] for s in segs);L=44;W=L+mx*unit+14;b=''
    for i,n in enumerate(names):
        y=6+i*(h+6);b+=T(L-6,y+h/2,n,13,'',a='end',w=700);b+=f'<line x1="{L}" y1="{y+h}" x2="{L+mx*unit}" y2="{y+h}" class="ln" style="stroke-width:1;opacity:.4"/>'
    for s in segs:
        y=6+names.index(s[0])*(h+6);c=s[3] if len(s)>3 else 'bk'
        b+=box(L+s[1]*unit,y,(s[2]-s[1])*unit,h,'',c)
    yb=6+len(names)*(h+6)+2
    ticks=sorted(set([t for s in segs for t in s[1:3]]))
    last=-99
    for t in ticks:
        b+=f'<line x1="{L+t*unit}" y1="6" x2="{L+t*unit}" y2="{yb}" class="ln" style="stroke-width:.7;opacity:.5" stroke-dasharray="3 3"/>'
        if (t-last)*unit>=13: b+=T(L+t*unit,yb+9,t,11,'mt');last=t
    if bare: return _bare(W,yb+20,b)
    return _svg(W,yb+20,b,cap)

# ---------- 时序（两端/多端报文） ----------
def seq(cols,msgs,cap='',W=None,step=46,bare=False,top=30):
    """cols=['客户','服务器']；msgs=[(from,to,'文字'[,类/虚线])]，或 ('note',col,'文字')"""
    n=len(cols);W=W or (600 if n<=2 else 680);m=70;gap=(W-2*m)/(n-1) if n>1 else 0;X=[m+i*gap for i in range(n)]
    H=top+len(msgs)*step+18;b=''
    for i,c in enumerate(cols):
        b+=box(X[i]-54,2,108,24,c,'bk',13)+f'<line x1="{X[i]}" y1="26" x2="{X[i]}" y2="{H-4}" class="ln" style="stroke-width:1.5"/>'
    y=top+6
    for ms in msgs:
        if ms[0]=='note':
            b+=T(X[ms[1]]+(-8 if ms[1]==n-1 else 8),y+step/2-6,ms[2],12,'mt',a='end' if ms[1]==n-1 else 'start');y+=step;continue
        a,bb,t=ms[0],ms[1],ms[2];c='rdl' if len(ms)>3 and ms[3]=='r' else 'ln';dash=len(ms)>3 and ms[3]=='d'
        lost=len(ms)>3 and ms[3]=='x'
        x2=X[bb]
        if lost:
            x2=X[a]+(X[bb]-X[a])*.62;b+=arrow(X[a],y,x2,y+step*.62*.8,'rdl',head=False)+T(x2+2,y+step*.62*.8,'✗',18,'rdt')
        else: b+=arrow(X[a],y,x2,y+step*.8,c,dash=dash)
        mx=(X[a]+x2)/2
        L=len(t)*12.5+8
        b+=f'<rect x="{mx-L/2}" y="{y+step*.4-16}" width="{L}" height="16" style="fill:var(--panel)"/>'+T(mx,y+step*.4-8,t,12,'rdt' if c=='rdl' else '',w=600)
        y+=step
    if bare: return _bare(W,H,b)
    return _svg(W,H,b,cap)

# ---------- 金字塔 ----------
def pyramid(levels,cap='',W=560,rh=40):
    n=len(levels);b=''
    for i,(t,*rest) in enumerate(levels):
        tw=W*.25+(W*.72)*(i/(n-1) if n>1 else 1);nw=W*.25+(W*.72)*((i+1)/n)
        x=(W-tw)/2;c=rest[0] if rest else 'bx'
        b+=box(x,4+i*(rh+3),tw,rh,t,c,13)
    return _svg(W,4+n*(rh+3)+4,b,cap)

# ---------- 时空图 / 表格 ----------
def table(rows,head=True,mono=False,hl=None):
    h='<div class="tb%s pop"><table>'%(' mono' if mono else '')
    for i,r in enumerate(rows):
        tag='th' if head and i==0 else 'td'
        h+='<tr>'+''.join(f'<{tag}>{c}</{tag}>' for c in r)+'</tr>'
    return h+'</table></div>'
def pipe(instrs,cap=''):
    """instrs=[('I1',['IF','ID','EX','MEM','WB'],起始周期(1基))]；stall 写 '*'"""
    mx=max(i[2]+len(i[1])-1 for i in instrs)
    rows=[['指令\\周期']+[str(k) for k in range(1,mx+1)]]
    for n,st,s in instrs:
        r=[n]+['']*mx
        for j,x in enumerate(st):
            r[s+j]=('<span style="color:var(--red);font-weight:900">✕</span>' if x=='*' else x)
        rows.append(r)
    t=table(rows,mono=True)
    return t+(f'<figcaption style="text-align:center">{cap}</figcaption>' if cap else '')

# ---------- 步进器 ----------
def steps(frames,title='逐格翻'):
    """frames=[(html,说明)]"""
    fs=''.join(f'<div class="frame">{h}<div class="cap">{c}</div></div>' for h,c in frames)
    return ('<div class="stp pop"><div class="top"><span>▣ %s</span><span class="n"></span></div>%s'
            '<div class="ctl"><button class="pv">◀ 上一格</button><button class="nx">下一格 ▶</button><button class="pl">▶ 自动</button><input type="range" min="0" value="0" aria-label="进度"></div></div>')%(E(title),fs)
def img(path,cap=''):
    return f'<figure class="ph pop"><img loading="lazy" src="{path}" alt="{E(cap)}">'+(f'<figcaption>{cap}</figcaption>' if cap else '')+'</figure>'
