/* qa.js v2：第四頁「牛魚QA小問答」
   畫面上是一個淡紫色紙信封（點擊進入）→ 信封蓋掀開、信紙升起 → 跳出彈窗，裡面一題一張方形卡：
   淺紫底、大標題、兩個方形對話框、下面是插圖。卡片高度跟著內容，題目長就比較高。
   用法：index.html 最後 </body> 前面有 <script src="qa.js"></script> 就好（取代舊的 qa.js）
   題目和回答用 index.html 裡原本的 const QA=[...]，不用動。 */
(function(){
  /* ===== 可以改的設定 ===== */
  const TITLE='牛魚QA小問答';
  const DEFAULT_IMG='photo/qa1.PNG'; // 每一題預設都用這張插圖（大小寫要跟檔名一樣）
  const QA_IMGS=[];                  // 想讓某一題用不同的圖：依題號填，例如 ['','photo/qa2.PNG']（空的＝用預設）
  const QA_FLIP=true;                // true＝左邊對話框是 QA 回答陣列的第 2 個（牛島），右邊是第 1 個（小魚）
  /* ======================== */
  const sec=document.getElementById('p-qa');
  if(!sec||typeof QA==='undefined'||!QA.length)return;
  const LINE='#8a74ad',TXT='#5b4a78';

  const lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=Huninn&family=Noto+Serif+TC:wght@500;700&display=swap';document.head.appendChild(lk);
  const NOISE_E="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 .38 0 0 0 0 .3 0 0 0 0 .55 0 0 0 .34 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\"),repeating-linear-gradient(35deg,rgba(255,255,255,.16) 0 1px,transparent 1px 5px),repeating-linear-gradient(-55deg,rgba(110,90,140,.07) 0 1px,transparent 1px 4px)";
  const NOISE="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 .45 0 0 0 0 .35 0 0 0 0 .6 0 0 0 .16 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  const st=document.createElement('style');st.textContent=`
  #p-qa>.qh,#p-qa>.qavs,#p-qa>#qaList{display:none}
  #qb{container-type:inline-size;width:min(100%,400px);margin:0 auto;position:relative}
  #qb .qe{position:relative;width:86cqw;aspect-ratio:3/2;margin:40cqw auto 16cqw;transform:rotate(-5deg);perspective:900px;cursor:pointer;-webkit-tap-highlight-color:transparent}
  #qb .qe::after{content:"";position:absolute;left:6%;right:2%;bottom:-6cqw;height:7cqw;border-radius:50%;background:radial-gradient(ellipse,rgba(60,35,95,.4),transparent 70%);filter:blur(3px);z-index:-1}
  #qb .qe-back{position:absolute;inset:0;border-radius:2.4cqw;background:${NOISE_E},linear-gradient(#d3ccdf,#c6bed6);z-index:0}
  #qb .qe-card{position:absolute;left:7%;right:7%;top:9%;height:86%;border-radius:1.6cqw;background:${NOISE_E},linear-gradient(#ffffff,#f6f2fb);box-shadow:0 .5cqw 2cqw rgba(60,35,95,.25);z-index:3;transition:transform .85s cubic-bezier(.3,.7,.3,1) .45s;display:flex;align-items:center;justify-content:center;font-family:"Noto Serif TC",serif;font-weight:700;color:#8a74ad;font-size:6cqw;letter-spacing:.14em}
  #qb .qe.open .qe-card{transform:translateY(-58%)}
  #qb .qe-front{position:absolute;inset:0;z-index:4;border-radius:2.4cqw;overflow:hidden;pointer-events:none}
  #qb .qe-front i{position:absolute;inset:0;display:block}
  #qb .qe-front .sl{clip-path:polygon(0 0,52% 52%,0 100%);background:${NOISE_E},linear-gradient(100deg,#ece8f3,#e0dae9)}
  #qb .qe-front .sr{clip-path:polygon(100% 0,48% 52%,100% 100%);background:${NOISE_E},linear-gradient(260deg,#ece8f3,#dcd5e8)}
  #qb .qe-front .sb{clip-path:polygon(0 100%,50% 38%,100% 100%);background:${NOISE_E},linear-gradient(0deg,#d8d1e5,#e7e2f0)}
  #qb .qe-front .crease{position:absolute;inset:0;width:100%;height:100%}
  #qb .qe-fsh{position:absolute;left:0;right:0;top:0;height:60%;z-index:5;clip-path:polygon(0 0,100% 0,100% 3%,98.5% 7%,53% 97%,50% 100%,47% 97%,1.5% 7%,0 3%);background:rgba(50,30,85,.38);filter:blur(2px);transform:translateY(3.4%);transition:opacity .25s;pointer-events:none}
  #qb .qe.open .qe-fsh{opacity:0}
  #qb .qe-back{box-shadow:inset 0 0 0 .3cqw rgba(255,255,255,.35),inset 0 -2cqw 3cqw rgba(70,45,110,.2)}
  #qb .seal{position:absolute;left:50%;bottom:11%;width:9.4cqw;height:9.4cqw;margin-left:-4.7cqw;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f9c9dc,#e58bb0 55%,#c5638d);box-shadow:0 .5cqw 1cqw rgba(80,30,70,.45),inset 0 -.4cqw .6cqw rgba(120,30,80,.35),inset 0 .3cqw .5cqw rgba(255,255,255,.65);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.92);font-size:4.4cqw;font-style:normal}
  #qb .qe-flap{position:absolute;left:0;right:0;top:0;height:60%;z-index:6;transform-origin:50% 0;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.45,.05,.3,1),z-index 0s .4s}
  #qb .qe.open .qe-flap{transform:rotateX(180deg);z-index:1}
  #qb .qe-flap .f{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;clip-path:polygon(0 0,100% 0,100% 3%,98.5% 7%,53% 97%,50% 100%,47% 97%,1.5% 7%,0 3%)}
  #qb .qe-flap .out{background:${NOISE_E},linear-gradient(180deg,#f3f0f8,#e3deed);display:flex;justify-content:center;padding-top:13%}
  #qb .qe-flap .in{background:${NOISE_E},linear-gradient(0deg,#c3bad4,#d3cce1);transform:rotateY(180deg)}
  #qb .qe-flap b{font-family:"Noto Serif TC","Songti TC",serif;font-weight:700;font-style:italic;font-size:5.4cqw;letter-spacing:.16em;color:#8470a3;text-shadow:0 .3cqw 0 rgba(255,255,255,.7);white-space:nowrap}
  #qb .qe-hint{position:absolute;left:0;right:0;bottom:-12cqw;text-align:center;font-family:Huninn,"PingFang TC",sans-serif;font-size:3.6cqw;color:var(--ink);letter-spacing:.2em}

  #qbm{position:fixed;inset:0;z-index:85;display:none;align-items:center;justify-content:center;padding:12px;background:rgba(70,40,90,.5);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
  #qbm.on{display:flex;animation:qbf .3s ease-out}
  @keyframes qbf{from{opacity:0}to{opacity:1}}
  #qbm .qpanel{position:relative;container-type:inline-size;width:min(92vw,400px);max-height:94vh;display:flex;flex-direction:column;padding:0 3cqw}
  #qbm .qscroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:12cqw 0 3cqw;-webkit-overflow-scrolling:touch}
  #qbm .qx{position:absolute;top:2cqw;right:3cqw;z-index:300;width:8cqw;height:8cqw;border:0;border-radius:50%;background:rgba(255,255,255,.85);color:#6a4f8c;font-size:3.8cqw;cursor:pointer;padding:0}
  #qbm .qpgs{position:relative;width:100%;transition:height .35s ease}
  #qbm .qpg{position:absolute;left:0;right:0;top:0;min-height:92cqw;background:${NOISE},linear-gradient(180deg,#fbf9fe,#f2ecf9);border-radius:3cqw;box-shadow:0 .6cqw 2.4cqw rgba(40,20,70,.4);transition:transform .5s cubic-bezier(.4,.1,.2,1),opacity .4s;transform-origin:50% 100%}
  #qbm .qin{display:flex;flex-direction:column;min-height:92cqw;padding:6cqw 5cqw 0;font-family:Huninn,"PingFang TC","Noto Sans TC",sans-serif}
  #qbm .qt{font-size:5.4cqw;font-weight:700;line-height:1.35;margin:0 0 5.5cqw;color:#6a4f8c;text-align:left;letter-spacing:.03em}
  #qbm .qbub{position:relative;flex:0 0 auto;max-width:72%;padding:2.8cqw 3.2cqw;background:#fff;border:.4cqw solid ${LINE};border-radius:1.2cqw;font-size:3.5cqw;line-height:1.65;color:${TXT};text-align:left;white-space:pre-wrap;word-break:break-word;margin-bottom:6.5cqw}
  #qbm .qbub.l{align-self:flex-start}#qbm .qbub.r{align-self:flex-end}
  #qbm .qbub::before,#qbm .qbub::after{content:"";position:absolute;width:0;height:0;border-style:solid}
  #qbm .qbub.l::before{left:16%;bottom:-3.6cqw;border-width:3.6cqw 2.6cqw 0 0;border-color:${LINE} transparent transparent transparent}
  #qbm .qbub.l::after{left:calc(16% + .4cqw);bottom:-2.8cqw;border-width:3cqw 2cqw 0 0;border-color:#fff transparent transparent transparent}
  #qbm .qbub.r::before{right:16%;bottom:-3.6cqw;border-width:3.6cqw 0 0 2.6cqw;border-color:${LINE} transparent transparent transparent}
  #qbm .qbub.r::after{right:calc(16% + .4cqw);bottom:-2.8cqw;border-width:3cqw 0 0 2cqw;border-color:#fff transparent transparent transparent}
  #qbm .qimg{margin-top:auto;display:flex;justify-content:center;align-items:flex-end}
  #qbm .qimg img{display:block;max-width:80%;max-height:80cqw;object-fit:contain}
  #qbm .qav{margin-top:auto;display:flex;justify-content:space-around;align-items:flex-end;padding-top:2cqw}
  #qbm .qav img{width:22cqw;height:22cqw;border-radius:50%;object-fit:cover;border:.6cqw solid #fff;box-shadow:0 .4cqw 1.2cqw rgba(60,30,90,.3);background:#eadff0}
  #qbm .qnav{display:flex;justify-content:center;align-items:center;gap:5cqw;flex:0 0 auto;margin-top:2cqw;padding-bottom:3cqw;font-size:3.6cqw;color:#fff;font-family:Huninn,sans-serif}
  #qbm .qnav button{width:10cqw;height:10cqw;border:0;border-radius:50%;background:rgba(255,255,255,.88);color:#6a4f8c;font-size:6cqw;line-height:1;padding:0 0 .6cqw;cursor:pointer}
  #qbm .qnav button:disabled{opacity:.35}
  @media(prefers-reduced-motion:reduce){#qb .qe-card,#qb .qe-flap{transition-duration:.01s;transition-delay:0s}}`;
  document.head.appendChild(st);

  /* 信封 */
  const wrap=document.createElement('div');wrap.id='qb';
  wrap.innerHTML=`<div class="qe" id="qbEnv" role="button" aria-label="${TITLE}（點擊進入）">
      <div class="qe-back"></div>
      <div class="qe-card">Q &amp; A</div>
      <div class="qe-front"><i class="sl"></i><i class="sr"></i><i class="sb"></i><svg class="crease" viewBox="0 0 300 200" preserveAspectRatio="none"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0L156 104L0 200M300 0L144 104L300 200M0 200L150 76L300 200" stroke="rgba(255,255,255,.6)" stroke-width="1.3" transform="translate(0,-1.2)"/><path d="M0 0L156 104L0 200M300 0L144 104L300 200M0 200L150 76L300 200" stroke="rgba(70,45,110,.24)" stroke-width="1.1"/></g></svg></div>
      <div class="qe-fsh"></div>
      <div class="qe-flap"><div class="f out"><b>${TITLE}</b><i class="seal">♥</i></div><div class="f in"></div></div>
      <div class="qe-hint">（點擊進入）</div></div>`;
  sec.appendChild(wrap);
  const env=document.getElementById('qbEnv');

  /* 彈窗 */
  const modal=document.createElement('div');modal.id='qbm';
  modal.innerHTML='<div class="qpanel"><button type="button" class="qx" id="qbX" aria-label="關閉">✕</button><div class="qscroll"><div class="qpgs" id="qbPgs"></div></div><div class="qnav"><button type="button" id="qbP" aria-label="上一張">‹</button><span id="qbC"></span><button type="button" id="qbN" aria-label="下一張">›</button></div></div>';
  document.body.appendChild(modal);
  const pgs=document.getElementById('qbPgs');

  const bub=(side,text)=>{const b=document.createElement('div');b.className='qbub '+side;b.textContent=text||'';return b;};
  const avatarsOf=box=>{box.textContent='';box.className='qav';
    [typeof AVATAR_A!=='undefined'?AVATAR_A:'',typeof AVATAR_ME!=='undefined'?AVATAR_ME:''].forEach(src=>{const im=document.createElement('img');im.alt='';if(src)im.src=src;box.appendChild(im);});};
  const altCase=s=>s.replace(/\.(png|PNG)$/,m=>m==='.png'?'.PNG':'.png');
  const pages=QA.map((x,i)=>{
    const a=x.a||[],left=QA_FLIP?a[1]:a[0],right=QA_FLIP?a[0]:a[1];
    const p=document.createElement('div');p.className='qpg';const w=document.createElement('div');w.className='qin';
    const t=document.createElement('div');t.className='qt';t.textContent=(i+1)+'.'+(x.q||'');
    const box=document.createElement('div');box.className='qimg';
    const src=QA_IMGS[i]||DEFAULT_IMG;
    if(src){const im=new Image();im.alt='';let tried=0;im.onerror=()=>{if(!tried){tried=1;im.src=altCase(src);}else avatarsOf(box);};im.onload=sync;im.src=src;box.appendChild(im);}else avatarsOf(box);
    w.append(t,bub('l',left),bub('r',right),box);p.appendChild(w);pgs.appendChild(p);return p;});

  /* 翻頁：目前這張在最上面，翻過的往右飛走，後面的疊在下面；卡片高度跟著內容 */
  let cur=0;
  function sync(){pgs.style.height=pages[cur].offsetHeight+'px';}
  function layout(){pages.forEach((p,k)=>{const d=k-cur;
      if(d<0){p.style.transform='translateX(118%) rotate(7deg)';p.style.opacity=0;p.style.zIndex=k;p.style.pointerEvents='none';}
      else{p.style.transform=d===0?'none':`translateY(${Math.min(d,3)*1.4}cqw) scale(${1-Math.min(d,3)*.025})`;p.style.opacity=d>3?0:1;p.style.zIndex=200-k;p.style.pointerEvents=d===0?'auto':'none';}});
    document.getElementById('qbC').textContent=(cur+1)+' / '+pages.length;
    document.getElementById('qbP').disabled=cur<=0;document.getElementById('qbN').disabled=cur>=pages.length-1;sync();}
  const scr=()=>modal.querySelector('.qscroll');
  const go=d=>{const n=cur+d;if(n<0||n>=pages.length)return;cur=n;scr().scrollTop=0;layout();};
  document.getElementById('qbP').onclick=()=>go(-1);document.getElementById('qbN').onclick=()=>go(1);
  let sx=0,sy=0;
  pgs.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  pgs.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)go(dx<0?1:-1);},{passive:true});

  /* 開關 */
  let busy=false;
  function openModal(){modal.classList.add('on');scr().scrollTop=0;document.body.style.overflow='hidden';layout();requestAnimationFrame(sync);setTimeout(sync,350);}
  function closeModal(){modal.classList.remove('on');document.body.style.overflow='';setTimeout(()=>env.classList.remove('open'),200);cur=0;}
  env.onclick=()=>{if(busy)return;busy=true;env.classList.add('open');
    setTimeout(()=>{openModal();busy=false;},matchMedia('(prefers-reduced-motion:reduce)').matches?60:1400);};
  document.getElementById('qbX').onclick=closeModal;
  modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(sync);
})();
