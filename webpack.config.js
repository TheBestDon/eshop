const path = require("path");
var LiveReloadPlugin = require("webpack-livereload-plugin");

module.exports = {
  // the entry file for the bundle
  entry: path.join(__dirname, "/client/src/app.jsx"),

  // the bundle file we will get in the result
  output: {
    path: path.join(__dirname, "/public"),
    filename: "bundle.js"
  },

  resolve: {
    modules: [path.join(__dirname, "client"), "node_modules"],
    extensions: [".jsx", ".js"]
  },

  module: {
    // apply loaders to files that meet given conditions
    rules: [
      {
        use: "babel-loader",
        test: [/\.jsx?$/, /\.js$/],
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.json$/,
        use: "json-loader"
      }
    ]
  },
  plugins: [new LiveReloadPlugin()],

  // start Webpack in a watch mode, so Webpack will rebuild the bundle on changes
  watch: true
};
