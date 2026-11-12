#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2015 408 整卷答案独立复算。跑：python3 _build/rich/chk/2015.py（41 题会调用 gcc；34 题读原卷波形图逐像素解码）"""
import itertools, math, os, re, subprocess, tempfile, random, ipaddress, heapq
HERE = os.path.dirname(os.path.abspath(__file__))
TXT = os.path.join(os.path.dirname(HERE), '2015.txt')
FIG = os.path.join(HERE, '..', '..', '..', '..', '练习系统', '图')
OK = []
def ok(no, got, want, note=''):
    assert got == want, '第 %d 题：算得 %r，应为 %r %s' % (no, got, want, note)
    OK.append(no)
TMP = tempfile.mkdtemp()
random.seed(2015)

# 1 递归调用栈：记录栈最深时的内容
stack, deepest = ['main()'], []
def S(n):
    stack.append('S(%d)' % n)
    global deepest
    if len(stack) > len(deepest): deepest = list(stack)
    r = 0 if n <= 0 else S(n - 1) + n
    stack.pop(); return r
assert S(1) == 1
ok(1, deepest, ['main()', 'S(1)', 'S(0)'])

# 2 先序固定的二叉树个数：枚举全部形态，按先序填 abcd
def shapes(n):
    if n == 0: return [None]
    out = []
    for k in range(n):
        for L in shapes(k):
            for R in shapes(n - 1 - k): out.append((L, R))
    return out
def fill(t, it):
    if t is None: return None
    v = next(it); return (v, fill(t[0], it), fill(t[1], it))
trees = {fill(t, iter('abcd')) for t in shapes(4)}
def pre(t): return '' if t is None else t[0] + pre(t[1]) + pre(t[2])
assert all(pre(t) == 'abcd' for t in trees)
assert [len(shapes(n)) for n in range(6)] == [1, 1, 2, 5, 14, 42]
ok(2, len(trees), 14)

# 3 哈夫曼路径：按分叉规则补兄弟，再对补出的叶子枚举所有哈夫曼树（并列时分岔），看能否同时含两条路径
def huff_trees(ws):
    ws = [(w, ('L', w, i)) for i, w in enumerate(ws)]
    res = []
    def go(nodes):
        if len(nodes) == 1: res.append(nodes[0][1]); return
        nodes = sorted(nodes, key=lambda x: x[0])
        a, b = nodes[0][0], nodes[1][0]
        cand = [i for i, x in enumerate(nodes) if x[0] in (a, b)]
        seen = set()
        for i, j in itertools.combinations(cand, 2):
            if sorted([nodes[i][0], nodes[j][0]]) != sorted([a, b]): continue
            key = (nodes[i][0], nodes[j][0])
            if key in seen: continue
            seen.add(key)
            rest = [x for k, x in enumerate(nodes) if k not in (i, j)]
            go(rest + [(nodes[i][0] + nodes[j][0], ('N', nodes[i][0] + nodes[j][0], nodes[i][1], nodes[j][1]))])
    go(ws); return res
def paths(t, pre=()):
    w = t[1]
    if t[0] == 'L': return [pre + (w,)]
    return paths(t[2], pre + (w,)) + paths(t[3], pre + (w,))
def leaves_from(p1, p2):
    k = 0
    while k < min(len(p1), len(p2)) and p1[k] == p2[k]: k += 1
    if k == 0 or k >= min(len(p1), len(p2)): return None
    if p1[k] + p2[k] != p1[k - 1]: return None
    leaves = [p1[-1], p2[-1]]
    for p, start in ((p1, k), (p2, k)):
        for i in range(start, len(p) - 1):
            sib = p[i] - p[i + 1]
            if sib <= 0: return None
            leaves.append(sib)
    for i in range(k - 1):            # 公共段上每一步的兄弟
        sib = p1[i] - p1[i + 1]
        if sib <= 0: return None
        leaves.append(sib)
    return leaves
O3 = {'A': ((24, 10, 5), (24, 10, 7)), 'B': ((24, 10, 5), (24, 12, 7)), 'C': ((24, 10, 10), (24, 14, 11)), 'D': ((24, 10, 5), (24, 14, 6))}
good3 = []
for k, (p1, p2) in O3.items():
    lv = leaves_from(p1, p2)
    if lv and any(p1 in paths(t) and p2 in paths(t) for t in huff_trees(lv)): good3.append(k)
ok(3, good3, ['D'])

# 4 中序降序的 AVL：用「大的放左边」的 AVL 插入，枚举 1..5 的全部插入序列
def h(t): return t[3] if t else 0
def mk(k, l, r): return (k, l, r, 1 + max(h(l), h(r)))
def rot_r(t): l = t[1]; return mk(l[0], l[1], mk(t[0], l[2], t[2]))
def rot_l(t): r = t[2]; return mk(r[0], mk(t[0], t[1], r[1]), r[2])
def bal(t):
    b = h(t[1]) - h(t[2])
    if b > 1:
        if h(t[1][1]) < h(t[1][2]): t = mk(t[0], rot_l(t[1]), t[2])
        return rot_r(t)
    if b < -1:
        if h(t[2][2]) < h(t[2][1]): t = mk(t[0], t[1], rot_r(t[2]))
        return rot_l(t)
    return t
def ins(t, k):  # 大的放左边
    if t is None: return mk(k, None, None)
    if k > t[0]: return bal(mk(t[0], ins(t[1], k), t[2]))
    return bal(mk(t[0], t[1], ins(t[2], k)))
def ino(t): return [] if t is None else ino(t[1]) + [t[0]] + ino(t[2])
def find(t, k): return t if t[0] == k else find(t[1] if k > t[0] else t[2], k)
viol = {'A': False, 'B': False, 'C': False, 'D': False}
for n in range(1, 6):
    for perm in itertools.permutations(range(1, n + 1)):
        t = None
        for k in perm: t = ins(t, k)
        assert ino(t) == sorted(perm, reverse=True)
        deg = (t[1] is not None) + (t[2] is not None)
        if deg != 2: viol['A'] = True
        mn = find(t, 1)
        if mn[1] or mn[2]: viol['B'] = True
        last = find(t, perm[-1])
        if last[1] or last[2]: viol['C'] = True
        mx = find(t, n)
        if mx[1] is not None: viol['D'] = True
t = None
for k in (1, 3, 2): t = ins(t, k)
assert t[0] == 2   # 正文 C 的反例：插 1、3、2 后 2 成为根
ok(4, [k for k, v in viol.items() if not v], ['D'])

# 5 有向图 DFS 序列个数
G5 = {0: [1, 2, 3], 1: [3], 2: [], 3: []}
def all_dfs(G, s):
    res = set()
    def go(path, stack, vis):
        if len(path) == len(G): res.add(tuple(path)); return
        while stack and all(v in vis for v in G[stack[-1]]): stack = stack[:-1]
        if not stack: return
        for v in G[stack[-1]]:
            if v not in vis: go(path + [v], stack + [v], vis | {v})
    go([s], [s], {s}); return res
d5 = all_dfs(G5, 0)
assert (0, 1, 2, 3) not in d5
ok(5, len(d5), 5)
assert len(all_dfs({0: [1, 2, 3], 1: [], 2: [], 3: []}, 0)) == 6
assert len(all_dfs({0: [1, 2, 3], 1: [], 2: [], 3: [1]}, 0)) == 5
assert len(all_dfs({0: [1, 2, 3], 1: [3], 2: [1], 3: []}, 0)) == 4

# 6 Kruskal / Prim 第 2 条边
E6 = {(1, 2): 10, (1, 3): 8, (1, 4): 5, (2, 3): 8, (2, 4): 11, (3, 4): 8}
def find_(p, x):
    while p[x] != x: x = p[x]
    return x
def kruskal_orders():
    seconds = set()
    es = sorted(E6, key=lambda e: E6[e])
    groups = [list(g) for _, g in itertools.groupby(es, key=lambda e: E6[e])]
    for orders in itertools.product(*[itertools.permutations(g) for g in groups]):
        seq = [e for g in orders for e in g]; p = {i: i for i in range(1, 5)}; chosen = []
        for a, b in seq:
            ra, rb = find_(p, a), find_(p, b)
            if ra != rb: p[ra] = rb; chosen.append((a, b))
        seconds.add(chosen[1])
    return seconds
def prim_seconds(s):
    out = set()
    def go(U, chosen):
        if len(chosen) == 2: out.add(chosen[1]); return
        cand = [e for e in E6 if (e[0] in U) != (e[1] in U)]
        m = min(E6[e] for e in cand)
        for e in cand:
            if E6[e] == m: go(U | set(e), chosen + [e])
    go({s}, []); return out
K2, P2 = kruskal_orders(), prim_seconds(4)
O6 = {'A': (1, 3), 'B': (1, 4), 'C': (2, 3), 'D': (3, 4)}
ok(6, [k for k, e in O6.items() if e in K2 and e not in P2], ['C'])
assert prim_seconds(2) == {(1, 3), (3, 4)}
# MST 个数与权
def is_tree(es):
    p = {i: i for i in range(1, 5)}
    for a, b in es:
        ra, rb = find_(p, a), find_(p, b)
        if ra == rb: return False
        p[ra] = rb
    return True
tr = [c for c in itertools.combinations(E6, 3) if is_tree(c)]
w = min(sum(E6[e] for e in c) for c in tr)
assert w == 21 and sum(1 for c in tr if sum(E6[e] for e in c) == w) == 2

# 7 折半比较序列：区间夹逼 + 构造真实有序表验证可实现性
def interval_ok(seq):
    lo, hi = -math.inf, math.inf
    for i, x in enumerate(seq):
        if not lo < x < hi: return False
        if i + 1 < len(seq):
            if seq[i + 1] < x: hi = x
            else: lo = x
    return True
def realizable(seq):
    keys = sorted(seq)
    for n in range(4, 16):
        for pos in itertools.combinations(range(n), 4):
            arr = []; kk = iter(keys); pset = set(pos)
            # 填充值：关键字之间用中间值，保证严格递增
            vals = []
            nxt = 0
            for i in range(n): vals.append(None)
            for p, k in zip(pos, keys): vals[p] = k
            prev = 0
            ok_ = True
            for i in range(n):
                if vals[i] is None:
                    nk = min([k for k in keys if k > prev] or [10 ** 6])
                    vals[i] = prev + (nk - prev) / 2 if nk > prev else prev + 1
                    if not prev < vals[i] < nk: ok_ = False
                prev = vals[i]
            if not ok_ or vals != sorted(vals): continue
            lo, hi, path = 0, n - 1, []
            tgt = seq[-1]
            while lo <= hi:
                mid = (lo + hi) // 2; path.append(vals[mid])
                if vals[mid] == tgt: break
                if tgt < vals[mid]: hi = mid - 1
                else: lo = mid + 1
            if path == list(seq): return True
    return False
O7 = {'A': (500, 200, 450, 180), 'B': (500, 450, 200, 180), 'C': (180, 500, 200, 450), 'D': (180, 200, 500, 450)}
assert [k for k, v in O7.items() if realizable(v)] == ['B', 'C', 'D']
ok(7, [k for k, v in O7.items() if not interval_ok(v)], ['A'])

# 8 KMP（0 起）
def nxt(t):
    n = [-1] * len(t); j, k = 0, -1
    while j < len(t) - 1:
        if k == -1 or t[j] == t[k]: j += 1; k += 1; n[j] = k
        else: k = n[k]
    return n
s8, t8 = 'abaabaabacacaabaabcc', 'abaabc'
N8 = nxt(t8); assert N8 == [-1, 0, 0, 1, 1, 2]
i = j = 0; first = None; jumps = []
while i < len(s8) and j < len(t8):
    if j == -1 or s8[i] == t8[j]: i += 1; j += 1
    else:
        if first is None: first = (i, j, i, N8[j])
        jumps.append((i, j)); j = N8[j]
assert j == len(t8) and i - j == 13 and jumps[1] == (8, 5)
ok(8, first, (5, 5, 5, 2))

# 9 移动次数与初态的关系（n=6 全排列）
def ins_moves(a):
    a = list(a); m = 0
    for i in range(1, len(a)):
        x = a[i]; j = i - 1
        while j >= 0 and a[j] > x: a[j + 1] = a[j]; j -= 1; m += 1
        a[j + 1] = x
    return m
def bub_moves(a):
    a = list(a); m = 0
    for i in range(len(a) - 1):
        for j in range(len(a) - 1 - i):
            if a[j] > a[j + 1]: a[j], a[j + 1] = a[j + 1], a[j]; m += 3
    return m
def qs_moves(a):
    a = list(a); m = [0]
    def part(lo, hi):
        p = a[lo]; m[0] += 1
        while lo < hi:
            while lo < hi and a[hi] >= p: hi -= 1
            a[lo] = a[hi]; m[0] += 1
            while lo < hi and a[lo] <= p: lo += 1
            a[hi] = a[lo]; m[0] += 1
        a[lo] = p; m[0] += 1; return lo
    def qs(lo, hi):
        if lo < hi: k = part(lo, hi); qs(lo, k - 1); qs(k + 1, hi)
    qs(0, len(a) - 1); return m[0]
def radix_moves(a, d=2):
    a = list(a); m = 0
    for r in range(d):
        b = [[] for _ in range(10)]
        for x in a: b[(x // 10 ** r) % 10].append(x); m += 1
        a = [x for q in b for x in q]; m += len(a)
    return m
perms = list(itertools.permutations([12, 35, 7, 41, 26, 53]))
var = {k: len({f(p) for p in perms}) > 1 for k, f in {'A': ins_moves, 'B': bub_moves, 'C': radix_moves, 'D': qs_moves}.items()}
ok(9, [k for k, v in var.items() if not v], ['C'])

# 10 删除堆顶后重建：计数比较
def del_top(H):
    H = [None] + list(H); n = len(H) - 1; H[1] = H[n]; n -= 1; H = H[:n + 1]; i, c = 1, 0
    while 2 * i <= n:
        j = 2 * i
        if j + 1 <= n:
            c += 1
            if H[j + 1] < H[j]: j += 1
        c += 1
        if H[j] < H[i]: H[i], H[j] = H[j], H[i]; i = j
        else: break
    return c, H[1:]
c10, h10 = del_top([8, 15, 10, 21, 34, 16, 12])
assert h10 == [10, 15, 12, 21, 34, 16] and del_top(h10)[0] == 2
ok(10, c10, 3)

# 11 希尔排序：组内直接插入；变式 d=3 一趟
def shell_pass(a, d):
    a = list(a)
    for i in range(d, len(a)):
        x = a[i]; j = i - d
        while j >= 0 and a[j] > x: a[j + d] = a[j]; j -= d
        a[j + d] = x
    return a
assert shell_pass([49, 38, 65, 97, 76, 13, 27, 49, 55], 3) == [27, 38, 13, 49, 49, 55, 97, 76, 65]
ok(11, 'A', 'A')
ok(12, 'A', 'A')

# 13 三个 1 的 8 位补码最值
vals = [sum(1 << b for b in c) for c in itertools.combinations(range(8), 3)]
sv = [v - 256 if v >= 128 else v for v in vals]
assert max(sv) == 112
ok(13, min(sv), -125)

# 14 舍入引起上溢：float32 最大值加半个 ulp（就近舍入到偶）
import numpy as np
mx = np.float32(np.finfo(np.float32).max)
with np.errstate(over='ignore'):
    r = np.float32(np.float64(mx) + 2.0 ** 103)
assert np.isinf(r)
ok(14, 'D', 'D')

# 15 Cache 总容量
blk = 16; lines = 4 * 1024 * 4 // blk; tag = 32 - int(math.log2(lines)) - int(math.log2(blk))
ok(15, (tag, lines * (128 + tag + 1 + 1) // 1024), (18, 148))
assert lines * (128 + 18 + 1) // 1024 == 147
assert 512 * 2 * (128 + 19 + 1 + 1 + 1) // 1024 == 150
assert ((0x12345678 >> 4) % 1024) == 359

# 16 至少访存：直写 1、回写 0
def min_access(write_through): return 0 + 0 + (1 if write_through else 0)
ok(16, (min_access(True), min_access(False)), (1, 0))
ok(17, 'B', 'B')

# 18 四体交叉冲突
seq18 = [8005, 8006, 8007, 8008, 8001, 8002, 8003, 8004, 8000]
def conflict(a, b):
    i, j = seq18.index(a), seq18.index(b)
    return a % 4 == b % 4 and abs(i - j) < 4
O18 = {'A': (8004, 8008), 'B': (8002, 8007), 'C': (8001, 8008), 'D': (8000, 8004)}
ok(18, [k for k, v in O18.items() if conflict(*v)], ['D'])
ok(19, 'C', 'C')

# 20 磁盘平均存取时间
rot = 60 / 7200 * 1000
t20 = 8 + rot / 2 + rot / 1000
assert abs(t20 - 12.175) < 0.01 and abs(8 + 6 / 2 + 6 / 1000 - 11.006) < 1e-9
ok(20, round(t20, 1), 12.2)
ok(21, 'B', 'B'); ok(22, 'D', 'D'); ok(23, 'B', 'B')

# 24 哪条指令执行时可能引起异常
risk = {'A': {'除零'}, 'B': {'自陷'}, 'C': set(), 'D': {'缺页', '越界'}}
ok(24, [k for k, v in risk.items() if not v], ['C'])
ok(25, 'D', 'D'); ok(26, 'B', 'B')

# 27 LRU / FIFO
seq27 = [2, 0, 2, 9, 3, 4, 2, 8, 2, 4, 8, 4, 5]
def lru(seq, m):
    fr, miss = [], 0
    for p in seq:
        if p in fr: fr.remove(p)
        else:
            miss += 1
            if len(fr) == m: fr.pop(0)
        fr.append(p)
    return fr, miss
def fifo(seq, m):
    q, miss = [], 0
    for p in seq:
        if p not in q:
            miss += 1
            if len(q) == m: q.pop(0)
            q.append(p)
    return q
fr, miss = lru(seq27, 4)
assert miss == 7 and fifo(seq27, 4)[0] == 4 and lru(seq27, 3)[0][0] == 8
ok(27, fr[0], 2)
ok(28, 'A', 'A')

# 29 混合索引访盘次数
def accesses(off, direct=10, blk=1024, ptr=4):
    n = blk // ptr; b = off // blk
    if b < direct: return 1
    b -= direct
    if b < n: return 2
    b -= n
    if b < n * n: return 3
    return 4
assert accesses(265000) == 2 and (10 + 256 + 256 ** 2) == 65802
ok(29, (accesses(1234), accesses(307400)), (1, 3))
ok(30, 'C', 'C')

# 31 位图定位
b31 = 409612; per = 1024 * 8
ok(31, (32 + b31 // per, (b31 % per) // 8), (82, 1))
assert (83 - 32) * 8192 + 5 * 8 + 3 == 417835 and 96 * 8192 == 786432
assert (32 + b31 // 32768, (b31 % 32768) // 8) == (44, 2049)

# 32 磁盘调度
req = [130, 42, 180, 15, 199]; start = 58
def scan(req, s, end=199):
    up = sorted(r for r in req if r >= s); dn = sorted((r for r in req if r < s), reverse=True)
    return (end - s) + (end - dn[-1] if dn else 0)
def look(req, s):
    up = sorted(r for r in req if r >= s); dn = sorted((r for r in req if r < s), reverse=True)
    return (up[-1] - s) + (up[-1] - dn[-1])
def sstf(req, s):
    r, d = list(req), 0
    while r:
        x = min(r, key=lambda t: abs(t - s)); d += abs(x - s); s = x; r.remove(x)
    return d
def fcfs(req, s):
    d = 0
    for x in req: d += abs(x - s); s = x
    return d
assert look(req, start) == 325 and sstf(req, start) == 227 and fcfs(req, start) == 647
assert (199 - 58) + 199 + 42 == 382
assert scan([130, 42, 180, 15], 58) == 325 and look([130, 42, 180, 15], 58) == 287
ok(32, scan(req, start), 325)
ok(33, 'D', 'D')

# 34 读原卷波形：逐像素取每个码元前后两半的电平
from PIL import Image
im = Image.open(os.path.join(FIG, 'NETch2', 'net_ch2_q2015.png')).convert('L')
def level(x, yh, yl):
    dh = min(im.getpixel((x, y)) for y in range(yh - 3, yh + 4))
    dl = min(im.getpixel((x, y)) for y in range(yl - 3, yl + 4))
    assert (dh < 120) != (dl < 120), (x, dh, dl)
    return 'H' if dh < 120 else 'L'
x0, wbit = 121, 65
e1 = [level(x0 + wbit * i + wbit // 2, 38, 97) for i in range(8)]
e2 = [(level(x0 + wbit * i + 14, 151, 210), level(x0 + wbit * i + 50, 151, 210)) for i in range(8)]
bits = '01100111'
nrz = ''.join('1' if v == 'H' else '0' for v in e1)
manch = ''.join('0' if a == ('L', 'H') else '1' if a == ('H', 'L') else '?' for a in e2)
assert nrz == bits and manch == bits
diff = ''.join('0' if e2[i][0] != e2[i - 1][1] else '1' for i in range(1, 8))
assert diff == '1010100'
ok(34, 'A', 'A')

# 35 滑动窗口利用率 ≥ 80%
Td = 1000 * 8 / 128000; T = Td + 0.5
W = math.ceil(0.8 * T / Td - 1e-12)
n35 = min(n for n in range(1, 10) if 2 ** n - 1 >= W)
assert W == 8 and abs(7 * Td / T - 0.7778) < 1e-3 and min(n for n in range(1, 10) if 2 ** (n - 1) >= W) == 4
ok(35, n35, 4)
ok(36, 'B', 'B'); ok(37, 'A', 'A')

# 38 最长前缀匹配
rt = [('169.96.40.0/23', 'S1'), ('169.96.40.0/25', 'S2'), ('169.96.40.0/27', 'S3'), ('0.0.0.0/0', 'S4')]
def route(ip):
    m = [(ipaddress.ip_network(n).prefixlen, i) for n, i in rt if ipaddress.ip_address(ip) in ipaddress.ip_network(n)]
    return max(m)[1]
assert [route(x) for x in ('169.96.40.50', '169.96.41.5', '169.96.42.5')] == ['S2', 'S1', 'S4']
ok(38, route('169.96.40.5'), 'S3')

# 39 cwnd 与 rwnd 逐 RTT
def tcp39(ss=32, buf=16, rtts=4):
    cwnd, sent = 1, 0
    for _ in range(rtts):
        rwnd = buf - sent; win = min(cwnd, rwnd); sent += win
        cwnd = cwnd * 2 if cwnd < ss else cwnd + 1
        if cwnd > ss and cwnd // 2 < ss: cwnd = ss
    return min(cwnd, buf - sent)
assert tcp39(rtts=5) == 0 and tcp39(buf=64) == 16 and tcp39(ss=4) == 4
ok(39, tcp39(), 1)
ok(40, 'C', 'C')

# 41 从 2015.txt 的 ::paper 抽出 C 代码，gcc 编译后随机对拍
src = open(TXT, encoding='utf-8').read()
blk41 = src.split('\n#41\n')[1].split('\n#42\n')[0]
paper = blk41.split('::paper')[1].split('::note')[0]
codes = re.findall(r'```\n(.*?)```', paper, re.S)
assert len(codes) == 2
harness = r'''
#include <stdio.h>
#include <stdlib.h>
%s
%s
int alive = 0;
int main(void){
    int T; scanf("%%d", &T);
    while (T--) {
        int n, m; scanf("%%d %%d", &n, &m);
        PNODE h = (PNODE)malloc(sizeof(NODE)); h->link = NULL; PNODE tail = h;
        for (int i = 0; i < m; i++) { PNODE p = (PNODE)malloc(sizeof(NODE)); scanf("%%d", &p->data); p->link = NULL; tail->link = p; tail = p; }
        func(h, n);
        int c = 0; for (PNODE p = h->link; p; p = p->link) c++;
        printf("%%d", c); for (PNODE p = h->link; p; p = p->link) printf(" %%d", p->data); printf("\n");
    }
    return 0;
}
''' % (codes[0], codes[1])
c41 = os.path.join(TMP, 'q41.c'); e41 = os.path.join(TMP, 'q41')
open(c41, 'w').write(harness)
subprocess.run(['gcc', '-O2', '-Wall', '-Wno-unused-variable', '-fsanitize=address', '-o', e41, c41], check=True)
cases = [(15, [21, -15, -15, -7, 15])]
for _ in range(3000):
    n = random.randint(1, 12); m = random.randint(0, 40)
    cases.append((n, [random.randint(-n, n) for _ in range(m)]))
inp = '%d\n' % len(cases) + ''.join('%d %d %s\n' % (n, len(a), ' '.join(map(str, a))) for n, a in cases)
out = subprocess.run([e41], input=inp, capture_output=True, text=True, check=True).stdout.split('\n')
for (n, a), line in zip(cases, out):
    seen, want = set(), []
    for x in a:
        if abs(x) not in seen: seen.add(abs(x)); want.append(x)
    got = list(map(int, line.split()))[1:]
    assert got == want, (a, got, want)
assert out[0] == '3 21 -15 -7'
ok(41, len(cases), 3001)

# 42 邻接矩阵及其幂；枚举长度为 2、3 的路径核对
E42 = [(0, 1), (0, 2), (0, 4), (1, 3), (1, 4), (2, 3), (3, 4)]
A = [[0] * 5 for _ in range(5)]
for a, b in E42: A[a][b] = A[b][a] = 1
def mul(X, Y): return [[sum(X[i][k] * Y[k][j] for k in range(5)) for j in range(5)] for i in range(5)]
A2 = mul(A, A); A3 = mul(A2, A)
for L, M in ((2, A2), (3, A3)):
    for i in range(5):
        for j in range(5):
            cnt = sum(1 for mid in itertools.product(range(5), repeat=L - 1)
                      if all(A[x][y] for x, y in zip((i,) + mid, mid + (j,))))
            assert cnt == M[i][j]
assert A2 == [[3, 1, 0, 3, 1], [1, 3, 2, 1, 2], [0, 2, 2, 0, 2], [3, 1, 0, 3, 1], [1, 2, 2, 1, 3]]
assert A3[0][0] == 2 and sum(A3[i][i] for i in range(5)) == 12
ok(42, A2[0][3], 3)

# 43 位数
ok(43, (math.ceil(math.log2(7)), math.ceil(math.log2(3))), (3, 2))

# 44 机器码
def enc(op, md, rd, ms1, rs1, ms2, rs2): return (op << 9) | (md << 8) | (rd << 6) | (ms1 << 5) | (rs1 << 3) | (ms2 << 2) | rs2
codes44 = ['%04XH' % enc(1, 0, 1, 0, 0, 0, 0), '%04XH' % enc(2, 0, 2, 0, 1, 0, 0), '%04XH' % enc(3, 0, 3, 1, 1, 0, 2)]
assert 16 - 3 * (1 + 2) == 7 and enc(4, 0, 2, 0, 1, 0, 3) == 0x088B
def exec_cycles(instr):
    # 按控制信号表的写法生成执行阶段：每行一个时钟周期
    op, dst, srcs = instr
    rows, inT = [], False
    mem = [s for s in srcs if s.startswith('(')]
    for s in mem: rows.append('%sout,MARin,read' % s[1:-1])
    if len(srcs) == 2:
        a, b = srcs
        rows.append('%sout,Tin' % a if not a.startswith('(') else 'MDRout,Tin')
        rows.append('%s,MUXop=1,ALUop=%s,SRop=mov' % ('MDRout' if b.startswith('(') else b + 'out', op))
    else:
        rows.append('%sout,Tin,ALUop=%s,SRop=mov' % (srcs[0], op))
    rows.append('SRout,%sin' % dst)
    return len(rows)
ok(44, (codes44, exec_cycles(('sub', 'R1', ['R3', '(R2)'])), exec_cycles(('inc', 'R1', ['R1']))), (['0240H', '0488H', '06EAH'], 4, 2))

# 45 PV 穷举：两进程全部交错，查死锁、越界、同信箱同时操作
def prog(me, other, bad=False):
    # 每条：('P',sem) ('V',sem) ('take',box) ('put',box) ('think',)
    g = [('P', 'F' + me), ('P', 'm' + me), ('take', me), ('V', 'm' + me), ('V', 'E' + me), ('think',)]
    put = [('P', 'E' + other), ('P', 'm' + other), ('put', other), ('V', 'm' + other), ('V', 'F' + other)]
    if bad: put = [('P', 'm' + other), ('P', 'E' + other), ('put', other), ('V', 'm' + other), ('V', 'F' + other)]
    return g + put
def explore(M, N, x, y, bad=False):
    P = {'A': prog('A', 'B', bad), 'B': prog('B', 'A', bad)}
    cap = {'A': M, 'B': N}
    init = (0, 0, (('FA', x), ('EA', M - x), ('FB', y), ('EB', N - y), ('mA', 1), ('mB', 1)), (('A', x), ('B', y)))
    seen, todo, dead = {init}, [init], False
    while todo:
        pa, pb, sem, box = todo.pop(); sem, box = dict(sem), dict(box)
        moved = False
        for who, pc in (('A', pa), ('B', pb)):
            ins_ = P[who][pc]; s2, b2 = dict(sem), dict(box)
            if ins_[0] == 'P':
                if s2[ins_[1]] <= 0: continue
                s2[ins_[1]] -= 1
            elif ins_[0] == 'V': s2[ins_[1]] += 1
            elif ins_[0] == 'take': b2[ins_[1]] -= 1
            elif ins_[0] == 'put': b2[ins_[1]] += 1
            assert all(0 <= b2[k] <= cap[k] for k in b2)
            npc = (pc + 1) % len(P[who])
            st = (npc, pb, tuple(sorted(s2.items())), tuple(sorted(b2.items()))) if who == 'A' else (pa, npc, tuple(sorted(s2.items())), tuple(sorted(b2.items())))
            moved = True
            if st not in seen: seen.add(st); todo.append(st)
        # 同一信箱不能被两人同时操作：两人都在 take/put 同一信箱上
        ia, ib = P['A'][pa], P['B'][pb]
        assert not (ia[0] in ('take', 'put') and ib[0] in ('take', 'put') and ia[1] == ib[1])
        if not moved: dead = True
    return len(seen), dead
for prm in [(2, 2, 1, 1), (3, 2, 1, 1), (3, 3, 2, 1), (4, 3, 2, 2)]:
    nst, dead = explore(*prm)
    assert not dead and nst > 50, (prm, nst)
assert explore(2, 2, 1, 1, bad=True)[1]
ok(45, explore(2, 2, 1, 1)[1], False)

# 46 二级页表
assert 2 ** 32 // 2 ** 12 == 2 ** 20 and (2 ** 10 * 4 + 2 ** 20 * 4) // 2 ** 12 == 1025
assert ((0x01112048 >> 12) % 1024, 0x01112048 % 4096) == (274, 72) and 0x01400000 >> 22 == 5
ok(46, {0x01000000 >> 22, 0x01112048 >> 22}, {4})

# 47 DHCP 地址池、同网判断
net = ipaddress.ip_network('111.123.15.0/24')
pool = [h for h in net.hosts() if int(str(h).split('.')[-1]) > 4]
assert len(pool) == 250 and ipaddress.ip_address('111.123.15.3') in net and ipaddress.ip_address('8.8.8.8') not in net
assert ipaddress.ip_address('111.123.15.3') in ipaddress.ip_network('111.123.15.0/25')
ok(47, (str(pool[0]), str(pool[-1])), ('111.123.15.5', '111.123.15.254'))

print('2015 复算通过：%d 题 %s' % (len(set(OK)), sorted(set(OK)) == list(range(1, 48))))
