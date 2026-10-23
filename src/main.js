import 'katex/dist/katex.min.css';
import './styles.css';
import {state,params,compute,currentKey,reset,preset,setShape} from './state.js';
import {clamp,screenSpot} from './physics.js';
import {Diagram} from './render2d.js';
import {OpticalScene} from './render3d.js';
import {controls,results,calculations,learning,focalExperiment,icon,fmt,cm} from './presentation.js';
const app=document.querySelector('#app');
try{state.theme=localStorage.getItem('optics-theme')||'dark';}catch{}
const labTitles={mirrors:'Spherical Mirrors',refraction:'Spherical Refraction',lenses:'Thin Lenses'};
const expTitles={formation:'Image Formation',focal:'Focal Length Experiment',maker:'Lens Maker Explorer',two:'Two-Lens Optical System'};
let renderer,rendererMode,scheduled=false;
function shell(){app.innerHTML=`
  <a class="skip-link" href="#laboratory">Skip to laboratory</a>
  <header class="topbar"><a class="brand" href="#" aria-label="Geometrical Optics Lab home"><span class="brand-mark"><span></span><span></span><span></span></span><span>Geometrical<span class="brand-sub">Optics Lab</span></span></a>
    <nav class="main-tabs" aria-label="Laboratories">${Object.entries(labTitles).map(([key,title])=>`<button data-lab="${key}" class="main-tab ${state.lab===key?'active':''}" aria-pressed="${state.lab===key}">${icon(key==='mirrors'?'mirror':key==='refraction'?'refraction':'lens',21)}<span>${title}</span></button>`).join('')}</nav>
    <div class="header-actions"><button class="icon-button" id="theme-toggle" aria-label="Switch to ${state.theme==='dark'?'light':'dark'} theme">${icon(state.theme==='dark'?'sun':'moon')}</button><span class="header-divider"></span><button class="reset-button" id="reset-experiment">${icon('reset',16)}<span>Reset lab</span></button></div>
  </header>
  <main><section class="intro"><div><div class="eyebrow"><span class="tiny-line"></span> AN INTERACTIVE PHYSICS LABORATORY</div><h1>Explore how light <em>forms images.</em></h1><p>Investigate reflection, refraction, and image formation through interactive optical experiments.</p></div><div class="hero-note"><span class="orbit-mini">${icon('spark',28)}</span><div>Make a prediction.<br><b>Let the rays reveal it.</b></div></div></section>
  <div id="experiment-nav" class="experiment-nav" aria-label="Thin lens experiments"></div>
  <section class="lab-layout" id="laboratory" aria-label="Optical laboratory"><aside id="controls" class="controls-panel panel"></aside>
    <section class="simulation-panel panel"><div class="viewport-toolbar"><div class="view-switch" aria-label="Visualization mode"><button data-view="2d">${icon('diagram',17)}<span>2D Ray Diagram</span></button><button data-view="3d">${icon('cube',17)}<span>3D Optical Laboratory</span></button></div><div class="viewport-actions"><details class="display-menu"><summary title="Display options">${icon('eye',18)}<span>Display</span></summary><div class="display-popover"><h3>Make the geometry clear</h3>${Object.entries({rays:'Principal rays',bundle:'Ray bundles',virtual:'Virtual extensions',axis:'Principal axis',foci:'Focal & curvature points',labels:'Labels',normals:'Surface normals',angles:'Angle measurements',images:'Image indicators',measure:'Distance measurements'}).map(([key,title])=>`<label><input type="checkbox" data-option="${key}" ${state.options[key]?'checked':''}>${title}</label>`).join('')}<div class="density-control"><label for="ray-count">Spatial bundle density</label><input id="ray-count" type="range" min="5" max="45" step="2" value="${state.rayCount}"></div><label><input type="checkbox" id="colorblind" ${state.colorblind?'checked':''}>Color vision alternative</label></div></details><button class="icon-button" id="fit-view" aria-label="Fit diagram or reset camera" title="Fit diagram / reset camera">${icon('expand',18)}</button></div></div>
      <div class="scene-heading"><div><span class="panel-eyebrow" id="scene-eyebrow"></span><h2 id="scene-title"></h2></div><span class="model-chip" id="model-chip"></span></div>
      <div id="geometry-notice" hidden></div><div class="viewport" id="viewport"><div id="render-host"></div><div class="view-watermark">GEOMETRICAL OPTICS <span>↗</span></div><div class="zoom-controls" id="zoom-controls"><button id="zoom-out" aria-label="Zoom out">${icon('minus',15)}</button><span id="zoom-value">100%</span><button id="zoom-in" aria-label="Zoom in">${icon('plus',15)}</button></div></div>
      <div class="viewport-caption"><span id="interaction-hint"></span><span id="trace-status"></span></div><div class="ray-legend"><span><i class="incident-key"></i>Incident</span><span><i class="emerging-key"></i><b id="emerging-label">Reflected</b></span><span><i class="virtual-key"></i>Virtual extension</span><span><i class="object-key"></i>Object</span><span><i class="image-key"></i>Image</span></div>
    </section><aside class="results-panel panel" id="results" aria-live="polite" aria-atomic="false"></aside>
  </section><section id="focal-experiment" class="experiment-section panel" hidden></section><section id="calculations" class="calculation-section panel"></section><section id="learning" class="learning-section panel"></section>
  <footer><span class="footer-brand">${icon('spark',16)} Geometrical Optics Lab</span><span>Observe. Predict. Understand.</span><button id="open-guide" class="text-button">Signs & simulation guide ${icon('info',15)}</button></footer></main>
  <dialog id="lab-dialog"><div id="dialog-content"></div><button class="icon-button dialog-close" aria-label="Close dialog" id="close-dialog">${icon('close')}</button></dialog><div class="toast" role="status" id="toast"></div>`;
}
function toast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3400);}
function refresh({rebuildControls=false,newRenderer=false}={}){
  const s=compute();document.documentElement.dataset.theme=state.theme;document.documentElement.classList.toggle('colorblind',state.colorblind);
  document.querySelectorAll('[data-lab]').forEach(el=>{el.classList.toggle('active',el.dataset.lab===state.lab);el.setAttribute('aria-pressed',el.dataset.lab===state.lab);});
  const nav=document.querySelector('#experiment-nav');nav.hidden=state.lab!=='lenses';nav.innerHTML=Object.entries(expTitles).map(([key,title])=>`<button data-experiment="${key}" class="${key===state.experiment?'active':''}" aria-pressed="${key===state.experiment}">${title}</button>`).join('');
  if(rebuildControls)document.querySelector('#controls').innerHTML=controls(s);
  syncInputs();document.querySelectorAll('[data-preset]').forEach(el=>el.classList.toggle('selected',Math.abs(s.p.u/Math.abs(s.f)-Number(el.dataset.preset))<.001));const shape=document.querySelector('#lens-shape');if(shape)shape.value=s.p.shape;document.querySelector('#results').innerHTML=results(s);document.querySelector('#calculations').innerHTML=calculations(s);document.querySelector('#learning').innerHTML=learning(s);
  const focal=document.querySelector('#focal-experiment');focal.hidden=s.key!=='focal';if(s.key==='focal')focal.innerHTML=focalExperiment(s);
  document.querySelector('#scene-eyebrow').textContent=state.lab==='lenses'?expTitles[state.experiment].toUpperCase():labTitles[state.lab].toUpperCase();
  document.querySelector('#scene-title').textContent=s.key==='mirrors'?`${s.p.type==='concave'?'Concave':'Convex'} mirror · image formation`:s.key==='refraction'?`${s.p.type==='convex'?'Convex':'Concave'} surface · a single interface`:s.key==='two'?'A journey through two lenses':s.key==='maker'?'Curvature, material & optical power':s.key==='focal'?'The optical bench':`${s.p.type==='convex'?'Convex':'Concave'} lens · image formation`;
  document.querySelector('#model-chip').innerHTML=`<span class="live-dot"></span>${state.view==='2d'?'Paraxial model':'Physical ray tracing'}`;
  const notice=document.querySelector('#geometry-notice');notice.hidden=s.geometryValid.valid;notice.innerHTML=s.geometryValid.valid?'':`<div class="geometry-warning" role="status">${icon('info',18)}<span>Physical geometry paused: ${s.geometryValid.reason} The paraxial solver remains available.</span></div>`;
  document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===state.view);el.setAttribute('aria-pressed',el.dataset.view===state.view);});
  document.querySelector('#interaction-hint').innerHTML=state.view==='2d'?`<span class="drag-indicator">↔</span> Drag the blue object${s.key==='focal'?', lens & screen':s.key==='refraction'?' · click the surface to explore normals':s.key==='two'?' & second lens stand':''}`:'Drag to orbit · scroll to zoom · right-drag to pan · drag apparatus to move';
  document.querySelector('#emerging-label').textContent=s.key==='mirrors'?'Reflected':'Refracted';document.querySelector('.simulation-panel').dataset.optic=state.lab;
  document.querySelector('#zoom-controls').hidden=state.view==='3d';document.querySelector('#zoom-value').textContent=`${Math.round(state.zoom*100)}%`;
  const host=document.querySelector('#render-host');
  if(newRenderer||rendererMode!==state.view||!renderer){renderer?.dispose();renderer=null;try{renderer=state.view==='2d'?new Diagram(host,handleDrag):new OpticalScene(host,handleDrag);rendererMode=state.view;}catch(e){console.error(e);state.view='2d';rendererMode='2d';renderer=new Diagram(host,handleDrag);toast('WebGL is unavailable. The complete 2D laboratory remains available.');refresh({rebuildControls:false});return;}}
  const focusedDrag=document.activeElement?.dataset?.drag;renderer.update(s);if(focusedDrag&&state.view==='2d'&&!renderer.drag)host.querySelector(`[data-drag="${focusedDrag}"]`)?.focus({preventScroll:true});
  document.querySelector('#trace-status').textContent=state.view==='3d'?host.dataset.traceStatus||'':s.key==='refraction'&&!s.geometryValid.valid?'Physical ray paused':s.key==='refraction'?'Exact selected ray · ideal image construction':'Vertex-plane construction';
}
function syncInputs(force=false){const p=params(),key=currentKey();for(const el of document.querySelectorAll('[data-param]')){const name=el.dataset.param,factor=Number(el.dataset.factor);let value=p[name];el.dataset.baseMin??=el.min;el.dataset.baseMax??=el.max;let min=Number(el.dataset.baseMin),max=Number(el.dataset.baseMax);
  if(key==='focal'){if(name==='objectX')max=Math.min(-5,(p.lensX-.01)*factor);if(name==='lensX'){min=Math.max(-4,(p.objectX+.01)*factor);max=Math.min(40,(p.screenX-.01)*factor);}if(name==='screenX')min=Math.max(1,(p.lensX+.01)*factor);}
  if(key==='refraction'){if(name==='rayHeight'){max=Number((p.aperture*.98*factor).toFixed(8));min=-max;}if(name==='aperture')max=Math.min(9,Math.abs(p.R)*95);}
  if(key==='mirrors'&&name==='aperture')max=Math.min(9,Math.abs(p.f)*190);
  el.min=min;el.max=max;el.step='any';if(['R','R1','R2'].includes(name))value=Math.abs(value);if(force||document.activeElement!==el)el.value=Number((value*factor).toFixed(4));if(el.type==='range'){const percent=(Number(el.value)-min)/(max-min)*100;el.style.setProperty('--range-progress',`${percent}%`);const labels=el.parentElement.querySelector('.range-labels');if(labels){const unit=el.parentElement.querySelector('.number-wrap span').textContent;labels.innerHTML=`<span>${fmt(min)} ${unit}</span><span>${fmt(max)} ${unit}</span>`;}}}}
function requestRefresh(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh();});}
function handleDrag(kind,point){const p=params(),key=currentKey();if(kind==='object'){p.u=clamp(-point.x,.01,1.2);p.h=clamp(point.y,.005,.08);if(key==='focal'){p.objectX=clamp(point.x,-.9,Math.min(-.05,p.lensX-.01));p.u=p.lensX-p.objectX;}}
  else if(kind==='screen')p.screenX=clamp(point.x,Math.max(.01,p.lensX+.01),1.5);
  else if(kind==='lens')p.lensX=clamp(point.x,Math.max(-.04,p.objectX+.01),Math.min(.4,p.screenX-.01));
  else if(kind==='lens2')p.d=clamp(point.x,.03,1);
  else if(kind==='surface')p.rayHeight=clamp(point.y,-p.aperture*.98,p.aperture*.98);
  requestRefresh();
}
function setParameter(el){const p=params(),name=el.dataset.param;let value=Number(el.value);if(!Number.isFinite(value)||el.value==='')return;value=clamp(value,Number(el.min),Number(el.max))/Number(el.dataset.factor);
  if(name==='R')value=Math.abs(value)*(p.type==='convex'?1:-1);if(name==='R1'||name==='R2'){value=Math.abs(value)*Math.sign(p[name]);p.shape='custom';}p[name]=value;
  if(currentKey()==='focal'){p.lensX=clamp(p.lensX,p.objectX+.01,p.screenX-.01);p.screenX=Math.max(p.screenX,p.lensX+.01);}
  if(currentKey()==='refraction'){p.aperture=Math.min(p.aperture,Math.abs(p.R)*.95);p.rayHeight=clamp(p.rayHeight,-p.aperture*.98,p.aperture*.98);}
  if(currentKey()==='mirrors')p.aperture=Math.min(p.aperture,Math.abs(p.f)*1.9);
  requestRefresh();
}
app.addEventListener('input',e=>{if(e.target.matches('[data-param]'))setParameter(e.target);if(e.target.id==='ray-count'){state.rayCount=Number(e.target.value);requestRefresh();}});
app.addEventListener('change',e=>{
  const el=e.target,p=params();if(el.matches('[data-param]')){setParameter(el);syncInputs(true);if(['R','aperture'].includes(el.dataset.param))refresh({rebuildControls:true});}
  if(el.dataset.option){state.options[el.dataset.option]=el.checked;refresh();}
  if(el.id==='colorblind'){state.colorblind=el.checked;refresh();}
  if(el.dataset.select){if(el.id==='surface-type'){p.type=el.value;p.R=Math.abs(p.R)*(p.type==='convex'?1:-1);}if(el.id==='lens-shape')setShape(el.value);if(el.id.startsWith('sign-')){const name=el.id.substring(5);p.shape='custom';p[name]=el.value==='plane'?Infinity:Math.abs(Number.isFinite(p[name])?p[name]:.2)*(el.value==='positive'?1:-1);}refresh({rebuildControls:true});}
});
app.addEventListener('focusout',e=>{if(e.target.matches('[data-param]'))syncInputs(true);});
app.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;const p=params(),s=compute();
  if(button.dataset.lab){state.lab=button.dataset.lab;state.zoom=1;refresh({rebuildControls:true,newRenderer:true});}
  if(button.dataset.experiment){state.experiment=button.dataset.experiment;state.zoom=1;refresh({rebuildControls:true,newRenderer:true});}
  if(button.dataset.view){state.view=button.dataset.view;refresh();}
  if(button.dataset.type){p.type=button.dataset.type;refresh({rebuildControls:true});}
  if(button.dataset.preset){preset(Number(button.dataset.preset));refresh({rebuildControls:true});}
  if(button.dataset.convex){p.type='convex';p.u=.2;p.f=.1;refresh({rebuildControls:true});}
  if(button.dataset.refcase){const cases={standard:{n1:1,n2:1.5,R:.1,type:'convex',u:.4,h:.025,aperture:.055,rayHeight:.035},reverse:{n1:1.5,n2:1,R:-.1,type:'concave',u:.4,h:.025,aperture:.055,rayHeight:.035},equal:{n1:1.5,n2:1.5,R:.1,type:'convex'},tir:{n1:1.5,n2:1,R:.1,type:'convex',u:.3,h:.005,aperture:.085,rayHeight:.08}};Object.assign(p,cases[button.dataset.refcase]);state.options.normals=true;state.options.angles=true;refresh({rebuildControls:true});document.querySelectorAll('[data-option]').forEach(el=>el.checked=state.options[el.dataset.option]);}
  if(button.dataset.removeTrial!==undefined){p.trials.splice(Number(button.dataset.removeTrial),1);refresh();}
  switch(button.id){
    case 'theme-toggle':state.theme=state.theme==='dark'?'light':'dark';try{localStorage.setItem('optics-theme',state.theme);}catch{}button.innerHTML=icon(state.theme==='dark'?'sun':'moon');button.setAttribute('aria-label',`Switch to ${state.theme==='dark'?'light':'dark'} theme`);refresh();break;
    case 'reset-experiment':reset();refresh({rebuildControls:true});renderer?.resetCamera?.();toast('Current experiment restored to its defaults.');break;
    case 'fit-view':state.zoom=1;refresh();renderer?.resetCamera?.();break;
    case 'zoom-in':state.zoom=clamp(state.zoom*1.2,.4,3);refresh();break;
    case 'zoom-out':state.zoom=clamp(state.zoom/1.2,.4,3);refresh();break;
    case 'record-trial':{const v=p.screenX-p.lensX,spot=screenSpot(p.u,s.f,p.aperture,v,p.h);if(!spot.projectable||v<=0)return;p.trials.push({u:p.u,v,f:p.u*v/(p.u+v)});refresh();toast(`Trial ${p.trials.length} recorded.`);break;}
    case 'clear-trials':p.trials=[];refresh();break;
    case 'export-trials':{const csv=n=>Number((n*100).toFixed(6)),rows=['Trial,u (cm),v (cm),f (cm)',...p.trials.map((t,i)=>`${i+1},${csv(t.u)},${csv(t.v)},${csv(t.f)}`)],blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='focal-length-trials.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}
    case 'open-challenge':openChallenge();break;
    case 'check-prediction':checkPrediction();break;
    case 'open-guide':openGuide();break;
    case 'close-dialog':document.querySelector('#lab-dialog').close();break;
  }
});
function openChallenge(){const content=document.querySelector('#dialog-content');content.innerHTML=`<div class="panel-eyebrow">${icon('target',17)} PREDICT THE IMAGE</div><h2>What will your setup produce?</h2><p>Use the current object position and optical parameters. Your answer is checked against the same physics state as the laboratory.</p><form id="prediction-form"><label for="prediction-nature">Image nature</label><select id="prediction-nature" name="nature"><option value="real">Real</option><option value="virtual">Virtual</option><option value="infinity">At infinity</option></select><label for="prediction-orientation">Orientation</label><select id="prediction-orientation" name="orientation"><option>inverted</option><option>upright</option><option>no finite image</option></select><label for="prediction-size">Relative size</label><select id="prediction-size" name="size"><option>diminished</option><option>enlarged</option><option>same size</option><option>unbounded</option></select><button type="button" class="primary-button" id="check-prediction">Check my prediction ${icon('arrow',16)}</button></form><p id="prediction-feedback" role="status"></p>`;document.querySelector('#lab-dialog').showModal();}
function checkPrediction(){const r=compute().result,form=document.querySelector('#prediction-form'),nature=r.kind==='infinity'?'infinity':r.real?'real':'virtual',correct=form.elements.nature.value===nature&&form.elements.orientation.value===r.orientation&&form.elements.size.value===r.size;document.querySelector('#prediction-feedback').textContent=correct?'Correct. Your prediction agrees with the ray geometry and the image equation.':`Try again: the current result is ${nature}, ${r.orientation}, and ${r.size}. Follow two rays or their backward extensions to see why.`;}
function openGuide(){document.querySelector('#dialog-content').innerHTML=`<div class="panel-eyebrow">SIMULATION GUIDE</div><h2>A consistent way to follow light.</h2><div class="guide-copy"><h3>Distances & signs</h3><p>Lengths are displayed in centimetres; calculations use metres. The x axis points right. The initial real object is to the left, with u > 0. A positive v means a real image: in front of a mirror, or beyond a transmitting element. Negative v means a virtual image. Positive magnification is upright; negative magnification is inverted.</p><h3>Curvature belongs to the element</h3><p>For mirrors, R = 2f: a concave mirror has positive R and f. Internally its Cartesian centre is at x = −R. For refraction and lens maker calculations, a positive radius places the centre to the right of the surface vertex. A biconvex lens has R₁ > 0 and R₂ &lt; 0. A plane has infinite radius and zero reciprocal curvature.</p><h3>Two complementary models</h3><p>The 2D construction and numerical results are paraxial. Rays are bent at the element’s ideal vertex plane. The 3D laboratory traces spherical caps with vector reflection and Snell’s law. Its lenses have two physical interfaces and finite thickness. Marginal rays can show aberration, and the physical focus can differ from the thin-lens image marker. The refraction lab contains exactly one interface.</p><h3>Interaction & measurements</h3><p>Drag the blue object tip to change distance and height. Focus or lens-position handles support arrow keys in 2D; Shift increases the step. All parameters also have numerical inputs. In 3D, orbit with a drag, zoom with a wheel or pinch, and pan with right-drag. Use Fit view to reset the camera.</p><h3>The optical bench</h3><p>Position readings share a fixed bench origin; u and v are measured from the current lens position. Screen blur uses the thin-element aperture footprint radius a|1 + v/u − v/f|. Only a real image is projectable. Trials remain in this browser session and can be exported to CSV.</p><h3>Scope & practical limits</h3><p>Rays are monochromatic geometric paths. No absorption or Fresnel intensity splitting is modeled. Mirrors reflect only on the face directed toward the initial object. A second mirror hit, further lens re-entry, or internal bounce stops at the next physical boundary; multiple-bounce paths are not modeled. Lens aperture rims absorb incident rays. Rays that miss the second lens continue in the surrounding medium. At infinity, image distance, height and magnification are represented as a state rather than a huge drawn arrow. Very distant image arrows are omitted beyond the diagram range.</p></div>`;document.querySelector('#lab-dialog').showModal();}
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('details[open]').forEach(el=>el.open=false);});
document.addEventListener('click',e=>{if(!e.target.closest('.display-menu'))document.querySelectorAll('.display-menu[open]').forEach(el=>el.open=false);});
shell();refresh({rebuildControls:true});
document.addEventListener('visibilitychange',()=>renderer?.render?.());
document.querySelector('#render-host').addEventListener('graphics-error',()=>{state.view='2d';refresh({newRenderer:true});toast('Graphics context interrupted. Switched to the 2D laboratory.');});
window.addEventListener('pagehide',()=>renderer?.dispose(),{once:true});
