# -*- coding: utf-8 -*-
"""
V3: 批量修复 tools-directory.html
任务 A 改进：
  - 提取关键词时去除以工具名/工具类别开头的第一个重复词
  - 将 "支持X、Y、Z等常用功能" 改为更自然的短描述（如 "X、Y、Z 一键处理"）
  - 如果关键词第一个词等于工具名则去除
  - 避免以 "支持/覆盖" 开头导致模板化；随机改用其它写法
"""
import re
import os
import shutil
import random
from html import unescape

SRC = r"e:\html-tools\tools-directory.html"
BAK = r"e:\html-tools\tools-directory.html.bak"
TOOLS_ROOT = r"e:\html-tools\tools"

# 还原
if os.path.exists(BAK):
    shutil.copy(BAK, SRC)
    print(f"[还原] 已从备份还原")
else:
    with open(SRC, "r", encoding="utf-8") as f:
        _orig = f.read()
    shutil.copy(SRC, BAK)

with open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

# ============== 分类简介池（V2 已验证 OK，保留）==============
CAT_INTROS = {
    "dev": "覆盖前后端开发调试的高频场景，包括 JSON/YAML 格式化、Base64/JWT 编解码、正则测试与可视化、Cron/Docker 配置生成、Git Diff 美化、SQL/HTML/CSS 美化压缩、Nginx/HTACCESS 规则转换、API 调试、WebSocket/SSE 测试等，所有操作均在浏览器本地完成，避免敏感配置上传。",
    "text": "包含中英文标点校正、字数统计、去重/去空格、大小写转换、繁简互转、Markdown 编辑与预览、Lorem 假文生成、文本加密解密、文本差异对比、词频分析、文本排序合并、BBcode/HTML 互转、双拼练习、拼音排序、摩斯码编解码等，支持文档片段的快速清洗和批量处理。",
    "converter": "长度/重量/货币/温度/面积/体积/速度/文件大小/数据单位等常用单位互转，以及 JSON/YAML/CSV/XML/Morse 码等格式转换，实时显示中间步骤和精度警告，避免手工换算出错，结果支持多种格式一键复制。",
    "calculator": "日常、财务和教育场景的通用计算器，涵盖复利终值、房贷月供与提前还款、汇率分摊、各类折旧算法、BMI 体脂、油耗计算、时间差、百分比换算、科学函数、程序员进制与位运算、进度条比例换算等，无需下载 App 打开即用。",
    "generator": "二维码、Hash 摘要、随机密码、Lorem 占位文本、CSS 渐变、阴影圆角、Flex/Grid 布局代码、SVG 图标与占位图、favicon、和谐配色、Markdown/HTML 表格、条码/标签、用户画像假数据、电子名片 vCard、白噪音、水印印章等可视化生成器，支持预览后直接复制或下载。",
    "media": "图片压缩、格式转换、批量尺寸、背景抠像、EXIF 查看与剥离、PDF 拆分合并压缩、调色板与颜色提取、Canvas 绘图、音频剪辑预览、屏幕录制、SVG 在线编辑与导出、Base64 图片互转、GIF 制作与拆分、证件照排版、图像滤镜拼接等浏览器本地媒体处理，上传前即可完成隐私脱敏。",
    "finance": "个人和小微企业日常财务计算，包括等额本息/等额本金月供、提前还款对比、复利终值与定投收益、IRR 投资收益率、退休储蓄规划、债务清偿优先级、销售利润率与成本拆解、预算拆分、多币种 AA 分账、直线/双倍余额折旧等快速辅助工具，输出仅供参考，不构成理财建议。",
    "seo": "Meta 标签合规检测、标题/描述长度实时预览、关键词密度与 TF 估算、Heading 层级结构分析、robots/sitemap 语法校验、Google/百度 SERP 模拟、301/302 重定向链检查、OG/Twitter Card 预览、图片 ALT 属性缺失扫描、内链分析等，帮助网站运营做收录前的自查动作。",
    "privacy": "密码/密钥随机生成、AES/RSA 非对称加解密、一次性 OTP、隐私数据（姓名/手机/邮箱/身份证）脱敏、邮箱地址隐匿反爬、信用卡号 Luhn 校验与 BIN 查询、文件哈希、服务器日志掩码、隐写术图片、剪贴板敏感词清洗等，所有加密解密在本地 JS 内完成，密钥不出浏览器。",
    "time": "Unix 时间戳与日期双向转换、Cron 表达式解析与可视化、倒计时/正计时、多时区时钟对比、节假日与生日倒计时、打卡工时与加班记录、公历农历互查、工作日差与自然日差、番茄钟专注计时、世界时钟对照等，帮助跨时区协作与项目排期。",
    "network": "IP 归属地与运营商查询、CIDR 子网掩码计算、DNS A/CNAME/MX/TXT 记录查询、SSL 证书链检测与到期提醒、端口扫描与常见端口速查、MAC 地址厂商、WHOIS 域名注册信息、User Agent 解析、在线 HTTP/Rest 客户端、SSE 推送订阅、WebSocket 双向测试等网络快速诊断工具，适合运维与前端自查。",
    "ai": "汇总主流大模型能力对比、Token 单价与计费上限估算、Agent/MCP 客户端生态盘点、VS Code/Cursor 等 AI 编程助手指南、多行业提示词模板与技巧合集、AI 图像与视频生成、TTS/STT 工具选型与价格对比，帮助开发者和运营在预算内快速选择合适的 AI 服务。",
    "extractor": "从长文本或源码中批量提取正则匹配内容、链接 URL、邮箱地址、手机号、身份证号、颜色值 HEX/RGB、Meta 信息、EXIF 数据、图片 Base64 等，粘贴原始素材即可快速获得结构化结果，支持去重、CSV/JSON 导出和批量复制。",
    "life": "涵盖生活琐事计算与记录：年假与调休天数、生日事件倒计时、预产期估算、水电费阶梯计算、习惯打卡追踪、待办清单看板、多时区世界时钟、随机抽签决策、BMI 与标准体重、文档字数统计、快速便签草稿、随机数字/分组、文件合并等日常实用小工具。",
    "education": "二叉树结构可视化、方程求根与方程组求解、描述统计与概率分布计算、单位圆三角函数速查、番茄钟学习计时、抽认闪卡记忆、错题本整理与复习间隔、罗马数字转换、ASCII/Unicode 码表、进制与单位转换、键盘盲打训练等学习辅助工具，适配平板和手机。",
    "design": "CSS 渐变、玻璃拟态、Blob 抽象图形、波浪装饰背景、字体字重实时预览、和谐配色方案调色板、屏幕取色与色值互转、SVG 编辑器与压缩、阴影圆角/剪切路径、名片封面卡片生成、Flex/Grid 可视化布局等设计辅助生成器，所见即所得，结果一键复制或下载。",
    "fun": "摸鱼娱乐向工具合集：打字速度、反应测速、骰子多面、硬币正反面、记忆翻牌配对、数字区间猜谜、随机抽签抽取、命运轮盘、Yes/No 随机决策、中文名生成、键盘反应训练、序列记忆挑战、工作休息倒计时等，工作间隙放松一下。",
    "game": "浏览器轻量小游戏合集：贪吃蛇、扫雷、2048 合成、俄罗斯方块、数独填写、井字棋、五子棋联机、打字挑战、记忆配对、Flappy Bird、猜数字、数学速算挑战、打砖块、射击小游戏、单词连词等，打开即玩无需安装。",
    "health": "血液酒精浓度 BAC 估算、血压分级与记录追踪、体脂率 BMI 计算、视力与色觉自测、听力频率测试、标准体重与每日饮水量目标追踪、基础代谢 BMR、运动燃脂估算等健康自测小工具，适合日常记录与风险提示，不构成医疗建议。",
    "food": "食物卡路里估算、手冲/意式咖啡粉水比计算、调酒配方与毫升换算、食材储存期限查询、食谱份量缩放与单位换算、多道菜定时器、餐具份量与人数换算、购物清单整理、茶叶冲泡计时、红酒/食物搭配建议、肉熟温度对照等厨房与饮食辅助工具。",
    "chinese": "银行卡号 Luhn 校验与 BIN 归属地查询、车牌省份识别、汉字拼音声调标注、部首笔画查字、笔顺动画演示、简体繁体与异体字互转、人民币大写金额转换、中文分词与拼音排序等中文场景专属工具，贴合国内用户日常生活与办公。",
    "ai-coding": "汇总 Cursor、GitHub Copilot、Windsurf、Trae 等主流 AI 编程助手的快捷键大全、自定义技能、模型对比、代码重构技巧、Prompt 模式集与错误排查经验，帮助开发者快速上手 AI 结对编程，减少重复劳动提升编码效率。",
    "realestate": "房产相关计算：商业/公积金组合贷款月供与总利息对比、提前还款（缩短年限/减少月供）收益测算、LPR 加点后月供变动、契税与印花税估算、租金回报率/租售比、Deed 税转让成本、房产税试点城市速算等，适合购房、出租与二手房交易决策参考。",
    "business": "小微企业日常经营辅助：盈亏平衡销量与单价、月度现金流健康度、单品成本与毛利核算、直线/加速折旧、库存周转与补货周期、发票金额计算、定价策略折扣换算、项目 ROI 与回收期、员工薪资与社保估算、应收款账龄、公司估值、NPV 净现值等快速计算。",
    "crypto": "加密货币交易常用计算：复利与定投 DCA、多空杠杆爆仓价、强制平仓保证金、仓位风险管理、交易所手续费明细、以太坊 Gas 费与优先级、止损止盈利润预估、云挖矿/单机挖矿收益、稳定币与主网单位换算等，数值仅供参考，不构成投资建议。",
    "legal": "合同条款要点自查清单、律所/法院诉讼费阶梯速算、诉讼时效与上诉期限提醒、免责声明生成器、Cookie 政策、GDPR 自查清单、隐私政策、服务条款、保密协议 NDA、法律术语名词解释等商务文书生成器，仅限普通商务场景参考，不替代律师意见。",
    "social-media": "短视频文案与脚本模板、社媒话题标签聚类生成、封面尺寸与配色规范、文案字符数/字数限制检查、特殊字符与艺术字体转换、Markdown/富文本排版一键转换、缩略图/封面预览、发稿时间规划等社交平台内容运营辅助工具。",
    "team-tools": "远程与线下团队协作小工具：破冰提问题库、RACI 责任矩阵生成、匿名小组投票与多选、成员随机分组与配对、团队节奏投票与时间协调、会议议程收集整理等，适合敏捷团队、Scrum 会议和远程团队快速组织活动。",
    "data": "CSV 查看与清洗、Excel/XLSX 转 JSON/CSV、数据差异比对、透视表聚合统计、分层抽样、Z-Score 归一化、多字段排序与筛选、多源数据合并与拼接、JSON 扁平化反扁平化、SQL 转换、导入导出 JSON/CSV/TSV、图表生成、异常值 IQR 检测等轻量级数据处理工具，浏览器本地完成。",
    "office": "会议日程生成、甘特图项目排期、简历与求职信模板、发票/收据格式、快递与地址标签打印、会议倒计时与专注计时、组织架构图、采购申请与报销单、座位表与会议签到、电子签名板、演示演讲备注整理、工时表与考勤、工作日志与任务追踪等办公文档生成工具。",
    "travel": "航空公司行李额度与超重费估算、跨时区飞行时间计算、签证与入境材料清单、世界各国电源插头与电压对照、衣物/鞋子尺码国际换算、餐厅小费与多人分账、每日旅行预算与总开销拆解、打包清单勾选、护照/证件照尺寸与排版、目的地季节穿衣指南、常用外语短语对照等出行实用工具。",
    "math": "一元二次/三次方程求根、线性方程组求解、单位圆三角函数对照、素数检测与因数分解、均值方差标准差、正态分布 Z 表、几何公式速查与面积体积计算、罗马数字/科学计数转换等数学辅助工具，适合学生与工程快速验算。",
    "productivity": "番茄钟专注计时、看板任务管理、分轻重缓急的待办四象限、习惯养成追踪、倒计时专注、快速便签、每日三件事规划、周计划复盘模板、时间块分块工具等效率提升工具集合，帮助进入心流状态。",
    "sports": "跑步配速/里程/完赛时间互算、比赛记分牌、多局比分记录、间歇训练计时、运动热量估算、配速对照表等运动与比赛相关工具，适合日常训练与业余比赛记分。",
    "music": "常用和弦快速查图、节拍器 BPM 调节与拍号、音程关系对照、简谱转调、乐器调音参考频率等音乐练习辅助工具，适合初学者与业余爱好者。",
    "pets": "猫/狗年龄与人类年龄换算、幼宠喂食频率与分量计划表、每日食量与体重关联计算器、疫苗驱虫时间提醒、宠物每日饮水量估算等养宠日常辅助工具。",
    "photography": "构图黄金比例/三分法/对称法速查、光圈快门感光度曝光三角换算、景深估算、白平衡色温参考、焦距等效全幅换算、镜头视角对照表等摄影创作辅助工具。",
    "shopping": "超市/电商多规格单价对比、满减与折扣折算凑单、买赠促销单位成本、优惠券实际抵扣比例计算等购物决策工具，帮你挑出性价比最高的选项。",
    "language": "多语种词典与短语速查、外语单词记忆卡、音标与发音对照、语言学习打卡、字母表速查、常用旅游外语对照等多语言学习与日常交流辅助工具集合。",
    "art": "色彩理论入门、互补色/类似色/三元色搭配、配色方案调色板、颜料实际混色参考、色轮与明度饱和度、RGB/CMYK/HSL 色值互转、艺术字体与装饰线生成等艺术创作配色辅助工具。",
    "social": "聚餐/出游 AA 分账、多人付款多币种均摊、派对人员分组、礼物互抽配对、生日聚会倒计时、行程分工与采购清单共享等社交聚会场景小工具。",
    "parenting": "婴儿辅食月龄与食材安排、每日喂养/睡眠/换尿布记录、儿童身高体重百分位、疫苗接种时间提醒、育儿便签与奖励贴纸表、亲子活动创意等家长日常辅助工具。",
    "diy": "棒针/钩针编织行数计数器、油漆用量与墙面面积估算、木工下料尺寸计算、手工材料采购清单、十字绣线量估算等手工 DIY 场景计算器，帮你节省材料避免浪费。",
    "weather": "紫外线强度指数分级与防护建议、体感温度换算、温湿度露点对照、穿衣指数推荐、空气质量等级解读、雨雪天气出行提醒等天气相关辅助工具。",
    "astronomy": "月球阴晴圆缺与月龄查询、月食/日食日期倒计时、星座与行星观测季节、日出日落与晨昏蒙影时间对照、星图使用入门等天文观测辅助工具。",
    "automotive": "百公里油耗与路段油费计算、年行驶里程与保养周期对照、车险续保/保费组合速算、轮胎尺寸升级偏差估算、充电成本与燃油成本对比等车主日常用车工具。",
    "gardening": "蔬菜/花卉播种与收获月历、阳台日照与遮阴规划、盆土配比计算器、施肥浓度稀释、浇水量与频率记录、病虫害防治日历等园艺与家庭种植辅助工具。",
    "fitness": "健身房组数与间歇计时、HIIT/ Tabata 循环训练计时、每日步数与消耗估算、卧推/深蹲/硬拉 1RM 反推、训练容量记录与进步追踪、减脂心率区间等健身训练辅助工具。",
    "lifestyle": "日常综合生活工具集合，涵盖家居收纳清单、兴趣爱好追踪、节假日礼物灵感、生活成本拆解、周末出行灵感、衣物折叠与整理技巧、睡眠作息与起床提醒等琐事处理。",
}

# sports / music / pets / photography / shopping / language / art / social / parenting / diy / weather / astronomy / automotive / gardening / fitness / lifestyle
# 补一把这些小分类到 80+ 字
MIN_EXTEND = " 工具全部在浏览器本地运行，无需注册安装，兼顾手机与电脑响应式体验，保护隐私随时可用。"

PRIORITY_10 = ["dev","text","converter","calculator","generator","media","finance","seo","privacy","time"]

# ============== 任务 A ==============
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

PREFIXES = ["快速", "在线", "浏览器", "可视化", "免费", "智能", "专业"]

# 结尾模式池：让相同格式的卡片结尾方式多样化，避免模板化
TAIL_MODES = [
    "一键处理，支持复制",
    "浏览器本地处理，即开即用",
    "在线即可完成，无需安装插件",
    "粘贴即可处理，结果实时预览",
    "可视化操作，输出一键复制",
]

def truncate_zh(s, max_len=28):
    s = s.strip()
    if len(s) <= max_len:
        return s
    return s[:max_len] + "…"

def strip_name_from_kw(kw_str, tool_name):
    """从关键词串（顿号分隔）中去掉第一个 == tool_name 或 == tool_name+'器' 等相似项"""
    if not kw_str:
        return kw_str
    parts = re.split(r'[、,，/\s]+', kw_str)
    parts = [p.strip() for p in parts if p.strip()]
    # 归一化对比：去空格、常见后缀（器、工具、计算器、生成器、转换器）
    def norm(x):
        x = re.sub(r'\s+', '', x)
        for suf in ["工具", "生成器", "转换器", "计算器", "编辑器", "分析器", "检测器", "查看器", "检查器", "器"]:
            if len(x) > 3 and x.endswith(suf):
                x = x[:-len(suf)]
                break
        return x.lower()
    name_norm = norm(tool_name)
    filtered = []
    for p in parts:
        if norm(p) == name_norm:
            continue
        if norm(p).startswith(name_norm) or name_norm.startswith(norm(p)):
            if len(filtered) >= 1:  # 至少有一个其它词后，再跳过
                continue
        filtered.append(p)
    if not filtered:
        return kw_str
    # 用顿号拼接，保留前 4 项足够
    return "、".join(filtered[:4])

def make_different(name, desc):
    name = name.strip()
    desc = desc.strip()
    if desc == name:
        for p in PREFIXES:
            cand = p + desc
            if cand != name:
                return cand
    # 如果 desc 以 name 开头并且后面只有很少字符
    if desc.startswith(name) and len(desc) - len(name) <= 4:
        for p in PREFIXES:
            cand = p + desc
            if cand != name and not cand.startswith(name):
                return cand
    return desc

def clean_meta_desc(raw, tool_name):
    text = unescape(raw).strip()
    # 1) 优先：覆盖 X、Y、Z 等关键词
    m = re.search(r'覆盖\s*([^，。,.]{2,80}?)\s*等\s*关键词', text)
    if m:
        kw_raw = m.group(1).strip()
        kw = strip_name_from_kw(kw_raw, tool_name)
        if kw and len(kw) >= 3:
            # 多样化的开头，避免全"支持…"模板化
            tail = random.choice(TAIL_MODES)
            return f"{kw}｜{tail}"
    # 2) 关键词
    m = re.search(r'关键词[，：:]\s*覆盖\s*([^，。,.]{2,80}?)(?:等|$)', text)
    if m:
        kw = strip_name_from_kw(m.group(1).strip(), tool_name)
        if kw and len(kw) >= 3:
            tail = random.choice(TAIL_MODES)
            return f"{kw}｜{tail}"
    # 3) "面向中文用户…"之前
    m = re.search(r'场景，(.*?)(?:面向|提供|结合|帮助|可在|适合|支持)', text)
    if m:
        part = m.group(1).strip().strip("，。,.")
        if part and len(part) >= 6:
            return part
    # 4) "支持 X…" 句式
    m = re.search(r'(支持[^。，]{4,60})', text)
    if m:
        s = m.group(1).strip("，。,. ")
        # 再尝试从其中抽关键词
        m2 = re.match(r'支持\s*(.{2,60})', s)
        if m2:
            kw = strip_name_from_kw(m2.group(1).strip(), tool_name)
            if kw:
                tail = random.choice(TAIL_MODES)
                return f"{kw}｜{tail}"
        return s
    # 5) "提供…" / "结合…" / "帮助…"
    for pat in [r'(提供[^。，]{4,60})', r'(结合[^。，]{4,60})', r'(帮助[^。，]{4,60})', r'(适用于[^。，]{4,60}?页面场景)']:
        m = re.search(pat, text)
        if m:
            return m.group(1).strip("，。,. ")
    return text

def extract_tool_description(category, slug, tool_name):
    tool_page = os.path.join(TOOLS_ROOT, category, slug + ".html")
    if not os.path.exists(tool_page):
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
        cleaned = clean_meta_desc(m.group(1), tool_name)
        desc = truncate_zh(cleaned)
        result = make_different(tool_name, desc)
        if result.strip() != tool_name.strip():
            return result
    # b) og:description
    m = re.search(r'<meta\s+property\s*=\s*"og:description"\s+content\s*=\s*"([^"]*)"', page_html, re.IGNORECASE)
    if m and m.group(1).strip():
        cleaned = clean_meta_desc(m.group(1), tool_name)
        desc = truncate_zh(cleaned)
        result = make_different(tool_name, desc)
        if result.strip() != tool_name.strip():
            return result
    # c) title
    m = re.search(r'<title>([^<]*)</title>', page_html, re.IGNORECASE)
    if m and m.group(1).strip():
        title_text = m.group(1).strip()
        for sep in [" - ", " | ", " — "]:
            if sep in title_text:
                title_text = title_text.split(sep)[0]
                break
        title_text = title_text.strip()
        if title_text and title_text != tool_name.strip():
            desc = truncate_zh(title_text)
            return make_different(tool_name, desc)
    # d) h1 后第一段
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
                result = make_different(tool_name, desc)
                if result.strip() != tool_name.strip():
                    return result
    # e) 兜底
    tpl = FALLBACK_TEMPLATES.get(category, FALLBACK_DEFAULT)
    return truncate_zh(make_different(tool_name, tpl.format(name=tool_name)))

# ============== 执行任务 A ==============
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
task_a_samples = []
random.seed(20260817)  # 固定随机种子，结果可复现

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

    if name_strip == desc_strip:
        new_desc = extract_tool_description(category, slug, name_strip)
        # 再次保险：若仍相等，加前缀
        if new_desc.strip() == name_strip:
            new_desc = "在线" + new_desc
        task_a_count += 1
        if len(task_a_samples) < 15:
            task_a_samples.append(
                (f"/tools/{category}/{slug}", name_strip, old_desc, new_desc)
            )
        return f"{prefix}{name}{between}{new_desc}{suffix}"
    else:
        return m.group(0)

html = CARD_PATTERN.sub(task_a_replacer, html)
print(f"[任务A] 共修复 {task_a_count} 张空描述卡片")

# ============== 执行任务 B ==============
SECTION_PATTERN = re.compile(
    r'(<section\s+class="cat-section"\s+id="cat-([^"]+)"[^>]*>.*?'
    r'<div\s+class="cat-header">.*?'
    r'<a\s+class="cat-title"[^>]*\s+href="/tools/([^"]+)/".*?'
    r'<span\s+class="cat-count">(\d+)\s*个工具</span>.*?'
    r'</div>\s*)(<div\s+class="tool-grid">)',
    re.DOTALL
)

cat_info_list = []
for sm in SECTION_PATTERN.finditer(html):
    cat_info_list.append((sm.group(2), sm.group(3), int(sm.group(4))))

def sort_key(item):
    cat_id = item[0]
    if cat_id in PRIORITY_10:
        return (0, PRIORITY_10.index(cat_id), -item[2])
    return (1, 0, -item[2])

cat_info_list.sort(key=sort_key)

INTRO_TAG = 'class="cat-intro"'
task_b_count = 0

intro_html_by_cat = {}
for cat_id, _, _ in cat_info_list:
    intro = CAT_INTROS.get(cat_id)
    if intro:
        if len(intro) < 80:
            intro = intro + MIN_EXTEND
        if len(intro) > 190:
            intro = intro[:188] + "。"
        intro_html_by_cat[cat_id] = (
            '          <p class="cat-intro" style="margin: 10px 12px 18px; padding: 12px 16px; '
            'background: rgba(13, 148, 136, 0.05); border-left: 3px solid var(--accent, #0d9488); '
            'border-radius: 8px; color: var(--text-secondary, #475569); font-size: 0.92rem; line-height: 1.75;">'
            f'\n            {intro}\n          </p>\n'
        )

def task_b_replacer(m):
    global task_b_count
    cat_id = m.group(2)
    before = m.group(1)
    toolgrid = m.group(5)
    if INTRO_TAG in before:
        return m.group(0)
    intro_html = intro_html_by_cat.get(cat_id)
    if intro_html:
        task_b_count += 1
        return f"{before}{intro_html}{toolgrid}"
    return m.group(0)

html = SECTION_PATTERN.sub(task_b_replacer, html)
print(f"[任务B] 共给 {task_b_count} 个分类插入了简介")

with open(SRC, "w", encoding="utf-8") as f:
    f.write(html)
print(f"[写回] 已覆盖 {SRC}")

# ============== 报告 ==============
print("\n" + "=" * 60)
print("修复报告 (V3)")
print("=" * 60)
print(f"任务 A：修复空描述卡片（name==desc）共 {task_a_count} 张")
print(f"任务 B：新增分类简介段落共 {task_b_count} 个")
print("\n【任务 A 前后对比样例 5 组】")
shown = 0
for i, s in enumerate(task_a_samples, 1):
    href, name, old, new = s
    if new.strip() == name.strip():
        continue
    shown += 1
    print(f"\n样例 {shown}: href={href}")
    print(f"  工具名:   {name}")
    print(f"  修复前:   {old!r}")
    print(f"  修复后:   {new!r}")
    if shown >= 5:
        break

print("\n【任务 B 已添加简介的分类（全部 ≥ 80 字）】")
for ci in cat_info_list:
    intro_raw = CAT_INTROS.get(ci[0], "")
    ilen = len(intro_raw)
    if ilen < 80:
        ilen = len(intro_raw + MIN_EXTEND)
    if ilen > 190:
        ilen = 189
    print(f"  - {ci[0]:<16} ({ci[2]:>3} 工具) -> 约 {ilen} 字")
