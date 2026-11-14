// 2012 第 42 题：两个带头结点的单链表，找共同后缀的起始结点。
// 精解卷面里的两段代码（FindBrute / FindCommon）原样放在这里，下面是随机对拍。
// 编译运行：gcc -O2 -Wall -o q42 2012_q42.c && ./q42
#include <stdio.h>
#include <stdlib.h>

typedef struct Node{
    char data;
    struct Node *next;
} Node, *LinkList;

//BEGIN brute
Node *FindBrute(LinkList str1, LinkList str2){
    Node *p, *q;
    for(p = str1->next; p != NULL; p = p->next)       // 表 1 的每个结点
        for(q = str2->next; q != NULL; q = q->next)   // 到表 2 里从头找
            if(p == q) return p;                      // 比的是结点地址，不是 data
    return NULL;                                      // 没有共同后缀
}
//END brute

//BEGIN best
int Length(LinkList L){                 // 求表长（不算头结点）
    int len = 0;
    Node *p = L->next;
    while(p != NULL){ len++; p = p->next; }
    return len;
}
Node *FindCommon(LinkList str1, LinkList str2){
    int m = Length(str1), n = Length(str2);
    Node *p = str1->next, *q = str2->next;
    for(; m > n; m--) p = p->next;      // 表 1 长：p 先走 m-n 步
    for(; n > m; n--) q = q->next;      // 表 2 长：q 先走 n-m 步
    while(p != NULL && p != q){         // 尾部对齐后齐步走
        p = p->next;
        q = q->next;
    }
    return p;                           // 第一个地址相同的结点；没有则为 NULL
}
//END best

static Node *mk(char c){ Node *x = (Node *)malloc(sizeof(Node)); x->data = c; x->next = NULL; return x; }

int main(void){
    srand(2012);
    long cases = 0, nul = 0, whole = 0;
    for(int t = 0; t < 200000; t++){
        int a = rand() % 7, b = rand() % 7, c = rand() % 6;   // 两段各自的前缀长 a、b，公共后缀长 c
        Node *h1 = mk('#'), *h2 = mk('#'), *t1 = h1, *t2 = h2, *first = NULL, *all[32]; int k = 0;
        all[k++] = h1; all[k++] = h2;
        for(int i = 0; i < a; i++){ t1->next = mk('a' + rand() % 3); t1 = t1->next; all[k++] = t1; }
        for(int i = 0; i < b; i++){ t2->next = mk('a' + rand() % 3); t2 = t2->next; all[k++] = t2; }  // data 故意大量重复
        Node *tail = NULL;
        for(int i = 0; i < c; i++){
            Node *x = mk('a' + rand() % 3); all[k++] = x;
            if(!first) first = x; else tail->next = x;
            tail = x;
        }
        t1->next = first; t2->next = first;
        Node *r1 = FindBrute(h1, h2), *r2 = FindCommon(h1, h2);
        if(r1 != first || r2 != first){ printf("FAIL a=%d b=%d c=%d\n", a, b, c); return 1; }
        cases++; if(!first) nul++; if(first && (a == 0 || b == 0)) whole++;
        for(int i = 0; i < k; i++) free(all[i]);
    }
    // 题干的例子：loading 与 being 共享 ing
    {
        const char *s1 = "load", *s2 = "be", *s3 = "ing";
        Node *h1 = mk('#'), *h2 = mk('#'), *t1 = h1, *t2 = h2, *first = NULL, *tail = NULL;
        for(const char *c = s1; *c; c++){ t1->next = mk(*c); t1 = t1->next; }
        for(const char *c = s2; *c; c++){ t2->next = mk(*c); t2 = t2->next; }
        for(const char *c = s3; *c; c++){ Node *x = mk(*c); if(!first) first = x; else tail->next = x; tail = x; }
        t1->next = first; t2->next = first;
        Node *r = FindCommon(h1, h2);
        if(r != first || r->data != 'i' || FindBrute(h1, h2) != first || Length(h1) != 7 || Length(h2) != 5){ printf("FAIL sample\n"); return 1; }
    }
    printf("OK %ld cases (no-suffix %ld, one-list-is-suffix %ld), sample loading/being -> i\n", cases, nul, whole);
    return 0;
}
