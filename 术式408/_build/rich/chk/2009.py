#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2009 408 套卷精解 · 独立复算。每题一个函数，assert 失败即报错；最后打印汇总。
跑法：python3 _build/rich/chk/2009.py   （第 42 题需要 gcc：从 2009.txt 的卷面里抽出三段代码，套上 2009_q42.c 的测试主程序编译对拍）"""
import heapq, ipaddress, itertools, math, os, random, re, subprocess, tempfile
from collections import deque
HERE = os.path.dirname(os.path.abspath(__file__))
FIG = os.path.join(HERE, '..', '..', '..', '..', '练习系统', '图')
OK = []
def ok(n, msg): OK.append(n); print('✓ %2d  %s' % (n, msg))

# ───────── 数据结构 ─────────
def stack_depth(push, out):
    """push 依次入栈，按出栈序列 out 模拟，返回栈的最大深度；不可行返回 None"""
    st, i, mx = [], 0, 0
    for c in out:
        while (not st or st[-1] != c) and i < len(push):
            st.append(push[i]); i += 1; mx = max(mx, len(st))
        if not st or st[-1] != c: return None
        st.pop()
    return mx

def q2():
    assert stack_depth('abcdefg', 'bdcfeag') == 3
    # 原解析说「a,c,e 同时在栈中」：c 在 e 入栈前已出栈
    st, i, snaps = [], 0, []
    for c in 'bdcfeag':
        while not st or st[-1] != c: st.append('abcdefg'[i]); i += 1; snaps.append(''.join(st))
        st.pop()
    assert 'acd' in snaps and 'aef' in snaps and not any(set('ace') <= set(x) for x in snaps)
    assert stack_depth('abcdefg', 'cbedgfa') == 3 and stack_depth('abcdefg', 'gfedcba') == 7
    ok(2, '出队序列＝出栈序列 bdcfeag，最大深度 3（同时在栈：acd、aef，从未有 a,c,e 同在）；变式 3、7')

T3 = {1: (2, 3), 2: (4, 5), 3: (None, None), 4: (None, None), 5: (6, 7), 6: (None, None), 7: (None, None)}
def trav(x, order):
    if x is None: return []
    l, r = T3[x]; part = {'N': [x], 'L': trav(l, order), 'R': trav(r, order)}
    return sum((part[c] for c in order), [])

def q3():
    got = {o: ''.join(map(str, trav(1, o))) for o in map(''.join, itertools.permutations('NLR'))}
    assert [o for o, v in got.items() if v == '3175624'] == ['RNL']
    assert got['RNL'] == got['LNR'][::-1] and got['NRL'] == '1325764' == got['LRN'][::-1]
    ok(3, '六种次序逐个遍历题图的树，只有 RNL 得 3175624（＝中序逆序）；NRL＝1325764')

def svg_tree(path):
    s = open(path, encoding='utf-8').read()
    cs = [(float(a), float(b)) for a, b in re.findall(r'<circle[^>]*cx="([\d.]+)"[^>]*cy="([\d.]+)"', s)]
    ls = [tuple(map(float, m)) for m in re.findall(r'<line[^>]*x1="([\d.]+)"[^>]*y1="([\d.]+)"[^>]*x2="([\d.]+)"[^>]*y2="([\d.]+)"', s)]
    ch = {c: [] for c in cs}
    for x1, y1, x2, y2 in ls:
        a, b = ((x1, y1), (x2, y2)) if y1 < y2 else ((x2, y2), (x1, y1))
        ch[a].append(b)
    root = min(cs, key=lambda c: c[1])
    def h(c): return 0 if c is None else 1 + max(h(l) for l in kids(c))
    def kids(c):
        L = [k for k in ch[c] if k[0] < c[0]]; R = [k for k in ch[c] if k[0] > c[0]]
        return [L[0] if L else None, R[0] if R else None]
    def worst(c):
        if c is None: return 0
        l, r = kids(c)
        return max(abs(h(l) - h(r)), worst(l), worst(r))
    return worst(root), len(cs)

def q4():
    res = {k: svg_tree(os.path.join(FIG, 'ch7', '7.3-23_%s.svg' % k)) for k in 'ABCD'}
    assert [k for k, (w, n) in res.items() if w <= 1] == ['B'], res
    assert {k: w for k, (w, n) in res.items()} == {'A': 2, 'B': 1, 'C': 2, 'D': 3}
    N = [0, 1, 2]
    for _ in range(2): N.append(N[-1] + N[-2] + 1)
    assert N[4] == 7
    ok(4, '从四个选项 SVG 读出树形算最大平衡因子：A 2、B 1、C 2、D 3 ⟹ 只有 B 平衡；高 4 的 AVL 最少 7 个结点')

def leaves_at(n, lv):
    return sum(1 for i in range(1, n + 1) if 2 * i > n and i.bit_length() == lv)

def q5():
    ns = [n for n in range(1, 300) if leaves_at(n, 6) == 8]
    assert (min(ns), max(ns)) == (39, 111)
    assert max(n for n in range(1, 300) if leaves_at(n, 5) == 6) == 51
    assert math.ceil(111 / 2) == 56 == sum(1 for i in range(1, 112) if 2 * i > 111)
    ok(5, '枚举 n＝1..299 的完全二叉树：第 6 层恰 8 个叶子的 n 最少 39、最多 111；变式 51、56 片叶子')

def q6():
    rnd = random.Random(6); seen = set()
    for _ in range(3000):
        n = rnd.randint(2, 9)
        par = {0: None}
        for v in range(1, n): par[v] = rnd.choice([None] + list(range(v)))      # None：森林里新的一棵树的根
        kids = {v: [c for c in range(n) if par[c] == v] for v in range(n)}
        roots = [c for c in range(n) if par[c] is None]
        bpar = {}                                                                 # 孩子兄弟表示：左＝第一个孩子，右＝下一个兄弟
        for v in range(n):
            if kids[v]: bpar[kids[v][0]] = v
            for a, b in zip(kids[v], kids[v][1:]): bpar[b] = a
        for a, b in zip(roots, roots[1:]): bpar[b] = a                           # 各棵树的根互为兄弟
        P = par.get
        sib = lambda a, b: a != b and P(a) == P(b)
        for v in range(n):
            if v in bpar and bpar[v] in bpar:
                u = bpar[bpar[v]]
                if P(v) is not None and P(P(v)) == u: seen.add('祖孙')
                elif P(v) == u: seen.add('父子')
                elif P(v) is not None and sib(P(v), u): seen.add('叔侄')
                elif sib(u, v): seen.add('兄弟')
                else: seen.add('其他')
                if P(u) is not None and P(v) is not None and sib(P(u), P(v)): seen.add('堂兄弟')
    assert seen == {'祖孙', '父子', '叔侄', '兄弟'}, seen
    ok(6, '随机 3000 个森林转二叉树，检查所有「祖父」对：只出现祖孙/父子/叔侄/兄弟四种，从未出现堂兄弟 ⟹ Ⅰ、Ⅱ，B')

def q7():
    bad2 = bad3 = 0
    for n in range(2, 6):
        E = list(itertools.combinations(range(n), 2))
        for m in range(len(E) + 1):
            for es in itertools.combinations(E, m):
                adj = {i: set() for i in range(n)}
                for a, b in es: adj[a].add(b); adj[b].add(a)
                seen, st = {0}, [0]
                while st:
                    for y in adj[st.pop()] - seen: seen.add(y); st.append(y)
                if len(seen) < n: continue
                assert sum(len(v) for v in adj.values()) % 2 == 0
                if not m > n - 1: bad2 += 1
                if not any(len(v) == 1 for v in adj.values()): bad3 += 1
    assert bad2 and bad3
    ok(7, '穷举 2～5 个顶点的全部连通图：度和恒为偶；Ⅱ 有 %d 个反例（树）、Ⅲ 有 %d 个反例（如环）⟹ A' % (bad2, bad3))

def passes(a, kind, k):
    a = list(a); n = len(a)
    if kind == 'ins':
        for i in range(1, k + 1):
            x, j = a[i], i - 1
            while j >= 0 and a[j] > x: a[j + 1] = a[j]; j -= 1
            a[j + 1] = x
    elif kind in ('bub_max', 'bub_min'):
        for p in range(k):
            if kind == 'bub_max':
                for j in range(n - 1 - p):
                    if a[j] > a[j + 1]: a[j], a[j + 1] = a[j + 1], a[j]
            else:
                for j in range(n - 1, p, -1):
                    if a[j - 1] > a[j]: a[j - 1], a[j] = a[j], a[j - 1]
    elif kind in ('sel_min', 'sel_max'):
        for p in range(k):
            if kind == 'sel_min':
                m = min(range(p, n), key=lambda i: a[i]); a[p], a[m] = a[m], a[p]
            else:
                e = n - 1 - p; m = max(range(0, e + 1), key=lambda i: a[i]); a[e], a[m] = a[m], a[e]
    elif kind == 'merge':
        w = 1
        for _ in range(k):
            a = sum((sorted(a[i:i + 2 * w]) for i in range(0, n, 2 * w)), []); w *= 2
    return a

def q9():
    S = [11, 12, 13, 7, 8, 9, 23, 4, 5]
    reach = {kd: False for kd in ('ins', 'bub_max', 'bub_min', 'sel_min', 'sel_max', 'merge')}
    reach3 = dict(reach)
    for p in itertools.permutations(S):
        for kd in reach:
            if not reach[kd] and passes(p, kd, 2) == S: reach[kd] = True
            if not reach3[kd] and passes(p, kd, 3) == S: reach3[kd] = True
    assert reach == {'ins': True, 'bub_max': False, 'bub_min': False, 'sel_min': False, 'sel_max': False, 'merge': False}, reach
    assert not any(reach3.values()), reach3
    ok(9, '穷举 9! 个初始排列各跑 2 趟：只有直接插入能得到该序列（冒泡、选择两个方向、2 路归并都不能）⟹ B；改成第 3 趟则全不可能')

def heap_ins(h, x):
    h = h + [x]; i = len(h); c = 0
    while i > 1:
        c += 1
        if h[i - 1] < h[i // 2 - 1]: h[i - 1], h[i // 2 - 1] = h[i // 2 - 1], h[i - 1]; i //= 2
        else: break
    return h, c

def q10():
    H = [5, 8, 12, 19, 28, 20, 15, 22]
    r, c = heap_ins(H, 3); assert r == [3, 5, 12, 8, 28, 20, 15, 22, 19] and c == 3
    r2, c2 = heap_ins(H, 10); assert r2 == [5, 8, 12, 10, 28, 20, 15, 22, 19] and c2 == 2
    h = [H[-1]] + H[1:-1]; i = 0
    while 2 * i + 1 < len(h):
        j = min([x for x in (2 * i + 1, 2 * i + 2) if x < len(h)], key=lambda x: h[x])
        if h[j] < h[i]: h[i], h[j] = h[j], h[i]; i = j
        else: break
    assert h == [8, 19, 12, 22, 28, 20, 15]
    ok(10, '小根堆插入 3：比较 3 次 ⟹ 3,5,12,8,28,20,15,22,19（A）；变式删堆顶、插 10（2 次）')

# ───────── 组成原理 ─────────
def q12():
    x, y = 127, -9
    assert x & 0xFFFFFFFF == 0x7F and y & 0xFFFF == 0xFFF7 and (-7) & 0xFFFF == 0xFFF9
    ye = y & 0xFFFFFFFF; assert ye == 0xFFFFFFF7
    assert (x + ye) & 0xFFFFFFFF == 0x76
    assert (0x7F + 0xFFF7) == 0x10076 and (-9) % 2 ** 32 == 4294967287
    ok(12, 'y＝FFF7H，符号扩展 FFFFFFF7H，z＝00000076H（D）；FFF9H 是 −7；变式 00010076H、4294967287')

def fadd(ex, mx, ey, my, eb=5, sub=False):
    """阶码 eb 位、尾数 7 位，均含 2 位符号的补码浮点。尾数用 ×32 的整数表示（5 位数值）。返回 (阶码, 尾数×32, 溢出?)"""
    if ex < ey: ex, mx, ey, my = ey, my, ex, mx
    my = my >> (ex - ey) if my >= 0 else -((-my) >> (ex - ey))
    m = mx - my if sub else mx + my; e = ex
    if m >= 32 or m < -32: m = m >> 1 if m >= 0 else -((-m) >> 1); e += 1      # 右规
    while m != 0 and -16 <= m < 16 and not (m == -16): m <<= 1; e -= 1            # 左规
    hi = 2 ** (eb - 2)
    return e, m, not (-hi <= e < hi)

def q13():
    e, m, of = fadd(7, 29, 5, 20); assert (e, m, of) == (8, 17, True)          # 29/32、5/8＝20/32
    mx = 29 + (20 >> 2); assert mx == 34 and mx >= 32                            # 尾数和 34/32 ＞ 1 要右规
    assert fadd(7, 29, 5, 4)[:3] == (7, 30, False)                                # Y＝2^5×1/8
    assert fadd(7, 29, 5, 20, eb=6) == (8, 17, False) and 2 ** 8 * 17 / 32 == 136
    assert fadd(7, 29, 5, 20, sub=True) == (7, 24, False) and 2 ** 7 * 24 / 32 == 96
    assert 2 ** 7 * 29 / 32 + 2 ** 5 * 5 / 8 == 136 >= 128
    ok(13, '对阶右移 2 位，尾数 34/32 右规，阶码 8 超出 −8～7 ⟹ 溢出（D）；变式不溢出 00111 0011110、阶码 6 位得 136、X−Y＝96')

def q14():
    blk = 129 // 32; assert blk == 4 and blk % 8 == 4 and (129 >> 5) & 7 == 4
    assert blk % 16 == 4 and (1000 // 32) % 8 == 7
    ok(14, '块号 4，8 组 ⟹ 组 4（C）；直接映射行 4；1000 号单元组 7')

def q15():
    assert (4 * 8) // (2 * 8) == 2 and (60 * 8) // (4 * 4) == 30
    assert math.ceil(60 / 8) == 8 and hex(4 * 1024) == '0x1000'
    ok(15, 'ROM 2 片、RAM 30 片（D）；8K×8 要 8 片；RAM 区 1000H～FFFFH')

def q16():
    assert 0x2000 + 2 + 0x06 == 0x2008 and 0x2000 + 1 + 6 == 0x2007
    d = 0xF8 - 256; assert 0x2002 + d == 0x1FFA
    ok(16, '取完 PC＝2002H，＋06H＝2008H（C）；按字编址 2007H；位移 F8H 得 1FFAH')

def q18():
    T = max(90, 80, 70, 60); assert T == 90 and (4 + 100 - 1) * T == 9270
    ok(18, '时钟周期取最长段 90ns（A）；100 条指令 9270ns')

def q20():
    bw = 4 / (2 * (1 / 10e6)); assert abs(bw - 20e6) < 1e-6
    assert 4 * 2 * 10e6 == 80e6 and 8 * 10e6 / 2 == 40e6
    ok(20, '4B ÷ 0.2μs＝20MB/s（B）；DDR 80MB/s；64 位 40MB/s')

def q21():
    h = (1000 - 50) / 1000; assert h == 0.95
    assert abs(5 + 0.05 * 50 - 7.5) < 1e-9 and abs(0.95 * 5 + 0.05 * 50 - 7.25) < 1e-9
    ok(21, '命中率 95%（D）；两种平均访问时间 7.5ns、7.25ns')

# ───────── 操作系统 ─────────
def deadlock_possible(m, n, k):
    """n 个进程各最多要 k 个、共 m 个资源：是否存在所有人都卡住的状态（各持 <k、剩余满足不了任何人）"""
    for hold in itertools.product(range(k), repeat=n):
        free = m - sum(hold)
        if free >= 0 and all(free < k - h for h in hold): return True
    return False

def q25():
    Ks = [K for K in range(1, 8) if deadlock_possible(8, K, 3)]
    assert min(Ks) == 4 and not deadlock_possible(8, 3, 3)
    assert min(m for m in range(1, 30) if not deadlock_possible(m, 5, 3)) == 11
    assert max(k for k in range(1, 6) if not deadlock_possible(8, 4, k)) == 2
    ok(25, '枚举所有持有状态：8 台打印机、每人最多 3 台，K＝4 起可能死锁，K＝3 不会（C）；变式 11 台、最多要 2 台')

def q27():
    assert 2 ** (32 - 8) == 2 ** 24 and 2 ** 8 == 256 and 2 ** 12 == 4096
    ok(27, '段内偏移 24 位 ⟹ 2²⁴B（C）；最多 256 段')

def scan(start, reqs, up=True, circ=False):
    hi = sorted(r for r in reqs if r >= start); lo = sorted(r for r in reqs if r < start)
    if not up: hi, lo = lo[::-1], hi[::-1]
    return hi + (lo if circ else lo[::-1])

def q29():
    R = [35, 45, 12, 68, 110, 180, 170, 195]
    seq = scan(105, R); assert seq == [110, 170, 180, 195, 68, 45, 35, 12]
    assert scan(105, R, circ=True) == [110, 170, 180, 195, 12, 35, 45, 68]
    pos, left, ss = 105, list(R), []
    while left:
        nx = min(left, key=lambda t: abs(t - pos)); ss.append(nx); left.remove(nx); pos = nx
    assert ss == [110, 68, 45, 35, 12, 170, 180, 195]
    d = 0; p = 105
    for t in seq: d += abs(t - p); p = t
    assert d == 273
    ok(29, 'SCAN 序列 110,170,180,195,68,45,35,12（A），移动 273 道；C-SCAN、SSTF 变式序列')

def q31():
    inode = {'F1': 1}; links = {'F1': 'F1'}; cnt = {'F1': 1}
    links['F2'] = 'F2'; cnt['F2'] = 1                              # 软链接：新文件，自己的 inode
    links['F3'] = 'F1'; cnt['F1'] += 1                             # 硬链接：共用 F1 的 inode
    del links['F1']; cnt['F1'] -= 1                                # 删除 F1 这个目录项
    c = lambda f: cnt[links[f]]
    assert (c('F2'), c('F3')) == (1, 1)
    ok(31, '模拟 inode 计数：软链接自带计数 1，硬链接使共用 inode 变 2，删 F1 后 1 ⟹ (1,1)，B')

# ───────── 计算机网络 ─────────
def q34():
    V = 4 * 4; C = 2 * 3000 * math.log2(V); assert C == 24000
    assert abs(3000 * math.log2(1 + 10 ** 3) - 29902) < 5 and 2 ** (48000 / 6000) == 256
    ok(34, '16 种状态、4 位/码元，2×3k×4＝24kb/s（B）；30dB 香农约 29.9kb/s；48kb/s 需 256 种')

def gbn_resend(sent, acks):
    top = max(acks) if acks else -1
    return [f for f in sent if f > top]

def q35():
    assert len(gbn_resend(range(8), [0, 2, 3])) == 4
    assert len(gbn_resend(range(8), [0, 2])) == 5
    sr = [f for f in range(8) if f not in (0, 2, 3)]; assert len(sr) == 5
    ok(35, 'GBN 累积确认到 3 ⟹ 重发 4～7 共 4 帧（C）；只确认到 2 时 5 帧；SR 重发 1、4～7 共 5 帧')

def q37():
    dt = 800 / 1e9; d = dt / 2 * 2e8
    assert abs(dt - 0.8e-6) < 1e-15 and abs(d - 80) < 1e-9
    assert abs(1000 / 1e9 / 2 * 2e8 - 100) < 1e-9
    ok(37, '帧短 800 位 ⟹ 往返少 0.8μs ⟹ 单程距离少 80m（D）；1000 位最短帧对应 100m')

def q38():
    s1, l1, l2 = 200, 300, 500
    assert s1 + l1 == 500 and s1 + l1 + l2 == 1000
    ok(38, '两段占 200～499、500～999 ⟹ 确认号 1000（D）')

def cwnd_after(cw, ss, rtts, rwnd=None):
    out = []
    for _ in range(rtts):
        cw = min(cw * 2, ss) if cw < ss else cw + 1
        out.append(cw)
    return out

def q39():
    ss, cw = 16 // 2, 1
    assert cwnd_after(cw, ss, 4) == [2, 4, 8, 9]
    assert cwnd_after(8, 8, 4)[-1] == 12
    seq = cwnd_after(1, 8, 20); assert seq.index(16) + 1 == 11
    assert min(8, 6) == 6
    ok(39, '超时后 ssthresh＝8：2、4、8、9 ⟹ 9KB（C）；快恢复 12KB；回到 16KB 要 11 个 RTT')

def q41():
    G = {'A': {'B': 1, 'D': 2}, 'B': {'A': 1, 'C': 10}, 'D': {'A': 2, 'C': 3}, 'C': {'B': 10, 'D': 3}}
    def greedy(G, s, t):
        path, u, L = [s], s, 0
        while u != t:
            cand = [(w, v) for v, w in G[u].items() if v not in path]
            if not cand: return path, None
            w, v = min(cand); path.append(v); L += w; u = v
        return path, L
    def dijk(G, s, t):
        dist = {s: 0}; pq = [(0, s)]; done = set()
        while pq:
            d, u = heapq.heappop(pq)
            if u in done: continue
            done.add(u)
            for v, w in G[u].items():
                if d + w < dist.get(v, 1e18): dist[v] = d + w; heapq.heappush(pq, (d + w, v))
        return dist[t]
    assert greedy(G, 'A', 'C') == (['A', 'B', 'C'], 11) and dijk(G, 'A', 'C') == 5
    G2 = {'A': {'B': 1, 'C': 5}, 'B': {'A': 1, 'D': 1}, 'D': {'B': 1}, 'C': {'A': 5}}
    assert greedy(G2, 'A', 'C') == (['A', 'B', 'D'], None) and dijk(G2, 'A', 'C') == 5
    # 负权：Dijkstra 先定下 B＝2，真实 A→C→B＝1
    D = {'A': {'B': 2, 'C': 3}, 'C': {'B': -2}, 'B': {}}
    dist, done = {'A': 0}, []
    while len(done) < 3:
        u = min((v for v in dist if v not in done), key=dist.get); done.append(u)
        for v, w in D[u].items():
            if v not in done and dist[u] + w < dist.get(v, 1e18): dist[v] = dist[u] + w
    assert done == ['A', 'B', 'C'] and dist['B'] == 2 and 3 - 2 == 1
    # 随机图上统计题中方法的失败率（仅作参考）
    rnd = random.Random(41); fail = tot = 0
    for _ in range(3000):
        n = 6; E = {i: {} for i in range(n)}
        for a, b in itertools.combinations(range(n), 2):
            if rnd.random() < 0.5:
                w = rnd.randint(1, 9); E[a][b] = E[b][a] = w
        seen, st = {0}, [0]
        while st:
            for y in E[st.pop()]:
                if y not in seen: seen.add(y); st.append(y)
        if n - 1 not in seen: continue
        tot += 1; p, L = greedy(E, 0, n - 1)
        if L is None or L != dijk(E, 0, n - 1): fail += 1
    assert fail > 0
    ok(41, '反例：方法走 A→B→C＝11，Dijkstra＝5；死胡同例子卡在 D；负权例子 Dijkstra 错；6 顶点随机连通图上方法失败 %d/%d' % (fail, tot))

def q42():
    src = open(os.path.join(HERE, '..', '2009.txt'), encoding='utf-8').read()
    sec = re.search(r'\n#42\n(.*?)\n#43\n', src, re.S).group(1)
    paper = sec.split('::paper', 1)[1].split('::note', 1)[0]
    blocks = re.findall(r'```\n(.*?)\n```', paper, re.S)
    assert len(blocks) == 3
    with tempfile.TemporaryDirectory() as td:
        open(os.path.join(td, 'q42_paper.c'), 'w').write('\n'.join(blocks) + '\n')
        exe = os.path.join(td, 'q42')
        r = subprocess.run(['gcc', '-O2', '-Wall', '-Wno-unused-value', '-I', td, '-o', exe, os.path.join(HERE, '2009_q42.c')], capture_output=True, text=True)
        assert r.returncode == 0, r.stderr
        out = subprocess.run([exe], capture_output=True, text=True, timeout=120).stdout.strip()
    assert out.startswith('OK'), out
    ok(42, '从卷面抽出三段代码 gcc 编译；' + out)

def q43():
    per = (18 + 2) * 5; times = 0.5e6 / 4; r1 = times * per / 500e6
    assert per == 100 and times == 125000 and abs(r1 - 0.025) < 1e-12
    r2 = (5e6 / 5000) * 500 / 500e6; assert abs(r2 - 0.001) < 1e-12
    assert abs(0.5e6 / 4 * 200 / 500e6 - 0.05) < 1e-12 and abs(5e6 / 4 * 100 / 500e6 - 0.25) < 1e-12
    assert abs(5e6 / 5000 * 500 * 5 / 500e6 - 0.005) < 1e-12                      # 第 2 问误乘 CPI 的错误结果
    ok(43, '中断 125000 次 × 100 周期 ⟹ 2.5%；DMA 1000 次 × 500 周期 ⟹ 0.1%；误乘 CPI 得 0.5%；变式 5%、25%')

def q44():
    """寄存器传送级模拟：每拍列出（内总线发送方, 动作），检查内总线一拍至多一个发送方，并算出结果"""
    def run(prog):
        r = {'R0': 5, 'R1': 100, 'A': None, 'AC': None, 'MAR': None, 'MDR': None}; M = {100: 7}
        for outs, acts in prog:
            bus = [o for o in outs if o in ('R0', 'R1', 'MDR', 'AC', 'PC')]
            assert len(bus) <= 1, outs
            v = r[bus[0]] if bus else None; nr = dict(r)
            for a in acts:
                if a == 'MARin': nr['MAR'] = v
                elif a == 'MemR': nr['MDR'] = M[r['MAR']]                          # 走 DB，与内总线无关
                elif a == 'Ain': nr['A'] = v
                elif a == 'ADD': nr['AC'] = r['A'] + v
                elif a == 'MDRin': nr['MDR'] = v
                elif a == 'MemW': M[r['MAR']] = r['MDR']
            r = nr
        return M[100], len(prog)
    six = [(['R1'], ['MARin']), ([], ['MemR']), (['MDR'], ['Ain']), (['R0'], ['ADD']), (['AC'], ['MDRin']), ([], ['MemW'])]
    five = [(['R1'], ['MARin']), (['R0'], ['MemR', 'Ain']), (['MDR'], ['ADD']), (['AC'], ['MDRin']), ([], ['MemW'])]
    assert run(six) == (12, 6) and run(five) == (12, 5)
    try: run([(['R1'], ['MARin']), ([], ['MemR']), (['MDR', 'R0'], ['ADD'])]); raise SystemExit('应当报冲突')
    except AssertionError: pass
    merged = [(['R1'], ['MARin']), ([], ['MemR']), (['MDR'], ['Ain']), (['R0'], ['ADD']), (['AC'], ['MDRin', 'MemW'])]
    assert run(merged)[0] != 12                                                     # C9、C10 合并：写进主存的是旧 MDR
    ok(44, '寄存器传送模拟：6 拍与 5 拍两种答案都使 M[(R1)]＝5＋7＝12，内总线每拍至多一个发送方；一拍两个 out 报冲突；C9、C10 合并写错值')

def q45():
    """状态空间搜索：N＝2，P1 依次产 奇、偶、奇、偶；P2/P3 各取两次。原子步＝一条 P/V 或一次缓冲区操作"""
    N = 2; items = [1, 2, 3, 4]
    P1 = [('P', 'empty'), ('P', 'mutex'), ('put',), ('V', 'mutex'), ('Vsel',)]
    P2 = [('P', 'odd'), ('P', 'mutex'), ('get', 1), ('V', 'mutex'), ('V', 'empty')]
    P3 = [('P', 'even'), ('P', 'mutex'), ('get', 0), ('V', 'mutex'), ('V', 'empty')]
    def search(single_full):
        start = (0, 0, 0, 0, 0, 0, (('mutex', 1), ('empty', N), ('odd', 0), ('even', 0), ('full', 0)), (), 0, 0)
        seen, st, bad, dead, ends = {start}, [start], 0, 0, 0
        prog = {0: P1, 1: P2, 2: P3}
        if single_full:
            prog = {0: [x if x != ('Vsel',) else ('V', 'full') for x in P1],
                    1: [('P', 'full') if x == ('P', 'odd') else x for x in P2],
                    2: [('P', 'full') if x == ('P', 'even') else x for x in P3]}
        while st:
            s = st.pop(); pc = list(s[:3]); it = list(s[3:6]); sem = dict(s[6]); buf = list(s[7]); got = [s[8], s[9]]
            rounds = [len(items), 2, 2]; moved = False
            for i in range(3):
                done = it[i] >= rounds[i]
                if done: continue
                op = prog[i][pc[i]]; npc, nit, nsem, nbuf, ngot = list(pc), list(it), dict(sem), list(buf), list(got)
                if op[0] == 'P':
                    if sem[op[1]] == 0: continue
                    nsem[op[1]] -= 1
                elif op[0] == 'V': nsem[op[1]] += 1
                elif op[0] == 'Vsel': nsem['odd' if items[it[0]] % 2 else 'even'] += 1
                elif op[0] == 'put':
                    assert len(nbuf) < N; nbuf.append(items[it[0]])
                elif op[0] == 'get':
                    want = [x for x in nbuf if x % 2 == op[1]]
                    if not want: bad += 1; continue
                    nbuf.remove(want[0]); ngot[i - 1] += 1
                npc[i] += 1
                if npc[i] == len(prog[i]): npc[i] = 0; nit[i] += 1
                t = (*npc, *nit, tuple(sorted(nsem.items())), tuple(sorted(nbuf)), *ngot)
                moved = True
                if t not in seen: seen.add(t); st.append(t)
            if not moved:
                if it == [len(items), 2, 2]: ends += 1
                else: dead += 1
        return len(seen), bad, dead, ends
    n, bad, dead, ends = search(False)
    assert bad == 0 and dead == 0 and ends >= 1
    n1, bad1, _, _ = search(True)
    assert bad1 > 0
    ok(45, '状态空间搜索（N＝2，P1 产奇偶奇偶）：%d 个状态，无死锁、P2/P3 从未取错种类；若只用一个 full，出现 %d 次「进了缓冲区却没有想要的数」' % (n, bad1))

def q46():
    pt = {0: 0x101, 1: None, 2: 0x254}
    TLB, MEM, PF = 10, 100, 10 ** 8
    tlb, resident, lru, times = set(), [0, 2], [0, 2], []
    phys = {}
    for va in (0x2362, 0x1565, 0x25A5):
        p, off = va >> 12, va & 0xFFF
        t = TLB
        if p in tlb: t += MEM
        else:
            t += MEM
            if pt[p] is None:
                victim = lru[0]; frame = pt[victim]; pt[victim] = None; resident.remove(victim); tlb.discard(victim)
                pt[p] = frame; resident.append(p); t += PF + TLB + MEM
            else: t += MEM
            tlb.add(p)
        lru = [x for x in lru if x != p] + [p]
        times.append(t); phys[va] = (pt[p] << 12) | off
    assert times == [210, 100000220, 110] and phys[0x1565] == 0x101565
    # FIFO 变式：页 0 比页 2 装入得晚 ⟹ 淘汰页 2
    assert (0x254 << 12 | 0x565) == 0x254565 and 10 + 100 + PF + 10 + 100 + 100 == 100000320
    ok(46, '三次访问 210、100000220、110ns；LRU 淘汰页 0，1565H→101565H；FIFO 变式 254565H、不更新 TLB 时 100000320ns')

def q47():
    net = ipaddress.ip_network('202.118.1.0/24')
    h = next(h for h in range(1, 9) if 2 ** h - 2 >= 120); assert h == 7
    subs = list(net.subnets(new_prefix=32 - h))
    assert [str(s) for s in subs] == ['202.118.1.0/25', '202.118.1.128/25'] and str(subs[0].netmask) == '255.255.255.128'
    assert all(s.num_addresses - 2 >= 120 for s in subs)
    agg = list(ipaddress.collapse_addresses(subs)); assert [str(a) for a in agg] == ['202.118.1.0/24']
    R1 = [('202.118.1.0/25', '直接', 'E1'), ('202.118.1.128/25', '直接', 'E2'), ('202.118.3.2/32', '202.118.2.2', 'L0'), ('0.0.0.0/0', '202.118.2.2', 'L0')]
    def look(tab, ip):
        ip = ipaddress.ip_address(ip)
        return max((r for r in tab if ip in ipaddress.ip_network(r[0])), key=lambda r: ipaddress.ip_network(r[0]).prefixlen)
    assert look(R1, '202.118.1.200')[2] == 'E2' and look(R1, '202.118.3.2')[0] == '202.118.3.2/32' and look(R1, '130.11.120.5')[0] == '0.0.0.0/0'
    R2 = [('202.118.1.0/24', '202.118.2.1', 'L0')]; assert look(R2, '202.118.1.130')[1] == '202.118.2.1'
    assert [str(s) for s in net.subnets(new_prefix=26)][:3] == ['202.118.1.0/26', '202.118.1.64/26', '202.118.1.128/26']
    assert 2 ** 6 - 2 < 120 <= 2 ** 7 - 2
    ok(47, '主机位 7 ⟹ 两个 /25；R1 四行表最长前缀匹配验证；两个 /25 聚合为 202.118.1.0/24，R2 下一跳 202.118.2.1；变式三个 /26')

def concept():
    L = (1, 8, 11, 17, 19, 22, 23, 24, 26, 28, 30, 32, 33, 36, 40)
    OK.extend(L)
    print('·  概念题 ' + ' '.join(map(str, L)) + '：无可计算内容，答案由构建时与卷面答案核对')
    return len(L)

if __name__ == '__main__':
    for f in (q2, q3, q4, q5, q6, q7, q9, q10, q12, q13, q14, q15, q16, q18, q20, q21, q25, q27, q29, q31,
              q34, q35, q37, q38, q39, q41, q42, q43, q44, q45, q46, q47): f()
    k = concept()
    miss = sorted(set(range(1, 48)) - set(OK))
    assert not miss, miss
    print('\n2009：47 题全部通过（其中程序复算 %d 题）' % (47 - k))
