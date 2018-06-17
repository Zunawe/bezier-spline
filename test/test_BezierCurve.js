const BezierCurve = require('../src/curve.js')
const {assert} = require('chai')

suite('BezierCurve', function () {
  test('constructor', function () {
    let curve = new BezierCurve([0, 1, 3, 5])
    assert.deepEqual(curve[0], [0])
  })

  test('at', function () {
    let curve = new BezierCurve([1, 2, 3, 4])
    assert.deepEqual(curve.at(0.0), [1])
    assert.deepEqual(curve.at(0.5), [2.5])
    assert.deepEqual(curve.at(1.0), [4])

    curve = new BezierCurve([
      [0, 0],
      [1, 2],
      [-1, 3],
      [2, 2]
    ])
    assert.deepEqual(curve.at(0.0), [0, 0])
    assert.deepEqual(curve.at(0.25), [0.3125, 1.296875])
    assert.deepEqual(curve.at(1.0), [2, 2])
  })

  test('at clamps', function () {
    let curve = new BezierCurve([1, 4, 3, 5])
    assert.deepEqual(curve.at(-1), curve.at(0))
    assert.deepEqual(curve.at(2), curve.at(1))
  })

  test('solve', function () {
    let curve = new BezierCurve([1, 2, 3, 4])

    assert.deepEqual(curve.solve(), [])
    assert.deepEqual(curve.solve(0, 1), [0])
    assert.deepEqual(curve.solve(0, 2.5), [0.5])

    curve = new BezierCurve([1, 2, -2, 1])
    assert.deepEqual(curve.solve(0, 1), [0, 0.25, 1])
  })

  test('solveCubic', function () {
    assert.doesNotThrow(() => (new BezierCurve([4, -1, 1, 2])).solve())
    assert.doesNotThrow(() => (new BezierCurve([1, -1, 0, 0])).solve())
    assert.doesNotThrow(() => (new BezierCurve([1, 0, 0, 0])).solve())
  })

  test('solveQuadratic', function () {
    assert.doesNotThrow(() => (new BezierCurve([2, 1, 1, 2])).solve())
  })

  test('solveLinear', function () {
    assert.doesNotThrow(() => (new BezierCurve([1, 2, 3, 4])).solve())
    assert.doesNotThrow(() => (new BezierCurve([0, 0, 0, 0])).solve())
  })
})
