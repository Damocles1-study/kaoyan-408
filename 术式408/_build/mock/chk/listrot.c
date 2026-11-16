/* 模拟卷二 第 41 题：不带头结点单链表循环右移 k 位。与数组模拟随机对拍。 */
#include <stdio.h>
#include <stdlib.h>
typedef struct LNode { int data; struct LNode *next; } LNode, *LinkList;
LinkList Rotate(LinkList L, int k){
    LNode *p = L, *tail, *newhead;
    int n = 1;
    while (p->next) { p = p->next; n++; }   /* p 停在尾结点，n 为表长 */
    tail = p;
    p = L;
    for (int i = 1; i < n - k; i++) p = p->next;   /* p 为第 n−k 个结点 */
    newhead = p->next;
    p->next = NULL;
    tail->next = L;
    return newhead;
}
int main(void){
    srand(2026);
    static LNode pool[64];
    for (int t = 0; t < 300000; t++) {
        int n = 2 + rand() % 40, k = 1 + rand() % (n - 1), a[64];
        for (int i = 0; i < n; i++) { a[i] = rand() % 1000; pool[i].data = a[i]; pool[i].next = i + 1 < n ? &pool[i + 1] : NULL; }
        LinkList h = Rotate(&pool[0], k);
        for (int i = 0; i < n; i++, h = h->next)
            if (!h || h->data != a[(i - k + n) % n]) { printf("FAIL t=%d\n", t); return 1; }
        if (h) { puts("FAIL tail"); return 1; }
    }
    puts("listrot: 300000 组随机对拍零失配");
    return 0;
}
