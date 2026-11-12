#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""算法题速成页：把 algo.c 里 //@@ 名字 … //@@end 之间的代码抽出来，填进 page.html 的 {{code:名字|标题}}，生成 ../../算法题速成.html。
改代码只改 algo.c（改完先 gcc 编译并运行自测），改文字只改 page.html，然后跑本脚本。"""
import html, os, re, subprocess, sys, tempfile
H = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(H, 'algo.c'), encoding='utf-8').read()
exe = os.path.join(tempfile.gettempdir(), 'algo_fast_test')
if subprocess.call(['gcc', '-O1', '-w', '-o', exe, os.path.join(H, 'algo.c')]) or subprocess.call([exe], stdout=subprocess.DEVNULL):
    sys.exit('✗ algo.c 编译或自测没过')
code = {m.group(1): m.group(2).strip('\n') for m in re.finditer(r'//@@ (\w+)\n(.*?)//@@end', src, re.S)}
def rep(m):
    c = code[m.group(1)]
    return '<div class="code"><div class="h">%s</div><pre>%s</pre></div>' % (m.group(2), html.escape(c))
page = re.sub(r'\{\{code:(\w+)\|([^}]*)\}\}', rep, open(os.path.join(H, 'page.html'), encoding='utf-8').read())
open(os.path.join(H, '..', '..', '算法题速成.html'), 'w', encoding='utf-8').write(page)
print('✓ 算法题速成.html：%d 段代码' % len(code))
