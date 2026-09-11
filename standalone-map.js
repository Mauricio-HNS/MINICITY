(()=>{'use strict';
const canvas=document.getElementById('world')||document.querySelector('canvas');if(!canvas)return;const ctx=canvas.getContext('2d');
let W=innerWidth,H=innerHeight,dpr=devicePixelRatio||1,zoom=1,panX=0,panY=0,last=performance.now(),paused=false;
canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.scale(dpr,dpr);
const people=Array.from({length:50},(_,i)=>({id:i+1,x:(i%10)*7-31,y:Math.floor(i/10)*8-16,dir:i%2?1:-1,phase:(i%7)/7,speed:.8+(i%5)*.08}));
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);
function iso(x,y,z=0){const s=zoom*18;return [W/2+panX+(x-y)*s*.72,H/2+panY+(x+y)*s*.36-z*s]}
function limb(a,b,c,d){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.lineTo(d[0],d[1]);ctx.stroke()}
function human(p,t){const [cx,cy]=iso(p.x,p.y,0),s=zoom*.62,walk=Math.sin(t*p.speed*5+p.phase*6.28),walk2=Math.sin(t*p.speed*5+p.phase*6.28+Math.PI);
const fx=p.dir,fy=0;ctx.save();ctx.translate(cx,cy);ctx.strokeStyle='#202020';ctx.fillStyle='#d8a07a';ctx.lineWidth=Math.max(1.4,s*2.2);ctx.lineCap='round';
// corpo central
ctx.beginPath();ctx.moveTo(0,-24*s);ctx.lineTo(0,-8*s);ctx.stroke();
// cabeça
ctx.beginPath();ctx.arc(0,-29*s,4.5*s,0,Math.PI*2);ctx.fill();ctx.stroke();
// ombros: braços realmente articulados no tronco
const sh=10*s,hip=6*s;
const armSwing=walk*9*s;limb([-sh,-21*s],[-sh-1*s,-14*s+armSwing],[-sh*.9,-7*s+armSwing*.4],[-sh*.9,-4*s+armSwing*.3]);
limb([sh,-21*s],[sh+1*s,-14*s-armSwing],[sh*.9,-7*s-armSwing*.4],[sh*.9,-4*s-armSwing*.3]);
// quadril: pernas realmente saindo da articulação do quadril
const legSwing=walk*10*s;
function leg(side,sw){const x=side*hip;const kneeX=x+side*2*s+sw*.18,kneeY=-2*s+Math.abs(sw)*.08;const ankleX=kneeX+side*1*s+sw*.16,ankleY=13*s;limb([x,-7*s],[kneeX,kneeY],[ankleX,ankleY],[ankleX+side*2*s,16*s])}
leg(-1,legSwing);leg(1,-legSwing);
ctx.restore()}
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#7ca85b';ctx.fillRect(0,0,W,H);
// terrenos
for(let x=-50;x<=50;x+=20)for(let y=-35;y<=35;y+=20){const a=iso(x,y),b=iso(x+18,y),c=iso(x+18,y+18),d=iso(x,y+18);ctx.fillStyle='#86b566';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.lineTo(...d);ctx.closePath();ctx.fill()}
// ruas e calçadas no chão
for(let x=-42;x<=42;x+=20){let a=iso(x,-42),b=iso(x+8,-42),c=iso(x+8,42),d=iso(x,42);ctx.fillStyle='#555';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.lineTo(...d);ctx.fill();let a2=iso(x-3,-42),b2=iso(x,-42),c2=iso(x,42),d2=iso(x-3,42);ctx.fillStyle='#c8c1ad';ctx.beginPath();ctx.moveTo(...a2);ctx.lineTo(...b2);ctx.lineTo(...c2);ctx.lineTo(...d2);ctx.fill()}
for(let y=-32;y<=32;y+=20){let a=iso(-52,y),b=iso(52,y),c=iso(52,y+8),d=iso(-52,y+8);ctx.fillStyle='#555';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.lineTo(...d);ctx.fill();}
// casas dentro dos terrenos
for(let x=-32;x<=28;x+=20)for(let y=-22;y<=18;y+=20){const a=iso(x,y,0),b=iso(x+12,y,0),c=iso(x+12,y+10,0),d=iso(x,y+10,0),h=10;ctx.fillStyle='#eee2c8';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.lineTo(...d);ctx.closePath();ctx.fill();const r1=iso(x,y,h),r2=iso(x+12,y,h),r3=iso(x+12,y+10,h),r4=iso(x,y+10,h);ctx.fillStyle='#d5b58b';ctx.beginPath();ctx.moveTo(...r1);ctx.lineTo(...r2);ctx.lineTo(...r3);ctx.lineTo(...r4);ctx.closePath();ctx.fill();ctx.strokeStyle='#b48f68';ctx.stroke()}
const t=(performance.now()-start)/1000;people.forEach(p=>{if(!paused){p.y+=p.dir*p.speed*.012;if(p.y>35)p.y=-35;if(p.y<-35)p.y=35}human(p,t)});requestAnimationFrame(draw)}
let start=performance.now();addEventListener('wheel',e=>{zoom=Math.max(.55,Math.min(3,zoom*(e.deltaY<0?1.12:.89)));e.preventDefault()},{passive:false});addEventListener('keydown',e=>{if(e.code==='Space')paused=!paused});draw();
})();