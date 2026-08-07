# Agent 协作说明（WebUtils / html-tools）

面向在本仓库改代码或写内容的自动化助手与人工协作者。

## 使用指南（guides）强制规则

写或改 `guides/` 下文章时，必须遵守 [docs/GUIDE-WRITING.md](docs/GUIDE-WRITING.md)：

1. **正文汉字 ≥ 2500**（`<article>` 去标签后统计，与 `npm run verify:guides` 一致）。  
2. **禁止模板化**：不得只换工具名复用旧文；不得空壳目录 + 套话凑字；FAQ/场景/错误表必须本主题原创。  
3. **版式可复用，内容不可换皮**：CSS/页头页脚/TOC 布局可沿用；段落、示例、决策说明按工具重写。  
4. 完成后运行 **`npm run verify:guides`**，未通过则继续改，不得声称已完成。  
5. 同步 `guides/guides.json` 的 `description`、`dateModified`、`readingMinutes`、相关工具。

## 通用工程习惯

- 优先改已有文件；非必要不新增 md/README。  
- 工具页保持单文件、本地处理、可离线。  
- 用户要求 commit/push 再操作 git；不要主动 force push。  
