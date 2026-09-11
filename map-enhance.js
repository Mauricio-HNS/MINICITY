(()=>{
  const c=canvas, x=ctx;
  let panX=0,panY=0,drag=false,lx=0,ly=0,route=null;
  const baseDraw=draw;
  function w2s(px,py){return{x:px*zoom+W/2+panX,y:py*zoom+H/2+panY}}
  function s2w(px,py){return{x:(px-W/2-panX)/zoom,y:(py-H/2-panY)/zoom}}
  function label(t,px,py,size=12){x.save();x.font=`700 ${size}px system-ui`;x.fillStyle='rgba(235,245,235,.9)';x.shadowColor='#000';x.shadowBlur=4;x.fillText(t,px,py);x.restore()}
  function mapDraw(){
    x.fillStyle='#9db58c';x.fillRect(0,0,W,H);
    x.save();x.translate(W/2+panX,H/2+panY);x.scale(zoom,zoom);
    const sx=world.w/2,sy=world.h/2;
    x.fillStyle='#a9bd98';x.fillRect(-sx,-sy,world.w,world.h);
    // river
    x.fillStyle='#4e91ad';x.beginPath();x.moveTo(-75,-500);x.bezierCurveTo(100,-300,-15,-100,45,80);x.bezierCurveTo(120,260,-60,350,75,500);x.lineTo(155,500);x.bezierCurveTo(20,340,175,230,105,60);x.bezierCurveTo(45,-110,190,-280,65,-500);x.closePath();x.fill();
    // forest
    x.fillStyle='#648f5c';x.beginPath();x.arc(-300,-180,175,0,TAU);x.fill();
    for(let i=0;i<75;i++){const a=i*2.41,r=25+(i*19)%145,px=-300+Math.cos(a)*r,py=-180+Math.sin(a)*r;x.fillStyle=i%3?'#3f7547':'#527f4e';x.beginPath();x.arc(px,py,6+((i%3)),0,TAU);x.fill()}
    // lake
    x.fillStyle='#70a8ba';x.beginPath();x.ellipse(-10,310,92,65,0,0,TAU);x.fill();
    // farm and mine
    x.fillStyle='#c8bd82';x.fillRect(160,180,190,125);x.strokeStyle='#8d8558';x.strokeRect(160,180,190,125);
    for(let i=0;i<7;i++){x.fillStyle=i%2?'#9eae61':'#b0bc70';x.fillRect(170+i*27,190,19,105)}
    x.fillStyle='#777f72';x.fillRect(-335,180,125,125);x.fillStyle='#4d554d';x.fillRect(-320,195,95,95);
    // roads
    const roads=[[[-500,0],[500,0]],[[0,-430],[0,430]],[[-250,120],[250,120]],[[0,0],[300,230]],[[0,0],[-280,-220]]];
    x.lineCap='round';x.strokeStyle='#e7dec5';x.lineWidth=15;for(const r of roads){x.beginPath();x.moveTo(r[0][0],r[0][1]);x.lineTo(r[1][0],r[1][1]);x.stroke()}x.strokeStyle='#aaa58f';x.lineWidth=2;for(const r of roads){x.beginPath();x.moveTo(r[0][0],r[0][1]);x.lineTo(r[1][0],r[1][1]);x.stroke()}
    // village houses
    for(let i=0;i<world.houses;i++){const a=i*2.4,r=40+(i%5)*25,px=Math.cos(a)*r,py=Math.sin(a)*r;x.fillStyle='#eee6d2';x.fillRect(px-12,py-9,24,18);x.fillStyle='#ad704c';x.fillRect(px-12,py-9,24,5)}
    label('FLORESTA',-360,-355,13);label('RIO',90,-110,13);label('VILA',-30,-65,13);label('FAZENDAS',175,325,13);label('MINA',-335,335,13);label('LAGO',-45,395,13);
    if(route){x.strokeStyle='#2e67c7';x.lineWidth=4;x.setLineDash([10,8]);x.beginPath();x.moveTo(route.from.x,route.from.y);x.lineTo(route.to.x,route.to.y);x.stroke();x.setLineDash([])}
    for(const p of people){x.save();x.translate(p.x,p.y);x.fillStyle=p===selected?'#2057d5':p.health<.3?'#c9473d':'#263b30';x.strokeStyle='#fff';x.lineWidth=p===selected?2:1;x.beginPath();x.arc(0,-5,6,0,TAU);x.fill();x.fillStyle='#b98b67';x.fillRect(-4,1,8,10);if(p===selected){x.strokeStyle='#153fa5';x.beginPath();x.arc(0,0,14,0,TAU);x.stroke();label(p.name,10,-12,10)}x.restore()}
    x.restore();
    // map controls
    x.fillStyle='rgba(7,17,12,.92)';x.fillRect(W-58,78,42,88);x.fillStyle='#e8f4e8';x.font='bold 24px system-ui';x.fillText('+',W-46,110);x.fillText('−',W-46,150);
  }
  draw=mapDraw;
  function refresh(){if(!selected)return;const d=document.getElementById('detail');if(!d)return;d.classList.add('on');document.getElementById('detailTitle').textContent=selected.name;const top=Object.entries(selected.skills||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);document.getElementById('detailKv').innerHTML=`<span>Idade</span><b>${Number(selected.age||0).toFixed(1)}</b><span>Ação</span><b>${selected.action||'-'}</b><span>Objetivo</span><b>${selected.goal||'-'}</b><span>Saúde</span><b>${Math.round((selected.health||0)*100)}%</b><span>Humor</span><b>${Math.round((selected.mood||0)*100)}%</b><span>Inteligência</span><b>${Number(selected.intel||0).toFixed(2)}</b><span>Curiosidade</span><b>${Number(selected.curiosity||0).toFixed(2)}</b><span>Conhecimento</span><b>${selected.knowledge?.size||0}</b><span>Memórias</span><b>${selected.memory?.length||0}</b><span>Habilidades</span><b>${top.map(s=>s[0]+': '+Math.round(s[1]*100)+'%').join(', ')}</b>`;document.getElementById('detailLog').innerHTML=(selected.memory||[]).slice(0,8).map(m=>`<div>• ${m.text}</div>`).join('')}
  const baseAct=act;act=function(p,dt){if(p.manualTarget){const d=Math.hypot(p.manualTarget.x-p.x,p.manualTarget.y-p.y);if(d>8){move(p,p.manualTarget.x,p.manualTarget.y,dt);return}p.manualTarget=null;p.action=chooseAction(p)}baseAct(p,dt)};
  c.addEventListener('mousedown',e=>{if(e.button===0){drag=true;lx=e.clientX;ly=e.clientY}});addEventListener('mouseup',()=>drag=false);
  c.addEventListener('mousemove',e=>{if(drag){panX+=e.clientX-lx;panY+=e.clientY-ly;lx=e.clientX;ly=e.clientY}});
  c.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom*(e.deltaY<0?1.18:.85),.45,4.5)},{passive:false});
  c.addEventListener('click',e=>{if(drag)return;const w=s2w(e.clientX,e.clientY);let hit=null,bd=20/zoom;for(const p of people){const d=Math.hypot(w.x-p.x,w.y-p.y);if(d<bd){bd=d;hit=p}}if(hit){selected=hit;refresh()}else if(selected){route={from:{x:selected.x,y:selected.y},to:{x:w.x,y:w.y}};selected.manualTarget={x:w.x,y:w.y};selected.action='walking';selected.goal='ir até o ponto escolhido';refresh()}});
  c.addEventListener('dblclick',e=>{const w=s2w(e.clientX,e.clientY);if(selected){route={from:{x:selected.x,y:selected.y},to:{x:w.x,y:w.y}};selected.manualTarget={x:w.x,y:w.y};selected.action='walking';selected.goal='ir até o ponto escolhido'}});
  addEventListener('keydown',e=>{if(e.key==='+'||e.key==='=')zoom=clamp(zoom*1.2,.45,4.5);if(e.key==='-')zoom=clamp(zoom*.83,.45,4.5);if(e.key==='0'){zoom=1;panX=panY=0}});
  // force a first visible frame; this is the critical fix for the previously empty screen.
  mapDraw();
  setInterval(()=>{mapDraw();if(selected)refresh()},250);
  // startup overlay and persistent controls
  const KEY='MINICITY_PERSIST_V3';
  function pack(){return JSON.stringify({world:{...world,discoveries:[...world.discoveries]},people:people.map(p=>({...p,knowledge:[...(p.knowledge||[])]})),simTime})}
  function persist(){try{localStorage.setItem(KEY,pack())}catch(e){}}
  function restore(){try{const d=JSON.parse(localStorage.getItem(KEY));if(!d||!d.world||!Array.isArray(d.people))return false;Object.assign(world,d.world);world.discoveries=new Set(d.world.discoveries||[]);world.events=d.world.events||[];world.memory=d.world.memory||[];people.splice(0,people.length,...d.people);for(const p of people){p.knowledge=new Set(p.knowledge||[]);p.memory=p.memory||[];p.skills=p.skills||{};p.inventory=p.inventory||{};p.relations=p.relations||{}}simTime=d.simTime||0;return true}catch(e){return false}}
  const restored=restore();
  paused=true;
  const overlay=document.createElement('div');overlay.id='startScreen';overlay.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(3,9,5,.90);font-family:system-ui;pointer-events:auto';overlay.innerHTML=`<div style="width:min(560px,88vw);padding:36px;text-align:center;border:1px solid #35543b;border-radius:18px;background:#07110c;box-shadow:0 25px 80px #000"><div style="font-size:12px;letter-spacing:.25em;color:#9ad2a0;font-weight:800">MINICITY</div><div style="font-size:30px;font-weight:800;margin:10px 0">SOCIEDADE ARTIFICIAL</div><div style="font-size:13px;line-height:1.7;color:#a9baa9">${restored?'Estado anterior restaurado. Os habitantes continuarão exatamente de onde pararam.':'50 pessoas. Um mundo. Nenhuma profissão pré-programada. A sociedade começa quando você iniciar a simulação.'}</div><button id="startSimulation" style="margin-top:25px;padding:14px 30px;border:0;border-radius:10px;background:#2f7d3d;color:white;font-weight:800;font-size:14px;cursor:pointer">${restored?'CONTINUAR SIMULAÇÃO':'INICIAR SIMULAÇÃO'}</button></div>`;document.body.appendChild(overlay);
  const startBtn=document.getElementById('startSimulation');startBtn.onclick=()=>{paused=false;overlay.remove();const b=document.getElementById('pause');if(b)b.textContent='PAUSAR';persist();log(restored?'SIMULAÇÃO CONTINUADA: estado preservado.':'SIMULAÇÃO INICIADA: os 50 habitantes começaram a agir autonomamente.')};
  const pause=document.getElementById('pause');if(pause)pause.onclick=()=>{paused=!paused;pause.textContent=paused?'CONTINUAR':'PAUSAR';if(paused)persist()};
  const reset=document.getElementById('reset');if(reset)reset.onclick=()=>{persist();paused=true;overlay.style.display='flex';startBtn.textContent='CONTINUAR SIMULAÇÃO';};
  const save=document.getElementById('save');if(save)save.onclick=()=>{persist();log('ESTADO SALVO: você poderá continuar daqui.');};
  setInterval(()=>{if(!paused)persist()},5000);addEventListener('beforeunload',persist);
})();