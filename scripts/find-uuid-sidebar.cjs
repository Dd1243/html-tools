const { execSync } = require('child_process');
const commits = [
  'ef7c22bf',
  '8a358c9b',
  '99f25e1b',
  '77d1afa2',
  '9f3c123c',
  'aadb8954',
  '50659e76',
  '35d649cb',
];
for (const c of commits) {
  try {
    const html = execSync(`git show ${c}:tools/generator/uuid-generator.html`, {
      encoding: 'utf8',
      maxBuffer: 5e6,
    });
    console.log(
      c,
      'idType=',
      html.includes('id="idType"'),
      'themeBtn=',
      html.includes('id="themeBtn"'),
      'format=',
      html.includes('id="format"'),
      'count=',
      html.includes('id="count"')
    );
    if (html.includes('id="idType"')) {
      const i = html.indexOf('id="idType"');
      console.log(html.slice(Math.max(0, i - 400), i + 900));
      break;
    }
  } catch (e) {
    console.log(c, 'ERR', e.message.slice(0, 100));
  }
}
