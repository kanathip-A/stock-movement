import { DCLogic } from './dc.js';

const ITEMS = [
  {shelf:'ของแห้ง', code:'RM00051', name:'ข้าวสารญี่ปุ่น 5KG. 5pk/sac', sys:4500, bigUnit:'กระสอบ25กก.', bigSize:25000, smallUnit:'กรัม', rate:1500, pdfUnit:'sac', pdfDiv:5000},
  {shelf:'ของแห้ง', code:'RM00065', name:'น้ำส้มปรุงสำเร็จ 5L. (น้ำปรุงซูชิ) (6.29)', sys:2400, bigUnit:'แกลลอน(6290)', bigSize:6290, smallUnit:'กรัม', rate:800},
  {shelf:'ของเย็น', code:'SM00005', name:'เนื้อปลาแซลมอน', sys:2700, bigUnit:'กิโลกรัม', bigSize:1000, smallUnit:'กรัม', rate:900},
  {shelf:'ของเย็น', code:'SM00020', name:'เนื้อวากิวสไลด์ 500g. (ซูชิ)', sys:780, bigUnit:'แพค(500)', bigSize:500, smallUnit:'กรัม', rate:260},
  {shelf:'ของเย็น', code:'RM00013', name:'เบคอนรมควัน 1KG. 5pk/bag', sys:900, bigUnit:'แพค(1000)', bigSize:1000, smallUnit:'กรัม', rate:300},
  {shelf:'ของเย็น', code:'RM00018', name:'ไข่กุ้งส้ม 500g.', sys:360, bigUnit:'แพค(500)', bigSize:500, smallUnit:'กรัม', rate:120},
  {shelf:'ของเย็น', code:'RM00031', name:'ทูน่า', sys:1350, bigUnit:'กิโลกรัม', bigSize:1000, smallUnit:'กรัม', rate:450},
  {shelf:'ของเย็น', code:'RM00040', name:'ไข่ไก่ เบอร์ 4 (30 ฟอง/แพค)', sys:78, bigUnit:'แผง(30)', bigSize:30, smallUnit:'ฟอง', rate:26},
  {shelf:'ของเย็น', code:'RM00105', name:'ปลาซาบะดองแล่ 500 กรัม/แพค', sys:660, bigUnit:'แพค(500)', bigSize:500, smallUnit:'กรัม', rate:220},
  {shelf:'ของเย็น', code:'RM00115', name:'กุ้ง Hiraki Argen 4L 20ชิ้น/แพค (18แพค/ลัง)', sys:42, bigUnit:'แพค(20)', bigSize:20, smallUnit:'ชิ้น', rate:14},
  {shelf:'ของเย็น', code:'RM00177', name:'กุ้งอาเจนตินา L2 42-60 PCS/PACK', sys:48, bigUnit:'แพค(60)', bigSize:60, smallUnit:'ชิ้น', rate:16},
  {shelf:'ของเย็น', code:'RM00181', name:'ไข่ปลาแซลมอน Pink 500 กรัม', sys:270, bigUnit:'แพค(500)', bigSize:500, smallUnit:'กรัม', rate:90},
  {shelf:'ของเย็น', code:'RM00308', name:'แซลมอนสเต๊ก 5 ชิ้น/แพค', sys:18, bigUnit:'แพค(5)', bigSize:5, smallUnit:'ชิ้น', rate:6},
  {shelf:'ของเย็น', code:'RM00346', name:'หมูทงคัตสึ 100g. (50ชิ้น/ลัง)', sys:27, bigUnit:'ลัง(50)', bigSize:50, smallUnit:'ชิ้น', rate:9},
  {shelf:'ของเย็น', code:'RM00448', name:'หอยเชลล์ Hotate 6S 1KG. (81-100pcs/pack)', sys:720, bigUnit:'แพค(1000)', bigSize:1000, smallUnit:'กรัม', rate:240},
  {shelf:'บุฟเฟ่ต์', code:'RM00139', name:'กุ้งต้มแช่แข็ง 51/60 (บุฟเฟ่ต์)', sys:1000, bigUnit:'แพค(1000)', bigSize:1000, smallUnit:'กรัม', rate:333},
  {shelf:'บุฟเฟ่ต์', code:'RM00457', name:'กุ้งปอกเปลือก PPV 31/40 (เฉพาะ Buffet) 1kg/pack', sys:1350, bigUnit:'แพค(1000)', bigSize:1000, smallUnit:'กรัม', rate:450}
];
const BRANCH_SEED = ['FPR','ZR','MVR','BU','ACP','CAY','SMA','YCR','TU'].map(c=>({code:c, name:'สาขา '+c, owner:'', photo:''}));
const STAFF_PASS = 'staff1234';
const SHELF_COLOR = {'ของแห้ง':'#C79A4E','ของเย็น':'#5E9BB8','บุฟเฟ่ต์':'#C4501A'};
const DOW = ['จ','อ','พ','พฤ','ศ','ส','อา'];
const DOW_FULL = ['จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์','อาทิตย์'];
const MON = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const nf = n => Number(n).toLocaleString('en-US');
const pad2 = n => String(n).padStart(2,'0');
const iso = d => d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
const parseISO = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate()+n); return iso(d); };
const mondayOf = s => { const d = parseISO(s); const w = (d.getDay()+6)%7; d.setDate(d.getDate()-w); return iso(d); };
const wedOf = s => { const d = parseISO(s); const diff = (d.getDay()-3+7)%7; d.setDate(d.getDate()-diff); return iso(d); };
// รอบรายสัปดาห์: นับพุธหลังปิดร้าน → รอบ = พฤหัส ถึง พุธ (วันนับ)
const wedEnd = s => { const d = parseISO(s); const diff = (3-d.getDay()+7)%7; d.setDate(d.getDate()+diff); return iso(d); };
const weekDatesOf = s => { const w = wedEnd(s); return [-6,-5,-4,-3,-2,-1,0].map(i=>addDays(w,i)); };
const thDate = s => { const d = parseISO(s); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + String(d.getFullYear()+543).slice(2); };
const thShort = s => { const d = parseISO(s); return d.getDate() + ' ' + MON[d.getMonth()]; };
const weekNo = s => { const d = parseISO(wedEnd(s)); const jan1 = new Date(d.getFullYear(),0,1); return Math.floor((d - jan1)/604800000) + 1; };
// เครื่องคิดเลข: + − × ตามลำดับ × ก่อน แล้วค่อย + −
function calc(expr){
  const t = String(expr||'').replace(/[+−×]$/,'').replace(/\.$/,'');
  if(!t) return 0;
  const parts = t.split(/([+−])/);
  let total = 0, sign = 1;
  parts.forEach(p=>{
    if(p === '+'){ sign = 1; return; }
    if(p === '−'){ sign = -1; return; }
    const prod = p.split('×').reduce((a,b)=>a * (parseFloat(b)||0), 1);
    total += sign * prod;
  });
  const r = Math.round(total * 100) / 100;
  return Math.max(0, Math.min(9999999, isFinite(r) ? r : 0));
}
function appendTok(buf, t){
  buf = String(buf||'');
  if(buf.length > 17) return buf;
  if(/[+−×]/.test(t)){
    if(!buf) return t === '−' ? '−' : buf;
    return /[+−×]$/.test(buf) ? buf.slice(0,-1) + t : buf + t;
  }
  if(t === '.'){
    const last = buf.split(/[+−×]/).pop();
    if(last.includes('.')) return buf;
    return buf + (last ? '.' : '0.');
  }
  return buf + t;
}
const EMPTY = {carry:{}, big:{}, small:{}, recv:{}, recvBig:{}, recvSmall:{}, out:{}, outBig:{}, outSmall:{}, touched:{}, carryNote:{}};

class Component extends DCLogic {
  state = {
    tab:'count', period:'day', branch:'FPR', branchOpen:false,
    date: iso(new Date()), calOpen:false, calMonth: iso(new Date()),
    rounds:{}, salesByDate:{}, drive:true, pad:null, padBuf:'', editAt:0, draftMsg:'', draftOk:true, anaView:'card',
    peers:null, peerAt:0, peerMsg:'', peerOk:true, peerLoading:false, peerItem:'', gradeMap:{},
    auth:null, loginU:'', loginP:'', loginErr:'',
    branchList: BRANCH_SEED, nbCode:'', nbName:'', nbOwner:'', nbPass:'', adminMsg:'',
    adminList:[], adminsMsg:'', naU:'', naP:'', naName:'', naLevel:'view',
    pw1:'', pw2:'', pwMsg:'', pwOk:false, passMap:{},
    syncUrl:'https://script.google.com/macros/s/AKfycbzGHTwaFEIT17W9JpVQzpvMSIL1RpUyH96kJdAZumLV_M4xDWew2eHlOxzon0Wxw9eA/exec', syncSecret:'', syncing:false, syncMsg:'', syncOk:false, lastSyncAt:{}
  };

  loadPassMap(){
    try{ return JSON.parse(localStorage.getItem('stockmove.pw') || '{}') || {}; }catch(e){ return {}; }
  }
  savePassMap(map){
    localStorage.setItem('stockmove.pw', JSON.stringify(map));
  }
  checkUpdate(onOpen){
    if(!/^https?:/.test(location.protocol)) return;
    fetch('version.json?t=' + Date.now(), {cache:'no-store'}).then(r=>r.ok ? r.json() : null).then(j=>{
      if(!j || !j.v || j.v === this.APP_VERSION) return;
      let tried = ''; try{ tried = sessionStorage.getItem('stockmove.upd') || ''; }catch(e){}
      if(onOpen && tried !== j.v && !this.state.pad){ try{ sessionStorage.setItem('stockmove.upd', j.v); }catch(e){} this.doUpdate(j.v); return; }
      this.setState({updateV: j.v});
    }).catch(()=>{});
  }
  doUpdate(v){ location.replace(location.pathname + '?v=' + encodeURIComponent(v || Date.now())); }
  componentDidMount(){
    this.APP_VERSION = '2026-11-20.3';
    try{
      const H=document.head, add=(tag,a)=>{ if(H.querySelector(tag+'[rel="'+a.rel+'"],'+tag+'[name="'+a.name+'"]')) return; const e=document.createElement(tag); Object.keys(a).forEach(k=>a[k]!=null&&e.setAttribute(k,a[k])); H.appendChild(e); };
      const base='ic'+'on-';
      add('link',{rel:'apple-touch-icon',href:base+'180.png'});
      add('link',{rel:'icon',href:base+'192.png',type:'image/png'});
      add('link',{rel:'manifest',href:'manifest'+'.json'});
      add('meta',{name:'apple-mobile-web-app-title',content:'สต็อก'});
      add('meta',{name:'apple-mobile-web-app-capable',content:'yes'});
      add('meta',{name:'theme-color',content:'#0e7c66'});
    }catch(e){}
    setTimeout(()=>this.checkUpdate(true), 1200);
    this._updTimer = setInterval(()=>this.checkUpdate(false), 5*60*1000);
    document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState === 'visible') this.checkUpdate(false); });
    try{ this.setState({passMap: this.loadPassMap(), photos: this.loadPhotos()}); }catch(e){}
    setTimeout(()=>{ this.refreshPassMap().catch(()=>{}); }, 400);
    try{
      const raw = localStorage.getItem('stockmove.v5');
      if(raw){
        const st = JSON.parse(raw);
        // นับรายวันอย่างเดียว (รอบรายสัปดาห์เก่ายังดูย้อนหลังได้)
        st.period = 'day'; st.wkDay = null;
        if(st.tab === 'sync' && !(st.auth && st.auth.role === 'admin')) st.tab = 'count';
        this.setState(st);
      }
    }catch(e){}
    // เข้ามาใหม่ที่เครื่องไหนก็ดึงงานค้างของรหัสนั้นมาทำต่อ
    setTimeout(()=>{
      const c = this.draftBranch();
      if(c){ this.restoreDraft(c); this.pullBranch(); }
    }, 900);
    setTimeout(()=>this.pullMoves(), 1600);
    this._moveIv = setInterval(()=>{ if(document.visibilityState === 'visible') this.pullMoves(); }, 90000);
    this._onVis = ()=>{ if(document.visibilityState === 'visible') this.pullMoves(); };
    document.addEventListener('visibilitychange', this._onVis);
  }
  componentWillUnmount(){
    clearInterval(this._moveIv);
    document.removeEventListener('visibilitychange', this._onVis);
  }
  loadLib(url, g){
    if(window[g]) return Promise.resolve(window[g]);
    return new Promise((ok, bad)=>{
      const el = document.createElement('scr'+'ipt'); el.src = url; el.async = true;
      el.onload = ()=> window[g] ? ok(window[g]) : bad(new Error('lib'));
      el.onerror = ()=> bad(new Error('โหลดไม่สำเร็จ'));
      document.head.appendChild(el);
    });
  }
  pdfToast(msg){
    let t = document.getElementById('pdftoast');
    if(!msg){ if(t) t.remove(); return; }
    if(!t){ t = document.createElement('div'); t.id = 'pdftoast';
      t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:999;background:#33261A;color:#fff;padding:12px 18px;border-radius:14px;font:600 13.5px "IBM Plex Sans Thai",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)';
      document.body.appendChild(t); }
    t.textContent = msg;
  }
  async printReportPDF(){
    if(this._pdfBusy) return;
    const ua = navigator.userAgent || '';
    const src = document.getElementById('reportprint');
    if(!src) return;
    this._pdfBusy = true;
    this.pdfToast('กำลังสร้าง PDF…');
    let box;
    try{
      const [h2c] = await Promise.all([
        this.loadLib('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','html2canvas'),
        this.loadLib('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','jspdf')
      ]);
      const clone = src.cloneNode(true);
      clone.querySelectorAll('.noprint').forEach(n=>n.remove());
      clone.removeAttribute('id');
      clone.style.cssText = 'position:static;padding:24px;background:#fff;width:1123px;box-sizing:border-box;overflow:visible';
      box = document.createElement('div');
      box.style.cssText = 'position:fixed;left:-20000px;top:0;width:1123px;background:#fff;z-index:-1';
      box.appendChild(clone); document.body.appendChild(box);
      if(document.fonts && document.fonts.ready) await document.fonts.ready;
      const canvas = await h2c(clone, {scale:2, backgroundColor:'#fff', useCORS:true, windowWidth:1123});
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({orientation:'landscape', unit:'mm', format:'a4'});
      const pw = 297, ph = 210, m = 8, iw = pw - m*2, ih = ph - m*2;
      const pxPerMm = canvas.width / iw, sliceH = Math.floor(ih * pxPerMm);
      for(let y = 0, p = 0; y < canvas.height; y += sliceH, p++){
        const h = Math.min(sliceH, canvas.height - y);
        const c = document.createElement('canvas'); c.width = canvas.width; c.height = h;
        const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,c.width,h);
        ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
        if(p) pdf.addPage();
        pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', m, m, iw, h / pxPerMm);
      }
      const base = (this._pdfName || 'รายงาน').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim();
      const name = base + '.pdf';
      const blob = pdf.output('blob');
      const file = (typeof File !== 'undefined') ? new File([blob], name, {type:'application/pdf'}) : null;
      const mobile = /iPhone|iPad|iPod|Android/i.test(ua);
      let done = false;
      if(mobile && file && navigator.canShare && navigator.canShare({files:[file]})){
        try{ await navigator.share({files:[file], title:name}); done = true; }
        catch(e){ if(e && e.name === 'AbortError') done = true; }
      }
      if(!done){
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = name;
        document.body.appendChild(link); link.click(); link.remove();
        if(/iPhone|iPad|iPod/i.test(ua)) setTimeout(()=>{ try{ window.location.href = url; }catch(_){} }, 400);
        setTimeout(()=>URL.revokeObjectURL(url), 120000);
      }
      this.pdfToast('บันทึก PDF แล้ว');
      setTimeout(()=>this.pdfToast(null), 2200);
    }catch(e){
      this.pdfToast(null);
      alert('สร้าง PDF ไม่สำเร็จ: ' + (e && e.message || e) + '\nตรวจสอบอินเทอร์เน็ต แล้วลองใหม่');
    }finally{
      if(box) box.remove();
      this._pdfBusy = false;
    }
  }
  // หน่วยที่ใช้ในรายงาน/วิเคราะห์
  repUnit(it){
    if(it.pdfUnit) return {div: it.pdfDiv || 1, unit: it.pdfUnit, dec: 3};
    if(/กรัม|กร\.|^g$/i.test(it.smallUnit||'')) return {div: 1000, unit: 'Kg.', dec: 3};
    return {div: 1, unit: it.smallUnit || 'หน่วย', dec: 0};
  }
  fmtRep(it, v){
    const u = this.repUnit(it);
    return (Number(v||0)/u.div).toLocaleString('en-US',{minimumFractionDigits:u.dec, maximumFractionDigits:u.dec}) + ' ' + u.unit;
  }
  persist(patch){
    const touch = !!patch && (patch.rounds !== undefined || patch.salesByDate !== undefined);
    this.setState(touch ? {...patch, editAt: Date.now()} : patch, ()=>{
      const {tab,period,branch,date,rounds,salesByDate,drive,auth,branchList,syncUrl,syncSecret,lastSyncAt,editAt,anaView,peerItem,gradeMap,remote} = this.state;
      try{ localStorage.setItem('stockmove.v5', JSON.stringify({tab,period,branch,date,rounds,salesByDate,drive,auth,branchList,syncUrl,syncSecret,lastSyncAt,editAt,anaView,peerItem,gradeMap,remote})); }catch(e){}
      if(touch) this.queueDraft();
    });
  }
  // งานค้าง (draft) เก็บกลางบน Sheet เพื่อทำต่อจากเครื่องอื่นได้
  draftBranch(){
    const a = this.state.auth;
    return a && a.role !== 'admin' ? a.branch : '';
  }
  queueDraft(){
    const code = this.draftBranch();
    if(!code) return;
    clearTimeout(this._draftT);
    this._draftT = setTimeout(()=>{
      const s = this.state;
      const at = Number(s.editAt || Date.now());
      const body = {rounds:s.rounds||{}, salesByDate:s.salesByDate||{}, period:s.period, date:s.date, at};
      this.setState({draftMsg:'กำลังเก็บงานค้างขึ้นระบบ…', draftOk:true});
      this.passApi({action:'savedraft', branch:code, at, json:JSON.stringify(body)})
        .then(()=>this.setState({draftOk:true, draftMsg:'เก็บงานค้างไว้บนระบบแล้ว ' + new Date(at).toLocaleTimeString('th-TH') + ' · เข้ารหัส ' + code + ' ที่เครื่องไหนก็ทำต่อได้'}))
        .catch(()=>this.setState({draftOk:false, draftMsg:'เก็บงานค้างขึ้นระบบไม่สำเร็จ · ข้อมูลยังอยู่ในเครื่องนี้ จะลองใหม่เมื่อแก้ไขครั้งถัดไป'}));
    }, 1600);
  }
  restoreDraft(code){
    if(!code) return;
    this.setState({draftOk:true, draftMsg:'กำลังตรวจงานที่ค้างไว้บนระบบ…'});
    this.passApi({action:'getdraft', branch:code})
      .then(d=>{
        let dr = null;
        try{ dr = d && d.json ? JSON.parse(d.json) : null; }catch(e){}
        if(!dr || !dr.rounds){ this.setState({draftMsg:''}); return; }
        const localAt = Number(this.state.editAt||0);
        if(Number(dr.at||0) <= localAt){
          this.setState({draftOk:true, draftMsg:'เครื่องนี้มีข้อมูลใหม่กว่าบนระบบ ทำต่อได้เลย'});
          this.queueDraft();
          return;
        }
        this.persist({
          rounds: {...(this.state.rounds||{}), ...dr.rounds},
          salesByDate: {...(this.state.salesByDate||{}), ...(dr.salesByDate||{})},
          period: dr.period || this.state.period,
          date: dr.date || this.state.date,
          editAt: Number(dr.at||0),
          draftOk: true,
          draftMsg: 'ดึงงานที่ค้างไว้จากเครื่องก่อนหน้ามาแล้ว (' + new Date(Number(dr.at)).toLocaleString('th-TH') + ') ทำต่อได้เลย'
        });
      })
      .catch(err=>this.setState({draftOk:false, draftMsg:'ดึงงานค้างไม่สำเร็จ: ' + String(err.message||err).slice(0,80) + ' · ถ้าขึ้นว่า “ข้อมูลไม่ครบ” คือ Apps Script ยังเป็นเวอร์ชันเก่า ให้วางไฟล์ .gs ใหม่แล้ว Deploy ใหม่'}));
  }
  countDate(){ const s = this.state; return s.period === 'week' ? wedEnd(s.date) : s.date; }
  // วันที่กำลังบันทึกรับเข้า/โอนออกในโหมดรายสัปดาห์ (พฤ–พ ของรอบ)
  wkDay(){ const s = this.state, wk = weekDatesOf(this.countDate()); if(s.wkDay && wk.indexOf(s.wkDay) >= 0) return s.wkDay; const t = iso(new Date()); return wk.indexOf(t) >= 0 ? t : wk[6]; }
  isWeekRound(d){ const r = this.state.rounds[d]; return !!(r && r.week) || (this.state.period === 'week' && d === this.countDate()); }
  carryInfo(it, d){ return this.autoCarryInfo(it, this.isWeekRound(d) ? addDays(d,-6) : d); }
  // รอบรายสัปดาห์: รวมรับเข้า/โอนออกตั้งแต่วันถัดจากนับครั้งก่อน ถึงวันพุธที่นับ
  spanDays(it, d){
    if(!this.isWeekRound(d)) return [d];
    let start = addDays(d,-6);
    if(this.round(d).carry[it.code] === undefined){ const ci = this.carryInfo(it, d); if(ci) start = addDays(ci.date, 1); }
    const out = []; for(let x = start; x <= d && out.length < 120; x = addDays(x,1)) out.push(x);
    return out;
  }
  round(d){ return this.state.rounds[d || this.countDate()] || EMPTY; }
  setRound(patchFn, day){
    const d = day || this.countDate();
    const cur = this.round(d);
    const next = patchFn({week: cur.week || (this.state.period === 'week' && d === this.countDate()) || undefined, carry:{...cur.carry}, big:{...cur.big}, small:{...cur.small}, recv:{...(cur.recv||{})}, recvBig:{...(cur.recvBig||{})}, recvSmall:{...(cur.recvSmall||{})}, out:{...(cur.out||{})}, outBig:{...(cur.outBig||{})}, outSmall:{...(cur.outSmall||{})}, touched:{...cur.touched}, carryNote:{...(cur.carryNote||{})}});
    this.persist({rounds:{...this.state.rounds, [d]: next}});
    if(this.state.period === 'week') this.queueMoves(d);
  }
  // รับเข้า/โอนออกรายวันเก็บกลางบน Sheet (แท็บ รับโอนรายวัน) ให้ทุกเครื่องรวมยอดได้
  movesBranch(){ const s = this.state; return (s.auth && s.auth.role !== 'admin') ? s.auth.branch : s.branch; }
  queueMoves(d){
    const code = this.movesBranch();
    if(!code || !(this.state.syncUrl||'').trim()) return;
    this._movePend = this._movePend || {};
    this._movePend[d] = true;
    clearTimeout(this._moveT);
    this._moveT = setTimeout(()=>{
      const days = Object.keys(this._movePend); this._movePend = {};
      this.setState({movesMsg:'กำลังส่งรับเข้า/โอนออกขึ้นระบบ…', movesOk:true});
      Promise.all(days.map(day=>{
        const r = this.round(day), items = {};
        ITEMS.forEach(it=>{
          const c = it.code, has = [r.recvBig,r.recvSmall,r.outBig,r.outSmall,r.recv,r.out].some(o=>o && o[c] !== undefined);
          if(!has) return;
          items[c] = {name:it.name, unit:it.smallUnit, rb:(r.recvBig&&r.recvBig[c])||0, rs:((r.recvSmall&&r.recvSmall[c])||0) + ((r.recv&&r.recv[c])||0), recv:this.dayRecv(it,day), ob:(r.outBig&&r.outBig[c])||0, os:((r.outSmall&&r.outSmall[c])||0) + ((r.out&&r.out[c])||0), out:this.dayOut(it,day)};
        });
        if(!Object.keys(items).length) return null;
        return this.passApi({action:'setmoves', branch:code, date:day, items});
      }))
        .then(()=>this.setState({movesOk:true, lastSync: new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}), movesMsg:'ส่งขึ้นระบบแล้ว ' + new Date().toLocaleTimeString('th-TH') + ' · เครื่องอื่นเห็นยอดเดียวกัน'}))
        .catch(()=>{ days.forEach(x=>this._movePend[x]=true); this.setState({movesOk:false, movesMsg:'ส่งขึ้นระบบไม่สำเร็จ · จะลองใหม่เมื่อแก้ครั้งถัดไปหรือกดดึงยอด'}); });
    }, 1200);
  }
  pullMoves(manual){
    const code = this.movesBranch();
    if(!code || !(this.state.syncUrl||'').trim() || this.state.period !== 'week') return;
    const wk = weekDatesOf(this.countDate());
    const from = addDays(wk[0], -35), to = wk[6];
    if(manual) this.setState({movesMsg:'กำลังดึงรับเข้า/โอนออกจากทุกเครื่อง…', movesOk:true});
    if(this._movePend && Object.keys(this._movePend).length) this.queueMoves(Object.keys(this._movePend)[0]);
    this.passApi({action:'moves', branch:code, from, to})
      .then(res=>{
        const mv = res.moves || {}, pend = this._movePend || {};
        const rounds = {...this.state.rounds};
        let n = 0;
        Object.keys(mv).forEach(day=>{
          if(pend[day]) return;
          const cur = rounds[day] || EMPTY;
          const r = {...cur, recv:{...(cur.recv||{})}, out:{...(cur.out||{})}, recvBig:{...(cur.recvBig||{})}, recvSmall:{...(cur.recvSmall||{})}, outBig:{...(cur.outBig||{})}, outSmall:{...(cur.outSmall||{})}, carry:{...(cur.carry||{})}, big:{...(cur.big||{})}, small:{...(cur.small||{})}, touched:{...(cur.touched||{})}};
          Object.keys(mv[day]).forEach(c=>{
            const m = mv[day][c];
            r.recvBig[c] = m.rb; r.recvSmall[c] = m.rs; r.outBig[c] = m.ob; r.outSmall[c] = m.os;
            delete r.recv[c]; delete r.out[c]; n++;
          });
          rounds[day] = r;
        });
        this.setState({rounds, movesOk:true, lastSync: new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}), movesMsg: 'รวมยอดจากทุกเครื่องแล้ว ' + new Date().toLocaleTimeString('th-TH') + (n ? '' : ' · ยังไม่มีรายการในระบบ')}, ()=>this.persist({}));
      })
      .catch(err=>{ if(manual) this.setState({movesOk:false, movesMsg:'ดึงยอดไม่สำเร็จ: ' + String(err.message||err).slice(0,60)}); });
  }
  th(){ const v = Number(this.props.threshold ?? 10); return isFinite(v)? v : 10; }

  loadAdmins(){
    this.setState({adminsMsg:'กำลังโหลดรายชื่อแอดมิน…'});
    this.passApi({action:'admins'})
      .then(r=>this.setState({adminList:r.admins||[], adminsMsg:''}))
      .catch(err=>this.setState({adminsMsg:'โหลดรายชื่อแอดมินไม่สำเร็จ: ' + String(err.message||err).slice(0,60)}));
  }
  saveAdmin(payload, okMsg){
    this.setState({adminsMsg:'กำลังบันทึกขึ้นระบบ…'});
    this.passApi({action:'setadmin', ...payload})
      .then(r=>this.setState({adminList:r.admins||[], adminsMsg:okMsg}))
      .catch(err=>this.setState({adminsMsg:'บันทึกไม่สำเร็จ: ' + String(err.message||err).slice(0,60)}));
  }
  removeAdmin(u){
    if(!window.confirm('ยกเลิกสิทธิ์แอดมินของ ' + u + '?')) return;
    this.setState({adminsMsg:'กำลังยกเลิกสิทธิ์…'});
    this.passApi({action:'deladmin', u})
      .then(r=>this.setState({adminList:r.admins||[], adminsMsg:'ยกเลิกสิทธิ์ ' + u + ' แล้ว'}))
      .catch(err=>this.setState({adminsMsg:'ยกเลิกไม่สำเร็จ: ' + String(err.message||err).slice(0,60)}));
  }
  addAdminNow(){
    const u = (this.state.naU||'').trim().toLowerCase();
    const p = (this.state.naP||'').trim();
    if(!u){ this.setState({adminsMsg:'ใส่ชื่อผู้ใช้ก่อน'}); return; }
    if(p.length < 6){ this.setState({adminsMsg:'รหัสผ่านต้องยาวอย่างน้อย 6 ตัว'}); return; }
    this.setState({naU:'', naP:'', naName:''});
    this.saveAdmin({u, p, name:(this.state.naName||'').trim(), level:this.state.naLevel||'view'},
      'เพิ่มแอดมิน ' + u + ' แล้ว');
  }
  promoteBranch(code, level){
    const u = code.toLowerCase();
    const pass = String((this.state.passMap||{})[code] ?? STAFF_PASS).trim();
    const br = this.state.branchList.find(b=>b.code===code);
    this.saveAdmin({u, p:pass, name:(br && br.name) || ('สาขา ' + code), level},
      'ตั้ง ' + u + ' เป็นแอดมิน (' + (level==='full'?'สูงสุด':'ดูข้อมูล') + ') แล้ว');
  }
  async doLogin(){
    const u = (this.state.loginU||'').trim().toLowerCase();
    const p = (this.state.loginP||'').trim();
    // แอดมินตรวจกับชีต "แอดมิน" บน Google Sheet เท่านั้น (ไม่เก็บรหัสไว้ในโค้ดหน้าเว็บ)
    // แอดมินที่เพิ่มไว้ในชีต "แอดมิน" ของ Google Sheet — ตรวจก่อนรหัสสาขา กันชื่อซ้ำกับรหัสสาขา
    if(u && p){
      try{
        const r = await this.passApi({action:'adminlogin', u, p});
        if(r && r.admin){
          this.persist({auth:{u:r.admin.u, role:'admin', level:(r.admin.level==='full'?'full':'view'), name:r.admin.name||'', branch:this.state.branch}, loginU:'', loginP:'', loginErr:'', tab:'count'});
          return;
        }
      }catch(e){}
    }
    let b = this.state.branchList.find(x=>x.code.toLowerCase() === u);
    const enter = (code)=>{
      this.persist({auth:{u:u, role:'staff', branch:code}, branch:code, loginU:'', loginP:'', loginErr:'', tab:'count'});
      setTimeout(()=>this.restoreDraft(code), 200);
    };
    if(b && p === String(this.effectivePass(b.code)).trim()){ enter(b.code); return; }
    this.setState({loginErr:'กำลังตรวจสอบกับระบบ…'});
    try{
      const {map, branches} = await this.refreshPassMap();
      b = branches.find(x=>x.code.toLowerCase() === u) || b;
      if(b && p === String(map[b.code] ?? b.pass ?? STAFF_PASS).trim()){ enter(b.code); return; }
    }catch(e){
      this.setState({loginErr:'เชื่อมต่อระบบไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่'}); return;
    }
    if(!b){ this.setState({loginErr:'ไม่พบรหัสสาขานี้ในระบบ ติดต่อพี่'}); return; }
    this.setState({loginErr:'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง ติดต่อพี่หากลืมรหัส'});
  }
  setBranchPass(code, pass){
    const map = {...this.loadPassMap(), ...(this.state.passMap||{}), [code]: pass};
    try{ this.savePassMap(map); }
    catch(e){ this.setState({adminMsg:'บันทึกรหัสผ่านไม่สำเร็จ (พื้นที่เก็บข้อมูลเต็ม)'}); return; }
    this.setState({passMap: map, adminMsg:''});
    this.updateBranch(code, {pass});
    clearTimeout(this._pwPush);
    this._pwPush = setTimeout(()=>{
      if(String(pass||'').trim().length < 6){ this.setState({adminMsg:'รหัสสั้นเกิน 6 ตัว ยังไม่ได้ส่งขึ้นระบบ'}); return; }
      this.passApi({action:'setpass', branch:code, pass:String(pass).trim(), isAdmin:true})
        .then(()=>this.setState({adminMsg:'ตั้งรหัส ' + code + ' ขึ้นระบบแล้ว ใช้ได้ทุกเครื่อง'}))
        .catch(err=>this.setState({adminMsg:'ส่งรหัส ' + code + ' ขึ้นระบบไม่สำเร็จ: ' + String(err.message||err).slice(0,70)}));
    }, 900);
  }
  updateBranch(code, patch){
    const list = this.state.branchList.map(b=>b.code===code ? {...b, ...patch} : b);
    this.persist({branchList: list, adminMsg:''});
    if('name' in patch || 'owner' in patch){
      clearTimeout(this._dirPush);
      const b = list.find(x=>x.code===code);
      this._dirPush = setTimeout(()=>{ this.pushBranch({code:b.code, name:b.name, owner:b.owner}).catch(()=>{}); }, 900);
    }
  }
  syncBranchesNow(){
    this.setState({adminMsg:'กำลังซิงก์รายชื่อสาขา…'});
    const list = this.state.branchList;
    (async ()=>{
      // ดึงรหัสล่าสุดจากชีทก่อน แล้วส่งเฉพาะทะเบียนสาขา (ไม่ทับรหัสผ่านที่สาขาเปลี่ยนเอง)
      const {map} = await this.refreshPassMap();
      for(const b of list){
        const fresh = map[b.code] === undefined ? (this.effectivePass(b.code) || STAFF_PASS) : '';
        await this.pushBranch({code:b.code, name:b.name, owner:b.owner, pass:fresh});
      }
      this.setState({adminMsg:'ซิงก์สาขาทั้งหมด ' + list.length + ' สาขาขึ้นระบบแล้ว'});
    })().catch(err=>this.setState({adminMsg:'ซิงก์ไม่สำเร็จ: ' + String(err.message||err).slice(0,70)}));
  }
  loadPhotos(){
    try{ return JSON.parse(localStorage.getItem('stockmove.photos') || '{}'); }catch(e){ return {}; }
  }
  photoOf(code){
    const p = (this.state.photos || {})[code];
    if(p) return p;
    const b = (this.state.branchList||[]).find(x=>x.code===code);
    return (b && b.photo) || '';
  }
  onPhotoFile(code, e){
    const f = e.target.files && e.target.files[0];
    const msgKey = (this.state.auth && this.state.auth.role === 'admin') ? 'adminMsg' : 'pwMsg';
    if(!f) return;
    if(!/^image\//.test(f.type)){ this.setState({[msgKey]:'ไฟล์นี้ไม่ใช่รูปภาพ'}); return; }
    e.target.value = '';
    const fr = new FileReader();
    fr.onerror = ()=>this.setState({[msgKey]:'อ่านไฟล์รูปไม่สำเร็จ ลองเลือกรูปอื่น'});
    fr.onload = ()=>{
      const img = new Image();
      img.onerror = ()=>this.setState({[msgKey]:'ไฟล์รูปเสียหรือไม่รองรับ (ลองใช้ JPG/PNG)'});
      img.onload = ()=>{
        const S = 96, c = document.createElement('canvas');
        c.width = S; c.height = S;
        const ctx = c.getContext('2d');
        const m = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width-m)/2, (img.height-m)/2, m, m, 0, 0, S, S);
        const data = c.toDataURL('image/jpeg', 0.6);
        const save = (map, msg)=>{
          try{ localStorage.setItem('stockmove.photos', JSON.stringify(map)); }catch(e){}
          this.setState({photos: map, [msgKey]: msg});
        };
        // แสดงทันทีจากเครื่อง แล้วอัปโหลดขึ้น Drive ให้เครื่องอื่นเห็นด้วย
        save({...this.loadPhotos(), ...(this.state.photos||{}), [code]: data}, 'กำลังอัปโหลดรูปขึ้น Drive…');
        this.passApi({action:'setphoto', code, data})
          .then(res=>{
            save({...this.loadPhotos(), ...(this.state.photos||{}), [code]: res.url || data}, 'บันทึกรูปโปรไฟล์แล้ว ใช้ได้ทุกเครื่อง');
            this.persist({branchList: this.state.branchList.map(b=>b.code===code ? {...b, photo:''} : b)});
          })
          .catch(err=>save({...this.loadPhotos(), ...(this.state.photos||{}), [code]: data},
            'อัปโหลดขึ้น Drive ไม่สำเร็จ: ' + String(err.message||err).slice(0,55) + ' · รูปเก็บในเครื่องนี้ไว้ก่อน'));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(f);
  }
  addBranchNow(){
    const code = (this.state.nbCode||'').trim().toUpperCase();
    const name = (this.state.nbName||'').trim();
    const pass = (this.state.nbPass||'').trim();
    if(pass && pass.length < 6){ this.setState({adminMsg:'รหัสผ่านต้องยาวอย่างน้อย 6 ตัว'}); return; }
    if(!code){ this.setState({adminMsg:'ใส่รหัสสาขาก่อน'}); return; }
    if(this.state.branchList.some(b=>b.code===code)){ this.setState({adminMsg:'รหัสสาขานี้มีอยู่แล้ว'}); return; }
    const map = {...this.loadPassMap(), ...(this.state.passMap||{}), [code]: pass || STAFF_PASS};
    try{ this.savePassMap(map); }catch(e){}
    this.setState({passMap: map});
    const nb = {code, name: name || ('สาขา '+code), owner:(this.state.nbOwner||'').trim(), photo:'', pass: pass || STAFF_PASS};
    this.persist({
      branchList: [...this.state.branchList, nb],
      nbCode:'', nbName:'', nbOwner:'', nbPass:'', adminMsg:'กำลังส่งสาขา ' + code + ' ขึ้นระบบ…'
    });
    this.pushBranch(nb)
      .then(()=>this.setState({adminMsg:'สร้างสาขา ' + code + ' แล้ว ใช้ได้ทุกเครื่อง · login: ' + code.toLowerCase() + ' / รหัส: ' + nb.pass}))
      .catch(err=>this.setState({adminMsg:'⚠ สาขา ' + code + ' ยังไม่ขึ้นระบบ (' + String(err.message||err).slice(0,60) + ') เครื่องอื่นจะยังเข้าไม่ได้ — กดปุ่มซิงก์สาขาอีกครั้ง'}));
  }
  delBranch(code){
    if(this.state.branchList.length <= 1){ this.setState({adminMsg:'ต้องเหลืออย่างน้อย 1 สาขา'}); return; }
    if(!window.confirm('ลบสาขา ' + code + ' ออกจากระบบ?')) return;
    const list = this.state.branchList.filter(b=>b.code!==code);
    const patch = {branchList:list, adminMsg:''};
    if(this.state.branch === code) patch.branch = list[0].code;
    this.persist(patch);
    this.passApi({action:'delbranch', code}).catch(()=>{});
  }
  // รวมข้อมูลรอบนับที่ใช้วิเคราะห์/ดูย้อนหลัง · แอดมินใช้ข้อมูลที่ดึงจาก Sheet ของสาขาที่เลือก
  srcRounds(){
    const s = this.state;
    const isAdmin = !!s.auth && s.auth.role === 'admin';
    const code = isAdmin ? s.branch : ((s.auth && s.auth.branch) || s.branch);
    const rm = (s.remote||{})[code];
    const rounds = {};
    if(rm) Object.keys(rm).forEach(d=>{ rounds[d] = rm[d]; });
    const hasRemote = !!(rm && Object.keys(rm).length);
    if(isAdmin) return {from: hasRemote ? 'sheet' : 'device', rounds};
    Object.keys(s.rounds||{}).forEach(d=>{
      const r = s.rounds[d];
      if(!r || !r.touched) return;
      const items = {};
      ITEMS.forEach(it=>{
        if(r.touched[it.code]) items[it.code] = {carry:this.carryOf(it,d), recv:this.recvOf(it,d), out:this.outOf(it,d), left:this.leftOf(it,d), used:this.usedOf(it,d)};
      });
      if(!Object.keys(items).length) return;
      const wkSales = (s.salesByDate||{})['W'+d];
      const localSales = Number(wkSales || (s.salesByDate||{})[d] || 0);
      const prev = rounds[d];
      rounds[d] = {
        date: d,
        sales: localSales || (prev ? Number(prev.sales||0) : 0),
        label: wkSales ? 'รอบพุธ' : (prev && prev.label ? prev.label : 'รอบวัน'),
        items: Object.assign({}, prev ? prev.items : null, items)
      };
    });
    return {from: hasRemote ? 'both' : 'device', rounds};
  }
  pullBranch(){
    const s0 = this.state;
    const code = (s0.auth && s0.auth.role !== 'admin') ? s0.auth.branch : s0.branch;
    this.setState({pulling:true, pullMsg:'กำลังดึงข้อมูลสาขา ' + code + ' จาก Sheet…'});
    this.passApi({action:'rounds', branch:code, limit:40})
      .then(d=>{
        const rounds = d.rounds || {};
        const n = Object.keys(rounds).length;
        this.persist({pulling:false, remote:{...(this.state.remote||{}), [code]: rounds},
          pullMsg: n ? ('ดึงข้อมูลสาขา ' + code + ' แล้ว ' + n + ' รอบ') : ('สาขา ' + code + ' ยังไม่มีข้อมูลบน Sheet')});
      })
      .catch(err=>this.setState({pulling:false, pullMsg:'ดึงไม่สำเร็จ: ' + String(err.message||err).slice(0,80)}));
  }
  syncPayload(){
    const s = this.state;
    const isWeek = s.period === 'week';
    const d = this.countDate();
    const wk = weekDatesOf(d);
    const branch = s.auth && s.auth.role !== 'admin' ? s.auth.branch : s.branch;
    const sales = isWeek ? (s.salesByDate['W'+wk[6]] || wk.reduce((a,x)=>a + (s.salesByDate[x]||0), 0)) : (s.salesByDate[d]||0);
    const r = this.round(d);
    return {
      secret: s.syncSecret || '',
      branch,
      roundKey: branch + '_' + (isWeek ? ('W_'+d) : ('D_'+d)),
      periodLabel: isWeek ? 'รายสัปดาห์ (นับพุธหลังปิดร้าน)' : 'รายวัน',
      date: d,
      rangeLabel: isWeek ? (wk[0] + ' ถึง ' + wk[6]) : d,
      sales,
      items: ITEMS.filter(it=>r.touched[it.code]).map(it=>{
        const carry = this.carryOf(it,d), recv = this.recvOf(it,d), out = this.outOf(it,d), left = this.leftOf(it,d);
        return {shelf:it.shelf, code:it.code, name:it.name, carry, recv, out, left, used: Math.max(0, carry+recv-out-left),
          carryAuto: this.carryIsAuto(it,d) ? 'อัตโนมัติ' : (()=>{
            const note = (r.carryNote||{})[it.code];
            if(!note) return 'ตั้งเอง';
            return 'ตั้งเอง · รอบก่อนเหลือ ' + note.prevLeft + ' · เหตุผล: ' + (note.reason||'-');
          })(),
          recvBig: (r.recvBig && r.recvBig[it.code]) || 0,
          recvSmall: (r.recvSmall && r.recvSmall[it.code]) || 0,
          outBig: (r.outBig && r.outBig[it.code]) || 0,
          outSmall: (r.outSmall && r.outSmall[it.code]) || 0,
          big: r.big[it.code]||0, small: r.small[it.code]||0,
          bigUnit: it.bigUnit, bigSize: it.bigSize, smallUnit: it.smallUnit, rate: it.rate};
      })
    };
  }
  async doSync(){
    const s = this.state;
    const url = (s.syncUrl||'').trim();
    if(!url){ this.setState({syncMsg:'ยังไม่ได้ใส่ลิงก์ Web App (ให้แอดมินใส่ในแท็บแอดมิน)', syncOk:false}); return; }
    const payload = this.syncPayload();
    if(!payload.items.length){ this.setState({syncMsg:'รอบนี้ยังไม่มีรายการที่นับแล้ว', syncOk:false}); return; }
    if(!(Number(payload.sales) > 0)){
      this.persist({tab:'sales', syncMsg:'ต้องกรอกยอดขายของรอบนี้ก่อน ถึงจะส่งข้อมูลขึ้น Sheet ได้', syncOk:false});
      return;
    }
    this.setState({syncing:true, syncMsg:'', syncOk:false});
    try{
      const res = await fetch(url, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(payload), redirect:'follow'});
      const txt = await res.text();
      let data = null; try{ data = JSON.parse(txt); }catch(e){}
      if(data && data.ok){
        this.persist({syncing:false, syncOk:true,
          syncMsg:'ส่งขึ้น Sheet แล้ว ' + data.rows + ' รายการ · ' + payload.branch + ' · ' + payload.roundKey,
          lastSyncAt:{...s.lastSyncAt, [payload.roundKey]: new Date().toISOString()}});
      } else {
        this.setState({syncing:false, syncOk:false, syncMsg:'ส่งไม่สำเร็จ: ' + ((data && data.error) || txt.slice(0,120) || 'ไม่ทราบสาเหตุ')});
      }
    }catch(err){
      this.setState({syncing:false, syncOk:false, syncMsg:'ต่อกับ Web App ไม่ได้ · ตรวจลิงก์และสิทธิ์ "ทุกคน" ตอน Deploy (' + String(err).slice(0,60) + ')'});
    }
  }
  async loadPeers(){
    if(this.state.peerLoading) return;
    this.setState({peerLoading:true, peerMsg:''});
    try{
      const data = await this.passApi({action:'peers', days:30});
      this.setState({peers:data.peers||{}, gradeMap:data.grades||{}, peerAt:Date.now(), peerLoading:false,
        peerOk:true, peerMsg:'อัปเดตแล้ว ' + Object.keys(data.peers||{}).filter(c=>!/admin|^hq$/i.test(c) && Number((data.peers[c]||{}).sales) > 0).length + ' สาขา'});
      if(Array.isArray(data.branches)) this.mergeRemoteBranches(data.branches);
    }catch(e){
      this.setState({peerLoading:false, peerOk:false, peerMsg:'ดึงข้อมูลไม่สำเร็จ · ' + String(e.message||e).slice(0,70)});
    }
  }
  async saveGrade(code, grade){
    const map = {...(this.state.gradeMap||{})};
    if(grade) map[code] = grade; else delete map[code];
    this.setState({gradeMap:map});
    try{ await this.passApi({action:'setgrade', code, grade}); }
    catch(e){ this.setState({peerOk:false, peerMsg:'บันทึกเกรดขึ้น Sheet ไม่สำเร็จ'}); }
  }
  async passApi(payload){
    const url = (this.state.syncUrl||'').trim();
    if(!url) throw new Error('ยังไม่ได้ตั้งลิงก์ Web App');
    const res = await fetch(url, {
      method:'POST', mode:'cors', redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({...payload, secret:this.state.syncSecret||''})
    });
    const data = JSON.parse(await res.text());
    if(!data || !data.ok) throw new Error((data && data.error) || 'ไม่สำเร็จ');
    return data;
  }
  mergeRemoteMap(remote){
    const map = {...this.loadPassMap(), ...(this.state.passMap||{}), ...(remote||{})};
    try{ this.savePassMap(map); }catch(e){}
    this.setState({passMap: map});
    return map;
  }
  mergeRemoteBranches(remote){
    if(!Array.isArray(remote) || !remote.length) return this.state.branchList;
    const local = this.state.branchList || [];
    const byCode = {};
    local.forEach(b=>{ byCode[b.code] = b; });
    const list = remote.map(r=>{
      const ex = byCode[r.code] || {};
      delete byCode[r.code];
      return {...ex, code:r.code, name:r.name || ex.name || ('สาขา '+r.code), owner:r.owner || ex.owner || '', photo: ex.photo || ''};
    });
    // สาขาที่มีเฉพาะในเครื่องนี้ ยังเก็บไว้ (ยังไม่ได้ซิงก์ขึ้นชีท)
    Object.keys(byCode).forEach(c=>list.push(byCode[c]));
    this.persist({branchList:list});
    return list;
  }
  async refreshPassMap(){
    const data = await this.passApi({action:'passmap'});
    if(data.photos && Object.keys(data.photos).length){
      const photos = {...this.loadPhotos(), ...(this.state.photos||{}), ...data.photos};
      try{ localStorage.setItem('stockmove.photos', JSON.stringify(photos)); }catch(e){}
      this.setState({photos});
    }
    const branches = this.mergeRemoteBranches(data.branches);
    return {map: this.mergeRemoteMap(data.map), branches};
  }
  pushBranch(b){
    return this.passApi({action:'setbranch', code:b.code, name:b.name||'', owner:b.owner||'', pass:b.pass||''});
  }
  effectivePass(code){
    const b = this.state.branchList.find(x=>x.code===code) || {};
    const pm = {...this.loadPassMap(), ...(this.state.passMap||{})};
    return pm[code] ?? b.pass ?? STAFF_PASS;
  }
  async saveMyPass(){
    const {pw1, pw2} = this.state;
    const code = this.state.auth ? this.state.auth.branch : this.state.branch;
    if((pw1||'').trim().length < 6){ this.setState({pwMsg:'รหัสผ่านต้องยาวอย่างน้อย 6 ตัว', pwOk:false}); return; }
    if(pw1 !== pw2){ this.setState({pwMsg:'รหัสผ่านสองช่องไม่ตรงกัน', pwOk:false}); return; }
    const np = pw1.trim();
    const oldPass = this.effectivePass(code);
    const isAdmin = !!this.state.auth && this.state.auth.role === 'admin';
    this.setState({pwMsg:'กำลังบันทึกขึ้นระบบ…', pwOk:true});
    try{
      await this.passApi({action:'setpass', branch:code, pass:np, oldPass, isAdmin});
    }catch(err){
      this.setState({pwMsg:'บันทึกขึ้นระบบไม่สำเร็จ: ' + String(err.message||err).slice(0,80) + ' · รหัสเดิมยังใช้ได้', pwOk:false});
      return;
    }
    const map = {...this.loadPassMap(), ...(this.state.passMap||{}), [code]: np};
    try{ this.savePassMap(map); }catch(e){}
    this.setState({passMap: map});
    this.persist({branchList: this.state.branchList.map(b=>b.code===code ? {...b, pass:np} : b), pw1:'', pw2:'', pwMsg:'เปลี่ยนรหัสผ่านเรียบร้อย ใช้ได้ทุกเครื่อง', pwOk:true});
  }
  // ยอดคงเหลือของรอบก่อนหน้า = ยอดยกมาของรอบนี้เสมอ
  // หา "รอบก่อนหน้าที่ใกล้ที่สุด" ของสินค้าตัวนี้ จากทั้งเครื่องนี้และ Sheet
  autoCarryInfo(it, d){
    const s = this.state;
    const rounds = s.rounds || {};
    const code = (s.auth && s.auth.role !== 'admin') ? s.auth.branch : s.branch;
    const rm = (s.remote || {})[code] || {};
    const dates = Object.keys(rounds).concat(Object.keys(rm))
      .filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k))
      .filter((k,i,a)=>a.indexOf(k)===i && k < d)
      .sort();
    for(let i=dates.length-1;i>=0;i--){
      const k = dates[i], rr = rounds[k], rem = rm[k];
      const hasLocal = !!(rr && rr.touched && rr.touched[it.code]);
      const hasRemote = !!(rem && rem.items && rem.items[it.code]);
      if(!hasLocal && !hasRemote) continue;
      // วันเดียวกันมีทั้งสองแหล่ง → ใช้ของเครื่องนี้ (ที่นับล่าสุด)
      const val = hasLocal
        ? (rr.big&&rr.big[it.code]||0)*it.bigSize + (rr.small&&rr.small[it.code]||0)
        : Number(rem.items[it.code].left||0);
      return {val, date:k, src: hasLocal ? 'device' : 'sheet'};
    }
    return null;
  }
  autoCarry(it, d){
    const info = this.carryInfo(it, d);
    return info === null ? null : info.val;
  }
  carryOf(it, d){
    d = d || this.countDate();
    const r = this.round(d), c = r.carry[it.code];
    if(c !== undefined) return c;
    const auto = this.autoCarry(it, d);
    return auto === null ? it.sys : auto;
  }
  carryIsAuto(it, d){
    d = d || this.countDate();
    return this.round(d).carry[it.code] === undefined && this.autoCarry(it, d) !== null;
  }
  dayRecv(it, d){
    const r = this.round(d);
    return ((r.recvBig && r.recvBig[it.code]) || 0) * it.bigSize
         + ((r.recvSmall && r.recvSmall[it.code]) || 0)
         + ((r.recv && r.recv[it.code]) || 0);
  }
  dayOut(it, d){
    const r = this.round(d);
    return ((r.outBig && r.outBig[it.code]) || 0) * it.bigSize
         + ((r.outSmall && r.outSmall[it.code]) || 0)
         + ((r.out && r.out[it.code]) || 0);
  }
  recvOf(it, d){ d = d || this.countDate(); return this.spanDays(it, d).reduce((a,x)=>a + this.dayRecv(it,x), 0); }
  outOf(it, d){ d = d || this.countDate(); return this.spanDays(it, d).reduce((a,x)=>a + this.dayOut(it,x), 0); }
  carryHistory(it){
    const rounds = this.state.rounds || {};
    return Object.keys(rounds).sort().reverse().filter(d=>rounds[d] && rounds[d].touched && rounds[d].touched[it.code]).slice(0,14).map(d=>{
      const carry = this.carryOf(it,d), recv = this.recvOf(it,d), out = this.outOf(it,d), left = this.leftOf(it,d);
      return {date:d, carry, recv, out, left, used: Math.max(0, carry+recv-out-left), auto: this.carryIsAuto(it,d)};
    });
  }
  leftOf(it, d){ const r = this.round(d); return (r.big[it.code]||0) * it.bigSize + (r.small[it.code]||0); }
  usedOf(it, d){ const r = this.round(d); if(!r.touched[it.code]) return 0; return Math.max(0, this.carryOf(it,d) + this.recvOf(it,d) - this.outOf(it,d) - this.leftOf(it,d)); }

  renderVals(){
    const s = this.state;
    const auth = s.auth;
    const isAdmin = !!auth && auth.role === 'admin';
    // แอดมินสูงสุด = แก้ไขทุกอย่าง · แอดมินดูข้อมูล = ดูสาขาอื่นได้ แต่ไม่เห็นแท็บแอดมิน
    const isSuper = isAdmin && (auth.level || 'full') === 'full';
    const isStaff = !!auth && !isAdmin;
    const branch = isAdmin ? s.branch : (auth ? auth.branch : s.branch);
    const isWeek = s.period === 'week';
    const periodLabel = isWeek ? 'รายสัปดาห์' : 'รายวัน';
    const wk = weekDatesOf(s.date);
    const weekRange = thShort(wk[0]) + '–' + thShort(wk[6]);
    const weekTag = isWeek ? 'นับทุกวันพุธหลังปิดร้าน' : thDate(s.date);
    const salesScopeLabel = isWeek ? ('รอบ ' + weekRange) : thDate(s.date);
    const dowOf = x => DOW_FULL[(parseISO(x).getDay()+6)%7];
    const salesFromLabel = dowOf(wk[0]) + ' ' + thShort(wk[0]), salesToLabel = dowOf(wk[6]) + ' ' + thShort(wk[6]), salesDaysCount = 7;
    const weekKey = 'W' + wk[6];
    const wkDay = this.wkDay();

    // ยอดขาย: เครื่องนี้ก่อน ถ้าไม่มีให้ใช้ยอดที่เคยส่งขึ้น Sheet ของรอบนั้น
    const srcAll = this.srcRounds();
    const sheetSales = d => (srcAll.rounds[d] ? Number(srcAll.rounds[d].sales||0) : 0);
    // แอดมินดูของสาขาที่เลือก จึงอ่านจาก Sheet เท่านั้น ไม่เอายอดที่พิมพ์ไว้ในเครื่องแอดมินมาปน
    const localSale = d => isAdmin ? 0 : (s.salesByDate[d]||0);
    const dayVal = d => localSale(d)
      || ((d===wk[6] && !wk.some(x=>localSale(x))) ? localSale(weekKey) : 0)
      || sheetSales(d);
    const salesTotal = isWeek ? (localSale(weekKey) || wk.reduce((a,d)=>a + dayVal(d), 0))
      : dayVal(s.date);
    const weekTotal = wk.reduce((a,d)=>a + dayVal(d), 0) || localSale(weekKey);
    const filled = wk.filter(d=>dayVal(d)).length || (localSale(weekKey) ? 1 : 0);

    const r = this.round();
    const doneCount = ITEMS.filter(i=>r.touched[i.code]).length;
    const totalCount = ITEMS.length, allDone = doneCount === totalCount;

    const segOn = 'flex:1;height:36px;border-radius:10px;border:none;background:#fff;color:#C4501A;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 6px rgba(120,55,10,.18)';
    const segOff = 'flex:1;height:36px;border-radius:10px;border:none;background:transparent;color:rgba(255,255,255,.88);font-size:12.5px;font-weight:600;cursor:pointer';
    const minusBtn = 'width:50px;height:50px;border-radius:15px;border:1.5px solid #EBD9BE;background:#FFFBF2;color:#B4410E;font-size:25px;font-weight:600;cursor:pointer;flex:none;line-height:1;display:flex;align-items:center;justify-content:center';
    const plusBtn = 'width:50px;height:50px;border-radius:15px;border:none;background:linear-gradient(160deg,#EE8134,#D9631B);color:#fff;font-size:25px;font-weight:600;cursor:pointer;flex:none;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 9px rgba(203,90,20,.28)';
    const numBtn = "flex:1;height:50px;border-radius:15px;border:1.5px dashed #E4CFAE;background:#fff;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:21px;font-weight:600;color:#33261A";

    let carryTotal = 0, leftTotal = 0, usedTotal = 0, recvTotal = 0;
    ITEMS.forEach(it=>{
      carryTotal += this.carryOf(it);
      recvTotal += this.recvOf(it);
      if(r.touched[it.code]){ leftTotal += this.leftOf(it); usedTotal += this.usedOf(it); }
    });

    const decorate = it => {
      const carry = this.carryOf(it), recv = this.recvOf(it), outQty = this.outOf(it), left = this.leftOf(it);
      const avail = carry + recv - outQty, used = avail - left;
      const has = !!r.touched[it.code];
      const autoCarry = this.carryIsAuto(it);
      const over = has && left > avail;
      const rd = isWeek ? this.round(wkDay) : r, dk = isWeek ? wkDay : undefined;
      const dRecv = isWeek ? this.dayRecv(it, wkDay) : recv, dOut = isWeek ? this.dayOut(it, wkDay) : outQty;
      const dayWord = isWeek ? ('วัน' + DOW_FULL[(parseISO(wkDay).getDay()+6)%7] + ' ' + thShort(wkDay)) : 'วันนี้';
      return {
        ...it,
        done: has,
        big: r.big[it.code]||0,
        small: r.small[it.code]||0,
        recv, recvText: nf(recv), showRecv: true,
        recvLabel: 'รับสินค้าเข้า' + dayWord,
        recvSub: '+' + nf(dRecv) + ' ' + it.smallUnit + (isWeek ? (' · รวมรอบ +' + nf(recv)) : '') + ' · เหลือให้ใช้ ' + nf(avail),
        outLabel: 'โอนสินค้าออก' + dayWord,
        outSub: '−' + nf(dOut) + ' ' + it.smallUnit + (isWeek ? (' · รวมรอบ −' + nf(outQty)) : '') + ' · เหลือให้ใช้ ' + nf(avail),
        recvBig: (rd.recvBig && rd.recvBig[it.code]) || 0,
        recvSmall: (rd.recvSmall && rd.recvSmall[it.code]) || 0,
        recvBigInc: ()=>this.setRound(o=>{ o.recvBig[it.code]=(o.recvBig[it.code]||0)+1; return o; }, dk),
        recvBigDec: ()=>this.setRound(o=>{ o.recvBig[it.code]=Math.max(0,(o.recvBig[it.code]||0)-1); return o; }, dk),
        recvSmallInc: ()=>this.setRound(o=>{ o.recvSmall[it.code]=(o.recvSmall[it.code]||0)+1; return o; }, dk),
        recvSmallDec: ()=>this.setRound(o=>{ o.recvSmall[it.code]=Math.max(0,(o.recvSmall[it.code]||0)-1); return o; }, dk),
        openRecvBig: ()=>this.setState({pad:{code:it.code, kind:'recvBig'}, padBuf:''}),
        openRecvSmall: ()=>this.setState({pad:{code:it.code, kind:'recvSmall'}, padBuf:''}),
        outQty: outQty, outText: nf(outQty),
        outBig: (rd.outBig && rd.outBig[it.code]) || 0,
        outSmall: (rd.outSmall && rd.outSmall[it.code]) || 0,
        outBigInc: ()=>this.setRound(o=>{ o.outBig[it.code]=(o.outBig[it.code]||0)+1; return o; }, dk),
        outBigDec: ()=>this.setRound(o=>{ o.outBig[it.code]=Math.max(0,(o.outBig[it.code]||0)-1); return o; }, dk),
        outSmallInc: ()=>this.setRound(o=>{ o.outSmall[it.code]=(o.outSmall[it.code]||0)+1; return o; }, dk),
        outSmallDec: ()=>this.setRound(o=>{ o.outSmall[it.code]=Math.max(0,(o.outSmall[it.code]||0)-1); return o; }, dk),
        openOutBig: ()=>this.setState({pad:{code:it.code, kind:'outBig'}, padBuf:''}),
        openOutSmall: ()=>this.setState({pad:{code:it.code, kind:'outSmall'}, padBuf:''}),
        outBox: 'margin-top:10px;border:1.5px solid ' + (outQty ? '#F0CFB4' : '#EFE0C8') + ';background:' + (outQty ? '#FDF3EA' : '#FBF7EF') + ';border-radius:14px;padding:11px',
        outPlusBtn: 'width:50px;height:50px;border-radius:15px;border:none;background:linear-gradient(160deg,#C98A5A,#A86436);color:#fff;font-size:25px;font-weight:600;cursor:pointer;flex:none;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 9px rgba(130,80,35,.25)',
        hasOutNote: outQty > carry + recv,
        outNote: 'โอนออกมากกว่าของที่มี (' + nf(carry + recv) + ' ' + it.smallUnit + ') — ตรวจจำนวนที่โอนออก',
        openHist: ()=>this.setState({hist:it.code}),
        availText: nf(avail),
        carrySrc: autoCarry ? (()=>{ const ci = this.carryInfo(it, this.countDate()); return ci ? ('ยอดเหลือรอบ ' + thDate(ci.date) + (ci.src==='sheet' ? ' · จาก Sheet' : '')) : 'ยอดคงเหลือรอบก่อน (อัตโนมัติ)'; })()
          : ((r.carryNote||{})[it.code] ? ('ตั้งเอง · ' + (r.carryNote[it.code].reason||'-')) : 'ตั้งเอง'),
        carrySrcStyle: 'font-size:10px;line-height:1.4;color:' + (autoCarry ? '#7A9B85' : '#B08150'),
        recvBox: 'margin-top:10px;border:1.5px solid ' + (recv ? '#CFE3D6' : '#EFE0C8') + ';background:' + (recv ? '#F2F9F4' : '#FBF7EF') + ';border-radius:14px;padding:11px',
        recvPlusBtn: 'width:50px;height:50px;border-radius:15px;border:none;background:linear-gradient(160deg,#6FAE86,#4E8C66);color:#fff;font-size:25px;font-weight:600;cursor:pointer;flex:none;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 9px rgba(50,110,75,.25)',
        overWarn: over,
        overText: 'เหลือมากกว่ายอดที่มี (' + nf(avail) + ' ' + it.smallUnit + ') — ตรวจสอบยอดรับ โอนออก หรือยอดนับ',
        left, carryText: nf(carry),
        usedChipText: has ? ('ใช้ไป ' + nf(Math.max(0,used)) + ' ' + it.smallUnit) : 'ยังไม่ได้นับ',
        card: 'background:#fff;border:1.5px solid ' + (has ? '#DCEBDF' : '#F0E6D5') + ';border-radius:18px;padding:13px;box-shadow:0 1px 3px rgba(90,60,20,.05)',
        carryBtn: 'margin-top:10px;width:100%;height:46px;padding:0 13px;border-radius:14px;border:1.5px solid #EFE0C8;background:#FAF5EB;cursor:pointer;display:flex;align-items:center;justify-content:space-between',
        minusBtn, plusBtn, numBtn,
        sumRow: 'margin-top:11px;padding-top:10px;border-top:1px dashed #F0E2CC;display:flex;align-items:center;justify-content:space-between;gap:8px',
        usedChip: 'font-size:12px;font-weight:600;padding:5px 10px;border-radius:9px;' + (!has ? 'background:#F4EDE1;color:#8E7860' : (over ? 'background:#FDE7E0;color:#A33C0A' : 'background:#FFF1DC;color:#C4501A')),
        bigInc: ()=>this.setRound(o=>{ o.big[it.code]=(o.big[it.code]||0)+1; o.touched[it.code]=true; return o; }),
        bigDec: ()=>this.setRound(o=>{ o.big[it.code]=Math.max(0,(o.big[it.code]||0)-1); o.touched[it.code]=true; return o; }),
        smallInc: ()=>this.setRound(o=>{ o.small[it.code]=(o.small[it.code]||0)+1; o.touched[it.code]=true; return o; }),
        smallDec: ()=>this.setRound(o=>{ o.small[it.code]=Math.max(0,(o.small[it.code]||0)-1); o.touched[it.code]=true; return o; }),
        openBig: ()=>this.setState({pad:{code:it.code, kind:'big'}, padBuf:''}),
        openSmall: ()=>this.setState({pad:{code:it.code, kind:'small'}, padBuf:''}),
        openCarry: ()=>this.setState({pad:{code:it.code, kind:'carry'}, padBuf:''})
      };
    };

    const groups = ['ของแห้ง','ของเย็น','บุฟเฟ่ต์'].map(sh=>{
      const list = ITEMS.filter(i=>i.shelf===sh);
      return {
        shelf: sh,
        meta: list.filter(i=>r.touched[i.code]).length + '/' + list.length,
        dot: 'width:9px;height:9px;border-radius:50%;background:' + SHELF_COLOR[sh],
        items: list.map(decorate)
      };
    });

    const src = srcAll;
    const srcDates = Object.keys(src.rounds).sort();
    const wantKey = isWeek ? wk[6] : s.date;
    const curKey = src.rounds[wantKey] ? wantKey : (srcDates.length ? srcDates[srcDates.length-1] : null);
    const cur = curKey ? src.rounds[curKey] : null;
    const prevKey = curKey ? (srcDates.filter(d=>d < curKey).pop() || null) : null;
    const prevRound = prevKey ? src.rounds[prevKey] : null;
    const scopeChip = curKey ? ((cur.label||'รอบนับ') + ' ' + thShort(curKey)) : '';
    const srcNote = src.from === 'sheet' ? ('ข้อมูลจาก Google Sheet · สาขา ' + branch)
      : (src.from === 'both' ? ('ข้อมูลจาก Google Sheet + เครื่องนี้ · สาขา ' + branch) : 'ข้อมูลจากเครื่องนี้');

    const usedIn = (rd, code)=> rd && rd.items[code] ? Number(rd.items[code].used||0) : null;
    const curSale = cur ? Number(cur.sales||0) : 0;
    const prevSale = prevRound ? Number(prevRound.sales||0) : 0;
    const rows = ITEMS.map(it=>{
      const used = usedIn(cur, it.code), usedPrev = usedIn(prevRound, it.code);
      const diff = (used !== null && usedPrev !== null) ? used - usedPrev : null;
      const pct = (diff !== null && usedPrev > 0) ? diff / usedPrev * 100 : null;
      const sPct = (used !== null && curSale > 0) ? used / curSale * 100 : null;
      const sPctPrev = (usedPrev !== null && prevSale > 0) ? usedPrev / prevSale * 100 : null;
      return {it, used, usedPrev, diff, pct, sPct, sPctPrev};
    });
    const counted = rows.filter(x=>x.used !== null);
    const upCount = counted.filter(x=>x.diff !== null && x.diff > 0).length;
    const downCount = counted.filter(x=>x.diff !== null && x.diff < 0).length;
    const periodUsedTotal = counted.reduce((a,x)=>a + x.used, 0);
    const anaSales = cur ? Number(cur.sales||0) : 0;
    const maxDiff = Math.max(1, ...counted.map(y=>Math.abs(y.diff||0)));

    const analysis = counted.slice().sort((a,b)=>Math.abs(b.diff||0) - Math.abs(a.diff||0)).map(x=>{
      const up = x.diff !== null && x.diff > 0, down = x.diff !== null && x.diff < 0;
      const col = x.diff === null ? '#A8937C' : (up ? '#C4501A' : (down ? '#3F7A52' : '#8A7458'));
      return {
        name: x.it.name, shelf: x.it.shelf, unit: x.it.smallUnit, scope: scopeChip,
        shelfChip: 'font-size:10px;font-weight:600;color:#fff;background:' + SHELF_COLOR[x.it.shelf] + ';padding:2px 7px;border-radius:6px;flex:none',
        usedText: nf(x.used),
        salePctText: x.sPct === null ? '–' : x.sPct.toFixed(2) + '%',
        salePctPrevText: x.sPctPrev === null ? '–' : x.sPctPrev.toFixed(2) + '%',
        salePctStyle: "font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;color:#33261A",
        salePctPrevStyle: "font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;color:#8A7458",
        prevUsedText: x.usedPrev === null ? '–' : nf(x.usedPrev),
        prevLabel: prevKey ? thShort(prevKey) : '(ไม่มี)',
        diffText: x.diff === null ? '–' : ((x.diff > 0 ? '+' : '') + nf(x.diff)),
        pctText: x.pct === null ? '–' : ((x.pct > 0 ? '+' : '') + x.pct.toFixed(1) + '%'),
        pctStyle: "font-family:'IBM Plex Mono',monospace;font-size:19px;font-weight:600;color:" + col,
        diffStyle: "font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:600;color:" + col,
        card: 'background:#fff;border:1.5px solid ' + (x.diff === null ? '#F0E6D5' : (up ? '#F7CDA9' : '#D9E8DD')) + ';border-radius:15px;padding:10px 11px',
        barStyle: 'width:' + Math.min(50, Math.abs(x.diff||0) / maxDiff * 50) + '%;height:100%;border-radius:7px;background:' + (up ? '#E8762C' : (down ? '#7CB88F' : '#E2D2BA')) + ';margin-' + (up ? 'left' : 'right') + ':auto',
        note: x.diff === null ? 'ไม่มีรอบก่อนของรายการนี้ให้เทียบ' : (x.diff > 0 ? 'ใช้มากกว่ารอบก่อน' : (x.diff < 0 ? 'ใช้น้อยกว่ารอบก่อน' : 'ใช้เท่ากับรอบก่อน'))
      };
    });

    const segTab = on => 'flex:1;height:38px;border-radius:11px;border:none;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:'
      + (on ? '700' : '600') + ';' + (on ? 'background:#fff;color:#33261A;box-shadow:0 1px 3px rgba(90,60,20,.10)' : 'background:transparent;color:#8E7860');
    // ===== หาแนวโน้มและจุดผิดปกติ =====
    const WIN = 7, MINH = 5, SENS = 1.5;
    const idxCur = curKey ? srcDates.indexOf(curKey) : -1;
    const winDates = idxCur >= 0 ? srcDates.slice(Math.max(0, idxCur - WIN + 1), idxCur + 1) : [];
    const salesOf = d => Number((src.rounds[d]||{}).sales||0);
    const stat = arr => {
      const m = arr.reduce((a,b)=>a+b,0)/arr.length;
      const sd = Math.sqrt(arr.reduce((a,b)=>a+(b-m)*(b-m),0)/arr.length);
      return {m, sd: sd || Math.abs(m)*0.12 || 1};
    };
    const fpct = v => (v === null || v === undefined || !isFinite(v)) ? '–'
      : ((Math.abs(v) >= 10 ? v.toFixed(1) : (Math.abs(v) >= 1 ? v.toFixed(2) : v.toFixed(3))) + '%');
    const seriesOf = (it, dates) => {
      const u = this.repUnit(it);
      return (dates || winDates).map(d=>{
        const rd = src.rounds[d], x = rd.items[it.code];
        const used = x ? Number(x.used||0) : null;
        const sale = salesOf(d);
        const rep = used === null ? null : used / u.div;
        return {date:d, used, rep, sale, left: x ? Number(x.left||0) : null, carry: x ? Number(x.carry||0) : null,
          recv: x ? Number(x.recv||0) : null, out: x ? Number(x.out||0) : null, ratio: (used !== null && sale > 0) ? used/sale*100 : null,
          pct: (used !== null && sale > 0) ? used/sale*100 : null};
      });
    };

    const anomalies = ITEMS.map(it=>{
      const u = this.repUnit(it), ser = seriesOf(it), last = ser[ser.length-1];
      if(!last || last.rep === null) return null;
      const prev = ser.length > 1 ? ser[ser.length-2] : null;
      const prior = ser.slice(0,-1).filter(p=>p.ratio !== null);
      const fr = v => this.fmtRep(it, v * u.div);
      const errs = [];
      if(last.left !== null && last.left > (last.carry||0) + (last.recv||0) - (last.out||0) + 0.0001) errs.push('ยอดเหลือมากกว่าของที่มี ตรวจยอดนับ ยอดรับเข้า หรือยอดโอนออก');
      if(prev && prev.left !== null && last.carry !== null && Math.abs(prev.left - last.carry) > Math.max(1, prev.left*0.02)) errs.push('ยอดยกมาไม่ต่อกับรอบก่อน (' + this.fmtRep(it, prev.left) + ' → ' + this.fmtRep(it, last.carry) + ')');
      if(last.used === 0 && last.sale > 0) errs.push('บันทึกใช้ 0 แต่รอบนี้มียอดขาย');

      let status = 'normal', score = 0, headline = '', cause = '', excess = 0;
      const ratioStats = prior.length >= MINH ? stat(prior.map(p=>p.ratio)) : null;
      const hiR = ratioStats ? ratioStats.m + SENS*ratioStats.sd : null;
      const loR = ratioStats ? Math.max(0, ratioStats.m - SENS*ratioStats.sd) : null;
      const fs = v => this.fmtRep(it, v);

      if(errs.length){
        status = 'err'; score = 100; headline = 'ข้อมูลน่าจะคลาดเคลื่อน'; cause = errs.join(' · ');
      } else if(last.sale <= 0){
        status = 'nosale'; score = 0; headline = 'รอบนี้ยังไม่กรอกยอดขาย'; cause = 'ใส่ยอดขายแล้วระบบจะเทียบอัตราการใช้ให้';
      } else if(!ratioStats){
        status = 'few'; score = 0; headline = 'ยังเก็บข้อมูลไม่พอ (' + prior.length + '/' + MINH + ' รอบ)';
        cause = 'ต้องมีรอบที่กรอกทั้งยอดนับและยอดขายครบ ' + MINH + ' รอบก่อน จึงจะตัดสินว่าผิดปกติได้';
      } else {
        const over = last.ratio > hiR, under = last.ratio < loR;
        const streak = ser.slice(-3).filter(p=>p.ratio !== null && p.ratio > hiR).length === 3;
        const salesDiff = prev && prev.sale > 0 ? last.sale - prev.sale : 0;
        const usedDiff = prev && prev.rep !== null ? last.rep - prev.rep : 0;
        const opposite = prev && prev.sale > 0 && prev.rep !== null
          && Math.abs(salesDiff) > prev.sale*0.08 && Math.abs(usedDiff) > Math.abs(prev.rep)*0.08
          && (salesDiff < 0) === (usedDiff > 0) && salesDiff !== 0;
        if(over){
          status = 'over'; excess = (last.ratio - hiR) * last.sale/100; score = 60 + excess/Math.max(0.001, hiR*last.sale/100)*10;
          headline = 'ใช้เกินกว่าปกติ ' + fs(excess);
          cause = 'ยอดขายรอบนี้ ปกติใช้ไม่เกิน ' + fs(hiR*last.sale/100) + ' แต่ใช้ไป ' + fs(last.used) + ' · ' + (streak ? 'เกินแบบนี้ 3 รอบติดกันแล้ว · ' : '') + 'สาเหตุที่พบบ่อย: ' + 'ตักเกินต่อจาน ของเสียที่ยังไม่บันทึก หรือรับเข้าไม่ครบตามบิล';
        } else if(under){
          status = 'under'; excess = (loR - last.ratio) * last.sale/100; score = 30 + excess/Math.max(0.001, loR*last.sale/100)*5;
          headline = 'ใช้น้อยกว่าปกติ ' + fs(excess);
          cause = 'ยอดขายรอบนี้ ปกติใช้อย่างน้อย ' + fs(loR*last.sale/100) + ' แต่ใช้ไปแค่ ' + fs(last.used) + ' · สาเหตุที่พบบ่อย: นับผิด ยอดรับเข้ายังไม่ลงระบบ หรือเปลี่ยนสูตร/เมนู';
        } else if(opposite){
          status = 'opp'; score = 45;
          headline = salesDiff < 0 ? 'ยอดขายลดแต่ของใช้เพิ่ม' : 'ยอดขายเพิ่มแต่ของใช้ลด';
          cause = 'ทิศทางสวนกับรอบก่อน · ตรวจการตัก ของเสีย หรือยอดนับของรอบใดรอบหนึ่ง';
        } else {
          status = 'normal'; score = 0; headline = 'อยู่ในช่วงปกติ';
          cause = 'ยอดขายรอบนี้ ปกติจะใช้ประมาณ ' + fs(loR*last.sale/100) + ' ถึง ' + fs(hiR*last.sale/100) + ' · รอบนี้ใช้ ' + fs(last.used);
        }
      }

      const col = status==='err' ? '#A33C0A' : (status==='over' ? '#C4501A' : (status==='under' ? '#2F6B45'
        : (status==='opp' ? '#B4410E' : (status==='normal' ? '#8A7458' : '#A8937C'))));
      const bd = status==='err' ? '#F0B69A' : (status==='over' ? '#F3B98C' : (status==='under' ? '#BBD9C6'
        : (status==='opp' ? '#F3D7A8' : '#F0E6D5')));
      const bg = status==='err' ? '#FDF0EA' : (status==='over' ? '#FFF3E8' : (status==='under' ? '#EEF6F0' : '#FAF5EB'));
      const flagText = status==='err' ? 'ตรวจข้อมูล' : (status==='over' ? 'ใช้เกินปกติ' : (status==='under' ? 'ใช้น้อยผิดปกติ'
        : (status==='opp' ? 'ทิศทางสวนกัน' : (status==='normal' ? 'ปกติ' : 'ข้อมูลไม่พอ'))));
      const maxBar = Math.max(...ser.map(p=>p.rep||0), 0.0001);
      const sign = status==='over' ? '+' : (status==='under' ? '−' : '');
      return {
        score, flagged: score >= 30,
        shelf: it.shelf, name: it.name, scope: scopeChip,
        card: 'background:#fff;border:1.5px solid ' + bd + ';border-radius:18px;padding:13px',
        flagChip: 'font-size:10px;font-weight:700;color:#fff;padding:3px 8px;border-radius:7px;background:' + col,
        flagText,
        bigStyle: "font-family:'IBM Plex Mono',monospace;font-size:24px;font-weight:600;line-height:1.15;color:" + col,
        bigText: fpct(last.pct),
        bigLabel: '% ของยอดขาย' + (status==='over' ? ' · สูงกว่าช่วงปกติ' : (status==='under' ? ' · ต่ำกว่าช่วงปกติ' : '')),
        bars: (()=>{ const mx = Math.max(0.0001, ...ser.map(p=>p.ratio||0)); return ser.map((p,i)=>{ const isLast = i === ser.length-1;
          return {
            style: 'width:100%;border-radius:4px 4px 2px 2px;height:' + Math.max(6, (p.ratio||0)/mx*42) + 'px;background:' + (isLast ? col : '#E7DCC9'),
            val: p.ratio === null || p.ratio === undefined ? '–' : fpct(p.ratio).replace('%',''),
            valStyle: "font-family:'IBM Plex Mono',monospace;font-size:10px;line-height:1.1;white-space:nowrap;letter-spacing:-0.3px;font-weight:" + (isLast ? '700' : '500') + ';color:' + (isLast ? col : '#8A7A69'),
            date: thShort(p.date),
            dateStyle: 'font-size:10px;line-height:1.1;white-space:nowrap;font-weight:' + (isLast ? '700' : '400') + ';color:' + (isLast ? '#33261A' : '#9C8A76')
          }; }); })(),
        actualText: this.fmtRep(it, last.used),
        rateSmall: 'ใช้/ขาย ' + fpct(last.ratio),
        bandText: hiR === null ? '–' : (last.sale > 0 ? (fs(Math.max(0, loR)*last.sale/100) + ' – ' + fs(hiR*last.sale/100)) : (fpct(loR) + ' – ' + fpct(hiR))),
        excessText: (status==='over'||status==='under') ? (sign + fs(excess)) : '—',
        prevPctText: prev && prev.pct !== null && prev.pct !== undefined ? fpct(prev.pct) : '–',
        ratioText: fpct(last.ratio),
        prevLabel: prev ? thShort(prev.date) : '(ไม่มี)',
        prevText: prev && prev.rep !== null ? fr(prev.rep) : '–',
        causeBox: 'margin-top:11px;display:flex;gap:8px;align-items:flex-start;border-radius:12px;padding:10px 11px;background:' + bg,
        causeTag: 'font-size:11px;font-weight:700;flex:none;color:' + col,
        causeLabel: headline,
        cause
      };
    }).filter(Boolean).sort((a,b)=> b.score - a.score);

    const flagCount = anomalies.filter(a=>a.flagged).length;
    const heatTable = (dates, cellW, fs, soft) => ITEMS.map(it=>{
      const u = this.repUnit(it), ser = seriesOf(it, dates);
      const vals = ser.filter(p=>p.ratio !== null).map(p=>p.ratio);
      const st = vals.length >= 3 ? stat(vals) : null;
      return {
        name: it.name, unit: u.unit,
        cells: ser.map(p=>{
          let bg = 'transparent', tc = '#33261A', fw = '500';
          if(p.ratio !== null && st){
            const z = (p.ratio - st.m)/st.sd;
            if(z > 1.5){ bg = soft ? '#F4C39B' : '#E8762C'; tc = soft ? '#7A3406' : '#fff'; fw='600'; }
            else if(z > 0.9){ bg = soft ? '#FBE8D5' : '#F6D5B6'; tc='#8A3E0A'; fw='600'; }
            else if(z < -1.2){ bg = soft ? '#E2EFE6' : '#CFE3D6'; tc='#255C3C'; fw='600'; }
          }
          return {
            text: (p.pct === null || p.pct === undefined) ? (p.rep === null ? '·' : '–')
              : ((Math.abs(p.pct) >= 10 ? p.pct.toFixed(1) : (Math.abs(p.pct) >= 1 ? p.pct.toFixed(2) : p.pct.toFixed(3))) + (soft ? '%' : '')),
            style: "width:" + cellW + "px;flex:none;padding:8px 4px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:" + fs + "px;font-weight:"
              + fw + ";color:" + tc + ";background:" + bg
          };
        })
      };
    }).filter(r=>r.cells.some(c=>c.text !== '·'));
    const tblRows = heatTable(winDates, 56, 10.5, false);
    const tblHeads = winDates.map(d=>thShort(d));


    // ===== เทียบสาขา: % หน่วยที่ใช้ต่อยอดขาย เฉลี่ย 30 วัน =====
    const pv = s.peers || null;
    const nameOf = c => { const b = (s.branchList||[]).find(x=>x.code===c); return (b && b.name) || ('สาขา ' + c); };
    const BUFFET = ['ZR','CAY'];
    const isBuf = c => BUFFET.includes(String(c).toUpperCase());
    const pCodes = pv ? Object.keys(pv).filter(c=>Number(pv[c].sales) > 0 && !/admin|^hq$/i.test(c)) : [];
    const avgSaleOf = c => { const p = pv[c]; if(!p) return 0; const d = Number(p.days) || Number(p.rounds) || 0; return d ? p.sales/d : 0; };
    const byBig = pCodes.slice().sort((x,y)=>avgSaleOf(y)-avgSaleOf(x));
    const autoGrade = {}, third = byBig.length/3;
    byBig.forEach((c,i)=>{ autoGrade[c] = i < third ? 'A' : (i < third*2 ? 'B' : 'C'); });
    const gradeOf = c => ((s.gradeMap||{})[c] || autoGrade[c] || '–');
    const myGrade = pv ? gradeOf(branch) : '–';
    const groupCodes = pCodes.filter(c=>gradeOf(c) === myGrade);
    const otherCodes = groupCodes.filter(c=>c!==branch);
    const mySale = pv && pv[branch] ? Number(pv[branch].sales||0) : 0;
    const pctOf = (c, code) => { const p = pv[c]; const used = p && p.items ? Number(p.items[code]||0) : 0;
      return (used > 0 && p.sales > 0) ? used/p.sales*100 : null; };
    const peerCode = (()=>{ if(!pv || !pv[branch]) return '';
      if(s.peerItem && pctOf(branch, s.peerItem) !== null) return s.peerItem;
      const f = ITEMS.find(it=>pctOf(branch, it.code) !== null); return f ? f.code : ''; })();
    const peerItems = pv ? ITEMS.map(it=>{
      const mine = pv[branch] ? pctOf(branch, it.code) : null;
      const others = groupCodes.filter(c=>c!==branch).map(c=>pctOf(c, it.code)).filter(v=>v!==null);
      if(mine === null || !others.length) return null;
      const gAvg = others.reduce((x,y)=>x+y,0)/others.length;
      const diff = gAvg > 0 ? (mine-gAvg)/gAvg*100 : 0;
      const myUsed = mine*mySale/100, expUsed = gAvg*mySale/100;
      const best = otherCodes.map(c=>({c, v:pctOf(c, it.code)})).filter(x=>x.v!==null).sort((a,b)=>a.v-b.v)[0];
      return {
        name: it.name, mine: this.fmtRep(it, myUsed), group: fpct(gAvg), diff,
        topName: it.name,
        topLine: 'เราใช้ ' + this.fmtRep(it, myUsed) + ' · ถ้าใช้เท่าสาขาอื่นจะใช้ ' + this.fmtRep(it, expUsed),
        topExtra: 'เกิน ' + this.fmtRep(it, myUsed - expUsed),
        topRef: best ? ('ใช้น้อยสุด: ' + nameOf(best.c) + ' ' + this.fmtRep(it, best.v*mySale/100) + ' (คิดที่ยอดขายเท่าเรา)') : '',
        diffText: (diff > 0 ? '+' : '') + diff.toFixed(0) + '%',
        diffStyle: "width:58px;flex:none;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:700;color:"
          + (diff > 10 ? '#C4501A' : (diff < -10 ? '#2F6B45' : '#8A7458')),
        row: 'width:100%;display:flex;align-items:center;gap:6px;padding:9px 11px;border:none;border-bottom:1px solid #F4EDE1;cursor:pointer;font-family:inherit;text-align:left;background:'
          + (it.code === peerCode ? '#FFF7EA' : '#fff'),
        pick: ()=>this.persist({peerItem: it.code})
      };
    }).filter(Boolean).sort((x,y)=>y.diff-x.diff) : [];
    const peerSel = ITEMS.find(it=>it.code === peerCode) || null;
    let myRankNo = 0;
    const peerRank = (pv && peerSel) ? pCodes.map(c=>({c, v: pctOf(c, peerSel.code)})).filter(x=>x.v !== null)
      .sort((x,y)=>x.v-y.v).map((x,i)=>{
        const me = x.c === branch;
        if(me) myRankNo = i+1;
        return {
          no: String(i+1), name: nameOf(x.c) + ' · ' + gradeOf(x.c) + (me ? ' (สาขาของเรา)' : ''), pct: this.fmtRep(peerSel, x.v*mySale/100),
          row: 'display:flex;align-items:center;gap:8px;padding:9px 11px;border-bottom:1px solid #F4EDE1;background:' + (me ? '#FFF1DC' : '#fff'),
          nameStyle: 'flex:1;min-width:0;font-size:11.5px;color:#33261A;font-weight:' + (me ? '700' : '500'),
          pctStyle: "flex:none;font-family:'IBM Plex Mono',monospace;font-size:11.5px;font-weight:600;color:" + (me ? '#C4501A' : '#8A7458')
        };
      }) : [];
    const peerHot = peerItems.filter(p=>p.diff > 10).length;
    const myGradeSet = (s.gradeMap||{})[branch] || '';
    const gbtn = on => 'height:32px;padding:0 11px;border-radius:10px;border:1.5px solid ' + (on ? '#E8762C' : '#E4D3B8')
      + ';background:' + (on ? '#FFF1DC' : '#fff') + ';color:' + (on ? '#C4501A' : '#8A7458')
      + ';font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;flex:none';

    const histLimit = Number(this.props.historyLimit ?? 20) || 20;
    const roundList = srcDates.slice().reverse().slice(0, histLimit).map(d=>{
      const rr = src.rounds[d], codes = Object.keys(rr.items);
      const usedSum = codes.reduce((a,c)=>a + Number(rr.items[c].used||0), 0);
      return {
        date: thShort(d), label: rr.label || 'รอบนับ', sales: nf(Number(rr.sales||0)),
        detail: codes.length + ' รายการ',
        row: 'width:100%;background:#fff;border:1.5px solid ' + (d === curKey ? '#F3D7A8' : '#F0E6D5') + ';border-radius:16px;padding:12px 13px;display:flex;align-items:center;gap:10px;cursor:pointer;font-family:inherit;text-align:left',
        open: ()=>this.setState({report:d})
      };
    });

    const repKey = s.report && src.rounds[s.report] ? s.report : null;
    const repRound = repKey ? src.rounds[repKey] : null;
    const repItems = repRound ? ITEMS.filter(it=>repRound.items[it.code]).map(it=>{
      const x = repRound.items[it.code];
      const fmt = (v)=>this.fmtRep(it, v);
      return {
        shelf: it.shelf, name: it.name,
        carry: fmt(x.carry), recv: fmt(x.recv), out: fmt(Number(x.out||0)), left: fmt(x.left), used: fmt(x.used),
        pct: (()=>{ const sl = Number(repRound.sales||0), p = sl > 0 ? Number(x.used||0)/sl*100 : null; return p === null ? '–' : ((Math.abs(p) >= 10 ? p.toFixed(1) : (Math.abs(p) >= 1 ? p.toFixed(2) : p.toFixed(3))) + '%'); })(),
        pctStyle: "width:62px;flex:none;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:10px;line-height:1.45;font-weight:600",
        rowStyle: 'display:flex;gap:5px;padding:7px 4px;border-bottom:1px solid #E8E0D2;font-size:11px;color:#33261A',
        numStyle: "width:66px;flex:none;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:10px;line-height:1.45"
      };
    }) : [];
    const repUsedSum = repRound ? Object.keys(repRound.items).reduce((a,c)=>a + Number(repRound.items[c].used||0), 0) : 0;
    const repWin = repKey ? (()=>{ const i = srcDates.indexOf(repKey); return srcDates.slice(Math.max(0,i-WIN+1), i+1); })() : [];
    const repTblHeads = repWin.map(d=>thShort(d));
    const repTblRows = repKey ? heatTable(repWin, 62, 10, true) : [];

    const histItem = s.hist ? ITEMS.find(i=>i.code===s.hist) : null;
    const histRows = histItem ? this.carryHistory(histItem).map(h=>({
      date: thShort(h.date),
      carry: nf(h.carry), recv: nf(h.recv), left: nf(h.left), used: nf(h.used),
      src: h.auto ? 'ยกมาอัตโนมัติ' : 'ตั้งเอง',
      srcStyle: 'font-size:10px;color:' + (h.auto ? '#7A9B85' : '#B08150')
    })) : [];
    const padItem = s.pad && s.pad.code ? ITEMS.find(i=>i.code===s.pad.code) : null;
    const isMoney = !!(s.pad && (s.pad.kind==='sales' || s.pad.kind==='salesDay' || s.pad.kind==='salesWeek'));
    const padKind = !s.pad ? '' : (
      s.pad.kind==='carry' ? 'ยอดยกมา (หน่วยย่อย)' :
      s.pad.kind==='recv' ? 'รับสินค้าเข้า (หน่วยย่อย)' :
      s.pad.kind==='recvBig' ? 'รับเข้า จำนวนหน่วยใหญ่' :
      s.pad.kind==='recvSmall' ? 'รับเข้า จำนวนหน่วยย่อย' :
      s.pad.kind==='outBig' ? 'โอนออก จำนวนหน่วยใหญ่' :
      s.pad.kind==='outSmall' ? 'โอนออก จำนวนหน่วยย่อย' :
      s.pad.kind==='big' ? 'จำนวนหน่วยใหญ่' :
      s.pad.kind==='small' ? 'จำนวนหน่วยย่อย' :
      s.pad.kind==='salesWeek' ? ('ยอดขายรวมรอบ ' + weekRange + ' (บาท)') :
      s.pad.kind==='salesDay' ? ('ยอดขาย ' + thDate(s.pad.day) + ' (บาท)') : ('ยอดขาย ' + salesScopeLabel + ' (บาท)'));
    // ตั้งยอดยกมาเอง: เทียบกับยอดคงเหลือรอบก่อน ถ้าไม่ตรงต้องใส่เหตุผล
    const carryPrevInfo = (s.pad && s.pad.kind==='carry' && padItem) ? this.carryInfo(padItem, this.countDate()) : null;
    const carryPrevLeft = carryPrevInfo ? carryPrevInfo.val : null;
    const carryTyped = s.pad && s.pad.kind==='carry' ? calc(s.padBuf) : 0;
    const carryNeedReason = carryPrevLeft !== null && Math.abs(carryTyped - carryPrevLeft) > Math.max(1, Math.abs(carryPrevLeft)*0.02);
    const multLabel = isMoney ? '×1,000' : (s.pad && (s.pad.kind==='big' || s.pad.kind==='recvBig' || s.pad.kind==='outBig') ? '×1' : (padItem ? '×'+padItem.bigSize : '×10'));

    const keyStyle = "height:54px;border-radius:15px;border:1.5px solid #EFE0C8;background:#fff;font-family:'IBM Plex Mono',monospace;font-size:22px;font-weight:600;color:#33261A;cursor:pointer";
    const opStyle = "height:54px;border-radius:15px;border:1.5px solid #F0DCC0;background:#FFF6E8;font-family:'IBM Plex Mono',monospace;font-size:22px;font-weight:600;color:#B4410E;cursor:pointer";
    const push = t => this.setState({padBuf: appendTok(s.padBuf, t)});
    const padKeys = [];
    const padRows = [['1','2','3','+'],['4','5','6','−'],['7','8','9','×']];
    padRows.forEach(r=>r.forEach(t=>padKeys.push({label:t, press:()=>push(t), style:/[0-9]/.test(t) ? keyStyle : opStyle})));
    padKeys.push({label:'⌫', press:()=>this.setState({padBuf:s.padBuf.slice(0,-1)}), style:'height:54px;border-radius:15px;border:1.5px solid #EFE0C8;background:#F7EFE2;font-size:19px;color:#8A7458;cursor:pointer'});
    padKeys.push({label:'0', press:()=>push('0'), style:keyStyle});
    padKeys.push({label:'.', press:()=>push('.'), style:keyStyle});
    padKeys.push({label:'=', press:()=>this.setState({padBuf: String(calc(s.padBuf))}), style:'height:54px;border-radius:15px;border:none;background:#F0E2CB;font-size:22px;font-weight:700;color:#8A5A1E;cursor:pointer'});
    padKeys.push({label: multLabel, press:()=>{
      const mult = isMoney ? 1000 : (s.pad && (s.pad.kind==='big' || s.pad.kind==='recvBig' || s.pad.kind==='outBig') ? 1 : (padItem ? padItem.bigSize : 10));
      this.setState({padBuf: appendTok(s.padBuf, '×') + mult});
    }, style:'grid-column:span 4;height:46px;border-radius:14px;border:1.5px solid #F0DCC0;background:#FFF6E8;font-size:14px;font-weight:600;color:#B4410E;cursor:pointer'});

    const cm = parseISO(s.calMonth);
    const first = new Date(cm.getFullYear(), cm.getMonth(), 1);
    const lead = (first.getDay()+6)%7;
    const dim = new Date(cm.getFullYear(), cm.getMonth()+1, 0).getDate();
    const selWeek = weekDatesOf(s.date);
    const todayISO = iso(new Date());
    const calCells = [];
    for(let i=0;i<lead;i++) calCells.push({label:'', pick:()=>{}, style:'height:44px;border:none;background:transparent'});
    for(let day=1; day<=dim; day++){
      const dISO = cm.getFullYear() + '-' + pad2(cm.getMonth()+1) + '-' + pad2(day);
      const sel = dISO === s.date;
      const inWeek = isWeek && selWeek.indexOf(dISO) >= 0;
      const hasData = !!(s.rounds[dISO] || s.salesByDate[dISO]);
      let st = "height:44px;border-radius:12px;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:600;position:relative;";
      if(sel) st += 'border:none;background:linear-gradient(160deg,#EE8134,#D9631B);color:#fff;box-shadow:0 3px 8px rgba(203,90,20,.3)';
      else if(inWeek) st += 'border:1.5px solid #F3D7A8;background:#FFF1DC;color:#C4501A';
      else if(dISO===todayISO) st += 'border:1.5px solid #E8762C;background:#fff;color:#C4501A';
      else st += 'border:1.5px solid #F0E6D5;background:#fff;color:' + (hasData ? '#4A3524' : '#A8937C');
      if(hasData && !sel) st += ';text-decoration:underline;text-decoration-color:#7CB88F;text-decoration-thickness:2px;text-underline-offset:3px';
      calCells.push({label:String(day), style:st, pick:()=>this.persist({date: isWeek ? wedEnd(dISO) : dISO, wkDay: isWeek ? dISO : s.wkDay})});
    }

    const weekStrip = wk.map((d,i)=>{
      const sel = d === wkDay;
      const moved = ITEMS.some(it=>this.dayRecv(it,d) || this.dayOut(it,d));
      const future = d > iso(new Date());
      return {
        dow: DOW[(parseISO(d).getDay()+6)%7], day: parseISO(d).getDate(),
        style: 'height:64px;padding:0;border-radius:13px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;' + (sel
          ? 'border:none;background:linear-gradient(160deg,#EE8134,#D9631B);color:#fff;box-shadow:0 3px 9px rgba(203,90,20,.3)'
          : moved ? 'border:1.5px solid #9FCBAE;background:#E3F1E6;color:#2F5E40'
          : ('border:1.5px solid #EDE1CC;background:#FDF9F1;color:' + (future ? '#B9A891' : '#6E5B47'))),
        mark: i === 6 ? 'นับ' : (moved ? '✓' : '·'),
        markStyle: 'font-size:10.5px;line-height:1;height:11px;font-weight:700;color:' + (sel ? '#fff' : (i === 6 ? '#B4410E' : (moved ? '#3F8A57' : 'transparent'))),
        pick: ()=>this.persist({wkDay:d})
      };
    });

    const weekDays = wk.map((d,i)=>{
      const v = dayVal(d);
      const wmax = Math.max(1, ...wk.map(x=>dayVal(x)));
      return {
        label: DOW_FULL[(parseISO(d).getDay()+6)%7], sub: thShort(d), text: nf(v),
        row: 'width:100%;padding:11px 13px;border:none;border-bottom:' + (i<6?'1px solid #F6EFE3':'none') + ';background:' + (d===s.date ? '#FFFBF2' : '#fff') + ';display:flex;align-items:center;gap:10px;cursor:pointer;text-align:left',
        bar: 'display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,#EE8134,#D9631B);width:' + (v ? Math.max(4, v/wmax*100) : 0) + '%',
        open: ()=>this.setState({pad:{kind:'salesDay', day:d}, padBuf:''})
      };
    });

    const y = parseISO(s.date).getFullYear();
    const mm = pad2(parseISO(s.date).getMonth()+1);
    const drivePath = 'Drive / ตรวจความเคลื่อนไหวสินค้าที่ Gog สูง / ' + branch + ' / ' + y + ' / ' + mm + ' / W' + weekNo(s.date) + ' /';
    const driveFile = branch + '_' + (isWeek ? ('W'+weekNo(s.date)+'_'+wk[0]+'_ถึง_'+wk[6]) : ('D_'+s.date)) + '.gsheet';

    return {
      periodLabel, weekTag, branch:branch, branchOpen:s.branchOpen, isWeek,
      dateShort: thShort(isWeek ? wk[6] : s.date), dateLong: isWeek ? ('พุธ ' + thDate(wk[6]) + ' หลังปิดร้าน') : thDate(s.date), weekRange, salesScopeLabel,
      salesFromLabel, salesToLabel, salesDaysCount, movesMsg: s.movesMsg || '', movesOk: s.movesOk !== false, pullMoves: ()=>this.pullMoves(true),
      syncLabel: s.lastSync ? ('ซิงก์แล้ว ' + s.lastSync) : 'ยังไม่ได้ซิงก์', movesErr: s.movesOk === false && !!s.movesMsg,
      wkDayLabel: DOW_FULL[(parseISO(wkDay).getDay()+6)%7] + ' ' + thDate(wkDay),
      isCount: s.tab==='count' || (s.tab==='sync' && !isSuper), isSales:s.tab==='sales', isAnalysis:s.tab==='analysis', isHistory:s.tab==='history', isSync:s.tab==='sync' && isSuper,
      dayBtn: isWeek? segOff : segOn, weekBtn: isWeek? segOn : segOff,
      setDay: ()=>this.persist({period:'day'}), setWeek: ()=>{ this.persist({period:'week', date: wedEnd(s.date), wkDay:null}); setTimeout(()=>this.pullMoves(), 50); },
      prevWeek: ()=>{ this.persist({date: addDays(wk[6], -7), wkDay:null}); setTimeout(()=>this.pullMoves(), 50); },
      nextWeek: ()=>{ this.persist({date: addDays(wk[6], 7), wkDay:null}); setTimeout(()=>this.pullMoves(), 50); },
      wedLabel: thDate(wk[6]), isDay: !isWeek,
      toggleBranch: ()=>this.setState({branchOpen:!s.branchOpen}),
      branches: s.branchList.map(b=>({code:b.code, pick:()=>{
          this.persist({branch:b.code, branchOpen:false});
          // แอดมินสลับสาขา → ดึงข้อมูลสาขานั้นจาก Sheet ให้เลย ยอดขาย/ยอดใช้จะตามสาขาที่เลือก
          if(s.auth && s.auth.role === 'admin' && !((s.remote||{})[b.code])) setTimeout(()=>this.pullBranch(), 150);
        },
        style:"height:46px;border-radius:13px;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:600;" + (b.code===branch ? 'border:none;background:linear-gradient(160deg,#EE8134,#D9631B);color:#fff' : 'border:1.5px solid #EFE0C8;background:#fff;color:#8A7458')})),

      loggedIn: !!auth, loggedOut: !auth, isAdmin, isStaff, isSuper,
      userLabel: auth ? auth.u : '',
      appVersion: '2026-11-20.3', hasUpdate: !!s.updateV, applyUpdate: ()=>this.doUpdate(s.updateV),
      loginU: s.loginU, loginP: s.loginP, loginErr: s.loginErr, hasLoginErr: !!s.loginErr,
      setLoginU: e=>this.setState({loginU:e.target.value, loginErr:''}),
      setLoginP: e=>this.setState({loginP:e.target.value, loginErr:''}),
      onLoginKey: e=>{ if(e.key === 'Enter') this.doLogin(); },
      login: ()=>this.doLogin(),
      logout: ()=>this.persist({auth:null, loginU:'', loginP:'', loginErr:'', tab:'count'}),
      logoutAsk: ()=>{ if(window.confirm('ออกจากระบบ (' + (auth ? auth.u : '') + ')?')) this.persist({auth:null, loginU:'', loginP:'', loginErr:'', tab:'count'}); },

      myName: (s.branchList.find(b=>b.code===branch)||{}).name || ('สาขา '+branch),
      myNoPhoto: !this.photoOf(branch),
      myPhotoStyle: (()=>{ const ph = this.photoOf(branch);
        return 'width:64px;height:64px;border-radius:18px;flex:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border:1.5px solid #EFE0C8;overflow:hidden;' + (ph ? ('background-image:url("' + ph + '");background-size:cover;background-position:center') : 'background:#F7F0E4'); })(),
      onMyPhoto: e=>this.onPhotoFile(branch, e),
      setMyName: e=>this.updateBranch(branch, {name:e.target.value}),
      pw1: s.pw1, pw2: s.pw2, pwMsg: s.pwMsg, hasPwMsg: !!s.pwMsg,
      pwMsgStyle: 'font-size:11.5px;border-radius:11px;padding:9px 12px;margin-top:9px;' + (s.pwOk ? 'color:#2F6B45;background:#E6F2E9' : 'color:#A33C0A;background:#FDE7E0'),
      setPw1: e=>this.setState({pw1:e.target.value, pwMsg:''}),
      setPw2: e=>this.setState({pw2:e.target.value, pwMsg:''}),
      saveMyPass: ()=>this.saveMyPass(),

      syncUrl: s.syncUrl, syncSecret: s.syncSecret,
      setSyncUrl: e=>this.persist({syncUrl:e.target.value, syncMsg:''}),
      setSyncSecret: e=>this.persist({syncSecret:e.target.value, syncMsg:''}),
      doSync: ()=>this.doSync(),
      syncBtnText: s.syncing ? 'กำลังส่ง…' : (salesTotal > 0 ? 'ส่งข้อมูลรอบนี้ขึ้น Sheet' : 'กรอกยอดขายก่อน ถึงจะส่งขึ้น Sheet ได้'),
      syncBtn: 'margin-top:11px;width:100%;height:46px;border-radius:14px;border:none;background:' + (s.syncing ? '#E6D8C0' : 'linear-gradient(160deg,#EE8134,#D9631B)') + ';color:' + (s.syncing ? '#8A7458' : '#fff') + ';font-size:13.5px;font-weight:700;cursor:' + (s.syncing?'default':'pointer') + ';box-shadow:0 3px 9px rgba(203,90,20,.24)',
      draftMsg: s.draftMsg, hasDraftMsg: !!s.draftMsg,
      draftMsgStyle: 'font-size:11.5px;border-radius:11px;padding:9px 12px;margin-top:9px;line-height:1.5;' + (s.draftOk ? 'color:#2F6B45;background:#E6F2E9' : 'color:#A33C0A;background:#FDE7E0'),
      pullDraft: ()=>this.restoreDraft(this.draftBranch() || branch),
      syncMsg: s.syncMsg, hasSyncMsg: !!s.syncMsg,
      syncMsgStyle: 'font-size:11.5px;border-radius:11px;padding:9px 12px;margin-top:9px;line-height:1.5;' + (s.syncOk ? 'color:#2F6B45;background:#E6F2E9' : 'color:#A33C0A;background:#FDE7E0'),
      syncNote: s.syncUrl ? ('ปลายทาง: ' + s.syncUrl.slice(0,46) + (s.syncUrl.length>46?'…':'')) : 'ยังไม่ได้ตั้งลิงก์ Web App',
      lastSyncText: (()=>{ const k = this.syncPayload().roundKey; const t = s.lastSyncAt && s.lastSyncAt[k];
        return t ? ('ส่งล่าสุด ' + new Date(t).toLocaleString('th-TH')) : 'รอบนี้ยังไม่เคยส่ง'; })(),
      branchCount: s.branchList.length,
      branchRows: s.branchList.map(b=>({
        code: b.code, name: b.name, owner: b.owner, login: b.code.toLowerCase(),
        noPhoto: !this.photoOf(b.code),
        photoStyle: 'width:58px;height:58px;border-radius:16px;flex:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border:1.5px solid #EFE0C8;overflow:hidden;' +
          (this.photoOf(b.code) ? ('background-image:url("' + this.photoOf(b.code) + '");background-size:cover;background-position:center') : 'background:#F7F0E4'),
        onPhoto: e=>this.onPhotoFile(b.code, e),
        setName: e=>this.updateBranch(b.code, {name:e.target.value}),
        setOwner: e=>this.updateBranch(b.code, {owner:e.target.value}),
        pass: (s.passMap||{})[b.code] ?? b.pass ?? STAFF_PASS,
        setPass: e=>this.setBranchPass(b.code, e.target.value),
        resetPass: ()=>this.setBranchPass(b.code, STAFF_PASS),
        del: ()=>this.delBranch(b.code),
        admLabel: (()=>{ const a = (s.adminList||[]).find(x=>x.u === b.code.toLowerCase() && x.active);
          return a ? (a.level === 'full' ? 'แอดมินสูงสุด' : 'แอดมินดูข้อมูล') : 'ยังไม่เป็นแอดมิน'; })(),
        admChipStyle: (()=>{ const a = (s.adminList||[]).find(x=>x.u === b.code.toLowerCase() && x.active);
          return 'font-size:10.5px;font-weight:600;padding:3px 8px;border-radius:7px;flex:none;' +
            (a ? (a.level === 'full' ? 'background:#33261A;color:#FFD9AE' : 'background:#EAF2E9;color:#3F7A52') : 'background:#F5EEE2;color:#8E7860'); })(),
        toView: ()=>this.promoteBranch(b.code, 'view'),
        toFull: ()=>this.promoteBranch(b.code, 'full'),
        toNone: ()=>this.removeAdmin(b.code.toLowerCase())
      })),
      adminRows: (s.adminList||[]).map(a=>({
        u: a.u, name: a.name || '—',
        levelLabel: a.active ? (a.level === 'full' ? 'สูงสุด · แก้ไขทุกอย่าง' : 'ดูข้อมูล · ดูได้ทุกสาขา') : 'ปิดสิทธิ์',
        levelStyle: 'font-size:10.5px;font-weight:600;padding:3px 8px;border-radius:7px;flex:none;' +
          (!a.active ? 'background:#FDE7E0;color:#A33C0A' : (a.level === 'full' ? 'background:#33261A;color:#FFD9AE' : 'background:#EAF2E9;color:#3F7A52')),
        fullBtn: 'height:34px;padding:0 11px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:11.5px;font-weight:700;' +
          (a.active && a.level === 'full' ? 'border:none;background:#33261A;color:#FFD9AE' : 'border:1.5px solid #EFE0C8;background:#fff;color:#8A7458'),
        viewBtn: 'height:34px;padding:0 11px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:11.5px;font-weight:700;' +
          (a.active && a.level === 'view' ? 'border:none;background:#3F7A52;color:#fff' : 'border:1.5px solid #EFE0C8;background:#fff;color:#8A7458'),
        setFull: ()=>this.saveAdmin({u:a.u, level:'full', name:a.name||''}, 'อัปเป็นแอดมินสูงสุด: ' + a.u),
        setView: ()=>this.saveAdmin({u:a.u, level:'view', name:a.name||''}, 'ตั้งเป็นแอดมินดูข้อมูล: ' + a.u),
        del: ()=>this.removeAdmin(a.u)
      })),
      adminCount: (s.adminList||[]).length,
      loadAdmins: ()=>this.loadAdmins(),
      naU: s.naU, naP: s.naP, naName: s.naName,
      setNaU: e=>this.setState({naU:e.target.value, adminsMsg:''}),
      setNaP: e=>this.setState({naP:e.target.value, adminsMsg:''}),
      setNaName: e=>this.setState({naName:e.target.value, adminsMsg:''}),
      naFullBtn: 'flex:1;height:38px;border-radius:11px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;' +
        (s.naLevel === 'full' ? 'border:none;background:#33261A;color:#FFD9AE' : 'border:1.5px solid #EFE0C8;background:#fff;color:#8A7458'),
      naViewBtn: 'flex:1;height:38px;border-radius:11px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;' +
        (s.naLevel !== 'full' ? 'border:none;background:#3F7A52;color:#fff' : 'border:1.5px solid #EFE0C8;background:#fff;color:#8A7458'),
      setNaFull: ()=>this.setState({naLevel:'full'}),
      setNaView: ()=>this.setState({naLevel:'view'}),
      addAdmin: ()=>this.addAdminNow(),
      adminsMsg: s.adminsMsg, hasAdminsMsg: !!s.adminsMsg,
      nbCode: s.nbCode, nbName: s.nbName, nbOwner: s.nbOwner, nbPass: s.nbPass,
      setNbPass: e=>this.setState({nbPass:e.target.value, adminMsg:''}),
      setNbCode: e=>this.setState({nbCode:e.target.value, adminMsg:''}),
      setNbName: e=>this.setState({nbName:e.target.value, adminMsg:''}),
      setNbOwner: e=>this.setState({nbOwner:e.target.value, adminMsg:''}),
      addBranch: ()=>this.addBranchNow(),
      syncBranches: ()=>this.syncBranchesNow(),
      adminMsg: s.adminMsg, hasAdminMsg: !!s.adminMsg,

      calOpen: s.calOpen,
      openCal: ()=>this.setState({calOpen:true, calMonth:s.date}),
      closeCal: ()=>this.setState({calOpen:false}),
      prevMonth: ()=>{ const d = parseISO(s.calMonth); d.setMonth(d.getMonth()-1, 1); this.setState({calMonth:iso(d)}); },
      nextMonth: ()=>{ const d = parseISO(s.calMonth); d.setMonth(d.getMonth()+1, 1); this.setState({calMonth:iso(d)}); },
      pickToday: ()=>this.persist({date: isWeek ? wedEnd(todayISO) : todayISO, wkDay: isWeek ? todayISO : s.wkDay, calMonth:todayISO}),
      calTitle: MON[cm.getMonth()] + ' ' + (cm.getFullYear()+543),
      calHint: isWeek ? 'โหมดรายสัปดาห์ · รอบ พฤ–พ · เลือกวันไหนก็จะไปรอบที่ปิดวันพุธนั้น' : 'เลือกวันที่ต้องการนับ',
      dowLabels: DOW.map(l=>({label:l})),
      calCells, weekStrip,

      greeting: allDone ? 'เยี่ยม! นับครบแล้ว' : (doneCount===0 ? 'สวัสดี เริ่มนับวันนี้กันเลย' : 'ไปต่ออีกนิด เหลือ ' + (totalCount-doneCount) + ' รายการ'),
      doneCount, totalCount, allDone, notAllDone: !allDone,
      progressStyle: 'width:' + Math.round(doneCount/totalCount*100) + '%;height:100%;border-radius:9px;background:linear-gradient(90deg,#EE8134,#D9631B);transition:width .3s ease',
      carryTotal: nf(carryTotal), leftTotal: nf(leftTotal), usedTotal: nf(usedTotal), recvTotal: nf(recvTotal),
      groups,

      salesTotalText: nf(salesTotal),
      salesEditText: isAdmin ? ('ยอดขายจาก Sheet · สาขา ' + branch) : (salesTotal ? 'แก้ยอดขาย' : 'ใส่ยอดขาย'),
      salesEditBtn: 'margin-top:11px;height:40px;padding:0 16px;border-radius:12px;border:none;background:' + (salesTotal?'#fff':'linear-gradient(160deg,#EE8134,#D9631B)') + ';color:' + (salesTotal?'#C4501A':'#fff') + ';font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 3px 9px rgba(140,70,20,.16)',
      openSalesTotal: ()=>{ if(isAdmin){ this.setState({pullMsg:'แอดมินดูยอดขายจาก Sheet ของสาขาที่เลือก แก้ยอดได้จากเครื่องของสาขา'}); return; } this.setState({pad:{kind:isWeek?'salesWeek':'sales', day:s.date}, padBuf:''}); },
      weekBreakdownTitle: 'ยอดขายรายวันในรอบ (' + weekRange + ')',
      weekDays, weekTotalText: nf(weekTotal), weekAvgText: nf(filled ? Math.round(weekTotal/filled) : 0),

      upCount, downCount, pendingCount: ITEMS.length - counted.length,
      periodUsedTotal: nf(periodUsedTotal),
      anaSalesText: nf(anaSales), anaScope: scopeChip || 'ยังไม่มีรอบ',
      srcNote,
      compareText: prevRound ? ('เทียบยอดใช้ ' + thShort(curKey) + ' กับรอบก่อน ' + thShort(prevKey))
        : (curKey ? ('รอบ ' + thShort(curKey) + ' · ยังไม่มีรอบก่อนให้เทียบ') : 'ยังไม่มีรอบนับ'),
      analysis, hasAnalysis: analysis.length>0, noAnalysis: analysis.length===0,
      anomalies, tblRows, tblHeads, repTblHeads, repTblRows,
      hasRepTbl: repTblRows.length > 0 && repTblHeads.length > 1,
      tblWidth: 'min-width:' + (146 + winDates.length*56) + 'px',
      viewCard: s.anaView !== 'table', viewTable: s.anaView === 'table',
      setViewCard: ()=>this.persist({anaView:'card'}), setViewTable: ()=>this.persist({anaView:'table'}),
      viewCardBtn: segTab(s.anaView !== 'table'), viewTableBtn: segTab(s.anaView === 'table'),
      anaHeadline: flagCount > 0
        ? ('พบ ' + flagCount + ' รายการที่น่าตรวจสอบ เรียงจุดผิดปกติขึ้นก่อน')
        : 'ยังไม่พบจุดผิดปกติในรอบนี้ · เรียงตามระดับที่น่าสนใจ',
      isAdminView: !!s.auth, pullTitle: isAdmin ? 'ดูข้อมูลของแต่ละสาขา' : 'ดึงข้อมูลย้อนหลังจาก Google Sheet',
      pullHint: isAdmin ? 'เลือกสาขาที่มุมขวาบน แล้วกดดึงข้อมูลที่สาขาส่งขึ้น Sheet มาวิเคราะห์'
        : 'ดึงรอบที่เคยส่งขึ้น Sheet กลับมาดูย้อนหลังและวิเคราะห์ ใช้ได้แม้เปลี่ยนเครื่อง',
      pullMsg: s.pullMsg, hasPullMsg: !!s.pullMsg,
      pullBranch: ()=>this.pullBranch(),
      pullBtnText: s.pulling ? 'กำลังดึง…' : ('ดึงข้อมูลสาขา ' + branch + ' จาก Sheet'),
      pullBtn: 'margin-top:11px;width:100%;height:44px;border-radius:13px;border:none;background:' + (s.pulling ? '#6B5B48' : '#FFD9AE') + ';color:' + (s.pulling ? '#E8DCC8' : '#5C3B10') + ';font-size:13px;font-weight:700;cursor:' + (s.pulling ? 'default' : 'pointer') + ';font-family:inherit',
      roundList, noRounds: !roundList.length,
      reportOpen: !!repKey, repItems, repCount: repItems.length,
      repBranch: ((s.branchList.find(b=>b.code===branch)||{}).name || ('สาขา '+branch)) + ' (' + branch + ')',
      _pdfNameSet: (this._pdfName = repKey ? ('รายงาน ' + ((s.branchList.find(b=>b.code===branch)||{}).name || ('สาขา '+branch)) + ' ' + (repRound && repRound.label || 'รอบนับ') + ' ' + thDate(repKey)) : '') && '',
      repLabel: repRound ? (repRound.label || 'รอบนับ') : '',
      repDate: repKey ? thDate(repKey) : '',
      repSales: repRound ? nf(Number(repRound.sales||0)) : '0',
      repUsed: nf(repUsedSum),
      repSource: srcNote,
      repPrinted: new Date().toLocaleString('th-TH'),
      closeReport: ()=>this.setState({report:null}),
      printReport: ()=>this.printReportPDF(),
      openCurReport: ()=>this.setState({report: curKey}),

      drivePath, driveFile,
      driveStatusText: s.drive ? ('เชื่อมต่อแล้ว · แยกโฟลเดอร์ตามสาขา ปี เดือน และสัปดาห์') : 'ยังไม่เชื่อมต่อบัญชี',
      driveBtnText: s.drive ? 'ซิงก์รอบนี้ขึ้น Drive' : 'เชื่อมต่อ Google Drive',
      driveBtn: 'margin-top:11px;height:42px;padding:0 18px;border-radius:13px;border:none;background:' + (s.drive?'#fff':'linear-gradient(160deg,#EE8134,#D9631B)') + ';color:' + (s.drive?'#C4501A':'#fff') + ';font-size:13.5px;font-weight:700;cursor:pointer;box-shadow:0 3px 9px rgba(140,70,20,.18)',
      toggleDrive: ()=>this.persist({drive:!s.drive}),
      driveTasks: [
        {icon:'⬇', title:'ดึงไฟล์รายการนับเข้าแอป', desc:'อ่าน รายการนับ.xlsx จาก Drive ' + ITEMS.length + ' รายการ พร้อมหน่วยใหญ่/หน่วยย่อย', badge:'width:32px;height:32px;border-radius:10px;background:#FFF1DC;color:#C4501A;font-size:15px;display:flex;align-items:center;justify-content:center;flex:none'},
        {icon:'⬆', title:'บันทึกผลนับแยกตามวันที่', desc:'ไฟล์รายวันเก็บในโฟลเดอร์สัปดาห์ และมีชีตสรุปรายสัปดาห์รวมให้อัตโนมัติ', badge:'width:32px;height:32px;border-radius:10px;background:#EAF5EC;color:#3F7A52;font-size:15px;display:flex;align-items:center;justify-content:center;flex:none'},
        {icon:'✉', title:'แชร์รายงานสรุปให้หัวหน้า', desc:'ส่งลิงก์สรุป % อัตราใช้สินค้าต่อยอดขายของวันหรือสัปดาห์ที่เลือก', badge:'width:32px;height:32px;border-radius:10px;background:#EDF1F7;color:#4A6C86;font-size:15px;display:flex;align-items:center;justify-content:center;flex:none'},
        {icon:'⟳', title:'สำรองข้อมูลอัตโนมัติทุกรอบ', desc:'เก็บสำเนาทุกครั้งที่ปิดรอบ ย้อนดูได้ 12 เดือน', badge:'width:32px;height:32px;border-radius:10px;background:#F7EFE2;color:#8A7458;font-size:15px;display:flex;align-items:center;justify-content:center;flex:none'}
      ],
      history: [
        {date:'14 ก.ย.', label:'รอบรายวัน · FPR', detail:'ขาย 42,800฿ · ผิดปกติ 2', tagText:'ซิงก์แล้ว', tag:'font-size:10.5px;font-weight:600;color:#3F7A52;background:#EAF5EC;padding:4px 8px;border-radius:8px;flex:none'},
        {date:'13 ก.ย.', label:'รอบรายวัน · FPR', detail:'ขาย 38,150฿ · ปกติทั้งหมด', tagText:'ซิงก์แล้ว', tag:'font-size:10.5px;font-weight:600;color:#3F7A52;background:#EAF5EC;padding:4px 8px;border-radius:8px;flex:none'},
        {date:'08 ก.ย.', label:'สรุปสัปดาห์ 37 · FPR', detail:'ขาย 276,400฿ · ผิดปกติ 4', tagText:'ซิงก์แล้ว', tag:'font-size:10.5px;font-weight:600;color:#3F7A52;background:#EAF5EC;padding:4px 8px;border-radius:8px;flex:none'},
        {date:'07 ก.ย.', label:'รอบรายวัน · ZR', detail:'ขาย 31,900฿ · รอตรวจสอบ', tagText:'รออัปโหลด', tag:'font-size:10.5px;font-weight:600;color:#A5633A;background:#FFF0E4;padding:4px 8px;border-radius:8px;flex:none'}
      ],

      isCarryPad: !!(s.pad && s.pad.kind==='carry' && padItem && carryPrevLeft !== null),
      carryPrevText: carryPrevLeft === null ? '' : ('รอบ ' + thDate(carryPrevInfo.date) + ' เหลือ ' + nf(carryPrevLeft) + ' ' + (padItem ? padItem.smallUnit : '') + (carryPrevInfo.src==='sheet' ? ' · จาก Sheet' : '')),
      carryDiffText: carryPrevLeft === null ? '' : (carryNeedReason
        ? ('ที่พิมพ์ไว้ต่างจากรอบก่อน ' + ((carryTyped - carryPrevLeft) > 0 ? '+' : '') + nf(carryTyped - carryPrevLeft) + ' ' + (padItem ? padItem.smallUnit : '') + ' · ต้องใส่เหตุผล')
        : 'ตรงกับยอดคงเหลือรอบก่อน'),
      carryDiffStyle: 'font-size:11px;margin-top:3px;line-height:1.5;color:' + (carryNeedReason ? '#A33C0A' : '#2F6B45'),
      carryNeedReason,
      carryReason: s.carryReason || '',
      setCarryReason: e=>this.setState({carryReason:e.target.value, carryErr:''}),
      carryErr: s.carryErr || '', hasCarryErr: !!s.carryErr,
      padOpen: !!s.pad, padKind, padName: padItem ? padItem.name : (s.pad && s.pad.kind==='salesDay' ? thDate(s.pad.day) : salesScopeLabel),
      padValue: s.padBuf || '0',
      padPreview: /[+−×]/.test(s.padBuf||'') ? ('= ' + nf(calc(s.padBuf))) : '',
      padShowPreview: /[+−×]/.test(s.padBuf||''),
      padHint: !s.pad ? '' : (isMoney ? 'บาท' : ((s.pad.kind==='big' || s.pad.kind==='recvBig' || s.pad.kind==='outBig') ? padItem.bigUnit : padItem.smallUnit)),
      histOpen: !!s.hist,
      histName: histItem ? histItem.name : '',
      histUnit: histItem ? histItem.smallUnit : '',
      histRows, histEmpty: !histRows.length,
      closeHist: ()=>this.setState({hist:null}),
      padKeys,
      closePad: ()=>this.setState({pad:null, padBuf:'', carryReason:'', carryErr:''}),
      confirmPad: ()=>{
        if(!s.pad) return;
        const v = calc(s.padBuf), k = s.pad.kind;
        if(k==='sales'){ this.persist({salesByDate:{...s.salesByDate, [s.date]:v}, pad:null, padBuf:''}); return; }
        if(k==='salesWeek'){ this.persist({salesByDate:{...s.salesByDate, [weekKey]:v}, pad:null, padBuf:''}); return; }
        if(k==='salesDay'){ this.persist({salesByDate:{...s.salesByDate, [s.pad.day]:v}, pad:null, padBuf:''}); return; }
        if(k==='carry' && carryNeedReason && !(s.carryReason||'').trim()){
          this.setState({carryErr:'ยอดยกมาไม่ตรงกับยอดคงเหลือรอบก่อน · ใส่เหตุผลก่อนบันทึก'});
          return;
        }
        const reason = (s.carryReason||'').trim();
        const padDay = (s.period==='week' && /^(recv|out)/.test(k)) ? wkDay : undefined;
        this.setRound(o=>{
          o[k][s.pad.code] = v;
          if(k==='big' || k==='small') o.touched[s.pad.code] = true;
          if(k==='carry'){
            if(carryNeedReason) o.carryNote[s.pad.code] = {reason, prevLeft: carryPrevLeft, at: Date.now()};
            else delete o.carryNote[s.pad.code];
          }
          return o;
        }, padDay);
        this.setState({pad:null, padBuf:'', carryReason:'', carryErr:''});
      },

      isPeer: s.tab==='peer',
      goPeer: ()=>{ this.persist({tab:'peer'}); if(!this.state.peers) this.loadPeers(); },
      reloadPeers: ()=>this.loadPeers(),
      peerBtnText: s.peerLoading ? 'กำลังดึงข้อมูล…' : (pv ? 'รีเฟรช' : 'ดึงข้อมูลสาขาทั้งหมด'),
      hasPeerMsg: !!s.peerMsg, peerMsg: s.peerMsg,
      peerMsgStyle: 'font-size:11.5px;border-radius:11px;padding:9px 12px;margin-top:10px;line-height:1.5;'
        + (s.peerOk ? 'color:#2F6B45;background:#E6F2E9' : 'color:#A33C0A;background:#FDE7E0'),
      hasPeers: !!(pv && peerItems.length), noPeers: !(pv && peerItems.length),
      myGrade, myAvgSale: (pv && pv[branch]) ? nf(Math.round(avgSaleOf(branch))) : '–',
      myGradeNote: 'เกรดจากยอดขายเฉลี่ย 30 วัน · กลุ่ม ' + myGrade + ' มี ' + groupCodes.length + ' สาขา',
      peerHot: String(peerHot),
      myGradeStyle: "font-family:'IBM Plex Mono',monospace;font-weight:700;line-height:1.2;font-size:" + (String(myGrade).length > 2 ? '13px' : '20px'),
      peerGroupNames: otherCodes.length ? ('เทียบกับ: ' + otherCodes.map(c=>nameOf(c) + (isBuf(c) ? ' (บุฟเฟต์)' : '')).join(', ')) : '',
      myIsBuffet: isBuf(branch), buffetNote: 'ร้านบุฟเฟต์ · ยอดใช้ต่อยอดขายมักสูงกว่าร้าน à la carte ควรดูประกอบ',
      hasPeerTop: peerHot > 0 && mySale > 0,
      peerTop: peerItems.filter(p=>p.diff > 10).slice(0,3),
      peerGroupLine: groupCodes.length > 1 ? ('เทียบกับอีก ' + (groupCodes.length-1) + ' สาขาที่ขายต่อวันใกล้เคียงกัน') : 'กลุ่มนี้ยังไม่มีสาขาอื่นให้เทียบ',
      peerVerdict: peerHot ? (peerHot + ' รายการ ใช้มากกว่าสาขาอื่น') : 'ใช้ใกล้เคียงสาขาอื่นทุกรายการ',
      peerVerdictSub: peerHot ? ('3 รายการที่เกินมากที่สุด (คิดที่ยอดขาย 30 วันของเรา) · ดูทั้งหมดด้านล่าง') : 'ไม่มีรายการไหนใช้เกินสาขาอื่นในกลุ่มเกิน 10%',
      peerVerdictStyle: 'padding:12px 14px;border-top:1px solid #F3EADB;' + (peerHot ? 'background:#FDEDE6;color:#A33C0A' : 'background:#E6F2E9;color:#2F6B45'),
      peerHotNote: peerHot ? ('ใช้เปลืองกว่าค่ากลางกลุ่มเกิน 10% อยู่ ' + peerHot + ' รายการ') : 'ไม่มีรายการที่เปลืองกว่ากลุ่มเกิน 10%',
      peerItems, peerRank, peerSelName: peerSel ? peerSel.name : '–',
      myRankText: myRankNo ? ('สาขาของเราอยู่อันดับ ' + myRankNo + ' จาก ' + peerRank.length + ' สาขาทั้งหมด') : 'ยังไม่มีอันดับของสาขานี้',
      gradeBtnA: gbtn(myGradeSet==='A'), gradeBtnB: gbtn(myGradeSet==='B'), gradeBtnC: gbtn(myGradeSet==='C'), gradeBtnAuto: gbtn(!myGradeSet),
      setGradeA: ()=>this.saveGrade(branch,'A'), setGradeB: ()=>this.saveGrade(branch,'B'),
      setGradeC: ()=>this.saveGrade(branch,'C'), setGradeAuto: ()=>this.saveGrade(branch,''),

      goCount: ()=>this.persist({tab:'count'}), goSales: ()=>this.persist({tab:'sales'}),
      goAnalysis: ()=>this.persist({tab:'analysis'}), goHistory: ()=>this.persist({tab:'history'}), goSync: ()=>{ this.persist({tab:'sync'}); this.loadAdmins(); },
      countBadge: !allDone, countBadgeText: String(totalCount-doneCount),
      salesBadge: salesTotal===0,
      analysisBadge: flagCount > 0, analysisBadgeText: String(flagCount),
      tabCount: tabStyle(s.tab==='count'), tabSales: tabStyle(s.tab==='sales'),
      tabAnalysis: tabStyle(s.tab==='analysis'), tabPeer: tabStyle(s.tab==='peer'),
      tabHistory: tabStyle(s.tab==='history'), tabSync: tabStyle(s.tab==='sync')
    };
  }
}
function tabStyle(on){
  return 'position:relative;height:60px;border-radius:15px;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;' +
    (on ? 'background:#FFE3BF;color:#A83B0A;box-shadow:inset 0 0 0 1.5px #F2C190' : 'background:transparent;color:#84705C');
}

export { Component, ITEMS, iso, addDays, parseISO, thDate, thShort, nf, DOW_FULL, DOW, MON };
