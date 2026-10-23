# Geometrical Optics Lab

A complete browser-based teaching laboratory for spherical mirrors, one spherical refracting boundary, and thin lenses. Everything runs locally: the physics engine, diagrams, 3D ray tracing, mathematical typesetting, and experimental data collection. The application makes no requests to external services.

## Run locally

Use Node.js 22.12 or newer (validated here with Node.js 24.18). From PowerShell:

```powershell
Set-Location -LiteralPath 'D:\Physics Simulation Sem 2\Geometrical Optics Lab'
npm.cmd ci
npm.cmd run dev
```

Open the printed local URL, normally **http://127.0.0.1:5173**. The `npm.cmd` spelling avoids PowerShell script-execution-policy issues. Dependencies are already installed in this workspace.

To build and serve the self-contained production application:

```powershell
npm.cmd run build
npm.cmd run preview -- --port 4173
```

Open **http://127.0.0.1:4173**. The generated `dist/` directory can be served by any static HTTP server. Opening `index.html` directly with a `file:` URL is not supported because the application uses ES modules.

## Laboratories

| Laboratory | Interactive investigations |
| --- | --- |
| Spherical Mirrors | Concave and convex mirrors; draggable object distance and height; adjustable focal length and aperture; image-position presets; principal rays, virtual extensions, curvature and focus markers; exact reflection from a spherical cap in 3D. |
| Spherical Refraction | Exactly one interface; convex and concave surfaces; signed radius; adjustable refractive indices; selectable surface normal and incident-ray height; exact Snell angles; matched-index and total-internal-reflection cases; spatial refracted bundles. |
| Thin Lenses: Image Formation | Convex and concave lenses; standard image-position presets; object dragging; signed focal length and magnification; 3D refraction at both surfaces of a finite physical lens. |
| Thin Lenses: Focal Length Experiment | Illuminated object, movable lens and screen, bench positions, geometric screen blur, measured focal length, percentage error, removable trials, mean focal length and CSV export. |
| Thin Lenses: Lens Maker Explorer | Indices, two signed radii, plane surfaces represented by infinite radius, aperture and thickness; biconvex, biconcave, plano-convex, plano-concave, and positive/negative meniscus shapes; thin power and focal length. |
| Thin Lenses: Two-Lens Optical System | Independent positive focal lengths, separation and object distance; first image and signed second object distance; real and virtual intermediate-object cases; total magnification; full paths through both ideal elements or four physical interfaces. |

There are exactly three top-level laboratory tabs. All four lens experiments remain inside Thin Lenses. Switching 2D/3D preserves optical parameters and observations. Experiment settings remain separate when navigating between labs.

## Controls and learning tools

- Drag the blue object tip horizontally and vertically, or use the labelled sliders and numerical inputs.
- In 2D, focus the object or bench handles and use arrow keys; Shift increases the movement step.
- In 3D, drag empty space to orbit, use the wheel/pinch to zoom, and right-drag to pan. Apparatus handles can also be dragged.
- Use Display for rays, spatial bundles, extensions, axis, focal/curvature points, labels, normals, angle measurements, image markers, measurements, ray density, and an alternative color palette.
- Use Fit view to restore the diagram scale or reset the camera. Reset lab restores only the current experiment.
- Follow the live KaTeX equations and image explanations. Predict the Image checks nature, orientation, and size against the current shared physics state.
- The in-app Signs & Simulation Guide explains coordinate conventions, model differences, screen measurements, and physical limits.

## Validation

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run test:browser
```

The browser command builds the application, starts temporary production, source-component, and repository-subpath test servers, runs Playwright, and stops those servers. It defaults to the installed Windows Microsoft Edge executable. To use a different installed Chromium-family browser:

```powershell
$env:OPTICS_BROWSER_PATH = 'C:\path\to\chrome.exe'
npm.cmd run test:browser
```

The test suite uses an isolated headless browser profile and software WebGL. It does not access personal browser profiles. The JSON report is written to `tmp/browser-results.json`; screenshots are in `tmp/screenshots/`. Failed tests retain traces in `tmp/browser-artifacts/`.

See [the independent final audit](docs/FINAL-OPTICS-AUDIT-REPORT.md) for current results and corrections. The [completion and validation report](docs/COMPLETION-REPORT.md) is retained as historical implementation evidence. See it for the curriculum audit, numerical results, tolerances, executed checks, file inventory, and limitations. See [the physics architecture](docs/PHYSICS.md) for sign conventions and ray-tracing details.

## Model limits

The 2D constructions and numerical image results are paraxial. They bend rays at an ideal vertex plane. Curved silhouettes identify apparatus and lens shape; the exact 3D tracer uses actual spherical intersections. A finite-aperture or finite-thickness physical lens can focus away from the ideal prediction. The image arrows in 3D explicitly mark that paraxial prediction.

The screen sharpness model uses the thin-element circle of confusion, rather than a photorealistic rendering of an extended incoherent source. It is calculated from aperture and screen displacement, and a virtual image is never treated as sharply projectable.

Invalid physical geometry pauses 3D tracing with an explanation while the ideal calculation remains available. This includes intersecting lens surfaces, overlapping lenses, and a source or screen inside the physical apparatus. The forward lens tracer requires the source to be left of the entire first cap. An aperture stop terminates rays at the lens rim. The next lens boundary is selected from both caps and the aperture rim. An opaque rim absorbs rays; rays missing the second lens continue in the surrounding medium. A further lens re-entry, internal bounce, or second mirror hit stops at the next physical boundary. Repeated bounces and Fresnel intensity splitting are not modeled.

The application has no backend, account system, deployment integration, or paid API. Trials remain in session memory until exported. Only the theme preference is saved in local storage. No Git commits, GitHub pushes, or deployments are part of this project setup.

## Static hosting

The build uses relative asset URLs and is tested both at the HTTP root and below a repository prefix. For a future Vercel project use the Vite preset, `npm ci`, build command `npm run build`, and output directory `dist`. GitHub Pages also needs a build step and should publish `dist`, not the source directory. No deployment or repository changes are performed by the audit.

Run `node scripts/audit-numerics.mjs` for independent reference tables. Set `OPTICS_AUDIT_OUTPUT` to choose an evidence directory for browser JSON, actual CSV and performance measurements. Final representative screenshots are in `docs/audit-evidence/screenshots/`.
