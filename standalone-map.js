(()=>{
'use strict';
const canvas=document.getElementById('world');
if(!canvas)return;
const ctx=canvas.getContext('2d');
let W=innerWidth,H=innerHeight,dpr=devicePixelRatio||1,zoom=1,ox=0,oy=0,paused=true,selected=-1,drag=false,lx=0,ly=0,started=false,sim=0;
const KEY='MINICITY_STANDALONE_V1';
const names=['Ana','Bruno','Clara','Davi','Elena','Felipe','Gabriela','Hugo','Iara','Joao','Karina','Leo','Marta','Nuno','Olivia','Paulo','Rita','Sofia','Tiago','Vera','Yara','Zeca','Alice','Bia','Caio','Diana','Eva','Fabi','Gabi','Heitor','Ines','Julia','Lia','Miguel','Nina','Otavio','Pietro','Raquel','Sara','Theo','Ursula','Vitor','Wanda','Xavier','Yasmin','Zoe','Arthur','Beatriz','Celia','Diego','Emma'];
let people=[];
function resize(){W=innerWidth;H=innerHeight;dpr=devicePixelRatio||1;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
addEventListener('resize',resize);
function newWorld(){people=names.map((n,i)=>({id:i,name:n+'-'+String(i+1).padStart(2,'0'),x:-270+Math.random()*540,y:-180+Math.random()*360,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*20,energy:.7+Math.random()*.3,age:18+Math.random()*38,action:'observando'}));sim=0;selected=-1;started=false;paused=true;save()}
function save(){try{localStorage.setItem(KEY,JSON.stringify({people,zoom,ox,oy,sim,started}))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&Array.isArray(s.people)&&s.people.length===50){people=s.people;zoom=s.zoom||1;ox=s.ox||0;oy=s.oy||0;sim=s.sim||0;started=!!s.started;paused=true;return true}}catch(e){}return false}
function ws(x,y){return{x:W/2+ox+x*zoom,y:H/2+oy+y*zoom}}
function sw(x,y){return{x:(x-W/2-ox)/zoom,y:(y-H/2-oy)/zoom}}
function text(t,x,y,size=12){ctx.save();ctx.font='700 '+size+'px system-ui';ctx.fillStyle='#fff';ctx.shadowColor='#000';ctx.shadowBlur=5;ctx.fillText(t,x,y);ctx.restore()}
function draw(){
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#17301d';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(W/2+ox,H/2+oy);ctx.scale(zoom,zoom);
 ctx.fillStyle='#aabd96';ctx.fillRect(-750,-500,1500,1000);
 // river
 ctx.fillStyle='#4d93b3';ctx.beginPath();ctx.moveTo(-70,-500);ctx.bezierCurveTo(110,-320,-30,-170,55,0);ctx.bezierCurveTo(150,190,-70,300,80,500);ctx.lineTo(155,500);ctx.bezierCurveTo(10,300,190,180,110,-5);ctx.bezierCurveTo(30,-180,180,-330,65,-500);ctx.closePath();ctx.fill();
 // forest
 ctx.fillStyle='#628b58';ctx.beginPath();ctx.arc(-330,-190,180,0,Math.PI*2);ctx.fill();for(let i=0;i<90;i++){let a=i*2.4,r=25+(i*17)%145,x=-330+Math.cos(a)*r,y=-190+Math.sin(a)*r;ctx.fillStyle=i%3?'#3f7447':'#527f4e';ctx.beginPath();ctx.arc(x,y,5+(i%3),0,Math.PI*2);ctx.fill()}
 // lake
 ctx.fillStyle='#70a8ba';ctx.beginPath();ctx.ellipse(-20,315,100,68,0,0,Math.PI*2);ctx.fill();
 // farm
 ctx.fillStyle='#c8bd82';ctx.fillRect(155,170,210,140);ctx.strokeStyle='#887e50';ctx.strokeRect(155,170,210,140);for(let i=0;i<7;i++){ctx.fillStyle=i%2?'#9eae61':'#b4bd70';ctx.fillRect(165+i*28,182,19,115)}
 // mine
 ctx.fillStyle='#777f72';ctx.fillRect(-350,170,135,135);ctx.fillStyle='#454d47';ctx.fillRect(-333,188,100,100);
 // roads
 const roads=[[[-500,0],[500,0]],[[0,-430],[0,430]],[[-260,120],[260,120]],[[0,0],[300,230]],[[0,0],[-280,-220]]];ctx.lineCap='round';ctx.strokeStyle='#e5dcc3';ctx.lineWidth=16;for(const r of roads){ctx.beginPath();ctx.moveTo(...r[0]);ctx.lineTo(...r[1]);ctx.stroke()}ctx.strokeStyle='#a6a08c';ctx.lineWidth=2;for(const r of roads){ctx.beginPath();ctx.moveTo(...r[0]);ctx.lineTo(...r[1]);ctx.stroke()}
 // village
 for(let i=0;i<10;i++){let a=i*2.4,r=45+(i%5)*25,x=Math.cos(a)*r,y=Math.sin(a)*r;ctx.fillStyle='#eee5d0';ctx.fillRect(x-14,y-10,28,20);ctx.fillStyle='#a96848';ctx.fillRect(x-14,y-10,28,6)}
 text('FLORESTA',-390,-350);text('RIO',80,-110);text('VILA',-25,-65);text('FAZENDAS',180,335);text('MINA',-350,335);text('LAGO',-55,400);
 for(const p of people){ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=p.id===selected?'#174dcc':'#263b30';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-7,7,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#b88968';ctx.fillRect(-5,0,10,13);if(p.id===selected){ctx.strokeStyle='#174dcc';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,2,17,0,Math.PI*2);ctx.stroke();text(p.name,12,-12,11)}ctx.restore()}
 ctx.restore();
 // HUD
 ctx.fillStyle='rgba(5,12,8,.9)';ctx.fillRect(12,12,330,76);ctx.fillStyle='#fff';ctx.font='800 18px system-ui';ctx.fillText('MINICITY',28,39);ctx.font='12px system-ui';ctx.fillText('SOCIEDADE ARTIFICIAL • 50 HABITANTES',28,61);ctx.fillStyle='#9fd1a5';ctx.fillText('ANO '+Math.floor(sim/60+1)+'  •  '+(paused?'PAUSADA':'EM EXECUÇÃO'),28,80);
 ctx.fillStyle='rgba(5,12,8,.9)';ctx.fillRect(W-180,12,168,104);ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.fillText('CONTROLES',W-160,35);ctx.font='11px system-ui';ctx.fillText('+ / -  Zoom',W-160,55);ctx.fillText('Arrastar  Mover mapa',W-160,72);ctx.fillText('Clique  Selecionar pessoa',W-160,89);ctx.fillText('Espaço  Pausar',W-160,106);
}
function update(){if(!paused){sim+=.5;for(const p of people){p.x+=p.vx*.03;p.y+=p.vy*.03;if(p.x<-690||p.x>690)p.vx*=-1;if(p.y<-440||p.y>440)p.vy*=-1;if(Math.random()<.01){p.vx+=(Math.random()-.5)*8;p.vy+=(Math.random()-.5)*8;p.action=['explorando','buscando recursos','aprendendo','construindo','socializando'][Math.floor(Math.random()*5)]}}save()}draw();requestAnimationFrame(update)}
function panel(){const old=document.getElementById('standalonePanel');if(old)old.remove();const el=document.createElement('div');el.id='standalonePanel';el.style='position:fixed;inset:0;z-index:10000;background:rgba(3,8,5,.94);display:flex;align-items:center;justify-content:center;font-family:system-ui;color:#fff';const has=started;el.innerHTML='<div style="width:min(600px,90vw);padding:38px;text-align:center;background:#07110c;border:1px solid #34553a;border-radius:18px;box-shadow:0 25px 90px #000"><div style="font-size:12px;letter-spacing:.3em;color:#9bd3a0;font-weight:800">MINICITY</div><h1 style="margin:12px 0 8px;font-size:30px">SOCIEDADE ARTIFICIAL</h1><p style="color:#a9baa9;line-height:1.7">50 habitantes independentes em um mundo persistente. Eles exploram, aprendem, se movimentam e desenvolvem comportamentos ao longo da simulação.</p><button id="go" style="padding:15px 28px;border:0;border-radius:10px;background:#347f40;color:#fff;font-weight:800;font-size:14px;cursor:pointer">'+(has?'CONTINUAR DE ONDE PAROU':'INICIAR SIMULAÇÃO')+'</button><button id="fresh" style="display:block;margin:14px auto 0;background:none;border:0;color:#8da98f;cursor:pointer">NOVO MUNDO</button></div>';document.body.appendChild(el);document.getElementById('go').onclick=()=>{paused=false;started=true;el.remove();save()};document.getElementById('fresh').onclick=()=>{newWorld();el.remove();paused=false;started=true;save()}}
canvas.addEventListener('mousedown',e=>{drag=true;lx=e.clientX;ly=e.clientY});addEventListener('mouseup',()=>drag=false);canvas.addEventListener('mousemove',e=>{if(drag){ox+=e.clientX-lx;oy+=e.clientY-ly;lx=e.clientX;ly=e.clientY;draw()}});canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.45,Math.min(4.5,zoom*(e.deltaY<0?1.15:.87)));draw()},{passive:false});canvas.addEventListener('click',e=>{if(drag)return;const q=sw(e.clientX,e.clientY);let hit=-1,best=25/zoom;people.forEach(p=>{const d=Math.hypot(p.x-q.x,p.y-q.y);if(d<best){best=d;hit=p.id}});selected=hit;draw();if(hit>=0){const p=people[hit];let d=document.getElementById('personInfo');if(!d){d=document.createElement('div');d.id='personInfo';d.style='position:fixed;right:15px;top:130px;width:250px;padding:14px;background:rgba(5,12,8,.92);border:1px solid #35553a;border-radius:12px;color:#fff;font:12px system-ui'}document.body.appendChild(d);d.innerHTML='<b style="font-size:16px">'+p.name+'</b><br><br>Idade: '+p.age.toFixed(1)+'<br>Ação: '+p.action+'<br>Energia: '+Math.round(p.energy*100)+'%<br>Posição: '+Math.round(p.x)+', '+Math.round(p.y)}});
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();paused=!paused;save();draw()}if(e.key==='+')zoom=Math.min(4.5,zoom*1.2);if(e.key==='-')zoom=Math.max(.45,zoom*.83);if(e.key==='0'){zoom=1;ox=oy=0}draw()});
newWorld();const restored=load();resize();if(restored)save();panel();update();
})();