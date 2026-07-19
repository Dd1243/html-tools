const fs = require('fs');

function check(file, requiredIds) {
  const h = fs.readFileSync(file, 'utf8');
  const body = h.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  const missing = requiredIds.filter((id) => !new RegExp(`id=["']${id}["']`).test(body));
  const css = {
    container: /max-width:\s*1120px/.test(h),
    grid: /max-width:\s*1080px/.test(h),
    lightBody: /data-theme=["']light["']/.test(h),
    defaultNotDark: !/\|\|\s*["']dark["']/.test(h),
  };
  // validate main script
  const scripts = h.match(/<script>([\s\S]*?)<\/script>/g) || [];
  let scriptOk = true;
  let scriptErr = '';
  for (const s of scripts) {
    const code = s.replace(/^<script>/, '').replace(/<\/script>$/, '');
    try {
      // eslint-disable-next-line no-new-func
      new Function(code);
    } catch (e) {
      scriptOk = false;
      scriptErr = e.message;
    }
  }
  return { file, missing, css, scriptOk, scriptErr };
}

console.log(
  JSON.stringify(
    [
      check('tools/generator/uuid-generator.html', [
        'idType',
        'format',
        'count',
        'singleIdDisplay',
        'batchOutput',
        'countDisplay',
      ]),
      check('tools/generator/qrcode-batch.html', [
        'batchInput',
        'countDisplay',
      ]),
    ],
    null,
    2
  )
);
