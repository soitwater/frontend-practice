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
    ```js
    module.exports = {
      //...
      externals: {
        jquery: 'jQuery',
      },
    };
    ```
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
- 然后在任意js模块中可以直接使用$调用，无需引入jquery包
  ```js
  // in a module
  $('#item'); // <= works
  // $ is automatically set to the exports of module "jquery"
  ```
- 方式
  * 可把变量暴露到 window 全局对象上, 需安装`expose-loader`
  * npm i jquery expose-loader -D
  * 配置
    ```js
    module: {
      rules: [{
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: '$'
        }]
      }]
    }
    ```
  * 除了上述方法外还可以在入口 js 文件中暴露
    ```js
    require("expose-loader?$!jquery");
    ```

## 样式压缩和 js 压缩
- `production` 模式下需压缩 css 可使用插件 `css-minimizer-webpack-plugin`，但使用了此插件压缩 css, 会导致 js 不压缩，
- 所以需要安装 js 压缩插件 `terser-webpack-plugin`
  ```js
  const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
  const TerserPlugin = require("terser-webpack-plugin");

  module.exports = {
    optimization: {
      minimize: true,
      minimizer: [
        new CssMinimizerPlugin(),
        // 压缩js
        new TerserPlugin({ test: /\.js(\?.*)?$/i }),
      ],
    },
  }
  ```

## 图片处理
- 需要 loader 解析图片资源：
- file-loader：将文件的import/require（）解析为url，并将文件发送到输出文件夹（dist文件夹），并返回（相对）URL
- url-loader：像 file-loader 一样工作，但如果文件小于限制，可以返回 data URL，即把图片变成base64
- html-loader：可以解析html标签引入的图片，可以通过查询参数 attrs,指定哪个标签属性组合(tag-attribute combination)应该被处理,默认值：attrs=img:src
- 安装依赖：`npm i file-loader url-loader html-loader -D`
- 配置 webpack.config.js
  ```js
  module: {
    rules: [
      {
        test: /\.jpg|png|jpeg$/,
        use: {
          loader: "file-loader", 
          options: {
            outputPath: "images/",
            name: "[name].[ext]", // 如果不写文件名，则会生成随机名字
            // publicPath: "http://cdn.xxx.com/images", // 可配置生产环境的cdn地址前缀
          },
        },
      },
      {
        test: /\.(html)$/,
        use: {
          loader: "html-loader",
          options: {
            esModule: false, 
          },
        },
      },
    ]
  }
  ```
- TIP： url-loader可以使用 options.limit 限制，小于多少k时使用base64转换，大于这个体积使用file-loader打包
- html-loader 配置报错问题
  * html-loader 需关闭 es6 模块化，使用commonjs解析，否则会报错。原因主要是两个 loader 解析图片的方式不一样

## resolve 配置
- resolve 常用的属性配置：
  * modules：告诉 webpack 解析模块时应该搜索的目录。绝对路径和相对路径都能使用，但是要知道它们之间有一点差异。
    - 使用绝对路径，将只在给定目录中搜索。使用相对路径，通过查看当前目录以及祖先路径。
    - 如果想要优先于某个目标搜索，则需把该目录放到目标前面，可详看官网例子
  * alias：设置别名，方便使用，下面的例子应用于 src 目录下的路径使用
  * mainFields：当从 npm 包中导入模块时（例如，import * as D3 from 'd3'），此选项将决定在 package.json 中使用哪个字段导入模块。根据 webpack 配置中指定的 target 不同，默认值也会有所不同。这里 browser 属性是最优先选择的，因为它是 mainFields 的第一项
  * extensions：尝试按顺序解析这些后缀名。当引入的文件不带后缀名，且有多个文件有相同的名字，但后缀名不同，webpack 会解析列在数组首位的后缀的文件 并跳过其余的后缀。
  ```js
  let path = require("path");
  
  module.exports = {
    resolve: {
      modules: [path.resolve("node_modules")], 
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      mainFields: ["browser", "module", "main"], 
      extensions: [".js", ".json", ".vue"], 
    },
  }
  ```

## 多页面配置
- 多页面顾名思义就是多个 html 页面，因此一般也会有多个 js 入口文件。
- 下面的配置中 entry 的 key 值对应的是 output 属性的 `[name]` 值，HtmlWebpackPlugin 中的属性 `chunks` 表示引入 `[name]` 对应的 js 代码文件，不指定 chunks 值将引入所有打包出来的 js 文件。
- 即本例的 `[name]` 分别为 home 和 other，即打包出来是 home.js 和 other.js，最终打包的效果是 home.html 引入的是 home.js，other.html 引入的是 other.js 文件
- 配置 webpack.config.js
  ```js
  let path = require("path");
  let HtmlWebpackPlugin = require("html-webpack-plugin");

  module.exports = {
    mode: "development",
    entry: {
      home: "./src/js/index.js",
      other: "./src/js/other.js",
    }, 
    output: {
      filename: "js/[name].js", 
      path: path.resolve("dist")
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "home.html",
        chunks: ['home']
      }),
      new HtmlWebpackPlugin({
        template: "./src/other.html",
        filename: "other.html",
        chunks: ['other']
      }),
    ],
  }
  ```

## webpack 小插件应用
### clean-webpack-plugin
- 清除插件，可用于清除上一次的打包文件，清除目录为 `output.path` 的值
- 安装依赖: `npm i clean-webpack-plugin -D`
- 配置 webpack.config.js
  ```js
  const { CleanWebpackPlugin } = require("clean-webpack-plugin"); 
  module.exports = {
    plugins: [
      new CleanWebpackPlugin(),
    ]
  }
  ```
### copy-webpack-plugin
- 拷贝插件，把某个文件夹导出到打包文件夹中，如文档文件夹（如 doc 文件夹）
- 安装依赖 npm i copy-webpack-plugin -D
- 配置 webpack.config.js
  ```js
  const CopyWebpackPlugin = require("copy-webpack-plugin"); // 拷贝文件

  module.exports = {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "./doc",
            to: "./doc", 
          },
        ],
      }),
    ]
  }
  ```
- 插件配置属性
  * patterns
    - from： 源文件，相对于当前目录路径
    - to：目标文件，相对于output.path文件路径，会生成到 dist/doc 目录下
### webpack.BannerPlugin
- 版权声明插件，webpack 内置插件，无需安装
- 配置 webpack.config.js
  ```js
  const webpack = require("webpack");

  module.exports = {
    plugins: [
      new webpack.BannerPlugin("copyright by Moon in 2022"),
    ]
  }
  ```
- 打包后的文件开头会带上版权声明

## watch
- 可以监听文件变化，当它们修改后会重新编译，可以用在实时打包的场景下
- 配置 webpack.config.js
  ```js
  watch: true,
  watchOptions: {
    poll: 1000, //每秒检查一次变动
    aggregateTimeout: 600, // 防抖
    ignored: /node_modules/,
  },
  ```
- 配置属性
  * watchOptions 监听参数
  * poll： 每 n毫秒 检查一次变动
  * aggregateTimeout：防抖，当第一个文件更改，会在重新构建前增加延迟。这个选项允许 webpack 将这段时间内进行的任何其他更改都聚合到一次重新构建里。以毫秒为单位
  * ignored：对于某些系统，监听大量文件会导致大量的 CPU 或内存占用。可以使用正则排除像 node_modules 如此庞大的文件夹

## 环境变量
- 通过 webpack 内置插件 DefinePlugin 定义 DEV 环境变量。
- 还可以把开发和生产模式不同的 webpack 配置抽离出来，即把 webpack.config.js 文件一分为三
  * 公共配置放在 webpack.config.base.js 文件
  * 开发模式配置放在 webpack.config.dev.js 文件，通过 webpack-merge 合并webpack.config.base.js 文件和 webpack.config.dev.js 文件的配置
  * 生产模式配置放在webpack.config.prod.js 文件 (和开发模式配置文件逻辑一致)
- webpack.config.dev.js 文件完整代码如下：
  ```js
  let { merge } = require("webpack-merge");
  let base = require("./webpack.config.base.js");
  let HtmlWebpackPlugin = require("html-webpack-plugin");
  const webpack = require("webpack");

  module.exports = merge(base, {
    mode: "development",
    devtool: "eval-source-map",
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new webpack.DefinePlugin({
        ENV: JSON.stringify("dev"),
      }),
    ],
    devServer: {
      compress: true,
      client: { progress: true },
      port: 5000,
      
      // mock数据
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error("webpack-dev-server is not defined");
        }

        middlewares.unshift({
          name: "fist-in-array",
          // `path` 是可选的
          path: "/user",
          middleware: (req, res) => {
            res.send({ name: "moon mock" });
          },
        });

        return middlewares;
      },
    },
  });
  ```
- 更改配置文件后，打包命令也要做适当调整，打包时需要指定配置文件：
  ```js
  // 开发模式
  webpack --config webpack.config.dev.js
  
  // 生产模式
  webpack --config webpack.config.prod.js
  ```
## 热更新
- webpack 的热更新又称热替换（Hot Module Replacement），缩写为 HMR。这个机制可以做到不用刷新浏览器而将新变更的模块替换掉旧的模块。默认启用热更新，无需配置，它会自动应用 webpack.HotModuleReplacementPlugin，这是启用 HMR 所必需的。

## 优化
### 缩小构建范围
- include/exclude 选其一即可
  ```js
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "src"),
        // exclude: /node_modules/,
      },
    ]
  }
  ```
### module.noParse
- 由于webpack会通过入口文件解析 import, require 引用的包，还会去分析包的依赖，
- 但有些包是没有依赖的，因此可以通过 noParse 不解析某个引用包中的依赖关系，来提高构建性能。适合没有依赖项的包，如 jquery
  ```js
  module: {
    noParse: /jquery/,
  }
  ```
### webpack.IgnorePlugin
- webpack 内置插件 IgnorePlugin 可以阻止生成用于导入的模块，或要求调用与正则表达式或筛选函数匹配的模块。
- 如 moment 包内引入了很多语言包，这些语言包都放在 locale 文件夹下，但大部分实际场景只会引用一个的语言包，因此打包时可忽略 moment 目录下的 locale 语言包
  ```js
  new webpack.IgnorePlugin({
    resourceRegExp: /^\.\/locale$/,
    contextRegExp: /moment$/,
  }), 
  ```
- 忽略后再重新再js文件中引入某个语言包就能正常使用了
  ```js
  import "moment/locale/zh-cn";
  moment.locale("zh-cn");
  ```

### 抽离公共代码
- 一般用在多页应用场景或者是单个 js 文件太大，请求需要很长时间，需要拆成几个js文件，优化请求速度，使用 optimization 的 splitChunks 属性来优化。
- splitChunks.cacheGroups 缓存组可以继承和/或覆盖来自 `splitChunks.*` 的任何选项。但是 test、priority 和 reuseExistingChunk 只能在缓存组级别上进行配置。将它们设置为 false以禁用任何默认缓存组。
- 看下面配置之前先了解splitChunks的几个属性：
  * priority：抽离代码的优先级，值越高越先被抽离，防止某些模块在前面的模块抽离完了后面没被抽离到，在本例中是防止 vendor 模块被 common 模块抽离完了没被抽离到
  * name：每个模块（chunk）的文件名，不定义将是随机名字
  * test：匹配目录
  * chunks：选择哪些 chunk 进行优化
    - initial：从入口处开始提取代码，若有异步模块考虑后面两个值
    - async：异步模块
    - all：可以存在异步和非异步模块
  * minSize：生成 chunk 的最小体积，此处为方便测试设置为 0
  * minChunks：拆分前必须共享模块的最小 chunks 数，当前代码块引用多少次才被抽离，此处为方便设置设置为 1
- 本例中分割了 common 和 vendor 两个 chunk
  ```js
  optimization: {
    // 分割代码块
    splitChunks: {
      // 缓存组
      cacheGroups: {
        // 公共模块
        commons: {
          name: "common",
          chunks: "initial", 
          minSize: 0, 
          minChunks: 1, 
        },
        vendor: {
          name: "vendor",
          priority: 1, 
          test: /[\\/]node_modules[\\/]/,
          chunks: "all", //包括异步和非异步代码块
        },
      },
    },
  },
  ```
- 为方便大家理解，献上打包后的目录树结构
  ```
  ├─index.html
  ├─js
  | ├─common.js
  | ├─common.js.LICENSE.txt
  | ├─main.js
  | ├─main.js.LICENSE.txt
  | ├─vendor.js
  | └vendor.js.LICENSE.txt
  ├─images
  |   └logo.png
  ├─doc
  |  └notes.md
  ├─css
  |  └main.css
  ```
### 懒加载
- 通过 es6 的 import() 语法实现懒加载，通过 jsonp 实现动态加载文件，import 函数返回的是 promise 对象。vue 懒加载，react 懒加载都是这样实现的。举个简单的栗子，某些 js 文件在按钮点击后再请求加载。
  ```js
  button.addEventListener('click', function(){
    import('./test.js').then(data => {
      console.log(data);
    })
  })
  ```
- 除了以上的优化方法之外，还有dll预构建，多线程构建/压缩，利用缓存提升二次构建速度，动态 polyfill 等等，可根据实际情况自行选择优化方案，这里不一一赘述

## webpack 自带优化
- tree-shaking
  * 使用 import 语法在生产环境下没用到的代码不会被打包, 即 tree shaking, 
  * require 语法不支持tree-shaking
- scope hosting
  * scope hosting(作用域提升)，举个栗子:
    ```js
    let a = 1
    let b = 2
    let c = 3
    let d = a+b+c
    console.log(d)
    ```
  * 代码打包出来只有最后一句, webpack打包会自动省略一些可以简化的代码


## 手写简易less-loader
- less-loader.js，在 /loaders/less-loader.js 目录文件中引入 less 插件
  ```js
  const less = require("less");

  function loader(source) {
    let css = "";
    less.render(source, function (err, res) {
      css = res.css;
    });
  }
  module.exports = loader;
  ```
- webpack.config.js
  ```js
  resolveLoader: {
    alias: {
      "lessLoader": path.resolve(__dirname, "loaders", "less-loader"))
    }
  },
  module: {
    rules: [
      {
        test: /\.less/,
        use: ["style-loader", "lessLoader"]
      }
    ]
  }
  ```

## 参考
- [最佳实践](https://juejin.cn/post/7061165571252944926)


