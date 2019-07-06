const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  mode: 'none',
  devtool: false,
  entry: './src/lambda.ts',
  optimization: {
    namedModules: false,
    namedChunks: true,
    nodeEnv: 'production',
    flagIncludedChunks: true,
    occurrenceOrder: true,
    sideEffects: true,
    usedExports: true,
    concatenateModules: true,
    splitChunks: {
      hidePathInfo: true,
      minSize: 30000,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
    },
    noEmitOnErrors: true,
    checkWasmTypes: false,
    minimize: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.json'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app-lambda.js',
    libraryTarget: 'commonjs',
  },
  externals: [
    function(context, request, callback) {
      if (/^aws-sdk/.test(request)) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    },
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, './tsconfig.build.json'),
          transpileOnly: true,
        },
      },
    ],
  },
};
