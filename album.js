/* album.js v4：相簿頁兩種狀態，右上角按鈕切換
   新版：圖庫（所有照片原比例滾動）／選集（像 iPhone 相簿清單，點進去是 3D 轉盤）
   原本：你原本的卡片格子（含分類、管理功能）
   用法：index.html 最後 </body> 前面有 <script src="album.js"></script> 就好（取代舊的 album.js） */
(function(){
  const DEFAULT_MODE='new';            // 預設狀態：'new'＝新版，'old'＝原本
  const $=id=>document.getElementById(id);
  const pg=$('p-gallery');
  const SBU=SB_URL.replace(/\/$/,''),NAME_RE=/^[A-Za-z0-9_-]{6,60}\.jpg$/;
  const gURL=f=>NAME_RE.test(f||'')?SBU+'/storage/v1/object/public/gallery/'+f:'';

  const st=document.createElement('style');st.textContent=`
  #gmode{display:flex;justify-content:flex-end;margin:0 20px 10px}
  #gmode button{border-radius:99px;padding:6px 14px;font-size:.7rem;letter-spacing:.06em;color:var(--ink);background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);cursor:pointer}
  #p-gallery:not(.newmode) #album{display:none}
  #p-gallery.newmode #cats,#p-gallery.newmode #grid,#p-gallery.newmode .galfoot,#p-gallery.newmode .admbar{display:none!important}
  #album{padding:0 16px}
  #album .seg{position:sticky;top:8px;z-index:5;display:flex;width:fit-content;margin:0 auto 12px;padding:4px;border-radius:99px;background:rgba(255,255,255,.26);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.45)}
  #album .seg button{border:0;background:none;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 28px;border-radius:99px;font-size:.62rem;letter-spacing:.08em;cursor:pointer}
  #album .seg button.on{background:rgba(255,255,255,.6);color:#5b4358}
  #album .seg svg{width:24px;height:24px}
  #album .av[hidden]{display:none}
  #album .lib{columns:2;column-gap:6px}
  #album .ph{position:relative;display:block;break-inside:avoid;margin:0 0 6px;border-radius:10px;overflow:hidden;background:#cbbfd9;cursor:pointer}
  #album .ph img{display:block;width:100%;height:auto;min-height:90px}
  #album .ph.lk img{filter:blur(16px);transform:scale(1.2)}
  #album .ph .soon,.cr .it .soon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;letter-spacing:.22em;text-shadow:0 1px 5px rgba(60,30,80,.6)}
  #album .msg{padding:50px 10px;font-size:.8rem;opacity:.8}
  #album .alb{display:flex;align-items:center;gap:16px;padding:10px 12px;margin-bottom:10px;text-align:left;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);border-radius:20px;cursor:pointer}
  #album .alb img{width:84px;height:84px;object-fit:cover;border-radius:18px;background:#cbbfd9;flex:0 0 84px}
  #album .alb b{display:block;font-size:1rem;font-weight:600;color:#fff4f8}
  #album .alb span{display:block;margin-top:3px;font-size:.85rem;opacity:.7}
  .cr{position:fixed;inset:0;z-index:64;display:flex;flex-direction:column;color:#5b4358;background:radial-gradient(ellipse at 50% 40%,#fff7fb,#efe3f5 70%,#e4d6f0)}
  .cr[hidden],.vw[hidden]{display:none}
  .cr .ch{display:flex;align-items:center;justify-content:space-between;padding:calc(12px + env(safe-area-inset-top)) 16px 8px;font-size:.9rem}
  .cr .ch button{width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.7);color:#5b4358;font-size:1rem;cursor:pointer;padding:0}
  .cr .ct{font-size:.8rem;text-align:center;line-height:1.3}.cr .ct small{display:block;opacity:.6}
  .cr .cv{position:relative;flex:1;perspective:1100px;overflow:hidden;touch-action:none}
  .cr .cv::after{content:"";position:absolute;left:12%;right:12%;bottom:12%;height:26px;border-radius:50%;background:radial-gradient(ellipse,rgba(120,90,160,.3),transparent 70%);filter:blur(4px)}
  .cr .it{position:absolute;left:50%;top:50%;will-change:transform}
  .cr .it img{display:block;max-width:calc(var(--cw)*.58);max-height:calc(var(--chh)*.78);border:4px solid #fff;border-radius:14px;box-shadow:0 14px 28px rgba(110,85,150,.35);background:#eadff3}
  .cr .it.lk img{filter:blur(14px)}
  .cr .cf{display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 16px calc(26px + env(safe-area-inset-bottom));font-size:.68rem;opacity:.9}
  .cr .cf button{border:0;border-radius:99px;padding:7px 16px;font-size:.78rem;color:#a8567a;background:#fbe0ec;cursor:pointer}
  .vw{position:fixed;inset:0;z-index:66;display:flex;flex-direction:column;background:#fbf3f7;color:#5b4358}
  .vw .vh{display:flex;justify-content:space-between;align-items:center;padding:calc(10px + env(safe-area-inset-top)) 14px 8px;background:#ecdcee;font-size:.9rem}
  .vw .vh button{width:28px;height:28px;border:0;border-radius:8px;background:#fff;color:#5b4358;cursor:pointer;padding:0}
  .vw .vb{flex:1;overflow:auto;padding:14px;font-size:.9rem;line-height:1.8;text-align:left;white-space:pre-wrap}
  .vw .vb img{display:block;width:100%;height:auto;margin-bottom:10px;border-radius:10px}
  .vw .vb .dt{font-size:.75rem;opacity:.6}`;
  document.head.appendChild(st);

  /* 骨架 */
  const bar=document.createElement('div');bar.id='gmode';bar.innerHTML='<button id="gm" type="button"></button>';
  pg.insertBefore(bar,pg.firstChild);
  const ICON_L='<svg viewBox="0 0 24 24"><rect x="2.5" y="7" width="14" height="13" rx="3" fill="currentColor" opacity=".5"/><rect x="7.5" y="3.5" width="14" height="13" rx="3" fill="currentColor"/></svg>';
  const ICON_C='<svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="12" rx="3.2" fill="currentColor"/><rect x="6.5" y="5.2" width="11" height="2.4" rx="1.2" fill="currentColor" opacity=".7"/><rect x="9" y="2" width="6" height="2" rx="1" fill="currentColor" opacity=".45"/></svg>';
  const al=document.createElement('div');al.id='album';
  al.innerHTML=`<div class="seg"><button type="button" data-t="lib" class="on">${ICON_L}圖庫</button><button type="button" data-t="col">${ICON_C}選集</button></div><div class="av lib" id="vlib"></div><div class="av" id="vcol" hidden></div>`;
  bar.after(al);

  const cr=document.createElement('div');cr.className='cr';cr.hidden=true;
  cr.innerHTML='<div class="ch"><button type="button" id="crx">✕</button><div class="ct"><span id="crn"></span><small id="crt"></small></div><span style="width:34px"></span></div><div class="cv" id="crv"></div><div class="cf"><button type="button" id="crgo" hidden>▶ 繼續旋轉</button><span>拖曳可手動旋轉．放手 2 秒後繼續自動旋轉</span></div>';
  const vw=document.createElement('div');vw.className='vw';vw.hidden=true;
  vw.innerHTML='<div class="vh"><span id="vt"></span><button type="button" id="vx">✕</button></div><div class="vb" id="vb"></div>';
  document.body.append(cr,vw);

  let locks=0;const lock=n=>{locks=Math.max(0,locks+n);document.body.style.overflow=locks?'hidden':'';};

  /* 模式切換 */
  let mode=DEFAULT_MODE;try{mode=localStorage.getItem('gal_mode')||DEFAULT_MODE;}catch(e){}
  function setMode(m){mode=m;pg.classList.toggle('newmode',m==='new');$('gm').textContent=m==='new'?'⇄ 切換為原本版面':'⇄ 切換為相簿版面';try{localStorage.setItem('gal_mode',m);}catch(e){}}
  $('gm').onclick=()=>setMode(mode==='new'?'old':'new');setMode(mode);
  al.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{al.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x===b));$('vlib').hidden=b.dataset.t!=='lib';$('vcol').hidden=b.dataset.t!=='col';});

  /* 資料 */
  let rows=[];
  const photosOf=r=>{if(r.locked)return[{src:gURL(r.thumb),lock:1,row:r,i:0}];
    return (r.photos&&r.photos.length?r.photos:[r.thumb]).map(gURL).filter(Boolean).map((s,i)=>({src:s,row:r,i}));};

  /* 檢視單張卡片（全部照片＋文字） */
  function openRow(row,idx){const vb=$('vb');vb.textContent='';$('vt').textContent=row.title||'';
    if(row.locked){vb.textContent='🔒 to be soon ♡';}
    else{const ims=photosOf(row).map(p=>{const im=document.createElement('img');im.src=p.src;im.alt='';im.loading='lazy';vb.appendChild(im);return im;});
      if(row.date){const d=document.createElement('div');d.className='dt';d.textContent=row.date;vb.appendChild(d);}
      if(row.story)vb.appendChild(document.createTextNode(row.story));
      if(idx&&ims[idx])setTimeout(()=>ims[idx].scrollIntoView(),30);}
    if(vw.hidden)lock(1);vw.hidden=false;}
  $('vx').onclick=()=>{vw.hidden=true;lock(-1);};

  /* 圖庫：所有照片原比例，連續滾動 */
  function renderLib(){const box=$('vlib');box.textContent='';
    const items=rows.filter(r=>r.category!=='Gift Art').flatMap(photosOf);
    if(!items.length){box.style.columns='1';box.innerHTML='<div class="msg">還沒有照片</div>';return;}
    box.style.columns='';
    items.forEach(p=>{const d=document.createElement('div');d.className='ph'+(p.lock?' lk':'');
      const im=document.createElement('img');im.src=p.src;im.alt='';im.loading='lazy';im.decoding='async';d.appendChild(im);
      if(p.lock){const s=document.createElement('div');s.className='soon';s.textContent='to be soon';d.appendChild(s);}
      d.onclick=()=>openRow(p.row,p.i);box.appendChild(d);});}

  /* 選集：像 iPhone 相簿的清單 */
  const tabCats=()=>[...document.querySelectorAll('#cats button')].map(b=>b.textContent).filter(t=>t&&t!=='ALL');
  function catList(){const l=[...tabCats()];rows.forEach(r=>{if(r.category&&!l.includes(r.category))l.push(r.category);});if(rows.some(r=>!r.category))l.push('');return l;}
  function renderCol(){const box=$('vcol');box.textContent='';let any=false;
    catList().forEach(c=>{const rs=rows.filter(r=>(r.category||'')===c);if(!rs.length)return;any=true;
      const items=rs.flatMap(photosOf);const a=document.createElement('div');a.className='alb';
      const im=document.createElement('img');im.src=items[0]?items[0].src:'';im.alt='';if(items[0]&&items[0].lock)im.style.filter='blur(8px)';
      const t=document.createElement('div');const b=document.createElement('b');b.textContent=c||'（未分類）';const n=document.createElement('span');n.textContent=items.length;t.append(b,n);
      a.append(im,t);a.onclick=()=>openCarousel(c||'（未分類）',items);box.appendChild(a);});
    if(!any)box.innerHTML='<div class="msg">還沒有相簿</div>';}

  /* 3D 轉盤 */
  let raf=0,N=0,its=[],pos=0,auto=true,goal=null,resumeAt=0,dragging=false,moved=0,sx0=0,pos0=0,last=0,cw=300;
  const cv=$('crv');
  function openCarousel(name,items){if(!items.length)return;N=items.length;cv.textContent='';its=[];
    $('crt').textContent=name;pos=0;auto=true;goal=null;resumeAt=0;$('crgo').hidden=true;
    items.forEach(p=>{const d=document.createElement('div');d.className='it'+(p.lock?' lk':'');d.style.display='none';d._p=p;
      const im=document.createElement('img');im.alt='';im.draggable=false;d.appendChild(im);
      if(p.lock){const s=document.createElement('div');s.className='soon';s.textContent='to be soon';d.appendChild(s);}
      cv.appendChild(d);its.push(d);});
    if(cr.hidden)lock(1);cr.hidden=false;
    cw=cv.clientWidth||320;cv.style.setProperty('--cw',cw+'px');cv.style.setProperty('--chh',(cv.clientHeight||440)+'px');
    last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);}
  function closeCarousel(){cancelAnimationFrame(raf);cr.hidden=true;lock(-1);}
  function render(){const cnt=((Math.round(pos)%N)+N)%N+1;$('crn').textContent=cnt+'/'+N;
    its.forEach((d,i)=>{let o=(((i-pos)%N)+N)%N;if(o>N/2)o-=N;const a=Math.abs(o);
      if(a>3.4){d.style.display='none';return;}
      const im=d.firstChild;if(!im.src)im.src=d._p.src;
      const s=o<0?-1:1,off=a<=1?a*.34:.34+(a-1)*.12;
      d.style.display='';d.style.zIndex=100-Math.round(a*10);
      d.style.transform=`translate(-50%,-50%) translateX(${s*off*cw}px) translateZ(${-Math.min(a,3)*110}px) rotateY(${-s*Math.min(a,1)*52}deg) scale(${1-Math.min(a,1)*.14})`;
      d.style.opacity=a>2.6?Math.max(0,1-(a-2.6)/.8):1;});}
  function tick(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;
    if(!dragging){
      if(auto)pos+=dt*.45;
      else if(resumeAt&&t>=resumeAt){auto=true;resumeAt=0;$('crgo').hidden=true;}
      else{const tg=goal!=null?goal:Math.round(pos);pos+=(tg-pos)*Math.min(1,dt*6);if(goal!=null&&Math.abs(goal-pos)<.01)goal=null;}}
    render();raf=requestAnimationFrame(tick);}
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);dragging=true;moved=0;sx0=e.clientX;pos0=pos;goal=null;auto=false;resumeAt=0;$('crgo').hidden=false;});
  cv.addEventListener('pointermove',e=>{if(!dragging)return;moved=Math.max(moved,Math.abs(e.clientX-sx0));pos=pos0-(e.clientX-sx0)/(cw*.34);});
  cv.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;resumeAt=performance.now()+2000;
    if(moved<8){const it=e.target.closest&&e.target.closest('.it');if(it){const i=its.indexOf(it);let o=(((i-pos)%N)+N)%N;if(o>N/2)o-=N;
      if(Math.abs(o)<.6)openRow(it._p.row,it._p.i);else goal=pos+o;}}});
  cv.addEventListener('pointercancel',()=>{dragging=false;resumeAt=performance.now()+2000;});
  $('crgo').onclick=()=>{auto=true;resumeAt=0;goal=null;$('crgo').hidden=true;};
  $('crx').onclick=closeCarousel;

  /* 資料：跟原本相簿用同一個資料表；原本相簿重新整理時，這邊跟著重做 */
  async function refresh(){
    if(!sbReady()){rows=[];renderLib();renderCol();return;}
    const q=name=>fetch(SBU+'/rest/v1/'+name+'?select=*&order=sort.asc,id.asc&limit=200',{headers:{apikey:SB_KEY}});
    let all=null;try{let r=await q('gallery_public');if(!r.ok)r=await q('gallery');if(r.ok)all=await r.json();}catch(e){}
    rows=all||[];renderLib();renderCol();}
  let tm=0;
  new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(refresh,150);}).observe($('grid'),{childList:true});
  refresh();
})();
