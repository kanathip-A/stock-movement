import { Component, addDays, iso, parseISO, thShort, nf, DOW_FULL } from './logic.js';

/* ---------------- helpers ---------------- */
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const urlIn = (style) => { const m = /url\("([^"]+)"\)/.exec(style || ''); return m ? m[1] : ''; };
const num = (t) => Number(String(t || '').replace(/[^\d.-]/g, '')) || 0;

let H = [];                      // handler registry, rebuilt every render
const h = (fn) => { if (typeof fn !== 'function') return ''; H.push(fn); return String(H.length - 1); };
const on = (fn) => `data-h="${h(fn)}"`;
const onIn = (fn) => `data-in="${h(fn)}"`;
const onFile = (fn) => `data-file="${h(fn)}"`;

// view-only state (never stored)
const ui = { filter: 'all', expanded: null, moves: {}, account: false, lastDate: '' };

const comp = new Component({ historyLimit: 20, threshold: 10 });
const root = document.getElementById('app');

/* ---------------- pieces ---------------- */
const msg = (text, ok) => text ? `<div class="msg ${ok ? 'msg-ok' : 'msg-err'}" role="status">${esc(text)}</div>` : '';
const btn = (label, fn, cls = 'btn-primary', extra = '') => `<button class="btn ${cls}" ${on(fn)} ${extra}>${label}</button>`;

function stepper(unit, hint, value, dec, open, inc, tone = '') {
  return `<div>
    <div class="stepper-label"><span class="t-title4">${esc(unit)}</span><span class="t-cap5 muted">${hint}</span></div>
    <div class="stepper ${tone}">
      <button class="step" ${on(dec)} aria-label="ลด ${esc(unit)}">${icon('minus')}</button>
      <button class="val t-title6" ${on(open)} aria-label="พิมพ์จำนวน ${esc(unit)}">${esc(value)}</button>
      <button class="step" ${on(inc)} aria-label="เพิ่ม ${esc(unit)}">${icon('plus')}</button>
    </div>
  </div>`;
}

/* ---------------- login ---------------- */
function viewLogin(v) {
  return `<main class="login">
    <img src="icon-192.png" width="88" height="88" alt="" class="login-mark">
    <div class="stack-4" style="text-align:center">
      <h1 class="t-h5" style="margin:0">ตรวจความเคลื่อนไหวสินค้า</h1>
      <p class="t-body6 secondary" style="margin:0">เข้าสู่ระบบด้วยบัญชีของสาขาคุณ เพื่อกันการลงยอดผิดสาขา</p>
    </div>
    <form class="card" style="gap:var(--sp-200)" data-login>
      <label class="stack-4"><span class="t-title4">ชื่อผู้ใช้</span>
        <span class="field field-sm"><input data-k="lu" ${onIn(v.setLoginU)} value="${esc(v.loginU)}" placeholder="รหัสสาขาตัวเล็ก เช่น acp" autocomplete="username" autocapitalize="none"></span></label>
      <label class="stack-4"><span class="t-title4">รหัสผ่าน</span>
        <span class="field field-sm"><input data-k="lp" type="password" ${onIn(v.setLoginP)} value="${esc(v.loginP)}" placeholder="••••••••" autocomplete="current-password"></span></label>
      ${v.hasLoginErr ? `<div class="t-cap2" style="color:${/กำลัง/.test(v.loginErr) ? 'var(--text-tertiary)' : 'var(--text-error)'}">${esc(v.loginErr)}</div>` : ''}
      <button class="btn btn-primary btn-block" type="submit" data-submit="${h(v.login)}">เข้าสู่ระบบ</button>
    </form>
    <div class="t-cap5 muted">เวอร์ชัน ${esc(v.appVersion)}</div>
  </main>`;
}

/* ---------------- header ---------------- */
function viewHeader(v) {
  const s = comp.state;
  const today = iso(new Date());
  const goDate = (d) => () => { ui.expanded = null; comp.persist({ date: d > today ? today : d }); };
  return `<header class="header">
    <div class="header-row">
      <div class="header-title">
        <h1 class="t-title2">ตรวจความเคลื่อนไหวสินค้า</h1>
        <div class="t-cap4">รอบนับประจำวัน${v.isAdmin ? ` · ${esc(s.auth.u)}` : ''}</div>
      </div>
      ${v.isAdmin
        ? `<button class="chip-btn" ${on(v.toggleBranch)} aria-label="เปลี่ยนสาขา">${icon('branch', 'i i-16')}<span class="t-body7">${esc(v.branch)}</span>${icon('caret-down', 'i i-16')}</button>`
        : `<button class="chip-btn" ${on(() => { ui.account = true; comp.forceUpdate(); })} aria-label="บัญชีสาขา ${esc(v.branch)}">${icon('branch', 'i i-16')}<span class="t-body7">${esc(v.branch)}</span></button>`}
      <button class="nav-btn nav-sm" ${on(v.logoutAsk)} aria-label="ออกจากระบบ">${icon('logout')}</button>
    </div>
    <div class="date-row">
      <button class="nav-btn" ${on(goDate(addDays(s.date, -1)))} aria-label="วันก่อนหน้า">${icon('caret-left')}</button>
      <button class="date-btn" ${on(v.openCal)}>${icon('calendar', 'i i-16')}<span>${esc(v.dateLong)}</span></button>
      <button class="nav-btn" ${on(goDate(addDays(s.date, 1)))} ${s.date >= today ? 'disabled' : ''} aria-label="วันถัดไป">${icon('caret-right')}</button>
    </div>
  </header>`;
}

/* ---------------- count ---------------- */
function itemCard(it) {
  const expanded = !it.done || it.overWarn || ui.expanded === it.code;
  if (!expanded) {
    return `<button class="item-collapsed" ${on(() => { ui.expanded = it.code; comp.forceUpdate(); })} aria-label="แก้ยอดนับ ${esc(it.name)}">
      <span class="done-mark">${icon('check', 'i i-16')}</span>
      <span class="grow"><span class="t-body5 truncate" style="display:block">${esc(it.name)}</span>
        <span class="t-cap5 muted">เหลือ ${esc(it.left.toLocaleString('en-US'))} ${esc(it.smallUnit)} · ${esc(it.usedChipText)}</span></span>
      <span style="color:var(--icon-subtle)">${icon('edit')}</span>
    </button>`;
  }
  const hasMoves = !!(it.recvBig || it.recvSmall || it.outBig || it.outSmall);
  const showMoves = hasMoves || ui.moves[it.code];
  const chipTone = !it.done ? 'tone-neutral' : it.overWarn ? 'tone-warning' : 'tone-info';
  return `<article class="item${it.overWarn ? ' over' : ''}" id="it-${esc(it.code)}">
    <div class="row" style="align-items:flex-start">
      <div class="grow stack-4">
        <h3 class="t-title3" style="margin:0">${esc(it.name)}</h3>
        <div class="row" style="gap:var(--sp-75);flex-wrap:wrap"><span class="t-cap6 muted">${esc(it.code)}</span><span class="t-cap5 muted">1 ${esc(it.bigUnit)} = ${esc(Number(it.bigSize).toLocaleString('en-US'))} ${esc(it.smallUnit)}</span></div>
      </div>
      ${it.overWarn ? `<span style="color:var(--icon-warning)">${icon('warning', 'i i-24')}</span>` : it.done ? `<span class="done-mark">${icon('check', 'i i-16')}</span>` : ''}
    </div>
    <button class="carry" ${on(it.openCarry)}>
      <span class="grow stack-4"><span class="t-body6 secondary">ยอดยกมา</span><span class="t-cap5" style="color:${/ตั้งเอง/.test(it.carrySrc) ? 'var(--text-warning)' : 'var(--text-tertiary)'}">${esc(it.carrySrc)}</span></span>
      <span class="t-body7">${esc(it.carryText)}</span><span class="t-body6 secondary">${esc(it.smallUnit)}</span>
      <span style="color:var(--icon-subtle)">${icon('caret-right', 'i i-16')}</span>
    </button>
    ${showMoves ? `
      <div class="moves">
        <div class="moves-head"><span class="t-title4">${esc(it.recvLabel)}</span><span class="t-cap5 muted">${esc(it.recvSub)}</span></div>
        <div class="steppers">${stepper(it.bigUnit, 'หน่วยใหญ่', it.recvBig, it.recvBigDec, it.openRecvBig, it.recvBigInc)}${stepper(it.smallUnit, 'หน่วยย่อย', it.recvSmall, it.recvSmallDec, it.openRecvSmall, it.recvSmallInc)}</div>
        <div class="moves-head" style="margin-top:var(--sp-100)"><span class="t-title4">${esc(it.outLabel)}</span><span class="t-cap5 muted">${esc(it.outSub)}</span></div>
        <div class="steppers">${stepper(it.bigUnit, 'หน่วยใหญ่', it.outBig, it.outBigDec, it.openOutBig, it.outBigInc)}${stepper(it.smallUnit, 'หน่วยย่อย', it.outSmall, it.outSmallDec, it.openOutSmall, it.outSmallInc)}</div>
        ${it.hasOutNote ? `<div class="warn-msg">${icon('warning', 'i i-16')}<span class="t-cap2">${esc(it.outNote)}</span></div>` : ''}
      </div>`
      : `<button class="link-btn" ${on(() => { ui.moves[it.code] = true; comp.forceUpdate(); })}>${icon('plus', 'i i-16')}บันทึกรับเข้า / โอนออกวันนี้</button>`}
    <div class="stack-4">
      <div class="t-title5 secondary">นับที่เหลือจริง</div>
      <div class="steppers">${stepper(it.bigUnit, 'หน่วยใหญ่', it.big, it.bigDec, it.openBig, it.bigInc, it.overWarn ? 'err' : '')}${stepper(it.smallUnit, 'หน่วยย่อย', it.small, it.smallDec, it.openSmall, it.smallInc, it.overWarn ? 'err' : '')}</div>
    </div>
    ${it.overWarn ? `<div class="warn-msg">${icon('warning', 'i i-16')}<span class="t-cap2">${esc(it.overText)}</span></div>` : ''}
    <div class="item-foot">
      <span class="t-body5 grow">${it.done ? `เหลือ ${esc(it.left.toLocaleString('en-US'))} ${esc(it.smallUnit)}` : `เหลือ — ${esc(it.smallUnit)}`}</span>
      <span class="chip ${chipTone}">${esc(it.usedChipText)}</span>
    </div>
    <div class="row" style="justify-content:space-between">
      <button class="link-btn" ${on(it.openHist)}>${icon('history', 'i i-16')}ดูบันทึกย้อนหลัง</button>
      ${it.done && !it.overWarn ? `<button class="btn btn-tertiary btn-sm" ${on(() => { ui.expanded = null; comp.forceUpdate(); })}>เสร็จ</button>` : ''}
    </div>
  </article>`;
}

function viewCount(v) {
  const all = v.groups.flatMap((g) => g.items);
  const over = all.filter((i) => i.overWarn).length;
  const pct = Math.round((v.doneCount / v.totalCount) * 100);
  const f = ui.filter;
  const match = (i) => f === 'all' || (f === 'pending' && !i.done) || (f === 'check' && i.overWarn) || (f === 'done' && i.done);
  const shelfIcon = { 'ของแห้ง': ['shelf-dry', 'shelf-dry'], 'ของเย็น': ['shelf-cold', 'shelf-cold'], 'บุฟเฟ่ต์': ['shelf-buffet', 'shelf-cold'] };
  const groups = v.groups.map((g) => {
    const list = g.items.filter(match);
    if (!list.length) return '';
    const [cls, ic] = shelfIcon[g.shelf] || ['shelf-cold', 'shelf-cold'];
    return `<section class="shelf">
      <div class="shelf-head"><span class="shelf-icon ${cls}">${icon(ic)}</span><h2 class="t-h6 grow" style="margin:0">${esc(g.shelf)}</h2><span class="t-cap4 muted">นับแล้ว ${esc(g.meta)}</span></div>
      ${list.map(itemCard).join('')}
    </section>`;
  }).join('');
  return `
    ${v.allDone ? `<section class="card" style="justify-items:center;text-align:center">
      <img src="icons/illustration-all-counted.svg" width="104" height="104" alt="">
      <h2 class="t-h5" style="margin:0">นับครบ ${v.totalCount} รายการแล้ว</h2>
      <p class="t-body6 secondary" style="margin:0">ใช้ไปรวม ${esc(v.usedTotal)}${over ? ` · มี ${over} รายการที่เหลือมากกว่ายอดที่มี ตรวจก่อนส่ง` : ''} · กดส่งขึ้น Sheet ด้านล่างได้เลย</p>
    </section>` : ''}
    <section class="card">
      <div class="row" style="align-items:baseline"><h2 class="t-title2 grow" style="margin:0">นับแล้ว ${v.doneCount} จาก ${v.totalCount} รายการ</h2><span class="t-body7" style="color:var(--text-info)">${pct}%</span></div>
      <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
      <div class="totals">
        ${[['ยกมา', v.carryTotal], ['รับเข้า', v.recvTotal], ['เหลือ', v.leftTotal], ['ใช้ไป', v.usedTotal]].map(([l, x], i) => `${i ? '<div class="vdivider"></div>' : ''}<div><div class="t-cap5 muted">${l}</div><div class="t-body7">${esc(x)}</div></div>`).join('')}
      </div>
    </section>
    <div class="filters" role="group" aria-label="กรองรายการ">
      ${[['all', 'ทั้งหมด', all.length], ['pending', 'ยังไม่นับ', all.length - v.doneCount], ['check', 'ต้องตรวจ', over], ['done', 'นับแล้ว', v.doneCount]]
        .map(([id, l, c]) => `<button class="filter" aria-pressed="${f === id}" ${on(() => { ui.filter = id; comp.forceUpdate(); })}>${l} <span class="num">${c}</span></button>`).join('')}
    </div>
    ${groups || '<p class="t-cap2 muted" style="text-align:center">ไม่มีรายการในตัวกรองนี้</p>'}
    <section class="card">
      <div class="row">${icon('sync', 'i i-24')}<div class="grow stack-4"><h2 class="t-title3" style="margin:0">งานค้างข้ามเครื่อง</h2><span class="t-cap5 muted">ระบบเก็บงานที่ยังไม่ส่งไว้ให้อัตโนมัติ เข้ารหัสสาขาเดิมที่เครื่องอื่นก็นับต่อได้</span></div></div>
      ${btn('ดึงงานค้างจากเครื่องอื่นมาทำต่อ', v.pullDraft, 'btn-secondary btn-block')}
      ${msg(v.draftMsg, comp.state.draftOk)}
    </section>`;
}

/* ---------------- sales ---------------- */
function saleOf(d) {
  const s = comp.state;
  const isAdmin = !!s.auth && s.auth.role === 'admin';
  const local = isAdmin ? 0 : Number((s.salesByDate || {})[d] || 0);
  if (local) return local;
  const r = comp.srcRounds().rounds[d];
  return r ? Number(r.sales || 0) : 0;
}
function viewSales(v) {
  const s = comp.state;
  const days = [-6, -5, -4, -3, -2, -1, 0].map((i) => addDays(s.date, i));
  const vals = days.map(saleOf);
  const max = Math.max(1, ...vals);
  const filled = vals.filter(Boolean);
  const total = filled.reduce((a, b) => a + b, 0);
  return `
    <section class="card">
      <div class="t-title4 secondary">ยอดขาย ${esc(v.salesScopeLabel)}</div>
      <div><span class="t-h7">${esc(v.salesTotalText)}</span> <span class="t-body5 muted">บาท</span></div>
      ${btn(esc(v.salesEditText), v.openSalesTotal, v.isAdmin ? 'btn-secondary btn-block' : 'btn-primary btn-block')}
      ${v.isAdmin ? msg(comp.state.pullMsg, true) : ''}
    </section>
    <section class="card">
      <div class="row" style="align-items:baseline"><h2 class="t-title3 grow" style="margin:0">ยอดขาย 7 วันล่าสุด</h2><span class="t-cap4 muted">กรอกแล้ว ${filled.length}/7 วัน</span></div>
      ${days.map((d, i) => {
        const x = vals[i];
        const open = v.isAdmin ? () => comp.persist({ date: d }) : () => comp.setState({ pad: { kind: 'salesDay', day: d }, padBuf: '' });
        return `<button class="day" ${on(open)} ${d === s.date ? 'aria-current="date"' : ''}>
          <span class="d"><span class="t-title4" style="display:block">${esc(DOW_FULL[(parseISO(d).getDay() + 6) % 7])}</span><span class="t-cap5 muted">${esc(thShort(d))}</span></span>
          <span class="bar"><span style="width:${(x / max) * 100}%"></span></span>
          <span class="amt ${x ? 't-body7' : 't-cap2 muted'}">${x ? esc(nf(x)) : 'ยังไม่กรอก'}</span>
        </button>`; }).join('')}
      <div class="divider"></div>
      <div class="totals"><div><div class="t-cap5 muted">รวม ${filled.length} วันที่กรอก</div><div class="t-title6">${esc(nf(total))} ฿</div></div><div><div class="t-cap5 muted">เฉลี่ยต่อวัน</div><div class="t-title6">${esc(nf(filled.length ? Math.round(total / filled.length) : 0))} ฿</div></div></div>
    </section>
    <div class="banner banner-info">${icon('info')}<div class="stack-4"><div class="t-title4">ยอดขายใช้ทำอะไร</div><div class="t-cap2 secondary">ใช้หาอัตราการใช้วัตถุดิบต่อยอดขาย และต้องกรอกก่อนจึงจะส่งยอดนับขึ้น Sheet ได้ ${v.isAdmin ? 'แอดมินดูยอดจาก Sheet ของสาขาที่เลือก' : 'แตะวันในรายการเพื่อแก้ยอดของวันนั้น'}</div></div></div>`;
}

/* ---------------- pull card (analysis / history) ---------------- */
const pullCard = (v) => v.isAdminView ? `<section class="card">
  <div class="row">${icon('download', 'i i-24')}<div class="grow stack-4"><h2 class="t-title3" style="margin:0">${esc(v.pullTitle)}</h2><span class="t-cap5 muted">${esc(v.pullHint)}</span></div></div>
  ${btn(esc(v.pullBtnText), v.pullBranch, 'btn-secondary btn-block', comp.state.pulling ? 'disabled' : '')}
  ${msg(v.pullMsg, !/ไม่สำเร็จ/.test(v.pullMsg || ''))}
</section>` : '';

/* ---------------- analysis ---------------- */
const statusOf = (flag) => ({ 'ตรวจข้อมูล': 'err', 'ใช้เกินปกติ': 'over', 'ใช้น้อยผิดปกติ': 'under', 'ทิศทางสวนกัน': 'opp', 'ปกติ': 'ok' }[flag] || 'few');
const heatTone = (style) => /#E8762C|#F4C39B/i.test(style) ? 'hot' : /#F6D5B6|#FBE8D5/i.test(style) ? 'warm' : /#CFE3D6|#E2EFE6/i.test(style) ? 'cool' : '';

function viewAnalysis(v) {
  const head = `${pullCard(v)}
    <section class="card">
      <div class="totals">
        <div><div class="t-cap5 muted">ยอดขาย ${esc(v.anaScope)}</div><div><span class="t-title6">${esc(v.anaSalesText)}</span> <span class="t-cap5 muted">บาท</span></div></div>
      </div>
      <div class="t-cap2 secondary">${esc(v.compareText)}</div>
      <div class="t-cap5 muted">${esc(v.srcNote)}</div>
    </section>
    <div class="stat-filter">
      <div class="stat ${Number(v.upCount) ? 'alert' : ''}"><span class="t-title6">${esc(v.upCount)}</span><span class="t-cap3">ใช้เพิ่มขึ้น</span></div>
      <div class="stat"><span class="t-title6">${esc(v.downCount)}</span><span class="t-cap3 secondary">ใช้ลดลง</span></div>
      <div class="stat"><span class="t-title6">${esc(v.pendingCount)}</span><span class="t-cap3 secondary">ยังไม่ได้นับ</span></div>
    </div>`;
  if (v.noAnalysis) {
    return head + `<section class="empty">
      <img src="icons/illustration-nothing-to-compare.svg" alt="">
      <h2 class="t-h6" style="margin:0">ยังไม่มีรอบให้เทียบ</h2>
      <p class="t-body6 secondary" style="margin:0">ต้องมีรอบที่นับสินค้าแล้วอย่างน้อย 1 รอบ ถ้าเป็นแอดมินให้กดดึงข้อมูลสาขาจาก Sheet</p>
      <div class="btn-row" style="width:100%">${btn('ไปนับสินค้า', v.goCount)}${btn('ใส่ยอดขาย', v.goSales, 'btn-secondary')}</div>
    </section>`;
  }
  const seg = `<div class="seg" role="tablist">
      <button role="tab" aria-selected="${v.viewCard}" ${on(v.setViewCard)}>การ์ด</button>
      <button role="tab" aria-selected="${v.viewTable}" ${on(v.setViewTable)}>ตารางย้อนหลัง</button>
    </div>
    <div class="row"><div class="t-title4 grow">${esc(v.anaHeadline)}</div><button class="btn btn-secondary btn-sm" ${on(v.openCurReport)}>${icon('download', 'i i-16')}PDF</button></div>`;
  if (v.viewTable) {
    return head + seg + `<section class="card" style="padding:0;overflow:hidden">
      <div class="heat-wrap"><div class="heat">
        <div class="heat-row heat-head"><div class="heat-name">รายการ</div>${v.tblHeads.map((x) => `<div class="heat-cell">${esc(x)}</div>`).join('')}</div>
        ${v.tblRows.map((t) => `<div class="heat-row"><div class="heat-name">${esc(t.name)} <span class="muted">· ${esc(t.unit)}</span></div>${t.cells.map((c) => `<div class="heat-cell ${heatTone(c.style)}">${esc(c.text)}</div>`).join('')}</div>`).join('')}
      </div></div>
    </section>
    <div class="legend"><span><i class="sw warm"></i>เกินเล็กน้อย</span><span><i class="sw hot"></i>เกินมาก</span><span><i class="sw cool"></i>ใช้น้อยผิดปกติ</span></div>
    <div class="t-cap5 muted">ตัวเลขในช่อง = % หน่วยที่ใช้เทียบยอดขาย (หน่วยย่อย ÷ บาท × 100) · รอบที่ไม่ได้กรอกยอดขายแสดง –</div>`;
  }
  const anomalies = v.anomalies.map((a) => {
    const st = statusOf(a.flagText);
    const hs = a.bars.map((b) => Number((/height:([\d.]+)px/.exec(b.style) || [])[1] || 6));
    return `<article class="acard st-${st}">
      <div class="row"><span class="chip flag-${st}">${esc(a.flagText)}</span><span class="t-cap5 muted grow">${esc(a.shelf)} · ${esc(a.scope)}</span></div>
      <h3 class="t-title3" style="margin:0">${esc(a.name)}</h3>
      <div class="row" style="align-items:flex-end;gap:var(--sp-200)">
        <div><div class="t-title6 pct">${esc(a.bigText)}</div><div class="t-cap5 muted">${esc(a.bigLabel)}</div></div>
        <div class="spark grow">${a.bars.map((b, i) => `<div class="spark-col${i === a.bars.length - 1 ? ' last' : ''}"><span class="t-cap6">${esc(b.val)}</span><i style="height:${hs[i]}px"></i><span class="t-cap5">${esc(b.date)}</span></div>`).join('')}</div>
      </div>
      <div class="facts">
        <div><div class="t-cap5 muted">ใช้จริง</div><div class="t-body7">${esc(a.actualText)}</div><div class="t-cap5 muted">${esc(a.rateSmall)}</div></div>
        <div><div class="t-cap5 muted">ช่วงปกติ (ตามยอดขาย)</div><div class="t-body7">${esc(a.bandText)}</div><div class="t-cap5 muted">ส่วนเกิน ${esc(a.excessText)}</div></div>
        <div><div class="t-cap5 muted">รอบก่อน ${esc(a.prevLabel)}</div><div class="t-body7">${esc(a.prevPctText)}</div><div class="t-cap5 muted">${esc(a.prevText)}</div></div>
      </div>
      <div class="cause"><span class="t-cap3">${esc(a.causeLabel)}</span><span class="t-cap2 secondary">${esc(a.cause)}</span></div>
    </article>`;
  }).join('');
  const compare = v.analysis.map((r) => {
    const up = r.diffText.startsWith('+'), down = r.diffText.startsWith('-') || r.diffText.startsWith('−');
    return `<article class="crow">
      <div class="row" style="align-items:flex-start"><div class="grow stack-4"><span class="t-cap5 muted">${esc(r.shelf)} · ${esc(r.scope)}</span><h3 class="t-body5" style="margin:0">${esc(r.name)}</h3></div>
        <div style="text-align:right"><div class="t-cap5 muted">รอบนี้/ขาย <b class="t-body7">${esc(r.salePctText)}</b></div><div class="t-cap5 muted">รอบก่อน/ขาย <b class="t-body7">${esc(r.salePctPrevText)}</b></div></div></div>
      <div class="facts">
        <div><div class="t-cap5 muted">ใช้รอบนี้</div><div class="t-body7">${esc(r.usedText)}</div></div>
        <div><div class="t-cap5 muted">รอบก่อน ${esc(r.prevLabel)}</div><div class="t-body7">${esc(r.prevUsedText)}</div></div>
        <div><div class="t-cap5 muted">ต่างกัน</div><div class="t-body7" style="color:${up ? 'var(--text-error)' : down ? 'var(--text-success)' : 'inherit'}">${esc(r.diffText)}</div></div>
      </div>
      <div class="t-cap5 muted">${esc(r.note)} · หน่วย ${esc(r.unit)}</div>
    </article>`;
  }).join('');
  return head + seg + anomalies + `<h2 class="t-title3" style="margin:0">เทียบยอดใช้กับรอบก่อน</h2><div class="t-cap5 muted" style="margin-top:calc(-1 * var(--sp-200))">เรียงจากต่างมากสุด</div>` + compare;
}

/* ---------------- peer ---------------- */
function viewPeer(v) {
  const grades = comp.state.gradeMap || {};
  const cur = grades[v.branch] || '';
  return `<section class="card">
      <div class="row"><div class="grow stack-4"><h2 class="t-title3" style="margin:0">เทียบสาขา</h2><span class="t-cap5 muted">เทียบการใช้วัตถุดิบกับสาขาที่ขายได้ใกล้เคียงกัน (30 วันล่าสุด)</span></div>
        ${btn(esc(v.peerBtnText), v.reloadPeers, 'btn-secondary btn-sm', comp.state.peerLoading ? 'disabled' : '')}</div>
      ${msg(v.peerMsg, comp.state.peerOk)}
    </section>
    ${v.hasPeers ? `
    <section class="card">
      <div class="row" style="align-items:flex-start">
        <div class="grade"><span class="t-cap4">กลุ่ม</span><span class="t-title6">${esc(v.myGrade)}</span></div>
        <div class="grow stack-4">
          ${v.myIsBuffet ? '<span class="chip tone-warning" style="justify-self:start">บุฟเฟต์</span>' : ''}
          <div class="t-body5">${esc(v.peerGroupLine)}</div>
          <div class="t-cap5 muted">${esc(v.peerGroupNames)}</div>
          ${v.myIsBuffet ? `<div class="t-cap5 muted">${esc(v.buffetNote)}</div>` : ''}
          <div class="t-cap5 muted">ขายเฉลี่ยวันละ <b class="t-body7">${esc(v.myAvgSale)}</b> บาท</div>
        </div>
      </div>
      <div class="banner ${Number(v.peerHot) ? 'banner-error' : 'banner-ok'}" style="padding:var(--sp-100) var(--sp-200)">
        <div class="stack-4"><div class="t-title4">${esc(v.peerVerdict)}</div><div class="t-cap5 secondary">${esc(v.peerVerdictSub)}</div>
        ${v.hasPeerTop ? v.peerTop.map((t) => `<div class="peer-top"><div class="row"><span class="t-body5 grow">${esc(t.topName)}</span><span class="chip tone-error">${esc(t.topExtra)}</span></div><div class="t-cap5 secondary">${esc(t.topLine)}</div><div class="t-cap5 muted">${esc(t.topRef)}</div></div>`).join('') : ''}</div>
      </div>
      ${v.isSuper ? `<div class="row" style="flex-wrap:wrap"><span class="t-cap4 muted grow">แอดมินกำหนดเกรดสาขานี้</span>
        ${[['A', v.setGradeA], ['B', v.setGradeB], ['C', v.setGradeC], ['', v.setGradeAuto]].map(([g, fn]) => `<button class="pill" aria-pressed="${cur === g}" ${on(fn)}>${g || 'อัตโนมัติ'}</button>`).join('')}</div>` : ''}
    </section>
    <section class="card" style="gap:0;padding:0;overflow:hidden">
      <div class="list-head"><span class="grow">ทุกสินค้า · แตะเพื่อดูอันดับ</span><span>เราใช้</span></div>
      ${v.peerItems.map((p) => `<button class="list-row" aria-pressed="${/#FFF7EA/i.test(p.row)}" ${on(p.pick)}><span class="t-body6 grow">${esc(p.name)}</span><span class="t-body7">${esc(p.mine)}</span><span class="t-cap6" style="width:48px;text-align:right;color:${p.diff > 10 ? 'var(--text-error)' : p.diff < -10 ? 'var(--text-success)' : 'var(--text-tertiary)'}">${esc(p.diffText)}</span></button>`).join('')}
    </section>
    <section class="card" style="gap:0;padding:0;overflow:hidden">
      <div class="list-head"><span class="grow">อันดับทุกสาขา · ${esc(v.peerSelName)}</span></div>
      ${v.peerRank.map((r) => { const me = /สาขาของเรา/.test(r.name); return `<div class="list-row${me ? ' me' : ''}"><span class="rank t-body7">${esc(r.no)}</span><span class="t-body6 grow">${esc(r.name)}</span><span class="t-body7">${esc(r.pct)}</span></div>`; }).join('')}
    </section>
    <div class="t-cap5 muted">${esc(v.myRankText)} · เรียงจากใช้น้อยไปมาก · ตัวอักษรหลังชื่อ = เกรดสาขา · ตัวเลข = ปริมาณที่แต่ละสาขาจะใช้ถ้ายอดขายเท่าเรา</div>`
    : `${v.noPeers ? '<section class="empty"><img src="icons/illustration-nothing-to-compare.svg" alt=""><p class="t-body6 secondary" style="margin:0">ยังไม่มีข้อมูลเทียบสาขา ต้องมีสาขาที่ส่งทั้งยอดนับและยอดขายขึ้น Sheet ในช่วง 30 วัน</p></section>' : ''}`}`;
}

/* ---------------- history ---------------- */
function viewHistory(v) {
  return `<section class="stack-4"><h2 class="t-h6" style="margin:0">ข้อมูลย้อนหลัง</h2><span class="t-cap5 muted">แตะรอบที่ต้องการเพื่อดูรายละเอียดทุกรายการและบันทึกเป็น PDF · ${esc(v.srcNote)}</span></section>
    ${pullCard(v)}
    ${v.noRounds ? '<p class="t-cap2 muted" style="text-align:center">ยังไม่มีรอบนับย้อนหลัง</p>' : ''}
    <div class="stack" style="gap:var(--sp-75)">
      ${v.roundList.map((r) => `<button class="hist-row" ${on(r.open)}>
        <span class="t-body7" style="width:64px">${esc(r.date)}</span>
        <span class="grow"><span class="t-body5" style="display:block">${esc(r.label)} · ${esc(r.detail)}</span><span class="t-cap5 muted">ขาย ${esc(r.sales)} ฿</span></span>
        <span class="chip tone-info">PDF</span>
      </button>`).join('')}
    </div>`;
}

/* ---------------- admin ---------------- */
function viewAdmin(v) {
  const s = comp.state;
  return `<section class="card">
      <h2 class="t-title3" style="margin:0">การเชื่อมต่อ Google Sheet</h2>
      <span class="t-cap5 muted">ลิงก์ Apps Script Web App ของ Sheet กลาง ทุกสาขาส่งข้อมูลเข้าไฟล์เดียวกัน</span>
      <span class="field field-sm"><input data-k="su" ${onIn(v.setSyncUrl)} value="${esc(v.syncUrl)}" placeholder="https://script.google.com/macros/s/…/exec" class="mono"></span>
      <span class="field field-sm"><input data-k="ss" ${onIn(v.setSyncSecret)} value="${esc(v.syncSecret)}" placeholder="คีย์ลับ (ถ้าตั้ง SECRET ในสคริปต์)" class="mono"></span>
      <div class="t-cap5 muted">Sheet เดียว · แท็บละสาขา + แท็บสรุปรวม · 1 แถว = 1 สินค้าต่อรอบนับ · ส่งซ้ำรอบเดิมจะทับข้อมูลเดิม</div>
    </section>
    <section class="card">
      <h2 class="t-title3" style="margin:0">จัดการสาขา (${esc(v.branchCount)})</h2>
      ${v.branchRows.map((b) => { const ph = urlIn(b.photoStyle); return `<div class="branch-row">
        <label class="avatar" style="${ph ? `background-image:url('${esc(ph)}')` : ''}">${ph ? '' : '<span class="t-cap5">เพิ่ม<br>รูป</span>'}<input type="file" accept="image/*" class="sr-only" ${onFile(b.onPhoto)}></label>
        <div class="grow stack-4" style="gap:var(--sp-75)">
          <div class="row"><span class="t-body7">${esc(b.code)}</span><span class="t-cap5 muted grow">login: ${esc(b.login)}</span><button class="icon-btn" ${on(b.del)} aria-label="ลบสาขา ${esc(b.code)}">${icon('x', 'i i-16')}</button></div>
          <span class="field field-xs"><input data-k="bn-${esc(b.code)}" ${onIn(b.setName)} value="${esc(b.name)}" placeholder="ชื่อสาขา"></span>
          <span class="field field-xs"><input data-k="bo-${esc(b.code)}" ${onIn(b.setOwner)} value="${esc(b.owner)}" placeholder="ชื่อเจ้าของสาขา"></span>
          <div class="row"><span class="field field-xs grow"><input data-k="bp-${esc(b.code)}" ${onIn(b.setPass)} value="${esc(b.pass)}" placeholder="รหัสผ่านสาขา" class="mono"></span>${btn('รีเซ็ต', b.resetPass, 'btn-secondary btn-sm')}</div>
          <div class="row" style="flex-wrap:wrap"><span class="t-cap4 muted grow">${esc(b.admLabel)}</span>
            <button class="pill" ${on(b.toView)}>ดูข้อมูล</button><button class="pill" ${on(b.toFull)}>สูงสุด</button><button class="pill" ${on(b.toNone)}>ถอด</button></div>
        </div>
      </div>`; }).join('')}
    </section>
    <section class="card">
      <h2 class="t-title3" style="margin:0">เพิ่มสาขาใหม่</h2>
      <span class="field field-sm"><input data-k="nbc" ${onIn(v.setNbCode)} value="${esc(v.nbCode)}" placeholder="รหัสสาขา เช่น CTW"></span>
      <span class="field field-sm"><input data-k="nbn" ${onIn(v.setNbName)} value="${esc(v.nbName)}" placeholder="ชื่อสาขา"></span>
      <span class="field field-sm"><input data-k="nbo" ${onIn(v.setNbOwner)} value="${esc(v.nbOwner)}" placeholder="ชื่อเจ้าของสาขา"></span>
      <span class="field field-sm"><input data-k="nbp" ${onIn(v.setNbPass)} value="${esc(v.nbPass)}" placeholder="รหัสผ่านสาขา (อย่างน้อย 6 ตัว)"></span>
      ${btn('เพิ่มสาขาและสร้างบัญชีพนักงาน', v.addBranch, 'btn-primary btn-block')}
      ${msg(v.adminMsg, !/ไม่สำเร็จ|⚠|ต้อง|ใส่|มีอยู่แล้ว|สั้น/.test(v.adminMsg || ''))}
      ${btn('ซิงก์รายชื่อสาขาทั้งหมดขึ้นระบบ', v.syncBranches, 'btn-secondary btn-block')}
      <div class="t-cap5 muted">login คือรหัสสาขาตัวเล็ก · สาขาเปลี่ยนรหัสผ่านและใส่รูปเองได้ที่ปุ่มรหัสสาขาบนหัวแอป · กดซิงก์หลังเพิ่มสาขาเพื่อให้เครื่องอื่นเห็น</div>
    </section>
    <section class="card">
      <div class="row"><h2 class="t-title3 grow" style="margin:0">จัดการแอดมิน (${esc(v.adminCount)})</h2>${btn('โหลดใหม่', v.loadAdmins, 'btn-tertiary btn-sm')}</div>
      ${v.adminRows.map((a) => `<div class="admin-row">
        <div class="grow stack-4"><span class="t-body7">${esc(a.u)}</span><span class="t-cap5 muted">${esc(a.name)} · ${esc(a.levelLabel)}</span></div>
        <div class="row" style="gap:var(--sp-50)"><button class="pill" aria-pressed="${/ดูข้อมูล ·/.test(a.levelLabel)}" ${on(a.setView)}>ดูข้อมูล</button><button class="pill" aria-pressed="${/สูงสุด ·/.test(a.levelLabel)}" ${on(a.setFull)}>สูงสุด</button><button class="pill" ${on(a.del)}>ปิดสิทธิ์</button></div>
      </div>`).join('')}
      <div class="divider"></div>
      <h3 class="t-title4" style="margin:0">เพิ่มแอดมินใหม่</h3>
      <span class="field field-sm"><input data-k="nau" ${onIn(v.setNaU)} value="${esc(v.naU)}" placeholder="ชื่อผู้ใช้ เช่น om.admin" autocapitalize="none"></span>
      <span class="field field-sm"><input data-k="nan" ${onIn(v.setNaName)} value="${esc(v.naName)}" placeholder="ชื่อ-สกุล"></span>
      <span class="field field-sm"><input data-k="nap" type="password" ${onIn(v.setNaP)} value="${esc(v.naP)}" placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"></span>
      <div class="seg"><button aria-selected="${s.naLevel !== 'full'}" ${on(v.setNaView)}>ดูข้อมูล</button><button aria-selected="${s.naLevel === 'full'}" ${on(v.setNaFull)}>สูงสุด</button></div>
      ${btn('เพิ่มแอดมิน', v.addAdmin, 'btn-primary btn-block')}
      ${msg(v.adminsMsg, !/ไม่สำเร็จ|ใส่|ต้อง/.test(v.adminsMsg || ''))}
      <div class="t-cap5 muted">ข้อมูลแอดมินเก็บในแท็บ "แอดมิน" ของ Google Sheet · สูงสุด = แก้ไขทุกอย่างและเห็นแท็บนี้ · ดูข้อมูล = สลับดูได้ทุกสาขา</div>
    </section>`;
}

/* ---------------- overlays ---------------- */
const sheet = (body, close, label) => `<div class="overlay" role="dialog" aria-modal="true" aria-label="${esc(label)}"><div class="scrim" ${on(close)}></div><div class="sheet-panel"><div class="grabber"></div>${body}</div></div>`;

function overlays(v) {
  let out = '';
  if (v.padOpen) {
    const keys = v.padKeys.map((k, i) => {
      const cls = i === v.padKeys.length - 1 ? 'key key-wide' : /^[0-9.]$/.test(k.label) ? 'key' : k.label === '⌫' ? 'key key-soft' : k.label === '=' ? 'key key-eq' : 'key key-op';
      return `<button class="${cls}" ${on(k.press)} aria-label="${k.label === '⌫' ? 'ลบ' : esc(k.label)}">${k.label === '⌫' ? icon('backspace', 'i i-24') : esc(k.label)}</button>`;
    }).join('');
    out += sheet(`
      <div class="stack-4"><div class="t-cap4" style="color:var(--text-info)">${esc(v.padKind)}</div><div class="t-title2">${esc(v.padName)}</div></div>
      <div class="display"><div class="grow"><div class="t-h7" aria-live="polite">${esc(v.padValue)}</div>${v.padShowPreview ? `<div class="t-body7 muted">${esc(v.padPreview)}</div>` : ''}</div><span class="t-cap4 muted">${esc(v.padHint)}</span></div>
      ${v.isCarryPad ? `<div class="carry-check">
        <div class="t-cap2 secondary">${esc(v.carryPrevText)}</div>
        <div class="t-cap2" style="color:${v.carryNeedReason ? 'var(--text-error)' : 'var(--text-success)'}">${esc(v.carryDiffText)}</div>
        ${v.carryNeedReason ? `<span class="field field-xs"><input data-k="cr" ${onIn(v.setCarryReason)} value="${esc(v.carryReason)}" placeholder="เหตุผล เช่น ของเสียเมื่อวาน / นับรอบก่อนผิด"></span>` : ''}
        ${v.hasCarryErr ? `<div class="t-cap2" style="color:var(--text-error)">${esc(v.carryErr)}</div>` : ''}
      </div>` : ''}
      <div class="keypad calc">${keys}</div>
      <div class="btn-row">${btn('ยกเลิก', v.closePad, 'btn-secondary')}${btn('บันทึก', v.confirmPad)}</div>`, v.closePad, 'แป้นตัวเลข');
  }
  if (v.histOpen) {
    out += sheet(`<div class="stack-4"><div class="t-cap4" style="color:var(--text-info)">บันทึกย้อนหลัง</div><div class="t-title2">${esc(v.histName)}</div></div>
      ${v.histEmpty ? '<p class="t-cap2 muted">ยังไม่มีรอบที่นับสินค้ารายการนี้</p>' : ''}
      <div class="hist-list">${v.histRows.map((r) => `<div class="hist-item"><div class="row"><span class="t-body7 grow">${esc(r.date)}</span><span class="chip ${r.src === 'ตั้งเอง' ? 'tone-warning' : 'tone-neutral'}">${esc(r.src)}</span></div>
        <div class="facts facts-4"><div><div class="t-cap5 muted">ยกมา</div><div class="t-body7">${esc(r.carry)}</div></div><div><div class="t-cap5 muted">รับ</div><div class="t-body7">+${esc(r.recv)}</div></div><div><div class="t-cap5 muted">เหลือ</div><div class="t-body7">${esc(r.left)}</div></div><div><div class="t-cap5 muted">ใช้</div><div class="t-body7">${esc(r.used)}</div></div></div></div>`).join('')}</div>
      ${btn('ปิด', v.closeHist, 'btn-secondary btn-block')}`, v.closeHist, 'บันทึกย้อนหลัง');
  }
  if (v.calOpen) {
    const cells = v.calCells.map((c) => {
      if (!c.label) return '<span></span>';
      const sel = /gradient/.test(c.style), today = /#E8762C/i.test(c.style) && !sel, data = /underline/.test(c.style);
      return `<button class="cal-cell${sel ? ' sel' : ''}${today ? ' today' : ''}${data ? ' has' : ''}" ${on(() => { c.pick(); ui.expanded = null; })}>${esc(c.label)}</button>`;
    }).join('');
    out += sheet(`<div class="row"><button class="nav-btn ghost" ${on(v.prevMonth)} aria-label="เดือนก่อน">${icon('caret-left')}</button><div class="grow" style="text-align:center"><div class="t-title3">${esc(v.calTitle)}</div><div class="t-cap5 muted">เลือกวันที่ต้องการนับ · ขีดเขียว = มีข้อมูล</div></div><button class="nav-btn ghost" ${on(v.nextMonth)} aria-label="เดือนถัดไป">${icon('caret-right')}</button></div>
      <div class="cal">${v.dowLabels.map((d) => `<span class="t-cap4 muted">${esc(d.label)}</span>`).join('')}${cells}</div>
      <div class="btn-row">${btn('วันนี้', v.pickToday, 'btn-secondary')}${btn('ใช้วันที่นี้', v.closeCal)}</div>`, v.closeCal, 'ปฏิทิน');
  }
  if (v.branchOpen) {
    out += sheet(`<div class="stack-4"><div class="t-title2">เลือกสาขาที่ดู</div><div class="t-cap5 muted">แอดมินสลับสาขาแล้ว ระบบดึงข้อมูลสาขานั้นจาก Sheet ให้</div></div>
      <div class="branch-grid">${v.branches.map((b) => `<button class="branch" aria-pressed="${b.code === v.branch}" ${on(b.pick)}>${esc(b.code)}</button>`).join('')}</div>
      ${btn('ปิด', v.toggleBranch, 'btn-secondary btn-block')}`, v.toggleBranch, 'เลือกสาขา');
  }
  if (ui.account && v.isStaff) {
    const close = () => { ui.account = false; comp.forceUpdate(); };
    const ph = urlIn(v.myPhotoStyle);
    out += sheet(`<div class="t-title2">สาขาของฉัน · ${esc(v.branch)}</div>
      <div class="row">
        <label class="avatar avatar-lg" style="${ph ? `background-image:url('${esc(ph)}')` : ''}">${ph ? '' : '<span class="t-cap5">เพิ่ม<br>รูป</span>'}<input type="file" accept="image/*" class="sr-only" ${onFile(v.onMyPhoto)}></label>
        <label class="grow stack-4"><span class="t-cap4 muted">ชื่อสาขา · แตะรูปเพื่อเปลี่ยน</span><span class="field field-sm"><input data-k="mn" ${onIn(v.setMyName)} value="${esc(v.myName)}" placeholder="ชื่อสาขา"></span></label>
      </div>
      <div class="divider"></div>
      <div class="t-title4">เปลี่ยนรหัสผ่านของสาขานี้</div>
      <span class="field field-sm"><input data-k="p1" type="password" ${onIn(v.setPw1)} value="${esc(v.pw1)}" placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)" autocomplete="new-password"></span>
      <span class="field field-sm"><input data-k="p2" type="password" ${onIn(v.setPw2)} value="${esc(v.pw2)}" placeholder="ยืนยันรหัสผ่านใหม่" autocomplete="new-password"></span>
      ${btn('บันทึกรหัสผ่านใหม่', v.saveMyPass, 'btn-primary btn-block')}
      ${msg(v.pwMsg, comp.state.pwOk)}
      ${btn('ปิด', close, 'btn-secondary btn-block')}`, close, 'บัญชีสาขา');
  }
  if (v.reportOpen) {
    out += `<div id="reportprint" class="report" role="dialog" aria-modal="true" aria-label="รายงานการนับสินค้า">
      <div class="report-bar noprint">${btn('ปิด', v.closeReport, 'btn-secondary btn-sm')}${btn(`${icon('download', 'i i-16')}บันทึกเป็น PDF`, v.printReport, 'btn-primary btn-sm')}</div>
      <div class="report-head"><div class="report-title">รายงานการนับสินค้า</div><div>${esc(v.repBranch)} · ${esc(v.repLabel)} · ${esc(v.repDate)}</div><div>ยอดขายรอบนี้ ${esc(v.repSales)} บาท · ${esc(v.repCount)} รายการ</div></div>
      <div class="report-scroll"><div class="rtable">
        <div class="rrow rhead"><span class="rname">รายการ</span><span>ยกมา</span><span>รับเข้า</span><span>โอนออก</span><span>เหลือ</span><span>ใช้ไป</span><span>% ใช้/ขาย</span></div>
        ${v.repItems.map((r) => `<div class="rrow"><span class="rname">${esc(r.name)} <em>· ${esc(r.shelf)}</em></span><span>${esc(r.carry)}</span><span>${esc(r.recv)}</span><span>${esc(r.out)}</span><span>${esc(r.left)}</span><span>${esc(r.used)}</span><span>${esc(r.pct)}</span></div>`).join('')}
      </div>
      ${v.hasRepTbl ? `<div class="report-sub">% ใช้ต่อยอดขาย เทียบแต่ละรอบ</div><div class="report-note">ค่า = ยอดใช้ ÷ ยอดขาย × 100 · ส้ม = ใช้เกิน · เขียว = ใช้น้อยผิดปกติ · – = รอบที่ไม่มียอดขาย</div>
        <div class="rtable"><div class="rrow rhead"><span class="rname">รายการ</span>${v.repTblHeads.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
        ${v.repTblRows.map((t) => `<div class="rrow"><span class="rname">${esc(t.name)} <em>· ${esc(t.unit)}</em></span>${t.cells.map((c) => `<span class="${heatTone(c.style)}">${esc(c.text)}</span>`).join('')}</div>`).join('')}</div>` : ''}
      </div>
      <div class="report-note">${esc(v.repSource)} · พิมพ์เมื่อ ${esc(v.repPrinted)}</div>
    </div>`;
  }
  return out;
}

/* ---------------- dock ---------------- */
function viewDock(v) {
  const s = comp.state;
  const tabs = [['count', 'นับสินค้า', 'count', v.goCount, v.countBadge ? v.countBadgeText : ''], ['sales', 'ยอดขาย', 'sales', v.goSales, v.salesBadge ? '!' : ''],
    ['analysis', 'วิเคราะห์', 'analysis', v.goAnalysis, v.analysisBadge ? v.analysisBadgeText : ''], ['peer', 'เทียบสาขา', 'peer', v.goPeer, ''], ['history', 'ย้อนหลัง', 'history', v.goHistory, '']];
  if (v.isSuper) tabs.push(['sync', 'แอดมิน', 'admin', v.goSync, '']);
  const active = v.isCount ? 'count' : s.tab;
  const syncBar = v.isCount ? `<div class="savebar">
      <div class="grow stack-4" style="min-width:0"><div class="t-body5 truncate">${esc(v.lastSyncText)}</div><div class="t-cap5 truncate" style="color:${v.hasSyncMsg ? (s.syncOk ? 'var(--text-success)' : 'var(--text-error)') : 'var(--text-tertiary)'}">${esc(v.hasSyncMsg ? v.syncMsg : `นับแล้ว ${v.doneCount}/${v.totalCount} · ส่งได้แม้ยังนับไม่ครบ`)}</div></div>
      <button class="btn btn-primary" ${on(v.doSync)} ${s.syncing ? 'disabled' : ''}>${icon('sync', 'i')}${s.syncing ? 'กำลังส่ง…' : 'ส่งขึ้น Sheet'}</button>
    </div>` : '';
  return `<div class="dock">${syncBar}<nav class="tabs" aria-label="เมนูหลัก">${tabs.map(([id, label, ic, fn, badge]) => `<button class="tab" ${active === id ? 'aria-current="page"' : ''} ${on(fn)}><span class="pill-ic">${icon(ic, 'i i-24')}${badge ? `<span class="badge">${esc(badge)}</span>` : ''}</span>${label}</button>`).join('')}</nav></div>`;
}

/* ---------------- render ---------------- */
function render() {
  const v = comp.renderVals();
  H = [];
  const s = comp.state;
  if (ui.lastDate !== s.date) { ui.lastDate = s.date; ui.expanded = null; ui.moves = {}; }

  // focus + caret restore across re-renders
  const ae = document.activeElement;
  const fk = ae && ae.dataset ? ae.dataset.k : null;
  const sel = fk && 'selectionStart' in ae ? [ae.selectionStart, ae.selectionEnd] : null;

  let html;
  if (v.loggedOut) html = viewLogin(v);
  else {
    let body = '';
    if (v.isCount) body = viewCount(v);
    else if (v.isSales) body = viewSales(v);
    else if (v.isAnalysis) body = viewAnalysis(v);
    else if (v.isPeer) body = viewPeer(v);
    else if (v.isHistory) body = viewHistory(v);
    else if (v.isSync) body = viewAdmin(v);
    html = viewHeader(v)
      + (v.hasUpdate ? `<button class="update" ${on(v.applyUpdate)}>${icon('sync', 'i i-16')}มีเวอร์ชันใหม่ · แตะเพื่ออัปเดต</button>` : '')
      + `<main id="view">${body}<div class="t-cap5 muted" style="text-align:center">เวอร์ชัน ${esc(v.appVersion)}</div></main>`
      + viewDock(v);
  }
  root.innerHTML = html + (v.loggedIn ? overlays(v) : '');
  document.body.classList.toggle('locked', !!(v.padOpen || v.histOpen || v.calOpen || v.branchOpen || v.reportOpen || ui.account));

  if (fk) {
    const el = root.querySelector(`[data-k="${CSS.escape(fk)}"]`);
    if (el) { el.focus({ preventScroll: true }); if (sel) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* type=password etc. */ } }
  }
}

/* ---------------- events ---------------- */
root.addEventListener('click', (e) => {
  const t = e.target.closest('[data-h]');
  if (!t || t.disabled) return;
  const fn = H[Number(t.dataset.h)];
  if (fn) fn(e);
});
root.addEventListener('input', (e) => {
  const t = e.target.closest('[data-in]');
  if (!t) return;
  const fn = H[Number(t.dataset.in)];
  if (fn) fn({ target: t });
});
root.addEventListener('change', (e) => {
  const t = e.target.closest('[data-file]');
  if (!t) return;
  const fn = H[Number(t.dataset.file)];
  if (fn) fn({ target: t });
});
root.addEventListener('submit', (e) => {
  e.preventDefault();
  const b = e.target.querySelector('[data-submit]');
  const fn = b && H[Number(b.dataset.submit)];
  if (fn) fn();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const v = comp.renderVals();
  if (v.padOpen) v.closePad(); else if (v.histOpen) v.closeHist(); else if (v.calOpen) v.closeCal();
  else if (v.branchOpen) v.toggleBranch(); else if (v.reportOpen) v.closeReport();
  else if (ui.account) { ui.account = false; comp.forceUpdate(); }
});

comp._render = render;
render();
comp.componentDidMount();
