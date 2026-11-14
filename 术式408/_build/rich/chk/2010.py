#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2010 408 套卷精解 · 独立复算。每题一个函数，assert 失败即报错；最后打印汇总。
跑法：python3 _build/rich/chk/2010.py   （第 42 题需要 gcc：从 2010.txt 的卷面里抽出两段代码，套上 2010_q42.c 的测试主程序编译对拍）"""
import itertools, math, os, re, struct, subprocess, sys, tempfile, random
from collections import deque
HERE = os.path.dirname(os.path.abspath(__file__))
OK = []
def ok(n, msg): OK.append(n); print('✓ %2d  %s' % (n, msg))

# ───────── 数据结构 ─────────
def stack_ops(seq, maxrun=None):
    """seq 依次入栈，返回 {出栈序列: 最长连续出栈次数的最小值}"""
    res = {}
    def go(i, st, out, run, mx):
        if i == len(seq) and not st:
            res[out] = min(res.get(out, 99), mx); return
        if i < len(seq): go(i + 1, st + seq[i], out, 0, mx)
        if st: go(i, st[:-1], out + st[-1], run + 1, max(mx, run + 1))
    go(0, '', '', 0, 0); return res

def q1():
    R = stack_ops('abcdef')
    opts = {'A': 'dcebfa', 'B': 'cbdaef', 'C': 'bcaefd', 'D': 'afedcb'}
    for k, v in opts.items():
        assert v in R                                   # 四个都是合法出栈序列
        assert (R[v] >= 3) == (k == 'D'), (k, R[v])
    assert R['afedcb'] == 5 and R['dcebfa'] == 2
    assert [p for p, m in stack_ops('abc').items() if m < 2] == ['abc']
    ok(1, '穷举出栈序列：四个都合法，只有 afedcb 必须连续出栈 5 次，D；限 2 次时 abc 只剩 abc')

def deque_out(seq):
    """两端可入、一端出（全部入完再出）：出队序列＝队内从左读起的排列"""
    res = set()
    def go(i, q):
        if i == len(seq): res.add(''.join(q)); return
        go(i + 1, [seq[i]] + q); go(i + 1, q + [seq[i]])
    go(0, []); return res

def q2():
    R = deque_out('abcde')
    opts = {'A': 'bacde', 'B': 'dbace', 'C': 'dbcae', 'D': 'ecbad'}
    for k, v in opts.items():
        assert (v in R) == (k != 'C'), k
    assert 'cabde' in R
    # 输入受限（一端入、两端出）：全部入完后 a..e 固定，每次从两端之一取
    def inres(t):
        q = deque('abcde')
        for c in t:
            if q and q[0] == c: q.popleft()
            elif q and q[-1] == c: q.pop()
            else: return False
        return True
    assert not inres('dbcae')
    ok(2, '输出受限双端队列穷举 32 种排列：只有 dbcae 不可达，C；cabde 可达；输入受限下 dbcae 也不可达')

def q3():
    # 树：a(左 b(右 d), 右 c)
    L = {'a': 'b', 'b': None, 'c': None, 'd': None}; Rr = {'a': 'c', 'b': 'd', 'c': None, 'd': None}
    def post(x): return [] if x is None else post(L[x]) + post(Rr[x]) + [x]
    seq = post('a'); assert seq == list('dbca')
    th = {}
    for i, x in enumerate(seq):
        if L[x] is None: th[(x, 'L')] = seq[i - 1] if i else None
        if Rr[x] is None: th[(x, 'R')] = seq[i + 1] if i + 1 < len(seq) else None
    assert th == {('b', 'L'): 'd', ('c', 'L'): 'b', ('c', 'R'): 'a', ('d', 'L'): None, ('d', 'R'): 'b'}
    def ino(x): return [] if x is None else ino(L[x]) + [x] + ino(Rr[x])
    def pre(x): return [] if x is None else [x] + pre(L[x]) + pre(Rr[x])
    assert ino('a') == list('bdac') and pre('a') == list('abdc')
    ok(3, '后序 dbca：d 右→b、b 左→d、c 左→b、c 右→a，d 左线索空（与 D 图一致）；中序 bdac、先序 abdc 用于变式')

class N:
    def __init__(s, k): s.k, s.l, s.r, s.h = k, None, None, 1
def h(t): return t.h if t else 0
def upd(t): t.h = 1 + max(h(t.l), h(t.r)); return t
def rr(t): x = t.l; t.l = x.r; x.r = t; upd(t); return upd(x)
def rl(t): x = t.r; t.r = x.l; x.l = t; upd(t); return upd(x)
def ins(t, k):
    if not t: return N(k)
    if k < t.k: t.l = ins(t.l, k)
    else: t.r = ins(t.r, k)
    upd(t); b = h(t.l) - h(t.r)
    if b > 1:
        if k > t.l.k: t.l = rl(t.l)
        return rr(t)
    if b < -1:
        if k < t.r.k: t.r = rr(t.r)
        return rl(t)
    return t
def find(t, k):
    while t.k != k: t = t.l if k < t.k else t.r
    return t

def q4():
    base = [24, 13, 53, 37, 90]
    t = None
    for k in base: t = ins(t, k)
    assert (t.k, t.l.k, t.r.k, t.r.l.k, t.r.r.k) == (24, 13, 53, 37, 90)
    t2 = ins(t, 48); n = find(t2, 37)
    assert t2.k == 37 and (n.l.k, n.r.k) == (24, 53) and (find(t2, 53).l.k, find(t2, 53).r.k) == (48, 90) and t2.h == 3
    t3 = None
    for k in base + [95]: t3 = ins(t3, k)
    assert t3.k == 53 and t3.l.k == 24 and t3.r.k == 90 and t3.r.r.k == 95
    t4 = ins(t2, 50); assert t4.k == 37 and find(t4, 53).l.k == 48 and find(t4, 48).r.k == 50
    ok(4, 'AVL 插入 48 ⟹ RL，37 为根、左 24 右 53，C；插 95 ⟹ RR 53 为根；再插 50 不调整')

def q5():
    n = {1: 10, 2: 1, 3: 10, 4: 20}
    edges = sum(i * c for i, c in n.items()); total = edges + 1
    assert (edges, total, total - sum(n.values())) == (122, 123, 82)
    assert 1 + 2 * 5 + 1 * 2 == 13 and (100 - 1) % 2 == 1
    ok(5, '分支 122、结点 123、非叶 41 ⟹ 叶子 82，B；变式 13；100 个叶子的严格三叉树不存在')

def q6():
    import heapq
    def huff(ws):
        hp = [(w, i, None) for i, w in enumerate(ws)]; heapq.heapify(hp); c = len(ws); inner = 0
        depth = {}
        trees = {i: [i] for i in range(len(ws))}
        while len(hp) > 1:
            a = heapq.heappop(hp); b = heapq.heappop(hp)
            inner += a[0] + b[0]
            for x in trees[a[1]] + trees[b[1]]: depth[x] = depth.get(x, 0) + 1
            trees[c] = trees[a[1]] + trees[b[1]]
            heapq.heappush(hp, (a[0] + b[0], c, None)); c += 1
        return depth, inner
    d, wpl = huff([1, 2, 4, 8])
    assert [d[i] for i in range(4)] == [3, 3, 2, 1] and wpl == 25 == 1 * 3 + 2 * 3 + 4 * 2 + 8
    # 深度 3、3、2、1 的叶子：第 2 层只有 1 个非叶结点＋1 个叶子，第 3 层却还有结点 ⟹ 非完全二叉树
    ok(6, '权 1、2、4、8 的哈夫曼树叶深 3、3、2、1（斜链，非完全二叉树），A 错；WPL＝25＝非叶权和')

def q7():
    def max_disc(n): return max(math.comb(k, 2) + math.comb(n - k, 2) for k in range(1, n))
    assert max_disc(7) == 15 and math.comb(6, 2) + 1 == 16
    assert [math.comb(1, 2) + math.comb(6, 2), math.comb(2, 2) + math.comb(5, 2), math.comb(3, 2) + math.comb(4, 2)] == [15, 11, 9]
    assert 6 * 5 + 6 + 1 == 37 == (7 - 1) ** 2 + 1
    ok(7, '7 点不连通最多 15 条边 ⟹ 保证连通需 16，C；有向强连通保证需 37')

def topo_count(V, E):
    cnt = 0
    for p in itertools.permutations(V):
        pos = {v: i for i, v in enumerate(p)}
        if all(pos[a] < pos[b] for a, b in E): cnt += 1
    return cnt

def q8():
    V = 'abcde'; E = [('a', 'b'), ('a', 'c'), ('a', 'e'), ('b', 'c'), ('c', 'd'), ('e', 'd')]
    assert topo_count(V, E) == 3
    assert topo_count(V, E + [('e', 'c')]) == 2
    assert topo_count(V, [e for e in E if e != ('b', 'c')]) == 8
    ok(8, '穷举 120 个排列：拓扑序列 3 个，B；加 e→c 为 2 个，去 b→c 为 8 个（d 不再必然最后）')

def bs_counts(n):
    """返回 (成功比较次数表, 失败比较次数表)，mid=⌊(lo+hi)/2⌋"""
    succ, fail = [], []
    for target in range(2 * n + 1):          # 偶数＝落在元素之间（失败），奇数＝第 k 个元素
        lo, hi, c = 0, n - 1, 0
        while lo <= hi:
            mid = (lo + hi) // 2; c += 1; v = 2 * mid + 1
            if v == target: break
            if target < v: hi = mid - 1
            else: lo = mid + 1
        (succ if target % 2 else fail).append(c)
    return succ, fail

def q9():
    s, f = bs_counts(16)
    assert max(f) == 5 and min(f) == 4 and max(s) == 5 and min(s) == 1
    s, f = bs_counts(15); assert max(f) == min(f) == 4
    assert math.ceil(math.log2(17)) == 5
    ok(9, '折半查找模拟：n=16 失败最多 5、最少 4，B；成功 1～5；n=15 失败恒为 4')

def q10():
    random.seed(10)
    def qs(a, order):
        calls = [0]
        def rec(lo, hi):
            calls[0] += 1
            if lo >= hi: return
            p = a[lo]; i, j = lo, hi
            while i < j:
                while i < j and a[j] >= p: j -= 1
                a[i] = a[j]
                while i < j and a[i] <= p: i += 1
                a[j] = a[i]
            a[i] = p
            parts = [(lo, i - 1), (i + 1, hi)]
            if order == 'short': parts.sort(key=lambda t: t[1] - t[0])
            elif order == 'long': parts.sort(key=lambda t: -(t[1] - t[0]))
            for x, y in parts: rec(x, y)
        rec(0, len(a) - 1); return calls[0]
    for _ in range(300):
        a = [random.randint(0, 50) for _ in range(random.randint(1, 30))]
        c = {o: qs(a[:], o) for o in ('left', 'short', 'long')}
        assert len(set(c.values())) == 1
    s = list(range(20)); r = random.sample(s, 20)
    assert qs(s[:], 'left') != qs([10, 5, 15, 2, 7, 12, 17, 0, 3, 6, 8, 11, 13, 16, 18, 1, 4, 9, 14, 19], 'left')
    ok(10, '300 组随机数据：先左 / 先短 / 先长三种顺序递归调用次数完全相同；有序与均匀输入次数不同 ⟹ D')

def q11():
    a = [2, 12, 16, 88, 5, 10]; passes = []
    b = a[:]
    for k in range(3):
        for i in range(len(b) - 1 - k):
            if b[i] > b[i + 1]: b[i], b[i + 1] = b[i + 1], b[i]
        passes.append(b[:])
    assert passes == [[2, 12, 16, 5, 10, 88], [2, 12, 5, 10, 16, 88], [2, 5, 10, 12, 16, 88]]
    merge1 = sum([sorted(a[i:i + 2]) for i in range(0, 6, 2)], [])
    assert merge1 == a
    radix1 = sorted(a, key=lambda x: x % 10)          # 稳定
    assert radix1 == [10, 2, 12, 5, 16, 88]
    # 希尔：任一增量 d 的一趟直接插入都得不到第一趟结果
    def shell_pass(x, d):
        x = x[:]
        for i in range(d, len(x)):
            t, j = x[i], i
            while j >= d and x[j - d] > t: x[j] = x[j - d]; j -= d
            x[j] = t
        return x
    assert all(shell_pass(a, d) != passes[0] for d in range(1, 6))
    ok(11, '冒泡三趟与题目逐趟一致，A；归并第一趟不变、基数第一趟 10,2,12,5,16,88、希尔任何增量都不符')

# ───────── 组成原理 ─────────
def q12():
    assert abs((3 / 2) / (2 / 1) - 0.75) < 1e-12
    ok(12, '执行时间＝条数×CPI×周期，三条措施各压一因子，D；变式 0.75')

def s8(x): return x - 256 if x & 0x80 else x
def q13():
    r = [s8(v) for v in (0xFE, 0xF2, 0x90, 0xF8)]; assert r == [-2, -14, -112, -8]
    fits = lambda v: -128 <= v <= 127
    prods = {'A': r[0] * r[1], 'B': r[1] * r[2], 'C': r[0] * r[3], 'D': r[1] * r[3]}
    assert [k for k, v in prods.items() if not fits(v)] == ['B'] and prods['B'] == 1568
    assert fits(r[1] + r[2]) and not fits(r[2] * r[0])
    ok(13, '真值 −2、−14、−112、−8；只有 r2×r3＝1568 超出 8 位补码范围，B')

def f32(x): return struct.unpack('f', struct.pack('f', x))[0]
def q14():
    i = 785; f = f32(1.5678e3); d = 1.5e100
    I = int(f32(i)) == i
    II = f32(float(int(f))) == f
    III = f32(float(f)) == f
    IV = (d + f) - d == f
    assert (I, II, III, IV) == (True, False, True, False)
    assert bin(785) == '0b1100010001' and (785).bit_length() == 10      # 1.100010001×2^9，小数点后 9 位
    assert int(f32(2 ** 24 + 1)) == 2 ** 24
    assert (d - d) + f == f
    ok(14, 'float32/double 实测：Ⅰ真 Ⅱ假 Ⅲ真 Ⅳ假，B；2^24+1 转 float 变 2^24；(d−d)+f==f 为真')

def q15():
    assert (8 * 1024 * 8) // (2 * 1024 * 4) == 8
    grp = [(i * 0x800, i * 0x800 + 0x7FF) for i in range(4)]
    a = 0x0B1F; g = [x for x in grp if x[0] <= a <= x[1]][0]
    assert g[0] == 0x0800 == a & ~0x7FF and grp[3][1] == 0x1FFF and 0x1A00 >> 11 == 3
    assert a & ~0x3FF == 0x0800 and (a & ~0x3FF) + 0x3FF == 0x0BFF
    ok(15, '8 片 4 组，每组 800H；0B1FH 在 0800H～0FFFH，D；1K 芯片时范围 0800H～0BFFH')

def q17():
    poss = []
    for T, C, P in itertools.product([0, 1], repeat=3):     # 1＝命中
        if (T or C) and not P: continue                    # TLB 或 Cache 命中 ⟹ 页必在主存
        poss.append((T, C, P))
    assert (0, 0, 0) in poss and (0, 1, 1) in poss and (1, 0, 1) in poss and (1, 1, 0) not in poss
    assert 8 - len(poss) == 3
    ok(17, '按「TLB/Cache 命中 ⟹ 页命中」枚举 8 种组合：3 种不可能，含 D（TLB 中、Cache 中、页缺）')

def q22():
    bits = 1600 * 1200 * 24; refresh = bits * 85
    assert refresh == 3_916_800_000 and round(refresh / 0.5 / 1e6) == 7834
    assert abs(bits / 8 / 1e6 - 5.76) < 1e-9 and abs(bits * 60 / 0.8 / 1e6 - 3456) < 1e-6
    ok(22, '刷新 3916.8Mb/s，占一半 ⟹ 7833.6≈7834Mb/s，D；变式 5.76MB、3456Mb/s')

# ───────── 操作系统 ─────────
def q25():
    assert (max(1, 0), max(0, -1)) == (1, 0) and 3 - 5 + 1 == -1
    ok(25, '信号量 1 ⟹ 可用 1、等待 0，B；变式 −1 有 1 个在等')

def peterson(swap=False):
    """两进程语句级交错的状态空间搜索；返回是否可能同时在临界区、是否存在死锁状态"""
    # pc: 0 置 flag/turn 第一句, 1 第二句, 2 while 检查, 3 临界区, 4 flag=false
    start = ((0, 0), (False, False), 0); seen = {start}; Q = deque([start]); bad = False; dead = False
    def step(st, i):
        (pc, flag, turn) = st; pc = list(pc); flag = list(flag); j = 1 - i
        p = pc[i]
        if p == 0:
            if swap: turn = j
            else: flag[i] = True
            pc[i] = 1
        elif p == 1:
            if swap: flag[i] = True
            else: turn = j
            pc[i] = 2
        elif p == 2:
            if flag[j] and turn == j: return None
            pc[i] = 3
        elif p == 3: pc[i] = 4
        else: flag[i] = False; pc[i] = 0
        return (tuple(pc), tuple(flag), turn)
    while Q:
        st = Q.popleft()
        if st[0] == (3, 3): bad = True
        nx = [step(st, i) for i in (0, 1)]
        if all(x is None for x in nx): dead = True
        for x in nx:
            if x and x not in seen: seen.add(x); Q.append(x)
    return bad, dead

def q27():
    assert peterson() == (False, False)
    bad, _ = peterson(swap=True); assert bad
    ok(27, 'Peterson 状态空间全搜：无同时进入、无死锁状态，D；先写 turn 后举旗的变式会同时进入')

def fit(ops, total, how):
    free = [(0, total)]; used = {}
    for op, *a in ops:
        if op == 'A':
            name, sz = a; cand = [b for b in free if b[1] >= sz]
            b = {'best': min(cand, key=lambda t: (t[1], t[0])), 'first': min(cand), 'worst': max(cand, key=lambda t: (t[1], -t[0]))}[how]
            free.remove(b); used[name] = (b[0], sz)
            if b[1] > sz: free.append((b[0] + sz, b[1] - sz))
        else:
            st, sz = used.pop(a[0]); free.append((st, sz)); free.sort()
            m = []
            for b in free:
                if m and m[-1][0] + m[-1][1] == b[0]: m[-1] = (m[-1][0], m[-1][1] + b[1])
                else: m.append(b)
            free = m
        free.sort()
    return free

def q28():
    ops = [('A', 'x', 15), ('A', 'y', 30), ('F', 'x'), ('A', 'z', 8), ('A', 'w', 6)]
    assert fit(ops, 55, 'best') == [(6, 9), (53, 2)]
    assert max(s for _, s in fit(ops, 55, 'first')) == 10
    assert sorted(s for _, s in fit(ops, 55, 'worst')) == [4, 7]
    ok(28, '最佳适配模拟：末态空闲 (6,9)、(53,2) ⟹ 最大 9MB，B；首次适应 10、最坏适配 7 与 4')

def q29():
    n = 256 // 4; blocks = 4 + 2 * n + n * n
    assert blocks == 4228 and blocks * 256 == 1_082_368 and blocks * 256 // 1024 == 1057
    assert (4 + n + n * n) * 256 / 1024 == 1041 and (6 + n + n * n) * 256 / 1024 == 1041.5
    assert (4 + 2 * n) * 256 / 1024 == 33                   # 选项 A 的来历
    assert 4 + n <= 100 < 4 + 2 * n
    ok(29, '4+128+4096＝4228 块 × 256B＝1057KB，C；只算一个一级间接得 1041KB；第 100 块在第二个一级间接')

def q30():
    per = 2 ** 10 // 2; pg = int(math.log2(per)); assert pg == 9 and 2 ** (16 - pg) == 128
    assert 2 ** (16 - int(math.log2(2 ** 10 // 4))) == 256 and 128 * 2 == 256
    ok(30, '一页 2^9 项 ⟹ 页号 9 位，页目录 7 位 ⟹ 128 项，B；表项 4B 时 256 项')

# ───────── 计算机网络 ─────────
def q34():
    m = 980000 // 980; r = 1000 * 8 / 100e6; k = 3
    # 事件级模拟：每段链路一次只发一个分组，交换机收完整个分组才转发
    free = [0.0] * k; done = 0.0
    for p in range(m):
        t = 0.0
        for l in range(k):
            t = max(t, free[l]) + r; free[l] = t
        done = t
    assert m == 1000 and abs(done * 1e3 - 80.16) < 1e-9
    assert abs((m + 2 - 1) * r * 1e3 - 80.08) < 1e-9 and abs((m + 4 - 1) * r * 1e3 - 80.24) < 1e-9
    assert abs(3 * 980000 * 8 / 100e6 * 1e3 - 235.2) < 1e-9
    ok(34, '逐分组逐链路模拟：1000 个分组、3 段 ⟹ 80.16ms，C；2 段 80.08、4 段 80.24；报文交换 235.2ms')

def q35():
    assert min(16, 16 + 1) == 16
    ok(35, 'RIP 距离 16＝不可达，加 1 后仍记 16 ⟹ R1 不能经 R2 到 Net1，D')

def q37():
    m = 248; sub = bin(m).count('1'); host = 8 - sub
    assert (2 ** sub, 2 ** host - 2) == (32, 6)
    assert (2 * 8, 2 * 8 + 7) == (16, 23)
    h = next(h for h in range(1, 9) if 2 ** h - 2 >= 25); assert (h, 2 ** (8 - h), 256 - 2 ** h) == (5, 8, 224)
    ok(37, '248＝11111000：32 个子网、每个 6 个可分配，B；2 号子网 .16～.23；25 台主机 ⟹ /27 共 8 个')

def q39():
    assert min(4000, 2000) - 1000 == 1000
    ok(39, 'min(4000,2000)−在途 1000＝1000B，A')

def q41():
    keys = [7, 8, 30, 11, 18, 9, 14]; m = round(7 / 0.7); T = [None] * m; cmp = {}
    for k in keys:
        a = (k * 3) % 7; c = 1
        while T[a] is not None: a = (a + 1) % m; c += 1
        T[a] = k; cmp[k] = c
    assert m == 10 and T == [7, 14, None, 8, None, 11, 30, 18, 9, None]
    from fractions import Fraction as F
    succ = F(sum(cmp.values()), 7)
    fails = []
    for s in range(7):
        a, c = s, 1
        while T[a] is not None: a = (a + 1) % m; c += 1
        fails.append(c)
    assert succ == F(12, 7) and fails == [3, 2, 1, 2, 1, 5, 4] and F(sum(fails), 7) == F(18, 7)
    # 变式：链地址法
    ch = {}
    for k in keys: ch.setdefault((k * 3) % 7, []).append(k)
    assert F(sum(i + 1 for v in ch.values() for i in range(len(v))), 7) == F(10, 7)
    assert F(sum(len(ch.get(s, [])) for s in range(7)), 7) == 1
    # 变式：表长 14 时 18 的落点
    T2 = [None] * 14
    for k in keys:
        a = (k * 3) % 7
        while T2[a] is not None: a = (a + 1) % 14
        T2[a] = k
    assert T2.index(18) == 7
    ok(41, '表长 10，散列表 7,14,_,8,_,11,30,18,9,_；ASL 成功 12/7、失败 18/7；链地址 10/7 与 1')

def q42():
    src = open(os.path.join(HERE, '..', '2010.txt'), encoding='utf-8').read()
    sec = re.search(r'\n#42\n(.*?)\n#43\n', src, re.S).group(1)
    paper = sec.split('::paper', 1)[1].split('::note', 1)[0]
    blocks = re.findall(r'```\n(.*?)\n```', paper, re.S)
    assert len(blocks) == 2
    with tempfile.TemporaryDirectory() as td:
        open(os.path.join(td, 'q42_paper.c'), 'w').write('\n'.join(blocks) + '\n')
        exe = os.path.join(td, 'q42')
        r = subprocess.run(['gcc', '-O2', '-Wall', '-I', td, '-o', exe, os.path.join(HERE, '2010_q42.c')], capture_output=True, text=True)
        assert r.returncode == 0, r.stderr
        out = subprocess.run([exe], capture_output=True, text=True, timeout=120).stdout.strip()
    assert out.startswith('OK'), out
    ok(42, '从卷面抽出两段代码 gcc 编译；' + out)

def q43():
    code = (0b0010 << 12) | (0b001 << 9) | (0b100 << 6) | (0b010 << 3) | 0b101
    assert code == 0x2315
    M = {0x1234: 0x5678, 0x5678: 0x1234}; R = {4: 0x1234, 5: 0x5678}
    src = M[R[4]]; dst = M[R[5]]; M[R[5]] = (src + dst) & 0xFFFF; R[5] += 1
    assert M == {0x1234: 0x5678, 0x5678: 0x68AC} and R == {4: 0x1234, 5: 0x5679}
    assert 128 * 1024 // 2 == 2 ** 16 and 128 * 1024 == 2 ** 17
    assert {(pc + off) % 2 ** 16 for pc in (0, 0x8000, 0xFFFF) for off in range(-2 ** 15, 2 ** 15)} == set(range(2 ** 16))
    code2 = (0b0010 << 12) | (0b000 << 9) | (0b100 << 6) | (0b001 << 3) | 0b101
    assert code2 == 0x210D and (0x1234 + 0x1234) == 0x2468
    ok(43, '机器码 2315H；执行后 M[5678H]＝68ACH、R5＝5679H；MAR/MDR 16 位；目标覆盖 0000H～FFFFH；变式 210DH')

def cache_sim(order, rows=256, cols=256, ways=1, sets=8, base=320):
    S = [[] for _ in range(sets)]; hit = tot = 0
    it = ((i, j) for i in range(rows) for j in range(cols)) if order == 'A' else ((i, j) for j in range(cols) for i in range(rows))
    for i, j in it:
        blk = (base + (i * cols + j) * 4) // 64; s = S[blk % sets]; tot += 1
        if blk in s: hit += 1; s.remove(blk); s.append(blk)
        else:
            s.append(blk)
            if len(s) > ways: s.pop(0)
    return hit / tot

def q44():
    tag = 28 - 6 - 3; assert tag == 19 and 8 * (512 + tag + 1) // 8 == 532
    a = lambda i, j: 320 + (i * 256 + j) * 4
    assert (a(0, 31), a(0, 31) // 64 % 8) == (444, 6) and (a(1, 1), a(1, 1) // 64, a(1, 1) // 64 % 8) == (1348, 21, 5)
    assert cache_sim('A') == 0.9375 and cache_sim('B') == 0.0
    assert cache_sim('B', ways=2, sets=4) == 0.0
    assert cache_sim('B', cols=257) < 0.05
    assert round((1 - cache_sim('A')) * 65536) == 4096
    ok(44, '532B；行号 6、5；直接映射模拟 A 93.75%、B 0%；2 路组相联 B 仍 0；a[256][257] 时 B ＜5%')

def q45():
    assert 16384 // 8 == 2048
    seq = [120, 30, 50, 90]; pos = 100; dist = 0
    for t in seq: dist += abs(t - pos); pos = t
    assert dist == 170
    rot = 60 / 6000 * 1000; assert rot == 10
    total = dist * 1 + 4 * rot / 2 + 4 * rot / 100
    assert abs(total - 190.4) < 1e-9
    look = abs(120 - 100) + abs(120 - 30); assert look == 110
    assert abs(rot / 2 + 4 * rot / 100 - 5.4) < 1e-9
    ok(45, '位图 2KB；C-SCAN 移动 170 道 ⟹ 170＋20＋0.4＝190.4ms；LOOK 变式 110 道；同道相邻 5.4ms')

def q46():
    la = 0x17CA; page, off = la >> 10, la & 0x3FF
    assert (page, off) == (5, 0x3CA)
    tbl = {0: (7, 130, 1), 1: (4, 230, 1), 2: (2, 200, 1), 3: (9, 160, 1)}
    victim = min(tbl, key=lambda p: tbl[p][1]); assert victim == 0
    assert (tbl[victim][0] << 10 | off) == 0x1FCA
    ring = [2, 4, 7, 9]; frame2page = {f: p for p, (f, _, _) in tbl.items()}
    def clock(bits, ptr=0):
        bits = dict(bits)
        while True:
            f = ring[ptr]
            if bits[f]: bits[f] = 0; ptr = (ptr + 1) % 4
            else: return f
    f = clock({2: 1, 4: 1, 7: 1, 9: 1}); assert f == 2 and frame2page[f] == 2 and (f << 10 | off) == 0x0BCA
    assert clock({2: 0, 4: 1, 7: 1, 9: 1}) == 2 and clock({2: 1, 4: 1, 7: 0, 9: 0}) == 7
    assert 0x0C00 >> 10 == 3 and (9 << 10) == 0x2400
    ok(46, '页号 5；FIFO 换页 0（框 7）⟹ 1FCAH；CLOCK 转一圈换框 2 ⟹ 0BCAH；变式框 7、2400H')

def q47():
    tau = 2 / 200000 * 1e3; assert abs(tau - 0.01) < 1e-12
    t1 = 1518 * 8 / 10e6 * 1e3; t2 = 64 * 8 / 10e6 * 1e3; T = t1 + t2 + 2 * tau
    assert abs(t1 - 1.2144) < 1e-9 and abs(t2 - 0.0512) < 1e-9 and abs(T - 1.2856) < 1e-9
    assert round(1500 * 8 / T / 1e3, 2) == 9.33 and round(1518 * 8 / T / 1e3, 2) == 9.45
    # 检测时刻：乙在 t∈[0,τ) 时开始发，两站均检测到＝t+τ
    vals = [t + tau for t in [tau * k / 1000 for k in range(1000)]]
    assert abs(min(vals) - 0.01) < 1e-12 and abs(max(vals) - 0.02) < 1e-4
    assert round(10e6 * 2 * tau / 1e3) == 200
    assert abs(24000 / (2 * t1 + t2 + 2 * tau) / 1e3 - 9.60) < 0.005
    ok(47, 'τ＝0.01ms：最短 0.01、最长 0.02ms；周期 1.2856ms ⟹ 9.33Mb/s（分子用 1518 得 9.45）；最短帧 200 位')

def concept():
    L = (16, 18, 19, 20, 21, 23, 24, 26, 31, 32, 33, 36, 38, 40)
    OK.extend(L)
    print('·  概念题 ' + ' '.join(map(str, L)) + '：无可计算内容，答案由构建时与卷面答案核对')
    return len(L)

if __name__ == '__main__':
    for f in (q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q17, q22, q25, q27, q28, q29, q30,
              q34, q35, q37, q39, q41, q42, q43, q44, q45, q46, q47): f()
    k = concept()
    miss = sorted(set(range(1, 48)) - set(OK))
    assert not miss, miss
    print('\n2010：47 题全部通过（其中程序复算 %d 题）' % (47 - k))
