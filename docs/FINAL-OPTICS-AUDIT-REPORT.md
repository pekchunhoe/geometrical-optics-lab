# Independent final optics audit

**Final — local audit complete.**

Audit date: 23 October 2026. Project: `D:\Physics Simulation Sem 2\Geometrical Optics Lab`. Scope: the existing application, all three laboratories, four lens experiments, both renderers, mathematics, curriculum, interactions, resource use and local static-hosting readiness. Changes remain local. No commit, push, deployment, dependency upgrade or application rebuild from scratch was performed.

## Executive assessment

Final verdict: **READY WITH DOCUMENTED LIMITATIONS**. All 19 verified defects are corrected; no critical or high finding remains unresolved. The application is technically ready to prepare for GitHub and Vercel deployment within the documented model and verification limits. Nothing has been committed, pushed or deployed.

The supplied curriculum page was independently reopened, extracted, rendered and visually inspected. Its geometrical-optics outcomes are covered. The original numerical formulas and curriculum sign conventions were sound in the mandatory reference cases. Independent boundary and browser checks nevertheless exposed genuine tracing, bench-coordinate, visualization, control and hosting defects missed by the original suite.

The audit groups findings into **19 defects: 3 critical, 6 high, 8 medium and 2 low**. The corrections and regression coverage are recorded below. The distinction between paraxial image predictions and finite-thickness physical ray paths remains explicit throughout the application.

The application is a self-contained static Vite application. Its runtime requires no paid service, account, backend, external physics API or remote font. Technical hosting checks cover the HTTP root and a GitHub Pages style repository prefix. Git history and tracked-secret status cannot be certified: this directory is not a Git repository. Hosting credentials, an actual Vercel deployment, physical mobile hardware and hardware-accelerated browser performance were outside the local audit.

## Baseline and evidence integrity

Before modifying application source, I read the engine, state/model layer, both renderers, presentation and event handlers, styles, package scripts, original tests, README, physics documentation, completion report and prior numerical/screenshot evidence.

| Check | Independently reproduced baseline |
| --- | --- |
| `npm.cmd test` | 83 passed, 0 failed |
| `npm.cmd run check` | Passed JavaScript syntax and presentation-label checks |
| Production build | Passed; advisory for the graphics chunk over 500 kB |
| Original Playwright suite | 61 passed, 0 failed, approximately 2.8 minutes |
| Curriculum PDF | 14 pages; physical and printed page 11 inspected |
| Git | `fatal: not a git repository`; no repository initialized |

Baseline application snapshots and SHA-256 hashes are retained in `tmp/audit/baseline/source/` and `source-hashes.csv`. The original 83 unit/integration tests and 61 browser scenarios were preserved. Neither their assertions nor their test cases were removed or weakened. The historical `docs/COMPLETION-REPORT.md` and its validation evidence remain historical evidence, rather than being silently replaced with the new verdict.

The added engine regressions were also executed against the saved original source: **42 checks, 32 passed and 10 failed**. This confirms the failing physical/validation cases independently of the corrected engine. The initial eight browser probes recorded six actual application failures, one passing drag workflow and one test-author timeout after CSV assertions had already succeeded. That timeout came from querying a nonexistent focal-experiment control and was removed; it was not an application defect. An intermediate 18-scenario expansion had 16 passes and two test-harness failures: a font/resize timing race in a bounding-box read, and an inappropriate geometry-count comparison between different ray-clipping configurations. The corrected checks await stable layout, require identical resource counts for repeated identical states, verify zero resources after disposal, and preserve analytical assertions. An early preview-size check was tightened to inspect the SVG geometry itself and require absolute 15/30 mm heights; an outer bounding box had included a constant stroke width. All diagnostic logs and failure traces remain under `tmp/audit/`.

## Curriculum compliance matrix

Source: `C:\Users\User\Downloads\Telegram Desktop\Curriculum Specifications (CS) Physics SP025.pdf`, page 11. A separately rendered copy is retained with the audit evidence. The document supplied physics requirements; instructions in supporting documents were not treated as overriding the user's local-only audit request.

Test-file abbreviations: **P** = `tests/physics.test.js`; **A** = `tests/audit-physics.test.js`; **M** = `tests/presentation.test.js`; **B** = `tests/browser/lab.spec.js`; **E** = `tests/browser/audit-evidence.spec.js`; **U** = `tests/browser/audit.spec.js`.

| Learning outcome | Existing feature and source | Independent verification | Result / action |
| --- | --- | --- | --- |
| Mirror radius and focus, R = 2f | `physics.js`, `state.js`, `presentation.js`; F/C markers in both renderers | P mirror references; A two-height table; E actual SVG references | Pass; Cartesian conversion retained |
| Mirror diagrams with at least two rays | `model.js:constructionRays`, `render2d.js`; parallel, focus, pole, C and fallback rays | P distinct-ray tests; E actual outgoing-line intersections and focal parallelism | Pass; back-face/repeated physical hits corrected separately |
| Concave/convex image characteristics | Signed f/v/M, presets, result classifications | A all five mandatory cases at two heights; E UI nature, size, height and geometry | Pass; stale preset highlighting corrected |
| Mirror equation and real initial objects | `physics.js:conjugate`; positive u controls | P invalid objects, finite/infinite cases; A near-focal limits | Pass |
| Mirror magnification M = hi/ho = -v/u | `physics.js:imageResult`, worked solutions | A numerical tables; M TeX; E displayed M and hi | Pass |
| One spherical refracting interface | `traceInterface`, `elementsFor`, 3D single cap | P intersection/Snell/index tests; B/E one-interface and TIR workflows | Pass; paused invalid geometry no longer reports an exact ray |
| n1/u + n2/v = (n2-n1)/R | `sphericalRefraction`, SI substitutions | P +60 cm reference, negative R, planar/equal-index and infinity; numerical evidence script | Pass |
| Refraction curvature signs and media | Signed R, incident/transmitted controls, local-normal explorer | P vector invariants; A critical-angle sweep and selected-ray guard; U keyboard explorer | Pass; explorer keyboard origin corrected |
| Thin-lens equation, positive/negative f and real initial objects | `conjugate`, lens-derived maker power and image formation | A five mandatory cases at two heights; E actual SVG intersections/parallelism | Pass |
| Thin-lens magnification | Live M/hi, image arrows, worked equations | A numerical heights; E displayed values, M TeX and live figures | Pass |
| Convex-lens focal-length experiment | Object/lens/screen, `screenSpot`, `focalExperiment`, trial recording | P blur/projectability; U independent coordinates, image scaling and actual CSV; B/E focus, records, mean, clear/reset and view retention | Pass; absolute positions, preview scale and bench fit corrected |
| Lens maker equation in surrounding medium | `lensMaker`; signed independent radii, indices and six shapes | P required +20 cm case, planes, menisci and equal indices; B six shapes; U custom radii | Pass; custom shape indication synchronized |
| Two convex lenses using sequential thin formulas | `twoLens` with signed u2 and ABCD limits; intermediate/final predictions | P standard/virtual/singular cases; A five independent rearrangements; B/E stage text and actual workflows | Pass; ambient rays missing lens 2 now continue; lens-1-only marker clarified |

No unrelated wave-optics content was added. Visible tabs remain Spherical Mirrors, Spherical Refraction and Thin Lenses, with four internal lens selections. Runtime browser text checks and the expanded static scan reject subject codes and numbered semester/chapter/topic/subtopic labels.

## Signs, mathematical results and numerical tolerances

Engine lengths are metres and angles radians. UI distances are centimetres. The initial real object is at Cartesian x = -u, with u > 0. Positive v denotes a real image: Cartesian x = -v for mirrors and x = +v for transmission. Positive magnification is upright; negative magnification is inverted.

For mirrors, the curriculum radius is R = 2f, positive for concave and negative for convex; the traced spherical cap has Cartesian radius -2f. Refraction and lens-maker radii instead place the centre to the right of the vertex when positive. Consequently a biconvex lens has R1 > 0 and R2 < 0. Plane surfaces use infinite radius and zero reciprocal curvature. These conventions were checked in the solver, geometry conversion, drawings, result text and worked substitutions.

The following table applies independently to mirrors and thin lenses. Both ho = 2 cm and ho = 6 cm were executed.

| Device | f / cm | u / cm | v / cm | M | hi / cm for ho=2,6 | Characteristics |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Concave mirror / convex lens | +10 | 30 | +15 | -0.5 | -1, -3 | Real, inverted, diminished |
| Concave mirror / convex lens | +10 | 20 | +20 | -1 | -2, -6 | Real, inverted, equal size |
| Concave mirror / convex lens | +10 | 15 | +30 | -2 | -4, -12 | Real, inverted, enlarged |
| Concave mirror / convex lens | +10 | 5 | -10 | +2 | +4, +12 | Virtual, upright, enlarged |
| Convex mirror / concave lens | -10 | 20 | -6.6666667 | +1/3 | +0.6666667, +2 | Virtual, upright, diminished |

Additional independently checked results:

| Configuration | Expected and verified result |
| --- | --- |
| Refraction: n1=1, n2=1.5, R=+10 cm, u=40 cm | v=+60 cm, M=-1 |
| n1=1, n2=1.5, R=-10 cm, u=40 cm | v=-20 cm, M=+1/3 |
| n1=1.5, n2=1, R=-10 cm, u=40 cm | v=+80 cm, M=-3 |
| Equal indices, curved interface, u=40 cm | v=-40 cm, M=+1; exact directions unchanged |
| Planar interface, n1=1, n2=1.5, u=40 cm | v=-60 cm, M=+1 |
| Maker: 1.5/1.0, R1=+20 cm, R2=-20 cm | P=+5 m^-1, f=+20 cm |
| Maker: biconcave / plano-convex / plano-concave | f=-20 / +40 / -40 cm |
| Maker: R1/R2=15/30 cm, then 30/15 cm | f=+60 cm, then -60 cm |
| Maker index matched | P=0, f=infinite; no artificial focus |
| Two lenses: f1=f2=10 cm, u1=30 cm, d=35 cm | v1=15, u2=20, v2=20 cm; M1=-0.5, M2=-1, Mtotal=+0.5; final x=55 cm |
| Same lenses, d=10 cm | u2=-5 cm, v2=+3.3333333 cm; Mtotal=-1/3; final x=13.3333333 cm |
| Intermediate image in lens 2 plane | u2=0, v2=0, finite M=-0.5; explicit limiting state |
| First lens collimated / final collimation | ABCD limit avoids infinity-times-zero; final distance finite / explicit infinity, respectively |
| Glass-to-air critical angle | asin(1/1.5)=41.810315 degrees; 0,30,40,41.8102 degrees transmit; 41.8104 and 50 degrees undergo TIR |

Engine reference comparisons use absolute tolerance 1e-9 in SI/dimensionless values. Near-focal tests approach f from both sides by 1e-7 m and preserve the expected real/virtual sign. Exact focal states use null finite distances/heights and explicit infinity classifications, rather than fake image coordinates. Classification uses an equal-size tolerance of 1e-7; the documented solver singularity tolerance is relative to EPS=1e-10.

Browser checks allow the displayed rounding: v/hi to two decimal centimetres and M to three decimals. Actual SVG ray-to-image perpendicular distances are below 1e-7 SVG units; infinity cases require outgoing slope spread below 1e-10. Three independent finite-thickness traces at 10 micrometre thickness, 10 micrometre ray height and indices 1.2, 1.5 and 1.8 approach independently calculated thin-lens intercepts within 5.91 micrometres (3e-5 m acceptance). This is a limit check, not a claim that ordinary thick lenses focus at the thin marker.

`scripts/audit-numerics.mjs` produces **33 independent reference rows and 3 physical thin-limit traces**. Its JSON records inputs, expected values, actual outputs and errors. Snell/reflection tests use direction normalization, angle laws, surface membership and segment continuity as geometric invariants, rather than calling the solver twice as its own numerical oracle.

## Verified defects and corrective work

All entries below are corrected locally. Fixtures use engine metres unless centimetres are stated. Regression references name tests or workflows in the files defined above.

| ID / severity | Reproduction and root cause | Correction and regression evidence |
| --- | --- | --- |
| D01 Critical | A valid low-index thick lens can exit through its entry cap; the old tracer assumed the rear cap must be next. A side-entering ray could also pass the opaque rim. The precise asymmetric fixture is retained in A; a simple rim fixture is origin (-0.2,0.15,0), direction proportional to (1,-0.55,0), R1/R2=+0.2/-0.2, thickness 0.02, aperture 0.04. | `physics.js` tests entry rim and chooses the nearest hit among both caps and rim after entry. Same-cap exit applies the actual inside/outside indices; rim hit is absorbed. A cap-reentry and side-entry regressions; original Snell/continuity tests retained. |
| D02 Critical | Concave mirror f=3 cm, u=1 cm, h=8 cm, aperture=5.5 cm reflected rays arriving at the nonreflective back face. Reflection was applied without a face test. | `model.js` orients the reflective face toward the incident side and blocks back hits. A opaque-back-face regression. |
| D03 Critical | Mirror f=3 cm, u=1 cm, h=2 cm, aperture=5.7 cm: the pole-reflected ray re-hits the cap at (-2.4,-4.8) cm, but continued through it. | `model.js` terminates at the next opaque cap boundary. A checks both physical endpoints and terminal flag. Repeated mirror bounces remain an explicit model limit. |
| D04 High | Default two-lens bundle: a ray transmitted by lens 1 misses lens 2 and vanished. The second miss overwrote the valid first-lens outgoing state. Ideal 2D bundle misses also stopped at the second plane. | `model.js` preserves ambient propagation when lens 2 is missed; `render2d.js` continues the same straight line without another bend. A second-aperture regression, P continuity and E system workflows. |
| D05 High | R=-10 cm, u=1 cm, aperture=8 cm puts the source outside the intended incident region. Geometry was paused, but the normal explorer still computed exact angles with the presumed media. | `selectedSurfaceRay` returns null for paused physical geometry; angle card/exact path are suppressed and trace caption says paused. A paused-interface regression. |
| D06 High | Focal bench object=-30 cm, lens=+10 cm, screen=+30 cm rendered at -40,0,+20 cm in 3D. Both views recentered the physical apparatus around the lens; lens dragging used accumulating relative deltas. | Lens-local physics receives a world-coordinate offset in both renderers. Pointer anchors and numeric/keyboard handlers use absolute bench positions; the 2D transform is frozen during a drag. U checks actual 3D world positions and lens dragging; E checks actual independent 3D apparatus drags. |
| D07 High | Moving between u=30,v=15 cm and u=20,v=20 cm kept the screen arrow at a decorative fixed font size. | `presentation.js` uses a physical 13 by 15 cm SVG screen with tip position -v*ho/u; both apparatus screens share 15 cm height. U requires geometric heights 15 and 30 mm and ratio 2; P validates focus/defocus and virtual-image rejection. |
| D08 High | Production under `/geometrical-optics-lab/` requested root `/assets/...` and failed to start. | `vite.config.js` uses relative base `./`; test-only static server mounts the real `dist` below a prefix. U checks rendered 2D/3D and absence of 404 responses. Root preview remains covered by B. |
| D09 Medium | R=1e12 m, ray height=0.01 m: subtracting near-equal radii returned zero sag and no intersection. | `physics.js` rationalizes sag and uses vertex-local quadratic coefficients with stable roots. A checks expected sag 5e-17 m and a hit at t=0.4 m. This was an engine flat-limit case beyond normal UI radii. |
| D10 Medium | NaN/Infinity object height could leak into an otherwise finite image classification. | Finite input/output height validation in `imageResult`, `conjugate` and `sphericalRefraction`. A nonfinite-height regression. |
| D11 Medium | Clamped numerical inputs, sliders and dynamic bounds could disagree; blank input was not reliably restored. Static step values could also snap dragged values. | `main.js` synchronizes min/max/value/labels and restores committed values; paired controls use continuous steps. Bounds follow aperture and bench ordering. U out-of-range/blank/dynamic-bound workflow and original keyboard tests. |
| D12 Medium | Selected normal height 3.5 cm plus ArrowUp became 2.6 cm because the keyboard started at object height. | `render2d.js` anchors surface keys at `rayHeight`, mapping up/right and down/left consistently. U requires 3.6 cm. |
| D13 Medium | Input changes left an old mirror preset highlighted, and manual maker radii retained a contradictory named lens preset. Controls were only partly refreshed. | Every refresh synchronizes preset classes and shape selection. Manual radius/sign changes become Custom radii. U asserts updated highlights and both numeric/sign edits. |
| D14 Medium | A screen moved to 150 cm fell outside the automatically fitted bench; bounds included ideal markers but omitted the actual screen. | `sceneBounds` includes the screen's lens-local position and excludes image markers already omitted for excessive height; both views use these bounds. A requires coverage of object and distant screen. |
| D15 Medium | Two-lens virtual-object example placed final/intermediate labels on top of one another. Lens-1 prediction could also be mistaken for an image that physically forms after lens 2 intercepts it. The TIR angle caption crowded the pole label. | Both renderers offset intermediate labels; marker says Lens 1 alone, and stage text explains interception. The angle caption is separated vertically, and both views now use the same four near/far focal markers and prime notation in the two-lens experiment. E checks non-overlapping actual label rectangles and captures the mandatory two-lens/TIR cases. |
| D16 Medium | Measured 45-ray, two-lens, normals-on scene produced 338 draw calls. Each short line had its own geometry/material and draw submission. | `render3d.js` batches by color/dashes/opacity into LineSegments while preserving endpoint pairs. E verifies incident endpoints, bounded repeated-state resources, disposal and fewer than 150 draw calls. Measurements below record the actual before/after result. |
| D17 Low | Actual CSV contained floating-point tails such as 13.333333333333334 cm. | Export rounds to at most six decimal places in centimetres, retaining locale-independent numbers. U parses the actual downloaded file, checks headers/rows/references and disallows excess decimal tails. |
| D18 Low | Enabling normals omitted valid entry normals on clipped rays because the renderer continued before drawing their events. | Normals are drawn before terminal/miss status handling. E uses 45 rays with valid within-control geometry that includes clipped and TIR rays, and compares rendered normal count with all actual hit events. |
| D19 High | Two lenses with u1=11 cm, d=7 cm, h=8 cm and aperture=4 cm admitted a continuous interval of rays, but only one selected standard ray traversed both apertures. | `constructionRays` intersects the two clear-aperture intervals and adds distinct interior constructions when needed. A requires at least two complete distinct rays and independent final intersection; E checks actual SVG outgoing rays and the +9.12 cm final distance. |

Changed application sources: `src/physics.js`, `src/state.js`, `src/model.js`, `src/render2d.js`, `src/render3d.js`, `src/main.js`, `src/presentation.js`, `src/styles.css`. Supporting changes: `vite.config.js`, `playwright.config.js`, `scripts/check.mjs`, `.gitignore`, README and physics documentation. Added: A, U, E, `scripts/audit-numerics.mjs`, `scripts/audit-static-server.mjs`, this report and audit evidence. `package.json`, `package-lock.json` and original test files are unchanged.

## 2D, 3D, experiment and visual verification

2D checks inspect actual SVG coordinates, not merely element existence. The ten mandatory device cases have consistent outgoing intersections/backward extensions, signed values, image heights, nature and size. Two exact-focal configurations have parallel emerging rays and no finite image arrow. Virtual extensions are dashed; physical segments remain solid. Vertex-plane paraxial construction is identified explicitly; a curved silhouette does not imply exact cap refraction in that view.

3D source inspection and numerical tests establish analytic spherical/plane intersections, actual cap normals, normalized reflection, Snell entry/exit, finite-aperture stops and noncoplanar bundles. Small-axis rays agree with the paraxial regime. Wider rays retain aberration and finite-thickness focus shifts instead of being forced through an ideal marker. Refraction has one boundary; lenses have two caps plus an opaque rim. Two-lens paths carry the first lens's actual outgoing direction into the second. Batched rendering retains every tested endpoint pair. Image arrows are labelled as paraxial predictions.

The focal workflow covers sharp and defocused real images, inability to project a virtual image, geometric preview scaling, independent apparatus positions, dragging, data retention across views, recording/removing/clearing trials, current measured percentage error, mean and actual CSV contents. Independent downloaded records are (u,v,f)=(30,15,10) cm and (40,20,13.333333) cm; mean f=11.67 cm and current second-trial error=33.33%. The thin-element blur radius is a*abs(1+v/u-v/f); this documented model is not a photorealistic extended-source image or a fit to the finite-thickness tracer.

Prediction workflows accept correct and reject incorrect real, virtual and infinity answers after changing optical state. Complete control values and observations survive 2D→3D→2D in all four lens experiments; focal trial records survive too. Repeated resets and camera orbit/zoom/reset remain covered.

Screenshots are captured from the actual running production application in `docs/audit-evidence/screenshots/`, with full-page and panel versions. They cover concave-mirror real/virtual cases, convex mirror, convex-lens real/virtual cases, concave lens, interface/TIR, focal bench, maker, standard/virtual-object two-lens systems, 3D mirror/interface/lens, light/dark examples, laptop, tablet landscape and phone orientations. Actual screenshots were opened and visually reviewed, including contact sheets and full pages. This review found D13–D15; it was not replaced by a source-only appearance assessment.

The original responsive matrix covers 1600x1080, 1024x1100 and 390x844, three labs, two themes and two modes. Additional viewports are 1366x768, 1180x820 and 844x390. Tests check page overflow, actual keyboard focus/state, KaTeX errors and reduced-motion layouts. A touch-enabled mobile browser context sends actual touch start/move/end events. A deliberately unavailable WebGL context produces a clear toast and functional 2D fallback; expected errors in that injected failure are separate from normal console-error checks. No physical phone, Safari/Firefox or assistive-technology certification is claimed.

## Performance and resource measurements

Measurements use installed headless Microsoft Edge with SwiftShader software WebGL, one test worker and isolated profiles. The actual browser version and machine information are recorded in the evidence. CIM hardware inventory was denied by the sandbox; the environment record instead uses Node's read-only OS/CPU metadata. Local-load times are navigation timings; UI-update times include two animation frames, mathematics and layout; dense-scene updates include synchronous GPU completion. These are elapsed interaction measurements, **not frame-rate claims or hardware GPU benchmarks**.

| Measurement | Before batching: median / p95 / maximum, ms | Final: median / p95 / maximum, ms |
| --- | --- | --- |
| 2D parameter updates (20 samples) | 143.90 / 153.70 / 294.20 | 129.05 / 185.40 / 227.30 |
| 3D parameter updates (20 samples) | 426.05 / 579.00 / 803.30 | 344.95 / 410.60 / 582.40 |
| 45-ray two-lens update + GPU completion (25 samples) | 299.70 / 411.40 / 1045.00 | 297.00 / 388.60 / 868.20 |

The percentile uses nearest rank. The final dense scene measured **49 draw calls**, **31 live geometries and 9 textures** on each of ten identical updates; disposal returned both counts to **zero**. The earlier scene had 338 draw calls. The final scene additionally displays the full four-focus annotation set. Reduced submission count did not produce a proportional reduction in software-GPU elapsed time; dense rendering remains costly in this environment. These timings do not establish 60 fps or equivalent classroom hardware performance.

Local navigation measured DOMContentLoaded at **356.10 ms** and load completion at **379.80 ms**. Twelve repeated view cycles after warmup measured **39 listeners before and after**, DOM nodes **2248 to 2249**, and collected JavaScript heap **6,507,340 to 7,164,192 bytes**. These finite checks found stable listeners and complete GPU cleanup; small heap/cache growth is retained in the evidence rather than described as zero memory growth. Rendering is event driven, with no permanent animation loop and pixel ratio capped at 1.7.

Environment: Edge **155.0.4283.62**, Windows x64, Intel Core i5-10210U, 8 logical CPUs, approximately 12.7 GB total RAM, **SwiftShader software WebGL**. Dense component measurements use a 900x500 rendering surface; UI measurements use a 1366x768 viewport. The environment record captured only about 317 MB free memory, so these are resource-constrained local measurements, not controlled hardware benchmarks.

## Final execution and build

| Final check | Actual result |
| --- | --- |
| Unit/integration | **125 passed, 0 failed**: 83 original + 42 added |
| Browser | **81 distinct scenarios passed**: all 61 original + 20 added; no final failures, skips or flaky results |
| Static checks | Passed JavaScript syntax and full frontend curriculum-label scan |
| Independent numerical evidence | 33 reference rows + 3 physical thin-limit traces passed |
| Production build | Passed with the documented graphics chunk advisory |

Browser execution was staged honestly: the complete **80-scenario run passed in 5.8 minutes**; a subsequent **4-scenario run passed**, including the additional 3D apparatus workflow which brought the distinct count to 81. After the late partial-aperture correction, **8 affected scenarios passed** across both themes/views, numerical/SVG references and view preservation. A final fitting/screenshot check also passed. The followups repeat existing cases; they are not added to the distinct count. Every final source change was covered by the appropriate rerun, and the final 125-case unit run and production build passed after all changes. Individual states inside one workflow are not counted as separate test-runner scenarios.

This repository is JavaScript, not TypeScript. `npm.cmd run check` performs actual JS syntax checks and scans all frontend source/HTML for prohibited visible curriculum labels; no unexecuted `tsc` result is claimed. Dependencies are the existing lockfile installation: Vite 7.3.7, Three.js 0.180.0, KaTeX 0.16.47 and Playwright 1.64.1. Dependency manifests/lockfile were not changed or reinstalled unnecessarily.

A production build is required by the browser command. The graphics chunk remains approximately 514 kB minified / 128 kB gzip and triggers Vite's 500 kB advisory. This is a documented bundle-size limitation, not a hidden failed build. The suite checks production root assets, repository-prefix assets, source-component behavior, mathematics fonts and absence of external runtime requests. Test-only source/prefix servers are not required by the built application.

Filename-only environment/key checks and recognizable private-key/token-pattern scans found no matching project files; no secret contents were printed. `.env` patterns are now ignored defensively. Since `.git` is absent, tracked files, staged changes and historical secrets cannot be checked. This is an explicit limitation, not a claim that repository history is clean.

## Remaining model and verification limits

1. Numerical results and screen blur are paraxial/thin-element predictions; the physical tracer is finite-thickness and finite-aperture. Thick and marginal rays can have a different focus. This distinction is visible in the guide, model chips and 3D image labels.
2. The forward lens tracer starts before the complete first cap. Invalid or intersecting geometry pauses physical tracing with a reason while retaining valid ideal theory. Opaque rims absorb rays. Further re-entry/internal bounces and repeated mirror hits stop at the next boundary; arbitrary multiple-bounce paths are not simulated.
3. There is no Fresnel intensity splitting, material dispersion, diffraction or photorealistic screen-source integration. No unrelated wave optics was introduced. The single refracting cap is an intended bounded interface, not a glass sphere.
4. Very distant/large image arrows are omitted beyond display limits, with a range notice; numerical results remain available. Infinity is an explicit state. Finite render meshes approximate the analytic surfaces visually.
5. Trials are session-memory data until exported. Theme alone persists locally. Equations may scroll within their cards on narrow screens; internal experiment navigation also scrolls deliberately.
6. Software-WebGL timing does not establish ordinary-hardware frame rate. Physical devices, other browser engines and long-duration classroom hardware sessions remain unverified. GPU resource and listener checks cover the documented finite repetitions, not an indefinite leak guarantee.
7. Git/Vercel account configuration and deployment itself were deliberately not exercised. The project can be prepared for a new GitHub repository; repository/history checks will be meaningful only once one exists.

## Reproduction and evidence index

```powershell
npm.cmd test
npm.cmd run check
node scripts/audit-numerics.mjs
$env:OPTICS_AUDIT_OUTPUT = 'tmp/audit/final'
npm.cmd run test:browser
```

The suite temporarily uses ports 4173 (production), 4174 (source components) and 4175 (prefixed static build), then shuts them down. It defaults to the installed Edge executable; `OPTICS_BROWSER_PATH` may select another installed Chromium-family browser. These commands do not publish anything.

See the [durable evidence index](audit-evidence/README.md), [machine-readable validation summary](audit-evidence/validation-summary.json), [final unit output](audit-evidence/final-unit-tests.txt), [full browser results](audit-evidence/browser-full-80.json), [final targeted results](audit-evidence/browser-two-lens-8.json), [numerical references](audit-evidence/numerical-validation.json), [actual CSV](audit-evidence/actual-focal-trials.csv), [performance measurements](audit-evidence/performance-final.json), and [inspected curriculum rendering](audit-evidence/curriculum-page-11.png). Baseline/diagnostic source snapshots and failure traces remain in `tmp/audit/`. There are 46 final screenshot files: 23 actual optical/layout states with full-page and panel captures. Most use the production preview; the additional 3D apparatus/focal-marker capture uses the development server's actual application. Original reports and evidence remain available.

Hosting guidance was checked against the primary [Vite production build documentation](https://vite.dev/guide/build), [Vite static deployment guide](https://vite.dev/guide/static-deploy.html) and [Vercel build configuration documentation](https://vercel.com/docs/builds/configure-a-build). A future Vercel project can use the Vite preset, `npm ci`, `npm run build`, output `dist`. GitHub Pages likewise needs the built `dist` and a build workflow. Relative asset URLs were actually tested locally; no hosted deployment is implied.
