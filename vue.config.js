const path = require("path");


function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  //部署应用包时的基本 URL
  publicPath:'./',
  //运行 vue-cli-service build 时生成的生产环境构建文件的目录
  outputDir:process.env.outputDir,
  //放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
  assetsDir:'',
  indexPath:'index.html',
  pages: {
    index: {
      // page 的入口
      entry: 'src/main.js',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      // title: 'Index Page',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    // 当使用只有入口的字符串格式时，
    // 模板会被推导为 `public/subpage.html`
    // 并且如果找不到的话，就回退到 `public/index.html`。
    // 输出文件名会被推导为 `subpage.html`。
    // subpage: 'src/subpage/main.js'
  },
  devServer: {
    host:'localhost',
    port:'8088',
    disableHostCheck: true,
    proxy: {
      '/':{
        target:'http://api.dev.ops.com:7000/typhoon',
        changeOrigin:true,
      },
    }
  },
  lintOnSave: process.env.NODE_ENV !== 'production',
  productionSourceMap:true, // 生产环境是否需要sourceMap

  chainWebpack: (config) => {

    config.resolve.alias
        .set("@", resolve("src"))
        .set("~", resolve(__dirname, "node_modules"))

        // .set("assets", resolve("src/assets"))
        //
        // .set("components", resolve("src/components"))
        //
        // .set("base", resolve("baseConfig"))
        //
        // .set("public", resolve("public"));

  },
  // css: {
  //   loaderOptions: {
  //     less:{
  //
  //     },
  //     css: {
  //       // 这里的选项会传递给 css-loader
  //     },
  //     postcss: {
  //       // 这里的选项会传递给 postcss-loader
  //     }
  //   }
  // },
  transpileDependencies: [
    'vue-echarts',
    'resize-detector'
  ]
}
