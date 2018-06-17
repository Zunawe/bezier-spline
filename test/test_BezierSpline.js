const BezierSpline = require('../src/index.js')
const {assert} = require('chai')

suite('BezierSpline', function () {
  let spline

  setup(function () {
    spline = new BezierSpline([
      [1, 2],
      [2, 4],
      [3, 3]
    ])
  })

  test('getPoints', function () {
    assert.deepEqual(spline.getPoints(0, 1.5), [[1.5, 3]])
  })
})
