# OS ch3 页面置换算法复算器：OPT / FIFO / LRU / CLOCK / 改进型CLOCK
def opt(ref, m):
    fr=[]; faults=0; evict=0; trace=[]
    for i,p in enumerate(ref):
        if p in fr: trace.append((p,list(fr),'命中')); continue
        faults+=1
        if len(fr)<m:
            fr.append(p); trace.append((p,list(fr),'装入'))
        else:
            evict+=1; far=-1; vic=None
            for q in fr:
                rest=ref[i+1:]
                nxt = rest.index(q)+i+1 if q in rest else 10**9
                if nxt>far: far=nxt; vic=q
            fr[fr.index(vic)]=p; trace.append((p,list(fr),f'淘汰{vic}'))
    return faults,evict,trace

def fifo(ref,m):
    fr=[]; q=[]; faults=0; evict=0
    for p in ref:
        if p in fr: continue
        faults+=1
        if len(fr)<m: fr.append(p); q.append(p)
        else:
            evict+=1; vic=q.pop(0); fr[fr.index(vic)]=p; q.append(p)
    return faults,evict

def lru(ref,m):
    fr=[]; rec=[]; faults=0; evict=0; trace=[]
    for p in ref:
        if p in fr:
            rec.remove(p); rec.append(p); trace.append((p,list(fr),'命中')); continue
        faults+=1
        if len(fr)<m:
            fr.append(p); rec.append(p); trace.append((p,list(fr),'装入'))
        else:
            evict+=1; vic=rec.pop(0); fr[fr.index(vic)]=p; rec.append(p)
            trace.append((p,list(fr),f'淘汰{vic}'))
    return faults,evict,trace

def clock(ref,m):
    fr=[None]*m; use=[0]*m; ptr=0; faults=0; evict=0; trace=[]
    for p in ref:
        if p in fr:
            use[fr.index(p)]=1; trace.append((p,list(fr),list(use),'命中')); continue
        faults+=1
        if None in fr:
            i=fr.index(None); fr[i]=p; use[i]=1; ptr=(i+1)%m
            trace.append((p,list(fr),list(use),'装入'))
        else:
            evict+=1
            while use[ptr]==1:
                use[ptr]=0; ptr=(ptr+1)%m
            vic=fr[ptr]; fr[ptr]=p; use[ptr]=1; ptr=(ptr+1)%m
            trace.append((p,list(fr),list(use),f'淘汰{vic}'))
    return faults,evict,trace

ref1=[7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1]
print('【教材主例 m=3】 7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1')
f,e,_=opt(ref1,3);  print(f'  OPT  缺页 {f} / 置换 {e}    书: 9 次缺页, 其中 6 次置换')
f,e=fifo(ref1,3);   print(f'  FIFO 缺页 {f} / 置换 {e}    书: 15 次缺页, 其中 12 次置换')
f,e,tr=lru(ref1,3); print(f'  LRU  缺页 {f} / 置换 {e}    书: 未给总数(称前5次与OPT相同)')
print('  LRU 前 8 步:', [(p,fr,a) for p,fr,a in tr[:8]])

ref2=[3,2,1,0,3,2,4,3,2,1,0,4]
print('\n【Belady 异常】 3,2,1,0,3,2,4,3,2,1,0,4')
for m in (3,4):
    f,e=fifo(ref2,m); print(f'  FIFO m={m}  缺页 {f}      书: m=3→9, m=4→10')

ref3=[7,0,1,2,0,3,0,4,2,3,0,3,2,1,3,2]
print('\n【CLOCK 例 m=4】 7,0,1,2,0,3,0,4,2,3,0,3,2,1,3,2')
f,e,tr=clock(ref3,4); print(f'  CLOCK 缺页 {f} / 置换 {e}   书: 共 8 次缺页')
for i,(p,fr,use,a) in enumerate(tr):
    if a!='命中': print(f'   第{i+1}次访问 {p}: 帧{fr} 访问位{use}  {a}')
