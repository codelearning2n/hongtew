/* =============================================================================
   updates.js — หน้าต่าง "มีอะไรใหม่" (ใช้ร่วมกันทุกหน้าในราก site/)
     · เด้งเองเมื่อมีรายการใหม่กว่าที่เคยกดรับทราบ
     · ปุ่มลอย 📜 มุมขวาบน ไว้เปิดดูย้อนหลังตอนไหนก็ได้ (มีจุดแดงถ้ายังไม่ได้อ่าน)
     · แหล่งข้อมูล = updates.json ข้าง ๆ ไฟล์นี้ (เพิ่มรายการใหม่ไว้บนสุด id ห้ามซ้ำ)

   ใส่ในหน้าไหนก็ได้ด้วย  <script src="updates.js"></script>
   ถ้าหน้านั้นมีปุ่ม/ลิงก์ id="updLink" อยู่แล้ว จะถูกผูกให้เปิดหน้าต่างนี้ด้วยอัตโนมัติ
   ========================================================================== */
(function(){
  if(window.__UPD__) return; window.__UPD__='1.0';
  var D=document, KEY='seenUpd', all=[];

  /* หา updates.json จากตำแหน่งของไฟล์สคริปต์เอง — หน้าไหนอยู่ลึกแค่ไหนก็ยังหาเจอ */
  var here=(function(){
    try{
      var s=D.currentScript || (function(){var a=D.getElementsByTagName('script');return a[a.length-1];})();
      return s.src.replace(/[^/]*$/,'');
    }catch(e){ return ''; }
  })();

  var css=D.createElement('style');
  css.textContent=[
  '#updBack{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99993;display:none;',
  '  align-items:center;justify-content:center;padding:16px}',
  '#updBack.open{display:flex}',
  '#updCard{background:var(--card,#fff);color:var(--ink,#1e293b);border-radius:16px;max-width:520px;',
  '  width:100%;max-height:82vh;overflow:auto;box-shadow:0 12px 40px rgba(15,23,42,.35)}',
  '#updCard .hd{background:linear-gradient(135deg,var(--accent,#4f46e5) 0%,#7c3aed 100%);color:#fff;',
  '  padding:16px 18px;border-radius:16px 16px 0 0;position:sticky;top:0;display:flex;',
  '  align-items:flex-start;justify-content:space-between;gap:10px}',
  '#updCard .hd h3{font-size:1.1rem;margin:0}',
  '#updCard .hd p{opacity:.9;font-size:.85rem;margin:2px 0 0}',
  '#updX{background:rgba(255,255,255,.2);border:0;color:#fff;border-radius:10px;width:30px;height:30px;',
  '  font-size:16px;line-height:1;cursor:pointer;flex:0 0 30px;font-family:inherit}',
  '#updX:hover{background:rgba(255,255,255,.34)}',
  '#updCard .bd{padding:14px 18px 18px}',
  '.updItem{border-left:3px solid var(--accent-bd,#c7d2fe);padding:2px 0 2px 12px;margin:0 0 14px}',
  '.updItem h4{font-size:.98rem;margin:0 0 2px;color:var(--accent-head,#312e81)}',
  '.updItem .dt{font-size:.76rem;color:var(--muted,#64748b);font-weight:700}',
  '.updItem ul{margin:6px 0 0;padding-left:18px;font-size:.9rem;line-height:1.65}',
  '.updItem li{margin-bottom:3px}',
  '#updOk{width:100%;background:var(--accent,#4f46e5);color:#fff;border:0;border-radius:10px;',
  '  padding:11px;font-family:inherit;font-size:.95rem;font-weight:700;cursor:pointer;margin-top:4px}',
  '#updLink{background:none;border:0;color:#fff;font-family:inherit;font-size:.88rem;font-weight:600;',
  '  cursor:pointer;text-decoration:underline;opacity:.92;padding:0;margin-top:10px;display:inline-block}',
  /* ปุ่มลอยเปิดดูย้อนหลัง — วางมุมขวาบน คู่กับปุ่มกลับที่อยู่มุมซ้ายบน */
  '#updFab{position:fixed;top:8px;right:8px;z-index:99992;border:1px solid var(--line,#e2e8f0);',
  '  background:var(--card,#fff);color:var(--ink,#1e293b);border-radius:999px;height:38px;',
  '  min-width:38px;padding:0 11px;font-size:17px;line-height:1;cursor:pointer;font-family:inherit;',
  '  box-shadow:0 2px 10px rgba(15,23,42,.18);display:flex;align-items:center;gap:5px}',
  '#updFab:active{transform:scale(.95)}',
  '#updFab .lb{font-size:12.5px;font-weight:700;display:none}',
  '@media(min-width:520px){#updFab .lb{display:inline}}',
  '#updFab .dot{position:absolute;top:-3px;right:-3px;width:11px;height:11px;border-radius:50%;',
  '  background:#dc2626;border:2px solid var(--card,#fff);display:none}',
  '#updFab.new .dot{display:block}',
  '@media print{#updBack,#updFab{display:none!important}}'
  ].join('\n');
  D.head.appendChild(css);

  var back=D.createElement('div'); back.id='updBack';
  back.innerHTML='<div id="updCard">'+
    '<div class="hd"><div><h3>🆕 มีอะไรใหม่</h3><p id="updSub"></p></div>'+
    '<button id="updX" type="button" title="ปิด">✕</button></div>'+
    '<div class="bd"><div id="updBody"></div><button id="updOk" type="button">รับทราบ</button></div>'+
    '</div>';
  D.body.appendChild(back);

  var fab=D.createElement('button'); fab.id='updFab'; fab.type='button';
  fab.title='ดูว่ามีอะไรใหม่บ้าง';
  fab.innerHTML='<span>📜</span><span class="lb">มีอะไรใหม่</span><span class="dot"></span>';
  D.body.appendChild(fab);

  function seen(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function markSeen(){
    try{ if(all[0]) localStorage.setItem(KEY, all[0].id); }catch(e){}
    fab.classList.remove('new');
  }
  function open_(list,total){
    D.getElementById('updSub').textContent =
      list.length===total ? 'อัปเดตทั้งหมด '+total+' รายการ'
                          : 'มี '+list.length+' อย่างใหม่ตั้งแต่ครั้งก่อน';
    D.getElementById('updBody').innerHTML = list.map(function(u){
      return '<div class="updItem"><div class="dt">'+u.date+'</div><h4>'+u.title+'</h4>'+
        '<ul>'+u.items.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>';
    }).join('');
    back.classList.add('open');
  }
  function close_(){ back.classList.remove('open'); markSeen(); }

  D.getElementById('updOk').onclick=close_;
  D.getElementById('updX').onclick=close_;
  back.onclick=function(e){ if(e.target===back) close_(); };
  D.addEventListener('keydown',function(e){
    if(e.key==='Escape' && back.classList.contains('open')) close_(); });
  fab.onclick=function(){ if(all.length) open_(all,all.length); };

  fetch(here+'updates.json?v='+Date.now()).then(function(r){return r.json();}).then(function(d){
    all=d; if(!d.length){ fab.style.display='none'; return; }
    var lnk=D.getElementById('updLink');
    if(lnk) lnk.onclick=function(){ open_(all,all.length); };
    var last=seen();
    if(last===d[0].id) return;                    /* อ่านครบแล้ว ไม่ต้องเด้ง ไม่ต้องติดจุดแดง */
    fab.classList.add('new');
    var i=d.findIndex(function(u){return u.id===last;});
    var fresh=(last===null||i<0) ? d.slice(0,3) : d.slice(0,i);  /* เข้าครั้งแรก โชว์ 3 อันล่าสุดพอ */
    if(fresh.length) open_(fresh,d.length);
  }).catch(function(){ fab.style.display='none'; });
})();
