# 使用指南写作规范（强制）

适用于 `guides/src/*.md` 源文、构建产物 `guides/*.html`，以及 `guides/guides.json` 中的配套元数据。  
**版式可以复用，正文禁止模板化灌水。**

## 写作工作流（MD 源 → 固定样式 → HTML）

指南正文以 **Markdown 为唯一源**，经固定壳样式构建为可发布 HTML。不要在已有 src 的情况下只改 HTML。

| 角色 | 路径 / 命令 | 说明 |
|------|-------------|------|
| **源文件** | `guides/src/{slug}.md` | YAML frontmatter + Markdown 正文 |
| **样式** | `guides/layout/guide-shell.css` | 全站指南共用；**勿**每篇复制内联大段 CSS |
| **构建** | `npm run build:guides` | 读取 src，套壳生成 `guides/{slug}.html`，并同步 `guides/guides.json`（以构建实现为准） |
| **校验** | `npm run verify:guides` | 对**生成后的** HTML 统计 `<article>` 汉字 ≥ 2500 等 |

### 编辑纪律

1. **新文章必须写 MD**：在 `guides/src/` 新增 `{slug}.md`，再构建；不要手写整页 HTML 当正文源。  
2. **已有 src 的篇目**：只改 `guides/src/{slug}.md`，然后 `npm run build:guides`；**禁止**只改 `guides/{slug}.html` 不改 MD（下次构建会被覆盖）。  
3. **历史仅 HTML、尚无 src**：迁移前可临时改 HTML；迁移后一律走 MD。  
4. **样式**：改阅读版式只动 `guides/layout/guide-shell.css`（及构建壳），不要在单篇 MD/HTML 里堆一份完整主题 CSS。  
5. 构建脚本由仓库提供；写作方负责 MD 质量与跑通构建 + 校验。

### Frontmatter 字段

每篇 `guides/src/{slug}.md` 文首使用 YAML frontmatter（`---` 包裹）。字段与 `guides/guides.json` / 页头 SEO 对齐：

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题（不含站点名后缀） |
| `description` | 是 | 摘要 / meta description，一句说清读者能得到什么 |
| `slug` | 是 | URL 与文件名，如 `json-formatter-guide`；与文件名一致 |
| `primaryTool` | 是 | 主工具路径，如 `tools/dev/json-formatter.html`（须真实存在） |
| `relatedTools` | 建议 | 相关工具路径数组；文内「何时用谁」要写决策，不单列链接 |
| `readingMinutes` | 是 | 预估阅读分钟；与篇幅匹配（约 2500 字 ≈ 10～14，勿写 5 分钟空壳） |
| `datePublished` | 是 | 首次发布 `YYYY-MM-DD` |
| `dateModified` | 是 | 最近实质修改 `YYYY-MM-DD` |
| `keywords` | 建议 | 逗号分隔或 YAML 列表，供 meta keywords |
| `tag` | 建议 | 列表展示用短标签，如 `开发工具` |
| `type` | 可选 | 如 `howto`；默认按 HowTo/TechArticle 壳处理 |
| `toolCta` | 可选 | 主工具行动点文案（按钮/卡片标题）；缺省可用工具名 |
| `relatedGuides` | 可选 | 相关指南 slug 数组 |

示例：

```yaml
---
title: JSON 格式化完全指南：美化、校验与常见错误
description: 系统讲解 JSON 美化、校验与压缩的区别，给出操作步骤、常见错误与工具选型。
slug: json-formatter-guide
tag: 开发工具
type: howto
primaryTool: tools/dev/json-formatter.html
relatedTools:
  - tools/dev/json-minifier.html
  - tools/dev/json-diff.html
  - tools/converter/json-yaml.html
relatedGuides: []
datePublished: 2026-08-06
dateModified: 2026-08-08
readingMinutes: 12
keywords: JSON格式化,JSON美化,JSON校验,JSON错误,在线JSON工具
toolCta: 打开 JSON 格式化工具
---
```

### Markdown 约定

1. **节标题与锚点**：`## 节标题 {#id}`，`id` 与目录 TOC 一致（如 `{#steps}`、`{#errors}`、`{#faq}`）。构建把标题映射为带 `id` 的 `h2`/`section`。  
2. **开篇 lead**：正文第一段或单独以约定方式写出导语（解决「谁在什么情况下的哪一个问题」）；勿空泛口号。  
3. **表格**：GFM 表格；错误对照、对比选型优先用表，且**数据必须本主题原创**。  
4. **代码围栏**：标明语言（`json`、`js`、`bash` 等）；示例须可解析或明确标为「故意非法」。  
5. **列表与步骤**：操作步骤用有序列表，写明打开哪一页、点什么、失败时看什么。  
6. **FAQ 结构**（任选构建可识别的一种，全文统一）：  
   - 独立节 `## 常见问题 {#faq}`，其下 `### 问题原文` + 至少两段/两句回答；或  
   - 同一节内「问 / 答」成对书写，保证 ≥4 个问题且答案只服务本篇。  
7. **相关工具**：除 frontmatter 的 `relatedTools` 外，正文用决策语言说明何时用主工具、何时用压缩/Diff/转换等。  
8. **勿**在 MD 里粘贴整页 `<html>`、站点 header/footer 或 `guide-shell.css` 全文；壳由构建注入。

构建产物路径：`guides/{slug}.html`（与现网扁平 URL 一致）。`guides/index.html` 等列表页依赖 `guides.json`，构建后人工扫一眼描述与日期是否合理。

---

## 硬性门槛

| 项 | 要求 |
|----|------|
| 正文字数 | 生成 HTML 的 `<article>` 去标签、去脚本样式后，**汉字 `[\u4e00-\u9fff]` ≥ 2500** |
| 阅读时长 | `readingMinutes` 与篇幅匹配（约 2500 字 ≈ 10～14 分钟，勿再写 5 分钟空壳） |
| 主工具 | 必须关联真实存在的工具页，步骤可对着工具完成 |
| 发布前 | 先 `npm run build:guides`，再 `npm run verify:guides`；未通过不得当作完成 |
| 源与产物 | 有 `guides/src/{slug}.md` 时，以 MD 为准；禁止只改 HTML |

统计方式与 `scripts/verify-guides-quality.cjs` 一致，不以「整文件含导航页脚」凑字。

## 什么叫「模板化」（禁止）

下列行为视为不合格，即使字数达标也要重写：

1. **换皮短文**：把旧指南里的段落批量替换工具名，结构与例句几乎不变。  
2. **空壳目录**：目录有 6～8 节，每节只有 1～2 句口号或纯列表无解释。  
3. **万能套话堆砌**：大量「非常重要」「广泛应用于」「提升效率」「一站式解决」等无信息句子。  
4. **固定九段拷贝**：每篇文章都强制同一套「1 概念 2 场景 3 规则 4 步骤 5 错误 6 场景 7 清单 8 工具 9 协作」且内容可互换。  
5. **假示例**：示例无法解析、与主题无关，或只有「示例 / foo / bar」占位。  
6. **FAQ 复制**：多篇文章共用同一组 FAQ，仅改标题里的产品名。  
7. **为凑字重复**：同一意思换三种说法连写，无新增判断或操作信息。

## 什么可以复用（允许）

- 站点壳与样式：`guides/layout/guide-shell.css`、构建注入的 header、breadcrumb、footer、右侧 TOC。  
- SEO 骨架：TechArticle / HowTo / FAQ / Breadcrumb 的 **结构**（问答与步骤文案必须本篇原创，通常由 frontmatter + MD 生成）。  
- 组件形态：结论卡、对比表、代码块、检查清单、工具卡片——**里面的文案与数据必须按主题重写**。  
- 旧版 `templates/guide-template.html`：仅作历史 HTML 参考；**新文以 MD + 构建为准**，禁止把 `{{LEAD}}` 式占位直接上线。

## 每篇必须做到的质量

1. **先定读者任务**：这篇解决谁在什么情况下的哪一个问题？（一句话写进 lead，勿空泛。）  
2. **信息密度**：主要章节都要有「场景 / 做法 / 注意点」中的至少两项，不能只有标题。  
3. **主题专属内容**（按工具真实能力选，不凑齐）  
   - 该工具特有的参数、限制、易混概念  
   - 至少 1 组**前后对照**或合法/非法示例（语法真实）  
   - 至少 1 张**与本主题相关**的对比或错误表  
   - ≥3 个**可辨识的真实工作场景**（联调、配置、文档、运维等，按题裁剪）  
   - FAQ ≥4，答案各 ≥2 句，且只回答本篇会遇到的问题  
4. **可操作步骤**：步骤顺序可执行；写明打开哪一页、点什么、失败时看什么。  
5. **相关工具「何时用谁」**：用决策语言，不要只丢四个同质卡片。  
6. **锚点完整**：`{#id}` 与目录、文内跳转一致。  
7. **安全与隐私**：涉及粘贴用户数据时，提醒脱敏与本地处理边界（结合 WebUtils 实际，勿夸大）。

## 章节怎么组织（灵活，非固定模板）

**不要**规定每篇必须 N 节同名。按主题选结构，例如：

- 调试类：概念边界 → 操作 → 报错表 → 场景 → FAQ  
- 转换类：输入输出约定 → 步骤 → 有损/无损说明 → 场景 → FAQ  
- 生成类：参数含义 → 好结果标准 → 反例 → 导出注意 → FAQ  
- 对比/Diff 类：何时对比 → 步骤 → 误报来源 → 与格式化配合 → FAQ  

字数应来自**新信息**（规则、边界、反例、决策），不是来自章节数量。

## 写作流程（建议）

1. 打开真实工具页，自己走一遍主路径，记下易错点。  
2. 在 `guides/src/` 新建或打开 `{slug}.md`，填好 frontmatter。  
3. 列出 5～8 个「只有这篇才需要回答」的问题，删掉通用套话问题。  
4. 先写错误表/对照表示意（最能拉开与模板文差距），再写步骤与场景；节标题带 `{#id}`。  
5. 通读删车轱辘句。  
6. 运行 `npm run build:guides`，再 `npm run verify:guides`。  
7. 检查 `guides/guides.json`：`description`、`dateModified`、`readingMinutes`、`relatedTools` 等是否与 frontmatter 一致（构建应自动写入，仍须人工确认）。

## 验收清单（发布前勾选）

- [ ] 源文件在 `guides/src/{slug}.md`，未只改 HTML  
- [ ] 已 `npm run build:guides`  
- [ ] 汉字 ≥ 2500（`npm run verify:guides` 通过）  
- [ ] 换一篇其他指南并排扫一眼：场景、错误、FAQ **明显不同**  
- [ ] 示例可解析或明确标为「故意非法」  
- [ ] 主工具与相关链接 404 不存在  
- [ ] meta / JSON-LD / 阅读时长与正文一致（构建产物）  
- [ ] 无大段从旧文复制后只改工具名  
- [ ] `guides.json` 已核对  

## 维护

- 规范本文：`docs/GUIDE-WRITING.md`  
- 源文目录：`guides/src/`（说明见该目录 `README.md`）  
- 共用样式：`guides/layout/guide-shell.css`  
- 校验脚本：`scripts/verify-guides-quality.cjs`  
- 命令：`npm run build:guides`、`npm run verify:guides`  
- Agent / 协作者须同时遵守 `AGENTS.md` 中指南相关条款  
