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
    slug: 'prepayment',
    title: '房贷提前还款计算器 - 缩短年限与减少月供对比',
    description: '精准测算房贷提前部分还款能为您节省多少利息。支持“缩短还款期限”与“减少月供，期限不变”两种策略对比，助您科学规划手头闲置资金。',
    keywords: '提前还款计算器,房贷提前还贷,缩短还款年限,减少月供,房贷节省利息计算',
    htmlContent: `
      <div style="background:#f5f8fc; padding:15px; border-radius:6px; margin-bottom:20px; font-size:0.9rem;">
        计算模型基于“等额本息”。若您手头有闲钱，测算一下提前还给银行能省多少利息。
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>原贷款总额</label>
          <div class="input-group">
            <input type="number" id="totalLoan" class="form-control" value="100" min="1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>原贷款期限</label>
          <div class="input-group">
            <select id="totalYears" class="form-control">
              <option value="20">20年 (240期)</option>
              <option value="30" selected>30年 (360期)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>当前执行年利率</label>
          <div class="input-group">
            <input type="number" id="rate" class="form-control" value="4.1" step="0.01">
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="form-group">
          <label>已还款时间 (过去多久了)</label>
          <div class="input-group">
            <input type="number" id="paidYears" class="form-control" value="3" step="0.5">
            <span class="input-group-addon">年</span>
          </div>
        </div>
        <div class="form-group full-width" style="margin-top:10px;">
          <h4 style="border-bottom:2px solid var(--primary-color); display:inline-block; margin-bottom:10px;">提前还款计划</h4>
        </div>
        <div class="form-group">
          <label>计划提前归还本金</label>
          <div class="input-group">
            <input type="number" id="prepayAmount" class="form-control" value="20" min="1">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>提前还款后的处理方式</label>
          <select id="handleType" class="form-control">
            <option value="1">缩短还款期限 (月供不变，最省利息)</option>
            <option value="2">减少每月月供 (期限不变，减轻压力)</option>
          </select>
        </div>
        <div class="form-group full-width">
          <button id="btnCalc" class="btn btn-primary">测算提前还款收益</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3 style="color:#d9534f">测算结论</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; text-align:center;">
            <div class="result-item-title">通过提前还款，您总共可节省利息支出：</div>
            <div class="result-item-value green" id="resSaveInt" style="font-size: 2.5rem; margin:10px 0;">0.00 <span style="font-size:1.2rem;color:#666">万元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title" id="resNewStatusTitle">新贷款状态</div>
            <div class="result-item-value" id="resNewStatus" style="font-size: 1.2rem; color:#111; margin-top:10px;">-</div>
          </div>
          <div class="result-item">
            <div class="result-item-title">剩余需要偿还的未清本金</div>
            <div class="result-item-value" id="resRemainP" style="font-size: 1.2rem; color:#111; margin-top:10px;">0.00 万元</div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">手里有闲钱，到底是提前还贷还是买理财？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>近两年，“提前还贷潮”频频登上热搜，很多年轻人排着队把辛辛苦苦攒下的几十万存款提前打入银行账户。这种行为背后，折射出的是大众对理财市场收益预期的降低，以及“无贷一身轻”的朴素愿望。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">理财收益率 vs 房贷利率的残酷对决</h3>
        <p>要不要提前还贷，财务上的判断标准极其简单：<strong>您手头闲钱的理财年化收益，能否跑赢您的房贷执行利率？</strong></p>
        <p>假设您的房贷利率是 4.5%，而现在大额存单或者稳健型理财的年化收益只能做到 2.5% 到 3%。这就意味着，您把钱存在银行赚取的微薄利息，远不够支付您向银行借款的利息代价（中间存在负利差）。在这种情况下，<strong>将闲置现金用于提前还贷，就等同于购买了一份保本保息、年化收益高达 4.5% 的超级理财产品</strong>。可以说，这是稳赚不赔的买卖。</p>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">缩短期限 还是 减少月供？</h3>
        <p>在向银行申请提前部分还款时，银行通常会给您两个选项：</p>
        <ul>
          <li><strong>缩短还款期限（月供基本不变）：</strong>这是<strong>最能节省利息</strong>的方式。因为您抹去了未来好几年的资金占用时间，极大压榨了银行的利润空间。适合目前月供毫无压力，只想早点结清债务的人。</li>
          <li><strong>减少每月月供（期限不变）：</strong>这种方式省下的利息不如前者多，但它可以立竿见影地<strong>降低您每个月的生活压力</strong>。适合近期收入下降、或者有了孩子后家庭日常开销陡增的人群。</li>
        </ul>
        <p>使用本站的计算器，您可以直观对比这两种方式能为您省下多少“真金白银”。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 请输入您当初买房时的<strong>原始贷款总额</strong>和<strong>贷款期限</strong>。</p>
      <p>2. 输入您目前实际的执行利率（如果您不清楚，可以查看手机银行贷款合同信息）。</p>
      <p>3. <strong>已还款时间：</strong>例如您买房已经还了3年半的贷款，则填 3.5。</p>
      <p>4. 填入您准备提前还多少本金，测算省下的利息结果。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const totalLoan = parseFloat(document.getElementById('totalLoan').value) * 10000;
        const totalMonths = parseInt(document.getElementById('totalYears').value) * 12;
        const rate = parseFloat(document.getElementById('rate').value) / 100 / 12;
        const paidMonths = parseFloat(document.getElementById('paidYears').value) * 12;
        const prepayAmount = parseFloat(document.getElementById('prepayAmount').value) * 10000;
        const handleType = document.getElementById('handleType').value;

        if (isNaN(totalLoan) || isNaN(rate) || isNaN(paidMonths) || isNaN(prepayAmount)) {
          alert('请检查输入数值');
          return;
        }

        // 计算原始月供 (等额本息)
        const oldMonthPay = (totalLoan * rate * Math.pow(1 + rate, totalMonths)) / (Math.pow(1 + rate, totalMonths) - 1);
        
        // 计算已还本金
        const remainMonthsOld = totalMonths - paidMonths;
        if (remainMonthsOld <= 0) return alert('已还清贷款');
        
        // 剩余本金推导公式
        const remainPrincipal = oldMonthPay * (Math.pow(1 + rate, remainMonthsOld) - 1) / (rate * Math.pow(1 + rate, remainMonthsOld));
        
        if (prepayAmount >= remainPrincipal) {
          alert('提前还款金额不能大于剩余未还本金');
          return;
        }

        const newRemainPrincipal = remainPrincipal - prepayAmount;
        let saveInt = 0;
        let newStatus = '';

        // 不提前还款时的剩余总利息
        const oldRemainInt = oldMonthPay * remainMonthsOld - remainPrincipal;

        if (handleType === '1') {
          // 缩短期限，月供不变
          // 计算新期限
          let n = Math.log(oldMonthPay / (oldMonthPay - newRemainPrincipal * rate)) / Math.log(1 + rate);
          let newRemainMonths = Math.ceil(n);
          let newRemainInt = oldMonthPay * newRemainMonths - newRemainPrincipal;
          saveInt = oldRemainInt - newRemainInt;
          
          let savedMonths = remainMonthsOld - newRemainMonths;
          document.getElementById('resNewStatusTitle').textContent = '月供不变，提前结清';
          newStatus = '缩短还款期限 <strong style="color:var(--primary-color)">' + Math.floor(savedMonths/12) + '年' + (savedMonths%12) + '个月</strong><br>新月供维持：' + oldMonthPay.toFixed(2) + ' 元';
        } else {
          // 减少月供，期限不变
          let newMonthPay = (newRemainPrincipal * rate * Math.pow(1 + rate, remainMonthsOld)) / (Math.pow(1 + rate, remainMonthsOld) - 1);
          let newRemainInt = newMonthPay * remainMonthsOld - newRemainPrincipal;
          saveInt = oldRemainInt - newRemainInt;
          
          let monthSave = oldMonthPay - newMonthPay;
          document.getElementById('resNewStatusTitle').textContent = '期限不变，月供锐减';
          newStatus = '每月月供将减少 <strong style="color:var(--primary-color)">' + monthSave.toFixed(2) + ' 元</strong><br>新月供降至：' + newMonthPay.toFixed(2) + ' 元';
        }

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        document.getElementById('resSaveInt').innerHTML = (saveInt / 10000).toFixed(2) + ' <span style="font-size:1.2rem;color:#666">万元</span>';
        document.getElementById('resNewStatus').innerHTML = newStatus;
        document.getElementById('resRemainP').innerHTML = (newRemainPrincipal / 10000).toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
        
        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'property-fee',
    title: '物业费计算器 - 快速预估全年及长期物业支出',
    description: '在线快速计算小区物业管理费。支持按房屋建筑面积与单价计算，可一次性预估1年、5年甚至70年的长期物业支出总额。',
    keywords: '物业费计算器,物业费怎么算,小区管理费,公摊物业费',
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
          <label>物业费单价</label>
          <div class="input-group">
            <input type="number" id="price" class="form-control" value="2.5" min="0" step="0.1">
            <span class="input-group-addon">元/㎡/月</span>
          </div>
        </div>
        <div class="form-group full-width" style="margin-top:10px;">
          <button id="btnCalc" class="btn btn-primary">计算物业开支</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3 style="color:#2c3e50">物业费账单估算</h3>
        <table style="width:100%; border-collapse: collapse; margin-top:15px; background:#fff; text-align:center;">
          <thead>
            <tr style="background:#f1f1f1;">
              <th style="padding:10px; border:1px solid #ddd;">计费周期</th>
              <th style="padding:10px; border:1px solid #ddd;">预估支出金额</th>
            </tr>
          </thead>
          <tbody id="feeBody">
            <!-- JS 填充 -->
          </tbody>
        </table>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">买房不可忽视的“终身负债”：物业费</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>在购买房产时，很多购房者所有的注意力都放在了房价和房贷上，却往往忽略了一个从交房那天起、将伴随您这套房子一生的固定支出——<strong>物业管理费</strong>。这其实可以看作是一笔长期的“隐性负债”。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">物业费到底是怎么算出来的？</h3>
        <p>目前国内绝大多数小区的物业费计费标准都是：<code>房屋产权建筑面积 × 物业单价（元/㎡/月）</code>。需要特别注意的是，<strong>公摊面积是包含在内一起计费的！</strong></p>
        <p>举个例子：如果您买了一套 120 平米的高层住宅，公摊率高达 25%，意味着您的实际套内使用面积只有 90 平米。但是，您每个月缴纳物业费时，依然必须按照 120 平米来全额缴纳。这就是为什么很多业主经常抱怨“我花钱养着公摊走廊的灯和保安”的原因。</p>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">70年产权背后的巨额账单</h3>
        <p>以一套 100平米的房子、3元/㎡/月的物业费为例。一个月看起来似乎只有 300 块钱，但一年就是 3600 元。如果您打算在这套房子里住上 30 年，那么您累计交给物业的钱将超过 10 万大关！如果考虑通货膨胀和未来物业费的上调，这笔数字将更加惊人。</p>
        <p>因此，在购买二手房或新房时，务必提前打听好该小区的物业收费标准。对于改善型大平层或是别墅，每个月动辄大几千的物业费，甚至比很多刚需盘的房贷月供还要高，这直接影响着您的现金流健康。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. 填入房产证上的<strong>建筑总面积</strong>（如果是期房，请填写购房合同上的预测建筑面积）。</p>
      <p>2. 填入小区公示的物业费单价。老旧小区一般在 0.5-1.5元，普通商品房在 1.5-3.5元，高端改善盘通常在 4元以上。</p>
      <p>3. 点击计算后可查看未来各阶段的物业总支出情况。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const area = parseFloat(document.getElementById('area').value);
        const price = parseFloat(document.getElementById('price').value);

        if (isNaN(area) || isNaN(price) || area <= 0 || price < 0) {
          alert('请检查输入数值');
          return;
        }

        const monthFee = area * price;
        const yearFee = monthFee * 12;

        const tbody = document.getElementById('feeBody');
        tbody.innerHTML = '';

        const rows = [
          { label: '单月支出', val: monthFee },
          { label: '全年支出 (12个月)', val: yearFee },
          { label: '五年累计', val: yearFee * 5 },
          { label: '二十年累计', val: yearFee * 20 },
          { label: '七十年长跑 (假设单价不变)', val: yearFee * 70 }
        ];

        rows.forEach(r => {
          let style = r.label.includes('全年') ? 'font-weight:bold; color:var(--primary-color);' : '';
          tbody.innerHTML += \`
            <tr>
              <td style="padding:10px; border:1px solid #ddd; \${style}">\${r.label}</td>
              <td style="padding:10px; border:1px solid #ddd; \${style}">\${r.val.toLocaleString()} 元</td>
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
    slug: 'property-roi',
    title: '房产投资回报率计算器 - 算清买房真实收益',
    description: '投资房产到底赚没赚钱？在线计算房产投资的年化收益率（ROI），综合考量买入总价、卖出价、房贷利息、折旧费及租金收入，还原真实投资表现。',
    keywords: '房产投资回报率,炒房收益计算,买房年化收益,ROI计算,租金回报综合测算',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group full-width">
          <h4 style="border-bottom:2px solid var(--primary-color); display:inline-block; margin-bottom:10px;">买入成本 (持有期间开销)</h4>
        </div>
        <div class="form-group">
          <label>买入时房屋总价</label>
          <div class="input-group">
            <input type="number" id="buyPrice" class="form-control" value="200" min="0">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>首付 + 各种税费/中介费总投入</label>
          <div class="input-group">
            <input type="number" id="downPay" class="form-control" value="70" min="0">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>持有期间支付给银行的总利息</label>
          <div class="input-group">
            <input type="number" id="totalInterest" class="form-control" value="15" min="0">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>装修及折旧维护费</label>
          <div class="input-group">
            <input type="number" id="renovation" class="form-control" value="10" min="0">
            <span class="input-group-addon">万元</span>
          </div>
        </div>

        <div class="form-group full-width" style="margin-top:10px;">
          <h4 style="border-bottom:2px solid #27ae60; display:inline-block; margin-bottom:10px; color:#27ae60">卖出变现与租金收益</h4>
        </div>
        <div class="form-group">
          <label>卖出时实际到手总价</label>
          <div class="input-group">
            <input type="number" id="sellPrice" class="form-control" value="250" min="0">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group">
          <label>持有总年数</label>
          <div class="input-group">
            <input type="number" id="holdYears" class="form-control" value="5" min="0.1" step="0.5">
            <span class="input-group-addon">年</span>
          </div>
        </div>
        <div class="form-group full-width">
          <label>持有期间累计收取的总租金 (如自住可折算为省下的租金)</label>
          <div class="input-group">
            <input type="number" id="totalRent" class="form-control" value="12" min="0">
            <span class="input-group-addon">万元</span>
          </div>
        </div>
        <div class="form-group full-width">
          <button id="btnCalc" class="btn btn-primary" style="background:#2c3e50;">核算真实年化收益率</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3 style="color:#2c3e50">投资回报测算结果</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; text-align:center; background:#fdf8e4;">
            <div class="result-item-title" style="color:#8a6d3b">您的房产综合真实年化收益率 (ROI)</div>
            <div class="result-item-value" id="resROI" style="font-size: 3rem; margin:10px 0; color:#d9534f">0.00%</div>
            <div id="roiDesc" style="font-size:0.9rem;color:#666;">评价：</div>
          </div>
          <div class="result-item">
            <div class="result-item-title">持有期间净赚利润 (绝对值)</div>
            <div class="result-item-value" id="resProfit">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">本金(自有资金)总投入</div>
            <div class="result-item-value" id="resInvest">0.00 <span style="font-size:1rem;color:#666">万元</span></div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">闭眼买房的时代结束了，你的房产真的赚钱了吗？</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>在过去房地产暴涨的黄金二十年里，只要买了房就是赚。但很多人算账其实是一笔“糊涂账”：200万买入的房子，5年后250万卖出，就沾沾自喜地以为自己“血赚了 50 万”。但如果把隐性成本算进去，真相往往极其残酷。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">扒开买房利润的“底裤”</h3>
        <p>真实房产投资回报必须扣减以下高昂的<strong>沉没成本</strong>：</p>
        <ul>
          <li><strong>资金占用成本：</strong>如果您首付花了 70 万，这笔钱如果拿去买哪怕是最保守的理财产品（按3%算），5年也有 10万块利息收入，这就是您买房的机会成本。</li>
          <li><strong>房贷利息吞噬：</strong>很多房子表面上网签价涨了，但由于前几年还的月供里极高比例是利息，这些交给银行的利息直接对冲掉了房价涨幅。</li>
          <li><strong>交易摩擦成本与折旧：</strong>契税、中介费（买入卖出双向）、几十万的装修折旧，一进一出，能吃掉十几万的利润。</li>
        </ul>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">如何才算一笔成功的房产投资？</h3>
        <p>通过我们的计算器，我们将（卖出价 + 租金收入）减去（买入价 + 已付利息 + 装修杂费），算出真正的净利润，再除以您的实际投入本金和年份，得出<strong>年化投资回报率 (ROI)</strong>。</p>
        <p>在当前的存量房时代：如果这个数字大于 <strong>4%</strong>，那么恭喜您，您的眼光已经跑赢了绝大多数理财产品；如果这个数字低于 <strong>2%</strong> 甚至是负数，这意味着这套房子正在成为您家庭资产负债表上的“失血点”，您需要重新评估这笔资产的去留。</p>
      </article>
    `,
    sidebarGuide: `
      <p>1. <strong>买入总价：</strong>填写当年网签或者实际成交的裸房价格。</p>
      <p>2. <strong>资金总投入：</strong>首付款 + 契税杂费（这就是您被锁死的自有现金流）。</p>
      <p>3. <strong>已付利息：</strong>查阅银行账单，填入这些年您已经实际付给银行的利息总和（不含本金）。</p>
      <p>4. 若房子是自住，可将这几年您如果在外面租同样房子的租金估值，填入“总租金”中作为隐性收入。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const buyPrice = parseFloat(document.getElementById('buyPrice').value);
        const downPay = parseFloat(document.getElementById('downPay').value);
        const totalInterest = parseFloat(document.getElementById('totalInterest').value);
        const renovation = parseFloat(document.getElementById('renovation').value);
        
        const sellPrice = parseFloat(document.getElementById('sellPrice').value);
        const holdYears = parseFloat(document.getElementById('holdYears').value);
        const totalRent = parseFloat(document.getElementById('totalRent').value);

        if (isNaN(buyPrice) || isNaN(sellPrice) || holdYears <= 0) {
          alert('请检查输入数值');
          return;
        }

        // 实际总投入成本 (本金方面)
        // 简单模型：首付及杂费 + 持有期付出的利息 + 装修费
        const totalInvest = downPay + totalInterest + renovation;

        // 房屋差价收益
        const capitalGain = sellPrice - buyPrice;
        
        // 净利润 = 房屋增值幅度 + 租金收入 - 利息开销 - 装修折旧费
        // 注意这里计算的是“资本利得”上的净收益，不需要扣减“首付”，因为首付收回来了
        const netProfit = capitalGain + totalRent - totalInterest - renovation;

        // 简单年化回报率 (非IRR复杂模型，采用大众理解的单利算术平均)
        let roi = 0;
        if (downPay > 0) {
          // 以实际动用的初始自有本金(首付+杂费)作为分母计算杠杆收益率
          const totalReturnRate = netProfit / downPay; 
          roi = (totalReturnRate / holdYears) * 100;
        }

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        const resRoiEl = document.getElementById('resROI');
        if (roi >= 0) {
          resRoiEl.textContent = roi.toFixed(2) + '%';
          resRoiEl.style.color = '#d9534f';
          document.getElementById('resProfit').innerHTML = netProfit.toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
          document.getElementById('resProfit').style.color = '#d9534f';
        } else {
          resRoiEl.textContent = roi.toFixed(2) + '%';
          resRoiEl.style.color = '#5cb85c'; // 亏损显示绿色(股市习惯)
          document.getElementById('resProfit').innerHTML = netProfit.toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';
          document.getElementById('resProfit').style.color = '#5cb85c';
        }

        let desc = '';
        if (roi < 0) desc = '评价：抱歉，该房产投资处于实质性亏损状态。';
        else if (roi < 3) desc = '评价：收益极低，甚至没跑赢定期存款或通胀。';
        else if (roi < 6) desc = '评价：跑赢了银行理财，是一笔稳健合格的投资。';
        else desc = '评价：极其卓越的回报！您利用杠杆获得了丰厚的超额收益。';
        
        document.getElementById('roiDesc').textContent = desc;
        document.getElementById('resInvest').innerHTML = downPay.toFixed(2) + ' <span style="font-size:1rem;color:#666">万元</span>';

        resBox.classList.add('active');
      });
    `
  },
  {
    slug: 'property-tax',
    title: '房产税预估计算器 - 沪渝试点及未来政策试算',
    description: '针对国内部分试点城市（如上海、重庆）的房产税及未来房地产税政策制定的预估计算器。支持免税面积扣减及不同税率设定。',
    keywords: '房产税计算器,房地产税,上海房产税,重庆房产税,免征面积计算',
    htmlContent: `
      <div class="form-grid">
        <div class="form-group full-width" style="background:#f9f2f4; padding:10px; border-left:4px solid #c7254e; color:#c7254e; font-size:0.9rem;">
          注意：全国统一的房地产税尚未正式出台。本工具算法主要参考目前<strong>上海、重庆</strong>等试点城市的现行规则进行模糊预估测算。
        </div>
        <div class="form-group">
          <label>家庭新购/总住房面积</label>
          <div class="input-group">
            <input type="number" id="totalArea" class="form-control" value="180" min="0">
            <span class="input-group-addon">平方米</span>
          </div>
        </div>
        <div class="form-group">
          <label>家庭总户籍人数</label>
          <div class="input-group">
            <input type="number" id="people" class="form-control" value="3" min="1" step="1">
            <span class="input-group-addon">人</span>
          </div>
        </div>
        <div class="form-group">
          <label>人均免征面积标准</label>
          <div class="input-group">
            <input type="number" id="freeArea" class="form-control" value="60" min="0">
            <span class="input-group-addon">平米/人</span>
          </div>
        </div>
        <div class="form-group">
          <label>适用房产税率</label>
          <select id="taxRate" class="form-control">
            <option value="0.004">0.4% (上海普通住宅试点税率)</option>
            <option value="0.006" selected>0.6% (上海高单价/重庆试点税率)</option>
            <option value="0.01">1.0% (预估累进税率)</option>
            <option value="0.012">1.2% (重庆独栋别墅最高档)</option>
          </select>
        </div>
        <div class="form-group full-width">
          <label>新购房屋计税评估单价 (网签均价 × 计税折让约70%)</label>
          <div class="input-group">
            <input type="number" id="unitPrice" class="form-control" value="50000" min="0">
            <span class="input-group-addon">元/平方米</span>
          </div>
        </div>
        <div class="form-group full-width">
          <button id="btnCalc" class="btn btn-primary">计算年度房产税应缴额</button>
        </div>
      </div>

      <div class="result-box" id="resultBox">
        <h3 style="color:var(--primary-color)">预估年度税务账单</h3>
        <div class="result-grid">
          <div class="result-item" style="grid-column: 1 / -1; text-align:center;">
            <div class="result-item-title">您每年需要缴纳的房产税估算值</div>
            <div class="result-item-value" id="resTax" style="font-size: 2.8rem; margin:10px 0; color:#d9534f">0 <span style="font-size:1.2rem;color:#666">元/年</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">家庭总免征面积</div>
            <div class="result-item-value" id="resFree">0 <span style="font-size:1rem;color:#666">平米</span></div>
          </div>
          <div class="result-item">
            <div class="result-item-title">实际超标需纳税面积</div>
            <div class="result-item-value" id="resTaxArea">0 <span style="font-size:1rem;color:#666">平米</span></div>
          </div>
        </div>
      </div>
    `,
    seoArticle: `
      <h2 style="font-size: 1.5rem; margin-bottom: 20px; color:#111">悬在楼市头顶的“达摩克利斯之剑”：房产税深度前瞻</h2>
      <article style="font-size: 0.95rem; color: #444; line-height: 1.8">
        <p>一直以来，“中国什么时候全面开征房地产税”是购房者和投资者最关心的话题。这把“达摩克利斯之剑”一旦落下，将彻底改变中国楼市“重购买、轻持有”的底层运行逻辑。</p>
        
        <h3 style="margin: 20px 0 10px; color: #111">目前试点城市的规则揭秘</h3>
        <p>目前只有<strong>上海</strong>和<strong>重庆</strong>等少数城市正在进行房产税试点。它们的共同特点是：<strong>刀口向内，打击囤房，保护刚需。</strong></p>
        <p>以上海为例，政策中设立了极为重要的一项——<strong>免征面积机制</strong>（上海目前暂定为本市户籍居民家庭人均免征60平方米）。这就意味着，一个三口之家，拥有 180 平方米以内的房产是完全免税的。只有当他们买入一套超过免征线的大平层或者二套房时，超出的那部分面积（差额）才会按 0.4% 到 0.6% 的税率计税。</p>

        <div class="ad-placeholder ad-middle">广告位 - 文章中部内嵌 (AdSense Placeholder)</div>

        <h3 style="margin: 20px 0 10px; color: #111">全面开征后，谁将承受最大压力？</h3>
        <p>未来的房地产税一旦全面推开，其征收的计税基数大概率会是<strong>房屋市场评估价的70%到80%</strong>左右，而不是您当年买房时的历史低价。受冲击最大的将是以下三类人群：</p>
        <ul>
          <li><strong>在核心城市核心地段持有大量“老破小”的房东：</strong>面积不大但总评估价极高，导致税费绝对值惊人。</li>
          <li><strong>三四线城市囤积多套闲置空房的投资者：</strong>这些城市的租金回报率极低，根本无法覆盖房产税的开销。</li>
          <li><strong>“伪”高净值人群：</strong>杠杆拉满买了大别墅，虽然纸面财富上千万，但由于免征面积有限，每年面临数万元的硬性现金流支出。</li>
        </ul>
      </article>
    `,
    sidebarGuide: `
      <p>1. <strong>免征机制：</strong>目前预估主流机制为人均享有一定免税面积（本工具默认采用上海试点的 60平米/人）。</p>
      <p>2. <strong>超标面积计算：</strong>系统将自动用您的总房产面积减去（家庭人数×免征面积），得出的差值作为纳税基数。</p>
      <p>3. <strong>计税单价折让：</strong>国内政策通常不会按 100% 的市场价计税，会乘以一个约 70% 的比例折扣。请在单价中自行折算后填入。</p>
    `,
    jsContent: `
      document.getElementById('btnCalc').addEventListener('click', () => {
        const totalArea = parseFloat(document.getElementById('totalArea').value);
        const people = parseInt(document.getElementById('people').value);
        const freePerPerson = parseFloat(document.getElementById('freeArea').value);
        const rate = parseFloat(document.getElementById('taxRate').value);
        const unitPrice = parseFloat(document.getElementById('unitPrice').value);

        if (isNaN(totalArea) || isNaN(people) || isNaN(freePerPerson) || isNaN(unitPrice)) {
          alert('请检查输入数值');
          return;
        }

        const totalFreeArea = people * freePerPerson;
        const taxArea = Math.max(0, totalArea - totalFreeArea);
        
        // 年度房产税额 = 纳税面积 * 计税单价 * 适用税率
        const annualTax = taxArea * unitPrice * rate;

        const resBox = document.getElementById('resultBox');
        resBox.classList.remove('active');
        void resBox.offsetWidth;
        
        document.getElementById('resTax').innerHTML = Math.round(annualTax).toLocaleString() + ' <span style="font-size:1.2rem;color:#666">元/年</span>';
        document.getElementById('resFree').innerHTML = totalFreeArea + ' <span style="font-size:1rem;color:#666">平米</span>';
        document.getElementById('resTaxArea').innerHTML = taxArea + ' <span style="font-size:1rem;color:#666">平米 (需缴税部分)</span>';
        
        // 如果不用缴税，显示绿色
        if (annualTax === 0) {
          document.getElementById('resTax').style.color = '#5cb85c';
          document.getElementById('resTax').innerHTML += '<br><span style="font-size:1rem;font-weight:normal;">恭喜，您家庭的人均面积未超标，完全免征房产税！</span>';
        } else {
          document.getElementById('resTax').style.color = '#d9534f';
        }

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
