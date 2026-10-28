/* qa.js：第四頁「情侶 Q&A」改成翻頁式小冊子
   先看到一個信封（情侶 Q&A 小問答），點一下撕開，裡面一頁一題，像漫畫頁：大標題＋兩個對話框＋插圖。
   用法：index.html 最後 </body> 前面加一行 <script src="qa.js"></script>
   題目和回答還是用 index.html 裡原本的 const QA=[...]，不用動。 */
(function(){
  /* ===== 可以改的設定 ===== */
  const QA_IMGS=['photo/qa1.png'];   // 每一題的插圖，依題號：['photo/qa1.png','photo/qa2.png','',...]。沒有圖的題目會放兩個頭像
  const QA_FLIP=true;                // true＝左邊對話框是 QA 回答陣列的第 2 個（牛島），右邊是第 1 個（小魚）；插圖裡牛島在左邊的話維持 true
  /* ======================== */
  const sec=document.getElementById('p-qa');
  if(!sec||typeof QA==='undefined'||!QA.length)return;
  const INK='#333';

  const st=document.createElement('style');st.textContent=`
  #p-qa>.qh,#p-qa>.qavs,#p-qa>#qaList{display:none}
  #qb{container-type:inline-size;width:min(100%,400px);margin:0 auto;position:relative;color:#111}
  #qb .qenv{position:relative;width:92%;aspect-ratio:300/210;margin:12cqw auto 8cqw;cursor:pointer;transition:transform .6s ease,opacity .5s}
  #qb .qenv.gone{opacity:0;transform:translateY(10%) scale(.95);pointer-events:none}
  #qb .qenv svg{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 6px 10px rgba(70,45,100,.35))}
  #qb .peek{position:absolute;left:9%;right:9%;top:8%;height:70%;background:#fff;border:.5cqw solid ${INK};border-radius:1.6cqw;transition:transform .6s ease}
  #qb .qenv.torn .peek{transform:translateY(-30%)}
  #qb .etxt{position:absolute;left:0;right:0;top:34%;text-align:center;color:#5b4358;line-height:1.25;pointer-events:none}
  #qb .etxt b{display:block;font-size:9cqw;letter-spacing:.06em}
  #qb .etxt span{display:block;font-size:5.6cqw;letter-spacing:.3em;margin-top:1cqw}
  #qb .seal{position:absolute;left:50%;top:60%;width:11cqw;height:11cqw;margin:-5.5cqw 0 0 -5.5cqw;border-radius:50%;background:#f3a7c3;border:.5cqw solid ${INK};color:#fff;font-style:normal;font-size:6cqw;display:flex;align-items:center;justify-content:center;pointer-events:none}
  #qb .tearstrip{position:absolute;left:0;right:0;top:0;height:15%;background:#e7d9f4;border:.5cqw solid ${INK};border-bottom:.5cqw dashed ${INK};border-radius:2cqw 2cqw 0 0;transform-origin:0 100%;transition:transform .65s ease,opacity .55s}
  #qb .qenv.torn .tearstrip{transform:translate(-10%,-140%) rotate(-18deg);opacity:0}
  #qb .ehint{position:absolute;left:0;right:0;bottom:-7cqw;text-align:center;font-size:3.6cqw;color:var(--ink);letter-spacing:.12em}
  #qb .qbook{display:none;position:relative;margin-top:10cqw}
  #qb .qbook.on{display:block;animation:qbin .5s ease-out}
  @keyframes qbin{from{opacity:0;transform:translateY(7%)}to{opacity:1;transform:none}}
  #qb .qx{position:absolute;top:-9cqw;right:1cqw;width:8cqw;height:8cqw;border:0;border-radius:50%;background:rgba(255,255,255,.3);color:#fff;font-size:4cqw;cursor:pointer;padding:0}
  #qb .qpgs{position:relative;width:96%;margin:0 auto;aspect-ratio:950/1341;touch-action:pan-y}
  #qb .qpg{position:absolute;inset:0;background:#fff;border-radius:2.4cqw;box-shadow:0 .6cqw 2.2cqw rgba(60,30,90,.35);overflow:hidden;transition:transform .5s cubic-bezier(.4,.1,.2,1),opacity .4s;transform-origin:50% 100%}
  #qb .qin{height:100%;overflow-y:auto;display:flex;flex-direction:column;padding:6cqw 5cqw 3cqw;-webkit-overflow-scrolling:touch}
  #qb .qt{font-weight:900;line-height:1.25;margin:0 0 5cqw;color:#111;text-align:left}
  #qb .qbub{position:relative;flex:0 0 auto;max-width:70%;padding:3cqw 3.6cqw;background:#fff;border:.45cqw solid ${INK};border-radius:6cqw;font-size:3.9cqw;font-weight:600;line-height:1.55;color:#111;text-align:left;white-space:pre-wrap;word-break:break-word;margin-bottom:6cqw}
  #qb .qbub.l{align-self:flex-start}#qb .qbub.r{align-self:flex-end}
  #qb .qbub::before,#qb .qbub::after{content:"";position:absolute;width:0;height:0;border-style:solid}
  #qb .qbub.l::before{left:14%;bottom:-4cqw;border-width:4cqw 3cqw 0 0;border-color:${INK} transparent transparent transparent}
  #qb .qbub.l::after{left:calc(14% + .5cqw);bottom:-3.2cqw;border-width:3.4cqw 2.4cqw 0 0;border-color:#fff transparent transparent transparent}
  #qb .qbub.r::before{right:14%;bottom:-4cqw;border-width:4cqw 0 0 3cqw;border-color:${INK} transparent transparent transparent}
  #qb .qbub.r::after{right:calc(14% + .5cqw);bottom:-3.2cqw;border-width:3.4cqw 0 0 2.4cqw;border-color:#fff transparent transparent transparent}
  #qb .qimg{flex:1 1 auto;min-height:30cqw;display:flex;justify-content:center;align-items:flex-end}
  #qb .qimg img{max-width:100%;max-height:100%;object-fit:contain}
  #qb .qav{flex:0 0 auto;margin-top:auto;display:flex;justify-content:space-around;align-items:flex-end;padding-top:2cqw}
  #qb .qav img{width:22cqw;height:22cqw;border-radius:50%;object-fit:cover;border:.6cqw solid #fff;box-shadow:0 .4cqw 1.2cqw rgba(60,30,90,.3);background:#eadff0}
  #qb .qnav{display:flex;justify-content:center;align-items:center;gap:5cqw;margin-top:6cqw;font-size:3.6cqw;color:var(--ink)}
  #qb .qnav button{width:10cqw;height:10cqw;border:0;border-radius:50%;background:rgba(255,255,255,.85);color:#5b4358;font-size:6cqw;line-height:1;padding:0 0 .6cqw;cursor:pointer}
  #qb .qnav button:disabled{opacity:.35}`;
  document.head.appendChild(st);

  /* 骨架 */
  const wrap=document.createElement('div');wrap.id='qb';
  wrap.innerHTML=`<div class="qenv" id="qbEnv">
      <div class="peek"></div>
      <svg viewBox="0 0 300 210" preserveAspectRatio="none"><g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
        <rect x="2" y="2" width="296" height="206" rx="9" fill="#efe3f8"/>
        <path d="M3 207L128 106M297 207L172 106" fill="none"/>
        <path d="M3 5L150 118L297 5Z" fill="#dcc8ee"/></g></svg>
      <div class="etxt"><b>情侶 Q&amp;A</b><span>小問答</span></div><i class="seal">♥</i>
      <div class="tearstrip"></div><div class="ehint">✂ 點一下撕開</div></div>
    <div class="qbook" id="qbBook"><button type="button" class="qx" id="qbX" aria-label="收起來">✕</button>
      <div class="qpgs" id="qbPgs"></div>
      <div class="qnav"><button type="button" id="qbP" aria-label="上一頁">‹</button><span id="qbC"></span><button type="button" id="qbN" aria-label="下一頁">›</button></div></div>`;
  sec.appendChild(wrap);
  const env=document.getElementById('qbEnv'),book=document.getElementById('qbBook'),pgs=document.getElementById('qbPgs');

  /* 每一題一頁 */
  const bub=(side,text)=>{const b=document.createElement('div');b.className='qbub '+side;b.textContent=text||'';return b;};
  const avatarsOf=box=>{box.textContent='';box.className='qav';
    [typeof AVATAR_A!=='undefined'?AVATAR_A:'',typeof AVATAR_ME!=='undefined'?AVATAR_ME:''].forEach(src=>{const im=document.createElement('img');im.alt='';if(src)im.src=src;box.appendChild(im);});};
  const pages=QA.map((x,i)=>{
    const a=x.a||[],left=QA_FLIP?a[1]:a[0],right=QA_FLIP?a[0]:a[1];
    const p=document.createElement('div');p.className='qpg';const w=document.createElement('div');w.className='qin';
    const t=document.createElement('div');t.className='qt';t.textContent=(i+1)+'.'+(x.q||'');const L=t.textContent.length;t.style.fontSize=(L>26?4.8:L>14?6:8)+'cqw';
    const box=document.createElement('div');box.className='qimg';
    const src=QA_IMGS[i];
    if(src){const im=new Image();im.alt='';im.onerror=()=>avatarsOf(box);im.src=src;box.appendChild(im);}else avatarsOf(box);
    w.append(t,bub('l',left),bub('r',right),box);p.appendChild(w);pgs.appendChild(p);return p;});

  /* 翻頁：目前這頁在最上面，翻過的頁往右飛走，後面的頁疊在下面露一點邊 */
  let cur=0;
  function layout(){pages.forEach((p,k)=>{const d=k-cur;
      if(d<0){p.style.transform='translateX(118%) rotate(7deg)';p.style.opacity=0;p.style.zIndex=k;p.style.pointerEvents='none';}
      else{p.style.transform=d===0?'none':`translateY(${Math.min(d,3)*1.4}cqw) scale(${1-Math.min(d,3)*.025})`;p.style.opacity=d>3?0:1;p.style.zIndex=200-k;p.style.pointerEvents=d===0?'auto':'none';}});
    document.getElementById('qbC').textContent=(cur+1)+' / '+pages.length;
    document.getElementById('qbP').disabled=cur<=0;document.getElementById('qbN').disabled=cur>=pages.length-1;}
  const go=d=>{const n=cur+d;if(n<0||n>=pages.length)return;cur=n;pages[cur].querySelector('.qin').scrollTop=0;layout();};
  document.getElementById('qbP').onclick=()=>go(-1);document.getElementById('qbN').onclick=()=>go(1);
  let sx=0,sy=0;
  pgs.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  pgs.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)go(dx<0?1:-1);},{passive:true});
  layout();

  /* 撕開信封 */
  let busy=false;
  env.onclick=()=>{if(busy||env.classList.contains('torn'))return;busy=true;env.classList.add('torn');
    setTimeout(()=>{env.classList.add('gone');},650);
    setTimeout(()=>{env.style.display='none';book.classList.add('on');busy=false;},1150);};
  document.getElementById('qbX').onclick=()=>{book.classList.remove('on');env.style.display='';
    void env.offsetWidth;env.classList.remove('torn','gone');cur=0;layout();};
})();
