# 从旧练习系统 data_*.js 按对象解析题目（无 node，用词法扫描解析 JS 对象字面量）
import re,os,json
D=os.path.join(os.path.dirname(__file__),'..','..','练习系统')
FILES={'ds':'data_ds.js','co':'data_co.js','os':'data_os.js','net':'data_net.js'}
def _str(s,i):
    q=s[i];i+=1;o=[]
    while s[i]!=q:
        if s[i]=='\\':
            c=s[i+1]
            o.append({'n':'\n','t':'\t','\\':'\\',"'":"'",'"':'"','`':'`','\n':''}.get(c,c)); i+=2
        else: o.append(s[i]); i+=1
    return ''.join(o),i+1
def _ws(s,i):
    while True:
        while s[i] in ' \t\r\n': i+=1
        if s.startswith('//',i): i=s.index('\n',i)
        elif s.startswith('/*',i): i=s.index('*/',i)+2
        else: return i
def _val(s,i):
    i=_ws(s,i);c=s[i]
    if c in '\'"`':
        v,i=_str(s,i);i=_ws(s,i)
        while s[i]=='+':
            i=_ws(s,i+1);w,i=_val(s,i);v+=w;i=_ws(s,i)
        return v,i
    if c=='{':
        i=_ws(s,i+1);o={}
        while s[i]!='}':
            if s[i] in '\'"': k,i=_str(s,i)
            else:
                m=re.compile(r'[\w$]+').match(s,i);k=m.group();i=m.end()
            i=_ws(s,i);i+=1
            o[k],i=_val(s,i);i=_ws(s,i)
            if s[i]==',':i=_ws(s,i+1)
        return o,i+1
    if c=='[':
        i=_ws(s,i+1);o=[]
        while s[i]!=']':
            v,i=_val(s,i);o.append(v);i=_ws(s,i)
            if s[i]==',':i=_ws(s,i+1)
        return o,i+1
    m=re.compile(r'[-\w.]+').match(s,i);t=m.group();i=m.end()
    return ({'true':True,'false':False,'null':None}.get(t,float(t) if re.fullmatch(r'-?\d+\.\d+',t) else int(t) if re.fullmatch(r'-?\d+',t) else t)),i
def load():
    B={}
    for k,f in FILES.items():
        s=open(os.path.join(D,f),encoding='utf8').read()
        for m in re.finditer(r"\{\s*id\s*:\s*['\"]",s):
            if s[:m.start()].rfind('/*')>s[:m.start()].rfind('*/'): continue
            try: o,_=_val(s,m.start())
            except Exception as e: print('ERR',k,s[m.start():m.start()+40],e);continue
            if 'stem' in o: B[k+':'+o['id']]=o
    return B
if __name__=='__main__':
    import sys
    B=load()
    pre=sys.argv[1];pat=sys.argv[2] if len(sys.argv)>2 else '';L=int(sys.argv[3]) if len(sys.argv)>3 else 150
    for k,q in B.items():
        if k.startswith(pre) and q.get('exam') and q['exam']<=2019 and re.search(pat,q.get('sec','')):
            cl=lambda x:re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',str(x)))
            st=re.sub(r'^【[^】]*】','',cl(q['stem']))[:L]
            print(k.split(':')[1],q['exam'],st,'|C:'+cl(q['code'])[:90] if q.get('code') and q.get('codeStem') or (q.get('code') and q['type']=='choice') else '',('|'+q.get('ans','')+':'+cl(q['opts']['ABCD'.index(q['ans'])] if q.get('opts') and q.get('ans') in list('ABCD') else '')[:50]) if q.get('ans') else '|SUBJ')
