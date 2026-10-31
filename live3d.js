/* ================== LIVE 3D WALKTHROUGH ==================
   The floor is rebuilt in 3D from the brochure's typical floor plan:
   the plan render is the floor, walls/doors/windows are traced from it (in % of the image),
   furniture is raised as blocks whose tops show the plan render. Flat B mirrors Flat A. */
(function(){
const PW=21.3, PH=18.9;               // plan image in metres (from room dimensions)
const WALL_H=3.0, EYE=1.5;
const X=x=>(x-50)/100*PW, Z=y=>(y-50)/100*PH;

// [type, x1,y1, x2,y2, thickness?]  types: w wall · win window · gd glass door · d door (lintel) · low parapet
const WALLS_A=[
 ['low',4,3.8,23.2,3.8],
 ['w',4,9,7,9,.22],['gd',7,9,19,9],['w',19,9,23.2,9,.22],
 ['w',23.2,3.8,31.2,3.8,.22],
 ['w',31.2,2.8,33,2.8,.22],['win',33,2.8,47,2.8],['w',47,2.8,49.6,2.8,.22],
 ['w',4.3,9,4.3,14,.22],['win',4.3,14,4.3,28],['w',4.3,28,4.3,35,.22],
 ['w',2.6,35,2.6,38,.22],['win',2.6,38,2.6,52],['w',2.6,52,2.6,56.5,.22],
 ['win',2.6,56.5,2.6,61.5],['w',2.6,61.5,2.6,68,.22],['win',2.6,68,2.6,84],['w',2.6,84,2.6,92.5,.22],
 ['w',2.6,92.5,5,92.5,.22],['win',5,92.5,12,92.5],['w',12,92.5,21.3,92.5,.22],
 ['w',21.3,83.5,24,83.5],['gd',24,83.5,38,83.5],['w',38,83.5,40.4,83.5],
 ['low',21.3,95.5,40.4,95.5],['low',21.3,92.5,21.3,95.5],
 ['w',40.4,49.5,40.4,51.5,.2],['d',40.4,51.5,40.4,56.5],['w',40.4,56.5,40.4,95.5,.2],
 // interior
 ['w',23.2,3.8,23.2,19],['d',23.2,19,23.2,23],['w',23.2,23,23.2,29.5],['d',23.2,29.5,23.2,34.5],
 ['w',23.2,16.5,31.2,16.5],['w',23.2,30,31.2,30],
 ['w',31.2,3.8,31.2,8],['d',31.2,8,31.2,12],['w',31.2,12,31.2,30.5],
 ['w',31.2,30.5,32,30.5],['d',32,30.5,35.5,30.5],['w',35.5,30.5,49.6,30.5],
 ['w',4.3,34.5,23.2,34.5],
 ['w',9.8,35,9.8,47],['d',9.8,47,9.8,53],
 ['w',2.6,55,15.5,55],['w',15.5,55,15.5,58.5],['d',15.5,58.5,15.5,62.5],['w',15.5,62.5,15.5,63.5],
 ['w',2.6,63.5,21.3,63.5],['d',21.3,63.5,21.3,68],['w',21.3,68,21.3,92.5],
];
const WALLS_SHARED=[
 ['w',49.6,2.8,49.6,38,.2],['w',50.4,2.8,50.4,38,.2],
 ['w',40.4,38,59.6,38,.2],['w',40.4,49.5,59.6,49.5,.2],['w',40.4,38,40.4,49.5,.2],['w',59.6,38,59.6,49.5,.2],['w',50,38,50,49.5,.2],
 ['w',40.4,30.5,40.4,38,.2],['w',59.6,30.5,59.6,38,.2],
];
// furniture [x0,y0,x1,y1,height]
const FURN_A=[
 [5.5,16,14,28,.5],[4.6,9.6,6.6,15,.75],[20,9.6,22.8,16,.8],[4.4,32.4,15,34.4,2.1],      // master bedroom
 [38.5,10,48,22,.5],[45,4,49.2,10.5,.75],[38,26.6,49.2,30.2,2.1],                         // bedroom 2
 [32,44,39.5,48,.75],[32.4,42,39,43.8,.45],[32.4,48.2,39,50,.45],                          // dining
 [10,35.2,25,38.4,.9],[10,38.4,14.6,47,.9],[10,51.4,17,54.6,.9],[17.2,50.6,22.4,54.4,1.8],  // kitchen
 [30.6,64.6,34.6,67.6,.8],[36.2,66.4,39.8,80,.8],[29.6,79,33.6,82.4,.8],[31,72,35,76,.4],[21.5,68.4,23.2,78,.6], // drawing
 [4.6,71,15.6,81,.5],[5,68,8,71,.55],[5,80,8,83,.55],[12,88,21,92,2.1],                   // bedroom 3
 [25,85,29,89,.8],                                                                          // balcony chair
];
const VIEWS={
 living:{p:[39,57],t:[24,41],cap:'Living / Dining'},
 drawing:{p:[23.6,65],t:[37.5,80],cap:'Drawing room'},
 balcony:{p:[31,80.5],t:[31,97],cap:'Balcony'},
 kitchen:{p:[27,47],t:[11,40],cap:'Kitchen'},
 bed1:{p:[21.6,31.5],t:[8,14],cap:'Master bedroom'},
 bed2:{p:[33,28],t:[45,7],cap:'Bedroom 2'},
 toilets:{p:[18.5,21],t:[29,21],cap:'Attached toilet'},
 bed3:{p:[19.4,66],t:[6,86],cap:'Bedroom 3'},
 toilet3:{p:[19.5,60.5],t:[6,58.5],cap:'Common toilet'},
};
const HUB=[30,50];

let T, renderer, scene, cam, ceiling, ready=false, running=false, loading=null;
let side='A', cur=null, mode='walk';
const st={pos:null,tgt:null,yaw:0,pitch:0,fly:null,drag:null,t0:performance.now()};

function loadThree(){
  if(loading) return loading;
  loading=new Promise((res,rej)=>{const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
  return loading;
}
const mx=(x,sd)=>sd==='A'?x:100-x;

function build(TEX){
  T=window.THREE;
  const canvas=document.getElementById('liveCanvas');
  renderer=new T.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputEncoding=T.sRGBEncoding;
  renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=.92;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
  scene=new T.Scene();
  cam=new T.PerspectiveCamera(68,1,.05,300);

  // dusk sky
  const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#1f3560');gr.addColorStop(.3,'#5d6f9a');gr.addColorStop(.45,'#d9937a');gr.addColorStop(.5,'#f5b77f');gr.addColorStop(.505,'#4b4136');gr.addColorStop(1,'#1c1915');
  g.fillStyle=gr;g.fillRect(0,0,16,256);
  const skyT=new T.CanvasTexture(c);skyT.encoding=T.sRGBEncoding;
  scene.add(new T.Mesh(new T.SphereGeometry(120,32,16),new T.MeshBasicMaterial({map:skyT,side:T.BackSide,fog:false})));
  const ground=new T.Mesh(new T.PlaneGeometry(400,400),new T.MeshLambertMaterial({color:0x221e1b}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-3.2;scene.add(ground);

  // lights
  scene.add(new T.HemisphereLight(0xfff1e0,0x5e4d42,.5));
  scene.add(new T.AmbientLight(0xffffff,.08));
  const sun=new T.DirectionalLight(0xffd9b0,.62);sun.position.set(-9,22,12);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:1,far:60});
  sun.shadow.bias=-.0006;scene.add(sun);
  [[14,45],[31,48],[30,72],[12,20],[40,16],[11,77]].forEach(([x,y])=>['A','B'].forEach(sd=>{
    const l=new T.PointLight(0xffc98f,.32,8,2);l.position.set(X(mx(x,sd)),2.7,Z(y));scene.add(l);}));

  // floor = brochure plan render
  const tex=TEX;
  tex.encoding=T.sRGBEncoding;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const floorMat=new T.MeshStandardMaterial({map:tex,roughness:.82,metalness:0});
  const floor=new T.Mesh(new T.PlaneGeometry(PW,PH),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const slab=new T.Mesh(new T.BoxGeometry(PW+.6,.3,PH+.6),new T.MeshStandardMaterial({color:0x5a4e48}));slab.position.y=-.16;scene.add(slab);

  // ceiling (only seen from inside)
  ceiling=new T.Mesh(new T.PlaneGeometry(PW,PH),new T.MeshStandardMaterial({color:0xece4da,roughness:1}));
  ceiling.rotation.x=Math.PI/2;ceiling.position.y=WALL_H;scene.add(ceiling);
  // cove light strip feel: a slightly darker ceiling border is skipped for simplicity

  const wallMat=new T.MeshStandardMaterial({color:0xe4d9cc,roughness:.92});
  const capMat=new T.MeshStandardMaterial({color:0x3b3532,roughness:.9});
  const glassMat=new T.MeshPhysicalMaterial({color:0xbfd6e6,roughness:.05,metalness:0,transparent:true,opacity:.18,side:T.DoubleSide});
  const frameMat=new T.MeshStandardMaterial({color:0x2a2a2c,roughness:.5});
  const woodMat=new T.MeshStandardMaterial({color:0x9a6b43,roughness:.7});

  function box(x1,y1,x2,y2,h0,h1,th,mat,shadow=true){
    const vert=Math.abs(x2-x1)<Math.abs(y2-y1);
    const a=vert?Z(Math.min(y1,y2)):X(Math.min(x1,x2)), b=vert?Z(Math.max(y1,y2)):X(Math.max(x1,x2));
    const len=b-a+(th*0.6); if(len<=0) return;
    const geo=new T.BoxGeometry(vert?th:len,h1-h0,vert?len:th);
    const m=new T.Mesh(geo,mat);
    m.position.set(vert?X(x1):(a+b)/2,(h0+h1)/2,vert?(a+b)/2:Z(y1));
    m.castShadow=shadow;m.receiveShadow=true;scene.add(m);return m;
  }
  function wallSet(list,sd){
    list.forEach(([t,x1,y1,x2,y2,th])=>{
      x1=mx(x1,sd);x2=mx(x2,sd);th=th||.13;
      if(t==='w') box(x1,y1,x2,y2,0,WALL_H,th,wallMat);
      if(t==='low'){box(x1,y1,x2,y2,0,1.0,.12,wallMat);box(x1,y1,x2,y2,1.0,1.05,.16,capMat)}
      if(t==='d') box(x1,y1,x2,y2,2.15,WALL_H,th,wallMat);
      if(t==='win'){box(x1,y1,x2,y2,0,.9,.22,wallMat);box(x1,y1,x2,y2,2.2,WALL_H,.22,wallMat);
        box(x1,y1,x2,y2,.9,2.2,.03,glassMat,false);box(x1,y1,x2,y2,.88,.92,.08,frameMat);box(x1,y1,x2,y2,2.18,2.22,.08,frameMat)}
      if(t==='gd'){box(x1,y1,x2,y2,2.4,WALL_H,.22,wallMat);box(x1,y1,x2,y2,0,2.4,.03,glassMat,false);
        box(x1,y1,x2,y2,2.37,2.42,.08,frameMat);box(x1,y1,x2,y2,0,.04,.08,frameMat)}
    });
  }
  // furniture blocks: tops (and sides) take the plan render via planar UVs
  const cv=document.createElement('canvas'),img=tex.image;cv.width=img.width/4|0;cv.height=img.height/4|0;
  const cx2=cv.getContext('2d');cx2.drawImage(img,0,0,cv.width,cv.height);const px=cx2.getImageData(0,0,cv.width,cv.height).data;
  function avgColor(x0,y0,x1,y1){let r=0,g=0,b=0,n=0;const W=cv.width,H=cv.height;
    for(let y=Math.floor(y0/100*H);y<Math.ceil(y1/100*H);y++)for(let x=Math.floor(x0/100*W);x<Math.ceil(x1/100*W);x++){const i=(y*W+x)*4;r+=px[i];g+=px[i+1];b+=px[i+2];n++}
    return new T.Color().setRGB(r/n/255,g/n/255,b/n/255).convertSRGBToLinear();}
  function furn(list,sd){
    list.forEach(([x0,y0,x1,y1,h])=>{
      const a=mx(x0,sd),b=mx(x1,sd); const xa=Math.min(a,b),xb=Math.max(a,b);
      const w=X(xb)-X(xa),d=Z(y1)-Z(y0); if(w<=0||d<=0)return;
      const geo=new T.BoxGeometry(w,h,d);
      const cx=(X(xa)+X(xb))/2,cz=(Z(y0)+Z(y1))/2;
      const pos=geo.attributes.position,uv=geo.attributes.uv;
      for(let i=0;i<pos.count;i++){const wx=pos.getX(i)*0.985+cx,wz=pos.getZ(i)*0.985+cz;uv.setXY(i,(wx+PW/2)/PW,1-(wz+PH/2)/PH)}
      const col=avgColor(xa,y0,xb,y1); const side=new T.MeshStandardMaterial({color:col.multiplyScalar(h>1.5?.92:.8),roughness:.75});
      const m=new T.Mesh(geo,[side,side,floorMat,side,side,side]);
      m.position.set(cx,h/2+.005,cz);m.castShadow=true;m.receiveShadow=true;scene.add(m);
    });
  }
  wallSet(WALLS_A,'A');wallSet(WALLS_A,'B');wallSet(WALLS_SHARED,'A');
  furn(FURN_A,'A');furn(FURN_A,'B');
  // stair flight in the common core
  for(let i=0;i<10;i++){const s=new T.Mesh(new T.BoxGeometry(X(56)-X(48.5),.17*(i+1),Z(66)-Z(64.6)),woodMat);
    s.position.set((X(48.5)+X(56))/2,.085*(i+1),Z(80-i*1.5));s.castShadow=s.receiveShadow=true;scene.add(s);}

  const ro=new ResizeObserver(resize);ro.observe(document.getElementById('liveStage'));resize();
  bindInput();
  ready=true;
}
let needsFrame=true;
function resize(){
  if(!renderer)return;const el=document.getElementById('liveStage');const w=el.clientWidth,h=el.clientHeight;
  renderer.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<1?82:66;cam.updateProjectionMatrix();needsFrame=true;
}
const v3=(x,y,h)=>new T.Vector3(X(mx(x,side)),h,Z(y));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function bez(a,c,b,t){const u=1-t;return a.clone().multiplyScalar(u*u).add(c.clone().multiplyScalar(2*u*t)).add(b.clone().multiplyScalar(t*t))}

function flyTo(pos,tgt,dur,ctrl){
  const sp=cam.position.clone(),stt=st.tgt?st.tgt.clone():tgt.clone();
  const cp=ctrl||sp.clone().lerp(pos,.5);
  st.fly={sp,stt,pos,tgt,cp,dur,t0:performance.now()};
  const y0=st.yaw,p0=st.pitch;st.relax={y0,p0};
  needsFrame=true;
}
function viewFor(id){const v=VIEWS[id];return {pos:v3(v.p[0],v.p[1],EYE),tgt:v3(v.t[0],v.t[1],1.25)}}

function goRoom(id,first){
  const v=viewFor(id);mode='walk';setModeBtns();
  const cap=document.getElementById('liveCap');cap.classList.remove('on');
  if(first){ // start above the flat looking straight down (matches the plan), then descend inside
    const c=v3(25,50,0);cam.position.set(c.x,22,c.z+6);st.tgt=new T.Vector3(c.x,0,c.z);st.pos=cam.position.clone();
    flyTo(v.pos,v.tgt,3200,new T.Vector3(v.pos.x*.6+c.x*.4,9,v.pos.z*.6+c.z*.4));
  } else {
    const far=cur&&cur!==id;
    const hub=v3(HUB[0],HUB[1],EYE+.5);
    flyTo(v.pos,v.tgt,far?2600:1400,far?hub:null);
  }
  const delay=first?3000:(cur&&cur!==id?2300:1200);
  cur=id;
  const r=VIEWS[id],room=window.__ROOMS.find(x=>x.id===id);
  setTimeout(()=>{if(cur!==id||mode!=='walk')return;
    document.getElementById('liveCapTitle').textContent=({living:'Living & dining',bed1:'The master bedroom',bed2:'Bedroom two',bed3:'Bedroom three',drawing:'The drawing room',kitchen:'The kitchen',balcony:'The balcony',toilets:'The attached toilet',toilet3:'The common toilet'})[id];
    document.getElementById('liveCapSub').textContent=room?room.size:'';cap.classList.add('on')},delay);
}
function dollhouse(){
  mode='doll';setModeBtns();document.getElementById('liveCap').classList.remove('on');
  const c=v3(25,52,0);
  flyTo(new T.Vector3(c.x+(side==='A'?-4:4),14,c.z+15),new T.Vector3(c.x,0,c.z-1),2400,new T.Vector3(c.x,9,c.z+6));
}
function setModeBtns(){document.querySelectorAll('#liveModes button').forEach(b=>b.classList.toggle('on',b.dataset.mode===mode))}

function bindInput(){
  const el=document.getElementById('liveStage');
  el.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;st.drag={x:e.clientX,y:e.clientY,yaw:st.yaw,pitch:st.pitch};el.setPointerCapture(e.pointerId);
    document.getElementById('liveHint').style.opacity=0});
  el.addEventListener('pointermove',e=>{if(!st.drag)return;
    st.yaw=st.drag.yaw-(e.clientX-st.drag.x)*.0042;st.pitch=Math.max(-.6,Math.min(.6,st.drag.pitch-(e.clientY-st.drag.y)*.0035));needsFrame=true});
  const up=()=>{st.drag=null};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  document.querySelectorAll('#liveModes button').forEach(b=>b.onclick=()=>{b.dataset.mode==='doll'?dollhouse():goRoom(cur||'living')});
}

function frame(now){
  if(!running)return;requestAnimationFrame(frame);
  if(st.fly){
    const f=st.fly;let t=Math.min(1,(now-f.t0)/f.dur);const e=ease(t);
    cam.position.copy(bez(f.sp,f.cp,f.pos,e));st.tgt=f.stt.clone().lerp(f.tgt,ease(Math.min(1,t*1.15)));
    st.yaw=st.relax.y0*(1-e);st.pitch=st.relax.p0*(1-e);
    if(t>=1)st.fly=null;
  }
  // gentle idle sway so the view feels alive
  const sway=(!st.fly&&!st.drag&&mode==='walk')?Math.sin((now-st.t0)/2600)*.035:0;
  const dir=st.tgt.clone().sub(cam.position);const len=dir.length();
  const yaw=Math.atan2(dir.x,dir.z)+st.yaw+sway;const pitch=Math.asin(Math.max(-.999,Math.min(.999,dir.y/len)))+st.pitch;
  const look=cam.position.clone().add(new T.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)));
  cam.lookAt(look);
  ceiling.visible=cam.position.y<WALL_H-.1;
  renderer.render(scene,cam);
}

window.openLive=async function(id){
  const S=window.__STATE;side=S.flat||'A';
  const first=S.view!=='live';
  S.view='live';S.room=id;
  if(first){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id==='liveView'));}
  window.__renderLivePanel(id);
  const lbl=document.getElementById('liveLabel');lbl.textContent=`Level ${S.level} · Flat ${S.level*100+(side==='A'?1:2)} · Live 3D`;
  try{
    if(!ready){document.getElementById('liveLoading').style.opacity=1;await loadThree();
      const tex=await new Promise((res,rej)=>new window.THREE.TextureLoader().load('img/typical3d.webp',res,undefined,rej));build(tex);}
    document.getElementById('liveLoading').style.opacity=0;
    if(!running){running=true;requestAnimationFrame(frame);}
    goRoom(id,first);
  }catch(err){
    document.getElementById('liveLoading').textContent='3D view could not load on this device';
    setTimeout(()=>{window.stopLive();document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id==='floorView'));S.view='flat';window.__openRoomPlan(id)},1400);
  }
};
window.switchLiveFlat=function(sd){
  if(!ready)return; side=sd; cur=null; const S=window.__STATE;
  document.getElementById('liveLabel').textContent=`Level ${S.level} · Flat ${S.level*100+(side==='A'?1:2)} · Live 3D`;
  window.__renderLivePanel('living'); S.room='living';
  const v=viewFor('living'); mode='walk'; setModeBtns(); document.getElementById('liveCap').classList.remove('on');
  flyTo(v.pos,v.tgt,3000,new T.Vector3(0,9,v.pos.z+4)); cur='living';
  setTimeout(()=>{if(cur!=='living'||mode!=='walk')return;document.getElementById('liveCapTitle').textContent='Living & dining';
    document.getElementById('liveCapSub').textContent=window.__ROOMS.find(x=>x.id==='living').size;document.getElementById('liveCap').classList.add('on')},2800);
};
window.stopLive=function(){running=false;cur=null;const c=document.getElementById('liveCap');c&&c.classList.remove('on')};
window.liveMode=m=>m==='doll'?dollhouse():goRoom(cur||'living');
})();
