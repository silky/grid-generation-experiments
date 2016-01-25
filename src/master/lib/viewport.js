'use strict'

var Detector = require('./threejs-detector.js')
var three = require('three')
var extend = require('util-extend')
var mouseWheel = require('mouse-wheel')
var mouse = require('mouse-event')
var mouseChange = require('mouse-change')

//window.THREE = three
//require('three/examples/js/renderers/Projector')
//require('three/examples/js/renderers/CanvasRenderer')

module.exports = Viewport

function Viewport (id, options) {
  var opts = extend({
    xmin: -1,
    xmax: 1,
    ymin: -1,
    ymax: 1,
    aspectRatio: undefined,
    zoomSpeed: 0.01,
    devicePixelRatio: window.devicePixelRatio,
    antialias: true,
    getSize: function () {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      }
    },
  }, options || {})

  this.dirty = true
  this.getSize = opts.getSize
  this.zoomSpeed = opts.zoomSpeed
  this.canvas = document.getElementById(id)

  window.addEventListener('resize', function() {
    this.resize()
    this.render()
  }.bind(this), false)

  if (Detector.webgl) {
    this.renderer = new three.WebGLRenderer({
      antialias: opts.antialias,
      canvas: this.canvas,
    })
  } else {
    Detector.addGetWebGLMessage()
    /*this.renderer = new window.THREE.CanvasRenderer({
      antialias: opts.antialias,
      canvas: this.canvas,
    })*/
    return
  }

  var size = this.getSize()
  this.width = size.width
  this.height = size.height

  this.mouse = {
    x: 0.5 * (opts.xmin + opts.xmax),
    y: 0.5 * (opts.ymin + opts.ymax),
    i: this.width / 2,
    j: this.height / 2,
  }

  this.renderer.setClearColor(new three.Color(0xffffff))
  this.renderer.setPixelRatio(opts.devicePixelRatio)
  this.renderer.setSize(this.width, this.height)

  this.scene = new three.Scene()
  this.camera = new three.OrthographicCamera(opts.xmin, opts.xmax, opts.ymax, opts.ymin, 0, 1000)

  this.setAspectRatio(opts.aspectRatio)
  this.setBounds(opts.xmin, opts.xmax, opts.ymin, opts.ymax)
  this.applyAspectRatio()

  this.attachMouseWheel()
  this.attachMouseChange()

  var render = function () {
    if (this.dirty) {
      this.render()
      this.dirty = false
    }
    requestAnimationFrame(render)
  }.bind(this)

  render()
}
Viewport.prototype.attachMouseChange = function () {
  var initialized = false
  mouseChange(this.canvas, function(buttons, i, j, mods) {
    this.mouse.i = i
    this.mouse.j = j
    var x = this.camera.left + i * this.xscale
    var y = this.camera.top + j * this.yscale
    var dx = x - this.mouse.x
    var dy = y - this.mouse.y
    this.mouse.x = x
    this.mouse.y = y
    this.mouse.shift = mods.shift
    this.mouse.alt = mods.alt
    this.mouse.control = mods.control
    this.mouse.meta = mods.meta

    if (buttons === 1 && initialized) {
      this.pan(dx, dy)
    }
    initialized = true
  }.bind(this))
}

Viewport.prototype.attachMouseMove = function () {
  window.addEventListener('mousemove', function(ev) {
  }.bind(this))
}

Viewport.prototype.pan = function(dx, dy) {
  this.setBounds(
    this.camera.left - dx,
    this.camera.right - dx,
    this.camera.bottom - dy,
    this.camera.top - dy
  )
}

Viewport.prototype.zoom = function (amount) {
  var dxR = this.camera.right - this.mouse.x
  var dxL = this.camera.left - this.mouse.x
  var dxB = this.camera.bottom - this.mouse.y
  var dxT = this.camera.top - this.mouse.y

  var scalar = Math.exp(amount * this.zoomSpeed)

  this.setBounds(
    this.mouse.x + dxL * scalar,
    this.mouse.x + dxR * scalar,
    this.mouse.y + dxB * scalar,
    this.mouse.y + dxT * scalar
  )
}

Viewport.prototype.attachMouseWheel = function () {
  mouseWheel(this.canvas, this.onMouseWheel.bind(this), true)
}

Viewport.prototype.onMouseWheel = function (dx, dy) {
  this.zoom(dy)
}

Viewport.prototype.render = function () {
  this.renderer.render(this.scene, this.camera)
}

Viewport.prototype.resize = function () {
  var size = this.getSize()
  this.width = size.width
  this.height = size.height

  this.applyAspectRatio()

  this.renderer.setSize(this.width, this.height)
  this.camera.updateProjectionMatrix()
}


Viewport.prototype.setAspectRatio = function (aspectRatio) {
  this.aspectRatio = aspectRatio
}

Viewport.prototype.setBounds = function (xmin, xmax, ymin, ymax) {
  this.dirty = true
  this.camera.left = xmin
  this.camera.right = xmax
  this.camera.bottom = ymin
  this.camera.top = ymax

  this.applyAspectRatio()

  this.computeScale()

  this.mouse.x = this.camera.left + this.mouse.i * this.xscale
  this.mouse.y = this.camera.top + this.mouse.j * this.yscale

  this.camera.updateProjectionMatrix()
}

Viewport.prototype.computeScale = function () {
  this.xscale = (this.camera.right - this.camera.left) / this.width
  this.yscale = (this.camera.bottom - this.camera.top) / this.height
}

Viewport.prototype.applyAspectRatio = function () {
  if (!this.aspectRatio) return

  var dx = 0.5 * (this.camera.right - this.camera.left)
  var yc = 0.5 * (this.camera.bottom + this.camera.top)
  var dy = dx * this.aspectRatio * this.height / this.width
  this.camera.bottom = yc - dy
  this.camera.top = yc + dy
}