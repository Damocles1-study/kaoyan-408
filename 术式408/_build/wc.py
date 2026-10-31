#!/usr/bin/env python3
"""讲解量实测：只数讲解汉字，不含代码、图表达式、@q 题目。targets.json 形如 {"31":6000}。"""
import re,os,json,plan
H=os.path.dirname(os.path.abspath(__file__));tp=os.path.join(H,'targets.json')
tg=json.load(open(tp)) if os.path.exists(tp) else {}
tot=0;qs=0
for e in plan.EPS:
    p=os.path.join(H,'..','_src',e['id']+'.txt')
    s=open(p,encoding='utf8').read();n=len(re.findall(r'^@q ',s,re.M))
    t=re.sub(r':::code.*?\n:::','',s,flags=re.S);t=re.sub(r'^@.*$','',t,flags=re.M)
    c=len(re.findall(r'[一-鿿]',t));tot+=c;qs+=n;g=tg.get(e['id'])
    est=round(c/250+n*2.5)
    print(e['id'],e['title'][:14].ljust(14,'　'),f'{c:6d}字 {n:3d}题 约{est:4d}分钟',f'目标{g} {"✓" if c>=g else "差"+str(g-c)}' if g else '')
print('合计',tot,'字',qs,'题','估算',round((tot/250+qs*2.5)/60,1),'小时（250字/分钟 + 每题2.5分钟）')
