(()=>{
'use strict';
const old=document.getElementById('world'); if(old) old.style.display='none';
const c=document.createElement('canvas'); c.id='minicity3d'; c.style='position:fixed;inset:0;width:100vw;height:100vh;display:block;z-index:1;background:#9fc3d1';
document.body.style.margin='0'; document.body.style.overflow='hidden'; document.body.appendChild(c);
const boot=()=>{ if(!window.THREE){setTimeout(boot,100);return} const T=window.THREE;
const scene=new T.Scene(); scene.background=new T.Color(0x9fc3d1);
const camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.1,3000); const renderer=new T.WebGLRenderer({canvas:c,antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true;
scene.add(new T.HemisphereLight(0xffffff,0x557755,1.8)); const sun=new T.DirectionalLight(0xffffff,2.2); sun.position.set(-120,220,100); sun.castShadow=true; scene.add(sun);
const world=new T.Group(); scene.add(world); const mat=color=>new T.MeshStandardMaterial({color,roughness:.8});
const box=(x,y,z,m)=>{const q=new T.Mesh(new T.BoxGeometry(x,y,z),m);q.castShadow=q.receiveShadow=true;return q};
const cyl=(r,h,m,rad=10)=>{const q=new T.Mesh(new T.CylinderGeometry(r,r,h,rad),m);q.castShadow=q.receiveShadow=true;return q};
const sphere=(r,m)=>{const q=new T.Mesh(new T.SphereGeometry(r,12,10),m);q.castShadow=q.receiveShadow=true;return q};
const ground=box(1200,2,900,mat(0x8fae76)); ground.position.y=-1; world.add(ground);
const river=box(105,1,900,mat(0x4d94bd)); river.position.set(40,.1,0); world.add(river);
const lake=new T.Mesh(new T.CylinderGeometry(85,85,1,48),mat(0x4d94bd)); lake.scale.z=.72; lake.position.set(-150,.2,300); world.add(lake);
const roadMat=mat(0x77746c); [[0,0,900,24],[0,0,24,760],[-240,130,500,18],[0,-190,520,18]].forEach(a=>{const r=box(a[2],.8,a[3],roadMat);r.position.set(a[0],.4,a[1]);world.add(r)});
function house(i){const g=new T.Group(),w=box(34,20,28,mat([0xf0dfc1,0xd7c2a5,0xe8d6ba,0xcbb89e][i%4]));w.position.y=10;g.add(w);const roof=new T.Mesh(new T.ConeGeometry(25,14,4),mat([0x9b4b3d,0x6d3d35,0x7c5140][i%3]));roof.rotation.y=Math.PI/4;roof.position.y=27;g.add(roof);const door=box(7,11,1,mat(0x594333));door.position.set(0,5,14.3);g.add(door);for(const x of[-10,10]){const win=box(7,6,1,mat(0x8ec5d4));win.position.set(x,12,14.3);g.add(win)}return g}
for(let i=0;i<10;i++){const h=house(i),a=i*Math.PI*2/10,r=70+(i%2)*35;h.position.set(Math.cos(a)*r,0,Math.sin(a)*r-40);world.add(h)}
function tree(x,z){const g=new T.Group(),tr=cyl(2.2,16,mat(0x68452d));tr.position.y=8;g.add(tr);const crown=sphere(10,mat(0x397044));crown.position.y=19;g.add(crown);g.position.set(x,0,z);world.add(g)}
for(let i=0;i<55;i++){const a=i*2.4,r=260+(i%8)*22;tree(Math.cos(a)*r-240,Math.sin(a)*r)}
const farm=box(260,.8,150,mat(0xb5a064));farm.position.set(230,.5,260);world.add(farm);for(let i=0;i<7;i++){const crop=box(12,1,125,mat(0x648c4d));crop.position.set(140+i*27,2,260);world.add(crop)}
const mine=box(150,.8,120,mat(0x66645b));mine.position.set(-320,.5,270);world.add(mine);
function segment(parent,name,length,radius,material){const pivot=new T.Group();pivot.name=name;parent.add(pivot);const mesh=cyl(radius,length,material,10);mesh.position.y=-length/2;pivot.add(mesh);return pivot}
function joint(parent,name,radius,material){const j=sphere(radius,material);j.name=name;parent.add(j);return j}
function person(i){
 const g=new T.Group(); g.userData={id:i,name:'Habitante-'+String(i+1).padStart(2,'0'),speed:.24+Math.random()*.16};
 const skin=mat([0xb8785d,0xd49a7d,0x8d5b43,0xe0a889,0xa96f55][i%5]); const shirt=mat([0x3e5d86,0x7a4545,0x4d7652,0x9a713e,0x6a568a][i%5]); const pants=mat([0x293746,0x443c35,0x354c3b][i%3]); const shoe=mat(0x242424);
 const pelvis=new T.Group(); pelvis.name='pelvis'; pelvis.position.y=11; g.add(pelvis);
 const pelvisMesh=new T.Mesh(new T.SphereGeometry(5.2,12,8),shirt); pelvisMesh.scale.set(1.15,.72,.72); pelvis.add(pelvisMesh);
 const spine=new T.Group(); spine.name='spine'; spine.position.y=5; pelvis.add(spine); const torso=box(8,13,4.8,shirt); torso.position.y=1.5; spine.add(torso);
 const neck=new T.Group(); neck.name='neck'; neck.position.y=8.5; spine.add(neck); const neckMesh=cyl(1.8,2.2,skin); neckMesh.position.y=1; neck.add(neckMesh);
 const head=sphere(4.3,skin); head.position.y=5.1; neck.add(head); head.name='head';
 const shoulderY=6.8;
 for(const side of[-1,1]){
   const s=side<0?'L':'R'; const shoulder=new T.Group(); shoulder.name='shoulder_'+s; shoulder.position.set(side*5.0,shoulderY,0); spine.add(shoulder); joint(shoulder,'shoulder_joint_'+s,2.0,skin);
   const upper=segment(shoulder,'upper_arm_'+s,7.2,1.55,shirt); upper.rotation.z=side<0?-0.08:0.08; joint(upper,'elbow_'+s,1.65,skin);
   const fore=segment(upper,'forearm_'+s,6.5,1.35,skin); joint(fore,'wrist_'+s,1.3,skin); const hand=sphere(1.65,skin);hand.position.y=-6.8;fore.add(hand);hand.name='hand_'+s;
   const hip=new T.Group(); hip.name='hip_'+s; hip.position.set(side*2.15,0,0); pelvis.add(hip); joint(hip,'hip_joint_'+s,2.0,skin);
   const thigh=segment(hip,'thigh_'+s,8.7,2.0,pants); joint(thigh,'knee_'+s,1.8,skin);
   const shin=segment(thigh,'shin_'+s,8.0,1.55,pants); joint(shin,'ankle_'+s,1.35,skin);
   const foot=new T.Group();foot.name='foot_'+s;foot.position.set(0,-8.1,1.8);shin.add(foot);const shoeMesh=box(3.6,2.2,6.5,shoe);shoeMesh.position.z=1.2;foot.add(shoeMesh);
 }
 g.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true}});
 g.userData.joints={spine,neck}; return g;
}
const people=[]; for(let i=0;i<50;i++){const p=person(i),a=i*2.399,r=35+(i%7)*7;p.position.set(Math.cos(a)*r,0,Math.sin(a)*r-30);p.userData.phase=Math.random()*6.28;p.userData.target=p.position.clone();people.push(p);world.add(p)}
let paused=true,drag=false,lastX=0,lastY=0,yaw=.65,pitch=.52,dist=430,elapsed=0;
const ui=document.createElement('div'); ui.style='position:fixed;z-index:10;left:16px;top:16px;color:white;font:600 13px system-ui;background:rgba(8,15,11,.84);padding:14px 16px;border-radius:12px';ui.innerHTML='<b style="font-size:20px">MINICITY</b><br>3D • 50 HUMANOS ARTICULADOS<br><span id="status">PAUSADA</span><br><small>Ombro • cotovelo • punho • quadril • joelho • tornozelo<br>Arraste para girar • roda para aproximar • clique em uma pessoa • Espaço pausa</small>';document.body.appendChild(ui);
const info=document.createElement('div'); info.style='position:fixed;z-index:10;right:16px;top:16px;color:white;font:13px system-ui;background:rgba(8,15,11,.9);padding:16px;border-radius:12px;min-width:230px;display:none';document.body.appendChild(info);
function target(p){const a=Math.random()*Math.PI*2,r=30+Math.random()*280;p.userData.target.set(Math.cos(a)*r,0,Math.sin(a)*r-30)}
function separate(){for(let k=0;k<3;k++)for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){const a=people[i],b=people[j],dx=b.position.x-a.position.x,dz=b.position.z-a.position.z,d=Math.hypot(dx,dz),min=12;if(d>0&&d<min){const nx=dx/d,nz=dz/d,push=(min-d)/2;a.position.x-=nx*push;a.position.z-=nz*push;b.position.x+=nx*push;b.position.z+=nz*push}}}
function walk(p){const phase=p.userData.phase;const armSwing=Math.sin(phase)*.42;const legSwing=Math.sin(phase)*.5; const L=p.getObjectByName('upper_arm_L'),R=p.getObjectByName('upper_arm_R'),FL=p.getObjectByName('forearm_L'),FR=p.getObjectByName('forearm_R'),TL=p.getObjectByName('thigh_L'),TR=p.getObjectByName('thigh_R'),SL=p.getObjectByName('shin_L'),SR=p.getObjectByName('shin_R');
 L.rotation.z=-.08+armSwing;R.rotation.z=.08-armSwing;FL.rotation.x=-Math.max(0,-armSwing)*.7;FR.rotation.x=-Math.max(0,armSwing)*.7;TL.rotation.x=legSwing;TR.rotation.x=-legSwing;SL.rotation.x=-Math.max(0,legSwing)*.75;SR.rotation.x=-Math.max(0,-legSwing)*.75;
}
function animate(){requestAnimationFrame(animate);if(!paused){elapsed+=.016;people.forEach(p=>{if(p.position.distanceTo(p.userData.target)<8)target(p);const d=p.userData.target.clone().sub(p.position);d.y=0;if(d.length()>1){d.normalize();p.position.addScaledVector(d,p.userData.speed);p.rotation.y=Math.atan2(d.x,d.z);p.userData.phase+=.13*p.userData.speed;walk(p)}else p.userData.phase+=.02;p.position.y=Math.abs(Math.sin(p.userData.phase))*1.0});separate();document.getElementById('status').textContent='EM EXECUÇÃO • ANO '+Math.floor(elapsed/20+1)}camera.position.set(Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist);camera.lookAt(0,10,20);renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
c.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY});addEventListener('pointerup',()=>drag=false);c.addEventListener('pointermove',e=>{if(drag){yaw-=(e.clientX-lastX)*.006;pitch=Math.max(.18,Math.min(1.25,pitch+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY}});c.addEventListener('wheel',e=>{e.preventDefault();dist=Math.max(100,Math.min(900,dist+e.deltaY*.45))},{passive:false});
c.addEventListener('click',e=>{const ray=new T.Raycaster(),mouse=new T.Vector2((e.clientX/innerWidth)*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(mouse,camera);const hits=ray.intersectObjects(people,true);if(hits.length){let q=hits[0].object;while(q.parent&&!q.userData.name)q=q.parent;info.style.display='block';info.innerHTML='<b>'+q.userData.name+'</b><br><br>Corpo humano articulado<br>Articulações: ombros, cotovelos, punhos, quadris, joelhos e tornozelos<br>Estado: '+(paused?'pausado':'andando')}});
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();paused=!paused;document.getElementById('status').textContent=paused?'PAUSADA':'EM EXECUÇÃO'}});
const start=document.createElement('div');start.style='position:fixed;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(3,8,5,.82);font-family:system-ui;color:white';start.innerHTML='<div style="text-align:center;background:#08130c;padding:42px;border-radius:20px;max-width:620px"><div style="letter-spacing:.3em;font-weight:800">MINICITY</div><h1>UMA SOCIEDADE HUMANA EM 3D</h1><p style="color:#b5c4b5;line-height:1.7">50 habitantes com anatomia corporal simplificada e hierarquia de articulações. Ombros e quadris funcionam como articulações multiaxiais; cotovelos, joelhos e tornozelos como articulações predominantemente de dobradiça, seguindo princípios anatômicos reais.</p><button id="start3d" style="padding:15px 28px;border:0;border-radius:10px;background:#347f40;color:#fff;font-weight:800;cursor:pointer">INICIAR SIMULAÇÃO 3D</button></div>';document.body.appendChild(start);document.getElementById('start3d').onclick=()=>{paused=false;start.remove()};
};boot();})();