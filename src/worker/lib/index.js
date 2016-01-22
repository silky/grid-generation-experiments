var initializeMesh = require('./initialize-mesh')
var pool = require('ndarray-scratch')
var linspace = require('ndarray-linspace')
var measure = require('./measure')
var prefixSum = require('ndarray-prefix-sum')
var Mesher = require('./mesher')
var ops = require('ndarray-ops')

var params, m, n, mesh, eta, xi, mesher

// The grid dimensions. n = around, m = outward
n = 151
m = 80

// Allocate the grid:
mesh = ndarray(new Float32Array(m * n * 3), [m, n, 3])

// eta is the independent variable around the o-grid:
eta = ndarray(new Float32Array(n + 1), [n + 1])

// xi is the independent variable outward:
xi = ndarray(new Float32Array(m), [m])
ops.assign(xi.lo(1), linspace(0.002, m / 50 * 0.0250, m - 1))
prefixSum(xi)

// Initialize the inner contour:
measure('initialized',function () {
  initializeMesh(params.naca, eta, mesh.pick(0), n, 20, 20)
})

measure('initialized mesher',function () {
  mesher = new Mesher(eta, xi, mesh)
})

measure('meshed',function () {
  mesher.march()
})

var v = new Viewport ('canvas', {
  xmin: -0.1,
  xmax: 1.1,
  ymin: 0.05,
  ymax: 0.05,
  aspectRatio: 1,
  devicePixelRatio: window.devicePixelRatio,
  antialias: false,
})

