#!/usr/bin/env python3
"""王道 PPT 讲解有文字层，零读图成本。用法：python3 ppt.py 操作系统 虚拟内存  → 打印文件名含关键词的 PDF 全文；不给关键词则列文件。"""
import sys,glob,os,fitz
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..','王道PPT讲解')
fs=sorted(f for f in glob.glob(R+'/**/*.pdf',recursive=True) if sys.argv[1] in f)
if len(sys.argv)<3:
    for f in fs:print(os.path.relpath(f,R))
else:
    for f in fs:
        if sys.argv[2] in os.path.basename(f):
            print('=====',os.path.basename(f))
            for p in fitz.open(f):
                t=p.get_text().strip()
                if t:print(t)
