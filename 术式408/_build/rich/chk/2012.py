#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2012 408 套卷精解 · 独立复算。每题一个函数，assert 失败即报错；最后打印汇总。
跑法：python3 _build/rich/chk/2012.py   （第 42 题需要 gcc，源码在同目录 2012_q42.c）"""
import heapq, itertools, math, os, random, re, struct, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
OK = []
def ok(n, msg): OK.append(n); print('✓ %2d  %s' % (n, msg))

# ───────── 数据结构 ─────────
def q1():
    cnt = [0]
    def fact(n):
        cnt[0] += 1
        return 1 if n <= 1 else n * fact(n - 1)
    for n in (1, 5, 50, 300):
        cnt[0] = 0; fact(n); assert cnt[0] == max(n, 1)
    def t2(n): return 1 if n <= 1 else 2 * t2(n - 1) + 1          # 变式：调自己两次
    assert [t2(n) for n in (1, 2, 3, 10)] == [1, 3, 7, 1023]
    ok(1, 'fact(n) 恰好调用 n 次 ⟹ O(n)，B')

def infix(expr):
    pr = {'+': 1, '-': 1, '*': 2, '/': 2}; st = []; out = []; mx = 0; snap = []
    for ch in expr:
        if ch.isalpha(): out.append(ch); continue
        if ch == '(': st.append(ch)
        elif ch == ')':
            while st[-1] != '(': out.append(st.pop())
            st.pop()
        else:
            while st and st[-1] != '(' and pr[st[-1]] >= pr[ch]: out.append(st.pop())
            st.append(ch)
        mx = max(mx, len(st)); snap.append(''.join(st))
    while st: out.append(st.pop())
    return ''.join(out), mx, snap

def q2():
    out, mx, snap = infix('a+b-a*((c+d)/e-f)+g')
    assert out == 'ab+acd+e/f-*-g+' and mx == 5 and '-*((+' in snap
    assert [len(x) for x in snap] == [1, 1, 2, 3, 4, 5, 3, 4, 4, 2, 1]
    assert infix('a+b*(c-d/(e+f))')[1] == 7
    ok(2, '转换结果与题干一致，栈最深 5（−*((+），A；变式 7')

def trees(pre, post):
    """枚举先序、后序都吻合的全部二叉树，树＝(根, 左, 右)"""
    if not pre: return [None]
    if pre[0] != post[-1] or sorted(pre) != sorted(post): return []
    res = []; rp, ro = pre[1:], post[:-1]
    for k in range(len(rp) + 1):
        for L in trees(rp[:k], ro[:k]):
            for R in trees(rp[k:], ro[k:]):
                res.append((pre[0], L, R))
    return res

def q3():
    T = trees('aebdc', 'bcdea')
    kids = {tuple(x[0] for x in (t[1], t[2]) if x) for t in T}
    assert len(T) == 4 and kids == {('e',)}
    assert len(trees('abc', 'cba')) == 4
    t = trees('abdc', 'dbca'); assert all(x[1] and x[2] and x[1][0] == 'b' and x[2][0] == 'c' for x in t)
    ok(3, '满足两序列的树共 4 棵，根的孩子恒为 {e}，A')

def q4():
    N = [0, 1, 2]
    for h in range(3, 8): N.append(N[-1] + N[-2] + 1)
    assert N[1:8] == [1, 2, 4, 7, 12, 20, 33]
    def build(h):                      # 非叶结点平衡因子全为 1 的树
        return None if h == 0 else (build(h - 1), build(h - 2)) if h > 1 else (None, None)
    def size(t): return 0 if t is None else 1 + size(t[0]) + size(t[1])
    def height(t): return 0 if t is None else 1 + max(height(t[0]), height(t[1]))
    def chk(t):
        if t is None or (t[0] is None and t[1] is None): return True
        return height(t[0]) - height(t[1]) == 1 and chk(t[0]) and chk(t[1])
    t = build(6); assert height(t) == 6 and chk(t) and size(t) == 20
    ok(4, '构造高 6、平衡因子全 1 的树，结点数 20，B')

def q5():
    R = random.Random(5)
    for _ in range(300):
        n = R.randint(1, 30); e = R.randint(0, n * (n - 1)) if n > 1 else 0
        adj = [[] for _ in range(n)]
        for _ in range(e): adj[R.randrange(n)].append(R.randrange(n))
        vis = [False] * n; vcnt = ecnt = 0
        for s in range(n):
            if vis[s]: continue
            vis[s] = True; q = [s]
            while q:
                u = q.pop(0); vcnt += 1
                for v in adj[u]:
                    ecnt += 1
                    if not vis[v]: vis[v] = True; q.append(v)
        assert vcnt == n and ecnt == e
    ok(5, '邻接表 BFS：顶点各出队 1 次、边表结点各扫 1 次 ⟹ O(n+e)，C')

def topo_all(n, edges):
    indeg = [0] * n
    for a, b in edges: indeg[b] += 1
    res = []
    def go(seq, indeg, used):
        if len(seq) == n: res.append(tuple(seq)); return
        for v in range(n):
            if not used[v] and indeg[v] == 0:
                used[v] = True
                for a, b in edges:
                    if a == v: indeg[b] -= 1
                go(seq + [v], indeg, used)
                for a, b in edges:
                    if a == v: indeg[b] += 1
                used[v] = False
    go([], indeg, [False] * n); return res

def q6():
    cnts = set()
    for n in (3, 4):
        pairs = [(i, j) for i in range(n) for j in range(i + 1, n)]
        for mask in range(1 << len(pairs)):
            es = [p for k, p in enumerate(pairs) if mask >> k & 1]
            c = len(topo_all(n, es)); assert c >= 1; cnts.add(c == 1)
            if all((i, i + 1) in es for i in range(n - 1)): assert c == 1     # 变式
    assert cnts == {True, False}
    assert len(topo_all(3, [(0, 1), (1, 2)])) == 1 and len(topo_all(3, [(0, 1), (0, 2)])) == 2
    ok(6, '穷举 3、4 顶点的全部上三角图：拓扑序列恒存在，唯一与不唯一都出现，C')

def dijkstra(E, src):
    dist = {src: 0}; done = []; pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if u in done: continue
        done.append(u)
        for (a, b), w in E.items():
            if a == u and d + w < dist.get(b, 1e9): dist[b] = d + w; heapq.heappush(pq, (d + w, b))
    return dist, done

def q7():
    E = {('a', 'b'): 2, ('a', 'c'): 5, ('b', 'c'): 1, ('b', 'd'): 3, ('c', 'd'): 3, ('c', 'e'): 4, ('c', 'f'): 1, ('d', 'e'): 1, ('d', 'f'): 4, ('e', 'f'): 1}
    dist, order = dijkstra(E, 'a')
    assert dist == dict(a=0, b=2, c=3, f=4, d=5, e=6) and order == list('abcfde')
    E2 = dict(E); E2[('c', 'f')] = 3; d2, _ = dijkstra(E2, 'a')
    assert (d2['d'], d2['e'], d2['f']) == (5, 6, 6)
    ok(7, 'dist：b2 c3 f4 d5 e6 ⟹ 后续 f,d,e，C')

def msts(n, edges):
    best = None; res = []
    for comb in itertools.combinations(range(len(edges)), n - 1):
        p = list(range(n))
        def f(x):
            while p[x] != x: x = p[x]
            return x
        good = True
        for i in comb:
            a, b = f(edges[i][0]), f(edges[i][1])
            if a == b: good = False; break
            p[a] = b
        if not good: continue
        w = sum(edges[i][2] for i in comb)
        if best is None or w < best: best, res = w, [comb]
        elif w == best: res.append(comb)
    return best, res

def q8():
    tri = [(0, 1, 1), (1, 2, 1), (0, 2, 1)]
    w, ts = msts(3, tri)
    assert w == 2 and len(ts) == 3 and all(any(i not in t for t in ts) for i in range(3))   # Ⅱ、Ⅲ 的反例
    w, ts = msts(4, [(0, 1, 1), (1, 2, 2), (2, 3, 3), (0, 3, 4), (0, 2, 5)]); assert len(ts) == 1   # 权值互异 ⟹ 唯一（Ⅳ 反例）
    w, ts = msts(3, [(0, 1, 9), (1, 2, 1)]); assert all(0 in t for t in ts)                # 变式：最大边是桥
    ok(8, '等权三角形有 3 棵 MST、代价都是 2 ⟹ 只有 Ⅰ 对，A')

def q9():
    # 3 阶 B 树局部：父 [55 65]，孩子 [47] [60 62] [78]。删 78：左兄弟够借 ⟹ 父下兄上
    parent, kids = [55, 65], [[47], [60, 62], [78]]
    kids[2].remove(78)
    assert len(kids[2]) < 1 and len(kids[1]) > 1
    kids[2].insert(0, parent[1]); parent[1] = kids[1].pop()
    assert parent == [55, 62] and kids == [[47], [60], [65]]
    flat = kids[0] + [parent[0]] + kids[1] + [parent[1]] + kids[2]; assert flat == sorted(flat)
    # 变式 2：再删 65，左兄弟只有 1 个 ⟹ 合并
    kids[2].remove(65); merged = kids[1] + [parent.pop()] + kids[2]
    assert parent == [55] and merged == [60, 62]
    ok(9, '删 78 后父 [55 62]、孩子 [47][60][65]，最右叶 65，D')

def q10():
    R = random.Random(10)
    def passes(alg, a):
        a = a[:]; n = len(a); out = []
        if alg == 'select':
            for i in range(n - 1):
                k = min(range(i, n), key=lambda j: a[j]); a[i], a[k] = a[k], a[i]; out.append(a[:])
        elif alg == 'merge':
            w = 1
            while w < n:
                a = sum([sorted(a[i:i + 2 * w]) for i in range(0, n, 2 * w)], []); out.append(a[:]); w *= 2
        elif alg == 'shell':
            d = n // 2
            while d >= 1:
                for i in range(d, n):
                    x = a[i]; j = i - d
                    while j >= 0 and a[j] > x: a[j + d] = a[j]; j -= d
                    a[j + d] = x
                out.append(a[:]); d //= 2
        return out
    bad = {'merge': 0, 'shell': 0}
    for _ in range(2000):
        a = R.sample(range(100), 8); fin = sorted(a)
        for p in passes('select', a): assert any(x == y for x, y in zip(p, fin))
        for alg in bad:
            p = passes(alg, a)[0]
            if not any(x == y for x, y in zip(p, fin)): bad[alg] += 1
    assert bad['merge'] > 0 and bad['shell'] > 0
    assert passes('merge', [4, 3, 2, 1])[0] == [3, 4, 1, 2]
    ok(10, '选择每趟必有归位；归并、希尔第一趟后无一归位的反例 %d、%d 个 ⟹ Ⅰ、Ⅲ、Ⅳ，A' % (bad['merge'], bad['shell']))

def q11():
    R = random.Random(11); diff = 0
    def ins(a, binary):
        a = a[:]; cmp = mv = 0
        for i in range(1, len(a)):
            x = a[i]
            if binary:
                lo, hi = 0, i - 1
                while lo <= hi:
                    m = (lo + hi) // 2; cmp += 1
                    if a[m] > x: hi = m - 1
                    else: lo = m + 1
                pos = lo
            else:
                j = i - 1
                while j >= 0:
                    cmp += 1
                    if a[j] > x: j -= 1
                    else: break
                pos = j + 1
            mv += i - pos; a[pos + 1:i + 1] = a[pos:i]; a[pos] = x
        return a, cmp, mv
    for _ in range(2000):
        a = [R.randint(0, 20) for _ in range(R.randint(2, 12))]
        r1, r2 = ins(a, False), ins(a, True)
        assert r1[0] == r2[0] == sorted(a) and r1[2] == r2[2]
        diff += r1[1] != r2[1]
    a = list(range(64)); assert ins(a, False)[1] == 63 < ins(a, True)[1]
    assert diff > 1000
    ok(11, '两种插入排序移动次数恒相同，比较次数 %d/2000 组不同，D' % diff)

# ───────── 组成原理 ─────────
def q12():
    assert 90 / 1.5 + 10 == 70 and 90 / 2 + 10 == 55 and 90 / 3 + 10 == 40 and 100 / 40 == 2.5
    ok(12, '90÷1.5+10 = 70s，D')

def q13():
    x = 65530 & 0xFFFF; y = x & 0xFFFFFFFF
    assert '%08X' % y == '0000FFFA'
    s = struct.unpack('<I', struct.pack('<i', -6))[0]; assert '%08X' % s == 'FFFFFFFA' and s == 4294967290
    assert struct.unpack('<h', struct.pack('<H', 65530))[0] == -6
    ok(13, '零扩展 ⟹ 0000 FFFAH，B')

def q14():
    mx = struct.unpack('>f', bytes.fromhex('7f7fffff'))[0]
    assert int(mx) == 2 ** 128 - 2 ** 104 and mx == int(mx)
    assert struct.unpack('>f', bytes.fromhex('00800000'))[0] == 2.0 ** -126
    f = lambda v: struct.unpack('>f', struct.pack('>f', v))[0]
    assert f(2 ** 24) == 2 ** 24 and f(2 ** 24 + 1) != 2 ** 24 + 1
    ok(14, 'FLT_MAX = 2^128 − 2^104，D')

def q15():
    b = struct.pack('<ibxh', 273, 0, 0)
    assert len(b) == 8 and b[0] == 0x11 and b[1] == 0x01 and struct.calcsize('<ibxh') == 8
    assert struct.calcsize('@ibh') == 8 and 0xC008 + 6 == 0xC00E
    assert struct.pack('>i', 273)[0] == 0 and struct.calcsize('@bih') + (-struct.calcsize('@bih')) % 4 == 12
    ok(15, '0xC008 存 0x11，c 在偏移 6 ⟹ 0xC00E，D')

def cache(seq, groups, ways, gid):
    S = [[] for _ in range(groups)]; hits = []
    for i, a in enumerate(seq):
        g = S[gid(a)]
        if a in g: g.remove(a); g.append(a); hits.append(i + 1)
        else:
            if len(g) == ways: g.pop(0)
            g.append(a)
    return hits

def q17():
    seq = [0, 4, 8, 2, 0, 6, 8, 6, 4, 8]
    assert cache(seq, 2, 2, lambda a: (a // 2) % 2) == [7, 8, 10]      # 标答口径
    assert cache(seq, 2, 2, lambda a: a % 2) == [8]                    # 常规口径
    assert cache([0, 1, 2, 3, 0, 1, 4, 0], 2, 2, lambda a: a % 2) == [5, 6, 8]
    assert cache(seq, 4, 1, lambda a: a % 4) == [8]
    ok(17, '标答口径命中 3 次（第 7、8、10 次），C；常规 mod 2 口径命中 1 次（＝选项 A）')

def q18():
    f = lambda L: sum(math.ceil(math.log2(n + 1)) for n in L)
    assert f([7, 3, 12, 5, 6]) == 15 and f([7, 3, 15, 5, 8]) == 16 and 15 + 2 + 9 == 26
    ok(18, '3+2+4+3+3 = 15 位，C')

def q19():
    T = 1e9 / 100e6
    assert (1 + 128 // 32) * T == 50 and 4 * 2 * T == 80 and (1 + 2 + 4) * T == 70 and 4 * 100 == 400
    ok(19, '(1+4)×10ns = 50ns，C')

# ───────── 操作系统 ─────────
ALLOC = [(3, 2, 3), (4, 0, 3), (4, 0, 5), (2, 0, 4), (3, 1, 4)]
MAXN = [(5, 5, 10), (5, 3, 6), (4, 0, 11), (4, 2, 5), (4, 2, 4)]
def safe_seq(seq, alloc, need, avail):
    w = list(avail)
    for i in seq:
        if any(need[i][k] > w[k] for k in range(3)): return False
        w = [w[k] + alloc[i][k] for k in range(3)]
    return True

def q27():
    avail = tuple(t - sum(a[k] for a in ALLOC) for k, t in enumerate((18, 6, 22)))
    need = [tuple(m - a for m, a in zip(M, A)) for M, A in zip(MAXN, ALLOC)]
    assert avail == (2, 3, 3) and need == [(2, 3, 7), (1, 3, 3), (0, 0, 6), (2, 2, 1), (1, 1, 0)]
    r = {k: safe_seq(v, ALLOC, need, avail) for k, v in dict(A=[0, 2, 4, 1, 3], B=[1, 0, 3, 4, 2], C=[2, 1, 0, 3, 4], D=[3, 4, 2, 1, 0]).items()}
    assert r == dict(A=False, B=False, C=False, D=True)
    assert [i for i in range(5) if all(need[i][k] <= avail[k] for k in range(3))] == [1, 3, 4]
    # 变式：P1 请求 (1,0,2)
    a2 = [list(x) for x in ALLOC]; n2 = [list(x) for x in need]; req = (1, 0, 2)
    for k in range(3): a2[1][k] += req[k]; n2[1][k] -= req[k]
    av2 = tuple(avail[k] - req[k] for k in range(3))
    assert av2 == (1, 3, 1) and any(safe_seq(p, a2, n2, av2) for p in itertools.permutations(range(5))) and safe_seq([4, 3, 2, 1, 0], a2, n2, av2)
    ok(27, 'Available=(2,3,3)，只有 D 序列走得通，D')

def q29():
    # 非抢占、P1 先到：事件模拟
    jobs = {1: [('c', 60), ('i', 80), ('c', 20)], 2: [('c', 120), ('i', 40), ('c', 40)]}
    ready = {1: 0, 2: 5}; cpu_free = 0; fin = {}; busy = 0
    idx = {1: 0, 2: 0}
    while len(fin) < 2:
        j = min((k for k in jobs if k not in fin), key=lambda k: ready[k])
        kind, t = jobs[j][idx[j]]
        if kind == 'c':
            s = max(cpu_free, ready[j]); cpu_free = s + t; ready[j] = s + t; busy += t
        else: ready[j] += t
        idx[j] += 1
        if idx[j] == 3: fin[j] = ready[j]
    assert fin == {1: 200, 2: 260} and busy == 240 and 160 + 200 == 360
    ok(29, 'P1 完成于 200、P2 完成于 260 ⟹ 260ms，B')

# ───────── 计算机网络 ─────────
def q36():
    def bits(L, ack=True, sr=False):
        td = L * 8 / 16000 * 1000; T = td + 540 + (td if ack else 0)
        w = math.ceil(T / td - 1e-9)
        return next(n for n in range(1, 10) if (2 ** (n - 1) if sr else 2 ** n - 1) >= w), w, T
    assert bits(128) == (4, 11, 668.0) and bits(512)[:2] == (3, 5)
    assert bits(128, sr=True)[0] == 5 and bits(128, ack=False) == (4, 10, 604.0)
    ok(36, '668÷64 ⟹ 窗口 11 ⟹ 2^n−1 ≥ 11 ⟹ 4 位，B')

def q39():
    import ipaddress
    n = ipaddress.ip_interface('180.80.77.55/255.255.252.0').network
    assert str(n.broadcast_address) == '180.80.79.255' and str(n.network_address) == '180.80.76.0' and n.num_addresses - 2 == 1022
    assert ipaddress.ip_address('180.80.80.1') not in n
    ok(39, '广播地址 180.80.79.255，D')

# ───────── 综合题 ─────────
def q41():
    def huff(ws):
        h = list(ws); heapq.heapify(h); cmp = 0; steps = []
        while len(h) > 1:
            a, b = heapq.heappop(h), heapq.heappop(h); steps.append((a, b, a + b - 1)); cmp += a + b - 1; heapq.heappush(h, a + b)
        return cmp, steps
    cmp, steps = huff([10, 35, 40, 50, 60, 200])
    assert steps == [(10, 35, 44), (40, 45, 84), (50, 60, 109), (85, 110, 194), (195, 200, 394)] and cmp == 825
    # 穷举所有两两合并次序，确认 825 最小
    best = [10 ** 9]
    def go(ls, acc):
        if acc >= best[0]: return
        if len(ls) == 1: best[0] = acc; return
        for i in range(len(ls)):
            for j in range(i + 1, len(ls)):
                rest = [x for k, x in enumerate(ls) if k not in (i, j)]
                go(rest + [ls[i] + ls[j]], acc + ls[i] + ls[j] - 1)
    go([10, 35, 40, 50, 60, 200], 0); assert best[0] == 825
    seq = [10, 35, 40, 50, 60, 200]; acc = seq[0]; tot = 0
    for x in seq[1:]: acc += x; tot += acc - 1
    assert tot == 850 and (10 + 35) * 4 + 40 * 3 + (50 + 60) * 3 + 200 == 830
    ok(41, '哈夫曼式合并 44+84+109+194+394 = 825，穷举全部合并次序确认最小')

def q42():
    src = open(os.path.join(HERE, '2012_q42.c'), encoding='utf-8').read()
    txt = open(os.path.join(HERE, '..', '2012.txt'), encoding='utf-8').read()
    for tag in ('brute', 'best'):
        code = re.search(r'//BEGIN %s\n(.*?)//END %s' % (tag, tag), src, re.S).group(1).strip()
        assert code in txt, '卷面代码与被编译的源码不一致：' + tag
    exe = os.path.join(tempfile.mkdtemp(), 'q42')
    subprocess.run(['gcc', '-Wall', '-Werror', '-O2', '-o', exe, os.path.join(HERE, '2012_q42.c')], check=True)
    out = subprocess.run([exe], capture_output=True, text=True, check=True).stdout.strip()
    assert out.startswith('OK'), out
    ok(42, 'gcc 编译；卷面两段代码与源码逐字一致；对拍：' + out)

def q43():
    ips = 80e6 / 4; miss = ips * 1.5 * (1 - 0.99)
    assert ips / 1e6 == 20 and round(miss) == 300000 and round(miss * 16) == 4800000
    pf = miss * 0.0005 / 100
    assert abs(pf - 1.5) < 1e-9 and round(pf * 4096 / 4) == 1536
    assert round(4 * 4 / 50e-9) == 320000000 and round(ips * 1.5 * 5e-6) == 150 and round(pf * 4096) == 6144
    ok(43, '20 MIPS、300K 次、4.8MB/s、1.5 次、1536 次、320MB/s')

def pipe(ins, same=False):
    last = {}; out = []
    for i, (r, w) in enumerate(ins):
        IF = 1 if i == 0 else out[-1][1]
        ID = IF + 1
        for x in r:
            if x in last: ID = max(ID, last[x] + (0 if same else 1))
        out.append((IF, ID, ID + 3))
        for x in w: last[x] = ID + 3
    return out

def q44():
    x = (-513) & 0xFFFF; assert '%04X' % x == 'FDFF' and '%04X' % ((-513 >> 1) & 0xFFFF) == 'FEFF' and -513 >> 1 == -257 and '%04X' % (x >> 1) == '7EFF'
    assert 5 + 4 - 1 == 8
    assert pipe([('', '1'), ('', '2'), ('12', '2'), ('2', '')]) == [(1, 2, 5), (2, 3, 6), (3, 7, 10), (7, 11, 14)]      # 与题图一致
    P = [('', '1'), ('', '2'), ('1', '1'), ('12', '2'), ('2', '')]
    assert pipe(P) == [(1, 2, 5), (2, 3, 6), (3, 6, 9), (6, 10, 13), (10, 14, 17)]
    assert pipe(P, True)[-1][2] == 14
    assert pipe([('', '1'), ('1', '1'), ('', '2'), ('12', '2'), ('2', '')])[-1][2] == 18
    ok(44, 'FEFFH；8 拍；规则回代题图吻合；x=x*2+a 需 17 拍')

def q45():
    free = [32, 15, 21, 41]; res = {}; owner = {}; touched = set(); log = {}
    acc = [(1, 1), (3, 2), (0, 4), (0, 6), (1, 11), (0, 13), (2, 14), (3, 16)]
    ai = 0
    for t in range(1, 17):
        if t % 5 == 0:
            for p in [p for p in list(res) if p not in touched]:
                free.append(res.pop(p))
            touched = set()
        while ai < len(acc) and acc[ai][1] == t:
            p = acc[ai][0]; ai += 1
            if p not in res:
                if p in owner and owner[p] in free: free.remove(owner[p]); res[p] = owner[p]
                else:
                    f = free.pop(0); res[p] = f; owner[p] = f
                    for q in [q for q in owner if q != p and owner[q] == f]: del owner[q]
            touched.add(p); log[(p, t)] = (res[p], list(free))
    assert log[(0, 4)] == (21, [41]) and log[(1, 11)] == (32, [41, 15]) and log[(2, 14)] == (41, [15]) and log[(3, 16)][0] == 15
    ok(45, '页框号依次 21、32、41（变式 ＜3,16＞ 取回 15）')

def q46():
    blocks = 4 * 2 ** 40 // 2 ** 10
    assert blocks == 2 ** 32 and math.ceil(32 / 8) == 4 and 512 // 4 * 1024 == 131072 == 2 ** 17
    assert 2 ** 16 * 1024 == 2 ** 26 and (512 - 8) // 6 == 84 and 2 ** 26 + 84 * 1024 == 67194880
    assert 2 ** 32 * 1024 == 4 * 2 ** 40 and math.log2(4 * 2 ** 40 // 4096) == 30 and 512 // 6 == 85
    ok(46, '块号 4B、128KB；2^26B+84KB；起始块号 4B＋块数 4B 可达 4TB')

def q47():
    P = ['45000030019b400080061de8c0a80008d34447500bd91388846b41c5000000007002438 05db00000'.replace(' ', ''),
         '4500003000004000310 66e83d3444750c0a8000813880bd9e0599fef846b41c6701216d037e10000'.replace(' ', ''),
         '45000028019c400080061defc0a80008d34447500bd91388846b41c6e0599ff0501043802b320000',
         '45000038019d400080061ddec0a80008d34447500bd91388846b41c6e0599ff050184380e6550000',
         '4500002868114000310 6067ad3444750c0a8000813880bd9e0599ff0846b41d6501016d057d20000'.replace(' ', '')]
    T2 = '450000286811400040 06ecadd3444750ca76010613 88a108e0599ff0846b41d6501016d0b7d60000'.replace(' ', '')
    def parse(h):
        b = bytes.fromhex(h); assert len(b) == 40 and b[0] == 0x45
        cs = sum(struct.unpack('>10H', b[:20])); cs = (cs & 0xFFFF) + (cs >> 16); assert cs == 0xFFFF, 'IP 首部校验和不对，转录有误'
        return dict(len=struct.unpack('>H', b[2:4])[0], id=b[4:6].hex(), ttl=b[8], src='.'.join(map(str, b[12:16])), dst='.'.join(map(str, b[16:20])),
                    seq=struct.unpack('>I', b[24:28])[0], ack=struct.unpack('>I', b[28:32])[0], hl=(b[32] >> 4) * 4, fl=b[33])
    D = [parse(h) for h in P]; t2 = parse(T2)
    assert [i + 1 for i, d in enumerate(D) if d['src'] == '192.168.0.8'] == [1, 3, 4] and D[1]['src'] == '211.68.71.80'
    assert [d['fl'] for d in D] == [0x02, 0x12, 0x10, 0x18, 0x10]
    assert D[1]['ack'] == D[0]['seq'] + 1 and D[2]['seq'] == D[0]['seq'] + 1 and D[2]['ack'] == D[1]['seq'] + 1
    assert [i + 1 for i, d in enumerate(D) if d['len'] < 46] == [3, 5]
    assert D[4]['ack'] - D[2]['seq'] == 16 == D[3]['len'] - 20 - D[3]['hl'] and D[1]['hl'] == 28
    assert t2['id'] == D[4]['id'] == '6811' and t2['ttl'] - D[4]['ttl'] == 64 - 49 == 15 and t2['dst'] == '202.118.1.6' and D[0]['ttl'] == 128
    ok(47, '六个首部校验和全部成立；H 发 1、3、4；握手 1、2、3；填充 3、5；16 字节；15 个路由器')

def concept():
    L = (16, 20, 21, 22, 23, 24, 25, 26, 28, 30, 31, 32, 33, 34, 35, 37, 38, 40)
    OK.extend(L)
    print('·  概念题 ' + ' '.join(map(str, L)) + '：无可计算内容，答案由构建时与卷面答案核对')
    return len(L)

if __name__ == '__main__':
    for f in (q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q17, q18, q19, q27, q29, q36, q39, q41, q42, q43, q44, q45, q46, q47): f()
    k = concept()
    miss = sorted(set(range(1, 48)) - set(OK))
    assert not miss, miss
    print('\n2012：47 题全部通过（其中程序复算 %d 题）' % (47 - k))
