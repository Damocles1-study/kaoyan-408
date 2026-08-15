# -*- coding: utf-8 -*-
"""
PV 交错穷举器（BFS 全状态空间）
—— 用于验证「PV 模板手册」里每一条参考解，以及每一个「书上说会死锁」的反例。

模型：
  进程 = 步骤序列（把 while(1) 循环体展开 rounds 次）
  步骤 = ('P', sem) | ('V', sem) | ('op', name, fn)
  信号量 = 非负整数（value>0 才能 P 通过；否则该进程本步不可推进 = 阻塞）
  共享量 = 命名整数字典

检查：
  ① 死锁：存在未完成的进程，但全局无任何可推进的步骤
  ② 不变式：每到一个新状态，逐条 assert（缓冲区越界 / 临界区内 >1 个进程 / 题目自定约束）
"""
from collections import deque
import itertools


class Model:
    def __init__(self, name):
        self.name = name
        self.sem_names = []
        self.sem_init = []
        self.var_names = []
        self.var_init = []
        self.procs = []          # [(进程名, [步骤...])]
        self.invariants = []     # [(说明, fn(vars_dict) -> bool)]

    def sem(self, name, init):
        self.sem_names.append(name)
        self.sem_init.append(init)
        return name

    def var(self, name, init=0):
        self.var_names.append(name)
        self.var_init.append(init)
        return name

    def proc(self, name, body, rounds=1):
        """body 是步骤列表；rounds 是循环体展开次数"""
        self.procs.append((name, list(body) * rounds))

    def inv(self, desc, fn):
        self.invariants.append((desc, fn))

    # —— 步骤构造糖 ——
    @staticmethod
    def P(s):
        return ('P', s)

    @staticmethod
    def V(s):
        return ('V', s)

    @staticmethod
    def op(name, fn=None):
        return ('op', name, fn)

    @staticmethod
    def CP(s, pred):
        """条件 P：仅当 pred(共享量) 为真时才执行 P（对应 if(count==0) P(rw); ）"""
        return ('CP', s, pred)

    @staticmethod
    def CV(s, pred):
        """条件 V：仅当 pred(共享量) 为真时才执行 V"""
        return ('CV', s, pred)


def explore(m, verbose=False, max_states=400000):
    si = {n: i for i, n in enumerate(m.sem_names)}
    vi = {n: i for i, n in enumerate(m.var_names)}
    nproc = len(m.procs)
    lens = [len(b) for _, b in m.procs]

    start = (tuple(m.sem_init), tuple([0] * nproc), tuple(m.var_init))
    seen = {start}
    q = deque([start])
    deadlocks = []
    violations = []
    finals = 0
    nstates = 0

    while q:
        st = q.popleft()
        nstates += 1
        if nstates > max_states:
            raise RuntimeError('状态爆炸：%s' % m.name)
        sems, pcs, vars_ = st
        moved = False
        done = all(pcs[k] >= lens[k] for k in range(nproc))
        if done:
            finals += 1
            continue

        for k in range(nproc):
            if pcs[k] >= lens[k]:
                continue
            step = m.procs[k][1][pcs[k]]
            ns, nv = list(sems), list(vars_)
            if step[0] == 'P':
                idx = si[step[1]]
                if ns[idx] <= 0:
                    continue          # 阻塞：本进程此刻不可推进
                ns[idx] -= 1
            elif step[0] == 'V':
                ns[si[step[1]]] += 1
            elif step[0] == 'CP':
                d0 = {n: nv[vi[n]] for n in m.var_names}
                if step[2](d0):
                    idx = si[step[1]]
                    if ns[idx] <= 0:
                        continue
                    ns[idx] -= 1
            elif step[0] == 'CV':
                d0 = {n: nv[vi[n]] for n in m.var_names}
                if step[2](d0):
                    ns[si[step[1]]] += 1
            else:                      # op
                fn = step[2]
                if fn is not None:
                    d = {n: nv[vi[n]] for n in m.var_names}
                    fn(d)
                    for n in m.var_names:
                        nv[vi[n]] = d[n]
            moved = True
            npcs = list(pcs)
            npcs[k] += 1
            nst = (tuple(ns), tuple(npcs), tuple(nv))

            # 不变式检查
            d = {n: nv[vi[n]] for n in m.var_names}
            for desc, f in m.invariants:
                if not f(d):
                    violations.append((desc, m.procs[k][0], step, dict(d)))

            if nst not in seen:
                seen.add(nst)
                q.append(nst)

        if not moved:
            deadlocks.append(st)

    return {
        'states': len(seen),
        'deadlocks': deadlocks,
        'violations': violations,
        'finals': finals,
        'sem_names': m.sem_names,
        'var_names': m.var_names,
        'proc_names': [n for n, _ in m.procs],
    }


def report(m, expect_deadlock=False, expect_violation=False, quiet=False):
    r = explore(m)
    dl, vi_ = r['deadlocks'], r['violations']
    ok = (bool(dl) == expect_deadlock) and (bool(vi_) == expect_violation)
    tag = '✅' if ok else '❌'
    line = '%s %-42s 状态 %6d · 死锁 %d · 违反不变式 %d' % (
        tag, m.name, r['states'], len(dl), len(vi_))
    print(line)
    if dl and not quiet:
        sems, pcs, vars_ = dl[0]
        scene = ', '.join('%s=%d' % (n, v) for n, v in zip(r['sem_names'], sems))
        pc = ', '.join('%s@%d' % (n, p) for n, p in zip(r['proc_names'], pcs))
        vv = ', '.join('%s=%d' % (n, v) for n, v in zip(r['var_names'], vars_))
        print('      死锁现场：%s | %s | %s' % (scene, pc, vv))
    if vi_ and not quiet:
        print('      违反：%s（%s 执行 %s 后）%s' % (vi_[0][0], vi_[0][1], vi_[0][2], vi_[0][3]))
    return ok, r
