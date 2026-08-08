# Agent 协作说明（WebUtils / html-tools）

面向在本仓库改代码或写内容的自动化助手与人工协作者。

## 使用指南（guides）强制规则

写或改指南时，必须遵守 [docs/GUIDE-WRITING.md](docs/GUIDE-WRITING.md)：

1. **新指南写在** `guides/src/*.md`（frontmatter + Markdown）；已有 src 的篇目只改 MD，禁止只改生成 HTML。  
2. 完成后先 **`npm run build:guides`**，再 **`npm run verify:guides`**；未通过则继续改，不得声称已完成。  
3. **正文汉字 ≥ 2500**（对生成 HTML 的 `<article>` 统计）；**禁止换皮/模板化**（FAQ、场景、错误表须本主题原创）。  
4. **`guides/guides.json`**：构建应自动从 frontmatter 同步；仍须人工检查 `description`、`dateModified`、`readingMinutes`、相关工具等。  
5. 样式用 `guides/layout/guide-shell.css`，勿每篇复制整份 CSS。

## 通用工程习惯

- 优先改已有文件；非必要不新增 md/README（`guides/src` 正文与该目录说明除外）。  
- 工具页保持单文件、本地处理、可离线。  
- 用户要求 commit/push 再操作 git；不要主动 force push。  
