/* 模拟卷一 第 41 题：三个递增无重复序列的公共元素。与暴力 O(n^3) 随机对拍。 */
#include <stdio.h>
#include <stdlib.h>
static int out[1000], no;
void Common3(int A[], int B[], int C[], int n){
    int i = 0, j = 0, k = 0;
    while (i < n && j < n && k < n) {
        if (A[i] == B[j] && B[j] == C[k]) { out[no++] = A[i]; i++; j++; k++; }
        else {
            int m = A[i];
            if (B[j] > m) m = B[j];
            if (C[k] > m) m = C[k];
            if (A[i] < m) i++;
            if (B[j] < m) j++;
            if (C[k] < m) k++;
        }
    }
}
static void gen(int *a, int n){ int v = rand() % 5 - 2; for (int i = 0; i < n; i++) { v += 1 + rand() % 3; a[i] = v; } }
int main(void){
    srand(408);
    for (int t = 0; t < 200000; t++) {
        int n = 1 + rand() % 12, A[16], B[16], C[16], ref[16], nr = 0;
        gen(A, n); gen(B, n); gen(C, n);
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) for (int k = 0; k < n; k++)
            if (A[i] == B[j] && B[j] == C[k]) ref[nr++] = A[i];
        no = 0; Common3(A, B, C, n);
        if (no != nr) { printf("FAIL count t=%d\n", t); return 1; }
        for (int i = 0; i < nr; i++) if (out[i] != ref[i]) { printf("FAIL t=%d\n", t); return 1; }
    }
    puts("common3: 200000 组随机对拍零失配");
    return 0;
}
