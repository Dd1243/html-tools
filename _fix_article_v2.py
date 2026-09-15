"""
修复 <article> 在 <header> 内部打开的结构错误 - 安全版本
关键修复：不重新读写文件，用正确的 read→modify→write 流程
"""
import glob, re

def fix_file(fpath: str) -> tuple[bool, str]:
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    original = html

    # Step 1: 把 <article> 从 <header> 内部移出
    # 匹配：<header...> <article><h1...>...</h1> </header>
    # 改为：<header...> <h1...>...</h1> </header> <article>
    pattern1 = re.compile(
        r'(<header\b[^>]*>)\s*(<article>)\s*(<h1\b[^>]*>.*?</h1>)\s*(</header>)',
        re.S | re.I
    )
    m1 = pattern1.search(html)
    if m1:
        replacement = f'{m1.group(1)}\n        {m1.group(3)}\n      {m1.group(4)}\n\n      <article>'
        html = pattern1.sub(lambda _: replacement, html, count=1)

    # Step 1b: 宽松匹配（header 里 article 但没紧跟 h1）
    if not m1:
        pattern1b = re.compile(
            r'(<header\b[^>]*>)\s*(<article>)\s*(.*?)\s*(</header>)',
            re.S | re.I
        )
        m1b = pattern1b.search(html)
        if m1b:
            replacement = f'{m1b.group(1)}\n        {m1b.group(3)}\n      {m1b.group(4)}\n\n      <article>'
            html = pattern1b.sub(lambda _: replacement, html, count=1)

    # Step 2: 把 </article> 从 </main> 前移到 <footer> 前
    # 匹配：</footer> ... </article></main>
    pattern2 = re.compile(
        r'(</footer>)\s*(</article>)\s*(</main>)',
        re.S | re.I
    )
    m2 = pattern2.search(html)
    if m2:
        replacement = f'</article>\n\n      {m2.group(1)}\n    {m2.group(3)}'
        html = pattern2.sub(lambda _: replacement, html, count=1)

    # Step 2b: 如果上面没匹配到，试 </article></main> 模式
    if not m2:
        pattern2b = re.compile(
            r'(</article>)\s*(</main>)',
            re.S | re.I
        )
        m2b = pattern2b.search(html)
        if m2b:
            footer_m = re.search(r'<footer\b', html[:m2b.start()], re.I)
            if footer_m:
                # 删除原 </article>，在 <footer> 前插入
                close_pos = m2b.start(1)
                html = html[:close_pos] + html[close_pos + len(m2b.group(1)):]
                html = html[:footer_m.start()] + '</article>\n\n      ' + html[footer_m.start():]

    if html == original:
        return (False, 'no change needed')
    # 安全写回：直接写修改后的 html 字符串，不重新读文件
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
    return (True, 'fixed')

def main():
    all_htmls = sorted(glob.glob('tools/**/*.html', recursive=True) + glob.glob('guides/*.html'))
    total = len(all_htmls)
    fixed_cnt = 0
    for i, f in enumerate(all_htmls):
        try:
            ok, msg = fix_file(f)
            if ok:
                fixed_cnt += 1
        except Exception as e:
            print(f'[ERROR] {f}: {e}')
            continue
        if (i + 1) % 200 == 0 or (i + 1) == total:
            print(f'Processed {i+1}/{total} — fixed: {fixed_cnt}')
    print(f'\nSUMMARY: {fixed_cnt} files fixed')

if __name__ == '__main__':
    main()
