/* album.js v5：相簿頁兩種狀態，右上角按鈕切換
   新版：圖庫（ALL／LD／SD／uori…分類，轉盤，圖下面有文字）／選集（相簿清單，點進去全螢幕轉盤）
   原本：你原本的卡片格子（含分類、管理功能）
   轉盤上點中間那張＝跟原本一樣打開卡片。
   用法：index.html 最後 </body> 前面有 <script src="album.js"></script> 就好（取代舊的 album.js） */
(function(){
  const DEFAULT_MODE='new';            // 預設狀態：'new'＝新版，'old'＝原本
  const $=id=>document.getElementById(id);
  const pg=$('p-gallery');
  const SBU=SB_URL.replace(/\/$/,''),NAME_RE=/^[A-Za-z0-9_-]{6,60}\.jpg$/;
  const gURL=f=>NAME_RE.test(f||'')?SBU+'/storage/v1/object/public/gallery/'+f:'';

  const st=document.createElement('style');st.textContent=`
  #m-gal,#m-edit,#m-login,#m-order,#m-card{z-index:80}
  #gmode{display:flex;justify-content:flex-end;margin:0 20px 10px}
  #gmode button{border-radius:99px;padding:6px 14px;font-size:.7rem;letter-spacing:.06em;color:var(--ink);background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);cursor:pointer}
  #p-gallery:not(.newmode) #album{display:none}
  #p-gallery.newmode #cats,#p-gallery.newmode #grid,#p-gallery.newmode .galfoot,#p-gallery.newmode .admbar{display:none!important}
  #album{padding:0 16px}
  #album .seg{position:sticky;top:8px;z-index:5;display:flex;width:fit-content;margin:0 auto 12px;padding:4px;border-radius:99px;background:rgba(255,255,255,.26);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.45)}
  #album .seg button{border:0;background:none;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 28px;border-radius:99px;font-size:.62rem;letter-spacing:.08em;cursor:pointer}
  #album .seg button.on{background:rgba(255,255,255,.6);color:#5b4358}
  #album .seg svg{width:24px;height:24px}
  #album .gpv{display:block;width:100%}
  #album .gpv[hidden]{display:none}
  #album .gtabs{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 12px}
  #album .gtabs button{border:0;border-radius:99px;padding:5px 12px;font-size:.72rem;letter-spacing:.05em;color:var(--ink);background:rgba(255,255,255,.14);opacity:.85;cursor:pointer}
  #album .gtabs button.on{background:rgba(255,255,255,.34);color:#fff;opacity:1}
  .gcv{position:relative;perspective:1100px;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none}
  #album .gcv{height:min(66vh,540px);border-radius:22px;background:radial-gradient(ellipse at 50% 40%,#fff7fb,#efe3f5 70%,#e4d6f0);box-shadow:inset 0 2px 10px rgba(120,100,160,.2)}
  .gcv .msg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#7a5a82}
  .gcv .it{position:absolute;left:50%;top:50%;will-change:transform;text-align:center;color:#5b4358}
  .gcv .im{position:relative;overflow:hidden;border:4px solid #fff;border-radius:14px;box-shadow:0 14px 28px rgba(110,85,150,.35);background:#eadff3;line-height:0}
  .gcv .im img{display:block;max-width:calc(var(--cw)*.56);max-height:calc(var(--chh)*.58);width:auto;height:auto}
  .gcv .it.lk .im img{filter:blur(14px);transform:scale(1.15)}
  .gcv .soon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;letter-spacing:.22em;text-shadow:0 1px 5px rgba(60,30,80,.6);line-height:1.2}
  .gcv .cp{margin:9px auto 0;min-width:110px;line-height:1.35}
  .gcv .cp b{display:block;font-size:.82rem;font-weight:700;color:#5b4358}
  .gcv .cp span{display:block;font-size:.66rem;color:#8a7a95;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .gcv .cp i{display:block;font-size:.64rem;color:#a898a8;margin-top:1px}
  #album .gcc{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:10px;font-size:.68rem;color:var(--ink)}
  .gcc button,.cr .cf button{border:0;border-radius:99px;padding:7px 16px;font-size:.78rem;color:#a8567a;background:#fbe0ec;cursor:pointer}
  .gcc button[hidden],.cr .cf button[hidden]{display:none}
  #album .msg2{padding:50px 10px;font-size:.8rem;opacity:.8}
  #album .alb{display:flex;align-items:center;gap:16px;padding:10px 12px;margin-bottom:10px;text-align:left;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);border-radius:20px;cursor:pointer}
  #album .alb img{width:84px;height:84px;object-fit:cover;border-radius:18px;background:#cbbfd9;flex:0 0 84px}
  #album .alb b{display:block;font-size:1rem;font-weight:600;color:#fff4f8}
  #album .alb span{display:block;margin-top:3px;font-size:.85rem;opacity:.7}
  .cr{position:fixed;inset:0;z-index:64;display:flex;flex-direction:column;color:#5b4358;background:radial-gradient(ellipse at 50% 40%,#fff7fb,#efe3f5 70%,#e4d6f0)}
  .cr[hidden]{display:none}
  .cr .ch{display:flex;align-items:center;justify-content:space-between;padding:calc(12px + env(safe-area-inset-top)) 16px 8px;font-size:.9rem}
  .cr .ch button{width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.7);color:#5b4358;font-size:1rem;cursor:pointer;padding:0}
  .cr .ct{font-size:.8rem;text-align:center;line-height:1.3}.cr .ct small{display:block;opacity:.6}
  .cr .gcv{flex:1}
  .cr .cf{display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 16px calc(26px + env(safe-area-inset-bottom));font-size:.68rem;opacity:.9}`;
  document.head.appendChild(st);

  /* ===== 轉盤元件（圖庫和選集共用） ===== */
  function Carousel(host,opt){
    let N=0,its=[],pos=0,auto=true,goal=null,resumeAt=0,dragging=false,moved=0,sx0=0,pos0=0,last=performance.now(),cw=0;
    host.classList.add('gcv');
    function set(items){N=items.length;host.textContent='';its=[];pos=0;auto=true;goal=null;resumeAt=0;opt.hold(false);cw=0;
      if(!N){const m=document.createElement('div');m.className='msg';m.textContent='這個分類還沒有照片';host.appendChild(m);opt.count('');return;}
      items.forEach(p=>{const d=document.createElement('div');d.className='it'+(p.lock?' lk':'');d.style.display='none';d._p=p;
        const w=document.createElement('div');w.className='im';
        const im=document.createElement('img');im.alt='';im.draggable=false;w.appendChild(im);
        if(p.lock){const s=document.createElement('div');s.className='soon';s.textContent='to be soon';w.appendChild(s);}
        const cp=document.createElement('div');cp.className='cp';const r=p.row;
        const b=document.createElement('b');b.textContent=r.title||'';cp.appendChild(b);
        if(r.scene){const s=document.createElement('span');s.textContent=r.scene;cp.appendChild(s);}
        if(r.date){const t=document.createElement('i');t.textContent=r.date;cp.appendChild(t);}
        im.onload=()=>{cp.style.width=Math.max(110,w.clientWidth)+'px';};
        d.append(w,cp);host.appendChild(d);its.push(d);});}
    function render(){const cnt=((Math.round(pos)%N)+N)%N+1;opt.count(cnt+'/'+N);
      its.forEach((d,i)=>{let o=(((i-pos)%N)+N)%N;if(o>N/2)o-=N;const a=Math.abs(o);
        if(a>3.4){d.style.display='none';return;}
        const im=d.querySelector('img');if(!im.src)im.src=d._p.src;
        const s=o<0?-1:1,off=a<=1?a*.34:.34+(a-1)*.12;
        d.style.display='';d.style.zIndex=100-Math.round(a*10);
        d.style.transform=`translate(-50%,-50%) translateX(${s*off*cw}px) translateZ(${-Math.min(a,3)*110}px) rotateY(${-s*Math.min(a,1)*52}deg) scale(${1-Math.min(a,1)*.14})`;
        d.style.opacity=a>2.6?Math.max(0,1-(a-2.6)/.8):1;});}
    function tick(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;
      if(N&&host.offsetParent!==null){
        const w=host.clientWidth;if(w!==cw){cw=w;host.style.setProperty('--cw',w+'px');host.style.setProperty('--chh',host.clientHeight+'px');}
        if(!dragging){
          if(auto)pos+=dt*.45;
          else if(resumeAt&&t>=resumeAt){auto=true;resumeAt=0;opt.hold(false);}
          else{const tg=goal!=null?goal:Math.round(pos);pos+=(tg-pos)*Math.min(1,dt*6);if(goal!=null&&Math.abs(goal-pos)<.01)goal=null;}}
        render();}
      requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
    host.addEventListener('pointerdown',e=>{if(!N)return;host.setPointerCapture(e.pointerId);dragging=true;moved=0;sx0=e.clientX;pos0=pos;goal=null;auto=false;resumeAt=0;opt.hold(true);});
    host.addEventListener('pointermove',e=>{if(!dragging)return;moved=Math.max(moved,Math.abs(e.clientX-sx0));pos=pos0-(e.clientX-sx0)/(cw*.34);});
    host.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;resumeAt=performance.now()+2000;
      if(moved<8){const it=e.target.closest&&e.target.closest('.it');if(it){const i=its.indexOf(it);let o=(((i-pos)%N)+N)%N;if(o>N/2)o-=N;
        if(Math.abs(o)<.6)opt.open(it._p.row);else goal=pos+o;}}});
    host.addEventListener('pointercancel',()=>{dragging=false;resumeAt=performance.now()+2000;});
    return{set,resume(){auto=true;resumeAt=0;goal=null;opt.hold(false);}};}

  /* 打開卡片：直接用你原本相簿的卡片視窗（分類沒顯示的話先切過去再切回來） */
  let quiet=0;
  function openOriginal(row){
    const find=()=>[...document.querySelectorAll('#grid .item')].find(e=>{const h=e.querySelector('h3');return h&&h.textContent===row.title;});
    let it=find();if(it){it.click();return;}
    const tabs=[...document.querySelectorAll('#cats button')],prev=tabs.find(b=>b.classList.contains('on')),tab=tabs.find(b=>b.textContent===row.category);
    if(!tab)return;quiet=Date.now()+900;tab.click();it=find();if(it)it.click();
    if(prev&&prev!==tab){const back=[...document.querySelectorAll('#cats button')].find(b=>b.textContent===prev.textContent);if(back)back.click();}}

  /* ===== 骨架 ===== */
  const bar=document.createElement('div');bar.id='gmode';bar.innerHTML='<button id="gm" type="button"></button>';
  pg.insertBefore(bar,pg.firstChild);
  const ICON_L='<svg viewBox="0 0 24 24"><rect x="2.5" y="7" width="14" height="13" rx="3" fill="currentColor" opacity=".5"/><rect x="7.5" y="3.5" width="14" height="13" rx="3" fill="currentColor"/></svg>';
  const ICON_C='<svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="12" rx="3.2" fill="currentColor"/><rect x="6.5" y="5.2" width="11" height="2.4" rx="1.2" fill="currentColor" opacity=".7"/><rect x="9" y="2" width="6" height="2" rx="1" fill="currentColor" opacity=".45"/></svg>';
  const al=document.createElement('div');al.id='album';
  al.innerHTML=`<div class="seg"><button type="button" data-t="lib" class="on">${ICON_L}圖庫</button><button type="button" data-t="col">${ICON_C}選集</button></div>
    <div class="gpv" id="vlib"><div class="gtabs" id="vtabs"></div><div id="lcv"></div><div class="gcc"><span id="lcn"></span><button type="button" id="lgo" hidden>▶ 繼續旋轉</button><span>拖曳可手動旋轉．放手 2 秒後繼續自動旋轉</span></div></div>
    <div class="gpv" id="vcol" hidden></div>`;
  bar.after(al);
  const cr=document.createElement('div');cr.className='cr';cr.hidden=true;
  cr.innerHTML='<div class="ch"><button type="button" id="crx">✕</button><div class="ct"><span id="crn"></span><small id="crt"></small></div><span style="width:34px"></span></div><div id="crv"></div><div class="cf"><button type="button" id="crgo" hidden>▶ 繼續旋轉</button><span>拖曳可手動旋轉．放手 2 秒後繼續自動旋轉</span></div>';
  document.body.appendChild(cr);

  /* 模式切換 */
  let mode=DEFAULT_MODE;try{mode=localStorage.getItem('gal_mode')||DEFAULT_MODE;}catch(e){}
  function setMode(m){mode=m;pg.classList.toggle('newmode',m==='new');$('gm').textContent=m==='new'?'⇄ 切換為原本版面':'⇄ 切換為相簿版面';try{localStorage.setItem('gal_mode',m);}catch(e){}}
  $('gm').onclick=()=>setMode(mode==='new'?'old':'new');setMode(mode);
  al.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{al.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x===b));$('vlib').hidden=b.dataset.t!=='lib';$('vcol').hidden=b.dataset.t!=='col';});

  /* ===== 資料與畫面 ===== */
  let rows=[],curCat='ALL';
  const itemOf=r=>({row:r,lock:!!r.locked,src:gURL(r.locked?r.thumb:((r.photos&&r.photos[0])||r.thumb))||gURL(r.thumb)});
  const tabCats=()=>[...document.querySelectorAll('#cats button')].map(b=>b.textContent).filter(t=>t&&t!=='ALL');
  function catList(){const l=[...tabCats()];rows.forEach(r=>{if(r.category&&!l.includes(r.category))l.push(r.category);});if(rows.some(r=>!r.category))l.push('');return l;}

  const lib=Carousel($('lcv'),{count:t=>{$('lcn').textContent=t;},hold:v=>{$('lgo').hidden=!v;},open:openOriginal});
  $('lgo').onclick=()=>lib.resume();
  function showLib(){const items=rows.filter(r=>curCat==='ALL'?r.category!=='Gift Art':(r.category||'')===(curCat==='（未分類）'?'':curCat)).map(itemOf);lib.set(items);}
  function renderTabs(){const t=$('vtabs');t.textContent='';
    ['ALL',...catList().map(c=>c||'（未分類）')].forEach(n=>{const b=document.createElement('button');b.type='button';b.textContent=n;b.className=n===curCat?'on':'';
      b.onclick=()=>{curCat=n;renderTabs();showLib();};t.appendChild(b);});}

  const col=Carousel($('crv'),{count:t=>{$('crn').textContent=t;},hold:v=>{$('crgo').hidden=!v;},open:openOriginal});
  $('crgo').onclick=()=>col.resume();
  $('crx').onclick=()=>{cr.hidden=true;document.body.style.overflow='';};
  function renderCol(){const box=$('vcol');box.textContent='';let any=false;
    catList().forEach(c=>{const rs=rows.filter(r=>(r.category||'')===c);if(!rs.length)return;any=true;
      const a=document.createElement('div');a.className='alb';
      const im=document.createElement('img');im.alt='';const f=rs[0];im.src=gURL(f.thumb)||gURL(f.photos&&f.photos[0])||'';if(f.locked)im.style.filter='blur(8px)';
      const t=document.createElement('div');const b=document.createElement('b');b.textContent=c||'（未分類）';const n=document.createElement('span');n.textContent=rs.length;t.append(b,n);
      a.append(im,t);
      a.onclick=()=>{$('crt').textContent=c||'（未分類）';cr.hidden=false;document.body.style.overflow='hidden';col.set(rs.map(itemOf));};
      box.appendChild(a);});
    if(!any)box.innerHTML='<div class="msg2">還沒有相簿</div>';}

  /* 資料：跟原本相簿用同一個資料表；原本相簿重新整理時，這邊跟著重做 */
  async function refresh(){
    if(!sbReady()){rows=[];}
    else{const q=name=>fetch(SBU+'/rest/v1/'+name+'?select=*&order=sort.asc,id.asc&limit=200',{headers:{apikey:SB_KEY}});
      let all=null;try{let r=await q('gallery_public');if(!r.ok)r=await q('gallery');if(r.ok)all=await r.json();}catch(e){}
      rows=all||[];}
    if(curCat!=='ALL'&&!catList().map(c=>c||'（未分類）').includes(curCat))curCat='ALL';
    renderTabs();showLib();renderCol();}
  let tm=0;
  new MutationObserver(()=>{if(Date.now()<quiet)return;clearTimeout(tm);tm=setTimeout(refresh,150);}).observe($('grid'),{childList:true});
  refresh();
})();
