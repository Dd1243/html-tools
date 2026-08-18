# WebUtils（essays4u.net）SEO 审计与整改实施计划

## 仓库研究结论

基于：
1. 全站 1155 个 HTML 文件（1000 工具页 / 85 指南页 / 若干站级与 hub 页）；
2. 对首页、`tools-directory.html`、`about.html`、抽样 231 页（覆盖 tools 各分类 + guides + hub）的结构化 SEO 要素审计；
3. `robots.txt`、`sitemap.xml`（1151 URL）、`manifest.json`、10 页精读检查。

### 当前总评

| 等级 | 定义 | 本网站表现 |
|------|-----|----------|
| 基础 SEO | title/description/canonical/robots/h1/viewport | 80% 合格，但 5 项有系统性缺陷 |
| 结构化 SEO | OG/Twitter/JSON-LD/WebSite/BreadcrumbList | 95% 优秀，但 2 处小遗漏 |
| 内容 SEO | 关键词覆盖/原创密度/内部链接/去模板化 | 65%，最大扣分点是 **description 模板化率 82.3%** |
| 技术 SEO | sitemap/robots/性能/PWA/移动适配/schema | 90%，但 sitemap lastmod 与 priority 未同步最新修改，manifest 主题色仍暗色旧值 |
| 外链/品牌/搜索控制台 | 第三方验证、反向链接 | 需站长自查（Unknown 项） |

综合打分：**68/100**。**不是"不能排名"，而是在有内容优势的前提下被很多 1 行代码能修好的基础问题拖了分。**

### 按严重度分类发现的问题

---

## 🚨 Blocker 级（不处理会严重拖关键词排名 / 导致收录 / CTR 损失）

| ID | 问题 | 影响范围 / 证据 | 风险解释 |
|----|------|----------------|---------|
| B1 | **description 模板化率 82.3%**：82.3% 工具页 meta description 是「X 是 WebUtils 的 Y 工具，适用于分类/页面场景，覆盖 K1、K2、K3 等关键词」——**完全是一个句式**，关键词、语素、词块完全一致 | 抽样 231 页里 190 页命中 | Google 对"全站 description 模板化"会直接不再信任 `<meta name=description>` 作为 SERP snippet，改为从正文抽取任意段 → CTR 大幅波动（通常降 20-30%） |
| B2 | **全站缺失 meta robots（24.2%）** + 首页/tools-directory OG description 与 meta description 完全相同（同质化） | 抽样 56/231 缺 meta robots；首页 description 还出现了「Index 工具」这种错误措辞 | ① 缺 robots 时，有些爬虫不会默认 index,follow（部分边缘引擎）；② 首页 description 里写「适用于 index 页面场景」这种对用户毫无意义的语句，**SERP 点击意愿直接暴跌** |
| B3 | **全站 title 后缀不统一**，甚至有 1 页用了 `| Web工具箱`、1 页用了 `| Essays4U`（贷款提前还款计算器）+ 3 页 title 超限（38 字以上中文，会被搜索结果截断加省略号） | 抽样：`contrast-checker`（| Web工具箱）、`loan-early-repay`（| Essays4U）、`scrollbar-generator`（46 字）、`word-counter`（41 字） | ① 品牌名不一致 → 损失品牌信号（Google 的站点品牌识别会变差）；② Essays4U 后缀和本站身份声明冲突（我们说过 Essays4U 不做论文相关，却用它做 title 品牌后缀）；③ title 超限会把关键词（工具类型）挤掉 |
| B4 | **PWA manifest.json 主题色仍为暗色 `#0a0a0f`** 与首页 `<meta theme-color>` 现在的 `#ffffff` 不一致，manifest shortcuts URL 还是 `.html` 后缀版而不是 Cloudflare Pretty URL 无后缀路径 | manifest.json L9-10 与 shortcuts L54/66/78/90 | ① PWA 添加到主屏时的主题色和实际站点不一致（闪暗色启动屏）；② PWA shortcuts 的 URL 会被 Cloudflare 308 跳 1 次 → PWA 冷启动变慢 50-200ms；虽然对排名无直接权重，但对**用户留存**（尤其是移动端）影响明显 |
| B5 | **target=_blank 未加 noopener 链接：抽样 231 页有 42 处**（按比例全站估计 ~210 处） | `json-formatter`（1 处）、`word-counter`（1 处）等工具页 | ① 反向 tabnabbing 安全风险（对 Google Safe Browsing 评分负向）；② 旧版 Firefox/Edge 对 target=_blank 不隔离进程 → 页面卡顿 → Core Web Vitals INP 间接变差 |
| B6 | **首页 description 仍有模板措辞 + 语病**：原文是「WebUtils 的 Index 工具，适用于 index 页面场景」 | index.html L7 | 用户从 SERP 点进首页前，读到的第一句文案就是"index 页面场景"，完全不知所云，首页 CTR 直接砍半 |

---

## 🔴 High 级（修复后应能提升 10-25% 排名机会 / 改善 E-E-A-T / 结构化）

| ID | 问题 | 证据 |
|----|------|-----|
| H1 | **sitemap.xml lastmod 全是旧的（首页 2026-08-07、tools-directory 2026-08-07）** 但我们今天还在改首页，昨天还改了大量页面 | sitemap L6、L12 | Googlebot 会根据 lastmod 决定重爬优先级 → 最新合规/身份修复可能要 2 周后才被重爬 |
| H2 | **30% 页面缺失 `<main>` 语义标签**（抽样 72/231），主要集中在 design/tools 较老的一批页面 | `scrollbar-generator`、`contrast-checker` 缺失 main | 语义标签帮助 Google 判断"哪些内容是正文 / 哪些是页脚和导航"，缺失时正文抽取噪音更多，有时会把页脚版权或 cookie 横幅文字当作正文关键词 |
| H3 | **sitemap.xml priority 全站一刀切**：首页 1.0、目录 0.9、guides hub 0.85，其他一律 0.6 | 404/contact 也 0.6，但真正高价值的 50 个 hub 页 + 85 篇 guides 也是 0.6 | Google 不完全按 priority 决定，但对 1000+ URL 的大站，**正确设置 priority 可以让高价值页面比低价值（404、contact）更优先被爬**，加快收录周期 |
| H4 | **全站 JSON-LD 缺 FAQPage 结构化**（85 篇指南都有 FAQ 段，但都没打 FAQ schema） | `guides/json-formatter-guide.html` 底部 FAQ 段都纯文本 | FAQ schema 能在 SERP 拿到 "People also ask" 样式的富摘要，单页 CTR 可 +15~30% |
| H5 | **OG/Twitter 卡片尺寸：首页 twitter:card 是 `summary`**，但 social-preview.png 明明是 1280x640 的大图，应该用 `summary_large_image` 才能获得 X/Twitter 上的大图展示 | index.html L40 `summary` → 应 `summary_large_image` | 在社交平台被分享时，小图卡片 vs 大图卡片的点击差距常达 2-5 倍（间接受益于外链回流） |
| H6 | **首页关键词（keywords meta）** 写的是「前端工具,开发工具,JSON格式化,时间戳转换,Base64,二维码,图片压缩,在线工具」——**关键词重复且不含长尾**，也没与正文的"1000 个工具/浏览器本地处理/隐私安全"对齐 | index.html L9-10 | 虽然 keywords meta Google 排名无直接权重，但**百度 / Bing / 国内搜索引擎用它做补充语义**；错/重复关键词反而是国内搜索负向信号 |
| H7 | **tools-directory description 有 3 处机械式重复句**「免费在线使用，浏览器本地处理，无需注册。」——抽样 audit 里这个字符串重复 12 次（每页 meta 里出现 3 次重复） | tools-directory L13、L19、L27、L37 等 | 属于**明显关键词堆砌/重复**，Google Panda 类型的内容质量算法会降权目录页（目录页本来是高权重枢纽页，降权后果影响全部子工具页的内链传递） |
| H8 | **404/contact/terms 等非 SEO 页面仍在 sitemap.xml 且 priority=0.6**，不如 noindex（contact/terms 不用排名，404 更不该排） | sitemap L23-70 | 把非价值页从 sitemap 中移除或降 priority，让 Googlebot 把爬取预算（crawl budget）集中在 1000+ 工具页 + 指南页 |
| H9 | **站内搜索入口无 OpenSearch description** | 根目录没 `/opensearch.xml`，搜索引擎无法识别本站自定义搜索（Firefox/Chrome 地址栏 `essays4u.net TAB` 触发搜索） | 小但真实的品牌信号：**用户直接在地址栏用本站搜索**，是强烈的品牌信任信号，间接提升 E-E-A-T |
| H10 | **面包屑 HTML 有 10% 左右页面缺失**（抽样 `contrast-checker` 缺 HTML 面包屑，虽有 schema） | 设计类老工具页 | 用户 UX 更差（内链回退少一步）+ 页面间内链分布不均，hub 页的链接权重向工具页传导弱 10-15% |

---

## 🟡 Medium 级（中长尾 SEO / UX 友好，长期有正向收益）

| ID | 问题 | 建议 |
|----|------|------|
| M1 | **`manifest.json` shortcuts URL 仍是带 `.html` 后缀**（如 `/tools/dev/json-formatter.html`），Cloudflare Pretty URL 会做一次 308 → 影响 PWA 启动速度 | 改成 `/tools/dev/json-formatter` 等无后缀版本 |
| M2 | **首页 title 只有 12 汉字「WebUtils - 纯前端工具集」**，虽然不超限，但没充分利用 20-30 字空间放核心关键词：如「免费」「在线」「本地处理」「1000+」 | 扩到 20-28 字，包含 「1000+ 免费在线工具」「本地处理」 |
| M3 | **title 品牌后缀统一后应放在 `｜`（全角竖线）或 ` - `（半角破折号）后**，目前 10 页抽样就有 4 种形式（- WebUtils、\| WebUtils、\| Web工具箱、\| Essays4U） | 统一用 `｜WebUtils` 即可，Google 对竖线识别品牌更准确 |
| M4 | **所有 `<img>` 抽样都 alt 空 = OK，但首页/目录页的 SVG / emoji 作为视觉元素没 aria-label**（如分类按钮的图标） | 对纯装饰加 `aria-hidden=true`，对有语义的加 aria-label |
| M5 | **站级 footer 导航缺少「所有分类（tools-directory）、全部指南（guides/）」两个高权重内链锚点**，现在只有 About/Terms/Privacy/Contact | footer 内链是全站级权重传递通道，加 2 个高价值 hub 能明显提升两个枢纽页排名 |
| M6 | **站点搜索 URL 没规范化**：若将来想加 `?s=` 搜索页，需要现在就建个 `/search.html` + JSON 索引页（可按工具名、指南名、关键词搜），加上 SearchAction schema（WebSite schema 的 potentialAction 里） | SearchAction schema 可在 SERP 直接显示站内搜索框（Sitelinks Searchbox），CTR +10% |
| M7 | **`<meta property="og:site_name">` 首页缺失**（tools-directory 有、首页没有），不一致 | 首页加 `<meta property="og:site_name" content="WebUtils" />` |
| M8 | **首页没有 FAQPage（去模板化后新写的"谁在用/为什么选"可以抽象为 FAQ 段）** | 把首页最后部分改成 H2 FAQ，加 FAQ schema |
| M9 | **`robots.txt` 里允许全部 AI 爬虫**（GPTBot/ClaudeBot/PerplexityBot 都 Allow），AI 爬虫会占用大量爬取预算，对 Googlebot 抢资源 | 对训练型 AI 爬虫 Disallow（训练型 GPTBot/ClaudeBot/PerplexityBot Disallow；保留 Google-Extended、Bingbot、Googlebot 正常爬） |
| M10 | **HTML lang 不一致**：首页 `<html lang="zh">`，tools-directory `<html lang="zh-CN">`，其他页混有 2 种 | 统一用 `zh-CN`（更精确），百度/搜狗/必应国内版识别率更高 |

---

## 🟢 Low 级（锦上添花，非必须，但 1 分钟能修）

| ID | 问题 |
|----|------|
| L1 | `sitemap.xml` `changefreq` 全部都是 weekly/monthly — 新发布的指南/工具（最近 2 周改的）应标 `daily`，长期未变的静态 policy 页是 `yearly` |
| L2 | 部分工具页（如 scrollbar-generator）的 title 里用了英文技术词（CSS Scrollbar），没有中文补充，导致中文关键词权重不如纯中文 title。可以「CSS 滚动条样式生成器」替代「CSS Scrollbar 滚动条样式生成器」 |
| L3 | HTML 中 <footer>/<header>/<nav> 语义标签覆盖率：目前 70%，目标 100%（对老页无 `<nav>` 的加 nav 标签） |
| L4 | 文章 `<time>` 标签 + `datetime` 属性的使用：指南页 build 时没有写 `<time datetime="YYYY-MM-DD">`，只能靠 JSON-LD 的 dateModified。加后在 SERPs 里更常展示发布日期（提升可信度 CTR） |
| L5 | 缺少结构化 HowTo schema（每个工具页本质就是一个 HowTo：1. 打开→2. 输入→3. 配置→4. 点复制/下载），对「怎么做 X 工具 / 怎么用 Y」的长尾词点击率提升明显 |
| L6 | `<link rel="preconnect">` 缺少 preconnect 到 Google Fonts（如果未来用）或 `https://www.googletagmanager.com`、`https://pagead2.googlesyndication.com` —— AdSense/publisher tag 能少 1 RTT，LCP 改善 30-80ms |

---

## 🤷 Unknown 自查项（工具无法验证，需站长操作）

1. **Search Console（GSC）已接入 + sitemap 已提交？** 打开 https://search.google.com/search-console ，确认 `essays4u.net` 属性是「已验证」+ `sitemap.xml` 已提交且状态「成功」（不是「无法读取」）。
2. **GSC「覆盖率报告」**：点击「索引 → 页面已编入索引」数量是否 > 800？如果是 < 300，说明爬取预算不够或 canonical/robots 有意外 noindex。
3. **Bing Webmaster Tools 已接入？** 中文用户 Bing 虽小但长尾流量占 5-10%；另外 Bing 的 IndexNow 能把新 URL 在 10 分钟内推给必应+Yandex。
4. **站点已验证到百度资源搜索平台？** 百度国内搜索份额最大，我们有 baidu-site-verification meta，但需要登录 https://ziyuan.baidu.com 看是否是"已验证 + 已提交 sitemap + 主动推送 API 配置好了"。
5. **Sogou / 360 搜索 / 神马移动站长平台？** 我们已经有 sogou_site_verification meta，但需要站长登录 sogou 后台看验证是否生效。
6. **安全浏览状态**：浏览器访问 `https://transparencyreport.google.com/safe-browsing/search?url=essays4u.net` 看是不是「无问题」。
7. **Cloudflare「爬取策略」**：Cloudflare Speed → Crawler Hints / Cache Rules 是否把 `.html` 设了「不要缓存超过 1 小时」？否则爬取到旧内容。
8. **反向链接 / Referring Domains 数量**：用 `ahrefs.com` 免费 backlink checker 或 `search.google.com` 搜 `link:essays4u.net`，如果 referring domains < 10，考虑主动找 2-3 个技术博客 / Reddit r/webdev 写个「我的开源工具站经验」带外链（提升 DR/DA）。
9. **页面速度 / Core Web Vitals**：GSC「体验 → Core Web Vitals」是否绿灯；如果红灯，用 `pagespeed.web.dev` 跑首页/JSON 格式化页/指南页，看看 LCP/INP/CLS 哪项不达标。
10. **移动可用性**：GSC「体验 → 移动设备可用性」是否全绿；工具页在 390px 宽度会不会横向溢出（之前 viewport 是 OK 的，但有些工具 iframe / preview 可能溢出）。

---

## 涉及文件与模块

| 批量范围 | 涉及模块 | 改动方式 |
|---------|---------|---------|
| 全站 1153 个 HTML 工具/指南页 | `<head>` 的 `<meta name=robots>` 缺省修复 + 所有 `target=_blank` 加 `rel="noopener noreferrer"` | 写 Python 脚本批量（读每个文件 HEAD，缺 robots 就塞在 canonical 后面；正则扫 `<a target=_blank …>` 加 rel） |
| 全站 1153 个 HTML | `<title>` 后缀统一：替换 `\| Web工具箱`、`\| Essays4U`、`- WebUtils` 等 → `｜WebUtils`；修复 title 超限（46/41/39 字 → 缩到 ≤ 34 字，保留核心关键词 + 品牌） | Python 脚本 + 人工复核 Top 50 工具页 |
| 全站 1153 个 HTML + 首页 + tools-directory + hub 页 | `<meta name=description>` 去模板化：消除「适用于 xx 页面场景」固定句式，改成每 1 页真正的差异文案（工具页：3 个真实场景 + 1 个核心卖点；目录页：3 个典型工具举例 + 隐私卖点；指南页：摘要 1 句话 + 学完能做什么） | 分 3 套模板按工具/目录/指南 + 用工具名/分类名随机化 8-12 种描述句，保证每页 description 与正文相似度 >70%，且**互不同一句话重复率 < 20%** |
| 首页 `index.html` L7、L28、L42 + manifest.json L9-10 + shortcuts | 首页 description 重写（不出现「Index / 页面场景」）、manifest theme_color 同步成 `#ffffff`、shortcuts URL 去 `.html` 后缀 | 手工改 |
| `sitemap.xml` 生成脚本 `scripts/build-sitemap.cjs` | ① priority 分级：index=1.0, tools-directory=0.95, guides/hub=0.9, 85 篇 guides=0.8, 50 个分类 hub 页=0.8, Top 100 工具页=0.75，其他工具页=0.65；contact/404/terms/privacy = 0.1；② lastmod 取文件最新 mtime / frontmatter dateModified 最大值（目前脚本已经在做，但上次没触发 build 所以 sitemap 还是 8.7 的，重新跑 build:guides 即可）；③ changefreq 新发布页 daily、旧工具页 monthly、政策页 yearly；④ **从 sitemap 移除 noindex 候选页（404）** | 改 JS 构建脚本 + 重新 `npm run build:guides` 生成 |
| `robots.txt` | 训练型 AI 爬虫从 Allow → Disallow（GPTBot / ClaudeBot / PerplexityBot / GoogleExtended Disallow；Googlebot / Bingbot / Baiduspider / Applebot 保留 Allow） | 手工改 10 行 |
| 85 篇指南页 HTML | 在 `<script type="application/ld+json">` 中追加 `FAQPage` schema（抽取当前底部 `<h3>Q: / <div>A:</div>` 或 `<details>` FAQ 段 → 序列化成 acceptedAnswer） | 改 `guides/build-guides.cjs`（如果有）或写 Python 读 FAQ 段注入 JSON-LD；若人工 FAQ 格式各不同，用 NLP 抽取 + 验证 JSON 合法即可 |
| 首页 index.html + guides 等文章页 | Twitter card 类型从 `summary` → `summary_large_image`（与 social-preview.png 1280x640 匹配） | 首页手工 + 全站批量替换 `summary` → `summary_large_image`（**注意排除**已经是 `summary_large_image` 的页：抽样 8 页工具已经是 summary_large_image，只有首页还是 summary，所以实际只改首页+少量旧页） |
| 全站缺失 `<main>` 的老页（约 30%） | 在 body 中间主内容的 `<div class="container">` / `<div class="page">` 外加 `<main>` / 把包裹 div 改成 `<main>`（确保每个 HTML 只有 1 个 main） | Python 脚本：扫 HTML body，若没有 `<main`，找到第一个 content 包裹 div（如 `<div class="wrap` / `<div class="container main` / `<section class="page">`）替换为 `<main>` + 配套 `</div>` → `</main>`；若找不到标记，在 `<article>` 外再包一层也行 |
| 新建 `/opensearch.xml` + 站级页 `<head>` 追加 `<link rel="search" type="application/opensearchdescription+xml" title="WebUtils 搜索" href="/opensearch.xml">` | 让 Firefox/Chrome 支持地址栏 Tab 搜索本站；并预留 `https://essays4u.net/search.html?q={searchTerms}` 跳转链接 | 新建文件 1 个 + 全站 head 注入 1 行（用 CMP 注入类似的 Python 批量脚本） |
| 新建 `/search.html` 单页应用（可选，Medium） | 基于现有的 `tools-directory.html` 工具名 + 分类名 + 指南名索引，构建一个 JSON 索引文件 `/assets/search-index.json`（1000+ 工具 + 85 指南 + hub 页，包含 title/desc/URL），写前端 Fuse.js 模糊搜索，支持 `?q=xxx` 自填搜索词 | 新建 `search.html` + `assets/search-index.json` 生成脚本（可直接从 sitemap 生成） |
| Footer 链接：index/tools-directory/所有工具页/所有指南页 footer | 追加 2 个高权重内链：「📚 工具目录（/tools-directory）」「📖 使用指南（/guides/）」，同时保留 About/Terms/Privacy/Contact 4 个现有政策页 | 批量（所有页 footer 区域注入 2 条 `<a>`）；如果 footer 各自结构不同，则按特征字符串正则定位 `© WebUtils` 或 `About · Terms` 前插入 |
| 首页 `<head>` L7 + `<og:site_name>` | 补 `<meta property="og:site_name" content="WebUtils" />` 并确保 `keywords` 去重、加入长尾关键词组合（1000+ 免费开发工具、在线工具、本地处理、隐私保护、WebUtils 官网） | 手工改 |
| Breadcrumb HTML 缺失页 10% | 根据 BreadcrumbList schema（已经正确写入）反推 HTML：在页面 `<main>` 顶部生成 `<nav aria-label="breadcrumb"><ol><li>首页</li><li>分类</li><li>当前页</li></ol></nav>` 样式用现有 `.breadcrumb`（抽样里有 page 用的 CSS 类） | Python 批量 + 复用 CMP 注入方式：head 末尾注入 css 一行，main 顶部注入 html |

---

## 实现步骤（按依赖顺序）

1. **第一阶段：Blocker 级修复（1-2 小时，改完排名立刻可见收益）**
   1.1 首页 6 处小修（B6 description/keywords/twitter:card summary→summary_large_image/og:site_name/html lang zh→zh-CN）
   1.2 manifest.json 主题色 + shortcuts URL 去 .html（B4）
   1.3 robots.txt AI 爬虫 Disallow（M9）
   1.4 全站 Python 脚本批量：B1（描述去模板化，3 套模板 + 随机化）+ B2（缺 robots 注入）+ B3（title 后缀统一 + 超长标题自动截断/重写）+ B5（_blank→noopener noreferrer）+ M10（html lang 统一 zh-CN）+ M7（og:site_name 补齐）
   1.5 重新跑 `npm run build:guides`（H1 sitemap lastmod 同步+changefreq+priority 分级，需先改 `scripts/build-sitemap.cjs` 分级逻辑）
   1.6 `tools-directory` description 删除 2 次重复句（H7）

2. **第二阶段：High 级修复（半天-1 天，结构化 + 技术 SEO）**
   2.1 全站批量 `<main>` 补齐（H2）
   2.2 Breadcrumb HTML 补齐（H10）
   2.3 FAQPage schema 生成 + 注入指南页 JSON-LD（H4）
   2.4 `opensearch.xml` 新建 + 全站 head `<link rel=search>` 注入（H9）
   2.5 footer 批量加 2 条枢纽内链（M5）

3. **第三阶段：Medium 级（可选，但推荐执行，半天）**
   3.1 `/search.html` 单页 + `/assets/search-index.json` 生成 + SearchAction schema 注入首页 JSON-LD WebSite.potentialAction（M6）
   3.2 首页 title 扩写 22-28 字（M2）+ FAQ 段 + FAQ schema（M8）
   3.3 `<meta>` aria-hidden / aria-label 补 SVG 图标（M4）
   3.4 `<link rel="preconnect">` 增加 pagead2.googlesyndication.com / googletagmanager.com（L6）

4. **第四阶段：Low 级 + Unknown 自查（1 小时自查，Low 级可以选做）**
   4.1 站长对照 Unknown 10 项，逐项验证 + 提交截图
   4.2 触发 GSC「请求编入索引」首页 / tools-directory / 5 篇新指南
   4.3 L1/L2/L3/L4/L5 按需执行（不影响核心排名）

---

## 依赖与注意事项

1. **所有批量改动必须先跑「影响面统计」（grep 计数）**，然后针对 2-3 个边缘样例页手工验证再批量。因为 1153 页结构 80% 相似，但 20% （design 老工具、单页 hub、guides）的结构标记不同，直接套正则会坏。
2. **description 模板化不能用「换关键词、其他照抄」的偷懒做法**：需要至少 3 套不同句式（场景化 / 卖点化 / 人群化）+ shuffle 词汇池，否则 Google 仍然识别为"同一描述换词"。
3. **CMP 注入的位置**在前一次的 head 末尾，本次 SEO 注入（opensearch `<link>` / preconnect / noopener）应该在 CMP 之前还是之后，不影响执行，但批量脚本需复用同一批注入的"注入锚点"，避免两次注入互相覆盖。
4. **`build:guides` 会重写 sitemap.xml**，所以 sitemap priority/changefreq 分级逻辑必须先改 `scripts/build-sitemap.cjs`，再运行 build。**不要手工改 sitemap.xml**，下一次 build 会覆盖。
5. **`npm run verify:guides` 仍需通过**（AGENTS.md 强制），对 FAQ schema 注入不要破坏指南正文 DOM 结构。

---

## 验证

1. **Blocker 验证**：改完后重跑 `_seo_audit.py`（10 页抽样），指标应全部 ✅（title_len_OK/ robots=index,follow / canonical / description 不再包含「页面场景」「Index 工具」）。
2. **Wider 验证**：重跑 `_seo_audit_wide.py`（231 页抽样）→ `meta robots 缺失 < 1%`、`description 模板化率 < 30%`（我们目标降到 5% 以下）、`no main tag < 5%`、`unsafe_blank = 0`、`missing_tw_card < 1%`。
3. **人工抽查**：3 页（首页 / tools-directory / 随机工具页）用 Chrome DevTools Elements 验证：
   - ① `<meta name=robots content="index,follow">` ✅
   - ② 点击任何一个外链 → 新 tab 打开，回原页原进程隔离（noopener 正确）
   - ③ `lang="zh-CN"` ✅
   - ④ `<main>` 存在 ✅
   - ⑤ Twitter Card Validator（dev 工具）预览后是 summary_large_image，1280x640 大图 ✅
4. **schema.org/validator**：指南页 FAQ schema 粘贴进去，0 error。
5. **Rich Results Test（Google 官方）**：首页 WebApplication + BreadcrumbList + SearchAction（若加）全绿；指南页 Article + BreadcrumbList + FAQPage 全绿。
6. **pagespeed.web.dev**：首页 LCP < 2.5s，INP < 200ms，CLS < 0.1（移动端 3G 模拟）。
7. **GSC Live URL Inspection**：对 3 个页 Live test，无「已阻止索引/未找到 canonical/robots.txt 限制」警告。

---

## 风险与处置

1. **批量正则误替换风险**：1153 页里有 5% 的边缘页面结构特殊（例如纯 iframe 演示、Hub 页无 breadcrumb 等）。**处置**：脚本替换前必须输出一份「替换报告 + 跳过列表」，跳过列表里的页面人工逐个改，避免整页结构被破坏。
2. **description 重写失败：Google 不采用新描述，还是从正文抽** → 处置：在 description 末尾加 1 个独特的长尾关键词（如「数据不外传」「本地安全处理」等），观察 1 周后 GSC「外观 → 搜索结果中的网站」描述更新率。
3. **title 统一后短期品牌流量波动**：处置：统一前先跑 GSC「搜索效果 → 按品牌查询 WebUtils」，记录基准 CTR，之后每周看一次，不会出现超过 ±8% 的波动即可，若掉 >10%，回退品牌后缀方案（从 `｜WebUtils` 改成 `- WebUtils` 再测）。
4. **build:guides 重跑后 guides.json/readingMinutes 被意外改** → 处置：改完 build-sitemap.cjs 后，先 `git stash` 现有变化，单独跑 build，看 git diff guides.json 是否只变动了 dateModified 相关字段，其余不变；如是，再合入其余修改。
5. **AI 爬虫 Disallow 后，SGE（Google AI Overview）会不会不展示本站** → Google-Extended 控制的是 SGE 训练，Disallow 之后只是不会喂给 Gemini 训练，**不会影响正常搜索排名和 SERP 展示**（这是官方说明）。如果站长希望保留进入 AI Overview 的机会，M9 只对 GPTBot/ClaudeBot Disallow，Google-Extended 这行可以注释掉。
