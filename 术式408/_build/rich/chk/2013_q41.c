/* 2013 第 41 题：主元素。两段卷面代码 + 两重循环暴力解随机对拍。由 chk/2013.py 编译运行。 */
#include <stdio.h>
#include <stdlib.h>

int Majority1(int A[], int n){
    int *cnt = (int *)malloc(sizeof(int) * n);  // cnt[x]：值 x 出现的次数
    int i, ans = -1;
    for(i = 0; i < n; i++) cnt[i] = 0;
    for(i = 0; i < n; i++) cnt[A[i]]++;         // 统计
    for(i = 0; i < n; i++)
        if(cnt[i] > n / 2){ ans = i; break; }   // 次数超过一半
    free(cnt);
    return ans;                                 // 不存在时为 -1
}

int Majority(int A[], int n){
    int i, c = A[0], cnt = 1;          // c：候选主元素；cnt：计数
    for(i = 1; i < n; i++){            // 第一趟：选出候选
        if(A[i] == c) cnt++;           // 与候选相同，计数加 1
        else if(cnt > 0) cnt--;        // 不同，抵消一个
        else { c = A[i]; cnt = 1; }    // 抵消光了，更换候选
    }
    cnt = 0;
    for(i = 0; i < n; i++)             // 第二趟：统计候选实际出现次数
        if(A[i] == c) cnt++;
    if(cnt > n / 2) return c;          // 超过一半才是主元素
    return -1;
}

static int brute(int A[], int n){
    int i, j, c;
    for(i = 0; i < n; i++){
        for(c = 0, j = 0; j < n; j++) if(A[j] == A[i]) c++;
        if(2 * c > n) return A[i];
    }
    return -1;
}

int main(void){
    int A[64], t, n, i, has = 0;
    int e1[8] = {0,5,5,3,5,7,5,5}, e2[8] = {0,5,5,3,5,1,5,7};
    if(Majority(e1, 8) != 5 || Majority1(e1, 8) != 5) { puts("FAIL e1"); return 1; }
    if(Majority(e2, 8) != -1 || Majority1(e2, 8) != -1) { puts("FAIL e2"); return 1; }
    srand(2013);
    for(t = 0; t < 200000; t++){
        n = 1 + rand() % 40;
        int k = 1 + rand() % (n < 4 ? n : 4);          /* 取值种类少，主元素才常出现 */
        for(i = 0; i < n; i++) A[i] = (rand() % 3 == 0) ? rand() % n : rand() % k;
        int b = brute(A, n);
        if(b >= 0) has++;
        if(Majority(A, n) != b || Majority1(A, n) != b){ printf("FAIL t=%d n=%d\n", t, n); return 1; }
    }
    printf("OK 200000 groups, %d with majority\n", has);
    return 0;
}
