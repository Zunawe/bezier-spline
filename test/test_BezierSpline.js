const BezierSpline = require('../src/index.js')
const {assert} = require('chai')
const {vec2} = require('vecn')

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
    assert.deepEqual(spline.getPoints(0, 1.5), [vec2(1.5, 3)])
  })
})
