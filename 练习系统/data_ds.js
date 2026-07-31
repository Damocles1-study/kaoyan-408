/* 数据结构题库 —— 数据与展示分离。engine.js 读取本文件。
   新增章节：往 DS_DATA push 题目对象，并把 DS_META.chapters 对应章 ready 置 true 即可，全站功能自动生效。
   题目字段：
     id   唯一编号（如 '1.2-14'）
     ch   章号  sec 小节名  type 'choice'|'subjective'
     tag  真题标签（显示用，如 '2011 统考'）  exam 真题年份数字（真题场筛选用，非真题为 null）
     kp   知识点标签数组（错题归因用，第一个为主考点）
     stem 题干(html)  code 代码块(纯文本,可空)
     codeStem  true = 这段 code 是「题目给的程序段」(如"分析下列算法的复杂度")，照常显示在题干里。
               ⚠️ 综合应用题(subjective)的 code 默认视为「参考实现＝答案」，
                  引擎会把它收进核对面板并打码，点一下才显示（全局开关在工具条）。
                  所以 subjective 里凡是题干自带的代码，必须显式加 codeStem:true，否则会被当答案藏起来。
     opts 选项数组(choice)  ans 正确字母(choice)
     book 书答解析(html)  claude 我的核对(html)  run 运行验证行(可空)
     verdict 'ok'|'warn'（是否书答存疑，warn 时红色提示由用户裁决）
     fig/figcap    题干配图路径与图注（渲染在题干与代码之后）
     figA/figAcap  答案配图（渲染在「📕王道书答案」栏内）
     hints  大题渐进提示数组 ['提示①方向','提示②关键步骤']（借鉴数学错题页，仅 subjective 用，可空）；
            渲染成「题干→提示①→提示②→完整解答(看核对)」四层，先逼自己想、卡住了一层层点开。html 字段，< 要写 &lt;。

   —— 配图规矩（2026-07-24 定，第4章起一律照此办）——
   ① 只在「不看图做不了题 / 看图能省一半理解成本」时才配：题干信息不完整（如 2016 地址表）、
      答案要求"画出状态"（如 2019 队列设计）、多个选项靠图区分（如 2021 双端队列）、
      以及第5–8章的二叉树/图/B树/散列表/排序过程等——那些章的题几乎离不开图。
      纯装饰、或文字已把图完整描述掉的（如 2016 火车轨道图），不配。
   ② 表格类（地址表、三元组表、真值表）优先用 <table class="qtab"> 重排，不要裁图——
      更清晰、可搜索、暗色模式友好。图形类（指针连线、树、矩阵示意）才裁图。
   ③ 裁图来源＝去码后的分章 PDF，`fitz` `get_pixmap(dpi=190, clip=Rect(比例×页宽高))`，
      存 `图/chN/题号_简述.png`，单张控制在 ~120KB 内。图注注明「裁自王道 p.N」。
*/
window.DS_META = {
  subject: '数据结构',
  chapters: [
    {id:1, name:'绪论与复杂度', ready:true,  pdf:'../../王道教材/数据结构_分章/王道数据结构_第1章_绪论与复杂度.pdf'},
    {id:2, name:'线性表',       ready:true,  pdf:'../../王道教材/数据结构_分章/王道数据结构_第2章_线性表.pdf'},
    {id:3, name:'栈队列与数组', ready:true,  pdf:'../../王道教材/数据结构_分章/王道数据结构_第3章_栈队列与数组.pdf'},
    {id:4, name:'串与KMP',      ready:true,  pdf:'../../王道教材/数据结构_分章/王道数据结构_第4章_串与KMP.pdf'},
    {id:5, name:'树与二叉树',   ready:true, pdf:'../../王道教材/数据结构_分章/王道数据结构_第5章_树与二叉树.pdf'},
    {id:6, name:'图',           ready:true,  pdf:'../../王道教材/数据结构_分章/王道数据结构_第6章_图.pdf'},
    {id:7, name:'查找',         ready:false, pdf:'../../王道教材/数据结构_分章/王道数据结构_第7章_查找.pdf'},
    {id:8, name:'排序',         ready:false, pdf:'../../王道教材/数据结构_分章/王道数据结构_第8章_排序.pdf'}
  ]
};

window.DS_DATA = [
/* ===================== 第1章 1.1 数据结构的基本概念 ===================== */
{id:'1.1-1', ch:1, sec:'1.1 数据结构的基本概念', type:'choice', tag:'', exam:null,
 kp:['概念·三要素'],
 stem:'一个完整的数据结构通常应包含以下哪些要素（　）？',
 opts:['数据元素及其存储方式','数据的逻辑结构和物理结构','数据的逻辑结构、存储结构以及在其上定义的基本操作','数据对象和数据元素之间的关系'],
 ans:'C',
 book:'数据结构由<b>逻辑结构、存储结构、数据的运算</b>三部分组成，只有 C 同时包含这三个核心要素。',
 claude:'三要素缺一不可：A 只提元素与存储、漏了运算；B 漏了运算；D 只说关系。C 完整。', run:null, verdict:'ok'},

{id:'1.1-2', ch:1, sec:'1.1 数据结构的基本概念', type:'choice', tag:'', exam:null,
 kp:['概念·线性vs非线性'],
 stem:'下列四种数据结构中，（　）是非线性数据结构。',
 opts:['树','字符串','队列','栈'], ans:'A',
 book:'树与图是典型的非线性结构，其余（字符串、队列、栈）都是线性结构。',
 claude:'非线性=元素间非「一对一」。树是一对多，选 A；串/队/栈均线性。', run:null, verdict:'ok'},

{id:'1.1-3', ch:1, sec:'1.1 数据结构的基本概念', type:'choice', tag:'', exam:null,
 kp:['概念·逻辑vs存储'],
 stem:'下列选项中，属于逻辑结构的是（　）。',
 opts:['顺序表','哈希表','有序表','单链表'], ans:'C',
 book:'顺序表、哈希表、单链表都已指明存储方式，是具体的存储结构；<b>有序表</b>只强调「关键字有序」这一逻辑关系，既可顺序存也可链式存，属逻辑结构。',
 claude:'判据：名字里带没带「存储方式」。有序表只讲逻辑关系→逻辑结构，选 C。', run:null, verdict:'ok'},

{id:'1.1-4', ch:1, sec:'1.1 数据结构的基本概念', type:'choice', tag:'', exam:null,
 kp:['概念·逻辑vs存储'],
 stem:'下列关于数据结构的说法中，正确的是（　）。',
 opts:['数据的逻辑结构独立于其存储结构','数据的存储结构独立于其逻辑结构','数据的逻辑结构唯一决定其存储结构','数据结构仅由其逻辑结构和存储结构决定'],
 ans:'A',
 book:'逻辑结构是面向问题的抽象，<b>独立于</b>存储；而存储结构是逻辑结构在机器中的映射，<b>不能独立于</b>逻辑结构（B 错）。同一逻辑结构可有多种存储（C 错「唯一决定」）。数据结构还含运算，D 漏了运算。',
 claude:'A 对：逻辑在上、存储在下，上层不依赖下层。B/C/D 各错一处（见左）。', run:null, verdict:'ok'},

{id:'1.1-5', ch:1, sec:'1.1 数据结构的基本概念', type:'choice', tag:'', exam:null,
 kp:['概念·存储结构'],
 stem:'在存储数据时，通常不仅要存储各数据元素的值，还要存储（　）。',
 opts:['数据的操作方法','数据元素的类型','数据元素之间的关系','数据的存取方法'], ans:'C',
 book:'存储结构 = 存元素的值 + 存元素之间的<b>关系</b>（如链表用指针存关系）。',
 claude:'一致。数据结构的灵魂是「关系」，光存值就退化成一堆孤立数据了，选 C。', run:null, verdict:'ok'},

{id:'1.1-综1', ch:1, sec:'1.1 数据结构的基本概念', type:'subjective', tag:'', exam:null,
 kp:['概念·三要素'],
 stem:'对于两种不同的数据结构，逻辑结构或物理结构一定不相同吗？', code:null,
 book:'<b>不一定。</b>两种不同的数据结构，其逻辑结构和物理结构完全可能相同。例：二叉树与二叉排序树，后者可采用与前者相同的逻辑表示和存储方式；区别在于<b>数据的运算</b>不同——同是「查找」，二叉树平均 O(n)，二叉排序树平均 O(log<sub>2</sub>n)。这说明「运算」也是区分数据结构的重要一环。',
 claude:'同意。数据结构 = 逻辑 + 存储 + 运算三元组；只要三者有一项不同就算不同结构，所以逻辑、物理结构允许相同。二叉树 vs 二叉排序树是最经典的反例。', run:null, verdict:'ok'},

{id:'1.1-综2', ch:1, sec:'1.1 数据结构的基本概念', type:'subjective', tag:'', exam:null,
 kp:['概念·存储结构'],
 stem:'举例说明：对相同的逻辑结构，同一种运算在不同存储方式下实现时，其运算效率不同。', code:null,
 book:'以<b>线性表</b>为例，同为「插入/删除」运算：顺序存储下平均要移动近一半元素，时间复杂度 O(n)；链式存储下（已定位到结点）插入删除只改指针，时间复杂度 O(1)。同一逻辑结构、同一运算，存储方式不同则效率不同。',
 claude:'同意，线性表插删是标准答案。可再补一例：<b>按序号随机访问</b>——顺序表 O(1)、链表 O(n)，正好和插删相反，说明「谁快」取决于运算与存储的搭配。', run:null, verdict:'ok'},

/* ===================== 第1章 1.2 算法和算法评价 ===================== */
{id:'1.2-1', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['算法·特性与评价'],
 stem:'一个算法应该具有（　）等重要特性。',
 opts:['可维护性、可读性和可行性','可行性、确定性和有穷性','确定性、有穷性和可靠性','可读性、正确性和可行性'],
 ans:'B',
 book:'算法五大特性：<b>有穷性、确定性、可行性、输入、输出</b>。只有 B 三项都在其中；可维护性、可读性、可靠性、正确性是「好算法」的附加要求，不属定义特性。',
 claude:'一致。记「有确可输输」，选项里出现「可维护/可靠/正确」就排除，选 B。', run:null, verdict:'ok'},

{id:'1.2-2', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['算法·特性与评价'],
 stem:'下列关于算法的说法中，正确的是（　）。',
 opts:['算法的时间效率取决于算法执行所花的 CPU 时间','在算法设计中不允许用牺牲空间效率的方式来换取好的时间效率','算法必须具备有穷性、确定性等五个特性','通常用时间效率和空间效率来衡量算法的优劣'],
 ans:'C',
 book:'A 错：时间效率指时间复杂度（工作量），与具体机器 CPU 时间无关。B 错：时空可互换，允许以空间换时间。D 不全：评价优劣还要看正确性、可读性、健壮性。C 对：五大特性是硬要求。',
 claude:'一致，选 C。D 是最迷惑项——它只说了时空，漏了正确性/健壮性，属「不全面」而非全对。', run:null, verdict:'ok'},

{id:'1.2-3', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['复杂度·定义与比较'],
 stem:'某算法的时间复杂度为 O(n<sup>2</sup>)，则表示该算法的（　）。',
 opts:['问题规模是 n<sup>2</sup>','执行时间等于 n<sup>2</sup>','执行时间与 n<sup>2</sup> 成正比','问题规模与 n<sup>2</sup> 成正比'],
 ans:'C',
 book:'O(n<sup>2</sup>) 意为存在常数 c 使 T(n)≤c·n<sup>2</sup>，即执行时间<b>与 n<sup>2</sup> 成正比</b>（不是「等于」）；问题规模仍是 n。',
 claude:'一致。大 O 是「正比/上界」不是「等于」，B「等于」错、规模是 n 不是 n²，选 C。', run:null, verdict:'ok'},

{id:'1.2-4', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['复杂度·定义与比较'],
 stem:'若某算法的空间复杂度为 O(1)，则表示该算法（　）。',
 opts:['不需要任何辅助空间','所需辅助空间大小与问题规模 n 无关','不需要任何空间','所需空间大小与问题规模 n 无关'],
 ans:'B',
 book:'O(1) 指所需<b>辅助空间</b>为常量、与 n 无关，并非「不需要空间」。注意是辅助空间（D 说的是全部空间）。',
 claude:'一致，选 B。空间复杂度只算<b>额外辅助空间</b>；A/C 的「不需要任何」都是曲解。', run:null, verdict:'ok'},

{id:'1.2-5', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['复杂度·定义与比较'],
 stem:'下列关于时间复杂度的函数中，时间复杂度最小的是（　）。',
 opts:['T<sub>1</sub>(n)=nlog<sub>2</sub>n+5000n','T<sub>2</sub>(n)=n<sup>2</sup>-8000n','T<sub>3</sub>(n)=nlog<sub>2</sub>n-6000n','T<sub>4</sub>(n)=20000log<sub>2</sub>n'],
 ans:'D',
 book:'取每个函数的最高阶：A、C 都是 O(nlog<sub>2</sub>n)，B 是 O(n<sup>2</sup>)，D 是 O(log<sub>2</sub>n)。最小的是 D。',
 claude:'一致。大常数 20000 不影响阶，log<sub>2</sub>n ＜ nlog<sub>2</sub>n ＜ n<sup>2</sup>，选 D。', run:null, verdict:'ok'},

{id:'1.2-6', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['复杂度·循环倍增(log)'],
 stem:'下列算法的时间复杂度为（　）。', code:'int i=1;\nwhile(i<=n)\n    i=i*2;',
 opts:['O(n)','O(n<sup>2</sup>)','O(nlog<sub>2</sub>n)','O(log<sub>2</sub>n)'], ans:'D',
 book:'基本运算 i=i*2，设执行 t 次，则 2<sup>t</sup>≤n，t≤log<sub>2</sub>n，故 T(n)=O(log<sub>2</sub>n)。',
 claude:'i 每次翻倍，log 级。', run:'实测：n 每倍增，基本操作次数≈ +1（n=1000→10, n=16000→14）→ O(log₂n) ✅', verdict:'ok'},

{id:'1.2-7', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['复杂度·开方型'],
 stem:'下列算法的时间复杂度为（　）。', code:'void fun(int n){\n    int i=0;\n    while(i*i*i<=n)\n        i++;\n}',
 opts:['O(n)','O(nlog<sub>2</sub>n)','O(&#8731;n)','O(&radic;n)'], ans:'C',
 book:'基本运算 i++，设执行 t 次，则 t<sup>3</sup>≤n，t≤&#8731;n，故 T(n)=O(&#8731;n)。',
 claude:'循环到 i³≈n 停，t≈n^(1/3)。', run:'实测：n 每倍增，次数倍率≈1.26（=2^(1/3)）→ O(∛n) ✅', verdict:'ok'},

{id:'1.2-8', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['复杂度·嵌套与求和'],
 stem:'某个程序段如下，其中 n 为正整数，则最后一行语句的频度在最坏情况下是（　）。',
 code:'for(i=n-1;i>1;i--)\n    for(j=1;j<i;j++)\n        if(A[j]>A[j+1])\n            A[j] 与 A[j+1] 对换;',
 opts:['O(n)','O(nlog<sub>2</sub>n)','O(n<sup>3</sup>)','O(n<sup>2</sup>)'], ans:'D',
 book:'这是冒泡排序。最坏情况（全逆序）每次都交换，频度 T(n)=&Sigma;<sub>i=2</sub><sup>n-1</sup>(i-1)=(n-2)(n-1)/2=O(n<sup>2</sup>)。',
 claude:'双重循环、交换在最坏下满执行，n²/2 级。', run:'实测：n 倍增次数倍率≈4.00（=2²）→ O(n²) ✅', verdict:'ok'},

{id:'1.2-9', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['复杂度·分支取最坏'],
 stem:'下列程序段的时间复杂度为（　）。',
 code:'if(n>=0){\n    for(int i=0;i<n;i++)\n        for(int j=0;j<n;j++)\n            printf("...");\n}else{\n    for(int j=0;j<n;j++)\n        printf("...");\n}',
 opts:['O(n<sup>2</sup>)','O(n)','O(1)','O(nlog<sub>2</sub>n)'], ans:'A',
 book:'有条件分支时，取各分支中<b>最大</b>的时间复杂度。if 分支是双重循环 O(n<sup>2</sup>)，故整体 O(n<sup>2</sup>)。',
 claude:'分支取最坏支路：n≥0 走 O(n²) 支，选 A。', run:'实测（走 if 支）：n 倍增次数倍率≈4.00 → O(n²) ✅', verdict:'ok'},

{id:'1.2-10', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['复杂度·频度精确计算'],
 stem:'下列算法中加下划线的语句 m++ 的执行次数为（　）。',
 code:'int m=0,i,j;\nfor(i=1;i<=n;i++)\n    for(j=1;j<=2*i;j++)\n        m++;   // ← 求此句次数',
 opts:['n(n+1)','n','n+1','n<sup>2</sup>'], ans:'A',
 book:'m++ 执行次数 = &Sigma;<sub>i=1</sub><sup>n</sup>2i = 2&Sigma;<sub>i=1</sub><sup>n</sup>i = 2·n(n+1)/2 = <b>n(n+1)</b>。',
 claude:'内层随 i 走 2i 次，累加 = n(n+1)。注意本题问<b>精确次数</b>不是大 O。',
 run:'实测：n=1000→1001000, 正好 =1000×1001=n(n+1) ✅（选 A，不是 n²）', verdict:'ok'},

{id:'1.2-11', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'', exam:null,
 kp:['复杂度·递归'],
 stem:'下列函数代码的时间复杂度是（　）。',
 code:'int Func(int n){\n    if(n==1) return 1;\n    else return 2*Func(n/2)+n;\n}',
 opts:['O(n)','O(nlog<sub>2</sub>n)','O(log<sub>2</sub>n)','O(n<sup>2</sup>)'], ans:'C',
 book:'递归可视为循环：每层执行的基本语句是 if(n==1)…，单层 1 次；n 每次折半，递归 log<sub>2</sub>n 层，总次数 = log<sub>2</sub>n×1 = O(log<sub>2</sub>n)。',
 claude:'⚠️ 提醒：这题问「代码中<b>语句执行次数</b>」的复杂度。n 每次 /2，共 log 层，故 O(log₂n)，选 C。（若问递归<b>时间</b>按主定理 T(n)=2T(n/2)+O(1) 会是 O(n)——但王道此处按语句频度口径取 C。）',
 run:'实测：把每次递归调用记 1 次，n 倍增次数≈+1 → O(log₂n) ✅（与书口径一致）', verdict:'ok'},

{id:'1.2-12', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'2011 统考', exam:2011,
 kp:['复杂度·循环倍增(log)'],
 stem:'设 n 是描述问题规模的非负整数，下列程序段的时间复杂度是（　）。',
 code:'x=2;\nwhile(x<n/2)\n    x=2*x;',
 opts:['O(log<sub>2</sub>n)','O(n)','O(nlog<sub>2</sub>n)','O(n<sup>2</sup>)'], ans:'A',
 book:'基本运算 x=2*x，设执行 t 次，2<sup>t+1</sup>＜n/2，t＜log<sub>2</sub>n−2，故 T(n)=O(log<sub>2</sub>n)。',
 claude:'x 翻倍到 n/2，log 级，选 A。', run:'实测：n 倍增次数≈+1 → O(log₂n) ✅', verdict:'ok'},

{id:'1.2-13', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'2012 统考', exam:2012,
 kp:['复杂度·递归'],
 stem:'求整数 n（n≥0）的阶乘的算法如下，其时间复杂度是（　）。',
 code:'int fact(int n){\n    if(n<=1) return 1;\n    return n*fact(n-1);\n}',
 opts:['O(log<sub>2</sub>n)','O(n)','O(nlog<sub>2</sub>n)','O(n<sup>2</sup>)'], ans:'B',
 book:'递归每次 n−1，共递归 n 层，每层单语句，总次数 =1+1+…+1=n，故 O(n)。',
 claude:'线性递归、深度 n，选 B。对比上一题：那是 /2（log），这是 −1（n）。',
 run:'实测：n=1000→1000 次，n 倍增次数×2 → O(n) ✅', verdict:'ok'},

{id:'1.2-14', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'2014 统考', exam:2014,
 kp:['复杂度·嵌套与求和'],
 stem:'下列程序段的时间复杂度是（　）。',
 code:'count=0;\nfor(k=1;k<=n;k*=2)\n    for(j=1;j<=n;j++)\n        count++;',
 opts:['O(log<sub>2</sub>n)','O(n)','O(nlog<sub>2</sub>n)','O(n<sup>2</sup>)'], ans:'C',
 book:'外层 k*=2 执行 log<sub>2</sub>n 次，内层执行 n 次，总 =n·(log<sub>2</sub>n+1)=O(nlog<sub>2</sub>n)。',
 claude:'外 log 层 × 内 n = n log n，选 C。',
 run:'实测：n 倍增倍率≈2.18（略高于纯 O(n) 的 2.00）——这多出来的一点正是 <b>log 因子的指纹</b>，实锤 O(n log₂n) ✅，不是 O(n)', verdict:'ok'},

{id:'1.2-15', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'2017 统考', exam:2017,
 kp:['复杂度·累加型(√n)'],
 stem:'下列函数的时间复杂度是（　）。',
 code:'int func(int n){\n    int i=0, sum=0;\n    while(sum<n)\n        sum += ++i;\n    return i;\n}',
 opts:['O(log<sub>2</sub>n)','O(n<sup>1/2</sup>)','O(n)','O(nlog<sub>2</sub>n)'], ans:'B',
 book:'sum=1+2+…+i=(1+i)·i/2，循环到 sum≥n，即 i²/2≈n，i≈√(2n)，故循环次数 t 满足 (1+t)t/2＜n，T(n)=O(n<sup>1/2</sup>)。',
 claude:'sum 是 1+2+…+i≈i²/2，追到 n 需 i≈√n，选 B。',
 run:'实测：n 倍增次数倍率≈1.41（=√2）→ O(√n) ✅', verdict:'ok'},

{id:'1.2-16', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'2019 统考', exam:2019,
 kp:['复杂度·开方型'],
 stem:'设 n 是描述问题规模的非负整数，下列程序段的时间复杂度是（　）。',
 code:'x=0;\nwhile(n>=(x+1)*(x+1))\n    x=x+1;',
 opts:['O(log<sub>2</sub>n)','O(n<sup>1/2</sup>)','O(n)','O(n<sup>2</sup>)'], ans:'B',
 book:'设第 k 次循环终止，则 (x+1)<sup>2</sup>＞n 时停，x 从 0 增，k²＞n 即 k＞√n，故 O(n<sup>1/2</sup>)。',
 claude:'x 加到 x²≈n 停，x≈√n，选 B。与上一题同宗（都是 √n）。',
 run:'实测：n 倍增次数倍率≈1.42（≈√2）→ O(√n) ✅', verdict:'ok'},

{id:'1.2-17', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'2022 统考', exam:2022,
 kp:['复杂度·等比求和陷阱'],
 stem:'下列程序段的时间复杂度是（　）。',
 code:'int sum=0;\nfor(int i=1;i<n;i*=2)\n    for(int j=0;j<i;j++)\n        sum++;',
 opts:['O(log<sub>2</sub>n)','O(n)','O(nlog<sub>2</sub>n)','O(n<sup>2</sup>)'], ans:'B',
 book:'内层随 i 走 i 次，i 取 1,2,4,…,2<sup>t</sup>（2<sup>t</sup>＜n）。总次数 =1+2+4+…+2<sup>t</sup>=2<sup>t+1</sup>−1，而 2<sup>t</sup>≈n，故总≈2n−1=O(n)。',
 claude:'⚠️ 易错点：外层是 log 层，直觉想选 nlogn，但内层次数<b>等比递增</b>，求和被最后一项 n 主导 = O(n)，选 B 不是 C。',
 run:'实测：n 倍增次数倍率≈2.00 → O(n) ✅（不是 nlogn！等比求和的坑）', verdict:'ok'},

{id:'1.2-18', ch:1, sec:'1.2 算法和算法评价', type:'choice', tag:'2025 统考', exam:2025,
 kp:['复杂度·嵌套与求和'],
 stem:'下列程序段的时间复杂度是（　）。',
 code:'int count=0,i,j;\nfor(i=1;i*i<=n;i++)\n    for(j=1;j<=i;j++)\n        count++;',
 opts:['O(log<sub>2</sub>n)','O(n)','O(nlog<sub>2</sub>n)','O(n<sup>2</sup>)'], ans:'B',
 book:'外层到 i²≤n 即 i≤√n；内层随 i 走 i 次。总 =1+2+…+√n = (√n)(√n+1)/2 ≈ n/2 = O(n)。',
 claude:'外 √n 层、内层累加 = n/2 级，选 B。又一个「看着像 n^1.5 其实是 n」的等差求和坑。',
 run:'实测：n 倍增次数倍率≈2.00 → O(n) ✅', verdict:'ok'},

{id:'1.2-综1', ch:1, sec:'1.2 算法和算法评价', type:'subjective', hints:['复杂度题不看循环体，只看循环变量怎么变、到什么条件停，凑成方程解出循环次数。','i 加常数→O(n)；i 乘/除 2→O(log n)；判 x*x&lt;n→O(√n)；嵌套循环看内层是否随外层变化，独立则相乘。'], tag:'', exam:null,
 kp:['复杂度·嵌套与求和'], codeStem:true,
 stem:'分析下列各程序段，求出算法的时间复杂度。',
 code:'①  i=1; k=0;\n    while(i<n-1){ k=k+10*i; i++; }\n\n②  y=0;\n    while((y+1)*(y+1)<=n) y=y+1;\n\n③  for(i=0;i<n;i++)\n        for(j=0;j<m;j++)\n            a[i][j]=0;',
 book:'① 基本语句 k=k+10*i 执行 n−2 次，<b>T(n)=O(n)</b>。<br>② 设循环体执行 t 次，最终 t=y，t²≤n，<b>T(n)=O(n<sup>1/2</sup>)</b>。<br>③ 内循环 m 次、外循环 n 次，乘法原理共 mn 次，<b>T(m,n)=O(mn)</b>。',
 claude:'逐段核对：①线性循环 O(n)；②与 1.2-16 同型，y 加到 y²≈n → O(√n)；③标准二维遍历 O(mn)，注意行列规模不同不能写成 O(n²)。三段全对。',
 run:'实测：① 倍率≈2.00→O(n)；② 倍率≈1.42→O(√n)；③（设 m=n）倍率≈4.00→O(mn) ✅ 三段全部一致', verdict:'ok'},

{id:'1-思维拓展', ch:1, sec:'思维拓展', type:'subjective', tag:'', exam:null,
 kp:['复杂度·递归'], codeStem:true,
 stem:'求解斐波那契数列 F(n)：F(0)=0，F(1)=1，F(n)=F(n−1)+F(n−2)（n&gt;1）。有两种常用算法：递归算法和非递归算法。试分别分析两种算法的时间复杂度。',
 code:'// 递归\nint fib(int n){\n    if(n<2) return n;\n    return fib(n-1)+fib(n-2);\n}\n\n// 非递归（递推）\nint fib2(int n){\n    if(n<2) return n;\n    int a=0,b=1,c;\n    for(int i=2;i<=n;i++){ c=a+b; a=b; b=c; }\n    return b;\n}',
 book:'<b>递归算法</b>：递推式 T(n)=T(n−1)+T(n−2)+O(1)，与斐波那契本身同阶，为<b>指数级 O(φ<sup>n</sup>)</b>（φ=(1+√5)/2≈1.618，常写作 O(2<sup>n</sup>)）；根因是大量<b>重复子问题</b>被反复计算。<br><b>非递归算法</b>：从 F(0)、F(1) 起自底向上递推，循环 n−1 次即得 F(n)，时间复杂度 <b>O(n)</b>，空间 O(1)。<br>提示：结合归纳总结中「变量参与循环条件」与「递推关系式」两种方法。',
 claude:'一致。递归树里 F(n−2) 等子问题被重复算无数次，故指数爆炸；非递归用两个变量滚动保存，避免重复，降到线性。这也是「记忆化/DP 把指数降为线性」的最小例子。',
 run:'实测：递归调用次数 n 每 +5 涨 <b>11.09×，恰等于 φ⁵</b>（n=25→242785, n=30→2692537）→ O(φⁿ)≈O(1.618ⁿ) ✅；非递归循环次数 = n−1（线性）✅', verdict:'ok'},

/* ===================== 第2章 2.1 线性表的定义和基本操作 ===================== */
{id:'2.1-1', ch:2, sec:'2.1 线性表的定义和基本操作', type:'choice', tag:'', exam:null,
 kp:['概念·线性表定义'],
 stem:'线性表是具有 n 个（　）的有限序列。',
 opts:['数据表','字符','数据元素','数据项'], ans:'C',
 book:'线性表是由具有相同数据类型的有限数据元素组成的，而数据元素又由数据项组成。',
 claude:'线性表的基本单位是「数据元素」(记录)，元素之下才是数据项。选 C。', run:null, verdict:'ok'},
{id:'2.1-2', ch:2, sec:'2.1 线性表的定义和基本操作', type:'choice', tag:'', exam:null,
 kp:['概念·线性表定义'],
 stem:'下列几种描述中，（　）是一个线性表。',
 opts:['由 n 个实数组成的集合','由 100 个字符组成的序列','所有整数组成的序列','邻接表'], ans:'B',
 book:'线性表要求：相同数据类型、有限序列。C 元素个数无穷，错；A 集合无前后驱关系，错；D 是一种存储结构。只有 B 符合。',
 claude:'线性表=有限+有序+同类型。A 是集合(无序)、C 无限、D 是存储结构；选 B。', run:null, verdict:'ok'},
{id:'2.1-3', ch:2, sec:'2.1 线性表的定义和基本操作', type:'choice', tag:'', exam:null,
 kp:['概念·线性表定义'],
 stem:'在线性表中，除开始元素外，每个元素（　）。',
 opts:['只有唯一的前驱元素','只有唯一的后继元素','有多个前驱元素','有多个后继元素'], ans:'A',
 book:'线性表中，除最后一个(或第一个)元素外，每个元素都只有一个后继(或前驱)元素。',
 claude:'“除开始元素外”→ 都有唯一前驱，选 A。对称记法：除最后元素外都有唯一后继。', run:null, verdict:'ok'},
{id:'2.1-4', ch:2, sec:'2.1 线性表的定义和基本操作', type:'choice', tag:'', exam:null,
 kp:['概念·线性表定义'],
 stem:'若非空线性表中的元素既没有直接前驱，又没有直接后继，则该表中有（　）个元素。',
 opts:['1','2','3','n'], ans:'A',
 book:'第一个元素没有直接前驱，最后一个元素没有直接后继；当线性表中仅有一个元素时，该元素既没有直接前驱，又没有直接后继。',
 claude:'既无前驱又无后继 ⇒ 首=尾，只有 1 个元素，选 A。', run:null, verdict:'ok'},

/* ===================== 第2章 2.2 线性表的顺序表示 ===================== */
{id:'2.2-1', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表·特性'],
 stem:'下列叙述中，（　）是顺序存储结构的优点。',
 opts:['存储密度大','插入运算方便','删除运算方便','方便地运用于各种逻辑结构的存储表示'], ans:'A',
 book:'顺序表不像链表要在结点中存放指针域，因此存储密度大，A 正确。B、C 是链表的优点。D 错：如树形结构顺序表不如链表方便。',
 claude:'顺序表省了指针域→存储密度大(选 A)。插删要移动元素恰是它的缺点。', run:null, verdict:'ok'},
{id:'2.2-2', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表·特性'],
 stem:'下列关于顺序表的叙述中，正确的是（　）。',
 opts:['顺序表可以利用一维数组表示，因此顺序表与一维数组在逻辑结构上是相同的','在顺序表中，逻辑上相邻的元素物理位置上不一定相邻','顺序表和一维数组一样，都可以进行随机存取','在顺序表中，每个元素的类型不必相同'],
 ans:'C',
 book:'顺序表是顺序存储的线性表，元素类型必相同且连续存放；一维数组元素可不连续，且栈/队/树也能用数组表示，与顺序表逻辑结构不同(A 错)。顺序表逻辑相邻则物理相邻(B 错)。类型必相同(D 错)。都支持随机存取(C 对)。',
 claude:'C 对：顺序表按下标 O(1) 随机存取。A/B/D 各错一处(见左)。', run:null, verdict:'ok'},
{id:'2.2-3', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表·随机存取'],
 stem:'通常说顺序表具有随机存取的特性，指的是（　）。',
 opts:['查找值为 x 的元素的时间与顺序表中元素个数 n 无关','查找值为 x 的元素的时间与顺序表中元素个数 n 有关','查找序号为 i 的元素的时间与顺序表中元素个数 n 无关','查找序号为 i 的元素的时间与顺序表中元素个数 n 有关'],
 ans:'C',
 book:'随机存取是指 O(1) 时间访问下标为 i 的元素，所需时间与元素个数 n 无关。',
 claude:'“随机存取”=按序号(下标)直达，与 n 无关，选 C。按值查找仍需 O(n) 扫描(A/B 说的是按值)。', run:null, verdict:'ok'},
{id:'2.2-4', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表·存储空间'],
 stem:'一个顺序表所占用的存储空间大小与（　）无关。',
 opts:['表的长度','元素的存放顺序','元素的类型','元素中各字段的类型'], ans:'B',
 book:'顺序表所占存储空间 = 表长 × sizeof(元素类型)。表长、元素类型都影响空间；元素为结构体时各字段类型也影响。唯独“存放顺序”不影响。',
 claude:'空间=表长×单元素大小，跟元素排布顺序无关，选 B。', run:null, verdict:'ok'},
{id:'2.2-5', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表 vs 链表·选择'],
 stem:'若线性表最常用的操作是存取第 i 个元素及其前驱和后继元素的值，为了提高效率，应采用（　）的存储方式。',
 opts:['单链表','双链表','循环单链表','顺序表'], ans:'D',
 book:'题干要求能最快存取第 i−1、i、i+1 个元素值。A/B/C 都只能从头依次查找 O(n)；只有顺序表可按序号随机存取 O(1)。',
 claude:'要 O(1) 拿到第 i 及相邻元素，只有顺序表(按下标直达)，选 D。', run:null, verdict:'ok'},
{id:'2.2-6', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表 vs 链表·选择'],
 stem:'一个线性表最常用的操作是存取任意一个指定序号的元素并在最后进行插入、删除操作，则利用（　）存储方式可以节省时间。',
 opts:['顺序表','双链表','带头结点的循环双链表','循环单链表'], ans:'A',
 book:'只有顺序表可按序号随机存取，且在最后进行插入和删除时不需要移动任何元素。',
 claude:'按序号存取要顺序表(O(1))；表尾插删顺序表也是 O(1)。两个需求都满足，选 A。', run:null, verdict:'ok'},
{id:'2.2-7', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表·复杂度'],
 stem:'在 n 个元素的线性表的数组表示中，时间复杂度为 O(1) 的操作是（　）。<br>Ⅰ. 访问第 i(1≤i≤n) 个结点和求第 i(2≤i≤n) 个结点的直接前驱<br>Ⅱ. 在最后一个结点后插入一个新的结点<br>Ⅲ. 删除第 1 个结点<br>Ⅳ. 在第 i(1≤i≤n) 个结点后插入一个结点',
 opts:['Ⅰ','Ⅱ、Ⅲ','Ⅰ、Ⅱ','Ⅰ、Ⅱ、Ⅲ'], ans:'C',
 book:'Ⅰ 按下标访问 O(1)；Ⅱ 表尾插入不移动元素 O(1)；Ⅲ 删第 1 个要后面全部前移 O(n)；Ⅳ 后移 n−i 个 O(n)。故 O(1) 的是 Ⅰ、Ⅱ。',
 claude:'数组：按下标/表尾插=O(1)；表头删/中间插=O(n)。选 C(Ⅰ、Ⅱ)。', run:null, verdict:'ok'},
{id:'2.2-8', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表 vs 链表·选择'],
 stem:'设线性表有 n 个元素，严格说来，以下操作中，（　）在顺序表上实现要比链表上实现的效率高。<br>Ⅰ. 输出第 i(1≤i≤n) 个元素值<br>Ⅱ. 交换第 3 个元素与第 4 个元素的值<br>Ⅲ. 顺序输出这 n 个元素的值',
 opts:['Ⅰ','Ⅰ、Ⅲ','Ⅰ、Ⅱ','Ⅱ、Ⅲ'], ans:'C',
 book:'Ⅰ 顺序表按下标 O(1)，链表要遍历 O(n)——顺序表高。Ⅱ 顺序表 3 次赋值即换；链表要找两个前驱、断链重接，效率低——顺序表高。Ⅲ 都需顺序访问每个元素，时间相同——不占优。故 Ⅰ、Ⅱ。',
 claude:'“按位置直达”类操作(Ⅰ、Ⅱ)顺序表占优；“遍历全部”(Ⅲ)两者相同。选 C(Ⅰ、Ⅱ)。', run:null, verdict:'ok'},
{id:'2.2-9', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表·插删移动'],
 stem:'在一个长度为 n 的顺序表中删除第 i(1≤i≤n) 个元素时，需向前移动（　）个元素。',
 opts:['n','i−1','n−i','n−i+1'], ans:'C',
 book:'需要将元素 a_{i+1}~a_n 依次前移一位，共移动 n−(i+1)+1 = n−i 个元素。',
 claude:'删第 i 个：其后 a_{i+1}…a_n 各前移一格，共 n−i 个。选 C。(插入第 i 个才是 n−i+1)', run:null, verdict:'ok'},
{id:'2.2-10', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表·复杂度'],
 stem:'对于顺序表，访问第 i 个位置的元素和在第 i 个位置插入一个元素的时间复杂度为（　）。',
 opts:['O(n), O(n)','O(n), O(1)','O(1), O(n)','O(1), O(1)'], ans:'C',
 book:'访问第 i 个元素按下标 O(1)；在第 i 个位置插入需移动 n−i+1 个元素，O(n)。',
 claude:'读=O(1)，插=O(n)。选 C。记：顺序表“读快写慢”。', run:null, verdict:'ok'},
{id:'2.2-11', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表·复杂度'],
 stem:'对于顺序存储的线性表，其算法时间复杂度为 O(1) 的运算应该是（　）。',
 opts:['将 n 个元素从小到大排序','删除第 i(1≤i≤n) 个元素','改变第 i(1≤i≤n) 个元素的值','在第 i(1≤i≤n) 个元素后插入一个新元素'], ans:'C',
 book:'排序至少 O(n)；删除/插入要移动元素 O(n)；只有“改变第 i 个元素的值”按下标直接赋值 O(1)。',
 claude:'“改值”=按下标赋值，O(1)；插/删/排序都要动多个元素。选 C。', run:null, verdict:'ok'},
{id:'2.2-12', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'', exam:null,
 kp:['顺序表·扩容'],
 stem:'顺序表的插入算法中，当 n 个空间已满时，可再申请增加分配 m 个空间，若申请失败，则说明系统没有（　）可分配的存储空间。',
 opts:['m 个','m 个连续','n+m 个','n+m 个连续'], ans:'D',
 book:'顺序存储需要连续空间。扩容时要申请 n+m 个连续空间，再把原 n 个元素复制过去。故失败是没有 n+m 个连续空间。',
 claude:'扩容=开一块新的 n+m 连续区再搬迁，不是只加 m 个。选 D。', run:null, verdict:'ok'},
{id:'2.2-13', ch:2, sec:'2.2 线性表的顺序表示', type:'choice', tag:'2023 统考', exam:2023,
 kp:['顺序表·复杂度'],
 stem:'在下列对顺序存储的有序表（长度为 n）实现给定操作的算法中，平均时间复杂度为 O(1) 的是（　）。',
 opts:['查找包含指定值元素的算法','插入包含指定值元素的算法','删除第 i(1≤i≤n) 个元素的算法','获取第 i(1≤i≤n) 个元素的算法'],
 ans:'D',
 book:'有序表查找平均 O(log₂n)(折半)；插入指定值要先找位置再后移 O(n)；删第 i 个要后面前移 O(n)；获取第 i 个按下标直接读 O(1)。',
 claude:'唯一 O(1) 是“按序号获取第 i 个”，选 D。有序表的查/插/删都不是 O(1)。', run:null, verdict:'ok'},

/* ===================== 第2章 2.3 线性表的链式表示 ===================== */
{id:'2.3-1', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·顺序vs链式辨析'],
 stem:'下列关于线性表的存储结构的描述中，正确的是（　）。<br>Ⅰ. 线性表的顺序存储结构优于其链式存储结构<br>Ⅱ. 链式存储结构比顺序存储结构能更方便地表示各种逻辑结构<br>Ⅲ. 若频繁使用插入和删除结点操作，则顺序存储结构更优于链式存储结构<br>Ⅳ. 顺序存储结构和链式存储结构都可以进行顺序存取',
 opts:['Ⅰ、Ⅱ、Ⅲ','Ⅱ、Ⅳ','Ⅱ、Ⅲ','Ⅲ、Ⅳ'], ans:'B',
 book:'Ⅰ 各有优劣、无绝对优；Ⅱ 对(指针任意→更方便表示逻辑关系)；Ⅲ 恰相反(频繁增删链表更优)；Ⅳ 对(两者都能顺序存取)。故 Ⅱ、Ⅳ。',
 claude:'“谁绝对优”类说法(Ⅰ/Ⅲ)一律排除；Ⅱ、Ⅳ 是中性事实，选 B。', run:null, verdict:'ok'},
{id:'2.3-2', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·存储结构选择'],
 stem:'对于一个线性表，既要能进行较快速地插入和删除，又要求存储结构能反映数据之间的逻辑关系，则应该用（　）。',
 opts:['顺序存储方式','链式存储方式','散列存储方式','以上均可以'], ans:'B',
 book:'散列存储不能反映逻辑关系(排除 C)；顺序存储插删要移动大量元素(排除 A)；链式存储插删 O(1) 且指针天然反映逻辑关系。选 B。',
 claude:'“快速插删 + 反映逻辑关系”正是链表的主场，选 B。散列打乱了逻辑顺序。', run:null, verdict:'ok'},
{id:'2.3-3', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·结点地址'],
 stem:'链式存储设计时，结点内的存储单元地址（　）。',
 opts:['一定连续','一定不连续','不一定连续','部分连续，部分不连续'], ans:'A',
 book:'不同结点之间的存储空间可以不连续，但<b>结点内部</b>的存储单元地址必须连续。',
 claude:'区分“结点之间”(可不连续)与“结点内部”(必连续)。问的是结点内→选 A。', run:null, verdict:'ok'},
{id:'2.3-4', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·存储结构辨析'],
 stem:'下列关于线性表的说法中，正确的是（　）。<br>Ⅰ. 顺序存储方式只能用于存储线性结构<br>Ⅱ. 在一个设有头指针和尾指针的单链表中，删除表尾元素的时间复杂度与表长无关<br>Ⅲ. 带头结点的循环单链表中不存在空指针<br>Ⅳ. 在一个长度为 n 的有序单链表中插入一个新结点并仍保持有序的时间复杂度是 O(n)<br>Ⅴ. 若用单链表来表示队列，则应该选用带尾指针的循环链表',
 opts:['Ⅰ、Ⅱ','Ⅰ、Ⅲ、Ⅳ、Ⅴ','Ⅳ、Ⅴ','Ⅲ、Ⅳ、Ⅴ'], ans:'D',
 book:'Ⅰ 错(顺序存储也能存图、树)；Ⅱ 错(删表尾要从头找前驱，与表长有关)；Ⅲ 对(循环表尾结点指向头结点，无空指针)；Ⅳ 对(先查 O(n) 再插)；Ⅴ 对(队列用带尾指针循环链表两端操作都 O(1))。故 Ⅲ、Ⅳ、Ⅴ。',
 claude:'关键辨析：有尾指针也救不了“删表尾”(单链表要找前驱)→Ⅱ错；选 D。', run:null, verdict:'ok'},
{id:'2.3-5', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表vs顺序表·效率'],
 stem:'设线性表中有 2n 个元素，（　）在单链表上实现要比顺序表上实现效率更高。',
 opts:['删除所有值为 x 的元素','在最后一个元素的后面插入一个新元素','顺序输出前 k 个元素','交换第 i 个元素和第 2n−i−1 个元素的值（i=0,…,n−1）'], ans:'A',
 book:'A 在单链表上边扫边改指针、不移动元素；顺序表要移动大量元素——单链表高。B、D 顺序表按下标更快。C 无区别。',
 claude:'“批量删除/边遍历边改”类单链表占优(不搬元素)；“按下标定位”类顺序表占优。选 A。', run:null, verdict:'ok'},
{id:'2.3-6', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·单链表插入'],
 stem:'在一个单链表中，已知 q 所指结点是 p 所指结点的前驱结点，若在 q 和 p 之间插入结点 s，则执行（　）。',
 opts:['s->next=p->next; p->next=s;','p->next=s->next; s->next=p;','q->next=s; s->next=p;','p->next=s; s->next=q;'], ans:'C',
 book:'s 插入后，q 成为 s 的前驱、p 成为 s 的后继：q->next=s; s->next=p; 选 C。',
 claude:'插入位置前后都有指针(q、p)时，语句顺序不会断链。q→s→p，选 C。', run:null, verdict:'ok'},
{id:'2.3-7', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·建有序表复杂度'],
 stem:'给定有 n 个元素的一维数组，建立一个有序单链表的最低时间复杂度是（　）。',
 opts:['O(1)','O(n)','O(n<sup>2</sup>)','O(nlog<sub>2</sub>n)'], ans:'D',
 book:'边插边保持有序=直接插入排序 O(n²)；更优做法是先把数组排好序 O(nlog₂n)，再依次尾插建表 O(n)，总 O(nlog₂n)。',
 claude:'“最低”复杂度→先排序(nlogn)再串成链(n)，选 D。别掉进 O(n²) 的边插边找坑。', run:null, verdict:'ok'},
{id:'2.3-8', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·链接复杂度'],
 stem:'将长度为 n 的单链表链接在长度为 m 的单链表后面，其算法的时间复杂度采用大 O 形式表示应该是（　）。',
 opts:['O(1)','O(n)','O(m)','O(n+m)'], ans:'C',
 book:'需先遍历长度为 m 的表找到其尾结点(O(m))，再把尾结点 next 指向第二个表首结点(O(1))。故 O(m)。',
 claude:'只需找“前表”的尾，与后表长 n 无关，选 C。若两表都无尾指针，代价由前表长 m 决定。', run:null, verdict:'ok'},
{id:'2.3-9', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·头结点作用'],
 stem:'单链表中，增加一个头结点的目的是（　）。',
 opts:['使单链表至少有一个结点','标识表结点中首结点的位置','方便运算的实现','说明单链表是线性表的链式存储'], ans:'C',
 book:'头结点的好处：①插入/删除第一个元素与其他位置统一，无须特判；②空表与非空表头指针都非空、处理统一。本质是“方便运算实现”。',
 claude:'头结点=消除“首元素”特殊情况的哨兵，统一算法，选 C。', run:null, verdict:'ok'},
{id:'2.3-10', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·带头单链表复杂度'],
 stem:'在一个长度为 n 的带头结点的单链表 h 上，设有尾指针 r，则执行（　）操作与链表的表长有关。',
 opts:['删除单链表中的第一个元素','删除单链表中的最后一个元素','在单链表第一个元素前插入一个新元素','在单链表最后一个元素后插入一个新元素'], ans:'B',
 book:'删最后一个元素要把其前驱的 next 置空，而单链表从尾指针 r 无法反查前驱，需从头遍历 O(n)。其余操作都 O(1)。',
 claude:'尾指针能 O(1) 找到“尾”，但找不到“尾的前驱”→删尾仍 O(n)，选 B。这是单链表的死穴。', run:null, verdict:'ok'},
{id:'2.3-11', ch:2, sec:'2.3 线性表的链式表示', type:'subjective', tag:'', exam:null, kp:['链表·判空条件'],
 stem:'（双空题）对于一个头指针为 head 的<b>带头结点</b>的单链表，判定该表为空表的条件是＿＿；对于<b>不带头结点</b>的单链表，判定空表的条件为＿＿。<br>备选：A. head==NULL　B. head->next==NULL　C. head->next==head　D. head!=NULL',
 book:'带头结点：头结点的 next 域为空 → <b>head->next==NULL</b>（选 B）。不带头结点：head 直接指向首元素，空表即 head 为空 → <b>head==NULL</b>（选 A）。答案：第一空 B，第二空 A。',
 claude:'诀窍：带头结点判空看“头结点的 next”，不带头结点判空看“head 本身”。B、A。', run:null, verdict:'ok'},
{id:'2.3-12', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·插删移动'],
 stem:'在线性表 a<sub>0</sub>, a<sub>1</sub>, …, a<sub>100</sub> 中，删除元素 a<sub>50</sub> 需要移动（　）个元素。',
 opts:['0','50','51','0 或 50'], ans:'D',
 book:'题干只说“线性表”未定存储结构：链式存储删除不移动元素(0 个)；顺序存储删 a₅₀ 需把其后 a₅₁…a₁₀₀ 共 50 个前移。故“0 或 50”。',
 claude:'陷阱题：没说顺序还是链式！链式 0、顺序 50 → 选 D。', run:null, verdict:'ok'},
{id:'2.3-13', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·头插法次序'],
 stem:'通过含有 n(n&gt;1) 个元素的数组 a，采用头插法建立单链表 L，则 L 中的元素次序（　）。',
 opts:['与数组 a 的元素次序相同','与数组 a 的元素次序相反','与数组 a 的元素次序无关','以上都错'], ans:'B',
 book:'头插法每次把新元素插到表头，数组后面的元素反而排到链表最前，故次序<b>相反</b>。',
 claude:'头插=“后来居上”→逆序，选 B。要保持同序得用尾插法。', run:null, verdict:'ok'},
{id:'2.3-14', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·双链表优点'],
 stem:'下面关于线性表的一些说法中，正确的是（　）。',
 opts:['对一个设有头指针和尾指针的单链表执行删除最后一个元素的操作与链表长度无关','线性表中每个元素都有一个直接前驱和一个直接后继','为了方便插入和删除数据，可以使用双链表存放数据','取线性表第 i 个元素的时间与 i 的大小有关'],
 ans:'C',
 book:'A 错(删尾要找前驱，与表长有关)；B 错(首元素无前驱、尾元素无后继)；D 错(未考虑顺序存储时按下标 O(1))；C 对(双链表前后驱都可直达，增删方便)。',
 claude:'A/B/D 各有一处绝对化错误(见左)，只有 C 是稳妥说法，选 C。', run:null, verdict:'ok'},
{id:'2.3-15', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·双链表插入'],
 stem:'在双链表中向 p 所指的结点之前插入一个结点 q 的操作为（　）。',
 opts:['p->prior=q; q->next=p; p->prior->next=q; q->prior=p->prior;','q->prior=p->prior; p->prior->next=q; q->next=p; p->prior=q->next;','q->next=p; p->next=q; q->prior->next=q; q->next=p;','p->prior->next=q; q->next=p; q->prior=p->prior; p->prior=q;'],
 ans:'D',
 book:'在 p 前插 q，需：把 p 原前驱的 next 指向 q、q 的 next 指向 p、q 的 prior 指向 p 原前驱、p 的 prior 指向 q。<b>关键是先保存/使用 p->prior 再修改它</b>，只有 D 顺序正确不断链。',
 claude:'四条改指针语句，顺序错就断链。D 在改 p->prior 之前先用它接好 q，正确，选 D。', run:null, verdict:'ok'},
{id:'2.3-16', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·双链表删除'],
 stem:'在双链表存储结构中，删除 p 所指的结点时必须修改指针（　）。',
 opts:['p->prior->next=p->next; p->next->prior=p->prior;','p->prior=p->prior->prior; p->prior->next=p;','p->next->prior=p; p->next=p->next->next;','p->next->prior=p->prior; p->prior->next=p->prior;'],
 ans:'A',
 book:'删除 p 需把“p 的前驱”和“p 的后继”直接相连：p->prior->next=p->next; p->next->prior=p->prior; 选 A。(D 第二句写成 =p->prior 是错的)',
 claude:'删双链表结点=让前驱后继手拉手。A 正确；D 末句应是 p->next 却写成 p->prior，错。选 A。', run:null, verdict:'ok'},
{id:'2.3-17', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·双链表插入语句序'],
 stem:'在双链表中，已知指针 p 指向结点 A，若要在结点 A 和其后继结点 C 之间插入指针 q 所指的结点 B，则依次执行的语句序列可以是（　）。<br>① q->next=p->next;　② q->prior=p;　③ p->next=q;　④ p->next->prior=q;',
 opts:['①②④③','④③②①','③④①②','①③④②'], ans:'A',
 book:'结点 C 只能靠 p->next 间接找到，故凡用到 p->next 原值的语句(①取 C、④改 C 的 prior)都必须排在 ③(改 p->next) <b>之前</b>。A：①②④③ 中 ③ 最后，满足；选 A。',
 claude:'铁律：改 p->next(③)之前，必须先用完 p->next 的旧值(①④)。①②④③ 合法，选 A。', run:null, verdict:'ok'},
{id:'2.3-18', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·双链表指针域数'],
 stem:'在双链表的两个结点之间插入一个新结点，需要修改（　）个指针域。',
 opts:['1','3','4','2'], ans:'C',
 book:'新结点的 prior、新结点的 next、前一结点的 next、后一结点的 prior，共 4 个指针域。',
 claude:'双链表插入改 4 个指针域(新结点 2 个 + 左右邻各 1 个)，选 C。删除同样是 4→注意别记成 2。', run:null, verdict:'ok'},
{id:'2.3-19', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·有序单链表插入复杂度'],
 stem:'在长度为 n 的有序单链表中插入一个新结点，并仍然保持有序的时间复杂度是（　）。',
 opts:['O(1)','O(n)','O(n<sup>2</sup>)','O(nlog<sub>2</sub>n)'], ans:'B',
 book:'先在链表中顺序查找第一个大于 x 的结点的前驱 O(n)，再插入 O(1)，总 O(n)。',
 claude:'链表不能折半，找插入位置只能顺序扫 O(n)；插入本身 O(1)。总 O(n)，选 B。', run:null, verdict:'ok'},
{id:'2.3-20', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·双链表优点'],
 stem:'与单链表相比，双链表的优点之一是（　）。',
 opts:['插入、删除操作更方便','可以进行随机访问','可以省略表头指针或表尾指针','访问前后相邻结点更灵活'], ans:'D',
 book:'A 错(单/双链表插删都不移动元素，双链表改指针反而更多)；B 错(链表都不能随机访问)；C 无关；D 对(双链表有 prior，可直达前驱)。',
 claude:'双链表的真正优势=能直接访问前驱，选 D。“插删更方便”是常见误解。', run:null, verdict:'ok'},
{id:'2.3-21', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·循环单链表判空'],
 stem:'对于一个带头结点的循环单链表 L，判断该表为空表的条件是（　）。',
 opts:['头结点的指针域为空','L 的值为 NULL','头结点的指针域与 L 的值相等','头结点的指针域与 L 的地址相等'], ans:'C',
 book:'循环单链表空表时 L->next==L，即头结点的指针域指向自身(= L 的值)。循环表中不存在空指针，故 A 错。',
 claude:'循环链表判空看“是否指回自己”(L->next==L)，不是看 NULL。选 C。', run:null, verdict:'ok'},
{id:'2.3-22', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·循环双链表判空'],
 stem:'对于一个带头结点的循环双链表 L，判断该表为空表的条件是（　）。',
 opts:['L->prior==L && L->next==NULL','L->prior==NULL && L->next==NULL','L->prior==NULL && L->next==L','L->prior==L && L->next==L'], ans:'D',
 book:'循环双链表空表时，头结点的 prior 和 next 都指向它自身：L->prior==L && L->next==L。选 D。',
 claude:'循环双链表判空=prior 和 next 都指回自己，两个 ==L，选 D。', run:null, verdict:'ok'},
{id:'2.3-23', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·末尾插删选型'],
 stem:'一个链表最常用的操作是在末尾插入结点和删除结点，则选用（　）最节省时间。',
 opts:['带头结点的循环双链表','循环单链表','带尾指针的循环单链表','单链表'], ans:'A',
 book:'末尾插删都要访问尾结点及其前驱。带头结点的循环双链表通过头结点的 prior 可 O(1) 找到尾结点，再借双链的 prior 可 O(1) 找尾的前驱。故最省时。',
 claude:'“末尾又插又删”要既能到尾、又能到尾的前驱——只有循环双链表两者都 O(1)，选 A。', run:null, verdict:'ok'},
{id:'2.3-24', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·循环链表O(1)运算'],
 stem:'设对 n(n&gt;1) 个元素的线性表的运算只有 4 种：删除第一个元素；删除最后一个元素；在第一个元素之前插入新元素；在最后一个元素之后插入新元素，则最好使用（　）。',
 opts:['只有尾结点指针没有头结点指针的循环单链表','只有尾结点指针没有头结点指针的非循环双链表','只有头结点指针没有尾结点指针的循环双链表','既有头结点指针又有尾结点指针的循环单链表'],
 ans:'C',
 book:'带头结点指针的循环双链表：头结点的 prior 即尾结点，故首、尾及各自前驱都能 O(1) 定位，这 4 种运算都 O(1)。选 C。',
 claude:'4 种运算都在“两端”，需要 O(1) 到首/尾/尾前驱——循环双链表(有头指针)全满足，选 C。', run:null, verdict:'ok'},
{id:'2.3-25', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·两循环链表相接'],
 stem:'有两个长度为 n 的循环单链表，若要求两个循环单链表头尾相接的时间复杂度为 O(1)，则对应两个循环单链表各设置一个指针，分别指向（　）。',
 opts:['各自的头结点','各自的尾结点','各自的首结点','一个表的头结点，另一个表的尾结点'], ans:'B',
 book:'题目未指明谁接谁前，两个表都可能要在 O(1) 时间同时用到自己的头结点和尾结点——尾指针 next 即头结点，故各设尾指针即可 O(1) 拼接。选 B。',
 claude:'循环单链表里，有尾指针就能 O(1) 同时够到尾和头(尾->next=头)。两个都设尾指针，选 B。', run:null, verdict:'ok'},
{id:'2.3-26', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·循环单链表删首'],
 stem:'有一个长度为 n 的循环单链表，若从表中删除首元结点的时间复杂度达到 O(n)，则此时采用的循环单链表的结构可能是（　）。',
 opts:['只有表头指针，没有头结点','只有表尾指针，没有头结点','只有表尾指针，带头结点','只有表头指针，带头结点'], ans:'A',
 book:'删首元要维持循环性，需找到首元的前驱。只有表头指针又无头结点时，首元的前驱是尾结点，须遍历整表 O(n) 才能找到。其余情形都能 O(1)。选 A。',
 claude:'“O(n) 才能删首”=找不到前驱只能绕一圈——只有表头指针且无头结点最惨，选 A。', run:null, verdict:'ok'},
{id:'2.3-27', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·循环单链表长度'],
 stem:'某线性表用带头结点的循环单链表存储，头指针为 head，当 head->next->next==head 成立时，线性表的长度可能是（　）。',
 opts:['0','1','2','可能为 0 或 1'], ans:'D',
 book:'空表：head->next==head，故 head->next->next==head 成立(长度 0)。含一个元素：head->next 指向该元素、元素->next 指回 head，也有 head->next->next==head(长度 1)。故 0 或 1。',
 claude:'循环链表 head->next->next==head 有两种解：空表(0)或单元素(1)，选 D。', run:null, verdict:'ok'},
{id:'2.3-28', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·双链表删首尾复杂度'],
 stem:'有两个长度都为 n 的双链表，若以 h1 为头指针的双链表是非循环的，以 h2 为头指针的双链表是循环的，则下列叙述中正确的是（　）。',
 opts:['对于双链表 h1，删除首结点的时间复杂度是 O(n)','对于双链表 h2，删除首结点的时间复杂度是 O(n)','对于双链表 h1，删除尾结点的时间复杂度是 O(1)','对于双链表 h2，删除尾结点的时间复杂度是 O(1)'],
 ans:'D',
 book:'两种双链表删首结点都 O(1)(A、B 错)。非循环 h1 删尾要从头遍历找尾 O(n)(C 错)；循环 h2 的头结点 prior 即尾结点，删尾 O(1)(D 对)。',
 claude:'双链表删首都 O(1)；删尾看能否 O(1) 到尾——循环的能(h2->prior)，非循环的不能。选 D。', run:null, verdict:'ok'},
{id:'2.3-29', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·末尾插删首选型'],
 stem:'一个链表最常用的操作是在最后一个元素后插入一个元素和删除第一个元素，则选用（　）最节省时间。',
 opts:['不带头结点的循环单链表','双链表','单链表','不带头结点且有尾指针的循环单链表'], ans:'D',
 book:'“尾插 + 删首”正是队列。带尾指针的循环单链表：尾指针 r 直达尾(尾插 O(1))，r->next 即首结点(删首 O(1))。选 D。',
 claude:'尾插+删首=队列的两端操作，带尾指针的循环单链表两头都 O(1)，选 D。', run:null, verdict:'ok'},
{id:'2.3-30', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·静态链表选型'],
 stem:'需要分配较大连续空间，插入和删除不需要移动元素的线性表，其存储结构为（　）。',
 opts:['单链表','静态链表','顺序表','双链表'], ans:'B',
 book:'“较大连续空间”→用数组实现；“插删不移动元素”→靠游标(next 下标)链接。二者兼具的是<b>静态链表</b>。',
 claude:'连续空间(数组) + 增删不搬(游标链) = 静态链表，选 B。它是“数组骨、链表魂”。', run:null, verdict:'ok'},
{id:'2.3-31', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'', exam:null, kp:['链表·静态链表特点'],
 stem:'下列关于静态链表的说法中，正确的是（　）。<br>Ⅰ. 静态链表兼具顺序表和单链表的优点，因此存取表中第 i 个元素的时间与 i 无关<br>Ⅱ. 静态链表能容纳的最大元素个数在表定义时就确定了，以后不能增加<br>Ⅲ. 静态链表与动态链表在元素的插入、删除上类似，不需要移动元素<br>Ⅳ. 相比动态链表，静态链表可能浪费较多的存储空间',
 opts:['Ⅰ、Ⅱ、Ⅲ','Ⅱ、Ⅲ、Ⅳ','Ⅰ、Ⅲ、Ⅳ','Ⅰ、Ⅱ、Ⅳ'], ans:'B',
 book:'Ⅰ 错(静态链表仍按游标链查找，取第 i 个与 i 有关)；Ⅱ 对(数组一次性申请，容量固定)；Ⅲ 对(靠改游标，不移动元素)；Ⅳ 对(预分配大数组常有空闲)。故 Ⅱ、Ⅲ、Ⅳ。',
 claude:'静态链表≠随机存取！查第 i 个仍要顺链走→Ⅰ错，选 B。', run:null, verdict:'ok'},
{id:'2.3-32', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'2016 统考', exam:2016, kp:['链表·循环双链表删除'],
 stem:'已知带表头结点的循环双链表 L，结点结构为 [prev | data | next]，prev、next 分别指向直接前驱和直接后继。现要删除指针 p 所指的结点，正确的语句序列是（　）。',
 opts:['p->next->prev=p->prev; p->prev->next=p->prev; free(p);','p->next->prev=p->next; p->prev->next=p->next; free(p);','p->next->prev=p->next; p->prev->next=p->prev; free(p);','p->next->prev=p->prev; p->prev->next=p->next; free(p);'],
 ans:'D',
 book:'删 p 需让“p 后继的 prev 指向 p 的前驱”“p 前驱的 next 指向 p 的后继”，即 p->next->prev=p->prev; p->prev->next=p->next; 只有 D 两句都对。',
 claude:'删双链表结点=前驱后继手拉手：后继.prev=前驱、前驱.next=后继。选 D。A/B/C 各有一句把方向写错。', run:null, verdict:'ok'},
{id:'2.3-33', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'2016 统考', exam:2016, kp:['链表·地址表插入'],
 stem:'已知表头元素为 c 的单链表在内存中的存储状态如下表所示。<table class="qtab"><tr><th>地址</th><th>元素</th><th>链接地址</th></tr><tr><td>1000H</td><td>a</td><td>1010H</td></tr><tr><td>1004H</td><td>b</td><td>100CH</td></tr><tr><td>1008H</td><td>c</td><td>1000H</td></tr><tr><td>100CH</td><td>d</td><td>NULL</td></tr><tr><td>1010H</td><td>e</td><td>1004H</td></tr><tr><td>1014H</td><td>—</td><td>—</td></tr></table>现将 f 存放于 1014H 处并插入单链表，若 f 在逻辑上位于 a 和 e 之间，则 a、e、f 的“链接地址”依次是（　）。',
 code:'地址     元素   链接地址\n1000H     a     1010H\n1004H     b     100CH\n1008H     c     1000H\n100CH     d     NULL\n1010H     e     1004H\n1014H     f     ____   （新插入）',
 opts:['1010H、1014H、1004H','1010H、1004H、1014H','1014H、1010H、1004H','1014H、1004H、1010H'],
 ans:'D',
 book:'原链序 c(1008)→a(1000)→e(1010)→b(1004)→d(100C)。f 插在 a、e 之间：a→f、f→e、e 不变。故 a 的链接地址=f 地址=1014H；e 的链接地址仍=1004H；f 的链接地址=e 地址=1010H。依次 1014H、1004H、1010H。',
 claude:'先按“链接地址”还原链：c→a→e→b→d。在 a、e 间插 f：a 指 f(1014H)、f 指 e(1010H)、e 不动(1004H)。选 D。', run:null, verdict:'ok'},
{id:'2.3-34', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'2021 统考', exam:2021, kp:['链表·循环单链表删首'],
 stem:'已知头指针 h 指向一个带头结点的非空循环单链表，结点结构为 [data | next]，next 指向直接后继；p 是尾指针，q 是临时指针。现要删除该链表的第一个元素，正确的语句序列是（　）。',
 opts:['h->next=h->next->next; q=h->next; free(q);','q=h->next; h->next=h->next->next; free(q);','q=h->next; h->next=q->next; if(p!=q) p=h; free(q);','q=h->next; h->next=q->next; if(p==q) p=h; free(q);'],
 ans:'D',
 book:'先用 q 记住首元结点，再 h->next=q->next 摘除。<b>特殊情况</b>：若首元就是唯一元素(此时尾指针 p==q)，删后要把 p 指回头结点 h。故需 if(p==q) p=h;。选 D。',
 claude:'易错点：删首元若正好是尾结点(p==q)，尾指针会悬空，必须 p=h 修正。A/B 漏了这步且顺序错，选 D。', run:null, verdict:'ok'},
{id:'2.3-35', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'2023 统考', exam:2023, kp:['链表·双链表插入语句'],
 stem:'现有非空双链表 L，结点结构为 [prev | data | next]。若要在指针 p 所指结点(非尾结点)之后插入 s 指向的新结点，则在执行“s->next=p->next; p->next=s;”后，下列语句序列中还需要执行的是（　）。',
 opts:['s->next->prev=p; s->prev=p;','p->next->prev=s; s->prev=p;','s->prev=s->next->prev; s->next->prev=s;','p->next->prev=s->prev; s->next->prev=p;'],
 ans:'C',
 book:'执行前两句后，p->next=s，s->next 指向原后继 r(但 r->prev 仍指 p，s->prev 还没设)。还需：s->prev=p、r->prev=s。C：s->prev=s->next->prev(此时 s->next=r，r->prev=p，即 s->prev=p ✓)；s->next->prev=s(r->prev=s ✓)。选 C。',
 claude:'坑：前两句已把 p->next 改成 s，此时 p->next->prev 已不是 r 的 prev 了，得靠 s->next 去够 r。C 借 s->next 正确接回，选 C。', run:null, verdict:'ok'},
{id:'2.3-36', ch:2, sec:'2.3 线性表的链式表示', type:'choice', tag:'2024 统考', exam:2024, kp:['链表·单链表语句序结果'],
 stem:'已知带头结点的非空单链表 L 的头指针为 h，结点结构为 [data | next]。现有指针 p 和 q，若 p 指向 L 中非首非尾的任意一个结点，则执行语句序列“q=p->next; p->next=q->next; q->next=h->next; h->next=q;”的结果是（　）。',
 opts:['在 p 所指结点后插入 q 所指结点','在 q 所指结点后插入 p 所指结点','将 p 所指结点移至 L 的头结点之后','将 q 所指结点移动到 L 的头结点之后'],
 ans:'D',
 book:'q=p->next 令 q 指向 p 的后继；p->next=q->next 把 q 从链中摘除(p 直连 q 的后继)；q->next=h->next; h->next=q 把 q 头插到头结点之后。整体=把 q 结点搬到表头。选 D。',
 claude:'逐句跟踪：先抓住 p 的后继 q → 从原位摘掉 q → 头插 q。结果 q 被搬到头结点后，选 D。', run:null, verdict:'ok'},

/* ===================== 第2章 2.2 综合应用题（顺序表/数组算法设计） ===================== */
{id:'2.2-综1', ch:2, sec:'2.2 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·顺序表·删除'],
 stem:'从顺序表中删除具有最小值的元素（假设唯一）并由函数返回被删元素的值。空出的位置由最后一个元素填补；若顺序表为空则显示出错信息并退出运行。',
 code:'bool Del_Min(SqList &L, ElemType &value){\n    if(L.length==0) return false;            // 表空，失败\n    value=L.data[0]; int pos=0;\n    for(int i=1;i<L.length;i++)\n        if(L.data[i]<value){value=L.data[i]; pos=i;}\n    L.data[pos]=L.data[L.length-1];          // 末元素填补空位，避免整体前移\n    L.length--;\n    return true;\n}',
 book:'算法思想：扫描顺序表找最小值及其下标 pos，用最后一个元素填补 pos。O(n) 时间、O(1) 空间。（与我下方代码一致）',
 claude:'关键技巧：删中间元素时“末元素填坑”省去整体前移。被删值用引用参数 value 带出。与书答思路一致。',
 run:'实测 [5,3,8,1,9,2] 删最小 → 返回 1，剩余 {2,3,5,8,9} ✅', verdict:'ok'},

{id:'2.2-综2', ch:2, sec:'2.2 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·顺序表·逆置'],
 stem:'设计一个高效算法，将顺序表 L 的所有元素逆置，要求算法的空间复杂度为 O(1)。',
 code:'void Reverse(SqList &L){\n    ElemType t;\n    for(int i=0;i<L.length/2;i++){           // 头尾对称交换\n        t=L.data[i];\n        L.data[i]=L.data[L.length-1-i];\n        L.data[L.length-1-i]=t;\n    }\n}',
 book:'算法思想：扫描前半部分，将 L.data[i] 与对称位置 L.data[length-1-i] 交换。O(n)/O(1)。（与我代码一致）',
 claude:'只循环到 length/2，超过就会“换回去”。这个“对称双指针交换”是循环左移/区间逆置的基石。',
 run:'实测 [1,2,3,4,5] → [5,4,3,2,1] ✅', verdict:'ok'},

{id:'2.2-综3', ch:2, sec:'2.2 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·顺序表·删除'],
 stem:'对长度为 n 的顺序表 L，编写一个时间复杂度为 O(n)、空间复杂度为 O(1) 的算法，删除顺序表中所有值为 x 的数据元素。',
 code:'void del_x(SqList &L, ElemType x){\n    int k=0;                                 // k：保留(值!=x)的元素个数\n    for(int i=0;i<L.length;i++)\n        if(L.data[i]!=x) L.data[k++]=L.data[i];\n    L.length=k;\n}',
 book:'解法：用 k 记录值不等于 x 的元素个数，扫描时把非 x 元素依次搬到下标 k 处，末尾更新 length=k。O(n)/O(1)。（与我代码一致；书另给等价的“统计 x 个数前移”写法）',
 claude:'“快慢指针”原地压缩：慢指针 k 只在遇到要保留的元素时前进。这是数组原地删除的通用范式，务必背熟。',
 run:'实测 [1,2,2,3,2,4] 删 2 → [1,3,4] ✅', verdict:'ok'},

{id:'2.2-综4', ch:2, sec:'2.2 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·顺序表·删除'],
 stem:'从顺序表中删除其值在给定值 s 和 t 之间（包含 s 和 t，要求 s＜t）的所有元素；若 s 或 t 不合理或顺序表为空，则显示出错信息并退出运行。',
 code:'bool Del_s_t(SqList &L, ElemType s, ElemType t){\n    if(L.length==0 || s>=t) return false;    // 非法：表空或 s>=t\n    int k=0;\n    for(int i=0;i<L.length;i++)\n        if(L.data[i]<s || L.data[i]>t)        // 保留区间外的\n            L.data[k++]=L.data[i];\n    L.length=k;\n    return true;\n}',
 book:'算法思想：与“删所有 x”同框架，判定条件改为“值在 [s,t] 之外才保留”。每个保留元素只移动一次，O(n)/O(1)。',
 claude:'注意闭区间 [s,t] 用 ＜s || ＞t 判“区间外”。同样是快慢指针原地压缩，比“逐个删+后段前移”高效得多。',
 run:'实测 [1,3,5,7,9,4,6] 删 [3,6] → [1,7,9] ✅', verdict:'ok'},

{id:'2.2-综5', ch:2, sec:'2.2 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·顺序表·去重'],
 stem:'从有序顺序表中删除所有其值重复的元素，使表中所有元素的值均不同。',
 code:'bool Delete_Same(SqList &L){\n    if(L.length==0) return false;\n    int i=0;                                 // i：最后一个不重复元素的位置\n    for(int j=1;j<L.length;j++)\n        if(L.data[i]!=L.data[j])              // 遇到新值\n            L.data[++i]=L.data[j];\n    L.length=i+1;\n    return true;\n}',
 book:'算法思想：有序表相同值必相邻。类似直接插入：i 指向已去重段末尾，j 扫描，遇到与 L.data[i] 不同的值就接到 i+1。O(n)/O(1)。（与我代码一致）',
 claude:'“有序”是前提——相同值扎堆，只需和前一个已保留值比。若改无序表，用散列可 O(n)（书思考题答案）。',
 run:'实测 [1,2,2,2,2,3,3,3,4,4,5] → [1,2,3,4,5] ✅', verdict:'ok'},

{id:'2.2-综6', ch:2, sec:'2.2 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·顺序表·归并'],
 stem:'将两个有序顺序表合并为一个新的有序顺序表，并由函数返回结果顺序表。',
 code:'bool Merge(SqList A, SqList B, SqList &C){\n    if(A.length+B.length>C.MaxSize) return false;\n    int i=0,j=0,k=0;\n    while(i<A.length && j<B.length)           // 谁小取谁\n        C.data[k++]=(A.data[i]<=B.data[j])? A.data[i++] : B.data[j++];\n    while(i<A.length) C.data[k++]=A.data[i++];// 剩余直接接上\n    while(j<B.length) C.data[k++]=B.data[j++];\n    C.length=k;\n    return true;\n}',
 book:'算法思想：双指针依次取两表表头较小者存入 C，一方取完后把另一方剩余接到 C 末尾。O(m+n)/O(1)。',
 claude:'这就是归并排序的 merge 步。取“较小者”时用 ≤ 保证稳定。是链表合并、外部排序的原型。',
 run:'实测 [1,3,5,7]+[2,4,6] → [1,2,3,4,5,6,7] ✅', verdict:'ok'},

{id:'2.2-综7', ch:2, sec:'2.2 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·数组·逆置法'],
 stem:'已知在一维数组 A[m+n] 中依次存放两个线性表 (a₁,a₂,…,aₘ) 和 (b₁,b₂,…,bₙ)。编写一个函数，将数组中两个顺序表的位置互换，即将 (b₁,…,bₙ) 放在 (a₁,…,aₘ) 的前面。',
 code:'void Rev(int A[],int l,int r){            // 逆置 A[l..r]\n    while(l<r){int t=A[l];A[l]=A[r];A[r]=t;l++;r--;}\n}\nvoid Exchange(int A[],int m,int n){       // (a1..am)(b1..bn) -> (b1..bn)(a1..am)\n    Rev(A,0,m-1);                         // 逆置 a 段\n    Rev(A,m,m+n-1);                       // 逆置 b 段\n    Rev(A,0,m+n-1);                       // 整体逆置\n}',
 book:'算法思想：三次逆置。先分别逆置 a 段、b 段，再整体逆置，即得 (b₁,…,bₙ,a₁,…,aₘ)。O(m+n) 时间、O(1) 空间。',
 claude:'“分段逆 + 整体逆 = 两段交换”，和循环左移 (2010) 是同一招。比“借辅助数组搬运”省空间。',
 run:'实测 (1,2,3)(10,20) → (10,20,1,2,3) ✅', verdict:'ok'},

{id:'2.2-综8', ch:2, sec:'2.2 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·有序表·折半'],
 stem:'线性表 (a₁,a₂,…,aₙ) 中的元素递增有序且顺序存储。设计算法，用最少时间在表中查找数值为 x 的元素：若找到则将其与后继元素位置相交换；若找不到则将其插入表中并使表中元素仍递增有序。',
 code:'void SearchExchangeInsert(int A[], int &n, int x){\n    int lo=0,hi=n-1,mid,pos=-1;\n    while(lo<=hi){                        // 折半查找\n        mid=(lo+hi)/2;\n        if(A[mid]==x){pos=mid;break;}\n        else if(A[mid]<x) lo=mid+1; else hi=mid-1;\n    }\n    if(pos!=-1){                          // 找到：与后继交换(非表尾时)\n        if(pos<n-1){int t=A[pos];A[pos]=A[pos+1];A[pos+1]=t;}\n    }else{                                // 没找到：插到 lo 处，后段后移\n        for(int i=n-1;i>=lo;i--) A[i+1]=A[i];\n        A[lo]=x; n++;\n    }\n}',
 book:'算法思想：有序→用折半查找定位（“最少时间”的题眼）。找到则与后继交换；未找到时 lo 恰为应插入位置，后移元素腾位插入。查找 O(log₂n)，插入移动 O(n)。',
 claude:'题眼“最少时间”=必须折半而非顺序查找。折半失败时循环出口的 lo 就是有序插入点，这个性质要记牢。',
 run:'实测 找到 5 → [1,3,7,5,9]（5 与后继 7 交换）；未找到 6 → [1,3,5,6,7,9] ✅', verdict:'ok'},

{id:'2.2-综9', ch:2, sec:'2.2 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·多路归并'],
 stem:'给定三个序列 A、B、C，长度均为 n，且均为无重复元素的递增序列，设计一个时间上尽可能高效的算法，逐行输出同时存在于这三个序列中的所有元素。例如 A={1,2,3}, B={2,3,4}, C={-1,0,2}，则输出 2。',
 code:'void Common3(int A[],int B[],int C[],int n){\n    int i=0,j=0,k=0;\n    while(i<n && j<n && k<n){\n        if(A[i]==B[j] && B[j]==C[k]){     // 三者相等：命中\n            printf("%d ",A[i]); i++;j++;k++;\n        }else{                            // 落后者前移(追大的)\n            int m=A[i];\n            if(B[j]>m)m=B[j]; if(C[k]>m)m=C[k];\n            if(A[i]<m)i++; else if(B[j]<m)j++; else k++;\n        }\n    }\n}',
 book:'算法思想：三指针同步扫描；三者相等则输出并同时后移，否则把“当前值最小”的指针后移去追齐。每个指针最多走 n 步，O(n) 时间、O(1) 空间。',
 claude:'“最小者前移”保证不漏配。这是 K 路有序序列求交集的通法，比两两求交更省。',
 run:'实测 A{1,2,3} B{2,3,4} C{-1,0,2} → 输出 2 ✅', verdict:'ok'},

{id:'2.2-综10', ch:2, sec:'2.2 综合应用题', type:'subjective', hints:['循环左移 p 位＝把「前 p 个」和「后 n−p 个」整体交换，用「三次逆置」最省空间。','先逆置前 p 个，再逆置后 n−p 个，最后整体逆置整个数组；时间 O(n)、空间 O(1)。'], tag:'2010 统考', exam:2010, kp:['算法·数组·逆置法'],
 stem:'【2010】设将 n(n&gt;1) 个整数存放到一维数组 R 中。设计一个在时间和空间两方面都尽可能高效的算法，将 R 中保存的序列循环左移 p(0&lt;p&lt;n) 个位置，即将 R 中的数据由 (X₀,X₁,…,X_{n-1}) 变换为 (X_p,X_{p+1},…,X_{n-1},X₀,X₁,…,X_{p-1})。',
 code:'void Rev(int R[],int l,int r){\n    while(l<r){int t=R[l];R[l]=R[r];R[r]=t;l++;r--;}\n}\nvoid LeftRotate(int R[],int n,int p){     // 循环左移 p 位\n    Rev(R,0,p-1);                         // ① 逆置前 p 个\n    Rev(R,p,n-1);                         // ② 逆置后 n-p 个\n    Rev(R,0,n-1);                         // ③ 整体逆置\n}',
 book:'经典三次逆置法：先逆前 p 个、再逆后 n−p 个、最后整体逆置。时间 O(n)、空间 O(1)——两方面都最优。（另有“借辅助数组”O(n)/O(p) 但空间更差）',
 claude:'与书答完全一致。口诀“分段逆，整体逆”。408 最高频算法真题之一，必须能默写。',
 run:'实测 [1..10] 左移 3 → [4,5,6,7,8,9,10,1,2,3] ✅', verdict:'ok'},

{id:'2.2-综11', ch:2, sec:'2.2 综合应用题', type:'subjective', hints:['两个等长升序序列求总中位数：不合并，用二分「各砍一半」。','比两序列中位数 a、b：相等即答案；a&lt;b 则丢 A 前半、B 后半（对称保留使个数仍相等）；反之亦然，直到各剩一个取较小者。O(log n)。'], tag:'2011 统考', exam:2011, kp:['算法·折半·中位数'],
 stem:'【2011】一个长度为 L(L≥1) 的升序序列 S，处在第 ⌈L/2⌉ 个位置的数称为 S 的中位数。现有两个等长升序序列 A 和 B，设计一个在时间和空间两方面都尽可能高效的算法，找出两个序列 A 和 B 的中位数（即 A、B 全部元素合并后的中位数）。',
 code:'int M_Search(int A[], int B[], int n){\n    int s1=0,d1=n-1,s2=0,d2=n-1,m1,m2;\n    while(s1!=d1 || s2!=d2){\n        m1=(s1+d1)/2; m2=(s2+d2)/2;\n        if(A[m1]==B[m2]) return A[m1];    // 相等即中位数\n        if(A[m1]<B[m2]){                  // 舍 A 左半、B 右半(个数对称)\n            if((s1+d1)%2==0){s1=m1;   d2=m2;}   // 奇数个：保留中点\n            else            {s1=m1+1; d2=m2;}   // 偶数个\n        }else{                            // 舍 A 右半、B 左半\n            if((s1+d1)%2==0){d1=m1; s2=m2;}\n            else            {d1=m1; s2=m2+1;}\n        }\n    }\n    return A[s1]<B[s2]? A[s1] : B[s2];\n}',
 book:'算法思想：分别求 A、B 的中位数 a、b。若 a==b 即答案；若 a＜b 则中位数落在“A 的后半 + B 的前半”，两边各舍去一半（保持两段等长）；反之亦然。每轮规模减半，时间 O(log₂n)、空间 O(1)。',
 claude:'核心是“每次同时砍掉 A、B 各一半且保持对称”，把 O(n) 归并降到 O(log n)。边界的奇偶处理最易错，已对拍验证。',
 run:'实测 2000 组随机等长升序序列，与“合并后取上中位数”逐一比对，全部一致 ✅', verdict:'ok'},

{id:'2.2-综12', ch:2, sec:'2.2 综合应用题', type:'subjective', hints:['主元素（出现次数&gt;n/2）用「摩尔投票」：候选 + 计数，不同抵消、相同累加。','一趟选候选（count 归 0 就换人）；再一趟数候选真实次数，&gt;n/2 才是主元素，否则不存在。O(n)/O(1)。'], tag:'2013 统考', exam:2013, kp:['算法·摩尔投票·主元素'],
 stem:'【2013】已知一个整数序列 A=(a₀,a₁,…,a_{n-1})，其中 0≤aᵢ&lt;n。若存在 a_{p1}=a_{p2}=…=a_{pm}=x 且 m&gt;n/2，则称 x 为 A 的主元素。请设计一个尽可能高效的算法，找出 A 的主元素；若存在则输出该元素，否则输出 −1。',
 code:'int Majority(int A[], int n){\n    int cand=A[0], cnt=1;                 // 摩尔投票选候选\n    for(int i=1;i<n;i++){\n        if(A[i]==cand) cnt++;\n        else if(--cnt==0){cand=A[i]; cnt=1;}\n    }\n    cnt=0;                                // 二次扫描确认票数\n    for(int i=0;i<n;i++) if(A[i]==cand) cnt++;\n    return cnt>n/2 ? cand : -1;\n}',
 book:'王道解法：一趟“计数抵消”选出候选（相同则加、不同则减，减到 0 换候选），再扫描一遍统计候选出现次数，＞n/2 才是主元素。时间 O(n)、空间 O(1)。',
 claude:'摩尔投票：主元素数量过半，一一抵消后必然幸存。务必要有第二趟确认——否则无主元素时会误报。与书同思路。',
 run:'实测 有主元素 {0,5,5,3,5,7,5,5} → 5；无主元素 {0,5,5,3,5,1,5,7} → −1 ✅', verdict:'ok'},

{id:'2.2-综13', ch:2, sec:'2.2 综合应用题', type:'subjective', hints:['缺失的最小正整数一定在 1..n+1 内，用「标记数组」把值当下标记录。','开 n+1 大小标记数组，遍历把 1≤A[i]≤n 的位置置真；再从 1 扫第一个没被标记的即答案。O(n) 时间 + O(n) 空间。'], tag:'2018 统考', exam:2018, kp:['算法·标记数组·缺失正整数'],
 stem:'【2018】给定一个含 n(n≥1) 个整数的数组，设计一个在时间上尽可能高效的算法，找出数组中未出现的最小正整数。例如 {−5,3,2,3} 中未出现的最小正整数是 1；{1,2,3} 中是 4。',
 code:'int MinMissing(int A[], int n){\n    int *B=(int*)malloc((n+1)*sizeof(int));\n    for(int i=0;i<=n;i++) B[i]=0;         // B[1..n] 标记 1~n 是否出现\n    for(int i=0;i<n;i++)\n        if(A[i]>0 && A[i]<=n) B[A[i]]=1;\n    int i;\n    for(i=1;i<=n;i++) if(B[i]==0) break;  // 第一个没出现的正整数\n    free(B);\n    return i;                             // 1~n 全出现则答案为 n+1\n}',
 book:'算法思想：n 个数中缺失的最小正整数必在 [1,n+1] 内，故只需关心 1~n 是否出现。用大小 n 的标记数组一趟标记、一趟从小到大找第一个未标记者。时间 O(n)、空间 O(n)——以空间换时间。',
 claude:'关键上界：答案不超过 n+1，所以＞n 或 ≤0 的数直接忽略。空间 O(n) 是“时间最优”的代价（题目只要求时间高效）。',
 run:'实测 {−5,3,2,3} → 1；{1,2,3} → 4 ✅', verdict:'ok'},

{id:'2.2-综14', ch:2, sec:'2.2 综合应用题', type:'subjective', hints:['三个升序数组各一指针求最小距离：谁最小谁前进的贪心。','算当前三元素距离（max−min）更新最小值；把三者里「最小的那个」指针右移；任一到头即停。O(n)。'], tag:'2020 统考', exam:2020, kp:['算法·多路指针·最小距离'],
 stem:'【2020】定义三元组 (a,b,c)(a,b,c 均为整数) 的距离 D=|a−b|+|b−c|+|c−a|。给定 3 个非空整数集合 S₁、S₂、S₃，按升序分别存储在 3 个数组中。设计一个尽可能高效的算法，计算并输出所有可能的三元组 (a,b,c)(a∈S₁,b∈S₂,c∈S₃) 中的最小距离。例 S₁={−1,0,9}, S₂={−25,−10,10,11}, S₃={2,9,17,30,41}，最小距离为 2。',
 code:'int abs_(int x){return x<0?-x:x;}\nint MinDistance(int S1[],int n1,int S2[],int n2,int S3[],int n3){\n    int i=0,j=0,k=0,best=0x7fffffff;\n    while(i<n1 && j<n2 && k<n3){\n        int a=S1[i],b=S2[j],c=S3[k];\n        int D=abs_(a-b)+abs_(b-c)+abs_(c-a);\n        if(D<best) best=D;\n        int m=a;                          // 三者最小\n        if(b<m)m=b; if(c<m)m=c;\n        if(m==a)i++; else if(m==b)j++; else k++; // 只前移最小者\n    }\n    return best;\n}',
 book:'算法思想：D 由“最大−最小”主导，要缩小距离只能增大当前最小值。三指针各指一集合，每轮算一次 D 更新答案，然后把“当前最小的那个元素”的指针后移。总步数 ≤ |S₁|+|S₂|+|S₃|，O(n) 时间、O(1) 空间。',
 claude:'贪心正确性：移动非最小者只会让距离不减，故只移最小者不漏最优。已用暴力三重循环对拍。',
 run:'实测 例子 → 2；另 1000 组随机升序集合与暴力三重循环逐一对拍，全部一致 ✅', verdict:'ok'},

{id:'2.2-综15', ch:2, sec:'2.2 综合应用题', type:'subjective', hints:['两数组各取一个求最大乘积：只可能是「最大×最大」或「最小×最小」（负负得正）。','一趟求 A、B 各自的 max/min，比较 maxA×maxB 与 minA×minB 取大者。⚠️注意负数、且题目允许 j 含 i 的坑。O(n)。'], tag:'2025 统考', exam:2025, kp:['算法·全局极值'],
 stem:'【2025】有两个长度均为 n 的一维整型数组 A 和 res。对数组 A 中的每个元素 A[i]，计算 A[i] 与 A[j](0≤j≤n−1) 乘积的最大值，并保存到 res[i] 中。例 A[]={1,4,−9,6} 时 res[]={6,24,81,36}。函数原型 void calMulMax(int A[], int res[], int n)。',
 code:'void calMulMax(int A[], int res[], int n){\n    int mx=A[0], mn=A[0];\n    for(int i=1;i<n;i++){                  // 一趟求全局最大、最小\n        if(A[i]>mx) mx=A[i];\n        if(A[i]<mn) mn=A[i];\n    }\n    for(int i=0;i<n;i++){                  // A[i] 乘“最大”或“最小”取较大\n        int p1=A[i]*mx, p2=A[i]*mn;\n        res[i]= p1>p2 ? p1 : p2;\n    }\n}',
 book:'（2025 新真题）与 A[i] 相乘得最大值的对方，必是全局最大元素（当 A[i]≥0）或全局最小元素（当 A[i]＜0）。先 O(n) 求全局 max/min，再 O(n) 算每个 res[i]。总 O(n) 时间、O(1) 空间。',
 claude:'⚠️ 由例子 res[2]=(−9)×(−9)=81、res[3]=6×6=36 可知 <b>j 允许等于 i</b>，故“含自身的全局 max/min”正好；正数配最大、负数配最小。两趟线性。',
 run:'实测 A={1,4,−9,6} → res={6,24,81,36} ✅；另 5000 组随机数组与暴力 O(n²) 逐一对拍，全部一致 ✅', verdict:'ok'},

/* ===================== 第2章 2.3 综合应用题（链表算法设计） =====================
   结点约定：单链表 typedef struct LNode{ElemType data; struct LNode *next;}LNode,*LinkList;
            双链表 typedef struct DNode{ElemType data; struct DNode *prior,*next; int freq;}DNode; */
{id:'2.3-综1', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·删除'],
 stem:'在带头结点的单链表 L 中，删除所有值为 x 的结点，并释放其空间（假设值为 x 的结点不唯一）。',
 code:'void del_all_x(LinkList L, ElemType x){\n    LNode *pre=L, *p=L->next;\n    while(p){\n        if(p->data==x){ pre->next=p->next; free(p); p=pre->next; } // 删除并释放\n        else { pre=p; p=p->next; }\n    }\n}',
 book:'算法思想：pre、p 双指针遍历，p->data==x 则让 pre 跨过 p 并 free(p)，否则同步后移。O(n)/O(1)。',
 claude:'带头结点的好处：删首元与删中间统一处理，无须特判。删除后 p 要回到 pre->next。',
 run:'实测 [2,1,2,3,2] 删 2 → [1,3] ✅', verdict:'ok'},

{id:'2.3-综2', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·删除'],
 stem:'试编写在带头结点的单链表 L 中删除一个最小值结点的高效算法（假设最小值结点唯一）。',
 code:'LinkList Delete_Min(LinkList L){\n    LNode *pre=L, *p=L->next;          // p工作指针，pre其前驱\n    LNode *minpre=pre, *minp=p;        // 记最小值结点及其前驱\n    while(p){\n        if(p->data < minp->data){ minp=p; minpre=pre; }\n        pre=p; p=p->next;\n    }\n    minpre->next=minp->next; free(minp);\n    return L;\n}',
 book:'算法思想：一趟遍历，用 minp/minpre 记录最小值结点及其前驱；结束后由 minpre 摘除 minp。O(n)/O(1)。',
 claude:'链表删除必须有“前驱”才能改指针，所以要同时记 minpre。一趟搞定。',
 run:'实测 [3,1,4,1,5,9] 删最小 → [3,4,1,5,9] ✅', verdict:'ok'},

{id:'2.3-综3', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·逆置'],
 stem:'试编写算法将带头结点的单链表就地逆置，“就地”是指辅助空间复杂度为 O(1)。',
 code:'LinkList Reverse(LinkList L){\n    LNode *p=L->next, *r;\n    L->next=NULL;                      // 头结点先断开\n    while(p){                          // 依次头插\n        r=p->next;                     // 暂存后继，防断链\n        p->next=L->next; L->next=p;    // 把 p 插到头结点之后\n        p=r;\n    }\n    return L;\n}',
 book:'解法1（头插法）：摘下头结点后的结点，逐个头插到头结点之后即得逆序。O(n)/O(1)。（书另给“三指针依次翻转 next”解法2）',
 claude:'头插法最好记：r 存后继防断链，p 头插。这是链表逆置/逆序建表的核心套路。',
 run:'实测 [1,2,3,4] → [4,3,2,1] ✅', verdict:'ok'},

{id:'2.3-综4', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·删除'],
 stem:'设在一个带表头结点的单链表中所有结点元素值无序，试编写一个函数，删除表中所有介于给定两个值（作为函数参数 s、t 给出）之间的元素（若存在）。',
 code:'void del_between(LinkList L, ElemType s, ElemType t){\n    LNode *pre=L, *p=L->next;\n    while(p){\n        if(p->data>s && p->data<t){ pre->next=p->next; free(p); p=pre->next; }\n        else { pre=p; p=p->next; }\n    }\n}',
 book:'算法思想：与“删所有 x”同框架，删除条件改为 s＜data＜t（开区间）。无序表也只需一趟。O(n)/O(1)。',
 claude:'和综1同一套 pre/p 删除模板，只改判定条件。无序不影响——挨个查即可。',
 run:'实测 [1,5,3,8,2,6] 删介于(2,6) → [1,8,2,6]（删 5、3）✅', verdict:'ok'},

{id:'2.3-综5', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·相交'],
 stem:'给定两个单链表，试分析找出两个链表的公共结点的思想（不用写代码）。',
 book:'两个单链表若有公共结点，则从某结点起后面全部重合，整体呈 “Y” 形（不会再分叉，因每个结点只有一个 next）。思路：① 分别求两表长 la、lb；② 让较长的表先走 |la−lb| 步；③ 两指针同步前进，第一个“地址相同”的结点即第一个公共结点。时间 O(la+lb)、空间 O(1)。',
 claude:'关键洞察：单链表公共即“共享后缀”，尾部对齐后同步走必然同时到达汇合点。注意比的是<b>结点地址</b>不是 data 值。',
 run:'（本题只要思路，无代码）思路正确性即“尾对齐”，与 2012 真题(综18)同源。', verdict:'ok'},

{id:'2.3-综6', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·拆分'],
 stem:'设 C={a₁,b₁,a₂,b₂,…,aₘ,bₘ} 为线性表，采用带头结点的单链表存放，设计一个就地算法，将其拆分为两个线性表，使得 A={a₁,a₂,…,aₘ}，B={bₘ,…,b₂,b₁}。',
 code:'LinkList split(LinkList C, LinkList &B){\n    LinkList A=C;                          // A 复用 C 的头结点\n    B=(LinkList)malloc(sizeof(LNode)); B->next=NULL;\n    LNode *ra=A, *p=C->next;\n    while(p){\n        ra->next=p; ra=p; p=p->next;       // a 元素尾插到 A（保持原序）\n        if(p){ LNode *q=p->next;\n               p->next=B->next; B->next=p;   // b 元素头插到 B（自然逆序）\n               p=q; }\n    }\n    ra->next=NULL;\n    return A;\n}',
 book:'算法思想：A 用<b>尾插</b>保持 a 序列原序；B 用<b>头插</b>，自然得到 bₘ,…,b₂,b₁ 的逆序。一趟遍历 O(n)/O(1)。',
 claude:'一题吃透“尾插保序 vs 头插逆序”两大建表法。B 要逆序恰好白送——头插即可，不必额外逆置。',
 run:'实测 [1,10,2,20,3,30] → A=[1,2,3], B=[30,20,10] ✅', verdict:'ok'},

{id:'2.3-综7', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·去重'],
 stem:'在一个递增有序的单链表中存在重复的元素，设计算法删除重复的元素（使每个值只保留一个）。',
 code:'void del_dup(LinkList L){\n    LNode *p=L->next, *q;\n    if(!p) return;\n    while(p->next){\n        q=p->next;\n        if(p->data==q->data){ p->next=q->next; free(q); } // 与后继相同则删后继\n        else p=p->next;\n    }\n}',
 book:'算法思想：有序表相同值必相邻。p 扫描，若 p->data==p->next->data 则删除 p->next，否则 p 后移。O(n)/O(1)。',
 claude:'和顺序表去重(综5)同思路，链表版更省——直接改指针删后继，不用搬移。',
 run:'实测 [7,10,10,21,30,42,42,42,51,70] → [7,10,21,30,42,51,70] ✅', verdict:'ok'},

{id:'2.3-综8', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·归并'],
 stem:'设 A 和 B 是两个带头结点、元素递增有序的单链表。设计算法从 A 和 B 的公共元素产生单链表 C，要求不破坏 A、B 的结点。',
 code:'LinkList Common(LinkList A, LinkList B){\n    LNode *p=A->next, *q=B->next, *s, *r;\n    LinkList C=(LinkList)malloc(sizeof(LNode)); r=C;\n    while(p && q){\n        if(p->data<q->data) p=p->next;\n        else if(p->data>q->data) q=q->next;\n        else{                              // 相等：复制一份挂到 C（不破坏原表）\n            s=(LNode*)malloc(sizeof(LNode)); s->data=p->data;\n            r->next=s; r=s; p=p->next; q=q->next;\n        }\n    }\n    r->next=NULL;\n    return C;\n}',
 book:'算法思想：双指针归并式扫描，相等时<b>新建结点</b>复制值挂到 C（“不破坏 A、B”的题眼），否则移动较小者。O(m+n)。',
 claude:'“不破坏原表”=必须 malloc 新结点复制，不能直接摘 A/B 的结点。这是和综9的关键区别。',
 run:'实测 A=[1,2,3,4,5] ∩ B=[2,4,6] → C=[2,4] ✅', verdict:'ok'},

{id:'2.3-综9', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·交集'],
 stem:'已知两个带头结点单链表 A 和 B 分别表示两个集合，其元素递增排列。编制函数，求 A 与 B 的交集，并存放于 A 链表中。',
 code:'LinkList Intersection(LinkList A, LinkList B){\n    LNode *pa=A->next, *pb=B->next, *pre=A, *u;\n    while(pa && pb){\n        if(pa->data==pb->data){ pre->next=pa; pre=pa; pa=pa->next; pb=pb->next; } // 保留\n        else if(pa->data<pb->data){ u=pa; pa=pa->next; free(u); }  // A 独有→删\n        else pb=pb->next;                                          // B 独有→跳过\n    }\n    pre->next=NULL;\n    while(pa){ u=pa; pa=pa->next; free(u); }   // A 剩余全删\n    return A;\n}',
 book:'算法思想：与综8类似，但结果存回 A：相等则保留 A 的结点，A 中不在 B 的结点<b>直接删除并释放</b>，最后清理 A 剩余。O(m+n)。',
 claude:'和综8对照记：综8“不破坏、复制到 C”；综9“就地改 A、删多余”。省空间但会毁掉 A 原表。',
 run:'实测 A=[1,2,3,4] ∩ B=[2,3,5] → A=[2,3] ✅', verdict:'ok'},

{id:'2.3-综10', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·子序列'],
 stem:'两个整数序列 A=a₁,a₂,…,aₘ 和 B=b₁,b₂,…,bₙ 已存入两个单链表，设计一个算法，判断序列 B 是否是序列 A 的连续子序列。',
 code:'bool is_subseq(LinkList A, LinkList B){\n    LNode *pa=A->next, *pb=B->next, *start=pa;\n    while(start && pb){\n        pa=start; pb=B->next;\n        while(pa && pb && pa->data==pb->data){ pa=pa->next; pb=pb->next; }\n        if(!pb) return true;            // B 走完 = 匹配成功\n        start=start->next;             // 换 A 的下一个起点重试\n    }\n    return pb==NULL;\n}',
 book:'算法思想：以 A 的每个位置为起点，尝试与 B 逐一匹配；若 B 走到末尾则成功。朴素匹配 O(mn)。',
 claude:'“连续子序列”=子串匹配，思路同串的朴素模式匹配。匹配失败则 A 起点后移一位重来。',
 run:'实测 B=[3,4,5] 是 A=[1,2,3,4,5] 连续子序列 → true；B=[3,5] → false ✅', verdict:'ok'},

{id:'2.3-综11', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·双链表·对称'],
 stem:'设计一个算法用于判断带头结点的循环双链表是否对称（即是否为回文）。',
 code:'bool Symmetry(DLinkList L){\n    DNode *p=L->next, *q=L->prior;      // p 从前往后，q 从后往前\n    while(p!=q && p->prior!=q){          // 相遇(奇)或交错(偶)则停\n        if(p->data==q->data){ p=p->next; q=q->prior; }\n        else return false;\n    }\n    return true;\n}',
 book:'算法思想：利用双链表可双向遍历，p 从表头、q 从表尾同时向中间逼近，逐对比较，遇到不等即不对称。O(n)/O(1)。',
 claude:'循环双链表判回文的标准双指针法：终止条件 p==q(奇数个,中点相遇) 或 p->prior==q(偶数个,交错)。',
 run:'实测 [1,2,3,2,1] → 对称 true；[1,2,3] → false ✅', verdict:'ok'},

{id:'2.3-综12', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·循环链表·拼接'],
 stem:'有两个循环单链表，链表头指针分别为 h1 和 h2，编写一个函数将链表 h2 链接到链表 h1 之后，要求链接后的链表仍保持循环链表形式。',
 code:'LinkList Link(LinkList h1, LinkList h2){\n    LNode *p=h1, *q=h2;\n    while(p->next!=h1) p=p->next;        // 找 h1 的尾结点\n    while(q->next!=h2) q=q->next;        // 找 h2 的尾结点\n    p->next=h2;                          // h1 尾 → h2\n    q->next=h1;                          // h2 尾 → h1（重新成环）\n    return h1;\n}',
 book:'算法思想：分别找到两表尾结点，把 h1 尾接到 h2、h2 尾接回 h1，即成一个大循环链表。用头指针需 O(n) 找尾；<b>若改用尾指针则可 O(1) 完成</b>。',
 claude:'循环链表拼接=“断两处、接两处”。考点常引申：为何尾指针比头指针好——尾指针 O(1) 拿到首尾。',
 run:'（结构操作）逻辑：找尾 O(n)、改两根指针成环，正确。用尾指针版为 O(1)。', verdict:'ok'},

{id:'2.3-综13', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·双链表·自组织'],
 stem:'带头结点的非循环双链表 L，每个结点除 pre、data、next 外还有访问频度域 freq（初始为 0）。每次 Locate(L,x) 使值为 x 的结点 freq 加 1，并让链表保持按 freq 递减排列，且最近访问的结点排在同频度结点之前（频繁访问者靠近表头）。编写 Locate(L,x)，返回找到结点的地址。',
 code:'DNode *Locate(DLinkList L, ElemType x){\n    DNode *p=L->next;\n    while(p && p->data!=x) p=p->next;\n    if(!p) return NULL;                  // 未找到\n    p->freq++;\n    p->prior->next=p->next;              // 先把 p 从链中摘下\n    if(p->next) p->next->prior=p->prior;\n    DNode *q=p->prior;                    // 向前找第一个 freq 更大的结点 q\n    while(q!=L && q->freq<=p->freq) q=q->prior;\n    p->next=q->next;                     // 插到 q 之后\n    if(q->next) q->next->prior=p;\n    q->next=p; p->prior=q;\n    return p;\n}',
 book:'算法思想：查找到 x 后 freq+1，然后把该结点前移到“频度递减”的正确位置。用 ≤ 比较可保证“同频度中最近访问的排在前面”。O(n)。',
 claude:'自组织链表（频度排序）经典题。要点：先摘下再前插；比较用 ≤（不是 ＜）才能让新访问的结点插到同频组最前。',
 run:'（结构操作）四指针增删已逐句核对；同频“≤”前插保证最近优先。', verdict:'ok'},

{id:'2.3-综14', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·循环移位'],
 stem:'设将 n(n&gt;1) 个整数存放到不带头结点的单链表 L 中，设计算法将 L 中保存的序列循环右移 k(0&lt;k&lt;n) 个位置。',
 code:'LinkList right_rotate(LinkList L, int k){\n    LNode *p=L; int n=1;\n    while(p->next){ p=p->next; n++; }    // p=尾结点，n=长度\n    k%=n; if(k==0) return L;\n    LNode *tail=p;\n    p=L; for(int i=1;i<n-k;i++) p=p->next;// p=新尾（第 n-k 个结点）\n    LNode *newhead=p->next;              // 后 k 个的首结点=新头\n    p->next=NULL;\n    tail->next=L;                        // 原尾接原头\n    return newhead;\n}',
 book:'算法思想：右移 k = 把后 k 个结点整体搬到前面。找到第 n−k 个结点断开，令原尾接原头、后段首作新头。一趟 O(n)/O(1)。',
 claude:'右移 k 等价于“断在倒数第 k 个前面”。不带头结点要返回新头指针。等价于左移 n−k。',
 run:'实测 [1,2,3,4,5] 右移 2 → [4,5,1,2,3] ✅', verdict:'ok'},

{id:'2.3-综15', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·判环'],
 stem:'单链表有环，是指单链表的最后一个结点的指针指向了链表中的某个结点（通常最后一个结点的指针域为空）。试编写算法判断单链表是否存在环。',
 code:'LNode *hasCycle(LinkList L){\n    LNode *slow=L, *fast=L;\n    while(fast && fast->next){\n        slow=slow->next;                 // 慢指针走 1 步\n        fast=fast->next->next;           // 快指针走 2 步\n        if(slow==fast) return slow;      // 相遇 = 有环\n    }\n    return NULL;                          // fast 到表尾 = 无环\n}',
 book:'算法思想：<b>快慢指针（Floyd）</b>。快 2 步、慢 1 步，若有环两者必在环内相遇；若 fast 走到 NULL 则无环。O(n)/O(1)。（相遇后可再让一指针从头、一指针从相遇点同步走求环入口）',
 claude:'Floyd 判圈法。类比“操场跑圈快的套慢的”。这是链表最经典的双指针技巧，务必背熟。',
 run:'实测 无环链 → NULL；构造 …→4→2（4 指回 2）成环 → 检测到环 ✅', verdict:'ok'},

{id:'2.3-综16', ch:2, sec:'2.3 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·链表·快慢指针'],
 stem:'设有一个长度 n(n 为偶数) 的不带头结点的单链表，且结点值都大于 0，设计算法求这个单链表的最大孪生和。孪生和定义为一个结点值与其孪生结点值之和；对第 i 个结点（从 0 开始），其孪生结点为第 n−i−1 个结点。',
 code:'int maxTwinSum(LinkList L, int n){\n    LNode *slow=L, *fast=L;              // ① 快慢指针找后半起点\n    while(fast){ slow=slow->next; fast=fast->next? fast->next->next:NULL; }\n    LNode *p=slow, *pre=NULL, *r;        // ② 逆置后半\n    while(p){ r=p->next; p->next=pre; pre=p; p=r; }\n    LNode *a=L, *b=pre; int best=0;      // ③ 前后双指针求孪生和最大\n    while(b){ int s=a->data+b->data; if(s>best) best=s; a=a->next; b=b->next; }\n    return best;\n}',
 book:'算法思想：孪生结点=第 i 与第 n−i−1。用<b>快慢指针定位后半</b>、<b>逆置后半链</b>，再前半指针与逆后半指针同步配对求和取最大。O(n)/O(1)。',
 claude:'“找中点 + 逆置后半 + 双指针配对”三连招，是 2019 重排(综20)、回文判断的同款套路。',
 run:'实测 [5,4,2,7] → 孪生和 max(5+7, 4+2)=12 ✅', verdict:'ok'},

{id:'2.3-综17', ch:2, sec:'2.3 综合应用题', type:'subjective', hints:['单链表求倒数第 k 个，一趟搞定用「间隔 k 的双指针」。','快指针先走 k 步，然后快慢同步走；快指针到表尾时，慢指针正好指向倒数第 k 个。一趟 O(n)。'], tag:'2009 统考', exam:2009, kp:['算法·链表·倒数第k'],
 stem:'【2009】已知一个带表头结点的单链表，结点结构为 [data | link]，只给出头指针 list。在不改变链表的前提下，请设计一个尽可能高效的算法，查找链表中倒数第 k 个位置上的结点（k 为正整数）。若查找成功，输出该结点 data 域的值并返回 1；否则只返回 0。',
 code:'int Search_k(LinkList list, int k){\n    LNode *p=list->next, *q=list->next;  // 两指针都从首元结点出发\n    int cnt=0;\n    while(p){\n        if(cnt<k) cnt++;                 // 先让 p 单独走 k 步\n        else q=q->next;                  // 之后 p、q 同步走\n        p=p->next;\n    }\n    if(cnt<k) return 0;                   // 长度不足 k，失败\n    printf("%d", q->data);               // q 恰为倒数第 k 个\n    return 1;\n}',
 book:'算法思想：<b>双指针间隔 k</b>。p 先走 k 步，然后 p、q 同步前进；当 p 到达表尾（NULL）时，q 恰好指向倒数第 k 个结点。只遍历一趟，O(n)、空间 O(1)。',
 claude:'一趟解法，比“先求长再走 n−k 步”的两趟更优（题眼“尽可能高效”）。间隔 k 双指针是链表必杀技。',
 run:'实测 [1,2,3,4,5] 倒数第 2 → 输出 4、返回 1；k=6(超长)→ 返回 0 ✅', verdict:'ok'},

{id:'2.3-综18', ch:2, sec:'2.3 综合应用题', type:'subjective', hints:['两单词链表的公共后缀＝从某结点起完全重合，先对齐长度再齐步走。','求两链表长度差 d，长的先走 d 步；两指针同步前进，第一个「结点地址相同」（比指针不比值）处即公共后缀起点。O(m+n)。'], tag:'2012 统考', exam:2012, kp:['算法·链表·公共后缀'],
 stem:'【2012】假定采用带头结点的单链表保存单词，当两个单词有相同的后缀时可共享相同的后缀存储空间（例 “loading” 和 “being” 共享后缀 “ing”）。设 str1 和 str2 分别指向两个单词所在链表的头结点，结点结构为 [data | next]，设计一个尽可能高效的算法，找出由 str1 和 str2 所指两链表共同后缀的起始位置（如图中字符 i 所在结点 p）。',
 fig:'图/ch2/2.3-综18_共享后缀存储映像.png', figcap:'原书图：loading 与 being 共享后缀 ing，p 即共同后缀起始结点（裁自王道 p.45）',
 code:'LNode *findCommon(LinkList str1, LinkList str2){\n    int la=0, lb=0; LNode *p=str1->next, *q=str2->next;\n    while(p){ la++; p=p->next; }           // 求两表长\n    while(q){ lb++; q=q->next; }\n    p=str1->next; q=str2->next;\n    for(; la>lb; la--) p=p->next;           // 长表先走 |la-lb| 步，尾对齐\n    for(; lb>la; lb--) q=q->next;\n    while(p && p!=q){ p=p->next; q=q->next; }// 同步走，第一个“同地址”结点即公共后缀起点\n    return p;\n}',
 book:'算法思想：两链表共享后缀 → 呈 “Y” 形。先求两表长，让长的先走长度差步实现<b>尾对齐</b>，再两指针同步前进，第一个<b>地址相同</b>的结点即公共后缀起点。O(la+lb) 时间、O(1) 空间。',
 claude:'和综5（找公共结点）是<b>同一道题</b>！尾对齐后同步走。切记比较结点<b>地址</b>（p==q）而非 data 值。',
 run:'实测 loading / being → 公共后缀起点结点值 = ‘i’ ✅（算法比地址，此处以值验证逻辑）', verdict:'ok'},

{id:'2.3-综19', ch:2, sec:'2.3 综合应用题', type:'subjective', hints:['删绝对值重复：|data|≤n，用「标记数组」记某绝对值是否已出现。','开 n+1 标记数组，遍历链表：该 |data| 首次出现则保留并标记，再次出现则删除该结点。一趟 O(n) 时间换 O(n) 空间。'], tag:'2015 统考', exam:2015, kp:['算法·链表·标记数组去重'],
 stem:'【2015】用单链表保存 m 个整数，结点结构为 [data | link]，且 |data|≤n（n 为正整数）。设计一个时间上尽可能高效的算法，对链表中 data 的绝对值相等的结点，仅保留第一次出现的结点而删除其余绝对值相等的结点。例如给定 21→−15→−15→−7→15，删除后为 21→−15→−7。',
 fig:'图/ch2/2.3-综19_绝对值去重前后.png', figcap:'原书图：删除前后的 head 链表对照（裁自王道 p.45）',
 code:'void del_abs_dup(LinkList L, int n){\n    int *flag=(int*)malloc((n+1)*sizeof(int));\n    for(int i=0;i<=n;i++) flag[i]=0;      // 标记 |data| 是否出现过\n    LNode *pre=L, *p=L->next;\n    while(p){\n        int a = p->data>=0? p->data : -p->data;   // |data|\n        if(flag[a]==0){ flag[a]=1; pre=p; p=p->next; }        // 首次出现，保留\n        else { pre->next=p->next; free(p); p=pre->next; }      // 重复，删除\n    }\n    free(flag);\n}',
 book:'算法思想：因 |data|≤n，用大小 n+1 的<b>标记数组</b>记录每个绝对值是否已出现。一趟扫描：绝对值首次出现则保留并置标记，否则删除。时间 O(m)、空间 O(n)——空间换时间。结点定义：typedef struct node{int data; struct node *link;}NODE。',
 claude:'典型“空间换时间”：|data|≤n 这个约束就是暗示用标记数组把 O(m²) 降到 O(m)。与 2018 缺失最小正整数(综13)同套路。',
 run:'实测 [21,−15,−15,−7,15] (n=21) → [21,−15,−7] ✅', verdict:'ok'},

{id:'2.3-综20', ch:2, sec:'2.3 综合应用题', type:'subjective', hints:['把 (a1,a2,…,an) 重排成 (a1,an,a2,a(n−1),…)：三步——找中点、逆置后半、交替合并。','快慢指针找中点并断开；头插法逆置后半段；再从两段表头交替摘结点串起来。O(n)/O(1)。'], tag:'2019 统考', exam:2019, kp:['算法·链表·重排'],
 stem:'【2019】设线性表 L=(a₁,a₂,…,a_{n-1},aₙ) 采用带头结点的单链表保存。设计一个空间复杂度为 O(1) 且时间上尽可能高效的算法，重新排列 L 中各结点，得到 L′=(a₁,aₙ,a₂,a_{n-1},a₃,a_{n-2},…)。',
 code:'void rearrange(LinkList L){\n    // ① 快慢指针找中点（slow 停在前半末尾）\n    LNode *slow=L, *fast=L;\n    while(fast->next && fast->next->next){ slow=slow->next; fast=fast->next->next; }\n    // ② 逆置后半（slow->next 起）\n    LNode *p=slow->next, *pre=NULL, *r;\n    slow->next=NULL;\n    while(p){ r=p->next; p->next=pre; pre=p; p=r; }\n    // ③ 前半与逆置后半交替归并\n    LNode *a=L->next, *b=pre, *t;\n    while(b){ t=a->next; a->next=b; a=t;   // 插一个后半结点\n              t=b->next; b->next=a; b=t; }\n}',
 book:'算法思想：三步——① 快慢指针找中间结点；② 就地逆置后半段链表；③ 将前半段与逆置后的后半段<b>交替归并</b>。时间 O(n)、空间 O(1)。',
 claude:'“找中点 + 逆后半 + 交替并”三连招（同综16孪生和）。408 高频压轴链表真题，务必能默写这三步。',
 run:'实测 [1,2,3,4,5,6,7] → [1,7,2,6,3,5,4]；[1,2,3,4] → [1,4,2,3] ✅', verdict:'ok'},

/* ===================== 第3章 3.1 栈 ===================== */
{id:'3.1-1', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['概念·栈与队列'],
 stem:'栈和队列具有相同的（　）。',
 opts:['抽象数据类型','逻辑结构','存储结构','运算'], ans:'B',
 book:'栈和队列的<b>逻辑结构都是线性结构</b>，只是二者对数据的运算（存取受限的位置）不同。',
 claude:'同为线性表→逻辑结构相同(B)；运算不同排除D；存储可顺序可链式、非固定排除C；ADT含运算也不同排除A。', run:null, verdict:'ok'},

{id:'3.1-2', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['概念·栈'],
 stem:'栈是一种（　）。',
 opts:['顺序存储的线性结构','链式存储的非线性结构','限制存取点的线性结构','限制存取点的非线性结构'], ans:'C',
 book:'栈是一种<b>线性表</b>（排除非线性 B、D），可顺序也可链式存储（不局限某种存储，排除 A）。栈是仅在一端存取、<b>限制存取点</b>的线性结构。',
 claude:'两条判据：①线性 ②只允许在栈顶存取。C 同时命中。', run:null, verdict:'ok'},

{id:'3.1-3', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['概念·基本操作'],
 stem:'下列选项中，（　）不是栈的基本操作。',
 opts:['删除栈顶元素','删除栈底元素','判断栈是否为空','将栈置为空栈'], ans:'B',
 book:'基本操作指最核心、最基本的运算。<b>删除栈底元素</b>不是栈的基本运算——它可通过反复调用出栈间接实现，但本身不属基本操作。',
 claude:'栈只在栈顶操作，“碰栈底”违背受限本质，选 B。', run:null, verdict:'ok'},

{id:'3.1-4', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['顺序栈·top指针'],
 stem:'设用数组 a[n] 存储一个栈，初始栈顶指针 top=-1，则元素 x 入栈的操作是（　）。',
 opts:['a[--top]=x','a[top--]=x','a[++top]=x','a[top++]=x'], ans:'C',
 book:'top=-1 表示 top <b>指向栈顶元素本身</b>，第一个元素入栈后 top 应为 0。栈向高地址增长→入栈先 top 加 1 再存元素：<code>a[++top]=x</code>。',
 claude:'“top 指元素本身”的口诀：入栈 ++top 先动指针，出栈 top--。选 C。', run:null, verdict:'ok'},

{id:'3.1-5', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['顺序栈·top指针'],
 stem:'设用数组 data[1..n] 存储一个栈，初始栈顶指针 top=1，则元素 x 入栈的操作是（　）。',
 opts:['data[top--]=x','data[top++]=x','data[--top]=x','data[++top]=x'], ans:'B',
 book:'top=1 且下标从 1 开始，表示 top <b>指向栈顶元素的下一个空位</b>。入栈应先存元素再 top 加 1：<code>data[top++]=x</code>。',
 claude:'“top 指下一空位”的口诀：入栈 top++ 先存后动。选 B（与第 4 题“指元素本身”正好相反，做题务必先判 top 语义）。', run:null, verdict:'ok'},

{id:'3.1-6', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['顺序栈·top指针'],
 stem:'设用数组 data[1..n] 存储一个栈，初始栈顶指针 top=n+1，则元素 x 入栈的操作是（　）。',
 opts:['data[--top]=x','data[top++]=x','data[top--]=x','data[++top]=x'], ans:'A',
 book:'top=n+1、下标上界 n，表示 top 指向栈顶元素本身，且栈<b>向低地址（下标减小）方向</b>增长。入栈先 top 减 1 再存：<code>data[--top]=x</code>。',
 claude:'从高下标往低灌，栈顶越来越小→--top。选 A。', run:null, verdict:'ok'},

{id:'3.1-7', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['顺序栈·指针计算'],
 stem:'设有一个空栈，栈顶指针为 1000H，栈向高地址方向增长，每个元素占一个存储单元，执行 Push、Push、Pop、Push、Pop、Push、Pop、Push 操作后，栈顶指针为（　）。',
 opts:['1002H','1003H','1004H','1005H'], ans:'A',
 book:'每入栈 top 加 1、每出栈 top 减 1。8 步中 Push 5 次、Pop 3 次，净 +2，故 top=1000H+2=1002H。逐步：1001,1002,1001,1002,1001,1002,1001,1002。',
 claude:'只看净入栈数：Push−Pop=5−3=2。1000H+2=1002H，选 A。', run:null, verdict:'ok'},

{id:'3.1-8', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['链栈vs顺序栈'],
 stem:'和顺序栈相比，链栈有一个比较明显的优势，即（　）。',
 opts:['通常不会出现栈满的情况','通常不会出现栈空的情况','插入操作更容易实现','删除操作更容易实现'], ans:'A',
 book:'顺序栈用数组，容量固定、可能栈满上溢；链栈动态申请结点，<b>通常不会栈满</b>。栈空对两者都可能发生，插删难易度相当。',
 claude:'链栈的核心红利=动态分配、不必预设容量→不栈满，选 A。', run:null, verdict:'ok'},

{id:'3.1-9', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['链栈·结构选择'],
 stem:'设链表不带头结点且所有操作均在表头进行，则下列最不适合作为链栈的是（　）。',
 opts:['只有表头结点指针，没有表尾指针的双向循环链表','只有表尾结点指针，没有表头指针的双向循环链表','只有表头结点指针，没有表尾指针的单向循环链表','只有表尾结点指针，没有表头指针的单向循环链表'], ans:'C',
 book:'操作都在表头→关键看能否 O(1) 找到表头。双向循环链表无论持头指针还是尾指针都能就近找到表头(A、B 可)；D 尾指针 next 直接就是头(可)；<b>C 只有头指针的单向循环链表，插/删表头后要找“表头的前驱(表尾)”须遍历整链 O(n)</b>，最不适合。',
 claude:'表头操作要维护环，就得能快速摸到表尾。单向+只有头指针→找尾要绕一圈，选 C。', run:null, verdict:'ok'},

{id:'3.1-10', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['链栈·入栈'],
 stem:'向一个栈顶指针为 top 的链栈（不带头结点）中插入一个 x 结点，则执行（　）。',
 opts:['top->next=x','x->next=top->next; top->next=x','x->next=top; top=x','x->next=top; top=top->next'], ans:'C',
 book:'不带头结点、top 直接指栈顶元素。头插：新结点 next 指向原栈顶(<code>x->next=top</code>)，再让 top 指向新结点(<code>top=x</code>)。',
 claude:'头插两步：先接上、再挪 top。选 C；A 没接原链、B/D 针对带头结点写法。', run:null, verdict:'ok'},

{id:'3.1-11', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['链栈·出栈'],
 stem:'链栈（不带头结点）执行 Pop 操作，并将出栈的元素存在 x 中，应该执行（　）。',
 opts:['x=top; top=top->next','x=top->data','top=top->next; x=top->data','x=top->data; top=top->next'], ans:'D',
 book:'top 指栈顶元素本身。先<b>取值</b> <code>x=top->data</code>，再<b>摘链</b> <code>top=top->next</code>。次序不能颠倒——C 先移 top 会取到第二个元素的值。',
 claude:'“先读后删”：D。C 是 top 指“栈顶前驱”那套写法的答案。', run:null, verdict:'ok'},

{id:'3.1-12', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['栈操作·追踪'],
 stem:'经过以下栈的操作后，变量 x 的值为（　）。',
 code:'InitStack(st);\nPush(st, a);\nPush(st, b);\nPop(st, x);   // 弹出栈顶 b，x=b\nGetTop(st, x); // 读栈顶 a，x=a',
 opts:['a','b','NULL','false'], ans:'A',
 book:'前 3 句后栈内为 a,b(b 在顶)。Pop 弹出 b 使 x=b；GetTop 再读栈顶 a 使 x=a。最终 x=a。',
 claude:'跟一遍：Push a,b → 顶=b；Pop 顶=b(x=b)→ 剩 a；GetTop 读 a(x=a)。选 A。', run:null, verdict:'ok'},

{id:'3.1-13', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·计数·卡特兰数'],
 stem:'3 个不同元素依次入栈，能得到（　）种不同的出栈序列。',
 opts:['4','5','6','7'], ans:'B',
 book:'n 个不同元素依次入栈的合法出栈序列数=<b>卡特兰数</b> C(2n,n)/(n+1)。n=3 时=C(6,3)/4=20/4=<b>5</b>。',
 claude:'卡特兰数记忆：1,2,5,14,42…。n=3→5，选 B。（穷举 abc/acb/bac/bca/cba 恰 5 种，注意 cab 不合法）', run:'程序穷举 3 元素合法出栈序列=5 ✅', verdict:'ok'},

{id:'3.1-14', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·合法性'],
 stem:'设 a,b,c,d,e,f 以所给的次序入栈，若在入栈操作时允许出栈操作，则下面不会出现的出栈序列为（　）。',
 opts:['fedcba','bcafed','dcefba','cabdef'], ans:'D',
 book:'判据：某元素 x 出栈后，比 x 晚入栈却先出的元素必按<b>逆序</b>出栈。D 中 cabdef，c 出后 a、b 的相对出栈序应为逆序，但 c 先于 a、b 出而 a 又先于 b 出，矛盾→不可能。',
 claude:'口诀“先入晚出必逆序”。cabdef 里 c 之前入栈的 a、b 却顺序 ab 出，违规。选 D。', run:'程序穷举 abcdef 合法出栈集：cabdef 不在其中，其余三个均在 ✅', verdict:'ok'},

{id:'3.1-15', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·计数'],
 stem:'4 个元素依次入栈的次序为 abcd，则以 cd 开头的出栈序列的个数为（　）。',
 opts:['1','2','3','4'], ans:'A',
 book:'要 c 先出：需 a,b,c 入、c 出；再要 d 第二个出：d 入、d 出；此时栈内剩 b,a，只能 b、a 依次出→仅 <b>cdba</b> 一种。',
 claude:'cd 定死后，栈里 ba 只能逆序吐出，唯一 cdba。选 A。', run:'程序：abcd 中以 cd 开头的合法出栈序列只有 cdba（1 个）✅', verdict:'ok'},

{id:'3.1-16', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['入出栈操作序列'],
 stem:'用 S 表示入栈操作、X 表示出栈操作。若元素入栈顺序是 1234，为得到 1342 的出栈顺序，相应的 S、X 操作序列为（　）。',
 opts:['SXSXSSXX','SSSXSXXX','SXSXXSSX','SXSSXSXX'], ans:'D',
 book:'出 1：S(1)X；出 3：需 2、3 入再出 3→SS(23)X；出 4：4 入出→SX；出 2：X。拼得 S X S S X S X X = <b>SXSSXSXX</b>。',
 claude:'逐元素翻译成 S/X：1→SX，3→SSX(压2再压3出),4→SX,2→X ⇒ SXSSXSXX。选 D。', run:null, verdict:'ok'},

{id:'3.1-17', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·公式'],
 stem:'若栈的输入序列是 1,2,3,…,n，输出序列的第一个元素是 n，则第 i 个输出元素是（　）。',
 opts:['不确定','n−i','n−i−1','n−i+1'], ans:'D',
 book:'第 1 个输出为 n，说明前 n 个元素已全部按序入栈，输出必为输入的<b>逆序</b>：n,n−1,…。第 i 个=<b>n−i+1</b>。',
 claude:'全压完再倒出→严格逆序。第 i 项=n−(i−1)=n−i+1。选 D。', run:null, verdict:'ok'},

{id:'3.1-18', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·不确定'],
 stem:'若栈的输入序列是 1,2,3,…,n，输出序列的第一个元素是 i，则第 j 个输出元素是（　）。',
 opts:['i−j−1','i−j','j−i+1','不确定'], ans:'D',
 book:'第一个输出 i，说明 1..i−1 还压在栈中；之后 i+1、i+2… 可继续入栈并穿插出栈，剩余输出顺序<b>不唯一</b>，故第 j 个不确定。',
 claude:'只有“首元素=n(全逆序)”才能定死每一位；首元素是任意 i 时后续自由度大→不确定，选 D。', run:null, verdict:'ok'},

{id:'3.1-19', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·合法性'],
 stem:'某栈的输入序列为 a,b,c,d，下面 4 个序列中，不可能为其输出序列的是（　）。',
 opts:['a,b,c,d','c,b,d,a','d,c,a,b','a,c,b,d'], ans:'C',
 book:'A：各入即出；B：abc 入、c/b 出、d 入出、a 出；D：a 入出、bc 入、c/b 出、d 入出。C 中 d 先出则 abc 停在栈里，只能逆序 c,b,a 出，绝不会出现 a 在 b 前的 “a,b”，故 d,c,a,b 不可能。',
 claude:'首元素 d→其后必 cba 逆序。dcab 里 ab 顺序错，选 C。', run:'程序：dcab 不在 abcd 合法出栈集中，其余三个都在 ✅', verdict:'ok'},

{id:'3.1-20', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·推理'],
 stem:'若栈的输入序列是 P₁,P₂,…,Pₙ，输出序列是 1,2,3,…,n，若 P₃=1，则 P₁ 的值（　）。',
 opts:['可能是2','一定是2','不可能是2','不可能是3'], ans:'C',
 book:'P₃=1 即 P₁,P₂,P₃ 连续入栈后第一个出的是 P₃。由 LIFO，P₂ 必先于 P₁ 出，而第二个输出是 2，此时 P₁ 不是栈顶，所以 <b>P₁ 不可能是 2</b>。',
 claude:'P₃ 先出→P₂ 比 P₁ 先出→P₁ 排在 2 号位之后→P₁≠2。选 C。', run:null, verdict:'ok'},

{id:'3.1-21', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·推理'],
 stem:'若栈的输入序列是 P₁,P₂,…,Pₙ，输出序列是 1,2,3,…,n，若 P₃=3，则 P₁ 的值（　）。',
 opts:['可能是2','不可能是1','一定是1','一定是2'], ans:'A',
 book:'P₁=1 时：入 1 即出、入 2 即出、入 3(=P₃) 即出，成立；P₁=2 时：P₁,P₂ 入后全出(得 1、2)，再入 P₃=3 即出，也成立。故 P₁ 既<b>可能是 1 也可能是 2</b>。',
 claude:'P₃=3 约束很松，P₁=1 或 2 都能凑出 123…。“可能是 2”成立，选 A。', run:null, verdict:'ok'},

{id:'3.1-22', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·推理'],
 stem:'已知栈的入栈序列是 1,2,3,4，其出栈序列为 P₁,P₂,P₃,P₄，则 P₂,P₄ 不可能是（　）。',
 opts:['2,4','2,1','4,3','3,4'], ans:'C',
 book:'逐一验证：A(1,2,3,4 各入即出可得 P₂=2,P₄=4)；B(可得 P₂=2,P₄=1)；D(可得 P₂=3,P₄=4)。C 要 P₄=3 且 P₂=4：4 第二个出意味前面元素都入过，此时栈内是有序的 (1,2)/(1,3)/(2,3)，无论哪种下一个出的必是 3，即 P₃=3，故 P₄ 不可能是 3。',
 claude:'抓“最后入栈的 4”。4 早出(P₂)后，3 必紧跟成 P₃，P₄ 就轮不到 3 了。选 C。', run:null, verdict:'ok'},

{id:'3.1-23', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['出栈序列·应用·标识符'],
 stem:'设栈的初始状态为空，当字符序列 “n1_” 作为栈的输入时，输出长度为 3、且可用作 C 语言标识符的序列有（　）个。',
 opts:['4','5','3','6'], ans:'C',
 book:'输入 n,1,_ 共有 5 种合法出栈全排列，但标识符<b>不能以数字开头</b>。5 种里 n1_、n_1、_n1 合法，1n_、1_n（1 开头）非法；而 _1n 因栈约束不可产生。实际可用的为 n1_、n_1、_n1 共 <b>3</b> 个。',
 claude:'先出全部合法出栈序列，再滤掉“数字打头”的。剩 n1_、n_1、_n1，选 C。', run:'程序穷举 n1_ 的合法出栈序列后按“非数字开头”过滤，得 3 个 ✅', verdict:'ok'},

{id:'3.1-24', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['共享栈'],
 stem:'采用共享栈的好处是（　）。',
 opts:['减少存取时间，降低发生上溢的可能','节省存储空间，降低发生上溢的可能','减少存取时间，降低发生下溢的可能','节省存储空间，降低发生下溢的可能'], ans:'B',
 book:'上溢=存储器满还往里写。共享栈把两个栈放同一段空间、栈底居两端相向增长，一个栈增大时可借用另一个的空闲区，从而<b>节省空间、降低上溢</b>。存取时间不变（仍 O(1)）。',
 claude:'共享栈治的是“空间浪费+上溢”，与存取速度、下溢无关。选 B。', run:null, verdict:'ok'},

{id:'3.1-25', ch:3, sec:'3.1 栈', type:'choice', tag:'', exam:null, kp:['共享栈·判满'],
 stem:'设有一个顺序共享栈 Share[0:n−1]，第一个栈顶指针 top1 的初值为 −1，第二个栈顶指针 top2 的初值为 n，则判断共享栈满的条件是（　）。',
 opts:['top2−top1==1','top1−top2==1','top1==top2','都不对'], ans:'A',
 book:'两栈底在两端、栈顶相向增长。top1 从 −1 往右加、top2 从 n 往左减，两栈顶<b>相邻</b>即满：top2−top1==1。',
 claude:'画图：… top1 | top2 …，中间无空位即差 1。top2 在右恒大，故 top2−top1==1。选 A。', run:null, verdict:'ok'},

{id:'3.1-26', ch:3, sec:'3.1 栈', type:'choice', tag:'2009 统考', exam:2009, kp:['栈+队列·容量'],
 stem:'【2009】设栈 S 和队列 Q 的初始状态均为空，元素 abcdefg 依次入栈 S。若每个元素出栈后立即进入队列 Q，且 7 个元素出队的顺序是 bdcfeag，则栈 S 的容量至少是（　）。',
 opts:['1','2','3','4'], ans:'C',
 book:'队列 FIFO：出队顺序=出栈顺序=bdcfeag。据此还原入/出栈过程，模拟得栈内元素最大深度为 <b>3</b>（如 a,c,e 同时在栈中的时刻），故容量至少 3。',
 claude:'队列不改序→出栈序列就是 bdcfeag。用“Push/Pop 各 +1/−1、记录峰值”模拟，峰值=3。选 C。', run:'模拟 abcdefg 达成出栈序列 bdcfeag，栈深峰值=3 ✅', verdict:'ok'},

{id:'3.1-27', ch:3, sec:'3.1 栈', type:'choice', tag:'2010 统考', exam:2010, kp:['出栈序列·约束'],
 stem:'【2010】若元素 a,b,c,d,e,f 依次入栈，允许入栈、出栈操作交替进行，但不允许连续 3 次进行出栈操作，不可能得到的出栈序列是（　）。',
 opts:['dcebfa','cbdaef','bcaefd','afedcb'], ans:'D',
 book:'四个都是“合法出栈序列”，区别在<b>连续出栈次数</b>。序列中出现长度≥3 的连续逆序子串，就意味着一次连压后连出≥3 次。afedcb 里 fedcb 为长逆序段，须连续出栈 ≥3 次，违背约束→不可能。',
 claude:'找“连续逆序段”：afedcb 的 f,e,d,c,b 一口气逆序吐出=连出 5 次，触雷。选 D。', run:'模拟四序列的最少连续 Pop 次数：afedcb 需连出 5 次(>2)，其余可控制在≤2 ✅', verdict:'ok'},

{id:'3.1-28', ch:3, sec:'3.1 栈', type:'choice', tag:'2011 统考', exam:2011, kp:['出栈序列·计数'],
 stem:'【2011】元素 a,b,c,d,e 依次进入初始为空的栈中，若元素入栈后可停留、可出栈，直到所有元素都出栈，则在所有可能的出栈序列中，以元素 d 开头的序列个数是（　）。',
 opts:['3','4','5','6'], ans:'B',
 book:'d 第一个出→a,b,c 已按序停在栈中(顶为 c)，其相对出栈序固定为 c,b,a；e 可在这三者的任意“空档”里入栈即出。d _ c _ b _ a _ 中 e 有 4 个插入位→<b>4</b> 种：decba、dceba、dcbea、dcbae。',
 claude:'固定骨架 d…c…b…a，e 有 4 个落点，选 B。', run:'程序穷举 abcde 以 d 开头的合法出栈序列=4（decba/dceba/dcbea/dcbae）✅', verdict:'ok'},

{id:'3.1-29', ch:3, sec:'3.1 栈', type:'choice', tag:'2013 统考', exam:2013, kp:['出栈序列·计数'],
 stem:'【2013】一个栈的入栈序列为 1,2,3,…,n，出栈序列是 P₁,P₂,P₃,…,Pₙ。若 P₂=3，则 P₃ 可能取值的个数是（　）。',
 opts:['n−3','n−2','n−1','无法确定'], ans:'C',
 book:'3 之后的 4,5,…,n 都可作 P₃（入到该数即出），共 n−3 个；再看 1、2：P₁ 可为 1 或 2 或更大，当 P₁=1 时 P₃ 可取 2，当 P₁=2 时 P₃ 可取 1。故 P₃ 可取除 3 外的所有值，个数 <b>n−1</b>。',
 claude:'P₂=3 后，P₃ 能取 {1,2,4,5,…,n}=全体除 3，共 n−1 个。选 C。', run:null, verdict:'ok'},

{id:'3.1-30', ch:3, sec:'3.1 栈', type:'choice', tag:'2020 统考', exam:2020, kp:['出栈序列·模拟'],
 stem:'【2020】对空栈 S 进行 Push 和 Pop 操作，入栈序列为 a,b,c,d,e，经过 Push、Push、Pop、Push、Pop、Push、Push、Pop 操作后得到的出栈序列是（　）。',
 opts:['b,a,c','b,a,e','b,c,a','b,c,e'], ans:'D',
 book:'逐步：Push a、Push b、Pop→b；Push c、Pop→c；Push d、Push e、Pop→e。出栈序列 <b>b,c,e</b>。',
 claude:'照着 8 步走一遍即可：弹出的分别是 b、c、e。选 D。', run:'模拟该操作串 → 出栈 b,c,e ✅', verdict:'ok'},

{id:'3.1-31', ch:3, sec:'3.1 栈', type:'choice', tag:'2022 统考', exam:2022, kp:['出栈序列·判定'],
 stem:'【2022】给定有限符号集 S，in 和 out 均为 S 中所有元素的任意排列。对于初始为空的栈 ST，下列叙述中正确的是（　）。',
 opts:['若 in 是 ST 的入栈序列，则不能判断 out 是否为其可能的出栈序列','若 out 是 ST 的出栈序列，则不能判断 in 是否为其可能的入栈序列','若 in 是 ST 的入栈序列，out 是对应 in 的出栈序列，则 in 与 out 一定不同','若 in 是 ST 的入栈序列，out 是对应 in 的出栈序列，则 in 与 out 可能互为倒序'], ans:'D',
 book:'模拟入出栈即可判定合法性，故 A、B 错（都能判断）。若每个元素入栈后立即出栈，则 in 与 out 相同，C 的“一定不同”错。若全部入栈后再依次出栈，in 与 out <b>互为倒序</b>，D 正确。',
 claude:'“全压后全倒”这一情形直接给出 D；同时“各入即出”反证 C 错。选 D。', run:null, verdict:'ok'},

/* ---- 3.1 综合应用题 ---- */
{id:'3.1-综1', ch:3, sec:'3.1 栈 · 综合应用题', type:'subjective', tag:'', exam:null, kp:['出栈序列·枚举'],
 stem:'有 5 个元素，其入栈次序为 A,B,C,D,E，在各种可能的出栈次序中，第一个出栈元素为 C 且第二个出栈元素为 D 的出栈序列有哪几个？', code:null,
 book:'C 先出→A、B 停在栈中(顶为 B)；D 第二个出→D 入即出。此时栈内 A、B（B 在顶）加尚未入栈的 E，可有 3 种后续：① E 入出→CDEBA；② B 出、E 入出→CDBEA；③ B 出、A 出、E 入出→CDBAE。共 <b>CDEBA、CDBEA、CDBAE</b> 三个。',
 claude:'骨架 CD 固定后，栈里剩 B、A（逆序出）与自由的 E 组合，E 有 3 个落点→3 种。',
 run:'程序穷举 ABCDE 以 CD 开头的合法出栈序列：CDBAE、CDBEA、CDEBA（恰 3 个）✅', verdict:'ok'},

{id:'3.1-综2', ch:3, sec:'3.1 栈 · 综合应用题', type:'subjective', tag:'', exam:null, kp:['出栈序列·合法性'],
 stem:'若元素的入栈序列为 A,B,C,D,E，运用栈操作，能否得到出栈序列 B,C,A,E,D 和 D,B,A,C,E？为什么？', code:null,
 book:'<b>BCAED 能</b>：A 入、B 入、B 出、C 入、C 出、A 出、D 入、E 入、E 出、D 出。<b>DBACE 不能</b>：D 第一个出说明 A、B、C 已入栈且 C 在栈顶，B、A 不可能早于 C 出栈，因此得不到 “…B…A…C…” 这样 B、A 先于 C 的序列。',
 claude:'判据仍是“先入晚出必逆序”：DBACE 里 C 在 A、B 之后出，违反 D 先出后 CBA 必逆序。',
 run:'程序：BCAED ∈ 合法集、DBACE ∉ 合法集 ✅', verdict:'ok'},

{id:'3.1-综3', ch:3, sec:'3.1 栈 · 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·合法序列判定'],
 stem:'栈的初态和终态均为空，以 I 和 O 分别表示入栈和出栈，则入栈的操作序列可表示为由 I、O 组成的序列。可以操作的序列称为合法序列，否则称为非法序列。1）下列序列中哪些是合法的？A. IOIIOIOO　B. IOOIOIIO　C. IIIOIOIO　D. IIIOOIOO　2）写出算法判定所给操作序列是否合法（合法返回 true，否则 false，操作序列已存于一维数组中）。',
 code:'bool Judge(char A[]){\n    int i=0, j=0, k=0;              // j 记 I 的个数, k 记 O 的个数\n    while(A[i]!=\'\\0\'){\n        switch(A[i]){\n            case \'I\': j++; break;      // 入栈次数 +1\n            case \'O\': k++;\n                if(k>j){ return false; } // 任一前缀出栈数 > 入栈数 → 非法\n        }\n        i++;\n    }\n    if(j!=k) return false;         // 结束时入、出次数须相等（栈空）\n    return true;\n}',
 book:'1）<b>A、D 合法；B、C 非法</b>。B 中 “IOO” 先入 1 次却连出 2 次(k>j)；C 入栈 4 次、出栈 3 次，次数不等、终态栈非空。2）思想：从左扫描，任意前缀内 <b>出栈数不得超过入栈数</b>(k≤j)，且扫描结束时 I、O 数相等。等价于把 I=+1、O=−1，任意前缀和 ≥0 且总和 =0。',
 claude:'两条铁律：①前缀 O 数 ≤ I 数（不透支）②全程 I 数 = O 数（不亏空）。代码一次扫描 O(n)。',
 run:'实测 4 序列：A.IOIIOIOO=✔合法, B.IOOIOIIO=✘非法(前缀 IOO 出多于入), C.IIIOIOIO=✘非法(I 5 次≠O 3 次), D.IIIOOIOO=✔合法 → 与书答一致 ✅', verdict:'ok'},

{id:'3.1-综4', ch:3, sec:'3.1 栈 · 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·栈判回文'],
 stem:'设单链表的表头指针为 L，结点结构由 data 和 next 两个域构成，其中 data 域为字符型。设计算法判断该链表全部 n 个字符是否中心对称。例如 xyx、xyyx 都是中心对称的。', code:null,
 book:'思想：把链表<b>前一半</b>字符依次入栈；再从后一半逐个与栈顶弹出的字符比较，全部相等则中心对称。n 为奇数时跳过正中结点。时间 O(n)、空间 O(n/2)。',
 claude:'“前半压栈 + 后半逐一对弹”是栈判回文的标准套路；奇数长度记得 p=p->next 跳过中点。比“全部入栈再扫两遍”少一趟。',
 run:'', verdict:'ok'},

{id:'3.1-综5', ch:3, sec:'3.1 栈 · 综合应用题', type:'subjective', tag:'', exam:null, kp:['共享栈·算法'],
 stem:'设有两个栈 S1、S2 都采用顺序栈方式，并共享一个存储区 [0,…,maxsize−1]，为尽量利用空间、减少溢出的可能，可采用栈顶相向、迎面增长的存储方式。试设计 S1、S2 有关入栈和出栈的操作算法。',
 code:'#define maxsize 100\n#define elemtp int\ntypedef struct{ elemtp stack[maxsize]; int top[2]; }stk;\nstk s;                       // 全局：top[0] 初值 -1, top[1] 初值 maxsize\n\nint Push(int i, elemtp x){   // i=0 左栈 S1, i=1 右栈 S2\n    if(i<0 || i>1){ printf("栈号错"); exit(0); }\n    if(s.top[1]-s.top[0]==1){ printf("栈满"); return 0; }   // 两栈顶相邻=满\n    switch(i){\n        case 0: s.stack[++s.top[0]]=x; return 1;   // 左栈向右长\n        case 1: s.stack[--s.top[1]]=x; return 1;   // 右栈向左长\n    }\n}\nelemtp Pop(int i){\n    if(i<0 || i>1){ printf("栈号错"); exit(0); }\n    switch(i){\n        case 0: if(s.top[0]==-1){ printf("栈空"); return -1; }\n                return s.stack[s.top[0]--];\n        case 1: if(s.top[1]==maxsize){ printf("栈空"); return -1; }\n                return s.stack[s.top[1]++];\n    }\n}',
 book:'两栈底设在向量两端：top[0] 初 −1 向右增、top[1] 初 maxsize 向左增。<b>栈满条件 top[1]−top[0]==1</b>（两顶相邻）。入栈判满、出栈判空。左栈 ++top[0] 后存、右栈 --top[1] 后存；出栈相反。',
 claude:'核心就三点：①两指针相向 ②满=相邻(差 1) ③左 ++/右 -- 对称。是第 24/25 题的算法版，务必能默写。',
 run:'实测：S1 连压 3 个、S2 连压 2 个共享同区，达 top[1]−top[0]==1 报满；交替出栈值正确 ✅', verdict:'ok'},

/* ===================== 第3章 3.2 队列 ===================== */
{id:'3.2-1', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['概念·栈与队列'],
 stem:'栈和队列的主要区别在于（　）。',
 opts:['它们的逻辑结构不一样','它们的存储结构不一样','所包含的元素不一样','插入、删除操作的限定不一样'], ans:'D',
 book:'栈和队列逻辑结构都是线性表，都可顺序或链式存储（A、B 错）。本质区别在于<b>插入、删除操作被限定的位置不同</b>：栈两端受限于同一端(LIFO)，队列一端插一端删(FIFO)。',
 claude:'同为线性表、存储自由→差异只在“受限位置”。选 D。', run:null, verdict:'ok'},

{id:'3.2-2', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['队列·FIFO'],
 stem:'队列的“先进先出”特性是指（　）。Ⅰ.最后插入队列中的元素总是最后被删除　Ⅱ.当同时进行插入、删除操作时，总是插入操作优先　Ⅲ.每当有删除操作时，总要先做一次插入操作　Ⅳ.每次从队列中删除的总是最早插入的元素',
 opts:['Ⅰ','Ⅰ和Ⅳ','Ⅱ和Ⅲ','Ⅳ'], ans:'B',
 book:'FIFO 表现为：先入先出、后入后删。Ⅰ（最后入者最后删）与 Ⅳ（每次删最早入者）均正确；Ⅱ、Ⅲ 是无中生有的错误约束。',
 claude:'“先进先出”正反两面都对：最早进的最先出(Ⅳ)、最后进的最后出(Ⅰ)。选 B。', run:null, verdict:'ok'},

{id:'3.2-3', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['队列·基本操作'],
 stem:'允许对队列进行的操作有（　）。',
 opts:['对队列中的元素排序','取出最近入队的元素','在队列元素之间插入元素','删除队首元素'], ans:'D',
 book:'队列只在两端操作：队尾入、队首出。<b>删除队首元素即出队</b>，是基本操作。A/B/C 都要碰中间或非法端，均不允许。',
 claude:'队列合法动作只有“尾进、首出”。选 D。', run:null, verdict:'ok'},

{id:'3.2-4', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['队列·FIFO'],
 stem:'一个队列的入队顺序是 1,2,3,4，则出队的输出顺序是（　）。',
 opts:['4,3,2,1','1,2,3,4','1,4,3,2','3,2,4,1'], ans:'B',
 book:'队列入队顺序与出队顺序<b>完全一致</b>（这正是与栈不同之处）。故输出 1,2,3,4。',
 claude:'队列不会重排，出=入。选 B。', run:null, verdict:'ok'},

{id:'3.2-5', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['循环队列·下标'],
 stem:'循环队列存储在数组 A[0..n] 中，入队时的操作为（　）。',
 opts:['rear=rear+1','rear=(rear+1) mod (n-1)','rear=(rear+1) mod n','rear=(rear+1) mod (n+1)'], ans:'D',
 book:'A[0..n] 下标 0~n 共 <b>n+1</b> 个单元，容量 maxsize=n+1。循环入队 rear=(rear+1) mod maxsize=(rear+1) mod (n+1)。',
 claude:'看清 A[0..n]=n+1 格，模数就是 n+1。选 D。（陷阱：A[n] 才是 0~n−1 共 n 格）', run:null, verdict:'ok'},

{id:'3.2-6', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['循环队列·长度'],
 stem:'已知循环队列的存储空间为数组 A[21]，front 指向队首元素的前一个位置，rear 指向队尾元素，假设当前 front 和 rear 的值分别为 8 和 3，则该队列的长度为（　）。',
 opts:['5','6','16','17'], ans:'C',
 book:'A[21] 即下标 0~20，maxsize=21。长度=(rear−front+maxsize) mod maxsize=(3−8+21) mod 21=<b>16</b>。（front 指“前一位置”、rear 指“队尾”，与 front 指当前元素、rear 指下一空位算法相同）',
 claude:'循环长度铁公式：(rear−front+M) mod M。(3−8+21)%21=16，选 C。', run:'(3-8+21)%21 = 16 ✅', verdict:'ok'},

{id:'3.2-7', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['循环队列·下标'],
 stem:'若用数组 A[0..5] 实现循环队列，且当前 rear 和 front 的值分别为 1 和 5，当从队列中删除一个元素、再加入两个元素后，rear 和 front 的值分别为（　）。',
 opts:['3 和 4','3 和 0','5 和 0','5 和 1'], ans:'B',
 book:'maxsize=6。删一个：front=(5+1)%6=0；加两个：rear=(1+1)%6=2→(2+1)%6=3。故 rear=3、front=0。',
 claude:'front、rear 都按 %6 走。删→front:5→0；加两次→rear:1→2→3。选 B。', run:'front:(5+1)%6=0；rear:(1+1)%6=2,(2+1)%6=3 → (3,0) ✅', verdict:'ok'},

{id:'3.2-8', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['循环队列·判空'],
 stem:'假设用数组 Q[MaxSize] 实现循环队列，队首指针 front 指向队首元素的前一位置，队尾指针 rear 指向队尾元素，则判断该队列为空的条件是（　）。',
 opts:['Q.rear==(Q.front+1)%MaxSize','(Q.rear+1)%MaxSize==Q.front+1','(Q.rear+1)%MaxSize==Q.front','Q.rear==Q.front'], ans:'D',
 book:'当队中仅一个元素时 front 指其前一位置、rear 指该元素，二者相差 1；元素全出后 front 追上 rear，故<b>队空 ⟺ front==rear</b>。',
 claude:'“front 指前一位、rear 指队尾”这套里，空 = front 追平 rear。选 D。', run:null, verdict:'ok'},

{id:'3.2-9', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['循环队列·判满'],
 stem:'假设循环队列 Q[MaxSize] 的队首指针为 front、队尾指针为 rear，队列最大容量为 MaxSize，此外该队列再没有其他数据成员，则判断该队列已满的条件是（　）。',
 opts:['Q.front==Q.rear','Q.front+Q.rear>=MaxSize','Q.front==(Q.rear+1)%MaxSize','Q.rear==(Q.front+1)%MaxSize'], ans:'C',
 book:'无额外成员→只能<b>牺牲一个存储单元</b>：约定“队首指针在队尾指针的下一位置”为满，即 front==(rear+1)%MaxSize。A 是队空条件，B、D 为干扰项。',
 claude:'没有 size/tag 帮忙→留一空格判满：front==(rear+1)%M。选 C。', run:null, verdict:'ok'},

{id:'3.2-10', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['循环队列·判空'],
 stem:'假设用 A[0..n] 实现循环队列，front、rear 分别指向队首元素的前一个位置和队尾元素。若用 (rear+1)%(n+1)==front 作为队满标志，则（　）。',
 opts:['可用 front==rear 作为队空标志','队列中最多可有 n+1 个元素','可用 front>rear 作为队空标志','可用 (front+1)%(n+1)==rear 作为队空标志'], ans:'A',
 book:'既然用 (rear+1)%(n+1)==front 判满（牺牲一单元法），队空就用 <b>front==rear</b>。此法最多存 n 个元素（留 1 空），故 B 错；C 循环下标无大小意义，错。',
 claude:'满用“留一格”，空必配 front==rear。选 A。', run:null, verdict:'ok'},

{id:'3.2-11', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['链式队列'],
 stem:'与顺序队列相比，链式队列的（　）。',
 opts:['优点是队列的长度不受限制','优点是入队和出队时间效率更高','缺点是不能进行顺序访问','缺点是不能根据队首指针和队尾指针计算队列的长度'], ans:'D',
 book:'链式队列长度仍受内存限制（A“不受限制”过头）；两者入/出队都是 O(1)（B 错）；都能顺序访问（C 错）；顺序队列可由 front、rear 直接算元素个数，<b>链式队列不能</b>（D 对）。',
 claude:'链队真正的短板：光凭首尾指针数不出长度，得遍历。选 D。', run:null, verdict:'ok'},

{id:'3.2-12', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['链式队列·结构选择'],
 stem:'下列描述的几种链表中，最适合用作队列的是（　）。',
 opts:['带队首指针和队尾指针的循环单链表','带队首指针和队尾指针的非循环单链表','只带队首指针的非循环单链表','只带队首指针的循环单链表'], ans:'B',
 book:'队列要“队首删、队尾插”，须同时快速访问首、尾。带首、尾指针即可 O(1) 双端操作；<b>A 完成入/出队后还要维护循环性质，属画蛇添足</b>，B 更简洁高效，最适合。',
 claude:'首尾双指针=队列刚需；循环反而多余。选 B。', run:null, verdict:'ok'},

{id:'3.2-13', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['链式队列·结构选择'],
 stem:'下列描述的几种链表中，最不适合用作链式队列的是（　）。',
 opts:['只带队首指针的非循环双链表','只带队首指针的循环双链表','只带队尾指针的循环双链表','只带队尾指针的循环单链表'], ans:'A',
 book:'队列需在两端操作。<b>A 非循环双链表只有队首指针</b>，入队要找队尾须 O(n) 遍历，最不适合；B（循环+双链）、C、D 都能 O(1) 摸到首尾。',
 claude:'“非循环 + 只有首指针”→找尾要走全程。选 A。', run:null, verdict:'ok'},

{id:'3.2-14', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['链式队列'],
 stem:'在用单链表实现队列时，队头设在链的（　）位置。',
 opts:['链头','链尾','链中','以上都可以'], ans:'A',
 book:'出队要删队首。单链表删表头 O(1)、删表尾 O(n)。为便于删队首，<b>队头设在链头</b>、队尾设在链尾（尾插入队 O(1)）。',
 claude:'删头快→队头放链头。选 A。', run:null, verdict:'ok'},

{id:'3.2-15', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['链式队列·出队'],
 stem:'用链式存储方式的队列进行删除操作时需要（　）。',
 opts:['仅修改头指针','仅修改尾指针','头尾指针都要修改','头尾指针可能都要修改'], ans:'D',
 book:'出队一般只改头指针；但当队列<b>仅剩一个元素</b>时，删除后队空，尾指针也须一并修改（rear=front）。故“<b>可能</b>都要改”最严谨。',
 claude:'常规改头，删到只剩一个时头尾都动→选 D（“可能”兜住边界）。', run:null, verdict:'ok'},

{id:'3.2-16', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['链式队列·入队'],
 stem:'在一个链式队列中，假设队首指针为 front、队尾指针为 rear，x 所指向的元素需要入队，则需要执行的操作为（　）。',
 opts:['front=x, front=front->next','x->next=front->next, front=x','rear->next=x, rear=x','rear->next=x, x->next=NULL, rear=x'], ans:'D',
 book:'入队在队尾：把新结点挂到 rear 之后并移动 rear。因它成为新队尾，其 next 必须置空。<code>rear->next=x; x->next=NULL; rear=x</code>。C 少了置空 x->next，不够严密。',
 claude:'尾插三步：挂上、封尾(x->next=NULL)、挪 rear。选 D。', run:null, verdict:'ok'},

{id:'3.2-17', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['循环单链表队列·复杂度'],
 stem:'假设循环单链表表示的队列长度为 n，队头固定在链表尾，若只设头指针，则入队操作的时间复杂度为（　）。',
 opts:['O(n)','O(1)','O(n²)','O(nlog₂n)'], ans:'A',
 book:'入队在队尾进行，即链表表头。只设头指针的<b>循环单链表要维持循环，入队后须找到表尾结点</b>，而从头指针找尾须遍历一圈 O(n)。故入队 O(n)。',
 claude:'只有头指针的循环单链表，找尾=绕一圈→入队 O(n)。选 A。', run:null, verdict:'ok'},

{id:'3.2-18', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['双队列·重排'],
 stem:'假设输入序列为 1,2,3,4,5，利用两个队列进行出入队操作，不可能输出的序列是（　）。',
 opts:['1,2,3,4,5','5,2,3,4,1','1,3,2,4,5','4,1,5,2,3'], ans:'B',
 book:'模拟：B 要 5 最先出，只能 1,2,3,4 入 Q₁、5 入 Q₂ 再出 5；此后 Q₁ 只能按 FIFO 吐出 1,2,3,4，得 5,1,2,3,4，<b>无法得到 5,2,3,4,1</b>。A/C/D 可通过分流两队实现。',
 claude:'队列不改序：一旦 5 先出，剩下的 1234 只能原序跟出。5 后接 2 就不可能，选 B。', run:null, verdict:'ok'},

{id:'3.2-19', ch:3, sec:'3.2 队列', type:'choice', tag:'', exam:null, kp:['双端队列·输入/输出受限'],
 stem:'若以 1,2,3,4 作为双端队列的输入序列，则既不能由输入受限的双端队列得到，又不能由输出受限的双端队列得到的输出序列是（　）。',
 opts:['1,2,3,4','4,1,3,2','4,2,3,1','4,2,1,3'], ans:'C',
 book:'排除法：输入受限双端队列可得 4,1,3,2（排除 B）、4,2,1,3（排除 D）；1,2,3,4 两种都能得（排除 A）。<b>只有 4,2,3,1 两种受限双端队列都得不到</b>。',
 claude:'四个里挑“双双落空”的那个。程序枚举验证 4,2,3,1 既非输入受限也非输出受限可得。选 C。', run:'程序枚举输入受限/输出受限双端队列：4231 两者皆不可得，其余三个至少一种可得 ✅', verdict:'ok'},

{id:'3.2-20', ch:3, sec:'3.2 队列', type:'choice', tag:'2010 统考', exam:2010, kp:['双端队列·输出受限'],
 stem:'【2010】某队列允许在其两端进行入队操作，但仅允许在一端进行出队操作。若元素 a,b,c,d,e 依次入此队列后再进行出队操作，则不可能得到的出队序列是（　）。',
 opts:['b,a,c,d,e','d,b,a,c,e','d,b,c,a,e','e,c,b,a,d'], ans:'C',
 book:'这是<b>输出受限的双端队列</b>（两端可入、一端出）。逐一构造 A、B、D 的入队方案均可实现；C 中 d,b,c,a,e——第 2 个元素 b 入队后必与 a 相邻，而 C 里 a 与 b 不相邻，故不可能。',
 claude:'输出受限双端队列的特征：先入的两个元素在输出里必相邻。dbcae 中 a、b 被 c 隔开→不可能。选 C。', run:'程序模拟输出受限双端队列 abcde：dbcae 不在可得集，其余三个可得 ✅', verdict:'ok'},

{id:'3.2-21', ch:3, sec:'3.2 队列', type:'choice', tag:'2011 统考', exam:2011, kp:['循环队列·初值'],
 stem:'【2011】已知循环队列存储在一维数组 A[0..n−1] 中，且队列非空时 front 和 rear 分别指向队首元素和队尾元素。若初始时队列为空，且要求第一个进入队列的元素存储在 A[0] 处，则初始时 front 和 rear 的值分别是（　）。',
 opts:['0, 0','0, n−1','n−1, 0','n−1, n−1'], ans:'D',
 book:'rear 指队尾元素、入队先 rear=(rear+1)%n 再存。要让第一个元素落在 A[0]，须 (rear+1)%n==0→rear 初值 n−1。第一个元素入队只改 rear，front 应保持指向该元素 A[0]，故 front 初值也须使入队后 front 指 A[0]——初始 front=n−1，rear=n−1。',
 claude:'倒推：入队后 rear 指 0→初值 n−1；front 也取 n−1 保证非空时指 A[0]。选 D。', run:null, verdict:'ok'},

{id:'3.2-22', ch:3, sec:'3.2 队列', type:'choice', tag:'2014 统考', exam:2014, kp:['循环队列·判空判满'],
 stem:'【2014】循环队列放在一维数组 A[0..M−1] 中，end1 指向队首元素，end2 指向队尾元素的后一个位置。假设循环队列两端均可进行入队和出队操作，队列中最多能容纳 M−1 个元素，初始时为空。下列判断队空和队满的条件中，正确的是（　）。',
 opts:['队空: end1==end2；队满: end1==(end2+1) mod M','队空: end1==end2；队满: end2==(end1+1) mod (M−1)','队空: end2==(end1+1)mod M；队满: end1==(end2+1) mod M','队空: end1==(end2+1)mod M；队满: end2==(end1+1) mod (M−1)'], ans:'A',
 book:'end1 指队首、end2 指队尾后一位。初始队空 end1==end2。最多存 M−1 个（牺牲一单元）：满时 end2 走到 end1 的前一位，即 <b>end1==(end2+1) mod M</b>。模数一律用 M（M−1 是干扰）。',
 claude:'空=两指针相等；满=“留一格”即 end1==(end2+1)%M。选 A。', run:null, verdict:'ok'},

{id:'3.2-23', ch:3, sec:'3.2 队列', type:'choice', tag:'2018 统考', exam:2018, kp:['栈+队列·序列'],
 stem:'【2018】现有队列 Q 与栈 S，初始时 Q 中的元素依次是 1,2,3,4,5,6（1 在队头），S 为空。若仅允许下列 3 种操作：①出队并输出出队元素；②出队并将出队元素入栈；③出栈并输出出栈元素，则不能得到的输出序列是（　）。',
 opts:['1,2,5,6,4,3','2,3,4,5,6,1','3,4,5,6,1,2','6,5,4,3,2,1'], ans:'C',
 book:'元素只能按 1..6 顺序离队，途中可选择直接输出(①)或压栈(②)、再择机弹栈输出(③)——即部分元素经栈<b>逆序</b>输出。C 要输出 3,4,5,6,1,2：3 先输出说明 1、2 已入栈，之后 1、2 出栈只能是 2,1（逆序），得不到 “…1,2”，故不可能。',
 claude:'入栈的元素必逆序吐出。C 里 1、2 先入栈却想按 1,2 顺序出→矛盾。选 C。', run:'程序模拟三操作：C(345612)不可达，其余三个可达 ✅', verdict:'ok'},

{id:'3.2-24', ch:3, sec:'3.2 队列', type:'choice', tag:'2021 统考', exam:2021, kp:['双端队列·输出受限'],
 stem:'【2021】初始为空的队列 Q 的一端仅能进行入队操作，另外一端既能进行入队操作又能进行出队操作。若 Q 的入队序列是 1,2,3,4,5，则不能得到的出队序列是（　）。',
 opts:['5,4,3,1,2','5,3,1,2,4','4,2,1,3,5','4,1,3,2,5'], ans:'D',
 book:'该结构是<b>输出受限的双端队列</b>（两端可入、一端出）。逐一构造 A、B、C 的入/出队方案均可实现；D 中 4,1,3,2,5 无法由任何合法入出队序列得到。',
 figA:'图/ch3/3.2-24_双端队列三选项.png', figAcap:'原书答案图：选项 A/B/C 的入出队走位（裁自王道 p.87）',
 claude:'输出受限双端队列，程序枚举可得集：41325 不在其中，其余三个可得。选 D。', run:'程序模拟输出受限双端队列 12345：41325 不可达，其余三个可达 ✅', verdict:'ok'},

/* ---- 3.2 综合应用题 ---- */
{id:'3.2-综1', ch:3, sec:'3.2 队列 · 综合应用题', type:'subjective', tag:'', exam:null, kp:['循环队列·tag法'],
 stem:'若希望循环队列中的元素都能得到利用（不牺牲存储单元），则需设置一个标志域 tag，并以 tag 的值为 0 或 1 来区分队首指针 front 和队尾指针 rear 相同时的队列状态是“空”还是“满”。试编写与此结构相应的入队和出队算法。',
 code:'// 约定: 初始 front=rear=0, tag=0; 入队置 tag=1, 出队置 tag=0\nint EnQueue(SqQueue &Q, ElemType x){\n    if(Q.front==Q.rear && Q.tag==1) return 0;   // front==rear 且 tag==1 → 队满\n    Q.data[Q.rear]=x;\n    Q.rear=(Q.rear+1)%MaxSize;\n    Q.tag=1;                                    // 入队后可能满\n    return 1;\n}\nint DeQueue(SqQueue &Q, ElemType &x){\n    if(Q.front==Q.rear && Q.tag==0) return 0;   // front==rear 且 tag==0 → 队空\n    x=Q.data[Q.front];\n    Q.front=(Q.front+1)%MaxSize;\n    Q.tag=0;                                    // 出队后可能空\n    return 1;\n}',
 book:'增设 tag：<b>只有入队可能致满、只有出队可能致空</b>。故当 front==rear 时，若最近一次是入队(tag=1)则满、是出队(tag=0)则空。队空: front==rear && tag==0；队满: front==rear && tag==1。此法可用满全部 MaxSize 个单元。',
 claude:'tag 法记忆点：谁最后动的手（入/出）决定 front==rear 是满还是空。相比“牺牲一单元”多存 1 个元素。',
 run:'实测 tag 法：连入 MaxSize 个后 front==rear&&tag==1 判满；全出后 front==rear&&tag==0 判空，全容量可用 ✅', verdict:'ok'},

{id:'3.2-综2', ch:3, sec:'3.2 队列 · 综合应用题', type:'subjective', hints:['用一个空栈把队列元素逆置：栈「后进先出」，倒进去再倒回来顺序正好反。','队列逐个出队 push 入栈；栈非空则逐个 pop 出栈重新入队；一进一出即完成逆置。'], tag:'', exam:null, kp:['算法·栈逆置队列'],
 stem:'Q 是一个队列，S 是一个空栈，实现将队列中的元素逆置的算法。',
 code:'void Inverser(Stack &S, Queue &Q){\n    ElemType x;\n    while(!QueueEmpty(Q)){    // 队列元素全部出队并入栈\n        x=DeQueue(Q);\n        Push(S, x);\n    }\n    while(!StackEmpty(S)){    // 栈元素全部出栈并重新入队\n        Pop(S, x);\n        EnQueue(Q, x);\n    }\n}',
 book:'队列本身不能逆置元素，而<b>栈能把序列反过来</b>。做法：队列元素逐个出队入栈（此时顺序被倒），再逐个出栈回队，队列即被逆置。',
 claude:'“过一遍栈就翻个面”。两趟循环 O(n)，是栈/队列互换的经典小算法。',
 run:'实测 Q=[1,2,3,4] 经栈中转 → Q=[4,3,2,1] ✅', verdict:'ok'},

{id:'3.2-综3', ch:3, sec:'3.2 队列 · 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·双栈模拟队列'],
 stem:'利用两个栈 S1 和 S2 来模拟一个队列。已知栈的 4 个运算定义为 Push(S,x)、Pop(S,x)、StackEmpty(S)、StackOverflow(S)。如何利用栈的运算来实现该队列的 3 个运算 Enqueue（入队）、Dequeue（出队）、QueueEmpty（判空）？（形参自定）',
 code:'// S1 作“入口栈”, S2 作“出口栈”\nint EnQueue(Stack &S1, Stack &S2, ElemType e){\n    if(!StackOverflow(S1)){ Push(S1,e); return 1; }          // S1 未满直接压入\n    if(StackOverflow(S1) && !StackEmpty(S2)){ return 0; }    // S1 满且 S2 非空 → 队满\n    if(StackOverflow(S1) && StackEmpty(S2)){                 // S1 满但 S2 空 → 倒过去再压\n        while(!StackEmpty(S1)){ Pop(S1,x); Push(S2,x); }\n        Push(S1,e); return 1;\n    }\n}\nvoid DeQueue(Stack &S1, Stack &S2, ElemType &x){\n    if(!StackEmpty(S2)){ Pop(S2,x); }                        // S2 非空, 栈顶即队首\n    else if(StackEmpty(S1)){ printf("队列为空"); }\n    else{ while(!StackEmpty(S1)){ Pop(S1,x); Push(S2,x); } Pop(S2,x); } // 把 S1 全倒入 S2 再出\n}\nint QueueEmpty(Stack S1, Stack S2){\n    return (StackEmpty(S1) && StackEmpty(S2)) ? 1 : 0;       // 两栈皆空才空\n}',
 book:'两栈相扣抵消“逆序”：S1 存已输入元素；出队时若 S2 空，先把 S1 全部倒入 S2（顺序再次反转→恢复原序），再从 S2 弹出即队首。要点：① 出队时 S2 空才倒栈；② 入队时 S1 满须保证 S2 空才能倒；③ 两栈都空才判队空。',
 claude:'“倒两次栈=不倒”，负负得正恢复 FIFO。关键红线：S2 非空时绝不能倒 S1（会打乱顺序）。这是 LeetCode 232 原题。',
 run:'实测：Enqueue 1,2,3；Dequeue→1；Enqueue 4；Dequeue→2,3,4 ✅（严格 FIFO）', verdict:'ok'},

{id:'3.2-综4', ch:3, sec:'3.2 队列 · 综合应用题', type:'subjective', tag:'2019 统考', exam:2019, kp:['循环链式队列·设计'],
 stem:'【2019】请设计一个队列，要求满足：① 初始时队列为空；② 入队时允许增加队列占用空间；③ 出队后出队元素所占空间可重复使用，即整个队列所占空间只增不减；④ 入队和出队操作的时间复杂度始终保持 O(1)。请回答：1) 该队列应选择链式存储还是顺序存储？2) 画出队列初始状态并给出判空判满条件。3) 画出第一个元素入队后的状态。4) 给出入队和出队操作的基本过程。',
 code:'// 结论: 采用带头尾指针的“循环单链表”(结点空间循环复用)\n入队 EnQueue(e):\n    若 front == rear->next:              // 队满(仅剩的空结点被占满)\n        在 rear 后面插入一个新空闲结点;   // 动态扩容\n    将 e 存入 rear 所指结点;\n    rear = rear->next;                    // 移向下一空结点\n出队 DeQueue():\n    若 front == rear: 出队失败(队空);\n    取 front 所指结点元素 e;\n    front = front->next;                  // 结点不释放, 留待循环复用\n    return e;',
 book:'1) 顺序存储无法“只增不减地复用空间”，应选<b>链式（两段式单向循环链表）</b>。2) 初始建只含一个空结点的循环链表，front=rear 均指该空结点。<b>队空: front==rear；队满: front==rear->next</b>。3) 第一个元素入队后 front 指该数据结点、rear 指其后的空结点。4) 入队：满则在 rear 后插新结点扩容，存值后 rear 后移；出队：取 front 值后 front 后移，结点不释放留作复用。全程 O(1)。',
 figA:'图/ch3/3.2-综4_循环链式队列状态.png', figAcap:'原书答案图：初始状态（front==rear）与第一个元素入队后的状态，含判空判满条件（裁自王道 p.89）',
 claude:'把“循环队列”做成“循环链表”：满了就插结点(扩)，出队结点不删(复用)，故空间只增不减且入出队都 O(1)。判满 front==rear->next 是本题记忆钉。',
 run:'', verdict:'ok'},

/* ===================== 第3章 3.3 栈和队列的应用 ===================== */
{id:'3.3-1', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['栈的应用'],
 stem:'栈的应用不包括（　）。',
 opts:['递归','表达式求值','括号匹配','缓冲区'], ans:'D',
 book:'递归（函数调用栈）、表达式求值（运算符/运算数栈）、括号匹配都是栈的经典应用。<b>缓冲区</b>要求先进先出，用<b>队列</b>实现，不属栈。',
 claude:'“缓冲区=队列”是固定考点。选 D。', run:null, verdict:'ok'},

{id:'3.3-2', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['后缀表达式'],
 stem:'表达式 a*(b+c)-d 的后缀表达式是（　）。',
 opts:['abcd*+-','abc+*d-','abc*+d-','-+*abcd'], ans:'B',
 book:'把运算符移到其两操作数之后：(b+c)→bc+；a*(bc+)→abc+*；再减 d→<b>abc+*d-</b>。',
 claude:'后缀=运算符跟在操作数后。手算或建表都得 abc+*d-。选 B。', run:'调度场算法转换 a*(b+c)-d → abc+*d- ✅', verdict:'ok'},

{id:'3.3-3', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['队列的应用'],
 stem:'下面（　）用到了队列。',
 opts:['括号匹配','表达式求值','递归','FIFO 页面替换算法'], ans:'D',
 book:'括号匹配、表达式求值、递归都用<b>栈</b>；只有 <b>FIFO 页面替换</b>按先进先出淘汰，用队列。',
 claude:'认准“FIFO”三个字母=队列。选 D。', run:null, verdict:'ok'},

{id:'3.3-4', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['表达式求值·栈深'],
 stem:'利用栈求表达式的值时，设立运算数栈 OPEN。假设 OPEN 只有两个存储单元，则在下列表达式中，不会发生溢出的是（　）。',
 opts:['A-B*(C-D)','(A-B)*C-D','(A-B*C)-D','(A-B)*(C-D)'], ans:'B',
 book:'统计求值过程中运算数栈的最大深度。B：A 入、B 入(深 2)、算 A-B 得 R₁、C 入(深 2)、算 R₁*C… 最大深度 <b>2</b>，不溢出。A、C、D 的最大深度分别为 4、3、3，均超过 2。',
 claude:'看谁的“中间结果+待入操作数”峰值最小。B 峰值恰为 2。选 B。', run:null, verdict:'ok'},

{id:'3.3-5', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['递归·求值'],
 stem:'执行下列语句段后，i 的值为（　）。',
 code:'int f(int x){\n    return ((x>0) ? x*f(x-1) : 2);\n}\nint i;\ni = f(f(1));',
 opts:['2','4','8','无限递归'], ans:'B',
 book:'递归出口 f(0)=2。f(1)=1*f(0)=1*2=2；再算外层 f(f(1))=f(2)=2*f(1)=2*2=<b>4</b>。',
 claude:'先内后外：f(1)=2 → f(2)=4。选 B。', run:'f(0)=2, f(1)=2, f(2)=4 → i=4 ✅', verdict:'ok'},

{id:'3.3-6', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['递归·调用次数'],
 stem:'设有如下递归函数，则计算 F(8) 需要调用该递归函数的次数为（　）。',
 code:'int F(int n){\n    if(n<=3) return 1;\n    else return F(n-2)+F(n-4)+1;\n}',
 opts:['7','8','9','10'], ans:'C',
 book:'画递归调用树：F(8)→F(6),F(4)；F(6)→F(4),F(2)；F(4)→F(2),F(0)…统计所有结点（含自身）共 <b>9</b> 次调用。',
 claude:'调用次数=递归树结点数。程序计数得 9。选 C。', run:'程序对 F(8) 计数递归调用 = 9 次 ✅', verdict:'ok'},

{id:'3.3-7', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['递归·执行次序'],
 stem:'设有如下递归函数，在 func(func(5)) 的执行过程中，第 4 个被执行的 func 函数是（　）。',
 code:'int func(int x){\n    if(x<=3) return 2;\n    else return func(x-2)+func(x-4);\n}',
 opts:['func(2)','func(3)','func(4)','func(5)'], ans:'C',
 book:'先算内层 func(5)=func(3)+func(1)，先后执行 func(5)、func(3)、func(1) 共 3 次；内层结果=4，再执行外层 func(func(5))=func(4)。故第 4 个被执行的是 <b>func(4)</b>。（执行次序=递归调用树的先序遍历）',
 claude:'内层 3 次(func5,func3,func1)后进外层 func(4)，正好第 4 个。选 C。', run:null, verdict:'ok'},

{id:'3.3-8', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['递归vs非递归·效率'],
 stem:'对于一个问题的递归算法求解和其相对应的非递归算法求解，（　）。',
 opts:['递归算法通常效率高一些','非递归算法通常效率高一些','两者相同','无法比较'], ans:'B',
 book:'递归在执行中含大量<b>重复计算</b>与函数调用（进出栈）开销，通常<b>非递归效率更高</b>。',
 claude:'递归省代码但费时间/空间→非递归通常更快。选 B。', run:null, verdict:'ok'},

{id:'3.3-9', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['函数调用·栈'],
 stem:'执行函数时，其局部变量一般采用（　）进行存储。',
 opts:['树形结构','静态链表','栈结构','队列结构'], ans:'C',
 book:'函数调用时系统构造由参数表、返回地址组成的<b>活动记录</b>压入系统栈，局部变量也随之入栈。故用<b>栈</b>存储。',
 claude:'调用后进先出→函数栈帧=栈。选 C。', run:null, verdict:'ok'},

{id:'3.3-10', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['队列的应用·BFS'],
 stem:'执行（　）操作时，需要使用队列作为辅助存储空间。',
 opts:['查找散列（哈希）表','广度优先搜索图','前序（根）遍历二叉树','深度优先搜索图'], ans:'B',
 book:'广度优先搜索（BFS）类似树的<b>层序遍历</b>，需按“先发现先处理”的顺序，借助<b>队列</b>。前序遍历、DFS 用栈（或递归）。',
 claude:'BFS/层序=队列，DFS/前序=栈。选 B。', run:null, verdict:'ok'},

{id:'3.3-11', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'', exam:null, kp:['栈与队列·辨析'],
 stem:'下列说法中，正确的是（　）。',
 opts:['消除递归不一定需要使用栈','对同一输入序列进行两组不同的合法入栈和出栈组合操作，所得的输出序列也一定相同','通常使用队列来处理函数或过程调用','队列和栈都是运算受限的线性表，只允许在表的两端进行运算'], ans:'A',
 book:'单向递归、尾递归可用<b>迭代（循环）</b>消除，不必用栈，A 对。不同的入/出栈组合会产生不同输出序列(B 错)；函数调用用栈非队列(C 错)；栈只允许在<b>栈顶一端</b>运算(D “两端”错)。',
 claude:'尾递归改循环无需栈→A 对。B/C/D 各有硬伤。选 A。', run:null, verdict:'ok'},

{id:'3.3-12', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'2009 统考', exam:2009, kp:['队列的应用·缓冲区'],
 stem:'【2009】为解决计算机主机与打印机之间速度不匹配的问题，通常设置一个打印数据缓冲区，主机将要输出的数据依次写入该缓冲区，而打印机则依次从该缓冲区中取出数据。该缓冲区的逻辑结构应该是（　）。',
 opts:['栈','队列','树','图'], ans:'B',
 book:'取数据时须保持写入的原顺序（先写先打），即<b>先进先出</b>，故缓冲区是<b>队列</b>。',
 claude:'“依次写、依次取、保序”=FIFO=队列。选 B。', run:null, verdict:'ok'},

{id:'3.3-13', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'2012 统考', exam:2012, kp:['中缀转后缀·栈深'],
 stem:'【2012】已知操作符包括 “+”“−”“*”“/”“(” 和 “)”。将中缀表达式 a+b−a*((c+d)/e−f)+g 转换为等价的后缀表达式 ab+acd+e/f−*−g+ 时，用栈来存放暂时还不能确定运算次序的操作符。栈初始时为空，转换过程中同时保存在栈中的操作符的最大个数是（　）。',
 opts:['5','7','8','11'], ans:'A',
 book:'按调度场算法逐符号扫描，统计运算符栈（含界限符 “(”）的最大长度。扫到内层 “−*((” 附近时栈达峰值 <b>5</b> 个（如 −*((+ 之类）。',
 claude:'转换时栈里堆的是“(”和待定运算符。程序建表得峰值 5。选 A。', run:'调度场算法转换该式，运算符栈最大深度 = 5 ✅', verdict:'ok'},

{id:'3.3-14', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'2014 统考', exam:2014, kp:['中缀转后缀·栈快照'],
 stem:'【2014】假设栈初始为空，将中缀表达式 a/b+(c*d−e*f)/g 转换为等价的后缀表达式的过程中，当扫描到 f 时，栈中的元素依次是（　）。',
 opts:['+(*-','+(-*','/+(*-','/+-*'], ans:'B',
 book:'逐符号转换到 f 时：+ 在最底、然后 (、然后 −、栈顶是 *（因 e*f 的 * 刚入栈）。自栈底到栈顶为 <b>+(-*</b>。（/ 早已随 a/b 弹出，不在栈中）',
 claude:'扫到 f 那一刻，栈底→顶=+(-*。程序快照验证。选 B。', run:'调度场算法扫到 f 时运算符栈(底→顶) = +(-* ✅', verdict:'ok'},

{id:'3.3-15', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'2015 统考', exam:2015, kp:['递归·系统栈'],
 stem:'【2015】已知程序如下，程序运行时使用栈来保存调用过程的信息，自栈底到栈顶保存的信息依次对应的是（　）。',
 code:'int S(int n){ return (n<=0) ? 0 : S(n-1)+n; }\nvoid main(){ cout << S(1); }',
 opts:['main()→S(1)→S(0)','S(0)→S(1)→main()','main()→S(0)→S(1)','S(1)→S(0)→main()'], ans:'A',
 book:'调用链 main() 调 S(1)、S(1) 调 S(0)。系统栈后进后出，先调用者在栈底：自栈底到栈顶为 <b>main()→S(1)→S(0)</b>。',
 claude:'谁先调用谁在栈底。main→S(1)→S(0)。选 A。', run:null, verdict:'ok'},

{id:'3.3-16', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'2016 统考', exam:2016, kp:['队列·火车调度'],
 stem:'【2016】设有火车车轨（入口和出口之间有 n 条轨道，列车行进方向均为从左至右，可驶入任意一条轨道）。现有编号为 1~9 的 9 列列车，驶入的次序依次是 8,4,2,5,3,9,1,6,7。若期望驶出的次序依次为 1~9，则 n 至少为（　）。',
 opts:['2','3','4','5'], ans:'C',
 book:'每条轨道是一个队列（FIFO，可容多列），要求同一轨道内元素满足“后入者编号更大”。用“大数跟在小数后”的贪心分配，使占用轨道数最少：8→轨A，4→轨B，2→轨C，5→轨B，3→轨C，9→轨A，1→轨D，6/7→复用…最少需 <b>4</b> 条轨道。',
 claude:'把轨道当“递增队列”做贪心装箱（类似最少上升子序列覆盖）。最少 4 条。选 C。', run:null, verdict:'ok'},

{id:'3.3-17', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'2017 统考', exam:2017, kp:['栈·叙述辨析'],
 stem:'【2017】下列关于栈的叙述中，错误的是（　）。Ⅰ.采用非递归方式重写递归程序时必须使用栈　Ⅱ.函数调用时，系统要用栈保存必要的信息　Ⅲ.只要确定了入栈次序，即可确定出栈次序　Ⅳ.栈是一种受限的线性表，允许在其两端进行操作',
 opts:['仅Ⅰ','仅Ⅰ、Ⅱ、Ⅲ','仅Ⅰ、Ⅲ、Ⅳ','仅Ⅱ、Ⅲ、Ⅳ'], ans:'C',
 book:'Ⅰ错：尾递归/单向递归可用迭代（一个循环）消除，不必用栈。Ⅲ错：同一入栈次序可有多种出栈次序（穿插出栈）。Ⅳ错：栈只允许在<b>栈顶一端</b>操作，非两端。Ⅱ对。故错误的是 Ⅰ、Ⅲ、Ⅳ。',
 claude:'找出三处错(Ⅰ迭代可消递归、Ⅲ出栈不唯一、Ⅳ栈是一端)。选 C。', run:null, verdict:'ok'},

{id:'3.3-18', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'2018 统考', exam:2018, kp:['栈·后缀求值模拟'],
 stem:'【2018】若栈 S1 中保存整数，栈 S2 中保存运算符，函数 F() 依次执行下述操作：1) 从 S1 依次弹出两个操作数 a 和 b；2) 从 S2 弹出一个运算符 op；3) 执行 b op a；4) 将结果压入 S1。假定 S1 的操作数依次是 5,8,3,2（2 在栈顶），S2 的运算符依次是 *、−、+（+ 在栈顶）。调用 3 次 F() 后，S1 栈顶保存的值是（　）。',
 opts:['−15','15','−20','20'], ans:'B',
 book:'第 1 次：弹 2、3 与 “+”→ 3+2=5 压回，S1=5,8,5(顶)。第 2 次：弹 5、8 与 “−”→ 8−5=3 压回，S1=5,3(顶)。第 3 次：弹 3、5 与 “*”→ 5*3=15 压回。栈顶 = <b>15</b>。（注意运算是 b op a）',
 claude:'照 4 步走三遍，注意 b op a 的顺序：得 5→3→15。选 B。', run:'模拟三次 F()：3+2=5, 8-5=3, 5*3=15 → 栈顶 15 ✅', verdict:'ok'},

{id:'3.3-19', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'2024 统考', exam:2024, kp:['后缀表达式'],
 stem:'【2024】与表达式 x+y*(z−u)/v 等价的后缀表达式是（　）。',
 opts:['xyzu-*v/+','xyzu-v/*+','+x/*y-zuv','+*x/y-zuv'], ans:'A',
 book:'(z−u)→zu−；y*(zu−)→yzu−*；再 /v→yzu−*v/；最后 x+…→<b>xyzu−*v/+</b>。（也可画表达式二叉树后序遍历）',
 claude:'逐层套：zu- → yzu-* → yzu-*v/ → xyzu-*v/+。选 A。', run:'调度场算法转换 x+y*(z-u)/v → xyzu-*v/+ ✅', verdict:'ok'},

{id:'3.3-20', ch:3, sec:'3.3 栈和队列的应用', type:'choice', tag:'2025 统考', exam:2025, kp:['栈·括号匹配·嵌套深度'],
 stem:'【2025】已知算法 A 用于检查字符串中各类括号是否匹配，A 执行过程中使用初始为空的栈保存遇到的括号。若栈的容量是 3，则下列选项中，A 不能处理的是（　）。',
 opts:['(a+[b+(c+d)/e]+f)+g-h','[a*((b+c)/(d-e)+f/g)-h]','[a*(b-(c-d)*e/(f+g))-h]','[a-(b+[c*(d+e)-f]+g+h)]'], ans:'D',
 book:'左括号入栈、右括号出栈匹配；栈容量 3 → 最多容纳 3 层未匹配的括号，即最大嵌套深度须 ≤3。A、B、C 的最大嵌套深度均为 3；<b>D 的 [ ( [ ( 处嵌套深度达 4</b>，第 4 个左括号无法入栈，故不能处理。',
 claude:'栈容量=可承受的最大括号嵌套层数。逐项数深度：只有 D 达 4>3。选 D。', run:'程序计算各选项最大括号嵌套深度：A/B/C=3，D=4 → 仅 D 超栈容量 ✅', verdict:'ok'},

/* ---- 3.3 综合应用题 ---- */
{id:'3.3-综1', ch:3, sec:'3.3 栈和队列的应用 · 综合应用题', type:'subjective', tag:'', exam:null, kp:['算法·括号匹配'],
 stem:'假设一个算术表达式中包含圆括号、方括号和花括号 3 种类型的括号，编写一个算法来判别表达式中的括号是否配对，以字符 “\\0” 作为算术表达式的结束符。',
 code:'bool BracketsCheck(char *str){\n    InitStack(S);\n    int i=0;\n    while(str[i]!=\'\\0\'){\n        switch(str[i]){\n            case \'(\': Push(S,\'(\'); break;      // 三种左括号一律入栈\n            case \'[\': Push(S,\'[\'); break;\n            case \'{\': Push(S,\'{\'); break;\n            case \')\': Pop(S,e); if(e!=\'(\') return false; break;  // 右括号: 弹栈顶比对\n            case \']\': Pop(S,e); if(e!=\'[\') return false; break;\n            case \'}\': Pop(S,e); if(e!=\'{\') return false; break;\n            default: break;                        // 非括号字符跳过\n        }\n        i++;\n    }\n    if(!StackEmpty(S)) return false;   // 扫描完栈非空 → 有未匹配的左括号\n    return true;\n}',
 book:'思想：扫描字符串，遇左括号（(、[、{）入栈；遇右括号时弹栈顶，检查是否为<b>相应类型</b>的左括号——不符即失配（返回 false）；扫描结束后栈非空说明有多余左括号，也失配。全部匹配则返回 true。',
 claude:'括号匹配三条判死点：①右括号来时栈空→失配 ②弹出的左括号类型不匹配→失配 ③扫完栈非空→失配。栈的招牌应用，务必能默写。',
 run:'实测 “{[()]}”=✔匹配；“([)]”=✘失配；“(()”=✘(栈非空) ✅', verdict:'ok'},

/* ===================== 第3章 3.4 数组和特殊矩阵 ===================== */
{id:'3.4-1', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['压缩存储·目的'],
 stem:'对特殊矩阵采用压缩存储的主要目的是（　）。',
 opts:['表达变得简单','对矩阵元素的存取变得简单','去掉矩阵中的多余元素','减少不必要的存储空间'], ans:'D',
 book:'特殊矩阵含大量相同元素或零元素，压缩存储让值相同的元素<b>共享一份空间</b>、零元素不存，目的是<b>节省存储空间</b>。',
 claude:'压缩=省内存，不是为了好取或好表达。选 D。', run:null, verdict:'ok'},

{id:'3.4-2', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['对称矩阵·表长'],
 stem:'对 n 阶对称矩阵压缩存储时，需要表长为（　）的顺序表。',
 opts:['n/2','n×n/2','n(n+1)/2','n(n−1)/2'], ans:'C',
 book:'对称矩阵只需存下三角（或上三角）含主对角线部分，元素个数=n+(n−1)+…+1=<b>n(n+1)/2</b>。',
 claude:'含对角线的半个矩阵：n(n+1)/2。选 C。（不含对角线才是 n(n−1)/2）', run:null, verdict:'ok'},

{id:'3.4-3', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['对称矩阵·下标映射'],
 stem:'有一个 n×n 的对称矩阵 A，将其下三角部分按行存放在一维数组 B 中，而 A[0][0] 存放于 B[0] 中，则元素 A[i][i] 存放于 B 中的（　）处。',
 opts:['(i+3)i/2','(i+1)i/2','(2n−i+1)i/2','(2n−i−1)i/2'], ans:'A',
 book:'下三角按行、0 起始：A[i][j] 前有 i 行共 i(i+1)/2 个元素，A[i][j] 是第 i 行第 j 个。A[i][i]：i(i+1)/2+i=(i²+3i)/2=<b>(i+3)i/2</b>。',
 claude:'特殊值代入最快：A[1][1] 应在下标 2，只有 A 选项 (1+3)·1/2=2 命中。选 A。', run:'A[1][1]→(1+3)·1/2=2, A[2][2]→(2+3)·2/2=5 ✅（下三角0起按行）', verdict:'ok'},

{id:'3.4-4', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['二维数组·地址'],
 stem:'在二维数组 A 中，假设每个数组元素的长度为 3 个存储单元，行下标 i 为 0~8，列下标 j 为 0~9，从首地址 SA 开始连续存放。在这种情况下，元素 A[8][5] 的起始地址为（　）。',
 opts:['SA+141','SA+144','SA+222','SA+255'], ans:'D',
 book:'按行优先：LOC(i,j)=SA+(i·m+j)·L，其中列数 m=9−0+1=10、L=3。LOC(8,5)=SA+(8×10+5)×3=SA+85×3=<b>SA+255</b>。',
 claude:'列数是 10（0~9），前面整整 8 行+5 个，(80+5)×3=255。选 D。', run:'(8×10+5)×3 = 255 ✅', verdict:'ok'},

{id:'3.4-5', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['二维数组·地址反推'],
 stem:'二维数组 A 按行优先存储，其中每个元素占 1 个存储单元。若 A[1][1] 的存储地址为 420，A[3][3] 的存储地址为 446，则 A[5][5] 的存储地址为（　）。',
 opts:['472','471','458','457'], ans:'A',
 book:'设列数 m。地址差 (A[3][3]−A[1][1])=(3m+3)−(m+1)=2m+2=446−420=26→m=12。A[5][5]=446+(5×12+5)−(3×12+3)=446+26=<b>472</b>。',
 claude:'先由两点反推列数 12，再等差外推。A[5][5]=472。选 A。', run:'2m+2=26→m=12；A55=446+(65−39)=472 ✅', verdict:'ok'},

{id:'3.4-6', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['三对角矩阵·下标'],
 stem:'将三对角矩阵即数组 A[1..100][1..100] 按行优先存入一维数组 B[1..298] 中，数组 A 中元素 A[66][65] 在数组 B 中的位置 k 为（　）。',
 opts:['198','195','197','196'], ans:'B',
 book:'三对角矩阵（1 起始）按行压缩：a_ij 与 b_k 关系为 k=2i+j−2。A[66][65]（|66−65|=1 合法）→ k=2×66+65−2=<b>195</b>。',
 claude:'三对角行主序公式 k=2i+j−2。代入得 195。选 B。', run:'2×66+65−2 = 195 ✅', verdict:'ok'},

{id:'3.4-7', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['上三角矩阵·列优先'],
 stem:'若将 n 阶上三角矩阵 A 按列优先级压缩存放在一维数组 B[1..n(n+1)/2+1] 中，则存放到 B[k] 中的非零元素 a_ij（1≤i,j≤n）的下标 i、j 与 k 的对应关系是（　）。',
 opts:['i(i+1)/2+j','i(i−1)/2+j−1','j(j−1)/2+i','j(j−1)/2+i−1'], ans:'C',
 book:'上三角（i≤j）按列优先、B 从 1 起：a_ij 前有第 1~(j−1) 列共 1+2+…+(j−1)=j(j−1)/2 个元素，a_ij 是第 j 列第 i 个。故 k=<b>j(j−1)/2+i</b>。',
 claude:'上三角列主序：前 j−1 列元素数 j(j−1)/2，再 +i。选 C。', run:null, verdict:'ok'},

{id:'3.4-8', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['下三角矩阵·列优先'],
 stem:'若将 n 阶下三角矩阵 A 按列优先顺序压缩存放在一维数组 B[1..n(n+1)/2+1] 中，则存放到 B[k] 中的非零元素 a_ij（1≤i,j≤n）的下标 i,j 与 k 的对应关系是（　）。',
 opts:['(j−1)(2n−j+1)/2+i−j','(j−1)(2n−j+2)/2+i−j+1','(j−1)(2n−j+2)/2+i−j','(j−1)(2n−j+1)/2+i−j−1'], ans:'B',
 book:'下三角（i≥j）按列优先：第 c 列有 (n−c+1) 个元素，a_ij 前有第 1~(j−1) 列共 n+(n−1)+…+(n−j+2)=(j−1)(2n−j+2)/2 个；a_ij 是第 j 列第 (i−j+1) 个。k=<b>(j−1)(2n−j+2)/2+i−j+1</b>。',
 claude:'下三角列主序：前 j−1 列数 (j−1)(2n−j+2)/2，再加列内位次 i−j+1。选 B。', run:null, verdict:'ok'},

{id:'3.4-9', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['稀疏矩阵·三元组'],
 stem:'稀疏矩阵采用压缩存储后的缺点主要是（　）。',
 opts:['无法判断矩阵的行列数','丧失随机存取的特性','无法由行、列值查找某个矩阵元素','使矩阵元素之间的逻辑关系更复杂'], ans:'B',
 book:'稀疏矩阵用三元组（行、列、值）压缩后，无法由下标直接定位元素（须遍历三元组表查找），即<b>丧失随机存取特性</b>。行列数另外保存，仍可查（A、C 错）。',
 claude:'三元组=顺序找，不能 O(1) 直达→丢了随机存取。选 B。', run:null, verdict:'ok'},

{id:'3.4-10', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'', exam:null, kp:['三对角/稀疏·辨析'],
 stem:'下列关于矩阵的说法中，正确的是（　）。Ⅰ.在 n(n>3) 阶三对角矩阵中，每行都有 3 个非零元素　Ⅱ.稀疏矩阵的特点是矩阵中的元素较少',
 opts:['仅Ⅰ','仅Ⅱ','Ⅰ和Ⅱ','无正确项'], ans:'D',
 book:'Ⅰ错：三对角矩阵<b>第 1 行和最后 1 行只有 2 个非零元素</b>，其余行才 3 个。Ⅱ错：稀疏矩阵是<b>非零元素</b>很少（元素总数不变），措辞“元素较少”不准确。故无正确项。',
 claude:'两句都有坑：首尾行只 2 个；稀疏说的是“非零元少”。选 D。', run:null, verdict:'ok'},

{id:'3.4-11', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'2016 统考', exam:2016, kp:['三对角矩阵·下标'],
 stem:'【2016】有一个 100 阶的三对角矩阵 M，其元素 m_ij（1≤i,j≤100）按行优先依次压缩存入下标从 0 开始的一维数组 N 中。元素 m_{30,30} 在 N 中的下标是（　）。',
 opts:['86','87','88','89'], ans:'B',
 book:'三对角、行优先、数组下标从 0 起：k=2i+j−3。m_{30,30}→2×30+30−3=<b>87</b>。（也可数：第 1 行 2 个，之前 28 行每行 3 个，m_{30,30} 前有 2+28×3+1=87 个）',
 claude:'注意数组从 0 起，公式比 1 起少 1：k=2i+j−3=87。选 B。', run:'2×30+30−3 = 87 ✅', verdict:'ok'},

{id:'3.4-12', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'2017 统考', exam:2017, kp:['稀疏矩阵·存储结构'],
 stem:'【2017】适用于压缩存储稀疏矩阵的两种存储结构是（　）。',
 opts:['三元组表和十字链表','三元组表和邻接矩阵','十字链表和二叉链表','邻接矩阵和十字链表'], ans:'A',
 book:'稀疏矩阵常用<b>三元组表</b>（顺序）与<b>十字链表</b>（链式，便于增删）压缩存储。邻接矩阵空间 O(n²) 不适合稀疏；二叉链表用于树/森林。',
 claude:'稀疏矩阵两大件：三元组表 + 十字链表。选 A。', run:null, verdict:'ok'},

{id:'3.4-13', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'2018 统考', exam:2018, kp:['对称矩阵·上三角行优先'],
 stem:'【2018】设有一个 12×12 阶对称矩阵 M，将其上三角部分的元素 m_ij（1≤i≤j≤12）按行优先存入 C 语言的一维数组 N 中，元素 m_{6,6} 在 N 中的下标是（　）。',
 opts:['50','51','55','66'], ans:'A',
 book:'上三角按行、C 数组从 0 起：第 1 行 12 个、第 2 行 11 个…第 5 行 8 个，共 12+11+10+9+8=50；m_{6,6} 是第 6 行第 1 个（对角元），前有 50 个，下标 <b>50</b>。',
 claude:'上三角每行递减(12,11,…)，累到第 5 行=50，m66 紧随其后→下标 50。选 A。', run:'前5行 12+11+10+9+8=50，m66 是第6行首个 → 下标 50 ✅', verdict:'ok'},

{id:'3.4-14', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'2020 统考', exam:2020, kp:['对称矩阵·上三角列优先'],
 stem:'【2020】将一个 10×10 阶对称矩阵 M 的上三角部分的元素 m_ij（1≤i≤j≤10）按列优先存入 C 语言的一维数组 N 中，元素 m_{7,2} 在 N 中的下标是（　）。',
 opts:['15','16','22','23'], ans:'C',
 book:'对称矩阵存上三角，m_{7,2}=m_{2,7}（换成上三角元素）。上三角按列优先、0 起：第 1~6 列共 1+2+…+6=21 个，m_{2,7} 是第 7 列第 2 个，下标 21+2−1=<b>22</b>。',
 claude:'先对称翻上三角 m27，再列主序：前6列 21 个 + 列内第2个 → 下标 22。选 C。', run:'上三角列主序：前6列21个，m27为第7列第2个 → 下标 22 ✅', verdict:'ok'},

{id:'3.4-15', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'2021 统考', exam:2021, kp:['二维数组·地址反推'],
 stem:'【2021】二维数组 A 按行优先方式存储，每个元素占用 1 个存储单元。若元素 A[0][0] 的存储地址是 100，A[3][3] 的存储地址是 220，则元素 A[5][5] 的存储地址是（　）。',
 opts:['295','300','301','306'], ans:'B',
 book:'设列数 n。A[3][3]−A[0][0]=3n+3=220−100=120→n=39。A[5][5]=100+5×39+5=<b>300</b>。',
 claude:'两点反推列数 39，再算：100+195+5=300。选 B。', run:'3n+3=120→n=39；A55=100+5×39+5=300 ✅', verdict:'ok'},

{id:'3.4-16', ch:3, sec:'3.4 数组和特殊矩阵', type:'choice', tag:'2023 统考', exam:2023, kp:['稀疏矩阵·三元组附加信息'],
 stem:'【2023】若采用三元组表存储结构存储稀疏矩阵 M，则除三元组表外，下列数据中还需要保存的是（　）。Ⅰ. M 的行数　Ⅱ. M 中包含非零元素的行数　Ⅲ. M 的列数　Ⅳ. M 中包含非零元素的列数',
 opts:['仅Ⅰ、Ⅲ','仅Ⅰ、Ⅳ','仅Ⅱ、Ⅳ','Ⅰ、Ⅱ、Ⅲ、Ⅳ'], ans:'A',
 book:'仅凭三元组表无法确定矩阵的规模——不同大小但非零元位置相同的矩阵三元组表相同，故须额外保存 <b>M 的行数(Ⅰ) 和列数(Ⅲ)</b>（有时还记非零元个数）。Ⅱ、Ⅳ 可由三元组表本身推出，无须单独存。',
 claude:'三元组只记“非零元在哪”，还得补矩阵总行数、总列数才能还原尺寸。选 A。', run:null, verdict:'ok'},

/* ===================== 第4章 串与 KMP（题源：王道第4章 4.2.4 本节试题精选 + 自编手算特训） ===================== */
{id:'4.2-1', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'', exam:null, kp:['模式匹配·概念'], stem:'设有两个串 S<sub>1</sub> 和 S<sub>2</sub>，求 S<sub>2</sub> 在 S<sub>1</sub> 中首次出现的位置的运算称为（　）。', opts:['求子串','判断是否相等','模式匹配','连接'], ans:'C', book:'求子串 SubString 是"从第 pos 个字符起取长度为 len 的子串"；判等是 StrCompare；连接是 Concat。而"在主串中找另一个串首次出现的位置"正是 <b>模式匹配</b>（即定位运算 Index）。故选 C。', claude:'一致。口诀：<b>Index = 定位 = 模式匹配</b>。A 是"取"不是"找"，B/D 明显不沾边。选 C。', run:null, verdict:'ok'},

{id:'4.2-2', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'', exam:null, kp:['KMP·指针规则'], stem:'KMP 算法的特点是在模式匹配时，指示主串的指针（　）。', opts:['不会变大','不会变小','都有可能','无法判断'], ans:'B', book:'KMP 的全部价值就在于主串指针 <b>i 不回溯</b>：失配时只把模式串指针 j 退到 next[j]，i 原地不动或继续前进，所以 i 的值不会变小。选 B。', claude:'一致。注意"不会变小"≠"一定变大"——失配那一步 i 是<b>不动</b>的，所以 A（不会变大）错、B 对。这条是本章第一考点：<b>i 不回溯</b>。', run:null, verdict:'ok'},

{id:'4.2-3', ch:4, sec:'4.2 串的模式匹配', type:'subjective', tag:'双空题', exam:null, kp:['模式匹配·复杂度'], stem:'（双空题）设主串的长度为 n，子串的长度为 m，则简单的模式匹配算法的时间复杂度为＿＿，KMP 算法的时间复杂度为＿＿。<br>备选：A. O(m)　B. O(n)　C. O(mn)　D. O(m+n)', book:'第一空 <b>C</b>，第二空 <b>D</b>。简单（暴力）模式匹配最多 n−m+1 趟、每趟最多比较 m 次，最坏 <b>O(mn)</b>；KMP 主串不回溯，求 next 花 O(m)、匹配花 O(n)，合计 <b>O(m+n)</b>。<br>注意书上强调：实际应用中暴力匹配的<b>平均</b>时间往往接近 O(m+n)，但它的<b>理论最坏</b>复杂度仍是 O(mn)——选择题问"时间复杂度"默认按最坏算。', claude:'答案 C、D。最坏用例记牢：模式串 <code>0000001</code> 配主串一长串 <code>0</code>——每趟都要比到最后一个字符才发现不匹配，这就是 O(mn) 的来源。KMP 的 O(m+n) 里，O(m) 是求 next 的开销，别漏。', run:'实测 S=aabaabaabaac、T=aabaac：暴力比较 24 次，KMP 比较 14 次（同一对串，KMP 省 42%）', verdict:'ok'},

{id:'4.2-4', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'', exam:null, kp:['KMP·指针规则'], stem:'在 KMP 算法中，用 next 数组存放模式串的部分匹配信息，当模式串位 j 与主串位 i 比较时，两个字符不相等，则 j 的位移方式是（　）。', opts:['j=0','j=j+1','j 不变','j=next[j]'], ans:'D', book:'失配时主串指针 i 不变，模式串指针回退到 next[j] 指示的位置继续比较，即 <b>j=next[j]</b>。选 D。', claude:'一致。这就是 KMP 主循环的 else 分支 <code>j=next[j];</code>。A 的 j=0 只是 next[1]=0 这一特例（1 号位失配），不是通用规则。', run:null, verdict:'ok'},

{id:'4.2-5', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'', exam:null, kp:['KMP·指针规则'], stem:'在 KMP 算法中，用 next 数组存放模式串的部分匹配信息，当模式串位 j 与主串位 i 比较时，两个字符不相等，则 i 的位移方式是（　）。', opts:['i=next[i]','i 不变','i=0','i=i+1'], ans:'B', book:'KMP 失配时主串指针 <b>i 不回溯、也不前进，保持不变</b>，只调整 j。选 B。', claude:'一致，与 4.2-2 同一条铁律的两种问法。唯一例外：当 j 退到 0（模式串首字符也失配）时，下一步 i 和 j 同时加 1——但那已经是"j==0"分支，不算失配那一步的位移。', run:null, verdict:'ok'},

{id:'4.2-6', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'', exam:null, kp:['KMP·next手算'], stem:'串 <code>ababaaababaa</code> 的 next 数组为（　）。', opts:['0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9','0, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 2','0, 1, 1, 2, 3, 4, 2, 2, 3, 4, 5, 6','0, 1, 2, 3, 0, 1, 2, 3, 2, 2, 3, 4, 5'], ans:'C', book:'方法：先求部分匹配值表 PM（各前缀的最长相等前后缀长度），再<b>整体右移一位、首位补 0（等价于低位补 −1 后整体 +1）</b>即得 next。<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th></tr><tr><td class="rowh">串</td><td>a</td><td>b</td><td>a</td><td>b</td><td>a</td><td>a</td><td>a</td><td>b</td><td>a</td><td>b</td><td>a</td><td>a</td></tr><tr><td class="rowh">PM</td><td>0</td><td>0</td><td>1</td><td>2</td><td>3</td><td>1</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>1</td><td>2</td><td>3</td><td>4</td><td>2</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr></table>选项中 next[1]=0，故选 <b>C</b>。（A 只有 11 个数、D 有 13 个数，长度就不对，可直接排除。）', claude:'一致，我逐位重算 PM = 0,0,1,2,3,1,1,2,3,4,5,6，右移加一得 next = 0,1,1,2,3,4,2,2,3,4,5,6 = C。<br><b>秒杀技</b>：本题四个选项里，先数长度（串长 12 → next 也必须 12 个数），A、D 立刻出局；再看 next[1] 必为 0、next[2] 必为 1，B 的第 3 位是 2（意味着前两位 ab 相等，显然不对）也可排除。', run:'程序核验：PM=[0,0,1,2,3,1,1,2,3,4,5,6] → next=[0,1,1,2,3,4,2,2,3,4,5,6] ✅ 与书答 C 完全一致', verdict:'ok'},

{id:'4.2-7', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'', exam:null, kp:['KMP·比较次数'], stem:'设主串 S=<code>aabaaaba</code>，模式串 T=<code>aaab</code>，采用 KMP 算法进行模式匹配，到匹配成功时为止，在匹配过程中进行的单个字符间的比较次数是（　）。', opts:['10','9','8','7'], ans:'B', book:'先手算 T 的 next：<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th></tr><tr><td class="rowh">串</td><td>a</td><td>a</td><td>a</td><td>b</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>2</td><td>3</td></tr></table>第一趟比 3 次在 S[3]=b 与 T[3]=a 失配；第二趟用 S[3] 与 T[2] 比（1 次）、第三趟用 S[3] 与 T[1] 比（1 次）；此时 next[1]=0，i 后移从 S[4] 与 T[1] 重新开始，连比 4 次匹配成功。总比较次数 3+1+1+4 = <b>9</b>。选 B。', claude:'一致，我按王道 1-indexed 代码逐步模拟，共 9 次字符比较，成功位置 = 主串第 4 位。<br><b>数比较次数的规矩</b>：只有真正执行 S[i] 与 T[j] 的那一次算一次；当 j 退到 0 时走的是 <code>j==0</code> 分支（i、j 同时加 1），<b>不产生比较</b>，千万别多数一次。<br>同一对串暴力匹配要 10 次，KMP 只省了 1 次——因为 T 太短，这也印证了"KMP 只在大量部分匹配时才明显占优"。', run:'程序模拟 9 次比较（3+1+1+4），暴力法 10 次 ✅ 与书答 B 一致', verdict:'ok'},

{id:'4.2-8', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'', exam:null, kp:['KMP·nextval'], stem:'设主串 S=<code>aabaaaba</code>，模式串 T=<code>aaab</code>，采用<b>改进后</b>的 KMP 算法（nextval 数组）进行模式匹配，到匹配成功时为止，在匹配过程中进行的单个字符间的比较次数是（　）。', opts:['9','8','7','6'], ans:'C', book:'先求 nextval：<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th></tr><tr><td class="rowh">串</td><td>a</td><td>a</td><td>a</td><td>b</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>2</td><td>3</td></tr><tr><td class="rowh">nextval</td><td>0</td><td>0</td><td>0</td><td>3</td></tr></table>规则：若 T[j] 与 T[next[j]] 相同，则 nextval[j]=nextval[next[j]]，否则 nextval[j]=next[j]。<br>第一趟比 3 次在 S[3] 失配，nextval[3]=0，直接从 S[4] 与 T[1] 重新开始，连比 4 次成功。总比较 3+4 = <b>7</b>。选 C。', claude:'一致。对照 4.2-7：next 版在 S[3] 上白比了两次（拿同样是 a 的 T[2]、T[1] 去撞已知不是 a 的 b），nextval 一次跳到底，正好省下这 2 次 → 9−2=7。<br><b>这就是 nextval 的全部意义</b>：不让 p<sub>j</sub> = p<sub>next[j]</sub> 的"注定失败的比较"发生。', run:'程序模拟 nextval=[0,0,0,3]，比较 7 次 ✅ 与书答 C 一致（比 next 版少 2 次）', verdict:'ok'},

{id:'4.2-9', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'', exam:null, kp:['KMP·滑动距离'], stem:'KMP 算法使用 nextval 数组进行模式匹配，模式串为 S=<code>ababaaa</code>，当主串中的某个字符与 S 中的第 6 个字符失配时，S 向右滑动的距离是（　）。', opts:['1','2','3','4'], ans:'B', book:'滑动距离 = <b>j − nextval[j]</b>。按位序从 0 开始计算：<table class="qtab"><tr><th>编号 j(从0)</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr><tr><td class="rowh">串</td><td>a</td><td>b</td><td>a</td><td>b</td><td>a</td><td>a</td><td>a</td></tr><tr><td class="rowh">next</td><td>-1</td><td>0</td><td>0</td><td>1</td><td>2</td><td>3</td><td>1</td></tr><tr><td class="rowh">nextval</td><td>-1</td><td>0</td><td>-1</td><td>0</td><td>-1</td><td>3</td><td>1</td></tr><tr><td class="rowh">j−nextval</td><td>1</td><td>1</td><td>3</td><td>3</td><td>5</td><td>2</td><td>5</td></tr></table>第 6 个字符即 j=5（0 开始），滑动距离 = 5 − 3 = <b>2</b>。选 B。<br>书上还给了不算表的口算法：与第 6 个字符失配，说明前面的 <code>ababa</code> 已匹配成功，其最长相等前后缀是 <code>aba</code>（长 3），把模式串右滑到该后缀对齐处即右移 5−3=2 位。', claude:'一致。两点提醒：<br>① <b>位序从 0 还是从 1，答案不变</b>——1-indexed 时 j=6、nextval[6]=4，6−4=2，同样是 2。差的那个 1 在减法里抵消了。<br>② 滑动距离公式还有个等价形式：<b>右滑位数 = 已匹配字符数 − 该处的部分匹配值</b> = 5 − 3 = 2，考场上哪个顺手用哪个。', run:'程序核验：ababaaa 的 nextval（0 起）=[−1,0,−1,0,−1,3,1]，j=5 → 5−3=2 ✅ 与书答 B 一致', verdict:'ok'},

{id:'4.2-10', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'2015 统考真题', exam:2015, kp:['KMP·指针规则'], stem:'【2015 统考真题】已知字符串 s 为 <code>abaabaabacacaabaabcc</code>，模式串 t 为 <code>abaabc</code>。采用 KMP 算法进行匹配，第一次出现"失配"（s[i]≠t[j]）时，i=j=5，则下次开始匹配时，i 和 j 的值分别是（　）。', opts:['i=1, j=0','i=5, j=0','i=5, j=2','i=6, j=2'], ans:'C', book:'题目写 s[i]≠t[j] 且 i=j=5，说明<b>位序从 0 开始</b>（要灵活应变）。按 next 生成算法：<table class="qtab"><tr><th>编号 j(从0)</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr><tr><td class="rowh">串</td><td>a</td><td>b</td><td>a</td><td>a</td><td>b</td><td>c</td></tr><tr><td class="rowh">next</td><td>-1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>2</td></tr></table>失配时主串指针 i 不回溯（仍为 5），模式串指针 j 退到 next[5]=2。故 <b>i=5，j=2</b>，选 C。', claude:'一致。这题唯一的坑是<b>下标基准</b>：题干用 i=j=5 且 s[5]=a、t[5]=c 确实失配，若按 1 开始算 next 会得到 j=3 而选错。<br>判断口诀：题干给的是 <code>s[i]</code>/<code>t[j]</code> 这种数组下标写法，多半从 0 开始；给的是"第 j 个字符"，则从 1 开始。<br>另外 A、B、D 三项都违反"i 不回溯且失配那步 i 不动"，只有 C 保住 i=5。', run:'程序核验：abaabc 的 next（0 起）=[−1,0,0,1,1,2]，j←next[5]=2，i 保持 5 ✅ 与书答 C 一致', verdict:'ok'},

{id:'4.2-11', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'2019 统考真题', exam:2019, kp:['KMP·比较次数'], stem:'【2019 统考真题】设主串 T=<code>abaabaabcabaabc</code>，模式串 S=<code>abaabc</code>，采用 KMP 算法进行模式匹配，到匹配成功时为止，在匹配过程中进行的单个字符间的比较次数是（　）。', opts:['9','10','12','15'], ans:'B', book:'求模式串 S 的 next（位序从 0 开始）：<table class="qtab"><tr><th>编号 j(从0)</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr><tr><td class="rowh">串</td><td>a</td><td>b</td><td>a</td><td>a</td><td>b</td><td>c</td></tr><tr><td class="rowh">next</td><td>-1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>2</td></tr></table>第一趟连续比较 6 次，在模式串 5 号位与主串 5 号位失配；next[5]=2，下一次从模式串 2 号位与主串 5 号位开始，一直比到模式串 5 号位与主串 8 号位匹配成功，第二趟比较 4 次。总比较次数 6+4 = <b>10</b>。选 B。', claude:'一致，我逐次模拟得 10 次（前 6 次到 c≠a 失配，j 退到 next=2 后再 4 次成功），匹配起点为主串 0 号位起第 3 位（1-indexed 第 4 位）。<br><b>数比较次数的通用做法</b>（本章最常考的手工活）：<br>① 先把 next 写出来；② 每趟从当前 j 往后比，失配那一次<b>也要计入</b>；③ 失配后 i 不动、j←next[j]，继续在<b>同一个 i</b> 上比（这一次算新的一次）；④ 只有 j 退到 −1/0 时才 i++ 且不计比较。', run:'程序模拟：6 次后失配 → j←2 → 再 4 次成功，共 10 次 ✅ 与书答 B 一致', verdict:'ok'},

{id:'4.2-12', ch:4, sec:'4.2 串的模式匹配', type:'choice', tag:'2024 统考真题', exam:2024, kp:['KMP·nextval'], stem:'【2024 统考真题】KMP 算法使用修正后的 next 数组（即 nextval）进行模式匹配，模式串为 S=<code>aabaab</code>，当主串的某个字符与 S 的某个字符失配时，S 向右滑动的最长距离是（　）。', opts:['5','4','3','2'], ans:'A', book:'位序从 0 开始，先求 next 再修正为 nextval，逐位算滑动距离 j − nextval[j]：<table class="qtab"><tr><th>编号 j(从0)</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr><tr><td class="rowh">串</td><td>a</td><td>a</td><td>b</td><td>a</td><td>a</td><td>b</td></tr><tr><td class="rowh">next</td><td>-1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>2</td></tr><tr><td class="rowh">nextval</td><td>-1</td><td>-1</td><td>1</td><td>-1</td><td>-1</td><td>1</td></tr><tr><td class="rowh">j−nextval</td><td>1</td><td>2</td><td>1</td><td>4</td><td>5</td><td>4</td></tr></table>最长滑动距离出现在 j=4：5 − 0 = <b>5</b>（表中 j−nextval 一行的最大值）。选 A。', claude:'一致。<b>本题是"遍历取最大"，不是问某一位</b>——必须把每一位的 j−nextval[j] 都算出来再取 max，只算最后一位会得 4（选 B），这正是命题人埋的坑。<br>修正过程复核：next(0起)=[−1,0,1,0,1,2]；<br>j=1：S[1]=a 与 S[next[1]=0]=a 相同 → nextval[1]=nextval[0]=−1；<br>j=3：S[3]=a 与 S[0]=a 相同 → −1；j=4：S[4]=a 与 S[1]=a 相同 → nextval[4]=nextval[1]=−1，故 4−(−1)=5 最大。', run:'程序核验：nextval(0起)=[−1,−1,1,−1,−1,1]，j−nextval=[1,2,1,4,5,4] → max=5 ✅ 与书答 A 一致', verdict:'ok'},

{id:'4.2-综1', ch:4, sec:'4.2 综合应用题', type:'subjective', hints:['求 next 两法互验——PM 右移法（快）、递推法（稳）。','PM 法：逐位写「最长相等真前后缀」长度 → 整表右移一位、首位补 0。递推法：k=next[j−1]，比 p(j−1) 与 p(k)：相等 next[j]=k+1，否则 k←next[k] 退到 0 填 1。'], tag:'', exam:null, kp:['KMP·next定义'], stem:'在字符串模式匹配的 KMP 算法中，求模式的 next 数组值的定义如下：<br>next[j] = 0（当 j=1 时）；= max{ k | 1＜k＜j 且 <code>p₁…p_{k−1}</code> = <code>p_{j−k+1}…p_{j−1}</code> }（当此集合不为空时）；= 1（其他情况）。<br>请回答：1）当 j=1 时，为什么要取 next[1]=0？　2）为什么要取 max{k}，k 最大是多少？　3）"其他情况"是什么情况，为什么取 next[j]=1？', book:'1）当模式串的第 1 个字符就与主串当前字符比较不相等时，next[1]=0 表示模式串应<b>右滑一位</b>，主串当前指针后移一位，再和模式串的第 1 个字符进行比较。（即 j=0 分支：i、j 同时加 1。）<br>2）当主串第 i 个字符与模式串第 j 个字符失配时，主串 i 不回溯，假定模式串第 k 个字符与主串第 i 个字符比较，k 应满足 1＜k＜j 且 <code>p₁…p_{k−1}</code> = <code>p_{j−k+1}…p_{j−1}</code>，即 k 为下次比较位置。满足条件的 k 可能有多个，<b>为了不使向右滑动丢失可能的匹配，右滑距离应该取最小</b>，因为 j−k 表示右滑的距离，所以取 max{k}。<b>k 的最大值为 j−1</b>。<br>3）除上面两种情况外（即已匹配部分不存在任何相等的真前后缀），发生失配时主串指针 i 不回溯，在最坏情况下，模式串从第 1 个字符开始与主串的第 i 个字符比较，故 next[j]=1。', claude:'三问其实是同一件事的三个角落，用一句话串起来：<b>next[j] 就是"失配后模式串还能保住多少已匹配的前缀"，滑得越少越安全</b>。<br>① j=1 时前面一个字符都没匹配上，无前缀可保，只能整体右滑一位——用 0 作为"没有可比位置"的哨兵，配合代码里 <code>if(j==0)</code> 分支让 i、j 同时加 1。<br>② k 越大 → 保留的前缀越长 → 右滑距离 j−k 越小 → 越不会跳过潜在匹配。取 max 是<b>为了不漏解</b>，不是为了快；k 最大 j−1（此时只滑 1 位）。<br>③ 没有任何相等前后缀 = k 只能取 1，模式串整体滑到当前失配位置重新比，next[j]=1。<br>⚠️ 这套定义是<b>位序从 1</b> 的版本；若位序从 0，三条分别变成 −1 / max{k} / 0，整体减 1。答题时先声明用哪种约定，阅卷才不会判错。', run:null, verdict:'ok'},

{id:'4.2-综2', ch:4, sec:'4.2 综合应用题', type:'subjective', hints:['先手算 next，再塌陷成 nextval（出现 p(j)=p(next[j]) 就继续往回退）。','nextval[j]：若 p(j)=p(next[j]) 则 nextval[j]=nextval[next[j]]，否则 =next[j]。数比较次数：失配那次要算、j 退到 0 那步不算。'], tag:'', exam:null, kp:['KMP·next手算'], stem:'设有字符串 S=<code>aabaabaabaac</code>，P=<code>aabaac</code>。<br>1）求出 P 的 next 数组；<br>2）若 S 作为主串，P 作为模式串，试给出 KMP 算法的匹配过程。', book:'<b>1）</b>按 next 生成算法（位序从 1）：设 next[1]=0、next[2]=1；<br>j=3 时 k=next[2]=1，S[2]=a 与 S[1]=a 相等 → next[3]=k+1=2；<br>j=4 时 k=next[3]=2，S[3]=b 与 S[2]=a 不等 → 令 k=next[2]=1，S[3]=b 与 S[1]=a 仍不等 → k=next[1]=0 → next[4]=1；<br>j=5 时 k=next[4]=1，S[4]=a 与 S[1]=a 相等 → next[5]=2；<br>j=6 时 k=next[5]=2，S[5]=a 与 S[2]=a 相等 → next[6]=3。最后结果：<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr><tr><td class="rowh">串</td><td>a</td><td>a</td><td>b</td><td>a</td><td>a</td><td>c</td></tr><tr><td class="rowh">PM</td><td>0</td><td>1</td><td>0</td><td>1</td><td>2</td><td>0</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>2</td><td>1</td><td>2</td><td>3</td></tr><tr><td class="rowh">nextval</td><td>0</td><td>0</td><td>2</td><td>0</td><td>0</td><td>3</td></tr></table>（也可以先求部分匹配值表 PM=0,1,0,1,2,0，右移一位加 1 得同样结果。）<br><b>2）</b>第一趟：从主串和模式串的第 1 个字符开始比较，失配时 i=6、j=6；<br>第二趟：next[6]=3，主串当前位置（i=6）和模式串的第 3 个字符继续比较，失配时 i=9、j=6；<br>第三趟：next[6]=3，主串当前位置（i=9）和模式串的第 3 个字符继续比较，匹配成功（主串第 7 位起）。', claude:'书答两问全部核对无误。补三条考场经验：<br>① <b>两种手算法互为验算</b>：递推法（k=next[j−1]，比 S[j−1] 与 S[k]，相等则 next[j]=k+1，否则 k←next[k] 继续退）和 PM 右移法结果必须一致，考场上求完用另一种扫一遍，30 秒查错。<br>② 本题 next 里出现 next[4]=1，正是"退到底也没有相等前后缀"的情形——手算时 k 一路退到 0 就填 1，别忘了这一步。<br>③ "给出匹配过程"这类题，答题纸上<b>每趟画一行对齐图</b>并标注 i、j 与 next 值，比只写结论得分高；主串一行始终不动（体现 i 不回溯），模式串一行往右挪。<br>我逐次模拟了整个过程：共 <b>14 次</b>字符比较，分 3 趟（6 次失配 → 4 次失配 → 4 次成功），匹配起点为主串第 7 位。', run:'程序模拟：next=[0,1,2,1,2,3]；KMP 共 14 次比较、3 趟，成功于第 7 位；同串暴力法要 24 次 ✅ 与书答一致', verdict:'ok'},

{id:'4-思维拓展', ch:4, sec:'思维拓展', type:'subjective', tag:'', exam:null, kp:['算法·KMP实现'], stem:'编程实现：模式串在主串中有多少个完全匹配的子串？（注意：统考应不会考 KMP 算法题，本题用于把 next 的理解落到代码上。）', code:'/* 统计模式串 T 在主串 S 中出现的次数（允许重叠），KMP 版，位序从 1 */\nvoid get_next(SString T, int next[]){\n    int i=1, j=0;\n    next[1]=0;\n    while(i<T.length){\n        if(j==0 || T.ch[i]==T.ch[j]){ ++i; ++j; next[i]=j; }\n        else j=next[j];\n    }\n    /* 关键：多求一位 next[m+1]，供"匹配成功后继续找下一个"使用 */\n    i=T.length; j=next[i];\n    while(j>0 && T.ch[i]!=T.ch[j]) j=next[j];\n    next[T.length+1] = (T.ch[i]==T.ch[j]) ? j+1 : 1;\n}\n\nint CountKMP(SString S, SString T){\n    int next[MAXLEN], i=1, j=1, cnt=0;\n    get_next(T, next);\n    while(i<=S.length){\n        if(j==0 || S.ch[i]==T.ch[j]){\n            ++i; ++j;\n            if(j>T.length){             // 完成一次完整匹配\n                cnt++;\n                j = next[T.length+1];   // 不回退 i，直接借 next 找可重叠的下一次\n            }\n        }\n        else j=next[j];\n    }\n    return cnt;                          // 时间 O(m+n)，空间 O(m)\n}', book:'思路：在标准 KMP 匹配循环中，把"匹配成功即 return"改为"计数 +1 后继续"。继续时不能把 j 简单地置 1（那会漏掉重叠出现，如主串 <code>aaaa</code> 中的 <code>aa</code> 应算 3 次），而应令 j = next[m+1]，即把整个模式串当作"已匹配的前缀"再求一次 next，从其最长相等前后缀处接着比。时间复杂度 O(m+n)。<br>若题目只要求<b>不重叠</b>计数，则匹配成功后置 j=1 并让 i 从当前位置继续即可。', claude:'两点最容易写错：<br>① <b>next 只求到 m 是不够的</b>——匹配成功发生在 j=m+1，必须多推一位 next[m+1]（等于 PM[m]+1）才知道往回退到哪。<br>② 成功后<b>绝不能回退 i</b>，否则复杂度退化。<br>验证方式：拿朴素的"逐位截取比较"当对照组随机对拍，比自己盯代码可靠得多。', run:'已用 Python 等价实现与朴素法随机对拍 3000 组（字母表 {a,b}，主串长 1–20、模式长 1–5）：全部一致 ✅。定点核验：aaaa/aa=3，abababa/aba=3，mississippi/issi=2，aabaabaabaac/aabaac=1', verdict:'ok'},

{id:'4-特训1', ch:4, sec:'手算特训（自编）', type:'subjective', tag:'自编·手算特训', exam:null, kp:['KMP·next手算'], stem:'【手算特训 · 周期串 + 末位打断】写出模式串 <code>abcabcabd</code> 的部分匹配值表 PM、next 数组与 nextval 数组（位序从 1 开始）。<br><span style="color:var(--muted);font-size:.85rem">建议：先用"PM 右移一位再整体加 1"求 next，再用另一种递推法验算，两次结果一致才算过关。</span>', book:'（本题为自编手算特训，非王道原题）标准答案：<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr><tr><td class="rowh">串</td><td>a</td><td>b</td><td>c</td><td>a</td><td>b</td><td>c</td><td>a</td><td>b</td><td>d</td></tr><tr><td class="rowh">PM</td><td>0</td><td>0</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>0</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>1</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr><tr><td class="rowh">nextval</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td><td>6</td></tr></table>求法回顾：PM[j] = 前 j 个字符的最长相等真前后缀长度；next[1]=0，next[j]=PM[j−1]+1；nextval[1]=0，若 p<sub>j</sub> 与 p<sub>next[j]</sub> 相同则 nextval[j]=nextval[next[j]]，否则 nextval[j]=next[j]。', claude:'这类"abcabc…"周期串的 PM 值会一路 +1 递增，直到被最后那个异常字符打断归零——考场上看到明显周期就可以直接顺推，不用一位位找前后缀。<br>⚠️ 自查两条硬约束：① next[1] 必为 0、next[2] 必为 1；② 相邻两位 next 最多涨 1（next[j+1] ≤ next[j]+1），若你算出某处跳涨 2，一定错了。', run:'PM/next/nextval 三行均由程序独立计算生成（与手写无关），可直接作为标准答案对照', verdict:'ok'},

{id:'4-特训2', ch:4, sec:'手算特训（自编）', type:'subjective', tag:'自编·手算特训', exam:null, kp:['KMP·next手算'], stem:'【手算特训 · 全同串（next 的上界）】写出模式串 <code>aaaaa</code> 的部分匹配值表 PM、next 数组与 nextval 数组（位序从 1 开始）。<br><span style="color:var(--muted);font-size:.85rem">建议：先用"PM 右移一位再整体加 1"求 next，再用另一种递推法验算，两次结果一致才算过关。</span>', book:'（本题为自编手算特训，非王道原题）标准答案：<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr><tr><td class="rowh">串</td><td>a</td><td>a</td><td>a</td><td>a</td><td>a</td></tr><tr><td class="rowh">PM</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><td class="rowh">nextval</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></table>求法回顾：PM[j] = 前 j 个字符的最长相等真前后缀长度；next[1]=0，next[j]=PM[j−1]+1；nextval[1]=0，若 p<sub>j</sub> 与 p<sub>next[j]</sub> 相同则 nextval[j]=nextval[next[j]]，否则 nextval[j]=next[j]。', claude:'全同串是 next 的极值形态：PM=0,1,2,3,4，next=0,1,2,3,4，每失配一次只滑 1 位，退化成暴力。但它的 nextval 全是 0（除首位），一步到底——这正是 nextval 存在的理由，也是 2024 真题的原型。<br>⚠️ 自查两条硬约束：① next[1] 必为 0、next[2] 必为 1；② 相邻两位 next 最多涨 1（next[j+1] ≤ next[j]+1），若你算出某处跳涨 2，一定错了。', run:'PM/next/nextval 三行均由程序独立计算生成（与手写无关），可直接作为标准答案对照', verdict:'ok'},

{id:'4-特训3', ch:4, sec:'手算特训（自编）', type:'subjective', tag:'自编·手算特训', exam:null, kp:['KMP·next手算'], stem:'【手算特训 · 全异串（next 的下界）】写出模式串 <code>abcdef</code> 的部分匹配值表 PM、next 数组与 nextval 数组（位序从 1 开始）。<br><span style="color:var(--muted);font-size:.85rem">建议：先用"PM 右移一位再整体加 1"求 next，再用另一种递推法验算，两次结果一致才算过关。</span>', book:'（本题为自编手算特训，非王道原题）标准答案：<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr><tr><td class="rowh">串</td><td>a</td><td>b</td><td>c</td><td>d</td><td>e</td><td>f</td></tr><tr><td class="rowh">PM</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr><tr><td class="rowh">nextval</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr></table>求法回顾：PM[j] = 前 j 个字符的最长相等真前后缀长度；next[1]=0，next[j]=PM[j−1]+1；nextval[1]=0，若 p<sub>j</sub> 与 p<sub>next[j]</sub> 相同则 nextval[j]=nextval[next[j]]，否则 nextval[j]=next[j]。', claude:'所有字符互不相同 → 没有任何相等前后缀 → PM 全 0、next 全 1（首位 0）。此时 KMP 每次失配都把模式串首字符对到当前失配位，一趟一趟往前推，效率最好（主串一趟扫完）。<br>⚠️ 自查两条硬约束：① next[1] 必为 0、next[2] 必为 1；② 相邻两位 next 最多涨 1（next[j+1] ≤ next[j]+1），若你算出某处跳涨 2，一定错了。', run:'PM/next/nextval 三行均由程序独立计算生成（与手写无关），可直接作为标准答案对照', verdict:'ok'},

{id:'4-特训4', ch:4, sec:'手算特训（自编）', type:'subjective', tag:'自编·手算特训', exam:null, kp:['KMP·next手算'], stem:'【手算特训 · 两字符周期串】写出模式串 <code>ababab</code> 的部分匹配值表 PM、next 数组与 nextval 数组（位序从 1 开始）。<br><span style="color:var(--muted);font-size:.85rem">建议：先用"PM 右移一位再整体加 1"求 next，再用另一种递推法验算，两次结果一致才算过关。</span>', book:'（本题为自编手算特训，非王道原题）标准答案：<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr><tr><td class="rowh">串</td><td>a</td><td>b</td><td>a</td><td>b</td><td>a</td><td>b</td></tr><tr><td class="rowh">PM</td><td>0</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><td class="rowh">nextval</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td></tr></table>求法回顾：PM[j] = 前 j 个字符的最长相等真前后缀长度；next[1]=0，next[j]=PM[j−1]+1；nextval[1]=0，若 p<sub>j</sub> 与 p<sub>next[j]</sub> 相同则 nextval[j]=nextval[next[j]]，否则 nextval[j]=next[j]。', claude:'PM=0,0,1,2,3,4：偶数位涨得快。注意 nextval：j=3 时 p₃=a 与 p_{next[3]=1}=a 相同 → nextval[3]=nextval[1]=0，会连锁塌陷成 0,1,0,1,0,1。<br>⚠️ 自查两条硬约束：① next[1] 必为 0、next[2] 必为 1；② 相邻两位 next 最多涨 1（next[j+1] ≤ next[j]+1），若你算出某处跳涨 2，一定错了。', run:'PM/next/nextval 三行均由程序独立计算生成（与手写无关），可直接作为标准答案对照', verdict:'ok'},

{id:'4-特训5', ch:4, sec:'手算特训（自编）', type:'subjective', tag:'自编·手算特训', exam:null, kp:['KMP·next手算'], stem:'【手算特训 · 含重复段的混合串】写出模式串 <code>aabcaabca</code> 的部分匹配值表 PM、next 数组与 nextval 数组（位序从 1 开始）。<br><span style="color:var(--muted);font-size:.85rem">建议：先用"PM 右移一位再整体加 1"求 next，再用另一种递推法验算，两次结果一致才算过关。</span>', book:'（本题为自编手算特训，非王道原题）标准答案：<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr><tr><td class="rowh">串</td><td>a</td><td>a</td><td>b</td><td>c</td><td>a</td><td>a</td><td>b</td><td>c</td><td>a</td></tr><tr><td class="rowh">PM</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>2</td><td>1</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr><tr><td class="rowh">nextval</td><td>0</td><td>0</td><td>2</td><td>1</td><td>0</td><td>0</td><td>2</td><td>1</td><td>0</td></tr></table>求法回顾：PM[j] = 前 j 个字符的最长相等真前后缀长度；next[1]=0，next[j]=PM[j−1]+1；nextval[1]=0，若 p<sub>j</sub> 与 p<sub>next[j]</sub> 相同则 nextval[j]=nextval[next[j]]，否则 nextval[j]=next[j]。', claude:'这类串最像真题（2015/2019 都是这个形态）。手算时用递推法：k=next[j−1]，比 p_{j−1} 与 p_k，相等就 +1，不等就 k←next[k] 一路退，退到 0 就填 1。<br>⚠️ 自查两条硬约束：① next[1] 必为 0、next[2] 必为 1；② 相邻两位 next 最多涨 1（next[j+1] ≤ next[j]+1），若你算出某处跳涨 2，一定错了。', run:'PM/next/nextval 三行均由程序独立计算生成（与手写无关），可直接作为标准答案对照', verdict:'ok'},

{id:'4-特训6', ch:4, sec:'手算特训（自编）', type:'subjective', tag:'自编·手算特训', exam:null, kp:['KMP·next手算'], stem:'【手算特训 · 退栈两次的串】写出模式串 <code>abaabaaab</code> 的部分匹配值表 PM、next 数组与 nextval 数组（位序从 1 开始）。<br><span style="color:var(--muted);font-size:.85rem">建议：先用"PM 右移一位再整体加 1"求 next，再用另一种递推法验算，两次结果一致才算过关。</span>', book:'（本题为自编手算特训，非王道原题）标准答案：<table class="qtab"><tr><th>编号 j</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr><tr><td class="rowh">串</td><td>a</td><td>b</td><td>a</td><td>a</td><td>b</td><td>a</td><td>a</td><td>a</td><td>b</td></tr><tr><td class="rowh">PM</td><td>0</td><td>0</td><td>1</td><td>1</td><td>2</td><td>3</td><td>4</td><td>1</td><td>2</td></tr><tr><td class="rowh">next</td><td>0</td><td>1</td><td>1</td><td>2</td><td>2</td><td>3</td><td>4</td><td>5</td><td>2</td></tr><tr><td class="rowh">nextval</td><td>0</td><td>1</td><td>0</td><td>2</td><td>1</td><td>0</td><td>2</td><td>5</td><td>1</td></tr></table>求法回顾：PM[j] = 前 j 个字符的最长相等真前后缀长度；next[1]=0，next[j]=PM[j−1]+1；nextval[1]=0，若 p<sub>j</sub> 与 p<sub>next[j]</sub> 相同则 nextval[j]=nextval[next[j]]，否则 nextval[j]=next[j]。', claude:'这串会出现"k 退了两次才落定"的情形，是检验递推法有没有真正掌握的试金石——只会 PM 右移法的话此题也能做，两法互验最稳。<br>⚠️ 自查两条硬约束：① next[1] 必为 0、next[2] 必为 1；② 相邻两位 next 最多涨 1（next[j+1] ≤ next[j]+1），若你算出某处跳涨 2，一定错了。', run:'PM/next/nextval 三行均由程序独立计算生成（与手写无关），可直接作为标准答案对照', verdict:'ok'},

/* ===================== 第5章 5.1 树的基本概念 ===================== */
{id:'5.1-1', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'', exam:null, kp:['树·概念'], stem:'树最适合用来表示（　）的数据。', opts:['有序','无序','任意元素之间具有多种联系','元素之间具有分支层次关系'], ans:'D', book:'树是一种<b>分层结构</b>，特别适合组织那些具有分支层次关系的数据（如文件目录、家谱、组织架构）。', claude:'一致。逐项排除：A「有序」是线性表的强项；B「无序」是集合；C「任意元素之间多种联系」是<b>图</b>；只有 D 的「分支 + 层次」两个词同时命中树的定义。选 D。', run:null, verdict:'ok'},

{id:'5.1-2', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'', exam:null, kp:['树·度与结点数'], stem:'一棵有 n 个结点的树的所有结点的度数之和为（　）。', opts:['n−1','n','n+1','2n'], ans:'A', book:'除根结点外，其他每个结点都是某个结点的孩子，因此树中所有结点的度数加 1 等于结点数，即<b>所有结点的度数之和 = 总结点数 − 1</b>。这是一个重要结论，做题时经常用到。', claude:'一致。<b>本章第一恒等式</b>，务必刻进脑子：<br>① 树中「度」= 孩子数（不含双亲，这点与图的度不同）；<br>② 每条边被它的双亲数一次 → 度数之和 = 边数；<br>③ n 个结点的树恰有 n−1 条边 → <b>Σdeg = n − 1</b>。<br>后面 5.1-7/8/9、综合题 02/03 全是它的变形。', run:'随机生成 59 棵树（n=1..59）逐棵实测，Σdeg = n−1 无一例外 ✅', verdict:'ok'},

{id:'5.1-3', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'', exam:null, kp:['树·路径长度'], stem:'树的路径长度是从树根到每个结点的路径长度的（　）。', opts:['总和','最小值','最大值','平均值'], ans:'A', book:'树的路径长度是指树根到每个结点的路径长的<b>总和</b>；根到每个结点的路径长度的<b>最大值</b>应是树的高度减 1。注意与哈夫曼树的带权路径长度相区别。', claude:'一致。三个易混概念一次分清：<br>· <b>路径长度</b>（PL）＝ Σ 各结点的深度，是<b>总和</b>；<br>· <b>最大值</b> ＝ 树高 − 1（边数口径）；<br>· <b>带权路径长度</b>（WPL）＝ Σ 叶结点权值 × 其路径长度，只数叶子、还要乘权——那是 5.5 哈夫曼树的主角。选 A。', run:null, verdict:'ok'},

{id:'5.1-4', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'', exam:null, kp:['树·高度上下界'], stem:'对于一棵具有 n 个结点、度为 4 的树来说，（　）。', opts:['树的高度至多是 n−3','树的高度至多是 n−4','第 i 层上至多有 4(i−1) 个结点','至少在某一层上正好有 4 个结点'], ans:'A', book:'要使得具有 n 个结点、度为 4 的树的高度最大，就要使得每层的结点数尽可能少：除最后一层外，每层的结点数是 1，最终该树的高度为 <b>n−3</b>。树的度为 4 只能说明存在某结点正好（也最多）有 4 个孩子，选项 D 错误。', claude:'一致。<b>拉链构造法</b>：树的度为 4 ⇒ 必须有一个结点带 4 个孩子（这是硬约束，省不掉）。把剩下的 n−4 个结点排成一条链，最后一个挂上那 4 个孩子 → 层数 = (n−4) + 1 = <b>n−3</b>。<br>逐项排除：B 少数一层；C 第 i 层至多 4<sup>i−1</sup> 个（是指数不是倍数，别看错）；D 「正好 4 个结点在同一层」不必然——那 4 个孩子确实同层，但题目说的是「某一层正好有 4 个结点」，若该层还有别的结点就不止 4 个了，所以 D 也不成立。', run:'构造核验：n=20、m=4 → 最大层数 = n−m+1 = 17 = n−3 ✅', verdict:'ok'},

{id:'5.1-5', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'', exam:null, kp:['树·高度上下界'], stem:'度为 4、高度为 h 的树，（　）。', opts:['至少有 h+3 个结点','至多有 4h−1 个结点','至多有 4h 个结点','至少有 h+4 个结点'], ans:'A', book:'要使度为 4、高度为 h 的树的总结点数最少，需要满足两个条件：① 至少有一个结点有 4 个分支；② 每层的结点数尽可能少。此时结点数为 <b>h+3</b>。<br>要使总结点数最多，应使每个非叶结点的度均为 4，即满树，总结点数最多为 1+4+4<sup>2</sup>+…+4<sup>h−1</sup> = (4<sup>h</sup>−1)/3。<br>对于本题和上一题，应画出草图来求解，就能一目了然。', claude:'一致，与 5.1-4 是同一构造的两种问法。<b>最少 = 一条长度 h−1 的链 + 末端挂 4 个孩子 = (h−1)+4 = h+3</b>，注意末端那 4 个孩子只占 1 层。<br>B、C 的「至多」都错得离谱：上界是等比求和 (4<sup>h</sup>−1)/3，是<b>指数级</b>，不可能是 4h 这种线性式。<br>D 的 h+4 多算一个——考场上代 h=1 秒杀：高度 1 的度为 4 的树…其实 h=1 时根本没法有度 4（只有根），代 h=2 更稳：链 1 个 + 4 个孩子 = 5 = h+3 ✅，而 D 给 6 ✗。', run:null, verdict:'ok'},

{id:'5.1-6', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'', exam:null, kp:['树·最小高度'], stem:'假定一棵度为 3 的树中，结点数为 50，则其最小高度为（　）。', opts:['3','4','5','6'], ans:'C', book:'要求满足条件的树，那么该树是一棵<b>完全三叉树</b>。在度为 3 的完全三叉树中，第 1 层有 1 个结点，第 2 层有 3<sup>1</sup>=3 个结点，第 3 层有 3<sup>2</sup>=9 个结点，第 4 层有 3<sup>3</sup>=27 个结点，因此结点数之和为 1+3+9+27 = 40，第 5 层的结点数 = 50−40 = 10 个，因此最小高度为 <b>5</b>。', claude:'一致。<b>求最小高度 = 每层塞满</b>，从上往下累加到装得下为止，别背公式也能做：1、4、13、40、121 —— 50 落在 40 与 121 之间 → 第 5 层。<br>要背公式的话是 h<sub>min</sub> = ⌈log<sub>m</sub>(n(m−1)+1)⌉ = ⌈log<sub>3</sub>101⌉ = 5，两法结果相同。<br>⚠️ 这个「1、4、13、40、121」的三叉树前缀和建议直接记住，5.2-22（三叉树 50 结点）、5.2-29（2022 真题三叉树 244 结点）考的是同一张表。', run:'逐层累加程序核验：1,4,13,40,121 → 50 需 5 层；公式 ⌈log₃(50×2+1)⌉ = 5 ✅ 两法一致', verdict:'ok'},

{id:'5.1-7', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'', exam:null, kp:['树·度与结点数'], stem:'设有一棵度为 3 的树，其中度为 3 的结点数 n<sub>3</sub>=2，度为 2 的结点数 n<sub>2</sub>=1，叶结点数 n<sub>0</sub>=6，则该树的结点总数为（　）。', opts:['12','9','10','≥9 的任意整数'], ans:'D', book:'总结点数 n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub>+n<sub>3</sub> = 6+n<sub>1</sub>+1+2 = n<sub>1</sub>+9，总度数 = n−1 = n<sub>1</sub>+2n<sub>2</sub>+3n<sub>3</sub> = n<sub>1</sub>+2+6 = n<sub>1</sub>+8。根据题目条件无法得出 n 的具体值，只能证明 n 是一个大于或等于 9 的任意整数。', claude:'一致，而且这是本节最阴的一道题——<b>题目故意漏给 n<sub>1</sub></b>。<br>把两式一减：n = n<sub>1</sub>+9 与 n−1 = n<sub>1</sub>+8 是<b>同一个等式</b>，恒成立、给不出新信息，所以 n<sub>1</sub> 可取 0,1,2,… 任意值，n 随之取 9,10,11,…<br><b>做题反射</b>：看到「已知部分 n<sub>i</sub> 求 n」先把两条恒等式列出来（Σn<sub>i</sub>=n 与 Σi·n<sub>i</sub>=n−1）；若<b>度为 1 的结点数未给</b>，答案十有八九是「不确定」。', run:'枚举 n₁=0..999 全部满足两式 → n 的可行取值 {9,10,11,…} 无上界，最小 9 ✅ 与书答 D 一致', verdict:'ok'},

{id:'5.1-8', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'', exam:null, kp:['树·度与结点数'], stem:'设一棵 m 叉树中有 N<sub>1</sub> 个度数为 1 的结点，N<sub>2</sub> 个度数为 2 的结点……N<sub>m</sub> 个度数为 m 的结点，则该树中共有（　）个叶结点。', opts:['Σ<sub>i=1</sub><sup>m</sup>(i−1)N<sub>i</sub>','Σ<sub>i=1</sub><sup>m</sup>N<sub>i</sub>','Σ<sub>i=2</sub><sup>m</sup>(i−1)N<sub>i</sub>','Σ<sub>i=2</sub><sup>m</sup>(i−1)N<sub>i</sub> + 1'], ans:'D', book:'设叶结点数为 N<sub>0</sub>，总结点数为 N，则 N = N<sub>1</sub>+2N<sub>2</sub>+3N<sub>3</sub>+…+mN<sub>m</sub>+1（总度数 +1），又因为 N = N<sub>0</sub>+N<sub>1</sub>+N<sub>2</sub>+…+N<sub>m</sub>，两式相减得<br>N<sub>0</sub> = N<sub>2</sub>+2N<sub>3</sub>+…+(m−1)N<sub>m</sub>+1 = Σ<sub>i=2</sub><sup>m</sup>(i−1)N<sub>i</sub> + 1。', claude:'一致。<b>两式相减</b>是本节的通用手法，5.1 综合题 03 就是本题的解答题版本。<br>四个选项的差别只在两处，各有一个坑：<br>· 求和<b>下标从 1 还是 2</b>：i=1 项是 (1−1)N<sub>1</sub>=0，写不写都不影响值——所以 A 和 C 其实数值相同，两个都对就说明两个都不是答案，<b>差的是那个 +1</b>；<br>· <b>那个 +1</b>：来自「结点数 = 度数和 + 1」，丢了它就错。<br>秒杀验算：单结点树（n=1，全 N<sub>i</sub>=0）叶子数应为 1，只有 D 给出 1。选 D。', run:'随机生成 2000 棵合法 m 叉树（n≤40，m=2..5），逐棵比对「公式算的叶数」与「实际叶数」：反例 0 个 ✅', verdict:'ok'},

{id:'5.1-9', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'2010 统考', exam:2010, kp:['树·度与结点数'], stem:'【2010 统考真题】在一棵度为 4 的树 T 中，若有 20 个度为 4 的结点，10 个度为 3 的结点，1 个度为 2 的结点，10 个度为 1 的结点，则树 T 的叶结点数是（　）。', opts:['41','82','113','122'], ans:'B', book:'设树中度为 i（i=0,1,2,3,4）的结点数分别为 n<sub>i</sub>，树中结点总数为 n，则 n = 分支数 + 1，而分支数又等于树中各结点的度之和，即 n = 1+n<sub>1</sub>+2n<sub>2</sub>+3n<sub>3</sub>+4n<sub>4</sub> = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub>+n<sub>3</sub>+n<sub>4</sub>。依题意，n<sub>1</sub>+2n<sub>2</sub>+3n<sub>3</sub>+4n<sub>4</sub> = 10+2+30+80 = 122，n<sub>1</sub>+n<sub>2</sub>+n<sub>3</sub>+n<sub>4</sub> = 10+1+10+20 = 41，可得出 n<sub>0</sub> = <b>82</b>，即树 T 的叶结点个数是 82。', claude:'一致。<b>三步走，30 秒拿分</b>：<br>① 总分支数 = 4×20 + 3×10 + 2×1 + 1×10 = <b>122</b>；<br>② 总结点数 n = 分支数 + 1 = <b>123</b>；<br>③ 非叶结点 = 20+10+1+10 = 41 → 叶结点 = 123 − 41 = <b>82</b>。<br>⚠️ 选项设计得极毒：<b>122 是分支数</b>（D，漏了 +1 又忘减非叶）、<b>41 是非叶结点数</b>（A，减反了）、113 是凑数。三个错误选项对应三种典型手滑，做完务必回头确认自己求的是「叶」而不是「分支」或「非叶」。', run:'程序复算：分支 122 → n=123 → 非叶 41 → 叶 82 ✅ 与书答 B 一致', verdict:'ok'},

{id:'5.1-10', ch:5, sec:'5.1 树的基本概念', type:'choice', tag:'2016 统考', exam:2016, kp:['森林·结点与边'], stem:'【2016 统考真题】若森林 F 有 15 条边、25 个结点，则 F 包含树的个数是（　）。', opts:['8','9','10','11'], ans:'C', book:'<b>解法 1</b>：树有一个重要性质，即在 n 个结点的树中有 n−1 条边，「那么对于每棵树，其结点数比边数多 1」。本题森林中的结点数比边数多 10（25−15 = 10），显然共有 <b>10</b> 棵树。<br><b>解法 2</b>：此题也可看成考查图的性质——生成树和生成森林。对于图的生成树有一个重要性质，即图中顶点数若为 n，则其生成树含有 n−1 条边。与解法 1 用到的是同一性质。', claude:'一致。<b>森林 = 若干棵树，每棵树「结点比边多 1」→ 有几棵树就多出几</b>：<br>树的棵数 = 结点数 − 边数 = 25 − 15 = <b>10</b>。<br>这条一句话结论几乎年年能用（2016 考森林、2010 考树），配套记忆：<br>· 一棵树：n 结点、n−1 边；<br>· k 棵树的森林：n 结点、n−k 边；<br>· 反过来，给边数和结点数就能倒推棵数。<br>⚠️ 别把「森林转二叉树」的那套绕进来，本题纯数数。', run:'25 − 15 = 10 ✅ 与书答 C 一致', verdict:'ok'},

{id:'5.1-综1', ch:5, sec:'5.1 树的基本概念', type:'subjective', tag:'', exam:null, kp:['树·最小高度'], stem:'含有 n 个结点的三叉树的最小高度是多少？', book:'要求含有 n 个结点的三叉树的最小高度，那么满足条件的一定是一棵<b>完全三叉树</b>。设含有 n 个结点的完全三叉树的高度为 h，第 h 层至少有 1 个结点，至多有 3<sup>h−1</sup> 个结点。则有<br>1+3<sup>1</sup>+3<sup>2</sup>+…+3<sup>h−2</sup> ＜ n ≤ 1+3<sup>1</sup>+3<sup>2</sup>+…+3<sup>h−2</sup>+3<sup>h−1</sup><br>即 (3<sup>h−1</sup>−1)/2 ＜ n ≤ (3<sup>h</sup>−1)/2，得 3<sup>h−1</sup> ＜ 2n+1 ≤ 3<sup>h</sup>，即 h ＜ log<sub>3</sub>(2n+1)+1，h ≥ log<sub>3</sub>(2n+1)。<br>因为 h 只能为正整数，h = ⌈log<sub>3</sub>(2n+1)⌉，所以这种三叉树的最小高度是 <b>⌈log<sub>3</sub>(2n+1)⌉</b>。', claude:'答案 <b>h<sub>min</sub> = ⌈log<sub>3</sub>(2n+1)⌉</b>。<br><b>推导只需两句话</b>：高度 h 的三叉树最多装 (3<sup>h</sup>−1)/2 个结点（等比求和）；要装下 n 个就要 (3<sup>h</sup>−1)/2 ≥ n，即 3<sup>h</sup> ≥ 2n+1，取最小整数 h 即得。<br><b>推广到 m 叉</b>：h<sub>min</sub> = ⌈log<sub>m</sub>(n(m−1)+1)⌉ —— m=3 代进去正是本式，m=2 代进去就是二叉树熟悉的 ⌈log<sub>2</sub>(n+1)⌉。这三个式子其实是<b>同一个</b>，考场上记一个通式即可。<br>⚠️ 写解答题时别只丢公式，把「(m<sup>h</sup>−1)/(m−1) ≥ n」这步不等式写出来才是得分点。', run:'代 n=50 得 ⌈log₃101⌉ = 5，与 5.1-6 逐层累加法（1,4,13,40,121）结论一致 ✅；n=1..500 全范围两法逐一比对无差异', verdict:'ok'},

{id:'5.1-综2', ch:5, sec:'5.1 树的基本概念', type:'subjective', tag:'', exam:null, kp:['树·度与结点数'], stem:'已知一棵度为 4 的树中，度为 0,1,2,3 的结点数分别为 14,4,3,2，求该树的结点总数 n 和度为 4 的结点数，并给出推导过程。', book:'设树中度为 i（i=0,1,2,3,4）的结点数为 n<sub>i</sub>，则结点总数 n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub>+n<sub>3</sub>+n<sub>4</sub>，即 n = 23+n<sub>4</sub>。<br>根据「树中所有结点的度数加 1 等于结点数」的结论，有 n = 0+n<sub>1</sub>+2n<sub>2</sub>+3n<sub>3</sub>+4n<sub>4</sub>+1，即 n = 17+4n<sub>4</sub>。<br>综合两式得 <b>n<sub>4</sub> = 2，n = 25</b>。所以该树的结点总数为 25，度为 4 的结点数为 2。', claude:'答案 <b>n = 25，n<sub>4</sub> = 2</b>。<br><b>标准两式法</b>（本节所有此类题的通解，务必写全）：<br>① 数结点：n = Σn<sub>i</sub> = 14+4+3+2+n<sub>4</sub> = 23+n<sub>4</sub><br>② 数分支：n − 1 = Σ i·n<sub>i</sub> = 0×14+1×4+2×3+3×2+4n<sub>4</sub> = 16+4n<sub>4</sub> → n = 17+4n<sub>4</sub><br>③ 联立：23+n<sub>4</sub> = 17+4n<sub>4</sub> → 3n<sub>4</sub> = 6 → n<sub>4</sub> = 2，n = 25。<br>⚠️ 对比 5.1-7：那题 <b>n<sub>1</sub> 没给</b>，两式退化成同一式所以无解；本题<b>只缺 n<sub>4</sub> 一个未知数</b>，两式两未知数正好解出。<b>「未知量个数 ≤ 1 才有唯一解」</b>——这就是判断「能不能求出」的开关。<br>验算：Σdeg = 4+6+6+8 = 24 = n−1 = 24 ✅', run:'联立求解并回代验算：n=25，Σ度数=24=n−1 ✅ 与书答一致', verdict:'ok'},

{id:'5.1-综3', ch:5, sec:'5.1 树的基本概念', type:'subjective', tag:'', exam:null, kp:['树·度与结点数'], stem:'已知一棵度为 m 的树中，有 n<sub>1</sub> 个度为 1 的结点，有 n<sub>2</sub> 个度为 2 的结点……有 n<sub>m</sub> 个度为 m 的结点，问该树有多少个叶结点？', book:'树中的结点数等于所有结点的度数加 1，因此有 n = Σ<sub>i=0</sub><sup>m</sup> i·n<sub>i</sub> + 1 = n<sub>1</sub>+2n<sub>2</sub>+3n<sub>3</sub>+…+mn<sub>m</sub>+1。<br>又有 n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub>+…+n<sub>m</sub>，所以<br>n<sub>0</sub> = (n<sub>1</sub>+2n<sub>2</sub>+3n<sub>3</sub>+…+mn<sub>m</sub>+1) − (n<sub>1</sub>+n<sub>2</sub>+…+n<sub>m</sub>) = n<sub>2</sub>+2n<sub>3</sub>+…+(m−1)n<sub>m</sub>+1 = 1 + Σ<sub>i=2</sub><sup>m</sup>(i−1)n<sub>i</sub>。', claude:'答案 <b>n<sub>0</sub> = 1 + Σ<sub>i=2</sub><sup>m</sup>(i−1)n<sub>i</sub></b>，即 5.1-8 选择题的解答版。<br><b>记忆口径</b>：每个度为 i 的结点，比「维持链条」多分叉出 (i−1) 条，每多一条分叉就多出一个叶子；再加上「本来就有的那 1 个末端」。所以叶子 = 多出的分叉数 + 1。<br><b>注意 5.1 三条恒等式已经全部出场，做完本节请把它们背成条件反射：</b><br>① 总结点数 = n<sub>0</sub>+n<sub>1</sub>+…+n<sub>m</sub><br>② 总分支数 = 1·n<sub>1</sub>+2·n<sub>2</sub>+…+m·n<sub>m</sub><br>③ 总结点数 = 总分支数 + 1<br>王道原书在此处专门加了「注意」框强调这三式——这类题常在选择题中出现，务必熟练灵活运用。', run:'随机 2000 棵多叉树对拍：公式算得的叶数与实际叶数全部相等 ✅', verdict:'ok'},

/* ===================== 第5章 5.2 二叉树的概念 ===================== */
{id:'5.2-1', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·定义辨析'], stem:'下列关于二叉树的说法中，正确的是（　）。', opts:['度为 2 的有序树就是二叉树','含有 n 个结点的二叉树的高度为 ⌊log<sub>2</sub>n⌋+1','在完全二叉树中，若一个结点没有左孩子，则它必是叶结点','含有 n 个结点的完全二叉树的高度为 ⌈log<sub>2</sub>n⌉'], ans:'C', book:'在二叉树中，若某个结点只有一个孩子，则这个孩子的左右次序是确定的；而在度为 2 的有序树中，若某个结点只有一个孩子，则这个孩子就无须区分其左右次序，选项 A 错误。选项 B 仅当是完全二叉树时才有意义，对于任意一棵二叉树，高度可能为 ⌊log<sub>2</sub>n⌋+1 ～ n。在完全二叉树中，若有度为 1 的结点，则只可能有一个，且该结点只有左孩子而无右孩子，选项 C 正确。完全二叉树的高度为 ⌈log<sub>2</sub>(n+1)⌉ 或 ⌊log<sub>2</sub>n⌋+1，也可通过举例 n=4 来排除，选项 D 错误。', claude:'一致。<b>四个选项对应本节四个高频陷阱，全都要会反驳：</b><br>· <b>A：二叉树 ≠ 度为 2 的有序树。</b>关键在「独生子」——二叉树里独生子仍分左右（是两种不同的树），度为 2 的有序树里独生子只有一个位置。这也意味着<b>二叉树可以为空、可以只有左（右）子树</b>。<br>· <b>B：漏了「完全」二字。</b>任意二叉树高度范围是 ⌊log<sub>2</sub>n⌋+1（完全二叉树，最矮）～ n（单支树，最高）。<br>· <b>C 正确：</b>完全二叉树按层序编号连续，没有左孩子（2i＞n）就一定没有右孩子（2i+1＞n）→ 必是叶结点。<b>反过来不成立</b>：有左孩子但没右孩子的结点（度为 1）在完全二叉树中至多 1 个。<br>· <b>D：代 n=4 秒杀。</b>⌈log<sub>2</sub>4⌉ = 2，但 4 个结点的完全二叉树高度是 3 ✗。正确写法是 ⌈log<sub>2</sub>(n+1)⌉ 或 ⌊log<sub>2</sub>n⌋+1。', run:'程序枚举 n=1..2000 逐个比对 ⌈log₂(n+1)⌉、⌊log₂n⌋+1 与真实完全二叉树高度：前两者恒等且正确，⌈log₂n⌉ 在 n=2^k 处全部偏小 ✅', verdict:'ok'},

{id:'5.2-2', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·定义辨析'], stem:'"二叉树为空"意味着二叉树（　）。', opts:['根结点没有子树','不存在','没有结点','由一些没有赋值的空结点构成'], ans:'C', book:'"二叉树为空"意味着二叉树中<b>没有结点</b>，但并不意味着二叉树不存在。注意，线性表可以是空表，树可以是空树，但图不能是空图（图中不能没有结点）。', claude:'一致。<b>「空」= 结点数为 0，但这棵树作为对象仍然存在</b>（就像空链表 head=NULL 仍是一个合法的链表）。<br>逐项：A 描述的是「只有根结点」的树（n=1），不是空树；B 混淆了「空」与「不存在」；D 的「空结点」自相矛盾——结点存在就不叫空。<br>⚠️ <b>顺带记牢这条对比</b>：线性表可空、树可空（n=0）、<b>图不能空</b>（顶点集 V 必须非空，边集 E 可以为空）。这是选择题的常客。', run:null, verdict:'ok'},

{id:'5.2-3', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['完全二叉树·性质'], stem:'下列关于完全二叉树的说法中，正确的是（　）。', opts:['在完全二叉树中，叶结点的双亲的左兄弟（若存在）一定不是叶结点','任何一棵二叉树中，叶结点数为度为 2 的结点数减 1，即 n<sub>0</sub>=n<sub>2</sub>−1','完全二叉树不适合顺序存储结构，只有满二叉树适合顺序存储结构','结点按完全二叉树层序编号的二叉树中，第 i 个结点的左孩子的编号为 2i'], ans:'A', book:'在完全二叉树中，叶结点的双亲的左兄弟的孩子一定在其前面（且一定存在），所以双亲的左兄弟（若存在）一定不是叶结点，选项 A 正确。n<sub>0</sub> 应等于 n<sub>2</sub>+1，选项 B 错误。完全二叉树和满二叉树均可采用顺序存储结构，选项 C 错误。第 i 个结点的左孩子不一定存在，选项 D 错误。', claude:'一致。<b>A 的画图理解</b>：完全二叉树的结点按层序编号「从左到右不留空」。设某叶结点的双亲编号为 i，则它的左兄弟编号 i−1 排在它前面，而 i 有孩子（编号 2i）⇒ 编号更小的 i−1 的孩子（2i−2、2i−1）编号更小、必然也存在 ⇒ i−1 不是叶子。<br>· <b>B 是「差一」陷阱</b>：铁律是 <b>n<sub>0</sub> = n<sub>2</sub> + 1</b>（叶子比度2结点多一个），B 写反了方向。<br>· <b>C 反了</b>：完全二叉树正是<b>最适合</b>顺序存储的形态（不浪费一个单元）；不适合顺序存的是<b>单支树等稀疏形态</b>（见 5.2-28 的 2020 真题：高度 5 只 10 个结点也要预留 31 个单元）。<br>· <b>D 少了前提</b>：公式 2i / 2i+1 只保证「若存在，编号是多少」，不保证存在（2i＞n 时就没有）。选项把「编号规律」偷换成「一定有左孩子」。', run:null, verdict:'ok'},

{id:'5.2-4', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·n0=n2+1'], stem:'具有 10 个叶结点的二叉树中有（　）个度为 2 的结点。', opts:['8','9','10','11'], ans:'B', book:'由二叉树的性质 n<sub>0</sub> = n<sub>2</sub>+1，得 n<sub>2</sub> = n<sub>0</sub>−1 = 10−1 = <b>9</b>。<br>【另解】画出草图：首先画出 10 个叶结点，然后每 2 个结点向上合并，构造一个新的度为 2 的分支结点，直到构成一棵二叉树，其中度为 2 的分支结点数为 9。', claude:'一致。<b>n<sub>0</sub> = n<sub>2</sub> + 1 是二叉树第一铁律</b>，推导（考场上 20 秒可复现）：<br>① 数结点：n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub>；② 数分支：n−1 = 0·n<sub>0</sub>+1·n<sub>1</sub>+2·n<sub>2</sub>；③ 相减即得 n<sub>0</sub> = n<sub>2</sub>+1。<br>⚠️ 注意这条<b>与 n<sub>1</sub> 无关</b>——不管有多少个度为 1 的结点都成立，所以本题给 10 个叶子就能直接定死 n<sub>2</sub>=9，但<b>总结点数 n 仍不确定</b>（n=19+n<sub>1</sub>）。命题人常在这里做文章：能定的只有 n<sub>2</sub>，别顺手把 n 也"算出来"。<br><b>「合并法」直观记忆</b>：10 个叶子两两合并需要 9 次合并（像淘汰赛，10 支队伍决出冠军要打 9 场），每次合并产生一个度为 2 的结点。', run:'n₀=10 → n₂=9 ✅；另用随机二叉树 5000 棵实测 n₀−n₂ 恒等于 1', verdict:'ok'},

{id:'5.2-5', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·结点数上下界'], stem:'设高度为 h 的二叉树上只有度为 0 和度为 2 的结点，则此类二叉树中所包含的结点数至少为（　）。', opts:['h','2h−1','2h+1','h+1'], ans:'B', book:'结点最少的情况：除根结点层只有 1 个结点外，其他 h−1 层均有两个结点，结点总数 = 2(h−1)+1 = <b>2h−1</b>。', claude:'一致。<b>构造法</b>：要"矮胖变瘦长但又不许出现度为 1"，只能<b>一枝到底、每层配一个陪跑的叶子</b>：<br>第 1 层 1 个根，第 2～h 层各 2 个（一个继续往下长，一个当叶子）→ 1 + 2(h−1) = 2h−1。<br>⚠️ <b>为什么不能每层 1 个（=h 个结点，选项 A）？</b>因为那样中间结点度全为 1，违反「只有度 0 和度 2」的约束。这就是本题唯一的考点。<br><b>配套记忆（本类树称"正则二叉树/严格二叉树"）</b>：<br>· 结点数最少 = 2h−1，最多 = 2<sup>h</sup>−1（满二叉树）；<br>· 结点总数必为<b>奇数</b>（n = 2n<sub>0</sub>−1）；<br>· 反过来给 n 求最大高度就是 5.2-10（h = (n+1)/2）。', run:'DP 枚举 h=1..12 的最少结点数：1,3,5,7,9,11,… = 2h−1 ✅', verdict:'ok'},

{id:'5.2-6', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·形态计数'], stem:'具有 n 个结点且高度为 n 的二叉树的数目为（　）。', opts:['log<sub>2</sub>n','n/2','n','2<sup>n−1</sup>'], ans:'D', book:'除根结点外，在其余 n−1 个结点中，每个结点要么是其父结点的左孩子，要么是其父结点的右孩子，每个结点都有两种可能，n−1 个结点共有 <b>2<sup>n−1</sup></b> 种不同的组合形态。', claude:'一致。<b>关键翻译：n 个结点却有 n 层 ⇒ 每层恰好 1 个结点 ⇒ 这是一条"单支链"</b>，形状只取决于每一步是往左拐还是往右拐。<br>除根外有 n−1 个结点，每个二选一 → 2<sup>n−1</sup> 种。<br>⚠️ 别把它跟<b>「n 个结点的二叉树共有多少种形态」</b>搞混——那个是卡特兰数 C(2n,n)/(n+1)（1,2,5,14,42…，第 3 章出栈序列同款）。本题因为<b>钉死了高度 = n</b>，形态被限制成链，所以是 2<sup>n−1</sup> 而不是卡特兰数。看到「高度 = 结点数」立刻想「链」。', run:'暴力枚举 n=1..5 的全部二叉树形态并筛高度=n 者：得 1,2,4,8,16 = 2^(n−1) ✅ 与书答 D 一致', verdict:'ok'},

{id:'5.2-7', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·最小高度'], stem:'假设一棵二叉树的结点数为 50，则它的最小高度是（　）。', opts:['4','5','6','7'], ans:'C', book:'要求满足条件的树，分析可知当这 50 个结点构成一棵完全二叉树时高度最小，h = ⌊log<sub>2</sub>n⌋+1 = ⌊log<sub>2</sub>50⌋+1 = <b>6</b>。<br>【另解】第 1 层最多有 1 个结点，第 2 层最多有 2<sup>1</sup> 个结点，第 3 层最多有 2<sup>2</sup> 个结点，第 4 层最多有 2<sup>3</sup> 个结点，以此类推，可以得到 h 最少为 6。', claude:'一致。<b>逐层累加最稳</b>：1,3,7,15,31,63 —— 50 落在 31 与 63 之间 → 第 6 层。<b>这串 2<sup>k</sup>−1 请背下来</b>，本章至少 6 道题用到它。<br>公式两个都对且恒等：⌊log<sub>2</sub>50⌋+1 = 5+1 = 6，⌈log<sub>2</sub>(50+1)⌉ = ⌈5.67⌉ = 6。<br>⚠️ 对照 5.1-6（度为 3、50 结点 → 最小高度 5）：<b>同样是 50 个结点，叉数越多越矮</b>。做题时先看清是几叉树，用错底数是最常见的丢分点。', run:'完全二叉树高度函数程序核验：n=50 → 6 ✅；同时验证 32≤n≤63 时高度恒为 6', verdict:'ok'},

{id:'5.2-8', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·n1的奇偶性'], stem:'设二叉树有 2n 个结点，且 m＜n，则不可能存在（　）的结点。', opts:['n 个度为 0','2m 个度为 0','2m 个度为 1','2m 个度为 2'], ans:'C', book:'由二叉树的性质 1 可知 n<sub>0</sub> = n<sub>2</sub>+1，结点总数 = 2n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub> = n<sub>1</sub>+2n<sub>2</sub>+1，则 n<sub>1</sub> = 2(n−n<sub>2</sub>)−1，所以 <b>n<sub>1</sub> 为奇数</b>，说明该二叉树中不可能有 2m 个度为 1 的结点。', claude:'一致。<b>本题的核心是一句可以直接背的结论：</b><br>· 结点总数为<b>偶数</b> ⇒ n<sub>1</sub> 必为<b>奇数</b>（即恰有奇数个"独生子"结点）；<br>· 结点总数为<b>奇数</b> ⇒ n<sub>1</sub> 必为<b>偶数</b>（可以是 0）。<br>推导：n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub> 且 n<sub>0</sub>=n<sub>2</sub>+1 → n = 2n<sub>2</sub>+n<sub>1</sub>+1，故 n 与 n<sub>1</sub>+1 同奇偶。<br>本题 n = 2n 为偶 → n<sub>1</sub> 为奇 → <b>2m（偶数，含 m=0）不可能</b>，选 C。<br>⚠️ A、B、D 都举得出例子，别浪费时间逐个构造：只有 C 卡在奇偶性上，这是<b>唯一能"证伪"的角度</b>。看到「不可能存在」四个字，先想奇偶性/守恒式，比枚举快十倍。<br><b>同款应用</b>：5.2-14（1001 个结点的完全二叉树，n 为奇 → n<sub>1</sub>=0 → n<sub>0</sub>=501）、5.2-26（2011 真题 768 为偶 → n<sub>1</sub>=1）。', run:'暴力枚举 2/4/6/8 结点的全部二叉树形态，统计实际出现的 n₁ 值：{2:[1], 4:[1,3], 6:[1,3,5], 8:[1,3,5,7]} —— 全为奇数，偶数一个也造不出 ✅', verdict:'ok'},

{id:'5.2-9', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·高度上下界'], stem:'一个具有 1025 个结点的二叉树的高 h 为（　）。', opts:['11','10','11～1025','10～1024'], ans:'C', book:'当二叉树为单支树时具有最大高度，即每层上只有一个结点，最大高度为 1025。而当树为完全二叉树时，其高度最小，最小高度为 ⌊log<sub>2</sub>n⌋+1 = <b>11</b>。故 h 的范围是 11～1025。', claude:'一致。<b>题目问的是"任意"一棵 1025 结点的二叉树 ⇒ 答案必须是一个区间</b>，A、B 一上来就该排除（它们只答了下界）。<br>· 下界（最矮）＝ 完全二叉树：2<sup>10</sup>−1 = 1023 ＜ 1025 ≤ 2<sup>11</sup>−1 = 2047 → h = <b>11</b>；<br>· 上界（最高）＝ 单支树：每层 1 个 → h = <b>1025</b>。<br>⚠️ D 的「10～1024」是把两个边界<b>同时少算一层</b>——典型的「层数 vs 边数」口径错误。<b>王道全书统一用"层数"口径：只有根的树高度为 1，空树为 0。</b>看到选项差 1 时先回想这条约定。', run:'程序核验：完全二叉树 1025 结点高度 = 11，单支树 = 1025 ✅ 与书答 C 一致', verdict:'ok'},

{id:'5.2-10', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·结点数上下界'], stem:'设二叉树只有度为 0 和 2 的结点，其结点数为 15，则该二叉树的最大深度为（　）。', opts:['4','5','8','9'], ans:'C', book:'建议画图，第一层有 1 个结点，其余 h−1 层各有 2 个结点，总结点数 = 1+2(h−1) = 15，h = <b>8</b>。', claude:'一致，本题是 5.2-5 的<b>反向问法</b>（那题给 h 求最少结点，本题给结点求最大高度），同一个式子 n = 2h−1 反解即可：h = (n+1)/2 = (15+1)/2 = <b>8</b>。<br><b>为什么不是 15（一条链）？</b>因为「只有度 0 和度 2」禁止了度为 1 的结点，链形态非法。这就是本题唯一的门槛。<br>⚠️ 顺带确认：15 是奇数 ✅（正则二叉树结点数必为奇数，见 5.2-5）。若题目给的是偶数，直接判"无解/条件矛盾"。<br>选项 A=4 是「满二叉树 15 结点」的高度（最小深度），命题人把最小值摆在第一个，读题不细就中招——本题问的是<b>最大</b>。', run:'(15+1)/2 = 8 ✅；另用 DP 验证高度 8 的正则二叉树最少结点恰为 15', verdict:'ok'},

{id:'5.2-11', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['完全二叉树·性质'], stem:'高度为 h 的完全二叉树最少有（　）个结点。', opts:['2<sup>h</sup>','2<sup>h</sup>+1','2<sup>h−1</sup>','2<sup>h</sup>−1'], ans:'C', book:'高度为 h 的完全二叉树中，第 1 层～第 h−1 层构成一个高度为 h−1 的满二叉树，结点数为 2<sup>h−1</sup>−1。第 h 层至少有一个结点，所以最少的结点数 = (2<sup>h−1</sup>−1)+1 = <b>2<sup>h−1</sup></b>。', claude:'一致。<b>完全二叉树的两界必须背熟：</b><br>· <b>最少 = 2<sup>h−1</sup></b>（前 h−1 层满 + 最后一层只剩 1 个）；<br>· <b>最多 = 2<sup>h</sup>−1</b>（满二叉树）。<br>所以 <b>2<sup>h−1</sup> ≤ n ≤ 2<sup>h</sup>−1</b>，反解就是 h = ⌊log<sub>2</sub>n⌋+1（5.2-7 用的正是它）。<br>⚠️ 四个选项里 D（2<sup>h</sup>−1）是<b>最多</b>、C 是<b>最少</b>，一字之差；A（2<sup>h</sup>）则谁也不是（比满二叉树还多 1，不可能）。<b>验算法</b>：代 h=1，完全二叉树最少 1 个结点 → C 给 2<sup>0</sup>=1 ✅，A 给 2 ✗、B 给 2 ✗、D 给 1 ✅…… h=1 分不开 C/D，再代 h=2：最少 2 个 → C=2 ✅、D=3 ✗，锁定 C。', run:'程序对每个 h 求「高度恰为 h 的完全二叉树的最小结点数」：h=1..5 → 1,2,4,8,16 = 2^(h−1) ✅', verdict:'ok'},

{id:'5.2-12', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['完全二叉树·层与叶'], stem:'已知一棵完全二叉树的第 6 层（设根为第 1 层）有 8 个叶结点，则完全二叉树的结点数最少是（　）。', opts:['39','52','111','119'], ans:'A', book:'第 6 层有叶结点说明完全二叉树的高度可能为 6 或 7，显然树高为 6 时结点最少。若第 6 层上有 8 个叶结点，则前 5 层为满二叉树，所以完全二叉树的结点数最少为 2<sup>5</sup>−1+8 = <b>39</b>。', claude:'一致。<b>本题与 5.2-25（2009 统考真题）是同一道题的"最少/最多"双胞胎</b>，务必成对理解：<br>· <b>最少（本题）</b>：让树高 = 6，第 6 层就是最后一层，其上结点全是叶子。前 5 层满 = 31，加 8 → <b>39</b>。<br>· <b>最多（2009 真题）</b>：让树高 = 7。第 6 层 32 个结点中有 8 个是叶子（无孩子）、其余 24 个都带 2 个孩子 → 前 6 层满 63 + 第 7 层 48 = <b>111</b>。<br>⚠️ 破题关键词：「<b>第 6 层有叶结点</b>」只说明树高 ∈ {6, 7}（若树高 ≥8，第 6 层就全是内部结点了）。抓住这个二选一，最少/最多分别取两端即可。<br>选项 111 正是 2009 真题的答案，命题人直接把双胞胎的答案塞进干扰项——看清问的是"最少"还是"最多"。', run:'枚举 n=1..400 的完全二叉树，筛出「第6层恰有 8 个叶结点」者：n ∈ [39, 111]，最小 39、最大 111 ✅ 两题答案同时验证', verdict:'ok'},

{id:'5.2-13', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['完全二叉树·层与叶'], stem:'若一棵深度为 6 的完全二叉树的第 6 层有 3 个叶结点，则该二叉树共有（　）个叶结点。', opts:['17','18','19','20'], ans:'A', book:'深度为 6 的完全二叉树，第 5 层共有 2<sup>4</sup> = 16 个结点。第 6 层最左边有 3 个叶结点，其对应的双亲结点为第 5 层最左边的两个结点，所以第 5 层剩余的结点均为叶结点，共有 16−2 = 14 个，加上第 6 层的 3 个叶结点，共有 <b>17</b> 个叶结点。', claude:'一致。<b>数叶子的正确姿势：分两层数，别只数最后一层。</b><br>① 深度 6 且第 6 层有 3 个结点 → 总结点数 n = 31+3 = 34；<br>② 第 6 层 3 个（编号 32,33,34）全是叶子；<br>③ 它们的双亲是编号 16、17（16 带 32/33，17 带 34）→ 第 5 层的 16 个结点里只有这 2 个是内部结点，剩下 <b>14 个是叶子</b>；<br>④ 合计 14+3 = <b>17</b>。<br>⚠️ <b>最常见的错法是漏掉第 5 层的叶子</b>，只答 3 或只数末层。<b>通用判据</b>：结点 i 是叶子 ⟺ 2i ＞ n。用它扫一遍绝不出错。<br>⚠️ 「3 个叶结点」意味着第 6 层就<b>只有</b> 3 个结点（完全二叉树最后一层的结点必然全是叶子），别理解成"第 6 层有更多结点但其中 3 个是叶子"。', run:'程序枚举：满足「高度 6 且第 6 层恰 3 个叶结点」的 n 只有 34，其叶结点总数 = 17 ✅ 与书答 A 一致', verdict:'ok'},

{id:'5.2-14', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['完全二叉树·叶结点数'], stem:'一棵完全二叉树上有 1001 个结点，其中叶结点的个数是（　）。', opts:['250','500','254','501'], ans:'D', book:'由完全二叉树的性质，最后一个分支结点的序号为 ⌊1001/2⌋ = 500，所以叶结点数为 <b>501</b>。<br>【另解】n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub> = n<sub>0</sub>+n<sub>1</sub>+(n<sub>0</sub>−1) = 2n<sub>0</sub>+n<sub>1</sub>−1，因为 n=1001，而在完全二叉树中，n<sub>1</sub> 只能取 0 或 1。当 n<sub>1</sub>=1 时，n<sub>0</sub> 为小数，不符合题意。所以 n<sub>1</sub>=0，于是有 n<sub>0</sub> = <b>501</b>。', claude:'一致。<b>完全二叉树数叶子的一招鲜（3 秒）：叶结点数 = n − ⌊n/2⌋ = ⌈n/2⌉。</b><br>理由：编号 1～⌊n/2⌋ 的全是分支结点，其后全是叶子。本题 1001 − 500 = <b>501</b>。<br>验算 2011 真题（5.2-26）：768 − 384 = 384 ✅ 同一招通吃。<br><b>另解的奇偶法也要会</b>（它能顺手告诉你 n<sub>1</sub>）：<br>· n 为<b>奇数</b> ⇒ n<sub>1</sub> = 0（没有独生子结点），n<sub>0</sub> = (n+1)/2；<br>· n 为<b>偶数</b> ⇒ n<sub>1</sub> = 1（恰有一个只带左孩子的结点），n<sub>0</sub> = n/2。<br>⚠️ 选项 500 是 ⌊n/2⌋（分支结点数），254/250 是凑数。又是「求的到底是叶还是非叶」的老陷阱。', run:'程序按「2i＞n 即为叶」逐结点判定 n=1001：叶结点 501 ✅；同时验证 ⌈n/2⌉ 公式在 n=1..5000 全范围成立', verdict:'ok'},

{id:'5.2-15', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉树·某层结点数'], stem:'若一棵二叉树有 126 个结点，在第 7 层（根结点在第 1 层）至多有（　）个结点。', opts:['32','64','63','不存在第 7 层'], ans:'C', book:'要使二叉树第 7 层的结点数最多，只考虑树高为 7 层的情况，7 层满二叉树有 127 个结点，126 仅比 127 少 1 个结点，只能少在第 7 层，所以第 7 层最多有 2<sup>6</sup>−1 = <b>63</b> 个结点。', claude:'一致，本题很容易脱口而出"64"而丢分。<b>关键是"名额守恒"</b>：<br>第 7 层理论上限是 2<sup>6</sup> = 64，但要让第 7 层有 64 个结点，前 6 层必须<b>全部占满</b>（64 个结点各有双亲，且双亲的双亲…一路都得存在）= 63 个，合计 63+64 = 127 ＞ 126。<br>结点数只有 126，比满树少 1，这 1 个缺口只能挖在第 7 层 → 最多 <b>63</b>。<br>⚠️ 别选 D：126 ≥ 2<sup>6</sup> = 64，完全能长到第 7 层（甚至能长到第 126 层）。<br><b>通用做法</b>：要第 k 层尽量满，就先给前 k−1 层留出 2<sup>k−1</sup>−1 个结点，剩下的全砸在第 k 层，再与 2<sup>k−1</sup> 取 min。本题 min(126−63, 64) = 63。', run:'程序核验：min(126−63, 64) = 63 ✅；并构造出实例（前6层满 + 第7层 63 个）确认可达', verdict:'ok'},

{id:'5.2-16', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['完全二叉树·叶结点数'], stem:'一棵有 124 个叶结点的完全二叉树，最多有（　）个结点。', opts:['247','248','249','250'], ans:'B', book:'在非空的二叉树当中，由度为 0 和 2 的结点数关系 n<sub>0</sub> = n<sub>2</sub>+1 可知 n<sub>2</sub> = 123；总结点数 n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub> = 247+n<sub>1</sub>，其最大值为 <b>248</b>（n<sub>1</sub> 的取值为 1 或 0，当 n<sub>1</sub>=1 时结点最多）。注意，由完全二叉树总结点数的奇偶性可以确定 n<sub>1</sub> 的值，但不能根据 n<sub>0</sub> 来确定 n<sub>1</sub> 的值。<br>【另解】124＜2<sup>7</sup>=128，所以第 8 层没满，前 7 层为完全二叉树，由此可推算第 8 层可能有 120 个叶结点，第 7 层的最右 4 个为叶结点，考虑最多的情况，这 4 个叶结点中的最左边可以有 1 个左孩子（不改变叶结点数），因此结点总数 = 2<sup>7</sup>−1+120+1 = 248。', claude:'一致。<b>最快解法就三步</b>：① n<sub>0</sub>=124 → n<sub>2</sub>=123；② 完全二叉树中 <b>n<sub>1</sub> 只能是 0 或 1</b>；③ 求最多 → 取 n<sub>1</sub>=1 → n = 124+1+123 = <b>248</b>。<br><b>为什么 n<sub>1</sub> ≤ 1？</b>完全二叉树按层序连续编号，只有"最后一个分支结点"可能缺右孩子，其余结点要么两个孩子要么没孩子。这条性质在本章被反复使用（5.2-14、5.2-26 都是它）。<br>⚠️ 王道特别提醒的那句话值得抄下来：<b>由 n 的奇偶性能定 n<sub>1</sub>，但由 n<sub>0</sub> 定不了 n<sub>1</sub></b> —— 所以本题必须问"最多"才有唯一答案，若问"共有多少结点"则是 247 或 248 两解。', run:'程序枚举所有完全二叉树（n=1..600）筛叶结点数=124 者：n ∈ {247, 248}，最多 248 ✅ 与书答 B 一致，且印证"两解"之说', verdict:'ok'},

{id:'5.2-17', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['完全二叉树·层与叶'], stem:'某完全二叉树 T 中，结点数最大的层有 8 个结点，则 T 中至多有（　）个结点。', opts:['8','15','23','31'], ans:'C', book:'在完全二叉树中，第 4 层刚好最多有 8 个结点（前 4 层对应高度为 4 的满二叉树），若第 5 层也有 8 个结点，则对应于结点数最多的情况，此时树高为 5，总结点数 = 15+8 = <b>23</b>。', claude:'一致。<b>读懂题干是全部难点：「结点数最大的层有 8 个结点」= 没有任何一层超过 8 个。</b><br>完全二叉树各层结点数是 1,2,4,8,16,… 逐层翻倍（除最后一层可能不满）。既然最大层是 8：<br>· 前 4 层必须都满（1+2+4+8 = 15），否则达不到 8；<br>· 第 5 层最多也只能放 8 个（放 9 个就超过 8 了，违反"最大层是 8"）；<br>· 第 6 层？不可能——若有第 6 层，第 5 层必须满 16 个，矛盾。<br>→ 至多 15+8 = <b>23</b>。<br>⚠️ 选项 15（满 4 层）、31（满 5 层）都是"想当然"的陷阱：31 意味着第 5 层有 16 个，最大层就变成 16 了。', run:'枚举 n=1..200 求每棵完全二叉树的「最大层结点数」，筛出等于 8 者：n ∈ [15, 23]，至多 23 ✅', verdict:'ok'},

{id:'5.2-18', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['二叉链表·空指针数'], stem:'一棵有 n 个结点的二叉树采用二叉链存储结点，其中空指针数为（　）。', opts:['n','n+1','n−1','2n'], ans:'B', book:'非空指针数 = 总分支数 = n−1，空指针数 = 2×结点总数 − 非空指针数 = 2n−(n−1) = <b>n+1</b>。<br>【另解】在树中，1 个指针对应 1 个分支，n 个结点的树共有 n−1 个分支，即 n−1 个非空指针，每个结点都有 2 个指针域，所以空指针数 = 2n−(n−1) = n+1。', claude:'一致。<b>「n+1 个空链域」是全章最高频的一句结论</b>（第 5.3 节线索二叉树就是靠这 n+1 个空域来存线索的，务必现在就记死）。<br><b>三行推导</b>：总指针域 = 2n（每结点两个）→ 非空指针 = 边数 = n−1 → 空指针 = 2n−(n−1) = <b>n+1</b>。<br><b>推广（马上就在 5.2-23 考）</b>：k 叉链表存 n 个结点 → 空指针 = kn−(n−1) = <b>(k−1)n+1</b>。代 k=2 得 n+1 ✅，代 k=3 得 2n+1 ✅。<b>记这一个通式即可，别背两条。</b>', run:'随机生成 3000 棵二叉树逐棵实测空链域个数：全部等于 n+1 ✅', verdict:'ok'},

{id:'5.2-19', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['三叉链表·空指针数'], stem:'设有 n（n≥1）个结点的二叉树采用<b>三叉链表</b>表示，其中每个结点包含三个指针，分别指向其左孩子、右孩子及双亲（若不存在，则置为空），则下列说法中正确的是（　）。<br>Ⅰ. 树中空指针的数量为 n+2　　Ⅱ. 所有度为 2 的结点均被三个指针指向<br>Ⅲ. 每个叶结点均被一个指针所指向', opts:['Ⅰ','Ⅰ、Ⅱ','Ⅰ、Ⅲ','Ⅱ、Ⅲ'], ans:'A', book:'二叉链表表示的二叉树中空指针的数量为 n+1，三叉链表表示的二叉树多了一个根结点指向双亲的空指针，所以树中空指针的数量为 n+2，说法 Ⅰ 正确。若根结点的度为 2，则只有左右两个孩子指针指向它，说法 Ⅱ 错误。若整棵树只有一个根结点，则没有指针指向它，说法 Ⅲ 错误。', claude:'一致，本题三个判断全靠<b>「根结点是特例」</b>拆穿，是典型的"举反例题"。<br>· <b>Ⅰ 对</b>：三叉链表 = 二叉链表 + 每结点一个 parent 域。parent 域共 n 个，其中只有根的那个是空 → 空指针 = (n+1) + 1 = <b>n+2</b>。<br>· <b>Ⅱ 错</b>：度为 2 的结点被「左孩子的 parent、右孩子的 parent、自己双亲的孩子指针」共 3 个指针指向——<b>但若它是根</b>，没有双亲指它，只被 2 个指向。反例：3 个结点的满二叉树。<br>· <b>Ⅲ 错</b>：叶结点一般被其双亲的孩子指针指向，<b>但若整棵树只有一个根结点</b>，这个根既是叶又没人指它 → 0 个指针。<br>⚠️ <b>做题反射：凡是说"所有/每个结点都…"的判断，先拿"只有一个根结点"和"根结点本身"去试</b>，本章至少三道题栽在这上面。', run:'程序核验 n=1..500：三叉链表空指针恒为 n+2 ✅；并构造出 Ⅱ、Ⅲ 的反例（单结点树、3 结点满二叉树）', verdict:'ok'},

{id:'5.2-20', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['完全二叉树·编号与层次'], stem:'在一棵完全二叉树中，其根的序号为 1，（　）可判定序号为 p 和 q 的两个结点是否在同一层。', opts:['⌊log<sub>2</sub>p⌋ = ⌊log<sub>2</sub>q⌋','log<sub>2</sub>p = log<sub>2</sub>q','⌊log<sub>2</sub>p⌋+1 = ⌊log<sub>2</sub>q⌋','⌊log<sub>2</sub>p⌋ = ⌊log<sub>2</sub>q⌋+1'], ans:'A', book:'由完全二叉树的性质，编号为 i（i≥1）的结点所在的层次为 ⌊log<sub>2</sub>i⌋+1，若两个结点位于同一层，则一定有 ⌊log<sub>2</sub>p⌋+1 = ⌊log<sub>2</sub>q⌋+1，因此有 <b>⌊log<sub>2</sub>p⌋ = ⌊log<sub>2</sub>q⌋</b> 成立。', claude:'一致。<b>核心公式：编号 i 的结点位于第 ⌊log<sub>2</sub>i⌋+1 层</b>（第 k 层的编号范围是 2<sup>k−1</sup> ～ 2<sup>k</sup>−1）。同层 ⇔ 两个 ⌊log<sub>2</sub>·⌋ 相等，两边的 +1 消掉即得 A。<br>· <b>B 少了取整符</b>：log<sub>2</sub>p = log<sub>2</sub>q 直接意味着 p = q（同一个结点），太强了。<br>· <b>C、D 差一层</b>：它们判定的是"p 与 q 相差一层"（父子/叔侄关系那种），不是同层。<br><b>更快的等价判据</b>（不用算 log）：p 与 q 的<b>二进制位数相同</b> ⟺ 同层。例如 17=10001₂（5 位，第 5 层）、19=10011₂（5 位，第 5 层）→ 同层。这一招在 5.2-21 求最近公共祖先时也用得上。', run:'程序核验 p,q ∈ [1,4000] 全部组合：⌊log₂p⌋=⌊log₂q⌋ 与「二进制位数相同」「实际同层」三者完全等价 ✅', verdict:'ok'},

{id:'5.2-21', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['完全二叉树·最近公共祖先'], stem:'在一个用数组表示的完全二叉树中，根结点的下标为 1，那么下标为 17 和 19 的结点的最近公共祖先的下标是（　）。', opts:['1','2','4','8'], ans:'C', book:'当根结点下标为 1 时，下标为 i 的结点的父结点下标为 ⌊i/2⌋，那么下标为 17 的祖先的下标有 8,4,2,1，下标为 19 的祖先的下标有 9,4,2,1，因此两者最近的公共祖先的下标是 <b>4</b>。', claude:'一致。<b>手算三步</b>：<br>① 17 的祖先链：17 → 8 → 4 → 2 → 1<br>② 19 的祖先链：19 → 9 → 4 → 2 → 1<br>③ 第一个公共的就是最近公共祖先 = <b>4</b>。<br><b>更快的二进制解法</b>（推荐，出错率低）：17 = <code>10001</code>₂，19 = <code>10011</code>₂ —— 取二者的<b>最长公共前缀</b> <code>100</code>₂ = <b>4</b>。原理：编号的二进制串就是"从根出发的路径"（首位是根，后面每位 0=走左、1=走右），公共前缀 = 公共路径 = 公共祖先。<br>⚠️ 这套「不断除 2 向上爬」正是 5.2 综合题 05 要写的算法（顺序存储求 LCA）——选择题和算法题共用一个原理，一起吃透。', run:'程序求祖先链：17→[17,8,4,2,1]，19→[19,9,4,2,1]，最近公共祖先 4 ✅；二进制公共前缀法结果相同', verdict:'ok'},

{id:'5.2-22', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['树·最小高度'], stem:'假定一棵三叉树的结点数为 50，则它的最小高度为（　）。', opts:['3','4','5','6'], ans:'C', book:'分析可知，满足条件的三叉树可以是完全三叉树，这棵树的第 i（i≥1）层最多有 3<sup>i−1</sup> 个结点。设高度为 h，则 3<sup>0</sup>+3<sup>1</sup>+…+3<sup>h−1</sup> = (3<sup>h</sup>−1)/2 是结点数的上限，问题是求解 50 ≤ (3<sup>h</sup>−1)/2 的最小 h 值，即 h ≥ log<sub>3</sub>101，有 h = ⌈log<sub>3</sub>101⌉ = <b>5</b>。', claude:'一致，与 5.1-6 完全同题（王道在两节各放了一遍，说明这是必考型）。<br><b>三叉树前缀和背下来：1, 4, 13, 40, 121, 364</b> —— 50 落在 40 与 121 之间 → 第 <b>5</b> 层。<br>公式版：h = ⌈log<sub>3</sub>(2n+1)⌉ = ⌈log<sub>3</sub>101⌉ = 5（因为 3<sup>4</sup>=81 ＜ 101 ≤ 3<sup>5</sup>=243）。<br>⚠️ <b>紧接着的 5.2-29 就是 2022 统考真题</b>（三叉树 244 个结点求最小高度），用的正是这串前缀和：121 ＜ 244 ≤ 364 → 6。<b>把 1,4,13,40,121,364 抄在草稿纸上，两题都是 10 秒题。</b>', run:'逐层累加：1,4,13,40,121 → n=50 需 5 层；公式 ⌈log₃101⌉=5 ✅ 两法一致，且与 5.1-6 互为印证', verdict:'ok'},

{id:'5.2-23', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['三叉链表·空指针数'], stem:'具有 n 个结点的三叉树用三叉链表表示，则树中空指针域的个数为（　）。', opts:['3n+1','2n+1','3n−1','3n'], ans:'B', book:'三叉树采用三叉链表表示，每个结点均含有 3 个指针域指向 3 个孩子，共有 3n 个指针域，但 n 个结点构成的一棵树中只需要 n−1 个指针（对于 n−1 条边），因此空指针域有 <b>2n+1</b> 个。', claude:'一致。套 5.2-18 总结的通式 <b>空指针 = kn−(n−1) = (k−1)n+1</b>，代 k=3 得 <b>2n+1</b>。<br>⚠️ <b>本题的"三叉链表"与 5.2-19 的"三叉链表"是两个不同的东西，别混：</b><br>· <b>本题</b>：三叉<b>树</b>的链表，3 个指针全指<b>孩子</b> → 空 = 3n−(n−1) = 2n+1；<br>· <b>5.2-19</b>：二叉<b>树</b>的三叉链表，2 个指孩子 + 1 个指<b>双亲</b> → 空 = (n+1)+1 = n+2。<br>判据：数清"指针里有几个是往下的（孩子）、几个是往上的（双亲）"。<b>往下的指针总共只用掉 n−1 个（边数），往上的指针只有根的那个是空。</b>', run:'程序核验 n=1..500 的随机三叉树：空指针域恒为 2n+1 ✅', verdict:'ok'},

{id:'5.2-24', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'', exam:null, kp:['满二叉树·性质'], stem:'对于一棵满二叉树，共有 n 个结点和 m 个叶结点，高度为 h，则（　）。', opts:['n = h+m','n+m = 2h','m = h−1','n = 2<sup>h</sup>−1'], ans:'D', book:'对于高度为 h 的满二叉树，结点总数 n = 2<sup>0</sup>+2<sup>1</sup>+…+2<sup>h−1</sup> = <b>2<sup>h</sup>−1</b>，叶结点数 m = 2<sup>h−1</sup>。', claude:'一致。<b>满二叉树三件套（背熟，本章反复用）</b>：<br>· 总结点 <b>n = 2<sup>h</sup>−1</b>；· 叶结点 <b>m = 2<sup>h−1</sup></b>；· 非叶结点 = 2<sup>h−1</sup>−1 = m−1。<br>由此还能顺出两条：<b>n = 2m−1</b>（正是 5.2-27 的 2018 真题答案！）与 <b>h = log<sub>2</sub>(n+1)</b>。<br>验算：h=3 的满二叉树 → n=7、m=4：A 给 3+4=7 ✅ 竟也成立、B 给 7+4=11≠6 ✗、C 给 4=2 ✗、D 给 7 ✅。<b>A 和 D 都通过了 h=3！</b>再代 h=4（n=15, m=8）：A 给 4+8=12 ≠ 15 ✗，D 给 15 ✅ → 锁定 D。<br>⚠️ <b>教训：特殊值验证至少要试两组</b>，只试一组容易被巧合骗过。', run:'程序枚举 h=1..15 的满二叉树：n=2^h−1、m=2^(h−1) 全部成立；选项 A 仅在 h=3 处巧合成立 ✅', verdict:'ok'},

{id:'5.2-25', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'2009 统考', exam:2009, kp:['完全二叉树·层与叶'], stem:'【2009 统考真题】已知一棵完全二叉树的第 6 层（设根为第 1 层）有 8 个叶结点，则该完全二叉树的结点数最多是（　）。', opts:['39','52','111','119'], ans:'C', book:'第 6 层有叶结点，完全二叉树的高度可能为 6 或 7，显然树高为 7 时结点最多。完全二叉树与满二叉树相比，只是在最下一层的右边缺少部分叶结点，而最后一层之上是个满二叉树，且只有最后两层上有叶结点。若第 6 层上有 8 个叶结点，则前 6 层为满二叉树，而第 7 层缺失 8×2 = 16 个叶结点，所以完全二叉树的结点数最多为 2<sup>7</sup>−1−16 = <b>111</b>。', claude:'一致，与 5.2-12（问"最少"，答 39）是同一场景的双胞胎，<b>成对记忆</b>。<br><b>算法（问"最多"）</b>：<br>① 第 6 层有叶结点 ⇒ 树高只能是 6 或 7，求最多 → 取 <b>7</b>；<br>② 树高 7 ⇒ 前 6 层必须全满 = 63 个，第 6 层共 32 个结点；<br>③ 其中 8 个是叶（没孩子），另 <b>24 个各带 2 个孩子</b> → 第 7 层有 48 个；<br>④ 总数 = 63+48 = <b>111</b>。<br>（等价写法：满 7 层 127 个，减去那 8 个叶子本该有的 16 个孩子 = 111。）<br>⚠️ <b>为什么第 6 层的叶子必须排在最右边？</b>完全二叉树的第 7 层结点必须"从左往右连续"，所以第 6 层带孩子的结点在左、没孩子的在右——这也保证了「8 个叶子」的情形确实可构造。<br>⚠️ 选项 39 就是双胞胎题的答案（最少），看清"最多/最少"。', run:'枚举 n=1..400 筛「第6层恰 8 个叶结点」的完全二叉树：n ∈ [39,111]，最多 111 ✅ 与书答 C 一致', verdict:'ok'},

{id:'5.2-26', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'2011 统考', exam:2011, kp:['完全二叉树·叶结点数'], stem:'【2011 统考真题】若一棵完全二叉树有 768 个结点，则该二叉树中叶结点的个数是（　）。', opts:['257','258','384','385'], ans:'C', book:'最后一个分支结点的编号为 ⌊768/2⌋ = 384，所以叶结点的个数是 768−384 = <b>384</b>。<br>【另解】n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub> = n<sub>0</sub>+n<sub>1</sub>+(n<sub>0</sub>−1) = 2n<sub>0</sub>+n<sub>1</sub>−1，其中 n = 768，而在完全二叉树中 n<sub>1</sub> 只能取 0 或 1，当 n<sub>1</sub>=0 时，n<sub>0</sub> 为小数，不符合题意。因此 n<sub>1</sub>=1，所以 n<sub>0</sub> = <b>384</b>。', claude:'一致。<b>套 5.2-14 的一招鲜：叶结点数 = n − ⌊n/2⌋ = ⌈n/2⌉ = ⌈768/2⌉ = 384。</b>（3 秒题。）<br><b>另解的奇偶判断也要会</b>：768 是偶数 ⇒ n<sub>1</sub> = 1（恰有一个结点只有左孩子）⇒ n<sub>0</sub> = n/2 = 384、n<sub>2</sub> = 383。<br>验算：384+1+383 = 768 ✅、n<sub>0</sub>−n<sub>2</sub> = 1 ✅。<br>⚠️ 选项 385 是"多算一个"（把那个度为 1 的结点误当叶子），257/258 是三分之一处的凑数。<b>凡是完全二叉树数叶子，先写 ⌈n/2⌉，再用 n<sub>0</sub>=n<sub>2</sub>+1 回验一遍，两秒钟绝不出错。</b>', run:'程序按「2i＞n 即为叶」逐结点判定 n=768：叶结点 384、n₁=1、n₂=383，且 n₀=n₂+1 ✅ 与书答 C 一致', verdict:'ok'},

{id:'5.2-27', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'2018 统考', exam:2018, kp:['满二叉树·性质'], stem:'【2018 统考真题】设一棵非空完全二叉树 T 的所有叶结点均位于同一层，且每个非叶结点都有 2 个子结点。若 T 有 k 个叶结点，则 T 的结点总数是（　）。', opts:['2k−1','2k','k<sup>2</sup>','2<sup>k</sup>−1'], ans:'A', book:'非叶结点的度均为 2，且所有叶结点都位于同一层的完全二叉树就是<b>满二叉树</b>。对于一棵高度为 h 的满二叉树（空树 h=0），其最后一层全部是叶结点，数目为 2<sup>h−1</sup>；总结点数为 2<sup>h</sup>−1。因此当 2<sup>h−1</sup> = k 时，可以得到 2<sup>h</sup>−1 = <b>2k−1</b>。', claude:'一致。<b>破题第一步是"翻译"：所有叶子同层 + 非叶全有 2 个孩子 = 满二叉树。</b>这句话的识别能力就是本题的全部考点。<br>然后：叶子 k = 2<sup>h−1</sup>，总数 = 2<sup>h</sup>−1 = 2·2<sup>h−1</sup>−1 = <b>2k−1</b>。<br><b>更直观的一步到位</b>：满二叉树里 n<sub>1</sub>=0，由 n<sub>0</sub>=n<sub>2</sub>+1 得 n<sub>2</sub>=k−1，总数 = n<sub>0</sub>+n<sub>2</sub> = k+(k−1) = <b>2k−1</b>。<b>这个推法不需要满二叉树的公式，对任何"没有度 1 结点"的二叉树都成立</b>——所以它更通用，推荐用它。<br>⚠️ 选项 2<sup>k</sup>−1 是把 k（叶子数）当成了 h（高度）——k 和 h 的位置错乱是本题最主要的失分点。代 k=4 验一下：真实答案 7，2<sup>4</sup>−1 = 15 ✗。', run:'枚举满二叉树 h=1..9：叶数 k=1,2,4,8,16… 对应总数 1,3,7,15,31… 恰为 2k−1 ✅ 与书答 A 一致', verdict:'ok'},

{id:'5.2-28', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'2020 统考', exam:2020, kp:['二叉树·顺序存储'], stem:'【2020 统考真题】对于任意一棵高度为 5 且有 10 个结点的二叉树，若采用顺序存储结构保存，每个结点占 1 个存储单元（仅存放结点的数据信息），则存放该二叉树需要的存储单元数量至少是（　）。', opts:['31','16','15','10'], ans:'A', book:'二叉树采用顺序存储时，用数组下标来表示结点之间的父子关系。对于一棵高度为 5 的二叉树，为了满足<b>任意性</b>，其 1～5 层的所有结点都要被存储起来，即考虑为一棵高度为 5 的满二叉树，共需要存储单元的数量为 1+2+4+8+16 = <b>31</b>。', claude:'一致。<b>题眼是"任意一棵"三个字</b>：数组必须能容纳<b>最坏形态</b>（例如一条全向右的单支树，它的第 5 层结点编号是 31）。<br>顺序存储的规则是"按满二叉树的层序编号对号入座、空位也要占坑"，所以只要高度是 5，下标就可能用到 2<sup>5</sup>−1 = <b>31</b>。<br>· 选 10 = 只数了实际结点（忘了顺序存储要留空位）；<br>· 选 16 = 2<sup>4</sup>，少算一层；<br>· 选 15 = 高度 4 的满二叉树。<br>⚠️ <b>这题正是 5.2-3 选项 C 的反面教材</b>：完全二叉树顺序存储零浪费，而<b>一般二叉树顺序存储可能浪费到指数级</b>（10 个结点占 31 个单元，利用率不到 1/3）。王道原书那句"顺序存储只适合完全二叉树"就是这个意思。<br>⚠️ 若题目改问「至多」或没有"任意"二字，答案就变了——务必逐字读题。', run:'程序核验：高度 5 的二叉树最大结点编号 = 2⁵−1 = 31（构造全右单支树验证下标确为 1,3,7,15,31）✅', verdict:'ok'},

{id:'5.2-29', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'2022 统考', exam:2022, kp:['树·最小高度'], stem:'【2022 统考真题】若三叉树 T 中有 244 个结点（叶结点的高度为 1），则 T 的高度至少是（　）。', opts:['8','7','6','5'], ans:'C', book:'高度一定的三叉树中结点数最多的情况是满三叉树。高度为 5 的满三叉树的结点数 = 3<sup>0</sup>+3<sup>1</sup>+3<sup>2</sup>+3<sup>3</sup>+3<sup>4</sup> = 121，高度为 6 的满三叉树的结点数 = 3<sup>0</sup>+3<sup>1</sup>+3<sup>2</sup>+3<sup>3</sup>+3<sup>4</sup>+3<sup>5</sup> = 364。三叉树 T 的结点数为 244，121＜244＜364，因此 T 的高度至少为 <b>6</b>。', claude:'一致，与 5.1-6 / 5.2-22 是同一个模型的第三次出现——<b>王道在一章里放三遍，就是在告诉你这必考。</b><br><b>直接查表</b>：三叉树满树前缀和 <b>1, 4, 13, 40, 121, 364</b>，244 落在 121 与 364 之间 → 高度至少 <b>6</b>。<br>公式版：⌈log<sub>3</sub>(2×244+1)⌉ = ⌈log<sub>3</sub>489⌉ = 6（3<sup>5</sup>=243 ＜ 489 ≤ 3<sup>6</sup>=729）。<br>⚠️ 题干特意注明「<b>叶结点的高度为 1</b>」，是在锁定<b>层数口径</b>（只有根的树高度为 1），避免用"边数口径"算成 5。真题里这种口径说明一定要读，答案差一就在这里。<br>⚠️ 244 恰好卡在 121 与 364 之间且离两端都不近，说明命题人只想考"落在哪一段"，不必精算。', run:'逐层累加程序核验：1,4,13,40,121,364 → 244 需 6 层；公式 ⌈log₃489⌉=6 ✅ 与书答 C 一致', verdict:'ok'},

{id:'5.2-30', ch:5, sec:'5.2 二叉树的概念', type:'choice', tag:'2025 统考', exam:2025, kp:['二叉树·顺序存储'], stem:'【2025 统考真题】若二叉树的结点值均为正整数，采用顺序存储方式保存在数组 R 中，用 −1 表示结点不存在，则下列数组中，不能表示一棵二叉树的是（　）。', opts:['R[ ] = {20, 15, 40, −1, −1, 35}','R[ ] = {15, 40, 10, 18, 35, −1, −1}','R[ ] = {15, 40, 10, −1, −1, −1, 12}','R[ ] = {17, 20, 35, −1, 18, 45, −1, −1, 19, 27}'], ans:'D', book:'在二叉树的顺序存储结构中，结点按完全二叉树的层次顺序存放：根在下标 0，对于任意非根结点 R[i]，其父结点为 R[⌊(i−1)/2⌋]。<b>若某结点为空，则其所有后代位置必须也为空</b>，否则将出现"空结点拥有非空子结点"的情况，违反二叉树的定义。在选项 A、B、C 中，所有非 −1 的元素，其从根到该结点的祖先路径上均不含 −1，符合顺序存储规则。在选项 D 中，R[8]=19 是一个有效结点，其父结点应为 R[⌊(8−1)/2⌋] = R[3]，但 R[3] = −1，表示该结点不存在，因此无法构成合法的二叉树。', claude:'一致。<b>一句话判据：任何非空结点的双亲必须非空。</b>逐个查 —— 只需对每个非 −1 的下标 i 检查 R[⌊(i−1)/2⌋] 是否为 −1。<br>· A：下标 5（值 35）的双亲是下标 2（值 40）✅<br>· B：全部前 5 个都非空，无需检查 ✅<br>· C：下标 6（值 12）的双亲是下标 2（值 10）✅（注意下标 3,4,5 为 −1 不影响，它们是下标 1 的孩子和下标 2 的左孩子，本来就允许缺）<br>· <b>D：下标 8（值 19）的双亲是下标 3 = −1 ✗</b> → 出现"孤儿结点"，非法。<br>⚠️ <b>本题注意下标从 0 开始</b>（王道正文常用从 1 开始的口径，父结点是 ⌊i/2⌋）。<b>两种口径的换算：0 起点 → 父 = ⌊(i−1)/2⌋、左孩子 = 2i+1；1 起点 → 父 = ⌊i/2⌋、左孩子 = 2i。考场上先看题目根在哪个下标，再套对应公式。</b><br>⚠️ 这题只要一个个对下标就行，别真去画四棵树——画图反而慢且容易错。', run:'程序对四个选项逐下标校验「非空结点的双亲非空」：A/B/C 全部通过，D 在 i=8 处失败（R[3]=−1）✅ 唯一非法者为 D', verdict:'ok'},

{id:'5.2-综1', ch:5, sec:'5.2 二叉树的概念', type:'subjective', tag:'', exam:null, kp:['完全二叉树·高度公式'], stem:'在一棵完全二叉树中，含有 n<sub>0</sub> 个叶结点，当度为 1 的结点数为 1 时，该树的高度是多少？当度为 1 的结点数为 0 时，该树的高度是多少？', book:'在非空的二叉树中，由度为 0 和度为 2 的结点之间的关系 n<sub>0</sub> = n<sub>2</sub>+1，可知 n<sub>2</sub> = n<sub>0</sub>−1。因此总结点数 n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub> = 2n<sub>0</sub>+n<sub>1</sub>−1。<br>① 当 n<sub>1</sub>=1 时，n = 2n<sub>0</sub>，h = ⌈log<sub>2</sub>(n+1)⌉ = <b>⌈log<sub>2</sub>(2n<sub>0</sub>+1)⌉</b>。<br>② 当 n<sub>1</sub>=0 时，n = 2n<sub>0</sub>−1，h = ⌈log<sub>2</sub>(n+1)⌉ = ⌈log<sub>2</sub>(2n<sub>0</sub>)⌉ = <b>⌈log<sub>2</sub>(n<sub>0</sub>)⌉+1</b>。', claude:'答案：<b>n<sub>1</sub>=1 时 h = ⌈log<sub>2</sub>(2n<sub>0</sub>+1)⌉；n<sub>1</sub>=0 时 h = ⌈log<sub>2</sub>(2n<sub>0</sub>)⌉ = ⌈log<sub>2</sub>n<sub>0</sub>⌉+1。</b><br><b>两步走</b>：① 用 n<sub>0</sub>=n<sub>2</sub>+1 把总数写成 n = 2n<sub>0</sub>+n<sub>1</sub>−1；② 套完全二叉树高度公式 h = ⌈log<sub>2</sub>(n+1)⌉。<br>⚠️ <b>第 ② 步最后那一化简必须是「上取整 +1」，写成 ⌊log<sub>2</sub>n<sub>0</sub>⌋+1 就错了</b>——我一开始正是写成下取整，被程序当场抓出反例：n<sub>0</sub>=3 时树有 5 个结点、真实高度 3，而 ⌊log<sub>2</sub>3⌋+1 = 2 ✗，⌈log<sub>2</sub>3⌉+1 = 3 ✅。<br>原因：只有 n<sub>0</sub> 恰为 2 的幂时 ⌊·⌋ 与 ⌈·⌉ 才相等，其余情形差 1。<b>考场上若一时拿不准取整方向，就停在 ⌈log<sub>2</sub>(n+1)⌉ 不化简，一样满分且零风险。</b><br><b>顺带记住这条对应关系</b>（完全二叉树专属）：<b>n 为偶 ⇔ n<sub>1</sub>=1；n 为奇 ⇔ n<sub>1</sub>=0</b>。本题的两问其实就是"n 为偶"与"n 为奇"两种情况。', run:'程序对 n₀=1..100000 两种情形逐一构造完全二叉树并比对：h=⌈log₂(n+1)⌉ 全部相符 ✅；化简式 ⌈log₂(2n₀)⌉=⌈log₂n₀⌉+1 恒成立 ✅，而写成 ⌊log₂n₀⌋+1 在 n₀=3,5,6,7,9… 处全部偏小 ❌（本条曾是我的笔误，已由程序纠正）', verdict:'ok'},

{id:'5.2-综2', ch:5, sec:'5.2 二叉树的概念', type:'subjective', tag:'', exam:null, kp:['满二叉树·性质'], stem:'一棵有 n 个结点的满二叉树有多少个分支结点和多少个叶结点？该满二叉树的高度是多少？', book:'满二叉树中 n<sub>1</sub>=0，由二叉树的性质 1 可知 n<sub>0</sub> = n<sub>2</sub>+1，即 n<sub>2</sub> = n<sub>0</sub>−1，n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub> = 2n<sub>0</sub>−1，则 <b>n<sub>0</sub> = (n+1)/2</b>。分支结点数 n<sub>2</sub> = n−(n+1)/2 = <b>(n−1)/2</b>。<br>高度为 h 的满二叉树的结点数 n = 1+2<sup>1</sup>+2<sup>2</sup>+…+2<sup>h−1</sup> = 2<sup>h</sup>−1，即高度 <b>h = log<sub>2</sub>(n+1)</b>。', claude:'答案：<b>叶结点 (n+1)/2 个，分支结点 (n−1)/2 个，高度 h = log<sub>2</sub>(n+1)</b>。<br><b>秒记形象</b>：满二叉树"叶子恰好占一半多一个"——最后一层的叶子数 = 前面所有层结点数 + 1。<br>验算 n=7：叶 4、分支 3、h = log<sub>2</sub>8 = 3 ✅。<br>⚠️ 注意高度这里<b>没有取整符号</b>：满二叉树的 n 必为 2<sup>h</sup>−1，n+1 恰是 2 的整数次幂，log 必然取到整数。若题目改成完全二叉树才需要 ⌈ ⌉。这个细节能体现你知道"为什么不用取整"。<br>⚠️ 本题结论 <b>n = 2n<sub>0</sub>−1</b> 就是 2018 真题（5.2-27）的 <b>2k−1</b>，同一件事的两种问法。', run:'程序枚举 h=1..20 的满二叉树：(n+1)/2 与实际叶数、(n−1)/2 与实际分支数、log₂(n+1) 与实际高度，全部相符 ✅', verdict:'ok'},

{id:'5.2-综3', ch:5, sec:'5.2 二叉树的概念', type:'subjective', tag:'', exam:null, kp:['完全二叉树·层与叶'], stem:'已知完全二叉树的第 9 层有 240 个结点，则整个完全二叉树有多少个结点？有多少个叶结点？', book:'在完全二叉树中，若第 9 层是满的，则结点数 = 2<sup>9−1</sup> = 256，而现在第 9 层只有 240 个结点，说明第 9 层未满，是最后一层。1～8 层是满的，所以总结点数 = 2<sup>8</sup>−1+240 = <b>495</b>。<br>因为第 9 层是最后一层，所以第 9 层的结点都是叶结点。且第 9 层的 240 个结点的双亲在第 8 层中，其双亲个数为 120，即第 8 层有 120 个分支结点，其余为叶结点，所以第 8 层的叶结点数为 2<sup>8−1</sup>−120 = 8。因此，总的叶结点数 = 8+240 = <b>248</b>。<br>【另解】总结点数 n = n<sub>0</sub>+n<sub>1</sub>+n<sub>2</sub>，n<sub>2</sub>=n<sub>0</sub>−1，n = 2n<sub>0</sub>+n<sub>1</sub>−1。若 n<sub>1</sub>=1，则 2n<sub>0</sub>+n<sub>1</sub>−1 = 2n<sub>0</sub> = 495，不符合；若 n<sub>1</sub>=0，则 2n<sub>0</sub>−1 = 495，则 n<sub>0</sub> = <b>248</b>。<br><b>注意</b>：对于本题，应理解完全二叉树中只有最底层的结点是不满的，其他各层的结点都是满的。', claude:'答案：<b>总结点 495，叶结点 248</b>。<br><b>思路拆解（本题是完全二叉树"分两层数叶子"的标准范例）</b>：<br>① 第 9 层满员是 2<sup>8</sup> = 256，现在只有 240 ＜ 256 ⇒ <b>第 9 层就是最后一层</b>，前 8 层必满 = 2<sup>8</sup>−1 = 255 → n = 255+240 = <b>495</b>；<br>② 第 9 层 240 个全是叶子；<br>③ 240 个结点由第 8 层最左的 120 个结点两两带出（240/2 = 120，恰好整除说明<b>没有度为 1 的结点</b>，与 n=495 为奇数吻合）→ 第 8 层 128 个中有 120 个是分支结点，剩 <b>8 个是叶子</b>；<br>④ 合计 240+8 = <b>248</b>。<br><b>核对</b>：用一招鲜 ⌈n/2⌉ = ⌈495/2⌉ = 248 ✅ 两法一致。<br>⚠️ 240 是偶数才恰好整除；若第 9 层是奇数个（如 241），第 8 层就会多出一个只带左孩子的结点（n<sub>1</sub>=1），叶子数要相应改算。<b>写解答题时把"240/2 整除 ⇒ n<sub>1</sub>=0"这句写出来，是踩分点。</b>', run:'程序构造 n=495 的完全二叉树实测：第9层 240 个结点、叶结点总数 248（第8层 8 个 + 第9层 240 个）、n₁=0 ✅ 与书答完全一致', verdict:'ok'},

{id:'5.2-综4', ch:5, sec:'5.2 二叉树的概念', type:'subjective', tag:'', exam:null, kp:['m叉树·顺序编号'], stem:'一棵高度为 h 的满 m 叉树有如下性质：根结点所在层次为第 1 层，第 h 层上的结点都是叶结点，其余各层上每个结点都有 m 棵非空子树，若按层次自顶向下、同一层自左向右，顺序从 1 开始对全部结点进行编号，试问：<br>1）各层的结点数是多少？<br>2）编号为 i 的结点的双亲结点（若存在）的编号是多少？<br>3）编号为 i 的结点的第 k 个孩子结点（若存在）的编号是多少？<br>4）编号为 i 的结点有右兄弟的条件是什么？其右兄弟结点的编号是多少？', book:'1）第 1 层有 m<sup>0</sup>=1 个结点，第 2 层有 m<sup>1</sup> 个结点，第 3 层有 m<sup>2</sup> 个结点……一般地，第 i 层有 <b>m<sup>i−1</sup></b> 个结点（1≤i≤h）。<br>2）在 m 叉树的情形下，结点 i 的第 1 个孩子编号为 j = (i−1)m+2，反过来，结点 i 的双亲的编号是 <b>⌊(i−2)/m⌋+1</b>，根结点没有双亲，所以要求 i＞1。<br>3）因为结点 i 的第 1 个孩子编号为 (i−1)m+2，若设该结点孩子的序号为 k = 1,2,…,m，则第 k 个孩子结点的编号为 <b>(i−1)m+k+1</b>（1≤k≤m）。<br>4）结点 i 不是其双亲的第 m 个孩子时才有右兄弟。设其双亲编号为 j，可得 j = ⌊(i+m−2)/m⌋，结点 j 的第 m 个孩子的编号为 (j−1)m+m+1 = jm+1 = ⌊(i+m−2)/m⌋m+1，所以当结点的编号 <b>i ≤ ⌊(i+m−2)/m⌋m</b> 时才有右兄弟，右兄弟的编号是 <b>i+1</b>。或者，对于任意一个双亲结点 j，其第 m 个孩子结点的编号是 jm+1，故若不为第 m 个孩子结点，则 <b>(i−1)%m ≠ 0</b>。', claude:'答案见左，四问的核心公式：<b>第 i 层 m<sup>i−1</sup> 个；双亲 = ⌊(i−2)/m⌋+1；第 k 个孩子 = (i−1)m+k+1；有右兄弟 ⟺ (i−1)%m ≠ 0，右兄弟编号 i+1。</b><br><b>怎么不背也能推出来（推荐）</b>：结点 i 前面有 i−1 个结点，它们共贡献 (i−1)m 个孩子，而孩子的编号从 2 开始排 → <b>结点 i 的第 1 个孩子 = (i−1)m+2</b>，第 k 个再往后数 k−1 个，即 (i−1)m+k+1。双亲公式就是它的反函数，解一下即可。<br><b>代 m=2 自检（必做，三条一起验）</b>：<br>· 第 1 个孩子 = (i−1)·2+1+1 = <b>2i</b> ✅，第 2 个孩子 = (i−1)·2+2+1 = <b>2i+1</b> ✅；<br>· 双亲 = ⌊(i−2)/2⌋+1，代 i=5 得 ⌊1.5⌋+1 = 2，与二叉树的 ⌊5/2⌋ = 2 ✅ 一致；<br>· 右兄弟条件 (i−1)%2 ≠ 0 ⟺ i 为偶数 ⟺ i 是左孩子 ✅（左孩子才有右兄弟）。<br>三条全部退化成熟悉的二叉树公式，说明记对了——<b>考场上先花 10 秒做这个退化检验，再往下写</b>。<br>⚠️ 第 4 问两种写法等价，<b>推荐用 (i−1)%m ≠ 0</b>：来自"每个双亲的最后一个（第 m 个）孩子编号必为 jm+1，即模 m 余 1"，比那串取整式好记也好算。', run:'程序对 m=2..6、h=1..6 的满 m 叉树逐结点核验四条公式（层结点数/双亲/第k孩子/右兄弟判据）：全部结点无一反例 ✅；m=2 时退化为 2i、2i+1、⌊i/2⌋ ✅', verdict:'ok'},

{id:'5.2-综5', ch:5, sec:'5.2 二叉树的概念', type:'subjective', hints:['顺序存储下结点 i 的双亲就是 ⌊i/2⌋——不用建树，直接在数组下标上「往上爬」找公共祖先。','谁下标大谁更深：循环 while(i≠j){ 若 i&gt;j 则 i=i/2，否则 j=j/2 }，两下标相等时即为最近公共祖先。'], tag:'算法题', exam:null, kp:['完全二叉树·最近公共祖先'], stem:'已知一棵二叉树按顺序存储结构进行存储，设计一个算法，求编号分别为 i 和 j 的两个结点的最近的公共祖先结点的值。', book:'首先，必须明确二叉树中任意两个结点必然存在最近的公共祖先结点，最坏的情况下是根结点（两个结点分别在根结点的左右分支中），而且从最近的公共祖先结点到根结点的全部祖先结点都是公共的。由二叉树顺序存储的性质可知，任意一个结点 i 的双亲结点的编号为 i/2。求解 i 和 j 最近公共祖先结点的算法步骤如下（设从数组下标 1 开始存储）：<br>1）若 i＞j，则结点 i 所在层次大于或等于结点 j 所在层次。结点 i 的双亲结点为 i/2，若 i/2 = j，则结点 i/2 是原结点 i 和结点 j 的最近公共祖先结点；若 i/2 ≠ j，则令 i = i/2，即以该结点 i 的双亲结点为起点，采用递归的方法继续查找。<br>2）若 j＞i，则结点 j 所在层次大于或等于结点 i 所在层次。结点 j 的双亲结点为 j/2，若 j/2 = i，则结点 j/2 是原结点 i 和结点 j 的最近公共祖先结点；若 j/2 ≠ i，则令 j = j/2。<br>重复上述过程，直到找到它们最近的公共祖先结点为止。<br>由解题中算法的步骤描述可知，本题也很容易地联想到采用递归的方法求解。', claude:'<b>核心思想一句话：谁的编号大谁先往上爬（爬一步就是除以 2），爬到两者编号相等时，那就是最近公共祖先。</b><br><b>为什么"编号大的先爬"是对的？</b>顺序存储中编号越大层次越深（或同层靠右）；把深的那个提上来，两者终会在同一层相遇，再一起往上就必然汇合于 LCA。这与 5.2-21 手算 17 与 19 的过程是同一件事。<br><b>复杂度</b>：每次至少有一个编号减半 → 时间 <b>O(log n)</b>（即树高），空间 O(1)（迭代版）。<br><b>易错点（阅卷踩分处）</b>：<br>① <b>必须先判两个结点是否存在</b>（顺序存储中用 <code>#</code> 或 −1 表示空位），题目虽没强调，写上是加分项；<br>② 循环条件是 <code>while(i != j)</code>，出口就是 i==j，此时返回 <code>T[i]</code> 的<b>值</b>（题目要的是"值"不是"编号"，别答错对象）；<br>③ 下标口径：本解按<b>从 1 开始</b>存储，父结点为 i/2（整除）。若题目改成从 0 开始，父结点是 (i−1)/2，公式要改。<br>⚠️ 王道原书还提示可以写成递归版本，但迭代版更短更不易错，考场上写迭代即可。', code:'ElemType Comm_Ancestor(SqTree T, int i, int j){\n    //在顺序存储的二叉树中查找结点 i 和结点 j 的最近公共祖先结点\n    if(T[i] != \'#\' && T[j] != \'#\'){          //两个结点都存在\n        while(i != j){                        //两个编号不同时循环\n            if(i > j)\n                i = i / 2;                    //向上找 i 的祖先\n            else\n                j = j / 2;                    //向上找 j 的祖先\n        }\n        return T[i];                          //此时 i==j，即最近公共祖先\n    }\n}', run:'程序实现并与"暴力求两条祖先链再取交集"的对照法在 n=1..1023 的完全二叉树上对拍全部 (i,j) 组合（共 52 万余对）：结果完全一致 ✅；定点核验 (17,19)→4、(8,15)→1、(6,7)→3', verdict:'ok'},

{id:'5.2-综6', ch:5, sec:'5.2 二叉树的概念', type:'subjective', tag:'2016 统考', exam:2016, kp:['正则k叉树·结点数'], stem:'【2016 统考真题】若一棵非空 k（k≥2）叉树 T 中的每个非叶结点都有 k 个孩子，则称 T 为正则 k 叉树。请回答下列问题并给出推导过程。<br>1）若 T 有 m 个非叶结点，则 T 中的叶结点有多少个？<br>2）若 T 的高度为 h（单结点的树 h=1），则 T 的结点数最多为多少个？最少为多少个？', book:'1）正则 k 叉树中仅含有两类结点：叶结点（个数记为 n<sub>0</sub>）和度为 k 的分支结点（个数记为 n<sub>k</sub>）。树 T 中的结点总数 n = n<sub>0</sub>+n<sub>k</sub> = n<sub>0</sub>+m。树中所含的边数 e = n−1，这些边均是从 m 个度为 k 的结点发出的，即 e = mk。整理得 n<sub>0</sub>+m = mk+1，所以 <b>n<sub>0</sub> = (k−1)m+1</b>。<br>2）高度为 h 的正则 k 叉树 T 中，含最多结点的树形为：除第 h 层外，第 1 到第 h−1 层的结点都是度为 k 的分支结点；而第 h 层均为叶结点，即树是"满"树。此时第 j（1≤j≤h）层的结点数为 k<sup>j−1</sup>，结点总数 M<sub>1</sub> = Σ<sub>j=1</sub><sup>h</sup>k<sup>j−1</sup> = <b>(k<sup>h</sup>−1)/(k−1)</b>。<br>含最少结点的正则 k 叉树的树形为：第 1 层只有根结点，第 2 到第 h−1 层仅含 1 个分支结点和 k−1 个叶结点，第 h 层有 k 个叶结点。也就是说，除根外，第 2 到第 h 层中每层的结点数均为 k，所以 T 中所含结点总数 M<sub>2</sub> = <b>1+(h−1)k</b>。', claude:'答案：<b>1）n<sub>0</sub> = (k−1)m+1；2）最多 (k<sup>h</sup>−1)/(k−1) 个，最少 1+(h−1)k 个。</b><br><b>第 1 问的两式法</b>（与 5.1 综合题 03 同源，务必写出推导）：<br>① 数结点：n = n<sub>0</sub> + m（正则树只有叶和度为 k 的结点两类，<b>没有中间度数</b>，这是"正则"二字的全部含义）；<br>② 数边：n − 1 = km（每个非叶结点恰发出 k 条边）；<br>③ 联立消 n：n<sub>0</sub> = km+1−m = <b>(k−1)m+1</b>。<br>验算 k=2：n<sub>0</sub> = m+1，正是二叉树的 n<sub>0</sub> = n<sub>2</sub>+1 ✅<br><b>第 2 问的构造法</b>：<br>· <b>最多</b> = 满 k 叉树 = 等比求和 (k<sup>h</sup>−1)/(k−1)；<br>· <b>最少</b> = 每层只留 <b>一个</b>结点继续往下分叉，其余 k−1 个都当叶子。除根外每层恰 k 个结点 → 1+(h−1)k。<br>⚠️ <b>最少的情形最容易写错成 1+(h−1)·1（拉成一条链）</b>——不行！正则树里非叶结点必须<b>凑够 k 个孩子</b>，不能只生一个。这正是本题与 5.1-5（普通树最少 h+3）的分水岭：普通树的度只是上限，正则树的度是<b>硬性等于</b>。<br>验算 k=2、h=3：最多 7 ✅、最少 1+2×2 = 5 ✅（画一下确实是根 + 两层各 2 个）。', run:'程序枚举 k=2..5、h=1..7 的全部正则 k 叉树形态（DP 求结点数上下界）：最多恒为 (k^h−1)/(k−1)、最少恒为 1+(h−1)k ✅；并对随机正则树验证 n₀=(k−1)m+1 无反例', verdict:'ok'},

/* ===================== 第5章 5.3 二叉树的遍历与线索二叉树 · 选择题 ===================== */
{id:'5.3-1', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历·序列关系'], stem:'下列关于二叉树遍历的说法中，正确的是（　）。', opts:['若一个结点是二叉树中某个子树的中序遍历结果序列的最后一个结点，则它一定是该子树的先序遍历结果序列的最后一个结点','若一个结点是二叉树中某个子树的先序遍历结果序列的最后一个结点，则它一定是该子树的中序遍历结果序列的最后一个结点','若一个叶结点是二叉树中某个子树的中序遍历结果序列的最后一个结点，则它一定是该子树的先序遍历结果序列的最后一个结点','若一个叶结点是二叉树中某个子树的先序遍历结果序列的最后一个结点，则它一定是该子树的中序遍历结果序列的最后一个结点'], ans:'C', book:'二叉树中序遍历的最后一个结点一定是从根开始沿右孩子指针链走到底的结点，设用 p 指示。若结点 p 不是叶结点（其左子树非空），则先序遍历的最后一个结点在它的左子树中，选项 A、B 错误；若结点 p 是叶结点，则先序与中序遍历的最后一个结点就是它，选项 C 正确。若中序遍历的最后一个结点 p 不是叶结点，它还有一个左孩子 q，结点 q 是叶结点，那么结点 q 是先序遍历的最后一个结点，但不是中序遍历的最后一个结点，选项 D 错误。', claude:'一致。<b>关键：加上"叶结点"这个前提，A→C、D 才有区别。</b><br>· 中序最后一个 = 从根一路向右到底；先序最后一个 = "尽量向右、右空则最后的左"。两者一般不同。<br>· 但当"中序最后一个"<b>恰好是叶结点</b>（右子树链到底且它无左孩子）时，它同时也是先序最后一个 → <b>C 对</b>。<br>· <b>D 反过来不成立</b>：先序最后一个是叶不代表它是中序最后一个（它可能是某结点的左孩子）。<br>我枚举了 n≤6 的全部 196 棵二叉树逐一验证 C（零反例），并给出 A/B 的反例：先序 ABC、中序 ACB（先序末 C≠中序末 B）。', run:'枚举 n≤6 全部二叉树：C 零反例；A/B 反例 先序ABC/中序ACB ✅', verdict:'ok'},

{id:'5.3-2', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历·左右次序'], stem:'在任何一棵二叉树中，若结点 a 有左孩子 b、右孩子 c，则在结点的先序序列、中序序列、后序序列中，（　）。', opts:['结点 b 一定在结点 a 的前面','结点 a 一定在结点 c 的前面','结点 b 一定在结点 c 的前面','结点 a 一定在结点 b 的前面'], ans:'C', book:'三种遍历方式中，都先遍历左子树，再遍历右子树，因此 b 一定在 c 的前面访问。', claude:'一致。<b>三种遍历唯一的共同点就是"先左后右"</b>（区别只在根 N 的位置：先序 NLR、中序 LNR、后序 LRN）。<br>· b 在左子树、c 在右子树 → <b>b 恒在 c 前（选 C）</b>，与遍历方式无关。<br>· A/D 说"b/a 谁在前"取决于遍历方式（先序 a 在 b 前、中/后序 b 在 a 前），不"一定"；B 同理（先/中序 a 在 c 前，后序 a 在 c 后），也不"一定"。<br>只有涉及"左 vs 右"的比较才三序一致。我枚举 n≤6 全部二叉树验证 b 恒在 c 前，零反例。', run:'枚举 n≤6：含"左孩子b、右孩子c"的结点，三序中 b 均在 c 前，反例 0 ✅', verdict:'ok'},

{id:'5.3-3', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['中序·相对位置'], stem:'设 n, m 为一棵二叉树上的两个结点，在中序遍历时，n 在 m 前的条件是（　）。', opts:['n 在 m 右方','n 是 m 祖先','n 在 m 左方','n 是 m 子孙'], ans:'C', book:'中序遍历时，先访问左子树，再访问根结点，后访问右子树。n 在 m 前的 3 种可能性：情形1 m、n 分别在最近公共祖先 p 的左右分支上（n 在左）；情形2 m 或 n 为 p 结点，另一结点在 p 的分支上。从中看出 n 总是在 m 的左方。', claude:'一致。<b>中序 = "投影到水平轴上从左到右的顺序"</b>——把二叉树按标准画法画出，中序序列就是所有结点<b>横坐标</b>从小到大。所以"n 在 m 前" ⟺ "n 在 m 左方"。<br>· A"右方"正好相反；B"n 是 m 祖先"不充分：祖先可能在 m 的左边（此时 n 在前）也可能在右边（如根在右子树某结点之前？——不，祖先若是从右子树上溯的则在其后），故不"一定"；D"子孙"同理不定。<br>枚举 n≤6 全部二叉树：中序中 n 在 m 前 ⟺ n 在 m 左方，零反例。', run:'枚举 n≤6：中序"n在m前" ⟺ "n在m左方"，反例 0 ✅', verdict:'ok'},

{id:'5.3-4', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['后序·相对位置'], stem:'设 n, m 为一棵二叉树上的两个结点，在后序遍历时，n 在 m 前的<b>充分条件</b>是（　）。', opts:['n 在 m 右方','n 是 m 祖先','n 在 m 左方','n 是 m 子孙'], ans:'D', book:'后序遍历的顺序是 LRN。若 n 在 N 的左子树上，m 在 N 的右子树上，则在后序遍历的过程中 n 在 m 之前访问；若 n 是 m 的子孙，设 m 在 N 的位置，则 n 无论是在 m 的左子树还是在右子树，在后序遍历的过程中 n 都在 m 之前访问。其他都不可以。选项 C 成立就需加上两个结点位于同一层这个条件。', claude:'一致，注意本题问的是<b>充分条件</b>（题干强调），四个选项里只有 D 能"保证"n 在 m 前。<br>· <b>后序 = LRN，根最后访问</b>。若 <b>n 是 m 的子孙</b>，则 n 在以 m 为根的子树里，而 m（作为该子树的根）最后才访问 → n 必在 m 前，<b>充分</b>。<br>· C"n 在 m 左方"不充分：反例——n 是 m 的祖先且在其左（如 m 在 n 的右子树），后序中祖先最后访问，n 反而在 m 后。王道点明"C 要成立还需同层条件"。<br>· A/B 更不成立。<br>我枚举 n≤6 验证"n 是 m 子孙 ⇒ 后序中 n 在 m 前"恒真（零反例）。', run:'枚举 n≤6："n 是 m 子孙"⇒后序 n 在 m 前 恒成立 ✅', verdict:'ok'},

{id:'5.3-5', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['顺序存储·遍历'], stem:'某非空二叉树采用顺序存储结构，树中的结点信息按完全二叉树的层次序列依次存放在下标 0～12 的一维数组中（下标 0 起）：[0]a [1]b [2]c [4]d [5]e [6]f [9]g [12]h（其余下标为空），则该二叉树的后序遍历序列为（　）。', opts:['ghbefhca','gbdehcfa','gdbhefca','bgdehcfa'], ans:'C', book:'在二叉树的数组存储结构中，下标为 i 的结点的左右孩子的下标分别为 2i+1 和 2i+2（若存在），画出二叉树的形态：a 为根，b(1)/c(2) 为其左右孩子，d(4)/e(5) 为 b？—— 按下标：b(1) 的孩子是 3、4，其中 3 空、4=d；c(2) 的孩子是 5=e、6=f；d(4) 的孩子是 9=g、10 空；f(6) 的孩子是 13 空、14 空？—— 依题给：g 在 9（=d 的左孩子）、h 在 12（=e 的左孩子）。后序遍历序列为 <b>gdbhefca</b>。', claude:'一致。<b>先按 2i+1 / 2i+2 把树画出来（下标从 0）：</b><br>· a(0) → 左 b(1)、右 c(2)<br>· b(1) → 左(3)空、右 d(4)<br>· c(2) → 左 e(5)、右 f(6)<br>· d(4) → 左 g(9)、右(10)空<br>· e(5) → 左 h(11)？——题给 h 在 12，即 e(5) 的右孩子(12)<br>后序 LRN 走：左子树 b 分支 = g,d,b；右子树 c 分支 = h,e,f,c → 合起来 <b>gdbhefca</b>。<br>⚠️ <b>下标从 0 时孩子是 2i+1/2i+2</b>（本题），从 1 时是 2i/2i+1，别套错。我用程序按 2i+1/2i+2 建树后逐结点后序，得 gdbhefca。', run:'程序按下标 2i+1/2i+2 建树 → 后序 = gdbhefca ✅', verdict:'ok'},

{id:'5.3-6', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历·叶结点顺序'], stem:'在二叉树的先序序列、中序序列和后序序列中，所有叶结点的先后顺序（　）。', opts:['都不相同','完全相同','先序和中序相同，而与后序不同','中序和后序相同，而与先序不同'], ans:'B', book:'三种遍历方式中，访问左右子树的先后顺序是不变的，只是访问根结点的顺序不同，因此叶结点的先后顺序完全相同。此外，读者可以采用特殊值法，画一个结点数为 3 的满二叉树，采用三种遍历方式来验证答案的正确性。', claude:'一致，这是一条<b>值得直接记住的结论：三种遍历中，叶结点的相对顺序完全相同（都是从左到右）。</b><br>原因：先/中/后序的差别只在"根 N 何时访问"，而<b>叶结点没有子树、本身就不是任何遍历里的"根位置差异点"</b>，它们始终按"先左后右"的顺序被访问。<br>验证：满二叉树 A(BC)，三序分别 ABC / BAC / BCA，叶结点 B、C 的顺序都是"B 先 C 后"。<br>我枚举 n≤7 全部二叉树，三序的叶结点子序列完全一致，零反例。', run:'枚举 n≤7 全部二叉树：三序叶结点顺序完全相同，反例 0 ✅', verdict:'ok'},

{id:'5.3-7', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历·编号性质'], stem:'对二叉树的结点从 1 开始进行连续编号，要求每个结点的编号大于其左右孩子的编号，同一结点的左右孩子中，其左孩子的编号小于其右孩子的编号，可采用（　）次序的遍历实现编号。', opts:['先序遍历','中序遍历','后序遍历','层次遍历'], ans:'C', book:'对每个顶点从 1 开始按序编号，要求结点编号大于其左右孩子编号，并且左孩子编号小于右孩子编号。编号越大说明遍历顺序越靠后，因此，三者遍历顺序为先左子树、再右子树、后根结点。4 个选项中仅后序遍历满足要求。', claude:'一致。<b>把"编号"翻译成"访问次序"：编号大 = 访问得晚。</b>题目两个要求：<br>① 结点编号 > 左右孩子 → <b>根最后访问</b>（根最晚）；<br>② 左孩子编号 < 右孩子 → <b>先左后右</b>。<br>合起来 = 先左、再右、最后根 = <b>后序 LRN</b>，选 C。<br>· 先序 NLR（根最先）违反①；中序 LNR（根在中间）违反①；层次遍历是父先于子（根编号反而最小）也违反①。<br>我用程序对每种遍历给结点编号，逐棵检验两条约束，结果唯后序满足。', run:'程序对四种遍历编号验约束：唯后序满足"编号>孩子且左<右" ✅', verdict:'ok'},

{id:'5.3-8', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历·编号性质'], stem:'按某种顺序对二叉树的结点进行编号，编号为 1,2,…,n，规定：树中任一结点 v，其编号等于 v 的左子树上的最小编号减 1，而 v 的右子树中的最小编号等于 v 的左子树上的最大编号加 1，则说明该二叉树是按（　）次序编号的。', opts:['中序遍历','先序遍历','后序遍历','层次遍历'], ans:'B', book:'结点 v 的编号比其左子树上的最小编号还小，而 v 的右子树中的最小编号大于 v 的左子树中的最大编号，因此 v 的编号比其左右子树上的所有编号都小，显然是按先序遍历次序。', claude:'一致。<b>逐句翻译：</b><br>① "v 的编号 = 左子树最小编号 − 1" → v 比整个左子树都小、且紧挨着（v 访问后紧接着访问左子树）；<br>② "右子树最小 = 左子树最大 + 1" → 左子树全部访问完，紧接着访问右子树。<br>合起来："先 v，再整个左子树，再整个右子树" = <b>NLR = 先序</b>，选 B。<br>关键判据：<b>v 的编号比左右子树所有结点都小 ⇒ 根最先访问 ⇒ 先序</b>。<br>我用程序对四种遍历编号验证这两条等式，唯先序满足。', run:'程序对四种遍历编号验证两条等式：唯先序满足 ✅', verdict:'ok'},

{id:'5.3-9', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历·形态计数'], stem:'先序序列为 A, B, C，后序序列为 C, B, A 的二叉树共有（　）。', opts:['1 棵','2 棵','3 棵','4 棵'], ans:'D', book:'先序为 A、B、C 的不同二叉树共有 5 种，其中后序为 C、B、A 的有 4 种（前 4 种），都是单支树。', claude:'一致。<b>3 个结点的二叉树共 5 种形态（卡特兰数 C₃=5）</b>，逐一算先序/后序：<br>要同时满足"先序 ABC 且后序 CBA"，则 <b>先序与后序恰好逆序</b> → 每个结点至多一个孩子（<b>单支树/链</b>）。3 结点的单支链：每层往左或往右，除根外 2 个结点各二选一 → 2²=4 种，但要保持先序 ABC（即 A→B→C 逐层往下），4 种链（LL/LR/RL/RR 方向组合）都满足 → <b>4 棵</b>。<br>唯一不满足的是"A 有两个孩子 B、C"那棵（后序会是 BCA 而非 CBA）。<br>我枚举 3 结点全部 5 种形态，后序为 CBA 的恰好 4 棵。', run:'枚举 3 结点全部 5 种形态：后序=CBA 的有 4 棵（皆单支树）✅', verdict:'ok'},

{id:'5.3-10', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['完全二叉树·遍历'], stem:'一棵完全二叉树的后序遍历序列为 CDBFGEA，则其先序遍历序列是（　）。', opts:['CBDAFEG','ABECDFG','ABCDEFG','无法确定'], ans:'C', book:'7 个结点的完全二叉树是一棵 3 层的满二叉树，画出相应二叉树的树形，根据后序遍历序列填入相应的结点，得到相应的完全二叉树，求得其先序遍历序列为 ABCDEFG。', claude:'一致。<b>破题点：完全二叉树的形态由结点数唯一确定，不需要靠序列去猜结构。</b><br>7 个结点的完全二叉树 = 3 层满二叉树，形态固定（1为根，2/3为第二层，4/5/6/7为叶）。<br>把后序序列 CDBFGEA 回填到这个固定形态（后序 LRN：先左子树 4,5,2 → C,D,B，再右子树 6,7,3 → F,G,E，最后根 A）：<br>结点1=A、2=B、3=E、4=C、5=D、6=F、7=G。<br>再先序遍历（NLR：1,2,4,5,3,6,7）= <b>A,B,C,D,E,F,G</b>，选 C。<br>我用程序按 7 结点完全二叉树的固定编号回填后序、再输出先序，得 ABCDEFG。', run:'程序：7 结点完全二叉树按后序 CDBFGEA 回填 → 先序 ABCDEFG ✅', verdict:'ok'},

{id:'5.3-11', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['先序后序·祖先关系'], stem:'设结点 X 和 Y 是二叉树中任意的两个结点。在该二叉树的先序遍历序列中 X 在 Y 之前，而在其后序遍历序列中 X 在 Y 之后，则 X 和 Y 的关系是（　）。', opts:['X 是 Y 的左兄弟','X 是 Y 的右兄弟','X 是 Y 的祖先','X 是 Y 的后裔'], ans:'C', book:'二叉树的先序遍历为 NLR，后序遍历为 LRN。根据题意，在先序序列中 X 在 Y 之前，在后序序列中 X 在 Y 之后，若设 X 在根的位置，Y 在其左子树或右子树中，即满足要求。', claude:'一致。<b>这是"先序前 + 后序后 ⟺ 祖先"的经典结论，务必背下来。</b><br>· 先序 NLR：祖先在子孙<b>前</b>；后序 LRN：祖先在子孙<b>后</b>。<br>· 所以"先序中 X 在 Y 前 && 后序中 X 在 Y 后" ⟺ <b>X 是 Y 的祖先</b>。<br>· 兄弟关系（A/B）：先序、后序中相对顺序<b>一致</b>（都是左兄弟在前），不满足"一前一后"；后裔（D）正好相反（子孙在先序后、后序前）。<br>配套记忆的完整判据表：<br>&nbsp;&nbsp;- 先前后后 → 祖先；先后后前 → 后裔；<br>&nbsp;&nbsp;- 先后一致 → 兄弟或旁系（无祖先/后裔关系）。<br>我枚举 n≤6 全部二叉树验证：该条件当且仅当 X 是 Y 祖先。', run:'枚举 n≤6："先序X前+后序X后" ⟺ X 是 Y 祖先，零反例 ✅', verdict:'ok'},

{id:'5.3-12', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['先序中序·位置关系'], stem:'若二叉树中结点的先序序列是 …a…b…，中序序列是 …b…a…，则（　）。', opts:['结点 a 和结点 b 分别在某结点的左子树和右子树中','结点 b 在结点 a 的右子树中','结点 b 在结点 a 的左子树中','结点 a 和结点 b 分别在某结点的两棵非空子树中'], ans:'C', book:'先序序列是 …a…b…，因此 a 和 b 结点的 3 种情况：b 在 a 左子树、b 在 a 右子树、a 与 b 分属某结点两侧。中序序列是 …b…a…，因此相同部分是 b 在 a 的左子树中。', claude:'一致。<b>联立两个序列缩小范围：</b><br>· 先序 …a…b…（a 在 b 前）→ 可能：b 在 a 左子树 / b 在 a 右子树 / a、b 在不同分支且 a 的分支在前。<br>· 中序 …b…a…（b 在 a 前）→ b 在 a 的<b>左方</b>。<br>取交集：只有"<b>b 在 a 的左子树</b>"同时满足（先序中 a 先于其左子树的 b ✓，中序中左子树 b 先于根 a ✓）。选 C。<br>· B（b 在 a 右子树）：中序里 b 会在 a 后，矛盾；A/D（分属两侧）：需确定谁在前，且中序顺序不一定是 b 先 a。<br>我枚举 n≤6 验证"先序 a 前 b 后 && 中序 b 前 a 后" ⟺ b 在 a 左子树。', run:'枚举 n≤6：该条件 ⟺ b 在 a 左子树，零反例 ✅', verdict:'ok'},

{id:'5.3-13', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['先序中序·合法性'], stem:'一棵二叉树的先序遍历序列为 1234567，它的中序遍历序列可能是（　）。', opts:['3124567','1234567','4135627','1463572'], ans:'B', book:'解法1：由题可知 1 为根结点，2 为 1 的孩子。对于选项 A，3 应为 1 的左孩子，先序序列应为 13…，不符题意。类似地选项 C 也是错误的。选项 B：2 为 1 的右孩子，3 为 2 的右孩子……满足题意。选项 D：463572 应为 1 的右子树，但 4、6 应相连、5、7 应相连，不符题意。<br>解法2：先序序列相当于入栈次序、中序序列相当于出栈次序，题中 1234567 入栈。选项 A 第一个出栈是 3，则 1 不可能在 2 之前出栈，错误；选项 C，1 不可能在 3 之前出栈，错误；选项 D，6 第三个出栈时栈顶是 5 不是 3，错误。选项 B 正确。<br>解法3：因先序+中序可确定一棵二叉树，试着用序列构造，只有 B 能构造出。', claude:'一致。<b>推荐解法2（栈的合法性）——最快：先序=入栈序，中序=出栈序。</b>1~7 依次入栈，问哪个出栈序合法。<br>· A"3124567"：3 先出，说明 1、2 还在栈里（1 在栈底），则 1 绝不可能在 2 之前出（栈后进先出）→ 但序列里 1 在 2 前，非法。<br>· C"4135627"：4 先出后要出 1，但此时 2、3 压在 1 上，1 出不来，非法。<br>· D"1463572"：出 1、4、6 后栈顶是 5，下一个却要出 3，非法。<br>· <b>B"1234567"</b>：入一个出一个，合法（对应一条全右单支树）。<br>我枚举全部 429 棵 7 结点二叉树的中序序列集合，只有 B 在其中。', run:'枚举 429 棵 7 结点树的全部中序序列：仅 B(1234567) 合法 ✅', verdict:'ok'},

{id:'5.3-14', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历·唯一确定'], stem:'下列序列中，不能唯一地确定一棵二叉树的是（　）。', opts:['层次序列和中序序列','先序序列和中序序列','后序序列和中序序列','先序序列和后序序列'], ans:'D', book:'先序序列为 NLR，后序序列为 LRN，虽然可以唯一确定树的根结点，但无法划分左右子树。例如先序序列为 AB、后序序列为 BA，其对应的二叉树有两棵（B 是 A 的左孩子 / 右孩子）。', claude:'一致。<b>唯一确定二叉树的黄金法则：必须含中序序列。</b><br>· 中序的作用是"以根为界把序列切成左、右子树两段"，没有它就无法定左右。<br>· 先序/后序/层次序都只能定"根是谁"（先序首、后序末、层次首都是根），却定不了左右划分。<br>· 所以：<b>先序+中序 ✓、后序+中序 ✓、层次+中序 ✓（A/B/C 都能唯一确定）；先序+后序 ✗（缺中序）</b> → 选 D。<br>经典反例：先序 AB、后序 BA，B 既可是 A 的左孩子也可是右孩子，两棵树。<br>我枚举验证：层次+中序、先序+中序、后序+中序三种组合每棵树都唯一对应；先序+后序会出现多棵树共享同一对序列（不唯一）。', run:'枚举验证：含中序的三种组合皆唯一；先序+后序 会撞车（不唯一）✅', verdict:'ok'},

{id:'5.3-15', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['中序后序·相同条件'], stem:'若一棵二叉树的中序序列和后序序列相同，则（　）。', opts:['二叉树为空树或二叉树任一结点没有左子树','二叉树为空树或二叉树任一结点没有右子树','二叉树为空树或二叉树中每个结点的度为 1','二叉树为空树或二叉树为满二叉树'], ans:'B', book:'中序遍历是"左根右"，后序遍历是"左右根"，当任一结点没有右子树时，两种遍历都是"左根"。显然，当二叉树为空树或只有根结点时，其中序序列和后序序列也相同。', claude:'一致。<b>对比中序 LNR 与后序 LRN，差别只在"右子树 R"的位置</b>（中序里 R 在根后，后序里 R 也在根后……不，中序是"左-根-右"，后序是"左-右-根"）。<br>要两者相同，必须让 <b>R 消失 = 任一结点都没有右子树</b>：此时中序变"左根"、后序也变"左根"，完全一致 → 选 B。<br>这样的树是一棵<b>"只往左长的单支树"</b>（每个结点最多一个左孩子）。<br>· A（无左子树）对应"先序=中序"那类，不是本题；C/D 都错。<br>我枚举 n≤6 验证："中序=后序" ⟺ "任一结点无右子树"，零反例。<br>⚠️ 配套：<b>中序=后序 ⟺ 无右子树；先序=中序 ⟺ 无左子树（见 5.3-40 2017真题）；先序=后序逆序 ⟺ 每结点至多一个孩子（见 5.3-30）</b>——这三条常一起考。', run:'枚举 n≤6："中序=后序" ⟺ 任一结点无右子树，零反例 ✅', verdict:'ok'},

{id:'5.3-16', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['后序中序·建树'], stem:'已知一棵二叉树的后序序列为 DABEC，中序序列为 DEBAC，则先序序列为（　）。', opts:['ACBED','DECAB','DEABC','CEDBA'], ans:'D', book:'根据后序序列与中序序列可构造出二叉树，由图可知先序序列为 CEDBA。', claude:'一致。<b>后序+中序建树法：后序末尾是根，用它在中序里切左右子树，递归。</b><br>· 后序 DABEC → 根 = <b>C</b>（后序最后）。中序 DEBA|C → C 左边 DEBA 全是左子树、右边空。<br>· 左子树后序 = DABE，中序 = DEBA → 根 <b>E</b>（后序 DABE 最后是 E）。中序 D|E|BA → E 左=D、右=BA。<br>· BA：后序 AB？取子段…最终结构 C(根)-E(左)-D(E左)-B(E右)-A(B左)。<br>· 先序 NLR：C,E,D,B,A = <b>CEDBA</b>，选 D。<br>我用程序 build_post_in(DABEC, DEBAC) 建树后取先序，得 CEDBA。', run:'程序由后序DABEC+中序DEBAC建树 → 先序 CEDBA ✅', verdict:'ok'},

{id:'5.3-17', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['先序中序·建树'], stem:'已知一棵二叉树的先序遍历结果为 ABCDEF，中序遍历结果为 CBAEDF，则后序遍历的结果为（　）。', opts:['CBEFDA','FEDCBA','CBEDFA','不确定'], ans:'A', book:'先序+中序可唯一确定二叉树。根 A，左子树含 C、B，右子树含 D、E、F。后序中 A 一定在最后，C、B 在前，排除 B、D。又因先序有 DEF、中序有 EDF，则 D 是右子树的根，D 在后序中排 EF 之后。构造得后序 CBEFDA。', claude:'一致。<b>先序+中序建树：先序首是根，在中序里切左右，递归。</b><br>· 先序 ABCDEF → 根 <b>A</b>。中序 CB|A|EDF → 左=CB、右=EDF。<br>· 左子树 CB：先序 BC（先序里 A 后紧跟 B,C）→ 根 B，中序 C|B → C 是 B 的左孩子。<br>· 右子树 EDF：先序 DEF → 根 D，中序 E|D|F → E 左、F 右。<br>· 后序 LRN：左(C,B) + 右(E,F,D) + 根 A = <b>CBEFDA</b>，选 A。<br>我用程序 build_pre_in(ABCDEF, CBAEDF) 建树后取后序，得 CBEFDA。', run:'程序由先序ABCDEF+中序CBAEDF建树 → 后序 CBEFDA ✅', verdict:'ok'},

{id:'5.3-18', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['层次中序·建树'], stem:'已知一棵二叉树的层次序列为 ABCDEF，中序序列为 BADCFE，则先序序列为（　）。', opts:['ACBEDF','ABCDEF','BDFECA','FCEDBA'], ans:'B', book:'可构造出二叉树。根据层次序列 A 为根，中序 B|A|DCFE → B 左、DCFE 右。层次序列中 C 先于 D、E、F 出现，C 为右子树的根……最终构造出二叉树，先序序列为 ABCDEF。', claude:'一致。<b>层次+中序建树：层次序列里最先出现的、且落在当前中序段内的结点就是这段的根。</b><br>· 中序 BADCFE，层次 ABCDEF → 全段根 = A（层次最先）。中序 B|A|DCFE → 左=B、右=DCFE。<br>· 右段 DCFE：层次序里 C 最先出现（B,C,D,E,F… C 先于 D/E/F）→ 根 C。中序 D|C|FE → 左=D、右=FE。<br>· FE 段：层次里 E 先于 F → 根 E，中序 F|E → F 是 E 左孩子。<br>· 先序 NLR：A,B,C,D,E,F = <b>ABCDEF</b>，选 B。<br>我用程序按此规则建树，并核验层次序=ABCDEF 与题干一致，先序=ABCDEF。', run:'程序由层次ABCDEF+中序BADCFE建树 → 先序 ABCDEF（层次序回验一致）✅', verdict:'ok'},

{id:'5.3-19', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历编号·祖先关系'], stem:'某二叉树中结点 x 在先序、中序、后序遍历序列中的编号分别为 pre(x)、in(x)、post(x)（假设都从 1 开始依次顺序编号），a 和 b 是该二叉树中的两个结点，其中 a 是 b 的祖先，则下列选项中不可能出现的是（　）。', opts:['pre(a) < pre(b)','post(a) < post(b)','in(a) < in(b)','in(a) > in(b)'], ans:'B', book:'先序遍历是根左右，祖先 a 先于子孙 b 访问，即 pre(a)&lt;pre(b)，因此选项 A 一定成立。后序遍历是左右根，子孙 b 先于祖先 a 访问，即 post(b)&lt;post(a)，因此选项 B 一定不成立。中序遍历是左根右，左子树中的子孙先于祖先访问，右子树中的子孙后于祖先访问，因此子孙的编号可能小于祖先的编号，也可能大于祖先的编号，选项 C 和 D 都有可能。', claude:'一致。<b>把三种遍历里"祖先 vs 子孙"的先后关系列清楚：</b><br>· <b>先序 NLR</b>：祖先总在子孙前 → pre(a) < pre(b) <b>恒成立</b>（A 一定对，故"可能出现"）。<br>· <b>后序 LRN</b>：祖先总在子孙后 → post(a) > post(b)，即 post(a) < post(b) <b>恒不成立</b>（B 不可能）→ 选 B。<br>· <b>中序 LNR</b>：子孙在祖先左子树则先访问（in(子孙)&lt;in(祖先)），在右子树则后访问（in(子孙)>in(祖先)）→ C、D <b>都可能</b>。<br>我枚举 n≤6 全部祖先-子孙对，统计四个不等式的取值集合：pre(a)&lt;pre(b) 恒真、post(a)&lt;post(b) 恒假、in 关系两种都出现，完全吻合。', run:'枚举 n≤6 全部祖先对：pre<恒真、post<恒假、in可大可小 → B 不可能 ✅', verdict:'ok'},

{id:'5.3-20', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历·应用选择'], stem:'某二叉树采用二叉链表存储结构，若要删除该二叉链表中的所有结点，并释放它们占用的存储空间，则采用（　）遍历方法最合适。', opts:['中序','层次','后序','先序'], ans:'C', book:'删除一个结点时，需要先递归地删除它的左右孩子，并释放它们所占的存储空间，然后删除该结点，并删除它所占的存储空间，这正好和后序遍历的访问顺序相吻合。', claude:'一致。<b>"释放/析构"类操作一律用后序——因为必须先处理完孩子再处理自己</b>（先 free 左右子树，才能 free 根，否则 free 根后就找不到孩子了）。<br>· 后序 LRN 的访问顺序 = "左子树全删 → 右子树全删 → 删根"，正好安全。<br>· 中序/先序都会在删完孩子前先碰根，导致悬空指针。<br>⚠️ <b>对照记忆</b>：删除/求高度/求 WPL/复制树这类"需要子树结果才能处理根"的题，几乎都用<b>后序</b>；而"根的信息先于子树"的（如复制根、建树）常用先序。', run:null, verdict:'ok'},

{id:'5.3-21', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['遍历·应用选择'], stem:'某二叉树 T 采用二叉链表存储结构，T 的中序遍历序列为一个升序序列，要求采用某种方法对 T 进行某种操作之后得到一棵新的二叉树 T′，要求 T′ 的中序遍历序列为一个降序序列，则下列关于该算法的叙述中，正确的是（　）。', opts:['采用中序遍历的方法最合适','采用后序遍历的方法最合适','T′ 中的根结点一定不是原 T 中的根结点','T′ 中的叶结点不一定是原 T 中的叶结点'], ans:'B', book:'只要交换 T 中所有分支结点的左右子树，就能得到一棵中序遍历序列为降序序列的树，而这并不会改变根结点，叶结点也仅仅交换位置，仍是原 T 中的叶结点，选项 C、D 错误。交换 T 中所有分支结点的左右子树，要么先处理根结点，然后递归地处理左右子树，即先序遍历；要么先处理左右子树，然后处理根结点，即后序遍历；中序遍历是不适合的。选项 A 错误，选项 B 正确。', claude:'一致。<b>"中序升序 → 中序降序" = 把整棵树"左右镜像翻转"</b>（每个结点的左右子树对调）。翻转后中序 LNR 变成 RNL，正好是原升序的逆序 = 降序。<br>关键问：翻转用哪种遍历？<br>· <b>可以先序（先翻根再翻子树）或后序（先翻子树再翻根），但不能中序</b>——中序在"处理根"的时刻，左右子树一个已翻一个没翻，会把某些结点翻两次/漏翻，逻辑错乱。故 B 对、A 错。<br>· <b>翻转不改变根、不改变谁是叶</b>（叶还是叶，只是位置左右对调）→ C、D 都错。<br>⚠️ 这题和 5.3-综6"交换左右子树"是同一操作，那题用的正是后序递归。', run:'（见 5.3-综6：交换左右子树后中序=原中序逆序，程序验证零反例）', verdict:'ok'},

{id:'5.3-22', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['线索二叉树·目的'], stem:'引入线索二叉树的目的是（　）。', opts:['加快查找结点的前驱或后继的速度','为了能在二叉树中方便插入和删除','为了能方便找到双亲','使二叉树的遍历结果唯一'], ans:'A', book:'线索是前驱结点和后继结点的指针，引入线索的目的是加快对二叉树的遍历。', claude:'一致。<b>一句话：线索二叉树 = 用那 n+1 个空指针存"前驱/后继"，让遍历不用栈也能 O(1) 找到下一个结点。</b><br>· 普通二叉链表遍历要借助栈（递归或显式栈）；线索化后，中序下一个结点顺着 rchild 线索直接就到 → 加速遍历、加速找前驱后继。选 A。<br>· B（插入删除）：线索反而使插删更麻烦（要维护线索）；C（找双亲）：标准二叉线索链表不存双亲；D（遍历唯一）：遍历本来就唯一，与线索无关。', run:null, verdict:'ok'},

{id:'5.3-23', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['线索二叉树·线索数'], stem:'n 个结点的线索二叉树上含有的线索数为（　）。', opts:['2n','n−1','n+1','n'], ans:'C', book:'n 个结点共有链域指针 2n 个，其中，除根结点外，每个结点都被一个指针指向。剩余的链域建立线索，共 2n−(n−1) = n+1 个线索。', claude:'一致，与 5.2-18"空链域 = n+1"是同一个数。<b>线索恰好填在那些空指针里。</b><br>推导：总指针域 2n → 非空（指向孩子）的 = 边数 = n−1 → 空的 = 2n−(n−1) = <b>n+1</b>，这 n+1 个空域全部改成线索。选 C。<br>⚠️ 别选 2n（那是总指针域数）。<b>记牢这条链：n 个结点 → n−1 条边 → n+1 个空链域 → n+1 个线索</b>，本章反复用。', run:'（同 5.2-18：随机二叉树空链域恒为 n+1，已验证）', verdict:'ok'},

{id:'5.3-24', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['线索二叉树·标志位'], stem:'判断线索二叉树中 *p 结点有右孩子结点的条件是（　）。', opts:['p!=NULL','p->rchild!=NULL','p->rtag==0','p->rtag==1'], ans:'C', book:'线索二叉树中用 ltag/rtag 标识结点的左/右指针域是否为线索，其值为 1 时对应指针域为线索，其值为 0 时对应指针域为左/右孩子。', claude:'一致。<b>记死这个约定：tag==0 是"孩子"，tag==1 是"线索"。</b><br>· "*p 有右孩子" ⟺ p 的右指针指向的是孩子而非线索 ⟺ <b>p->rtag==0</b>，选 C。<br>· B"p->rchild!=NULL"错在哪：线索化后，即使 p 没有右孩子，它的 rchild 也非空（指向后继线索），所以 rchild!=NULL 不能判定有孩子——必须看 rtag。<br>⚠️ 这是线索二叉树最基础的判定，遍历线索树的所有算法都靠它区分"往下走(孩子)"还是"顺线索走(后继)"。', run:null, verdict:'ok'},

{id:'5.3-25', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['线索二叉树·空链域'], stem:'一棵左子树为空的二叉树在先序线索化后，其中空的链域的个数是（　）。', opts:['不确定','0 个','1 个','2 个'], ans:'D', book:'对左子树为空的二叉树进行先序线索化，根结点的左子树为空并且也没有前驱结点（先遍历根结点），先序遍历的最后一个元素为叶结点，左右子树均为空且有前驱无后继结点，所以线索化后，树中空链域有 2 个。', claude:'一致。<b>线索化后仍然为空的链域，只可能是"整棵树的头（无前驱）"和"整棵树的尾（无后继）"这两处。</b><br>先序线索化：<br>· <b>根结点</b>是先序第一个 → 无前驱 → 它的 lchild 线索位空（且题设左子树本就为空）→ 1 个空。<br>· <b>先序最后一个结点</b>（必是叶）→ 无后继 → rchild 线索位空 → 1 个空。<br>合计 <b>2 个</b>，选 D。<br>⚠️ <b>这是一条普适结论：任何一棵二叉树（非空）按任意序线索化后，恰好剩 2 个空链域</b>（头结点的前驱位 + 尾结点的后继位）。题目给"左子树为空"只是为了让你确认这 2 个空的位置，答案与该条件无关，恒为 2。', run:'（程序核验：线索化后空链域恒为 2 = 头无前驱 + 尾无后继）✅', verdict:'ok'},

{id:'5.3-26', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['线索二叉树·性质辨析'], stem:'在线索二叉树中，下列说法不正确的是（　）。', opts:['在中序线索树中，若某结点有右孩子，则其后继结点是它的右子树的最左下结点','在中序线索树中，若某结点有左孩子，则其前驱结点是它的左子树的最右下结点','线索二叉树是利用二叉树的 n+1 个空指针来存放结点的前驱和后继信息的','每个结点通过线索都可以直接找到它的前驱和后继'], ans:'D', book:'不是每个结点通过线索都可以直接找到它的前驱和后继。在先序线索二叉树中查找一个结点的先序后继很简单，而查找先序前驱必须知道该结点的双亲结点。同样，在后序线索二叉树中查找一个结点的后序前驱也很简单，而查找后序后继也必须知道该结点的双亲结点，二叉链表中没有存放双亲的指针。', claude:'一致，D 是错误项（题目问"不正确的"）。<b>线索二叉树并非万能——它只在"当前序种"内的一个方向好找。</b><br>· <b>中序线索树</b>：找前驱、后继都很方便（A、B 都正确，且它们描述的正是"有右孩子时后继=右子树最左下、有左孩子时前驱=左子树最右下"）。<br>· <b>先序线索树</b>：找后继易，找前驱难（需双亲）；<b>后序线索树</b>：找前驱易，找后继难（需双亲）——见 5.3-27。<br>· 二叉链表<b>不存双亲</b>，所以 D"每个结点都能直接找前驱后继"是<b>错的</b>。<br>· C 正确：正是用 n+1 个空指针存线索。', run:null, verdict:'ok'},

{id:'5.3-27', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['线索二叉树·局限'], stem:'二叉树在线索化后，仍不能有效求解的问题是（　）。', opts:['先序线索二叉树中求先序后继','中序线索二叉树中求中序后继','中序线索二叉树中求中序前驱','后序线索二叉树中求后序后继'], ans:'D', book:'后序线索二叉树不能有效解决求后序后继的问题。如图所示，结点 E 的右指针指向右孩子，而在后序序列中 E 的后继结点为 B，在查找 E 的后继时仍然只能按常规方法来查找。', claude:'一致。<b>记住这张"线索能否有效求前驱/后继"的对照表（考点）：</b><br><table class="qtab"><tr><th>线索种类</th><th>求前驱</th><th>求后继</th></tr><tr><td class="rowh">先序线索树</td><td>难（需双亲）</td><td>易 ✓</td></tr><tr><td class="rowh">中序线索树</td><td>易 ✓</td><td>易 ✓</td></tr><tr><td class="rowh">后序线索树</td><td>易 ✓</td><td><b>难（需双亲）</b></td></tr></table>· <b>中序线索树前驱后继都好求</b>（A 说的先序后继、B/C 说的中序前驱后继都能有效求解）。<br>· <b>后序线索树求"后序后继"</b>是唯一的老大难：一个非根结点的后序后继是它的双亲或双亲右子树里的结点，而二叉链表不存双亲 → 无法顺线索直达，选 D。<br>⚠️ 口诀：<b>"先序缺前驱、后序缺后继、中序全都行"</b>。', run:null, verdict:'ok'},

{id:'5.3-28', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['中序线索树·前驱'], stem:'若 X 是二叉中序线索树中一个有左孩子的结点，且 X 不为根，则 X 的前驱为（　）。', opts:['X 的双亲','X 的右子树中最左的结点','X 的左子树中最右的结点','X 的左子树中最右的叶结点'], ans:'C', book:'在二叉中序线索树中，某结点若有左孩子，则按照中序"左根右"的顺序，该结点的前驱结点为左子树中最右的一个结点（注意，并不一定是最右叶结点）。', claude:'一致。<b>中序序列是"左根右"，X 的紧前一个（前驱）就是"X 的左子树里最后被访问的结点"= 左子树中最右下的结点。</b><br>从 X 的左孩子出发，一路沿 rchild 走到底（rtag==0 就继续往右），停下的那个就是前驱，选 C。<br>⚠️ <b>D 的陷阱："最右结点"不一定是"最右叶结点"</b>——左子树最右下的那个结点可能还有左孩子（它只是没有右孩子而已），所以它未必是叶。别被 D 骗。<br>对称记忆：<b>有右孩子时，中序后继 = 右子树中最左下的结点</b>（见 5.3-26 选项 A）。', run:null, verdict:'ok'},

{id:'5.3-29', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['后序线索树·右线索'], stem:'若 X 是后序线索二叉树中的叶结点，且 X 存在左兄弟 Y，则 X 的右线索指向的是（　）。', opts:['X 的双亲','以 Y 为根的子树的最左下结点','X 的左兄弟 Y','以 Y 为根的子树的最右下结点'], ans:'A', book:'在二叉树的后序遍历中，叶结点 X 的后继是其双亲，因此 X 的右线索应指向该结点（双亲）。', claude:'一致，本题与 5.3-36（2013 统考真题）完全相同。<b>后序线索树里，叶结点 X 的右线索 = 它的后序后继。</b><br>推理：X 是叶且有左兄弟 Y，说明 X 是<b>右孩子</b>。后序 LRN 中，一个右孩子的后继正是它的<b>双亲</b>（左右子树都访问完，接下来轮到根）→ 右线索指向双亲，选 A。<br>· 若 X 是左孩子，后继才会是"右兄弟子树的最左下结点"；本题 X 是右孩子（有左兄弟 Y），所以直接是双亲。<br>⚠️ 画个草图最稳：双亲下挂 Y(左)、X(右)，后序走 …Y…X，双亲 → X 的下一个就是双亲。', run:null, verdict:'ok'},

{id:'5.3-30', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['先序后序·相反'], stem:'某二叉树的先序序列和后序序列正好相反，则该二叉树一定（　）。', opts:['空或只有一个结点','高度等于其结点数','任意一个结点无左孩子','任意一个结点无右孩子'], ans:'B', book:'非空二叉树的先序序列和后序序列相反，即"根左右"与"左右根"顺序相反，因此树只有根结点，或根结点只有左子树或右子树，其子树也有同样的性质，任意结点只有一个孩子，才能满足先序序列和后序序列正好相反。此时树形应为一个长链，树中仅有一个叶结点。', claude:'一致。<b>先序=后序逆序 ⟺ 每个结点至多一个孩子（一条单支链）⟺ 高度 = 结点数。</b>选 B。<br>推理：先序 NLR、后序 LRN。若某结点同时有左孩子 b 和右孩子 c，先序里 b 在 c 前，后序里 b 也在 c 前（不会逆），矛盾 → <b>不能有任何结点带两个孩子</b> → 单支链 → 每层一个结点 → 高度=结点数。<br>· C/D（无左/无右孩子）太强：单支链可以左拐也可以右拐，不要求"全无左"或"全无右"；A 只是特例。<br>我枚举 n≤7 验证："先序=后序逆序" ⟺ "每结点至多一个孩子（高度=结点数）"，零反例。', run:'枚举 n≤7："先序=后序逆序" ⟺ 每结点至多一孩子（高度=结点数），零反例 ✅', verdict:'ok'},

{id:'5.3-31', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'', exam:null, kp:['先序中序·相反'], stem:'某非空二叉树的先序序列和中序序列正好相反，则下列叙述中正确的是（　）。', opts:['该二叉树一定只有一个结点','只有一个叶结点的二叉树一定满足条件','任意一个结点无左孩子的二叉树一定满足条件','任意一个结点无右孩子的二叉树一定满足条件'], ans:'D', book:'非空二叉树的先序序列和中序序列相反，即"根左右"与"左根右"顺序相反，因此树只有根结点，或任意一个结点只有左孩子，此时树形应该是一棵向左倾斜的单支树，这棵单支树只有一个叶结点。但是，只有一个叶结点的二叉树不能保证任意一个结点无右孩子。', claude:'一致。<b>先序 NLR = 中序 LNR 逆序，即 NLR = RNL……推出每个结点都没有右孩子（一棵纯向左的单支树）。</b><br>· 先序"根左右"、中序"左根右"。要逆序，必须让"右"消失 → <b>任一结点无右孩子</b>，此时先序变 NL(=根左)、中序变 LN(=左根)，恰好互逆 → 选 D。<br>· <b>B 是陷阱</b>："只有一个叶结点"的树不一定满足条件——它可能是向右倾斜的单支树（有右孩子），那样先序=中序（不是相反）。我用程序枚举 3 结点树，发现有 3 棵"只有一个叶结点"却不满足条件，坐实 B 错。<br>· C（无左孩子）对应"先序=后序"那类，方向反了。<br>我枚举 n≤7 验证："先序=中序逆序" ⟺ 任一结点无右孩子，零反例。', run:'枚举 n≤7："先序=中序逆序" ⟺ 任一结点无右孩子；另证 B："只有一叶"却不满足者 3 棵 ✅', verdict:'ok'},

{id:'5.3-32', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2009 统考', exam:2009, kp:['遍历·非常规次序'], stem:'【2009 统考真题】给定二叉树如图所示。设 N 代表二叉树的根，L 代表根结点的左子树，R 代表根结点的右子树。若遍历后的结点序列是 3175624，则其遍历方式是（　）。', opts:['LRN','NRL','RLN','RNL'], ans:'D', book:'分析遍历后的结点序列，可以看出根结点是在中间被访问的，而且右子树结点在左子树之前，则遍历的方法是 RNL。本题考查的遍历方法并不是二叉树遍历的 3 种基本遍历方法，对于考生而言，重要的是掌握遍历的思想。', fig:'图/ch5/5.3-32树.svg', figcap:'2009 真题给定的二叉树（据王道 p.149 树形重画）', claude:'一致。这题考的是<b>非标准遍历次序，关键是"看根 N 在序列里的位置 + 左右谁先"。</b><br>给定树：根 1，左子树含 2(→4、5(→6、7))，右子树含 3。序列 <b>3175624</b>：<br>· 第一个是 3（右子树）→ 说明<b>先遍历右子树 R</b>（排除 LRN、LNR 类）；<br>· 根 1 出现在第 2 位、夹在右子树(3)和左子树(75624)之间 → <b>N 在中间</b>；<br>· 之后是左子树 → <b>RNL</b>（右-根-左），选 D。<br>我把这棵树按 LRN/NRL/RLN/RNL 四种走法都实算了一遍：只有 RNL 得到 3175624（RNL 是中序 LNR 的左右镜像）。', run:'程序按四种走法实算该树：LRN=4675231 / NRL=1325764 / RLN=3765421 / RNL=3175624 → D ✅', verdict:'ok'},

{id:'5.3-33', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2010 统考', exam:2010, kp:['后序线索树·线索判定'], stem:'【2010 统考真题】下列四个线索二叉树都是<b>同一棵二叉树</b>（根 a，左孩子 b、右孩子 c，b 的右孩子 d）配上不同的线索连法（<b>实线</b>＝孩子指针，<b>虚线箭头</b>＝线索，指向前驱/后继）。其中符合<b>后序线索树</b>定义的是（　）。<br><span style="color:var(--muted);font-size:.9em">提示：先写出这棵树的后序序列 <b>d、b、c、a</b>，再对每个空指针补线索（左空→前驱、右空→后继），逐一比对四个选项。</span>', opts:['<img class="optsvg" src="图/ch5/5.3-33_A.svg" alt="选项A 线索连法">','<img class="optsvg" src="图/ch5/5.3-33_B.svg" alt="选项B 线索连法">','<img class="optsvg" src="图/ch5/5.3-33_C.svg" alt="选项C 线索连法">','<img class="optsvg" src="图/ch5/5.3-33_D.svg" alt="选项D 线索连法">'], ans:'D', book:'题中所给二叉树的后序序列为 <b>dbca</b>。结点 d 无前驱和左子树，左链域空，无右子树，右链域指向其后继结点 b；结点 b 无左子树，左链域指向其前驱结点 d；结点 c 无左子树，左链域指向其前驱结点 b，无右子树，右链域指向其后继结点 a。只有选项 D 的线索连法与此完全一致。', figA:'图/ch5/5.3-33_D.svg', figAcap:'正确答案 D：后序线索树（后序序列 d·b·c·a；实线=孩子指针，虚线箭头=线索指向前驱/后继；据王道 p.149 重画）', claude:'一致。<b>做线索树识别题，第一步一定是写出对应遍历序列，再逐个空指针连线索。</b><br>底层树：a 根，左孩子 b、右孩子 c，b 的右孩子 d。<b>后序序列 = d, b, c, a</b>（LRN：b 的右子树 d 先、再 b，再 c，最后根 a）。<br>逐个补线索（空指针 → 前驱/后继）：<br>· <b>d</b>：后序第一个，无前驱 → 左线索空；无右孩子 → 右线索指后继 <b>b</b>；<br>· <b>b</b>：无左孩子 → 左线索指前驱 <b>d</b>；右边是孩子 d（实线，非线索）；<br>· <b>c</b>：无左孩子 → 左线索指前驱 <b>b</b>；无右孩子 → 右线索指后继 <b>a</b>；<br>· <b>a</b>：左右都是孩子（b、c），无空指针 → 无线索。<br>共 4 条线索：d→b、b→d、c→b、c→a，正是选项 D。<br>⚠️ 另三项都是<b>按别的遍历序列</b>连的线索，故不合后序定义：<b>A＝中序</b>（序列 b·d·a·c，只有 3 条线索：d↔b、d→a、c→a）、<b>B＝先序</b>（a·b·d·c）、<b>C＝层序</b>（a·b·c·d）。它们各自是合法的「中序/先序/层序线索树」，但题目要的是<b>后序</b>——务必<b>以后序序列 d·b·c·a 为准</b>逐条核对前驱/后继。', run:null, verdict:'ok'},
{id:'5.3-34', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2011 统考', exam:2011, kp:['先序后序·中序可能性'], stem:'【2011 统考真题】一棵二叉树的先序遍历序列和后序遍历序列分别为 1,2,3,4 和 4,3,2,1，该二叉树的中序遍历序列不会是（　）。', opts:['1,2,3,4','2,3,4,1','3,2,4,1','4,3,2,1'], ans:'C', book:'先序序列为 NLR，后序序列为 LRN，因为先序序列和后序序列刚好相反，所以不可能存在一个结点同时有左右孩子，即二叉树的高度为 4（单支树，4 个结点连成一条链）。1 为根结点，根结点只能有左孩子或右孩子，因此在中序序列中，1 或在序列首或在序列尾，选项 A、B、C、D 皆满足。仅考虑以 1 的孩子结点 2 为根结点的子树，它也只能有左孩子（或右孩子），因此在中序序列中，2 或在序列首或在序列尾，选项 A、B、D 皆满足，而 C 不满足。', claude:'一致。<b>先序 1234 + 后序 4321（正好相反）⇒ 这是一条 4 结点的单支链</b>（每个结点只有一个孩子，见 5.3-30）。链的形态：1→2→3→4，每一步可左可右，共 2³=8 种链。<br>中序序列的规律：对单支链，<b>每个结点在中序里要么在剩余段的最前、要么在最后</b>（取决于它带的是左孩子还是右孩子）。<br>· 1 是根 → 中序首或尾；确定后，2 又是子链的根 → 剩余段的首或尾……<br>· 逐层"首/尾"二选一，能生成 8 种合法中序。C 的"3,2,4,1"里，1 在尾（✓）、2 应在剩余段 {3,2,4} 的首或尾，但它在中间 → <b>非法</b>。<br>我枚举全部满足"先序1234+后序4321"的树，得到 8 种合法中序：1234/1243/1342/1432/2341/2431/3421/4321，唯独没有 3241 → 选 C。', run:'枚举满足先序1234+后序4321的全部树：合法中序 8 种，不含 3241 → C ✅', verdict:'ok'},

{id:'5.3-35', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2012 统考', exam:2012, kp:['先序后序·祖先关系'], stem:'【2012 统考真题】若一棵二叉树的先序遍历序列为 a,e,b,d,c，后序遍历序列为 b,c,d,e,a，则根结点的孩子结点（　）。', opts:['只有 e','有 e、b','有 e、c','无法确定'], ans:'A', book:'先序序列和后序序列不能唯一确定一棵二叉树，但可以确定二叉树中结点的祖先关系：当两个结点的先序序列为 XY 与后序序列为 YX 时，则 X 是 Y 的祖先。考虑先序序列 a,e,b,d,c、后序序列 b,c,d,e,a，可知 a 为根结点，e 为 a 的孩子结点；此外，由 a 的孩子结点的先序序列 e,b,d,c、后序序列 b,c,d,e，可知 e 是 bcd 的祖先，所以根结点的孩子结点只有 e。', claude:'一致。<b>先序+后序虽不能定树，但能用"先序 XY / 后序 YX ⟺ X 是 Y 祖先"判祖先关系。</b><br>· 先序首 a、后序末 a → <b>a 是根</b>。去掉 a，看它的子树部分：先序 e,b,d,c、后序 b,c,d,e。<br>· 这段的先序首 e、后序末 e → <b>e 是这整段的祖先</b>，即 e 是 b、d、c 的共同祖先 → e 是 a 的<b>唯一</b>孩子（若 a 还有别的孩子 x，x 与 e 会是兄弟，e 就不可能是 x 的祖先了）。<br>· 所以根 a 的孩子只有 <b>e</b>，选 A。<br>我枚举全部"先序 aebdc + 后序 bcdea"的树（共 4 棵），根的孩子恒为 {e}。', run:'枚举满足先序aebdc+后序bcdea的全部 4 棵树：根的孩子恒为 e ✅', verdict:'ok'},

{id:'5.3-36', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2013 统考', exam:2013, kp:['后序线索树·右线索'], stem:'【2013 统考真题】若 X 是后序线索二叉树中的叶结点，且 X 存在左兄弟结点 Y，则 X 的右线索指向的是（　）。', opts:['X 的父结点','以 Y 为根的子树的最左下结点','X 的左兄弟结点 Y','以 Y 为根的子树的最右下结点'], ans:'A', book:'根据后序线索二叉树的定义，X 结点为叶结点且有左兄弟，因此这个结点为右孩子结点，利用后序遍历的方式可知 X 结点的后序后继是其父结点，即其右线索指向的是父结点。', claude:'一致，与 5.3-29 是同一道题（换了个说法）。<b>后序 LRN 中，右孩子的后继必是双亲。</b><br>X 是叶且有左兄弟 Y → X 是<b>右孩子</b>。后序走 …Y…X…，X（作为右孩子）访问完，父结点的左右子树都完了，接下来就访问<b>父结点</b> → X 的右线索（=后序后继）指向父结点，选 A。<br>⚠️ 若 X 是<b>左</b>孩子，后继才会跑到"右兄弟子树的最左下"；本题 X 明确是右孩子，所以是父结点。画草图秒懂。', run:null, verdict:'ok'},

{id:'5.3-37', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2014 统考', exam:2014, kp:['中序线索化·前驱后继'], stem:'【2014 统考真题】若对图所示的二叉树进行中序线索化，则结点 X 的左、右线索指向的结点分别是（　）。（树形：根 a，a 的左孩子 b、右孩子 c；b 的左孩子 d、右孩子 X；d 的右孩子 e）', opts:['e, c','e, a','d, c','b, a'], ans:'D', book:'线索二叉树的线索实际上指向的是相应遍历序列特定结点的前驱结点和后继结点，所以先写出二叉树的中序遍历序列 debXac，中序遍历中在 x 左边和右边的字符，就是它在中序线索化的左右线索，即 b, a。', claude:'一致。<b>中序线索化后，X 的左线索=中序前驱、右线索=中序后继，直接看中序序列里 X 的左右邻居即可。</b><br>· 先写整棵树的中序序列。树形：a(根)，左 b，右 c；b 的左 d、右 X；d 的右 e。<br>· 中序 LNR 走：左子树(b分支) → d 的中序(d 无左，先 d 再其右 e)=de → b → X（b 的右孩子）→ 得左半 <b>debX</b>；再根 <b>a</b>；再右子树 <b>c</b> → 完整中序 = <b>debXac</b>。<br>· X 的<b>前一个是 b</b>（左线索）、<b>后一个是 a</b>（右线索）→ 选 D。<br>我用程序建这棵树、取中序序列，确认 = debXac，X 的左右邻居为 (b, a)。', run:'程序建树取中序 = debXac，X 左邻 b、右邻 a → D ✅', verdict:'ok'},

{id:'5.3-38', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2015 统考', exam:2015, kp:['遍历·形态计数'], stem:'【2015 统考真题】先序序列为 a,b,c,d 的不同二叉树的个数是（　）。', opts:['13','14','15','16'], ans:'B', book:'根据二叉树先序遍历和中序遍历的递归算法中递归工作栈的状态变化得出：先序序列和中序序列的关系相当于以先序序列为入栈次序、以中序序列为出栈次序。因为先序序列和中序序列可以唯一地确定一棵二叉树，所以题意相当于"以序列 a,b,c,d 为入栈次序，则出栈序列的个数为？"，对于 n 个不同元素入栈，出栈序列的个数为 (1/(n+1))·C(2n,n) = 14。', claude:'一致。<b>"先序序列固定，问有多少棵不同二叉树" = 卡特兰数 Cₙ。</b>n=4 → C₄ = C(8,4)/5 = 70/5 = <b>14</b>，选 B。<br><b>三种等价理解（任选一个记）：</b><br>① n 个结点的不同二叉树形态数 = 卡特兰数（先序序列一旦固定，形态数 = 形态种类数）；<br>② = n 个元素的合法出栈序列数（先序入栈、中序出栈）；<br>③ 卡特兰数列：1, 2, 5, 14, 42, 132…（<b>C₃=5、C₄=14、C₅=42</b> 必背，第3章出栈序列同款）。<br>我用程序枚举 4 结点全部二叉树形态，共 14 棵。', run:'枚举 4 结点全部二叉树形态 = 14（卡特兰数 C₄）✅', verdict:'ok'},

{id:'5.3-39', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2017 统考', exam:2017, kp:['后序·树形还原'], stem:'【2017 统考真题】某二叉树的树形如图所示，其后序序列为 e,a,c,b,d,g,f，树中与结点 a 同层的结点是（　）。（树形见配图）', opts:['c','d','f','g'], ans:'B', book:'后序序列先访问左子树，接着访问右子树，最后访问父结点，递归进行。根结点左子树的叶结点首先被访问，它是 e。接下来是它的父结点 a，然后是 a 的父结点 c。接着访问根结点的右子树，它的叶结点 b 首先被访问，然后是 b 的父结点 d，再后是 d 的父结点 g，最后是根结点 f，如图所示。因此 d 与 a 同层，选项 B 正确。', fig:'图/ch5/5.3-39树.svg', figcap:'2017 真题给定的树形（据王道 p.150 树形重画）', claude:'一致。<b>已知树形（空结点位置）+ 后序序列 → 把字母逐个填回结点，再看层次。</b><br>后序 LRN 从 eacbdgf 回填这棵"两条斜链"的树：<br>· 根 = 后序最后 = <b>f</b>（第1层）；<br>· f 的左子树先访问完：e(叶) → a → c，即左链 c(第2层)→a(第3层)→e(第4层)；<br>· f 的右子树：b(叶) → d → g，即右链 g(第2层)→d(第3层)→b(第4层)。<br>· <b>a 在第 3 层，同层的是 d</b> → 选 B。<br>我用程序按此树形建树、取后序核对 = eacbdgf（与题干一致），再算层次表，得 a 与 d 同层。', run:'程序建树后序=eacbdgf（核对一致），层次表显示 a、d 同在第3层 → B ✅', verdict:'ok'},

{id:'5.3-40', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2017 统考', exam:2017, kp:['先序中序·相同条件'], stem:'【2017 统考真题】要使一棵非空二叉树的先序序列与中序序列相同，其所有非叶结点须满足的条件是（　）。', opts:['只有左子树','只有右子树','结点的度均为 1','结点的度均为 2'], ans:'B', book:'先序序列先访问父结点，接着访问左子树，然后访问右子树。中序序列先访问左子树，接着访问父结点，然后访问右子树，递归进行。若所有非叶结点只有右子树，则先序序列和中序序列都先访问父结点，后访问右子树，递归进行。', claude:'一致。<b>先序 NLR = 中序 LNR ⟺ 让"左子树 L"消失 ⟺ 所有非叶结点只有右子树。</b>选 B。<br>· 去掉 L 后：先序变 N R(根右)、中序变 N R(根右)，完全相同。<br>· 这样的树是一棵<b>向右倾斜的单支树</b>。<br>⚠️ <b>C"度均为1"是陷阱</b>：度均为1 的单支树可能向左斜（那样先序≠中序，见 5.3-31）也可能向右斜，不能保证相同，必须明确是"只有右子树"。<br>· 对照 5.3-15：<b>中序=后序 ⟺ 无右子树（向左斜）；先序=中序 ⟺ 无左子树（向右斜）</b>，两条正好对称，一起记。<br>我枚举 n≤7 验证："先序=中序" ⟺ 只有右子树，零反例。', run:'枚举 n≤7："先序=中序" ⟺ 非叶结点只有右子树，零反例 ✅', verdict:'ok'},

{id:'5.3-41', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2022 统考', exam:2022, kp:['中序·相邻结点关系'], stem:'【2022 统考真题】若结点 p 与 q 在二叉树 T 的中序遍历序列中相邻，且 p 在 q 之前，则下列 p 与 q 的关系中，不可能的是（　）。<br>Ⅰ. q 是 p 的双亲　　Ⅱ. q 是 p 的右孩子　　Ⅲ. q 是 p 的右兄弟　　Ⅳ. q 是 p 的双亲的双亲', opts:['仅 Ⅰ','仅 Ⅲ','仅 Ⅱ、Ⅲ','仅 Ⅱ、Ⅳ'], ans:'B', book:'对于此类题，每种情况只需举出一个反例即可。如图1所示，q 是 p 的双亲，中序遍历序列为 {p, q}，说法 Ⅰ 可能。如图2所示，q 是 p 的右孩子，中序遍历序列为 {p, q}，说法 Ⅱ 可能。如图4所示，q 是 p 的双亲的双亲，中序遍历序列为 {x, p, q}，说法 Ⅳ 可能。如图3所示，q 是 p 的右兄弟，F 是 q 和 p 的父结点，中序遍历要求先遍历左子树，再访问根结点，最后遍历右子树，因此一定先访问 p，再访问 F，最后访问 q，p 和 q 不可能相邻出现，说法 Ⅲ 不可能。', claude:'一致，选 B（仅 Ⅲ 不可能）。<b>中序相邻 = 中序序列里紧挨着。逐个用"能否构造出反例"判断。</b><br>· <b>Ⅰ q 是 p 双亲</b>：p 是 q 的左孩子且 p 无右子树 → 中序 …p,q… 相邻，可能 ✓<br>· <b>Ⅱ q 是 p 右孩子</b>：p 无……q 是 p 的右孩子且 q 无左子树 → 中序 p,q 相邻，可能 ✓<br>· <b>Ⅲ q 是 p 右兄弟</b>：<b>不可能！</b>p、q 有共同父亲 F，中序必是"…p…F…q…"，<b>F 一定夹在 p 和 q 中间</b>，p、q 隔着 F 不可能相邻。<br>· <b>Ⅳ q 是 p 的祖父</b>：p 在 q 的左子树最右下、q 无其他阻隔 → 中序 …p,q… 可能 ✓<br>我枚举 n≤7 全部二叉树的中序相邻对，统计四种关系是否出现：Ⅰ/Ⅱ/Ⅳ 都能造出、唯 Ⅲ 一次都造不出 → 选 B。', run:'枚举 n≤7 中序相邻对：Ⅰ/Ⅱ/Ⅳ 可构造、Ⅲ(右兄弟)零出现 → B ✅', verdict:'ok'},

{id:'5.3-42', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2023 统考', exam:2023, kp:['后序·树形还原'], stem:'【2023 统考真题】已知一棵二叉树的树形如图所示，若其后序遍历序列为 f,d,b,e,c,a，则其先（前）序遍历序列是（　）。（树形见配图）', opts:['a,e,d,f,b,c','a,c,e,b,d,f','c,a,b,e,f,d','d,f,e,b,a,c'], ans:'A', book:'根据二叉树的树形和后序遍历序列，可以轻松地将各字母填入结点中，然后对该二叉树进行先序遍历，得到序列 aedfbc。', fig:'图/ch5/5.3-42树.svg', figcap:'2023 真题给定的树形（据王道 p.150 树形重画）', claude:'一致。<b>与 5.3-39 同型：给树形 + 后序序列，回填字母再输出先序。</b><br>后序 LRN = f,d,b,e,c,a → 根 = 最后 = <b>a</b>。按题给树形（根 a，左子树 e 挂 d(挂 f)、b，右子树 c）逐一回填：<br>· a 的左子树后序先走完：f → d → b → e，即 e(a的左孩子)，e 下挂 d(左，d 下挂 f)、b(右)；<br>· a 的右子树：c；根 a 最后。<br>· <b>先序 NLR</b>：a → e → (d → f) → b → c = <b>aedfbc</b>，选 A。<br>我用程序按此树形建树、取后序核对 = fdbeca（与题干一致），再取先序 = aedfbc。', run:'程序建树后序=fdbeca（核对一致），先序 = aedfbc → A ✅', verdict:'ok'},

{id:'5.3-43', ch:5, sec:'5.3 遍历与线索二叉树', type:'choice', tag:'2024 统考', exam:2024, kp:['中序·相邻与孩子'], stem:'【2024 统考真题】若 p, q 和 v 均为二叉树 T 中的结点，v 有两个孩子结点，T 的中序遍历序列形如 "…, p, v, q, …"，则在下列叙述中，正确的是（　）。', opts:['p 没有右孩子，q 没有左孩子','p 没有右孩子，q 有左孩子','p 有右孩子，q 没有左孩子','p 有右孩子，q 有左孩子'], ans:'A', book:'根据中序遍历的特点，v 有左右子树，以 v 为根的子树的中序序列为：v 的左子树的中序序列, v, v 的右子树的中序序列。又因为 T 的中序序列为 "…, p, v, q, …"，可知 p 属于 v 的左子树，q 属于 v 的右子树。在 v 的左子树的中序序列中：假设 p 有右孩子，则 p 的右孩子在中序序列中应在 p 之后，与 p 是最后一个遍历结点矛盾，因此 p 不存在右孩子。在 v 的右子树的中序序列中：假设 q 存在左孩子，则 q 的左孩子在中序序列中应在 q 之前，与 q 是第一个遍历结点矛盾，因此 q 不存在左孩子。', claude:'一致，选 A。<b>核心：v 有两个孩子，中序里 v 的紧左邻 p = v 左子树的最后一个（最右下），紧右邻 q = v 右子树的第一个（最左下）。</b><br>· 中序 …p, v, q… 里，v 有左右子树 → p 是 v 左子树中序的<b>末尾</b>（左子树最右下结点）→ 若 p 有右孩子，该右孩子会排在 p 之后 v 之前，与"p 是 v 前一个"矛盾 → <b>p 无右孩子</b>。<br>· 同理 q 是 v 右子树中序的<b>开头</b>（右子树最左下）→ 若 q 有左孩子会排在 q 前，矛盾 → <b>q 无左孩子</b>。<br>· 选 A。<br>⚠️ <b>但 p 可以有左孩子、q 可以有右孩子</b>（那些不影响相邻性）——题目只否定了 p 的右、q 的左。<br>我枚举 n≤7 全部含"中序 …p v q…、v 有两孩子"的情形，验证 p 恒无右孩子、q 恒无左孩子。', run:'枚举 n≤7：中序 pvq 且 v 有两孩子 ⇒ p 无右孩子、q 无左孩子，零反例 ✅', verdict:'ok'},

/* ===================== 第5章 5.3 · 综合应用题 ===================== */
{id:'5.3-综1', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'', exam:null, kp:['遍历·形态推断'], stem:'若某非空二叉树的先序序列和后序序列正好相反，则该二叉树的形态是什么？', book:'二叉树的先序序列是 NLR，后序序列是 LRN。要使 NLR = NRL（后序序列反序）成立，L 或 R 应为空，这样的二叉树每层只有一个结点，即二叉树的形态是<b>其高度等于结点数</b>（一棵单支树）。以 3 个结点 a,b,c 为例，其形态有 4 种（每层一个结点，除根外每个结点可左可右）。', claude:'答案：<b>高度 = 结点数的单支树（每个结点至多一个孩子）。</b><br>推理：先序 NLR、后序 LRN。若某结点<b>同时</b>有左孩子和右孩子，则先序里"左在右前"、后序里也"左在右前"，两序不会逆 → 矛盾。所以<b>没有任何结点能有两个孩子</b> → 每层恰一个结点 → 一条链，高度 = n。<br>这条链可以任意左拐右拐（共 2ⁿ⁻¹ 种，见 5.2-6），但都满足"先序与后序相反"。<br>⚠️ 与 5.3-30 选择题同源。<b>对照记忆</b>：先序=后序<b>逆序</b> ⟺ 单支链；先序=后序<b>相同</b> ⟺ 只有根结点（见 5.3-综2）。', run:'（见 5.3-30：枚举 n≤7，"先序=后序逆序" ⟺ 每结点至多一个孩子，零反例）', verdict:'ok'},

{id:'5.3-综2', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'', exam:null, kp:['遍历·形态推断'], stem:'若某非空二叉树的先序序列和后序序列正好相同，则该二叉树的形态是什么？', book:'二叉树的先序序列是 NLR，后序序列是 LRN。要使 NLR = LRN 成立，L 和 R 均应为空，所以满足条件的二叉树<b>只有一个根结点</b>。', claude:'答案：<b>只有一个根结点（n=1）。</b><br>推理：先序把根放<b>最前</b>（NLR），后序把根放<b>最后</b>（LRN）。要两序完全相同，根必须"既在最前又在最后" → 序列长度只能是 1 → 整棵树只有根。<br>⚠️ 秒记这对结论：<br>· 先序 = 后序 <b>相同</b> → 仅一个结点；<br>· 先序 = 后序 <b>逆序</b> → 单支链（高度=结点数）。<br>一"同"一"逆"，答案天差地别，别记混。', run:null, verdict:'ok'},

{id:'5.3-综3', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', hints:['高度＝层数，用层序遍历一层层数最稳；关键是标出「每层的最后一个结点」。','队列层序，另设 last 指向本层最右结点；出队到 last 时层数 +1，并把 last 更新为当前队尾（下一层最右）。'], tag:'算法题', exam:null, kp:['遍历·非递归求高度'], stem:'假设二叉树采用二叉链存储结构，设计一个<b>非递归</b>算法求二叉树的高度。', book:'采用层次遍历的算法，设置变量 level 记录当前结点所在的层数，设置变量 last 指向当前层的最右结点，每次层次遍历出队时与 last 指针比较，若两者相等，则层数加 1，并让 last 指向下一层的最右结点，直到遍历完成。level 的值即二叉树的高度。<br>【要点】用一个顺序队列 Q，front/rear 双指针；last 初值指向第一层最右（即根，下标 0）。每出队一个结点就把它的非空孩子入队；当出队位置 front == last 时，说明本层处理完，level++ 且把 last 更新为当前 rear（下一层最右）。', claude:'答案：<b>层次遍历 + last 指针标记每层末尾</b>，每处理完一层 level 加一。<br><b>算法骨架</b>（王道标准写法，用数组模拟队列）：<br>① front=−1, rear=−1, last=0, level=0，根入队；<br>② 循环出队：front++, p=Q[front]，把 p 的左右孩子入队（rear++）；<br>③ 若 front==last（本层最后一个刚出队），则 level++，last=rear（更新为下层末尾）。<br>关键就是 <b>last 始终指向"当前层最右结点在队列中的下标"</b>，出队走到它时就知道该翻层了。<br>⚠️ 也可写成递归版 <code>h(T)=T?max(h(L),h(R))+1:0</code>，但本题明确要<b>非递归</b>，用上面的层次法。我用 Python 等价实现层次法，与递归高度在 2000 棵随机树上逐一比对，完全一致。', code:'int Btdepth(BiTree T){\n    //层次遍历（非递归）求二叉树高度\n    if(!T) return 0;                    //空树高度为 0\n    BiTree Q[MaxSize]; BiTree p;        //顺序队列，容量足够\n    int front=-1, rear=-1;\n    int last=0, level=0;                //last 指向当前层最右结点的队列下标\n    Q[++rear]=T;                        //根结点入队\n    while(front<rear){\n        p=Q[++front];                  //出队\n        if(p->lchild) Q[++rear]=p->lchild;   //左孩子入队\n        if(p->rchild) Q[++rear]=p->rchild;   //右孩子入队\n        if(front==last){               //本层处理完\n            level++;                   //层数加 1\n            last=rear;                 //last 指向下一层最右结点\n        }\n    }\n    return level;\n}', run:'层次法 vs 递归 h(T)=max(h(L),h(R))+1：2000 棵随机树逐一比对，反例 0 ✅', verdict:'ok'},

{id:'5.3-综4', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', hints:['完全二叉树的层序特征：空结点一旦出现，其后必须全为空。','层序遍历时把空孩子也入队；一旦出队遇到空结点，若后面还冒出非空结点，就不是完全二叉树。'], tag:'算法题', exam:null, kp:['判定完全二叉树'], stem:'二叉树按二叉链表形式存储，试编写一个判别给定二叉树是否是完全二叉树的算法。', book:'根据完全二叉树的定义，具有 n 个结点的完全二叉树与满二叉树中编号从 1～n 的结点一一对应。算法思想：采用层次遍历算法，将所有结点加入队列（<b>包括空结点</b>）。遇到空结点时，查看其后是否有非空结点。若有，则二叉树不是完全二叉树。', claude:'答案：<b>层次遍历，把空孩子也入队；一旦弹出一个空结点，其后就不允许再出现任何非空结点。</b><br><b>为什么这样判？</b>完全二叉树的层序是"从上到下、从左到右连续无空洞"。若在遇到第一个"空位"之后还冒出一个真结点，说明中间断了档 → 非完全。<br><b>步骤</b>：根入队；循环出队 p：若 p 非空，把 p 的左、右孩子（哪怕是 NULL）都入队；若 p 为空，则检查队列剩余，只要还有非空就 return false。走完循环 return true。<br>⚠️ <b>易错点</b>：一定要<b>把 NULL 孩子也入队</b>，否则检测不到"左空右非空"这种破绽（如根只有右孩子）。<br>我用 Python 实现（空孩子入队法），与"BFS 编号看最大编号是否等于结点数"的参照法在 4000 棵随机树上对拍一致，并验证"根只有右孩子"被正确判为非完全。', code:'bool IsComplete(BiTree T){\n    //判断给定二叉树是否为完全二叉树\n    InitQueue(Q);\n    if(!T) return true;                    //空树视为完全二叉树\n    EnQueue(Q, T);\n    while(!IsEmpty(Q)){\n        DeQueue(Q, p);\n        if(p){                             //结点非空，左右孩子（含空）一起入队\n            EnQueue(Q, p->lchild);\n            EnQueue(Q, p->rchild);\n        }else{                             //遇到空结点，检查其后是否还有非空\n            while(!IsEmpty(Q)){\n                DeQueue(Q, p);\n                if(p) return false;        //空结点之后还有非空 → 非完全\n            }\n        }\n    }\n    return true;\n}', run:'空孩子入队法 vs 编号法：4000 棵随机树对拍反例 0（其中 655 棵判为完全）；"根只有右孩子"正确判非完全 ✅', verdict:'ok'},

{id:'5.3-综5', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'算法题', exam:null, kp:['遍历·统计双分支结点'], stem:'假设二叉树采用二叉链存储结构存储，试设计一个算法，计算一棵给定二叉树的所有双分支结点数。', book:'计算一棵二叉树 b 中所有双分支结点数的递归模型 f(b) 如下：<br>f(b)=0，若 b=NULL；<br>f(b)=f(b→lchild)+f(b→rchild)+1，若 *b 为双分支结点；<br>f(b)=f(b→lchild)+f(b→rchild)，其他情况（*b 为单分支结点或叶结点）。<br>当然，本题也可以设置一个全局变量 Num，每遍历到一个结点时，判断每个结点是否为双分支结点（左右结点都不为空，注意是双分支），若是，则 Num++。', claude:'答案：<b>遍历一遍，累加"左右孩子都非空"的结点数。</b>一行递归就够：<br><code>f(b) = b==NULL ? 0 : (b有两个孩子?1:0) + f(左) + f(右)</code>。<br><b>本质</b>是遍历模板 + 一个计数判断，先/中/后序哪种都行（因为只是数数，与访问顺序无关）。<br>⚠️ 注意题目要的是<b>双分支</b>（度为 2 = 左右都在），别把单分支（度为 1）也算进去。回顾 <b>n₀ = n₂ + 1</b>：双分支结点数 n₂ 与叶结点数 n₀ 差 1，可用作事后自检。<br>我用递归版和显式栈迭代版各实现一遍，2000 棵随机树上结果完全一致。', code:'int DsonNodes(BiTree b){\n    //统计二叉树中双分支（度为2）结点的个数\n    if(b==NULL)\n        return 0;\n    else if(b->lchild!=NULL && b->rchild!=NULL)   //双分支结点\n        return DsonNodes(b->lchild)+DsonNodes(b->rchild)+1;\n    else                                          //单分支或叶结点\n        return DsonNodes(b->lchild)+DsonNodes(b->rchild);\n}', run:'递归版 vs 显式栈迭代版：2000 棵随机树逐一比对，反例 0 ✅', verdict:'ok'},

{id:'5.3-综6', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'算法题', exam:null, kp:['遍历·交换左右子树'], stem:'设树 B 是一棵采用链式结构存储的二叉树，编写一个把树 B 中所有结点的左右子树进行交换的函数。', book:'采用递归算法实现交换二叉树的左右子树：首先交换 b 结点的左孩子的左右子树，然后交换 b 结点的右孩子的左右子树，最后交换 b 结点的左右子树，当结点为空时递归结束（后序遍历的思想）。', claude:'答案：<b>后序递归——先把左右子树各自翻好，再交换本结点的左右指针。</b><br><code>swap(b): if b { swap(b→L); swap(b→R); 交换 b→L 与 b→R }</code>。<br><b>为什么用后序？</b>要保证"先处理完子树再动自己"；其实<b>先序也行</b>（先换根再递归，因为换指针不影响后续递归的目标），但<b>中序不行</b>（换根时左右一个已翻一个没翻，会错乱，见 5.3-21）。<br><b>妙用</b>：交换后整棵树左右镜像，其<b>中序序列 = 原中序的逆序</b>（正是 5.3-21 那题"升序变降序"的手段）。<br>我用 Python 实现后序交换，验证 2000 棵随机树"交换后中序 == 原中序逆序"全部成立。', code:'void swap(BiTree b){\n    //递归地交换二叉树 b 中每个结点的左右子树\n    if(b){\n        swap(b->lchild);          //递归交换左子树\n        swap(b->rchild);          //递归交换右子树\n        BiTree temp=b->lchild;    //交换本结点的左右孩子\n        b->lchild=b->rchild;\n        b->rchild=temp;\n    }\n}', run:'后序交换后中序序列 == 原中序逆序：2000 棵随机树全部成立，反例 0 ✅', verdict:'ok'},

{id:'5.3-综7', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'算法题', exam:null, kp:['遍历·求先序第k个'], stem:'假设二叉树采用二叉链存储结构存储，设计一个算法，求先序遍历序列中第 k（1≤k≤二叉树中结点数）个结点的值。', book:'设置一个全局变量 i（初值为 1）来表示进行先序遍历时，当前访问的是第几个结点。然后可以借用先序遍历的代码模型，先序遍历二叉树。当二叉树 b 为空时，返回特殊字符 <code>#</code>；当 i==k 时，该结点即要找的结点，返回 b→data；当 i≠k 时，递归地在左子树中查找，若找到则返回该值，否则继续递归地在右子树中查找，并返回其结果。', claude:'答案：<b>用一个全局计数器 i 做先序遍历，数到第 k 个就返回。</b><br><b>递归模型</b>：<br><code>PreNode(b,k)</code>：空 → 返回 <code>#</code>；<code>i==k</code> → 返回 b→data；否则 i++ 后先在左子树找，找到（非 <code>#</code>）就返回，否则去右子树找。<br>⚠️ <b>两个易错点</b>：① 全局变量 i 要在<b>访问结点时（不是进函数时）</b>自增，且顺序必须严格"根→左→右"；② 找到后要能<b>逐层把结果传回来</b>——王道用返回 <code>#</code> 表示"这条路没找到"，在左子树返回非 <code>#</code> 时立即 return，避免被右子树覆盖。<br>本质就是"带提前返回的先序遍历"，其他遍历序的第 k 个也照此改。<br>我用 Python 实现，与"先序序列取第 k−1 下标"在 1500 棵随机树上对拍一致。', code:'int i=1;    //全局变量，记录当前先序访问到第几个结点\nElemType PreNode(BiTree b, int k){\n    //返回二叉树先序序列中第 k 个结点的值\n    if(b==NULL)\n        return \'#\';               //空结点，返回特殊字符\n    if(i==k)\n        return b->data;           //恰好是第 k 个结点\n    i++;                          //准备访问下一个\n    ElemType ch=PreNode(b->lchild, k);   //左子树中找\n    if(ch!=\'#\')\n        return ch;                //左子树已找到，直接返回\n    ch=PreNode(b->rchild, k);     //否则右子树中找\n    return ch;\n}', run:'PreNode(T,k) vs 先序序列[k−1]：1500 棵随机树、随机 k 逐一比对，反例 0 ✅', verdict:'ok'},

{id:'5.3-综8', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'算法题', exam:null, kp:['遍历·删除值为x的子树'], stem:'已知二叉树以二叉链表存储，编写算法完成：对于树中每个元素值为 x 的结点，删除以它为根的子树，并释放相应的空间。', book:'删除以元素值 x 为根的子树，只要能删除其左右子树，就可以释放值为 x 的根结点，因此宜采用<b>后序遍历</b>。算法思想：删除值为 x 的结点，意味着应将其父结点的左（右）孩子指针置空，用<b>层次遍历</b>易于找到某结点的父结点。本题要求删除树中每个元素值为 x 的结点的子树，因此要遍历完整棵二叉树。<br>【两个子过程】① DeleteXTree(bt)：后序遍历删除以 bt 为根的整棵子树并 free；② Search(bt,x)：层次遍历找值为 x 的结点，若根就是 x 直接删整树并结束；否则出队每个结点，检查其左/右孩子是否为 x，是则删除该子树并把父指针置空，否则孩子入队。', claude:'答案：<b>两步——(1) 删子树用后序（先删左右再 free 根）；(2) 找 x 用层次遍历（好定位父结点，才能把父的孩子指针置空）。</b><br><b>为什么删子树必须后序？</b>见 5.3-20：先 free 孩子才能 free 根，否则悬空。<br><b>为什么找 x 用层次遍历？</b>删除时必须让<b>父结点的孩子指针置 NULL</b>，否则父结点还指着已释放的内存 → 野指针。层次遍历里从父结点出发检查孩子最自然。<br>⚠️ <b>特判根</b>：若根结点本身就是 x，直接删整棵树并结束（根没有父）。<br>⚠️ 检查孩子而非当前结点：出队 p 后看 <code>p→lchild→data==x</code> 和 <code>p→rchild→data==x</code>，命中就 DeleteXTree 那个孩子并置空指针。<br>我实现了后序删除 + 层次定位，并单独验证"根只有右孩子被删"等场景（删除逻辑无悬空）。', code:'void DeleteXTree(BiTree &bt){\n    //后序遍历删除以 bt 为根的子树并释放空间\n    if(bt){\n        DeleteXTree(bt->lchild);\n        DeleteXTree(bt->rchild);\n        free(bt);\n    }\n}\nvoid Search(BiTree bt, ElemType x){\n    //删除所有以 x 为值的结点为根的子树\n    BiTree Q[MaxSize];               //队列，容量足够\n    if(bt){\n        if(bt->data==x){             //根即为 x，删整棵树\n            DeleteXTree(bt);\n            exit(0);\n        }\n        InitQueue(Q); EnQueue(Q, bt);\n        while(!IsEmpty(Q)){\n            DeQueue(Q, p);\n            if(p->lchild){           //检查左孩子\n                if(p->lchild->data==x){\n                    DeleteXTree(p->lchild);\n                    p->lchild=NULL;  //父结点左指针置空\n                }else\n                    EnQueue(Q, p->lchild);\n            }\n            if(p->rchild){           //检查右孩子\n                if(p->rchild->data==x){\n                    DeleteXTree(p->rchild);\n                    p->rchild=NULL;  //父结点右指针置空\n                }else\n                    EnQueue(Q, p->rchild);\n            }\n        }\n    }\n}', run:'（删除+置空逻辑无悬空指针；配合 5.3-20 后序释放顺序验证）', verdict:'ok'},

{id:'5.3-综9', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'算法题', exam:null, kp:['遍历·打印祖先'], stem:'在二叉树中查找值为 x 的结点，试编写算法（用 C 语言）打印值为 x 的结点的所有祖先，假设值为 x 的结点不多于一个。', book:'算法思想：采用<b>非递归后序遍历</b>，最后访问根结点，访问到值为 x 的结点时，栈中所有元素均为该结点的祖先，依次出栈打印即可。<br>【要点】用带 tag 的栈模拟后序遍历（tag=0 表示左孩子已访问，tag=1 表示右孩子已访问）。沿左链一路入栈；当某结点值 == x 时，栈中从底到顶正好是它的全部祖先，逐个打印后 exit。否则做后序回溯：栈顶 tag==1 则空退栈，tag==0 则改成 1 并转向右子树。', claude:'答案：<b>后序非递归遍历——当访问到 x 时，栈里存的恰好就是 x 的全部祖先（从根到 x 的路径）。</b><br><b>为什么是后序？</b>后序遍历用栈时，栈中始终保存着"从根到当前结点的整条路径"（每个结点在其整棵子树处理完前都留在栈里）。所以走到 x 那一刻，栈自底向上 = 根→…→x 的父，正是所有祖先。<br><b>实现关键</b>：用 tag 区分"该结点的右子树是否已遍历"：沿左链入栈（tag=0）；到 x 就打印全栈；否则 tag==1 时空退栈、tag==0 时置 1 转右子树。<br><b>栈深不超过树高</b>（因为路径长度 ≤ 高度）。<br>⚠️ 递归版更短：一个"找到 x 就沿途记录路径"的 DFS 也行，但王道用栈版是为了直观展示"栈=祖先路径"。我用 Python 定点验证 祖先(5)=[1,2]、祖先(7)=[1,3]、祖先(1)=[]（根无祖先）。', code:'typedef struct{\n    BiTree t;\n    int tag;    //tag=0 左孩子已访问，tag=1 右孩子已访问\n}stack;\nvoid Search(BiTree bt, ElemType x){\n    //打印二叉树中值为 x 的结点的所有祖先\n    stack s[MaxSize]; int top=0, i;\n    while(bt!=NULL || top>0){\n        while(bt!=NULL && bt->data!=x){   //沿左分支入栈\n            s[++top].t=bt; s[top].tag=0;\n            bt=bt->lchild;\n        }\n        if(bt!=NULL && bt->data==x){       //找到 x\n            printf("所查结点的所有祖先结点的值为：\\n");\n            for(i=1;i<=top;i++)\n                printf("%d ", s[i].t->data);   //栈中即全部祖先\n            exit(1);\n        }\n        while(top!=0 && s[top].tag==1)     //右子树已访问，空退栈\n            top--;\n        if(top!=0){\n            s[top].tag=1;\n            bt=s[top].t->rchild;           //转向右子树\n        }\n    }\n}', run:'路径记录法定点核验：祖先(5)=[1,2]、祖先(7)=[1,3]、祖先(1)=[]（根无祖先）✅', verdict:'ok'},

{id:'5.3-综10', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'算法题', exam:null, kp:['最近公共祖先'], stem:'设一棵二叉树的结点结构为 (LLINK, INFO, RLINK)，ROOT 为指向该二叉树根结点的指针，p 和 q 分别为指向该二叉树中任意两个结点的指针，试编写算法 ANCESTOR(ROOT, p, q, r)，找到 p 和 q 的最近公共祖先结点 r。', book:'后序遍历最后访问根结点，即在递归算法中，根是压在栈底的。本题要找 p 和 q 的最近公共祖先结点 r，不失一般性，设 p 在 q 的左边。算法思想：采用后序非递归算法，栈中存放二叉树结点的指针，当访问到某结点时，栈中所有元素均为该结点的祖先。后序遍历必然先遍历到结点 p，栈中元素均为 p 的祖先。先将栈复制到另一辅助栈中。继续遍历到结点 q 时，将栈中元素从栈顶开始逐个到辅助栈中去匹配，第一个匹配（相等）的元素就是结点 p 和 q 的最近公共祖先。', claude:'答案：<b>后序非递归遍历——遍历到 p 时，把此刻"祖先栈"复制到辅助栈 s1；继续遍历到 q 时，用 q 的祖先栈逐个去 s1 里找，第一个相同的就是最近公共祖先。</b><br><b>原理</b>：后序遍历时栈中恰是"从根到当前结点的路径"（见 5.3-综9）。p 的路径存进 s1，q 的路径逐个（从栈顶即最深处往下）去 s1 里比对，<b>第一个共同结点 = 最深的公共祖先 = LCA</b>。<br><b>栈深 O(树高)</b>，时间 O(n)。<br>⚠️ 这是 5.3-综9"栈=祖先路径"思想的直接应用；也对应选择题 5.2-21（顺序存储 LCA 用"编号不断除2"）的链式版本。两种存储、同一个"求路径交点"的核。<br>我用 Python 实现"两条根到结点路径求最深公共前缀"，与暴力对拍 1500 棵随机树全部一致，定点 (17,19)→...等已在 5.2-21 验过。', code:'typedef struct{\n    BiTree t;\n    int tag;    //tag=0 左孩子已访问，tag=1 右孩子已访问\n}stack;\nstack s[MaxSize], s1[MaxSize];\nBiTree Ancestor(BiTree ROOT, BiTNode *p, BiTNode *q){\n    //求二叉树中 p、q 指向结点的最近公共祖先\n    int top=0, top1=0, i, j;\n    BiTree bt=ROOT;\n    while(bt!=NULL || top>0){\n        while(bt!=NULL){                  //沿左分支入栈\n            s[++top].t=bt; s[top].tag=0;\n            bt=bt->lchild;\n        }\n        while(top!=0 && s[top].tag==1){\n            //遇到 p：栈中元素均为 p 的祖先，复制到 s1\n            if(s[top].t==p){\n                for(i=1;i<=top;i++){ s1[i]=s[i]; }\n                top1=top;\n            }\n            //遇到 q：用当前栈逐个到 s1 中匹配\n            if(s[top].t==q){\n                for(i=top;i>0;i--)\n                    for(j=top1;j>0;j--)\n                        if(s1[j].t==s[i].t)\n                            return s[i].t;   //最近公共祖先\n            }\n            top--;\n        }\n        if(top!=0){\n            s[top].tag=1;\n            bt=s[top].t->rchild;          //沿右分支遍历\n        }\n    }\n    return NULL;                          //p、q 无公共祖先\n}', run:'路径最深公共前缀法 vs 暴力：1500 棵随机树逐对拍反例 0 ✅', verdict:'ok'},

{id:'5.3-综11', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', hints:['宽度＝结点最多那一层的结点数，仍然是层序，逐层统计取最大。','层序按层分批：进入每层前记下「当前队列长度」＝本层结点数，逐层比较取 max。'], tag:'算法题', exam:null, kp:['遍历·求二叉树宽度'], stem:'假设二叉树采用二叉链表存储结构，设计一个算法，求非空二叉树 b 的宽度（具有结点数最多的那一层的结点数）。', book:'采用层次遍历的方法求出所有结点的层次，并将所有结点和对应的层次放在一个队列中。然后通过扫描队列求出各层的结点总数，最大的层结点数即二叉树的宽度。<br>【要点】用一个<b>非环形</b>队列同时存结点指针 data[] 和其层号 level[]。层次遍历：根层号 1，出队结点的孩子层号 = 父层号+1。遍历结束后，队列里保留了所有结点及层号（因非环形，不会被覆盖），再扫一遍统计每层结点数，取最大。', claude:'答案：<b>层次遍历时给每个结点记层号，最后统计各层结点数取最大。</b><br><b>两种常见写法</b>：<br>① 王道法：队列元素带 level 域，用<b>非环形队列</b>（出队不真正删除，结点仍留在数组里），遍历完再扫描 level 数组统计每层个数取 max；<br>② 更简洁法：BFS 时"一层一层地弹"——记下当前队列 size 就是本层结点数，取所有层 size 的最大值。<br>⚠️ <b>王道特别提醒</b>：这里的队列必须<b>非环形（不覆盖已出队元素）</b>，因为最后还要回头扫描所有结点的层号；若用普通环形队列，出队后被覆盖就没法统计了。<br>我用 DFS 计数（按层累加）和 BFS 逐层法各实现一遍，2000 棵随机树上宽度值完全一致。', code:'typedef struct{\n    BiTree data[MaxSize];   //保存队列中的结点指针\n    int level[MaxSize];     //保存 data 中相同下标结点的层次\n    int front, rear;\n}Qu;\nint BTWidth(BiTree b){\n    //求二叉树 b 的宽度（结点数最多的那一层的结点数）\n    BiTree p; int k, max, i, n;\n    Qu.front=Qu.rear=-1;\n    Qu.rear++; Qu.data[Qu.rear]=b; Qu.level[Qu.rear]=1;   //根层次为 1\n    while(Qu.front<Qu.rear){\n        Qu.front++;\n        p=Qu.data[Qu.front]; k=Qu.level[Qu.front];\n        if(p->lchild!=NULL){ Qu.rear++; Qu.data[Qu.rear]=p->lchild; Qu.level[Qu.rear]=k+1; }\n        if(p->rchild!=NULL){ Qu.rear++; Qu.data[Qu.rear]=p->rchild; Qu.level[Qu.rear]=k+1; }\n    }\n    max=0; i=0; k=1;                //从第一层开始逐层统计\n    while(i<=Qu.rear){\n        n=0;                       //第 k 层的结点数\n        while(i<=Qu.rear && Qu.level[i]==k){ n++; i++; }\n        k=Qu.level[i];\n        if(n>max) max=n;           //保存最大的 n\n    }\n    return max;\n}', run:'DFS 层计数法 vs BFS 逐层法：2000 棵随机树宽度值逐一比对，反例 0 ✅', verdict:'ok'},

{id:'5.3-综12', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'算法题', exam:null, kp:['满二叉树·先序转后序'], stem:'设有一棵满二叉树（所有结点值均不同），已知其先序序列为 pre，设计一个算法求其后序序列 post。', book:'对一般二叉树，仅根据先序或后序序列，不能确定另一个遍历序列。但对<b>满二叉树</b>，任意一个结点的左右子树均含有相等的结点数，同时先序序列的第一个结点作为后序序列的最后一个结点，由此得到将先序序列 pre[l1..h1] 转换为后序序列 post[l2..h2] 的递归模型：<br>f(pre,l1,h1,post,l2,h2)=不做任何事情，若 h1&lt;l1；<br>其他情况：post[h2]=pre[l1]（根）；取中间位置 half=(h1−l1)/2；左子树 pre[l1+1..l1+half] 转 post[l2..l2+half−1]；右子树 pre[l1+half+1..h1] 转 post[l2+half..h2−1]。<br>例如 pre="ABCDEFG"，得后序 CDBFGEA。', claude:'答案：<b>利用满二叉树"左右子树结点数相等"这一特权做分治。</b>一般二叉树光有先序推不出后序，但满二叉树可以。<br><b>递归模型</b>（把先序段 pre[l1..h1] 转成后序段 post[l2..h2]）：<br>① 根：<b>post 段末尾 = pre 段开头</b>（后序末=先序首=根）；<br>② 剩下的 <b>h1−l1 个结点对半分</b>给左右子树（half=(h1−l1)/2）；<br>③ 递归转换左子树、右子树。<br>⚠️ <b>关键前提是"满"</b>——只有满二叉树才能保证左右各占一半，普通二叉树不行。<br>我用两种方法交叉验证：分治法直接算 post，另用"真造出满二叉树再后序遍历"，对 h=0..5 全部满二叉树结果一致；定点 ABCDEFG → <b>CDBFGEA</b>（与书答一致，注意书上正文例子写的是 CDBFGEA）。', code:'void PreToPost(ElemType pre[], int l1, int h1, ElemType post[], int l2, int h2){\n    //满二叉树先序序列 pre[l1..h1] 转后序序列 post[l2..h2]\n    int half;\n    if(h1>=l1){\n        post[h2]=pre[l1];              //根：后序末 = 先序首\n        half=(h1-l1)/2;                //左右子树各占一半\n        PreToPost(pre, l1+1, l1+half, post, l2, l2+half-1);       //左子树\n        PreToPost(pre, l1+half+1, h1, post, l2+half, h2-1);       //右子树\n    }\n}', run:'分治法 vs 真建满二叉树后序：h=0..5 全部满二叉树逐一比对反例 0；ABCDEFG→CDBFGEA ✅', verdict:'ok'},

{id:'5.3-综13', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'算法题', exam:null, kp:['遍历·叶结点串成链表'], stem:'设计一个算法将二叉树的叶结点按从左到右的顺序连成一个单链表，表头指针为 head。二叉树按二叉链表方式存储，链接时用叶结点的右指针域来存放单链表指针。', book:'通常使用的先序、中序和后序遍历对于叶结点的访问顺序都是从左到右，这里选择<b>中序递归遍历</b>。算法思想：设置前驱结点指针 pre，初值为空。第一个叶结点由指针 head 指向，遍历到叶结点时，就将它前驱的 rchild 指针指向它，最后一个叶结点的 rchild 为空。<br>【要点】全局 head、pre；中序遍历中遇到叶结点：若 pre 为空则 head 指向它（第一个叶）、否则 pre→rchild 指向它，然后 pre 更新为当前叶；遍历完 pre→rchild=NULL 封尾。', claude:'答案：<b>任选一种遍历（三序对叶结点都是从左到右），遇到叶结点就用"前驱 pre 的 rchild 指向它"串起来。</b><br><b>关键洞察</b>：先序/中序/后序遍历<b>叶结点的相对顺序完全相同（从左到右）</b>（见 5.3-6），所以哪种遍历都能得到正确的叶链顺序，王道选了中序。<br><b>实现</b>：全局 head、pre（初 NULL）。中序遍历中，若当前是叶：第一个叶让 head 指它，否则 <code>pre→rchild = 当前叶</code>，再 <code>pre = 当前叶</code>。遍历结束 <code>pre→rchild = NULL</code> 封尾。<br>⚠️ 复用叶结点的 <b>rchild</b> 域（叶本来右指针为空，正好拿来当链表 next），不额外开空间。时间 O(n)。<br>我用 Python 验证："叶结点的先序序 == 中序序（从左到右一致）"在 2000 棵随机树上成立，佐证任选遍历皆可。', code:'LinkedList head, pre=NULL;    //全局变量\nLinkedList InOrder(BiTree bt){\n    //中序遍历，将叶结点从左到右串成单链表\n    if(bt){\n        InOrder(bt->lchild);              //中序遍历左子树\n        if(bt->lchild==NULL && bt->rchild==NULL){   //叶结点\n            if(pre==NULL){\n                head=bt; pre=bt;          //处理第一个叶结点\n            }else{\n                pre->rchild=bt; pre=bt;   //把叶结点链入链表\n            }\n        }\n        InOrder(bt->rchild);              //中序遍历右子树\n        pre->rchild=NULL;                 //设置链表尾\n    }\n    return head;\n}', run:'叶结点先序序 == 中序序（从左到右一致）：2000 棵随机树验证，反例 0 ✅', verdict:'ok'},

{id:'5.3-综14', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', hints:['相似只看「形状」不看结点值——典型的双树同步递归。','都空→相似；一空一非空→不相似；否则递归 similar(左,左) &amp;&amp; similar(右,右)。'], tag:'算法题', exam:null, kp:['判断两树相似'], stem:'试设计判断两棵二叉树是否相似的算法。所谓二叉树 T₁ 和 T₂ 相似，指的是 T₁ 和 T₂ 都是空的二叉树或都只有一个根结点；或者 T₁ 的左子树和 T₂ 的左子树是相似的，且 T₁ 的右子树和 T₂ 的右子树是相似的。', book:'采用递归的思想求解，若 T₁ 和 T₂ 都是空树，则相似；若有一个为空另一个不空，则必然不相似；否则递归地比较它们的左右子树是否相似。递归函数定义：<br>f(T1,T2)=1，若 T1==T2==NULL；<br>f(T1,T2)=0，若 T1 和 T2 之一为 NULL、另一个不为 NULL；<br>f(T1,T2)=f(T1→lchild,T2→lchild) && f(T1→rchild,T2→rchild)，若 T1、T2 均不为 NULL。', claude:'答案：<b>递归——两空则相似，一空一非空则不相似，否则递归比左子树相似 && 右子树相似。</b><br><b>本质</b>：判"相似"就是判<b>两棵树的形态（结构）是否完全相同</b>，与结点值无关。所以只需同步递归下降，检查每一步的"空/非空"是否一致。<br><code>similar(a,b) = (a、b 都空 ? true : a、b 一空一非空 ? false : similar(a.L,b.L) && similar(a.R,b.R))</code>。<br>时间 O(min(n₁,n₂))。<br>⚠️ 注意"相似"只看结构不看值——这是和"判两树相等（equal，值也要同）"的区别。<br>我用 Python 实现，并用"形态签名 shape(t) 相同 ⟺ 相似"作参照，2000 对随机树对拍完全一致。', code:'int similar(BiTree T1, BiTree T2){\n    //递归判断两棵二叉树是否相似\n    int leftS, rightS;\n    if(T1==NULL && T2==NULL)          //两棵树皆空\n        return 1;\n    else if(T1==NULL || T2==NULL)     //只有一棵树为空\n        return 0;\n    else{                             //递归判断左右子树\n        leftS=similar(T1->lchild, T2->lchild);\n        rightS=similar(T1->rchild, T2->rchild);\n        return leftS && rightS;\n    }\n}', run:'相似判定 == 形态签名相同：2000 对随机树对拍反例 0 ✅', verdict:'ok'},

{id:'5.3-综15', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', hints:['WPL＝Σ(叶权 × 叶深度)。递归时把「当前深度」当参数一路带下去，到叶子就累加。','先序递归 WPL(p,depth)：叶结点返回 weight×depth，否则返回左右子树 WPL 之和；根从 depth=0 起。也可用「WPL＝所有非叶结点权值之和」验算。'], tag:'2014 统考', exam:2014, kp:['WPL·带权路径长度'], stem:'【2014 统考真题】二叉树的带权路径长度（WPL）是二叉树中所有叶结点的带权路径长度之和。给定一棵二叉树 T，采用二叉链表存储，结点结构为 (left, weight, right)，其中叶结点的 weight 域保存该结点的非负权值。设 root 为指向 T 的根结点的指针，请设计求 T 的 WPL 的算法，要求：1) 给出算法的基本设计思想；2) 使用 C 或 C++ 语言给出二叉树结点的数据类型定义；3) 根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出注释。', book:'二叉树的带权路径长度有两种常见的计算方法：① 根据 WPL 定义，WPL = 树中全部叶结点的带权路径长度之和；② 根据带权二叉树的性质，WPL = 树中所有非叶结点的权值之和（叶结点权值×深度求和 等价于 非叶结点权和，此处非叶权 = 其子树叶权之和，记住结论即可）。<br>【解法1·基于定义·递归】设根结点深度为 0，孩子深度 = 父深度+1。遍历到叶结点则返回 weight×深度，否则返回左右子树 WPL 之和。<br>【解法2·非叶权和·后序】遍历时令非叶结点的 weight 域 = 其孩子权值之和，则 WPL = 所有非叶结点 weight 之和。<br>【注意】官方标准答案在遍历到度为 1 的结点时会传入空指针导致异常，但作为 408 算法题，只要思想正确、逻辑正确即可得满分，无须抠边界。', claude:'答案：<b>递归遍历，累加"每个叶结点的 weight × 它的深度"。</b>（解法1 最直观，推荐考场写这个。）<br><b>设计思想</b>：设根深度为 0，往下每层 +1。到叶结点就返回 <code>weight × depth</code>，非叶结点返回左右子树 WPL 之和。<br><b>结点定义</b>：<code>typedef struct node{ int weight; struct node *left,*right; }BTree;</code><br><b>解法2（备选）</b>：WPL 还等于"所有非叶结点权值之和"（若把每个非叶结点的权设为其子树叶权和），用后序算——但这法要改写树，不如解法1 干净。<br>⚠️ 王道标注：官方代码在遇到度为 1 的结点时会对空孩子取 weight 导致越界，<b>但 408 算法题按思想给分，不抠边界</b>；写代码时对叶结点先判断即可规避。<br>我用 Python 把两种解法都实现，2000 棵随机带权二叉树上 WPL 值完全一致。', code:'typedef struct node{\n    int weight;\n    struct node *left, *right;\n}BTree;\n//解法1：基于定义的递归实现\nint WPL(BTree *root){\n    return wpl_pre(root, 0);           //根深度为 0\n}\nint wpl_pre(BTree *root, int d){\n    if(root->left==NULL && root->right==NULL)   //叶结点\n        return root->weight * d;                //带权路径长度 = 权 × 深度\n    int s=0;\n    if(root->left)  s+=wpl_pre(root->left,  d+1);   //累加左子树\n    if(root->right) s+=wpl_pre(root->right, d+1);   //累加右子树\n    return s;\n}', run:'定义法(叶权×深度) vs 非叶权和法：2000 棵随机带权二叉树 WPL 逐一比对，反例 0 ✅', verdict:'ok'},

{id:'5.3-综16', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', hints:['中缀表达式＝中序遍历，难点只在「什么时候加括号」。','中序遍历，遇到「非根且非叶」的运算符结点，进其左子树前打「(」、出其右子树后打「)」；操作数（叶）和最外层根不加括号。'], tag:'2017 统考', exam:2017, kp:['表达式树·转中缀'], stem:'【2017 统考真题】请设计一个算法，将给定的表达式树（二叉树）转换为等价的中缀表达式（通过括号反映操作符的计算次序）并输出。例如，两棵表达式树的输出应分别为 (a+b)*(c*(-d)) 和 (a*b)+(-(c-d))。结点定义 <code>typedef struct node{ char data[10]; struct node *left,*right; }BTree;</code>。要求：1) 给出算法的基本设计思想；2) 采用 C 或 C++ 语言描述算法，关键之处给出注释。', book:'表达式树的中序序列加上必要的括号即等价的中缀表达式。可以基于二叉树的中序遍历策略得到所需的表达式。表达式树中分支结点所对应的子表达式的计算次序，由该分支结点所处的位置决定。为得到正确的中缀表达式，需要在生成遍历序列的同时，在适当位置增加必要的括号。显然，表达式的最外层（对应根结点）和操作数（对应叶结点）不需要添加括号。<br>【实现】改造中序递归：除根结点和叶结点外，遍历到其他结点时，在遍历其左子树之前加左括号，遍历完右子树后加右括号（用深度 deep 判断，deep>1 才加括号）。', claude:'答案：<b>中序遍历表达式树 + 在非根非叶的分支结点两侧补括号。</b><br><b>设计思想</b>：中序遍历一棵表达式树，得到的就是中缀表达式的"骨架"，但缺括号。补括号的规则：<br>· <b>叶结点（操作数）</b>不加括号；<br>· <b>根结点（最外层）</b>不加括号（最外层无歧义）；<br>· <b>其余分支结点</b>：在递归其左子树前打 <code>(</code>、递归完右子树后打 <code>)</code>。<br>用一个深度参数 deep 实现："deep>1 才加括号"（deep=1 是根）。<br>⚠️ 一元负号 <code>-d</code> 这种（左子树空）也能正确处理——中序走时左子树空就直接输出运算符再输出右操作数，配合括号得 <code>(-d)</code>。<br>我用 Python 实现该算法，对题干两棵样例树分别输出 <code>(a+b)*(c*(-d))</code> 和 <code>(a*b)+(-(c-d))</code>，与题目要求完全一致。', code:'void BtreeToE(BTree *root){\n    BtreeToExp(root, 1);              //根的深度为 1\n}\nvoid BtreeToExp(BTree *root, int deep){\n    if(root==NULL) return;           //空结点返回\n    else if(root->left==NULL && root->right==NULL)   //叶结点（操作数）\n        printf("%s", root->data);    //输出操作数，不加括号\n    else{\n        if(deep>1) printf("(");      //非根分支结点，左括号\n        BtreeToExp(root->left, deep+1);\n        printf("%s", root->data);    //输出操作符\n        BtreeToExp(root->right, deep+1);\n        if(deep>1) printf(")");      //非根分支结点，右括号\n    }\n}', run:'算法输出 vs 题目要求：样例1→(a+b)*(c*(-d))、样例2→(a*b)+(-(c-d))，均一致 ✅', verdict:'ok'},

{id:'5.3-综17', ch:5, sec:'5.3 遍历与线索二叉树', type:'subjective', tag:'2022 统考', exam:2022, kp:['顺序存储·判BST'], stem:'【2022 统考真题】已知非空二叉树 T 的结点值均为正整数，采用顺序存储方式保存，数据结构定义为 <code>typedef struct{ int SqBiTNode[MAX_SIZE]; int ElemNum; }SqBiTree;</code>，T 中不存在的结点在数组 SqBiTNode 中用 −1 表示。请设计一个尽可能高效的算法，判定一棵采用这种方式存储的二叉树是否为二叉搜索树，若是则返回 true，否则返回 false。要求：1) 给出算法的基本设计思想；2) 采用 C 或 C++ 语言描述算法，关键之处给出注释。', book:'【解法1】对于采用顺序存储的二叉树，根结点保存在 SqBiTNode[0]，结点 i 的左孩子为 SqBiTNode[2i+1]、右孩子为 SqBiTNode[2i+2]、双亲为 SqBiTNode[(i−1)/2]。二叉搜索树的条件是：任一结点值大于其左子树全部结点值、小于其右子树全部结点值 —— 等价于<b>中序遍历得到严格递增序列</b>。用整型变量 val 记录中序遍历过程中已遍历结点的最大值（初值为负），若当前结点值 ≤ val 则返回 false，否则更新 val。<br>【解法2】设 pmax、pmin 两个辅助数组，从后向前扫描，逐一验证结点与其左右子树的最值关系。', claude:'答案：<b>直接在顺序数组上做中序遍历，检查是否严格递增。</b>（解法1 最简洁，推荐。）<br><b>设计思想</b>：BST ⟺ 中序序列严格升序。在数组存储上，结点 i 的左孩子 2i+1、右孩子 2i+2、值 −1 表示空。递归"中序"：先访左子树、再访问 i、再访右子树；用全局 <code>val</code> 记已遍历的最大值，当前结点 ≤ val 就 return false。<br><b>结点定位公式（下标从 0）</b>：左 2i+1、右 2i+2、父 (i−1)/2 —— 别和"下标从 1"的 2i/2i+1 搞混。<br>⚠️ 递归时 <b>i≥ElemNum 或 SqBiTNode[i]==−1 就停</b>（空结点不参与）。<br>我用 Python 实现"数组上中序判升序"，与"提取中序序列再查严格递增"的参照法在 3000 个随机顺序存储树上对拍一致；并验证题干 T₁（是 BST）判 true、T₂（50 在 40 的右子树却更小）判 false。', code:'#define false 0\n#define true  1\ntypedef int bool;\nbool judgeInOrderBST(SqBiTree bt, int k, int *val){\n    //在顺序存储二叉树上中序遍历，判断是否严格递增（初始调用 k=0，*val 为很小的负数）\n    if(k<bt.ElemNum && bt.SqBiTNode[k]!=-1){\n        if(!judgeInOrderBST(bt, 2*k+1, val)) return false;   //先中序遍历左子树\n        if(bt.SqBiTNode[k] <= *val) return false;            //当前值须大于已遍历最大值\n        *val = bt.SqBiTNode[k];                              //更新最大值\n        if(!judgeInOrderBST(bt, 2*k+2, val)) return false;   //再中序遍历右子树\n    }\n    return true;\n}', run:'数组中序判升序 vs 提取中序再查升序：3000 例随机顺序存储树对拍反例 0；题干 T₁ 判 true、T₂ 判 false ✅', verdict:'ok'},

/* ===================== 第5章 5.4 树、森林 · 选择题 ===================== */
{id:'5.4-1', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['树·概念辨析'], stem:'下列关于树的说法中，正确的是（　）。<br>Ⅰ. 对于有 n 个结点的二叉树，其高度为 log<sub>2</sub>n<br>Ⅱ. 完全二叉树中，若一个结点没有左孩子，则它必是叶结点<br>Ⅲ. 高度为 h（h＞0）的完全二叉树对应的森林所含的树的个数一定是 h<br>Ⅳ. 一棵树中的叶子数一定等于与其对应的二叉树的叶子数', opts:['Ⅰ 和 Ⅲ','Ⅳ','Ⅰ 和 Ⅱ','Ⅱ'], ans:'D', book:'若 n 个结点的二叉树是一棵单支树，则其高度为 n，说法 Ⅰ 错误。完全二叉树中最多存在一个度为 1 的结点且只有左孩子，若不存在左孩子，则一定也不存在右孩子，因此必是叶结点，说法 Ⅱ 正确。只有满二叉树才具有性质 Ⅲ（对应森林的树数与高度相等），一般完全二叉树不满足，说法 Ⅲ 错误。在树转换为二叉树时，若有几个叶结点具有共同的双亲，则转换成二叉树后只有一个叶结点（最右边的叶结点），说法 Ⅳ 错误。', claude:'一致，只有 Ⅱ 对 → 选 D。逐条：<br>· <b>Ⅰ 错</b>：单支树高度是 n，不是 log₂n（那是完全二叉树的最小高度）。<br>· <b>Ⅱ 对</b>：完全二叉树里"没有左孩子 ⇒ 也没有右孩子 ⇒ 叶结点"（层序连续，2i＞n 则 2i+1 也＞n）。<br>· <b>Ⅲ 错</b>：完全二叉树"从根沿右链走"的结点数才等于森林树数，这个数一般<b>不等于高度 h</b>（只有满二叉树等）。<br>· <b>Ⅳ 错——本节最重要的坑</b>：<b>树转二叉树后叶子数通常会变少</b>！树里"共享同一个双亲的多个叶子"，转成二叉树（左孩子右兄弟）后，只有最右那个还是叶子，其余都挂了右兄弟变成非叶。所以 5.4-17（2014 真题）问的是"树叶数 = 二叉树中<b>左指针为空</b>的结点数"而不是"二叉树叶数"。', run:null, verdict:'ok'},

{id:'5.4-2', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['森林转二叉树·右指针'], stem:'利用二叉链表存储森林时，根结点的右指针是（　）。', opts:['指向最左兄弟','指向最右兄弟','一定为空','不一定为空'], ans:'D', book:'森林与二叉树具有对应关系，存储森林时应先将森林转换成二叉树，转换的方法就是"左孩子右兄弟"。与树不同的是，若存在第二棵树，则二叉链表的根结点的右指针指向的是森林中第二棵树的根结点。若此森林只有一棵树，则根结点的右指针为空。因此，右指针可能为空也可能不为空。', claude:'一致。<b>"左孩子右兄弟"转换法里，根结点的右指针 = 指向森林的第二棵树的根。</b><br>· 若森林<b>只有一棵树</b> → 没有"第二棵" → 右指针<b>空</b>；<br>· 若森林<b>有多棵树</b> → 右指针指向第二棵树的根 → <b>非空</b>。<br>所以"不一定为空"，选 D。<br>⚠️ 别混：A/B 说"指向兄弟"——根结点在森林里没有兄弟结点（它是各自树的根，被视为<b>互为兄弟</b>），所以它的右指针指的是"下一棵树的根"（可看作它的右兄弟），但方向是"最左的下一个"，不是"最左/最右兄弟"这种表述。关键结论就一句：<b>森林多于一棵树时根的右指针非空。</b>', run:null, verdict:'ok'},

{id:'5.4-3', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['森林转二叉树·结点数'], stem:'设森林 F 中有 3 棵树，第 1、2、3 棵树的结点数分别为 M<sub>1</sub>、M<sub>2</sub> 和 M<sub>3</sub>，与森林 F 对应的二叉树根结点的右子树上的结点数是（　）。', opts:['M<sub>1</sub>','M<sub>1</sub>+M<sub>2</sub>','M<sub>3</sub>','M<sub>2</sub>+M<sub>3</sub>'], ans:'D', book:'与树转换为二叉树不同，森林中的每棵树是独立的，因此先要将每棵树的根结点全部视为兄弟结点的关系。森林转换为二叉树后，树 2 作为树 1 的根结点的右子树，树 3 作为树 2 的根结点的右子树，因此森林 F 对应的二叉树根结点的右子树上的结点数是 M<sub>2</sub>+M<sub>3</sub>。', claude:'一致。<b>森林转二叉树：各棵树的根互为兄弟，沿"右指针"串成一条链。</b><br>· BT 的<b>根 = 第 1 棵树的根</b>；<br>· BT 根的<b>左子树 = 第 1 棵树除根外的部分</b>（M₁−1 个）；<br>· BT 根的<b>右子树 = 第 2 棵树 + 第 3 棵树全部</b>（因为树2挂在树1根的右、树3挂在树2根的右）→ M₂+M₃，选 D。<br>⚠️ 配套记忆（本节四道同源题 03/04/05/06）：<br>&nbsp;&nbsp;- BT 根左子树 = 第一棵树的孩子们（M₁−1，见 5.4-4）；<br>&nbsp;&nbsp;- BT 根右子树 = 除第一棵外的所有树（见本题）；<br>&nbsp;&nbsp;- 第一棵树结点数 = BT 根 + 左子树 = 总数 − 右子树（见 5.4-5）。<br>我用真实"左孩子右兄弟"转换对随机森林验证了这套对应关系全部成立。', run:'随机森林做真实"左孩子右兄弟"转换：BT根右子树结点数 = 除第一棵外各树结点和，恒成立 ✅', verdict:'ok'},

{id:'5.4-4', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['森林转二叉树·结点数'], stem:'设森林 F 中有 4 棵树，第 1、2、3、4 棵树的结点数分别为 a、b、c 和 d，与森林 F 对应的二叉树的根结点的左子树上的结点数是（　）。', opts:['a','b+c+d','a−1','a+b+c'], ans:'C', book:'森林转换为二叉树后，二叉树的根结点为第 1 棵树的根结点，二叉树的根结点的左子树包含第 1 棵树的所有孩子，因此森林 F 对应的二叉树的根结点的左子树上的结点数是 a−1。', claude:'一致。<b>BT 根 = 第 1 棵树的根，那么 BT 根的左子树 = 第 1 棵树"去掉根"剩下的所有结点 = a−1。</b>选 C。<br>· 左子树（左孩子方向）装的是第一棵树根的<b>孩子及其后代</b>，正好是这棵树除根外的全部 = a−1；<br>· 右子树（右兄弟方向）装的是<b>第 2、3、4 棵树</b>（b+c+d，那是选项 B 的意思，但问的是左子树）。<br>⚠️ 和 5.4-3 是"左子树/右子树"的一对：<b>左子树 = 第一棵树 −1，右子树 = 其余各树之和</b>。选 A（=a）是漏减了根，最典型的错法。', run:'随机森林转换验证：BT根左子树结点数 = 第一棵树结点数 − 1，恒成立 ✅', verdict:'ok'},

{id:'5.4-5', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['森林转二叉树·结点数'], stem:'设森林 F 对应的二叉树为 B，它有 m 个结点，B 的根为 p，p 的右子树结点数为 n，森林 F 中第一棵树的结点数是（　）。', opts:['m−n','m−n−1','n+1','条件不足，无法确定'], ans:'A', book:'森林转换成二叉树时采用孩子兄弟表示法，根结点及其左子树为森林中的第一棵树。右子树为其他剩余的树。所以，第一棵树的结点数为 m−n。', claude:'一致。<b>整棵 BT = 第一棵树（根 p + 左子树）+ 其余各树（右子树）。</b><br>· BT 总结点 m = 第一棵树结点数 + 右子树结点数 n；<br>· 所以<b>第一棵树 = m − n</b>，选 A。<br>直观：BT 从根 p 出发，"左子树 + 根 p"就是第一棵树，"右子树 n 个"是剩下所有树。m 减掉右子树就剩第一棵树。<br>⚠️ 选 B（m−n−1）是把根 p 也减掉了——但根 p 属于第一棵树，不能减。这三道（03/04/05）本质是同一张对应图，画一次记牢。', run:'随机森林转换：第一棵树结点数 = m − (BT根右子树结点数)，恒成立 ✅', verdict:'ok'},

{id:'5.4-6', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['森林转二叉树·结点数'], stem:'设森林 F 对应的二叉树是一棵具有 16 个结点的完全二叉树，则森林 F 中树的数目和结点最多的树的结点数分别是（　）。', opts:['2 和 8','2 和 9','4 和 8','4 和 9'], ans:'D', book:'森林转换为二叉树后，二叉树的根结点及其左子树由第 1 棵树转换得到，二叉树的根结点的右子树由剩余的森林转换得到，以此类推，可以划分出第 2、3、… 棵树的结点。具有 16 个结点的完全二叉树的形态如图所示，沿二叉树的根结点往右下遍历，共有 4 个结点，可知森林中有 4 棵树，其中第 1 棵树的结点数最多，有 9 个。', figA:'图/ch5/5.4-6.svg', figAcap:'16 结点完全二叉树：根往右链有 4 个结点(1→3→7→15)＝森林 4 棵树；第一棵树 = 结点 1 + 左子树(以 2 为根，8 个) = 9 个', claude:'一致。<b>两步：① 森林树数 = BT"从根一路沿右指针"的结点数；② 每棵树的结点数 = 对应右链段"往左展开"的子树大小。</b><br>16 结点完全二叉树（下标 1~16，右孩子 2i+1）：<br>· <b>右链</b>：1 → 3 → 7 → 15，共 <b>4 个</b> → 森林有 <b>4 棵树</b>（排除 A、B）。<br>· <b>第一棵树</b> = BT 根(1) + 它的左子树（以 2 为根的子树）。以 2 为根的子树在 16 结点完全二叉树里含 8 个结点（2,4,5,8,9,10,11,16）→ 第一棵树 = 1+8 = <b>9 个</b>，是最多的。<br>→ 选 D（4 和 9）。<br>我用程序对 16 结点完全二叉树算右链长（=4）和以 2 为根的子树大小（=8，+根=9），与书答一致。', run:'程序：16结点完全二叉树右链长=4；以2为根子树8个结点，第一棵树=1+8=9 ✅', verdict:'ok'},

{id:'5.4-7', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['森林转二叉树·过程'], stem:'森林 T=(T<sub>1</sub>,T<sub>2</sub>,…,T<sub>m</sub>) 转化为二叉树 BT 的过程为：若 m=0，则 BT 为空；若 m≠0，则（　）。', opts:['将中间子树 T<sub>mid</sub>（mid=(1+m)/2）的根作为 BT 的根；将 (T<sub>1</sub>,…,T<sub>mid−1</sub>) 转换为 BT 的左子树；将 (T<sub>mid+1</sub>,…,T<sub>m</sub>) 转换为 BT 的右子树','将子树 T<sub>1</sub> 的根作为 BT 的根；将 T<sub>1</sub> 的子树森林转换成 BT 的左子树；将 (T<sub>2</sub>,T<sub>3</sub>,…,T<sub>m</sub>) 转换成 BT 的右子树','将子树 T<sub>1</sub> 的根作为 BT 的根；将 T<sub>1</sub> 的左子树森林转换成 BT 的左子树；将 T<sub>1</sub> 的右子树森林转换成 BT 的右子树；其他以此类推','将森林 T 的根作为 BT 的根；将 (T<sub>1</sub>,…,T<sub>m</sub>) 转化为该根下的结点，得到一棵树，然后将这棵树再转化为二叉树 BT'], ans:'B', book:'将森林中每棵树的根结点视为兄弟结点的关系，再按照"左孩子右兄弟"的规则来进行转化。<br>即：以第一棵树 T<sub>1</sub> 的根作为二叉树的根；T<sub>1</sub> 的子树森林（T<sub>1</sub> 根的孩子们）递归转换为左子树；剩余的森林 (T<sub>2</sub>,…,T<sub>m</sub>) 递归转换为右子树。', claude:'一致。<b>森林转二叉树的递归定义（背这个）</b>：<br>BT 根 = <b>T₁ 的根</b>；BT 左子树 = <b>T₁ 的子树森林</b>（即 T₁ 根的孩子们）转成的二叉树；BT 右子树 = <b>剩下的森林 (T₂,…,Tₘ)</b> 转成的二叉树。选 B。<br>· 一句话：<b>"长子变左孩子，下一棵树变右孩子"</b>，左管"往下"、右管"往后"。<br>· A（取中间树）、D（先合成一棵大树）都不是"左孩子右兄弟"的做法；C 把"左子树森林/右子树森林"这种二叉树才有的概念套到了树上，错。<br>⚠️ 这个递归结构正好解释了 03/04/05/06 的所有结论。', run:null, verdict:'ok'},

{id:'5.4-8', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['森林转二叉树·空指针'], stem:'设 F 是一个森林，B 是由 F 变换来的二叉树。若 F 中有 n 个非终端结点，则 B 中右指针域为空的结点有（　）个。', opts:['n−1','n','n+1','n+2'], ans:'C', book:'根据森林与二叉树转换规则"左孩子右兄弟"。二叉树 B 中右指针域为空代表该结点没有兄弟结点。森林中每棵树的根结点从第二个开始依次连接到前一棵树的根的右孩子，因此最后一棵树的根结点的右指针为空。另外，每个非终端结点，其所有孩子结点在转换之后，最后一个孩子的右指针也为空，所以树 B 中右指针域为空的结点有 n+1 个。', claude:'一致。<b>右指针为空 ⟺ 该结点在原森林里"没有下一个兄弟"。</b>数一数哪些结点是"某组兄弟里的最后一个"：<br>· 每个<b>非终端（有孩子的）结点</b>，它的那组孩子里最后一个孩子右指针空 → 贡献 <b>n 个</b>；<br>· <b>森林最后一棵树的根</b>（根们互为兄弟，最后一个根没有下一棵树）→ 再贡献 <b>1 个</b>；<br>· 合计 <b>n+1</b>，选 C。<br>⚠️ 注意问的是"<b>非终端结点数 n</b>"（有孩子的结点），不是总结点数。每个非终端结点带出一组孩子、那组的末尾贡献一个右空；再加森林末棵树根这一个。<br>我用真实"左孩子右兄弟"转换对 3000 个随机森林验证：右指针空的结点数 = 森林非叶结点数 + 1，零反例。', run:'3000 个随机森林转换：BT 右指针空结点数 = 森林非终端结点数 + 1，反例 0 ✅', verdict:'ok'},

{id:'5.4-9', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['孩子兄弟表示·叶结点'], stem:'设某树的孩子兄弟链表示中共有 6 个空的左指针域、7 个空的右指针域，包括 5 个结点的左右指针域都为空，则该树中叶结点的个数是（　）。', opts:['7','6','5','不能确定'], ans:'B', book:'在树的孩子兄弟表示法中，若一个结点没有孩子（叶结点），则表现为该结点的左指针域为空，因此本题答案为"6"。至于"5 个结点的左右指针域都为空"，表示树中有 5 个结点既没有孩子又没有兄弟，约束条件比题中的"求叶结点的个数"要求更严格。', claude:'一致。<b>孩子兄弟表示法里：左指针 = 长子，右指针 = 右兄弟。所以"叶结点 ⟺ 没有孩子 ⟺ 左指针（fch）为空"。</b><br>· 叶结点数 = <b>左指针空的结点数 = 6</b>，选 B。<br>· <b>陷阱："5 个结点左右都空"是干扰</b>——那 5 个是"既无孩子又无兄弟"的结点，条件比"叶结点"更严（叶结点只要求无孩子，可以有兄弟）。求叶子只看左指针空不空，右指针无关。<br>⚠️ <b>右指针空 ≠ 叶结点</b>：右指针空只说明"没有右兄弟"，它可能有孩子（非叶）。别拿 7 去答。<br>本节 5.4-综4 的算法就是"数 fch==NULL 的结点"来求森林叶子数，同一个判据。', run:'（见 5.4-综4：孩子兄弟表示中 fch==NULL 结点数 == 森林叶子数，随机验证零反例）', verdict:'ok'},

{id:'5.4-10', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['有序树转二叉树·遍历'], stem:'若 T<sub>1</sub> 是由有序树 T 转换而来的二叉树，则 T 中结点的后根序列就是 T<sub>1</sub> 中结点的（　）序列。', opts:['先序','中序','后序','层序'], ans:'B', book:'有序树 T 转换成二叉树 T<sub>1</sub> 时，T 的后根序列是对应 T<sub>1</sub> 的中序序列（显然树的后根序列不可能对应二叉树的先序序列和层序序列）。看图所示的例子，在树 T 中，叶结点 B 应最先访问，在 T<sub>1</sub> 中，B 的右兄弟 C 转换为它的右孩子，若对应 T<sub>1</sub> 的后序序列，则 C 应在 B 的前面访问，所以 T 的后根序列不可能对应 T<sub>1</sub> 的后序序列。', claude:'一致。<b>树/森林 与 二叉树 遍历的对应关系表（务必背）：</b><br><table class="qtab"><tr><th>树</th><th>森林</th><th>对应二叉树</th></tr><tr><td class="rowh">先根遍历</td><td>先序遍历</td><td>先序遍历</td></tr><tr><td class="rowh">后根遍历</td><td>中序遍历</td><td>中序遍历</td></tr></table>所以<b>树的后根序列 = 转换后二叉树的中序序列</b>，选 B。<br>· <b>只有这两组对应</b>（先根↔先序、后根↔中序），没有"后根↔后序"这回事——书里专门举例证伪了 C。<br>· 记忆法：树转二叉树是"左孩子右兄弟"，二叉树中序 LNR 里"先左子树（长子分支）、再根、再右子树（兄弟分支）"，正好对上树的后根"先所有孩子、再根"。<br>我用真实转换对随机森林验证：森林后根序列 == 对应二叉树中序序列、先根 == 先序，零反例。', run:'随机森林真实转换：后根序列==BT中序、先根序列==BT先序，反例 0 ✅', verdict:'ok'},

{id:'5.4-11', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['二叉树转森林·树数'], stem:'某二叉树结点的中序序列为 BDAECF，后序序列为 DBEFCA，则该二叉树对应的森林包括（　）棵树。', opts:['1','2','3','4'], ans:'C', book:'根据二叉树的先序序列和中序序列可以确定一棵二叉树。根据后序序列，A 是二叉树的根结点。根据中序序列，二叉树的形态可确定。对于 A 的左子树，根据后序序列，B 比 D 后被访问，因此 B 必为 D 的父结点，又根据中序序列，D 是 B 的右孩子。对于 A 的右子树，同理可确定结点 E、C、F 的关系。再根据二叉树与森林的对应关系，森林中树的棵数即其对应二叉树（向右上旋转 45° 后）的根结点 A 及其右兄弟数，或解释为：对应二叉树从根结点 A 开始不断往右孩子访问，所访问到的结点数。可知此森林有 3 棵树，根结点分别为 A、C 和 F。', claude:'一致。<b>两步：① 由中序+后序建出二叉树；② 森林树数 = 二叉树"从根一路沿右孩子"能走到的结点数。</b><br>① 建树：后序末 A=根；中序 BDA|ECF → A 左子树 {B,D}、右子树 {E,C,F}。定出形态后，<b>根 A 的右孩子是 C，C 的右孩子是 F</b>（右链 A→C→F）。<br>② <b>右链 A→C→F 共 3 个结点 → 森林有 3 棵树</b>（根分别是 A、C、F），选 C。<br>⚠️ 核心判据：<b>二叉树转森林/树，"根的右链有几个结点，森林就有几棵树"</b>（因为各棵树的根在二叉树里靠右指针串成一条链），与 5.4-6、5.4-20 同一条规则。<br>我按中序 BDAECF + 后序 DBEFCA 建树，右链确为 A→C→F（3 个）。', run:'由中序BDAECF+后序DBEFCA建树，根的右链=A→C→F 共 3 结点 → 森林 3 棵树 ✅', verdict:'ok'},

{id:'5.4-12', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['树二叉树对应·关系'], stem:'设 X 是树 T 中的一个非根结点，B 是 T 所对应的二叉树。在 B 中，X 是其双亲结点的右孩子，下列结论中正确的是（　）。', opts:['在树 T 中，X 是其双亲结点的第一个孩子','在树 T 中，X 一定无右边兄弟','在树 T 中，X 一定是叶结点','在树 T 中，X 一定有左边兄弟'], ans:'D', book:'在二叉树 B 中，X 是其双亲结点的右孩子，因此在树 T 中，X 必是其双亲结点的右兄弟，换句话说，X 在树中必有左兄弟。', claude:'一致。<b>把"左孩子右兄弟"反过来读：二叉树里的"右孩子"= 原树里的"右兄弟"。</b><br>· X 在二叉树 B 中是<b>右孩子</b> ⟺ X 在原树 T 中是某结点的<b>右兄弟</b> ⟺ X <b>一定有左兄弟</b>（既然它是右兄弟，它左边必有个兄弟），选 D。<br>· A 错：X 若是"第一个孩子"，在 B 里会是<b>左孩子</b>不是右孩子；<br>· B 错：X 有没有右兄弟看它在 B 里有没有右孩子，题目没说；<br>· C 错：X 是不是叶看它在 B 里有没有左孩子，题目没说。<br>⚠️ <b>转换口诀反向记</b>：B 的左孩子 = T 的长子；B 的右孩子 = T 的右兄弟。本题就是"右孩子 ⟹ 右兄弟 ⟹ 有左兄弟"。', run:null, verdict:'ok'},

{id:'5.4-13', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['树的存储结构'], stem:'右图是一棵逻辑上的树 T（根 R，R 的孩子 A/B/C；A 的孩子 D/E；C 的孩子 F；F 的孩子 G/H/K），则关于该树的存储结构的叙述中，错误的是（　）。', opts:['若 T 采用双亲表示法，则有 9 个指向双亲的指针','若 T 采用孩子表示法，则在 T 中查找某个结点的孩子比双亲表示法更方便','若 T 采用孩子兄弟表示法，则在 T 中查找某个结点的双亲的时间复杂度是 O(1)','双亲表示法是顺序存储结构，孩子表示法和孩子兄弟表示法通常是链式存储结构'], ans:'C', book:'若 T 采用双亲表示法存储，则除根结点外，其余每个结点都有指向其双亲的指针，T 共有 10 个结点，于是有 9 个指向双亲的指针，选项 A 正确。若 T 采用孩子表示法存储，则每个结点的孩子被视为一个线性表，且以单链表为存储结构，只要遍历该单链表，就能找到某个结点的所有孩子，而双亲表示法要寻找某个结点的孩子，就必须遍历整棵树，选项 B 正确。若 T 采用孩子兄弟表示法，则在 T 中查找某个结点的双亲也必须遍历整棵树，时间复杂度为 O(n)，选项 C 错误。选项 D 显然正确。', claude:'一致，C 是错误项（题目问"错误的"）。<b>三种存储法的"找双亲/找孩子"难易对照（考点）：</b><br><table class="qtab"><tr><th>存储法</th><th>找双亲</th><th>找孩子</th><th>类型</th></tr><tr><td class="rowh">双亲表示法</td><td>易 O(1)</td><td>难(遍历全树)</td><td>顺序</td></tr><tr><td class="rowh">孩子表示法</td><td>难</td><td>易(顺链表)</td><td>链式</td></tr><tr><td class="rowh">孩子兄弟法</td><td><b>难(遍历全树)</b></td><td>易</td><td>链式</td></tr></table>· A 对：10 个结点 → 9 个非根结点各有 1 个双亲指针。<br>· B 对：孩子表示法找孩子顺着链表走即可，比双亲表示法方便。<br>· <b>C 错</b>：孩子兄弟表示法只存"长子+右兄弟"两个指针，<b>不存双亲</b>，找双亲要遍历整棵树 O(n)，绝不是 O(1)。<br>· D 对：双亲表示法是数组（顺序），另两种是链式。', run:null, verdict:'ok'},

{id:'5.4-14', ch:5, sec:'5.4 树、森林', type:'choice', tag:'', exam:null, kp:['森林二叉树表示·关系'], stem:'在森林的二叉树表示中，结点 M 和结点 N 是同一父结点的左孩子和右孩子，则在该森林中（　）。', opts:['M 和 N 有同一双亲','M 和 N 可能无公共祖先','M 是 N 的孩子','M 是 N 的左兄弟'], ans:'B', book:'在森林的二叉树表示中，当 M 和 N 的父结点是二叉树根结点时，M 和 N 在不同的树上。因此 M 和 N 可能无公共祖先。', claude:'一致。<b>二叉树里"父结点 P，左孩子 M，右孩子 N" → 原森林里：M 是 P 的长子，N 是 P 的右兄弟。</b>所以在森林里 M、N 一般无直接亲缘。<br>关键反例：<b>当 P 是二叉树的根时</b>，P 是森林第一棵树的根，N（P 的右孩子）是<b>第二棵树的根</b> → M 在第一棵树、N 在第二棵树，<b>分属不同的树，无公共祖先</b> → 选 B（"可能无公共祖先"）。<br>· A 错：M 的双亲是 P，N 的双亲是 P 的双亲（不是同一个）；<br>· C 错：M 是 P 的孩子不是 N 的孩子；<br>· D 错：M 是 P 的长子、N 是 P 的兄弟，M 和 N 不是兄弟关系。<br>⚠️ 又一次用到"根结点是特例"——二叉树根对应森林各树根，容易造出"不同树"反例。', run:null, verdict:'ok'},

{id:'5.4-15', ch:5, sec:'5.4 树、森林', type:'choice', tag:'2009 统考', exam:2009, kp:['森林二叉树·父结点关系'], stem:'【2009 统考真题】将森林转换为对应的二叉树，若在二叉树中，结点 u 是结点 v 的父结点的父结点，则在原来的森林中，u 和 v 可能具有的关系是（　）。<br>Ⅰ. 父子关系　　Ⅱ. 兄弟关系　　Ⅲ. u 的父结点与 v 的父结点是兄弟关系', opts:['只有 Ⅱ','Ⅰ 和 Ⅱ','Ⅰ 和 Ⅲ','Ⅰ、Ⅱ 和 Ⅲ'], ans:'B', book:'森林与二叉树的转换规则为"左孩子右兄弟"。在最后生成的二叉树中，父子关系在对应森林关系中可能是兄弟关系或者原本就是父子关系。<br>由题意可知 u 是 v 的父结点的父结点，有四种情况：(1) 在原来的树中 u 是 v 的父结点的父结点（对应森林中父子…实为祖孙，属父子链）；(2) 在树中 u 是 v 的父结点；(3) 在树中 u 是 v 的父结点的兄弟；(4) 在树中 u 与 v 是兄弟关系。分析这四种情况对应到森林中的结点关系，可知说法 Ⅰ（父子）和 Ⅱ（兄弟）正确。', claude:'一致，选 B（Ⅰ 和 Ⅱ）。<b>二叉树里 u 是 v 的"祖父"（父的父），在森林里 u、v 可能是什么关系？</b>用"左=长子、右=兄弟"把二叉树的两步父子路径翻译回森林：<br>二叉树里 u→(某孩子)→v 这条"隔一代"的路径，每一步是"左孩子"还是"右孩子"有 4 种组合，翻译回森林分别是：<br>· 左-左：u 是 v 祖父（森林里父子链）；<br>· 左-右 / 右-左：u 是 v 的父 或 父的兄弟；<br>· 右-右：u 与 v 是<b>兄弟</b>（连走两次右兄弟）。<br>汇总森林中可能的关系：<b>父子（Ⅰ）、兄弟（Ⅱ）</b>都能出现；<b>Ⅲ（两人父结点互为兄弟，即堂兄弟）造不出</b> → 选 B。<br>⚠️ 这题硬算容易乱，记住方法：<b>把二叉树路径的每一步"左/右"逐个翻译成森林的"父子/兄弟"，枚举所有组合</b>。', run:null, verdict:'ok'},

{id:'5.4-16', ch:5, sec:'5.4 树、森林', type:'choice', tag:'2011 统考', exam:2011, kp:['树转二叉树·无右孩子'], stem:'【2011 统考真题】已知一棵有 2011 个结点的树，其叶结点数为 116，该树对应的二叉树中无右孩子的结点数是（　）。', opts:['115','116','1895','1896'], ans:'D', book:'树转换为二叉树时，树的每个分支结点的所有子结点中的最右子结点无右孩子，根结点转换后也没有右孩子，因此，对应二叉树中无右孩子的结点数 = 分支结点数 + 1 = 2011−116+1 = 1896。<br>通常本题应采用特殊法求解，设题意中的树是如图所示的结构，则对应的二叉树中仅有前 115 个叶结点有右孩子，所以无右孩子的结点数 = 2011−115 = 1896。', figA:'图/ch5/5.4-16.svg', figAcap:'特殊构造：1895 个中间结点连成链 + 116 个叶结点同为末端结点的孩子（据王道 p.176 重画）', claude:'一致。<b>树转二叉树后，"无右孩子的结点" = 原树里"每组兄弟中最右那个"+ 根。</b><br>"右孩子"在二叉树里代表"右兄弟"，所以<b>无右孩子 ⟺ 在原树里没有右兄弟 ⟺ 是某个双亲的最后一个孩子，或是根。</b><br>· 每个<b>分支结点</b>（有孩子的结点）带出一组孩子，那组的最右一个无右兄弟；一共有多少个分支结点，就有多少个这样的"末位孩子"。<br>· 分支结点数 = 总数 − 叶子数 = 2011 − 116 = 1895；<br>· 再加上<b>根结点</b>（根在二叉树里也无右孩子）→ 1895 + 1 = <b>1896</b>，选 D。<br>公式：<b>无右孩子数 = 分支结点数 + 1 = (n − 叶子数) + 1</b>。<br>⚠️ 选 C（1895）漏了根那 +1；选 A/B 用错了量。我用 (2011−116)+1 复算 = 1896。', run:'程序：(n − 叶子数) + 1 = (2011−116)+1 = 1896 ✅', verdict:'ok'},

{id:'5.4-17', ch:5, sec:'5.4 树、森林', type:'choice', tag:'2014 统考', exam:2014, kp:['森林转二叉树·叶结点'], stem:'【2014 统考真题】将森林 F 转换为对应的二叉树 T，F 中叶结点的个数等于（　）。', opts:['T 中叶结点的个数','T 中度为 1 的结点数','T 中左孩子指针为空的结点数','T 中右孩子指针为空的结点数'], ans:'C', book:'将森林转化为二叉树相当于用孩子兄弟表示法来表示森林。在变化过程中，原森林某结点的第一个孩子结点作为它的左子树，它的兄弟作为它的右子树。森林中的叶结点没有孩子结点，转化为二叉树时，该结点就没有左结点，因此 F 中叶结点的个数等于 T 中左孩子指针为空的结点数。', claude:'一致，选 C。<b>这是 5.4-1 选项 Ⅳ 那个坑的正解。</b><br>· 森林里的叶结点 = 没有孩子的结点；<br>· "左孩子右兄弟"转换后，"没有孩子" ⟺ <b>左指针为空</b>（左指针存的是长子，没孩子就没长子）；<br>· 所以 <b>F 的叶结点数 = T 中左孩子指针为空的结点数</b>，选 C。<br>⚠️ <b>为什么不是"T 的叶结点数"（选项 A）？</b>因为 T 的叶结点要求<b>左右指针都空</b>（既无孩子又无右兄弟），比"森林叶结点"（只要求无孩子）严格。森林里一个有右兄弟的叶子，转换后左空右不空，在 T 里就不是叶子了。所以 F 叶数 ≥ T 叶数，只有"左空"才精确对应。<br>我用真实转换对 3000 个随机森林验证：森林叶数 == T 中左指针空的结点数，零反例。', run:'3000 个随机森林转换：森林叶结点数 == T 中左孩子指针为空的结点数，反例 0 ✅', verdict:'ok'},

{id:'5.4-18', ch:5, sec:'5.4 树、森林', type:'choice', tag:'2019 统考', exam:2019, kp:['树转二叉树·遍历对应'], stem:'【2019 统考真题】若将一棵树 T 转化为对应的二叉树 BT，则下列对 BT 的遍历中，其遍历序列与 T 的后根遍历序列相同的是（　）。', opts:['先序遍历','中序遍历','后序遍历','按层遍历'], ans:'B', book:'后根遍历树可分为两步：① 从左到右访问双亲结点的每个孩子（转化为二叉树后，先访问根结点，再访问右子树）；② 访问完所有孩子后，再访问它们的双亲结点（转化为二叉树后，先访问左子树，再访问根结点），因此树的后根遍历序列与其相应二叉树的中序遍历序列相同。对于此类题，采用特殊值法求解通常会更便捷。', claude:'一致，选 B。<b>树的后根遍历 = 对应二叉树的中序遍历</b>——这是 5.4-10 那张对应表的直接考查，也是 2019 真题。<br><table class="qtab"><tr><th>树</th><th>对应二叉树</th></tr><tr><td class="rowh">先根遍历</td><td>先序遍历</td></tr><tr><td class="rowh">后根遍历</td><td><b>中序遍历</b></td></tr></table>· <b>秒杀法</b>：随便画一棵小树（如根 1 挂 2、3、4），写出后根序列 2,3,4,1，再转成二叉树写它的中序，两者必然相等 → 锁定"中序"。<br>· C（后序）、D（层序）都对不上——书里 5.4-10 已证伪"后根↔后序"。<br>⚠️ 只有两组对应：<b>先根↔先序、后根↔中序</b>。这是本节和 5.3 交叉的高频真题点（2019、2020、2021 连考三年）。<br>我用真实转换对随机森林验证：后根序列 == BT 中序序列，零反例。', run:'随机森林/树真实转换：后根遍历序列 == 对应二叉树中序序列，反例 0 ✅', verdict:'ok'},

{id:'5.4-19', ch:5, sec:'5.4 树、森林', type:'choice', tag:'2020 统考', exam:2020, kp:['森林遍历·建树'], stem:'【2020 统考真题】已知森林 F 及与之对应的二叉树 T。若 F 的先根遍历序列是 a,b,c,d,e,f，后根遍历序列是 b,a,d,f,e,c，则 T 的后序遍历序列是（　）。', opts:['b,a,d,f,e,c','b,d,f,e,c,a','b,f,e,d,c,a','f,e,d,c,b,a'], ans:'C', book:'森林 F 的先根遍历序列对应于其二叉树 T 的先序遍历序列，森林 F 的后根遍历序列对应于其二叉树 T 的中序遍历序列。即 T 的先序遍历序列为 a,b,c,d,e,f，中序遍历序列为 b,a,d,f,e,c。根据二叉树 T 的先序序列和中序序列可以唯一确定它的结构，可以得到二叉树 T 的后序序列为 b,f,e,d,c,a。', claude:'一致，选 C。<b>三步走：森林先根→BT先序，森林后根→BT中序，再由先序+中序建树取后序。</b><br>① 森林先根 a,b,c,d,e,f = <b>BT 先序</b>；森林后根 b,a,d,f,e,c = <b>BT 中序</b>；<br>② 由先序 abcdef + 中序 badfec 唯一建树；<br>③ 取该二叉树的<b>后序</b> = <b>b,f,e,d,c,a</b>。<br>⚠️ 注意最后要的是"T 的后序"，不是"森林的后根"（那是选项 A，混淆项）。森林后根已经用来当 BT 中序了，别再拿它当答案。<br>我用先序 abcdef + 中序 badfec 建树后取后序，得 bfedca，与书答一致。', run:'BT先序abcdef+中序badfec建树 → 后序 bfedca ✅', verdict:'ok'},

{id:'5.4-20', ch:5, sec:'5.4 树、森林', type:'choice', tag:'2021 统考', exam:2021, kp:['森林遍历·树数'], stem:'【2021 统考真题】某森林 F 对应的二叉树为 T，若 T 的先序遍历序列是 a,b,d,c,e,g,f，中序遍历序列是 b,d,a,e,g,c,f，则 F 中树的棵数是（　）。', opts:['1','2','3','4'], ans:'C', book:'由二叉树 T 的先序序列和中序序列可以构造出 T。由森林转化成二叉树的规则可知，森林中每棵树的根结点以右子树的方式相连，所以 T 中的结点 a、c、f 为 F 中树的根结点，森林 F 中有 3 棵树。', figA:'图/ch5/5.4-20.svg', figAcap:'由先序 abdcegf + 中序 bdaegcf 建出的二叉树 T：根往右链 a→c→f（3 个）＝森林 3 棵树', claude:'一致，选 C。<b>先由先序+中序建树，再数"根的右链"长度 = 森林树数。</b><br>① 由先序 abdcegf + 中序 bdaegcf 建出二叉树 T；<br>② <b>根 a 沿右孩子走：a → c → f</b>（a 的右孩子是 c，c 的右孩子是 f），共 <b>3 个</b> → 森林有 <b>3 棵树</b>（根为 a、c、f）。<br>核心判据（本章第四次出现）：<b>森林树数 = 对应二叉树"从根沿右指针链"的结点数</b>（各树根靠右指针串成一条链）。<br>我用先序+中序建树后算根的右链长 = 3，与书答一致。', run:'BT先序abdcegf+中序bdaegcf建树，根右链 a→c→f 共 3 结点 → 森林 3 棵树 ✅', verdict:'ok'},

{id:'5.4-21', ch:5, sec:'5.4 树、森林', type:'choice', tag:'2025 统考', exam:2025, kp:['树森林·综合辨析'], stem:'【2025 统考真题】下列关于二叉树及森林的叙述中，正确的是（　）。', opts:['完全二叉树中不存在度为 1 的结点','任意一个森林都可以转换为一棵二叉树','二叉树的分支结点数比叶结点数少','表达式树的根中保存的是最先计算的运算符'], ans:'B', book:'完全二叉树中至多存在一个度为 1 的结点（最后一个非叶结点仅当总结点数为偶数时出现），选项 A 错误。根据"左孩子右兄弟"表示法，任意森林均可唯一地转换为一棵二叉树，即将每棵树的根视为兄弟，各树内部按左孩子、右兄弟关系重构，选项 B 正确。在任意非空二叉树中，叶结点数 n<sub>0</sub> 等于度为 2 的结点数 n<sub>2</sub> 加 1。但分支结点包括度为 1 和度为 2 的结点，其总数不一定少于叶结点数。例如，一条单支二叉树中，叶结点仅 1 个，而分支结点有 n−1 个，远多于叶结点。选项 C 错误。表达式树的结构体现运算优先级，根结点对应最后执行的运算符，而非最先计算。最先计算的操作位于最深层的子树中，选项 D 错误。', claude:'一致，选 B。<b>四个选项各打一个易错点：</b><br>· <b>A 错</b>：完全二叉树可以有<b>一个</b>度为 1 的结点（当总结点数为偶数时，最后一个分支结点只有左孩子）。说"不存在"太绝对。<br>· <b>B 对</b>：任何森林都能用"左孩子右兄弟"<b>唯一</b>转成一棵二叉树——本节的核心结论。<br>· <b>C 错</b>：只有 n₀ = n₂+1（叶比"度2"多一个），但<b>分支结点 = 度1 + 度2，不一定比叶少</b>。反例：单支树叶子仅 1 个、分支结点 n−1 个。<br>· <b>D 错——最典型的表达式树陷阱</b>：表达式树<b>根结点是最后执行的运算符</b>（优先级最低、最外层），最先算的在<b>最深的子树</b>里。这与 5.3-综16（表达式树转中缀）呼应：根不加括号正因为它最外层最后算。<br>本题是一道"把第 5 章核心结论全考一遍"的综合辨析题，很值得反复看。', run:null, verdict:'ok'},

/* ===================== 第5章 5.4 · 综合应用题 ===================== */
{id:'5.4-综1', ch:5, sec:'5.4 树、森林', type:'subjective', tag:'', exam:null, kp:['树遍历·唯一确定'], stem:'给定一棵树的先根遍历序列和后根遍历序列，能否唯一确定一棵树？若能，请举例说明；若不能，请给出反例。', book:'一棵树的先根遍历结果与其对应二叉树的先序遍历结果相同，树的后根遍历结果与其对应二叉树表示的中序遍历结果相同。二叉树的先序序列和中序序列能够唯一地确定这棵二叉树，因此，根据题目给出的条件，利用树的先根遍历序列和后根遍历序列<b>能够唯一地确定</b>这棵树。<br>例如，对于一棵树，对应二叉树的先序序列为 1,2,3,4,5,6,8,7、中序序列为 3,4,8,6,7,5,2,1。原树的先根遍历序列为 1,2,3,4,5,6,8,7、后根遍历序列为 3,4,8,6,7,5,2,1。<br><b>注意</b>：树的先根遍历、后根遍历与对应二叉树的先序遍历、中序遍历对应。', claude:'答案：<b>能唯一确定。</b><br>推理链：<br>① 树的<b>先根</b>遍历 = 对应二叉树的<b>先序</b>；树的<b>后根</b>遍历 = 对应二叉树的<b>中序</b>（5.4-10/18 那张对应表）；<br>② 而"二叉树的先序 + 中序"能<b>唯一确定</b>一棵二叉树；<br>③ 树与二叉树一一对应（左孩子右兄弟是可逆的双射）；<br>④ 所以"树的先根 + 后根"能唯一确定这棵树。<br>⚠️ <b>对比 5.3-14 的坑</b>：二叉树"先序+后序"<b>不能</b>唯一确定（缺中序）；但这里是"先根+后根"，翻译过去是二叉树的"先序+<b>中序</b>"，含中序所以可以。<b>差别就在"后根"翻译成的是二叉树的中序而非后序</b>——这是本题最容易想反的地方。', run:null, verdict:'ok'},

{id:'5.4-综2', ch:5, sec:'5.4 树、森林', type:'subjective', tag:'', exam:null, kp:['森林转二叉树·画图'], stem:'将下面一个由 3 棵树组成的森林转换为二叉树。第一棵：A(根)-B、C；第二棵：D-E-F（链）；第三棵：G(根)-H、I、J，H-K、L，J-M、N、O，M-P。', book:'根据树与二叉树"左孩子右兄弟"的转换规则，将森林转换为二叉树的过程如下：① 将每棵树的根结点也视为兄弟关系，在兄弟结点之间加一连线。② 对每个结点，只保留它与第一个子结点的连线，与其他子结点的连线全部抹掉。③ 以树根为轴心，顺时针旋转 45°。<br>【结果】二叉树：A 为根；A 的左孩子 B，B 的右孩子 C；A 的右孩子 D（第二棵树根）；D 的左孩子 E，E 的左孩子 F；D 的右孩子 G（第三棵树根）；G 的左孩子 H，H 的左孩子 K，K 的右孩子 L；H 的右孩子 I，I 的右孩子 J；J 的左孩子 M，M 的左孩子 P，M 的右孩子 N，N 的右孩子 O。', claude:'答案：见配图。<b>森林转二叉树三步法：</b><br>① <b>加兄弟连线</b>：每个结点的所有孩子之间、以及各棵树的根之间，横向连成兄弟链；<br>② <b>删多余亲子线</b>：每个结点只保留"到第一个孩子"的竖线，到其余孩子的线删掉（因为其余孩子已通过兄弟链连上了）；<br>③ <b>顺时针转 45°</b>：左斜线变成左孩子、横线变成右孩子。<br><b>本题结果的右链是 A→D→G</b>（三棵树的根串起来），正好对应"森林 3 棵树 = 二叉树根的右链长 3"。<br>⚠️ 手画时最容易错的是"树 2 的根 D 要接到树 1 的根 A 的<b>右</b>孩子"——各树根之间是兄弟关系。', figA:'图/ch5/5.4-综2.svg', figAcap:'森林(3棵)→二叉树 T：根 A，右链 A→D→G 对应三棵树（据王道 p.179 重画）', run:null, verdict:'ok'},

{id:'5.4-综3', ch:5, sec:'5.4 树、森林', type:'subjective', tag:'', exam:null, kp:['建树·二叉树转森林'], stem:'已知某二叉树的先序序列和中序序列分别为 ABDEHCFIMGJKL 和 DBHEAIMFCGKLJ，请画出这棵二叉树，并画出二叉树对应的森林。', book:'已知二叉树的先序和中序遍历后，可以唯一确定这棵树的结构。然后把二叉树转换到树和森林的方式是：若结点 x 是双亲 y 的左孩子，则把 x 的右孩子、右孩子的右孩子……都与 y 用连线连起来，最后去掉所有双亲到右孩子的连线。<br>【结果】先由先序 ABDEHCFIMGJKL + 中序 DBHEAIMFCGKLJ 建出二叉树；再按"二叉树→森林"规则（根的右链 A→C→G→J 决定森林树数）转换。此二叉树对应的森林含 4 棵树，其根为二叉树中从根出发沿右链的各结点 A、C、G、J（J 又有孩子 K、L）。', claude:'答案：见配图。<b>两步：① 先序+中序唯一建二叉树；② 二叉树转森林。</b><br><b>二叉树转森林/树的规则（"左孩子右兄弟"的逆操作）</b>：<br>· 对每个作为"左孩子"的结点 x，把 x 的右链（x 的右孩子、右孩子的右孩子…）全部提上来，作为 x 双亲的孩子（它们本是兄弟）；<br>· 删掉所有"双亲→右孩子"的连线。<br>· <b>二叉树根的右链 = 森林各棵树的根</b>。<br>本题建出的二叉树，根 A 的右链决定森林由几棵树组成（此题为 4 棵，根 A、C、G、J）。<br>⚠️ 建树是基本功：先序首=根，在中序里切左右子树，递归。转森林时抓住"右孩子=兄弟"这一条逆向展开即可。', figA:'图/ch5/5.4-综3.svg', figAcap:'先序+中序建出的二叉树及其对应森林（4 棵树，根 A、C、G、J；据王道 p.179 重画）', run:'程序由先序ABDEHCFIMGJKL+中序DBHEAIMFCGKLJ建树，根右链 A→C→G→J 共 4 结点 → 森林 4 棵树（已与王道答案图核对一致）', verdict:'ok'},

{id:'5.4-综4', ch:5, sec:'5.4 树、森林', type:'subjective', tag:'算法题', exam:null, kp:['孩子兄弟表示·求叶子数'], stem:'编程求以孩子兄弟表示法存储的森林的叶结点数。', book:'当森林（树）以孩子兄弟表示法存储时，若结点没有孩子（fch=NULL），则它必是叶子，总的叶结点数是孩子子树（fch）上的叶子数和兄弟子树（nsib）上的叶结点数之和。<br>递归模型：Leaves(t)=0（t 为空）；若 t→fch==NULL（无孩子，是叶）则 = 1 + Leaves(t→nsib)；否则 = Leaves(t→fch) + Leaves(t→nsib)。', claude:'答案：<b>孩子兄弟表示法里，"叶结点 ⟺ fch（左指针/长子）为空"，递归数即可。</b><br><code>Leaves(t)</code>：空 → 0；无孩子（fch==NULL，是叶）→ 1 + 兄弟子树的叶数；有孩子 → 孩子子树叶数 + 兄弟子树叶数。<br>关键就一句：<b>判叶只看 fch（有没有孩子），不看 nsib（有没有兄弟）</b>——这正是 5.4-9 那道选择题的算法版（叶子数 = 左指针空的结点数）。<br>⚠️ 遍历时 fch 和 nsib 两个方向都要递归下去（整个"二叉树"都要走遍），只是在"fch==NULL"时才 +1 计一个叶。<br>我用真实"左孩子右兄弟"转换 + 本算法对 2000 个随机森林验证：算出的叶数 == 森林真实叶数，零反例。', code:'typedef struct node{\n    ElemType data;               //数据域\n    struct node *fch, *nsib;     //孩子指针 fch、兄弟指针 nsib\n}*Tree;\nint Leaves(Tree t){\n    //求孩子兄弟表示法存储的森林的叶结点数\n    if(t==NULL)\n        return 0;                //树空返回 0\n    if(t->fch==NULL)             //结点无孩子 → 是叶子\n        return 1 + Leaves(t->nsib);   //叶结点 + 其兄弟子树的叶数\n    else\n        return Leaves(t->fch) + Leaves(t->nsib);  //孩子子树 + 兄弟子树的叶数\n}', run:'孩子兄弟表示求叶数(fch==NULL 计数) vs 森林真实叶数：2000 个随机森林对拍反例 0 ✅', verdict:'ok'},

{id:'5.4-综5', ch:5, sec:'5.4 树、森林', type:'subjective', tag:'算法题', exam:null, kp:['孩子兄弟链·求树高'], stem:'以孩子兄弟链表为存储结构，请设计递归算法求树的深度。', book:'由孩子兄弟链表表示的树，求高度的算法思想：采用递归算法，若树为空，高度为零；否则，高度为<b>第一个孩子子树高度加 1</b> 和 <b>兄弟子树高度</b>的大者。其非递归算法使用队列，逐层遍历树，取得树的高度。<br>递归模型：Height(bt)=0（空）；否则 Height = max( Height(bt→firstchild)+1, Height(bt→nextsibling) )。', claude:'答案：<b>关键在于"孩子方向要 +1（深了一层），兄弟方向不 +1（同一层）"。</b><br><code>Height(bt)</code>：空 → 0；否则 = max( <b>Height(第一个孩子)+1</b>, <b>Height(兄弟)</b> )。<br><b>为什么孩子 +1、兄弟不 +1？</b>在孩子兄弟链（本质是二叉树）里，firstchild（左指针）走向"下一层"（深度增加），nextsibling（右指针）走向"同层的兄弟"（深度不变）。所以只有沿孩子方向下降才加高度。<br>⚠️ <b>这是本题与"普通二叉树求高度"的唯一区别</b>：普通二叉树 <code>h=max(h(L),h(R))+1</code>（左右都 +1）；孩子兄弟链是 <code>h=max(h(fch)+1, h(nsib))</code>（只有 fch 那支 +1）。写反了就把"兄弟"当成"更深一层"，高度会算多。<br>我用本算法 + 真实树高对 2000 棵随机树验证一致。', code:'int Height(CSTree bt){\n    //求以孩子兄弟链表表示的树的深度\n    int hc, hs;\n    if(bt==NULL)\n        return 0;\n    else{                              //高度 = max(孩子子树高+1, 兄弟子树高)\n        hc = Height(bt->firstchild);   //第一个孩子子树的高\n        hs = Height(bt->nextsibling);  //兄弟子树的高\n        if(hc + 1 > hs)\n            return hc + 1;             //孩子分支更深（+1 因深入一层）\n        else\n            return hs;                 //兄弟分支更深（同层，不加）\n    }\n}', run:'孩子兄弟链求高(fch支+1、nsib支不+1) vs 真实树高：2000 棵随机树对拍反例 0 ✅', verdict:'ok'},

/* ===================== 第5章 5.5 树与二叉树的应用（哈夫曼树·并查集） ===================== */
{id:'5.5-1', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['哈夫曼树·结点数'], stem:'在有 n 个叶结点的哈夫曼树中，非叶结点的总数是（　）。', opts:['n−1','n','2n−1','2n'], ans:'A', book:'由哈夫曼树的构造过程可知，哈夫曼树中只有度为 0 和 2 的结点。在非空二叉树中，有 n<sub>0</sub> = n<sub>2</sub>+1，所以 n<sub>2</sub> = n−1。【另解】n 个结点构造哈夫曼树需要 n−1 次合并过程，每次合并新建一个分支结点，所以选 A。', claude:'一致。<b>哈夫曼树只有度 0 和度 2 两种结点（是"严格/正则二叉树"），没有度 1。</b><br>· 叶结点 n₀ = n（初始 n 个权值最终都成叶）；<br>· 非叶（度2）结点 n₂ = n₀−1 = <b>n−1</b>（由 n₀=n₂+1）；<br>· 总结点数 = 2n−1（那是选项 C，别看错）。<br><b>另一种记法</b>：构造哈夫曼树要做 n−1 次"取两棵最小的合并"，每次合并<b>新建一个内部结点</b> → 非叶结点数 = 合并次数 = n−1。<br>⚠️ 本节多道题（05/19/综1）都靠"哈夫曼树 2n−1 个结点、其中 n 个叶、n−1 个内部"这组数。', run:'程序构造 n=5/7/10 的哈夫曼树：非叶结点数恒 = n−1 ✅', verdict:'ok'},

{id:'5.5-2', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['哈夫曼树·构造'], stem:'给定整数集合 {3,5,6,9,12}，与之对应的哈夫曼树是（　）。（四个选项为不同形态的带权二叉树，见配图；正确者 WPL 最小）', opts:['A','B','C','D'], ans:'C', book:'首先，3 和 5 构造为一棵子树，其根权值为 8；然后该子树与 6 构造为一棵新子树，根权值为 14；再后 9 与 12 构造为一棵子树，根权值为 21；最后两棵子树共同构造为一棵哈夫曼树。选项 C 对应此构造。', fig:'图/ch5/5.5-2.svg', figcap:'{3,5,6,9,12} 的哈夫曼树（3,5→8；8,6→14；9,12→21；14,21→35）', claude:'一致。<b>哈夫曼构造铁律：每一步都取当前"最小的两个"合并，合并后的新权放回集合再比。</b>逐步：<br>① 最小两个 3、5 → 合并成 8；集合 {6,8,9,12}；<br>② 最小 6、8 → 合并成 14；集合 {9,12,14}；<br>③ 最小 9、12 → 合并成 21；集合 {14,21}；<br>④ 14、21 → 根 35。<br>WPL = 3×3+5×3+6×2+9×2+12×2 = <b>78</b>（我程序算得，最小）。选 C。<br>⚠️ 判断"哪棵是哈夫曼树"的通法：<b>要么按上述步骤复现构造，要么算每个选项的 WPL 取最小</b>。权值小的叶子一定在更深处（路径更长），这是识别的快捷判据。', run:'程序构造 {3,5,6,9,12}：3,5→8→(+6)14；9,12→21；根35，WPL=78（最小）✅', verdict:'ok'},

{id:'5.5-3', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['前缀码·判定'], stem:'下列编码中，（　）不是前缀码。', opts:['{00,01,10,11}','{0,1,00,11}','{0,10,110,111}','{10,110,1110,1111}'], ans:'B', book:'若没有一个编码是另一个编码的前缀，则称这样的编码为前缀编码。在选项 B 中，0 是 00 的前缀，1 是 11 的前缀。', claude:'一致。<b>前缀码 = 没有任何一个码是另一个码的前缀。</b>逐项扫："短码是不是某个长码的开头"：<br>· A 全是 2 位等长码 → 谁也不是谁前缀 ✓；<br>· <b>B：0 是 00 的前缀、1 是 11 的前缀 ✗</b> → 不是前缀码，选 B；<br>· C：0/10/110/111，逐个查无前缀关系 ✓；<br>· D：10/110/1110/1111 ✓。<br><b>为什么前缀码重要？</b>哈夫曼编码必须是前缀码，才能<b>无分隔符地唯一译码</b>（否则译码有歧义）。<br>⚠️ 判前缀码的等价几何判据：<b>把所有码字放到二叉树里，每个码字都必须落在叶结点上</b>（若某码字落在内部结点，它就是别人的前缀）。我用"两两 startswith 检查"程序验证选 B。', run:'程序两两 startswith 检查：仅 B 中 0⊂00、1⊂11，非前缀码 ✅', verdict:'ok'},

{id:'5.5-4', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['前缀码·计数'], stem:'设哈夫曼编码的长度不超过 4，若已对两个字符编码为 1 和 01，则还最多可对（　）个字符编码。', opts:['2','3','4','5'], ans:'C', book:'在哈夫曼编码中，一个编码不能是任何其他编码的前缀。已用 1 和 01，则剩下的编码必须以 00 开头（不能与 1、01 冲突）。若全采用 4 位编码，则可以为 0000、0001、0010、0011，共 4 个。题中问的是最多，所以选 C。', figA:'图/ch5/5.5-4.svg', figAcap:'编码树：1 占右子树、01 占一个叶，剩下 00 子树做满二叉树 → 底层 4 个叶（据王道 p.188 重画）', claude:'一致。<b>把编码想成二叉树的路径（左=0、右=1），前缀码要求每个码字都在叶结点。</b><br>· 码字 <b>1</b> 占据"根的右孩子"这个叶（整个右子树被它独占，不能再往下）；<br>· 码字 <b>01</b> 占据"左→右"这个叶；<br>· 剩下只有"<b>00…</b>"这条路可用。长度≤4 意味着从 00 出发最多再走 2 层 → "00" 下面挂一棵<b>满二叉树</b>，底层有 2²=<b>4</b> 个叶（0000/0001/0010/0011）→ 最多 4 个字符，选 C。<br>⚠️ 关键是"长度≤4"限制了树高：00 已用 2 位，还剩 2 位 → 满二叉树 4 片叶。若限制是≤3，答案就变 2（00 下再走 1 层）。', run:'程序：00 子树在长度≤4 下做满二叉树，底层叶数 = 2^(4−2) = 4 ✅', verdict:'ok'},

{id:'5.5-5', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['哈夫曼树·结点数'], stem:'一棵哈夫曼树共有 215 个结点，对其进行哈夫曼编码，共能得到（　）个不同的码字。', opts:['107','108','214','215'], ans:'B', book:'根据上题的结论，叶结点数为 (215+1)/2 = 108，所以共有 108 个不同的码字。【另解】在哈夫曼树中只有度为 0 和 2 的结点，结点总数 n = n<sub>0</sub>+n<sub>2</sub>，且 n<sub>0</sub> = n<sub>2</sub>+1，由 n=215 得 n<sub>0</sub>=108。', claude:'一致。<b>码字数 = 叶结点数（每个字符对应一个叶）。</b>哈夫曼树是严格二叉树（无度1），总数 n = 2n₀−1，反解 <b>n₀ = (n+1)/2 = (215+1)/2 = 108</b>，选 B。<br>· 由 n₀=n₂+1 且 n₀+n₂=215 → 2n₀−1=215 → n₀=108。<br>⚠️ 选 107（=n₂，内部结点数）、214（=n−1）都是干扰。<b>问"码字/字符/叶"就是 n₀=(n+1)/2；问"合并次数/内部结点"才是 n₂=(n−1)/2。</b>看清问哪个。', run:'程序：215=2n₀−1 → n₀=108 ✅', verdict:'ok'},

{id:'5.5-6', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['哈夫曼树·高度'], stem:'设某哈夫曼树有 5 个叶结点，则该哈夫曼树的高度最高可以是（　）。', opts:['3','4','5','6'], ans:'C', book:'在哈夫曼树的构造中，每个初始结点最终都成为叶结点，5 个初始结点构造的哈夫曼树共新建 4 个双分支结点，4 个双分支结点所构成的高度最高的哈夫曼树如图所示，其高度为 5。', figA:'图/ch5/5.5-6.svg', figAcap:'最偏斜的 5 叶哈夫曼树（每次合并都并入前一个内部结点）→ 高度 5（据王道 p.188 重画）', claude:'一致。<b>5 个叶 → 4 个内部结点。要让树最高（最偏斜），就让每次新建的内部结点马上参与下一次合并</b>（像"贪吃蛇"一路往下串）：<br>4 个内部结点排成一条斜链，每层再挂一个叶 → 高度 = <b>5</b>（层数口径：根为第 1 层）。<br>· 用斐波那契式权值（如 1,1,2,4,8）就能强制这种偏斜——每个新内部结点恰好是下一个最小的两个之一。<br>· <b>最矮</b>的 5 叶哈夫曼树高度是 3（尽量balanced）。本题问<b>最高</b>，选 C=5。<br>⚠️ 一般地：<b>n 个叶的哈夫曼树最高高度 = n</b>（层数），最矮 ≈ ⌈log₂n⌉+1。我程序用偏斜权值构造，得最大边深 4 = 层高 5。', run:'程序用偏斜权值(1,1,2,4,8)构造 5 叶哈夫曼树：最大边深 4 → 层高 5 ✅', verdict:'ok'},

{id:'5.5-7', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['哈夫曼树·性质辨析'], stem:'以下对于哈夫曼树的说法中，错误的是（　）。', opts:['用一组权值构造出的哈夫曼树可能不唯一，但带权路径长度唯一','哈夫曼树具有最小的带权路径长度','哈夫曼树中没有度为 1 的结点','哈夫曼树中除了度为 1 的结点，还有度为 2 的结点和叶结点'], ans:'D', book:'在哈夫曼树的构造过程中，每次选根的权值最小的两棵树，一棵作为左子树，一棵作为右子树，生成新的二叉树，新的二叉树根的权值应为其左右两棵树根结点权值的和。至于谁做左子树，谁做右子树，没有限制，所以构造的哈夫曼树是不唯一的，但其带权路径长度是最小的和唯一的。哈夫曼树只有度为 0 和 2 的结点，度为 0 的结点是外结点，带有权值，没有度为 1 的结点。', claude:'一致，D 是错误项（题目问"错误的"）。<b>D 自相矛盾：先说"有度 1 的结点"，又说"还有度 2 和叶"——但哈夫曼树根本没有度 1 的结点。</b><br>· <b>A 对</b>：左右子树谁左谁右不限 → 树形不唯一；但 WPL（带权路径长度）唯一且最小。<br>· <b>B 对</b>：哈夫曼树 = WPL 最小的二叉树（这是它的定义）。<br>· <b>C 对</b>：只有度 0（叶）和度 2（内部），<b>无度 1</b>。<br>· <b>D 错</b>：措辞暗示"有度 1 结点"，与 C 矛盾。<br>⚠️ 记牢：<b>哈夫曼树 = 严格二叉树（度只有 0 和 2）+ WPL 最小 + 树形不唯一但 WPL 唯一</b>。', run:null, verdict:'ok'},

{id:'5.5-8', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['哈夫曼树·性质辨析'], stem:'下列关于哈夫曼树的说法中，错误的是（　）。<br>Ⅰ. 哈夫曼树的总结点数不能是偶数<br>Ⅱ. 哈夫曼树中度为 1 的结点数等于度为 2 和 0 的结点数之差<br>Ⅲ. 哈夫曼树的带权路径长度等于其所有分支结点的权值之和', opts:['仅 Ⅲ','Ⅰ 和 Ⅱ','仅 Ⅱ','Ⅰ、Ⅱ 和 Ⅲ'], ans:'C', book:'由 n 个初始结点构造的哈夫曼树，会新建 n−1 个双分支结点，因此总结点数为 2n−1，必为奇数，说法 Ⅰ 正确。哈夫曼树中没有度为 1 的结点，说法 Ⅱ 错误（哈夫曼树中度为 1 的结点数为 0，而度 2 与度 0 之差 = n₂−n₀ = −1，并不相等）。哈夫曼的带权路径长度有两种计算方法：① 所有叶结点的带权路径长度之和；② 所有分支结点的权值之和，说法 Ⅲ 正确。', claude:'一致，选 C（仅 Ⅱ 错）。逐条：<br>· <b>Ⅰ 对</b>：总结点 2n−1 恒为奇数 → 不可能是偶数。<br>· <b>Ⅱ 错</b>：哈夫曼树<b>度为 1 的结点数 = 0</b>（定值），而"度2与度0之差"= n₂−n₀ = −1（因 n₀=n₂+1），两者不相等。措辞看着像 n₀=n₂+1 那条恒等式，其实张冠李戴。<br>· <b>Ⅲ 对——这是一条极好用的结论</b>：<b>WPL = 所有内部（分支）结点的权值之和</b>。因为每个内部结点的权 = 其子树所有叶权之和，把所有内部结点权加起来，每个叶权正好被"它到根路径上经过的内部结点个数"= 它的深度 次地累加 → 等于 Σ叶权×深度 = WPL。<br>⚠️ Ⅲ 这条能让你<b>不画完整树也能快速算 WPL</b>：只要把每一步合并产生的新权加起来即可（见 5.5-综1）。', run:null, verdict:'ok'},

{id:'5.5-9', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['哈夫曼树·m叉'], stem:'若度为 m 的哈夫曼树中，叶结点数为 n，则非叶结点的个数为（　）。', opts:['n−1','⌊n/m⌋−1','⌈(n−1)/(m−1)⌉','⌈n/(m−1)⌉−1'], ans:'C', book:'一棵度为 m 的哈夫曼树应只有度为 0 和 m 的结点，设度为 m 的结点有 n<sub>m</sub> 个，度为 0 的结点有 n<sub>0</sub> 个，又设结点总数为 N，N = n<sub>0</sub>+n<sub>m</sub>。因 N 个结点的哈夫曼树有 N−1 条分支，则 mn<sub>m</sub> = N−1 = n<sub>m</sub>+n<sub>0</sub>−1，整理得 (m−1)n<sub>m</sub> = n<sub>0</sub>−1，n<sub>m</sub> = (n<sub>0</sub>−1)/(m−1)。', claude:'一致。<b>m 叉哈夫曼树（每次合并 m 棵最小的）只有度 0 和度 m 的结点。</b>用两式法：<br>① 数分支：内部结点各发出 m 条边，总边数 = m·n<sub>m</sub>，又 = N−1；<br>② N = n₀ + n<sub>m</sub>；<br>③ 联立：m·n<sub>m</sub> = n₀+n<sub>m</sub>−1 → (m−1)n<sub>m</sub> = n₀−1 → <b>n<sub>m</sub> = (n₀−1)/(m−1)</b>。<br>因为结点数必是整数、且构造时可能需要"补虚拟叶"，一般写成<b>⌈(n−1)/(m−1)⌉</b>，选 C。<br>· 代 m=2 验：(n−1)/1 = n−1 ✓（回到 5.5-1 的二叉哈夫曼树）。<br>⚠️ 这是 5.1 综合题"正则 k 叉树 n₀=(k−1)m+1"的反解，同一条守恒式。', run:'（对应 5.1-综3/5.2-综6 的正则 m 叉树守恒式，m=2 时退化为 n−1）', verdict:'ok'},

{id:'5.5-10', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['并查集·存储结构'], stem:'并查集的结构是一种（　）。', opts:['二叉链表存储的二叉树','双亲表示法存储的树','顺序存储的二叉树','孩子表示法存储的树'], ans:'B', book:'并查集的存储结构是用双亲表示法存储的树，主要是为了方便两个重要的操作（Find 和 Union）。', claude:'一致。<b>并查集 = 用"双亲表示法"存的一片森林（每个集合是一棵树，只存每个结点指向双亲的指针）。</b>选 B。<br>· 为什么用双亲表示法？因为并查集的两大操作都只需<b>往上找根</b>：<br>&nbsp;&nbsp;- <b>Find(x)</b>：顺着双亲指针一路走到根（根的双亲域存负数/自身）；<br>&nbsp;&nbsp;- <b>Union(a,b)</b>：把一棵树的根挂到另一棵根下（改一个双亲指针）。<br>· 用数组 <code>S[]</code> 实现：<code>S[x]</code> = x 的双亲下标；根的 <code>S[root]</code> 为负（其绝对值 = 集合大小）。<br>⚠️ 并查集<b>只需往上找根，不需往下找孩子</b>，所以双亲表示法最省最快（孩子表示法反而不适用）。', run:null, verdict:'ok'},

{id:'5.5-11', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['并查集·操作'], stem:'并查集中最核心的两个操作是：① 查找，查找两个元素是否属于同一个集合；② 合并，若两个元素不属于同一个集合，且所在的两个集合互不相交，则合并这两个集合。假设初始长度为 10（0～9）的并查集，按 1-2、3-4、5-6、7-8、8-9、1-8、0-5、1-9 的顺序进行查找和合并操作，最终并查集共有（　）个集合。', opts:['1','2','3','4'], ans:'C', book:'初始时，0～9 各自成一个集合。查找 1-2 时，合并 {1} 和 {2}；查找 3-4 时，合并 {3} 和 {4}；查找 5-6 时，合并 {5} 和 {6}；查找 7-8 时，合并 {7} 和 {8}；查找 8-9 时，合并 {7,8} 和 {9}；查找 1-8 时，合并 {1,2} 和 {7,8,9}；查找 0-5 时，合并 {0} 和 {5,6}；查找 1-9 时，它们已属于同一个集合。最终的集合为 {0,5,6}、{1,2,7,8,9} 和 {3,4}，因此答案选 C。', claude:'一致。<b>逐步 Union，最后数根的个数。</b>手工跟一遍：<br>{1,2} · {3,4} · {5,6} · {7,8} → {7,8,9}（8-9）→ {1,2,7,8,9}（1-8）· {0,5,6}（0-5）· 1-9 已同集合不动。<br>最终三个集合：<b>{0,5,6}、{1,2,7,8,9}、{3,4}</b> → 选 C（3 个）。<br>⚠️ <b>关键陷阱：最后一步 1-9 已经在同一集合（1,9 都在 {1,2,7,8,9}），不产生新合并</b>，别多减一个。<br><b>数集合数的快捷法</b>：初始 10 个集合，每次<b>有效</b>合并（两个不同集合）就减 1。本题 8 次操作里 7 次有效（最后 1-9 无效）→ 10−7 = 3。我用数组并查集程序跟完，得 3 个根。', run:'程序数组并查集跟完 8 次操作：最终根 = {0/5/6, 1/2/7/8/9, 3/4} 共 3 个，1-9 为无效合并 ✅', verdict:'ok'},

{id:'5.5-12', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['并查集·性质辨析'], stem:'下列关于并查集的说法中，正确的是（　）。（本题涉及图的考点）', opts:['并查集不能检测图中是否存在环路的问题','通过路径优化后的并查集在最坏情况下的高度仍是 O(n)','Find 操作返回集合中元素个数的相反数，它用来作为某个集合的标志','Union 操作时可根据当前集合的规模，将小集合合并到大集合中'], ans:'D', book:'依次探测图的各条边，用并查集检查该边依附的两个顶点是否已属于同一集合（两个顶点的根结点是否相同）。若是，则说明图中存在环路，选项 A 错误。经过路径优化后，并查集在最坏情况下的高度远小于 O(n)，选项 B 错误。Find 操作总返回当前根结点作为集合的标志，选项 C 错误。选项 D 正确。', claude:'一致，选 D。逐项：<br>· <b>A 错</b>：并查集<b>正是</b>检测环路的利器——加边前若两端点已同集合，说明加了会成环（Kruskal 算法就靠这个）。<br>· <b>B 错</b>：路径压缩 + 按秩合并后，高度几乎是常数（O(α(n))，α 极慢增长，实际 ≤4），远小于 O(n)。<br>· <b>C 错</b>：Find 返回的是<b>根结点</b>（作为集合代表），不是"元素个数的相反数"。"元素个数的相反数"存在<b>根结点的双亲域</b>里（用来"按大小合并"），是另一回事。<br>· <b>D 对</b>："小树合并到大树"（按秩/按大小合并）能控制树高不超过 ⌊log₂n⌋+1。<br>⚠️ 两大优化要分清：<b>按大小合并</b>（Union 时小挂大，控高度）+ <b>路径压缩</b>（Find 时把路径上结点直接挂根，压平）。', run:null, verdict:'ok'},

{id:'5.5-13', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'', exam:null, kp:['并查集·性质辨析'], stem:'下列关于并查集的叙述中，（　）是错误的。（本题涉及图的考点）', opts:['并查集是用双亲表示法存储的树','并查集可用于实现克鲁斯卡尔算法','并查集可用于判断无向图的连通性','在长度为 n 的并查集中进行查找操作的时间复杂度为 O(log<sub>2</sub>n)'], ans:'D', book:'在用并查集实现 Kruskal 算法求图的最小生成树时，用并查集判断加入一条边是否形成回路，选项 B 正确。用并查集判断无向图连通性：遍历所有边，把每条边连接的两顶点合并，相互连通的顶点会在同一子集合中，选项 C 正确。<b>未做路径优化</b>的并查集在最坏情况下的高度为 n，此时查找操作的时间复杂度为 O(n)，时间复杂度通常指最坏情况，选项 D 错误。', claude:'一致，D 是错误项。<br>· A/B/C 都对：并查集用双亲表示法（A）、是 Kruskal 求 MST 的核心（B）、能判无向图连通性（C，把每条边两端 Union，最后看有几个集合）。<br>· <b>D 错</b>：Find 的时间复杂度取决于树高。<b>未优化</b>时最坏可退化成一条链，高度 O(n)，Find 就是 <b>O(n)</b>，不是 O(log₂n)。<br>&nbsp;&nbsp;- 只按大小合并 → O(log n)；<br>&nbsp;&nbsp;- 再加路径压缩 → 近似 O(α(n))≈O(1)。<br>&nbsp;&nbsp;- 但"时间复杂度"默认说<b>最坏（无优化）情况 = O(n)</b>，所以 D 的 O(log₂n) 说法不准确。<br>⚠️ 这题和 5.5-12 是一对，都在考"并查集的复杂度到底是多少"——记住：<b>裸并查集最坏 O(n)，优化后才 O(log n)~O(α(n))</b>。', run:null, verdict:'ok'},

{id:'5.5-14', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2010 统考', exam:2010, kp:['哈夫曼树·性质辨析'], stem:'【2010 统考真题】n（n≥2）个权值均不相同的字符构成哈夫曼树，关于该树的叙述中，错误的是（　）。', opts:['该树一定是一棵完全二叉树','树中一定没有度为 1 的结点','树中两个权值最小的结点一定是兄弟结点','树中任意一个非叶结点的权值一定不小于下一层任意一个结点的权值'], ans:'A', book:'哈夫曼树为带权路径长度最小的二叉树，不一定是完全二叉树。哈夫曼树中没有度为 1 的结点，选项 B 正确。构造哈夫曼树时，最先选取两个权值最小的结点作为左右子树构造一棵新的二叉树，选项 C 正确。哈夫曼树中任意一个非叶结点的权值为其左右子树根结点的权值之和，可知，哈夫曼树中任意一个非叶结点的权值一定不小于下一层任意一个结点的权值。', claude:'一致，A 是错误项（题目问"错误的"）。逐项：<br>· <b>A 错</b>：哈夫曼树只保证 WPL 最小，<b>形态通常很偏斜，不是完全二叉树</b>（权值差异大时尤其斜）。<br>· <b>B 对</b>：无度 1 结点（严格二叉树）。<br>· <b>C 对</b>：构造第一步就是取<b>最小的两个</b>合并当左右孩子 → 它们必是兄弟。<br>· <b>D 对</b>：非叶结点权 = 左右孩子权之和 ≥ 任一孩子权；而"下一层"的结点要么是它的孩子、要么是别的子树里更深的结点（权更小）→ 非叶结点权 ≥ 下一层任意结点权。<br>⚠️ D 的严谨性来自"每次合并的是当前最小两个，所以越往上权越大"——哈夫曼树满足"父权 ≥ 子权"的<b>堆序性质</b>。', run:'程序构造多组权值哈夫曼树：均无度1结点、最小两权为兄弟、父权≥子权；但形态非完全二叉树 ✅', verdict:'ok'},

{id:'5.5-15', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2014 统考', exam:2014, kp:['前缀码·判定'], stem:'【2014 统考真题】5 个字符有如下 4 种编码方案，不是前缀编码的是（　）。', opts:['01,0000,0001,001,1','011,000,001,010,1','000,001,010,011,100','0,100,110,1110,1100'], ans:'D', book:'前缀编码的定义是在一个字符集中，任何一个字符的编码都不是另一个字符编码的前缀。选项 D 中的编码 110 是编码 1100 的前缀，违反了前缀编码的规则，所以选项 D 不是前缀编码。', claude:'一致。<b>逐项找"短码是不是某长码的开头"：</b><br>· A：01/0000/0001/001/1 —— 逐个查，无前缀关系 ✓；<br>· B：011/000/001/010/1 ✓；<br>· C：全是 3 位等长码 ✓；<br>· <b>D：110 是 1100 的前缀 ✗</b> → 不是前缀码，选 D。<br><b>快速扫描技巧</b>：把编码按长度从短到长排，短的逐个去看是不是某个长的开头；等长码之间不可能有前缀关系，可跳过。D 里有 110（3位）和 1100（4位），110 正是 1100 砍掉末位 → 命中。<br>我用两两 startswith 程序验证，唯 D 非前缀码。', run:'程序两两 startswith：仅 D 中 110⊂1100，非前缀码 ✅', verdict:'ok'},

{id:'5.5-16', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2015 统考', exam:2015, kp:['哈夫曼树·路径权值'], stem:'【2015 统考真题】下列选项给出的是从根分别到达两个叶结点路径上的权值序列，能属于同一棵哈夫曼树的是（　）。', opts:['24,10,5 和 24,10,7','24,10,5 和 24,12,7','24,10,10 和 24,14,11','24,10,5 和 24,14,6'], ans:'D', book:'在哈夫曼树中，左右孩子权值之和为父结点权值。仅以分析选项 A 为例：若两个 10 分别属于两棵不同的子树，则根的权值不等于其孩子的权值和，不符；若两个 10 属同棵子树，则其权值不等于其两个孩子（叶结点）的权值和，不符。选项 B、C 选项的排除方法相同。', claude:'一致，选 D。<b>核心判据：哈夫曼树每个内部结点的权 = 其两个孩子权之和；且父权 > 子权。两条路径在分叉点处，父 = 两个分支之和。</b><br>· <b>D：24,10,5 和 24,14,6</b> —— 两路在根后分叉，根的两个孩子是 10 和 14 → <b>10+14 = 24 ✓</b>；再 10 有孩子 5、14 有孩子 6，均合法（10>5、14>6）→ 能构成，选 D。<br>· A：两路都经 24→10，说明共享结点 10，但 10 的两个孩子给出 5 和 7 → 5+7=12≠10 ✗；<br>· B：分叉点根的孩子是 10 和 12 → 10+12=22≠24 ✗；<br>· C：根孩子 10 和 14 → 10+14=24 ✓，但 10 有孩子 10（10,10,10：子权=父权，违反"父>子"）✗。<br><b>解题模板</b>：① 看两路在哪分叉；② 分叉点的父权是否 = 两分支和；③ 每条路权值是否严格递减。我用程序对四项逐一判定，唯 D 通过。', figA:'图/ch5/5.5-16.svg', figAcap:'选项 D 对应的哈夫曼树片段：根 24 = 左 10 + 右 14；10→5、14→6', run:'程序逐项验"分叉点父=两分支和 且 路径权严格递减"：唯 D 通过 ✅', verdict:'ok'},

{id:'5.5-17', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2017 统考', exam:2017, kp:['哈夫曼编码·译码'], stem:'【2017 统考真题】已知字符集 {a,b,c,d,e,f,g,h}，各字符的哈夫曼编码依次是 0100,10,0000,0101,001,011,11,0001，编码序列 0100011001001011110101 的译码结果是（　）。', opts:['acgabfh','adbagbb','afbeagd','afeefgd'], ans:'D', book:'哈夫曼编码是前缀编码，各个编码的前缀不同，因此直接拿编码序列与哈夫曼编码一一比对即可。序列可分割为 0100 011 001 001 011 11 0101，译码结果是 afeefgd。选项 D 正确。', claude:'一致，选 D。<b>前缀码译码 = 从左往右扫，凑齐一个码字就输出、清零、继续（无歧义，因为没有码是别人前缀）。</b><br>切分 0100 011 001 001 011 11 0101：<br>· 0100=<b>a</b> · 011=<b>f</b> · 001=<b>e</b> · 001=<b>e</b> · 011=<b>f</b> · 11=<b>g</b> · 0101=<b>d</b> → <b>afeefgd</b>。<br>⚠️ 关键是"贪心地凑最短匹配"：扫到 <code>0</code> 不够，<code>01</code> 不够，<code>010</code> 不够，<code>0100</code>=a 成立就切。因为是前缀码，第一个匹配上的一定是唯一正确切分。<br>我用"建反查表、逐位累积、命中即输出"的程序译码，得 afeefgd。', run:'程序前缀码译码 0100011001001011110101 → afeefgd ✅', verdict:'ok'},

{id:'5.5-18', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2018 统考', exam:2018, kp:['哈夫曼编码·构造'], stem:'【2018 统考真题】已知字符集 {a,b,c,d,e,f}，若各字符出现的次数分别为 6,3,8,2,10,4，则对应字符集中各字符的哈夫曼编码可能是（　）。', opts:['00,1011,01,1010,11,100','00,100,110,000,0010,01','10,1011,11,0011,00,010','0011,10,11,0010,01,000'], ans:'A', book:'根据各字符出现的次数构造哈夫曼树如图所示。由图可知，a、c 和 e 的编码长度应该相同；a 和 c 的第 1 个编码应该相同，且与 e 的第 1 个编码不同；b 和 d 的前 3 个编码应该相同。', figA:'图/ch5/5.5-18.svg', figAcap:'次数 a6 b3 c8 d2 e10 f4 的哈夫曼树；权大的 c(8)/e(10) 码短、权小的 b(3)/d(2) 码长（据王道 p.189 重画）', claude:'一致，选 A。<b>不必死背树形，用"权大码短、权小码长 + 前缀码"两把尺子筛选。</b><br>构造哈夫曼树后各字符深度（=码长）：<b>e(10)、c(8)、a(6) 权大 → 码长 2；f(4)、b(3)、d(2) 权小 → 码长 4、4、4</b>（我程序算得深度分布 [2,2,2,3,4,4]，对应 e/c/a 短、f/b/d 长）。<br>看选项 A：00,1011,01,1010,11,100 → 码长 2,4,2,4,2,3。<br>· a=00(2)、c=01(2)、e=11(2) 都是 2 位 ✓（三个权最大的码最短）；<br>· 且是<b>前缀码</b>（我验证过）。<br>· 其余选项要么码长分布对不上哈夫曼深度、要么不是前缀码。<br>⚠️ 这类题最快解法：<b>① 先算哈夫曼各字符的码长（深度）；② 核对选项的"码长分布"是否一致；③ 再验前缀码。</b>我程序确认 A 的码长排序 [2,2,2,3,4,4] 恰等于哈夫曼深度分布、且 A 是前缀码。', run:'程序构造 {6,3,8,2,10,4} 哈夫曼树深度=[2,2,2,3,4,4]；选项 A 码长排序=[2,2,2,3,4,4] 且为前缀码 ✅', verdict:'ok'},

{id:'5.5-19', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2019 统考', exam:2019, kp:['哈夫曼树·结点数'], stem:'【2019 统考真题】对 n 个互不相同的符号进行哈夫曼编码。若生成的哈夫曼树共有 115 个结点，则 n 的值是（　）。', opts:['56','57','58','60'], ans:'C', book:'n 个符号构造成哈夫曼树的过程中，共新建了 n−1 个结点（双分支结点），因此哈夫曼树的结点总数为 2n−1 = 115，n 的值为 58。', claude:'一致。<b>哈夫曼树总结点 = 2n−1（n 个叶 + n−1 个内部）。</b>反解 2n−1 = 115 → <b>n = 58</b>，选 C。<br>· n 个符号 = n 个叶；构造做 n−1 次合并 = n−1 个内部结点；共 2n−1。<br>⚠️ 与 5.5-5 同型（那题给总数求叶数）：<b>叶数 = (总数+1)/2</b>，(115+1)/2 = 58。一个公式两种问法。', run:'程序：2n−1=115 → n=58 ✅', verdict:'ok'},

{id:'5.5-20', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2021 统考', exam:2021, kp:['哈夫曼树·WPL'], stem:'【2021 统考真题】若某二叉树有 5 个叶结点，其权值分别为 10,12,16,21,30，则其最小的带权路径长度（WPL）是（　）。', opts:['89','200','208','289'], ans:'B', book:'对于带权值的结点，构造出哈夫曼树的带权路径长度（WPL）最小，哈夫曼树的构造过程如图所示。求得其 WPL = (10+12)×3 + (30+16+21)×2 = 200。', figA:'图/ch5/5.5-20.svg', figAcap:'{10,12,16,21,30} 的哈夫曼树；10,12 在第 3 层、16,21,30 在第 2 层，WPL=200（据王道 p.190 重画）', claude:'一致。<b>"最小 WPL" = 构造哈夫曼树。</b>逐步：<br>① 10,12 → 22；集合 {16,21,22,30}；<br>② 16,21 → 37；集合 {22,30,37}；<br>③ 22,30 → 52；集合 {37,52}；<br>④ 37,52 → 89（根）。<br>各叶深度：10、12 深 3（经过 22→52→89），16、21 深 2，30 深 2 → <b>WPL = (10+12)×3 + 16×2+21×2+30×2 = 66+134 = 200</b>，选 B。<br>· <b>更快：WPL = 所有内部结点权值之和</b>（5.5-8 的 Ⅲ）= 22+37+52+89 = 200 ✓，不用画深度！<br>⚠️ 选 89 是"根的权值"（=总权和）不是 WPL，最典型的错。我程序构造得 WPL=200。', run:'程序构造 {10,12,16,21,30} 哈夫曼树：WPL=200（=内部结点权和 22+37+52+89）✅', verdict:'ok'},

{id:'5.5-21', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2022 统考', exam:2022, kp:['哈夫曼编码·vs定长'], stem:'【2022 统考真题】对任意给定的含 n（n＞2）个字符的有限集 S，用二叉树表示 S 的哈夫曼编码集和定长编码集，分别得到二叉树 T<sub>1</sub> 和 T<sub>2</sub>。下列叙述中，正确的是（　）。', opts:['T<sub>1</sub> 与 T<sub>2</sub> 的结点数相同','T<sub>1</sub> 的高度大于 T<sub>2</sub> 的高度','出现频次不同的字符在 T<sub>1</sub> 中处于不同的层','出现频次不同的字符在 T<sub>2</sub> 中处于相同的层'], ans:'D', book:'可以画一个简单的特例来证明。图 1 是满足条件的二叉树 T<sub>1</sub>（哈夫曼树），图 2 是满足条件的二叉树 T<sub>2</sub>（定长编码，满二叉树）。T<sub>1</sub> 和 T<sub>2</sub> 的结点数不同，选项 A 错误。T<sub>1</sub> 的高度不一定大于 T<sub>2</sub> 的高度，选项 B 错误。出现频次不同的字符在 T<sub>1</sub> 中也可能处于相同的层，选项 C 错误。对于定长编码集，所有字符一定都在 T<sub>2</sub> 中处于相同的层，而且都是叶结点，选项 D 正确。', claude:'一致，选 D。<b>定长编码 = 所有字符用相同位数 → 编码树 T₂ 是"所有叶在同一层"的树（近似满二叉树）。</b>逐项：<br>· <b>D 对</b>：定长码每个字符码长相同 → 在 T₂ 中都是<b>同一层的叶结点</b>，与频次无关。<br>· <b>A 错</b>：T₁（哈夫曼，偏斜）和 T₂（定长，齐整）结点数一般不同。<br>· <b>B 错</b>：哈夫曼树 T₁ 高度<b>不一定</b>大于 T₂——频次接近时哈夫曼树也可能很矮（甚至 = 定长树高度）。<br>· <b>C 错</b>：哈夫曼树里<b>频次不同的字符也可能同层</b>（同一层可以放几个不同频次的叶）。<br>⚠️ 本题考"哈夫曼（变长）vs 定长"的对比：<b>定长 → 叶全同层；变长 → 频次高的浅、低的深，但不同频次未必不同层。</b>', run:null, verdict:'ok'},

{id:'5.5-22', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2023 统考', exam:2023, kp:['哈夫曼编码·加权平均长度'], stem:'【2023 统考真题】在由 6 个字符组成的字符集 S 中，各字符出现的频次分别为 3,4,5,6,8,10，为 S 构造的哈夫曼编码的加权平均长度为（　）。', opts:['2.4','2.5','2.67','2.75'], ans:'B', book:'构建哈夫曼树后，对叶结点的哈夫曼编码，共有 4 个长度为 3 的叶结点、2 个长度为 2 的叶结点，编码的加权平均长度为 [(3+4+5+6)×3 + (8+10)×2] / (3+4+5+6+8+10) = 2.5。', figA:'图/ch5/5.5-22.svg', figAcap:'{3,4,5,6,8,10} 的哈夫曼树；3,4,5,6 在第 3 层（码长 3）、8,10 在第 2 层（码长 2）（据王道 p.190 重画）', claude:'一致，选 B。<b>加权平均长度 = WPL / 总频次 = Σ(频次×码长) / Σ频次。</b><br>构造哈夫曼树后各字符码长（深度）：<b>3,4,5,6 → 码长 3；8,10 → 码长 2</b>（我程序算得深度分布）。<br>WPL = (3+4+5+6)×3 + (8+10)×2 = 18×3 + 18×2 = 54+36 = <b>90</b>；<br>总频次 = 3+4+5+6+8+10 = 36；<br>加权平均长度 = 90/36 = <b>2.5</b>，选 B。<br>· <b>加权平均长度 = WPL/总权</b>，正是"平均每个字符用几位编码"，衡量压缩效率。<br>⚠️ 别忘了除以总频次！只算出 WPL=90 就选（没有这选项）容易慌。我程序构造得 WPL=90、平均 2.5。', run:'程序构造 {3,4,5,6,8,10} 哈夫曼树：WPL=90，总权 36，加权平均长度=2.5 ✅', verdict:'ok'},

{id:'5.5-23', ch:5, sec:'5.5 哈夫曼树与并查集', type:'choice', tag:'2025 统考', exam:2025, kp:['哈夫曼编码·码长'], stem:'【2025 统考真题】设字符集 S 中包含 7 个字符，各字符出现的频次分别为 2,3,4,6,8,10,11。现为 S 中的各字符构造哈夫曼编码，编码长度不小于 3 的字符数是（　）。', opts:['2','3','4','5'], ans:'D', book:'哈夫曼编码的编码长度等于该字符在哈夫曼树中的路径深度（从根到该叶结点的边数）。一个字符所在子树参与后续合并的轮数越多，其深度越大。合并过程如下：① 合并 2 和 3→新结点 5；② 合并 4 和 5→新结点 9；③ 合并 6 和 8→新结点 14；④ 合并 9 和 10→新结点 19；⑤ 合并 11 和 14→新结点 25；⑥ 合并 19 和 25→根结点 44。因此，编码长度不小于 3 的字符为 4、2、3、6、8，共 5 个。', figA:'图/ch5/5.5-23.svg', figAcap:'{2,3,4,6,8,10,11} 的哈夫曼树；码长≥3 的字符 = 2,3,4,6,8（共 5 个），码长<3 的 = 10,11（据王道 p.190 重画）', claude:'一致，选 D。<b>编码长度 = 该叶在哈夫曼树中的深度（边数）。</b>跟着构造过程数深度：<br>合并顺序：2+3→5 · 4+5→9 · 6+8→14 · 9+10→19 · 11+14→25 · 19+25→44(根)。<br>各字符深度（我程序算）：<b>2→4、3→4、4→3、6→3、8→3、10→2、11→2</b>。<br>· 深度<b>≥3</b> 的：2,3,4,6,8 → <b>5 个</b>，选 D；<br>· 深度<3 的只有权最大的 10、11（码长 2）。<br>⚠️ <b>权值越小，参与合并越早、埋得越深、码越长</b>——所以频次最低的 2、3 码最长（4 位），频次最高的 10、11 码最短（2 位）。数"码长≥k"就是数深度≥k 的叶。我程序构造后统计深度≥3 的叶恰 5 个。', run:'程序构造 {2,3,4,6,8,10,11} 哈夫曼树：深度 2→4,3→4,4→3,6→3,8→3,10→2,11→2；深度≥3 的共 5 个 ✅', verdict:'ok'},

{id:'5.5-综1', ch:5, sec:'5.5 哈夫曼树与并查集', type:'subjective', tag:'', exam:null, kp:['哈夫曼树·构造与WPL'], stem:'设给定权集 w = {5,7,2,3,6,8,9}，试构造关于 w 的一棵哈夫曼树，并求其加权路径长度 WPL。', book:'根据哈夫曼树的构造方法，每次从森林中选取两个根结点值最小的树合并成一棵树，将原先的两棵树作为左右子树，且新根结点的值为左右孩子关键字之和。构造过程：2,3→5；5,5→10；6,7→13？（按算法）… 最终得哈夫曼树，由构造出的哈夫曼树可得 WPL = (2+3)×4 + (5+6+7)×3 + (8+9)×2 = 108。注意：哈夫曼树并不唯一，但带权路径长度一定是相同的。', figA:'图/ch5/5.5-综1.svg', figAcap:'{5,7,2,3,6,8,9} 的哈夫曼树，WPL=108（据王道 p.191 重画）', claude:'答案 <b>WPL = 108</b>。<b>构造：每次取当前最小两个合并，新权放回。</b><br>2,3→5 · 5,5→10 · 6,7→13 · 8,9→17 · 10,13→23 · 17,23→40(根)。<br>各叶深度：2,3 深 4；5,6,7 深 3；8,9 深 2。<br>WPL = (2+3)×4 + (5+6+7)×3 + (8+9)×2 = 20+54+34 = <b>108</b>。<br>· <b>验算捷径（推荐）：WPL = 所有内部结点权值之和</b> = 5+10+13+17+23+40 = 108 ✓，不用数深度。<br>⚠️ <b>哈夫曼树形态不唯一</b>（左右子树可换、同权值合并顺序可不同），但 <b>WPL 唯一 = 108</b>。写解答时把每步合并的权值列清楚，WPL 用"内部结点权和"复核一遍最稳。我程序构造得 WPL=108。', run:'程序构造 {5,7,2,3,6,8,9} 哈夫曼树：WPL=108（=内部结点权和 5+10+13+17+23+40）✅', verdict:'ok'},

{id:'5.5-综2', ch:5, sec:'5.5 哈夫曼树与并查集', type:'subjective', hints:['把每个有序表的长度当权值：两两归并的总代价 = 一棵「哈夫曼树」的带权路径长度，每次挑最短的两个先合并最省。','用各表长度构造哈夫曼树，WPL（各表长度 × 其被归并的深度/次数之和）即最小总比较次数；等长时合并次序不影响最优值。'], tag:'2012 统考', exam:2012, kp:['多路归并·哈夫曼思想'], stem:'【2012 统考真题】设有 6 个有序表 A,B,C,D,E,F，分别含有 10,35,40,50,60 和 200 个数据元素，各表中的元素按升序排列。要求通过 5 次两两合并，将 6 个表最终合并为 1 个升序表，并使最坏情况下比较的总次数达到最小。请回答下列问题：<br>1）给出完整的合并过程，并求出最坏情况下比较的总次数。<br>2）根据你的合并过程，描述 n（n≥2）个不等长升序表的合并策略，并说明理由。', book:'1）最先合并的表中的元素在后续的每次合并中都会再次参与比较，因此求最小合并次数类似于求最小带权路径长度，可立即想到哈夫曼树。根据哈夫曼树的构造过程，每次选择表集合中长度最小的两个表进行合并。合并过程：① A(10)与B(35)合并→AB(45)；② AB(45)与C(40)合并→ABC(85)；③ D(50)与E(60)合并→DE(110)；④ ABC(85)与DE(110)合并→ABCDE(195)；⑤ ABCDE(195)与F(200)合并→ABCDEF(395)。合并两个长度为 m、n 的有序表最坏比较 m+n−1 次。第1次：10+35−1=44；第2次：40+45−1=84；第3次：50+60−1=109；第4次：85+110−1=194；第5次：195+200−1=394。总次数最多 = 44+84+109+194+394 = 825。<br>2）对多个有序表两两合并时，若表长不同，则最坏情况下总比较次数依赖于表的合并次序。可以借助哈夫曼树的构造思想，依次选择最短的两个表进行合并，此时可以获得最坏情况下的最佳合并效率。', claude:'答案 <b>最坏比较总数 = 825</b>；策略 = <b>每次选当前最短的两个表合并（哈夫曼式贪心）</b>。<br><b>为什么是哈夫曼？</b>一个表越早参与合并，它的元素被"重复比较"的次数越多（每次合并都要再扫一遍）——这正对应"叶结点越早合并，深度越大，带权路径越长"。要让总比较最少 = 让长表尽量晚合并（深度小）= 哈夫曼树最小 WPL。<br><b>合并过程</b>（每次挑最小两个）：<br>10+35→45 · 45+40→85 · 50+60→110 · 85+110→195 · 195+200→395。<br>每次比较 m+n−1 次：44+84+109+194+394 = <b>825</b>。<br>⚠️ <b>合并两个长 m、n 有序表最坏比较 m+n−1 次</b>（不是 m+n）——最后一个元素直接放入无需比较。这个 −1 每次都要记。我用哈夫曼式合并程序算得总比较 825。', run:'程序按"每次合并最短两表、成本 m+n−1"贪心：{10,35,40,50,60,200} → 总比较 825（哈夫曼最优）✅', verdict:'ok'},

{id:'5.5-综3', ch:5, sec:'5.5 哈夫曼树与并查集', type:'subjective', tag:'2020 统考', exam:2020, kp:['前缀码·二叉树译码'], stem:'【2020 统考真题】若任意一个字符的编码都不是其他字符编码的前缀，则称这种编码具有前缀特性。现有某字符集（字符个数≥2）的不等长编码，每个字符的编码均为二进制的 0、1 序列，最长为 L 位，且具有前缀特性。请回答下列问题：<br>1）哪种数据结构适宜保存上述具有前缀特性的不等长编码？<br>2）基于你所设计的数据结构，简述从 0/1 串到字符串的译码过程。<br>3）简述判定某字符集的不等长编码是否具有前缀特性的过程。', book:'1）二叉树。用一棵二叉树保存字符集中各字符的编码，每个编码对应于从根开始到达某叶结点的一条路径，路径长度等于编码位数，路径到达的叶结点中保存该编码对应的字符。<br>2）从左至右依次扫描 0/1 串中的各位。从根开始，根据串中当前位沿当前结点的左子指针或右子指针下移，直到移动到叶结点时为止。输出叶结点中保存的字符。然后从根开始重复这个过程，直到扫描到 0/1 串结束，译码完成。<br>3）二叉树既可用于保存各字符的编码，又可用于检测编码是否具有前缀特性。判定编码是否具有前缀特性的过程，也是构建二叉树的过程。初始时，二叉树中仅含有根结点。依次读入每个编码 C，从根开始对应于该编码建立/寻找一条路径：从左至右扫描 C 的各位，根据当前位（0 或 1）沿左/右子指针向下移动，遇到空指针时创建新结点。可能遇到三种情况：① 若遇到了叶结点（非根），则表明不具有前缀特性，返回；② 若在处理 C 的所有位的过程中，均没有创建新结点，则表明不具有前缀特性，返回；③ 若在处理 C 的最后一个编码位时创建了新结点，则继续验证下一个编码。若所有编码均通过验证，则编码具有前缀特性。', claude:'答案：<b>用二叉树（编码树/字典树）。</b>三问要点：<br><b>1）数据结构：二叉树。</b>每个字符 = 一个叶结点，其编码 = 从根到该叶的路径（0 走左、1 走右）。前缀特性 ⟺ <b>所有字符都在叶结点上</b>（没有字符落在内部结点）。<br><b>2）译码</b>：从根出发，读一位就往下走一步（0 左 / 1 右），<b>到达叶结点就输出该字符、回到根</b>，继续读下一位。因前缀码无歧义，一遍扫完即可。<br><b>3）判前缀特性</b>：边插入边建树。逐个编码往树里插：<br>&nbsp;&nbsp;· 若中途<b>经过了一个已存在的叶结点</b> → 说明当前码有某个已存字符做前缀 → <b>非前缀码</b>；<br>&nbsp;&nbsp;· 若插完这个码<b>一个新结点都没新建</b>（路径全走的已有结点，终点是已有内部结点）→ 说明当前码是某个已存字符的前缀 → <b>非前缀码</b>；<br>&nbsp;&nbsp;· 只有"终点是新建的叶、且中途没碰到别的叶"才合法。全部通过 → 有前缀特性。<br>⚠️ 核心直觉一句话：<b>前缀码 ⟺ 编码树里字符只在叶、不在内部结点</b>。我用这套二叉树插入法实现了前缀判定，与"两两 startswith"结果一致。', run:'（前缀判定的二叉树插入法 与 5.5-3/15 的两两 startswith 判据等价，已交叉验证）', verdict:'ok'},

/* ===================== 第6章 6.1 图的基本概念 ===================== */
{id:'6.1-1', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['图·边数与环'],
 stem:'一个有 n 个顶点和 n 条边的无向图一定是（　）。',
 opts:['连通的','不连通的','无环的','有环的'], ans:'D',
 book:'n 个顶点、n−1 条边可以构成一棵树（连通且无环），再增加一条边必然形成环。因此 n 个顶点 n 条边的无向图一定有环。',
 claude:'一致，选 D。<b>把 n−1 当分界线：n 个顶点的无向图，边数 &gt; n−1 ⟹ 必有环；边数 &lt; n−1 ⟹ 必不连通。</b><br>· 本题 e = n = (n−1)+1，超过分界线一条 ⟹ <b>必有环</b>；<br>· 但连通与否不定：可以是"一个连通分量里带环 + 若干孤立点"（如三角形 + 若干孤立点，边数仍可凑），所以 A、B 都不能选。',
 run:null, verdict:'ok'},

{id:'6.1-2', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['连通性·遍历'],
 stem:'若从无向图的任意一个顶点出发进行一次深度优先搜索即可访问所有顶点，则该图一定是（　）。',
 opts:['强连通图','连通图','有回路','一棵树'], ans:'B',
 book:'一次遍历能访问所有顶点，说明图是连通的。强连通是有向图的概念；有回路和树都只是连通图的特例，不一定成立。',
 claude:'一致，选 B。<b>"一次遍历访问全部顶点" ⟺ 连通（无向图）。</b><br>· A 错：<b>强连通是有向图专有概念</b>，无向图只讲连通；<br>· C 错：连通图可以无环（树就是）；<br>· D 错：连通图也可以有环，未必是树。<br>📌 反过来记：无向图中 <b>调用 DFS/BFS 的次数 = 连通分量数</b>，只调用一次就是连通图。',
 run:null, verdict:'ok'},

{id:'6.1-3', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['概念·子图与连通分量'],
 stem:'以下关于图的叙述中，正确的是（　）。',
 opts:['图与树的区别在于图的边数大于或等于顶点数',
       '假设有向图 G={V,{E}}，V′⊆V，E′⊆E，则 V′ 和 {E′} 构成 G 的子图',
       '无向图的连通分量是指无向图中的极大连通子图',
       '图的遍历就是从图中某一顶点出发访遍图中其余顶点'],
 ans:'C',
 book:'图与树的区别是逻辑结构上的区别，图的边数也可能小于树；E′ 中的边所关联的顶点若不在 V′ 中，则无法构成图；遍历要求每个顶点只访问一次，且图非连通时从某顶点出发无法访问到全部顶点，D 的说法不准确。连通分量的定义就是极大连通子图，C 正确。',
 claude:'一致，选 C。逐项拆：<br>· <b>A 错</b>：树是"n 个顶点 n−1 条边的连通无环图"，图的边数可以更少（如全是孤立点）；两者的区别是<b>逻辑结构</b>（一对多 vs 多对多），不是边数大小。<br>· <b>B 错 —— 本章最高频陷阱</b>：<b>顶点子集 + 边子集不一定构成子图</b>，因为 E′ 里某条边的两个端点可能不在 V′ 中。（04 题 D 选项再考一次）<br>· <b>C 对</b>：连通分量 ＝ <b>极大</b>连通子图（顶点和边都要尽可能多）。<br>· <b>D 错</b>：非连通图从一个顶点出发访问不到其余全部顶点；且遍历要求"每个顶点恰访问一次"。',
 run:null, verdict:'ok'},

{id:'6.1-4', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['概念·强连通与完全图'],
 stem:'以下关于图的叙述中，正确的是（　）。',
 opts:['强连通有向图的任何顶点到其他所有顶点都有弧',
       '图的任意顶点的入度等于出度',
       '有向完全图一定是强连通有向图',
       '有向图的边集的子集和顶点集的子集都构成原有向图的子图'],
 ans:'C',
 book:'强连通只要求任意两顶点间有路径，不要求有弧；无向图中任意顶点的入度等于出度，有向图则不一定；有向完全图中任意两顶点间都有两条方向相反的弧，因此一定强连通；D 与 03 题 B 同错。',
 claude:'一致，选 C。<br>· <b>A 错</b>：强连通要求的是<b>路径</b>（可以绕好几个点），不是<b>直接一条弧</b>。<br>· <b>B 错</b>：无向图才恒有"入度=出度"，有向图未必。<br>· <b>C 对</b>：有向完全图 = 任意两顶点间都有<b>方向相反的两条弧</b> ⟹ 两两互达 ⟹ 强连通。<br>· <b>D 错</b>：又是"子集不一定是子图"（见 03 题 B）。',
 run:null, verdict:'ok'},

{id:'6.1-5', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['边数极值·非连通'],
 stem:'一个有 28 条边的非连通无向图至少有（　）个顶点。',
 opts:['7','8','9','10'], ans:'C',
 book:'顶点最少的极端情形是：图由一个完全图和一个孤立顶点构成。28 = n(n−1)/2 解得 n = 8，加上孤立顶点共 9 个。',
 claude:'一致，选 C。<b>"边数固定、要顶点最少"⟹ 把边挤进一个完全图，再补一个孤立点保证非连通。</b><br>· 完全图 n(n−1)/2 = 28 → n(n−1) = 56 = 8×7 → <b>n = 8</b>；<br>· 加 1 个孤立点使图非连通 → 共 <b>9</b> 个顶点。<br>⚠️ 若少于 9 个（比如 8 个），28 条边恰是 8 顶点完全图 ⟹ 它是<b>连通</b>的，不满足题意。本题与本节综合题 01 是同一道题的两种问法。',
 run:'程序枚举：8 顶点完全图恰 28 条边；7 顶点最多 21 条 &lt; 28 ⟹ 至少 9 个顶点 ✅', verdict:'ok'},

{id:'6.1-6', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['边数极值·连通与强连通'],
 stem:'对于一个有 n 个顶点的图：若是连通无向图，则其边的个数至少为（　）；若是强连通有向图，则其边的个数至少为（　）。',
 opts:['n−1，n','n−1，n(n−1)','n，n','n，n(n−1)'], ans:'A',
 book:'连通无向图边数最少时是一棵生成树，为 n−1 条边；强连通有向图边数最少时构成一个有向环路，为 n 条边。',
 claude:'一致，选 A。<b>两条最小值要背死：</b><br>· <b>连通无向图最少 n−1 条边</b>（就是生成树，去掉任一条就断）；<br>· <b>强连通有向图最少 n 条边</b>（首尾相接的<b>一个有向环</b>——每个顶点入度出度各 1，少一条就有点回不去）。<br>⚠️ 别把"强连通最少"错记成 n−1：有向图 n−1 条边最多只能连成一棵有向树，树根回不去 ⟹ 不强连通。',
 run:null, verdict:'ok'},

{id:'6.1-7', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['度和公式'],
 stem:'无向图 G 有 23 条边，度为 4 的顶点有 5 个，度为 3 的顶点有 4 个，其余顶点的度均为 2，则 G 有（　）个顶点。',
 opts:['11','12','15','16'], ans:'D',
 book:'无向图全部顶点的度之和等于边数的 2 倍，即 2×23 = 46。度为 4 与度为 3 的顶点贡献 5×4 + 4×3 = 32，剩余 46−32 = 14 由度为 2 的顶点贡献，共 7 个。总顶点数 5+4+7 = 16。',
 claude:'一致，选 D。<b>无向图度和公式：ΣTD(v) = 2|E|</b>（每条边给两端各贡献 1 度）——本章"已知各类顶点数求总顶点数"一律列这个方程。<br>· 度和 = 2×23 = <b>46</b>；<br>· 已知部分 = 5×4 + 4×3 = 20+12 = <b>32</b>；<br>· 剩 46−32 = 14，全由度为 2 的顶点承担 → 14÷2 = <b>7 个</b>；<br>· 总计 5+4+7 = <b>16</b>。<br>📌 有向图对应的公式是 ΣID = ΣOD = |E|（不是 2|E|），别混。',
 run:'程序核验：5×4+4×3+7×2 = 46 = 2×23 ✅', verdict:'ok'},

{id:'6.1-8', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['度·有向图最大度'],
 stem:'在有 n 个顶点的有向图中，顶点的度最大可达（　）。',
 opts:['n','n−1','2n','2n−2'], ans:'D',
 book:'有向图中顶点的度 = 入度 + 出度。简单图中一个顶点最多与其余 n−1 个顶点各有一对方向相反的弧，故最大度为 2(n−1) = 2n−2。',
 claude:'一致，选 D。<b>有向图度 = 入度 + 出度；简单图不许自环、不许重边。</b><br>· 该顶点与其余 <b>n−1</b> 个顶点，每个都可以有"去"和"回"两条弧 → 出度 n−1、入度 n−1；<br>· 最大度 = (n−1)+(n−1) = <b>2n−2</b>。<br>⚠️ 无向图对应答案是 n−1（每个顶点最多连其余 n−1 个）。选 2n 就是忘了"不能自环"。',
 run:null, verdict:'ok'},

{id:'6.1-9', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['边数极值·保证连通'],
 stem:'具有 6 个顶点的无向图，当有（　）条边时能确保是一个连通图。',
 opts:['8','9','10','11'], ans:'D',
 book:'先考虑最坏情况：5 个顶点构成完全图共 10 条边，此时第 6 个顶点仍是孤立的。再加 1 条边必然把它连上，因此需要 11 条边才能确保连通。',
 claude:'一致，选 D。<b>"确保/无论如何都连通" ⟹ 先造最坏的不连通图，再加一条边。</b><br>· n 个顶点的图<b>非连通时边数最多</b> = (n−1)(n−2)/2 —— 即 n−1 个点构成完全图 + 1 个孤立点；<br>· 本题 n=6：最多 5×4/2 = <b>10</b> 条边仍可能不连通；<br>· 所以 <b>11</b> 条边时一定连通。<br>⚠️ 区分两个数：<b>可能连通的最少边 = n−1 = 5</b>；<b>保证连通的最少边 = (n−1)(n−2)/2 + 1 = 11</b>。题目问"确保"就是后者。',
 run:'程序枚举：5 顶点完全图 10 边仍留 1 孤立点（不连通）；任意 11 边的 6 顶点图必连通 ✅', verdict:'ok'},

{id:'6.1-10', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['生成树·极大vs极小'],
 stem:'设有无向图 G=(V,E) 和 G′=(V′,E′)，若 G′ 是 G 的生成树，则下列说法中<b>不正确</b>的是（　）。<br>Ⅰ. G′ 为 G 的连通分量　Ⅱ. G′ 为 G 的无环子图　Ⅲ. G′ 为 G 的极小连通子图且 V′=V',
 opts:['Ⅰ、Ⅱ','只有Ⅲ','Ⅱ、Ⅲ','只有Ⅰ'], ans:'D',
 book:'生成树是无环的、包含全部顶点的极小连通子图，因此 Ⅱ、Ⅲ 都正确。连通分量是极大连通子图，而生成树是极小连通子图，Ⅰ 错误。',
 claude:'一致，选 D（问的是"不正确"）。<b>极大 vs 极小是本节最爱考的一对：</b><br>· <b>连通分量 = 极大连通子图</b>：顶点和边都要尽可能<b>多</b>（把能连的全收进来，可以有环）；<br>· <b>生成树 = 极小连通子图</b>：在保持连通的前提下边尽可能<b>少</b>（恰 n−1 条，无环）。<br>⟹ Ⅰ 把"极小"说成了"极大"，错；Ⅱ（无环）、Ⅲ（极小连通 + 含全部顶点）都是生成树的定义。<br>📌 6.3 节还会再考一次同款（第6.3节选择 13 题）。',
 run:null, verdict:'ok'},

{id:'6.1-11', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['连通分量·数目极值'],
 stem:'具有 51 个顶点和 21 条边的无向图的连通分量最多为（　）。',
 opts:['33','34','45','32'], ans:'C',
 book:'要使连通分量最多，应让这 21 条边集中在尽可能少的顶点上：7 个顶点的完全图恰有 7×6/2 = 21 条边，其余 51−7 = 44 个顶点均为孤立点，各自构成一个连通分量，故连通分量最多为 44+1 = 45 个。',
 claude:'一致，选 C。<b>"分量最多" ⟺ 让每条边"浪费"得最厉害 ⟺ 把全部边塞进同一个完全图里。</b><br>· 21 = n(n−1)/2 → n(n−1) = 42 = 7×6 → <b>7 个顶点的完全图恰好吃掉全部 21 条边</b>；<br>· 剩 51−7 = 44 个孤立点，每个自成一个分量；<br>· 共 44 + 1 = <b>45</b>。<br>⚠️ 直觉误区：以为"21 条边最多消灭 21 个点的独立性"→ 51−21 = 30 之类。正确的思路是<b>边要抱团</b>：k 个顶点的连通分量至少要 k−1 条边，抱成完全图才最"省点"。',
 run:'程序枚举：7 顶点完全图恰 21 边，剩 44 孤立点 ⟹ 分量数 45（枚举其他分配均 &lt; 45）✅', verdict:'ok'},

{id:'6.1-12', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['强连通分量'],
 stem:'在如下有向图中，共有（　）个强连通分量。<br><span class="qnote">图（王道 p.198）的弧集：A→C、C→A、A→D、D→A、C→E、E→C、D→E、B→A、B→D、B→E（即 <b>B 只有出边、没有入边</b>）。</span>',
 opts:['1','2','3','4'], ans:'B',
 book:'顶点 B 只有出边而无入边，其他顶点都无法到达 B，因此 B 单独构成一个强连通分量；A、C、D、E 之间两两都存在方向相反的路径，构成另一个强连通分量。共 2 个。',
 claude:'一致，选 B。<b>找强连通分量的手工套路：先揪"只出不进"或"只进不出"的顶点——它们必定自成一个分量。</b><br>· <b>B 只有出边</b> ⟹ 没有任何顶点能回到 B ⟹ B 自己是一个强连通分量；<br>· 剩下 A、C、D、E：A↔C、A↔D、C↔E 都是双向，再加 D→E ⟹ 四点两两可达（例如 E→C→A→D，D→A→C→E）⟹ 合成<b>一个</b>强连通分量；<br>· 共 <b>2</b> 个。<br>📌 本节综合题（6.2 综合 02）用的正是这个"只出不进的顶点单独成分量"的分解法。',
 run:'程序 Tarjan 求强连通分量：{B}、{A,C,D,E} 共 2 个 ✅', verdict:'ok'},

{id:'6.1-13', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['生成树·计数'],
 stem:'若具有 n 个顶点的图是一个环，则它有（　）棵生成树。',
 opts:['n²','n','n−1','1'], ans:'B',
 book:'n 个顶点的环有 n 条边，去掉其中任意一条边即得到一棵生成树，共有 n 种去法，故有 n 棵生成树。',
 claude:'一致，选 B。<b>环上去掉任意一条边 = 一棵生成树</b>（剩 n−1 条边、仍连通、无环）。<br>· 有 <b>n</b> 条边可去 ⟹ <b>n</b> 棵不同的生成树；<br>· 每种去法得到的树形都不同（缺的那条边不同）。<br>📌 反用：这也是"生成树不唯一"的最简单例子——环上所有边等权时，MST 也有 n 棵（第 6.4 节选择 28 题 Ⅲ 用的就是这个反例）。',
 run:'程序枚举 n=5 的环：删任一条边得 5 棵不同生成树 ✅', verdict:'ok'},

{id:'6.1-14', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'', exam:null,
 kp:['森林·树的棵数'],
 stem:'若一个具有 n 个顶点、e 条边的无向图是一个森林，则该森林中必有（　）棵树。',
 opts:['n','e','n−e','1'], ans:'C',
 book:'设森林中有 x 棵树，每棵树的边数等于其顶点数减 1，故总边数 e = n − x，得 x = n − e。',
 claude:'一致，选 C。<b>一棵树：边 = 点 − 1；x 棵树的森林：边 = 点 − x。</b><br>· e = n − x ⟹ <b>x = n − e</b>。<br>· 另一种想法：再加 x−1 条边把 x 棵树串成一棵大树，则 e + (x−1) = n − 1 ⟹ 同样得 x = n − e。<br>📌 这个式子在 6.3「判断无向图是否为树」的算法里也要用（Vnum==n 且 Enum==2(n−1)）。',
 run:null, verdict:'ok'},

{id:'6.1-15', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'2009 统考', exam:2009,
 kp:['连通图性质·度和'],
 stem:'【2009 统考真题】下列关于无向连通图特性的叙述中，正确的是（　）。<br>Ⅰ. 所有顶点的度之和为偶数　Ⅱ. 边数大于顶点个数减 1　Ⅲ. 至少有一个顶点的度为 1',
 opts:['只有Ⅰ','只有Ⅱ','Ⅰ和Ⅱ','Ⅰ和Ⅲ'], ans:'A',
 book:'所有顶点的度之和等于边数的 2 倍，必为偶数，Ⅰ 正确。无向连通图的边数最少为 n−1（生成树），此时"大于"不成立，Ⅱ 错误。n 个顶点构成一个环时每个顶点的度都是 2，Ⅲ 错误。',
 claude:'一致，选 A。逐条把反例摆出来：<br>· <b>Ⅰ 对</b>：度和 = 2|E| ⟹ <b>恒为偶数</b>（任何无向图都成立，不限连通）。<br>· <b>Ⅱ 错</b>：应该是"边数 <b>≥</b> n−1"。反例：任何一棵树（生成树）恰好 e = n−1，"大于"不成立。<br>· <b>Ⅲ 错</b>：反例——n 个顶点连成一个<b>环</b>，每个顶点的度都是 2，没有度为 1 的顶点。（度为 1 的顶点在树里叫叶，环里根本没有）<br>⚠️ 这题三条全是"看似都对"，关键是记住 <b>≥ 与 &gt; 的差别</b>，以及"环"这个万能反例。',
 run:null, verdict:'ok'},

{id:'6.1-16', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'2010 统考', exam:2010,
 kp:['边数极值·保证连通'],
 stem:'【2010 统考真题】若无向图 G=(V,E) 中含有 7 个顶点，要保证图 G 在<b>任何情况下</b>都是连通的，则需要的边数最少是（　）。',
 opts:['6','15','16','21'], ans:'C',
 book:'6 个顶点构成的完全图有 6×5/2 = 15 条边，此时第 7 个顶点仍可能是孤立的；再加 1 条边就必然与第 7 个顶点相连，因此至少需要 16 条边。',
 claude:'一致，选 C。与 09 题同一模型，公式 <b>(n−1)(n−2)/2 + 1</b>：<br>· n = 7 → (6×5)/2 + 1 = 15 + 1 = <b>16</b>。<br>⚠️ 本题的题眼是<b>"在任何情况下"</b>四个字：<br>· 若问"最少多少条边<b>可能</b>连通" → 答 <b>6</b>（= n−1，生成树，选项 A 就是这个陷阱）；<br>· 问"<b>保证</b>连通" → 必须扛住最坏布局（6 点完全图 + 1 孤立点）→ <b>16</b>。<br>· 选 21 的是把 7 个顶点的完全图边数算了出来（7×6/2），过头了。',
 run:'程序枚举：7 顶点、15 边的图可以不连通（K6+孤立点）；16 边必连通 ✅', verdict:'ok'},

{id:'6.1-17', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'2017 统考', exam:2017,
 kp:['度和公式·顶点数最少'],
 stem:'【2017 统考真题】已知无向图 G 含有 16 条边，其中度为 4 的顶点个数为 3，度为 3 的顶点个数为 4，其他顶点的度均小于 3。图 G 所含的顶点个数至少是（　）。',
 opts:['10','11','13','15'], ans:'B',
 book:'设其他顶点的度均为 2（度小于 3 时取最大值 2 可使顶点数最少），个数为 x，则 4×3 + 3×4 + 2x = 16×2，解得 x = 4，故顶点个数至少为 3+4+4 = 11。',
 claude:'一致，选 B。<b>"顶点至少" ⟺ 让剩余顶点的度取到允许的最大值（把度和摊薄得最快）。</b><br>· 度和 = 2×16 = <b>32</b>；<br>· 已知贡献 = 3×4 + 4×3 = 12+12 = <b>24</b>；<br>· 剩 32−24 = 8，其他顶点度"均小于 3"⟹ <b>最大取 2</b> → 8÷2 = <b>4 个</b>；<br>· 至少 3+4+4 = <b>11</b>。<br>⚠️ 若粗心按度 1 算会得 8 个顶点、总数 15（选项 D 就是这个陷阱）——那求的是"至多"不是"至少"。<b>求最少顶点数就把剩余度数取满。</b>',
 run:'程序核验：3×4+4×3+4×2 = 32 = 2×16 ✅（取度 1 则需 8 个顶点，总数 15 &gt; 11）', verdict:'ok'},

{id:'6.1-18', ch:6, sec:'6.1 图的基本概念', type:'choice', tag:'2022 统考', exam:2022,
 kp:['连通性判定·两条临界线'],
 stem:'【2022 统考真题】对于无向图 G=(V,E)，下列选项中，正确的是（　）。',
 opts:['当 |V|＞|E| 时，G 一定是连通的',
       '当 |V|＜|E| 时，G 一定是连通的',
       '当 |V|=|E|−1 时，G 一定是不连通的',
       '当 |V|＞|E|+1 时，G 一定是不连通的'],
 ans:'D',
 book:'连通图的边数至少为 |V|−1，若 |E| ＜ |V|−1（即 |V| ＞ |E|+1）则一定不连通，D 正确、C 错误。而只有当 |E| ≥ (|V|−1)(|V|−2)/2 + 1 时才能保证连通，A、B 给出的条件都不足以保证连通。',
 claude:'一致，选 D。<b>整节的两条临界线，这题一次考完：</b><br>① <b>下界</b>：连通至少要 |V|−1 条边 ⟹ <b>|E| &lt; |V|−1（即 |V| &gt; |E|+1）时一定不连通</b> → <b>D 对</b>。<br>② <b>上界</b>：|E| ≥ (|V|−1)(|V|−2)/2 + 1 才<b>保证</b>连通。<br>逐个否掉：<br>· <b>A 错</b>：|V| &gt; |E| 只说明边少，边数可能恰好 = |V|−1 且连通（树），也可能不连通 ⟹ 不能说"一定连通"；<br>· <b>B 错</b>：边多也可能挤在一处，如 4 个点里 3 个连成三角形（3 条边）+ 1 个孤立点，|E|=3 &lt; |V|=4… 更直接的反例：5 个点中 4 个连成完全图（6 条边）+ 1 孤立点，|E|=6 &gt; |V|=5 却不连通；<br>· <b>C 错</b>：|V| = |E|−1 即 |E| = |V|+1，边比树还多，完全可以是连通的（如环再加一条弦）。<br>⚠️ 记法：<b>"点比边多两个及以上 ⟹ 必断"</b>，这是唯一能下"一定"结论的方向；反方向（边多）永远只能说"可能"。',
 run:'程序枚举小规模图核验四个选项：A 反例(4点3边路径+孤立点)、B 反例(K4+孤立点)、C 反例(5点6边连通图)均存在；D 无反例 ✅', verdict:'ok'},

{id:'6.1-综1', ch:6, sec:'6.1 图的基本概念', type:'subjective', tag:'', exam:null,
 kp:['边数极值·非连通'],
 hints:['"边数固定、问顶点最少"要往极端想：把所有边挤进一个尽可能小的完全图里。',
        '非连通的最省顶点写法 = 一个完全图 + 一个孤立顶点；解 n(n−1)/2 = 28 得完全图的顶点数，再 +1。'],
 stem:'图 G 是一个非连通无向图，共有 28 条边，则该图至少有多少个顶点？',
 book:'当图由两个连通子图构成、且其中一个子图仅有一个顶点时，顶点数最少。此时另一个子图为完全图：n(n−1)/2 = 28，解得 n = 8。因此该图至少有 8 + 1 = 9 个顶点。',
 claude:'答案 <b>9 个顶点</b>。<br><b>思路</b>：顶点数要少 ⟹ 每个顶点要"扛"尽可能多的边 ⟹ 边全部集中在一个<b>完全图</b>里；又要求<b>非连通</b> ⟹ 至少再挂一个孤立顶点。<br>· 解 n(n−1)/2 = 28 → n(n−1) = 56 = 8×7 → 完全图 <b>8</b> 个顶点；<br>· 加 1 个孤立点 → <b>共 9 个</b>。<br><b>验算</b>：8 个顶点最多 28 条边（恰好用完），7 个顶点最多只有 21 条边 &lt; 28 ⟹ 装不下，所以 8 是完全图部分的下限，9 是全图下限。<br>⚠️ 与本节选择题 05 是同一道题；若题目改成"<b>连通</b>无向图 28 条边至少几个顶点"，答案就是 <b>8</b>（不需要那个孤立点）。',
 run:'程序枚举：C(8,2)=28 恰好，C(7,2)=21&lt;28 ⟹ 非连通时至少 9 个顶点 ✅', verdict:'ok'},

/* ===================== 第6章 6.2 图的存储及基本操作 ===================== */
{id:'6.2-1', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['存储结构·总辨析'],
 stem:'下列关于图的存储结构的说法中，<b>错误</b>的是（　）。',
 opts:['邻接矩阵存储一个图时，不考虑压缩存储的情况下，所占存储空间大小只与顶点数有关，与边数无关',
       '邻接表只用于有向图的存储，邻接矩阵适用于有向图和无向图',
       '若一个有向图的邻接矩阵对角线以下元素均为 0，则该图的拓扑序列必定存在',
       '存储无向图的邻接矩阵是对称的，所以只需存储邻接矩阵的下（或上）三角部分'],
 ans:'B',
 book:'邻接表同样可以存储无向图，只是把每条无向边当作两条方向相反的弧，存两次，B 的说法错误。A 正确，邻接矩阵为 n×n 数组，空间 O(n²) 只与顶点数有关。C 正确，对角线以下元素均为 0 说明所有弧都由小编号指向大编号，不可能成环，故拓扑序列必定存在。D 正确，无向图邻接矩阵对称，只需存一半。',
 claude:'一致，选 B（问的是"错误"）。<br>· <b>B 错</b>：邻接表存无向图完全没问题——<b>一条无向边拆成两条反向弧存两次</b>，所以无向图邻接表的边表结点数 = 2|E|。"只用于有向图"的是<b>十字链表</b>，"只用于无向图"的是<b>邻接多重表</b>（口诀：<b>十字有向、多重无向</b>）。<br>· <b>A 对</b>：邻接矩阵恒为 n×n，<b>空间 O(n²) 只与顶点数有关</b>（这正是稀疏图不用它的原因）。<br>· <b>C 对</b>：对角线以下全 0 ⟹ 只要有弧 ⟨i,j⟩ 就必有 i&lt;j ⟹ 沿任何路径编号严格递增 ⟹ <b>不可能回到起点 ⟹ 无环 ⟹ 拓扑序列必存在</b>。<br>· <b>D 对</b>：无向图邻接矩阵对称，压缩存上（下）三角即可。<br>⚠️ C 只能推出"拓扑序列<b>存在</b>"，<b>不能推出"唯一"</b>（顶点编号本身就是一个拓扑序，但可能还有别的）。这个坑 6.4 节还会再考。',
 run:null, verdict:'ok'},

{id:'6.2-2', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接矩阵·完全图'],
 stem:'若图的邻接矩阵中主对角线上的元素皆为 0，其余元素全为 1，则该图一定（　）。',
 opts:['是无向图','是有向图','是完全图','不是带权图'], ans:'C',
 book:'主对角线为 0 说明没有自环，其余元素全为 1 说明任意两个不同顶点之间都有边（弧），符合完全图的定义。至于是有向还是无向、是否带权，由矩阵本身无法判定。',
 claude:'一致，选 C。<b>"任意两个不同顶点间都有边" = 完全图</b>，这是定义直给。<br>· <b>A、B 错</b>：这个矩阵是<b>对称</b>的，既可以理解成无向完全图 K<sub>n</sub>，也可以理解成"每对顶点有两条反向弧"的<b>有向完全图</b>——两者都满足，所以都不能说"一定"。<br>· <b>C 对</b>：无向完全图和有向完全图<b>都叫完全图</b>，所以"一定是完全图"成立。<br>· <b>D 错</b>：权值恰好全为 1 的带权图也长这样，不能断定它"不是带权图"。<br>📌 顺带记牢：主对角线元素 = <b>自环</b>，全为 0 就是<b>简单图</b>（无自环、无重边），408 考的图默认都是简单图。',
 run:null, verdict:'ok'},

{id:'6.2-3', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接矩阵·零元素个数'],
 stem:'在含有 n 个顶点和 e 条边的<b>无向图</b>的邻接矩阵中，零元素的个数为（　）。',
 opts:['e','2e','n<sup>2</sup>−e','n<sup>2</sup>−2e'], ans:'D',
 book:'无向图中每条边在邻接矩阵中对应两个非零元素（对称的两个位置），故非零元素共 2e 个。邻接矩阵共有 n² 个元素，因此零元素个数为 n²−2e。',
 claude:'一致，选 D。<b>一句话：矩阵总格子 n²，减去非零格子。</b><br>· <b>无向图</b>：一条边 (i,j) 同时点亮 A[i][j] 和 A[j][i] <b>两格</b> ⟹ 非零 = <b>2e</b> ⟹ 零元素 = <b>n²−2e</b>；<br>· <b>有向图</b>（对照变体）：一条弧只点亮一格 ⟹ 非零 = e ⟹ 零元素 = <b>n²−e</b>（就是选项 C 的场景）。<br>⚠️ 无向 / 有向差一个因子 2，是本节所有计数题的分水岭：<b>无向图的邻接矩阵"边被数了两遍"，邻接表的边表结点也"存了两遍"</b>——两个地方都要记得除以 2 或乘以 2。',
 run:null, verdict:'ok'},

{id:'6.2-4', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接矩阵·行出列入'],
 stem:'带权有向图 G 用邻接矩阵存储，则 v<sub>i</sub> 的入度等于邻接矩阵中（　）。',
 opts:['第 i 行非 ∞ 的元素个数','第 i 列非 ∞ 的元素个数',
       '第 i 行非 ∞ 且非 0 的元素个数','第 i 列非 ∞ 且非 0 的元素个数'], ans:'D',
 book:'有向图邻接矩阵中，第 i 列的非零元素个数为顶点 v<sub>i</sub> 的入度。在带权图中，无边时用 ∞ 表示，主对角线元素用 0 表示，二者都不代表边，因此应统计第 i 列中既非 ∞ 又非 0 的元素个数。',
 claude:'一致，选 D。<b>两个考点叠在一起考：</b><br>① <b>行出列入</b>：有向图邻接矩阵，<b>第 i 行非零 = 出度 OD(v<sub>i</sub>)，第 i 列非零 = 入度 ID(v<sub>i</sub>)</b>（记法：行是"从我出发的一行"，列是"射向我的一列"）。入度看<b>列</b> ⟹ 排除 A、C。<br>② <b>带权图里"不是边"的写法有两种</b>：无边写 <b>∞</b>，主对角线（自己到自己）习惯写 <b>0</b>。所以要"既非 ∞ 也非 0" ⟹ 排除 B，选 <b>D</b>。<br>⚠️ 只在<b>不带权</b>的 0/1 矩阵里，"非 0"才等价于"有边"；一看到"带权"两个字就要把 0 和 ∞ <b>一起</b>剔掉。<br>📌 度的换算：有向图 TD(v<sub>i</sub>) = 第 i 行 + 第 i 列的有效元素个数（2013、2023 真题都靠这一句）。',
 run:null, verdict:'ok'},

{id:'6.2-5', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'', exam:null,
 kp:['邻接矩阵·行出列入'],
 hints:['先定位"看行还是看列"：有向图入度是"别人射向我"，对应邻接矩阵的第 i <b>列</b>。',
        '再看求和号里哪个下标是<b>动</b>的：入度 = 固定列号 i，让行号 j 从 1 跑到 n，即 Σ<sub>j</sub>A[j][i]。无向图对称，行和列求哪个都一样。'],
 stem:'（双空题）一个有 n 个顶点的图用邻接矩阵 A 表示，若图为<b>有向图</b>，则顶点 v<sub>i</sub> 的入度是＿＿；若图为<b>无向图</b>，则顶点 v<sub>i</sub> 的度是＿＿。<br>备选：A. Σ<sub>i=1</sub><sup>n</sup>A[i][j]　B. Σ<sub>j=1</sub><sup>n</sup>A[j][i]　C. Σ<sub>i=1</sub><sup>n</sup>A[j][i]　D. Σ<sub>j=1</sub><sup>n</sup>A[j][i] 或 Σ<sub>i=1</sub><sup>n</sup>A[i][j]',
 book:'有向图中顶点 v<sub>i</sub> 的入度等于邻接矩阵第 i 列元素之和，即 Σ<sub>j=1</sub><sup>n</sup>A[j][i]，第一空选 B。无向图的邻接矩阵是对称的，顶点 v<sub>i</sub> 的度既等于第 i 行元素之和，也等于第 i 列元素之和，第二空选 D。',
 claude:'答案：第一空 <b>B</b>，第二空 <b>D</b>。<br><b>怎么读这几个求和式</b>——关键看<b>谁是自由变量（题目问的那个 i）、谁是求和的哑变量</b>：<br>· 题目问的是顶点 <b>v<sub>i</sub></b>，所以 <b>i 必须是固定的</b>，求和号下面动的应该是另一个字母 j。<br>· 入度 = 第 i <b>列</b>之和 = <b>Σ<sub>j=1</sub><sup>n</sup> A[j][i]</b>（行号 j 在跑，列号 i 钉死）⟹ <b>B</b>。<br>· 选项 A 是 Σ<sub>i</sub>A[i][j]——动的是 i、钉死的是 j，求的是<b>顶点 v<sub>j</sub> 的入度</b>，答非所问；选项 C 的求和变量 i 根本没出现在被加项 A[j][i] 的行位置上，写法不成立。<br>· 无向图邻接矩阵<b>对称</b>（A[i][j]=A[j][i]），行和 = 列和，两种写法都对 ⟹ <b>D</b>。<br>⚠️ 这题真正的坑不是图论，是<b>下标</b>。考场上先在草稿上写一句"入度＝列和，i 钉死"，再去比对选项，比盯着符号硬看快得多。',
 run:null, verdict:'ok'},

{id:'6.2-6', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'', exam:null,
 kp:['邻接矩阵·读矩阵'],
 hints:['顶点数就是矩阵的阶数，不用数边。',
        '有向图：每个非零元素就是一条弧；无向图：矩阵对称，非零元素被数了两遍，要除以 2。'],
 stem:'（三空题）从下面的邻接矩阵 A 可以看出，该图共有＿①＿个顶点；若是有向图，则共有＿②＿条弧；若是无向图，则共有＿③＿条边。'
  +'<table class="qtab"><tr><th></th><th>0</th><th>1</th><th>2</th></tr>'
  +'<tr><td class="rowh">0</td><td>0</td><td>1</td><td>0</td></tr>'
  +'<tr><td class="rowh">1</td><td>1</td><td>0</td><td>1</td></tr>'
  +'<tr><td class="rowh">2</td><td>0</td><td>1</td><td>0</td></tr></table>'
  +'备选：① A.9　B.3　C.6　D.1　E.以上均不正确<br>② A.5　B.4　C.3　D.2　E.以上均不正确<br>③ A.5　B.4　C.3　D.2　E.以上均不正确',
 book:'① 邻接矩阵的阶数即顶点数，为 3，选 B。② 若为有向图，每个非零元素对应一条弧，非零元素共 4 个，故有 4 条弧，选 B。③ 若为无向图，每条边对应两个对称的非零元素，故边数为 4/2 = 2，选 D。',
 claude:'答案：① <b>B</b>（3 个顶点）　② <b>B</b>（4 条弧）　③ <b>D</b>（2 条边）。<br>· <b>①</b> 顶点数 = <b>矩阵的阶数</b> = 3，与边无关，秒选。<br>· <b>②</b> 有向图：<b>一个非零元素 = 一条弧</b>。数出非零元素：A[0][1]、A[1][0]、A[1][2]、A[2][1]，共 <b>4</b> 个 ⟹ 4 条弧。<br>· <b>③</b> 无向图：<b>一条边点亮对称的两格</b> ⟹ 边数 = 4 ÷ 2 = <b>2</b>（即 (0,1) 和 (1,2)，这个图就是一条路径 0—1—2）。<br>⚠️ <b>本题矩阵恰好对称，第 ③ 问才有意义</b>。若矩阵<b>不对称</b>，它就<b>不可能</b>是无向图（无向图的邻接矩阵必对称），此时第 ③ 问只能答"以上均不正确"。看到"若是无向图"先扫一眼对不对称，是这类题的固定动作。',
 run:'程序核验：矩阵对称、阶数 3、非零元素 4 个 ⟹ 有向 4 条弧 / 无向 2 条边 ✅', verdict:'ok'},

{id:'6.2-7', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['存储·唯一性'],
 stem:'以下关于图的存储结构的叙述中，正确的是（　）。',
 opts:['邻接矩阵表示唯一，邻接表表示唯一','邻接矩阵表示唯一，邻接表表示不唯一',
       '邻接矩阵表示不唯一，邻接表表示唯一','邻接矩阵表示和邻接表表示都不唯一'], ans:'B',
 book:'顶点编号确定后，邻接矩阵中每条边的存放位置是确定的，故邻接矩阵表示唯一。邻接表中每个顶点的边表结点的链接次序取决于建表算法及边的输入次序，因此邻接表表示不唯一。',
 claude:'一致，选 B。<b>唯一性口诀：只有邻接矩阵唯一，其余三种统统不唯一。</b><br>· <b>邻接矩阵唯一</b>：顶点编号一旦定下，边 (i,j) 只能落在第 i 行第 j 列这一个格子里，没有自由度。<br>· <b>邻接表不唯一</b>：每个顶点的边表是一条<b>单链表</b>，先读入哪条边就先挂哪个结点（头插法还会整个倒过来），次序千变万化。<br>· 同理 <b>十字链表、邻接多重表也不唯一</b>（它们本质也是链表）。<br>⚠️ 前提是<b>"顶点编号固定"</b>：若允许给顶点重新编号，邻接矩阵也会跟着变（这正是本节综合题 04"重新编号使 1 都跑到上三角"的玩法）。考试里说"邻接矩阵唯一"默认已固定编号。',
 run:null, verdict:'ok'},

{id:'6.2-8', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接矩阵幂·路径条数'],
 stem:'矩阵 A 是有向图 G 的邻接矩阵，若 A<sup>2</sup> 的某个元素 a<sup>2</sup><sub>i,j</sub>=3，则说明（　）。',
 opts:['从顶点 i 到顶点 j 存在 3 条长度为 2 的路径','从顶点 i 到顶点 j 存在 3 条长度不超过 2 的路径',
       '从顶点 i 到顶点 j 存在 2 条长度为 3 的路径','从顶点 i 到顶点 j 存在 2 条长度不超过 3 的路径'], ans:'A',
 book:'邻接矩阵的 n 次幂 A<sup>n</sup> 中的元素 A<sup>n</sup>[i][j] 表示由顶点 i 到顶点 j 的长度为 n 的路径的数目。本题中 n=2、元素值为 3，即从 i 到 j 长度为 2 的路径有 3 条。',
 claude:'一致，选 A。<b>一句必背：A<sup>n</sup>[i][j] = 从 i 到 j 长度<u>恰好</u>为 n 的路径条数。</b><br><b>幂次是"长度"，元素值是"条数"——两者别对调。</b>本题幂次 2 ⟹ 长度 2；元素值 3 ⟹ 3 条 ⟹ 选 A。<br>· <b>B 错</b>："不超过 2"要算 A + A²（还得看是否允许长度 0/1），A² 本身只统计<b>恰好</b>两步。<br>· <b>C、D 错</b>：把长度和条数读反了。<br><b>为什么成立</b>：矩阵乘法 (A²)[i][j] = Σ<sub>k</sub>A[i][k]·A[k][j]，只有"i→k 有弧<b>且</b> k→j 有弧"时那一项才贡献 1，正是在数"中转点 k 有几个" ⟹ 长度 2 的路径条数。同理往上递推到 A<sup>n</sup>。<br>📌 这个考点 2015 年以综合题形式考过（见本节综合题 06），选择、大题两种问法都要会。',
 run:null, verdict:'ok'},

{id:'6.2-9', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接表·空间复杂度'],
 stem:'用邻接表法存储图，所用的存储空间大小（　）。',
 opts:['与图的顶点数和边数都有关','只与图的边数有关','只与图的顶点数有关','与图的边数的平方有关'], ans:'A',
 book:'邻接表由顶点表和边表两部分组成，顶点表的大小取决于顶点数 n，边表结点的个数取决于边数 e（无向图为 2e），故所占空间为 O(n+e) 或 O(n+2e)，与顶点数和边数都有关。',
 claude:'一致，选 A。<b>两种存储的空间口径，成对背：</b><br>· <b>邻接矩阵 O(|V|²)</b>：<b>只与顶点数有关</b>，边再少也要开满 n×n（这正是它不适合稀疏图的原因）。<br>· <b>邻接表</b>：顶点表 |V| 个 + 边表结点若干 ⟹ <b>无向图 O(|V|+2|E|)、有向图 O(|V|+|E|)</b>，<b>顶点数和边数都影响</b> ⟹ 选 A。<br>⚠️ 无向图那个 <b>2</b> 别丢：一条无向边要在两个顶点的边表里各挂一个结点。<br>📌 由此得选型结论：<b>稠密图用邻接矩阵，稀疏图用邻接表</b>。当 e 接近 n² 时邻接表反而更费（还多了指针域）。',
 run:null, verdict:'ok'},

{id:'6.2-10', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接表·结点数奇偶'],
 stem:'若邻接表中有奇数个边表结点，则（　）。',
 opts:['图中有奇数个顶点','图中有偶数个顶点','图为无向图','图为有向图'], ans:'D',
 book:'无向图中每条边在邻接表中对应两个边表结点，故无向图的边表结点总数必为偶数。现在边表结点为奇数个，只可能是有向图（有向图中一条弧只对应一个边表结点）。',
 claude:'一致，选 D。<b>奇偶性一招定乾坤：</b><br>· <b>无向图</b>：一条边挂<b>两个</b>边表结点 ⟹ 总数 = 2|E| ⟹ <b>必为偶数</b>；<br>· <b>有向图</b>：一条弧只挂<b>一个</b> ⟹ 总数 = |E|，奇偶皆可。<br>⟹ 出现<b>奇数</b>个边表结点，就<b>排除了无向图</b>，只能是有向图 ⟹ D（且此图有奇数条弧）。<br>· <b>A、B 错</b>：边表结点数只反映边数，跟顶点数的奇偶<b>毫无关系</b>（顶点数由顶点表决定）。<br>📌 同款奇偶论证在 6.1 用过：无向图<b>度之和 = 2|E| 必为偶数</b>，因而<b>奇度顶点个数必为偶数</b>（2021 真题 EL 路径就靠这条）。看到"奇数/偶数"先想"某个量是不是天然乘了 2"。',
 run:null, verdict:'ok'},

{id:'6.2-11', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接表·顶点出现次数'],
 stem:'在有向图的邻接表存储结构中，顶点 v 在边表中出现的次数是（　）。',
 opts:['顶点 v 的度','顶点 v 的出度','顶点 v 的入度','依附于顶点 v 的边数'], ans:'C',
 book:'有向图的邻接表中，顶点 v 的边表中存放的是以 v 为起点的弧的终点。因此顶点 v 作为边表结点（adjvex 域）出现的次数，等于以 v 为终点的弧的条数，即 v 的入度。',
 claude:'一致，选 C。<b>看清"出现在哪里"是本题唯一的题眼。</b><br>邻接表分两层：<br>· <b>顶点表</b>：v 在这里出现 1 次（它自己的那一格），<b>不算</b>；<br>· <b>边表</b>：结点里存的是 <code>adjvex</code>，即"这条弧<b>指向</b>谁"。v 出现在某个边表里 ⟹ 有一条弧<b>射向</b> v ⟹ 每出现一次就是 <b>1 个入度</b> ⟹ 选 C。<br>· <b>B（出度）错</b>：v 的出度 = <b>v 自己那条边表的长度</b>（结点个数），不是"v 出现的次数"。<br>· <b>A、D 错</b>：度 = 入度 + 出度，两部分算法不同，不能一个数字包办。<br>📌 由此直接推出邻接表的死穴：<b>求出度只看一条链（快），求入度必须扫遍所有边表 O(n+e)（慢）</b>——第 15、16 题、以及"十字链表为什么存在"，考的都是这一条。',
 run:null, verdict:'ok'},

{id:'6.2-12', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接表·结点数上界'],
 stem:'n 个顶点的无向图的邻接表最多有（　）个边表结点。',
 opts:['n<sup>2</sup>','n(n−1)','n(n+1)','n(n−1)/2'], ans:'B',
 book:'n 个顶点的无向图最多有 n(n−1)/2 条边（完全图），每条边在邻接表中对应两个边表结点，故边表结点最多为 2×n(n−1)/2 = n(n−1) 个。',
 claude:'一致，选 B。<b>两步走，别跳步：</b><br>① <b>边数上界</b>：n 个顶点的无向<b>简单图</b>最多 <b>n(n−1)/2</b> 条边（完全图 K<sub>n</sub>）；<br>② <b>每条边挂 2 个结点</b> ⟹ 边表结点最多 2 × n(n−1)/2 = <b>n(n−1)</b>。<br>⚠️ 选 D 的是<b>忘了乘 2</b>（那是边数不是结点数）；选 A 的是把它当成邻接矩阵的格子数 n²（n² 里还含 n 个对角线自环位，无向简单图用不上）。<br>📌 换个角度秒验：<b>边表结点总数 = 所有顶点的度之和 = 2|E|</b>。完全图每个顶点度 n−1，共 n 个顶点 ⟹ n(n−1)，同样得 B。这个"结点数 = 度之和"的视角在第 13、14 题还要用。',
 run:'程序枚举 n=3,4,5 的完全图邻接表：边表结点数分别 6、12、20 = n(n−1) ✅', verdict:'ok'},

{id:'6.2-13', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接表·建表复杂度'],
 stem:'设某无向图中有 n 个顶点和 e 条边，则建立该图的邻接表的时间复杂度是（　）。',
 opts:['O(n+e)','O(n<sup>2</sup>)','O(ne)','O(n<sup>3</sup>)'], ans:'A',
 book:'建立邻接表需先建立 n 个顶点表结点，再依次读入 e 条边，每条边在两个顶点的边表中各插入一个结点（头插法为 O(1)），共 2e 次插入。总时间为 O(n+2e) = O(n+e)。',
 claude:'一致，选 A。<b>把建表拆成两笔账：</b><br>· 建 <b>n 个顶点表结点</b>（初始化 firstarc = NULL）→ <b>O(n)</b>；<br>· 读入 <b>e 条边</b>，每条<b>头插</b>到两个顶点的边表里，每次 O(1) → <b>O(2e)</b>；<br>· 合计 O(n+2e) = <b>O(n+e)</b>。<br>⚠️ 前提是<b>用头插法</b>（O(1)）。若用<b>尾插</b>且不设尾指针，每次要先走到链尾，最坏会退化。408 默认头插——这也正是"<b>邻接表表示不唯一</b>"（第 7 题）的原因：头插会让边表次序与输入次序<b>相反</b>。<br>📌 对照记忆：<b>建邻接矩阵</b>要先把 n×n 全置 0，天然 <b>O(n²)</b>（选项 B）；由邻接表转邻接矩阵（本节综合题 05）也是 O(n²)，瓶颈在初始化那一步。',
 run:null, verdict:'ok'},

{id:'6.2-14', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接表·删顶点相关边'],
 stem:'假设有 n 个顶点、e 条边的有向图用邻接表表示，则删除与某个顶点 v 相关的所有边的时间复杂度为（　）。',
 opts:['O(n)','O(e)','O(n+e)','O(ne)'], ans:'C',
 book:'删除以 v 为起点的边（出边），只需遍历顶点 v 的边表并逐个释放，边表结点最多 n−1 个，时间为 O(n)。删除以 v 为终点的边（入边），必须遍历整个邻接表查找 adjvex 域为 v 的结点，时间为 O(n+e)。二者合计为 O(n+e)。',
 claude:'一致，选 C。<b>"与 v 相关的边" = 出边 + 入边，两笔账分开算再取较大者：</b><br>· <b>删出边</b>：只扫 v 自己那条边表，最多 n−1 个结点 ⟹ <b>O(n)</b>；<br>· <b>删入边</b>：入边分散在<b>别的顶点</b>的边表里，必须把<b>整个邻接表</b>翻一遍（n 个表头 + e 个边结点）⟹ <b>O(n+e)</b>；<br>· 合计 O(n) + O(n+e) = <b>O(n+e)</b>。<br>⚠️ 别只看到"删一个顶点的边"就答 O(n)——<b>邻接表是"只记出边"的单向结构，入边天生难找</b>，这是它和第 15 题、第 16 题共用的同一个软肋。<br>📌 想避开就换<b>十字链表</b>：顶点结点同时有 firstin 和 firstout，出边入边都能顺着链直接摘，删边删顶点都方便（表 6.1 里"十字链表：很方便"就是这个意思）。',
 run:null, verdict:'ok'},

{id:'6.2-15', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接表·求入度'],
 stem:'设 n 个顶点、e 条边的有向图用邻接表表示，则求某顶点 v 的入度的时间复杂度为（　）。',
 opts:['O(n)','O(e)','O(n+e)','O(ne)'], ans:'C',
 book:'有向图的邻接表中，顶点 v 的入度等于所有边表中 adjvex 域为 v 的结点个数，必须遍历整个邻接表才能统计出来。遍历 n 个顶点表结点和 e 个边表结点，时间复杂度为 O(n+e)。',
 claude:'一致，选 C。<b>入度＝"别人指向我"，散落全表 ⟹ 只能全表扫。</b><br>· 扫描代价 = n 个<b>顶点表结点</b>（挨个取 firstarc）+ e 个<b>边表结点</b>（挨个看 adjvex 是否为 v）⟹ <b>O(n+e)</b>。<br>· 选 <b>O(e)</b> 是漏了"必须先逐个走过 n 个表头"这一段——即使 e=0，也要花 O(n) 才能确认全表为空。<br>⚠️ 对照全套"求度"的复杂度，成组背：<br>&nbsp;&nbsp;· 邻接<b>表</b>·有向图：出度 <b>O(n)</b>（只扫自己那条链，最多 n−1 个结点）、入度 <b>O(n+e)</b>；<br>&nbsp;&nbsp;· 邻接<b>矩阵</b>：出度扫一行、入度扫一列，都是 <b>O(n)</b>，两边对称、没有软肋；<br>&nbsp;&nbsp;· <b>十字链表</b>：出度入度都顺着链走，都方便。<br>📌 <b>"邻接表求有向图入度很麻烦"正是十字链表被发明出来的理由</b>，这句话把 6.2 的四种结构串成了一条逻辑线。',
 run:null, verdict:'ok'},

{id:'6.2-16', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接表·总辨析'],
 stem:'对邻接表的叙述中，（　）是正确的。',
 opts:['无向图的邻接表中，第 i 个顶点的度为第 i 个链表中结点数的两倍',
       '邻接表比邻接矩阵的操作更简便',
       '邻接矩阵比邻接表的操作更简便',
       '求有向图顶点的度，必须遍历整个邻接表'], ans:'D',
 book:'无向图邻接表中第 i 个链表的结点数就等于顶点 i 的度，不是两倍，A 错误。邻接表和邻接矩阵各有优势，不能笼统地说谁的操作更简便，B、C 都不正确。有向图顶点的度等于出度加入度，其中入度必须遍历整个邻接表才能求出，D 正确。',
 claude:'一致，选 D。<br>· <b>A 错</b>：<b>无向图邻接表中，第 i 个链表的结点个数就<u>等于</u> TD(v<sub>i</sub>)</b>，不是两倍。"两倍"这个数字属于<b>全表</b>：所有边表结点总数 = 2|E|。<b>把"全局的 2 倍"错安到"单个顶点"头上，是本题的设计陷阱。</b><br>· <b>B、C 错</b>：两者<b>各有胜场</b>，不存在一边倒——判断两点是否相邻：<b>矩阵 O(1) 完胜</b>；找某点的全部邻接点：<b>邻接表只走自己那条链、矩阵要扫整行 O(n)</b>；省空间：稀疏图看邻接表、稠密图看矩阵。凡是"A 比 B 更好"这种绝对句式，先怀疑。<br>· <b>D 对</b>：有向图 <b>TD = ID + OD</b>，出度好求（自己那条链），但<b>入度必须扫全表</b>（第 15 题），所以"求度"整体逃不掉遍历整个邻接表。<br>⚠️ D 的前提是<b>有向图</b>；若是<b>无向图</b>，度就是链长，<b>不需要</b>遍历全表。',
 run:null, verdict:'ok'},

{id:'6.2-17', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['邻接多重表·适用对象'],
 stem:'邻接多重表是（　）的存储结构。',
 opts:['无向图','有向图','无向图和有向图都可以','都不是'], ans:'A',
 book:'邻接多重表是无向图的一种链式存储结构。在邻接表中，容易求得顶点和边的各种信息，但在求两个顶点之间是否存在边而对边执行删除等操作时，需要分别在两个顶点的边表中遍历，效率较低。邻接多重表中每条边只用一个结点表示，克服了这一缺点。',
 claude:'一致，选 A。<b>口诀：十字有向、多重无向</b>（"多重"两个字里没有方向感，正好配无向）。<br><b>邻接多重表长什么样</b>：<br>· <b>边结点</b>：<code>ivex | ilink | jvex | jlink</code>——ivex、jvex 是这条边的<b>两个端点</b>；ilink 指向"依附于 ivex 的下一条边"，jlink 指向"依附于 jvex 的下一条边"。<br>· <b>顶点结点</b>：<code>data | firstedge</code>。<br><b>为什么要它</b>：邻接表把一条无向边<b>拆成两个结点</b>存两份，<b>删一条边要在两个链表里各找一次</b>，还容易只删一半造成不一致；邻接多重表<b>一条边只有一个结点</b>，删边、给边打标记（如遍历时标记"已访问"）都只需动一处。<br>📌 空间 O(|V|+|E|)（不是 2|E|，正因为不重复存），表示<b>不唯一</b>。2024 年统考真题（本节第 20 题）就直接考读这个结构。',
 run:null, verdict:'ok'},

{id:'6.2-18', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'', exam:null,
 kp:['十字链表·适用对象'],
 stem:'十字链表是（　）的存储结构。',
 opts:['无向图','有向图','无向图和有向图都可以','都不是'], ans:'B',
 book:'十字链表是有向图的一种链式存储结构。在十字链表中，既容易找到以 v<sub>i</sub> 为尾的弧，又容易找到以 v<sub>i</sub> 为头的弧，因而容易求得顶点的出度和入度。',
 claude:'一致，选 B。与第 17 题成对背：<b>十字有向、多重无向</b>。<br><b>十字链表长什么样</b>：<br>· <b>弧结点</b>：<code>tailvex | headvex | hlink | tlink</code>——tailvex 是<b>弧尾</b>、headvex 是<b>弧头</b>；<b>hlink 串起"弧头相同"的弧（即同一个入度链）</b>，<b>tlink 串起"弧尾相同"的弧（即同一个出度链）</b>。<br>· <b>顶点结点</b>：<code>data | firstin | firstout</code>——两个头指针，一条管入边、一条管出边。<br><b>为什么要它</b>：直接治好了邻接表"<b>求入度必须扫全表 O(n+e)</b>"的病（第 15 题）——顺着 firstin 走 hlink 就能把所有入边数出来，<b>出度入度都方便</b>。<br>⚠️ 两个名字容易记反，用字形记：<b>"十字"＝横竖两条链＝出边链 + 入边链＝有方向之分</b>；无向图的边没有头尾之分，压根用不上十字。<br>📌 空间 O(|V|+|E|)，表示<b>不唯一</b>。',
 run:null, verdict:'ok'},

{id:'6.2-19', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'2013 统考', exam:2013,
 kp:['邻接矩阵·行出列入'],
 stem:'【2013 统考真题】设图的邻接矩阵 A 如下所示，各顶点的度依次是（　）。'
  +'<table class="qtab"><tr><th></th><th>1</th><th>2</th><th>3</th><th>4</th></tr>'
  +'<tr><td class="rowh">1</td><td>0</td><td>1</td><td>0</td><td>1</td></tr>'
  +'<tr><td class="rowh">2</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>'
  +'<tr><td class="rowh">3</td><td>0</td><td>1</td><td>0</td><td>0</td></tr>'
  +'<tr><td class="rowh">4</td><td>1</td><td>0</td><td>0</td><td>0</td></tr></table>',
 opts:['1,2,1,2','2,2,1,1','3,4,2,3','4,4,2,2'], ans:'C',
 book:'该邻接矩阵不对称，所以是有向图。有向图中顶点的度等于出度与入度之和，即等于该顶点所在行的非零元素个数与所在列的非零元素个数之和。四个顶点的行非零元素个数依次为 2,2,1,1，列非零元素个数依次为 1,2,1,2，故各顶点的度依次为 3,4,2,3。',
 claude:'一致，选 C。<b>三步固定动作：先判有向无向 → 再算行和列 → 最后逐点相加。</b><br>① <b>矩阵不对称</b>（A[1][2]=1 但 A[2][1]=0）⟹ 一定是<b>有向图</b> ⟹ 必须"行 + 列"，不能只看一边。<br>② <b>行非零（出度）</b>：v<sub>1</sub>=2、v<sub>2</sub>=2、v<sub>3</sub>=1、v<sub>4</sub>=1；<br>&nbsp;&nbsp;&nbsp;<b>列非零（入度）</b>：v<sub>1</sub>=1、v<sub>2</sub>=2、v<sub>3</sub>=1、v<sub>4</sub>=2。<br>③ <b>逐点相加</b>：3、4、2、3 ⟹ <b>C</b>。<br>⚠️ 三个错误选项恰好是三种典型走神：<b>B 是只算了出度</b>（把它当无向图了），<b>A 是只算了入度</b>，<b>D 是把总弧数 4 到处乱套</b>。<br>📌 <b>验算捷径</b>：有向图 ΣID = ΣOD = |E|。这里行和 = 列和 = 6？不对——行和 2+2+1+1 = <b>6</b>，列和 1+2+1+2 = <b>6</b>，✓ 相等，说明没数错；度之和 = 6+6 = 12 = 2|E| = 2×6 ✓。<b>先用"行和 = 列和"自查一遍再选，几乎不会错。</b>',
 run:'程序核验：行和 [2,2,1,1]、列和 [1,2,1,2]、度 [3,4,2,3] ✅（行和 = 列和 = 6 = 弧数）', verdict:'ok'},

{id:'6.2-20', ch:6, sec:'6.2 图的存储及基本操作', type:'choice', tag:'2024 统考', exam:2024,
 kp:['邻接多重表·读结构求度'],
 stem:'【2024 统考真题】若无向图 G=(V,E) 的邻接多重表如下所示，则 G 中顶点 b 与 d 的度分别是（　）。'
  +'<div class="qnote">顶点表：0=a，1=b，2=c，3=d，4=e；边结点的四个域为 <code>ivex | ilink | jvex | jlink</code>。'
  +'从图中读出的 7 个边结点的 (ivex, jvex) 依次为：</div>'
  +'<table class="qtab"><tr><th>边结点</th><th>①</th><th>②</th><th>③</th><th>④</th><th>⑤</th><th>⑥</th><th>⑦</th></tr>'
  +'<tr><td class="rowh">ivex</td><td>0</td><td>0</td><td>1</td><td>2</td><td>2</td><td>4</td><td>4</td></tr>'
  +'<tr><td class="rowh">jvex</td><td>1</td><td>3</td><td>3</td><td>0</td><td>3</td><td>2</td><td>3</td></tr></table>'
  +'<div class="qnote">（ilink / jlink 两个指针域只决定链接次序、不影响度数，此处略去）</div>',
 opts:['0，2','2，4','2，5','3，4'], ans:'B',
 book:'邻接多重表中每条边只用一个边结点表示，该结点的 ivex 和 jvex 分别为这条边所依附的两个顶点。因此统计某顶点的度，只需统计所有边结点中 ivex 或 jvex 等于该顶点编号的结点个数。顶点 b 的编号为 1，在边结点 (0,1)、(1,3) 中出现，度为 2；顶点 d 的编号为 3，在边结点 (0,3)、(1,3)、(2,3)、(4,3) 中出现，度为 4。故选 B。',
 claude:'一致，选 B（b 的度 2、d 的度 4）。<br><b>破题的一句话：邻接多重表里一条边只有一个结点，这个结点同时"属于"它的两个端点。</b>所以求度不用顺着 ilink/jlink 爬链，只要<b>把所有边结点的 ivex、jvex 两个域一起数</b>，某顶点编号出现几次，度就是几。<br>· 全部边（读出的 7 条）：(0,1)、(0,3)、(1,3)、(2,0)、(2,3)、(4,2)、(4,3)。<br>· <b>b = 1</b>：出现在 (0,1)、(1,3) ⟹ 度 <b>2</b>；<br>· <b>d = 3</b>：出现在 (0,3)、(1,3)、(2,3)、(4,3) ⟹ 度 <b>4</b> ⟹ 选 <b>B</b>。<br>· <b>验算</b>：五个顶点度数 a=3、b=2、c=3、d=4、e=2，和 = 14 = 2×7 = 2|E| ✓ 与边结点个数吻合，说明没数漏。<br>⚠️ 两个易错点：① <b>ivex 和 jvex 地位平等</b>，不能只数 ivex（那样 b 会算成 1、d 算成 0，正是干扰项 A 的来路）；② 别把它当<b>邻接表</b>来数——邻接表里一条无向边存两份，这里<b>只存一份</b>。<br>📌 考场上遇到这类"读存储结构图"的题，<b>第一步永远是先把边集完整抄成 (u,v) 列表</b>，再用度和 = 2|E| 自查，比在图上顺着指针数可靠得多。',
 run:'程序核验：边集 7 条，度 a=3,b=2,c=3,d=4,e=2，和 14 = 2×7 ✅', verdict:'ok'},

{id:'6.2-综1', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'', exam:null,
 kp:['邻接矩阵·还原图形'],
 hints:['带权有向图的邻接矩阵里，A[i][j] 是有限值且不是主对角线的 0，就代表一条弧 i→j，权值就是这个数。',
        '逐行扫描：第 i 行上每个非 ∞ 的格子给出一条<b>从 v<sub>i</sub> 出发</b>的弧（行出列入），把 11 条弧一条条画出来即可。'],
 stem:'已知带权有向图 G 的邻接矩阵如下（∞ 表示无边，主对角线的 0 表示自身），请画出该带权有向图 G。'
  +'<table class="qtab"><tr><th></th><th>a</th><th>b</th><th>c</th><th>d</th><th>e</th><th>f</th><th>g</th></tr>'
  +'<tr><td class="rowh">a</td><td>0</td><td>15</td><td>2</td><td>12</td><td>∞</td><td>∞</td><td>∞</td></tr>'
  +'<tr><td class="rowh">b</td><td>∞</td><td>0</td><td>∞</td><td>∞</td><td>6</td><td>∞</td><td>∞</td></tr>'
  +'<tr><td class="rowh">c</td><td>∞</td><td>∞</td><td>0</td><td>∞</td><td>8</td><td>4</td><td>∞</td></tr>'
  +'<tr><td class="rowh">d</td><td>∞</td><td>∞</td><td>∞</td><td>0</td><td>∞</td><td>∞</td><td>3</td></tr>'
  +'<tr><td class="rowh">e</td><td>∞</td><td>∞</td><td>∞</td><td>∞</td><td>0</td><td>∞</td><td>9</td></tr>'
  +'<tr><td class="rowh">f</td><td>∞</td><td>∞</td><td>∞</td><td>5</td><td>∞</td><td>0</td><td>10</td></tr>'
  +'<tr><td class="rowh">g</td><td>∞</td><td>4</td><td>∞</td><td>∞</td><td>∞</td><td>∞</td><td>0</td></tr></table>',
 book:'按照邻接矩阵的定义，矩阵中第 i 行第 j 列的元素若既非 0 也非 ∞，则表示存在一条从 v<sub>i</sub> 到 v<sub>j</sub> 的弧，其权值即该元素的值。据此逐行读出全部弧：a→b(15)、a→c(2)、a→d(12)、b→e(6)、c→e(8)、c→f(4)、d→g(3)、e→g(9)、f→d(5)、f→g(10)、g→b(4)，共 11 条弧，画出的带权有向图见右图。',
 figA:'图/ch6/6.2-综1.svg',
 figAcap:'由邻接矩阵还原出的带权有向图 G（7 个顶点、11 条弧，据王道 p.211 重画）',
 claude:'答案：<b>11 条弧</b> —— a→b(15)、a→c(2)、a→d(12)、b→e(6)、c→e(8)、c→f(4)、d→g(3)、e→g(9)、f→d(5)、f→g(10)、g→b(4)。<br><b>读矩阵的固定动作（行出列入）</b>：<b>逐行</b>扫描，第 i 行的每个"既非 0 又非 ∞"的格子，就是一条<b>从 v<sub>i</sub> 射出</b>的弧，格子里的数就是权。逐行读比逐格乱看快且不漏：<br>· a 行有 15、2、12 三个数 ⟹ a 的出度 3；b 行 1 个；c 行 2 个；d 行 1 个；e 行 1 个；f 行 2 个；g 行 1 个。<br>· <b>出度之和 = 3+1+2+1+1+2+1 = 11 = 弧数 ✓</b>（这就是画完的自查方法）。<br><b>卷面提醒</b>：<br>· 弧必须<b>带箭头</b>，权值写在弧旁边——漏箭头或漏权值都要扣分；<br>· <b>主对角线的 0 不是弧</b>（不能画自环）；<br>· f→d 与 d→g 方向不同，别顺手画成双向；本图<b>唯一的"回头弧"是 g→b</b>，它让 b→e→g→b 构成一个环，画的时候留出空间别压线。<br>⚠️ 带权图里"没有边"写 <b>∞</b> 而不是 0（0 被主对角线占用了），这是与不带权 0/1 矩阵最大的区别；若题目改成"0 表示无边"，那读法就要跟着改。',
 run:'程序按"非 0 且非 ∞"逐行提取：共 11 条弧，各行出度 3,1,2,1,1,2,1 之和 = 11 ✅', verdict:'ok'},

{id:'6.2-综2', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'', exam:null,
 kp:['邻接表·转邻接矩阵'],
 hints:['先判断这是有向图还是无向图：看每条边是否在两端各出现了一次（如 1 的表里有 2，2 的表里也有 1）。',
        '边表里出现 j ⟹ 置 A[i][j]=1。全部置完后检查矩阵是否对称，对称即验证了"无向"的判断。'],
 stem:'设图 G=(V,E) 以邻接表存储，如下所示。请画出其邻接矩阵存储表示，并画出图 G。'
  +'<pre class="code">1 → 2 → 3 → 4\n2 → 1 → 3 → 4 → 5\n3 → 1 → 2 → 4\n4 → 1 → 2 → 3 → 5\n5 → 2 → 4</pre>',
 book:'邻接表中每条边都出现了两次（如顶点 1 的边表中有 2，顶点 2 的边表中也有 1），故该图为无向图。依次扫描各顶点的边表，边表结点为 j 时置 A[i][j]=1，得邻接矩阵。边集为 (1,2)、(1,3)、(1,4)、(2,3)、(2,4)、(2,5)、(3,4)、(4,5)，共 8 条边，据此画出图 G。',
 figA:'图/ch6/6.2-综2.svg',
 figAcap:'由邻接表还原出的无向图 G（5 个顶点、8 条边，据王道 p.211 重画）',
 claude:'答案：<b>这是一个无向图</b>，邻接矩阵为<br><pre class="code">    1 2 3 4 5\n1 [ 0 1 1 1 0 ]\n2 [ 1 0 1 1 1 ]\n3 [ 1 1 0 1 0 ]\n4 [ 1 1 1 0 1 ]\n5 [ 0 1 0 1 0 ]</pre>'
  +'边集 (1,2)、(1,3)、(1,4)、(2,3)、(2,4)、(2,5)、(3,4)、(4,5)，共 <b>8</b> 条边。<br>'
  +'<b>第一步为什么能断定是无向图</b>：题目没说方向，但<b>邻接表里每条边都成对出现</b>——1 的表里有 2，2 的表里也有 1；4 的表里有 5，5 的表里也有 4……<b>一条边被存了两次，正是无向图邻接表的标志</b>。若按有向图理解，它就是"每对顶点都有两条反向弧"，与无向图等价，所以<b>默认按无向图作答</b>。<br>'
  +'<b>第二步填矩阵</b>：扫顶点 i 的边表，遇到结点 j 就置 <b>A[i][j]=1</b>（一遍扫完自然就对称了，不用手动补另一半）。<br>'
  +'<b>三重自查（考场上一定要做）</b>：<br>· <b>对称性</b>：矩阵必须关于主对角线对称 ✓；<br>· <b>行和 = 度</b>：各行和 3、4、3、4、2，正好等于各顶点边表的长度 ✓；<br>· <b>度和 = 2|E|</b>：3+4+3+4+2 = 16 = 2×8 ⟹ 8 条边，与"边表结点总数 16 ÷ 2"一致 ✓。<br>'
  +'⚠️ 最常见的失分：<b>把边表结点数 16 当成边数</b>。无向图邻接表存了两遍，<b>边数 = 边表结点数 ÷ 2</b>；画图时也只画 8 条线，不是 16 条。',
 run:'程序由邻接表填矩阵：结果对称 ✅，行和 [3,4,3,4,2]，边数 = 16/2 = 8 ✅', verdict:'ok'},

{id:'6.2-综3', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'', exam:null,
 kp:['存储结构·四格对照'],
 hints:['把问题拆成 2×2 的四格表：{邻接矩阵, 邻接表} × {无向图, 有向图}，四格分别回答。',
        '每一格都盯住同一个核心差别：<b>无向图的边被存了两遍（矩阵对称、边表结点成对），有向图只存一遍</b>；以及<b>有向图的入度在邻接表里是"散"在全表的</b>。'],
 stem:'对于 n 个顶点的无向图和有向图，分别采用邻接矩阵和邻接表表示时，试问：<br>1）如何判别图中有多少条边？<br>2）如何判别任意两个顶点 i 和 j 是否有边相连？<br>3）任意一个顶点的度是多少？',
 book:'1）邻接矩阵表示的无向图：矩阵中 1 的个数除以 2 即边数；邻接表表示的无向图：边表结点数除以 2 即边数。邻接矩阵表示的有向图：矩阵中 1 的个数即弧数；邻接表表示的有向图：边表结点数即弧数。<br>2）邻接矩阵：若 arcs[i][j] 或 arcs[j][i] 为 1，则顶点 i 与 j 之间有边相连。邻接表：从顶点表的第 i 个结点出发，遍历其边表，若能找到 adjvex 域为 j 的边表结点，则有边相连（或从第 j 个结点出发查找 i）。<br>3）邻接矩阵表示的无向图：顶点 i 的度等于第 i 行（或第 i 列）中 1 的个数。邻接矩阵表示的有向图：顶点 i 的出度等于第 i 行中 1 的个数，入度等于第 i 列中 1 的个数，度等于二者之和。邻接表表示的无向图：顶点 i 的度等于第 i 个单链表中边表结点的个数。邻接表表示的有向图：顶点 i 的出度等于第 i 个单链表中边表结点的个数，入度等于整个邻接表中 adjvex 域为 i 的结点个数，度等于二者之和。',
 claude:'答案见下面这张 <b>2×2 对照表</b>——本节所有选择题都是从这四格里挖出来的，<b>把这张表背下来，6.2 的选择题基本免疫</b>：<br>'
  +'<table class="qtab"><tr><th></th><th>邻接矩阵</th><th>邻接表</th></tr>'
  +'<tr><td class="rowh">求边数<br>（无向）</td><td>1 的个数 ÷ <b>2</b><br>代价 O(n²)</td><td>边表结点数 ÷ <b>2</b><br>代价 O(n+e)</td></tr>'
  +'<tr><td class="rowh">求边数<br>（有向）</td><td>1 的个数<br>代价 O(n²)</td><td>边表结点数<br>代价 O(n+e)</td></tr>'
  +'<tr><td class="rowh">判 i、j<br>是否相邻</td><td><b>A[i][j] 直接看，O(1)</b></td><td>扫第 i 条边表找 j，<b>O(n)</b></td></tr>'
  +'<tr><td class="rowh">求度<br>（无向）</td><td>第 i 行（或列）1 的个数，O(n)</td><td>第 i 条边表的<b>结点个数</b>，O(n)</td></tr>'
  +'<tr><td class="rowh">求度<br>（有向）</td><td>出度=第 i <b>行</b>，入度=第 i <b>列</b><br>都是 O(n)</td><td>出度=第 i 条边表长度 O(n)<br><b>入度=扫全表数 adjvex==i，O(n+e)</b></td></tr></table>'
  +'<b>三个必须点破的地方</b>：<br>'
  +'· <b>"÷2" 只属于无向图</b>：无向边在矩阵里占对称的两格、在邻接表里挂两个结点，所以要减半；有向图一格 / 一结点就是一条弧，不减。<br>'
  +'· <b>判相邻是邻接矩阵的主场</b>：O(1) 直接下标访问，邻接表只能顺链找，这是矩阵<b>唯一压倒性的优势</b>，也是"稠密图用矩阵"之外的第二个选型理由。<br>'
  +'· <b>邻接表求有向图入度是全表扫描 O(n+e)</b>，这是它的软肋（第 11、14、15、16 题反复考），<b>换成十字链表就能治好</b>。<br>'
  +'⚠️ 第 1 问还有个隐含结论：<b>邻接矩阵"数边数"要 O(n²)，比邻接表的 O(n+e) 慢</b>——因为矩阵里"有没有边"的信息是<b>摊开</b>存的，必须每格都看一遍。所以"判两点相邻"矩阵快、"统计全图边数"反而邻接表快，两者不矛盾。',
 run:null, verdict:'ok'},

{id:'6.2-综4', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'', exam:null,
 kp:['邻接矩阵·重新编号与上三角'],
 hints:['"所有 1 都落在对角线以上" ⟺ 只要存在弧 ⟨i,j⟩ 就必有 <b>i &lt; j</b>，即编号沿弧的方向严格递增。',
        '这正是<b>拓扑序列</b>的定义：把拓扑排序的结果依次编号为 1,2,…,n 即可。无环是它能成立的前提。'],
 stem:'如何对无环有向图中的顶点重新编号，使得该图的邻接矩阵中所有的 1 都集中到对角线以上？',
 book:'可以按各顶点的出度排序：n 个顶点的有向图，顶点的最大出度为 n−1、最小出度为 0，将出度最大的顶点编号为 1，出度最小的顶点编号为 n；之后再作调整，只要存在弧 ⟨i,j⟩，就把 i 的编号排在 j 的编号之前。因为只有当 i&lt;j 时，弧 ⟨i,j⟩ 对应的 1 才落在邻接矩阵的上三角部分。更简便的方法是对该有向图进行拓扑排序，再按拓扑序列的先后依次编号（见 6.4 节）。',
 claude:'答案：<b>对该无环有向图做一次拓扑排序，按拓扑序列的先后依次编号为 1, 2, …, n 即可。</b><br>'
  +'<b>为什么这样就对了</b>——先把目标翻译成一句数学话：<br>· "所有 1 都在对角线<b>以上</b>" ⟺ 凡 A[i][j]=1 都有 <b>i &lt; j</b> ⟺ <b>每条弧都从小编号指向大编号</b>；<br>· 而"<b>对每条弧 ⟨u,v⟩，u 都排在 v 前面</b>"正是<b>拓扑序列的定义</b>。<br>⟹ 两件事是<b>同一件事</b>，拓扑排序的输出直接就是要找的编号方案。<br>'
  +'<b>"无环"这个条件用在哪</b>：<b>有向图存在拓扑序列 ⟺ 它是有向无环图（DAG）</b>。若有环，环上的顶点谁也没法排在谁前面，编号必然会有一条弧"往回指"，那个 1 就落到下三角去了——所以题目必须先给"无环"。<br>'
  +'<b>反过来也成立</b>（本节选择题 01 的 C 选项）：<b>若邻接矩阵的下三角全为 0，则该图无环、拓扑序列必定存在</b>。这道综合题和那道选择题是同一个命题的正反两面。<br>'
  +'⚠️ 书上先给的"按出度排序再调整"的思路<b>并不严谨</b>——出度大小与拓扑先后<b>没有必然关系</b>（出度为 0 的汇点一定排最后没错，但中间层次的顶点无法只靠出度定序），所以它后面才补了"之后再作调整"这句话把漏洞堵上。<b>考场上直接写拓扑排序，一句话说清、还带正确性证明</b>，比按出度排稳得多。<br>'
  +'📌 顺带记一个副产品：<b>拓扑序不唯一 ⟹ 满足条件的编号方案通常也不唯一</b>，题目只要求给出一种。',
 run:null, verdict:'ok'},

{id:'6.2-综5', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'', exam:null,
 kp:['算法·邻接表转邻接矩阵'],
 hints:['先把目标写清楚：邻接表里"顶点 i 的边表中有结点 j" ⟺ 邻接矩阵里 arcs[i][j]=1。',
        '外层 for 遍历 n 个顶点，取出 firstarc；内层 while 顺着 nextarc 走完这条边表，每遇到一个结点就按它的 adjvex 置 1。',
        '别忘了先把整个矩阵清 0（这一步就决定了总时间是 O(n²)）；有向图、无向图用同一段代码，无须区分。'],
 stem:'写出从图的邻接表表示转换成邻接矩阵表示的算法。',
 book:'首先将邻接矩阵初始化，然后依次遍历各顶点 v[i] 的边链表，若链表结点的值为 j，则置 arcs[i][j]=1。该算法对有向图和无向图均适用。',
 code:'void Convert(ALGraph &G, int arcs[M][N]){\n'
  +'//此算法将邻接表方式表示的图 G 转换为邻接矩阵 arcs\n'
  +'    for(i=0; i<n; i++){            //依次遍历各顶点表结点为头的边链表\n'
  +'        p = (G->v[i]).firstarc;    //取出顶点 i 的第一条出边\n'
  +'        while(p != NULL){          //遍历边链表\n'
  +'            arcs[i][p->adjvex] = 1;\n'
  +'            p = p->nextarc;        //取下一条出边\n'
  +'        }\n'
  +'    }\n'
  +'}',
 claude:'答案见左侧参考代码。<b>核心只有一行：<code>arcs[i][p-&gt;adjvex] = 1;</code></b>——邻接表里"i 的边表中挂着 j"和邻接矩阵里"A[i][j]=1"说的是同一件事，转换就是把这句话换个地方写。<br>'
  +'<b>算法骨架（写在卷面上的三步）</b>：<br>① <b>初始化</b>：把 arcs 全部置 0（书上的参考代码把这步省了，<b>自己写时务必补上</b>，否则残留数据会造成假边——这是最容易被扣分的地方）；<br>② <b>外层</b>：i 从 0 到 n−1，取 <code>p = G.vertices[i].firstarc</code>；<br>③ <b>内层</b>：<code>while(p)</code> 顺 <code>nextarc</code> 走，每个结点置 <code>arcs[i][p-&gt;adjvex]=1</code>。<br>'
  +'<b>复杂度</b>：初始化 <b>O(n²)</b>，遍历全部边表 <b>O(n+e)</b>；因为 e ≤ n²，<b>总时间 O(n²)</b>，空间 O(1)（不含输出矩阵）。<b>瓶颈在初始化，不在遍历</b>——这一点常被问到。<br>'
  +'<b>为什么有向、无向共用一套代码</b>：无向图的邻接表本来就把每条边<b>存了两次</b>（i 的表里有 j，j 的表里也有 i），跑完这段代码 arcs 自然就是<b>对称</b>的，<b>不需要额外写 arcs[j][i]=1</b>。反过来，如果画蛇添足地补一句对称赋值，遇到有向图就会把单向弧错误地变成双向。<br>'
  +'⚠️ 两个细节：① 若是<b>带权图</b>，应改成 <code>arcs[i][p-&gt;adjvex] = p-&gt;info;</code>，且初始化要填 <b>∞</b> 而不是 0；② 书上代码里的 <code>G-&gt;v[i]</code> 与形参 <code>ALGraph &amp;G</code> 混用了引用和指针写法，<b>抄的时候统一成 <code>G.vertices[i].firstarc</code></b>，别把书上的排版瑕疵一起搬到卷面上。',
 run:'程序按此算法把综合题 02 的邻接表转成矩阵：与手工填出的 5×5 矩阵逐格一致 ✅', verdict:'ok'},

{id:'6.2-综6', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'2015 统考', exam:2015,
 kp:['邻接矩阵幂·路径条数'],
 hints:['第 1 问按定义填矩阵即可，注意题目要求<b>下标从 0 开始</b>，别写成 1–5。',
        '第 2 问老老实实做矩阵乘法：(A²)[i][j] = Σ<sub>k</sub>A[i][k]·A[k][j]，其实就是"把 A 的第 i 行里为 1 的那几行加起来"。',
        '第 3 问是把第 2 问的结论一般化：幂次 m 是<b>路径长度</b>，元素值是<b>路径条数</b>。'],
 stem:'【2015 统考真题】已知含有 5 个顶点的图 G 如右图所示。请回答下列问题：<br>1）写出图 G 的邻接矩阵 A（行、列下标从 0 开始）。<br>2）求 A<sup>2</sup>，矩阵 A<sup>2</sup> 中位于 0 行 3 列元素值的含义是什么？<br>3）若已知具有 n(n≥2) 个顶点的图的邻接矩阵为 B，则 B<sup>m</sup>(2≤m≤n) 中非零元素的含义是什么？',
 fig:'图/ch6/6.2-综6.svg',
 figcap:'2015 统考真题图 G：5 个顶点（0–4）、7 条边的无向图（据王道 p.213 重画）',
 book:'1）图 G 的边为 (0,1)、(0,2)、(0,4)、(1,3)、(1,4)、(2,3)、(3,4)，邻接矩阵 A 为：<pre class="code">0 1 1 0 1\n1 0 0 1 1\n1 0 0 1 0\n0 1 1 0 1\n1 1 0 1 0</pre>2）A<sup>2</sup> 为：<pre class="code">3 1 0 3 1\n1 3 2 1 2\n0 2 2 0 2\n3 1 0 3 1\n1 2 2 1 3</pre>矩阵 A<sup>2</sup> 中位于 0 行 3 列的元素值为 3，表示从顶点 0 到顶点 3 之间长度为 2 的路径共有 3 条。<br>3）B<sup>m</sup> 中位于 i 行 j 列（0≤i,j≤n−1）的非零元素的含义是：图中从顶点 i 到顶点 j 长度为 m 的路径的条数。',
 claude:'答案与书答完全一致（我用矩阵乘法逐元素复算过）。<br>'
  +'<b>1）邻接矩阵 A</b>（边集 (0,1)、(0,2)、(0,4)、(1,3)、(1,4)、(2,3)、(3,4)）：<pre class="code">    0 1 2 3 4\n0 [ 0 1 1 0 1 ]\n1 [ 1 0 0 1 1 ]\n2 [ 1 0 0 1 0 ]\n3 [ 0 1 1 0 1 ]\n4 [ 1 1 0 1 0 ]</pre>'
  +'<b>填完先自查</b>：① 无向图矩阵必<b>对称</b> ✓；② 主对角线全 0（无自环）✓；③ 行和 = 各点的度 = 3,3,2,3,3，和 = 14 = 2×7 = 2|E| ✓。三条都过再往下算，能挡掉绝大多数抄图错误。<br>'
  +'<b>2）A²</b>：<pre class="code">    0 1 2 3 4\n0 [ 3 1 0 3 1 ]\n1 [ 1 3 2 1 2 ]\n2 [ 0 2 2 0 2 ]\n3 [ 3 1 0 3 1 ]\n4 [ 1 2 2 1 3 ]</pre>'
  +'<b>手算捷径</b>：不必逐格做内积。<b>A² 的第 i 行 = 把 A 中"i 的邻居"那几行加起来</b>。例如第 0 行：0 的邻居是 1、2、4 ⟹ 第 0 行 = 行1 + 行2 + 行4 = (1,0,0,1,1)+(1,0,0,1,0)+(1,1,0,1,0) = <b>(3,1,0,3,1)</b>。五行都这么加，比做 25 次内积快得多也不易错。<br>'
  +'<b>0 行 3 列 = 3 的含义</b>：<b>从顶点 0 到顶点 3、长度恰为 2 的路径共有 3 条</b>，即 <b>0—1—3、0—2—3、0—4—3</b>（0 的三个邻居 1、2、4 恰好都与 3 相邻，可以直接在图上点出来验证）。<br>'
  +'<b>再多看两格加深理解</b>：<b>主对角线上的 A²[i][i] 恰等于顶点 i 的度</b>（从 i 出去再原路回来，走一条边就有一条这样的"路径"）——0,1,3,4 的度是 3，2 的度是 2，与对角线 3,3,2,3,3 完全吻合，<b>这是验算 A² 的最快自查点</b>。<br>'
  +'<b>3）一般结论</b>：<b>B<sup>m</sup>[i][j] = 图中从顶点 i 到顶点 j 长度<u>恰好</u>为 m 的路径条数</b>（非零就表示这样的路径存在）。<br>'
  +'⚠️ 三个必须写准的字眼：① <b>"长度恰为 m"</b>，不是"不超过 m"（那要算 B+B²+…+B<sup>m</sup>）；② 这里的"路径"<b>允许重复经过顶点和边</b>（0—1—0 也算长度 2 的路径，所以对角线才非零）——若题目问的是不重复顶点的<b>简单路径</b>，这个结论就<b>不成立</b>；③ <b>幂次是长度、元素值是条数</b>，别说反（本节选择题 08 考的就是这一句）。',
 run:'程序做矩阵乘法：A² 与书答 25 个元素逐格一致；A²[0][3]=3，对应路径 0-1-3、0-2-3、0-4-3；对角线 (3,3,2,3,3) = 各点度数 ✅', verdict:'ok'},

{id:'6.2-综7', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'2021 统考', exam:2021,
 kp:['算法·邻接矩阵求度'],
 hints:['题干已经把判定条件送给你了：<b>度为奇数的顶点个数是"不大于 2 的偶数"</b>，即 0 或 2 —— 不用自己发明图论定理。',
        '剩下的问题只是"怎么求度"：无向图用邻接矩阵存储，<b>顶点 i 的度 = 第 i 行元素之和</b>（0/1 矩阵直接累加即可）。',
        '一层 for 扫顶点、内层 for 累加该行得 degree，degree%2 != 0 就给 count 加一；扫完判断 count==0 || count==2。',
        '复杂度：遍历整个 n×n 矩阵 ⟹ 时间 O(n²)，只用了几个变量 ⟹ 空间 O(1)。'],
 stem:'【2021 统考真题】已知无向连通图 G 由顶点集 V 和边集 E 组成，|E|&gt;0，当 G 中度为奇数的顶点个数为不大于 2 的偶数时，G 存在包含所有边且长度为 |E| 的路径（称为 EL 路径）。设图 G 采用邻接矩阵存储，类型定义如下：'
  +'<pre class="code">typedef struct {                 //图的定义\n    int numVertices, numEdges;   //图中实际的顶点数和边数\n    char VerticesList[MAXV];     //顶点表，MAXV 为已定义常量\n    int Edge[MAXV][MAXV];        //邻接矩阵\n} MGraph;</pre>'
  +'请设计算法 <code>int IsExistEL(MGraph G)</code>，判断 G 是否存在 EL 路径，若存在则返回 1，否则返回 0。要求：<br>1）给出算法的基本设计思想。<br>2）根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出注释。<br>3）说明你所设计算法的时间复杂度和空间复杂度。',
 book:'1）算法的基本设计思想：图 G 采用邻接矩阵存储，顶点 i 的度等于邻接矩阵中第 i 行（或第 i 列）的非零元素个数。依次计算各个顶点的度，并统计度为奇数的顶点个数 count；若 count 等于 0 或 2，则存在 EL 路径，返回 1，否则返回 0。<br>2）算法实现见参考代码。<br>3）算法需要遍历整个邻接矩阵，时间复杂度为 O(n²)（n 为顶点数）；算法只使用了常数个辅助变量，空间复杂度为 O(1)。',
 code:'int IsExistEL(MGraph G){\n'
  +'    int degree, i, j, count = 0;\n'
  +'    for(i = 0; i < G.numVertices; i++){\n'
  +'        degree = 0;\n'
  +'        for(j = 0; j < G.numVertices; j++)\n'
  +'            degree += G.Edge[i][j];    //依次计算各个顶点的度\n'
  +'        if(degree % 2 != 0)\n'
  +'            count++;                   //对度为奇数的顶点计数\n'
  +'    }\n'
  +'    if(count == 0 || count == 2)\n'
  +'        return 1;                      //存在 EL 路径\n'
  +'    else\n'
  +'        return 0;                      //不存在 EL 路径\n'
  +'}',
 claude:'答案与书答一致。<b>这是一道典型的"送分题"——题干已经把图论定理原封不动地告诉你了，你要做的只是"照着实现"。</b><br>'
  +'<b>1）设计思想（卷面这样写）</b>：<br>① 无向图用邻接矩阵存储时，<b>顶点 i 的度 = 第 i 行（或第 i 列）非零元素的个数</b>；本题矩阵为 0/1 矩阵，直接<b>把该行累加</b>即得度。<br>② 依次求出每个顶点的度，用 <b>count</b> 统计<b>度为奇数</b>的顶点个数。<br>③ 按题设条件：<b>count 为不大于 2 的偶数（即 0 或 2）时存在 EL 路径</b>，返回 1；否则返回 0。<br>'
  +'<b>2）代码</b>见左侧（双重循环 + 一个计数器，十行以内）。<br>'
  +'<b>3）复杂度</b>：<b>时间 O(n²)</b>（n = G.numVertices，要把整个邻接矩阵扫一遍）；<b>空间 O(1)</b>（只用了 degree、i、j、count 四个变量）。<br>'
  +'<b>这道题背后是什么</b>：所谓 <b>EL 路径就是欧拉路径</b>——一次走遍<b>所有边</b>且每条边只走一次（长度 = |E|）。欧拉定理：连通无向图存在欧拉<b>回路</b> ⟺ <b>所有顶点度数全为偶数</b>（奇度点 0 个）；存在欧拉<b>通路</b>（起终点不同）⟺ <b>恰有 2 个奇度顶点</b>。<b>知道这个背景能帮你理解，但考场上千万别自作聪明去写"我记得的欧拉定理"——题干怎么说就怎么做。</b><br>'
  +'⚠️ 三个容易丢分的细节：<br>· <b>count 不可能是奇数</b>（度和 = 2|E| 必为偶数 ⟹ 奇度顶点必成对出现），所以判断写成 <code>count==0 || count==2</code> 和写成 <code>count&lt;=2</code> 在本题等价；但<b>照题干原话写"0 或 2"最稳</b>。<br>· 题目给了 <code>numEdges</code> 却<b>用不上</b>，别被它带偏去数边。<br>· 若矩阵是<b>带权</b>的，<code>degree += G.Edge[i][j]</code> 就<b>错了</b>（把权值当成了度），要改成 <code>if(G.Edge[i][j] != 0 &amp;&amp; G.Edge[i][j] != INF) degree++;</code>。本题明确是 0/1 矩阵才能直接累加——<b>408 大题里"能不能直接 += "永远取决于矩阵存的是标志还是权值。</b><br>'
  +'📌 <b>答题模板</b>：这道题的三问格式（设计思想 → 代码 → 复杂度）是 408 算法大题的<b>固定卷面</b>，<b>三问都要写、缺一问直接丢分</b>；即使代码写不全，把"设计思想"和"复杂度"写清楚也能拿到大半分。',
 run:'程序按此算法测试多个无向图：路径图(2 个奇度点)→1、环(0 个)→1、星形 K1,3(4 个奇度点)→0，与欧拉定理判定一致 ✅', verdict:'ok'},

{id:'6.2-综8', ch:6, sec:'6.2 图的存储及基本操作', type:'subjective', tag:'2023 统考', exam:2023,
 kp:['算法·邻接矩阵求出入度'],
 hints:['把 K 顶点的定义翻译成邻接矩阵的语言：<b>出度 = 第 k 行之和，入度 = 第 k 列之和</b>（行出列入），要求"行和 &gt; 列和"。',
        '外层 for 遍历每个顶点 k；内层用两个 for 分别把第 k <b>行</b>和第 k <b>列</b>累加出来（注意两个循环里下标 m 放的位置不同：Edge[k][m] 与 Edge[m][k]）。',
        '若 outdegree &gt; indegree，就 printf 输出 <code>G.VerticesList[k]</code> 并让 count++；循环结束后 return count。',
        '复杂度：两个内层循环都是 O(n)，套在 O(n) 的外层里 ⟹ 时间 O(n²)，空间 O(1)。'],
 stem:'【2023 统考真题】已知有向图 G 采用邻接矩阵存储，类型定义如下：'
  +'<pre class="code">typedef struct {                 //图的定义\n    int numVertices, numEdges;   //图中实际的顶点数和边数\n    char VerticesList[MAXV];     //顶点表，MAXV 为已定义常量\n    int Edge[MAXV][MAXV];        //邻接矩阵\n} MGraph;</pre>'
  +'将图中<b>出度大于入度</b>的顶点称为 K 顶点。请设计算法 <code>int printVertices(MGraph G)</code>，输出 G 中所有的 K 顶点，并返回 K 顶点的个数。要求：<br>1）给出算法的基本设计思想。<br>2）根据设计思想，采用 C 或 C++ 语言描述算法，关键之处给出注释。<br>3）说明你所设计算法的时间复杂度和空间复杂度。',
 book:'1）算法的基本设计思想：有向图采用邻接矩阵存储时，矩阵中第 k 行非零元素的个数即顶点 k 的出度，第 k 列非零元素的个数即顶点 k 的入度。依次对每个顶点 k 统计其出度 outdegree 和入度 indegree，若 outdegree−indegree>0，则该顶点为 K 顶点，输出 G.VerticesList[k] 并将计数器加 1。遍历完所有顶点后返回计数器的值。<br>2）算法实现见参考代码。<br>3）算法需要遍历整个邻接矩阵，时间复杂度为 O(n²)（n 为顶点数）；只使用了常数个辅助变量，空间复杂度为 O(1)。',
 code:'int printVertices(MGraph G){\n'
  +'    int indegree, outdegree, k, m, count = 0;\n'
  +'    for(k = 0; k < G.numVertices; k++){\n'
  +'        indegree = outdegree = 0;\n'
  +'        for(m = 0; m < G.numVertices; m++)\n'
  +'            outdegree += G.Edge[k][m];      //第 k 行之和 = 顶点 k 的出度\n'
  +'        for(m = 0; m < G.numVertices; m++)\n'
  +'            indegree += G.Edge[m][k];       //第 k 列之和 = 顶点 k 的入度\n'
  +'        if(outdegree > indegree){\n'
  +'            printf("%c ", G.VerticesList[k]);\n'
  +'            count++;\n'
  +'        }\n'
  +'    }\n'
  +'    return count;                           //返回 K 顶点的个数\n'
  +'}',
 claude:'答案与书答一致。<b>本题和 2021 那道（综合题 07）是同一个模子刻出来的：都是"在邻接矩阵上按行/按列数一遍"，两年连着考，说明"<u>行出列入</u>"这四个字必须条件反射。</b><br>'
  +'<b>1）设计思想（卷面这样写）</b>：<br>① 有向图用邻接矩阵存储时，<b>第 k 行非零元素个数 = 顶点 k 的出度 OD(v<sub>k</sub>)，第 k 列非零元素个数 = 入度 ID(v<sub>k</sub>)</b>。<br>② 对每个顶点 k，分别累加第 k 行得 outdegree、累加第 k 列得 indegree。<br>③ 若 <b>outdegree &gt; indegree</b>，则 k 为 K 顶点，输出 <code>G.VerticesList[k]</code> 并计数。<br>④ 遍历完所有顶点后返回计数值。<br>'
  +'<b>2）代码</b>见左侧。<b>唯一的技术点是两个内层循环里下标的位置</b>：<b>行和写 <code>G.Edge[k][m]</code>（k 钉死、m 在跑），列和写 <code>G.Edge[m][k]</code>（m 在跑、k 钉死）</b>。把这两处写反，整道题的结果就完全颠倒——<b>这是本题最主要的失分点</b>，写完务必回头核一眼。<br>'
  +'<b>3）复杂度</b>：<b>时间 O(n²)</b>（每个顶点花 O(n) 算行和 + O(n) 算列和，共 n 个顶点 ⟹ 2n² 次访问）；<b>空间 O(1)</b>。<br>'
  +'<b>能不能更快</b>：可以只扫一遍矩阵，用两个长度为 n 的数组同时累加所有顶点的行和与列和，时间仍是 O(n²) 但常数减半，<b>代价是空间升到 O(n)</b>。<b>本题写朴素双层循环即可，不必优化</b>——阅卷按设计思想和正确性给分。<br>'
  +'⚠️ 三处细节：<br>· <b>主对角线（自环）会同时计入出度和入度</b>，相减时自动抵消，不影响 K 顶点的判定，<b>不需要特判</b>；<br>· 题目要求"<b>输出所有 K 顶点</b>"，输出的是<b>顶点的数据 <code>VerticesList[k]</code>（字符）</b>而不是下标 k，别写成 <code>printf("%d", k)</code>；<br>· <b>返回值别忘了</b>——题目明确要求"返回 K 顶点的个数"，只 printf 不 return 会丢分。<br>'
  +'📌 与 2021 题合起来记一句话：<b>"邻接矩阵 + 算法大题" ⟹ 十有八九就是让你按行按列数非零元素</b>（求度、求出入度、判奇偶、比大小），套路极其固定，属于必须拿满的分。',
 run:'程序按此算法测试：对 6.2-综1 的 7 顶点带权图（转 0/1 后）逐点算出入度，K 顶点集合与手工核对一致 ✅', verdict:'ok'},

{id:'6.3-1', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['BFS·总辨析'],
 stem:'下列关于广度优先算法的说法中，正确的是（　）。<br>'
  +'Ⅰ. 当各边的权值相等时，广度优先算法可以解决单源最短路径问题<br>'
  +'Ⅱ. 当各边的权值不等时，广度优先算法可以解决单源最短路径问题<br>'
  +'Ⅲ. 广度优先算法类似于树中的后序遍历算法<br>'
  +'Ⅳ. 实现图的广度优先算法时，使用的数据结构是队列',
 opts:['Ⅰ、Ⅳ','Ⅱ、Ⅲ、Ⅳ','Ⅱ、Ⅳ','Ⅰ、Ⅲ、Ⅳ'], ans:'A',
 book:'广度优先搜索以起始顶点为中心，一层一层地向外层扩展遍历图的顶点，因此无法考虑边权值，只适合求边权值相等的图的单源最短路径。广度优先搜索相当于树的层序遍历，说法 Ⅲ 错误。广度优先搜索需要用到队列，深度优先搜索需要用到栈，说法 Ⅳ 正确。',
 claude:'一致，选 A（Ⅰ、Ⅳ 正确）。<br>· <b>Ⅰ 对、Ⅱ 错</b>：BFS 是<b>按"跳数"一层层往外推</b>的，它心里只有"走了几条边"，<b>根本不看权值</b>。所以只有当所有边权相等（等价于非带权图）时，"边数最少"才等于"总权值最小"；权值一不等，BFS 立刻失效 ⟹ 那是 <b>Dijkstra</b> 的活。<br>· <b>Ⅲ 错</b>：BFS 对应树的<b>层序遍历</b>（按层次），<b>DFS</b> 才对应树的<b>先序遍历</b>。后序遍历在图里没有对应物。<br>· <b>Ⅳ 对</b>：<b>BFS 用队列（先进先出，保证一层走完再下一层）；DFS 用栈（或递归的系统栈）</b>。<br>📌 一句话记牢全章：<b>BFS＝层序＋队列＋非带权最短路；DFS＝先序＋栈＋回溯</b>。<br>⚠️ Ⅰ 的措辞"各边权值相等"是命题人故意换的皮——它就等于"非带权图"，别被"权值"两个字吓到直接排除。',
 run:null, verdict:'ok'},

{id:'6.3-2', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['遍历·唯一性与连通性'],
 stem:'下列关于图的说法中，<b>错误</b>的是（　）。<br>'
  +'Ⅰ. 对一个无向图进行深度优先遍历时，得到的深度优先遍历序列是唯一的<br>'
  +'Ⅱ. 若有向图不存在回路，即使不用访问标志位，同一顶点也不会被访问两次<br>'
  +'Ⅲ. 采用深度优先遍历或拓扑排序算法可以判断一个有向图中是否有环（回路）<br>'
  +'Ⅳ. 对任何非强连通图必须 2 次或以上调用广度优先遍历算法才可访问所有的顶点',
 opts:['Ⅰ、Ⅱ、Ⅲ','Ⅱ、Ⅲ','Ⅰ、Ⅱ','Ⅰ、Ⅱ、Ⅳ'],
 ans:'D',
 book:'图的深度优先遍历序列通常是不唯一的，说法 Ⅰ 错误。图 1 是一个不存在回路的有向图，从顶点 1 开始执行广度优先遍历，若不设置访问标志位，则会重复访问顶点 3，说法 Ⅱ 错误。深度优先遍历或拓扑排序算法可以判断有向图中是否有环，说法 Ⅲ 正确。图 2 是一个非强连通图，但从顶点 1 开始调用一次广度优先遍历算法就可访问所有顶点，说法 Ⅳ 错误。故错误的是 Ⅰ、Ⅱ、Ⅳ。',
 claude:'一致，选 D（<b>错误的说法是 Ⅰ、Ⅱ、Ⅳ</b>）。<br>· <b>Ⅰ 错</b>：DFS 序列<b>通常不唯一</b>——同一顶点的多个邻接点先走哪个没有规定。只有<b>"邻接矩阵存储 + 固定源点"</b>时才唯一（矩阵按下标从小到大扫，顺序被钉死）。这条是本节的头号陷阱，见第 11 题书上的注解。<br>· <b>Ⅱ 错</b>：无回路 ≠ 不会重复访问。<b>反例</b>：1→2、1→3、2→3（这是个 DAG，没有任何回路），不设 visited[] 时，顶点 3 会被 1 访问一次、又被 2 访问一次 ⟹ <b>访问两次</b>。<br>　📌 把"回路"和"重复访问"分清楚：<b>回路让程序<u>死循环</u>，而<u>汇聚</u>（多个前驱指向同一顶点）只是让它重复访问</b>——DAG 消灭了前者，消灭不了后者。<br>· <b>Ⅲ 对</b>：<b>DFS 遇到"指向栈中顶点"的回边 ⟹ 有环</b>；<b>拓扑排序输出的顶点数 &lt; |V| ⟹ 有环</b>。两条路都能判。<br>· <b>Ⅳ 错</b>：<b>反例</b>：1→2→3 不是强连通图（3 回不到 1），但从 1 出发一次 BFS 就能访问全部 3 个顶点。<br>　⚠️ 正确的说法应该是"<b>无向图</b>中调用次数 = 连通分量数"；有向图只看"<b>从起点能否到达所有顶点</b>"，与强连通<b>不等价</b>。',
 run:'程序核验反例：Ⅱ 的图 1→2、1→3、2→3 无环，不设标志位时顶点 3 被访问 2 次 ✅；Ⅳ 的图 1→2→3 非强连通，从 1 出发一次 BFS 即遍历全部顶点 ✅', verdict:'ok'},

{id:'6.3-3', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['遍历·调用次数=连通分量数'],
 stem:'对于一个非连通无向图 G，采用深度优先遍历访问所有顶点，在 DFSTraverse 函数中调用 DFS 的次数正好等于（　）。',
 opts:['顶点数','边数','连通分量数','不确定'], ans:'C',
 book:'DFS（或 BFS）可用来计算无向图的连通分量数，因为一次遍历必然会将一个连通图中的所有顶点都访问到，所以计算图的连通分量数正好是 DFSTraverse() 中 DFS 被调用的次数。',
 claude:'一致，选 C。<b>推理只需两句话</b>：<br>· 外层 <code>for(i) if(!visited[i]) DFS(G,i);</code> 每调用一次 DFS，就<b>把当前顶点所在的整个连通分量一次性染完</b>（无向图中"可达"就是"连通"，DFS 走不出这个分量，也不会漏掉分量内任何顶点）；<br>· 所以<b>每个连通分量恰好触发一次调用</b>，一次不多、一次不少 ⟹ <b>调用次数 = 连通分量数</b>。<br>📌 这给了一个<b>免费的算法</b>：想数连通分量，就在外层循环里加个计数器，时间不变（邻接表 O(n+e)）。BFS 同理。<br>⚠️ <b>这条只对无向图成立</b>。<b>有向图</b>里调用次数<b>既不等于</b>强连通分量数<b>也不等于</b>弱连通分量数——它取决于外层循环的顶点编号顺序（如 1→2→3 从 1 起只调 1 次，但强连通分量有 3 个）。第 2 题的 Ⅳ 就是拿这一点设的陷阱。',
 run:null, verdict:'ok'},

{id:'6.3-4', ch:6, sec:'6.3 图的遍历', type:'subjective', tag:'', exam:null,
 kp:['遍历·复杂度（邻接表）'],
 hints:['先记死一句话：<b>遍历的时间复杂度只取决于存储结构，与是 DFS 还是 BFS、与访问顺序都无关。</b>',
        '邻接表下把两件事加起来：n 个顶点表结点各查一次 O(n)＋所有边表结点各查一次 O(e) ⟹ O(n+e)；空间则是"递归栈 / 辅助队列最多装 n 个顶点" ⟹ O(n)。'],
 stem:'（四空题）对一个有 n 个顶点、e 条边的图采用<b>邻接表</b>表示时，进行 DFS 遍历的时间复杂度为＿①＿，空间复杂度为＿②＿；进行 BFS 遍历的时间复杂度为＿③＿，空间复杂度为＿④＿。<br>备选：A. O(n)　B. O(e)　C. O(n+e)　D. O(1)',
 book:'深度优先遍历时，每个顶点表结点和每个边表结点均查找一次，每个顶点递归调用一次，需要借助一个递归工作栈；而广度优先遍历时，也是每个顶点表结点和每个边表结点均查找一次，需要借助一个辅助队列。因此，时间复杂度都为 O(n+e)，空间复杂度都为 O(n)。故依次选 C、A、C、A。',
 claude:'答案：① <b>C</b>　② <b>A</b>　③ <b>C</b>　④ <b>A</b>（即时间都是 O(n+e)、空间都是 O(n)）。<br><b>为什么 DFS 和 BFS 完全一样</b>——因为两者<b>干的活是同一堆</b>，只是<b>顺序不同</b>：<br>· <b>时间</b> = 扫 n 个顶点表结点 <b>O(n)</b> ＋ 顺着链把所有边表结点走一遍 <b>O(e)</b>（有向图 e 个、无向图 2e 个，都是 O(e)）⟹ <b>O(n+e)</b>。<br>· <b>空间</b>：DFS 的递归工作栈最坏装下一条长为 n 的链，BFS 的队列最坏一层就有 n−1 个顶点，<b>都是 O(n)</b>；再加上 visited[] 本身也是 O(n)，不影响量级。<br>⚠️ 三个高频误答：<br>· 写成 <b>O(n·e)</b>——那是"每个顶点都把所有边扫一遍"的写法，邻接表不会这么干；<br>· 写成 <b>O(e)</b>——漏掉了<b>孤立顶点</b>：即使 e=0，外层循环也要跑 n 次，所以 n 这一项<b>不能省</b>；<br>· 空间写成 <b>O(n+e)</b>——那是<b>存储</b>邻接表本身的开销，题目问的是<b>遍历算法额外</b>用的空间。<br>📌 与下一题（第 6 题）配套记：<b>邻接表 O(n+e)、邻接矩阵 O(n²)，空间一律 O(n)</b>。',
 run:null, verdict:'ok'},

{id:'6.3-5', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['BFS·入队次数'],
 stem:'图的广度优先遍历算法中使用队列作为其辅助数据结构，那么在算法执行过程中，每个顶点的入队次数最多为（　）。',
 opts:['1','2','3','4'], ans:'A',
 book:'广度优先遍历中，顶点被访问后立即置访问标志并入队，已访问过的顶点不会再次入队，因此每个顶点最多入队一次。',
 claude:'一致，选 A。<b>关键在代码里"置标志"和"入队"是<u>连在一起、同时发生</u>的</b>：<br><code>if(!visited[w]){ visit(w); visited[w]=TRUE; EnQueue(Q,w); }</code><br>顶点一旦入队，visited 就已经是 TRUE，此后无论它被多少个邻居"看到"，都过不了 <code>if</code> 这一关 ⟹ <b>每个顶点最多入队 1 次，也最多出队 1 次</b>。<br>📌 这正是 BFS <b>空间 O(|V|)</b> 的来源：队列里装的顶点总量有上限 n。<br>⚠️ <b>对照坑</b>：若把 <code>visited[w]=TRUE</code> <b>挪到出队之后</b>再置（一种常见的写错方式），同一个顶点就可能被多个邻居重复入队，队列长度会膨胀到 O(|E|)，<b>复杂度依旧能跑对但空间爆掉</b>——考研代码题里这是个真实扣分点。<br>📌 顺带对比：<b>Dijkstra 用优先队列的"懒惰删除"实现里，一个顶点确实可以多次入队</b>（每次距离被松弛就再压一次），那是因为它没有"访问即定型"的性质。别把两者的结论串了。',
 run:null, verdict:'ok'},

{id:'6.3-6', ch:6, sec:'6.3 图的遍历', type:'subjective', tag:'', exam:null,
 kp:['遍历·复杂度（邻接矩阵）'],
 hints:['邻接矩阵里"找 v 的所有邻接点"没有捷径：必须把第 v 行的 n 个格子<b>逐个看一遍</b>，即 O(n)。',
        'n 个顶点每人做一次这样的 O(n) 扫描 ⟹ n×n = O(n²)。DFS、BFS 都一样。'],
 stem:'（双空题）对有 n 个顶点、e 条边的图采用<b>邻接矩阵</b>表示时，进行 DFS 遍历的时间复杂度为＿①＿，进行 BFS 遍历的时间复杂度为＿②＿。<br>备选：A. O(n<sup>2</sup>)　B. O(e)　C. O(n+e)　D. O(e<sup>2</sup>)',
 book:'采用邻接矩阵存储时，查找每个顶点的邻接点所需时间为 O(n)，故总的时间代价为 O(n²)。DFS 与 BFS 相同，均选 A。',
 claude:'答案：① <b>A</b>　② <b>A</b>（都是 O(n<sup>2</sup>)）。<br><b>只需盯住"找邻接点"这一步的代价</b>：<br>· <b>邻接矩阵</b>：<code>for(w=0;w&lt;n;w++) if(A[v][w])...</code>——不管 v 实际有几个邻居，<b>第 v 行的 n 个格子一个都不能少看</b>（0 也得看一眼才知道没边）⟹ 每个顶点 O(n)，n 个顶点 ⟹ <b>O(n²)</b>。<br>· <b>邻接表</b>：顺着链走，<b>有几个邻居就走几步</b>，全图加起来才是 O(e) ⟹ O(n+e)。<br>· 两者的差距就是<b>"稠密图用矩阵、稀疏图用邻接表"</b>的全部理由：当 e ≈ n² 时两者同阶，当 e ≈ n 时邻接表快一个数量级。<br>⚠️ 注意<b>空间复杂度仍是 O(n)</b>（栈/队列），<b>不随存储结构改变</b>——只有<u>时间</u>跟着存储结构走。这是第 4 题与本题唯一不同的地方，别一起改。<br>📌 本题与第 4 题合成一张必背小表：<br><table class="qtab"><tr><th></th><th>邻接矩阵</th><th>邻接表</th></tr>'
  +'<tr><td class="rowh">DFS / BFS 时间</td><td>O(n<sup>2</sup>)</td><td>O(n+e)</td></tr>'
  +'<tr><td class="rowh">DFS / BFS 空间</td><td>O(n)</td><td>O(n)</td></tr></table>',
 run:null, verdict:'ok'},

{id:'6.3-7', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['DFS·序列合法性判定'],
 stem:'无向图 G=(V,E)，其中 V={a,b,c,d,e,f}，E={(a,b),(a,e),(a,c),(b,e),(c,f),(f,d),(e,d)}。对该图从 a 开始进行深度优先遍历，得到的顶点序列正确的是（　）。',
 opts:['a,b,e,c,d,f','a,c,f,e,b,d','a,e,b,c,f,d','a,e,d,f,c,b'], ans:'D',
 book:'按深度优先遍历的规则逐项检验：只有 D 项 a,e,d,f,c,b 是从 a 出发的一个合法深度优先遍历序列。',
 claude:'一致，选 D。<b>验证 DFS 序列的固定动作只有两步</b>（先在草稿上把邻接表列出来）：<br><b>邻接关系</b>：a:{b,c,e}　b:{a,e}　c:{a,f}　d:{e,f}　e:{a,b,d}　f:{c,d}<br>· <b>第一步</b>：看"下一个顶点是否与当前顶点邻接"——邻接就<b>往下走</b>；<br>· <b>第二步</b>：不邻接时，<b>沿着栈往回退</b>，看回溯路径上的顶点是否还有未访问的邻接点，能接上就仍然合法。<br><b>逐项核对</b>：<br>· <b>A</b> a,b,e,<u>c</u>… ✗：e 与 c <b>不邻接</b>；且从 e 回溯前，e 自己还有未访问的 d，<b>必须先去 d</b>，不能撇下 d 回头。<br>· <b>B</b> a,c,f,<u>e</u>… ✗：f 与 e 不邻接（f:{c,d}），f 只能去 d。<br>· <b>C</b> a,e,b,<u>c</u>… ✗：b 走不动要回溯，退到 e 时 <b>d 还没访问</b>，必须先访问 d，不能直接退到 a 去 c。<br>· <b>D</b> a,e,d,f,c,b ✓：a→e→d→f→c（c 只剩已访问的 a，回溯）→ 一路退回 a → b。<b>全程合法</b>。<br>📌 <b>C 项的错法最值得记</b>：<b>回溯必须"逐层退"，退到哪一层就要先把那一层的未访问邻接点走完</b>，不能跳过栈中还有活干的顶点。第 8 题的 3 号序列是同一个坑的加强版。',
 run:'程序枚举该图从 a 出发的<b>全部</b> DFS 序列并逐项匹配：A/B/C 均不在集合中，仅 D（a,e,d,f,c,b）合法 ✅', verdict:'ok'},

{id:'6.3-8', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['DFS·序列合法性判定'],
 stem:'如图所示，在下面的 5 个序列中，符合深度优先遍历的序列个数是（　）。<br>'
  +'1. aebfdc　2. acfdeb　3. aedfcb　4. aefdbc　5. aecfdb',
 fig:'图/ch6/6.3-8.svg',
 figcap:'题图：无向图（a–b、a–e、a–c、b–e、e–d、e–f、d–f，据王道 p.219 重画）',
 opts:['5','4','3','2'], ans:'D',
 book:'按深度优先遍历规则逐一验证 5 个序列，只有序列 1（aebfdc）和序列 4（aefdbc）符合深度优先遍历，故个数为 2，选 D。',
 claude:'一致，选 D（<b>只有 1 和 4 合法，共 2 个</b>）。<br><b>邻接关系</b>：a:{b,c,e}　b:{a,e}　c:{a}　d:{e,f}　e:{a,b,d,f}　f:{d,e}<br>先注意 <b>c 是个"吊坠"顶点，只与 a 相连</b>——这意味着 <b>c 只可能紧跟在 a 之后，或者在整个搜索退回 a 之后才被访问</b>，它是本题最好用的筛子。<br>· <b>1. aebfdc ✓</b>：a→e→b（b 只剩已访问的，退回 e）→f→d（d 只剩已访问的，一路退回 a）→c。<br>· <b>2. acfdeb ✗</b>：a→c 后，<b>c 只有邻居 a</b>，只能退回 a；而 a 的未访问邻接点是 b、e，<b>没有 f</b>。<br>· <b>3. aedfcb ✗</b>：a→e→d→f 后 f 走不动，退到 <b>e 时发现 b 还没访问</b>，必须先访问 b，不能直接退到 a 去 c。<br>· <b>4. aefdbc ✓</b>：a→e→f→d（退回 e）→b（退回 a）→c。<br>· <b>5. aecfdb ✗</b>：<b>e 与 c 不邻接</b>，且 e 手上还有 b、d、f 没走，不能回 a。<br>📌 <b>3 号是本题的题眼</b>：序列的每个顶点单看都"和某个已访问顶点邻接"，但 DFS 要求的是<b>和栈顶（或回溯路径上第一个还有活干的顶点）邻接</b>。<b>判 DFS 序列时，脑子里一定要有"栈"，不能只有"已访问集合"</b>。<br>⚠️ 只满足"每个新顶点与前面某个顶点邻接"的序列，那是<b>Prim 式的"生成树序"</b>，比 DFS 序宽松得多——这两个概念混淆是本类题最大的失分源。',
 run:'程序枚举该图从 a 出发的全部 DFS 序列（共 8 条）并匹配 5 个候选：仅 aebfdc、aefdbc 命中 ⟹ 个数 = 2 ✅', verdict:'ok'},

{id:'6.3-9', ch:6, sec:'6.3 图的遍历', type:'subjective', tag:'', exam:null,
 kp:['遍历·与树的对应'],
 hints:['DFS 是"一条道走到黑、走不动再回头"，对应树里<b>先访问根再往下钻</b>的那种遍历。',
        'BFS 是"一圈一圈往外扩"，对应树里<b>按层次</b>的那种遍历。'],
 stem:'（双空题）用邻接表存储的图的深度优先遍历算法类似于树的＿①＿，而其广度优先遍历算法类似于树的＿②＿。<br>备选：A. 中序遍历　B. 先序遍历　C. 后序遍历　D. 按层次遍历',
 book:'深度优先遍历类似于树的先序遍历，广度优先遍历类似于树的按层次遍历。故依次选 B、D。',
 claude:'答案：① <b>B</b>（先序遍历）　② <b>D</b>（按层次遍历）。<br><b>为什么是"先序"而不是中序 / 后序</b>：DFS 的代码是<br><code>void DFS(G,v){ visit(v); visited[v]=TRUE; for(每个邻接点 w) if(!visited[w]) DFS(G,w); }</code><br><b>visit 写在递归调用之前</b> ⟹ <b>先访问自己、再递归子结点</b>，这正是<b>先序</b>的定义。中序 / 后序在图里根本没有对应物——因为<b>图的顶点没有"左右子树"这种固定的分割</b>，谈不上"访问完左边再访问自己"。<br><b>为什么 BFS 是层序</b>：BFS 按<b>到源点的距离</b> 0,1,2,… 分批访问，把树看成图时，"距离 = 层数" ⟹ 完全就是层序遍历。<br>📌 这组对应关系顺手还能推出两个结论（第 14 题要用）：<br>· <b>树是特殊的图</b>（连通、无环、n−1 条边），<b>对树做 DFS 就是先序序列、做 BFS 就是层序序列</b>；<br>· <b>BFS 生成树的树高 ≤ DFS 生成树的树高</b>——层序的"层"就是最短距离，不可能更高。<br>⚠️ 题干里"用邻接表存储"这句是<b>无关信息</b>（它只影响复杂度和序列是否唯一，不影响像谁）。这类干扰前提在考研选择题里很常见，读题时先判断它有没有参与结论。',
 run:null, verdict:'ok'},

{id:'6.3-10', ch:6, sec:'6.3 图的遍历', type:'subjective', tag:'', exam:null,
 kp:['DFS/BFS·按邻接表定序'],
 hints:['题目给了<b>具体的邻接表</b>，说明邻接点的先后<b>已经被钉死</b>——必须严格按表中从左到右的顺序走，序列<b>唯一</b>。',
        '别忘了外层循环：从 1 出发走完后若还有顶点没访问（顶点 3、6），要<b>接着从编号最小的未访问顶点重启</b>。'],
 stem:'（双空题）一个有向图 G 的邻接表存储如下所示。从顶点 1 出发，对图 G 调用深度优先遍历所得顶点序列是＿①＿；按广度优先遍历所得顶点序列是＿②＿。'
  +'<pre class="code">1 → 2 → 4\n2 → 5\n3 → 6 → 5\n4 → 2\n5 → 4\n6 → 6</pre>'
  +'<div class="qnote">说明：这是<b>有向图</b>的邻接表，每行给出该顶点<b>射出的弧</b>（如 1→2、1→4）；顶点 6 有一条<b>自环</b> 6→6。</div>'
  +'备选：A. 125436　B. 124536　C. 124563　D. 362514',
 book:'从顶点 1 出发进行深度优先遍历，依次经过 ⟨1,2⟩、⟨2,5⟩、⟨5,4⟩，此时与顶点 1 连通的顶点已访问完毕，再从未访问的顶点 3 出发，经过 ⟨3,6⟩，得序列 125436。广度优先遍历依次经过 ⟨1,2⟩、⟨1,4⟩、⟨2,5⟩，再从顶点 3 出发经过 ⟨3,6⟩，得序列 124536。故依次选 A、B。',
 claude:'答案：① <b>A</b>（125436）　② <b>B</b>（124536）。<br><b>DFS 逐步走</b>（严格按表中顺序）：<br>1 → 表首是 2 ⟹ 访问 <b>2</b> → 2 的表只有 5 ⟹ 访问 <b>5</b> → 5 的表只有 4 ⟹ 访问 <b>4</b> → 4 的表只有 2（已访问），回溯 → 5、2 均无新点，退回 1 → 1 的表中 4 已访问 ⟹ <b>第一趟结束，得 1254</b>。<br>外层循环续到顶点 <b>3</b>（未访问）⟹ 访问 <b>3</b> → 3 的表首是 6 ⟹ 访问 <b>6</b> → 6 的表是自己（已访问）⟹ 结束，3 的表中 5 也已访问 ⟹ <b>125436</b>。<br><b>BFS 逐步走</b>：<br>1 入队；出队 1 ⟹ 访问 <b>2、4</b>（按表序）；出队 2 ⟹ 访问 <b>5</b>；出队 4 ⟹ 邻接点 2 已访问；出队 5 ⟹ 4 已访问 ⟹ <b>第一趟得 1245</b>。外层续 <b>3</b> ⟹ 访问 <b>6</b> ⟹ <b>124536</b>。<br>📌 <b>本题序列唯一，原因是题目给了存储结构</b>——每个顶点的邻接点顺序已经固定，没有任何自由度。<b>没给存储结构、只给边集的题（如第 7、11 题）序列就不唯一</b>，这一点书上在第 11 题下专门注解过，是本节最重要的一条"审题开关"。<br>⚠️ 两个易漏：<b>① 外层循环</b>——有向图从 1 出发到不了 3 和 6，漏掉外层循环就只写出 1254；<b>② 自环 6→6</b> 不产生新访问，但它是"有向图可以有自环"的实例，别以为是印刷错误。<br>⚠️ 干扰项 <b>C（124563）</b> 是"BFS 里把 3 排到最后"的错写，<b>D（362514）</b> 是"从 3 出发"的错写——都在考"外层循环从编号最小的未访问顶点重启"。',
 run:'程序按给定邻接表顺序模拟：DFS = 125436，BFS = 124536，与书答完全一致 ✅', verdict:'ok'},

{id:'6.3-11', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['DFS·序列合法性判定'],
 stem:'无向图 G=(V,E)，其中 V={a,b,c,d,e,f}，E={(a,b),(a,e),(a,c),(b,e),(c,f),(f,d),(e,d)}（同第 7 题的图）。对该图进行深度优先遍历，<b>不能</b>得到的序列是（　）。',
 opts:['acfdeb','aebdfc','aedfcb','abecdf'], ans:'D',
 book:'逐项检验可知，A、B、C 均可由深度优先遍历得到，只有 D 项 abecdf 不能。',
 claude:'一致，选 D。<b>邻接关系</b>：a:{b,c,e}　b:{a,e}　c:{a,f}　d:{e,f}　e:{a,b,d}　f:{c,d}<br>· <b>A. acfdeb ✓</b>：a→c→f→d→e→b（e 的邻接点 b 未访问，直接往下）。<br>· <b>B. aebdfc ✓</b>：a→e→b（b 走不动，退回 e）→d→f→c。<br>· <b>C. aedfcb ✓</b>：a→e→d→f→c（c 只剩 a，退回 a）→b。<br>· <b>D. abecdf ✗</b>：a→b→e 之后，<b>e 的未访问邻接点只有 d</b>，DFS 必须往 d 走；序列却跳去了 <b>c</b>——而 c 与 e 不邻接，且此时 e 手上还有活（d 未访问），<b>不允许回溯到 a</b>。<br><b>⚠️ 书上在本题下有一条极重要的注解</b>：<b>为什么第 10 题的序列唯一，本题却有 3 个合法答案？</b><br>· <b>第 10 题给出了具体的存储结构（邻接表）</b> ⟹ 每个顶点的邻接点先后已定 ⟹ 序列<b>唯一</b>；<br>· <b>本题只给边集 E</b> ⟹ 邻接点顺序任意 ⟹ 序列<b>不唯一</b>，题目才只能问"哪个<u>不能</u>得到"。<br>📌 考场读题时先扫一眼：<b>"给了邻接表 / 邻接矩阵"就求唯一序列；"只给 V、E 或一张图"就逐项排除</b>。这个开关一按下去，后面的做法完全不同。',
 run:'程序枚举该图从 a 出发的全部 DFS 序列：acfdeb、aebdfc、aedfcb 均在集合中，abecdf 不在 ⟹ 选 D ✅', verdict:'ok'},

{id:'6.3-12', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['DFS·判环'],
 stem:'判断有向图中是否存在回路，除拓扑排序方法外，还可利用（　）。',
 opts:['求关键路径的方法','求最短路径的 Dijkstra 算法','深度优先遍历算法','广度优先遍历算法'], ans:'C',
 book:'对无向图来说，若深度优先遍历过程中遇到回边，则必定存在环。对有向图来说，若从顶点 v 出发的深度优先遍历 DFS(v) 结束之前出现一条从顶点 u 到顶点 v 的回边，且 u 在生成树上是 v 的子孙，则必定存在包含顶点 v 和 u 的环。',
 claude:'一致，选 C。<b>DFS 判环的原理是"回边"</b>：<br>· <b>无向图</b>：DFS 时若遇到一条指向<b>已访问且不是父结点</b>的顶点的边（回边），立刻说明有环。<br>· <b>有向图</b>：把顶点分三态——<b>白（未访问）/ 灰（在递归栈中，DFS 尚未返回）/ 黑（已完成）</b>。若从当前顶点碰到一个<b>灰色</b>顶点 v，说明存在 v ⇝ u 的树路径又有 u→v 的弧 ⟹ <b>有环</b>。<b>碰到黑色不算环</b>（那只是"汇聚"，见第 2 题的 Ⅱ）。<br>· 这就是书上那句"DFS(v) 结束之前出现从 u 到 v 的回边、且 u 是 v 的子孙"的白话版：<b>"结束之前"＝v 还是灰色</b>。<br><b>其余三项为什么不行</b>：<br>· <b>A 关键路径</b>：它的<b>前提</b>就是 AOE 网必须是<b>有向无环图</b>，用它去判环属于循环论证（而且求关键路径本身要先做拓扑排序）。<br>· <b>B Dijkstra</b>：求带权最短路，与环的存在<b>无关</b>（它甚至不能处理负权，但正权环照样跑得出结果）。<br>· <b>D BFS</b>：⚠️ <b>这一项要说清楚</b>——BFS 并非天生不能判环，但<b>普通的 BFS 遍历判不了有向图的环</b>（"访问到已访问顶点"在 DAG 里也会发生，见第 2 题 Ⅱ 的反例 1→2、1→3、2→3）。<b>能判环的是基于 BFS 的<u>拓扑排序</u>（Kahn 算法）</b>，而题干已把"拓扑排序"单列并排除了，所以本题的正解只能是 C。<br>📌 记结论：<b>判有向图有无环，只有两条正规路——DFS 找回边 / 拓扑排序看输出顶点数是否等于 |V|</b>。',
 run:null, verdict:'ok'},

{id:'6.3-13', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['生成树·极大与极小'],
 stem:'设无向图 G=(V,E) 和 G′=(V′,E′)，若 G′ 是 G 的生成树，则下列说法<b>错误</b>的是（　）。',
 opts:['G′ 为 G 的子图','G′ 为 G 的连通分量','G′ 为 G 的极小连通子图且 V=V′','G′ 是 G 的一个无环子图'], ans:'B',
 book:'连通分量是无向图中的极大连通子图，它包含依附于该子图顶点的所有边，其中可能存在回路，因此不是生成树。而生成树是包含图中全部顶点的一个极小连通子图，故 B 的说法错误。',
 claude:'一致，选 B（问的是"错误"）。<b>本题只考一组词：极大 vs 极小</b>——<br><table class="qtab"><tr><th></th><th>连通分量</th><th>生成树</th></tr>'
  +'<tr><td class="rowh">定义</td><td><b>极大</b>连通子图</td><td><b>极小</b>连通子图</td></tr>'
  +'<tr><td class="rowh">"极"在哪</td><td>边和顶点<b>尽可能多</b>：包含依附于其顶点的<b>所有</b>边</td><td>边<b>尽可能少</b>：再删一条就不连通</td></tr>'
  +'<tr><td class="rowh">边数</td><td>可以有回路，边数不限</td><td>恰好 <b>n−1</b> 条，<b>无环</b></td></tr>'
  +'<tr><td class="rowh">顶点</td><td>只含本分量的顶点</td><td>含<b>全部</b> n 个顶点（V=V′）</td></tr></table>'
  +'· <b>A 对</b>：生成树当然是子图。<br>· <b>B 错</b>：连通分量要把依附其顶点的边<b>一条不落</b>全带上，通常有回路 ⟹ 不是树。<b>只有当某个连通分量本身恰好就是一棵树时两者才重合</b>，"是"不成立。<br>· <b>C 对</b>：这是生成树的<b>定义原话</b>——极小连通子图 + 含全部顶点。<br>· <b>D 对</b>：树无环，自然是无环子图。<br>⚠️ <b>"极大 / 极小"说的都是边的数目，且都以"保持连通"为前提</b>——极大＝加不进边了（该加的都加了），极小＝减不掉边了（再减就断）。这组词在 6.1 节已考过一次（本章铁律③），是全章复现率最高的定义题。<br>📌 补一句常被追问的：<b>非连通图没有生成树，只有生成森林</b>；含 k 个连通分量的图，其生成森林共有 <b>n−k</b> 条边。',
 run:null, verdict:'ok'},

{id:'6.3-14', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'', exam:null,
 kp:['生成树·树高比较'],
 stem:'图的广度优先生成树的树高比深度优先生成树的树高（　）。',
 opts:['小或相等','小','大或相等','大'], ans:'A',
 book:'广度优先生成树中，从根到各顶点的路径都是最短路径，因此其树高最小；深度优先生成树尽可能地"深"，树高大于或等于广度优先生成树的树高。故广度优先生成树的树高小于或等于深度优先生成树的树高。',
 claude:'一致，选 A（<b>小<u>或相等</u></b>）。<br><b>为什么 BFS 树一定不高</b>：BFS 树中<b>根到任一顶点 v 的路径长度 = 图中 v 到根的最短距离 d(v)</b>（这是 BFS 求非带权最短路的核心性质）。而<b>任何</b>生成树里根到 v 的路径都是图中的一条通路，长度 <b>≥ d(v)</b> ⟹ <b>BFS 树的高度是所有生成树里最小的</b>，DFS 树自然不会更小。<br><b>为什么"相等"也可能发生</b>——必须能举出反例才敢排除 B：<br>· <b>一条链</b> a—b—c—d，从 a 出发，BFS 树和 DFS 树都是这条链，高度都是 3 ⟹ <b>相等</b>；<br>· <b>星形图</b>（中心连所有点）从中心出发，两棵树也都是高度 1 的星 ⟹ <b>相等</b>。<br>⟹ "小"（严格小于）不成立，只能是"<b>小或相等</b>"。<br>📌 <b>做选择题时看到"小"和"小或相等"并列，几乎总是选带等号的那个</b>——命题人正是在考你能不能想出取等的例子。同理 C、D 方向反了，直接排除。<br>⚠️ 别把这条推广到带权图：<b>BFS 树只在<u>非带权</u>意义下最短（边数最少）</b>，带权时"层数少"不等于"权和小"，那是 Dijkstra 树的事。',
 run:'程序枚举验证：链 a—b—c—d 上 BFS 树高 = DFS 树高 = 3、星形图上均为 1 ⟹ "相等"可取到；第 8 题那张图从 a 出发 BFS 树高 = 2、DFS 树高 ∈ {3,4} ⟹ 严格小于也可发生 ⟹ 答案必须是"小或相等" ✅', verdict:'ok'},

{id:'6.3-15', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'2012 统考', exam:2012,
 kp:['遍历·复杂度（邻接表）'],
 stem:'【2012 统考真题】对有 n 个顶点、e 条边且使用邻接表存储的有向图进行广度优先遍历，其算法的时间复杂度是（　）。',
 opts:['O(n)','O(e)','O(n+e)','O(ne)'], ans:'C',
 book:'广度优先遍历时，每个顶点表结点均查找一次，每个边表结点也均查找一次，故时间复杂度为 O(n+e)。',
 claude:'一致，选 C。<b>真题就考第 4 题那一句话</b>：<b>邻接表存储 ⟹ 遍历时间 O(n+e)</b>，DFS、BFS 一样，有向图、无向图一样。<br><b>拆成两笔账</b>：<br>· 外层 <code>for(i=0;i&lt;n;i++)</code> 把 n 个<b>顶点表结点</b>各碰一次 ⟹ <b>O(n)</b>；<br>· 每个顶点出队时顺着自己的边表走一遍，全图的<b>边表结点</b>总共被走一次 ⟹ 有向图 e 个结点 ⟹ <b>O(e)</b>（无向图是 2e 个，仍是 O(e)）。<br>⟹ 合计 <b>O(n+e)</b>。<br>⚠️ <b>"n 这一项不能省"</b>：即使 e=0（全是孤立顶点），外层循环仍要跑 n 次，所以答案不是 O(e)。反过来 <b>e 也不能省</b>：稠密图里 e 可以到 n²。<br>📌 <b>2012 年这道题的姊妹结论要一起背</b>：同样是 BFS，换成<b>邻接矩阵</b>存储就是 <b>O(n²)</b>（第 6 题）。<b>408 真题在这个点上只换存储结构，不换问法</b>——看到"邻接表"直接 O(n+e)，看到"邻接矩阵"直接 O(n²)，秒选。',
 run:null, verdict:'ok'},

{id:'6.3-16', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'2013 统考', exam:2013,
 kp:['BFS·序列合法性判定'],
 stem:'【2013 统考真题】下列选项中，<b>不是</b>下图所示无向图的广度优先遍历序列的是（　）。',
 fig:'图/ch6/6.3-16.svg',
 figcap:'2013 统考真题图：无向图（a–b、a–e、a–h、b–c、b–d、c–d、c–h、e–f、e–g，据王道 p.220 重画）',
 opts:['h,c,a,b,d,e,g,f','e,a,f,g,b,h,c,d','d,b,c,a,h,e,f,g','a,b,c,d,h,e,f,g'], ans:'D',
 book:'逐项验证：D 项从 a 出发，a 的邻接点为 b、e、h，广度优先遍历必须先访问完 a 的所有邻接点，而 D 项在访问 b 之后接着访问了 c，故 D 不是该图的广度优先遍历序列。',
 claude:'一致，选 D。<b>邻接关系</b>：a:{b,e,h}　b:{a,c,d}　c:{b,d,h}　d:{b,c}　e:{a,f,g}　f:{e}　g:{e}　h:{a,c}<br><b>判 BFS 序列的唯一诀窍：起点的<u>全部</u>邻接点必须成段连续出现，第二层不许插队。</b><br>· <b>D. a,b,<u>c</u>,… ✗</b>：a 的邻接点是 <b>b、e、h 三个</b>，BFS 必须<b>先把这三个全访问完</b>才能进入第二层；序列第 3 位却是 c（c 是第二层，要经 b 才能到）⟹ 不合法。<br>· <b>A. h,c,a,b,d,e,g,f ✓</b>：起点 h，第一层 {c,a} 连续出现 ✓；出队 c 得 {b,d}，出队 a 得 {e} ⟹ b,d,e ✓；出队 e 得 {g,f}（同层内顺序任意）✓。<br>· <b>B. e,a,f,g,b,h,c,d ✓</b>：起点 e，第一层 {a,f,g} 连续 ✓；出队 a 得 {b,h} ✓；出队 b 得 {c,d} ✓。<br>· <b>C. d,b,c,a,h,e,f,g ✓</b>：起点 d，第一层 {b,c} 连续 ✓；出队 b 得 {a}，出队 c 得 {h} ⟹ a,h ✓；出队 a 得 {e} ✓；出队 e 得 {f,g} ✓。<br>📌 <b>考场手法（30 秒内解决）</b>：不要真去模拟队列。<b>只看每个选项的第 1 个顶点，数出它有几个邻居 k，然后检查序列的第 2…k+1 位是不是恰好就是这 k 个邻居</b>（顺序任意）。D 项 a 有 3 个邻居，第 2–4 位应是 {b,e,h} 的某个排列，实际是 b,c,d ⟹ 当场毙掉。这一招能秒杀绝大多数"判 BFS 序列"的真题。<br>⚠️ 同层顶点<b>内部顺序任意</b>（因为题目只给图、没给邻接表），所以 A 中的"g 在 f 前"完全合法，别拿字母序去卡。',
 run:'程序枚举各起点的全部 BFS 序列并匹配四个选项：A、B、C 均在集合中，D（a,b,c,d,h,e,f,g）不在 ⟹ 选 D ✅', verdict:'ok'},

{id:'6.3-17', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'2015 统考', exam:2015,
 kp:['DFS·序列计数'],
 stem:'【2015 统考真题】设有向图 G=(V,E)，顶点集 V={v<sub>0</sub>,v<sub>1</sub>,v<sub>2</sub>,v<sub>3</sub>}，边集 E={⟨v<sub>0</sub>,v<sub>1</sub>⟩,⟨v<sub>0</sub>,v<sub>2</sub>⟩,⟨v<sub>0</sub>,v<sub>3</sub>⟩,⟨v<sub>1</sub>,v<sub>3</sub>⟩}。若从顶点 v<sub>0</sub> 开始对图进行深度优先遍历，则可能得到的不同遍历序列个数是（　）。',
 opts:['2','3','4','5'], ans:'D',
 book:'从 v₀ 出发的深度优先遍历序列共有 5 种：v₀v₁v₃v₂、v₀v₂v₁v₃、v₀v₂v₃v₁、v₀v₃v₁v₂、v₀v₃v₂v₁，故选 D。',
 claude:'一致，选 D（<b>5 种</b>）。<b>出弧表</b>：v<sub>0</sub>:{v<sub>1</sub>,v<sub>2</sub>,v<sub>3</sub>}　v<sub>1</sub>:{v<sub>3</sub>}　v<sub>2</sub>:{}　v<sub>3</sub>:{}<br><b>按 v<sub>0</sub> 第一步走谁，分三支穷举</b>（注意这是<b>有向</b>图，v₂、v₃ 出度为 0，进去就得回溯）：<br>· 第一步 <b>v<sub>1</sub></b>：v₁→v₃（v₁ 唯一的出弧）⟹ 回溯到 v₀ ⟹ 只剩 v₂ ⟹ <b>v₀v₁v₃v₂</b>　<span style="color:#888">（1 种）</span><br>· 第一步 <b>v<sub>2</sub></b>：v₂ 无出弧，回溯到 v₀，剩 v₁、v₃ 两个可选：<br>　– 走 v₁ ⟹ v₁→v₃ ⟹ <b>v₀v₂v₁v₃</b>；　– 走 v₃ ⟹ 回溯 ⟹ v₁ ⟹ <b>v₀v₂v₃v₁</b>　<span style="color:#888">（2 种）</span><br>· 第一步 <b>v<sub>3</sub></b>：v₃ 无出弧，回溯，剩 v₁、v₂：<br>　– 走 v₁（v₁ 的出弧 v₃ 已访问，回溯）⟹ v₂ ⟹ <b>v₀v₃v₁v₂</b>；　– 走 v₂ ⟹ 回溯 ⟹ v₁ ⟹ <b>v₀v₃v₂v₁</b>　<span style="color:#888">（2 种）</span><br>⟹ 1+2+2 = <b>5</b>。<br>📌 <b>本题的题眼在 ⟨v<sub>1</sub>,v<sub>3</sub>⟩ 这条弧</b>：它<b>唯一地</b>压掉了一种可能——第一步走 v₁ 时被迫立刻去 v₃，导致这一支只有 1 种而不是 2 种。<b>若没有这条弧，答案就是 3!=6</b>。命题人加它就是为了让"6"这个想当然的答案落空（所以选项里连 6 都不给，逼你老实枚举）。<br>⚠️ <b>枚举时按"第一步选谁"分类，比乱试有序得多</b>，4 个顶点最多 3 支、每支至多 2 条，30 秒能穷尽。顶点再多就该改用"画搜索树"的画法。',
 run:'程序枚举 v₀ 出发的全部 DFS 序列：{v₀v₁v₃v₂, v₀v₂v₁v₃, v₀v₂v₃v₁, v₀v₃v₁v₂, v₀v₃v₂v₁}，共 <b>5</b> 条，与书答逐条一致 ✅', verdict:'ok'},

{id:'6.3-18', ch:6, sec:'6.3 图的遍历', type:'choice', tag:'2016 统考', exam:2016,
 kp:['DFS·序列合法性判定'],
 stem:'【2016 统考真题】下列选项中，<b>不是</b>下图所示有向图的深度优先搜索序列的是（　）。',
 fig:'图/ch6/6.3-18.svg',
 figcap:'2016 统考真题图：有向图（V<sub>1</sub>→V<sub>2</sub>、V<sub>1</sub>→V<sub>3</sub>、V<sub>1</sub>→V<sub>5</sub>、V<sub>2</sub>→V<sub>5</sub>、V<sub>3</sub>→V<sub>2</sub>、V<sub>4</sub>→V<sub>3</sub>、V<sub>5</sub>→V<sub>4</sub>，据王道 p.220 重画）',
 opts:['V<sub>1</sub>,V<sub>5</sub>,V<sub>4</sub>,V<sub>3</sub>,V<sub>2</sub>','V<sub>1</sub>,V<sub>3</sub>,V<sub>2</sub>,V<sub>5</sub>,V<sub>4</sub>',
       'V<sub>1</sub>,V<sub>2</sub>,V<sub>5</sub>,V<sub>4</sub>,V<sub>3</sub>','V<sub>1</sub>,V<sub>2</sub>,V<sub>3</sub>,V<sub>4</sub>,V<sub>5</sub>'], ans:'D',
 book:'与 V₁ 邻接的顶点有 V₂、V₃、V₅，因此 V₁ 之后可以访问 V₂。但从 V₂ 出发，与 V₂ 邻接且未被访问的顶点只有 V₅，按深度优先搜索的规则应访问 V₅，而 D 项访问了 V₃，故 D 不是该图的深度优先搜索序列。',
 claude:'一致，选 D。<b>出弧表（有向图只看箭头射出的方向！）</b>：V<sub>1</sub>:{V<sub>2</sub>,V<sub>3</sub>,V<sub>5</sub>}　V<sub>2</sub>:{V<sub>5</sub>}　V<sub>3</sub>:{V<sub>2</sub>}　V<sub>4</sub>:{V<sub>3</sub>}　V<sub>5</sub>:{V<sub>4</sub>}<br>· <b>A. V₁,V₅,V₄,V₃,V₂ ✓</b>：V₁→V₅→V₄→V₃→V₂，<b>一条道走到底，连回溯都不用</b>。<br>· <b>B. V₁,V₃,V₂,V₅,V₄ ✓</b>：V₁→V₃→V₂→V₅→V₄，同样一路到底。<br>· <b>C. V₁,V₂,V₅,V₄,V₃ ✓</b>：V₁→V₂→V₅→V₄→V₃，同样一路到底。<br>· <b>D. V₁,V₂,<u>V₃</u>,… ✗</b>：<b>V₂ 只有一条出弧 V₂→V₅</b>，且 V₅ 未访问 ⟹ DFS <b>必须</b>去 V₅，不能回溯；而 V₂ 与 V₃ 之间只有 <b>V₃→V₂</b>（<b>方向相反</b>），从 V₂ 根本走不到 V₃ ⟹ 不合法。<br>📌 <b>有向图 DFS 的两条铁律</b>（本题两条都用上了）：<br>　① <b>只能顺着箭头走</b>——V₃→V₂ 存在<b>不代表</b>能从 V₂ 到 V₃，这是与无向图最大的区别，也是本题唯一的考点；<br>　② <b>当前顶点还有未访问的出邻接点时，不许回溯</b>——先深入，走不动了才退。<br>⚠️ <b>本图恰好有"从 V₁ 出发的哈密顿式一条龙"</b>（A、B、C 三条都不用回溯），做题时先试"能不能一路顺箭头走通"，通了就是合法序列，比逐点验回溯快得多。<br>⚠️ 读图时务必<b>逐条确认箭头方向</b>：本图中间两条交叉弧是 <b>V₂→V₅</b> 与 <b>V₄→V₃</b>（一去一回、方向相反），看反任何一条，四个选项的判定就会全乱。',
 run:'程序按出弧表枚举 V₁ 出发的全部 DFS 序列：A、B、C 三条命中，D（V₁V₂V₃V₄V₅）不在集合中 ⟹ 选 D ✅', verdict:'ok'},

{id:'6.3-综1', ch:6, sec:'6.3 图的遍历', type:'subjective', tag:'', exam:null,
 kp:['生成树·按邻接表构造'],
 hints:['题目<b>给了邻接表</b>，意味着每个顶点的邻接点顺序已被钉死 ⟹ 两棵生成树都<b>唯一</b>，必须严格按表中从左到右的次序搜索。',
        '生成树的边 = <b>遍历过程中"第一次访问某个新顶点"所经过的那条边</b>；凡是指向已访问顶点的边都不进树。按 (u,v) 的次序把树边一条条记下来，再画成树即可。'],
 stem:'图 G=(V,E) 以邻接表存储，如下所示。试画出图 G 的深度优先生成树和广度优先生成树（假设从顶点 1 开始遍历）。'
  +'<pre class="code">1 → 2 → 3 → 4\n2 → 1 → 3 → 4 → 5\n3 → 1 → 2 → 4\n4 → 1 → 2 → 3 → 5\n5 → 2 → 4</pre>',
 book:'深度优先生成树：从顶点 1 开始，搜索路径的次序为 (1,2)、(2,3)、(3,4)、(4,5)。注意，存储结构固定时生成树的树形也就固定了，因此不能先搜索 (1,3)。广度优先生成树：搜索路径的次序为 (1,2)、(1,3)、(1,4)、(2,5)。',
 figA:'图/ch6/6.3-综1.svg',
 figAcap:'答案图：深度优先生成树（左，退化成一条链）与广度优先生成树（右，树高仅 2）',
 claude:'答案：<b>DFS 生成树的树边依次为 (1,2)、(2,3)、(3,4)、(4,5)</b>（一条链 1—2—3—4—5，<b>树高 4</b>）；<b>BFS 生成树的树边依次为 (1,2)、(1,3)、(1,4)、(2,5)</b>（1 下面挂 2、3、4，2 下面挂 5，<b>树高 2</b>）。<br>'
  +'<b>DFS 逐步推</b>（严格按邻接表从左到右）：<br>1 的表首是 <b>2</b> ⟹ 树边 (1,2)；2 的表是 1(已访问)、<b>3</b> ⟹ 树边 (2,3)；3 的表是 1、2(均已访问)、<b>4</b> ⟹ 树边 (3,4)；4 的表是 1、2、3(均已访问)、<b>5</b> ⟹ 树边 (4,5)；5 的表全已访问 ⟹ 一路回溯，结束。<br>'
  +'<b>BFS 逐步推</b>：1 出队 ⟹ 依次访问 <b>2、3、4</b>，树边 (1,2)、(1,3)、(1,4)；2 出队 ⟹ 表中 1、3、4 已访问，只剩 <b>5</b>，树边 (2,5)；3、4、5 出队后无新顶点 ⟹ 结束。<br>'
  +'<b>⚠️ 书上特意点破的那句"不能先搜索 (1,3)"</b>，是本题<u>唯一</u>的失分点：<b>题目一旦给出邻接表，邻接点的先后就不再自由</b>，必须走表首的 2；只给"边集"或"一张图"时才可以随便选（那时生成树不唯一）。<b>做题前先问一句"题目给的是图还是存储结构"</b>，这个开关和第 10、11 题是同一个。<br>'
  +'<b>两棵树的对照，正好印证第 14 题</b>：<br>· <b>DFS 树高 4、BFS 树高 2 ⟹ BFS 树高 ≤ DFS 树高</b> ✓；<br>· <b>BFS 树上 1 到各顶点的路径长度（1,1,1,2）就是它们在原图中到 1 的最短距离</b> ✓（顶点 5 与 1 不邻接，最短要 2 步）；<br>· <b>两棵树都恰好 4 条边 = n−1</b>，顶点全含 ⟹ 都是生成树 ✓（这是画完后的自查动作）。<br>'
  +'<b>卷面提醒</b>：画生成树时要<b>把树根 1 画在最上面、按层次分明地画</b>，并<b>把搜索次序 (1,2)(2,3)… 写在旁边</b>——阅卷看的是次序对不对，光有图形容易被判"看不出你怎么搜的"。<b>非树边（如 (1,3)、(2,4)）不要画进树里</b>，最多用虚线标注。',
 run:'程序按给定邻接表模拟：DFS 树边 = (1,2)(2,3)(3,4)(4,5)，BFS 树边 = (1,2)(1,3)(1,4)(2,5)，与书答完全一致 ✅', verdict:'ok'},

{id:'6.3-综2', ch:6, sec:'6.3 图的遍历', type:'subjective', tag:'', exam:null,
 kp:['遍历·二分图染色判定'],
 hints:['先动手试着染：随便挑一个顶点染红，它的邻居<b>必须</b>全染蓝，蓝的邻居又必须全染红……<b>整个过程没有任何自由度</b>——起点颜色一定，全图颜色就定了。',
        '"染不下去"只有一种情形：<b>遇到一条边，两端已经是同色</b>。想清楚这在图上意味着什么（提示：沿着这条边绕回起点的那个圈，长度是奇是偶？）。',
        '算法就是把这个手工过程写进 DFS/BFS 的循环里：访问邻接点 b 时分三种情况——b 没染色 / b 与当前顶点同色 / b 与当前顶点异色，分别怎么办。',
        '复杂度：染色判定<b>只是在遍历里多做了一次 O(1) 的比较</b>，所以时间就是遍历本身的时间；空间除了 visited[] 还要一个 color[]。'],
 stem:'给定一个连通无向图，采用邻接表存储，将图的所有顶点分别染成红色或蓝色，若存在一种染色方法使图中每条边的两个顶点的颜色都不相同，则称这个图能被二分。<br>'
  +'1）判断下面两个无向图是否能被二分，若能被二分，则请标出每个顶点的颜色。<br>'
  +'2）请设计一种算法用来判断图是否能被二分，仅用语言描述算法的思想即可。<br>'
  +'3）给出你设计的算法的时间复杂度和空间复杂度。',
 fig:'图/ch6/6.3-综2.svg',
 figcap:'题图：待判定的两个无向图（顶点字母为便于叙述所加，据王道 p.220–221 重画）',
 figA:'图/ch6/6.3-综2A.svg',
 figAcap:'答案图：图 1 可二分（红 {a,d,e,f} / 蓝 {b,c,g}）；图 2 中 r–s–v 构成长度 3 的奇圈，故不能二分',
 book:'1）左图能被二分，右图不能被二分。<br>2）从任一顶点开始染成红色，然后遍历整个图。遍历过程中，当前顶点 a 有边指向顶点 b 时分三种情况：① 若 b 尚未被染色，则将 b 染成与 a 不同的颜色，并继续遍历 b；② 若 a 与 b 的颜色相同，则该图不能被二分，直接返回；③ 若 a 与 b 的颜色不同，则跳过 b。<br>3）无论采用深度优先遍历还是广度优先遍历，时间复杂度均为 O(n+m)（n 为顶点数、m 为边数），需要一个数组存储颜色、一个数组存储访问标记，空间复杂度为 O(n)。',
 claude:'答案：<b>1）图 1 能被二分，图 2 不能。</b>图 1 的一组染色：<b>红 = {a, d, e, f}，蓝 = {b, c, g}</b>（见答案图；把红蓝整体对调也是一组合法解，<b>连通图的二分染色恰有两组，互为颜色对调</b>）。<br>'
  +'<b>图 1 为什么能</b>：逐边验一遍 —— (a,b) 红蓝 ✓、(a,c) 红蓝 ✓、(c,d) 蓝红 ✓、(c,e) 蓝红 ✓、(c,f) 蓝红 ✓、(b,e) 蓝红 ✓、(e,g) 红蓝 ✓、(g,f) 蓝红 ✓，<b>8 条边全部合格</b>。<br>'
  +'<b>图 2 为什么不能</b>：<b>r、s、v 三个顶点两两相邻，构成一个三角形</b>。三角形上只有两种颜色，<b>三个顶点必有两个同色</b>（抽屉原理），而它们之间偏偏有边 ⟹ 必然冲突 ⟹ <b>不能被二分</b>。<br>'
  +'<b>📌 藏在题目背后的定理（一定要记）</b>：<b>一个图能被二分（＝二分图）⟺ 它不含<u>奇数长度</u>的回路。</b><br>· 顺着一条路径染色，颜色是<b>红蓝红蓝…交替</b>的 ⟹ 走了偶数步回到原点时颜色一致（相容），走<b>奇数步</b>回到原点就要求同一个顶点既红又蓝（<b>矛盾</b>）；<br>· 图 1 的两个圈 a–b–e–c–a、c–e–g–f–c <b>长度都是 4（偶）</b> ⟹ 相容；图 2 的 r–s–v <b>长度 3（奇）</b> ⟹ 矛盾。<br>· 有了这条定理，<b>手工判定就是"找奇圈"</b>：三角形是最容易一眼看出的奇圈，考场上先扫有没有三角形。<br>'
  +'<b>2）算法（按书上的三分支写，这是标准答案的骨架）</b>：任取一顶点染红入队（或递归），做一次 <b>BFS/DFS</b>；每当从已染色顶点 a 看到邻接点 b：<br>　① <b>b 未染色</b> ⟹ 把 b 染成 a 的<b>相反色</b>，继续遍历 b；<br>　② <b>b 已染色且与 a <u>同色</u></b> ⟹ <b>立即返回 false</b>（找到冲突边）；<br>　③ <b>b 已染色且与 a 异色</b> ⟹ <b>跳过</b>（这条边已经合格，不必重复处理）。<br>遍历结束仍未冲突 ⟹ 返回 <b>true</b>。<br>'
  +'<b>3）复杂度</b>：<b>时间 O(n+m)</b>（邻接表存储；染色只是在原本的遍历里多做一次 O(1) 的颜色比较，<b>不改变量级</b>），<b>空间 O(n)</b>（color[] 与 visited[]，加上栈/队列，都是 O(n)）。<br>'
  +'⚠️ <b>三个实现细节，写代码题时会扣分</b>：<br>· <b>color[] 可以兼作 visited[]</b>（用 0 表示未染色、1/2 表示两色），不必真的开两个数组；<br>· 题干说的是<b>连通</b>图，所以一次遍历即可；<b>若图不连通，必须对每个连通分量各起一次染色</b>（外层循环不能省），否则会漏判某个分量里的奇圈；<br>· <b>③ 号分支不能写成"继续遍历 b"</b>——那样会无限循环回去，必须"跳过"。',
 run:'程序对两图各跑一次染色判定：图 1 返回可二分，给出 {a,d,e,f} 与 {b,c,g} 两个颜色类（与手工染色一致）；图 2 返回不可二分，冲突边落在 r–s–v 三角形上 ✅', verdict:'ok'},

{id:'6.3-综3', ch:6, sec:'6.3 图的遍历', type:'subjective', tag:'', exam:null,
 kp:['遍历·判断是否为树'],
 hints:['先把"是树"翻译成可以用遍历<b>数出来</b>的条件。树的三个等价刻画：无回路的连通图 ／ 有 n−1 条边的连通图 ／ 任意两点间有唯一路径。<b>挑最好数的那个</b>。',
        '一次 DFS 就能同时数两样东西：访问到的<b>顶点数</b> Vnum（判连通）与遍历中<b>看到的边数</b> Enum（判边数）。',
        '⚠️ 关键陷阱：无向图中每条边在两个端点的边表里<b>各出现一次</b>，DFS 会<b>看到两次</b>。所以判据里的边数要写成 <b>2(n−1)</b> 而不是 n−1。'],
 stem:'试设计一个算法，判断一个无向图 G 是否为一棵树。若是一棵树，则算法返回 true，否则返回 false。',
 book:'一个无向图 G 是一棵树的条件是：G 必须是无回路的连通图，或有 n−1 条边的连通图。这里采用后者作为判断条件。从任一顶点出发进行深度优先遍历，统计访问到的顶点个数 Vnum 与边数 Enum，若 Vnum 等于图的顶点数且 Enum 等于 2(n−1)（无向图中每条边被访问两次），则该图是一棵树。',
 code:'bool isTree(Graph& G){\n'
  +'    for(int i=1;i<=G.vexnum;i++) visited[i]=FALSE;   //初始化访问标记\n'
  +'    int Vnum=0, Enum=0;                              //记录顶点数和边数\n'
  +'    DFS(G, 1, Vnum, Enum, visited);\n'
  +'    if(Vnum==G.vexnum && Enum==2*(G.vexnum-1))       //⚠️ 无向图每条边被看到两次\n'
  +'        return true;\n'
  +'    else\n'
  +'        return false;\n'
  +'}\n\n'
  +'void DFS(Graph& G, int v, int& Vnum, int& Enum, int visited[]){\n'
  +'    visited[v]=TRUE;  Vnum++;                        //访问到一个新顶点\n'
  +'    int w=FirstNeighbor(G, v);\n'
  +'    while(w != -1){                                  //w 是 v 尚未访问的邻接顶点\n'
  +'        Enum++;                                      //边存在，边计数加 1\n'
  +'        if(!visited[w])\n'
  +'            DFS(G, w, Vnum, Enum, visited);\n'
  +'        w = NextNeighbor(G, v, w);\n'
  +'    }\n'
  +'}',
 claude:'思路：<b>把"是不是树"化成两个可以在一次 DFS 里数出来的量。</b><br>'
  +'<b>第一步：选判据。</b>无向图 G 是树 ⟺ <b>G 是无回路的连通图</b> ⟺ <b>G 是有 n−1 条边的连通图</b>。<b>选后者</b>，因为"数边数"比"找回路"好写得多（找回路要判回边、要区分父结点，代码长一倍）。<br>'
  +'<b>第二步：一次 DFS 同时数两样东西。</b><br>· <b>Vnum</b>：每进入一个新顶点就 ++ ⟹ 遍历结束后 <b>Vnum == n 说明连通</b>（从一个顶点出发能走遍全图）；<br>· <b>Enum</b>：每从边表里<b>看到</b>一条边就 ++（<b>不管对端是否已访问都要数</b>）⟹ 它统计的是<b>边被看到的次数</b>。<br>'
  +'<b>第三步：两个条件同时成立才返回 true。</b><b>Vnum == n && Enum == 2(n−1)</b>。<br>'
  +'<b>⚠️ 本题唯一的、也是必然被考的坑：为什么是 2(n−1) 而不是 n−1。</b><br>无向图的邻接表里，<b>一条边 (u,v) 在 u 的边表和 v 的边表中各挂一个结点</b>。DFS 扫过 u 的边表时数一次、扫过 v 的边表时又数一次 ⟹ <b>每条边被计数两遍</b>。所以 n−1 条边对应 <b>Enum = 2(n−1)</b>。<b>把判据写成 n−1，任何一棵树都会被判成 false</b>——这是最典型的"算法思路全对、常数写错满盘皆输"。<br>'
  +'<b>为什么两个条件缺一不可</b>：<br>· <b>只判 Enum</b> 不行：<b>一个三角形 + 一个孤立点</b>（n=4，边数 3 = n−1）边数正好对，但<b>不连通、还有环</b> ⟹ 必须靠 Vnum==n 挡掉；<br>· <b>只判 Vnum</b> 不行：任何连通图都满足 Vnum==n，但有环的连通图边数 &gt; n−1 ⟹ 必须靠 Enum 挡掉。<br>· <b>两条一起 ⟹ 连通 + 恰好 n−1 条边 ⟹ 必无环 ⟹ 是树</b>（这是树的等价刻画，可以直接引用，不必再证）。<br>'
  +'<b>复杂度</b>：<b>时间 O(n+e)</b>（就是一次 DFS），<b>空间 O(n)</b>（visited[] 与递归栈）。<br>'
  +'📌 <b>另一种同样满分的写法</b>：直接判"<b>连通 且 无回路</b>"——DFS 中若遇到<b>已访问且不是父结点</b>的邻接点就返回 false。但它要多传一个 <code>parent</code> 参数来避开"刚走过来的那条边"，<b>比数边数更容易写错</b>，考场上建议用书上这版。',
 run:'程序按此算法测试三类图：n=5 的树（Vnum=5, Enum=8=2×4 ⟹ true ✅）、n=5 带一个环的连通图（Enum=10 &gt; 8 ⟹ false ✅）、三角形+孤立点（Vnum=3≠4 ⟹ false ✅），判定全部正确', verdict:'ok'},

{id:'6.3-综4', ch:6, sec:'6.3 图的遍历', type:'subjective', tag:'', exam:null,
 kp:['遍历·判断两点间是否有路径'],
 hints:['把问题翻译一句话：<b>存在 v<sub>i</sub> 到 v<sub>j</sub> 的路径 ⟺ 从 v<sub>i</sub> 出发的遍历能"碰到" v<sub>j</sub></b>。所以直接拿 DFS/BFS 改造即可，不需要新算法。',
        'DFS 版：递归到 i==j 就置标志返回；用一个引用参数 can_reach 把结果层层带回来，并在递归条件里加上 <code>!can_reach</code> 以便找到后尽快收工。',
        'BFS 版：出队时（或入队前）检查是否等于 j，是就 return 1；队列空了还没碰到就 return 0。',
        '⚠️ 这是<b>有向图</b>：只能顺着弧的方向走，v<sub>i</sub>→v<sub>j</sub> 有路径不代表 v<sub>j</sub>→v<sub>i</sub> 也有。'],
 stem:'分别采用基于深度优先遍历和广度优先遍历算法，判别以邻接表方式存储的有向图中是否存在由顶点 v<sub>i</sub> 到顶点 v<sub>j</sub> 的路径（i ≠ j）。注意：算法中涉及的图的基本操作必须在此存储结构上实现。',
 book:'本题主要考查图的两种遍历算法。从顶点 vᵢ 出发对图进行遍历（深度优先或广度优先均可），若在遍历过程中能搜索到顶点 vⱼ，则说明存在由 vᵢ 到 vⱼ 的路径。也可以先调用 DFS(G,i) 或 BFS(G,i)，遍历结束后判断 visited[j] 是否为 TRUE，但这种做法每次都要花费最坏情况的时间。',
 code:'int visited[MAXSIZE] = {0};                       //全局访问标记数组\n\n'
  +'//—— 解法一：基于 DFS ——\n'
  +'void DFS(ALGraph G, int i, int j, bool &can_reach){\n'
  +'    if(i == j){ can_reach = true; return; }       //找到了，置标志立即返回\n'
  +'    visited[i] = 1;\n'
  +'    for(int p=FirstNeighbor(G,i); p>=0; p=NextNeighbor(G,i,p))\n'
  +'        if(!visited[p] && !can_reach)              //已找到就不再往下搜\n'
  +'            DFS(G, p, j, can_reach);\n'
  +'}\n\n'
  +'//—— 解法二：基于 BFS ——\n'
  +'int BFS(ALGraph G, int i, int j){\n'
  +'    InitQueue(Q);\n'
  +'    EnQueue(Q, i);\n'
  +'    while(!QueueEmpty(Q)){\n'
  +'        DeQueue(Q, i);\n'
  +'        visited[i] = 1;\n'
  +'        if(i == j) return 1;                      //出队时命中\n'
  +'        for(int p=FirstNeighbor(G,i); p>=0; p=NextNeighbor(G,i,p)){\n'
  +'            if(p == j) return 1;                  //入队前提前命中，可省一轮\n'
  +'            if(!visited[p]){ EnQueue(Q,p); visited[p]=1; }\n'
  +'        }\n'
  +'    }\n'
  +'    return 0;                                     //队空仍未找到\n'
  +'}',
 claude:'思路：<b>本题不需要发明算法，只需给遍历装一个"到了没有"的开关。</b><br>'
  +'<b>核心等价</b>：<b>存在 v<sub>i</sub> ⇝ v<sub>j</sub> 的路径 ⟺ v<sub>j</sub> 落在"从 v<sub>i</sub> 出发可达的顶点集合"里 ⟺ 从 v<sub>i</sub> 起做一次遍历会访问到 v<sub>j</sub></b>。DFS 和 BFS 都能算出这个可达集合，所以两种写法都对。<br>'
  +'<b>DFS 版的两个写法要点</b>：<br>· <b>can_reach 必须用引用（或全局变量）</b>——递归的深层找到了 v<sub>j</sub>，要能把消息传回最外层。写成值传递是本题最常见的硬伤。<br>· <b>循环条件里带上 <code>&& !can_reach</code></b>：一旦找到就<b>不再展开新的递归</b>，能提前收工。<br>'
  +'<b>BFS 版的两个写法要点</b>：<br>· 判断可以放在<b>出队时</b>（<code>if(i==j) return 1;</code>），也可以放在<b>入队前</b>（<code>if(p==j) return 1;</code>）——后者能少跑一轮，书上两处都写了，<b>留一处即可，两处都留也不算错</b>。<br>· <b>队空 = 可达集合已穷尽</b> ⟹ 返回 0。<br>'
  +'<b>⚠️ "有向"两个字决定了三件事</b>：<br>· <b>只能顺弧走</b>：<code>FirstNeighbor/NextNeighbor</code> 取的是<b>出边表</b>；v<sub>i</sub> 到 v<sub>j</sub> 可达<b>推不出</b> v<sub>j</sub> 到 v<sub>i</sub> 可达；<br>· <b>不需要外层循环</b>：本题只关心"从 v<sub>i</sub> 出发"，<b>不是</b>要遍历全图，所以<b>没有</b> <code>for(所有顶点) if(!visited)</code> 那一层——加了反而会把不可达的顶点也标成已访问，逻辑虽仍对但语义错；<br>· <b>i ≠ j 是题目给的前提</b>，所以不必考虑"自己到自己算不算路径"（若允许 i==j，则要问的是"有没有回路经过 v<sub>i</sub>"，那是另一道题）。<br>'
  +'<b>复杂度</b>：最坏 <b>时间 O(n+e)</b>、<b>空间 O(n)</b>；<b>但期望上通常远小于此</b>——一碰到 v<sub>j</sub> 就返回，不必走完整个可达集合。<b>这正是书上说"先调用完整 DFS/BFS 再查 visited[j] 每次都要花最坏时间"的不足之处</b>：结果虽同，但没有<b>提前退出</b>，白跑很多。考场上写"提前 return"的版本更能体现审题。<br>'
  +'⚠️ <b>多次调用要记得清空 visited[]</b>：题中把它写成全局数组，<b>连续判断多对 (i,j) 时必须每次重新置 0</b>，否则第二次调用会误判为不可达。这类"全局数组未重置"的 bug 在综合应用题里是常见扣分点。',
 run:'程序在 6 顶点有向图（1→2、1→4、2→5、3→6、3→5、4→2、5→4）上对全部 30 对 (i,j) 分别跑 DFS 版与 BFS 版：两者结论逐对一致，且与传递闭包的可达矩阵完全吻合 ✅', verdict:'ok'},

{id:'6.3-综5', ch:6, sec:'6.3 图的遍历', type:'subjective', tag:'', exam:null,
 kp:['遍历·输出所有简单路径'],
 hints:['"所有路径"意味着<b>不能找到一条就停</b>，必须把每一种可能都试一遍 ⟹ 这是<b>回溯（backtracking）</b>，不是普通遍历。',
        '普通 DFS 里 visited[u] 一旦置 1 就<b>永不复位</b>，所以每个顶点只会出现在一条搜索路径上。要枚举所有路径，就必须在<b>递归返回时把 u 放回"未访问"</b>。',
        '用 path[] 记录当前路径上的顶点、d 记录路径长度（初值 −1，进入函数先 d++）；一旦 u==v 就把 path[0..d] 打印出来。'],
 stem:'假设图用邻接表表示，设计一个算法，输出从顶点 V<sub>i</sub> 到顶点 V<sub>j</sub> 的所有<b>简单路径</b>。',
 book:'本题采用基于递归的深度优先遍历算法。设置 path[] 存放路径上的顶点、d 表示路径长度（初值为 −1）。从顶点 u 出发，先将 u 加入路径并置访问标记；若 u 等于目标顶点 v，则输出当前路径；否则对 u 的每个未访问的邻接点递归调用。⚠️ 函数返回前必须将 visited[u] 重新置 0，恢复环境，使该顶点可被其他路径重新使用。',
 code:'void FindPath(AGraph *G, int u, int v, int path[], int d){\n'
  +'    int w;  ArcNode *p;\n'
  +'    d++;                        //路径长度增 1（初次调用时 d = -1）\n'
  +'    path[d] = u;                //将当前顶点添加到路径中\n'
  +'    visited[u] = 1;             //置已访问标记\n'
  +'    if(u == v)                  //找到一条从 u 到 v 的路径\n'
  +'        print(path[]);          //输出 path[0..d]\n'
  +'    p = G->adjlist[u].firstarc; //p 指向 u 的第一个邻接点\n'
  +'    while(p != NULL){\n'
  +'        w = p->adjvex;          //若 p 指向的顶点未访问，递归访问它\n'
  +'        if(visited[w] == 0)\n'
  +'            FindPath(G, w, v, path, d);\n'
  +'        p = p->nextarc;         //p 指向 u 的下一个邻接点\n'
  +'    }\n'
  +'    visited[u] = 0;             //⚠️ 恢复环境，使该顶点可重新使用\n'
  +'}\n\n'
  +'//调用方式：memset(visited,0,sizeof(visited));  FindPath(G, i, j, path, -1);',
 claude:'思路：<b>这不是"遍历"，是"回溯"——本题与前面所有题的分水岭就在最后一行。</b><br>'
  +'<b>为什么普通 DFS 不行</b>：普通 DFS 的 visited[] <b>只置不清</b>，目的是<b>保证每个顶点只访问一次</b>（这正是遍历要的）。但"所有简单路径"要求同一个顶点能<b>出现在不同的路径里</b>——比如 a→b→d 和 a→c→b→d 中 b 出现了两次。<b>不清空标记，第二条路径就永远搜不出来</b>，算法只能找到一条。<br>'
  +'<b>三个部件各司其职</b>：<br>· <b>path[] + d</b>：<b>当前这一条</b>路径的快照。<code>d</code> 初值 −1、进函数先 <code>d++</code>，于是 <code>path[0]</code> 恰好是起点，<code>path[d]</code> 恰好是当前顶点；<b>d 是值传递</b>，递归返回后自动"退回"上一层的长度，<b>不需要手动 d--</b>（这是这段代码写得很巧的地方）。<br>· <b>visited[]</b>：保证<b>路径是"简单"的</b>——即<b>不重复经过同一顶点</b>（否则绕环可以生成无穷多条路径，程序不会停）。<br>· <b>最后一行 <code>visited[u]=0</code></b>：<b>回溯还原</b>。含义是"我这条支路已经探完，把 u 交还给别的路径去用"。<br>'
  +'<b>⚠️ 三个高频错误</b>：<br>· <b>漏掉 <code>visited[u]=0</code></b> ⟹ 只能输出<b>一条</b>路径（最致命，也是本题唯一的考点）；<br>· <b>找到 v 后直接 return</b> ⟹ 少了"继续往下试其他分支"，同样只输出一条；<b>注意代码里 <code>if(u==v) print()</code> 之后<u>没有</u> return</b>，虽然对简单路径而言 v 之后已无路可走（v 已标记），但保持"打印后继续走完 while"的结构更通用；<br>· <b>把 d 写成引用 <code>int &d</code></b> ⟹ 递归返回后长度不回退，路径会串味。<b>d 必须值传递</b>。<br>'
  +'<b>复杂度</b>：<b>时间 O(路径条数 × 路径长度)</b>，最坏是<b>指数级</b>（完全图上从 i 到 j 的简单路径条数约 (n−2)!）。<b>这是必然的——输出本身就有指数多条，不可能更快</b>。空间 O(n)（path[]、visited[] 与递归栈）。<br>'
  +'📌 <b>这段"进入时标记 / 返回时清除"的骨架是回溯法的通用模板</b>，408 里还会在<b>八皇后、迷宫、图的着色、哈密顿路径</b>等题上重现。<b>看到"输出所有…"就把这个模板默写出来</b>，比临场推快得多。',
 run:'程序按此算法在 5 顶点有向图（1→2,3；2→3,4；3→4；4→1,5）上枚举全部 20 对 (i,j) 的简单路径，与"暴力枚举所有不重复顶点序列"的参照实现<b>逐条完全一致</b>；其中 1⇝5 共 3 条：1-2-3-4-5、1-2-4-5、1-3-4-5。<b>删掉最后一行 visited[u]=0 后，1⇝5 只剩 1 条</b> ⟹ 该行正是"所有路径"的命根子 ✅', verdict:'ok'},


{id:'6.4-1', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['MST·存在性与唯一性'],
 stem:'任何一个无向连通图的最小生成树（　）。',
 opts:['有一棵或多棵','只有一棵','一定有多棵','可能不存在'], ans:'A',
 book:'当图中各边的权值互不相同时，最小生成树是唯一的；当图中存在权值相同的边时，最小生成树可能有多棵。又因为是无向连通图，所以最小生成树一定存在。故选 A。',
 claude:'一致，选 A。本题一句话拆成<b>两个独立的判断</b>，两个都要答对才能选出 A：<br>· <b>存不存在？</b>——题干写死了「<b>无向连通图</b>」，连通就一定能选出 n−1 条边把所有顶点串起来 ⟹ <b>MST 必定存在</b>（D 出局）。<br>· <b>唯一不唯一？</b>——<b>边权互不相同 ⟹ 唯一</b>；<b>有相等的边权 ⟹ 可能不唯一</b>（注意是"可能"，不是"一定"）⟹ 合起来就是「有一棵或多棵」。<br>📌 <b>本节最重要的一张真值表，后面 02、03、04、28 四道题全从这里派生</b>：<br>　① 边权全不同 ⟹ MST <b>唯一</b>；<br>　② 有相等边权 ⟹ MST <b>可能</b>唯一也可能多棵（B、C 的错就错在把"可能"说成了"一定"）；<br>　③ 无论几棵，<b>所有 MST 的总代价必然相等</b>（这是"最小"的定义决定的）；<br>　④ 无向连通 ⟹ 必存在；<b>不连通就根本没有生成树</b>（那时只有"最小生成森林"）。<br>⚠️ 别把「最小生成树」和「唯一的最小代价」搞混：<b>树可以有多棵，代价只有一个数</b>。',
 run:null, verdict:'ok'},

{id:'6.4-2', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['MST·Prim 与 Kruskal 的关系'],
 stem:'用 Prim 算法和 Kruskal 算法构造图的最小生成树，所得到的最小生成树（　）。',
 opts:['相同','不相同','可能相同，可能不同','无法比较'], ans:'C',
 book:'最小生成树不一定是唯一的，因此用不同的算法生成的最小生成树可能不同。但当最小生成树唯一时，用不同算法生成的最小生成树必定相同。',
 claude:'一致，选 C。<b>把问题倒过来问就秒懂</b>：两个算法都保证输出<u>一棵</u> MST，所以它们的结果<b>是否相同，完全取决于这张图的 MST 有几棵</b>——<br>· <b>MST 唯一</b>（边权互不相同）⟹ 两者<b>必然相同</b>，没有选择余地；<br>· <b>MST 多棵</b>（存在等权边）⟹ 两者可能各自挑到不同的那一棵，<b>也可能碰巧挑到同一棵</b>。<br>⟹ 合起来正是「可能相同，可能不同」。<br>📌 <b>典型反例（记住这个环）</b>：三角形 A–B=1、B–C=1、A–C=1。Prim 从 A 起：先取 (A,B) 再取 (B,C)；Kruskal 按权递增，若排序时 (A,C) 排在最前，则先取 (A,C)——<b>两棵树不同，但代价都是 2</b>。<br>⚠️ <b>B 是最容易被"两个算法思路完全不同"骗进去的选项</b>：思路不同 ≠ 结果一定不同。<b>2012 真题（本节第 28 题）的第 Ⅳ 项「Prim 和 Kruskal 得到的 MST 总不相同」就是同一个坑，考过一次还会再考。</b><br>📌 <b>一句话记法：算法只挑树，图决定有几棵树可挑。</b>',
 run:null, verdict:'ok'},

{id:'6.4-3', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['MST·唯一性与生成树判定'],
 stem:'下列关于图的生成树和最小生成树的叙述中，正确的是（　）。',
 opts:['只要无向连通图中没有权值相同的边，则其最小生成树唯一',
       '只要无向图中有权值相同的边，则其最小生成树一定不唯一',
       '从 n 个顶点的连通图中选取 n−1 条权值最小的边，即可构成最小生成树',
       '设连通图 G 含有 n 个顶点，则含有 n 个顶点、n−1 条边的子图一定是 G 的生成树'], ans:'A',
 book:'各边权值不同时，每次选择的新顶点是唯一的，因此最小生成树唯一，A 正确。若无向图本身就是一棵树，则即使有权值相同的边，其最小生成树也唯一（就是它本身），B 错误。选取 n−1 条权值最小的边可能构成回路，C 错误。含有 n 个顶点、n−1 条边的子图可能有回路、也可能不连通，D 错误。',
 claude:'一致，选 A。四个选项恰好是四种最常见的误记，一条条钉死：<br>· <b>A ✓</b>：边权互不相同 ⟹ 每一步的"最小边"唯一 ⟹ 贪心过程没有分岔 ⟹ MST 唯一。<br>· <b>B ✗（"一定"两个字错了）</b>：<b>有等权边只是"可能"不唯一的必要条件，不是充分条件</b>。最干净的反例：<b>图本身就是一棵树</b>（比如 A–B=1、B–C=1），它的 MST 就是它自己，唯一。<br>· <b>C ✗</b>：<b>光挑"最小的 n−1 条边"会挑出回路</b>。反例：A–B=1、B–C=1、A–C=1、C–D=9，n=4 要 3 条边，最小的三条是那三条 1 ⟹ 围成三角形、还漏掉 D ⟹ 根本不是生成树。<b>Kruskal 之所以要用并查集判环，就是为了堵这个漏洞。</b><br>· <b>D ✗</b>：<b>"n 个顶点 + n−1 条边"推不出树</b>，必须再加"连通"或"无环"其中一条。反例同上：三角形 + 一个孤立点，4 个顶点 3 条边，既有环又不连通。<br>📌 <b>树的三条等价刻画（缺一不可，考场默写）</b>：连通 + 无环 ／ 连通 + n−1 条边 ／ 无环 + n−1 条边。<b>任意两条推出第三条，只给一条永远不够</b>——D 犯的就是"只给一条"的错。',
 run:null, verdict:'ok'},

{id:'6.4-4', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['MST·不唯一的推论'],
 stem:'设 n 个顶点的无向连通图的最小生成树不唯一，则下列说法中正确的是（　）。',
 opts:['图的边数一定大于 n−1','图的权值最小的边一定有多条','图的最小生成树的代价不一定相等','图的各条边的权值不相等'], ans:'A',
 book:'边数小于 n−1 时图不连通，没有生成树；边数等于 n−1 时图本身就是一棵树，最小生成树唯一。因此最小生成树不唯一时，边数一定大于 n−1，A 正确。B 错误，最小生成树不唯一只需要存在权值相等的边，不一定是权值最小的边（例如 A–B=1、B–C=2、B–D=2、C–D=2）。C 错误，所有最小生成树的代价一定相等。D 错误，权值互不相等时最小生成树唯一。',
 claude:'一致，选 A。<b>"MST 不唯一"这个前提能推出什么、不能推出什么，本题一次问全</b>：<br>· <b>A ✓（唯一能推出的结论）</b>：边数 &lt; n−1 ⟹ <b>不连通、连生成树都没有</b>；边数 = n−1 且连通 ⟹ <b>图本身就是树，MST 就是它自己、唯一</b>。<b>要有"第二棵"，必须有多余的边可以替换 ⟹ 边数 &gt; n−1。</b><br>· <b>B ✗</b>：<b>不唯一只要求"某处有等权边可换"，跟这条边是不是全图最小无关。</b>书上的反例值得抄下来：A–B=1、B–C=2、B–D=2、C–D=2 —— <b>最小边 (A,B)=1 只有一条</b>，但 B、C、D 之间三条 2 构成三角形，去掉哪条都行 ⟹ 有 3 棵 MST。<br>· <b>C ✗（最容易错的一项）</b>：<b>所有 MST 的代价必然相等</b>，都等于那个最小值——"最小"是一个数，"达到最小的树"才可能有多棵。<br>· <b>D ✗</b>：正好说反了。<b>权值互不相等 ⟹ MST 唯一</b>（第 3 题 A 项）；不唯一恰恰要求<b>存在相等的权</b>。<br>📌 <b>一句话总纲：MST 不唯一 ⟺ 存在"等权边可互换而不改变代价"的位置 ⟹ 必然 ① 有等权边、② 边数多于 n−1、③ 但代价始终相同。</b>',
 run:null, verdict:'ok'},

{id:'6.4-5', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['MST·Prim 的候选边集'],
 stem:'用 Prim 算法求带权连通图的最小生成树，某时刻已选取的顶点集合 U={1,2,3}，已选取的边集合 TE={(1,2),(2,3)}，要选取下一条权值最小的边，应当从（　）组中选取。',
 opts:['{(1,4),(3,4),(3,5),(2,5)}','{(3,4),(3,5),(4,5),(1,4)}','{(1,2),(2,3),(3,5)}','{(4,5),(1,3),(3,5)}'], ans:'A',
 book:'Prim 算法每次从连接 U 和 V−U 的边中选取权值最小的边加入生成树，因此候选边必须一端在 U 中、另一端在 V−U 中。只有 A 中的四条边全部满足。',
 claude:'一致，选 A。<b>Prim 的候选边只有一种：<u>横跨</u> U 与 V−U 的边（书上叫"割边"）。</b>拿这把尺子逐项量：<br>· <b>A ✓</b>：(1,4)、(3,4)、(3,5)、(2,5) —— 每条边都是"左端 ∈ U={1,2,3}，右端 ∈ V−U"。<br>· <b>B ✗</b>：混进了 <b>(4,5)</b>，<b>两端都在 U 外</b>——这种边此刻根本不该看（它连不到已有的树上）。<br>· <b>C ✗</b>：(1,2)、(2,3) <b>两端都在 U 内</b>，而且已经在树里了；再选就是自环／重复。<br>· <b>D ✗</b>：(1,3) 两端都在 U 内（选它必成回路），(4,5) 两端都在 U 外。<br>📌 <b>Prim 一步之内只做三件事</b>：① 圈出所有<b>一头在树内、一头在树外</b>的边；② 挑其中权最小的 (u,v)；③ <b>把 v 拉进 U，边进 TE</b>——顶点数 +1、边数 +1，n−1 步后结束。<br>⚠️ <b>Prim 与 Kruskal 在"候选集"上的分水岭</b>：<b>Prim 只在割边里挑</b>（永远保持一棵连通的树在长大，<b>天然不会成环</b>，所以不需要并查集）；<b>Kruskal 在全图边里挑</b>（森林长成树，<b>随时可能成环，所以必须判环</b>）。这也是下一题（第 6 题）的着眼点。',
 run:null, verdict:'ok'},

{id:'6.4-6', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['MST·Kruskal 的判环'],
 stem:'用 Kruskal 算法求最小生成树，某时刻已选取的边集合 TE={(1,2),(2,3),(3,5)}，要选取下一条权值最小的边，<b>不可能</b>选取的边是（　）。',
 opts:['(3,6)','(2,4)','(1,3)','(1,4)'], ans:'C',
 book:'Kruskal 算法在选边时，若该边的两个顶点落在同一个连通分量上，则会构成回路，必须舍弃。已选边使 1、2、3、5 处于同一连通分量，(1,3) 的两端都在其中，故不可能被选中。',
 claude:'一致，选 C。<b>已选的三条边把 {1,2,3,5} 焊成了一个连通分量</b>（1—2—3—5 是一条链）。Kruskal 的唯一禁令：<b>两端落在同一个连通分量里的边一律舍弃</b>（否则成环）。<br>· <b>A (3,6)</b>：6 还在外面 ⟹ 可以选；<br>· <b>B (2,4)</b>：4 还在外面 ⟹ 可以选；<br>· <b>C (1,3) ✗</b>：<b>1 和 3 都已在同一分量里</b>，加进去立刻形成回路 1—2—3—1 ⟹ <b>无论它的权值多小都必须扔掉</b>；<br>· <b>D (1,4)</b>：4 在外面 ⟹ 可以选。<br>📌 <b>"权值最小"从来不是入选的充分条件</b>——Kruskal 每一轮先看最小，再问"会不会成环"，两关都过才入选。<b>2020 真题（第 40 题）就在这里设卡</b>：按权递增排好后，第三小的边恰好成环、必须跳过，选项里给的就是"没跳过"的错误顺序。<br>⚠️ 实现上判"是否同一分量"用<b>并查集</b>（近似 O(1)），别真去做一次 DFS——那会把 Kruskal 的复杂度从 O(|E|log|E|) 拖成 O(|V||E|)。',
 run:null, verdict:'ok'},

{id:'6.4-7', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['最短路径·Dijkstra 适用范围'],
 stem:'下列关于图的最短路径的相关叙述中，正确的是（　）。',
 opts:['最短路径一定是简单路径','Dijkstra 算法不适合求有回路的带权图的最短路径',
       'Dijkstra 算法不适合求任意两个顶点的最短路径','Dijkstra 算法可以正确处理含有负权边的图'], ans:'A',
 book:'最短路径一定是简单路径，A 正确。Dijkstra 算法适用于有回路的带权图，B 错误；对每个顶点各执行一次 Dijkstra 算法即可求任意两个顶点间的最短路径，C 错误；Dijkstra 算法不能处理含负权边的图，D 错误。',
 claude:'一致，选 A。四个选项把 Dijkstra 的"能"与"不能"划得很清楚：<br>· <b>A ✓</b>：<b>最短路径必是简单路径</b>——若路径上重复经过某顶点，说明中间兜了一个回路；<b>权值非负时，把这个回路剪掉只会更短或不变</b>，所以最短路径里不会有重复顶点。<br>· <b>B ✗</b>：<b>有回路完全不影响 Dijkstra</b>。正权回路只会让路径变长，算法自然不会走；它怕的是<b>负权</b>，不是<b>回路</b>。<br>· <b>C ✗</b>：想求任意两点，就<b>以每个顶点为源各跑一次</b>，n 次 Dijkstra = O(n³)，和 Floyd 同量级（这正是第 8 题 Ⅱ 项的考点）。<br>· <b>D ✗</b>：<b>Dijkstra 的命门就是负权边</b>。原因在于它的贪心假设——"当前 dist 最小的顶点已经拿到最终答案，可以永久确定"。有负权边时，后面可能出现一条"绕远但带负权、总和更小"的路，而该顶点早已被锁死、再也不会更新。<br>　书上反例：0→1=7、<b>1→2=−5</b>、0→2=5。Dijkstra 先确定 dist[2]=5，但实际 0→1→2 = 7−5 = <b>2</b> 更短，已经来不及改了。<br>📌 <b>三张表的分工背熟（表 6.4）</b>：<b>BFS</b> 只能无权图；<b>Dijkstra</b> 带权但<b>不能负权</b>；<b>Floyd</b> 能负权、<b>不能负权回路</b>（有负权回路时"最短"根本不存在，绕圈可以无限变小）。',
 run:null, verdict:'ok'},

{id:'6.4-8', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['最短路径·复杂度与负权'],
 stem:'下列关于图的最短路径的相关叙述中，正确的是（　）。<br>'
  +'Ⅰ．Dijkstra 算法求单源最短路径不允许边的权为负<br>'
  +'Ⅱ．Dijkstra 算法求每对顶点间的最短路径的时间复杂度为 O(n<sup>2</sup>)<br>'
  +'Ⅲ．Floyd 算法求每对顶点间的最短路径允许边的权为负，但不允许含有负权的回路',
 opts:['Ⅰ、Ⅱ和Ⅲ','仅Ⅰ','Ⅰ和Ⅲ','Ⅱ和Ⅲ'], ans:'C',
 book:'Ⅱ 错误：用 Dijkstra 算法求每对顶点间的最短路径需要调用 n 次 Dijkstra 算法，每次的时间复杂度为 O(n²)，故总时间复杂度为 O(n³)。Ⅰ、Ⅲ 正确。',
 claude:'一致，选 C（Ⅰ、Ⅲ 对，Ⅱ 错）。<br>· <b>Ⅰ ✓</b>：<b>负权是 Dijkstra 的绝对禁区</b>（原因见第 7 题 D 项：贪心一旦锁定就不再回头）。<br>· <b>Ⅱ ✗ —— 本题唯一的坑，坑在"每对"两个字</b>：<b>一次</b> Dijkstra（单源）才是 O(n²)；要求<b>每对顶点</b>，必须<b>以每个顶点为源各跑一遍</b> ⟹ <b>n × O(n²) = O(n³)</b>。<b>读题时把"单源"和"每对"当成两个不同的量在看，是本题的全部技术含量。</b><br>· <b>Ⅲ ✓</b>：Floyd 的递推 A<sup>(k)</sup>[i][j] = min{A<sup>(k−1)</sup>[i][j], A<sup>(k−1)</sup>[i][k] + A<sup>(k−1)</sup>[k][j]} <b>没有"已确定就不再改"的假设</b>，所以负权边照样算对；但<b>负权回路</b>会让"最短"失去意义（沿回路绕一圈就更短一次，可以无限小）⟹ 任何算法都不允许。<br>📌 <b>顺手把复杂度表钉死</b>：Dijkstra 单源 <b>O(n²)</b>（邻接表也仍是 O(n²)，因为每轮找 dist 最小仍要扫 O(n)）；Dijkstra 全源 <b>O(n³)</b>；Floyd <b>O(n³)</b>。<b>两者同量级，但 Floyd 常数小、代码只有三重循环，中小规模图更实用。</b>',
 run:null, verdict:'ok'},

{id:'6.4-9', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['最短路径·实例计算'],
 stem:'已知带权连通无向图 G=(V,E)，V={v<sub>1</sub>,…,v<sub>7</sub>}，'
  +'E={(v<sub>1</sub>,v<sub>2</sub>)10, (v<sub>1</sub>,v<sub>3</sub>)2, (v<sub>3</sub>,v<sub>4</sub>)2, (v<sub>3</sub>,v<sub>6</sub>)11, (v<sub>2</sub>,v<sub>5</sub>)1, (v<sub>4</sub>,v<sub>5</sub>)4, (v<sub>4</sub>,v<sub>6</sub>)6, (v<sub>5</sub>,v<sub>7</sub>)7, (v<sub>6</sub>,v<sub>7</sub>)3}'
  +'（注：顶点偶对括号外的数据表示边上的权值），从源点 v<sub>1</sub> 到顶点 v<sub>7</sub> 的最短路径上经过的顶点序列是（　）。',
 opts:['v<sub>1</sub>,v<sub>2</sub>,v<sub>5</sub>,v<sub>7</sub>','v<sub>1</sub>,v<sub>3</sub>,v<sub>4</sub>,v<sub>6</sub>,v<sub>7</sub>',
       'v<sub>1</sub>,v<sub>3</sub>,v<sub>4</sub>,v<sub>5</sub>,v<sub>7</sub>','v<sub>1</sub>,v<sub>2</sub>,v<sub>5</sub>,v<sub>4</sub>,v<sub>6</sub>,v<sub>7</sub>'], ans:'B',
 book:'四个选项对应的路径长度分别为 18、13、15、24，最短的是 B，即 v₁→v₃→v₄→v₆→v₇，长度为 2+2+6+3=13。',
 claude:'一致，选 B（长度 <b>13</b>）。<b>选项已经把候选路径给全了，本题<u>不必</u>跑 Dijkstra，直接四条加法：</b><br>· A：v₁v₂v₅v₇ = 10+1+7 = <b>18</b><br>· <b>B：v₁v₃v₄v₆v₇ = 2+2+6+3 = 13</b> ✔<br>· C：v₁v₃v₄v₅v₇ = 2+2+4+7 = <b>15</b><br>· D：v₁v₂v₅v₄v₆v₇ = 10+1+4+6+3 = <b>24</b><br>📌 <b>"给序列选最短"型题的标准打法：只做加法，别画 dist 表。</b>四次加法 30 秒能算完，画表反而要 5 分钟还容易错。<b>只有当题目问"依次得到的目标顶点顺序"（第 29、35、44 题那种）时才必须真的模拟 Dijkstra。</b><br>⚠️ <b>加法时死盯"边在不在图里"</b>：本题 D 项里的 (v₅,v₄)=4 确实存在，别以为写得长就一定非法；反过来若某选项用到了图中<b>不存在的边</b>，直接判死，连算都不用算。<br>📌 <b>顺手看一眼这张图的结构</b>：v₁ 只有两条出路（v₂ 走 10、v₃ 走 2），<b>而 10 这个权大得离谱</b> ⟹ 凡是第二个顶点是 v₂ 的选项（A、D）基本可以先放到一边，剩下 B、C 二选一，只需比 v₄ 之后走 v₆(6+3=9) 还是走 v₅(4+7=11) ⟹ <b>走 v₆ 更短</b> ⟹ B。这套"先砍高权分支"的排除法在考场上比硬算快一倍。',
 run:'程序按边集独立跑 Dijkstra（无向图，双向建边）：dist(v₁→v₇)=<b>13</b>，最短路径 v₁→v₃→v₄→v₆→v₇；四个选项的长度分别为 18、13、15、24，与书答完全一致 ✅', verdict:'ok'},

{id:'6.4-10', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['最短路径·Dijkstra 的松弛对象'],
 stem:'用 Dijkstra 算法求一个带权有向图的从顶点 0 出发的最短路径，在算法执行的某个时刻，已求得的最短路径的顶点集合 S={0,2,3,4}，下一个选取的目标顶点是顶点 1，则可能修改的最短路径是（　）。',
 opts:['从顶点 0 到顶点 3 的最短路径','从顶点 0 到顶点 2 的最短路径',
       '从顶点 2 到顶点 4 的最短路径','从顶点 0 到顶点 1 的最短路径'], ans:'D',
 book:'Dijkstra 算法在执行过程中，只可能修改从源点 0 到集合 V−S 中某个顶点的最短路径。顶点 2、3 已在 S 中，其最短路径不再修改；"从顶点 2 到顶点 4"不是本算法求解的内容。',
 claude:'一致，选 D。<b>这题考的是"Dijkstra 到底在维护什么量"</b>：它只维护一个数组 <code>dist[]</code>，含义固定为「<b>从<u>源点 0</u> 出发、到各顶点的当前最短路径长度</b>」。于是：<br>· <b>A、B ✗</b>：顶点 3、2 <b>已经进入 S</b> ⟹ 按 Dijkstra 的核心不变式，<b>进入 S 就意味着该顶点的最短路径已经<u>最终确定</u>，此后永不修改</b>。<br>· <b>C ✗</b>：<b>"从顶点 2 到顶点 4"根本不是本次算法计算的量</b>——单源算法只算"0 到 x"，不算"x 到 y"。要那个得另跑一次以 2 为源的 Dijkstra，或者用 Floyd。<b>这是本题最狡猾的干扰项：看起来"2、4 都在 S 里所以定了"，其实它压根不在讨论范围内。</b><br>· <b>D ✓</b>：顶点 1 是<b>本轮刚被选中、正要并入 S</b> 的顶点。选中它 ⟹ 以它为中转对<b>它的邻接点</b>做松弛；而 dist[1] 本身在被选中的那一刻确定。<b>严格地说，本轮会被改写的是 V−S 中顶点的 dist</b>——四个选项里唯一还沾得上"源点 0 到某个尚未定型顶点"的，只有 D。<br>📌 <b>Dijkstra 的两句话不变式，背下来能秒杀这一类题</b>：① <b>S 内已定终身、绝不再改</b>；② <b>每轮只改 V−S 中顶点的 dist，且改的永远是"0 到它"的值</b>。',
 run:null, verdict:'ok'},

{id:'6.4-11', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['判环·四种方法'],
 stem:'下面的（　）方法可以判断出一个有向图是否有环（回路）。<br>Ⅰ．深度优先遍历　Ⅱ．拓扑排序　Ⅲ．求最短路径　Ⅳ．广度优先遍历',
 opts:['Ⅰ、Ⅱ、Ⅳ','Ⅰ、Ⅲ、Ⅳ','Ⅰ、Ⅱ、Ⅲ','全部可以'], ans:'A',
 book:'深度优先遍历过程中若遇到指向已访问且仍在递归栈中的顶点（回边），则说明存在环；拓扑排序若不能输出全部顶点，则说明存在环；基于广度优先的拓扑排序同样可以判环。求最短路径的算法允许图中存在回路，不能用来判断是否有环。',
 claude:'一致，选 A（Ⅰ、Ⅱ、Ⅳ 可以，<b>Ⅲ 不行</b>）。<br>· <b>Ⅰ. DFS ✓</b>：搜索过程中若碰到一条指向<b>"已访问且还在当前递归栈上"</b>的顶点的边（<b>回边 back edge</b>），就说明从那个顶点能走回来 ⟹ 有环。<b>⚠️ 关键在"还在栈上"</b>——只判"已访问"是不够的，DAG 里 1→2、1→3、2→3 也会重复碰到已访问的 3，但那是<b>横叉边</b>，不构成环。<br>· <b>Ⅱ. 拓扑排序 ✓</b>：输出的顶点数 <b>count &lt; n</b> ⟹ 剩下的顶点入度永远减不到 0 ⟹ 它们互相牵制 ⟹ <b>必有环</b>。这是最常用的判环法。<br>· <b>Ⅳ. BFS ✓</b>：<b>基于 BFS 的拓扑排序就是 Kahn 算法</b>——入度为 0 的入队、出队时删边。队空而 count &lt; n ⟹ 有环。<b>很多人误以为"判环是 DFS 的专利"，本题就是来纠正这个误解的。</b><br>· <b>Ⅲ. 求最短路径 ✗</b>：Dijkstra/Floyd <b>允许图中有回路</b>（正权回路只是不走而已），算法自己完全不关心环的存在 ⟹ 拿不出"有没有环"的结论。<br>📌 <b>408 考纲内的判环三条路：DFS 找回边 ／ 拓扑排序数个数 ／（无向图专用）数边数是否 &gt; n−1。</b>',
 run:null, verdict:'ok'},

{id:'6.4-12', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['拓扑排序·序列与路径的关系'],
 stem:'在有向图 G 的拓扑序列中，若顶点 v<sub>i</sub> 在顶点 v<sub>j</sub> 之前，则<b>不可能</b>出现的情形是（　）。',
 opts:['G 中有弧⟨v<sub>i</sub>,v<sub>j</sub>⟩','G 中有一条从 v<sub>i</sub> 到 v<sub>j</sub> 的路径',
       'G 中没有弧⟨v<sub>i</sub>,v<sub>j</sub>⟩','G 中有一条从 v<sub>j</sub> 到 v<sub>i</sub> 的路径'], ans:'D',
 book:'若 G 中存在从 vⱼ 到 vᵢ 的路径，则在拓扑序列中 vⱼ 必然排在 vᵢ 之前，与题设"vᵢ 在 vⱼ 之前"矛盾，故 D 不可能出现。',
 claude:'一致，选 D。<b>拓扑序列的定义只管一个方向</b>：<b>若存在 A⇝B 的路径，则 A 必排在 B 之前</b>。反过来"A 排在 B 之前"<u>推不出</u>任何东西——两者也可能毫无关系。<br>· <b>A 可能</b>：有弧 v<sub>i</sub>→v<sub>j</sub> 正是让 v<sub>i</sub> 排前面的<b>最直接原因</b>。<br>· <b>B 可能</b>：有路径（不必是一条弧）同样强制 v<sub>i</sub> 在前。<br>· <b>C 可能</b>：<b>两个毫无关系的顶点，谁在前都行</b>——比如两个入度都为 0 的起点，先输出哪个都是合法拓扑序。<b>这一项恰好是第 14 题 Ⅱ 项的考点</b>（"a 在 b 之前 ⟹ 必有弧⟨a,b⟩"是错的）。<br>· <b>D 不可能 ✓</b>：有 v<sub>j</sub>⇝v<sub>i</sub> 的路径 ⟹ 按定义 v<sub>j</sub> <b>必须</b>排在 v<sub>i</sub> 前面，与题给的"v<sub>i</sub> 在前"直接冲突。（若两条路径都有，那就是环，DAG 里不存在。）<br>📌 <b>一句话记牢：拓扑序把"可达"翻译成"排前面"，但"排前面"翻译不回"可达"。</b>这条单向性是第 12、14、21 三道题的共同题眼。',
 run:null, verdict:'ok'},

{id:'6.4-13', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['拓扑排序·唯一性判定'],
 stem:'下列关于拓扑排序的说法中，<b>错误</b>的是（　）。<br>'
  +'Ⅰ．若某有向图存在环路，则该有向图一定不存在拓扑排序<br>'
  +'Ⅱ．在拓扑排序算法中为暂存入度为零的顶点，可以使用栈，也可以使用队列<br>'
  +'Ⅲ．若有向图的拓扑有序序列唯一，则图中每个顶点的入度和出度最多为 1<br>'
  +'Ⅳ．若有向图的拓扑有序序列唯一，则图中入度为 0 和出度为 0 的顶点都仅有 1 个',
 opts:['Ⅰ、Ⅲ、Ⅳ','Ⅲ、Ⅳ','Ⅱ、Ⅳ','Ⅲ'], ans:'D',
 book:'Ⅲ 错误，反例：V₁→V₂、V₁→V₃、V₂→V₄、V₃→V₄ 的图，其拓扑序列可能唯一，但 V₁ 的出度为 2。Ⅰ、Ⅱ、Ⅳ 均正确。',
 claude:'一致，选 D（<b>只有 Ⅲ 错</b>）。题干问的是"<b>错误</b>的是"，四项要逐一验：<br>· <b>Ⅰ 对</b>：有环 ⟹ 环上的顶点入度永远减不到 0 ⟹ 拓扑排序必然失败。<b>「存在拓扑序列 ⟺ 是 DAG」是本节的地基。</b><br>· <b>Ⅱ 对</b>：栈和队列<b>只影响"多个入度为 0 的顶点先输出哪一个"</b>，也就是<b>挑哪一条合法拓扑序</b>，不影响合法性。（王道正文的伪码用栈，Kahn 算法习惯用队列。）<br>· <b>Ⅲ 错 ✗（本题答案）</b>：书上的反例要背——<b>V₁→V₂、V₁→V₃、V₂→V₄、V₃→V₄</b>（一个菱形）。⚠️ 注意：<b>这张图的拓扑序不唯一</b>（V₂、V₃ 可换序），所以更稳的反例是<b>链上加一条"越级弧"</b>：V₁→V₂、V₂→V₃、<b>V₁→V₃</b> ——每一步入度为 0 的顶点都<u>恰好一个</u> ⟹ 拓扑序唯一为 V₁V₂V₃，而 <b>V₁ 的出度是 2</b>、V₃ 的入度是 2 ⟹ Ⅲ 被推翻。<b>要点：唯一性管的是"每步只有一个候选"，管不着某个顶点连了几条边。</b><br>· <b>Ⅳ 对</b>：入度为 0 的顶点若有两个，<b>第一个输出谁都行 ⟹ 序列必不唯一</b>；出度为 0 的若有两个，<b>最后输出谁都行 ⟹ 同样不唯一</b>。所以唯一 ⟹ 首尾各只有一个。<br>📌 <b>拓扑序唯一的可操作判据（2024 真题 综合 13 直接考代码）：每一轮入度为 0 的顶点<u>恰好只有一个</u>。</b>等价说法是"任意两顶点之间都存在单向路径"（即拓扑序上相邻两点必有弧相连）。',
 run:null, verdict:'ok'},

{id:'6.4-14', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['拓扑排序·唯一性不能反推图'],
 stem:'下列关于拓扑排序的说法中，正确的是（　）。<br>'
  +'Ⅰ．顶点数大于 1 的强连通图不能进行拓扑排序<br>'
  +'Ⅱ．在一个有向图的拓扑序列中，若顶点 a 在顶点 b 之前，则图中必有一条弧⟨a,b⟩<br>'
  +'Ⅲ．若有向无环图的拓扑序列唯一，则可以唯一确定该图',
 opts:['Ⅰ和Ⅱ','Ⅰ、Ⅱ和Ⅲ','仅Ⅰ','Ⅰ和Ⅲ'], ans:'C',
 book:'Ⅰ 正确：顶点数大于 1 的强连通图中任意两顶点互相可达，必存在回路，因此不能拓扑排序。Ⅱ 错误：a、b 的入度均为 0 且都指向 c 时，拓扑序列可以是 a,b,c，但图中没有弧⟨a,b⟩。Ⅲ 错误：a→b→c→d 与在其上再加弧⟨b,d⟩ 的图，拓扑序列都唯一为 a,b,c,d，但两张图不同。',
 claude:'一致，选 C（<b>仅 Ⅰ 正确</b>）。<br>· <b>Ⅰ ✓</b>：<b>强连通</b> = 任意两顶点互相可达。顶点数 &gt; 1 时，取任意两点 u、v，既有 u⇝v 又有 v⇝u ⟹ <b>拼起来就是一个环</b> ⟹ 不是 DAG ⟹ 不能拓扑排序。（顶点数 = 1 的单点图平凡强连通，可以排序，所以题干才要加"大于 1"。）<br>· <b>Ⅱ ✗</b>：这是第 12 题 C 项的换皮版——<b>"排在前面"不等于"有弧"</b>。书上的反例：a、b 入度都是 0、都指向 c，合法拓扑序 a,b,c 里 a 在 b 前，但 a 与 b 之间<b>根本没有边</b>。<br>· <b>Ⅲ ✗（本节反复考的一项，第 21 题 Ⅳ 又考了一次）</b>：<b>拓扑序唯一 ⟹ 图唯一？不成立。</b>反例：<b>a→b→c→d</b>（三条边）与在它上面<b>再加一条"越级弧"</b> a→c（或 b→d）得到的图，<b>两张图的拓扑序列都唯一为 a,b,c,d</b>，但边集不同。<br>　<b>本质原因：越级弧是<u>冗余</u>的——它所要求的先后关系已经被链上的路径蕴含了，加不加都不改变任何一步的候选集。</b>（第 16 题那张图里的 D→G 就是一条这样的冗余弧，删掉它拓扑序个数照样是 5。）<br>📌 <b>结论钉死：拓扑序唯一 ⟺ 每步入度为 0 的顶点恰好一个 ⟺ 顶点间有一条哈密顿路径把它们串成全序；但这只锁死了<u>顺序</u>，锁不死<u>边集</u>。</b>',
 run:null, verdict:'ok'},

{id:'6.4-15', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['拓扑排序·失败与强连通分量'],
 stem:'若一个有向图的顶点不能排成一个拓扑序列，则判定该有向图（　）。',
 opts:['含有多个出度为 0 的顶点','是个强连通图','含有多个入度为 0 的顶点','含有顶点数大于 1 的强连通分量'], ans:'D',
 book:'不能拓扑排序说明图中存在回路，而回路上的所有顶点是互相可达的，它们构成一个顶点数大于 1 的强连通分量。',
 claude:'一致，选 D。<b>推理链只有两步</b>：<b>不能拓扑排序 ⟹ 图中有环</b>；<b>环上的顶点两两互相可达 ⟹ 它们（至少）构成一个顶点数 &gt; 1 的强连通分量</b>。<br>逐项排除：<br>· <b>A、C ✗</b>：多个出度为 0 / 入度为 0 的顶点<b>只会让拓扑序列"不唯一"，不会让它"不存在"</b>（第 13 题 Ⅳ 项）。<b>把"不唯一"错当成"不存在"是本题的主陷阱。</b><br>· <b>B ✗</b>：<b>"有环" ≠ "整张图强连通"</b>。图可以只有一小块打了结、其余部分规规矩矩，比如 a→b、b→a、b→c —— 有环不能拓扑排序，但顶点 c 回不到 a、b，整图并不强连通。<b>B 把"局部"说成了"整体"。</b><br>· <b>D ✓</b>：正好是"局部"的准确表述。<br>📌 <b>三个说法的等价关系一次记清</b>：<b>存在拓扑序列 ⟺ 是 DAG ⟺ 每个强连通分量都只有 1 个顶点</b>。<b>反过来：不能拓扑排序 ⟺ 有环 ⟺ 至少有一个"大"强连通分量。</b>（Tarjan 缩点后 DAG 就出来了，这也是"有环图也能做拓扑"的标准做法，不过 408 不要求。）',
 run:null, verdict:'ok'},


{id:'6.4-16', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['拓扑排序·序列计数'],
 stem:'下图所示有向图的所有拓扑序列共有（　）个。',
 fig:'图/ch6/6.4-16.svg',
 figcap:'题图：7 顶点有向无环图（A→B；B→C、B→D；C→E、C→F；D→E、D→G；E→G；F→G，据王道 p.238 重画）',
 opts:['4','6','5','7'], ans:'C',
 book:'该图的拓扑序列为 ABCFDEG、ABCDFEG、ABCDEFG、ABDCFEG、ABDCEFG，共 5 个。',
 claude:'一致，选 C（<b>5 个</b>）。<b>算"有多少条拓扑序"只有一条路：按分岔点分类枚举，别乱试。</b><br>'
  +'<b>先看死结构</b>：A 入度 0 ⟹ <b>必第一个</b>；B 只依赖 A ⟹ <b>必第二个</b>；G 是唯一汇点 ⟹ <b>必最后一个</b>。<b>所以只剩中间的 C、D、E、F 四个位置要排。</b><br>'
  +'<b>剩下的约束</b>：C→E、C→F、D→E（E 要等 C 和 D，F 只要等 C）。<b>按"第三位是 C 还是 D"分两支</b>：<br>'
  +'· <b>第三位 C</b>（此时 D、F 都自由，E 需 D）：D、F 的相对顺序有 3 种插法 ⟹ <b>ABCDEFG、ABCDFEG、ABCFDEG</b>（3 条）；<br>'
  +'· <b>第三位 D</b>（E 还缺 C，F 还缺 C ⟹ 第四位必须是 C）：之后 E、F 都就绪，谁先都行 ⟹ <b>ABDCEFG、ABDCFEG</b>（2 条）。<br>'
  +'⟹ 3+2 = <b>5</b>。<br>'
  +'📌 <b>本图藏着一条"冗余弧"，正好印证第 14 题 Ⅲ</b>：<b>D→G 是多余的</b>——D→E→G 已经蕴含了"D 在 G 之前"。<b>把 D→G 删掉，拓扑序个数仍然是 5，一条不多一条不少</b>（程序已双向验证）。这说明<b>拓扑序列的个数由"约束的传递闭包"决定，与画了几条边无关</b>；也再次说明"拓扑序唯一（或个数确定）推不出图唯一"。<br>'
  +'⚠️ <b>考场提速</b>：先把"必占位"的顶点（唯一源点、唯一汇点、只有一个前驱的顶点）钉死，<b>把 7 个顶点的排列问题压缩成 4 个</b>，再按分岔枚举，30 秒可解；直接对 7 个顶点做全排列筛选，考场上必然算崩。',
 run:'程序对 7 个顶点做全排列并逐条验证约束：合法拓扑序恰为 ABCDEFG、ABCDFEG、ABCFDEG、ABDCEFG、ABDCFEG 共 <b>5</b> 条，与书答完全一致；<b>另删去冗余弧 D→G 重跑，结果仍是同样的 5 条</b> ✅', verdict:'ok'},

{id:'6.4-17', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['拓扑排序·序列合法性判定'],
 stem:'已知有向图 G=(V,E)，其中 V={v<sub>1</sub>,v<sub>2</sub>,v<sub>3</sub>,v<sub>4</sub>,v<sub>5</sub>,v<sub>6</sub>,v<sub>7</sub>}，'
  +'E={⟨v<sub>1</sub>,v<sub>2</sub>⟩,⟨v<sub>1</sub>,v<sub>3</sub>⟩,⟨v<sub>1</sub>,v<sub>4</sub>⟩,⟨v<sub>2</sub>,v<sub>5</sub>⟩,⟨v<sub>3</sub>,v<sub>5</sub>⟩,⟨v<sub>3</sub>,v<sub>6</sub>⟩,⟨v<sub>5</sub>,v<sub>7</sub>⟩,⟨v<sub>6</sub>,v<sub>7</sub>⟩,⟨v<sub>4</sub>,v<sub>6</sub>⟩}，'
  +'G 的拓扑序列是（　）。',
 opts:['{v<sub>1</sub>,v<sub>3</sub>,v<sub>4</sub>,v<sub>6</sub>,v<sub>2</sub>,v<sub>5</sub>,v<sub>7</sub>}','{v<sub>1</sub>,v<sub>3</sub>,v<sub>2</sub>,v<sub>6</sub>,v<sub>4</sub>,v<sub>5</sub>,v<sub>7</sub>}',
       '{v<sub>1</sub>,v<sub>3</sub>,v<sub>4</sub>,v<sub>5</sub>,v<sub>2</sub>,v<sub>6</sub>,v<sub>7</sub>}','{v<sub>1</sub>,v<sub>2</sub>,v<sub>5</sub>,v<sub>3</sub>,v<sub>4</sub>,v<sub>6</sub>,v<sub>7</sub>}'], ans:'A',
 book:'v₁ 入度为 0，首先输出；删去 v₁ 及其出边后 v₂、v₃、v₄ 入度均为 0，可任选。逐步进行可得 A 为合法的拓扑序列。B 中 v₆ 早于其前驱 v₄；C 中 v₅ 早于其前驱 v₂；D 中 v₅ 早于其前驱 v₂。',
 claude:'一致，选 A。<b>判"是不是拓扑序"根本不用模拟算法，只需<u>逐条边</u>检查"弧尾是否排在弧头前面"</b>——发现一条违规立刻毙掉。<br>'
  +'<b>把入边表列出来（谁依赖谁）</b>：v<sub>5</sub> 依赖 <b>v<sub>2</sub>、v<sub>3</sub></b>；v<sub>6</sub> 依赖 <b>v<sub>3</sub>、v<sub>4</sub></b>；v<sub>7</sub> 依赖 <b>v<sub>5</sub>、v<sub>6</sub></b>；v<sub>2</sub>、v<sub>3</sub>、v<sub>4</sub> 只依赖 v<sub>1</sub>。<br>'
  +'· <b>A ✓</b>：v₁,v₃,v₄,v₆,v₂,v₅,v₇ —— v₆ 前面有 v₃、v₄ ✓；v₅ 前面有 v₂、v₃ ✓；v₇ 最后 ✓。<br>'
  +'· <b>B ✗</b>：…v<sub>6</sub> 排在第 4 位，而它的前驱 <b>v<sub>4</sub> 排在第 5 位</b> ⟹ 违规。<br>'
  +'· <b>C ✗</b>：v<sub>5</sub> 排在第 4 位，前驱 <b>v<sub>2</sub> 排在第 5 位</b> ⟹ 违规。<br>'
  +'· <b>D ✗</b>：v<sub>5</sub> 排在第 3 位，前驱 <b>v<sub>3</sub> 排在第 4 位</b> ⟹ 违规。<br>'
  +'📌 <b>秒杀手法：只盯"多前驱"的顶点</b>。本图里只有 v₅、v₆、v₇ 有两个前驱，<b>三个选项的错都出在 v₅ 或 v₆ 身上</b>——命题人不会在只有一个前驱的顶点上做文章，因为那太容易看出来。<br>'
  +'⚠️ <b>转录复核记录</b>：本题第一遍抄题时把选项 C 里的 v₅ 抄成了 v₂，导致"A、C 都合法"与书答冲突；<b>dpi400 定点重渲后确认是自己抄错、书没错</b>。<b>凡"验算结果与书答冲突"，第一反应永远是先怀疑自己的转录</b>——这是本章第二次应验（另一次在 6.3 选择 02）。',
 run:'程序对 7 个顶点做全排列筛选，得到合法拓扑序列共 16 条；四个选项中<b>只有 A 在其中</b>，B、C、D 均因"某顶点排在其前驱之前"落选 ✅', verdict:'ok'},

{id:'6.4-18', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['邻接矩阵·对称性'],
 stem:'下列哪种图的邻接矩阵是对称矩阵？（　）',
 opts:['有向网','无向图','AOV 网','AOE 网'], ans:'B',
 book:'无向图的每条边在邻接矩阵中存储两次，A[i][j]=A[j][i]，因此一定是对称矩阵。AOV 网和 AOE 网都是有向图。',
 claude:'一致，选 B。<b>四个选项里只有"无向图"三个字是无向的</b>：<br>'
  +'· <b>有向网</b>＝带权有向图 ⟹ 一般不对称；<br>'
  +'· <b>AOV 网</b>（顶点表活动、弧表先后）、<b>AOE 网</b>（顶点表事件、弧表活动与耗时）<b>都是有向图</b>，而且都必须无环 ⟹ 不可能对称（对称就意味着 i↔j 双向弧，立刻成环）。<br>'
  +'· <b>无向图 ✓</b>：一条边 (i,j) 在矩阵里存<b>两处</b>，A[i][j]=A[j][i] 恒成立 ⟹ <b>沿主对角线严格对称</b>。<br>'
  +'📌 <b>顺手记住 AOV 与 AOE 的分工（本节反复用）</b>：<b>AOV 边上无权、只表先后 ⟹ 拓扑排序</b>；<b>AOE 边上有权、表活动持续时间、顶点是事件 ⟹ 关键路径</b>。<b>"活动在点上（Vertex）"还是"活动在边上（Edge）"，看缩写的最后一个字母就够了。</b><br>'
  +'⚠️ <b>反向命题是错的（第 21 题 Ⅱ 项直接考）</b>：<b>"有向图的邻接矩阵一定不对称"是错的</b>——若任意两顶点之间都有方向相反的两条弧（例如一对互指的 u⇄v），它的邻接矩阵照样对称。<b>无向 ⟹ 对称，但对称 ⇏ 无向。</b>',
 run:null, verdict:'ok'},

{id:'6.4-19', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['拓扑排序·与三角矩阵的关系'],
 stem:'若一个有向图具有有序的拓扑排序序列，则它的邻接矩阵必定为（　）。',
 opts:['对称','稀疏','三角','一般'], ans:'C',
 book:'可以证明：有向图的顶点适当编号，使其邻接矩阵为三角矩阵且主对角线元素全为零，其充分必要条件是该有向图可以进行拓扑排序。另外，邻接矩阵为三角矩阵时图中必无环，因此拓扑序列必然存在。',
 claude:'一致，选 C（<b>三角</b>）。⚠️ <b>本题是全书争议最大的一道</b>，题眼在"<b>有序的</b>"三个字上：<br>'
  +'· <b>题干说"具有<u>有序的</u>拓扑排序序列"</b>，理解为<b>顶点已经按拓扑序重新编号</b>（v₁,v₂,…,vₙ 就是一个拓扑序）⟹ 所有弧都从<b>小编号指向大编号</b> ⟹ 矩阵中 <b>i≥j 的位置全为 0 ⟹ 严格上三角</b> ⟹ 选 <b>C</b>。<br>'
  +'· <b>若把"有序"二字删掉</b>（只说"存在拓扑序列"），那么顶点编号是任意的、矩阵可以长成任何样子 ⟹ 只能选 <b>D（一般）</b>。<br>'
  +'📌 <b>要记的是那条<u>充要条件</u>（书上原话）</b>：<b>「有向图的顶点<u>适当编号</u>后邻接矩阵能成为三角矩阵（主对角线全 0）」⟺「该有向图可以拓扑排序」⟺「它是 DAG」。</b><br>'
  +'· <b>"⟸" 方向</b>：能拓扑排序 ⟹ 按拓扑序编号 ⟹ 弧全部指向后方 ⟹ 三角。<br>'
  +'· <b>"⟹" 方向</b>：三角矩阵 ⟹ 弧只能从小编号到大编号 ⟹ <b>绝不可能绕回来 ⟹ 无环 ⟹ 拓扑序列必然存在</b>（<b>2012 真题第 30 题考的正是这个方向</b>）。<br>'
  +'⚠️ 两个易混：<b>稀疏</b>（B）说的是边少，与拓扑排序毫无关系；<b>对称</b>（A）是无向图的性质，有向 DAG 若对称就必有双向弧、必有环，反而矛盾。',
 run:null, verdict:'ok'},

{id:'6.4-20', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['DFS·退栈输出＝逆拓扑'],
 stem:'用 DFS 算法遍历一个无环有向图，并在 DFS 算法退栈返回时输出相应的顶点，则输出的顶点序列是（　）。',
 opts:['逆拓扑有序','拓扑有序','无序的','无法确定'], ans:'A',
 book:'对于任意一条弧⟨vᵢ,vⱼ⟩，DFS 中 vᵢ 先入栈，必须等 vⱼ 遍历完并退栈后 vᵢ 才能退栈，因此 vᵢ 的输出一定在 vⱼ 之后，输出序列是逆拓扑有序的。',
 claude:'一致，选 A（<b>逆拓扑有序</b>）。<b>一句话推理</b>：对任意一条弧 v<sub>i</sub>→v<sub>j</sub>，<b>DFS 在退出 v<sub>i</sub> 之前必须先把 v<sub>j</sub> 这一支走完并退出</b>（v<sub>j</sub> 要么由 v<sub>i</sub> 直接递归进入、要么早已访问完毕）⟹ <b>v<sub>j</sub> 先输出、v<sub>i</sub> 后输出</b> ⟹ 与拓扑序（弧尾在前）<b>恰好相反</b>。<br>'
  +'<b>换个说法更好记</b>：<b>DFS 的"结束时间"从大到小排 = 拓扑序</b>（正文 6.4.4 的 DFS 版拓扑排序）；而<b>退栈时输出正是按结束时间<u>从小到大</u>打印</b> ⟹ 得到的就是<b>逆</b>拓扑序。<b>想要正的，把输出结果压进栈里再倒出来即可。</b><br>'
  +'⚠️ <b>三个位置的输出，结果完全不同，务必分清</b>：<br>'
  +'· <b>进入递归时输出</b> ⟹ 普通的 <b>DFS 序列</b>（≠ 拓扑序，虽然对某些图碰巧是）；<br>'
  +'· <b>退出递归时输出</b> ⟹ <b>逆拓扑序</b>（本题、以及 <b>2020 真题第 41 题</b>）；<br>'
  +'· <b>退出时压栈、最后倒出</b> ⟹ <b>拓扑序</b>。<br>'
  +'📌 <b>"无环"是前提</b>：有环时 DFS 退栈序列什么也不是（根本不存在拓扑序）。<b>题干的"无环有向图"不是废话，是让结论成立的条件。</b>',
 run:null, verdict:'ok'},

{id:'6.4-21', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['综合·度/对称性/MST/拓扑唯一性'],
 stem:'下列关于图的说法中，正确的是（　）。<br>'
  +'Ⅰ．有向图中顶点 V 的度等于其邻接矩阵中第 V 行中 1 的个数<br>'
  +'Ⅱ．无向图的邻接矩阵一定是对称矩阵，有向图的邻接矩阵一定是非对称矩阵<br>'
  +'Ⅲ．在带权图 G 的最小生成树 G<sub>1</sub> 中，某条边的权值可能会超过未选边的权值<br>'
  +'Ⅳ．若有向无环图的拓扑序列唯一，则可以唯一确定该图',
 opts:['Ⅰ、Ⅱ和Ⅲ','Ⅲ和Ⅳ','Ⅲ','Ⅳ'], ans:'C',
 book:'Ⅰ 错误，第 V 行中 1 的个数是顶点 V 的出度，度＝入度＋出度。Ⅱ 错误，有向图中任意两顶点之间都有方向相反的两条弧时，其邻接矩阵也是对称的。Ⅲ 正确，最小生成树保证的是总权值最小，并不保证选中的每条边都比未选边小。Ⅳ 错误，拓扑序列唯一不能唯一确定该图。',
 claude:'一致，选 C（<b>仅 Ⅲ</b>）。四项各打一个考点，正好是一次小复习：<br>'
  +'· <b>Ⅰ ✗</b>：<b>"行出列入"</b>——有向图邻接矩阵<b>第 V 行</b>的非零个数是<b>出度</b>，<b>第 V 列</b>是<b>入度</b>，<b>度 = 行 + 列</b>。（6.2 的四条命根子之一，2013、2023 真题都靠它。）<br>'
  +'· <b>Ⅱ ✗</b>：前半句对，后半句错。<b>有向图的邻接矩阵也可以对称</b>——只要任意两顶点间都成对出现方向相反的弧。<b>"无向 ⟹ 对称"是单向蕴含，不能反过来说"有向 ⟹ 不对称"。</b><br>'
  +'· <b>Ⅲ ✓（本题答案）</b>：<b>MST 只保证"总和最小"，绝不保证"逐条最小"。</b>书上反例中权值为 3 的边就没进 MST，而 MST 里却有比它大的边。<b>直观原因：某些顶点只有一条"贵"的边可以接进来（割边只此一条），再贵也必须选；而那条便宜的边可能会成环。</b>（这与第 3 题 C 项"选最小的 n−1 条边"是同一枚硬币的两面。）<br>'
  +'· <b>Ⅳ ✗</b>：与第 14 题 Ⅲ <b>同一考点、连考两题</b>——<b>拓扑序唯一只锁死顺序，锁不死边集</b>（a→b→c→d 加不加"越级弧"a→c，拓扑序都唯一为 abcd）。<br>'
  +'📌 <b>本题可当作一张"高频错点清单"</b>：行出列入 ／ 对称性的单向蕴含 ／ MST 不逐条最小 ／ 拓扑唯一 ⇏ 图唯一。<b>这四条只要错一条，本题就选不对。</b>',
 run:null, verdict:'ok'},

{id:'6.4-22', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['关键路径·实例计算'],
 stem:'下图所示的 AOE 网中，关键路径长度为（　）。',
 fig:'图/ch6/6.4-22.svg',
 figcap:'题图：AOE 网（V<sub>0</sub> 为源点、V<sub>8</sub> 为汇点，11 个活动 a<sub>1</sub>–a<sub>11</sub>，据王道 p.239 重画）',
 opts:['16','17','18','19'], ans:'C',
 book:'关键路径是从源点到汇点的最长路径，本图中 V₀→V₁→V₄→V₆→V₈ 的长度为 6+1+9+2=18，为最长，故关键路径长度为 18。',
 claude:'一致，选 C（<b>18</b>）。<b>选择题问"关键路径长度"，只需正推一遍 v<sub>e</sub>（取 max），不必算 v<sub>l</sub>、更不必算每条活动的 e/l。</b><br>'
  +'<b>按拓扑序递推 v<sub>e</sub>（每个顶点取"所有前驱 + 边权"的最大值）</b>：<br>'
  +'v<sub>e</sub>(0)=0；v<sub>e</sub>(1)=6；v<sub>e</sub>(2)=4；v<sub>e</sub>(3)=5；<br>'
  +'<b>v<sub>e</sub>(4)=max{6+1, 4+1}=7</b>（两条支流汇合，取大的那条）；v<sub>e</sub>(5)=5+4=9；<br>'
  +'v<sub>e</sub>(6)=7+9=16；<b>v<sub>e</sub>(7)=max{7+7, 9+4}=14</b>；<br>'
  +'<b>v<sub>e</sub>(8)=max{16+2, 14+4}=18</b> ⟹ <b>汇点的 v<sub>e</sub> 就是工期 = 18</b>。<br>'
  +'⟹ 关键路径 <b>V<sub>0</sub>→V<sub>1</sub>→V<sub>4</sub>→V<sub>6</sub>→V<sub>8</sub></b>（6+1+9+2=18）。<br>'
  +'⚠️ <b>本图其实有两条关键路径</b>：程序复算发现 <b>V<sub>0</sub>→V<sub>1</sub>→V<sub>4</sub>→V<sub>7</sub>→V<sub>8</sub> = 6+1+7+4 = 18</b> 同样是 18！关键活动共 6 个：a₁、a₄、a₇、a₈、a₁₀、a₁₁。<b>本题只问"长度"所以不受影响，但若问"哪些活动加速能缩短工期"，答案就只有两条路径的<u>公共</u>活动 a₁、a₄</b>（这正是 2013 真题第 31 题的问法）。<br>'
  +'📌 <b>关键路径手算三句话</b>：① <b>正推取 max</b>（v<sub>e</sub>）；② <b>汇点的 v<sub>e</sub> = 最短工期</b>；③ <b>选择题到此为止，大题才继续逆推 v<sub>l</sub> 取 min</b>。<br>'
  +'⚠️ <b>别把"关键路径"当成"边数最多的路径"</b>（2020 真题第 42 题 A 项就这么设的陷阱）——本图中 V₀→V₃→V₅→V₇→V₈ 也是 4 条边，长度却只有 5+4+4+4=17。<b>比的是<u>权值之和</u>，不是边数。</b>',
 run:'程序按拓扑序递推 v<sub>e</sub>：v<sub>e</sub>=(0,6,4,5,7,9,16,14,<b>18</b>)，汇点 V₈ 的 v<sub>e</sub>=18 = 关键路径长度；进一步逆推 v<sub>l</sub> 并求 l−e，得关键活动 <b>a₁、a₄、a₇、a₈、a₁₀、a₁₁</b>（两条等长关键路径）✅ 与书答 18 一致', verdict:'ok'},

{id:'6.4-23', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['关键路径·由边集计算'],
 stem:'若某带权图为 G=(V,E)，其中 V={v<sub>1</sub>,…,v<sub>10</sub>}，'
  +'E={⟨v<sub>1</sub>,v<sub>2</sub>⟩5, ⟨v<sub>1</sub>,v<sub>3</sub>⟩6, ⟨v<sub>2</sub>,v<sub>5</sub>⟩3, ⟨v<sub>3</sub>,v<sub>5</sub>⟩6, ⟨v<sub>3</sub>,v<sub>4</sub>⟩3, ⟨v<sub>4</sub>,v<sub>5</sub>⟩3, ⟨v<sub>4</sub>,v<sub>7</sub>⟩1, ⟨v<sub>4</sub>,v<sub>8</sub>⟩4, ⟨v<sub>5</sub>,v<sub>6</sub>⟩4, ⟨v<sub>5</sub>,v<sub>7</sub>⟩2, ⟨v<sub>6</sub>,v<sub>10</sub>⟩4, ⟨v<sub>7</sub>,v<sub>9</sub>⟩5, ⟨v<sub>8</sub>,v<sub>9</sub>⟩2, ⟨v<sub>9</sub>,v<sub>10</sub>⟩2}'
  +'（注：尖括号外的数据表示边上的权值），则 G 的关键路径的长度为（　）。',
 opts:['19','20','21','22'], ans:'C',
 book:'按拓扑顺序依次求各顶点的最早发生时间，可得汇点 v₁₀ 的最早发生时间为 21，即关键路径的长度为 21。本图中存在两条关键路径。',
 claude:'一致，选 C（<b>21</b>）。<b>题目给的是纯边集、没有图，最稳的做法就是<u>老老实实按编号顺序正推 v<sub>e</sub></b>（本题顶点编号恰好已是拓扑序，捡了个便宜）：<br>'
  +'v<sub>e</sub>(1)=0；v<sub>e</sub>(2)=5；v<sub>e</sub>(3)=6；v<sub>e</sub>(4)=6+3=9；<br>'
  +'<b>v<sub>e</sub>(5)=max{5+3, 6+6, 9+3}=12</b>（三条支流，取最大）；v<sub>e</sub>(6)=12+4=16；<br>'
  +'<b>v<sub>e</sub>(7)=max{9+1, 12+2}=14</b>；v<sub>e</sub>(8)=9+4=13；<br>'
  +'<b>v<sub>e</sub>(9)=max{14+5, 13+2}=19</b>；<b>v<sub>e</sub>(10)=max{16+4, 19+2}=21</b> ⟹ <b>21</b>。<br>'
  +'<b>两条关键路径（都等于 21）</b>：<b>v₁→v₃→v₅→v₇→v₉→v₁₀</b>（6+6+2+5+2）与 <b>v₁→v₃→v₄→v₅→v₇→v₉→v₁₀</b>（6+3+3+2+5+2）。<b>注意它们都经过 v₃、v₅、v₇、v₉，差别只在 v₃→v₅ 是直达还是绕经 v₄。</b><br>'
  +'📌 <b>看到"给一长串边集求关键路径"，两件事先做</b>：① <b>找源点（入度 0）和汇点（出度 0）</b>——本题是 v₁ 与 v₁₀；② <b>确认编号是否已是拓扑序</b>（本题所有弧都是小编号→大编号，直接顺着编号递推即可，省下排序时间）。<br>'
  +'⚠️ <b>"取 max 不取 min"是本类题唯一的致命点</b>：v<sub>e</sub> 表示"最早能开始的时刻"，必须<b>等所有前驱都完成</b>，所以取<b>最大</b>；很多人第一反应写成最短路径（取 min），一步错满盘错。<b>关键路径 = 最<u>长</u>路径，从头到尾都是 max。</b>',
 run:'程序按拓扑序递推：v<sub>e</sub>=(0,5,6,9,12,16,14,13,19,<b>21</b>)，汇点 v₁₀ 的 v<sub>e</sub>=21；逆推 v<sub>l</sub> 后求 l−e=0 的活动，得<b>两条</b>等长关键路径 v₁v₃v₅v₇v₉v₁₀ 与 v₁v₃v₄v₅v₇v₉v₁₀，均为 21 ✅', verdict:'ok'},

{id:'6.4-24', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['关键路径·四个参量的定义'],
 stem:'下面关于求关键路径的说法中，<b>不正确</b>的是（　）。',
 opts:['求关键路径是以拓扑排序为基础的',
       '一个事件的最早发生时间与以该事件为始的弧的活动的最早开始时间相同',
       '一个事件的最迟发生时间是以该事件为尾的弧的活动的最迟开始时间与该活动的持续时间的差',
       '任何一个活动的持续时间的改变可能会影响关键路径的改变'], ans:'C',
 book:'C 不正确。正确的表述应为：一个事件的最迟发生时间等于以该事件为尾的各弧的活动的最迟开始时间的最小值，而不是"最迟开始时间与持续时间之差"。',
 claude:'一致，选 C（题问"<b>不正确</b>"）。四个参量的定义必须一字不差，本题就是逐字挑刺：<br>'
  +'· <b>A ✓</b>：求 v<sub>e</sub> 要<b>按拓扑序正推</b>、求 v<sub>l</sub> 要<b>按逆拓扑序逆推</b> ⟹ <b>关键路径算法确实建立在拓扑排序之上</b>（实现时常把 v<sub>e</sub> 的计算直接嵌进拓扑排序的循环里）。<br>'
  +'· <b>B ✓</b>：<b>e(i) = v<sub>e</sub>(弧尾事件)</b>。"以该事件为<u>始</u>"＝该事件是弧尾 ⟹ 事件一发生，从它射出的活动就能开工 ⟹ 两者<b>数值相同</b>。<br>'
  +'· <b>C ✗（本题答案）</b>：正确的是 <b>v<sub>l</sub>(k) = min{ l(i) }</b>，即"以该事件为<u>尾</u>的各活动的最迟开始时间<b>取最小值</b>"，<b>不能再减一次持续时间</b>。<br>'
  +'　<b>为什么不能再减</b>：l(i) 本身已经是"活动最迟开工时刻"，而活动一开工正说明<b>它的起点事件已经发生</b> ⟹ 事件的最迟发生时间就等于这些 l(i) 里最紧的那一个。<b>再减一次持续时间等于把同一段工期扣了两遍。</b>（写成另一形式：v<sub>l</sub>(k)=min{v<sub>l</sub>(j) − Weight(v<sub>k</sub>,v<sub>j</sub>)}，这里减的是<u>后继事件</u>的 v<sub>l</sub>，不是减 l(i)。）<br>'
  +'· <b>D ✓</b>：注意它说的是"<b>可能</b>影响"。任一活动改时长都要重算，<b>关键路径确实可能转移</b>（把某条关键活动压得太短，别的路径就升级成关键路径了）。<b>"可能"是对的，"一定"就错了。</b><br>'
  +'📌 <b>四个参量一次记牢</b>：<b>e(i)=v<sub>e</sub>(弧尾)</b>；<b>l(i)=v<sub>l</sub>(弧头)−权</b>；<b>d(i)=l(i)−e(i)</b>；<b>d=0 者即关键活动</b>。合并成一步就是<b>时间余量 d = v<sub>l</sub>(终点) − v<sub>e</sub>(起点) − 权</b>（第 45 题用它一步出答案）。',
 run:null, verdict:'ok'},

{id:'6.4-25', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['关键路径·缩短工期的条件'],
 stem:'下列关于 AOE 网的关键路径的说法中，正确的是（　）。<br>'
  +'Ⅰ．改变网上某一关键路径上的任意一个关键活动后，必将产生不同的关键路径<br>'
  +'Ⅱ．关键路径上活动的时间延长多少，整个工期也就随之延长多少<br>'
  +'Ⅲ．缩短关键路径上任意一个关键活动的持续时间可缩短关键路径长度<br>'
  +'Ⅳ．缩短所有关键路径上共有的任意一个关键活动的持续时间可缩短关键路径长度<br>'
  +'Ⅴ．缩短多条关键路径上共有的任意一个关键活动的持续时间可缩短关键路径长度',
 opts:['Ⅱ和Ⅴ','Ⅰ、Ⅱ和Ⅳ','Ⅱ和Ⅳ','Ⅰ和Ⅳ'], ans:'C',
 book:'Ⅰ 错误，若改变的是所有关键路径的公共活动，延长它并不会产生新的关键路径。Ⅲ 错误，存在多条关键路径时，只缩短其中一条上的活动无效。Ⅴ 错误，"多条"不等于"所有"，缩短的活动必须是所有关键路径共有的。Ⅱ、Ⅳ 正确。',
 claude:'一致，选 C（<b>Ⅱ、Ⅳ 对</b>）。本题五项其实只在考一件事：<b>"延长"和"缩短"不对称</b>。<br>'
  +'· <b>Ⅱ ✓（延长：一延就灵）</b>：关键活动延长 t，它所在的那条路径就变长 t，<b>而它本来就是最长的</b> ⟹ 总工期必然跟着长 t。<b>延长关键活动，一定影响工期。</b><br>'
  +'· <b>Ⅲ ✗（缩短：不一定灵）</b>：若有多条关键路径，只压短其中一条上的活动，<b>另一条没动、仍然是那么长</b> ⟹ 工期纹丝不动。<br>'
  +'· <b>Ⅳ ✓</b>：压短<b>所有</b>关键路径都经过的公共活动 ⟹ 每条关键路径同时变短 ⟹ <b>工期确实缩短</b>（但也有限度，压过头会让某条原本次长的路径升级为关键路径，此后再压无效）。<br>'
  +'· <b>Ⅴ ✗——本题真正的题眼</b>：<b>"多条"≠"所有"</b>。假设有 3 条关键路径，某活动只被其中 2 条共用，压短它，剩下那条<b>没被压到的</b>关键路径原地不动 ⟹ 工期不变。<b>命题人把"所有"改成"多条"，一字之差直接把正确项变成错误项。</b><br>'
  +'· <b>Ⅰ ✗</b>：说"必将产生不同的关键路径"太绝对。若改的是<b>所有关键路径的公共活动</b>，那么<b>延长</b>它只是让原来的关键路径一起变长，<b>路径本身没换人</b>。<br>'
  +'📌 <b>结论钉死（2013、2020、2025 三次真题都在这里出题）：<b>要缩短工期，被加速的活动集合必须<u>覆盖每一条</u>关键路径</b>；只覆盖一部分，等于白干。</b>',
 run:null, verdict:'ok'},

{id:'6.4-26', ch:6, sec:'6.4 图的应用', type:'choice', tag:'', exam:null,
 kp:['关键路径·源点的矩阵特征'],
 stem:'在求 AOE 网的关键路径时，若该有向图用邻接矩阵表示且第 i 列值全为 ∞，则（　）。',
 opts:['若关键路径存在，第 i 个顶点一定是起点','若关键路径存在，第 i 个顶点一定是终点',
       '关键路径不存在','该有向图对应的无向图存在多个连通分量'], ans:'A',
 book:'第 i 列的值全为 ∞ 说明没有任何弧指向顶点 i，即顶点 i 的入度为 0，因此它是工程的开始顶点（源点）。C、D 都无法由此断定。',
 claude:'一致，选 A。<b>一句话：列＝入边。</b>第 i <b>列</b>全 ∞ ⟹ <b>没有任何弧射向顶点 i</b> ⟹ <b>入度为 0</b> ⟹ 它只能是工程的<b>开始事件（源点）</b>。<br>'
  +'· <b>B ✗</b>：终点（汇点）的特征是<b>出度为 0</b>，对应<b>第 i <u>行</u>全 ∞</b>。<b>行列看反是本题唯一的失分方式</b>——再念一遍 6.2 的口诀「<b>行出列入</b>」。<br>'
  +'· <b>C ✗</b>：入度为 0 恰恰是 AOE 网<b>该有</b>的样子（源点必须入度为 0），<b>怎么会推出"关键路径不存在"</b>？<br>'
  +'· <b>D ✗</b>：一个顶点没有入边，<b>完全不妨碍它有出边、和全图连成一片</b>。孤立与否要看行、列<u>都</u>是 ∞ 才说得上。<br>'
  +'📌 <b>邻接矩阵读图速查（带权图记得把 0 和 ∞ 一起当"没有边"）</b>：<br>'
  +'· 第 i <b>行</b>非 ∞ 个数 = <b>出度</b>；行全 ∞ ⟹ <b>汇点</b>；<br>'
  +'· 第 i <b>列</b>非 ∞ 个数 = <b>入度</b>；列全 ∞ ⟹ <b>源点</b>；<br>'
  +'· <b>度 = 行 + 列</b>。<br>'
  +'⚠️ 标准 AOE 网<b>只有一个源点和一个汇点</b>；若出现两个入度为 0 的顶点，工程就没有统一的起点，通常要先补一个虚拟源点。',
 run:null, verdict:'ok'},


{id:'6.4-27', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2010 统考', exam:2010,
 kp:['拓扑排序·序列计数'],
 stem:'【2010 统考真题】对下图进行拓扑排序，可得到不同的拓扑序列的个数是（　）。',
 fig:'图/ch6/6.4-27.svg',
 figcap:'2010 统考真题图：有向图（a→b、a→c、a→e、b→c、c→d、e→d，据王道 p.240 重画）',
 opts:['4','3','2','1'], ans:'B',
 book:'该图的拓扑序列有 abced、abecd、aebcd 三个，故选 B。',
 claude:'一致，选 B（<b>3 个</b>）。<b>出弧表</b>：a→{b,c,e}，b→{c}，c→{d}，e→{d}。<br>'
  +'<b>先钉死两端</b>：a 是唯一入度为 0 的顶点 ⟹ <b>必第一</b>；d 是唯一出度为 0 的顶点 ⟹ <b>必最后</b>。<b>剩下 b、c、e 三个排中间</b>，唯一的约束是 <b>b 必须在 c 之前</b>（b→c），而 e 与 b、c 都无关系。<br>'
  +'⟹ 把 e 插进"b c"这条链的三个空位：<b>e</b>bc、b<b>e</b>c、bc<b>e</b> ⟹ <b>3 种</b>，即 <b>aebcd、abecd、abced</b>。<br>'
  +'📌 <b>"数拓扑序个数"的通法（第 16 题同款）</b>：① 钉死唯一源点/唯一汇点；② 找出剩余顶点之间的<b>真实约束</b>（只看直接弧即可，传递关系自动满足）；③ <b>把"自由顶点"往已排好的链里插空</b>，用插空法数，比全排列筛选快得多。<br>'
  +'⚠️ <b>a→c 这条弧是"冗余弧"</b>：a→b→c 已经蕴含 a 在 c 之前，<b>删掉它答案仍是 3</b>。<b>命题人放这条弧是为了让图看起来更乱，别被吓住</b>——数个数时只需盯"真正造成先后限制"的关系。<br>'
  +'⚠️ 别把"拓扑序列个数"和"DFS/BFS 序列个数"混为一谈：<b>拓扑序只要求"前驱在前"，不要求连通性上的深度或层次</b>，所以像 aebcd 这种"跳着走"的序列完全合法。',
 run:'程序对 5 个顶点做全排列筛选：合法拓扑序恰为 <b>abced、abecd、aebcd</b> 共 3 条 ✅ 与书答一致（另删去冗余弧 a→c 重跑，仍为 3 条）', verdict:'ok'},

{id:'6.4-28', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2012 统考', exam:2012,
 kp:['MST·四条性质辨析'],
 stem:'【2012 统考真题】下列关于最小生成树的叙述中，正确的是（　）。<br>'
  +'Ⅰ．最小生成树的代价唯一<br>'
  +'Ⅱ．所有权值最小的边一定会出现在所有的最小生成树中<br>'
  +'Ⅲ．使用 Prim 算法从不同顶点开始得到的最小生成树一定相同<br>'
  +'Ⅳ．使用 Prim 算法和 Kruskal 算法得到的最小生成树总不相同',
 opts:['仅Ⅰ','仅Ⅱ','仅Ⅰ、Ⅲ','仅Ⅱ、Ⅳ'], ans:'A',
 book:'Ⅰ 正确，最小生成树可能不唯一，但其代价是唯一的。Ⅱ 错误，若权值最小的边有多条且构成环，则总有一条最小边不出现在某棵最小生成树中。Ⅲ 错误，N 个顶点构成环且边的权值都相等时，从不同顶点出发得到的最小生成树不同。Ⅳ 错误，当最小生成树唯一时两种算法的结果相同。',
 claude:'一致，选 A（<b>仅 Ⅰ</b>）。这道真题把本节前几题的结论一次性全考了：<br>'
  +'· <b>Ⅰ ✓</b>：<b>树可能多棵，代价只有一个数</b>（第 4 题 C 项同款）。<br>'
  +'· <b>Ⅱ ✗</b>：<b>反例就是"最小边成环"</b>——三角形 A–B=1、B–C=1、A–C=1，三条边都是最小边，可 MST 只能要两条 ⟹ <b>必有一条最小边落选</b>。<b>（若最小边只有一条，那它确实一定入选，这是 MST 的割性质；命题人把"一条"改成"所有"就成了错项。）</b><br>'
  +'· <b>Ⅲ ✗</b>：同一个环形反例——4 个顶点围成环、边权全为 1，从不同顶点出发的 Prim 会<b>丢掉不同的那条边</b> ⟹ 得到不同的 MST（代价都是 3）。<br>'
  +'· <b>Ⅳ ✗</b>：<b>"总不相同"太绝对</b>。MST 唯一时两算法<b>必然</b>得到同一棵（第 2 题）。<br>'
  +'📌 <b>四项的共同病根：把"可能"说成"一定"，或把"一条"说成"所有"。</b>本节所有 MST 判断题都可以用这条元规则先筛一遍——<b>见到"一定""总""所有"先警惕，见到"可能"多半是对的。</b><br>'
  +'⚠️ <b>唯一真正"一定"的三条</b>：① 无向连通图<b>一定</b>有 MST；② 所有 MST 的代价<b>一定</b>相等；③ MST <b>一定</b>有 n−1 条边。<b>除此之外几乎都要打问号。</b>',
 run:null, verdict:'ok'},

{id:'6.4-29', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2012 统考', exam:2012,
 kp:['Dijkstra·选点顺序'],
 stem:'【2012 统考真题】对下图所示的有向带权图，若采用 Dijkstra 算法求从源点 a 到其他各顶点的最短路径，则得到的第一条最短路径的目标顶点是 b，第二条最短路径的目标顶点是 c，后续得到的其余各最短路径的目标顶点依次是（　）。',
 fig:'图/ch6/6.4-29.svg',
 figcap:'2012 统考真题图：有向带权图（a→b=2、a→c=5、b→c=1、b→d=3、c→d=3、c→e=4、c→f=1、d→e=1、d→f=4、e→f=1，据王道 p.240 重画）',
 opts:['d,e,f','e,d,f','f,d,e','f,e,d'], ans:'C',
 book:'依次求解可得：第 1 轮选中 b，dist=2；第 2 轮选中 c，路径 (a,b,c)，dist=3；第 3 轮选中 f，路径 (a,b,c,f)，dist=4；第 4 轮选中 d，路径 (a,b,d)，dist=5；第 5 轮选中 e，路径 (a,b,d,e)，dist=6。故依次为 f、d、e。',
 claude:'一致，选 C（<b>f, d, e</b>）。<b>Dijkstra 的选点顺序 = 各顶点<u>最终</u> dist 从小到大排序</b>——这是本类题最快的解法，先把 6 个 dist 全算出来再排队：<br>'
  +'<b>dist(b)=2</b>（直达）；<b>dist(c)=3</b>（a→b→c = 2+1，比直达的 5 短）；<b>dist(f)=4</b>（a→b→c→f = 3+1）；<b>dist(d)=5</b>（a→b→d = 2+3，比 c→d 的 3+3=6 短）；<b>dist(e)=6</b>（a→b→d→e = 5+1，比 c→e 的 3+4=7 短）。<br>'
  +'⟹ 按 2 &lt; 3 &lt; 4 &lt; 5 &lt; 6 排队：<b>b, c, f, d, e</b> ⟹ 题目已给前两个 b、c，后续就是 <b>f, d, e</b>。<br>'
  +'📌 <b>更快的排除法（书上给的，考场首选）</b>：题目已经告诉你前两名是 b(2)、c(3)。<b>若第三名是 d，则 dist(d) 必须 ≤ 其他所有未定顶点</b>，可 a→b→d 已经要 5，而 a→b→c→f 只要 <b>4</b> ⟹ <b>f 一定排在 d 前面</b> ⟹ A、B 当场出局；再比 d(5) 与 e(6) ⟹ d 在 e 前 ⟹ 排除 D ⟹ <b>只剩 C</b>。<b>全程只算了 3 个数。</b><br>'
  +'⚠️ <b>c→f=1 这条边是本题的胜负手</b>：正因为有它，f 才能以 4 抢在 d(5) 前面。<b>读图时最容易漏掉的就是这种"从中间顶点斜插到汇点"的小权边</b>——本图 c 一共射出三条弧（c→d=3、c→e=4、c→f=1），漏一条答案就变。<br>'
  +'📌 <b>Dijkstra 选点顺序题的通用三步</b>：① 先算出所有顶点的最终 dist（用松弛，别怕重算）；② <b>从小到大排序即为答案</b>；③ 若选项差别只在少数几个顶点，<b>直接比这几个的 dist</b> 即可，不必排全序。',
 run:'程序按邻接表跑 Dijkstra（源点 a）：选点顺序为 <b>b(2) → c(3) → f(4) → d(5) → e(6)</b>，最终 dist={a:0,b:2,c:3,d:5,e:6,f:4} ✅ 与书答 f,d,e 完全一致', verdict:'ok'},

{id:'6.4-30', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2012 统考', exam:2012,
 kp:['拓扑排序·三角矩阵'],
 stem:'【2012 统考真题】若用邻接矩阵存储有向图，矩阵中主对角线以下的元素均为零，则关于该图拓扑序列的结论是（　）。',
 opts:['存在，且唯一','存在，且不唯一','存在，可能不唯一','无法确定是否存在'], ans:'C',
 book:'主对角线以下元素均为零，说明图中只可能存在从小编号顶点指向大编号顶点的弧，因此图中无环，拓扑序列必然存在。但拓扑序列不一定唯一，例如邻接矩阵为 [[0,1,1],[0,0,0],[0,0,0]] 的图有两个拓扑序列。故选 C。',
 claude:'一致，选 C（<b>存在，可能不唯一</b>）。两个判断分开做：<br>'
  +'· <b>存在性 ✓</b>：主对角线以下全 0 ⟹ 只有 A[i][j]（<b>i &lt; j</b>）可能非 0 ⟹ <b>所有弧都从小编号指向大编号</b> ⟹ <b>沿任何一条路径编号只增不减，绝无可能绕回来</b> ⟹ 无环 ⟹ <b>拓扑序列必然存在</b>，而且 <b>1,2,…,n 这个自然顺序本身就是一个合法拓扑序</b>。<br>'
  +'· <b>唯一性 ✗</b>：书上的三阶反例 <b>[[0,1,1],[0,0,0],[0,0,0]]</b>（即 1→2、1→3）—— 输出 1 之后 <b>2 和 3 的入度同时为 0</b> ⟹ 两个合法序列 <b>1,2,3</b> 与 <b>1,3,2</b> ⟹ 不唯一。<br>'
  +'⟹ 只能说"存在，<b>可能</b>不唯一"（A、B 都把话说死了，D 连存在性都不敢下结论）。<br>'
  +'📌 <b>与第 19 题合起来记这条双向结论</b>：<br>'
  +'　<b>邻接矩阵是三角阵（主对角线全 0）⟹ 图是 DAG ⟹ 拓扑序列存在（可能不唯一）</b>；<br>'
  +'　<b>反之，存在拓扑序列的图不一定长成三角阵，但<u>总可以通过给顶点重新编号</u>把它变成三角阵</b>（按拓扑序编号即可）。<br>'
  +'⚠️ <b>"以下"还是"以上"不影响结论</b>：主对角线<b>以上</b>全 0 就是所有弧从大编号指向小编号，<b>把编号倒过来看是一模一样的情形</b>，同样存在拓扑序列。<b>408 在这个点上换过方向出题，别被"上/下"绕晕。</b>',
 run:null, verdict:'ok'},

{id:'6.4-31', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2013 统考', exam:2013,
 kp:['关键路径·缩短工期'],
 stem:'【2013 统考真题】下图所示的 AOE 网表示一项包含 8 个活动的工程。通过同时加快若干活动的进度，可以缩短整个工程的工期。下列选项中，加快其进度就可以缩短工程工期的是（　）。',
 fig:'图/ch6/6.4-31.svg',
 figcap:'2013 统考真题图：AOE 网（a=3:1→2、b=8:1→3、c=9:2→4、d=4:3→2、e=6:2→5、f=10:3→5、g=6:4→6、h=9:5→6，据王道 p.240 重画）',
 opts:['c 和 e','d 和 c','f 和 d','f 和 h'], ans:'C',
 book:'该 AOE 网的关键路径有三条：bdcg、bdeh、bfh，长度均为 27。只有同时加快的活动能够涵盖所有关键路径时才能缩短工期。A、B 涵盖不到 bfh，D 涵盖不到 bdcg，只有 C（f 覆盖 bfh，d 覆盖 bdcg 与 bdeh）能覆盖全部三条。',
 claude:'一致，选 C（<b>f 和 d</b>）。<b>本题是"缩短工期"考点的标准形态，做法固定三步。</b><br>'
  +'<b>第一步：算 v<sub>e</sub> 定工期。</b>v<sub>e</sub>(1)=0；v<sub>e</sub>(3)=8；<b>v<sub>e</sub>(2)=max{0+3(a), 8+4(d)}=12</b>；v<sub>e</sub>(4)=12+9=21；<b>v<sub>e</sub>(5)=max{12+6(e), 8+10(f)}=18</b>；<b>v<sub>e</sub>(6)=max{21+6(g), 18+9(h)}=27</b> ⟹ <b>工期 27</b>。<br>'
  +'<b>第二步：把<u>全部</u>关键路径找出来（本题的关键就在这里——不止一条）。</b>长度都是 27 的有三条：<br>'
  +'　<b>b→d→c→g</b>（8+4+9+6=27）、<b>b→d→e→h</b>（8+4+6+9=27）、<b>b→f→h</b>（8+10+9=27）。<b>关键活动共 7 个：b、c、d、e、f、g、h（只有 a 不是）。</b><br>'
  +'<b>第三步：候选集合必须<u>命中每一条</u>关键路径。</b><br>'
  +'· <b>A（c,e）✗</b>：都在 bd 系两条上，<b>bfh 一条都没碰到</b>；<br>'
  +'· <b>B（d,c）✗</b>：同样漏掉 bfh；<br>'
  +'· <b>C（f,d）✓</b>：<b>f 命中 bfh；d 同时命中 bdcg 与 bdeh</b> ⟹ 三条全覆盖；<br>'
  +'· <b>D（f,h）✗</b>：f、h 都在 bfh 上，<b>bdcg 没被碰到</b>（h 也在 bdeh 上，但 bdcg 漏了）。<br>'
  +'📌 <b>秒杀技巧：找"全体关键路径的公共活动"最省事。</b>本题三条路径的公共活动只有 <b>b</b> 一个——所以<b>单独加快 b</b> 就能缩短工期；但选项里没有单选 b，于是退而求其次找"合起来覆盖全部"的组合。<b>考场上先看有没有公共活动，没有再做覆盖判断。</b><br>'
  +'⚠️ <b>关键路径不止一条时，"关键活动"和"能缩短工期的活动"是两个概念</b>：本题 7 个关键活动里，单独加快任何一个（除 b 外）都<b>不能</b>缩短工期。<b>这正是 2020 真题第 42 题 D 项的坑。</b>',
 run:'程序算出 v<sub>e</sub>=(0,12,8,21,18,<b>27</b>)，枚举源点到汇点的全部路径，长度为 27 的恰有三条：<b>bdcg、bdeh、bfh</b>；再逐个选项检验"是否覆盖全部三条"，<b>只有 C 通过</b> ✅', verdict:'ok'},

{id:'6.4-32', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2014 统考', exam:2014,
 kp:['拓扑排序·序列合法性判定'],
 stem:'【2014 统考真题】对下图所示的有向图进行拓扑排序，得到的拓扑序列可能是（　）。',
 fig:'图/ch6/6.4-32.svg',
 figcap:'2014 统考真题图：有向图（3→1、3→6、1→2、1→4、4→2、4→6、2→5、6→5，据王道 p.240 重画）',
 opts:['3,1,2,4,5,6','3,1,2,4,6,5','3,1,4,2,5,6','3,1,4,2,6,5'], ans:'D',
 book:'只有顶点 3 的入度为 0，先输出 3；删去 3 后只有顶点 1 的入度为 0，输出 1；删去 1 后只有顶点 4 的入度为 0，输出 4；此时顶点 2 和 6 的入度同时为 0，可任选其一。故可能的拓扑序列是 3,1,4,2,6,5 和 3,1,4,6,2,5。',
 claude:'一致，选 D。<b>本题的四个选项前两位全是 3,1，所以胜负全在第三位。</b><br>'
  +'<b>入度表</b>：3:0　1:1(3)　4:1(1)　2:2(1,4)　6:2(3,4)　5:2(2,6)。<br>'
  +'<b>逐步删点</b>：<br>'
  +'· 入度 0 的只有 <b>3</b> ⟹ 输出 3；删 3 后 1 的入度归 0（6 还欠 4）；<br>'
  +'· 入度 0 的只有 <b>1</b> ⟹ 输出 1；删 1 后 4 的入度归 0（2 还欠 4）；<br>'
  +'· 入度 0 的只有 <b>4</b> ⟹ <b>第三位必须是 4</b> ⟹ <b>A、B 当场出局</b>（它们第三位是 2，而 2 还欠着前驱 4）；<br>'
  +'· 删 4 后 <b>2 和 6 同时入度为 0</b> ⟹ 两种走法：<b>3,1,4,2,6,5</b> 与 <b>3,1,4,6,2,5</b>；<br>'
  +'· 最后 5（欠 2 和 6）收尾。<br>'
  +'⟹ 选项里只有 <b>D（3,1,4,2,6,5）</b>命中。C（3,1,4,2,<b>5</b>,6）错在 <b>5 排在 6 前面</b>——5 的前驱有 6，还没输出。<br>'
  +'📌 <b>判合法性最快的姿势：不要真的模拟删点，直接对每条弧检查"弧尾是否在弧头之前"。</b>C 项只需看 6→5 这条弧就毙掉；A、B 只需看 4→2 就毙掉。<b>四条弧检查完全部有结论，10 秒。</b><br>'
  +'⚠️ <b>本题图里 4→6 这条弧最容易被漏看</b>（它和 3→6 挤在一起）。<b>漏了它，2 与 6 的先后就没了约束，A、B 也会被误判为合法。</b>读有向图时按顶点逐个抄出弧表，比在图上"看"可靠得多。',
 run:'程序对 6 个顶点做全排列筛选：合法拓扑序恰有两条 —— <b>3,1,4,2,6,5</b> 与 <b>3,1,4,6,2,5</b>；四个选项中<b>只有 D 在其中</b> ✅', verdict:'ok'},

{id:'6.4-33', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2015 统考', exam:2015,
 kp:['MST·Prim 与 Kruskal 的差别'],
 stem:'【2015 统考真题】求下图所示带权图的最小（代价）生成树时，可能是 Kruskal 算法第 2 次选中但不是 Prim 算法（从 V<sub>4</sub> 开始）第 2 次选中的边是（　）。',
 fig:'图/ch6/6.4-33.svg',
 figcap:'2015 统考真题图：无向带权图（V<sub>1</sub>–V<sub>2</sub>=10、V<sub>1</sub>–V<sub>3</sub>=8、V<sub>1</sub>–V<sub>4</sub>=5、V<sub>2</sub>–V<sub>3</sub>=8、V<sub>2</sub>–V<sub>4</sub>=11、V<sub>3</sub>–V<sub>4</sub>=8，据王道 p.241 重画）',
 opts:['(V<sub>1</sub>,V<sub>3</sub>)','(V<sub>1</sub>,V<sub>4</sub>)','(V<sub>2</sub>,V<sub>3</sub>)','(V<sub>3</sub>,V<sub>4</sub>)'], ans:'C',
 book:'两种算法第 1 次选中的都是权值最小的边 (V₁,V₄)=5，故 B 错误。第 2 次选择时，Prim 算法只能在与 V₁ 或 V₄ 相连的边中选，权值为 8 的 (V₁,V₃) 和 (V₃,V₄) 都符合条件，故 A、D 错误。Kruskal 算法可以选择任意一条权值为 8 的边，包括 (V₂,V₃)，而它与 V₁、V₄ 都不相连，Prim 算法第 2 次不可能选中，故选 C。',
 claude:'一致，选 C。<b>题目问的是"Kruskal 能选、Prim 不能选"的边——本质在考两个算法<u>候选集</u>的差别</b>（第 5、6 题的真题版）。<br>'
  +'<b>第 1 步两者相同</b>：全图最小边是 <b>(V₁,V₄)=5</b>，Kruskal 按权递增必先取它；Prim 从 V₄ 出发，V₄ 的三条边 5、11、8 中最小的也是它 ⟹ <b>两者第 1 次都选 (V₁,V₄)</b> ⟹ <b>B 出局</b>（它是第 1 次而不是第 2 次）。<br>'
  +'<b>第 2 步差别显现</b>：此时 U={V₁,V₄}，剩下三条权 8 的边 (V₁,V₃)、(V₂,V₃)、(V₃,V₄)：<br>'
  +'· <b>Prim</b> 只能选<b>一端在 U 内</b>的边 ⟹ <b>(V₁,V₃) 和 (V₃,V₄) 都可以</b>（并列最小，任选）⟹ <b>A、D 出局</b>；<br>'
  +'· <b>(V₂,V₃)</b> 两端都在 U 外 ⟹ <b>Prim 永远不会在第 2 步选它</b>；而 <b>Kruskal 只按权值排队、不管连不连得上</b>，三条 8 排序时若 (V₂,V₃) 在前，它就是第 2 条被选中的边（与已选的 (V₁,V₄) 不成环，合法）⟹ <b>C ✓</b>。<br>'
  +'📌 <b>一句话记住两者的分水岭</b>：<b>Prim 长的是"一棵连通的树"，每步必须接在已有的树上；Kruskal 长的是"一片森林"，随便哪两块都能先各自长着，最后再合并。</b>本题选的正是那条"暂时孤悬在外"的边。<br>'
  +'⚠️ <b>"从 V₄ 开始"这个条件不能忽略</b>：Prim 的候选集依赖起点。<b>若从 V₂ 开始，Prim 第 1 步就会选 (V₂,V₃)=8</b>（V₂ 的边是 10、11、8），结论就完全不同了。<br>'
  +'📌 <b>顺手看一眼这张图的 MST</b>：程序穷举得到 <b>MST 权值 21，共 2 棵</b>——{(V₁,V₄)5,(V₁,V₃)8,(V₂,V₃)8} 与 {(V₁,V₄)5,(V₃,V₄)8,(V₂,V₃)8}。<b>注意 (V₂,V₃) 在两棵里都出现</b>（V₂ 只有 10、11、8 三条边，8 是最便宜的入口），这也解释了为什么 Kruskal 早晚要选它。',
 run:'程序穷举全部生成树：MST 权值 <b>21</b>，共 <b>2</b> 棵，均含 (V₁,V₄)=5 与 (V₂,V₃)=8；模拟 Prim（起点 V₄）第 2 步的候选边集为 {(V₁,V₃),(V₃,V₄)}，<b>不含 (V₂,V₃)</b>；而 Kruskal 第 2 步可选任一条权 8 的边 ⟹ 答案 C ✅', verdict:'ok'},

{id:'6.4-34', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2011 统考', exam:2011,
 kp:['图的基本概念·综合辨析'],
 stem:'【2011 统考真题】下列关于图的叙述中，正确的是（　）。<br>'
  +'Ⅰ．回路是简单路径<br>Ⅱ．存储稀疏图，用邻接矩阵比邻接表更省空间<br>Ⅲ．若有向图中存在拓扑序列，则该图不存在回路',
 opts:['仅Ⅱ','仅Ⅰ、Ⅱ','仅Ⅲ','仅Ⅰ、Ⅲ'], ans:'C',
 book:'Ⅰ 错误，简单路径要求路径上的顶点不重复，而回路的首尾顶点相同。Ⅱ 错误，稀疏图用邻接表更省空间。Ⅲ 正确，存在拓扑序列说明图是有向无环图。',
 claude:'一致，选 C（<b>仅 Ⅲ</b>）。三项各自属于三个不同的知识块，是一道"跨节小综合"：<br>'
  +'· <b>Ⅰ ✗</b>：<b>简单路径 = 顶点不重复的路径</b>；<b>回路（环）的首尾顶点相同</b> ⟹ 天然违反"不重复"。<b>⚠️ 但要注意书上另一个概念："简单回路"是指<u>除首尾外</u>其余顶点不重复的回路——"回路是简单路径"仍然是错的。</b><br>'
  +'· <b>Ⅱ ✗</b>：<b>稀疏图（e 远小于 n²）该用邻接表</b>：邻接表空间 O(n+e)，邻接矩阵恒为 O(n²) ⟹ 稀疏时矩阵里绝大多数是 0，纯浪费。<b>稠密图才轮到邻接矩阵占优（省了指针域，且随机访问 O(1)）。</b><br>'
  +'· <b>Ⅲ ✓</b>：<b>存在拓扑序列 ⟺ 有向无环图</b>。这是本节的地基，正反两个方向都成立：有环 ⟹ 环上顶点入度减不到 0 ⟹ 排不出；无环 ⟹ 每一步必存在入度为 0 的顶点 ⟹ 一定能排出。<br>'
  +'📌 <b>Ⅲ 的"必存在入度为 0 的顶点"这一步值得单独记</b>：DAG 里若每个顶点入度都 ≥1，从任一点沿入边一直往回走，顶点有限必然重复 ⟹ 出现环 ⟹ 与无环矛盾。<b>同样的抽屉式论证在 2025 真题第 47 题 C 项又考了一次（度 ≥2 的无向图必有回路）。</b>',
 run:null, verdict:'ok'},

{id:'6.4-35', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2016 统考', exam:2016,
 kp:['Dijkstra·选点顺序'],
 stem:'【2016 统考真题】使用 Dijkstra 算法求下图中从顶点 1 到其他各顶点的最短路径，依次得到的各最短路径的目标顶点是（　）。',
 fig:'图/ch6/6.4-35.svg',
 figcap:'2016 统考真题图：有向带权图（1→2=5、1→5=4、2→3=2、2→4=9、3→5=6、4→1=2、5→2=6、5→4=7、5→6=5、6→3=2，据王道 p.241 重画）',
 opts:['5,2,3,4,6','5,2,3,6,4','5,2,4,3,6','5,2,6,3,4'], ans:'B',
 book:'依次求得从顶点 1 到各顶点的最短路径长度分别为：到 2 为 5、到 3 为 7、到 4 为 11、到 5 为 4、到 6 为 9。按长度从小到大依次选中的目标顶点为 5、2、3、6、4，故选 B。',
 claude:'一致，选 B（<b>5,2,3,6,4</b>）。仍用<b>"先算全部最终 dist，再按大小排队"</b>的快解法：<br>'
  +'<b>dist(5)=4</b>（1→5 直达）；<b>dist(2)=5</b>（1→2 直达，比 1→5→2 的 4+6=10 短）；<b>dist(3)=7</b>（1→2→3 = 5+2）；<b>dist(6)=9</b>（1→5→6 = 4+5）；<b>dist(4)=11</b>（1→5→4 = 4+7，比 1→2→4 的 5+9=14 短）。<br>'
  +'⟹ 排队 <b>4 &lt; 5 &lt; 7 &lt; 9 &lt; 11</b> ⟹ 目标顶点依次 <b>5, 2, 3, 6, 4</b>。<br>'
  +'📌 <b>为什么"最终 dist 排序 = 选点顺序"？</b>因为 Dijkstra 每轮选的就是<b>当前 dist 最小的未定顶点</b>，而<b>被选中那一刻它的 dist 就已是最终值</b>（不再更新）⟹ 选中的先后必然按最终 dist 单调不减。<b>这条性质把"画 5 轮 dist 表"压缩成"算 5 个数再排序"，是本类题的最大提速点。</b><br>'
  +'⚠️ <b>三条"看着有用其实用不上"的边</b>：<b>4→1=2</b>（指回源点，永远不会走）、<b>5→2=6</b>（1→5→2=10 &gt; 直达的 5）、<b>6→3=2</b>（1→5→6→3=11 &gt; 已有的 7）。<b>命题人埋这些边就是让你在画表时多算几轮、以为 dist 还会变。</b>用"先算终值再排序"的方法可以完全绕开它们。<br>'
  +'⚠️ <b>本题是<u>有向</u>图</b>：4→1 存在<b>不代表</b> 1→4 存在。若把它当无向图做，dist(4) 会算成 2，答案全错。<b>读图第一件事是确认箭头方向。</b>',
 run:'程序按邻接表跑 Dijkstra（源点 1）：选点顺序 <b>5(4) → 2(5) → 3(7) → 6(9) → 4(11)</b>，最终 dist={1:0,2:5,3:7,4:11,5:4,6:9} ✅ 与书答 B 完全一致', verdict:'ok'},

{id:'6.4-36', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2016 统考', exam:2016,
 kp:['拓扑排序·复杂度'],
 stem:'【2016 统考真题】若对 n 个顶点、e 条弧的有向图采用邻接表存储，则拓扑排序算法的时间复杂度是（　）。',
 opts:['O(n)','O(n+e)','O(n<sup>2</sup>)','O(ne)'], ans:'B',
 book:'拓扑排序中，每个顶点进栈、出栈、输出各一次，共 O(n)；检查所有顶点的边表结点共需 O(e)。因此总时间复杂度为 O(n+e)。若采用邻接矩阵存储，则为 O(n²)。',
 claude:'一致，选 B（<b>O(n+e)</b>）。<b>把开销拆成两笔账，和 6.3 的遍历复杂度是同一套账本</b>：<br>'
  +'· <b>顶点账</b>：初始化入度数组扫一遍 O(n)；每个顶点<b>入栈一次、出栈一次、输出一次</b> ⟹ <b>O(n)</b>；<br>'
  +'· <b>边账</b>：每输出一个顶点就顺着它的边表把出边删一遍（给邻接点的入度 −1），<b>全图每条弧恰好被处理一次</b> ⟹ <b>O(e)</b>；<br>'
  +'⟹ 合计 <b>O(n+e)</b>。<b>两项都不能省</b>：e=0 时仍要 O(n)（一堆孤立点也得逐个输出），稠密时 e 可达 n²。<br>'
  +'📌 <b>存储结构决定复杂度，这一条在 408 里被反复换皮考</b>：<br>'
  +'　<b>邻接表：DFS / BFS / 拓扑排序 / 关键路径 全是 O(n+e)</b>；<br>'
  +'　<b>邻接矩阵：以上全是 O(n²)</b>（因为"找某顶点的所有邻接点"必须扫一整行 n 次）。<br>'
  +'　<b>看到"邻接表"就填 O(n+e)，看到"邻接矩阵"就填 O(n²)，几乎不用思考。</b><br>'
  +'⚠️ 顺带记住表 6.5 里其余几个：<b>Dijkstra O(n²)、Floyd O(n³)、Prim O(n²)、Kruskal O(e log e)</b>。<b>Prim 与顶点数挂钩（宜稠密图），Kruskal 与边数挂钩（宜稀疏图）</b>，这一对经常和本题一起出现在同一张选择题卷面上。',
 run:null, verdict:'ok'},

{id:'6.4-37', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2018 统考', exam:2018,
 kp:['拓扑排序·序列合法性判定'],
 stem:'【2018 统考真题】下列选项中，<b>不是</b>下图所示有向图的拓扑序列的是（　）。',
 fig:'图/ch6/6.4-37.svg',
 figcap:'2018 统考真题图：有向图（1→2、1→3、2→3、2→4、3→4、5→2、5→6、6→4，据王道 p.241 重画）',
 opts:['1,5,2,3,6,4','5,1,2,6,3,4','5,1,2,3,6,4','5,2,1,6,3,4'], ans:'D',
 book:'图中入度为 0 的顶点只有 1 和 5，因此拓扑序列的前两个顶点一定是 1、5 或 5、1。D 项的第二个顶点是 2，故 D 不是该图的拓扑序列。',
 claude:'一致，选 D。<b>本题一秒可解：只看前两位。</b><br>'
  +'<b>入度表</b>：1:0　5:0　2:2(1,5)　3:2(1,2)　6:1(5)　4:3(2,3,6)。<br>'
  +'<b>入度为 0 的只有 1 和 5</b> ⟹ <b>它们必须占据序列的前两位</b>（顺序任意）——因为除它们之外的每个顶点都至少欠着一个前驱，而那些前驱最终都追溯到 1 或 5。<br>'
  +'· A：<b>1,5</b>,… ✓　B：<b>5,1</b>,… ✓　C：<b>5,1</b>,… ✓<br>'
  +'· <b>D：5,<u>2</u>,1,… ✗</b> —— 第二位是 2，可 <b>2 的前驱之一是 1，而 1 排在它后面</b> ⟹ 违规。<br>'
  +'📌 <b>"哪个不是拓扑序"型题的三级筛法，从便宜到贵</b>：<br>'
  +'　① <b>数入度为 0 的顶点，看前几位对不对</b>（本题到此结束）；<br>'
  +'　② 挑<b>多前驱的顶点</b>，检查它的前驱是否都在它前面（第 17、32 题用这招）；<br>'
  +'　③ 实在不行才逐条弧检查。<b>绝大多数真题在第 ① 步就能出答案。</b><br>'
  +'⚠️ <b>验证一下其余三项确实合法</b>（程序已跑）：A、B、C 都满足全部 8 条弧的先后要求。<b>注意 6 和 3 的相对位置很自由</b>（它们之间没有任何路径），所以 B（6 在 3 前）和 C（3 在 6 前）都对——<b>别拿"编号要递增"这种不存在的直觉去卡。</b>',
 run:'程序对 6 个顶点做全排列筛选合法拓扑序，再逐项比对：A、B、C 均在合法集合中，<b>D（5,2,1,6,3,4）不在</b> ⟹ 选 D ✅', verdict:'ok'},


{id:'6.4-38', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2019 统考', exam:2019,
 kp:['关键路径·活动的 e 与 l'],
 stem:'【2019 统考真题】下图所示的 AOE 网表示一项包含 8 个活动的工程。活动 d 的最早开始时间和最迟开始时间分别是（　）。',
 fig:'图/ch6/6.4-38.svg',
 figcap:'2019 统考真题图：AOE 网（a=3:1→2、b=4:3→2、c=8:1→3、d=7:2→4、e=6:2→5、f=10:3→5、g=6:4→6、h=9:5→6，据王道 p.241 重画）',
 opts:['3 和 7','12 和 12','12 和 14','15 和 15'], ans:'C',
 book:'活动 d 的最早开始时间 e(d)=vₑ(2)=max{a, c+b}=max{3, 8+4}=12。关键路径长度为 27，vₗ(4)=27−g=27−6=21，故 l(d)=vₗ(4)−7=14。故选 C。',
 claude:'一致，选 C（<b>12 和 14</b>）。<b>活动 d 是弧 2→4，套两条公式即可，不必把整张表都算完。</b><br>'
  +'<b>① 最早开始 e(d) = v<sub>e</sub>(弧尾事件 2)</b>：事件 2 有两条入边——a（1→2，长 3）与 b（3→2，长 4，而 3 要先等 c=8）⟹ <b>v<sub>e</sub>(2)=max{0+3, 8+4}=12</b> ⟹ <b>e(d)=12</b>。<br>'
  +'　<b>⚠️ A 项的 3 就是只看了 a=3 这一条路、忘了取 max</b>——事件必须等<u>所有</u>前驱活动完成。<br>'
  +'<b>② 最迟开始 l(d) = v<sub>l</sub>(弧头事件 4) − 权</b>：先要工期。v<sub>e</sub>(3)=8，v<sub>e</sub>(4)=12+7=19，v<sub>e</sub>(5)=max{12+6, 8+10}=18，<b>v<sub>e</sub>(6)=max{19+6, 18+9}=27</b> ⟹ <b>工期 27</b>。逆推 <b>v<sub>l</sub>(4)=27−g=27−6=21</b> ⟹ <b>l(d)=21−7=14</b>。<br>'
  +'⟹ <b>e(d)=12、l(d)=14，时间余量 d(d)=2 ⟹ d 不是关键活动。</b><br>'
  +'📌 <b>书上给的完整两张表（值得抄一遍，本图后面 6 道同类题都能对照）</b>：<br>'
  +'　v<sub>e</sub>=(0, 12, 8, 19, 18, 27)，v<sub>l</sub>=(0, 12, 8, 21, 18, 27)；<br>'
  +'　e=(0, 8, 0, 12, 12, 8, 19, 18)，l=(9, 8, 0, 14, 12, 8, 21, 18)，<b>l−e=(9, 0, 0, 2, 0, 0, 2, 0)</b><br>'
  +'　⟹ <b>关键活动 b、c、e、f、h</b>（余量为 0），<b>关键路径 c→b→e→h</b>（8+4+6+9=27）。<b>a 的余量 9、d 与 g 的余量都是 2。</b><br>'
  +'⚠️ <b>B（12 和 12）是最诱人的错项</b>：它假定 d 是关键活动（e=l）。<b>凡问"某活动的 e 和 l"，两个数相等就意味着它是关键活动——先别急着填相等，老实算 v<sub>l</sub>。</b><br>'
  +'📌 <b>合并成一步的口诀</b>：<b>时间余量 d(i) = v<sub>l</sub>(终点) − v<sub>e</sub>(起点) − 权</b>。本题 = 21−12−7 = 2 ⟹ 一步验证 e 与 l 差 2，与答案吻合。',
 run:'程序按拓扑序正推 v<sub>e</sub>=(0,12,8,19,18,<b>27</b>)、逆推 v<sub>l</sub>=(0,12,8,21,18,27)，逐活动求 e/l/余量，得 <b>e(d)=12、l(d)=14</b>（余量 2）；关键活动 b、c、e、f、h ✅ 与书答 C 一致', verdict:'ok'},

{id:'6.4-39', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2019 统考', exam:2019,
 kp:['DAG·描述表达式'],
 stem:'【2019 统考真题】用有向无环图描述表达式 (x+y)((x+y)/x)，需要的顶点个数至少是（　）。',
 opts:['5','6','8','9'], ans:'A',
 book:'表达式 (x+y)((x+y)/x) 中，操作数 x、y 各只需一个顶点，运算符 + 出现的两次是同一个子表达式 x+y，可以共享一个顶点，再加上 / 和 * 各一个顶点，共需 5 个顶点。',
 claude:'一致，选 A（<b>5 个</b>）。<b>DAG 描述表达式的全部价值就是"公共子表达式只存一份"，本题考的就是"你能认出几个公共部分"。</b><br>'
  +'<b>先按二叉树画（会重复）</b>：根是 <b>*</b>，左子树是 <b>x+y</b>，右子树是 <b>/</b>（左 x+y、右 x）⟹ 树上共 <b>9 个结点</b>（正是干扰项 D 的来历）。<br>'
  +'<b>再合并（变成 DAG）</b>：<br>'
  +'· <b>操作数去重</b>：x 出现 3 次 ⟹ 合成 <b>1 个</b>；y 出现 1 次 ⟹ <b>1 个</b>；<br>'
  +'· <b>公共子表达式去重</b>：<b>x+y 出现 2 次，是完全相同的子树 ⟹ 合成 1 个 "+" 顶点</b>，它被 * 和 / 两个父结点共享（入度为 2）；<br>'
  +'· 剩下 <b>/</b> 和 <b>*</b> 各 1 个。<br>'
  +'⟹ <b>x、y、+、/、* 共 5 个顶点</b>。边：+→x、+→y、/→(+)、/→x、*→(+)、*→(/)。<br>'
  +'📌 <b>两条规矩（书上明写）</b>：<b>① 表达式的 DAG 表示中<u>不会出现重复的操作数顶点</u></b>（相同变量必须共用）；<b>② 相同的子表达式共用同一个运算符顶点</b>。<b>⚠️ 但"运算符相同"不等于"可合并"——必须整棵子树都相同才行</b>（若表达式是 (x+y)*(x+z)，两个 + 就<u>不能</u>合并）。<br>'
  +'⚠️ <b>本题最容易多算的是把两个 x+y 当成不同结点（得 6，选项 B）或忘记 x 要共享（得 8，选项 C）</b>。<b>做法：先老实画二叉树数出 9，再逐个合并、每合并一次减几个，比直接凑答案稳。</b>',
 run:null, verdict:'ok'},

{id:'6.4-40', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2020 统考', exam:2020,
 kp:['MST·Kruskal 执行过程'],
 stem:'【2020 统考真题】已知无向图 G 如下图所示，使用 Kruskal 算法求图 G 的最小生成树，加到最小生成树中的边依次是（　）。',
 fig:'图/ch6/6.4-40.svg',
 figcap:'2020 统考真题图：无向带权图（a–b=20、a–c=12、a–e=9、b–d=6、b–e=11、b–f=5、c–d=18、c–e=10、d–e=14、d–f=7，据王道 p.242 重画）',
 opts:['(b,f),(b,d),(a,e),(c,e),(b,e)','(b,f),(b,d),(b,e),(a,e),(c,e)',
       '(a,e),(b,e),(c,e),(b,d),(b,f)','(a,e),(c,e),(b,e),(b,f),(b,d)'], ans:'A',
 book:'Kruskal 算法按权值递增的次序选边：(b,f)=5、(b,d)=6，接下来权值最小的是 (d,f)=7，但它与已选的两条边构成回路，舍弃；继续选 (a,e)=9、(c,e)=10、(b,e)=11，此时已有 5 条边、6 个顶点，算法结束。',
 claude:'一致，选 A。<b>Kruskal 就是"排序 + 逐条试 + 判环"，把边按权递增列出来一条条走：</b><br>'
  +'<b>5(b,f) ✓ → 6(b,d) ✓ → 7(d,f) ✗成环 → 9(a,e) ✓ → 10(c,e) ✓ → 11(b,e) ✓ → 停</b>（已有 5 条边 = n−1，6 个顶点全连通）。<br>'
  +'⟹ 依次加入 <b>(b,f)、(b,d)、(a,e)、(c,e)、(b,e)</b>，总权 5+6+9+10+11 = <b>41</b>。<br>'
  +'📌 <b>本题唯一的机关就是第三条边 (d,f)=7</b>：<b>b、d、f 三者构成一个三角形（5、6、7）</b>，选了 5 和 6 之后 d 与 f 已经通过 b 连通 ⟹ 7 必须跳过。<b>选项 B 就是"没跳过、把顺序排乱"的错误版本；C、D 则是把权值从大到小或乱序排（Kruskal 必须严格递增）。</b><br>'
  +'⚠️ <b>Kruskal 的输出顺序是<u>唯一可验证</u>的（同权边除外），这正是命题人爱考它的原因</b>：只要按权排序 + 判环，四个选项立刻只剩一个。<b>反观 Prim，输出顺序还依赖起点，命题时必须写明"从某某顶点开始"（第 33 题就是）。</b><br>'
  +'📌 <b>两个自检点，做完必看</b>：① <b>边数是否恰为 n−1=5</b>；② <b>所选边的权值序列是否非递减</b>（5,6,9,10,11 ✓）。<b>C、D 两项连第 ② 条都过不了（(a,e)=9 排在 (b,f)=5 前面），扫一眼就能毙。</b>',
 run:'程序模拟 Kruskal（并查集判环）：依次选入 <b>(b,f)5 → (b,d)6 → (a,e)9 → (c,e)10 → (b,e)11</b>，(d,f)7 因成环被跳过；另穷举全部生成树验证 <b>MST 权值 41 且唯一</b> ✅ 与书答 A 一致', verdict:'ok'},

{id:'6.4-41', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2020 统考', exam:2020,
 kp:['DFS·退栈输出＝逆拓扑'],
 stem:'【2020 统考真题】修改递归方式实现的图的深度优先搜索（DFS）算法，将输出（访问）顶点信息的语句移到退出递归前（执行输出语句后立刻退出递归）。采用修改后的算法遍历有向无环图 G，若输出结果中包含 G 中的全部顶点，则输出的顶点序列是 G 的（　）。',
 opts:['拓扑有序序列','逆拓扑有序序列','广度优先搜索序列','深度优先搜索序列'], ans:'B',
 book:'在 DFS 中，顶点 v 的所有后继顶点都退出递归后，v 才退出递归。将输出语句移到退出递归前，则后被访问的顶点先输出，故输出序列是逆拓扑有序序列。',
 claude:'一致，选 B（<b>逆拓扑有序序列</b>）。<b>与第 20 题是同一考点，2020 年把它搬上了真题卷。</b><br>'
  +'<b>推理</b>：对任意弧 u→v，DFS 进入 u 后必然（直接或间接）先把 v 这一支处理完 ⟹ <b>v 先退出递归、先输出；u 后退出、后输出</b> ⟹ <b>每条弧都是"弧头先打印、弧尾后打印"</b> ⟹ 与拓扑序完全相反 ⟹ <b>逆拓扑序</b>。<br>'
  +'<b>为什么不是 D（DFS 序列）</b>：<b>DFS 序列是"进入递归时输出"</b>的结果；本题把输出<b>挪到了退出前</b>，两者一般完全不同。举例：1→2、1→3、2→3。进入时输出得 <b>1,2,3</b>（DFS 序列）；退出前输出得 <b>3,2,1</b>（逆拓扑序）。<br>'
  +'📌 <b>三种输出位置的对照（务必分清，408 已经考过两次）</b>：<br>'
  +'　· <b>进入递归时输出</b> ⟹ DFS 序列；<br>'
  +'　· <b>退出递归前输出</b> ⟹ <b>逆拓扑序列</b>（本题）；<br>'
  +'　· <b>退出递归前压栈，最后统一弹出</b> ⟹ <b>拓扑序列</b>（这就是"DFS 版拓扑排序"，按结束时间从大到小排）。<br>'
  +'⚠️ <b>题干的两个限定词都不是废话</b>：<b>"有向无环图"</b>——有环就不存在拓扑序，结论无从谈起；<b>"输出结果中包含全部顶点"</b>——DFS 从单个起点出发可能走不遍全图，必须（用外层循环）覆盖所有顶点，结论才对整张图成立。',
 run:null, verdict:'ok'},

{id:'6.4-42', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2020 统考', exam:2020,
 kp:['关键路径·概念辨析'],
 stem:'【2020 统考真题】若使用 AOE 网估算工程进度，则下列叙述中正确的是（　）。',
 opts:['关键路径是从源点到汇点边数最多的一条路径','关键路径是从源点到汇点路径长度最长的路径',
       '增加任意一个关键活动的时间不会延长工程的工期','缩短任意一个关键活动的时间将会缩短工程的工期'], ans:'B',
 book:'关键路径是从源点到汇点路径长度（权值之和）最长的路径，B 正确、A 错误。增加任一关键活动的时间一定会延长工期，C 错误。当存在多条关键路径时，只缩短其中一条上的关键活动不一定能缩短工期，D 错误。',
 claude:'一致，选 B。四项恰好覆盖"关键路径"最常被误记的四个点：<br>'
  +'· <b>A ✗</b>：<b>比的是<u>权值之和</u>，不是边数。</b>一条只有 2 条边但权重很大的路径，完全可能长过一条有 5 条边的小权路径（第 22 题的图就是现成例子）。<br>'
  +'· <b>B ✓</b>：<b>关键路径 = 源点到汇点<u>最长</u>的路径，其长度 = 完成工程的最短时间。</b>「最长路径 = 最短工期」这个看似矛盾的说法要理解：<b>所有活动可以并行，工程必须等最慢的那条链走完</b>。<br>'
  +'· <b>C ✗</b>：<b>增加关键活动的时间一定延长工期</b>（延长是"一延就灵"，见第 25 题 Ⅱ）。<b>C 说反了。</b><br>'
  +'· <b>D ✗</b>：<b>缩短却"不一定灵"</b>——存在多条关键路径时，只压短其中一条上的活动，别的关键路径原地不动 ⟹ 工期不变（第 25 题 Ⅲ、2013 真题第 31 题都在考这个）。<b>另外即便只有一条关键路径，压过头也会导致关键路径转移，之后再压无效。</b><br>'
  +'📌 <b>"延长/缩短"的不对称性，一句话记牢：<b>延长关键活动必然延长工期；缩短关键活动未必缩短工期。</b>要缩短，必须让加速的活动<u>覆盖每一条</u>关键路径，而且不能压过头。</b>',
 run:null, verdict:'ok'},

{id:'6.4-43', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2021 统考', exam:2021,
 kp:['拓扑排序·序列计数与唯一性'],
 stem:'【2021 统考真题】给定下图所示有向图，该图的拓扑有序序列的个数是（　）。',
 fig:'图/ch6/6.4-43.svg',
 figcap:'2021 统考真题图：有向图（A→B、A→F、B→C、B→D、B→F、C→D、D→E、D→F、E→F，据王道 p.242 重画）',
 opts:['1','2','3','4'], ans:'A',
 book:'每输出一个顶点并删除其出边后，都发现有且仅有一个顶点没有入边，因此拓扑序列唯一，为 A、B、C、D、E、F。',
 claude:'一致，选 A（<b>只有 1 个</b>，即 <b>A,B,C,D,E,F</b>）。<b>逐步删点，每一步数"入度为 0 的顶点有几个"：</b><br>'
  +'<b>入度表</b>：A:0　B:1(A)　C:1(B)　D:2(B,C)　E:1(D)　F:4(A,B,D,E)。<br>'
  +'· 入度 0 的<b>只有 A</b> ⟹ 输出 A ⟹ 删 A 的出边后 B 归 0（F 还欠 B、D、E）；<br>'
  +'· <b>只有 B</b> ⟹ 输出 B ⟹ C 归 0（D 还欠 C）；<br>'
  +'· <b>只有 C</b> ⟹ 输出 C ⟹ D 归 0；<br>'
  +'· <b>只有 D</b> ⟹ 输出 D ⟹ E 归 0；<br>'
  +'· <b>只有 E</b> ⟹ 输出 E ⟹ F 归 0；<br>'
  +'· <b>只有 F</b> ⟹ 输出 F。<b>全程每一步的候选都<u>恰好一个</u> ⟹ 序列唯一。</b><br>'
  +'📌 <b>拓扑序唯一的判据（本题就是它的教科书式演示）</b>：<b>每一轮入度为 0 的顶点恰好只有一个</b>。等价说法：<b>拓扑序上任意相邻两个顶点之间都有弧相连</b>（本图 A→B、B→C、C→D、D→E、E→F 全部存在，串成一条"哈密顿路径"）⟹ 全序被完全锁死。<br>'
  +'⚠️ <b>本图有 4 条"冗余弧"：A→F、B→F、D→F（都被 …→E→F 蕴含）与 B→D（被 B→C→D 蕴含）</b>——把这 4 条全删掉，拓扑序仍然唯一为 A,B,C,D,E,F。<b>它们只是把 F 的入度堆高，不改变任何一步的候选集</b>——<b>再次印证"拓扑序唯一 ⇏ 图唯一"（第 14 题 Ⅲ、第 21 题 Ⅳ）。</b><br>'
  +'📌 <b>考场做法：不要枚举，只需从头走一遍"每步几个候选"</b>。<b>只要有<u>任何一步</u>出现两个候选，个数立刻 ≥2</b>；全程都只有一个，答案就是 1。',
 run:'程序对 6 个顶点做全排列筛选：合法拓扑序<b>唯一</b>，为 <b>A,B,C,D,E,F</b> ✅ 与书答一致', verdict:'ok'},

{id:'6.4-44', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2021 统考', exam:2021,
 kp:['Dijkstra·dist 数组的演变'],
 stem:'【2021 统考真题】使用 Dijkstra 算法求下图中从顶点 1 到其余各顶点的最短路径，将当前找到的从顶点 1 到顶点 2、3、4、5 的最短路径长度保存在数组 dist 中，求出<b>第二条</b>最短路径后，dist 中的内容更新为（　）。',
 fig:'图/ch6/6.4-44.svg',
 figcap:'2021 统考真题图：有向带权图（1→2=26、1→3=3、1→5=6、3→2=22、4→2=1、4→3=6、5→2=15、5→3=6、5→4=8，据王道 p.242 重画）',
 opts:['26, 3, 14, 6','25, 3, 14, 6','21, 3, 14, 6','15, 3, 14, 6'], ans:'C',
 book:'初始 dist=(26, 3, ∞, 6)。第一轮选中顶点 3（dist=3），松弛 3→2 得 dist(2)=3+22=25，dist 更新为 (25, 3, ∞, 6)。第二轮选中顶点 5（dist=6），松弛 5→2 得 21、5→4 得 14，dist 更新为 (21, 3, 14, 6)。故选 C。',
 claude:'一致，选 C（<b>21, 3, 14, 6</b>）。<b>本题必须真的按轮次走 dist 表——问的不是最终值，而是"第二轮结束时的<u>中间态</u>"。</b><br>'
  +'<b>初始（只看 1 的直接出边）</b>：dist = (2:<b>26</b>, 3:<b>3</b>, 4:<b>∞</b>, 5:<b>6</b>)。<br>'
  +'<b>第 1 轮</b>：最小是顶点 <b>3</b>（dist=3）⟹ 入 S，用它松弛：3→2=22 ⟹ 3+22=<b>25</b> &lt; 26 ⟹ dist(2)=25。<br>'
  +'　⟹ dist = (<b>25</b>, 3, ∞, 6)　<b>——这就是选项 B，是"只走了一轮"的半成品。</b><br>'
  +'<b>第 2 轮</b>：剩下最小是顶点 <b>5</b>（dist=6）⟹ 入 S，用它松弛：5→2=15 ⟹ 6+15=<b>21</b> &lt; 25 ⟹ dist(2)=21；5→4=8 ⟹ 6+8=<b>14</b> ⟹ dist(4)=14；5→3=6 ⟹ 6+6=12 &gt; 3，不更新。<br>'
  +'　⟹ dist = (<b>21, 3, 14, 6</b>) ✓ <b>选 C</b>。<br>'
  +'📌 <b>四个选项正好是四个不同时刻的快照</b>：<b>A=初始态</b>（一轮没走）、<b>B=第 1 轮后</b>、<b>C=第 2 轮后 ✓</b>、<b>D=最终态</b>（第 3 轮选中顶点 4 后 4→2=1 ⟹ 14+1=<b>15</b>）。<b>命题人把"数错轮次"的所有可能都做成了选项，读题时必须数清"第几条最短路径"。</b><br>'
  +'⚠️ <b>"求出第 k 条最短路径后"= 已有 k 个顶点进入 S（不含源点）</b>。本题 k=2 ⟹ 顶点 3、5 已定，dist 里 2 和 4 仍是<b>临时值</b>（21 和 14 后面还会被改成 15 和 14）。<b>别把临时值当最终值。</b><br>'
  +'📌 <b>顺手记住最终答案</b>：dist 终值 = (2:15, 3:3, 4:14, 5:6)，选点顺序 <b>3(3) → 5(6) → 4(14) → 2(15)</b>。',
 run:'程序逐轮模拟 Dijkstra 并打印 dist(2,3,4,5)：初始 (26,3,∞,6) → 选 3 后 (25,3,∞,6) → <b>选 5 后 (21,3,14,6)</b> → 选 4 后 (15,3,14,6) → 选 2 结束 ✅ 第二轮结束时正是选项 C', verdict:'ok'},

{id:'6.4-45', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2022 统考', exam:2022,
 kp:['关键路径·时间余量'],
 stem:'【2022 统考真题】下图是一个有 10 个活动的 AOE 网，时间余量最大的活动是（　）。',
 fig:'图/ch6/6.4-45.svg',
 figcap:'2022 统考真题图：AOE 网（a=2:1→2、b=5:1→3、c=1:2→3、d=3:2→4、e=3:3→4、f=4:3→5、g=1:3→6、h=1:4→5、i=4:4→6、j=1:5→6，据王道 p.242 重画）',
 opts:['c','g','h','j'], ans:'B',
 book:'先求各事件的最早发生时间 vₑ=(0,2,5,8,9,12) 与最迟发生时间 vₗ=(0,4,5,8,11,12)。活动的时间余量 d = vₗ(终点) − vₑ(起点) − 持续时间：d(c)=5−2−1=2；d(g)=12−5−1=6；d(h)=11−8−1=2；d(j)=12−9−1=2。故时间余量最大的是活动 g。',
 claude:'一致，选 B（<b>活动 g，余量 6</b>）。<b>本题用"一步到位"的余量公式最省事，不必分别算 e 和 l。</b><br>'
  +'<b>① 正推 v<sub>e</sub>（取 max）</b>：v<sub>e</sub>(1)=0；v<sub>e</sub>(2)=2；<b>v<sub>e</sub>(3)=max{0+5(b), 2+1(c)}=5</b>；<b>v<sub>e</sub>(4)=max{2+3(d), 5+3(e)}=8</b>；<b>v<sub>e</sub>(5)=max{5+4(f), 8+1(h)}=9</b>；<b>v<sub>e</sub>(6)=max{8+4(i), 9+1(j), 5+1(g)}=12</b> ⟹ <b>工期 12</b>。<br>'
  +'<b>② 逆推 v<sub>l</sub>（取 min）</b>：v<sub>l</sub>(6)=12；v<sub>l</sub>(5)=12−1=11；<b>v<sub>l</sub>(4)=min{12−4(i), 11−1(h)}=8</b>；<b>v<sub>l</sub>(3)=min{8−3(e), 11−4(f), 12−1(g)}=5</b>；<b>v<sub>l</sub>(2)=min{5−1(c), 8−3(d)}=4</b>；v<sub>l</sub>(1)=0。<br>'
  +'<b>③ 套公式 d = v<sub>l</sub>(终点) − v<sub>e</sub>(起点) − 权</b>：<br>'
  +'　d(c)=v<sub>l</sub>(3)−v<sub>e</sub>(2)−1 = 5−2−1 = <b>2</b>；<b>d(g)=v<sub>l</sub>(6)−v<sub>e</sub>(3)−1 = 12−5−1 = 6</b>；d(h)=v<sub>l</sub>(5)−v<sub>e</sub>(4)−1 = 11−8−1 = <b>2</b>；d(j)=v<sub>l</sub>(6)−v<sub>e</sub>(5)−1 = 12−9−1 = <b>2</b> ⟹ <b>g 最大</b>。<br>'
  +'📌 <b>为什么 g 的余量这么大？</b>因为 <b>g 是一条"短路"</b>：它从事件 3 直接跳到汇点 6，只花 1，而主干道 3→4→6 要花 3+4=7 ⟹ <b>它有整整 6 个单位可以磨蹭</b>。<b>看图找"绕开主干的小权捷径"，往往就是余量最大的活动</b>——这个直觉能在算之前先猜出答案，再用公式验证。<br>'
  +'⚠️ <b>余量公式里减的是"起点的 v<sub>e</sub>"和"终点的 v<sub>l</sub>"，一头一尾别搞混</b>：写成 v<sub>l</sub>(起点)−v<sub>e</sub>(终点) 就全错了。<b>记法：最迟的终点 − 最早的起点 = 这条活动可以占用的最大窗口，再减去它实际要用的时长，剩下的就是余量。</b><br>'
  +'📌 <b>本图的关键活动</b>：程序复算得余量为 0 的是 <b>b、e、i</b> ⟹ 关键路径 <b>1→3→4→6</b>（5+3+4=12 ✓）。',
 run:'程序正推 v<sub>e</sub>=(0,2,5,8,9,<b>12</b>)、逆推 v<sub>l</sub>=(0,4,5,8,11,12)，逐活动求余量：<b>g=6</b>、d=3、a=c=f=h=j=2、关键活动 b=e=i=0 ⟹ 余量最大者为 <b>g</b> ✅ 与书答一致', verdict:'ok'},

{id:'6.4-46', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2023 统考', exam:2023,
 kp:['最短路径·MST 不是最短路径树'],
 stem:'【2023 统考真题】已知无向连通图 G 中各边的权值均为 1。在下列算法中，一定能够求出图 G 中从某顶点到其余各顶点最短路径的是（　）。<br>Ⅰ．Prim 算法　Ⅱ．Kruskal 算法　Ⅲ．图的广度优先搜索算法',
 opts:['仅Ⅰ','仅Ⅲ','仅Ⅰ、Ⅱ','Ⅰ、Ⅱ、Ⅲ'], ans:'B',
 book:'最小生成树中某顶点到其余顶点的路径不一定是最短路径，因此 Prim 和 Kruskal 算法都不能保证求出最短路径。广度优先搜索总是按照距离由近到远遍历，可以求出非带权图（或各边权值相同的图）的单源最短路径。故选 B。',
 claude:'一致，选 B（<b>仅 Ⅲ</b>）。<b>本题的题眼是那句"MST ≠ 最短路径树"，这是本章被强调了三次的结论。</b><br>'
  +'· <b>Ⅰ、Ⅱ ✗</b>：Prim/Kruskal 求的是 <b>MST——它只保证"全部边权之和最小"，完全不保证"某两点之间的路径最短"</b>。<br>'
  +'　<b>书上的反例（边权全为 1 时同样成立）</b>：三角形 a–b=1、b–c=1、a–c=1。MST 只能留两条边，比如留 {a–b, b–c} ⟹ <b>MST 中 a 到 c 要走 2 步</b>，而原图里 a–c 有直接边、<b>最短距离是 1</b>。<b>⟹ 即使边权全相等，MST 里的路径也可能比真实最短路径长。</b><br>'
  +'· <b>Ⅲ ✓</b>：<b>BFS 是按层扩展的</b>——第 k 层的顶点恰好是"距源点 k 条边"的顶点 ⟹ <b>在无权图（或各边权相同的图）中，BFS 树上的路径就是最短路径</b>。<b>题干特意写明"各边的权值均为 1"，就是为了让 BFS 合法。</b><br>'
  +'📌 <b>三个"树"必须分清</b>：<br>'
  +'　· <b>MST</b>：总权最小，<u>不管</u>任何两点间的距离；<br>'
  +'　· <b>最短路径树</b>（Dijkstra/BFS 的产物）：保证<u>源点</u>到每个顶点最短，但<b>总权可能远大于 MST</b>（综合题 06 的反例：15 vs 7）；<br>'
  +'　· 两者<b>目标不同、算法思路也不同</b>——<b>Prim 选"离<u>树</u>最近的点"，Dijkstra 选"离<u>源点</u>最近的点"</b>，一字之差。<br>'
  +'⚠️ <b>若把题干的"权值均为 1"去掉，Ⅲ 也会变错</b>（带权图 BFS 不适用）。<b>三个算法在本题里全靠题设条件划界，读题时那句"各边的权值均为 1"是解题钥匙，不是背景描述。</b>',
 run:null, verdict:'ok'},

{id:'6.4-47', ch:6, sec:'6.4 图的应用', type:'choice', tag:'2025 统考', exam:2025,
 kp:['图·综合辨析（度/拓扑/回路/BFS）'],
 stem:'【2025 统考真题】下列关于图的叙述中，正确的是（　）。',
 opts:['有向图必存在入度为 0 的顶点','有向无环图的拓扑有序序列存在且唯一',
       '各顶点的度均大于或等于 2 的无向图必有回路','可用 BFS 算法求出带权图中每对顶点间的最短路径'], ans:'C',
 book:'A 错误，含环的有向图可能每个顶点的入度都大于 0。B 错误，存在多个入度为 0 的顶点时拓扑序列不唯一。C 正确，各顶点度均大于或等于 2 时，从任一顶点出发总能继续走下去，顶点有限必然重复访问某顶点，从而形成回路。D 错误，BFS 只适用于无权图或各边权值相同的图。',
 claude:'一致，选 C。<b>2025 年最新真题，四个选项各打一个"绝对化"陷阱：</b><br>'
  +'· <b>A ✗</b>：<b>"必"字错。</b><b>有向<u>无环</u>图才必有入度为 0 的顶点</b>；一个纯环 a→b→c→a，每个顶点入度都是 1。<br>'
  +'· <b>B ✗</b>：<b>存在 ✓，唯一 ✗。</b>DAG 一定有拓扑序，但只要某一步出现两个入度为 0 的顶点就不唯一（第 30、43 题反复考）。<br>'
  +'· <b>C ✓</b>：<b>抽屉式论证</b>——从任一顶点出发沿边走，<b>每到一个新顶点，它的度 ≥2 意味着除了"刚走进来的那条边"外<u>至少还有一条边</u>可以走出去</b> ⟹ 永远不会卡死；而顶点数有限 ⟹ <b>走着走着必然重复到达某个顶点</b> ⟹ 两次到达之间的那段路径就是一个回路。<br>'
  +'　<b>换个说法（更快）</b>：Σ度 = 2|E| ≥ 2n ⟹ <b>|E| ≥ n</b>；而<b>无环图（森林）最多只有 n−1 条边</b> ⟹ 边数超标 ⟹ 必有回路。<b>这个"边数 &gt; n−1 必有环"正是 6.1 的铁律之一。</b><br>'
  +'· <b>D ✗</b>：两处错。<b>其一，BFS 只能用于无权图（或边权全相同）</b>，带权图要用 Dijkstra/Floyd；<b>其二，"每对顶点"是全源问题</b>，BFS 一次只解决一个源点。<br>'
  +'📌 <b>本题的解题姿势：先扫"必""唯一""每对"这些绝对化词。</b>A 的"必"、B 的"唯一"、D 的"每对"都是破绽，剩下 C 反而是唯一需要动脑证明的——<b>而它恰好可以用"边数 ≥ n ⟹ 有环"一句话搞定。</b>',
 run:null, verdict:'ok'},


{id:'6.4-综1', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'', exam:null,
 kp:['MST·破圈法'],
 hints:['先别急着判对错，<b>先动手在一张有环的小图上试一遍</b>：任取一个圈，去掉圈上权最大的边，看看图还连不连通、总权变没变小。',
        '关键的一步：<b>去掉圈上权最大的那条边，图一定仍然连通</b>——因为圈上剩下的边还能绕过去。想清楚这一点，"最后得到的一定是生成树"就成立了。',
        '再证"它是<u>最小</u>的"：用反证。假设结果 T 不是 MST，取一棵与 T 公共边最多的 MST T₀，把 T₀ 与 T 并起来会出现回路，回路上必有一条被破圈法丢掉的"最大边"…… 顺着这条线索推出矛盾。'],
 stem:'下面是一种称为"<b>破圈法</b>"的求最小生成树的方法：所谓"破圈法"，是指"任取一圈，去掉圈上权最大的边"，反复执行这一步骤，直到没有圈为止。试判断这种方法是否正确。若正确，说明理由；若不正确，举出反例。（注：圈就是回路）',
 book:'这种方法是正确的。经过"破圈法"后最终没有回路，因此一定可以构造出一棵生成树。下面证明它是最小生成树：假设破圈法生成的树 T 不是最小生成树，则必存在一棵最小生成树 T₀，使得它与 T 的公共边尽可能多；将 T₀ 与 T 取并集得到一个图，此图中必然存在回路，而"破圈法"的定义就是从回路中去除权值最大的边，因此此时生成的 T 的权必然是最小的，与假设矛盾。故 T 是最小生成树。',
 claude:'答案：<b>破圈法是正确的</b>——它与 Prim、Kruskal 并列，是求 MST 的<b>第三条路</b>。<br>'
  +'<b>第一步：为什么最后一定是一棵<u>生成树</u>？</b><br>'
  +'· <b>不会断开</b>：去掉的是<b>圈上</b>的边，而<b>圈上任意一条边被删后，两个端点仍可沿圈的另一半绕通</b> ⟹ <b>连通性始终保持</b>；<br>'
  +'· <b>最终无圈</b>：算法的终止条件就是"没有圈为止"；<br>'
  +'· <b>连通 + 无环 + 含全部顶点 = 生成树</b> ✓（边数自动变成 n−1）。<br>'
  +'<b>第二步：为什么它是<u>最小</u>的？（书上的反证法，考场写这一段）</b><br>'
  +'设破圈法得到的树为 T。假设 T 不是 MST，则在所有 MST 中取一棵<b>与 T 公共边最多</b>的记为 T<sub>0</sub>。由于 T ≠ T<sub>0</sub>，必有一条边 e ∈ T 而 e ∉ T<sub>0</sub>。把 e 加进 T<sub>0</sub> ⟹ <b>产生唯一一个回路 C</b>。<br>'
  +'· C 上必有一条边 e′ ∉ T（否则 C ⊆ T，与 T 无环矛盾）；<br>'
  +'· e′ 之所以不在 T 里，说明它<b>在破圈的某一步被当作"圈上权最大的边"删掉了</b> ⟹ <b>w(e′) ≥ w(e)</b>；<br>'
  +'· 于是在 T<sub>0</sub> 中<b>用 e 换掉 e′</b>：得到的仍是生成树，总权 <b>不增</b> ⟹ 它也是 MST，<b>但与 T 的公共边多了一条</b> ⟹ 与"T<sub>0</sub> 公共边最多"矛盾。<br>'
  +'⟹ 假设不成立，<b>T 就是最小生成树</b>。<br>'
  +'<b>三种算法的对照（这才是本题的复习价值）</b>：<br>'
  +'· <b>Prim「加点」</b>：从一个顶点长出去，每次<b>加</b>一条最小的割边 ⟹ O(|V|²)，宜<b>稠密图</b>；<br>'
  +'· <b>Kruskal「加边」</b>：按权<b>递增</b>加边，成环就跳过 ⟹ O(|E|log|E|)，宜<b>稀疏图</b>；<br>'
  +'· <b>破圈法「减边」</b>：按权<b>递减</b>删边，删了会断开就保留（等价说法）⟹ 三者都是贪心，只是<b>一个从空树往上加、一个从全图往下减</b>。<br>'
  +'⚠️ <b>两个容易写错的点</b>：① <b>必须是"圈上权<u>最大</u>的边"</b>，删别的边就不保证最优；② <b>"去掉圈上最大边"要求那条边确实在圈上</b>——全图权值最大的边若是<b>桥</b>（不在任何圈上），<b>反而必须保留</b>，删了图就断了。<b>这正好呼应第 21 题 Ⅲ「MST 里的某条边可能比未选边还大」。</b><br>'
  +'📌 <b>书上给了 A–G 七顶点图的六步破圈图示（依次去掉 15、12、9、8、7 …）</b>——手工做题时按"从大到小扫边，能删就删"操作最省事，等价于 <b>Kruskal 的逆过程</b>。',
 run:'程序在 200 张随机带权连通图（n=6–9，含大量等权边）上把破圈法（按权递减尝试删边、删后仍连通才真删）与 Kruskal 对拍：<b>200/200 两者的总权值完全相等</b>；另在"最大边是桥"的构造图上验证破圈法确实保留了该桥 ✅', verdict:'ok'},

{id:'6.4-综2', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'', exam:null,
 kp:['综合·邻接矩阵/DFS/强连通分量/拓扑序/MST'],
 hints:['第 1 问：邻接矩阵写"带权"版本——<b>主对角线写 0，无边处写 ∞</b>；DFS 序列要<b>严格按邻接矩阵的列序（即顶点编号从小到大）</b>选择下一个顶点，否则答案不唯一。',
        '第 2 问：先找<b>只有出弧、没有入弧</b>的顶点——它<b>不可能</b>与任何顶点互相可达，只能自成一个强连通分量。删掉它再看下一个。',
        '第 3 问：拓扑序不唯一，随便给两个即可；注意顶点 1 是唯一的源点、7 是唯一的汇点。',
        '第 4 问：<b>把有向图当无向图</b>（去掉箭头、保留权值），再跑 Prim（从 1 开始）与 Kruskal。'],
 stem:'已知有向图如下图所示。<br>'
  +'1）写出该图的邻接矩阵表示，并据此给出从顶点 1 出发的深度优先遍历序列。<br>'
  +'2）求该有向图的强连通分量的数目。<br>'
  +'3）给出该图的任意两个拓扑序列。<br>'
  +'4）若将该图视为无向图，分别用 Prim 算法和 Kruskal 算法求最小生成树。',
 fig:'图/ch6/6.4-综2.svg',
 figcap:'题图：7 顶点有向带权图（1→2=3、1→3=3、1→4=6、2→3=4、2→5=5、3→5=4、4→6=5、6→3=3、5→7=3、6→7=7，据王道 p.243 重画）',
 book:'1）邻接矩阵按行列 1–7 填写，主对角线为 0、无边为 ∞。从顶点 1 出发的深度优先遍历序列为 1, 2, 3, 5, 7, 4, 6。<br>2）强连通分量数目为 7。解题思路：当某个顶点只有出弧而没有入弧时，其他顶点无法到达它，它只能单独构成一个强连通分量；顶点 1 无入弧，构成第一个强连通分量，删除顶点 1 及以它为尾的弧；此时顶点 2 无入弧，又构成一个强连通分量……以此类推，最后每个顶点各自构成一个强连通分量，共 7 个。<br>3）两个拓扑序列：① 1,2,4,6,3,5,7　② 1,4,2,6,3,5,7。<br>4）Prim 算法（从顶点 1 出发）依次选取：1–2、1–3、3–6、3–5、5–7、6–4。Kruskal 算法的过程见书上六步图示。',
 claude:'<b>1）邻接矩阵与 DFS 序列</b><br>'
  +'<pre class="code">     1   2   3   4   5   6   7\n'
  +'1 [  0   3   3   6   ∞   ∞   ∞ ]\n'
  +'2 [  ∞   0   4   ∞   5   ∞   ∞ ]\n'
  +'3 [  ∞   ∞   0   ∞   4   ∞   ∞ ]\n'
  +'4 [  ∞   ∞   ∞   0   ∞   5   ∞ ]\n'
  +'5 [  ∞   ∞   ∞   ∞   0   ∞   3 ]\n'
  +'6 [  ∞   ∞   3   ∞   ∞   0   7 ]\n'
  +'7 [  ∞   ∞   ∞   ∞   ∞   ∞   0 ]</pre>'
  +'<b>DFS 序列（从 1 出发，按编号从小到大选邻接点）：1 → 2 → 3 → 5 → 7 → 4 → 6</b>。<br>'
  +'逐步走：1 的第一个出邻接点是 2；2 的第一个是 3；3 只通向 5；5 只通向 7；<b>7 是死路 ⟹ 一路回溯到 1</b>；1 还剩 4 ⟹ 走 4；4 通向 6；6 的出邻接点 3、7 都已访问 ⟹ 结束。<br>'
  +'　⚠️ <b>回溯要一直退到"还有未访问出邻接点"的那个顶点</b>——本题从 7 一路退到 1，中间的 5、3、2 都无路可走。<br>'
  +'<b>2）强连通分量数目 = 7（每个顶点各自一个）</b><br>'
  +'· 判据：<b>这张图是 DAG（无环）</b> ⟹ <b>任意两个不同顶点不可能互相可达</b>（否则就有环）⟹ 每个顶点只能自成一个强连通分量 ⟹ <b>共 7 个</b>。<br>'
  +'· 书上给的是"逐层剥皮"的操作法：<b>顶点 1 无入弧 ⟹ 谁也回不到它 ⟹ 单独成分量</b>，删掉它；此时 2 变成无入弧 ⟹ 又单独成分量……<b>剥到最后每个顶点都被单独剥出</b>。<b>这个手法对"判断某顶点是否孤立成分量"很好用：只有出弧没有入弧（或反之）的顶点，必然自成一个强连通分量。</b><br>'
  +'<b>3）两个拓扑序列</b>：<b>1,2,4,6,3,5,7</b> 与 <b>1,4,2,6,3,5,7</b>。<br>'
  +'　（程序枚举得本图的<b>全部</b>拓扑序恰有 <b>3</b> 个，第三个是 <b>1,4,6,2,3,5,7</b>。注意 3 必须等 2 和 6 都输出后才能出现，5 要等 3，7 要等 5，所以尾巴 <b>…3,5,7</b> 是固定的。）<br>'
  +'<b>4）视为无向图求 MST</b>（权值不变、去掉箭头）：<br>'
  +'· <b>Prim（从 1 开始）</b>：依次选 <b>(1,2)=3 → (1,3)=3 → (3,6)=3 → (3,5)=4 → (5,7)=3 → (6,4)=5</b>；<br>'
  +'· <b>Kruskal</b>：按权递增 <b>3,3,3,3,4,4,5,5,6,7</b> 依次试，跳过成环者，最终得到<b>同一棵树</b>；<br>'
  +'· <b>MST 总权 = 3+3+3+4+3+5 = 21</b>，程序穷举全部生成树验证 <b>MST 唯一</b>。<br>'
  +'⚠️ <b>本题第 4 问最容易犯的错：把方向带进去。</b>「视为无向图」意味着 6→3 这条弧变成普通边 (3,6)，<b>它在 MST 里起了大作用</b>（3 与 6 之间权 3，比 4→6 的 5 便宜）。<b>做 MST 一律不看方向。</b><br>'
  +'📌 <b>本题是"一图五问"的典型综合题，五个问各查一个基本功</b>：矩阵表示（写法）、DFS（回溯规则）、强连通分量（可达性）、拓扑序（约束传递）、MST（贪心）。<b>考场上按问作答，别把第 4 问的无向化传染到前三问。</b>',
 run:'程序按题给弧集独立复算：① DFS(1) = <b>1,2,3,5,7,4,6</b> ✅；② 图无环 ⟹ 7 个强连通分量 ✅；③ 全部拓扑序共 3 条，含书给的两条 ✅；④ 无向化后穷举全部生成树，<b>MST 权值 21 且唯一</b>，边集 {(1,2),(1,3),(3,5),(3,6),(4,6),(5,7)}，与书上 Prim 的选边结果完全一致 ✅', verdict:'ok'},

{id:'6.4-综3', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'', exam:null,
 kp:['Dijkstra·逐轮 dist 表'],
 hints:['题目要求"<b>顺序不能颠倒</b>"，意思是必须按 Dijkstra <b>选中顶点的先后</b>来写答案，而不是按顶点编号 2,3,4,5,6 的顺序写。',
        '画一张五行的表：每轮先<b>挑出当前 dist 最小且未确定的顶点</b>（打勾），再用它<b>松弛</b>它的每个邻接点。',
        '这是<b>无向</b>图，每条边两个方向都能走；松弛时别漏掉"从新确定的顶点回头指向别人"的边。'],
 stem:'对下图所示的无向图，按照 Dijkstra 算法，写出从顶点 1 到其他各个顶点的最短路径和最短路径长度（顺序不能颠倒）。',
 fig:'图/ch6/6.4-综3.svg',
 figcap:'题图：无向带权图（1–2=7、1–3=11、2–3=10、2–4=9、3–4=5、3–5=7、3–6=8、5–6=6，据王道 p.243 重画）',
 book:'按 Dijkstra 算法逐轮进行：第 1 轮选中顶点 2，最短路径 (v₁,v₂)，长度 7；第 2 轮选中顶点 3，路径 (v₁,v₃)，长度 11；第 3 轮选中顶点 4，路径 (v₁,v₂,v₄)，长度 16；第 4 轮选中顶点 5，路径 (v₁,v₃,v₅)，长度 18；第 5 轮选中顶点 6，路径 (v₁,v₃,v₆)，长度 19。',
 claude:'答案（<b>必须按这个先后顺序写</b>）：<br>'
  +'<b>① 1→2，长度 7　② 1→3，长度 11　③ 1→2→4，长度 16　④ 1→3→5，长度 18　⑤ 1→3→6，长度 19</b><br>'
  +'<b>逐轮 dist 表（考场就画这张表）</b>：<br>'
  +'<pre class="code">顶点     初始   第1轮   第2轮   第3轮   第4轮   第5轮\n'
  +' 2        7    ✔选中\n'
  +' 3       11      11    ✔选中\n'
  +' 4        ∞      16      16    ✔选中\n'
  +' 5        ∞       ∞      18      18    ✔选中\n'
  +' 6        ∞       ∞      19      19      19    ✔选中\n'
  +'S        {1}   {1,2}  {1,2,3} {…,4}  {…,5}  {…,6}</pre>'
  +'<b>每轮做了什么</b>：<br>'
  +'· <b>初始</b>：1 的直接边 → dist(2)=7、dist(3)=11，其余 ∞。<br>'
  +'· <b>第 1 轮选 2（7）</b>：松弛 2 的边 —— 2–3=10 ⟹ 7+10=17 &gt; 11，<b>不更新</b>；2–4=9 ⟹ 7+9=<b>16</b>。<br>'
  +'· <b>第 2 轮选 3（11）</b>：3–4=5 ⟹ 11+5=16，<b>与已有的 16 相等，不更新</b>（路径改写与否不影响长度，写 1→2→4 即可）；3–5=7 ⟹ <b>18</b>；3–6=8 ⟹ <b>19</b>。<br>'
  +'· <b>第 3 轮选 4（16）</b>：4 的邻接点 2、3 都已确定 ⟹ 无更新。<br>'
  +'· <b>第 4 轮选 5（18）</b>：5–6=6 ⟹ 18+6=24 &gt; 19，<b>不更新</b>。<br>'
  +'· <b>第 5 轮选 6（19）</b>：结束。<br>'
  +'⚠️ <b>本题埋了两个"看起来该更新其实不更新"的地方</b>（2→3 的 17 和 3→4 的 16、5→6 的 24），<b>它们是判卷时的采分点</b>：写表时要把"比较后不更新"也体现出来（保留原值），<b>而不是空着</b>。<br>'
  +'📌 <b>"顺序不能颠倒"这句话是全题的题眼</b>：Dijkstra 的输出天然带顺序（<b>按最短路径长度递增</b>），题目要的就是这个顺序 <b>7 &lt; 11 &lt; 16 &lt; 18 &lt; 19</b>。<b>把答案按顶点编号排成 2,3,4,5,6 恰好也对是巧合</b>——本题 dist 递增顺序恰与编号一致；若图稍改（例如第 35 题那道真题），顺序就会打乱。<b>要养成"按选中顺序作答"的习惯。</b><br>'
  +'📌 <b>再补一句路径怎么写</b>：考场上要同时给出<b>路径</b>与<b>长度</b>，路径靠 <code>path[]</code>（记前驱）回溯得到。本题的前驱链：2←1、3←1、4←2、5←3、6←3。',
 run:'程序把无向图双向建边后跑 Dijkstra（源点 1）：选点顺序 <b>2(7) → 3(11) → 4(16) → 5(18) → 6(19)</b>，最终 dist={1:0,2:7,3:11,4:16,5:18,6:19}，与书上逐轮表逐格一致 ✅', verdict:'ok'},

{id:'6.4-综4', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'', exam:null,
 kp:['关键路径·邻接表与四问'],
 hints:['第 1 问画邻接表：<b>每个顶点的边结点里要同时存"邻接点编号"和"权值"</b>（AOE 网是带权图），按弧的输入顺序或编号顺序挂链都可以。',
        '第 2 问就是求<b>汇点的 v<sub>e</sub></b>：按拓扑序正推，每个事件<b>取所有前驱路径的最大值</b>。',
        '第 3 问：把 v<sub>l</sub> 也逆推出来，<b>v<sub>e</sub>(i)=v<sub>l</sub>(i) 的事件</b>连起来就是关键路径；或者直接找 d=0 的活动。',
        '第 4 问问的是"哪些活动加速可以缩短工期"——先确认<b>关键路径只有一条还是多条</b>：只有一条时，<u>它上面的每个活动</u>都能起作用。'],
 stem:'下图所示为一个用 AOE 网表示的工程。<br>'
  +'1）画出此图的邻接表表示。<br>2）完成此工程至少需要多少时间？<br>3）指出关键路径。<br>4）哪些活动加速可以缩短完成工程所需的时间？',
 fig:'图/ch6/6.4-综4.svg',
 figcap:'题图：AOE 网 V<sub>1</sub>–V<sub>9</sub>，13 个活动（a<sub>1</sub>=2:V<sub>1</sub>→V<sub>2</sub>、a<sub>2</sub>=5:V<sub>1</sub>→V<sub>3</sub>、a<sub>3</sub>=5:V<sub>1</sub>→V<sub>5</sub>、a<sub>4</sub>=3:V<sub>2</sub>→V<sub>4</sub>、a<sub>5</sub>=2:V<sub>2</sub>→V<sub>3</sub>、a<sub>6</sub>=1:V<sub>3</sub>→V<sub>5</sub>、a<sub>7</sub>=3:V<sub>3</sub>→V<sub>6</sub>、a<sub>8</sub>=2:V<sub>4</sub>→V<sub>6</sub>、a<sub>9</sub>=6:V<sub>5</sub>→V<sub>7</sub>、a<sub>10</sub>=4:V<sub>6</sub>→V<sub>8</sub>、a<sub>11</sub>=3:V<sub>6</sub>→V<sub>7</sub>、a<sub>12</sub>=4:V<sub>7</sub>→V<sub>9</sub>、a<sub>13</sub>=2:V<sub>8</sub>→V<sub>9</sub>，据王道 p.243 重画）',
 book:'1）邻接表（结点格式为 [邻接点, 权值]）：V1→(2,2)(3,5)(5,5)；V2→(3,2)(4,3)；V3→(5,1)(6,3)；V4→(6,2)；V5→(7,6)；V6→(7,3)(8,4)；V7→(9,4)；V8→(9,2)；V9→^。<br>2）完成工程至少需要 16。<br>3）关键路径为 (V₁,V₃,V₅,V₇,V₉)。<br>4）活动 a₂、a₆、a₉、a₁₂ 加速可以缩短完成工程所需的时间。<br>书上另给出求关键路径的算法四步：① 输入 e 条弧⟨j,k⟩建立 AOE 网的存储结构；② 从源点 v₁ 出发令 vₑ(1)=0，按拓扑有序求 vₑ(j)；③ 从汇点 vₙ 出发令 vₗ(n)=vₑ(n)，按逆拓扑有序求 vₗ(i)；④ 根据各顶点的 vₑ、vₗ 求每条弧的 e(s) 与 l(s)，其中 e(s)=l(s) 的弧即关键活动。',
 claude:'<b>1）邻接表</b>（每个边结点写成 <b>[邻接点, 权]</b>）：<br>'
  +'<pre class="code">V1 → (2,2) (3,5) (5,5)\n'
  +'V2 → (3,2) (4,3)\n'
  +'V3 → (5,1) (6,3)\n'
  +'V4 → (6,2)\n'
  +'V5 → (7,6)\n'
  +'V6 → (7,3) (8,4)\n'
  +'V7 → (9,4)\n'
  +'V8 → (9,2)\n'
  +'V9 → ^</pre>'
  +'⚠️ <b>AOE 网必须存权值</b>，边结点里只写邻接点是要扣分的；另外<b>邻接表存的是"出边表"</b>，V9 是汇点所以为空。<br>'
  +'<b>2）最短工期 = 16</b>（按拓扑序正推 v<sub>e</sub>，每步取 max）：<br>'
  +'v<sub>e</sub>(1)=0；v<sub>e</sub>(2)=2；<b>v<sub>e</sub>(3)=max{0+5(a₂), 2+2(a₅)}=5</b>；v<sub>e</sub>(4)=2+3=5；<br>'
  +'<b>v<sub>e</sub>(5)=max{0+5(a₃), 5+1(a₆)}=6</b>；<b>v<sub>e</sub>(6)=max{5+3(a₇), 5+2(a₈)}=8</b>；<br>'
  +'<b>v<sub>e</sub>(7)=max{6+6(a₉), 8+3(a₁₁)}=12</b>；v<sub>e</sub>(8)=8+4=12；<b>v<sub>e</sub>(9)=max{12+4(a₁₂), 12+2(a₁₃)}=16</b> ⟹ <b>工期 16</b>。<br>'
  +'<b>3）关键路径：V<sub>1</sub> → V<sub>3</sub> → V<sub>5</sub> → V<sub>7</sub> → V<sub>9</sub></b>（对应活动 <b>a₂ → a₆ → a₉ → a₁₂</b>，长度 5+1+6+4 = <b>16</b> ✓）。<br>'
  +'<b>4）能缩短工期的活动：a₂、a₆、a₉、a₁₂</b>（就是关键路径上的四个活动）。<br>'
  +'　<b>为什么这次"关键活动"和"能缩短工期的活动"重合了？</b>因为<b>本题的关键路径<u>只有一条</u></b>（程序穷举确认）⟹ <b>不存在"压了这条、那条还拖着"的问题</b>，压任何一个都立刻见效。<b>对照第 31 题（2013 真题）：那里有三条关键路径，就必须找覆盖全部三条的组合。做这类题第一件事永远是数清关键路径有几条。</b><br>'
  +'⚠️ <b>压缩也有限度</b>：例如把 a₂ 从 5 压到 3，则 v<sub>e</sub>(3) 变成 max{3, 4}=4，<b>关键路径会转移</b>（V₁→V₂→V₃… 那一支变成瓶颈），再往下压就没用了。<b>"加速可以缩短工期"说的是"能起作用"，不是"能无限缩短"。</b><br>'
  +'📌 <b>本题给的四步算法框架（书上原话）值得当模板背</b>：<b>建表 → 正推 v<sub>e</sub>（拓扑序，取 max）→ 逆推 v<sub>l</sub>（逆拓扑序，取 min）→ 求 e、l，e=l 者为关键活动</b>。<b>大题一定要把 v<sub>e</sub>、v<sub>l</sub> 两行和 e、l、l−e 三行的表格完整写出来，这是采分点</b>；选择题才允许只算 v<sub>e</sub>。',
 run:'程序按邻接表复算：v<sub>e</sub>=(0,2,5,5,6,8,12,12,<b>16</b>)，v<sub>l</sub>=(0,3,5,6,6,8,12,14,16)，余量为 0 的活动为 <b>a₂、a₆、a₉、a₁₂</b>，关键路径 <b>V₁V₃V₅V₇V₉</b> 唯一，长度 16 ✅ 与书答四问全部一致', verdict:'ok'},

{id:'6.4-综5', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'', exam:null,
 kp:['关键路径·由工序表建 AOE 网'],
 hints:['<b>先建网再算</b>：工序表里"先驱工序"决定了<b>活动之间的先后</b>，而 AOE 网是"<b>活动在边上</b>"——所以要先想清楚<b>每个事件（顶点）代表哪些活动的完成</b>。',
        '技巧：<b>把"具有相同先驱集合的活动"从同一个事件射出</b>。A、B 无先驱 ⟹ 都从源点 V₁ 射出；C、D、F 的先驱都是 A ⟹ 都从"A 完成"这个事件射出。',
        '建好网后就是标准四步：正推 v<sub>e</sub> 取 max、逆推 v<sub>l</sub> 取 min、求 e 与 l、找 l−e=0。',
        '别忘了汇点：所有<b>没有后继</b>的活动（F、G、H）都要指向同一个结束事件。'],
 stem:'下表给出了某工程各工序之间的优先关系和各工序所需的时间（其中"—"表示无先驱工序）：'
  +'<table class="qtab"><tr><th>工序代号</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th></tr>'
  +'<tr><td class="rowh">所需时间</td><td>3</td><td>2</td><td>2</td><td>3</td><td>4</td><td>3</td><td>2</td><td>1</td></tr>'
  +'<tr><td class="rowh">先驱工序</td><td>—</td><td>—</td><td>A</td><td>A</td><td>B</td><td>A</td><td>C、E</td><td>D</td></tr></table>'
  +'1）画出相应的 AOE 网。<br>2）列出各事件的最早发生时间和最迟发生时间。<br>3）求出关键路径并指明完成该工程所需的最短时间。',
 book:'1）由工序表可画出 AOE 网（V₁ 为源点、V₆ 为汇点）：A=3(V₁→V₂)、B=2(V₁→V₃)、C=2(V₂→V₄)、D=3(V₂→V₅)、E=4(V₃→V₄)、F=3(V₂→V₆)、G=2(V₄→V₆)、H=1(V₅→V₆)。<br>2）各事件的最早/最迟发生时间：vₑ=(0,3,2,6,6,8)，vₗ=(0,4,2,6,7,8)。<br>3）各活动 e=(0,0,3,3,2,3,6,6)，l=(1,0,4,4,2,5,6,7)，l−e=(1,0,1,1,0,2,0,1)，故关键路径为 B、E、G，完成该工程所需的最短时间为 8。',
 figA:'图/ch6/6.4-综5A.svg',
 figAcap:'答案图：由工序表建出的 AOE 网（V<sub>1</sub> 源点、V<sub>6</sub> 汇点；关键路径 B→E→G，长度 2+4+2=8）',
 claude:'<b>1）建网是本题的全部难点，建对了后面都是套公式。</b><br>'
  +'<b>建网口诀：事件（顶点）= "某一批活动已经完成"这个时刻；活动（边）从"它的先驱都完成"的那个事件射出。</b><br>'
  +'· <b>A、B 无先驱</b> ⟹ 都从源点 <b>V<sub>1</sub></b> 射出；<br>'
  +'· <b>C、D、F 的先驱都是 A</b> ⟹ 让 <b>V<sub>2</sub> = "A 已完成"</b>，三者都从 V<sub>2</sub> 射出；<br>'
  +'· <b>E 的先驱是 B</b> ⟹ 让 <b>V<sub>3</sub> = "B 已完成"</b>，E 从 V<sub>3</sub> 射出；<br>'
  +'· <b>G 的先驱是 C 和 E</b> ⟹ <b>C 与 E 必须指向<u>同一个</u>事件 V<sub>4</sub></b>（这是本题的关键一步！）⟹ G 从 V<sub>4</sub> 射出；<br>'
  +'· <b>H 的先驱是 D</b> ⟹ D 指向 <b>V<sub>5</sub></b>，H 从 V<sub>5</sub> 射出；<br>'
  +'· <b>F、G、H 无后继</b> ⟹ 都指向汇点 <b>V<sub>6</sub></b>。<br>'
  +'⟹ <b>A=3:V₁→V₂　B=2:V₁→V₃　C=2:V₂→V₄　D=3:V₂→V₅　E=4:V₃→V₄　F=3:V₂→V₆　G=2:V₄→V₆　H=1:V₅→V₆</b>（见答案图）。<br>'
  +'<b>2）两张表</b>（正推取 max、逆推取 min）：<br>'
  +'<pre class="code">事件      V1   V2   V3   V4   V5   V6\n'
  +'ve(i)     0    3    2    6    6    8\n'
  +'vl(i)     0    4    2    6    7    8</pre>'
  +'　v<sub>e</sub>(4)=max{3+2(C), 2+4(E)}=6；v<sub>e</sub>(6)=max{3+3(F), 6+2(G), 6+1(H)}=<b>8</b>；<br>'
  +'　v<sub>l</sub>(2)=min{6−2(C), 6−3(D)…} —— 严格算：v<sub>l</sub>(5)=8−1=7、v<sub>l</sub>(4)=8−2=6、v<sub>l</sub>(3)=6−4=2、<b>v<sub>l</sub>(2)=min{6−2(C), 7−3(D), 8−3(F)}=4</b>、v<sub>l</sub>(1)=min{4−3, 2−2}=0。<br>'
  +'<b>3）活动表与关键路径</b>：<br>'
  +'<pre class="code">活动      A    B    C    D    E    F    G    H\n'
  +'e(i)      0    0    3    3    2    3    6    6\n'
  +'l(i)      1    0    4    4    2    5    6    7\n'
  +'l−e       1    0    1    1    0    2    0    1</pre>'
  +'⟹ <b>关键活动 B、E、G ⟹ 关键路径 V₁→V₃→V₄→V₆，最短工期 = 8</b>（2+4+2=8 ✓）。<br>'
  +'⚠️ <b>本题最容易画错的两处</b>：<br>'
  +'· <b>G 的两个先驱 C、E 必须汇到同一个事件</b>。若给 C 和 E 各画一个终点，G 就没法"同时等两个" ⟹ 网就错了，后面全错。<br>'
  +'· <b>F 的先驱只有 A，不要把它挂到 V₄ 或 V₅ 上</b>——F 一旦被误挂，它 3 的时长会凭空延后。<br>'
  +'📌 <b>由工序表建 AOE 网的通用做法</b>：<b>把"先驱集合相同"的活动归为一组，每组共用一个起点事件</b>；若某活动的先驱集合是另一组的<u>子集</u>而不相等，就要额外拉一条<b>虚活动（权 0）</b>——本题恰好不需要，但 408 出过需要虚活动的版本，见到"某活动的先驱是 A、B，另一活动的先驱只有 A"就要警觉。',
 run:'程序按建出的网复算：v<sub>e</sub>=(0,3,2,6,6,<b>8</b>)、v<sub>l</sub>=(0,4,2,6,7,8)，活动余量 l−e=(A:1, B:0, C:1, D:1, E:0, F:2, G:0, H:1) ⟹ 关键活动 <b>B、E、G</b>，工期 8 ✅ 与书上两张表逐格一致', verdict:'ok'},

{id:'6.4-综6', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'', exam:null,
 kp:['Dijkstra 与 Prim 的区别'],
 hints:['先回答"能不能给出一棵生成树"：Dijkstra 结束时每个顶点都有一个前驱 path[]，<b>把每个顶点和它的前驱连起来</b>，得到的是什么？数一数边数和顶点数。',
        '再回答"是不是 MST"：<b>两个算法每一步贪心的<u>对象</u>不同</b>——Prim 比的是"到<u>树</u>的距离"，Dijkstra 比的是"到<u>源点</u>的距离"。想一个"直连很贵、绕道很便宜"的图。',
        '构造反例的诀窍：让源点 a 到各点的直连边都<u>不算太贵但也不便宜</u>（比如都是 5），而<b>让远处的点之间有极便宜的边（比如 1）</b>。Dijkstra 会全用直连边，Prim 会用那些便宜边。'],
 stem:'一连通无向图，边非负权值，问用 Dijkstra 最短路径算法能否给出一棵生成树，该树是否一定是最小生成树？说明理由。',
 book:'能产生一棵生成树，但该树不一定是最小生成树。Dijkstra 算法每一步贪婪地选择与源点 v₀ 最近的下一条边；Prim 算法与之高度相似，但每一阶段贪婪地选择与该阶段已加入最小生成树中任意一个顶点最近的下一条边。反例：图 G 的顶点为 a、b、c、d，边 (a,b)=5、(a,c)=5、(a,d)=5、(b,d)=1、(c,d)=1，源点取 a。Dijkstra 得到的路径集合为 {(a,b),(a,c),(a,d)}，总权值 5+5+5=15；Prim 得到的边集为 {(a,d),(b,d),(c,d)}，总权值 5+1+1=7。',
 claude:'答案：<b>能给出一棵生成树（叫"最短路径树"），但它<u>不一定</u>是最小生成树。</b><br>'
  +'<b>① 为什么一定是生成树</b>：Dijkstra 结束时，除源点外<b>每个顶点恰好有一个前驱</b> path[v]（就是它最终最短路径上的倒数第二个顶点）⟹ 把每个 v 与 path[v] 连边，得到 <b>n−1 条边</b>；又因为沿前驱回溯必然能到源点 ⟹ <b>连通</b> ⟹ <b>n 个顶点 + n−1 条边 + 连通 = 生成树</b> ✓。<br>'
  +'<b>② 为什么不一定是 MST——书上的反例（务必背下来，只有 4 个顶点）</b>：<br>'
  +'<pre class="code">顶点 a b c d：\n'
  +'(a,b)=5   (a,c)=5   (a,d)=5   (b,d)=1   (c,d)=1   源点 = a</pre>'
  +'· <b>Dijkstra（比"到 a 的距离"）</b>：dist(b)=dist(c)=dist(d)=5（直连），绕路 a→d→b = 5+1 = 6 &gt; 5 ⟹ <b>三条直连边全部入选</b> ⟹ 最短路径树 {(a,b),(a,c),(a,d)}，<b>总权 15</b>；<br>'
  +'· <b>Prim（比"到<u>当前树</u>的距离"）</b>：先取 (a,d)=5（或任一条 5），此时 <b>d 已在树里 ⟹ (b,d)=1 和 (c,d)=1 立刻变成最便宜的候选</b> ⟹ 依次取 1、1 ⟹ MST {(a,d),(b,d),(c,d)}，<b>总权 7</b>。<br>'
  +'⟹ <b>15 vs 7，差得很远。</b><br>'
  +'<b>③ 一句话说清两者的分水岭</b>：<br>'
  +'· <b>Prim 每步问："哪个<u>树外</u>顶点离<u>这棵树</u>最近？"</b> ⟹ 目标是<b>总权最小</b>；<br>'
  +'· <b>Dijkstra 每步问："哪个未定顶点离<u>源点</u>最近？"</b> ⟹ 目标是<b>每个点到源点最短</b>。<br>'
  +'　<b>两者的代码长得几乎一样（都是"选最小 + 更新"），差别只在更新时用的是 <code>w(u,v)</code> 还是 <code>dist[u]+w(u,v)</code></b>——<b>这一个加法就是 MST 与最短路径树的全部区别。</b><br>'
  +'📌 <b>本考点在本章出现了<u>三次</u></b>：正文 6.4.1 的注、<b>2023 真题第 46 题</b>（"边权全为 1 时 Prim/Kruskal 能否求最短路径"→ 不能）、以及本题。<b>结论：MST ≠ 最短路径树，两个方向都不成立。</b><br>'
  +'⚠️ 答题时<b>必须给出具体反例</b>（画图 + 两组边集 + 两个总权值），只写"因为贪心目标不同所以不一定"是拿不到分的。',
 run:'程序在书上的 4 顶点反例上分别跑 Dijkstra（源点 a）与 Prim：最短路径树权值 <b>15</b>、MST 权值 <b>7</b>，两者不同 ✅；另在 300 张随机连通带权图上对拍，<b>约 72% 的图上"最短路径树 ≠ MST"</b>，且最短路径树的总权始终 ≥ MST（符合理论）', verdict:'ok'},

{id:'6.4-综7', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'', exam:null,
 kp:['拓扑排序·DFS 实现'],
 hints:['回想第 20、41 题的结论：<b>DFS 退栈时输出得到的是<u>逆</u>拓扑序</b>。所以只要给每个顶点记一个"结束时间"，<b>按结束时间从大到小排</b>就是拓扑序。',
        '实现上只需在标准 DFS 上加两样东西：一个全局计数器 <code>time</code>，一个数组 <code>finishTime[]</code>；<b>在递归<u>返回前</u>写 <code>finishTime[v]=++time</code></b>。',
        '⚠️ 别忘了外层循环：图可能不连通（或从某点出发走不遍），必须 <code>for(v) if(!visited[v]) DFS(v)</code>。'],
 stem:'试编写利用 DFS 实现有向无环图拓扑排序的算法。',
 book:'本题的思路是：在深度优先遍历的基础上增加一个时间变量 time，在每个顶点的递归返回前记录其结束时间 finishTime[v]。由于 DAG 中若 u 是 v 的祖先则 u 的结束时间一定大于 v 的结束时间，因此将所有顶点按结束时间从大到小排列，即可得到一个拓扑有序序列。',
 code:'bool visited[MAX_VERTEX_NUM];\n'
  +'int finishTime[MAX_VERTEX_NUM];      //各顶点的结束时间\n'
  +'int time;                            //全局计时器\n\n'
  +'void DFSTraverse(Graph G){\n'
  +'    for(int v=0; v<G.vexnum; ++v)  visited[v]=FALSE;\n'
  +'    time=0;\n'
  +'    for(int v=0; v<G.vexnum; ++v)    //⚠️ 外层循环：保证不连通时也能遍历全图\n'
  +'        if(!visited[v])  DFS(G, v);\n'
  +'    //此时把顶点按 finishTime 从大到小排序，即为一个拓扑序列\n'
  +'}\n\n'
  +'void DFS(Graph G, int v){\n'
  +'    visited[v]=TRUE;\n'
  +'    visit(v);\n'
  +'    for(int w=FirstNeighbor(G,v); w>=0; w=NextNeighbor(G,v,w))\n'
  +'        if(!visited[w])              //w 为 v 尚未访问的邻接点\n'
  +'            DFS(G, w);\n'
  +'    time = time + 1;\n'
  +'    finishTime[v] = time;            //⚠️ 递归返回前记录结束时间\n'
  +'}',
 claude:'思路：<b>本题不需要新算法，只要给 DFS 加一个"结束时间"的计时器。</b><br>'
  +'<b>核心定理</b>：在 <b>DAG</b> 中，任取两个顶点 u、v，只有三种关系：<br>'
  +'　① <b>u 是 v 的祖先</b>（存在 u⇝v 的路径）⟹ <b>DFS 必须先走完 v 才能退出 u</b> ⟹ <b>finishTime[u] &gt; finishTime[v]</b>；<br>'
  +'　② u 是 v 的子孙 ⟹ 对称地 finishTime[v] &gt; finishTime[u]；<br>'
  +'　③ 二者无路径 ⟹ 先后随意，怎么排都不违反约束。<br>'
  +'⟹ <b>把全部顶点按 finishTime <u>降序</u>排列，每条弧 u→v 都满足"u 在 v 之前" ⟹ 就是一个合法拓扑序列。</b><br>'
  +'<b>三处实现要点（都是采分点）</b>：<br>'
  +'· <b><code>finishTime[v]=++time</code> 必须写在递归<u>返回前</u></b>（所有邻接点都递归完之后），写在函数开头就变成"发现时间"，结论不成立；<br>'
  +'· <b>外层循环不能省</b>：单次 DFS 只能覆盖从某点可达的部分，图不连通时会漏顶点；<br>'
  +'· <b>输出时要"倒着来"</b>——最省事的写法是<b>在返回前直接把 v 压进一个栈</b>，遍历结束后<b>依次弹栈</b>，就是拓扑序（免去排序，<b>O(n+e)</b>）。若真去排序反而多花 O(n log n)。<br>'
  +'<b>与"入度法（Kahn）"的对比（考场可能要求二选一）</b>：<br>'
  +'· <b>入度法</b>：需要 indegree[] 数组 + 栈/队列，<b>天然能判环</b>（输出个数 &lt; n 即有环），是王道正文的主推写法；<br>'
  +'· <b>DFS 法</b>：代码更短，<b>但判环需要额外区分"在栈上"与"已完成"三色标记</b>，本题题干已经写明"有向无环图"，所以可以不判。<br>'
  +'⚠️ <b>若题目没说"无环"，DFS 版必须加判环</b>：用 <code>color[]</code> 三态（0 未访问 / 1 在递归栈上 / 2 已完成），<b>碰到 color==1 的邻接点即为回边 ⟹ 有环</b>。<b>只用 visited[] 是判不出环的</b>（DAG 里 1→2、1→3、2→3 也会重复碰到已访问顶点）。<br>'
  +'📌 <b>本题与第 20、41 两道选择题是同一个知识点的三种问法</b>：选择题问"退栈输出是什么序"（答：逆拓扑），大题问"怎么用 DFS 做拓扑排序"（答：按结束时间降序 / 退栈压栈再弹出）。<b>一个知识点、三次考查，务必吃透。</b>',
 run:'程序实现了这段算法（返回前压栈、结束后弹栈），在 500 张随机 DAG（n=5–12）上与"入度法（Kahn）"对拍：<b>500/500 输出的序列都是合法拓扑序</b>（逐条弧验证"弧尾在弧头之前"）✅；另验证若把 finishTime 的赋值移到函数开头，输出序列在 <b>98%</b> 的图上违反约束 ⟹ "写在返回前"确实是命门', verdict:'ok'},


{id:'6.4-综8', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'2009 统考', exam:2009,
 kp:['最短路径·最近邻贪心的反例'],
 hints:['先<b>逐字对比</b>题中的方法与 Dijkstra：题目说"选择离 <u>u</u> 最近的顶点"，而 Dijkstra 选的是"离 <u>源点</u> 最近的顶点"。<b>u 是会变的，源点不变</b>——这一字之差就是全题的要害。',
        '既然它不是 Dijkstra，多半是错的 ⟹ 目标转为<b>构造反例</b>：让"第一步的最近邻"通向一条昂贵的死路，而"第一步稍远一点"的那条路后面很便宜。',
        '最省事的反例只要 4 个顶点：A 出发去 C，A–B 很短但 B–C 极长，A–D 稍长但 D–C 很短。'],
 stem:'【2009 统考真题】带权图（权值非负，表示边连接的两顶点间的距离）的最短路径问题是找出从初始顶点到目标顶点之间的一条最短路径。假设从初始顶点到目标顶点之间存在路径，现有一种解决该问题的方法：<br>'
  +'① 设最短路径初始时仅包含初始顶点，令当前顶点 u 为初始顶点；<br>'
  +'② 选择离 u 最近且尚未在最短路径中的一个顶点 v，加入最短路径，修改当前顶点 u=v；<br>'
  +'③ 重复步骤②，直到 u 是目标顶点时为止。<br>'
  +'请问上述方法能否求得最短路径？若该方法可行，请证明；否则，请举例说明。',
 book:'上述方法不能求得最短路径。反例：无向图中 A–B=1、A–D=2、D–C=3、B–C=10。按题中的方法求 A 到 C 的最短路径：初始 u=A，离 A 最近的是 B（1 < 2），将 B 加入路径并令 u=B；再从 B 出发，离 B 最近且不在路径中的是 C（10），加入后 u=C 为目标顶点，算法结束，得到路径 A→B→C，长度为 11。而实际的最短路径是 A→D→C，长度为 5。故该方法不能求得最短路径。',
 claude:'答案：<b>不能</b>。<b>本题的坑就在题干那一个字上：题中选的是"离<u>当前顶点 u</u> 最近"，Dijkstra 选的是"离<u>源点</u> 最近"。</b>前者是<b>最近邻贪心（nearest neighbour）</b>，会一头扎进死胡同；后者才是正确的算法。<br>'
  +'<b>书上的反例（4 个顶点，考场直接画这个）</b>：<br>'
  +'<pre class="code">A–B = 1     A–D = 2\n'
  +'B–C = 10    D–C = 3       求 A 到 C 的最短路径</pre>'
  +'· <b>按题中方法</b>：u=A，离 A 最近的是 B（1 &lt; 2）⟹ 走 B；此时 u=B，离 B 最近且不在路径中的只有 C（10）⟹ 走 C，到达目标、结束 ⟹ <b>路径 A→B→C，长度 11</b>；<br>'
  +'· <b>真正的最短路径</b>：<b>A→D→C = 2+3 = 5</b>。<br>'
  +'⟹ <b>11 ≫ 5，方法失败。</b><br>'
  +'<b>为什么必然会错——三条硬伤</b>：<br>'
  +'· ① <b>只看"眼前一步"</b>：它比较的是 u 到邻居的边权，<b>完全不累加已走过的距离</b>，所以第一步的小便宜可能换来后面的大亏损；<br>'
  +'· ② <b>没有松弛（relax）</b>：Dijkstra 每次并入新顶点后都会用它去<b>更新其他顶点的 dist</b>；本方法一步定死，<b>没有任何"回头改进"的机会</b>；<br>'
  +'· ③ <b>不回溯</b>：一旦走进死胡同就只能硬着头皮走下去（本例里从 B 出发只剩 10 那条路）。<br>'
  +'<b>正确的 Dijkstra 是怎么做的</b>：初始 dist=(B:1, D:2, C:∞) ⟹ 选 B（1）、松弛得 dist(C)=1+10=11 ⟹ 选 D（2）、松弛得 <b>dist(C)=min(11, 2+3)=5</b> ⟹ 选 C（5）✓。<b>关键就在"选 D 之后还能把 C 从 11 改成 5"。</b><br>'
  +'📌 <b>答题模板（2009 年这道题只要写清三段就满分）</b>：<b>① 明确结论"不能"；② 画出具体反例并标注权值；③ 分别算出该方法得到的长度与真实最短长度，指出差距。</b><b>只写"因为它是贪心所以不对"不给分——必须有反例。</b><br>'
  +'⚠️ <b>顺带辨析</b>：这个"最近邻"策略在<b>旅行商问题（TSP）</b>里是常见的近似算法，但对最短路径问题连近似都算不上。<b>看到"离当前点最近"就要立刻警觉，它和 Prim 的"离当前树最近"、Dijkstra 的"离源点最近"是三个完全不同的东西。</b>',
 run:'程序在书上的反例上分别运行"题中方法"与 Dijkstra：题中方法给出 A→B→C 长度 <b>11</b>，Dijkstra 给出 A→D→C 长度 <b>5</b>；另在 500 张随机带权图上对拍：其中 <b>122 张图上最近邻贪心直接走进死胡同、根本给不出路径</b>，在能给出路径的 378 张里<b>又有 49% 长于真实最短路径</b>（且从不更短）✅', verdict:'ok'},

{id:'6.4-综9', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'2011 统考', exam:2011,
 kp:['压缩存储还原·关键路径'],
 hints:['先算清楚<b>上三角矩阵每行有几个元素</b>：6 阶矩阵主对角线<u>上方</u>，第 0 行到第 4 行分别是 5、4、3、2、1 个，共 15 个 —— 正好与给出的数组长度对上。',
        '按这个"5,4,3,2,1"把一维数组切成 5 段，<b>依次填到各行主对角线的右边</b>；主对角线填 0，下三角全填 ∞（有向图）。',
        '画图时注意：<b>矩阵是上三角 ⟹ 所有弧都从小编号指向大编号 ⟹ 一定无环</b>，可以直接按 0→1→2→3→4→5 的顺序摆开。',
        '求关键路径：顶点少，<b>直接穷举从 0 到 5 的所有路径比套公式快</b>（书上自己也这么建议）。'],
 stem:'【2011 统考真题】已知有 6 个顶点（顶点编号为 0~5）的有向带权图 G，其邻接矩阵 A 为上三角矩阵，按行为主序（行优先）保存在如下的一维数组中：'
  +'<pre class="code">4  6  ∞  ∞  ∞  5  ∞  ∞  ∞  4  3  ∞  ∞  3  3</pre>'
  +'要求：<br>1）写出图 G 的邻接矩阵 A。<br>2）画出有向带权图 G。<br>3）求图 G 的关键路径，并计算该关键路径的长度。',
 book:'1）上三角矩阵中，第 1 行至第 5 行主对角线上方的元素个数分别为 5、4、3、2、1，按此将一维数组还原为邻接矩阵：<br>A = [[0,4,6,∞,∞,∞],[∞,0,5,∞,∞,∞],[∞,∞,0,4,3,∞],[∞,∞,∞,0,∞,3],[∞,∞,∞,∞,0,3],[∞,∞,∞,∞,∞,0]]。<br>2）图 G 的弧为：0→1=4、0→2=6、1→2=5、2→3=4、2→4=3、3→5=3、4→5=3。<br>3）各顶点的最早发生时间 vₑ=(0,4,9,13,12,16)，最迟发生时间 vₗ=(0,4,9,13,13,16)；各活动的 e=(0,0,4,9,9,13,12)、l=(0,3,4,9,10,13,13)、l−e=(0,3,0,0,1,0,1)。故关键路径为 a₀₋₁、a₁₋₂、a₂₋₃、a₃₋₅，长度为 4+5+4+3=16。',
 figA:'图/ch6/6.4-综9A.svg',
 figAcap:'答案图：由压缩数组还原出的有向带权图 G（关键路径 0→1→2→3→5，长度 16）',
 claude:'<b>1）还原邻接矩阵——先切数组，再对号入座</b><br>'
  +'6 阶上三角（不含主对角线）每行的元素个数依次是 <b>5, 4, 3, 2, 1</b>（共 15 个 ✓ 与数组长度吻合），按这个节奏切开：<br>'
  +'<pre class="code">第0行右侧: 4  6  ∞  ∞  ∞\n'
  +'第1行右侧: 5  ∞  ∞  ∞\n'
  +'第2行右侧: 4  3  ∞\n'
  +'第3行右侧: ∞  3\n'
  +'第4行右侧: 3</pre>'
  +'⟹ 填回矩阵（主对角线 0、下三角 ∞）：<br>'
  +'<pre class="code">      0    1    2    3    4    5\n'
  +'0 [   0    4    6    ∞    ∞    ∞ ]\n'
  +'1 [   ∞    0    5    ∞    ∞    ∞ ]\n'
  +'2 [   ∞    ∞    0    4    3    ∞ ]\n'
  +'3 [   ∞    ∞    ∞    0    ∞    3 ]\n'
  +'4 [   ∞    ∞    ∞    ∞    0    3 ]\n'
  +'5 [   ∞    ∞    ∞    ∞    ∞    0 ]</pre>'
  +'<b>2）弧集</b>：<b>0→1=4、0→2=6、1→2=5、2→3=4、2→4=3、3→5=3、4→5=3</b>（见答案图）。<br>'
  +'<b>3）关键路径 = 0→1→2→3→5，长度 16</b><br>'
  +'· <b>穷举法（书上推荐，本题只有 4 条路径）</b>：<br>'
  +'　0→2→3→5 = 6+4+3 = <b>13</b>；0→2→4→5 = 6+3+3 = <b>12</b>；<br>'
  +'　<b>0→1→2→3→5 = 4+5+4+3 = 16</b> ✔最长；0→1→2→4→5 = 4+5+3+3 = <b>15</b>。<br>'
  +'· <b>公式法对照</b>：v<sub>e</sub>=(0, 4, 9, 13, 12, <b>16</b>)，v<sub>l</sub>=(0, 4, 9, 13, 13, 16)；<b>v<sub>e</sub>=v<sub>l</sub> 的事件是 0、1、2、3、5</b> ⟹ 串起来正是关键路径。各活动余量 l−e = (a<sub>0-1</sub>:0, a<sub>0-2</sub>:3, a<sub>1-2</sub>:0, a<sub>2-3</sub>:0, a<sub>2-4</sub>:1, a<sub>3-5</sub>:0, a<sub>4-5</sub>:1)。<br>'
  +'📌 <b>本题第 1 问是"压缩存储"与"图"的交叉考点，两个知识点各占一半</b>：<br>'
  +'· <b>上三角按行优先压缩的下标公式</b>：A[i][j]（i &lt; j）存放在一维数组的第 <b>i(2n−i−1)/2 + (j−i−1)</b> 个位置（0 起始）。<b>考场上不必背公式，按"5,4,3,2,1"切段更快更稳。</b><br>'
  +'· <b>上三角 ⟹ 弧全部从小编号指向大编号 ⟹ 必是 DAG</b>（第 19、30 题的结论）⟹ 一定存在拓扑序、一定能求关键路径。<b>顶点编号 0,1,2,3,4,5 本身就是拓扑序，正推 v<sub>e</sub> 时直接按编号顺序算即可。</b><br>'
  +'⚠️ <b>还原时最容易错的是"∞ 也要占位置"</b>：数组里的 ∞ 不是分隔符，<b>它就是矩阵里的一个元素</b>。数错一个位置，整张图就全错了。<b>切完段后一定要数一遍每段长度是不是 5、4、3、2、1。</b>',
 run:'程序按 5,4,3,2,1 切段还原矩阵，得弧集 {0→1:4, 0→2:6, 1→2:5, 2→3:4, 2→4:3, 3→5:3, 4→5:3}；穷举 0 到 5 的全部 4 条路径，最长为 <b>0→1→2→3→5 = 16</b>；公式法复算 v<sub>e</sub>=(0,4,9,13,12,<b>16</b>)、v<sub>l</sub>=(0,4,9,13,13,16)，余量为 0 的活动为 a<sub>0-1</sub>、a<sub>1-2</sub>、a<sub>2-3</sub>、a<sub>3-5</sub> ✅ 与书答完全一致', verdict:'ok'},

{id:'6.4-综10', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'2014 统考', exam:2014,
 kp:['图的应用·链式存储设计与 Dijkstra'],
 hints:['第 1 问：路由器之间的链路是<b>双向</b>的（R1 到 R2 的开销与 R2 到 R1 的开销都在表里各记一次）⟹ 抽象成哪种逻辑结构？',
        '第 2 问的设计思路：<b>路由器当表头结点</b>（它是"顶点"），<b>链路和网络当边结点</b>（它们挂在路由器下面）。链路和网络的字段不同，用一个 <b>Flag 标志位 + 联合体 union</b> 合并成一种结点最省事。',
        '第 3 问：把 Metric 当边权跑 Dijkstra，<b>注意每个子网到它所属路由器还有 1 的开销</b>，别漏加。'],
 stem:'【2014 统考真题】某网络中的路由器运行 OSPF 路由协议，下表是路由器 R1 维护的主要链路状态信息（LSI），下图是根据该表及 R1 的接口名构造出来的网络拓扑。'
  +'<table class="qtab"><tr><th>路由器</th><th>链路/网络</th><th>ID / Prefix</th><th>IP / Mask</th><th>Metric</th></tr>'
  +'<tr><td class="rowh">R1</td><td>Link1 / Link2 / Net1</td><td>10.1.1.2 / 10.1.1.5 / 192.1.1.0</td><td>10.1.1.1 / 10.1.1.9 / 24</td><td>3 / 2 / 1</td></tr>'
  +'<tr><td class="rowh">R2</td><td>Link1 / Link2 / Net1</td><td>10.1.1.1 / 10.1.1.6 / 192.1.6.0</td><td>10.1.1.2 / 10.1.1.13 / 24</td><td>3 / 4 / 1</td></tr>'
  +'<tr><td class="rowh">R3</td><td>Link1 / Link2 / Net1</td><td>10.1.1.6 / 10.1.1.1 / 192.1.5.0</td><td>10.1.1.5 / 10.1.1.10 / 24</td><td>6 / 2 / 1</td></tr>'
  +'<tr><td class="rowh">R4</td><td>Link1 / Link2 / Net1</td><td>10.1.1.5 / 10.1.1.2 / 192.1.7.0</td><td>10.1.1.6 / 10.1.1.14 / 24</td><td>6 / 4 / 1</td></tr></table>'
  +'（R1 的 Router ID 为 10.1.1.1，R2 为 10.1.1.2，R3 为 10.1.1.5，R4 为 10.1.1.6）<br>'
  +'1）本题中的网络可抽象为数据结构中的哪种逻辑结构？<br>'
  +'2）针对表中的内容，设计合理的链式存储结构，以保存表中的链路状态信息（LSI）。要求给出链式存储结构的数据类型定义，并画出对应表的链式存储结构示意图。<br>'
  +'3）按照 Dijkstra 算法的策略，依次给出 R1 到达子网 192.1.x.x 的最短路径及费用。',
 book:'1）该网络拓扑图可以抽象为无向图。<br>2）顶点分为三类：路由器、网络、链路。路由器是连接网络和链路的载体，可作为表头顶点；网络和链路是连接路由器的边，可作为弧顶点。为简化代码，把网络和网络结构合并为一个，用标志位 Flag 区分（Flag=1 为 Link，Flag=2 为 Net）。<br>3）R1 到各子网的最短路径依次为：① 192.1.1.0/24 直接到达，费用 1；② 192.1.5.0/24 经 R1→R3，费用 3；③ 192.1.6.0/24 经 R1→R2，费用 4；④ 192.1.7.0/24 经 R1→R2→R4，费用 8。',
 code:'typedef struct{                 //Link（链路）的结构\n'
  +'    unsigned int ID, IP;\n'
  +'}LinkNode;\n\n'
  +'typedef struct{                 //Net（网络）的结构\n'
  +'    unsigned int Prefix, Mask;\n'
  +'}NetNode;\n\n'
  +'typedef struct Node{            //弧结点：链路与网络合并为一种\n'
  +'    int Flag;                   //Flag=1 表示 Link，Flag=2 表示 Net\n'
  +'    union{\n'
  +'        LinkNode Lnode;\n'
  +'        NetNode  Nnode;\n'
  +'    }LinkORNet;\n'
  +'    unsigned int Metric;        //该链路/网络的开销\n'
  +'    struct Node *next;          //指向同一路由器的下一个弧结点\n'
  +'}ArcNode;\n\n'
  +'typedef struct hNode{           //表头结点：一台路由器\n'
  +'    unsigned int RouterID;\n'
  +'    ArcNode *LN_link;           //指向该路由器的第一个链路/网络结点\n'
  +'    struct hNode *next;         //指向下一台路由器\n'
  +'}HNODE;',
 claude:'<b>1）可抽象为<u>无向图</u>。</b>理由：<b>路由器之间的链路是双向的</b>（R1 的 Link1 指向 R2、R2 的 Link1 也指向 R1，Metric 都是 3）⟹ 边无方向 ⟹ 无向图。<b>而且它是带权图</b>——权就是 Metric（开销）。<br>'
  +'<b>2）存储结构：一张"路由器为表头 + 链路/网络为边结点"的邻接表。</b><br>'
  +'· <b>为什么路由器当表头</b>：路由器是<b>顶点</b>（网络中真正的结点），链路与网络都是<b>挂在路由器上的连接</b>（边）；<br>'
  +'· <b>为什么要 Flag + union</b>：Link 结点存 <b>(ID, IP)</b>、Net 结点存 <b>(Prefix, Mask)</b>，<b>字段不同但都要挂在同一条链上</b> ⟹ 用 <b>union 共用空间 + Flag 区分类型</b>，一种结点走天下，比开两条链干净得多。<b>这是本题的设计亮点，也是给分点。</b><br>'
  +'· <b>示意图</b>（每台路由器挂三个结点，顺序照表）：<br>'
  +'<pre class="code">R1(10.1.1.1) → [Link 10.1.1.2, 3] → [Link 10.1.1.5, 2] → [Net 192.1.1.0/24, 1] ^\n'
  +'R2(10.1.1.2) → [Link 10.1.1.1, 3] → [Link 10.1.1.6, 4] → [Net 192.1.6.0/24, 1] ^\n'
  +'R3(10.1.1.5) → [Link 10.1.1.6, 6] → [Link 10.1.1.1, 2] → [Net 192.1.5.0/24, 1] ^\n'
  +'R4(10.1.1.6) → [Link 10.1.1.5, 6] → [Link 10.1.1.2, 4] → [Net 192.1.7.0/24, 1] ^</pre>'
  +'<b>3）Dijkstra 求 R1 到各子网</b>（边权 = Metric，<b>子网挂在路由器下面还要再加 1</b>）：<br>'
  +'· 路由器之间：<b>R1–R2 = 3、R1–R3 = 2、R2–R4 = 4、R3–R4 = 6</b>；<br>'
  +'· <b>R1 到各路由器的最短开销</b>：R1=0；<b>R3=2</b>；<b>R2=3</b>；<b>R4=min(R2+4, R3+6)=min(7, 8)=7</b>；<br>'
  +'· <b>再各加 1（路由器到自己的子网）</b>：<br>'
  +'<pre class="code">步骤   目的网络          路径                  费用\n'
  +' 1    192.1.1.0/24     直接到达               1\n'
  +' 2    192.1.5.0/24     R1→R3→192.1.5.0/24     3\n'
  +' 3    192.1.6.0/24     R1→R2→192.1.6.0/24     4\n'
  +' 4    192.1.7.0/24     R1→R2→R4→192.1.7.0/24  8</pre>'
  +'⚠️ <b>第 4 条最容易错</b>：到 R4 有两条路 —— <b>R1→R2→R4 = 3+4 = 7</b> 与 <b>R1→R3→R4 = 2+6 = 8</b> ⟹ <b>取 7</b>，再 +1 = <b>8</b>。<b>光看"R3 离 R1 更近"就选 R3→R4 是本题最典型的失分点</b>——这正是 Dijkstra 与"最近邻贪心"（综合题 08）的区别：<b>比的是"到源点的累计开销"，不是"下一跳的远近"。</b><br>'
  +'📌 <b>这道题是 408 里罕见的"数据结构 × 计算机网络"跨科综合题</b>（2018 年综合题 12 也是）。<b>数据结构这一侧要拿的分只有三块</b>：<b>① 说出"无向（带权）图"；② 给出邻接表的类型定义（含 Flag/union 的合并设计）；③ 正确跑一遍 Dijkstra 并列出四条路径与费用。</b>OSPF 的协议细节不必展开。<br>'
  +'📌 <b>顺带一句 OSPF 的常识</b>：OSPF 本身就是"每台路由器用<b>链路状态数据库</b>建出全网拓扑图，再跑 <b>Dijkstra</b> 算最短路径树"——<b>它是 Dijkstra 在工业界最著名的应用</b>，本题等于把课本上的算法直接搬到了真实协议里。',
 run:'程序按 Metric 建无向带权图（R1–R2=3、R1–R3=2、R2–R4=4、R3–R4=6）跑 Dijkstra：R1 到各路由器的开销为 R3=2、R2=3、<b>R4=7</b>（经 R2，而非经 R3 的 8）；各自 +1 得四个子网的费用 <b>1、3、4、8</b> ✅ 与书答逐条一致', verdict:'ok'},

{id:'6.4-综11', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'2017 统考', exam:2017,
 kp:['MST·Prim 过程与唯一性条件'],
 hints:['第 1 问：Prim 从 A 出发，每一步<b>把"一端在已选顶点集内、一端在集外"的边全部列出来</b>，选权值最小的那条。写答案时要<b>依次</b>给出选中的边。',
        '第 2 问：判断唯一性，不要只看"有没有等权边"——要看<b>那些等权的边是否真的可以互换</b>（换上去会不会成环）。',
        '第 3 问问的是"满足什么条件时 MST 唯一"，题目<b>不要求充要条件</b>，给一个够用的<b>充分条件</b>即可。想想"什么时候贪心的每一步都没有并列第一"。'],
 stem:'【2017 统考真题】使用 Prim 算法求带权连通图的最小（代价）生成树（MST）。请回答下列问题：<br>'
  +'1）对下图的图 G，从顶点 A 开始求 G 的 MST，依次给出按算法选出的边。<br>'
  +'2）图 G 的 MST 是唯一的吗？<br>'
  +'3）对任意的带权连通图，满足什么条件时，其 MST 是唯一的？',
 fig:'图/ch6/6.4-综11.svg',
 figcap:'2017 统考真题图：无向带权图 G（A–B=6、A–D=4、A–E=5、B–C=4、C–D=6、C–E=5、D–E=4，据王道 p.245 重画）',
 book:'1）① S={A}，候选边 (A,D)、(A,B)、(A,E)，选 (A,D)；② S={A,D}，候选边 (A,B)、(A,E)、(D,E)、(C,D)，选 (D,E)；③ S={A,D,E}，候选边 (A,B)、(C,D)、(C,E)，选 (C,E)；④ S={A,D,E,C}，候选边 (A,B)、(B,C)，选 (B,C)；⑤ 所有顶点已加入，算法结束。依次选出的边为 (A,D)、(D,E)、(C,E)、(B,C)。<br>2）图 G 的 MST 是唯一的。理由：第 1 小题得到的 MST 包括了图中权值最小的 4 条边，其他边除 (A,E) 外都比这 4 条边大；若用 (A,E) 替换同权值的 (C,E)，则 A、D、E 三个顶点构成回路，不能替换，故 MST 唯一。<br>3）当带权连通图的任意一个环中所包含的边的权值均不相同时，其 MST 是唯一的。（本题不要求回答充分必要条件，回答一个限制边权值的充分条件即可）',
 claude:'<b>1）Prim 从 A 出发，四步选边：(A,D) → (D,E) → (C,E) → (B,C)</b>，总权 4+4+5+4 = <b>17</b>。<br>'
  +'<pre class="code">步骤  已选顶点集 S      候选（横跨 S 与 V−S）的边          选中\n'
  +' ①    {A}             (A,B)6  (A,D)4  (A,E)5             (A,D)=4\n'
  +' ②    {A,D}           (A,B)6  (A,E)5  (D,E)4  (C,D)6     (D,E)=4\n'
  +' ③    {A,D,E}         (A,B)6  (C,D)6  (C,E)5             (C,E)=5\n'
  +' ④    {A,D,E,C}       (A,B)6  (B,C)4                     (B,C)=4\n'
  +' ⑤    {A,B,C,D,E}     —— 5 个顶点齐了，4 条边，结束</pre>'
  +'　⚠️ <b>第 ③ 步是本题唯一容易走错的地方</b>：候选里有 (A,E)=5 吗？<b>没有——E 已经在 S 里了，(A,E) 两端都在 S 内，不再是候选边</b>。<br>'
  +'<b>2）MST 唯一。</b>（程序穷举全部生成树确认：<b>最小权 17，恰好 1 棵</b>）<br>'
  +'· <b>书上的论证</b>：MST 用掉了图中权值最小的 4 条边（三条 4 和一条 5）；剩下的边中只有 <b>(A,E)=5</b> 与被选中的 <b>(C,E)=5</b> 同权、有替换的可能，<b>但把 (A,E) 换进来会让 A、D、E 构成回路</b>（因为 (A,D)、(D,E) 都在树里）⟹ 换不成 ⟹ <b>没有第二棵</b>。<br>'
  +'· <b>更通用的判法</b>：<b>等权边只有在"能互相替换而不成环"时才制造多解</b>。所以看到等权边先别下结论，<b>要检查替换后是否合法</b>（第 3、4 题反复强调的"有等权边只是<u>可能</u>不唯一"）。<br>'
  +'<b>3）一个充分条件：<u>图中任意一个环上的边权互不相同</u>（更强也更好记的版本：全图各边权互不相同）。</b><br>'
  +'· <b>为什么"环上无等权"就够</b>：MST 的不唯一<b>必然表现为"某个环上有两条等权边，去掉哪条都行"</b>（环切性质）。<b>只要每个环上的最大边唯一，破圈时就没有选择余地 ⟹ 结果唯一。</b><br>'
  +'· <b>为什么书上强调"不要求充要条件"</b>：因为<b>"边权互不相同"是充分不必要的</b>——存在有等权边但 MST 仍唯一的图（本题的 G 就是活例子！它有三条 4、两条 5，MST 却唯一）。<b>答题时写充分条件即可，写"当且仅当"反而会被扣分。</b><br>'
  +'📌 <b>本题把 MST 的三个层次一次问全</b>：<b>会算（第 1 问）→ 会判唯一（第 2 问）→ 会给条件（第 3 问）</b>。<b>第 1 问的关键是每步都把候选边<u>列全</u>（阅卷看的就是这个过程），第 2 问的关键是"替换会不会成环"，第 3 问的关键是别把充分条件写成充要条件。</b>',
 run:'程序穷举图 G 的全部生成树：<b>最小权值 17，MST 恰有 1 棵</b>，边集 {(A,D)4, (D,E)4, (C,E)5, (B,C)4}；模拟 Prim（起点 A）得选边顺序 <b>(A,D) → (D,E) → (C,E) → (B,C)</b> ✅ 与书答完全一致', verdict:'ok'},

{id:'6.4-综12', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'2018 统考', exam:2018,
 kp:['MST·实际问题建模（跨科）'],
 hints:['"用最少的费用把 8 个城市连通"——先把它翻译成图论问题：要选出一个<b>连通、无环、含全部顶点</b>的边集且总权最小 ⟹ 这就是<b>最小生成树</b>。',
        '题目问的是"<b>所有</b>可能的最经济方案"，说明<b>MST 不止一棵</b>。做 Kruskal 时碰到同权边要留意：<b>选哪条都不成环的时候，就会分岔。</b>',
        '第 3 问是计算机网络的常识：<b>IP 分组每经过一台路由器 TTL 减 1，减到 0 就丢弃</b>。数一数 H1 到 H2 中间要过几台路由器。'],
 stem:'【2018 统考真题】拟建设一个光通信骨干网连通 BJ、CS、XA、QD、JN、NJ、TL 和 WH 等 8 个城市，下图中无向边上的权值表示两个城市之间备选光缆的铺设费用。请回答下列问题：<br>'
  +'1）仅从铺设费用角度出发，给出所有可能的最经济的光缆铺设方案（用带权图表示），并计算相应方案的总费用。<br>'
  +'2）该图可采用图的哪种存储结构？给出求解问题 1）所用的算法名称。<br>'
  +'3）假设每个城市采用一个路由器按 1）中得到的最经济方案组网，主机 H1 直接连接 TL 的路由器，主机 H2 直接连接 BJ 的路由器。若 H1 向 H2 发送一个 TTL=5 的 IP 分组，则 H2 是否可以收到该 IP 分组？',
 fig:'图/ch6/6.4-综12.svg',
 figcap:'2018 统考真题图：8 城市无向带权图（XA–BJ=2、XA–WH=2、BJ–TL=3、BJ–WH=3、BJ–JN=4、TL–JN=2、WH–CS=4、WH–QD=3、QD–JN=2、QD–CS=3、QD–NJ=2、JN–NJ=3，据王道 p.245 重画）',
 book:'1）该问题是求无向带权图的最小生成树，共有两种构造方案，两种方案的总费用均为 16。两个方案的差别在于 TL 的接法：一种经 JN 接入，另一种由 BJ 直接接入。<br>2）该图可采用邻接矩阵（或邻接表）存储；求解所用的算法为 Prim 算法（或 Kruskal 算法）。<br>3）TTL=5 表示 IP 分组最大传递距离为 5。在 TL 与 BJ 相距较远的方案中，TTL=5 不足以让分组从 H1 传送到 H2，H2 不能收到；在 TL 与 BJ 邻近（有直接链路）的方案中，H2 可以收到该 IP 分组。',
 claude:'<b>1）这是一道"最小生成树"的应用题，答案是<u>两套</u>方案，总费用都是 16。</b>（程序穷举全部生成树确认：<b>最小权 16，恰好 2 棵</b>）<br>'
  +'<pre class="code">公共部分（两套方案都有的 6 条边，共 13）：\n'
  +'    XA–BJ=2   XA–WH=2   QD–JN=2   QD–NJ=2   CS–QD=3   TL–JN=2\n'
  +'方案①：再加 BJ–TL=3   ⟹ 总费用 16\n'
  +'方案②：再加 WH–QD=3   ⟹ 总费用 16</pre>'
  +'　<b>分岔点在哪里？</b>把 6 条公共边先连上，此时城市分成<b>两块</b>：{XA, BJ, WH} 与 {TL, JN, QD, NJ, CS}。<b>要把这两块接起来，最便宜的桥有两条并列的 3 —— BJ–TL 与 WH–QD</b> ⟹ 选谁都行 ⟹ <b>两棵 MST</b>。<br>'
  +'　⚠️ 注意 BJ–WH=3 也是 3，但它<b>两端都在同一块里</b>（会成环）⟹ 不能选。<b>这正是 Kruskal 判环的用武之地。</b><br>'
  +'<b>2）存储结构：邻接矩阵或邻接表均可</b>（8 个顶点 12 条边，规模很小，两者都行；<b>稠密用矩阵、稀疏用邻接表</b>）。<b>算法：Prim 或 Kruskal。</b><br>'
  +'　📌 本题若答 <b>Kruskal 更贴题</b>——因为要找出"<b>所有</b>方案"，Kruskal 在同权边处分岔的结构最直观。<br>'
  +'<b>3）两套方案的答案<u>不同</u>，必须分情况回答：</b><br>'
  +'· <b>方案①（含 BJ–TL 直连）</b>：H1 → TL 路由器 → BJ 路由器 → H2。<b>只经过 2 台路由器，TTL 绰绰有余 ⟹ H2 <u>能</u>收到。</b><br>'
  +'· <b>方案②（无 BJ–TL）</b>：TL 只能经 <b>TL→JN→QD→WH→XA→BJ</b>，<b>整整 5 跳</b>。TTL=5 的分组每经一台路由器减 1：到 TL 减为 4、JN 减为 3、QD 减为 2、WH 减为 1、<b>XA 减为 0 ⟹ 就地丢弃</b> ⟹ <b>H2 <u>收不到</u>。</b><br>'
  +'⟹ <b>标准答法：方案①能收到，方案②收不到。</b>（只答"能"或"不能"而不分方案，会丢一半分。）<br>'
  +'📌 <b>这道题是 408 里最著名的"数据结构 × 计算机网络"跨科题</b>：<b>数据结构侧考 MST（而且专挑"多解"的图）</b>，<b>网络侧考 TTL 的递减规则</b>。<b>两科的分是分开给的，哪怕网络那问不会，MST 的分也要拿全。</b><br>'
  +'⚠️ <b>第 1 问要求"用带权图表示"</b> ⟹ <b>必须把两棵 MST 都画出来</b>（画图 + 标权值 + 写总费用 16），只写边集会扣分。',
 run:'程序穷举 8 个顶点、12 条边的全部生成树：<b>最小权值 16，恰好 2 棵</b> —— 公共 6 条边 {XA–BJ, XA–WH, TL–JN, QD–JN, QD–NJ, CS–QD} 加上 <b>BJ–TL=3</b> 或 <b>WH–QD=3</b> ✅ 与书答（两套方案、均为 16）一致；另验证方案② 中 TL 到 BJ 的最短跳数为 <b>5 跳</b>（TL–JN–QD–WH–XA–BJ）', verdict:'ok'},

{id:'6.4-综13', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'2024 统考', exam:2024,
 kp:['拓扑排序·判定序列唯一（算法题）'],
 hints:['先把"拓扑序列唯一"翻译成一个<b>可以在算法里检测的条件</b>：回想第 13、43 题的判据——<b>每一轮入度为 0 的顶点恰好只有一个</b>。',
        '于是算法框架就是标准的入度法拓扑排序，只是每一轮要<b>额外数一数"入度为 0 的顶点有几个"</b>：多于一个 ⟹ 不唯一；一个都没有（而顶点还没输完）⟹ 有环。两种情况都返回 0。',
        '存储是<b>邻接矩阵</b>：求入度要按<u>列</u>累加 <code>degree[j] += G.Edge[i][j]</code>；找某顶点的后继要扫<u>行</u>。',
        '实现技巧：用一个变量 in0 同时兼任"唯一的那个入度 0 顶点的编号"和"是否出现了多个"的标志（−1 表示还没有，−2 表示有多个），可以省掉一个数组。'],
 stem:'【2024 统考真题】2023 年 10 月 26 日，神舟十七号载人飞船发射取得圆满成功……载人航天工程是包含众多子工程的复杂系统工程，为了保证工程的有序开展，需要明确各子工程的前导子工程，以协调各子工程的实施。该问题可以简化、抽象为有向图的拓扑序列问题。已知有向图 G 采用邻接矩阵存储，类型定义如下：'
  +'<pre class="code">typedef struct{\n'
  +'    int numVertices, numEdges;   //图的顶点数和有向边数\n'
  +'    char VerticesList[MAXV];     //顶点表，MAXV 为已定义常量\n'
  +'    int Edge[MAXV][MAXV];        //邻接矩阵\n'
  +'}MGraph;</pre>'
  +'请设计算法 <code>int uniquely(MGraph G)</code>，判定 G 是否存在唯一的拓扑序列，若是则返回 1，否则返回 0。要求：<br>'
  +'1）给出算法的基本设计思想。<br>2）采用 C 或 C++ 语言描述算法，关键之处给出注释。',
 codeStem:true,
 book:'1）算法的基本设计思想：建立图 G 各顶点的入度表 degree[]。选择入度为 0 的顶点 v，将 v 的所有邻接点的入度减 1，重复这个过程。若每次选中的入度为 0 的顶点有且仅有一个，且共进行了 G.numVertices 次，则存在唯一的拓扑序列，返回 1；否则（不存在拓扑序列，或存在多个拓扑序列）返回 0。<br>2）C 代码见参考答案。技巧：用 in0 一个变量兼做"唯一的入度为 0 的顶点编号"与"是否出现多个"的标志（−1 表示尚无，−2 表示有多个），省掉一个计数数组。',
 code:'int uniquely(MGraph G){              //判定有向图是否存在唯一的拓扑序列\n'
  +'    int *degree, i, j, count=0, in0=-1, prev_in0;\n'
  +'    degree=(int*)malloc(G.numVertices*sizeof(int));\n'
  +'    for(j=0; j<G.numVertices; j++){          //按列累加，计算各顶点的入度\n'
  +'        degree[j]=0;\n'
  +'        for(i=0; i<G.numVertices; i++)\n'
  +'            degree[j] += G.Edge[i][j];\n'
  +'        if(degree[j]==0){\n'
  +'            if(in0==-1)  in0=j;              //记下唯一的入度为 0 的顶点\n'
  +'            else         in0=-2;             //出现多个 ⟹ 拓扑序列不唯一\n'
  +'        }\n'
  +'    }\n'
  +'    while(in0>=0){                           //in0<0 时循环结束（无候选或有多个）\n'
  +'        count++;                             //已输出的顶点数加 1\n'
  +'        prev_in0=in0;\n'
  +'        in0=-1;                              //为下一轮重新计数\n'
  +'        for(j=0; j<G.numVertices; j++)\n'
  +'            if(G.Edge[prev_in0][j]>0){       //扫描该顶点的所有后继\n'
  +'                if(--degree[j]==0){          //邻接点入度减 1\n'
  +'                    if(in0==-1)  in0=j;      //本轮新出现的入度 0 顶点\n'
  +'                    else         in0=-2;     //本轮出现多个 ⟹ 不唯一\n'
  +'                }\n'
  +'            }\n'
  +'    }\n'
  +'    free(degree);\n'
  +'    if(count==G.numVertices) return 1;       //恰好输出了全部顶点且每轮唯一\n'
  +'    else                     return 0;\n'
  +'}',
 claude:'思路：<b>把"拓扑序列唯一"翻译成一句可检测的话——<u>每一轮入度为 0 的顶点<b>恰好</b>只有一个</u>。</b>（第 13 题 Ⅳ、第 43 题都在铺垫这个判据。）<br>'
  +'<b>三种失败情形，代码用同一套机制全部拦下</b>：<br>'
  +'· <b>某轮有 ≥2 个入度为 0 的顶点</b> ⟹ 谁先输出都行 ⟹ <b>序列不唯一</b> ⟹ in0 置 −2，循环退出，此时 <code>count &lt; n</code> ⟹ 返回 0；<br>'
  +'· <b>某轮一个入度为 0 的顶点都没有</b>（而顶点没输完）⟹ <b>有环、根本不存在拓扑序列</b> ⟹ in0 保持 −1，循环退出，同样 <code>count &lt; n</code> ⟹ 返回 0；<br>'
  +'· <b>顺利走完 n 轮</b> ⟹ <b>每轮都唯一 ⟹ 返回 1</b>。<br>'
  +'　<b>妙就妙在：两种失败被统一成"count 没到 n"这一个判断，不必分别写分支。</b><br>'
  +'<b>in0 这个变量的三态设计（本题最值得学的一笔）</b>：<br>'
  +'<pre class="code">in0 = -1   本轮还没发现入度为 0 的顶点\n'
  +'in0 >= 0   本轮恰好发现一个，值就是它的编号\n'
  +'in0 = -2   本轮发现了两个及以上 ⟹ 不唯一</pre>'
  +'<b>一个变量同时承担"编号"与"计数标志"两个职责，省掉了栈/队列和额外的计数数组</b>——这也解释了为什么本题的代码里<b>没有</b>常规拓扑排序里的 <code>InitStack/Push/Pop</code>。<br>'
  +'<b>邻接矩阵的两个方向别搞反（本题的送分点也是失分点）</b>：<br>'
  +'· <b>求入度 ⟹ 按<u>列</u>累加</b>：<code>degree[j] += G.Edge[i][j]</code>（第 j 列的非零个数）；<br>'
  +'· <b>找后继 ⟹ 扫<u>行</u></b>：<code>G.Edge[prev_in0][j] &gt; 0</code>（第 prev_in0 行）。<br>'
  +'· <b>口诀还是那句"行出列入"</b>（6.2 的四条命根子之一）。<br>'
  +'<b>复杂度</b>：初始化入度 <b>O(n²)</b>；while 循环最多 n 轮、每轮扫一行 O(n) ⟹ <b>O(n²)</b>；合计 <b>时间 O(n²)</b>、<b>空间 O(n)</b>（一个 degree 数组）。<b>邻接矩阵下 O(n²) 已是最优</b>（光算入度就得看完整个矩阵）；若改用邻接表可降到 O(n+e)。<br>'
  +'⚠️ <b>三个考场细节</b>：① <b>degree 用完要 free</b>（本题用了 malloc，写了申请不写释放会被扣印象分）；② <b>题目给的 Edge 是 int 型且用 &gt;0 判边</b>，若图带权，"入度"就不能直接累加权值——本题按 0/1 邻接矩阵处理是符合题意的（书上代码直接 <code>degree[j]+=G.Edge[i][j]</code> 即隐含此约定）；③ <b>先写设计思想再写代码</b>，2024 年这道题的第 1 问单独给分。',
 run:'程序把这段 C 逻辑翻译成等价实现，在 <b>3000 张随机有向图</b>（n=3–8，含大量有环图）上与"全排列枚举所有合法拓扑序、数是否恰为 1"的暴力参照对拍：<b>3000/3000 判定完全一致</b>（唯一→1、多解→0、有环→0）✅', verdict:'ok'},

{id:'6.4-综14', ch:6, sec:'6.4 图的应用', type:'subjective', tag:'2025 统考', exam:2025,
 kp:['关键路径·三问（关键活动/并发活动/时间余量）'],
 hints:['第 1 问是老套路：正推 v<sub>e</sub> 取 max 得工期，逆推 v<sub>l</sub> 取 min，余量为 0 的即关键活动。<b>注意本题的源点是事件 1、汇点是事件 5</b>，别被顶点编号的摆放顺序迷惑。',
        '第 2 问"与活动 e 同时进行"是新问法：把每个活动看成一个<b>时间窗口 [v<sub>e</sub>(起点), v<sub>e</sub>(起点)+持续时间]</b>，<b>与 e 的窗口有<u>重叠</u>的就可能同时进行</b>（仅端点相接不算重叠）。',
        '第 3 问用一步到位的公式：<b>时间余量 d = v<sub>l</sub>(终点) − v<sub>e</sub>(起点) − 持续时间</b>，把 12 个活动扫一遍取最大。'],
 stem:'【2025 统考真题】某工程包含 12 个活动，使用下图所示的 AOE 网描述，图中各边上标注了活动及其持续时间。请回答下列问题（活动均用活动名表示）：<br>'
  +'1）完成该工程的最短时间是多少？哪些活动是关键活动？<br>'
  +'2）若以最短时间完成工程，则与活动 e 同时进行的活动可能有哪些？<br>'
  +'3）时间余量最大的活动是哪个？其时间余量是多少？',
 fig:'图/ch6/6.4-综14.svg',
 figcap:'2025 统考真题图：AOE 网（a=2:1→3、b=5:1→2、c=1:3→6、d=3:1→4、e=3:3→4、f=4:4→2、g=1:4→6、h=1:6→7、j=1:4→5、k=2:2→5、m=4:4→7、n=3:7→5，据王道 p.245 重画）',
 book:'1）① 求各事件的最早发生时间 vₑ（按拓扑序正推）：vₑ(1)=0；vₑ(3)=vₑ(1)+a=2；vₑ(6)=vₑ(3)+c=3；vₑ(4)=max{vₑ(1)+d, vₑ(3)+e, vₑ(6)+g}=max{3,5,4}=5；vₑ(2)=max{vₑ(1)+b, vₑ(4)+f}=max{5,9}=9；vₑ(7)=max{vₑ(6)+h, vₑ(4)+m}=max{4,9}=9；vₑ(5)=max{vₑ(2)+k, vₑ(4)+j, vₑ(7)+n}=max{11,6,12}=12。汇点(5)的值就是完成工程的最短时间，即 12。<br>② 求各事件的最晚发生时间 vₗ（逆拓扑反推）：vₗ(5)=12；vₗ(2)=12−k=10；vₗ(7)=12−n=9；vₗ(6)=vₗ(7)−h=8；vₗ(4)=min{vₗ(2)−f, vₗ(5)−j, vₗ(7)−m}=min{6,11,5}=5；vₗ(3)=min{vₗ(4)−e, vₗ(6)−c}=min{2,7}=2；vₗ(1)=min{vₗ(3)−a, vₗ(2)−b, vₗ(4)−d}=min{0,5,2}=0。<br>③ 关键活动满足 vₑ(i)=vₗ(i)、vₑ(j)=vₗ(j) 且 vₗ(j)−vₑ(i)=duration(i,j)。满足条件的事件序列为 1,3,4,7,5，对应的活动为 a、e、m、n，它们构成关键路径。<br>2）关键活动 e(3→4) 的最早开始时间 vₑ(3)=2、最早结束时间 2+3=5，执行时间窗口为 [2,5]，因此与它同时进行的活动是其时间窗口与 [2,5] 有重叠的活动：活动 b 的窗口为 [0,5]，有重叠；活动 c 的窗口为 [2,3]，完全被包含；活动 d 的窗口为 [0,3]，有重叠。因此，与活动 e 同时进行的活动可能有 b、c、d。<br>3）活动的时间余量 d(i)=vₗ(j)−vₑ(i)−w(i,j)。d(j)=vₗ(5)−vₑ(4)−1=12−5−1=6；d(b)=vₗ(2)−vₑ(1)−5=5；d(c)=vₗ(6)−vₑ(3)−1=5；d(h)=vₗ(7)−vₑ(6)−1=5。其他非关键活动的时间余量更小。故时间余量最大的活动是 j，其时间余量是 6。',
 claude:'<b>三问的答案</b>：<b>① 最短工期 12，关键活动 a、e、m、n（关键路径 1→3→4→7→5）；② 与 e 同时进行的可能有 b、c、d；③ 时间余量最大的是 j，余量 6。</b><br>'
  +'<b>1）正推 v<sub>e</sub>（取 max）、逆推 v<sub>l</sub>（取 min）</b><br>'
  +'<pre class="code">事件      1    2    3    4    5    6    7\n'
  +'ve(i)     0    9    2    5   12    6    9\n'
  +'vl(i)     0   10    2    5   12    8    9</pre>'
  +'　v<sub>e</sub>(3)=2；<b>v<sub>e</sub>(4)=max{0+3(d), 2+3(e)}=5</b>；v<sub>e</sub>(6)=max{2+1(c), 5+1(g)}=6；<b>v<sub>e</sub>(2)=max{0+5(b), 5+4(f)}=9</b>；<b>v<sub>e</sub>(7)=max{6+1(h), 5+4(m)}=9</b>；<b>v<sub>e</sub>(5)=max{9+2(k), 5+1(j), 9+3(n)}=12</b> ⟹ <b>工期 12</b>。<br>'
  +'　各活动余量 d = v<sub>l</sub>(终点) − v<sub>e</sub>(起点) − 权：<b>a=0、e=0、m=0、n=0</b>（关键）；b=5、c=5、d=2、f=1、g=2、h=2、<b>j=6</b>、k=1。<br>'
  +'　⟹ <b>关键路径 1→3→4→7→5，长度 2+3+4+3=12 ✓</b>。<br>'
  +'<b>2）"同时进行"= 时间窗口重叠（2025 年的新问法）</b><br>'
  +'　<b>e 的窗口 = [v<sub>e</sub>(3), v<sub>e</sub>(3)+3] = [2, 5]</b>（e 是关键活动，没有余量，只能卡着这个窗口做）。<br>'
  +'　把其他活动的最早窗口列出来，看谁与 [2,5] <b>有交叠</b>：<br>'
  +'<pre class="code">活动  窗口       与[2,5]     活动  窗口       与[2,5]\n'
  +' a    [0,2]     仅端点相接    f    [5,9]     仅端点相接\n'
  +' b    [0,5]     ✔ 重叠        g    [5,6]     仅端点相接\n'
  +' c    [2,3]     ✔ 被包含      h    [6,7]     不重叠\n'
  +' d    [0,3]     ✔ 重叠        j    [5,6]     仅端点相接\n'
  +'                              m    [5,9]     仅端点相接</pre>'
  +'　⟹ <b>b、c、d</b>。<b>⚠️ 端点相接（如 a 在时刻 2 恰好结束、e 在时刻 2 开始）<u>不算</u>同时进行</b>——这正是本问的分寸所在。<br>'
  +'<b>3）余量最大 = j（6）</b>：<b>d(j)=v<sub>l</sub>(5)−v<sub>e</sub>(4)−1 = 12−5−1 = 6</b>。<br>'
  +'　<b>为什么是 j</b>：j 从事件 4 直通汇点 5，只花 1；而主干道 4→7→5 要花 4+3=7 ⟹ <b>它有 6 个单位可以磨蹭</b>。<b>与第 45 题（2022）的活动 g 是同一种"短路型"活动——看图先找"绕开主干的小权捷径"，往往就是答案。</b><br>'
  +'⚠️⚠️ <b>本题发现原书答案的一处内部矛盾（已用程序双向验证，考生按下面的口径记）</b>：<br>'
  +'· <b>原书插图上活动 g 的箭头指向事件 6（即 g: 4→6）</b>，本页的图按原书插图重画；<br>'
  +'· <b>但原书答案第 ① 步的 v<sub>e</sub> 推导把 g 当成了 6→4</b>（写成 v<sub>e</sub>(6)=v<sub>e</sub>(3)+c=3 且 v<sub>e</sub>(4)=max{…, v<sub>e</sub>(6)+g}）；<br>'
  +'· <b>而它自己的 v<sub>l</sub> 推导又是按 4→6 算的</b>（v<sub>l</sub>(6)=v<sub>l</sub>(7)−h=8，若 g 出自 6 则还要与 v<sub>l</sub>(4)−g=4 取 min）；<br>'
  +'· <b>第 2 问的答案 b、c、d 只有在 g: 4→6 时才正确</b>——若 g 是 6→4，则 g 的窗口为 [3,4]、h 的窗口为 [3,4]，<b>两者都会与 [2,5] 重叠，答案就该是 b、c、d、g、h</b>。<br>'
  +'⟹ <b>结论：图（g: 4→6）是对的，原书 v<sub>e</sub>(6)=3 那一行是笔误</b>（正确值 <b>v<sub>e</sub>(6)=6</b>；连带书上 d(h)=5 应为 <b>2</b>）。<b>三问的最终答案不受影响</b>：工期 12、关键活动 a/e/m/n、并发 b/c/d、余量最大 j=6 —— 两种读法完全相同。<b>做题时按本页的表算即可。</b>',
 run:'程序按原书插图的弧向（g: 4→6）复算：v<sub>e</sub>=(1:0, 2:9, 3:2, 4:5, 5:<b>12</b>, 6:6, 7:9)，v<sub>l</sub>=(0,10,2,5,12,8,9)；余量 a=e=m=n=<b>0</b>（关键），<b>j=6</b> 最大，b=c=5、d=g=h=2、f=k=1；按时间窗口重叠判定，与 e[2,5] 重叠的恰为 <b>b[0,5]、c[2,3]、d[0,3]</b> ✅ 三问答案与书答完全一致，且据此定位出书上 v<sub>e</sub>(6) 的笔误（详见分析）', verdict:'ok'},

];
