import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
function core() {
  const file = new URL('../tools/generator/invoice-gen.html', import.meta.url);
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(/\/\/ Invoice core start([\s\S]*?)\/\/ Invoice core end/);
  assert.ok(match, 'invoice page must inline the core between its markers');
  const source = match[1];
  class LocalDate extends Date { constructor(...args) { super(...(args.length ? args : [2026, 10, 6, 23, 59])); } }
  const context = vm.createContext({ window: {}, TextEncoder, Uint8Array, Date: LocalDate, Intl });
  vm.runInContext(source, context);
  return context.window.InvoiceCore;
}
const plain = value => JSON.parse(JSON.stringify(value));
function state(api, changes = {}) { return { ...api.createState(), ...changes }; }
function item(description, quantity, price) { return { description, quantity, price }; }
function one(api, changes = {}) { return state(api,{items:[item('示例','1','100.00')],...changes}); }
function checkIntegers(result) {
  for(const key of ['subtotal','discount','taxable','tax','total','paid','due','overpaid']) assert.ok(Number.isSafeInteger(result[key]),key);
  for(const line of result.lines) assert.ok(Number.isSafeInteger(line.amount));
}

test('global API, default examples, local issue/due dates and fresh nested state', () => {
  const api=core();assert.ok(api,'InvoiceCore must be implemented');
  assert.deepEqual(Object.keys(api).sort(),['createState','currencies','calculate','formatMoney','validateState','exportJSON','importJSON','toCSV','escapeHtml'].sort());
  const a=api.createState(),b=api.createState();
  assert.equal(a.sellerName,'山间设计工作室');assert.equal(a.buyerName,'示例客户');
  assert.equal(a.issueDate,'2026-11-06');assert.equal(a.dueDate,'2026-11-20');
  assert.equal(a.taxRate,'0');assert.equal(a.currency,'CNY');
  assert.deepEqual(plain(a.items),[item('品牌视觉设计','1','1200.00'),item('版式与交付','2','350.00')]);
  a.items[0].price='999';assert.equal(b.items[0].price,'1200.00');
});

test('default invoice totals are integer minor units with a 1900.00 total', () => {
  const api=core(),result=api.calculate(api.createState());
  assert.deepEqual(plain(result),{decimals:2,lines:[{amount:120000},{amount:70000}],subtotal:190000,discount:0,taxable:190000,tax:0,total:190000,paid:0,due:190000,overpaid:0});
  checkIntegers(result);
});

test('decimal additions and fractional quantities use exact half-up line rounding before summation', () => {
  const api=core();
  const sum=api.calculate(state(api,{items:[item('甲','1','0.10'),item('乙','1','0.20')]}));assert.equal(sum.total,30);
  const half=api.calculate(state(api,{items:[item('甲','0.5','0.01'),item('乙','0.500','0.01')]}));
  assert.deepEqual(plain(half.lines),[{amount:1},{amount:1}]);assert.equal(half.subtotal,2);
  assert.equal(api.calculate(state(api,{items:[item('精度','1.234','1.23')]})).total,152);
});

test('empty numeric fields are zero for previews without mutating the original strings', () => {
  const api=core();const input=one(api,{items:[item('空',' ','')],taxRate:'',discountValue:'',paidAmount:''});
  assert.equal(api.calculate(input).total,0);assert.equal(input.items[0].quantity,' ');
  assert.equal(api.validateState(input).paidAmount,'');
});

test('exclusive tax follows percentage discount on the rounded subtotal', () => {
  const api=core();const r=api.calculate(one(api,{taxRate:'10',discountMode:'percent',discountValue:'10'}));
  assert.deepEqual(plain(r),{decimals:2,lines:[{amount:10000}],subtotal:10000,discount:1000,taxable:9000,tax:900,total:9900,paid:0,due:9900,overpaid:0});
});

test('inclusive tax is extracted from the discounted total with half-up rounding', () => {
  const api=core();const r=api.calculate(one(api,{items:[item('含税','1','110.00')],taxMode:'inclusive',taxRate:'10'}));
  assert.equal(r.total,11000);assert.equal(r.tax,1000);assert.equal(r.taxable,10000);
  const d=api.calculate(one(api,{items:[item('含税','1','110.00')],taxMode:'inclusive',taxRate:'10',discountMode:'amount',discountValue:'11.00'}));
  assert.equal(d.total,9900);assert.equal(d.tax,900);assert.equal(d.taxable,9000);
});

test('tax/discount rates support two decimals and round half-up', () => {
  const api=core();assert.equal(api.calculate(one(api,{taxRate:'7.25'})).tax,725);
  const r=api.calculate(one(api,{items:[item('微额','1','0.03')],discountValue:'33.33'}));assert.equal(r.discount,1);assert.equal(r.total,2);
  assert.equal(api.calculate(one(api,{discountValue:'100'})).total,0);
});

test('fixed discounts cannot exceed subtotal; paid amounts may produce overpayments', () => {
  const api=core();assert.throws(()=>api.calculate(one(api,{discountMode:'amount',discountValue:'100.01'})),/折扣|小计/);
  const r=api.calculate(one(api,{paidAmount:'150.00'}));assert.equal(r.paid,15000);assert.equal(r.due,0);assert.equal(r.overpaid,5000);
});

test('JPY has zero minor decimals while other supported currencies retain two', () => {
  const api=core();assert.deepEqual(Object.keys(api.currencies).sort(),['CNY','USD','EUR','GBP','HKD','JPY'].sort());
  const r=api.calculate(one(api,{currency:'JPY',items:[item('円','1.5','101')],paidAmount:'10'}));
  assert.equal(r.decimals,0);assert.equal(r.total,152);assert.equal(r.due,142);
  assert.throws(()=>api.calculate(one(api,{currency:'JPY'})),/小数|精度|金额|单价/);
});

test('negative/exponential/non-numeric values and excess decimal precision are rejected with fields', () => {
  const api=core();for(const price of ['-1','+1','1e2','NaN','Infinity','1,000','1.234']) {
    assert.throws(()=>api.calculate(one(api,{items:[item('坏','1',price)]})),error=>Boolean(/金额|单价|数字|小数|精度/.test(error.message)&&error.field==='items.0.price'));
  }
  for(const changes of [{items:[item('坏','1.0001','1.00')]},{taxRate:'100.01'},{taxRate:'1.001'},{discountValue:'101'},{paidAmount:'-1'}]) assert.throws(()=>api.calculate(one(api,changes)),/数量|税率|折扣|金额|小数|已付/);
});

test('all monetary values enforce the 1e12 minor cap before returning safe integers', () => {
  const api=core();const exact=api.calculate(one(api,{items:[item('边界','1','10000000000.00')]}));assert.equal(exact.total,1000000000000);
  for(const changes of [{items:[item('超限','1','10000000000.01')]},{items:[item('甲','1','6000000000.00'),item('乙','1','6000000000.00')]},{items:[item('超税','1','10000000000.00')],taxRate:'1'},{paidAmount:'10000000000.01'}]) assert.throws(()=>api.calculate(one(api,changes)),/上限|过大|超出|范围/);
});

test('money formatting distinguishes currency codes and respects zero-decimal JPY', () => {
  const api=core();assert.match(api.formatMoney(120000,'CNY'),/CNY/);assert.match(api.formatMoney(120000,'CNY'),/1,200\.00/);
  assert.match(api.formatMoney(1200,'JPY'),/JPY/);assert.doesNotMatch(api.formatMoney(1200,'JPY'),/\.00/);
  assert.throws(()=>api.formatMoney(1.1,'CNY'),/金额|整数/);assert.throws(()=>api.formatMoney(100,'BTC'),/货币|币种/);
});

test('state validation returns a deep clone and accepts all supported document types', () => {
  const api=core();for(const type of ['invoice','receipt','quote']) assert.equal(api.validateState(state(api,{type})).type,type);
  const input=api.createState(),copy=api.validateState(input);copy.items[0].description='已改';assert.equal(input.items[0].description,'品牌视觉设计');
  assert.equal(api.validateState(state(api,{items:[]})).items.length,0);
});

test('validation rejects unknown fields, missing fields, invalid enums and non-string numeric data', () => {
  const api=core();for(const change of [{currency:'BTC'},{type:'taxInvoice'},{taxMode:'other'},{discountMode:'other'},{unknown:'x'},{paidAmount:0},{items:[{description:'x',quantity:'1',price:'1',injected:true}]}]) assert.throws(()=>api.validateState(state(api,change)),/字段|类型|货币|币种|税|折扣|明细|已付/);
  const missing=api.createState();delete missing.sellerName;assert.throws(()=>api.validateState(missing),/缺少|字段/);
});

test('real calendar dates, item limits, text bounds and safe PNG logo data are validated', () => {
  const api=core();assert.equal(api.validateState(state(api,{issueDate:'2028-02-29',dueDate:'2028-03-14',logo:PNG})).logo,PNG);
  for(const change of [{issueDate:'2026-02-29'},{dueDate:'2026-13-01'},{issueDate:'2026-1-1'},{issueDate:''},{items:Array.from({length:101},()=>item('x','1','0'))},{sellerName:'甲'.repeat(201)},{notes:'x'.repeat(5001)},{logo:'data:image/svg+xml;base64,PHN2Zy8+'},{logo:'data:image/png;base64,AAAA'},{logo:'https://evil.test/logo.png'}]) assert.throws(()=>api.validateState(state(api,change)),/日期|明细|100|长度|字符|Logo|标志|图片/);
});

test('JSON export/import round trips version 1 without sharing nested references', () => {
  const api=core();const source=api.createState();const json=api.exportJSON(source);const wrapper=JSON.parse(json);assert.equal(wrapper.version,1);
  const restored=api.importJSON(json);assert.deepEqual(plain(restored),plain(source));restored.items[0].price='0';assert.equal(source.items[0].price,'1200.00');
});

test('JSON rejects corrupt, oversized, unsafe prototypes and bad amounts atomically', () => {
  const api=core();const original=api.createState();
  for(const json of ['{bad}',JSON.stringify({version:2,state:original}),JSON.stringify({version:1,state:{...original,paidAmount:'NaN'}}),JSON.stringify({version:1,state:{...original,items:[item('x','1','1e2')]}}),'{"version":1,"state":{},"__proto__":{"polluted":true}}','{"version":1,"state":{"constructor":{"prototype":{"polluted":true}}}}',' '.repeat(2*1024*1024+1),JSON.stringify({version:1,state:original,extra:1})]) assert.throws(()=>api.importJSON(json),/JSON|版本|字段|数据|大小|金额|数字|单价/);
  assert.equal(original.items[0].price,'1200.00');assert.equal({}.polluted,undefined);
});

test('CSV exports BOM, precise values, currency and RFC4180 quoted multiline descriptions', () => {
  const api=core();const csv=api.toCSV(state(api,{items:[item('设计,"甲"\n第二行','1.250','12.30')]}));
  assert.ok(csv.startsWith('\ufeff'));assert.ok(csv.includes('"设计,""甲""\n第二行"'));
  assert.match(csv,/1\.250/);assert.match(csv,/12\.30/);assert.match(csv,/15\.38/);assert.match(csv,/CNY/);assert.ok(csv.endsWith('\r\n'));
});

test('CSV neutralizes dangerous user cell prefixes without mutating the source state', () => {
  const api=core();for(const description of ['=HYPERLINK("x")','+cmd','-cmd','@SUM(A1)','\t=1+1','  =SUM(A1)']) {
    const input=one(api,{items:[item(description,'1','1.00')]});const csv=api.toCSV(input);
    assert.ok(csv.includes("'"+description.replaceAll('"','""')));assert.equal(input.items[0].description,description);
  }
});

test('escapeHtml protects text/XML and removes invalid control characters', () => {
  const api=core();assert.equal(api.escapeHtml('<img src="x" onerror=\'x\'>&'), '&lt;img src=&quot;x&quot; onerror=&#39;x&#39;&gt;&amp;');
  assert.equal(api.escapeHtml(null),'');assert.equal(api.escapeHtml('甲\u0000乙'),'甲乙');
});

test('CSV quotes every cell and neutralizes original tab/CR/LF prefixes', () => {
  const api=core();const csv=api.toCSV(one(api));
  assert.ok(csv.startsWith('\ufeff"项目描述","数量","单价","金额","币种"\r\n'));
  for(const description of ['\ttext','\rtext','\ntext','  =HYPERLINK("x")']) {
    const result=api.toCSV(one(api,{items:[item(description,'1','1.00')]}));
    assert.ok(result.includes('"\''+description.replaceAll('"','""')+'"'));
  }
});

test('logo budget applies to the complete PNG data URL so exported JSON stays importable', () => {
  const api=core();const logo='data:image/png;base64,'+'iVBORw0KGgo'+'A'.repeat(1572864-11);
  assert.throws(()=>api.validateState(state(api,{logo})),/Logo|大小|图片|上限/);
});

function legacy(overrides = {}) {
  return {
    invoiceType: 'invoice', invoiceNo: 'OLD-001', invoiceDate: '2026-10-01', dueDate: '2026-10-15',
    sellerName: '', sellerAddress: '', sellerPhone: '', sellerTaxId: '',
    buyerName: '旧客户', buyerAddress: '', buyerPhone: '', buyerTaxId: '',
    taxRate: '6', discount: '10', notes: '旧版配置',
    items: [{ id: 1730000000000, name: '旧明细', quantity: 1.25, price: 80 }], ...overrides
  };
}

test('legacy unversioned JSON migrates exact old fields while preserving intentionally empty text', () => {
  const api=core();const old=legacy();const restored=api.importJSON(JSON.stringify(old));
  assert.equal(restored.type,'invoice');assert.equal(restored.number,'OLD-001');assert.equal(restored.issueDate,'2026-10-01');
  assert.equal(restored.sellerName,'');assert.equal(restored.buyerName,'旧客户');assert.equal(restored.currency,'CNY');
  assert.equal(restored.sellerEmail,'');assert.equal(restored.buyerEmail,'');assert.equal(restored.paymentDetails,'');assert.equal(restored.logo,null);
  assert.equal(restored.taxMode,'exclusive');assert.equal(restored.discountMode,'percent');assert.equal(restored.paidAmount,'0');
  assert.deepEqual(plain(restored.items),[item('旧明细','1.25','80')]);assert.equal(api.calculate(restored).total,9540);
  assert.deepEqual(plain(api.importJSON(api.exportJSON(restored))),plain(restored));
});

test('legacy rate numbers and document types migrate without silently rounding numeric precision', () => {
  const api=core();for(const type of ['invoice','receipt','quote']) {
    const restored=api.importJSON(JSON.stringify(legacy({invoiceType:type,taxRate:7.25,discount:2.5})));
    assert.equal(restored.type,type);assert.equal(restored.taxRate,'7.25');assert.equal(restored.discountValue,'2.5');
  }
  for(const changes of [{items:[{id:1,name:'x',quantity:1.0001,price:1}]},{items:[{id:1,name:'x',quantity:1,price:1.001}]},{taxRate:1.001},{discount:101}]) {
    assert.throws(()=>api.importJSON(JSON.stringify(legacy(changes))),/数量|精度|小数|税率|折扣/);
  }
});

test('legacy import rejects unknown or missing fields and unsafe item values atomically', () => {
  const api=core();const valid=legacy();const missing=legacy();delete missing.sellerName;
  const invalid=[legacy({extra:1}),missing,legacy({invoiceType:'other'}),legacy({items:[{id:1,name:'x',quantity:'1',price:1}]}),legacy({items:[{id:1,name:'x',quantity:-1,price:1}]}),legacy({items:[{id:1.2,name:'x',quantity:1,price:1}]}),legacy({items:[{id:1,name:'x',quantity:1,price:null}]}),legacy({items:[{id:1,name:'x',quantity:1,price:1,extra:true}]}),legacy({taxRate:null})];
  for(const value of invalid) assert.throws(()=>api.importJSON(JSON.stringify(value)),/字段|类型|数字|数量|编号|金额|明细|单价|税率/);
  assert.equal(valid.items[0].quantity,1.25);assert.equal({}.polluted,undefined);
});

test('JSON export rejects serialized output above the same 2 MiB import budget', () => {
  const api=core();const logo='data:image/png;base64,'+'iVBORw0KGgo'+'A'.repeat(1572840-11);
  const input=state(api,{logo,items:Array.from({length:100},()=>item('\u0000'.repeat(1000),'1','0'))});
  assert.equal(api.validateState(input).items.length,100);
  assert.throws(()=>api.exportJSON(input),/JSON|大小|2 MiB/);
});
