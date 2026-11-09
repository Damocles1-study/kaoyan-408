#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2020 年 408 精解 · 独立复算。每道题用模拟 / 穷举 / 对拍算一遍答案，与卷子答案和精解里写的中间结果核对。
用法：python3 _build/rich/chk/2020.py   全部 PASS 退出码 0；41 题的 C 代码会用 gcc 编译并与暴力对拍。"""
import itertools, random, os, subprocess, tempfile, sys, struct, heapq
R = random.Random(2020)
OK = []
def ck(no, cond, msg):
    OK.append(cond)
    print(('PASS' if cond else 'FAIL') + ' #%d %s' % (no, msg))

# ---------- 1 对称矩阵上三角列优先 ----------
idx, k = {}, 0
for j in range(1, 11):
    for i in range(1, j + 1): idx[(i, j)] = k; k += 1
rowidx, k = {}, 0
for i in range(1, 11):
    for j in range(i, 11): rowidx[(i, j)] = k; k += 1
low, k = {}, 0
for i in range(1, 11):
    for j in range(1, i + 1): low[(i, j)] = k; k += 1
ck(1, idx[(2, 7)] == 22, 'm72→m27 列优先 0 起 = %d（行优先 %d，下三角行优先 %d）' % (idx[(2, 7)], rowidx[(2, 7)], low[(7, 2)]))
ck(1, rowidx[(2, 7)] == 15 and low[(7, 2)] == 22, '变式：行优先 15、下三角行优先 22')

# ---------- 2 栈 ----------
seq, st, out = list('abcde'), [], []
for op in ['Push', 'Push', 'Pop', 'Push', 'Pop', 'Push', 'Push', 'Pop']:
    if op == 'Push': st.append(seq.pop(0))
    else: out.append(st.pop())
ck(2, out == list('bce') and st == ['a', 'd'], '出栈 %s，栈里剩 %s' % (out, st))

# ---------- 3 顺序存储 ----------
def trees(n):
    if n == 0: yield None; return
    for l in range(n):
        for L in trees(l):
            for Rr in trees(n - 1 - l): yield (L, Rr)
def h(t): return 0 if t is None else 1 + max(h(t[0]), h(t[1]))
def maxidx(t, i=1): return 0 if t is None else max(i, maxidx(t[0], 2 * i), maxidx(t[1], 2 * i + 1))
mx = [maxidx(t) for t in trees(10) if h(t) == 5]
ck(3, max(mx) == 31 and min(mx) == 16, '高 5、10 结点：所有形态最大编号的最大值 %d（选 A），最小值 %d' % (max(mx), min(mx)))

# ---------- 4 森林 → 二叉树 ----------
def build(pre, ino):
    if not pre: return None
    r = pre[0]; i = ino.index(r)
    return (r, build(pre[1:i + 1], ino[:i]), build(pre[i + 1:], ino[i + 1:]))
def post(t): return [] if t is None else post(t[1]) + post(t[2]) + [t[0]]
T = build(list('abcdef'), list('badfec'))
ck(4, ''.join(post(T)) == 'bfedca', 'T 后序 %s' % ''.join(post(T)))
# 森林：沿右链数棵数，左指针空的是叶子
def rchain(t): return 0 if t is None else 1 + rchain(t[2])
def leaves(t): return 0 if t is None else (1 if t[1] is None else 0) + leaves(t[1]) + leaves(t[2])
ck(4, rchain(T) == 2 and leaves(T) == 3, '森林 %d 棵树、%d 个叶子' % (rchain(T), leaves(T)))

# ---------- 5 BST ----------
def bst(seq):
    t = None
    def ins(t, x):
        if t is None: return [x, None, None]
        if x < t[0]: t[1] = ins(t[1], x)
        else: t[2] = ins(t[2], x)
        return t
    for x in seq: t = ins(t, x)
    return t
tgt = bst([4, 2, 1, 3, 5])
bad = [c for c, s in zip('ABCD', [[4, 5, 2, 1, 3], [4, 5, 1, 2, 3], [4, 2, 5, 3, 1], [4, 2, 1, 3, 5]]) if bst(s) != tgt]
cnt = sum(1 for p in itertools.permutations([1, 2, 3, 4, 5]) if bst(p) == tgt)
ck(5, bad == ['B'] and cnt == 8, '生成不了目标树的只有 %s；能生成的序列共 %d 个' % (bad, cnt))

# ---------- 6 DFS 退出时输出 = 逆拓扑 ----------
good = True
for _ in range(3000):
    n = R.randint(2, 8); order = list(range(n)); R.shuffle(order)
    E = {u: [] for u in range(n)}
    for a in range(n):
        for b in range(a + 1, n):
            if R.random() < .35: E[order[a]].append(order[b])
    vis, out = set(), []
    def dfs(v):
        vis.add(v)
        for w in E[v]:
            if w not in vis: dfs(w)
        out.append(v)
    for v in range(n):
        if v not in vis: dfs(v)
    pos = {v: i for i, v in enumerate(out)}
    if any(pos[u] < pos[w] for u in E for w in E[u]): good = False
ck(6, good, '3000 张随机 DAG：退栈输出序列里每条弧都是弧头在前（逆拓扑）')

# ---------- 7 Kruskal / Prim ----------
Eg = {('a', 'b'): 20, ('a', 'c'): 12, ('a', 'e'): 9, ('b', 'd'): 6, ('b', 'e'): 11, ('b', 'f'): 5, ('c', 'd'): 18, ('c', 'e'): 10, ('d', 'e'): 14, ('d', 'f'): 7}
par = {v: v for v in 'abcdef'}
def find(x):
    while par[x] != x: x = par[x]
    return x
kr, skipped = [], []
for (u, v), w in sorted(Eg.items(), key=lambda x: x[1]):
    if find(u) != find(v): par[find(u)] = find(v); kr.append((u, v))
    else: skipped.append((u, v))
    if len(kr) == 5: break
inT, pr = {'a'}, []
while len(inT) < 6:
    e = min(((u, v) for (u, v) in Eg if (u in inT) != (v in inT)), key=lambda e: Eg[e])
    pr.append(e); inT |= set(e)
ck(7, kr == [('b', 'f'), ('b', 'd'), ('a', 'e'), ('c', 'e'), ('b', 'e')] and skipped == [('d', 'f')], 'Kruskal %s，跳过 %s，总权 %d' % (kr, skipped, sum(Eg[e] for e in kr)))
ck(7, pr == [('a', 'e'), ('c', 'e'), ('b', 'e'), ('b', 'f'), ('b', 'd')], 'Prim 从 a：%s（= 选项 D）' % pr)

# ---------- 8 AOE：两条关键路径时只缩一条无效 ----------
def longest(acts):
    import functools
    @functools.lru_cache(None)
    def L(v): return max([L(u) + w for (u, x), w in acts.items() if x == v], default=0)
    return L('t')
acts = {('s', 'a'): 3, ('a', 't'): 3, ('s', 'b'): 2, ('b', 't'): 4}
a2 = dict(acts); a2[('s', 'a')] = 2
a3 = dict(acts); a3[('s', 'a')] = 4
ck(8, longest(acts) == 6 and longest(a2) == 6 and longest(a3) == 7, '两条关键路径都长 6：缩 s→a 到 2 工期仍 %d；延长到 4 工期变 %d' % (longest(a2), longest(a3)))

# ---------- 9 大根堆 ----------
ok9, third_lv = True, set()
for _ in range(5000):
    n = R.randint(2, 15); a = R.sample(range(100), n)
    hp = [-x for x in a]; heapq.heapify(hp); A = [None] + [-x for x in hp]
    s = sorted(a, reverse=True)
    if A.index(s[1]) not in (2, 3): ok9 = False
    if n >= 3: third_lv.add(A.index(s[2]).bit_length())
ck(9, ok9 and third_lv == {2, 3}, '5000 个随机大根堆：次大值永远在下标 2/3；第三大出现在第 %s 层' % sorted(third_lv))

# ---------- 10 B 树 ----------
def btree_insert(keys, m):
    root = {'k': [], 'c': []}
    def ins(nd, x):
        if not nd['c']:
            nd['k'].append(x); nd['k'].sort()
        else:
            i = sum(1 for y in nd['k'] if y < x)
            r = ins(nd['c'][i], x)
            if r:
                mid, L, Rr = r
                nd['k'].insert(i, mid); nd['c'][i:i + 1] = [L, Rr]
        if len(nd['k']) > m - 1:
            p = -(-m // 2) - 1  # 第 ⌈m/2⌉ 个（0 起下标）
            L = {'k': nd['k'][:p], 'c': nd['c'][:p + 1]}
            Rr = {'k': nd['k'][p + 1:], 'c': nd['c'][p + 1:]}
            return (nd['k'][p], L, Rr)
        return None
    for x in keys:
        r = ins(root, x)
        if r: root = {'k': [r[0]], 'c': [r[1], r[2]]}
    return root
def height(nd): return 1 + (height(nd['c'][0]) if nd['c'] else 0)
S10 = [5, 6, 9, 13, 8, 2, 12, 15]
r4 = btree_insert(S10, 4); r3 = btree_insert(S10, 3); r4b = btree_insert(S10 + [16], 4)
ck(10, r4['k'] == [6, 9], '4 阶根 %s' % r4['k'])
ck(10, r3['k'] == [9] and height(r3) == 3, '变式 3 阶根 %s，高 %d' % (r3['k'], height(r3)))
ck(10, r4b['k'] == [6, 9, 13], '变式 再插 16，根 %s' % r4b['k'])

# ---------- 11 插入 vs 选择 ----------
def ins_sort(a):
    a = a[:]; c = mv = 0
    for i in range(1, len(a)):
        x = a[i]; j = i - 1
        while j >= 0:
            c += 1
            if a[j] > x: a[j + 1] = a[j]; mv += 1; j -= 1
            else: break
        a[j + 1] = x
    return c, mv
def sel_sort(a):
    a = a[:]; c = mv = 0
    for i in range(len(a) - 1):
        m = i
        for j in range(i + 1, len(a)):
            c += 1
            if a[j] < a[m]: m = j
        if m != i: a[i], a[m] = a[m], a[i]; mv += 3
    return c, mv
n = 100; srt = list(range(n))
ci, mi = ins_sort(srt); cs, ms = sel_sort(srt)
near = srt[:]
for _ in range(3):
    i = R.randrange(n - 1); near[i], near[i + 1] = near[i + 1], near[i]
rnd = R.sample(range(n), n)
ck(11, (ci, mi, cs, ms) == (99, 0, 4950, 0), '已有序 n=100：插入比较 %d 移动 %d；选择比较 %d 移动 %d' % (ci, mi, cs, ms))
ck(11, ins_sort(near)[0] < sel_sort(near)[0] and ins_sort(rnd)[1] > sel_sort(rnd)[1], '基本有序比较 插入 %d < 选择 %d；随机时移动 插入 %d > 选择 %d' % (ins_sort(near)[0], sel_sort(near)[0], ins_sort(rnd)[1], sel_sort(rnd)[1]))

# ---------- 13 位模式 ----------
w = 0xC8000000
as_int = w - (1 << 32); as_f = struct.unpack('>f', w.to_bytes(4, 'big'))[0]
ck(13, as_int == -7 * 2 ** 27 and as_f == -2.0 ** 17 and w == 25 * 2 ** 27, 'int %d = -7·2^27；float %g = -2^17；unsigned %d = 25·2^27' % (as_int, as_f, w))

# ---------- 14 对齐 + 小端 ----------
base = 0x2020FE00; off = 0; lay = {}
for name, size in [('x1', 2), ('x2', 4)]:
    off = (off + size - 1) // size * size; lay[name] = off; off += size
size_a = (off + 3) // 4 * 4
mem = {base + lay['x2'] + i: b for i, b in enumerate((0x12340000).to_bytes(4, 'little'))}
addr34 = [a for a, b in mem.items() if b == 0x34][0]
ck(14, addr34 == 0x2020FE06 and size_a == 8, '34H 在 %08XH，sizeof=%d，12H 在 %08XH' % (addr34, size_a, [a for a, b in mem.items() if b == 0x12][0]))

# ---------- 16 指令格式 ----------
import math
op = math.ceil(math.log2(48)); am = math.ceil(math.log2(4)); ad = 16 - op - am
ck(16, (op, am, ad, 2 ** ad - 1) == (6, 2, 8, 255), '操作码 %d 位、寻址特征 %d 位、地址码 %d 位 ⟹ 0～%d' % (op, am, ad, 2 ** ad - 1))

# ---------- 19 QPI ----------
bw = 2.4e9 * 2 * 2 * 2
ck(19, abs(bw - 19.2e9) < 1, 'QPI 带宽 %.1f GB/s' % (bw / 1e9))

# ---------- 22 DMA 请求次数 ----------
ck(22, 512 // 4 == 128, '512B ÷ 4B = %d 次总线请求' % (512 // 4))

# ---------- 27 银行家 ----------
alloc = {'P1': (2, 3), 'P2': (2, 1), 'P3': (1, 2)}; mxm = {'P1': (4, 4), 'P2': (3, 1), 'P3': (3, 4)}
need = {p: tuple(a - b for a, b in zip(mxm[p], alloc[p])) for p in alloc}
avail = tuple(6 - sum(alloc[p][i] for p in alloc) for i in range(2))
def safe(seq, av):
    av = list(av)
    for p in seq:
        if any(need[p][i] > av[i] for i in range(2)): return False
        av = [av[i] + alloc[p][i] for i in range(2)]
    return True
safes = [s for s in itertools.permutations(alloc) if safe(s, avail)]
ck(27, avail == (1, 0) and safes == [('P2', 'P1', 'P3')], 'Need %s，Available %s，安全序列 %s' % (need, avail, safes))
# 变式：P1 请求 (1,0)
need2 = dict(need); need2['P1'] = (1, 1); alloc2 = dict(alloc); alloc2['P1'] = (3, 3)
need_b, alloc_b = need, alloc
need, alloc = need2, alloc2
s2 = [s for s in itertools.permutations(alloc) if safe(s, (0, 0))]
need, alloc = need_b, alloc_b
ck(27, s2 == [], '变式 P1 再请求 (1,0)：试分配后 Available=(0,0)，安全序列 %d 条 ⟹ 拒绝' % len(s2))

# 变式：P2 请求 (1,0) 可分配；B 总数改 7 时两条安全序列
need3 = dict(need_b); need3['P2'] = (0, 0); alloc3 = dict(alloc_b); alloc3['P2'] = (3, 1)
need, alloc = need3, alloc3
s3 = [s for s in itertools.permutations(alloc) if safe(s, (0, 0))]
need, alloc = need_b, alloc_b
s4 = [s for s in itertools.permutations(alloc) if safe(s, (1, 1))]
ck(27, len(s3) > 0 and s4 == [('P2', 'P1', 'P3'), ('P2', 'P3', 'P1')], '变式 P2 请求 (1,0) 后仍安全（%d 条）；B 总数 7 时安全序列 %s' % (len(s3), s4))

# ---------- 31 ----------
ck(31, 26 ** 60 > 2 ** 32 and 4 * 8 == 32, 'inode 号 32 位 ⟹ 2^32；文件名组合 26^60 ≈ 2^%d 远大于它' % round(60 * math.log2(26)))

# ---------- 36 停等 ----------
Td = 1000 * 8 / 10e3; Tp = .2
U = {'A': Td / (Td + Tp), 'B': Td / (Td + 2 * Tp), 'C': Td / (2 * Td + Tp), 'D': Td / (2 * Td + 2 * Tp)}
ck(36, round(U['D'], 3) == .4 and [round(U[k] * 100, 1) for k in 'ABC'] == [80.0, 66.7, 44.4], '四种口径 %s' % {k: round(v * 100, 1) for k, v in U.items()})

# ---------- 38 拥塞窗口 ----------
def rtts(c0, c1, ss):
    c, n = c0, 0
    while c < c1:
        c = min(c * 2, ss) if c < ss else c + 1; n += 1
    return n
ck(38, rtts(8, 32, 8) * 2 == 48 and rtts(8, 32, 64) * 2 == 4 and rtts(8, 32, 16) * 2 == 34, '最长 %dms、最短 %dms、ssthresh=16 时 %dms' % (rtts(8, 32, 8) * 2, rtts(8, 32, 64) * 2, rtts(8, 32, 16) * 2))

# ---------- 39 序号 ----------
ck(39, len(range(1001, 5001)) == 4000, '数据字节 1001..5000 共 %d' % len(range(1001, 5001)))

# ---------- 40 DNS + HTTP ----------
RTT = 10; http = 1.5 + 0.5
ck(40, (0 + http) * RTT == 20 and (3 + http) * RTT == 50, '最短 %gms，最长 %gms' % ((0 + http) * RTT, (3 + http) * RTT))

# ---------- 41 C 代码编译 + 对拍 ----------
C41 = r'''
#include <stdio.h>
#include <stdlib.h>
#define INT_MAX 0x7fffffff
int abs_(int x){ return x < 0 ? -x : x; }
int xls_min(int a, int b, int c){       /* a 是不是三个数中的最小值 */
    return a <= b && a <= c;
}
int findMinofTrip(int A[], int n, int B[], int m, int C[], int p){
    int i = 0, j = 0, k = 0, D_min = INT_MAX, D;
    while (i < n && j < m && k < p && D_min > 0){
        D = abs_(A[i] - B[j]) + abs_(B[j] - C[k]) + abs_(C[k] - A[i]);
        if (D < D_min) D_min = D;
        if (xls_min(A[i], B[j], C[k])) i++;      /* 只让最小的那个后移 */
        else if (xls_min(B[j], C[k], A[i])) j++;
        else k++;
    }
    return D_min;
}
int main(void){
    int T; if (scanf("%d", &T) != 1) return 1;
    while (T--){
        int n, m, p, A[64], B[64], C[64];
        scanf("%d", &n); for (int i = 0; i < n; i++) scanf("%d", &A[i]);
        scanf("%d", &m); for (int i = 0; i < m; i++) scanf("%d", &B[i]);
        scanf("%d", &p); for (int i = 0; i < p; i++) scanf("%d", &C[i]);
        printf("%d\n", findMinofTrip(A, n, B, m, C, p));
    }
    return 0;
}
'''
d = tempfile.mkdtemp()
open(os.path.join(d, 'a.c'), 'w').write(C41)
r = subprocess.run(['gcc', '-O2', '-Wall', '-o', os.path.join(d, 'a'), os.path.join(d, 'a.c')], capture_output=True, text=True)
ck(41, r.returncode == 0 and not r.stderr.strip(), 'gcc 编译 %s' % (r.stderr.strip() or '无警告'))
cases = [([-1, 0, 9], [-25, -10, 10, 11], [2, 9, 17, 30, 41])]
for _ in range(5000):
    cases.append(tuple(sorted(R.sample(range(-60, 60), R.randint(1, 12))) for _ in range(3)))
inp = '%d\n' % len(cases) + ''.join('%d %s\n%d %s\n%d %s\n' % (len(a), ' '.join(map(str, a)), len(b), ' '.join(map(str, b)), len(c), ' '.join(map(str, c))) for a, b, c in cases)
got = subprocess.run([os.path.join(d, 'a')], input=inp, capture_output=True, text=True).stdout.split()
want = [min(abs(a - b) + abs(b - c) + abs(c - a) for a in A for b in B for c in C) for A, B, C in cases]
ck(41, got[0] == '2' and list(map(int, got)) == want, '题例 = %s；5000 组随机与三重循环暴力对拍 %s' % (got[0], '零失配' if list(map(int, got)) == want else '失配'))

# ---------- 42 前缀码判定（二叉树插入法 vs 两两比较）----------
def trie_prefix(codes):
    root = {}
    for c in codes:
        nd, created = root, False
        for ch in c:
            if nd.get('leaf'): return False          # 途经叶子
            if ch not in nd: nd[ch] = {}; created = True
            nd = nd[ch]
        if not created: return False                 # 一个结点都没新建
        nd['leaf'] = True
    return True
def pairwise(codes):
    return not any(a != b and b.startswith(a) for a in codes for b in codes) and len(set(codes)) == len(codes)
ok42 = True
for _ in range(20000):
    codes = [''.join(R.choice('01') for _ in range(R.randint(1, 4))) for _ in range(R.randint(2, 6))]
    if trie_prefix(codes) != pairwise(codes): ok42 = False
ck(42, ok42, '20000 组随机编码：建树判定与两两 startswith 一致')
def decode(codes, s):
    root = {}
    for ch_, c in codes.items():
        nd = root
        for b in c: nd = nd.setdefault(b, {})
        nd['ch'] = ch_
    out, nd = '', root
    for b in s:
        nd = nd[b]
        if 'ch' in nd: out += nd['ch']; nd = root
    return out
ck(42, decode({'a': '0', 'b': '10', 'c': '110', 'd': '111'}, '0101100111') == 'abcad', '译码示例 0101100111 → abcad')

# ---------- 43 乘法溢出 ----------
x, y = 2 ** 31 - 1, 2
p = x * y; hi, lo = p >> 32, p & 0xFFFFFFFF
def s_ovf(p64):  # 有符号：高 33 位全同才不溢出
    top = (p64 & 0xFFFFFFFFFFFFFFFF) >> 31
    return top not in (0, (1 << 33) - 1)
ck(43, (hi, lo) == (0, 0xFFFFFFFE) and s_ovf(p) and hi == 0, '64 位积 %08X %08XH；unsigned 不溢出（高 32 位全 0），int 溢出（高 33 位不全同）' % (hi, lo))
p3 = x * 3
ck(43, (p3 >> 32, p3 & 0xFFFFFFFF) == (1, 0x7FFFFFFD), '变式 y=3：%08X %08XH，unsigned 也溢出' % (p3 >> 32, p3 & 0xFFFFFFFF))
# 判据与范围法对拍
okb = True
for _ in range(20000):
    a, b = R.randint(-2 ** 31, 2 ** 31 - 1), R.randint(-2 ** 31, 2 ** 31 - 1)
    if s_ovf(a * b) != (not -2 ** 31 <= a * b <= 2 ** 31 - 1): okb = False
    ua, ub = a & 0xFFFFFFFF, b & 0xFFFFFFFF
    if ((ua * ub) >> 32 != 0) != (ua * ub > 2 ** 32 - 1): okb = False
ck(43, okb, '20000 组随机：「高 n+1 位全同」「高 n 位全 0」两条位级判据与范围判据一致')

# ---------- 44 Cache ----------
B, WAY, SETS = 64, 8, 32 * 1024 // (64 * 8)
tagbits = 32 - int(math.log2(B)) - int(math.log2(SETS))
cache = [[] for _ in range(SETS)]; miss = acc = 0
def access(a):
    global miss, acc
    acc += 1; blk = a // B; s = blk % SETS; t = blk // SETS
    if t in cache[s]: cache[s].remove(t); cache[s].append(t)
    else:
        miss += 1
        if len(cache[s]) == WAY: cache[s].pop(0)
        cache[s].append(t)
for kk in range(1024):
    a = 0x008000C0 + 4 * kk; access(a); access(a)
a3 = 0x00010003
ck(44, (SETS, tagbits, miss, acc) == (64, 20, 64, 2048), '组数 %d、标记 %d 位；s[k]=2*s[k] 访问 %d 次缺失 %d 次' % (SETS, tagbits, acc, miss))
ck(44, (a3 & 63, (a3 >> 6) & 63, a3 >> 12) == (3, 0, 0x10), '0001 0003H：块内 %d、组号 %d、标记 %05XH' % (a3 & 63, (a3 >> 6) & 63, a3 >> 12))
cache = [[] for _ in range(SETS)]; miss = acc = 0
for kk in range(1024):
    a = 0x008000C4 + 4 * kk; access(a); access(a)
ck(44, miss == 65, '变式 首地址 0080 00C4H（不对齐）缺失 %d 次' % miss)

cache = [[] for _ in range(SETS)]; miss = acc = 0
for kk in range(0, 1024, 16):
    a = 0x008000C0 + 4 * kk; access(a); access(a)
ck(44, (acc, miss) == (128, 64), '变式 步长 16：访问 %d 次、缺失 %d 次（命中率 50%%）' % (acc, miss))
# 43 的变式
p1 = (-1 * 2) & 0xFFFFFFFFFFFFFFFF; p2 = 0xFFFFFFFF * 2
ck(43, p1 == 0xFFFFFFFFFFFFFFFE and not s_ovf(-2) and p2 == 0x1FFFFFFFE, '变式 -1×2 = %016XH 不溢出；FFFFFFFFH×2(无符号) = %016XH' % (p1, p2))

# ---------- 45 PV 前驱图：穷举所有交错 ----------
prog = {'A': [('do', 'A'), ('V', 'SAC')], 'B': [('do', 'B'), ('V', 'SBC')],
        'C': [('P', 'SAC'), ('P', 'SBC'), ('do', 'C'), ('V', 'SCE')],
        'D': [('do', 'D'), ('V', 'SDE')], 'E': [('P', 'SCE'), ('P', 'SDE'), ('do', 'E')]}
pre = {'C': {'A', 'B'}, 'E': {'C', 'D'}}
seen, stack, bad45, dead, states = set(), [((0,) * 5, (0, 0, 0, 0), frozenset())], False, False, 0
names, sems = 'ABCDE', ['SAC', 'SBC', 'SCE', 'SDE']
while stack:
    pc, sv, done = stack.pop()
    if (pc, sv) in seen: continue
    seen.add((pc, sv)); states += 1; moved = False
    for i, p in enumerate(names):
        if pc[i] >= len(prog[p]): continue
        op_, arg = prog[p][pc[i]]; sv2 = list(sv); d2 = done
        if op_ == 'P':
            j = sems.index(arg)
            if sv2[j] == 0: continue
            sv2[j] -= 1
        elif op_ == 'V': sv2[sems.index(arg)] += 1
        else:
            if not pre.get(arg, set()) <= done: bad45 = True
            d2 = done | {arg}
        moved = True
        stack.append((pc[:i] + (pc[i] + 1,) + pc[i + 1:], tuple(sv2), d2))
    if not moved and any(pc[i] < len(prog[p]) for i, p in enumerate(names)): dead = True
ck(45, not bad45 and not dead, '穷举 %d 个状态：前驱约束全成立、无死锁' % states)

# ---------- 46 二级页表 ----------
va = 0x10800000 + (1 * 1024 + 2) * 4
pd, pt, offv = va >> 22, (va >> 12) & 0x3FF, va & 0xFFF
pde = 0x00201000 + pd * 4; pte = 0x00301 * 4096 + pt * 4
ck(46, (va, pd, pt, offv, pde, pte) == (0x10801008, 0x42, 0x1, 0x8, 0x00201108, 0x00301004), 'VA %08XH，目录号 %03XH，页号 %03XH，PDE %08XH，PTE %08XH' % (va, pd, pt, pde, pte))
first, last = 0x10800000, 0x10800000 + 1024 * 1024 * 4 - 1
ck(46, (first >> 22, last >> 22) == (0x42, 0x42), '数组 4MB 全在页目录项 %03XH～%03XH 之下（恰好 1 张二级页表管 1024 页）' % (first >> 22, last >> 22))
# 页框只有 1 个时缺页次数
def faults(order):
    cur, f = None, 0
    for (i, j) in order:
        pg = ((0x10800000 + (i * 1024 + j) * 4) >> 12)
        if pg != cur: f += 1; cur = pg
    return f
ck(46, faults((i, j) for i in range(1024) for j in range(1024)) == 1024 and faults((i, j) for j in range(1024) for i in range(1024)) == 1024 * 1024, '只给 1 个页框：按行 1024 次、按列 1048576 次缺页')

# ---------- 47 NAT ----------
nat_r2 = {('203.10.2.2', 80): ('192.168.1.2', 80)}
pkt = {'src': ('192.168.1.2', 50000), 'dst': ('203.10.2.2', 80)}
hop1 = dict(pkt)
hop2 = {'src': ('203.10.2.6', 60001), 'dst': pkt['dst']}           # R3 出站改源
hop3 = {'src': hop2['src'], 'dst': nat_r2[hop2['dst']]}             # R2 入站改目的
ck(47, [hop1['src'][0], hop1['dst'][0], hop2['src'][0], hop2['dst'][0], hop3['src'][0], hop3['dst'][0]] ==
   ['192.168.1.2', '203.10.2.2', '203.10.2.6', '203.10.2.2', '203.10.2.6', '192.168.1.2'], '三段源/目的 IP 正确')

print('\n%d / %d PASS' % (sum(OK), len(OK)))
sys.exit(0 if all(OK) else 1)
