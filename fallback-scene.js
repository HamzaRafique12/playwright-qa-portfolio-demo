// Software-rendered, depth-shaded hero sculpture for browsers without WebGL.
window.startPortfolioFallback = function startPortfolioFallback(canvas, hero, motionButton) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  canvas.hidden = false;
  let frame = 0, visible = true, enabled = !document.body.classList.contains('no-motion');
  let px = 0, py = 0, start = performance.now();
  const resize = () => {
    const r = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    render();
  };
  const rotate = (p, a, b) => {
    let [x,y,z]=p;
    const cy=Math.cos(a),sy=Math.sin(a),cx=Math.cos(b),sx=Math.sin(b);
    [x,z]=[x*cy+z*sy,z*cy-x*sy];
    return [x,y*cx-z*sx,y*sx+z*cx];
  };
  const project = (p,cx,cy,scale) => {
    const depth=5/(5-p[2]);
    return [cx+p[0]*scale*depth,cy+p[1]*scale*depth,depth];
  };
  function render() {
    const w=canvas.clientWidth,h=canvas.clientHeight;
    if(!w||!h)return;
    ctx.clearRect(0,0,w,h);
    const time=enabled?(performance.now()-start)/1000:0;
    const a=time*.25+px*.3,b=-.38+py*.3;
    const scale=Math.min(w,h)*.23,cx=w*.53,cy=h*.51;
    const segments=[];
    const count=170;
    for(let i=0;i<count;i++){
      const t=i/count*Math.PI*2, next=(i+1)/count*Math.PI*2;
      const knot=q=>{
        const radius=1.65+.43*Math.cos(3*q);
        return rotate([radius*Math.cos(2*q),radius*Math.sin(2*q),.43*Math.sin(3*q)],a,b);
      };
      const p=knot(t),q=knot(next);
      segments.push({p:project(p,cx,cy,scale),q:project(q,cx,cy,scale),z:(p[2]+q[2])/2});
    }
    segments.sort((u,v)=>u.z-v.z);
    for(const s of segments){
      const light=Math.max(0,Math.min(1,(s.z+2.2)/4.4));
      ctx.strokeStyle=`rgba(${Math.round(80+125*light)},${Math.round(122+107*light)},${Math.round(102+103*light)},${.65+light*.32})`;
      ctx.lineWidth=Math.max(5,scale*.18*(s.p[2]+s.q[2])/2);
      ctx.lineCap='round';ctx.beginPath();ctx.moveTo(s.p[0],s.p[1]);ctx.lineTo(s.q[0],s.q[1]);ctx.stroke();
    }
    // Faceted inner form with edges and a warm metallic fill.
    const verts=[[0,1.08,0],[.95,.18,.5],[.45,-.85,.7],[-.65,-.7,.55],[-1,.12,.35],[.1,.1,-.95]];
    const faces=[[0,1,2],[0,2,3],[0,3,4],[0,4,5],[0,5,1],[1,2,5],[2,3,5],[3,4,5]];
    const rot=verts.map(v=>rotate(v,a*.74+.5,-b*.65+.25));
    const polys=faces.map(f=>({f,z:f.reduce((n,i)=>n+rot[i][2],0)/3})).sort((u,v)=>u.z-v.z);
    for(const {f,z} of polys){
      const points=f.map(i=>project(rot[i],cx+scale*.12,cy,scale*.6));
      const shade=Math.max(0,Math.min(1,(z+1)/2));
      ctx.fillStyle=`rgb(${Math.round(122+89*shade)},${Math.round(72+49*shade)},${Math.round(58+36*shade)})`;
      ctx.strokeStyle='rgba(248,210,170,.4)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
      points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.stroke();
    }
  }
  function draw(){frame=0;render();if(enabled&&visible)frame=requestAnimationFrame(draw)}
  hero.addEventListener('pointermove', e=>{const r=hero.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5},{passive:true});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&enabled&&!frame)frame=requestAnimationFrame(draw);if(!visible&&frame){cancelAnimationFrame(frame);frame=0}},{threshold:0}).observe(hero);
  motionButton.addEventListener('click',()=>{enabled=!document.body.classList.contains('no-motion');if(enabled&&!frame){start=performance.now();frame=requestAnimationFrame(draw)}else if(!enabled&&frame){cancelAnimationFrame(frame);frame=0;render()}});
  addEventListener('resize',resize,{passive:true});resize();if(enabled)frame=requestAnimationFrame(draw);
  return true;
};
