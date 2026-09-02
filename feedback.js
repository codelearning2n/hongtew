/* =============================================================================
   feedback.js — ปุ่ม 💬 ส่งความเห็น (ใช้ได้ทุกหน้าในเว็บห้องติว)

   เว็บนี้เป็นหน้าเว็บนิ่งบน GitHub Pages ไม่มีเซิร์ฟเวอร์รับข้อมูล
   จึงใช้วิธี "ประกอบข้อความให้ครบแล้วกดคัดลอก" เพื่อเอาไปวางในแชทที่คุยกันอยู่แล้ว
   ไม่ต้องสมัครอะไร ไม่มีข้อมูลใครถูกส่งไปที่ไหนโดยไม่รู้ตัว

   อยากให้ส่งเข้าอีเมล/ฟอร์มโดยตรง: ใส่ค่าที่ CONFIG ข้างล่าง แล้วปุ่มจะโผล่เอง
   ========================================================================== */
(function(){
  if(window.__FB__) return; window.__FB__='1.0';

  var CONFIG = {
    mail: '',      /* อีเมลปลายทาง — เว้นว่างไว้ = ไม่โชว์ปุ่มส่งเมล (กันอีเมลส่วนตัวขึ้นเว็บสาธารณะ) */
    form: ''       /* ลิงก์ Google Form — ใส่แล้วจะมีปุ่ม "เปิดฟอร์ม" ให้ */
  };

  var D=document, LAST='fbDraft';

  var css=D.createElement('style');
  css.textContent=[
  /* วางเหนือแถบเครื่องมือ ไม่ใช่ข้าง ๆ — แถบนั้นชิดขวาและกว้าง 284px พอจอแคบ 320px จะเลื่อนมาทับ */
  '#fbFab{position:fixed;left:8px;bottom:64px;z-index:99989;border:1.5px solid var(--accent-bd,#e2e8f0);',
  '  background:var(--card,#fff);color:var(--ink,#1e293b);border-radius:999px;height:44px;min-width:44px;',
  '  padding:0 13px;font-size:19px;line-height:1;cursor:pointer;font-family:inherit;',
  '  box-shadow:0 3px 14px rgba(15,23,42,.22);display:flex;align-items:center;gap:6px}',
  '#fbFab:active{transform:scale(.95)}',
  '#fbFab .lb{font-size:14px;font-weight:700;display:none}',
  '@media(min-width:560px){#fbFab .lb{display:inline}}',
  '#fbBack{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99994;display:none;',
  '  align-items:center;justify-content:center;padding:16px}',
  '#fbBack.open{display:flex}',
  '#fbCard{background:var(--card,#fff);color:var(--ink,#1e293b);border-radius:16px;max-width:520px;',
  '  width:100%;max-height:88vh;overflow:auto;box-shadow:0 12px 40px rgba(15,23,42,.35)}',
  '#fbCard .hd{background:linear-gradient(135deg,var(--accent,#4f46e5) 0%,#7c3aed 100%);color:#fff;',
  '  padding:16px 18px;border-radius:16px 16px 0 0;display:flex;align-items:flex-start;',
  '  justify-content:space-between;gap:10px}',
  '#fbCard .hd h3{font-size:1.1rem;margin:0}',
  '#fbCard .hd p{opacity:.9;font-size:.85rem;margin:2px 0 0}',
  '#fbX{background:rgba(255,255,255,.2);border:0;color:#fff;border-radius:10px;width:30px;height:30px;',
  '  font-size:16px;line-height:1;cursor:pointer;flex:0 0 30px;font-family:inherit}',
  '#fbCard .bd{padding:14px 18px 18px}',
  '.fbLbl{font-size:.88rem;font-weight:700;margin:10px 0 5px;display:block}',
  '.fbKinds{display:flex;gap:6px;flex-wrap:wrap}',
  '.fbKind{font-family:inherit;font-size:.86rem;cursor:pointer;border:1.5px solid var(--accent-bd,#c7d2fe);',
  '  background:var(--card,#fff);color:var(--accent-ink,#3730a3);padding:.4rem .8rem;border-radius:999px}',
  '.fbKind.on{background:var(--accent,#4f46e5);color:#fff;border-color:var(--accent,#4f46e5);font-weight:700}',
  '#fbText{width:100%;min-height:8.5rem;padding:.7rem .8rem;border:1.5px solid var(--line,#e2e8f0);',
  '  border-radius:10px;font-family:inherit;font-size:.95rem;line-height:1.6;resize:vertical;',
  '  background:var(--card,#fff);color:var(--ink,#1e293b)}',
  '#fbText:focus{outline:none;border-color:var(--accent,#4f46e5)}',
  '.fbCtx{font-size:.8rem;color:var(--muted,#64748b);background:var(--soft,#f8fafc);border-radius:8px;',
  '  padding:.55rem .7rem;margin-top:.5rem;line-height:1.6;word-break:break-word}',
  '.fbBtns{display:flex;gap:.45rem;flex-wrap:wrap;margin-top:.8rem}',
  '.fbBtn{background:var(--accent,#4f46e5);color:#fff;border:0;border-radius:10px;padding:.7rem 1.1rem;',
  '  font-family:inherit;font-size:.95rem;font-weight:700;cursor:pointer;text-decoration:none;',
  '  display:inline-flex;align-items:center}',
  '.fbBtn.ghost{background:var(--card,#fff);color:var(--accent,#4f46e5);',
  '  border:1.5px solid var(--accent-ghost,#a5b4fc)}',
  '.fbBtn:disabled{opacity:.5;cursor:default}',
  '.fbNote{font-size:.85rem;line-height:1.6;margin-top:.7rem;border-radius:8px;padding:.6rem .7rem;',
  '  background:var(--tip-bg,#ecfdf5);border-left:4px solid var(--tip-bd,#10b981)}',
  '@media print{#fbFab,#fbBack{display:none!important}}'
  ].join('\n');
  D.head.appendChild(css);

  var fab=D.createElement('button'); fab.id='fbFab'; fab.type='button';
  fab.title='ส่งความเห็น / แจ้งปัญหา';
  fab.innerHTML='<span>💬</span><span class="lb">ส่งความเห็น</span>';
  D.body.appendChild(fab);

  var KINDS=[['bug','🐛 เจอบั๊ก'],['want','💡 อยากได้เพิ่ม'],['hard','😵 ตรงนี้งง'],['other','💬 อื่น ๆ']];
  var kind='bug';

  var back=D.createElement('div'); back.id='fbBack';
  back.innerHTML='<div id="fbCard">'+
    '<div class="hd"><div><h3>💬 ส่งความเห็น</h3>'+
      '<p>เจออะไรพัง อยากได้อะไรเพิ่ม บอกได้เลย</p></div>'+
      '<button id="fbX" type="button" title="ปิด">✕</button></div>'+
    '<div class="bd">'+
      '<span class="fbLbl">เรื่องอะไร</span>'+
      '<div class="fbKinds" id="fbKinds">'+
        KINDS.map(function(k,i){ return '<button class="fbKind'+(i===0?' on':'')+
          '" type="button" data-k="'+k[0]+'">'+k[1]+'</button>'; }).join('')+'</div>'+
      '<span class="fbLbl">เล่าให้ฟังหน่อย</span>'+
      '<textarea id="fbText" placeholder="เช่น กดปุ่มนี้แล้วไม่มีอะไรเกิดขึ้น / อยากให้มีสรุปเรื่อง..."></textarea>'+
      '<div class="fbCtx" id="fbCtx"></div>'+
      '<div class="fbBtns" id="fbBtns"></div>'+
      '<div class="fbNote" id="fbNote">📋 กดคัดลอกแล้วเอาไปวางในแชทที่คุยกันอยู่ได้เลย '+
        'ข้อมูลหน้าที่กำลังเปิดกับขนาดจอจะถูกแนบไปด้วย จะได้ตามแก้ถูกจุด</div>'+
    '</div></div>';
  D.body.appendChild(back);

  function ctx(){
    var th='ตามเครื่อง';
    try{ th=D.documentElement.getAttribute('data-theme')||'ตามเครื่อง'; }catch(e){}
    return 'หน้า: '+D.title+'\n'+
           'ที่อยู่: '+decodeURIComponent(location.pathname)+location.search+'\n'+
           'จอ: '+innerWidth+'x'+innerHeight+' · ธีม: '+th+'\n'+
           'เวลา: '+new Date().toLocaleString('th-TH');
  }
  function label(k){ for(var i=0;i<KINDS.length;i++) if(KINDS[i][0]===k) return KINDS[i][1]; return k; }
  function report(){
    return '['+label(kind)+'] จากห้องติว ม.6\n\n'+
      (D.getElementById('fbText').value.trim()||'(ยังไม่ได้พิมพ์อะไร)')+'\n\n'+
      '--- ข้อมูลประกอบ ---\n'+ctx();
  }

  D.getElementById('fbKinds').onclick=function(e){
    var b=e.target.closest('.fbKind'); if(!b) return;
    kind=b.dataset.k;
    [].forEach.call(back.querySelectorAll('.fbKind'),function(x){ x.classList.toggle('on',x===b); });
  };

  /* เก็บร่างไว้ เผลอปิดไปแล้วกลับมาพิมพ์ต่อได้ */
  var ta=D.getElementById('fbText');
  try{ ta.value=localStorage.getItem(LAST)||''; }catch(e){}
  ta.addEventListener('input',function(){ try{ localStorage.setItem(LAST,ta.value); }catch(e){} });

  function buttons(){
    var h='<button class="fbBtn" id="fbCopy" type="button">📋 คัดลอกข้อความ</button>';
    if(CONFIG.mail) h+='<a class="fbBtn ghost" id="fbMail" href="#">✉️ ส่งเมล</a>';
    if(CONFIG.form) h+='<a class="fbBtn ghost" href="'+CONFIG.form+'" target="_blank" rel="noopener">📝 เปิดฟอร์ม</a>';
    D.getElementById('fbBtns').innerHTML=h;

    D.getElementById('fbCopy').onclick=async function(){
      var t=report(), btn=this;
      try{
        await navigator.clipboard.writeText(t);
        btn.textContent='✓ คัดลอกแล้ว เอาไปวางในแชทได้เลย';
        try{ localStorage.removeItem(LAST); }catch(e2){}   /* ส่งไปแล้ว ครั้งหน้าเริ่มใหม่สะอาด ๆ */
      }catch(e){
        /* มือถือบางตัวไม่ให้ใช้คลิปบอร์ด — ให้เลือกเองจากกล่องข้อความแทน */
        ta.value=t; ta.focus(); ta.select();
        btn.textContent='คัดลอกอัตโนมัติไม่ได้ — กดค้างที่กล่องแล้วก๊อปเอง';
      }
      setTimeout(function(){ btn.textContent='📋 คัดลอกข้อความ'; },3000);
    };
    var ml=D.getElementById('fbMail');
    if(ml) ml.onclick=function(){
      ml.href='mailto:'+CONFIG.mail+'?subject='+encodeURIComponent('[ห้องติว] '+label(kind))+
              '&body='+encodeURIComponent(report());
    };
  }

  function open_(){
    D.getElementById('fbCtx').textContent=ctx();
    buttons();
    back.classList.add('open');
    setTimeout(function(){ ta.focus(); },50);
  }
  function close_(){ back.classList.remove('open'); }
  fab.onclick=open_;
  D.getElementById('fbX').onclick=close_;
  back.onclick=function(e){ if(e.target===back) close_(); };
  D.addEventListener('keydown',function(e){
    if(e.key==='Escape' && back.classList.contains('open')) close_(); });
})();
