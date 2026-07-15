const fs = require('fs');
const path = require('path');
const fp = path.join(__dirname, '..', 'tools/design/card-generator.html');
let html = fs.readFileSync(fp, 'utf8');

// 1) Force CSS default preview to white (remove purple gradient default)
html = html.replace(
  /\.preview-card\s*\{[\s\S]*?justify-content:\s*flex-end;\s*\}/,
  `.preview-card {
        background: #ffffff;
        transition: all 0.3s ease;
        padding: 24px;
        color: #1a1a1a;
        border: 1px solid rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }`
);

// 2) Ensure color inputs default to white
html = html.replace(
  /id="color1" value="#[0-9a-fA-F]{3,8}"/,
  'id="color1" value="#ffffff"'
);
html = html.replace(
  /id="color2" value="#[0-9a-fA-F]{3,8}"/,
  'id="color2" value="#ffffff"'
);

// 3) Ensure pickTextColor exists
if (!html.includes('function pickTextColor')) {
  html = html.replace(
    /function updateCard\(\) \{/,
    `function pickTextColor(c1, c2) {
        function lum(hex) {
          const h = hex.replace('#', '');
          const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
          const r = parseInt(full.slice(0, 2), 16) / 255;
          const g = parseInt(full.slice(2, 4), 16) / 255;
          const b = parseInt(full.slice(4, 6), 16) / 255;
          const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        }
        const avg = (lum(c1) + lum(c2)) / 2;
        return avg > 0.62 ? '#1a1a1a' : '#ffffff';
      }

      function updateCard() {`
  );
}

// 4) Normalize updateCard body for solid white default
const updateRe =
  /function updateCard\(\) \{[\s\S]*?document\.getElementById\("codeOutput"\)\.textContent = css;\s*\}/;
const updateFn = `function updateCard() {
        const c1 = document.getElementById("color1").value;
        const c2 = document.getElementById("color2").value;
        const width = document.getElementById("width").value;
        const height = document.getElementById("height").value;
        const radius = document.getElementById("radius").value;
        const shadow = document.getElementById("shadow").value;

        document.getElementById("widthVal").textContent = width;
        document.getElementById("heightVal").textContent = height;
        document.getElementById("radiusVal").textContent = radius;
        document.getElementById("shadowVal").textContent = shadow;

        const card = document.getElementById("card");
        const textColor = pickTextColor(c1, c2);
        const same = c1.toLowerCase() === c2.toLowerCase();
        const isWhite = c1.toLowerCase() === "#ffffff" && c2.toLowerCase() === "#ffffff";
        const bg = same ? c1 : "linear-gradient(135deg, " + c1 + ", " + c2 + ")";
        const border = isWhite ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent";

        card.style.width = width + "px";
        card.style.height = height + "px";
        card.style.background = bg;
        card.style.borderRadius = radius + "px";
        card.style.boxShadow = "0 " + shadow / 2 + "px " + shadow + "px rgba(0,0,0,0.12)";
        card.style.color = textColor;
        card.style.border = border;

        const css = [
          ".card {",
          "  width: " + width + "px;",
          "  height: " + height + "px;",
          "  background: " + bg + ";",
          "  border-radius: " + radius + "px;",
          "  box-shadow: 0 " + shadow / 2 + "px " + shadow + "px rgba(0,0,0,0.12);",
          "  padding: 24px;",
          "  color: " + textColor + ";",
          "  border: " + border + ";",
          "  display: flex;",
          "  flex-direction: column;",
          "  justify-content: flex-end;",
          "}",
        ].join("\\n");

        document.getElementById("codeOutput").textContent = css;
      }`;

if (!updateRe.test(html)) {
  console.error('updateCard block not found');
  process.exit(1);
}
html = html.replace(updateRe, updateFn);

fs.writeFileSync(fp, html, 'utf8');

const out = fs.readFileSync(fp, 'utf8');
const checks = {
  purpleCss: out.includes('var(--accent-purple), var(--accent-cyan)'),
  whiteCss: /\.preview-card\s*\{[\s\S]*?background:\s*#ffffff/.test(out),
  color1: /id="color1" value="#ffffff"/.test(out),
  color2: /id="color2" value="#ffffff"/.test(out),
  pick: out.includes('function pickTextColor'),
  update: out.includes('const isWhite'),
  badTemplate: out.includes('color: ${textColor}'),
};
console.log(checks);
if (checks.purpleCss || !checks.whiteCss || !checks.color1 || !checks.color2 || checks.badTemplate) {
  process.exit(1);
}
