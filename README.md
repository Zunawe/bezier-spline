# bezier-spline

> Creates splines from cubic bezier curves.

[![Build Status](https://travis-ci.org/Zunawe/bezier-spline.svg?branch=master)](https://travis-ci.org/Zunawe/bezier-spline) [![Coverage Status](https://coveralls.io/repos/github/Zunawe/bezier-spline/badge.svg?branch=master)](https://coveralls.io/github/Zunawe/bezier-spline?branch=master) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This module fits a spline to a set of knots. The curves used are cubic Bezier curves, and their connections are smooth to the second dimension (i.e. position, slope, and concavity are continuous on the spline's domain).

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

A large part of the point of this module is to be able to locate points on the spline by coordinate. For example, if we want to find where the spline above passes through `y = 3.14`:

```js
spline.getPoints(1, 3.14)
[ [ 0.86, 3.1400000000000006 ] ]
```

Or where `x = 0.5`:

```js
spline.getPoints(0, 0.5)
[ [ 0.4999999999999992, 4.716223173379369 ],
  [ 0.49999999999999994, 3.5 ] ]
```

Notably, the results are not exact. We're dealing with lots of floating point addition and inverting functions twice, so this is expected. These splines are designed for graphical use; not mathematical.

### Bezier Curves

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
