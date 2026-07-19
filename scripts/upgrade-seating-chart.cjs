/**
 * Replace seating-chart tool area with the better interactive implementation
 * (tables/seats/modal/stats/print/localStorage) while keeping essays4u shell.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'tools', 'office', 'seating-chart.html');
let html = fs.readFileSync(file, 'utf8');

const FEATURE_CSS = `
/* seating-chart upgraded feature styles */
.tool-header h2 { margin: 0 0 6px; font-size: 1.25rem; }
.tool-header p { margin: 0 0 18px; color: var(--text-muted, #666); font-size: 0.95rem; }
.feature-block {
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
}
.feature-block .section-title {
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #0f172a;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  align-items: end;
}
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-label, .input-group label {
  font-size: 0.86rem;
  font-weight: 600;
  color: #475569;
}
.input-group input,
.input-group select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.92rem;
  background: #fff;
  color: #0f172a;
}
.btn-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.92rem;
}
.btn-sm { padding: 9px 14px; }
.btn-primary { background: var(--primary-color, #007acc); color: #fff; }
.btn-secondary, .btn-outline {
  background: #f8fafc;
  border: 1px solid #d1d5db;
  color: #334155;
}
.btn:hover { opacity: 0.95; transform: translateY(-1px); }
.stats-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.stat-item {
  font-size: 0.92rem;
  color: #334155;
}
.stat-item span {
  color: var(--primary-color, #007acc);
  font-weight: 700;
}
.seating-canvas {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  min-height: 420px;
  padding: 20px;
  overflow: auto;
}
.tables-container {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  justify-content: center;
  align-items: flex-start;
}
.table-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.table-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
  padding: 4px 12px;
  background: rgba(0, 122, 204, 0.1);
  border-radius: 999px;
}
.table-shape { position: relative; }
.table-round {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #dbe3ea;
  position: relative;
  border: 2px solid #adb5bd;
}
.table-round .seat {
  position: absolute;
  width: 50px;
  height: 50px;
  transform: translate(-50%, -50%);
}
.table-rect { display: grid; gap: 8px; padding: 8px; }
.table-rect-body {
  background: #dbe3ea;
  border: 2px solid #adb5bd;
  border-radius: 6px;
  min-width: 120px;
  min-height: 56px;
}
.table-seats-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.seat {
  width: 56px;
  height: 56px;
  background: #fff;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  padding: 4px;
  font-size: 0.72rem;
}
.seat:hover {
  border-color: var(--primary-color, #007acc);
  transform: scale(1.05);
  z-index: 2;
}
.seat.occupied {
  background: #e7f3ff;
  border-color: var(--primary-color, #007acc);
}
.seat-number {
  font-size: 0.65rem;
  color: #64748b;
}
.seat-name {
  font-size: 0.72rem;
  color: #0f172a;
  font-weight: 600;
  line-height: 1.15;
  word-break: break-all;
}
.btn-remove-table {
  margin-top: 2px;
  background: transparent;
  border: 1px solid #f43f5e;
  color: #f43f5e;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 6px;
}
.btn-remove-table:hover { background: rgba(244, 63, 94, 0.08); }
.chart-header-print { display: none; text-align: center; margin-bottom: 20px; }
.chart-header-print .print-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 6px;
}
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}
.modal-overlay.show { display: flex; }
.modal {
  background: #fff;
  border-radius: 12px;
  padding: 22px;
  width: 92%;
  max-width: 420px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
}
.modal-title {
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 14px;
}
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: #10b981;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1100;
  font-size: 0.9rem;
  font-weight: 600;
}
.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
@media print {
  .site-header, .site-footer, .sidebar-section, .page-shell > .breadcrumb,
  .no-print, .btn-remove-table, .modal-overlay, .toast, .tool-guide { display: none !important; }
  .chart-header-print { display: block !important; }
  .seating-canvas { border: 1px solid #ddd; background: #fff; }
  .feature-block { border: none; padding: 0; }
  body { background: #fff !important; }
}
`;

const TOOL_HTML = `
        <section class="tool-section" aria-label="工具主区">
          <header class="header">
            <h1>在线座位图生成器</h1>
          </header>

          <div class="tool-header">
            <h2>座位安排图</h2>
            <p>创建座位安排图，支持圆桌/长桌、点击分配座位、统计与打印导出。</p>
          </div>

          <div class="chart-header-print">
            <div class="print-title">座位安排图</div>
            <div class="print-event" id="printEventName"></div>
          </div>

          <div class="feature-block no-print">
            <div class="section-title">活动信息</div>
            <div class="form-grid">
              <div class="input-group">
                <label class="input-label" for="eventName">活动名称</label>
                <input type="text" id="eventName" placeholder="会议 / 晚宴 / 培训名称" />
              </div>
            </div>
          </div>

          <div class="feature-block no-print">
            <div class="section-title">添加桌子</div>
            <div class="form-grid">
              <div class="input-group">
                <label class="input-label" for="tableName">桌子名称</label>
                <input type="text" id="tableName" placeholder="如: A桌, 主桌" />
              </div>
              <div class="input-group">
                <label class="input-label" for="tableType">桌型</label>
                <select id="tableType">
                  <option value="round">圆桌</option>
                  <option value="rect">长桌</option>
                </select>
              </div>
              <div class="input-group">
                <label class="input-label" for="seatCount">座位数</label>
                <input type="number" id="seatCount" value="8" min="2" max="20" />
              </div>
            </div>
            <div class="btn-row">
              <button type="button" class="btn btn-secondary btn-sm" onclick="addTable()">+ 添加桌子</button>
            </div>
          </div>

          <div class="feature-block">
            <div class="stats-row">
              <div class="stat-item">桌子数: <span id="tableCount">0</span></div>
              <div class="stat-item">总座位: <span id="totalSeats">0</span></div>
              <div class="stat-item">已分配: <span id="assignedSeats">0</span></div>
            </div>
          </div>

          <div class="feature-block">
            <div class="section-title">座位布局</div>
            <div class="seating-canvas">
              <div class="tables-container" id="tablesContainer">
                <div style="text-align:center;color:#94a3b8;padding:60px 0">点击“添加桌子”开始创建座位图</div>
              </div>
            </div>
          </div>

          <div class="feature-block no-print">
            <div class="btn-row">
              <button type="button" class="btn btn-primary" onclick="printChart()">🖨️ 打印座位图</button>
              <button type="button" class="btn btn-secondary" onclick="clearAll()">🔄 清空重置</button>
            </div>
          </div>
        </section>
`;

const MODAL_TOAST_HTML = `
    <div class="modal-overlay" id="seatModal" role="dialog" aria-modal="true" aria-labelledby="seatModalTitle">
      <div class="modal">
        <div class="modal-title" id="seatModalTitle">分配座位</div>
        <div class="input-group">
          <label class="input-label" for="seatPersonName">姓名</label>
          <input type="text" id="seatPersonName" placeholder="输入姓名" />
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
          <button type="button" class="btn btn-secondary" onclick="clearSeat()">清空座位</button>
          <button type="button" class="btn btn-primary" onclick="assignSeat()">保存</button>
        </div>
      </div>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const FEATURE_JS = `
    <script>
      var LS_KEY = "seating_chart_data_v1";
      var tables = [];
      var tableIdCounter = 0;
      var currentSeat = null;

      function init() {
        loadFromStorage();
        renderTables();
        updateStats();
        var eventNameEl = document.getElementById("eventName");
        if (eventNameEl) {
          eventNameEl.addEventListener("input", debounce(saveToStorage, 500));
        }
        var nameInput = document.getElementById("seatPersonName");
        if (nameInput) {
          nameInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") assignSeat();
          });
        }
      }

      function addTable() {
        var name = document.getElementById("tableName").value.trim();
        var type = document.getElementById("tableType").value;
        var seatCount = parseInt(document.getElementById("seatCount").value, 10) || 8;
        if (!name) name = "桌 " + (tables.length + 1);
        if (seatCount < 2) seatCount = 2;
        if (seatCount > 20) seatCount = 20;

        var seats = [];
        for (var i = 0; i < seatCount; i++) {
          seats.push({ number: i + 1, name: "" });
        }

        tables.push({
          id: ++tableIdCounter,
          name: name,
          type: type,
          seats: seats
        });

        document.getElementById("tableName").value = "";
        document.getElementById("seatCount").value = "8";
        renderTables();
        updateStats();
        saveToStorage();
        showToast("已添加 " + name);
      }

      function removeTable(id) {
        if (!confirm("确定要删除这张桌子吗？")) return;
        tables = tables.filter(function (t) { return t.id !== id; });
        renderTables();
        updateStats();
        saveToStorage();
        showToast("已删除");
      }

      function renderTables() {
        var container = document.getElementById("tablesContainer");
        container.textContent = "";
        if (tables.length === 0) {
          var placeholder = document.createElement("div");
          placeholder.style.textAlign = "center";
          placeholder.style.color = "#94a3b8";
          placeholder.style.padding = "60px 0";
          placeholder.textContent = '点击"添加桌子"开始创建座位图';
          container.appendChild(placeholder);
          return;
        }
        for (var i = 0; i < tables.length; i++) {
          container.appendChild(createTableElement(tables[i]));
        }
      }

      function createTableElement(table) {
        var group = document.createElement("div");
        group.className = "table-group";

        var label = document.createElement("div");
        label.className = "table-label";
        label.textContent = table.name;
        group.appendChild(label);

        var shape = document.createElement("div");
        shape.className = "table-shape";
        if (table.type === "round") shape.appendChild(createRoundTable(table));
        else shape.appendChild(createRectTable(table));
        group.appendChild(shape);

        var removeBtn = document.createElement("button");
        removeBtn.className = "btn-remove-table no-print";
        removeBtn.type = "button";
        removeBtn.textContent = "删除桌子";
        removeBtn.addEventListener("click", function () { removeTable(table.id); });
        group.appendChild(removeBtn);
        return group;
      }

      function createRoundTable(table) {
        var tableEl = document.createElement("div");
        tableEl.className = "table-round";
        var seatCount = table.seats.length;
        var radius = 100;
        var angleStep = (2 * Math.PI) / seatCount;
        for (var i = 0; i < seatCount; i++) {
          var angle = angleStep * i - Math.PI / 2;
          var x = 100 + radius * Math.cos(angle);
          var y = 100 + radius * Math.sin(angle);
          var seat = createSeatElement(table, i);
          seat.style.left = x + "px";
          seat.style.top = y + "px";
          tableEl.appendChild(seat);
        }
        return tableEl;
      }

      function createRectTable(table) {
        var wrapper = document.createElement("div");
        wrapper.className = "table-rect";
        var seatCount = table.seats.length;
        var seatsPerSide = Math.ceil(seatCount / 2);

        var topRow = document.createElement("div");
        topRow.className = "table-seats-row";
        for (var i = 0; i < seatsPerSide && i < seatCount; i++) {
          topRow.appendChild(createSeatElement(table, i));
        }
        wrapper.appendChild(topRow);

        var body = document.createElement("div");
        body.className = "table-rect-body";
        wrapper.appendChild(body);

        var bottomRow = document.createElement("div");
        bottomRow.className = "table-seats-row";
        for (var j = seatsPerSide; j < seatCount; j++) {
          bottomRow.appendChild(createSeatElement(table, j));
        }
        wrapper.appendChild(bottomRow);
        return wrapper;
      }

      function createSeatElement(table, seatIndex) {
        var seatData = table.seats[seatIndex];
        var seat = document.createElement("div");
        seat.className = "seat" + (seatData.name ? " occupied" : "");

        var number = document.createElement("div");
        number.className = "seat-number";
        number.textContent = seatData.number;
        seat.appendChild(number);

        var name = document.createElement("div");
        name.className = "seat-name";
        name.textContent = seatData.name || "空";
        seat.appendChild(name);

        seat.addEventListener("click", function () {
          openSeatModal(table.id, seatIndex);
        });
        return seat;
      }

      function openSeatModal(tableId, seatIndex) {
        currentSeat = { tableId: tableId, seatIndex: seatIndex };
        var table = tables.find(function (t) { return t.id === tableId; });
        document.getElementById("seatPersonName").value = table ? table.seats[seatIndex].name : "";
        document.getElementById("seatModal").classList.add("show");
        document.getElementById("seatPersonName").focus();
      }

      function closeModal() {
        document.getElementById("seatModal").classList.remove("show");
        currentSeat = null;
      }

      function assignSeat() {
        if (!currentSeat) return;
        var name = document.getElementById("seatPersonName").value.trim();
        var table = tables.find(function (t) { return t.id === currentSeat.tableId; });
        if (table) {
          table.seats[currentSeat.seatIndex].name = name;
          renderTables();
          updateStats();
          saveToStorage();
          showToast(name ? "已分配: " + name : "已清空座位");
        }
        closeModal();
      }

      function clearSeat() {
        document.getElementById("seatPersonName").value = "";
        assignSeat();
      }

      function updateStats() {
        var totalSeats = 0;
        var assignedSeats = 0;
        for (var i = 0; i < tables.length; i++) {
          var seats = tables[i].seats;
          totalSeats += seats.length;
          for (var j = 0; j < seats.length; j++) {
            if (seats[j].name) assignedSeats++;
          }
        }
        document.getElementById("tableCount").textContent = String(tables.length);
        document.getElementById("totalSeats").textContent = String(totalSeats);
        document.getElementById("assignedSeats").textContent = String(assignedSeats);
      }

      function debounce(func, wait) {
        var timeout;
        return function () {
          var context = this;
          var args = arguments;
          clearTimeout(timeout);
          timeout = setTimeout(function () { func.apply(context, args); }, wait);
        };
      }

      function printChart() {
        var eventName = document.getElementById("eventName").value || "座位安排";
        document.getElementById("printEventName").textContent = eventName;
        window.print();
      }

      function clearAll() {
        if (!confirm("确定要清空所有内容吗？")) return;
        document.getElementById("eventName").value = "";
        tables = [];
        tableIdCounter = 0;
        renderTables();
        updateStats();
        localStorage.removeItem(LS_KEY);
        showToast("已清空");
      }

      function saveToStorage() {
        var data = {
          eventName: document.getElementById("eventName").value,
          tables: tables,
          tableIdCounter: tableIdCounter
        };
        localStorage.setItem(LS_KEY, JSON.stringify(data));
      }

      function loadFromStorage() {
        var saved = localStorage.getItem(LS_KEY);
        if (!saved) return;
        try {
          var data = JSON.parse(saved);
          document.getElementById("eventName").value = data.eventName || "";
          tables = data.tables || [];
          tableIdCounter = data.tableIdCounter || 0;
        } catch (e) {
          console.error("Failed to load saved data:", e);
        }
      }

      function showToast(msg) {
        var toast = document.getElementById("toast");
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(function () { toast.classList.remove("show"); }, 2000);
      }

      init();
    </script>
`;

// 1) inject CSS before </style> last occurrence near head
const styleClose = html.lastIndexOf('</style>');
if (styleClose < 0) throw new Error('no style close');
html = html.slice(0, styleClose) + '\n' + FEATURE_CSS + '\n' + html.slice(styleClose);

// 2) replace tool-section
const toolStart = html.indexOf('<section class="tool-section"');
if (toolStart < 0) throw new Error('tool-section not found');
const toolEnd = html.indexOf('</section>', toolStart);
if (toolEnd < 0) throw new Error('tool-section end not found');
html = html.slice(0, toolStart) + TOOL_HTML.trim() + html.slice(toolEnd + '</section>'.length);

// 3) replace old modal block if present
html = html.replace(
  /<!-- 分配座位弹窗 -->[\s\S]*?<div class="modal-overlay"[\s\S]*?<\/div>\s*<\/div>\s*/i,
  ''
);

// 4) replace old script with new feature script
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
if (scriptStart < 0 || scriptEnd < scriptStart) throw new Error('script not found');
// keep scripts after this? usually last script is the tool logic
// But ads/json-ld may be earlier. last script should be tool.
html = html.slice(0, scriptStart) + FEATURE_JS.trim() + '\n' + html.slice(scriptEnd + '</script>'.length);

// 5) insert modal/toast before footer or before last script
if (!html.includes('id="seatModal"')) {
  if (html.includes('<footer')) {
    html = html.replace('<footer', MODAL_TOAST_HTML + '\n    <footer');
  } else {
    html = html.replace(FEATURE_JS.trim(), MODAL_TOAST_HTML + '\n' + FEATURE_JS.trim());
  }
}

// ensure modal exists once
const modalCount = (html.match(/id="seatModal"/g) || []).length;
if (modalCount === 0) {
  html = html.replace('</body>', MODAL_TOAST_HTML + '\n  </body>');
}

fs.writeFileSync(file, html, 'utf8');
console.log(JSON.stringify({
  ok: true,
  hasEventName: html.includes('id="eventName"'),
  hasTablesContainer: html.includes('id="tablesContainer"'),
  hasSeatModal: html.includes('id="seatModal"'),
  hasAddTable: html.includes('function addTable'),
  hasPrintChart: html.includes('function printChart'),
  hasLS: html.includes('seating_chart_data_v1'),
}, null, 2));
