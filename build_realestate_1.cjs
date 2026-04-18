const fs = require('fs');
const path = require('path');

const template = (tool) => `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\${tool.title} - 一键在线计算与评测 | WebUtils</title>
    <meta name="description" content="\${tool.description}" />
    <meta name="keywords" content="\${tool.keywords}" />
    <link rel="canonical" href="https://essays4u.net/tools/realestate/\${tool.slug}" />

    <!-- Open Graph -->
    <meta property="og:title" content="\${tool.title} - 在线房产计算工具" />
    <meta property="og:description" content="\${tool.description}" />
    <meta property="og:url" content="https://essays4u.net/tools/realestate/\${tool.slug}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://essays4u.net/social-preview.png" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="\${tool.title} - 在线房产计算工具" />
    <meta name="twitter:description" content="\${tool.description}" />
    <meta name="twitter:image" content="https://essays4u.net/social-preview.png" />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "\${tool.title}",
      "description": "\${tool.description}",
      "url": "https://essays4u.net/tools/realestate/\${tool.slug}",
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
      \${tool.extraCss || ''}
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
          <h1>\${tool.title}</h1>
          <p>\${tool.description}</p>
        </div>

        \${tool.htmlContent}

        <!-- SEO 内容 -->
        <section style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 30px">
          \${tool.seoArticle}
        </section>
      </div>

      <aside class="sidebar-section">
        <div class="article-card">
          <h2>使用指南</h2>
          \${tool.sidebarGuide}
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
      \${tool.jsContent}
    </script>
  </body>
</html>`;

const tools = [
  {
    slug: 'combo-loan',
    title: '在线组合贷款计算器 - 公积金与商业贷款混合计算',
    description: '精准的组合房贷计算器，支持商业贷款和公积金贷款组合计算，等额本息与等额本金还款方式自由切换，实时生成每月还款明细与总利息。',
    keywords: '组合贷款计算器,房贷计算器,公积金商业贷款混合计算,等额本息,等额本金,买房贷款',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group">
          <label>商业贷款金额</label>
          <div class="input-group">
            <input type="number" id="commAmount" class="form-control" value="100" min="0" step="1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>商业贷款年利率</label>
          <div class="input-group">
            <input type="number" id="commRate" class="form-control" value="3.95" min="0" step="0.01">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>公积金贷款金额</label>
          <div class="input-group">
            <input type="number" id="fundAmount" class="form-control" value="50" min="0" step="1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>公积金贷款年利率</label>
          <div class="input-group">
            <input type="number" id="fundRate" class="form-control" value="3.1" min="0" step="0.01">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>贷款期限</label>
          <div class="input-group">
            <select id="years" class="form-control">
              <option value="10">10年 (120期)</option>
              <option value="15">15年 (180期)</option>
              <option value="20">20年 (240期)</option>
              <option value="25">25年 (300期)</option>
              <option value="30" selected>30年 (360期)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>还款方式</label>
          <select id="repayType" class="form-control">
            <option value="1">等额本息 (每月还款额固定)</option>
            <option value="2">等额本金 (每月递减，总利息更少)</option>
          </select>
        </div>
        <div class="form-group full-width">
          <button id="btnCalc" class="btn btn-primary">立即计算贷款明细</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3>计算结果</h3>
        <div class="result-grid">
          <div class="result-item">
            <div class="result-item-title" id="monthlyTitle">每月应还本息</div>
            <div class="result-item-value" id="resMonthly">0.00 <span style="font-size:1rem;color:#666">元</span></div>
            <div id="monthlyDesc" style="font-size:0.8rem;color:#888;margin-top:5px;"></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">累计支付利息总额</div>
            <div class="result-item-value" id="resInterest">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">累计还款总额 (本+息)</div>
            <div class="result-item-value" id="resTotal">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">贷款总本金</div>
            <div class="result-item-value" id="resPrincipal">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">深度解析：组合贷款如何还款最划算？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>在目前的房地产交易市场中，纯公积金贷款往往额度受限（如个人最高50万，夫妻100万），而纯商业贷款的利率又相对较高。因此，<strong>组合贷款</strong>（即公积金贷款+商业贷款）成为了绝大多数购房者的黄金首选。如何科学计算两部分贷款的成本并选择合适的还款方式，是买房决策中的重中之重。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">1. 等额本息 vs 等额本金：到底选哪个？</h3>
        <ul>
          <li><strong>等额本息：</strong>将贷款本金与总利息相加，平摊到每个月中，<strong>每月还款额固定</strong>。前期还款中利息占大头，本金占小头。适合收入稳定、前期资金压力较大的年轻人。</li>
          <li><strong>等额本金：</strong>每月偿还同等数额的本金，利息随本金逐月递减，因此<strong>每月还款额逐月下降</strong>。整体算下来总利息更少，但前期还款压力巨大。适合当前手头资金宽裕、或打算在三五年内提前还贷的人群。</li>
        </ul>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">2. 商业利率与公积金利率的博弈</h3>
        <p>由于LPR（贷款市场报价利率）的动态调整，目前商业贷款利率不断下调，但公积金贷款的利率始终保持在更低的水平（首套五年以上通常在3.1%甚至更低）。在申请组合贷时，我们建议<strong>尽可能拉满公积金的最高贷款额度</strong>，剩余部分再使用商业贷款，以达到整体利息支出的最优化。</p>

        <h3 style="margin: 20px 0 10px; color: #111">3. 提前还贷的小技巧</h3>
        <p>很多朋友在使用组合贷款后，手头有了闲钱想提前还款。这里有一个极其关键的财务技巧：<strong>永远优先提前还清“商业贷款”部分</strong>。因为商业贷款的年化利率远高于公积金，先归还高息负债能为您省下惊人的利息支出。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 分别输入您的<strong>商业贷款</strong>和<strong>公积金贷款</strong>预期申请额度（单位：万元）。</p>
      <p>2. 根据银行给您的实际批复，调整两种贷款的年利率（单位：%）。</p>
      <p>3. 选择总贷款期限，通常为 10-30 年。</p>
      <p>4. 对比“等额本息”与“等额本金”两种方式的区别，找出最适合您的还款方案。</p>
      <p style="color:var(--primary-color);font-size:0.85rem;margin-top:10px;">注：LPR利率如有变动，请直接修改商业贷款利率值。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const commAmount = parseFloat(document.getElementById('commAmount').value) * 10000;
        const commRate = parseFloat(document.getElementById('commRate').value) / 100 / 12;
        const fundAmount = parseFloat(document.getElementById('fundAmount').value) * 10000;
        const fundRate = parseFloat(document.getElementById('fundRate').value) / 100 / 12;
        const months = parseInt(document.getElementById('years').value) * 12;
        const type = document.getElementById('repayType').value;
        
        if (isNaN(commAmount) || isNaN(commRate) || isNaN(fundAmount) || isNaN(fundRate)) {
          alert('请输入正确的数字格式');
          return;
        }

        const totalPrincipal = commAmount + fundAmount;
        let totalInterest = 0;
        let firstMonth = 0;
        let diff = 0;

        if (type === '1') {
          const calcEMI = (p, r, m) => r > 0 ? (p * r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1) : p / m;
          const commEMI = commAmount > 0 ? calcEMI(commAmount, commRate, months) : 0;
          const fundEMI = fundAmount > 0 ? calcEMI(fundAmount, fundRate, months) : 0;
          firstMonth = commEMI + fundEMI;
          totalInterest = (firstMonth * months) - totalPrincipal;
          
          document.getElementById('monthlyTitle').textContent = '每月应还本息';
          document.getElementById('resMonthly').innerHTML = firstMonth.toFixed(2) + ' <span style="font-size:1rem;color:#666">元</span>';
          document.getElementById('monthlyDesc').textContent = '每月还款额固定不变';
        } else {
          const commPrincipal = commAmount / months;
          const fundPrincipal = fundAmount / months;
          
          let commFirst = commPrincipal + commAmount * commRate;
          let fundFirst = fundPrincipal + fundAmount * fundRate;
          firstMonth = commFirst + fundFirst;
          
          let commTotalInt = (commAmount * commRate + commAmount / months * commRate) / 2 * months;
          let fundTotalInt = (fundAmount * fundRate + fundAmount / months * fundRate) / 2 * months;
          
          totalInterest = (commAmount > 0 ? commTotalInt : 0) + (fundAmount > 0 ? fundTotalInt : 0);
          diff = (commPrincipal * commRate) + (fundPrincipal * fundRate);

          document.getElementById('monthlyTitle').textContent = '首月应还本息';
          document.getElementById('resMonthly').innerHTML = firstMonth.toFixed(2) + ' <span style="font-size:1rem;color:#666">元</span>';
          document.getElementById('monthlyDesc').textContent = '此后每月递减约 ' + diff.toFixed(2) + ' 元';
        }

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        document.getElementById('resInterest').innerHTML = (totalInterest / 10000).toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        document.getElementById('resTotal').innerHTML = ((totalPrincipal + totalInterest) / 10000).toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        document.getElementById('resPrincipal').innerHTML = (totalPrincipal / 10000).toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        
        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'decoration-budget',
    title: '房屋装修预算计算器 - 精准预估半包/全包家装费用',
    description: '专业的房屋装修预算计算器，根据您的房屋面积、装修档次和所在城市，快速估算基础工程、主材、软装家具等各项明细费用，防止装修超支。',
    keywords: '装修预算计算器,装修报价,装修费用预估,半包全包价格,家装明细',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group">
          <label>房屋建筑面积</label>
          <div class="input-group">
            <input type="number" id="area" class="form-control" value="100" min="1" step="1">
            <span class="input-group-addon">平方米</span>
          </div>
        </div>
        <div class="form-group">
          <label>装修档次选择</label>
          <select id="level" class="form-control">
            <option value="800">简易出租装 (约800元/㎡)</option>
            <option value="1500" selected>环保品质装 (约1500元/㎡)</option>
            <option value="2500">轻奢精装标 (约2500元/㎡)</option>
            <option value="4000">高端奢华装 (4000元+/㎡)</option>
          </select>
        </div>
        <div class="form-group">
          <label>包含软装家电？</label>
          <select id="includeSoft" class="form-control">
            <option value="1.4">是，含全套软装与家电 (费用倍增)</option>
            <option value="1" selected>否，仅硬装基础+主材 (常规半包/全包)</option>
          </select>
        </div>
        <div class="form-group">
          <label>老房拆旧翻新？</label>
          <select id="isOld" class="form-control">
            <option value="0" selected>新房毛坯</option>
            <option value="100">老房翻新 (需增加拆旧费)</option>
          </select>
        </div>
        <div class="form-group full-width">
          <button id="btnCalc" class="btn btn-primary">生成详细预算清单</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3>装修预算总览</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; text-align:center;">
            <div class="result-item-title">预估总造价 (不含特殊工艺)</div>
            <div class="result-item-value" id="resTotal" style="font-size: 2.2rem; margin:10px 0;">0 <span style="font-size:1.2rem;color:#666">元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">硬装施工及辅材 (约占比40%)</div>
            <div class="result-item-value" id="resHard">0 <span style="font-size:1rem;color:#666">元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">主材及全屋定制 (约占比45%)</div>
            <div class="result-item-value" id="resMain">0 <span style="font-size:1rem;color:#666">元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">设计及管理费 (约占比10%)</div>
            <div class="result-item-value" id="resDesign">0 <span style="font-size:1rem;color:#666">元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">老房拆旧/杂费 (约占比5%)</div>
            <div class="result-item-value" id="resOther">0 <span style="font-size:1rem;color:#666">元</span></div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">家装防坑指南：为什么装修总会严重超支？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>几乎所有经历过房子装修的人都会有一句感叹：“装修就是个无底洞”。在做初期预算时明明算得好好的，最后结算时却发现超支了 30% 甚至 50%。这并非巧合，而是家装行业的隐性消费极多。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">装修超支的三大重灾区</h3>
        <ul>
          <li><strong>水电改造的“按实结算”：</strong>很多装修公司在签合同时，水电部分的报价故意做得极低（比如预估3000元），并标注“按实结算”。到了施工阶段，工人绕线、全屋换线，最终水电可能高达一两万。</li>
          <li><strong>全屋定制与柜体增项：</strong>衣柜、鞋柜、橱柜往往是除了硬装外最大的支出。初期报价通常只包含基础款的门板和五金，如果您要升级阻尼铰链、拉篮、见光板或者肤感膜，费用瞬间飙升。</li>
          <li><strong>美缝与特殊工艺：</strong>墙面挂网防裂、异型吊顶、瓷砖美缝、大板瓷砖薄贴工艺等，这些往往不在标准报价体系内，施工时提出增加都需要额外付费。</li>
        </ul>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">如何利用预算计算器控制成本？</h3>
        <p>使用我们的在线装修预算计算器，第一步是<strong>确立心理锚点</strong>。如果您选定了 1500元/平米 的环保品质装，那么对于一套 100 平米的房子，硬装（含主材）的红线就在 15 万元。在购买建材时，一定要实行“此消彼长”策略：如果买沙发超了 5000 元预算，那么买瓷砖就必须从预算里扣减 5000 元，时刻盯紧<strong>总造价</strong>。</p>
        <p>另外，建议在合同总预算之外，强行预留 <strong>15% 的不可预见备用金</strong>，这部分钱在不到万不得已时绝不轻易动用。只要严格按照拆分好的子项去控制采购，就能避免装到最后“没钱买家具”的尴尬局面。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 输入您的房屋<strong>建筑面积</strong>，系统将自动折算套内面积耗材。</p>
      <p>2. 根据您的预期选择<strong>装修档次</strong>，单价包含主材+辅材+人工。</p>
      <p>3. 软装家电（沙发、床、电视机等）弹性极大，如需系统合并计算，请在下拉框中选择包含。</p>
      <p>4. 二手房需考虑敲墙剥漆等垃圾清运费，请勾选“老房翻新”。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const area = parseFloat(document.getElementById('area').value);
        const level = parseFloat(document.getElementById('level').value);
        const includeSoft = parseFloat(document.getElementById('includeSoft').value);
        const isOld = parseFloat(document.getElementById('isOld').value);
        
        if (isNaN(area) || area <= 0) {
          alert('请输入正确的面积');
          return;
        }

        let baseTotal = area * level;
        let oldFee = area * isOld;
        let grandTotal = baseTotal * includeSoft + oldFee;

        let hard = baseTotal * 0.40;
        let main = baseTotal * 0.45;
        let design = baseTotal * 0.10;
        let other = baseTotal * 0.05 + oldFee;

        if (includeSoft > 1) {
          let softDiff = (baseTotal * includeSoft) - baseTotal;
          main += softDiff; 
        }

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        document.getElementById('resTotal').innerHTML = Math.round(grandTotal).toLocaleString() + ' <span style="font-size:1.2rem;color:#666">元</span>';
        document.getElementById('resHard').innerHTML = Math.round(hard).toLocaleString() + ' <span style="font-size:1rem;color:#666">元</span>';
        document.getElementById('resMain').innerHTML = Math.round(main).toLocaleString() + ' <span style="font-size:1rem;color:#666">元</span>';
        document.getElementById('resDesign').innerHTML = Math.round(design).toLocaleString() + ' <span style="font-size:1rem;color:#666">元</span>';
        document.getElementById('resOther').innerHTML = Math.round(other).toLocaleString() + ' <span style="font-size:1rem;color:#666">元</span>';
        
        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'deed-tax',
    title: '房屋契税计算器 - 2024最新房产交易税费计算',
    description: '在线最新房屋契税计算器，根据国家最新税费政策，精准计算首套房、二套房、三套房的契税金额。支持90平米分界线税率自动匹配。',
    keywords: '契税计算器,房产税费,首套房契税,二套房契税,新房契税,房屋过户费',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group">
          <label>房屋建筑面积</label>
          <div class="input-group">
            <input type="number" id="area" class="form-control" value="89" min="1" step="1">
            <span class="input-group-addon">平方米</span>
          </div>
        </div>
        <div class="form-group">
          <label>房屋网签总价</label>
          <div class="input-group">
            <input type="number" id="price" class="form-control" value="200" min="0" step="0.1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group full-width">
          <label>购房套数情况 (家庭唯一住房标准)</label>
          <select id="homeType" class="form-control">
            <option value="1">首套房 (家庭首次购房)</option>
            <option value="2">二套房 (家庭已有1套住房)</option>
            <option value="3">三套房及以上 (或非普通住宅/商业)</option>
          </select>
        </div>
        <div class="form-group full-width" style="margin-top:10px;">
          <button id="btnCalc" class="btn btn-primary">计算应缴契税金额</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3>税费评估结果</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; text-align:center; padding: 30px;">
            <div class="result-item-title">预估应缴纳契税总额</div>
            <div class="result-item-value" id="resTax" style="font-size: 3rem; margin:15px 0;">0.00 <span style="font-size:1.2rem;color:#666">元</span></div>
            <div id="resRate" style="font-size:1rem;color:var(--primary-color);font-weight:bold;">适用税率：1%</div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">购房契税科普：90平米为什么是道“分水岭”？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>在房屋买卖（无论是新房还是二手房）过户时，<strong>契税</strong>是购房者必须缴纳的一大笔隐性成本。很多第一次买房的年轻人往往只凑齐了首付，到了交房拿证时才发现还要缴纳大几万块的契税，导致手头资金极度紧张。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">全国通用契税征收标准解析</h3>
        <p>根据国家现行规定，个人购买住房的契税税率主要取决于两个核心指标：<strong>是否为家庭唯一住房（首套/二套）</strong>以及<strong>房屋建筑面积是否超过90平方米</strong>。</p>
        <ul>
          <li><strong>首套房：</strong>面积≤90㎡，按 <strong>1%</strong> 征收；面积＞90㎡，按 <strong>1.5%</strong> 征收。</li>
          <li><strong>二套房：</strong>面积≤90㎡，按 <strong>1%</strong> 征收；面积＞90㎡，按 <strong>2%</strong> 征收。（注：北上广深等一线城市的二套房政策可能有部分差异，个别需按3%征收，请以当地实际政策为准）。</li>
          <li><strong>三套及以上或非住宅（如公寓、商铺）：</strong>不分面积大小，一律按 <strong>3%</strong> 的最高税率征收。</li>
        </ul>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">计税基数：按什么价格来算？</h3>
        <p>很多朋友有疑问，契税是按照我买房的实际成交价算吗？严格来说，契税的计税依据是<strong>网签备案总价（不含增值税）</strong>或者当地税务部门的<strong>核定指导价</strong>。在二手房交易中，如果网签价格为了避税被故意做得很低，税务局会调用其内部系统的“评估最低价”来作为计税依据，以高者为准。因此，“阴阳合同”不仅违规，在过户交税时也往往行不通。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 本计算器适用于中华人民共和国境内普通住宅交易的契税预估。</p>
      <p>2. 输入面积时，请以房产证（不动产权证）上的<strong>建筑面积</strong>为准，非套内面积。</p>
      <p>3. 总价应填写网签合同价格。注意契税通常是在开发商交房或二手房过户时缴纳，请务必提前预留这笔现金。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const area = parseFloat(document.getElementById('area').value);
        const price = parseFloat(document.getElementById('price').value) * 10000;
        const type = parseInt(document.getElementById('homeType').value);
        
        if (isNaN(area) || isNaN(price) || area <= 0 || price <= 0) {
          alert('请输入正确的面积和总价');
          return;
        }

        let rate = 0;
        
        if (type === 1) { 
          rate = area <= 90 ? 0.01 : 0.015;
        } else if (type === 2) { 
          rate = area <= 90 ? 0.01 : 0.02;
        } else { 
          rate = 0.03;
        }

        const tax = price * rate;

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        document.getElementById('resTax').innerHTML = Math.round(tax).toLocaleString() + ' <span style="font-size:1.2rem;color:#666">元</span>';
        document.getElementById('resRate').textContent = '适用税率：' + (rate * 100) + '%';
        
        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'down-payment',
    title: '买房首付款计算器 - 在线首付及贷款额度试算',
    description: '快速计算买房首期款及贷款总额。支持不同城市的首付比例设置（两成、三成），帮助您合理规划买房资金，避免首付不足的尴尬。',
    keywords: '首付计算器,买房首付,首套房首付比例,两成首付,贷款额度计算,按揭款估算',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group">
          <label>房产总价</label>
          <div class="input-group">
            <input type="number" id="totalPrice" class="form-control" value="300" min="0" step="1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>首付比例</label>
          <div class="input-group">
            <select id="ratio" class="form-control">
              <option value="15">15% (近期部分新政)</option>
              <option value="20" selected>20% (两成首付)</option>
              <option value="25">25% (两成半)</option>
              <option value="30">30% (三成首付)</option>
              <option value="40">40% (二套房常见)</option>
              <option value="50">50% (非普通住宅)</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
            </select>
          </div>
        </div>
        <div class="form-group full-width">
          <label>预估契税、中介费等过户杂费比例 (约占总价的%)</label>
          <div class="input-group">
            <input type="number" id="extraFee" class="form-control" value="3" min="0" step="0.5">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group full-width" style="margin-top:10px;">
          <button id="btnCalc" class="btn btn-primary">计算启动资金明细</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3>购房资金构成报告</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; border-color: var(--primary-color);">
            <div class="result-item-title" style="color:var(--primary-color)">您买房至少需要准备的现金总额</div>
            <div class="result-item-value" id="resCash" style="font-size: 2.2rem;">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
            <div style="font-size:0.85rem;color:#888;margin-top:5px;">(包含纯首付款 + 契税及中介费等杂项)</div>
          </div>
          <div class="result-item">
            <div class="result-item-title">其中：纯首付款</div>
            <div class="result-item-value" id="resDown">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">其中：税费/中介费</div>
            <div class="result-item-value" id="resExtra">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">向银行申请贷款额</div>
            <div class="result-item-value green" id="resLoan">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">除了首付，买房到底还要准备多少隐性资金？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>很多年轻人在买房时，脑海里只有一个简单的公式：“300万的房子，20%首付，那就是准备60万就够了”。这是一种极其危险的误区，往往会导致在签约甚至过户环节资金断裂。除了净首付，我们还要备好一笔不可忽视的<strong>隐性启动资金</strong>。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">1. 二手房交易的“三座大山”</h3>
        <ul>
          <li><strong>中介费：</strong>通常占成交总价的 1.5% 到 3% 不等。300万的房子，仅中介费可能就要支出 5 万到 9 万的真金白银。</li>
          <li><strong>契税及个税：</strong>如果购买的二手房不满两年（或非满五唯一），还需要缴纳高昂的增值税及附加、个人所得税。即便满足免税条件，1% - 2% 的契税也是无法减免的。</li>
          <li><strong>贷款评估费及担保费：</strong>银行为了防范风险，会委托评估公司对房屋进行价值评估，产生千分之几的评估费，这笔钱也需要买家承担。</li>
        </ul>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">2. 新房/期房的额外支出</h3>
        <p>购买新房虽然没有中介费，但也有另外的开销。交房时需要缴纳<strong>房屋维修基金</strong>（一般按建筑面积每平方米一百多元收取）、大半年的预缴<strong>物业费</strong>，以及面积补差款等。因此，购买新房也应在首付款之上，额外预留 1.5% - 2% 的资金缓冲带。</p>

        <h3 style="margin: 20px 0 10px; color: #111">3. 首付比例政策的变化</h3>
        <p>随着各地楼市调控的差异化，目前很多城市首套房已经可以做到 15% 或 20% 的极低首付比例。首付越低，购房门槛越低，但随之而来的是每月高额的按揭压力。在掏空六个钱包凑首付之前，务必确保您未来 3-5 年的月收入能够稳定覆盖房贷月供。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 输入房屋实际<strong>成交总价</strong>。</p>
      <p>2. 根据当地购房政策，选择您可以享受的<strong>首付比例</strong>。目前多数二线城市首套房已放开至 15%-20%。</p>
      <p>3. <strong>杂费比例：</strong>购买新房建议填 1.5%（契税+维修基金等）；购买二手房建议填 3%-5%（契税+中介费+评估费等）。此比例直接决定了您的安全资金垫。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const total = parseFloat(document.getElementById('totalPrice').value);
        const ratio = parseFloat(document.getElementById('ratio').value) / 100;
        const extraRatio = parseFloat(document.getElementById('extraFee').value) / 100;
        
        if (isNaN(total) || isNaN(ratio) || isNaN(extraRatio) || total <= 0) {
          alert('请输入正确的金额比例');
          return;
        }

        const downPayment = total * ratio;
        const loan = total - downPayment;
        const extraFee = total * extraRatio;
        const totalCash = downPayment + extraFee;

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        document.getElementById('resCash').innerHTML = totalCash.toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        document.getElementById('resDown').innerHTML = downPayment.toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        document.getElementById('resExtra').innerHTML = extraFee.toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        document.getElementById('resLoan').innerHTML = loan.toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        
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
