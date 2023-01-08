// eslint-disable-next-line import/no-extraneous-dependencies
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = function override(config) {
  // eslint-disable-next-line no-param-reassign
  config.plugins = [
    ...config.plugins,
    new MonacoWebpackPlugin(),
  ];

  return config;
};
