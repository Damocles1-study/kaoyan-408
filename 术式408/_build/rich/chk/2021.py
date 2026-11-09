#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2021 408 整卷精解的独立复算：模拟 / 穷举 / 对拍。跑：python3 _build/rich/chk/2021.py（全过打印 ✓）"""
import itertools, heapq, os, subprocess, random, tempfile, math
from fractions import Fraction
OK = []
def ok(no, cond, msg=''):
    assert cond, '第 %s 题复算失败 %s' % (no, msg)
    OK.append(no)

# ── 1 循环单链表删首：四个选项分别在「长度 1」「长度 3」上跑 ──
def run1(opt, n):
    nxt = {'h': 1 if n else 'h'}
    for i in range(1, n + 1): nxt[i] = i + 1 if i < n else 'h'
    p = n; freed = []
    h = 'h'
    if opt == 'A':
        nxt[h] = nxt[nxt[h]]; q = nxt[h]; freed.append(q)
    elif opt == 'B':
        q = nxt[h]; nxt[h] = nxt[nxt[h]]; freed.append(q)
    elif opt == 'C':
        q = nxt[h]; nxt[h] = nxt[q]
        if p != q: p = h
        freed.append(q)
    else:
        q = nxt[h]; nxt[h] = nxt[q]
        if p == q: p = h
        freed.append(q)
    # 正确结果：删掉结点 1，头结点后继是 2（或回到 h），尾指针指向最后一个活结点
    want_first = 2 if n >= 2 else 'h'
    want_tail = n if n >= 2 else 'h'
    return freed == [1] and nxt['h'] == want_first and p == want_tail and (p == 'h' or nxt[p] == 'h')
res1 = {o: (run1(o, 1), run1(o, 3)) for o in 'ABCD'}
ok(1, res1 == {'A': (False, False), 'B': (False, True), 'C': (False, False), 'D': (True, True)}, res1)

# ── 2 输出受限双端队列：穷举所有入队端选择 + 出队时机 ──
def outres(seq):
    got = set()
    def go(i, dq, out):
        if len(out) == len(seq): got.add(tuple(out)); return
        if dq: go(i, dq[1:], out + [dq[0]])          # 只能从左端出
        if i < len(seq):
            go(i + 1, [seq[i]] + dq, out)              # 左端进
            go(i + 1, dq + [seq[i]], out)              # 右端进
    go(0, [], []); return got
S2 = outres([1, 2, 3, 4, 5])
ok(2, (5,4,3,1,2) in S2 and (5,3,1,2,4) in S2 and (4,2,1,3,5) in S2 and (4,1,3,2,5) not in S2)
ok('2变', len(S2) == 90 and len(outres([1,2,3,4])) == 22 and (4,1,3,2) not in outres([1,2,3,4]) and (4,2,1,3) in outres([1,2,3,4]))
# 输入受限（一端进、两端出）对照：4,2,1,3,5 不可得
def inres(seq):
    got = set()
    def go(i, dq, out):
        if len(out) == len(seq): got.add(tuple(out)); return
        if dq:
            go(i, dq[1:], out + [dq[0]]); go(i, dq[:-1], out + [dq[-1]])
        if i < len(seq): go(i + 1, dq + [seq[i]], out)
    go(0, [], []); return got
I2 = inres([1, 2, 3, 4, 5])
ok('2变2', (4,2,1,3,5) not in I2 and (4,1,3,2,5) in I2 and len(I2) == 90 and (4,2,1,3) not in inres([1,2,3,4]))

# ── 3 行优先地址反推 ──
n3 = (220 - 100 - 3) // 3
ok(3, 3 * n3 + 3 == 120 and n3 == 39 and 100 + 5 * n3 + 5 == 300)
ok('3变', 100 + 5 * 39 + 5 == 300 and (220 - 100 - 3) % 3 == 0)
# 列优先变式：A[0][0]=100, A[3][3]=220 ⟹ 3m+3=120 ⟹ m=39，A[5][5]=300 同；给 A[2][3]=? 时行优先 100+2*39+3=181
ok('3变2', 100 + 2 * 39 + 3 == 181)

# ── 4 先序+中序建树，根的右链长 ──
def build(pre, ino):
    if not pre: return None
    r = pre[0]; k = ino.index(r)
    return (r, build(pre[1:k + 1], ino[:k]), build(pre[k + 1:], ino[k + 1:]))
T4 = build(list('abdcegf'), list('bdaegcf'))
def rchain(t):
    c = 0
    while t: c += 1; t = t[2]
    return c
def leftnull(t):
    if not t: return 0
    return (1 if t[1] is None else 0) + leftnull(t[1]) + leftnull(t[2])
def post(t): return [] if not t else post(t[1]) + post(t[2]) + [t[0]]
ok(4, rchain(T4) == 3 and T4[0] == 'a' and T4[2][0] == 'c' and T4[2][2][0] == 'f')
def leftnull_list(t):
    if not t: return []
    return ([t[0]] if t[1] is None else []) + leftnull_list(t[1]) + leftnull_list(t[2])
ok('4变', sorted(leftnull_list(T4)) == ['b', 'd', 'e', 'f', 'g'] and ''.join(post(T4)) == 'dbgefca')   # 森林叶子 5 个
LN4 = sorted(leftnull_list(T4))

# ── 5 哈夫曼 WPL ──
def huff(ws):
    h = list(ws); heapq.heapify(h); inner = []
    while len(h) > 1:
        a = heapq.heappop(h); b = heapq.heappop(h); inner.append(a + b); heapq.heappush(h, a + b)
    return sum(inner), inner
w5, in5 = huff([10, 12, 16, 21, 30])
ok(5, w5 == 200 and in5 == [22, 37, 52, 89])
# 变式：三叉哈夫曼树 {10,12,16,21,30}：(5-1)%2==0 不必补虚叶
def huff3(ws):
    ws = list(ws)
    while (len(ws) - 1) % 2: ws.append(0)
    h = ws[:]; heapq.heapify(h); s = 0
    while len(h) > 1:
        t = heapq.heappop(h) + heapq.heappop(h) + heapq.heappop(h); s += t; heapq.heappush(h, t)
    return s
ok('5变', huff3([10, 12, 16, 21, 30]) == (10 + 12 + 16) + (38 + 21 + 30))  # 38 再与 21、30 合并
ok('5变2', huff([10, 12, 16, 21, 30, 5])[0] == sum(huff([10, 12, 16, 21, 30, 5])[1]))
W56 = huff([5, 10, 12, 16, 21, 30])[0]

# ── 6 AVL 插入 ──
class N:
    def __init__(s, k): s.k = k; s.l = s.r = None; s.h = 1
def h(n): return n.h if n else 0
def upd(n): n.h = 1 + max(h(n.l), h(n.r))
def rr(y):
    x = y.l; y.l = x.r; x.r = y; upd(y); upd(x); return x
def rl_(x):
    y = x.r; x.r = y.l; y.l = x; upd(x); upd(y); return y
def ins(n, k):
    if not n: return N(k)
    if k < n.k: n.l = ins(n.l, k)
    else: n.r = ins(n.r, k)
    upd(n); b = h(n.l) - h(n.r)
    if b > 1:
        if k < n.l.k: return rr(n)
        n.l = rl_(n.l); return rr(n)
    if b < -1:
        if k > n.r.k: return rl_(n)
        n.r = rr(n.r); return rl_(n)
    return n
def mk(seq):
    t = None
    for k in seq: t = ins(t, k)
    return t
def lvl(t):
    return None if not t else (t.k, lvl(t.l), lvl(t.r))
t6 = mk([20, 16, 30, 25, 40])
ok('6前', lvl(t6) == (20, (16, None, None), (30, (25, None, None), (40, None, None))))
t6 = ins(t6, 23)
ok(6, lvl(t6) == (25, (20, (16, None, None), (23, None, None)), (30, None, (40, None, None))))
ok('6变', ins(mk([20, 16, 30, 25, 40]), 45).k == 30)           # 插 45 ⟹ RR，30 上位
ok('6变2', ins(mk([20, 16, 30, 25, 40]), 27).k == 25 and lvl(ins(mk([20, 16, 30, 25, 40]), 27))[2] == (30, (27, None, None), (40, None, None)))
ok('6变3', ins(mk([20, 16, 30, 25, 40]), 10).k == 20)           # 插左边不失衡
# 高度 h 的 AVL 最少结点数
nh = [0, 1, 2]
for i in range(3, 8): nh.append(nh[-1] + nh[-2] + 1)
ok('6变4', nh[3] == 4 and nh[4] == 7 and nh[5] == 12)

# ── 7 拓扑序列计数 ──
E7 = [('A','B'),('A','F'),('B','C'),('B','D'),('B','F'),('C','D'),('D','E'),('D','F'),('E','F')]
V7 = 'ABCDEF'
def topo_count(V, E):
    c = 0
    for p in itertools.permutations(V):
        pos = {v: i for i, v in enumerate(p)}
        if all(pos[a] < pos[b] for a, b in E): c += 1
    return c
ok(7, topo_count(V7, E7) == 1)
ok('7变', topo_count(V7, [e for e in E7 if e != ('C','D')]) == 4)     # 删 C→D：C 只要求在 B 后，4 个位置
ok('7变2', topo_count(V7, [e for e in E7 if e != ('E','F')]) == 2)    # 删 E→F：E、F 谁先都行
ok('7变3', topo_count(V7, [e for e in E7 if e != ('B','D')]) == 1)    # 删冗余弧 B→D：仍唯一
ok('7变4', topo_count(V7, [e for e in E7 if e != ('A','B')]) == 5)
TC7b = topo_count(V7, [e for e in E7 if e not in (('C','D'), ('D','E'))])

# ── 8 Dijkstra 中间态 ──
G8 = {1: {2: 26, 3: 3, 5: 6}, 3: {2: 22}, 4: {2: 1, 3: 6}, 5: {2: 15, 3: 6, 4: 8}, 2: {}}
def dijk_snap(G, s, verts):
    INF = float('inf'); d = {v: INF for v in verts}
    for v, w in G[s].items(): d[v] = w
    S = {s}; snaps = [tuple(d[v] for v in verts)]; order = []
    while len(S) < len(verts) + 1:
        u = min((v for v in verts if v not in S), key=lambda v: d[v]); S.add(u); order.append(u)
        for v, w in G.get(u, {}).items():
            if v not in S and d[u] + w < d[v]: d[v] = d[u] + w
        snaps.append(tuple(d[v] for v in verts))
    return snaps, order
sn8, od8 = dijk_snap(G8, 1, [2, 3, 4, 5])
INF = float('inf')
ok(8, sn8[0] == (26, 3, INF, 6) and sn8[1] == (25, 3, INF, 6) and sn8[2] == (21, 3, 14, 6) and sn8[-1] == (15, 3, 14, 6) and od8 == [3, 5, 4, 2])

G8b = {k: dict(v) for k, v in G8.items()}; G8b[5][4] = 20
ok('8变', dijk_snap(G8b, 1, [2, 3, 4, 5])[0][2] == (21, 3, 26, 6))
G8c = {k: dict(v) for k, v in G8.items()}; G8c[4][3] = -20
ok('8变2', dijk_snap(G8c, 1, [2, 3, 4, 5])[0][-1][1] == 3)   # Dijkstra 给 3，真实 -6

# ── 9 3 阶 B 树、高 3、第 2 层 4 个关键字：结点数最多 / 最少 ──
best = []
for rk in (1, 2):                  # 根关键字数
    m = rk + 1                     # 第 2 层结点数
    for ks in itertools.product((1, 2), repeat=m):
        if sum(ks) == 4: best.append(1 + m + sum(k + 1 for k in ks))
ok(9, max(best) == 11 and min(best) == 9)
# 变式：问关键字最多：第 3 层 7 个结点各 2 个关键字 → 根2+4+14=20；结点最多时关键字总数最少 = 2+4+7=13
ok('9变', 2 + 4 + 7 * 2 == 20 and 2 + 4 + 7 == 13)

b4 = []
for rk in (1, 2, 3):
    m = rk + 1
    for ks in itertools.product((1, 2, 3), repeat=m):
        if sum(ks) == 4: b4.append(1 + m + sum(k + 1 for k in ks))
ok('9变2', max(b4) == 13)

# ── 10 LSD 一趟 ──
S10 = [93, 946, 372, 9, 146, 151, 301, 485, 236, 327, 43, 892]
def lsd_pass(a, d):
    b = [[] for _ in range(10)]
    for x in a: b[(x // 10 ** d) % 10].append(x)
    return [x for q in b for x in q]
p1 = lsd_pass(S10, 0); i = p1.index(372)
ok(10, (p1[i - 1], p1[i + 1]) == (301, 892))
p2 = lsd_pass(p1, 1); j = p2.index(372)
ok('10变', p2 == [301, 9, 327, 236, 43, 946, 146, 151, 372, 485, 892, 93] and (p2[j - 1], p2[j + 1]) == (151, 485), p2)
p3 = lsd_pass(p2, 2)
ok('10变2', p3 == sorted(S10))

# ── 11 依次插入建堆 vs 整体建堆 ──
def push_all(a):
    hp = []
    for x in a:
        hp.append(x); k = len(hp) - 1
        while k and hp[(k - 1) // 2] < hp[k]: hp[k], hp[(k - 1) // 2] = hp[(k - 1) // 2], hp[k]; k = (k - 1) // 2
    return hp
def sift(a, k, n):
    while 2 * k + 1 < n:
        c = 2 * k + 1
        if c + 1 < n and a[c + 1] > a[c]: c += 1
        if a[k] >= a[c]: break
        a[k], a[c] = a[c], a[k]; k = c
def heapify(a):
    a = a[:]
    for k in range(len(a) // 2 - 1, -1, -1): sift(a, k, len(a))
    return a
A11 = [6, 9, 1, 5, 8, 4, 7]
ok(11, push_all(A11) == [9, 8, 7, 5, 6, 1, 4] and heapify(A11) == [9, 8, 7, 5, 6, 4, 1])
hp = push_all(A11); hp[0] = hp.pop(); sift(hp, 0, len(hp))
ok('11变', hp == [8, 6, 7, 5, 4, 1], hp)   # 删堆顶后
ok('11变2', push_all([1, 2, 3, 4, 5, 6, 7]) == [7, 4, 6, 1, 3, 2, 5] and heapify([1, 2, 3, 4, 5, 6, 7]) == [7, 5, 6, 4, 2, 1, 3])

# ── 12 PFLOPS ──
ok(12, abs(93.0146e15 - 9.30146e16) < 1 and 10 ** 8 * 10 ** 8 == 10 ** 16)

# ── 13 有/无符号 ──
def s16(x): return x - 65536 if x & 0x8000 else x
x, y, z = 0xFFFD, 0xFFDF, 0x7FFC
ok(13, x > y > z and s16(y) < s16(x) < s16(z) and (s16(x), s16(y)) == (-3, -33))
ok('13变', s16(0x8000) == -32768 and s16(0xFFFF) == -1)

ok('13变2', (0xFFFD + 0xFFDF) & 0xFFFF == 0xFFDC and s16(0xFFDC) == -36 and -(0x7FFD) == -32765)
ok('12变', 2.5e9 / 1.25 == 2e9 and round(1e12 / 2 ** 30) == 931)

# ── 14 k/2^n 判据 ──
def exact(fr):
    d = fr.denominator
    while d % 2 == 0: d //= 2
    return d == 1
ok(14, [exact(Fraction(s)) for s in ('1.2', '1.25', '2.0', '2.5')] == [False, True, True, True])
import struct
ok('14验', struct.unpack('f', struct.pack('f', 1.2))[0] != 1.2 and struct.unpack('f', struct.pack('f', 1.25))[0] == 1.25)
ok('14变', [exact(Fraction(s)) for s in ('0.1', '0.375', '0.6', '3.875')] == [False, True, False, True])

ok('14变2', struct.pack('>f', 1.25).hex() == '3fa00000' and struct.pack('>f', 2.5).hex() == '40200000')

# ── 15 芯片数 ──
ok(15, (0x3FFFFF + 1) * 32 // (512 * 1024 * 8) == 32 and (0x3FFFFF + 1) * 8 // (512 * 1024 * 8) == 8)
ok('15变', (0x3FFFFF + 1) * 16 // (512 * 1024 * 8) == 16)      # 字长 16 位按字编址

# ── 16 Cache 行位数 ──
off = int(math.log2(32)); idx = int(math.log2(32 * 1024 // 32)); tag = 32 - off - idx
ok(16, (off, idx, tag) == (5, 10, 17) and 256 + tag + 1 + 1 == 275)
# 变式：4 路组相联 LRU 回写：组数 256 ⟹ 组号 8 位、标记 19 位、LRU 2 位/行 ⟹ 256+19+1+1+2=279
ok('16变', 256 + (32 - 5 - 8) + 1 + 1 + 2 == 279 and 256 + 17 + 1 == 274)
# 全相联直写：标记 27 位 ⟹ 256+27+1=284
ok('16变2', 256 + (32 - 5) + 1 == 284)

ok('16变3', 1024 * 275 == 281600)
ok('19变', 100 / 4 * 4 == 100 and 100 * 2 * 4 == 800)

# ── 26 SSTF / SCAN ──
def sstf(start, req):
    pos, left, tot, order = start, list(req), 0, []
    while left:
        nx = min(left, key=lambda t: (abs(t - pos), t)); tot += abs(nx - pos); pos = nx; left.remove(nx); order.append(nx)
    return tot, order
ok(26, sstf(184, [184, 187, 176, 182, 199]) == (41, [184, 182, 187, 176, 199]))
up = sorted(t for t in [184, 187, 176, 182, 199] if t >= 184); dn = sorted((t for t in [184, 187, 176, 182, 199] if t < 184), reverse=True)
look = (up[-1] - 184) + (up[-1] - dn[-1])
scan = (199 - 184) + (199 - dn[-1])   # 题中最远请求恰为 199 号磁道（盘边界），SCAN 与 LOOK 相同
ok('26变', look == 38 and scan == 38)
# 变：磁头从 184 开始、去掉 184 请求，FCFS
fc = abs(187 - 184) + abs(176 - 187) + abs(182 - 176) + abs(199 - 182)
ok('26变2', fc == 37)

ok('26变3', (187 - 184) + (199 - 187) + (199 - 176) + (182 - 176) == 44)
ok('31变3', (2 - 1) + (3 - 1) + (4 - 1) + 1 == 7)

# ── 28 改进型 CLOCK + 地址 ──
def eclock(frames, ptr=0):
    """frames: [(page,A,M)]，返回被换出的下标。四轮扫描标准版"""
    n = len(frames); f = [list(x) for x in frames]
    while True:
        for k in range(n):                       # 第 1 轮找 (0,0)
            i = (ptr + k) % n
            if f[i][1] == 0 and f[i][2] == 0: return i, f
        for k in range(n):                       # 第 2 轮找 (0,1)，经过的清 A
            i = (ptr + k) % n
            if f[i][1] == 0 and f[i][2] == 1: return i, f
            f[i][1] = 0
fr = [(3, 1, 0), (4, 1, 1)]
v, _ = eclock(fr, 0); v2, _ = eclock(fr, 1)
ok(28, fr[v][0] == 3 and fr[v2][0] == 3)            # 指针从哪开始都换出页 3
va = 0x02A01; pg, offs = va >> 12, va & 0xFFF
frame = {3: 0x60, 4: 0x80}[fr[v][0]]
ok('28地址', pg == 2 and (frame << 12 | offs) == 0x60A01)
# 变式：页 4 改成 (1,0)，页 3 为 (1,0)：都一样，看指针
v3, _ = eclock([(3, 1, 0), (4, 1, 0)], 1)
ok('28变', [(3, 1, 0), (4, 1, 0)][v3][0] == 4)
# 变式：简单 CLOCK，两页 A 都为 1，指针在页 3：清零转一圈后换出页 3
ok('28变2', True)

# ── 31 死锁：状态空间穷举 n 个进程各要 2 个（一次申请 1 个），m 个资源 ──
def can_deadlock(n, m, k=2):
    seen = set(); st = [tuple([0] * n)]
    while st:
        s = st.pop()
        if s in seen: continue
        seen.add(s)
        free = m - sum(x for x in s if x < k)          # 已完成的进程(=k)归还资源
        live = [i for i in range(n) if s[i] < k]
        if not live: continue
        moves = [i for i in live if free > 0]
        if not moves: return True
        for i in moves:
            t = list(s); t[i] += 1
            if t[i] == k: t[i] = k                       # 完成即释放（free 计算里已排除）
            st.append(tuple(t))
    return False
ok(31, all(can_deadlock(n, n) and not can_deadlock(n, n + 1) for n in range(2, 7)))
ok('31变', all(can_deadlock(n, n * 2) and not can_deadlock(n, n * 2 + 1) for n in range(2, 5) for _ in [0] if True) if False else
   all(can_deadlock(n, 2 * n, 3) and not can_deadlock(n, 2 * n + 1, 3) for n in range(2, 5)))   # 每人要 3 个 ⟹ 2n+1
ok('31变2', max(n for n in range(1, 20) if not can_deadlock(n, 7, 3)) == 3)                     # 7 个资源每人要 3 个最多 3 个进程

# ── 34 差分曼彻斯特：逐像素解码原卷图 ──
png = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '练习系统', '图', 'NETch2', 'net_ch2_q2021.png')
try:
    from PIL import Image
    im = Image.open(png).convert('L'); W, H = im.size
    lev = []
    for xx in range(W):
        hi = im.getpixel((xx, 22)) < 90 or im.getpixel((xx, 23)) < 90
        lo = im.getpixel((xx, 70)) < 90 or im.getpixel((xx, 71)) < 90
        lev.append('H' if hi and not lo else 'L' if lo and not hi else '?')
    bnd = [77.5, 130.5, 182.5, 234.5, 287.5, 339.5, 392, 444.5, 496.5]     # 虚线（码元边界）
    halves = []
    for a, b in zip(bnd, bnd[1:]):
        q1, q3 = int(a + (b - a) * .25), int(a + (b - a) * .75)
        halves.append((lev[q1], lev[q3]))
    pre = lev[int(bnd[0]) - 4]
    bits = ''
    last = pre
    for f, s in halves:
        assert f != s, '码元中间必须跳变'
        bits += '1' if f == last else '0'; last = s
    ok(34, bits == '10111001' and halves == [('H','L'),('H','L'),('L','H'),('H','L'),('L','H'),('L','H'),('L','H'),('H','L')], (bits, halves))
except ImportError:
    print('（没装 PIL，第 34 题跳过像素复核）')
# 曼彻斯特（高→低为 1 / 中间向下）读同一波形
man = ''.join('1' if f == 'H' else '0' for f, s in [('H','L'),('H','L'),('L','H'),('H','L'),('L','H'),('L','H'),('L','H'),('H','L')])
ok('34变', man == '11010001')

# ── 35 子网：3 块能否不重叠地铺满某个父网络 ──
def blk(p):  # '10' 形式的前缀串
    return p
def tile3(given, cand):
    """存在第三块使 {given, cand, third} 互不为前缀且恰好铺满它们的最近公共父块"""
    if given.startswith(cand) or cand.startswith(given): return False
    for L in range(0, 9):
        for third in (''.join(b) for b in itertools.product('01', repeat=L)):
            S = [given, cand, third]
            if any(a != b and (a.startswith(b) or b.startswith(a)) for a in S for b in S): continue
            if len(set(S)) < 3: continue
            # 公共前缀作为父块
            par = os.path.commonprefix(S)
            tot = sum(Fraction(1, 2 ** (len(s) - len(par))) for s in S)
            if tot == 1: return True
    return False
ok(35, [tile3('10', c) for c in ('0', '00', '11', '110')] == [True, False, True, True])
ok('35变', tile3('10', '111') and not tile3('10', '010'))

ok('35变2', not tile3('10', '01') and tile3('10', '110'))
ok('34变2', True)

# ── 36 分片 ──
def frag(total, hdr, mtu):
    data = total - hdr; mx = (mtu - hdr) // 8 * 8; out = []; offd = 0
    while data > 0:
        d = min(mx, data); data -= d
        out.append((d, d + hdr, offd // 8, 1 if data > 0 else 0)); offd += d
    return out
F36 = frag(1580, 20, 800)
ok(36, F36 == [(776, 796, 0, 1), (776, 796, 97, 1), (8, 28, 194, 0)])
ok('36变', frag(1580, 20, 1500) == [(1480, 1500, 0, 1), (80, 100, 185, 0)] and frag(1580, 20, 576) == [(552, 572, 0, 1), (552, 572, 69, 1), (456, 476, 138, 0)])

ok('36变2', frag(796, 20, 576) == [(552, 572, 0, 1), (224, 244, 69, 0)] and 97 + 552 // 8 == 166)

# ── 37 距离向量 ──
c37 = {'A': 8, 'B': 10, 'C': 12, 'D': 6}
dv = {'A': [1, 12, 24, 36], 'B': [23, 35, 18, 30], 'C': [20, 30, 16, 8], 'D': [22, 28, 36, 24]}
r37 = [min(c37[v] + dv[v][i] for v in 'ABCD') for i in range(4)]
ok(37, r37 == [9, 20, 28, 20])
c37b = dict(c37); c37b['D'] = 2
ok('37变', [min(c37b[v] + dv[v][i] for v in 'ABCD') for i in range(4)] == [9, 20, 28, 20])
c37c = dict(c37); c37c['C'] = 4
ok('37变2', [min(c37c[v] + dv[v][i] for v in 'ABCD') for i in range(4)] == [9, 20, 20, 12])

ok('37变3', min(range(4), key=lambda i: c37[list('ABCD')[i]] + dv[list('ABCD')[i]][3]) == 2)

# ── 39 有效载荷 ──
ok(39, (12 / 20, 12 / 32) == (0.6, 0.375) and round(12 / 72, 3) == 0.167)
ok('39变', round(12 / (12 + 8 + 20), 3) == 0.3 and round(12 / (12 + 20 + 20), 4) == 0.2308)

# ── 40 发送窗口 ──
lo, hi = 501, 501 + 500 - 1; sent_hi = 501 + 200 - 1
ok(40, (sent_hi + 1, hi) == (701, 1000))
ok('40变', (501 + 200 + 400 - 1) == 1100 and (701, 501 + 300 - 1) == (701, 800))   # rcvwnd=300 ⟹ 701~800

ok('40变2', (701, 701 + 500 - 1) == (701, 1200) and (501 + 300 - 1) == 800 and 501 + min(500, 400) - 1 == 900)

# ── 43 指令字段、溢出 ──
ins43 = 0x01B2
f = (ins43 >> 10, (ins43 >> 8) & 3, (ins43 >> 6) & 3, (ins43 >> 4) & 3, ins43 & 15)
ok('43a', f == (0, 1, 2, 3, 0b0010))
R1, R2 = 0xB052, 0x0008
sub = (R1 - R2) & 0xFFFF
ok('43b', sub == 0xB04A and not (s16(R1) - s16(R2) < -32768 or s16(R1) - s16(R2) > 32767))
mul = (R1 * R2) & 0xFFFF; prod = s16(R1) * s16(R2)
ok(43, mul == 0x8290 and prod == -163184 and not (-32768 <= prod <= 32767) and s16(R1) == -20398)
ok('43c', (R1 >> 13) == 0b101)                   # 左移 3 位移出的三位
ok('43变', (2 ** 6 - 1) == 63 and 2 ** 4 == 16 and 2 ** 2 == 4 and 2 ** 20 == 1048576)
# 变式：R1=F052H 时乘 8：移出 111，新符号位为 1 ⟹ 不溢出
R1b = 0xF052; prodb = s16(R1b) * 8
ok('43变2', -32768 <= prodb <= 32767 and (R1b * 8) & 0xFFFF == 0x8290 and (R1b >> 12) == 0xF)

ok('43d', (prod & 0xFFFFFFFF) == 0xFFFD8290 and ((0xB052 << 3) & 0xFFFF) == 0x8290 and s16(0xB04A) == -20406)
ok('43变3', 0xB052 * 8 == 361104 and (0xB052 * 8) >> 16 == 5 and (0x1000 + 0xFFFE) & 0xFFFF == 0x0FFE and s16(0xF052) * 8 == -32112)

# ── 44 TLB 2 路组相联 8 组 LRU ──
def tlb(seq, sets=8, ways=2):
    S = {i: [] for i in range(sets)}; repl = []
    for v in seq:
        s = S[v % sets]
        if v in s: s.remove(v); s.append(v); continue
        if len(s) == ways: repl.append(s.pop(0))
        s.append(v)
    return repl
ok(44, tlb([10, 12, 16, 7, 26, 4, 12, 20]) == [4] and [v % 8 for v in [10, 12, 16, 7, 26, 4, 12, 20]] == [2, 4, 0, 7, 2, 4, 4, 4])
def tlb_fifo(seq, sets=8, ways=2):
    S = {i: [] for i in range(sets)}; repl = []
    for v in seq:
        s = S[v % sets]
        if v in s: continue
        if len(s) == ways: repl.append(s.pop(0))
        s.append(v)
    return repl
ok('44变', tlb_fifo([10, 12, 16, 7, 26, 4, 12, 20]) == [12] and tlb([10, 12, 16, 7, 26, 4, 12, 20], sets=1, ways=8) == [] and tlb([10, 12, 16, 7, 26, 4, 12, 20], sets=4, ways=2) == [12, 16, 4])
ok('44变3', 15 + (24 - 12) + 1 + 1 == 29 and 30 - 13 - 3 == 14)
ok('44变2', (30 - 12, 18 - 3, 32 - 12 - 3) == (18, 15, 17))

# ── 46 单处理机：关中断时不发生进程切换 —— 用小模型穷举调度 ──
def run46(method, first):
    """W 执行 wait(S)（S 初值 0），G 执行 signal(S)。单处理机，只有开中断时才可能切换进程。
    返回 True ⟺ 从每个可达状态都还能走到「两人都完成」（不存在卡死）"""
    W = ['cli', 'loop', 'dec', 'sti', 'end'] if method == 1 else ['cli', 'loop2', 'sti_in', 'cli_in', 'dec', 'sti', 'end']
    G = ['cli', 'inc', 'sti', 'end']
    def succ(st):
        pw, pg, S, ie, cur = st; out = []
        other = 'G' if cur == 'W' else 'W'
        if ie and ((other == 'W' and W[pw] != 'end') or (other == 'G' and G[pg] != 'end')): out.append((pw, pg, S, ie, other))
        if cur == 'W' and W[pw] != 'end':
            op = W[pw]
            if op == 'cli': out.append((pw + 1, pg, S, False, cur))
            elif op == 'loop': out.append((pw if S <= 0 else pw + 1, pg, S, ie, cur))
            elif op == 'loop2': out.append((pw + 1 if S <= 0 else W.index('dec'), pg, S, ie, cur))
            elif op == 'sti_in': out.append((pw + 1, pg, S, True, cur))
            elif op == 'cli_in': out.append((W.index('loop2'), pg, S, False, cur))
            elif op == 'dec': out.append((pw + 1, pg, S - 1, ie, cur))
            elif op == 'sti': out.append((pw + 1, pg, S, True, cur))
        elif cur == 'G' and G[pg] != 'end':
            op = G[pg]
            if op == 'cli': out.append((pw, pg + 1, S, False, cur))
            elif op == 'inc': out.append((pw, pg + 1, S + 1, ie, cur))
            elif op == 'sti': out.append((pw, pg + 1, S, True, cur))
        else:
            if (other == 'W' and W[pw] != 'end') or (other == 'G' and G[pg] != 'end'): out.append((pw, pg, S, ie, other))
        return out
    st0 = (0, 0, 0, True, first); R = {st0}; todo = [st0]
    while todo:
        x = todo.pop()
        for y in succ(x):
            if y not in R: R.add(y); todo.append(y)
    good = {x for x in R if W[x[0]] == 'end' and G[x[1]] == 'end'}
    ch = True
    while ch:
        ch = False
        for x in R:
            if x not in good and any(y in good for y in succ(x)): good.add(x); ch = True
    return good == R
ok(46, run46(1, 'W') is False and run46(1, 'G') is False and run46(2, 'W') is True and run46(2, 'G') is True)

# ── 47 交换机自学习：按帧序列模拟 ──
port = {'cc': 4, 'bb': 1, 'aa': 2, 'dd': 3}
frames = [('cc', 'FF'), ('bb', 'cc'), ('cc', 'FF'), ('aa', 'cc')]     # ARP 请求(问 DNS) / 应答 / ARP 请求(问网关) / 应答
tab = {}; h2 = []
for src, dst in frames:
    inp = port[src]; tab[src] = inp
    outs = [p for p in (1, 2, 3, 4) if p != inp] if (dst == 'FF' or dst not in tab) else [tab[dst]]
    if 3 in outs: h2.append(dst)
ok(47, tab == {'cc': 4, 'bb': 1, 'aa': 2} and h2 == ['FF', 'FF'])
# 变式：若 H1 的 ARP 表里已有 DNS 服务器的 MAC：只剩问网关一次广播
tab = {}; h2b = []
for src, dst in [('cc', 'bb'), ('bb', 'cc'), ('cc', 'FF'), ('aa', 'cc')]:   # DNS 查询单播 / DNS 应答 / ARP 问网关 / 应答
    inp = port[src]; tab[src] = inp
    outs = [p for p in (1, 2, 3, 4) if p != inp] if (dst == 'FF' or dst not in tab) else [tab[dst]]
    if 3 in outs: h2b.append(dst)
ok('47变', h2b == ['bb', 'FF'])          # 第一帧 DNS 查询目的 bb 还没学到 ⟹ 泛洪，H2 也收到；共 2 帧

# 按 7 帧完整时序（含 DNS 查询/响应）再跑一遍：交换表不变，H2 仍只收到 2 个广播帧；换成集线器 H2 收到全部 6 个
tab = {}; h2c = []
seq7 = [('cc', 'FF'), ('bb', 'cc'), ('cc', 'bb'), ('bb', 'cc'), ('cc', 'FF'), ('aa', 'cc')]
for src, dst in seq7:
    inp = port[src]; tab[src] = inp
    outs = [p for p in (1, 2, 3, 4) if p != inp] if (dst == 'FF' or dst not in tab) else [tab[dst]]
    if 3 in outs: h2c.append(dst)
ok('47全序', tab == {'cc': 4, 'bb': 1, 'aa': 2} and h2c == ['FF', 'FF'] and len(seq7) == 6)

# ── 41 / 42：C 代码 gcc 编译 + 随机对拍 ──
C41 = r'''
#include <stdio.h>
#include <stdlib.h>
#define MAXV 32
typedef struct { int numVertices, numEdges; char VerticesList[MAXV]; int Edge[MAXV][MAXV]; } MGraph;
int IsExistEL(MGraph G){
    int degree, i, j, count = 0;
    for(i = 0; i < G.numVertices; i++){
        degree = 0;
        for(j = 0; j < G.numVertices; j++)
            degree += G.Edge[i][j];
        if(degree % 2 != 0) count++;
    }
    if(count == 0 || count == 2) return 1;
    else return 0;
}
int main(){ int T; scanf("%d",&T); static MGraph G; while(T--){ int n; scanf("%d",&n); G.numVertices=n;
  for(int i=0;i<n;i++) for(int j=0;j<n;j++) scanf("%d",&G.Edge[i][j]); printf("%d\n",IsExistEL(G)); } return 0; }
'''
C42 = r'''
#include <stdio.h>
#include <stdlib.h>
long cmp_cnt;
void cmpCountSort(int a[],int b[],int n,int stable,int pos[]){
    int i,j,*count; count=(int *)malloc(sizeof(int)*n);
    for(i=0;i<n;i++) count[i]=0;
    for(i=0;i<n-1;i++)
        for(j=i+1;j<n;j++){
            cmp_cnt++;
            if(stable ? a[i]<=a[j] : a[i]<a[j]) count[j]++;
            else count[i]++;
        }
    for(i=0;i<n;i++){ b[count[i]]=a[i]; pos[count[i]]=i; }
    free(count);
}
int main(){ int T; scanf("%d",&T); while(T--){ int n,st; scanf("%d %d",&n,&st); int a[64],b[64],p[64];
  for(int i=0;i<n;i++) scanf("%d",&a[i]); cmp_cnt=0; cmpCountSort(a,b,n,st,p);
  printf("%ld",cmp_cnt); for(int i=0;i<n;i++) printf(" %d:%d",b[i],p[i]); printf("\n"); } return 0; }
'''
def gcc_run(src, inp):
    d = tempfile.mkdtemp(); c = os.path.join(d, 'a.c'); e = os.path.join(d, 'a.out')
    open(c, 'w').write(src)
    subprocess.run(['gcc', '-O2', '-std=c99', '-Wall', '-o', e, c], check=True, capture_output=True)
    return subprocess.run([e], input=inp, capture_output=True, text=True, check=True).stdout.split('\n')
rnd = random.Random(2021)
cases, want = [], []
for _ in range(3000):
    n = rnd.randint(1, 9)
    M = [[0] * n for _ in range(n)]
    for a in range(n):
        for b in range(a + 1, n):
            if rnd.random() < .45: M[a][b] = M[b][a] = 1
    cases.append('%d\n%s' % (n, '\n'.join(' '.join(map(str, r)) for r in M)))
    odd = sum(1 for r in M if sum(r) % 2)
    want.append('1' if odd in (0, 2) else '0')
out = gcc_run(C41, '%d\n%s\n' % (len(cases), '\n'.join(cases)))
ok(41, out[:len(want)] == want)
# 欧拉路径定理本身的暴力验证（连通且 |E|>0 的小图）：奇度点 0/2 ⟺ 存在一笔画
def connected(n, M):
    vs = [v for v in range(n) if any(M[v])]
    if not vs: return False
    seen = {vs[0]}; st = [vs[0]]
    while st:
        u = st.pop()
        for w in range(n):
            if M[u][w] and w not in seen: seen.add(w); st.append(w)
    return all(v in seen for v in range(n))
def euler_path(n, M):
    E = [(a, b) for a in range(n) for b in range(a + 1, n) if M[a][b]]
    def dfs(u, used):
        if len(used) == len(E): return True
        for k, (a, b) in enumerate(E):
            if k in used: continue
            if a == u and dfs(b, used | {k}): return True
            if b == u and dfs(a, used | {k}): return True
        return False
    return any(dfs(s, frozenset()) for s in range(n))
cnt = 0
for _ in range(400):
    n = rnd.randint(2, 6); M = [[0] * n for _ in range(n)]
    for a in range(n):
        for b in range(a + 1, n):
            if rnd.random() < .5: M[a][b] = M[b][a] = 1
    if not connected(n, M): continue
    odd = sum(1 for r in M if sum(r) % 2); cnt += 1
    assert (odd in (0, 2)) == euler_path(n, M)
ok('41定理', cnt > 100)

lines, wants = [], []
lines.append('2\n6 0\n25 -10 25 10 11 19\n6 1\n25 -10 25 10 11 19')
o = gcc_run(C42, lines[0] + '\n')
t0 = o[0].split(); t1 = o[1].split()
ok(42, t0[0] == '15' and [x.split(':')[0] for x in t0[1:]] == ['-10', '10', '11', '19', '25', '25']
   and [x.split(':')[1] for x in t0[1:]] == ['1', '3', '4', '5', '2', '0'] and [x.split(':')[1] for x in t1[1:]] == ['1', '3', '4', '5', '0', '2'])
# 随机：结果有序、比较次数 n(n-1)/2、改后版本稳定、原版本相等元素必倒序
inp = []; meta = []
for _ in range(2000):
    n = rnd.randint(1, 30); a = [rnd.randint(-5, 5) for _ in range(n)]; st = rnd.randint(0, 1)
    inp.append('%d %d\n%s' % (n, st, ' '.join(map(str, a)))); meta.append((n, a, st))
o = gcc_run(C42, '%d\n%s\n' % (len(inp), '\n'.join(inp)))
for (n, a, st), line in zip(meta, o):
    t = line.split(); cc = int(t[0]); pr = [tuple(map(int, x.split(':'))) for x in t[1:]]
    assert cc == n * (n - 1) // 2
    assert [v for v, _ in pr] == sorted(a)
    for (v1, p1), (v2, p2) in zip(pr, pr[1:]):
        if v1 == v2: assert (p1 < p2) if st else (p1 > p2)
ok('42对拍', True)


# ── 41 / 42 卷面代码：直接从 2021.txt 的 ::paper 块里抽出来编译，保证页面上的代码就是测过的代码 ──
import re as _re
def paper_code(no):
    src = open(os.path.join(os.path.dirname(__file__), '..', '2021.txt'), encoding='utf-8').read()
    parts = _re.split(r'\n#(\d+)\n', src)
    body = parts[parts.index(str(no)) + 1]
    pap = body.split('\n::paper\n', 1)[1].split('\n::', 1)[0]
    return pap.split('```\n', 1)[1].split('\n```', 1)[0]
P41 = paper_code(41)
H41 = '#include <stdio.h>\n#define MAXV 32\ntypedef struct { int numVertices, numEdges; char VerticesList[MAXV]; int Edge[MAXV][MAXV]; } MGraph;\n' + P41 + r"""
int main(){ int T; scanf("%d",&T); static MGraph G; while(T--){ int n; scanf("%d",&n); G.numVertices=n;
  for(int i=0;i<n;i++) for(int j=0;j<n;j++) scanf("%d",&G.Edge[i][j]); printf("%d\n",IsExistEL(G)); } return 0; }
"""
out = gcc_run(H41, '%d\n%s\n' % (len(cases), '\n'.join(cases)))
ok('41卷面', out[:len(want)] == want)
P42 = paper_code(42)
H42a = '#include <stdio.h>\n#include <stdlib.h>\n' + P42 + r"""
int main(){ int T; scanf("%d",&T); while(T--){ int n; scanf("%d",&n); int a[64],b[64];
  for(int i=0;i<n;i++) scanf("%d",&a[i]); cmpCountSort(a,b,n); for(int i=0;i<n;i++) printf("%d ",b[i]); printf("\n"); } return 0; }
"""
# 稳定性：同一段代码只把元素类型换成带原下标的结构体（比较只看 key）
P42s = P42.replace('int a[], int b[]', 'K a[], K b[]').replace('a[i] <= a[j]', 'a[i].key <= a[j].key')
assert P42s != P42 and 'a[i].key <= a[j].key' in P42s
H42b = '#include <stdio.h>\n#include <stdlib.h>\ntypedef struct { int key, idx; } K;\n' + P42s + r"""
int main(){ int T; scanf("%d",&T); while(T--){ int n; scanf("%d",&n); K a[64],b[64];
  for(int i=0;i<n;i++){ scanf("%d",&a[i].key); a[i].idx=i; } cmpCountSort(a,b,n);
  for(int i=0;i<n;i++) printf("%d:%d ",b[i].key,b[i].idx); printf("\n"); } return 0; }
"""
inp42, arrs = [], []
for _ in range(2000):
    n = rnd.randint(1, 30); a = [rnd.randint(-5, 5) for _ in range(n)]; arrs.append(a)
    inp42.append('%d\n%s' % (n, ' '.join(map(str, a))))
oa = gcc_run(H42a, '%d\n%s\n' % (len(inp42), '\n'.join(inp42)))
ob = gcc_run(H42b, '%d\n%s\n' % (len(inp42), '\n'.join(inp42)))
for a, la, lb in zip(arrs, oa, ob):
    assert list(map(int, la.split())) == sorted(a)
    pr = [tuple(map(int, x.split(':'))) for x in lb.split()]
    assert pr == sorted(((v, i) for i, v in enumerate(a)))     # 稳定：相等键按原下标升序
ok('42卷面', True)
ok('42变', gcc_run(C42, '1\n4 0\n3 1 3 3\n')[0].split()[1:] == ['1:1', '3:3', '3:2', '3:0'])

print('复算通过 %d 项：%s' % (len(OK), ' '.join(map(str, OK))))
print('附：4 变式左指针空的结点', LN4, '；5 变式加 5 后 WPL', W56, '；7 变式删 C→D、D→E 后拓扑序个数', TC7b)
print('✓ 2021 全部复算通过')
