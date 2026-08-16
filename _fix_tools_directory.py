# -*- coding: utf-8 -*-
"""
批量修复 tools-directory.html
任务 A：修复工具名 == 工具描述的空卡片
任务 B：为 Top 10+ 分类插入 80-120 字的分类简介
"""
import re
import os
import shutil
from html import unescape

SRC = r"e:\html-tools\tools-directory.html"
BAK = r"e:\html-tools\tools-directory.html.bak"
TOOLS_ROOT = r"e:\html-tools\tools"

# ============== 读取 + 备份 ==============
with open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

shutil.copy(SRC, BAK)
print(f"[备份] 已写入 {BAK}")

# ============== 分类简介池 (任务 B) ==============
CAT_INTROS = {
    "dev": "覆盖前后端开发调试的高频场景，包括 JSON/YAML 格式化、Base64/JWT 编解码、正则测试与可视化、Cron/Docker 配置生成、Git Diff 美化、SQL/HTML/CSS 美化压缩等，所有操作均在浏览器本地完成，避免敏感配置上传。",
    "text": "包含中英文标点校正、字数统计、去重/去空格、大小写转换、繁简互转、Markdown 编辑、Lorem 假文生成、文本加密解密、文本对比、词频分析等，支持文档片段的快速清洗和批量处理。",
    "converter": "长度/重量/货币/温度/进制等单位互转，以及 JSON/YAML/CSV/XML/Morse 码等格式转换，实时显示中间步骤和精度警告，避免手工换算出错，结果一键复制。",
    "calculator": "日常、财务和教育场景的通用计算器，涵盖复利、房贷、汇率分摊、折旧、BMI、油耗、时间差、百分比换算、科学计算、程序员进制计算等，无需下载 App 打开即用。",
    "generator": "二维码、Hash、密码、Lorem、CSS 渐变、阴影、Flex/Grid 布局、SVG 图标、favicon、配色、表格、条码、假数据、名片、白噪音、印章等可视化生成器，支持预览后直接复制或下载。",
    "media": "图片压缩、格式转换、抠像、EXIF 查看/去除、PDF 拆分合并、颜色处理、Canvas 绘图、音频剪辑预览、屏幕录制、SVG 编辑、Base64 图片互转等浏览器本地媒体处理，上传前即可完成隐私脱敏。",
    "finance": "个人和小微企业日常财务计算，包括贷款月供、提前还款、复利终值、投资收益率、退休规划、债务清偿、利润核算、预算拆解、汇率分账、折旧计算等快速辅助工具，输出仅供参考。",
    "seo": "Meta 标签检测、标题长度预览、关键词密度、Heading 结构分析、robots/sitemap 校验、SERP 模拟、页面重定向检查、OG 预览、ALT 属性检查等，帮助网站运营做收录前的自查动作。",
    "privacy": "密码生成、AES/RSA 加密、随机密钥、隐私数据脱敏、邮箱地址隐匿、信用卡号校验、文件哈希、日志掩码、隐写术、剪贴板清洗等工具，所有加密解密在本地 JS 内完成，密钥不出浏览器。",
    "time": "时间戳与日期双向转换、Cron 解析、倒计时/正计时、时区对比、节假日倒计时、打卡工时记录、工作日差计算、农历查询、番茄钟、世界时钟等，帮助跨时区协作与项目排期。",
    "network": "IP 归属查询、子网掩码计算、DNS 查询、SSL 证书检测、端口扫描、MAC 地址查询、WHOIS 查询、User Agent 解析、HTTP 客户端、SSE/WS 测试等网络快速诊断工具，适合运维与前端自查。",
    "ai": "汇总主流大模型对比、Token 计费、Agent/MCP 生态、AI 编程助手、提示词模板、AI 图像生成、TTS/STT 工具选型与价格对比，帮助开发者和运营快速选择合适的 AI 服务。",
    "extractor": "文本/图片中的链接提取、邮箱提取、手机号提取、正则抽取、颜色提取、EXIF 信息抓取等，粘贴原始素材即可批量获得结构化结果，支持 CSV 导出。",
    "life": "涵盖生活琐事计算与记录：年假天数、倒计时、预产期、水电费、习惯打卡、待办清单、世界时钟、随机抽签、BMI、字数统计、快速笔记等日常实用小工具。",
    "education": "二叉树可视化、数学方程求解、统计分布、单位圆、学习计时、闪卡复习、错题整理等学习辅助工具，面向学生与自学人群，适配平板和手机。",
    "design": "CSS 渐变、玻璃拟态、Blob、波浪、字体预览、调色板、取色器、名片卡片、SVG 优化等设计辅助生成器，所见即所得，结果可一键复制 CSS 或下载资源。",
    "fun": "摸鱼娱乐向工具集合：打字游戏、反应测速、骰子、硬币、记忆翻牌、数字猜谜、随机抽签、轮盘、命运决策、姓名生成、键盘反应训练等，工作间隙放松一下。",
    "game": "浏览器小游戏合集：贪吃蛇、扫雷、2048、俄罗斯方块、数独、井字棋、五子棋、打字挑战、记忆匹配、Flappy Bird、猜数字等，打开即玩无需安装。",
    "health": "BAC 饮酒估算、血压记录、体脂率、视力/听力自测、标准体重、饮水量追踪等健康自测小工具，适合日常记录与风险提示，不构成医疗建议。",
    "food": "卡路里估算、咖啡冲泡比、饮品配方、食材储存、食谱缩放、份量换算、定时器、购物清单、红酒搭配、茶计时器等厨房与饮食辅助工具。",
    "chinese": "银行卡 BIN、车牌归属、拼音声调、部首笔画、笔顺动画、繁简转换等中文场景专属工具，贴合国内用户日常生活与办公场景。",
    "ai-coding": "Cursor/VS Code AI 编程助手的快捷键、技巧、模型对比与使用指南，帮助开发者快速上手 AI 结对编程，提升编码效率。",
    "realestate": "房贷月供、提前还款、LPR 加点、房产税、租金回报率、组合贷款、Deed 税等房产相关计算工具，适合购房与出租决策参考。",
    "business": "小微企业日常经营辅助：盈亏平衡、现金流、成本核算、折旧、库存周转、发票、定价、ROI、薪资、应收款、估值、净现值等快速计算。",
    "crypto": "加密货币交易常用计算：复利/DCA、杠杆平仓价、强制平仓、仓位管理、手续费、Gas 费、利润/止损、挖矿收益、单位换算等，数值仅供参考。",
    "legal": "合同要点自查、法律费用速算、诉讼时效、免责声明生成、Cookie/Privacy/ToS/保密协议模板生成器，仅限普通商务场景参考，不替代律师意见。",
    "social-media": "短视频文案、社媒标签、封面配色、字符效果、文案长度限制检查等社交平台内容运营辅助工具。",
    "team-tools": "团队协作小工具：破冰提问、RACI 责任矩阵、匿名投票、分组配对等，适合远程会议与敏捷团队快速组织。",
    "data": "CSV 查看/清洗、Excel 转 JSON、数据差异比对、透视表、抽样、归一化、排序、过滤、聚合、导入导出、图表生成、异常值检测等轻量级数据处理工具。",
    "office": "日程、甘特图、简历、发票、收据、座位表、考勤、工时、组织架构、任务看板、报销单、标签打印、签名板、会议计时器等办公文档生成工具。",
    "travel": "行李额度、时差、签证、电源插头、尺码换算、小费、旅行预算、打包清单、护照证件照、季节穿衣指南、常用外语短语等出行实用工具。",
    "math": "方程求解、单位圆三角函数、素数检测、统计计算器、几何公式速查等数学辅助工具，适合学生与工程快速验算。",
    "productivity": "番茄钟、看板、待办、习惯追踪、专注计时等效率提升工具集合。",
    "sports": "跑步配速、记分牌等运动相关工具。",
    "music": "和弦速查、节拍器等音乐练习工具。",
    "pets": "宠物年龄换算、喂食计划表、食量计算器等养宠辅助工具。",
    "photography": "摄影构图与相机参数速查等辅助工具。",
    "shopping": "单价对比、折扣计算等购物决策工具。",
    "language": "多语言工具入口与外语学习辅助工具集合。",
    "art": "色彩理论、调色板、混色器、色轮搭配等艺术创作配色辅助工具。",
    "social": "AA 分账、聚会活动等社交场景小工具。",
    "parenting": "婴儿辅食安排、育儿记录等家长日常辅助工具。",
    "diy": "编织计数器、油漆用量估算等手工 DIY 场景计算器。",
    "weather": "紫外线指数等天气相关辅助工具。",
    "astronomy": "月相查询等天文观测辅助工具。",
    "automotive": "油耗/油费计算、用车成本等车主工具。",
    "gardening": "园艺与种植相关辅助工具。",
    "fitness": "运动计时、组数记录等健身训练辅助工具。",
    "lifestyle": "日常综合生活工具集合，涵盖家居、兴趣与琐事处理。",
}

# 分类优先级（按工具数量 + 给定优先列表综合排序）
PRIORITY_10 = ["dev","text","converter","calculator","generator","media","finance","seo","privacy","time"]

# ============== 任务 A：提取工具描述辅助函数 ==============
FALLBACK_TEMPLATES = {
    "dev": "{name}：浏览器内直接处理开发相关数据，支持复制结果和分享链接",
    "text": "{name}：粘贴文本即可处理，结果一键复制，支持本地持久化",
    "converter": "{name}：多单位/多格式互转工具，实时预览无需等待",
    "calculator": "{name}：即时计算，支持常见参数组合，结果可复制",
    "finance": "{name}：即时计算，支持常见参数组合，结果可复制",
    "generator": "{name}：可视化生成对应代码或图片素材，支持多格式导出",
    "media": "{name}：浏览器本地处理图片，不上传到服务器，保护隐私",
    "privacy": "{name}：本地加密/随机化处理，敏感数据不出浏览器",
    "security": "{name}：本地加密/随机化处理，敏感数据不出浏览器",
}
FALLBACK_DEFAULT = "{name}：浏览器在线处理工具，输入即可预览结果、一键复制"

PREFIXES = ["快速", "在线", "浏览器", "可视化", "免费", "智能"]

def truncate_zh(s, max_len=28):
    """按汉字字符截断（中文每个字算 1，英文等也算 1）"""
    s = s.strip()
    if len(s) <= max_len:
        return s
    return s[:max_len] + "…"

def make_different(name, desc):
    """若提取出的描述恰好等于工具名，则加前缀修饰"""
    if desc.strip() == name.strip():
        for p in PREFIXES:
            cand = p + desc
            if cand != name:
                return cand
    return desc

def extract_tool_description(category, slug, tool_name):
    """按优先级 a→b→c→d→e 从工具页提取描述"""
    tool_page = os.path.join(TOOLS_ROOT, category, slug + ".html")
    if not os.path.exists(tool_page):
        # 兜底 e
        tpl = FALLBACK_TEMPLATES.get(category, FALLBACK_DEFAULT)
        return truncate_zh(make_different(tool_name, tpl.format(name=tool_name)))

    try:
        with open(tool_page, "r", encoding="utf-8") as f:
            page_html = f.read()
    except Exception:
        tpl = FALLBACK_TEMPLATES.get(category, FALLBACK_DEFAULT)
        return truncate_zh(make_different(tool_name, tpl.format(name=tool_name)))

    # a) meta description
    m = re.search(r'<meta\s+name\s*=\s*"description"\s+content\s*=\s*"([^"]*)"', page_html, re.IGNORECASE)
    if m and m.group(1).strip():
        desc = unescape(m.group(1)).strip()
        desc = truncate_zh(desc)
        return make_different(tool_name, desc)

    # b) og:description
    m = re.search(r'<meta\s+property\s*=\s*"og:description"\s+content\s*=\s*"([^"]*)"', page_html, re.IGNORECASE)
    if m and m.group(1).strip():
        desc = unescape(m.group(1)).strip()
        desc = truncate_zh(desc)
        return make_different(tool_name, desc)

    # c) <title>
    m = re.search(r'<title>([^<]*)</title>', page_html, re.IGNORECASE)
    if m and m.group(1).strip():
        title_text = m.group(1).strip()
        # 去掉 - 或 | 分隔的后缀
        for sep in [" - ", " | ", " — "]:
            if sep in title_text:
                title_text = title_text.split(sep)[0]
                break
        title_text = title_text.strip()
        if title_text:
            desc = truncate_zh(title_text)
            return make_different(tool_name, desc)

    # d) h1 之后第一段 p 的前 40 字
    m = re.search(r'<h1[^>]*>(.*?)</h1>', page_html, re.IGNORECASE | re.DOTALL)
    if m:
        rest = page_html[m.end():]
        pm = re.search(r'<p[^>]*>(.*?)</p>', rest, re.IGNORECASE | re.DOTALL)
        if pm:
            plain = re.sub(r'<[^>]+>', '', pm.group(1))
            plain = unescape(plain).strip()
            if plain:
                first40 = plain[:40]
                desc = truncate_zh(first40)
                return make_different(tool_name, desc)

    # e) 兜底
    tpl = FALLBACK_TEMPLATES.get(category, FALLBACK_DEFAULT)
    return truncate_zh(make_different(tool_name, tpl.format(name=tool_name)))

# ============== 执行任务 A ==============
# 匹配每张卡片:
#   <a class="tool-card" href="/tools/{CATEGORY}/{SLUG}">
#     <div class="tool-icon">XX</div>
#     <div class="tool-body">
#       <div class="tool-name">NAME</div>
#       <div class="tool-desc">DESC</div>
#     </div>
#   </a>
CARD_PATTERN = re.compile(
    r'(<a\s+class="tool-card"\s+href="/tools/([^/"]+)/([^"]+)">\s*'
    r'<div\s+class="tool-icon">.*?</div>\s*'
    r'<div\s+class="tool-body">\s*'
    r'<div\s+class="tool-name">)(.*?)(</div>\s*'
    r'<div\s+class="tool-desc">)(.*?)(</div>\s*'
    r'</div>\s*</a>)',
    re.DOTALL
)

task_a_count = 0
task_a_samples = []  # (href, old_desc, new_desc, tool_name)

def task_a_replacer(m):
    global task_a_count
    prefix = m.group(1)
    category = m.group(2)
    slug = m.group(3)
    name = m.group(4)
    between = m.group(5)
    old_desc = m.group(6)
    suffix = m.group(7)

    name_strip = name.strip()
    desc_strip = old_desc.strip()

    # 只有完全相等才修改
    if name_strip == desc_strip:
        new_desc = extract_tool_description(category, slug, name_strip)
        task_a_count += 1
        if len(task_a_samples) < 10:
            task_a_samples.append(
                (f"/tools/{category}/{slug}", name_strip, old_desc, new_desc)
            )
        return f"{prefix}{name}{between}{new_desc}{suffix}"
    else:
        return m.group(0)

html = CARD_PATTERN.sub(task_a_replacer, html)
print(f"[任务A] 共修复 {task_a_count} 张空描述卡片")

# ============== 执行任务 B ==============
# 解析每个分类: 统计 cat-count，提取 cat-id 与 link path
SECTION_PATTERN = re.compile(
    r'(<section\s+class="cat-section"\s+id="cat-([^"]+)"[^>]*>.*?'
    r'<div\s+class="cat-header">.*?'
    r'<a\s+class="cat-title"[^>]*\s+href="/tools/([^"]+)/".*?'
    r'<span\s+class="cat-count">(\d+)\s*个工具</span>.*?'
    r'</div>\s*)(<div\s+class="tool-grid">)',
    re.DOTALL
)

# 先收集所有分类信息（用于按数量排序）
cat_info_list = []
for sm in SECTION_PATTERN.finditer(html):
    cat_id = sm.group(2)
    link_path = sm.group(3)
    count = int(sm.group(4))
    cat_info_list.append((cat_id, link_path, count))

# 先按 PRIORITY_10 排前，再按 count 降序
def sort_key(item):
    cat_id = item[0]
    if cat_id in PRIORITY_10:
        pri = PRIORITY_10.index(cat_id)
        return (0, pri, -item[2])
    return (1, 0, -item[2])

cat_info_list.sort(key=sort_key)

# 如果已有分类简介则跳过插入（避免重复）
INTRO_TAG = 'class="cat-intro"'

task_b_count = 0

# 从处理顺序角度：从后向前替换，避免位置错位
# 但这里使用正则多次替换，更稳妥是单次处理。
# 改写为单次 sub 并根据 cat-id 决定是否插入
intro_html_by_cat = {}
for cat_id, _, _ in cat_info_list:
    intro = CAT_INTROS.get(cat_id)
    if intro:
        intro_html_by_cat[cat_id] = (
            '          <p class="cat-intro" style="margin: 10px 12px 18px; padding: 12px 16px; '
            'background: rgba(13, 148, 136, 0.05); border-left: 3px solid var(--accent, #0d9488); '
            'border-radius: 8px; color: var(--text-secondary, #475569); font-size: 0.92rem; line-height: 1.75;">'
            f'\n            {intro}\n          </p>\n'
        )

def task_b_replacer(m):
    global task_b_count
    cat_id = m.group(2)
    before = m.group(1)  # section 开头到 </div>(cat-header 后)
    toolgrid = m.group(5)

    # 如果这一段里已经有 cat-intro，就跳过
    if INTRO_TAG in before:
        return m.group(0)

    intro_html = intro_html_by_cat.get(cat_id)
    if intro_html:
        task_b_count += 1
        # 在 cat-header 的结束 </div> 和 <div class="tool-grid"> 之间插入
        return f"{before}{intro_html}{toolgrid}"
    else:
        return m.group(0)

html = SECTION_PATTERN.sub(task_b_replacer, html)
print(f"[任务B] 共给 {task_b_count} 个分类插入了简介")

# ============== 写回 ==============
with open(SRC, "w", encoding="utf-8") as f:
    f.write(html)
print(f"[写回] 已覆盖 {SRC}")

# ============== 报告 ==============
print("\n" + "=" * 60)
print("修复报告")
print("=" * 60)
print(f"任务 A：修复空描述卡片（name==desc）共 {task_a_count} 张")
print(f"任务 B：新增分类简介段落共 {task_b_count} 个")
print("\n【任务 A 前后对比样例（最多 5 组）】")
for i, s in enumerate(task_a_samples[:5], 1):
    href, name, old, new = s
    print(f"\n样例 {i}: href={href}")
    print(f"  工具名:   {name}")
    print(f"  修复前:   {old!r}")
    print(f"  修复后:   {new!r}")

print("\n【任务 B 已添加简介的分类】")
for ci in cat_info_list:
    if ci[0] in intro_html_by_cat:
        print(f"  - {ci[0]} ({ci[2]} 个工具) -> {len(CAT_INTROS.get(ci[0], ''))} 字")
