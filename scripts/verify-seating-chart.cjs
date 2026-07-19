const fs = require('fs');
const h = fs.readFileSync('tools/office/seating-chart.html', 'utf8');
const ids = [
  'eventName',
  'tableName',
  'tableType',
  'seatCount',
  'tablesContainer',
  'tableCount',
  'totalSeats',
  'assignedSeats',
  'seatModal',
  'seatPersonName',
  'toast',
];
const missing = ids.filter((id) => !new RegExp(`id=["']${id}["']`).test(h));
console.log({
  missing,
  hasAddTable: h.includes('function addTable'),
  hasRound: h.includes('createRoundTable'),
  hasRect: h.includes('createRectTable'),
  hasPrint: h.includes('function printChart'),
  hasLS: h.includes('seating_chart_data_v1'),
  bodyOk: /<body[\s\S]*<\/body>/i.test(h),
});
