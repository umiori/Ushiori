/* album.js v8：相簿頁
   圖庫：環形轉盤（＝ALL，不含鎖起來的和 🎁），圖下面有文字，點中間那張打開卡片
   選集：分類相簿清單（ALL／LD／SD／uori／🐶🐰／🎁），點進去就是你原本的卡片格子（含管理功能）
   另外：管理的「調整順序」可以長按一列直接拖曳
   用法：index.html 最後 </body> 前面有 <script src="album.js"></script> 就好（取代舊的 album.js） */
(function(){
  const ALBUM_ORDER=['ALL','LD','SD','uori','🐶🐰','🎁'];   // 選集裡相簿的順序，想改就改這裡
  const FEATURED=["⊹ ⁺ 小魚の誕生日⁺ ⊹","牛島の誕生日","恋の一周年","牛島誕生日","♡｡･ﾟ⊹ 恋の2周年･ﾟ｡ ♡","𝟨𝟢𝟢ᴅ ᴀɴɴɪᴠᴇʀꜱᴀʀʏ","⊹花火大会⋆。°🍡˖𖧷🎏☆.ᐟ","𓈒݂𓏴𓏴夢の国のアリス˖♤⋆₊🐇🕰️˚꩜","୧はじまりの約束°˖🎒⋆₊🩹˚꩜","︶︶微酔いの夜に˚꒷︶︶🍷꒷꒦♡₊˚","❆聖なる夜の贈り物⁺❆🎄⋆❄️✨","819 ハイキュー!!の日～！！￼","₊二人の願い˚⛩️⋆｡˚🔔₊⊹","⁠⋆⑅˚₊ 旅立ちと約束 🌸⋆ ₊ 🎓","⁠˚₊‧꒰ა ふたりだけのプリクラ 📸 ໒꒱","⁠︶₊ 湯気につつまれて ˚꒷︶🛁꒷꒦","秋！お散歩の日🍂￼","⁠𖦹˙⋆˚ まったりソファ時間 🛋️⋆","⋆⑅˚₊ ステッカー包 💜⋆ ₊ ✨","𑣲 🪪 証明写真のふたり ⋆ ˚࿔⁠","⁠ ☁️ ྀི 温もりのお裾分け⋆ ₊","⁠ ⋆ ˚࿔ 二人の自撮り時間 📸⋆ ₊ ✦","⋆.おでこにキス ₊˚ ꩜","⁠♬⋆.˚𝄞₊˚⊹ デフォルメの日常 ᰔ ✶⋆.˚⁠","₊⁠︶︶₊˚꒷ 聖域の誘惑 ꒷꒦♡₊","♡⋆ᯓ★ 永遠の絡まり ⁺˚₊‧⁠","˚⊹縮距離の体温 💜⋆ ₊","⊹ ࣪ わんこな若利と白うさぎ魚織 ࣪ ˖ ໒꒱⋆","໒꒱ ⋆𐙚₊˚天使の犬と悪魔のうさぎ ˚✧♡⁠"];   // 轉盤精選：填卡片標題，留空＝全部。不知道怎麼填？網址後面加 #pick，勾選後會產生這一行
  const key=t=>String(t||'').normalize('NFKC').replace(/[^\p{L}\p{N}]/gu,'');
  const same=(a,b)=>{const x=key(a),y=key(b);return x&&y?x===y:a===b;};
  const $=id=>document.getElementById(id);
  const pg=$('p-gallery');
  const SBU=SB_URL.replace(/\/$/,''),NAME_RE=/^[A-Za-z0-9_-]{6,60}\.jpg$/;
  const gURL=f=>NAME_RE.test(f||'')?SBU+'/storage/v1/object/public/gallery/'+f:'';

  const st=document.createElement('style');st.textContent=`
  #gmode{position:sticky;top:8px;z-index:5;display:flex;justify-content:center;margin:0 0 12px}
  #gmode .seg{display:flex;padding:4px;border-radius:99px;background:rgba(255,255,255,.26);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.45)}
  #gmode .seg button{border:0;background:none;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 26px;border-radius:99px;font-size:.62rem;letter-spacing:.08em;cursor:pointer}
  #gmode .seg button.on{background:rgba(255,255,255,.6);color:#5b4358}
  #gmode .seg svg{width:24px;height:24px}
  #gback{display:none;margin:0 20px 10px;text-align:left}
  #gback button{border:1px solid rgba(255,255,255,.35);border-radius:99px;padding:6px 14px;font-size:.78rem;color:var(--ink);background:rgba(255,255,255,.2);cursor:pointer}
  #p-gallery.det #gback{display:block}
  #p-gallery.det #gmode,#p-gallery.det #album{display:none}
  #p-gallery #cats,#p-gallery:not(.det) #grid,#p-gallery:not(.det) .galfoot,#p-gallery:not(.det) .admbar{display:none!important}
  #album{padding:0 16px}
  #album .gpv{display:block;width:100%}
  #album .gpv[hidden]{display:none}
  .gcv{position:relative;perspective:1100px;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none;color:#fff4f8}
  #album .gcv{height:min(54vh,470px);border-radius:22px;background:rgba(255,236,250,.12);border:1px solid rgba(255,255,255,.3)}
  .gcv .msg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.8rem;opacity:.85}
  .gcv .it{position:absolute;left:50%;top:50%;will-change:transform,opacity;text-align:center}
  .gcv .im{position:relative;overflow:hidden;border:4px solid #fff;border-radius:14px;box-shadow:0 12px 24px rgba(70,45,100,.35);background:linear-gradient(135deg,#d6c3ea,#f2d3e4);line-height:0}
  .gcv .im img{display:block;max-width:none}
  .gcv .cp{margin:9px auto 0;min-width:110px;line-height:1.35;transition:opacity .2s}
  .gcv .cp b{display:block;font-size:.82rem;font-weight:700;color:#fff4f8}
  .gcv .cp span{display:block;font-size:.66rem;color:rgba(251,234,241,.82);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .gcv .cp i{display:block;font-size:.64rem;color:rgba(251,234,241,.65);margin-top:1px}
  #album .gcc{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:10px;font-size:.68rem;color:var(--ink)}
  #album .msg2{padding:50px 10px;font-size:.8rem;opacity:.8}
  #album .alb{display:flex;align-items:center;gap:16px;padding:10px 12px;margin-bottom:10px;text-align:left;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);border-radius:20px;cursor:pointer}
  #album .alb img{width:84px;height:84px;object-fit:cover;border-radius:18px;background:#cbbfd9;flex:0 0 84px}
  #album .alb b{display:block;font-size:1rem;font-weight:600;color:#fff4f8}
  #album .alb span{display:block;margin-top:3px;font-size:.85rem;opacity:.7}
  #ordList::before{content:"長按一列，可以直接拖曳移動";display:block;font-size:.7rem;opacity:.6;text-align:left;padding-bottom:6px}
  #ordList .ordrow{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;transition:background .15s,transform .15s}
  #ordList .ordrow.dragging{background:#f3e6f6;transform:scale(1.03);box-shadow:0 3px 10px rgba(100,70,140,.35);border-radius:10px}`;
  document.head.appendChild(st);
  const st3=document.createElement('style');st3.textContent=`
  #gpick{position:fixed;inset:0;z-index:90;background:#fbf3f7;color:#5b4358;display:flex;flex-direction:column;text-align:left}
  #gpick .pk1{display:flex;justify-content:space-between;align-items:center;padding:calc(12px + env(safe-area-inset-top)) 14px 8px;background:#ecdcee;font-size:.85rem}
  #gpick .pk1 button{width:28px;height:28px;border:0;border-radius:8px;background:#fff;color:#5b4358;cursor:pointer;padding:0}
  #gpick .pkl{flex:1;overflow:auto;padding:6px 14px}
  #gpick label{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #eee;font-size:.82rem}
  #gpick label img{width:46px;height:46px;object-fit:cover;border-radius:8px;background:#ddd;flex:0 0 46px}
  #gpick label small{display:block;opacity:.6;font-size:.68rem}
  #gpick .pkf{padding:8px 14px calc(14px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #eadff0}
  #gpick textarea{width:100%;height:64px;font-size:11px;border:1px solid #d8c9ee;border-radius:8px;padding:6px}
  #gpick .pkf button{margin-top:6px;border:0;border-radius:99px;padding:7px 16px;background:#fbeaf1;color:#7a5a82;cursor:pointer}`;
  document.head.appendChild(st3);

  /* ===== 環形轉盤：前面最大，後面的圖淡淡的還在；不自動轉，手指好轉、放手有慣性 ===== */
  function Carousel(host,opt){
    let N=0,its=[],pos=0,goal=null,vel=0,dragging=false,moved=0,sx0=0,pos0=0,lx=0,lt=0,last=performance.now(),cw=0,chh=0;
    host.classList.add('gcv');
    function fit(d,ratio){const hh=host.clientHeight||430,ww=host.clientWidth||340;let h=hh*.62,w=h*ratio;const mx=ww*.72;if(w>mx){w=mx;h=w/ratio;}
      const im=d.querySelector('img');im.style.width=w+'px';im.style.height=h+'px';d._cp.style.width=Math.max(110,w+8)+'px';}
    function load(d){const im=d.querySelector('img'),list=d._p.srcs().filter(Boolean);let k=0;
      im.onload=()=>{if(im.naturalWidth)fit(d,im.naturalWidth/im.naturalHeight);};
      im.onerror=()=>{k++;if(k<list.length)im.src=list[k];else im.style.visibility='hidden';};
      if(list.length)im.src=list[0];else im.style.visibility='hidden';}
    function set(items){N=items.length;host.textContent='';its=[];pos=0;goal=null;vel=0;cw=0;
      if(!N){const m=document.createElement('div');m.className='msg';m.textContent='還沒有照片';host.appendChild(m);opt.count('');return;}
      items.forEach(p=>{const d=document.createElement('div');d.className='it';d.style.display='none';d._p=p;
        const w=document.createElement('div');w.className='im';
        const im=document.createElement('img');im.alt='';im.draggable=false;w.appendChild(im);
        const cp=document.createElement('div');cp.className='cp';const r=p.row;
        const b=document.createElement('b');b.textContent=r.title||'';cp.appendChild(b);
        if(r.scene){const s=document.createElement('span');s.textContent=r.scene;cp.appendChild(s);}
        if(r.date){const t=document.createElement('i');t.textContent=r.date;cp.appendChild(t);}
        d._cp=cp;d.append(w,cp);host.appendChild(d);fit(d,.72);its.push(d);});}
    function render(){const step=N<=8?360/N:45;opt.count((((Math.round(pos)%N)+N)%N+1)+'/'+N);
      its.forEach((d,i)=>{let o=(((i-pos)%N)+N)%N;if(o>N/2)o-=N;const phi=o*step;
        if(Math.abs(phi)>180.01){d.style.display='none';return;}
        const r=phi*Math.PI/180,c=Math.cos(r),R=cw*.9;
        if(!d._l){d._l=1;load(d);}
        d.style.display='';d.style.zIndex=Math.round((c+1)*50);
        d.style.transform=`translate(-50%,-50%) translate3d(${R*Math.sin(r)}px,${-(1-c)*chh*.05}px,${R*(c-1)}px) rotateY(${phi}deg)`;
        d.style.opacity=Math.max(.25,Math.min(1,.25+(c+.2)/.55*.75));
        d.style.pointerEvents=c>.3?'auto':'none';
        d._cp.style.opacity=c>.55?1:0;});}
    function tick(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;
      if(N&&host.offsetParent!==null){
        if(host.clientWidth!==cw){cw=host.clientWidth;chh=host.clientHeight;its.forEach(d=>{const im=d.querySelector('img');fit(d,im.naturalWidth?im.naturalWidth/im.naturalHeight:.72);});}
        if(!dragging){
          if(Math.abs(vel)>.35){pos+=vel*dt;vel*=Math.pow(.05,dt);goal=null;}
          else{vel=0;const tg=goal!=null?goal:Math.round(pos);pos+=(tg-pos)*Math.min(1,dt*8);if(goal!=null&&Math.abs(goal-pos)<.01)goal=null;}}
        render();}
      requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
    host.addEventListener('pointerdown',e=>{if(!N)return;host.setPointerCapture(e.pointerId);dragging=true;moved=0;sx0=lx=e.clientX;lt=performance.now();pos0=pos;goal=null;vel=0;});
    host.addEventListener('pointermove',e=>{if(!dragging)return;const now=performance.now(),dx=e.clientX-lx;moved=Math.max(moved,Math.abs(e.clientX-sx0));
      pos=pos0-(e.clientX-sx0)/(cw*.3);
      if(now>lt){const v=-(dx/(cw*.3))/((now-lt)/1000);vel=Math.max(-10,Math.min(10,vel*.5+v*.5));}lx=e.clientX;lt=now;});
    host.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;if(performance.now()-lt>90)vel=0;
      if(moved<8){vel=0;const el=document.elementFromPoint(e.clientX,e.clientY),it=el&&el.closest&&el.closest('.it');
        if(it&&host.contains(it)){const i=its.indexOf(it);let o=(((i-pos)%N)+N)%N;if(o>N/2)o-=N;
          if(Math.abs(o)<.6)opt.open(it._p.row);else goal=pos+o;}}});
    host.addEventListener('pointercancel',()=>{dragging=false;if(performance.now()-lt>90)vel=0;});
    return{set};}

  /* 打開卡片：直接用你原本相簿的卡片視窗（分類沒顯示的話先切過去再切回來） */
  let quiet=0,ctx=null,ctxIdx=0,viaLib=false,libRows=[];
  const gridItems=()=>[...document.querySelectorAll('#grid .item')];
  const fire=it=>{viaLib=true;it.click();viaLib=false;};
  const tabBtns=()=>[...document.querySelectorAll('#cats button')];
  function openOriginal(row){
    const find=()=>[...document.querySelectorAll('#grid .item')].find(e=>{const h=e.querySelector('h3');return h&&h.textContent===row.title;});
    let it=find();if(it){fire(it);return;}
    const tabs=tabBtns(),prev=tabs.find(b=>b.classList.contains('on')),tab=tabs.find(b=>b.textContent===row.category);
    if(!tab)return;quiet=Date.now()+900;tab.click();it=find();if(it)fire(it);
    if(prev&&prev!==tab){const back=tabBtns().find(b=>b.textContent===prev.textContent);if(back)back.click();}}
  const domThumb=row=>{const it=[...document.querySelectorAll('#grid .item')].find(e=>{const h=e.querySelector('h3');return h&&h.textContent===row.title;});const im=it&&it.querySelector('img');return im?im.getAttribute('src'):'';};

  /* ===== 骨架 ===== */
  const ICON_L='<svg viewBox="0 0 24 24"><rect x="2.5" y="7" width="14" height="13" rx="3" fill="currentColor" opacity=".5"/><rect x="7.5" y="3.5" width="14" height="13" rx="3" fill="currentColor"/></svg>';
  const ICON_C='<svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="12" rx="3.2" fill="currentColor"/><rect x="6.5" y="5.2" width="11" height="2.4" rx="1.2" fill="currentColor" opacity=".7"/><rect x="9" y="2" width="6" height="2" rx="1" fill="currentColor" opacity=".45"/></svg>';
  const bar=document.createElement('div');bar.id='gmode';
  bar.innerHTML=`<div class="seg"><button type="button" data-t="lib" class="on">${ICON_L}圖庫</button><button type="button" data-t="col">${ICON_C}選集</button></div>`;
  pg.insertBefore(bar,pg.firstChild);
  const back=document.createElement('div');back.id='gback';back.innerHTML='<button type="button" id="gbt">‹ 選集</button>';bar.after(back);
  const al=document.createElement('div');al.id='album';
  al.innerHTML=`<div class="gpv" id="vlib"><div id="lcv"></div><div class="gcc"><span id="lcn"></span><span>左右拖曳旋轉，點擊照片可觀看全圖or文（不一定有）</span></div></div><div class="gpv" id="vcol" hidden></div>`;
  back.after(al);
  bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{const t=b.dataset.t;
    bar.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));$('vlib').hidden=t!=='lib';$('vcol').hidden=t!=='col';});
  $('gbt').onclick=()=>{pg.classList.remove('det');scrollTo(0,0);};

  /* ===== 資料與畫面 ===== */
  let rows=[];
  const itemOf=r=>({row:r,srcs:()=>[gURL(r.photos&&r.photos[0]),gURL(r.thumb),domThumb(r)]});
  const lib=Carousel($('lcv'),{count:t=>{$('lcn').textContent=t;},open:row=>{ctx=libRows;ctxIdx=libRows.indexOf(row);openOriginal(row);}});
  function libList(){
    if(FEATURED.length){const out=[];FEATURED.forEach(t=>{const r=rows.find(x=>same(x.title,t)&&!x.locked);if(r&&!out.includes(r))out.push(r);});if(out.length)return out;}
    return rows.filter(r=>r.category!=='🎁'&&!r.locked);}
  function showLib(){libRows=libList();lib.set(libRows.map(itemOf));}

  function openAlbum(name){const tab=tabBtns().find(b=>b.textContent===name);quiet=Date.now()+900;
    if(tab&&!tab.classList.contains('on'))tab.click();pg.classList.add('det');scrollTo(0,0);}
  function renderCol(){const box=$('vcol');box.textContent='';
    const names=[...ALBUM_ORDER];rows.forEach(r=>{const c=r.category||'';if(c&&!names.includes(c))names.push(c);});
    names.forEach(n=>{const rs=n==='ALL'?rows.filter(r=>r.category!=='🎁'):rows.filter(r=>(r.category||'')===n);if(!rs.length)return;
      const a=document.createElement('div');a.className='alb';
      const f=rs.find(r=>!r.locked)||rs[0];
      const im=document.createElement('img');im.alt='';im.src=gURL(f.thumb)||gURL(f.photos&&f.photos[0])||gURL(f.blur_thumb)||'';if(f.locked)im.style.filter='blur(8px)';
      const t=document.createElement('div');const b=document.createElement('b');b.textContent=n;const c=document.createElement('span');c.textContent=rs.length;t.append(b,c);
      a.append(im,t);a.onclick=()=>openAlbum(n);box.appendChild(a);});
    if(!box.children.length)box.innerHTML='<div class="msg2">還沒有相簿</div>';}

  /* 資料：跟原本相簿用同一個資料表；原本相簿重新整理時，這邊跟著重做 */
  async function refresh(){
    if(!sbReady()){rows=[];}
    else{const q=name=>fetch(SBU+'/rest/v1/'+name+'?select=*&order=sort.asc,id.asc&limit=200',{headers:{apikey:SB_KEY}});
      let all=null;try{let r=await q('gallery_public');if(!r.ok)r=await q('gallery');if(r.ok)all=await r.json();}catch(e){}
      rows=all||[];}
    showLib();renderCol();if(location.hash==='#pick')openPicker();}
  let tm=0;
  new MutationObserver(()=>{if(Date.now()<quiet)return;clearTimeout(tm);tm=setTimeout(refresh,150);}).observe($('grid'),{childList:true});
  refresh();

  /* ===== 卡片視窗左右箭頭：上一張／下一張（從轉盤打開就照轉盤順序，從相簿格子打開就照格子順序） ===== */
  $('grid').addEventListener('click',e=>{const it=e.target.closest&&e.target.closest('.item');if(!it||viaLib)return;ctx=null;ctxIdx=gridItems().indexOf(it);},true);
  const arSt=document.createElement('style');
  arSt.textContent='.gar{position:fixed;top:50%;z-index:55;width:40px;height:40px;margin-top:-20px;border:0;border-radius:50%;background:rgba(255,255,255,.88);color:#5b4358;font-size:1.4rem;line-height:1;padding:0 0 3px;cursor:pointer;box-shadow:0 3px 10px rgba(60,30,80,.35);display:none}#garL{left:6px}#garR{right:6px}body.galopen .gar{display:block}';
  document.head.appendChild(arSt);
  [['garL','‹',-1],['garR','›',1]].forEach(([id,t,d])=>{const b=document.createElement('button');b.type='button';b.id=id;b.className='gar';b.textContent=t;b.setAttribute('aria-label',d<0?'上一張':'下一張');
    b.onclick=()=>{if(ctx&&ctx.length){ctxIdx=(ctxIdx+d+ctx.length)%ctx.length;openOriginal(ctx[ctxIdx]);}
      else{const its=gridItems();if(!its.length)return;ctxIdx=(ctxIdx+d+its.length)%its.length;its[ctxIdx].click();}};
    document.body.appendChild(b);});
  const mg=$('m-gal');
  if(mg)new MutationObserver(()=>document.body.classList.toggle('galopen',mg.classList.contains('open'))).observe(mg,{attributes:true,attributeFilter:['class']});

  /* ===== 管理「調整順序」：長按一列就能拖曳 ===== */
  (function(){
    const box=$('ordList');if(!box)return;
    let timer=0,down=null,drag=null;
    const rowsOf=()=>[...box.querySelectorAll('.ordrow')];
    const mark=()=>{if(drag)rowsOf().forEach((r,i)=>r.classList.toggle('dragging',i===drag.idx));};
    new MutationObserver(mark).observe(box,{childList:true});
    box.addEventListener('pointerdown',e=>{const row=e.target.closest('.ordrow');if(!row||e.target.closest('button'))return;
      down={x:e.clientX,y:e.clientY,id:e.pointerId};const idx=rowsOf().indexOf(row);
      timer=setTimeout(()=>{timer=0;try{box.setPointerCapture(down.id);}catch(_){}
        drag={idx,start:idx,y0:down.y,h:row.offsetHeight||50,win:box.closest('.win')};try{navigator.vibrate&&navigator.vibrate(18);}catch(_){}mark();},350);});
    box.addEventListener('pointermove',e=>{
      if(!drag){if(timer&&down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>10){clearTimeout(timer);timer=0;}return;}
      const n=rowsOf().length,target=Math.max(0,Math.min(n-1,drag.start+Math.round((e.clientY-drag.y0)/drag.h)));
      while(drag.idx<target){const b=rowsOf()[drag.idx].querySelectorAll('button')[1];if(!b||b.disabled)break;b.click();drag.idx++;}
      while(drag.idx>target){const b=rowsOf()[drag.idx].querySelectorAll('button')[0];if(!b||b.disabled)break;b.click();drag.idx--;}
      mark();
      if(drag.win){const r=drag.win.getBoundingClientRect();if(e.clientY<r.top+60)drag.win.scrollTop-=10;else if(e.clientY>r.bottom-60)drag.win.scrollTop+=10;}});
    const end=()=>{clearTimeout(timer);timer=0;if(drag){rowsOf().forEach(r=>r.classList.remove('dragging'));drag=null;}};
    box.addEventListener('pointerup',end);box.addEventListener('pointercancel',end);
    document.addEventListener('touchmove',e=>{if(drag)e.preventDefault();},{passive:false});
  })();

  /* ===== 精選挑選器：網址後面加 #pick，勾選要在轉盤出現的照片，複製產生的那一行貼回最上面 FEATURED ===== */
  function openPicker(){if($('gpick'))return;
    const sel=[...FEATURED],ov=document.createElement('div');ov.id='gpick';
    ov.innerHTML='<div class="pk1"><span>勾選要在轉盤出現的照片（依勾選順序）</span><button type="button" id="pkx">✕</button></div><div class="pkl" id="pkl"></div><div class="pkf"><textarea id="pkt" readonly></textarea><button type="button" id="pkc">複製這一行</button> <span id="pks" style="font-size:.7rem"></span></div>';
    document.body.appendChild(ov);
    const ta=$('pkt'),upd=()=>{ta.value='const FEATURED='+JSON.stringify(sel)+';';};
    rows.filter(r=>!r.locked).forEach(r=>{const lb=document.createElement('label'),cb=document.createElement('input');cb.type='checkbox';cb.checked=sel.some(s=>same(s,r.title));
      cb.onchange=()=>{const i=sel.findIndex(s=>same(s,r.title));if(cb.checked&&i<0)sel.push(r.title);if(!cb.checked&&i>=0)sel.splice(i,1);upd();};
      const im=document.createElement('img');im.src=gURL(r.thumb)||gURL(r.photos&&r.photos[0]);im.alt='';
      const t=document.createElement('span');t.textContent=r.title||'';const sm=document.createElement('small');sm.textContent=(r.category||'')+' '+(r.date||'');t.appendChild(sm);
      lb.append(cb,im,t);$('pkl').appendChild(lb);});
    upd();
    $('pkc').onclick=()=>{try{navigator.clipboard.writeText(ta.value).then(()=>{$('pks').textContent='已複製';});}catch(e){ta.select();document.execCommand('copy');$('pks').textContent='已複製';}};
    $('pkx').onclick=()=>ov.remove();}
})();
