(() => {
 const audience=document.body.dataset.audience;
 const slides=window.DECKS[audience];
 const $=s=>document.querySelector(s);
 const deck=$('#deck');
 deck.innerHTML=slides.map((s,i)=>`<section class="slide ${s.type||''}" aria-label="Diapositiva ${i+1}: ${s.section}" aria-roledescription="diapositiva" inert><div class="slide-heading"><span class="eyebrow">${s.section}</span><span class="microbrand">HelpDesk / ${audience}</span></div><${s.type==='cover'?'h1':'h2'}>${s.title}</${s.type==='cover'?'h1':'h2'}><p class="subtitle">${s.subtitle}</p><div class="slide-content">${s.body}</div><footer class="slide-footer"><b>${String(i+1).padStart(2,'0')} / ${slides.length}</b></footer></section>`).join('');
 const sections=[...deck.children];
 const index=$('#slide-index');
 index.innerHTML=slides.map((s,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${s.section}</option>`).join('');
 let current=0;
 function navigate(n,updateHash=true){
  current=Math.max(0,Math.min(slides.length-1,n));
  sections.forEach((s,i)=>{s.classList.toggle('active',i===current);s.inert=i!==current;s.setAttribute('aria-hidden',String(i!==current));});
  index.value=String(current); $('#counter').textContent=`${current+1} / ${slides.length}`;
  $('#previous').disabled=current===0;$('#next').disabled=current===slides.length-1;
  $('#progress-value').style.width=((current+1)/slides.length*100)+'%';
  $('#progress').setAttribute('aria-valuenow',String(current+1));
  $('#announcer').textContent=`Diapositiva ${current+1} de ${slides.length}: ${slides[current].section}`;
  if(updateHash) history.replaceState(null,'',`#${current+1}`);
 }
 function resize(){const stage=$('#stage'),padding=document.fullscreenElement?0:32,scale=Math.min((stage.clientWidth-padding)/1280,(stage.clientHeight-padding)/720);$('#canvas-wrap').style.width=1280*scale+'px';$('#canvas-wrap').style.height=720*scale+'px';deck.style.transform=`scale(${scale})`;}
 $('#previous').onclick=()=>navigate(current-1);$('#next').onclick=()=>navigate(current+1);index.onchange=()=>navigate(Number(index.value));
 function hash(){const n=Number(location.hash.slice(1));navigate(Number.isInteger(n)&&n>0?n-1:0,false);}
 window.addEventListener('hashchange',hash);
 document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(['ArrowRight','PageDown','ArrowLeft','PageUp','Home','End'].includes(e.key)){e.preventDefault();navigate(e.key==='Home'?0:e.key==='End'?slides.length-1:current+(['ArrowRight','PageDown'].includes(e.key)?1:-1));}});
 function toast(message){const t=$('#toast');t.textContent=message;t.hidden=false;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.hidden=true,5000);}
 $('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Pantalla completa no disponible. Puedes ampliar la ventana del navegador.');}};
 document.addEventListener('fullscreenchange',()=>{$('#fullscreen').textContent=document.fullscreenElement?'Salir de pantalla completa':'Pantalla completa';if(document.activeElement instanceof HTMLElement)document.activeElement.blur();resize();});
 $('#resources').onclick=()=>{const menu=$('#resource-menu');menu.hidden=!menu.hidden;$('#resources').setAttribute('aria-expanded',String(!menu.hidden));};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#resource-menu').hidden=true;$('#resources').setAttribute('aria-expanded','false');}});
 document.addEventListener('click',e=>{if(!e.target.closest('#resource-menu')&&!e.target.closest('#resources')){$('#resource-menu').hidden=true;$('#resources').setAttribute('aria-expanded','false');}});
 $('#print').onclick=()=>window.print();
 const pdf=`HelpDesk_Presentacion_${audience}.pdf`;
 $('#download').href=pdf;$('#download').download=pdf;
 $('#download').addEventListener('click',()=>toast('Descargando todas las diapositivas en PDF.'));
 window.addEventListener('beforeprint',()=>sections.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden');}));
 window.addEventListener('afterprint',()=>navigate(current,false));
 let touchX=0;$('#stage').addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});$('#stage').addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>55)navigate(current+(delta<0?1:-1));},{passive:true});
 $('#progress').setAttribute('aria-valuemax',String(slides.length));
 window.addEventListener('resize',resize);new ResizeObserver(resize).observe($('#stage'));
 hash();resize();document.fonts.ready.then(resize);
 window.presentation={count:slides.length,navigate};
})();
