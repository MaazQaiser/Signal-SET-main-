require('dotenv').config();
const path = require(`path`);
const webpack = require('webpack');

const ESLintPlugin = require('eslint-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ResourceHintsWebpackPlugin = require('resource-hints-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const alias = {
  src: path.resolve(__dirname, 'src/'),
  salesPages: path.resolve(__dirname, 'src/app/sales/pages'),
  commonComponents: path.resolve(__dirname, 'src/app/components/common'),
  salesComponents: path.resolve(__dirname, 'src/app/components/salesComponents'),
  globalUtils: path.resolve(__dirname, 'src/utils'),
  services: path.resolve(__dirname, 'src/services'),
  assetsComponents: path.resolve(__dirname, 'src/assets'),
  routerComponent: path.resolve(__dirname, 'src/app/router'),
};

const resolvedJestAliases = Object.fromEntries(
  Object.entries(alias).map(([key, value]) => [`^${key}/(.*)$`, `${value}/$1`]),
);

module.exports = {
  jest: {
    configure: {
      verbose: true,
      moduleNameMapper: resolvedJestAliases,
    },
  },
  webpack: {
    alias: alias,
    ...(process.env.REACT_APP_COMPRESS_PACKAGES !== 'local' && {
      plugins: {
        add: [
          [new ESLintPlugin(), 'prepend'],
          [new TerserPlugin(), 'append'],
          [new ResourceHintsWebpackPlugin()],
          [
            new webpack.IgnorePlugin({
              resourceRegExp: /^\.\/stubbedData\/.+\.js$/,
              contextRegExp: /src/,
            }),
          ],
          [
            new webpack.IgnorePlugin({
              resourceRegExp: /^\.\/tests\/.+\.js$/,
              contextRegExp: /src/,
            }),
          ],
          [
            new webpack.IgnorePlugin({
              resourceRegExp: /\.test\.(js|jsx|ts|tsx)$/,
              contextRegExp: /src/,
            }),
          ],
          [
            new webpack.IgnorePlugin({
              resourceRegExp: /\.spec\.(js|jsx|ts|tsx)$/,
              contextRegExp: /src/,
            }),
          ],
        ],
      },
      configure: (webpackConfig) => {
        return {
          ...webpackConfig,
          optimization: {
            minimize: true,
            minimizer: [
              new TerserPlugin({
                terserOptions: {
                  removeAttributeQuotes: true,
                  collapseWhitespace: true,
                  removeComments: true,
                },
                exclude: /node_modules/,
              }),
              new CompressionPlugin({
                algorithm: 'gzip',
                test: /\.(js)(\?.*)?$/,
                threshold: 10240,
                deleteOriginalAssets: false,
                minRatio: 0.8,
              }),
            ],
          },
        };
      },
    }),
  },
};
