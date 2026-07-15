/**
 * Force card-generator:
 * - default light (white) page theme
 * - card colors always start as pure #ffffff
 * - preview area light enough to show white card clearly
 * - ignore previous dark theme for first paint clarity
 */
const fs = require('fs');
const path = require('path');
const fp = path.join(__dirname, '..', 'tools/design/card-generator.html');
let html = fs.readFileSync(fp, 'utf8');

// 1) body starts light
html = html.replace(/<body([^>]*)>/i, (m, attrs) => {
  if (/data-theme=/.test(attrs)) {
    return `<body${attrs.replace(/data-theme="[^"]*"/, 'data-theme="light"')}>`;
  }
  return `<body data-theme="light"${attrs}>`;
});

// 2) preview area: light checker-ish / soft gray so white card is obvious
html = html.replace(
  /\.preview-area\s*\{[\s\S]*?overflow:\s*hidden;\s*\}/,
  `.preview-area {
        width: 100%;
        height: 400px;
        background:
          linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
          linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
          linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0;
        background-color: #fafafa;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
        position: relative;
        overflow: hidden;
      }`
);

// dark theme override for preview area
if (!html.includes('[data-theme="dark"] .preview-area') && !html.includes('body:not([data-theme="light"]) .preview-area')) {
  html = html.replace(
    /(\[data-theme="light"\]\s*\{[\s\S]*?\})/,
    `$1
      body:not([data-theme="light"]) .preview-area {
        background:
          linear-gradient(45deg, #1c1c24 25%, transparent 25%),
          linear-gradient(-45deg, #1c1c24 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #1c1c24 75%),
          linear-gradient(-45deg, transparent 75%, #1c1c24 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0;
        background-color: #12121a;
      }`
  );
}

// 3) preview-card CSS pure white defaults + fixed size so first paint is correct
html = html.replace(
  /\.preview-card\s*\{[\s\S]*?justify-content:\s*flex-end;\s*\}/,
  `.preview-card {
        width: 300px;
        height: 200px;
        background: #ffffff !important;
        transition: all 0.3s ease;
        padding: 24px;
        color: #1a1a1a !important;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 12px;
        box-shadow: 0 7.5px 15px rgba(0, 0, 0, 0.12);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }`
);

// 4) color inputs
html = html.replace(
  /id="color1" value="#[0-9a-fA-F]{3,8}"/,
  'id="color1" value="#ffffff"'
);
html = html.replace(
  /id="color2" value="#[0-9a-fA-F]{3,8}"/,
  'id="color2" value="#ffffff"'
);

// 5) inline style on card element as hard first-paint guarantee
html = html.replace(
  /<div class="preview-card" id="card">/,
  `<div class="preview-card" id="card" style="width:300px;height:200px;background:#ffffff;color:#1a1a1a;border:1px solid rgba(0,0,0,0.12);border-radius:12px;box-shadow:0 7.5px 15px rgba(0,0,0,0.12);padding:24px;display:flex;flex-direction:column;justify-content:flex-end;">`
);

// 6) theme default light; don't restore dark as default if unset
html = html.replace(
  /function toggleTheme\(\)\s*\{[\s\S]*?localStorage\.setItem\("theme", theme\);\s*\}/,
  `function toggleTheme() {
        const body = document.body;
        const theme = body.getAttribute("data-theme") === "light" ? "dark" : "light";
        body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
      }`
);

// replace init theme + updateCard call
if (html.includes('const savedTheme = localStorage.getItem("theme")')) {
  html = html.replace(
    /const savedTheme = localStorage\.getItem\("theme"\)[^;]*;[\s\S]*?updateCard\(\);/,
    `// Always start with white card colors; prefer light theme for white-card visibility
      const savedTheme = localStorage.getItem("theme");
      document.body.setAttribute("data-theme", savedTheme === "dark" ? "dark" : "light");
      // Force pure white defaults every load (user request)
      document.getElementById("color1").value = "#ffffff";
      document.getElementById("color2").value = "#ffffff";
      updateCard();`
  );
} else {
  // append force init before last updateCard if needed
  html = html.replace(
    /updateCard\(\);\s*<\/script>/,
    `document.body.setAttribute("data-theme", localStorage.getItem("theme") === "dark" ? "dark" : "light");
      document.getElementById("color1").value = "#ffffff";
      document.getElementById("color2").value = "#ffffff";
      updateCard();
    </script>`
  );
}

// Also lighten default :root to light palette so first paint without JS is white-ish
html = html.replace(
  /:root\s*\{[\s\S]*?--shadow:\s*0 2px 8px rgba\(0, 0, 0, 0\.3\);\s*\}/,
  `:root {
        --bg-deep: #fafafa;
        --bg-surface: #fff;
        --bg-card: #fff;
        --bg-input: #f5f5f5;
        --text-primary: #1a1a1a;
        --text-secondary: #666;
        --text-muted: #999;
        --border-subtle: #e5e5e5;
        --border-strong: #d5d5d5;
        --accent-cyan: #00d4b8;
        --accent-magenta: #e63975;
        --accent-green: #10b981;
        --accent-red: #f43f5e;
        --accent-yellow: #fbbf24;
        --accent-blue: #4cc9f0;
        --accent-purple: #7b2cbf;
        --radius-sm: 4px;
        --radius-md: 8px;
        --radius-lg: 12px;
        --font-sans:
          "Space Grotesk", -apple-system, blinkmacsystemfont, "Segoe UI", roboto, sans-serif;
        --font-mono: "JetBrains Mono", "Courier New", monospace;
        --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      [data-theme="dark"] {
        --bg-deep: #0a0a0f;
        --bg-surface: #12121a;
        --bg-card: #1a1a24;
        --bg-input: #0e0e14;
        --text-primary: #e8e8ed;
        --text-secondary: #8888a0;
        --text-muted: #55556a;
        --border-subtle: #2a2a3a;
        --border-strong: #3a3a4a;
        --accent-cyan: #00f5d4;
        --accent-magenta: #f72585;
        --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }`
);

// remove old light block if duplicate - keep one light block mapping
// The old [data-theme="light"] block can stay as no-op/same values

// Ensure updateCard removes !important conflict by setting properties properly
// and clears backgroundImage when solid white
html = html.replace(
  /function updateCard\(\) \{[\s\S]*?document\.getElementById\("codeOutput"\)\.textContent = css;\s*\}/,
  `function updateCard() {
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
        const same = String(c1).toLowerCase() === String(c2).toLowerCase();
        const isWhite =
          String(c1).toLowerCase() === "#ffffff" && String(c2).toLowerCase() === "#ffffff";
        const bg = same ? c1 : "linear-gradient(135deg, " + c1 + ", " + c2 + ")";
        const border = isWhite ? "1px solid rgba(0,0,0,0.12)" : "1px solid transparent";

        card.style.width = width + "px";
        card.style.height = height + "px";
        card.style.setProperty("background", bg, "important");
        card.style.borderRadius = radius + "px";
        card.style.boxShadow = "0 " + shadow / 2 + "px " + shadow + "px rgba(0,0,0,0.12)";
        card.style.setProperty("color", textColor, "important");
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
      }`
);

fs.writeFileSync(fp, html, 'utf8');

const out = fs.readFileSync(fp, 'utf8');
const ok = {
  color1: /id="color1" value="#ffffff"/.test(out),
  color2: /id="color2" value="#ffffff"/.test(out),
  cssWhite: out.includes('background: #ffffff !important'),
  inlineWhite: out.includes('id="card" style=') && out.includes('background:#ffffff'),
  forceJs: out.includes('document.getElementById("color1").value = "#ffffff"'),
  lightRoot: /:root\s*\{[\s\S]*?--bg-deep:\s*#fafafa/.test(out),
  noPurpleDefault: !out.includes('background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))'),
};
console.log(ok);
if (Object.values(ok).some((v) => !v)) process.exit(1);
