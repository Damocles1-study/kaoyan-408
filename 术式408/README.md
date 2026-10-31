# 术式408

黑白少年漫风格的 408 伪一轮讲义：52 话，按知识依赖跨科重排，读完开真题套卷。

- 只改 `_src/NN.txt` 与 `_build/plan.py`，跑 `python3 _build/build.py` 生成页面，别手改 `ep*.html`、`术式录.html` 等。
- 源文件语法写在 `_build/build.py` 开头。图和手算演示由 `_build/figs.py`、`_build/algos.py` 从数据生成，不手写结果。
- 真题由 `_build/qbank.py` 从 `../练习系统/data_*.js` 读取。`@q 科目:题号 | 点评` 嵌入；**2020 年及以后的真题构建时直接报错**（留给套卷），同一题不许用两次。写点评前先读题面和书答。
- `python3 _build/tests/run.py`：抽出讲义里的 C 模板，g++ 编译后与朴素实现随机对拍。
- `_build/plan.py` 里有 2027 考纲到话的对照（`SYL`）和 14 天排期（按时长自动切分）。
- `python3 _build/art.py [--force]`：生成笔墨素材到 `assets/ink`（毛笔标题、集中线、圆相、符、注连绳、黑闪等）。只在新增话或改标题时需要重跑，依赖 macOS 系统字体和 numpy/scipy/Pillow/fontTools；网页只用生成好的图片。
