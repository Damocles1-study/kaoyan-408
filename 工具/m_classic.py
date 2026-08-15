# -*- coding: utf-8 -*-
"""经典同步模型的 BFS 验证（教材 2.3.5 + 综 02–16）"""
from pv import Model, report

P, V, op, CP, CV = Model.P, Model.V, Model.op, Model.CP, Model.CV
OK = []


def ck(m, dl=False, viol=False):
    ok, r = report(m, expect_deadlock=dl, expect_violation=viol)
    OK.append((m.name, ok, r['states']))
    return r


def enter(d): d['incs'] += 1
def leave(d): d['incs'] -= 1


# ══════════ 1. 生产者-消费者（n 缓冲）══════════
def prodcons(n=2, rounds=2, swapped=False, name=None):
    m = Model(name or '生产者-消费者 n=%d（正解）' % n)
    m.sem('mutex', 1); m.sem('empty', n); m.sem('full', 0)
    m.var('count', 0); m.var('incs', 0)
    pre_p = [P('mutex'), P('empty')] if swapped else [P('empty'), P('mutex')]
    pre_c = [P('mutex'), P('full')] if swapped else [P('full'), P('mutex')]
    m.proc('生产者', pre_p + [op('放入', lambda d: (enter(d), d.__setitem__('count', d['count'] + 1))),
                              op('出临界区', leave), V('mutex'), V('full')], rounds)
    m.proc('消费者', pre_c + [op('取出', lambda d: (enter(d), d.__setitem__('count', d['count'] - 1))),
                              op('出临界区', leave), V('mutex'), V('empty')], rounds)
    m.inv('缓冲区越界', lambda d: 0 <= d['count'] <= n)
    m.inv('临界区内 >1 个进程', lambda d: d['incs'] <= 1)
    return m


ck(prodcons())
ck(prodcons(swapped=True, name='生产者-消费者【反例：P 顺序颠倒】'), dl=True)

# ══════════ 2. 苹果橘子（盘子容量 1）══════════
m = Model('苹果橘子（容量 1 的双产品缓冲）')
m.sem('plate', 1); m.sem('apple', 0); m.sem('orange', 0)
m.var('plateN', 0)
m.proc('爸爸', [P('plate'), op('放苹果', lambda d: d.__setitem__('plateN', d['plateN'] + 1)), V('apple')], 2)
m.proc('妈妈', [P('plate'), op('放橘子', lambda d: d.__setitem__('plateN', d['plateN'] + 1)), V('orange')], 2)
m.proc('女儿', [P('apple'), op('取苹果', lambda d: d.__setitem__('plateN', d['plateN'] - 1)), V('plate')], 2)
m.proc('儿子', [P('orange'), op('取橘子', lambda d: d.__setitem__('plateN', d['plateN'] - 1)), V('plate')], 2)
m.inv('盘中水果数超过 1', lambda d: 0 <= d['plateN'] <= 1)
ck(m)

# ══════════ 3. 读者-写者 ══════════
def rw(pri='read', nr_=2, nw_=1, rounds=1):
    m = Model('读者-写者（%s优先）%d读%d写' % ('读' if pri == 'read' else '写', nr_, nw_))
    m.sem('mutex', 1); m.sem('rw', 1)
    if pri == 'write':
        m.sem('w', 1)
    m.var('count', 0)     # 算法的计数器
    m.var('reading', 0)   # 真正在读文件的人数
    m.var('writing', 0)
    head = [P('w')] if pri == 'write' else []
    tail_w = [V('w')] if pri == 'write' else []
    rd = head + [
        P('mutex'),
        CP('rw', lambda d: d['count'] == 0),
        op('count++', lambda d: d.__setitem__('count', d['count'] + 1)),
        V('mutex'),
    ] + tail_w + [
        op('开始读', lambda d: d.__setitem__('reading', d['reading'] + 1)),
        op('读完', lambda d: d.__setitem__('reading', d['reading'] - 1)),
        P('mutex'),
        op('count--', lambda d: d.__setitem__('count', d['count'] - 1)),
        CV('rw', lambda d: d['count'] == 0),
        V('mutex'),
    ]
    wr = ([P('w')] if pri == 'write' else []) + [
        P('rw'),
        op('开始写', lambda d: d.__setitem__('writing', d['writing'] + 1)),
        op('写完', lambda d: d.__setitem__('writing', d['writing'] - 1)),
        V('rw'),
    ] + ([V('w')] if pri == 'write' else [])
    for i in range(nr_):
        m.proc('读者%d' % (i + 1), rd, rounds)
    for i in range(nw_):
        m.proc('写者%d' % (i + 1), wr, rounds)
    m.inv('两个写者同时写', lambda d: d['writing'] <= 1)
    m.inv('读写同时进行', lambda d: not (d['writing'] > 0 and d['reading'] > 0))
    return m


ck(rw('read'))
ck(rw('read', nr_=2, nw_=2))
ck(rw('write'))
ck(rw('write', nr_=2, nw_=2))

# ══════════ 4. 哲学家进餐 ══════════
def phil(n=5, mode='naive', rounds=1):
    lbl = {'naive': '朴素写法（先左后右）', 'limit': '限 n−1 人同时取', 'oddeven': '奇偶异序',
           'atomic': '取筷子整体加锁'}[mode]
    m = Model('哲学家 n=%d · %s' % (n, lbl))
    for i in range(n):
        m.sem('c%d' % i, 1)
    if mode == 'limit':
        m.sem('room', n - 1)
    if mode == 'atomic':
        m.sem('mtx', 1)
    m.var('eating', 0)
    for i in range(n):
        L, R = 'c%d' % i, 'c%d' % ((i + 1) % n)
        if mode == 'oddeven' and i % 2 == 1:
            L, R = R, L
        body = []
        if mode == 'limit':
            body.append(P('room'))
        if mode == 'atomic':
            body.append(P('mtx'))
        body += [P(L), P(R)]
        if mode == 'atomic':
            body.append(V('mtx'))
        body += [op('进餐', lambda d: d.__setitem__('eating', d['eating'] + 1)),
                 op('餐毕', lambda d: d.__setitem__('eating', d['eating'] - 1)),
                 V(L), V(R)]
        if mode == 'limit':
            body.append(V('room'))
        m.proc('哲学家%d' % i, body, rounds)
    m.inv('同时进餐人数超过 n/2', lambda d: d['eating'] <= n // 2)
    return m


ck(phil(5, 'naive'), dl=True)
ck(phil(5, 'limit'))
ck(phil(5, 'oddeven'))
ck(phil(5, 'atomic'))

# ══════════ 5. 理发师（椅子够坐，只验主干）══════════
m = Model('睡眠理发师（n=2 顾客 · 2 把椅子）')
m.sem('customers', 0); m.sem('barbers', 0); m.sem('mutex', 1)
m.var('waiting', 0); m.var('cutting', 0)
m.proc('理发师', [P('customers'), P('mutex'),
                  op('waiting--', lambda d: d.__setitem__('waiting', d['waiting'] - 1)),
                  V('barbers'), V('mutex'),
                  op('开始理发', lambda d: d.__setitem__('cutting', d['cutting'] + 1)),
                  op('理完', lambda d: d.__setitem__('cutting', d['cutting'] - 1))], 2)
for i in range(2):
    m.proc('顾客%d' % (i + 1), [P('mutex'),
                                op('waiting++', lambda d: d.__setitem__('waiting', d['waiting'] + 1)),
                                V('customers'), V('mutex'), P('barbers'), op('被理发')], 1)
m.inv('等待人数为负', lambda d: d['waiting'] >= 0)
m.inv('同时理两个人', lambda d: d['cutting'] <= 1)
ck(m)

# ══════════ 6. 吸烟者 ══════════
m = Model('吸烟者（供应者轮流放 3 种组合）')
m.sem('offer1', 0); m.sem('offer2', 0); m.sem('offer3', 0); m.sem('finish', 0)
m.var('onTable', 0)
agent = []
for k in ('offer1', 'offer2', 'offer3'):
    agent += [op('放材料', lambda d: d.__setitem__('onTable', d['onTable'] + 1)),
              V(k), P('finish')]
m.proc('供应者', agent, 1)
m.proc('有烟草者', [P('offer3'), op('取纸+胶水', lambda d: d.__setitem__('onTable', d['onTable'] - 1)), V('finish')], 1)
m.proc('有纸者', [P('offer2'), op('取烟草+胶水', lambda d: d.__setitem__('onTable', d['onTable'] - 1)), V('finish')], 1)
m.proc('有胶水者', [P('offer1'), op('取烟草+纸', lambda d: d.__setitem__('onTable', d['onTable'] - 1)), V('finish')], 1)
m.inv('桌上同时有两份材料', lambda d: 0 <= d['onTable'] <= 1)
ck(m)

# ══════════ 7. 司机-售票员 ══════════
m = Model('司机-售票员（双向同步）')
m.sem('S1', 0); m.sem('S2', 0)
m.var('running', 0); m.var('door', 0)   # door=1 开门
m.proc('司机', [P('S1'), op('启动', lambda d: d.__setitem__('running', 1)),
                op('行驶'), op('停车', lambda d: d.__setitem__('running', 0)), V('S2')], 3)
m.proc('售票员', [op('关车门', lambda d: d.__setitem__('door', 0)), V('S1'), op('售票'),
                  P('S2'), op('开车门', lambda d: d.__setitem__('door', 1)), op('上下乘客')], 3)
m.inv('开着门行驶', lambda d: not (d['running'] == 1 and d['door'] == 1))
ck(m)

# ══════════ 8. 过桥（同向多车 = 读者-写者）══════════
m = Model('过桥（不许交会 · 同向可多车）')
m.sem('bridge', 1); m.sem('mSN', 1); m.sem('mNS', 1)
m.var('cSN', 0); m.var('cNS', 0); m.var('onSN', 0); m.var('onNS', 0)
for tag, cnt, mtx, on in (('南→北', 'cSN', 'mSN', 'onSN'), ('北→南', 'cNS', 'mNS', 'onNS')):
    for i in range(2):
        m.proc('%s车%d' % (tag, i + 1), [
            P(mtx), CP('bridge', (lambda c: lambda d: d[c] == 0)(cnt)),
            op('计数++', (lambda c: lambda d: d.__setitem__(c, d[c] + 1))(cnt)), V(mtx),
            op('上桥', (lambda o: lambda d: d.__setitem__(o, d[o] + 1))(on)),
            op('下桥', (lambda o: lambda d: d.__setitem__(o, d[o] - 1))(on)),
            P(mtx), op('计数--', (lambda c: lambda d: d.__setitem__(c, d[c] - 1))(cnt)),
            CV('bridge', (lambda c: lambda d: d[c] == 0)(cnt)), V(mtx)], 1)
m.inv('桥上出现对向交会', lambda d: not (d['onSN'] > 0 and d['onNS'] > 0))
ck(m)

print()
print('—— 经典模型小计：%d 个，全部通过：%s' % (len(OK), all(o[1] for o in OK)))
for n_, o, s in OK:
    if not o:
        print('   ❌ %s' % n_)
