// webpack.common.js
// 可将开发环境和生产环境下的公用配置抽离到该文件中，可避免重复
 
const path = require('path')
const { srcPath, distPath } = require('./paths')
 
module.exports = {
  entry: path.join(srcPath, 'index'),
  module: {
    rules: []
  }
}