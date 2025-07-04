/**
 * Configuration Jest pour les tests unitaires de l'extension LucidSelect
 */

module.exports = {
  // Environnement de test
  testEnvironment: 'jsdom',
  
  // Patterns de fichiers de test
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Ignorer certains répertoires
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Couverture de code
  collectCoverage: process.env.COVERAGE === 'true',
  collectCoverageFrom: [
    'utils/**/*.js',
    'ui/**/*.js',
    'workers/**/*.js',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  
  // Alias pour les imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@ui/(.*)$': '<rootDir>/ui/$1',
    '^@workers/(.*)$': '<rootDir>/workers/$1',
    '^@pages/(.*)$': '<rootDir>/pages/$1',
    '^@images/(.*)$': '<rootDir>/images/$1',
    // Gérer les imports de fichiers CSS/SVG dans les tests
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Transformations
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Setup de l'environnement de test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Timeout pour les tests
  testTimeout: 10000,
  
  // Verbose output
  verbose: true
};