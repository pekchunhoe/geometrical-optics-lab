# Physics architecture and numerical conventions

## One authoritative state

`src/state.js` owns the lab, lens experiment, parameters, visibility options, theme, and view. Each experiment has independent parameters. `compute()` generates one optical snapshot used by results, equations, the educational explanation, and both renderers. View selection does not reset that snapshot's parameters.

`src/physics.js` has no DOM, WebGL, or UI dependency. It can be imported by Node's built-in test runner. `src/model.js` turns the snapshot into optical elements, ideal construction rays, exact spatial bundles, image markers, and diagram bounds.

`src/render2d.js` draws SVG, handles pointer dragging and keyboard manipulation, and scales labels for the available viewport. `src/render3d.js` uses Three.js with OrbitControls and the exact paths from the model. `src/presentation.js` owns KaTeX formulas, controls, observations, and educational copy. `src/main.js` connects these modules and manages the page lifecycle.

## Units and coordinates

All engine distances are in metres; angles are in radians; refractive indices and transverse magnification are dimensionless. UI lengths are normally centimetres, screen blur is millimetres, and optical power is inverse metres (dioptres). Conversion happens at the UI boundary.

The internal Cartesian x axis increases to the right. The initial real object is at x = -u with u > 0. The first ideal element is at x = 0. Light initially travels toward increasing x.

Image distance v follows the curriculum real-image convention: v > 0 means a real image, v < 0 means a virtual image. Its Cartesian location is x = -v for a mirror, x = v for a transmitting element, and x = d + v2 after the second lens. Positive magnification means upright, negative magnification means inverted.

## Paraxial solvers

| Function | Equation and special handling |
| --- | --- |
| `conjugate(f,u,h)` | `1/v = 1/f - 1/u`, `M = -v/u`, `hi = M ho`. Initial real objects require positive u. The signed-object option is only used internally for a second lens. |
| `sphericalRefraction(n1,n2,R,u,h)` | `n2/v = (n2-n1)/R - n1/u`; lateral magnification is `M = -n1 v/(n2 u)`. Equal indices give v = -u and M = 1, with zero optical power. |
| `lensMaker(nLens,nMedium,R1,R2)` | `P = (nLens/nMedium - 1)(1/R1 - 1/R2)`; `f = 1/P`. Thickness does not enter this equation. A plane is an infinite radius with zero reciprocal curvature. Zero power is an explicit state. |
| `twoLens(f1,f2,u1,d,h)` | Computes `v1`, `u2 = d-v1`, `v2`, and transverse magnifications. An independent ABCD transfer calculation supplies the final image and total magnification even when an intermediate image is at infinity or in the second lens plane. |
| `screenSpot(u,f,a,s,h)` | The aperture footprint radius is `a |1 + s/u - s/f|`; its centre is `-s h/u`. A sharp projectable image requires a finite real conjugate and positive screen distance. |

The equations in this developer document use plain text for code correspondence. The application uses KaTeX with fractions, subscripts, Greek letters, proper SI units, and MathML output.

### Element-specific signs

For mirrors, the curriculum radius is R = 2f: concave f/R positive, convex f/R negative. The exact spherical cap uses Cartesian radius **-2f**, so its centre is on the correct side of the mirror.

For spherical refraction and lens maker calculations, a positive radius means the sphere centre is to the right of the vertex. A standard biconvex lens has R1 > 0 and R2 < 0. These radius signs are never copied from the mirror convention.

The image-formation and focal-length physical lenses use equal and opposite radii derived from their requested thin focal length and relative index. Changing the physical index in image formation changes the radii to preserve the selected ideal focal length. The lens maker experiment instead exposes both radii independently.

### Infinity and degeneracy

An inverse conjugate within a scale-aware tolerance of zero produces `{kind:'infinity',v:null,m:null,hi:null}`. The renderers never turn this into an arbitrarily distant image. A finite, very distant image remains a finite numerical result; arrows beyond 3 m or 0.5 m in height are omitted with a diagram notice. The algebraic focal length can be infinite when optical power is zero.

Invalid parameters return explanatory invalid states. Directions must have a finite, nonzero length. Initial distances are restricted to positive values. UI inputs constrain meaningful ranges, and geometry validity is checked separately from paraxial solvability.

For two lenses the object-to-second-lens ray transfer has

```text
A = 1 - d/f1
B = u1 + d(1 - u1/f1)
C = -1/f1 - A/f2
D = 1 - u1/f1 - B/f2
v2 = -B/D
Mtotal = 1/D
```

The determinant is one. When D = 0 the final image is at infinity. This avoids undefined products of intermediate zero and infinite magnifications. If lens 1 supplies a collimated bundle, the final transverse magnification is still obtained from the transfer matrix; separate intermediate transverse magnifications are not fabricated.

Roundoff-sized second-object and final-image distances are normalized to zero. When the intermediate image lies in the second ideal lens plane, the output carries an explicit `atElement` marker and the UI says “Image in the lens plane.” The rays genuinely intersect in that ideal plane; the magnification is finite. This boundary is distinguished from a negative-distance virtual image.

## Exact 3D tracing

An optical spherical cap is specified by vertex x, signed Cartesian R, and circular aperture radius a. Its surface is

```text
x(rho) = vertex + R - sign(R) sqrt(R² - rho²)
rho = sqrt(y² + z²)
```

The implementation evaluates sag using a rationalized expression, and uses vertex-local quadratic coefficients with stable roots to avoid cancellation as curvature approaches zero. The ray/sphere quadratic supplies candidate positive distances. Each candidate is tested against the near-vertex branch and circular aperture; the far side of a complete sphere is rejected. An infinite-radius cap is intersected as a plane. A surface normal is derived from the actual sphere centre and hit point.

Reflection uses `r = d - 2(d·n)n`. Refraction orients n against the incident direction, sets `eta = nFrom/nTo`, and evaluates

```text
k = 1 - eta²(1 - cos²(theta1))
t = eta d + (eta cos(theta1) - sqrt(k)) n
```

Negative k means total internal reflection: the reflected direction is used and no transmitted direction is invented. Both directions are normalized, and measured angles use the local normal.

The refraction lab traces **one spherical boundary**. It does not model a second sphere surface. A physical lens has two spherical/planar caps joined by a finite aperture rim. Entry is tested against the first cap and the opaque rim. After entry, the nearest positive intersection among both caps and the rim determines the next boundary; a grazing ray can exit through the cap it entered. Medium indices change only at the actual interfaces. Rays that leave the clear aperture are clipped at the cylindrical aperture stop. An internal reflected ray or further re-entry is followed to the next physical boundary and then terminated rather than drawn through that boundary without refraction. Mirrors block their nonreflective back face and stop reflected rays at any subsequent cap hit.

The two-lens physical system propagates the emerging direction from the first lens into the second physical lens. A ray missing lens 2 continues without another deflection in the surrounding medium. The lens-1-only image marker is a prediction which is intercepted if lens 2 comes before its plane. Ideal 2D paths instead use thin-element transfer at each lens. The default 2D construction chooses multiple rays that fit both apertures when available; it does not insist on a principal ray that has been clipped by the second lens.

## Geometry and display contracts

- Spherical aperture radius must be smaller than the sphere radius.
- Lens thickness must remain positive throughout the aperture; sampled radial gap checks reject crossing cap surfaces.
- Physical lenses cannot overlap, and the source must be before the whole first cap. The observation screen must lie beyond the physical rear vertex.
- Paraxial image markers are predictions. Marginal physical rays are never redirected toward those markers.
- Virtual extensions are dashed and propagate backward only as constructions. They are not counted as physical transmitted rays.
- All mesh geometry, materials, label textures, listeners, and WebGL contexts are disposed when replaced or when the view is closed.
- Spatial line segments are batched by color, dash style and opacity; every original endpoint is preserved.
- Focal-bench renderers add the lens position to the lens-local physics coordinates, keeping object/lens/screen positions in a fixed bench frame. The projected arrow scales with the actual paraxial magnification on a 13 cm by 15 cm screen.
- CSV measurements use centimetres rounded to at most six decimal places to remove floating-point tail noise.
- Rendering is event-driven. Parameter changes, camera controls, resize, and visibility restoration trigger rendering; there is no permanent animation loop.
- Pixel ratio is capped at 1.7; spatial bundles range from 5 to 45 rays. No hardware frame-rate claim is made.

## Scientific references

The supplied curriculum PDF was read and its actual page 11 was rendered and examined. It is the source for the required equations, signs, and learning outcomes.

Additional implementation references: [OpenStax: spherical mirrors](https://openstax.org/books/university-physics-volume-3/pages/2-2-spherical-mirrors), [OpenStax: images formed by refraction](https://openstax.org/books/university-physics-volume-3/pages/2-3-images-formed-by-refraction), and [official Three.js OrbitControls documentation](https://threejs.org/docs/pages/OrbitControls.html).
