const vecn = require('vecn')

const BezierCurve = require('./curve')
const thomas = require('./thomas')

/**
 * A function that calculates the weight to be assigned to the "speed" of curve `i`.
 * @callback weightsCallback
 * @param {number} i The index of the knot at the end of the curve to be weighted. Integers on [1, n-1].
 * @param {number[][]} knots The knots provided to the spline. More specifically, each point is a `vecn` (see module of the same name).
 *
 * @returns {number} The scalar that will modify the "starting speed" at the start of this curve. Higher numbers means the curve is more strongly pulled in the direction of tangency at the first knot in the curve.
 */
const distanceRatio = (i, knots) => {
  let w1 = knots[i].minus(knots[i - 1]).magnitude
  let w2 = knots[i + 1].minus(knots[i]).magnitude
  return w1 / w2
}

/**
 * Creates cubic splines given knots.
 */
class BezierSpline {
  /**
   * Creates a new spline.
   * @param {number[][]} knots A list of points of equal dimension that the spline will pass through.
   * @param {weightsCallback|number[]} weights A callback that calculates weights for a given segment or precalculated weights in an array. The first element of the array will be ignored.
   */
  constructor (knots = [], weights = distanceRatio) {
    this.weights = weights
    this.knots = []
    this.curves = []
    if (knots.length > 0) {
      this.setKnots(knots)
    }
  }

  /**
   * Recalculates the control points of the spline. Runs on the order of O(n)
   * operations where n is the number of knots.
   */
  recalculate () {
    const n = this.knots.length

    this.curves = []
    if (n < 3) return

    let k = new Array(n)
    for (let i = 1; i < n - 1; ++i) {
      k[i] = Array.isArray(this.weights) ? this.weights[i] : this.weights(i, this.knots)
    }

    let a = new Array(n - 1)
    let b = new Array(n - 1)
    let c = new Array(n - 1)
    let d = new Array(n - 1)

    a[0] = 0
    b[0] = 2
    c[0] = k[1]
    d[0] = this.knots[0].plus(this.knots[1].times(1 + k[1]))
    for (let i = 1; i < n - 2; ++i) {
      a[i] = 1
      b[i] = 2 * (k[i] + (k[i] * k[i]))
      c[i] = k[i + 1] * k[i] * k[i]
      d[i] = this.knots[i].times(1 + (2 * k[i]) + (k[i] * k[i]))
        .plus(this.knots[i + 1].times(1 + k[i + 1]).times(k[i] * k[i]))
    }
    a[n - 2] = 1
    b[n - 2] = (2 * k[n - 2]) + (1.5 * k[n - 2] * k[n - 2])
    c[n - 2] = 0
    d[n - 2] = this.knots[n - 2].times(1 + (2 * k[n - 2]) + (k[n - 2] * k[n - 2]))
      .plus(this.knots[n - 1].times(0.5 * k[n - 2] * k[n - 2]))

    let p1s = thomas(a, b, c, d)
    let p2s = []
    for (let i = 0; i < n - 2; ++i) {
      p2s.push(this.knots[i + 1].minus(p1s[i + 1].minus(this.knots[i + 1]).times(k[i + 1])))
    }
    p2s.push(this.knots[n - 1].plus(p1s[n - 2]).times(0.5))

    for (let i = 0; i < n - 1; ++i) {
      this.curves.push(new BezierCurve([this.knots[i], p1s[i], p2s[i], this.knots[i + 1]]))
    }
  }

  /**
   * The easiest way to change the spline's knots. Knots are kept as special
   * vector types, so setting an entire knot may break the program. Alternately,
   * you can read the documentation for vecn and manipulate the knots yourself.
   * @param {number[][]} newKnots A list of points of equal dimension that the spline will pass through.
   */
  setKnots (newKnots) {
    const vec = vecn.getVecType(newKnots[0].length)
    newKnots = newKnots.map((v) => vec(v))
    this.knots = newKnots
    this.recalculate()
  }

  /**
   * Gets all the points on the spline that match the query.
   * @example
   * spline.getPoints(0, 10)   // Returns all points on the spline where x = 10
   * @example
   * spline.getPoints(2, -2)   // Returns all points on the spline where z = -2
   * @param {number} axis The index of the axis along which to solve (i.e. if your vectors are [x, y, z], 0 means solve for when x = value).
   * @param {number} value The value to solve for (i.e. a Bezier cubic is on the left of an equation and this value is on the right).
   *
   * @returns {number[][]} A list of all points on the spline where the specified axis is equal to the specified value.
   */
  getPoints (axis, value) {
    return this.curves.map((curve) => {
      return curve.solve(axis, value).map((t) => curve.at(t))
    }).reduce((acc, points) => {
      return acc.concat(points)
    }, []).reduce((acc, point) => {
      return acc.some((p) => p.every((n, i) => Math.min(n, point[i]) / Math.max(n, point[i]) > 0.999)) ? acc : acc.concat([point])
    }, []).map((v) => Array.from(v))
  }
}

module.exports = BezierSpline
module.exports.BezierCurve = BezierCurve
