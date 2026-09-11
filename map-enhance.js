(()=>{
const c=canvas, x=ctx; let panX=0,panY=0,drag=false,lx=0,ly=0,route=null;
const oldDraw=draw;
function screenToWorld(px,py){return{x:(px-W/2-panX)/zoom,y:(py-H/2-panY)/zoom}}
function worldToScreen(px,py){return{x:px*zoom+W/2+panX,y:py*zoom+H/2+panY}}
function mapText(t,px,py,size=12){x.font=`600 ${size}px system-ui`;x.fillStyle='#dbe9dc';x.fillText(t,px,py)}
function drawMap(){
 x.fillStyle='#b8c8a7';x.fillRect(0,0,W,H);x.save();x.translate(W/2+panX,H/2+panY);x.scale(zoom,zoom);
 const sx=world.w/2,sy=world.h/2;
 x.fillStyle='#b7c8a8';x.fillRect(-sx,-sy,world.w,world.h);
 // terrain zones
 x.fillStyle='#7eaa72';x.beginPath();x.arc(-300,-180,170,0,TAU);x.fill();
 x.fillStyle='#9dc181';x.beginPath();x.arc(-10,310,88,0,TAU);x.fill();
 x.fillStyle='#c6bd87';x.fillRect(160,180,180,120);
 x.fillStyle='#8f987c';x.fillRect(-330,180,120,120);
 // river
 x.fillStyle='#6aa8c4';x.beginPath();x.moveTo(-65,-500);x.bezierCurveTo(120,-260,-20,-80,45,90);x.bezierCurveTo(110,250,-50,350,90,500);x.lineTo(150,500);x.bezierCurveTo(20,350,170,220,105,60);x.bezierCurveTo(40,-100,190,-250,70,-500);x.closePath();x.fill();
 // roads like a real map
 x.strokeStyle='#e7dfc9';x.lineWidth=13;x.lineCap='round';const roads=[[[-480,0],[480,0]],[[0,-420],[0,420]],[[-250,120],[250,120]],[[0,0],[300,230]],[[0,0],[-280,-220]]];for(const r of roads){x.beginPath();x.moveTo(r[0][0],r[0][1]);x.lineTo(r[1][0],r[1][1]);x.stroke()}x.strokeStyle='#b8b09b';x.lineWidth=2;for(const r of roads){x.beginPath();x.moveTo(r[0][0],r[0][1]);x.lineTo(r[1][0],r[1][1]);x.stroke()}
 // village blocks/houses
 for(let i=0;i<world.houses;i++){const a=i*2.4,r=45+(i%5)*25,px=Math.cos(a)*r,py=Math.sin(a)*r;x.fillStyle='#eee8d8';x.fillRect(px-11,py-9,22,18);x.fillStyle='#b77b55';x.fillRect(px-11,py-9,22,4)}
 // farm plots
 for(let i=0;i<6;i++){x.fillStyle=i%2?'#a7b86e':'#b7c879';x.fillRect(170+i*29,185,22,105)}
 // forest trees
 for(let i=0;i<55;i++){const a=i*2.399,r=35+(i*17)%120,px=-300+Math.cos(a)*r,py=-180+Math.sin(a)*r;x.fillStyle='#477d4e';x.beginPath();x.arc(px,py,7,0,TAU);x.fill()}
 mapText('FLORESTA',-355,-350,12);mapText('RIO',95,-120,12);mapText('VILA',-30,-55,12);mapText('FAZENDAS',175,325,12);mapText('MINA',-325,335,12);mapText('LAGO',-45,405,12);
 // selected route
 if(route){x.strokeStyle='#4b78d1';x.lineWidth=4;x.setLineDash([10,8]);x.beginPath();x.moveTo(route.from.x,route.from.y);x.lineTo(route.to.x,route.to.y);x.stroke();x.setLineDash([]);x.fillStyle='#4b78d1';x.beginPath();x.arc(route.to.x,route.to.y,7,0,TAU);x.fill()}
 // people
 for(const p of people){x.save();x.translate(p.x,p.y);x.fillStyle=p===selected?'#2457c5':p.health<.3?'#c94b42':'#263a32';x.strokeStyle='#fff';x.lineWidth=p===selected?2:1;x.beginPath();x.arc(0,-5,6,0,TAU);x.fill();x.fillStyle='#b88b65';x.fillRect(-4,1,8,9);if(p===selected){x.strokeStyle='#173fbd';x.beginPath();x.arc(0,0,13,0,TAU);x.stroke()}x.restore()}
 x.restore();
 // map controls
 x.fillStyle='rgba(255,255,255,.94)';x.fillRect(W-62,82,44,88);x.fillStyle='#26372b';x.font='bold 24px system-ui';x.fillText('+',W-49,112);x.fillText('−',W-49,151);
}
draw=drawMap;
function refreshDetail(){if(!selected)return;const d=document.getElementById('detail');d.classList.add('on');document.getElementById('detailTitle').textContent=selected.name;const skills=Object.entries(selected.skills).sort((a,b)=>b[1]-a[1]).slice(0,5);document.getElementById('detailKv').innerHTML=`<span>Idade</span><b>${selected.age.toFixed(1)}</b><span>Ação</span><b>${selected.action}</b><span>Objetivo</span><b>${selected.goal}</b><span>Saúde</span><b>${Math.round(selected.health*100)}%</b><span>Humor</span><b>${Math.round(selected.mood*100)}%</b><span>Inteligência</span><b>${selected.intel.toFixed(2)}</b><span>Curiosidade</span><b>${selected.curiosity.toFixed(2)}</b><span>Conhecimento</span><b>${selected.knowledge.size}</b><span>Memórias</span><b>${selected.memory.length}</b><span>Habilidades</span><b>${skills.map(s=>s[0]+': '+Math.round(s[1]*100)+'%').join(', ')}</b>`;document.getElementById('detailLog').innerHTML='<strong>Memórias recentes</strong>'+selected.memory.slice(0,8).map(m=>`<div>• ${m.text}</div>`).join('')}
function followSelected(tx,ty){if(!selected)return;route={from:{x:selected.x,y:selected.y},to:{x:tx,y:ty}};selected.manualTarget={x:tx,y:ty};selected.action='walking';selected.goal='ir até o ponto escolhido';}
const baseAct=act;act=function(p,dt){if(p.manualTarget){const d=Math.hypot(p.manualTarget.x-p.x,p.manualTarget.y-p.y);if(d>8){move(p,p.manualTarget.x,p.manualTarget.y,dt);return}else{p.manualTarget=null;p.action=chooseAction(p)}}baseAct(p,dt)};
c.addEventListener('mousedown',e=>{if(e.button===0){drag=true;lx=e.clientX;ly=e.clientY}});addEventListener('mouseup',()=>drag=false);c.addEventListener('mousemove',e=>{if(drag){panX+=e.clientX-lx;panY+=e.clientY-ly;lx=e.clientX;ly=e.clientY}});
c.addEventListener('wheel',e=>{e.preventDefault();const before=screenToWorld(e.clientX,e.clientY);zoom=clamp(zoom*(e.deltaY<0?1.18:.85),.45,4.5);const after=screenToWorld(e.clientX,e.clientY);panX+=(after.x-before.x)*zoom;panY+=(after.y-before.y)*zoom},{passive:false});
c.addEventListener('dblclick',e=>{const w=screenToWorld(e.clientX,e.clientY);if(selected)followSelected(w.x,w.y)});
c.addEventListener('click',e=>{if(drag)return;const w=screenToWorld(e.clientX,e.clientY);let hit=null,bd=18/zoom;for(const p of people){const d=Math.hypot(w.x-p.x,w.y-p.y);if(d<bd){bd=d;hit=p}}if(hit){selected=hit;refreshDetail()}else if(selected){followSelected(w.x,w.y);refreshDetail()}});
// buttons and keyboard
addEventListener('keydown',e=>{if(e.key==='+'||e.key==='=')zoom=clamp(zoom*1.2,.45,4.5);if(e.key==='-')zoom=clamp(zoom*.83,.45,4.5);if(e.key==='0'){panX=panY=0;zoom=1}});
const oldHud=hud;hud=function(){oldHud();if(selected)refreshDetail()};
log('MAPA INTERATIVO: arraste para caminhar pelo mundo, use a roda para zoom e clique em uma pessoa para observá-la.');
})();
