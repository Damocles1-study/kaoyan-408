# -*- coding: utf-8 -*-
"""
OS ch3「3.2 虚拟内存管理」习题独立复算（83 题里所有可计算的项）
用法：python3 mem_verify_ch3_2.py
依赖：同目录 mem_repl.py（OPT/FIFO/LRU/CLOCK 引擎）
约定：每一项都写成 chk(标题, 我算出的值, 书上的值)，最后打印失配清单。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mem_repl import opt, fifo, lru, clock

BAD = []
N = [0]

def chk(name, mine, book):
    N[0] += 1
    ok = (mine == book)
    if not ok:
        BAD.append((name, mine, book))
    print(f'{"✅" if ok else "❌"} {name}: 我算 {mine} | 书答 {book}')

# ---------------------------------------------------------------- 选择题
print('=' * 60); print('一、单项选择题'); print('=' * 60)

# 选 12：a[128][128] int，页框 512B，1 个数据页框，按列访问 a[j][i]
#   一页 = 512B/4B = 128 个 int = 恰好一行
n = 128
per_page = 512 // 4                      # 128 个元素 = 1 行
faults = 0
cur = None                               # 只有 1 个数据页框
for i in range(n):
    for j in range(n):                   # 访问 a[j][i]，行号 j 变化最快
        pg = j                           # 第 j 行 = 第 j 页
        if pg != cur:
            faults += 1; cur = pg
chk('选12 每元素缺页一次', faults, 16384)

# 选 13：X[64][64]，页框 128 字 = 2 行，3 个数据页框，按列访问 X[i][j]
rows_per_page = 128 // 64                # 一页存 2 行
frames, faults = [], 0
for j in range(64):
    for i in range(64):
        pg = i // rows_per_page
        if pg in frames:
            continue
        faults += 1
        if len(frames) < 3:
            frames.append(pg)
        else:
            frames.pop(0); frames.append(pg)   # 3 帧存不下 32 页，等效每两元素缺一次
chk('选13 每两元素缺页一次', faults, 2048)

# 选 14：TLB 命中率 75%，二级页表，忽略访问 TLB 的时间
chk('选14 平均访存次数', round(0.75 * 1 + 0.25 * 3, 4), 1.5)

# 选 17：FIFO 下页帧数增加，缺页可能减少（书上反例 1,2,3,1,2,3）
r = [1, 2, 3, 1, 2, 3]
chk('选17 反例 m=2 缺页', fifo(r, 2)[0], 6)
chk('选17 反例 m=3 缺页', fifo(r, 3)[0], 3)

# 选 19：32 位虚地址，页 512B ⟹ 偏移 9 位 ⟹ 页号 23 位
chk('选19 页表项数指数', 32 - 9, 23)

# 选 20：逻辑地址 16 位，页 1KB，0/1/2/3 → 3/7/11/10 号页框；LA = 0A6FH
LA = 0x0A6F
pg, off = LA >> 10, LA & 0x3FF
frame = [3, 7, 11, 10][pg]
chk('选20 页号', pg, 2)
chk('选20 物理地址', hex((frame << 10) | off).upper().replace('0X', '') + 'H', '2E6FH')

# 选 22：LRU，4 帧，20 个页号
r22 = [1, 8, 1, 7, 8, 2, 7, 2, 1, 8, 3, 8, 2, 1, 3, 1, 7, 1, 3, 7]
f22, e22, tr22 = lru(r22, 4)
chk('选22 序列长度（dpi340 复核）', len(r22), 20)
chk('选22 LRU 4 帧失效次数', f22, 6)
pos = [i + 1 for i, (p, fr, a) in enumerate(tr22) if a != '命中']
chk('选22 缺页发生在第几次访问', pos, [1, 2, 4, 6, 11, 17])

# 选 30：TLB 与内存串行，访存 1μs，查 TLB 0.2μs
for h, book in ((0.85, 1.35), (0.5, 1.7)):
    eat = h * (0.2 + 1) + (1 - h) * (0.2 + 1 + 1)
    chk(f'选30 命中率{int(h*100)}% 的 EAT', round(eat, 4), book)

# 选 38 / 综 07①：48 位虚地址，页 4KB，页表项 8B
off_bits = 12
per = (4 * 1024) // 8                    # 每页 512 个页表项
idx = per.bit_length() - 1               # 9 位
chk('选38 页内偏移位数', off_bits, 12)
chk('选38 页表级数', (48 - off_bits) // idx, 4)

# 选 39 / 综 04 相关：Belady 经典串
r39 = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
chk('选39 Belady 例 FIFO m=3', fifo(r39, 3)[0], 9)
chk('选39 Belady 例 FIFO m=4', fifo(r39, 4)[0], 10)
chk('选39 同串 LRU m=3', lru(r39, 3)[0], 10)      # 书未给，仅记录
chk('选39 同串 LRU m=4', lru(r39, 4)[0], 8)       # 书未给，仅记录

# 选 50【2015】：4 页框，已访问 2,0,2,9,3,4,2,8,2,4,8,4,5，下一页 7，LRU 淘汰谁
r50 = [2, 0, 2, 9, 3, 4, 2, 8, 2, 4, 8, 4, 5]
f, e, tr = lru(r50, 4)
resident = tr[-1][1]                     # 访问 5 之后的驻留集
seen, order = set(), []
for p in reversed(r50):                  # 从后往前数到 4 个不同的数
    if p not in seen:
        seen.add(p); order.append(p)
    if len(seen) == 4:
        break
chk('选50 从后往前第 4 个不同页号（= 淘汰页）', order[-1], 2)
chk('选50 驻留集含被淘汰页', 2 in resident, True)

# 选 52【2016】：窗口 6，t 时刻工作集
seq_before_t = [1, 3, 4, 5, 6, 0, 3, 2, 3, 2]
ws = sorted(set(seq_before_t[-6:]))
chk('选52 工作集', ws, sorted([6, 0, 3, 2]))

# 选 53【2019】：LRU 局部置换，4 页框
r53 = [0, 1, 2, 7, 0, 5, 3, 5, 0, 2, 7, 6]
f53, e53, _ = lru(r53, 4)
chk('选53 页置换次数（书答）', e53, 5)
chk('选53 总缺页次数（书上没给，本站补算）', f53, 9)

# 选 55【2021】：页 4KB，改进型 CLOCK，2 个固定页框
#   页 3(60H, A=1,M=0)、页 4(80H, A=1,M=1) 在内存，访问 02A01H（页 2 不在内存）
va = 0x02A01
chk('选55 页号', va >> 12, 0x02)
chk('选55 页内偏移', hex(va & 0xFFF).upper().replace('0X', '') + 'H', 'A01H')
cand = {'页3': (1, 0), '页4': (1, 1)}     # (A, M)
vic = min(cand, key=lambda k: (cand[k][0], cand[k][1]))
chk('选55 改进型 CLOCK 淘汰', vic, '页3')
chk('选55 物理地址', hex((0x60 << 12) | (va & 0xFFF)).upper().replace('0X', '') + 'H', '60A01H')

# 选 59【2025】：3 页框，0/1/2 已在内存，LRU
r59 = [0, 1, 2, 0, 5, 1, 4, 3, 0, 2, 3, 2, 0]
fr, rec, faults59, steps = [0, 1, 2], [0, 1, 2], 0, []
for p in r59:
    if p in fr:
        rec.remove(p); rec.append(p)
    else:
        faults59 += 1
        vicp = rec.pop(0); fr[fr.index(vicp)] = p; rec.append(p)
        steps.append((p, vicp))
chk('选59 缺页异常处理次数', faults59, 6)
chk('选59 逐次淘汰', steps, [(5, 1), (1, 2), (4, 0), (3, 5), (0, 1), (2, 4)])

# ---------------------------------------------------------------- 综合题
print(); print('=' * 60); print('二、综合应用题'); print('=' * 60)

# 综 01：八进制逻辑地址，页 32B，进程 320B（10 页）
tabA = {0: 'f1', 1: 'f2', 2: 'f3', 3: 'f4'}
tabB = {4: 'f5', 5: 'f6', 6: 'f7', 7: 'f8', 8: 'f9', 9: 'f10'}
res = []
for oct_s in ('101', '204', '576'):
    v = int(oct_s, 8)
    p, d = divmod(v, 32)
    if p in tabA:   res.append((oct_s, p, d, tabA[p] + ' (快表)'))
    elif p in tabB: res.append((oct_s, p, d, tabB[p] + ' (内存页表)'))
    else:           res.append((oct_s, p, d, '越界中断'))
for s, p, d, r in res:
    print(f'   {s}(8) = {int(s,8):3d} ⟹ 页号 {p:2d} 位移 {d:2d} ⟹ {r}')
chk('综01 三个地址的页号', [x[1] for x in res], [2, 4, 11])
chk('综01 三个地址的位移', [x[2] for x in res], [1, 4, 30])
chk('综01 第三个越界', res[2][3], '越界中断')

# 综 02：EAT（μs），磁盘 20ms
eat02 = 0.80 * 1 + 0.18 * 2 + 0.02 * (1 + 1 + 20000)
chk('综02 EAT(μs)', round(eat02, 4), 401.2)

# 综 03：页故障数上下限（m=3, p=12, n=4 的两个实例）
lo = [1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
hi = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]
chk('综03 下限实例 FIFO', fifo(lo, 3)[0], 4)
chk('综03 下限实例 LRU', lru(lo, 3)[0], 4)
chk('综03 上限实例 FIFO', fifo(hi, 3)[0], 12)
chk('综03 上限实例 LRU', lru(hi, 3)[0], 12)

# 综 04：Belady 演示串 4,3,2,1,4,3,5,4,3,2,1,5
r04 = [4, 3, 2, 1, 4, 3, 5, 4, 3, 2, 1, 5]
for algo, name, exp in ((opt, 'OPT', (7, 6)), (fifo, 'FIFO', (9, 10)), (lru, 'LRU', (10, 8))):
    got = tuple(algo(r04, m)[0] for m in (3, 4))
    chk(f'综04 {name} (m=3, m=4) 缺页', got, exp)
chk('综04 只有 FIFO 是「反的」', fifo(r04, 4)[0] > fifo(r04, 3)[0], True)

# 综 06：最大可接受缺页率，(1-p)*1 + 0.3p*(1+8) + 0.7p*(1+20) = 2
p06 = 1 / (0.3 * 8 + 0.7 * 20)
chk('综06 最大缺页率(%)', round(p06 * 100, 1), 6.1)

# 综 07：五问
chk('综07-1 级数/偏移', (4, 12), (4, 12))
t2 = 0.98 * (10 + 100) + 0.02 * (10 + 100 + 100)
chk('综07-2 一级页表平均(ns)', round(t2, 4), 112.0)
t3 = 0.98 * (10 + 100) + 0.02 * (10 + 100 + 100 + 100)
chk('综07-3 二级页表平均(ns)', round(t3, 4), 114.0)
# p*110 + (1-p)*310 <= 120
p07 = (310 - 120) / (310 - 110)
chk('综07-4 所需命中率(%)', round(p07 * 100, 4), 95.0)
chk('综07-5 段数指数', 48 - 32, 16)
import math
chk('综07-5 段内页表级数', math.ceil((32 - 12) / 9), 3)

# 综 08：LRU，1,3,2,1,1,3,5,1,3,2,1,5
r08 = [1, 3, 2, 1, 1, 3, 5, 1, 3, 2, 1, 5]
chk('综08 LRU m=3 缺页', lru(r08, 3)[0], 6)
chk('综08 LRU m=4 缺页', lru(r08, 4)[0], 4)
chk('综08 m=4 时缺页 = 不同页面数', lru(r08, 4)[0], len(set(r08)))

# 综 09：4 页帧状态表
st = {  # 虚页: (帧, 装入时间, 最近访问, A, M)
    2: (0, 60, 161, 0, 1),
    1: (1, 130, 160, 0, 0),
    0: (2, 26, 162, 1, 0),
    3: (3, 20, 163, 1, 1),
}
chk('综09-1 FIFO 淘汰', min(st, key=lambda k: st[k][1]), 3)
chk('综09-1 LRU 淘汰', min(st, key=lambda k: st[k][2]), 1)
c00 = [k for k in st if st[k][3] == 0 and st[k][4] == 0]
chk('综09-1 改进型 CLOCK 第一轮 (0,0)', c00, [1])
# 第 2 问：访问串 4,0,0,0,2,4,2,1,0,3,2，LRU，4 帧，初始驻留 {2,1,0,3}
fr09 = [2, 1, 0, 3]
rec09 = [1, 2, 0, 3]                     # 按最近访问时间升序：160,161,162,163
f09, ev09 = 0, []
for p in [4, 0, 0, 0, 2, 4, 2, 1, 0, 3, 2]:
    if p in fr09:
        rec09.remove(p); rec09.append(p)
    else:
        f09 += 1
        v = rec09.pop(0); fr09[fr09.index(v)] = p; rec09.append(p); ev09.append((p, v))
chk('综09-2 LRU 缺页次数', f09, 3)
chk('综09-2 逐次淘汰', ev09, [(4, 1), (1, 3), (3, 4)])

# 综 11：四种算法各替换哪页
t11 = {0: (126, 279, 0, 0), 1: (230, 260, 1, 0), 2: (120, 272, 1, 1), 3: (160, 280, 1, 1)}
chk('综11 FIFO', min(t11, key=lambda k: t11[k][0]), 2)
chk('综11 LRU', min(t11, key=lambda k: t11[k][1]), 1)
chk('综11 简单 CLOCK（从装入最早的 2 起扫 R=0）',
    next(k for k in sorted(t11, key=lambda k: t11[k][0]) if t11[k][2] == 0), 0)
chk('综11 改进型 CLOCK（R=0 且 M=0）',
    [k for k in t11 if t11[k][2] == 0 and t11[k][3] == 0], [0])

# 综 12：A[100][100] 行优先，2 个数据页框
def mat_faults(per_page_ints, col_major):
    rows_per_pg = per_page_ints // 100
    frames, f = [], 0
    for a in range(100):
        for b in range(100):
            i, j = (b, a) if col_major else (a, b)
            pg = (i * 100 + j) // per_page_ints
            if pg in frames:
                continue
            f += 1
            if len(frames) < 2: frames.append(pg)
            else: frames.pop(0); frames.append(pg)
    return f
chk('综12 程序1 每页200整数', mat_faults(200, False), 50)
chk('综12 程序2 每页200整数', mat_faults(200, True), 5000)
chk('综12 程序1 每页100整数', mat_faults(100, False), 100)
chk('综12 程序2 每页100整数', mat_faults(100, True), 10000)

# 综 13：64 位机器的多级页表
per13 = 4096 // 4                        # 1024 项 ⟹ 10 位
chk('综13-1 每级索引位数', per13.bit_length() - 1, 10)
chk('综13-1 可用虚地址空间指数', 3 * 10 + 12, 42)
Y = max(y for y in range(1, 64) if 4 * (y - 3) + y <= 64)
chk('综13-2 最大页面位数 Y', Y, 15)
chk('综13-2 最大页面大小(KB)', 2 ** Y // 1024, 32)

# 综 14：32 位虚地址 / 24 位物理 / 页 4KB / 页表项 4B / 二级
chk('综14-1 页框号位数', 24 - 12, 12)
chk('综14-1 一级、二级页号位数', ((4096 // 4).bit_length() - 1,) * 2, (10, 10))
t14b = 10 * 0.98 + 210 * 0.02
chk('综14-2 平均地址转换时间(ns)', round(t14b, 4), 14.0)
t14c = 10 * 0.98 + 210 * 0.02 * 0.90 + (220 + 10_000_000) * 0.02 * 0.10
chk('综14-3 平均地址转换时间(ns，约)', round(t14c), 20014)

# 综 15【2009】：页 4KB，TLB 10ns，内存 100ns，缺页 1e8 ns，驻留集 2，LRU
pt = {0: (0x101, 1), 1: (None, 0), 2: (0x254, 1)}
seq15 = [0x2362, 0x1565, 0x25A5]
tlb, times = [], []
for va in seq15:
    pgno = va >> 12
    if pgno in tlb:
        times.append(10 + 100)
    else:
        t = 10 + 100                     # 查 TLB 落空 + 查页表
        if pt[pgno][1] == 1:
            times.append(t + 100)        # 直接访存
        else:
            times.append(t + 10 ** 8 + 10 + 100)   # 缺页处理 + 再查 TLB + 访存
        tlb.append(pgno)
        if len(tlb) > 2: tlb.pop(0)
chk('综15-1 三次访问耗时(ns)', times, [210, 100000220, 110])
chk('综15-2 1565H 的物理地址', hex((0x101 << 12) | (0x1565 & 0xFFF)).upper().replace('0X', '') + 'H', '101565H')

# 综 16【2010】：64KB 空间，页 1KB ⟹ 页号 6 位、偏移 10 位
LA16 = 0x17CA
chk('综16-1 页号', LA16 >> 10, 5)
tbl16 = {0: (7, 130), 1: (4, 230), 2: (2, 200), 3: (9, 160)}
vfifo = min(tbl16, key=lambda k: tbl16[k][1])
chk('综16-2 FIFO 淘汰页', vfifo, 0)
chk('综16-2 FIFO 物理地址',
    hex((tbl16[vfifo][0] << 10) | (LA16 & 0x3FF)).upper().replace('0X', '') + 'H', '1FCAH')
# CLOCK：四个页框访问位全为 1，指针从 2 号页框起顺时针（2→4→7→9→回 2），一圈清零后淘汰起点
ring = [2, 4, 7, 9]                       # 页框号，顺时针
use16 = {f: 1 for f in ring}
ptr = 0
while use16[ring[ptr]] == 1:
    use16[ring[ptr]] = 0; ptr = (ptr + 1) % 4
chk('综16-2 CLOCK 淘汰页框', ring[ptr], 2)
chk('综16-2 CLOCK 物理地址',
    hex((2 << 10) | (LA16 & 0x3FF)).upper().replace('0X', '').zfill(4) + 'H', '0BCAH')

# 综 18【2015】：二级页表 10/10/12
chk('综18-1 页大小(B)', 2 ** 12, 4096)
chk('综18-1 虚地址空间页数指数', 32 - 12, 20)
chk('综18-2 页目录占页数', (2 ** 10 * 4) // 2 ** 12, 1)
chk('综18-2 页表占页数', (2 ** 20 * 4) // 2 ** 12, 1024)
chk('综18-2 合计页数', 1 + 1024, 1025)
chk('综18-3 两地址的页目录号', (0x01000000 >> 22, 0x01112048 >> 22), (4, 4))

# 综 19【2017】：跨科题，虚地址来自 2017 年组原真题给出的 f1 机器级代码
#   f1 首条 push ebp @ 0040 1020H，末条 ret @ 0040 107FH
VA_PUSH, VA_RET = 0x00401020, 0x0040107F
chk('综19-1 f1 代码长度(B)', VA_RET - VA_PUSH + 1, 0x60)
chk('综19-1 首末指令虚页号相同', (VA_PUSH >> 12) == (VA_RET >> 12), True)
chk('综19-1 f1 占几页', len({VA_PUSH >> 12, VA_RET >> 12}), 1)
chk('综19-2 页目录号', VA_PUSH >> 22, 1)
chk('综19-2 页表索引', (VA_PUSH >> 12) & 0x3FF, 1)
# 反证：若 f1 起始于 0x00400FE0，同样 96B 却会跨页
chk('综19 反证：起于 00400FE0H 则跨 2 页',
    len({0x00400FE0 >> 12, (0x00400FE0 + 0x60 - 1) >> 12}), 2)

# 综 20【2018】：页目录号 6 / 页号 6 / 偏移 8
va20 = (6 << 22) | (6 << 12) | 8
chk('综20-1 虚地址', hex(va20).upper().replace('0X', '').zfill(8) + 'H', '01806008H')

# 综 21【2020】：a[1024][1024]，元素 4B，起始 1080 0000H
base = 0x10800000
addr = base + (1 * 1024 + 2) * 4
chk('综21-1 a[1][2] 虚地址', hex(addr).upper().replace('0X', '') + 'H', '10801008H')
chk('综21-1 页目录号', hex(addr >> 22).upper().replace('0X', '') + 'H', '42H')
chk('综21-1 页号', hex((addr >> 12) & 0x3FF).upper().replace('0X', '') + 'H', '1H')
pde = 0x00201000 + (addr >> 22) * 4
chk('综21-1 页目录项物理地址', hex(pde).upper().replace('0X', '').zfill(8) + 'H', '00201108H')
pte = (0x00301 << 12) + ((addr >> 12) & 0x3FF) * 4
chk('综21-1 页表项物理地址', hex(pte).upper().replace('0X', '').zfill(8) + 'H', '00301004H')
chk('综21-1 每页存元素数 = 一行', 4096 // 4, 1024)

# 综 22【2024】：页 4MB ⟹ 页号 10 位、偏移 22 位
VA, PA = 0x12345678, 0xBAB45678
PT_V, PT_P = 0xB8C00000, 0x65400000
chk('综22-1 页号', hex(VA >> 22).upper().replace('0X', '') + 'H', '48H')
chk('综22-1 页表项虚地址', hex(PT_V + ((VA >> 22) << 2)).upper().replace('0X', '') + 'H', 'B8C00120H')
chk('综22-1 页表项物理地址', hex(PT_P + ((VA >> 22) << 2)).upper().replace('0X', '') + 'H', '65400120H')
chk('综22-1 更新后页框号', hex(PA >> 22).upper().replace('0X', '') + 'H', '2EAH')
chk('综22-2 页表所在页的页号', hex(PT_V >> 22).upper().replace('0X', '') + 'H', '2E3H')
chk('综22-2 该页的页表项虚地址', hex(PT_V + ((PT_V >> 22) << 2)).upper().replace('0X', '') + 'H', 'B8C00B8CH')
chk('综22-2 该页表项中的页框号', hex(PT_P >> 22).upper().replace('0X', '') + 'H', '195H')

# ---------------------------------------------------------------- 总账
print(); print('=' * 60)
print(f'复算项数：{N[0]}    失配：{len(BAD)}')
for name, mine, book in BAD:
    print(f'  ❌ {name}: 我 {mine} vs 书 {book}')
print('=' * 60)
