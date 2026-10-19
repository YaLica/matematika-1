'use strict';
const PEOPLE=['Дед','Бабка','Внучка','Жучка','Кошка','Мышка'];
const FILES=[['Кто за кем?','01-poryadok','Восстановите порядок шести героев.'],['Кто между?','02-mezhdu','Найдите героя между двумя соседями.'],['Сколько помощников?','03-schet','Посчитайте участников в каждой цепочке.'],['Соседи','04-sosedi','Вспомните, кто стоит перед героем и за ним.'],['Раньше и позже','05-ranshe-pozzhe','Сравните порядок появления героев.'],['Расскажи и проверь','06-itog','Соберите сказку и проверьте себя.']];
const GAMES=['Кто за кем?','Кто между?','Считаем','Соседи','Раньше / позже','Проверим себя'];
const QUESTIONS=[
 [],
 [{text:'Кто стоит между дедом и внучкой?',answer:1},{text:'Кто стоит между бабкой и Жучкой?',answer:2},{text:'Кто стоит между внучкой и кошкой?',answer:3},{text:'Кто стоит между Жучкой и мышкой?',answer:4}],
 [{text:'Сколько помощников тянут репку?',answer:1,chain:[0]},{text:'А теперь сколько помощников?',answer:3,chain:[0,1,2]},{text:'Сколько помощников, когда пришла кошка?',answer:5,chain:[0,1,2,3,4]},{text:'Сколько помощников стало с мышкой?',answer:6,chain:[0,1,2,3,4,5]}],
 [{text:'Кто стоит сразу за бабкой, дальше от репки?',answer:2},{text:'Кто стоит сразу перед кошкой, ближе к репке?',answer:3},{text:'Кто стоит сразу за Жучкой?',answer:4},{text:'Кто стоит сразу перед внучкой?',answer:1}],
 [{text:'Кто пришёл раньше: бабка или кошка?',answer:1,options:[4,1]},{text:'Кто пришёл позже: Жучка или внучка?',answer:3,options:[2,3]},{text:'Кто пришёл раньше: мышка или кошка?',answer:4,options:[5,4]},{text:'Кто пришёл позже: дед или внучка?',answer:2,options:[0,2]}],
 [{text:'Кто первым стал тянуть репку?',answer:0},{text:'Кто пришёл последним?',answer:5},{text:'Кто стоит между бабкой и Жучкой?',answer:2},{text:'Кто стоит сразу перед мышкой?',answer:4},{text:'Сколько помощников было до прихода мышки?',answer:5,numbers:true,chain:[0,1,2,3,4]},{text:'Сколько помощников тянули репку в конце?',answer:6,numbers:true}]
];
function shuffle(a){return a.slice().sort(()=>Math.random()-.5)}
const ANSWER_SOUNDS=typeof Audio!=='undefined'?{win:new Audio('победа(4).mp3'),lose:new Audio('проигрыш(4).mp3')}:{};
function stopAnswerSounds(){Object.values(ANSWER_SOUNDS).forEach(sound=>{sound.pause();sound.currentTime=0})}
function playAnswerSound(correct){stopAnswerSounds();const sound=ANSWER_SOUNDS[correct?'win':'lose'];if(sound){const playback=sound.play();if(playback&&playback.catch)playback.catch(()=>{})}}
let game=0,step=0,chain=[],complete=false,attempts=0;
const $=id=>document.getElementById(id);
function personImage(i){const im=document.createElement('img');im.src='hero-'+i+'.jpg';im.alt=PEOPLE[i];im.draggable=false;return im}
function renderChain(ids,empty=0){const el=$('lineup');el.replaceChildren();ids.forEach((i,n)=>{const f=document.createElement('figure');f.append(personImage(i));const c=document.createElement('figcaption');c.textContent=(n+1)+'. '+PEOPLE[i];f.append(c);el.append(f)});for(let n=0;n<empty;n++){const f=document.createElement('div');f.className='slot';f.textContent=ids.length+n+1;el.append(f)}}
function feedback(t){$('status').textContent=t}
function begin(i){stopAnswerSounds();game=i;step=0;chain=[];complete=false;attempts=0;document.querySelectorAll('#gameTabs button').forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));render()}
function render(){
 $('choices').replaceChildren();$('next').hidden=true;$('undo').hidden=true;feedback('');complete=false;
 const total=game===0?6:QUESTIONS[game].length;$('progress').max=total;$('progress').value=game===0?chain.length:step;
 $('gameCount').textContent='Игра '+(game+1)+' из 6 · '+(game===0?'Выбрано героев: '+chain.length+' из 6':'Задание '+(step+1)+' из '+total);
 if(game===0){
 $('question').textContent='Кто за кем тянул репку?';renderChain(chain,6-chain.length);$('undo').hidden=!chain.length;
 feedback('Начни с того, кто стоит ближе всех к репке. Нажимай на героев по порядку.');
 [4,2,0,5,1,3].forEach(i=>addChoice(i,false,()=>{
 if(i===chain.length){playAnswerSound(true);chain.push(i);render();if(chain.length===6){complete=true;feedback('Верно! Все шесть помощников на своих местах.');$('next').textContent='Игра завершена →';$('next').hidden=false;$('choices').querySelectorAll('button').forEach(b=>b.disabled=true)}}
 else {playAnswerSound(false);feedback('Посмотри, кто пришёл следующим. Можно вернуться к сказке и попробовать ещё.');}
 },chain.includes(i)));
 return;
 }
 const q=QUESTIONS[game][step];$('question').textContent=q.text;
 renderChain(q.chain||(game===4?[]:[0,1,2,3,4,5]));
 const numeric=game===2||q.numbers;
 const opts=numeric?[1,2,3,4,5,6]:shuffle(q.options||[0,1,2,3,4,5]);
 opts.forEach(i=>addChoice(i,numeric,()=>answer(i,q,numeric)));
}
function addChoice(i,numeric,fn,disabled=false){const b=document.createElement('button');b.type='button';b.className='person'+(numeric?' number-choice':'');if(!numeric)b.append(personImage(i));const label=document.createElement('span');label.textContent=numeric?String(i):PEOPLE[i];b.append(label);b.disabled=disabled;b.onclick=()=>{if(!complete)fn()};$('choices').append(b)}
function answer(value,q,numeric){playAnswerSound(value===q.answer);if(value===q.answer){complete=true;$('progress').value=step+1;feedback(numeric?'Верно! Помощников: '+q.answer+'.':'Верно! '+PEOPLE[q.answer]+'.');$('choices').querySelectorAll('button').forEach(b=>{b.disabled=true});$('next').hidden=false;$('next').textContent=step===QUESTIONS[game].length-1?'Игра завершена →':'Следующее задание →'}else{attempts++;feedback(numeric?'Попробуй пересчитать ещё раз. Считаем только тех, кто тянет репку.':'Попробуй ещё. Посмотри на порядок героев или вернись к сказке.')}}
function finish(){complete=true;$('choices').replaceChildren();$('lineup').replaceChildren();$('undo').hidden=true;$('next').hidden=true;$('question').textContent='Молодец, ты отлично справился!';$('gameCount').textContent=GAMES[game]+' · Игра завершена';feedback(game<5?'Можно выбрать другую игру сверху или повторить эту.':'Ты вспомнил сказку, посчитал помощников и нашёл их места в цепочке. Теперь попробуй пересказать историю!');$('progress').value=$('progress').max}
function route(){stopAnswerSounds();document.querySelectorAll('audio,video').forEach(m=>m.pause());const id=location.hash.slice(1)||'home';const allowed=['home','lesson','games','retell','files'];const name=allowed.includes(id)?id:'home';document.querySelectorAll('main > section').forEach(s=>s.hidden=s.id!==name);if($('pdfDialog').open)$('pdfDialog').close();window.scrollTo(0,0);if(name!=='home')$(name+'Title').focus({preventScroll:true})}
function setup(){$('storyAudio').addEventListener('error',()=>{$('audioError').hidden=false});
 GAMES.forEach((title,i)=>{const b=document.createElement('button');b.type='button';b.textContent=(i+1)+'. '+title;b.setAttribute('aria-pressed','false');b.onclick=()=>begin(i);$('gameTabs').append(b)});
 $('again').onclick=()=>begin(game);$('undo').onclick=()=>{chain.pop();render()};$('next').onclick=()=>{if(game===0||step===QUESTIONS[game].length-1)finish();else{step++;attempts=0;render()}};
 PEOPLE.forEach((p,i)=>{const f=document.createElement('figure');f.append(personImage(i));const c=document.createElement('figcaption');c.textContent=(i+1)+'. '+p;f.append(c);$('retellLine').append(f)});
 FILES.forEach(([title,file,desc],i)=>{const card=document.createElement('article');card.className='pdf-card';const preview=document.createElement('button');preview.type='button';preview.className='pdf-preview';preview.setAttribute('aria-label','Увеличить лист «'+title+'»');const img=document.createElement('img');img.src=''+file+'.png';img.alt=title;img.loading='lazy';preview.append(img);preview.onclick=()=>{$('dialogTitle').textContent=title;$('dialogImage').src=img.src;$('dialogDownload').href=''+file+'.pdf';$('pdfDialog').showModal()};const body=document.createElement('div');body.className='pdf-body';const h=document.createElement('h2');h.textContent=(i+1)+'. '+title;const p=document.createElement('p');p.textContent=desc;const actions=document.createElement('div');actions.className='pdf-actions';const a=document.createElement('a');a.className='download';a.href=''+file+'.pdf';a.download=file+'.pdf';a.textContent='Скачать PDF';const open=document.createElement('a');open.className='open-pdf';open.href=a.href;open.target='_blank';open.rel='noopener';open.textContent='Открыть оригинал';actions.append(a,open);body.append(h,p,actions);card.append(preview,body);$('pdfList').append(card)});
 $('closeDialog').onclick=()=>$('pdfDialog').close();$('pdfDialog').addEventListener('click',e=>{if(e.target===$('pdfDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});window.addEventListener('hashchange',route);begin(0);route();
}
if(typeof module!=='undefined')module.exports={PEOPLE,FILES,GAMES,QUESTIONS};
if(typeof document!=='undefined')setup();
