# 指南 Markdown 源

本目录是使用指南的**正文源**。构建后生成 `guides/{slug}.html`。

## 如何新增一篇

1. 新建 `guides/src/{slug}.md`（`slug` 与文件名、frontmatter 一致）。  
2. 填写 frontmatter：`title`、`description`、`slug`、`primaryTool`、`readingMinutes`、`datePublished`、`dateModified` 等（字段表见 [docs/GUIDE-WRITING.md](../../docs/GUIDE-WRITING.md)）。  
3. 写 Markdown 正文：`## 节标题 {#id}`、表格、代码围栏、原创 FAQ；汉字目标 ≥ 2500（以构建后 article 为准）。  
4. 运行 `npm run build:guides`，再 `npm run verify:guides`。  
5. 抽查 `guides/{slug}.html` 与 `guides/guides.json`。

**不要**在本目录贴整页 HTML 或复制 `guide-shell.css`。样式在 `guides/layout/guide-shell.css`。已有 src 时只改 MD，勿只改 HTML。  
