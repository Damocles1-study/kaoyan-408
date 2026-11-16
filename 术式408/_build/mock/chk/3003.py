# 模拟卷三：计算类选择题独立复算（python3 _build/mock/chk/3003.py）
from fractions import Fraction as F
import itertools as it, math
# 1 while(i<=n) i=i*2 ：循环 ⌊log2 n⌋+1 次
cnt=lambda n: sum(1 for _ in iter(lambda c=[1]: (c.__setitem__(0,c[0]*2) or c[0]//2<=n) and True or None, None))
k=lambda n: next(t for t in it.count() if 2**t>n); assert k(1024)==11 and k(1000)==10
# 2 双端队列：输入受限（一端进、两端出）、输出受限（两端进、一端出）
def reach(kind):
    out=set()
    def go(i,dq,o):
        if len(o)==4: out.add(tuple(o)); return
        if i<4:
            for side in ((0,) if kind=='in' else (0,1)):
                go(i+1,[i+1]+dq if side else dq+[i+1],o)
        if dq:
            for side in ((0,1) if kind=='in' else (0,)):
                if side: go(i,dq[1:],o+[dq[0]])
                else: go(i,dq[:-1],o+[dq[-1]])
    go(0,[],[]); return out
I,O=reach('in'),reach('out')
cand=[(1,2,3,4),(4,1,3,2),(4,2,3,1),(4,2,1,3)]
bad=[c for c in cand if c not in I and c not in O]; print('2:',bad); assert bad==[(4,2,3,1)]
# 3
assert (8*10+5)*3==255
# 6 BST 查 60
root=None
def ins(t,x):
    if t is None: return [x,None,None]
    if x<t[0]: t[1]=ins(t[1],x)
    else: t[2]=ins(t[2],x)
    return t
for x in [52,26,14,32,71,60,93,58,24,41]: root=ins(root,x)
c=0; t=root
while t:
    c+=1
    if t[0]==60: break
    t=t[1] if 60<t[0] else t[2]
assert c==3
# 7 DFS 序列（邻接顺序任意）
E=[('a','b'),('a','e'),('a','c'),('b','e'),('c','f'),('f','d'),('e','d')]
adj={v:set() for v in 'abcdef'}
for a,b in E: adj[a].add(b); adj[b].add(a)
def isdfs(seq):
    st=[seq[0]]; vis={seq[0]}
    for v in seq[1:]:
        while st and v not in adj[st[-1]]:
            if any(w not in vis for w in adj[st[-1]]): return False
            st.pop()
        if not st: return False
        st.append(v); vis.add(v)
    return True
r=[isdfs(s) for s in ['acfdeb','aebdfc','aedfcb','abecdf']]; print('7:',r); assert r==[True,True,True,False]
# 8 关键路径长度
W={(1,2):5,(1,3):6,(2,5):3,(3,5):6,(3,4):3,(4,5):3,(4,7):1,(4,8):4,(5,6):4,(5,7):2,(6,10):4,(7,9):5,(8,9):2,(9,10):2}
ve={1:0}
for v in range(2,11): ve[v]=max(ve[u]+w for (u,x),w in W.items() if x==v)
print('8:',ve[10]); assert ve[10]==21
# 9 线性探测 ASL ≤ 1.5 ⟹ α ≤ 1/2
a=F(1,2); assert (1+1/(1-a))/2==F(3,2) and 200/a==400
# 10 冒泡（从后往前），数有交换的趟数
s=[8,9,10,4,5,6,20,1,2]; passes=0
for i in range(len(s)-1):
    sw=False
    for j in range(len(s)-1,i,-1):
        if s[j-1]>s[j]: s[j-1],s[j]=s[j],s[j-1]; sw=True
    if not sw: break
    passes+=1
print('10:',passes); assert passes==5
# 12
c1=1*1+1*2+4*3; c2=2*1+1*2+2*3; t1,t2=c1*2,c2*2; m1,m2=6/(t1*1e-9)/1e6,5/(t2*1e-9)/1e6
print('12:',t1,t2,m1,m2); assert t1-t2==10 and round(m2-m1)==50
# 14 结构体对齐
assert 0x8049820+8==0x8049828
# 15 4 体交叉、每体 32 位、存取周期 200ns
assert 4*32==128
# 16 直接映射：块 32B、16KB ⟹ 512 行
assert (0x35301>>5)%(16*1024//32)==152
# 25 多级反馈队列
q=[[],[],[]]; sl=[10,20,30]; rem={'P1':90,'P2':30}; arr={'P1':0,'P2':30}; t=0; fin={}
pending=sorted(arr,key=arr.get)
def admit(t):
    while pending and arr[pending[0]]<=t: q[0].append(pending.pop(0))
admit(0)
while len(fin)<2:
    lv=next(i for i in range(3) if q[i]); p=q[lv].pop(0); run=min(sl[lv],rem[p])
    t+=run; rem[p]-=run; admit(t)
    if rem[p]==0: fin[p]=t
    else: q[min(lv+1,2)].append(p)
print('25:',fin); assert fin['P1']-arr['P1']==120
# 29 30 34 36
assert 2**32//512==2**23 and 10+4096//4==1034
c1=min(2*10e6*5,10e6*math.log2(1+10**3)); c2=min(2*20e6*5,20e6*math.log2(1+10**4)); print('34:',c2/c1); assert abs(c2/c1-2)<0.05
assert abs((2**2-1)*512/100e6-15.36e-6)<1e-12
print('3003 选择题复算全部通过')
# ── 自编 ──
# 20 DDR 与 MT/s
assert 8*400e6*2==4*1600e6==6.4e9
# 28 伙伴系统：1MB，申请 70K、35K、80K，释放 70K
free={1024:[0]}; used={}
def alloc(name,kb):
    s=1<<(kb-1).bit_length()
    k=min(x for x in free if x>=s and free[x])
    a=free[k].pop(0)
    while k>s:
        k//=2; free.setdefault(k,[]).append(a+k); free[k].sort()
    used[name]=(a,s)
def release(name):
    a,s=used.pop(name)
    while True:
        b=a^s
        if b in free.get(s,[]): free[s].remove(b); a=min(a,b); s*=2
        else: free.setdefault(s,[]).append(a); free[s].sort(); break
for n_,k_ in [('A',70),('B',35),('C',80)]: alloc(n_,k_)
release('A')
blocks=sorted((a,s) for s,l in free.items() for a in l); print('28:',blocks); assert len(blocks)==4 and blocks==[(0,128),(192,64),(384,128),(512,512)]
# 35 RTS 中的 NAV
data=1350*8/54e6*1e6; nav=10+15+10+data+10+15; print('35:',data,nav); assert round(data)==200 and round(nav)==260
# ── 综合题 ──
# 42 4 路最佳归并树
import heapq
L=[30,44,8,6,3,20,60,18,9,62,68,85]; k4=4; v=(k4-1-(len(L)-1)%(k4-1))%(k4-1); h=L+[0]*v; heapq.heapify(h); wpl=0
while len(h)>1:
    s=sum(heapq.heappop(h) for _ in range(k4)); wpl+=s; heapq.heappush(h,s)
print('42: 虚段',v,'WPL',wpl); assert v==1 and wpl==690
# 43 Cache 64KB、行 128B、4 路，32 位地址
lines=64*1024//128; sets=lines//4; tag=32-7-7; assert (lines,sets,tag)==(512,128,18) and lines*(18+2+1)==10752 and lines*(18+2+1+1)==11264
# 46 六种磁盘调度（起点 345，向 0 方向，0–999）
R=[123,874,692,475,105,376]; S=345
def tot(seq): return sum(abs(b-a) for a,b in zip([S]+seq,seq))
fcfs=tot(R)
cur=S; rr=R[:]; sstf=0
while rr:
    n_=min(rr,key=lambda r:abs(r-cur)); sstf+=abs(n_-cur); cur=n_; rr.remove(n_)
lo=sorted(r for r in R if r<S)[::-1]; hi=sorted(r for r in R if r>S)
scan=tot(lo+[0]+hi); look=tot(lo+hi); cscan=tot(lo+[0,999]+hi[::-1]); clook=tot(lo+hi[::-1])
print('46:',fcfs,sstf,scan,look,cscan,clook); assert (fcfs,sstf,scan,look,cscan,clook)==(2013,1298,1219,1009,1967,1507)
# 47 HTTP：RTT 150、每个 gif 发送 35，第三次握手捎带请求，非流水线
non=(150+150)+10*(150+150+35); per=150+150+10*(150+35); assert (non,per)==(3650,2150)
print('3003 自编与综合题复算全部通过')
