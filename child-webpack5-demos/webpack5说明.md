# webpack5 说明

## loader
- 主要是对资源进行加载/转译的预处理工作，其本质是一个函数，
- 在该函数中对接收到的内容进行转换，返回转换后的结果。
- 某种类型的资源可以使用多个 loader，执行顺序是从右到左，从下到上。

## plugin（插件）
- 主要是扩展 webpack 的功能，其本质是监听整个打包的生命周期。
- webpack 基于事件流框架 `Tapable`， 运行的生命周期中会广播出很多事件，plugin 可以监听这些事件，在合适的时机通过 webpack 提供的 API 改变输出结果


## html 文件打包
- npm i html-webpack-plugin -D
- 配置看 webpack.config.js

## 开启服务
- npm i webpack-dev-server -D
- 配置看 webpack.config.js
- 运行 `npx webpack serve`

## 跨越
- 可通过 `devServer.proxy` 配置解决
- 假设接口地址为 http://localhost:3000/api/users，对 /api/users 的请求可如下配置 
  ```js
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  ```
- 但实际项目中接口的地址有很多种可能，一般不会有 `/api` 目录，即一般接口地址为`http://localhost:3000/users`，因此枚举配置会很麻烦，可通过代理请求解决
  * 即先请求 `http://localhost:3000/api/users` 接口地址，然后通过 `devServer` 代理到 `http://localhost:3000/users`
  * 配置
    ```js
    devServer: {
      proxy: {
        "/api": {
          // 接口域名
          target: "http://localhost:3000/",
          // 接口路径重写，把请求代理到接口服务器上
          pathRewrite: {
            "/api": ""
          },
        },
      }
    }
    ```

## 样式处理
### 常用的 loader
- `less-loader`：加载和转译 LESS 文件
- `postcss-loader`：使用 PostCSS 加载和转译 CSS/SSS 文件，如可以处理 `autoprefixer` css 包，为css添加浏览器前缀
- `css-loader`：解析 @import and url() 语法，使用 import 加载解析后的css文件，并且返回 CSS 代码
- `mini-css-extract-plugin` 的 loader：抽取出 css 文件，通过 link 标签引入 html 文件
### 以 sass 举例
- npm i mini-css-extract-plugin css-loader postcss-loader autoprefixer sass-loader node-sass -D
- 配置看` webpack.config.js` 中的 `MiniCssExtractPlugin` 与 `rules`
- 还需新建并配置 `postcss.config.js`
- 还需要在 `package.json` 中新增下面的配置, 才能给打包后的 css 新增浏览器前缀
  ```js
  "browserslist": [
    "last 1 version",
    "> 1%",
    "IE 10"
  ],
  ```
- 如果 sass-loader 版本过高, 则安装`7.3.1`版本


## js 语法处理与校验
- 场景：将 es6 语法转化为 es5;
- 常用的 loader
  * `babel-loader`：加载 ES2015+ 代码，然后使用 Babel 转译为 ES5
  * `@babel/preset-env`：基础的ES语法分析包，各种转译规则的统一设定，目的是告诉 loader 要以什么规则来转化成对应的js版本
  * `@babel/plugin-transform-runtime`：解析 `generator` 等高级语法，但不包含 include 语法，include 语法需安装 `@babel/polyfill`。官方文档说上线需带上 `@babel/runtime` 这个补丁，该包还做了一些方法抽离的优化，如 `class` 语法的抽离（抽离出 classCallCheck 方法）
  * `@babel/polyfill`：解析更高级的语法，如 promise，include 等，在js文件中 require 引入即可
  * `eslint-loader`：校验 js 是否符合规范，可自行在 eslint 网站上配置下载
- 安装
  ```js
  npm i @babel/core babel-loader @babel/preset-env @babel/plugin-transform-runtime -@babel/polyfill -D
  npm i @babel/runtime eslint-loader eslint -S
  ```
- webpack.config.js 的配置
  * 看 rules 中的 `test: /\.js$/`

## 配置 source-map
- 看 webpack.config.js 下的 devtool，他有几个可选值：
  ```js
  `source-map` 映射源码 会单独生成source-map文件 出错了会标识当前报错的行和列 大而全
  `eval-source-map` 不会产生单独的文件，可显示行和列
  `cheap-module-source-map` 不会标识列，会生成单独的映射文件
  `cheap-module-eval-source-map` 不会产生文件 集成在打包后的文件中 不会产生列
  ```

## 引入js全局变量
- 方式：通过 cdn 引入
  * 通过 cdn 链接的方式引入全局变量，
  * 但如果此时js文件中多写了 import $ from 'jquery'，就会把 jquery 也打包进去
  * 可使用 external 防止将某些 import 的包(package)打包到 bundle 中
- 方式：可使用 `webapck` 内置插件 `providePlugin` 给每个模块中注入变量，还是以 jquery 为例
  * 在 webapck.config.js 中配置
    ```js
    const webpack = require("webpack");
    module.exports = {
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery'
        });
      ]
    }
    ```


然后在任意js模块中可以直接使用$调用，无需引入jquery包
// in a module
$('#item'); // <= works
// $ is automatically set to the exports of module "jquery"

- 方式

## 参考
- [最佳实践](https://juejin.cn/post/7061165571252944926)