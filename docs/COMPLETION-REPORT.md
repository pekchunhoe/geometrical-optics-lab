# Completion and validation report

## Delivered application

The previously empty project now contains a self-contained Vite application, a reusable optical engine, interactive SVG diagrams, a genuine Three.js optical laboratory, KaTeX equations, educational feedback, a measurement experiment, and automated validation. The work is local only. No Git repository was initialized, no commit or push was made, and nothing was deployed.

The application is limited to Spherical Mirrors, Spherical Refraction, and Thin Lenses. Its interface contains no curriculum identifiers or numbered curriculum headings.

## Features by laboratory

| Laboratory | 2D functionality | 3D functionality |
| --- | --- | --- |
| Spherical Mirrors | Concave/convex selector; draggable object distance/height; adjustable focal length/aperture; valid principal and fallback rays; real/virtual images; F, C and P; signed measurements; presets spanning the focal boundary. | Curved spherical mirror cap; vector reflection at actual surface hits; spatial bundles; aperture clipping; local normals; orbit/zoom/pan; predicted image and focal/curvature markers. |
| Spherical Refraction | One spherical interface; signed radius and indices; ideal image-construction rays; selected exact surface ray; local-normal explorer; incident/refracted angles; real/virtual state; equal-index and TIR investigations. | One actual curved boundary with distinct media; spatial Snell refraction; exact normals; high-angle TIR; adjustable curvature, indices, object and aperture; predicted paraxial image. |
| Thin Lenses | Convex/concave image formation; focal-length bench; lens maker explorer; two-lens system; live numerical substitutions, magnification, classifications, object dragging and aperture-aware ray paths. | Genuine two-interface spherical/planar lenses with finite thickness and circular apertures; index-aware propagation through each cap; physical two-lens system; lens shapes matching maker controls; movable bench apparatus and screen. |

All laboratories support both themes, shared optical parameters when switching views, visibility controls, diagram fit/camera reset, current-experiment reset, accessible numerical inputs, and a state-based prediction challenge. Mobile layouts put the visual experiment before controls and observations. The mathematical panels remain horizontally scrollable inside their cards where necessary, without page overflow.

### Lens experiments

- **Image Formation:** positive and negative focal lengths, standard construction rays, virtual extensions, magnification and image height, converging-lens presets, and separate near/far real-object presets for diverging elements.
- **Focal Length Experiment:** object/lens/screen positions, bench ruler, geometrically calculated screen blur, sharpness feedback, measured focal length, ideal comparison, percentage error, multiple trials, trial removal/reset, mean focal length, and CSV export.
- **Lens Maker Explorer:** material/surrounding indices; two signed radii; infinite radius for a plane; aperture and physical thickness; six standard shapes; optical power, focal length, index ratio and curvatures. Thickness is excluded from the thin maker equation.
- **Two-Lens Optical System:** independent f1 and f2, object distance/height, separation, intermediate image, signed u2, final image, component and total magnifications, ray transfer at singular intermediate states, and full physical propagation when the apertures admit it.

## Curriculum verification and outcome coverage

The actual supplied document, `C:\Users\User\Downloads\Telegram Desktop\Curriculum Specifications (CS) Physics SP025.pdf`, was opened. It has 14 pages. Physical PDF page 11 is also printed page 11. Its equations, signs, and learning-outcome text were extracted; a full-page rendering was visually examined. The rendering is retained in `tmp/pdfs/curriculum-page-11.png` for this workspace.

| Required outcome from page 11 | Implementation |
| --- | --- |
| Spherical mirror radius and focal length | Signed R = 2f, live result, sign guide and curvature/focus markers. |
| At least two construction rays and image characteristics | Principal plus nondegenerate fallback rays, object dragging, image classification and presets. |
| Mirror equation for a real object | Pure `conjugate` solver with positive initial u and signed f/v. |
| Mirror transverse magnification | M = -v/u and hi = M ho, with orientation and size feedback. |
| Spherical-refraction equation and convex/concave radius signs | `sphericalRefraction`, explicit Cartesian radius conversion, signed controls and worked substitution. |
| Thin-lens equation for a real object and signed convex/concave f | Shared ideal solver, positive initial u, positive/negative focus controls by lens type. |
| Convex-lens focal-length determination | Movable optical bench, geometric focus criterion, recorded u/v trials and f = uv/(u+v). |
| Lens maker equation | Relative-index formula with independently signed radii and true planar limits. |
| Lens magnification | Component/total magnification and signed image height. |
| Combination of two convex lenses | Sequential conjugates, u2 = d-v1, virtual-object handling and robust ray-transfer limits. |

No wave-optics experiment or unrelated curriculum module was introduced.

## Equations and conventions

All calculations use metres internally. Displayed centimetres and millimetres are converted at the UI boundary. For an initial real object u > 0, v > 0 denotes a real image and v < 0 a virtual image. M > 0 is upright; M < 0 is inverted.

Mirror f/R are positive for concave and negative for convex. The Cartesian mirror sphere uses radius -2f. Refraction and lens maker radii are positive when their sphere centre is to the right of the vertex. Biconvex radii have R1 > 0 and R2 < 0. A plane is infinite radius, never zero radius.

Implemented equations are the mirror/thin-lens conjugate, R = 2f, signed magnification, spherical refraction and its lateral magnification, relative-index lens maker power, sequential two-lens conjugates, vector reflection, vector Snell refraction, and the aperture-derived screen blur radius. See [PHYSICS.md](PHYSICS.md) for the exact formulas and architecture.

## Numerical evidence

The following values are calculated by the engine and checked by the automated suite. Values here are rounded for reading.

| Case | Inputs | Calculated result |
| --- | --- | --- |
| Concave mirror, real diminished | f = 10 cm, u = 30 cm | v = 15 cm; M = -0.5; real, inverted, diminished. |
| Concave mirror, virtual enlarged | f = 10 cm, u = 5 cm | v = -10 cm; M = +2; virtual, upright, enlarged. |
| Convex mirror / concave lens | f = -10 cm, u = 20 cm | v = -6.6667 cm; M = +0.333333; virtual, upright, diminished. |
| Focal boundary | f = u = 10 cm | Explicit image-at-infinity state; no finite v, M, or hi is drawn. |
| Spherical refraction | n1 = 1, n2 = 1.5, R = 10 cm, u = 40 cm | v = 60 cm; M = -1. |
| Negative-radius refraction | n1 = 1, n2 = 1.5, R = -10 cm, u = 40 cm | v = -20 cm; M = +0.333333. |
| Matched indices | n1 = n2 = 1.5, R = 10 cm, u = 40 cm | v = -40 cm; M = +1; zero power; exact directions unchanged. |
| Convex lens | f = 10 cm, u = 30 cm | v = 15 cm; M = -0.5. |
| Lens maker | nLens = 1.5, nMedium = 1, R1 = +0.20 m, R2 = -0.20 m | P = 5 D; f = 0.20 m. |
| Two lenses | f1 = f2 = 10 cm, u1 = 30 cm, d = 35 cm | v1 = 15 cm; u2 = 20 cm; v2 = 20 cm; Mtotal = +0.5. |
| Virtual object for lens 2 | f1 = f2 = 10 cm, u1 = 30 cm, d = 10 cm | u2 = -5 cm; v2 = 3.33333 cm; Mtotal = -0.333333. |
| Collimated intermediate bundle | f1 = f2 = u1 = 10 cm, d = 35 cm | v1 at infinity; v2 = 10 cm; Mtotal = -1. |
| Screen at the ideal real image | f = 10 cm, u = 30 cm, screen v = 15 cm | Aperture footprint radius = 0; sharp real projection. |

### Tolerances

Ordinary numerical equation, vector, continuity, and Snell checks use absolute tolerance 1e-9 in their corresponding SI/dimensionless quantities. The mirror near-axis comparison uses 1e-7 m, refraction uses 1e-6 m, and a physically thin two-interface lens uses 1e-5 m. These latter tolerances admit the intentionally small finite ray height/thickness used to approach the paraxial limit. The critical-angle direction check allows 1e-7 rad near its square-root singularity.

The solver uses a scale-aware inverse-distance threshold based on 1e-10 to represent exact/near focal singularities. These are numerical contracts, not claims about experimental measurement accuracy.

## Executed validation

The completed validation on 23 October 2026 produced these results:

| Check | Result |
| --- | --- |
| Unit, physics, geometry, model and mathematical-presentation tests | **83 passed; 0 failed.** |
| Complete production-build browser suite | **61 passed; 0 failed, skipped or flaky.** |
| Additional optical tracing regression run | **17 passed; 0 failed.** |
| Final SVG display regression run | **24 passed; 0 failed.** |
| Exact zero-distance two-lens boundary recheck | **1 passed; 0 failed.** |
| JavaScript syntax and presentation-label checks | **Passed.** |
| Production build | **Passed.** The Three.js chunk size advisory remains documented below. |

The complete 61-case run was followed by checks targeted to the final corrections: every 2D display case after the SVG stroke-width adjustment, and the zero-distance two-lens boundary after roundoff normalization. Full-suite evidence is retained in `docs/validation/browser-full.json`; optical, SVG and boundary regressions have separate JSON reports in the same directory. Unit-test output is retained in `docs/validation/unit-tests.txt`.

The reproducible commands are:

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run test:browser
```

The browser suite covers 36 combinations of three labs, two views, two themes and three viewport sizes; 12 desktop combinations for the three additional lens experiments, both views and both themes; and interaction tests. It checks state preservation, finite drawing coordinates at focal boundaries, virtual extensions, actual object dragging, Snell/TIR feedback, focal trials/export, all six lens shapes, zero power, signed second objects, prediction feedback, display options/reset, camera orbit/zoom/reset, major parameter controls, invalid geometry, keyboard manipulation, advanced mobile experiments, and absence of external network requests.

Automated viewports: desktop 1600 x 1080, tablet 1024 x 1100, mobile 390 x 844. The browser is installed Microsoft Edge, launched headlessly in a fresh profile with software WebGL. This validates browser behavior and responsive layouts; it is not a physical-device or GPU frame-rate benchmark.

JSON results: `tmp/browser-results.json`. Screenshots: `tmp/screenshots/`. Failed test traces are retained under `tmp/browser-artifacts/` when present. The final selected screenshots are copied into `docs/screenshots/`.

Selected visual previews: [desktop dark](screenshots/desktop-dark.png), [desktop light](screenshots/desktop-light.png), [3D mirror](screenshots/mirrors-3d.png), [spherical refraction](screenshots/refraction-2d.png), [3D refraction](screenshots/refraction-3d.png), [3D lens](screenshots/lenses-3d-light.png), [two-lens construction](screenshots/two-lenses-2d.png), [mobile refraction](screenshots/mobile-refraction.png), and [mobile two-lens lab](screenshots/mobile-two-lenses.png).

## Known limitations and assumptions

1. Standard image results and 2D constructions are paraxial, using an ideal vertex plane. They do not claim exact marginal-ray convergence.
2. The 3D finite-thickness physical lens may focus away from its thin prediction. Its image arrow is labelled as paraxial; rays are never forced toward it.
3. Screen sharpness and its preview use a thin-element circle-of-confusion approximation, not full radiometric imaging of an extended source. A virtual image is not marked projectable.
4. Refraction models one interface. A lens models two cap interfaces and an aperture rim. Repeated internally reflected bounces, absorption and Fresnel intensity splitting are outside this model. A reflected internal segment is followed to the next boundary and terminated there.
5. Image arrows farther than 3 m or taller than 0.5 m are omitted with a range notice; numerical results remain available. Infinity is a distinct state.
6. Trials are stored only in the current session, with CSV export for retention. The theme is the only persistent browser preference.
7. Browser validation used emulated viewport sizes and software WebGL. No physical phone/tablet test, manual screen-reader audit, or measured 60 fps benchmark is claimed.
8. Vite emits a size advisory for the approximately 514 kB uncompressed Three.js chunk (about 128 kB gzip). This does not fail the production build. Fonts, mathematics and graphics are bundled locally.

There are no known missing curriculum learning outcomes. The limits above describe the implemented optical model and the scope of verification.

## New files and their roles

| Files | Purpose |
| --- | --- |
| `package.json`, `package-lock.json` | Reproducible dependencies and local run/build/test commands. |
| `index.html`, `public/favicon.svg` | Application entry point, metadata and local icon. |
| `vite.config.js`, `playwright.config.js`, `.gitignore` | Build/watch settings, isolated production browser test setup and generated-file exclusions. |
| `src/physics.js` | Pure SI-unit optical equations, classification, vector laws, cap/rim intersections, physical lens tracing and screen model. |
| `src/state.js` | Per-experiment parameters, geometry validation and shared computed snapshot. |
| `src/model.js` | Ideal constructions, exact spatial ray bundles, optical elements, markers and diagram bounds. |
| `src/render2d.js`, `src/render3d.js` | Interactive SVG diagrams and true spatial optical laboratory. |
| `src/presentation.js`, `src/main.js`, `src/styles.css` | KaTeX calculations, UI, feedback, accessibility, themes and responsive layout. |
| `tests/physics.test.js`, `tests/presentation.test.js` | Physics, geometry, model integration and mathematical rendering validation. |
| `tests/browser/lab.spec.js`, `scripts/check.mjs` | Responsive/interaction browser checks, JavaScript syntax and label checks. |
| `README.md`, `docs/PHYSICS.md`, this report | Launch instructions, scientific architecture, curriculum audit, evidence and assumptions. |
| `dist/` | Complete generated production application with bundled local dependencies and fonts. |

All project work was confined to the requested Geometrical Optics Lab directory. The supplied PDF and pasted brief were read without modification. No unrelated simulation project was edited.
