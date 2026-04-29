#!/usr/bin/env node

/**
 * 为所有工具页面添加面包屑导航和结构化数据
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 读取 tools.json
const toolsJsonPath = path.join(rootDir, 'tools.json');
const toolsData = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf-8'));

const { categories, tools } = toolsData;

// 面包屑 HTML 模板
function getBreadcrumbHTML(categoryId, categoryName, toolName) {
  return `      <!-- 面包屑导航 -->
      <nav class="breadcrumb" aria-label="breadcrumb">
        <ol itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="../../index.html">
              <span itemprop="name">首页</span>
            </a>
            <meta itemprop="position" content="1" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="../../index.html#${categoryId}">
              <span itemprop="name">${categoryName}</span>
            </a>
            <meta itemprop="position" content="2" />
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">${toolName}</span>
            <meta itemprop="position" content="3" />
          </li>
        </ol>
      </nav>
`;}

// 面包屑 JSON-LD 模板
function getBreadcrumbJSONLD(categoryId, categoryName, toolName, toolPath) {
  const baseUrl = 'https://essays4u.net';
  const toolUrl = `${baseUrl}/${toolPath.replace('.html', '')}`;

  return `
    <!-- 面包屑结构化数据 -->
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "首页",
      "item": "${baseUrl}/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "${categoryName}",
      "item": "${baseUrl}/#${categoryId}"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "${toolName}"
    }
  ]
}
    </script>`;
}

// 面包屑 CSS 样式
const breadcrumbCSS = `
      /* 面包屑导航样式 */
      .breadcrumb {
        margin: 1rem 0;
        padding: 0.75rem 1rem;
        background: var(--bg-card);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-color);
      }

      .breadcrumb ol {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.875rem;
      }

      .breadcrumb li {
        display: flex;
        align-items: center;
        color: var(--text-secondary);
      }

      .breadcrumb li:not(:last-child)::after {
        content: "›";
        margin-left: 0.5rem;
        color: var(--text-muted);
      }

      .breadcrumb a {
        color: var(--text-secondary);
        text-decoration: none;
        transition: color 0.2s;
      }

      .breadcrumb a:hover {
        color: var(--accent);
      }

      .breadcrumb li:last-child span {
        color: var(--text-primary);
        font-weight: 500;
      }
`;

let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// 处理单个工具文件
function processToolFile(toolId, tool) {
  const toolPath = path.join(rootDir, tool.path);

  if (!fs.existsSync(toolPath)) {
    console.warn(`⚠️  文件不存在: ${tool.path}`);
    skippedCount++;
    return;
  }

  try {
    let content = fs.readFileSync(toolPath, 'utf-8');

    // 检查是否已经有面包屑导航
    if (content.includes('class="breadcrumb"') || content.includes('BreadcrumbList')) {
      console.log(`⏭️  跳过（已有面包屑）: ${tool.name}`);
      skippedCount++;
      return;
    }

    const category = categories[tool.category];
    if (!category) {
      console.warn(`⚠️  分类不存在: ${tool.category} for ${tool.name}`);
      skippedCount++;
      return;
    }

    // 1. 在 </head> 前添加面包屑 JSON-LD
    const breadcrumbJSONLD = getBreadcrumbJSONLD(
      tool.category,
      category.name,
      tool.name,
      tool.path
    );
    content = content.replace('</head>', `${breadcrumbJSONLD}\n  </head>`);

    // 2. 在 <header> 后添加面包屑 HTML
    const breadcrumbHTML = getBreadcrumbHTML(
      tool.category,
      category.name,
      tool.name
    );
    content = content.replace(
      /(<\/header>)/,
      `$1\n\n${breadcrumbHTML}`
    );

    // 3. 在 </style> 前添加面包屑 CSS（如果还没有）
    if (!content.includes('/* 面包屑导航样式 */')) {
      content = content.replace('</style>', `${breadcrumbCSS}\n    </style>`);
    }

    // 写回文件
    fs.writeFileSync(toolPath, content, 'utf-8');
    processedCount++;
    console.log(`✅ ${processedCount}. ${tool.name}`);

  } catch (error) {
    console.error(`❌ 处理失败: ${tool.name}`, error.message);
    errorCount++;
  }
}

// 主函数
function main() {
  console.log('🚀 开始为工具页面添加面包屑导航...\n');

  const toolEntries = Object.entries(tools);
  console.log(`📊 总共 ${toolEntries.length} 个工具\n`);

  for (const [toolId, tool] of toolEntries) {
    processToolFile(toolId, tool);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 处理完成: ${processedCount} 个`);
  console.log(`⏭️  跳过: ${skippedCount} 个`);
  console.log(`❌ 失败: ${errorCount} 个`);
  console.log('='.repeat(50));
}

main();
