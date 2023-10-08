// webpack.dev.js
 
const path = require('path')
const webpackCommonConf = require('./webpack.common')
const { merge } = require('webpack-merge')
 
module.exports = merge(webpackCommonConf, {
  mode: 'development'
})