import * as THREE from './vendor/three.module.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = window.matchMedia('(max-width: 700px)').matches;
const motion = !reduced && !!window.gsap;
let smoother;

if (motion) {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  smoother = ScrollSmoother.create({wrapper:'#smooth-wrapper', content:'#smooth-content', smooth:small ? 0 : 1.25, smoothTouch:0, effects:false, normalizeScroll:false});
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    smoother.scrollTo(target, true, 'top 82px');
    history.replaceState(null, '', id);
  }));
  gsap.fromTo('.hero h1', {y:70, autoAlpha:0}, {y:0, autoAlpha:1, duration:1.3, ease:'power3.out', delay:.15});
  gsap.fromTo('.hero-bottom', {y:24, autoAlpha:0}, {y:0, autoAlpha:1, duration:1, delay:.45, ease:'power2.out'});
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el, {y:55, autoAlpha:0}, {y:0, autoAlpha:1, duration:.9, ease:'power2.out', scrollTrigger:{trigger:el,start:'top 88%',once:true}});
  });
  gsap.fromTo('.visual', {clipPath:'inset(8% 4% round 20px)'}, {clipPath:'inset(0% 0% round 0px)', ease:'none', scrollTrigger:{trigger:'.visual',start:'top 95%',end:'bottom 30%',scrub:1}});
  // The native scrollbar remains available; smooth movement is visual only.
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

const canvas = document.querySelector('#quality-scene');
const hero = document.querySelector('.hero');
const sceneHost = document.querySelector('.hero-scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
} catch (err) {
  canvas.hidden = true;
}
if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
  camera.position.set(0, 0, 11);
  scene.add(new THREE.AmbientLight(0xc8deff, 1.8));
  const key = new THREE.PointLight(0x64d6c4, 100); key.position.set(-4,3,5); scene.add(key);
  const fill = new THREE.PointLight(0x4b8fc6, 95); fill.position.set(4,-2,4); scene.add(fill);
  const group = new THREE.Group(); scene.add(group);
  const ring = new THREE.Mesh(new THREE.TorusKnotGeometry(1.45,.38,180,18,2,3), new THREE.MeshPhysicalMaterial({color:0x64d6c4,metalness:.65,roughness:.19,clearcoat:1,clearcoatRoughness:.12}));
  ring.position.x = -1.7; ring.rotation.set(.5,.3,-.25); group.add(ring);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,1), new THREE.MeshPhysicalMaterial({color:0x447fae,metalness:.35,roughness:.2,flatShading:true,transparent:true,opacity:.88}));
  core.position.set(2.1,-.35,-.45); group.add(core);
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.38,1)),new THREE.LineBasicMaterial({color:0x91c5dc,transparent:true,opacity:.65}));
  wire.position.copy(core.position);group.add(wire);
  const pointer = {x:0,y:0};
  hero.addEventListener('pointermove', e => {if(reduced || small)return;const r=hero.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width-.5)*.25;pointer.y=((e.clientY-r.top)/r.height-.5)*.2},{passive:true});
  const resize = () => {const w=sceneHost.clientWidth,h=sceneHost.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=small?14:11;camera.updateProjectionMatrix();group.scale.setScalar(small?.68:1)};
  resize();window.addEventListener('resize',resize,{passive:true});
  const clock = new THREE.Clock();
  let frame;
  function draw(){frame=requestAnimationFrame(draw);const t=clock.getElapsedTime();if(!reduced){ring.rotation.y=t*.18;ring.rotation.z=-.25+Math.sin(t*.4)*.1;core.rotation.y=-t*.13;core.rotation.x=t*.08;wire.rotation.copy(core.rotation);group.rotation.x+=(pointer.y-group.rotation.x)*.025;group.rotation.y+=(pointer.x-group.rotation.y)*.025;}renderer.render(scene,camera)}
  const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){clock.start();if(!frame)draw()}else{cancelAnimationFrame(frame);frame=undefined}},{threshold:0});observer.observe(hero);
  if (motion) gsap.to(group.position,{y:1.2,ease:'none',scrollTrigger:{trigger:hero,start:'top bottom',end:'bottom top',scrub:1}});
}
