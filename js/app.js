import { ITEMS, SHELVES, BRANCHES, THRESHOLD } from './data.js';

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const nf = (n) => Number(n || 0).toLocaleString('en-US');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const DOW = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const MON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const thShort = (s) => { const d = parse(s); return `${d.getDate()} ${MON[d.getMonth()]}`; };
const thLong = (s) => { const d = parse(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear() + 543}`; };
const icon = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const today = () => iso(new Date());

/* ---------- state ---------- */
const KEY = 'stockmove.v4';
const state = {
  tab: 'count', branch: 'ACP', date: today(),
  rounds: {}, sales: {},
  filter: 'all', expanded: null,
};
const ui = { pad: null, buf: '', branchPick: null };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { Object.assign(state, JSON.parse(raw)); }
    else {
      // ย้ายข้อมูลจากแอปเวอร์ชันเดิม (stockmove.v3) ถ้ามี
      const old = JSON.parse(localStorage.getItem('stockmove.v3') || 'null');
      if (old) {
        const b = old.branch || 'ACP';
        state.branch = b;
        for (const [d, r] of Object.entries(old.rounds || {})) state.rounds[`${b}|${d}`] = r;
        for (const [d, v] of Object.entries(old.salesByDate || {})) state.sales[`${b}|${d}`] = v;
      }
    }
  } catch (e) { /* storage unavailable: run in memory */ }
  state.date = today(); state.expanded = null;
}
function save() {
  try {
    const { tab, branch, rounds, sales, filter } = state;
    localStorage.setItem(KEY, JSON.stringify({ tab, branch, rounds, sales, filter }));
  } catch (e) { /* ignore */ }
}
const k = (d = state.date, b = state.branch) => `${b}|${d}`;
const EMPTY = () => ({ carry: {}, big: {}, small: {}, touched: {} });
const round = (d = state.date) => state.rounds[k(d)] || EMPTY();
function editRound(fn) {
  const cur = round();
  const next = fn({ ...cur, carry: { ...cur.carry }, big: { ...cur.big }, small: { ...cur.small }, touched: { ...cur.touched } });
  state.rounds[k()] = next; save();
}

/* ---------- calculations ---------- */
const leftOf = (it, d = state.date) => { const r = round(d); return (r.big[it.code] || 0) * it.bigSize + (r.small[it.code] || 0); };
function carryOf(it, d = state.date) {
  const r = round(d);
  if (r.carry[it.code] !== undefined) return r.carry[it.code];
  const prev = state.rounds[k(addDays(d, -1))];
  if (prev && prev.touched && prev.touched[it.code]) return leftOf(it, addDays(d, -1)); // ยกยอดจากเมื่อวาน
  return it.sys;
}
const touched = (it, d = state.date) => !!round(d).touched[it.code];
const usedOf = (it, d = state.date) => (touched(it, d) ? carryOf(it, d) - leftOf(it, d) : 0);
const isOver = (it) => touched(it) && leftOf(it) > carryOf(it);
const salesOf = (d = state.date) => state.sales[k(d)] || 0;

function analysis(d = state.date) {
  const sales = salesOf(d);
  const rows = ITEMS.map((it) => {
    const used = Math.max(0, usedOf(it, d));
    const ready = used > 0 && sales > 0;
    const rate = ready ? (used / sales) * 1000 : 0;
    const pct = ready ? ((rate - it.rate) / it.rate) * 100 : 0;
    return { it, used, ready, rate, pct, bad: ready && Math.abs(pct) > THRESHOLD };
  });
  return { sales, rows, ready: rows.filter((r) => r.ready), alerts: rows.filter((r) => r.bad) };
}

/* ---------- views ---------- */
function viewCount() {
  const done = ITEMS.filter((it) => touched(it));
  const over = ITEMS.filter(isOver);
  const pending = ITEMS.filter((it) => !touched(it));
  const pct = Math.round((done.length / ITEMS.length) * 100);
  let carryT = 0, leftT = 0, usedT = 0;
  ITEMS.forEach((it) => { carryT += carryOf(it); if (touched(it)) { leftT += leftOf(it); usedT += Math.max(0, usedOf(it)); } });

  const allDone = pending.length === 0;
  const head = allDone ? `
    <section class="card" style="justify-items:center;text-align:center">
      <img src="icons/illustration-all-counted.svg" width="112" height="112" alt="">
      <h2 class="t-h5" style="margin:0">นับครบ ${ITEMS.length} รายการแล้ว</h2>
      <p class="t-body6 secondary" style="margin:0">ใช้ไปรวม ${nf(usedT)} หน่วย${over.length ? ` มี ${over.length} รายการนับเกินยอดยกมา ตรวจก่อนส่งไฟล์` : ''}</p>
      <button class="btn btn-primary btn-block" data-action="tab" data-tab="sync">ไปส่งไฟล์</button>
    </section>` : '';

  const progress = `
    <section class="card" aria-label="ความคืบหน้า">
      <div class="row" style="align-items:baseline">
        <h2 class="t-title2 grow" style="margin:0">นับแล้ว ${done.length} จาก ${ITEMS.length} รายการ</h2>
        <span class="t-body7" style="color:var(--text-info)">${pct}%</span>
      </div>
      <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
      <div class="totals">
        ${[['ยกยอดมารวม', carryT], ['เหลือรวม', leftT], ['ใช้ไปรวม', usedT]].map(([l, v], i) => `${i ? '<div class="vdivider"></div>' : ''}<div><div class="t-cap5 muted">${l}</div><div><span class="t-title6">${nf(v)}</span> <span class="t-cap5 muted">หน่วย</span></div></div>`).join('')}
      </div>
    </section>`;

  const filters = [['all', 'ทั้งหมด', ITEMS.length], ['pending', 'ยังไม่นับ', pending.length], ['check', 'ต้องตรวจ', over.length], ['done', 'นับแล้ว', done.length]];
  const filterBar = `<div class="filters" role="group" aria-label="กรองรายการ">${filters.map(([id, l, c]) => `<button class="filter" data-action="filter" data-filter="${id}" aria-pressed="${state.filter === id}">${l} <span class="num">${c}</span></button>`).join('')}</div>`;

  const match = (it) => state.filter === 'all' || (state.filter === 'pending' && !touched(it)) || (state.filter === 'check' && isOver(it)) || (state.filter === 'done' && touched(it));
  const shelves = SHELVES.map((sh) => {
    const all = ITEMS.filter((it) => it.shelf === sh.id);
    const list = all.filter(match);
    if (!list.length) return '';
    return `<section class="shelf" aria-labelledby="sh-${sh.id}">
      <div class="shelf-head">
        <span class="shelf-icon shelf-${sh.id}">${icon(sh.icon)}</span>
        <h2 class="t-h6 grow" style="margin:0" id="sh-${sh.id}">${sh.name}</h2>
        <span class="t-cap4 muted">นับแล้ว ${all.filter((it) => touched(it)).length}/${all.length}</span>
      </div>
      ${list.map(itemHTML).join('')}
    </section>`;
  }).join('');

  const empty = !shelves.trim() ? `<p class="t-cap2 muted" style="text-align:center">ไม่มีรายการในตัวกรองนี้</p>` : '';
  return head + progress + filterBar + shelves + empty;
}

function itemHTML(it) {
  const t = touched(it), over = isOver(it);
  const r = round();
  const left = leftOf(it), carry = carryOf(it), used = carry - left;
  if (t && !over && state.expanded !== it.code) {
    return `<button class="item-collapsed" data-action="expand" data-code="${it.code}" aria-label="แก้ยอดนับ ${esc(it.name)}">
      <span class="done-mark">${icon('check', 'i i-16')}</span>
      <span class="grow"><span class="t-body5 truncate" style="display:block">${esc(it.name)}</span><span class="t-cap5 muted">เหลือ ${nf(left)} ${it.smallUnit} · ใช้ไป ${nf(used)} ${it.smallUnit}</span></span>
      <span class="t-body7 secondary">−${nf(used)}</span>
      <span style="color:var(--icon-subtle)">${icon('edit')}</span>
    </button>`;
  }
  const stepper = (kind, unit, hint, val) => `
    <div>
      <div class="stepper-label"><span class="t-title4">${unit}</span><span class="t-cap5 muted">${hint}</span></div>
      <div class="stepper">
        <button class="step" data-action="dec" data-kind="${kind}" data-code="${it.code}" aria-label="ลด ${unit}">${icon('minus')}</button>
        <button class="val t-title6" data-action="pad" data-kind="${kind}" data-code="${it.code}" aria-label="พิมพ์จำนวน ${unit}">${nf(val)}</button>
        <button class="step" data-action="inc" data-kind="${kind}" data-code="${it.code}" aria-label="เพิ่ม ${unit}">${icon('plus')}</button>
      </div>
    </div>`;
  const chip = !t ? '<span class="chip tone-neutral">ยังไม่นับ</span>'
    : over ? `<span class="chip tone-warning">เกินยอดยกมา ${nf(-used)} ${it.smallUnit}</span>`
    : `<span class="chip tone-info">ใช้ไป ${nf(used)} ${it.smallUnit}</span>`;
  return `<article class="item${over ? ' over' : ''}" id="it-${it.code}">
    <div class="row" style="align-items:flex-start">
      <div class="grow stack-4">
        <h3 class="t-title3" style="margin:0">${esc(it.name)}</h3>
        <div class="row" style="gap:var(--sp-75)"><span class="t-cap6 muted">${it.code}</span><span class="t-cap5 muted">1 ${it.bigUnit} = ${it.bigSize} ${it.smallUnit}</span></div>
      </div>
      ${over ? `<span style="color:var(--icon-warning)">${icon('warning', 'i i-24')}</span>` : t ? `<span class="done-mark">${icon('check', 'i i-16')}</span>` : ''}
    </div>
    <button class="carry" data-action="pad" data-kind="carry" data-code="${it.code}">
      <span class="t-body6 secondary grow">ยกยอดมาจากรอบก่อน</span>
      <span class="t-body7">${nf(carry)}</span><span class="t-body6 secondary">${it.smallUnit}</span>
      <span style="color:var(--icon-subtle)">${icon('caret-right', 'i i-16')}</span>
    </button>
    <div class="stack-4">
      <div class="t-title5 secondary">นับที่เหลือจริง</div>
      <div class="steppers">${stepper('big', it.bigUnit, 'หน่วยใหญ่', r.big[it.code] || 0)}${stepper('small', it.smallUnit, 'หน่วยย่อย', r.small[it.code] || 0)}</div>
    </div>
    ${over ? `<div class="warn-msg">${icon('warning', 'i i-16')}<span class="t-cap2">นับได้ ${nf(left)} ${it.smallUnit} มากกว่ายอดยกมา ${nf(carry)} ${it.smallUnit} ตรวจว่ารับของเข้าระหว่างวันแล้วหรือยัง ถ้ารับแล้วให้แก้ยอดยกมา</span></div>` : ''}
    <div class="item-foot">
      <span class="t-body5 grow">${t ? `เหลือ ${nf(left)} ${it.smallUnit}` : `เหลือ — ${it.smallUnit}`}</span>
      ${chip}
      ${t && !over ? `<button class="btn btn-tertiary" style="min-height:40px;padding:0 var(--sp-100)" data-action="collapse">เสร็จ</button>` : ''}
    </div>
  </article>`;
}

function viewSales() {
  const v = salesOf();
  const days = [...Array(7)].map((_, i) => addDays(state.date, i - 6));
  const vals = days.map((d) => salesOf(d));
  const max = Math.max(1, ...vals);
  const filled = vals.filter(Boolean);
  const total = filled.reduce((a, b) => a + b, 0);
  const avg = filled.length ? Math.round(total / filled.length) : 0;
  return `
    <section class="stack-4" style="gap:var(--sp-75)">
      <label class="t-title4" for="salesInput">ยอดขาย ${thShort(state.date)}</label>
      <div class="field" id="salesField">
        <input id="salesInput" inputmode="numeric" autocomplete="off" placeholder="0" value="${v ? nf(v) : ''}" aria-describedby="salesHelp">
        <span class="t-body5 muted">บาท</span>
      </div>
      <div class="t-cap5 muted" id="salesHelp">ใส่ยอดขายรวมทั้งวันจาก POS แล้วกดบันทึก</div>
    </section>
    <button class="btn btn-primary btn-block" data-action="saveSales">บันทึกยอดขาย</button>
    <section class="card">
      <div class="row" style="align-items:baseline"><h2 class="t-title3 grow" style="margin:0">ยอดขาย 7 วันล่าสุด</h2><span class="t-cap4 muted">กรอกแล้ว ${filled.length}/7 วัน</span></div>
      ${days.map((d, i) => `<button class="day" data-action="goDate" data-date="${d}" ${d === state.date ? 'aria-current="date"' : ''}>
        <span class="d"><span class="t-title4" style="display:block">${DOW[parse(d).getDay()]}</span><span class="t-cap5 muted">${thShort(d)}</span></span>
        <span class="bar"><span style="width:${(vals[i] / max) * 100}%"></span></span>
        <span class="amt ${vals[i] ? 't-body7' : 't-cap2 muted'}">${vals[i] ? nf(vals[i]) : 'ยังไม่กรอก'}</span>
      </button>`).join('')}
      <div class="divider"></div>
      <div class="totals"><div><div class="t-cap5 muted">รวม ${filled.length} วันที่กรอก</div><div class="t-title6">${nf(total)} ฿</div></div><div><div class="t-cap5 muted">เฉลี่ยต่อวัน</div><div class="t-title6">${nf(avg)} ฿</div></div></div>
    </section>
    <div class="banner banner-info">${icon('info')}<div class="stack-4"><div class="t-title4">ยอดขายใช้ทำอะไร</div><div class="t-cap2 secondary">แอปเทียบการใช้สินค้าต่อยอดขาย 1,000 บาทกับอัตราปกติ ถ้าเบี่ยงเกิน ${THRESHOLD}% รายการนั้นจะขึ้นในแท็บวิเคราะห์</div></div></div>`;
}

function viewAnalysis() {
  const a = analysis();
  const counted = ITEMS.filter((it) => touched(it)).length;
  if (!a.ready.length) {
    return `<section class="empty">
      <img src="icons/illustration-nothing-to-compare.svg" alt="">
      <h2 class="t-h6" style="margin:0">ยังไม่มีอะไรให้เทียบ</h2>
      <p class="t-body6 secondary" style="margin:0">ผลวิเคราะห์ต้องใช้ 2 อย่างของวันที่ ${thShort(state.date)} คือยอดนับคงเหลือ และยอดขายเป็นบาท</p>
      <button class="step-row" data-action="tab" data-tab="count"><span style="color:${counted ? 'var(--icon-success)' : 'var(--icon-subtle)'}">${icon(counted ? 'check' : 'clock')}</span><span class="t-body5 grow">นับสินค้า ${ITEMS.length} รายการ</span><span class="t-cap4 muted">${counted}/${ITEMS.length}</span></button>
      <button class="step-row" data-action="tab" data-tab="sales"><span style="color:${a.sales ? 'var(--icon-success)' : 'var(--icon-subtle)'}">${icon(a.sales ? 'check' : 'clock')}</span><span class="t-body5 grow">กรอกยอดขายวันนี้</span><span class="t-cap4 muted">${a.sales ? nf(a.sales) + ' ฿' : 'ยังไม่กรอก'}</span></button>
    </section>`;
  }
  const usedTotal = a.rows.reduce((s, r) => s + r.used, 0);
  const sorted = a.ready.slice().sort((x, y) => Math.abs(y.pct) - Math.abs(x.pct));
  return `
    <section class="card"><div class="totals">
      <div><div class="t-cap5 muted">ยอดขาย ${thShort(state.date)}</div><div><span class="t-title6">${nf(a.sales)}</span> <span class="t-cap5 muted">บาท</span></div></div>
      <div class="vdivider"></div>
      <div><div class="t-cap5 muted">ใช้สินค้าไปรวม</div><div><span class="t-title6">${nf(usedTotal)}</span> <span class="t-cap5 muted">หน่วย</span></div></div>
    </div></section>
    <div class="stat-filter">
      <div class="stat ${a.alerts.length ? 'alert' : ''}"><span class="t-title6">${a.alerts.length}</span><span class="t-cap3">ต้องตรวจ</span></div>
      <div class="stat"><span class="t-title6">${ITEMS.length - a.ready.length}</span><span class="t-cap3 secondary">ยังไม่ครบ</span></div>
      <div class="stat"><span class="t-title6">${a.ready.length - a.alerts.length}</span><span class="t-cap3 secondary">ปกติ</span></div>
    </div>
    ${a.alerts.length ? `<div class="banner banner-error">${icon('warning', 'i i-24')}<div class="stack-4"><div class="t-title3" style="color:var(--text-error)">${a.alerts.length} รายการใช้ผิดปกติ</div><div class="t-cap2 secondary">การใช้ต่อยอดขาย 1,000 บาทเบี่ยงจากอัตราปกติเกิน ${THRESHOLD}% ตรวจของเสีย การเบิก หรือการนับซ้ำก่อนส่งไฟล์</div></div></div>` : ''}
    <div class="t-cap4 muted">เรียงตามส่วนเบี่ยงมากไปน้อย · ขีดดำ = อัตราปกติ</div>
    ${sorted.map((r) => {
      const cls = !r.bad ? 'ok' : r.pct > 0 ? 'over' : 'under';
      const note = !r.bad ? 'อยู่ในเกณฑ์' : r.pct > 0 ? 'ใช้มากกว่าปกติ ตรวจของเสีย ของแตก การตักเกินสูตร หรือการเบิกที่ไม่ลงระบบ' : 'ใช้น้อยกว่าปกติ ตรวจยอดยกมา การรับเข้าที่ยังไม่บันทึก หรือการนับผิดหน่วย';
      const w = Math.min(100, 50 * (r.rate / r.it.rate));
      return `<article class="acard ${cls}">
        <div class="row" style="align-items:flex-start">
          <div class="grow stack-4"><h3 class="t-title3" style="margin:0">${esc(r.it.name)}</h3><span class="t-cap5 muted">ใช้ ${nf(r.used)} ${r.it.smallUnit} · ขาย ${nf(a.sales)} ฿</span></div>
          <div style="text-align:right"><div class="t-title6 pct">${r.pct > 0 ? '+' : '−'}${Math.abs(r.pct).toFixed(1)}%</div><div class="t-cap5 muted">เทียบอัตราปกติ</div></div>
        </div>
        <div class="totals"><div><div class="t-cap5 muted">อัตราจริง ต่อ 1,000 ฿</div><div class="t-body7">${r.rate.toFixed(2)}</div></div><div><div class="t-cap5 muted">อัตราปกติ</div><div class="t-body7">${r.it.rate.toFixed(2)}</div></div></div>
        <div class="bar"><span style="width:${w}%"></span><i class="marker" style="left:50%"></i></div>
        <div class="t-cap2 secondary">${note}</div>
      </article>`;
    }).join('')}`;
}

function csvFor(d = state.date) {
  const a = analysis(d);
  const head = ['สาขา', 'วันที่', 'รหัส', 'สินค้า', 'ชั้น', 'ยกยอดมา', 'นับหน่วยใหญ่', 'นับหน่วยย่อย', 'คงเหลือ', 'ใช้ไป', 'หน่วย', 'อัตราปกติ/1000฿', 'อัตราจริง/1000฿', 'เบี่ยง%'];
  const r = round(d);
  const lines = ITEMS.map((it, i) => {
    const t = !!r.touched[it.code], row = a.rows[i];
    return [state.branch, d, it.code, it.name, SHELVES.find((s) => s.id === it.shelf).name, carryOf(it, d), t ? r.big[it.code] || 0 : '', t ? r.small[it.code] || 0 : '', t ? leftOf(it, d) : '', t ? usedOf(it, d) : '', it.smallUnit, it.rate, row.ready ? row.rate.toFixed(2) : '', row.ready ? row.pct.toFixed(1) : ''];
  });
  lines.push([]); lines.push(['ยอดขาย (บาท)', a.sales]);
  return '﻿' + [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
}
const fileName = (d = state.date) => `${state.branch}_${d}.csv`;

function viewSync() {
  const r = round();
  const counted = ITEMS.filter((it) => touched(it)).length;
  const a = analysis();
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.csv', { type: 'text/csv' })] }));
  const hist = Object.keys(state.rounds).filter((key) => key.startsWith(state.branch + '|')).map((key) => key.split('|')[1]).sort().reverse().slice(0, 10);
  const time = (ts) => { const d = new Date(ts); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
  return `
    <section class="card">
      <div class="row">
        <img src="icons/illustration-synced.svg" width="48" height="48" alt="">
        <div class="grow stack-4"><h2 class="t-title3" style="margin:0">ไฟล์ของวันนี้</h2><span class="t-cap6 muted">${fileName()}</span></div>
      </div>
      <div class="t-cap5 ${r.exportedAt ? '' : 'muted'}" style="${r.exportedAt ? 'color:var(--text-success)' : ''}">${r.exportedAt ? `ส่งออกแล้วเมื่อ ${time(r.exportedAt)}` : 'ยังไม่ได้ส่งออก'}</div>
      ${canShare ? `<button class="btn btn-primary btn-block" data-action="share">${icon('share')}แชร์ไฟล์ (เลือก Google Drive)</button>` : ''}
      <button class="btn ${canShare ? 'btn-secondary' : 'btn-primary'} btn-block" data-action="download">${icon('download')}ดาวน์โหลดไฟล์ CSV</button>
      <div class="t-cap5 muted">เปิดด้วย Excel หรืออัปโหลดเข้า Google Drive ได้ทันที</div>
    </section>
    <section class="card" style="gap:0">
      <h2 class="t-title3" style="margin:0 0 var(--sp-50)">สถานะรอบนี้</h2>
      <div class="list">
        ${[[counted === ITEMS.length, 'ยอดนับคงเหลือ', `${counted} จาก ${ITEMS.length} รายการ${r.savedAt ? ` · บันทึก ${time(r.savedAt)}` : ''}`],
           [!!a.sales, 'ยอดขาย', a.sales ? `${nf(a.sales)} บาท` : 'ยังไม่กรอก'],
           [a.ready.length > 0 && !a.alerts.length, 'ผลวิเคราะห์', a.ready.length ? (a.alerts.length ? `${a.alerts.length} รายการต้องตรวจ` : 'อยู่ในเกณฑ์ทั้งหมด') : 'รอข้อมูลให้ครบ'],
        ].map(([ok, t, d]) => `<div class="li"><span style="color:${ok ? 'var(--icon-success)' : 'var(--icon-subtle)'}">${icon(ok ? 'check' : 'clock')}</span><div class="grow"><div class="t-body5">${t}</div><div class="t-cap5 muted">${d}</div></div></div>`).join('')}
      </div>
    </section>
    <section class="card" style="gap:0">
      <h2 class="t-title3" style="margin:0 0 var(--sp-50)">รอบนับย้อนหลัง · ${state.branch}</h2>
      ${hist.length ? `<div class="list">${hist.map((d) => {
        const rr = state.rounds[k(d)]; const c = ITEMS.filter((it) => rr.touched[it.code]).length; const s = salesOf(d);
        const tag = rr.exportedAt ? ['tone-success', 'ส่งแล้ว'] : rr.savedAt ? ['tone-info', 'บันทึกแล้ว'] : ['tone-warning', 'ยังไม่บันทึก'];
        return `<button class="li" style="width:100%;text-align:left" data-action="goDate" data-date="${d}" data-tab="count"><span class="t-body7" style="width:72px">${thShort(d)}</span><span class="grow"><span class="t-body6" style="display:block">นับ ${c}/${ITEMS.length} รายการ</span><span class="t-cap5 muted">${s ? `ยอดขาย ${nf(s)} บาท` : 'ยังไม่กรอกยอดขาย'}</span></span><span class="chip ${tag[0]}">${tag[1]}</span></button>`;
      }).join('')}</div>` : '<p class="t-cap2 muted" style="margin:var(--sp-75) 0 0">ยังไม่มีรอบนับของสาขานี้</p>'}
    </section>
    <section class="card">
      <h2 class="t-title3" style="margin:0">สำรองข้อมูล</h2>
      <p class="t-cap2 secondary" style="margin:0">ข้อมูลเก็บไว้ในเครื่องนี้เท่านั้น ถ้าจะเปลี่ยนเครื่องหรือล้างเบราว์เซอร์ ให้ดาวน์โหลดไฟล์สำรองไว้ก่อน</p>
      <div class="btn-row">
        <button class="btn btn-secondary" data-action="backup">${icon('download')}ไฟล์สำรอง</button>
        <label class="btn btn-secondary">กู้คืน<input type="file" accept="application/json" id="restoreInput" class="sr-only"></label>
      </div>
    </section>`;
}

/* ---------- render ---------- */
function render() {
  $('#branchLabel').textContent = state.branch;
  $('#dateLabel').textContent = thLong(state.date);
  $('#datePicker').value = state.date;
  $('#datePicker').max = today();
  $('#nextDay').disabled = state.date >= today();
  document.querySelectorAll('.tab').forEach((t) => { if (t.dataset.tab === state.tab) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });

  const remaining = ITEMS.filter((it) => !touched(it)).length;
  const alerts = analysis().alerts.length;
  const bc = $('#badgeCount'); bc.hidden = !remaining; bc.textContent = remaining;
  $('#badgeSales').hidden = !!salesOf();
  const ba = $('#badgeAnalysis'); ba.hidden = !alerts; ba.textContent = alerts;

  const sb = $('#saveBar'); sb.hidden = state.tab !== 'count';
  const r = round();
  $('#saveStatus').textContent = `นับแล้ว ${ITEMS.length - remaining}/${ITEMS.length}`;
  $('#saveHint').textContent = r.savedAt ? `บันทึกล่าสุด ${new Date(r.savedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}` : 'บันทึกได้แม้ยังนับไม่ครบ';

  const views = { count: viewCount, sales: viewSales, analysis: viewAnalysis, sync: viewSync };
  $('#view').innerHTML = views[state.tab]();
}

let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400); }

/* ---------- number pad ---------- */
function openPad(kind, code) {
  const it = ITEMS.find((x) => x.code === code);
  const r = round();
  ui.pad = { kind, code };
  const cur = kind === 'carry' ? carryOf(it) : (r[kind][code] || 0);
  ui.buf = cur ? String(cur) : '';
  $('#padKind').textContent = kind === 'carry' ? `ยกยอดมา · ${it.smallUnit}` : kind === 'big' ? `${it.bigUnit} · หน่วยใหญ่` : `${it.smallUnit} · หน่วยย่อย`;
  $('#padTitle').textContent = it.name;
  updatePad();
  $('#padSheet').showModal();
}
function updatePad() {
  const it = ITEMS.find((x) => x.code === ui.pad.code);
  const v = Number(ui.buf || 0);
  const unit = ui.pad.kind === 'big' ? it.bigUnit : it.smallUnit;
  $('#padValue').textContent = nf(v);
  $('#padOk').textContent = `บันทึก ${nf(v)} ${unit}`;
  const other = ui.pad.kind === 'big' ? (round().small[it.code] || 0) : ui.pad.kind === 'small' ? (round().big[it.code] || 0) * it.bigSize : null;
  $('#padHint').textContent = other === null ? '' : `รวมเหลือ ${nf(ui.pad.kind === 'big' ? v * it.bigSize + other : v + other)} ${it.smallUnit}`;
}
$('#keypad').innerHTML = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'ล้าง', '0', 'back'].map((key) => key === 'back'
  ? `<button type="button" class="key" data-key="back" aria-label="ลบ">${icon('backspace', 'i i-24')}</button>`
  : `<button type="button" class="key${key === 'ล้าง' ? ' word' : ''}" data-key="${key}">${key}</button>`).join('');
$('#keypad').addEventListener('click', (e) => {
  const b = e.target.closest('[data-key]'); if (!b) return;
  const key = b.dataset.key;
  if (key === 'back') ui.buf = ui.buf.slice(0, -1);
  else if (key === 'ล้าง') ui.buf = '';
  else ui.buf = (ui.buf + key).replace(/^0+(?=\d)/, '').slice(0, 6);
  updatePad();
});
$('#padSheet').addEventListener('close', () => {
  if ($('#padSheet').returnValue === 'ok' && ui.pad) {
    const v = Number(ui.buf || 0); const { kind, code } = ui.pad;
    editRound((o) => { o[kind][code] = v; if (kind !== 'carry') o.touched[code] = true; return o; });
    render();
  }
  ui.pad = null; $('#padSheet').returnValue = '';
});

/* ---------- branch sheet ---------- */
function openBranches() {
  ui.branchPick = state.branch;
  const draw = () => {
    $('#branchGrid').innerHTML = BRANCHES.map((b) => `<button type="button" class="branch" data-branch="${b}" aria-pressed="${b === ui.branchPick}">${b}</button>`).join('');
    $('#branchOk').textContent = `นับสาขา ${ui.branchPick}`;
  };
  draw();
  $('#branchGrid').onclick = (e) => { const b = e.target.closest('[data-branch]'); if (b) { ui.branchPick = b.dataset.branch; draw(); } };
  $('#branchSheet').showModal();
}
$('#branchSheet').addEventListener('close', () => {
  if ($('#branchSheet').returnValue === 'ok' && ui.branchPick !== state.branch) { state.branch = ui.branchPick; state.expanded = null; save(); render(); toast(`เปลี่ยนเป็นสาขา ${state.branch}`); }
  $('#branchSheet').returnValue = '';
});

/* ---------- export ---------- */
function download(name, blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function markExported() { editRound((o) => { o.exportedAt = Date.now(); o.savedAt = o.savedAt || Date.now(); return o; }); }

/* ---------- events ---------- */
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-action], .tab'); if (!el) return;
  if (el.classList.contains('tab')) { state.tab = el.dataset.tab; save(); render(); window.scrollTo(0, 0); return; }
  const { action, code, kind } = el.dataset;
  const it = code && ITEMS.find((x) => x.code === code);
  switch (action) {
    case 'inc': case 'dec': {
      editRound((o) => { const d = action === 'inc' ? 1 : -1; o[kind][code] = Math.max(0, (o[kind][code] || 0) + d); o.touched[code] = true; return o; });
      state.expanded = code; render(); $(`#it-${code}`)?.querySelector(`[data-action="${action}"][data-kind="${kind}"]`)?.focus(); break;
    }
    case 'pad': openPad(kind, code); break;
    case 'expand': state.expanded = code; render(); $(`#it-${code}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); break;
    case 'collapse': state.expanded = null; render(); break;
    case 'filter': state.filter = el.dataset.filter; save(); render(); break;
    case 'tab': state.tab = el.dataset.tab; save(); render(); window.scrollTo(0, 0); break;
    case 'goDate': state.date = el.dataset.date; if (el.dataset.tab) state.tab = el.dataset.tab; state.expanded = null; save(); render(); break;
    case 'saveSales': {
      const raw = $('#salesInput').value.replace(/[^\d]/g, ''); const v = Number(raw || 0);
      const recent = [...Array(14)].map((_, i) => salesOf(addDays(state.date, -i - 1))).filter(Boolean);
      const avg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
      if (avg && v > avg * 5) {
        $('#salesField').classList.add('error'); const h = $('#salesHelp'); h.style.color = 'var(--text-error)';
        h.textContent = `สูงกว่ายอดเฉลี่ย ${nf(Math.round(avg))} บาทหลายเท่า ตรวจว่าใส่ศูนย์เกินหรือไม่ แล้วกดบันทึกอีกครั้งถ้าถูกต้อง`;
        if (!el.dataset.confirm) { el.dataset.confirm = '1'; return; }
      }
      state.sales[k()] = v; save(); render(); toast(`บันทึกยอดขาย ${thShort(state.date)} ${nf(v)} บาทแล้ว`); break;
    }
    case 'download': download(fileName(), new Blob([csvFor()], { type: 'text/csv;charset=utf-8' })); markExported(); render(); toast('ดาวน์โหลดไฟล์แล้ว'); break;
    case 'share': {
      const file = new File([csvFor()], fileName(), { type: 'text/csv' });
      try { await navigator.share({ files: [file], title: fileName() }); markExported(); render(); toast('ส่งไฟล์แล้ว'); }
      catch (err) { if (err.name !== 'AbortError') toast('แชร์ไม่สำเร็จ ลองดาวน์โหลดไฟล์แทน'); }
      break;
    }
    case 'backup': download(`stock-movement-backup_${today()}.json`, new Blob([JSON.stringify({ v: 4, rounds: state.rounds, sales: state.sales })], { type: 'application/json' })); break;
  }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'salesInput') {
    const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
    e.target.value = digits ? nf(Number(digits)) : '';
    $('#salesField').classList.remove('error'); const h = $('#salesHelp'); h.style.color = ''; h.textContent = 'ใส่ยอดขายรวมทั้งวันจาก POS แล้วกดบันทึก';
    const b = document.querySelector('[data-action="saveSales"]'); if (b) delete b.dataset.confirm;
  }
});
document.addEventListener('keydown', (e) => { if (e.target.id === 'salesInput' && e.key === 'Enter') document.querySelector('[data-action="saveSales"]').click(); });
document.addEventListener('change', async (e) => {
  if (e.target.id === 'restoreInput' && e.target.files[0]) {
    try {
      const data = JSON.parse(await e.target.files[0].text());
      if (!data.rounds) throw new Error('bad');
      Object.assign(state.rounds, data.rounds); Object.assign(state.sales, data.sales || {}); save(); render(); toast('กู้คืนข้อมูลแล้ว');
    } catch { toast('ไฟล์นี้ไม่ใช่ไฟล์สำรองของแอป'); }
  }
});
$('#saveBtn').addEventListener('click', () => { editRound((o) => { o.savedAt = Date.now(); return o; }); render(); toast(`บันทึกยอดนับ ${state.branch} ${thShort(state.date)} แล้ว`); });
$('#branchBtn').addEventListener('click', openBranches);
$('#prevDay').addEventListener('click', () => { state.date = addDays(state.date, -1); state.expanded = null; render(); });
$('#nextDay').addEventListener('click', () => { if (state.date < today()) { state.date = addDays(state.date, 1); state.expanded = null; render(); } });
$('#datePicker').addEventListener('change', (e) => { if (e.target.value) { state.date = e.target.value > today() ? today() : e.target.value; state.expanded = null; render(); } });
$('.date-btn').addEventListener('click', (e) => { const p = $('#datePicker'); if (e.target !== p && p.showPicker) { try { p.showPicker(); } catch { /* ignore */ } } });

load();
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
