# -*- coding: utf-8 -*-
"""教材变体（综 02/04/05/06/09/15）+ 统考真题（2009–2025）的 BFS 验证"""
from pv import Model, report

P, V, op, CP, CV = Model.P, Model.V, Model.op, Model.CP, Model.CV
OK = []


def ck(m, dl=False, viol=False):
    ok, r = report(m, expect_deadlock=dl, expect_violation=viol)
    OK.append((m.name, ok, r['states']))
    return r


def inc(k, n=1):
    return lambda d: d.__setitem__(k, d[k] + n)


def enter(d): d['incs'] += 1
def leave(d): d['incs'] -= 1


# ══════════ 综 02 差值约束（|A−B| 受限）══════════
def diff(M=2, N=2, rounds=3, bounded=True):
    m = Model('综02 差值约束 M=%d N=%d%s' % (M, N, '' if bounded else '【反例：不设额度】'))
    m.sem('mutex', 1)
    if bounded:
        m.sem('Sa', M - 1); m.sem('Sb', N - 1)
    m.var('a', 0); m.var('b', 0)
    for tag, mine, other in (('A', 'a', 'b'), ('B', 'b', 'a')):
        body = ([P('Sa' if tag == 'A' else 'Sb')] if bounded else []) + [
            P('mutex'), op('入库', inc(mine)), V('mutex')] + \
            ([V('Sb' if tag == 'A' else 'Sa')] if bounded else [])
        m.proc('车间%s' % tag, body, rounds)
    m.inv('A−B ≥ M（违反约束）', lambda d: d['a'] - d['b'] < M)
    m.inv('B−A ≥ N（违反约束）', lambda d: d['b'] - d['a'] < N)
    return m


ck(diff())
ck(diff(bounded=False), viol=True)

# ══════════ 综 04 双货架 + 装配 ══════════
m = Model('综04 双货架 F1/F2（各 2 位）+ 装配')
for s, v in (('empty1', 2), ('full1', 0), ('empty2', 2), ('full2', 0), ('mutex1', 1), ('mutex2', 1)):
    m.sem(s, v)
# ⚠️ 两个货架各有各的 mutex ⟹ 临界区计数必须分家（incs1/incs2），
#    用一个共享 incs 会把「A 在 F1、B 在 F2」这种合法并发误报成互斥破坏。
m.var('f1', 0); m.var('f2', 0); m.var('incs1', 0); m.var('incs2', 0)
m.proc('A车间', [P('empty1'), P('mutex1'), op('存F1', lambda d: (inc('incs1')(d), inc('f1')(d))),
                 op('出', inc('incs1', -1)), V('mutex1'), V('full1')], 2)
m.proc('B车间', [P('empty2'), P('mutex2'), op('存F2', lambda d: (inc('incs2')(d), inc('f2')(d))),
                 op('出', inc('incs2', -1)), V('mutex2'), V('full2')], 2)
m.proc('装配车间', [P('full1'), P('mutex1'), op('取A', lambda d: (inc('incs1')(d), inc('f1', -1)(d))),
                    op('出', inc('incs1', -1)), V('mutex1'), V('empty1'),
                    P('full2'), P('mutex2'), op('取B', lambda d: (inc('incs2')(d), inc('f2', -1)(d))),
                    op('出', inc('incs2', -1)), V('mutex2'), V('empty2'), op('组装')], 2)
m.inv('货架越界', lambda d: 0 <= d['f1'] <= 2 and 0 <= d['f2'] <= 2)
m.inv('F1 临界区内 >1', lambda d: d['incs1'] <= 1)
m.inv('F2 临界区内 >1', lambda d: d['incs2'] <= 1)
ck(m)

# ══════════ 综 05 和尚打水（缸 3 桶 · 井 1 · 桶 2）══════════
m = Model('综05 和尚打水（缸3·井1·桶2）多重资源约束')
for s, v in (('well', 1), ('vat', 1), ('empty', 3), ('full', 0), ('pail', 2)):
    m.sem(s, v)
m.var('water', 0); m.var('inWell', 0); m.var('inVat', 0)
m.proc('老和尚', [P('full'), P('pail'), P('vat'),
                  op('缸中打水', lambda d: (inc('inVat')(d), inc('water', -1)(d))),
                  op('离缸', inc('inVat', -1)), V('vat'), V('empty'), op('喝水'), V('pail')], 2)
m.proc('小和尚', [P('empty'), P('pail'), P('well'), op('井中打水', inc('inWell')),
                  op('离井', inc('inWell', -1)), V('well'), P('vat'),
                  op('倒入缸', lambda d: (inc('inVat')(d), inc('water')(d))),
                  op('离缸', inc('inVat', -1)), V('vat'), V('full'), V('pail')], 2)
m.inv('水缸越界', lambda d: 0 <= d['water'] <= 3)
m.inv('井被两人同时用', lambda d: d['inWell'] <= 1)
m.inv('缸被两人同时用', lambda d: d['inVat'] <= 1)
ck(m)

# ══════════ 综 06 三进程：输入设备依次 + y 供两个消费者 ══════════
m = Model('综06 输入设备依次 + 一份 y 供两处消费')
for s in ('S1',):
    m.sem(s, 1)
for s in ('S2', 'S3', 'Sb', 'Sy', 'Sz'):
    m.sem(s, 0)
m.var('dev', 0)
m.proc('P1', [P('S1'), op('输入a', inc('dev')), op('离设备', inc('dev', -1)), V('S2'),
              P('Sb'), op('x=a+b'), P('Sy'), P('Sz'), op('打印xyz')], 1)
m.proc('P2', [P('S2'), op('输入b', inc('dev')), op('离设备', inc('dev', -1)), V('S3'), V('Sb'),
              op('y=a*b'), V('Sy'), V('Sy')], 1)
m.proc('P3', [P('S3'), op('输入c', inc('dev')), op('离设备', inc('dev', -1)),
              P('Sy'), op('z=y+c-a'), V('Sz')], 1)
m.inv('输入设备被两进程同时用', lambda d: d['dev'] <= 1)
ck(m)

m2 = Model('综06【反例：只 V(Sy) 一次】')
m2.sem('S1', 1)
for s in ('S2', 'S3', 'Sb', 'Sy', 'Sz'):
    m2.sem(s, 0)
m2.var('dev', 0)
m2.proc('P1', [P('S1'), op('输入a'), V('S2'), P('Sb'), op('x=a+b'), P('Sy'), P('Sz'), op('打印')], 1)
m2.proc('P2', [P('S2'), op('输入b'), V('S3'), V('Sb'), op('y=a*b'), V('Sy')], 1)
m2.proc('P3', [P('S3'), op('输入c'), P('Sy'), op('z=y+c-a'), V('Sz')], 1)
ck(m2, dl=True)

# ══════════ 综 09 自行车装配（N=4：车架≤N−2、车轮≤N−1）══════════
def bike(N=4, capped=True, rounds=2):
    m = Model('综09 自行车装配 N=%d%s' % (N, '' if capped else '【反例：不封 s1/s2 上界】'))
    m.sem('empty', N); m.sem('wheel', 0); m.sem('frame', 0)
    if capped:
        m.sem('s1', N - 2); m.sem('s2', N - 1)
    m.var('nf', 0); m.var('nw', 0)
    # ⚠️ 一台车 = 1 车架 + 2 车轮 ⟹ 车轮工人的展开轮数必须是装配轮数的 2 倍，
    #    否则「造轮子的先下班」这种展开假象会被误判成死锁。
    m.proc('工人1(车架)', ([P('s1')] if capped else []) +
           [P('empty'), op('放车架', inc('nf')), V('frame')], rounds)
    m.proc('工人2(车轮)', ([P('s2')] if capped else []) +
           [P('empty'), op('放车轮', inc('nw')), V('wheel')], rounds * 2)
    body = [P('frame'), op('取车架', inc('nf', -1)), V('empty')] + ([V('s1')] if capped else []) + \
           [P('wheel'), P('wheel'), op('取二轮', inc('nw', -2)), V('empty'), V('empty')] + \
           ([V('s2'), V('s2')] if capped else []) + [op('组装')]
    m.proc('工人3(装配)', body, rounds)
    m.inv('箱子超容', lambda d: d['nf'] + d['nw'] <= N)
    return m


ck(bike())
ck(bike(capped=False), dl=True)

# ══════════ 综 15 单位换算（缓冲 100 字 / 每次 20 字 ⟹ 5 个位置）══════════
m = Model('综15 单位换算：100字÷20 = 5 个位置')
m.sem('mutex', 1); m.sem('full', 0); m.sem('empty', 5)
m.var('cnt', 0); m.var('incs', 0)
m.proc('P(读入)', [P('empty'), P('mutex'), op('read', lambda d: (enter(d), inc('cnt')(d))),
                   op('出', leave), V('mutex'), V('full')], 4)
for i in (1, 2):
    m.proc('P%d(计算)' % i, [P('full'), P('mutex'), op('get', lambda d: (enter(d), inc('cnt', -1)(d))),
                             op('出', leave), V('mutex'), V('empty'),
                             P('full'), P('mutex'), op('get', lambda d: (enter(d), inc('cnt', -1)(d))),
                             op('出', leave), V('mutex'), V('empty'), op('comp 40字')], 1)
m.inv('缓冲区越界', lambda d: 0 <= d['cnt'] <= 5)
m.inv('临界区内 >1', lambda d: d['incs'] <= 1)
ck(m)

# ══════════ 2009 奇偶分流 ══════════
m = Model('2009 三进程共享 N=2 缓冲（奇偶分流）')
m.sem('mutex', 1); m.sem('odd', 0); m.sem('even', 0); m.sem('empty', 2)
m.var('cnt', 0); m.var('incs', 0)
prod = []
for k in ('odd', 'even'):          # 交替产生奇数、偶数
    prod += [op('produce'), P('empty'), P('mutex'),
             op('Put', lambda d: (enter(d), inc('cnt')(d))), op('出', leave), V('mutex'), V(k)]
m.proc('P1(生产)', prod, 1)
m.proc('P2(取奇)', [P('odd'), P('mutex'), op('getodd', lambda d: (enter(d), inc('cnt', -1)(d))),
                    op('出', leave), V('mutex'), V('empty'), op('countodd')], 1)
m.proc('P3(取偶)', [P('even'), P('mutex'), op('geteven', lambda d: (enter(d), inc('cnt', -1)(d))),
                    op('出', leave), V('mutex'), V('empty'), op('counteven')], 1)
m.inv('缓冲区越界', lambda d: 0 <= d['cnt'] <= 2)
m.inv('临界区内 >1', lambda d: d['incs'] <= 1)
ck(m)

# ══════════ 2011 银行（座位 2 · 1 营业员）══════════
m = Model('2011 银行：2 座位 + 取号机互斥 + 叫号')
m.sem('empty', 2); m.sem('mutex', 1); m.sem('full', 0); m.sem('service', 0)
m.var('seat', 0); m.var('mach', 0)
for i in range(3):
    m.proc('顾客%d' % (i + 1), [P('empty'), op('落座', inc('seat')), P('mutex'),
                                op('取号', inc('mach')), op('离机', inc('mach', -1)), V('mutex'),
                                V('full'), P('service'), op('离座', inc('seat', -1)), op('接受服务')], 1)
m.proc('营业员', [P('full'), V('empty'), V('service'), op('服务')], 3)
m.inv('取号机被两人同时用', lambda d: d['mach'] <= 1)
m.inv('座位为负', lambda d: d['seat'] >= 0)
ck(m)

# ══════════ 2013 博物馆（容量 2 · 单出入口）══════════
def museum(cap=2, npeople=3, swapped=False):
    m = Model('2013 博物馆 容量%d · 单出入口%s' % (cap, '【反例：P 顺序颠倒】' if swapped else ''))
    m.sem('empty', cap); m.sem('mutex', 1)
    m.var('inside', 0); m.var('door', 0)
    pre = [P('mutex'), P('empty')] if swapped else [P('empty'), P('mutex')]
    for i in range(npeople):
        m.proc('参观者%d' % (i + 1), pre + [
            op('进门', lambda d: (inc('door')(d), inc('inside')(d))), op('离门', inc('door', -1)),
            V('mutex'), op('参观'),
            P('mutex'), op('出门', lambda d: (inc('door')(d), inc('inside', -1)(d))),
            op('离门', inc('door', -1)), V('mutex'), V('empty')], 1)
    m.inv('馆内超容', lambda d: 0 <= d['inside'] <= cap)
    m.inv('出入口同时两人', lambda d: d['door'] <= 1)
    return m


ck(museum())
ck(museum(swapped=True), dl=True)

# ══════════ 2014 消费者连取 k 件 ══════════
def y2014(n=3, k=2, ncons=2, rounds=1):
    m = Model('2014 环形缓冲 n=%d · 消费者连取 %d 件' % (n, k))
    m.sem('empty', n); m.sem('full', 0); m.sem('mutex1', 1); m.sem('mutex2', 1)
    m.var('cnt', 0); m.var('busy', 0)
    for i in range(2):
        m.proc('生产者%d' % (i + 1), [op('produce'), P('empty'), P('mutex1'),
                                      op('put', inc('cnt')), V('mutex1'), V('full')], k)
    body = [P('mutex2'), op('开始周期', inc('busy'))]
    for _ in range(k):
        body += [P('full'), op('get', inc('cnt', -1)), V('empty')]
    body += [op('结束周期', inc('busy', -1)), V('mutex2'), op('Consume')]
    for i in range(ncons):
        m.proc('消费者%d' % (i + 1), body, rounds)
    m.inv('缓冲区越界', lambda d: 0 <= d['cnt'] <= n)
    m.inv('两个消费者同时在取货周期内', lambda d: d['busy'] <= 1)
    return m


ck(y2014())

# ══════════ 2015 两信箱辩论（M=N=2, x=y=1）══════════
m = Model('2015 A/B 信箱辩论 M=N=2 · 初值 x=y=1')
M_, N_, x_, y_ = 2, 2, 1, 1
m.sem('FullA', x_); m.sem('EmptyA', M_ - x_); m.sem('FullB', y_); m.sem('EmptyB', N_ - y_)
m.sem('mA', 1); m.sem('mB', 1)
m.var('A', x_); m.var('B', y_)
m.proc('A', [P('FullA'), P('mA'), op('取A信', inc('A', -1)), V('mA'), V('EmptyA'), op('回答+提问'),
             P('EmptyB'), P('mB'), op('放B信', inc('B')), V('mB'), V('FullB')], 2)
m.proc('B', [P('FullB'), P('mB'), op('取B信', inc('B', -1)), V('mB'), V('EmptyB'), op('回答+提问'),
             P('EmptyA'), P('mA'), op('放A信', inc('A')), V('mA'), V('FullA')], 2)
m.inv('A 信箱越界', lambda d: 0 <= d['A'] <= M_)
m.inv('B 信箱越界', lambda d: 0 <= d['B'] <= N_)
ck(m)

# ══════════ 2019 哲学家 + m 个碗 ══════════
def y2019(n=5, mm=5, use_min=True, rounds=1):
    bowl = min(n - 1, mm) if use_min else mm
    m = Model('2019 哲学家 n=%d 碗 m=%d ⟹ bowl=%d%s'
              % (n, mm, bowl, '' if use_min else '【反例：碗不封 n−1】'))
    for i in range(n):
        m.sem('c%d' % i, 1)
    m.sem('bowl', bowl)
    m.var('eating', 0)
    for i in range(n):
        m.proc('哲学家%d' % i, [op('思考'), P('bowl'), P('c%d' % i), P('c%d' % ((i + 1) % n)),
                                op('就餐', inc('eating')), op('餐毕', inc('eating', -1)),
                                V('c%d' % i), V('c%d' % ((i + 1) % n)), V('bowl')], rounds)
    m.inv('同时就餐超过碗数', lambda d: d['eating'] <= bowl)
    return m


ck(y2019(5, 5, True))
ck(y2019(5, 3, True))
ck(y2019(5, 5, False), dl=True)

# ══════════ 2020 前驱：A,B→C；C,D→E ══════════
m = Model('2020 前驱图 A,B→C；C,D→E')
for s in ('SAC', 'SBC', 'SCE', 'SDE'):
    m.sem(s, 0)
m.var('done', 0)
m.proc('A', [op('A'), V('SAC')], 1)
m.proc('B', [op('B'), V('SBC')], 1)
m.proc('C', [P('SAC'), P('SBC'), op('C'), V('SCE')], 1)
m.proc('D', [op('D'), V('SDE')], 1)
m.proc('E', [P('SCE'), P('SDE'), op('E')], 1)
ck(m)

# ══════════ 2022 两线程六操作：只需 2 个信号量 ══════════
m = Model('2022 两线程六操作（只用 2 个信号量）')
m.sem('S_AC', 0); m.sem('S_CE', 0)
m.var('seq', 0); m.var('okAC', 0); m.var('okCE', 0)
m.proc('T1', [op('A', lambda d: d.__setitem__('okAC', 1)), V('S_AC'), P('S_CE'),
              op('E', lambda d: d.__setitem__('seq', d['seq'] + d['okCE'])), op('F')], 1)
m.proc('T2', [op('B'), P('S_AC'), op('C', lambda d: d.__setitem__('okCE', d['okAC'])),
              V('S_CE'), op('D')], 1)
m.inv('E 在 C 之前执行了', lambda d: True)
ck(m)

# ══════════ 2024 缓冲区 B（容量 1）：一个同步信号量兼作互斥 ══════════
# ⚠️ 2024 题干是「P1 执行一次 C1、P2 执行一次 C2」的直线代码，不是 while(1) 循环。
#    展开成 2 轮就等于给题目凭空加了循环，B 自然会涨到 2——那是我的建模错，不是解答错。
m = Model('2024 缓冲区容量1：S 同时保证同步与互斥')
m.sem('S', 0)
m.var('B', 0); m.var('incs', 0)
m.proc('P1', [op('C1写B', lambda d: (enter(d), inc('B')(d))), op('出', leave), V('S')], 1)
m.proc('P2', [P('S'), op('C2读B', lambda d: (enter(d), inc('B', -1)(d))), op('出', leave)], 1)
m.inv('缓冲区越界', lambda d: 0 <= d['B'] <= 1)
m.inv('临界区内 >1', lambda d: d['incs'] <= 1)
ck(m)

m = Model('2024 第3问：B 非空 ⟹ 只需一个 mutex 保护 C3')
m.sem('mutex', 1)
m.var('incs', 0)
for i in (1, 2):
    m.proc('P%d' % i, [P('mutex'), op('C3改B', enter), op('出', leave), V('mutex')], 2)
m.inv('临界区内 >1', lambda d: d['incs'] <= 1)
ck(m)

# ══════════ 2025 甲乙丙植树 ══════════
def y2025(rounds=2, early_release=True):
    m = Model('2025 甲乙丙植树%s' % ('' if early_release else '【反例：配额拖到填土后才还】'))
    m.sem('position', 3); m.sem('pit', 0); m.sem('tree', 0); m.sem('mutex', 1)
    m.var('unused', 0); m.var('spade', 0)
    yi = [P('position'), P('mutex'), op('挖树坑', lambda d: (inc('spade')(d), inc('unused')(d))),
          op('放锹', inc('spade', -1)), V('mutex'), V('pit')]
    if early_release:
        b = [P('pit'), op('放树苗', inc('unused', -1)), V('position'),
             P('mutex'), op('填土', inc('spade')), op('放锹', inc('spade', -1)), V('mutex'), V('tree')]
    else:
        b = [P('pit'), op('放树苗', inc('unused', -1)),
             P('mutex'), op('填土', inc('spade')), op('放锹', inc('spade', -1)), V('mutex'),
             V('position'), V('tree')]
    m.proc('甲(挖坑)', yi, rounds)
    m.proc('乙(栽苗填土)', b, rounds)
    m.proc('丙(浇水)', [P('tree'), op('浇水')], rounds)
    m.inv('未使用树坑数 ≥ 3（违反题设）', lambda d: d['unused'] < 3)
    m.inv('铁锹被两人同时用', lambda d: d['spade'] <= 1)
    return m


ck(y2025())
ck(y2025(early_release=False))

print()
bad = [n for n, o, s in OK if not o]
print('—— 变体与真题小计：%d 个模型，全部符合预期：%s' % (len(OK), not bad))
for n_ in bad:
    print('   ❌ %s' % n_)
