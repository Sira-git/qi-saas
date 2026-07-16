#!/usr/bin/env python3
"""
将 Markdown 需求报告转换为 Word 文档
"""

# 使用 macOS 自带的 textutil 转换为 HTML，然后手动创建简单的 Word 文档
import subprocess
import os

md_file = "/Users/hanweb/Documents/qi-saas/docs/软件需求分析报告.md"
output_dir = "/Users/hanweb/Documents/qi-saas/docs"

# 先用 textutil 转换为 HTML
html_file = os.path.join(output_dir, "temp.html")
result = subprocess.run(
    ["textutil", "-convert", "html", "-output", html_file, md_file],
    capture_output=True,
    text=True
)

if result.returncode == 0:
    print(f"✓ 已转换为 HTML: {html_file}")
    # 再用 textutil 转换为 docx
    docx_file = os.path.join(output_dir, "软件需求分析报告.docx")
    result2 = subprocess.run(
        ["textutil", "-convert", "docx", "-output", docx_file, html_file],
        capture_output=True,
        text=True
    )
    if result2.returncode == 0:
        print(f"✓ 已转换为 Word: {docx_file}")
        # 删除临时 HTML 文件
        os.remove(html_file)
        print("✓ 已清理临时文件")
    else:
        print(f"✗ 转换为 Word 失败：{result2.stderr}")
else:
    print(f"✗ 转换为 HTML 失败：{result.stderr}")
