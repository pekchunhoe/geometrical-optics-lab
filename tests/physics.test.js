import test from 'node:test';
import assert from 'node:assert/strict';
import {conjugate,sphericalRefraction,lensMaker,twoLens,reflect,refract,intersectSurface,surfacePoint,validateLens,traceLens,screenSpot,idealRay,unit,dot,sub,add,mul,length} from '../src/physics.js';
import {state,defaults,compute,lensGeometry} from '../src/state.js';
import {constructionRays,physicalRays} from '../src/model.js';
const close=(actual,expected,tol=1e-9)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<=tol,`${actual} differs from ${expected} by more than ${tol}`);
const closeVec=(a,b,t=1e-9)=>a.forEach((v,i)=>close(v,b[i],t));
for(const [name,f,u,v,m,real,orientation,size] of [
  ['concave mirror beyond C',.1,.3,.15,-.5,true,'inverted','diminished'],
  ['concave mirror inside F',.1,.05,-.1,2,false,'upright','enlarged'],
  ['convex mirror',-.1,.2,-.2/3,1/3,false,'upright','diminished'],
  ['concave mirror at C',.1,.2,.2,-1,true,'inverted','same size'],
  ['concave mirror between F and C',.1,.15,.3,-2,true,'inverted','enlarged'],
  ['convex lens',.1,.3,.15,-.5,true,'inverted','diminished'],
  ['concave lens',-.1,.2,-.2/3,1/3,false,'upright','diminished'],
  ['convex lens inside focus',.1,.075,-.3,4,false,'upright','enlarged']
])test(name,()=>{const r=conjugate(f,u,.04);assert.equal(r.kind,'finite');close(r.v,v);close(r.m,m);close(r.hi,.04*m);assert.equal(r.real,real);assert.equal(r.orientation,orientation);assert.equal(r.size,size);});
test('object at focus is an explicit infinity state',()=>{const r=conjugate(.1,.1);assert.equal(r.kind,'infinity');assert.equal(r.v,null);assert.equal(r.m,null);assert.equal(r.hi,null);});
test('nearly focal state stays numerically finite away from tolerance',()=>{const r=conjugate(.1,.100001);assert.equal(r.kind,'finite');assert.ok(r.v>1000);});
test('zero optical power is a valid unmagnified virtual image',()=>{const r=conjugate(Infinity,.4);close(r.v,-.4);close(r.m,1);});
for(const [f,u]of [[0,.1],[.1,0],[.1,-.1],[NaN,.1],[.1,NaN]])test(`invalid conjugate f=${f}, u=${u}`,()=>assert.equal(conjugate(f,u).kind,'invalid'));
test('spherical refraction supplied numerical case',()=>{const r=sphericalRefraction(1,1.5,.1,.4);close(r.v,.6);close(r.m,-1);});
test('negative radius into higher index gives virtual image',()=>{const r=sphericalRefraction(1,1.5,-.1,.4);close(r.v,-.2);close(r.m,1/3);});
test('equal indices do not create optical power or magnification',()=>{const r=sphericalRefraction(1.5,1.5,.1,.4);close(r.v,-.4);close(r.m,1);assert.ok(r.zeroPower);});
test('refraction focal boundary',()=>assert.equal(sphericalRefraction(1,1.5,.1,.2).kind,'infinity'));
test('refraction planar limit',()=>{const r=sphericalRefraction(1,1.5,Infinity,.4);close(r.v,-.6);close(r.m,1);});
test('invalid zero radius and index',()=>{assert.equal(sphericalRefraction(1,1.5,0,.4).kind,'invalid');assert.equal(sphericalRefraction(0,1.5,.1,.4).kind,'invalid');});
test('lens maker supplied numerical case',()=>{const r=lensMaker(1.5,1,.2,-.2);close(r.f,.2);close(r.power,5);});
test('biconcave focal sign',()=>close(lensMaker(1.5,1,-.2,.2).f,-.2));
test('plane is infinite radius and zero curvature',()=>{const r=lensMaker(1.5,1,Infinity,-.2);close(r.c1,0);close(r.f,.4);assert.equal(lensMaker(1.5,1,0,-.2).kind,'invalid');});
test('index matching has zero thin power',()=>{const r=lensMaker(1.5,1.5,.2,-.2);assert.equal(r.kind,'zero');assert.equal(r.f,Infinity);close(r.power,0);});
test('positive and negative meniscus shapes',()=>{assert.ok(lensMaker(1.5,1,.15,.3).power>0);assert.ok(lensMaker(1.5,1,.3,.15).power<0);});
test('two lenses supplied numerical case',()=>{const r=twoLens(.1,.1,.3,.35,.04);close(r.first.v,.15);close(r.u2,.2);close(r.final.v,.2);close(r.mTotal,.5);close(r.final.hi,.02);});
test('two lenses with virtual object at second lens',()=>{const r=twoLens(.1,.1,.3,.1);close(r.u2,-.05);close(r.final.v,1/30);close(r.mTotal,-1/3);});
test('collimated intermediate bundle has finite final image',()=>{const r=twoLens(.1,.1,.1,.35,.04);assert.equal(r.first.kind,'infinity');assert.equal(r.u2,null);close(r.final.v,.1);close(r.mTotal,-1);});
test('intermediate image on second lens is a finite limiting case',()=>{const r=twoLens(.1,.1,.3,.15);assert.equal(r.u2,0);assert.equal(r.final.v,0);assert.equal(r.final.atElement,true);close(r.mTotal,-.5);});
test('final collimation does not multiply infinities',()=>{const r=twoLens(.1,.1,.3,.25);assert.equal(r.final.kind,'infinity');assert.equal(r.mTotal,null);});
test('zero separation agrees with contact thin power',()=>{const r=twoLens(.1,.1,.3,0);close(r.final.v,conjugate(.05,.3).v);});
test('invalid two-lens geometry rejected',()=>assert.equal(twoLens(-.1,.1,.3,.35).kind,'invalid'));
test('reflection law and length conservation',()=>{const d=unit([1,.4,.2]),n=unit([-1,.2,.1]),r=reflect(d,n);close(length(r),1);close(dot(d,n),-dot(r,n));closeVec(reflect(r,n),d);});
test('reflection invariant to normal orientation',()=>closeVec(reflect([1,.3,0],[-1,0,0]),reflect([1,.3,0],[1,0,0])));
test('Snell law at known angle',()=>{const theta=Math.PI/6,r=refract([Math.cos(theta),Math.sin(theta),0],[-1,0,0],1,1.5);assert.ok(!r.tir);close(1*Math.sin(r.theta1),1.5*Math.sin(r.theta2));close(length(r.direction),1);});
test('normal incidence stays straight',()=>closeVec(refract([1,0,0],[-1,0,0],1,1.5).direction,[1,0,0]));
test('index-matched exact rays do not change direction',()=>{const d=unit([1,.3,.2]);closeVec(refract(d,unit([-1,.2,.1]),1.5,1.5).direction,d);});
test('high-angle total internal reflection has no transmitted direction',()=>{const theta=Math.PI/3,r=refract([Math.cos(theta),Math.sin(theta),0],[-1,0,0],1.5,1);assert.equal(r.tir,true);assert.equal(r.theta2,null);assert.ok(r.direction[0]<0);});
test('critical angle stays finite',()=>{const a=Math.asin(1/1.5),r=refract([Math.cos(a),Math.sin(a),0],[-1,0,0],1.5,1);assert.equal(r.tir,false);close(r.theta2,Math.PI/2,1e-7);});
test('spherical cap intersection lies on both ray and surface',()=>{const surface={R:.2,vertex:0,aperture:.05},point=surfacePoint(0,.2,.03,.01),origin=[-.3,0,0],d=unit(sub(point,origin)),hit=intersectSurface(origin,d,surface);closeVec(hit.point,point);close(length(sub(hit.point,[.2,0,0])),.2);close(length(hit.normal),1);});
test('negative-radius cap intersects correct near branch',()=>{const point=surfacePoint(0,-.2,.03),hit=intersectSurface([-.3,0,0],unit(sub(point,[-.3,0,0])),{R:-.2,vertex:0,aperture:.05});closeVec(hit.point,point);assert.ok(hit.point[0]<0);});
test('aperture excludes a ray outside disk',()=>assert.equal(intersectSurface([-.3,.08,0],[1,0,0],{R:.2,vertex:0,aperture:.05}),null));
test('rays aimed away from the surface miss',()=>assert.equal(intersectSurface([-.3,0,0],[-1,0,0],{R:.2,vertex:0,aperture:.05}),null));
test('plane intersection uses exact plane normal',()=>{const hit=intersectSurface([-.3,.02,0],[1,0,0],{R:Infinity,vertex:0,aperture:.05});closeVec(hit.point,[0,.02,0]);closeVec(hit.normal,[-1,0,0]);});
test('parallel ray misses a plane without invalid arithmetic',()=>assert.equal(intersectSurface([-.3,0,0],[0,1,0],{R:Infinity,vertex:0,aperture:.05}),null));
test('valid finite lens passes geometry validation',()=>assert.ok(validateLens({R1:.2,R2:-.2,aperture:.04,thickness:.02}).valid));
test('crossing surfaces fail geometry validation',()=>assert.ok(!validateLens({R1:.1,R2:-.1,aperture:.08,thickness:.01}).valid));
test('aperture beyond sphere fails geometry validation',()=>assert.ok(!validateLens({R1:.02,R2:-.02,aperture:.04,thickness:.02}).valid));
test('two-interface lens respects ray continuity and Snell at both surfaces',()=>{const g={R1:.2,R2:-.2,aperture:.04,thickness:.02,nLens:1.5,nMedium:1},r=traceLens([-.4,.01,0],unit([1,.01,.005]),g);assert.equal(r.status,'transmitted');assert.equal(r.events.length,2);closeVec(r.segments[0].b,r.segments[1].a);for(let i=0;i<2;i++){const e=r.events[i],ni=i?1.5:1,nt=i?1:1.5;close(ni*Math.sin(e.theta1),nt*Math.sin(e.theta2));}});
test('lens ray missing first aperture reports miss',()=>{const r=traceLens([-.4,.2,0],[1,0,0],{R1:.2,R2:-.2,aperture:.04,thickness:.02,nLens:1.5});assert.equal(r.status,'miss');});
test('invalid lens geometry does not fabricate paths',()=>{const r=traceLens([-.4,0,0],[1,0,0],{R1:.02,R2:-.02,aperture:.04,thickness:.001,nLens:1.5});assert.equal(r.status,'invalid');assert.equal(r.segments.length,0);});
test('near-axis spherical mirror agrees with paraxial image',()=>{const u=.3,y=.00001,surface={R:-.2,vertex:0,aperture:.04},pt=surfacePoint(0,surface.R,y),d=unit(sub(pt,[-u,0,0])),hit=intersectSurface([-u,0,0],d,surface),r=reflect(d,hit.normal),x=hit.point[0]-hit.point[1]*r[0]/r[1];close(-x,conjugate(.1,u).v,1e-7);});
test('near-axis spherical refraction agrees with paraxial image',()=>{const pt=surfacePoint(0,.1,.00001),d=unit(sub(pt,[-.4,0,0])),hit=intersectSurface([-.4,0,0],d,{R:.1,vertex:0,aperture:.04}),r=refract(d,hit.normal,1,1.5),x=hit.point[0]-hit.point[1]*r.direction[0]/r.direction[1];close(x,.6,1e-6);});
test('negligible-thickness physical lens agrees with thin lens limit',()=>{const g={R1:.2,R2:-.2,thickness:.00001,aperture:.0002,nLens:1.5,nMedium:1},origin=[-.6,0,0],pt=surfacePoint(-g.thickness/2,g.R1,.00001),ray=traceLens(origin,unit(sub(pt,origin)),g),x=ray.exitOrigin[0]-ray.exitOrigin[1]*ray.exitDirection[0]/ray.exitDirection[1];close(x,.3,1e-5);});
test('wider spherical mirror rays reveal rather than conceal aberration',()=>{const hitAt=y=>{const pt=surfacePoint(0,-.2,y),hit=intersectSurface([-.6,y,0],[1,0,0],{R:-.2,vertex:0,aperture:.08}),r=reflect([1,0,0],hit.normal);return hit.point[0]-hit.point[1]*r[0]/r[1];};assert.ok(Math.abs(hitAt(.07)+.1)>Math.abs(hitAt(.001)+.1));});
test('screen blur vanishes at a real image plane',()=>{const r=screenSpot(.3,.1,.04,.15);close(r.radius,0);assert.ok(r.sharp&&r.projectable);});
test('screen blur increases with displacement from focus',()=>{const a=screenSpot(.3,.1,.04,.15),b=screenSpot(.3,.1,.04,.2);assert.ok(b.radius>a.radius);});
test('virtual image never produces a projectable sharp screen',()=>{const r=screenSpot(.05,.1,.04,.1);assert.equal(r.projectable,false);assert.equal(r.sharp,false);});
test('two distinct ideal rays meet computed real and virtual images',()=>{for(const mirror of [true,false])for(const [f,u]of [[.1,.3],[.1,.05],[-.1,.2]]){const r=conjugate(f,u,.03);for(const y of [0,.03]){const ray=idealRay(u,.03,y,f,mirror),x=mirror?-r.v:r.v,at=y+(x/ray.direction[0])*ray.direction[1];close(at,r.hi);}}});
test('ideal two-lens trajectories reach ABCD final image',()=>{const s=twoLens(.1,.1,.3,.35,.04);for(const y of [-.02,0,.03]){const ray=idealRay(.3,.04,y,.1),slope=ray.direction[1]/ray.direction[0],y2=y+.35*slope,out=slope-y2/.1;close(y2+s.final.v*out,s.final.hi);}});
test('default state yields distinct constructions in every experiment',()=>{for(const [lab,exp]of [['mirrors','formation'],['refraction','formation'],['lenses','formation'],['lenses','focal'],['lenses','maker'],['lenses','two']]){state.lab=lab;state.experiment=exp;const s=compute(),r=constructionRays(s);assert.ok(r.length>=2);assert.ok(r.every(ray=>ray.direction.every(Number.isFinite)));}state.lab='mirrors';state.experiment='formation';});
test('default spatial bundles have valid surfaces and noncoplanar paths',()=>{state.options.bundle=true;for(const [lab,exp]of [['mirrors','formation'],['refraction','formation'],['lenses','formation'],['lenses','maker'],['lenses','two']]){state.lab=lab;state.experiment=exp;const rays=physicalRays(compute());assert.ok(rays.some(r=>r.segments.some(seg=>Math.abs(seg.b[2])>.0001)));assert.ok(rays.every(r=>r.segments.every(seg=>[...seg.a,...seg.b].every(Number.isFinite))));assert.ok(rays.some(r=>['reflected','transmitted'].includes(r.status)));}state.options.bundle=false;state.lab='mirrors';state.experiment='formation';});
test('a clipped physical lens ray terminates on the actual aperture rim',()=>{const g={R1:.2,R2:-.2,thickness:.04,aperture:.04,nLens:1.5,nMedium:1},origin=[-.2,-.2,0],pt=surfacePoint(-g.thickness/2,g.R1,.035),r=traceLens(origin,unit(sub(pt,origin)),g);assert.equal(r.status,'clipped');assert.equal(r.terminal,true);close(Math.hypot(r.exitOrigin[1],r.exitOrigin[2]),g.aperture);assert.equal(r.segments.length,2);});
test('internal reflection stays inside a physical lens and terminates on the next boundary',()=>{const g={R1:.08,R2:-.08,aperture:.06,thickness:.06,nLens:1.8,nMedium:1},r=traceLens([-.3,.055,0],[1,0,0],g);assert.equal(r.status,'tir');assert.equal(r.terminal,true);assert.equal(r.events[1].theta2,null);assert.equal(r.segments.length,3);assert.equal(r.segments[2].kind,'reflected');closeVec(r.segments[1].b,r.segments[2].a);close(length(sub(r.exitOrigin,[g.thickness/2+g.R2,0,0])),Math.abs(g.R2));});
test('default two-lens diagram has multiple complete rays through both apertures',()=>{state.lab='lenses';state.experiment='two';const s=compute(),rays=constructionRays(s);assert.ok(rays.filter(ray=>Math.abs(ray.hit[1]+s.p.d*ray.direction[1]/ray.direction[0])<=s.p.aperture).length>=2);state.lab='mirrors';state.experiment='formation';});
