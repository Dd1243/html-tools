#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
精确修复 <article> 在 <header> 内打开的问题。
只移动 <article> 开标签从 <header> 内部移到 </header> 之后，
不改动 article 内含 footer 的合法结构（HTML5 允许 footer 作为 article 子元素）。
"""
import re
from pathlib import Path

ROOT = Path(r"e:\html-tools")
ISSUES = [
    "tools/data/data-cleaner.html",
    "tools/data/data-diff.html",
    "tools/data/data-merger.html",
    "tools/dev/ascii-table.html",
    "tools/dev/base64.html",
    "tools/dev/regex-tester.html",
    "tools/education/reading-tracker.html",
    "tools/education/statistics.html",
    "tools/fitness/workout-logger.html",
    "tools/fitness/workout-timer.html",
    "tools/gardening/plant-watering.html",
    "tools/gardening/watering-schedule.html",
    "tools/generator/qrcode-generator.html",
    "tools/legal/agreement-compare.html",
    "tools/legal/contract-review.html",
    "tools/legal/cookie-policy.html",
    "tools/legal/disclaimer-gen.html",
    "tools/legal/gdpr-checklist.html",
    "tools/legal/lawsuit-fee.html",
    "tools/legal/lawyer-fee.html",
    "tools/legal/legal-deadline.html",
    "tools/legal/legal-glossary.html",
    "tools/legal/nda-generator.html",
    "tools/legal/privacy-policy.html",
    "tools/legal/terms-generator.html",
    "tools/lifestyle/birthday-reminder.html",
    "tools/lifestyle/daily-affirmation.html",
    "tools/media/image-compressor.html",
    "tools/travel/itinerary-planner.html",
    "tools/travel/trip-budget.html",
    "tools/weather/feels-like-temp.html",
    "tools/weather/uv-index.html",
]


def fix_file(fpath: Path) -> tuple[bool, str]:
    """修复单个文件。
    模式：<header ...>...<article>...</header>
    修复：<header ...>...</header>\n<article>...
    """
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    original = html

    # 匹配 <header ...>[\s\S]*?<article\b[^>]*>([\s\S]*?)</header>
    # 把 <article> 开标签从 header 内删除，header 内只保留其他内容
    # 在 </header> 后插入 <article>
    pattern = re.compile(
        r'(<header\b[^>]*>)([\s\S]*?)<article\b[^>]*>([\s\S]*?)(</header>)',
        re.I
    )
    m = pattern.search(html)
    if m:
        header_open = m.group(1)
        before_article = m.group(2)
        content_after_article = m.group(3)
        header_close = m.group(4)
        # header 内只保留 before_article + content_after_article（去掉 <article> 标签）
        # 在 </header> 后插入 <article>
        new_block = (
            f'{header_open}{before_article}{content_after_article}{header_close}\n'
            f'      <article>'
        )
        # 一次性替换整个匹配块
        html = html[:m.start()] + new_block + html[m.end():]

    if html != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html)
        return (True, 'fixed')
    return (False, 'no change')


def main():
    print(f"[INFO] 开始修复 {len(ISSUES)} 个文件")
    fixed = []
    no_change = []
    for i, rel in enumerate(ISSUES, 1):
        fpath = ROOT / rel
        if not fpath.exists():
            print(f"  [MISSING] {rel}")
            continue
        ok, status = fix_file(fpath)
        if ok:
            fixed.append(rel)
            print(f"  [{i}/{len(ISSUES)}] FIXED  {rel}")
        else:
            no_change.append(rel)
            print(f"  [{i}/{len(ISSUES)}] NOCHG {rel}")

    print(f"\n=== 总结 ===")
    print(f"已修复: {len(fixed)}")
    print(f"未变化: {len(no_change)}")
    if no_change:
        print("未变化文件：")
        for f in no_change:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
