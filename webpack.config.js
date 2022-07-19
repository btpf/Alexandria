const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  //...

  // Entry point of webpack bundler
  entry: {
    index: './src/index.tsx',
  },
  // Mode
  mode: 'development',

  // Output directory
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.m?tsx$/,
        exclude: /node_modules/,
        use: {
          // Use babel-loader (Babel transpiler) for JS Files
          loader: "babel-loader",
          options: {
            // preset-react, preset-env = React support and latest JS Support
            presets: [
              '@babel/preset-react',
              [
                "@babel/preset-typescript",
                { isTSX: true, allExtensions: true }
              ], 
              '@babel/preset-env'
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader", // Allow import styles
          {
            loader: "css-loader", // Allows the use of modules
            options: {
              modules: true, // Enable module support (Defaults to simply injecting)
              importLoaders: 1, // Specifies that postcss-loader is also used - https://github.com/webpack-contrib/css-loader#importloaders
            },
          },

          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  ['autoprefixer',
                    {
                      overrideBrowserslist: "last 2 versions" // https://github.com/browserslist/browserslist#full-list
                    }
                  ]
                  // Options for updated CSS are available using the preset, but i don't think this is needed yet
                  //   [
                  //     "postcss-preset-env",
                  //     {
                  //       // Options
                  //     },
                  //   ],
                ],
              },
            },
          },
        ],
      },
    ],
  },

  // Specifies html template (Which has the root component which react mounts to)
  plugins: [new HtmlWebpackPlugin({
    template: 'src/template.html',
  })],

  // Source map for debugging
  devtool: 'source-map',


  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
  // https://stackoverflow.com/questions/63151999/webpack-and-babel-loader-not-resolving-ts-and-tsx-modules
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.css']
  }
};