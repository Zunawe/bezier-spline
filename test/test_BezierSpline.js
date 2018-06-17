const BezierSpline = require('../src/index.js')
const {assert} = require('chai')

suite('BezierSpline', function () {
  let spline

  setup(function () {
    spline = new BezierSpline([
      [1, 2],
      [2, 4],
      [3, 3],
      [5, -2]
    ])
  })

  test('getPoints', function () {
    let expected = [[1.5, 3]]
    assert(spline.getPoints(0, 1.5).every((p, i) => {
      return p.every((n, j) => {
        return Math.abs(n - expected[i][j]) < 0.00000001
      })
    }))

    assert.doesNotThrow(() => spline.getPoints(1, 3))
  })
})
