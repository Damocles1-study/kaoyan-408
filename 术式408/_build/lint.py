#!/usr/bin/env python3
"""用户铁律：知识部分不提真题问法考法。扫 _src/NN.txt（题目文件不扫）里提到考法的行。"""
import glob,os,re
H=os.path.dirname(os.path.abspath(__file__));P=re.compile(r'真题|常考|爱考|必考|考点|考法|考场|大题|命题|每年|\b20[012]\d\b|失分|阅卷|卷面|采分')
n=0
for f in sorted(glob.glob(H+'/../_src/[0-9]*.txt')):
    e=os.path.basename(f)[:2]
    if e in('00','51'):continue
    for i,l in enumerate(open(f,encoding='utf8'),1):
        if P.search(l): n+=1;print(e,i,l.strip()[:70])
print('共',n,'行')
