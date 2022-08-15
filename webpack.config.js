const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');


const isDevelopment = process.env.NODE_ENV !== 'production';


module.exports = {
  //...

  // Entry point of webpack bundler
  entry: {
    index: './src/index.tsx',
  },
  // Mode
  mode: isDevelopment ? 'development' : 'production',

  // Output directory
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          // Use babel-loader (Babel transpiler) for JS Files
          loader: "babel-loader",
          options: {
            plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean), // This object is copied from react-refresh-webpack-plugin documentation
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
        test: /\.(sc|c)ss$/i,
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
                  !isDevelopment && ['autoprefixer',
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
                ].filter(Boolean),
              },
            },
          },
          { loader: "sass-loader", 
            options: { 
              sourceMap: true,
              sassOptions: {
                includePaths: [path.resolve(__dirname, 'src/shared/styles/global')],
              },
            } 
          },
        ],
      }
    ],
  },

  // Specifies html template (Which has the root component which react mounts to)
  // Will inject the script tag by default. Script tag links ALL webpack bundles 
  plugins: [new HtmlWebpackPlugin({
    template: 'public/template.html',
  }),
  isDevelopment && new ReactRefreshWebpackPlugin() // Copied from react-refresh-webpack-plugin documentation
  ].filter(Boolean),

  // Source map for debugging
  devtool: 'source-map',

  // webpack-dev-server is a lightweight express server that serves all output bundles from webpack. Supports hot reload.
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Will also serve these static files
    },
    compress: true,
    port: 9000,
  },
  // https://stackoverflow.com/questions/63151999/webpack-and-babel-loader-not-resolving-ts-and-tsx-modules
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.css','.scss']
  }
};