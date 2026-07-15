const fs = require('fs');
const path = require('path');
const t = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tools.json'), 'utf8'));
const cats = Object.keys(t.categories || {});
const bad = [];
const all = [];
for (const id of cats) {
  const fp = path.join(__dirname, '..', 'tools', id, 'index.html');
  if (!fs.existsSync(fp)) continue;
  const h = fs.readFileSync(fp, 'utf8');
  const m = h.match(/name="description"\s+content="([^"]+)"/);
  const d = m ? m[1] : '';
  const len = [...d].length;
  const rep = /(免费在线使用[，,]浏览器本地处理[，,]无需注册[。.]?){2,}/.test(d);
  const item = { id, len, rep, d };
  all.push(item);
  if (!d || len < 120 || len > 160 || rep) bad.push({ id, len, rep, sample: d.slice(0, 120) });
}
const uniq = new Set(all.map((x) => x.d));
console.log(
  JSON.stringify(
    {
      total: all.length,
      badCount: bad.length,
      bad,
      unique: uniq.size,
      samples: all.filter((x) => ['seo', 'dev', 'generator', 'extractor', 'pets', 'ai'].includes(x.id)),
    },
    null,
    2
  )
);
