/* =============================================================================
   ask-panel.js — แผงถาม AI แบบเลื่อนออกมาข้าง ๆ (side panel) เหมือน Gemini
   -----------------------------------------------------------------------------
   ทำไมต้องมี: เดิมกดปุ่ม "🔎 ถาม AI" แล้ว **เด้งออกจากหน้าที่กำลังอ่าน** ไปหน้า ask.html
   เจ้าของอยากให้ถามได้ทั้งที่ยังเห็นเนื้อหาอยู่ จึงทำเป็นแผงข้างแทน

   วิธีทำ: แผงนี้ **ไม่ได้เขียนเครื่องค้นหาใหม่** แต่ฝัง ask.html เข้ามาใน iframe
   โดยส่ง ?panel=1 ไปบอกให้มันซ่อนหัวเรื่อง/ปุ่มลอยของตัวเอง แล้วบีบให้อยู่ในแผงแคบ ๆ
   -> แก้เครื่องค้นหาที่เดียวคือ ask.html เหมือนเดิม ไม่ต้องตามแก้สองที่

   โหลดโดย _kit/ui-controls.js (เหมือน feedback.js / tour.js)
   ทำงานเฉพาะตอนเปิดจากเว็บ (พาธมี /app/) เพราะ iframe + fetch ใช้กับ file:// ไม่ได้
   ============================================================================= */
(function () {
  if (window.__ASKPANEL__) return;
  window.__ASKPANEL__ = '1.0';

  var D = document;

  /* ---------- หา URL ของ ask.html ---------- */
  function rootOf() {
    var attr = D.body.getAttribute('data-home');
    if (attr) return attr.replace(/index\.html$/, '');
    try {
      var p = decodeURIComponent(location.pathname);
      var i = p.indexOf('/app/');
      return i < 0 ? null : p.slice(0, i + 1);
    } catch (e) { return null; }
  }
  var ROOT = rootOf();
  if (!ROOT) return;                       /* เปิดไฟล์จากเครื่องตรง ๆ — ไม่มีเว็บให้ฝัง */
  if (/(^|\/)ask\.html$/.test(location.pathname)) return;   /* อยู่หน้าถามอยู่แล้ว */

  /* วิชาของหน้านี้ — data-ask ระบุเองได้ ไม่งั้นเดาจากโฟลเดอร์ */
  var FOLDER2KEY = {
    'bio': 'bio', 'physics': 'physics', 'math': 'math', 'chemist': 'chem',
    'christ': 'christ', 'islam': 'islam', 'hindu': 'hindu',
    'history': 'history', 'history t.2': 'history',
    'eng': 'eng', 'ภาษาไทย': 'thai', 'music': 'music', 'tsam': 'tsam',
    '3d-model': 'model3d', 'การงานอาชีพ': 'work'
  };
  function subjectKey() {
    var a = D.body.getAttribute('data-ask');
    if (a) return a;
    try {
      var p = decodeURIComponent(location.pathname);
      var i = p.indexOf('/app/');
      if (i < 0) return '';
      var folder = p.slice(i + 5).split('/')[0].toLowerCase();
      return FOLDER2KEY[folder] || '';
    } catch (e) { return ''; }
  }

  /* ---------- สไตล์ ---------- */
  var CSS = [
    '#askp{position:fixed;top:0;right:0;bottom:0;width:min(26rem,100vw);z-index:2147483000;',
    '  display:flex;flex-direction:column;background:var(--card,#fff);color:var(--ink,#111);',
    '  box-shadow:-6px 0 28px rgba(0,0,0,.28);transform:translateX(102%);',
    '  transition:transform .22s ease;font-family:inherit}',
    '#askp.open{transform:none}',
    '#askp .aph{display:flex;align-items:center;gap:.5rem;padding:.5rem .6rem;',
    '  border-bottom:1px solid var(--line,#ddd);background:var(--soft,#f6f6f6);flex:0 0 auto}',
    '#askp .aph b{flex:1;font-size:1rem}',
    '#askp .aph button,#askp .aph a{border:1px solid var(--line,#ccc);background:var(--card,#fff);',
    '  color:inherit;border-radius:8px;padding:4px 9px;font:inherit;font-size:.85rem;',
    '  cursor:pointer;text-decoration:none;line-height:1.6}',
    '#askp .aph button:hover,#askp .aph a:hover{border-color:var(--accent,#888)}',
    '#askp iframe{flex:1 1 auto;width:100%;border:0;background:var(--bg,#fff)}',
    '#askp .apg{position:absolute;left:-4px;top:0;bottom:0;width:9px;cursor:ew-resize;z-index:2}',
    '@media(max-width:640px){#askp .apg{display:none}}',
    '#askp-scrim{position:fixed;inset:0;background:rgba(0,0,0,.28);z-index:2147482999;',
    '  opacity:0;pointer-events:none;transition:opacity .22s}',
    '#askp-scrim.on{opacity:1;pointer-events:auto}',
    '@media(min-width:641px){#askp-scrim{display:none}}',
    /* ปุ่มลอยเปิดแผง — เผื่อหน้าไหนไม่มีปุ่มถาม AI ของ KIT UI */
    '#askp-fab{position:fixed;right:.6rem;top:50%;transform:translateY(-50%);z-index:2147482998;',
    '  border:0;border-radius:999px 0 0 999px;padding:.7rem .5rem .7rem .7rem;cursor:pointer;',
    '  background:var(--accent,#4b5bd6);color:#fff;font:inherit;font-size:1.1rem;',
    '  box-shadow:0 2px 10px rgba(0,0,0,.3);display:none}',
    'body.askp-open{overflow:hidden}',
    '@media(min-width:641px){body.askp-open{overflow:auto}}'
  ].join('\n');

  var st = D.createElement('style'); st.id = 'askp-css'; st.textContent = CSS;
  D.head.appendChild(st);

  /* ---------- สร้างแผง ---------- */
  var scrim = D.createElement('div'); scrim.id = 'askp-scrim';
  var box = D.createElement('div'); box.id = 'askp';
  box.setAttribute('role', 'complementary');
  box.setAttribute('aria-label', 'ถามเนื้อหากับ AI');
  box.innerHTML =
    '<div class="apg" id="askp-grip" title="ลากเพื่อปรับความกว้าง"></div>' +
    '<div class="aph">' +
      '<b>🔎 ถามเนื้อหา</b>' +
      '<a id="askp-full" target="_blank" rel="noopener" title="เปิดเป็นหน้าเต็ม">⤢ เต็มจอ</a>' +
      '<button id="askp-close" title="ปิดแผง (Esc)">✕ ปิด</button>' +
    '</div>';
  var frame = D.createElement('iframe');
  frame.id = 'askp-frame';
  frame.setAttribute('title', 'ค้นเนื้อหาและถาม AI');
  frame.setAttribute('loading', 'lazy');
  box.appendChild(frame);

  var fab = D.createElement('button');
  fab.id = 'askp-fab'; fab.type = 'button';
  fab.title = 'ถาม AI เรื่องที่กำลังอ่านอยู่';
  fab.textContent = '🔎';

  D.body.appendChild(scrim); D.body.appendChild(box); D.body.appendChild(fab);

  /* ---------- ที่อยู่ของ ask.html ---------- */
  function askURL(panel) {
    var q = ['from=' + encodeURIComponent(location.pathname)];
    var s = subjectKey();
    if (s) q.unshift('s=' + encodeURIComponent(s));
    if (panel) q.push('panel=1');
    return ROOT + 'ask.html?' + q.join('&');
  }
  D.getElementById('askp-full').href = askURL(false);

  /* ---------- เปิด/ปิด ---------- */
  var loaded = false;
  function open() {
    if (!loaded) { frame.src = askURL(true); loaded = true; }   /* โหลดครั้งแรกที่กดเท่านั้น */
    box.classList.add('open'); scrim.classList.add('on');
    D.body.classList.add('askp-open');
    try { localStorage.setItem('askp-open', '1'); } catch (e) {}
  }
  function close() {
    box.classList.remove('open'); scrim.classList.remove('on');
    D.body.classList.remove('askp-open');
    try { localStorage.setItem('askp-open', '0'); } catch (e) {}
  }
  function toggle() { box.classList.contains('open') ? close() : open(); }

  D.getElementById('askp-close').onclick = close;
  scrim.onclick = close;
  fab.onclick = toggle;
  D.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.classList.contains('open')) close();
  });

  /* ให้ปุ่ม "🔎 ถาม AI" ของ KIT UI เปิดแผงแทนการเด้งออกจากหน้า
     (ถ้าไฟล์นี้โหลดไม่ทัน ปุ่มก็ยังเป็นลิงก์ธรรมดาใช้ได้เหมือนเดิม) */
  function wireKitButton() {
    var a = D.getElementById('kitui-ask');
    if (!a) return false;
    a.addEventListener('click', function (e) {
      e.preventDefault(); toggle();
    });
    a.setAttribute('title', 'ถาม AI เรื่องที่กำลังอ่านอยู่ (เปิดเป็นแผงข้าง)');
    return true;
  }
  if (!wireKitButton()) {
    /* KIT UI อาจยังไม่วางปุ่ม — รอสักครู่แล้วลองใหม่ ถ้ายังไม่มีค่อยโชว์ปุ่มลอยของเราเอง */
    var tries = 0;
    var iv = setInterval(function () {
      if (wireKitButton() || ++tries > 20) {
        clearInterval(iv);
        if (!D.getElementById('kitui-ask')) fab.style.display = 'block';
      }
    }, 150);
  }

  /* ---------- ลากขอบซ้ายปรับความกว้าง (เฉพาะจอใหญ่) ---------- */
  (function () {
    var grip = D.getElementById('askp-grip'), dragging = false, x0 = 0, w0 = 0;
    try {
      var saved = parseInt(localStorage.getItem('askp-w') || '', 10);
      if (saved >= 280 && saved <= 900) box.style.width = saved + 'px';
    } catch (e) {}
    grip.addEventListener('pointerdown', function (e) {
      dragging = true; x0 = e.clientX; w0 = box.getBoundingClientRect().width;
      grip.setPointerCapture(e.pointerId); e.preventDefault();
    });
    grip.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var w = Math.min(Math.max(w0 + (x0 - e.clientX), 280), Math.min(900, innerWidth));
      box.style.width = w + 'px';
    });
    grip.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      try { localStorage.setItem('askp-w', Math.round(box.getBoundingClientRect().width)); } catch (er) {}
      try { grip.releasePointerCapture(e.pointerId); } catch (er) {}
    });
  })();

  /* ---------- ให้หน้าใน iframe สั่งปิดแผงได้ ---------- */
  window.addEventListener('message', function (e) {
    if (e.source !== frame.contentWindow) return;      /* รับเฉพาะจาก iframe ของเราเอง */
    if (e.data === 'askp-close') close();
  });
})();
