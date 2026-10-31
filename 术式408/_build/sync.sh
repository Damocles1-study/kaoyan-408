#!/bin/zsh
# 构建并同步到预览目录。用法：SC=<本会话 scratchpad 路径> zsh sync.sh
cd "${0:A:h}" && python3 build.py || exit 1
[ -n "$SC" ] || exit 0
mkdir -p "$SC/site"
rsync -a --delete --exclude '.git' --exclude '.DS_Store' --include '术式408/***' --include '练习系统/***' --include '精读版/***' --exclude '*' ../../ "$SC/site/"
