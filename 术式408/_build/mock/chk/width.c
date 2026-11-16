/* 模拟卷三 第 41 题：二叉树宽度（层序遍历按层计数）。与「递归按层计数」随机对拍。 */
#include <stdio.h>
#include <stdlib.h>
#define MAXN 256
typedef struct BiTNode { int data; struct BiTNode *lchild, *rchild; } BiTNode, *BiTree;
int Width(BiTree b){
    BiTree Q[MAXN]; int front = 0, rear = 0, last = 1, cnt = 0, max = 0;
    Q[rear++] = b;                       /* last 指向本层最后一个结点之后的位置 */
    while (front < rear) {
        BiTree p = Q[front++]; cnt++;
        if (p->lchild) Q[rear++] = p->lchild;
        if (p->rchild) Q[rear++] = p->rchild;
        if (front == last) {             /* 本层出队完毕 */
            if (cnt > max) max = cnt;
            cnt = 0; last = rear;
        }
    }
    return max;
}
static int lv[MAXN];
static void dfs(BiTree t, int d){ if (!t) return; lv[d]++; dfs(t->lchild, d + 1); dfs(t->rchild, d + 1); }
int main(void){
    srand(41); static BiTNode pool[MAXN];
    for (int t = 0; t < 200000; t++) {
        int n = 1 + rand() % 60;
        for (int i = 0; i < n; i++) { pool[i].lchild = pool[i].rchild = NULL; pool[i].data = i; }
        for (int i = 1; i < n; i++) {          /* 随机挂到前面某个结点的空位上 */
            for (;;) { int p = rand() % i, s = rand() % 2; BiTree *slot = s ? &pool[p].rchild : &pool[p].lchild;
                if (!*slot) { *slot = &pool[i]; break; } }
        }
        for (int i = 0; i < MAXN; i++) lv[i] = 0;
        dfs(&pool[0], 0); int ref = 0; for (int i = 0; i < MAXN; i++) if (lv[i] > ref) ref = lv[i];
        if (Width(&pool[0]) != ref) { printf("FAIL t=%d\n", t); return 1; }
    }
    puts("width: 200000 棵随机二叉树零失配");
    return 0;
}
