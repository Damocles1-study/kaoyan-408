#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在线真题套卷：把练习系统题库按原卷题号拼回整卷，输出 assets/exam/yYYYY.js。
题号映射 exam_slots.json 由原卷 OCR 定位得到，其中人工订正的部分写在 FIX 里。"""
import json,os,re,subprocess,sys
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.join(HERE,'..')
PS=os.path.join(ROOT,'..','练习系统')
JSC='/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc'
def bank():
    B={}
    for s in ['ds','co','os','net']:
        js='var window=this;load("data_%s.js");print(JSON.stringify(window.SUBJ_DATA));'%s
        tmp=os.path.join(PS,'.tmp_dump.js')
        open(tmp,'w').write(js)
        out=subprocess.run([JSC,'.tmp_dump.js'],cwd=PS,capture_output=True,text=True).stdout
        os.remove(tmp)
        for q in json.loads(out):
            q['subj']=s; B[s+':'+q['id']]=q
    return B
B=bank()
SLOTS=json.load(open(os.path.join(HERE,'exam_slots.json')))
# 考题在题库里改写时留下的「综 02」「题 4.3-综05」这类内部编号，换回原卷题号
REWRITE={
 'co:4.3-综03':[('对于题 4.3-综02（2019 真题 f1 递归求阶乘）','对于题 45')],
 'co:4.3-综06':[('对于题 4.3-综05 中','对于题 43 中')],
 'co:5.3-综09':[('上题（综 08）中描述','题 43 中描述')],
 'co:5.6-综03':[('假设对于<b>综 02（2014 真题）中','假设对于<b>题 44 中')],
 'os:3.2-综19':[('假定 2017 年题 44','假定题 44')],
}
EXTRA={2013:{15:{'subj':'co','type':'choice','stem':'用海明码对长度为 8 位的数据进行检/纠错时，若能纠正一位错，则校验位数至少为（　）。','opts':['2','3','4','5'],'ans':'C','book':'设校验位数为 r，能纠正一位错要求 2<sup>r</sup> ≥ 8 + r + 1。r=3 时 8 ≥ 12 不成立；r=4 时 16 ≥ 13 成立，所以至少 4 位。','claude':'','kp':['海明码校验位数']}}}
def clean(s):
    s=re.sub(r'^\s*【\s*20\d\d[^】]*】\s*','',s or '')
    s=re.sub(r'（★\s*本题考点已于[^）]*）\s*','',s)
    # 题库里给学习用的提示，模考时不该出现
    for key in ['提示：先写出这棵树','提示：判定树的结点数','提示：不要','⚠️ 本题的映射方式','注：HDLC 协议已从']:
        i=s.find(key)
        if i<0: continue
        a=s.rfind('<span',0,i); b=s.find('</span>',i)
        if a>=0 and b>=0: s=s[:a]+s[b+7:]
        else: s=s[:i]
        s=re.sub(r'(<br>\s*)+$','',s)
    s=s.replace('拓扑同 4.2 节 2016 真题的那张大图：','拓扑如题 41 图：')
    return s
LOCALFIG={
 'os:4.2-综11':'<figure class="fg"><img src="assets/exam/fig/2016_47.png" alt="目录树与簇号表"></figure>',
 'os:4.2-综15':'<figure class="fg"><img src="assets/exam/fig/2022_45a.png" alt="题 45(a) 图"></figure><table class="qtab"><tr><th>文件名</th><th>索引结点号</th><th>磁盘块号</th></tr><tr><td>stu</td><td>1</td><td>10</td></tr><tr><td>course</td><td>2</td><td>20</td></tr><tr><td>course1</td><td>10</td><td>30</td></tr><tr><td>course2</td><td>100</td><td>40</td></tr><tr><td>doc</td><td>10</td><td>x</td></tr></table>',
 'os:2.3-综26':'<figure class="fg"><img src="assets/exam/fig/2022_46.png" alt="题 46 图"></figure>',
}
FIG=lambda p:'../练习系统/'+p
def fig(src,cap):
    if not src: return ''
    return '<figure class="fg"><img src="%s" alt="" loading="lazy">%s</figure>'%(FIG(src),'<figcaption>%s</figcaption>'%cap if cap else '')
def pre(c): return '<pre>%s</pre>'%c.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
SCORES=json.load(open(os.path.join(HERE,'exam_scores.json')))
miss=[]
def build(y):
    s=SLOTS[str(y)]; qs=[]; fn={}
    for n in range(1,48):
        k=s.get(str(n)); q=B.get(k) if k else EXTRA.get(y,{}).get(n)
        if not q: raise SystemExit('缺题 %d-%d'%(y,n))
        st=q['stem'] if q is not None else ''
        if '本题考点已于' in st: fn[n]='考点已于 2021 年移出大纲'
        st=clean(st)
        for a,b in REWRITE.get(k,[]): 
            if a not in st: raise SystemExit('改写未命中 '+k)
            st=st.replace(a,b)
        code=q.get('code') if q.get('codeStem') else None
        h=st+(pre(code) if code else '')
        if k in LOCALFIG:
            h+=LOCALFIG[k]
        elif q.get('fig'):
            if not os.path.exists(os.path.join(PS,q['fig'])): miss.append((y,n,k,q['fig']))
            h+=fig(q['fig'],q.get('figcap'))
        sol=q.get('book') or ''
        if q.get('code') and not q.get('codeStem'): sol+=pre(q['code'])
        if q.get('figA'):
            if not os.path.exists(os.path.join(PS,q['figA'])): miss.append((y,n,k,q['figA']))
            sol+=fig(q['figA'],q.get('figAcap'))
        ch=q.get('type')=='choice'
        it={'no':n,'type':'choice' if ch else 'essay','score':2 if ch else SCORES[str(y)][str(n)],'subj':q['subj'],'stem':h,'sol':sol}
        if ch: it['opts']=q['opts']; it['ans']=q['ans']
        if q.get('claude'): it['more']=q['claude']
        if q.get('kp'): it['tag']='、'.join(q['kp'][:3])
        if k: it['src']=k
        qs.append(it)
    P={'year':y,'q':qs,'secName':{'choice':'一、单项选择题（每题 2 分，共 80 分）','essay':'二、综合应用题（共 70 分）'}}
    if fn: P['flagNote']=fn
    return P
os.makedirs(os.path.join(ROOT,'assets','exam'),exist_ok=True)
for y in range(2009,2026):
    P=build(y)
    t=sum(q['score'] for q in P['q'])
    assert t==150,(y,t)
    open(os.path.join(ROOT,'assets','exam','y%d.js'%y),'w',encoding='utf-8').write('(window.EXAM_PAPERS=window.EXAM_PAPERS||{})[%d]=%s;\n'%(y,json.dumps(P,ensure_ascii=False,separators=(',',':'))))
print('题图缺失',len(miss),miss)
