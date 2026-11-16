#!/usr/bin/env python3
"""写「题眼」时用的摘要：python3 kpq/digest.py 2021 → 每题的知识点卡标题、读题块、带走。只给人看，不进页面。"""
import re, sys, os, json
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def titles():
    T = {}
    for f in [os.path.join(H, 'rich', 'kp.txt')] + [os.path.join(H, 'rich', '%s' % x) for x in os.listdir(os.path.join(H, 'rich')) if re.match(r'\d{4}\.txt$', x)]:
        for m in re.finditer(r'^@(kp|tpl) ([^|\n]+)\|\s*(.*)$', open(f).read(), flags=re.M):
            T[m.group(2).strip()] = m.group(3).strip()
    return T
def strip(s):
    s = re.sub(r'\{\{[^|]+\|', '', s).replace('}}', '')
    s = re.sub(r'\[\[([^\]|]+)(?:\|([^\]]*))?\]\]', lambda m: m.group(2) or m.group(1), s)
    return s
def main(y, W=64):
    T = titles()
    t = open(os.path.join(H, 'rich', '%s.txt' % y)).read()
    parts = re.split(r'^#(\d+)\s*$', t, flags=re.M)
    for i in range(1, len(parts), 2):
        no, b = parts[i], parts[i + 1]
        ids = []
        for m in re.findall(r'^@tpl (.*)$', b, flags=re.M): ids += [x.strip() for x in m.split(',')]
        ids += [x for x in re.findall(r'\[\[([^\]|]+)', b) if x not in ids]
        rd = re.search(r'^::read\n(.*?)(?=^::|\Z)', b, flags=re.M | re.S)
        tk = re.search(r'\*\*带走\*\*\s*(.*)', b)
        ids = [k for k in ids if k in T]
        print('#%s [%s]' % (no, '；'.join(T[k][:16] for k in ids[:3])))
        if rd:
            for l in rd.group(1).strip().split('\n')[:2]:
                print('   ', strip(l)[:W])
        if tk: print('  带走', strip(tk.group(1))[:W])
if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 64)
