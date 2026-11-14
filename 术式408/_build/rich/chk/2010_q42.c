/* 2010 第 42 题对拍主程序：q42_paper.c 由 2010.py 从精解卷面逐字抽出（ShiftByTemp、Reverse、Converse）。 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "q42_paper.c"

int main(void){
    srand(2010);
    int R[64], R2[64], B[64];
    long tests = 0;
    for(int t = 0; t < 200000; t++){
        int n = 2 + rand() % 60, p = 1 + rand() % (n - 1);
        for(int i = 0; i < n; i++) R[i] = rand() % 100 - 50;
        for(int i = 0; i < n; i++) B[i] = R[(i + p) % n];      /* 期望结果 */
        memcpy(R2, R, sizeof(int) * n);
        Converse(R, n, p);
        ShiftByTemp(R2, n, p);
        if(memcmp(R, B, sizeof(int) * n) || memcmp(R2, B, sizeof(int) * n)){
            printf("FAIL n=%d p=%d\n", n, p); return 1;
        }
        tests++;
    }
    printf("OK 20 万组随机 n∈[2,61]、p∈[1,n−1]：三次逆置与辅助数组解都等于 R[(i+p) mod n]（%ld）\n", tests);
    return 0;
}
