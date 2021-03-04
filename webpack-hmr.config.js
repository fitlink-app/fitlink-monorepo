/* eslint-disable */
const nodeExternals = require('webpack-node-externals');

/**
 * TODO: This configuration isn't currently working,
 * and is not being used. Needs more R&D / testing
 * to get it working as advertised.
 */

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      })
    ],
  };
};
