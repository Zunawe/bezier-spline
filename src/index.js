const BezierCurve = require('./curve.js')
const vecn = require('vecn')

/**
 * Creates cubic splines given knots.
 */
class BezierSpline {
  /**
   * Creates a new spline.
   * @param {number[][]} knots A list of points of equal dimension that the spline will pass through.
   * @param {number} [stretchFactor=0] The curve of the first spline is arbitrary, so this determines how far away the first relevant control point is from the line between the first two knots.
   */
  constructor (knots, stretchFactor = 0) {
    knots = knots.map((v) => vecn.getVecType(knots[0].length)(v))

    this.curves = []

    let prevCurve = null
    for (let i = 0; i < knots.length - 1; ++i) {
      let midpoint = knots[i].plus(knots[i + 1]).div(2)

      let controlPoint0, controlPoint1, controlPoint2, controlPoint3
      controlPoint0 = knots[i]
      if (i === 0) {
        controlPoint1 = knots[i]
        controlPoint2 = midpoint.plus(getPerpendicular(knots[i + 1].minus(knots[i])).normalize().times(stretchFactor))
      } else {
        controlPoint1 = knots[i].minus(prevCurve[2].minus(knots[i]))
        controlPoint2 = prevCurve[1].div(2).plus(prevCurve[2].neg()).plus(controlPoint1)
      }
      controlPoint3 = knots[i + 1]

      prevCurve = [controlPoint0, controlPoint1, controlPoint2, controlPoint3]
      this.curves.push(new BezierCurve(prevCurve))
    }

    this.knots = knots
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
      return acc.some((p) => p.approximatelyEquals(point)) ? acc : acc.concat([point])
    }, []).map((v) => Array.from(v)).sort()
  }
}

function getPerpendicular (v) {
  var perp = vecn.getVecType(v.length)()
  perp[0] = v[1]
  perp[1] = -v[0]
  return perp
}

module.exports = BezierSpline
module.exports.BezierCurve = BezierCurve
