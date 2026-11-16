# 模拟卷一：计算类选择题独立复算（python3 _build/mock/chk/3001.py，全部 assert 通过才算对）
import heapq, itertools
# 8 Dijkstra
E={(1,2):10,(1,3):2,(3,4):2,(3,6):11,(2,5):1,(4,5):4,(4,6):6,(5,7):7,(6,7):3}
G={}
for (a,b),w in E.items(): G.setdefault(a,[]).append((b,w)); G.setdefault(b,[]).append((a,w))
d={1:0}; pre={}; pq=[(0,1)]; done=set()
while pq:
    du,u=heapq.heappop(pq)
    if u in done: continue
    done.add(u)
    for v,w in G[u]:
        if du+w<d.get(v,1e9): d[v]=du+w; pre[v]=u; heapq.heappush(pq,(d[v],v))
p=[7]
while p[-1]!=1: p.append(pre[p[-1]])
print('8:',p[::-1],d[7]); assert p[::-1]==[1,3,4,6,7] and d[7]==13
# 唯一性：所有 1→7 简单路径里权和 13 的只有这一条
paths=[]
def dfs(u,path,c):
    if u==7: paths.append((c,path)); return
    for v,w in G[u]:
        if v not in path: dfs(v,path+[v],c+w)
dfs(1,[1],0); best=[x for x in paths if x[0]==min(paths)[0]]; assert len(best)==1
# 10 快排第一趟移动次数（王道划分：pivot 暂存算 1 次、每次填坑算 1 次、pivot 归位算 1 次）
def moves(a):
    a=a[:]; lo,hi=0,len(a)-1; p=a[lo]; m=1
    while lo<hi:
        while lo<hi and a[hi]>=p: hi-=1
        if lo<hi: a[lo]=a[hi]; m+=1
        while lo<hi and a[lo]<=p: lo+=1
        if lo<hi: a[hi]=a[lo]; m+=1
    a[lo]=p; m+=1; return m
S=[[92,96,88,42,30,35,110,100],[92,96,100,110,42,35,30,88],[100,96,92,35,30,110,88,42],[42,30,35,92,100,96,88,110]]
mv=[moves(s) for s in S]; print('10:',mv); assert max(mv)==mv[1] and mv.count(max(mv))==1
# 13
x,y=0x44,0xDC-256; r=(x>>1)+2*y; print('13:',hex(r&0xff),-128<=r<=127); assert (r&0xff)==0xDA and -128<=r<=127
# 14
import struct; v=struct.unpack('>f',bytes.fromhex('41A4C000'))[0]; print('14:',v); assert v==20.59375
# 16
assert (2593//32)%(64//4)==1
# 17
two=15; one=(16-two)*64; assert one>=48; zero=(one-48)*64; print('17:',zero); assert zero==1024
# 19 非等长流水线：第一条走完 5ns，之后每 2ns 出一条
assert 5+99*2==203
# 21 屏蔽字反推（第 i 位为 1 ＝ 屏蔽 i 级）
M={1:'1101',2:'0100',3:'1111',4:'0101'}
higher=lambda a,b: M[a][b-1]=='1' and M[b][a-1]=='0'
order=sorted(M,key=lambda a:-sum(higher(a,b) for b in M if b!=a)); print('21:',order); assert order==[3,1,4,2]
# 2 出栈序列可行性
def ok(seq,inp='abcdef'):
    st=[];i=0
    for c in seq:
        while (not st or st[-1]!=c) and i<len(inp): st.append(inp[i]); i+=1
        if st[-1]!=c: return False
        st.pop()
    return True
r=[ok(s) for s in ['fedcba','bcafed','dcefba','cabdef']]; print('2:',r); assert r==[True,True,True,False]
# 3 三对角 k=2i+j-2
assert 2*66+65-2==195
# 5 16 结点完全二叉树 → 森林
n=16; sz=lambda i: 0 if i>n else 1+sz(2*i)+sz(2*i+1)
roots=[1]; 
while 2*roots[-1]+1<=n: roots.append(2*roots[-1]+1)
trees=[1+sz(2*r) for r in roots]; print('5:',trees); assert len(trees)==4 and max(trees)==9
# 6 AVL 最少结点
N=[0,1,2]; 
for h in range(3,6): N.append(N[-1]+N[-2]+1)
assert N[5]==12
# 7
k=next(k for k in range(1,52) if k*(k-1)//2>=21); assert 51-k+1==45
# 9
assert sum(1 for x in [19,14,23,1,68,20,84,27,55,11,10,79] if x%13==1)==4
# 12
assert abs(12*800e6*1.5/8-1.8e9)<1
# 15
assert 0xBFFF%4==3
# 25 抢占式 SRTF，逐小时
P={1:(0,3),2:(1,1),3:(2,4),4:(3,5),5:(4,2)}; rem={k:v[1] for k,v in P.items()}; t=0; fin={}
while rem:
    rd=[k for k in rem if P[k][0]<=t]; k=min(rd,key=lambda k:(rem[k],P[k][0])); rem[k]-=1; t+=1
    if rem[k]==0: del rem[k]; fin[k]=t
tt=sum(fin[k]-P[k][0] for k in P); print('25:',fin,tt); assert tt==27
# 28
pt={0:2,1:1,3:0,4:5}; a=4097; assert pt[a//4096]*4096+a%4096==4097
# 29 LRU 4 页框
fr=[]; miss=0
for x in map(int,'1 8 1 7 8 2 7 2 1 8 3 8 2 1 3 1 7 1 3 7'.split()):
    if x in fr: fr.remove(x)
    else:
        miss+=1
        if len(fr)==4: fr.pop(0)
    fr.append(x)
print('29:',miss); assert miss==6
# 30
assert (1024//4)**2*1024==64*2**20
# 31
assert ((100-1)//32+1,(100-1)%32+1)==(4,4)
# 32 SSTF
cur=100; R=[55,58,39,18,90,160,150,38,184]; d=0
while R:
    n=min(R,key=lambda r:abs(r-cur)); d+=abs(n-cur); cur=n; R.remove(n)
print('32:',d); assert d==248
# 33 A—R—B，两个 1000B 分组，1Mb/s，处理 10ms
tx=8; t1=tx; p1=(t1,t1+10); s1=(p1[1],p1[1]+tx); t2=2*tx; p2=(max(t2,p1[1]),max(t2,p1[1])+10); s2=(max(p2[1],s1[1]),max(p2[1],s1[1])+tx); assert s2[1]==36
# 34
import math; assert min(2*6e3*4, 6e3*math.log2(16))==24e3
# 35
from fractions import Fraction as F; T=F(2000*8,20000); cyc=T+T+F(14,10); W=next(w for w in range(1,9) if w*T/cyc>0.8); print('35: 最小窗口',W); assert W==4 and W<=2**3-1 and W<=2**2
# 36
assert 2*10e3/200e6*10e6==1000
# 37
assert [ip//32 for ip in (33,65,44,55)]==[1,2,1,1]
# 39 超时后慢开始
th=34//2; c=1
for _ in range(4): c=min(c*2,th) if c<th else c+1
print('39:',c); assert c==16
print('3001 选择题复算全部通过')
# ── 综合题 ──
# 42 散列 H=key%11，线性探测与链地址
K=[1,13,12,34,38,33,27,22]; m=11; T=[None]*m; cmp={}
for k in K:
    a=k%m; c=1
    while T[a] is not None: a=(a+1)%m; c+=1
    T[a]=k; cmp[k]=c
asl_s=F(sum(cmp.values()),len(K))
def fail(h):
    c=1; a=h
    while T[a] is not None: a=(a+1)%m; c+=1
    return c
asl_f=F(sum(fail(h) for h in range(m)),m); print('42 线性探测:',T,asl_s,asl_f); assert (asl_s,asl_f)==(F(21,8),F(47,11))
ch=[[] for _ in range(m)]
for k in K: ch[k%m].append(k)
s_=F(sum(i+1 for c in ch for i in range(len(c))),len(K)); f_=F(sum(len(c)+1 for c in ch),m)   # 失败：比到空指针算 1 次
print('42 链地址:',s_,f_); assert (s_,f_)==(F(13,8),F(19,11))
# 43 Cache 位数
off=6; idx=(128//4).bit_length()-1; tag=32-idx-off; total=128*(tag+1+1)+128*64*8; print('43:',tag,idx,off,total); assert (tag,idx,total)==(21,5,68480)
# 46 OPT / FIFO / LRU，3 与 4 个页框
seq=[4,3,2,1,4,3,5,4,3,2,1,5]
def run(alg,n):
    fr=[]; miss=0
    for i,x in enumerate(seq):
        if x in fr:
            if alg=='LRU': fr.remove(x); fr.append(x)
            continue
        miss+=1
        if len(fr)==n:
            if alg=='OPT':
                fut=seq[i+1:]; v=max(fr,key=lambda p: fut.index(p) if p in fut else 99); fr.remove(v)
            else: fr.pop(0)
        fr.append(x)
    return miss
R={(a,n):run(a,n) for a in ('OPT','FIFO','LRU') for n in (3,4)}; print('46:',R)
assert R==({('OPT',3):7,('OPT',4):6,('FIFO',3):9,('FIFO',4):10,('LRU',3):10,('LRU',4):8})
# 47 最长前缀匹配
import ipaddress as ip
RT=[('131.128.56.0/24','A'),('131.128.55.32/28','B'),('131.128.55.32/30','C'),('131.128.0.0/16','D')]
def nh(d,rt=RT):
    c=[(ip.ip_network(n).prefixlen,h) for n,h in rt if ip.ip_address(d) in ip.ip_network(n)]
    return max(c)[1] if c else None
assert nh('131.128.55.33')=='C' and nh('131.128.55.38')=='B'
RT2=RT+[('131.128.55.33/32','A'),('0.0.0.0/0','E')]
assert nh('131.128.55.33',RT2)=='A' and nh('131.128.55.34',RT2)=='C' and nh('8.8.8.8',RT2)=='E'
subs=list(ip.ip_network('131.128.56.0/24').subnets(new_prefix=26)); assert [str(s) for s in subs]==['131.128.56.0/26','131.128.56.64/26','131.128.56.128/26','131.128.56.192/26']
print('3001 综合题复算全部通过')
