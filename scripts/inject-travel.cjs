const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'tools', 'travel');
const tag = 'travel-common.js';

fs.readdirSync(dir)
  .filter((f) => f.endsWith('.html'))
  .forEach((file) => {
    const full = path.join(dir, file);
    let content = fs.readFileSync(full, 'utf8');
    if (content.includes(tag)) return;
    content = content.replace(/<\/body>/i, `  <script src="./${tag}"></script>\n</body>`);
    fs.writeFileSync(full, content, 'utf8');
    console.log('updated', file);
  });
