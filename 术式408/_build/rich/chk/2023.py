#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2023 408 套卷精解 · 独立复算。每题一个函数，assert 失败即报错；最后打印汇总。
跑法：python3 _build/rich/chk/2023.py   （第 41 题需要 gcc）"""
import heapq, itertools, os, random, struct, subprocess, sys, tempfile, math
from fractions import Fraction as Fr
OK = []
def ok(n, msg): OK.append(n); print('✓ %2d  %s' % (n, msg))

# ───────── 数据结构 ─────────
def q2():
    # 结点用 dict 模拟，先执行题干两句，再执行四个选项，看哪一个得到正确的双链表
    def run(opt):
        P = {'n': 'p'}; R = {'n': 'r'}; S = {'n': 's'}
        P['next'] = R; R['prev'] = P; S['next'] = S['prev'] = None
        p, s = P, S
        s['next'] = p['next']; p['next'] = s
        if opt == 'A': s['next']['prev'] = p; s['prev'] = p
        if opt == 'B': p['next']['prev'] = s; s['prev'] = p
        if opt == 'C': s['prev'] = s['next']['prev']; s['next']['prev'] = s
        if opt == 'D': p['next']['prev'] = s['prev']; s['next']['prev'] = p
        return P['next'] is S and S['prev'] is P and S['next'] is R and R['prev'] is S
    res = {o: run(o) for o in 'ABCD'}
    assert res == {'A': False, 'B': False, 'C': True, 'D': False}, res
    ok(2, '双链表四个选项逐个执行，只有 C 正确')

def huff_depths(w):
    h = [(x, i, None) for i, x in enumerate(w)]; heapq.heapify(h); cnt = len(w); par = {}
    while len(h) > 1:
        a = heapq.heappop(h); b = heapq.heappop(h)
        par[a[1]] = cnt; par[b[1]] = cnt
        heapq.heappush(h, (a[0] + b[0], cnt, None)); cnt += 1
    def dep(i):
        d = 0
        while i in par: i = par[i]; d += 1
        return d
    return [dep(i) for i in range(len(w))]
def q4():
    w = [3, 4, 5, 6, 8, 10]; d = huff_depths(w)
    wpl = sum(a * b for a, b in zip(w, d))
    assert d == [3, 3, 3, 3, 2, 2] and wpl == 90 and Fr(wpl, sum(w)) == Fr(5, 2)
    # WPL = 非叶结点权之和：合并顺序 3+4=7, 5+6=11, 7+8=15, 10+11=21, 15+21=36
    h = list(w); heapq.heapify(h); inner = []
    while len(h) > 1:
        a = heapq.heappop(h); b = heapq.heappop(h); inner.append(a + b); heapq.heappush(h, a + b)
    assert inner == [7, 11, 15, 21, 36] and sum(inner) == 90
    ok(4, '哈夫曼码长 %s，WPL=90，平均 2.5' % d)

def q5():
    # 树形：根 X，左孩子 L（L 的左孩子 LL，LL 有左孩子 LLL；L 的右孩子 LR），右孩子 R
    shape = ('X', ('L', ('LL', ('LLL',), None), ('LR',)), ('R',))
    def post(t):
        if not t: return []
        return post(t[1] if len(t) > 1 else None) + post(t[2] if len(t) > 2 else None) + [t[0]]
    def pre(t):
        if not t: return []
        return [t[0]] + pre(t[1] if len(t) > 1 else None) + pre(t[2] if len(t) > 2 else None)
    slots = post(shape); lab = dict(zip(slots, 'fdbeca'))
    ans = ''.join(lab[x] for x in pre(shape))
    assert ans == 'aedfbc'
    ok(5, '按树形填后序 fdbeca，先序 = %s' % ans)

def q6():
    # 三角形反例：MST 可能不是最短路径树；BFS 在单位权图上与 Dijkstra 对拍
    random.seed(6)
    for _ in range(300):
        n = random.randint(2, 9)
        E = set()
        for v in range(1, n): E.add((random.randrange(v), v))
        for _ in range(random.randint(0, n * 2)):
            a, b = random.sample(range(n), 2); E.add((min(a, b), max(a, b)))
        adj = {v: [] for v in range(n)}
        for a, b in E: adj[a].append(b); adj[b].append(a)
        dist = {0: 0}; Q = [0]
        for u in Q:
            for v in adj[u]:
                if v not in dist: dist[v] = dist[u] + 1; Q.append(v)
        # Floyd 对拍
        INF = 99; D = [[0 if i == j else INF for j in range(n)] for i in range(n)]
        for a, b in E: D[a][b] = D[b][a] = 1
        for k in range(n):
            for i in range(n):
                for j in range(n): D[i][j] = min(D[i][j], D[i][k] + D[k][j])
        assert all(dist[v] == D[0][v] for v in range(n))
    ok(6, 'BFS 层数 = 单位权最短路（300 张随机图对拍）；三角形 MST 中 a→c 要 2 步')

def q8():
    n = 600; h = math.ceil(math.log2(n + 1))
    # 实测折半查找最大比较次数
    def cmp_cnt(k):
        lo, hi, c = 0, n - 1, 0
        while lo <= hi:
            mid = (lo + hi) // 2; c += 1
            if mid == k: return c
            if mid < k: lo = mid + 1
            else: hi = mid - 1
        return c
    mx = max(max(cmp_cnt(k) for k in range(n)), max(cmp_cnt(k + 0.5) for k in range(-1, n)))
    assert h == 10 and mx == 10
    ok(8, '⌈log₂601⌉ = 10，实测最多 10 次')

def q9():
    m = 5; H = lambda k: (k + 4) % 5
    T = [None] * m
    for k in (2022, 12, 25):
        a = H(k)
        while T[a] is not None: a = (a + 1) % m
        T[a] = k
    assert T == [None, 2022, 12, None, 25]
    T[4] = 'DEL'
    def fail(a):
        c = 1
        while T[a] is not None: a = (a + 1) % m; c += 1
        return c
    f = [fail(a) for a in range(m)]
    assert f == [1, 3, 2, 1, 2] and Fr(sum(f), 5) == Fr(9, 5)
    T[4] = None
    assert sum(fail(a) for a in range(m)) == 8   # 物理删除 ⟹ 1.6（选项 B）
    ok(9, '失败代价 %s ⟹ 1.8；物理删除会得 1.6' % f)

def q10():
    # 各排序带稳定性测试：记录 (key, 原序)，排完看相同 key 是否保持原序
    def shell(a):
        a = a[:]; n = len(a); d = n // 2
        while d:
            for i in range(d, n):
                x = a[i]; j = i
                while j >= d and a[j - d][0] > x[0]: a[j] = a[j - d]; j -= d
                a[j] = x
            d //= 2
        return a
    def quick(a):
        a = a[:]
        def part(lo, hi):
            p = a[lo]
            while lo < hi:
                while lo < hi and a[hi][0] >= p[0]: hi -= 1
                a[lo] = a[hi]
                while lo < hi and a[lo][0] <= p[0]: lo += 1
                a[hi] = a[lo]
            a[lo] = p; return lo
        def qs(lo, hi):
            if lo < hi: m = part(lo, hi); qs(lo, m - 1); qs(m + 1, hi)
        qs(0, len(a) - 1); return a
    def heap(a):
        a = a[:]; n = len(a)
        def sift(i, n):
            while 2 * i + 1 < n:
                c = 2 * i + 1
                if c + 1 < n and a[c + 1][0] > a[c][0]: c += 1
                if a[c][0] > a[i][0]: a[c], a[i] = a[i], a[c]; i = c
                else: break
        for i in range(n // 2 - 1, -1, -1): sift(i, n)
        for e in range(n - 1, 0, -1): a[0], a[e] = a[e], a[0]; sift(0, e)
        return a
    def merge(a):
        if len(a) <= 1: return a[:]
        m = len(a) // 2; L, R = merge(a[:m]), merge(a[m:]); o = []; i = j = 0
        while i < len(L) and j < len(R):
            if L[i][0] <= R[j][0]: o.append(L[i]); i += 1
            else: o.append(R[j]); j += 1
        return o + L[i:] + R[j:]
    def radix(a):
        for d in range(2):
            B = [[] for _ in range(10)]
            for x in a: B[x[0] // 10 ** d % 10].append(x)
            a = [x for b in B for x in b]
        return a
    random.seed(10); unstable = set()
    for _ in range(2000):
        a = [(random.randint(0, 5), i) for i in range(random.randint(2, 9))]
        for nm, f in (('shell', shell), ('quick', quick), ('heap', heap), ('merge', merge), ('radix', radix)):
            r = f(a)
            assert [x[0] for x in r] == sorted(x[0] for x in a)
            if any(r[i][0] == r[i + 1][0] and r[i][1] > r[i + 1][1] for i in range(len(r) - 1)): unstable.add(nm)
    assert unstable == {'shell', 'quick', 'heap'}, unstable
    assert [x[1] for x in quick([(3, 0), (2, 1), (2, 2)])] == [2, 1, 0]
    ok(10, '2000 组随机数据：不稳定的恰是 希尔、快排、堆')

def q11():
    a = [68, 11, 70, 23, 80, 77, 48, 81, 93, 88]; s = sorted(a)
    same = [a[i] for i in range(10) if a[i] == s[i]]
    piv = [a[i] for i in range(10) if all(x < a[i] for x in a[:i]) and all(x > a[i] for x in a[i + 1:])]
    assert same == [77, 81] and piv == [81]
    ok(11, '同位置候选 %s，满足左小右大的只有 %s' % (same, piv))

def q42():
    keys = [51, 94, 37, 92, 14, 63, 15, 99, 48, 56, 23, 60, 31, 17, 43, 8, 90, 166, 100]
    def rs(keys, m):
        fi = list(keys); wa = [fi.pop(0) for _ in range(min(m, len(fi)))]
        runs = []; cur = []; last = None; frozen = set()
        while wa:
            cand = [x for x in wa if last is None or x >= last]
            if not cand:  # 封段
                runs.append(cur); cur = []; last = None; continue
            x = min(cand); wa.remove(x); cur.append(x); last = x
            if fi: wa.append(fi.pop(0))
        if cur: runs.append(cur)
        return runs
    r = rs(keys, 4)
    assert r == [[37, 51, 63, 92, 94, 99], [14, 15, 23, 31, 48, 56, 60, 90, 166], [8, 17, 43, 100]], r
    # 第 2 问：第一段长度的范围 [m, n]，随机 + 构造验证
    random.seed(42)
    for _ in range(3000):
        n = random.randint(8, 30); m = random.randint(1, n - 1)
        a = random.sample(range(1000), n)
        L = len(rs(a, m)[0]); assert m <= L <= n
    n, m = 20, 4
    assert len(rs(list(range(n)), m)[0]) == n
    assert len(rs([100, 101, 102, 103] + list(range(16)), m)[0]) == m
    ok(42, '置换-选择得 3 段（6/9/4）；3000 组随机：第一段长 ∈ [m, n]，两端都能取到')

# ───────── 组成原理 ─────────
def q12():
    ips = Fr(15, 10) * 10 ** 9 / Fr(12, 10); t = Fr(5 * 10 ** 5) * Fr(12, 10) / (Fr(15, 10) * 10 ** 9)
    assert ips == Fr(125, 100) * 10 ** 9 and t == Fr(4, 10000)
    ok(12, '1.25 GIPS，0.4 ms')

def q13():
    assert (-8190) & 0xFFFF == 0xE002 and 65536 - 8190 == 0xE002
    assert (~8190) & 0xFFFF == 0xE001 and (0x8000 | 8190) == 0x9FFE
    ok(13, '−8190 补码 E002H；反码 E001H，原码 9FFEH')

def q14():
    v = struct.unpack('>f', bytes.fromhex('80200000'))[0]
    assert v == -2.0 ** -128
    ok(14, '8020 0000H = −2^-128 = %r' % v)

def q15():
    top = 2 ** 30 - 1; rom = 2 ** 28
    assert (top - rom + 1, top) == (0x30000000, 0x3FFFFFFF)
    ok(15, 'ROM 3000 0000H ~ 3FFF FFFFH')

def q16():
    M = 2 ** 32
    def flags(x, y):
        ux, uy = x % M, y % M
        cf = 1 if ux < uy else 0
        r = x - y; of = 0 if -2 ** 31 <= r < 2 ** 31 else 1
        return of, cf
    assert flags(100, 200) == (0, 1) and flags(10, -20) == (0, 1)
    ok(16, '100−200 与 10−(−20) 都是 OF=0, CF=1')

def q19():
    # 五段流水线：转发；load-use 停 1 拍；beq 在 MEM 段末才把目标写 PC ⟹ 后继取指在 beq 的 MEM 之后
    ins = [('add', 's2', ['s1', 's0']), ('load', 's3', ['s2']), ('beq', None, ['t2', 's3']), ('addi', 't2', ['t2'])]
    IF = {}; EX = {}; stall = set(); last_if = 0; prev_beq_mem = None
    for k, (op, rd, rs) in enumerate(ins):
        t_if = last_if + 1
        if prev_beq_mem is not None and t_if <= prev_beq_mem: t_if = prev_beq_mem + 1; stall.add(k)
        t_ex = t_if + 2
        for j in range(k):
            if ins[j][1] in rs:
                need = EX[j] + (2 if ins[j][0] == 'load' else 1)   # load 的结果 MEM 段末才有
                if t_ex < need: t_ex = need; stall.add(k)
        if k and t_ex <= EX[k - 1]: t_ex = EX[k - 1] + 1
        IF[k] = t_if; EX[k] = t_ex; last_if = t_if
        if t_ex > t_if + 2: last_if = t_ex - 2   # ID 被卡住，后面的取指也跟着停
        prev_beq_mem = t_ex + 1 if op == 'beq' else None
    assert stall == {2, 3}, stall
    assert EX == {0: 3, 1: 4, 2: 6, 3: 10} and IF[3] == 8
    ok(19, '阻塞的是 I3（load-use 1 拍）与 I4（等 beq 的 MEM，第 8 拍才取指）')

def q20():
    t = 4 * (1 + 6 + 1)
    assert t == 32
    ok(20, '4 × (1+6+1) = 32 ns')

def q43():
    base = 0x00422000; size = 24 * 64 * 4
    pages = sorted({(base + off) >> 12 for off in range(0, size, 4)})
    assert size == 6144 and pages == [0x422, 0x423]
    a10 = base + (1 * 64 + 0) * 4; grp = (a10 >> 5) & 63
    assert a10 == 0x00422100 and grp == 8
    def hit(order):
        sets = [[] for _ in range(64)]; h = n = 0
        for i, j in order:
            ad = base + (i * 64 + j) * 4; blk = ad >> 5; s = sets[blk & 63]; n += 1
            if blk in s: h += 1; s.remove(blk); s.append(blk)
            else:
                if len(s) == 4: s.pop(0)
                s.append(blk)
        return Fr(h, n)
    r = hit([(i, j) for i in range(24) for j in range(64)])
    c = hit([(i, j) for j in range(64) for i in range(24)])
    assert r == c == Fr(7, 8) and size // 32 == 192
    # 变式：40 行时按列访问每组要放 5 块 > 4 路 ⟹ LRU 下全部失效
    def hit2(rows):
        sets = [[] for _ in range(64)]; h = n = 0
        for j in range(64):
            for i in range(rows):
                blk = (base + (i * 64 + j) * 4) >> 5; s = sets[blk & 63]; n += 1
                if blk in s: h += 1; s.remove(blk); s.append(blk)
                else:
                    if len(s) == 4: s.pop(0)
                    s.append(blk)
        return Fr(h, n)
    assert hit2(32) == Fr(7, 8) and hit2(40) == 0
    ok(43, '2 页、组号 8、192 块；按行 = 按列 = 7/8（LRU 模拟）；40 行时按列掉到 0')

def q44():
    a19 = 0x004010AE; code = 'C7 84 82 00 20 42 00 0A 00 00 00'.split()
    assert len(code) == 11 and a19 + 11 == 0x004010B9
    assert 0x00401079 + 2 + 0x09 == 0x00401084 and 0x00401088 + 2 + 0x32 == 0x004010BC
    assert bytes.fromhex(''.join(code[3:7]))[::-1].hex() == '00422000'   # 小端：倒过来读
    assert 64 * 4 == 256
    assert {x >> 12 for x in (0x00401072, 0x004010B9)} == {0x401}
    ok(44, '第 20 条 0040 10B9H；偏移 09H/32H 吻合相对寻址；小端；同页 00401H')

# ───────── 操作系统 ─────────
def q25():
    assert (16 * 2 ** 30 // (4 * 2 ** 10)) // 8 == 512 * 2 ** 10
    ok(25, '2^22 页框 ⟹ 2^19 B = 512 KB')

def q29():
    P = {1: (0, 1, 60), 2: (20, 10, 42), 3: (30, 100, 13)}
    rem = {k: v[2] for k, v in P.items()}; t = 0; fin = {}; gantt = []
    while rem:
        rdy = [k for k in rem if P[k][0] <= t]
        k = max(rdy, key=lambda x: P[x][1])
        if not gantt or gantt[-1][0] != k: gantt.append([k, t, t])
        rem[k] -= 1; t += 1; gantt[-1][2] = t
        if rem[k] == 0: del rem[k]; fin[k] = t
    tt = {k: fin[k] - P[k][0] for k in P}
    assert [tuple(g) for g in gantt] == [(1, 0, 20), (2, 20, 30), (3, 30, 43), (2, 43, 75), (1, 75, 115)]
    assert tt == {1: 115, 2: 55, 3: 13} and Fr(sum(tt.values()), 3) == 61
    ok(29, '甘特 %s，平均周转 61' % gantt)

def q45():
    # 两个线程的程序（每一行是一个原子步）。共享 lock；各自 key、temp。pc 到 'CS' 表示在临界区。
    def prog(kind):
        if kind == 'buggy_if':     # 原题：if + 原子 swap
            return [('key=T',), ('if',), ('swap',), ('CS',)]
        if kind == 'fixed_atomic':  # while + 原子 swap
            return [('key=T',), ('while',), ('swap', 'loop'), ('CS',)]
        if kind == 'fixed_newSwap':  # while + 三条语句的 newSwap
            return [('key=T',), ('while',), ('temp=key',), ('key=lock',), ('lock=temp', 'loop'), ('CS',)]
    def explore(kind):
        P = prog(kind); start = (0, 0, False, (True, True), (None, None))
        seen = {start}; st = [start]
        while st:
            a, b, lock, key, temp = st.pop()
            if P[a][0] == 'CS' and P[b][0] == 'CS': return True
            for who in (0, 1):
                pc = (a, b)[who]; ins = P[pc]
                if ins[0] == 'CS': continue
                k = list(key); tp = list(temp); lk = lock; npc = pc + 1
                if ins[0] == 'key=T': k[who] = True
                elif ins[0] == 'if': npc = pc + 1 if k[who] else len(P) - 1
                elif ins[0] == 'while': npc = pc + 1 if k[who] else len(P) - 1
                elif ins[0] == 'swap': k[who], lk = lk, k[who]
                elif ins[0] == 'temp=key': tp[who] = k[who]
                elif ins[0] == 'key=lock': k[who] = lk
                elif ins[0] == 'lock=temp': lk = tp[who]
                if len(ins) > 1 and ins[1] == 'loop': npc = 1
                s2 = (npc, b, lk, tuple(k), tuple(tp)) if who == 0 else (a, npc, lk, tuple(k), tuple(tp))
                if s2 not in seen: seen.add(s2); st.append(s2)
        return False
    assert explore('buggy_if') is True       # 只改 TRUE→FALSE 不改 if，仍会同进
    assert explore('fixed_atomic') is False  # 正确写法：穷举所有交错都不会同进
    assert explore('fixed_newSwap') is True  # 换成 newSwap 函数：存在同进的交错
    ok(45, '穷举交错：if 版会同进；while+原子 swap 永不同进；while+newSwap 会同进')

# ───────── 计算机网络 ─────────
def q33():
    m = 1000; r = Fr(1000 * 8, 100 * 10 ** 6); p = Fr(1000, 100 * 10 ** 6)
    # 事件级排程：第 i 个分组在 H1 发完 = (i+1)r；路由器存储转发
    t_router_free = 0; arrive = 0
    for i in range(m):
        at_r = (i + 1) * r + p
        start = max(at_r, t_router_free); t_router_free = start + r
        arrive = t_router_free + p
    assert arrive == Fr(801, 10000)   # 0.0801 s = 80.10 ms
    ok(33, '事件模拟：最后一个分组 80.10 ms 到达 H2')

def q34():
    assert 2 ** (48 // (2 * 4)) == 64
    ok(34, 'log₂V = 6 ⟹ QAM-64')

def q35():
    k = 3; W = {'SW': 1, 'GBN': 2 ** k - 1, 'SR': 2 ** (k - 1)}
    assert W['SW'] <= W['SR'] <= W['GBN']
    ok(35, '窗口 1 ≤ 4 ≤ 7 ⟹ U₁ ≤ U₃ ≤ U₂')

def q36():
    assert (2 ** min(4, 10) - 1) * Fr(512, 10) == 768 and 16 * Fr(512, 10) == Fr(8192, 10)
    ok(36, '(2^4−1)×51.2 = 768 μs')

def q37():
    def rem(bits, g='10011'):
        d = list(map(int, bits)); n = len(g); G = list(map(int, g))
        for i in range(len(d) - n + 1):
            if d[i]:
                for j in range(n): d[i + j] ^= G[j]
        return ''.join(map(str, d[-(n - 1):]))
    assert rem('101110000') == '1100'
    r = {k: rem(v) for k, v in {'A': '101111000', 'B': '101111010', 'C': '101111110', 'D': '101111100'}.items()}
    assert r == {'A': '0100', 'B': '0110', 'C': '0010', 'D': '0000'}, r
    ok(37, 'FCS = 1100；只有 D 余数 0')

def q38():
    import ipaddress
    net = ipaddress.ip_interface('195.123.0.34/30').network
    hosts = [str(h) for h in net.hosts()]
    assert str(net) == '195.123.0.32/30' and hosts == ['195.123.0.33', '195.123.0.34']
    ok(38, '/30 块 .32–.35，可用 .33/.34，R1 占 .34 ⟹ R2 外侧 .33')

def q39():
    import ipaddress
    net = ipaddress.ip_interface('168.16.84.24/20').network; h = list(net.hosts())
    assert (str(h[0]), str(h[-1])) == ('168.16.80.1', '168.16.95.254') and net.num_addresses == 4096
    ok(39, '168.16.80.1 ~ 168.16.95.254')

def q40():
    assert 2 ** 128 // 2 ** 32 == 2 ** 96 != 96
    ok(40, 'IPv6/IPv4 = 2^96 倍')

def q47():
    ISN = 100; first = ISN + 1; last = first + 18000 - 1; fin = last + 1
    assert (first, last, fin, fin + 1) == (101, 18100, 18101, 18102)
    # 逐 ACK 模拟：慢开始每个 ACK +1；cwnd ≥ ssthresh 后每轮 +1（用 cwnd += 1/cwnd 的逐 ACK 写法，按轮取整）
    cwnd = 1; ssth = 4; sent = 0; rounds = []; at = {}
    while sent < 18:
        n = min(cwnd, 18 - sent); rounds.append(n)
        c0 = cwnd
        for i in range(n):
            sent += 1; ack = first + sent * 1000
            if cwnd < ssth: cwnd += 1
            at[ack] = cwnd
        if c0 >= ssth: cwnd = c0 + 1; at[first + sent * 1000] = cwnd
    assert rounds == [1, 2, 4, 5, 6], rounds
    assert at[2101] == 3 and at[7101] == 5
    T = (1 + len(rounds)) * 10   # ms
    assert T == 60 and Fr(18000 * 8, T) * 1000 == 2_400_000
    # 变式：阈值 8
    cwnd = 1; ssth = 8; sent = 0; r2 = []
    while sent < 18:
        n = min(cwnd, 18 - sent); r2.append(n); sent += n
        cwnd = cwnd * 2 if cwnd * 2 <= ssth else (ssth if cwnd < ssth else cwnd + 1)
    assert r2 == [1, 2, 4, 8, 3]
    ok(47, '序号 101/18102；cwnd 在 2101 时 3、7101 时 5；轮次 %s ⟹ 60 ms、2.4 Mb/s' % rounds)

# ───────── 41 题：C 代码编译 + 随机对拍 ─────────
C41 = r'''
#include <stdio.h>
#include <stdlib.h>
#define MAXV 32
typedef struct { int numVertices, numEdges; char VerticesList[MAXV]; int Edge[MAXV][MAXV]; } MGraph;
int printVertices(MGraph G){
    int k, m, indeg, outdeg, count = 0;
    for(k = 0; k < G.numVertices; k++){
        indeg = outdeg = 0;
        for(m = 0; m < G.numVertices; m++){
            if(G.Edge[k][m] != 0) outdeg++;   /* 第 k 行非零元个数 = 出度 */
            if(G.Edge[m][k] != 0) indeg++;    /* 第 k 列非零元个数 = 入度 */
        }
        if(outdeg > indeg){ printf("%c ", G.VerticesList[k]); count++; }
    }
    return count;
}
int main(void){
    int T; if(scanf("%d", &T) != 1) return 1;
    while(T--){
        static MGraph G; int n, i, j; scanf("%d", &n); G.numVertices = n; G.numEdges = 0;
        for(i = 0; i < n; i++) G.VerticesList[i] = 'A' + i;
        for(i = 0; i < n; i++) for(j = 0; j < n; j++){ scanf("%d", &G.Edge[i][j]); if(G.Edge[i][j]) G.numEdges++; }
        int c = printVertices(G); printf("| %d\n", c);
    }
    return 0;
}
'''
def q41():
    d = tempfile.mkdtemp()
    src = os.path.join(d, 'q41.c'); exe = os.path.join(d, 'q41')
    open(src, 'w').write(C41)
    subprocess.run(['gcc', '-std=c99', '-Wall', '-O2', '-o', exe, src], check=True, capture_output=True)
    random.seed(41); cases = []; inp = []
    for _ in range(3000):
        n = random.randint(1, 12); p = random.random()
        M = [[1 if (i != j or random.random() < .2) and random.random() < p else 0 for j in range(n)] for i in range(n)]
        cases.append(M); inp.append(str(n)); inp += [' '.join(map(str, r)) for r in M]
    out = subprocess.run([exe], input='%d\n%s\n' % (len(cases), '\n'.join(inp)), capture_output=True, text=True, check=True).stdout.strip().split('\n')
    for M, line in zip(cases, out):
        n = len(M); want = [chr(65 + k) for k in range(n) if sum(M[k]) > sum(M[i][k] for i in range(n))]
        got, c = line.split('|'); assert got.split() == want and int(c) == len(want), (M, line)
    assert len(out) == len(cases)
    ok(41, 'gcc 编译通过；3000 张随机有向图（含自环）与 Python 对拍零失配')

if __name__ == '__main__':
    for f in [q2, q4, q5, q6, q8, q9, q10, q11, q42, q12, q13, q14, q15, q16, q19, q20, q43, q44, q25, q29, q45,
              q33, q34, q35, q36, q37, q38, q39, q40, q47, q41]:
        f()
    print('\n全部通过：%d 题有程序复算' % len(OK))
