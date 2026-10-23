import {conjugate,sphericalRefraction,lensMaker,twoLens,validateLens,sag} from './physics.js';
export const defaults={
  mirrors:{type:'concave',u:.30,f:.10,h:.04,aperture:.055},
  refraction:{type:'convex',u:.40,R:.10,h:.025,n1:1,n2:1.5,aperture:.055,rayHeight:.035},
  formation:{type:'convex',u:.30,f:.10,h:.04,aperture:.045,nLens:1.5,nMedium:1,thickness:.025},
  focal:{type:'convex',u:.30,f:.10,h:.03,aperture:.035,nLens:1.5,nMedium:1,thickness:.018,objectX:-.30,lensX:0,screenX:.22,trials:[]},
  maker:{shape:'biconvex',R1:.20,R2:-.20,nLens:1.5,nMedium:1,thickness:.025,aperture:.045,u:.50,h:.025},
  two:{f1:.10,f2:.10,u:.30,d:.35,h:.035,aperture:.04,nLens:1.5,nMedium:1,thickness:.02}
};
export const state={lab:'mirrors',experiment:'formation',view:'2d',theme:'dark',colorblind:false,rayCount:9,zoom:1,options:{rays:true,bundle:false,virtual:true,axis:true,foci:true,labels:true,normals:false,angles:true,images:true,measure:true},params:structuredClone(defaults),challenge:null};
export function currentKey(){return state.lab==='lenses'?state.experiment:state.lab;}
export function params(){return state.params[currentKey()];}
export function lensGeometry(p,key=currentKey()) {
  if(key==='maker') return {R1:p.R1,R2:p.R2,thickness:p.thickness,aperture:p.aperture,nLens:p.nLens,nMedium:p.nMedium};
  const sign=p.type==='concave'?-1:1,ratio=p.nLens/p.nMedium-1,R=2*Math.abs(p.f)*Math.abs(ratio)*sign;
  return {R1:R,R2:-R,thickness:p.thickness,aperture:p.aperture,nLens:p.nLens,nMedium:p.nMedium};
}
export function compute(){
  const p=params(),key=currentKey(); let f=p.f,result,system,maker,geometry;
  if(key==='mirrors') { f=Math.abs(p.f)*(p.type==='concave'?1:-1); result=conjugate(f,p.u,p.h); }
  else if(key==='refraction'){ result=sphericalRefraction(p.n1,p.n2,p.R,p.u,p.h); }
  else if(key==='two'){system=twoLens(p.f1,p.f2,p.u,p.d,p.h);result=system.final;f=p.f1;}
  else {if(key==='focal')p.u=p.lensX-p.objectX; geometry=lensGeometry(p,key);maker=lensMaker(geometry.nLens,geometry.nMedium,geometry.R1,geometry.R2); f=maker.f;result=conjugate(f,p.u,p.h);}
  let geometryValid=geometry?validateLens(geometry):{valid:true};
  if(key==='two')for(const fi of [p.f1,p.f2]){const check=validateLens(lensGeometry({...p,type:'convex',f:fi},'two'));if(!check.valid)geometryValid=check;}
  if(geometry&&geometryValid.valid){const leftExtent=-geometry.thickness/2+Math.min(0,sag(geometry.R1,geometry.aperture));if(-p.u>=leftExtent-1e-6)geometryValid={valid:false,reason:'Move the object to the left of the full physical lens, or reduce thickness and aperture.'};}
  if(key==='focal'&&geometryValid.valid&&p.screenX-p.lensX<=p.thickness/2+1e-6)geometryValid={valid:false,reason:'Move the screen beyond the rear surface of the physical lens.'};
  if(key==='two'&&geometryValid.valid){if(p.d<=p.thickness+1e-6)geometryValid={valid:false,reason:'The physical lenses overlap. Increase separation or reduce thickness.'};else if(p.u<=p.thickness/2+1e-6)geometryValid={valid:false,reason:'The object lies inside the first physical lens. Increase its distance or reduce thickness.'};}
  if(key==='refraction'&&-p.u>=Math.min(0,sag(p.R,p.aperture))-1e-6)geometryValid={valid:false,reason:'Place the object to the left of the entire curved aperture, in the incident medium.'};
  return {p,key,f,result,system,maker,geometry,geometryValid};
}
export function reset(){state.params[currentKey()]=structuredClone(defaults[currentKey()]);state.zoom=1;state.challenge=null;}
export function preset(factor){ const p=params();const f=Math.abs(compute().f??p.R);p.u=Math.max(.01,Math.min(2,f*factor)); }
export function setShape(shape){const p=params();p.shape=shape;if(shape==='custom')return;const shapes={biconvex:[.2,-.2],biconcave:[-.2,.2],'plano-convex':[Infinity,-.2],'plano-concave':[Infinity,.2],'positive-meniscus':[.15,.3],'negative-meniscus':[.3,.15]};[p.R1,p.R2]=shapes[shape];p.thickness=shape==='biconvex'?.025:.035;}
