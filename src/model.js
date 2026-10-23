import {idealRay,surfacePoint,intersectSurface,reflect,sub,unit,add,mul,dot,traceInterface,traceLens,clamp} from './physics.js';
import {state,lensGeometry} from './state.js';
export function elementsFor(s) {
  const {key,p,f}=s;
  if(key==='mirrors')return [{kind:'mirror',vertex:0,R:-2*f,aperture:p.aperture}];
  if(key==='refraction')return [{kind:'interface',vertex:0,R:p.R,aperture:p.aperture,n1:p.n1,n2:p.n2}];
  if(key==='two')return [0,p.d].map((center,i)=>({kind:'lens',center,...lensGeometry({...p,type:'convex',f:i?p.f2:p.f1},'two')}));
  return [{kind:'lens',center:0,...s.geometry}];
}
export function constructionRays(s) {
  const {p,key,f}=s,mirror=key==='mirrors';
  const candidates=[{y:p.h,name:'Parallel ray'},{y:0,name:mirror?'Pole ray':'Central ray'}];
  if(key!=='refraction'&&Number.isFinite(f)&&Math.abs(p.u-f)>1e-8) candidates.push({y:-p.h*f/(p.u-f),name:'Focus ray'});
  if(mirror&&Math.abs(p.u-2*f)>1e-8)candidates.push({y:-2*p.h*f/(p.u-2*f),name:'Centre-of-curvature ray'});
  const rays=[];
  let all=[...candidates,{y:p.aperture*.65,name:'Additional construction'},{y:-p.aperture*.65,name:'Additional construction'}];
  if(key==='two'){
    const factor=1+p.d/p.u-p.d/p.f1;
    if(Math.abs(factor)>1e-9){
      const offset=p.d*p.h/p.u;
      all.push({y:offset/factor,name:'Ray through second optical centre'});
      // Intersect both clear-aperture intervals. Standard rays alone can miss a narrow overlap.
      const edges=[(-p.aperture+offset)/factor,(p.aperture+offset)/factor].sort((a,b)=>a-b),lo=Math.max(-p.aperture,edges[0]),hi=Math.min(p.aperture,edges[1]);
      if(hi-lo>4e-6)for(const fraction of [.25,.75])all.push({y:lo+(hi-lo)*fraction,name:'Additional system construction'});
    }
    const passes=y=>Math.abs(y*factor-p.d*p.h/p.u)<=p.aperture;
    all.sort((a,b)=>Number(passes(b.y))-Number(passes(a.y)));
  }
  for(const candidate of all) {
    if(!Number.isFinite(candidate.y)||Math.abs(candidate.y)>p.aperture||rays.some(r=>Math.abs(r.hit[1]-candidate.y)<1e-6))continue;
    let ray=idealRay(p.u,p.h,candidate.y,key==='refraction'?Infinity:key==='two'?p.f1:f,mirror);
    if(key==='refraction') { const slope=(p.n1/p.n2)*(candidate.y-p.h)/p.u-candidate.y*(p.n2-p.n1)/(p.n2*p.R);ray={a:[-p.u,p.h,0],hit:[0,candidate.y,0],direction:unit([1,slope,0])}; }
    rays.push({...ray,name:candidate.name}); if(rays.length===(mirror?4:3))break;
  }
  return rays;
}
/** Exact spatial bundles sample a disk on the first physical cap. */
export function physicalRays(s) {
  const {p,key}=s,els=elementsFor(s),first=els[0],origin=[-p.u,p.h,0];
  const density=state.options.bundle?state.rayCount:3;
  const targets=[{y:0,z:0}];
  for(let i=1;i<density;i++){const r=p.aperture*(state.options.bundle?.88:.58)*Math.sqrt(i/(density-1)),a=i*2.3999632297;targets.push({y:r*Math.cos(a),z:r*Math.sin(a)});}
  if(key==='refraction') targets[0]={y:clamp(p.rayHeight,-p.aperture*.98,p.aperture*.98),z:0};
  return targets.map(({y,z})=>{
    const target=first.kind==='lens'?surfacePoint(first.center-first.thickness/2,first.R1,y,z):surfacePoint(0,first.R,y,z);
    if(!target)return {status:'miss',segments:[]};const d=unit(sub(target,origin));
    if(key==='mirrors') {const hit=intersectSurface(origin,d,first);if(!hit)return{status:'miss',segments:[]};const normal=hit.normal[0]>0?mul(hit.normal,-1):hit.normal,segments=[{a:origin,b:hit.point,kind:'incident'}];if(dot(d,normal)>=0)return {status:'blocked',segments,events:[{hit}],terminal:true};const direction=reflect(d,normal),next=intersectSurface(hit.point,direction,first);if(next)segments.push({a:hit.point,b:next.point,kind:'reflected'});return {status:'reflected',segments,exitOrigin:next?.point||hit.point,exitDirection:direction,events:[{hit}],terminal:!!next};}
    if(key==='refraction') {const tr=traceInterface(origin,d,first,p.n1,p.n2);return {...tr,events:tr.hit?[tr]:[]};}
    let ray=traceLens(origin,d,first);
    if(key==='two'&&ray.status==='transmitted'&&!ray.terminal&&ray.exitDirection[0]>0) {const next=traceLens(ray.exitOrigin,ray.exitDirection,els[1]);if(next.status!=='miss'){const segmentKind=next.segments.map((seg,i)=>({...seg,kind:i===0?'transmitted':seg.kind}));ray={...next,segments:[...ray.segments,...segmentKind],events:[...(ray.events||[]),...(next.events||[])]};}}
    return ray;
  });
}
export function selectedSurfaceRay(s){return s.geometryValid.valid?physicalRays(s)[0]:null;}
export function markersFor(s){
  const {key,p,f,result,system}=s;const markers=[{x:-p.u,h:p.h,label:'Object',kind:'object',draggable:'object'}];
  if(key==='two'){
    if(system.first.kind==='finite')markers.push({x:system.first.v,h:system.first.hi,label:'Lens 1 alone',kind:'intermediate',virtual:!system.first.real});
    if(result.kind==='finite')markers.push({x:system.xFinal,h:result.hi,label:'Final image',kind:'image',virtual:!result.real});
  } else if(result.kind==='finite'){
    const x=key==='mirrors'?-result.v:result.v;
    if(Math.abs(x+p.u)<1e-8&&Math.abs(result.hi-p.h)<1e-8)markers[0].label=state.options.images?'Object / image':'Object';
    else markers.push({x,h:result.hi,label:'Image',kind:'image',virtual:!result.real});
  }
  return markers;
}
export function sceneBounds(s){
  const markers=markersFor(s),xs=markers.filter(m=>Math.abs(m.x)<3&&Math.abs(m.h)<.5).map(m=>m.x),p=s.p;
  if(s.key==='focal')xs.push(p.screenX-p.lensX);
  let lo=Math.min(-p.u,-.08,...xs),hi=Math.max(.10,s.key==='two'?p.d+.12:.08,...xs);
  if(s.key==='mirrors'){lo=Math.min(lo,-Math.abs(s.f)*2.3);hi=Math.max(hi,.12);}
  else if(s.key!=='refraction'&&Number.isFinite(s.f)){lo=Math.min(lo,-Math.abs(s.f)*2.15);hi=Math.max(hi,Math.abs(s.f)*2.15);}
  const pad=(hi-lo)*.13;lo-=pad;hi+=pad;
  const height=Math.max(p.aperture*3.8,...markers.filter(m=>Math.abs(m.h)<.5).map(m=>Math.abs(m.h)*3.2));
  const width=Math.max(hi-lo,height*1000/550)/state.zoom,center=(lo+hi)/2;
  return {lo:center-width/2,hi:center+width/2,width,height:width*.55,center};
}
