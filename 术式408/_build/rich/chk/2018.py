#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2018 408 整卷答案独立复算。跑：python3 _build/rich/chk/2018.py（41 题会调用 gcc）"""
import itertools, math, struct, ipaddress, subprocess, os, random, tempfile
OK = []
def ok(no, got, want, note=''):
    assert got == want, '第 %d 题：算得 %r，应为 %r %s' % (no, got, want, note)
    OK.append(no)

# 1 栈：b op a
S1 = [5, 8, 3, 2]; S2 = ['*', '-', '+']
for _ in range(3):
    a = S1.pop(); b = S1.pop(); op = S2.pop()
    S1.append({'+': b + a, '-': b - a, '*': b * a}[op])
ok(1, S1[-1], 15)

# 2 队列+栈：穷举所有操作序列能得到的输出
def outs():
    res = set()
    def go(q, st, out):
        if not q and not st: res.add(tuple(out)); return
        if q: go(q[1:], st, out + [q[0]]); go(q[1:], st + [q[0]], out)
        if st: go(q, st[:-1], out + [st[-1]])
    go([1, 2, 3, 4, 5, 6], [], []); return res
R = outs()
opts2 = {'A': (1,2,5,6,4,3), 'B': (2,3,4,5,6,1), 'C': (3,4,5,6,1,2), 'D': (6,5,4,3,2,1)}
ok(2, [k for k, v in opts2.items() if v not in R], ['C'])

# 3 上三角行优先，C 下标从 0
idx = 0; pos = {}
for i in range(1, 13):
    for j in range(i, 13): pos[(i, j)] = idx; idx += 1
ok(3, pos[(6, 6)], 50)

# 4 满二叉树：叶 k ⟹ 总 2k-1
for h in range(1, 8):
    k = 2 ** (h - 1); assert 2 ** h - 1 == 2 * k - 1
ok(4, 'A', 'A')

# 5 哈夫曼：最优 WPL 与各选项（前缀码？WPL？）
w = dict(a=6, b=3, c=8, d=2, e=10, f=4)
import heapq
hp = [(v, i, {k: 0}) for i, (k, v) in enumerate(w.items())]; heapq.heapify(hp); cnt = 10
while len(hp) > 1:
    x = heapq.heappop(hp); y = heapq.heappop(hp)
    m = {k: d + 1 for k, d in {**x[2], **y[2]}.items()}; heapq.heappush(hp, (x[0] + y[0], cnt, m)); cnt += 1
dep = hp[0][2]; best = sum(w[k] * dep[k] for k in w)
assert dep == dict(a=2, b=4, c=2, d=4, e=2, f=3), dep
assert best == 80
opts5 = {'A': '00,1011,01,1010,11,100', 'B': '00,100,110,000,0010,01', 'C': '10,1011,11,0011,00,010', 'D': '0011,10,11,0010,01,000'}
good = []
for k, s in opts5.items():
    cs = s.split(','); pre = any(i != j and cs[j].startswith(cs[i]) for i in range(6) for j in range(6))
    wpl = sum(w[c] * len(x) for c, x in zip('abcdef', cs))
    if not pre and wpl == best: good.append(k)
    if k == 'D': assert not pre and wpl == 86
ok(5, good, ['A'])

# 6 BST：中序 x1 x3 x5 x4 x2
inorder = ['x1', 'x3', 'x5', 'x4', 'x2']; rk = {x: i for i, x in enumerate(inorder)}
o6 = {'A': ['x1', 'x2', 'x5'], 'B': ['x1', 'x4', 'x5'], 'C': ['x3', 'x5', 'x4'], 'D': ['x4', 'x3', 'x5']}
ok(6, [k for k, v in o6.items() if rk[v[0]] < rk[v[1]] < rk[v[2]]], ['C'])

# 7 拓扑序列
E7 = [(1,2),(1,3),(2,3),(2,4),(3,4),(5,2),(5,6),(6,4)]
def topo_ok(seq): p = {v: i for i, v in enumerate(seq)}; return all(p[a] < p[b] for a, b in E7)
o7 = {'A': [1,5,2,3,6,4], 'B': [5,1,2,6,3,4], 'C': [5,1,2,3,6,4], 'D': [5,2,1,6,3,4]}
ok(7, [k for k, v in o7.items() if not topo_ok(v)], ['D'])
allt = [p for p in itertools.permutations([1,2,3,4,5,6]) if topo_ok(p)]
assert len(allt) == 7, len(allt)

# 8 3 阶 B 树高 5：最少/最多关键字
m, h = 3, 5; half = math.ceil(m / 2)
mn = 1 + sum(2 * half ** (i - 1) * (half - 1) for i in range(1, h))   # 第 2..h 层
mx = m ** h - 1
ok(8, (mn, mx), (31, 242))

# 9 线性探测
T = [None] * 7; L = {}
for k in [22, 43, 15]:
    i = k % 7; c = 1
    while T[i] is not None: i = (i + 1) % 7; c += 1
    T[i] = k; L[k] = c
ok(9, sum(L.values()) / 3, 2.0)
fail = []
for s in range(7):
    i = s; c = 1
    while T[i] is not None: i = (i + 1) % 7; c += 1
    fail.append(c)
assert sum(fail) == 13          # 变式：失败 ASL = 13/7

# 10 希尔
def shell_pass(a, d):
    a = a[:]
    for g in range(d):
        idxs = list(range(g, len(a), d)); vals = sorted(a[i] for i in idxs)
        for i, v in zip(idxs, vals): a[i] = v
    return a
a0 = [8,3,9,11,2,1,4,7,5,10,6]; r1 = [1,3,7,5,2,6,4,9,11,10,8]; r2 = [1,2,6,4,3,7,5,8,11,10,9]
o10 = {'A': (3,1), 'B': (3,2), 'C': (5,2), 'D': (5,3)}
ok(10, [k for k, (x, y) in o10.items() if shell_pass(a0, x) == r1 and shell_pass(r1, y) == r2], ['D'])

# 11 自底向上建大根堆，记录每次交换后的状态
def build(a):
    a = a[:]; n = len(a); trace = []
    for i in range(n // 2, 0, -1):
        k = i
        while 2 * k <= n:
            j = 2 * k
            if j < n and a[j] > a[j - 1]: j += 1
            if a[j - 1] > a[k - 1]:
                a[j - 1], a[k - 1] = a[k - 1], a[j - 1]; trace.append(tuple(a)); k = j
            else: break
    return trace
tr = build([6,1,5,9,8,4,7])
ok(11, tr, [(6,1,7,9,8,4,5),(6,9,7,1,8,4,5),(9,6,7,1,8,4,5),(9,8,7,1,6,4,5)])

# 13 补码
def s32(x): return x - (1 << 32) if x >> 31 else x
x, y = s32(0xFFFFFFDF), s32(0x00000041)
ok(13, (x, y, (x - y) & 0xFFFFFFFF), (-33, 65, 0xFFFFFF9E))

# 14 IEEE754 最小规格化正数
ok(14, struct.unpack('>f', bytes.fromhex('00800000'))[0], 2.0 ** -126)
assert struct.unpack('>f', bytes.fromhex('00000001'))[0] == 2.0 ** -149

# 15 小端
ok(15, struct.pack('<i', -64).hex(' ').upper(), 'C0 FF FF FF')

# 16 移位
v = 0b11011000
ok(16, (format(v >> 1, '08b'), format((v >> 1) | 0x80, '08b')), ('01101100', '11101100'))

# 17 DRAM 行列
cand = [(2 ** i, 2 ** (11 - i)) for i in range(12)]
pins = lambda rc: max(int(math.log2(rc[0])), int(math.log2(rc[1])))
best17 = min(cand, key=lambda rc: (pins(rc), rc[0]))
ok(17, best17, (32, 64))

# 18 变址
ok(18, (0x2100 - 0x2000) // 8, 32)

# 19 CF / OF（减法）
r1v, r2v = 0xFFFFFFFF, 0xFFFFFFF0
CF = int(r1v < r2v); OF = int(not (-2**31 <= s32(r1v) - s32(r2v) < 2**31))
ok(19, (CF, OF), (0, 0))
# 电路口径：加法器算 R1 + ~R2 + 1，Cout=1，CF = Sub xor Cout = 0
assert ((r1v + ((~r2v) & 0xFFFFFFFF) + 1) >> 32) == 1

# 20 流水线
ok(20, max(80, 50, 50, 70, 50) + 20, 100)

# 24 非抢占优先级 + 1μs 调度开销
P = {'P1': (30, 12, 10), 'P2': (15, 24, 30), 'P3': (18, 36, 20)}
t = 0; tat = {}
for p in sorted(P, key=lambda p: -P[p][2]):
    t += 1 + P[p][1]; tat[p] = P[p][0] + t
ok(24, (tat, sum(tat.values()) / 3), ({'P2': 40, 'P3': 80, 'P1': 105}, 75.0))

# 25 两线程 x++ 交错
cnt2 = 0; tot = 0
for pos1 in itertools.combinations(range(6), 3):
    x = 0; reg = [0, 0]; pc = [0, 0]
    for s in range(6):
        th = 0 if s in pos1 else 1
        if pc[th] == 0: reg[th] = x
        elif pc[th] == 1: reg[th] += 1
        else: x = reg[th]
        pc[th] += 1
    tot += 1; cnt2 += (x == 2)
ok(25, (tot, cnt2), (20, 2))

# 26 单类资源安全性
need = {'P1': 4 - 2, 'P2': 3 - 1, 'P3': 1 - 0}; alloc = {'P1': 2, 'P2': 1, 'P3': 0}
avail = 4 - sum(alloc.values())
safe = 0
for perm in itertools.permutations(need):
    W = avail; good = True
    for p in perm:
        if need[p] > W: good = False; break
        W += alloc[p]
    safe += good
ok(26, safe, 0)

# 36 停等反求帧长：U = (L/C)/(L/C + 2τ)
C = 3000; tau = 0.2; U = 0.4
Lf = U * 2 * tau * C / (1 - U)
ok(36, round(Lf), 800)

# 38 路由聚合
nets = [ipaddress.ip_network('35.230.%d.0/21' % k) for k in (32, 40, 48, 56)]
ok(38, str(list(ipaddress.collapse_addresses(nets))[0]), '35.230.32.0/19')

# 42 MST：穷举 12 选 7
V = ['BJ', 'CS', 'XA', 'QD', 'JN', 'NJ', 'TL', 'WH']
E42 = [('XA','BJ',2),('XA','WH',2),('BJ','TL',3),('BJ','WH',3),('BJ','JN',4),('TL','JN',2),('WH','CS',4),('WH','QD',3),('QD','JN',2),('QD','CS',3),('QD','NJ',2),('JN','NJ',3)]
def is_tree(es):
    par = {v: v for v in V}
    def f(v):
        while par[v] != v: par[v] = par[par[v]]; v = par[v]
        return v
    for a, b, _ in es:
        ra, rb = f(a), f(b)
        if ra == rb: return False
        par[ra] = rb
    return True
trees = [es for es in itertools.combinations(E42, 7) if is_tree(es)]
mw = min(sum(e[2] for e in es) for es in trees)
msts = [es for es in trees if sum(e[2] for e in es) == mw]
def hops(es, s, t):           # 路径上的结点序列
    adj = {v: [] for v in V}
    for a, b, _ in es: adj[a].append(b); adj[b].append(a)
    prev = {s: None}; q = [s]
    for u in q:
        for x in adj[u]:
            if x not in prev: prev[x] = u; q.append(x)
    path = [t]
    while path[-1] != s: path.append(prev[path[-1]])
    return path[::-1]
res42 = []
for es in msts:
    path = hops(es, 'TL', 'BJ')
    # 每个路由器转发前 TTL−1，减到 0 就丢弃；BJ 也要把分组转发给 H2 ⟹ 需 5 − 路由器数 ≥ 1
    res42.append((len(path), 5 - len(path) >= 1))
common = set(msts[0]) & set(msts[1])
ok(42, (mw, len(msts), sorted(res42)), (16, 2, [(2, True), (6, False)]))
assert sum(e[2] for e in common) == 13 and len(common) == 6

# 43 I/O 三问
f = 500e6
q1_gap = 4 / 2e6; q1 = (1 / q1_gap) * 10 * 4 / f
t_int = 400 / f; t_B = 4 / 40e6
q3 = (40e6 / 1000) * 500 / f
ok(43, (round(q1_gap * 1e6, 3), round(q1, 4), round(t_int * 1e6, 3), round(t_B * 1e6, 3), t_B < t_int, round(q3, 4)), (2.0, 0.04, 0.8, 0.1, True, 0.04))

# 44 TLB/Cache
TLB = {0x00324: (1, 0xF800), 0x0008C: (1, 0x0040), 0x8C040: (1, 0x0160), 0x04320: (0, 0x0E80)}
CACHE = {0: [(1, 0xF8000), (1, 0xF2840)], 1: [(1, 0x008C0), (0, 0x23008)], 2: [(0, 0x00400), (1, 0x01600)]}
va = 0x0008C040; vpn, off = va >> 12, va & 0xFFF
vbit, ppn = TLB[vpn]; assert vbit == 1
pa = (ppn << 12) | off
tag, grp = pa >> 8, (pa >> 5) & 7
hit = any(v == 1 and t == tag for v, t in CACHE[grp])
grp2 = (0x0007C260 >> 5) & 7
bits = 8 * 2 * (20 + 1 + 1 + 1 + 32 * 8)
ok(44, (16 + 12, hex(pa), tag, grp, hit, grp2, bits, bits // 8), (28, '0x40040', 0x00400, 2, False, 3, 4464, 558))

# 45 拼虚拟地址
ok(45, '%08X' % ((6 << 22) | (6 << 12) | 8), '01806008')

# 46 混合索引
n = 4096 // 4
maxblk = 8 + n + n ** 2 + n ** 3
inodes = (1 << 20) * 4096 // 64; files_data = (512 << 20) // math.ceil(5600 / 4096)
F1_blocks, F2_blocks = math.ceil(6 * 1024 / 4096), math.ceil(40 * 1024 / 4096)
ok(46, (maxblk * 4, inodes >> 20, files_data >> 20, min(inodes, files_data) >> 20, F1_blocks <= 8, 8 < F2_blocks <= 8 + n),
   ((8 + 1024 + 1024**2 + 1024**3) * 4, 64, 256, 64, True, True))

# 47 子网与分片
sales = ipaddress.ip_network('192.168.1.0/25'); tech = ipaddress.ip_network('192.168.1.128/25')
used = (208 - 129 + 1) + 1
left = tech.num_addresses - 2 - used
maxd = (800 - 20) // 8 * 8; nf = math.ceil((1500 - 20) / maxd)
ok(47, (str(sales.broadcast_address), str(tech.network_address), left, maxd, nf, [i * maxd // 8 for i in range(nf)]),
   ('192.168.1.127', '192.168.1.128', 45, 776, 2, [0, 97]))

# 41 C 代码：gcc 编译 + 随机对拍
C41 = r'''
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int findMissMin(int A[], int n){
    int i, *B = (int *)malloc(sizeof(int) * n);
    memset(B, 0, sizeof(int) * n);
    for (i = 0; i < n; i++)
        if (A[i] > 0 && A[i] <= n) B[A[i] - 1] = 1;
    for (i = 0; i < n; i++)
        if (B[i] == 0) break;
    free(B);
    return i + 1;
}
int swapWay(int A[], int n){            /* 变式：O(1) 额外空间（会改动原数组） */
    int i, t;
    for (i = 0; i < n; i++)
        while (A[i] > 0 && A[i] <= n && A[A[i] - 1] != A[i]) { t = A[A[i] - 1]; A[A[i] - 1] = A[i]; A[i] = t; }
    for (i = 0; i < n; i++) if (A[i] != i + 1) break;
    return i + 1;
}
int main(void){
    int T, n, i, A[64], B[64];
    if (scanf("%d", &T) != 1) return 1;
    while (T--) {
        scanf("%d", &n);
        for (i = 0; i < n; i++) { scanf("%d", &A[i]); B[i] = A[i]; }
        printf("%d %d\n", findMissMin(A, n), swapWay(B, n));
    }
    return 0;
}
'''
d = tempfile.mkdtemp(); src = os.path.join(d, 'a.c'); exe = os.path.join(d, 'a')
open(src, 'w').write(C41)
subprocess.run(['gcc', '-O2', '-Wall', '-o', exe, src], check=True)
rnd = random.Random(2018); cases = []
for _ in range(20000):
    n = rnd.randint(1, 30); cases.append([rnd.randint(-5, n + 3) for _ in range(n)])
cases += [[-5, 3, 2, 3], [1, 2, 3]]
inp = '%d\n' % len(cases) + ''.join('%d %s\n' % (len(c), ' '.join(map(str, c))) for c in cases)
out = subprocess.run([exe], input=inp, capture_output=True, text=True, check=True).stdout.split('\n')
for c, line in zip(cases, out):
    want = next(k for k in range(1, len(c) + 2) if k not in c)
    assert line == '%d %d' % (want, want), (c, line)
assert out[len(cases) - 2] == '1 1' and out[len(cases) - 1] == '4 4'
OK.append(41)

print('复算通过：%d 题有数值/模拟核对 →' % len(set(OK)), sorted(set(OK)))
print('42 题两棵 MST 的公共边：', sorted((a, b, c) for a, b, c in common))
for es in msts: print('  MST:', [e for e in es if e not in common], ' TL→BJ 路径', hops(es, 'TL', 'BJ'))

# ── 举一反三里用到的数 ──
S1v = [5, 8, 3, 2]
for op in ['-', '*', '+']:                                  # 运算符栈 + * −（− 在顶）
    a = S1v.pop(); b = S1v.pop(); S1v.append({'+': b + a, '-': b - a, '*': b * a}[op])
assert S1v == [13]
w2 = dict(a=6, b=3, c=8, d=2, e=10, f=7)
hp = [(v, i, {k: 0}) for i, (k, v) in enumerate(w2.items())]; heapq.heapify(hp); cnt = 10
while len(hp) > 1:
    x_ = heapq.heappop(hp); y_ = heapq.heappop(hp)
    heapq.heappush(hp, (x_[0] + y_[0], cnt, {k: d_ + 1 for k, d_ in {**x_[2], **y_[2]}.items()})); cnt += 1
assert hp[0][2] == dict(a=3, b=4, c=2, d=4, e=2, f=2) and sum(w2[k] * hp[0][2][k] for k in w2) == 88
assert shell_pass(a0, 4) == [2, 1, 4, 7, 5, 3, 6, 11, 8, 10, 9]
assert sum(1 for i in range(11) for j in range(i + 1, 11) if r2[i] > r2[j]) == 8
assert 1 + 2 * 2 + 6 * 2 == 17 and 1 + 3 + 9 + 27 + 81 == 121 and 3 ** 3 - 1 < 31 <= 3 ** 4 - 1
# 13 / 15 / 16
X13, Y13 = s32(0xFFFFFFDF), 0x41
assert (X13 + Y13) & 0xFFFFFFFF == 0x20 and 0xFFFFFFDF == 4294967263 and (Y13 - X13) == 0x62
assert struct.pack('<i', 64).hex(' ') == '40 00 00 00' and struct.unpack('<i', bytes.fromhex('F6FFFFFF'))[0] == -10
assert ((s32(0xFFFFFFD8) >> 2) & 0xFF) == 0xF6 and (-40 >> 2) == -10 and (-41 >> 1) == -21
# 17 / 18 / 19 / 20
assert min([(2 ** i, 2 ** (12 - i)) for i in range(13)], key=lambda rc: (max(math.log2(rc[0]), math.log2(rc[1])), rc[0])) == (64, 64)
assert 2e-3 / 32 == 62.5e-6 and 256 // 4 == 64 and 0x2000 + 40 * 8 == 0x2140
def cfof(a, b): return int(a < b), int(not (-2**31 <= s32(a) - s32(b) < 2**31))
assert cfof(1, 0xFFFFFFFF) == (1, 0) and cfof(0x7FFFFFFF, 0xFFFFFFFF) == (1, 1) and cfof(0x80000000, 1) == (0, 1)
assert (5 + 100 - 1) * 100 == 10400 and 80 + 50 + 50 + 70 + 50 == 300 and max(40, 40, 50, 50, 70, 50) + 20 == 90
# 24 变式：SJF；不计开销
t_ = 0; tat2 = {}
for p_ in sorted(P, key=lambda p_: P[p_][1]):
    t_ += 1 + P[p_][1]; tat2[p_] = P[p_][0] + t_
assert sum(tat2.values()) / 3 == 63
assert sum(tat[p_] - P[p_][1] for p_ in P) / 3 == 51
t_ = 0; s_ = 0
for p_ in ['P2', 'P3', 'P1']: t_ += P[p_][1]; s_ += P[p_][0] + t_
assert s_ / 3 == 73
# 25 变式：三线程
def interleave3():
    tot = 0; c3 = 0
    for seq in set(itertools.permutations([0] * 3 + [1] * 3 + [2] * 3)):
        xx = 0; reg = [0] * 3; pc = [0] * 3
        for th in seq:
            if pc[th] == 0: reg[th] = xx
            elif pc[th] == 1: reg[th] += 1
            else: xx = reg[th]
            pc[th] += 1
        tot += 1; c3 += (xx == 3)
    return tot, c3
assert interleave3() == (1680, 6)
# 26 变式
def nsafe(total, alloc, mx):
    need = {k: mx[k] - alloc[k] for k in mx}; av = total - sum(alloc.values()); n_ = 0
    for perm in itertools.permutations(mx):
        W = av; good = True
        for p_ in perm:
            if need[p_] > W: good = False; break
            W += alloc[p_]
        n_ += good
    return n_
assert nsafe(5, alloc, {'P1': 4, 'P2': 3, 'P3': 1}) == 6
assert nsafe(4, {'P1': 2, 'P2': 1, 'P3': 1}, {'P1': 4, 'P2': 3, 'P3': 1}) == 0
assert nsafe(4, {'P1': 3, 'P2': 1, 'P3': 0}, {'P1': 4, 'P2': 3, 'P3': 1}) == 0
# 36 / 38 / 40
TD = 0.4 * 0.4 / (1 - 0.8); assert abs(TD - 0.8) < 1e-9 and round(TD * 3000) == 2400 and round(0.4 * 3000) == 1200
assert str(list(ipaddress.collapse_addresses(nets[:2]))[0]) == '35.230.32.0/20'
assert ipaddress.ip_address('35.230.60.1') in ipaddress.ip_network('35.230.32.0/19')
assert 3000 // 3 * 4 == 4000
# 42 变式：BJ–JN 降价；TTL 下限
def msts_with(w_bjjn):
    E2 = [(a, b, (w_bjjn if (a, b) == ('BJ', 'JN') else c)) for a, b, c in E42]
    tr = [es for es in itertools.combinations(E2, 7) if is_tree(es)]
    m_ = min(sum(e[2] for e in es) for es in tr)
    return m_, len([es for es in tr if sum(e[2] for e in es) == m_])
assert msts_with(3) == (16, 3) and msts_with(2) == (15, 1)
assert min(t for t in range(1, 20) if t - 6 >= 1) == 7
def msts_btl4():
    E2 = [(a, b, (4 if (a, b) == ('BJ', 'TL') else c)) for a, b, c in E42]
    tr = [es for es in itertools.combinations(E2, 7) if is_tree(es)]
    m_ = min(sum(e[2] for e in es) for es in tr); return m_, len([es for es in tr if sum(e[2] for e in es) == m_])
assert msts_btl4() == (16, 1)
# 43 变式
assert round((1 / 2e-6) * 400 / f, 4) == 0.4 and 0.1e-6 * f == 50
assert round((1 / 0.1e-6) * 40 / f, 4) == 0.8 and round((40e6 / 4000) * 500 / f, 4) == 0.01
# 44 变式
va = 0x00324010; vb, pp = TLB[va >> 12]; pa2 = (pp << 12) | (va & 0xFFF)
assert vb == 1 and pa2 == 0xF800010 and any(v == 1 and t2 == pa2 >> 8 for v, t2 in CACHE[(pa2 >> 5) & 7])
assert 8 * 2 * (20 + 1 + 1 + 256) == 4448 and 16 * (21 + 1 + 2 + 1 + 256) == 4496 and TLB[0x04320][0] == 0
# 45 变式
v45 = 0x00403005; assert (v45 >> 22, (v45 >> 12) & 0x3FF, v45 & 0xFFF) == (1, 3, 5)
assert '%08X' % ((6 << 23) | (6 << 12) | 8) == '03006008'
# 46 变式
assert ((2 << 20) * 4096 // 64) >> 20 == 128 and 8 < 1033 - 1024 and 8 + 1024 < 1033 <= 8 + 1024 + 1024 ** 2
# 47 变式
assert 126 - 20 - 1 == 105
md = (576 - 20) // 8 * 8; nf2 = math.ceil(1480 / md)
assert (md, nf2, [i * md // 8 for i in range(nf2)], 1480 - md * (nf2 - 1)) == (552, 3, [0, 69, 138], 376)
assert 2 ** 6 - 2 == 62
print('举一反三数值核对通过')
