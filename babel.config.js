module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '80',
          firefox: '72',
          edge: '80',
        },
        useBuiltIns: 'usage',
        corejs: '3.31',
        modules: false,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-class-properties',
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
    },
    production: {
      // Optimisations spécifiques à la production
    },
  },
};