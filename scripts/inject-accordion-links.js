#!/usr/bin/env node

/**
 * 为每个工具页自动注入个性化的折叠手风琴内链
 * 策略：
 * 1. 当前工具所在分类（6-8 个工具）
 * 2. 随机选择其他 3 个分类（每个 4-5 个工具）
 * 总计：约 20-23 个内链
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 tools.json
const toolsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../tools.json'), 'utf-8'));

/**
 * 获取指定分类的工具列表
 */
function getToolsByCategory(categoryKey, excludeToolId = null, limit = 10) {
  return Object.entries(toolsData.tools)
    .filter(([id, tool]) => {
      return tool.category === categoryKey && id !== excludeToolId;
    })
    .slice(0, limit)
    .map(([id, tool]) => ({
      id,
      ...tool
    }));
}

/**
 * 随机选择 N 个分类（排除指定分类）
 */
function getRandomCategories(excludeCategory, count = 3) {
  const allCategories = Object.keys(toolsData.categories).filter(cat => cat !== excludeCategory);

  // 洗牌算法
  for (let i = allCategories.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCategories[i], allCategories[j]] = [allCategories[j], allCategories[i]];
  }

  return allCategories.slice(0, count);
}

/**
 * 生成折叠手风琴 HTML
 */
function generateAccordionHTML(currentToolId) {
  const currentTool = toolsData.tools[currentToolId];
  if (!currentTool) return '';

  const currentCategory = currentTool.category;
  const currentCategoryInfo = toolsData.categories[currentCategory];

  // 1. 当前分类的工具（增加到 10-12个，强化同类互链）
  const sameCategoryTools = getToolsByCategory(currentCategory, currentToolId, 12);

  // 2. 随机选择其他 3 个分类
  const randomCategories = getRandomCategories(currentCategory, 3);

  // 生成 HTML
  let html = `
      <!-- 折叠手风琴式工具导航 - 自动生成 -->
      <section style="max-width: 960px; margin: 2.5rem auto; padding: 0 24px 0 24px;">
        <div style="padding: 2rem; background: var(--bg-card, var(--card, #fff)); border: 1px solid var(--border-color, var(--border, #e2e8f0)); border-radius: var(--radius-lg, var(--radius, 12px)); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
        <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-primary, var(--text-main, #111)); text-align: center;">
          🗂️ 按分类浏览更多工具
        </h2>
`;

  // 当前分类（排第一个）
  html += generateCategorySection(currentCategory, currentCategoryInfo, sameCategoryTools);

  // 其他 3 个随机分类
  randomCategories.forEach(catKey => {
    const catInfo = toolsData.categories[catKey];
    const tools = getToolsByCategory(catKey, null, 4);  // 其他分类保持 4 个
    html += generateCategorySection(catKey, catInfo, tools);
  });

  // 查看全部按钮
  html += `
        <!-- 查看全部工具 -->
        <div style="margin-top: 1.5rem; text-align: center; padding-top: 1.5rem; border-top: 1px solid var(--border-color, var(--border, #e2e8f0));">
          <a href="/tools-directory" style="display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px; background: var(--accent, var(--primary-color, #3b82f6)); color: white; text-decoration: none; border-radius: var(--radius-md, var(--radius, 8px)); font-weight: 600; font-size: 0.95rem; transition: all 0.2s; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
            <span>📚</span>
            <span>查看全部 1000+ 工具</span>
          </a>
        </div>
        </div>
      </section>

      <style>
        /* 折叠手风琴样式增强 */
        details[open] summary .arrow {
          transform: rotate(180deg);
        }
        details summary:hover {
          background: var(--bg-input, var(--bg-color, #f9f9f9));
        }
        details a:hover {
          border-color: var(--accent, var(--primary-color, #3b82f6)) !important;
          color: var(--accent, var(--primary-color, #3b82f6)) !important;
          transform: translateY(-1px);
        }
        a[href="/tools-directory"]:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
      </style>
`;

  return html;
}

/**
 * 生成单个分类的 details 区块
 */
function generateCategorySection(categoryKey, categoryInfo, tools) {
  if (tools.length === 0) return '';

  const linksHTML = tools.map(tool => {
    const url = '/' + tool.path.replace('.html', '');
    return `            <a href="${url}" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-card, var(--card, #fff)); border: 1px solid var(--border-color, var(--border, #e2e8f0)); border-radius: var(--radius-sm, 6px); text-decoration: none; color: var(--text-primary, var(--text-main, #333)); font-size: 0.9rem; transition: all 0.2s;">
              <span>${tool.icon}</span><span>${tool.name}</span>
            </a>`;
  }).join('\n');

  return `
        <!-- ${categoryInfo.name} -->
        <details style="margin-bottom: 12px; border: 1px solid var(--border-color, var(--border, #e2e8f0)); border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--bg-elevated, var(--bg-card, #fff));">
          <summary style="padding: 14px 18px; cursor: pointer; font-weight: 600; font-size: 0.95rem; color: var(--text-primary, var(--text-main, #111)); user-select: none; list-style: none; display: flex; align-items: center; justify-content: space-between; transition: background 0.2s;">
            <span style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.3rem;">${categoryInfo.icon}</span>
              <span>${categoryInfo.name}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted, var(--text-secondary, #999));">(${tools.length}个)</span>
            </span>
            <span class="arrow" style="font-size: 0.8rem; color: var(--text-muted, var(--text-secondary, #999)); transition: transform 0.3s;">▼</span>
          </summary>
          <div style="padding: 16px 18px; display: flex; flex-wrap: wrap; gap: 10px; background: var(--bg-input, var(--bg-color, #f9f9f9)); border-top: 1px solid var(--border-color, var(--border, #e2e8f0));">
${linksHTML}
          </div>
        </details>
`;
}

/**
 * 注入 HTML 到工具页
 */
function injectToToolPage(toolId, filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return false;
  }

  let html = fs.readFileSync(filePath, 'utf-8');

  // 检查是否已经有自动生成的内容，删除所有旧的
  while (html.includes('<!-- 折叠手风琴式工具导航 - 自动生成 -->')) {
    html = html.replace(/<!-- 折叠手风琴式工具导航 - 自动生成 -->[\s\S]*?<\/style>/m, '');
  }

  // 生成新的手风琴 HTML
  const accordionHTML = generateAccordionHTML(toolId);

  // 查找插入点：</article> 或 <footer 前
  const insertMarkers = [
    { pattern: /<\/article>\s*\n/i, position: 'before' },
    { pattern: /<footer[\s>]/i, position: 'before' }
  ];

  let inserted = false;
  for (const marker of insertMarkers) {
    const match = html.match(marker.pattern);
    if (match) {
      const insertPos = match.index + (marker.position === 'after' ? match[0].length : 0);
      html = html.slice(0, insertPos) + accordionHTML + '\n' + html.slice(insertPos);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    console.log(`⚠️  未找到插入点: ${filePath}`);
    return false;
  }

  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`✅ 已注入: ${filePath}`);
  return true;
}

// 主函数
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
使用方法:
  node scripts/inject-accordion-links.js <tool-id>          # 单个工具
  node scripts/inject-accordion-links.js --all              # 所有工具
  node scripts/inject-accordion-links.js --batch 10         # 批量处理 10 个
  node scripts/inject-accordion-links.js --category media   # 指定分类

示例:
  node scripts/inject-accordion-links.js 1
  node scripts/inject-accordion-links.js --category media
    `);
    return;
  }

  if (args[0] === '--all') {
    // 处理所有工具
    let success = 0, failed = 0;
    Object.entries(toolsData.tools).forEach(([id, tool]) => {
      const filePath = path.join(__dirname, '..', tool.path);
      if (injectToToolPage(id, filePath)) {
        success++;
      } else {
        failed++;
      }
    });
    console.log(`\n✅ 成功: ${success} 个 | ❌ 失败: ${failed} 个`);

  } else if (args[0] === '--batch' && args[1]) {
    // 批量处理指定数量
    const count = parseInt(args[1]);
    const toolIds = Object.keys(toolsData.tools).slice(0, count);
    let success = 0, failed = 0;
    toolIds.forEach(id => {
      const tool = toolsData.tools[id];
      const filePath = path.join(__dirname, '..', tool.path);
      if (injectToToolPage(id, filePath)) {
        success++;
      } else {
        failed++;
      }
    });
    console.log(`\n✅ 成功: ${success} 个 | ❌ 失败: ${failed} 个`);

  } else if (args[0] === '--category' && args[1]) {
    // 处理指定分类
    const category = args[1];
    const categoryTools = Object.entries(toolsData.tools).filter(([id, tool]) => tool.category === category);
    let success = 0, failed = 0;
    categoryTools.forEach(([id, tool]) => {
      const filePath = path.join(__dirname, '..', tool.path);
      if (injectToToolPage(id, filePath)) {
        success++;
      } else {
        failed++;
      }
    });
    console.log(`\n分类 "${category}": ✅ 成功: ${success} 个 | ❌ 失败: ${failed} 个`);

  } else {
    // 处理单个工具
    const toolId = args[0];
    const tool = toolsData.tools[toolId];
    if (!tool) {
      console.log(`❌ 工具 ID "${toolId}" 不存在`);
      return;
    }
    const filePath = path.join(__dirname, '..', tool.path);
    injectToToolPage(toolId, filePath);
  }
}

main();
