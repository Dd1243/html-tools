#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
扫描全站 HTML 文件，检测两类 P0 结构错误：
1. P0-1: <article> 在 </main> 之外（main 闭合后还有 article）
2. P0-2: <main> 内没有任何 <article>（主内容区缺少 article 包裹）

只统计 main 之外或 main 缺失 article 的情况。
"""
import re
from pathlib import Path

ROOT = Path(r"e:\html-tools")
SCAN_DIRS = [ROOT / "tools", ROOT / "guides"]


def scan_files():
    files = []
    for d in SCAN_DIRS:
        if d.exists():
            files.extend(d.rglob("*.html"))
    return sorted(files)


def analyze(html: str) -> dict:
    """分析单个 HTML 文件的结构"""
    result = {
        "has_main": False,
        "has_article": False,
        "article_outside_main": False,   # P0-1
        "main_no_article": False,         # P0-2
        "main_start": -1,
        "main_end": -1,
        "article_positions": [],          # [(start, end), ...]
    }

    # 找 main 标签
    main_open = re.search(r'<main\b[^>]*>', html, re.I)
    main_close = re.search(r'</main>', html, re.I)
    if main_open and main_close:
        result["has_main"] = True
        result["main_start"] = main_open.start()
        result["main_end"] = main_close.start()
    elif main_open:
        # 只有开标签
        result["has_main"] = True
        result["main_start"] = main_open.start()
        result["main_end"] = len(html)

    # 找所有 article 标签（开标签位置）
    article_opens = [m.start() for m in re.finditer(r'<article\b', html, re.I)]
    if article_opens:
        result["has_article"] = True
        result["article_positions"] = article_opens

    # P0-1: article 在 main 之外（在 </main> 之后）
    if result["has_main"] and result["has_article"]:
        for pos in result["article_positions"]:
            if pos > result["main_end"]:
                result["article_outside_main"] = True
                break

    # P0-2: main 内没有 article（且页面有 article，但都不在 main 内）
    if result["has_main"] and result["has_article"]:
        in_main_count = sum(
            1 for pos in result["article_positions"]
            if result["main_start"] < pos < result["main_end"]
        )
        if in_main_count == 0:
            result["main_no_article"] = True

    return result


def main():
    files = scan_files()
    print(f"[INFO] 扫描 {len(files)} 个 HTML 文件\n")

    p0_1_issues = []   # article 在 main 之外
    p0_2_issues = []   # main 内没有 article

    for p in files:
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue

        # 跳过完全没有 main 或 article 的文件（已由其他扫描覆盖）
        if not re.search(r'<main\b', text, re.I):
            continue
        if not re.search(r'<article\b', text, re.I):
            continue

        r = analyze(text)
        rel = str(p.relative_to(ROOT)).replace("\\", "/")
        if r["article_outside_main"]:
            p0_1_issues.append(rel)
        if r["main_no_article"]:
            p0_2_issues.append(rel)

    print(f"=== P0-1: <article> 在 </main> 之外 ===")
    print(f"问题文件数: {len(p0_1_issues)}")
    if p0_1_issues:
        for f in p0_1_issues[:30]:
            print(f"  - {f}")
        if len(p0_1_issues) > 30:
            print(f"  ... 还有 {len(p0_1_issues) - 30} 个")

    print(f"\n=== P0-2: <main> 内没有任何 <article> ===")
    print(f"问题文件数: {len(p0_2_issues)}")
    if p0_2_issues:
        for f in p0_2_issues[:30]:
            print(f"  - {f}")
        if len(p0_2_issues) > 30:
            print(f"  ... 还有 {len(p0_2_issues) - 30} 个")

    print(f"\n=== 总计 ===")
    print(f"P0-1 文件数: {len(p0_1_issues)}")
    print(f"P0-2 文件数: {len(p0_2_issues)}")
    union = set(p0_1_issues) | set(p0_2_issues)
    print(f"两类问题合并去重: {len(union)}")


if __name__ == "__main__":
    main()
