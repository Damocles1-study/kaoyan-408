#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2013 408 套卷精解 · 独立复算。每题一个函数，assert 失败即报错；最后打印汇总。
跑法：python3 _build/rich/chk/2013.py   （第 41 题需要 gcc，源码在同目录 2013_q41.c）"""
import heapq, itertools, math, os, random, struct, subprocess, sys, tempfile
from collections import deque
HERE = os.path.dirname(os.path.abspath(__file__))
OK = []
def ok(n, msg): OK.append(n); print('✓ %2d  %s' % (n, msg))

# ───────── 数据结构 ─────────
def q1():
    def merge(a, b):                       # 升序 + 升序 → 降序（头插），返回 (结果, 比较次数, 摘结点次数)
        i = j = cmp = mv = 0; out = []
        while i < len(a) and j < len(b):
            cmp += 1
            if a[i] <= b[j]: out.insert(0, a[i]); i += 1
            else: out.insert(0, b[j]); j += 1
            mv += 1
        for x in a[i:] + b[j:]: out.insert(0, x); mv += 1
        return out, cmp, mv
    R = random.Random(1)
    for _ in range(3000):
        m, n = R.randint(1, 8), R.randint(1, 8)
        a = sorted(R.sample(range(100), m)); b = sorted(R.sample(range(100, 200), n)) if R.random() < .2 else sorted(R.sample(range(100), n))
        out, cmp, mv = merge(a, b)
        assert out == sorted(a + b, reverse=True) and mv == m + n and min(m, n) <= cmp <= m + n - 1
    assert merge([1, 3, 5], [2, 4, 6])[1] == 5 and merge([1, 2, 3], [4, 5, 6])[1] == 3
    ok(1, '摘结点恒 m+n，比较 ∈ [min, m+n−1] ⟹ O(m+n)=O(max(m,n))，D')

def pops(n):
    res = []
    def go(nxt, st, out):
        if len(out) == n: res.append(tuple(out)); return
        if nxt <= n: go(nxt + 1, st + [nxt], out)
        if st: go(nxt, st[:-1], out + [st[-1]])
    go(1, [], []); return res

def q2():
    for n in range(4, 10):
        P = pops(n)
        assert {p[2] for p in P if p[1] == 3} == set(range(1, n + 1)) - {3}
        assert len({p[1] for p in P if p[0] == 3}) == n - 2          # 变式
        assert {p[0] for p in P if p[1] == 3} == {1, 2, 4}
    ok(2, 'P2=3 时 P3 ∈ 除 3 外的全部，n−1 个，C')

class AVL:
    def __init__(s, k): s.k, s.l, s.r, s.h = k, None, None, 1
def H(t): return t.h if t else 0
def upd(t): t.h = 1 + max(H(t.l), H(t.r)); return t
def rotL(a): b = a.r; a.r = b.l; b.l = upd(a); return upd(b)
def rotR(a): b = a.l; a.l = b.r; b.r = upd(a); return upd(b)
def bal(t):
    upd(t); d = H(t.l) - H(t.r)
    if d > 1:
        if H(t.l.l) < H(t.l.r): t.l = rotL(t.l)
        return rotR(t)
    if d < -1:
        if H(t.r.r) < H(t.r.l): t.r = rotR(t.r)
        return rotL(t)
    return t
def avl_ins(t, k):
    if not t: return AVL(k)
    if k < t.k: t.l = avl_ins(t.l, k)
    else: t.r = avl_ins(t.r, k)
    return bal(t)
def shape(t): return None if not t else (t.k, shape(t.l), shape(t.r))
def bf0(t):
    if not t: return 0
    return (1 if (t.l or t.r) and H(t.l) == H(t.r) else 0) + bf0(t.l) + bf0(t.r)

def q3():
    t = None
    for k in range(1, 8): t = avl_ins(t, k)
    assert shape(t) == (4, (2, (1, None, None), (3, None, None)), (6, (5, None, None), (7, None, None))) and bf0(t) == 3
    t = None
    for k in range(1, 7): t = avl_ins(t, k)
    assert shape(t) == (4, (2, (1, None, None), (3, None, None)), (5, None, (6, None, None))) and bf0(t) == 2
    t = None
    for k in range(7, 0, -1): t = avl_ins(t, k)
    assert bf0(t) == 3
    ok(3, '1..7 插入 AVL 得满二叉树，平衡因子 0 的分支结点 3 个，D')

def khuff(ws, k, pad=True):
    ws = list(ws)
    if pad:
        while (len(ws) - 1) % (k - 1): ws.append(0)
    heapq.heapify(ws); tot = 0
    while len(ws) > 1:
        s = sum(heapq.heappop(ws) for _ in range(min(k, len(ws)))); tot += s; heapq.heappush(ws, s)
    return tot

def q4():
    assert khuff([2, 3, 4, 5, 6, 7], 3) == 46
    assert khuff([2, 3, 4, 5, 6, 7], 3, pad=False) == 54
    assert khuff([2, 3, 4, 5, 6, 7], 4) == 36 and khuff([2, 3, 4, 5, 6, 7, 8], 3) == 62
    ok(4, '补 1 个 0：5+14+27=46，B（不补得 54）')

def q5():
    R = random.Random(5); cnt = 0
    def gen(n):
        if n == 0: return None
        a = R.randint(0, n - 1); return [gen(a), gen(n - 1 - a)]
    for _ in range(3000):
        t = gen(R.randint(2, 12)); order = []; par = {}
        def post(x, p, side):
            if x is None: return
            post(x[0], x, 0); post(x[1], x, 1); order.append(id(x)); par[id(x)] = (p, side)
        post(t, None, 0)
        def walk(x):
            nonlocal cnt
            if x is None: return
            if x[0] is None and x[1] is None:
                p, side = par[id(x)]
                if p is not None and side == 1 and p[0] is not None:      # 叶子 X 且有左兄弟
                    i = order.index(id(x)); assert order[i + 1] == id(p) and order[i - 1] == id(p[0]); cnt += 1
            walk(x[0]); walk(x[1])
        walk(t)
    assert cnt > 1000
    ok(5, '随机树 %d 例：有左兄弟的叶子，后序后继恒为父结点，A' % cnt)

def bst_ins(t, k):
    if t is None: return (k, None, None)
    return (t[0], bst_ins(t[1], k), t[2]) if k < t[0] else (t[0], t[1], bst_ins(t[2], k))
def bst_del(t, k):
    if k < t[0]: return (t[0], bst_del(t[1], k), t[2])
    if k > t[0]: return (t[0], t[1], bst_del(t[2], k))
    if t[1] is None: return t[2]
    if t[2] is None: return t[1]
    m = t[2]
    while m[1]: m = m[1]
    return (m[0], t[1], bst_del(t[2], m[0]))
def leaf(t, k):
    while t[0] != k: t = t[1] if k < t[0] else t[2]
    return t[1] is None and t[2] is None

def q6():
    for n in range(1, 7):
        for perm in itertools.permutations(range(n)):
            t = None
            for k in perm: t = bst_ins(t, k)
            for v in range(n):
                t2 = bst_del(t, v); t3 = bst_ins(t2, v)
                assert (t3 == t) == leaf(t, v)
    ok(6, '穷举 n≤6 全部 BST：删叶再插相同，删非叶再插必不同 ⟹ Ⅱ、Ⅲ，C')

def q7():
    A = [[0, 1, 0, 1], [0, 0, 1, 1], [0, 1, 0, 0], [1, 0, 0, 0]]
    deg = [sum(A[i]) + sum(r[i] for r in A) for i in range(4)]
    assert deg == [3, 4, 2, 3] and [sum(r) for r in A] == [2, 2, 1, 1]
    und = [sum(1 for j in range(4) if A[i][j] or A[j][i]) for i in range(4)]
    assert und == [2, 3, 1, 2]
    ok(7, '有向图 度＝行和＋列和 ⟹ 3,4,2,3，C')

G8 = {}
for e in 'ab ae ah bc bd cd ch ef eg'.split():
    G8.setdefault(e[0], set()).add(e[1]); G8.setdefault(e[1], set()).add(e[0])
def is_bfs(seq):
    seen = {seq[0]}; q = deque([seq[0]]); i = 1
    while q:
        u = q.popleft(); new = G8[u] - seen
        blk = seq[i:i + len(new)]
        if set(blk) != new: return False
        for v in blk: seen.add(v); q.append(v)
        i += len(new)
    return i == len(seq)

def q8():
    r = {k: is_bfs(v.split(',')) for k, v in dict(A='h,c,a,b,d,e,g,f', B='e,a,f,g,b,h,c,d', C='d,b,c,a,h,e,f,g', D='a,b,c,d,h,e,f,g').items()}
    assert r == dict(A=True, B=True, C=True, D=False)
    assert is_bfs('a,e,h,b,g,f,c,d'.split(','))
    ok(8, 'A、B、C 是 BFS 序列，D 不是，D')

def q9():
    E = dict(a=(1, 2, 3), b=(1, 3, 8), c=(2, 4, 9), d=(3, 2, 4), e=(2, 5, 6), f=(3, 5, 10), g=(4, 6, 6), h=(5, 6, 9))
    def paths(E):
        out = []
        def go(u, p, L):
            if u == 6: out.append((L, p)); return
            for k, (x, y, w) in E.items():
                if x == u: go(y, p + k, L + w)
        go(1, '', 0); return out
    P = paths(E); T = max(l for l, _ in P)
    assert T == 27 and sorted(p for l, p in P if l == T) == ['bdcg', 'bdeh', 'bfh']
    def shorter(acts):
        E2 = {k: (x, y, w - (1 if k in acts else 0)) for k, (x, y, w) in E.items()}
        return max(l for l, _ in paths(E2)) < T
    assert [shorter(s) for s in ('ce', 'dc', 'fd', 'fh')] == [False, False, True, False]
    assert [k for k in E if shorter(k)] == ['b']
    E2 = dict(E); E2['f'] = (3, 5, 8); E2['d'] = (3, 2, 2)
    assert max(l for l, _ in paths(E2)) == 25
    ok(9, '工期 27，关键路径 bdcg/bdeh/bfh，只有 f+d 全覆盖，C')

def q10():
    m = 5; lo = math.ceil(m / 2) - 1
    assert 1 + 2 * lo == 5 and (m - 1) + m * (m - 1) == 24 and 1 + 2 * lo + 2 * (lo + 1) * lo == 17
    ok(10, '根 1 个 + 2 个孩子各 2 个 = 5，A')

def q11():
    a = [110, 119, 7, 911, 114, 120, 122]
    p1 = sorted(a, key=lambda x: x % 10); p2 = sorted(p1, key=lambda x: x // 10 % 10); p3 = sorted(p2, key=lambda x: x // 100)
    assert p1 == [110, 120, 911, 122, 114, 7, 119] and p2 == [7, 110, 911, 114, 119, 120, 122]
    assert p3 == [7, 110, 114, 119, 120, 122, 911] and sorted(a, key=lambda x: x // 100) == [7, 110, 119, 114, 120, 122, 911]
    ok(11, '第二趟（十位）后 007,110,911,114,119,120,122，C')

# ───────── 组成原理 ─────────
def q12():
    cpi = .5 * 2 + .2 * 3 + .1 * 4 + .2 * 5
    assert abs(cpi - 3) < 1e-9 and round(1200 / cpi) == 400 and round(1200 / 2.5) == 480
    assert abs(2e9 * cpi / 1.2e9 - 5) < 1e-9
    ok(12, '平均 CPI=3，1200/3=400 MIPS，C')

def q13():
    v = struct.unpack('>f', bytes.fromhex('C6400000'))[0]
    assert v == -1.5 * 2 ** 13 == -12288 and struct.unpack('>f', bytes.fromhex('C6800000'))[0] == -2.0 ** 14
    ok(13, 'C6400000H = −1.5×2^13，A')

def s8(b): return b - 256 if b & 0x80 else b
def q14():
    x, y = 0b11110100, 0b10110000
    assert s8(x) == -12 and s8(y) == -80
    x2 = (x << 1) & 0xFF; y2 = (y >> 1) | 0x80
    assert x2 == 0b11101000 and y2 == 0b11011000 and s8(x2) == -24 and s8(y2) == -40
    z = (x2 + y2) & 0xFF
    assert z == 0b11000000 and s8(z) == -64 == 2 * s8(x) + s8(y) // 2
    assert (x2 + (y >> 1)) & 0xFF == 0b01000000                    # 误做逻辑右移
    assert (-24 - 64) & 0xFF == 0b10101000 and ((0b10110000 << 1) & 0xFF) == 0b01100000
    ok(14, 'z = −24 + (−40) = −64 = 1 1000000，无溢出，A')

def q15():
    def k(n, r=1):
        while 2 ** r < n + r + 1: r += 1
        return r
    assert k(8) == 4 and k(4) == 3 and k(16) == 5 and k(32) == 6 and max(n for n in range(1, 40) if k(n) == 4) == 11
    ok(15, '2^k ≥ 8+k+1 ⟹ k=4，C')

def q16():
    tlb = [(0, 0xFF180, 0x0002), (1, 0x3FFF1, 0x0035), (0, 0x02FF3, 0x0351), (1, 0x03FFF, 0x0153)]
    def tr(va):
        for v, tag, f in tlb:
            if v and tag == va >> 12: return (f << 12) | (va & 0xFFF)
        return None
    assert tr(0x03FFF180) == 0x0153180 and 0x0153180 < 2 ** 28 and tr(0x02FF3ABC) is None
    ok(16, '虚页号 03FFFH 命中第 4 项 ⟹ 015 3180H，A')

def q17():
    mem = {0x1000: 0x2000, 0x2000: 0x3000, 0x3000: 0x4000}; R, A = 0x1000, 0x2000
    assert mem[R + A] == 0x4000 and mem[A] == 0x3000 and mem[mem[A]] == 0x4000 and mem[R] == 0x2000 and mem[R + 0x1000] == 0x3000
    ok(17, 'EA=3000H，操作数 (3000H)=4000H，D')

def q18():
    t = (4 + 100 - 1) / 1.03e9
    assert abs(t - 100e-9) < 1e-15 and abs(100 / t - 1e9) < 1
    assert abs(4000 / 1003 - 3.99) < .01 and abs(100 / (113 / 1.03e9) / 1e9 - 0.91) < .005
    ok(18, '103 个周期 = 100ns ⟹ 1.0×10^9 条/秒，C')

def q21():
    half = 60e3 / 10000 / 2; tr = 4e3 / 20e6 * 1e3
    assert half == 3 and abs(tr - 0.2) < 1e-12 and abs(6 + half + tr + 0.2 - 9.4) < 1e-9
    ok(21, '6 + 3 + 0.2 + 0.2 = 9.4 ms，B')

# ───────── 操作系统 ─────────
def buf_single(n, T, M, C):
    t = 0; free = 0                         # free：用户区分析完的时刻
    for _ in range(n):
        t += T                              # 读入（上一块传走后立即开始）
        t = max(t, free) + M                # 传送要等两边
        free = t + C
    return free
def buf_double(n, T, M, C):
    free = 0
    for i in range(1, n + 1): free = max(i * T, free) + M + C
    return free

def q27():
    assert buf_single(2, 100, 5, 90) == 300 and buf_double(2, 100, 5, 90) == 295 and buf_single(2, 100, 5, 120) == 350
    for n in range(1, 9): assert buf_single(n, 100, 5, 90) == n * 105 + 90 and buf_double(n, 100, 5, 90) == n * 100 + 95
    ok(27, '单缓冲 2 块：2×105+90 = 300，C')

def q26():
    assert (10 + 1024 // 4) * 1 == 266 and (10 + 2048 // 4) * 2 == 1044
    ok(26, '最大长度式中无 inode 总数，A（变式 266KB / 1044KB）')

# ───────── 计算机网络 ─────────
def q34():
    half = 'LH LH HL HL LH HL HL LH'.split()
    assert ''.join('0' if h == 'LH' else '1' for h in half) == '00110110'
    assert ''.join('1' if h == 'LH' else '0' for h in half) == '11001001'
    diff = ''.join('0' if half[i][0] != half[i - 1][1] else '1' for i in range(1, 8))
    assert diff == '0101101'
    ok(34, '低→高记 0 读出 0011 0110，A')

def q35():
    def pkt(nbits, size, rate, k): return (math.ceil(nbits / size) + k - 1) * size / rate * 1e3
    assert 2 * 8e6 / 10e6 * 1e3 == 1600 and pkt(8e6, 10e3, 10e6, 2) == 801 and pkt(8e6, 10e3, 10e6, 4) == 803
    assert math.ceil(8e6 / 9900) == 809
    ok(35, '报文交换 1600ms，分组交换 801ms，D')

def stuff(s):
    out = ''; c = 0
    for ch in s:
        out += ch; c = c + 1 if ch == '1' else 0
        if c == 5: out += '0'; c = 0
    return out
def unstuff(s):
    out = ''; c = 0; i = 0
    while i < len(s):
        out += s[i]; c = c + 1 if s[i] == '1' else 0
        if c == 5: i += 1; c = 0
        i += 1
    return out

def q37():
    r = stuff('0111110001111110')
    assert r == '011111000011111010' and unstuff(r) == '0111110001111110'
    assert unstuff('0111110110') == '011111110' and stuff('0110111111111100') == '011011111011111000'
    ok(37, '填充后 01111100 00111110 10，A')

def q38():
    assert abs(48 / 100e6 * 1e6 - 0.48) < 1e-9 and abs(512 / 100e6 * 1e6 - 5.12) < 1e-9 and abs(1518 * 8 / 100e6 * 1e6 - 121.44) < 1e-9
    ok(38, '48b ÷ 100Mb/s = 0.48μs，A')

def q39():
    seq, ack, n = 1913, 2046, 100
    assert (ack, seq + n) == (2046, 2013)
    ok(39, 'seq=2046，ack=1913+100=2013，B')

# ───────── 综合题 ─────────
def q41():
    exe = os.path.join(tempfile.mkdtemp(), 'q41')
    subprocess.run(['gcc', '-Wall', '-Werror', '-O2', '-o', exe, os.path.join(HERE, '2013_q41.c')], check=True)
    out = subprocess.run([exe], capture_output=True, text=True, check=True).stdout.strip()
    assert out.startswith('OK'), out
    def trace(a):
        c, cnt, cs = a[0], 1, [1]
        for x in a[1:]:
            if x == c: cnt += 1
            elif cnt > 0: cnt -= 1
            else: c, cnt = x, 1
            cs.append(cnt)
        return c, cs
    assert trace([0, 5, 5, 3, 5, 7, 5, 5]) == (5, [1, 0, 1, 0, 1, 0, 1, 2]) and trace([0, 5, 5, 3, 5, 1, 5, 7]) == (5, [1, 0, 1, 0, 1, 0, 1, 0])
    ok(41, 'gcc 编译；计数法、抵消法与暴力解对拍：' + out)

def q42():
    p = dict(do=.35, **{'for': .15}, repeat=.15); p['while'] = .35
    keys = sorted(p)
    assert keys == ['do', 'for', 'repeat', 'while']
    def bs(lo, hi, d):                     # 折半判定树 ASL
        if lo > hi: return 0
        m = (lo + hi) // 2
        return p[keys[m]] * d + bs(lo, m - 1, d + 1) + bs(m + 1, hi, d + 1)
    assert abs(bs(0, 3, 1) - 2.2) < 1e-9
    seq = sum((i + 1) * q for i, q in enumerate(sorted(p.values(), reverse=True)))
    assert abs(seq - 2.1) < 1e-9
    def best(lo, hi, d):                   # 枚举全部 BST
        if lo > hi: return [(0, None)]
        out = []
        for r in range(lo, hi + 1):
            for a, ta in best(lo, r - 1, d + 1):
                for b, tb in best(r + 1, hi, d + 1): out.append((p[keys[r]] * d + a + b, (keys[r], ta, tb)))
        return out
    allt = best(0, 3, 1); mn = min(a for a, _ in allt)
    assert len(allt) == 14 and abs(mn - 2.0) < 1e-9
    opt = [t for a, t in allt if abs(a - mn) < 1e-9]
    assert ('for', ('do', None, None), ('while', ('repeat', None, None), None)) in opt and ('repeat', ('do', None, ('for', None, None)), ('while', None, None)) in opt and len(opt) == 2
    assert abs(.35 + .3 + .45 + 1.4 - 2.5) < 1e-9
    q = [.1, .4, .4, .1]
    assert abs(q[1] * 1 + q[0] * 2 + q[2] * 2 + q[3] * 3 - 1.7) < 1e-9 and abs(.4 + .8 + .3 + .4 - 1.9) < 1e-9
    ok(42, '折半 2.2；降序顺序查找 2.1；最优 BST（14 棵中 2 棵）2.0')

def burst(banks, cyc, words, bus):         # 交叉存储器一次突发读的时间（ns），事件模拟
    gap = cyc / banks; ready = [bus + i * gap + cyc if i < banks else None for i in range(words)]
    for i in range(banks, words): ready[i] = ready[i - banks] + max(cyc, gap * banks)
    t = bus
    for i in range(words): t = max(t, ready[i]) + bus
    return t

def q43():
    tc, tb = 1e9 / 800e6, 1e9 / 200e6
    assert (tc, tb) == (1.25, 5.0) and 4 * 200 == 800 and 32 // 32 == 1
    assert burst(8, 40, 8, 5) == 85 and burst(4, 40, 8, 5) == 120
    assert abs(100 * (4 * tc + 1.2 * .05 * 85) - 1010) < 1e-9 and abs(100 * (5 + 1.2 * .02 * 85) - 704) < 1e-9 and 8 * (5 + 40 + 5) == 400
    ok(43, '1.25ns / 5ns / 800MB/s；1 次；85ns；1010ns')

def q44():
    def nxt(pc, ins, CF, ZF, NF):
        C, Z, N = (ins >> 10) & 1, (ins >> 9) & 1, (ins >> 8) & 1; off = s8(ins & 0xFF)
        return (pc + 2 + 2 * off) & 0xFFFF if (C and CF) or (Z and ZF) or (N and NF) else pc + 2
    ins = int('0000001111100011', 2)
    assert nxt(0x200C, ins, 0, 0, 1) == 0x1FD4 and nxt(0x200C, ins, 1, 0, 0) == 0x200E
    assert (0x200E + 0xFFC6) & 0xFFFF == 0x1FD4 and s8(0xE3) == -29
    assert (2 - 2 * 128) // 2 == -127 and (2 + 2 * 127) // 2 == 128
    for a in range(256):                   # 无符号 a ≤ b ⟺ CF=1 或 ZF=1
        for b in range(256):
            CF = a < b; ZF = a == b; NF = ((a - b) & 0x80) != 0
            assert (a <= b) == (CF or ZF)
    assert ((200 - 10) & 0x80) != 0        # NF=1 但并非小于
    assert nxt(0x2000, int('0000010000000101', 2), 1, 0, 0) == 0x200C
    ok(44, '按字节编址，向后 127 条；1FD4H / 200EH；C=Z=1、N=0')

def q45():
    R = random.Random(45)
    for _ in range(300):                   # 随机调度模拟：容量 3、门 1
        cap = 3; empty = cap; mutex = 1; N = 8; pc = [0] * N; inside = 0; door = 0; steps = 0
        while any(x < 9 for x in pc):
            run = [i for i in range(N) if pc[i] < 9 and not (pc[i] == 0 and empty == 0) and not (pc[i] in (1, 5) and mutex == 0)]
            assert run, '死锁'
            i = R.choice(run); s = pc[i]
            if s == 0: empty -= 1
            elif s in (1, 5): mutex -= 1; door += 1; assert door == 1
            elif s == 2: inside += 1; assert inside <= cap
            elif s in (3, 7): mutex += 1; door -= 1
            elif s == 6: inside -= 1
            elif s == 8: empty += 1
            pc[i] += 1; steps += 1
        assert empty == cap and mutex == 1 and inside == 0
    ok(45, '随机调度 300 轮：馆内人数不超上限、门互斥、无死锁')

def q46():
    assert 2 ** 12 == 4096 and 2 ** 20 * 4 == 4 * 2 ** 20
    la = 0x00008000; pn = la >> 12
    assert pn == 8 and 0x00200000 + pn * 4 == 0x00200020 and 0x00200000 + (pn + 1) * 4 == 0x00200024
    assert 0x00900000 >> 12 == 0x00900 and (0x00900000 + 0x1000) >> 12 == 0x00901 and 0x00900000 + 4096 == 0x00901000
    f = lambda a: ((a >> 22) & 0x3FF, (a >> 12) & 0x3FF)
    assert f(0x00008000) == (0, 8) and f(0x00408000) == (1, 8)
    ok(46, '4KB / 4MB；页表项 0020 0020H、0020 0024H；页框 00900H、00901H；0090 1000H')

def q47():
    import ipaddress as ip
    N = ip.ip_network
    assert list(ip.collapse_addresses([N('153.14.5.0/25'), N('153.14.5.128/25')])) == [N('153.14.5.0/24')]
    sup = N('194.17.20.0/23')
    assert N('194.17.20.0/25').subnet_of(sup) and N('194.17.21.0/24').subnet_of(sup) and N('194.17.20.128/25').subnet_of(sup)
    assert not N('194.17.20.0/25').subnet_of(N('194.17.21.0/24').supernet(new_prefix=24)) and N('194.17.20.0/25').supernet(new_prefix=23) == N('194.17.21.0/24').supernet(new_prefix=23) == sup
    tbl = [(N('153.14.5.0/24'), 'S0'), (sup, 'S1'), (N('194.17.20.128/25'), 'E0')]
    def fwd(a): return max(((n.prefixlen, i) for n, i in tbl if ip.ip_address(a) in n))[1]
    assert fwd('194.17.20.200') == 'E0' and fwd('194.17.21.200') == 'S1' and fwd('194.17.20.5') == 'S1' and fwd('153.14.5.200') == 'S0'
    ok(47, '3 项：/24→S0、/23→S1、/25→E0；194.17.20.200 走 E0；BGP over TCP')

def concept():
    for n, a in ((19, 'B'), (20, 'B'), (22, 'D'), (23, 'A'), (24, 'A'), (25, 'C'), (28, 'B'), (29, 'D'), (30, 'B'), (31, 'B'), (32, 'B'), (33, 'B'), (36, 'B'), (40, 'A')):
        OK.append(n)
    print('·  概念题 19 20 22 23 24 25 28 29 30 31 32 33 36 40：无可计算内容，答案由构建时与卷面答案核对')

if __name__ == '__main__':
    for f in (q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18, q21, q26, q27, q34, q35, q37, q38, q39, q41, q42, q43, q44, q45, q46, q47, concept): f()
    miss = sorted(set(range(1, 48)) - set(OK))
    assert not miss, miss
    print('\n2013：47 题全部通过（其中程序复算 %d 题）' % (47 - 14))
