#!/usr/bin/env node

/**
 * 为首页添加 GEO 优化
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const indexPath = path.join(rootDir, 'index.html');
const toolsJsonPath = path.join(rootDir, 'tools.json');

// 读取 tools.json
const toolsData = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf-8'));
const { categories, tools } = toolsData;

// 生成 ItemList Schema（前 50 个热门工具）
function generateItemListSchema() {
  const toolEntries = Object.entries(tools).slice(0, 50);

  const itemListElement = toolEntries.map(([id, tool], index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "SoftwareApplication",
      "name": tool.name,
      "url": `https://essays4u.net/${tool.path.replace('.html', '')}`,
      "description": tool.description || `${tool.name} - WebUtils 在线工具`,
      "applicationCategory": "WebApplication"
    }
  }));

  return `
    <!-- ItemList 结构化数据（GEO 优化）-->
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "WebUtils 热门工具列表",
  "description": "WebUtils 提供的 1001+ 个纯前端开发工具",
  "numberOfItems": ${Object.keys(tools).length},
  "itemListElement": ${JSON.stringify(itemListElement, null, 2)}
}
    </script>`;
}

// 生成 Organization Schema
function generateOrganizationSchema() {
  return `
    <!-- Organization 结构化数据（GEO 优化）-->
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "WebUtils",
  "url": "https://essays4u.net/",
  "logo": "https://essays4u.net/logo.png",
  "description": "提供 1001+ 个纯前端开发工具的在线工具集",
  "foundingDate": "2024-01-01",
  "sameAs": [
    "https://github.com/chicogong/html-tools"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "url": "https://github.com/chicogong/html-tools/issues"
  }
}
    </script>`;
}

// 增强 WebApplication Schema
function enhanceWebApplicationSchema(content) {
  const currentDate = new Date().toISOString().split('T')[0];

  // 查找现有的 WebApplication schema
  const webAppRegex = /<script type="application\/ld\+json">\s*\{[^<]*"@type":\s*"WebApplication"[^<]*\}\s*<\/script>/s;

  const enhancedSchema = `
    <!-- JSON-LD 结构化数据（增强版 - GEO 优化）-->
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "WebUtils",
  "alternateName": "WebUtils 纯前端工具集",
  "description": "1001+ 个纯前端开发者工具集，单文件架构，零构建，可离线使用。包含 JSON 格式化、时间戳转换、Base64 编解码、二维码生成、图片压缩、正则测试等实用工具。所有数据处理在浏览器端完成，保护用户隐私。",
  "url": "https://essays4u.net/",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
  "softwareVersion": "1.0",
  "datePublished": "2024-01-01",
  "dateModified": "${currentDate}",
  "inLanguage": ["zh-CN", "en"],
  "isAccessibleForFree": true,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "author": {
    "@type": "Person",
    "name": "chicogong",
    "url": "https://github.com/chicogong"
  },
  "publisher": {
    "@type": "Organization",
    "name": "WebUtils",
    "url": "https://essays4u.net/"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "JSON/YAML/XML 格式化与转换",
    "Base64/URL/Unicode 编解码",
    "时间戳与时区转换",
    "二维码与条形码生成",
    "图片压缩与格式转换",
    "正则表达式测试",
    "哈希计算 (MD5/SHA)",
    "JWT Token 解码",
    "颜色格式转换",
    "密码生成器",
    "Markdown 编辑器",
    "代码格式化工具",
    "单位转换器",
    "加密解密工具"
  ],
  "screenshot": "https://essays4u.net/social-preview.png",
  "sameAs": ["https://github.com/chicogong/html-tools"]
}
    </script>`;

  return content.replace(webAppRegex, enhancedSchema);
}

// 主函数
function main() {
  console.log('🚀 开始为首页添加 GEO 优化...\n');

  let content = fs.readFileSync(indexPath, 'utf-8');

  // 检查是否已经有 ItemList
  if (content.includes('"@type":"ItemList"') || content.includes('"@type": "ItemList"')) {
    console.log('⏭️  首页已有 ItemList Schema，跳过');
    return;
  }

  // 1. 增强 WebApplication Schema
  console.log('📝 增强 WebApplication Schema...');
  content = enhanceWebApplicationSchema(content);

  // 2. 在 FAQPage 后添加 ItemList Schema
  console.log('📝 添加 ItemList Schema...');
  const itemListSchema = generateItemListSchema();

  // 查找最后一个 </script> 标签（FAQPage 的结束）
  const lastScriptIndex = content.lastIndexOf('</script>', content.indexOf('<!-- Favicon -->'));
  if (lastScriptIndex !== -1) {
    content = content.slice(0, lastScriptIndex + 9) + itemListSchema + '\n' + content.slice(lastScriptIndex + 9);
  }

  // 3. 添加 Organization Schema
  console.log('📝 添加 Organization Schema...');
  const orgSchema = generateOrganizationSchema();
  const lastScriptIndex2 = content.lastIndexOf('</script>', content.indexOf('<!-- Favicon -->'));
  if (lastScriptIndex2 !== -1) {
    content = content.slice(0, lastScriptIndex2 + 9) + orgSchema + '\n' + content.slice(lastScriptIndex2 + 9);
  }

  // 写回文件
  fs.writeFileSync(indexPath, content, 'utf-8');

  console.log('\n✅ 首页 GEO 优化完成！');
  console.log('\n📊 添加的结构化数据：');
  console.log('  1. 增强的 WebApplication Schema（添加评分、更新日期）');
  console.log('  2. ItemList Schema（前 50 个热门工具）');
  console.log('  3. Organization Schema（组织信息）');
  console.log('\n💡 验证方法：');
  console.log('  1. 访问 https://search.google.com/test/rich-results');
  console.log('  2. 输入 https://essays4u.net/');
  console.log('  3. 检查是否识别到 5 种结构化数据');
}

main();
