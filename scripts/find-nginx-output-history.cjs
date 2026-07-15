const { execSync } = require('child_process');
const commits = execSync('git log --oneline -n 40 -- tools/dev/nginx-generator.html', {
  encoding: 'utf8',
})
  .trim()
  .split(/\r?\n/)
  .map((l) => l.split(' ')[0]);

for (const c of commits) {
  try {
    const html = execSync(`git show ${c}:tools/dev/nginx-generator.html`, {
      encoding: 'utf8',
      maxBuffer: 5e6,
    });
    const hasCodeOutput = html.includes('id="codeOutput"') || html.includes("id='codeOutput'");
    const hasOutputPanel = /class=["'][^"']*output-panel/.test(html);
    const mainIdx = html.indexOf('<main class="main-grid">');
    const mainEnd = html.indexOf('</main>', mainIdx);
    const mainChunk = mainIdx >= 0 && mainEnd > mainIdx ? html.slice(mainIdx, mainEnd + 7) : '';
    console.log(
      c,
      'codeOutput=',
      hasCodeOutput,
      'outputPanel=',
      hasOutputPanel,
      'mainLen=',
      mainChunk.length,
      'asideCount=',
      (mainChunk.match(/<aside\b/gi) || []).length
    );
    if (hasCodeOutput) {
      const i = html.indexOf('codeOutput');
      console.log('  snippet:', html.slice(Math.max(0, i - 200), i + 200).replace(/\s+/g, ' '));
      break;
    }
  } catch (e) {
    console.log(c, 'ERR', e.message.slice(0, 80));
  }
}
