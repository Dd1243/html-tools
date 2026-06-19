#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDED_PATTERNS = [
  /^404\.html$/,
  /^ByteDanceVerify\.html$/,
  /^baidu_verify_/,
  /^BingSiteAuth\.xml$/,
  /^offline\.html$/,
  /^design-reference[\\/]/,
  /^design-templates[\\/]/,
  /^templates[\\/]/,
];

function getHtmlFiles(dir) {
  const files = [];
  const pending = [dir];
  const skipDirs = new Set(['.git', 'node_modules', 'screenshots', 'docs']);

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) pending.push(entryPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

function relative(filePath) {
  return path.relative(ROOT, filePath);
}

function isExcluded(filePath) {
  const rel = relative(filePath);
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(rel));
}

function isIndexable(html) {
  const robots = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*>/i);
  if (!robots) return true;
  const content = robots[0].match(/content=["']([^"']*)["']/i)?.[1] || '';
  return !/\bnoindex\b/i.test(content);
}

function splitRenderedSegments(html) {
  return html.split(/(<(?:script|style|textarea|template)\b[^>]*>[\s\S]*?<\/(?:script|style|textarea|template)>)/gi);
}

function isNonRenderedSegment(segment) {
  return /^<(?:script|style|textarea|template)\b/i.test(segment);
}

function getRenderedH1Texts(html) {
  const texts = [];
  for (const segment of splitRenderedSegments(html)) {
    if (isNonRenderedSegment(segment)) continue;
    for (const match of segment.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)) {
      texts.push(
        match[1]
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      );
    }
  }
  return texts;
}

function demoteRenderedH1s(html) {
  return splitRenderedSegments(html)
    .map((segment) => {
      if (isNonRenderedSegment(segment)) return segment;
      return segment.replace(/<h1\b/gi, '<h2').replace(/<\/h1>/gi, '</h2>');
    })
    .join('');
}

function decodeBasicEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function titleToH1(html, filePath) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
  let text = decodeBasicEntities(title)
    .replace(/\s*[|｜]\s*(WebUtils|Web工具箱|Web工具集).*$/i, '')
    .replace(/\s+[-–—]\s*(WebUtils|Web工具箱|Web工具集).*$/i, '')
    .trim();

  const dashParts = text.split(/\s+[-–—]\s+/).filter(Boolean);
  if (dashParts.length > 1 && [...dashParts[0]].length >= 2) {
    text = dashParts[0].trim();
  }

  if (!text) {
    text = path.basename(filePath, '.html').replace(/[-_]+/g, ' ');
  }

  return text;
}

function h1Markup(text, indent) {
  return `${indent}<header class="header">\n${indent}  <h1>${escapeHtml(text)}</h1>\n${indent}</header>\n`;
}

function insertH1(html, text) {
  const mainMatch = html.match(/(\n[ \t]*<main\b[^>]*>)[ \t]*(?:\n)?/i);
  if (mainMatch) {
    const indent = mainMatch[1].match(/\n([ \t]*)<main/i)?.[1] || '  ';
    return html.replace(mainMatch[0], `${mainMatch[1]}\n${h1Markup(text, `${indent}  `)}`);
  }

  const containerMatch = html.match(
    /(\n[ \t]*<div\b[^>]*class=["'][^"']*\bcontainer\b[^"']*["'][^>]*>)[ \t]*(?:\n)?/i
  );
  if (containerMatch) {
    const indent = containerMatch[1].match(/\n([ \t]*)<div/i)?.[1] || '  ';
    return html.replace(containerMatch[0], `${containerMatch[1]}\n${h1Markup(text, `${indent}  `)}`);
  }

  const bodyMatch = html.match(/(\n[ \t]*<body\b[^>]*>)[ \t]*(?:\n)?/i);
  if (bodyMatch) {
    const indent = bodyMatch[1].match(/\n([ \t]*)<body/i)?.[1] || '';
    return html.replace(bodyMatch[0], `${bodyMatch[1]}\n${h1Markup(text, `${indent}  `)}`);
  }

  return html;
}

let changed = 0;

for (const filePath of getHtmlFiles(ROOT)) {
  if (isExcluded(filePath)) continue;

  const original = fs.readFileSync(filePath, 'utf8');
  if (!isIndexable(original)) continue;

  const h1Texts = getRenderedH1Texts(original);
  const invalid =
    h1Texts.length !== 1 ||
    h1Texts.some((text) => text.length === 0 || /\$\{[^}]+\}/.test(text));

  if (!invalid) continue;

  const title = titleToH1(original, filePath);
  let html = original;

  if (h1Texts.length > 0) {
    html = demoteRenderedH1s(html);
  }

  html = insertH1(html, title);

  if (html !== original) {
    fs.writeFileSync(filePath, html);
    changed++;
    console.log(`fixed ${relative(filePath)} -> ${title}`);
  }
}

console.log(`\nUpdated ${changed} HTML files.`);
