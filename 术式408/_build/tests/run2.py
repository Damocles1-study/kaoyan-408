#!/usr/bin/env python3
# 扩写新增的矩阵模板：与朴素实现随机对拍
import re,os,subprocess,sys
H=os.path.dirname(os.path.abspath(__file__));S=os.path.join(H,'..','..','_src')
def block(ep,key):
    s=open(f'{S}/{ep}.txt',encoding='utf8').read()
    for m in re.finditer(r':::code c ([^\n]*)\n(.*?)\n:::',s,re.S):
        if key in m.group(1):return m.group(2)
    raise SystemExit('no block '+key)
src='#include <cstdio>\n#include <cstdlib>\n#include <cassert>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n#define MaxV 12\n'+block('09','邻接矩阵求入度')+'\n'+block('11','拓扑排序（邻接矩阵）')+r'''
int main(){srand(5);for(int t=0;t<200000;t++){MGraph G;int n=rand()%9+1;G.numV=n;int p=rand()%60;
 for(int i=0;i<n;i++)for(int j=0;j<n;j++)G.Edge[i][j]=(i!=j&&rand()%100<p);
 int in[MaxV],out[MaxV];Degree(&G,in,out);for(int i=0;i<n;i++){int a=0,b=0;for(int j=0;j<n;j++){a+=G.Edge[j][i];b+=G.Edge[i][j];}assert(a==in[i]&&b==out[i]);}
 int o[MaxV];int r=TopoSort(&G,o);
 // 朴素判环：传递闭包
 int R[MaxV][MaxV];for(int i=0;i<n;i++)for(int j=0;j<n;j++)R[i][j]=G.Edge[i][j];for(int k=0;k<n;k++)for(int i=0;i<n;i++)for(int j=0;j<n;j++)R[i][j]|=R[i][k]&&R[k][j];
 int cyc=0;for(int i=0;i<n;i++)cyc|=R[i][i];assert(r==!cyc);
 if(r){int pos[MaxV];for(int i=0;i<n;i++)pos[o[i]]=i;for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(G.Edge[i][j])assert(pos[i]<pos[j]);}
}puts("OK 200000 rounds");}
'''
out=os.environ.get('TMP_OUT','/tmp/sx408_t2');open(out+'.cpp','w').write(src)
r=subprocess.run(['g++','-std=c++14','-w','-o',out,out+'.cpp'],capture_output=True,text=True);print(r.stderr[:1500])
print(subprocess.run([out],capture_output=True,text=True).stdout)
