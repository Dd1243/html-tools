#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量修复 article 跨越 footer 的问题。
问题模式：
1. <article> 错误嵌套在 <nav class="breadcrumb"> 内（未闭合）
2. </article> 错误闭合在 <footer> 内
3. 站点政策 nav 被塞入 main 内的 footer 中

修复策略：
- 删除 nav 内误嵌的 <article>
- 删除 footer 内误嵌的 </article>
- 把站点政策 nav 从 footer 内移出到 </main> 之后作为页面级 <footer>
"""
import re
from pathlib import Path

ROOT = Path(r"e:\html-tools")
ISSUES = [
    "tools/ai/ai-agent-guide.html",
    "tools/ai/ai-coding-tools-2025.html",
    "tools/ai/ai-image-generation-2025.html",
    "tools/data/data-cleaner.html",
    "tools/data/data-diff.html",
    "tools/data/data-merger.html",
    "tools/dev/api-mock.html",
    "tools/dev/ascii-table.html",
    "tools/dev/base64.html",
    "tools/dev/box-shadow.html",
    "tools/dev/favicon-checker.html",
    "tools/dev/json-to-go.html",
    "tools/dev/regex-tester.html",
    "tools/ecommerce/discount-calculator.html",
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
    "tools/life/world-clock.html",
    "tools/lifestyle/birthday-reminder.html",
    "tools/lifestyle/daily-affirmation.html",
    "tools/media/audio-visualizer.html",
    "tools/media/image-compressor.html",
    "tools/media/pdf-merge.html",
    "tools/music/metronome.html",
    "tools/shopping/price-comparison.html",
    "tools/travel/currency-tips.html",
    "tools/travel/itinerary-planner.html",
    "tools/travel/jet-lag-calc.html",
    "tools/travel/packing-list.html",
    "tools/travel/travel-budget.html",
    "tools/travel/trip-budget.html",
    "tools/travel/visa-requirements.html",
    "tools/weather/feels-like-temp.html",
    "tools/weather/uv-index.html",
]


def fix_file(fpath: Path) -> tuple[bool, str]:
    """修复单个文件"""
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    original = html

    # Step 1: 删除 nav.breadcrumb 内误嵌的 <article>
    # 模式：<nav class="breadcrumb"[^>]*>\s*<article>
    pattern1 = re.compile(
        r'(<nav\b[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>)\s*<article>',
        re.I
    )
    html = pattern1.sub(lambda m: m.group(1), html)

    # Step 2: 修复 footer 内误嵌的 </article> + 站点 nav
    # 模式：<footer>...<nav data-site-policy-links>...</nav></article>\s*</footer>\s*</main>
    # 修复为：把站点 nav 移出，包在新的 <footer data-site-policy> 内
    pattern2 = re.compile(
        r'<footer\b[^>]*>([\s\S]*?)<nav\s+data-site-policy-links\b[^>]*>([\s\S]*?)</nav>\s*</article>\s*</footer>\s*</main>',
        re.I
    )
    m2 = pattern2.search(html)
    if m2:
        # m2.group(1) 是 footer 内的本地内容
        # m2.group(2) 是 nav 内的内容
        # 重新组装：保留原 footer（只含本地内容），新加页面级 footer
        local_footer_content = m2.group(1).rstrip()
        nav_inner = m2.group(2)
        new_block = (
            f'<footer>{local_footer_content}\n      </footer>\n    </main>\n\n'
            f'    <footer data-site-policy style="border-top:1px solid var(--border-color,#e2e8f0);padding:16px;margin-top:24px">\n'
            f'      <nav data-site-policy-links aria-label="网站政策" style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px 20px;margin:0 auto;padding:0 16px;font-size:14px">{nav_inner}</nav>\n'
            f'    </footer>'
        )
        html = pattern2.sub(lambda _: new_block, html, count=1)
    else:
        # 备用模式：可能是 <footer>...</footer>\s*</article>\s*</main>
        # 直接删 </article>
        pattern2b = re.compile(
            r'</footer>\s*</article>\s*</main>',
            re.I
        )
        html = pattern2b.sub(lambda m: '</footer>\n    </main>', html)

        # 如果还有站点 nav 在 footer 内，移出来
        pattern2c = re.compile(
            r'<footer\b[^>]*>([\s\S]*?)<nav\s+data-site-policy-links\b[^>]*>([\s\S]*?)</nav>([\s\S]*?)</footer>\s*</main>',
            re.I
        )
        m2c = pattern2c.search(html)
        if m2c:
            before_nav = m2c.group(1).rstrip()
            nav_inner = m2c.group(2)
            after_nav = m2c.group(3).lstrip()
            new_block = (
                f'<footer>{before_nav}\n      </footer>\n    </main>\n\n'
                f'    <footer data-site-policy style="border-top:1px solid var(--border-color,#e2e8f0);padding:16px;margin-top:24px">\n'
                f'      <nav data-site-policy-links aria-label="网站政策" style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px 20px;margin:0 auto;padding:0 16px;font-size:14px">{nav_inner}</nav>\n'
                f'    </footer>'
            )
            html = pattern2c.sub(lambda _: new_block, html, count=1)

    # Step 3: 删除任何残留的孤立 </article>（在 footer 之前）
    # 模式：</article>\s*</footer>
    pattern3 = re.compile(
        r'</article>\s*</footer>',
        re.I
    )
    html = pattern3.sub(lambda m: '</footer>', html)

    # Step 4: 删除 nav.breadcrumb 内残留的孤立 <article>
    # 模式：<nav class="breadcrumb">[\s\S]*?<article>[\s\S]*?</nav>
    pattern4 = re.compile(
        r'(<nav\b[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>)([\s\S]*?)</nav>',
        re.I
    )
    def remove_article_in_nav(m):
        opening = m.group(1)
        inner = m.group(2)
        # 删除 inner 中的 <article>（开标签）
        inner = re.sub(r'<article\b[^>]*>', '', inner, flags=re.I)
        return opening + inner + '</nav>'
    html = pattern4.sub(remove_article_in_nav, html)

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
