const BezierCurve = require('./curve.js')
const vecn = require('vecn')

/**
 * Creates cubic splines given knots.
 */
class BezierSpline {
  /**
   * Creates a new spline.
   * @param {number[][]} knots A list of points of equal dimension that the spline will pass through.
   */
  constructor (knots) {
    const vec = vecn.getVecType(knots[0].length)
    knots = knots.map((v) => vec(v))
    this.knots = knots
    this.recalculate()
  }

  recalculate () {
    const n = this.knots.length
    this.curves = []

    let a = (new Array(n - 1)).fill(1)
    a[0] = 0
    let b = (new Array(n - 1)).fill(4)
    b[0] = 2
    b[n - 2] = 3.5
    let c = (new Array(n - 1)).fill(1)
    c[n - 2] = 0

    let d = new Array(n - 1)
    d[0] = this.knots[0].plus(this.knots[1].times(2))
    for (let i = 1; i < n - 2; ++i) {
      d[i] = this.knots[i].times(4).plus(this.knots[i + 1].times(2))
    }
    d[n - 2] = this.knots[n - 2].times(4).plus(this.knots[n - 1].times(0.5))

    let p1s = thomas(a, b, c, d)
    let p2s = []
    for (let i = 0; i < n - 2; ++i) {
      p2s.push(this.knots[i + 1].times(2).minus(p1s[i + 1]))
    }
    p2s.push(this.knots[n - 1].plus(p1s[n - 2]).times(0.5))

    for (let i = 0; i < n - 1; ++i) {
      this.curves.push(new BezierCurve([this.knots[i], p1s[i], p2s[i], this.knots[i + 1]]))
    }
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

function thomas (a, b, c, d) {
  const dim = d[0].length ? d[0].length : 1
  const vec = vecn.getVecType(dim)
  const n = d.length

  a = a.map((x) => vec(x))
  b = b.map((x) => vec(x))
  c = c.map((x) => vec(x))
  d = d.map((x) => vec(x))

  let dp = []
  let cp = []

  cp.push(c[0].div(b[0]))
  dp.push(d[0].div(b[0]))
  for (let i = 1; i < n; ++i) {
    cp.push(c[i].div(b[i].minus(a[i].times(cp[i - 1]))))
    dp.push((d[i].minus(a[i].times(dp[i - 1]))).div(b[i].minus(a[i].times(cp[i - 1]))))
  }

  let x = new Array(n)
  x[n - 1] = dp[n - 1]
  for (let i = n - 2; i >= 0; --i) {
    x[i] = dp[i].minus(cp[i].times(x[i + 1]))
  }

  return x
}

module.exports = BezierSpline
module.exports.BezierCurve = BezierCurve
