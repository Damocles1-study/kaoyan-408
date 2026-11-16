#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""套卷「🧩 本题知识点」：每题一张就地展开的知识点卡，输出 assets/exam/kpq/qYYYY.js 与 kpq/cards.js。

用法：python3 _build/kpq_build.py            # 全部卷子（2009–2026 与模拟卷 9001…）
      python3 _build/kpq_build.py --todo     # 只列出还没写「题眼」的题

每题的卡由三部分拼成：
  1. 知识点卡（通用、只写一份）：精解里用到的 [[id]] 与 @tpl 自动收进来，源文件里的「卡」可以再补。卡片正文在 rich/kp.txt。
  2. 本题怎么用：
       题眼（做题中就能看，不含答案）——只在本目录 kpq/YYYY.txt 里手写，每题必写；
       关键一步 / 坑 / 带走（判分或交卷后才显示）——默认从精解自动取：::fast 秒杀块、::rev 的「卡点」「带走」；
       没写精解的年份（2024–2026）从精研卡的「本质」取关键一步，坑手写。手写的「用」「坑」优先于自动取的。
  3. 去讲解：按题库题号对到术式408的第几话（同精研卡的回链），再按卡片标题与题眼在那一话的各节里找最贴的一节。

━━━━━━━━━━━━━━━━ kpq/YYYY.txt 语法 ━━━━━━━━━━━━━━━━
  N. 题眼               第 N 题开始，这一行就是题眼：「题干里的哪句话 → 想到什么、先做哪一步」，不许出现答案
     卡 id, id          补充知识点卡（必须是 rich/kp.txt 或本年精解里定义过的 id）
     用 …               关键一步（覆盖自动取的秒杀）
     坑 …               常见坑（覆盖自动取的卡点）
     诀 …               口诀或形象比方（只属于这道题；通用口诀写在 kpq/mn.txt 里挂到卡片上）
     话 12 hash         去讲解：第 12 话的 #hash 一节（覆盖自动匹配）；只写话号就落在那一话开头
  行内语法同精解：$公式$、**粗**、==红==、`代码`、[[id]]、{{秒|…}} 等。// 开头是注释。
kpq/mn.txt：  id | 口诀或比方     挂在知识点卡上，凡用到这张卡的题都能看到。
"""
import glob, html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import rich_build as RB  # noqa: E402
import plan  # noqa: E402

SRC = os.path.join(HERE, 'kpq')
OUT = os.path.join(ROOT, 'assets', 'exam', 'kpq')
EXAM = os.path.join(ROOT, 'assets', 'exam')
ERR, WARN = [], []


def jload(path, key):
    s = open(path, encoding='utf-8').read()
    return json.loads(s[s.index('=', s.index('[%s]' % key)) + 1:].rstrip().rstrip(';'))


def papers():
    ys = []
    for f in glob.glob(os.path.join(EXAM, 'y[0-9][0-9][0-9][0-9].js')):
        ys.append(int(os.path.basename(f)[1:5]))
    return sorted(ys)


# ───────── 讲义各节 ─────────
EPI = {e['id']: e for e in plan.EPS}


def ep_sections():
    S = {}
    for e in plan.EPS:
        p = os.path.join(ROOT, 'ep%s.html' % e['id'])
        if not os.path.exists(p): continue
        h = open(p, encoding='utf-8').read()
        parts = re.split(r'(<h2 id="[^"]+">.*?</h2>)', h)
        secs = []
        for i in range(1, len(parts), 2):
            m = re.match(r'<h2 id="([^"]+)">(.*?)</h2>', parts[i])
            sid, head = m.group(1), re.sub(r'<i>[^<]*</i>', '', m.group(2))
            head = re.sub(r'<[^>]+>', '', head).strip()
            body = re.sub(r'<[^>]+>', ' ', parts[i + 1] if i + 1 < len(parts) else '')
            body = html.unescape(re.sub(r'\s+', ' ', body))
            if sid == 'lab': continue
            secs.append((sid, head, body))
        labs = set(re.findall(r'id="q-([^"]+)"', h))
        S[e['id']] = {'secs': secs, 'labs': labs}
    return S


def grams(t):
    t = re.sub(r'<[^>]+>|\$[^$]*\$', ' ', t or '')
    t = re.sub(r'[\s，。、；：！？（）「」【】《》“”‘’·…—\-–,.;:!?()\[\]{}|/=+*<>⟹→]', ' ', t)
    g = set()
    for w in t.split():
        if re.search(r'[一-鿿]', w):
            g |= {w[i:i + 2] for i in range(len(w) - 1)}
        elif len(w) >= 2:
            g.add(w.lower())
    return g


STOP = grams('的是在和与了一个这那就要会能不可以什么怎么题目选项下列正确错误叙述说法关于')


def best_sec(ep, words, S):
    secs = S.get(ep, {}).get('secs', [])
    if not secs: return None
    W = words - STOP
    best, bs = None, 0.0
    for sid, head, body in secs:
        hb = grams(head); bb = grams(body)
        sc = 3 * len(W & hb) + len(W & bb) / max(1.0, (len(bb) / 400.0) ** 0.5)
        if sc > bs: best, bs = (sid, head), sc
    return best if bs >= 1.5 else None


def ep_of_q(q, D):
    """题 → 第几话：先按题库题号（同精研卡），再看精研卡的「第 N 话」"""
    e = None
    if q.get('src'):
        e = EP_OF(q.get('src'), q.get('tag'))
    if not e and D:
        m = re.search(r'第\s*(\d+)\s*话', (D.get('link') or '') + (D.get('back') or {}).get('text', ''))
        if m: e = EPI.get('%02d' % int(m.group(1)))
    return e


_ns = {'__file__': os.path.join(HERE, 'deep_build.py'), '__name__': 'deep_build_mod'}
exec(open(os.path.join(HERE, 'deep_build.py'), encoding='utf-8').read(), _ns)
EP_OF = _ns['ep_of']


# ───────── 题眼的自动取法（精解年份）─────────
# 读题块的头一两句「原句 >> 想到什么」就是题眼：原句是题干原文、右边是该想到的知识点。
# 只取不含答案的句子：右边出现选项字母结论、✓✗、「对 / 错」判词的跳过；手写的题眼优先。
SPOIL = re.compile(r'(选\s*\*{0,2}[A-D]|[A-D]\s*(对|错|正确|错误)|✓|✗|⟹\s*[A-D][。，\s]|答案|排除\s*[A-D]|不可能相邻|——错|⟹ 错|⟹ 对|^对[。：:，]|^错[。：:，]|说反了|显然|是理由|不是理由|不成立|⟹ 成立|⟹ 不)')

def auto_cue(r):
    out = []
    for b in r['blocks']:
        if b[0] != 'read': continue
        for l in b[2]:
            if '>>' not in l: continue
            x, z = [t.strip() for t in l.split('>>', 1)]
            if SPOIL.search(z) or re.search(r'选项', x) or re.match(r'「\s*(\{\{[^|]+\|)?\s*([ⅠⅡⅢⅣⅤ]|[A-D][\s.．、:：])', x): continue
            out.append((x, z))
            if len(out) >= 2 or len(re.sub(r'\{\{[^|]+\||\}\}|\[\[|\]\]|\$', '', z)) >= 26: return out
        break
    return out


# ───────── 源文件 ─────────
def parse_kpq(path):
    Q, cur = {}, None
    for ln, l in enumerate(open(path, encoding='utf-8').read().split('\n'), 1):
        if not l.strip() or l.lstrip().startswith('//'): continue
        m = re.match(r'(\d+)\.\s*(.*)$', l)
        if m and not l.startswith(' '):
            cur = Q.setdefault(int(m.group(1)), {'cue': m.group(2).strip(), 'ln': ln})
            continue
        m = re.match(r'\s+(卡|用|坑|诀|话)\s+(.*)$', l)
        if m and cur is not None:
            k, v = m.group(1), m.group(2).strip()
            if k == '卡': cur.setdefault('k', []).extend(x.strip() for x in re.split(r'[,，]', v) if x.strip())
            else: cur[k] = v
            continue
        if cur is not None and l.startswith('     '):
            cur['cue'] += ' ' + l.strip(); continue
        ERR.append('%s:%d 看不懂这一行：%s' % (os.path.basename(path), ln, l[:40]))
    return Q


def main():
    todo = '--todo' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    G = {}
    RB.parse_defs(open(os.path.join(HERE, 'rich', 'kp.txt'), encoding='utf-8').read(), 'kp.txt', G)
    S = ep_sections()
    MN = {}
    mp = os.path.join(SRC, 'mn.txt')
    if os.path.exists(mp):
        for ln, l in enumerate(open(mp, encoding='utf-8').read().split('\n'), 1):
            if not l.strip() or l.startswith('//'): continue
            if '|' not in l: ERR.append('mn.txt:%d 要写「id | 口诀」' % ln); continue
            k, v = [x.strip() for x in l.split('|', 1)]
            if k not in G: ERR.append('mn.txt:%d 卡片 %s 不在 kp.txt 里' % (ln, k)); continue
            MN[k] = RB.inline(v, 'mn ' + k, G)
    stat, miss = [], []
    nauto = [0]
    for y in papers():
        P = jload(os.path.join(EXAM, 'y%d.js' % y), y)
        ids = dict(G); RQ = {}
        rp = os.path.join(HERE, 'rich', '%d.txt' % y)
        if os.path.exists(rp):
            L = {}
            rest = RB.parse_defs(open(rp, encoding='utf-8').read(), '%d.txt' % y, L, local=True)
            ids.update(L)
            RQ = RB.parse_year(rest, '%d.txt' % y)
        DQ = {}
        dp = os.path.join(EXAM, 'deep', 'd%d.js' % y)
        if os.path.exists(dp):
            try: DQ = jload(dp, y).get('q', {})
            except Exception: DQ = {}
        kp_path = os.path.join(SRC, '%d.txt' % y)
        KQ = parse_kpq(kp_path) if os.path.exists(kp_path) else {}
        nos = {q['no'] for q in P['q']}
        for n in KQ:
            if n not in nos: ERR.append('kpq/%d.txt 第 %d 题不在卷子里' % (y, n))
        out, ncue = {}, 0
        for q in P['q']:
            no = q['no']; w = '%d 第 %d 题' % (y, no)
            r, d, k = RQ.get(no), DQ.get(str(no)) or {}, KQ.get(no, {})
            cards = []
            for c in k.get('k', []):
                if c not in ids: ERR.append('%s：卡 %s 没定义' % (w, c))
                elif c not in cards: cards.append(c)
            if r:
                for c in r['tpl']:
                    if c in ids and c not in cards: cards.append(c)
                for b in r['blocks']:
                    if b[0] == 'sk': continue
                    for c in re.findall(r'\[\[([^\]|]+)', '\n'.join(b[2])):
                        c = c.strip()
                        if c in ids and c not in cards: cards.append(c)
            o = {}
            if cards: o['k'] = cards
            if k.get('cue'):
                o['cue'] = RB.inline(k['cue'], w + ' 题眼', ids); ncue += 1
            elif r and auto_cue(r):
                o['cue'] = '<span class="kq-a">' + '</span><span class="kq-a">'.join(
                    '<span class="rq">%s</span><span class="ra">%s</span>' % (RB.inline(a, w + ' 题眼', ids), RB.inline(b, w + ' 题眼', ids)) for a, b in auto_cue(r)) + '</span>'
                ncue += 1; nauto[0] += 1
            else:
                miss.append(w)
            # 关键一步
            if k.get('用'):
                o['use'] = RB.inline(k['用'], w + ' 用', ids)
            elif r:
                fb = [b for b in r['blocks'] if b[0] == 'fast']
                if fb: o['use'] = RB.lines_html(fb[0][2], w + ' 秒杀', ids)
            if 'use' not in o and d.get('core'):
                o['use'] = d['core']
            # 坑、带走
            tk = tr = ''
            if r:
                for b in r['blocks']:
                    if b[0] != 'rev': continue
                    for l in b[2]:
                        m = re.match(r'-\s*\*\*(卡点|带走)\*\*\s*(.*)$', l.strip())
                        if m and m.group(1) == '卡点': tr = RB.inline(m.group(2), w + ' 卡点', ids)
                        if m and m.group(1) == '带走': tk = RB.inline(m.group(2), w + ' 带走', ids)
            if k.get('坑'): tr = RB.inline(k['坑'], w + ' 坑', ids)
            if tr: o['trap'] = tr
            if tk: o['take'] = tk
            if not tk and d.get('how') and not r: o['take'] = d['how']
            if k.get('诀'): o['mn'] = RB.inline(k['诀'], w + ' 诀', ids)
            # 去讲解
            e = None; sec = None
            if k.get('话'):
                pa = k['话'].split()
                e = EPI.get('%02d' % int(pa[0]))
                if not e: ERR.append('%s：话 %s 不存在' % (w, pa[0]))
                if e and len(pa) > 1:
                    hs = [x for x in S.get(e['id'], {}).get('secs', []) if x[0] == pa[1]]
                    if not hs: ERR.append('%s：第 %s 话没有 #%s 这一节' % (w, e['id'], pa[1]))
                    else: sec = (hs[0][0], hs[0][1])
            else:
                e = ep_of_q(q, d)
                if e:
                    words = grams(k.get('cue', '')) | grams(q.get('tag', ''))
                    for c in cards: words |= grams(ids[c]['t'])
                    sec = best_sec(e['id'], words, S)
            if e:
                o['ep'] = {'n': int(e['id']), 't': e['title']}
                if sec: o['ep'].update({'s': sec[0], 'st': sec[1]})
                lab = (q.get('src') or '').replace(':', '_')
                if lab and lab in S.get(e['id'], {}).get('labs', set()): o['ep']['lab'] = 'q-' + lab
            for kk in ('cue', 'use', 'trap', 'take', 'mn'):
                if kk in o: RB.tagcheck(o[kk], w + ' ' + kk)
            out[str(no)] = o
        js = '(window.EXAM_KPQ=window.EXAM_KPQ||{})[%d]=%s;\n' % (y, json.dumps(out, ensure_ascii=False, separators=(',', ':')))
        open(os.path.join(OUT, 'q%d.js' % y), 'w', encoding='utf-8').write(js)
        nep = sum(1 for v in out.values() if 'ep' in v); nsec = sum(1 for v in out.values() if v.get('ep', {}).get('s'))
        nk = sum(1 for v in out.values() if v.get('k'))
        stat.append('%d：题眼 %d/%d · 有卡 %d · 关键一步 %d · 去讲解 %d（落到节 %d）' % (y, ncue, len(P['q']), nk, sum(1 for v in out.values() if 'use' in v), nep, nsec))
    open(os.path.join(OUT, 'cards.js'), 'w', encoding='utf-8').write('window.EXAM_KPX=%s;\n' % json.dumps({'mn': MN}, ensure_ascii=False, separators=(',', ':')))
    print('\n'.join(stat))
    print('口诀卡 %d 张；题眼自动取自读题块 %d 题' % (len(MN), nauto[0]))
    if todo:
        print('还没写题眼：%d 题' % len(miss)); print(' '.join(miss))
    ERR.extend(RB.ERR)
    if ERR:
        print('\n✗ %d 处问题：' % len(ERR)); print('\n'.join('  ' + x for x in ERR[:80])); sys.exit(1)
    print('✓ 通过')


if __name__ == '__main__':
    main()
