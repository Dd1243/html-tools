#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""扫描所有 HTML 文件，检查 <article> 是否在 <nav> 内打开（HTML5 不允许）"""
import re
from pathlib import Path

ROOT = Path(r"e:\html-tools")
SCAN_DIRS = [ROOT / "tools", ROOT / "guides"]


def scan_html_files():
    files = []
    for d in SCAN_DIRS:
        if not d.exists():
            continue
        for p in d.rglob("*.html"):
            files.append(p)
    return sorted(files)


def check_article_in_nav(html: str) -> bool:
    """检测 <article> 是否在某个 <nav> 块内打开"""
    nav_blocks = re.findall(
        r'<nav\b[^>]*>(?:(?!</nav>)[\s\S])*?</nav>',
        html,
        re.I
    )
    for block in nav_blocks:
        if re.search(r'<article\b', block, re.I):
            return True
    return False


def main():
    files = scan_html_files()
    print(f"[INFO] 扫描 {len(files)} 个文件，检查 article-in-nav 问题")
    issues = []
    for p in files:
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if check_article_in_nav(text):
            rel = str(p.relative_to(ROOT)).replace("\\", "/")
            issues.append(rel)
    print(f"\n=== 总结 ===")
    print(f"问题文件数: {len(issues)}")
    if issues:
        print("\n问题文件清单:")
        for f in issues:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
