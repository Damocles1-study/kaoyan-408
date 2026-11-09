# 术式408

黑白少年漫风格的 408 伪一轮讲义：52 话，按知识依赖跨科重排，读完开真题套卷。

- 只改 `_src/NN.txt`（知识讲解）、`_src/q/NN.txt`（本话真题和折叠的考法）与 `_build/plan.py`，跑 `python3 _build/build.py` 生成页面，别手改 `ep*.html`、`术式录.html` 等。
- 源文件语法写在 `_build/build.py` 开头。图和手算演示由 `_build/figs.py`、`_build/algos.py` 从数据生成，不手写结果。
- 真题由 `_build/qbank.py` 从 `../练习系统/data_*.js` 读取。`@q 科目:题号 | 点评` 写在 `_src/q/NN.txt`，构建时统一排到本话末尾的「实战」；问法考法只放点评和 `:::after`，知识部分不提（`_build/lint.py` 检查）；**2020 年及以后的真题构建时直接报错**（留给套卷），同一题不许用两次。写点评前先读题面和书答。
- `python3 _build/tests/run.py` 与 `run2.py`：抽出讲义里的 C 模板，g++ 编译后与朴素实现随机对拍。
- `_build/wc.py` 量字数和时长，`cover.py` 查知识点词，`qs.py NN` 列本话题目，`patch.py` 按文字补丁改源文件。
- `_build/plan.py` 里有 2027 考纲到话的对照（`SYL`）和排期（按实测字数和题量算时长，按每个下午 3.5 小时切分）。
- `python3 _build/art.py [--force]`：生成笔墨素材到 `assets/ink`（毛笔标题、集中线、圆相、符、注连绳、黑闪等）。只在新增话或改标题时需要重跑，依赖 macOS 系统字体和 numpy/scipy/Pillow/fontTools；网页只用生成好的图片。

## 在线真题套卷

`真题套卷.html` + `assets/exam/`。`engine.js`、`exam.css` 与数学一重读报共用一份，改了要同步。`python3 _build/exam_build.py` 把练习系统题库按 `_build/exam_slots.json` 的题号拼回 2009–2025 整卷（题库改了要重跑）；`python3 _build/exam_2026.py` 单独生成 2026 回忆版。页面模板副本在 `_build/exam_page.html`。

## 真题精研与做卷顺序

- 交卷后每题下面的「精研卡」（考什么 · 本质 · 怎么出的 · 举一反三 · 联想搭配）写在 `_build/deep/YYYY.txt`，跑 `python3 _build/deep_build.py` 生成 `assets/exam/deep/dYYYY.js`。语法见脚本开头。没写精研的年份也会生成文件，只带「回第 N 话」的回链（按 `plan.EPS` 的 secs 自动对）。
- 做卷顺序、档位、复盘限时、三天循环写在 `真题套卷.html` 的 `EXAM_CONF.plan`（模板 `_build/exam_page.html` 同步改）。
- 已写：2020–2023。顺序里的下一张是 2019，然后 2018、2017…
