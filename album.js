/* album.js：把相簿頁變成「桌上的立體翻頁本子」。
   用法：index.html 最後面 </body> 前面加一行 <script src="album.js"></script>
   原本的分類按鈕、管理功能、鎖定卡片都保留；點照片會打開原本的完整檢視視窗。 */
(function(){
  /* ===== 可以改的設定 ===== */
  const TABLE_IMG="";   // 桌面圖片路徑，例如 "photo/table.jpg"；留空＝白色桌面
  const CHARM_IMG="photo/charm.png";   // 吊飾圖片路徑（把 charm.png 放進 photo 資料夾）；留空＝不顯示
  const PROPS=[];       // 桌上的小雜物（透明 PNG），例如 [{img:"photo/lav.png",css:"top:6px;right:4px;width:110px;transform:rotate(20deg)"}]；留空＝用內建的薰衣草和小花
  /* ======================== */
  const $=id=>document.getElementById(id);
  const SBU=SB_URL.replace(/\/$/,''),NAME_RE=/^[A-Za-z0-9_-]{6,60}\.jpg$/;
  const gURL=f=>NAME_RE.test(f||'')?SBU+'/storage/v1/object/public/gallery/'+f:'';

  const css=`
  #p-gallery #grid{display:none}
  #album{--bw:min(340px,calc(100vw - 64px));--pw:calc(var(--bw)/2);--ph:calc(var(--pw)*1.4);position:relative;margin:0 6px 10px;padding:8px 0 16px;border-radius:18px;overflow:hidden;
    background:${TABLE_IMG?`url("${TABLE_IMG}") center/cover`:`repeating-linear-gradient(115deg,transparent 0 70px,rgba(255,255,255,.5) 70px 120px),linear-gradient(180deg,#e9def4 0,#f3ecf8 130px,#fbf9fd 210px,#fff 100%)`};box-shadow:inset 0 2px 10px rgba(120,100,150,.18)}
  #album .props{position:absolute;inset:0;pointer-events:none;z-index:1}
  #album .props>*{position:absolute}
  #album .persp{perspective:1100px;display:flex;justify-content:center;padding:128px 0 40px;position:relative;z-index:2}
  #album .tilt{transform:rotateX(18deg) rotateZ(-3deg);transform-style:preserve-3d}
  #album .book{position:relative;width:var(--bw);height:var(--ph);transform-style:preserve-3d}
  #album .book::before{content:"";position:absolute;inset:-7px;background:#bda4dd;border-radius:7px;box-shadow:5px 4px 0 #e4d9f0,8px 7px 0 #d6c8e8,0 18px 26px rgba(110,85,150,.35);transform:translateZ(-2px)}
  #album .pg{position:absolute;top:0;width:var(--pw);height:var(--ph);background:#f8f4fb;color:#5b4358;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px 10px;text-align:center}
  #album .pg.L{left:0;box-shadow:inset -16px 0 14px -12px rgba(100,80,140,.3);border-radius:4px 0 0 4px}
  #album .pg.R{left:50%;box-shadow:inset 16px 0 14px -12px rgba(100,80,140,.3);border-radius:0 4px 4px 0}
  #album .leaf{position:absolute;left:50%;top:0;width:var(--pw);height:var(--ph);transform-origin:left center;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.4,.1,.2,1)}
  #album .leaf .pg{left:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
  #album .leaf .pg.L{transform:rotateY(180deg)}
  #album .pol{position:relative;background:#fff;padding:5px;box-shadow:0 2px 6px rgba(60,40,20,.3);transform:rotate(var(--r,0deg));cursor:pointer;line-height:0}
  #album .pol img{display:block;max-width:calc(var(--pw) - 34px);max-height:calc(var(--ph)*.56);width:auto;height:auto}
  #album .pol.lk img{filter:blur(12px)}
  #album .pol .soon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.68rem;letter-spacing:.2em;line-height:1.2;text-shadow:0 1px 4px rgba(60,30,80,.6)}
  #album .cap{font-family:"Segoe Script","Bradley Hand","Noto Sans TC",cursive;line-height:1.35;width:100%}
  #album .cap b{display:block;font-size:.8rem;color:#5b4358}
  #album .cap span{display:block;font-size:.66rem;color:#8a7a95;margin-top:1px}
  #album .cap i{display:block;font-size:.6rem;color:#a898a8;margin-top:2px}
  #album .pg::after{content:"✿";position:absolute;right:8px;bottom:5px;font-size:.7rem;color:#e3c3cc}
  #album .anav{position:relative;z-index:6;display:flex;justify-content:center;align-items:center;gap:18px;color:#7a5a82;font-size:.72rem}
  #album .anav button{width:34px;height:34px;border:0;border-radius:50%;background:#e6d9f2;color:#5b4358;font-size:1rem;cursor:pointer;padding:0}
  #album .anav button:disabled{opacity:.35}
  #album .empty{padding:60px 20px;color:#7a5a82;font-size:.8rem}
  .cl{position:absolute;background:linear-gradient(145deg,#fff,#e9e0f3);box-shadow:inset -3px -4px 8px rgba(150,125,185,.28),inset 3px 3px 6px #fff,0 8px 12px rgba(130,105,170,.28);border-radius:8px}
  .cl.lv{background:linear-gradient(145deg,#e8dbf7,#b79fdc)}.cl.pk{background:linear-gradient(145deg,#fde8f1,#f0b9d2)}
  .cl.mug{border-radius:6px 6px 16px 16px;display:flex;align-items:center;justify-content:center;font-size:.8rem}
  .cl.mug::before{content:"";position:absolute;left:3px;right:3px;top:2px;height:9px;border-radius:50%;background:#c9a98f}
  .cl.mug::after{content:"";position:absolute;right:-12px;top:8px;width:14px;height:16px;border:5px solid #ece4f5;border-left:0;border-radius:0 12px 12px 0}
  .cl.dr{background:repeating-linear-gradient(0deg,transparent 0 19px,rgba(150,125,185,.3) 19px 21px),linear-gradient(145deg,#fff,#ebe3f5)}
  #album .charm2{position:absolute;z-index:7;top:150px;right:-2px;width:128px;transform-origin:50% 0;animation:asway 3.5s ease-in-out infinite alternate;filter:drop-shadow(0 6px 6px rgba(110,85,150,.3));pointer-events:none}
  @keyframes asway{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
  #album .bk{width:96px;height:20px;border-radius:3px;left:0;box-shadow:0 2px 4px rgba(90,70,120,.3)}
  #album .bk::after{content:"";position:absolute;right:4px;top:3px;bottom:3px;width:70%;border-radius:2px;background:repeating-linear-gradient(0deg,#fff 0 2px,#eadff3 2px 3px)}
  #album .charm{top:0;right:14px;width:72px;transform-origin:top center;animation:asway 3s ease-in-out infinite alternate;text-align:center}
  #album .charm .st{width:1.5px;height:44px;background:#b9a3d0;margin:0 auto}
  #album .charm .fr{background:#fff;padding:4px 4px 10px;border-radius:3px;box-shadow:0 3px 8px rgba(90,70,120,.35);line-height:0}
  #album .charm .fr img,#album .charm .fr div{width:100%;aspect-ratio:1/1;object-fit:cover;display:flex;align-items:center;justify-content:center;background:#f3d9e6;color:#e58fb0;font-size:1.6rem;line-height:1}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* 內建小雜物：薰衣草＋小花（SVG） */
  function lav(){let s='<svg viewBox="0 0 80 150" width="90" height="170" xmlns="http://www.w3.org/2000/svg"><g stroke="#7c8a64" stroke-width="2" fill="none"><path d="M40 150C38 110 34 60 28 12"/><path d="M42 150C46 110 50 62 58 20"/><path d="M41 150C41 100 40 50 42 4"/></g><g fill="#8570a8">';
    [[28,12],[58,20],[42,4]].forEach(([x,y])=>{for(let i=0;i<9;i++){const yy=y+i*9,xx=x+(i%2?5:-5)+(Math.sin(i)*2);s+=`<ellipse cx="${xx}" cy="${yy+6}" rx="4.5" ry="7" transform="rotate(${i%2?25:-25} ${xx} ${yy+6})"/>`;}});
    return s+'</g></svg>';}
  function flower(){let s='<svg viewBox="0 0 60 60" width="56" height="56" xmlns="http://www.w3.org/2000/svg"><g fill="#f2b8c8">';
    for(let i=0;i<5;i++)s+=`<ellipse cx="30" cy="14" rx="9" ry="13" transform="rotate(${i*72} 30 30)"/>`;
    return s+'</g><circle cx="30" cy="30" r="6" fill="#f6d77a"/></svg>';}

  /* 骨架 */
  const al=document.createElement('div');al.id='album';
  al.innerHTML='<div class="props"></div><div class="persp"><div class="tilt"><div class="book" id="abook"></div></div></div><div class="anav"><button id="aprev" aria-label="上一頁">‹</button><span id="acnt"></span><button id="anext" aria-label="下一頁">›</button></div>';
  $('cats').insertAdjacentElement('afterend',al);
  const props=al.querySelector('.props');
  if(PROPS.length)PROPS.forEach(p=>{const im=document.createElement('img');im.src=p.img;im.alt='';im.style.cssText=p.css||'';props.appendChild(im);});
  else props.insertAdjacentHTML('beforeend',
    '<div class="cl lv" style="left:8px;top:34px;width:112px;height:76px;border-radius:10px 10px 4px 4px;transform:perspective(300px) rotateY(18deg);display:flex;align-items:center;justify-content:center;font-size:1.2rem">🐰</div>'+
    '<div class="cl mug" style="left:132px;top:66px;width:44px;height:40px">🎀</div>'+
    '<div class="cl lv" style="left:196px;top:30px;width:22px;height:78px;border-radius:4px"></div>'+
    '<div class="cl" style="left:220px;top:22px;width:24px;height:86px;border-radius:4px"></div>'+
    '<div class="cl pk" style="left:246px;top:34px;width:22px;height:74px;border-radius:4px"></div>'+
    '<div class="cl dr" style="left:284px;top:46px;width:86px;height:62px"></div>'+
    '<div class="cl lv" style="left:296px;top:10px;width:34px;height:42px;border-radius:5px;border:3px solid #fff"></div>');
  if(CHARM_IMG){const c=document.createElement('img');c.className='charm2';c.src=CHARM_IMG;c.alt='';al.appendChild(c);}

  let rows=[],leaves=[],L=0,f=0,busy=false;
  const book=$('abook');
  const catNow=()=>{const b=document.querySelector('#cats button.on');return b?b.textContent:'ALL';};
  const inCat=r=>{const c=catNow();return c==='ALL'?r.category!=='Gift Art':r.category===c;};
  function openOld(row){const it=[...document.querySelectorAll('#grid .item')].find(e=>{const h=e.querySelector('h3');return h&&h.textContent===row.title;});if(it)it.click();}

  function pageEl(row,side,k){const p=document.createElement('div');p.className='pg '+side;if(!row)return p;
    const lock=!!row.locked,src=gURL(lock?row.thumb:((row.photos&&row.photos[0])||row.thumb));
    const pol=document.createElement('div');pol.className='pol'+(lock?' lk':'');pol.style.setProperty('--r',((k%5)-2)*0.8+'deg');
    if(src){const im=document.createElement('img');im.src=src;im.alt='';im.loading='lazy';pol.appendChild(im);}
    if(lock){const s=document.createElement('div');s.className='soon';s.textContent='to be soon';pol.appendChild(s);}
    pol.onclick=()=>{if(!swiped)openOld(row);};
    const cap=document.createElement('div');cap.className='cap';
    const b=document.createElement('b');b.textContent=row.title||'';cap.appendChild(b);
    if(row.scene){const s=document.createElement('span');s.textContent=row.scene;cap.appendChild(s);}
    if(row.date){const d=document.createElement('i');d.textContent=row.date;cap.appendChild(d);}
    p.append(pol,cap);return p;}

  const tf=(k,fl)=>fl?`translateZ(${(k+1)*.6}px) rotateY(-180deg)`:`translateZ(${(L-k+1)*.6+1}px) rotateY(0deg)`;
  const zi=(k,fl)=>fl?k+1:100-k;
  function update(){$('aprev').disabled=f<=0;$('anext').disabled=f>=L;
    const n=rows.length;$('acnt').textContent=n?`${Math.min(n,f*2+1)}–${Math.min(n,f*2+2)} / ${n}`:'';}

  function build(){book.textContent='';leaves=[];f=0;busy=false;
    const n=rows.length;
    if(!n){book.style.visibility='hidden';let e=al.querySelector('.empty');if(!e){e=document.createElement('div');e.className='empty';al.querySelector('.persp').appendChild(e);}e.textContent='這個分類還沒有照片';update();return;}
    book.style.visibility='';const e=al.querySelector('.empty');if(e)e.remove();
    L=n>1?Math.ceil((n-1)/2):0;
    book.appendChild(pageEl(rows[0],'L',0));
    book.appendChild(pageEl(null,'R',0));
    for(let k=0;k<L;k++){const lf=document.createElement('div');lf.className='leaf';
      lf.appendChild(pageEl(rows[2*k+1],'R',2*k+1));lf.appendChild(pageEl(rows[2*k+2],'L',2*k+2));
      lf.style.transform=tf(k,false);lf.style.zIndex=zi(k,false);book.appendChild(lf);leaves.push(lf);}
    update();}

  function next(){if(f>=L||busy)return;busy=true;const k=f,lf=leaves[k];lf.style.transform=tf(k,true);setTimeout(()=>{lf.style.zIndex=zi(k,true);},380);f++;update();setTimeout(()=>busy=false,500);}
  function prev(){if(f<=0||busy)return;busy=true;f--;const k=f,lf=leaves[k];lf.style.transform=tf(k,false);setTimeout(()=>{lf.style.zIndex=zi(k,false);},380);update();setTimeout(()=>busy=false,500);}
  $('anext').onclick=next;$('aprev').onclick=prev;

  /* 左右滑動翻頁 */
  let sx=0,sy=0,swiped=false;
  al.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;swiped=false;},{passive:true});
  al.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5){swiped=true;dx<0?next():prev();setTimeout(()=>swiped=false,300);}},{passive:true});

  /* 資料：跟原本相簿用同一個資料表；分類按鈕換了、或相簿重新整理時，這邊跟著重做 */
  async function refresh(){
    if(!sbReady()){rows=[];build();return;}
    const q=name=>fetch(SBU+'/rest/v1/'+name+'?select=*&order=sort.asc,id.asc&limit=200',{headers:{apikey:SB_KEY}});
    let all=null;try{let r=await q('gallery_public');if(!r.ok)r=await q('gallery');if(r.ok)all=await r.json();}catch(e){}
    rows=(all||[]).filter(inCat);build();}
  let tm=0;
  new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(refresh,150);}).observe($('grid'),{childList:true});
  refresh();
})();
