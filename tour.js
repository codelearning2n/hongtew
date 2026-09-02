/* =============================================================================
   tour.js — ทัวร์แนะนำปุ่ม/โซน แบบ tutorial ในเกม (สปอตไลต์ชี้ทีละจุด)

   · เด้งเองครั้งแรกที่เข้าหน้าแต่ละแบบ (จำแยกกัน: หน้ารวม / หน้าเรียน / หน้าถามเนื้อหา)
   · กดปุ่ม ❓ มุมซ้ายล่างเพื่อดูซ้ำได้ตลอด
   · ขั้นตอนมาจาก 2 ทาง
       1) ชุดมาตรฐานตามชนิดหน้า (ปุ่มลอย แถบเครื่องมือ ฯลฯ) — อยู่ในไฟล์นี้
       2) หน้าไหนอยากอธิบายโซนของตัวเอง ใส่ data-tour="หัวข้อ|คำอธิบาย" ที่ธาตุนั้น
          tour.js จะเก็บมาต่อท้ายให้เอง ตามลำดับที่อยู่ในหน้า
   ========================================================================== */
(function(){
  if(window.__TOUR__) return; window.__TOUR__='1.0';
  var D=document;

  var css=D.createElement('style');
  css.textContent=[
  '#tourFab{position:fixed;left:8px;bottom:116px;z-index:99989;border:1.5px solid var(--accent-bd,#e2e8f0);',
  '  background:var(--card,#fff);color:var(--ink,#1e293b);border-radius:999px;height:44px;min-width:44px;',
  '  padding:0 13px;font-size:19px;line-height:1;cursor:pointer;font-family:inherit;',
  '  box-shadow:0 3px 14px rgba(15,23,42,.22);display:flex;align-items:center;gap:6px}',
  '#tourFab:active{transform:scale(.95)}',
  '#tourFab .lb{font-size:14px;font-weight:700;display:none}',
  '@media(min-width:560px){#tourFab .lb{display:inline}}',
  /* ม่านทึบทั้งจอ เจาะรูตรงจุดที่ชี้ ด้วยเงาที่แผ่กว้างมาก */
  '#tourHole{position:fixed;z-index:99995;border-radius:14px;pointer-events:none;',
  '  box-shadow:0 0 0 9999px rgba(15,23,42,.74), 0 0 0 3px var(--accent,#4f46e5) inset;',
  '  transition:top .25s,left .25s,width .25s,height .25s;display:none}',
  '#tourHole.on{display:block}',
  '#tourSkim{position:fixed;inset:0;z-index:99994;display:none}',
  '#tourSkim.on{display:block}',
  '#tourTip{position:fixed;z-index:99996;max-width:330px;width:calc(100% - 24px);',
  '  background:var(--card,#fff);color:var(--ink,#1e293b);border-radius:14px;padding:14px 16px 12px;',
  '  box-shadow:0 12px 40px rgba(15,23,42,.4);display:none;font-family:inherit}',
  '#tourTip.on{display:block}',
  '#tourTip h4{margin:0 0 4px;font-size:1rem;color:var(--accent-head,#312e81)}',
  '#tourTip p{margin:0;font-size:.92rem;line-height:1.65}',
  '#tourBar{display:flex;align-items:center;gap:8px;margin-top:12px}',
  '#tourNo{font-size:.8rem;color:var(--muted,#64748b);font-weight:700;margin-right:auto}',
  '.tourBtn{border:0;border-radius:9px;padding:.55rem 1rem;font-family:inherit;font-size:.9rem;',
  '  font-weight:700;cursor:pointer;background:var(--accent,#4f46e5);color:#fff}',
  '.tourBtn.ghost{background:transparent;color:var(--muted,#64748b);padding:.55rem .6rem}',
  '@media print{#tourFab,#tourHole,#tourTip,#tourSkim{display:none!important}}'
  ].join('\n');
  D.head.appendChild(css);

  var fab=D.createElement('button'); fab.id='tourFab'; fab.type='button';
  fab.title='ดูว่าปุ่มไหนทำอะไรได้บ้าง';
  fab.innerHTML='<span>❓</span><span class="lb">วิธีใช้</span>';
  D.body.appendChild(fab);

  var skim=D.createElement('div'); skim.id='tourSkim';
  var hole=D.createElement('div'); hole.id='tourHole';
  var tip =D.createElement('div'); tip.id='tourTip';
  tip.innerHTML='<h4 id="tourT"></h4><p id="tourD"></p>'+
    '<div id="tourBar"><span id="tourNo"></span>'+
    '<button class="tourBtn ghost" id="tourSkip" type="button">ข้าม</button>'+
    '<button class="tourBtn" id="tourNext" type="button">ถัดไป</button></div>';
  D.body.appendChild(skim); D.body.appendChild(hole); D.body.appendChild(tip);

  /* ── ชุดขั้นตอนมาตรฐาน แยกตามชนิดหน้า ── */
  function q(s){ return D.querySelector(s); }
  var kindKey, steps=[];

  function std(){
    var s=[];
    var onAsk=/(^|\/)ask\.html$/.test(location.pathname);
    var onHome=!q('#kitui-nav') && !onAsk;
    kindKey = onAsk ? 'ask' : (onHome ? 'home' : 'study');

    if(onHome){
      s.push(['.hero a[href="ask.html"]','🔎 ถามเนื้อหา',
        'พิมพ์สิ่งที่อยากรู้ แล้วมันจะไปค้นในสรุปทุกวิชาให้ พร้อมบอกเลขหน้าสไลด์ที่อ้างอิง']);
      s.push(['#q','ช่องค้นหา','พิมพ์ชื่อเรื่องหรือชื่อวิชา เพื่อกรองรายการหน้าเรียนด้านล่างให้แคบลง']);
      s.push(['.grid','การ์ดหน้าเรียน','แต่ละใบคือหน้าเรียนหรือชุดข้อสอบ กดเข้าไปได้เลย ไม่ต้องล็อกอิน']);
    }else if(onAsk){
      s.push(['#subs','① เลือกวิชา','โหลดเฉพาะวิชาที่เลือก จะได้ไม่กินเน็ต ตัวเลขคือจำนวนชิ้นเนื้อหาในวิชานั้น']);
      s.push(['#q','② พิมพ์สิ่งที่อยากรู้',
        'พิมพ์เป็นคำถามหรือแค่คำสำคัญก็ได้ ถ้าไม่เจอมันจะบอกตรง ๆ ว่าไม่มีในสรุป ไม่เดาให้']);
      s.push(['#aicard','③ ให้ AI ช่วยต่อ',
        'กดคัดลอกแล้วเอาไปวางใน AI ตัวไหนก็ได้ ฟรี ไม่ต้องใช้คีย์ — เนื้อหาที่ค้นเจอจะถูกแนบไปด้วย']);
    }else{
      s.push(['#kitui-back','← กลับ','กลับไปหน้ารวมวิชา กดได้ทุกเมื่อ ปุ่มนี้ลอยอยู่ตลอดไม่หายไปไหน']);
      s.push(['#kitui-ask','🔎 ถาม AI',
        'สงสัยตรงไหนกดตรงนี้ได้เลย ไม่ต้องย้อนกลับหน้ารวม และมันเลือกวิชาของหน้านี้ให้อัตโนมัติ']);
      if(q('.tabs')) s.push(['.tabs','แท็บหัวข้อ','สลับหัวข้อในหน้านี้ ถ้ามีหลายอันเลื่อนซ้ายขวาได้']);
      s.push(['#kitui-bar','แถบเครื่องมือ',
        '⚙️ ย่อ/ขยายแถบ · 🌙 โหมดมืด · A− A+ ขนาดตัวหนังสือ · บางวิชามี ✏️ ที่ทด กับ 🧮 เครื่องคิดเลขด้วย']);
    }
    s.push(['#fbFab','💬 ส่งความเห็น','เจอบั๊ก อยากได้อะไรเพิ่ม หรือตรงไหนงง กดบอกได้เลย ระบบแนบให้เองว่าอยู่หน้าไหน']);
    if(q('#updFab')) s.push(['#updFab','📜 มีอะไรใหม่','กดดูว่าเว็บอัปเดตอะไรไปบ้าง จุดแดงแปลว่ามีของใหม่ที่ยังไม่ได้อ่าน']);
    s.push(['#tourFab','❓ วิธีใช้','ลืมว่าปุ่มไหนทำอะไร กดตรงนี้ดูซ้ำได้ตลอด']);
    return s;
  }

  /* หน้าไหนอยากอธิบายโซนของตัวเอง ใส่ data-tour="หัวข้อ|คำอธิบาย" */
  function custom(){
    return [].slice.call(D.querySelectorAll('[data-tour]')).map(function(el){
      var p=String(el.getAttribute('data-tour')).split('|');
      return [el, p[0]||'', p[1]||''];
    });
  }

  function build(){
    var s=std().concat(custom());
    return s.filter(function(x){
      var el = typeof x[0]==='string' ? q(x[0]) : x[0];
      if(!el) return false;
      x[0]=el;
      return true;
    });
  }

  var idx=0;
  function place(){
    var st=steps[idx]; if(!st) return;
    var el=st[0], r=el.getBoundingClientRect();
    var pad=6;
    var top=Math.max(4,r.top-pad), left=Math.max(4,r.left-pad);
    var w=Math.min(r.width+pad*2, innerWidth-8), h=r.height+pad*2;
    hole.style.top=top+'px'; hole.style.left=left+'px';
    hole.style.width=w+'px'; hole.style.height=h+'px';

    D.getElementById('tourT').textContent=st[1];
    D.getElementById('tourD').textContent=st[2];
    D.getElementById('tourNo').textContent=(idx+1)+' / '+steps.length;
    D.getElementById('tourNext').textContent = idx===steps.length-1 ? 'จบ' : 'ถัดไป';

    tip.classList.add('on');
    var th=tip.offsetHeight, tw=tip.offsetWidth;
    var below=top+h+12, above=top-th-12;
    /* วางใต้จุดที่ชี้ ถ้าล่างไม่พอค่อยขึ้นไปบน ถ้าไม่พอทั้งคู่ก็กลางจอ */
    var ty = (below+th<innerHeight-8) ? below : (above>8 ? above : Math.max(8,(innerHeight-th)/2));
    var tx = Math.min(Math.max(8, left+w/2-tw/2), innerWidth-tw-8);
    tip.style.top=ty+'px'; tip.style.left=tx+'px';
  }
  function show(i){
    idx=i;
    var st=steps[idx]; if(!st) return stop();
    try{ st[0].scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){}
    setTimeout(place,260);
  }
  function start(){
    steps=build();
    if(!steps.length) return;
    skim.classList.add('on'); hole.classList.add('on');
    show(0);
  }
  function stop(){
    skim.classList.remove('on'); hole.classList.remove('on'); tip.classList.remove('on');
    try{ localStorage.setItem('tourDone:'+kindKey,'1'); }catch(e){}
  }

  D.getElementById('tourNext').onclick=function(){ (idx>=steps.length-1) ? stop() : show(idx+1); };
  D.getElementById('tourSkip').onclick=stop;
  skim.onclick=stop;
  D.addEventListener('keydown',function(e){
    if(!hole.classList.contains('on')) return;
    if(e.key==='Escape') stop();
    if(e.key==='ArrowRight'||e.key===' ') { e.preventDefault(); D.getElementById('tourNext').click(); }
  });
  addEventListener('resize',function(){ if(hole.classList.contains('on')) place(); });
  fab.onclick=start;

  /* เด้งเองครั้งแรกของหน้าแต่ละแบบ — รอให้ปุ่มลอยอื่น ๆ ถูกสร้างเสร็จก่อน */
  setTimeout(function(){
    steps=build();
    if(!steps.length) return;
    var done=null; try{ done=localStorage.getItem('tourDone:'+kindKey); }catch(e){}
    if(!done) start();
  },900);
})();
