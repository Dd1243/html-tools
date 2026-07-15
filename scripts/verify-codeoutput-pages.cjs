const fs = require('fs');
const files = [
  'tools/dev/nginx-generator.html',
  'tools/dev/nginx-config.html',
  'tools/dev/nginx-config-generator.html',
  'tools/security/robots-generator.html',
  'tools/security/sitemap-generator.html',
  'tools/dev/package-json-gen.html',
  'tools/dev/package-json-editor.html',
];
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const body = h.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  console.log({
    f,
    codeOutput: /id=["']codeOutput["']/.test(body),
    installCmd: /id=["']installCmd["']/.test(body),
    outputPanel: /output-panel/.test(body),
    brokenFragment: /<\/aside>\s*<div class="btn-group">/.test(h),
  });
}
