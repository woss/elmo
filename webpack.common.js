const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    background: path.join(__dirname, "src/backgroundPage.ts"),
    // content: path.join(__dirname, "src/contentScript.ts"),
    popup: path.join(__dirname, "src/popup/index.tsx"),
    tab: path.join(__dirname, "src/tab/index.tsx"),
  },
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "[name].js",
  },
  plugins: [
    new CopyPlugin([
      {
        from: path.resolve("./manifests/chrome-manifest.json"),
        to: path.resolve("dist/manifest.json"),
      },
    ]),
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "@src": path.resolve(__dirname, "src/"),
      "@tab": path.resolve(__dirname, "src/tab/"),
      url: "iso-url",
      stream: "readable-stream", // cure general insanity
      http: "http-node", // chrome.sockets
      dns: "http-dns", // chrome.sockets
      dgram: "chrome-dgram", // chrome.sockets
      net: "chrome-net", // chrome.sockets
    },
  },
  node: {
    global: true, // https://github.com/webpack/webpack/issues/5627#issuecomment-394309966
    Buffer: true,
    fs: "empty",
    tls: "empty",
    cluster: "empty", // expected by js-ipfs dependency: node_modules/prom-client/lib/cluster.js
  },
};
