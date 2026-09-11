(()=>{'use strict';
const old=[...document.querySelectorAll('canvas')];old.forEach(c=>c.style.display='none');[...document.body.children].forEach(e=>{if(e.tagName==='DIV')e.style.display='none'});
document.body.style.cssText='margin:0;overflow:hidden;background:#c7d5d1;font-family:Inter,system-ui,sans-serif';
const c=document.createElement('canvas');c.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;display:block;cursor:grab';document.body.appendChild(c);const g=c.getContext('2d');
const hud=document.createElement('div');hud.style='position:fixed;left:24px;top:20px;z-index:20;color:#16211f;pointer-events:none;text-shadow:0 1px 2px #fff8';document.body.appendChild(hud);
const panel=document.createElement('div');panel.style='position:fixed;right:20px;top:20px;width:310px;max-height:78vh;overflow:auto;z-index:30;background:#17211fee;color:#fff;border-radius:18px;padding:18px;box-shadow:0 18px 55px #0006;font-size:13px;display:none';document.body.appendChild(panel);
const controls=document.createElement('div');controls.style='position:fixed;right:20px;bottom:20px;z-index:30';controls.innerHTML='<button id="cp">PAUSAR</button> <button id="cr">NOVO MUNDO</button>';document.body.appendChild(controls);controls.querySelectorAll('button').forEach(b=>b.style='border:0;border-radius:11px;padding:11px 16px;background:#17211f;color:white;font-weight:850;box-shadow:0 7px 22px #0004');
let zoom=1.08,panX=0,panY=35,drag=false,moved=false,lx=0,ly=0,paused=false,selected=null,state={people:[],houses:[],world:{},year:1,day:0};
const A=Math.PI/4,T=.58,G=0;const skins=['#d49b78','#8d6049','#efbe9a','#b87856','#a56d50'],shirts=['#3d6699','#b5564e','#4f805b','#bd9348','#785b92','#3e7f86','#a56a45'],pants=['#283b52','#45443f','#543f36','#344d5d'];
function resize(){c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}resize();addEventListener('resize',resize);
function P(X,Y,Z){const dx=X*Math.cos(A)-Z*Math.sin(A),dz=X*Math.sin(A)+Z*Math.cos(A);return[innerWidth/2+panX+dx*zoom*5,innerHeight/2+panY+(dz*T-Y)*zoom*5]}
function poly(a,col){g.fillStyle=col;g.beginPath();a.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill()}function ln(a,b,col,w=1){g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}function plane(x1,z1,x2,z2,col){poly([P(x1,G,z1),P(x2,G,z1),P(x2,G,z2),P(x1,G,z2)],col)}
function load(){try{const s=JSON.parse(localStorage.getItem('MINICITY_WORLD')||'null');if(s){state=s;state.people=Array.isArray(s.people)?s.people:[];state.houses=Array.isArray(s.houses)?s.houses:[];state.world=s.world||{}}}catch(e){}if(!state.people.length)state.people=Array.from({length:50},(_,i)=>({id:i,name:'Habitante '+(i+1),x:-65+(i%10)*14,z:-42+Math.floor(i/10)*16,age:20+i%40,goal:'explorar',task:'observando',trait:'curioso',money:10,inventory:{}}))}
function roads(){plane(-84,-35,84,-25,'#505351');plane(-84,-5,84,5,'#505351');plane(-84,25,84,35,'#505351');[-45,0,45].forEach(X=>plane(X-5,-70,X+5,70,'#505351'));for(const z of [-30,0,30]){for(let X=-78;X<78;X+=14)ln(P(X,.03,z),P(X+7,.03,z),'#dfcf8e',1.5)}for(const X of [-45,0,45]){for(let Z=-63;Z<63;Z+=14)ln(P(X,.03,Z),P(X,.03,Z+7),'#dfcf8e',1.5)}for(const X of [-45,0,45])for(let i=-3;i<=3;i++)plane(X+i*1.8,-5,X+i*1.0+1,5,'#eee9dd')}
function house(h){const X=h.x||0,Z=h.z||0,W=(h.w||5)*1.8,D=(h.w||5)*1.3,H=(h.h||5)*2.4;const b1=P(X-W/2,0,Z-D/2),b2=P(X+W/2,0,Z-D/2),b3=P(X+W/2,0,Z+D/2),b4=P(X-W/2,0,Z+D/2);const t1=P(X-W/2,H,Z-D/2),t2=P(X+W/2,H,Z-D/2),t3=P(X+W/2,H,Z+D/2),t4=P(X-W/2,H,Z+D/2);poly([b1,b2,t2,t1],h.wall||'#d4b38a');poly([b2,b3,t3,t2],'#b9826b');poly([b3,b4,t4,t3],'#c59a72');poly([b4,b1,t1,t4],'#dfc39a');const roofY=H+7;poly([P(X-W/2,roofY,Z-D/2),P(X+W/2,roofY,Z-D/2),P(X+W/2,roofY,Z+D/2),P(X-W/2,roofY,Z+D/2)],h.roof||'#76574a');const s=zoom;const door=P(X,0,Z+D/2+.03);g.fillStyle='#5d402f';g.fillRect(door[0]-5*s,door[1]-18*s,10*s,18*s);for(const side of [-1,1]){const q=P(X+side*W*.25,H*.46,Z+D/2+.04);g.fillStyle='#a9d5d7';g.fillRect(q[0]-7*s,q[1]-7*s,14*s,7*s);g.fillStyle='#789596';g.fillRect(q[0]-1*s,q[1]-7*s,2*s,7*s)}if(h.shop){const q=P(X,H*.72,Z+D/2+.05);g.fillStyle='#efd16c';g.fillRect(q[0]-29*s,q[1]-8*s,58*s,15*s);g.fillStyle='#42382e';g.font=`900 ${8*s}px system-ui`;g.textAlign='center';g.fillText(h.shop,q[0],q[1]+3*s)}}
function tree(X,Z){const q=P(X,0,Z),s=zoom;g.fillStyle='#684936';g.fillRect(q[0]-2*s,q[1]-18*s,4*s,18*s);g.fillStyle='#3f7048';g.beginPath();g.arc(q[0],q[1]-27*s,14*s,0,7);g.fill();g.fillStyle='#6e9c5b';g.beginPath();g.arc(q[0]-6*s,q[1]-32*s,9*s,0,7);g.fill();g.beginPath();g.arc(q[0]+7*s,q[1]-29*s,8*s,0,7);g.fill()}
function lamp(X,Z){const q=P(X,0,Z),s=zoom;ln([q[0],q[1]],[q[0],q[1]-25*s],'#30352f',2);g.fillStyle='#ffe59a';g.beginPath();g.arc(q[0],q[1]-27*s,3*s,0,7);g.fill()}
function human(p){
 const s=zoom*(.78+(p.id%4)*.035),X=p.x||0,Z=p.z||0;let dx=p.dirX||1,dz=p.dirZ||0,L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
 const o=P(X,0,Z),f=P(X+dx,0,Z+dz),ux=f[0]-o[0],uy=f[1]-o[1],ll=Math.hypot(ux,uy)||1,fx=ux/ll,fy=uy/ll,rx=-fy,ry=fx;
 const t=performance.now()/115+(p.id||0)*.73,sw=Math.sin(t)*6*s,sw2=Math.sin(t+Math.PI)*6*s;
 function J(side,y,forward=0){return P(X+rx*side+fx*forward,y,Z+ry*side+fy*forward)}
 function limb(a,b,col,w){ln(a,b,col,w*s)}
 function joint(q,col,r){g.fillStyle=col;g.beginPath();g.arc(q[0],q[1],r*s,0,Math.PI*2);g.fill()}
 const skin=skins[p.id%skins.length],shirt=shirts[p.id%shirts.length],pant=pants[p.id%pants.length];
 const leftFoot=J(-4+sw*.10/s,0,sw*.18/s), rightFoot=J(4+sw2*.10/s,0,sw2*.18/s);
 const leftAnkle=J(-4+sw*.10/s,4,sw*.16/s),rightAnkle=J(4+sw2*.10/s,4,sw2*.16/s);
 const leftKnee=J(-5-sw*.11/s,15,sw*.10/s),rightKnee=J(5-sw2*.11/s,15,sw2*.10/s);
 const pelvis=J(0,27,0),waist=J(0,34,0),chest=J(0,43,0),neck=J(0,50,0),head=J(0,59,0);
 const lShoulder=J(-10,43,0),rShoulder=J(10,43,0),lElbow=J(-14,30,sw*.08/s),rElbow=J(14,30,sw2*.08/s),lWrist=J(-16,16,sw*.14/s),rWrist=J(16,16,sw2*.14/s),lHand=J(-16,11,sw*.17/s),rHand=J(16,11,sw2*.17/s);
 g.save();g.shadowColor='#0006';g.shadowBlur=3;g.shadowOffsetY=2;
 // shoes and legs
 limb(leftFoot,leftAnkle,'#24272b',4.8);limb(rightFoot,rightAnkle,'#24272b',4.8);
 limb(leftAnkle,leftKnee,pant,7);limb(rightAnkle,rightKnee,pant,7);joint(leftKnee,pant,3.6);joint(rightKnee,pant,3.6);limb(leftKnee,pelvis,pant,7);limb(rightKnee,pelvis,pant,7);
 // pelvis / torso with shoulders and waist
 poly([J(-8,28),J(8,28),J(10,41),J(9,46),J(-9,46),J(-10,41)],shirt);
 poly([J(-7,27),J(7,27),J(8,33),J(-8,33)],pant);
 // neck
 limb(neck,head,skin,5.5);
 // arms, fully articulated
 limb(lShoulder,lElbow,shirt,6.5);limb(lElbow,lWrist,skin,5.2);limb(lWrist,lHand,skin,4.3);
 limb(rShoulder,rElbow,shirt,6.5);limb(rElbow,rWrist,skin,5.2);limb(rWrist,rHand,skin,4.3);
 joint(lElbow,skin,3.1);joint(rElbow,skin,3.1);joint(lWrist,skin,2.7);joint(rWrist,skin,2.7);
 // head, ears, hair, face direction
 g.fillStyle=skin;g.beginPath();g.ellipse(head[0],head[1],7.8*s,8.8*s,0,0,Math.PI*2);g.fill();
 const hair=p.id%3===0?'#2b211b':p.id%3===1?'#6b432b':'#1e2427';g.fillStyle=hair;g.beginPath();g.arc(head[0],head[1]-3*s,8*s,Math.PI,Math.PI*2);g.fill();
 g.fillStyle=skin;g.beginPath();g.arc(head[0]+fx*7*s,head[1]+fy*2*s,2.2*s,0,Math.PI*2);g.fill();
 // face details when the person is close enough
 if(s>1.25){const ex=head[0]+fx*5*s+rx*3*s,ey=head[1]+fy*1*s+ry*3*s;g.fillStyle='#28211d';g.beginPath();g.arc(ex,ey,1*s,0,7);g.fill();g.beginPath();g.arc(head[0]+fx*5*s-rx*3*s,head[1]+fy*1*s-ry*3*s,1*s,0,7);g.fill()}
 // grounding shadow
 g.restore();g.fillStyle='#0003';g.beginPath();g.ellipse(o[0],o[1]+1,8*s,3*s,0,0,Math.PI*2);g.fill();
 if(selected===p){g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.ellipse(o[0],o[1]-30*s,18*s,35*s,0,0,7);g.stroke()}
}
function park(){plane(-75,37,-20,67,'#7fa06f');for(let X=-67;X<-25;X+=12)tree(X,47+(X%3)*5)}function river(){plane(55,-68,82,-10,'#4f91a3');for(let z=-62;z<-12;z+=8)ln(P(57,.05,z),P(78,.05,z+3),'#8bc1c9',1.2)}
function draw(){load();g.clearRect(0,0,innerWidth,innerHeight);const grad=g.createLinearGradient(0,0,0,innerHeight);grad.addColorStop(0,'#b9d1d2');grad.addColorStop(1,'#dce2d8');g.fillStyle=grad;g.fillRect(0,0,innerWidth,innerHeight);plane(-92,-78,92,78,'#9caf84');river();park();roads();[-65,-20,20,65].forEach(X=>{tree(X,-58);tree(X,58)});[-36,-9,18,45].forEach(X=>{lamp(X,-9);lamp(X,39)});const items=[];state.houses.forEach(h=>items.push({z:(h.z||0)+(h.w||5),type:0,v:h}));state.people.filter(p=>p.alive!==false).forEach(p=>items.push({z:p.z||0,type:1,v:p}));items.sort((a,b)=>a.z-b.z||a.type-b.type);items.forEach(o=>o.type?human(o.v):house(o.v));const alive=state.people.filter(p=>p.alive!==false).length;hud.innerHTML=`<div style="font-size:30px;font-weight:950;letter-spacing:5px">MINICITY</div><div style="font-size:12px;font-weight:800;margin-top:3px">ANO ${state.year||1} · DIA ${state.day||0} · ${alive} HABITANTES</div>`;if(!paused)requestAnimationFrame(draw)}
function inspect(p){selected=p;panel.style.display='block';panel.innerHTML=`<div style="font-size:21px;font-weight:900">${p.name||'Habitante'}</div><div style="opacity:.55;margin:4px 0 14px">ID ${p.id??'-'} · ${p.alive===false?'MORTO':'VIVO'}</div><div style="line-height:1.8"><b>Idade:</b> ${p.age??'-'}<br><b>Objetivo:</b> ${p.goal||'-'}<br><b>Tarefa:</b> ${p.task||'-'}<br><b>Personalidade:</b> ${p.trait||'-'}<br><b>Dinheiro:</b> ${p.money??0}<br><b>Casa:</b> ${p.home==null?'sem casa':'#'+p.home}<br><b>Memórias:</b> ${(p.memory||[]).length}</div>`}
function hit(mx,my){let best=null,bd=Infinity;state.people.forEach(p=>{if(p.alive===false)return;const q=P(p.x||0,0,p.z||0),d=Math.hypot(mx-q[0],my-(q[1]-30*zoom));if(d<34*zoom&&d<bd){bd=d;best=p}});return best}
c.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.65,Math.min(3.2,zoom*(e.deltaY<0?1.08:.92)));},{passive:false});c.addEventListener('pointerdown',e=>{drag=true;moved=false;lx=e.clientX;ly=e.clientY;c.style.cursor='grabbing'});addEventListener('pointerup',()=>{drag=false;c.style.cursor='grab'});addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;panX+=dx;panY+=dy;lx=e.clientX;ly=e.clientY});c.addEventListener('click',e=>{if(!moved){const p=hit(e.clientX,e.clientY);if(p)inspect(p)}});document.getElementById('cp').onclick=()=>{paused=!paused;document.getElementById('cp').textContent=paused?'CONTINUAR':'PAUSAR';if(!paused)draw()};document.getElementById('cr').onclick=()=>{localStorage.removeItem('MINICITY_WORLD');location.reload()};draw();
})();