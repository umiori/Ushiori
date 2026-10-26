/* album.js v3：2D 手繪手帳風。粉白格子桌布＋紫色活頁本（粗線條、貼紙、紙膠帶）＋吊飾，可翻頁。
   用法：index.html 最後 </body> 前面有 <script src="album.js"></script> 就好（取代舊的 album.js）。 */
(function(){
  /* ===== 可以改的設定 ===== */
  const CHARM_IMG="photo/charm.png";   // 吊飾（留空＝不顯示）
  const STICKERS=[];                   // 想放自己的貼紙：[{img:"photo/s1.png",css:"left:40%;top:-8%;width:16%;transform:rotate(8deg)"}]（位置是相對於本子）
  const INK="#3b3438";                 // 粗線條的顏色
  /* ======================== */
  const $=id=>document.getElementById(id);
  const SBU=SB_URL.replace(/\/$/,''),NAME_RE=/^[A-Za-z0-9_-]{6,60}\.jpg$/;
  const gURL=f=>NAME_RE.test(f||'')?SBU+'/storage/v1/object/public/gallery/'+f:'';

  const st=document.createElement('style');st.textContent=`
  #p-gallery #grid{display:none}
  #album{margin:0 6px 10px;--ink:${INK}}
  #album .stg{position:relative;border-radius:18px;overflow:hidden;padding:58px 16px 84px;border:3px solid var(--ink);
    background:conic-gradient(#f9d5e3 25%,#fff8fb 0 50%,#f9d5e3 0 75%,#fff8fb 0) 0 0/46px 46px}
  #album .env{position:absolute;z-index:0;top:10px;left:7%;width:46%;transform:rotate(-7deg)}
  #album .bk{position:relative;z-index:1;width:88%;margin:0 auto;aspect-ratio:1.4/1;container-type:inline-size;transform:rotate(-3deg)}
  #album .cov{position:absolute;inset:-3.4cqw -3.2cqw;background:#aa97bf;border:.8cqw solid var(--ink);border-radius:4.5cqw;box-shadow:1.6cqw 1.8cqw 0 #cbbfdc}
  #album .pgs{position:absolute;inset:0;perspective:150cqw}
  #album .pg{position:absolute;top:0;height:100%;width:50%;overflow:hidden;visibility:hidden;color:#5b4358;border:.5cqw solid var(--ink);background-color:#fdf7fb;
    background-image:repeating-linear-gradient(0deg,transparent 0 5.6cqw,rgba(190,170,205,.28) 5.6cqw 5.9cqw)}
  #album .pg.L{left:0;border-radius:2.6cqw 0 0 2.6cqw;transform-origin:100% 50%;box-shadow:inset -5cqw 0 4cqw -4cqw rgba(140,115,170,.35)}
  #album .pg.R{left:50%;border-radius:0 2.6cqw 2.6cqw 0;transform-origin:0 50%;box-shadow:inset 5cqw 0 4cqw -4cqw rgba(140,115,170,.35)}
  #album .pg.ov{z-index:3}
  #album .sp{position:absolute;z-index:6;left:50%;top:-1.4cqw;bottom:-1.4cqw;width:5.5cqw;margin-left:-2.75cqw;background:#8d7aa2;border:.6cqw solid var(--ink);border-radius:1.6cqw}
  #album .rg{position:absolute;z-index:7;left:50%;width:16cqw;height:3.4cqw;margin-left:-8cqw;background:linear-gradient(#c4c0cc,#8f8b9a);border:.5cqw solid var(--ink);border-radius:2cqw}
  #album .rg::before,#album .rg::after{content:"";position:absolute;top:-.7cqw;width:4.4cqw;height:4.4cqw;border-radius:50%;background:#b59fcc;border:.5cqw solid var(--ink)}
  #album .rg::before{left:-1.4cqw}#album .rg::after{right:-1.4cqw}
  #album .tape{position:absolute;z-index:8;top:-6.4cqw;left:6cqw;width:30cqw;height:7.5cqw;transform:rotate(-5deg);background:#dcc3e6;border:.5cqw solid var(--ink);display:flex;align-items:center;justify-content:center;color:#7a5a82;font-size:4.5cqw;letter-spacing:1cqw}
  #album .bow{position:absolute;z-index:8;left:46cqw;top:-8cqw;width:19cqw}
  #album .bun{position:absolute;z-index:8;left:62cqw;top:-9cqw;width:13cqw;transform:rotate(8deg)}
  #album .stk{position:absolute;z-index:8}
  #album .in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3.4cqw;padding:5cqw 4cqw}
  #album .pol{position:relative;background:#fff;padding:2cqw 2cqw 3cqw;border:.6cqw solid var(--ink);border-radius:1cqw;box-shadow:1cqw 1cqw 0 rgba(140,115,170,.3);line-height:0;cursor:pointer;min-width:24cqw;min-height:18cqw;transform:rotate(var(--r,0deg))}
  #album .pol::before{content:"";position:absolute;top:-3.4cqw;left:50%;width:13cqw;height:4.6cqw;margin-left:-6.5cqw;transform:rotate(-5deg);background:rgba(246,222,160,.92);border:.4cqw solid var(--ink);z-index:2}
  #album .pol img{display:block;max-width:35cqw;max-height:33cqw;width:auto;height:auto;background:#eadff3}
  #album .pol.lk img{filter:blur(14px)}
  #album .pol .soon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:3.6cqw;letter-spacing:.2em;text-shadow:0 1px 5px rgba(60,30,80,.7)}
  #album .cap{font-family:"Segoe Script","Bradley Hand","Noto Sans TC",cursive;line-height:1.35;text-align:center;width:100%}
  #album .cap b{display:block;font-size:4.4cqw;color:#a8567a}
  #album .cap span{display:block;font-size:3.5cqw;color:#8a7a95;margin-top:.4cqw}
  #album .cap i{display:inline-block;font-style:normal;font-size:3cqw;color:#7a6a8a;margin-top:1.2cqw;padding:.2cqw 2.4cqw;border:.4cqw solid var(--ink);border-radius:3cqw;background:#fff}
  #album .charm2{position:absolute;z-index:9;left:-3%;bottom:-8px;width:46%;pointer-events:none;transform:rotate(-4deg);
    filter:drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 4px 4px rgba(90,60,110,.3))}
  #album .anav{display:flex;justify-content:center;align-items:center;gap:18px;margin-top:10px;color:#fff4f8;font-size:.72rem}
  #album .anav button{width:34px;height:34px;border:2px solid var(--ink);border-radius:50%;background:#f9d5e3;color:var(--ink);font-size:1rem;cursor:pointer;padding:0}
  #album .anav button:disabled{opacity:.35}
  #album .empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#7a5a82;font-size:.8rem;z-index:6}`;
  document.head.appendChild(st);

  const al=document.createElement('div');al.id='album';
  al.innerHTML=`<div class="stg" id="stg">
    <svg class="env" viewBox="0 0 120 80"><g fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"><rect x="4" y="14" width="112" height="62" rx="3"/><path d="M4 16L60 52L116 16"/></g><path d="M20 66h30M70 66h30" stroke="#c9b6d6" stroke-width="3" stroke-linecap="round"/></svg>
    <div class="bk" id="bk"><div class="cov"></div><div class="tape">♥ ‿ ♥</div>
      <svg class="bow" viewBox="0 0 60 38"><g fill="#f7a8c4" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"><path d="M30 19C21 3 6 2 4 11c-2 9 7 17 26 8zM30 19C39 3 54 2 56 11c2 9-7 17-26 8z"/><rect x="24" y="12" width="12" height="14" rx="4"/></g></svg>
      <svg class="bun" viewBox="0 0 40 52"><g fill="#fff" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"><path d="M12 22C8 6 12 2 16 4c3 2 3 10 3 18zM28 22c4-16 0-20-4-18-3 2-3 10-3 18z"/><ellipse cx="20" cy="34" rx="15" ry="14"/></g><circle cx="14" cy="33" r="1.9" fill="${INK}"/><circle cx="26" cy="33" r="1.9" fill="${INK}"/><ellipse cx="10.5" cy="38" rx="3.2" ry="2.1" fill="#f7b6c9"/><ellipse cx="29.5" cy="38" rx="3.2" ry="2.1" fill="#f7b6c9"/></svg>
      <div class="pgs"><div class="pg L" id="pL"></div><div class="pg R" id="pR"></div><div class="pg L ov" id="oL"></div><div class="pg R ov" id="oR"></div></div>
      <div class="sp"></div><div class="rg" style="top:17%"></div><div class="rg" style="top:48%"></div><div class="rg" style="top:78%"></div>
    </div></div>
    <div class="anav"><button id="aprev" aria-label="上一頁">‹</button><span id="acnt"></span><button id="anext" aria-label="下一頁">›</button></div>`;
  $('cats').insertAdjacentElement('afterend',al);
  const stg=$('stg'),bk=$('bk');
  const el={L:$('pL'),R:$('pR'),oL:$('oL'),oR:$('oR')};
  STICKERS.forEach(s=>{const im=document.createElement('img');im.className='stk';im.src=s.img;im.alt='';im.style.cssText=s.css||'';im.onerror=()=>im.remove();bk.appendChild(im);});
  if(CHARM_IMG){const c=document.createElement('img');c.className='charm2';c.src=CHARM_IMG;c.alt='';c.onerror=()=>c.remove();stg.appendChild(c);}

  /* 翻頁（真的轉動，頁面是平的） */
  const sideOf=k=>k.slice(-1);
  const T=(side,s)=>{const a=(1-Math.max(0,Math.min(1,s)))*90;return `rotateY(${side==='L'?a:-a}deg)`;};
  const cur={L:1,R:1,oL:0,oR:0};
  const put=(k,s)=>{cur[k]=s;el[k].style.transform=T(sideOf(k),s);};
  const vis=(k,v)=>{el[k].style.visibility=v?'visible':'hidden';};

  let rows=[],f=0,busy=false,swiped=false;
  const findOld=row=>[...document.querySelectorAll('#grid .item')].find(e=>{const h=e.querySelector('h3');return h&&h.textContent===row.title;});
  const domThumb=row=>{const it=findOld(row),im=it&&it.querySelector('img');return im?im.getAttribute('src'):'';};
  function fill(k,row,idx){const p=el[k];p.textContent='';const w=document.createElement('div');w.className='in';p.appendChild(w);if(!row)return;
    const lock=!!row.locked;
    const src=lock?(gURL(row.thumb)||domThumb(row)):(gURL(row.photos&&row.photos[0])||gURL(row.thumb)||domThumb(row));
    const pol=document.createElement('div');pol.className='pol'+(lock?' lk':'');pol.style.setProperty('--r',(((idx||0)%5)-2)*1.3+'deg');
    if(src){const im=document.createElement('img');im.src=src;im.alt='';im.onerror=()=>{const d=domThumb(row);if(d&&!im.dataset.fb){im.dataset.fb=1;im.src=d;}};pol.appendChild(im);}
    if(lock){const s=document.createElement('div');s.className='soon';s.textContent='to be soon';pol.appendChild(s);}
    pol.onclick=()=>{if(!swiped){const it=findOld(row);if(it)it.click();}};
    const cap=document.createElement('div');cap.className='cap';
    const b=document.createElement('b');b.textContent=row.title||'';cap.appendChild(b);
    if(row.scene){const s=document.createElement('span');s.textContent=row.scene;cap.appendChild(s);}
    if(row.date){const d=document.createElement('i');d.textContent=row.date;cap.appendChild(d);}
    w.append(pol,cap);}
  const maxF=()=>Math.max(0,Math.ceil(rows.length/2)-1);
  function update(){$('aprev').disabled=f<=0;$('anext').disabled=f>=maxF();const n=rows.length;$('acnt').textContent=n?`${Math.min(n,f*2+1)}–${Math.min(n,f*2+2)} / ${n}`:'';}
  function show(){fill('L',rows[2*f],2*f);fill('R',rows[2*f+1],2*f+1);vis('L',1);vis('R',1);vis('oL',0);vis('oR',0);put('L',1);put('R',1);put('oL',0);put('oR',0);update();}
  function build(){f=0;busy=false;let e=al.querySelector('.empty');
    if(!rows.length){vis('L',0);vis('R',0);if(!e){e=document.createElement('div');e.className='empty';bk.appendChild(e);}e.textContent='這個分類還沒有照片';update();return;}
    if(e)e.remove();show();}
  async function run(k,s0,s1,ms){const a=el[k].animate([{transform:T(sideOf(k),s0),filter:'brightness(1)'},{transform:T(sideOf(k),s1),filter:'brightness(.9)'}],{duration:ms,easing:'ease-in-out'});
    try{await a.finished;}catch(e){}put(k,s1);a.cancel();}
  async function go(dir){const nf=f+dir;if(busy||nf<0||nf>maxF())return;busy=true;
    if(dir>0){fill('oR',rows[2*f+1],2*f+1);put('oR',1);vis('oR',1);fill('R',rows[2*nf+1],2*nf+1);fill('oL',rows[2*nf],2*nf);put('oL',0);vis('oL',1);
      await run('oR',1,0,320);vis('oR',0);await run('oL',0,1,320);fill('L',rows[2*nf],2*nf);vis('oL',0);}
    else{fill('oL',rows[2*f],2*f);put('oL',1);vis('oL',1);fill('L',rows[2*nf],2*nf);fill('oR',rows[2*nf+1],2*nf+1);put('oR',0);vis('oR',1);
      await run('oL',1,0,320);vis('oL',0);await run('oR',0,1,320);fill('R',rows[2*nf+1],2*nf+1);vis('oR',0);}
    f=nf;update();busy=false;}
  $('anext').onclick=()=>go(1);$('aprev').onclick=()=>go(-1);
  let sx=0,sy=0;
  al.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;swiped=false;},{passive:true});
  al.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5){swiped=true;go(dx<0?1:-1);setTimeout(()=>swiped=false,300);}},{passive:true});

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
  refresh();
})();
