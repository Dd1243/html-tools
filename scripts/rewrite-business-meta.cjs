const fs = require('fs');
const path = require('path');

const businessDir = path.join('e:/html-tools', 'tools', 'business');

const descriptions = {
  'breakeven.html': '盈亏平衡分析工具，支持计算保本销量、保本销售额、边际贡献率和目标利润所需销量，适合创业者、财务和运营团队评估价格、成本与销量方案。',
  'business-scope.html': '经营范围生成器，基于最新工商登记规范生成更标准的经营范围表述，适合公司注册、经营范围变更和资料整理时快速参考行业模板，减少反复修改。',
  'cashflow.html': '现金流预测工具，支持按月录入收入、支出和期初资金，快速查看余额变化、资金缺口和经营趋势，适合中小企业做预算规划、回款安排与周转预警。',
  'cost-calc.html': '全成本核算计算器，支持直接材料、人工、制造费用与建议售价测算，帮助生产型和贸易型企业快速核对单位成本、毛利空间与报价底线。',
  'depreciation.html': '固定资产折旧计算器，支持平均年限法、双倍余额递减法和年数总和法，自动生成年度折旧明细与月度摊销建议，适合财务做资产管理与报表测算。',
  'equity-dilution.html': '股权稀释计算器，支持投前投后估值、融资轮次、期权池和持股比例变化模拟，帮助创始人、投资人和财务团队更直观评估融资后的股权结构。',
  'inventory.html': '库存周转率计算器，支持计算周转率、周转天数和库存可供天数，帮助企业识别库存积压、优化采购节奏并降低营运资金占用。',
  'invoice.html': '发票增值税计算器，支持含税价与不含税价双向换算、税额自动拆分和多档税率快速核对，适合财务对账、报价开票和合同结算前做精确测算。',
  'npv.html': '净现值 NPV 计算器，支持多期现金流、内部收益率 IRR、获利指数 PI 与投资回收期分析，帮助评估项目可行性、资金时间价值和投资优先级。',
  'pricing.html': '定价策略计算器，集成成本加成、竞争导向、价值导向和心理定价等模型，帮助企业在利润目标、市场接受度与竞争压力之间找到更稳的售价区间。',
  'profit-margin.html': '利润率分析计算器，支持毛利率、营业利润率和净利率测算，并生成盈利能力看板，适合复盘产品结构、核对经营健康度和比较不同周期的赚钱效率。',
  'receivables.html': '应收账款账龄分析工具，支持平均账龄、坏账准备、风险分层和自定义账龄区间测算，帮助企业识别逾期回款压力并优化信用政策与催收节奏。',
  'roi-calculator.html': '投资回报率 ROI 计算器，支持年化回报率、净利润、回本周期和投资效益分析，适合评估广告投放、设备采购、项目立项和渠道合作的回报表现。',
  'roi.html': 'ROI 基础版投资收益评估器，适合快速计算投资回报率、投资倍数和回收期，帮助在方案初筛阶段迅速判断项目值不值得继续深入分析。',
  'salary.html': '2026 工资个税计算器，支持税前税后换算、五险一金、专项附加扣除与企业用工成本测算，适合员工谈薪、HR 核算和企业招聘预算评估。',
  'valuation.html': '企业估值计算器，支持 P/E、P/S、EV/EBITDA、P/B 和 DCF 等多模型估值，对比不同假设下的公司价值区间，适合融资谈判、投研分析和股权定价参考。'
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJson(str) {
  return JSON.stringify(String(str)).slice(1, -1);
}

function upsertMeta(html, key, value, preferredAttr = 'name') {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta[^>]*(?:name|property)=["']${escapedKey}["'][^>]*>`, 'i');
  const tag = `<meta ${preferredAttr}="${key}" content="${escapeHtml(value)}">`;

  if (regex.test(html)) {
    return html.replace(regex, tag);
  }

  return html.replace(/<title>([\s\S]*?)<\/title>/i, (match) => `${match}\n    ${tag}`);
}

function updateJsonLdDescription(html, value) {
  return html.replace(/(<script\s+type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/i, (match, open, content, close) => {
    if (/"description"\s*:/i.test(content)) {
      return `${open}${content.replace(/("description"\s*:\s*")([\s\S]*?)(")/, `$1${escapeJson(value)}$3`)}${close}`;
    }
    return match;
  });
}

for (const [fileName, description] of Object.entries(descriptions)) {
  const filePath = path.join(businessDir, fileName);
  let html = fs.readFileSync(filePath, 'utf8');

  html = upsertMeta(html, 'description', description, 'name');
  html = upsertMeta(html, 'og:description', description, 'property');
  html = upsertMeta(html, 'twitter:description', description, 'name');
  html = updateJsonLdDescription(html, description);

  fs.writeFileSync(filePath, html, 'utf8');
}

console.log(`Updated ${Object.keys(descriptions).length} business pages.`);
