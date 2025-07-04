const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    // Points d'entrée multiples pour le code splitting
    entry: {
      background: './background.js',
      content: './content.js',
      'chatgpt-inject': './chatgpt-inject.js',
      options: './pages/options.js',
      popup: './popup/popup.js',
      'utils/constants': './utils/constants.js',
      'utils/history': './utils/history.js',
      'utils/custom-prompts': './utils/custom-prompts.js',
      'utils/ai-models': './utils/ai-models.js',
      'utils/i18n': './utils/i18n.js',
      'utils/performance': './utils/performance.js',
      'utils/lazy-loader': './utils/lazy-loader.js',
      'utils/bundle-optimizer': './utils/bundle-optimizer.js',
      'ui/notifications': './ui/notifications.js',
      'ui/multilingual-ui': './ui/multilingual-ui.js',
      'ui/custom-prompts-ui': './ui/custom-prompts-ui.js',
      'ui/history-ui': './ui/history-ui.js',
      'ui/ai-models-ui': './ui/ai-models-ui.js',
      'workers/api-worker': './workers/api-worker.js',
      'workers/text-processing-worker': './workers/text-processing-worker.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        // Minification JavaScript
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
            },
          },
          extractComments: false,
        }),
        // Minification CSS
        new CssMinimizerPlugin(),
      ],
      // Extraction des dépendances communes
      splitChunks: {
        chunks: 'all',
        name: 'vendors',
        cacheGroups: {
          // Regrouper les modules utils dans un seul fichier
          utils: {
            test: /[\\/]utils[\\/]/,
            name: 'utils-bundle',
            chunks: 'all',
            priority: 10,
          },
          // Regrouper les modules UI dans un seul fichier
          ui: {
            test: /[\\/]ui[\\/]/,
            name: 'ui-bundle',
            chunks: 'all',
            priority: 10,
          },
          // Regrouper les modules workers dans un seul fichier
          workers: {
            test: /[\\/]workers[\\/]/,
            name: 'workers-bundle',
            chunks: 'all',
            priority: 10,
          },
          // Regrouper les dépendances externes
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
          },
        },
      },
    },
    module: {
      rules: [
        // Traitement des fichiers JavaScript
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-syntax-dynamic-import',
              ],
            },
          },
        },
        // Traitement des fichiers CSS
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'autoprefixer',
                    'cssnano',
                  ],
                },
              },
            },
          ],
        },
        // Traitement des images
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
        },
        // Traitement des SVG
        {
          test: /\.svg$/,
          type: 'asset/inline',
        },
      ],
    },
    plugins: [
      // Nettoyer le dossier de sortie avant chaque build
      new CleanWebpackPlugin(),
      
      // Extraire le CSS dans des fichiers séparés
      new MiniCssExtractPlugin({
        filename: 'styles/[name].css',
        chunkFilename: 'styles/[name].chunk.css',
      }),
      
      // Copier les fichiers statiques
      new CopyPlugin({
        patterns: [
          { from: 'manifest.json', to: '' },
          { from: 'images', to: 'images' },
          { from: 'pages/*.html', to: 'pages/[name][ext]' },
          { from: 'popup/*.html', to: 'popup/[name][ext]' },
          { from: 'content-styles.css', to: '' },
        ],
      }),
    ],
    // Configuration pour les Web Workers
    experiments: {
      outputModule: true,
    },
    // Source maps pour le débogage
    devtool: isProduction ? false : 'source-map',
    // Mode de résolution des modules
    resolve: {
      extensions: ['.js'],
      alias: {
        '@': path.resolve(__dirname, './'),
        '@utils': path.resolve(__dirname, './utils'),
        '@ui': path.resolve(__dirname, './ui'),
        '@workers': path.resolve(__dirname, './workers'),
        '@pages': path.resolve(__dirname, './pages'),
        '@images': path.resolve(__dirname, './images'),
      },
    },
  };
};