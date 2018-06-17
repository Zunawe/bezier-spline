const vecn = require('vecn')

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

/**
 * Solves for all real roots of a cubic function of the form ax^3 + bx^2 + cx + d.
 * @private
 * @param {number} a The coefficient of the third-degree term.
 * @param {number} b The coefficient of the second-degree term.
 * @param {number} c The coefficient of the first-degree term.
 * @param {number} d The constant term.
 *
 * @returns {number[]} A list of all real roots of the described function.
 */
function solveCubic (a, b, c, d) {
  if (a === 0) {
    return solveQuadratic(b, c, d)
  }

  let D = a * b * c * d * 18
  D -= Math.pow(b, 3) * d * 4
  D += Math.pow(b, 2) * Math.pow(c, 2)
  D -= a * Math.pow(c, 3) * 4
  D -= Math.pow(a, 2) * Math.pow(d, 2) * 27

  let D0 = Math.pow(b, 2) - (a * c * 3)

  if (D === 0) {
    if (D0 === 0) {
      let root1 = -b / (a * 3)
      return [root1]
    } else {
      let root1 = a * b * c * 4
      root1 -= a * a * d * 9
      root1 -= b * b * b
      root1 /= a * D0

      let root2 = ((a * d * 9) - b * c) / (D0 * 2)

      return [root1, root2]
    }
  } else {
    let f = ((3 * (c / a)) - ((Math.pow(b, 2)) / (Math.pow(a, 2)))) / 3
    let g = (2 * (Math.pow(b, 3)) / (Math.pow(a, 3)))
    g -= 9 * b * c / Math.pow(a, 2)
    g += 27 * d / a
    g /= 27
    let h = (Math.pow(g, 2) / 4) + (Math.pow(f, 3) / 27)

    if (h > 0) {
      let R = -(g / 2) + Math.sqrt(h)
      let S = Math.cbrt(R)
      let T = -(g / 2) - Math.sqrt(h)
      let U = Math.cbrt(T)
      let root1 = (S + U) - (b / (3 * a))

      return [root1]
    } else {
      let i = Math.sqrt((Math.pow(g, 2) / 4) - h)
      let j = Math.cbrt(i)

      let k = Math.acos(-g / (2 * i))
      let L = -j
      let M = Math.cos(k / 3)
      let N = Math.sqrt(3) * Math.sin(k / 3)
      let P = -b / (3 * a)

      let root1 = 2 * j * Math.cos(k / 3) - (b / (3 * a))
      let root2 = (L * (M + N)) + P
      let root3 = (L * (M - N)) + P

      return [root1, root2, root3]
    }
  }
}

/**
 * Solves for all real roots of a quadratic function of the form ax^2 + bx + c.
 * @private
 * @param {number} a The coefficient of the second-degree term.
 * @param {number} b The coefficient of the first-degree term.
 * @param {number} c The constant term.
 *
 * @returns {number[]} A list of all real roots of the described function.
 */
function solveQuadratic (a, b, c) {
  if (a === 0) {
    return solveLinear(b, c)
  }
  let d = Math.sqrt((b * b) - (4 * a * c))
  let root1 = (-b - d) / (2 * a)
  let root2 = (-b + d) / (2 * a)
  return [root1, root2]
}

/**
 * Solves for all real roots of a linear function of the form ax + b. If there
 * are zero or infinitely many solutions, an empty array is returned.
 * @private
 * @param {number} a The coefficient of the first-degree term.
 * @param {number} b The constant term.
 *
 * @returns {number[]} A list of all real roots of the described function.
 */
function solveLinear (a, b) {
  if (a === 0) {
    return []
  }
  return [-b / a]
}

module.exports = BezierCurve