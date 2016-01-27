/* global location, window */
'use strict'

var queryString = require('query-string')
var extend = require('util-extend')
var defaults = require('./defaults')
var naca = require('naca-four-digit-airfoil')
var normalizeQueryParams = require('../lib/normalize-query-params')

var config = extend({}, defaults)

extend(config, normalizeQueryParams(location.search, {
  open: ['String'],
  close: ['String'],
  hide: ['String'],
  thickness: 'Number',
  camber: 'Number',
  camberLoc: 'Number',
  m: 'Integer',
  n: 'Integer',
  diffusion: 'Number',
  stepStart: 'Number',
  stepInc: 'Number',
  clustering: 'Number',
  xmin: 'Number',
  xmax: 'Number',
  ymin: 'Number',
  ymax: 'Number',
  power: 'Number',
  points: 'Boolean',
  collapseConfig: 'Boolean',
  integrator: 'String',
  antialiasing: 'Boolean',
  devicePixelRatio: 'Number',
  configSet: 'Integer',
  closeButton: 'Boolean',
}))

if (naca.isValid(config.naca)) {
  var airfoil = naca.parse(config.naca)
  config.thickness = airfoil.t
  config.camber = airfoil.m
  config.camberLoc = airfoil.p
}

module.exports = config