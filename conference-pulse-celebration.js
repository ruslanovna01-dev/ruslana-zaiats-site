
/* Conference-only celebration layer. Deliberately leaves question handling and shared analytics untouched. */
(()=>{
'use strict';
if(document.body.dataset.quiz!=='live')return;
const results=document.getElementById('results');
const bottom=results.querySelector('.bottom');
const canvas=document.createElement('canvas');
canvas.id='pulseFireworks';canvas.setAttribute('aria-hidden','true');
document.body.appendChild(canvas);
const replay=document.createElement('button');
replay.id='replayPulseFireworks';replay.type='button';replay.className='secondary';replay.textContent='🎆 Повторити салют';
bottom.appendChild(replay);
const ctx=canvas.getContext('2d');if(!ctx)return;
let dots=[],last=0,end=0,frame=0,trigger=0,active=false,started=false;
let width=0,height=0,scale=1;
function size(){scale=Math.min(window.devicePixelRatio||1,2);width=innerWidth;height=innerHeight;canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);ctx.setTransform(scale,0,0,scale,0,0)}
function burst(x,y){
const colors=['#64e8ed','#ffe29e','#ff83b3','#8aaaff','#b8ffc4','#ffffff'];
const color=colors[Math.floor(Math.random()*colors.length)];
for(let i=0;i<65;i++){const angle=Math.PI*2*i/65+(Math.random()-.5)*.12;const speed=1.7+Math.random()*4.8;dots.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:1,drag:.977,size:1+Math.random()*2.3,color})}
}
function animate(time){
if(!active)return;
const delta=Math.min((time-last)/16.67||1,2.2);last=time;
ctx.clearRect(0,0,width,height);
const t=time-trigger;
if(t>=0&&t<3200){
const beats=[100,550,1050,1550,2100,2600,3150];
while(started<beats.length&&t>=beats[started]){
const x=width*(.13+Math.random()*.74);
const y=height*(.13+Math.random()*.43);
burst(x,y);started++;
}
}
ctx.globalCompositeOperation='lighter';
for(let i=dots.length-1;i>=0;i--){
 const p=dots[i];
 p.x+=p.vx*delta;p.y+=p.vy*delta;p.vx*=Math.pow(p.drag,delta);p.vy=p.vy*Math.pow(p.drag,delta)+.055*delta;
 p.life-=.0095*delta;
 if(p.life<=0){dots.splice(i,1);continue}
 ctx.globalAlpha=Math.max(0,p.life);
 ctx.fillStyle=p.color;
 ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.5,p.size*p.life),0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
if(time<end&&dots.length){frame=requestAnimationFrame(animate)}else{stop()}
}
function stop(){active=false;canvas.classList.remove('active');cancelAnimationFrame(frame);ctx.clearRect(0,0,width,height);dots=[]}
function play(){
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
stop();size();active=true;started=0;last=0;
trigger=performance.now();end=trigger+6300;canvas.classList.add('active');frame=requestAnimationFrame(animate);
}
replay.addEventListener('click',play);
let wasVisible=!results.classList.contains('hidden');
new MutationObserver(()=>{
 const nowVisible=!results.classList.contains('hidden');
 if(nowVisible&&!wasVisible){setTimeout(play,220)}
 if(!nowVisible&&wasVisible){stop()}
 wasVisible=nowVisible;
}).observe(results,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',()=>{if(active)size()});
})();
