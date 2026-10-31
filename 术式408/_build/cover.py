#!/usr/bin/env python3
"""覆盖盘点：coverage.json 里每话的知识点词，在本话讲解正文（不含题目）出现几次。用法：cover.py [话号…]，只列没出现或只出现一次的。"""
import json,os,re,sys
H=os.path.dirname(os.path.abspath(__file__));C=json.load(open(H+'/coverage.json',encoding='utf8'))
zero=one=tot=0
for ep,ts in sorted(C.items()):
    if sys.argv[1:] and ep not in sys.argv[1:]: continue
    s=open(f'{H}/../_src/{ep}.txt',encoding='utf8').read();m=[];o=[]
    for t in ts:
        tot+=1;n=s.count(t)
        if n==0:m.append(t);zero+=1
        elif n==1:o.append(t);one+=1
    if m or o: print(ep,'缺:',' '.join(m) or '-','｜仅一次:',' '.join(o) or '-')
print(f'合计 {tot} 词，缺 {zero}，仅一次 {one}')
