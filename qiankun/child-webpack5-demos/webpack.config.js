let path = require("path");
let HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); 

module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  // 入口文件
  entry: "./src/js/index.js", 
  // 打包配置
  output: {
    // 打包后的文件, 可带 hash：js/bundle.[hash:8].js
    filename: "js/bundle.js", 
    // 打包后的路径, 必须是绝对路径
    path: path.resolve("dist"),
    // 上线的 cdn 的地址 (服务器地址, 即打包后的文件存放的位置)
    // publicPath: "http://cdn.xxxxx"
  },
  plugins: [
    new HtmlWebpackPlugin({
      // 使用指定的 template , 如果不使用 template 则默认使用插件提供的 template
      template: "./src/index.html",
      // 下面的配置项可在 production 模式下启用 (删除属性双引号 + 代码压缩成一行)
      // minify: { removeAttributeQuotes: true, collapseWhitespace: true }, 
      // hash: true
    }),
    new MiniCssExtractPlugin({
      filename: "css/main.css", // 抽离的css文件名
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: /\.js$/,
        use: {
          loader: "eslint-loader",
          options: {
            enforce: "pre", // 定义为前置loader，在normal的loader前执行
          },
        },
      },
      {
          test: /\.js$/, 
          use: {
            loader: "babel-loader", 
            // 如果不配置 options 中的 enforce, 则默认为 normal 普通loader
            options: {
              presets: ["@babel/preset-env"], // 把es6转成es5
              plugins: ["@babel/plugin-transform-runtime"], //作用？
            },
          },
          include: path.resolve(__dirname, "src"),
          exclude: /node_modules/,
      },
    ]
  },

  devServer: {
    port: 5000,
    // 开启 gzip 压缩
    compress: true,
    // 启动后自动打开页面
    open: true,
    client: { 
      // 是否在浏览器中显示编译进度
      progress: true
    }
  },
}