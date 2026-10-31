#!/usr/bin/env python3
"""按文字补丁改 _src/NN.txt，保留代码与图不重抄。用法 patch.py 文件。
指令（独占一行）：#EP 17 ｜ #TOP ｜ #AFTER 行首 ｜ #BEFORE 行首 ｜ #LINE 行首（替换该行）｜ #BLOCK 行首（替换从该行到配对 ::: 的整块）｜ #END（追加到 :::domain 之前）。
指令后面到下一条指令之间是新内容；找不到行首直接报错，不写文件。"""
import re,sys,os
H=os.path.dirname(os.path.abspath(__file__))
txt=open(sys.argv[1],encoding='utf8').read().split('\n')
ops={};ep=None;cur=None
for l in txt:
    m=re.match(r'^#(EP|TOP|AFTER|BEFORE|LINE|BLOCK|END)\b ?(.*)$',l)
    if m:
        if m.group(1)=='EP': ep=m.group(2).strip();ops[ep]=[];cur=None
        else: cur=[m.group(1),m.group(2),[]];ops[ep].append(cur)
    elif cur is not None: cur[2].append(l)
for ep,oo in ops.items():
    p=f'{H}/../_src/{ep}.txt';L=open(p,encoding='utf8').read().split('\n')
    for k,a,b in oo:
        while b and not b[-1].strip(): b.pop()
        while b and not b[0].strip(): b.pop(0)
        if k=='TOP': L=b+['']+L;continue
        if k=='END':
            i=max(j for j,x in enumerate(L) if x.startswith(':::domain'));L[i:i]=b+[''];continue
        idx=[j for j,x in enumerate(L) if x.startswith(a)]
        if len(idx)<1: raise SystemExit(f'[{ep}] 找不到：{a}')
        i=idx[0]
        if k=='AFTER':
            if L[i].startswith(':::') and len(L[i].strip())>3:
                d=0;j=i
                while True:
                    t=L[j].strip()
                    if t.startswith(':::') and len(t)>3:d+=1
                    elif t==':::':
                        d-=1
                        if d==0:break
                    j+=1
                i=j
            L[i+1:i+1]=['']+b+['']
        elif k=='BEFORE': L[i:i]=b+['']
        elif k=='LINE': L[i:i+1]=b
        elif k=='BLOCK':
            d=0;j=i
            while True:
                t=L[j].strip()
                if t.startswith(':::') and len(t)>3:d+=1
                elif t==':::':
                    d-=1
                    if d==0:break
                j+=1
            L[i:j+1]=b
    open(p,'w',encoding='utf8').write(re.sub(r'\n{3,}','\n\n','\n'.join(L)))
    print('ok',ep)
