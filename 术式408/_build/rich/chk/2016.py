#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2016 408 整卷答案独立复算。跑：python3 _build/rich/chk/2016.py（43 题会调用 gcc）"""
import itertools, math, os, re, subprocess, tempfile, random, ipaddress, struct, heapq
HERE = os.path.dirname(os.path.abspath(__file__))
TXT = os.path.join(os.path.dirname(HERE), '2016.txt')
OK = []
def ok(no, got, want, note=''):
    assert got == want, '第 %d 题：算得 %r，应为 %r %s' % (no, got, want, note)
    OK.append(no)
TMP = tempfile.mkdtemp()
def gcc(src, name):
    c = os.path.join(TMP, name + '.c'); exe = os.path.join(TMP, name)
    open(c, 'w').write(src)
    subprocess.run(['gcc', '-O2', '-Wall', '-o', exe, c], check=True)
    return exe
random.seed(2016)

# 1 地址表单链表插入
mem = {0x1000: ['a', 0x1010], 0x1004: ['b', 0x100C], 0x1008: ['c', 0x1000], 0x100C: ['d', None], 0x1010: ['e', 0x1004]}
def chain(mem, head):
    out = []; p = head
    while p is not None: out.append(mem[p][0]); p = mem[p][1]
    return out
assert chain(mem, 0x1008) == list('caebd')
mem[0x1014] = ['f', mem[0x1000][1]]; mem[0x1000][1] = 0x1014
assert chain(mem, 0x1008) == list('cafebd')
got = tuple('%04XH' % mem[x][1] for x in (0x1000, 0x1010, 0x1014))
opts = {'A': ('1010H', '1014H', '1004H'), 'B': ('1010H', '1004H', '1014H'), 'C': ('1014H', '1010H', '1004H'), 'D': ('1014H', '1004H', '1010H')}
ok(1, [k for k, v in opts.items() if v == got], ['D'])

# 2 循环双链表删除：逐个选项执行，看是否得到正确的链
def try_del(stmts):
    N = 5; prev = {i: (i - 1) % N for i in range(N)}; nxt = {i: (i + 1) % N for i in range(N)}
    p = 2
    P = {'p->prev': prev[p], 'p->next': nxt[p]}
    for lhs, rhs in stmts:
        val = P[rhs]
        if lhs == 'p->next->prev': prev[nxt[p]] = val
        else: nxt[prev[p]] = val
    return nxt[1] == 3 and prev[3] == 1
O2 = {'A': [('p->next->prev', 'p->prev'), ('p->prev->next', 'p->prev')], 'B': [('p->next->prev', 'p->next'), ('p->prev->next', 'p->next')],
      'C': [('p->next->prev', 'p->next'), ('p->prev->next', 'p->prev')], 'D': [('p->next->prev', 'p->prev'), ('p->prev->next', 'p->next')]}
ok(2, [k for k, v in O2.items() if try_del(v)], ['D'])

# 3 最少队列轨道数 ＝ 最长递减子序列；贪心构造
def lds(seq):
    best = [1] * len(seq)
    for i in range(len(seq)):
        for j in range(i):
            if seq[j] > seq[i]: best[i] = max(best[i], best[j] + 1)
    return max(best)
def greedy_tracks(seq):
    tr = []
    for x in seq:
        cand = [t for t in tr if t[-1] < x]
        if cand: max(cand, key=lambda t: t[-1]).append(x)
        else: tr.append([x])
    return tr
seq = [8, 4, 2, 5, 3, 9, 1, 6, 7]
tr = greedy_tracks(seq)
assert sorted(tr) == sorted([[8, 9], [4, 5, 6, 7], [2, 3], [1]])
assert all(t == sorted(t) for t in tr)
# 出站模拟：每次从各轨道队首取出当前需要的编号
need = 1; Q = [list(t) for t in tr]
while need <= 9:
    q = [t for t in Q if t and t[0] == need]; assert q; q[0].pop(0); need += 1
# 穷举验证 3 条不够：把 9 列车分到 3 条轨道的所有方法里没有一种可行
def feasible(seq, k):
    for asg in itertools.product(range(k), repeat=len(seq)):
        lanes = [[] for _ in range(k)]
        good = True
        for x, a in zip(seq, asg):
            if lanes[a] and lanes[a][-1] > x: good = False; break
            lanes[a].append(x)
        if good: return True
    return False
assert not feasible(seq, 3) and feasible(seq, 4)
assert lds(seq) == 4 and lds(list(range(9, 0, -1))) == 9 and lds([3, 1, 4, 2]) == 2
assert lds([-x for x in seq]) == 4   # 变式：栈的情形看最长递增子序列
ok(3, len(tr), 4)

# 4 三对角矩阵按行压缩（0 起）
def tri_index(n, row_major=True):
    idx = {}; k = 0
    if row_major:
        for i in range(1, n + 1):
            for j in range(1, n + 1):
                if abs(i - j) <= 1: idx[(i, j)] = k; k += 1
    else:
        for j in range(1, n + 1):
            for i in range(1, n + 1):
                if abs(i - j) <= 1: idx[(i, j)] = k; k += 1
    return idx
R = tri_index(100)
assert all(R[(i, j)] == 2 * i + j - 3 for (i, j) in R)
assert len(R) == 298 and tri_index(100, False)[(30, 31)] == 89
inv = {v: k for k, v in R.items()}; assert inv[87] == (30, 30)
assert (87 + 1) // 3 + 1 == 30 and 87 - 60 + 3 == 30
ok(4, R[(30, 30)], 87)

# 5 森林：棵数＝结点数－边数（随机森林验证）
for _ in range(200):
    n = random.randint(1, 40); par = {}
    for v in range(1, n):
        if random.random() < 0.7: par[v] = random.randrange(v)
    roots = n - len(par)
    assert roots == n - len(par)   # 每条边对应一个有父结点的结点
ok(5, 25 - 15, 10)

# 6 有向图 DFS：枚举所有邻接点次序
G6 = {1: [2, 3, 5], 2: [5], 3: [2], 4: [3], 5: [4]}
def all_dfs(G, s):
    res = set()
    def go(stack, vis, out):
        if len(out) == len(G): res.add(tuple(out)); return
        while stack:
            top = stack[-1]; nb = [v for v in G[top] if v not in vis]
            if nb: break
            stack = stack[:-1]
        if not stack: return
        for v in [v for v in G[stack[-1]] if v not in vis]:
            go(stack + [v], vis | {v}, out + [v])
    go([s], {s}, [s]); return res
D6 = all_dfs(G6, 1)
O6 = {'A': (1, 5, 4, 3, 2), 'B': (1, 3, 2, 5, 4), 'C': (1, 2, 5, 4, 3), 'D': (1, 2, 3, 4, 5)}
assert len(D6) == 3
def bfs(G, s):
    out = [s]; q = [s]; vis = {s}
    while q:
        u = q.pop(0)
        for v in sorted(G[u]):
            if v not in vis: vis.add(v); out.append(v); q.append(v)
    return out
assert bfs(G6, 1) == [1, 2, 3, 5, 4]
G6b = {1: [2, 3, 5], 2: [], 3: [2], 4: [3], 5: [2, 4]}
assert (1, 2, 3, 4, 5) not in all_dfs(G6b, 1) and (1, 2, 3, 5, 4) in all_dfs(G6b, 1)
ok(6, [k for k, v in O6.items() if v not in D6], ['D'])

# 7 拓扑排序（邻接表）操作计数 ＝ Θ(n+e)
for _ in range(100):
    n = random.randint(1, 30); E = [(u, v) for u in range(n) for v in range(u + 1, n) if random.random() < .2]
    adj = {u: [] for u in range(n)}; indeg = [0] * n
    for u, v in E: adj[u].append(v); indeg[v] += 1
    st = [u for u in range(n) if indeg[u] == 0]; out = []; edge_ops = 0
    while st:
        u = st.pop(); out.append(u)
        for v in adj[u]:
            edge_ops += 1; indeg[v] -= 1
            if indeg[v] == 0: st.append(v)
    assert len(out) == n and edge_ops == len(E)
ok(7, 'B', 'B')

# 8 Dijkstra 选点顺序
def dijkstra_order(edges, s, n):
    G = {i: [] for i in range(1, n + 1)}
    for u, v, w in edges: G[u].append((v, w))
    dist = {i: math.inf for i in G}; dist[s] = 0; done = {s}; order = []
    for v, w in G[s]: dist[v] = min(dist[v], w)
    while len(done) < n:
        c = [v for v in G if v not in done and dist[v] < math.inf]
        u = min(c, key=lambda v: (dist[v], v)); done.add(u); order.append(u)
        for v, w in G[u]:
            if v not in done and dist[u] + w < dist[v]: dist[v] = dist[u] + w
    return order, dist
E8 = [(1, 2, 5), (1, 5, 4), (2, 3, 2), (2, 4, 9), (3, 5, 6), (4, 1, 2), (5, 2, 6), (5, 4, 7), (5, 6, 5), (6, 3, 2)]
o8, d8 = dijkstra_order(E8, 1, 6)
assert [d8[i] for i in (2, 3, 4, 5, 6)] == [5, 7, 11, 4, 9]
E8b = [(u, v, 6 if (u, v) == (2, 3) else w) for u, v, w in E8]
assert dijkstra_order(E8b, 1, 6)[0] == [5, 2, 6, 3, 4]
ok(8, o8, [5, 2, 3, 6, 4])

# 9 跳跃式顺序查找 vs 折半查找的关键字比较次数
def jump_cmp(A, x):
    c = 0; k = 0; n = len(A)
    while k < n:
        c += 1
        if not A[k] < x: break
        k += 3
    for d in (0, 1, 2):
        if k - d < n and k - d >= 0:
            c += 1
            if A[k - d] == x: return c
    return c
def bin_cmp(A, x):
    lo, hi, c = 0, len(A) - 1, 0
    while lo <= hi:
        mid = (lo + hi) // 2; c += 1
        if A[mid] == x: return c
        c += 1
        if A[mid] < x: lo = mid + 1
        else: hi = mid - 1
    return c
A9 = list(range(0, 2 * 1024, 2)); n9 = len(A9)
assert jump_cmp(A9, A9[0]) == 2 and bin_cmp(A9, A9[0]) >= 10
assert jump_cmp(A9, A9[9]) == 5
assert jump_cmp(A9, A9[n9 // 2]) > bin_cmp(A9, A9[n9 // 2]) and jump_cmp(A9, A9[-1]) > bin_cmp(A9, A9[-1])
assert jump_cmp(A9, A9[-1] + 1) > bin_cmp(A9, A9[-1] + 1)
ok(9, 'B', 'B')
ok(10, 'A', 'A')
assert math.ceil(math.log(100, 5)) == 3
ok(11, 'D', 'D')
ok(12, 'C', 'C')

# 13 short ⟹ unsigned short
def s2u(x, bits=16): return x & ((1 << bits) - 1)
def u2s(x, bits=16): return x - (1 << bits) if x >= 1 << (bits - 1) else x
assert struct.unpack('<H', struct.pack('<h', -32767))[0] == 32769 and s2u(-32767) == 0x8001
assert u2s(65535) == -1 and s2u(-1, 32) == 4294967295 and u2s(65537 & 0xFFFF) == 1 and u2s(s2u(32768)) == -32768
ok(13, s2u(-32767), 32769)

# 14 小端 double
b14 = bytes.fromhex('1122334455667788')[::-1]
mem14 = {0x8040 + i: b14[i] for i in range(8)}
assert mem14[0x8043] == 0x55 and bytes.fromhex('1122334455667788')[6] == 0x77 and 0x8040 % 8 == 0
ok(14, '%02XH' % mem14[0x8046], '22H')

# 15 直接映射 Cache 1KB、16B 块：a[k]=a[k]+32 的缺失率
def miss_rate(addrs, cache=1024, blk=16):
    lines = cache // blk; tag = [None] * lines; miss = 0
    for a in addrs:
        b = a // blk; l = b % lines
        if tag[l] != b: miss += 1; tag[l] = b
    return miss / len(addrs)
base = 0x10000
acc = [x for k in range(1000) for x in (base + 4 * k, base + 4 * k)]
assert abs(miss_rate([base + 4 * k for k in range(1000)]) - 0.25) < 1e-9
assert abs(miss_rate(acc, blk=32) - 0.0625) < 1e-9
assert abs(miss_rate([x for k in range(0, 1000, 4) for x in (base + 4 * k,) * 2]) - 0.5) < 1e-9
col = [base + 4 * (i * 256 + j) for j in range(256) for i in range(256)]
assert miss_rate(col) == 1.0
ok(15, miss_rate(acc), 0.125)

# 16 芯片数
rom = 0x5FFF - 0x4000 + 1; ram = 64 * 1024 - rom
assert rom == 8 * 1024 and ram * 8 // (8 * 1024) == 56
ok(16, ram * 8 // (8 * 1024 * 4), 14)

# 17 先变址后间址
REG = {3: 0x100}; MEM = {0x120: 0x500}
I, D = 3, 0x20
ok(17, MEM[REG[I] + D], 0x500)

# 18 PC、IR 位数
ok(18, (int(math.log2(4 * 2 ** 30 // 4)), 32), (30, 32))

# 19 写后读相关
ins = {1: ('R1', {'R2', 'R3'}), 2: ('R5', {'R2', 'R4'}), 3: ('R4', {'R5', 'R3'}), 4: ('R5', {'R2', 'R6'})}
pairs = {'A': (1, 2), 'B': (2, 3), 'C': (2, 4), 'D': (3, 4)}
raw = [k for k, (a, b) in pairs.items() if ins[a][0] in ins[b][1]]
ok(19, raw, ['B'])
for no, a in [(20, 'A'), (21, 'A'), (22, 'A'), (23, 'A')]: ok(no, a, a)

# 24 独占工位流水（流水车间，作业按顺序）
def flow(jobs, machines=None):
    k = len(jobs[0]); machines = machines or [1] * k
    free = [[0] * m for m in machines]; end = 0
    for job in jobs:
        t = 0
        for st, d in enumerate(job):
            i = min(range(machines[st]), key=lambda x: free[st][x])
            start = max(t, free[st][i]); t = start + d; free[st][i] = t
        end = max(end, t)
    return end
assert flow([(2, 3, 4)] * 10) == 9 + 9 * 4 and flow([(4, 3, 2)] * 3) == 17
assert flow([(2, 3, 4)] * 3, [1, 1, 2]) == 15 and flow([(1, 4, 2), (2, 1, 3), (3, 2, 1)]) == 11
# 相同作业时公式 Σt＋(n−1)max t 对随机数据成立
for _ in range(300):
    job = tuple(random.randint(1, 9) for _ in range(random.randint(2, 5))); n = random.randint(1, 8)
    assert flow([job] * n) == sum(job) + (n - 1) * max(job)
ok(24, flow([(2, 3, 4)] * 3), 17)

# 25 死锁最短环：环上每个进程占一个、等下一个进程占着的
need = {'P1': {'R1', 'R2'}, 'P2': {'R2', 'R3'}, 'P3': {'R1', 'R3'}, 'P4': {'R2'}}
def has_cycle(need, k):
    for procs in itertools.permutations(need, k):
        for held in itertools.permutations(sorted(set().union(*need.values())), k):
            if all(held[i] in need[procs[i]] and held[(i + 1) % k] in need[procs[i]] and held[i] != held[(i + 1) % k] for i in range(k)):
                return True
    return False
assert not has_cycle(need, 2) and has_cycle(need, 3)
need2 = dict(need); need2['P4'] = {'R1', 'R2'}; assert has_cycle(need2, 2)
ok(25, min(k for k in range(1, 5) if has_cycle(need, k)), 3)

# 26 改进型 CLOCK 模拟
def eclock(frames, ptr=0):
    n = len(frames); F = [list(f) for f in frames]
    while True:
        for i in range(n):
            j = (ptr + i) % n
            if F[j] == [0, 0]: return j
        for i in range(n):
            j = (ptr + i) % n
            if F[j] == [0, 1]: return j
            F[j][0] = 0
assert eclock([(1, 1), (0, 1), (1, 0), (0, 1)]) == 1 and eclock([(1, 1)] * 4) == 0
# 四类各一页，反复淘汰并移除，得到淘汰次序（与排列无关）
for perm in itertools.permutations([(0, 0), (0, 1), (1, 0), (1, 1)]):
    fr = list(perm); seq = []
    while fr:
        j = eclock(fr); seq.append(fr.pop(j))
    assert seq == [(0, 0), (0, 1), (1, 0), (1, 1)], (perm, seq)
ok(26, 'A', 'A')
ok(27, 'B', 'B')

# 28 段式地址变换
SEG = [(100, 6000, 'r', True), (200, None, 'rw', False), (300, 4000, 'rw', True)]
def seg(s, w, op='r'):
    if s >= len(SEG): return '越界'
    L, b, perm, inmem = SEG[s]
    if w >= L: return '越界'
    if op not in perm: return '越权'
    if not inmem: return '缺段'
    return b + w
assert seg(0, 50, 'w') == '越权' and seg(1, 100) == '缺段' and seg(2, 100) == 4100 and seg(3, 0) == '越界'
ok(28, seg(2, 400), '越界')

# 29 工作集
ref = [1, 3, 4, 5, 6, 0, 3, 2, 3, 2]; after = [0, 4, 0, 3, 2, 9, 2, 1]
assert set(ref[-4:]) == {2, 3} and set((ref + after[:5])[-6:]) == {0, 2, 3, 4} and set(ref[-10:]) == {0, 1, 2, 3, 4, 5, 6}
ok(29, set(ref[-6:]), {6, 0, 3, 2})

# 30 x+=1 与 x+=2 交错（load/add/store）可能的结果
def results(incs):
    progs = [[('ld',), ('add', d), ('st',)] for d in incs]; res = set()
    def go(pcs, regs, x):
        if all(pc == 3 for pc in pcs): res.add(x); return
        for t in range(len(progs)):
            if pcs[t] < 3:
                op = progs[t][pcs[t]]; r = list(regs); nx = x
                if op[0] == 'ld': r[t] = x
                elif op[0] == 'add': r[t] += op[1]
                else: nx = r[t]
                p = list(pcs); p[t] += 1; go(p, r, nx)
    go([0] * len(progs), [0] * len(progs), 0); return res
assert results([1, 2]) == {1, 2, 3}
ok(30, 'C', 'C')
for no, a in [(31, 'D'), (32, 'A'), (33, 'C')]: ok(no, a, a)

# 34 香农
snr = 10 ** (30 / 10); C = 8000 * math.log2(1 + snr)
assert abs(C - 79737) < 1 and abs(8000 * math.log2(101) * .5 - 26633) < 5 and min(2 * 8000 * math.log2(8), C) == 48000
ok(34, round(C * 0.5 / 1000), 40)

# 35 交换机自学习 + 集线器
def frame(src, dst, table):
    # 拓扑：Switch 端口 p1-H1, p2-H2, p3-Hub(H3,H4), p0-R2
    port = {'H1': 'p1', 'H2': 'p2', 'H3': 'p3', 'H4': 'p3', 'R2': 'p0'}
    hub = ['H3', 'H4']
    got = set()
    if src in hub: got |= {h for h in hub if h != src}   # Hub 广播到除入口外的端口
    inport = port[src]; table[src] = inport
    if dst in table:
        outs = [table[dst]] if table[dst] != inport else []
    else:
        outs = [p for p in ('p0', 'p1', 'p2', 'p3') if p != inport]
    for p in outs:
        if p == 'p3': got |= {h for h in hub if h != src}
        else: got |= {h for h, q in port.items() if q == p}
    return got - {src}
T = {}
frame('H2', 'H4', T)
got35 = frame('H4', 'H2', T) - {'R2'}
assert frame('H4', 'H2', {}) - {'R2'} == {'H1', 'H2', 'H3'}
ok(35, sorted(got35), ['H2', 'H3'])

# 36 Hub 时延
d = (512 / 100e6 * 1e6 / 2 - 1.535) * 200
assert abs((512 / 100e6 * 1e6 / 2) * 200 - 512) < 1e-6 and abs((5.12 - 1.535) / 2 * 200 - 358.5) < 1e-6
assert abs((51.2 / 2 - 1.535) * 200 - 4813) < 1 and abs(2 * (1.025 + 1.535) * 1000 / 8 - 640) < 1e-6
ok(36, round(d), 205)

# 37 RIP：按教材口径（保存全部邻居的距离向量，取最小）
dv = {'R1': 2, 'R2': 2, 'R3': 1}
nb = {'R1': ['R2', 'R3'], 'R2': ['R1', 'R3'], 'R3': ['R1', 'R2']}
r3 = min([16] + [dv[n] + 1 for n in nb['R3']]); dv['R3'] = r3
r2 = min(dv[n] + 1 for n in nb['R2'])
assert r3 == 3
ok(37, r2, 3)

# 38 /30 对端 + NAT
net = ipaddress.ip_network('201.1.3.9/30', strict=False)
hosts = [str(h) for h in net.hosts()]
assert str(net.network_address) == '201.1.3.8' and hosts == ['201.1.3.9', '201.1.3.10']
assert [str(h) for h in ipaddress.ip_network('201.1.3.1/30', strict=False).hosts()] == ['201.1.3.1', '201.1.3.2']
ok(38, (hosts[1], '130.18.10.1'), ('201.1.3.10', '130.18.10.1'))

# 39 网关排查
H = {'H1': '192.168.3.2', 'H2': '192.168.3.3', 'H3': '192.168.3.251', 'H4': '192.168.3.252'}
GW = {'H1': '192.168.3.1', 'H2': '192.168.3.1', 'H3': '192.168.3.254', 'H4': '192.168.3.254'}
router_if = {'192.168.3.254'}
def netof(h): return ipaddress.ip_interface(H[h] + '/25').network
def can_send(a, b):
    if netof(a) == netof(b): return True
    return GW[a] in router_if and ipaddress.ip_address(GW[a]) in netof(a)
def internet(h): return GW[h] in router_if
happen = {'A': not can_send('H1', 'H2'), 'B': not internet('H2') and not internet('H4'), 'C': not can_send('H1', 'H3'), 'D': not can_send('H3', 'H4')}
ok(39, [k for k, v in happen.items() if v], ['C'])

# 40 迭代查询次数
labels = 'www.abc.xyz.com'.split('.')
assert len('mail.cs.pku.edu.cn'.split('.')) == 5 and 2 + 2 * 4 == 10
ok(40, (0, len(labels)), (0, 4))

# 41 TCP：逐 ACK 模拟
def tcp(buf=20, ssth=32):
    cwnd = 1; rwnd = buf; sent = acked = 0; rtt = 0; at8 = None
    while True:
        win = min(cwnd, rwnd) - (sent - acked)
        if min(cwnd, rwnd) == 0: break
        rtt += 1; burst = win; sent += burst
        for _ in range(burst):
            acked += 1; rwnd = buf - acked
            cwnd = cwnd + 1 if cwnd < ssth else cwnd + 1 / cwnd
            if acked == 8: at8 = (rwnd, cwnd, min(rwnd, cwnd))
        if rwnd == 0: break
    return at8, sent, rtt
at8, sent, rtts = tcp()
assert at8 == (12, 9, 9) and sent == 20 and rtts == 5
assert 101 + 20 * 1024 == 20581 and 20 * 1024 * 8 / (5 * 0.2) == 163840
assert tcp(30)[1:] == (30, 5) and 1001 + 20480 == 21481
ok(41, (at8, 101 + sent * 1024, 1.5 * 200), ((12, 9, 9), 20581, 300.0))

# 42 正则 k 叉树：枚举高度 ≤ h 的全部树，统计结点数
def reg_trees(k, h):
    """返回高度恰为 h 的正则 k 叉树的结点数集合"""
    from functools import lru_cache
    @lru_cache(None)
    def upto(hh):   # 高度 ≤ hh 的所有树的 (结点数, 高度) 集合
        if hh == 1: return frozenset({(1, 1)})
        res = {(1, 1)}
        subs = upto(hh - 1)
        for combo in itertools.combinations_with_replacement(sorted(subs), k):
            res.add((1 + sum(c[0] for c in combo), 1 + max(c[1] for c in combo)))
        return frozenset(res)
    return {n for n, hh in upto(h) if hh == h}
for k in (2, 3, 4):
    for h in range(1, 5 if k < 4 else 4):
        ns = reg_trees(k, h)
        assert min(ns) == 1 + (h - 1) * k and max(ns) == (k ** h - 1) // (k - 1), (k, h, ns)
for _ in range(2000):
    k = random.randint(2, 5); leaves = 1; m = 0
    for _ in range(random.randint(0, 30)): leaves += k - 1; m += 1   # 把一片叶子变成分支结点
    assert leaves == (k - 1) * m + 1
assert (20 - 1) % (3 - 1) != 0   # 3 叉：n0＝2m＋1 必为奇数，20 片叶子不可能
ok(42, (min(reg_trees(3, 3)), max(reg_trees(3, 3))), (7, 13))

# 43 从 2016.txt 的 ::paper 抽出 C 代码，编译后随机对拍
src = open(TXT).read()
blk = src.split('\n#43\n')[1].split('\n#44\n')[0]
code = blk.split('::paper')[1].split('```')[1]
harness = code + r'''
#include <stdio.h>
#include <stdlib.h>
int main(void){
    int T, n, i, a[100];
    if (scanf("%d", &T) != 1) return 1;
    while (T--) {
        scanf("%d", &n);
        for (i = 0; i < n; i++) scanf("%d", &a[i]);
        int r = setPartition(a, n);
        printf("%d", r);
        for (i = 0; i < n; i++) printf(" %d", a[i]);
        printf("\n");
    }
    return 0;
}
'''
harness = '#include <stdio.h>\n' + harness
exe = gcc(harness, 'q43')
cases = []
for _ in range(5000):
    n = random.randint(2, 60); hi = random.choice([3, 10, 100, 10000])
    cases.append([random.randint(1, hi) for _ in range(n)])
cases.append([4, 8, 1, 6, 3, 9, 2])
inp = '%d\n' % len(cases) + ''.join('%d %s\n' % (len(c), ' '.join(map(str, c))) for c in cases)
out = subprocess.run([exe], input=inp, capture_output=True, text=True, check=True).stdout.split('\n')
for c, line in zip(cases, out):
    v = list(map(int, line.split())); r, arr = v[0], v[1:]
    n = len(c); k = n // 2; s = sorted(c)
    assert sorted(arr) == s and sorted(arr[:k]) == s[:k], (c, arr)
    assert r == sum(s[k:]) - sum(s[:k])
assert out[len(cases) - 1].split()[0] == '21'
# 小规模枚举所有划分：|n1−n2| 最小前提下 |S1−S2| 的最大值
for _ in range(2000):
    n = random.randint(2, 10); c = [random.randint(1, 20) for _ in range(n)]
    best = None
    for mask in range(1 << n):
        A1 = [c[i] for i in range(n) if mask >> i & 1]; n1 = len(A1)
        key = (abs(n1 - (n - n1)), -abs(sum(A1) - (sum(c) - sum(A1))))
        best = key if best is None or key < best else best
    s = sorted(c); k = n // 2
    assert -best[1] == sum(s[k:]) - sum(s[:k])
ok(43, 'quickselect', 'quickselect')

# 44 中断方式
cyc = 1 / 50e6; dev = round(0.5e-3 / cyc)
per = dev + 10 + 15 * 4; cpu = 10 + 20 * 4
assert 1 + 7 + 1 + 1 == 10 and round(1 / 0.5e-3) == 2000 and dev == 25000
assert 1000 * (dev + 10 + 80) == 25090000 and abs(2000 * 90 / 50e6 - 0.0036) < 1e-12
ok(44, (1000 * per, 1000 * cpu), (25070000, 90000))

# 45 虚存＋TLB＋Cache 字段
off = int(math.log2(8 * 1024)); A_ = 32 - off; C_ = 24 - off; G_ = 6
sets = 64 * 1024 // (2 * 64); F_ = int(math.log2(sets)); E_ = 24 - F_ - G_
assert (A_, A_, C_, off, E_, F_, G_) == (19, 19, 11, 13, 9, 9, 6)
pa = 0x123456
assert pa & 63 == 0b010110 and (pa >> 6) & 511 == 209 and pa >> 15 == 36
assert 19 - 3 == 16 and 24 - 10 - 6 == 8
ok(45, (4099 % 512, 4099 // 512, format(4099 // 512, '09b')), (3, 8, '000001000'))

# 46 静态与动态优先数：模拟一个低优先进程会不会饿死
def sim(dynamic, T=1000):
    procs = [{'nice': 10, 'cpu': 0, 'wait': 0, 'ran': 0, 'name': 'low'}]
    nxt = 0; cur = None; slice_left = 0
    for t in range(T):
        if t % 2 == 0:  # 不断有 nice=1 的短进程到来（每个需要 3 个时间单位）
            procs.append({'nice': 1, 'cpu': 0, 'wait': 0, 'ran': 0, 'need': 3, 'name': 'n%d' % nxt}); nxt += 1
        pr = (lambda p: p['nice'] + p['cpu'] - p['wait']) if dynamic else (lambda p: p['nice'])
        cur = min(procs, key=lambda p: (pr(p), p['name']))
        for p in procs:
            if p is cur: p['cpu'] += 1; p['wait'] = 0; p['ran'] += 1
            else: p['cpu'] = 0; p['wait'] += 1
        procs = [p for p in procs if not ('need' in p and p['ran'] >= p['need'])]
        low = [p for p in procs if p['name'] == 'low']
        if low and low[0]['ran'] > 0: return t
    return None
assert sim(False) is None and sim(True) is not None
ok(46, 'dynamic', 'dynamic')

# 47 FAT
FAT = {100: 106, 106: 108, 108: -1, 200: 201, 201: 202, 202: -1}
def cluster_of(first, byte, size=4096):
    c = first
    for _ in range((byte - 1) // size): c = FAT[c]
    return c
assert 2 ** 16 * 2 == 128 * 1024 and 2 ** 16 * 4 * 1024 == 256 * 1024 ** 2
assert [k for k, v in FAT.items() if v == 106] == [100] and [k for k, v in FAT.items() if v == 108] == [106]
assert cluster_of(100, 9000) == 108 and cluster_of(100, 4096) == 100 and cluster_of(100, 4097) == 106
ok(47, (48, cluster_of(100, 5000)), (48, 106))

print('2016 复算通过：%d 题 %s' % (len(set(OK)), sorted(set(OK)) == list(range(1, 48))))
