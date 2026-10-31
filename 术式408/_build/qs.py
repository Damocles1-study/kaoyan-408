#!/usr/bin/env python3
"""列某话已用的题：题号 年份 题干前 N 字 答案 | 现有点评。用法：qs.py 31 [N]"""
import sys,re,os,qbank
B=qbank.load();H=os.path.dirname(os.path.abspath(__file__));N=int(sys.argv[2]) if len(sys.argv)>2 else 70
cl=lambda x:re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',str(x)))
for l in open(f'{H}/../_src/q/{sys.argv[1]}.txt',encoding='utf8'):
    if not l.startswith('@q '):continue
    k,_,n=l[3:].partition('|');k=k.strip();q=B[k]
    a=q.get('ans','');o=''
    if q.get('opts') and a in list('ABCD'):o=cl(q['opts']['ABCD'.index(a)])[:24]
    print(k.split(':')[1],q.get('exam'),re.sub(r'^【[^】]*】','',cl(q['stem']))[:N],'→',a,o,'｜',n.strip()[:60])
