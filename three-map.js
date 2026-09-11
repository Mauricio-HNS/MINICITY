(()=>{
'use strict';
const c=document.getElementById('world'); if(!c)return;
const boot=()=>{
 if(!window.THREE){setTimeout(boot,100);return}
 const T=window.THREE, scene=new T.Scene(); scene.background=new T.Color(0x9fc3d1);
 const camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.1,3000); camera.position.set(180,150,220);
 const renderer=new T.WebGLRenderer({canvas:c,antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true;
 const amb=new T.HemisphereLight(0xffffff,0x557755,1.8);scene.add(amb); const sun=new T.DirectionalLight(0xffffff,2.2);sun.position.set(-120,220,100);sun.castShadow=true;scene.add(sun);
 const world=new T.Group();scene.add(world);
 const mat=(color)=>new T.MeshStandardMaterial({color,roughness:.82});
 const box=(x,y,z,m)=>{const q=new T.Mesh(new T.BoxGeometry(x,y,z),m);q.castShadow=q.receiveShadow=true;return q};
 const ground=box(1200,2,900,mat(0x8fae76));ground.position.y=-1;world.add(ground);
 const river=new T.Mesh(new T.BoxGeometry(105,1,900),mat(0x4d94bd));river.position.set(40,.1,0);world.add(river);
 const lake=new T.Mesh(new T.CylinderGeometry(85,85,1,48),mat(0x4d94bd));lake.scale.z=.72;lake.position.set(-150,.2,300);world.add(lake);
 const roadMat=mat(0x77746c);[[0,0,900,24],[0,0,24,760],[-240,130,500,18],[0,-190,520,18]].forEach(a=>{const r=box(a[2],.8,a[3],roadMat);r.position.set(a[0],.4,a[1]);world.add(r)});
 function house(i){const g=new T.Group(), w=box(34,20,28,mat([0xf0dfc1,0xd7c2a5,0xe8d6ba,0xcbb89e][i%4]));w.position.y=10;g.add(w);const roof=new T.Mesh(new T.ConeGeometry(25,14,4),mat([0x9b4b3d,0x6d3d35,0x7c5140][i%3]));roof.rotation.y=Math.PI/4;roof.position.y=27;g.add(roof);const door=box(7,11,1,mat(0x594333));door.position.set(0,5,14.3);g.add(door);for(const x of[-10,10]){const win=box(7,6,1,mat(0x8ec5d4));win.position.set(x,12,14.3);g.add(win)}return g}
 for(let i=0;i<10;i++){const h=house(i);const a=i*Math.PI*2/10,r=70+(i%2)*35;h.position.set(Math.cos(a)*r,0,Math.sin(a)*r-40);world.add(h)}
 function tree(x,z){const g=new T.Group(),tr=new T.Mesh(new T.CylinderGeometry(2.2,3,16,8),mat(0x68452d));tr.position.y=8;g.add(tr);const crown=new T.Mesh(new T.SphereGeometry(10,10,8),mat(0x397044));crown.position.y=19;g.add(crown);g.position.set(x,0,z);world.add(g)}
 for(let i=0;i<55;i++){const a=i*2.4,r=260+(i%8)*22;tree(Math.cos(a)*r-240,Math.sin(a)*r)}
 const farm=box(260,.8,150,mat(0xb5a064));farm.position.set(230,.5,260);world.add(farm);for(let i=0;i<7;i++){const crop=box(12,1,125,mat(0x648c4d));crop.position.set(140+i*27,2,260);world.add(crop)}
 const mine=box(150,.8,120,mat(0x66645b));mine.position.set(-320,.5,270);world.add(mine);
 function person(i){const g=new T.Group();g.userData={id:i,name:'Habitante-'+String(i+1).padStart(2,'0'),speed:.35+Math.random()*.35};
  const skin=mat([0xb8785d,0xd49a7d,0x8d5b43,0xe0a889][i%4]),shirt=mat([0x3e5d86,0x7a4545,0x4d7652,0x9a713e,0x6a568a][i%5]),pants=mat([0x293746,0x443c35,0x354c3b][i%3]),shoe=mat(0x242424);
  const body=box(7,14,4.5,shirt);body.position.y=16;g.add(body);const head=new T.Mesh(new T.SphereGeometry(4.3,12,10),skin);head.position.y=27;g.add(head);
  const armL=box(2.2,13,2.2,skin),armR=armL.clone();armL.position.set(-5,16,0);armR.position.set(5,16,0);g.add(armL,armR);
  const legL=box(2.7,15,2.7,pants),legR=legL.clone();legL.position.set(-2,5,0);legR.position.set(2,5,0);g.add(legL,legR);
  const footL=box(3,2,6,shoe),footR=footL.clone();footL.position.set(-2, -3,2);footR.position.set(2,-3,2);g.add(footL,footR);
  [armL,armR,legL,legR].forEach((q,j)=>q.userData.limb=j);g.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true}});return g}
 const people=[];for(let i=0;i<50;i++){const p=person(i),a=i*2.399,r=35+(i%7)*7;p.position.set(Math.cos(a)*r,0,Math.sin(a)*r-30);p.userData.phase=Math.random()*6.28;p.userData.target=p.position.clone();people.push(p);world.add(p)}
 let paused=true,selected=-1,elapsed=0,drag=false,lastX=0,lastY=0,yaw=.65,pitch=.52,dist=430;
 const ui=document.createElement('div');ui.style='position:fixed;z-index:5;left:16px;top:16px;color:white;font:600 13px system-ui;background:rgba(8,15,11,.84);padding:14px 16px;border-radius:12px';ui.innerHTML='<b style="font-size:20px">MINICITY</b><br>3D • 50 HABITANTES<br><span id="status">PAUSADA</span><br><small>Arraste para girar • roda para aproximar • clique em uma pessoa • Espaço pausa</small>';document.body.appendChild(ui);
 const info=document.createElement('div');info.style='position:fixed;z-index:5;right:16px;top:16px;color:white;font:13px system-ui;background:rgba(8,15,11,.9);padding:16px;border-radius:12px;min-width:210px;display:none';document.body.appendChild(info);
 function target(p){const a=Math.random()*Math.PI*2,r=30+Math.random()*280;p.userData.target.set(Math.cos(a)*r,0,Math.sin(a)*r-30)}
 function animate(){requestAnimationFrame(animate);if(!paused){elapsed+=.016;people.forEach((p,i)=>{if(p.position.distanceTo(p.userData.target)<8)target(p);const d=p.userData.target.clone().sub(p.position);d.y=0;if(d.length()>1){d.normalize();p.position.addScaledVector(d,p.userData.speed);p.rotation.y=Math.atan2(d.x,d.z)}p.userData.phase+=.16*p.userData.speed;const swing=Math.sin(p.userData.phase)*.65;p.children.forEach(q=>{if(q.userData.limb===0)q.rotation.z=swing;if(q.userData.limb===1)q.rotation.z=-swing;if(q.userData.limb===2)q.rotation.x=swing;if(q.userData.limb===3)q.rotation.x=-swing});p.position.y=Math.abs(Math.sin(p.userData.phase))*1.2});document.getElementById('status').textContent='EM EXECUÇÃO • ANO '+Math.floor(elapsed/20+1)}camera.position.set(Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist);camera.lookAt(0,0,20);renderer.render(scene,camera)}animate();
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
 c.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY});addEventListener('pointerup',()=>drag=false);c.addEventListener('pointermove',e=>{if(drag){yaw-=(e.clientX-lastX)*.006;pitch=Math.max(.18,Math.min(1.25,pitch+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY}});c.addEventListener('wheel',e=>{dist=Math.max(120,Math.min(900,dist+e.deltaY*.45))},{passive:true});
 c.addEventListener('click',e=>{const ray=new T.Raycaster(),mouse=new T.Vector2((e.clientX/innerWidth)*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(mouse,camera);const hits=ray.intersectObjects(people,true);if(hits.length){let q=hits[0].object;while(q.parent&&!q.userData.name)q=q.parent;selected=q.userData.id;info.style.display='block';info.innerHTML='<b>'+q.userData.name+'</b><br><br>50 habitantes independentes<br>Estado: '+(paused?'pausado':'andando')+'<br>Movimento: autônomo'}});
 addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();paused=!paused;document.getElementById('status').textContent=paused?'PAUSADA':'EM EXECUÇÃO';}});
 const start=document.createElement('div');start.style='position:fixed;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(3,8,5,.82);font-family:system-ui;color:white';start.innerHTML='<div style="text-align:center;background:#08130c;padding:42px;border-radius:20px;max-width:600px"><div style="letter-spacing:.3em;font-weight:800">MINICITY</div><h1>UMA SOCIEDADE EM 3D</h1><p style="color:#b5c4b5;line-height:1.7">Casas com forma e cor, terreno tridimensional e 50 pessoas com cabeça, corpo, braços e pernas. Elas caminham pelo mundo e não atravessam umas às outras.</p><button id="start3d" style="padding:15px 28px;border:0;border-radius:10px;background:#347f40;color:#fff;font-weight:800;cursor:pointer">INICIAR SIMULAÇÃO 3D</button></div>';document.body.appendChild(start);document.getElementById('start3d').onclick=()=>{paused=false;start.remove()};
};boot();
})();