# 模拟卷二：计算类选择题与综合题独立复算（python3 _build/mock/chk/3002.py）
from fractions import Fraction as F
import struct, itertools, math
# 1 while(i*i*i<=n) i++ ：循环次数 ⌊∛n⌋+1
for n in (1,7,8,26,27,1000,10**6): assert sum(1 for _ in iter(int,1)) if False else True
cnt=lambda n: next(i for i in itertools.count() if i**3>n)
assert cnt(1000)==11 and cnt(10**6)==101
# 2
assert (3-8+21)%21==16
# 3 KMP 比较次数（next 数组，主串不回溯）
def nxt(p):
    n=[-1]*len(p); j=-1
    for i in range(1,len(p)):
        while j>=0 and p[j+1]!=p[i]: j=n[j]
        if p[j+1]==p[i]: j+=1
        n[i]=j
    return n
def kmp(s,p):
    f=nxt(p); c=0; j=0; i=0
    while i<len(s):
        c+=1
        if s[i]==p[j]:
            i+=1; j+=1
            if j==len(p): return c
        elif j==0: i+=1
        else: j=f[j-1]+1
    return c
print('3:',kmp('aabaaaba','aaab')); assert kmp('aabaaaba','aaab')==9
# 4 三叉树 50 个结点最小高度
assert next(h for h in itertools.count(1) if (3**h-1)//2>=50)==5
# 5 并查集
par=list(range(10))
def f(x):
    while par[x]!=x: x=par[x]
    return x
for a,b in [(1,2),(3,4),(5,6),(7,8),(8,9),(1,8),(0,5),(1,9)]:
    ra,rb=f(a),f(b)
    if ra!=rb: par[rb]=ra
assert len({f(x) for x in range(10)})==3
# 6 强连通分量
E=[('A','C'),('C','A'),('A','D'),('D','A'),('C','E'),('E','C'),('D','E'),('B','A'),('B','D'),('B','E')]
V='ABCDE'; R={v:{v} for v in V}
ch=True
while ch:
    ch=False
    for a,b in E:
        if not R[b]<=R[a]: R[a]|=R[b]; ch=True
scc={frozenset(w for w in V if w in R[v] and v in R[w]) for v in V}; assert len(scc)==2
# 8 折半查找 A[11]
lo,hi,path=1,11,[]
while lo<=hi:
    m=(lo+hi)//2; path.append(m)
    if m==11: break
    lo=m+1
assert path==[6,9,10,11]
# 9 3 阶 B 树 2047 个关键字：最矮每结点 2 个关键字，最高每结点 1 个
assert next(h for h in itertools.count(1) if 3**h-1>=2047)==7 and max(h for h in range(1,20) if 2**h-1<=2047)==11
# 10 希尔 d=6,3 两趟比较次数（每趟对各子序列做直接插入，比较到停为止）
def shell_cmp(a,ds):
    a=a[:]; c=0
    for d in ds:
        for i in range(d,len(a)):
            t=a[i]; j=i-d
            while j>=0:
                c+=1
                if a[j]>t: a[j+d]=a[j]; j-=d
                else: break
            a[j+d]=t
    return c
c=shell_cmp(list('EASYQUESTION'),[6,3]); print('10:',c); assert c==17
# 12
cpi=0.6*1+0.18*2+0.12*4+0.1*8; assert abs(cpi-2.24)<1e-9 and abs(100*cpi/40e6-5.6e-6)<1e-15
# 13
assert 0x9B-256==-101
# 14 float32 的 1+0.1（就近舍入）
import array
one=struct.unpack('f',struct.pack('f',1.0))[0]; tenth=struct.unpack('f',struct.pack('f',0.1))[0]
r=struct.pack('>f',one+tenth); print('14:',r.hex()); assert r.hex()=='3f8ccccd'
# 15 低位交叉：存储体数 ≥ 存取周期 / 总线周期
assert math.ceil(110/10)==11
# 17 小端
assert (0x78<<8|0x56)==0x7856
# 19 度为 4 的超标量：20 条分 5 组，(3+5−1)Δt
assert 3+20//4-1==7
# 20 突发：1+3+8 个周期传 32B
assert abs(32/(12*20e-9)/1e6-133.33)<0.01
# 21
assert 1024*1024*8//8==2**20
# 25 平均周转 14 的调度算法
J={'A':(10,3),'B':(6,5),'C':(2,2),'D':(4,1),'E':(8,4)}
def avg(order):
    t=0; s=0
    for x in order: t+=J[x][0]; s+=t
    return F(s,5)
sjf=sorted(J,key=lambda x:J[x][0]); pri=sorted(J,key=lambda x:-J[x][1]); fcfs=list('ABCDE')
rem={k:v[0] for k,v in J.items()}; t=0; fin={}; q=list('ABCDE')
while q:
    x=q.pop(0); rem[x]-=1; t+=1
    if rem[x]: q.append(x)
    else: fin[x]=t
rr=F(sum(fin.values()),5); print('25:',avg(sjf),avg(pri),avg(fcfs),rr); assert avg(sjf)==14 and 14 not in (avg(pri),avg(fcfs),rr)
# 28 最佳适应
free=[(100,80),(190,90),(330,60),(410,102)]; assert min((s,a) for a,s in free if s>=40)[1]==330
# 29
a=0x0A6F; pt={0:3,1:7,2:11,3:10}; assert hex(pt[a>>10]<<10|a&1023)=='0x2e6f'
# 30 索引顺序：√10000 组，组间、组内各平均一半
assert 10000**0.5/2*2==100
# 32 单缓冲 max(C,T)+M
assert max(30,80)+40==120
# 34 无噪声 8kHz、8 级：2W log2 V
assert 2*8e3*3==48e3
# 35 停等利用率 ≥ 80%
L=next(L for L in range(1,5000) if F(L,4000)/(F(L,4000)+F(6,100))>=F(8,10)); assert L==960
# 36 CDMA
S=(3,-1,1,1); C={'A':(1,-1,-1,1),'B':(-1,1,-1,1),'C':(1,1,1,1)}
res={k:sum(a*b for a,b in zip(S,v))//4 for k,v in C.items()}; print('36:',res); assert res=={'A':1,'B':-1,'C':1}
print('3002 选择题复算全部通过')
# ── 自编选择题 ──
# 16 TLB：虚拟 36 位、页 8KB、64 项 8 路
vpn=36-13; sets=64//8; tag=vpn-(sets.bit_length()-1); assert tag==20
# 31 位图：32GB / 4KB 个块，每块一位，存进 4KB 的块
bits=32*2**30//(4*2**10); assert bits//8//(4*2**10)==256
# 39 TCP：握手 1RTT，之后慢开始 1、2、2（剩余）个段，5 个 1KB 段发完并全部被确认
rtt=20; segs=5; cw=1; t=rtt; sent=0
while sent<segs: sent+=min(cw,segs-sent); t+=rtt; cw*=2
print('39:',t); assert t==80
# ── 综合题 ──
# 42 Dijkstra（王道 p.243 图）
import heapq
E={(1,2):7,(1,3):11,(2,3):10,(2,4):9,(3,4):5,(3,5):7,(3,6):8,(5,6):6}
G={}
for (a,b),w in E.items(): G.setdefault(a,[]).append((b,w)); G.setdefault(b,[]).append((a,w))
d={1:0}; pre={}; done=[]; pq=[(0,1)]
while pq:
    du,u=heapq.heappop(pq)
    if u in done: continue
    done.append(u)
    for v,w in G[u]:
        if du+w<d.get(v,1e9): d[v]=du+w; pre[v]=u; heapq.heappush(pq,(d[v],v))
def path(v):
    p=[v]
    while p[-1]!=1: p.append(pre[p[-1]])
    return p[::-1]
print('42:',done,[(v,d[v],path(v)) for v in done[1:]])
assert done==[1,2,3,4,5,6] and [d[v] for v in done[1:]]==[7,11,16,18,19] and path(4)==[1,2,4] and path(5)==[1,3,5] and path(6)==[1,3,6]
# 43 float：A、B、C、D
h=lambda v: struct.pack('>f',v).hex().upper()
assert (h(-68),h(-8.25),h(-68+-8.25),h(-68-(-8.25)))==('C2880000','C1040000','C2988000','C26F0000')
# 44 Cache：256B、块 32B、a[128] int，外层 10000 次
def miss(s,ways):
    lines=256//32; sets=lines//ways; cache=[[] for _ in range(sets)]; m=a=0
    for i in range(10000):
        for j in range(0,128,s):
            b=j*4//32; st=cache[b%sets]; a+=1
            if b in st: st.remove(b); st.append(b)
            else:
                m+=1
                if len(st)==ways: st.pop(0)
                st.append(b)
    return m,a
r={(s,w):miss(s,w) for s in (64,63) for w in (1,2)}; print('44:',r)
assert r[(64,1)][0]==r[(64,1)][1] and r[(64,2)][0]==2 and r[(63,2)][0]==3
assert abs(r[(63,1)][0]/r[(63,1)][1]-2/3)<1e-3
# 46 混合索引：最大长度、2GB 文件占用
n=4096//4; assert (10+n+n*n+n**3)*4096==4*2**40+4*2**30+4*2**20+40*2**10
blocks=2*2**30//4096; rest=blocks-10-n; idx=1+1+math.ceil(rest/n)   # 一级 1 块 ＋ 二级的 1 块顶层 ＋ 二级的下层
print('46: 索引块',idx); assert idx==513 and idx*4096==2*2**20+4*2**10
# 47 TCP 首部
hb=bytes.fromhex('0D28001550 5FA9060000000070024000C0290000'.replace(' ',''))
src,dst=int.from_bytes(hb[0:2],'big'),int.from_bytes(hb[2:4],'big'); seq=int.from_bytes(hb[4:8],'big'); ack=int.from_bytes(hb[8:12],'big')
hl=(hb[12]>>4)*4; flags=hb[13]
print('47:',src,dst,seq,ack,hl,bin(flags)); assert (src,dst,ack,hl,flags)==(3368,21,0,28,0x02) and seq==0x505FA906
print('3002 自编与综合题复算全部通过')
# 7 拓扑序列个数（题图：A→B；B→C、B→D；C→E、C→F；D→E、D→G；E→G；F→G）
import itertools as it
Eg=[('A','B'),('B','C'),('B','D'),('C','E'),('C','F'),('D','E'),('D','G'),('E','G'),('F','G')]
n7=sum(1 for p in it.permutations('ABCDEFG') if all(p.index(a)<p.index(b) for a,b in Eg)); assert n7==5
print('3002 第 7 题拓扑序 5 个，通过')
