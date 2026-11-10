#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2022 408 精解 · 独立复算（每题一段，全部 assert；算法题 C 代码 gcc 编译＋随机对拍）"""
import itertools, math, os, random, struct, subprocess, tempfile, heapq
OK = []
def ok(no, msg=''): OK.append(no); print('✓ %2d %s' % (no, msg))

# 1 循环计数：总次数 ≈ 2n，线性
def q1(n):
    c = 0; i = 1
    while i < n:
        c += i; i *= 2
    return c
for n in (10, 100, 1000, 10**5, 10**6, 2**20, 2**20 + 1):
    c = q1(n); assert n - 1 <= c < 2 * n, (n, c)
assert q1(2**20) == 2**20 - 1 and q1(2**20 + 1) == 2**21 - 1
ok(1, 'sum ∈ [n−1, 2n)，O(n)；n=2^20 时 2^20−1，n=2^20+1 时 2^21−1')

# 2 栈：全进再全出 ⟹ 倒序；进一个出一个 ⟹ 相同；任意 out 都能模拟判定
def legal(inn, out):
    st, j = [], 0
    for x in inn:
        st.append(x)
        while st and j < len(out) and st[-1] == out[j]: st.pop(); j += 1
    return j == len(out)
S = 'abcd'
assert legal(S, S[::-1]) and legal(S, S)
assert sum(legal(S, ''.join(p)) for p in itertools.permutations(S)) == 14   # 卡特兰数 C4
ok(2, 'D：倒序、原序都合法；4 元素合法出栈序列 14 个')

# 3 枚举 n≤7 全部二叉树，统计中序相邻 p,q（p 在前）的四种关系是否出现
def trees(n):
    if n == 0: yield None; return
    for k in range(n):
        for L in trees(k):
            for R in trees(n - 1 - k): yield (L, R)
seen = set()
for n in range(1, 8):
    for t in trees(n):
        par, kids, ino = {}, {}, []
        cnt = [0]
        def walk(t, p):
            if t is None: return None
            me = cnt[0]; cnt[0] += 1
            par[me] = p
            l = walk(t[0], me); ino.append(me); r = walk(t[1], me)
            kids[me] = (l, r)
            return me
        walk(t, None)
        for p, q in zip(ino, ino[1:]):
            if par[p] == q: seen.add('I')
            if kids[p][1] == q: seen.add('II')
            if par[p] is not None and par[q] == par[p] and kids[par[p]][1] == q: seen.add('III')
            if par[p] is not None and par[par[p]] == q: seen.add('IV')
assert seen == {'I', 'II', 'IV'}, seen
ok(3, '仅 Ⅲ 从未出现（n≤7 全部二叉树）')

# 4 三叉树最小高度
h, tot = 0, 0
while tot < 244: tot += 3 ** h; h += 1
assert h == 6 and math.ceil(math.log(2 * 244 + 1, 3)) == 6
ok(4, '满三叉树前缀和 1,4,13,40,121,364 ⟹ 高 6')

# 5 哈夫曼反例
def huff_depths(w):
    hp = [(x, i, (i,)) for i, x in enumerate(w)]; heapq.heapify(hp); d = [0] * len(w); k = len(w)
    while len(hp) > 1:
        a = heapq.heappop(hp); b = heapq.heappop(hp)
        for i in a[2] + b[2]: d[i] += 1
        heapq.heappush(hp, (a[0] + b[0], k, a[2] + b[2])); k += 1
    return d
d = huff_depths([1, 2, 3])          # 3 叶：哈夫曼 5 结点；定长 2 位编码树 6 结点
assert sorted(d) == [1, 2, 2]
d = huff_depths([3, 4, 5, 6])       # 频次全不同、无并列，却全在第 2 层 ⟹ C 错；高度与定长树相同 ⟹ B 错
assert d == [2, 2, 2, 2]
assert huff_depths([1, 1, 2, 4, 8]) == [4, 4, 3, 2, 1]
ok(5, '反例：{1,2,3} 结点数 5≠6；{3,4,5,6} 全在同层；{1,1,2,4,8} 5 层')

# 6 无向图连通性：小图穷举
def connected(n, E):
    p = list(range(n))
    def f(x):
        while p[x] != x: x = p[x]
        return x
    for a, b in E: p[f(a)] = f(b)
    return len({f(x) for x in range(n)}) == 1
cnt = {'A': [0, 0], 'B': [0, 0], 'C': [0, 0], 'D': [0, 0]}  # [满足条件的图数, 其中连通数]
for n in range(2, 7):
    allE = list(itertools.combinations(range(n), 2))
    for m in range(len(allE) + 1):
        for E in itertools.combinations(allE, m):
            c = connected(n, E)
            for k, cond in (('A', n > m), ('B', n < m), ('C', n == m - 1), ('D', n > m + 1)):
                if cond: cnt[k][0] += 1; cnt[k][1] += c
assert cnt['D'][1] == 0                       # D：一定不连通
assert 0 < cnt['A'][1] < cnt['A'][0] and 0 < cnt['B'][1] < cnt['B'][0] and 0 < cnt['C'][1]
ok(6, 'n≤6 穷举：D 情形连通 0 个；A、B、C 都有反例')

# 7 AOE
E7 = {'a': (1, 2, 2), 'b': (1, 3, 5), 'c': (2, 3, 1), 'd': (2, 4, 3), 'e': (3, 4, 3), 'f': (3, 5, 4),
      'g': (3, 6, 1), 'h': (4, 5, 1), 'i': (4, 6, 4), 'j': (5, 6, 1)}
ve = {v: 0 for v in range(1, 7)}
for v in range(1, 7):
    for u, w, t in E7.values():
        if w == v: ve[v] = max(ve[v], ve[u] + t)
vl = {v: ve[6] for v in range(1, 7)}
for v in range(6, 0, -1):
    for u, w, t in E7.values():
        if u == v: vl[v] = min(vl[v], vl[w] - t)
slack = {k: vl[w] - ve[u] - t for k, (u, w, t) in E7.items()}
assert [ve[v] for v in range(1, 7)] == [0, 2, 5, 8, 9, 12] and [vl[v] for v in range(1, 7)] == [0, 4, 5, 8, 11, 12]
assert slack['c'] == 2 and slack['g'] == 6 and slack['h'] == 2 and slack['j'] == 2
assert max(slack, key=slack.get) == 'g' and sorted(k for k in slack if slack[k] == 0) == ['b', 'e', 'i']
ok(7, 've=(0,2,5,8,9,12) vl=(0,4,5,8,11,12)；余量 c2 g6 h2 j2；关键活动 b e i')

# 8 5 阶 B 树删除 260：枚举前驱/后继 × 借/合并（左/右）所有合法结局
root = [60, 90, 260, 350]; ch = [[30, 50], [70, 80, 85], [100, 110], [280, 300], [400, 500]]
MINK = 2
roots = set()
def fix(rt, cs, i):
    """cs[i] 亏空，返回所有可能的根"""
    res = []
    if i > 0 and len(cs[i - 1]) > MINK:            # 向左兄弟借
        r2, c2 = rt[:], [c[:] for c in cs]
        c2[i].insert(0, r2[i - 1]); r2[i - 1] = c2[i - 1].pop(); res.append(tuple(r2))
    if i < len(cs) - 1 and len(cs[i + 1]) > MINK:  # 向右兄弟借
        r2, c2 = rt[:], [c[:] for c in cs]
        c2[i].append(r2[i]); r2[i] = c2[i + 1].pop(0); res.append(tuple(r2))
    if res: return res                              # 能借就不合并（先借后并）
    if i > 0:                                       # 与左兄弟合并
        r2 = rt[:]; r2.pop(i - 1); res.append(tuple(r2))
    if i < len(cs) - 1:                             # 与右兄弟合并
        r2 = rt[:]; r2.pop(i); res.append(tuple(r2))
    return res
k = root.index(260)
r1, c1 = root[:], [c[:] for c in ch]; r1[k] = c1[k].pop()        # 前驱 110 顶上，[100] 亏空
roots |= set(fix(r1, c1, k))
r1, c1 = root[:], [c[:] for c in ch]; r1[k] = c1[k + 1].pop(0)   # 后继 280 顶上，[300] 亏空
roots |= set(fix(r1, c1, k + 1))
assert roots == {(60, 85, 110, 350), (60, 90, 350), (60, 90, 280)}, roots
assert (60, 90, 110, 350) not in roots
ok(8, '能得到的根：%s；D 不在其中' % sorted(roots))

# 12 CPI
cpi = 0.8 * 1 + 0.2 * 10; t = 10000 * cpi / 1e9
assert abs(cpi - 2.8) < 1e-12 and abs(t - 28e-6) < 1e-15
ok(12, 'CPI 2.8，28 μs')

# 13 补码范围
n = 32; assert (-(2 ** (n - 1)), 2 ** (n - 1) - 1) == (-2147483648, 2147483647)
ok(13, '-2^31 ~ 2^31-1')

# 14 IEEE754
h = struct.pack('>f', -0.4375).hex().upper()
assert h == 'BEE00000'
for x, v in (('BF600000', -0.875), ('BF700000', -0.9375), ('C0E00000', -7.0)):
    assert struct.unpack('>f', bytes.fromhex(x))[0] == v
ok(14, '-0.4375 = BEE0 0000H；B=-0.875 C=-0.9375 D=-7')

# 15 虚实转换
va = 0x00082840; vpn, off = va >> 12, va & 0xFFF
assert vpn == 130 and off == 0x840
pt = {82: (0x024, 0), 129: (0x180, 1), 130: (0x018, 1)}
pf, v = pt[vpn]; assert v == 1 and (pf << 12 | off) == 0x018840
ok(15, 'VPN=82H=130，页框 018H ⟹ 01 8840H')

# 16 Cache 比较器
blk = 6; sets = (32 * 1024 // 64) // 8; s_bits = int(math.log2(sets)); tag = 32 - s_bits - blk
assert sets == 64 and tag == 20
ok(16, '8 个比较器，各 20 位')

# 17 DRAM
cap = 8 * 8192 * 8192 * 8 // 8; assert cap == 512 * 2 ** 20
assert int(math.log2(8192 * 8192)) == 26
ok(17, '512MB；地址 26 位 ⟹ 复用后 13 根引脚；行缓冲 8192×8 位')

# 19 扩展操作码
z = 2 ** 16 - 12 * 2 ** 12 - 254 * 2 ** 6
assert z == 128 and (16 - 12) * 64 - 254 == 2
ok(19, '零地址最多 128')

# 25 抢占式优先级：数调度次数
P = [('P0', 0, 15, 100), ('P1', 10, 20, 60), ('P2', 10, 10, 20), ('P3', 15, 6, 10)]
rem = {p[0]: p[3] for p in P}; cur = None; dispatch = []; t = 0
while any(rem.values()):
    ready = [p for p in P if p[1] <= t and rem[p[0]] > 0]
    best = min(ready, key=lambda p: p[2])[0] if ready else None
    if best != cur:
        dispatch.append((t, best)); cur = best
    rem[cur] -= 1; t += 1
    if rem[cur] == 0: cur = None
assert dispatch == [(0, 'P0'), (10, 'P2'), (15, 'P3'), (25, 'P2'), (40, 'P0'), (130, 'P1')], dispatch
ok(25, '调度 %d 次：%s' % (len(dispatch), dispatch))

# 26 安全序列条数
alloc = {'P0': (2, 0, 1), 'P1': (0, 2, 0), 'P2': (1, 0, 1)}
need = {'P0': (0, 2, 1), 'P1': (1, 2, 3), 'P2': (0, 1, 3)}
safe = []
for perm in itertools.permutations(alloc):
    w = [1, 3, 2]; good = True
    for p in perm:
        if any(need[p][i] > w[i] for i in range(3)): good = False; break
        w = [w[i] + alloc[p][i] for i in range(3)]
    if good: safe.append(perm)
assert safe == [('P0', 'P1', 'P2'), ('P0', 'P2', 'P1')]
ok(26, '安全序列 2 条')

# 34 奈氏
assert 2 * 200e3 * math.log2(4) == 800e3
ok(34, '800 kb/s')

# 35 网络地址
ip = [183, 80, 72, 48]; mk = [255, 255, 192, 0]
assert [a & b for a, b in zip(ip, mk)] == [183, 80, 64, 0]
ok(35, '183.80.64.0')

# 36 网关与掩码
import ipaddress
net = ipaddress.ip_interface('192.168.1.62/27').network
assert ipaddress.ip_address('192.168.1.60') in net and str(net.netmask) == '255.255.255.224'
assert ipaddress.ip_address('192.168.1.60') not in ipaddress.ip_interface('192.168.1.1/30').network
ok(36, '255.255.255.224，网关 .62')

# 38 超时后 cwnd 回到 16 的最少 RTT
cw, ss, r = 1, 8, 0
while cw < 16:
    cw = min(cw * 2, ss) if cw < ss else cw + 1; r += 1
assert r == 11
cw, r = 8, 0
while cw < 16: cw += 1; r += 1
assert r == 8
ok(38, '超时 11 RTT（3 慢开始＋8 拥塞避免）；若是 3 个冗余 ACK 则 8 RTT')

# 39 四次挥手
RTT, MSL = 50, 800
assert (RTT + 2 * MSL, 1.5 * RTT) == (1650, 75)
ok(39, 'C 1650ms，S 75ms')

# 40 HTTP/1.1 + 慢开始
need_seg, cw, rtt = [1, 3], 1, 1      # 第 1 个 RTT 握手
rtt += 1; cw_used = 1; cw = 2          # 第 2 个 RTT：捎带请求，收 html（1 段）
left = 3; rounds = 0
while left > 0:
    rtt += 1; left -= cw; cw *= 2
assert rtt == 4
ok(40, '4 RTT = 40ms')

# 44 磁盘
import fractions
assert math.ceil(math.log2(20000)) == 15 and math.log2(8) == 3 and math.ceil(math.log2(500)) == 9
rot = 60e3 / 7200; ta = 5 + rot / 2 + rot / 500
assert abs(rot - 8.333) < 1e-3 and abs(ta - 9.183) < 1e-3
assert 512 * 8 // 64 == 64
ok(44, '15/3/9 位；%.3f ms；64 次请求' % ta)

# 45 混合索引
blocks = 6 * 2 ** 20 // (4 * 2 ** 10); per = 4096 // 4
assert blocks == 1536 and 10 + per < blocks <= 10 + per + per * per
ok(45, '1536 块 ⟹ 一级＋二级间接')

# 47 距离
slot = 64 * 8 / 100e6; one = slot / 2; prop = one - 1.51e-6
assert abs(slot - 5.12e-6) < 1e-15 and abs(prop * 2e8 - 210) < 1e-6
ok(47, '最远 210 m')

# 43 OF 逻辑式：16 位穷举不了就随机 + 4 位穷举（同一个判据）
def chk_of(bits, samples):
    M = 1 << bits; sgn = lambda x: (x >> (bits - 1)) & 1
    to_s = lambda x: x - M if sgn(x) else x
    for a, b in samples:
        for op in ('+', '-'):
            f = (a + b) % M if op == '+' else (a - b) % M
            true = to_s(a) + to_s(b) if op == '+' else to_s(a) - to_s(b)
            ovf = not (-(M >> 1) <= true < (M >> 1))
            A, B, F = sgn(a), sgn(b), sgn(f)
            of = ((1 - A) & (1 - B) & F | A & B & (1 - F)) if op == '+' else ((1 - A) & B & F | A & (1 - B) & (1 - F))
            assert of == ovf, (bits, a, b, op)
            assert sgn(f) == (1 if to_s(f) < 0 else 0)   # SF = F15
chk_of(4, [(a, b) for a in range(16) for b in range(16)])
R = random.Random(2022)
chk_of(16, [(R.randrange(65536), R.randrange(65536)) for _ in range(200000)])
ok(43, 'SF=F15；加/减法 OF 两式：4 位穷举＋16 位 20 万组随机全对；取指 1+5+1=7 周期')

# 46 两个信号量：枚举所有交错，检查约束全满足且无死锁
T1 = [('op', 'A'), ('V', 'ac'), ('P', 'ce'), ('op', 'E'), ('op', 'F')]
T2 = [('op', 'B'), ('P', 'ac'), ('op', 'C'), ('V', 'ce'), ('op', 'D')]
finals = 0
def run(i, j, sem, done):
    global finals
    if i == len(T1) and j == len(T2):
        finals += 1; return
    moved = False
    for who in (1, 2):
        T, k = (T1, i) if who == 1 else (T2, j)
        if k == len(T): continue
        kind, x = T[k]; s2 = dict(sem); d2 = list(done)
        if kind == 'P':
            if s2[x] == 0: continue
            s2[x] -= 1
        elif kind == 'V': s2[x] += 1
        else:
            pre = {'C': 'AB', 'D': 'C', 'E': 'C', 'F': 'E'}.get(x, '')
            assert all(p in d2 for p in pre), (x, d2)
            d2.append(x)
        moved = True
        run(i + (who == 1), j + (who == 2), s2, d2)
    assert moved, '死锁'
run(0, 0, {'ac': 0, 'ce': 0}, [])
assert finals > 0
ok(46, '两个信号量 S_AC=S_CE=0：%d 种交错全部满足前驱、无死锁' % finals)

# 41 C 代码：顺序存储判 BST，gcc 编译 + 与 Python 参照对拍
C41 = r'''
#include <stdio.h>
#include <stdbool.h>
#define MAX_SIZE 128
typedef struct{ int SqBiTNode[MAX_SIZE]; int ElemNum; }SqBiTree;
bool inorder(SqBiTree *T, int k, int *prev){
    if (k >= T->ElemNum || T->SqBiTNode[k] == -1) return true;   /* 空结点 */
    if (!inorder(T, 2*k+1, prev)) return false;                  /* 左子树 */
    if (T->SqBiTNode[k] <= *prev) return false;                  /* 必须严格大于前驱 */
    *prev = T->SqBiTNode[k];
    return inorder(T, 2*k+2, prev);                              /* 右子树 */
}
bool isBST(SqBiTree T){ int prev = 0; return inorder(&T, 0, &prev); }  /* 结点值均为正整数，前驱初值取 0 */
int main(void){
    int cases; if (scanf("%d", &cases) != 1) return 1;
    while (cases--){
        SqBiTree T; scanf("%d", &T.ElemNum);
        for (int i = 0; i < T.ElemNum; i++) scanf("%d", &T.SqBiTNode[i]);
        puts(isBST(T) ? "1" : "0");
    }
    return 0;
}'''
def py_isbst(a):
    n = len(a)
    def ok_(k, lo, hi):
        if k >= n or a[k] == -1: return True
        if not (lo < a[k] < hi): return False
        return ok_(2 * k + 1, lo, a[k]) and ok_(2 * k + 2, a[k], hi)
    return ok_(0, -10**9, 10**9)
def rand_tree(R):
    n = R.randint(1, 31); a = [-1] * n; a[0] = R.randint(1, 9)
    for i in range(1, n):
        if a[(i - 1) // 2] != -1 and R.random() < .7: a[i] = R.randint(1, 30)
    # 一半概率改造成真正的 BST（中序位置重新赋值）
    if R.random() < .5:
        order = []
        def io(k):
            if k >= n or a[k] == -1: return
            io(2 * k + 1); order.append(k); io(2 * k + 2)
        io(0); vals = sorted(R.sample(range(1, 200), len(order)))
        for k, v in zip(order, vals): a[k] = v
        if R.random() < .3 and len(order) > 1:          # 制造相等值
            k = R.choice(order[1:]); a[k] = a[order[order.index(k) - 1]]
    return a
td = tempfile.mkdtemp()
src = os.path.join(td, 'q41.c'); exe = os.path.join(td, 'q41')
open(src, 'w').write(C41)
subprocess.run(['gcc', '-O2', '-Wall', '-o', exe, src], check=True)
R = random.Random(41); cases = [rand_tree(R) for _ in range(20000)]
inp = '%d\n' % len(cases) + '\n'.join('%d %s' % (len(a), ' '.join(map(str, a))) for a in cases)
out = subprocess.run([exe], input=inp, capture_output=True, text=True, check=True).stdout.split()
exp = ['1' if py_isbst(a) else '0' for a in cases]
assert out == exp
assert py_isbst([40, 25, 60, -1, 30, -1, 80, -1, -1, 27]) is True     # 王道配图同型：带空位
assert py_isbst([40, 50, 60, -1, 30, -1, 80, -1, -1, 27]) is False
ok(41, 'gcc 编译通过；20000 棵随机顺序存储树对拍零失配（BST %d 棵）' % exp.count('1'))

# 42 Top-10：大根堆 vs 排序对拍，并数比较次数
C42 = r'''
#include <stdio.h>
#include <stdlib.h>
#define K 10
long long cmp_cnt = 0;
void sift_down(int h[], int i, int n){          /* 大根堆下调 */
    int x = h[i];
    for (int c = 2*i+1; c < n; i = c, c = 2*i+1){
        if (c+1 < n){ cmp_cnt++; if (h[c+1] > h[c]) c++; }
        cmp_cnt++; if (h[c] <= x) break;
        h[i] = h[c];
    }
    h[i] = x;
}
int main(void){
    int n; if (scanf("%d", &n) != 1) return 1;
    int *M = malloc(sizeof(int)*n); for (int i = 0; i < n; i++) scanf("%d", &M[i]);
    int h[K]; for (int i = 0; i < K; i++) h[i] = M[i];
    for (int i = K/2-1; i >= 0; i--) sift_down(h, i, K);       /* 前 10 个建大根堆 */
    for (int i = K; i < n; i++){
        cmp_cnt++;
        if (M[i] < h[0]){ h[0] = M[i]; sift_down(h, 0, K); }   /* 比堆顶小才进堆 */
    }
    for (int i = 0; i < K; i++) printf("%d ", h[i]);
    printf("\n%lld\n", cmp_cnt);
    return 0;
}'''
src = os.path.join(td, 'q42.c'); exe = os.path.join(td, 'q42')
open(src, 'w').write(C42)
subprocess.run(['gcc', '-O2', '-Wall', '-o', exe, src], check=True)
R = random.Random(42); ratios = []
for trial in range(30):
    n = R.choice([1000, 20000, 150000])
    M = [R.randrange(10**9) for _ in range(n)]
    o = subprocess.run([exe], input='%d\n%s' % (n, ' '.join(map(str, M))), capture_output=True, text=True, check=True).stdout.split('\n')
    got = sorted(map(int, o[0].split())); assert got == sorted(M)[:10]
    ratios.append((n, int(o[1]) / n))
big = max(r for n, r in ratios if n == 150000)
assert big < 1.02
ok(42, 'gcc 编译通过；30 组随机数据与排序结果一致；n=150000 时比较次数 / n 最大 %.4f（≈ n＋小量）' % big)

# ───── 举一反三里的数值也复算 ─────
def sched(P, preempt=True):
    rem = {p[0]: p[3] for p in P}; cur = None; disp = []; t = 0; fin = {}
    while any(rem.values()):
        ready = [p for p in P if p[1] <= t and rem[p[0]] > 0]
        if cur is None or preempt:
            best = min(ready, key=lambda p: p[2])[0]
            if best != cur: disp.append((t, best)); cur = best
        rem[cur] -= 1; t += 1
        if rem[cur] == 0: fin[cur] = t; cur = None
    return disp, fin
d, f = sched(P, preempt=False); assert [x[0] for x in d] == [0, 100, 110, 130]
d, f = sched(P); assert sum(f[p[0]] - p[1] for p in P) / 4 == 87.5 and f['P0'] - 0 - 100 == 30
P12 = [('P0', 0, 15, 100), ('P1', 10, 12, 60), ('P2', 10, 10, 20), ('P3', 15, 6, 10)]
d, f = sched(P12); assert [x[0] for x in d] == [0, 10, 15, 25, 40, 100] and f['P0'] == 190
def nsafe(av, alloc, need):
    c = 0
    for perm in itertools.permutations(alloc):
        w = list(av); g = True
        for q in perm:
            if any(need[q][i] > w[i] for i in range(3)): g = False; break
            w = [w[i] + alloc[q][i] for i in range(3)]
        c += g
    return c
assert nsafe((0, 3, 2), alloc, need) == 2 and nsafe((1, 1, 2), alloc, need) == 0
a2 = dict(alloc); n2 = dict(need); a2['P2'] = (1, 1, 2); n2['P2'] = (0, 0, 2)
assert nsafe((1, 2, 1), a2, n2) > 0
cw, ss, r = 1, 6, 0
while cw < 12:
    cw = min(cw * 2, ss) if cw < ss else cw + 1; r += 1
assert r == 9
assert 2 ** 16 - 12 * 2 ** 12 - 252 * 2 ** 6 == 256           # 一地址最多 252 时零地址恰 256
assert (32 - 9 - 6, 32 - 6) == (17, 26)
assert abs(5 + rot / 2 + 10 * rot / 500 - 9.333) < 1e-3 and 500 * 512 * 120 == 30720000
assert 8 * 20000 * 500 * 512 == 40960000000
assert math.ceil((244 - 1) / 3) == 81 and 2 ** 7 - 1 < 244 <= 2 ** 8 - 1
E7b = dict(E7); E7b['i'] = (4, 6, 2)
ve2 = {v: 0 for v in range(1, 7)}
for v in range(1, 7):
    for u, w, t_ in E7b.values():
        if w == v: ve2[v] = max(ve2[v], ve2[u] + t_)
assert ve2[6] == 10
assert int(2 * 200e3 * 4) == 1600000 and abs(200e3 * math.log2(1001) - 1993.4e3) < 1e3
assert [a & b for a, b in zip(ip, [255, 255, 248, 0])] == [183, 80, 72, 0]
assert 10 + 1024 <= 2000 < 10 + 1024 + 1024 ** 2
print('✓ 举一反三数值复算通过')

# 第 3 题变式：后序相邻（p 在 q 前）时四种关系哪些出现
seen2 = set()
for n in range(1, 8):
    for t in trees(n):
        par, kids, post = {}, {}, []
        cnt = [0]
        def walk2(t, p):
            if t is None: return None
            me = cnt[0]; cnt[0] += 1; par[me] = p
            l = walk2(t[0], me); r = walk2(t[1], me); post.append(me); kids[me] = (l, r)
            return me
        walk2(t, None)
        for p_, q_ in zip(post, post[1:]):
            if par[p_] == q_: seen2.add('I')
            if kids[p_][1] == q_: seen2.add('II')
            if par[p_] is not None and par[q_] == par[p_] and kids[par[p_]][1] == q_: seen2.add('III')
            if par[p_] is not None and par[par[p_]] == q_: seen2.add('IV')
assert seen2 == {'I', 'III'}, seen2
print('✓ 第 3 题变式：后序相邻只可能 Ⅰ、Ⅲ')

print('\n全部 %d 题复算通过：%s' % (len(OK), sorted(OK)))
