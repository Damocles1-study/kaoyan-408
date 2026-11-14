// 2011 第 42 题：两个等长升序序列 A、B，求合并后的中位数（第 n 小）。
// 精解卷面里的两段代码（MedianMerge / MedianBest）原样放在这里，下面是随机对拍。
// 编译运行：gcc -O2 -Wall -o q42 2011_q42.c && ./q42
#include <stdio.h>
#include <stdlib.h>

//BEGIN merge
int MedianMerge(int A[], int B[], int n){
    int i = 0, j = 0, k, x = 0;
    for(k = 1; k <= n; k++){            // 只取前 n 个，不真的合并
        if(A[i] <= B[j]) x = A[i++];    // 谁小取谁，取走后指针后移
        else x = B[j++];
    }
    return x;                           // 第 n 个被取走的就是中位数
}
//END merge

//BEGIN best
int MedianBest(int A[], int B[], int n){
    int s1 = 0, d1 = n - 1, s2 = 0, d2 = n - 1, m1, m2;
    while(s1 != d1 || s2 != d2){        // 两段都只剩 1 个元素时停
        m1 = (s1 + d1) / 2;             // A 当前段的中位数下标
        m2 = (s2 + d2) / 2;             // B 当前段的中位数下标
        if(A[m1] == B[m2]) return A[m1];
        if(A[m1] < B[m2]){              // 舍 A 的前半、B 的后半
            if((s1 + d1) % 2 == 0) s1 = m1;   // 段长为奇数：保留中间点
            else s1 = m1 + 1;                 // 段长为偶数：中间点也舍去
            d2 = m2;
        }else{                          // 舍 A 的后半、B 的前半
            d1 = m1;
            if((s2 + d2) % 2 == 0) s2 = m2;
            else s2 = m2 + 1;
        }
    }
    return A[s1] < B[s2] ? A[s1] : B[s2];     // 各剩 1 个，取较小者
}
//END best

static int cmp(const void *a, const void *b){ return *(const int *)a - *(const int *)b; }

int main(void){
    static int A[64], B[64], C[128];
    long cases = 0, eq = 0, dup = 0;
    srand(2011);
    for(int t = 0; t < 300000; t++){
        int n = 1 + rand() % 40, range = (t % 3 == 0) ? 6 : 1000;   // 三分之一的用例故意大量重复
        for(int i = 0; i < n; i++){ A[i] = rand() % range - range / 2; B[i] = rand() % range - range / 2; }
        qsort(A, n, sizeof(int), cmp); qsort(B, n, sizeof(int), cmp);
        for(int i = 0; i < n; i++){ C[i] = A[i]; C[n + i] = B[i]; }
        qsort(C, 2 * n, sizeof(int), cmp);
        int want = C[n - 1];                                         // 第 ⌈2n/2⌉ = n 个
        int r1 = MedianMerge(A, B, n), r2 = MedianBest(A, B, n);
        if(r1 != want || r2 != want){ printf("FAIL n=%d want=%d merge=%d best=%d\n", n, want, r1, r2); return 1; }
        cases++; if(n == 1) eq++; if(range == 6) dup++;
    }
    {   // 题干的例子：S1=(11,13,15,17,19)，S2=(2,4,6,8,20)，中位数 11
        int S1[] = {11, 13, 15, 17, 19}, S2[] = {2, 4, 6, 8, 20};
        if(MedianMerge(S1, S2, 5) != 11 || MedianBest(S1, S2, 5) != 11){ printf("FAIL sample\n"); return 1; }
    }
    printf("OK %ld cases (n=1: %ld, heavy-dup: %ld), sample -> 11\n", cases, eq, dup);
    return 0;
}
