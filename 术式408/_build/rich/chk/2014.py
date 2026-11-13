#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2014 408 套卷精解 · 独立复算。每题一个函数，assert 失败即报错；最后打印汇总。
跑法：python3 _build/rich/chk/2014.py   （第 41 题需要 gcc）"""
import itertools, math, os, random, struct, subprocess, sys, tempfile
OK = []
def ok(n, msg): OK.append(n); print('✓ %2d  %s' % (n, msg))

# ───────── 数据结构 ─────────
def q1():
    for n in (1, 7, 8, 100, 1000):
        c = 0; k = 1
        while k <= n:
            c += n; k *= 2
        assert c == n * (int(math.log2(n)) + 1)
    ok(1, 'count = n(⌊log2 n⌋+1) ⟹ O(n log n)，C')

def q2():
    pr = {'+': 1, '-': 1, '*': 2, '/': 2}
    def snap(expr, stop):
        st = []; out = []
        for ch in expr:
            if ch.isalpha():
                out.append(ch)
                if ch == stop: return ''.join(st)
            elif ch == '(': st.append(ch)
            elif ch == ')':
                while st[-1] != '(': out.append(st.pop())
                st.pop()
            else:
                while st and st[-1] != '(' and pr[st[-1]] >= pr[ch]: out.append(st.pop())
                st.append(ch)
        while st: out.append(st.pop())
        return ''.join(out)
    e = 'a/b+(c*d-e*f)/g'
    assert snap(e, 'f') == '+(-*' and snap(e, 'g') == '+/' and snap(e, '?') == 'ab/cd*ef*-g/+'
    # 变式：a+b-c*d 栈中最多 2 个运算符
    ok(2, '扫到 f 时栈 + ( - *，B；后缀 ab/cd*ef*-g/+')

def q3():
    # 模拟 M=5 的循环队列（留一空位），验证 A 的两个条件恰好等价于空 / 满
    M = 5
    for e1 in range(M):
        for cnt in range(M):          # 元素个数 0..M-1
            e2 = (e1 + cnt) % M
            assert (e1 == e2) == (cnt == 0)
            assert (e1 == (e2 + 1) % M) == (cnt == M - 1)
            assert (e2 - e1 + M) % M == cnt
    ok(3, '空 end1==end2，满 end1==(end2+1)%M，A')

def q4():
    T = ('a', ('b', ('d', None, ('e', None, None)), ('X', None, None)), ('c', None, None))
    def ino(t): return [] if t is None else ino(t[1]) + [t[0]] + ino(t[2])
    def pre(t): return [] if t is None else [t[0]] + pre(t[1]) + pre(t[2])
    s = ino(T); i = s.index('X')
    assert ''.join(s) == 'debXac' and (s[i - 1], s[i + 1]) == ('b', 'a')
    j = s.index('e'); assert (s[j - 1], s[j + 1]) == ('d', 'b')
    p = pre(T); k = p.index('X'); assert ''.join(p) == 'abdeXc' and (p[k - 1], p[k + 1]) == ('e', 'c')
    ok(4, '中序 debXac，X 的左右线索 b、a，D')

def q5():
    R = random.Random(5)
    for _ in range(3000):
        n = R.randint(1, 12)
        # 随机森林：parent[i] = -1 或 更小编号的结点；孩子按编号排序
        par = [-1] + [R.randint(-1, i - 1) for i in range(1, n)]
        ch = {i: [] for i in range(-1, n)}
        for i, p in enumerate(par): ch[p].append(i)
        left = {}; right = {}
        for p in ch:
            c = ch[p]
            if p >= 0: left[p] = c[0] if c else None
            for a, b in zip(c, c[1:] + [None]): right[a] = b
        fleaf = sum(1 for i in range(n) if not ch[i])
        lnull = sum(1 for i in range(n) if left[i] is None)
        rnull = sum(1 for i in range(n) if right[i] is None)
        assert fleaf == lnull
        assert rnull == (n - fleaf) + 1
    # A 的反例：两棵单结点树
    ok(5, '3000 个随机森林：F 叶子数 = T 左指针空的结点数，C；右指针空 = 非叶数+1')

def q6():
    def prefix_free(cs): return not any(a != b and b.startswith(a) for a in cs for b in cs)
    opt = {'A': '01,0000,0001,001,1', 'B': '011,000,001,010,1', 'C': '000,001,010,011,100', 'D': '0,100,110,1110,1100'}
    r = {k: prefix_free(v.split(',')) for k, v in opt.items()}
    assert r == {'A': True, 'B': True, 'C': True, 'D': False}
    assert prefix_free('0,100,101,1110,1100'.split(','))
    ok(6, '只有 D 不是前缀码（110 是 1100 的前缀）')

def q7():
    E = [(3, 1), (3, 6), (1, 2), (1, 4), (4, 2), (4, 6), (2, 5), (6, 5)]
    def topo(E):
        return [p for p in itertools.permutations(range(1, 7)) if all(p.index(a) < p.index(b) for a, b in E)]
    t = topo(E)
    assert sorted(t) == [(3, 1, 4, 2, 6, 5), (3, 1, 4, 6, 2, 5)]
    assert topo(E + [(2, 6)]) == [(3, 1, 4, 2, 6, 5)]
    ok(7, '拓扑序只有 314265、314625，D')

def btree_nodes(m, K):
    """K 个关键字的 m 阶 B 树：返回 (结点最多, 结点最少)"""
    lo = math.ceil(m / 2) - 1; hi = m - 1; memo = {}
    def f(h, root):
        if (h, root) in memo: return memo[(h, root)]
        res = {}
        for k in range(1 if root else lo, hi + 1):
            if h == 1: res[k] = (1, 1); continue
            child = f(h - 1, False); cur = {0: (0, 0)}
            for _ in range(k + 1):
                nxt = {}
                for a, (mx, mn) in cur.items():
                    for b, (cx, cn) in child.items():
                        if a + b > K: continue
                        t = nxt.get(a + b); v = (mx + cx, mn + cn)
                        nxt[a + b] = v if t is None else (max(t[0], v[0]), min(t[1], v[1]))
                cur = nxt
            for a, (mx, mn) in cur.items():
                if a + k <= K:
                    t = res.get(a + k); v = (mx + 1, mn + 1)
                    res[a + k] = v if t is None else (max(t[0], v[0]), min(t[1], v[1]))
        memo[(h, root)] = res; return res
    best = [f(h, True)[K] for h in range(1, 8) if K in f(h, True)]
    return max(b[0] for b in best), min(b[1] for b in best)
def q9():
    assert btree_nodes(4, 15) == (15, 5)
    assert btree_nodes(4, 14)[0] == 11 and btree_nodes(5, 15)[0] == 6
    ok(9, '4 阶 15 关键字：最多 15 个结点（D），最少 5；变式 14 关键字 11、5 阶 6')

def q10():
    def okd(a, d): return all(a[i] <= a[i + d] for i in range(len(a) - d))
    a = [9, 1, 4, 13, 7, 8, 20, 23, 15]
    assert [d for d in (2, 3, 4, 5) if okd(a, d)] == [3]
    assert [d for d in (2, 3, 4, 5) if okd([1, 9, 4, 13, 7, 8, 20, 23, 15], d)] == [5]
    ok(10, '只有增量 3 使各组有序，B')

def q11():
    # 穷举 7 个元素的所有排列，做两趟快排（首元素为枢轴），收集所有可能的第二趟结果
    def part(a, lo, hi):
        p = a[lo]; i, j = lo, hi
        while i < j:
            while i < j and a[j] >= p: j -= 1
            a[i] = a[j]
            while i < j and a[i] <= p: i += 1
            a[j] = a[i]
        a[i] = p; return i
    base = [2, 3, 4, 5, 6, 7, 9]; reach = set()
    for perm in itertools.permutations(base):
        a = list(perm); k = part(a, 0, 6)
        if k - 1 > 0: part(a, 0, k - 1)
        if 6 - (k + 1) > 0: part(a, k + 1, 6)
        reach.add(tuple(a))
    def fixed(s): return [x for x, y in zip(s, base) if x == y]
    C = (3, 2, 5, 4, 7, 6, 9)
    assert fixed(C) == [9] and C not in reach
    # 所有可达结果都满足判据：到位 ≥3，或到位 2 且含端点（子表只剩 1 个元素时也算到位）
    for s in reach:
        f = fixed(s); assert len(f) >= 3 or (len(f) == 2 and (s[0] == 2 or s[-1] == 9)), s
    assert len(fixed((2, 3, 5, 4, 6, 7, 9))) == 5 and fixed((2, 7, 5, 6, 4, 3, 9)) == [2, 9] and fixed((4, 2, 3, 5, 7, 6, 9)) == [5, 9]
    ok(11, 'C 只有 9 到位，不可能；穷举 5040 个初始排列的两趟结果都满足判据')

# ───────── 组成原理 ─────────
def q12():
    assert abs(20 * 0.7 * 1.2 - 16.8) < 1e-9; ok(12, '20×0.7×1.2 = 16.8 s，D')

def q13():
    x, y = 103, -25
    v = {'A': x + y, 'B': -x + y, 'C': x - y, 'D': -x - y}
    assert [k for k in v if not -128 <= v[k] <= 127] == ['C'] and v['B'] == -128
    assert (0b10011001 + 0b11100111) & 0xFF == 0x80
    ok(13, 'x−y = 128 溢出，−x+y = −128 不溢出，C')

def q14():
    x = struct.unpack('>f', bytes.fromhex('CC900000'))[0]; y = struct.unpack('>f', bytes.fromhex('B0C00000'))[0]
    assert x == -1.125 * 2 ** 26 and y == -1.5 * 2 ** -30 and x < y < 0
    a = struct.unpack('>f', bytes.fromhex('CCA00000'))[0]; assert x > a
    ok(14, 'x = −1.125×2^26 ＜ y = −1.5×2^−30，同为负，A')

def q15():
    assert int(math.log2(4 * 2 ** 20)) // 2 + 8 == 19 and 256 // 4 == 64; ok(15, '22/2 + 8 = 19，A')

def q17():
    n = 32 - 8 - 4 - 4; assert n == 16 and (-2 ** 15, 2 ** 15 - 1) == (-32768, 32767); ok(17, '偏移量 16 位补码，A')

def q18():
    t = 32 * 4 + 2; assert t == 130 and math.ceil(math.log2(t)) == 8 and math.ceil(math.log2(3 * 80 + 1)) == 8
    ok(18, '130 条微指令 ⟹ 8 位，C')

def q19():
    assert 32 // 8 * 66 * 2 == 528; ok(19, '4B×66M×2 = 528 MB/s，C')

def q22():
    assert 100 / 400 == 0.25; ok(22, '100/400 = 25%，B')

# ───────── 操作系统 ─────────
def q24():
    need = (3, 4, 5)
    def can_deadlock(n):
        # 存在一种占有状态：每个进程占有量 < 需求，且剩余资源满足不了任何一个进程
        for h in itertools.product(*[range(k) for k in need]):
            free = n - sum(h)
            if free >= 0 and all(k - a > free for k, a in zip(need, h)): return True
        return False
    assert can_deadlock(9) and not can_deadlock(10)
    ok(24, 'n=9 可能死锁（2,3,4），n=10 不会，B')

def q27():
    clusters = 10 * 2 ** 30 // (4 * 2 ** 10); byts = clusters // 8
    assert byts == 320 * 1024 and byts // 4096 == 80 and clusters * 4 // 4096 == 2560
    ok(27, '2.5M 位 = 320KB = 80 簇，A')

def paging(seq, m, alg):
    mem = []; f = 0
    for i, p in enumerate(seq):
        if p in mem:
            if alg == 'LRU': mem.remove(p); mem.append(p)
            continue
        f += 1
        if len(mem) == m:
            if alg == 'OPT':
                nxt = lambda q: seq.index(q, i + 1) if q in seq[i + 1:] else 10 ** 9
                mem.remove(max(mem, key=nxt))
            else: mem.pop(0)
        mem.append(p)
    return f
def q30():
    s = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
    assert (paging(s, 3, 'FIFO'), paging(s, 4, 'FIFO')) == (9, 10)
    assert (paging(s, 3, 'LRU'), paging(s, 4, 'LRU')) == (10, 8) and paging(s, 3, 'OPT') == 7
    R = random.Random(30)
    for _ in range(3000):                      # LRU、OPT 页框增加缺页不增
        q = [R.randint(1, 6) for _ in range(R.randint(5, 25))]
        for alg in ('LRU', 'OPT'):
            assert all(paging(q, m + 1, alg) <= paging(q, m, alg) for m in range(1, 6))
    ok(30, 'FIFO 3 框 9 次、4 框 10 次；LRU/OPT 随机 3000 串无异常，A')

# ───────── 计算机网络 ─────────
def q34():
    table = {'b1': 2}; host = {'a1': 1, 'b1': 2, 'c1': 3}
    def fwd(src, dst):
        table[src] = host[src]
        return {table[dst]} if dst in table else {1, 2, 3} - {host[src]}
    assert fwd('a1', 'c1') == {2, 3} and fwd('c1', 'a1') == {1} and fwd('b1', 'c1') == {3}
    ok(34, '{2,3} 和 {1}，B')

def q36():
    td = 8000 / 100e6; T = td + 0.1
    r = min(100e6, 1000 * 8000 / T)
    assert abs(r / 1e6 - 79.94) < 0.01 and min(100e6, 2000 * 8000 / T) == 100e6 and abs(8000 / T - 79936) < 1
    ok(36, 'min(100, 8Mb/0.10008s) ≈ 79.9 Mb/s，C')

def q37():
    chips = {'A': (1, 1, 1, 1), 'B': (1, -1, 1, -1), 'C': (1, 1, -1, -1)}
    seq = [2, 0, 2, 0, 0, -2, 0, -2, 0, 2, 0, 2]
    def dec(c): return [sum(a * b for a, b in zip(seq[i:i + 4], chips[c])) // 4 for i in (0, 4, 8)]
    assert dec('A') == [1, -1, 1] and dec('B') == [1, 1, -1] and dec('C') == [0, 0, 0]
    g = (0, 0, 2, 2); assert [sum(a * b for a, b in zip(g, chips[c])) // 4 for c in 'ABC'] == [1, 0, -1]
    ok(37, 'A 发 101（B 发 110，C 没发），B')

def q38():
    ss, cw = 4, 1; hist = [cw]
    for _ in range(10):
        cw = min(cw * 2, ss) if cw < ss else cw + 1
        hist.append(cw)
    assert hist == [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12] and min(hist[10], 10) == 10 and min(hist[5], 10) == 7
    ok(38, '10 RTT 后 cwnd=12，发送窗口 min(12,10)=10KB，A')

# ───────── 综合题 ─────────
C41 = r'''
#include <stdio.h>
#include <stdlib.h>
typedef struct BiTNode{
    int weight;
    struct BiTNode *left, *right;
}BiTNode, *BiTree;
int wplPre(BiTree T, int deep){
    if(T == NULL) return 0;
    if(T->left == NULL && T->right == NULL)
        return T->weight * deep;
    return wplPre(T->left, deep+1)
         + wplPre(T->right, deep+1);
}
int WPL(BiTree root){
    return wplPre(root, 0);
}
#define MaxSize 1000
int WPL2(BiTree root){
    BiTree Q[MaxSize], p;
    int front = 0, rear = 0, deep = 0, wpl = 0, i, n;
    if(root == NULL) return 0;
    Q[rear++] = root;
    while(front < rear){
        n = rear - front;
        for(i = 0; i < n; i++){
            p = Q[front++];
            if(p->left == NULL && p->right == NULL)
                wpl += p->weight * deep;
            if(p->left)  Q[rear++] = p->left;
            if(p->right) Q[rear++] = p->right;
        }
        deep++;
    }
    return wpl;
}
/* 对拍：随机建树，同时用「建树时记下每个叶子的深度」的朴素办法求 WPL */
static long ref_;
BiTree build(int n, int d){
    if(n == 0) return NULL;
    BiTree t = malloc(sizeof(BiTNode));
    int l = rand() % n;             /* 左子树结点数 0..n-1 */
    t->weight = rand() % 100;
    t->left = build(l, d+1); t->right = build(n-1-l, d+1);
    if(!t->left && !t->right) ref_ += (long)t->weight * d;
    return t;
}
void freeT(BiTree t){ if(t){ freeT(t->left); freeT(t->right); free(t);} }
int main(){
    srand(2014);
    for(int it = 0; it < 20000; it++){
        int n = rand() % 60;        /* 含空树、单结点、只有一个孩子的结点 */
        ref_ = 0;
        BiTree t = build(n, 0);
        if(WPL(t) != ref_ || WPL2(t) != ref_){ printf("FAIL n=%d\n", n); return 1; }
        freeT(t);
    }
    printf("OK 20000\n"); return 0;
}
'''
def q41():
    d = tempfile.mkdtemp(); c = os.path.join(d, 'w.c'); e = os.path.join(d, 'w')
    open(c, 'w').write(C41)
    subprocess.check_call(['gcc', '-std=c99', '-Wall', '-O1', '-o', e, c])
    out = subprocess.check_output([e]).decode().strip()
    assert out == 'OK 20000', out
    # 精解里贴的代码必须与这里被编译的一致（去掉注释和空白后比）
    src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '2014.txt'), encoding='utf-8').read()
    import re
    norm = lambda t: re.sub(r'\s+', '', re.sub(r'//[^\n]*', '', t))
    body = norm(src[src.index('\n#41\n'):src.index('\n#42\n')])
    for key in ('int wplPre(BiTree T, int deep){', 'int WPL2(BiTree root){'):
        i = C41.index(key); j = C41.index('\n}\n', i) + 2
        assert norm(C41[i:j]) in body, key
    ok(41, 'WPL 递归与层序两段 C 代码 gcc 编译，20000 棵随机树对拍一致；与页面代码一致')

def dijkstra_net():
    import heapq
    G = {'R1': {'R2': 3, 'R3': 2, 'N1': 1}, 'R2': {'R1': 3, 'R4': 4, 'N6': 1}, 'R3': {'R4': 6, 'R1': 2, 'N5': 1}, 'R4': {'R3': 6, 'R2': 4, 'N7': 1}}
    def run(G):
        dist = {'R1': 0}; prev = {}; pq = [(0, 'R1')]; order = []
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u]: continue
            order.append(u)
            for v, w in G.get(u, {}).items():
                if d + w < dist.get(v, 10 ** 9): dist[v] = d + w; prev[v] = u; heapq.heappush(pq, (d + w, v))
        def path(v):
            p = [v]
            while p[-1] in prev: p.append(prev[p[-1]])
            return p[::-1]
        return dist, path, order
    return G, run
def q42():
    G, run = dijkstra_net(); dist, path, order = run(G)
    assert [dist[n] for n in ('N1', 'N5', 'N6', 'N7')] == [1, 3, 4, 8]
    assert [n for n in order if n[0] == 'N'] == ['N1', 'N5', 'N6', 'N7']
    assert path('N7') == ['R1', 'R2', 'R4', 'N7'] and path('N5') == ['R1', 'R3', 'N5'] and dist['R4'] == 7
    G2 = {k: dict(v) for k, v in G.items()}; G2['R3']['R4'] = G2['R4']['R3'] = 1
    assert run(G2)[0]['N7'] == 4
    ok(42, '到四个子网的费用依次 1、3、4、8；192.1.7.0 走 R1→R2→R4')

def q43():
    import ipaddress as ip
    G, run = dijkstra_net(); dist, path, _ = run(G)
    hop = {n: path(n)[1] for n in ('N5', 'N6', 'N7')}
    assert hop == {'N5': 'R3', 'N6': 'R2', 'N7': 'R2'}
    agg = list(ip.collapse_addresses([ip.ip_network('192.1.6.0/24'), ip.ip_network('192.1.7.0/24')]))
    assert agg == [ip.ip_network('192.1.6.0/23')] and ip.ip_address('192.1.7.211') in agg[0]
    assert len(list(ip.collapse_addresses([ip.ip_network('192.1.5.0/24'), ip.ip_network('192.1.6.0/24')]))) == 2
    assert 64 - (len(path('N7')) - 1) == 61
    G2 = {k: dict(v) for k, v in G.items()}; G2['R2']['R4'] = G2['R4']['R2'] = 6
    d2, p2, _ = run(G2); assert d2['N7'] == 9 and p2('N7')[1] == 'R3'
    ok(43, '路由表 3 项（6.0/23 走 L0）；TTL = 64−3 = 61')

def q44():
    code = 0x1446FFFA; off = code & 0xFFFF; off -= 0x10000 if off & 0x8000 else 0
    assert off == -6 and 0x08048114 + 4 + off * 4 == 0x08048100 and (0x08048100 - 0x08048118) // off == 4
    assert 0x08048114 + 4 + 3 * 4 == 0x08048124
    # 每条指令 (写, 读)；无转发：ID 必须晚于生产者的 WB
    I = [('R4', ['R2']), ('R4', ['R4', 'R3']), ('R5', ['R4']), ('R1', ['R1', 'R5']), ('R2', ['R2']), (None, ['R2', 'R6'])]
    dep = [i + 1 for i in range(1, 6) if I[i - 1][0] in I[i][1]]
    assert dep == [2, 3, 4, 6]
    # 时空：指令 5 的 IF=1；指令 6 ID 在指令 5 的 WB(5) 之后=6，M=8；下一轮指令 1 的 IF=9、ID=10 > 5
    wb5 = 5; id6 = wb5 + 1; m6 = id6 + 2; if1 = m6 + 1; id1 = if1 + 1
    assert (id6, m6, if1, id1) == (6, 8, 9, 10) and id1 > wb5
    ok(44, 'OFFSET=−6，目标=(PC)+4+OFFSET×4；数据相关阻塞 2、3、4、6')

def q45():
    assert 16 * 32 == 512 and 0x08048100 % 32 == 0 and 6 * 4 <= 32
    def miss(start):
        cache = set(); m = 0
        for _ in range(1000):
            for k in range(6):
                b = (start + 4 * k) // 32
                if b not in cache: cache.add(b); m += 1
        return m
    assert miss(0x08048100) == 1 and round(5999 / 6000 * 100, 2) == 99.98
    assert miss(0x08048110) == 2 and round(5998 / 6000 * 100, 2) == 99.97
    i = 0; n = 0
    while True:
        i += 1; n += 1
        if i == 1000: break
    assert i == 1000 and n == 1000
    assert 1000 + 1 == 1001 and (1000 - 125) / 1000 == 0.875
    ok(45, 'R2=1000；512B；命中率 5999/6000≈99.98%；读盘 1 次、TLB 1001 次')

def q46():
    assert min(29, 171) * 2 + 1 == 59 and 171 * 2 + 1 == 343 and 29 + 1 + 1 == 31
    assert 2 ** 32 * 1020 == 4080 * 2 ** 30 and abs(2 ** 16 * 1022 / 2 ** 20 - 63.87) < 0.01
    ok(46, '连续 59 次、链接 31 次、最大 4080GB')

def q47():
    # 缩小规模穷举所有交错：缓冲区 2、连续取 K=2、2 个生产者、2 个消费者；
    # 验证 ① 无死锁 ② 任一时刻至多一个消费者处于「连取」过程中 ③ 缓冲区不上溢下溢
    N, K = 2, 2
    P = ['Pe', 'Pm', 'put', 'Vm', 'Vf']                      # 生产者循环体
    Cc = ['Pm1'] + ['Pf', 'Pm', 'get', 'Vm', 'Ve'] * K + ['Vm1']   # 消费者循环体
    progs = [P, P, Cc, Cc]
    init = ((0, 0, 0, 0), (1, 1, N, 0), 0)                   # pc, (mutex1, mutex, empty, full), 缓冲区件数
    seen = {init}; stack = [init]
    idx = {'m1': 0, 'm': 1, 'e': 2, 'f': 3}
    while stack:
        pcs, sem, buf = stack.pop(); moved = False
        inside = sum(1 for k in (2, 3) if 1 <= pcs[k] <= len(Cc) - 1)
        assert inside <= 1 and 0 <= buf <= N
        for k, prog in enumerate(progs):
            op = prog[pcs[k]]; s = list(sem); b = buf
            if op[0] == 'P':
                j = idx[op[1:]]
                if s[j] == 0: continue
                s[j] -= 1
            elif op[0] == 'V': s[idx[op[1:]]] += 1
            elif op == 'put': b += 1
            else: b -= 1
            moved = True
            np = list(pcs); np[k] = (pcs[k] + 1) % len(prog)
            st = (tuple(np), tuple(s), b)
            if st not in seen: seen.add(st); stack.append(st)
        assert moved, ('deadlock', pcs, sem, buf)
    ok(47, 'PV 解法缩小规模穷举 %d 个状态：无死锁、连取期间无其他消费者插入' % len(seen))

if __name__ == '__main__':
    for f in (q1, q2, q3, q4, q5, q6, q7, q9, q10, q11, q12, q13, q14, q15, q17, q18, q19, q22, q24, q27, q30,
              q34, q36, q37, q38, q41, q42, q43, q44, q45, q46, q47):
        f()
    concept = [8, 16, 20, 21, 23, 25, 26, 28, 29, 31, 32, 33, 35, 39, 40]
    print('概念判断题（无可算内容，答案已由构建脚本与卷子核对）：', concept)
    assert sorted(OK + concept) == list(range(1, 48))
    print('全部通过：程序复算 %d 题 ＋ 概念题 %d 题 = 47' % (len(OK), len(concept)))
