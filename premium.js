const THREE = window.THREE;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const motionButton = document.querySelector('#motion');
const hero = document.querySelector('.hero');
const canvas = document.querySelector('#quality-scene');
const halo = document.querySelector('.cursor-halo');
const progress = document.querySelector('.scroll-progress');
let enabled = !document.body.classList.contains('no-motion');

// Keep the reference's restrained cursor treatment and a subtle reading indicator.
if (!coarse && !reduced) {
  document.addEventListener('pointermove', event => {
    if (!enabled) return;
    halo.style.left = `${event.clientX}px`;
    halo.style.top = `${event.clientY}px`;
    halo.classList.add('active');
  }, {passive:true});
  document.addEventListener('pointerleave', () => halo.classList.remove('active'));
}
let scrollPending = false;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${distance > 0 ? scrollY / distance * 100 : 0}%`;
  scrollPending = false;
}
document.addEventListener('scroll', () => {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); }
}, {passive:true});
updateProgress();

if (window.gsap && !reduced) {
  gsap.registerPlugin(ScrollTrigger);
  const signature = gsap.timeline({defaults:{ease:'power4.out'}});
  signature.fromTo('.hero-name-first',{y:125,opacity:0,skewY:5},{y:0,opacity:1,skewY:0,duration:1.35},.12)
    .fromTo('.hero-name-last',{y:110,opacity:0,skewY:-5},{y:0,opacity:1,skewY:0,duration:1.45},.29)
    .fromTo('.hero-statement',{y:25,opacity:0,letterSpacing:'.42em'},{y:0,opacity:1,letterSpacing:'.25em',duration:1.1},.86);
  gsap.fromTo('.art-code', {x:90,y:30,opacity:0}, {x:0,y:0,opacity:1,duration:1.25,delay:.25,ease:'power3.out'});
  gsap.fromTo('.art-screen', {x:110,y:45,opacity:0}, {x:0,y:0,opacity:1,duration:1.3,delay:.45,ease:'power3.out'});
  gsap.fromTo('.art-card,.art-tag', {y:35,opacity:0}, {y:0,opacity:1,duration:.85,delay:.8,stagger:.1,ease:'power2.out'});
  gsap.to('.hero-art', {y:85,rotation:1,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
  gsap.utils.toArray('.section-head h2,.about-grid h2,.contact h2').forEach(el => {
    gsap.fromTo(el,{y:55,opacity:0},{y:0,opacity:1,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
  });
  gsap.utils.toArray('.big-stats strong').forEach(el => {
    gsap.fromTo(el,{y:28,opacity:0},{y:0,opacity:1,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
  });
  gsap.fromTo('.case-feature img',{y:55,scale:.94,opacity:.55},{y:0,scale:1,opacity:1,ease:'power2.out',scrollTrigger:{trigger:'.case-feature',start:'top 85%',end:'bottom 55%',scrub:1}});
  gsap.utils.toArray('.case-story,.case-facts > div,.case-outcome').forEach(el=>{
    gsap.fromTo(el,{y:45,opacity:0},{y:0,opacity:1,duration:.95,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
  });
  if (!coarse) {
    const layers=[
      {el:document.querySelector('.hero-name'),factor:.18},
      {el:document.querySelector('.art-code'),factor:-.55},
      {el:document.querySelector('.art-screen'),factor:.7},
      {el:document.querySelector('.art-card'),factor:1.15},
      {el:document.querySelector('.art-tag'),factor:-.8}
    ].filter(item=>item.el).map(item=>({...item,x:gsap.quickTo(item.el,'x',{duration:.7,ease:'power3.out'}),y:gsap.quickTo(item.el,'y',{duration:.7,ease:'power3.out'})}));
    hero.addEventListener('pointermove',event=>{
      if(!enabled)return;
      const rect=hero.getBoundingClientRect();
      const dx=(event.clientX-rect.left)/rect.width-.5;
      const dy=(event.clientY-rect.top)/rect.height-.5;
      layers.forEach(layer=>{layer.x(dx*55*layer.factor);layer.y(dy*42*layer.factor)});
    },{passive:true});
    hero.addEventListener('pointerleave',()=>layers.forEach(layer=>{layer.x(0);layer.y(0)}));
  }
}

// A small WebGL sculpture gives the hero genuine depth without making it a loading dependency.
if (!reduced) {
  try {
    const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35,1,.1,100);
    camera.position.z = 9;
    scene.add(new THREE.AmbientLight(0xdaf1db,1.4));
    const key = new THREE.PointLight(0xe9f4d0,75); key.position.set(-3,4,5); scene.add(key);
    const warm = new THREE.PointLight(0xc6714f,38); warm.position.set(3,-2,4); scene.add(warm);
    const group = new THREE.Group(); scene.add(group);
    const surface = new THREE.MeshPhysicalMaterial({color:0xa5c3a7,metalness:.66,roughness:.18,clearcoat:1,clearcoatRoughness:.11});
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.45,.34,160,16,2,3),surface);
    knot.rotation.set(.3,.45,-.25); group.add(knot);
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.72,1),new THREE.MeshPhysicalMaterial({color:0xc77655,metalness:.45,roughness:.22,flatShading:true}));
    inner.position.set(.55,-.15,.2); group.add(inner);
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.85,1)),new THREE.LineBasicMaterial({color:0xc8e3c4,transparent:true,opacity:.35}));
    group.add(outline);
    const host = canvas.parentElement;
    function resize() {
      const {width,height}=host.getBoundingClientRect();
      renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
      group.scale.setScalar(innerWidth<650?.7:1);
    }
    resize();addEventListener('resize',resize,{passive:true});
    let pointerX=0,pointerY=0,frame=0,visible=true;
    hero.addEventListener('pointermove',event=>{
      const r=hero.getBoundingClientRect();pointerX=((event.clientX-r.left)/r.width-.5)*.32;pointerY=((event.clientY-r.top)/r.height-.5)*.25;
    },{passive:true});
    const clock=new THREE.Clock();
    function draw(){
      frame=requestAnimationFrame(draw);
      const t=clock.getElapsedTime();knot.rotation.y=t*.16;inner.rotation.y=-t*.22;outline.rotation.y=-t*.07;group.rotation.x+=(pointerY-group.rotation.x)*.025;group.rotation.y+=(pointerX-group.rotation.y)*.025;
      renderer.render(scene,camera);
    }
    const visibility=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(visible&&enabled&&!frame) draw();
      if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}
    },{threshold:0});visibility.observe(hero);
    motionButton.addEventListener('click',()=>{
      enabled=!document.body.classList.contains('no-motion');
      halo.classList.toggle('active',enabled&&!coarse);
      if(!enabled&&frame){cancelAnimationFrame(frame);frame=0;renderer.render(scene,camera);}
      if(enabled&&visible&&!frame)draw();
    });
  } catch(error) {
    if (!window.startPortfolioFallback?.(canvas,hero,motionButton)) canvas.hidden=true;
  }
} else canvas.hidden=true;
