# 408 复盘中心 · 上传 GitHub 说明

> 本文件夹已是 **git 仓库** + 纯静态 HTML 网站（index.html 入口，无任何构建步骤）。
> 推上 GitHub 开 Pages 后，手机/iPad/任何浏览器输入网址即可使用。
> `gh` CLI 已安装好（2026-07-19），流程比英语那份说明更省事。

## ⚠️ 公开 or 私有？

- **本文件夹（408 复盘中心）**：目前只有概念卡库、模拟器、算法模板——**全部是原创内容，不含真题原文**，Public 没有版权问题。
  但注意：**将来生成错题页后会包含真题题面**，届时建议转私有，或错题页单独放私有仓库。
- **英语阅读复盘**：页面含真题全文+翻译，**建议 Private**（学生包有 Pro，私有仓库也能开 Pages）。

## 一次性流程（共两步，第一步必须你本人做）

### 第 1 步：登录（只需一次）

终端里运行：

```bash
gh auth login
```

选 `GitHub.com` → `HTTPS` → `Login with a web browser`，按提示在浏览器里输入一次性代码完成授权。

### 第 2 步：告诉 Claude「已登录」

剩下的 Claude 全部代劳（也可自己跑）：

```bash
# 408 复盘中心（Public）
cd "/Users/zyx/Downloads/新威考研-资料/11408相关/408/复盘中心"
gh repo create kaoyan-408 --public --source=. --push
gh api repos/{owner}/kaoyan-408/pages -X POST -f "source[branch]=main" -f "source[path]=/"

# 英语阅读复盘（Private，需 Pro 才能开 Pages——学生包有）
cd "/Users/zyx/Downloads/新威考研-资料/11408相关/英语一/阅读复盘"
gh repo create kaoyan-english --private --source=. --push
gh api repos/{owner}/kaoyan-english/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

上线地址（1–2 分钟生效）：

- `https://<用户名>.github.io/kaoyan-408/`
- `https://<用户名>.github.io/kaoyan-english/`（私有仓库的 Pages 链接默认带随机前缀，以 Settings→Pages 显示为准）

## 以后每次更新

Claude 每生成新页面都会本地 commit；要同步到网上只需：

```bash
git push
```

（或让 Claude 顺手推。一两分钟后网页自动更新。）

## 小知识

- 中文文件名在网址里会显示成 `%E5%8D%A1...` 的编码形式——**不影响使用**，浏览器地址栏通常还会显示回中文。
- 每个 html 自包含（样式脚本全在文件内），单发某一页给研友也能用。
