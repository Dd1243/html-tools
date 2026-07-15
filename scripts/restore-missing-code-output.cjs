/**
 * Restore missing output panels for pages that still reference codeOutput in JS
 * but lost the markup (nginx-generator family and similar).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

function bodyWithoutScripts(html) {
  const m = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const body = m ? m[1] : html;
  return body.replace(/<script\b[\s\S]*?<\/script>/gi, ' ');
}

function hasIdInBody(html, id) {
  return new RegExp(`id=["']${id}["']`).test(bodyWithoutScripts(html));
}

function extractOutputPanelFromHistory(file, commit = '8a358c9b') {
  try {
    const hist = execSync(`git show ${commit}:${file}`, {
      encoding: 'utf8',
      maxBuffer: 5e6,
      cwd: root,
    });
    // Prefer output-panel section containing codeOutput
    const re =
      /<section\b[^>]*class=["'][^"']*\boutput-panel\b[^"']*["'][^>]*>[\s\S]*?<\/section>/i;
    const m = hist.match(re);
    if (m && /id=["']codeOutput["']/.test(m[0])) return m[0];

    // fallback: code-card around codeOutput
    const re2 =
      /<div\b[^>]*class=["'][^"']*\bcode-card\b[^"']*["'][^>]*>[\s\S]*?id=["']codeOutput["'][\s\S]*?<\/div>\s*<\/div>/i;
    const m2 = hist.match(re2);
    if (m2) return m2[0];

    // broader: from code-header to pre#codeOutput container
    const idx = hist.indexOf('id="codeOutput"');
    if (idx > 0) {
      // walk back to nearest section/div open with output-panel or code-card
      const startCandidates = [
        hist.lastIndexOf('<section', idx),
        hist.lastIndexOf('<div class="code-card"', idx),
        hist.lastIndexOf("<div class='code-card'", idx),
      ].filter((n) => n >= 0);
      const start = Math.max(...startCandidates, -1);
      if (start >= 0) {
        // find matching close for section if section
        if (hist.slice(start, start + 8).toLowerCase() === '<section') {
          const end = hist.indexOf('</section>', idx);
          if (end > 0) return hist.slice(start, end + '</section>'.length);
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}

function sanitizeRestoredPanel(panelHtml) {
  // remove ad placeholders from restored markup
  return panelHtml
    .replace(/<div\b[^>]*class=["'][^"']*\bads-container\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/\r\n/g, '\n');
}

function ensureChineseLabels(panelHtml) {
  // if mojibake labels appear, rewrite known buttons/labels
  let p = panelHtml;
  if (/澶嶅埗|閰嶇疆|鍚/.test(p) || !/复制配置|nginx\.conf/.test(p)) {
    // rebuild a clean standard panel if corrupted
    if (/id=["']codeOutput["']/.test(p)) {
      return `        <section class="output-panel">
          <div class="code-card">
            <div class="code-header">
              <span class="code-label">nginx.conf (Server Block)</span>
              <button class="copy-btn" onclick="copyCode()">复制配置</button>
            </div>
            <pre id="codeOutput"></pre>
          </div>
        </section>`;
    }
  }
  // ensure copy button text if present but garbled
  p = p.replace(/>\s*[^<]{0,20}\s*<\/button>/i, (m) => {
    if (/copyCode|copy-btn/.test(panelHtml)) return '>复制配置</button>';
    return m;
  });
  return p;
}

function defaultNginxPanel() {
  return `        <section class="output-panel">
          <div class="code-card">
            <div class="code-header">
              <span class="code-label">nginx.conf (Server Block)</span>
              <button class="copy-btn" onclick="copyCode()">复制配置</button>
            </div>
            <pre id="codeOutput"></pre>
          </div>
        </section>`;
}

function insertBeforeMainClose(html, panel) {
  // Prefer insert before the first </main> that follows main-grid / main content
  if (/<\/aside>\s*<\/main>/i.test(html)) {
    return html.replace(/<\/aside>\s*<\/main>/i, `</aside>\n\n${panel}\n      </main>`);
  }
  if (/<\/main>/i.test(html)) {
    return html.replace(/<\/main>/i, `${panel}\n      </main>`);
  }
  // fallback before footer
  if (/<footer\b/i.test(html)) {
    return html.replace(/<footer\b/i, `${panel}\n\n    <footer`);
  }
  return null;
}

const targets = [
  'tools/dev/nginx-generator.html',
  'tools/dev/nginx-config-generator.html',
  'tools/dev/nginx-config.html',
  'tools/security/robots-generator.html',
  'tools/security/sitemap-generator.html',
];

const results = [];

for (const rel of targets) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) {
    results.push({ rel, status: 'missing-file' });
    continue;
  }
  let html = fs.readFileSync(fp, 'utf8');
  if (hasIdInBody(html, 'codeOutput')) {
    results.push({ rel, status: 'already-ok' });
    continue;
  }

  // only fix if JS still expects codeOutput
  if (!/getElementById\(\s*['"]codeOutput['"]\s*\)/.test(html) && !/\.output-panel\s*\{/.test(html)) {
    results.push({ rel, status: 'skip-no-js' });
    continue;
  }

  let panel = extractOutputPanelFromHistory(rel);
  if (panel) {
    panel = ensureChineseLabels(sanitizeRestoredPanel(panel));
  } else {
    panel = defaultNginxPanel();
  }

  // For non-nginx pages, try to keep history panel if readable
  if (!/nginx/i.test(rel) && panel.includes('nginx.conf')) {
    // try history again for page-specific labels
    const histPanel = extractOutputPanelFromHistory(rel);
    if (histPanel && /codeOutput/.test(histPanel)) {
      panel = ensureChineseLabels(sanitizeRestoredPanel(histPanel));
      // if still nginx-looking wrongly, build generic
      if (/nginx\.conf/.test(panel) && !/nginx/i.test(rel)) {
        const label = /robots/i.test(rel)
          ? 'robots.txt'
          : /sitemap/i.test(rel)
            ? 'sitemap.xml'
            : 'output';
        panel = `        <section class="output-panel">
          <div class="code-card">
            <div class="code-header">
              <span class="code-label">${label}</span>
              <button class="copy-btn" onclick="copyCode()">复制</button>
            </div>
            <pre id="codeOutput"></pre>
          </div>
        </section>`;
      }
    }
  }

  const before = html;
  const next = insertBeforeMainClose(html, panel);
  if (!next || next === before) {
    results.push({ rel, status: 'insert-failed' });
    continue;
  }
  html = next;

  // safety
  if (!hasIdInBody(html, 'codeOutput')) {
    results.push({ rel, status: 'still-missing-id' });
    continue;
  }
  if (html.length < before.length * 0.9) {
    results.push({ rel, status: 'abort-shrink' });
    continue;
  }

  fs.writeFileSync(fp, html, 'utf8');
  results.push({ rel, status: 'restored', delta: html.length - before.length });
}

// package-json pages may need different structure; inspect separately if still missing
for (const rel of ['tools/dev/package-json-editor.html', 'tools/dev/package-json-gen.html']) {
  const fp = path.join(root, rel);
  if (!fs.existsSync(fp)) continue;
  const html = fs.readFileSync(fp, 'utf8');
  if (hasIdInBody(html, 'codeOutput')) {
    results.push({ rel, status: 'already-ok' });
    continue;
  }
  if (!/getElementById\(\s*['"]codeOutput['"]\s*\)/.test(html)) {
    results.push({ rel, status: 'skip-no-js' });
    continue;
  }
  // try history extract any element with codeOutput
  try {
    const hist = execSync(`git show 8a358c9b:${rel}`, { encoding: 'utf8', maxBuffer: 5e6, cwd: root });
    const idx = hist.indexOf('id="codeOutput"');
    if (idx < 0) {
      results.push({ rel, status: 'no-history-output' });
      continue;
    }
    // grab surrounding block (pre or textarea)
    const start = hist.lastIndexOf('<', idx);
    // expand to parent div if possible
    const parent = hist.lastIndexOf('<div', idx);
    let block = '';
    if (parent >= 0 && idx - parent < 500) {
      // find close pre/textarea first
      const tagMatch = hist.slice(start).match(/^<(pre|textarea|code)\b[^>]*>/i);
      if (tagMatch) {
        const tag = tagMatch[1];
        const end = hist.indexOf(`</${tag}>`, idx);
        // include a wrapper if code-card-like
        const wrapStart = hist.lastIndexOf('<div', start);
        const wrapEnd = hist.indexOf('</div>', end);
        if (wrapStart >= 0 && wrapEnd > end && end - wrapStart < 2000) {
          // climb one more if header exists
          block = hist.slice(wrapStart, wrapEnd + 6);
        } else {
          block = hist.slice(start, end + tag.length + 3);
        }
      }
    }
    if (!block) {
      // generic insert
      block = `        <div class="code-card">
          <div class="code-header">
            <span class="code-label">package.json</span>
            <button class="copy-btn" onclick="copyCode()">复制</button>
          </div>
          <pre id="codeOutput"></pre>
        </div>`;
    }
    // fix mojibake by rebuilding if needed
    if (/澶|鍚|閰/.test(block) || !/codeOutput/.test(block)) {
      block = `        <div class="code-card">
          <div class="code-header">
            <span class="code-label">package.json</span>
            <button class="copy-btn" onclick="copyCode()">复制</button>
          </div>
          <pre id="codeOutput"></pre>
        </div>`;
    }
    const next = insertBeforeMainClose(html, block) || html.replace(/<\/main>/i, `${block}\n      </main>`);
    if (next && hasIdInBody(next, 'codeOutput')) {
      fs.writeFileSync(fp, next, 'utf8');
      results.push({ rel, status: 'restored', delta: next.length - html.length });
    } else {
      results.push({ rel, status: 'insert-failed' });
    }
  } catch {
    results.push({ rel, status: 'history-error' });
  }
}

console.log(JSON.stringify({ results }, null, 2));
