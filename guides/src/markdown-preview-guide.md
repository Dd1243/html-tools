---
title: Markdown 预览完全指南：GFM、代码高亮与安全 HTML
description: 讲清 Markdown 实时预览与 GFM 扩展、表格任务列表与代码高亮，说明复制 HTML 的安全边界与常见语法坑，配套 WebUtils Markdown 预览器。
keywords: Markdown预览,GFM,Markdown转HTML,代码高亮,任务列表,技术文档
tag: 开发工具
type: howto
slug: markdown-preview-guide
datePublished: "2026-08-08"
dateModified: "2026-08-08"
readingMinutes: 12
primaryTool: /tools/dev/markdown-preview
relatedTools:
  - /tools/dev/markdown-to-html
  - /tools/dev/html-formatter
  - /tools/dev/html-minifier
toolCta: Markdown 预览 — 实时 GFM 渲染与语法高亮
sideBtn: 立即打开 Markdown 预览
shortCrumb: Markdown 预览完全指南
lead: >
  README 在 GitHub 上「表格乱了」、博客草稿里代码块没有语言标记、或要把 MD 片段转成可粘贴的 HTML 时，**左侧改源码、右侧立刻看渲染** 比提交后才发现格式问题便宜得多。本指南说明 GFM 与 CommonMark 差异、预览器真实能力、复制 HTML 的安全注意，并对接 WebUtils 本地预览工具。
---

## 核心一句话 {#tldr}

**预览解决的是「渲染长什么样」；安全发布还要消毒 HTML，仓库里仍以 Markdown 为源。**

WebUtils 预览器使用 marked（`gfm: true`、`breaks: true`）把输入解析为 HTML，并用 Prism 做代码高亮，右侧即时刷新。它适合写作与核对，不是完整的静态站点生成器，也不会自动防止「MD 里嵌的危险 HTML」在错误场景被执行。下面按「方言 → 语法要点 → 操作 → 坑位 → 场景 → 选型」展开。

## 1. 你在预览的到底是哪一种 Markdown {#what}

「Markdown」不是单一语法，而是一族方言：

| 方言 / 环境 | 特点 | 本预览器 |
| --- | --- | --- |
| CommonMark | 严格、可互操作的核心 | 基础兼容 |
| GFM（GitHub Flavored） | 表格、删除线、任务列表、自动链接等 | **开启 gfm** |
| 博客扩展 | footnote、数学、容器块 | 视引擎；本页不保证 |
| 关闭 HTML 的纯 MD | 更安全 | 本页 marked 默认可输出 HTML（见安全节） |

页面标题与文案强调 **实时 GFM 渲染与语法高亮**。工具栏提供：

- **基础模板** — 标题、列表、任务列表、链接示例  
- **插入表格** — GFM 表头与对齐行  
- **插入代码块** — 带 `javascript` 语言标记的 fenced 块  
- **复制 HTML** — 复制右侧预览区 `innerHTML`  
- **清空** — 确认后清空编辑器  

左侧 `textarea` 每次输入调用 `renderMarkdown()`；主题可切换。处理在浏览器中完成。

### 与「转 HTML 工具」的分工

- [Markdown 预览](/tools/dev/markdown-preview)：边写边看，强调体验与高亮。  
- [Markdown 转 HTML](/tools/dev/markdown-to-html)：以导出/转换为任务中心时更直接。  
两者都可能生成 HTML；进站点壳前可用 [HTML 格式化](/tools/dev/html-formatter) 整理缩进。

## 2. 写作时高频语法与 GFM 要点 {#syntax}

### 标题与层级

用 `#` 到 `######`，注意井号后空格。预览开启 `headerIds` 时，标题可能带 id，便于页内锚点——与 GitHub 的 slug 规则未必逐字相同，锚点链接跨平台要抽查。

### 强调、链接、图片

```markdown
**粗体** 与 *斜体* 与 ~~删除线（GFM）~~

[链接文字](https://example.com)
![替代文本](https://example.com/a.png)
```

图片在预览区限制 `max-width: 100%`，大图可滚动查看。

### 列表与任务列表

```markdown
- 普通项
  - 嵌套项

1. 有序一项
2. 有序二项

- [x] 已完成
- [ ] 未完成
```

任务列表是 GFM 常见能力；在不支持 GFM 的旧解析器里会显示成普通列表文字。

### 表格

```markdown
| 字段 | 类型 | 说明 |
| :--- | :---: | ---: |
| id | Int | 左对齐 / 中 / 右 |
| name | String | 用户名 |
```

第二行的 `:---` 控制对齐。单元格内竖线需转义或避免。

### 代码：行内与围栏

行内用单个反引号。围栏用三个反引号并写语言 id，高亮才有意义：

````markdown
```python
def greet():
    print("Hello")
```
````

本页对 Prism 已加载的语言走 `Prism.highlight`，其余原样输出再尝试 `highlightAllUnder`。语言名写错时往往无高亮但不影响代码文本。

### 换行策略（`breaks: true`）

开启 breaks 时，源码中的单次换行可能变成 `<br>`，更接近「聊天/文档」习惯，而与「必须空行才分段」的严格 Markdown 略有不同。若你的目标平台（如某些静态生成器）**不**把单换行当 `<br>`，预览会「显得更碎」——以目标平台为准，预览仅作参考。

### 引用与水平线

```markdown
> 引用段
> 第二行

---
```

## 3. 安全 HTML：预览成功 ≠ 可以原样上线 {#security}

marked 解析后通过 `innerHTML` 写入预览节点。这意味着：

1. **Markdown 源里若直接写原始 HTML 标签**，许多配置下会原样进入 DOM。  
2. 预览页执行的是「你自己的浏览器上下文」；把同一 HTML 拷到博客后台、评论区、同事浏览器时，风险模型不同。  
3. **`复制 HTML` 得到的是渲染结果**，可能含高亮产生的 `span` 与 class，不一定是「最小语义 HTML」。

实践建议：

- 对用户提交的 MD：**服务端或可信管线消毒**（DOMPurify 等），不要只靠「我们写的都是安全的」。  
- 文档仓库：尽量少嵌复杂 HTML；需要自定义组件时用站点约定的短代码。  
- 不要把未审查的第三方 README 一键复制 HTML 进生产页。  
- 链接用 `https`；警惕 `javascript:` 与未加引号属性（若允许裸 HTML）。

本工具定位是 **作者侧预览**，不是安全网关。指南必须把这层边界写清，避免「能预览 = 能上线」。

## 4. 逐步操作 {#steps}

1. **打开** [/tools/dev/markdown-preview](/tools/dev/markdown-preview)。  
2. **查看默认示例**（含列表、GFM 说明、Python 代码块），感受左右分栏。  
3. **清空或覆盖** 为你的草稿；输入即渲染，无需单独「编译」按钮。  
4. **插入结构：** 光标处点「插入表格」或「插入代码块」，再改成业务内容。  
5. **检查 GFM：** 任务列表勾选语法、表格对齐、删除线是否如期。  
6. **检查代码：** 语言标签是否使高亮生效；长行是否可横向滚动。  
7. **复制 HTML（可选）：** 点「复制 HTML」，到目标编辑器粘贴；若需缩进，转 [HTML 格式化](/tools/dev/html-formatter)。  
8. **主题：** 右上角切换亮/暗，避免「只在一种背景下好看」。  

### 能力边界

- **有：** GFM 选项、breaks、标题 id、Prism 高亮、模板插入、复制 HTML、本地主题。  
- **无保证：** 与 GitHub 百分百一致的每个边缘 case、数学公式、Mermaid、导出 PDF（页面示例里「导出 PDF」可标为规划中）、完整 XSS 过滤。  
- **依赖：** CDN 上的 marked 与 Prism；离线环境需自备或改本地资源策略。

## 5. 常见问题与处理办法 {#errors}

| 现象 | 常见原因 | 怎么处理 |
| --- | --- | --- |
| 表格变成普通段落 | 缺少分隔行 `\| --- \|`；上下空行不对 | 用「插入表格」再改 |
| 代码无高亮 | 语言名错误或 Prism 未加载该语言 | 改用常见 id：`js`/`ts`/`python` |
| 列表断掉 | 空行或缩进空格数不对 | 同级列表缩进一致；嵌套多 2～4 空格 |
| 预览比 GitHub「多很多 br」 | `breaks: true` | 目标若是 GitHub，少依赖单换行 |
| 图片不显示 | 热链失效、需登录、混合内容 | 换可访问 URL 或相对路径策略 |
| 复制的 HTML 带一堆 span | Prism 高亮节点 | 需要干净 HTML 时用转换工具或关高亮管线 |
| 标题锚点和 GitHub 不一致 | slug 算法不同 | 跨站锚点手写或查平台规则 |
| 任务列表不能点 | 预览多为静态 HTML | 交互任务列表需应用自己实现 |
| 内嵌 HTML 把版式撑破 | 未消毒的 style/script | 删裸 HTML 或消毒 |
| 清空误触 | — | 清空有 confirm；仍建议重要稿在仓库 |

## 6. 真实工作场景 {#scenarios}

### 场景 A：写 GitHub README 前的自检

本地用预览看表格与徽章链接（徽章是图片 URL）。注意 breaks 差异：最终以 GitHub 拉取请求页为准再微调空行。

### 场景 B：设计评审用「半成品说明」

产品贴 MD 需求，前端用预览投屏。插入表格描述字段，代码块放接口示例。避免在 Impromptu PPT 里丢格式。

### 场景 C：从预览到站点段落

复制 HTML → HTML 格式化 → 贴进 CMS。长期内容仍应存 MD 或 CMS 结构化字段，避免只维护 genereted HTML。

### 场景 D：教学演示 fenced 代码

切换语言标签演示高亮差异；强调「语言标签不是装饰，是给阅读器和复制者的提示」。

### 场景 E：迁移旧 Wiki（杂 HTML + MD）

预览时观察哪些段落其实是裸 HTML。迁移时改为纯 MD 或合法短代码，减少将来换解析器时的断裂。

### 场景 F：邮件/IM 不支持 MD

在预览确认结构后，复制为纯文本或 HTML 贴到只认富文本的编辑器；不要假设对方客户端渲染 GFM。

## 7. 质量清单 {#checklist}

- 对外 README：安装、最小示例、许可证、链接可点击  
- 所有图片有替代说明（可访问性）  
- 代码块标注语言；秘密不进示例  
- 表格复杂时考虑是否拆文档  
- 发布管道：MD →（可选预览）→ 构建 → 消毒 → HTML  
- 多人和写时统一方言（GFM 与否）写进贡献指南  

## 8. 相关工具怎么选 {#related}

- [Markdown 预览](/tools/dev/markdown-preview) — 实时 GFM + 高亮（本篇主工具）
- [Markdown 转 HTML](/tools/dev/markdown-to-html) — 转换导出为主  
- [HTML 格式化](/tools/dev/html-formatter) — 整理生成的 HTML  
- [HTML 压缩](/tools/dev/html-minifier) — 生成物体积  

选型口诀：**边写边看用预览；批量导出用转 HTML；生成后入库前格式化；上线体积再压缩。**

## 常见问题 {#faq}

### 预览和 GitHub 渲染为什么偶尔不一样？

GFM 仍有边缘差异；本页 `breaks: true`、标题 id、高亮 HTML 结构都会造成观感差。以 GitHub 为权威时，最终在 PR 页确认。

### 复制 HTML 能直接当邮件正文吗？

邮件客户端支持残缺的 HTML/CSS。可以当起点，但要经邮件专用测试（各厂商）。高亮 span 与站点 CSS 变量在邮件里常失效。

### 是否支持数学公式与流程图？

本页主路径未绑定 KaTeX/Mermaid。需要时用支持插件的站点生成器或专用编辑器，不要假设预览器「写了 `$` 就会变公式」。

### 为什么任务列表不能勾选保存？

预览输出通常是静态 checkbox 展示；勾选状态不会写回 MD。要持久化需应用层编辑器。

### 离线能否使用？

依赖的 marked/Prism 若从 CDN 加载，断网会失败。可考虑本地缓存或自建静态资源；工具逻辑本身不需服务器算 MD。

### 大文档会卡吗？

极大 MD 每次 `input` 全量 parse 可能吃性能。可分段预览，或在本地编辑器写完再整贴核对。

### 怎样尽量安全地允许少量 HTML？

白名单标签与属性、剥链接协议、CSP、服务端消毒。作者预览工具不替代这些控件。

## 继续浏览 {#next}

点「基础模板」改几行看右侧变化，再插入表格与代码块，最后复制一次 HTML 到格式化工具。确认目标平台方言后，把习惯写进团队文档约定。

- [打开 Markdown 预览](/tools/dev/markdown-preview)
- [返回指南列表](/guides/)
- [全部工具](/tools-directory)
