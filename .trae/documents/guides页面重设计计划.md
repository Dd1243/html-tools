# `/guides/` 页面重设计计划

## Summary

完整重写 [guides/index.html](file:///e:/html-tools/guides/index.html)，视觉与交互对齐 [tools-directory.html](file:///e:/html-tools/tools-directory.html) 的现代浅色体系（Space Grotesk、indigo primary、sticky header、hero、卡片网格），保留现有 SEO meta / CollectionPage 结构化数据与全部内链内容；**不改** `guides.json` 数据与路由。可选：同步提升 [guides/dev/index.html](file:///e:/html-tools/guides/dev/index.html) 以保持 guides 子系统一致。完成后 commit 并 push 到 GitHub。

## Current State Analysis

### 问题（为何“丑”）

| 维度 | 当前 `/guides/` | 参考 `/tools-directory` |
|------|-----------------|-------------------------|
| 字体 | 系统中文黑体，无品牌感 | Space Grotesk |
| 主色 | 青绿 `#0d9488` | Indigo `#4f46e5` |
| 顶栏 | main 内普通文字链 | sticky 半透明 header + logo |
| 布局 | 窄栏 920px 列表 | 1100px hero + 卡片网格 |
| 内容呈现 | 单列 ul 列表 | tool-card 式卡片 |
| 背景 | 顶部深色渐变突兀切白 | 径向 indigo/sky 轻渐变 |

### 现有内容资产（必须保留）

- **数据**：[guides/guides.json](file:///e:/html-tools/guides/guides.json) — 7 个分类定义 + 1 篇 `json-formatter-guide`
- **SEO**：title、description、canonical、og、CollectionPage JSON-LD
- **区块**：精选指南、按分类浏览、指南与工具关系说明、页脚
- **内链**：`/tools/dev/json-formatter`、`/guides/dev/`、`/tools-directory`、`/contact` 等
- **入口**：首页与 tools-directory 已链到 `/guides/`，无需再改入口

### 范围边界

- **必做**：仅重写 `guides/index.html`（用户点名页面）
- **建议同批**：`guides/dev/index.html` 套用同一视觉壳（仍为分类 hub，内容不变）
- **不做本次**：单篇 `json-formatter-guide.html`、`guide-template.html` 全文重写（可后续统一）；不引入构建/组件框架；不改 `sync-all.js`（该脚本不生成 guides 列表页）

## Design Spec（对齐 tools-directory）

### Token

```css
--bg: #f4f6fb;
--card: #ffffff;
--text: #0f172a;
--muted: #64748b;
--border: #e2e8f0;
--primary: #4f46e5;
--primary-soft: #eef2ff;
--shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
font-family: "Space Grotesk", system-ui, -apple-system, sans-serif;
```

Google Fonts：`Space+Grotesk:wght@400;500;600;700`（与 tools-directory 相同 preconnect + link）

### 页面结构（自上而下）

1. **sticky `site-header`**
   - logo：`WebUtils` → `/`
   - nav：首页 · 全部工具 · **使用指南（active）** · 关于
2. **`main.page`**
   - breadcrumb：首页 › 使用指南
   - **hero**：标题「使用指南与教程」+ lead + pills（`1 篇已发布` · `工具配套` · `少而精` · `持续更新`）
   - **精选指南**（section）：
     - 标题 + 可选小说明
     - **指南卡片网格**（复用 tool-card 思路，适配文章元信息）
       - 图标区（📖 或分类 emoji）
       - 标题链接 → `/guides/dev/json-formatter-guide`
       - description 两行截断
       - meta 行：分类 · 阅读时长 · 关联工具链接
   - **按分类浏览**（section）：
     - 有内容分类（dev）→ 可点 chip/卡片 → `/guides/dev/`
     - 无内容分类 → 禁用/「即将补充」样式（text/time/media/converter/privacy/seo，来自 guides.json）
   - **指南如何配合工具**（info card）：保留现有文案逻辑 + CTA 到 tools-directory / contact
3. **`site-footer`**：与 tools-directory 同构（关于、使用指南、联系、条款、隐私、首页）

### 指南卡片 HTML 示意

```html
<a class="guide-card" href="/guides/dev/json-formatter-guide">
  <div class="guide-icon">📖</div>
  <div class="guide-body">
    <div class="guide-title">JSON 格式化完全指南…</div>
    <div class="guide-desc">说明 JSON 格式化…</div>
    <div class="guide-meta">
      <span>开发工具</span>
      <span>约 8 分钟</span>
      <!-- 关联工具用独立链接 stopPropagation 或卡片外 meta；
           推荐：卡片可点整卡，关联工具做成卡片内 secondary link，
           用 pointer-events 正常即可（嵌套 a 非法），故改为：
           外层 div.card，标题 a + 工具 a 并列 -->
    </div>
  </div>
</a>
```

**实现注意**：避免 `<a>` 嵌套。采用 `article.guide-card` + 标题主链接 + 关联工具次链接（与 tools-directory 纯 tool-card 略有不同，因需「打开工具」次入口）。

### SEO 增强（小改、不改语义）

- 保留 CollectionPage；可补充 `BreadcrumbList`（与 tools-directory 一致）
- 可选 ItemList（1 篇精选），有则加、无则不加复杂图
- 补全 favicon 16x16、twitter card、`og:locale`、adsense script（与 tools-directory 对齐，便于变现一致）

### 响应式

- 指南网格：1 列 → ≥720px 2 列
- header/nav 小屏换行（已有 flex-wrap）
- 宽度：`min(1100px, 94%)`

## Proposed Changes

### 1. 重写 `e:\html-tools\guides\index.html`（核心）

| What | Why | How |
|------|-----|-----|
| 替换整页 style + body 结构 | 旧样式与站点脱节 | 按 Design Spec 手写完整单文件 HTML（站内惯例：内联 CSS、无构建） |
| 保留 head 中 SEO 核心字段 | 不伤索引 | title/description/canonical/og 沿用；补 BreadcrumbList + 资源对齐 |
| 精选区改为卡片 | 可读性与目录页一致 | 静态写死当前 1 篇（与现页一致，不引入运行时读 json） |
| 分类区展示 guides.json 中全部 7 类 | 信息架构完整 | 仅 `dev` 可跳转；其余「即将补充」 |
| 页脚对齐 | 全站一致性 | 复制 tools-directory footer 结构 |

**静态 vs 动态**：继续纯静态 HTML（与现网一致）。`guides.json` 仍是数据源约定；列表页人工与 json 同步（目前仅 1 篇，成本低）。**不**在本页加 fetch guides.json，避免额外请求与离线/路径问题。

### 2. 同步 `e:\html-tools\guides\dev\index.html`（建议同批）

- 同一 header/footer/token/hero 壳
- 保留 breadcrumb：首页 › 使用指南 › 开发工具
- 本分类文章用同款 guide-card
- 相关工具入口用 pill/chip 链接

### 3. 明确不改文件

- `guides/guides.json`
- `guides/dev/json-formatter-guide.html`（单篇正文可后续统一）
- `templates/guide-template.html`
- `scripts/sync-all.js`、`tools-directory.html`、`index.html`
- sitemap（URL 不变）

### 4. 发布

- `git add` 改动的 guides 页面
- commit message 示例：`style: redesign /guides/ hub to match tools-directory`
- `git push origin master`（用户一贯要求上传 GitHub）

## Assumptions & Decisions

1. **视觉基准 = tools-directory 浅色 indigo**，不是首页深色主题（目录/内容页已是浅色，about 仍是旧青绿，本次不扩 about）。
2. **只做视觉与布局重写**，不新增搜索、筛选 JS、暗色切换（tools-directory 本身也无 theme toggle）。
3. **内容文案可小幅润色**（更短 lead、更清晰 CTA），但不改指南定位口号核心含义。
4. **分类图标**采用简单 emoji 映射：dev ⚡、text 📝、time ⏰、media 🖼️、converter 🔄、privacy 🔒、seo 📈。
5. **同批改 dev hub** 作为默认执行项；若执行时需极简，可只交 index。
6. **不**用 CSS 抽公共文件（站内无 shared CSS 惯例，单文件自包含）。

## Implementation Steps（执行顺序）

1. 以 tools-directory 的 header/hero/card/footer CSS 为骨架，写出新 `guides/index.html` 全文。
2. 填入精选指南卡片 + 7 分类浏览 + 说明区 + 保留/增强 JSON-LD。
3. 用同壳改写 `guides/dev/index.html`。
4. 本地打开核对：导航 active、链接路径、移动端换行、无嵌套 a。
5. commit + push。

## Verification

- [ ] `/guides/` 视觉与 tools-directory 同族（字体、主色、sticky 顶栏、圆角卡片）
- [ ] 精选指南可点进 `/guides/dev/json-formatter-guide`
- [ ] 关联工具可点进 `/tools/dev/json-formatter`
- [ ] `/guides/dev/` 可从分类区进入
- [ ] 无内容分类显示「即将补充」且不可误点 404
- [ ] canonical 仍为 `https://essays4u.net/guides/`
- [ ] 首页 / tools-directory 入口仍有效
- [ ] GitHub `master` 已包含本次提交

## Out of Scope（后续可做）

- 单篇指南页与 guide-template 统一为同一 design system
- about/contact 青绿旧样式升级
- 从 guides.json 自动生成 hub 页的脚本
