#!/usr/bin/env node
/**
 * scripts/update-tool-dates.cjs
 * 
 * 自动从 Git 历史读取各工具页面的最早提交日期（datePublished）和最新修改日期（dateModified），
 * 并自动注入/更新对应 HTML 页面中 JSON-LD (<script type="application/ld+json">) 的对应字段。
 *
 * 运行方式:
 *   node scripts/update-tool-dates.cjs [--dry-run] [--target=tools/media/image-cropper.html]
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DEFAULT_SITE_BIRTHDAY = '2026-04-02'; // 用户指定的官方网站正式发布日期
const CLAMP_MIN_DATE = '2026-04-02'; // 若开启 --clamp-to-launch，早于此日期的发布时间将校准为该官方基准日

// 解析命令行参数
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const clampToOfficialLaunch = args.includes('--clamp-to-launch');
const targetArg = args.find(a => a.startsWith('--target='));
const specificTarget = targetArg ? targetArg.split('=')[1].replace(/\\/g, '/') : null;

console.log(`[DateUpdater] 开始扫描 Git 历史... (Dry Run: ${isDryRun})`);

/**
 * 1. 一次性获取全量 Git 提交历史，构建各文件的最早与最新提交日期
 * 输出格式：
 *   COMMIT:YYYY-MM-DD
 *   relative/file/path.html
 */
function getGitFileDates() {
  const result = spawnSync('git', ['log', '--format=COMMIT:%cs', '--name-only'], {
    cwd: ROOT,
    maxBuffer: 100 * 1024 * 1024,
    encoding: 'utf8'
  });

  if (result.error || result.status !== 0) {
    throw new Error(`Git 执行失败: ${result.stderr || result.error}`);
  }

  const lines = result.stdout.split(/\r?\n/);
  const fileDates = new Map(); // relativePath -> { first: string, latest: string }
  let currentDate = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('COMMIT:')) {
      currentDate = trimmed.substring(7);
      continue;
    }

    if (!currentDate) continue;

    const normalizedPath = trimmed.replace(/\\/g, '/');
    if (!normalizedPath.endsWith('.html')) continue;

    if (!fileDates.has(normalizedPath)) {
      // 因为 git log 是从最新向最旧遍历，第一次遇到的就是最新修改日期
      fileDates.set(normalizedPath, {
        latest: currentDate,
        first: currentDate
      });
    } else {
      // 随着往后遍历，不断刷新最早日期
      const record = fileDates.get(normalizedPath);
      record.first = currentDate;
    }
  }

  return fileDates;
}

/**
 * 2. 递归遍历 tools/ 目录下的所有 HTML 文件
 */
function getHtmlFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      getHtmlFiles(fullPath, acc);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      acc.push(fullPath);
    }
  }
  return acc;
}

/**
 * 3. 更新单页面中的 JSON-LD 日期字段
 */
function updateDatesInHtml(htmlContent, { datePublished, dateModified }) {
  let modified = false;

  // 匹配所有 <script type="application/ld+json">...</script>
  const jsonLdRegex = /(<script\s+type=["']application\/ld\+json["']>)([\s\S]*?)(<\/script>)/gi;

  const newHtml = htmlContent.replace(jsonLdRegex, (match, openTag, jsonText, closeTag) => {
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      // 如果是非标准 JSON（如含注释），跳过
      return match;
    }

    // 针对支持日期的目标 Schema 类型进行处理（主要包括 WebApplication, TechArticle, Article, HowTo 等）
    const targetTypes = ['WebApplication', 'TechArticle', 'Article', 'HowTo', 'WebPage'];
    
    // 如果是单个对象或数组
    let updated = false;

    function processObject(obj) {
      if (!obj || typeof obj !== 'object') return;
      const type = obj['@type'];
      if (type && (targetTypes.includes(type) || (Array.isArray(type) && targetTypes.some(t => type.includes(t))))) {
        obj.datePublished = obj.datePublished || datePublished;
        obj.dateModified = dateModified;
        updated = true;
      }
    }

    if (Array.isArray(data)) {
      data.forEach(processObject);
    } else {
      processObject(data);
    }

    if (updated) {
      modified = true;
      // 保持原有缩进格式输出
      return `${openTag}\n${JSON.stringify(data, null, 2)}\n    ${closeTag}`;
    }

    return match;
  });

  return { newHtml, modified };
}

// 主流程
try {
  const gitDates = getGitFileDates();
  console.log(`[DateUpdater] 成功解析 Git 历史记录，共覆盖 ${gitDates.size} 个 HTML 文件`);

  const toolsDir = path.join(ROOT, 'tools');
  const allToolFiles = specificTarget 
    ? [path.join(ROOT, specificTarget)] 
    : getHtmlFiles(toolsDir);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const absPath of allToolFiles) {
    const relPath = path.relative(ROOT, absPath).replace(/\\/g, '/');
    const gitInfo = gitDates.get(relPath);

    // 如果 Git 记录不存在，降级使用站点基准日期与当前日期
    let datePublished = gitInfo ? gitInfo.first : DEFAULT_SITE_BIRTHDAY;
    const dateModified = gitInfo ? gitInfo.latest : new Date().toISOString().split('T')[0];

    // 如果开启了 --clamp-to-launch，且代码创建时间早于你提到的网站正式对外发布日 2026-04-02，校准为发布日
    if (clampToOfficialLaunch && datePublished < CLAMP_MIN_DATE) {
      datePublished = CLAMP_MIN_DATE;
    }

    const content = fs.readFileSync(absPath, 'utf8');
    const { newHtml, modified } = updateDatesInHtml(content, { datePublished, dateModified });

    if (modified) {
      updatedCount++;
      if (isDryRun) {
        console.log(`[DRY-RUN] 更新: ${relPath} -> published: ${datePublished}, modified: ${dateModified}`);
      } else {
        fs.writeFileSync(absPath, newHtml, 'utf8');
      }
    } else {
      skippedCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(` 处理完成:`);
  console.log(` - 成功更新文件数: ${updatedCount}`);
  console.log(` - 未变更/无对应 Schema 文件数: ${skippedCount}`);
  console.log(`========================================\n`);

} catch (err) {
  console.error('[DateUpdater] 发生异常:', err);
  process.exit(1);
}
