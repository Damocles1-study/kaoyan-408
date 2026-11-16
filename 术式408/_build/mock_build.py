#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""模拟卷：按 _build/mock/NNNN.txt 的组卷单，从练习系统题库取原题（不改题）、自编题从精解源文件取，输出 assets/exam/yNNNN.js。
卷号用 3001、3002…（与数学重读报模拟卷同一编号段）（四位数，套卷引擎按年份那样路由；页面上显示 EXAM_CONF.names 里的名字）。

用法：python3 _build/mock_build.py        # 全部模拟卷
组卷单语法（_build/mock/NNNN.txt）：
  @title 模拟卷一
  @note  卷首说明（HTML，可选）
  N 科目:题号 [分值] [!]    题库原题，如 `1 ds:1.2-11`、`41 ds:2.2-综9 13`；行尾 ! ＝ 与真题的相似报警已人工核过（只是套话相同）
  N 自编 科目 [分值]         自编题：题面、选项、答案写在 _build/rich/NNNN.txt 的 #N 里（@stem / @A–@D / @ans）
硬校验：题号 1–47 齐全；1–40 选择各 2 分、41–47 综合合计 70 分，总分 150；科目段落与统考一致（1–11 数构、12–22 组原、
23–32 操作系统、33–40 网络、41–42 数构、43–44 组原、45–46 操作系统、47 网络）；不许用 2009–2026 统考真题；
题面与 2009–2026 任一真题过于相似（字二元组 Jaccard ≥ 0.5）报错；同一道题不许在几套模拟卷里重复出现。
"""
import glob, html, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PS = os.path.join(ROOT, '..', '练习系统')
OUT = os.path.join(ROOT, 'assets', 'exam')
sys.path.insert(0, HERE)
import rich_build as RB  # noqa: E402

JSC = '/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc'
SEG = [(1, 11, 'ds'), (12, 22, 'co'), (23, 32, 'os'), (33, 40, 'net'), (41, 42, 'ds'), (43, 44, 'co'), (45, 46, 'os'), (47, 47, 'net')]


def bank():
    B = {}
    for s in ['ds', 'co', 'os', 'net']:
        tmp = os.path.join(PS, '.tmp_dump_mock.js')
        open(tmp, 'w').write('var window=this;load("data_%s.js");print(JSON.stringify(window.SUBJ_DATA));' % s)
        out = subprocess.run([JSC, '.tmp_dump_mock.js'], cwd=PS, capture_output=True, text=True).stdout
        os.remove(tmp)
        for q in json.loads(out):
            q['subj'] = s; B[s + ':' + q['id']] = q
    return B


def plain(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s or ''))


def bigr(s):
    s = re.sub(r'\s+', '', plain(s))
    return {s[i:i + 2] for i in range(len(s) - 1)}


def clean(s):
    s = re.sub(r'^\s*【\s*20\d\d[^】]*】\s*', '', s or '')
    s = re.sub(r'（★\s*本题考点已于[^）]*）\s*', '', s)
    s = re.sub(r'（同第\s*\d+\s*题的图）', '', s)   # 题库里指向本节别的题，搬进模拟卷后题号对不上
    for key in ['提示：先写出这棵树', '提示：判定树的结点数', '提示：不要', '提示：三步验收']:
        i = s.find(key)
        if i < 0: continue
        a = s.rfind('<span', 0, i); b = s.find('</span>', i)
        if a >= 0 and b >= 0: s = s[:a] + s[b + 7:]
        else: s = s[:i]
        s = re.sub(r'(<br>\s*)+$', '', s)
    return s


def fig(src, cap):
    if not src: return ''
    return '<figure class="fg"><img src="../练习系统/%s" alt="" loading="lazy">%s</figure>' % (src, '<figcaption>%s</figcaption>' % cap if cap else '')


def pre(c): return '<pre>%s</pre>' % c.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def real_stems():
    S = []
    for f in glob.glob(os.path.join(OUT, 'y20[0-9][0-9].js')):
        y = int(os.path.basename(f)[1:5])
        s = open(f, encoding='utf-8').read()
        P = json.loads(s[s.index('=', s.index('[%d]' % y)) + 1:].rstrip().rstrip(';'))
        for q in P['q']:
            S.append((y, q['no'], q.get('src'), bigr(q.get('stem', ''))))
    return S


def main():
    ERR = []
    B = bank()
    RS = real_stems()
    used_real = {x[2] for x in RS if x[2]}
    seen = {}
    for spec in sorted(glob.glob(os.path.join(HERE, 'mock', '[0-9][0-9][0-9][0-9].txt'))):
        pid = int(os.path.basename(spec)[:4])
        title, note, rows = '模拟卷', '', {}
        for ln, l in enumerate(open(spec, encoding='utf-8').read().split('\n'), 1):
            if not l.strip() or l.startswith('//'): continue
            if l.startswith('@title'): title = l[6:].strip(); continue
            if l.startswith('@note'): note = l[5:].strip(); continue
            m = re.match(r'(\d+)\s+(自编\s+(ds|co|os|net)|[a-z]+:[^\s!]+)(?:\s+(\d+))?\s*(!)?\s*$', l)
            if not m: ERR.append('%s:%d 看不懂：%s' % (os.path.basename(spec), ln, l)); continue
            rows[int(m.group(1))] = (m.group(2), m.group(3), int(m.group(4)) if m.group(4) else None, bool(m.group(5)))
        RQ = {}
        rp = os.path.join(HERE, 'rich', '%d.txt' % pid)
        if os.path.exists(rp):
            L = {}
            G = {}
            RB.parse_defs(open(os.path.join(HERE, 'rich', 'kp.txt'), encoding='utf-8').read(), 'kp.txt', G)
            rest = RB.parse_defs(open(rp, encoding='utf-8').read(), '%d.txt' % pid, L, local=True)
            ids = dict(G); ids.update(L)
            RQ = RB.parse_year(rest, '%d.txt' % pid)
        qs = []
        for n in range(1, 48):
            w = '%d 第 %d 题' % (pid, n)
            if n not in rows: ERR.append(w + '：组卷单里没有'); continue
            src, sj, sc, okdup = rows[n]
            want = [s for a, b, s in SEG if a <= n <= b][0]
            ch = n <= 40
            if src.startswith('自编'):
                if sj != want: ERR.append('%s：科目应为 %s' % (w, want))
                r = RQ.get(n)
                if not r or not r['stem']: ERR.append(w + '：自编题要在精解源文件里写 @stem'); continue
                it = {'no': n, 'type': 'choice' if ch else 'essay', 'score': 2 if ch else sc, 'subj': sj, 'self': 1,
                      'stem': RB.lines_html(r['stem'], w, ids), 'sol': ''}
                if ch:
                    if sorted(r['opts']) != ['A', 'B', 'C', 'D'] or not r.get('ans'): ERR.append(w + '：自编选择题要写 @A–@D 和 @ans'); continue
                    it['opts'] = [RB.inline(r['opts'][k].strip(), w, ids) for k in 'ABCD']; it['ans'] = r['ans']
                it['tag'] = '自编（按 2024–2026 命题趋势新写，答案已用程序复算）'
            else:
                q = B.get(src)
                if not q: ERR.append('%s：题库里没有 %s' % (w, src)); continue
                if q.get('exam') or src in used_real: ERR.append('%s：%s 是统考真题，不能用' % (w, src)); continue
                if q['subj'] != want: ERR.append('%s：%s 不是 %s 的题' % (w, src, want))
                if (q.get('type') == 'choice') != ch: ERR.append('%s：%s 题型不对' % (w, src))
                if src in seen: ERR.append('%s：%s 已经用在 %s' % (w, src, seen[src]))
                seen[src] = w
                st = clean(q['stem'])
                stem_code = q.get('codeStem') or q.get('type') == 'choice'   # 选择题的代码一定是题面（题库里少数漏标了 codeStem）
                code = q.get('code') if stem_code else None
                h = st + (pre(code) if code else '')
                if q.get('fig'):
                    if not os.path.exists(os.path.join(PS, q['fig'])): ERR.append('%s：题图缺失 %s' % (w, q['fig']))
                    h += fig(q['fig'], q.get('figcap'))
                sol = q.get('book') or ''
                if q.get('code') and not stem_code: sol += pre(q['code'])
                if q.get('figA'): sol += fig(q['figA'], q.get('figAcap'))
                it = {'no': n, 'type': 'choice' if ch else 'essay', 'score': 2 if ch else (sc or 0), 'subj': q['subj'], 'stem': h, 'sol': sol}
                if ch: it['opts'] = q['opts']; it['ans'] = q['ans']
                if q.get('claude'): it['more'] = q['claude']
                it['tag'] = '题源：练习系统 %s（原题未改）' % src + ('　' + '、'.join(q['kp'][:3]) if q.get('kp') else '')
                it['src'] = src
                bg = bigr(h)
                for y, no, s2, b2 in ([] if okdup else RS):
                    if bg and b2 and len(bg & b2) / max(1, len(bg | b2)) >= 0.5 and len(bg) > 20:
                        ERR.append('%s：%s 与 %d 年第 %d 题太像' % (w, src, y, no))
            qs.append(it)
        tot = sum(q['score'] for q in qs)
        if tot != 150: ERR.append('%d：总分 %d ≠ 150' % (pid, tot))
        fn = {q['no']: '自编' for q in qs if q.get('self')}
        P = {'year': pid, 'title': title, 'q': qs, 'mock': 1,
             'secName': {'choice': '一、单项选择题（每题 2 分，共 80 分）', 'essay': '二、综合应用题（共 70 分）'}}
        if note: P['note'] = note
        if fn: P['flagNote'] = fn
        open(os.path.join(OUT, 'y%d.js' % pid), 'w', encoding='utf-8').write(
            '(window.EXAM_PAPERS=window.EXAM_PAPERS||{})[%d]=%s;\n' % (pid, json.dumps(P, ensure_ascii=False, separators=(',', ':'))))
        print('%d %s：%d 题 · %d 分 · 自编 %d 题' % (pid, title, len(qs), tot, sum(1 for q in qs if q.get('self'))))
    ERR.extend(RB.ERR)
    if ERR:
        print('\n✗ %d 处问题：' % len(ERR)); print('\n'.join('  ' + e for e in ERR)); sys.exit(1)
    print('✓ 通过')


if __name__ == '__main__':
    main()
