const vecn = require('vecn')

/**
 * Solves a matrix equation Ax = d for x where A is a tridiagonal square matrix.
 * @private
 * @param {number[]|number[][]} a The (i-1)th entry of each row. The first element does not exist, but must still be input as a number or vector. 0 is adequate.
 * @param {number[]|number[][]} b The diagonal entry of each row.
 * @param {number[]|number[][]} c The (i+1)th entry of each row. The last element does not exist, but must still be input as a number or vector. 0 is adequate.
 * @param {number[]|number[][]} d The resultant vector in the equation.
 *
 * @returns {number[][]}
 */
function thomas (a, b, c, d) {
  const dim = d[0].length ? d[0].length : 1
  const vec = vecn.getVecType(dim)
  const n = d.length

  a = a.map((x) => vec(x))
  b = b.map((x) => vec(x))
  c = c.map((x) => vec(x))
  d = d.map((x) => vec(x))

  let dp = []
  let cp = []

  cp.push(c[0].div(b[0]))
  dp.push(d[0].div(b[0]))
  for (let i = 1; i < n; ++i) {
    cp.push(c[i].div(b[i].minus(a[i].times(cp[i - 1]))))
    dp.push((d[i].minus(a[i].times(dp[i - 1]))).div(b[i].minus(a[i].times(cp[i - 1]))))
  }

  let x = new Array(n)
  x[n - 1] = dp[n - 1]
  for (let i = n - 2; i >= 0; --i) {
    x[i] = dp[i].minus(cp[i].times(x[i + 1]))
  }

  return x
}

module.exports = thomas
