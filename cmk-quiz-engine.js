(()=>{'use strict';
const MODE=document.body.dataset.quiz,CONFIG=window.CMK_DATA[MODE],API=(window.CMK_API_URL||'').replace(/\/$/,'');
const Q=CONFIG.questions,state={step:0,answers:[],submitted:false,summary:null,summaryLoading:false,summaryError:'',saving:false};
const $=id=>document.getElementById(id),answersEl=$('answers');
const questionResults=document.createElement('section');
questionResults.id='questionResults';
questionResults.className='question-results';
questionResults.setAttribute('aria-live','polite');
answersEl.insertAdjacentElement('afterend',questionResults);
$('title').textContent=CONFIG.title;
$('subtitle').textContent=CONFIG.subtitle;
$('lead').textContent=CONFIG.lead;
$('heroTitle').textContent=CONFIG.title;
$('start').textContent=CONFIG.button;
$('hero').style.setProperty('--hero',CONFIG.color);
$('start').onclick=()=>{$('intro').classList.add('hidden');$('quiz').classList.remove('hidden');renderQ();loadGlobal(true);window.scrollTo({top:0,behavior:'smooth'})};
$('previous').onclick=()=>{if(state.saving)return;if(state.step>0){state.step--;renderQ();loadGlobal(true)}else{$('quiz').classList.add('hidden');$('intro').classList.remove('hidden')}};
$('next').onclick=()=>{if(state.saving)return;if(state.answers[state.step]==null){$('warn').textContent='Оберіть відповідь, щоб продовжити.';return}if(state.step<Q.length-1){state.step++;renderQ();loadGlobal(true)}else finish()};
function renderQ(){
 const q=Q[state.step];
 $('number').textContent='Запитання '+(state.step+1)+' з '+Q.length;
 $('progress').style.width=((state.step+1)/Q.length*100)+'%';
 $('qtext').textContent=q[0];
 $('qemoji').textContent=q[2];
 $('warn').textContent=state.summaryError?state.summaryError:'';
 answersEl.innerHTML='';
 q[1].forEach((v,i)=>{
  const b=document.createElement('button');
  b.type='button';
  b.className='option'+(state.answers[state.step]===i?' selected':'');
  b.textContent=v;
  b.setAttribute('aria-pressed',state.answers[state.step]===i?'true':'false');
  b.disabled=state.saving;
  b.onclick=()=>selectAnswer(i);
  answersEl.appendChild(b);
 });
 $('previous').disabled=state.saving;
 $('next').disabled=state.saving;
 $('next').textContent=state.saving?'Зберігаємо…':state.step===Q.length-1?'Завершити й побачити результат ✨':'Наступне →';
 renderQuestionResults();
}
function getToken(){
 const k='cmk_token_'+MODE;
 let t=localStorage.getItem(k);
 if(!t){t='CMK'+Math.random().toString(36).slice(2)+Date.now().toString(36)+'X'+Math.random().toString(36).slice(2);localStorage.setItem(k,t)}
 return t;
}
function ownReport(){
 if(MODE==='route'){const x=state.answers[8];return x===1?CONFIG.outcomes[0]:CONFIG.outcomes[1]}
 return 'Дякуємо, що долучилися! Ваші відповіді допомагають визначати спільні пріоритети.';
}
function appendBars(container,index,stats){
 const q=Q[index],counts=Array.isArray(stats&&stats.options)?stats.options:q[1].map(()=>0);
 const total=Number(stats&&stats.total)||counts.reduce((sum,count)=>sum+(Number(count)||0),0);
 const max=Math.max(0,...counts);
 q[1].forEach((answer,i)=>{
  const count=Number(counts[i])||0,percent=total?Math.round(count/total*100):0;
  const row=document.createElement('div');
  row.className='barline'+(count>0&&count===max?' leader':'');
  const label=document.createElement('div');
  label.className='bar-label';
  const arrow=document.createElement('span');
  arrow.className='answer-arrow';
  arrow.setAttribute('aria-hidden','true');
  arrow.textContent=count>0&&count===max?'↗':'→';
  const text=document.createElement('span');
  text.textContent=answer;
  label.append(arrow,text);
  const track=document.createElement('em');
  track.setAttribute('aria-label',percent+'%');
  const fill=document.createElement('i');
  fill.style.width=percent+'%';
  track.appendChild(fill);
  const value=document.createElement('b');
  value.textContent=count+' · '+percent+'%';
  row.append(label,track,value);
  container.appendChild(row);
 });
}
function renderQuestionResults(){
 questionResults.innerHTML='';
 const card=document.createElement('div');
 card.className='chart-card';
 const header=document.createElement('div');
 header.className='question-results-heading';
 const title=document.createElement('h3');
 title.className='chart-title';
 title.textContent='Спільні відповіді';
 const stats=state.summary&&state.summary.questions?state.summary.questions[state.step]:null;
 const count=document.createElement('span');
 count.className='chart-count';
 count.textContent=stats?stats.total+' відповідей':state.summaryLoading?'Оновлюємо…':'Поки що немає відповідей';
 header.append(title,count);
 card.appendChild(header);
 if(stats){appendBars(card,state.step,stats)}
 else{
  const note=document.createElement('p');
  note.className='chart-empty';
  note.textContent=state.summaryError?'Спільна статистика тимчасово недоступна. Спробуйте оновити сторінку.':'Оберіть варіант — відповідь одразу врахується в анонімній діаграмі.';
  card.appendChild(note);
 }
 questionResults.appendChild(card);
}
function setGlobalStatus(message,isError){
 $('modeNotice').textContent=message;
 $('modeNotice').classList.toggle('note-ok',!isError);
}
function renderCharts(summary){
 $('chartWrap').innerHTML='';
 if(!summary||!Array.isArray(summary.questions)){
  const note=document.createElement('p');
  note.className='chart-empty';
  note.textContent='Спільні результати поки не завантажені.';
  $('chartWrap').appendChild(note);
  return;
 }
 Q.forEach((q,index)=>{
  const stats=summary.questions[index]||{total:0,options:q[1].map(()=>0)};
  const block=document.createElement('section');
  block.className='chart-card';
  const title=document.createElement('h3');
  title.className='chart-title';
  title.textContent=q[0];
  const count=document.createElement('p');
  count.className='chart-count';
  count.textContent=stats.total+' відповідей на це запитання';
  block.append(title,count);
  appendBars(block,index,stats);
  $('chartWrap').appendChild(block);
 });
}
async function loadGlobal(showError){
 if(!API){
  state.summaryError='Спільний сервер результатів не підключений.';
  if(showError)setGlobalStatus(state.summaryError,true);
  renderQuestionResults();
  return;
 }
 state.summaryLoading=true;
 renderQuestionResults();
 try{
  const response=await fetch(API+'/api/poll-summary?poll='+encodeURIComponent(MODE),{cache:'no-store'});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.ok!==true)throw new Error(data.error||'Не вдалося завантажити спільні результати.');
  state.summary=data;
  state.summaryError='';
  $('liveCount').textContent=String(data.participants||0);
  renderCharts(data);
  setGlobalStatus('Показані спільні анонімні відповіді. Діаграми оновлюються після кожного вибору.',false);
 }catch(error){
  state.summaryError=error.message||'Спільна статистика тимчасово недоступна.';
  if(showError)setGlobalStatus(state.summaryError,true);
  if(!state.summary)renderCharts(null);
 }finally{
  state.summaryLoading=false;
  renderQuestionResults();
 }
}
async function selectAnswer(index){
 if(state.saving)return;
 state.answers[state.step]=index;
 state.summaryError='';
 if(!API){state.summaryError='Спільний сервер результатів не підключений.';renderQ();return}
 state.saving=true;
 renderQ();
 try{
  const response=await fetch(API+'/api/poll-responses',{
   method:'POST',
   headers:{'content-type':'application/json'},
   body:JSON.stringify({poll:MODE,questionIndex:state.step,optionIndex:index,token:getToken()})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.ok!==true)throw new Error(data.error||'Не вдалося зберегти відповідь.');
  await loadGlobal(false);
 }catch(error){
  state.summaryError=error.message||'Не вдалося зберегти відповідь. Перевірте з’єднання й спробуйте ще раз.';
  setGlobalStatus(state.summaryError,true);
 }finally{
  state.saving=false;
  renderQ();
 }
}
function confetti(){
 for(let i=0;i<80;i++){
  const p=document.createElement('i');
  p.className='confetti';
  p.style.left=Math.random()*100+'vw';
  p.style.background=['#ffc55e','#28a7da','#e75f8e','#7dbd82'][i%4];
  p.style.setProperty('--dx',(Math.random()*500-250)+'px');
  p.style.setProperty('--dur',(Math.random()*3+2)+'s');
  document.body.appendChild(p);
  setTimeout(()=>p.remove(),5400);
 }
}
async function finish(){
 if(state.submitted)return;
 state.submitted=true;
 $('quiz').classList.add('hidden');
 $('results').classList.remove('hidden');
 $('own').textContent=ownReport();
 setGlobalStatus('Завантажуємо спільні анонімні результати…',false);
 renderCharts(state.summary);
 confetti();
 await loadGlobal(true);
}
$('again').onclick=()=>{
 state.answers=[];
 state.step=0;
 state.submitted=false;
 state.summaryError='';
 $('results').classList.add('hidden');
 $('intro').classList.remove('hidden');
 window.scrollTo({top:0,behavior:'smooth'});
};
$('refresh').onclick=()=>loadGlobal(true);
})();