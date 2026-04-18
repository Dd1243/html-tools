const fs = require('fs');
const path = require('path');

const template = (tool) => `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${tool.title} - 一键在线计算与评测 | WebUtils</title>
    <meta name="description" content="${tool.description}" />
    <meta name="keywords" content="${tool.keywords}" />
    <link rel="canonical" href="https://essays4u.net/tools/realestate/${tool.slug}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${tool.title} - 在线房产计算工具" />
    <meta property="og:description" content="${tool.description}" />
    <meta property="og:url" content="https://essays4u.net/tools/realestate/${tool.slug}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${tool.title} - 在线房产计算工具" />
    <meta name="twitter:description" content="${tool.description}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "${tool.title}",
      "description": "${tool.description}",
      "url": "https://essays4u.net/tools/realestate/${tool.slug}",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All"
    }
    </script>

    <style>
      :root {
        --primary-color: #007acc;
        --primary-hover: #005f99;
        --bg-color: #f9f9f9;
        --card-bg: #ffffff;
        --text-main: #333333;
        --text-muted: #666666;
        --border-color: #dddddd;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        --radius: 6px;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        color: var(--text-main);
        background: var(--bg-color);
      }

      .container {
        width: 95%;
        max-width: 1200px;
        margin: 0 auto;
      }

      .site-header {
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 100;
      }
      .site-header .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
      }
      .logo a {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--primary-color);
        text-decoration: none;
      }
      .site-nav ul {
        display: flex;
        list-style: none;
        gap: 20px;
      }
      .site-nav a {
        text-decoration: none;
        color: var(--text-muted);
        font-weight: 500;
        font-size: 0.95rem;
      }
      .site-nav a:hover {
        color: var(--primary-color);
      }

      main.container {
        display: flex;
        flex-direction: column;
        gap: 25px;
        padding: 30px 0;
      }
      @media (min-width: 992px) {
        main.container {
          flex-direction: row;
          align-items: flex-start;
        }
      }

      .tool-section {
        flex: 3;
        background: var(--card-bg);
        padding: 25px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }
      .tool-header {
        margin-bottom: 20px;
        border-bottom: 2px solid var(--bg-color);
        padding-bottom: 15px;
      }
      .tool-header h1 {
        font-size: 1.8rem;
        color: #111;
        margin-bottom: 8px;
      }
      .tool-header p {
        color: var(--text-muted);
        font-size: 0.95rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
      }
      @media (min-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      .form-group {
        margin-bottom: 15px;
      }
      .form-group.full-width {
        grid-column: 1 / -1;
      }
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .form-control, select.form-control {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        font-size: 0.95rem;
      }
      .form-control:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
      }
      .input-group {
        display: flex;
        align-items: center;
      }
      .input-group .form-control {
        border-right: none;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      .input-group-addon {
        background: #f1f1f1;
        border: 1px solid var(--border-color);
        padding: 10px 15px;
        font-size: 0.95rem;
        border-top-right-radius: var(--radius);
        border-bottom-right-radius: var(--radius);
        color: #555;
      }

      .btn {
        padding: 10px 20px;
        border-radius: var(--radius);
        border: none;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.2s;
        display: inline-block;
        text-align: center;
      }
      .btn-primary {
        background: var(--primary-color);
        color: #fff;
        width: 100%;
        padding: 12px;
        font-size: 1rem;
        margin-top: 10px;
      }
      .btn-primary:hover {
        background: var(--primary-hover);
        transform: translateY(-1px);
      }
      
      .result-box {
        background: #f0f7ff;
        border: 1px solid #cce5ff;
        padding: 20px;
        border-radius: var(--radius);
        margin-top: 25px;
        display: none;
      }
      .result-box.active {
        display: block;
        animation: fadeIn 0.3s;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .result-box h3 {
        color: var(--primary-color);
        margin-bottom: 15px;
        border-bottom: 1px dashed #cce5ff;
        padding-bottom: 10px;
      }
      .result-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
      }
      @media (min-width: 768px) {
        .result-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      .result-item {
        background: #fff;
        padding: 15px;
        border-radius: var(--radius);
        border: 1px solid #e1eaf5;
      }
      .result-item-title {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-bottom: 5px;
      }
      .result-item-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #d9534f;
      }
      .result-item-value.green {
        color: #5cb85c;
      }

      .sidebar-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .article-card {
        background: var(--card-bg);
        padding: 20px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }
      .article-card h2 {
        font-size: 1.2rem;
        margin-bottom: 15px;
        color: #111;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .article-card h2::before {
        content: "";
        display: inline-block;
        width: 4px;
        height: 18px;
        background: var(--primary-color);
        border-radius: 2px;
      }
      .article-card p, .article-card li {
        font-size: 0.9rem;
        color: var(--text-main);
        margin-bottom: 10px;
        line-height: 1.6;
      }
      .article-card ul {
        padding-left: 20px;
      }

      .ad-placeholder {
        background: #f0f2f5;
        border: 1px dashed #ccc;
        color: #999;
        text-align: center;
        padding: 20px;
        border-radius: var(--radius);
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ad-top { min-height: 90px; margin-bottom: 20px; }
      .ad-sidebar { min-height: 250px; }
      .ad-middle { min-height: 120px; margin: 25px 0; }

      .site-footer {
        background: #2c3e50;
        color: #ecf0f1;
        padding: 40px 0 20px;
        margin-top: 50px;
      }
      .footer-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 30px;
        margin-bottom: 30px;
      }
      .footer-section h3 {
        font-size: 1.1rem;
        margin-bottom: 15px;
        color: #fff;
      }
      .footer-section ul { list-style: none; }
      .footer-section li { margin-bottom: 8px; }
      .footer-section a {
        color: #bdc3c7;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .footer-section a:hover { color: #fff; }
      .footer-bottom {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 20px;
        text-align: center;
        font-size: 0.85rem;
        color: #95a5a6;
      }

      @media (max-width: 768px) {
        .tool-header h1 { font-size: 1.5rem; }
      }
      ${tool.extraCss || ''}
    </style>
  </head>
  <body>
    <header class="site-header">
      <div class="container">
        <div class="logo"><a href="../../index.html">WebUtils</a></div>
        <nav class="site-nav">
          <ul>
            <li><a href="../../index.html">首页</a></li>
            <li><a href="mortgage.html">房贷计算</a></li>
            <li><a href="rent-vs-buy.html">租房买房</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="container">
      <div class="tool-section">
        <div class="ad-placeholder ad-top">广告位 - 顶部横幅 (AdSense Placeholder)</div>

        <div class="tool-header">
          <h1>${tool.title}</h1>
          <p>${tool.description}</p>
        </div>

        ${tool.htmlContent}

        <!-- SEO 内容 -->
        <section style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 30px">
          ${tool.seoArticle}
        </section>
      </div>

      <aside class="sidebar-section">
        <div class="article-card">
          <h2>使用指南</h2>
          ${tool.sidebarGuide}
        </div>

        <div class="ad-placeholder ad-sidebar">广告位 - 侧边栏 (AdSense Placeholder)</div>

        <div class="article-card">
          <h2>相关房产工具</h2>
          <ul>
            <li><a href="mortgage.html">房贷计算器</a></li>
            <li><a href="combo-loan.html">组合贷款计算器</a></li>
            <li><a href="lpr-calc.html">LPR房贷计算器</a></li>
            <li><a href="prepayment.html">提前还贷计算器</a></li>
            <li><a href="deed-tax.html">契税计算器</a></li>
            <li><a href="property-tax.html">房产税计算器</a></li>
          </ul>
        </div>
      </aside>
    </main>

    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>关于 WebUtils</h3>
            <p style="font-size: 0.85rem; color: #bdc3c7">
              WebUtils 专注于为您提供轻量、高效、私密的在线工具体验。纯前端运行，绝不收集用户数据。
            </p>
          </div>
          <div class="footer-section">
            <h3>快速导航</h3>
            <ul>
              <li><a href="../../index.html">返回首页</a></li>
              <li><a href="https://github.com/chicogong/html-tools" target="_blank">获取源码</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">&copy; 2024 WebUtils - 每一位创作者的效率加速器.</div>
      </div>
    </footer>

    <script>
      ${tool.jsContent}
    </script>
  </body>
</html>`;

const tools = [
  {
    slug: 'loan-compare',
    title: '房贷方案对比计算器 - 在线对比多种还款方案',
    description: '通过在一张图表中同时对比多套房贷方案（等额本息 vs 等额本金，不同利率，不同贷款年限），直观展示利息差额，帮您做出最优的贷款决策。',
    keywords: '房贷对比计算器,贷款方案比较,等额本息和等额本金对比,买房贷款对比',
    htmlContent: `
      <div style="background:#f5f8fc; padding:15px; border-radius:6px; margin-bottom:20px; font-size:0.9rem;">
        填写方案A和方案B的贷款参数，系统将自动对二者进行差异计算。
      </div>
      <div class="form-grid">
        <div class="form-group full-width">
          <h4 style="border-bottom:2px solid var(--primary-color); display:inline-block; margin-bottom:10px;">方案 A</h4>
        </div>
        <div class="form-group">
          <label>贷款金额</label>
          <div class="input-group">
            <input type="number" id="aAmount" class="form-control" value="100" step="1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>贷款年利率</label>
          <div class="input-group">
            <input type="number" id="aRate" class="form-control" value="4.1" step="0.01">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>贷款期限</label>
          <select id="aYears" class="form-control">
            <option value="10">10年</option>
            <option value="20">20年</option>
            <option value="30" selected>30年</option>
          </select>
        </div>
        <div class="form-group">
          <label>还款方式</label>
          <select id="aType" class="form-control">
            <option value="1">等额本息</option>
            <option value="2">等额本金</option>
          </select>
        </div>

        <div class="form-group full-width" style="margin-top:10px;">
          <h4 style="border-bottom:2px solid #e67e22; display:inline-block; margin-bottom:10px; color:#e67e22">方案 B</h4>
        </div>
        <div class="form-group">
          <label>贷款金额</label>
          <div class="input-group">
            <input type="number" id="bAmount" class="form-control" value="100" step="1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>贷款年利率</label>
          <div class="input-group">
            <input type="number" id="bRate" class="form-control" value="3.95" step="0.01">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>贷款期限</label>
          <select id="bYears" class="form-control">
            <option value="10">10年</option>
            <option value="20" selected>20年</option>
            <option value="30">30年</option>
          </select>
        </div>
        <div class="form-group">
          <label>还款方式</label>
          <select id="bType" class="form-control">
            <option value="1">等额本息</option>
            <option value="2" selected>等额本金</option>
          </select>
        </div>

        <div class="form-group full-width" style="margin-top:10px;">
          <button id="btnCalc" class="btn btn-primary">横向对比分析结果</button>
        </div>
      </div>

      <div class="result-box" id="resultBox" style="background:#fff; border:1px solid var(--border-color);">
        <h3 style="color:#111; border-bottom:1px solid #eee;">评估对比报告</h3>
        <table style="width:100%; border-collapse: collapse; margin-top:15px;">
          <thead>
            <tr style="background:#f1f1f1;">
              <th style="padding:10px; border:1px solid #ddd; text-align:left;">对比项目</th>
              <th style="padding:10px; border:1px solid #ddd; color:var(--primary-color);">方案 A</th>
              <th style="padding:10px; border:1px solid #ddd; color:#e67e22;">方案 B</th>
              <th style="padding:10px; border:1px solid #ddd; color:#d9534f;">差异对比</th>
            </tr>
          </thead>
          <tbody id="compareBody">
            <!-- JS 填充 -->
          </tbody>
        </table>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">房贷方案选择困难？一文教你如何做对比决策</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>面对动辄百万级别的房贷，哪怕是贷款利率相差 0.1%，或者是贷款期限相差 5 年，最终支付给银行的利息总额都有可能相差数万甚至数十万。如何在一众银行给出的贷款方案中挑选出最不亏的那个？这就需要依靠量化的数据对比。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">对比核心1：贷款期限长短的取舍</h3>
        <p>很多长辈主张“无债一身轻”，认为能借20年绝不借30年。事实上，在当今的通货膨胀背景下，房贷可以说是普通人这辈子能从银行借到的<strong>金额最大、利率最低、期限最长</strong>的一笔钱了。如果您的投资理财年化收益能够跑赢房贷利率，那么<strong>贷款期限越长越好，最好贷满30年</strong>，让通胀来稀释您未来的负债；反之，如果您极度厌恶风险，那可以选择缩短年限以节省利息。</p>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">对比核心2：月供压力与总利息的平衡</h3>
        <p>方案A（等额本息，30年）通常月供最低，能极大缓解每月的现金流压力；而方案B（等额本金，20年）首月月供极高，但整体利息比方案A少得多。通过我们的对比计算器，您可以直观地看到二者的“利息差额”与“月供差额”。</p>
        <p><strong>黄金法则：</strong>不要光盯着总利息。对于刚需购房的年轻人，现金流重于一切。如果方案B的高月供会让您的生活捉襟见肘，那么老老实实选择方案A，把多余的现金流用于提升自己或家庭生活品质，才是更明智的选择。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 本工具旨在帮助用户横向评估不同的房贷策略（如：20年与30年对比，本息与本金对比）。</p>
      <p>2. 请在方案A和方案B中输入您纠结的两种参数组合。</p>
      <p>3. 点击计算后，表格中会直观显示“方案A”比“方案B”多出或减少的具体金额差值。</p>
    `,
    jsContent: `
      function calcLoan(amount, rate, years, type) {
        amount = amount * 10000;
        rate = rate / 100 / 12;
        const months = years * 12;
        
        let firstMonth = 0;
        let totalInterest = 0;

        if (type === '1') {
          firstMonth = rate > 0 ? (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1) : amount / months;
          totalInterest = (firstMonth * months) - amount;
        } else {
          const principal = amount / months;
          firstMonth = principal + amount * rate;
          totalInterest = (amount * rate + principal * rate) / 2 * months;
        }

        return {
          firstMonth: firstMonth,
          totalInterest: totalInterest,
          totalAmount: amount + totalInterest
        };
      }

      document.getElementById('btnCalc').addEventListener('click', () => {
        const aAmt = parseFloat(document.getElementById('aAmount').value);
        const aRate = parseFloat(document.getElementById('aRate').value);
        const aYears = parseInt(document.getElementById('aYears').value);
        const aType = document.getElementById('aType').value;

        const bAmt = parseFloat(document.getElementById('bAmount').value);
        const bRate = parseFloat(document.getElementById('bRate').value);
        const bYears = parseInt(document.getElementById('bYears').value);
        const bType = document.getElementById('bType').value;

        if (isNaN(aAmt) || isNaN(aRate) || isNaN(bAmt) || isNaN(bRate)) {
          alert('参数填写有误');
          return;
        }

        const resA = calcLoan(aAmt, aRate, aYears, aType);
        const resB = calcLoan(bAmt, bRate, bYears, bType);

        const tbody = document.getElementById('compareBody');
        tbody.innerHTML = '';

        const rows = [
          { label: '首月月供', valA: resA.firstMonth, valB: resB.firstMonth, unit: '元', div: 1 },
          { label: '支付总利息', valA: resA.totalInterest, valB: resB.totalInterest, unit: '万元', div: 10000 },
          { label: '本息还款总额', valA: resA.totalAmount, valB: resB.totalAmount, unit: '万元', div: 10000 }
        ];

        rows.forEach(r => {
          let aView = (r.valA / r.div).toFixed(2);
          let bView = (r.valB / r.div).toFixed(2);
          let diff = ((r.valA - r.valB) / r.div).toFixed(2);
          
          let diffText = '';
          if (diff > 0) {
            diffText = 'A 比 B 多 <strong style="color:#d9534f">' + diff + '</strong> ' + r.unit;
          } else if (diff < 0) {
            diffText = 'A 比 B 少 <strong style="color:#5cb85c">' + Math.abs(diff).toFixed(2) + '</strong> ' + r.unit;
          } else {
            diffText = '<span style="color:#999">数额相同</span>';
          }

          tbody.innerHTML += \`
            <tr>
              <td style="padding:10px; border:1px solid #ddd; font-weight:bold;">\${r.label}</td>
              <td style="padding:10px; border:1px solid #ddd;">\${aView} \${r.unit}</td>
              <td style="padding:10px; border:1px solid #ddd;">\${bView} \${r.unit}</td>
              <td style="padding:10px; border:1px solid #ddd; background:#fffaf0;">\${diffText}</td>
            </tr>
          \`;
        });

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'lpr-calc',
    title: 'LPR房贷浮动利率计算器 - 降息后月供变化一键测算',
    description: '当央行LPR降息或加息时，我的房贷月供会变化多少？使用LPR房贷计算器，输入您的基准LPR和加减基点（BP），精确计算次年新月供。',
    keywords: 'LPR计算器,LPR降息,房贷基准利率浮动计算,BP基点,重新定价日月供计算',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group">
          <label>剩余贷款本金</label>
          <div class="input-group">
            <input type="number" id="principal" class="form-control" value="100" min="0" step="1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>剩余贷款期限</label>
          <div class="input-group">
            <input type="number" id="remainYears" class="form-control" value="25" min="1" step="1">
            <span class="input-group-addon">年</span>
          </div>
        </div>
        
        <div class="form-group full-width" style="margin: 10px 0;">
          <h4 style="color:var(--primary-color);">重新定价前（旧利率）</h4>
        </div>
        <div class="form-group">
          <label>旧 LPR报价</label>
          <div class="input-group">
            <input type="number" id="oldLpr" class="form-control" value="4.2" step="0.05">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>您的加减基点 (BP)</label>
          <div class="input-group">
            <input type="number" id="bp" class="form-control" value="10" step="1" placeholder="加点填正数，减点填负数">
            <span class="input-group-addon">BP</span>
          </div>
          <small style="color:#888; font-size:0.8rem;">1 BP = 0.01%，例：加10BP填 10，减20BP填 -20</small>
        </div>

        <div class="form-group full-width" style="margin: 10px 0;">
          <h4 style="color:#e67e22;">重新定价后（新LPR利率）</h4>
        </div>
        <div class="form-group">
          <label>新 LPR报价</label>
          <div class="input-group">
            <input type="number" id="newLpr" class="form-control" value="3.95" step="0.05">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>还款方式</label>
          <select id="repayType" class="form-control">
            <option value="1">等额本息</option>
            <option value="2">等额本金</option>
          </select>
        </div>

        <div class="form-group full-width">
          <button id="btnCalc" class="btn btn-primary">测算降息/加息后变化</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3>LPR重定价评估结果</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; text-align:center;">
            <div class="result-item-title">每月月供将减少 / 增加</div>
            <div class="result-item-value" id="resDiff" style="font-size: 2.2rem; margin:10px 0;">0.00 <span style="font-size:1.2rem;color:#666">元</span></div>
            <div id="resTotalInt" style="font-size:0.9rem;color:#888;">剩余期限内为您节省总利息：0.00 万元</div>
          </div>
          <div class="result-item">
            <div class="result-item-title">旧月供 (重新定价前)</div>
            <div class="result-item-value" id="resOldMonth">0.00 <span style="font-size:1rem;color:#666">元</span></div>
            <div style="font-size:0.8rem;color:#888;margin-top:5px;" id="oldRateDesc">执行利率: 0%</div>
          </div>
          <div class="result-item">
            <div class="result-item-title">新月供 (次年执行生效)</div>
            <div class="result-item-value green" id="resNewMonth">0.00 <span style="font-size:1rem;color:#666">元</span></div>
            <div style="font-size:0.8rem;color:#888;margin-top:5px;" id="newRateDesc">执行利率: 0%</div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">LPR降息了，我的房贷到底什么时候降？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>每次看到新闻推送“央行宣布 LPR 下调”，很多“房奴”们都会一阵激动，但次月一看自己的扣款短信，怎么还是扣了那么多钱？这就涉及到 LPR 的<strong>“重新定价日”</strong>机制了。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">什么是重新定价日？</h3>
        <p>个人住房贷款的浮动利率并不是央行今天降息，明天您的贷款就立刻按新利率执行。在签订贷款合同时，银行会和您约定一个“重新定价日”（通常是<strong>每年的1月1日</strong>，或者是<strong>贷款发放日的对月对日</strong>）。只有到了这个重定价日，银行才会根据上一个月（也就是12月20日）最新公布的 LPR 报价，来重新计算您下一年度的执行利率和月供。</p>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">固定加减点（BP）一生相伴</h3>
        <p>您的最终房贷执行利率公式为：<strong>执行利率 = 当期 LPR + 您的固定 BP（基点）</strong>。</p>
        <p>需要特别注意的是，无论 LPR 怎么变，您当初买房时合同里确定的这个加减基点（BP）是在整个贷款周期内<strong>永远不变的</strong>。例如您在楼市火热期高位站岗，加点是 +100BP（即+1%），那么即便 LPR 降到了 3.95%，您的执行利率依然是 4.95%。相反，如果您是在低谷期买入，减点 -20BP，那么您的实际利率就会跌破 LPR 报价基准。</p>

        <h3 style="margin: 20px 0 10px; color: #111">本计算器的价值</h3>
        <p>银行的APP有时只会显示当前的执行利率，很难预测明年的月供变化。通过我们的计算器，您可以输入当前的剩余本金和剩余年限，提前测算出 LPR 变动后，次年每个月能让您少还多少钱，为家庭财务提前做好规划。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 请打开您的手机银行APP，在“我的贷款”中查出<strong>当前的剩余未还本金</strong>。</p>
      <p>2. 输入您的<strong>剩余贷款期限</strong>（例如贷了30年，已经还了5年，这里就填25）。</p>
      <p>3. <strong>BP（基点）非常重要</strong>：1个BP等于0.01%。如果您合同写的是加点60，就填 60；如果是减20基点，就填 -20。</p>
      <p>4. 填入预期的 LPR 报价，即可测算出新一年的按揭额度。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const principal = parseFloat(document.getElementById('principal').value) * 10000;
        const months = parseInt(document.getElementById('remainYears').value) * 12;
        const oldLpr = parseFloat(document.getElementById('oldLpr').value);
        const newLpr = parseFloat(document.getElementById('newLpr').value);
        const bp = parseFloat(document.getElementById('bp').value) || 0;
        const type = document.getElementById('repayType').value;

        if (isNaN(principal) || isNaN(months) || isNaN(oldLpr) || isNaN(newLpr)) {
          alert('参数填写有误');
          return;
        }

        const oldRate = (oldLpr + (bp / 100)) / 100 / 12;
        const newRate = (newLpr + (bp / 100)) / 100 / 12;

        let oldMonth = 0;
        let newMonth = 0;
        let oldTotal = 0;
        let newTotal = 0;

        if (type === '1') {
          // 等额本息
          oldMonth = oldRate > 0 ? (principal * oldRate * Math.pow(1 + oldRate, months)) / (Math.pow(1 + oldRate, months) - 1) : principal / months;
          newMonth = newRate > 0 ? (principal * newRate * Math.pow(1 + newRate, months)) / (Math.pow(1 + newRate, months) - 1) : principal / months;
          oldTotal = (oldMonth * months) - principal;
          newTotal = (newMonth * months) - principal;
        } else {
          // 等额本金算首月
          const pPerMonth = principal / months;
          oldMonth = pPerMonth + principal * oldRate;
          newMonth = pPerMonth + principal * newRate;
          oldTotal = (principal * oldRate + pPerMonth * oldRate) / 2 * months;
          newTotal = (principal * newRate + pPerMonth * newRate) / 2 * months;
        }

        const diffMonth = oldMonth - newMonth;
        const diffTotal = (oldTotal - newTotal) / 10000;

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        const resDiffEl = document.getElementById('resDiff');
        if (diffMonth >= 0) {
          resDiffEl.innerHTML = '减少 ' + diffMonth.toFixed(2) + ' <span style="font-size:1.2rem;color:#666">元</span>';
          resDiffEl.style.color = '#5cb85c';
          document.getElementById('resTotalInt').textContent = '剩余期限内为您节省总利息：' + diffTotal.toFixed(2) + ' 万元';
        } else {
          resDiffEl.innerHTML = '增加 ' + Math.abs(diffMonth).toFixed(2) + ' <span style="font-size:1.2rem;color:#666">元</span>';
          resDiffEl.style.color = '#d9534f';
          document.getElementById('resTotalInt').textContent = '剩余期限内将多支出利息：' + Math.abs(diffTotal).toFixed(2) + ' 万元';
        }

        document.getElementById('resOldMonth').innerHTML = oldMonth.toFixed(2) + ' <span style="font-size:1rem;color:#666">元</span>';
        document.getElementById('oldRateDesc').textContent = '执行利率: ' + (oldLpr + (bp / 100)).toFixed(2) + '%';
        
        document.getElementById('resNewMonth').innerHTML = newMonth.toFixed(2) + ' <span style="font-size:1rem;color:#666">元</span>';
        document.getElementById('newRateDesc').textContent = '执行利率: ' + (newLpr + (bp / 100)).toFixed(2) + '%';
        
        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'material-calc',
    title: '装修建材计算器 - 瓷砖/地板/涂料用量精准估算',
    description: '装修必备的建材计算神器。输入您的房间尺寸和建材规格，即可自动为您估算地砖、木地板、墙面漆壁纸的实际需求用量及损耗。',
    keywords: '建材计算器,瓷砖用量计算,涂料用量计算,地板计算,装修材料估算',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group full-width">
          <label>选择要计算的材料</label>
          <div style="display:flex; gap:10px; margin-bottom:15px;">
            <button class="btn btn-primary" style="flex:1" onclick="switchTab('tile')">地砖/地板</button>
            <button class="btn" style="flex:1; background:#eee; color:#333;" onclick="switchTab('paint')">墙面涂料</button>
          </div>
        </div>

        <!-- 瓷砖/地板 面板 -->
        <div id="tab-tile" style="display:contents;">
          <div class="form-group">
            <label>铺设区域面积</label>
            <div class="input-group">
              <input type="number" id="roomArea" class="form-control" value="20" min="1" step="1">
              <span class="input-group-addon">平方米</span>
            </div>
          </div>
          <div class="form-group">
            <label>材料规格 (长 × 宽)</label>
            <select id="tileSize" class="form-control">
              <option value="0.64">800×800mm (大地砖)</option>
              <option value="0.36">600×600mm (中砖)</option>
              <option value="0.72">600×1200mm (大板)</option>
              <option value="0.09">300×300mm (厨卫地砖)</option>
              <option value="0.15">800×150mm (木纹砖/地板)</option>
              <option value="0.24">1200×200mm (常规木地板)</option>
            </select>
          </div>
          <div class="form-group">
            <label>施工损耗率预留</label>
            <div class="input-group">
              <input type="number" id="tileLoss" class="form-control" value="5" min="0" step="1">
              <span class="input-group-addon">%</span>
            </div>
          </div>
        </div>

        <!-- 涂料 面板 -->
        <div id="tab-paint" style="display:none;">
          <div class="form-group">
            <label>房间长</label>
            <div class="input-group">
              <input type="number" id="roomL" class="form-control" value="5" step="0.1">
              <span class="input-group-addon">米</span>
            </div>
          </div>
          <div class="form-group">
            <label>房间宽</label>
            <div class="input-group">
              <input type="number" id="roomW" class="form-control" value="4" step="0.1">
              <span class="input-group-addon">米</span>
            </div>
          </div>
          <div class="form-group">
            <label>房间高</label>
            <div class="input-group">
              <input type="number" id="roomH" class="form-control" value="2.8" step="0.1">
              <span class="input-group-addon">米</span>
            </div>
          </div>
          <div class="form-group">
            <label>门窗总面积 (需扣除)</label>
            <div class="input-group">
              <input type="number" id="doorArea" class="form-control" value="3.5" step="0.1">
              <span class="input-group-addon">平米</span>
            </div>
          </div>
        </div>

        <div class="form-group full-width" style="margin-top:10px;">
          <button id="btnCalc" class="btn btn-primary" style="background:#27ae60;">计算实际用量</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3>建材购买清单预估</h3>
        <div class="result-grid" id="resGrid">
          <!-- JS动态填充 -->
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">建材购买指南：损耗率是商家赚钱的“潜规则”？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>不管是半包还是全包，自己去建材市场买瓷砖或乳胶漆是绝大部分业主的必经之路。面对几十平米的房间，到底该买多少箱砖？买几桶漆？如果全凭商家的一面之词，往往会被故意做高“损耗率”而导致材料严重剩余，而有些特价产品甚至是“不退不换”的，最后只能白白浪费钱。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">瓷砖与地板的黄金损耗原则</h3>
        <p>在铺贴地砖和木地板时，因为房间尺寸不可能完全是建材规格的整数倍，必然面临切割。一般而言：</p>
        <ul>
          <li><strong>常规正铺法：</strong>损耗率一般控制在 <strong>5%</strong> 左右即可。例如客厅方正，边角切割少。</li>
          <li><strong>人字拼、鱼骨拼或斜铺：</strong>这种复杂的造型施工会导致极大的边角废料，损耗率必须预留到 <strong>8% - 10%</strong>，否则绝对会面临买不到同批次色号补砖的惨剧。</li>
        </ul>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">涂料乳胶漆的“一底两面”</h3>
        <p>墙面漆的计算相对复杂，因为要刷墙面+顶面，且要扣除门窗的面积。标准的涂刷工艺是<strong>“一底两面”</strong>，即刷一遍底漆防潮防碱，再刷两遍面漆保证遮盖力和质感。</p>
        <p>市面上常见的乳胶漆一桶（5升装），单遍的理论涂刷面积大约为 60-70 平方米。我们建议您使用计算器算出净面积后，严格按照 <code>一桶漆刷30平米（两遍）</code> 的经验系数去购买。宁可少买后期补一小桶，也不要一开始就买太多闲置过保质期。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. <strong>地砖模式：</strong>只需输入纯地面面积和您看中的瓷砖规格，系统会自动加上预留的损耗，并告诉您确切的块数。</p>
      <p>2. <strong>涂料模式：</strong>输入房间长宽高，系统通过 <code>(长+宽)×2×高 + 长×宽 - 门窗面积</code> 公式为您计算出四面墙加顶棚的实际涂刷面积。</p>
      <p>3. 提醒：瓷砖不同批次会有微小色差，建议<strong>买多退少（确保可退货）</strong>，尽量别面临后期补货的局面。</p>
    `,
    jsContent: `
      let currentTab = 'tile';

      window.switchTab = function(tab) {
        currentTab = tab;
        document.getElementById('tab-tile').style.display = tab === 'tile' ? 'contents' : 'none';
        document.getElementById('tab-paint').style.display = tab === 'paint' ? 'contents' : 'none';
        
        const btns = document.querySelectorAll('.form-group.full-width button.btn');
        btns[0].className = tab === 'tile' ? 'btn btn-primary' : 'btn';
        btns[0].style.background = tab === 'tile' ? '' : '#eee';
        btns[0].style.color = tab === 'tile' ? '#fff' : '#333';
        
        btns[1].className = tab === 'paint' ? 'btn btn-primary' : 'btn';
        btns[1].style.background = tab === 'paint' ? '' : '#eee';
        btns[1].style.color = tab === 'paint' ? '#fff' : '#333';
        
        document.getElementById('resultBox').classList.remove('active');
      }

      document.getElementById('btnCalc').addEventListener('click', () => {
        const resGrid = document.getElementById('resGrid');
        resGrid.innerHTML = '';

        if (currentTab === 'tile') {
          const area = parseFloat(document.getElementById('roomArea').value);
          const singleSize = parseFloat(document.getElementById('tileSize').value);
          const loss = parseFloat(document.getElementById('tileLoss').value) / 100;

          if (isNaN(area) || isNaN(loss)) return alert('输入有误');

          const netCount = area / singleSize;
          const grossCount = Math.ceil(netCount * (1 + loss));
          
          resGrid.innerHTML = \`
            <div class="result-item" style="grid-column: 1 / -1;">
              <div class="result-item-title">建议购买材料总数量 (已含损耗)</div>
              <div class="result-item-value green" style="font-size: 2.2rem;">\${grossCount} <span style="font-size:1.2rem;color:#666">块/片</span></div>
            </div>
            <div class="result-item">
              <div class="result-item-title">理论净使用数量</div>
              <div class="result-item-value">\${Math.ceil(netCount)} <span style="font-size:1rem;color:#666">块</span></div>
            </div>
            <div class="result-item">
              <div class="result-item-title">预留损耗数量</div>
              <div class="result-item-value">\${grossCount - Math.ceil(netCount)} <span style="font-size:1rem;color:#666">块</span></div>
            </div>
          \`;

        } else {
          const l = parseFloat(document.getElementById('roomL').value);
          const w = parseFloat(document.getElementById('roomW').value);
          const h = parseFloat(document.getElementById('roomH').value);
          const door = parseFloat(document.getElementById('doorArea').value);

          if (isNaN(l) || isNaN(w) || isNaN(h) || isNaN(door)) return alert('输入有误');

          const wallArea = (l + w) * 2 * h;
          const roofArea = l * w;
          const netArea = wallArea + roofArea - door;
          
          // 经验值：5L一桶，刷两遍面漆可刷约35平米，底漆一遍可刷70平米
          const mianqi = Math.ceil(netArea / 35);
          const diqi = Math.ceil(netArea / 70);

          resGrid.innerHTML = \`
            <div class="result-item" style="grid-column: 1 / -1; text-align:center;">
              <div class="result-item-title">实际需要涂刷的总面积 (四面墙+顶棚 - 门窗)</div>
              <div class="result-item-value" style="font-size: 2.2rem;">\${netArea.toFixed(2)} <span style="font-size:1.2rem;color:#666">平米</span></div>
            </div>
            <div class="result-item">
              <div class="result-item-title">面漆建议购买量 (按5L/桶，涂刷两遍)</div>
              <div class="result-item-value green">\${mianqi} <span style="font-size:1rem;color:#666">桶</span></div>
            </div>
            <div class="result-item">
              <div class="result-item-title">底漆建议购买量 (按5L/桶，涂刷一遍)</div>
              <div class="result-item-value">\${diqi} <span style="font-size:1rem;color:#666">桶</span></div>
            </div>
          \`;
        }

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'mortgage',
    title: '最新房贷计算器 - 最新LPR商业贷款及公积金按揭试算',
    description: '2024最新最全的房贷计算器，支持商业贷款、公积金贷款及组合贷款，等额本息/等额本金随时切换，秒出月供明细，精准计算您买房的每一笔利息。',
    keywords: '房贷计算器,商业贷款计算,按揭计算器,等额本息,等额本金,月供怎么算,公积金房贷',
    htmlContent: `
      <!-- 简化复用 combo-loan 结构，但专注于单一种类贷款 -->
      <div class="form-grid">
        <div class="form-group full-width">
          <label>贷款类型</label>
          <div style="display:flex; gap:10px;">
            <select id="loanType" class="form-control" style="background:#f0f7ff; border-color:var(--primary-color);">
              <option value="comm">商业贷款</option>
              <option value="fund">公积金贷款</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>贷款金额</label>
          <div class="input-group">
            <input type="number" id="amount" class="form-control" value="100" min="0" step="1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>按揭年数 (期限)</label>
          <select id="years" class="form-control">
            <option value="10">10年 (120期)</option>
            <option value="20">20年 (240期)</option>
            <option value="30" selected>30年 (360期)</option>
          </select>
        </div>
        <div class="form-group">
          <label>执行年利率</label>
          <div class="input-group">
            <input type="number" id="rate" class="form-control" value="3.95" min="0" step="0.01">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>还款方式</label>
          <select id="repayType" class="form-control">
            <option value="1">等额本息 (每月还款固定)</option>
            <option value="2">等额本金 (每月还款递减)</option>
          </select>
        </div>
        
        <div class="form-group full-width" style="margin-top:10px;">
          <button id="btnCalc" class="btn btn-primary" style="height: 50px; font-size: 1.1rem;">立即计算月供</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; border-left: 4px solid var(--primary-color);">
            <div class="result-item-title" id="monthLabel">每月应还月供</div>
            <div class="result-item-value" id="resMonth" style="font-size: 2.5rem; color:#111;">0.00 <span style="font-size:1.2rem;color:#666">元</span></div>
            <div id="monthDesc" style="font-size:0.9rem;color:#888;"></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">给银行的利息总额</div>
            <div class="result-item-value" id="resInterest" style="color:#d9534f">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">还款总额 (本金+利息)</div>
            <div class="result-item-value" id="resTotal">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">为什么买房贷款，银行赚走的利息几乎和本金一样多？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>当您使用我们的房贷计算器测算一笔 100万、30年期的商业贷款时，您可能会被那个“总利息”数字吓跳：如果是等额本息还款，总利息往往高达 70万 - 80万，几乎快赶上贷款本金了！很多人因此感到愤怒，觉得银行是在“吸血”。但这背后的金融逻辑，其实是<strong>复利与时间</strong>的作用。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">房贷利息背后的数学真相</h3>
        <p>银行收取利息的核心原则是：<strong>占用本金多少，占用时间多长，就收多少利息。</strong></p>
        <p>在贷款的最初几年，您欠银行的本金最多（将近100万）。以 4% 的利率计算，您一年要给银行的纯利息就有 4 万元左右，折合到每个月就是 3000 多块钱的利息。如果您每个月的月供是 4700 元，这意味着您还的钱里，有 3000 多都是被银行拿走的利息，真正在削减的“本金”只有一千多块钱。</p>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">等额本息 vs 等额本金：到底有没有“吃亏”？</h3>
        <p>网上流传一种说法：“等额本息是银行骗人的，前期还的全是利息，后期才还本金，亏死了”。</p>
        <p><strong>这是极大的财务误区！</strong>无论是等额本息还是等额本金，银行计算月利息的公式完全一样：<code>当月利息 = 剩余未还本金 × 月利率</code>。等额本息之所以总利息高，仅仅是因为它前期强制您归还的“本金”很少，导致本金递减慢，资金被占用的时间变长了而已。银行并没有多收你一分钱的冤枉利息。</p>

        <h3 style="margin: 20px 0 10px; color: #111">要不要提前还款？</h3>
        <p>如果您手头有一笔闲置资金，且您无法找到稳定收益超过房贷利率的理财产品，那么<strong>提前还贷绝对是最明智的无风险投资</strong>。特别是如果您处于贷款的前五到十年（本金占比极高），提前还一笔本金，能为您省下巨额的未来利息支出。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 选择贷款类型（商业或公积金），不同类型的利率差异较大，公积金通常在 3.1% 左右。</p>
      <p>2. 输入贷款总金额，一般为房屋总价减去您的首付款。</p>
      <p>3. 我们推荐刚需族首选“等额本息”以减轻前期现金流压力；有提前还款计划的朋友可首选“等额本金”。</p>
    `,
    jsContent: `
      document.getElementById('loanType').addEventListener('change', function() {
        const rateInput = document.getElementById('rate');
        if (this.value === 'fund') {
          rateInput.value = '3.10'; // 默认公积金利率
        } else {
          rateInput.value = '3.95'; // 默认商贷利率
        }
      });

      document.getElementById('btnCalc').addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('amount').value) * 10000;
        const rate = parseFloat(document.getElementById('rate').value) / 100 / 12;
        const months = parseInt(document.getElementById('years').value) * 12;
        const type = document.getElementById('repayType').value;

        if (isNaN(amount) || isNaN(rate) || isNaN(months) || amount <= 0) {
          alert('请检查输入的数字是否正确');
          return;
        }

        let monthPay = 0;
        let totalInt = 0;
        let diff = 0;

        if (type === '1') {
          monthPay = rate > 0 ? (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1) : amount / months;
          totalInt = (monthPay * months) - amount;
          
          document.getElementById('monthLabel').textContent = '每月等额月供';
          document.getElementById('resMonth').innerHTML = monthPay.toFixed(2) + ' <span style="font-size:1.2rem;color:#666">元</span>';
          document.getElementById('monthDesc').textContent = '每个月的还款金额固定不变';
        } else {
          const principal = amount / months;
          monthPay = principal + amount * rate;
          totalInt = (amount * rate + principal * rate) / 2 * months;
          diff = principal * rate;
          
          document.getElementById('monthLabel').textContent = '首月月供 (最高)';
          document.getElementById('resMonth').innerHTML = monthPay.toFixed(2) + ' <span style="font-size:1.2rem;color:#666">元</span>';
          document.getElementById('monthDesc').innerHTML = '此后每月固定递减约 <strong style="color:#d9534f">' + diff.toFixed(2) + '</strong> 元';
        }

        document.getElementById('resInterest').innerHTML = (totalInt / 10000).toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        document.getElementById('resTotal').innerHTML = ((amount + totalInt) / 10000).toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        resBox.classList.add('active');
      });
    `
  }
];

let scriptContent = '';
tools.forEach(tool => {
  const filePath = path.join(__dirname, 'tools', 'realestate', tool.slug + '.html');
  fs.writeFileSync(filePath, template(tool), 'utf8');
  console.log('Generated ' + tool.slug + '.html');
});
