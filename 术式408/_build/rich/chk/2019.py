#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2019 408 精解复算：每题独立模拟 / 穷举 / 对拍。跑：python3 _build/rich/chk/2019.py"""
import itertools, math, random, subprocess, os, tempfile, heapq, sys
R = random.Random(2019)
OK = []
def ok(no, cond, msg=''):
    if not cond:
        print('✗ 第 %s 题：%s' % (no, msg)); sys.exit(1)
    OK.append(no)

# ───────── 1 循环复杂度
def loop1(n):
    x = 0; k = 0
    while n >= (x + 1) * (x + 1): x += 1; k += 1
    return k
ok(1, all(loop1(n) == math.isqrt(n) for n in range(0, 20000)), 'k=⌊√n⌋')

# ───────── 2 树后根 = 二叉树中序（随机树对拍）
def rand_tree(n):
    ch = {0: []}
    for v in range(1, n): ch[v] = []; ch[R.randrange(v)].append(v)
    return ch
def post(ch, v): return sum((post(ch, c) for c in ch[v]), []) + [v]
def pre(ch, v): return [v] + sum((pre(ch, c) for c in ch[v]), [])
def to_bin(ch):
    L, Rt = {}, {}
    for v, cs in ch.items():
        L[v] = cs[0] if cs else None
        for a, b in zip(cs, cs[1:]): Rt[a] = b
    return L, Rt
def bin_in(L, Rt, v): return [] if v is None else bin_in(L, Rt, L.get(v)) + [v] + bin_in(L, Rt, Rt.get(v))
def bin_pre(L, Rt, v): return [] if v is None else [v] + bin_pre(L, Rt, L.get(v)) + bin_pre(L, Rt, Rt.get(v))
def bin_post(L, Rt, v): return [] if v is None else bin_post(L, Rt, L.get(v)) + bin_post(L, Rt, Rt.get(v)) + [v]
for _ in range(3000):
    ch = rand_tree(R.randint(1, 12)); L, Rt = to_bin(ch)
    ok(2, post(ch, 0) == bin_in(L, Rt, 0) and pre(ch, 0) == bin_pre(L, Rt, 0), '对应关系')
# 变式：树 1(2,3,4) 的二叉树后序
ch = {1: [2, 3, 4], 2: [], 3: [], 4: []}; L, Rt = to_bin(ch)
ok(2, bin_post(L, Rt, 1) == [4, 3, 2, 1], '变式后序')

# ───────── 3 哈夫曼 2n-1
def huff_nodes(ws, k=2):
    h = list(ws); heapq.heapify(h); nodes = len(h)
    while len(h) > 1:
        s = sum(heapq.heappop(h) for _ in range(min(k, len(h)))); heapq.heappush(h, s); nodes += 1
    return nodes
ok(3, all(huff_nodes([R.random() for _ in range(n)]) == 2 * n - 1 for n in range(1, 80)))
ok(3, [n for n in (56, 57, 58, 60) if 2 * n - 1 == 115] == [58])

# ───────── 4 AVL 删除再插入
class N:
    __slots__ = ('k', 'l', 'r', 'h')
    def __init__(s, k): s.k, s.l, s.r, s.h = k, None, None, 1
def h(t): return t.h if t else 0
def upd(t): t.h = 1 + max(h(t.l), h(t.r)); return t
def rot_r(t): l = t.l; t.l = l.r; l.r = t; upd(t); return upd(l)
def rot_l(t): r = t.r; t.r = r.l; r.l = t; upd(t); return upd(r)
def bal(t):
    upd(t); b = h(t.l) - h(t.r)
    if b > 1:
        if h(t.l.l) < h(t.l.r): t.l = rot_l(t.l)
        return rot_r(t)
    if b < -1:
        if h(t.r.r) < h(t.r.l): t.r = rot_r(t.r)
        return rot_l(t)
    return t
def ins(t, k):
    if not t: return N(k)
    if k < t.k: t.l = ins(t.l, k)
    else: t.r = ins(t.r, k)
    return bal(t)
def dele(t, k, succ=True):
    if not t: return None
    if k < t.k: t.l = dele(t.l, k, succ)
    elif k > t.k: t.r = dele(t.r, k, succ)
    else:
        if not t.l or not t.r: return t.l or t.r
        if succ:
            m = t.r
            while m.l: m = m.l
            t.k = m.k; t.r = dele(t.r, m.k, succ)
        else:
            m = t.l
            while m.r: m = m.r
            t.k = m.k; t.l = dele(t.l, m.k, succ)
    return bal(t)
def sh(t): return None if not t else (t.k, sh(t.l), sh(t.r))
def build(seq):
    t = None
    for x in seq: t = ins(t, x)
    return t
def find(t, k):
    while t and t.k != k: t = t.l if k < t.k else t.r
    return t
cnt = {'leaf_diff': 0, 'leaf_same': 0, 'in_same': 0, 'in_diff': 0}
for _ in range(4000):
    seq = R.sample(range(1, 60), R.randint(3, 12)); t = build(seq); s1 = sh(t)
    v = R.choice(seq); nd = find(t, v); leaf = not nd.l and not nd.r
    t3 = ins(dele(build(seq), v), v); same = sh(t3) == s1
    cnt[('leaf_' if leaf else 'in_') + ('same' if same else 'diff')] += 1
ok(4, cnt['leaf_diff'] > 0 and cnt['in_same'] > 0 and cnt['in_diff'] > 0, cnt)
# 精解里用的最小例子：Ⅰ 反例
t = build([2, 1, 4, 3]); s1 = sh(t)                       # 2(1, 4(3,·))
t3 = ins(dele(build([2, 1, 4, 3]), 1), 1)                  # 删叶 1 → 失衡 → 旋转成 3(2,4)，再插 1
ok(4, s1 == (2, (1, None, None), (4, (3, None, None), None)) and sh(t3) == (3, (2, (1, None, None), None), (4, None, None)), sh(t3))
# Ⅱ 反例（最小）：2(1,3) 删非叶 2（后继 3 顶上）得 3(1,·)；插回 2 先成 1 的右孩子 → LR 失衡 → 双旋又回到 2(1,3)
t = build([2, 1, 3]); t3 = ins(dele(build([2, 1, 3]), 2), 2)
ok(4, sh(t3) == sh(t) == (2, (1, None, None), (3, None, None)), sh(t3))
# Ⅲ 反例：2(1,3(·,4)) 删非叶 3（只有右孩子 4，4 顶上），不失衡；插回 3 成 4 的左孩子
t = build([2, 1, 3, 4]); t3 = ins(dele(build([2, 1, 3, 4]), 3), 3)
ok(4, sh(t) == (2, (1, None, None), (3, None, (4, None, None))) and sh(t3) == (2, (1, None, None), (4, (3, None, None), None)), sh(t3))
# Ⅱ 反例：原解析给的例子
seq = [19, 58, 5, 18, 36, 20, 26, 29]; t = build(seq); s1 = sh(t)
ok(4, sh(ins(dele(build(seq), 26), 26)) == s1, 'Ⅱ 反例')
# 更小的 Ⅱ 反例：搜索
best = None
for n in range(3, 8):
    for seq in itertools.permutations(range(1, n + 1)):
        t = build(seq); s1 = sh(t)
        for v in seq:
            nd = find(t, v)
            if (nd.l or nd.r) and sh(ins(dele(build(seq), v), v)) == s1:
                best = (seq, v); break
        if best: break
    if best: break
print('  第 4 题 Ⅱ 的最小反例：插入序', best[0], '删', best[1], '树', sh(build(best[0])))

# ───────── 5 AOE
E = {'a': (1, 2, 3), 'b': (3, 2, 4), 'c': (1, 3, 8), 'd': (2, 4, 7), 'e': (2, 5, 6), 'f': (3, 5, 10), 'g': (4, 6, 6), 'h': (5, 6, 9)}
order = [1, 3, 2, 4, 5, 6]
ve = {1: 0}
for v in order[1:]: ve[v] = max(ve[u] + w for u, x, w in E.values() if x == v)
vl = {6: ve[6]}
for v in reversed(order[:-1]): vl[v] = min(vl[x] - w for u, x, w in E.values() if u == v)
e = {k: ve[u] for k, (u, x, w) in E.items()}; l = {k: vl[x] - w for k, (u, x, w) in E.items()}
ok(5, (e['d'], l['d']) == (12, 14) and ve[6] == 27, (e['d'], l['d']))
ok(5, [k for k in E if e[k] == l[k]] == ['b', 'c', 'e', 'f', 'h'])
ok(5, ve == {1: 0, 3: 8, 2: 12, 4: 19, 5: 18, 6: 27} and vl == {6: 27, 5: 18, 4: 21, 2: 12, 3: 8, 1: 0}, (ve, vl))
ok(5, e['a'] == 0 and l['a'] == 9 and l['g'] - e['g'] == 2)

# ───────── 6 DAG 顶点数（哈希共享）
def dag(expr):
    seen = {}
    def go(x):
        if isinstance(x, str): seen.setdefault(x, len(seen)); return x
        key = (x[0],) + tuple(go(c) for c in x[1:]); seen.setdefault(key, len(seen)); return key
    go(expr); return len(seen)
def treesize(x): return 1 if isinstance(x, str) else 1 + sum(treesize(c) for c in x[1:])
ex = ('*', ('+', 'x', 'y'), ('/', ('+', 'x', 'y'), 'x'))
ok(6, dag(ex) == 5 and treesize(ex) == 9)
ok(6, dag(('*', ('+', 'x', 'y'), ('+', 'x', 'z'))) == 6)                       # 变式：+ 不能合并
ok(6, dag(('*', ('+', 'x', 'y'), ('+', 'x', 'y'))) == 4)                       # 变式：(x+y)*(x+y)
ok(6, dag(('+', ('*', ('+', 'a', 'b'), 'c'), ('*', ('+', 'a', 'b'), 'c'))) == 6)

# ───────── 8 散列
HT = [None] * 11; probes = {}
for k in (87, 40, 30, 6, 11, 22, 98, 20):
    i = k % 7; c = 1
    while HT[i] is not None: i = (i + 1) % 11; c += 1
    HT[i] = k; probes[k] = c
ok(8, HT == [98, 22, 30, 87, 11, 40, 6, 20, None, None, None], HT)
def fail(s):
    c = 1
    while HT[s] is not None: s = (s + 1) % 11; c += 1
    return c
fails = [fail(s) for s in range(7)]
ok(8, fails == [9, 8, 7, 6, 5, 4, 3] and sum(fails) / 7 == 6)
ok(8, abs(sum(fails) / 8 - 5.25) < 1e-9 and abs((sum(fails) + fail(7)) / 7 - 44 / 7) < 1e-9 and fail(7) == 2)
ok(8, sum(probes.values()) == 9, probes)    # 成功 ASL = 9/8（变式）
ok(8, round(sum(fail(s) for s in range(11)) / 11, 2) == 4.27)

# ───────── 9 KMP 比较次数
def nxt(p):
    n = [-1] * len(p); j, k = 0, -1
    while j < len(p) - 1:
        if k == -1 or p[j] == p[k]: j += 1; k += 1; n[j] = k
        else: k = n[k]
    return n
def kmp_cnt(t, p, nx):
    i = j = c = 0
    while i < len(t) and j < len(p):
        if j == -1: i += 1; j = 0; continue
        c += 1
        if t[i] == p[j]: i += 1; j += 1
        else: j = nx[j]
    return c, (i - len(p) if j == len(p) else -1)
T, S = 'abaabaabcabaabc', 'abaabc'
ok(9, nxt(S) == [-1, 0, 0, 1, 1, 2])
ok(9, kmp_cnt(T, S, nxt(S)) == (10, 3), kmp_cnt(T, S, nxt(S)))
def brute(t, p):
    c = 0
    for s in range(len(t) - len(p) + 1):
        for j in range(len(p)):
            c += 1
            if t[s + j] != p[j]: break
        else: return c, s
ok(9, brute(T, S) == (15, 3), brute(T, S))      # 变式：朴素法 6+1+2+6=15 次
def nextval(p):
    n = nxt(p); v = n[:]
    for j in range(1, len(p)):
        if n[j] >= 0 and p[j] == p[n[j]]: v[j] = v[n[j]]
    return v
ok(9, nextval(S) == [-1, 0, -1, 1, 0, 2] and kmp_cnt(T, S, nextval(S))[0] == 10)

# ───────── 10 快排第二趟（穷举 8! 个初始排列）
def part(a, lo, hi):
    p = a[lo]; i, j = lo, hi
    while i < j:
        while i < j and a[j] >= p: j -= 1
        a[i] = a[j]
        while i < j and a[i] <= p: i += 1
        a[j] = a[i]
    a[i] = p; return i
def two_passes(a):
    a = list(a); segs = [(0, len(a) - 1)]
    for _ in range(2):
        ns = []
        for lo, hi in segs:
            if lo < hi:
                m = part(a, lo, hi); ns += [(lo, m - 1), (m + 1, hi)]
        segs = ns
    return tuple(a)
V = [2, 5, 12, 16, 28, 32, 60, 72]
reach = set(two_passes(p) for p in itertools.permutations(V))
opts10 = {'A': (5, 2, 16, 12, 28, 60, 32, 72), 'B': (2, 16, 5, 28, 12, 60, 32, 72), 'C': (2, 12, 16, 5, 28, 32, 72, 60), 'D': (5, 2, 12, 28, 16, 32, 72, 60)}
ok(10, [k for k, v in opts10.items() if v not in reach] == ['D'])
def rule(s):
    fin = [i for i in range(8) if s[i] == V[i] and all(s[j] < s[i] for j in range(i)) and all(s[j] > s[i] for j in range(i + 1, 8))]
    return len(fin) >= 3 or (len(fin) >= 2 and (0 in fin or 7 in fin))
ok(10, all(rule(s) for s in reach))
ok(10, [k for k, v in opts10.items() if not rule(v)] == ['D'])

# ───────── 11 虚段
def virt(n, k):
    u = (n - 1) % (k - 1); return 0 if u == 0 else k - 1 - u
ok(11, virt(120, 12) == 2 and (122 - 1) % 11 == 0 and (122 - 1) // 11 == 11)
ok(11, virt(30, 8) == 6 and virt(12, 4) == 1 and virt(6, 3) == 1 and virt(31, 5) == 2)
ok(11, all((n + virt(n, k) - 1) % (k - 1) == 0 for n in range(2, 300) for k in range(3, 15)))

# ───────── 13 等长转换
ok(13, (65535 if 65535 < 32768 else 65535 - 65536) == -1)
ok(13, (-32767 + 65536) == 32769 and ((-1) & 0xFFFFFFFF) == 4294967295)

# ───────── 15 基址寻址 + 大端
A = 0xFF12; Aext = A | 0xFFFF0000 if A & 0x8000 else A
EA = (0xF0000000 + Aext) & 0xFFFFFFFF
ok(15, EA == 0xEFFFFF12 and EA + 3 == 0xEFFFFF15 and A - 0x10000 == -0xEE)
ok(15, (0xF0000000 + A) == 0xF000FF12)

# ───────── 19 总线带宽
bw = 3 * 8 * 1333e6
ok(19, round(bw / 1e9, 1) == 32.0 and round(8 * 1333e6 / 1e9, 2) == 10.66)

# ───────── 21 中断占用率
r = (50e3 / 4) * 1000 / 1e9
ok(21, abs(r - 0.0125) < 1e-12)
ok(21, abs((50e3 / 4000) * 1000 / 1e9 - 0.0000125) < 1e-15)   # 变式：每次传 4KB（DMA 式）

# ───────── 27 二级反馈队列
def mlfq(jobs, q=10):
    t = 0; rem = dict(jobs); Q1 = list(jobs); Q2 = []; fin = {}
    while Q1 or Q2:
        if Q1:
            p = Q1.pop(0); run = min(q, rem[p]); t += run; rem[p] -= run
            if rem[p]: Q2.append(p)
            else: fin[p] = t
        else:
            p = min(Q2, key=lambda x: rem[x]); Q2.remove(p); t += rem[p]; rem[p] = 0; fin[p] = t
    return fin
fin = mlfq({'P1': 30, 'P2': 20})
wait = {'P1': fin['P1'] - 30, 'P2': fin['P2'] - 20}
ok(27, fin == {'P1': 50, 'P2': 30} and sum(wait.values()) / 2 == 15)
fin2 = mlfq({'P1': 30, 'P2': 20}, q=5)                                      # 变式：时间片 5
ok(27, fin2 == {'P1': 50, 'P2': 25} and ((50 - 30) + (25 - 20)) / 2 == 12.5, fin2)
fin3 = mlfq({'P1': 15, 'P2': 40})                                           # 变式
ok(27, fin3 == {'P1': 25, 'P2': 55} and ((25 - 15) + (55 - 40)) / 2 == 12.5, fin3)

# ───────── 29 LRU
def lru(seq, m):
    fr = []; f = rep = 0
    for p in seq:
        if p in fr: fr.remove(p); fr.append(p); continue
        f += 1
        if len(fr) == m: fr.pop(0); rep += 1
        fr.append(p)
    return f, rep
def fifo(seq, m):
    fr = []; f = rep = 0
    for p in seq:
        if p in fr: continue
        f += 1
        if len(fr) == m: fr.pop(0); rep += 1
        fr.append(p)
    return f, rep
def opt(seq, m):
    fr = []; f = rep = 0
    for i, p in enumerate(seq):
        if p in fr: continue
        f += 1
        if len(fr) == m:
            fut = seq[i + 1:]; v = max(fr, key=lambda x: fut.index(x) if x in fut else 10 ** 9); fr.remove(v); rep += 1
        fr.append(p)
    return f, rep
S29 = [0, 1, 2, 7, 0, 5, 3, 5, 0, 2, 7, 6]
ok(29, lru(S29, 4) == (9, 5))
ok(29, fifo(S29, 4) == (10, 6), fifo(S29, 4))
ok(29, opt(S29, 4) == (8, 4), opt(S29, 4))
ok(29, lru(S29, 3) == (10, 7), lru(S29, 3))

# ───────── 31 二级页表拆位
va = 0x20501225
ok(31, (va >> 22, (va >> 12) & 0x3FF, va & 0xFFF) == (0x081, 0x101, 0x225))

# ───────── 35 SR 窗口
ok(35, max(w for w in range(1, 9) if 5 + w <= 8 and w <= 5) == 3)
ok(35, max(w for w in range(1, 17) if 5 + w <= 16 and w <= 5) == 5)

# ───────── 36 CSMA/CD
t = 128 * 8 / 100e6
ok(36, abs(t - 10.24e-6) < 1e-15 and abs(t / 2 - 5.12e-6) < 1e-15)
ok(36, abs(5.12e-6 * 2e8 - 1024) < 1e-6)   # 变式：传播速率 2×10^8 m/s ⟹ 最远 1024 m

# ───────── 37 变长子网：/20 恰好切成 5 个对齐块，穷举所有方案
def splits(size, k):
    """把一个 2^size 的块递归二分成 k 块，返回所有块大小（指数）的多重集"""
    if k == 1: return [(size,)]
    if size == 0: return []
    out = []
    for a in range(1, k):
        for x in splits(size - 1, a):
            for y in splits(size - 1, k - a): out.append(tuple(sorted(x + y)))
    return list(set(out))
plans = splits(12, 5)
mins = sorted(set(2 ** min(p) - 2 for p in plans))
ok(37, mins == [254, 510], (plans, mins))          # 最小子网只可能是 /24 (254) 或 /23 (510)
ok(37, min(mins) == 254 and sorted(plans) == [(8, 8, 9, 10, 11), (9, 9, 9, 9, 11), (9, 9, 10, 10, 10)], sorted(plans))
ok(37, sorted(set(2 ** min(p) - 2 for p in splits(12, 6))) [0] == 126)            # 变式：6 个子网

# ───────── 38 快重传
acks = ['t0', 't1', 't2', 't3']
dup = 0
for k, tm in enumerate(acks):
    if k > 0: dup += 1
    if dup == 3: when = tm; break
ok(38, when == 't3')

# ───────── 39 三次握手
x, y = 2018, 2046
ok(39, (y + 1) == 2047 and (x + 1) == 2019)

# ───────── 44 磁盘
cap = 300 * 10 * 200 * 512
ok(44, cap // 1024 == 300000)
per_cyl = 10 * 200 // 2; per_trk = 200 // 2
cyl = {c: c // per_cyl for c in (100260, 60005, 101660, 110560)}
ok(44, cyl == {100260: 100, 60005: 60, 101660: 101, 110560: 110})
pos = 85; rest = list(cyl); order44 = []
while rest:
    nx = min(rest, key=lambda c: abs(cyl[c] - pos)); order44.append(nx); pos = cyl[nx]; rest.remove(nx)
ok(44, order44 == [100260, 101660, 110560, 60005])
c = 100530
ok(44, (c // per_cyl, (c % per_cyl) // per_trk, (c % per_trk) * 2) == (100, 5, 60))
ok(44, ((c % per_cyl) * 2) % 200 == 60)
# 变式：SCAN 向增大方向、C-LOOK
ok(44, sorted([c for c in cyl if cyl[c] >= 85], key=lambda c: cyl[c]) + sorted([c for c in cyl if cyl[c] < 85], key=lambda c: -cyl[c]) == order44)
ok(44, sum(abs(a - b) for a, b in zip([85, 100, 101, 110], [100, 101, 110, 60])) == 75)
c2 = 2019
ok(44, (c2 // per_cyl, (c2 % per_cyl) // per_trk, (c2 % per_trk) * 2) == (2, 0, 38))

# ───────── 45 机器码
nxt16 = 0x00401025 + 5
off = (0x00401000 - nxt16) & 0xFFFFFFFF
ok(45, nxt16 == 0x0040102A and off == 0xFFFFFFD6 and off.to_bytes(4, 'little').hex() == 'd6ffffff')
ok(45, 0x0040101E + 0x17 == 0x00401035 and 0x00401035 + 0x05 == 0x0040103A)      # jle/jmp 偏移也是相对下一条
f13 = math.factorial(13)
w = f13 & 0xFFFFFFFF; w = w - (1 << 32) if w >> 31 else w
ok(45, f13 == 6227020800 and w == 1932053504)
ok(45, [n for n in range(1, 21) if math.factorial(n) > 2 ** 31 - 1][0] == 13)       # 12! 还装得下
ok(45, math.factorial(20) < 2 ** 63 - 1 < math.factorial(21))                       # long long 到 20!
def calls(n): return 1 if n <= 1 else 1 + calls(n - 1)
ok(45, calls(10) == 10)
def of_rule(a, b):
    p = (a * b) & ((1 << 64) - 1)           # 64 位乘积的位模式
    hi33 = p >> 31                          # 高 33 位
    return not (hi33 == 0 or hi33 == (1 << 33) - 1)
for _ in range(200000):
    a = R.randint(-2 ** 31, 2 ** 31 - 1); b = R.randint(-2 ** 31, 2 ** 31 - 1)
    if R.random() < .5: b = R.randint(-70000, 70000)
    real = a * b
    ok(45, of_rule(a, b) == (not (-2 ** 31 <= real <= 2 ** 31 - 1)), (a, b))
# 第 1 行 push 到第 11 行 cmp 的地址：f1+35h = 00401035
ok(45, 0x00401000 + 0x35 == 0x00401035 and 0x00401000 + 0x3A == 0x0040103A)

# ───────── 46 分页 / Cache
ok(46, 0x00401000 >> 12 == 0x00401 == 0x0040104A >> 12)
sets = 64 // 4; ob = 6; ib = int(math.log2(sets))
ok(46, (ob, ib, 32 - ib - ob) == (6, 4, 22))
ok(46, (0x00401025 >> 6) & 0xF == 0 and (0x0040104A >> 6) & 0xF == 1 and (0x00401000 >> 6) & 0xF == 0)
ok(46, ob + ib <= 12)
# 变式：Cache 改成 256 行 2 路 ⟹ 128 组 7 位，6+7=13 > 12
ok(46, 6 + int(math.log2(256 // 2)) == 13)
# 指令 Cache 中 f1 跨几个块：00401000–0040104A
ok(46, (0x0040104A >> 6) - (0x00401000 >> 6) + 1 == 2)

# ───────── 47 网络
import ipaddress as ip
ok(47, [str(a) for a in ip.ip_network('192.168.1.253/30', strict=False).hosts()] == ['192.168.1.253', '192.168.1.254'])
n1 = ip.ip_network('192.168.1.2/26', strict=False); n2 = ip.ip_network('192.168.1.66/26', strict=False)
ok(47, str(n1) == '192.168.1.0/26' and str(n2) == '192.168.1.64/26' and n1 != n2)
ok(47, str(n2.broadcast_address) == '192.168.1.127' and str(n1.broadcast_address) == '192.168.1.63')
ok(47, ip.ip_address('192.168.1.1') in n1 and ip.ip_address('192.168.1.65') in n2)
ok(47, ip.ip_address('192.168.1.2').is_private and not ip.ip_address('101.1.2.10').is_private)
ok(47, n1.num_addresses - 2 == 62)

# ───────── 41 / 42：C 代码编译 + 随机对拍（代码与 2019.txt 卷面里的一字不差，由脚本从 txt 里抽出）
HERE = os.path.dirname(os.path.abspath(__file__))
TXT = os.path.join(os.path.dirname(HERE), '2019.txt')
def code_blocks(no):
    s = open(TXT, encoding='utf-8').read()
    a = s.index('\n#%d\n' % no); b = s.find('\n#', a + 3); seg = s[a:b if b > 0 else len(s)]
    out, inb, buf = [], False, []
    for line in seg.split('\n'):
        if line.strip().startswith('```'):
            if inb: out.append('\n'.join(buf)); buf = []
            inb = not inb; continue
        if inb: buf.append(line)
    return out
def run_c(src, inp):
    d = tempfile.mkdtemp(); c = os.path.join(d, 'a.c'); exe = os.path.join(d, 'a')
    open(c, 'w').write(src)
    r = subprocess.run(['gcc', '-O2', '-Wall', '-Wno-unused-result', '-o', exe, c], capture_output=True, text=True)
    if r.returncode: print(r.stderr); return None
    return subprocess.run([exe], input=inp, capture_output=True, text=True).stdout

if os.path.exists(TXT) and '\n#41\n' in open(TXT, encoding='utf-8').read():
    code = code_blocks(41)[0]
    harness = r'''
#include <stdio.h>
#include <stdlib.h>
''' + code + r'''
int main(void){ int T; scanf("%d",&T); while(T--){ int n; scanf("%d",&n);
  NODE *h=malloc(sizeof(NODE)), *t=h; h->next=NULL;
  for(int i=0;i<n;i++){ NODE *p=malloc(sizeof(NODE)); scanf("%d",&p->data); p->next=NULL; t->next=p; t=p; }
  change_list(h);
  for(NODE *p=h->next;p;p=p->next) printf("%d ",p->data); printf("\n"); } return 0; }
'''
    cases = []; exp = []
    for n in list(range(0, 12)) + [R.randint(1, 60) for _ in range(500)]:
        a = [R.randint(-99, 99) for _ in range(n)]; cases.append(a)
        res = []; i, j = 0, n - 1
        while i <= j:
            res.append(a[i])
            if i != j: res.append(a[j])
            i += 1; j -= 1
        exp.append(' '.join(map(str, res)))
    inp = '%d\n' % len(cases) + '\n'.join('%d %s' % (len(a), ' '.join(map(str, a))) for a in cases) + '\n'
    out = run_c(harness, inp)
    ok(41, out is not None and [l.strip() for l in out.split('\n')[:-1]] == exp, 'C 对拍')
    print('  第 41 题：gcc 编译通过，%d 组随机链表（含 n=0..11）与参照答案一致' % len(cases))

if os.path.exists(TXT) and '\n#42\n' in open(TXT, encoding='utf-8').read():
    code = code_blocks(42)[0]
    harness = r'''
#include <stdio.h>
#include <stdlib.h>
''' + code + r'''
int main(void){ LinkQueue Q; InitQueue(&Q); int m; scanf("%d",&m); long long nodes_max=0;
  while(m--){ int op,x; scanf("%d",&op);
    if(op==0){ scanf("%d",&x); EnQueue(&Q,x); printf("E\n"); }
    else { if(DeQueue(&Q,&x)) printf("D %d\n",x); else printf("EMPTY\n"); }
    int c=1; for(QNode *p=Q.front->next;p!=Q.front;p=p->next) c++;
    if(c>nodes_max) nodes_max=c; printf("N %d\n", c); }
  return 0; }
'''
    ops = []; exp = []; q = []; nodes = 1; maxlen = 0
    for _ in range(100000):
        if R.random() < 0.52 or not q and R.random() < .3:
            v = R.randint(0, 10 ** 6); ops.append('0 %d' % v); q.append(v); exp.append('E')
            if len(q) + 1 > nodes: nodes = len(q) + 1
        else:
            ops.append('1'); exp.append(('D %d' % q.pop(0)) if q else 'EMPTY')
        exp.append('N %d' % nodes)       # 结点数 = 历史最大队长 + 1，只增不减
    out = run_c(harness, '%d\n%s\n' % (len(ops), '\n'.join(ops)))
    ok(42, out is not None and out.split('\n')[:-1] == exp, 'C 对拍')
    print('  第 42 题：gcc 编译通过，10 万次随机入队/出队与真队列对拍一致，结点数只增不减且恰为「历史最大长度+1」')

# ───────── 43 哲学家：状态空间穷举找死锁
def phil(n, bowl0, bowl_first=True):
    # 每人状态 0 思考 1 拿到碗 2 拿到碗+左筷 3 吃（拿齐）；bowl_first=False 时 先左筷 再碗 再右筷
    from collections import deque
    start = (bowl0, (1,) * n, (0,) * n); seen = {start}; dq = deque([start])
    while dq:
        b, cs, st = dq.popleft(); moves = []
        for i in range(n):
            L, Rr = i, (i + 1) % n; s = st[i]
            def nxt(b2, cs2, s2):
                st2 = list(st); st2[i] = s2; return (b2, tuple(cs2), tuple(st2))
            cs2 = list(cs)
            if bowl_first:
                if s == 0 and b > 0: moves.append(nxt(b - 1, cs2, 1))
                elif s == 1 and cs[L]: cs2[L] = 0; moves.append(nxt(b, cs2, 2))
                elif s == 2 and cs[Rr]: cs2[Rr] = 0; moves.append(nxt(b, cs2, 3))
                elif s == 3: cs2[L] = 1; cs2[Rr] = 1; moves.append(nxt(b + 1, cs2, 0))
            else:
                if s == 0 and cs[L]: cs2[L] = 0; moves.append(nxt(b, cs2, 1))
                elif s == 1 and b > 0: moves.append(nxt(b - 1, cs2, 2))
                elif s == 2 and cs[Rr]: cs2[Rr] = 0; moves.append(nxt(b, cs2, 3))
                elif s == 3: cs2[L] = 1; cs2[Rr] = 1; moves.append(nxt(b + 1, cs2, 0))
        if not moves: return False, len(seen)
        for m in moves:
            if m not in seen: seen.add(m); dq.append(m)
    return True, len(seen)
for n in range(3, 7):
    for m in range(1, 9):
        ok(43, phil(n, min(n - 1, m))[0], ('min', n, m))
        if m >= n: ok(43, not phil(n, m)[0], ('bowl=m 应死锁', n, m))
ok(43, not phil(5, 4, bowl_first=False)[0])      # 碗放在拿左筷之后：限流失效，仍会死锁
# 最多同时就餐人数 = min(m, ⌊n/2⌋)
def max_eat(n, bowl0):
    from collections import deque
    start = (bowl0, (1,) * n, (0,) * n); seen = {start}; dq = deque([start]); best = 0
    while dq:
        b, cs, st = dq.popleft(); best = max(best, st.count(3))
        for i in range(n):
            L, Rr = i, (i + 1) % n; s = st[i]; cs2 = list(cs); st2 = list(st); b2 = b
            if s == 0 and b > 0: b2 -= 1; st2[i] = 1
            elif s == 1 and cs[L]: cs2[L] = 0; st2[i] = 2
            elif s == 2 and cs[Rr]: cs2[Rr] = 0; st2[i] = 3
            elif s == 3: cs2[L] = cs2[Rr] = 1; b2 += 1; st2[i] = 0
            else: continue
            m = (b2, tuple(cs2), tuple(st2))
            if m not in seen: seen.add(m); dq.append(m)
    return best
ok(43, all(max_eat(n, min(n - 1, m)) == min(m, n // 2) for n in range(3, 7) for m in range(1, 7)))


# ───────── 精解「举一反三」里的数（补充）
ok(45, ((0x00401000 - 0x00401055) & 0xFFFFFFFF) == 0xFFFFFFAB)
ok(45, math.factorial(20) < 2**63 - 1 < math.factorial(21))
ok(46, (0x0040104A >> 6) & 0xF == 1 and (0x025 >> 6) & 0x3F == 0)
ok(44, (100530 // 500, (100530 % 500) // 50, (100530 % 50) * 4) == (201, 0, 120) and 300 * 500 == 150000)
ok(44, 100 * 1000 + 5 * 100 + 60 // 2 == 100530)
ok(31, ((0x20501225 >> 23), (0x20501225 >> 12) & 0x7FF) == (0x040, 0x501))
ok(31, (0x00401025 >> 22, (0x00401025 >> 12) & 0x3FF) == (1, 1) and 0x00100000 + 0x81 * 4 == 0x00100204)
ok(27, mlfq({'P1': 30, 'P2': 20}) == {'P1': 50, 'P2': 30})
def mlfq_fcfs(jobs, q=10):
    t = 0; rem = dict(jobs); Q1 = list(jobs); Q2 = []; fin = {}
    while Q1 or Q2:
        if Q1:
            p = Q1.pop(0); run = min(q, rem[p]); t += run; rem[p] -= run
            if rem[p]: Q2.append(p)
            else: fin[p] = t
        else:
            p = Q2.pop(0); t += rem[p]; rem[p] = 0; fin[p] = t
    return fin
ok(27, mlfq_fcfs({'P1': 30, 'P2': 20}) == {'P1': 40, 'P2': 50})
ok(36, 10.24e-6 * 1e9 == 10240)
ok(39, 2047 + 200 == 2247)
ok(21, abs(0.005 * 1e9 / 12500 - 400) < 1e-9)
ok(47, 62 - 3 == 59)

print('✓ 2019 复算全部通过：%d 项断言，覆盖第 %s 题' % (len(OK), ','.join(map(str, sorted(set(OK))))))
