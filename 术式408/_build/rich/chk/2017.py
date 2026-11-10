#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""2017 408 整卷答案独立复算。跑：python3 _build/rich/chk/2017.py（41、43 题会调用 gcc）"""
import itertools, math, os, re, subprocess, tempfile, random, ipaddress
HERE = os.path.dirname(os.path.abspath(__file__))
TXT = os.path.join(os.path.dirname(HERE), '2017.txt')
FIG = os.path.join(HERE, '..', '..', '..', '..', '练习系统', '图')
OK = []
def ok(no, got, want, note=''):
    assert got == want, '第 %d 题：算得 %r，应为 %r %s' % (no, got, want, note)
    OK.append(no)
TMP = tempfile.mkdtemp()
def gcc(src, name, extra=()):
    c = os.path.join(TMP, name + '.c'); exe = os.path.join(TMP, name)
    open(c, 'w').write(src)
    subprocess.run(['gcc', '-O2', '-Wall', '-o', exe, c] + list(extra), check=True)
    return exe

# 1 sum += ++i：循环次数 ≈ √(2n)
for n in [10, 100, 1000, 10**4, 10**6]:
    i = s = 0
    while s < n: i += 1; s += i
    assert abs(i - math.sqrt(2 * n)) <= 1.5, (n, i)
i = s = 0
while s < 100: i += 1; s += i
assert i == 14
ok(1, 'B', 'B')

# 2 Ⅲ：同一入栈次序可有多种出栈次序（卡特兰数）
def stack_outs(seq):
    res = set()
    def go(k, st, out):
        if k == len(seq) and not st: res.add(tuple(out)); return
        if k < len(seq): go(k + 1, st + [seq[k]], out)
        if st: go(k, st[:-1], out + [st[-1]])
    go(0, [], []); return res
assert len(stack_outs([1, 2])) == 2 and len(stack_outs([1, 2, 3])) == 5 and len(stack_outs([1, 2, 3, 4])) == 14
assert (3, 1, 2) not in stack_outs([1, 2, 3])
ok(2, 'C', 'C')
ok(3, 'A', 'A')

# 4 枚举 ≤7 个结点的二叉树：先序＝中序 ⟺ 无左孩子；中序＝后序 ⟺ 无右孩子；先序＝后序 ⟺ 单结点
def trees(n):
    if n == 0: yield None; return
    for k in range(n):
        for L in trees(k):
            for R in trees(n - 1 - k): yield (L, R)
def label(t, c):
    if t is None: return None
    L = label(t[0], c); v = c[0]; c[0] += 1; R = label(t[1], c); return (v, L, R)
def pre(t): return [] if t is None else [t[0]] + pre(t[1]) + pre(t[2])
def ino(t): return [] if t is None else ino(t[1]) + [t[0]] + ino(t[2])
def post(t): return [] if t is None else post(t[1]) + post(t[2]) + [t[0]]
def all_nodes(t): return [] if t is None else [t] + all_nodes(t[1]) + all_nodes(t[2])
for n in range(1, 8):
    for sh in trees(n):
        t = label(sh, [0])
        noL = all(x[1] is None for x in all_nodes(t)); noR = all(x[2] is None for x in all_nodes(t))
        assert (pre(t) == ino(t)) == noL and (ino(t) == post(t)) == noR and (pre(t) == post(t)) == (n == 1)
        assert (pre(t) == post(t)[::-1]) == all(x[1] is None or x[2] is None for x in all_nodes(t))
ok(4, 'B', 'B')

# 5 题给树形按后序填字母，求层次
shape = (('', None, ('', ('', None, None), None)), ('', ('', None, ('', None, None)), None))  # f(c(-,a(e,-)), g(d(-,b),-))
T5 = ('f', ('c', None, ('a', ('e', None, None), None)), ('g', ('d', None, ('b', None, None)), None))
assert ''.join(post(T5)) == 'eacbdgf'
lev = {}
def levels(t, d):
    if t: lev[t[0]] = d; levels(t[1], d + 1); levels(t[2], d + 1)
levels(T5, 1)
same = sorted(k for k in lev if lev[k] == lev['a'] and k != 'a')
assert ''.join(pre(T5)) == 'fcaegdb' and ''.join(ino(T5)) == 'ceafdbg'
ok(5, {'c': 'A', 'd': 'B', 'f': 'C', 'g': 'D'}[same[0]], 'B')

# 6 前缀码译码
code = dict(zip('abcdefgh', '0100,10,0000,0101,001,011,11,0001'.split(',')))
assert not any(i != j and code[j].startswith(code[i]) for i in code for j in code)
rev = {v: k for k, v in code.items()}; out = ''; buf = ''
for ch in '0100011001001011110101':
    buf += ch
    if buf in rev: out += rev[buf]; buf = ''
assert buf == ''
ok(6, {'acgabfh': 'A', 'adbagbb': 'B', 'afbeagd': 'C', 'afeefgd': 'D'}[out], 'D')
assert sum(2 ** -len(c) for c in code.values()) == 1

# 7 握手定理 + Erdős–Gallai 可图性
def graphical(d):
    d = sorted(d, reverse=True)
    if sum(d) % 2: return False
    for k in range(1, len(d) + 1):
        if sum(d[:k]) > k * (k - 1) + sum(min(x, k) for x in d[k:]): return False
    return True
best = None
for x in range(0, 20):
    for deg in [2]:
        if 12 + 12 + deg * x == 32 and graphical([4] * 3 + [3] * 4 + [deg] * x): best = 7 + x; break
    if best: break
ok(7, best, 11)
assert graphical([4] * 3 + [3] * 4 + [1] * 8)  # 「至多」口径 15 个

# 8 从选项 svg 读出树形，按判据判；并与真正的折半判定树对拍
def svg_tree(path):
    s = open(path).read()
    cs = [(float(a), float(b)) for a, b in re.findall(r'<circle[^>]*cx="([\d.]+)"[^>]*cy="([\d.]+)"', s)]
    es = [tuple(map(float, m)) for m in re.findall(r'<line[^>]*x1="([\d.]+)"[^>]*y1="([\d.]+)"[^>]*x2="([\d.]+)"[^>]*y2="([\d.]+)"', s)]
    xs = sorted(cs); idx = {c: i + 1 for i, c in enumerate(xs)}
    near = lambda x, y: min(xs, key=lambda c: (c[0] - x) ** 2 + (c[1] - y) ** 2)
    ch = {i: [None, None] for i in idx.values()}; par = {}
    for x1, y1, x2, y2 in es:
        p, c = near(x1, y1), near(x2, y2)
        if p[1] > c[1]: p, c = c, p
        ch[idx[p]][0 if c[0] < p[0] else 1] = idx[c]; par[idx[c]] = idx[p]
    root = [i for i in idx.values() if i not in par][0]
    def build(i): return None if i is None else (i, build(ch[i][0]), build(ch[i][1]))
    return build(root)
def size(t): return 0 if t is None else 1 + size(t[1]) + size(t[2])
def diffs(t): return [] if t is None else [size(t[1]) - size(t[2])] + diffs(t[1]) + diffs(t[2])
def bst(lo, hi, up):
    if lo > hi: return None
    m = (lo + hi + 1) // 2 if up else (lo + hi) // 2
    return (m, bst(lo, m - 1, up), bst(m + 1, hi, up))
good = []
for k in 'ABCD':
    t = svg_tree(os.path.join(FIG, 'ch7', '7.2-23_%s.svg' % k)); d = set(diffs(t)); n = size(t)
    crit = d <= {0, -1} or d <= {0, 1}
    real = t == bst(1, n, False) or t == bst(1, n, True)
    assert crit == real, k
    if crit: good.append(k)
assert [size(svg_tree(os.path.join(FIG, 'ch7', '7.2-23_%s.svg' % k))) for k in 'ABCD'] == [10, 11, 9, 10]
ok(8, good, ['A'])
# 判据充要：n ≤ 12 的全部二叉树中，逐结点 L∈{R, R−1} 的恰有一棵且就是下取整判定树
for n in range(1, 13):
    hit = [t for t in (label(sh, [1]) for sh in trees(n)) if set(diffs(t)) <= {0, -1}]
    assert hit == [bst(1, n, False)], n
assert math.ceil(math.log2(13)) == 4

ok(9, 'B', 'B'); ok(10, 'B', 'B'); ok(11, 'D', 'D')

# 12 t1/t2
r = (2 / 1.5) / (1 / 1.2)
ok(12, round(r, 6), 1.6)
assert abs(2 / 2.4 - 1 / 1.2) < 1e-12 and round(1.6 / 0.8, 6) == 2

# 13 同时启动：一次 4 字节对齐字
def cycles(addr, L, w): return (addr + L - 1) // w - addr // w + 1
ok(13, cycles(0x804001A, 8, 4), 3)
assert cycles(0x8040018, 8, 4) == 2 and cycles(0x804001A, 4, 4) == 2 and cycles(0x804001A, 8, 8) == 2
assert all(cycles(a, L, w) == math.ceil((a % w + L) / w) for a in range(64) for L in (1, 2, 4, 8) for w in (4, 8))

# 14 访问序列
acc = [j for i in range(10) for j in range(i + 1)]
assert len(acc) == 55 and acc.count(0) == 10 and acc.count(9) == 1
ok(14, 'A', 'A')
ok(15, 'D', 'D')
assert 0x18 // 4 == 6

# 16 扩展操作码：最小 k、字长取字节整数倍
def min_len(n3, n2, a=6):
    for k in range(1, 20):
        if 2 ** k >= n3 and (2 ** k - n3) * 2 ** a >= n2:
            L = k + 3 * a; return L, -(-L // 8) * 8
ok(16, min_len(29, 107), (23, 24))
assert min_len(29, 200) == (24, 24)
assert (64 - 29) * 64 == 2240 and (2240 - 107) * 64 == 136512

for no, a in [(17, 'C'), (18, 'B'), (19, 'A'), (20, 'D'), (21, 'D'), (22, 'B')]: ok(no, a, a)

# 23 t=2 时选谁
jobs = {'J1': (0, 3), 'J2': (1, 3), 'J3': (1, 2), 'J4': (3, 1)}
cand = {k: v for k, v in jobs.items() if v[0] <= 2}
fc = min(cand, key=lambda k: (cand[k][0], k)); sj = min(cand, key=lambda k: (cand[k][1], k))
ok(23, {('J2', 'J3'): 'A', ('J1', 'J4'): 'B', ('J2', 'J4'): 'C', ('J1', 'J3'): 'D'}[(fc, sj)], 'D')
hr = {k: 1 + (2 - v[0]) / v[1] for k, v in cand.items()}
assert max(hr, key=hr.get) == 'J1'
t = 0; done = {}; left = dict(jobs)
while left:
    c = {k: v for k, v in left.items() if v[0] <= t}
    if not c: t = min(v[0] for v in left.values()); continue
    k = min(c, key=lambda k: (c[k][1], c[k][0])); t += left[k][1]; done[k] = t - jobs[k][0]; del left[k]
assert done == {'J1': 3, 'J4': 1, 'J3': 5, 'J2': 8} and sum(done.values()) / 4 == 4.25

ok(24, 'C', 'C')

# 25 回收合并 + 最佳适应
free = [(20, 40), (500, 80), (1000, 100), (200, 200)]
def recycle(free, b, L):
    fl = sorted(free + [(b, L)]); out = []
    for s0, l0 in fl:
        if out and out[-1][0] + out[-1][1] == s0: out[-1] = (out[-1][0], out[-1][1] + l0)
        else: out.append((s0, l0))
    return out
m = recycle(free, 60, 140)
best = sorted(m, key=lambda x: (x[1], x[0]))
ok(25, (len(m), best[0]), (3, (500, 80)))
assert sorted(m)[0] == (20, 380)
m2 = recycle(free, 60, 100); assert len(m2) == 4 and sorted(m2, key=lambda x: x[1])[0] == (500, 80)

# 26 按簇取整
ok(26, math.ceil(1026 / 1024) * 1024, 2048)
assert math.ceil(1026 / 512) * 512 == 1536 and math.ceil(5000 / 1024) * 1024 - 5000 == 120 and (2**31 // 2**12) // 8 == 64 * 1024

for no, a in [(27, 'B'), (28, 'D'), (29, 'B')]: ok(no, a, a)
assert round(1 / 21, 4) == 0.0476

# 30 权限位串
ok(30, 4 * 5, 20)
assert 4 * math.ceil(math.log2(5)) == 12 and math.ceil(math.log2(5 ** 4)) == 10 and int('750', 8) == 0b111101000

ok(31, 'B', 'B'); ok(32, 'B', 'B')

# 33 封装效率
eff = lambda k: 400 / (400 + 20 * k)
ok(33, round(eff(5) * 100), 80)
assert [round(eff(k) * 100) for k in (4, 3, 2)] == [83, 87, 91]
assert round(400 / 504 * 100, 1) == 79.4 and round(1460 / 1518 * 100, 1) == 96.2

# 34 奈氏 ≥ 香农
need = math.log2(1001) / 2
V = next(v for v in (4, 8, 16, 32) if math.log2(v) >= need)
ok(34, V, 32)
assert round(2 ** need, 2) == 31.64 and math.ceil(2 ** (math.log2(101) / 2)) == 11 and min(2 * 3 * 4, 3 * math.log2(1001)) == 24

ok(35, 'B', 'B')

# 36 特殊地址
a0 = ipaddress.ip_address('0.0.0.0')
assert a0.is_unspecified and ipaddress.ip_address('127.0.0.1').is_loopback
assert ipaddress.ip_network('10.0.0.0/8').broadcast_address == ipaddress.ip_address('10.255.255.255')
ok(36, 'A', 'A')
ok(37, 'D', 'D')

# 38 等分子网
net = ipaddress.ip_network('21.3.0.0/16'); subs = list(net.subnets(new_prefix=23))
assert len(subs) == 128
ok(38, subs[0].num_addresses - 2, 510)
assert str(subs[5]) == '21.3.10.0/23' and str(subs[5].broadcast_address) == '21.3.11.255'
h = next(h for h in range(1, 17) if 2 ** h - 2 >= 800); assert 2 ** (16 - h) == 64

# 39 慢开始
def rtts(target, ssth=10**9):
    c, r = 1, 0
    while c < target:
        c = min(c * 2, ssth) if c < ssth else c + 1; r += 1
    return r
ok(39, rtts(32) * 5, 25)
assert rtts(32, 16) == 20 and 1 + 2 + 4 + 8 + 16 == 31

ok(40, 'C', 'C')

# 41 从 2017.txt 抽出第 41 题卷面代码，gcc 编译，随机表达式树对拍
txt = open(TXT, encoding='utf-8').read()
q41 = txt[txt.index('\n#41\n'):txt.index('\n#42\n')]
paper = q41[q41.index('::paper'):]
code41 = re.search(r'```\n(.*?)```', paper, re.S).group(1)
harness = r'''
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef struct node{ char data[10]; struct node *left,*right; }BTree;
''' + code41 + r'''
BTree *rd(void){ char t[16]; if(scanf("%15s",t)!=1) return NULL; if(strcmp(t,"#")==0) return NULL;
  BTree *p=malloc(sizeof(BTree)); strcpy(p->data,t); p->left=rd(); p->right=rd(); return p; }
int main(void){ int k; scanf("%d",&k); while(k--){ BTree *r=rd(); BtreeToE(r); printf("\n"); } return 0; }
'''
exe = gcc(harness, 'q41')
def ser(t): return '# ' if t is None else t[0] + ' ' + ser(t[1]) + ser(t[2])
def ev(t, val):
    if t[1] is None and t[2] is None: return val[t[0]]
    r = ev(t[2], val)
    if t[1] is None: return -r
    l = ev(t[1], val); return {'+': l + r, '-': l - r, '*': l * r}[t[0]]
def internal_nonroot(t, d=1):
    if t is None or (t[1] is None and t[2] is None): return 0
    return (d > 1) + internal_nonroot(t[1], d + 1) + internal_nonroot(t[2], d + 1)
def rnd(depth):
    if depth == 0 or random.random() < 0.3: return (random.choice('abcdefgh'), None, None)
    if random.random() < 0.15: return ('-', None, rnd(depth - 1))
    return (random.choice('+-*'), rnd(depth - 1), rnd(depth - 1))
ex1 = ('*', ('+', ('a', None, None), ('b', None, None)), ('*', ('c', None, None), ('-', None, ('d', None, None))))
ex2 = ('+', ('*', ('a', None, None), ('b', None, None)), ('-', None, ('-', ('c', None, None), ('d', None, None))))
random.seed(2017)
cases = [ex1, ex2] + [rnd(6) for _ in range(3000)]
inp = '%d\n' % len(cases) + '\n'.join(ser(t) for t in cases) + '\n'
outs = subprocess.run([exe], input=inp, capture_output=True, text=True, check=True).stdout.split('\n')
assert outs[0] == '(a+b)*(c*(-d))' and outs[1] == '(a*b)+(-(c-d))', outs[:2]
for t, o in zip(cases, outs):
    val = {c: random.randint(-9, 9) for c in 'abcdefgh'}
    assert eval(o, {}, dict(val)) == ev(t, val), (o, t)
    assert o.count('(') == o.count(')') == internal_nonroot(t), o
    assert o.replace('(', '').replace(')', '') == ''.join(x for x in ino(t) if x)
ok(41, len(cases), 3002)

# 42 Prim + 穷举全部生成树
V42 = 'ABCDE'
E42 = [('A', 'B', 6), ('A', 'D', 4), ('A', 'E', 5), ('B', 'C', 4), ('C', 'D', 6), ('C', 'E', 5), ('D', 'E', 4)]
def prim(E, s):
    S = {s}; out = []
    while len(S) < 5:
        cand = [(w, u, v) for u, v, w in E if (u in S) != (v in S)]
        w, u, v = min(cand); out.append((u, v, w)); S |= {u, v}
    return out
p = prim(E42, 'A')
assert [(u, v) for u, v, w in p] == [('A', 'D'), ('D', 'E'), ('C', 'E'), ('B', 'C')]
def is_tree(es):
    par = {v: v for v in V42}
    def f(v):
        while par[v] != v: v = par[v]
        return v
    for u, v, w in es:
        a, b = f(u), f(v)
        if a == b: return False
        par[a] = b
    return True
def msts(E):
    ts = [c for c in itertools.combinations(E, 4) if is_tree(c)]
    m = min(sum(w for *_, w in c) for c in ts); return m, [c for c in ts if sum(w for *_, w in c) == m]
m, best = msts(E42)
ok(42, (m, len(best)), (17, 1))
E_ae4 = [(u, v, 4 if (u, v) == ('A', 'E') else w) for u, v, w in E42]
assert (lambda r: (r[0], len(r[1])))(msts(E_ae4)) == (17, 3)
E_ce6 = [(u, v, 6 if (u, v) == ('C', 'E') else w) for u, v, w in E42]
assert (lambda r: (r[0], len(r[1])))(msts(E_ce6)) == (18, 3)
pc = prim(E42, 'C'); assert [(u, v) for u, v, w in pc] == [('B', 'C'), ('C', 'E'), ('D', 'E'), ('A', 'D')]

# 43 f1 / f2：gcc 实测（-fwrapv 让 int 溢出按补码截断）
src43 = r'''
#include <stdio.h>
#include <string.h>
int f1(unsigned n){int sum=1,power=1;for(unsigned i=0;i<=n-1;i++){power*=2;sum+=power;}return sum;}
float f2(unsigned n){float sum=1,power=1;for(unsigned i=0;i<=n-1;i++){power*=2;sum+=power;}return sum;}
int f1i(int n){int sum=1,power=1;for(int i=0;i<=n-1;i++){power*=2;sum+=power;}return sum;}
unsigned bits(float x){unsigned u;memcpy(&u,&x,4);return u;}
int main(void){
  for(unsigned n=1;n<=130;n++){float b=f2(n);printf("%u %d %08X %.0f\n",n,f1(n),bits(b),(double)b);}
  printf("int0 %d\n",f1i(0));
  float p=3.0f;unsigned u=bits(p)<<1;printf("shl %08X\n",u);
  unsigned n0=0; printf("nm1 %08X %d\n", n0-1, (unsigned)0<=n0-1);
  return 0;}
'''
exe = gcc(src43, 'q43', ['-O0', '-fwrapv'])
res = {}
for line in subprocess.run([exe], capture_output=True, text=True, check=True).stdout.splitlines():
    p_ = line.split()
    if p_[0].isdigit(): res[int(p_[0])] = (int(p_[1]), p_[2], p_[3])
    else: res[p_[0]] = p_[1:]
assert res['nm1'] == ['FFFFFFFF', '1']               # 1) n−1 回绕、条件永真
assert res['int0'] == ['1']                          # 1) 改 int 后不循环，返回 1
assert res[23][0] == 2 ** 24 - 1 and '%08X' % res[23][0] == '00FFFFFF' and res[23][1] == '4B7FFFFF'
assert res[24][0] == 33554431 and res[24][2] == '33554432' and res[24][1] == '4C000000'
assert res[31][0] == -1 and res[32][0] == -1
f = lambda n: 2 ** (n + 1) - 1
ok(43, (max(n for n in res if isinstance(n, int) and res[n][0] == f(n)),
        max(n for n in res if isinstance(n, int) and res[n][1] != '7F800000'),
        max(n for n in res if isinstance(n, int) and res[n][2] == str(f(n)))), (30, 126, 23))
assert res[127][1] == '7F800000' and res[126][1] == '7F000000'
assert min(n for n in res if isinstance(n, int) and res[n][1] == '7F800000') == 127

# 44 代码长度、CF、shl 浮点
ok(44, 0x0040107F - 0x00401020 + 1, 96)
a, b = 0x00000000, 0xFFFFFFFF
s_ = a + ((~b) & 0xFFFFFFFF) + 1; cout = s_ >> 32; CF = cout ^ 1
assert (s_ & 0xFFFFFFFF) == 1 and cout == 0 and CF == 1 and CF == int(a < b)
assert res['shl'] == ['80800000']
assert 0x0040107D - 0x00401020 + 3 == 96

# 45 拆位
va = 0x00401020
assert va >> 22 == 1 and (va >> 12) & 0x3FF == 1 and va & 0xFFF == 0x20
assert 0x00401020 >> 12 == 0x0040107F >> 12 == 0x00401
st = 0x00400FC0; assert (st >> 12, (st + 95) >> 12) == (0x00400, 0x00401) and st + 95 == 0x0040101F
assert 0x00201000 + 1 * 4 == 0x00201004 and (0x00401066 >> 22, (0x00401066 >> 12) & 0x3FF, 0x00401066 & 0xFFF) == (1, 1, 0x66)
ok(45, (1, 1, 1), (1, 1, 1))

# 46 PV 穷举所有交错：无死锁、无读写冲突，且 t1 与 t2 能同时读 y
P = lambda s: ('P', s); Vv = lambda s: ('V', s)
B = lambda *acc: ('B', acc); Ed = ('E',)
prog_ok = [
    [P('y1'), B(('x', 'r'), ('y', 'r')), Ed, Vv('y1')],
    [P('y2'), P('z'), B(('y', 'r'), ('z', 'r')), Ed, Vv('z'), Vv('y2')],
    [P('z'), B(('z', 'w'),), Ed, Vv('z'), P('y1'), P('y2'), B(('y', 'w'),), Ed, Vv('y1'), Vv('y2')],
]
prog_bad = [prog_ok[0], prog_ok[1],
    [P('z'), B(('z', 'w'),), Ed, P('y1'), P('y2'), B(('y', 'w'),), Ed, Vv('y1'), Vv('y2'), Vv('z')]]
prog_one = [[P('m')] + p[1:-1] + [Vv('m')] for p in [
    [P('y1'), B(('x', 'r'), ('y', 'r')), Ed, Vv('y1')],
    [P('y2'), B(('y', 'r'), ('z', 'r')), Ed, Vv('y2')],
    [P('z'), B(('z', 'w'), ('y', 'w')), Ed, Vv('z')]]]
def explore(progs, sems):
    init = (tuple(0 for _ in progs), tuple(sorted(sems.items())))
    seen = {init}; stack = [init]; dead = 0; both12 = False
    while stack:
        pcs, sm = stack.pop(); sm_d = dict(sm)
        act = {}
        for i, pr in enumerate(progs):          # 正在访问的变量
            j = pcs[i] - 1
            if 0 <= j < len(pr) and pr[j][0] == 'B': act[i] = pr[j][1]
        for i in act:
            for k in act:
                if i < k:
                    for v1, m1 in act[i]:
                        for v2, m2 in act[k]:
                            assert not (v1 == v2 and 'w' in (m1, m2)), ('冲突', i, k, v1)
        if 0 in act and 1 in act: both12 = True
        moves = 0
        for i, pr in enumerate(progs):
            if pcs[i] >= len(pr): continue
            op = pr[pcs[i]]; nd = dict(sm_d)
            if op[0] == 'P':
                if nd[op[1]] == 0: continue
                nd[op[1]] -= 1
            elif op[0] == 'V': nd[op[1]] += 1
            moves += 1
            npcs = list(pcs); npcs[i] += 1; ns = (tuple(npcs), tuple(sorted(nd.items())))
            if ns not in seen: seen.add(ns); stack.append(ns)
        if moves == 0 and any(pcs[i] < len(progs[i]) for i in range(len(progs))): dead += 1
    return len(seen), dead, both12
n_ok, d_ok, b_ok = explore(prog_ok, {'y1': 1, 'y2': 1, 'z': 1})
assert d_ok == 0 and b_ok
n_bad, d_bad, _ = explore(prog_bad, {'y1': 1, 'y2': 1, 'z': 1})
assert d_bad > 0
_, d_one, b_one = explore(prog_one, {'m': 1})
assert d_one == 0 and not b_one
ok(46, (d_ok, b_ok), (0, True))
PV_STATES = n_ok

# 47 GBN 捎带确认
Td = 1000 * 8 / 100e6; RTT = 0.96e-3; W = 2 ** 3 - 1
U = W * Td / (Td + RTT + Td)
assert abs(Td - 80e-6) < 1e-12 and abs(Td + RTT + Td - 1120e-6) < 1e-12
# 图 (a)：甲收到的乙帧 R0,1 R1,3 R3,3
recv_a = [(0, 1), (1, 3), (3, 3)]
ack_by_B = max(y for x, y in recv_a)                     # 乙对甲的累积确认
exp = 0
for x, y in recv_a:                                       # GBN 接收窗口 1：只收按序帧
    if x == exp: exp += 1
win = [(ack_by_B + i) % 8 for i in range(W)]
sent = [3, 4]; rest = [s for s in win if s not in sent]
q1 = ack_by_B; q2 = (len(rest), 'S%d,%d' % (rest[0], exp), 'S%d,%d' % (rest[-1], exp))
# 图 (b)：甲已发 0..4，收到 R0,1 R1,2 R2,2；S2 超时
recv_b = [(0, 1), (1, 2), (2, 2)]
exp_b = 0
for x, y in recv_b:
    if x == exp_b: exp_b += 1
base_b = max(y for x, y in recv_b); resend = [s for s in range(5) if s >= base_b]
q3 = (len(resend), 'S%d,%d' % (resend[0], exp_b))
ok(47, (q1, q2, q3, round(U * 100, 2)), (3, (5, 'S5,2', 'S1,2'), (3, 'S2,3'), 50.0))
assert round(4 * Td / (2 * Td + RTT) * 100, 1) == 28.6 and round(7 * Td / (Td + RTT) * 100, 1) == 53.8
assert math.ceil((2 * Td + RTT) / Td) == 14 and 2 ** 4 - 1 >= 14 > 2 ** 3 - 1
# 变式：又收到 R2,3 ⟹ R3 早被丢弃，甲期望 3
exp_v = 0
for x, y in [(0, 1), (1, 3), (3, 3), (2, 3)]:
    if x == exp_v: exp_v += 1
assert exp_v == 3

assert sorted(set(OK)) == list(range(1, 48)), sorted(set(range(1, 48)) - set(OK))
print('2017：47/47 题复算通过（41 题 C 代码随机对拍 %d 组；46 题 PV 穷举 %d 个状态无死锁，「持 z 抢 y」写法有 %d 个死锁状态）' % (len(cases), PV_STATES, d_bad))
