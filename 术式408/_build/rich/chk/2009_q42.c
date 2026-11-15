/* 2009 第 42 题对拍主程序：q42_paper.c 由 2009.py 从精解卷面逐字抽出（LNode 定义、Search_k、Search_k_twice）。
   卷面代码用 printf 输出 data，这里把 printf 换成「记下输出的值」以便比对。 */
#include <stdio.h>
#include <stdlib.h>
static int last_out, nprint;
#define printf(fmt, v) (last_out = (v), nprint++)
#include "q42_paper.c"
#undef printf

int main(void){
    srand(2009);
    LNode pool[64];
    int vals[64];
    long tests = 0;
    for(int t = 0; t < 200000; t++){
        int n = rand() % 61, k = 1 + rand() % 65;
        LNode head; head.link = NULL;
        LNode *tail = &head;
        for(int i = 0; i < n; i++){
            vals[i] = rand() % 1000 - 500;
            pool[i].data = vals[i]; pool[i].link = NULL;
            tail->link = &pool[i]; tail = &pool[i];
        }
        for(int which = 0; which < 2; which++){
            nprint = 0; last_out = 123456789;
            int r = which ? Search_k_twice(&head, k) : Search_k(&head, k);
            int expr = (k <= n);
            if(r != expr || nprint != expr || (expr && last_out != vals[n - k])){
                fprintf(stdout, "FAIL which=%d n=%d k=%d r=%d out=%d\n", which, n, k, r, last_out); return 1;
            }
        }
        /* 不改变链表：逐个检查结点值与链接 */
        LNode *p = head.link;
        for(int i = 0; i < n; i++){ if(p != &pool[i] || p->data != vals[i]){ puts("FAIL 链表被改动"); return 1; } p = p->link; }
        if(p != NULL){ puts("FAIL 表尾"); return 1; }
        tests++;
    }
    fprintf(stdout, "OK 20 万组随机表长 0～60、k＝1～65：一趟与两趟解的返回值、输出值都等于数组倒数第 k 个，链表未被改动（%ld）\n", tests);
    return 0;
}
