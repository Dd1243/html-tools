const fs = require('fs');
const { globSync } = require('glob');

// 递归查找所有 HTML 文件
const files = globSync('tools/**/*.html');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 修复 <h1>...</html> 的问题
    if (content.includes('<h1>') && content.includes('</html>')) {
        const newContent = content.replace(/<h1>(.*?)<\/html>/g, '<h1>$1</h1>');
        if (newContent !== content) {
            content = newContent;
            changed = true;
        }
    }

    // 移除 </footer> 之前的多余 </div>
    // 常见的错误模式是在 FAQ 块或 script 块之后多了一个 </div>
    const patterns = [
        /<\/style>\s*<\/div>\s*<footer/g,
        /<\/script>\s*<!-- FAQ.*?-->\s*<\/div>\s*<footer/g,
        /<\/script>\s*<\/div>\s*<footer/g,
        /<!-- FAQ.*?-->\s*<\/div>\s*<footer/g,
        /<\/script>\s*<!-- FAQ.*?-->\s*<\/div>\s*<\/body>/g,
        /<\/script>\s*<\/div>\s*<\/body>/g,
        /<!-- FAQ.*?-->\s*<\/div>\s*<\/body>/g
    ];

    patterns.forEach(pattern => {
        const newContent = content.replace(pattern, (match) => match.replace('</div>', ''));
        if (newContent !== content) {
            content = newContent;
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed structure in: ${file}`);
    }
});
