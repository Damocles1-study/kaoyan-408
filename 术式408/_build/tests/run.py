#!/usr/bin/env python3
# 把讲义中的 C 模板抽出来编译，并与朴素实现随机对拍
import re,os,subprocess,sys
H=os.path.dirname(os.path.abspath(__file__));S=os.path.join(H,'..','..','_src')
def block(ep,key):
    s=open(f'{S}/{ep}.txt',encoding='utf8').read()
    for m in re.finditer(r':::code c ([^\n]*)\n(.*?)\n:::',s,re.S):
        if key in m.group(1):return m.group(2)
    raise SystemExit('no block '+ep+key)
parts={k:block(*v) for k,v in {
 'sq':('02','顺序表的结构'),'rev':('02','逆置'),'del':('02','原地过滤'),'merge':('02','合并两个有序表'),'miss':('02','标记数组'),'maj':('02','投票法'),
 'lnode':('03','单链表结点'),'lrev':('03','头插法原地逆置'),'k':('03','倒数第 k'),
 'bt':('06','递归三行'),'lvl':('06','层序'),'ino':('06','中序非递归'),'wpl':('06','求 WPL'),
 'uf':('07','并查集'),'kmp':('05','求 next'),'bs':('12','折半'),'ins':('14','直接插入'),'qs':('14','快排划分'),'hs':('15','堆的下沉'),'ms':('15','模板：归并')}.items()}
src=r'''
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <vector>
#include <algorithm>
#include <cassert>
#include <string>
using namespace std;
namespace A{
PARTS_SQ
PARTS_REV
PARTS_DEL
PARTS_MERGE
PARTS_MISS
PARTS_MAJ
}
namespace B{
PARTS_LNODE
PARTS_LREV
PARTS_K
}
namespace C{
static vector<int> out; static int MaxSize_=2000;
#define MaxSize 2000
#undef MaxSize
void visit(struct BiTNode*);
#define visit(x) out.push_back((x)->data)
const int MaxSize=2000;
PARTS_BT
PARTS_LVL
PARTS_INO
struct WN{int weight;WN*left,*right;};
typedef WN* WBT;
#define BiTree WBT
PARTS_WPL
#undef BiTree
#undef visit
}
namespace D{ PARTS_UF }
namespace E{ PARTS_KMP }
namespace F{ PARTS_BS }
namespace G{ PARTS_INS
PARTS_QS
PARTS_HS
static int B[100005];
PARTS_MS }
int main(){
 srand(7);int n,cnt=0;
 for(int t=0;t<20000;t++){
  n=rand()%40+1;vector<int> v(n);for(auto&x:v)x=rand()%50-10;
  // 顺序表
  { A::SqList L;L.length=0;for(int x:v)A::ListInsert(L,L.length+1,x);vector<int> w=v;int i=rand()%n+1,e;A::ListDelete(L,i,e);assert(e==v[i-1]);w.erase(w.begin()+i-1);assert(L.length==(int)w.size());for(int j=0;j<L.length;j++)assert(L.data[j]==w[j]);
    int x=rand()%50-10;A::DelX(L,x);w.erase(remove(w.begin(),w.end(),x),w.end());assert(L.length==(int)w.size());for(int j=0;j<L.length;j++)assert(L.data[j]==w[j]);}
  // 逆置、循环左移
  { vector<int> a=v;int p=rand()%n;if(p>0)A::Reverse(a.data(),0,p-1);A::Reverse(a.data(),p,n-1);A::Reverse(a.data(),0,n-1);vector<int> w=v;rotate(w.begin(),w.begin()+p,w.end());assert(a==w);}
  // 合并
  { A::SqList P,Q,R;P.length=rand()%20;Q.length=rand()%20;for(int i=0;i<P.length;i++)P.data[i]=rand()%30;for(int i=0;i<Q.length;i++)Q.data[i]=rand()%30;sort(P.data,P.data+P.length);sort(Q.data,Q.data+Q.length);A::Merge(P,Q,R);vector<int> w(P.data,P.data+P.length);w.insert(w.end(),Q.data,Q.data+Q.length);sort(w.begin(),w.end());assert(R.length==(int)w.size()&&equal(w.begin(),w.end(),R.data));}
  // 缺失最小正整数
  { vector<int> a=v;int r=A::FindMissMin(a.data(),n);int m=1;while(find(v.begin(),v.end(),m)!=v.end())m++;assert(r==m);}
  // 主元素
  { vector<int> a(n);int c=rand()%3;for(auto&x:a)x=(rand()%3)?c:rand()%5;int r=A::Majority(a.data(),n);int ans=-1;for(int x=0;x<5;x++)if(count(a.begin(),a.end(),x)>n/2)ans=x;assert(r==ans);}
  // 链表
  { B::LNode H;H.next=NULL;B::LNode*tail=&H;for(int x:v){auto*p=(B::LNode*)malloc(sizeof(B::LNode));p->data=x;p->next=NULL;tail->next=p;tail=p;}
    B::Reverse(&H);vector<int> w;for(auto*p=H.next;p;p=p->next)w.push_back(p->data);vector<int> u=v;reverse(u.begin(),u.end());assert(w==u);
    int k=rand()%45+1;fflush(stdout);FILE*sv=stdout;stdout=fopen("/dev/null","w");int r=B::Search_k(&H,k);fclose(stdout);stdout=sv;assert(r==(k<=n));
    for(auto*p=H.next;p;){auto*q=p->next;free(p);p=q;}}
  // 排序
  { vector<int> s=v;sort(s.begin(),s.end());vector<int> a=v;G::InsertSort(a.data(),n);assert(a==s);a=v;G::QuickSort(a.data(),0,n-1);assert(a==s);a=v;G::MergeSort(a.data(),0,n-1);assert(a==s);
    vector<int> h(n+1);for(int i=0;i<n;i++)h[i+1]=v[i];G::HeapSort(h.data(),n);h.erase(h.begin());assert(h==s);}
  // 折半
  { vector<int> s=v;sort(s.begin(),s.end());int x=rand()%50-10;int r=F::BinSearch(s.data(),n,x);if(r>=0)assert(s[r]==x);else assert(!binary_search(s.begin(),s.end(),x));}
  // 并查集
  { int S[40];vector<int> nv(40);for(int i=0;i<40;i++){S[i]=-1;nv[i]=i;}for(int i=0;i<30;i++){int a=rand()%40,b=rand()%40;D::Union(S,a,b);int x=nv[a],y=nv[b];for(auto&z:nv)if(z==x)z=y;}for(int i=0;i<40;i++)for(int j=0;j<40;j++)assert((D::Find(S,i)==D::Find(S,j))==(nv[i]==nv[j]));}
  // KMP
  { string a,b;int la=rand()%30+1,lb=rand()%6+1;for(int i=0;i<la;i++)a+=char('a'+rand()%2);for(int i=0;i<lb;i++)b+=char('a'+rand()%2);string A1=" "+a,B1=" "+b;char sa[50],sb[20];strcpy(sa,A1.c_str());strcpy(sb,B1.c_str());int nx[20];E::get_next(sb,lb,nx);int r=E::KMP(sa,la,sb,lb,nx);size_t p=a.find(b);assert(r==(p==string::npos?0:(int)p+1));}
  // 树
  { vector<C::BiTNode> pool(n);for(int i=0;i<n;i++){pool[i].data=i;pool[i].lchild=2*i+1<n?&pool[2*i+1]:NULL;pool[i].rchild=2*i+2<n?&pool[2*i+2]:NULL;}
    function_like:;
    C::out.clear();C::LevelOrder(&pool[0]);vector<int> w(n);for(int i=0;i<n;i++)w[i]=i;assert(C::out==w);
    C::out.clear();C::InOrder2(&pool[0]);vector<int> io;struct R{static void f(C::BiTNode*p,vector<int>&o){if(!p)return;f(p->lchild,o);o.push_back(p->data);f(p->rchild,o);}};R::f(&pool[0],io);assert(C::out==io);
    C::out.clear();C::PreOrder(&pool[0]);assert((int)C::out.size()==n&&C::out[0]==0);
    vector<C::WN> wp(n);for(int i=0;i<n;i++){wp[i].weight=rand()%9;wp[i].left=2*i+1<n?&wp[2*i+1]:NULL;wp[i].right=2*i+2<n?&wp[2*i+2]:NULL;}
    int ww=0;for(int i=0;i<n;i++)if(2*i+1>=n){int d=0,j=i;while(j){j=(j-1)/2;d++;}ww+=wp[i].weight*d;}assert(C::WPL(&wp[0],0)==ww);}
  cnt++;
 }
 printf("OK %d rounds\n",cnt);
}
'''
for k,v in sorted(parts.items(),key=lambda x:-len(x[0])):src=src.replace('PARTS_'+k.upper(),v)
# 模板依赖
src=src.replace('#define MaxSize 2000\n#undef MaxSize\n','#undef MaxSize\n').replace('void visit(struct BiTNode*);\n','')
src=src.replace('function_like:;','')
out=os.environ.get('TMP_OUT','/tmp/sx408_t');open(out+'.cpp','w').write(src)
r=subprocess.run(['g++','-std=c++14','-w','-o',out,out+'.cpp'],capture_output=True,text=True)
print(r.stderr[:2500]);
if r.returncode==0:print(subprocess.run([out],capture_output=True,text=True,timeout=300))
