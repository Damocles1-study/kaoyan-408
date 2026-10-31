#!/usr/bin/env python3
"""讲解量实测：只数讲解汉字，不含代码、图表达式、题目。targets.json 形如 {"31":6000}。时长口径同 plan.py。"""
import re,os,json,plan
H=os.path.dirname(os.path.abspath(__file__));tp=os.path.join(H,'targets.json')
tg=json.load(open(tp)) if os.path.exists(tp) else {}
tot=0;qs=0
for e in plan.EPS:
    p=os.path.join(H,'..','_src',e['id']+'.txt')
    s=open(p,encoding='utf8').read();qp=os.path.join(H,'..','_src','q',e['id']+'.txt');n=len(re.findall(r'^@q ',open(qp,encoding='utf8').read(),re.M)) if os.path.exists(qp) else 0
    t=re.sub(r':::code.*?\n:::','',s,flags=re.S);t=re.sub(r'^@.*$','',t,flags=re.M)
    c=len(re.findall(r'[一-鿿]',t));tot+=c;qs+=n;g=tg.get(e['id'])
    est=e['min']
    print(e['id'],e['title'][:14].ljust(14,'　'),f'{c:6d}字 {n:3d}题 约{est:4d}分钟',f'目标{g} {"✓" if c>=g else "差"+str(g-c)}' if g else '')
M=sum(e['min'] for e in plan.EPS);print('合计',tot,'字',qs,'题','估算',round(M/60,1),'小时 =',len(plan.DAYS),'个下午（200字/分钟 + 选择2分钟 + 综合10分钟）')
