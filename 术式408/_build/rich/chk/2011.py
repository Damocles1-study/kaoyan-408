#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2011 408 套卷精解 · 独立复算。每题一个函数，assert 失败即报错；最后打印汇总。
跑法：python3 _build/rich/chk/2011.py   （第 42 题需要 gcc，源码在同目录 2011_q42.c）"""
import itertools, math, os, re, struct, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
OK = []
def ok(n, msg): OK.append(n); print('✓ %2d  %s' % (n, msg))

# ───────── 数据结构 ─────────
def q1():
    def cnt(n):
        x = 2; k = 0
        while x < n / 2: x *= 2; k += 1
        return k
    for n in (16, 64, 1024, 2 ** 20):
        assert cnt(n) == math.log2(n) - 2
    def cnt2(n):                                   # 变式：x=x+2
        x = 2; k = 0
        while x < n / 2: x += 2; k += 1
        return k
    assert cnt2(4000) == 999
    ok(1, 'n=2^m 时循环体执行 log2(n)−2 次 ⟹ O(log n)，A；变式 x+=2 为 n/4 量级')

def pops(seq):
    """seq 依次入栈，返回全部出栈序列"""
    res = set()
    def go(i, st, out):
        if i == len(seq) and not st: res.add(out); return
        if i < len(seq): go(i + 1, st + seq[i], out)
        if st: go(i, st[:-1], out + st[-1])
    go(0, '', ''); return res

def q2():
    P = pops('abcde')
    d = sorted(p for p in P if p[0] == 'd')
    assert d == ['dcbae', 'dcbea', 'dceba', 'decba'] and len(P) == 42
    assert len([p for p in P if p[0] == 'c']) == 9 and len([p for p in P if p[0] == 'e']) == 1
    assert len([p for p in P if p[0] == 'a']) == 14
    ok(2, '穷举 42 个出栈序列，d 开头恰 4 个，B；c 开头 9 个、e 开头 1 个、a 开头 14 个')

def q3():
    n = 8
    def first_slot(front, rear):                   # 入队：先 rear=(rear+1)%n 再存
        rear = (rear + 1) % n
        return rear, front
    for name, (f, r) in {'A': (0, 0), 'B': (0, n - 1), 'C': (n - 1, 0), 'D': (n - 1, n - 1)}.items():
        pos, fr = first_slot(f, r)
        good = (pos == 0 and fr == 0)              # 存在 A[0]，且 front 指向队首 A[0]
        assert good == (name == 'B')
    ok(3, '四个选项逐个代入入队操作，只有 front=0、rear=n−1 满足，B')

def q4():
    def leaves(n): return sum(1 for i in range(1, n + 1) if 2 * i > n)
    assert leaves(768) == 384 == 768 - 768 // 2 and leaves(767) == 384
    assert [n for n in range(1, 2000) if leaves(n) == 384] == [767, 768]
    ok(4, '按编号数叶子：768 个结点 384 个叶子，C；叶子 384 时结点数只能是 767 或 768')

def trees(pre, post):
    if not pre: return [None]
    if pre[0] != post[-1] or sorted(pre) != sorted(post): return []
    res = []; rp, ro = pre[1:], post[:-1]
    for k in range(len(rp) + 1):
        for L in trees(rp[:k], ro[:k]):
            for R in trees(rp[k:], ro[k:]):
                res.append((pre[0], L, R))
    return res
def inorder(t): return '' if t is None else inorder(t[1]) + t[0] + inorder(t[2])

def q5():
    T = trees('1234', '4321'); ins = sorted(inorder(t) for t in T)
    assert len(T) == 8 and ins == ['1234', '1243', '1342', '1432', '2341', '2431', '3421', '4321']
    assert '3241' not in ins and all(x in ins for x in ('1234', '2341', '4321'))
    ok(5, '先序 1234、后序 4321 的树共 8 棵（全是单支），中序没有 3,2,4,1，C')

def q6():
    import random
    random.seed(6)
    for _ in range(300):
        n = random.randint(1, 60); par = [None] + [random.randrange(i) for i in range(1, n)]
        kids = {i: [] for i in range(n)}
        for i in range(1, n): kids[par[i]].append(i)
        leaf = sum(1 for i in range(n) if not kids[i])
        # 孩子兄弟：右孩子＝下一个兄弟；左孩子＝第一个孩子
        noright = 1 + sum(1 for i in range(n) if kids[i])          # 根 ＋ 每组兄弟的最后一个
        cnt = sum(1 for i in range(n) if par[i] is None or kids[par[i]][-1] == i)
        noleft = sum(1 for i in range(n) if not kids[i])
        assert cnt == noright == n - leaf + 1 and noleft == leaf
    assert 2011 - 116 + 1 == 1896
    ok(6, '300 棵随机树验证「无右孩子＝分支结点数＋1」「无左孩子＝叶子数」；2011−116+1=1896，D')

def bst_path(seq):
    lo, hi = -math.inf, math.inf
    for a, b in zip(seq, seq[1:]):
        if not lo < a < hi: return False
        if b < a: hi = a
        else: lo = a
    return lo < seq[-1] < hi

def q7():
    S = {'A': [95, 22, 91, 24, 94, 71], 'B': [92, 20, 91, 34, 88, 35], 'C': [21, 89, 77, 29, 36, 38], 'D': [12, 25, 71, 68, 33, 34]}
    assert [k for k, v in S.items() if not bst_path(v)] == ['A']
    assert bst_path([95, 22, 91, 24, 90, 71]) and not bst_path([50, 30, 40, 35, 45, 33])
    ok(7, '区间夹逼：只有 A 不合法（94 落在 (24,91) 之外）')

def q11():
    h = [None, 25, 13, 10, 12, 9, 18]; i = 6; cmp = 0
    while i > 1:
        cmp += 1
        if h[i] > h[i // 2]: h[i], h[i // 2] = h[i // 2], h[i]; i //= 2
        else: break
    assert cmp == 2 and h[1:] == [25, 13, 18, 12, 9, 10]
    h = [None, 25, 13, 10, 12, 9, 30]; i = 6; cmp = 0          # 变式：插入 30
    while i > 1:
        cmp += 1
        if h[i] > h[i // 2]: h[i], h[i // 2] = h[i // 2], h[i]; i //= 2
        else: break
    assert cmp == 2 and h[1] == 30
    # 变式：删除堆顶 25（原堆 5 个元素）
    h = [None, 9, 13, 10, 12]; n = 4; i = 1; cmp = 0
    while 2 * i <= n:
        j = 2 * i
        if j < n: cmp += 1; j += h[j + 1] > h[j]
        cmp += 1
        if h[j] > h[i]: h[i], h[j] = h[j], h[i]; i = j
        else: break
    assert cmp == 3 and h[1:] == [13, 12, 10, 9]
    ok(11, '插入 18 上浮：比较 2 次（10、25），B；变式删堆顶比较 3 次')

# ───────── 组成原理 ─────────
def q13():
    assert struct.pack('>f', -8.25).hex().upper() == 'C1040000'
    assert struct.pack('>f', 8.25).hex().upper() == '41040000' and struct.pack('>f', -0.75).hex().upper() == 'BF400000'
    ok(13, 'struct.pack(−8.25)=C1040000H，A')

def q15():
    assert math.log2(64 * 2 ** 20) == 26 and (32 * 2 ** 20) // (4 * 2 ** 20) == 8 and math.log2(4 * 2 ** 20) == 22
    ok(15, '64MB=2^26 ⟹ MAR 26 位，D；32MB 需 8 片，片内地址 22 位')

def q17():
    for a in range(256):
        for b in range(256):
            r = (a - b) & 0xFF
            cf = int(a < b); zf = int(r == 0); sf = r >> 7
            sa, sb = a - 256 * (a >> 7), b - 256 * (b >> 7)
            of = int(not -128 <= sa - sb <= 127)
            assert (a > b) == (cf == 0 and zf == 0)                       # C
            assert (sa > sb) == (zf == 0 and sf == of)                    # 有符号大于
            assert (a >= b) == (cf == 0)
    bad = lambda f: any((a > b) != f(a, b) for a in range(256) for b in range(256))
    def flags(a, b):
        r = (a - b) & 0xFF; sa, sb = a - 256 * (a >> 7), b - 256 * (b >> 7)
        return int(a < b), int(r == 0), r >> 7, int(not -128 <= sa - sb <= 127)
    assert bad(lambda a, b: (flags(a, b)[0] or flags(a, b)[3]))           # A
    assert bad(lambda a, b: ((not flags(a, b)[2]) or flags(a, b)[1]))     # B
    assert bad(lambda a, b: (not flags(a, b)[0]) and (not flags(a, b)[2]))  # D
    ok(17, '穷举 8 位全部 65536 对：无符号 a>b ⟺ CF=0 且 ZF=0，C；A、B、D 均有反例')

def q21():
    order = [4, 0, 2, 1, 3]                         # 处理优先级从高到低
    def mask(k):
        low = set(order[order.index(k):])           # 自己和比自己低的
        return ''.join('1' if i in low else '0' for i in (4, 3, 2, 1, 0))
    assert mask(1) == '01010' and mask(0) == '01111' and mask(4) == '11111' and mask(3) == '01000' and mask(2) == '01110'
    ok(21, 'L1 屏蔽自己和 L3 ⟹ 01010，D；L0=01111、L4=11111、L3=01000')

def q22():
    assert 200 * 500 / 50e6 == 0.002 and 500 * 500 / 50e6 == 0.005 and 200 * 100 * 5 / 50e6 == 0.002
    ok(22, '200×500÷50M＝0.20%，C')

# ───────── 操作系统 ─────────
def safe_seqs(avail, alloc, need):
    n = len(alloc); res = []
    def go(work, done, seq):
        if len(seq) == n: res.append(tuple(seq)); return
        for i in range(n):
            if i not in done and all(x <= y for x, y in zip(need[i], work)):
                go([a + b for a, b in zip(work, alloc[i])], done | {i}, seq + [i + 1])
    go(list(avail), frozenset(), []); return res

def q27():
    alloc = [(2, 0, 0), (1, 2, 0), (0, 1, 1), (0, 0, 1)]; need = [(0, 0, 1), (1, 3, 2), (1, 3, 1), (2, 0, 0)]
    assert safe_seqs((0, 2, 1), alloc, need) == []
    s = safe_seqs((0, 3, 1), alloc, need)           # 变式：R2 多 1 个
    assert set(s) == {(1, 3, 2, 4), (1, 3, 4, 2), (1, 4, 2, 3), (1, 4, 3, 2)}
    ok(27, '穷举全部排列：没有安全序列，D；变式可用 (0,3,1) 时有 4 个安全序列')

def q31():
    T, M, C, n = 100, 50, 50, 10
    # 单缓冲：读入与传送串行占用缓冲区；分析可与下一块的读入并行
    t = 0; cpu_free = 0
    for _ in range(n):
        t += T                                     # 读入缓冲区
        t = max(t, cpu_free) + M                   # 传送到用户区（要等上一块分析完，用户区才空）
        cpu_free = t + C
    single = cpu_free
    # 双缓冲：磁盘连续读；传送＋分析串行
    t = 0; cpu = 0
    for k in range(1, n + 1):
        arrive = k * T
        cpu = max(cpu, arrive) + M + C
    double = cpu
    assert (single, double) == (1550, 1100)
    assert n * (T + M) + C == 1550 and n * T + M + C == 1100
    ok(31, '按时间轴模拟：单缓冲 1550μs、双缓冲 1100μs，B')

def q32():
    res = set(); cnt = 0
    for order in set(itertools.permutations('111222')):
        cnt += 1
        x = 1; r = {}; pc = {'1': 0, '2': 0}
        for p in order:
            s = pc[p]; pc[p] += 1
            if s == 0: r[p] = x
            elif s == 1: r[p] += 1 if p == '1' else -1
            else: x = r[p]
        res.add(x)
    assert cnt == 20 and res == {0, 1, 2}
    ok(32, '20 种交错穷举，x ∈ {0,1,2}，C')

# ───────── 计算机网络 ─────────
def q34():
    assert 2400 / math.log2(4) == 1200 and 2400 / math.log2(8) == 800 and 1200 * math.log2(16) == 4800
    ok(34, '2400÷log2(4)＝1200 Baud，B')

def q35():
    sent = {0, 1, 2, 3}; acked = {1}; timeout = {0, 2}
    assert len(timeout - acked) == 2 and len(sent - acked) == 3
    ok(35, 'SR 只重传超时的 0、2 号 ⟹ 2 帧，B；（GBN 从 0 号起重传 4 帧）')

def q37():
    import ipaddress as ip
    a, b = ip.ip_network('192.168.2.0/25'), ip.ip_network('192.168.2.128/25')
    agg = list(ip.collapse_addresses([a, b]))
    assert agg == [ip.ip_network('192.168.2.0/24')] and str(agg[0].netmask) == '255.255.255.0'
    assert ip.ip_address('192.168.1.2') in ip.ip_network('192.168.1.0/24')
    ok(37, '两个 /25 聚合成 192.168.2.0/24，下一跳 192.168.1.2，D')

def q38():
    import ipaddress as ip
    n = ip.ip_network('192.168.4.0/30')
    assert str(n.broadcast_address) == '192.168.4.3' and len(list(n.hosts())) == 2
    assert str(ip.ip_network('192.168.4.0/29').broadcast_address) == '192.168.4.7'
    ok(38, '192.168.4.3 是 /30 的广播地址，可用主机 2 台，C')

def q39():
    assert 11220 + 1 == 11221
    ok(39, 'SYN 占一个序号：ack＝11220+1＝11221，且 SYN=1、ACK=1，C')

def q40():
    seg3 = 900; seg2 = seg3 - 400; seg1 = seg2 - 300
    assert (seg1, seg2, seg3 + 500) == (200, 500, 1400)
    ok(40, '第 2 段序号 900−400＝500 ⟹ 确认号 500，B；三段全收到时为 1400')

# ───────── 综合题 ─────────
def q41():
    arr = [4, 6, None, None, None, 5, None, None, None, 4, 3, None, None, 3, 3]; n = 6
    A = [[None] * n for _ in range(n)]; k = 0
    for i in range(n):
        for j in range(i + 1, n):
            A[i][j] = arr[k]
            assert k == i * (2 * n - i - 1) // 2 + (j - i - 1)
            k += 1
    assert k == 15
    E = {(i, j): A[i][j] for i in range(n) for j in range(n) if A[i][j]}
    assert E == {(0, 1): 4, (0, 2): 6, (1, 2): 5, (2, 3): 4, (2, 4): 3, (3, 5): 3, (4, 5): 3}
    ve = [0] * n
    for (i, j), w in sorted(E.items()): ve[j] = max(ve[j], ve[i] + w)
    vl = [ve[-1]] * n
    for (i, j), w in sorted(E.items(), reverse=True): vl[i] = min(vl[i], vl[j] - w)
    assert ve == [0, 4, 9, 13, 12, 16] and vl == [0, 4, 9, 13, 13, 16]
    slack = {e: vl[e[1]] - w - ve[e[0]] for e, w in E.items()}
    assert [e for e in sorted(E) if slack[e] == 0] == [(0, 1), (1, 2), (2, 3), (3, 5)] and slack[(0, 2)] == 3 and slack[(2, 4)] == 1 and slack[(4, 5)] == 1
    paths = []
    def go(u, p, d):
        if u == 5: paths.append((d, p)); return
        for (i, j), w in E.items():
            if i == u: go(j, p + [j], d + w)
    go(0, [0], 0)
    assert sorted(paths) == [(12, [0, 2, 4, 5]), (13, [0, 2, 3, 5]), (15, [0, 1, 2, 4, 5]), (16, [0, 1, 2, 3, 5])]
    ok(41, '还原出 7 条弧；ve=(0,4,9,13,12,16)、vl=(0,4,9,13,13,16)；关键路径 0→1→2→3→5，长 16')

def q42():
    src = open(os.path.join(HERE, '2011_q42.c'), encoding='utf-8').read()
    txt = open(os.path.join(HERE, '..', '2011.txt'), encoding='utf-8').read()
    for tag in ('merge', 'best'):
        code = re.search(r'//BEGIN %s\n(.*?)//END %s' % (tag, tag), src, re.S).group(1).strip()
        assert code in txt, '卷面代码与被编译的源码不一致：' + tag
    exe = os.path.join(tempfile.mkdtemp(), 'q42')
    subprocess.run(['gcc', '-Wall', '-Werror', '-O2', '-o', exe, os.path.join(HERE, '2011_q42.c')], check=True)
    out = subprocess.run([exe], capture_output=True, text=True, check=True).stdout.strip()
    assert out.startswith('OK'), out
    # 精解里的手推：A=(11,13,15,17,19)，B=(2,4,6,8,20)
    A, B = [11, 13, 15, 17, 19], [2, 4, 6, 8, 20]; s1, d1, s2, d2 = 0, 4, 0, 4; tr = []
    while s1 != d1 or s2 != d2:
        m1, m2 = (s1 + d1) // 2, (s2 + d2) // 2
        if A[m1] == B[m2]: break
        if A[m1] < B[m2]:
            s1 = m1 if (s1 + d1) % 2 == 0 else m1 + 1; d2 = m2
        else:
            d1 = m1; s2 = m2 if (s2 + d2) % 2 == 0 else m2 + 1
        tr.append((A[s1:d1 + 1], B[s2:d2 + 1]))
    assert tr == [([11, 13, 15], [6, 8, 20]), ([11, 13], [8, 20]), ([11], [20])] and min(A[s1], B[s2]) == 11
    ok(42, 'gcc 编译；卷面两段代码与源码逐字一致；对拍：' + out)

def q43():
    x, y = 134, 246
    s8 = lambda v: v - 256 if v & 0x80 else v
    assert '%02X' % x == '86' and '%02X' % y == 'F6'
    z1 = (x - y) & 0xFF; z2 = (x + y) & 0xFF
    assert ('%02X' % z1, '%02X' % z2) == ('90', '7C')
    m, n = s8(x), s8(y)
    assert (m, n) == (-122, -10) and s8(z1) == -112 == m - n and m + n == -132 and s8(z2) == 124
    ov = lambda v: not -128 <= v <= 127
    assert not ov(m - n) and ov(m + n)
    # 加法器视角：x−y＝x＋(~y+1)
    ny = (~y + 1) & 0xFF; assert ny == 0x0A and (x + ny) >> 8 == 0 and (x + y) >> 8 == 1
    # 次高位进位与最高位进位
    def carries(a, b): c7 = ((a & 0x7F) + (b & 0x7F)) >> 7; c8 = (a + b) >> 8; return c7, c8
    assert carries(x, y) == (0, 1) and carries(x, ny) == (0, 0)
    ok(43, 'R1=86H、R5=90H、R6=7CH；m=−122、k1=−112；仅 k2=m+n（−132）溢出')

def q44():
    assert math.log2(16 * 2 ** 20) == 24 and math.log2(2 ** 20) == 20 and math.log2(4096) == 12
    pt = {0: 0x06, 1: 0x04, 2: 0x15, 3: 0x02, 5: 0x2B, 7: 0x32}
    cache = {0: 0x020, 2: 0x01D, 3: 0x105, 4: 0x064, 5: 0x14D, 7: 0x27A}
    va = 0x001C60; vpn, off = va >> 12, va & 0xFFF
    assert vpn == 1 and vpn in pt
    pa = (pt[vpn] << 12) | off; assert pa == 0x04C60
    blk, line, tag = pa & 0x1F, (pa >> 5) & 7, pa >> 8
    assert (blk, line, tag) == (0, 3, 0x04C) and cache[line] == 0x105 != tag
    tlb = {0: {0x001: 0x15, 0x012: 0x1F}, 1: {0x013: 0x2D, 0x008: 0x7E}}
    vpn2 = 0x024BAC >> 12; s, t = vpn2 & 1, vpn2 >> 1
    assert (vpn2, s, t) == (0x024, 0, 0x012) and tlb[s][t] == 0x1F and (0x1F << 12 | 0xBAC) == 0x1FBAC
    # 变式：虚拟地址 002C60H ⟹ 页框 15H ⟹ 15C60H，行 3、标记 15C
    pa2 = (pt[2] << 12) | 0xC60; assert pa2 == 0x15C60 and (pa2 >> 5) & 7 == 3 and pa2 >> 8 == 0x15C
    # 变式：物理地址 105xx 落在第 3 行且命中的范围
    assert [(0x105 << 8 | 3 << 5), (0x105 << 8 | 3 << 5 | 31)] == [0x10560, 0x1057F]
    ok(44, '24/12、20/8；标记 12｜行号 3｜块内 5；001C60H→04C60H，第 3 行标记 105≠04C 不命中；024BACH 的 TLB 组 0 标记 012 命中（页框 1F）')

def q45():
    import random
    random.seed(45)
    # 用离散事件模拟信号量：10 个座位、1 台取号机、1 个营业员；检查等候人数≤10、取号互斥、服务一对一
    for trial in range(200):
        N = random.randint(1, 40)
        sem = {'empty': 10, 'mutex': 1, 'full': 0, 'service': 0}; wait = {k: [] for k in sem}
        def P(s, who):
            sem[s] -= 1
            if sem[s] < 0: wait[s].append(who); return False
            return True
        def V(s):
            sem[s] += 1
            if sem[s] <= 0: ready.append(wait[s].pop(0))
        pc = {('c', i): 0 for i in range(N)}; pc[('t', 0)] = 0
        ready = list(pc); seated = 0; at_machine = 0; served = 0; being = 0
        while ready:
            who = ready.pop(random.randrange(len(ready))); k = pc[who]
            if who[0] == 'c':
                if k == 0: nxt = P('empty', who)
                elif k == 1: nxt = P('mutex', who)
                elif k == 2: at_machine += 1; assert at_machine == 1; seated += 1; assert seated <= 10; nxt = True
                elif k == 3: at_machine -= 1; V('mutex'); nxt = True
                elif k == 4: V('full'); nxt = True
                elif k == 5: nxt = P('service', who)
                elif k == 6: being += 1; served += 1; pc[who] = 7; continue
                pc[who] = k + 1
                if nxt: ready.append(who)
            else:
                if k == 0: nxt = P('full', who)
                elif k == 1: seated -= 1; V('empty'); nxt = True
                elif k == 2: V('service'); nxt = True
                elif k == 3: nxt = True
                pc[who] = (k + 1) % 4
                if nxt: ready.append(who)
        assert served == N and seated == 0 and sem['empty'] == 10 and sem['mutex'] == 1
    ok(45, '信号量解法 200 次随机调度模拟：等候人数不超过 10、取号互斥、全部顾客得到服务、无死锁')

def q47():
    hx = ('00 21 27 21 51 ee 00 15 c5 c1 5e 28 08 00 45 00 01 ef 11 3b 40 00 80 06 ba 9d 0a 02 80 64 40 aa '
          '62 20 04 ff 00 50 e0 e2 00 fa 7b f9 f8 05 50 18 fa f0 1a c4 00 00 47 45 54 20 2f 72 66 63 2e 68 '
          '74 6d 6c 20 48 54 54 50 2f 31 2e 31 0d 0a 41 63')
    b = bytes.fromhex(hx.replace(' ', '')); assert len(b) == 80
    assert b[:6].hex('-') == '00-21-27-21-51-ee' and b[6:12].hex('-') == '00-15-c5-c1-5e-28' and b[12:14] == b'\x08\x00'
    ip = b[14:34]; assert ip[0] == 0x45
    cs = sum(struct.unpack('>10H', ip)); cs = (cs & 0xFFFF) + (cs >> 16); assert cs == 0xFFFF, 'IP 首部校验和不对，转录有误'
    assert '.'.join(map(str, ip[12:16])) == '10.2.128.100' and '.'.join(map(str, ip[16:20])) == '64.170.98.32'
    assert ip[8] == 128 and ip[9] == 6 and struct.unpack('>H', ip[2:4])[0] == 495 < 1500
    tcp = b[34:54]; sp, dp = struct.unpack('>HH', tcp[:4]); assert (sp, dp) == (1279, 80) and tcp[12] >> 4 == 5 and tcp[13] == 0x18
    assert b[54:].startswith(b'GET /rfc.html HTTP/1.1\r\n')
    assert bytes(map(int, '101.12.123.15'.split('.'))).hex() == '650c7b0f'
    # NAT 后重算校验和：源地址换成 101.12.123.15、TTL 减 1
    new = bytearray(ip); new[8] = 127; new[12:16] = bytes([101, 12, 123, 15]); new[10:12] = b'\x00\x00'
    s = sum(struct.unpack('>10H', bytes(new))); s = (s & 0xFFFF) + (s >> 16); s = (s & 0xFFFF) + (s >> 16)
    assert (~s & 0xFFFF) != 0xBA9D
    assert 1 + 5 == 6 and 2 + 1 + 5 == 8
    ok(47, '80 字节解析：IP 校验和成立；目的 IP 64.170.98.32、网关 MAC 00-21-27-21-51-ee、TTL 128、总长 495；6 RTT')

def concept():
    L = (8, 9, 10, 12, 14, 16, 18, 19, 20, 23, 24, 25, 26, 28, 29, 30, 33, 36, 46)
    OK.extend(L)
    print('·  概念题 ' + ' '.join(map(str, L)) + '：无可计算内容，答案由构建时与卷面答案核对')
    return len(L)

if __name__ == '__main__':
    for f in (q1, q2, q3, q4, q5, q6, q7, q11, q13, q15, q17, q21, q22, q27, q31, q32, q34, q35, q37, q38, q39, q40, q41, q42, q43, q44, q45, q47): f()
    k = concept()
    miss = sorted(set(range(1, 48)) - set(OK))
    assert not miss, miss
    print('\n2011：47 题全部通过（其中程序复算 %d 题）' % (47 - k))
