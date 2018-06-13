const vecn = require('vecn')
const {vec2} = vecn

class BezierCurve {
  /**
   * Creates a curve from control points.
   * @param {*} controlPoints The control points that define a Bezier curve
   */
  constructor (controlPoints) {
    let dim = controlPoints[0].length ? controlPoints[0].length : 1
    this.controlPoints = controlPoints.map((v) => vecn.getVecType(dim)(v))
  }

  at (t) {
    let terms = []
    terms.push(this.controlPoints[0].times(Math.pow(1 - t, 3)))
    terms.push(this.controlPoints[1].times(3 * Math.pow(1 - t, 2) * t))
    terms.push(this.controlPoints[2].times(3 * (1 - t) * Math.pow(t, 2)))
    terms.push(this.controlPoints[3].times(Math.pow(t, 3)))

    return vecn.add(...terms)
  }

  solve (value = 0, axis = 0) {
    let points = this.controlPoints.map((v) => v[axis])

    let a = -points[0] + (3 * points[1]) - (3 * points[2]) + points[3]
    let b = (3 * points[0]) - (6 * points[1]) + (3 * points[2])
    let c = -(3 * points[0]) + (3 * points[1])
    let d = points[0] - value

    return solveCubic(a, b, c, d).map((r) => r === 0 ? 0 : r).filter((t) => t >= 0 && t <= 1).sort()
  }
}

class BezierSpline {
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
}

// function getSplineHeight (spline, value, axis = 0) {
//   var ts = spline.reduce((acc, curve) => {
//     curve = curve.map((v) => v[axis])
//     var a = -curve[0] + curve[1] - curve[2] + curve[3]
//     var b = (4 * curve[0]) - (2 * curve[1]) + curve[2]
//     var c = -(3 * curve[0]) + curve[1]
//     var d = curve[0] - value
//     return acc.concat([solveCubic(a, b, c, d).filter((t) => t >= 0 && t <= 1)])
//   }, [])
//   return ts.map((values, i) => values.map((t) => solve(spline[i], t))).reduce((acc, l) => {
//     return acc.concat(l)
//   }, [])
// }

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

function solveQuadratic (a, b, c) {
  if (a === 0) {
    return solveLinear(b, c)
  }
  let d = Math.sqrt((b * b) - (4 * a * c))
  let root1 = (-b - d) / (2 * a)
  let root2 = (-b + d) / (2 * a)
  return [root1, root2]
}

function solveLinear (a, b) {
  if (a === 0) {
    return []
  }
  return [-b / a]
}

function getPerpendicular (v) {
  return vec2(v.y, -v.x)
}

module.exports = BezierSpline
module.exports.BezierCurve = BezierCurve
