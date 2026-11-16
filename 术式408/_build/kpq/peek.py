import json,re,sys,html
y=int(sys.argv[1]); W=int(sys.argv[2]) if len(sys.argv)>2 else 90
def ld(p,k):
    s=open(p).read(); return json.loads(s[s.index('=',s.index('[%d]'%k))+1:].rstrip().rstrip(';'))
P=ld('assets/exam/y%d.js'%y,y); 
try: D=ld('assets/exam/deep/d%d.js'%y,y)['q']
except Exception: D={}
def T(s): return html.unescape(re.sub(r'<[^>]+>','',s or '')).replace('\n',' ')
for q in P['q']:
    d=D.get(str(q['no']),{})
    o=' | '.join(T(x)[:22] for x in q.get('opts',[]))
    print('#%d %s [%s] %s ⟪%s⟫ ans=%s'%(q['no'],q.get('subj'),d.get('link','')[:6],T(q['stem'])[:W],o,q.get('ans','')))
    print('   本质:',T(d.get('core',''))[:W+30])
