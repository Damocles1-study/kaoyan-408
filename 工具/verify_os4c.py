# -*- coding: utf-8 -*-
K,M,G,T = 1024,1024**2,1024**3,1024**4
ok=fail=0
def chk(n,g,w):
    global ok,fail
    if g==w: ok+=1; print(f"  ✅ {n}: {g}")
    else: fail+=1; print(f"  ❌ {n}: got {g}, book {w}")

print("=== 4.3 ===")
# 选10 位示图 8行32列 行列从1起 块号100
n=32; b=100
chk("选10 row", (b-1)//n+1, 4)
chk("选10 col", (b-1)%n+1, 4)
# 选13 2014 10GB分区 簇4KB 位图
clusters = 10*G//(4*K)
chk("选13 簇总数(M)", clusters//M, 2)      # 2.5M -> 打印
chk("选13 簇总数", clusters, int(2.5*M))
bits = clusters
chk("选13 位图字节(KB)", bits//8//K, 320)
chk("选13 位图占簇数", bits//8//(4*K), 80)
# 选14 2015 位图存于32~127号块 每块1024B 块号块内字节从0起 释放409612
blk = 32 + 409612//(1024*8)
byt = (409612 % (1024*8))//8
chk("选14 盘块号", blk, 82)
chk("选14 块内字节序号", byt, 1)
chk("选14 位号(对照,不是答案)", 409612 % 8, 12%8)
# 选16 2023 16GB内存 4KB页 位图
frames = 16*G//(4*K)
chk("选16 页框数", frames, 2**22)
chk("选16 位图(KB)", frames//8//K, 512)
# 综01 位示图16列 100柱面 20磁道 8扇区 全部从0起
per_cyl = 20*8
tot = 100*per_cyl
bad=0
for b in range(tot):
    i,j = b//16, b%16
    C = b//per_cyl; H = (b % per_cyl)//8; S = b % 8
    if i*16+j != b: bad+=1
    if C*20*8 + H*8 + S != b: bad+=1
chk("综01 公式双向往返一致(16000块全枚举)", bad, 0)
chk("综01 总块数", tot, 16000)
chk("综01 位示图需行数", -(-tot//16), 1000)
# 综02 100柱面 16磁道 4扇区 字长32 字号位号从1起
tot2 = 100*16*4
chk("综02-1 存储块数", tot2, 6400)
chk("综02-2 字数", tot2//32, 200)
chk("综02-3 第18字第16位块号", 32*(18-1)+16, 560)
# 4.3.2 成组链接 201~7999
lo,hi=201,7999
cnt = hi-lo+1
full, rem = divmod(cnt,100)
chk("成组链接 空闲块总数", cnt, 7799)
chk("成组链接 满组数", full, 77)
chk("成组链接 末组块数", rem, 99)
chk("成组链接 第一组", (lo, lo+99), (201,300))
chk("成组链接 次末组", (hi-rem-99, hi-rem), (7801,7900))
chk("成组链接 末组", (hi-rem+1, hi), (7901,7999))
print(f"\n小计 ok={ok} fail={fail}")
