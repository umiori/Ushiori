/* album.js v4：外面是「書架上的相本」（每個分類一本，點封面打開），裡面是「滾輪式」3D 轉盤（拖曳旋轉、自動轉、點中間那張看大圖）。
   用法：index.html 最後 </body> 前面有 <script src="album.js"></script> 就好（取代舊的 album.js）。 */
(function(){
  /* ===== 可以改的設定 ===== */
  const NAMES=['ALL','LD','SD','uori','Gift Art','🐶🐰']; // 抓不到分類按鈕時用這份
  const COVERS=['#a9c7ee','#c9b3e0','#f5b8cf','#bfe3cf','#f6dca0','#d9cfe8']; // 封面顏色，依序輪流用
  const AUTO_MS=3200;   // 自動轉動的間隔（毫秒）；設 0＝不自動轉
  const INK="#3b3438";  // 粗線條顏色
  /* ======================== */
  const $=id=>document.getElementById(id);
  const SBU=SB_URL.replace(/\/$/,''),NAME_RE=/^[A-Za-z0-9_-]{6,60}\.jpg$/;
  const gURL=f=>NAME_RE.test(f||'')?SBU+'/storage/v1/object/public/gallery/'+f:'';

  const st=document.createElement('style');st.textContent=`
  #p-gallery #grid,#p-gallery #cats{display:none}
  #album{margin:0 6px 10px;--ink:${INK}}
  #album .stg{position:relative;border-radius:18px;overflow:hidden;border:3px solid var(--ink);perspective:1400px;background:linear-gradient(180deg,#f1eaf8,#fbf8fd)}
  #album .shelf{padding:14px 0 6px}
  #album .row{display:flex;justify-content:space-evenly;align-items:flex-end;padding:0 10px}
  #album .board{height:13px;margin:0 8px 22px;background:#fff;border:2.5px solid var(--ink);border-radius:8px;box-shadow:0 7px 10px rgba(120,100,150,.25)}
  #album .cv{position:relative;width:42%;aspect-ratio:3/4.1;container-type:inline-size;cursor:pointer;border:.9cqw solid var(--ink);border-radius:2cqw 5cqw 5cqw 2cqw;background:var(--c,#c9b3e0);box-shadow:3.5cqw 4cqw 0 rgba(90,70,120,.18);margin-bottom:-2px;overflow:hidden;transform-origin:0 0}
  #album .cv::before{content:"";position:absolute;left:9cqw;top:0;bottom:0;width:4.4cqw;background:#5a3d35;border-left:.6cqw solid var(--ink);border-right:.6cqw solid var(--ink)}
  #album .cv .cp{position:absolute;left:19cqw;right:9cqw;top:10cqw;background:#fff;padding:3cqw 3cqw 7cqw;border:.7cqw solid var(--ink);border-radius:1.2cqw;line-height:0;transform:rotate(2.5deg)}
  #album .cv .cp img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#eadff3}
  #album .cv .cp.no{aspect-ratio:1/1.1;display:flex;align-items:center;justify-content:center;line-height:1;font-size:12cqw;color:#d8c5e6}
  #album .cv .ct{position:absolute;right:7cqw;bottom:9cqw;left:19cqw;text-align:right;font-family:"Segoe Script","Bradley Hand","Noto Sans TC",cursive;font-weight:700;font-size:8.5cqw;color:var(--ink);line-height:1.15;word-break:break-all}
  #album .cv .cn{position:absolute;right:7cqw;bottom:4cqw;font-size:5cqw;color:rgba(59,52,56,.7)}
  #album .room{display:none;padding:12px 0 16px;position:relative}
  #album .rh{display:flex;align-items:center;justify-content:space-between;padding:0 12px 6px;gap:8px}
  #album .rb,#album .bt{border:2px solid var(--ink);border-radius:99px;background:#f9d5e3;color:var(--ink);cursor:pointer;font-size:.74rem;padding:5px 12px}
  #album .rt{font-size:.9rem;color:#5b4358;flex:1;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #album .rc{font-size:.72rem;color:#7a5a82;min-width:44px;text-align:right}
  #album .wh{container-type:inline-size;position:relative;height:104cqw;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:grab;transform-style:preserve-3d;perspective:1100px;overflow:hidden}
  #album .wp{position:absolute;inset:0;transform-style:preserve-3d}
  #album .cd{position:absolute;left:50%;top:50%;width:56cqw;margin-left:-28cqw;margin-top:-37cqw;aspect-ratio:3/4;background:#fff;border:.8cqw solid var(--ink);border-radius:2cqw;padding:4cqw 4cqw 11cqw;box-shadow:1.6cqw 1.8cqw 0 rgba(120,100,150,.3);will-change:transform}
  #album .cd::before{content:"";position:absolute;top:-3.6cqw;left:50%;width:15cqw;height:5.4cqw;margin-left:-7.5cqw;transform:rotate(-5deg);background:rgba(246,222,160,.93);border:.5cqw solid var(--ink)}
  #album .cd .ph{position:relative;width:100%;height:100%;background:#f0e8f7;display:flex;align-items:center;justify-content:center;overflow:hidden;border:.4cqw solid rgba(59,52,56,.35)}
  #album .cd img{max-width:100%;max-height:100%;display:block;pointer-events:none}
  #album .cd.lk img{filter:blur(14px)}
  #album .cd .soon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:4cqw;letter-spacing:.2em;text-shadow:0 1px 5px rgba(60,30,80,.7)}
  #album .cd .dt{position:absolute;left:0;right:0;bottom:3.4cqw;text-align:center;font-family:"Segoe Script","Bradley Hand",cursive;font-size:4cqw;color:#8a7a95}
  #album .info{text-align:center;padding:6px 16px 0;min-height:70px}
  #album .info b{display:block;font-family:"Segoe Script","Bradley Hand","Noto Sans TC",cursive;font-size:1.05rem;color:#a8567a}
  #album .info span{display:block;font-size:.78rem;color:#7a6a8a;margin-top:2px}
  #album .ctl{display:flex;justify-content:center;align-items:center;gap:16px;margin-top:8px}
  #album .ctl button{width:36px;height:36px;border:2px solid var(--ink);border-radius:50%;background:#f9d5e3;color:var(--ink);font-size:1rem;cursor:pointer;padding:0}
  #album .ctl .bt{width:auto;height:auto;border-radius:99px}
  #album .tip{font-size:.62rem;color:#8a7a95;text-align:center;margin-top:6px}
  #album .empty{padding:60px 20px;color:#7a5a82;font-size:.8rem;text-align:center}
  #album .clone{position:absolute;z-index:20;transform-origin:0 0;pointer-events:none}`;
  document.head.appendChild(st);

  const al=document.createElement('div');al.id='album';
  al.innerHTML=`<div class="stg" id="stg"><div class="shelf" id="shelf"></div>
    <div class="room" id="room"><div class="rh"><button class="rb" id="rback">‹ 書架</button><b class="rt" id="rtitle"></b><span class="rc" id="rcnt"></span></div>
      <div class="wh" id="wh"><div class="wp" id="wp"></div></div>
      <div class="info"><b id="itl"></b><span id="isc"></span></div>
      <div class="ctl"><button id="wprev" aria-label="上一張">‹</button><button class="bt" id="wauto">⏸ 暫停</button><button id="wnext" aria-label="下一張">›</button></div>
      <div class="tip">左右拖曳轉動 · 點中間那張看大圖</div></div></div>`;
  $('cats').insertAdjacentElement('afterend',al);
  const stg=$('stg'),shelf=$('shelf'),room=$('room'),wh=$('wh'),wp=$('wp');

  /* ---- 資料 ---- */
  let all=[],names=[],ignoreUntil=0;
  const inCat=(r,n)=>n==='ALL'?r.category!=='Gift Art':r.category===n;
  const rowsFor=n=>all.filter(r=>inCat(r,n));
  const findOld=row=>[...document.querySelectorAll('#grid .item')].find(e=>{const h=e.querySelector('h3');return h&&h.textContent===row.title;});
  const domThumb=row=>{const it=findOld(row),im=it&&it.querySelector('img');return im?im.getAttribute('src'):'';};
  const srcOf=row=>row.locked?(gURL(row.thumb)||domThumb(row)):(gURL(row.photos&&row.photos[0])||gURL(row.thumb)||domThumb(row));
  const syncOld=n=>{const b=[...document.querySelectorAll('#cats button')].find(x=>x.textContent===n);if(b&&!b.classList.contains('on')){ignoreUntil=Date.now()+900;b.click();}};

  /* ---- 書架 ---- */
  function buildShelf(){shelf.textContent='';
    names.forEach((n,i)=>{if(i%2===0){const r=document.createElement('div');r.className='row';r.id='r'+(i/2);shelf.appendChild(r);const bd=document.createElement('div');bd.className='board';shelf.appendChild(bd);}
      const row=$('r'+Math.floor(i/2)),list=rowsFor(n),first=list[0],src=first?srcOf(first):'';
      const cv=document.createElement('div');cv.className='cv';cv.style.setProperty('--c',COVERS[i%COVERS.length]);
      const cp=document.createElement('div');cp.className='cp'+(src?'':' no');
      if(src){const im=document.createElement('img');im.src=src;im.alt='';if(first.locked)im.style.filter='blur(8px)';cp.appendChild(im);}else cp.textContent='♡';
      const ct=document.createElement('div');ct.className='ct';ct.textContent=n;
      const cn=document.createElement('div');cn.className='cn';cn.textContent=list.length+' 張';
      cv.append(cp,ct,cn);cv.onclick=()=>openAlbum(n,cv);row.appendChild(cv);});
    if(names.length%2===1){const r=$('r'+Math.floor((names.length-1)/2)),sp=document.createElement('div');sp.style.width='42%';r.appendChild(sp);}}

  /* ---- 滾輪 ---- */
  let cur='',list=[],cards=[],pos=0,target=0,raf=0,tmr=0,auto=true,lastTouch=0,drag=null;
  const NCARD_VIS=3.3;
  function gap(){return wh.clientWidth*0.56*0.62;}
  function mod(a,n){return ((a%n)+n)%n;}
  function render(){const n=list.length;if(!n)return;
    cards.forEach((c,i)=>{let d=mod(i-pos+n/2,n)-n/2;const a=Math.abs(d);
      if(a>NCARD_VIS){c.style.display='none';return;}c.style.display='';
      const rot=-Math.max(-1.3,Math.min(1.3,d))*46;
      c.style.transform=`translateX(${d*gap()}px) translateZ(${-a*110}px) rotateY(${rot}deg) scale(${1-.03*a})`;
      c.style.zIndex=100-Math.round(a*10);c.style.opacity=Math.max(.35,1-a*.2);c.style.filter=`brightness(${1-Math.min(a,2)*.07})`;});
    const ci=mod(Math.round(pos),n);$('rcnt').textContent=(ci+1)+' / '+n;
    const r=list[ci];if(r&&$('itl').dataset.i!==String(ci)){$('itl').dataset.i=ci;$('itl').textContent=r.title||'';$('isc').textContent=[r.scene,r.date].filter(Boolean).join('  ·  ');}}
  function loop(){raf=requestAnimationFrame(loop);if(drag)return;const dx=target-pos;if(Math.abs(dx)<.0005){if(pos!==target){pos=target;render();}return;}pos+=dx*.14;render();}
  function setList(n){cur=n;list=rowsFor(n);wp.textContent='';cards=[];$('rtitle').textContent=n;
    if(!list.length){wp.innerHTML='<div class="empty">這本相本還沒有照片</div>';$('rcnt').textContent='';$('itl').textContent='';$('isc').textContent='';return;}
    list.forEach((row,i)=>{const c=document.createElement('div');c.className='cd'+(row.locked?' lk':'');c.dataset.i=i;
      const ph=document.createElement('div');ph.className='ph';const src=srcOf(row);
      if(src){const im=document.createElement('img');im.src=src;im.alt='';im.draggable=false;im.onerror=()=>{const d=domThumb(row);if(d&&!im.dataset.fb){im.dataset.fb=1;im.src=d;}};ph.appendChild(im);}
      if(row.locked){const s=document.createElement('div');s.className='soon';s.textContent='to be soon';ph.appendChild(s);}
      c.appendChild(ph);if(row.date){const d=document.createElement('div');d.className='dt';d.textContent=row.date;c.appendChild(d);}
      wp.appendChild(c);cards.push(c);});
    $('itl').dataset.i='';pos=target=Math.min(Math.round(target),list.length-1);render();}
  function startAuto(){clearInterval(tmr);if(!AUTO_MS)return;tmr=setInterval(()=>{if(!auto||drag||!list.length||Date.now()-lastTouch<2000)return;target=Math.round(target)+1;},AUTO_MS);}
  function touched(){lastTouch=Date.now();}
  $('wnext').onclick=()=>{touched();target=Math.round(target)+1;};
  $('wprev').onclick=()=>{touched();target=Math.round(target)-1;};
  $('wauto').onclick=()=>{auto=!auto;$('wauto').textContent=auto?'⏸ 暫停':'▶ 自動轉';};
  if(!AUTO_MS)$('wauto').style.display='none';
  wh.addEventListener('pointerdown',e=>{if(!list.length)return;touched();wh.setPointerCapture(e.pointerId);const c=e.target.closest('.cd');
    drag={x:e.clientX,p:pos,moved:false,idx:c?+c.dataset.i:-1,lx:e.clientX,lt:performance.now(),v:0};});
  wh.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>6)drag.moved=true;
    if(drag.moved){pos=drag.p-dx/gap();target=pos;const t=performance.now(),dt=t-drag.lt;if(dt>0){drag.v=(e.clientX-drag.lx)/dt;drag.lx=e.clientX;drag.lt=t;}render();touched();}});
  const up=e=>{if(!drag)return;const d=drag;drag=null;touched();
    if(d.moved){target=Math.round(pos-Math.max(-3,Math.min(3,d.v*140/gap())));return;}
    if(d.idx<0)return;const n=list.length,dd=mod(d.idx-pos+n/2,n)-n/2;
    if(Math.abs(dd)<.4){const it=findOld(list[d.idx]);if(it)it.click();}else target=pos+dd;};
  wh.addEventListener('pointerup',up);wh.addEventListener('pointercancel',()=>{drag=null;});

  /* ---- 開書／關書 ---- */
  function showRoom(n){shelf.style.display='none';room.style.display='block';setList(n);cancelAnimationFrame(raf);loop();startAuto();}
  async function openAlbum(n,cv){syncOld(n);
    const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce||!cv){showRoom(n);return;}
    try{const sr=stg.getBoundingClientRect(),r=cv.getBoundingClientRect(),W=sr.width*.62,H=W*4.1/3;
      const cl=cv.cloneNode(true);cl.className='cv clone';cl.style.cssText=`position:absolute;z-index:20;width:${W}px;height:${H}px;left:${(sr.width-W)/2}px;top:46px;margin:0;transform-origin:0 0;--c:${cv.style.getPropertyValue('--c')}`;
      stg.appendChild(cl);
      const fx=r.left-sr.left-(sr.width-W)/2,fy=r.top-sr.top-46,s=r.width/W;
      await cl.animate([{transform:`translate(${fx}px,${fy}px) scale(${s})`},{transform:'translate(0,0) scale(1)'}],{duration:380,easing:'ease-out',fill:'forwards'}).finished;
      shelf.style.display='none';room.style.display='block';setList(n);
      cl.style.overflow='visible';
      await cl.animate([{transform:'rotateY(0deg)',opacity:1},{transform:'rotateY(-165deg)',opacity:1,offset:.8},{transform:'rotateY(-165deg)',opacity:0}],{duration:620,easing:'ease-in-out',fill:'forwards'}).finished;
      cl.remove();cancelAnimationFrame(raf);loop();startAuto();
    }catch(e){stg.querySelectorAll('.clone').forEach(x=>x.remove());showRoom(n);}}
  $('rback').onclick=()=>{cancelAnimationFrame(raf);clearInterval(tmr);room.style.display='none';shelf.style.display='';buildShelf();scrollTo({top:al.offsetTop-10});};

  /* ---- 載入資料 ---- */
  async function refresh(){
    if(!sbReady()){all=[];names=['ALL'];buildShelf();return;}
    const q=name=>fetch(SBU+'/rest/v1/'+name+'?select=*&order=sort.asc,id.asc&limit=200',{headers:{apikey:SB_KEY}});
    let got=null;try{let r=await q('gallery_public');if(!r.ok)r=await q('gallery');if(r.ok)got=await r.json();}catch(e){}
    all=got||[];
    const fromTabs=[...document.querySelectorAll('#cats button')].map(b=>b.textContent).filter(Boolean);
    names=fromTabs.length?fromTabs:NAMES;
    if(room.style.display==='block'){const keep=target;setList(cur);target=pos=Math.min(Math.round(keep),Math.max(0,list.length-1));render();}else buildShelf();}
  let tm=0;
  new MutationObserver(()=>{if(Date.now()<ignoreUntil)return;clearTimeout(tm);tm=setTimeout(refresh,150);}).observe($('grid'),{childList:true});
  refresh();
})();
