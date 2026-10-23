// Independent reference tables and geometric invariants; writes reviewable local evidence.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {conjugate,sphericalRefraction,lensMaker,twoLens,traceLens,surfacePoint,sub,unit} from '../src/physics.js';
const rows=[],close=(actual,expected,tolerance=1e-9)=>{assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<tolerance,`${actual} vs ${expected}`);return Math.abs(actual-expected);};
for(const device of ['mirror','lens'])for(const h of [.02,.06])for(const [f,u,v,m]of [[.1,.3,.15,-.5],[.1,.2,.2,-1],[.1,.15,.3,-2],[.1,.05,-.1,2],[-.1,.2,-1/15,1/3]]){
  const actual=conjugate(f,u,h),expected={v,m,hi:m*h};const errors=Object.fromEntries(Object.keys(expected).map(k=>[k,close(actual[k],expected[k])]));rows.push({device,input:{f,u,h},expected,actual,errors});
}
for(const [n1,n2,R,u,v,m]of [[1,1.5,.1,.4,.6,-1],[1,1.5,-.1,.4,-.2,1/3],[1.5,1,-.1,.4,.8,-3],[1.5,1.5,.1,.4,-.4,1],[1,1.5,Infinity,.4,-.6,1]]){const actual=sphericalRefraction(n1,n2,R,u);close(actual.v,v);close(actual.m,m);rows.push({device:'interface',input:{n1,n2,R,u},expected:{v,m},actual});}
for(const [shape,R1,R2,f]of [['biconvex',.2,-.2,.2],['biconcave',-.2,.2,-.2],['plano-convex',Infinity,-.2,.4],['plano-concave',Infinity,.2,-.4],['positive meniscus',.15,.3,.6],['negative meniscus',.3,.15,-.6]]){const actual=lensMaker(1.5,1,R1,R2);close(actual.f,f);rows.push({device:'maker',shape,input:{R1,R2,nLens:1.5,nMedium:1},expected:{f},actual});}
for(const [d,v1,u2,v2,m]of [[.35,.15,.2,.2,.5],[.1,.15,-.05,1/30,-1/3]]){const actual=twoLens(.1,.1,.3,d,.02);close(actual.first.v,v1);close(actual.u2,u2);close(actual.final.v,v2);close(actual.mTotal,m);rows.push({device:'two lenses',input:{f1:.1,f2:.1,u:.3,d,h:.02},expected:{v1,u2,v2,m},actual});}
const thinLimit=[];
for(const [R,n]of [[.1,1.2],[.2,1.5],[.3,1.8]]){
  const f=R/(2*(n-1)),u=3*f,expectedV=1.5*f,g={R1:R,R2:-R,thickness:1e-5,aperture:2e-4,nLens:n,nMedium:1},origin=[-u,0,0],target=surfacePoint(-g.thickness/2,R,1e-5),ray=traceLens(origin,unit(sub(target,origin)),g);assert.equal(ray.status,'transmitted');const x=ray.exitOrigin[0]-ray.exitOrigin[1]*ray.exitDirection[0]/ray.exitDirection[1];const error=close(x,expectedV,3e-5);thinLimit.push({R,n,u,thickness:g.thickness,rayHeight:1e-5,expectedV,physicalIntercept:x,error});
}
const output=process.env.OPTICS_AUDIT_OUTPUT||'tmp/audit/final';await mkdir(output,{recursive:true});
await writeFile(`${output}/numerical-validation.json`,JSON.stringify({units:'metres, dimensionless M; nonfinite radii serialized as null in JSON',tolerance:1e-9,rows,thinLimit},null,2));console.log(`${rows.length} independent reference rows and ${thinLimit.length} thin-limit physical traces passed.`);
