const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: "vue-loader"
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/index.html", to: "./index.html" },
      { from: "./src/searchSections.js", to: "./searchSections.js" }
    ], {})
  ],
  resolve: {
    alias: {
      "vue$": "vue/dist/vue.esm.js"
    },
    extensions: ["*", ".js", ".vue", ".json"]
  },
  devtool: "sourcemap",
  stats: {
    colors: true
  }
}
