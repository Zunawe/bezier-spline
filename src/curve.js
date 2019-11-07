const vecn = require('vecn')

const { solveCubic } = require('./polynomials')

/**
 * A class with a couple helper functions for working with Bezier curves in
 * multiple dimensions. Array-like with 4 elements.
 */
class BezierCurve {
  /**
   * Creates a curve from control points.
   * @param {number[][]} controlPoints The control points that define a Bezier curve
   */
  constructor (controlPoints) {
    controlPoints = controlPoints[0].length ? controlPoints : controlPoints.map((n) => [n])

    Reflect.defineProperty(this, 'length', {
      value: 4,
      enumerable: false,
      writable: false
    })

    for (let i = 0; i < this.length; ++i) {
      this[i] = Array.from(controlPoints[i])
    }
  }

  /**
   * Evaluates the bezier curve at the given value of t.
   * @param {number} t The parameter to plug in. (Clamped to the interval [0, 1])
   *
   * @returns {number[]} The point at which t equals the provided value.
   */
  at (t) {
    t = t < 0 ? 0 : (t > 1 ? 1 : t)

    let vec = vecn.getVecType(this[0].length)
    let controlPoints = [...new Array(4)].map((_, i) => vec(this[i]))

    let terms = []
    terms.push(controlPoints[0].times(Math.pow(1 - t, 3)))
    terms.push(controlPoints[1].times(3 * Math.pow(1 - t, 2) * t))
    terms.push(controlPoints[2].times(3 * (1 - t) * Math.pow(t, 2)))
    terms.push(controlPoints[3].times(Math.pow(t, 3)))

    return vecn.add(...terms).toArray()
  }

  /**
   * Finds all values of t for which a particular dimension is equal to a particular value.
   * @param {number} [axis=0] The index of the axis along which to solve (i.e. if your vectors are [x, y, z], 0 means solve for when x = value).
   * @param {number} [value=0] The value to solve for (i.e. the Bezier cubic is on the left of an equation and this value is on the right).
   *
   * @returns {number[]} All real roots of the described equation on the interval [0, 1].
   */
  solve (axis = 0, value = 0) {
    let points = Array.prototype.map.call(this, (v) => v[axis])

    let a = -points[0] + (3 * points[1]) - (3 * points[2]) + points[3]
    let b = (3 * points[0]) - (6 * points[1]) + (3 * points[2])
    let c = -(3 * points[0]) + (3 * points[1])
    let d = points[0] - value

    return solveCubic(a, b, c, d)
      .map((r) => r === 0 ? 0 : r)
      .filter((t) => t >= 0 && t <= 1)
      .sort()
  }
}

module.exports = BezierCurve
