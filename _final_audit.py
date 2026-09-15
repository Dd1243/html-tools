#!/usr/bin-env python3
# -*- coding: utf-8 -*-
"""
最终修复审计：扫描全站 HTML，检查空文件、<article> 在 <header> 内、
<article> 跨越 <footer> 三类问题，生成修复确认清单。
"""
import os
import re
import json
from pathlib import Path
from datetime import datetime

ROOT = Path(r"e:\html-tools")
SCAN_DIRS = [ROOT / "tools", ROOT / "guides"]
REPORT_FILE = ROOT / "_final_audit_report.md"
JSON_FILE = ROOT / "_final_audit_report.json"


def scan_html_files():
    """枚举所有 HTML 文件"""
    files = []
    for d in SCAN_DIRS:
        if not d.exists():
            continue
        for p in d.rglob("*.html"):
            files.append(p)
    return sorted(files)


def is_empty_file(p: Path) -> bool:
    """空文件或仅含空白"""
    try:
        size = p.stat().st_size
    except OSError:
        return True
    if size == 0:
        return True
    # 检查是否全部为空白
    try:
        text = p.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return True
    return len(text.strip()) == 0


def check_article_in_header(html: str) -> bool:
    """检查 <article> 是否真正在某个 <header> 块内部（同一 header 块内）。
    正确处理嵌套：先抽取每个 <header>...</header> 块，再检查块内是否含 <article>。
    不会误判 <article> 外层 + 内部 <header class="article-hero"> 的合法结构。
    """
    header_blocks = re.findall(
        r'<header\b[^>]*>(?:(?!</header>)[\s\S])*?</header>',
        html,
        re.I
    )
    for block in header_blocks:
        if re.search(r'<article\b', block, re.I):
            # 但要排除 article 内部又出现 header 的情况
            # 简单判断：block 内 <article> 必须出现在 <header> 之前才违规
            # 真正违规：<header ...>... <article>...</article> ...</header>
            # 合法：<article>...<header ...>...</header>...</article>
            # 由于这里 block 已经是 <header>...</header>，内部出现 <article> 即违规
            # （因为 article 不应嵌套在 header 内）
            return True
    return False


def check_article_across_footer(html: str) -> bool:
    """检测 <article> 是否真正跨越 <footer>。
    合法：article 内包含 footer（footer 在 article 内打开并闭合）。
    违规：footer 打开后 article 在 footer 内打开，但 </article> 在 </footer> 之后；
          或 article 在 footer 之前打开，</article> 在 </footer> 之后（footer 完全在 article 内未闭合）。
    用栈方式精确判断。
    """
    stack = []
    pattern = re.compile(
        r'(<article\b[^>]*>|</article>|<footer\b[^>]*>|</footer>)',
        re.I
    )
    for m in pattern.finditer(html):
        tag = m.group(1).lower()
        if tag.startswith('<article') and not tag.startswith('</'):
            stack.append('article')
        elif tag == '</article>':
            # 弹出栈顶直到找到 article
            while stack and stack[-1] != 'article':
                # 如果栈顶是 footer，说明 article 跨越了 footer（footer 在 article 之前打开但未闭合）
                if stack[-1] == 'footer':
                    return True
                stack.pop()
            if stack and stack[-1] == 'article':
                stack.pop()
        elif tag.startswith('<footer') and not tag.startswith('</'):
            stack.append('footer')
        elif tag == '</footer>':
            # 弹出栈顶直到找到 footer
            while stack and stack[-1] != 'footer':
                # 如果栈顶是 article，说明 footer 跨越了 article（article 在 footer 内打开但未闭合）
                # 这种情况其实是 article 在 footer 内打开但闭合在 footer 之后——属于 article 跨越 footer
                if stack[-1] == 'article':
                    return True
                stack.pop()
            if stack and stack[-1] == 'footer':
                stack.pop()
    return False


def check_article_missing_close(html: str) -> bool:
    """检查 <article> 数量与 </article> 数量是否一致"""
    open_count = len(re.findall(r'<article\b[^>]*>', html, re.I))
    close_count = len(re.findall(r'</article>', html, re.I))
    return open_count != close_count


def check_article_missing(html: str) -> bool:
    """完全没有 <article> 标签"""
    return '<article' not in html.lower()


def check_main_missing(html: str) -> bool:
    """完全没有 <main> 标签"""
    return '<main' not in html.lower()


def analyze_file(p: Path):
    """分析单个文件"""
    rel = str(p.relative_to(ROOT)).replace("\\", "/")
    try:
        text = p.read_text(encoding="utf-8", errors="ignore")
    except OSError as e:
        return {
            "file": rel,
            "size": 0,
            "empty": True,
            "read_error": str(e),
            "article_in_header": False,
            "article_across_footer": False,
            "article_count_mismatch": False,
            "article_missing": True,
            "main_missing": True,
        }

    issues = {
        "file": rel,
        "size": p.stat().st_size,
        "empty": is_empty_file(p),
        "read_error": None,
        "article_in_header": check_article_in_header(text),
        "article_across_footer": check_article_across_footer(text),
        "article_count_mismatch": check_article_missing_close(text),
        "article_missing": check_article_missing(text),
        "main_missing": check_main_missing(text),
    }
    return issues


def main():
    files = scan_html_files()
    print(f"[INFO] 扫描 {len(files)} 个 HTML 文件")

    results = []
    for i, p in enumerate(files, 1):
        r = analyze_file(p)
        results.append(r)
        if i % 100 == 0:
            print(f"  已扫描 {i}/{len(files)}")

    # 统计
    empty_files = [r for r in results if r["empty"]]
    article_in_header = [r for r in results if r["article_in_header"] and not r["empty"]]
    article_across_footer = [r for r in results if r["article_across_footer"] and not r["empty"]]
    count_mismatch = [r for r in results if r["article_count_mismatch"] and not r["empty"]]
    article_missing = [r for r in results if r["article_missing"] and not r["empty"]]
    main_missing = [r for r in results if r["main_missing"] and not r["empty"]]

    summary = {
        "scan_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_files": len(files),
        "empty_files": len(empty_files),
        "article_in_header_issues": len(article_in_header),
        "article_across_footer_issues": len(article_across_footer),
        "article_count_mismatch": len(count_mismatch),
        "article_missing": len(article_missing),
        "main_missing": len(main_missing),
    }

    # 写 JSON
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump({"summary": summary, "issues": {
            "empty_files": [r["file"] for r in empty_files],
            "article_in_header": [r["file"] for r in article_in_header],
            "article_across_footer": [r["file"] for r in article_across_footer],
            "article_count_mismatch": [r["file"] for r in count_mismatch],
            "article_missing": [r["file"] for r in article_missing],
            "main_missing": [r["file"] for r in main_missing],
        }}, f, ensure_ascii=False, indent=2)

    # 写 Markdown 报告
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write("# 全站修复审计报告\n\n")
        f.write(f"**扫描时间：** {summary['scan_time']}\n\n")
        f.write(f"**扫描范围：** `tools/` + `guides/`\n\n")
        f.write(f"**总文件数：** {summary['total_files']}\n\n")
        f.write("---\n\n")
        f.write("## 总结\n\n")
        f.write("| 检查项 | 问题文件数 | 状态 |\n")
        f.write("|--------|-----------|------|\n")
        f.write(f"| 空文件 | {summary['empty_files']} | {'✅ 已解决' if summary['empty_files'] == 0 else '❌ 未解决'} |\n")
        f.write(f"| `<article>` 在 `<header>` 内 | {summary['article_in_header_issues']} | {'✅ 已解决' if summary['article_in_header_issues'] == 0 else '❌ 未解决'} |\n")
        f.write(f"| `<article>` 跨越 `<footer>` | {summary['article_across_footer_issues']} | {'✅ 已解决' if summary['article_across_footer_issues'] == 0 else '❌ 未解决'} |\n")
        f.write(f"| `<article>` 开闭数量不一致 | {summary['article_count_mismatch']} | {'✅ 已解决' if summary['article_count_mismatch'] == 0 else '❌ 未解决'} |\n")
        f.write(f"| 完全缺失 `<article>` | {summary['article_missing']} | {'⚠️ 需关注' if summary['article_missing'] > 0 else '✅ 已解决'} |\n")
        f.write(f"| 完全缺失 `<main>` | {summary['main_missing']} | {'⚠️ 需关注' if summary['main_missing'] > 0 else '✅ 已解决'} |\n")
        f.write("\n---\n\n")

        if empty_files:
            f.write("## ❌ 空文件清单\n\n")
            for r in empty_files:
                f.write(f"- `{r['file']}`\n")
            f.write("\n")
        else:
            f.write("## ✅ 空文件清单\n\n")
            f.write("无空文件。之前批量修复脚本误清空的 160 个文件已通过 `git checkout` 从历史版本恢复并重新修复。\n\n")
            f.write("**修复提交：** `225523c4` / 合并 `b7b4d035`\n\n")
            f.write("---\n\n")

        if article_in_header:
            f.write("## ❌ `<article>` 在 `<header>` 内残留清单\n\n")
            for r in article_in_header:
                f.write(f"- `{r['file']}`\n")
            f.write("\n")
        else:
            f.write("## ✅ `<article>` 在 `<header>` 内残留清单\n\n")
            f.write("无残留问题。之前发现的 160 个问题页面（含会话总结中提到的 14 个残留）均已修复。\n\n")
            f.write("---\n\n")

        if article_across_footer:
            f.write("## ❌ `<article>` 跨越 `<footer>` 残留清单\n\n")
            for r in article_across_footer:
                f.write(f"- `{r['file']}`\n")
            f.write("\n")
        else:
            f.write("## ✅ `<article>` 跨越 `<footer>` 残留清单\n\n")
            f.write("无残留问题。所有 `</article>` 已正确放置在 `</footer>` 之前。\n\n")
            f.write("---\n\n")

        if count_mismatch:
            f.write("## ❌ `<article>` 开闭数量不一致清单\n\n")
            for r in count_mismatch:
                f.write(f"- `{r['file']}`\n")
            f.write("\n")
        else:
            f.write("## ✅ `<article>` 开闭数量一致性\n\n")
            f.write("所有文件 `<article>` 开闭标签数量匹配。\n\n")
            f.write("---\n\n")

        f.write("## 修复历史回顾\n\n")
        f.write("| 阶段 | 操作 | 提交 |\n")
        f.write("|------|------|------|\n")
        f.write("| 1. 初次扫描 | 全站扫描发现 160 个页面 `<article>` 在 `<header>` 内打开或跨越 `<footer>` | - |\n")
        f.write("| 2. 批量修复 | 运行修复脚本，因写回逻辑错误误清空 160 个文件 | - |\n")
        f.write("| 3. 文件恢复 | `git checkout 225523c4~1 -- $(Get-Content _empty_files.txt)` 从历史版本恢复 | `225523c4~1` |\n")
        f.write("| 4. 重新修复 | 运行修正后的 `_fix_article_v2.py`（read→modify→write 安全流程） | `225523c4` |\n")
        f.write("| 5. 合并 | 推送并合并到 master | `b7b4d035` |\n")
        f.write("\n---\n\n")

        f.write("## 修复方案说明\n\n")
        f.write("### 1. `<article>` 从 `<header>` 移出\n\n")
        f.write("```python\n")
        f.write("pattern1 = re.compile(r'(<header\\b[^>]*>)\\s*(<article>)\\s*(<h1\\b[^>]*>.*?</h1>)\\s*(</header>)', re.S | re.I)\n")
        f.write("# 替换为：<header>\\n  <h1>...</h1>\\n</header>\\n\\n<article>\n")
        f.write("```\n\n")
        f.write("### 2. `</article>` 从 `</footer>` 后移到前\n\n")
        f.write("```python\n")
        f.write("pattern2 = re.compile(r'(</footer>)\\s*(</article>)\\s*(</main>)', re.S | re.I)\n")
        f.write("# 替换为：</article>\\n\\n</footer>\\n  </main>\n")
        f.write("```\n\n")
        f.write("### 3. 安全写回流程\n\n")
        f.write("```python\n")
        f.write("with open(fpath, 'r', encoding='utf-8') as f:\n")
        f.write("    html = f.read()  # 先读\n")
        f.write("# ... 修改 html ...\n")
        f.write("if html != original:\n")
        f.write("    with open(fpath, 'w', encoding='utf-8') as f:\n")
        f.write("        f.write(html)  # 再写\n")
        f.write("```\n\n")
        f.write("---\n\n")

        f.write("## 结论\n\n")
        all_clean = (
            summary['empty_files'] == 0
            and summary['article_in_header_issues'] == 0
            and summary['article_across_footer_issues'] == 0
            and summary['article_count_mismatch'] == 0
        )
        if all_clean:
            f.write("✅ **核心结构问题全部解决**：空文件、`<article>` 在 `<header>` 内、`<article>` 跨越 `<footer>`、`<article>` 开闭数量不一致 这四类核心问题均已清零。\n\n")
            f.write("⚠️ **注意**：`<article>` 缺失和 `<main>` 缺失属于另一类问题（部分页面未添加语义标签），不在本次修复范围内。如需处理可以另行安排。\n")
        else:
            f.write("❌ 仍有残留问题，请查看上方清单。\n")

    print(f"\n[DONE] 报告已生成：")
    print(f"  Markdown: {REPORT_FILE}")
    print(f"  JSON:     {JSON_FILE}")
    print(f"\n总结：")
    for k, v in summary.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
