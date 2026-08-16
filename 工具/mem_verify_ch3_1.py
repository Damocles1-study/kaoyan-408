#!/usr/bin/env python3
# OS ch3 3.1 内存管理概念 —— 全部可算题独立复算
# 与书答对拍；不看书上给的中间结果，一律从题干条件重算

import math

out = []
def P(tag, got, book):
    ok = (str(got) == str(book))
    out.append(f"{'✅' if ok else '❌'} {tag}: 复算={got}  书答={book}")

# ---------------- 动态分区分配模拟器（首次/最佳/最坏/邻近 + 回收合并） ----------------
class DynPart:
    """free = [(start, size), ...] 恒按地址递增排序"""
    def __init__(self, free):
        self.free = sorted(free)

    def _pick(self, n, algo):
        cand = [(s, sz) for s, sz in self.free if sz >= n]
        if not cand:
            return None
        if algo == 'first':
            return min(cand, key=lambda x: x[0])
        if algo == 'best':
            return min(cand, key=lambda x: (x[1], x[0]))
        if algo == 'worst':
            return max(cand, key=lambda x: (x[1], -x[0]))
        raise ValueError(algo)

    def alloc(self, n, algo='first'):
        blk = self._pick(n, algo)
        if blk is None:
            return None            # 分配失败
        s, sz = blk
        self.free.remove(blk)
        if sz > n:                 # 截取低地址部分
            self.free.append((s + n, sz - n))
        self.free.sort()
        return s

    def free_blk(self, s, n):
        self.free.append((s, n))
        self.free.sort()
        merged, cur = [], None
        for st, sz in self.free:
            if cur and cur[0] + cur[1] == st:
                cur = (cur[0], cur[1] + sz)
            else:
                if cur: merged.append(cur)
                cur = (st, sz)
        if cur: merged.append(cur)
        self.free = merged

    def __repr__(self):
        return ' · '.join(f"{sz}@{s}" for s, sz in self.free)

# --- 选 07：最佳适应，申请 40KB ---
free07 = [(100, 80), (190, 90), (330, 60), (410, 102)]   # dpi400 复核后的四块空闲区（KB）
best07 = min([b for b in free07 if b[1] >= 40], key=lambda x: x[1])
P("选07 最佳适应首址", f"{best07[0]}K(块大小{best07[1]}KB)", "330K(块大小60KB)")
# 对照：若漏看 280K 分界线（190–330 合成 140KB）会得到什么
free07_wrong = [(100, 80), (190, 140), (330, 0), (410, 102)]
bw = min([b for b in free07_wrong if b[1] >= 40], key=lambda x: x[1])
out.append(f"   ↳ 若漏看 280K 分界线 ⟹ 会得到 {bw[0]}K（即选项 B），一条线换一个答案")

# --- 选 61【2010】55MB 最佳适应 ---
d = DynPart([(0, 55)])
a15 = d.alloc(15, 'best'); a30 = d.alloc(30, 'best')
d.free_blk(a15, 15)
a8 = d.alloc(8, 'best'); a6 = d.alloc(6, 'best')
P("选61【2010】最大空闲分区", f"{max(sz for _, sz in d.free)}MB", "9MB")
out.append(f"   ↳ 末态空闲区：{d}")

# --- 选 66【2017】回收 60K/140KB 后 ---
d = DynPart([(20, 40), (500, 80), (1000, 100), (200, 200)])
d.free_blk(60, 140)
cnt = len(d.free)
bysize = sorted(d.free, key=lambda x: x[1])
P("选66【2017】空闲分区数", cnt, 4-1)
P("选66【2017】按大小重排后第一个", f"{bysize[0][0]}K/{bysize[0][1]}KB", "500K/80KB")
out.append(f"   ↳ 合并结果：{d}（20K 起 380KB = 40+140+200）")
out.append(f"   ↳ 干扰项 A 的来源：只合并不重排 ⟹ 会答「3, 20K, 380KB」")

# --- 综 01：首次适应 vs 最佳适应，作业 96/20/200 KB ---
base = [(100, 32), (150, 10), (200, 5), (220, 218), (530, 96)]
for algo, name in [('first', '首次适应'), ('best', '最佳适应')]:
    d = DynPart(list(base)); res = []
    for job in (96, 20, 200):
        r = d.alloc(job, algo)
        res.append(f"{job}KB→{'失败' if r is None else str(r)+'K'}")
    ok = '全部满足' if all('失败' not in x for x in res) else '有作业无法装入'
    out.append(f"{'✅' if (name=='最佳适应')==(ok=='全部满足') else '❌'} 综01 {name}: {' , '.join(res)} ⟹ {ok}；末态空闲 {d}")

# --- 综 02：512KB，截取低地址部分 ---
seq = [('reg', 300), ('reg', 100), ('rel', 300), ('reg', 150), ('reg', 50), ('reg', 90)]
for algo, name, book in [('first', '最先适配', '10@290 · 112@400'), ('best', '最佳适配', '60@240 · 62@450')]:
    d = DynPart([(0, 512)]); occupied = {}
    for op, n in seq:
        if op == 'reg':
            s = d.alloc(n, algo); occupied.setdefault(n, []).append(s)
        else:
            s = occupied[n].pop(0); d.free_blk(s, n)
    got = ' · '.join(f"{sz}@{s}" for s, sz in d.free)
    P(f"综02 {name} 末态空块", got, book)
    more = d.alloc(80, algo)
    out.append(f"   ↳ 再申请 80KB：{'成功（首址 '+str(more)+'K）' if more is not None else '失败'}")

# ---------------- 地址变换计算器 ----------------
def paging(addr, pagesize, table):
    p, w = divmod(addr, pagesize)
    if p not in table: return ('缺页/越界', p, w)
    return (table[p] * pagesize + w, p, w)

# 选 16
P("选16 物理地址", paging(4097, 4096, {0: 2, 1: 1, 3: 0, 4: 5})[0], 4097)
out.append("   ↳ 页号1→页框1，页号与页框号同号 ⟹ 物理地址恰好等于逻辑地址，是本题的迷惑点")

# 选 54（四空）
bits = 18; off_bits = 11; pno_bits = 17 - 11 + 1
P("选54 主存最大容量", f"{2**bits//1024}KB", "256KB")
P("选54 主存可分页数", 2**pno_bits, 128)
blocks = {0: 2, 1: 3, 2: 7}
P("选54 指令物理地址", paging(1500, 2**off_bits, blocks)[0], 5596)
P("选54 数据所在页框号", blocks[2500 // 2**off_bits], 3)

# 选 55
P("选55 2号页始址", 2 * (1024 * 1024 // 256) if False else {0:2,1:4,2:1,3:5}[2] * (1024*1024//256), 4096)

# 选 57 / 62：多级页表层数与页目录表项数
def levels(space_bytes, pte, pagesize):
    off = int(math.log2(pagesize))
    idx = int(math.log2(space_bytes)) - off
    per = int(math.log2(pagesize // pte))
    return math.ceil(idx / per), idx, per
lv, idx, per = levels(256 * 1024**4, 8, 4096)
P("选57 页表级数", lv, 4)
out.append(f"   ↳ 48 位地址 − 12 位页内偏移 = {idx} 位索引；每页容 4KB/8B = 512 = 2^{per} 项 ⟹ {idx}/{per} = {lv} 级")
pagesize, pte, total_pages = 2**10, 2, 2**16
per62 = int(math.log2(pagesize // pte))
P("选62 页目录表项数至少", 2 ** (int(math.log2(total_pages)) - per62), 128)

# 选 68【2019】拆位
LA = 0x20501225
P("选68 页目录号", f"{(LA >> 22) & 0x3FF:03X}H", "081H")
P("选68 页号", f"{(LA >> 12) & 0x3FF:03X}H", "101H")

# 选 60【2009】段长
P("选60 最大段长", f"2^{32-8}B", "2^24B")

# 综 03
P("综03 页式物理地址", 12 * 2048 + 586, 25162)
P("综03 段式物理地址", 4000 + 586, 4586)

# 综 04
segtab = {0: (210, 500), 1: (2350, 20), 2: (100, 90), 3: (1350, 590), 4: (1938, 95)}
book04 = ['640', '2360', '越界', '1750', '越界', '缺段']
got04 = []
for s, w in [(0, 430), (1, 10), (2, 500), (3, 400), (4, 112), (5, 32)]:
    if s not in segtab: got04.append('缺段')
    else:
        b, L = segtab[s]
        got04.append(str(b + w) if w < L else '越界')
P("综04 六个逻辑地址", ','.join(got04), ','.join(book04))

# 综 05
for hexa, book in [('0AC5', '12C5H'), ('1AC5', '缺页'), ('3AC5', '越界')]:
    a = int(hexa, 16)
    p, w = a >> 10, a & 0x3FF
    pt = {0: 8, 1: 7, 2: 4, 3: 10}
    if p >= 10: got = '越界'
    elif p not in pt: got = '缺页'
    else: got = f"{(pt[p] << 10) | w:04X}H"
    P(f"综05 {hexa}H(页{p},偏移{w})", got, book)

# 综 06
pt06 = {0: 9, 1: 0, 2: 1, 3: 14}
P("综06 进程总长", f"{4*4}KB", "16KB")
P("综06 各页始址", ' '.join(f"{v*4096:04X}H" for v in pt06.values()), "9000H 0000H 1000H E000H")
got = ' '.join(f"{pt06[p]*4096+w:04X}H" for p, w in [(0,0),(1,72),(2,1023),(3,99)])
P("综06 四个内存地址", got, "9000H 0048H 13FFH E063H")

# 综 07（八进制）
tlb = {0,1,2,3,4}; maxpage = math.ceil(702/64) - 1
P("综07 进程页数", maxpage + 1, 11)
for oct_s, book in [('0105','F1,5,快表命中'), ('0217','F2,15,快表命中'), ('0567','F5,55,查内存页表'),
                    ('01120','F9,16,查内存页表'), ('02500','越界中断')]:
    a = int(oct_s, 8); p, w = divmod(a, 64)
    if p > maxpage: got = '越界中断'
    else: got = f"F{p},{w},{'快表命中' if p in tlb else '查内存页表'}"
    P(f"综07 {oct_s}(八进制={a})", got, book)

# 综 08 / 09：EAT 两种口径
P("综08-1 无快表存取时间", f"{1.5*2}μs", "3.0μs")
P("综08-2 命中不计检索时间", f"{0.85*1.5 + 0.15*2*1.5:.3f}μs", "1.725μs")
P("综09-2 命中率85%(检索计0.2)", f"{(0.2+1)*0.85 + (0.2+1+1)*0.15:.2f}μs", "1.35μs")
P("综09-3 命中率50%(检索计0.2)", f"{(0.2+1)*0.5 + (0.2+1+1)*0.5:.2f}μs", "1.70μs")

# 综 10：位示图
bitmap = [
    "1111111111111111",
    "1111101111100011",
    "1100000000001111",
    "1111100001000101",
    "0101101101101101",
    "1000000000000000",
    "0111111000000000",
]
freeblk = [r*16 + c for r, row in enumerate(bitmap) for c, ch in enumerate(row) if ch == '0']
P("综10-1 低地址起前6个空闲块", freeblk[:6], [21, 27, 28, 29, 34, 35])
P("综10-2 内碎片", f"{1 - 5.2 % 1:.1f}KB", "0.8KB")
P("综10-3 位示图占用", f"{(64*1024**2//4096)//8//1024}KB", "2KB")

# 综 11【2013】
P("综11-1 页大小", f"{2**12//1024}KB", "4KB")
P("综11-1 一级页表最大", f"{2**20*4//1024**2}MB", "4MB")
LA_code = 0x00008000
idx1 = LA_code >> 12
P("综11-3 代码页面1的页号", idx1, 8)
P("综11-3 页表项1物理地址", f"{0x00200000 + idx1*4:08X}H", "00200020H")
P("综11-3 页表项2物理地址", f"{0x00200000 + (idx1+1)*4:08X}H", "00200024H")
P("综11-3 页框号1/2", f"{0x00900000>>12:05X}H / {0x00901000>>12:05X}H", "00900H / 00901H")
P("综11-3 代码页面2起始物理地址", f"{0x00900000 + 4096:08X}H", "00901000H")

print('\n'.join(out))
bad = [l for l in out if l.startswith('❌')]
print(f"\n===== 共 {len([l for l in out if l[0] in '✅❌'])} 项，失配 {len(bad)} 项 =====")
for b in bad: print(b)
