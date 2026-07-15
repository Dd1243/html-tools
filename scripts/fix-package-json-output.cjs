const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

function extractBetween(html, startMarker, endMarker) {
  const i = html.indexOf(startMarker);
  if (i < 0) return null;
  const j = html.indexOf(endMarker, i);
  if (j < 0) return null;
  return html.slice(i, j + endMarker.length);
}

function restoreFromHistory(rel, commit = '8a358c9b') {
  const hist = execSync(`git show ${commit}:${rel}`, {
    encoding: 'utf8',
    maxBuffer: 5e6,
    cwd: root,
  });
  const cur = fs.readFileSync(path.join(root, rel), 'utf8');

  // Get historical main-grid content after first aside ends through </main>
  // More robust: find codeOutput parent panel in history
  let panel = null;

  // Try section.output-panel
  const m1 = hist.match(
    /<section\b[^>]*class=["'][^"']*\boutput-panel\b[^"']*["'][^>]*>[\s\S]*?<\/section>/i
  );
  if (m1) panel = m1[0];

  // Try div with code-card containing codeOutput and installCmd if any
  if (!panel) {
    const idx = hist.indexOf('id="codeOutput"');
    if (idx > 0) {
      // find start of right panel - often <section or <div class="output
      let start = hist.lastIndexOf('<section', idx);
      if (start < 0 || idx - start > 1500) start = hist.lastIndexOf('<div class="output', idx);
      if (start < 0 || idx - start > 1500) start = hist.lastIndexOf('<div class="code-card"', idx);
      if (start >= 0) {
        // close tag
        if (hist.slice(start, start + 8).toLowerCase() === '<section') {
          const end = hist.indexOf('</section>', idx);
          if (end > 0) panel = hist.slice(start, end + 10);
        } else {
          // approximate: take until before </main>
          const endMain = hist.indexOf('</main>', idx);
          // walk div depth from start
          let depth = 0;
          let end = start;
          const slice = hist.slice(start, endMain > 0 ? endMain : start + 3000);
          // simpler: from start to </main>
          if (endMain > start) panel = hist.slice(start, endMain).trim();
        }
      }
    }
  }

  if (!panel) {
    // build minimal based on JS needs
    const needsInstall = /getElementById\(\s*['"]installCmd['"]\s*\)/.test(cur);
    panel = `        <section class="output-panel">
          <div class="code-card">
            <div class="code-header">
              <span class="code-label">package.json</span>
              <div class="btn-group">
                <button class="btn btn-secondary" onclick="copyJSON()">复制</button>
                <button class="btn" onclick="downloadJSON()">下载</button>
              </div>
            </div>
            <pre id="codeOutput"></pre>
          </div>
          ${
            needsInstall
              ? `<div class="code-card" style="margin-top:12px">
            <div class="code-header">
              <span class="code-label">安装命令</span>
              <button class="btn btn-secondary" onclick="copyInstall()">复制</button>
            </div>
            <pre id="installCmd"></pre>
          </div>`
              : ''
          }
        </section>`;
  } else {
    // sanitize mojibake - if garbled, rebuild clean panel keeping structure if possible
    if (/澶|鍚|閰|缂/.test(panel)) {
      const needsInstall = /installCmd/.test(panel) || /getElementById\(\s*['"]installCmd['"]\s*\)/.test(cur);
      panel = `        <section class="output-panel">
          <div class="code-card">
            <div class="code-header">
              <span class="code-label">package.json</span>
              <div class="btn-group">
                <button class="btn btn-secondary" onclick="copyJSON()">复制</button>
                <button class="btn" onclick="downloadJSON()">下载</button>
              </div>
            </div>
            <pre id="codeOutput"></pre>
          </div>
          ${
            needsInstall
              ? `<div class="code-card" style="margin-top:12px">
            <div class="code-header">
              <span class="code-label">安装命令</span>
              <button class="btn btn-secondary" onclick="copyInstall()">复制</button>
            </div>
            <pre id="installCmd"></pre>
          </div>`
              : ''
          }
        </section>`;
    }
  }

  // Remove broken inserted fragment between </aside> and </main>
  let html = cur;
  // remove any incomplete block currently between last aside and main close
  html = html.replace(
    /<\/aside>\s*[\s\S]*?<\/main>/i,
    `</aside>\n\n${panel}\n      </main>`
  );

  // safety
  if (!/id=["']codeOutput["']/.test(html.replace(/<script[\s\S]*?<\/script>/gi, ' '))) {
    throw new Error('codeOutput missing after fix: ' + rel);
  }
  fs.writeFileSync(path.join(root, rel), html, 'utf8');
  return { rel, panelPreview: panel.slice(0, 180).replace(/\s+/g, ' ') };
}

const out = [];
for (const rel of ['tools/dev/package-json-gen.html', 'tools/dev/package-json-editor.html']) {
  out.push(restoreFromHistory(rel));
}
console.log(JSON.stringify(out, null, 2));
