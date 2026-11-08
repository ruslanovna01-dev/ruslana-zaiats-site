/* Ряд із 7 етапів: лише відображення, без впливу на опитування чи API. */
(()=>{
'use strict';
if(document.body.dataset.quiz!=='final')return;
const progress=document.querySelector('#quiz .progress');
const number=document.getElementById('number');
if(!progress||!number||!progress.parentElement)return;
const dots=document.createElement('div');
dots.className='feedback-step-dots';
dots.setAttribute('role','group');
dots.setAttribute('aria-label','Етапи підсумкового опитування');
const items=[];
for(let i=1;i<=7;i++){
 const b=document.createElement('span');
 b.className='feedback-step-dot';
 b.textContent=String(i);
 b.setAttribute('aria-label','Етап '+i+' із 7');
 dots.appendChild(b);items.push(b);
}
progress.insertAdjacentElement('afterend',dots);
function sync(){
 const step=Number((number.textContent||'').match(/\d+/)?.[0]||0);
 for(let i=0;i<items.length;i++){
  const item=items[i];
  const stage=step===0?'upcoming':i+1<step?'done':i+1===step?'current':'upcoming';
  item.dataset.stage=stage;
  if(stage==='current')item.setAttribute('aria-current','step');
  else item.removeAttribute('aria-current');
 }
}
new MutationObserver(sync).observe(number,{childList:true,characterData:true,subtree:true});
sync();
})();
