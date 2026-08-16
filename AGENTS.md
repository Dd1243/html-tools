﻿# Agent 协作说明（WebUtils / html-tools）

面向在本仓库改代码或写内容的自动化助手与人工协作者。

## 指南写作强制规则

写或改指南时，必须严格遵守 `docs/GUIDE-WRITING.md`：

1. **新指南必须写在** `guides/src/*.md`（YAML frontmatter + Markdown 正文）
2. 完成后先 **`npm run build:guides`**，再 **`npm run verify:guides`**（未通过不得声称完成）
3. **正文字数**：生成 HTML 的 `<article>` 去标签后，**汉字 ≥ 2500**（禁止换皮/模板化）
4. `guides/guides.json` 由构建自动同步，需人工检查 `description`、`dateModified`、`readingMinutes` 等
5. `npm run build:guides` 会同步调用 `scripts/build-sitemap.cjs`：按 frontmatter/`dateModified` 或文件 mtime 写 `lastmod`，并把全部指南写入 `sitemap.xml`（新文章自动进站地图）
6. 样式只用 `guides/layout/guide-shell.css`，勿每篇复制整份 CSS

## 通用工程习惯

- **优先改已有文件**；非必要不新增 `md/README`（`guides/src` 正文与该目录说明除外）
- 工具页保持单文件、本地处理、可离线
- 用户要求 `commit/push` 再操作 git；不要主动 `force push`

## 快速检查清单

- [ ] 新文章已写在 `guides/src/*.md`
- [ ] 已运行 `npm run build:guides`
- [ ] 已运行 `npm run verify:guides`（汉字 ≥ 2500）
- [ ] 正文无模板化、FAQ/场景/错误表本主题原创
- [ ] 构建后 `guides.json` 描述、日期、阅读时长与 frontmatter 一致