// webpack.prod.js
 
const path = require('path')
const { srcPath, distPath } = require('./paths')
const webpackCommonConf = require('./webpack.common')
const { merge } = require('webpack-merge')


module.exports = merge(webpackCommonConf,  {
  mode: 'production',
  entry: path.join(__dirname, './', 'src', 'index.js'),
  output: {
    path: distPath,
    filename: `main.${getTimestamp()}.js`, // 打包时加上 hash 戳，注意：webpack 5 是 contenthash
 }
})

function getTimestamp() {
  let time = new Date();
  return ('' + time.getFullYear()).substr(2, 2) + formatTime(time.getMonth() + 1) + formatTime(time.getDate()) + '.' + formatTime(time.getHours()) + formatTime(time.getMinutes());
  function formatTime(t) {
    return t < 10 ? '0' + t : t
  }
};