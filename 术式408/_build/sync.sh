#!/bin/zsh
# 构建并同步到预览目录
cd /Users/zyx/Downloads/新威考研-资料/11408相关/408/复盘中心/术式408/_build && python3 build.py || exit 1
SC="/private/tmp/claude-501/-Users-zyx-Downloads--------/da321a19-f159-4363-ae96-97c20ef777fd/scratchpad"
rsync -a --delete --exclude '.git' --exclude '.DS_Store' --include '术式408/***' --include '练习系统/***' --include '精读版/***' --exclude '*' /Users/zyx/Downloads/新威考研-资料/11408相关/408/复盘中心/ "$SC/site/"
