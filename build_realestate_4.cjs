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
    slug: 'rent-vs-buy',
    title: '租房与买房对比计算器 - 算清人生最大一笔账',
    description: '到底是把钱交首付买房划算，还是拿去理财然后一辈子租房更香？输入房价、租金、房贷与理财利率，计算器用详实的数据模型为您揭晓长期财富答案。',
    keywords: '租房买房比较,租房计算器,买房划算还是租房划算,房贷理财收益对比,机会成本测算',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group full-width">
          <h4 style="border-bottom:2px solid var(--primary-color); display:inline-block; margin-bottom:10px;">房产与资金基础参数</h4>
        </div>
        <div class="form-group">
          <label>目标房产总价</label>
          <div class="input-group">
            <input type="number" id="housePrice" class="form-control" value="300" min="0">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>手头现有的购房首付本金</label>
          <div class="input-group">
            <input type="number" id="cashDown" class="form-control" value="90" min="0">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>商业贷款年利率 (影响买房成本)</label>
          <div class="input-group">
            <input type="number" id="loanRate" class="form-control" value="4.1" step="0.01">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>稳健理财年化收益率 (影响租房资金增值)</label>
          <div class="input-group">
            <input type="number" id="investRate" class="form-control" value="3.5" step="0.01">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>同等品质房屋的每月租金</label>
          <div class="input-group">
            <input type="number" id="monthlyRent" class="form-control" value="5000" min="0" step="100">
            <span class="input-group-addon">元/月</span>
          </div>
        </div>
        <div class="form-group">
          <label>对比周期 (多少年后算总账)</label>
          <select id="years" class="form-control">
            <option value="10">10年</option>
            <option value="20" selected>20年</option>
            <option value="30">30年</option>
          </select>
        </div>
        
        <div class="form-group full-width" style="margin-top:10px;">
          <h4 style="border-bottom:2px solid #8e44ad; display:inline-block; margin-bottom:10px; color:#8e44ad">增值假设 (极度影响最终结论)</h4>
        </div>
        <div class="form-group">
          <label>预估房价每年涨幅/跌幅</label>
          <div class="input-group">
            <input type="number" id="houseGrowth" class="form-control" value="1" step="0.1" placeholder="如跌填负数">
            <span class="input-group-addon">% / 年</span>
          </div>
        </div>
        <div class="form-group">
          <label>预估租金每年上涨幅度</label>
          <div class="input-group">
            <input type="number" id="rentGrowth" class="form-control" value="2" step="0.1">
            <span class="input-group-addon">% / 年</span>
          </div>
        </div>
        
        <div class="form-group full-width">
          <button id="btnCalc" class="btn btn-primary" style="background:#8e44ad; height:50px; font-size:1.1rem;">测算N年后的家庭净资产差距</button>
        </div>
      </div>

      <div class="result-box" id="resultBox" style="border-color:#d2b4de; background:#f9f0ff;">
        <h3 style="color:#8e44ad">财富推演最终裁决</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; text-align:center;">
            <div class="result-item-title" style="color:#111; font-size:1.2rem;">根据当前模型设定，我们建议您：</div>
            <div class="result-item-value" id="resDecision" style="font-size: 2.8rem; margin:10px 0; color:#8e44ad">买房更划算！</div>
            <div id="resDiff" style="font-size:1rem;color:#d9534f;font-weight:bold;">净资产优势：0.00 万元</div>
          </div>
          <div class="result-item" style="border-left: 4px solid var(--primary-color);">
            <div class="result-item-title">路线 A：买房持有一套房产</div>
            <div class="result-item-value" id="resBuyAsset" style="color:var(--primary-color)">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
            <div style="font-size:0.8rem;color:#666;margin-top:5px;">期末房产估值扣除剩余贷款后的净资产</div>
          </div>
          <div class="result-item" style="border-left: 4px solid #27ae60;">
            <div class="result-item-title">路线 B：租房并坚持长期理财</div>
            <div class="result-item-value" id="resRentAsset" style="color:#27ae60">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
            <div style="font-size:0.8rem;color:#666;margin-top:5px;">期末理财复利本息扣除多年租金后的净现金</div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">掏空六个钱包去买房，真的比一辈子租房好吗？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>这是每一个漂泊在一二线城市的年轻人必然会面临的终极拷问。传统观念认为“租房是在帮房东还房贷，买房是给自己强制储蓄”。这种观念在过去房价暴涨的时代是绝对真理，但在今天的房地产新周期里，这本账需要拿计算器仔细算一算了。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">租房的本质：放弃资产增值，换取现金流自由</h3>
        <p>选择租房的人，并不是“穷得买不起”，有些是极度理性的财务决策。他们手握百万现金，如果不付首付，而是购买年化收益 4% 的稳健理财，光利息一年就有 4 万块，基本可以覆盖很大一部分甚至全部的租金支出。这种“用利息租房”的模式下，百万本金一分不少，而且他们完全不需要背负每个月雷打不动的沉重房贷月供。只要<strong>理财收益率远高于租金回报率</strong>，租房在财务上是绝对占优的。</p>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">买房的本质：利用三倍杠杆下注城市的未来</h3>
        <p>选择买房，核心驱动力除了丈母娘的要求和学区等软性需求外，最大的金融属性是<strong>杠杆</strong>。如果您首付 30 万买了一套 100 万的房子，当房价上涨 10%（变成110万），虽然房子只涨了10万，但相对您 30 万的本金而言，您的实际收益率高达 33%。这种带杠杆的暴击，是任何安全理财都无法比拟的。</p>
        <p><strong>但是，杠杆的反噬同样可怕。</strong>如果房价每年下跌 2%，不仅首付跌没了，您每个月还要顶着高息继续给银行还贷款。这就是为什么计算器中“预估房价涨跌幅”这个参数会对最终结果产生决定性影响的原因。</p>

        <h3 style="margin: 20px 0 10px; color: #111">终极裁决标准</h3>
        <p>如果计算得出的期末家庭净资产，买房路线胜出，说明该地段的房价预期涨幅能覆盖掉高昂的贷款利息；如果租房路线胜出，那么从纯财务角度来说，将首付拿在手里生息，才是守住财富的更优解。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 本计算器采用极其严密的金融复利折现模型。</p>
      <p>2. <strong>买房路线算法：</strong>期末房产市值 - 尚未还清的贷款余本。</p>
      <p>3. <strong>租房路线算法：</strong>把准备买房的“首付本金”投入理财，同时每个月把原本要还的“房贷月供与租金的差额”也定投买入理财。算复利，扣除每年递增的租金。</p>
      <p>4. 改变<strong>房价涨跌幅</strong>参数，您会发现结论经常产生惊天逆转。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const housePrice = parseFloat(document.getElementById('housePrice').value) * 10000;
        const downPay = parseFloat(document.getElementById('cashDown').value) * 10000;
        const loanRate = parseFloat(document.getElementById('loanRate').value) / 100;
        const investRate = parseFloat(document.getElementById('investRate').value) / 100;
        const initRent = parseFloat(document.getElementById('monthlyRent').value);
        const years = parseInt(document.getElementById('years').value);
        const houseGrowth = parseFloat(document.getElementById('houseGrowth').value) / 100;
        const rentGrowth = parseFloat(document.getElementById('rentGrowth').value) / 100;

        if (isNaN(housePrice) || isNaN(downPay) || housePrice <= downPay) {
          alert('房产总价需大于首付金额');
          return;
        }

        const loanAmt = housePrice - downPay;
        const months = years * 12;
        const monthLoanRate = loanRate / 12;
        const monthInvestRate = investRate / 12;

        // 路线A：买房
        // 假设等额本息还清，计算期末房产价值
        // 注意：为简化对比，假设贷款期就等于对比的年限
        let endHouseValue = housePrice * Math.pow(1 + houseGrowth, years);
        // 如果贷款刚好还清，净资产就是房子的市值
        let buyNetAsset = endHouseValue; 

        // 算出每个月的房贷月供
        let monthlyMortgage = (loanAmt * monthLoanRate * Math.pow(1 + monthLoanRate, months)) / (Math.pow(1 + monthLoanRate, months) - 1);

        // 路线B：租房
        // 1. 首付本金全拿去买理财产生复利
        let investAsset = downPay * Math.pow(1 + investRate, years);
        
        // 2. 每个月“本来要交的月供 - 实际交的租金”这笔差额也存起来定投理财
        let currentRent = initRent;
        let cumulativeRentSavingInvest = 0; // 差额定投积累的财富
        
        // 逐年模拟，因为租金每年上涨
        for (let y = 1; y <= years; y++) {
          // 这一年的每月差额定投计算
          for (let m = 1; m <= 12; m++) {
            let saveMoney = monthlyMortgage - currentRent;
            // 把每个月省下的钱算入定投资金池，按月复利
            cumulativeRentSavingInvest = (cumulativeRentSavingInvest + saveMoney) * (1 + monthInvestRate);
          }
          // 年底租金上涨
          currentRent = currentRent * (1 + rentGrowth);
        }

        let rentNetAsset = investAsset + cumulativeRentSavingInvest;

        // 显示结果
        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        document.getElementById('resBuyAsset').innerHTML = (buyNetAsset / 10000).toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        document.getElementById('resRentAsset').innerHTML = (rentNetAsset / 10000).toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        
        let diff = (buyNetAsset - rentNetAsset) / 10000;
        let decisionEl = document.getElementById('resDecision');
        let diffEl = document.getElementById('resDiff');
        
        if (diff > 0) {
          decisionEl.textContent = '果断买房，上车入场！';
          decisionEl.style.color = 'var(--primary-color)';
          diffEl.textContent = '买房净资产优势多出：' + diff.toFixed(2) + ' 万元';
          diffEl.style.color = 'var(--primary-color)';
        } else {
          decisionEl.textContent = '租房理财，远离套牢！';
          decisionEl.style.color = '#27ae60';
          diffEl.textContent = '租房净资产优势多出：' + Math.abs(diff).toFixed(2) + ' 万元';
          diffEl.style.color = '#27ae60';
        }

        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'rent-yield',
    title: '房屋租金回报率计算器 (租售比) - 评估房产变现价值',
    description: '秒算房产的真实租金回报率与租售比。通过年租金与购房总成本的比例，帮您客观判断该地段房屋是否具备投资与长期持有价值，识别房价泡沫。',
    keywords: '租金回报率,租售比计算器,买房收租收益率,房地产投资价值评估',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group">
          <label>当前房屋市场评估总价</label>
          <div class="input-group">
            <input type="number" id="housePrice" class="form-control" value="200" min="0">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>该房屋每月租金收入</label>
          <div class="input-group">
            <input type="number" id="monthRent" class="form-control" value="3000" min="0" step="100">
            <span class="input-group-addon">元/月</span>
          </div>
        </div>
        <div class="form-group">
          <label>每年空置期 (找不到租客的空窗期)</label>
          <div class="input-group">
            <input type="number" id="emptyMonths" class="form-control" value="1" min="0" step="0.5">
            <span class="input-group-addon">个月/年</span>
          </div>
        </div>
        <div class="form-group">
          <label>每年物业费、维修金等持有开销</label>
          <div class="input-group">
            <input type="number" id="yearFee" class="form-control" value="3000" min="0" step="100">
            <span class="input-group-addon">元/年</span>
          </div>
        </div>
        <div class="form-group full-width" style="margin-top:10px;">
          <button id="btnCalc" class="btn btn-primary" style="background:#d35400;">诊断房产收租能力</button>
        </div>
      </div>

      <div class="result-box" id="resultBox" style="border-color:#f5b041; background:#fef9e7;">
        <h3 style="color:#d35400">房屋租赁投资价值报告</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; text-align:center;">
            <div class="result-item-title" style="color:#111;">实际年化租金回报率</div>
            <div class="result-item-value" id="resYield" style="font-size: 3rem; margin:10px 0; color:#d35400">0.00%</div>
            <div id="yieldDesc" style="font-size:0.95rem;color:#888; font-weight:bold; margin-top:5px;"></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">房屋静态租售比</div>
            <div class="result-item-value" id="resRatio" style="color:#555;">1 : 0</div>
            <div style="font-size:0.8rem;color:#888;margin-top:5px;">需要多少个月租金才能收回买房成本</div>
          </div>
          <div class="result-item">
            <div class="result-item-title">每年纯到手净租金</div>
            <div class="result-item-value" id="resNetRent" style="color:#555;">0.00 <span style="font-size:1rem;color:#666">元</span></div>
            <div style="font-size:0.8rem;color:#888;margin-top:5px;">已扣除空置期与物业杂费</div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">挤干房价水分的终极指标：什么是健康的租金回报率？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>很多长辈热衷于买房收租，认为“一铺养三代”、“收租金是最稳妥的养老方式”。但如果用金融逻辑去深究，很多时候“包租婆”的收益率可能还不如把钱存进银行大额存单里。衡量房产真实变现价值的最核心指标就是：<strong>租金回报率</strong>与<strong>租售比</strong>。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">国际惯例与中国特色</h3>
        <p>在成熟发达国家的房地产市场中，健康的租金回报率通常在 <strong>4% - 6%</strong> 之间（即租售比约为 1:200 到 1:300 之间，意思是出租两百多个月就能收回买房成本）。只有达到这个水平，买房收租才具备抗击通胀和资产保值的意义。</p>
        <p>而在中国过去十几年的楼市狂热中，一二线城市的房价被不断推高，但老百姓的收入水平（决定了租金购买力）并没有同比例暴涨。这导致了目前中国许多大城市的租金回报率被严重压缩到 <strong>1.5% 甚至 1% 以下</strong>。</p>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">1.5% 的回报率意味着什么？</h3>
        <p>如果一套 200万的房子，扣除物业费和空置期后，一年净租金只有 3万块（回报率1.5%）。这意味着：</p>
        <ul>
          <li><strong>回本遥遥无期：</strong>您需要连续出租近 70 年，才能收回当时买房的本金，这甚至超过了房屋的产权年限。</li>
          <li><strong>跑不赢理财：</strong>随便买一个 3% 的稳健国债，200万本金一年就能无风险躺赚 6 万，是收租的两倍，还不用操心马桶堵了、租客跑路等糟心事。</li>
        </ul>
        <p>因此，在房价告别暴涨阶段、回归居住属性的今天，如果一套房子的租金回报率低于 2%，从纯投资角度而言，它其实是一项“劣质资产”。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. <strong>房屋总价：</strong>不要填当年的买入价，请填这套房子如果在今天二手房市场上卖掉的真实评估价。</p>
      <p>2. <strong>空置期扣减：</strong>这是很多房东算账时会忽略的陷阱。老租客搬走到新租客入住，通常会有半个月到一个月的空窗期，这段时间是没有租金收入的。</p>
      <p>3. <strong>物业杂费：</strong>房东一般需要承担物业费、取暖费，偶尔还有家电维修的折旧费，这些都要从年租金中扣除。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const housePrice = parseFloat(document.getElementById('housePrice').value) * 10000;
        const monthRent = parseFloat(document.getElementById('monthRent').value);
        const emptyMonths = parseFloat(document.getElementById('emptyMonths').value);
        const yearFee = parseFloat(document.getElementById('yearFee').value);

        if (isNaN(housePrice) || isNaN(monthRent) || housePrice <= 0) {
          alert('请检查输入数值');
          return;
        }

        // 每年实际收到租金的月份
        const activeMonths = 12 - emptyMonths;
        const grossRent = monthRent * activeMonths;
        const netRent = grossRent - yearFee;

        // 租金回报率 = 年净租金 / 房屋总价
        let yieldRate = (netRent / housePrice) * 100;
        if (yieldRate < 0) yieldRate = 0; // 极度亏损

        // 静态租售比 = 房屋总价 / 月租金
        const ratioMonths = Math.round(housePrice / monthRent);

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        document.getElementById('resYield').textContent = yieldRate.toFixed(2) + '%';
        document.getElementById('resRatio').textContent = '1 : ' + ratioMonths;
        document.getElementById('resNetRent').innerHTML = netRent.toLocaleString() + ' <span style="font-size:1rem;color:#666">元</span>';
        
        let desc = '';
        if (yieldRate < 2) desc = '低于2%：严重跑输理财，属于高溢价资产，除非您笃定房价必定大涨，否则收租极不划算。';
        else if (yieldRate < 4) desc = '2% - 4%：中国目前主流城市的平均水准，收租回报勉勉强强。';
        else if (yieldRate < 6) desc = '4% - 6%：非常健康的现金牛资产！具备优秀的抗风险和长期持有价值。';
        else desc = '大于6%：恭喜您挖到了宝藏！属于极度优质的收租神盘。';
        
        document.getElementById('yieldDesc').textContent = desc;
        
        if (yieldRate < 2) document.getElementById('resYield').style.color = '#e74c3c';
        else if (yieldRate > 4) document.getElementById('resYield').style.color = '#27ae60';
        else document.getElementById('resYield').style.color = '#f39c12';

        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'rental-cost',
    title: '租房入住成本计算器 - 押一付三与中介费预估',
    description: '刚毕业租房不知道要准备多少钱？一键计算押一付三、押二付一、中介费、宽带水电预缴费等初次租房启动资金，防止被黑心房东坑骗。',
    keywords: '租房计算器,押一付三,租房中介费,租房要准备多少钱,入住成本预估',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group">
          <label>协商月租金</label>
          <div class="input-group">
            <input type="number" id="rent" class="form-control" value="2500" min="0" step="100">
            <span class="input-group-addon">元/月</span>
          </div>
        </div>
        <div class="form-group">
          <label>租金支付方式</label>
          <select id="payWay" class="form-control">
            <option value="1">押一付三 (付3个月租金 + 1个月押金)</option>
            <option value="2">押一付一 (常见于长租公寓)</option>
            <option value="3">押二付一 (南方部分城市常见)</option>
            <option value="4">押一付六 (半年付，通常有一定折扣)</option>
            <option value="5">年付 (一次交清12个月，最高折扣)</option>
          </select>
        </div>
        <div class="form-group">
          <label>中介费承担比例</label>
          <select id="agencyRate" class="form-control">
            <option value="0">房东直租 (无中介费0%)</option>
            <option value="50" selected>买卖双方各半 (交50%月租金)</option>
            <option value="100">承租方全包 (交100%月租金)</option>
          </select>
        </div>
        <div class="form-group">
          <label>预缴杂费 (宽带/水电煤/物业押金)</label>
          <div class="input-group">
            <input type="number" id="extraFee" class="form-control" value="500" min="0" step="50">
            <span class="input-group-addon">元</span>
          </div>
        </div>
        <div class="form-group full-width" style="margin-top:10px;">
          <button id="btnCalc" class="btn btn-primary" style="background:#1abc9c;">生成入住启动资金清单</button>
        </div>
      </div>

      <div class="result-box" id="resultBox" style="border-color:#a3e4d7; background:#e8f8f5;">
        <h3 style="color:#117a65">签约入住所需资金</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; text-align:center;">
            <div class="result-item-title" style="color:#111;">签合同时您需要一次性支付的总金额</div>
            <div class="result-item-value" id="resTotal" style="font-size: 2.8rem; margin:10px 0; color:#1abc9c">0 <span style="font-size:1.2rem;color:#666">元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">其中：将沉淀的押金本金 (退租可退)</div>
            <div class="result-item-value" id="resDeposit" style="color:#f39c12">0 <span style="font-size:1rem;color:#666">元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">其中：预付的房租开销</div>
            <div class="result-item-value" id="resPrepay" style="color:#555">0 <span style="font-size:1rem;color:#666">元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">其中：纯损耗掉的中介费</div>
            <div class="result-item-value" id="resAgency" style="color:#d9534f">0 <span style="font-size:1rem;color:#666">元</span></div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">避坑防指南：第一次租房，到底要准备几个月的房租？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>很多刚毕业的大学生在找房子时，看到 App 上写着“月租金 2000 元”，就天真地以为兜里揣着 2000 块钱就能搬进去住了。到了签合同拿钥匙的那一刻才发现，中介拿出的账单金额可能高达 8000 多块钱！这就是租房市场里残酷的<strong>“入住启动成本”</strong>。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">万恶之源：押一付三的规矩是怎么来的？</h3>
        <p>目前国内绝大多数传统的二手房中介（如链家、我爱我家等）及个人房东直租，最主流的付款方式就是<strong>“押一付三”</strong>。也就是您在第一天入住时，必须立刻交齐：1个月的房租作为房屋损坏押金，以及未来3个月的预付房租。也就是说，2000的房子，光这笔钱就要 8000 元。</p>
        <p>为什么房东喜欢押一付三？因为按月收租太麻烦，而且一旦租客中途跑路，押一付一的房东损失极大。通过一连收取三个月的租金，房东牢牢地锁死了租客的资金流。</p>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">难以避开的半个月中介费</h3>
        <p>除了押一付三，如果您是通过中介找的房子，还得被抽走一笔中介费。行规一般是<strong>租客和房东各承担 50%</strong>的单月租金（部分强势市场的旺季，中介甚至要求租客承担 100%）。这 1000 块钱是一次性付出的服务费，退房时是绝对不会退给您的。</p>

        <h3 style="margin: 20px 0 10px; color: #111">长租公寓的“押一付一”陷阱</h3>
        <p>自如、泊寓等长租公寓品牌为了吸引年轻人，打出了“押一付一”的诱人广告。确实，首期付款压力骤减。但请注意，它们通常会强制收取每个月高达房租 8% 到 10% 的“服务费/管理费”。羊毛出在羊身上，算成全年的总支出，长租公寓往往比传统租房更昂贵。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. <strong>月租金：</strong>这指的是最终砍价确认后的单月纯租金。</p>
      <p>2. <strong>支付方式：</strong>北方城市最常见“押一付三”；深圳广州等南方城市很多城中村则是“押二付一”。长租公寓通常支持“押一付一”。</p>
      <p>3. <strong>额外杂费：</strong>搬进新家通常要提前预充值 100 块钱电费、垫付几十块钱水费，甚至还要自行去宽带营业厅开通包年网络（数百元）。请把这些隐性开支也预估在内。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const rent = parseFloat(document.getElementById('rent').value);
        const payWay = document.getElementById('payWay').value;
        const agencyRate = parseFloat(document.getElementById('agencyRate').value) / 100;
        const extraFee = parseFloat(document.getElementById('extraFee').value);

        if (isNaN(rent) || isNaN(extraFee) || rent <= 0) {
          alert('请检查输入数值');
          return;
        }

        let yajinMonths = 0;
        let fuzuMonths = 0;

        switch(payWay) {
          case '1': yajinMonths = 1; fuzuMonths = 3; break;
          case '2': yajinMonths = 1; fuzuMonths = 1; break;
          case '3': yajinMonths = 2; fuzuMonths = 1; break;
          case '4': yajinMonths = 1; fuzuMonths = 6; break;
          case '5': yajinMonths = 1; fuzuMonths = 12; break;
        }

        const depositMoney = rent * yajinMonths;
        const prepayMoney = rent * fuzuMonths;
        const agencyMoney = rent * agencyRate;

        const totalCost = depositMoney + prepayMoney + agencyMoney + extraFee;

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        document.getElementById('resTotal').innerHTML = totalCost.toLocaleString() + ' <span style="font-size:1.2rem;color:#666">元</span>';
        document.getElementById('resDeposit').innerHTML = depositMoney.toLocaleString() + ' <span style="font-size:1rem;color:#666">元</span>';
        document.getElementById('resPrepay').innerHTML = prepayMoney.toLocaleString() + ' <span style="font-size:1rem;color:#666">元</span>';
        document.getElementById('resAgency').innerHTML = agencyMoney.toLocaleString() + ' <span style="font-size:1rem;color:#666">元</span>';

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
