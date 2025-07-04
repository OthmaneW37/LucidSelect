module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    'import',
    'prettier',
  ],
  rules: {
    // Règles de style et de formatage
    'prettier/prettier': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    
    // Règles pour éviter les erreurs courantes
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-use-before-define': ['error', { functions: false, classes: true }],
    'no-duplicate-imports': 'error',
    
    // Règles pour améliorer la maintenabilité
    'max-len': ['warn', { code: 120, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'complexity': ['warn', 15],
    'max-depth': ['warn', 4],
    'max-params': ['warn', 5],
    'max-nested-callbacks': ['warn', 4],
    
    // Règles pour les imports
    'import/order': ['warn', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc', caseInsensitive: true },
    }],
    'import/no-unresolved': 'off', // Désactivé car nous utilisons des alias webpack
    
    // Règles spécifiques aux extensions de navigateur
    'no-restricted-globals': ['error', 'event', 'fdescribe'],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js'],
      },
      alias: {
        map: [
          ['@', './'],
          ['@utils', './utils'],
          ['@ui', './ui'],
          ['@workers', './workers'],
          ['@pages', './pages'],
          ['@images', './images'],
        ],
        extensions: ['.js'],
      },
    },
  },
  overrides: [
    // Règles spécifiques pour les Web Workers
    {
      files: ['workers/*.js'],
      env: {
        worker: true,
        browser: false,
      },
      rules: {
        'no-restricted-globals': 'off',
      },
    },
    // Règles spécifiques pour les fichiers de test
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'max-len': 'off',
        'max-nested-callbacks': 'off',
      },
    },
  ],
};