/* album.js v2：用一張「紫白建模桌面」當底圖，本子的左右兩頁用透視貼在底圖的筆記本上，可翻頁。
   用法：index.html 最後 </body> 前面有 <script src="album.js"></script> 就好（取代舊的 album.js）。 */
(function(){
  /* ===== 可以改的設定 ===== */
  const DESK_IMG="photo/desk.jpg";     // 桌面底圖（要有一本空白的打開筆記本，整本都在畫面內）
  const CHARM_IMG="photo/charm.png";   // 吊飾（留空＝不顯示）
  const CHARM_POS={x:60,y:36,w:34};    // 吊飾位置：離左邊%、離上面%、寬度%
  /* 兩頁在底圖上的位置（四個角，依序：左上、右上、右下、左下；單位是底圖的百分比）。
     不準的話：網址後面加 #calib，拖曳圓點對齊本子，把下面顯示的那行複製貼回這裡 */
  const BOOK={"L":[[6,55],[50,53],[52,86],[4,88]],"R":[[50,53],[94,52],[96,87],[52,86]]};
  /* ======================== */
  const $=id=>document.getElementById(id);
  const SBU=SB_URL.replace(/\/$/,''),NAME_RE=/^[A-Za-z0-9_-]{6,60}\.jpg$/;
  const gURL=f=>NAME_RE.test(f||'')?SBU+'/storage/v1/object/public/gallery/'+f:'';
  const PW=400,PH=560;

  const st=document.createElement('style');st.textContent=`
  #p-gallery #grid{display:none}
  #album{margin:0 6px 10px;position:relative}
  #album .stg{position:relative;width:100%;aspect-ratio:3/4;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,#e9def4 0,#f3ecf8 30%,#fbf9fd 55%,#fff 100%);box-shadow:0 6px 18px rgba(80,60,120,.25)}
  #album .desk{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  #album .cover{position:absolute;inset:0;background:#bda4dd;filter:drop-shadow(0 8px 10px rgba(90,70,130,.35))}
  #album .pgw{position:absolute;left:0;top:0;width:${PW}px;height:${PH}px;transform-origin:0 0;overflow:hidden;visibility:hidden;color:#5b4358}
  #album .pgw.L{background:linear-gradient(90deg,#f8f4fc 0,#f8f4fc 80%,#e6dcf0 100%)}
  #album .pgw.R{background:linear-gradient(90deg,#e6dcf0 0,#f8f4fc 20%,#f8f4fc 100%)}
  #album .pgw.ov{z-index:3}
  #album .in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:30px 34px}
  #album .pol{position:relative;background:#fff;padding:14px 14px 16px;box-shadow:0 4px 12px rgba(90,70,130,.3);line-height:0;cursor:pointer;min-width:200px;min-height:150px;background-clip:padding-box}
  #album .pol img{display:block;max-width:320px;max-height:330px;width:auto;height:auto;background:#eadff3}
  #album .pol.lk img{filter:blur(18px)}
  #album .pol .soon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;letter-spacing:.2em;text-shadow:0 1px 6px rgba(60,30,80,.7)}
  #album .cap{font-family:"Segoe Script","Bradley Hand","Noto Sans TC",cursive;line-height:1.4;text-align:center;width:100%}
  #album .cap b{display:block;font-size:26px;color:#5b4358}
  #album .cap span{display:block;font-size:20px;color:#8a7a95;margin-top:2px}
  #album .cap i{display:block;font-size:18px;color:#a898a8;margin-top:4px}
  #album .in::after{content:"✿";position:absolute;right:18px;bottom:12px;font-size:20px;color:#dcc3d2}
  #album .charm2{position:absolute;z-index:7;pointer-events:none;transform-origin:50% 0;animation:asway 3.5s ease-in-out infinite alternate;filter:drop-shadow(0 6px 6px rgba(110,85,150,.3))}
  @keyframes asway{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
  #album .anav{display:flex;justify-content:center;align-items:center;gap:18px;margin-top:10px;color:#fff4f8;font-size:.72rem}
  #album .anav button{width:34px;height:34px;border:0;border-radius:50%;background:#e6d9f2;color:#5b4358;font-size:1rem;cursor:pointer;padding:0}
  #album .anav button:disabled{opacity:.35}
  #album .empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#7a5a82;font-size:.8rem;z-index:6}
  #album .hd{position:absolute;z-index:9;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:rgba(229,72,77,.75);border:2px solid #fff;touch-action:none}
  #album textarea.cal{width:100%;height:70px;margin-top:8px;font-size:11px}`;
  document.head.appendChild(st);

  const al=document.createElement('div');al.id='album';
  al.innerHTML='<div class="stg" id="stg"><img class="desk" alt=""><div class="cover"></div><div class="pgw L" id="pL"></div><div class="pgw R" id="pR"></div><div class="pgw L ov" id="oL"></div><div class="pgw R ov" id="oR"></div></div><div class="anav"><button id="aprev" aria-label="上一頁">‹</button><span id="acnt"></span><button id="anext" aria-label="下一頁">›</button></div>';
  $('cats').insertAdjacentElement('afterend',al);
  const stg=$('stg'),desk=al.querySelector('.desk'),cover=al.querySelector('.cover');
  const el={L:$('pL'),R:$('pR'),oL:$('oL'),oR:$('oR')};
  if(CHARM_IMG){const c=document.createElement('img');c.className='charm2';c.src=CHARM_IMG;c.alt='';c.style.cssText=`left:${CHARM_POS.x}%;top:${CHARM_POS.y}%;width:${CHARM_POS.w}%`;stg.appendChild(c);c.onerror=()=>c.remove();}
  if(DESK_IMG){desk.onload=()=>{cover.style.display='none';stg.style.aspectRatio=desk.naturalWidth+'/'+desk.naturalHeight;layout();};desk.onerror=()=>{desk.style.display='none';};desk.src=DESK_IMG;}else desk.style.display='none';

  /* 透視：把 400x560 的平面頁面，對應到底圖上的四個角 */
  function solve(A,b){const n=b.length;for(let i=0;i<n;i++){let p=i;for(let r=i+1;r<n;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r;[A[i],A[p]]=[A[p],A[i]];[b[i],b[p]]=[b[p],b[i]];
    for(let r=i+1;r<n;r++){const f=A[r][i]/A[i][i];for(let c=i;c<n;c++)A[r][c]-=f*A[i][c];b[r]-=f*b[i];}}
    const x=Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=b[i];for(let c=i+1;c<n;c++)s-=A[i][c]*x[c];x[i]=s/A[i][i];}return x;}
  function homog(q){const src=[[0,0],[PW,0],[PW,PH],[0,PH]],A=[],b=[];
    for(let i=0;i<4;i++){const[x,y]=src[i],[u,v]=q[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v);}
    const h=solve(A,b);return `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;}
  let M={L:'',R:''};
  const T=(side,s)=>{s=Math.max(s,.0001);return side==='L'?`${M.L} translateX(${PW}px) scaleX(${s}) translateX(${-PW}px)`:`${M.R} scaleX(${s})`;};
  const cur={L:1,R:1,oL:0,oR:0};
  const sideOf=k=>k.slice(-1);
  function put(k,s){cur[k]=s;el[k].style.transform=T(sideOf(k),s);}
  function layout(){const w=stg.clientWidth,h=stg.clientHeight;if(!w)return;
    const px=q=>q.map(([x,y])=>[x*w/100,y*h/100]);M.L=homog(px(BOOK.L));M.R=homog(px(BOOK.R));
    Object.keys(el).forEach(k=>put(k,cur[k]));
    const o=[BOOK.L[0],BOOK.R[1],BOOK.R[2],BOOK.L[3]];cover.style.clipPath='polygon('+o.map(p=>p[0]+'% '+p[1]+'%').join(',')+')';}
  new ResizeObserver(layout).observe(stg);

  /* 內容 */
  let rows=[],f=0,busy=false;
  const findOld=row=>[...document.querySelectorAll('#grid .item')].find(e=>{const h=e.querySelector('h3');return h&&h.textContent===row.title;});
  const domThumb=row=>{const it=findOld(row),im=it&&it.querySelector('img');return im?im.getAttribute('src'):'';};
  function fill(k,row){const p=el[k];p.textContent='';const w=document.createElement('div');w.className='in';p.appendChild(w);if(!row)return;
    const lock=!!row.locked;
    const src=lock?(gURL(row.thumb)||domThumb(row)):(gURL(row.photos&&row.photos[0])||gURL(row.thumb)||domThumb(row));
    const pol=document.createElement('div');pol.className='pol'+(lock?' lk':'');
    if(src){const im=document.createElement('img');im.src=src;im.alt='';im.onerror=()=>{const d=domThumb(row);if(d&&!im.dataset.fb){im.dataset.fb=1;im.src=d;}};pol.appendChild(im);}
    if(lock){const s=document.createElement('div');s.className='soon';s.textContent='to be soon';pol.appendChild(s);}
    pol.onclick=()=>{if(!swiped){const it=findOld(row);if(it)it.click();}};
    const cap=document.createElement('div');cap.className='cap';
    const b=document.createElement('b');b.textContent=row.title||'';cap.appendChild(b);
    if(row.scene){const s=document.createElement('span');s.textContent=row.scene;cap.appendChild(s);}
    if(row.date){const d=document.createElement('i');d.textContent=row.date;cap.appendChild(d);}
    w.append(pol,cap);}
  const vis=(k,v)=>{el[k].style.visibility=v?'visible':'hidden';};
  const maxF=()=>Math.max(0,Math.ceil(rows.length/2)-1);
  function update(){$('aprev').disabled=f<=0;$('anext').disabled=f>=maxF();const n=rows.length;$('acnt').textContent=n?`${Math.min(n,f*2+1)}–${Math.min(n,f*2+2)} / ${n}`:'';}
  function show(){fill('L',rows[2*f]);fill('R',rows[2*f+1]);vis('L',1);vis('R',1);vis('oL',0);vis('oR',0);put('L',1);put('R',1);update();}
  function build(){f=0;busy=false;let e=al.querySelector('.empty');
    if(!rows.length){vis('L',0);vis('R',0);if(!e){e=document.createElement('div');e.className='empty';stg.appendChild(e);}e.textContent='這個分類還沒有照片';update();return;}
    if(e)e.remove();show();}
  async function run(k,s0,s1,ms){const a=el[k].animate([{transform:T(sideOf(k),s0),filter:'brightness(1)'},{transform:T(sideOf(k),s1),filter:'brightness(.88)'}],{duration:ms,easing:'ease-in-out'});
    try{await a.finished;}catch(e){}put(k,s1);a.cancel();}
  async function go(dir){const nf=f+dir;if(busy||nf<0||nf>maxF())return;busy=true;
    if(dir>0){fill('oR',rows[2*f+1]);put('oR',1);vis('oR',1);fill('R',rows[2*nf+1]);fill('oL',rows[2*nf]);put('oL',0);vis('oL',1);
      await run('oR',1,0,320);vis('oR',0);await run('oL',0,1,320);fill('L',rows[2*nf]);vis('oL',0);}
    else{fill('oL',rows[2*f]);put('oL',1);vis('oL',1);fill('L',rows[2*nf]);fill('oR',rows[2*nf+1]);put('oR',0);vis('oR',1);
      await run('oL',1,0,320);vis('oL',0);await run('oR',0,1,320);fill('R',rows[2*nf+1]);vis('oR',0);}
    f=nf;update();busy=false;}
  $('anext').onclick=()=>go(1);$('aprev').onclick=()=>go(-1);
  let sx=0,sy=0,swiped=false;
  al.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;swiped=false;},{passive:true});
  al.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5){swiped=true;go(dx<0?1:-1);setTimeout(()=>swiped=false,300);}},{passive:true});

  /* 校正模式：網址加 #calib，拖曳紅點對齊本子，複製下面那行貼回 BOOK */
  function calib(){const ta=document.createElement('textarea');ta.className='cal';ta.readOnly=true;al.appendChild(ta);
    const out=()=>{ta.value='const BOOK='+JSON.stringify(BOOK.L&&{L:BOOK.L.map(p=>p.map(v=>+v.toFixed(1))),R:BOOK.R.map(p=>p.map(v=>+v.toFixed(1)))})+';';};
    const pts=[[BOOK.L,0],[BOOK.L,1],[BOOK.L,2],[BOOK.L,3],[BOOK.R,1],[BOOK.R,2]];
    pts.forEach(([q,i])=>{const h=document.createElement('i');h.className='hd';stg.appendChild(h);
      const pos=()=>{h.style.left=q[i][0]+'%';h.style.top=q[i][1]+'%';};pos();
      h.addEventListener('pointerdown',e=>{h.setPointerCapture(e.pointerId);e.preventDefault();});
      h.addEventListener('pointermove',e=>{if(!h.hasPointerCapture(e.pointerId))return;const r=stg.getBoundingClientRect();
        q[i]=[(e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100];
        if(q===BOOK.L&&i===1)BOOK.R[0]=q[i];if(q===BOOK.L&&i===2)BOOK.R[3]=q[i];   /* 書脊兩點左右頁共用 */
        pos();layout();out();});});
    out();}
  if(location.hash==='#calib')calib();

  /* 資料：跟原本相簿用同一個資料表；分類按鈕換了、或相簿重新整理時，這邊跟著重做 */
  const catNow=()=>{const b=document.querySelector('#cats button.on');return b?b.textContent:'ALL';};
  const inCat=r=>{const c=catNow();return c==='ALL'?r.category!=='Gift Art':r.category===c;};
  async function refresh(){
    if(!sbReady()){rows=[];build();return;}
    const q=name=>fetch(SBU+'/rest/v1/'+name+'?select=*&order=sort.asc,id.asc&limit=200',{headers:{apikey:SB_KEY}});
    let all=null;try{let r=await q('gallery_public');if(!r.ok)r=await q('gallery');if(r.ok)all=await r.json();}catch(e){}
    rows=(all||[]).filter(inCat);build();}
  let tm=0;
  new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(refresh,150);}).observe($('grid'),{childList:true});
  layout();refresh();
})();
