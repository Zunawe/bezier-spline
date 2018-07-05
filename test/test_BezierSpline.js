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
    assert.isNotEmpty(spline.getPoints(0, 1.5))
    assert.isNotEmpty(spline.getPoints(1, 3.2))
    assert.isEmpty(spline.getPoints(0, -1))
  })
})
