/* 算法题速成页的全部代码。页面里的代码由 build.py 从这里按 //@@ 标记抽出，别在页面上手改。
   编译并自测：gcc -O1 -o /tmp/algo algo.c && /tmp/algo */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MAXV 12
#define MAX_SIZE 64
typedef struct node { int data; struct node *link; } NODE, *PNODE;
typedef struct BiTNode { int weight; struct BiTNode *left, *right; } BiTNode, *BiTree;
typedef struct { int SqBiTNode[MAX_SIZE]; int ElemNum; } SqBiTree;
typedef struct { int numVertices, numEdges; char VerticesList[MAXV]; int Edge[MAXV][MAXV]; } MGraph;

//@@ s1
int findMissMin(int A[], int n) {            // 2018：找没出现过的最小正整数
    int i, *B = (int *)malloc(sizeof(int) * (n + 1));
    for (i = 0; i <= n; i++) B[i] = 0;       // 标记数组清零
    for (i = 0; i < n; i++)                  // 一遍扫描：只关心 1..n 的数
        if (A[i] >= 1 && A[i] <= n) B[A[i]] = 1;
    for (i = 1; i <= n; i++)                 // 再扫标记：第一个没标的就是答案
        if (B[i] == 0) break;
    free(B);
    return i;                                // 1..n 全出现过时 i 正好是 n+1
}
//@@end

//@@ s2a
int minDist(int A[], int n1, int B[], int n2, int C[], int n3) {   // 2020 保底解
    int i, j, k, d, min = 0x7fffffff;
    for (i = 0; i < n1; i++)                 // 三重循环：每个三元组都算一遍
        for (j = 0; j < n2; j++)
            for (k = 0; k < n3; k++) {
                d = abs(A[i] - B[j]) + abs(B[j] - C[k]) + abs(C[k] - A[i]);
                if (d < min) min = d;        // 打擂台，留最小的
            }
    return min;
}
//@@end

//@@ s2b
void calMulMax(int A[], int res[], int n) {  // 2025 保底解
    int i, j;
    for (i = 0; i < n; i++) {                // 对每个 A[i]
        res[i] = A[i] * A[0];
        for (j = 1; j < n; j++)              // 和每个 A[j] 乘一遍，打擂台
            if (A[i] * A[j] > res[i]) res[i] = A[i] * A[j];
    }
}
//@@end

//@@ s3
void delAbsDup(PNODE h, int n) {             // 2015：带头结点，|data| ≤ n
    int m, *B = (int *)malloc(sizeof(int) * (n + 1));
    PNODE p = h, r;                          // p 永远停在「待查结点」的前一个
    for (m = 0; m <= n; m++) B[m] = 0;
    while (p->link != NULL) {
        m = p->link->data > 0 ? p->link->data : -p->link->data;
        if (B[m] == 0) { B[m] = 1; p = p->link; }          // 第一次见：留下，p 前进
        else { r = p->link; p->link = r->link; free(r); }   // 见过：删掉，p 不动
    }
    free(B);
}
//@@end

//@@ s4a
int wplPre(BiTree t, int deep) {             // 2014：deep 是当前结点的深度（根为 0）
    if (t == NULL) return 0;                 // 空树贡献 0
    if (t->left == NULL && t->right == NULL) // 叶子：权值 × 深度
        return t->weight * deep;
    return wplPre(t->left, deep + 1) + wplPre(t->right, deep + 1);   // 左右相加
}
int WPL(BiTree root) { return wplPre(root, 0); }
//@@end

//@@ s4b
int pre;                                     // 中序遍历中「上一个访问到的值」
int inOrder(SqBiTree *T, int i) {            // 2022：下标 i 的左孩子 2i+1、右孩子 2i+2
    if (i >= T->ElemNum || T->SqBiTNode[i] == -1) return 1;   // 空树算 BST
    if (!inOrder(T, 2 * i + 1)) return 0;    // 左子树不是，整棵就不是
    if (T->SqBiTNode[i] <= pre) return 0;    // 中序必须严格递增
    pre = T->SqBiTNode[i];
    return inOrder(T, 2 * i + 2);
}
int isBST(SqBiTree *T) { pre = 0; return inOrder(T, 0); }     // 结点值全为正，pre 从 0 起
//@@end

//@@ s5a
int printVertices(MGraph G) {                // 2023：出度大于入度的顶点
    int i, j, out, in, cnt = 0;
    for (i = 0; i < G.numVertices; i++) {
        out = in = 0;
        for (j = 0; j < G.numVertices; j++) {
            out += G.Edge[i][j];             // 第 i 行的和 = 出度
            in  += G.Edge[j][i];             // 第 i 列的和 = 入度
        }
        if (out > in) { printf("%c ", G.VerticesList[i]); cnt++; }
    }
    return cnt;
}
//@@end

//@@ s5b
int IsExistEL(MGraph G) {                    // 2021：奇度顶点个数为 0 或 2
    int i, j, deg, odd = 0;
    for (i = 0; i < G.numVertices; i++) {
        deg = 0;
        for (j = 0; j < G.numVertices; j++) deg += G.Edge[i][j];   // 无向图：一行的和 = 度
        if (deg % 2 == 1) odd++;
    }
    return odd == 0 || odd == 2;
}
//@@end

//@@ s6
void insertSort(int A[], int n) {            // 工具：直接插入排序，升序
    int i, j, t;
    for (i = 1; i < n; i++) {
        t = A[i];
        for (j = i - 1; j >= 0 && A[j] > t; j--) A[j + 1] = A[j];   // 比 t 大的往后挪
        A[j + 1] = t;
    }
}
int majority(int A[], int n) {               // 2013 保底解：排序后，主元素一定压在正中间
    int i, c = 0, x;
    insertSort(A, n);
    x = A[n / 2];
    for (i = 0; i < n; i++) if (A[i] == x) c++;   // 再数一遍确认
    return c > n / 2 ? x : -1;
}
//@@end

/* ───────── 以下是自测，不进页面 ───────── */
static int rnd(int n) { return rand() % n; }
static int cmpi(const void *a, const void *b) { return *(int *)a - *(int *)b; }
static int minDistOpt(int A[], int n1, int B[], int n2, int C[], int n3) {
    int i = 0, j = 0, k = 0, min = 0x7fffffff;
    while (i < n1 && j < n2 && k < n3) {
        int d = abs(A[i] - B[j]) + abs(B[j] - C[k]) + abs(C[k] - A[i]);
        if (d < min) min = d;
        if (A[i] <= B[j] && A[i] <= C[k]) i++; else if (B[j] <= A[i] && B[j] <= C[k]) j++; else k++;
    }
    return min;
}
static int bstRange(SqBiTree *T, int i, int lo, int hi) {
    if (i >= T->ElemNum || T->SqBiTNode[i] == -1) return 1;
    int v = T->SqBiTNode[i];
    if (v <= lo || v >= hi) return 0;
    return bstRange(T, 2 * i + 1, lo, v) && bstRange(T, 2 * i + 2, v, hi);
}
static BiTree mk(int depth) {
    if (depth > 5 || rnd(4) == 0) return NULL;
    BiTree t = (BiTree)malloc(sizeof(BiTNode)); t->weight = 1 + rnd(20); t->left = mk(depth + 1); t->right = mk(depth + 1); return t;
}
static int wplLevel(BiTree t, int d) { if (!t) return 0; if (!t->left && !t->right) return t->weight * d; return wplLevel(t->left, d + 1) + wplLevel(t->right, d + 1); }
int main(void) {
    int T, i, j, bad = 0;
    srand(20261112);
    for (T = 0; T < 20000; T++) {
        int n = 1 + rnd(9), A[12], B[12], C[12], r1[12], seen[64] = {0}, x;
        for (i = 0; i < n; i++) { A[i] = rnd(14) - 3; if (A[i] > 0) seen[A[i]] = 1; }
        for (x = 1; seen[x]; x++);
        if (findMissMin(A, n) != x) bad++;
        /* 2025 */
        calMulMax(A, r1, n);
        { int mx = A[0], mn = A[0]; for (i = 1; i < n; i++) { if (A[i] > mx) mx = A[i]; if (A[i] < mn) mn = A[i]; }
          for (i = 0; i < n; i++) { int e = A[i] >= 0 ? A[i] * mx : A[i] * mn; if (A[i] * mn > e) e = A[i] * mn; if (A[i] * mx > e) e = A[i] * mx; if (e != r1[i]) bad++; } }
        /* 2020 */
        { int n2 = 1 + rnd(8), n3 = 1 + rnd(8);
          for (i = 0; i < n; i++) A[i] = rnd(60) - 30; for (i = 0; i < n2; i++) B[i] = rnd(60) - 30; for (i = 0; i < n3; i++) C[i] = rnd(60) - 30;
          qsort(A, n, 4, cmpi); qsort(B, n2, 4, cmpi); qsort(C, n3, 4, cmpi);
          if (minDist(A, n, B, n2, C, n3) != minDistOpt(A, n, B, n2, C, n3)) bad++; }
        /* 2013 */
        { int M[12], cnt[8] = {0}, exp = -1; for (i = 0; i < n; i++) { M[i] = rnd(3); cnt[M[i]]++; }
          for (i = 0; i < 3; i++) if (cnt[i] > n / 2) exp = i;
          if (majority(M, n) != exp) bad++; }
        /* 2015 */
        { int m = 6, len = rnd(10), keep[16], kn = 0, sb[8] = {0}; PNODE h = (PNODE)malloc(sizeof(NODE)), t = h, p;
          for (i = 0; i < len; i++) { int v = rnd(2 * m + 1) - m; p = (PNODE)malloc(sizeof(NODE)); p->data = v; t->link = p; t = p; if (!sb[abs(v)]) { sb[abs(v)] = 1; keep[kn++] = v; } }
          t->link = NULL; delAbsDup(h, m);
          for (p = h->link, i = 0; p; p = p->link, i++) if (i >= kn || keep[i] != p->data) bad++;
          if (i != kn) bad++; }
        /* 2014 */
        { BiTree t = mk(0); if (WPL(t) != wplLevel(t, 0)) bad++; }
        /* 2022 */
        { SqBiTree S; S.ElemNum = 1 + rnd(15);
          for (i = 0; i < S.ElemNum; i++) S.SqBiTNode[i] = (i > 0 && (S.SqBiTNode[(i - 1) / 2] == -1 || rnd(5) == 0)) ? -1 : 1 + rnd(30);
          if (rnd(2)) { /* 造一棵真 BST：按中序填递增值 */ int v = 1, st[64], sp = 0, c = 0;
            while (sp || (c < S.ElemNum && S.SqBiTNode[c] != -1)) { while (c < S.ElemNum && S.SqBiTNode[c] != -1) { st[sp++] = c; c = 2 * c + 1; } c = st[--sp]; S.SqBiTNode[c] = v; v += 1 + rnd(3); c = 2 * c + 2; } }
          if (isBST(&S) != bstRange(&S, 0, 0, 1 << 30)) bad++; }
        /* 2023 / 2021 */
        { MGraph G; int k = 0, odd = 0; G.numVertices = 1 + rnd(7);
          for (i = 0; i < G.numVertices; i++) { G.VerticesList[i] = 'a' + i; for (j = 0; j < G.numVertices; j++) G.Edge[i][j] = (i != j) && rnd(3) == 0; }
          for (i = 0; i < G.numVertices; i++) { int o = 0, in = 0; for (j = 0; j < G.numVertices; j++) { if (G.Edge[i][j]) o++; if (G.Edge[j][i]) in++; } if (o > in) k++; }
          freopen("/dev/null", "w", stdout); if (printVertices(G) != k) bad++; freopen("/dev/tty", "w", stdout);
          for (i = 0; i < G.numVertices; i++) for (j = 0; j < i; j++) G.Edge[i][j] = G.Edge[j][i];
          for (i = 0; i < G.numVertices; i++) { int d = 0; for (j = 0; j < G.numVertices; j++) d += G.Edge[i][j]; odd += d & 1; }
          if (IsExistEL(G) != (odd == 0 || odd == 2)) bad++; }
    }
    fprintf(stderr, bad ? "FAIL %d\n" : "OK 20000 rounds, 0 mismatch\n", bad);
    return bad != 0;
}
