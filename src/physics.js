/** Pure optical engine. All lengths are metres, angles radians, and indices dimensionless.
 * Cartesian x points right; incident light initially travels right; real object is x=-u.
 * Curriculum mirror R=2f is converted to Cartesian surface R=-2f.
 * Refraction/lens-maker R is Cartesian: positive centre lies right of vertex.
 * v>0 is real (left for mirrors, right for transmission); m>0 is upright.
 */
export const EPS = 1e-10;
export const add = (a,b) => a.map((v,i)=>v+b[i]);
export const sub = (a,b) => a.map((v,i)=>v-b[i]);
export const mul = (a,s) => a.map(v=>v*s);
export const dot = (a,b) => a.reduce((s,v,i)=>s+v*b[i],0);
export const length = a => Math.hypot(...a);
export function unit(a) { const l=length(a); if(!Number.isFinite(l)||l<EPS) throw new RangeError('A direction must have nonzero finite length.'); return mul(a,1/l); }
export const clamp = (x,a,b) => Math.min(b,Math.max(a,x));
const reciprocal = x => Math.abs(x)===Infinity ? 0 : 1/x;
const invalid = reason => ({kind:'invalid',reason,v:null,m:null,hi:null,real:null,orientation:'undefined',size:'undefined'});
export function imageResult(v,m,h=.04) {
  if(![v,m,h,m*h].every(Number.isFinite)) return invalid('Non-finite input to image classification.');
  return {kind:'finite',v,m,hi:m*h,real:v>0,orientation:m<0?'inverted':'upright',size:Math.abs(Math.abs(m)-1)<1e-7?'same size':Math.abs(m)>1?'enlarged':'diminished'};
}
const infiniteImage = () => ({kind:'infinity',v:null,m:null,hi:null,real:null,orientation:'no finite image',size:'unbounded'});
export function conjugate(f,u,h=.04,{signedObject=false}={}) {
  if((!Number.isFinite(f)&&f!==Infinity&&f!==-Infinity)||f===0||!Number.isFinite(h)||!Number.isFinite(u)||Math.abs(u)<EPS||(!signedObject&&u<=0)) return invalid('Use a nonzero focal length, finite height, and a positive real-object distance.');
  const k=reciprocal(f)-1/u;
  if(Math.abs(k)<EPS*Math.max(1,Math.abs(reciprocal(f)),Math.abs(1/u))) return infiniteImage();
  const v=1/k;
  return imageResult(v,-v/u,h);
}
export function sphericalRefraction(n1,n2,R,u,h=.04) {
  if(!(n1>0&&n2>0&&Number.isFinite(n1+n2)&&u>0&&Number.isFinite(u)&&Number.isFinite(h))||R===0||Number.isNaN(R)) return invalid('Positive indices and object distance, finite height, and a nonzero signed radius are required.');
  const k=(n2-n1)*reciprocal(R)-n1/u;
  if(Math.abs(k)<EPS*Math.max(1,n1/u,Math.abs((n2-n1)*reciprocal(R)))) return {...infiniteImage(),power:(n2-n1)*reciprocal(R)};
  const v=n2/k;
  return {...imageResult(v,-n1*v/(n2*u),h),power:(n2-n1)*reciprocal(R),zeroPower:Math.abs((n2-n1)*reciprocal(R))<EPS};
}
export function lensMaker(nLens,nMedium,R1,R2) {
  if(!(nLens>0&&nMedium>0&&Number.isFinite(nLens+nMedium))||[R1,R2].some(r=>r===0||Number.isNaN(r))) return {kind:'invalid',reason:'Use positive indices and nonzero radii; a plane has infinite radius.'};
  const ratio=nLens/nMedium, power=(ratio-1)*(reciprocal(R1)-reciprocal(R2));
  return {kind:Math.abs(power)<EPS?'zero':'finite',power,f:Math.abs(power)<EPS?Infinity:1/power,ratio,c1:reciprocal(R1),c2:reciprocal(R2)};
}
/** ABCD calculation avoids infinity × zero in a two-lens system. */
export function twoLens(f1,f2,u,d,h=.04) {
  if(![f1,f2,u,d,h].every(Number.isFinite)||f1<=0||f2<=0||u<=0||d<0) return {kind:'invalid',reason:'Both convex focal lengths and the real object distance must be positive; separation cannot be negative.'};
  const first=conjugate(f1,u,h), A=1-d/f1, B=u+d*(1-u/f1), C=-1/f1-A/f2, D=1-u/f1-B/f2;
  const signedSecond=first.kind==='finite'?d-first.v:null;
  const u2=signedSecond!==null&&Math.abs(signedSecond)<EPS?0:signedSecond;
  let final;
  if(Math.abs(D)<EPS*Math.max(1,Math.abs(B))) final=infiniteImage();
  else { const v2=-B/D, m=1/D; final=Math.abs(v2)<EPS?{...imageResult(0,m,h),real:true,atElement:true}:imageResult(v2,m,h); }
  let second;
  if(first.kind==='infinity') second={...imageResult(f2,0,0),m:null,hi:null,reason:'The first lens supplies a collimated bundle; a separate transverse magnification is undefined.'};
  else if(Math.abs(u2)<EPS) second={kind:'at-element',v:0,m:1,hi:first.hi,reason:'The intermediate image lies in the second lens plane; the limiting image remains in this plane.'};
  else second=conjugate(f2,u2,first.hi,{signedObject:true});
  return {kind:'system',first,second,final,u2,xFinal:final.kind==='finite'?d+final.v:null,m1:first.m,m2:second.m,mTotal:final.m,ABCD:{A,B,C,D}};
}
export function reflect(direction,normal) { const d=unit(direction),n=unit(normal); return unit(sub(d,mul(n,2*dot(d,n)))); }
export function refract(direction,normal,nFrom,nTo) {
  if(!(nFrom>0&&nTo>0)) throw new RangeError('Refractive indices must be positive.');
  const d=unit(direction); let n=unit(normal); if(dot(d,n)>0) n=mul(n,-1);
  const ci=clamp(-dot(d,n),0,1),eta=nFrom/nTo,k=1-eta*eta*(1-ci*ci),theta1=Math.acos(ci);
  if(k< -EPS) return {tir:true,direction:reflect(d,n),normal:n,theta1,theta2:null};
  const directionOut=unit(add(mul(d,eta),mul(n,eta*ci-Math.sqrt(Math.max(0,k)))));
  return {tir:false,direction:directionOut,normal:n,theta1,theta2:Math.acos(clamp(-dot(directionOut,n),0,1))};
}
export function sag(R,r) { if(Math.abs(R)===Infinity) return 0; if(R===0||r>Math.abs(R)) return null; const ratio=r/Math.abs(R);return (r*ratio)/(1+Math.sqrt(Math.max(0,1-ratio*ratio)))*Math.sign(R); }
export function surfacePoint(vertex,R,y,z=0) { const s=sag(R,Math.hypot(y,z)); return s===null?null:[vertex+s,y,z]; }
/** Intersect only the cap near the specified vertex, never the far side of a sphere. */
export function intersectSurface(origin,direction,{vertex=0,R,aperture}) {
  if(!(aperture>0)||R===0||Number.isNaN(R)||(!Number.isFinite(R)&&Math.abs(R)!==Infinity)) return null;
  const d=unit(direction); let candidates=[];
  if(Math.abs(R)===Infinity) { if(Math.abs(d[0])<EPS) return null; candidates=[(vertex-origin[0])/d[0]]; }
  else {
    // Vertex-local coefficients avoid subtracting two squared radii in the flat limit.
    const local=sub(origin,[vertex,0,0]),b=dot(local,d)-R*d[0],c=dot(local,local)-2*R*local[0],disc=b*b-c;
    if(disc< -EPS) return null;
    const root=Math.sqrt(Math.max(0,disc)),q=-b-(b<0?-1:1)*root; candidates=(q===0?[-b]:[q,c/q]).sort((a,b)=>a-b);
  }
  for(const t of candidates) {
    if(t<1e-8||!Number.isFinite(t)) continue;
    const point=add(origin,mul(d,t)),rho=Math.hypot(point[1],point[2]);
    if(rho>aperture+1e-9) continue;
    const s=sag(R,rho); if(s===null||Math.abs(point[0]-vertex-s)>1e-7) continue;
    const normal=Math.abs(R)===Infinity?[-1,0,0]:unit(sub(point,[vertex+R,0,0]));
    return {point,normal,t};
  }
  return null;
}
export function validateLens({R1,R2,thickness,aperture}) {
  if(!(thickness>0&&aperture>0)||!Number.isFinite(thickness+aperture)||[R1,R2].some(r=>r===0||Number.isNaN(r))) return {valid:false,reason:'Thickness and aperture must be positive; radii must be nonzero.'};
  if(aperture>=Math.min(Math.abs(R1),Math.abs(R2))) return {valid:false,reason:'The aperture radius must be smaller than both spherical radii.'};
  for(let i=0;i<=40;i++) { const r=aperture*i/40; if(thickness+sag(R2,r)-sag(R1,r)<=1e-6) return {valid:false,reason:'The surfaces cross within the aperture. Increase thickness or reduce aperture.'}; }
  return {valid:true};
}
export function traceInterface(origin,direction,surface,n1,n2) {
  const hit=intersectSurface(origin,direction,surface);
  if(!hit) return {status:'miss',segments:[],exitOrigin:origin,exitDirection:unit(direction)};
  const result=refract(direction,hit.normal,n1,n2);
  return {status:result.tir?'tir':'transmitted',segments:[{a:origin,b:hit.point,kind:'incident'}],hit,...result,exitOrigin:hit.point,exitDirection:result.direction};
}
/** Finite cylindrical aperture stop joining the two spherical cap edges. */
export function intersectLensRim(origin,direction,{R1,R2,thickness,aperture,center=0}) {
  const d=unit(direction),a=d[1]*d[1]+d[2]*d[2];if(a<EPS)return null;
  const b=2*(origin[1]*d[1]+origin[2]*d[2]),c=origin[1]*origin[1]+origin[2]*origin[2]-aperture*aperture,disc=b*b-4*a*c;if(disc<0)return null;
  const left=center-thickness/2+sag(R1,aperture),right=center+thickness/2+sag(R2,aperture);
  for(const t of [(-b-Math.sqrt(disc))/(2*a),(-b+Math.sqrt(disc))/(2*a)].sort((a,b)=>a-b)){
    if(t<=1e-8)continue;const point=add(origin,mul(d,t));if(point[0]>=left-1e-8&&point[0]<=right+1e-8)return {point,t,normal:unit([0,point[1],point[2]])};
  }return null;
}
export function traceLens(origin,direction,{R1,R2,thickness,aperture,nLens,nMedium=1,center=0}) {
  const config={R1,R2,thickness,aperture},valid=validateLens(config);
  if(!valid.valid) return {status:'invalid',reason:valid.reason,segments:[]};
  const front=center-thickness/2+Math.min(0,sag(R1,aperture));
  if(direction[0]<=0||origin[0]>=front-1e-8)return {status:'invalid',reason:'The forward lens tracer requires a source before the complete first cap, travelling toward increasing x.',segments:[]};
  const first=traceInterface(origin,direction,{vertex:center-thickness/2,R:R1,aperture},nMedium,nLens);
  const entryRim=intersectLensRim(origin,direction,{...config,center});
  if(entryRim&&(!first.hit||entryRim.t<first.hit.t))return {status:'clipped',segments:[{a:origin,b:entryRim.point,kind:'incident'}],events:[],exitOrigin:entryRim.point,exitDirection:unit(direction),terminal:true};
  if(first.status==='miss') return {...first,events:[]};
  // At grazing incidence the next boundary can be the SAME cap, or the aperture rim.
  const nextBoundary=(o,d)=>[
    intersectSurface(o,d,{vertex:center-thickness/2,R:R1,aperture}),
    intersectSurface(o,d,{vertex:center+thickness/2,R:R2,aperture}),
    (()=>{const hit=intersectLensRim(o,d,{...config,center});return hit?{...hit,rim:true}:null;})()
  ].filter(Boolean).sort((a,b)=>a.t-b.t)[0];
  const terminate=(ray,segments,events,kind)=>{const next=nextBoundary(ray.exitOrigin,ray.exitDirection);return {...ray,segments:[...segments,...(next?[{a:ray.exitOrigin,b:next.point,kind}]:[])],events,exitOrigin:next?.point||ray.exitOrigin,terminal:!!next};};
  if(first.tir)return terminate(first,first.segments,[first],'reflected');
  const hit=nextBoundary(first.exitOrigin,first.exitDirection);
  if(!hit||hit.rim)return {status:'clipped',segments:[...first.segments,...(hit?[{a:first.exitOrigin,b:hit.point,kind:'inside'}]:[])],exitOrigin:hit?.point||first.exitOrigin,exitDirection:first.exitDirection,events:[first],terminal:true};
  const result=refract(first.exitDirection,hit.normal,nLens,nMedium);
  const second={status:result.tir?'tir':'transmitted',hit,...result,exitOrigin:hit.point,exitDirection:result.direction};
  const segments=[...first.segments,{a:first.exitOrigin,b:hit.point,kind:'inside'}],events=[first,second];
  // Further internal bounces/re-entries stop at the next boundary rather than crossing it.
  return terminate(second,segments,events,result.tir?'reflected':'transmitted');
}
export function screenSpot(u,f,aperture,screenDistance,objectHeight=.04) {
  const image=conjugate(f,u,objectHeight);
  // A ray from the object tip crossing lens at height y arrives at
  // y_screen = -s*h/u + y*(1+s/u-s/f); its footprint radius is the latter coefficient × aperture.
  const radius=aperture*Math.abs(1+screenDistance/u-screenDistance/f);
  return {radius,center:-screenDistance*objectHeight/u,projectable:image.kind==='finite'&&image.real&&screenDistance>0,image,sharp:image.kind==='finite'&&image.real&&radius<.0008};
}
export function idealRay(u,h,y,f,mirror=false) {
  const slope=(y-h)/u-y*reciprocal(f);
  return {a:[-u,h,0],hit:[0,y,0],direction:unit([mirror?-1:1,slope,0])};
}
