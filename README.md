# bezier-spline

> Creates splines from cubic bezier curves.

[![Build Status](https://travis-ci.org/Zunawe/bezier-spline.svg?branch=master)](https://travis-ci.org/Zunawe/bezier-spline) [![Coverage Status](https://coveralls.io/repos/github/Zunawe/bezier-spline/badge.svg?branch=master)](https://coveralls.io/github/Zunawe/bezier-spline?branch=master) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This module fits a spline to a set of knots. The curves used are cubic Bezier curves, and the spline is G2 continuous. It is possible to specify C2 continuity as well if desired.

The theory behind the spline is not documented in the code, as it is too lengthy. Instead, the source code repository contains a PDF as well as a README in the `theory/` directory that will give a better understanding of exactly what all that minified-looking source code is doing.

## Install

```sh
$ npm install bezier-spline
```

## Usage

To create a spline, pass in knots. For `n` knots, `n-1` curves will be produced.

```js
const BezierSpline = require('bezier-spline')

let spline = new BezierSpline([
	[1, 3],
	[0, 4],
	[5, 5]
])
```

You can access the control points of each curve with the `curves` property. Curves are array-like with 4 elements, which are control points.

```js
let bezier0 = spline.curves[0]
bezier0[0]                // The first knot
bezier0[1]                // The first generated control point
bezier0[2]                // The second generated control point
bezier0[3]                // The second knot

console.log(bezier0[0])   // [ 1, 3 ]
```

These points can then be fed to an api that understands cubic Bezier curves.

A large part of the point of this module is to be able to locate points on the spline by coordinate. For example, if we want to find where the spline above passes through `y = 3.14`:

```js
spline.getPoints(1, 3.14)
[ [ 0.8369150530498445, 3.1399999999999997 ] ]
```

Or where `x = 0.5`:

```js
spline.getPoints(0, 0.5)
[ [ 0.4999999999999999, 3.438251607472109 ],
  [ 0.5000000000000002, 4.73728665361036 ] ]
```

Notably, the results are not exact. We're dealing with lots of floating point addition and inverting functions twice, so this is expected. These splines are not designed for precise mathematics.

#### Weights

IMPORTANT: You may want to read what's in the `theory/` directory in the source code repository to get a better sense of exactly what the effect of these changes will be.

You can provide an optional second argument to the `BezierSpline` constructor to set the scalar of the "initial speed" coming out of a knot. This argument may either be a function of the form
```ts
(i: number, knots: Array) => number
```
or an array of numbers that are precalculated weights. `i` will be the index of the segment you are about to enter, and will start at `1`. The first segment is constrained by other restrictions and its weight cannot be set. The first element of the array, if that is what is provided instead, will be ignored. Here are some examples:

```js
// Smooth transitions regardless of knot distances.
// Good for shapes. Bad for pathing/animation
new BezierSpline([[1, 1], [3, 4], [-1, 2]])

// C2 continuous spline. Ideal for pathing or animation
// but shape may not be ideal.
new BezierSpline([[1, 1], [3, 4], [-1, 2]], () => 1)

// Kinda nonsensical, but segments may get wilder
// or more curved for knots lower in the list.
new BezierSpline([[1, 1], [3, 4], [-1, 2]], (i) => i)

// Precalculated weights if you want very direct control
// over tweaking how fast a segment is.
new BezierSpline([[1, 1], [3, 4], [-1, 2]], [null, 1, 4])
```

If you're not fully sure what's happening here, please read `theory/README.md`. As a general rule, the lower a weight is, the straighter the segment will be.

#### Bezier Curves

Individual curves can be solved similarly if necessary. `at` plugs in a clamped `t` value to the cubic Bezier equation.

```js
// Yeah, it's not a very curvy curve, but it makes the math easy
let curve = new BezierSpline.BezierCurve([
	[0, 0],
	[1, 1],
	[2, 2],
	[3, 3]
])

curve.at(0.5)
[ 1.5, 1.5 ]
```

And inversely, you can solve for the `t` values that correspond to particular values along an axis:

```js
curve.solve(0, 1.5)
[ 0.5 ]
```
