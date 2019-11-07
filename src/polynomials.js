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

module.exports = {
  solveCubic,
  solveQuadratic,
  solveLinear
}
