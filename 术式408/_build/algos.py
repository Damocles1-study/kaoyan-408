# 手算演示都由程序算出来，避免手写错误
import figs
from figs import cells,table,steps,mem,E
def expr_steps(s):
    pr={'+':1,'-':1,'*':2,'/':2};st=[];out=[];fr=[]
    def draw(c,msg):
        h=f'<div style="font:600 15px/1.8 var(--mono)">扫描：<b class="r">{E(c)}</b>　｜　已输出：{E(" ".join(out)) or "—"}</div>'+cells(st or [' '],bare=True,idx=False,hl=({len(st)-1:'gd'} if st else {}))+'<div class="dim" style="text-align:center">运算符栈（右边是栈顶）</div>'
        fr.append((h,msg))
    for c in s:
        if c.isalnum(): out.append(c);draw(c,'操作数，直接输出。')
        elif c=='(': st.append(c);draw(c,'左括号，入栈。')
        elif c==')':
            while st[-1]!='(': out.append(st.pop())
            st.pop();draw(c,'右括号：一直弹到左括号，括号丢弃。')
        else:
            pop=[]
            while st and st[-1]!='(' and pr[st[-1]]>=pr[c]: pop.append(st.pop())
            out.extend(pop);st.append(c);draw(c,(f'先弹出优先级不低于它的 {" ".join(pop)}，再入栈。' if pop else '栈顶优先级更低（或是左括号），直接入栈。'))
    while st: out.append(st.pop())
    draw('结束','全部弹出，后缀表达式完成：'+''.join(out))
    return steps(fr,'中缀转后缀：'+s)
def kmp_next(t):
    n=len(t);pm=[0]*n;k=0
    for i in range(1,n):
        while k and t[i]!=t[k]: k=pm[k-1]
        if t[i]==t[k]: k+=1
        pm[i]=k
    nx0=[-1]+pm[:-1];nx1=[x+1 for x in nx0]
    nv=[0]*n
    for j in range(n):
        if j==0: nv[j]=-1
        else:
            nv[j]=nv[nx0[j]] if t[j]==t[nx0[j]] else nx0[j]
    return pm,nx0,nx1,[x+1 for x in nv]
def kmp_table(t):
    pm,nx0,nx1,nv=kmp_next(t)
    rows=[['j（从 1）']+[str(i+1) for i in range(len(t))],['模式串']+list(t),['PM 表']+[str(x) for x in pm],['next（从 0 的版本）']+[str(x) for x in nx0],['next（从 1 的版本）']+[str(x) for x in nx1],['nextval（从 1）']+[str(x) for x in nv]]
    return table(rows,mono=True)
def kmp_steps(s,t):
    pm,nx0,_,_=kmp_next(t);i=j=0;cnt=0;fr=[]
    def draw(msg,ok=None):
        hl={i:('gd' if ok is None else 'gd' if ok else 'rd')}
        a=cells(list(s),hl=hl,cw=30,ch=30,idx=False,bare=True)
        off=i-j
        b=cells(['']*0+[' ']*off+list(t),hl={i:('gd' if ok else 'rd')},gray=list(range(off)),cw=30,ch=30,idx=False,bare=True)
        fr.append((f'<div style="max-width:{len(s)*30+8}px;margin:0 auto">{a}<div style="width:{(off+len(t))*30+8}px;max-width:100%">{b}</div></div>',msg))
    while i<len(s) and j<len(t):
        cnt+=1
        ok=s[i]==t[j]
        if ok:
            draw(f'第 {cnt} 次比较：s[{i}]=t[{j}]={s[i]}，相等，i、j 都前进。',True)
            i+=1;j+=1
        else:
            nj=nx0[j]
            draw(f'第 {cnt} 次比较：s[{i}]={s[i]} ≠ t[{j}]={t[j]}，失配。'+(f'j 跳到 next[{j}]={nj}，i 不动。' if nj>=0 else 'next=−1，i、j 都前进一位。'),False)
            if nj<0: i+=1;j=0
            else: j=nj
    fr.append((f'<div class="g" style="display:block;text-align:center;font-size:18px">匹配成功，共 {cnt} 次比较</div>',f'模式串在主串下标 {i-len(t)} 处匹配成功。'))
    return steps(fr,'KMP 逐步比较')

def _p(spec):
    return figs._parse(spec)
def trav_steps(spec):
    root=_p(spec)
    def bin_(n):
        if len(n['c'])==1:n['c'].append({'n':'','c':[]})
    def rec(n,mode,o):
        if not n or not n['n']:return
        bin_(n);L,R=(n['c']+[None,None])[:2]
        if mode=='pre':o.append(n['n'])
        rec(L,mode,o)
        if mode=='in':o.append(n['n'])
        rec(R,mode,o)
        if mode=='post':o.append(n['n'])
    fr=[]
    for mode,name in (('pre','先序（根左右）'),('in','中序（左根右）'),('post','后序（左右根）')):
        o=[];rec(root,mode,o)
        for i in range(len(o)):
            fr.append((figs.tree(spec,hl=o[i],bare=True)+f'<div style="text-align:center;font:700 16px var(--mono)">{" ".join(o[:i+1])}</div>',f'{name}：第 {i+1} 个访问 {o[i]}'))
    q=[root];o=[]
    while q:
        n=q.pop(0);o.append(n['n'])
        for k in n['c']:
            if k['n']:q.append(k)
    for i in range(len(o)):
        fr.append((figs.tree(spec,hl=o[i],bare=True)+f'<div style="text-align:center;font:700 16px var(--mono)">{" ".join(o[:i+1])}</div>',f'层序（队列）：第 {i+1} 个访问 {o[i]}'))
    return steps(fr,'四种遍历')
def thread_fig(spec):
    root=_p(spec);o=[]
    def rec(n):
        if not n or not n['n']:return
        if len(n['c'])==1:n['c'].append({'n':'','c':[]})
        L,R=(n['c']+[None,None])[:2];rec(L);o.append(n);rec(R)
    rec(root)
    rows=[['结点','左指针','右指针']]
    for i,n in enumerate(o):
        L,R=(n['c']+[{'n':''},{'n':''}])[:2]
        rows.append([n['n'],(f'孩子 {L["n"]}' if L['n'] else f'<span class="r">线索 → 前驱 {o[i-1]["n"] if i else "NULL"}</span>'),(f'孩子 {R["n"]}' if R['n'] else f'<span class="r">线索 → 后继 {o[i+1]["n"] if i+1<len(o) else "NULL"}</span>')])
    return figs.tree(spec,cap='中序序列：'+' '.join(n['n'] for n in o))+table(rows)
def huff_steps(w):
    import heapq
    h=[];c=0
    for x in w:h.append((x,c,str(x)));c+=1
    heapq.heapify(h);fr=[(cells(sorted(w),bare=True,idx=False),f'初始权值。n={len(w)}，最终共 {2*len(w)-1} 个结点。')];wpl=0
    while len(h)>1:
        a=heapq.heappop(h);b=heapq.heappop(h);s=a[0]+b[0];wpl+=s;sp=f'{s}({a[2]},{b[2]})';heapq.heappush(h,(s,c,sp));c+=1
        trees=''.join(f'<div style="display:inline-block;vertical-align:top;margin:4px">{figs.tree(t[2],bare=True,dx=34,dy=44,r=14,hl=str(s) if t[0]==s else "")}</div>' for t in sorted(h))
        fr.append((f'<div style="text-align:center;overflow-x:auto">{trees}</div>',f'取最小的 {a[0]} 和 {b[0]}，合并成 {s}。'))
    fr[-1]=(fr[-1][0],fr[-1][1]+f' 完成。WPL = 所有合并值之和 = <b class="r">{wpl}</b>。')
    return steps(fr,'哈夫曼建树')
def tree_inline(spec,x,y,dx=28,dy=40):
    s=figs.tree(spec,bare=True,dx=dx,dy=dy,r=14)
    import re
    inner=re.sub(r'^<svg[^>]*>(<defs>.*?</defs>)?','',s);inner=inner[:-6]
    return f'<g transform="translate({x},{y})">{inner}</g>'
# AVL
class N:
    def __init__(s,k):s.k=k;s.l=s.r=None;s.h=1
def _h(n):return n.h if n else 0
def _u(n):n.h=1+max(_h(n.l),_h(n.r))
def _rr(y):
    x=y.l;y.l=x.r;x.r=y;_u(y);_u(x);return x
def _rl(x):
    y=x.r;x.r=y.l;y.l=x;_u(x);_u(y);return y
def _ins(n,k,log):
    if not n:return N(k)
    if k<n.k:n.l=_ins(n.l,k,log)
    else:n.r=_ins(n.r,k,log)
    _u(n);b=_h(n.l)-_h(n.r)
    if b>1 and k<n.l.k:log.append(f'{n.k} 失衡，LL 型：{n.l.k} 升上来');return _rr(n)
    if b<-1 and k>n.r.k:log.append(f'{n.k} 失衡，RR 型：{n.r.k} 升上来');return _rl(n)
    if b>1:log.append(f'{n.k} 失衡，LR 型：{n.l.r.k} 升上来');n.l=_rl(n.l);return _rr(n)
    if b<-1:log.append(f'{n.k} 失衡，RL 型：{n.r.l.k} 升上来');n.r=_rr(n.r);return _rl(n)
    return n
def _sp(n):
    if not n:return ''
    if not n.l and not n.r:return str(n.k)
    return f'{n.k}({_sp(n.l)},{_sp(n.r)})'
def avl_steps(a):
    r=None;fr=[]
    for k in a:
        log=[];r=_ins(r,k,log)
        fr.append((figs.tree(_sp(r),hl=str(k),bare=True),f'插入 {k}。'+('；'.join(log) if log else '未失衡。')))
    return steps(fr,'AVL 依次插入 '+' '.join(map(str,a)))

# ---------- 图 ----------
G1N={'A':(60,40),'B':(200,30),'C':(340,40),'D':(60,170),'E':(200,180),'F':(340,170)}
G1E=[('A','B',6),('A','D',5),('A','E',1),('B','C',5),('B','E',5),('C','E',6),('C','F',2),('D','E',5),('E','F',4)]
def g1(hl='',hled=None,cap='',bare=True):return figs.graph(G1N,G1E,hl=hl,hledges=hled,bare=bare,cap=cap)
def prim_steps(start='A',N=G1N,E=G1E):
    ins=[start];T=[];fr=[(figs.graph(N,E,hl=start,bare=True),f'从 {start} 开始，集合 U={{{start}}}。')];tot=0
    while len(ins)<len(N):
        best=None
        for a,b,w in E:
            for u,v in ((a,b),(b,a)):
                if u in ins and v not in ins and (best is None or w<best[2]):best=(u,v,w)
        ins.append(best[1]);T.append(best[:2]);tot+=best[2]
        fr.append((figs.graph(N,E,hl=','.join(ins),hledges=T,bare=True),f'跨越 U 与其他顶点的边中最小的是 ({best[0]},{best[1]})={best[2]}。加入 {best[1]}。累计代价 {tot}。'))
    return steps(fr,f'Prim：从 {start} 长出一棵树')
def kruskal_steps(N=G1N,E=G1E):
    p={k:k for k in N}
    def f(x):
        while p[x]!=x:x=p[x]
        return x
    T=[];fr=[(figs.graph(N,E,bare=True),'所有边按权排序，从小到大试。')];tot=0
    for a,b,w in sorted(E,key=lambda e:e[2]):
        if f(a)==f(b):
            fr.append((figs.graph(N,E,hledges=T,bare=True),f'({a},{b})={w}：两端已连通（并查集同根），加了成环，跳过。'));continue
        p[f(a)]=f(b);T.append((a,b));tot+=w
        fr.append((figs.graph(N,E,hledges=T,bare=True),f'({a},{b})={w}：两端不连通，选中。累计代价 {tot}。'))
        if len(T)==len(N)-1:break
    return steps(fr,'Kruskal：按边从小到大')
def dijkstra_steps(N,E,s,directed=True):
    INF=float('inf');names=list(N);d={k:INF for k in N};pre={k:'—' for k in N};d[s]=0;done=[];adj={k:[] for k in N}
    for a,b,w in E:
        adj[a].append((b,w))
        if not directed:adj[b].append((a,w))
    def tb(hi=None):
        rows=[['顶点']+names,['dist']+[('∞' if d[k]==INF else str(d[k])) if k not in done else f'<b class="r">{d[k]}</b>' for k in names],['path']+[pre[k] for k in names],['已确定']+['✓' if k in done else '' for k in names]]
        return table(rows,mono=True)
    fr=[(figs.graph(N,E,directed=directed,hl=s,bare=True)+tb(),f'初始：dist[{s}]=0，其余 ∞（或直达权）。')]
    while len(done)<len(N):
        u=min((k for k in N if k not in done),key=lambda k:d[k])
        if d[u]==INF:break
        done.append(u);ch=[]
        for v,w in adj[u]:
            if v not in done and d[u]+w<d[v]:d[v]=d[u]+w;pre[v]=u;ch.append(f'{v} 改为 {d[v]}')
        T=[(pre[k],k) for k in done if pre[k]!='—']
        fr.append((figs.graph(N,E,directed=directed,hl=','.join(done),hledges=T,bare=True)+tb(),f'未确定中 dist 最小的是 {u}={d[u]}，确定它。用它松弛：'+('，'.join(ch) if ch else '无更新')+'。'))
    fr.append((figs.graph(N,E,directed=directed,hl=','.join(done),hledges=[(pre[k],k) for k in done if pre[k]!='—'],bare=True)+tb(),'确定顺序：'+' → '.join(done)))
    return steps(fr,f'Dijkstra：从 {s} 出发')
def floyd_table(n,E):
    INF=10**9;D=[[0 if i==j else INF for j in range(n)] for i in range(n)]
    for a,b,w in E:D[a][b]=w
    def show(D):
        return table([['']+[f'v{j}' for j in range(n)]]+[[f'v{i}']+[('∞' if x>=INF else str(x)) for x in D[i]] for i in range(n)],mono=True)
    fr=[(show(D),'A⁽⁻¹⁾：邻接矩阵，没有中转。')]
    for k in range(n):
        ch=[]
        for i in range(n):
            for j in range(n):
                if D[i][k]+D[k][j]<D[i][j]:D[i][j]=D[i][k]+D[k][j];ch.append(f'A[{i}][{j}]={D[i][j]}')
        fr.append((show(D),f'A⁽{k}⁾：允许经过 v{k} 中转。更新：'+('，'.join(ch) if ch else '无')))
    return steps(fr,'Floyd：逐个放开中转点')
def topo_steps(N,E):
    ind={k:0 for k in N};adj={k:[] for k in N}
    for e in E:
        ind[e[1]]+=1;adj[e[0]].append(e[1])
    o=[];fr=[]
    q=[k for k in N if ind[k]==0]
    while q:
        q.sort();u=q.pop(0)
        cur=dict(ind)
        fr.append((figs.graph(N,E,directed=True,hl=','.join(o+[u]),bare=True)+table([['顶点']+list(N),['入度']+[('—' if k in o or k==u else str(ind[k])) for k in N]],mono=True),f'入度为 0 的选 {u} 输出，删除它和它发出的边。序列：{" ".join(o+[u])}'))
        o.append(u)
        for v in adj[u]:
            ind[v]-=1
            if ind[v]==0:q.append(v)
    return steps(fr,'拓扑排序')
def aoe(N,E,cap=''):
    """E=[(a,b,w,活动名)]，N 为拓扑序字典。四行表由程序算。"""
    names=list(N);ve={k:0 for k in names}
    for k in names:
        for a,b,w,*_ in E:
            if b==k:ve[k]=max(ve[k],ve[a]+w)
    end=names[-1];vl={k:ve[end] for k in names}
    for k in reversed(names):
        for a,b,w,*_ in E:
            if a==k:vl[k]=min(vl[k],vl[b]-w)
    r1=[['事件']+names,['ve']+[str(ve[k]) for k in names],['vl']+[str(vl[k]) for k in names]]
    acts=[];
    for a,b,w,n in E:acts.append((n,a,b,w,ve[a],vl[b]-w))
    r2=[['活动']+[f'{x[0]}({x[1]}→{x[2]})' for x in acts],['e（=ve[起点]）']+[str(x[4]) for x in acts],['l（=vl[终点]−权）']+[str(x[5]) for x in acts],['l−e']+[('<b class="r">0</b>' if x[5]==x[4] else str(x[5]-x[4])) for x in acts]]
    return figs.graph(N,[(a,b,f'{n}={w}') for a,b,w,n in E],directed=True,cap=cap)+table(r1,mono=True)+table(r2,mono=True)+f'<p>关键活动（l=e）：<b class="r">{" ".join(x[0] for x in acts if x[4]==x[5])}</b>；工期 = <span class="g">{ve[end]}</span>。</p>'
# ---------- 散列 ----------
def hash_lp(keys,m,mod,mul=1,cap=''):
    """线性探测：程序计算表、ASL"""
    T=[None]*m;pr={}
    for k in keys:
        h=(k*mul)%mod;c=1
        while T[h] is not None:h=(h+1)%m;c+=1
        T[h]=k;pr[k]=c
    fail=[]
    for i in range(mod):
        c=1;j=i
        while T[j] is not None:j=(j+1)%m;c+=1
        fail.append(c)
    rows=[['地址']+[str(i) for i in range(m)],['关键字']+[('' if x is None else str(x)) for x in T],['成功比较次数']+[('' if x is None else str(pr[x])) for x in T]]
    s=sum(pr.values());f=sum(fail)
    return table(rows,mono=True)+f'<p>ASL<sub>成功</sub> = {s}/{len(keys)} = <span class="g">{s/len(keys):.3g}</span>；ASL<sub>失败</sub>（对 H(key) 的 {mod} 个取值）= ('+'+'.join(map(str,fail))+f')/{mod} = {f}/{mod} = <span class="g">{f/mod:.3g}</span></p>'

# ---------- B 树插入 ----------
def btree_ins_steps(m,keys):
    class B:
        def __init__(s,k=None,c=None):s.k=k or [];s.c=c or []
    root=B();fr=[]
    def split(n,log):
        i=(m+1)//2-1 if False else (m-1)//2 if m%2 else m//2-1
        i=(len(n.k))//2 if len(n.k)%2 else len(n.k)//2-1
        up=n.k[i];L=B(n.k[:i],n.c[:i+1]);R=B(n.k[i+1:],n.c[i+1:]);log.append(f'结点超过 {m-1} 个关键字，{up} 上提，分裂。');return up,L,R
    def ins(n,x,log):
        if not n.c:
            n.k.append(x);n.k.sort()
        else:
            i=sum(1 for a in n.k if a<x);r=ins(n.c[i],x,log)
            if r:
                up,L,R=r;n.k.insert(i,up);n.c[i:i+1]=[L,R]
        if len(n.k)>m-1:return split(n,log)
        return None
    def draw(hi):
        lv=[];cur=[root]
        while cur:
            lv.append(cur);nx=[]
            for n in cur:nx+=n.c
            cur=nx
        b='';W=600;pos={}
        for d,ns in enumerate(lv):
            for i,n in enumerate(ns):
                x=W*(i+.5)/len(ns);y=10+d*64;w=max(50,len(n.k)*34);pos[id(n)]=(x,y)
                c='gd' if hi in n.k else 'bx'
                b+=figs.box(x-w/2,y,w,32,' | '.join(map(str,n.k)),c)
        for d,ns in enumerate(lv):
            for n in ns:
                for ch in n.c:
                    b+=f'<line x1="{pos[id(n)][0]}" y1="{pos[id(n)][1]+32}" x2="{pos[id(ch)][0]}" y2="{pos[id(ch)][1]}" class="ln"/>'
        return figs._bare(W,10+len(lv)*64,b)
    for x in keys:
        log=[];r=ins(root,x,log)
        if r:
            up,L,R=r;root.k=[up];root.c=[L,R]
        fr.append((draw(x),f'插入 {x}。'+(''.join(log) or '叶子未满，直接放入。')))
    return steps(fr,f'{m} 阶 B 树依次插入 '+' '.join(map(str,keys)))

# ---------- 排序 ----------
def _row(a,hl=None,gray=None,ptr=None,cw=40):
    return cells(a,hl=hl,gray=gray,ptr=ptr,bare=True,cw=cw,ch=34,idx=False)
def insert_steps(a):
    a=a[:];fr=[(_row(a,gray=list(range(1,len(a)))),'第一个元素自成有序区。')]
    for i in range(1,len(a)):
        x=a[i];j=i-1;c=0
        while j>=0 and a[j]>x:a[j+1]=a[j];j-=1;c+=1
        a[j+1]=x
        fr.append((_row(a,hl={j+1:'gd'},gray=list(range(i+1,len(a)))),f'第 {i} 趟：把 {x} 插到有序区，移动 {c} 个元素。'))
    return steps(fr,'直接插入排序')
def shell_steps(a,ds=(5,3,1)):
    a=a[:];fr=[(_row(a),'初始序列。增量序列 '+','.join(map(str,ds)))]
    for d in ds:
        for i in range(d,len(a)):
            x=a[i];j=i-d
            while j>=0 and a[j]>x:a[j+d]=a[j];j-=d
            a[j+d]=x
        fr.append((_row(a,hl={k:('gd' if (k//d)%2==0 else 'bu') for k in range(len(a))} if d>1 else None),f'增量 {d} 一趟结束：相距 {d} 的元素都已各自有序。'))
    return steps(fr,'希尔排序')
def quick_steps(a):
    a=a[:];fr=[]
    def part(l,h):
        p=a[l];i,j=l,h
        while i<j:
            while i<j and a[j]>=p:j-=1
            a[i]=a[j]
            while i<j and a[i]<=p:i+=1
            a[j]=a[i]
        a[i]=p;return i
    fixed=[];st=[(0,len(a)-1)];n=0
    while st:
        cur=[]
        for l,h in st:
            if l<h:
                m=part(l,h);fixed.append(m);cur+= [(l,m-1),(m+1,h)]
            elif l==h: fixed.append(l)
        st=[x for x in cur if x[0]<=x[1]]
        n+=1
        fr.append((_row(a,hl={k:'bk' for k in fixed}),f'第 {n} 趟后：黑格是已到最终位置的枢轴。至少 {len(fixed)} 个元素就位。'))
    return steps(fr,'快速排序（首元素为枢轴）')
def heap_steps(a):
    a=a[:];n=len(a)
    def sp(i,m):
        if i>=m:return ''
        l,r=2*i+1,2*i+2
        if l>=m:return str(a[i])
        return f'{a[i]}({sp(l,m)},{sp(r,m) if r<m else ""})'
    fr=[(figs.tree(sp(0,n),bare=True,dx=36,dy=50,r=15)+_row(a),'原序列，看作完全二叉树。从最后一个分支结点 ⌊n/2⌋ 开始向前逐个下沉。')]
    def sift(i,m):
        c=0
        while 2*i+1<m:
            j=2*i+1
            if j+1<m:
                c+=1
                if a[j+1]>a[j]:j+=1
            c+=1
            if a[i]>=a[j]:break
            a[i],a[j]=a[j],a[i];i=j
        return c
    for i in range(n//2-1,-1,-1):
        v=a[i];c=sift(i,n);fr.append((figs.tree(sp(0,n),bare=True,hl=str(v),dx=36,dy=50,r=15)+_row(a),f'调整 {v}（第 {i+1} 号结点）下沉，比较 {c} 次。'))
    fr.append((figs.tree(sp(0,n),bare=True,dx=36,dy=50,r=15)+_row(a),'大根堆建成。'))
    for m in range(n-1,n-3,-1):
        a[0],a[m]=a[m],a[0];sift(0,m)
        fr.append((figs.tree(sp(0,m),bare=True,dx=36,dy=50,r=15)+_row(a,hl={k:'bk' for k in range(m,n)}),f'堆顶换到末尾（定了一个最大值），剩下 {m} 个重新下沉。'))
    return steps(fr,'堆排序')
def merge_steps(a):
    a=a[:];fr=[(_row(a),'每个元素自成一段。')];d=1;n=len(a);t=1
    while d<n:
        b=[]
        for i in range(0,n,2*d):b+=sorted(a[i:i+2*d])
        a=b;d*=2
        fr.append((_row(a,hl={k:('gd' if (k//d)%2==0 else 'bu') for k in range(n)}),f'第 {t} 趟：两两归并，段长变成 {d}。'));t+=1
    return steps(fr,'二路归并')
def radix_steps(a,w=3):
    fr=[];a=a[:]
    for t in range(w):
        b=[[] for _ in range(10)]
        for x in a:b[int(x[w-1-t])].append(x)
        rows=[[str(i) for i in range(10)],[' '.join(q) or '·' for q in b]]
        a=[x for q in b for x in q]
        fr.append((table(rows,mono=True)+f'<div style="font:700 15px var(--mono);text-align:center">{" ".join(a)}</div>',f'第 {t+1} 趟按{"个十百"[t]}位分配、收集。'))
    return steps(fr,'基数排序')
def ieee(x):
    import struct
    b=struct.unpack('>I',struct.pack('>f',x))[0];s=f'{b:032b}'
    return figs.bits([(s[0],1,'rd'),(s[1:9],8,'bk'),(s[9:],23,'bx')],labels=False)+f'<div style="text-align:center;font:700 15px var(--mono)">{x} → {b:08X}H</div>'

# ---------- 调度 ----------
def sched(jobs,kind,q=None,cap=''):
    """jobs=[(名,到达,服务[,优先数])]。kind: FCFS/SJF/SRTN/HRRN/RR/PRI。程序算甘特与周转。"""
    J={j[0]:list(j) for j in jobs};rem={j[0]:j[2] for j in jobs};t=0;seg=[];done={};qq=[];arrived=set()
    names=[j[0] for j in jobs]
    def arrive(up):
        for n in names:
            if n not in arrived and J[n][1]<=up:arrived.add(n);qq.append(n)
    while len(done)<len(jobs):
        arrive(t)
        if not qq:
            t=min(J[n][1] for n in names if n not in arrived);continue
        if kind=='FCFS':c=qq[0]
        elif kind in('SJF','SRTN'):c=min(qq,key=lambda n:(rem[n],J[n][1]))
        elif kind=='HRRN':c=max(qq,key=lambda n:((t-J[n][1]+J[n][2])/J[n][2],-J[n][1]))
        elif kind=='PRI':c=min(qq,key=lambda n:(J[n][3],J[n][1]))
        elif kind=='RR':c=qq[0]
        if kind in('FCFS','SJF','HRRN','PRI'):
            run=rem[c]
        elif kind=='RR':
            run=min(q,rem[c])
        else:
            nxt=[J[n][1] for n in names if n not in arrived and J[n][1]>t]
            run=min([rem[c]]+[x-t for x in nxt])
        if seg and seg[-1][0]==c and seg[-1][2]==t:seg[-1][2]=t+run
        else:seg.append([c,t,t+run])
        t+=run;rem[c]-=run
        if kind=='RR':
            qq.remove(c);arrive(t)
            if rem[c]>0:qq.append(c)
            else:done[c]=t
        else:
            if rem[c]==0:qq.remove(c);done[c]=t
    rows=[['进程','到达','服务','完成','周转 = 完成−到达','带权周转']]
    tt=0;ww=0
    for j in jobs:
        n=j[0];T=done[n]-j[1];tt+=T;ww+=T/j[2]
        rows.append([n,str(j[1]),str(j[2]),str(done[n]),str(T),f'{T/j[2]:.2f}'])
    return figs.gantt([tuple(s) for s in seg],rows=names,cap=cap,unit=max(14,min(26,520//t)))+table(rows,mono=True)+f'<p>平均周转 <span class="g">{tt/len(jobs):.2f}</span>，平均带权周转 <span class="g">{ww/len(jobs):.2f}</span>。</p>'
# ---------- 银行家 ----------
def banker(alloc,maxm,avail,names=None):
    n=len(alloc);m=len(avail);names=names or [f'P{i}' for i in range(n)]
    need=[[maxm[i][j]-alloc[i][j] for j in range(m)] for i in range(n)]
    S=lambda v:' '.join(map(str,v))
    rows=[['进程','Max','Allocation','Need']]+[[names[i],S(maxm[i]),S(alloc[i]),f'<b class="r">{S(need[i])}</b>'] for i in range(n)]
    w=avail[:];done=[False]*n;seq=[];fr=[]
    for _ in range(n):
        for i in range(n):
            if not done[i] and all(need[i][j]<=w[j] for j in range(m)):
                w2=[w[j]+alloc[i][j] for j in range(m)]
                fr.append((table([['Work','满足谁','Need','完成后 Work += Allocation']]+[[S(w),names[i],S(need[i]),f'<b class="r">{S(w2)}</b>']],mono=True),f'{names[i]} 的 Need ≤ Work，让它跑完，释放资源。'))
                w=w2;done[i]=True;seq.append(names[i]);break
    ok=all(done)
    def count(w,dn):
        if all(dn):return 1
        c=0
        for i in range(n):
            if not dn[i] and all(need[i][j]<=w[j] for j in range(m)):
                d=dn[:];d[i]=True;c+=count([w[j]+alloc[i][j] for j in range(m)],d)
        return c
    cnt=count(avail[:],[False]*n)
    fr.append((f'<div class="g" style="display:block;text-align:center;font-size:17px">{"安全序列："+" → ".join(seq) if ok else "找不到安全序列：不安全"}</div>',f'程序穷举：共有 {cnt} 条安全序列。'))
    return table(rows,mono=True)+f'<p>Available = <span class="g">{S(avail)}</span></p>'+steps(fr,'安全性算法')

# ---------- Cache 模拟 ----------
def cache_sim(addrs,lines,ways=1,block=1,repl='LRU',title='',gfn=None):
    """addrs: 字节地址序列。lines: 总行数；ways: 每组几行。"""
    sets=lines//ways;C=[[] for _ in range(sets)];fr=[];hit=0
    for k,a in enumerate(addrs):
        b=a//block;s=gfn(a) if gfn else b%sets;tag=b if gfn else b//sets;S=C[s]
        msg=f'第 {k+1} 次访问地址 {a}：块号 {b}，组号 {s}，标记 {tag}。'
        if tag in [x for x in S]:
            hit+=1;msg+=' <b class="r">命中</b>。'
            if repl=='LRU':S.remove(tag);S.append(tag)
        else:
            if len(S)==ways:
                old=S.pop(0);msg+=f' 缺失，替换标记 {old}。'
            else:msg+=' 缺失，装入空行。'
            S.append(tag)
        rows=[['组']+[f'第 {i} 行' for i in range(ways)]]+[[str(i)]+[(f'标记 {C[i][j]}' if j<len(C[i]) else '') for j in range(ways)] for i in range(sets)]
        fr.append((table(rows,mono=True)+f'<div class="dim" style="text-align:center">已命中 {hit} / {k+1}</div>',msg))
    return steps(fr,title or f'{ways} 路组相联 + {repl} 模拟')
# ---------- 页面置换 ----------
def page_steps(seq,n,alg):
    F=[];fr=[];fault=0;use={};ptr=0;R={}
    rows=[['访问']+[str(x) for x in seq]]
    state=[]
    for i,p in enumerate(seq):
        hit=p in F;msg=f'访问页 {p}：'
        if hit:
            msg+='命中。'
            if alg=='LRU':use[p]=i
            if alg=='CLOCK':R[p]=1
        else:
            fault+=1
            if len(F)<n:
                msg+='缺页，有空页框。';F.append(p)
                if alg=='CLOCK':R[p]=1;ptr=len(F)%n
            else:
                if alg=='FIFO':
                    v=F.pop(0);F.append(p)
                elif alg=='LRU':
                    v=min(F,key=lambda x:use[x]);F[F.index(v)]=p
                elif alg=='OPT':
                    fut={x:(seq[i+1:].index(x) if x in seq[i+1:] else 10**9) for x in F}
                    v=max(F,key=lambda x:fut[x]);F[F.index(v)]=p
                elif alg=='CLOCK':
                    while R[F[ptr]]==1:R[F[ptr]]=0;ptr=(ptr+1)%n
                    v=F[ptr];del R[v];F[ptr]=p;R[p]=1;ptr=(ptr+1)%n
                msg+=f'缺页，淘汰 {v}。'
            if alg=='LRU':use[p]=i
        if alg=='LRU':use[p]=i
        state.append((list(F),hit))
        lab=[('*' if alg=='CLOCK' and j==ptr else '')+str(x)+(f"<sup>{R[x]}</sup>" if alg=='CLOCK' else '') for j,x in enumerate(F)]+['']*(n-len(F))
        fr.append((cells([re_strip(x) for x in lab],hl={F.index(p):('gd' if hit else 'rd')},bare=True,idx=False)+f'<div class="dim" style="text-align:center">累计缺页 {fault} 次</div>',msg))
    rowsT=[['访问']+[str(x) for x in seq]]
    for r in range(n):
        rowsT.append([f'页框{r}']+[(str(s[0][r]) if r<len(s[0]) else '') for s in state])
    rowsT.append(['缺页']+['' if s[1] else '<b class="r">●</b>' for s in state])
    return steps(fr,f'{alg} 逐步')+table(rowsT,mono=True)+f'<p>{alg}：{n} 个页框，缺页 <span class="g">{fault}</span> 次，缺页率 {fault}/{len(seq)}。</p>'
def re_strip(x):
    import re
    return re.sub(r'<[^>]+>','',x)

# ---------- 磁盘调度 ----------
def disk(req,start,alg,up=True,maxt=199,cap=''):
    r=sorted(req);path=[start];cnt=0
    if alg=='FCFS':order=list(req)
    elif alg=='SSTF':
        rem=list(req);cur=start;order=[]
        while rem:
            n=min(rem,key=lambda x:abs(x-cur));order.append(n);rem.remove(n);cur=n
    elif alg in('SCAN','LOOK'):
        hi=[x for x in r if x>=start];lo=[x for x in r if x<start][::-1]
        order=hi+([maxt] if alg=='SCAN' and lo else [])+lo if up else lo+([0] if alg=='SCAN' and hi else [])+hi
    elif alg in('CSCAN','CLOOK'):
        hi=[x for x in r if x>=start];lo=[x for x in r if x<start]
        order=hi+([maxt,0] if alg=='CSCAN' else [])+lo
    pts=[start]+order;tot=sum(abs(pts[i+1]-pts[i]) for i in range(len(pts)-1))
    W=620;H=34+len(pts)*20;X=lambda t:20+t*(W-40)/maxt;b=f'<line x1="20" y1="14" x2="{W-20}" y2="14" class="ln"/>'
    for t in [0,maxt]:b+=figs.T(X(t),6,t,10,'mt')
    for i,t in enumerate(pts):
        y=24+i*20
        if i:b+=figs.arrow(X(pts[i-1]),y-20,X(t),y,'rdl' if (alg in('CSCAN','CLOOK') and pts[i-1]>t) else 'ln',size=6,dash=(alg in('CSCAN','CLOOK') and pts[i-1]>t))
        b+=f'<circle cx="{X(t)}" cy="{y}" r="4" class="bk"/>'+figs.T(X(t)+(8 if X(t)<W-70 else -8),y,t,11,'',a='start' if X(t)<W-70 else 'end')
    return figs.svg(W,H,b,cap=cap or f'{alg}：总移动 {tot} 道')

# ---------- TCP 拥塞 ----------
def cwnd_steps(events,ss0=16,cw0=1,rwnd=None,cap=''):
    """events: 轮次序列，'ok' 正常，'to' 超时，'dup' 三个重复 ACK"""
    cw=cw0;ss=ss0;fr=[];hist=[(0,cw)];rows=[['轮次','cwnd','ssthresh','阶段']]
    for i,e in enumerate(events,1):
        ph='慢开始' if cw<ss else '拥塞避免'
        if e=='ok':
            nw=min(cw*2,ss) if cw<ss else cw+1
            msg=f'第 {i} 轮：cwnd={cw} 全部收到确认。{ph}：下一轮 {nw}。'
        elif e=='to':
            ss=max(cw//2,2);nw=1;ph='超时';msg=f'第 {i} 轮：<b class="r">超时</b>。ssthresh = cwnd/2 = {ss}，cwnd 立即回到 1，重新慢开始。'
        else:
            ss=max(cw//2,2);nw=ss;ph='快恢复';msg=f'第 {i} 轮：<b class="r">3 个重复 ACK</b>。ssthresh = cwnd/2 = {ss}，cwnd = {ss}（快恢复），之后线性增长。'
        rows.append([str(i),str(cw),str(ss),ph]);cw=nw;hist.append((i,cw))
        fr.append((_cw_svg(hist,ss),msg))
    return steps(fr,'拥塞窗口逐轮')+table(rows,mono=True)
def _cw_svg(h,ss):
    W=560;H=200;mx=max(v for _,v in h)+2;mxx=max(24,h[-1][0]+1);X=lambda t:34+t*(W-50)/mxx;Y=lambda v:H-22-v*(H-40)/mx
    b=f'<line x1="34" y1="{H-22}" x2="{W-10}" y2="{H-22}" class="ln"/><line x1="34" y1="10" x2="34" y2="{H-22}" class="ln"/>'
    b+=f'<line x1="34" y1="{Y(ss)}" x2="{W-10}" y2="{Y(ss)}" class="rdl" stroke-dasharray="5 4" style="stroke-width:1.5"/>'+figs.T(W-14,Y(ss)-8,f'ssthresh={ss}',11,'rdt',a='end')
    for i in range(1,len(h)):b+=f'<line x1="{X(h[i-1][0])}" y1="{Y(h[i-1][1])}" x2="{X(h[i][0])}" y2="{Y(h[i][1])}" class="ln" style="stroke-width:2.5"/>'
    for t,v in h:b+=f'<circle cx="{X(t)}" cy="{Y(v)}" r="3.5" class="bk"/>'
    b+=figs.T(X(h[-1][0]),Y(h[-1][1])-11,h[-1][1],12,'',w=800)
    return figs._bare(W,H,b)
def cidr_check(p,addr):
    import ipaddress
    return ipaddress.ip_address(addr) in ipaddress.ip_network(p,strict=False)

def wave(bs,cap=''):
    n=len(bs);U=64;L=92;W=L+n*U+10;rows=[];b=''
    def path(pts,y0):
        d=' '.join(f'{"M" if i==0 else "L"}{x:g} {y0+(0 if v else 26)}' for i,(x,v) in enumerate(pts))
        return f'<path d="{d}" fill="none" class="ln" style="stroke-width:2.5"/>'
    for i,c in enumerate(bs):
        x=L+i*U;b+=figs.T(x+U/2,12,c,15,'',w=800)
        b+=f'<line x1="{x}" y1="22" x2="{x}" y2="150" class="ln" style="stroke-width:.7;opacity:.4" stroke-dasharray="3 3"/>'
    nz=[];m=[];dm=[];lv=0
    for i,c in enumerate(bs):
        x=L+i*U;v=c=='1'
        nz+=[(x,v),(x+U,v)]
        m+=[(x,v),(x+U/2,v),(x+U/2,not v),(x+U,not v)]
        if c=='0':lv=1-lv
        dm+=[(x,bool(lv)),(x+U/2,bool(lv))];lv=1-lv;dm+=[(x+U/2,bool(lv)),(x+U,bool(lv))]
    for k,(nm,p) in enumerate((('NRZ',nz),('曼彻斯特',m),('差分曼彻斯特',dm))):
        y=28+k*42;b+=figs.T(L-8,y+13,nm,12,'',a='end',w=700)+path(p,y)
    return figs.svg(W,156,b,cap=cap)
