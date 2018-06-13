# bezier-spline

> Creates splines from cubic bezier curves.

[![Build Status](https://travis-ci.org/Zunawe/bezier-spline.svg?branch=master)](https://travis-ci.org/Zunawe/bezier-spline) [![Coverage Status](https://coveralls.io/repos/github/Zunawe/bezier-spline/badge.svg?branch=master)](https://coveralls.io/github/Zunawe/bezier-spline?branch=master) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This module fits a spline to a set of knots. The curves used are cubic Bezier curves, and their connections are smooth to the second dimension (i.e. position, slope, and concavity are continuous on the spline's domain).

## Install

```sh
$ npm install bezier-spline
```

## Usage

Work in Progress

```js
const BezierSpline = require('bezier-spline')

let spline = new BezierSpline([
	[1, 3],
	[0, 4],
	[5, 5]
])
```
