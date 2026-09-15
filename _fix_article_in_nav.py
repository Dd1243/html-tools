#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量修复 <article> 在 <nav> 内打开的问题。
模式：<nav ...>...<article>...</nav>...</article>
修复：把 <article> 开标签从 nav 内删除，在 </nav> 后插入 <article>。
"""
import re
from pathlib import Path

ROOT = Path(r"e:\html-tools")
ISSUES_FILE = None  # 直接扫描


def scan_files():
    """扫描全站 HTML，找出 article-in-nav 问题文件"""
    scan_dirs = [ROOT / "tools", ROOT / "guides"]
    files = []
    for d in scan_dirs:
        if d.exists():
            files.extend(d.rglob("*.html"))
    files = sorted(files)

    issues = []
    for p in files:
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        # 检测 article 是否在某个 nav 块内
        nav_blocks = re.findall(
            r'<nav\b[^>]*>(?:(?!</nav>)[\s\S])*?</nav>',
            text,
            re.I
        )
        for block in nav_blocks:
            if re.search(r'<article\b', block, re.I):
                rel = str(p.relative_to(ROOT)).replace("\\", "/")
                issues.append((p, rel))
                break
    return issues


def fix_file(fpath: Path) -> tuple[bool, str]:
    """修复单个文件"""
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    original = html

    # 模式：<nav ...>([\s\S]*?)<article\b[^>]*>([\s\S]*?)</nav>
    # 修复：删除 nav 内的 <article>，在 </nav> 后插入 <article>
    pattern = re.compile(
        r'(<nav\b[^>]*>)([\s\S]*?)<article\b[^>]*>([\s\S]*?)(</nav>)',
        re.I
    )
    m = pattern.search(html)
    if m:
        nav_open = m.group(1)
        before_article = m.group(2)
        content_after_article = m.group(3)
        nav_close = m.group(4)
        # nav 内只保留 before_article + content_after_article（去掉 <article> 标签）
        # 在 </nav> 后插入 <article>
        new_block = (
            f'{nav_open}{before_article}{content_after_article}{nav_close}\n'
            f'      <article>'
        )
        html = html[:m.start()] + new_block + html[m.end():]

    if html != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html)
        return (True, 'fixed')
    return (False, 'no change')


def main():
    print(f"[INFO] 扫描全站查找 article-in-nav 问题...")
    issues = scan_files()
    print(f"[INFO] 发现 {len(issues)} 个文件有问题\n")

    fixed = []
    no_change = []
    for i, (fpath, rel) in enumerate(issues, 1):
        ok, status = fix_file(fpath)
        if ok:
            fixed.append(rel)
            print(f"  [{i}/{len(issues)}] FIXED  {rel}")
        else:
            no_change.append(rel)
            print(f"  [{i}/{len(issues)}] NOCHG {rel}")

    print(f"\n=== 总结 ===")
    print(f"已修复: {len(fixed)}")
    print(f"未变化: {len(no_change)}")
    if no_change:
        print("未变化文件：")
        for f in no_change:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
