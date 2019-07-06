const path = require('path');

module.exports = {
  target: 'node',
  mode: 'development',
  devtool: false,
  entry: './src/lambda/entry.ts',
  resolve: {
    extensions: ['.js', '.ts', '.json'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app-lambda.js',
    libraryTarget: 'commonjs',
  },
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
  plugins: [],
};
